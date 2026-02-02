import { unstable_cache } from 'next/cache';

import * as storage from './storage';
import type { Club } from './types';

// Cache TTL (seconds). Keep short to avoid stale UX, but long enough to reduce DB round-trips.
const DEFAULT_REVALIDATE_SECONDS = Number(process.env.NEXT_PUBLIC_CACHE_TTL_SECONDS ?? 60);

export const getClubCached = async (id: string): Promise<Club | undefined> => {
  const fn = unstable_cache(
    async () => {
      // storage.getClub은 DB 에러 시 throw하고, 클럽이 없을 때만 undefined 반환
      // throw된 에러는 캐시되지 않음
      return storage.getClub(id);
    },
    [`club:${id}`],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: [`club:${id}`],
    }
  );

  return fn();
};

export const getClubsCached = async (): Promise<Club[]> => {
  const fn = unstable_cache(
    async () => storage.getClubs(),
    ['clubs:list'],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: ['clubs:list'],
    }
  );

  return fn();
};

// Re-export non-cached mutating functions to keep imports simple in server actions.
export const {
  getUserByUsername,
  createUser,
  addClub,
  updateClub,
  deleteClub,
  addMember,
  updateMember,
  deleteMember,
  updateMemberSortOrders,
  saveHistory,
  deleteHistory,
  updateHistoryDate,
  replaceMatchResults,
} = storage;
