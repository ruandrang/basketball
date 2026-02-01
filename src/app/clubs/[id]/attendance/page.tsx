import Link from 'next/link';
import { getClub, getAttendanceMap } from '@/lib/storage';
import { notFound } from 'next/navigation';
import { createAttendance, setAttendanceState } from '@/app/actions/attendance';
import { AttendanceState } from '@/lib/attendance';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ event?: string }>;
}

function ymdFromIso(iso: string): string {
  // iso may include timezone (+09:00). We just take date part.
  return iso.slice(0, 10);
}

export default async function AttendancePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const club = await getClub(id);
  if (!club) notFound();

  const events = club.history;
  const currentEventId = sp.event ?? (events[0]?.id ?? null);
  const currentEvent = events.find(e => e.id === currentEventId) ?? null;

  const attendanceMap = currentEventId ? await getAttendanceMap(currentEventId) : {};

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/clubs/${club.id}/dashboard`} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          ← {club.name} 대시보드로
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>출첵</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>모임을 만들고, 멤버별 참석/불참을 체크해요.</p>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server';
            const ymd = String(formData.get('date') ?? '');
            if (!ymd) return;
            await createAttendance(club.id, ymd);
          }}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <input
            type="date"
            name="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)',
              color: 'white',
            }}
          />
          <button type="submit" className="btn btn-primary">모임 생성</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 240 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>모임 선택</label>
            <select
              value={currentEventId ?? ''}
              onChange={() => {}}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'white',
              }}
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {ymdFromIso(e.date)}
                </option>
              ))}
            </select>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              현재는 최신 모임(맨 위)만 편집해요. (다음 커밋에서 선택 가능하게 개선)
            </p>
          </div>

          {currentEvent && (
            <Link
              className="btn btn-secondary"
              href={`/clubs/${club.id}/generate?event=${currentEvent.id}`}
              style={{ marginLeft: 'auto' }}
            >
              이 모임으로 팀 생성하기
            </Link>
          )}
        </div>
      </div>

      {!currentEvent ? (
        <div className="card">모임이 없어요. 먼저 모임을 생성해줘.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {club.members.map(m => {
            const state: AttendanceState | undefined = attendanceMap[m.id];
            const isAttend = state === 'attend';
            const isAbsent = state === 'absent';

            return (
              <div key={m.id} className="card" style={{ borderColor: isAttend ? 'var(--color-success)' : isAbsent ? 'rgba(255, 107, 107, 0.6)' : 'var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{m.position} · #{m.number}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{m.height}cm</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <form action={async () => {
                    'use server';
                    await setAttendanceState(club.id, currentEvent.id, m.id, 'attend');
                  }} style={{ flex: 1 }}>
                    <button type="submit" className={isAttend ? 'btn btn-primary' : 'btn btn-secondary'} style={{ width: '100%' }}>
                      참석
                    </button>
                  </form>
                  <form action={async () => {
                    'use server';
                    await setAttendanceState(club.id, currentEvent.id, m.id, 'absent');
                  }} style={{ flex: 1 }}>
                    <button type="submit" className={isAbsent ? 'btn btn-primary' : 'btn btn-secondary'} style={{ width: '100%' }}>
                      불참
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
