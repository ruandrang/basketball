'use client';

import { useFormStatus } from 'react-dom';
import { login } from '@/app/actions/auth';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={pending}
        >
            {pending ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner spinner-sm" aria-hidden />
                    로그인 중...
                </span>
            ) : (
                '로그인'
            )}
        </button>
    );
}

interface LoginFormProps {
    error?: boolean;
}

export default function LoginForm({ error }: LoginFormProps) {
    return (
        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                }}>
                    아이디 또는 비밀번호가 올바르지 않습니다.
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)' }}>
                    아이디
                </label>
                <input
                    name="id"
                    autoComplete="username"
                    required
                    className="input"
                    placeholder="아이디를 입력하세요"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)' }}>
                    비밀번호
                </label>
                <input
                    name="pw"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="input"
                    placeholder="비밀번호를 입력하세요"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
