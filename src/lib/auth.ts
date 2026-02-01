import { cookies } from 'next/headers';

const COOKIE_NAME = 'bb_auth';

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === '1';
}

export async function setAuthedCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearAuthedCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function validateDevCredentials(id: string, pw: string): boolean {
  // 개발 단계 고정 계정 (요청사항)
  // 배포/운영 시에는 환경변수나 실제 계정 시스템(NextAuth/Supabase 등)으로 교체.
  return id === 'admin' && pw === 'admin';
}
