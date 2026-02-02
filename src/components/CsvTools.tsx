'use client';

import { importMembers } from '@/app/actions/import';
import { Member } from '@/lib/types';
import { useState } from 'react';

interface CsvToolsProps {
    clubId: string;
    members: Member[];
}

export default function CsvTools({ clubId, members }: CsvToolsProps) {
    const [isImporting, setIsImporting] = useState(false);

    // Helper to download CSV
    const handleExport = () => {
        const headers = ['name,age,height,position,number'];
        const rows = members.map(m => `${m.name},${m.age},${m.height},${m.position},${m.number}`);
        const csvContent = headers.concat(rows).join('\n');

        // Add BOM for Excel compatibility with Korean characters
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `members_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('CSV 파일에서 멤버를 가져오시겠습니까? 기존 멤버 목록에 추가됩니다.')) {
            e.target.value = '';
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target?.result as string;
            try {
                await importMembers(clubId, text);
                alert('가져오기 성공!');
            } catch (err) {
                console.error(err);
                alert('가져오기 실패했습니다.');
            } finally {
                setIsImporting(false);
                e.target.value = ''; // Reset input
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: '0.9rem' }}>
                📥 CSV 내보내기
            </button>
            <label className="btn btn-secondary" style={{ fontSize: '0.9rem', cursor: isImporting ? 'wait' : 'pointer' }}>
                {isImporting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="spinner spinner-sm" aria-hidden />
                        가져오는 중...
                    </span>
                ) : '📤 CSV 가져오기'}
                <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} disabled={isImporting} />
            </label>
        </div>
    );
}
