'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateClubName, deleteClub } from '@/app/actions/club';

interface ClubDashboardClientProps {
    clubId: string;
    clubName: string;
    memberCount: number;
    historyCount: number;
}

export default function ClubDashboardClient({ clubId, clubName, memberCount, historyCount }: ClubDashboardClientProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(clubName);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        if (!editedName.trim()) {
            alert('클럽 이름을 입력해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            await updateClubName(clubId, editedName);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert('저장 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedName(clubName);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm(`정말로 "${clubName}" 클럽을 삭제하시겠습니까?\n\n모든 멤버, 팀 기록, 경기 결과가 영구적으로 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteClub(clubId);
            router.push('/');
        } catch (e) {
            console.error(e);
            alert('삭제 실패했습니다.');
            setIsDeleting(false);
        }
    };

    return (
        <main className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem' }}>🏀</div>
                <div style={{ flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    background: 'var(--color-bg-primary)',
                                    border: '2px solid var(--color-accent-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.25rem 0.5rem',
                                    color: 'white',
                                    flex: 1
                                }}
                                autoFocus
                            />
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ fontSize: '0.9rem' }}>
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancel} disabled={isSaving} style={{ fontSize: '0.9rem' }}>
                                취소
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                                {clubName}
                            </h1>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    ✏️ 이름 수정
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    style={{
                                        fontSize: '0.85rem',
                                        padding: '0.5rem 1rem',
                                        background: '#DC2626',
                                        border: '2px solid #EF4444',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        opacity: isDeleting ? 0.5 : 1,
                                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDeleting) {
                                            e.currentTarget.style.background = '#B91C1C';
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDeleting) {
                                            e.currentTarget.style.background = '#DC2626';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    {isDeleting ? '삭제 중...' : '🗑️ 클럽 삭제'}
                                </button>
                            </div>
                        </div>
                    )}
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        멤버 {memberCount}명 • 기록 {historyCount}건
                    </p>
                </div>
            </div>

            <div className="card">
                <h2>대시보드</h2>
                <p>원하는 작업을 선택하세요.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <a href={`/clubs/${clubId}/attendance`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        출첵 (Attendance)
                    </a>
                    <a href={`/clubs/${clubId}/generate`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        팀 생성하기 (Generate)
                    </a>
                    <a href={`/clubs/${clubId}/members`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        멤버 관리 (Members)
                    </a>
                    <a href={`/clubs/${clubId}/history`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        기록 보기 (History)
                    </a>
                    <a href={`/clubs/${clubId}/stats`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        통계 (Statistics)
                    </a>
                </div>
            </div>
        </main>
    );
}
