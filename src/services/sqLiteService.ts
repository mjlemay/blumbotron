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

    // Create tables if they don't exist
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS games (
            gameId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            meta TEXT,
            roster INTEGER,
            created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
            updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
        );
    `;
    
    console.log('Creating tables if they don\'t exist...');
    await sqlite.execute(createTableSQL);
    console.log('Tables created successfully');

    // Test the connection
    const testResult = await sqlite.execute('SELECT 1');
    console.log('Database connection test result:', testResult);
} catch (error) {
    const sqlError = error as SQLiteError;
    console.error('Error loading SQLite database:', {
        code: sqlError.code,
        message: sqlError.message,
        fullError: error
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
                // Otherwise, use the execute method
                rows = await sqlite.execute(sql, params);
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
                fullError: error
            });
            return { rows: [] };
        }
    
        rows = rows.map((row: any) => {
            console.log('Processing row:', row);
            return Object.values(row);
        });
    
        // If the method is "all", return all rows
        results = method === "all" ? rows : rows[0];
        console.log('Final results:', results);
    
        return { rows: results };
    },
    // Pass the schema to the drizzle instance
    { schema: schema, logger: true }
);

export { db }