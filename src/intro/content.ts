export const INTRO_DURATION = 40;
export type Scene = 'corridor' | 'room' | 'desk';
export type SoundCue = 'arrival' | 'steps' | 'door' | 'reveal' | 'title' | 'page';

interface BeatBase {
  at: number;
  scene: Scene;
  cue?: SoundCue;
}
export type StoryBeat = BeatBase &
  (
    | { kind: 'chapter'; kicker: string; title: string; subtitle: string }
    | { kind: 'narration'; speaker: string; text: string }
  );
export interface Suspect {
  role: string;
  name: string;
  relation: string;
  lines: readonly string[];
}

// Story and names remain a presentation draft; no culprit is encoded here.
export const beats: readonly StoryBeat[] = [
  {
    at: 0,
    scene: 'corridor',
    kind: 'chapter',
    kicker: '그날 밤',
    title: '23:17',
    subtitle: '호텔 5층. 비는 아직 그치지 않았다.',
    cue: 'arrival',
  },
  {
    at: 4,
    scene: 'corridor',
    kind: 'narration',
    speaker: '나',
    text: '전화가 걸려온 건,\n밤 열한 시가 지난 뒤였다.',
    cue: 'steps',
  },
  {
    at: 9,
    scene: 'corridor',
    kind: 'narration',
    speaker: '경위',
    text: '“507호입니다.\n투숙객 한 분이 숨진 채 발견됐습니다.”',
  },
  {
    at: 15,
    scene: 'room',
    kind: 'narration',
    speaker: '사건 기록',
    text: '피해자는 소설가 윤재헌.\n그가 머물던 방에는 누군가 다녀간 흔적이 있었다.',
    cue: 'door',
  },
  {
    at: 21,
    scene: 'room',
    kind: 'narration',
    speaker: '나',
    text: '“마지막으로 그를 만난 사람들은요?”',
  },
  {
    at: 25,
    scene: 'room',
    kind: 'narration',
    speaker: '경위',
    text: '“네 명입니다.\n아직 모두 호텔 안에 있습니다.”',
  },
  {
    at: 30,
    scene: 'desk',
    kind: 'narration',
    speaker: '나',
    text: '그는 마지막으로 무언가를 남기려 했다.\n그 말이 누구를 가리키는지, 아직은 알 수 없다.',
    cue: 'reveal',
  },
  {
    at: 36,
    scene: 'room',
    kind: 'chapter',
    kicker: '사건의 시작',
    title: '마지막 한 줄',
    subtitle: '한 사람은 말을 남겼고, 네 사람은 말을 아꼈다.',
    cue: 'title',
  },
];

export const suspects: readonly Suspect[] = [
  {
    role: '아내',
    name: '김서연',
    relation: '피해자와 함께 투숙했다.\n그날 저녁, 두 사람은 다퉜다.',
    lines: [
      '잠깐 나가 있으라고 했어요.\n원고를 봐야 한다면서요.',
      '그 뒤에는 혼자 있었어요.\n남편에게 무슨 일이 생긴 줄은… 몰랐어요.',
    ],
  },
  {
    role: '아들',
    name: '윤지호',
    relation: '아버지를 찾아 호텔에 왔다.\n방문한 이유는 말하지 않았다.',
    lines: [
      '아버지한테 할 말이 있어서 왔어요.',
      '하지만 만나지는 못했어요.\n오늘은 돌아가라는 말만 들었어요.',
    ],
  },
  {
    role: '비서',
    name: '정수민',
    relation: '피해자의 일정과 원고를 관리한다.\n오늘도 서류를 전달했다.',
    lines: [
      '저녁에 서류를 전달했습니다.\n내일 일정도 말씀드렸고요.',
      '평소와 다를 건 없었습니다.\n제가 나올 때는 분명 살아 계셨어요.',
    ],
  },
  {
    role: '청소부',
    name: '박태수',
    relation: '이 층의 객실 정리를 맡고 있다.\n늦은 시간까지 복도에 남아 있었다.',
    lines: [
      '그 방 앞을 지나간 건 맞아요.\n요청하신 물건을 가져다드리러요.',
      '하지만 방 안에는 들어가지 않았어요.\n문 앞에 놓고 돌아왔습니다.',
    ],
  },
];

export function getBeatIndex(elapsed: number): number {
  let index = 0;
  for (let i = 0; i < beats.length; i++) if (elapsed >= beats[i].at) index = i;
  return index;
}
