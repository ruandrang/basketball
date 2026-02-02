export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type TeamColor = 'White' | 'Black' | 'Red' | 'Blue' | 'Yellow' | 'Green';

export interface Member {
    id: string;
    name: string;
    age: number;
    height: number;
    position: Position;
    number: number;
    sortOrder?: number;
}

export interface Team {
    id: string;
    name: string; // e.g., "Team A" or "Team White"
    color: TeamColor;
    members: Member[];
    averageHeight: number;
}

export interface Match {
    id: string;
    team1Id: string;
    team2Id: string;
    result?: 'Team1Win' | 'Team2Win' | 'Draw';
}

export interface HistoryRecord {
    id: string;
    date: string;
    teams: Team[];
    matches?: Match[]; // 3 matches for 3 teams (A vs B, A vs C, B vs C)
}

export interface Club {
    id: string;
    name: string;
    members: Member[];
    history: HistoryRecord[];
}
