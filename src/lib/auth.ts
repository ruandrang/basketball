import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';
import type { User } from './types';

const COOKIE_NAME = 'bb_user';

export interface AuthUser extends User {
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const userCookie = jar.get(COOKIE_NAME)?.value;
  if (!userCookie) return null;

  try {
    const user: AuthUser = JSON.parse(userCookie);
    return user;
  } catch {
    return null;
  }
}

export async function isAuthed(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function setUserCookie(user: AuthUser): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearUserCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 4) {
    return { valid: false, error: '비밀번호는 최소 4자 이상이어야 합니다.' };
  }
  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: '아이디는 최소 3자 이상이어야 합니다.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: '아이디는 영문, 숫자, 언더스코어만 사용할 수 있습니다.' };
  }
  return { valid: true };
}

export function validateDisplayName(displayName: string): { valid: boolean; error?: string } {
  if (displayName.length < 2) {
    return { valid: false, error: '표시이름은 최소 2자 이상이어야 합니다.' };
  }
  return { valid: true };
}

export async function checkClubAccess(clubOwnerId: string | undefined): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;

  // Admin has access to all clubs
  if (currentUser.isAdmin) return true;

  // Regular users can only access their own clubs
  return clubOwnerId === currentUser.id;
}
