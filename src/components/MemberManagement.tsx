'use client';

import { Member } from '@/lib/types';
import MemberItem from './MemberItem';
import MemberForm from './MemberForm';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { reorderMembers } from '@/app/actions';
import { POSITIONS, Position } from '@/lib/positions';
import { computeParticipationForMembers, computeWinStatsForMembers } from '@/lib/member-stats';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MemberManagementProps {
    clubId: string;
    members: Member[];
    history: import('@/lib/types').HistoryRecord[];
}

export default function MemberManagement({ clubId, members, history }: MemberManagementProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const [sortMode, setSortMode] = useState<'custom' | 'positionAsc' | 'positionDesc' | 'winRateDesc' | 'winRateAsc' | 'participationDesc' | 'participationAsc'>('custom');
    const [customOrder, setCustomOrder] = useState<string[]>(() => members.map(m => m.id));
    const [isReordering, setIsReordering] = useState(false);

    const handleAdd = () => {
        setEditingMember(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingMember(undefined);
    };

    const membersById = useMemo(() => {
        const map = new Map<string, Member>();
        for (const m of members) map.set(m.id, m);
        return map;
    }, [members]);

    const winStatsMap = useMemo(() => computeWinStatsForMembers(history), [history]);
    const participationMap = useMemo(() => computeParticipationForMembers(history), [history]);

    const sortedMembers = useMemo(() => {
        const posIndex = new Map<Position, number>(POSITIONS.map((p, i) => [p as Position, i]));

        if (sortMode === 'positionAsc' || sortMode === 'positionDesc') {
            return [...members].sort((a, b) => {
                const ai = posIndex.get(a.position as Position) ?? 999;
                const bi = posIndex.get(b.position as Position) ?? 999;
                if (ai !== bi) return sortMode === 'positionAsc' ? ai - bi : bi - ai;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        if (sortMode === 'winRateDesc' || sortMode === 'winRateAsc') {
            return [...members].sort((a, b) => {
                const ar = winStatsMap[a.id]?.winRate ?? -1;
                const br = winStatsMap[b.id]?.winRate ?? -1;
                if (ar !== br) return sortMode === 'winRateDesc' ? br - ar : ar - br;
                const ag = winStatsMap[a.id]?.games ?? 0;
                const bg = winStatsMap[b.id]?.games ?? 0;
                if (ag !== bg) return bg - ag;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        if (sortMode === 'participationDesc' || sortMode === 'participationAsc') {
            return [...members].sort((a, b) => {
                const ar = participationMap[a.id]?.participationRate ?? -1;
                const br = participationMap[b.id]?.participationRate ?? -1;
                if (ar !== br) return sortMode === 'participationDesc' ? br - ar : ar - br;
                const ap = participationMap[a.id]?.eventsPlayed ?? 0;
                const bp = participationMap[b.id]?.eventsPlayed ?? 0;
                if (ap !== bp) return bp - ap;
                return (a.number ?? 0) - (b.number ?? 0);
            });
        }

        // custom order
        const ordered: Member[] = [];
        for (const id of customOrder) {
            const m = membersById.get(id);
            if (m) ordered.push(m);
        }
        // add any new members not in customOrder
        for (const m of members) {
            if (!customOrder.includes(m.id)) ordered.push(m);
        }
        return ordered;
    }, [members, membersById, customOrder, sortMode, winStatsMap, participationMap]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;
        if (sortMode !== 'custom') return;

        const ids = sortedMembers.map(m => m.id);
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const next = arrayMove(ids, oldIndex, newIndex);
        setCustomOrder(next);

        // persist (best-effort)
        setIsReordering(true);
        try {
            await reorderMembers(clubId, next);
        } catch (e) {
            console.error(e);
            alert('순서 저장에 실패했습니다.');
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>멤버 관리</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>총 {members.length}명 등록됨</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>정렬</label>
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value as any)}
                            style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-primary)',
                                color: 'white',
                            }}
                        >
                            <option value="custom">사용자 지정(드래그)</option>
                            <option value="positionAsc">포지션별 (PG→C)</option>
                            <option value="positionDesc">포지션별 (C→PG)</option>
                            <option value="winRateDesc">승률 높은 순</option>
                            <option value="winRateAsc">승률 낮은 순</option>
                            <option value="participationDesc">참석률(참여율) 높은 순</option>
                            <option value="participationAsc">참석률(참여율) 낮은 순</option>
                        </select>
                        {sortMode === 'custom' && isReordering && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>저장 중...</div>
                        )}
                    </div>

                    <button className="btn btn-primary" onClick={handleAdd}>
                        + 멤버 추가
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
                }}
            >
                {members.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>등록된 멤버가 없습니다.</p>
                    </div>
                ) : sortMode === 'custom' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sortedMembers.map(m => m.id)} strategy={rectSortingStrategy}>
                            {sortedMembers.map(member => (
                                <SortableMemberCard key={member.id} id={member.id}>
                                    <MemberItem clubId={clubId} member={member} onEdit={handleEdit} />
                                </SortableMemberCard>
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    sortedMembers.map(member => (
                        <MemberItem key={member.id} clubId={clubId} member={member} onEdit={handleEdit} />
                    ))
                )}
            </div>

            {isFormOpen && (
                <MemberForm clubId={clubId} initialData={editingMember} onClose={handleClose} />
            )}
        </div>
    );
}

function SortableMemberCard({ id, children }: { id: string; children: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

