'use client';

import { useState } from 'react';
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
  // Use internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

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
                checked={checked}
                onChange={(e) => handleChange(e.target.value)}
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
