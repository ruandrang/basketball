'use client';

import { Member } from '@/lib/types';
import MemberItem from './MemberItem';
import MemberForm from './MemberForm';
import { useState } from 'react';

interface MemberManagementProps {
    clubId: string;
    members: Member[];
}

export default function MemberManagement({ clubId, members }: MemberManagementProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>멤버 관리</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>총 {members.length}명 등록됨</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + 멤버 추가
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {members.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>등록된 멤버가 없습니다.</p>
                    </div>
                ) : (
                    members.map(member => (
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
