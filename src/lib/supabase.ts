import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL과 Anon Key가 환경 변수에 설정되어 있지 않습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
