import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * IMPORTANT
 * - Browser/client-side에서 쓸 키: anon key
 * - Server-side(서버 액션/서버 컴포넌트)에서 쓸 키: 가능하면 service role key
 *
 * Vercel에는 아래를 설정하는 것을 권장:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (server only)
 *
 * (호환) 기존 NEXT_PUBLIC_SUPABASE_* 도 읽습니다.
 */

function getEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, anonKey, serviceRoleKey };
}

export function createSupabaseServerClient(): SupabaseClient {
  const { url, anonKey, serviceRoleKey } = getEnv();
  if (!url) throw new Error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  const key = serviceRoleKey || anonKey;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY');

  // 서버에서는 세션 저장 불필요
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getEnv();
  if (!url) throw new Error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  if (!anonKey) throw new Error('Missing SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  return createClient(url, anonKey);
}
