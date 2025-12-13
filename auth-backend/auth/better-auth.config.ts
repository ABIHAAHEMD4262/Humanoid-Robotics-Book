import { betterAuth } from "better-auth";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon to use ws WebSocket in Node.js
neonConfig.webSocketConstructor = ws;

// Initialize Neon database connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database: pool,
  user: {
    additionalFields: {
      softwareSkillLevel: {
        type: "string",
        required: false,
        defaultValue: "beginner"
      },
      hardwareType: {
        type: "string",
        required: false,
        defaultValue: "PC"
      },
      preferredLanguage: {
        type: "string",
        required: false,
        defaultValue: "English"
      },
      roboticsExperience: {
        type: "string",
        required: false,
        defaultValue: "none"
      }
    }
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://abihaahemd4262.github.io"
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
});
