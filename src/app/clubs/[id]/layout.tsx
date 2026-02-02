import { notFound, redirect } from 'next/navigation';
import { getClubCached as getClub } from '@/lib/cached-storage';
import { checkClubAccess, getCurrentUser } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout';

interface ClubLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
    const { id } = await params;
    const club = await getClub(id);

    if (!club) {
        notFound();
    }

    const hasAccess = await checkClubAccess(club.ownerId);
    if (!hasAccess) {
        redirect('/');
    }

    const user = await getCurrentUser();

    return (
        <DashboardLayout
            clubId={club.id}
            clubName={club.name}
            username={user?.username}
        >
            {children}
        </DashboardLayout>
    );
}
