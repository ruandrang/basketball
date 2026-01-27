import { getClub } from '@/lib/storage';
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
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
                <a href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ← {club.name} 대시보드로
                </a>
            </div>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '2rem' }}>통계</h1>
            <StatsDisplay members={club.members} history={club.history} />
        </main>
    );
}
