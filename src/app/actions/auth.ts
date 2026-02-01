'use server'

import { redirect } from 'next/navigation';
import { clearAuthedCookie, setAuthedCookie, validateDevCredentials } from '@/lib/auth';

export async function login(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const pw = String(formData.get('pw') ?? '');

  if (!validateDevCredentials(id, pw)) {
    // 간단 처리: 쿼리로 에러 표시
    redirect('/login?error=1');
  }

  await setAuthedCookie();
  redirect('/');
}

export async function logout() {
  await clearAuthedCookie();
  redirect('/login');
}
