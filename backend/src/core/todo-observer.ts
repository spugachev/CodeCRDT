import * as Y from "yjs";
import { CRDTConnector } from "./crdt-connector";
import { TextWriter } from "./text-writer";
import { InferenceTask } from "../api/types/inference";
import { Utils } from "../utils/utils";
import { Queue, QueueError } from "./queue";

export interface ToDoEvent {
  key: string;
  overallMatch: string;
  commentOnly: string;
  name: string;
  description?: string;
  startRel: Y.RelativePosition;
}

export type ToDoEventHandler = (
  task: InferenceTask,
  event: ToDoEvent
) => Promise<void>;

const WINDOW_SIZE = 4096;
const MAX_SEEN_SIZE = 10000;

export class ToDoObserver {
  /**
   * Matches both:
   *   /&#42; TODO:MyTask something here &#42;/
   *   {/&#42; TODO:MyTask something here &#42;/}
   *
   * Uses alternation to ensure braces are properly paired.
   * Captures:
   *   comment: the block comment
   *   name: MyTask
   *   description: "something here" (optional, can span lines)
   *
   * Name allows letters, digits, underscore, dot, and hyphen.
   */
  private static readonly TODO_RE =
    /(?:\{\s*(?<comment>\/\*\s*TODO:(?<name>[A-Za-z0-9._-]+)(?:\s+(?<description>[\s\S]*?))?\*\/)\s*\})|(?<comment2>\/\*\s*TODO:(?<name2>[A-Za-z0-9._-]+)(?:\s+(?<description2>[\s\S]*?))?\*\/)/gmu;

  protected queue: Queue<void> = new Queue<void>();
  protected seen: Set<string> = new Set();
  protected text?: Y.Text;
  protected onTextChange?: (event: Y.YTextEvent) => void;
  protected todoCount: number = 0;
  private isObserving: boolean = false;

  constructor(
    protected connector: CRDTConnector,
    private task: InferenceTask
  ) {}

  observe(handler: ToDoEventHandler) {
    if (this.isObserving) {
      throw new Error(
        "Already observing. Call waitForAllAndStop() before observing again."
      );
    }

    try {
      this.isObserving = true;

      const doc = this.connector.getDoc();
      this.text = doc.getText(TextWriter.DEFAULT_TEXT_ID);

      if (!this.text) {
        throw new Error("Failed to get text from CRDT document");
      }

      const initial = this.text.toString();
      this.scanAndRecord(handler, initial, 0);

      this.onTextChange = (event: Y.YTextEvent) => {
        const docStr: string = this.text?.toString() ?? "";

        let index = 0;
        for (const op of event.delta) {
          if (op.retain) {
            index += op.retain;
          } else if (op.insert) {
            const inserted = String(op.insert);
            const start = index;
            const end = start + inserted.length;

            // Context window to catch matches spanning the insertion boundary
            const windowStart = Math.max(0, start - WINDOW_SIZE);
            const windowEnd = Math.min(docStr.length, end + WINDOW_SIZE);

            const slice = docStr.slice(windowStart, windowEnd);
            this.scanAndRecord(handler, slice, windowStart);

            index = end;
          } else if (op.delete) {
            // Deletions do not create new TODOs
            // Index stays at current position because deleted text is not in the new document
            // (no index adjustment needed)
          }
        }
      };

      this.text.observe(this.onTextChange);
    } catch (error) {
      // Cleanup on error
      this.isObserving = false;
      this.text = undefined;
      this.onTextChange = undefined;
      throw error;
    }
  }

  async waitForAllAndStop(): Promise<QueueError[]> {
    if (this.text && this.onTextChange) {
      this.text.unobserve(this.onTextChange);
    }

    const errors = await this.queue.waitForAll();

    this.onTextChange = undefined;
    this.text = undefined;
    this.isObserving = false;

    return errors;
  }

  private scanAndRecord(
    handler: ToDoEventHandler,
    slice: string,
    offset: number
  ): void {
    // Validate that text is initialized
    if (!this.text) {
      console.error("scanAndRecord called without initialized text");
      return;
    }

    if (offset < 0) {
      throw new Error("Offset must be non-negative");
    }

    // Create fresh regex instance to avoid state corruption
    const re = new RegExp(
      ToDoObserver.TODO_RE.source,
      ToDoObserver.TODO_RE.flags
    );

    let m: RegExpExecArray | null;
    while ((m = re.exec(slice)) !== null) {
      const overallMatch = m[0];
      const matchStart = m.index;

      // Determine which pattern matched
      const isJSXPattern = m.groups?.comment !== undefined;
      const isStandalonePattern = m.groups?.comment2 !== undefined;

      // If standalone pattern matched, check if it's preceded by an unclosed {
      // This means the user is still typing a JSX comment like: {/* TODO:Task */
      // We should skip this match and wait for the complete JSX pattern: {/* TODO:Task */}
      if (isStandalonePattern) {
        // Look backward from match start to check for unclosed {
        const textBeforeMatch = slice.substring(0, matchStart);
        // Check if there's a { followed by whitespace right before our match
        // Match: optional whitespace, then {, then optional whitespace, ending at our position
        const precedingBraceMatch = /\{\s*$/.test(textBeforeMatch);

        if (precedingBraceMatch) {
          // Skip this match - it's an incomplete JSX comment
          // We'll detect it again when the user types the closing }
          continue;
        }
      }

      // Check which alternative matched (JSX with braces or standalone)
      const commentOnly =
        m.groups?.comment ?? m.groups?.comment2 ?? overallMatch;
      const name = (m.groups?.name ?? m.groups?.name2 ?? "").trim();

      // Validate name
      if (!name) {
        console.warn("Found TODO without name, skipping");
        continue;
      }

      let description: string | undefined = (
        m.groups?.description ??
        m.groups?.description2 ??
        ""
      ).trim();
      description = description.length > 0 ? description : undefined;

      // Use the position of the overall match (including JSX braces) as the unique key.
      // We skip incomplete matches (e.g., standalone pattern when preceded by unclosed {),
      // so we only detect complete TODOs: /* TODO */ or {/* TODO */}
      const overallMatchStartAbs = offset + m.index;
      const overallMatchStartRel = Y.createRelativePositionFromTypeIndex(
        this.text,
        overallMatchStartAbs
      );
      const key = Utils.encodeRelPos(overallMatchStartRel);

      // Check if we've already seen this TODO
      if (this.seen.has(key)) {
        continue;
      }

      // Also compute the position of the comment itself for the event
      const relInOverall = overallMatch.indexOf(commentOnly);
      const commentStartAbs =
        offset + m.index + (relInOverall >= 0 ? relInOverall : 0);
      const commentStartRel = Y.createRelativePositionFromTypeIndex(
        this.text,
        commentStartAbs
      );

      // Add to seen set with size limit
      this.addToSeen(key);
      this.todoCount++;

      const event: ToDoEvent = {
        key,
        overallMatch,
        commentOnly,
        description,
        name,
        startRel: commentStartRel,
      };

      this.queue.enqueue(async () => {
        try {
          await handler(this.task, event);
        } catch (error) {
          console.error(`Error handling TODO ${event.name}:`, error);
          throw error;
        }
      });
    }
  }

  private addToSeen(key: string): void {
    // If at capacity, remove oldest entry
    if (this.seen.size >= MAX_SEEN_SIZE) {
      const firstKey = this.seen.values().next().value;
      if (firstKey) {
        this.seen.delete(firstKey);
      }
    }
    this.seen.add(key);
  }

  getTodoCount(): number {
    return this.todoCount;
  }

  async waitForTodoStabilization(
    checkIntervalMs: number = 100,
    stabilizationWindowMs: number = 500,
    maxWaitMs: number = 5000
  ): Promise<void> {
    const startTime = Date.now();
    let lastCount = this.todoCount;
    let lastChangeTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      await Utils.sleep(checkIntervalMs);

      if (this.todoCount !== lastCount) {
        lastCount = this.todoCount;
        lastChangeTime = Date.now();
      }

      if (Date.now() - lastChangeTime >= stabilizationWindowMs) {
        return;
      }
    }

    console.warn(
      `TODO detection did not stabilize within ${maxWaitMs}ms. Detected ${this.todoCount} TODOs.`
    );
  }
}
