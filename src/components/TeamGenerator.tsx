'use client';

import { Member, Team, TeamColor } from '@/lib/types';
import { generateTeams } from '@/lib/generator';
import { saveTeamHistory } from '@/app/actions/history';
import { useState } from 'react';
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
        const selectedMembers = allMembers.filter(m => selectedIds.has(m.id));
        const teams = generateTeams(selectedMembers, teamColors);
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
        return (
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>생성된 팀</h1>
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
                        <div key={team.id} className="card" style={{ borderColor: getColorHex(team.color) }}>
                            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '20px', height: '20px', backgroundColor: getColorHex(team.color), borderRadius: '4px', border: '2px solid white' }}></span>
                                {team.name} <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)', float: 'right', marginTop: '4px' }}>평균: {team.averageHeight}cm</span>
                            </h2>
                            <ul style={{ listStyle: 'none' }}>
                                {team.members.map(m => (
                                    <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span>
                                            {m.name} <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>#{m.number}</span>
                                        </span>
                                        <span style={{ fontSize: '0.9em', color: 'var(--color-accent-gold)' }}>
                                            {m.position}
                                        </span>
                                    </li>
                                ))}
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
