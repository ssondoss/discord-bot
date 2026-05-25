import Database from 'better-sqlite3';
import { databaseService } from './DatabaseService';

export interface StreamUrl {
  id: number;
  displayName: string;
  url: string;
  createdAt: string;
}

class StreamService {
  private db: Database.Database;

  constructor() {
    this.db = databaseService.getDb();
  }

  /**
   * Persist only the URL string — never the audio data itself.
   * Streamed audio is fetched live via ffmpeg on each /play-stream call
   * and is never written to disk.
   */
  add(displayName: string, url: string): StreamUrl {
    const stmt = this.db.prepare(`
      INSERT INTO stream_urls (displayName, url, createdAt)
      VALUES (?, ?, datetime('now'))
    `);
    const result = stmt.run(displayName, url);
    return this.findById(result.lastInsertRowid as number)!;
  }

  findByName(displayName: string): StreamUrl | null {
    const stmt = this.db.prepare('SELECT * FROM stream_urls WHERE displayName = ?');
    return (stmt.get(displayName) as StreamUrl) ?? null;
  }

  findById(id: number): StreamUrl | null {
    const stmt = this.db.prepare('SELECT * FROM stream_urls WHERE id = ?');
    return (stmt.get(id) as StreamUrl) ?? null;
  }

  listAll(): StreamUrl[] {
    return this.db
      .prepare('SELECT * FROM stream_urls ORDER BY displayName ASC')
      .all() as StreamUrl[];
  }

  exists(displayName: string): boolean {
    return this.findByName(displayName) !== null;
  }
}

export const streamService = new StreamService();
