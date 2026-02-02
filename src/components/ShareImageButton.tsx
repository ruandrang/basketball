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

    // Temporarily force the *real* element to a fixed width, render it,
    // capture, then restore. This avoids clone/offscreen rendering quirks that
    // can produce a blank (black) image.
    const FIXED_WIDTH = 600;

    const prev = {
      width: (el as HTMLElement).style.width,
      maxWidth: (el as HTMLElement).style.maxWidth,
      overflow: (el as HTMLElement).style.overflow,
    };

    try {
      const node = el as HTMLElement;
      node.style.width = `${FIXED_WIDTH}px`;
      node.style.maxWidth = `${FIXED_WIDTH}px`;
      node.style.overflow = 'visible';

      // let layout settle
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const height = Math.ceil(Math.max(node.scrollHeight, node.getBoundingClientRect().height)) + 24;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0B0E13',
        width: FIXED_WIDTH,
        height,
      } as any);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (e) {
      console.error(e);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      const node = el as HTMLElement;
      node.style.width = prev.width;
      node.style.maxWidth = prev.maxWidth;
      node.style.overflow = prev.overflow;
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-secondary" onClick={download} disabled={busy}>
      {busy ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="spinner spinner-sm" aria-hidden />
          생성 중...
        </span>
      ) : label}
    </button>
  );
}
