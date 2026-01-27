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
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{member.name} <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>#{member.number}</span></h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    {member.position} • {member.height}cm • {member.age}세
                </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => onEdit(member)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                    수정
                </button>
                <button
                    className="btn"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-error)',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid transparent'
                    }}
                >
                    {isDeleting ? '...' : '삭제'}
                </button>
            </div>
        </div>
    );
}
