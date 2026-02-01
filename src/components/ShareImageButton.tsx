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
    let sandbox: HTMLDivElement | null = null;

    try {
      // 브라우저 폭/레이아웃에 영향을 받지 않게,
      // 고정 폭(980px)으로 offscreen에 클론을 만들어 그걸 캡처한다.
      const FIXED_WIDTH = 980;

      sandbox = document.createElement('div');
      // Put it at (0,0) so the browser definitely lays it out/paints it,
      // but make it invisible & non-interactive.
      sandbox.style.position = 'fixed';
      sandbox.style.left = '0';
      sandbox.style.top = '0';
      sandbox.style.width = `${FIXED_WIDTH}px`;
      sandbox.style.padding = '12px';
      sandbox.style.boxSizing = 'border-box';
      sandbox.style.background = '#0B0E13';
      sandbox.style.opacity = '0';
      sandbox.style.pointerEvents = 'none';
      sandbox.style.zIndex = '2147483647';

      const clone = el.cloneNode(true) as HTMLElement;
      // 고정 폭 강제 + overflow 방지
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      clone.style.overflow = 'visible';

      sandbox.appendChild(clone);
      document.body.appendChild(sandbox);

      // layout flush
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const height = Math.ceil(Math.max(sandbox.scrollHeight, clone.scrollHeight, clone.getBoundingClientRect().height)) + 12;

      const dataUrl = await toPng(sandbox, {
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
      if (sandbox) sandbox.remove();
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-secondary" onClick={download} disabled={busy}>
      {busy ? '생성 중...' : label}
    </button>
  );
}
