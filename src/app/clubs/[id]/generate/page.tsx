import Link from 'next/link';
import { getAttendanceMap, getClub } from '@/lib/storage';
import { notFound } from 'next/navigation';
import TeamGenerator from '@/components/TeamGenerator';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ event?: string }>;
}

export default async function ClubGeneratePage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const sp = (await searchParams) ?? {};
    const eventId = sp.event;

    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    let initialSelectedIds: string[] | undefined;
    if (eventId) {
        const map = await getAttendanceMap(eventId);
        initialSelectedIds = club.members.filter(m => map[m.id] === 'attend').map(m => m.id);
    }

    // default team count: 2 (5:5). If many attendees (>= 15), suggest 3.
    const initialTeamCount: 2 | 3 = (initialSelectedIds?.length ?? 0) >= 15 ? 3 : 2;

    return (
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ← {club.name} 대시보드로
                </Link>
            </div>
            <TeamGenerator clubId={club.id} allMembers={club.members} history={club.history} initialSelectedIds={initialSelectedIds} initialTeamCount={initialTeamCount} />
        </main>
    );
}
