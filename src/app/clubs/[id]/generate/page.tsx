import Link from 'next/link';
import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound, redirect } from 'next/navigation';
import { checkClubAccess } from '@/lib/auth';
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

    const hasAccess = await checkClubAccess(club.ownerId);
    if (!hasAccess) {
        redirect('/');
    }

    return (
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ← {club.name} 대시보드로
                </Link>
            </div>
            <TeamGenerator clubId={club.id} allMembers={club.members} history={club.history} />
        </main>
    );
}
