import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'prospects.db');

let db = null;

/**
 * Obtiene la instancia de la base de datos (singleton).
 */
export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

/**
 * Inicializa las tablas si no existen.
 */
function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      lat REAL,
      lon REAL,
      tiene_website INTEGER DEFAULT 0,
      es_nuevo INTEGER DEFAULT 0,
      pocas_resenas INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      prioridad TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(nombre, direccion, lat, lon)
    );

    CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects(score DESC);
    CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at);
  `);
}

/**
 * Cierra la conexión a la base de datos.
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
