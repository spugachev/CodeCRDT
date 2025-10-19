import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { PaginatedResult, RoomMessage, RoomSummary } from "../types/data";
import { AgentName } from "../types/inference";

class DatabaseService {
  private db: Database.Database;

  constructor(databasePath: string) {
    const dir = dirname(databasePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(databasePath);
    this.initDatabase();
  }

  private initDatabase() {
    const createRoomsTable = `
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT NOT NULL,
        prompt TEXT NOT NULL,
        agentName TEXT,
        timestamp INTEGER NOT NULL
      )
    `;

    const createRoomIdIndex = `
      CREATE INDEX IF NOT EXISTS idx_rooms_roomId ON rooms(roomId)
    `;

    const createTimestampIndex = `
      CREATE INDEX IF NOT EXISTS idx_rooms_timestamp ON rooms(timestamp)
    `;

    const createCompositeIndex = `
      CREATE INDEX IF NOT EXISTS idx_rooms_roomId_timestamp ON rooms(roomId, timestamp)
    `;

    this.db.exec(createRoomsTable);
    this.db.exec(createRoomIdIndex);
    this.db.exec(createTimestampIndex);
    this.db.exec(createCompositeIndex);

    console.log("Database initialized with rooms table");
  }

  addRoomMessage(roomId: string, prompt: string, agentName?: AgentName): RoomMessage {
    const timestamp = Date.now();
    const stmt = this.db.prepare(
      "INSERT INTO rooms (roomId, prompt, agentName, timestamp) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(roomId, prompt, agentName || null, timestamp);

    return {
      id: result.lastInsertRowid as number,
      roomId,
      prompt,
      agentName,
      timestamp,
    };
  }

  getRoomMessages(
    roomId: string,
    page: number = 1,
    pageSize: number = 50
  ): PaginatedResult<RoomMessage> {
    const offset = (page - 1) * pageSize;

    const countStmt = this.db.prepare(
      "SELECT COUNT(*) as total FROM rooms WHERE roomId = ?"
    );
    const { total } = countStmt.get(roomId) as { total: number };

    const stmt = this.db.prepare(
      "SELECT id, roomId, prompt, agentName, timestamp FROM rooms WHERE roomId = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?"
    );
    const items = stmt.all(roomId, pageSize, offset) as RoomMessage[];

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  getAllMessages(
    page: number = 1,
    pageSize: number = 50
  ): PaginatedResult<RoomMessage> {
    const offset = (page - 1) * pageSize;

    const countStmt = this.db.prepare("SELECT COUNT(*) as total FROM rooms");
    const { total } = countStmt.get() as { total: number };

    const stmt = this.db.prepare(
      "SELECT id, roomId, prompt, agentName, timestamp FROM rooms ORDER BY timestamp ASC LIMIT ? OFFSET ?"
    );
    const items = stmt.all(pageSize, offset) as RoomMessage[];

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  getDistinctRooms(
    page: number = 1,
    pageSize: number = 20
  ): PaginatedResult<RoomSummary> {
    const offset = (page - 1) * pageSize;

    const countStmt = this.db.prepare(
      "SELECT COUNT(DISTINCT roomId) as total FROM rooms"
    );
    const { total } = countStmt.get() as { total: number };

    const stmt = this.db.prepare(`
      SELECT 
        r1.roomId,
        SUBSTR(r1.prompt, 1, 100) as firstMessage,
        r1.timestamp as firstMessageTimestamp,
        (SELECT COUNT(*) FROM rooms r2 WHERE r2.roomId = r1.roomId) as messageCount
      FROM rooms r1
      WHERE r1.timestamp = (
        SELECT MIN(timestamp) 
        FROM rooms r3 
        WHERE r3.roomId = r1.roomId
      )
      ORDER BY r1.timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const items = stmt.all(pageSize, offset) as RoomSummary[];

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  getMessagesByTimeRange(startTime: number, endTime: number): RoomMessage[] {
    const stmt = this.db.prepare(
      "SELECT id, roomId, prompt, agentName, timestamp FROM rooms WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC"
    );
    return stmt.all(startTime, endTime) as RoomMessage[];
  }

  close() {
    this.db.close();
  }
}

const sqlitePath = resolve(process.cwd(), "./data/data.sqlite");
export const databaseService = new DatabaseService(sqlitePath);
