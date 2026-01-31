'use server'

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Member, Position } from '@/lib/types';

export async function importMembers(clubId: string, csvData: string) {
    const lines = csvData.trim().split('\n');
    // Expected headers: name,age,height,position,number

    const newMembersData = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',');

        // Basic validation
        if (values.length < 5) continue;

        newMembersData.push({
            id: crypto.randomUUID(),
            club_id: clubId,
            name: values[0].trim(),
            age: parseInt(values[1].trim()) || 0,
            height: parseInt(values[2].trim()) || 0,
            position: (values[3].trim() as Position) || 'Forward',
            number: parseInt(values[4].trim()) || 0,
        });
    }

    if (newMembersData.length > 0) {
        const supabase = createSupabaseServerClient();
        const { error } = await supabase
            .from('members')
            .insert(newMembersData);
        if (error) throw error;
    }

    revalidatePath(`/clubs/${clubId}/members`);
    revalidatePath(`/clubs/${clubId}/stats`);
}
