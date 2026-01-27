'use server'

import { revalidatePath } from 'next/cache';
import { getClub, updateClub } from '@/lib/storage';
import { Member, Position } from '@/lib/types';

export async function importMembers(clubId: string, csvData: string) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    // Expected headers: name,age,height,position,number

    const newMembers: Member[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',');

        // Basic validation
        if (values.length < 5) continue;

        newMembers.push({
            id: crypto.randomUUID(),
            name: values[0].trim(),
            age: parseInt(values[1].trim()) || 0,
            height: parseInt(values[2].trim()) || 0,
            position: (values[3].trim() as Position) || 'Forward',
            number: parseInt(values[4].trim()) || 0,
        });
    }

    club.members.push(...newMembers);
    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/members`);
}
