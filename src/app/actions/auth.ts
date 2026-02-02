'use server'

import { redirect } from 'next/navigation';
import {
  clearUserCookie,
  setUserCookie,
  validatePassword,
  validateUsername,
  validateDisplayName,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';
import { getUserByUsername, createUser } from '@/lib/cached-storage';

const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function login(formData: FormData) {
  const username = String(formData.get('id') ?? '').trim();
  const password = String(formData.get('pw') ?? '');

  if (!username || !password) {
    redirect('/login?error=1');
  }

  const user = await getUserByUsername(username);
  if (!user) {
    redirect('/login?error=1');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect('/login?error=1');
  }

  await setUserCookie({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    isAdmin: user.username.toLowerCase() === 'admin',
  });

  redirect('/');
}

export async function signup(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    redirect(`/signup?error=${encodeURIComponent(usernameValidation.error!)}`);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    redirect(`/signup?error=${encodeURIComponent(passwordValidation.error!)}`);
  }

  const displayNameValidation = validateDisplayName(displayName);
  if (!displayNameValidation.valid) {
    redirect(`/signup?error=${encodeURIComponent(displayNameValidation.error!)}`);
  }

  // Check if username already exists
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    redirect('/signup?error=' + encodeURIComponent('이미 사용 중인 아이디입니다.'));
  }

  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  await createUser(userId, username, passwordHash, displayName);

  await setUserCookie({
    id: userId,
    username,
    displayName,
    isAdmin: false,
  });

  redirect('/');
}

export async function logout() {
  await clearUserCookie();
  redirect('/login');
}
