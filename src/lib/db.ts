import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

function shouldUseSsl(connectionString: string): boolean {
    // Supabase (direct or pooler) requires SSL in most cases.
    // Local dev URLs typically should NOT use SSL.
    const cs = connectionString.toLowerCase();

    // Explicit override
    if (process.env.PGSSL === 'false' || process.env.PGSSLMODE === 'disable') return false;
    if (process.env.PGSSL === 'true' || process.env.PGSSLMODE === 'require') return true;

    // If URL explicitly requires/disabled SSL
    if (cs.includes('sslmode=require')) return true;
    if (cs.includes('sslmode=disable')) return false;

    // Heuristic: Supabase hosts should use SSL; localhost should not.
    const isLocal = cs.includes('localhost') || cs.includes('127.0.0.1') || cs.includes('0.0.0.0');
    const looksSupabase = cs.includes('.supabase.co') || cs.includes('.supabase.com');

    if (looksSupabase) return true;
    if (isLocal) return false;

    // Default: safe for most managed Postgres providers
    return true;
}

function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('Missing DATABASE_URL environment variable');
        }

        const useSsl = shouldUseSsl(connectionString);

        // IMPORTANT: node-postgres parses sslmode from the connection string and may set
        // rejectUnauthorized=true. We manage SSL via the explicit `ssl` option instead,
        // so we strip sslmode from the URL to avoid conflicts.
        let normalizedConnectionString = connectionString;
        try {
            const u = new URL(connectionString);
            u.searchParams.delete('sslmode');
            normalizedConnectionString = u.toString();
        } catch {
            // ignore; keep as-is
        }

        // NOTE: On Vercel/serverless, keep pool size small to avoid exhausting
        // Supabase Postgres connections. Prefer using Supabase's pooled (PgBouncer) URL.
        pool = new Pool({
            connectionString: normalizedConnectionString,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            max: Number(process.env.PGPOOL_MAX ?? 1),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }
    return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result.rows as T[];
    } finally {
        client.release();
    }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows[0] || null;
}

export async function execute(text: string, params?: any[]): Promise<number> {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result.rowCount || 0;
    } finally {
        client.release();
    }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}
