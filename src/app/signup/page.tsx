import { signup } from '@/app/actions/auth';

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>회원가입</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          새 계정을 만들어 클럽을 관리하세요
        </p>

        {error && (
          <div
            className="card"
            style={{
              borderColor: 'rgba(255, 107, 107, 0.35)',
              background: 'rgba(255, 107, 107, 0.08)',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              아이디
            </label>
            <input
              name="username"
              autoComplete="username"
              required
              placeholder="영문, 숫자, 언더스코어 (최소 3자)"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'white',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              비밀번호
            </label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="최소 4자"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'white',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              표시이름
            </label>
            <input
              name="displayName"
              autoComplete="name"
              required
              placeholder="다른 사용자에게 표시될 이름 (최소 2자)"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'white',
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            가입하기
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          이미 계정이 있으신가요?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            로그인
          </a>
        </div>
      </div>
    </main>
  );
}
