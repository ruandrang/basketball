import process from 'node:process';
import pg from 'pg';

const { Pool } = pg;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL');

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
  });

  const id = crypto.randomUUID();
  const name = `Smoke Club ${new Date().toISOString()}`;

  const client = await pool.connect();
  try {
    await client.query('INSERT INTO clubs (id, name) VALUES ($1, $2)', [id, name]);
    const { rows } = await client.query('SELECT id, name FROM clubs WHERE id=$1', [id]);
    console.log('inserted:', rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
