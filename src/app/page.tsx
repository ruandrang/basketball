import { getClubs } from '@/lib/storage';
import { createClub } from '@/app/actions/club';
import CreateClubForm from '@/components/CreateClubForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const clubs = await getClubs();

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          농구 동호회 팀관리 프로그램 ver 0.2 Beta
        </h1>
        <p style={{ color: 'var(--color-accent-gold)', fontSize: '1.1rem', fontWeight: '500' }}>
          아직은 베타 테스트중이니 마음껏 사용해 보세요
        </p>
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
