'use client';

import { Member } from '@/lib/types';
import { deleteMember } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MemberItemProps {
    clubId: string;
    member: Member;
    onEdit: (member: Member) => void;
}

export default function MemberItem({ clubId, member, onEdit }: MemberItemProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete(e?: React.MouseEvent) {
        e?.stopPropagation();
        if (confirm('정말로 이 멤버를 삭제하시겠습니까?')) {
            setIsDeleting(true);
            await deleteMember(clubId, member.id);
            setIsDeleting(false);
        }
    }

    return (
        <div
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/clubs/${clubId}/members/${member.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/clubs/${clubId}/members/${member.id}`);
                }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}
        >
            {/* 상단: 이름 #등번호 + 수정/삭제 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}{' '}
                    <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>#{member.number}</span>
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(member);
                        }}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}
                    >
                        수정
                    </button>
                    <button
                        className="btn"
                        onClick={(e) => handleDelete(e)}
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

            {/* 하단: 키, 포지션 */}
            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <span>{member.height}cm</span>
                <span>•</span>
                <span>{member.position}</span>
            </div>
        </div>
    );
}
