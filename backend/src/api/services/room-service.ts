import Database from "better-sqlite3";
import * as Y from "yjs";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { TextWriter } from "../../core";

export interface RoomTextResponse {
  roomId: string;
  text: string;
  timestamp: Date;
}

class RoomService {
  private crdtDb: Database.Database | null = null;
  private readonly sqlitePath: string;

  constructor() {
    this.sqlitePath = resolve(process.cwd(), "./data/crdt.sqlite");
  }

  private ensureDatabase(): boolean {
    // If database is already open, return true
    if (this.crdtDb !== null) {
      return true;
    }

    // Check if database file exists
    if (!existsSync(this.sqlitePath)) {
      return false;
    }

    // Open database in readonly mode
    try {
      this.crdtDb = new Database(this.sqlitePath, {
        readonly: true,
        fileMustExist: true,
        timeout: 5000  // Wait up to 5 seconds if database is locked
      });
      return true;
    } catch (error) {
      console.error("Failed to open CRDT database:", error);
      return false;
    }
  }

  async getRoomText(roomId: string): Promise<RoomTextResponse> {
    try {
      // Ensure database is available
      if (!this.ensureDatabase()) {
        console.warn(`CRDT database not available for room ${roomId}`);
        return {
          roomId,
          text: "",
          timestamp: new Date(),
        };
      }

      // Query the CRDT database directly
      const stmt = this.crdtDb!.prepare(
        "SELECT data FROM documents WHERE name = ?"
      );
      const row = stmt.get(roomId) as { data: Buffer } | undefined;

      if (!row || !row.data) {
        return {
          roomId,
          text: "",
          timestamp: new Date(),
        };
      }

      // Decode the Y.js document from the stored blob
      const doc = new Y.Doc();
      Y.applyUpdate(doc, new Uint8Array(row.data));

      // Get the text from the document
      const text = doc.getText(TextWriter.DEFAULT_TEXT_ID);
      const currentText = text.toString();

      // Clean up the temporary doc
      doc.destroy();

      return {
        roomId,
        text: currentText,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to get room text for ${roomId}:`, error);
      throw new Error(
        `Failed to retrieve room text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  close() {
    if (this.crdtDb !== null) {
      this.crdtDb.close();
      this.crdtDb = null;
    }
  }
}

export const roomService = new RoomService();
