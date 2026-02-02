import Link from 'next/link';
import { signup } from '@/app/actions/auth';
import styles from '../login/page.module.css';

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🏀</span>
            <span className={styles.logoText}>Basketball Manager</span>
          </div>

          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>
            새 계정을 만들어 클럽을 관리하세요
          </p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form action={signup} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>아이디</label>
              <input
                name="username"
                autoComplete="username"
                required
                className="input"
                placeholder="영문, 숫자, 언더스코어 (최소 3자)"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호</label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder="최소 4자"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>표시이름</label>
              <input
                name="displayName"
                autoComplete="name"
                required
                className="input"
                placeholder="다른 사용자에게 표시될 이름 (최소 2자)"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              가입하기
            </button>
          </form>

          <div className={styles.footer}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className={styles.link}>
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
