import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "blumbo.db"
  },
  schema: "./src/lib/dbSchema.ts",
  out: "./drizzle"
})
