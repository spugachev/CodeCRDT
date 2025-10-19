type BlockCompleteCallback = (block: CodeBlock, incomplete?: boolean) => void;
type BlockChunkCallback = (chunk: string, crdtPosition: string) => void;

interface CodeOutputProcessorOptions {
  /** Optional callback called when a code block is completed (or flushed incomplete). Receives the block and a flag indicating if it was incomplete. */
  onBlockComplete?: BlockCompleteCallback;
  /** Optional callback called for each chunk of content with its crdtPosition. Called when tag has crdtPosition attribute or defaultCrdtPosition is set. */
  onBlockChunk?: BlockChunkCallback;
  /** Enable/disable logging to console. Defaults to false */
  enableLogging?: boolean;
  /** Maximum buffer size in bytes. Defaults to 1MB */
  maxBufferSize?: number;
  /** Maximum number of attributes per tag. Defaults to 50 */
  maxAttributes?: number;
  /** Maximum attribute value length. Defaults to 10KB */
  maxAttributeValueLength?: number;
  /** Default CRDT position to use when tag doesn't specify one */
  defaultCrdtPosition?: string;
}

export interface CodeBlock {
  content: string;
  attributes: Record<string, string>;
}

export class CodeOutputProcessor {
  // Constants
  private static readonly TAG_NAME = "xcrdt_code_output";
  private static readonly DEFAULT_MAX_BUFFER_SIZE = 1024 * 1024; // 1MB
  private static readonly DEFAULT_MAX_ATTRIBUTES = 50;
  private static readonly DEFAULT_MAX_ATTR_VALUE_LENGTH = 10 * 1024; // 10KB

  // State
  private buffer = "";
  private insideTag = false;
  private currentBlockContent = "";
  private currentBlockAttributes: Record<string, string> = {};
  private lastCharBuffer = "";
  private skipNextNewline = false;
  private lastCompletedBlock: CodeBlock | null = null;

  // Configuration
  private readonly maxBufferSize: number;
  private readonly maxAttributes: number;
  private readonly maxAttributeValueLength: number;
  private readonly enableLogging: boolean;
  private readonly blockCompleteCallback?: BlockCompleteCallback;
  private readonly blockChunkCallback?: BlockChunkCallback;
  private defaultCrdtPosition?: string;

  // Tag constants
  private readonly openingTagStart: string;
  private readonly openingTagRegex: RegExp;
  private readonly closingTag: string;

  constructor(options: CodeOutputProcessorOptions = {}) {
    this.enableLogging = options.enableLogging ?? false;
    this.blockCompleteCallback = options.onBlockComplete;
    this.blockChunkCallback = options.onBlockChunk;
    this.defaultCrdtPosition = options.defaultCrdtPosition;

    // Initialize size limits
    this.maxBufferSize =
      options.maxBufferSize ?? CodeOutputProcessor.DEFAULT_MAX_BUFFER_SIZE;
    this.maxAttributes =
      options.maxAttributes ?? CodeOutputProcessor.DEFAULT_MAX_ATTRIBUTES;
    this.maxAttributeValueLength =
      options.maxAttributeValueLength ??
      CodeOutputProcessor.DEFAULT_MAX_ATTR_VALUE_LENGTH;

    // Initialize tag constants
    this.openingTagStart = `<${CodeOutputProcessor.TAG_NAME}`;
    this.closingTag = `</${CodeOutputProcessor.TAG_NAME}>`;
    this.openingTagRegex = new RegExp(
      `<${CodeOutputProcessor.TAG_NAME}(?:\\s+([^>]*?))?>`
    );
  }

  /**
   * Processes a chunk of streaming text and extracts content from code_output tags.
   *
   * When content is extracted and onBlockChunk callback is provided, the callback will be invoked
   * with the crdtPosition from the tag's attribute, or the defaultCrdtPosition if no attribute exists.
   * If neither is available, the callback will not be invoked.
   *
   * @param text - The chunk of text to process
   * @returns Extracted code content (empty string if no content in this chunk)
   * @throws Error if buffer size exceeds maxBufferSize
   */
  processChunk(text?: string): string {
    if (text === null || typeof text === "undefined") {
      return "";
    }

    // Security: Enforce buffer size limit
    if (this.buffer.length + text.length > this.maxBufferSize) {
      throw new Error(
        `Buffer size exceeded maximum of ${this.maxBufferSize} bytes. ` +
          `Possible malformed input or missing closing tag.`
      );
    }

    this.buffer += text;
    let output = "";

    while (this.buffer.length > 0) {
      if (!this.insideTag) {
        const result = this.handleOutsideTag();
        output += result.output;

        if (result.shouldBreak) {
          break;
        }
      } else {
        const result = this.handleInsideTag();

        // Call chunk callback if we have output and crdtPosition
        if (result.output && this.blockChunkCallback && result.crdtPosition) {
          this.blockChunkCallback(result.output, result.crdtPosition);
        }

        output += result.output;

        if (result.shouldBreak) {
          break;
        }
      }
    }

    return output;
  }

  /**
   * Flushes any remaining buffered content.
   *
   * Called at the end of streaming to output any partial content.
   * If currently inside a tag, returns the remaining content (excluding trailing newline).
   * If outside a tag, discards the buffer (it's not valid code).
   *
   * When onBlockChunk callback is provided and content is flushed, the callback will be invoked
   * with the crdtPosition from the tag's attribute, or the defaultCrdtPosition if no attribute exists.
   *
   * Note: For incomplete blocks flushed this way, lastCompletedBlock will be updated
   * but the content will be marked as incomplete in logs.
   *
   * @returns Remaining content if inside tag, empty string otherwise
   */
  flush(): string {
    if (!this.insideTag) {
      this.resetState();
      return "";
    }

    const output = this.finalizeBlockContent(this.buffer);
    const logContent = this.removeTrailingNewline(this.currentBlockContent);

    // Call chunk callback for flushed content if we have crdtPosition
    if (output && this.blockChunkCallback) {
      const crdtPosition =
        this.currentBlockAttributes.crdtPosition || this.defaultCrdtPosition;
      if (crdtPosition) {
        this.blockChunkCallback(output, crdtPosition);
      }
    }

    // Save the flushed (incomplete) block
    this.lastCompletedBlock = {
      content: logContent,
      attributes: { ...this.currentBlockAttributes },
    };

    // Warn if missing both tag crdtPosition attribute and defaultCrdtPosition (regardless of logging setting)
    if (
      logContent &&
      !this.currentBlockAttributes.crdtPosition &&
      !this.defaultCrdtPosition
    ) {
      console.warn(
        "⚠️  LLM output <xcrdt_code_output> without crdtPosition attribute and no defaultCrdtPosition set (incomplete/flushed)"
      );

      console.warn(
        `   Content preview: ${logContent.substring(0, 100)}${
          logContent.length > 100 ? "..." : ""
        }`
      );
    }

    // Call the onBlockComplete callback for incomplete/flushed blocks
    if (this.blockCompleteCallback && logContent) {
      try {
        this.blockCompleteCallback(this.lastCompletedBlock, true);
      } catch (err) {
        console.error("Error in onBlockComplete callback during flush:", err);
      }
    }

    if (logContent && this.enableLogging) {
      console.log("Flushing incomplete code block:");
      if (Object.keys(this.currentBlockAttributes).length > 0) {
        console.log(
          `Attributes: ${JSON.stringify(this.currentBlockAttributes)}`
        );
      } else {
        console.log("WARNING: No attributes found on code block");
      }

      console.log(logContent);
    }

    this.resetState();
    return output;
  }

  /**
   * Handles processing when currently outside code_output tags.
   * Searches for opening tag or partial tag match.
   *
   * @returns Object with output and shouldBreak flag
   */
  private handleOutsideTag(): { output: string; shouldBreak: boolean } {
    const match = this.openingTagRegex.exec(this.buffer);

    if (!match) {
      // Check for partial match of opening tag
      const partialMatch = this.findPartialOpeningTag(this.buffer);

      if (partialMatch > 0) {
        this.buffer = this.buffer.substring(this.buffer.length - partialMatch);
      } else {
        this.buffer = "";
      }

      return { output: "", shouldBreak: true };
    }

    this.enterTagMode(match);
    return { output: "", shouldBreak: false };
  }

  /**
   * Handles processing when currently inside code_output tags.
   * Searches for closing tag and streams content.
   *
   * @returns Object with output string, shouldBreak flag, and crdtPosition for the output
   */
  private handleInsideTag(): {
    output: string;
    shouldBreak: boolean;
    crdtPosition?: string;
  } {
    this.handleLeadingNewline();

    const closePos = this.buffer.indexOf(this.closingTag);

    // Capture crdtPosition before any state changes
    const crdtPosition =
      this.currentBlockAttributes.crdtPosition || this.defaultCrdtPosition;

    if (closePos === -1) {
      return {
        output: this.streamContentWithoutClosingTag(),
        shouldBreak: true,
        crdtPosition,
      };
    }

    return {
      output: this.completeBlock(closePos),
      shouldBreak: false,
      crdtPosition,
    };
  }

  /**
   * Enters tag mode after finding opening tag.
   * Handles skipping leading newline and parsing attributes.
   */
  private enterTagMode(match: RegExpExecArray): void {
    const fullMatch = match[0];
    const attributesString = match[1] || "";
    const openPos = match.index;

    // Parse attributes from the opening tag
    this.currentBlockAttributes = this.parseAttributes(attributesString);

    this.buffer = this.buffer.substring(openPos + fullMatch.length);

    if (this.buffer.startsWith("\n")) {
      this.buffer = this.buffer.substring(1);
      this.skipNextNewline = false;
    } else if (this.buffer.length === 0) {
      this.skipNextNewline = true;
    } else {
      this.skipNextNewline = false;
    }

    this.insideTag = true;
    this.currentBlockContent = "";
    this.lastCharBuffer = "";
  }

  /**
   * Handles skipping leading newline if it arrives in a separate chunk.
   */
  private handleLeadingNewline(): void {
    if (this.skipNextNewline && this.buffer.startsWith("\n")) {
      this.buffer = this.buffer.substring(1);
      this.skipNextNewline = false;
    } else if (this.skipNextNewline && this.buffer.length > 0) {
      this.skipNextNewline = false;
    }
  }

  /**
   * Streams content when closing tag is not found.
   * Handles partial tag matching and last character buffering.
   *
   * @returns Streamed content
   */
  private streamContentWithoutClosingTag(): string {
    const partialMatch = this.findPartialMatch(this.buffer, this.closingTag);

    if (partialMatch > 0) {
      const contentBeforePartial = this.buffer.substring(
        0,
        this.buffer.length - partialMatch
      );

      this.buffer = this.buffer.substring(this.buffer.length - partialMatch);

      return this.streamContentWithLastCharBuffering(contentBeforePartial);
    }

    const output = this.streamContentWithLastCharBuffering(this.buffer);
    this.buffer = "";
    return output;
  }

  /**
   * Streams content while buffering the last character.
   * This allows us to remove trailing newlines later.
   *
   * @param content - Content to stream
   * @returns Streamed output (without last character, which is buffered)
   */
  private streamContentWithLastCharBuffering(content: string): string {
    if (!content) {
      return "";
    }

    let output = "";

    if (this.lastCharBuffer) {
      output += this.lastCharBuffer;
      this.currentBlockContent += this.lastCharBuffer;
    }

    const lastChar = content.charAt(content.length - 1);
    const toStream = content.substring(0, content.length - 1);

    if (toStream) {
      output += toStream;
      this.currentBlockContent += toStream;
    }

    this.lastCharBuffer = lastChar;
    return output;
  }

  /**
   * Completes a code block when closing tag is found.
   * Logs the complete block and resets tag state.
   *
   * @param closePos - Position of closing tag in buffer
   * @returns Final output for this block
   */
  private completeBlock(closePos: number): string {
    const blockContent = this.buffer.substring(0, closePos);
    const output = this.finalizeBlockContent(blockContent);

    const logContent = this.removeTrailingNewline(this.currentBlockContent);

    // Save the completed block
    this.lastCompletedBlock = {
      content: logContent,
      attributes: { ...this.currentBlockAttributes },
    };

    // Warn if missing both tag crdtPosition attribute and defaultCrdtPosition (regardless of logging setting)
    if (
      !this.currentBlockAttributes.crdtPosition &&
      !this.defaultCrdtPosition
    ) {
      console.warn(
        "⚠️  LLM output <xcrdt_code_output> without crdtPosition attribute and no defaultCrdtPosition set"
      );

      console.warn(
        `   Content preview: ${logContent.substring(0, 100)}${
          logContent.length > 100 ? "..." : ""
        }`
      );
    }

    // Call the onBlockComplete callback for completed blocks
    if (this.blockCompleteCallback) {
      try {
        this.blockCompleteCallback(this.lastCompletedBlock, false);
      } catch (err) {
        console.error("Error in onBlockComplete callback:", err);
        // Continue processing despite callback error
      }
    }

    if (this.enableLogging) {
      console.log("Complete code block extracted:");
      if (Object.keys(this.currentBlockAttributes).length > 0) {
        console.log(
          `Attributes: ${JSON.stringify(this.currentBlockAttributes)}`
        );
      } else {
        console.log("WARNING: No attributes found on code block");
      }

      console.log(logContent);
    }

    this.buffer = this.buffer.substring(closePos + this.closingTag.length);
    this.exitTagMode();

    return output;
  }

  /**
   * Finalizes block content by outputting buffered character and content with trailing newline removed.
   *
   * @param content - Content to finalize
   * @returns Finalized output string
   */
  private finalizeBlockContent(content: string): string {
    let output = "";

    if (this.lastCharBuffer && this.lastCharBuffer !== "\n") {
      output += this.lastCharBuffer;
      this.currentBlockContent += this.lastCharBuffer;
    }

    if (content) {
      const cleaned = this.removeTrailingNewline(content);
      output += cleaned;
      this.currentBlockContent += content;
    }

    return output;
  }

  /**
   * Exits tag mode and resets tag-specific state.
   */
  private exitTagMode(): void {
    this.insideTag = false;
    this.currentBlockContent = "";
    this.currentBlockAttributes = {};
    this.lastCharBuffer = "";
    this.skipNextNewline = false;
  }

  /**
   * Resets all state to initial values.
   */
  private resetState(): void {
    this.buffer = "";
    this.insideTag = false;
    this.currentBlockContent = "";
    this.currentBlockAttributes = {};
    this.lastCharBuffer = "";
    this.skipNextNewline = false;
  }

  /**
   * Removes trailing newline from content.
   * Used for both streaming output and log content cleanup.
   *
   * @param content - Content to process
   * @returns Content with trailing newline removed
   */
  private removeTrailingNewline(content: string): string {
    if (content === "\n") {
      return "";
    }

    if (content.endsWith("\n")) {
      return content.substring(0, content.length - 1);
    }

    return content;
  }

  /**
   * Parses attributes from an attribute string.
   * Handles both single and double quoted values with proper quote matching.
   * Enforces security limits on attribute count and value length.
   *
   * @param attributesString - String containing attributes (e.g., 'attr1="value1" attr2="value2"')
   * @returns Object mapping attribute names to values
   * @throws Error if attribute limits are exceeded
   */
  private parseAttributes(attributesString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    if (!attributesString || !attributesString.trim()) {
      return attributes;
    }

    // Parse double-quoted attributes: attr="value"
    const doubleQuoteRegex = /(\w+)="([^"]*)"/g;
    let match: RegExpExecArray | null;

    while ((match = doubleQuoteRegex.exec(attributesString)) !== null) {
      // Security: Enforce attribute count limit
      if (Object.keys(attributes).length >= this.maxAttributes) {
        throw new Error(
          `Attribute count exceeded maximum of ${this.maxAttributes}`
        );
      }

      const name = match[1];
      const value = match[2];

      // Security: Enforce attribute value length limit
      if (value.length > this.maxAttributeValueLength) {
        throw new Error(
          `Attribute '${name}' value length (${value.length}) exceeds maximum of ${this.maxAttributeValueLength}`
        );
      }

      attributes[name] = value;
    }

    // Parse single-quoted attributes: attr='value'
    const singleQuoteRegex = /(\w+)='([^']*)'/g;
    while ((match = singleQuoteRegex.exec(attributesString)) !== null) {
      // Security: Enforce attribute count limit
      if (Object.keys(attributes).length >= this.maxAttributes) {
        throw new Error(
          `Attribute count exceeded maximum of ${this.maxAttributes}`
        );
      }

      const name = match[1];
      const value = match[2];

      // Security: Enforce attribute value length limit
      if (value.length > this.maxAttributeValueLength) {
        throw new Error(
          `Attribute '${name}' value length (${value.length}) exceeds maximum of ${this.maxAttributeValueLength}`
        );
      }

      // Only add if not already present (double quotes take precedence)
      if (!(name in attributes)) {
        attributes[name] = value;
      }
    }

    return attributes;
  }

  /**
   * Finds partial match of opening tag at end of buffer.
   * Handles tags with attributes by looking for:
   * 1. Partial matches of opening tag name (incomplete tag name)
   * 2. Complete tag name followed by attributes but no closing ">"
   *
   * Optimized to use character-by-character comparison rather than substring creation.
   *
   * @param haystack - The string to search in
   * @returns Length of the partial match, or 0 if no match
   */
  private findPartialOpeningTag(haystack: string): number {
    // First, check if we have a complete tag start followed by attributes without closing ">"
    // Look for opening tag start anywhere near the end, possibly followed by attributes
    const tagStartIndex = haystack.lastIndexOf(this.openingTagStart);
    if (tagStartIndex !== -1) {
      const afterTagStart = haystack.substring(tagStartIndex);
      // If we found opening tag but no closing ">", keep everything from that point
      if (!afterTagStart.includes(">")) {
        return afterTagStart.length;
      }
    }

    // If no complete tag start found, check for partial matches of the tag name itself
    // Try matching from longest to shortest possible partial match
    // Optimized: Use character comparison instead of substring creation
    const maxLen = Math.min(haystack.length, this.openingTagStart.length);

    for (let len = maxLen; len > 0; len--) {
      let matches = true;
      for (let i = 0; i < len; i++) {
        if (
          haystack.charAt(haystack.length - len + i) !==
          this.openingTagStart.charAt(i)
        ) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return len;
      }
    }

    return 0;
  }

  /**
   * Detects partial tag matches at the end of a string.
   *
   * This prevents false negatives when tags are split across streaming chunks.
   * For example: if buffer ends with "</xcrdt_co" and needle is "</xcrdt_code_output>",
   * this returns 10, indicating we should keep those 10 characters for the next chunk.
   *
   * Optimized to use character-by-character comparison rather than substring creation.
   *
   * @param haystack - The string to search in
   * @param needle - The tag to match against
   * @returns Length of the partial match, or 0 if no match
   */
  private findPartialMatch(
    haystack: Readonly<string>,
    needle: Readonly<string>
  ): number {
    // Try matching from longest to shortest possible partial match
    // Optimized: Use character comparison instead of substring creation
    const maxLen = Math.min(haystack.length, needle.length - 1);

    for (let len = maxLen; len > 0; len--) {
      let matches = true;
      for (let i = 0; i < len; i++) {
        if (haystack.charAt(haystack.length - len + i) !== needle.charAt(i)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return len;
      }
    }

    return 0;
  }

  /**
   * Gets the current attributes of the code block being processed.
   *
   * Returns a copy of the current block's attributes from the opening tag.
   * This does NOT include the defaultCrdtPosition - only attributes explicitly
   * present in the tag itself.
   *
   * @returns Copy of current block attributes, or empty object if not inside a tag
   */
  public getCurrentAttributes(): Record<string, string> {
    return { ...this.currentBlockAttributes };
  }

  /**
   * Gets the last completed code block with its attributes.
   *
   * Returns a copy of the last completed (or flushed) block with its content and attributes.
   * The attributes returned are only those explicitly present in the tag itself,
   * NOT including the defaultCrdtPosition.
   *
   * @returns Copy of last completed block, or null if no blocks have been completed yet
   */
  public getLastCompletedBlock(): CodeBlock | null {
    return this.lastCompletedBlock ? { ...this.lastCompletedBlock } : null;
  }

  /**
   * Sets the default CRDT position to use when tag doesn't specify one.
   * This is useful when the position is not known at construction time.
   *
   * @param position - The default CRDT position (must be a non-empty string)
   * @throws Error if position is empty or invalid
   */
  public setDefaultCrdtPosition(position: string): void {
    if (!position || position.trim().length === 0) {
      throw new Error("defaultCrdtPosition must be a non-empty string");
    }

    this.defaultCrdtPosition = position;
  }
}
