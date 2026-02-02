import { getClubsCached as getClubs } from '@/lib/cached-storage';
import { createClub } from '@/app/actions/club';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import CreateClubForm from '@/components/CreateClubForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const allClubs = await getClubs();
  // Admin sees all clubs, regular users see only their clubs
  const clubs = currentUser.isAdmin
    ? allClubs
    : allClubs.filter(club => club.ownerId && club.ownerId === currentUser.id);

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              농구 동호회 팀관리 프로그램 ver 0.2 Beta
            </h1>
            <p style={{ color: 'var(--color-accent-gold)', fontSize: '1.1rem', fontWeight: '500' }}>
              아직은 베타 테스트중이니 마음껏 사용해 보세요
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>
                {currentUser.displayName}
                {currentUser.isAdmin && ' (관리자)'}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                @{currentUser.username}
              </div>
            </div>
            <form action={logout}>
              <button type="submit" className="btn btn-secondary">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>내 클럽 (My Clubs)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {clubs.map(club => (
            <a key={club.id} href={`/clubs/${club.id}/dashboard`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                transition: 'all 0.2s',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏀</div>
                <h3 style={{ textAlign: 'center' }}>{club.name}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>멤버: {club.members.length}명</p>
              </div>
            </a>
          ))}

          {/* Create New Club Card */}
          <div className="card" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderStyle: 'dashed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <CreateClubForm action={createClub} />
          </div>
        </div>
      </div>
    </main>
  );
}
