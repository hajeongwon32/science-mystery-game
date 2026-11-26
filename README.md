# 창밖에 있던 사람

작은 조업선을 배경으로 한 2D 포인트 앤 클릭 추리 게임의 플레이테스트입니다. 신입 선원으로 귀항길에 동료를 만나고, 사건 뒤에는 배를 돌아다니며 목격자의 말을 확인합니다.

## 실행

프로젝트 최상위 폴더의 터미널에서 아래 명령을 실행하고 Vite가 표시하는 주소를 브라우저에서 엽니다.

```powershell
npm ci
npm run dev
```

기본 주소는 http://127.0.0.1:5173/입니다. 의존성이 이미 설치됐다면 `npm run dev`부터 실행합니다. PowerShell에서 `npm.ps1` 실행이 차단되면 `npm.cmd`를 사용합니다.

`npm run build`는 배포 파일을 `dist/`에, 서버 없이 열 수 있는 체험판을 `exports/창밖에있던사람-인트로.html`에 생성합니다.

## 플레이 범위

시작 화면의 **랭킹 보기**는 닉네임 입력 없이 열 수 있습니다. 해결한 기록을 빠른 순서로 최대 10건 보여줍니다. 현재 체험판은 최종 지목 전까지 진행되므로 새 기록은 샘플 SQL로 확인할 수 있습니다.

### MySQL 랭킹 실행

1. 프로젝트 폴더에서 MySQL 8.0.16 이상에 접속합니다. 이전 샘플의 `game_sessions`에 `finished_at`이 있으면 먼저 `SOURCE database/migrate_play_seconds.sql;`을 한 번 실행합니다.
2. MySQL에서 `SOURCE database/db_sample.sql;`을 실행합니다. 샘플 DB에 가상 플레이 기록 다섯 건이 생기고, 해결한 세 건이 조회됩니다.
3. 프로젝트 루트에 `.env.example`을 `.env.local`로 복사합니다. `DB_USER`와 `DB_PASSWORD`에 샘플 DB를 조회할 수 있는 기존 MySQL 계정 정보를 입력합니다.
4. `npm run dev`를 다시 실행하고 **랭킹 보기**를 누릅니다. 브라우저는 `GET /api/rankings`를 호출하고 Express가 MySQL을 조회합니다. `npm run preview`에서도 같은 API를 사용합니다. 단독 HTML에서는 게임 서버로 접속하라는 안내가 표시됩니다.

제출용 [샘플 SQL](database/db_sample.sql)과 [ERD PDF](database/ERD.pdf)는 같은 스키마를 사용합니다. `DB_CORRECT_SUSPECT` 기본값은 샘플의 시연용 정답입니다.

### 조사 진행

복도에는 왼쪽 조타실 문, 정면 갑판 출입문, 오른쪽 침실 문이 있습니다. 귀항 중 복도에서 조리원, 조타실에서 항해사와 갑판원 한경수, 침실에서 기관장을 만납니다. 침상에 짐을 놓고 보고서를 본 뒤 갑판에서 쉬었다가 돌아오면 조타실에서 선장을 만납니다. 며칠 뒤 창문 관찰에서 얻은 단서를 가지고 복도의 조리원과 침실의 기관장에게 종이에 대해 물을 수 있습니다. 선원 수첩에서 여섯 승선자의 역할과 지금까지 확보한 기록을 다시 볼 수 있습니다. 현재 구현 범위는 기관장 증언까지입니다.

## 폴더

| 경로                       | 내용                              |
| -------------------------- | --------------------------------- |
| `src/main.tsx`             | React 시작 파일                   |
| `src/game/ShipIntro.tsx`   | 시작 화면, 대화, 조사 지점        |
| `src/game/WindowStudy.tsx` | 조타실 창 관찰과 수첩 기록        |
| `src/game/CrewBook.tsx`    | 승선 명부와 조사 기록             |
| `src/game/introState.ts`   | 문 이동과 인트로 진행 규칙        |
| `src/game/scenes.ts`       | 장면 이미지와 클릭 위치           |
| `src/game/assets/`         | 장면별 일러스트                   |
| `src/game/ship.css`        | 전체 화면과 작은 창의 배치        |
| `src/game/sound.ts`        | Web Audio 환경음                  |
| `tests/`                   | 문 이동과 사건 시작 조건의 테스트 |
| `scripts/`                 | 단독 HTML 생성 도구               |

`npm run check`는 TypeScript를 검사하고, `npm test`는 인트로 진행 규칙을 검증합니다. 이전 호텔 시안과 당시 문서는 로컬 `archive/hotel-prototypes-2026-11-25/`에 보관했습니다.
