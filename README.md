# 농구 클럽 매니저 (Basketball Club Manager)

Next.js 기반의 농구 클럽 및 팀 관리 웹 애플리케이션입니다.

## 주요 기능

### 🏀 멀티 클럽 지원
- 여러 클럽을 생성하고 독립적으로 관리
- 클럽 이름 편집 기능
- 각 클럽별 독립적인 멤버 목록 및 경기 기록

### 👥 멤버 관리
- 멤버 추가, 수정, 삭제 (CRUD)
- 멤버 정보: 이름, 나이, 키, 포지션(가드/포워드/센터), 등번호
- **CSV 가져오기/내보내기** 지원

### 🎨 팀 생성 및 밸런싱
- 최대 18명 선택 (3팀 x 6명)
- 팀별 색상 지정 (White, Black, Red, Blue, Yellow, Green)
- 자동 밸런싱 알고리즘:
  - 각 팀에 최소 1명의 센터 배치
  - 포워드와 가드 균등 분배
  - 무작위 셔플로 다양한 팀 구성

### 📊 경기 결과 기록 (매치 기반)
- **3경기 시스템**: 3팀이 총 3경기 진행
  - A팀 vs B팀
  - A팀 vs C팀
  - B팀 vs C팀
- 각 경기마다 개별적으로 승자/무승부 기록
- 팀별 전적 자동 계산 (예: 2승 1무 0패)

### 📈 통계 대시보드
- **선수별 통계**:
  - 경기 출전 횟수
  - 누적 승/무/패 기록
  - 승률 계산
- **최근 경기 히스토리**: 최근 10경기 요약

### 🌐 완전한 한글화
- 모든 UI 요소 한글 지원
- 한글 CSV 파일 지원 (UTF-8 BOM)

## 시작하기

### 설치

\`\`\`bash
npm install
\`\`\`

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 프로덕션 빌드

\`\`\`bash
npm run build
npm start
\`\`\`

## 기술 스택

- **Framework**: Next.js 16.1.5 (App Router, Server Components, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules, Design Tokens)
- **Storage**: Local JSON file storage
- **State Management**: React Server Actions

## 사용 방법

1. **클럽 생성**: 홈 화면에서 새 클럽 만들기
2. **멤버 등록**: CSV 업로드 또는 수동 입력
3. **팀 생성**: 18명 선택 후 팀 색상 지정
4. **경기 결과 입력**: 3경기(A vs B, A vs C, B vs C) 결과 개별 기록
5. **통계 확인**: 선수별 성적 및 팀 전적 확인

## CSV 형식

멤버 CSV 파일 형식:
\`\`\`csv
이름,나이,키,포지션,등번호
홍길동,25,185,Forward,23
김철수,28,190,Center,15
\`\`\`

포지션: `Guard`, `Forward`, `Center`

## 라이선스

MIT
