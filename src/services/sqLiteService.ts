import Database from '@tauri-apps/plugin-sql';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../lib/dbSchema.ts';

function isSelectQuery(sql: string): boolean {
  const selectRegex = /^\s*SELECT\b/i;
  return selectRegex.test(sql);
}

interface SQLiteError extends Error {
  code?: string | number;
  message: string;
}

const dbName = 'sqlite:blumbo.db';

let sqlite: any = null;
let dbInitialized = false;

const initializeDatabase = async () => {
  if (dbInitialized) return sqlite;
  
  try {
    if (import.meta.env.DEV) {
      console.log('Attempting to load database:', dbName);
    }
    sqlite = await Database.load(dbName);
    dbInitialized = true
    return sqlite;
  } catch (error) {
    const sqlError = error as SQLiteError;
    if (import.meta.env.DEV) {
      console.error('Error loading SQLite database:', {
        code: sqlError.code,
        message: sqlError.message,
      });
    } else {
      console.error('Failed to load database');
    }
    throw error;
  }
};

// Initialize on module load
initializeDatabase().catch(err => {
  if (import.meta.env.DEV) {
    console.error('Failed to initialize database on module load:', err);
  }
});

const db = drizzle<typeof schema>(
  async (sql, params, method) => {
    // Ensure database is initialized before any query
    if (!dbInitialized) {
      await initializeDatabase();
    }
    
    let rows: any = [];
    let results = [];

    try {
      // If the query is a SELECT, use the select method
      if (isSelectQuery(sql)) {
        rows = await sqlite.select(sql, params);
      } else {
        // For non-SELECT queries, use execute and return the last inserted ID
        const result = await sqlite.execute(sql, params);
        if (result && result.lastInsertId) {
          return { rows: [{ id: result.lastInsertId }] };
        }
        return { rows: [] };
      }
    } catch (error) {
      const sqlError = error as SQLiteError;
      // Only log detailed SQL info in development to prevent exposing database structure
      if (import.meta.env.DEV) {
        console.error('SQL Error:', {
          code: sqlError.code,
          message: sqlError.message,
          query: sql,
          params: params,
        });
      } else {
        console.error('Database error:', sqlError.message);
      }
      throw error;
    }

    rows = rows.map((row: any) => {
      return Object.values(row);
    });

    // If the method is "all", return all rows
    results = method === 'all' ? rows : rows[0];

    return { rows: results };
  },
  // Pass the schema to the drizzle instance
  { schema: schema, logger: true }
);

export { db, initializeDatabase };
