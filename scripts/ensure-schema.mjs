import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Pool } = pg;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[ensure-schema] Missing DATABASE_URL');
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), 'scripts', 'init-db.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');

  const cs = connectionString.toLowerCase();
  const useSsl =
    process.env.PGSSL === 'true' ||
    process.env.PGSSLMODE === 'require' ||
    cs.includes('sslmode=require') ||
    cs.includes('.supabase.co') ||
    cs.includes('.supabase.com');

  let normalizedConnectionString = connectionString;
  try {
    const u = new URL(connectionString);
    u.searchParams.delete('sslmode');
    normalizedConnectionString = u.toString();
  } catch {
    // ignore
  }

  const pool = new Pool({
    connectionString: normalizedConnectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  const client = await pool.connect();
  try {
    console.log('[ensure-schema] applying schema:', sqlPath);
    await client.query(sql);
    console.log('[ensure-schema] done');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[ensure-schema] failed:', err);
  process.exit(1);
});
