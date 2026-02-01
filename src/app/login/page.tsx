import { login } from '@/app/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const error = sp.error === '1';

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>로그인</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          개발용 임시 로그인 (admin / admin)
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
            아이디 또는 비밀번호가 올바르지 않습니다.
          </div>
        )}

        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>아이디</label>
            <input
              name="id"
              defaultValue="admin"
              autoComplete="username"
              required
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>비밀번호</label>
            <input
              name="pw"
              type="password"
              defaultValue="admin"
              autoComplete="current-password"
              required
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

          <button type="submit" className="btn btn-primary">로그인</button>
        </form>
      </div>
    </main>
  );
}
