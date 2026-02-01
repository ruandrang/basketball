'use client';

import { Member, HistoryRecord } from '@/lib/types';
import { percent, ParticipationStats, WinStats } from '@/lib/member-stats';
import MemberForm from '@/components/MemberForm';
import { useMemo, useState } from 'react';

export default function MemberDetailClient({
  clubId,
  clubName,
  member,
  win,
  participation,
  history,
}: {
  clubId: string;
  clubName: string;
  member: Member;
  win: WinStats;
  participation: ParticipationStats;
  history: HistoryRecord[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  const title = useMemo(() => `${member.name} #${member.number}`, [member.name, member.number]);

  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{title}</h1>
            <div style={{ color: 'var(--color-text-secondary)' }}>{clubName}</div>
          </div>

          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            정보 수정
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          <StatCard label="승률" value={win.games > 0 ? percent(win.winRate) : '-'} sub={`${win.wins}승 ${win.draws}무 ${win.losses}패 · ${win.games}경기`} />
          <StatCard label="참석률(참여율)" value={participation.eventsTotal > 0 ? percent(participation.participationRate) : '-'} sub={`${participation.eventsPlayed}/${participation.eventsTotal} 기록 참여`} />
          <StatCard label="포지션" value={member.position} sub={`키 ${member.height}cm · 나이 ${member.age}세`} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '0.75rem' }}>참여 기록</h2>
        {history.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>아직 참여한 기록이 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {history.map((r) => (
              <div key={r.id} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{formatKoreanDate(r.date)}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{(r.matches?.length ?? 0)} 경기</div>
                </div>
                <div style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  팀: {r.teams.find(t => t.members.some(m => m.id === member.id))?.name ?? '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditing && (
        <MemberForm clubId={clubId} initialData={member} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem' }}>{value}</div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{sub}</div>
    </div>
  );
}

function formatKoreanDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}
