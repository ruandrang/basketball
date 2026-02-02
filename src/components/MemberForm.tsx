'use client';

import { addMember, updateMember } from '@/app/actions';
import { Member } from '@/lib/types';
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
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{initialData ? '멤버 수정' : '새 멤버 등록'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form action={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">이름</label>
                            <input
                                name="name"
                                defaultValue={initialData?.name}
                                required
                                className="input"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">나이</label>
                                <input
                                    name="age"
                                    type="number"
                                    defaultValue={initialData?.age}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">등번호</label>
                                <input
                                    name="number"
                                    type="number"
                                    defaultValue={initialData?.number}
                                    required
                                    className="input"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">키 (cm)</label>
                                <input
                                    name="height"
                                    type="number"
                                    defaultValue={initialData?.height}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">포지션</label>
                                <select
                                    name="position"
                                    defaultValue={initialData?.position || 'SF'}
                                    className="select"
                                >
                                    <option value="PG">포인트 가드 (PG)</option>
                                    <option value="SG">슈팅 가드 (SG)</option>
                                    <option value="SF">스몰 포워드 (SF)</option>
                                    <option value="PF">파워 포워드 (PF)</option>
                                    <option value="C">센터 (C)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            취소
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="spinner spinner-sm" aria-hidden />
                                    저장 중...
                                </span>
                            ) : (initialData ? '수정' : '등록')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
