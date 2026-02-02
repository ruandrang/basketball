'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('전역 에러:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--gray-50)',
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '400px',
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--gray-900)' }}>
                    문제가 발생했습니다
                </h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                    일시적인 오류일 수 있습니다. 잠시 후 다시 시도해주세요.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
        </div>
    );
}
