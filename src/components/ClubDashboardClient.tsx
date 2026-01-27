'use client';

import { useState } from 'react';
import { updateClubName } from '@/app/actions/club';

interface ClubDashboardClientProps {
    clubId: string;
    clubName: string;
    memberCount: number;
    historyCount: number;
}

export default function ClubDashboardClient({ clubId, clubName, memberCount, historyCount }: ClubDashboardClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(clubName);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('클럽 이름을 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            await updateClubName(clubId, name);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert('저장 실패했습니다.');
        } finally {
            setIsSubmitting(false);
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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSubmitting} style={{ fontSize: '0.9rem' }}>
                                {isSubmitting ? '저장 중...' : '저장'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setIsEditing(false);
                                setName(clubName);
                            }} disabled={isSubmitting} style={{ fontSize: '0.9rem' }}>
                                취소
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                                {clubName}
                            </h1>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(true)}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                                ✏️ 이름 수정
                            </button>
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
                    <a href={`/clubs/${clubId}/generate`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
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
