import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
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

          <LoginForm error={error} />

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
