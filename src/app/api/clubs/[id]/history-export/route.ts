import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClubCached as getClub } from '@/lib/cached-storage';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (jar.get('bb_auth')?.value !== '1') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id: clubId } = await ctx.params;
  const club = await getClub(clubId);
  if (!club) {
    return NextResponse.json({ ok: false, error: 'Club not found' }, { status: 404 });
  }

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    club: { id: club.id, name: club.name },
    members: club.members.map((m) => ({
      name: m.name,
      number: m.number,
      position: m.position,
      height: m.height,
      age: m.age,
    })),
    history: club.history.map((r) => ({
      date: r.date,
      teams: r.teams.map((t) => ({
        name: t.name,
        color: t.color,
        members: t.members.map((m) => ({
          name: m.name,
          number: m.number,
          position: m.position,
        })),
      })),
      matches: (r.matches ?? []).map((m) => ({
        team1Name: r.teams.find((t) => t.id === m.team1Id)?.name ?? 'Team1',
        team2Name: r.teams.find((t) => t.id === m.team2Id)?.name ?? 'Team2',
        result: m.result ?? null,
      })),
    })),
  };

  const filename = `club-${club.id}-history.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}
