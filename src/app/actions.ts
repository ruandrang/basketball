'use server'

import { revalidatePath } from 'next/cache';
import { getClub, updateClub, getClubs } from '@/lib/storage';
import { Member, Position } from '@/lib/types';

export async function addMember(clubId: string, formData: FormData) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    const height = parseInt(formData.get('height') as string);
    const position = formData.get('position') as Position;

    const newMember: Member = {
        id: crypto.randomUUID(),
        name: formData.get('name') as string,
        age: parseInt(formData.get('age') as string),
        height: height,
        position: position,
        number: parseInt(formData.get('number') as string),
    };

    club.members.push(newMember);
    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/members`);
}

export async function updateMember(clubId: string, memberId: string, formData: FormData) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    const index = club.members.findIndex(m => m.id === memberId);

    if (index !== -1) {
        club.members[index] = {
            ...club.members[index],
            name: formData.get('name') as string,
            age: parseInt(formData.get('age') as string),
            height: parseInt(formData.get('height') as string),
            position: formData.get('position') as Position,
            number: parseInt(formData.get('number') as string),
        };
        await updateClub(club);
        revalidatePath(`/clubs/${clubId}/members`);
    }
}

export async function deleteMember(clubId: string, memberId: string) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    club.members = club.members.filter(m => m.id !== memberId);
    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/members`);
}
