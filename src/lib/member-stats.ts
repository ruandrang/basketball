import { HistoryRecord, Match } from '@/lib/types';

export type WinStats = {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // (wins + 0.5*draws) / games
};

export type ParticipationStats = {
  eventsTotal: number;
  eventsPlayed: number;
  participationRate: number; // eventsPlayed/eventsTotal
};

export function computeWinStatsForMembers(history: HistoryRecord[]): Record<string, WinStats> {
  // memberId -> stats
  const stats: Record<string, WinStats> = {};

  const ensure = (id: string) => {
    if (!stats[id]) stats[id] = { games: 0, wins: 0, draws: 0, losses: 0, winRate: 0 };
    return stats[id];
  };

  for (const record of history) {
    const matches: Match[] = record.matches ?? [];
    if (matches.length === 0) continue;

    const teamMembers = new Map<string, string[]>();
    for (const t of record.teams) {
      teamMembers.set(t.id, t.members.map(m => m.id));
    }

    for (const match of matches) {
      if (!match.result) continue;
      const t1 = teamMembers.get(match.team1Id) ?? [];
      const t2 = teamMembers.get(match.team2Id) ?? [];

      // games++
      for (const id of [...t1, ...t2]) ensure(id).games++;

      if (match.result === 'Team1Win') {
        for (const id of t1) ensure(id).wins++;
        for (const id of t2) ensure(id).losses++;
      } else if (match.result === 'Team2Win') {
        for (const id of t2) ensure(id).wins++;
        for (const id of t1) ensure(id).losses++;
      } else {
        for (const id of t1) ensure(id).draws++;
        for (const id of t2) ensure(id).draws++;
      }
    }
  }

  for (const id of Object.keys(stats)) {
    const s = stats[id];
    s.winRate = s.games > 0 ? (s.wins + 0.5 * s.draws) / s.games : 0;
  }

  return stats;
}

export function computeParticipationForMembers(history: HistoryRecord[]): Record<string, ParticipationStats> {
  // "출첵" 기능이 없으므로, 참여율은 "기록(이벤트) 중 실제로 팀에 포함된 비율"로 계산
  const eventsTotal = history.length;
  const playedCount: Record<string, number> = {};

  for (const record of history) {
    const memberIds = new Set<string>();
    for (const t of record.teams) {
      for (const m of t.members) memberIds.add(m.id);
    }
    for (const id of memberIds) {
      playedCount[id] = (playedCount[id] ?? 0) + 1;
    }
  }

  const out: Record<string, ParticipationStats> = {};
  for (const [id, eventsPlayed] of Object.entries(playedCount)) {
    out[id] = {
      eventsTotal,
      eventsPlayed,
      participationRate: eventsTotal > 0 ? eventsPlayed / eventsTotal : 0,
    };
  }

  return out;
}

export function percent(n: number): string {
  if (!Number.isFinite(n)) return '0%';
  return `${Math.round(n * 100)}%`;
}
