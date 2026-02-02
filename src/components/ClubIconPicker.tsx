'use client';

import Image from 'next/image';
import styles from './ClubIconPicker.module.css';
import { CLUB_ICON_FILES } from '@/lib/club-icons';

export default function ClubIconPicker({
  name,
  value,
  defaultValue,
  onChange,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}) {
  const current = value ?? defaultValue;

  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <div className={styles.label}>클럽 아이콘</div>
        {current ? <div className={styles.hint}>선택됨: {current}</div> : <div className={styles.hint}>미선택</div>}
      </div>

      <div className={styles.grid}>
        {CLUB_ICON_FILES.map((file) => {
          const checked = current === file;
          return (
            <label key={file} className={checked ? `${styles.item} ${styles.itemActive}` : styles.item}>
              <input
                className={styles.radio}
                type="radio"
                name={name}
                value={file}
                defaultChecked={defaultValue === file}
                checked={value !== undefined ? checked : undefined}
                onChange={(e) => onChange?.(e.target.value)}
              />
              <div className={styles.thumb}>
                <Image src={`/club-icons/${file}`} alt={file} width={56} height={56} />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
