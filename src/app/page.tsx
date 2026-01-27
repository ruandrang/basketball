import { getClubs } from '@/lib/storage';
import { createClub } from '@/app/actions/club';
import MigrationButton from '@/components/MigrationButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const clubs = await getClubs();

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        농구 동호회 팀관리 프로그램 ver 0.2 Beta
      </h1>

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
            <form action={createClub} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem' }}>
              <h3>새 클럽 만들기</h3>
              <input
                name="name"
                placeholder="클럽 이름 입력"
                required
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-primary)',
                  color: 'white',
                  width: '100%'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>생성</button>
            </form>
          </div>
        </div>
      </div>
      {/* Migration Tool */}
      {clubs.length > 0 && <MigrationButton />}
    </main>
  );
}
