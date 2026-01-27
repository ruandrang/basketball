import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL 또는 Key가 누락되었습니다. 환경 변수를 확인해주세요.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
