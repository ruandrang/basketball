import Link from 'next/link';
import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import MemberDetailClient from '@/components/MemberDetailClient';
import { computeParticipationForMembers, computeWinStatsForMembers } from '@/lib/member-stats';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string; memberId: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id: clubId, memberId } = await params;
  const club = await getClub(clubId);
  if (!club) notFound();

  const member = club.members.find((m) => m.id === memberId);
  if (!member) notFound();

  const winMap = computeWinStatsForMembers(club.history);
  const partMap = computeParticipationForMembers(club.history);

  const win = winMap[memberId] ?? { games: 0, wins: 0, draws: 0, losses: 0, winRate: 0 };
  const part = partMap[memberId] ?? { eventsTotal: club.history.length, eventsPlayed: 0, participationRate: 0 };

  // Filter history where member participated
  const history = club.history.filter((r) => r.teams.some((t) => t.members.some((m) => m.id === memberId)));

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/clubs/${club.id}/members`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          ← 멤버 목록으로
        </Link>
      </div>

      <MemberDetailClient clubId={club.id} clubName={club.name} member={member} win={win} participation={part} history={history} />
    </main>
  );
}
