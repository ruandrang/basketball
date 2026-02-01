import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { withTransaction } from '@/lib/db';
import type { Position, TeamColor } from '@/lib/types';

export const runtime = 'nodejs';

type ImportMember = { name: string; number: number; position?: Position };

type ImportTeam = {
  name: string;
  color: TeamColor;
  members: ImportMember[];
};

type ImportMatch = {
  team1Name: string;
  team2Name: string;
  result: 'Team1Win' | 'Team2Win' | 'Draw' | null;
};

type ImportRecord = {
  date: string;
  teams: ImportTeam[];
  matches: ImportMatch[];
};

type ImportPayloadV1 = {
  version: 1;
  exportedAt: string;
  club: { id?: string; name?: string };
  members?: Array<{ name: string; number: number; position?: Position; height?: number; age?: number }>;
  history: ImportRecord[];
};

function normalizeName(s: string) {
  return (s ?? '').trim();
}

function sig(m: { name: string; number: number }) {
  return `${normalizeName(m.name)}#${m.number}`;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (jar.get('bb_auth')?.value !== '1') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id: clubId } = await ctx.params;

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'file is required' }, { status: 400 });
  }

  let payload: ImportPayloadV1;
  try {
    const text = await file.text();
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON file' }, { status: 400 });
  }

  if (!payload || payload.version !== 1 || !Array.isArray(payload.history)) {
    return NextResponse.json({ ok: false, error: 'Unsupported payload format' }, { status: 400 });
  }

  // Build a lookup of existing members in target club
  const existingMembers = await withTransaction(async (client) => {
    const rows = await client.query('SELECT id, name, number FROM members WHERE club_id = $1', [clubId]);
    const map = new Map<string, string>();
    for (const r of rows.rows) {
      map.set(sig({ name: r.name, number: Number(r.number) }), r.id);
    }
    return map;
  });

  // Guest counter state (persisted only in this import run)
  let guestCounter = 1;

  // We'll allocate sort_order values without opening new connections.
  // Compute starting point once.
  const nextSortOrderStart = await withTransaction(async (client) => {
    const row = await client.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM members WHERE club_id = $1', [clubId]);
    return Number(row.rows?.[0]?.next ?? 1);
  });
  let nextSortOrder = nextSortOrderStart;

  const resolveMemberId = async (client: any, m: ImportMember): Promise<{ memberId: string; createdGuest: boolean }> => {
    const key = sig(m);
    const found = existingMembers.get(key);
    if (found) return { memberId: found, createdGuest: false };

    // Member not found in DB: create GuestN member
    const id = crypto.randomUUID();
    const guestName = `Guest${guestCounter++}`;

    await client.query(
      'INSERT INTO members (id, club_id, name, age, height, position, number, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, clubId, guestName, 0, 0, m.position ?? 'SF', 0, nextSortOrder++]
    );

    existingMembers.set(key, id);
    return { memberId: id, createdGuest: true };
  };

  const summary = {
    insertedRecords: 0,
    insertedTeams: 0,
    insertedTeamMembers: 0,
    insertedMatches: 0,
    createdGuests: 0,
  };

  try {
    await withTransaction(async (client) => {
      for (const rec of payload.history) {
        const historyId = crypto.randomUUID();
        await client.query('INSERT INTO history_records (id, club_id, date) VALUES ($1,$2,$3)', [historyId, clubId, rec.date]);
        summary.insertedRecords++;

        const teamIdByName = new Map<string, string>();

        for (let i = 0; i < rec.teams.length; i++) {
          const t = rec.teams[i];
          const teamId = crypto.randomUUID();
          teamIdByName.set(t.name, teamId);

          await client.query(
            'INSERT INTO teams (id, history_id, name, color, average_height, team_order) VALUES ($1,$2,$3,$4,$5,$6)',
            [teamId, historyId, t.name, t.color, 0, i]
          );
          summary.insertedTeams++;

          for (const mm of t.members) {
            const resolved = await resolveMemberId(client, mm);
            if (resolved.createdGuest) summary.createdGuests++;
            await client.query('INSERT INTO team_members (team_id, member_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [teamId, resolved.memberId]);
            summary.insertedTeamMembers++;
          }
        }

        // matches
        for (const m of rec.matches ?? []) {
          const t1 = teamIdByName.get(m.team1Name);
          const t2 = teamIdByName.get(m.team2Name);
          if (!t1 || !t2) continue;
          const matchId = crypto.randomUUID();
          await client.query(
            'INSERT INTO matches (id, history_id, team1_id, team2_id, result) VALUES ($1,$2,$3,$4,$5)',
            [matchId, historyId, t1, t2, m.result]
          );
          summary.insertedMatches++;
        }
      }
    });

    return NextResponse.json({ ok: true, summary });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
