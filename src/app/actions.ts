'use server'

import { revalidatePath, updateTag } from 'next/cache';
import { addMember as dbAddMember, updateMember as dbUpdateMember, deleteMember as dbDeleteMember, updateMemberSortOrders } from '@/lib/cached-storage';
import { Member, Position } from '@/lib/types';

export async function addMember(clubId: string, formData: FormData) {
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
    await dbDeleteMember(memberId);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function reorderMembers(clubId: string, orderedMemberIds: string[]) {
    await updateMemberSortOrders(clubId, orderedMemberIds);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
}
