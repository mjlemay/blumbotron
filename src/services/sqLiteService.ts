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

console.log('Initializing SQLite database...');

try {
  console.log('Attempting to load database:', dbName);
  sqlite = await Database.load(dbName);
  console.log('SQLite database loaded successfully');

  // Test the connection
  const testResult = await sqlite.execute('SELECT 1');
  console.log('Database connection test result:', testResult);
} catch (error) {
  const sqlError = error as SQLiteError;
  console.error('Error loading SQLite database:', {
    code: sqlError.code,
    message: sqlError.message,
    fullError: error,
  });
  throw error;
}

const db = drizzle<typeof schema>(
  async (sql, params, method) => {
    let rows: any = [];
    let results = [];

    console.log('Executing SQL:', sql);
    console.log('Parameters:', params);
    console.log('Method:', method);

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

      console.log('Query executed successfully');
      console.log('Raw results:', rows);
    } catch (error) {
      const sqlError = error as SQLiteError;
      console.error('SQL Error:', {
        code: sqlError.code,
        message: sqlError.message,
        query: sql,
        params: params,
        fullError: error,
      });
      throw error;
    }

    rows = rows.map((row: any) => {
      console.log('Processing row:', row);
      return Object.values(row);
    });

    // If the method is "all", return all rows
    results = method === 'all' ? rows : rows[0];
    console.log('Final results:', results);

    return { rows: results };
  },
  // Pass the schema to the drizzle instance
  { schema: schema, logger: true }
);

export { db };
