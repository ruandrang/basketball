# 농구 클럽 매니저 리디자인 프롬프트
# Mindbody/Glofox 스타일 사이드바 네비게이션

---

## 📋 프로젝트 개요

기존 Next.js 기반 농구 클럽 매니저를 Mindbody/Glofox 스타일의 현대적인 디자인으로 완전히 리디자인해주세요.

**현재 프로젝트 구조:**
- Next.js 16 (App Router)
- TypeScript
- PostgreSQL
- React 19
- dnd-kit (드래그 앤 드롭)
- Vanilla CSS

**디자인 참고:**
- 첨부된 스크린샷의 사이드바 네비게이션 스타일
- Mindbody의 오렌지 사이드바 + 아이콘 메뉴
- Glofox의 모던하고 미니멀한 UI
- 카드 기반 레이아웃

---

## 🎨 디자인 시스템

### 컬러 팔레트
```css
/* Primary Colors - 농구 테마 */
--primary: #FF6B35;        /* 농구공 오렌지 */
--primary-dark: #E85A2A;
--primary-light: #FF8555;

/* Secondary Colors */
--secondary: #2C3E50;      /* 다크 네이비 */
--accent: #3B82F6;         /* 블루 */

/* Semantic Colors */
--success: #10B981;        /* 승리 - 그린 */
--warning: #F59E0B;        /* 경고 - 옐로우 */
--danger: #EF4444;         /* 패배 - 레드 */
--info: #3B82F6;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-900: #111827;

/* Background */
--bg-main: #F9FAFB;
--bg-card: #FFFFFF;
--bg-sidebar: #FF6B35;
```

### 타이포그래피
```css
/* 한글 최적화 폰트 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* Heading */
h1: 32px, Bold (클럽 이름)
h2: 24px, SemiBold (섹션 타이틀)
h3: 20px, SemiBold (카드 제목)

/* Body */
body: 16px, Regular, line-height: 1.6
small: 14px, Regular
caption: 12px, Regular
```

### Spacing & Layout
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

--border-radius-sm: 6px;
--border-radius-md: 10px;
--border-radius-lg: 16px;

--sidebar-width: 240px;
--sidebar-collapsed-width: 72px;
```

---

## 🏗️ 레이아웃 구조

### 1. 전체 레이아웃
```
┌─────────────────────────────────────────┐
│  [사이드바]  │  [메인 컨텐츠 영역]       │
│             │                           │
│   아이콘    │   [헤더: 클럽명 + 검색]   │
│   메뉴      │   ─────────────────────  │
│             │                           │
│   홈        │   [대시보드 카드들]       │
│   멤버      │                           │
│   팀구성    │   [데이터 테이블/그리드]  │
│   경기기록  │                           │
│   통계      │                           │
│   설정      │                           │
│             │                           │
│   [로그아웃]│                           │
└─────────────────────────────────────────┘
```

### 2. 사이드바 네비게이션 (Mindbody 스타일)
```jsx
// 요구사항:
// - 고정 너비 240px (펼침), 72px (접음)
// - 오렌지 그라데이션 배경
// - 흰색 아이콘 + 텍스트
// - 호버 시 약간의 밝기 증가
// - 현재 페이지 하이라이트 (더 밝은 배경)
// - 하단에 로그아웃 버튼

<Sidebar>
  <SidebarHeader>
    <Logo>🏀 Basketball</Logo>
    <ToggleButton />
  </SidebarHeader>

  <SidebarMenu>
    <MenuItem icon="🏠" label="홈" href="/dashboard" active />
    <MenuItem icon="👥" label="멤버 관리" href="/members" />
    <MenuItem icon="👕" label="팀 구성" href="/teams" />
    <MenuItem icon="🏆" label="경기 기록" href="/matches" />
    <MenuItem icon="📊" label="통계" href="/stats" />
    <MenuItem icon="⚙️" label="설정" href="/settings" />
  </SidebarMenu>

  <SidebarFooter>
    <UserProfile />
    <LogoutButton />
  </SidebarFooter>
</Sidebar>
```

---

## 📄 페이지별 상세 설계

### Page 1: 홈 대시보드 (`/dashboard`)

**레이아웃:**
```
┌─────────────────────────────────────────────┐
│  🏀 Basketball  │  [내 클럽 이름]  🔍      │
├─────────────────────────────────────────────┤
│                                             │
│  📊 빠른 통계 카드 (4개 가로 배치)           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │총멤버│ │이번주│ │진행중│ │평균  │          │
│  │ 24명│ │경기4│ │시즌  │ │승률  │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  📅 다가오는 경기 (카드 리스트)              │
│  ┌────────────────────────────────┐        │
│  │ 2024-02-05 19:00               │        │
│  │ Team Red vs Team Blue          │        │
│  │ [경기 시작] 버튼                │        │
│  └────────────────────────────────┘        │
│                                             │
│  🔥 최근 활동 피드                          │
│  • 홍길동 님이 팀에 합류했습니다            │
│  • 어제 경기 결과가 입력되었습니다          │
│                                             │
└─────────────────────────────────────────────┘
```

**컴포넌트 요구사항:**
```tsx
// 통계 카드
<StatCard 
  icon="👥"
  title="총 멤버"
  value="24"
  change="+2"
  changeType="positive"
/>

// 다가오는 경기 카드
<UpcomingMatchCard
  date="2024-02-05"
  time="19:00"
  teams={['Team Red', 'Team Blue']}
  location="메인 코트"
  onStart={handleStartMatch}
/>

// 활동 피드
<ActivityFeed
  activities={recentActivities}
  maxItems={5}
/>
```

---

### Page 2: 멤버 관리 (`/members`)

**레이아웃:**
```
┌─────────────────────────────────────────────┐
│  👥 멤버 관리                                │
│                                             │
│  [+ 멤버 추가] [CSV 가져오기] [CSV 내보내기]│
│  🔍 [검색...] [포지션▼] [정렬▼]            │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 📷  홍길동    25세  185cm  Forward │    │
│  │     등번호: 23   승률: 65%         │    │
│  │                [수정] [삭제]       │    │
│  ├────────────────────────────────────┤    │
│  │ 📷  김철수    28세  190cm  Center  │    │
│  │     등번호: 15   승률: 72%         │    │
│  │                [수정] [삭제]       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  [1] 2 3 ... 10  (페이지네이션)            │
└─────────────────────────────────────────────┘
```

**기능 요구사항:**
1. **멤버 카드 컴포넌트**
   - 드래그 핸들 (순서 변경용)
   - 프로필 사진 (없으면 이니셜)
   - 이름, 나이, 키, 포지션 표시
   - 등번호 뱃지
   - 승률 프로그레스 바
   - 인라인 수정/삭제 버튼

2. **필터 & 정렬**
   - 포지션 필터 (전체, Guard, Forward, Center)
   - 정렬: 이름, 나이, 키, 승률
   - 실시간 검색 (이름)

3. **CSV 기능**
   - 드래그 앤 드롭 업로드 영역
   - 업로드 진행률 표시
   - 오류 처리 (잘못된 형식)

4. **멤버 추가/수정 모달**
   ```tsx
   <MemberModal
     mode="create" // or "edit"
     onSubmit={handleSubmit}
     onCancel={handleCancel}
   >
     <FormField label="이름" required />
     <FormField label="나이" type="number" />
     <FormField label="키(cm)" type="number" />
     <FormField label="포지션" type="select" 
                options={['Guard', 'Forward', 'Center']} />
     <FormField label="등번호" type="number" />
   </MemberModal>
   ```

---

### Page 3: 팀 구성 (`/teams`)

**레이아웃:**
```
┌─────────────────────────────────────────────┐
│  👕 팀 구성                                  │
│                                             │
│  Step 1: 멤버 선택 (최대 18명)              │
│  ┌─────────────────────────────────────┐   │
│  │ ☑️ 홍길동  ☑️ 김철수  ☐ 이영희     │   │
│  │ ☑️ 박민수  ☑️ 최준호  ☐ 정수진     │   │
│  │ ... (선택: 12/18)                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Step 2: 팀 색상 선택 (2-3팀)              │
│  ◯ 2팀 구성  ◉ 3팀 구성                    │
│  [White] [Black] [Red] [Blue] [Yellow] ... │
│                                             │
│  [🎲 자동 밸런싱 시작]                      │
│                                             │
│  Step 3: 결과                              │
│  ┌───────┐ ┌───────┐ ┌───────┐           │
│  │Team Red│ │Team Blu│ │Team Whi│          │
│  │홍길동  │ │김철수  │ │박민수  │          │
│  │최준호  │ │이영희  │ │정수진  │          │
│  │(Guard) │ │(Forward│ │(Center)│          │
│  │평균승률│ │평균승률│ │평균승률│          │
│  │  65%  │ │  64%  │ │  66%  │          │
│  └───────┘ └───────┘ └───────┘           │
│                                             │
│  [다시 밸런싱] [경기 시작]                  │
└─────────────────────────────────────────────┘
```

**밸런싱 알고리즘 시각화:**
```tsx
// 밸런싱 중 애니메이션
<BalancingAnimation>
  <Spinner />
  <Text>포지션 분배 중...</Text>
  <ProgressBar value={33} />
</BalancingAnimation>

// 결과 팀 카드
<TeamCard
  teamName="Team Red"
  color="#EF4444"
  members={teamMembers}
  avgWinRate={65}
  positionDistribution={{ G: 2, F: 2, C: 2 }}
/>
```

---

### Page 4: 경기 기록 (`/matches`)

**레이아웃:**
```
┌─────────────────────────────────────────────┐
│  🏆 경기 기록                                │
│                                             │
│  [+ 새 경기 추가]  [날짜▼] [필터▼]          │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 📅 2024-02-05 19:00               │    │
│  │                                    │    │
│  │ Match 1: Team Red vs Team Blue     │    │
│  │ 승자: Team Red  ✅                 │    │
│  │                                    │    │
│  │ Match 2: Team Red vs Team White    │    │
│  │ 승자: Team White ✅                │    │
│  │                                    │    │
│  │ Match 3: Team Blue vs Team White   │    │
│  │ 무승부  ⚖️                         │    │
│  │                                    │    │
│  │ [전적] Red: 1승 1패 | Blue: 0승 1무 1패│
│  │        White: 1승 1무 0패           │    │
│  │                                    │    │
│  │ [수정] [삭제] [이미지 저장]        │    │
│  └────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**경기 추가 플로우:**
```tsx
// Step 1: 팀 선택 (이전 팀 구성에서 가져오기)
<MatchCreationWizard step={1}>
  <TeamSelection
    availableTeams={['Team Red', 'Team Blue', 'Team White']}
    onSelect={handleTeamSelect}
  />
</MatchCreationWizard>

// Step 2: 각 경기 결과 입력
<MatchResultInput
  match={1}
  teamA="Team Red"
  teamB="Team Blue"
  onResult={(winner) => handleMatchResult(1, winner)}
/>

// Step 3: 확인 및 저장
<MatchSummary
  matches={matchResults}
  standings={calculatedStandings}
  onSave={handleSaveMatch}
/>
```

---

### Page 5: 통계 대시보드 (`/stats`)

**레이아웃:**
```
┌─────────────────────────────────────────────┐
│  📊 통계 대시보드                            │
│                                             │
│  [전체] [이번 달] [지난 달] [커스텀]        │
│                                             │
│  ┌────────────────┐ ┌────────────────┐    │
│  │ 총 경기 수     │ │ 총 참여 선수   │    │
│  │     42경기     │ │     24명       │    │
│  └────────────────┘ └────────────────┘    │
│                                             │
│  📈 선수별 성적 테이블                      │
│  ┌────────────────────────────────────┐   │
│  │ 순위 이름   경기수  승  무  패  승률│   │
│  │  1  홍길동   15   10  2   3  72% │   │
│  │  2  김철수   14    9  3   2  70% │   │
│  │  3  이영희   13    8  2   3  68% │   │
│  │  ... (정렬: 승률▼)                │   │
│  └────────────────────────────────────┘   │
│                                             │
│  📊 포지션별 승률 (바 차트)                 │
│  Guard:   ████████░░ 65%                   │
│  Forward: █████████░ 68%                   │
│  Center:  ███████░░░ 62%                   │
│                                             │
│  [PDF 내보내기] [이미지 저장]               │
└─────────────────────────────────────────────┘
```

**차트 컴포넌트:**
```tsx
// Recharts 사용
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={positionStats}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="position" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="winRate" fill="#FF6B35" />
  </BarChart>
</ResponsiveContainer>

// 선수 테이블
<PlayerStatsTable
  data={playerStats}
  sortBy="winRate"
  sortOrder="desc"
  onSort={handleSort}
/>
```

---

## 🎯 핵심 컴포넌트 라이브러리

### 1. 공통 컴포넌트

```tsx
// Button.tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  icon={<IconComponent />}
  loading={isLoading}
  disabled={isDisabled}
  onClick={handleClick}
>
  버튼 텍스트
</Button>

// Card.tsx
<Card
  title="카드 제목"
  subtitle="부제목"
  action={<Button>액션</Button>}
  footer={<CardFooter />}
>
  카드 내용
</Card>

// Modal.tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="모달 제목"
  size="sm" | "md" | "lg" | "fullscreen"
>
  모달 내용
</Modal>

// Toast.tsx
<Toast
  type="success" | "error" | "warning" | "info"
  message="토스트 메시지"
  duration={3000}
  position="top-right"
/>

// Badge.tsx
<Badge
  variant="success" | "warning" | "danger" | "info"
  size="sm" | "md"
>
  23
</Badge>

// Avatar.tsx
<Avatar
  src="/path/to/image.jpg"
  name="홍길동"
  size="sm" | "md" | "lg"
  status="online" | "offline"
/>

// ProgressBar.tsx
<ProgressBar
  value={65}
  max={100}
  color="success" | "warning" | "danger"
  showLabel={true}
  animate={true}
/>

// Table.tsx
<Table
  columns={columns}
  data={data}
  sortable={true}
  filterable={true}
  pagination={true}
  pageSize={10}
  onRowClick={handleRowClick}
/>

// EmptyState.tsx
<EmptyState
  icon="📭"
  title="데이터가 없습니다"
  description="새로운 멤버를 추가해보세요"
  action={<Button>멤버 추가</Button>}
/>
```

### 2. 폼 컴포넌트

```tsx
// Input.tsx
<Input
  label="이름"
  placeholder="이름을 입력하세요"
  value={value}
  onChange={handleChange}
  error={error}
  required={true}
  icon={<SearchIcon />}
/>

// Select.tsx
<Select
  label="포지션"
  options={[
    { value: 'guard', label: 'Guard' },
    { value: 'forward', label: 'Forward' },
    { value: 'center', label: 'Center' }
  ]}
  value={selectedPosition}
  onChange={handlePositionChange}
/>

// Checkbox.tsx
<Checkbox
  label="멤버 선택"
  checked={isChecked}
  onChange={handleCheck}
  disabled={isDisabled}
/>

// Radio.tsx
<RadioGroup
  name="teamCount"
  value={selectedTeamCount}
  onChange={handleTeamCountChange}
>
  <Radio value="2">2팀 구성</Radio>
  <Radio value="3">3팀 구성</Radio>
</RadioGroup>

// FileUpload.tsx
<FileUpload
  accept=".csv"
  multiple={false}
  maxSize={5 * 1024 * 1024} // 5MB
  onUpload={handleFileUpload}
  dragAndDrop={true}
/>
```

---

## 🔧 기술적 구현 요구사항

### 1. 상태 관리
```tsx
// Zustand를 사용한 전역 상태 관리
// stores/useClubStore.ts
interface ClubStore {
  currentClub: Club | null;
  members: Member[];
  matches: Match[];
  teams: Team[];
  
  // Actions
  setCurrentClub: (club: Club) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  // CSV
  importMembersFromCSV: (file: File) => Promise<void>;
  exportMembersToCSV: () => void;
  
  // Team balancing
  balanceTeams: (selectedMembers: Member[], teamCount: number) => Team[];
  
  // Match recording
  recordMatch: (matchData: MatchData) => Promise<void>;
  
  // Statistics
  calculatePlayerStats: () => PlayerStats[];
}
```

### 2. API Routes (Server Actions)
```tsx
// app/api/members/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');
  
  // ... PostgreSQL 쿼리
  
  return Response.json({ members });
}

// app/api/matches/route.ts
export async function POST(request: Request) {
  const matchData = await request.json();
  
  // ... 경기 기록 저장
  
  return Response.json({ success: true });
}
```

### 3. 데이터베이스 스키마 (PostgreSQL)
```sql
-- clubs 테이블은 기존 유지

-- members 테이블
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  height INTEGER, -- cm
  position VARCHAR(20) CHECK (position IN ('Guard', 'Forward', 'Center')),
  jersey_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- matches 테이블
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  match_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- match_games 테이블 (한 매치 내 여러 게임)
CREATE TABLE match_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_a VARCHAR(50) NOT NULL,
  team_b VARCHAR(50) NOT NULL,
  winner VARCHAR(50), -- NULL이면 무승부
  game_order INTEGER NOT NULL
);

-- match_participants 테이블
CREATE TABLE match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  team_name VARCHAR(50) NOT NULL
);

-- 인덱스
CREATE INDEX idx_members_club ON members(club_id);
CREATE INDEX idx_matches_club ON matches(club_id);
CREATE INDEX idx_match_games_match ON match_games(match_id);
```

### 4. 반응형 디자인
```css
/* Breakpoints */
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;

/* Mobile: 사이드바를 하단 탭바로 변경 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    flex-direction: row;
  }
  
  .main-content {
    padding-bottom: 80px;
  }
}

/* Tablet: 사이드바 접기 가능 */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-collapsed-width);
  }
  
  .sidebar.expanded {
    width: var(--sidebar-width);
  }
}

/* Desktop: 전체 레이아웃 */
@media (min-width: 1025px) {
  .sidebar {
    width: var(--sidebar-width);
  }
}
```

---

## 🎬 애니메이션 & 인터랙션

### 1. 페이지 전환
```tsx
// Framer Motion 사용
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### 2. 카드 호버 효과
```css
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

### 3. 로딩 상태
```tsx
<LoadingSpinner variant="dots" | "circle" | "skeleton" />

// Skeleton Screen
<MemberCardSkeleton />
```

---

## 📦 프로젝트 구조

```
basketball-manager/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # 사이드바 레이아웃
│   │   ├── page.tsx            # 홈 대시보드
│   │   ├── members/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── teams/
│   │   │   └── page.tsx
│   │   ├── matches/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── stats/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── members/
│   │   ├── matches/
│   │   └── stats/
│   └── layout.tsx
├── components/
│   ├── ui/                     # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/                 # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── members/                # 멤버 관련
│   │   ├── MemberCard.tsx
│   │   ├── MemberModal.tsx
│   │   ├── MemberList.tsx
│   │   └── CSVUpload.tsx
│   ├── teams/                  # 팀 관련
│   │   ├── TeamCard.tsx
│   │   ├── TeamBalancer.tsx
│   │   └── MemberSelector.tsx
│   ├── matches/                # 경기 관련
│   │   ├── MatchCard.tsx
│   │   ├── MatchCreationWizard.tsx
│   │   └── MatchResultInput.tsx
│   └── stats/                  # 통계 관련
│       ├── PlayerStatsTable.tsx
│       ├── PositionChart.tsx
│       └── WinRateChart.tsx
├── lib/
│   ├── db/                     # DB 유틸
│   ├── utils/                  # 헬퍼 함수
│   │   ├── csv.ts
│   │   ├── balancing.ts
│   │   └── stats.ts
│   └── validations/            # Zod 스키마
├── stores/
│   ├── useClubStore.ts
│   └── useAuthStore.ts
├── styles/
│   ├── globals.css
│   └── variables.css
└── types/
    ├── member.ts
    ├── match.ts
    └── stats.ts
```

---

## ✅ 구현 체크리스트

### Phase 1: 기본 UI 구조 (1-2일)
- [ ] 디자인 시스템 CSS Variables 설정
- [ ] 사이드바 네비게이션 구현
- [ ] 반응형 레이아웃 (모바일 하단 탭바)
- [ ] 공통 UI 컴포넌트 (Button, Card, Modal, Input 등)

### Phase 2: 홈 & 멤버 관리 (2-3일)
- [ ] 홈 대시보드 (통계 카드, 활동 피드)
- [ ] 멤버 리스트 페이지
- [ ] 멤버 추가/수정 모달
- [ ] CSV 가져오기/내보내기
- [ ] 드래그 앤 드롭 순서 변경

### Phase 3: 팀 구성 & 밸런싱 (2-3일)
- [ ] 멤버 선택 UI (체크박스 그리드)
- [ ] 팀 색상 선택
- [ ] 자동 밸런싱 알고리즘 구현
- [ ] 밸런싱 결과 시각화
- [ ] 팀 재구성 기능

### Phase 4: 경기 기록 (2-3일)
- [ ] 경기 추가 위저드
- [ ] 각 게임별 결과 입력 UI
- [ ] 전적 자동 계산
- [ ] 경기 수정/삭제
- [ ] 이미지로 저장 기능

### Phase 5: 통계 대시보드 (2-3일)
- [ ] 선수별 성적 테이블
- [ ] 정렬 & 필터링
- [ ] 차트 (포지션별 승률, 경기 추이)
- [ ] PDF/이미지 내보내기

### Phase 6: 최적화 & 테스트 (1-2일)
- [ ] 성능 최적화 (React.memo, useMemo)
- [ ] 접근성 (ARIA 라벨, 키보드 네비게이션)
- [ ] 다크 모드 (옵션)
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 테스트

---

## 🚀 시작하기 (프롬프트 예시)

### 프롬프트 1: 사이드바 네비게이션 생성
```
농구 클럽 매니저를 위한 Mindbody 스타일 사이드바를 React + TypeScript로 만들어주세요.

요구사항:
- 고정 너비 240px, 접을 수 있음 (72px)
- 오렌지 그라데이션 배경 (#FF6B35 → #E85A2A)
- 흰색 아이콘 + 텍스트
- 메뉴 항목: 홈, 멤버 관리, 팀 구성, 경기 기록, 통계, 설정
- 현재 페이지 하이라이트
- 하단에 사용자 프로필 + 로그아웃 버튼
- 모바일에서는 하단 탭바로 전환

전체 코드를 생성해주세요.
```

### 프롬프트 2: 멤버 관리 페이지
```
농구 클럽 멤버 관리 페이지를 만들어주세요.

기능:
1. 멤버 카드 그리드 (이름, 나이, 키, 포지션, 등번호, 승률)
2. 검색 & 필터 (포지션)
3. 정렬 (이름, 승률)
4. 멤버 추가/수정 모달
5. CSV 가져오기/내보내기 (드래그 앤 드롭)
6. 드래그로 순서 변경 (dnd-kit)

디자인:
- Glofox 스타일 카드
- Tailwind CSS 대신 CSS Variables 사용
- 반응형 그리드 (1열 → 2열 → 3열)

전체 코드 + API 연동 로직을 생성해주세요.
```

### 프롬프트 3: 팀 밸런싱 시스템
```
농구 팀 자동 밸런싱 시스템을 구현해주세요.

요구사항:
1. 멤버 선택 UI (최대 18명)
2. 팀 수 선택 (2팀 또는 3팀)
3. 팀 색상 선택 (White, Black, Red, Blue, Yellow, Green)
4. 밸런싱 알고리즘:
   - 포지션별 균등 분배 (Guard, Forward, Center)
   - 승률 기반 밸런싱 (5경기 이상 참가자)
   - 라운드 로빈: 가장 약한 팀에 우선 배치
5. 결과 시각화 (팀 카드 + 평균 승률)

TypeScript + React로 전체 구현해주세요.
```

---

## 📚 참고 자료

**디자인 시스템:**
- Tailwind CSS Documentation
- Material Design 3
- Ant Design
- Chakra UI

**차트 라이브러리:**
- Recharts: https://recharts.org
- Chart.js: https://www.chartjs.org

**드래그 앤 드롭:**
- dnd-kit: https://dndkit.com

**애니메이션:**
- Framer Motion: https://www.framer.com/motion

**아이콘:**
- Lucide React: https://lucide.dev
- Heroicons: https://heroicons.com

---

## 🎯 최종 목표

이 프롬프트를 사용하여 다음을 달성하세요:

1. ✅ **프로페셔널한 디자인**: Mindbody/Glofox 수준의 UI/UX
2. ✅ **완벽한 기능**: 기존 모든 기능 유지 + 개선
3. ✅ **반응형**: 모바일/태블릿/데스크톱 완벽 지원
4. ✅ **성능**: 빠른 로딩, 부드러운 애니메이션
5. ✅ **확장성**: 새 기능 추가 용이한 구조

**Happy Coding! 🏀**
