'use server'

import { getClub, updateClub } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { Match } from '@/lib/types';

export async function updateMatchResult(clubId: string, historyId: string, matches: Match[]) {
    const club = await getClub(clubId);
    if (!club) throw new Error('클럽을 찾을 수 없습니다.');

    const historyRecord = club.history.find(h => h.id === historyId);
    if (!historyRecord) throw new Error('기록을 찾을 수 없습니다.');

    // Update matches
    historyRecord.matches = matches;

    await updateClub(club);
    revalidatePath(`/clubs/${clubId}/history`);
}
