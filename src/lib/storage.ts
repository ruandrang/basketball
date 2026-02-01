import { query, queryOne, execute, withTransaction } from './db';
import { Club, Member, HistoryRecord, Team, Match } from './types';
import { AttendanceState } from './attendance';

export async function getClubs(): Promise<Club[]> {
    try {
        const clubs = await query<{ id: string; name: string; created_at: string }>(
            'SELECT * FROM clubs ORDER BY created_at DESC'
        );

        const result: Club[] = [];
        for (const club of clubs) {
            const fullClub = await getClub(club.id);
            if (fullClub) result.push(fullClub);
        }
        return result;
    } catch (e) {
        console.error('데이터베이스 연결 실패:', e);
        return [];
    }
}

export async function getClub(id: string): Promise<Club | undefined> {
    try {
        const club = await queryOne<{ id: string; name: string }>(
            'SELECT * FROM clubs WHERE id = $1',
            [id]
        );
        if (!club) return undefined;

        const members = await query<any>(
            'SELECT * FROM members WHERE club_id = $1',
            [id]
        );

        const historyRecords = await query<any>(
            'SELECT * FROM history_records WHERE club_id = $1 ORDER BY date DESC',
            [id]
        );

        const history: HistoryRecord[] = [];
        for (const hr of historyRecords) {
            const teams = await query<any>(
                'SELECT * FROM teams WHERE history_id = $1 ORDER BY team_order',
                [hr.id]
            );

            const teamsWithMembers: Team[] = [];
            for (const team of teams) {
                const teamMemberIds = await query<{ member_id: string }>(
                    'SELECT member_id FROM team_members WHERE team_id = $1',
                    [team.id]
                );
                const teamMembers = members.filter((m: any) =>
                    teamMemberIds.some(tm => tm.member_id === m.id)
                );

                teamsWithMembers.push({
                    id: team.id,
                    name: team.name || '',
                    color: team.color || 'White',
                    members: teamMembers.map(transformMember),
                    averageHeight: Number(team.average_height || 0)
                });
            }

            const matches = await query<any>(
                'SELECT * FROM matches WHERE history_id = $1',
                [hr.id]
            );

            history.push({
                id: hr.id,
                date: hr.date || new Date().toISOString(),
                teams: teamsWithMembers,
                matches: matches.length > 0
                    ? matches.map((m: any) => ({
                        id: m.id,
                        team1Id: m.team1_id,
                        team2Id: m.team2_id,
                        result: m.result
                    }))
                    : undefined
            });
        }

        return {
            id: club.id,
            name: club.name,
            members: members.map(transformMember),
            history
        };
    } catch (e) {
        console.error('클럽 조회 중 예외 발생:', e);
        return undefined;
    }
}

function transformMember(m: any): Member {
    return {
        id: m.id,
        name: m.name || '',
        age: m.age || 0,
        height: m.height || 0,
        position: m.position || 'SF',
        number: m.number || 0
    };
}

export async function saveClubs(clubs: Club[]): Promise<void> {
    for (const club of clubs) {
        await updateClub(club);
    }
}

export async function updateClub(updatedClub: Club): Promise<void> {
    await execute(
        `INSERT INTO clubs (id, name) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = $2`,
        [updatedClub.id, updatedClub.name]
    );

    if (updatedClub.members.length > 0) {
        for (const m of updatedClub.members) {
            await execute(
                `INSERT INTO members (id, club_id, name, age, height, position, number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE SET
                   name = $3, age = $4, height = $5, position = $6, number = $7`,
                [m.id, updatedClub.id, m.name, m.age, m.height, m.position, m.number]
            );
        }
    }
}

export async function addMember(clubId: string, member: Member): Promise<void> {
    await execute(
        `INSERT INTO members (id, club_id, name, age, height, position, number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [member.id, clubId, member.name, member.age, member.height, member.position, member.number]
    );
}

export async function updateMember(member: Member): Promise<void> {
    await execute(
        `UPDATE members SET name = $1, age = $2, height = $3, position = $4, number = $5
         WHERE id = $6`,
        [member.name, member.age, member.height, member.position, member.number, member.id]
    );
}

export async function deleteMember(memberId: string): Promise<void> {
    await execute('DELETE FROM members WHERE id = $1', [memberId]);
}

export async function saveHistory(clubId: string, record: HistoryRecord): Promise<void> {
    await withTransaction(async (client) => {
        await client.query(
            'INSERT INTO history_records (id, club_id, date) VALUES ($1, $2, $3)',
            [record.id, clubId, record.date]
        );

        for (let i = 0; i < record.teams.length; i++) {
            const team = record.teams[i];
            await client.query(
                `INSERT INTO teams (id, history_id, name, color, average_height, team_order)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [team.id, record.id, team.name, team.color, team.averageHeight, i]
            );

            for (const m of team.members) {
                await client.query(
                    'INSERT INTO team_members (team_id, member_id) VALUES ($1, $2)',
                    [team.id, m.id]
                );
            }
        }

        if (record.matches && record.matches.length > 0) {
            for (const m of record.matches) {
                await client.query(
                    `INSERT INTO matches (id, history_id, team1_id, team2_id, result)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [m.id, record.id, m.team1Id, m.team2Id, m.result]
                );
            }
        }
    });
}

export async function deleteHistory(historyId: string): Promise<void> {
    await execute('DELETE FROM history_records WHERE id = $1', [historyId]);
}

// Attendance
export async function setAttendance(historyId: string, memberId: string, state: AttendanceState): Promise<void> {
    await execute(
        `INSERT INTO attendance_members (history_id, member_id, state)
         VALUES ($1, $2, $3)
         ON CONFLICT (history_id, member_id) DO UPDATE SET state = $3, updated_at = NOW()`,
        [historyId, memberId, state]
    );
}

export async function getAttendanceMap(historyId: string): Promise<Record<string, AttendanceState>> {
    const rows = await query<{ member_id: string; state: AttendanceState }>(
        'SELECT member_id, state FROM attendance_members WHERE history_id = $1',
        [historyId]
    );
    const map: Record<string, AttendanceState> = {};
    for (const r of rows) map[r.member_id] = r.state;
    return map;
}

export async function updateHistoryDate(historyId: string, dateIso: string): Promise<void> {
    await execute(
        'UPDATE history_records SET date = $1 WHERE id = $2',
        [dateIso, historyId]
    );
}

export async function addClub(club: Club): Promise<void> {
    await execute(
        'INSERT INTO clubs (id, name) VALUES ($1, $2)',
        [club.id, club.name]
    );
}

export async function deleteClub(clubId: string): Promise<void> {
    await execute('DELETE FROM clubs WHERE id = $1', [clubId]);
}

export async function updateMatchResults(historyId: string, matches: Match[]): Promise<void> {
    for (const match of matches) {
        await execute(
            `INSERT INTO matches (id, history_id, team1_id, team2_id, result)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               team1_id = $3, team2_id = $4, result = $5`,
            [match.id, historyId, match.team1Id, match.team2Id, match.result]
        );
    }
}
