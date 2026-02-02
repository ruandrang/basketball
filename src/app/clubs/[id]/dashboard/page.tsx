import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import ClubDashboardClient from '@/components/ClubDashboardClient';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClubDashboard({ params }: PageProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    return (
        <ClubDashboardClient
            clubId={club.id}
            clubName={club.name}
            clubIcon={club.icon}
            memberCount={club.members.length}
            history={club.history}
        />
    );
}
