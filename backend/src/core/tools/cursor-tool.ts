import { Tool } from "../../ai-clients";
import { TextWriter } from "../text-writer";

interface CursorToolInput {
  searchText?: string;
  placement?: "before" | "after";
  deleteText?: string;
  moveToStart?: boolean;
  moveToEnd?: boolean;
  newLine: boolean;
}

export const CURSOR_TOOL: Tool<CursorToolInput> = {
  name: "cursor",
  description: `Moves the text cursor to a specific position in the document for inserting code via <xcrdt_code_output> tags.

# Return Format
Returns JSON: {"success": true, "crdtPosition": "BASE64", "preview": "..."}
- crdtPosition: Base64-encoded position string REQUIRED for <xcrdt_code_output crdtPosition="..."> tag
- preview: Shows context around the cursor position
- success: Boolean indicating if operation succeeded

# Navigation Modes
Use EITHER moveToStart/moveToEnd OR searchText+placement, not both.

1. Document boundaries: moveToStart=true or moveToEnd=true
2. Text search: searchText + placement ("before" or "after")

# Parameters
- searchText: EXACT text to find (include ALL characters, whitespace, indentation)
- placement: "before" or "after" - where to place cursor relative to searchText
- deleteText: Text to remove (must be PREFIX if placement="before", SUFFIX if placement="after")
- newLine: Boolean - insert newline after positioning

# TODO Replacement Pattern
For JSX TODOs: {/* TODO:Name Description */}
For TypeScript: /* TODO:Name Description */

CORRECT TODO replacement:
✓ searchText: "      {/* TODO:EmailForm Add email input */}"  // Include exact indentation
✓ deleteText: "{/* TODO:EmailForm Add email input */}"       // Full syntax with braces
✓ placement: "after"

INCORRECT (will fail):
✗ deleteText: "/* TODO:EmailForm Add email input */}"        // Missing opening {
✗ searchText: "{/* TODO:EmailForm */}"                        // Doesn't match actual TODO text

# Common Usage Examples

1. Add imports after existing import:
   cursor({searchText: "import { useState } from 'react';", placement: "after", newLine: true})

2. Add code before component:
   cursor({searchText: "export default function Page()", placement: "before", newLine: true})

3. Replace TODO with implementation:
   cursor({searchText: "      {/* TODO:Form ... */}", placement: "after", deleteText: "{/* TODO:Form ... */}", newLine: false})

4. Add to document start:
   cursor({moveToStart: true, newLine: true})

5. Add to document end:
   cursor({moveToEnd: true, newLine: true})

# Critical Rules
- ALWAYS call cursor before EVERY <xcrdt_code_output> tag
- NEVER make up crdtPosition values
- Extract crdtPosition from cursor response and use in <xcrdt_code_output crdtPosition="VALUE">
- Include full {/* */} syntax when deleting JSX TODOs`,
  parameters: {
    type: "object",
    properties: {
      moveToStart: {
        type: "boolean",
        description:
          "Move cursor to the very beginning of the document. Set to true to use this mode. Cannot be used with searchText, placement, or moveToEnd. Example: moveToStart=true positions cursor before the first character in the document.",
      },
      moveToEnd: {
        type: "boolean",
        description:
          "Move cursor to the very end of the document. Set to true to use this mode. Cannot be used with searchText, placement, or moveToStart. Example: moveToEnd=true positions cursor after the last character in the document.",
      },
      searchText: {
        type: "string",
        description:
          "The exact text to search for in the document (case-sensitive). The cursor will move relative to the FIRST occurrence of this text. Required unless using moveToStart or moveToEnd. This is the text that will be found and optionally partially deleted. Examples: 'function getData()' to find a specific function, 'Name: John Smith' to find a full label with value. Be precise with whitespace and punctuation.",
      },
      placement: {
        type: "string",
        enum: ["before", "after"],
        description:
          "Where to position the cursor relative to searchText. Required when searchText is provided. Use 'before' to place cursor at the beginning of searchText. Use 'after' to place cursor at the end of searchText. This determines which part of searchText can be deleted: 'before' allows deleting a prefix (from the beginning), 'after' allows deleting a suffix (from the end). Ignored when using moveToStart or moveToEnd.",
      },
      deleteText: {
        type: "string",
        description:
          "Optional. Only valid when searchText is provided. Must be an EXACT substring of searchText. When placement='before': deleteText must be a PREFIX of searchText (deletes from the beginning). When placement='after': deleteText must be a SUFFIX of searchText (deletes from the end). Example: searchText='Name: John Smith' with placement='before' and deleteText='Name: ' will delete 'Name: ' leaving 'John Smith'. Leave undefined for positioning-only operations.",
      },
      newLine: {
        type: "boolean",
        description:
          "If true, after moving the cursor, also insert a new line at that position. This is useful for creating space before typing new content.",
      },
    },
    required: ["newLine"],
  },
  handler: async (input, context) => {
    const textWriter = context?.textWriter as TextWriter | undefined;
    if (!textWriter) {
      return JSON.stringify({
        success: false,
        error: "TextWriter not found in context",
      });
    }

    if (input.moveToStart) {
      const result = textWriter.reserveSlotAtStart(input.newLine ?? false);
      if (!result.ok) {
        return JSON.stringify({
          success: false,
          error: "Unable to reserve slot at start",
        });
      }

      return JSON.stringify({
        success: true,
        preview: result.preview,
        crdtPosition: result.crdtPosition,
        message: "Cursor positioned at start",
      });
    } else if (input.moveToEnd) {
      const result = textWriter.reserveSlotAtEnd(input.newLine ?? false);

      if (!result.ok) {
        return JSON.stringify({
          success: false,
          error: "Unable to reserve slot at end",
        });
      }

      return JSON.stringify({
        success: true,
        preview: result.preview,
        crdtPosition: result.crdtPosition,
        message: "Cursor positioned at end",
      });
    } else if (input.searchText && input.placement) {
      const result = textWriter.reserveSlotWithLookup(
        input.searchText,
        input.placement,
        input.deleteText,
        input.newLine ?? false
      );

      if (!result.ok) {
        return JSON.stringify({
          success: false,
          error: `Text '${input.searchText}' not found in document`,
        });
      }

      return JSON.stringify({
        success: true,
        preview: result.preview,
        crdtPosition: result.crdtPosition,
        message: "Cursor positioned successfully",
      });
    }

    return JSON.stringify({
      success: false,
      error:
        "Invalid parameters. Use either moveToStart, moveToEnd, or searchText with placement",
    });
  },
};
