'use server'

import { saveHistory, deleteHistory as dbDeleteHistory, updateHistoryDate as dbUpdateHistoryDate, getClubCached as getClub } from '@/lib/cached-storage';
import { Team, HistoryRecord } from '@/lib/types';
import { revalidatePath, updateTag } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

function nowKST(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}T${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}:${pad(kst.getUTCSeconds())}+09:00`;
}

async function checkAccess(clubId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    if (!currentUser.isAdmin && club.ownerId !== currentUser.id) {
        throw new Error('권한이 없습니다.');
    }
}

export async function saveTeamHistory(clubId: string, teams: Team[]) {
    await checkAccess(clubId);
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
        date: nowKST(),
        teams: teams,
        matches,
    };

    await saveHistory(clubId, newRecord);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function deleteHistory(clubId: string, historyId: string) {
    await checkAccess(clubId);
    await dbDeleteHistory(historyId);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}

export async function updateHistoryDate(clubId: string, historyId: string, ymd: string) {
    await checkAccess(clubId);
    // ymd: YYYY-MM-DD
    // Store as timestamp with explicit +09:00 offset to avoid timezone drift
    const iso = `${ymd}T00:00:00+09:00`;
    await dbUpdateHistoryDate(historyId, iso);
    updateTag(`club:${clubId}`);
    revalidatePath(`/clubs/${clubId}/history`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
