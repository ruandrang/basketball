import { HistoryRecord, Member, Team, TeamColor } from './types';

type MemberStats = {
    games: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number; // (wins + 0.5*draws) / games
    eligible: boolean; // games >= 5
};

export function generateTeams(
    players: Member[],
    colors: TeamColor[],
    history: HistoryRecord[] = [],
    teamCount: number = 2
): Team[] {
    // 목표: 포지션은 골고루 + (5게임 이상 데이터가 있는 멤버는) 승률까지 고려해서
    //       너무 이기는 멤버만 한 팀에 몰리지 않게 분산

    const stats = computeMemberStats(players, history);

    const centers = players.filter(p => p.position === 'C');
    const others = players.filter(p => p.position !== 'C');
    const forwards = others.filter(p => p.position === 'SF' || p.position === 'PF');
    const guards = others.filter(p => p.position === 'PG' || p.position === 'SG');

    const safeTeamCount = Math.max(2, Math.min(teamCount, 3));
    const palette = colors.length >= safeTeamCount ? colors : ['White', 'Black', 'Red'];

    const teams: Team[] = Array.from({ length: safeTeamCount }).map((_, i) => ({
        id: crypto.randomUUID(),
        name: `팀 ${palette[i]}`,
        color: palette[i] as TeamColor,
        members: [],
        averageHeight: 0,
    }));

    const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);

    // 팀 밸런싱 지표
    // - 승률 데이터가 5경기 이상이면 winRate
    // - 아니면 0.5(중립)로 취급
    const teamStrength = () =>
        teams.map(t =>
            t.members.reduce((sum, m) => {
                const s = stats.get(m.id);
                const strength = s?.eligible ? s.winRate : 0.5;
                return sum + strength;
            }, 0)
        );

    const pickTeamIndexFor = () => {
        // 1) 팀 인원 수가 적은 팀 우선
        const sizes = teams.map(t => t.members.length);
        const minSize = Math.min(...sizes);
        const sizeCandidates = sizes
            .map((sz, idx) => ({ sz, idx }))
            .filter(x => x.sz === minSize)
            .map(x => x.idx);

        if (sizeCandidates.length === 1) return sizeCandidates[0];

        // 2) (동일 인원수면) 승률/실력 합이 낮은 팀 우선
        const strengths = teamStrength();
        let bestIdx = sizeCandidates[0];
        for (const idx of sizeCandidates) {
            if (strengths[idx] < strengths[bestIdx]) bestIdx = idx;
        }
        return bestIdx;
    };

    const distributeWithBalance = (pool: Member[]) => {
        // 포지션 풀 내에서
        // - 승률 eligible인 사람들은 winRate 높은 순으로(동률은 랜덤)
        // - 승률 미달(데이터 부족)은 랜덤
        const randomized = shuffle([...pool]);
        randomized.sort((a, b) => {
            const sa = stats.get(a.id);
            const sb = stats.get(b.id);
            const ea = sa?.eligible ? 1 : 0;
            const eb = sb?.eligible ? 1 : 0;
            if (ea !== eb) return eb - ea; // eligible 먼저
            if (ea === 0 && eb === 0) return 0;
            return (sb?.winRate ?? 0.5) - (sa?.winRate ?? 0.5); // winRate desc
        });

        for (const player of randomized) {
            const idx = pickTeamIndexFor();
            teams[idx].members.push(player);
        }
    };

    // 1) 센터 먼저 최대한 분산
    distributeWithBalance(centers);

    // 2) 포워드, 가드도 분산
    distributeWithBalance(forwards);
    distributeWithBalance(guards);

    // 평균 키 계산
    teams.forEach(t => {
        const totalHeight = t.members.reduce((sum, m) => sum + m.height, 0);
        t.averageHeight = t.members.length > 0 ? Math.round(totalHeight / t.members.length) : 0;
    });

    return teams;
}

function computeMemberStats(players: Member[], history: HistoryRecord[]): Map<string, MemberStats> {
    const map = new Map<string, MemberStats>();

    const ensure = (id: string) => {
        if (!map.has(id)) {
            map.set(id, { games: 0, wins: 0, draws: 0, losses: 0, winRate: 0.5, eligible: false });
        }
        return map.get(id)!;
    };

    // 초기화 (선택된 멤버만)
    for (const p of players) ensure(p.id);

    // 기록에서 경기 결과를 멤버 단위로 누적
    for (const record of history) {
        const matches = record.matches || [];
        if (matches.length === 0) continue;

        // teamId -> memberIds
        const teamMemberIds = new Map<string, string[]>();
        for (const t of record.teams) {
            teamMemberIds.set(t.id, t.members.map(m => m.id));
        }

        for (const match of matches) {
            if (!match.result) continue; // 결과 입력 안 된 경기는 제외

            const team1Members = teamMemberIds.get(match.team1Id) || [];
            const team2Members = teamMemberIds.get(match.team2Id) || [];

            // 현재 생성에 포함된 멤버만 집계
            const team1Filtered = team1Members.filter(id => map.has(id));
            const team2Filtered = team2Members.filter(id => map.has(id));

            // games++
            for (const id of team1Filtered) ensure(id).games++;
            for (const id of team2Filtered) ensure(id).games++;

            if (match.result === 'Team1Win') {
                for (const id of team1Filtered) ensure(id).wins++;
                for (const id of team2Filtered) ensure(id).losses++;
            } else if (match.result === 'Team2Win') {
                for (const id of team2Filtered) ensure(id).wins++;
                for (const id of team1Filtered) ensure(id).losses++;
            } else {
                for (const id of team1Filtered) ensure(id).draws++;
                for (const id of team2Filtered) ensure(id).draws++;
            }
        }
    }

    for (const [id, s] of map.entries()) {
        if (s.games > 0) {
            s.winRate = (s.wins + 0.5 * s.draws) / s.games;
        } else {
            s.winRate = 0.5;
        }
        s.eligible = s.games >= 5;
    }

    return map;
}
