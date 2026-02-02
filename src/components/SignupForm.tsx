'use client';

import { useFormStatus } from 'react-dom';
import { signup } from '@/app/actions/auth';

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
                    가입 중...
                </span>
            ) : (
                '가입하기'
            )}
        </button>
    );
}

interface SignupFormProps {
    error?: string | null;
}

export default function SignupForm({ error }: SignupFormProps) {
    return (
        <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)' }}>
                    아이디
                </label>
                <input
                    name="username"
                    autoComplete="username"
                    required
                    className="input"
                    placeholder="영문, 숫자, 언더스코어 (최소 3자)"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)' }}>
                    비밀번호
                </label>
                <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input"
                    placeholder="최소 4자"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)' }}>
                    표시이름
                </label>
                <input
                    name="displayName"
                    autoComplete="name"
                    required
                    className="input"
                    placeholder="다른 사용자에게 표시될 이름 (최소 2자)"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
