import Link from 'next/link';
import SignupForm from '@/components/SignupForm';
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

          <SignupForm error={error} />

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
