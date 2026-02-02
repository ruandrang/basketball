import { getClubCached as getClub } from '@/lib/cached-storage';
import { notFound } from 'next/navigation';
import MemberManagement from '@/components/MemberManagement';

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
        <MemberManagement clubId={club.id} members={club.members} history={club.history} />
    );
}
