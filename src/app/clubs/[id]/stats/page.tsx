import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import StatsDisplay from '@/components/StatsDisplay';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClubStatsPage({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    통계
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    선수별 경기 기록과 승률을 확인하세요.
                </p>
            </div>

            <StatsDisplay members={club.members} history={club.history} />
        </div>
    );
}
