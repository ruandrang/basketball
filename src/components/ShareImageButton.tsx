'use client';

import { toPng } from 'html-to-image';
import { useState } from 'react';

export default function ShareImageButton({
  targetId,
  filename,
  label = '이미지 저장',
}: {
  targetId: string;
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    const el = document.getElementById(targetId);
    if (!el) {
      alert('이미지로 저장할 영역을 찾을 수 없습니다.');
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0B0E13',
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (e) {
      console.error(e);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-secondary" onClick={download} disabled={busy}>
      {busy ? '생성 중...' : label}
    </button>
  );
}
