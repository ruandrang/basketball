'use server'

import { replaceMatchResults } from '@/lib/storage';
import { Match } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function updateMatchResult(clubId: string, recordId: string, matches: Match[]) {
    try {
        await replaceMatchResults(recordId, matches);

        revalidatePath(`/clubs/${clubId}/history`);
        revalidatePath(`/clubs/${clubId}/stats`);
    } catch (error) {
        console.error('Failed to update match result:', error);
        throw new Error('경기 결과 저장에 실패했습니다.');
    }
}
