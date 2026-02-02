'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateClubName, deleteClub } from '@/app/actions/club';
import { HistoryRecord } from '@/lib/types';
import HistoryList from '@/components/HistoryList';
import styles from './ClubDashboardClient.module.css';

interface ClubDashboardClientProps {
    clubId: string;
    clubName: string;
    memberCount: number;
    history: HistoryRecord[];
}

export default function ClubDashboardClient({ clubId, clubName, memberCount, history }: ClubDashboardClientProps) {
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

    // Calculate stats
    const totalMatches = history.reduce((acc, record) => acc + (record.matches?.length || 0), 0);
    const thisMonthHistory = history.filter(record => {
        const date = new Date(record.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    {isEditing ? (
                        <div className={styles.editForm}>
                            <input
                                className={`input ${styles.editInput}`}
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={isSaving}>
                                취소
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className={styles.title}>{clubName}</h1>
                            <div className={styles.headerActions}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                                    이름 수정
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? '삭제 중...' : '클럽 삭제'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>👥</div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>총 멤버</div>
                        <div className={styles.statValue}>{memberCount}명</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>📋</div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>총 기록</div>
                        <div className={styles.statValue}>{history.length}건</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconWarning}`}>🏀</div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>총 경기</div>
                        <div className={styles.statValue}>{totalMatches}경기</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconInfo}`}>📅</div>
                    <div className={styles.statContent}>
                        <div className={styles.statLabel}>이번 달</div>
                        <div className={styles.statValue}>{thisMonthHistory.length}회</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>빠른 작업</h2>
                <div className={styles.quickActions}>
                    <Link href={`/clubs/${clubId}/generate`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>👕</div>
                        <div className={styles.actionContent}>
                            <h3>팀 생성하기</h3>
                            <p>멤버를 선택하고 균형 잡힌 팀을 만들어보세요</p>
                        </div>
                        <span className={styles.actionArrow}>→</span>
                    </Link>

                    <Link href={`/clubs/${clubId}/members`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>👥</div>
                        <div className={styles.actionContent}>
                            <h3>멤버 관리</h3>
                            <p>멤버를 추가, 수정, 삭제하세요</p>
                        </div>
                        <span className={styles.actionArrow}>→</span>
                    </Link>

                    <Link href={`/clubs/${clubId}/stats`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>📊</div>
                        <div className={styles.actionContent}>
                            <h3>통계 보기</h3>
                            <p>선수별 성적과 승률을 확인하세요</p>
                        </div>
                        <span className={styles.actionArrow}>→</span>
                    </Link>
                </div>
            </div>

            {/* Recent History */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>이전 기록</h2>
                    {history.length > 0 && (
                        <Link href={`/clubs/${clubId}/history`} className={styles.viewAllLink}>
                            전체 보기 →
                        </Link>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📭</div>
                        <h3>기록이 없습니다</h3>
                        <p>팀을 생성해 보세요.</p>
                        <Link href={`/clubs/${clubId}/generate`} className="btn btn-primary">
                            팀 생성하기
                        </Link>
                    </div>
                ) : (
                    <HistoryList
                        history={history.slice(0, 5)}
                        clubId={clubId}
                        clubName={clubName}
                    />
                )}
            </div>
        </div>
    );
}
