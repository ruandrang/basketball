'use server'

import { saveHistory, deleteHistory as dbDeleteHistory } from '@/lib/storage';
import { Team, HistoryRecord } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveTeamHistory(clubId: string, teams: Team[]) {
    const recordId = crypto.randomUUID();
    const newRecord: HistoryRecord = {
        id: recordId,
        date: new Date().toISOString(),
        teams: teams,
        matches: [
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[1].id },
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[2].id },
            { id: crypto.randomUUID(), team1Id: teams[1].id, team2Id: teams[2].id },
        ]
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
