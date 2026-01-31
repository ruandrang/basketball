import LoadingIndicator from '@/components/LoadingIndicator';

export default function Loading() {
  return (
    <main className="container" style={{ padding: '3rem 0' }}>
      <LoadingIndicator label="데이터 불러오는 중..." />
    </main>
  );
}
