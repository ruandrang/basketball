'use client';

import { useState } from 'react';

export default function MigrationButton() {
    const [isMigrating, setIsMigrating] = useState(false);

    const handleMigration = async () => {
        if (!confirm('로컬 데이터를 Supabase로 이전하시겠습니까?')) {
            return;
        }

        setIsMigrating(true);
        try {
            const { migrateToSupabase } = await import('@/app/actions/migration');
            const result = await migrateToSupabase();
            alert(result.message);
            window.location.reload(); // Refresh to show migrated data
        } catch (error) {
            console.error('마이그레이션 오류:', error);
            alert('마이그레이션 중 오류가 발생했습니다.');
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                기존 로컬 데이터를 데이터베이스로 이전하시겠습니까?
            </p>
            <button
                className="btn btn-secondary"
                onClick={handleMigration}
                disabled={isMigrating}
            >
                {isMigrating ? '마이그레이션 중...' : '데이터베이스로 마이그레이션 실행'}
            </button>
        </div>
    );
}
