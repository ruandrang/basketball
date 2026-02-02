import { query, queryOne, execute, withTransaction } from './db';
import { Club, Member, HistoryRecord, Team, Match, User } from './types';

// ===== User functions =====

export async function getUserByUsername(username: string): Promise<(User & { passwordHash: string }) | undefined> {
    const row = await queryOne<{ id: string; username: string; password_hash: string; display_name: string }>(
        'SELECT id, username, password_hash, display_name FROM users WHERE username = $1',
        [username]
    );
    if (!row) return undefined;
    return {
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        passwordHash: row.password_hash,
    };
}

export async function createUser(id: string, username: string, passwordHash: string, displayName: string): Promise<void> {
    await execute(
        'INSERT INTO users (id, username, password_hash, display_name) VALUES ($1, $2, $3, $4)',
        [id, username, passwordHash, displayName]
    );
}

// ===== Club functions =====

export async function getClubs(): Promise<Club[]> {
    try {
        const clubs = await query<{ id: string; name: string; owner_id: string | null }>(
            'SELECT * FROM clubs ORDER BY created_at DESC'
        );
        if (clubs.length === 0) return [];

        // 모든 클럽의 멤버를 한 번에 조회
        const members = await query<any>(
            'SELECT * FROM members ORDER BY sort_order ASC, created_at ASC'
        );

        // 히스토리 기록 수 조회 (전체 데이터 불필요, 카운트만)
        const historyRecords = await query<{ id: string; club_id: string }>(
            'SELECT id, club_id FROM history_records'
        );

        const membersByClub = new Map<string, any[]>();
        for (const m of members) {
            if (!membersByClub.has(m.club_id)) membersByClub.set(m.club_id, []);
            membersByClub.get(m.club_id)!.push(m);
        }

        const historyByClub = new Map<string, { id: string }[]>();
        for (const hr of historyRecords) {
            if (!historyByClub.has(hr.club_id)) historyByClub.set(hr.club_id, []);
            historyByClub.get(hr.club_id)!.push({ id: hr.id });
        }

        return clubs.map(club => ({
            id: club.id,
            name: club.name,
            ownerId: club.owner_id || undefined,
            members: (membersByClub.get(club.id) || []).map(transformMember),
            history: (historyByClub.get(club.id) || []).map(hr => ({
                id: hr.id,
                date: '',
                teams: [],
            })),
        }));
    } catch (e) {
        console.error('데이터베이스 연결 실패:', e);
        return [];
    }
}

export async function getClub(id: string): Promise<Club | undefined> {
    try {
        const club = await queryOne<{ id: string; name: string; owner_id: string | null }>(
            'SELECT * FROM clubs WHERE id = $1',
            [id]
        );
        if (!club) return undefined;

        // 6개 쿼리로 클럽 전체 데이터를 배치 조회 (루프 내 쿼리 제거)
        const members = await query<any>(
            'SELECT * FROM members WHERE club_id = $1 ORDER BY sort_order ASC, created_at ASC',
            [id]
        );

        const historyRecords = await query<any>(
            'SELECT * FROM history_records WHERE club_id = $1 ORDER BY date DESC',
            [id]
        );

        const allTeams = await query<any>(
            `SELECT t.* FROM teams t
             JOIN history_records hr ON t.history_id = hr.id
             WHERE hr.club_id = $1
             ORDER BY t.team_order`,
            [id]
        );

        const allTeamMembers = await query<{ team_id: string; member_id: string }>(
            `SELECT tm.team_id, tm.member_id FROM team_members tm
             JOIN teams t ON tm.team_id = t.id
             JOIN history_records hr ON t.history_id = hr.id
             WHERE hr.club_id = $1`,
            [id]
        );

        const allMatches = await query<any>(
            `SELECT * FROM matches
             WHERE history_id IN (SELECT id FROM history_records WHERE club_id = $1)`,
            [id]
        );

        // 메모리에서 그룹화
        const memberMap = new Map<string, any>();
        for (const m of members) memberMap.set(m.id, m);

        const teamsByHistory = new Map<string, any[]>();
        for (const t of allTeams) {
            if (!teamsByHistory.has(t.history_id)) teamsByHistory.set(t.history_id, []);
            teamsByHistory.get(t.history_id)!.push(t);
        }

        const memberIdsByTeam = new Map<string, string[]>();
        for (const tm of allTeamMembers) {
            if (!memberIdsByTeam.has(tm.team_id)) memberIdsByTeam.set(tm.team_id, []);
            memberIdsByTeam.get(tm.team_id)!.push(tm.member_id);
        }

        const matchesByHistory = new Map<string, any[]>();
        for (const m of allMatches) {
            if (!matchesByHistory.has(m.history_id)) matchesByHistory.set(m.history_id, []);
            matchesByHistory.get(m.history_id)!.push(m);
        }

        // 조회 결과 조립
        const history: HistoryRecord[] = historyRecords.map((hr: any) => {
            const teams: Team[] = (teamsByHistory.get(hr.id) || []).map((team: any) => ({
                id: team.id,
                name: team.name || '',
                color: team.color || 'White',
                members: (memberIdsByTeam.get(team.id) || [])
                    .map(mid => memberMap.get(mid))
                    .filter(Boolean)
                    .map(transformMember),
                averageHeight: Number(team.average_height || 0),
            }));

            const matches = (matchesByHistory.get(hr.id) || []).map((m: any) => ({
                id: m.id,
                team1Id: m.team1_id,
                team2Id: m.team2_id,
                result: m.result,
            }));

            return {
                id: hr.id,
                date: hr.date || new Date().toISOString(),
                teams,
                matches: matches.length > 0 ? matches : undefined,
            };
        });

        return {
            id: club.id,
            name: club.name,
            ownerId: club.owner_id || undefined,
            members: members.map(transformMember),
            history,
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
        number: m.number || 0,
        sortOrder: m.sort_order ?? 0,
    };
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

export async function getNextMemberSortOrder(clubId: string): Promise<number> {
    const row = await queryOne<{ next: number }>(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM members WHERE club_id = $1',
        [clubId]
    );
    return row?.next ?? 1;
}

export async function addMember(clubId: string, member: Member): Promise<void> {
    const sortOrder = typeof member.sortOrder === 'number' ? member.sortOrder : await getNextMemberSortOrder(clubId);
    await execute(
        `INSERT INTO members (id, club_id, name, age, height, position, number, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [member.id, clubId, member.name, member.age, member.height, member.position, member.number, sortOrder]
    );
}

export async function updateMember(member: Member): Promise<void> {
    await execute(
        `UPDATE members SET name = $1, age = $2, height = $3, position = $4, number = $5
         WHERE id = $6`,
        [member.name, member.age, member.height, member.position, member.number, member.id]
    );
}

export async function updateMemberSortOrders(clubId: string, orderedMemberIds: string[]): Promise<void> {
    await withTransaction(async (client) => {
        for (let i = 0; i < orderedMemberIds.length; i++) {
            await client.query(
                'UPDATE members SET sort_order = $1 WHERE club_id = $2 AND id = $3',
                [i + 1, clubId, orderedMemberIds[i]]
            );
        }
    });
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

// (attendance feature removed)

export async function updateHistoryDate(historyId: string, dateIso: string): Promise<void> {
    await execute(
        'UPDATE history_records SET date = $1 WHERE id = $2',
        [dateIso, historyId]
    );
}

export async function addClub(club: Club): Promise<void> {
    await execute(
        'INSERT INTO clubs (id, name, owner_id) VALUES ($1, $2, $3)',
        [club.id, club.name, club.ownerId || null]
    );
}

export async function deleteClub(clubId: string): Promise<void> {
    await execute('DELETE FROM clubs WHERE id = $1', [clubId]);
}

export async function replaceMatchResults(historyId: string, matches: Match[]): Promise<void> {
    // Replace strategy: delete removed matches, then upsert current list.
    // This supports "add/remove multiple games" UX.
    await withTransaction(async (client) => {
        if (matches.length === 0) {
            await client.query('DELETE FROM matches WHERE history_id = $1', [historyId]);
            return;
        }

        const ids = matches.map(m => m.id);
        await client.query(
            'DELETE FROM matches WHERE history_id = $1 AND id NOT IN (SELECT UNNEST($2::uuid[]))',
            [historyId, ids]
        );

        for (const match of matches) {
            await client.query(
                `INSERT INTO matches (id, history_id, team1_id, team2_id, result)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET
                   team1_id = $3, team2_id = $4, result = $5`,
                [match.id, historyId, match.team1Id, match.team2Id, match.result]
            );
        }
    });
}
