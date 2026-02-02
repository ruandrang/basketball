import { unstable_cache } from 'next/cache';

import * as storage from './storage';
import type { Club } from './types';

// Cache TTL (seconds). Keep short to avoid stale UX, but long enough to reduce DB round-trips.
const DEFAULT_REVALIDATE_SECONDS = Number(process.env.NEXT_PUBLIC_CACHE_TTL_SECONDS ?? 60);

export const getClubCached = async (id: string): Promise<Club | undefined> => {
  const fn = unstable_cache(
    async () => storage.getClub(id),
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
  saveClubs,
} = storage;
