import Link from 'next/link';
import { login } from '@/app/actions/auth';
import styles from './page.module.css';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const error = sp.error === '1';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🏀</span>
            <span className={styles.logoText}>Basketball Manager</span>
          </div>

          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>
            계정에 로그인하여 클럽을 관리하세요
          </p>

          {error && (
            <div className={styles.error}>
              아이디 또는 비밀번호가 올바르지 않습니다.
            </div>
          )}

          <form action={login} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>아이디</label>
              <input
                name="id"
                autoComplete="username"
                required
                className="input"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호</label>
              <input
                name="pw"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              로그인
            </button>
          </form>

          <div className={styles.footer}>
            계정이 없으신가요?{' '}
            <Link href="/signup" className={styles.link}>
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
