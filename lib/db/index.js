import Database from "better-sqlite3";
import path from "path";

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), "globiq.db");
    dbInstance = new Database(dbPath);
    // Use WAL mode for better read performance
    dbInstance.pragma("journal_mode = WAL");
  }
  return dbInstance;
}
