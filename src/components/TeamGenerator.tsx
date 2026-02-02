'use client';

import { HistoryRecord, Member, Team, TeamColor } from '@/lib/types';
import { generateTeams } from '@/lib/generator';
import { saveTeamHistory } from '@/app/actions/history';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { POSITIONS, Position } from '@/lib/positions';
import { computeWinStatsForMembers, computeParticipationForMembers } from '@/lib/member-stats';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface TeamGeneratorProps {
    clubId: string;
    allMembers: Member[];
    history: HistoryRecord[];
}

const TEAM_COLORS: TeamColor[] = ['White', 'Black', 'Red', 'Blue', 'Yellow', 'Green'];

export default function TeamGenerator({ clubId, allMembers, history }: TeamGeneratorProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [teamCount, setTeamCount] = useState<2 | 3>(3);
    const [teamColors2, setTeamColors2] = useState<[TeamColor, TeamColor]>(['White', 'Black']);
    const [teamColors3, setTeamColors3] = useState<[TeamColor, TeamColor, TeamColor]>(['White', 'Black', 'Red']);
    const [generatedTeams, setGeneratedTeams] = useState<Team[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sortBy, setSortBy] = useState<'default' | 'positionAsc' | 'positionDesc' | 'winRateDesc' | 'winRateAsc' | 'participationDesc' | 'participationAsc'>('default');

    // dnd-kit (works on mobile)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
    );
    const [activeId, setActiveId] = useState<string | null>(null);

    const totalSelectedMembers = useMemo(() => {
        return allMembers.filter(m => selectedIds.has(m.id));
    }, [allMembers, selectedIds]);

    const winStatsMap = useMemo(() => computeWinStatsForMembers(history), [history]);
    const participationMap = useMemo(() => computeParticipationForMembers(history), [history]);

    const sortedMembers = useMemo(() => {
        const members = [...allMembers];
        const posIndex = new Map<Position, number>(POSITIONS.map((p, i) => [p as Position, i]));

        if (sortBy === 'positionAsc' || sortBy === 'positionDesc') {
            return members.sort((a, b) => {
                const ai = posIndex.get(a.position as Position) ?? 999;
                const bi = posIndex.get(b.position as Position) ?? 999;
                if (ai !== bi) return sortBy === 'positionAsc' ? ai - bi : bi - ai;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        if (sortBy === 'winRateDesc' || sortBy === 'winRateAsc') {
            return members.sort((a, b) => {
                const ar = winStatsMap[a.id]?.winRate ?? -1;
                const br = winStatsMap[b.id]?.winRate ?? -1;
                if (ar !== br) return sortBy === 'winRateDesc' ? br - ar : ar - br;
                const ag = winStatsMap[a.id]?.games ?? 0;
                const bg = winStatsMap[b.id]?.games ?? 0;
                if (ag !== bg) return bg - ag;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        if (sortBy === 'participationDesc' || sortBy === 'participationAsc') {
            return members.sort((a, b) => {
                const ar = participationMap[a.id]?.participationRate ?? -1;
                const br = participationMap[b.id]?.participationRate ?? -1;
                if (ar !== br) return sortBy === 'participationDesc' ? br - ar : ar - br;
                const ap = participationMap[a.id]?.eventsPlayed ?? 0;
                const bp = participationMap[b.id]?.eventsPlayed ?? 0;
                if (ap !== bp) return bp - ap;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        // default
        return members;
    }, [allMembers, sortBy, winStatsMap, participationMap]);

    const MAX_SELECTED = 18;

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                return next;
            }
            if (next.size >= MAX_SELECTED) {
                alert(`최대 ${MAX_SELECTED}명까지만 선택할 수 있어요.`);
                return prev;
            }
            next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        const ids = sortedMembers.slice(0, MAX_SELECTED).map(m => m.id);
        setSelectedIds(new Set(ids));
    };

    const handleClearAll = () => {
        setSelectedIds(new Set());
    };

    const selectedCount = selectedIds.size;

    const handleGenerate = () => {
        if (selectedCount < 2) {
            alert('최소 2명의 플레이어를 선택해주세요.');
            return;
        }

        const colors = teamCount === 2 ? teamColors2 : teamColors3;

        // 룰 안내(센터 배치)
        const centers = totalSelectedMembers.filter(m => m.position === 'C').length;
        if (centers < teamCount) {
            const ok = confirm(`센터(C)가 팀 수(${teamCount})보다 적습니다.\n\n센터 1명씩 배치 규칙을 만족하기 어려울 수 있어요.\n그래도 생성할까요?`);
            if (!ok) return;
        }

        const teams = generateTeams(totalSelectedMembers, [...colors], history, teamCount);
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
        const recomputeAvg = (team: Team) => {
            const total = team.members.reduce((sum, mm) => sum + mm.height, 0);
            team.averageHeight = team.members.length ? Math.round(total / team.members.length) : 0;
        };

        const findTeamIdByItem = (teams: Team[], id: string): string | null => {
            // droppable container id
            if (teams.some(t => t.id === id)) return id;
            // item id
            for (const t of teams) {
                if (t.members.some(m => m.id === id)) return t.id;
            }
            return null;
        };

        const handleDragStart = (event: DragStartEvent) => {
            setActiveId(String(event.active.id));
        };

        const handleDragOver = (event: DragOverEvent) => {
            const { active, over } = event;
            if (!over) return;

            const activeItemId = String(active.id);
            const overId = String(over.id);

            setGeneratedTeams(prev => {
                if (!prev) return prev;

                const fromTeamId = findTeamIdByItem(prev, activeItemId);
                const toTeamId = findTeamIdByItem(prev, overId);
                if (!fromTeamId || !toTeamId) return prev;
                if (fromTeamId === toTeamId) return prev;

                const next = prev.map(t => ({ ...t, members: [...t.members] }));
                const fromTeam = next.find(t => t.id === fromTeamId)!;
                const toTeam = next.find(t => t.id === toTeamId)!;

                const fromIndex = fromTeam.members.findIndex(m => m.id === activeItemId);
                if (fromIndex === -1) return prev;

                const overIndex = toTeam.members.findIndex(m => m.id === overId);
                const insertIndex = overIndex === -1 ? toTeam.members.length : overIndex;

                const [moved] = fromTeam.members.splice(fromIndex, 1);
                toTeam.members.splice(insertIndex, 0, moved);

                recomputeAvg(fromTeam);
                recomputeAvg(toTeam);

                return next;
            });
        };

        const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);
            if (!over) return;

            const activeItemId = String(active.id);
            const overId = String(over.id);

            setGeneratedTeams(prev => {
                if (!prev) return prev;

                const teamId = findTeamIdByItem(prev, activeItemId);
                const overTeamId = findTeamIdByItem(prev, overId);
                if (!teamId || !overTeamId) return prev;
                if (teamId !== overTeamId) return prev; // cross-team already handled in onDragOver

                const next = prev.map(t => ({ ...t, members: [...t.members] }));
                const team = next.find(t => t.id === teamId)!;

                const oldIndex = team.members.findIndex(m => m.id === activeItemId);
                const newIndex = team.members.findIndex(m => m.id === overId);
                if (oldIndex === -1 || newIndex === -1) return prev;

                team.members = arrayMove(team.members, oldIndex, newIndex);
                recomputeAvg(team);
                return next;
            });
        };

        const activeMember = activeId
            ? generatedTeams.flatMap(t => t.members).find(m => m.id === activeId)
            : undefined;

        return (
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>생성된 팀</h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                            멤버를 <strong style={{ color: 'white' }}>드래그</strong>해서 팀 이동/순서 변경할 수 있어요. (모바일 터치 지원)
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

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {generatedTeams.map(team => (
                            <TeamColumn key={team.id} team={team} />
                        ))}
                    </div>

                    {/* lightweight overlay */}
                    {activeMember ? (
                        <div
                            style={{
                                position: 'fixed',
                                left: '-9999px',
                                top: '-9999px'
                            }}
                        />
                    ) : null}
                </DndContext>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>플레이어 선택</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        선택됨: <strong style={{ color: selectedCount === 18 ? 'var(--color-success)' : 'var(--gray-900)' }}>{selectedCount}</strong> / 18
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" type="button" onClick={handleSelectAll}>
                        전체 선택(18명)
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={handleClearAll}>
                        전체 해제
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="select"
                        style={{ width: 'auto' }}
                    >
                        <option value="default">기본 순서</option>
                        <option value="positionAsc">포지션별 (PG→C)</option>
                        <option value="positionDesc">포지션별 (C→PG)</option>
                        <option value="winRateDesc">승률 높은 순</option>
                        <option value="winRateAsc">승률 낮은 순</option>
                        <option value="participationDesc">참석률 높은 순</option>
                        <option value="participationAsc">참석률 낮은 순</option>
                    </select>
                </div>
            </div>

            {/* Team Count + Color Selection */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>팀 설정</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            기본은 5:5(2팀) 기준. 인원에 따라 팀당 인원은 자동 분배돼요.
                        </p>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>팀 수</label>
                        <select
                            value={teamCount}
                            onChange={(e) => setTeamCount(Number(e.target.value) as 2 | 3)}
                            className="select"
                            style={{ width: 'auto' }}
                        >
                            <option value={3}>3팀 (기본)</option>
                            <option value={2}>2팀</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>팀 색상 선택</h3>

                    {teamCount === 2 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {[0, 1].map(idx => (
                                <div key={idx}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                        팀 {idx + 1}
                                    </label>
                                    <select
                                        value={teamColors2[idx]}
                                        onChange={(e) => {
                                            const newColors: [TeamColor, TeamColor] = [...teamColors2] as [TeamColor, TeamColor];
                                            newColors[idx] = e.target.value as TeamColor;
                                            setTeamColors2(newColors);
                                        }}
                                        className="select"
                                    >
                                        {/* 2팀일 때 기본은 White/Black, 선택은 전체 6색 허용 */}
                                        {TEAM_COLORS.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        height: '30px',
                                        backgroundColor: getColorHex(teamColors2[idx]),
                                        borderRadius: 'var(--radius-sm)',
                                        border: '2px solid var(--color-border)'
                                    }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[0, 1, 2].map(idx => (
                                <div key={idx}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                        팀 {idx + 1}
                                    </label>
                                    <select
                                        value={teamColors3[idx]}
                                        onChange={(e) => {
                                            const newColors: [TeamColor, TeamColor, TeamColor] = [...teamColors3] as [TeamColor, TeamColor, TeamColor];
                                            newColors[idx] = e.target.value as TeamColor;
                                            setTeamColors3(newColors);
                                        }}
                                        className="select"
                                    >
                                        {TEAM_COLORS.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        height: '30px',
                                        backgroundColor: getColorHex(teamColors3[idx]),
                                        borderRadius: 'var(--radius-sm)',
                                        border: '2px solid var(--color-border)'
                                    }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {sortedMembers.map(member => (
                    <div
                        key={member.id}
                        className="card"
                        onClick={() => toggleSelection(member.id)}
                        style={{
                            cursor: 'pointer',
                            borderColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'var(--color-border)',
                            backgroundColor: selectedIds.has(member.id) ? 'rgba(255, 107, 0, 0.1)' : 'var(--color-bg-card)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}
                    >
                        {/* 상단: 이름 #등번호 + 선택 체크박스 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {member.name}{' '}
                                <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>#{member.number}</span>
                            </div>
                            <div style={{
                                width: '24px', height: '24px',
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                backgroundColor: selectedIds.has(member.id) ? 'var(--color-accent-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {selectedIds.has(member.id) && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                            </div>
                        </div>
                        {/* 하단: 키, 포지션 */}
                        <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            <span>{member.height}cm</span>
                            <span>•</span>
                            <span>{member.position}</span>
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
        'Black': '#333333',
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Yellow': '#FBBF24',
        'Green': '#10B981'
    };
    return colorMap[color];
}

function TeamColumn({ team }: { team: Team }) {
    const { setNodeRef, isOver } = useDroppable({ id: team.id });
    const memberIds = team.members.map(m => m.id);

    return (
        <div
            ref={setNodeRef}
            className="card"
            style={{
                borderColor: getColorHex(team.color),
                outline: isOver ? '2px solid var(--color-accent-primary)' : 'none',
                outlineOffset: '2px'
            }}
        >
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '20px', height: '20px', backgroundColor: getColorHex(team.color), borderRadius: '4px', border: '2px solid white' }} />
                {team.name}{' '}
                <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)', marginTop: '4px', marginLeft: 'auto' }}>
                    평균: {team.averageHeight}cm
                </span>
            </h2>

            <SortableContext items={memberIds} strategy={verticalListSortingStrategy}>
                <ul style={{ listStyle: 'none' }}>
                    {team.members.map(m => (
                        <SortableMemberRow key={m.id} member={m} />
                    ))}
                </ul>
            </SortableContext>
        </div>
    );
}

function SortableMemberRow({ member }: { member: Member }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? 'rgba(255, 107, 0, 0.12)' : 'transparent',
        borderRadius: '6px',
        // Important on iOS Safari: prevent scroll hijacking while dragging
        touchAction: 'none'
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>☰</span>
                <span>
                    {member.name}{' '}
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>#{member.number}</span>
                </span>
            </span>
            <span style={{ fontSize: '0.9em', color: 'var(--color-accent-gold)' }}>{member.position}</span>
        </li>
    );
}
