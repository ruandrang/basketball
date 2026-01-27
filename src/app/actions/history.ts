'use server'

import { saveHistory, deleteHistory as dbDeleteHistory } from '@/lib/storage';
import { Team, HistoryRecord } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveTeamHistory(clubId: string, teams: Team[]) {
    const newRecord: HistoryRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        teams: teams,
    };

    await saveHistory(clubId, newRecord);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function deleteHistory(clubId: string, historyId: string) {
    await dbDeleteHistory(historyId);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
