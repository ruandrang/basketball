'use server'

import { revalidatePath } from 'next/cache';
import { addMember as dbAddMember, updateMember as dbUpdateMember, deleteMember as dbDeleteMember } from '@/lib/storage';
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
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function deleteMember(clubId: string, memberId: string) {
    await dbDeleteMember(memberId);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
