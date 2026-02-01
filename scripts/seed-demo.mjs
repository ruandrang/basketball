#!/usr/bin/env node
/**
 * Seed demo data:
 * - 1 club
 * - 40 members
 * - 20 events(history_records)
 * - teams + team_members
 * - multiple matches per event
 * - (attendance removed)
 *
 * Usage:
 *   DATABASE_URL=... node scripts/seed-demo.mjs
 */

import pg from 'pg';
import crypto from 'crypto';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const CLUB_NAME = 'Demo Basketball Club';

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ymdPlus(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() - daysFromToday);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function makeMemberName(i) {
  const first = ['민수', '지훈', '서준', '도윤', '예준', '하준', '지우', '서연', '하은', '수아', '지민', '현우', '준호', '유진', '채원'];
  const last = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서'];
  return `${pick(last)}${pick(first)}${i}`;
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log('[seed] connected');

  // wipe existing data
  console.log('[seed] wiping existing data...');
  await client.query('TRUNCATE TABLE matches, team_members, teams, history_records, members, clubs RESTART IDENTITY CASCADE');

  const clubId = crypto.randomUUID();
  await client.query('INSERT INTO clubs (id, name) VALUES ($1, $2)', [clubId, CLUB_NAME]);

  // create members
  console.log('[seed] creating members...');
  const memberIds = [];

  // position distribution: ensure enough centers
  const positionsPool = [];
  // 8 centers, 8 PF, 8 SF, 8 SG, 8 PG
  for (const p of POSITIONS) {
    for (let i = 0; i < 8; i++) positionsPool.push(p);
  }

  const positions = shuffle(positionsPool);

  for (let i = 1; i <= 40; i++) {
    const id = crypto.randomUUID();
    memberIds.push(id);

    const name = makeMemberName(i);
    const age = randInt(18, 45);
    const height = randInt(165, 205);
    const position = positions[i - 1];
    const number = i; // unique jersey #

    await client.query(
      'INSERT INTO members (id, club_id, name, age, height, position, number) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, clubId, name, age, height, position, number]
    );
  }

  console.log('[seed] creating events + teams + matches...');

  // 20 events
  for (let e = 0; e < 20; e++) {
    const historyId = crypto.randomUUID();
    const ymd = ymdPlus(20 - e);
    const dateIso = `${ymd}T00:00:00+09:00`;

    await client.query('INSERT INTO history_records (id, club_id, date) VALUES ($1,$2,$3)', [historyId, clubId, dateIso]);

    // attendees: pick 12~20 members for teams
    const attendees = shuffle(memberIds).slice(0, randInt(12, 20));

    // 2 teams for seeded demo (fits your default 5:5)
    const teamAId = crypto.randomUUID();
    const teamBId = crypto.randomUUID();

    await client.query(
      'INSERT INTO teams (id, history_id, name, color, average_height, team_order) VALUES ($1,$2,$3,$4,$5,$6)',
      [teamAId, historyId, '팀 White', 'White', 0, 0]
    );
    await client.query(
      'INSERT INTO teams (id, history_id, name, color, average_height, team_order) VALUES ($1,$2,$3,$4,$5,$6)',
      [teamBId, historyId, '팀 Black', 'Black', 0, 1]
    );

    // team split (try to put 1 center each if possible)
    const attMembers = attendees;
    const centers = attMembers.filter((id) => true); // placeholder, we'll fetch positions quickly

    // Fetch member positions for attendees
    const rows = await client.query('SELECT id, position, height FROM members WHERE id = ANY($1::uuid[])', [attMembers]);
    const byPos = {
      C: [],
      PF: [],
      SF: [],
      SG: [],
      PG: [],
    };
    const heightMap = new Map();
    for (const r of rows.rows) {
      heightMap.set(r.id, Number(r.height) || 0);
      if (byPos[r.position]) byPos[r.position].push(r.id);
      else byPos.SF.push(r.id);
    }

    const teamA = [];
    const teamB = [];

    const c1 = byPos.C.pop();
    const c2 = byPos.C.pop();
    if (c1) teamA.push(c1);
    if (c2) teamB.push(c2);

    const rest = shuffle([
      ...byPos.PG,
      ...byPos.SG,
      ...byPos.SF,
      ...byPos.PF,
      ...byPos.C,
    ]);

    // alternate fill
    for (let i = 0; i < rest.length; i++) {
      (i % 2 === 0 ? teamA : teamB).push(rest[i]);
    }

    // write team_members
    for (const mid of teamA) {
      await client.query('INSERT INTO team_members (team_id, member_id) VALUES ($1,$2)', [teamAId, mid]);
    }
    for (const mid of teamB) {
      await client.query('INSERT INTO team_members (team_id, member_id) VALUES ($1,$2)', [teamBId, mid]);
    }

    // compute avg height
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, id) => s + (heightMap.get(id) || 0), 0) / arr.length) : 0);
    await client.query('UPDATE teams SET average_height = $1 WHERE id = $2', [avg(teamA), teamAId]);
    await client.query('UPDATE teams SET average_height = $1 WHERE id = $2', [avg(teamB), teamBId]);

    // matches: 1~3 games per event
    const matchCount = randInt(1, 3);
    for (let m = 0; m < matchCount; m++) {
      const matchId = crypto.randomUUID();
      const result = pick(['Team1Win', 'Team2Win', 'Draw']);
      await client.query(
        'INSERT INTO matches (id, history_id, team1_id, team2_id, result) VALUES ($1,$2,$3,$4,$5)',
        [matchId, historyId, teamAId, teamBId, result]
      );
    }
  }

  console.log('[seed] done. clubId=', clubId);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
