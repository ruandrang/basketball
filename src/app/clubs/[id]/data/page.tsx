import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import CsvTools from '@/components/CsvTools';
import HistoryJsonTools from '@/components/HistoryJsonTools';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DataManagementPage({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    데이터 관리
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    멤버 및 경기 기록 데이터를 가져오거나 내보낼 수 있습니다.
                </p>
            </div>

            <div className="card">
                <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-md)' }}>멤버 데이터 (CSV)</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-md)' }}>
                    멤버 목록을 CSV 파일로 내보내거나, CSV 파일에서 멤버를 가져올 수 있습니다.
                </p>
                <CsvTools clubId={club.id} members={club.members} />
            </div>

            <div className="card">
                <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-md)' }}>경기 기록 데이터 (JSON)</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-md)' }}>
                    경기 기록을 JSON 파일로 내보내거나 가져올 수 있습니다.
                </p>
                <HistoryJsonTools clubId={club.id} />
            </div>
        </div>
    );
}
