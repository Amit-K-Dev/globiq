const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'globiq.db');
const migrationsDir = path.join(__dirname, '..', 'lib', 'db', 'migrations');

function runMigrations(db) {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = db.prepare('SELECT name FROM migrations').all().map(m => m.name);
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  
  let appliedCount = 0;
  for (const file of files) {
    if (!applied.includes(file)) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute in a transaction
      const transaction = db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
      });
      
      try {
        transaction();
        appliedCount++;
      } catch (err) {
        console.error(`Error applying migration ${file}:`, err);
        throw err;
      }
    }
  }
  
  console.log(`Applied ${appliedCount} new migrations.`);
}

if (require.main === module) {
  const db = new Database(dbPath);
  try {
    runMigrations(db);
    db.close();
  } catch (err) {
    db.close();
    process.exit(1);
  }
}

module.exports = runMigrations;
