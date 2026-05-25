import Database from 'better-sqlite3';
import { databaseService } from './DatabaseService';

export interface Sound {
  id: number;
  displayName: string;
  filename: string;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
}

class SoundService {
  private db: Database.Database;

  constructor() {
    this.db = databaseService.getDb();
  }

  add(displayName: string, filename: string, filePath: string, mimeType: string): Sound {
    const stmt = this.db.prepare(`
      INSERT INTO sounds (displayName, filename, filePath, mimeType, uploadedAt)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(displayName, filename, filePath, mimeType);
    return this.findById(result.lastInsertRowid as number)!;
  }

  findByName(displayName: string): Sound | null {
    const stmt = this.db.prepare('SELECT * FROM sounds WHERE displayName = ?');
    return (stmt.get(displayName) as Sound) ?? null;
  }

  findById(id: number): Sound | null {
    const stmt = this.db.prepare('SELECT * FROM sounds WHERE id = ?');
    return (stmt.get(id) as Sound) ?? null;
  }

  listAll(): Sound[] {
    return this.db.prepare('SELECT * FROM sounds ORDER BY displayName ASC').all() as Sound[];
  }

  exists(displayName: string): boolean {
    return this.findByName(displayName) !== null;
  }
}

export const soundService = new SoundService();
