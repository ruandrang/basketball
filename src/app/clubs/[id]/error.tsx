'use client';

import { useEffect } from 'react';

export default function ClubError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('클럽 페이지 에러:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--gray-900)' }}>
                데이터를 불러오는 중 문제가 발생했습니다
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => reset()}
                    className="btn btn-primary"
                >
                    다시 시도
                </button>
                <a href="/" className="btn btn-secondary">
                    홈으로 이동
                </a>
            </div>
        </div>
    );
}
