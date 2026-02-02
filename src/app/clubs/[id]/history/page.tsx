import { getClubCached as getClub } from '@/lib/cached-storage';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    경기 기록
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    이전 팀 구성과 경기 결과를 확인하세요.
                </p>
            </div>

            {club.history.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📭</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>기록이 없습니다</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--spacing-lg)' }}>
                        팀을 생성하면 여기에 기록됩니다.
                    </p>
                    <a href={`/clubs/${club.id}/generate`} className="btn btn-primary">
                        팀 생성하기
                    </a>
                </div>
            ) : (
                <HistoryList history={club.history} clubId={club.id} clubName={club.name} />
            )}
        </div>
    );
}
