'use server'

import { getClub, updateClub } from '@/lib/storage';
import { Team, HistoryRecord } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveTeamHistory(clubId: string, teams: Team[]) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    const newRecord: HistoryRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        teams: teams,
    };

    // Add to beginning
    club.history.unshift(newRecord);
    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/history`);
}

export async function deleteHistory(clubId: string, historyId: string) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    club.history = club.history.filter(h => h.id !== historyId);

    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/history`);
}
