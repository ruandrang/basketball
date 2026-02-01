import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('Missing DATABASE_URL environment variable');
        }
        // NOTE: On Vercel/serverless, keep pool size small to avoid exhausting
        // Supabase Postgres connections. Prefer using Supabase's pooled (PgBouncer) URL.
        pool = new Pool({
            connectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
