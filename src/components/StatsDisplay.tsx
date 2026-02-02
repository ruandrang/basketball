'use client';

import { Member, HistoryRecord } from '@/lib/types';
import { useMemo, useState } from 'react';

interface PlayerStats {
    memberId: string;
    name: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
}

interface StatsDisplayProps {
    members: Member[];
    history: HistoryRecord[];
}

type SortField = 'name' | 'gamesPlayed' | 'wins' | 'losses' | 'draws' | 'winRate';
type SortDirection = 'asc' | 'desc';

export default function StatsDisplay({ members, history }: StatsDisplayProps) {
    const [sortField, setSortField] = useState<SortField>('gamesPlayed');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field with default descending direction
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const playerStats = useMemo(() => {
        const stats: Record<string, PlayerStats> = {};

        // Initialize stats for all members
        members.forEach(member => {
            stats[member.id] = {
                memberId: member.id,
                name: member.name,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0
            };
        });

        // Calculate stats from history
        history.forEach(record => {
            // Calculate team results from matches
            const teamStats: Record<string, { wins: number; draws: number; losses: number }> = {};
            record.teams.forEach(team => {
                teamStats[team.id] = { wins: 0, draws: 0, losses: 0 };
            });

            if (record.matches) {
                record.matches.forEach(match => {
                    if (!match.result) return;

                    if (match.result === 'Team1Win') {
                        teamStats[match.team1Id].wins++;
                        teamStats[match.team2Id].losses++;
                    } else if (match.result === 'Team2Win') {
                        teamStats[match.team2Id].wins++;
                        teamStats[match.team1Id].losses++;
                    } else if (match.result === 'Draw') {
                        teamStats[match.team1Id].draws++;
                        teamStats[match.team2Id].draws++;
                    }
                });
            }

            // Update player stats based on team performance
            record.teams.forEach(team => {
                const teamStat = teamStats[team.id];
                team.members.forEach(member => {
                    if (stats[member.id]) {
                        stats[member.id].gamesPlayed++;
                        stats[member.id].wins += teamStat.wins;
                        stats[member.id].losses += teamStat.losses;
                        stats[member.id].draws += teamStat.draws;
                    }
                });
            });
        });

        // Calculate derived stats
        Object.values(stats).forEach(stat => {
            const totalMatches = stat.wins + stat.losses + stat.draws;
            if (totalMatches > 0) {
                stat.winRate = (stat.wins / totalMatches) * 100;
            }
        });

        return Object.values(stats);
    }, [members, history]);

    const sortedPlayerStats = useMemo(() => {
        const sorted = [...playerStats].sort((a, b) => {
            let comparison = 0;

            if (sortField === 'name') {
                // Korean alphabetical order
                comparison = a.name.localeCompare(b.name, 'ko');
            } else {
                // Numeric comparison
                comparison = a[sortField] - b[sortField];
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [playerStats, sortField, sortDirection]);

    const teamMatchHistory = useMemo(() => {
        const matches: Array<{
            date: string;
            teams: Array<{ name: string; color: string; wins: number; draws: number; losses: number; members: string[] }>;
        }> = [];

        history.forEach(record => {
            // Calculate team stats from matches
            const teamStats: Record<string, { wins: number; draws: number; losses: number }> = {};
            record.teams.forEach(team => {
                teamStats[team.id] = { wins: 0, draws: 0, losses: 0 };
            });

            if (record.matches) {
                record.matches.forEach(match => {
                    if (!match.result) return;

                    if (match.result === 'Team1Win') {
                        teamStats[match.team1Id].wins++;
                        teamStats[match.team2Id].losses++;
                    } else if (match.result === 'Team2Win') {
                        teamStats[match.team2Id].wins++;
                        teamStats[match.team1Id].losses++;
                    } else if (match.result === 'Draw') {
                        teamStats[match.team1Id].draws++;
                        teamStats[match.team2Id].draws++;
                    }
                });
            }

            matches.push({
                date: new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                teams: record.teams.map(team => ({
                    name: team.name,
                    color: team.color,
                    wins: teamStats[team.id]?.wins || 0,
                    draws: teamStats[team.id]?.draws || 0,
                    losses: teamStats[team.id]?.losses || 0,
                    members: team.members.map(m => m.name)
                }))
            });
        });

        return matches.slice(0, 10); // Show last 10 matches
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>아직 경기 기록이 없습니다. 팀을 생성하고 경기를 진행해보세요!</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Player Statistics */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>선수 통계</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                <th
                                    onClick={() => handleSort('name')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        color: sortField === 'name' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    선수명 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => handleSort('gamesPlayed')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: sortField === 'gamesPlayed' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    경기수 {sortField === 'gamesPlayed' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => handleSort('wins')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: sortField === 'wins' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    승 {sortField === 'wins' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => handleSort('losses')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: sortField === 'losses' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    패 {sortField === 'losses' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => handleSort('draws')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: sortField === 'draws' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    무 {sortField === 'draws' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => handleSort('winRate')}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: sortField === 'winRate' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    승률 {sortField === 'winRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayerStats.map((stat) => (
                                <tr key={stat.memberId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{stat.name}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{stat.gamesPlayed}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-success)' }}>{stat.wins}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-danger)' }}>{stat.losses}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-warning)' }}>{stat.draws}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: stat.winRate >= 50 ? 'var(--color-accent-primary)' : 'inherit' }}>
                                        {stat.gamesPlayed > 0 ? `${stat.winRate.toFixed(1)}%` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Match History */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>최근 매치 히스토리</h2>
                {teamMatchHistory.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)' }}>최근 경기 기록이 없습니다.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {teamMatchHistory.map((match, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ marginBottom: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                    {match.date}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                    {match.teams.map((team, tidx) => (
                                        <div key={tidx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid ' + getColorHex(team.color) }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{team.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                    {team.wins}승 {team.draws}무 {team.losses}패
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                {team.members.join(', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getColorHex(color: string): string {
    const colorMap: Record<string, string> = {
        'White': '#FFFFFF',
        'Black': '#333333',
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Yellow': '#FBBF24',
        'Green': '#10B981'
    };
    return colorMap[color] || '#FFFFFF';
}
