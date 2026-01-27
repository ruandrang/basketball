'use client';

import { addMember, updateMember } from '@/app/actions';
import { Member, Position } from '@/lib/types';
import { useState } from 'react';

interface MemberFormProps {
    clubId: string;
    initialData?: Member;
    onClose: () => void;
}

export default function MemberForm({ clubId, initialData, onClose }: MemberFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            if (initialData) {
                await updateMember(clubId, initialData.id, formData);
            } else {
                await addMember(clubId, formData);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('저장 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>{initialData ? '멤버 수정' : '새 멤버 등록'}</h2>

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>이름</label>
                        <input
                            name="name"
                            defaultValue={initialData?.name}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>나이</label>
                            <input
                                name="age"
                                type="number"
                                defaultValue={initialData?.age}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>등번호</label>
                            <input
                                name="number"
                                type="number"
                                defaultValue={initialData?.number}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>키 (cm)</label>
                            <input
                                name="height"
                                type="number"
                                defaultValue={initialData?.height}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>포지션</label>
                            <select
                                name="position"
                                defaultValue={initialData?.position || 'Forward'}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'white' }}
                            >
                                <option value="Guard">가드 (Guard)</option>
                                <option value="Forward">포워드 (Forward)</option>
                                <option value="Center">센터 (Center)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                            {initialData ? '수정' : '등록'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
