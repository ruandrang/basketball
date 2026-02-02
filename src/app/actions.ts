'use server'

import { revalidatePath, updateTag } from 'next/cache';
import { addMember as dbAddMember, updateMember as dbUpdateMember, deleteMember as dbDeleteMember, updateMemberSortOrders, getClubCached as getClub } from '@/lib/cached-storage';
import { Member, Position } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

async function checkAccess(clubId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    if (!currentUser.isAdmin && club.ownerId !== currentUser.id) {
        throw new Error('권한이 없습니다.');
    }
}

export async function addMember(clubId: string, formData: FormData) {
    await checkAccess(clubId);
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

    await dbAddMember(clubId, newMember);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function updateMember(clubId: string, memberId: string, formData: FormData) {
    await checkAccess(clubId);
    const updatedMember: Member = {
        id: memberId,
        name: formData.get('name') as string,
        age: parseInt(formData.get('age') as string),
        height: parseInt(formData.get('height') as string),
        position: formData.get('position') as Position,
        number: parseInt(formData.get('number') as string),
    };

    await dbUpdateMember(updatedMember);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function deleteMember(clubId: string, memberId: string) {
    await checkAccess(clubId);
    await dbDeleteMember(memberId);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function reorderMembers(clubId: string, orderedMemberIds: string[]) {
    await checkAccess(clubId);
    await updateMemberSortOrders(clubId, orderedMemberIds);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
}
