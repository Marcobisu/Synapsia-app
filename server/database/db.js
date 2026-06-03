import pg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const isPostgres = !!process.env.POSTGRES_URL;

let db = null;
let pool = null;

if (isPostgres) {
    console.log('Using Vercel Postgres Database.');
    pool = new pg.Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.log('Using Local SQLite Database.');
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default;
    
    const DB_DIR = path.join(process.cwd(), 'server', 'database');
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const DB_PATH = path.join(DB_DIR, 'synapsia.db');
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to SQLite database:', err.message);
        } else {
            console.log('Connected to the SQLite database at:', DB_PATH);
        }
    });
}

// Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2, ...)
function convertPlaceholders(sql) {
    if (!isPostgres) return sql;
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

// Helper to run query returning Promise
export const runQuery = (sql, params = []) => {
    const formattedSql = convertPlaceholders(sql);
    if (isPostgres) {
        return pool.query(formattedSql, params)
            .then(res => ({ id: null, changes: res.rowCount }))
            .catch(err => {
                console.error(`Postgres Run Error: ${formattedSql}`, err);
                throw err;
            });
    } else {
        return new Promise((resolve, reject) => {
            db.run(formattedSql, params, function (err) {
                if (err) {
                    console.error(`SQLite Run Error: ${formattedSql}`, err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }
};

// Helper to get single row
export const getRow = (sql, params = []) => {
    const formattedSql = convertPlaceholders(sql);
    if (isPostgres) {
        return pool.query(formattedSql, params)
            .then(res => res.rows[0] || null)
            .catch(err => {
                console.error(`Postgres Get Error: ${formattedSql}`, err);
                throw err;
            });
    } else {
        return new Promise((resolve, reject) => {
            db.get(formattedSql, params, (err, row) => {
                if (err) {
                    console.error(`SQLite Get Error: ${formattedSql}`, err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
};

// Helper to get all rows
export const getAllRows = (sql, params = []) => {
    const formattedSql = convertPlaceholders(sql);
    if (isPostgres) {
        return pool.query(formattedSql, params)
            .then(res => res.rows)
            .catch(err => {
                console.error(`Postgres All Error: ${formattedSql}`, err);
                throw err;
            });
    } else {
        return new Promise((resolve, reject) => {
            db.all(formattedSql, params, (err, rows) => {
                if (err) {
                    console.error(`SQLite All Error: ${formattedSql}`, err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
};

// Database schema initialization
export const initDb = async () => {
    if (isPostgres) {
        // Users Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                mascot_color TEXT DEFAULT '#48cae4',
                badges_unlocked TEXT DEFAULT '[]',
                created_at TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
            )
        `);

        // Projects Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
            )
        `);

        // Nodes Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                label TEXT NOT NULL,
                macro_topic TEXT NOT NULL,
                type TEXT NOT NULL,
                abstraction_level INTEGER NOT NULL,
                description TEXT,
                is_completed INTEGER DEFAULT 0,
                PRIMARY KEY (id, project_id)
            )
        `);

        // Edges Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS edges (
                id TEXT,
                project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
                from_node TEXT NOT NULL,
                to_node TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                is_completed INTEGER DEFAULT 0,
                PRIMARY KEY (id, project_id)
            )
        `);

        // Answers Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS answers (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                element_id TEXT NOT NULL,
                element_type TEXT NOT NULL,
                original_answer TEXT,
                revised_answer TEXT,
                evaluation TEXT,
                attempts INTEGER DEFAULT 0,
                updated_at TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
            )
        `);

        // Active Questions Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS active_questions (
                project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
                question_json TEXT
            )
        `);
    } else {
        // Enable Foreign Keys in SQLite
        await runQuery('PRAGMA foreign_keys = ON');

        // 1. Users Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                mascot_color TEXT DEFAULT '#48cae4',
                badges_unlocked TEXT DEFAULT '[]',
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        `);

        // 2. Projects Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                user_id TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 3. Nodes Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT,
                project_id TEXT,
                label TEXT NOT NULL,
                macro_topic TEXT NOT NULL,
                type TEXT NOT NULL,
                abstraction_level INTEGER NOT NULL,
                description TEXT,
                is_completed INTEGER DEFAULT 0,
                PRIMARY KEY (id, project_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // 4. Edges Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS edges (
                id TEXT,
                project_id TEXT,
                from_node TEXT NOT NULL,
                to_node TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                is_completed INTEGER DEFAULT 0,
                PRIMARY KEY (id, project_id),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // 5. Answers Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS answers (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                element_id TEXT NOT NULL,
                element_type TEXT NOT NULL,
                original_answer TEXT,
                revised_answer TEXT,
                evaluation TEXT,
                attempts INTEGER DEFAULT 0,
                updated_at TEXT DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // 6. Active Questions Table (holding activeQuestion JSON per project)
        await runQuery(`
            CREATE TABLE IF NOT EXISTS active_questions (
                project_id TEXT PRIMARY KEY,
                question_json TEXT,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);
    }

    console.log('Database tables initialized successfully!');
};

export default db;
