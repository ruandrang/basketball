'use client';

import { Member } from '@/lib/types';
import { deleteMember } from '@/app/actions';
import { useState } from 'react';

interface MemberItemProps {
    clubId: string;
    member: Member;
    onEdit: (member: Member) => void;
}

export default function MemberItem({ clubId, member, onEdit }: MemberItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (confirm('정말로 이 멤버를 삭제하시겠습니까?')) {
            setIsDeleting(true);
            await deleteMember(clubId, member.id);
            setIsDeleting(false);
        }
    }

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ minWidth: 0 }}>
                    <h3 style={{ marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}{' '}
                        <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>#{member.number}</span>
                    </h3>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={badgeStyle()}>{member.position}</span>
                        <span style={badgeStyle()}>{member.height}cm</span>
                        <span style={badgeStyle()}>{member.age}세</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => onEdit(member)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}
                    >
                        수정
                    </button>
                    <button
                        className="btn"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-error)',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.875rem',
                            border: '1px solid transparent'
                        }}
                    >
                        {isDeleting ? '...' : '삭제'}
                    </button>
                </div>
            </div>

            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <span>등번호</span>
                    <strong style={{ color: 'white' }}>#{member.number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span>포지션</span>
                    <strong style={{ color: 'white' }}>{member.position}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span>키 / 나이</span>
                    <strong style={{ color: 'white' }}>{member.height}cm · {member.age}세</strong>
                </div>
            </div>
        </div>
    );
}

function badgeStyle(): React.CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.5rem',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.05)',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.8rem',
        lineHeight: 1.2,
    };
}
