# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Basketball Club Manager - A Next.js web application for managing basketball clubs, generating balanced teams, recording match results, and tracking player statistics. UI is fully localized in Korean.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (via pg), dnd-kit (drag-drop), Vanilla CSS

**Deployment:** Render (Web Service + PostgreSQL)

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
- `src/app/actions/` - Server actions for data mutations (`'use server'`)
- `src/components/` - React components (client-side interactive UI)
- `src/lib/` - Shared utilities and business logic
  - `types.ts` - Core TypeScript interfaces (Member, Team, Match, HistoryRecord, Club)
  - `storage.ts` - PostgreSQL data persistence layer
  - `generator.ts` - Team balancing algorithm
  - `db.ts` - PostgreSQL connection pool

### Data Flow Pattern

1. **Server pages** (`page.tsx`) fetch data via `storage.ts` functions
2. Data passed as props to **client components** (`'use client'`)
3. User interactions trigger **server actions** (`src/app/actions/`)
4. Server actions call `storage.ts` for PostgreSQL operations
5. `revalidatePath()` refreshes affected pages

### Team Generation Algorithm (`src/lib/generator.ts`)

Generates 3 balanced teams of 6 members each:
- Distributes by position (Guard/Forward/Center)
- Balances by win-rate (for players with ≥5 games)
- Uses round-robin distribution to smallest teams

### Database Schema

```
clubs (1)
  ├── members (*) [club_id]
  └── history_records (*) [club_id]
        ├── teams (*) [history_id]
        │   └── team_members (*) [team_id, member_id]
        └── matches (*) [history_id, team1_id, team2_id]
```

All foreign keys use `ON DELETE CASCADE`.

See `scripts/init-db.sql` for complete schema.

### Route Structure

- `/` - Home (clubs list)
- `/clubs/[id]/dashboard` - Club overview
- `/clubs/[id]/members` - Member management
- `/clubs/[id]/generate` - Team generation
- `/clubs/[id]/history` - Match history
- `/clubs/[id]/stats` - Player statistics

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Deployment (Render)

1. Create a new Web Service connected to this repository
2. Create a PostgreSQL database
3. Set `DATABASE_URL` environment variable
4. Run `scripts/init-db.sql` to initialize database schema
5. Deploy with `render.yaml` blueprint

## Conventions

- Server actions always call `revalidatePath()` after mutations
- Club pages use `export const dynamic = 'force-dynamic'` for fresh data
- Dates stored with `+09:00` offset (KST timezone)
- CSV files use UTF-8 BOM for Korean character compatibility
