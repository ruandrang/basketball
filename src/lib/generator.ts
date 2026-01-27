import { Member, Team, TeamColor } from './types';

export function generateTeams(players: Member[], colors: [TeamColor, TeamColor, TeamColor]): Team[] {
    // 1. Separate by position/role
    // Priority: Distribute Centers first.

    const centers = players.filter(p => p.position === 'Center');
    const others = players.filter(p => p.position !== 'Center');

    // Sort others by height or random? 
    // To balance, maybe sort by height descending so we can snake draft or distribute?
    // User asked for "Poistions golgoru pojin" (positions distributed evenly).
    // Groups: Center, Forward, Guard.

    const forwards = others.filter(p => p.position === 'Forward');
    const guards = others.filter(p => p.position === 'Guard');

    // Shuffle arrays to add randomness within tiers
    const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);

    const shuffledCenters = shuffle([...centers]);
    const shuffledForwards = shuffle([...forwards]);
    const shuffledGuards = shuffle([...guards]);

    // If we don't have enough centers for 3 teams, some teams get none? 
    // Or if we have surplus, some get >1.

    const teams: Team[] = [
        { id: '1', name: `팀 ${colors[0]}`, color: colors[0], members: [], averageHeight: 0 },
        { id: '2', name: `팀 ${colors[1]}`, color: colors[1], members: [], averageHeight: 0 },
        { id: '3', name: `팀 ${colors[2]}`, color: colors[2], members: [], averageHeight: 0 },
    ];

    // Distribution Helper
    let teamIndex = 0;
    const distribute = (pool: Member[]) => {
        pool.forEach(player => {
            teams[teamIndex].members.push(player);
            teamIndex = (teamIndex + 1) % 3;
        });
    };

    // 1. Distribute Centers
    distribute(shuffledCenters);

    // 2. Distribute Forwards
    // Reset teamIndex to balance or continue? 
    // Better to snake draft?
    // Let's just continue round-robin for simplicity, it works well for random distribution.
    // Actually, to ensure balance, we should maybe check team counts?
    // The User said 18 people -> 6 per team.
    // If input is exactly 18, round robin works perfectly.

    distribute(shuffledForwards);
    distribute(shuffledGuards);

    // Calculate stats
    teams.forEach(t => {
        const totalHeight = t.members.reduce((sum, m) => sum + m.height, 0);
        t.averageHeight = t.members.length > 0 ? Math.round(totalHeight / t.members.length) : 0;
    });

    return teams;
}
