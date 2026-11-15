# 폴더와 코드 읽는 순서

## 현재 React 인트로

```text
src/
  main.tsx                       React 시작점
  intro/
    HotelIntro.tsx               화면 전체 조합
    content.ts                   인물과 대사, 40초 타임라인
    state.ts                     진행 상태와 전환 규칙
    useIntro.ts                  타이머·키보드·소리 연결
    audio.ts                     Web Audio 환경음과 효과음
    assets.ts                    이미지 경로와 미리 불러오기
    intro.css                    디자인과 반응형 스타일
    assets/                      배경 2장, 인물 아틀라스
    components/
      Background.tsx             복도·객실 배경
      PlaybackControls.tsx       재생·소리·전체 화면
      StartScreen.tsx            제목과 시작 버튼
      Narrative.tsx              사건 소개 자막
      SuspectIntroduction.tsx    인물 이미지와 소개
      DialogueBox.tsx            클릭으로 넘기는 대화창
      EndingScreen.tsx           종료와 진술 다시 보기
```

## 처음 읽을 때

1. `src/main.tsx`에서 어떤 화면을 실행하는지 확인합니다.
2. `src/intro/HotelIntro.tsx`에서 전체 화면 구성을 읽습니다.
3. 대사와 인물을 바꾸려면 `content.ts`를 엽니다.
4. 특정 화면을 고치려면 `components`에서 해당 컴포넌트를 엽니다.
5. 진행 방식은 `state.ts`, 타이머나 소리는 `useIntro.ts`와 `audio.ts`를 읽습니다.

`state.ts`는 화면을 직접 수정하지 않고 다음 상태를 계산합니다. React 컴포넌트가 그 상태에 맞는 화면을 표시합니다. 타이머와 브라우저 이벤트는 `useIntro.ts`에서 등록하고 정리합니다.

## 포맷

Prettier 규칙은 루트 `.prettierrc.json`에 있습니다. 소스는 공백 2칸 들여쓰기, 세미콜론, 작은따옴표, 100자 기준 줄바꿈을 사용합니다.

```powershell
npm run format
```

VS Code에서는 Prettier 확장을 설치하면 같은 설정으로 문서 서식을 정리할 수 있습니다. 확장은 추천 목록에만 등록했으며 자동 설치하지 않았습니다.

## 생성 파일과 보관 파일

- `dist`: Vite가 생성하는 배포 파일입니다.
- `exports`: React 번들과 이미지를 포함한 단독 HTML입니다.
- `archive`: 작업 PC의 이전 시안·조사 자료 보관 폴더이며 GitHub에 포함하지 않습니다. 실행에 필요하지 않습니다.
- `node_modules`: npm이 설치한 의존성입니다.

VS Code 탐색기에서는 `node_modules`, `dist`, `exports`를 숨겨 소스에 집중하도록 설정했습니다. 실제 파일은 남아 있고 탐색기나 `.vscode/settings.json`에서 다시 확인할 수 있습니다.

## 정리 기록

기존 `prototype` 안에 있던 현재 프로젝트를 루트로 옮겼습니다. 이전 소스 백업과 이동 기록은 작업 PC의 `archive/maintenance`에만 보관합니다. 저장소를 내려받으면 루트에서 바로 설치·실행할 수 있습니다.
