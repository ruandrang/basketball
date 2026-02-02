'use client';

import { useFormStatus } from 'react-dom';
import ClubIconPicker from '@/components/ClubIconPicker';
import { CLUB_ICON_FILES } from '@/lib/club-icons';

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
  const defaultIcon = CLUB_ICON_FILES[0];

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem' }}>
      <h3>새 클럽 만들기</h3>
      <input
        name="name"
        placeholder="클럽 이름 입력"
        required
        className="input"
        style={{ width: '100%' }}
      />

      <ClubIconPicker name="icon" defaultValue={defaultIcon} />

      <SubmitButton />
    </form>
  );
}
