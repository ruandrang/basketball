import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import MemberManagement from '@/components/MemberManagement';
import CsvTools from '@/components/CsvTools';
import HistoryJsonTools from '@/components/HistoryJsonTools';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClubMembersPage({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    멤버 관리
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    클럽 멤버를 추가, 수정, 삭제할 수 있습니다.
                </p>
            </div>

            <div className="card">
                <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-md)' }}>데이터 관리</h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <CsvTools clubId={club.id} members={club.members} />
                    <HistoryJsonTools clubId={club.id} />
                </div>
            </div>

            <MemberManagement clubId={club.id} members={club.members} history={club.history} />
        </div>
    );
}
