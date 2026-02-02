'use client';

import { useMemo, useState } from 'react';

export default function HistoryJsonTools({ clubId }: { clubId: string }) {
  const exportUrl = useMemo(() => `/api/clubs/${clubId}/history-export`, [clubId]);

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setResult('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/clubs/${clubId}/history-import`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Import failed');
      }
      setResult(`가져오기 완료: 기록 ${json.summary.insertedRecords}건, 팀 ${json.summary.insertedTeams}개, 경기 ${json.summary.insertedMatches}개`);
    } catch (e: any) {
      console.error(e);
      setResult(`가져오기 실패: ${e.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>경기 기록 가져오기/내보내기 (JSON)</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        - Export: 이 클럽의 기록(팀/경기)을 JSON 1개 파일로 다운로드
        <br />
        - Import: JSON 1개 파일 업로드로 기록을 추가(기존 DB 유지)
        <br />
        - 데모 데이터: 40명의 멤버와 10개의 경기 기록이 포함된 샘플 데이터
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <a className="btn btn-secondary" href={exportUrl}>
          기록 Export (JSON)
        </a>

        <a className="btn btn-secondary" href="/demo-data.json" download="demo-data.json">
          데모 데이터 다운로드
        </a>

        <input
          type="file"
          accept="application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button className="btn btn-primary" onClick={upload} disabled={busy || !file}>
          {busy ? '업로드 중...' : '기록 Import'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)' }}>{result}</div>
      )}

      <div style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
        * Import 시 DB에 없는 멤버는 Guest1, Guest2…로 자동 생성됩니다.
      </div>
    </div>
  );
}
