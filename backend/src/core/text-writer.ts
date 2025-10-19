import * as Y from "yjs";
import { CRDTConnector } from "./crdt-connector";

export type SlotResult = {
  ok: boolean;
  preview: string;
  crdtPosition: string;
};

export class TextWriter {
  static DEFAULT_TEXT_ID = "index";
  static SLOT_ATTR = "x-slot";
  static ANCHORS_MAP_ID = "x-writer-anchors";
  static TYPING_TEXT = "typing";

  protected doc: Y.Doc;
  protected anchors: Y.Map<Uint8Array>;
  protected text: Y.Text;
  private activeCrdtPositions: Set<string> = new Set();

  constructor(private connector: CRDTConnector, private writerId: string) {
    if (!this.connector.isSynced()) {
      console.warn(
        `[${writerId}] TextWriter created before sync complete (state: ${this.connector.getConnectionState()})`
      );
    }

    this.doc = this.connector.getDoc();
    this.anchors = this.doc.getMap(TextWriter.ANCHORS_MAP_ID);
    this.text = this.doc.getText(TextWriter.DEFAULT_TEXT_ID);
  }

  private setAnchor(crdtPosition: string, rel: Y.RelativePosition) {
    this.anchors.set(crdtPosition, Y.encodeRelativePosition(rel));
    this.activeCrdtPositions.add(crdtPosition);
  }

  private previewAtIndex(i: number): string {
    const s = this.text.toString();
    const before = s.slice(Math.max(0, i - 100), i);
    const after = s.slice(i, i + 100);

    return `${before}<CURSOR_POSITION>${after}`;
  }

  private openZeroLengthSlot(i: number) {
    // Create zero-length formatted range at index i
    this.text.format(i, 0, { [TextWriter.SLOT_ATTR]: this.writerId });
    this.text.format(i, 0, { [TextWriter.SLOT_ATTR]: null });

    // Inside positions
    const startRel = Y.createRelativePositionFromTypeIndex(this.text, i, 1); // just after start boundary
    const endRel = Y.createRelativePositionFromTypeIndex(this.text, i, -1); // just before end boundary

    return { startRel, endRel };
  }

  reserveSlotAtStart(newLine: boolean = false): SlotResult {
    let preview = "";
    let crdtPosition = "";

    this.doc.transact(() => {
      const { endRel } = this.openZeroLengthSlot(0);

      // Insert newline at the end of the slot using endRel when requested
      if (newLine) {
        const endAbs = Y.createAbsolutePositionFromRelativePosition(
          endRel,
          this.doc
        );

        if (endAbs && endAbs.type === this.text) {
          this.text.insert(endAbs.index, "\n"); // inserted inside the slot
        }
      }

      const absNow = Y.createAbsolutePositionFromRelativePosition(
        endRel,
        this.doc
      );

      if (absNow && absNow.type === this.text) {
        preview = this.previewAtIndex(absNow.index);
      }

      // Serialize CRDT position to base64 string
      const encoded = Y.encodeRelativePosition(endRel);
      crdtPosition = Buffer.from(encoded).toString("base64");

      // Anchor inside the slot just before the newline (or at slot end if no newline)
      this.setAnchor(crdtPosition, endRel);
    }, TextWriter.TYPING_TEXT);

    return { ok: true, preview, crdtPosition };
  }

  reserveSlotAtEnd(newLine: boolean = false): SlotResult {
    let preview = "";
    let crdtPosition = "";

    this.doc.transact(() => {
      const len = this.text.length;
      const { startRel, endRel } = this.openZeroLengthSlot(len);

      let anchorRel = endRel; // default to the interior end side

      if (newLine) {
        // Insert newline at the beginning of the slot using startRel
        const startAbs = Y.createAbsolutePositionFromRelativePosition(
          startRel,
          this.doc
        );

        if (startAbs && startAbs.type === this.text) {
          this.text.insert(startAbs.index, "\n"); // inserted inside the slot
          // Anchor just after the newline, still inside the slot
          anchorRel = Y.createRelativePositionFromTypeIndex(
            this.text,
            startAbs.index + 1,
            -1
          );
        }
      }

      const absNow = Y.createAbsolutePositionFromRelativePosition(
        anchorRel,
        this.doc
      );

      if (absNow && absNow.type === this.text) {
        preview = this.previewAtIndex(absNow.index);
      }

      // Serialize CRDT position to base64 string
      const encoded = Y.encodeRelativePosition(anchorRel);
      crdtPosition = Buffer.from(encoded).toString("base64");

      this.setAnchor(crdtPosition, anchorRel);
    }, TextWriter.TYPING_TEXT);

    return { ok: true, preview, crdtPosition };
  }

  reserveSlotWithLookup(
    needle: string,
    placement: "before" | "after" = "after",
    deleteText?: string,
    newLine: boolean = false
  ): SlotResult {
    if (!needle) return { ok: false, preview: "", crdtPosition: "" };

    let ok = false;
    let preview = "";
    let crdtPosition = "";

    this.doc.transact(() => {
      const haystack = this.text.toString();
      const pos = haystack.indexOf(needle);
      if (pos < 0) return;

      let insertIndex: number;

      if (deleteText) {
        if (placement === "before") {
          if (!needle.startsWith(deleteText)) return;
          this.text.delete(pos, deleteText.length);
          insertIndex = pos;
        } else {
          if (!needle.endsWith(deleteText)) return;
          const keep = needle.length - deleteText.length;
          this.text.delete(pos + keep, deleteText.length);
          insertIndex = pos + keep;
        }
      } else {
        insertIndex = placement === "before" ? pos : pos + needle.length;
      }

      const { startRel, endRel } = this.openZeroLengthSlot(insertIndex);

      let anchorRel: Y.RelativePosition;

      if (newLine) {
        if (placement === "before") {
          // Newline at end of the slot using endRel
          const endAbs = Y.createAbsolutePositionFromRelativePosition(
            endRel,
            this.doc
          );

          if (endAbs && endAbs.type === this.text) {
            this.text.insert(endAbs.index, "\n"); // inside
          }
          // Anchor just before the newline, inside
          anchorRel = endRel;
        } else {
          // placement === "after" - newline at beginning using startRel
          const startAbs = Y.createAbsolutePositionFromRelativePosition(
            startRel,
            this.doc
          );

          if (startAbs && startAbs.type === this.text) {
            this.text.insert(startAbs.index, "\n"); // inside
            // Anchor just after the newline, inside
            anchorRel = Y.createRelativePositionFromTypeIndex(
              this.text,
              startAbs.index + 1,
              -1
            );
          } else {
            // Fallback inside
            anchorRel = startRel;
          }
        }
      } else {
        // Always keep anchor inside the slot even without newline
        anchorRel = placement === "after" ? startRel : endRel;
      }

      const absNow = Y.createAbsolutePositionFromRelativePosition(
        anchorRel,
        this.doc
      );

      if (absNow && absNow.type === this.text) {
        preview = this.previewAtIndex(absNow.index);
        ok = true;
      }

      // Serialize CRDT position to base64 string
      const encoded = Y.encodeRelativePosition(anchorRel);
      crdtPosition = Buffer.from(encoded).toString("base64");

      this.setAnchor(crdtPosition, anchorRel);
    }, TextWriter.TYPING_TEXT);

    return { ok, preview, crdtPosition };
  }

  appendText(str: string, crdtPosition: string) {
    const encoded = this.anchors.get(crdtPosition) as Uint8Array;

    if (!encoded) {
      console.error(`Anchor not found: ${crdtPosition}`);
      return;
    }

    const rel = Y.decodeRelativePosition(encoded);
    let success = false;

    this.doc.transact(() => {
      const abs = Y.createAbsolutePositionFromRelativePosition(rel, this.doc);

      if (!abs || abs.type !== this.text) {
        return;
      }

      // Insert with slot attribute for clarity. It will also be inside the slot range.
      this.text.insert(abs.index, str, {
        [TextWriter.SLOT_ATTR]: this.writerId,
      });

      // Move anchor to new end, keep it inside
      const newEnd = abs.index + str.length;
      const newRel = Y.createRelativePositionFromTypeIndex(
        this.text,
        newEnd,
        -1
      );
      this.setAnchor(crdtPosition, newRel);
      success = true;
    }, TextWriter.TYPING_TEXT);

    return success;
  }

  clearSlots() {
    for (const crdtPosition of this.activeCrdtPositions) {
      this.anchors.delete(crdtPosition);
    }

    this.activeCrdtPositions.clear();
  }

  getText() {
    const text = this.doc.getText(TextWriter.DEFAULT_TEXT_ID);
    return { doc: this.doc, text };
  }

  clearText() {
    const { doc, text } = this.getText();

    doc.transact(() => {
      text.delete(0, text.length);
    }, TextWriter.TYPING_TEXT);
  }
}
