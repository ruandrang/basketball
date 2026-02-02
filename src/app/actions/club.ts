'use server'

import { revalidatePath, updateTag } from 'next/cache';
import { getClubCached as getClub, addClub, updateClub, deleteClub as dbDeleteClub } from '@/lib/cached-storage';

export async function createClub(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name?.trim()) {
        throw new Error('클럽 이름을 입력해주세요.');
    }

    const newClub = {
        id: crypto.randomUUID(),
        name: name.trim(),
        members: [],
        history: []
    };

    await addClub(newClub);
    updateTag('clubs:list');
    revalidatePath('/');
}

export async function updateClubName(clubId: string, newName: string) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    club.name = newName;
    await updateClub(club);
    updateTag(`club:${clubId}`);
    updateTag('clubs:list');
    revalidatePath(`/clubs/${clubId}/dashboard`);
    revalidatePath('/');
}

export async function deleteClub(clubId: string) {
    await dbDeleteClub(clubId);
    updateTag(`club:${clubId}`);
    updateTag('clubs:list');
    revalidatePath('/');
    return { success: true };
}
