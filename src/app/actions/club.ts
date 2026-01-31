'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getClub, getClubs, saveClubs, updateClub, deleteClub as dbDeleteClub } from '@/lib/storage';

export async function createClub(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name?.trim()) {
        throw new Error('클럽 이름을 입력해주세요.');
    }

    const clubs = await getClubs();

    const newClub = {
        id: crypto.randomUUID(),
        name: name.trim(),
        members: [],
        history: []
    };

    clubs.push(newClub);
    await saveClubs(clubs);
    revalidatePath('/');
}

export async function updateClubName(clubId: string, newName: string) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    club.name = newName;
    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/dashboard`);
    revalidatePath('/');
}

export async function deleteClub(clubId: string) {
    await dbDeleteClub(clubId);
    revalidatePath('/');
    redirect('/');
}
