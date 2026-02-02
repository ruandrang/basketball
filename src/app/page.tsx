import Link from 'next/link';
import { getClubsCached as getClubs } from '@/lib/cached-storage';
import { createClub } from '@/app/actions/club';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import CreateClubForm from '@/components/CreateClubForm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const allClubs = await getClubs();

  const clubs = currentUser.isAdmin
    ? allClubs
    : allClubs.filter(club => club.ownerId && club.ownerId === currentUser.id);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🏀</span>
            <span className={styles.logoText}>Basketball Manager</span>
          </Link>

          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {currentUser.displayName}
                {currentUser.isAdmin && <span className={styles.adminBadge}>관리자</span>}
              </div>
              <div className={styles.userHandle}>@{currentUser.username}</div>
            </div>
            <form action={logout}>
              <button type="submit" className="btn btn-secondary btn-sm">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Hero Section */}
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              농구 클럽을 쉽게 관리하세요
            </h1>
            <p className={styles.heroSubtitle}>
              멤버 관리, 팀 밸런싱, 경기 기록까지 한 곳에서
            </p>
          </div>

          {/* Clubs Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>내 클럽</h2>
              <span className={styles.clubCount}>{clubs.length}개</span>
            </div>

            <div className={styles.clubGrid}>
              {clubs.map(club => (
                <Link key={club.id} href={`/clubs/${club.id}/dashboard`} className={styles.clubCard}>
                  <div className={styles.clubIcon}>🏀</div>
                  <div className={styles.clubInfo}>
                    <h3 className={styles.clubName}>{club.name}</h3>
                    <p className={styles.clubMeta}>
                      멤버 {club.members.length}명 • 기록 {club.history.length}건
                    </p>
                  </div>
                  <span className={styles.clubArrow}>→</span>
                </Link>
              ))}

              {/* Create New Club Card */}
              <div className={styles.createCard}>
                <CreateClubForm action={createClub} />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h3>멤버 관리</h3>
              <p>멤버를 쉽게 추가하고 관리하세요. CSV로 가져오기/내보내기도 지원합니다.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚖️</div>
              <h3>자동 밸런싱</h3>
              <p>포지션과 승률을 고려한 자동 팀 밸런싱으로 공정한 경기를 만드세요.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>통계 분석</h3>
              <p>선수별 승률과 경기 기록을 한눈에 확인하세요.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Basketball Club Manager v0.3 Beta</p>
      </footer>
    </div>
  );
}
