'use server'

import { revalidatePath } from 'next/cache';
import { setAttendance, updateHistoryDate, saveHistory } from '@/lib/storage';
import { AttendanceState } from '@/lib/attendance';
import { HistoryRecord } from '@/lib/types';

export async function createAttendance(clubId: string, ymd: string) {
  // create a history_record with no teams/matches yet
  const id = crypto.randomUUID();
  const date = `${ymd}T00:00:00+09:00`;
  const record: HistoryRecord = {
    id,
    date,
    teams: [],
    matches: [],
  };

  // We reuse saveHistory but it expects teams; if teams empty, it should still insert history_records.
  // So we call underlying saveHistory with minimal record.
  await saveHistory(clubId, record);
  revalidatePath(`/clubs/${clubId}/attendance`);
  revalidatePath(`/clubs/${clubId}/history`);
}

export async function setAttendanceState(clubId: string, historyId: string, memberId: string, state: AttendanceState) {
  await setAttendance(historyId, memberId, state);
  revalidatePath(`/clubs/${clubId}/attendance`);
}

export async function setAttendanceDate(clubId: string, historyId: string, ymd: string) {
  await updateHistoryDate(historyId, `${ymd}T00:00:00+09:00`);
  revalidatePath(`/clubs/${clubId}/attendance`);
  revalidatePath(`/clubs/${clubId}/history`);
}
