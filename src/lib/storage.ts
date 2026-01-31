import { createSupabaseServerClient } from './supabase';
import { Club, Member, HistoryRecord, Team, Match } from './types';

function supabase() {
    // lazy init so missing env throws inside try/catch (and logs are clearer)
    return createSupabaseServerClient();
}

// Supabase 통합을 위해 storage.ts를 완전히 재작성합니다.
// 기존의 파일 시스템 기반 함수들을 Supabase 쿼리로 대체합니다.

export async function getClubs(): Promise<Club[]> {
    try {
        const { data: clubs, error } = await supabase()
            .from('clubs')
            .select(`
                *,
                members (*),
                history_records (
                    *,
                    teams (
                        *,
                        team_members (member_id)
                    ),
                    matches (*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('클럽 목록 조회 실패:', error);
            return [];
        }

        return (clubs || []).map(club => transformSupabaseClub(club));
    } catch (e) {
        console.error('데이터베이스 연결 실패:', e);
        return [];
    }
}

export async function getClub(id: string): Promise<Club | undefined> {
    try {
        const { data: club, error } = await supabase()
            .from('clubs')
            .select(`
                *,
                members (*),
                history_records (
                    *,
                    teams (
                        *,
                        team_members (member_id)
                    ),
                    matches (*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // Not found error
                console.error('클럽 조회 실패:', error);
            }
            return undefined;
        }

        if (!club) return undefined;
        return transformSupabaseClub(club);
    } catch (e) {
        console.error('클럽 조회 중 예외 발생:', e);
        return undefined;
    }
}

export async function saveClubs(clubs: Club[]): Promise<void> {
    // 이 함수는 기존에 파일 전체를 덮어쓰던 방식입니다.
    // DB에서는 비효율적이므로 가급적 updateClub이나 개별 생성을 권장하지만,
    // 호환성을 위해 루프를 돌며 upsert를 수행합니다.
    for (const club of clubs) {
        await updateClub(club);
    }
}

export async function updateClub(updatedClub: Club): Promise<void> {
    // 1. 클럽 정보 업데이트 (또는 삽입)
    const { error: clubError } = await supabase()
        .from('clubs')
        .upsert({
            id: updatedClub.id,
            name: updatedClub.name
        });

    if (clubError) throw clubError;

    // 2. 멤버 정보 업데이트 (동기화)
    // 기존 멤버와 비교하여 삭제된 멤버 처리 등 복잡한 로직이 필요할 수 있지만,
    // 여기서는 간단하게 모든 멤버를 upsert 합니다.
    if (updatedClub.members.length > 0) {
        const { error: memberError } = await supabase()
            .from('members')
            // NOTE: Member 타입에 clubId(카멜케이스)가 있을 수 있어 spread하면
            // PostgREST가 members.clubId 컬럼을 찾으려다(PGRST204) 실패합니다.
            // DB 컬럼명(club_id)에 맞춰 명시적으로 매핑합니다.
            .upsert(updatedClub.members.map(m => ({
                id: m.id,
                club_id: updatedClub.id,
                name: m.name,
                age: m.age,
                height: m.height,
                position: m.position,
                number: m.number,
            })));
        if (memberError) throw memberError;
    }

    // 3. 기록(history)은 updateHistory/saveHistory를 별도로 쓰는 것이 좋지만,
    // storage 구조상 여기서도 처리할 수 있게 합니다.
    // 히스토리 업데이트 로직은 복잡도가 높으므로 (Teams, Match, TeamMembers 관계 포함)
    // 서버 액션에서 이미 처리하고 있을 가능성이 큽니다.
    // 만약 전체를 동기화해야 한다면 별도의 마이그레이션 도구를 사용하는 것이 안전합니다.
}

// 헬퍼: Supabase 데이터를 Club 객체로 변환
function transformSupabaseClub(dbClub: any): Club {
    if (!dbClub) {
        return { id: '', name: '', members: [], history: [] };
    }

    const members = (dbClub.members || []).map((m: any) => ({
        id: m.id,
        name: m.name || '',
        age: m.age || 0,
        height: m.height || 0,
        position: m.position || 'Forward',
        number: m.number || 0,
        clubId: m.club_id
    }));

    const history = (dbClub.history_records || []).map((hr: any) => {
        // Teams 변환
        const teams = (hr.teams || []).sort((a: any, b: any) => (a.team_order || 0) - (b.team_order || 0)).map((t: any) => {
            // Team Members 추출
            const teamMemberIds = (t.team_members || []).map((tm: any) => tm.member_id);
            const teamMembers = members.filter((m: any) => teamMemberIds.includes(m.id));

            return {
                id: t.id,
                name: t.name || '',
                color: t.color || 'White',
                members: teamMembers,
                averageHeight: Number(t.average_height || 0)
            };
        });

        // Matches 변환
        const matches = (hr.matches || []).map((m: any) => ({
            id: m.id,
            team1Id: m.team1_id,
            team2Id: m.team2_id,
            result: m.result
        }));

        return {
            id: hr.id,
            date: hr.date || new Date().toISOString(),
            teams: teams,
            matches: matches.length > 0 ? matches : undefined
        };
    }).sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });

    return {
        id: dbClub.id || '',
        name: dbClub.name || '',
        members: members,
        history: history
    };
}

// 개별 엔티티를 CRUD 하는 함수들을 추가로 제공하여 성능을 최적화할 수 있습니다.
export async function addMember(clubId: string, member: Member): Promise<void> {
    const { error } = await supabase()
        .from('members')
        .insert({
            id: member.id,
            club_id: clubId,
            name: member.name,
            age: member.age,
            height: member.height,
            position: member.position,
            number: member.number
        });
    if (error) throw error;
}

export async function updateMember(member: Member): Promise<void> {
    const { error } = await supabase()
        .from('members')
        .update({
            name: member.name,
            age: member.age,
            height: member.height,
            position: member.position,
            number: member.number
        })
        .eq('id', member.id);
    if (error) throw error;
}

export async function deleteMember(memberId: string): Promise<void> {
    const { error } = await supabase()
        .from('members')
        .delete()
        .eq('id', memberId);
    if (error) throw error;
}

export async function saveHistory(clubId: string, record: HistoryRecord): Promise<void> {
    // 1. History record 생성
    const { error: hrError } = await supabase()
        .from('history_records')
        .insert({
            id: record.id,
            club_id: clubId,
            date: record.date
        });
    if (hrError) throw hrError;

    // 2. Teams 생성
    for (let i = 0; i < record.teams.length; i++) {
        const team = record.teams[i];
        const { error: teamError } = await supabase()
            .from('teams')
            .insert({
                id: team.id,
                history_id: record.id,
                name: team.name,
                color: team.color,
                average_height: team.averageHeight,
                team_order: i
            });
        if (teamError) throw teamError;

        // 3. Team Members 관계 생성
        const teamMembers = team.members.map(m => ({
            team_id: team.id,
            member_id: m.id
        }));
        const { error: tmError } = await supabase()
            .from('team_members')
            .insert(teamMembers);
        if (tmError) throw tmError;
    }

    // 4. Matches 생성 (있는 경우)
    if (record.matches && record.matches.length > 0) {
        const supabaseMatches = record.matches.map(m => ({
            id: m.id,
            history_id: record.id,
            team1_id: m.team1Id,
            team2_id: m.team2Id,
            result: m.result
        }));
        const { error: mError } = await supabase()
            .from('matches')
            .insert(supabaseMatches);
        if (mError) throw mError;
    }
}

export async function deleteHistory(historyId: string): Promise<void> {
    const { error } = await supabase()
        .from('history_records')
        .delete()
        .eq('id', historyId);
    if (error) throw error;
}

export async function updateHistoryDate(historyId: string, dateIso: string): Promise<void> {
    const { error } = await supabase()
        .from('history_records')
        .update({ date: dateIso })
        .eq('id', historyId);
    if (error) throw error;
}

export async function deleteClub(clubId: string): Promise<void> {
    // clubs.id 기준으로 삭제하면, FK ON DELETE CASCADE로
    // members / history_records 및 하위(teams, matches, team_members)까지 정리됩니다.
    const { error } = await supabase()
        .from('clubs')
        .delete()
        .eq('id', clubId);
    if (error) throw error;
}

export async function updateMatchResults(historyId: string, matches: Match[]): Promise<void> {
    for (const match of matches) {
        const { error } = await supabase()
            .from('matches')
            .upsert({
                id: match.id,
                history_id: historyId,
                team1_id: match.team1Id,
                team2_id: match.team2Id,
                result: match.result
            });
        if (error) throw error;
    }
}
