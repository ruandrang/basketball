'use server'

import { saveHistory, deleteHistory as dbDeleteHistory, updateHistoryDate as dbUpdateHistoryDate } from '@/lib/cached-storage';
import { Team, HistoryRecord } from '@/lib/types';
import { revalidatePath, updateTag } from 'next/cache';

export async function saveTeamHistory(clubId: string, teams: Team[]) {
    const recordId = crypto.randomUUID();
    const matches = teams.length === 2
        ? [{ id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[1].id }]
        : [
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[1].id },
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[2].id },
            { id: crypto.randomUUID(), team1Id: teams[1].id, team2Id: teams[2].id },
        ];

    const newRecord: HistoryRecord = {
        id: recordId,
        date: new Date().toISOString(),
        teams: teams,
        matches,
    };

    await saveHistory(clubId, newRecord);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function deleteHistory(clubId: string, historyId: string) {
    await dbDeleteHistory(historyId);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function updateHistoryDate(clubId: string, historyId: string, ymd: string) {
    // ymd: YYYY-MM-DD
    // Store as timestamp with explicit +09:00 offset to avoid timezone drift
    const iso = `${ymd}T00:00:00+09:00`;
    await dbUpdateHistoryDate(historyId, iso);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
