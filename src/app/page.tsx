import { getClubs } from '@/lib/storage';
import { createClub } from '@/app/actions/club';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const clubs = await getClubs();

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        농구 팀 생성기
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
      {/* Migration Tool - Hidden by default or for admin use */}
      {clubs.length > 0 && (
        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            기존 로컬 데이터를 데이터베이스로 이전하시겠습니까?
          </p>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              if (confirm('로컬 데이터를 Supabase로 이전하시겠습니까?')) {
                const { migrateToSupabase } = await import('@/app/actions/migration');
                const result = await migrateToSupabase();
                alert(result.message);
              }
            }}
          >
            데이터베이스로 마이그레이션 실행
          </button>
        </div>
      )}
    </main>
  );
}
