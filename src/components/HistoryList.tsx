'use client';

import { HistoryRecord, TeamColor, Match } from '@/lib/types';
import { useState, useMemo } from 'react';
import { updateMatchResult } from '@/app/actions/results';

export default function HistoryList({ history, clubId }: { history: HistoryRecord[], clubId: string }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [matchResults, setMatchResults] = useState<Record<string, 'Team1Win' | 'Team2Win' | 'Draw'>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const startEditing = (record: HistoryRecord) => {
        setEditingId(record.id);
        const initialResults: Record<string, 'Team1Win' | 'Team2Win' | 'Draw'> = {};

        // Initialize matches if they don't exist
        const matches = record.matches || generateMatches(record.teams);
        matches.forEach(match => {
            initialResults[match.id] = match.result || 'Draw';
        });
        setMatchResults(initialResults);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setMatchResults({});
    };

    const saveResults = async (recordId: string) => {
        const record = history.find(r => r.id === recordId);
        if (!record) return;

        setIsSubmitting(true);
        try {
            const matches = (record.matches || generateMatches(record.teams)).map(match => ({
                ...match,
                result: matchResults[match.id]
            }));

            await updateMatchResult(clubId, recordId, matches);
            setEditingId(null);
            setMatchResults({});
        } catch (e) {
            console.error(e);
            alert('저장 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (history.length === 0) {
        return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>기록이 없습니다. 팀을 생성해보세요!</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {history.map(record => {
                const date = new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' });
                const isExpanded = expandedId === record.id;
                const isEditing = editingId === record.id;
                const matches = record.matches || generateMatches(record.teams);
                const hasResults = matches.some(m => m.result !== undefined);

                // Calculate team stats from matches
                const teamStats = calculateTeamStats(record.teams, matches);

                return (
                    <div key={record.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div
                            onClick={() => toggle(record.id)}
                            style={{
                                padding: '1rem 1.5rem',
                                cursor: 'pointer',
                                background: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1.1rem' }}>{date}</h3>
                                {hasResults && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', marginTop: '0.25rem' }}>
                                        {record.teams.map(team => {
                                            const stats = teamStats[team.id];
                                            return stats ? `${team.name}: ${stats.wins}승 ${stats.draws}무 ${stats.losses}패` : '';
                                        }).filter(Boolean).join(' | ')}
                                    </div>
                                )}
                            </div>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{isExpanded ? '▼' : '▶'}</span>
                        </div>

                        {isExpanded && (
                            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                {!isEditing && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => startEditing(record)}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            {hasResults ? '경기 결과 수정' : '경기 결과 입력'}
                                        </button>
                                    </div>
                                )}

                                {isEditing && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 107, 0, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent-primary)' }}>
                                        <h4 style={{ marginBottom: '1rem' }}>경기 결과 입력 (총 {matches.length}경기)</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                                            {matches.map(match => {
                                                const team1 = record.teams.find(t => t.id === match.team1Id)!;
                                                const team2 = record.teams.find(t => t.id === match.team2Id)!;

                                                return (
                                                    <div key={match.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                <span style={{ width: '16px', height: '16px', backgroundColor: getColorHex(team1.color), borderRadius: '3px' }}></span>
                                                                <span style={{ fontWeight: 'bold' }}>{team1.name}</span>
                                                            </div>
                                                            <span style={{ color: 'var(--color-text-secondary)' }}>vs</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                <span style={{ width: '16px', height: '16px', backgroundColor: getColorHex(team2.color), borderRadius: '3px' }}></span>
                                                                <span style={{ fontWeight: 'bold' }}>{team2.name}</span>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={matchResults[match.id] || 'Draw'}
                                                            onChange={(e) => setMatchResults({ ...matchResults, [match.id]: e.target.value as any })}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.5rem',
                                                                borderRadius: 'var(--radius-sm)',
                                                                border: '1px solid var(--color-border)',
                                                                background: 'var(--color-bg-primary)',
                                                                color: 'white',
                                                                fontSize: '0.95rem'
                                                            }}
                                                        >
                                                            <option value="Team1Win">{team1.name} 승리</option>
                                                            <option value="Draw">무승부</option>
                                                            <option value="Team2Win">{team2.name} 승리</option>
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => saveResults(record.id)}
                                                disabled={isSubmitting}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                {isSubmitting ? '저장 중...' : '저장'}
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={cancelEditing}
                                                disabled={isSubmitting}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    {record.teams.map(team => {
                                        const stats = teamStats[team.id];

                                        return (
                                            <div key={team.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px solid ' + getColorHex(team.color) }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ width: '20px', height: '20px', backgroundColor: getColorHex(team.color), borderRadius: '4px' }}></span>
                                                        <h4 style={{ color: 'var(--color-accent-gold)' }}>{team.name}</h4>
                                                    </div>
                                                    {stats && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                            {stats.wins}승 {stats.draws}무 {stats.losses}패
                                                        </span>
                                                    )}
                                                </div>
                                                <ul style={{ listStyle: 'none', fontSize: '0.9rem' }}>
                                                    {team.members.map(m => (
                                                        <li key={m.id} style={{ padding: '0.25rem 0', color: 'var(--color-text-secondary)' }}>
                                                            {m.name} ({m.position})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Generate all possible matches for 3 teams
function generateMatches(teams: any[]): Match[] {
    if (teams.length !== 3) return [];

    return [
        { id: `${teams[0].id}-${teams[1].id}`, team1Id: teams[0].id, team2Id: teams[1].id },
        { id: `${teams[0].id}-${teams[2].id}`, team1Id: teams[0].id, team2Id: teams[2].id },
        { id: `${teams[1].id}-${teams[2].id}`, team1Id: teams[1].id, team2Id: teams[2].id },
    ];
}

// Calculate wins/draws/losses for each team based on matches
function calculateTeamStats(teams: any[], matches: Match[]) {
    const stats: Record<string, { wins: number; draws: number; losses: number }> = {};

    teams.forEach(team => {
        stats[team.id] = { wins: 0, draws: 0, losses: 0 };
    });

    matches.forEach(match => {
        if (!match.result) return;

        if (match.result === 'Team1Win') {
            stats[match.team1Id].wins++;
            stats[match.team2Id].losses++;
        } else if (match.result === 'Team2Win') {
            stats[match.team2Id].wins++;
            stats[match.team1Id].losses++;
        } else if (match.result === 'Draw') {
            stats[match.team1Id].draws++;
            stats[match.team2Id].draws++;
        }
    });

    return stats;
}

function getColorHex(color: TeamColor): string {
    const colorMap: Record<TeamColor, string> = {
        'White': '#FFFFFF',
        'Black': '#333333',
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Yellow': '#FBBF24',
        'Green': '#10B981'
    };
    return colorMap[color];
}
