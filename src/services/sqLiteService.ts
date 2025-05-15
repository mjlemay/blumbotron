import Database from '@tauri-apps/plugin-sql';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../lib/dbSchema.ts';

function isSelectQuery(sql: string): boolean {
    const selectRegex = /^\s*SELECT\b/i;
    return selectRegex.test(sql);
}

const dbName = 'sqlite:blumbo.db';

const sqlite =  await Database.load(dbName);
const db = drizzle<typeof schema>(
    async (sql, params, method) => {
        let rows: any = [];
        let results = [];
    
        // If the query is a SELECT, use the select method
        if (isSelectQuery(sql)) {
          rows = await sqlite.select(sql, params).catch((e) => {
            console.error("SQL Error:", e);
            return [];
          });
        } else {
          // Otherwise, use the execute method
          rows = await sqlite.execute(sql, params).catch((e) => {
            console.error("SQL Error:", e);
            return [];
          });
          return { rows: [] };
        }
    
        rows = rows.map((row: any) => {
          return Object.values(row);
        });
    
        // If the method is "all", return all rows
        results = method === "all" ? rows : rows[0];
    
        return { rows: results };
      },
      // Pass the schema to the drizzle instance
      { schema: schema, logger: true }
);

export { db }