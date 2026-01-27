import { getClub } from '@/lib/storage';
import { notFound } from 'next/navigation';
import MemberManagement from '@/components/MemberManagement';
import CsvTools from '@/components/CsvTools';

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
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
                <a href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ← {club.name} 대시보드로
                </a>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <CsvTools clubId={club.id} members={club.members} />
            </div>

            <MemberManagement clubId={club.id} members={club.members} />
        </main>
    );
}
