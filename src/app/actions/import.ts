'use server'

import { revalidatePath, updateTag } from 'next/cache';
import { execute } from '@/lib/db';
import { Position } from '@/lib/types';
import { getClubCached as getClub } from '@/lib/cached-storage';
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

export async function importMembers(clubId: string, csvData: string) {
    await checkAccess(clubId);
    const lines = csvData.trim().split('\n');
    // Expected headers: name,age,height,position,number

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',');

        // Basic validation
        if (values.length < 5) continue;

        const id = crypto.randomUUID();
        const name = values[0].trim();
        const age = parseInt(values[1].trim()) || 0;
        const height = parseInt(values[2].trim()) || 0;
        const rawPos = values[3].trim();
        const position: Position = ['PG', 'SG', 'SF', 'PF', 'C'].includes(rawPos) ? (rawPos as Position) : 'SF';
        const number = parseInt(values[4].trim()) || 0;

        await execute(
            `INSERT INTO members (id, club_id, name, age, height, position, number)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, clubId, name, age, height, position, number]
        );
    }

    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
