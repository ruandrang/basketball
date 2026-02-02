import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import TeamGenerator from '@/components/TeamGenerator';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClubGeneratePage({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    팀 구성
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    멤버를 선택하고 균형 잡힌 팀을 자동으로 생성합니다.
                </p>
            </div>

            <TeamGenerator clubId={club.id} allMembers={club.members} history={club.history} />
        </div>
    );
}
