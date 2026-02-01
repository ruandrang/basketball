'use client';

import { HistoryRecord, TeamColor, Match } from '@/lib/types';
import { useState, useMemo } from 'react';
import { updateMatchResult } from '@/app/actions/results';
import { deleteHistory, updateHistoryDate } from '@/app/actions/history';
import ShareImageButton from '@/components/ShareImageButton';
import ShareCard from '@/components/ShareCard';

export default function HistoryList({ history, clubId, clubName }: { history: HistoryRecord[], clubId: string, clubName: string }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [matchResults, setMatchResults] = useState<Record<string, 'Team1Win' | 'Team2Win' | 'Draw'>>({});
    const [editingMatches, setEditingMatches] = useState<Match[]>([]);
    const [newMatchPair, setNewMatchPair] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [editingDateId, setEditingDateId] = useState<string | null>(null);
    const [dateDraft, setDateDraft] = useState<string>('');
    const [isUpdatingDate, setIsUpdatingDate] = useState(false);

    const toggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const startEditing = (record: HistoryRecord) => {
        setEditingId(record.id);
        const initialResults: Record<string, 'Team1Win' | 'Team2Win' | 'Draw'> = {};

        // Initialize matches if they don't exist
        const matches = record.matches || generateMatches(record.teams);
        setEditingMatches(matches);
        // default pair selector
        if (record.teams.length === 3) {
            setNewMatchPair(`${record.teams[0].id}|${record.teams[1].id}`);
        } else {
            setNewMatchPair('');
        }

        matches.forEach(match => {
            initialResults[match.id] = match.result || 'Draw';
        });
        setMatchResults(initialResults);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setMatchResults({});
        setEditingMatches([]);
        setNewMatchPair('');
    };

    const startEditingDate = (record: HistoryRecord) => {
        setEditingDateId(record.id);
        setDateDraft(toYmd(record.date));
    };

    const cancelEditingDate = () => {
        setEditingDateId(null);
        setDateDraft('');
    };

    const saveDate = async (recordId: string) => {
        if (!dateDraft) {
            alert('날짜를 선택해주세요.');
            return;
        }
        setIsUpdatingDate(true);
        try {
            await updateHistoryDate(clubId, recordId, dateDraft);
            setEditingDateId(null);
        } catch (e) {
            console.error(e);
            alert('날짜 변경에 실패했습니다.');
        } finally {
            setIsUpdatingDate(false);
        }
    };

    const saveResults = async (recordId: string) => {
        const record = history.find(r => r.id === recordId);
        if (!record) return;

        setIsSubmitting(true);
        try {
            const matches = editingMatches.map(match => ({
                ...match,
                result: matchResults[match.id] || 'Draw'
            }));

            await updateMatchResult(clubId, recordId, matches);
            setEditingId(null);
            setMatchResults({});
            setEditingMatches([]);
            setNewMatchPair('');
        } catch (e) {
            console.error(e);
            alert('저장 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (recordId: string) => {
        if (!confirm('이 팀 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setDeletingId(recordId);
        try {
            await deleteHistory(clubId, recordId);
        } catch (e) {
            console.error(e);
            alert('삭제 실패했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    if (history.length === 0) {
        return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>기록이 없습니다. 팀을 생성해보세요!</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {history.map(record => {
                const date = formatKoreanDate(record.date);
                const isExpanded = expandedId === record.id;
                const isEditing = editingId === record.id;
                const matches = record.matches || generateMatches(record.teams);
                const editingList = isEditing ? editingMatches : matches;
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
                                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => startEditing(record)}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            {hasResults ? '경기 결과 수정' : '경기 결과 입력'}
                                        </button>

                                        <ShareImageButton
                                            targetId={`share-${record.id}`}
                                            filename={`${clubName}-${toYmd(record.date)}.png`}
                                            label="이미지 저장"
                                        />

                                        {editingDateId === record.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="date"
                                                    value={dateDraft}
                                                    onChange={(e) => setDateDraft(e.target.value)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'var(--color-bg-primary)',
                                                        color: 'white'
                                                    }}
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => saveDate(record.id)}
                                                    disabled={isUpdatingDate}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    {isUpdatingDate ? '저장 중...' : '날짜 저장'}
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={cancelEditingDate}
                                                    disabled={isUpdatingDate}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => startEditingDate(record)}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                날짜 수정
                                            </button>
                                        )}

                                        <button
                                            className="btn"
                                            onClick={() => handleDelete(record.id)}
                                            disabled={deletingId === record.id}
                                            style={{
                                                fontSize: '0.85rem',
                                                background: '#DC2626',
                                                border: '2px solid #EF4444',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                opacity: deletingId === record.id ? 0.5 : 1,
                                                cursor: deletingId === record.id ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (deletingId !== record.id) {
                                                    e.currentTarget.style.background = '#B91C1C';
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (deletingId !== record.id) {
                                                    e.currentTarget.style.background = '#DC2626';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }}
                                        >
                                            {deletingId === record.id ? '삭제 중...' : '🗑️ 삭제'}
                                        </button>
                                    </div>
                                )}


                                {isEditing && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 107, 0, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent-primary)' }}>
                                        <h4 style={{ marginBottom: '1rem' }}>경기 결과 입력 (총 {editingList.length}경기)</h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                                            {editingList.map(match => {
                                                const team1 = record.teams.find(t => t.id === match.team1Id)!;
                                                const team2 = record.teams.find(t => t.id === match.team2Id)!;

                                                return (
                                                    <div key={match.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                <span style={{ width: '16px', height: '16px', backgroundColor: getColorHex(team1.color), borderRadius: '3px' }}></span>
                                                                <span style={{ fontWeight: 'bold' }}>{team1.name}</span>
                                                            </div>
                                                            <span style={{ color: 'var(--color-text-secondary)' }}>vs</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                <span style={{ width: '16px', height: '16px', backgroundColor: getColorHex(team2.color), borderRadius: '3px' }}></span>
                                                                <span style={{ fontWeight: 'bold' }}>{team2.name}</span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                disabled={editingList.length <= 1}
                                                                onClick={() => {
                                                                    // remove match
                                                                    setEditingMatches(prev => prev.filter(m => m.id !== match.id));
                                                                    setMatchResults(prev => {
                                                                        const next = { ...prev };
                                                                        delete next[match.id];
                                                                        return next;
                                                                    });
                                                                }}
                                                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                                                                title="경기 삭제"
                                                            >
                                                                삭제
                                                            </button>
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

                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            {record.teams.length === 3 ? (
                                                <>
                                                    <select
                                                        value={newMatchPair}
                                                        onChange={(e) => setNewMatchPair(e.target.value)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid var(--color-border)',
                                                            background: 'var(--color-bg-primary)',
                                                            color: 'white',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {[
                                                            [record.teams[0], record.teams[1]],
                                                            [record.teams[0], record.teams[2]],
                                                            [record.teams[1], record.teams[2]],
                                                        ].map(([a, b]) => (
                                                            <option key={`${a.id}|${b.id}`} value={`${a.id}|${b.id}`}>
                                                                {a.name} vs {b.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            const [aId, bId] = newMatchPair.split('|');
                                                            const id = crypto.randomUUID();
                                                            setEditingMatches(prev => [...prev, { id, team1Id: aId, team2Id: bId }]);
                                                            setMatchResults(prev => ({ ...prev, [id]: 'Draw' }));
                                                        }}
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        + 경기 추가
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        const id = crypto.randomUUID();
                                                        setEditingMatches(prev => [...prev, { id, team1Id: record.teams[0].id, team2Id: record.teams[1].id }]);
                                                        setMatchResults(prev => ({ ...prev, [id]: 'Draw' }));
                                                    }}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    + 경기 추가
                                                </button>
                                            )}
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

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div
                                      id={`share-${record.id}`}
                                      style={{
                                        width: 600,
                                        maxWidth: '100%',
                                        margin: '0 auto',
                                        padding: 12,
                                        boxSizing: 'border-box',
                                        overflow: 'visible',
                                      }}
                                    >
                                        <ShareCard record={record} clubName={clubName} />
                                    </div>
                                </div>

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

// Generate matches skeleton (2-team or 3-team)
function generateMatches(teams: any[]): Match[] {
    if (teams.length === 2) {
        return [{ id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[1].id }];
    }

    if (teams.length === 3) {
        return [
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[1].id },
            { id: crypto.randomUUID(), team1Id: teams[0].id, team2Id: teams[2].id },
            { id: crypto.randomUUID(), team1Id: teams[1].id, team2Id: teams[2].id },
        ];
    }

    return [];
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

function formatKoreanDate(dateIso: string) {
    // 요일까지만 (시간 제거)
    return new Date(dateIso).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function toYmd(dateIso: string): string {
    const d = new Date(dateIso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
