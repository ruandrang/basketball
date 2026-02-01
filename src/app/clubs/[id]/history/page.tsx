import Link from 'next/link';
import { getClub } from '@/lib/storage';
import { notFound } from 'next/navigation';
import HistoryList from '@/components/HistoryList';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClubHistoryPage({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ← {club.name} 대시보드로
                </Link>
            </div>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '2rem' }}>경기 기록</h1>
            <HistoryList history={club.history} clubId={club.id} clubName={club.name} />
        </main>
    );
}
