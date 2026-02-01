export type AttendanceState = 'attend' | 'absent';

export type AttendanceMember = {
  memberId: string;
  state: AttendanceState;
};

export type Attendance = {
  id: string; // uses history_records.id
  clubId: string;
  date: string; // ISO
  title?: string;
  status?: 'open' | 'closed';
  members: AttendanceMember[];
};
