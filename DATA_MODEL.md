# Data Model (초안)

> 실제 DB 스키마/마이그레이션으로 확정되기 전, 개념 모델 문서

## Enum / Constants
- `role`: `manager` | `member`
- `position`: `PG` | `SG` | `SF` | `PF` | `C`
- `attendance_state`: `attend` | `absent`
- `attendance_status`: `open` | `closed`

---

## Entities

### users
- id (uuid)
- email (unique, nullable if social-only 허용 시)
- password_hash (이메일+비번 사용 시)
- created_at

### oauth_accounts (선택)
- id
- user_id
- provider (`google`|`kakao`|`apple`)
- provider_user_id
- created_at

### clubs
- id
- name
- owner_user_id (운영진 시작점)
- created_at

### club_features / plan_entitlements (P1 대비)
- id
- club_id
- feature_key (예: `tournament_mode`)
- enabled (boolean)
- updated_at

### club_members
- id
- club_id
- user_id
- role (`manager`|`member`)
- nickname
- position (`PG`|`SG`|`SF`|`PF`|`C`)
- status (active/inactive 등)
- **privacy_json** (선택, P1): 연락처/민감정보 공개 범위 설정용
- created_at

### attendances (모임)
- id
- club_id
- date
- title
- status (`open`|`closed`)
- created_by (user_id)
- created_at

### attendance_members
- id
- attendance_id
- club_member_id
- state (`attend`|`absent`)
- updated_at

### team_generations
- id
- attendance_id
- config_json (team_count, team_size 등)
- result_json (팀별 멤버 배열)
- created_by (user_id)
- created_at

### games
- id
- club_id
- attendance_id (nullable: 모임과 연결 권장)
- date
- winner (`A`|`B`)
- created_by (user_id)
- created_at

### game_participants
- game_id
- club_member_id
- team (`A`|`B`)
- result (`win`|`loss`)  # winner로부터 계산 가능하면 생략 가능

---

## Notes
- v0.1은 승/패만 기록하므로 `game_scores`, `player_stats`는 보류
- 한 모임에서 여러 game을 허용하려면 `games.attendance_id`로 연결만 해두면 됨(회차 라벨 없이 리스트로 쌓임)
- 클럽별 프로필을 위해 user와 club_member를 분리(권장)

## Benchmark-driven P1 candidates (SportEasy 참고)
추후 확장 시 아래 테이블/엔티티 추가 가능:
- `messages`, `threads` (클럽 공지 / 이벤트별 스레드)
- `tasks` (이벤트/모임별 담당자 지정)
- `fee_collections`, `payments` (회비/참가비 수금)
- `events` (attendance를 포함하는 상위 이벤트 모델로 확장: 훈련/경기/회식 등)
