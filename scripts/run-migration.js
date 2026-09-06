const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-filename>');
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'migrations', migrationFile), 'utf8');
const url = process.env.DATABASE_URL || 'postgresql://postgres.nnmoiqupracpyrsyxqxf:c%2B%3Frx%2FfFnQbZn4P@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function main() {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.query(statements[i] + ';');
      console.log(`Statement ${i + 1} OK`);
    } catch (err) {
      console.error(`Statement ${i + 1} error:`, err.message);
    }
  }
  await client.end();
  console.log('Migration complete');
}
main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
