export default function LoadingIndicator({ label = '로딩 중...' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div className="spinner" aria-label={label} />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{label}</p>
    </div>
  );
}
