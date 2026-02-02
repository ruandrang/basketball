'use server'

import { revalidatePath, updateTag } from 'next/cache';
import { getClubCached as getClub, addClub, updateClub, deleteClub as dbDeleteClub } from '@/lib/cached-storage';
import { getCurrentUser } from '@/lib/auth';

export async function createClub(formData: FormData) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    if (!name?.trim()) {
        throw new Error('클럽 이름을 입력해주세요.');
    }

    const newClub = {
        id: crypto.randomUUID(),
        name: name.trim(),
        ownerId: currentUser.id,
        members: [],
        history: []
    };

    await addClub(newClub);
    updateTag('clubs:list');
    revalidatePath('/');
}

export async function updateClubName(clubId: string, newName: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Unauthorized');
    }

    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    // Check access
    if (!currentUser.isAdmin && club.ownerId !== currentUser.id) {
        throw new Error('권한이 없습니다.');
    }

    club.name = newName;
    await updateClub(club);
    updateTag(`club:${clubId}`);
    updateTag('clubs:list');
    revalidatePath(`/clubs/${clubId}/dashboard`);
    revalidatePath('/');
}

export async function deleteClub(clubId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Unauthorized');
    }

    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    // Check access
    if (!currentUser.isAdmin && club.ownerId !== currentUser.id) {
        throw new Error('권한이 없습니다.');
    }

    await dbDeleteClub(clubId);
    updateTag(`club:${clubId}`);
    updateTag('clubs:list');
    revalidatePath('/');
    return { success: true };
}
