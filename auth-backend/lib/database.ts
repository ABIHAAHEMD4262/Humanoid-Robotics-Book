import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Initialize Neon database connection
const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);

// Export the connection for use throughout the application
export { sql };