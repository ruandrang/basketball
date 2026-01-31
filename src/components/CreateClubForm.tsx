'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={pending}>
      {pending ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="spinner spinner-sm" aria-hidden />
          생성 중...
        </span>
      ) : (
        '생성'
      )}
    </button>
  );
}

export default function CreateClubForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem' }}>
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
      <SubmitButton />
    </form>
  );
}
