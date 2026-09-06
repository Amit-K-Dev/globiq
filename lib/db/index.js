import Database from "better-sqlite3";
import path from "path";

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), "globiq.db");
    const isProd = process.env.NODE_ENV === "production";
    
    // Open as readonly in production to prevent write attempts on Vercel's read-only FS
    dbInstance = new Database(dbPath, { readonly: isProd });
    
    // Only use WAL mode locally since it creates -wal and -shm files
    if (!isProd) {
      dbInstance.pragma("journal_mode = WAL");
    }
  }
  return dbInstance;
}
