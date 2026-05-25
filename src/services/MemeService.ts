import Database from 'better-sqlite3';
import { databaseService } from './DatabaseService';

export interface Meme {
  id: number;
  displayName: string;
  filename: string;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
}

class MemeService {
  private db: Database.Database;

  constructor() {
    this.db = databaseService.getDb();
  }

  /**
   * Insert a new meme row.
   * The UNIQUE constraint on displayName means SQLite will throw if the name
   * is already taken — we always call exists() first to give a friendly message.
   */
  add(displayName: string, filename: string, filePath: string, mimeType: string): Meme {
    const stmt = this.db.prepare(`
      INSERT INTO memes (displayName, filename, filePath, mimeType, uploadedAt)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(displayName, filename, filePath, mimeType);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Look up a meme by its display name.
   * Returns null when not found so callers can send "not found" replies cleanly.
   */
  findByName(displayName: string): Meme | null {
    const stmt = this.db.prepare('SELECT * FROM memes WHERE displayName = ?');
    return (stmt.get(displayName) as Meme) ?? null;
  }

  findById(id: number): Meme | null {
    const stmt = this.db.prepare('SELECT * FROM memes WHERE id = ?');
    return (stmt.get(id) as Meme) ?? null;
  }

  listAll(): Meme[] {
    return this.db.prepare('SELECT * FROM memes ORDER BY displayName ASC').all() as Meme[];
  }

  exists(displayName: string): boolean {
    return this.findByName(displayName) !== null;
  }
}

export const memeService = new MemeService();
