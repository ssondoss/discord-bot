import Database from 'better-sqlite3';
import path from 'path';
import {
  CREATE_MEMES_TABLE,
  CREATE_SOUNDS_TABLE,
  CREATE_STREAM_URLS_TABLE,
} from '../database/schema';

class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'bot.db');
    this.db = new Database(dbPath);
    // WAL mode gives much better concurrent read performance and is safe on all platforms.
    this.db.pragma('journal_mode = WAL');
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(CREATE_MEMES_TABLE);
    this.db.exec(CREATE_SOUNDS_TABLE);
    this.db.exec(CREATE_STREAM_URLS_TABLE);
    console.log('[DB] Tables initialized.');
  }

  getDb(): Database.Database {
    return this.db;
  }
}

// Singleton — one database connection for the lifetime of the process.
export const databaseService = new DatabaseService();
