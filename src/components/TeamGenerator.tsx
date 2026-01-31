'use client';

import { Member, Team, TeamColor } from '@/lib/types';
import { generateTeams } from '@/lib/generator';
import { saveTeamHistory } from '@/app/actions/history';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamGeneratorProps {
    clubId: string;
    allMembers: Member[];
}

const TEAM_COLORS: TeamColor[] = ['White', 'Black', 'Red', 'Blue', 'Yellow', 'Green'];

export default function TeamGenerator({ clubId, allMembers }: TeamGeneratorProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [teamColors, setTeamColors] = useState<[TeamColor, TeamColor, TeamColor]>(['White', 'Black', 'Red']);
    const [generatedTeams, setGeneratedTeams] = useState<Team[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // drag state (for UI highlight only)
    const [dragging, setDragging] = useState<{ memberId: string; fromTeamId: string } | null>(null);
    const [dragOver, setDragOver] = useState<{ teamId: string; index: number | null } | null>(null);

    const totalSelectedMembers = useMemo(() => {
        return allMembers.filter(m => selectedIds.has(m.id));
    }, [allMembers, selectedIds]);

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const selectedCount = selectedIds.size;

    const handleGenerate = () => {
        if (selectedCount < 3) {
            alert('최소 3명의 플레이어를 선택해주세요.');
            return;
        }
        const teams = generateTeams(totalSelectedMembers, teamColors);
        setGeneratedTeams(teams);
    };

    const handleSave = async () => {
        if (!generatedTeams) return;
        setIsSaving(true);
        try {
            await saveTeamHistory(clubId, generatedTeams);
            router.push(`/clubs/${clubId}/history`);
        } catch (error) {
            console.error('저장 실패:', error);
            alert('팀 기록을 저장하는 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    if (generatedTeams) {
        const handleDragStart = (teamId: string, memberId: string) => {
            setDragging({ fromTeamId: teamId, memberId });
        };

        const handleDragEnd = () => {
            setDragging(null);
            setDragOver(null);
        };

        const handleDrop = (toTeamId: string, toIndex: number | null) => {
            if (!dragging) return;

            setGeneratedTeams(prev => {
                if (!prev) return prev;

                const { fromTeamId, memberId } = dragging;
                if (fromTeamId === toTeamId && toIndex === null) return prev;

                // clone
                const nextTeams = prev.map(t => ({ ...t, members: [...t.members] }));

                const fromTeam = nextTeams.find(t => t.id === fromTeamId);
                const toTeam = nextTeams.find(t => t.id === toTeamId);
                if (!fromTeam || !toTeam) return prev;

                const fromIdx = fromTeam.members.findIndex(m => m.id === memberId);
                if (fromIdx === -1) return prev;

                const [moved] = fromTeam.members.splice(fromIdx, 1);

                // If dropping within same team, adjust index after removal
                let insertIndex = toIndex ?? toTeam.members.length;
                if (fromTeamId === toTeamId && toIndex !== null) {
                    if (fromIdx < insertIndex) insertIndex -= 1;
                }
                insertIndex = Math.max(0, Math.min(insertIndex, toTeam.members.length));

                toTeam.members.splice(insertIndex, 0, moved);

                // recompute average heights for affected teams
                const recompute = (team: Team) => {
                    const total = team.members.reduce((sum, mm) => sum + mm.height, 0);
                    team.averageHeight = team.members.length ? Math.round(total / team.members.length) : 0;
                };
                recompute(fromTeam);
                if (toTeam !== fromTeam) recompute(toTeam);

                return nextTeams;
            });

            setDragOver(null);
        };

        return (
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>생성된 팀</h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                            멤버를 <strong style={{ color: 'white' }}>드래그</strong>해서 팀 이동/순서 변경할 수 있어요.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => setGeneratedTeams(null)}>
                            뒤로
                        </button>
                        <button className="btn btn-secondary" onClick={handleGenerate}>
                            재생성
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? '저장 중...' : '결과 저장'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {generatedTeams.map(team => (
                        <div
                            key={team.id}
                            className="card"
                            style={{
                                borderColor: getColorHex(team.color),
                                outline: dragOver?.teamId === team.id ? '2px solid var(--color-accent-primary)' : 'none',
                                outlineOffset: '2px'
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver({ teamId: team.id, index: null });
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleDrop(team.id, null);
                            }}
                        >
                            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '20px', height: '20px', backgroundColor: getColorHex(team.color), borderRadius: '4px', border: '2px solid white' }}></span>
                                {team.name}{' '}
                                <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)', marginTop: '4px', marginLeft: 'auto' }}>
                                    평균: {team.averageHeight}cm
                                </span>
                            </h2>
                            <ul style={{ listStyle: 'none' }}>
                                {team.members.map((m, idx) => {
                                    const isDragging = dragging?.memberId === m.id;
                                    const isOverHere = dragOver?.teamId === team.id && dragOver?.index === idx;

                                    return (
                                        <li
                                            key={m.id}
                                            draggable
                                            onDragStart={() => handleDragStart(team.id, m.id)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOver({ teamId: team.id, index: idx });
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                handleDrop(team.id, idx);
                                            }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.6rem 0.25rem',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                cursor: 'grab',
                                                opacity: isDragging ? 0.4 : 1,
                                                background: isOverHere ? 'rgba(255, 107, 0, 0.12)' : 'transparent',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>☰</span>
                                                <span>
                                                    {m.name}{' '}
                                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>#{m.number}</span>
                                                </span>
                                            </span>
                                            <span style={{ fontSize: '0.9em', color: 'var(--color-accent-gold)' }}>{m.position}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>플레이어 선택</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    선택됨: <strong style={{ color: selectedCount === 18 ? 'var(--color-success)' : 'white' }}>{selectedCount}</strong> / 18
                </p>
            </div>

            {/* Color Selection */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>팀 색상 선택</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[0, 1, 2].map(idx => (
                        <div key={idx}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                팀 {idx + 1}
                            </label>
                            <select
                                value={teamColors[idx]}
                                onChange={(e) => {
                                    const newColors: [TeamColor, TeamColor, TeamColor] = [...teamColors] as [TeamColor, TeamColor, TeamColor];
                                    newColors[idx] = e.target.value as TeamColor;
                                    setTeamColors(newColors);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-primary)',
                                    color: 'white'
                                }}
                            >
                                {TEAM_COLORS.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                            <div style={{
                                marginTop: '0.5rem',
                                height: '30px',
                                backgroundColor: getColorHex(teamColors[idx]),
                                borderRadius: 'var(--radius-sm)',
                                border: '2px solid var(--color-border)'
                            }}></div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {allMembers.map(member => (
                    <div
                        key={member.id}
                        className="card"
                        onClick={() => toggleSelection(member.id)}
                        style={{
                            cursor: 'pointer',
                            borderColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'var(--color-border)',
                            backgroundColor: selectedIds.has(member.id) ? 'rgba(255, 107, 0, 0.1)' : 'var(--color-bg-card)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{member.position}</div>
                            </div>
                            <div style={{
                                width: '24px', height: '24px',
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                backgroundColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {selectedIds.has(member.id) && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                >
                    팀 생성하기
                </button>
            </div>
        </div>
    );
}

function getColorHex(color: TeamColor): string {
    const colorMap: Record<TeamColor, string> = {
        'White': '#FFFFFF',
        'Black': '#000000',
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Yellow': '#FBBF24',
        'Green': '#10B981'
    };
    return colorMap[color];
}
