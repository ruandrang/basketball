export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABEL_KO: Record<Position, string> = {
  PG: '포인트 가드',
  SG: '슈팅 가드',
  SF: '스몰 포워드',
  PF: '파워 포워드',
  C: '센터',
};
