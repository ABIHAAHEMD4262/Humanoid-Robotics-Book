// Environment variables are loaded via --env-file flag in package.json
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function migrate() {
  console.log('Starting database migration...');

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Read the SQL file
    const sqlContent = readFileSync(join(__dirname, 'create-tables.sql'), 'utf-8');

    // Split SQL statements (remove comments and split by semicolon)
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql(statement);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('Database tables created:');
    console.log('  - user');
    console.log('  - session');
    console.log('  - account');
    console.log('  - verification');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
