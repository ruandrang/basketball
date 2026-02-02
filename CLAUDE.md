# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 작업할 때 참고하는 안내 문서입니다.

## 프로젝트 개요

Basketball Club Manager - 농구 클럽을 관리하고, 균형 잡힌 팀을 생성하고, 경기 결과를 기록하고, 선수 통계를 추적하는 Next.js 웹 애플리케이션입니다. UI는 한국어로 완전히 지역화되어 있습니다.

## 명령어

```bash
npm run dev        # 개발 서버 시작 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 실행
npm run seed:demo  # 데이터베이스에 데모 데이터 시드
npm start          # 프로덕션 시작 (ensure-schema.mjs 실행 후 서버 기동)
```

### Docker를 이용한 로컬 개발 환경

`docker-compose.yml`로 로컬 PostgreSQL 인스턴스를 제공합니다. 먼저 실행한 후 `npm run dev`를 실행하세요:

```bash
docker compose up -d          # localhost:5432에 postgres 시작
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/basketball_db npm run dev
```

컨테이너 초기 시작 시 `scripts/init-db.sql`이 init 스크립트로 마운트되어 스키마가 자동으로 적용됩니다. 프로덕션에서는 앱 시작 전에 `scripts/ensure-schema.mjs`가 동일한 SQL을 멱등적으로 실행합니다.

## 아키텍처

**기술 스택:** Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (via pg), dnd-kit (드래그·드롭), Vanilla CSS

**배포:** Render (Web Service + PostgreSQL)

### 주요 디렉토리

- `src/app/` - Next.js App Router 페이지 및 레이아웃
- `src/app/actions/` - 데이터 변경을 위한 서버 액션 (`'use server'`)
- `src/components/` - React 컴포넌트 (클라이언트 측 인터랙티브 UI)
- `src/lib/` - 공유 유틸리티 및 비즈니스 로직
  - `types.ts` - 핵심 TypeScript 인터페이스 (Member, Team, Match, HistoryRecord, Club)
  - `db.ts` - PostgreSQL 연결 풀 (SSL 자동 감지, 서버리스 최적화)
  - `storage.ts` - 원본 PostgreSQL 쿼리 (모든 엔티티의 CRUD)
  - `cached-storage.ts` - `storage.ts` 위의 캐싱 레이어 — [캐싱](#캐싱) 섹션 참조
  - `generator.ts` - 팀 균형 알고리즘
  - `member-stats.ts` - 선수별 승·패·참가율 통계 계산
  - `auth.ts` - 쿠키 기반 인증 헬퍼

### 데이터 흐름

1. **서버 페이지** (`page.tsx`)가 `cached-storage.ts`를 통해 캐시된 데이터를 조회
2. 데이터를 props로 **클라이언트 컴포넌트** (`'use client'`)에 전달
3. 사용자 상호작용이 **서버 액션** (`src/app/actions/`)을 트리거
4. 서버 액션이 `storage.ts`로 변경 수행, 이후 `updateTag()` + `revalidatePath()`로 캐시 무효화

### 캐싱

`cached-storage.ts`는 Next.js의 `unstable_cache`로 읽기 쿼리를 래핑합니다 (기본 TTL 60초, `NEXT_PUBLIC_CACHE_TTL_SECONDS` 환경 변수로 조정 가능). 캐시 태그는 `club:{id}`와 `clubs:list`입니다. 변경이 발생하면 서버 액션에서 `updateTag()`를 호출하여 해당 태그를 무효화한 후 `revalidatePath()`로 라우트를 갱신합니다. Next.js 16에서 `revalidateTag`는 `updateTag`로 이름이 변경되었습니다.

### 인증

`middleware.ts`가 `/_next`, `/favicon`, `/login`, `/api/admin` 경로를 제외한 모든 라우트에 쿠키 기반 인증을 적용합니다. 개발 환경 로그인 정보는 `admin` / `admin`입니다. 인증 상태는 단일 쿠키(`bb_auth=1`)로 관리되며 토큰 페이로드는 없습니다.

### 팀 생성 알고리즘 (`src/lib/generator.ts`)

선택된 선수 풀에서 2~3명의 균형 잡힌 팀을 생성합니다:
- 포지션별로 선수를 그룹화 (가드 / 포워드 /센터)
- 각 그룹 내에서 자격 충족 선수(5경기 이상)를 승률 내림차순으로 정렬
- 가장 작고 약한 팀에 라운드 로빈 방식으로 배분
- 배분 후 팀별 평균 키 계산

### 데이터베이스 스키마

```
clubs (1)
  ├── members (*) [club_id]
  └── history_records (*) [club_id]
        ├── teams (*) [history_id]
        │   └── team_members (*) [team_id, member_id]
        └── matches (*) [history_id, team1_id, team2_id]
```

모든 외래 키는 `ON DELETE CASCADE`를 사용합니다.

전체 스키마는 `scripts/init-db.sql`을 참조하세요.

### 라우트 구조

- `/` - 홈 (클럽 목록)
- `/clubs/[id]/dashboard` - 클럽 개요
- `/clubs/[id]/members` - 회원 관리
- `/clubs/[id]/generate` - 팀 생성
- `/clubs/[id]/history` - 경기 기록
- `/clubs/[id]/stats` - 선수 통계

## 환경 변수

```
DATABASE_URL=postgresql://user:password@host:port/database   # 필수
PGPOOL_MAX=1                                                  # 연결 풀 크기 (서버리스 기본값 1)
PGSSL=true                                                    # pg 연결에 SSL 강제
PGSSLMODE=require                                             # SSL 설정의 대안
NEXT_PUBLIC_CACHE_TTL_SECONDS=60                              # unstable_cache TTL (기본값 60)
```

경로 별칭: `@/*`는 `src/*`로 매핑됩니다 (`tsconfig.json`에서 설정).

## 배포 (Render)

1. 이 저장소에 연결된 새 Web Service 생성
2. PostgreSQL 데이터베이스 생성
3. `DATABASE_URL` 환경 변수 설정
4. `scripts/init-db.sql`을 실행하여 데이터베이스 스키마 초기화
5. `render.yaml` 블루프린트로 배포

## 규칙 및 규약

- 서버 액션에서 변경 후 반드시 `updateTag()`를 먼저 호출한 뒤 `revalidatePath()`를 호출 — 제거된 `revalidateTag()`는 사용하지 마세요
- 모든 클럽 페이지는 `export const dynamic = 'force-dynamic'`을 설정하여 RSC가 항상 재실행되도록 함 (데이터 신선도는 `unstable_cache` TTL로 추가 제어)
- 날짜는 `+09:00` 오프셋(KST 타임존)으로 저장
- CSV 파일은 한국어 문자 호환성을 위해 UTF-8 BOM 사용
- `cached-storage.ts`는 `storage.ts`의 모든 변경 함수를 재내보냅니다, 따라서 서버 액션에서는 모든 것을 `cached-storage.ts`에서 임포트해야 합니다
