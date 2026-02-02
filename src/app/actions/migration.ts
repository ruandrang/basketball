'use server'

import fs from 'fs/promises';
import path from 'path';
import { saveHistory, updateClub, addMember } from '@/lib/storage';
import { Club } from '@/lib/types';
import { revalidatePath, updateTag } from 'next/cache';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');

export async function migrateToSupabase() {
    try {
        const data = await fs.readFile(CLUBS_FILE, 'utf-8');
        const clubs: Club[] = JSON.parse(data);

        console.log(`${clubs.length}개의 클럽 마이그레이션 시작...`);

        for (const club of clubs) {
            // 1. 클럽 및 멤버 저장 (upsert)
            await updateClub(club);
            console.log(`클럽 마이그레이션 완료: ${club.name}`);

            // 2. 히스토리 저장
            for (const record of club.history) {
                try {
                    await saveHistory(club.id, record);
                    console.log(`기록 마이그레이션 완료: ${record.date}`);
                } catch (e) {
                    console.error(`기록 마이그레이션 실패 (${record.id}):`, e);
                }
            }
        }

        for (const club of clubs) {
            updateTag(`club:${club.id}`);
        }
        updateTag('clubs:list');
        revalidatePath('/');
        return { success: true, message: `${clubs.length}개의 클럽 데이터가 성공적으로 이전되었습니다.` };
    } catch (error) {
        console.error('마이그레이션 실패:', error);
        return { success: false, message: '로컬 데이터를 찾을 수 없거나 마이그레이션 중 오류가 발생했습니다.' };
    }
}
