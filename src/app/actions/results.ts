'use server'

import { replaceMatchResults, getClubCached as getClub } from '@/lib/cached-storage';
import { Match } from '@/lib/types';
import { revalidatePath, updateTag } from 'next/cache';
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

export async function updateMatchResult(clubId: string, recordId: string, matches: Match[]) {
    await checkAccess(clubId);
    try {
        await replaceMatchResults(recordId, matches);

        updateTag(`club:${clubId}`);
        revalidatePath(`/clubs/${clubId}/history`);
        revalidatePath(`/clubs/${clubId}/stats`);
    } catch (error) {
        console.error('Failed to update match result:', error);
        throw new Error('경기 결과 저장에 실패했습니다.');
    }
}
