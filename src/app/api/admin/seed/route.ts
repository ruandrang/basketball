import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { queryOne } from '@/lib/db';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

function getToken(req: Request): string | null {
  const url = new URL(req.url);
  const q = url.searchParams.get('token');
  if (q) return q;

  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export async function GET(req: Request) {
  const token = getToken(req);
  const expected = process.env.SEED_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'SEED_TOKEN is not configured on server' },
      { status: 500 }
    );
  }

  if (!token || token !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // one-time guard: if demo club already exists, do nothing
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM clubs WHERE name = 'Demo Basketball Club' LIMIT 1"
  );
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true, message: 'Already seeded' });
  }

  try {
    // Run schema + seed scripts. This avoids re-implementing SQL parsing here.
    // Note: seed-demo.mjs currently TRUNCATEs tables.
    await execFileAsync('node', ['scripts/ensure-schema.mjs'], {
      env: process.env,
      cwd: process.cwd(),
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    await execFileAsync('node', ['scripts/seed-demo.mjs'], {
      env: process.env,
      cwd: process.cwd(),
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    return NextResponse.json({ ok: true, seeded: true });
  } catch (e: any) {
    const msg = e?.stderr?.toString?.() || e?.message || String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
