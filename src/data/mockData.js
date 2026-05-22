export const GRAPH_WIDTH = 760
export const GRAPH_HEIGHT = 500

export const currentUserFallback = {
  nickname: '해나',
  bio: '프론트엔드와 커피 산책을 좋아해요',
  emoji: '😎',
}

export const crews = [
  {
    id: 'tommy',
    name: '토미',
    emoji: '😊',
    cohort: '6기',
    track: '프론트엔드',
    bio: '커피챗과 리팩터링 이야기를 좋아해요',
    note: '이번 미션에서 비슷한 고민을 하고 있어요',
    x: 50,
    y: 17,
    tone: 'green',
    score: 72,
    activities: ['커피 1회', '밥 2회'],
  },
  {
    id: 'luna',
    name: '루나',
    emoji: '😁',
    cohort: '6기',
    track: '프론트엔드',
    bio: '프론트엔드와 산책을 좋아해요',
    note: '같은 미션을 했지만 아직 밥 기록은 없어요',
    x: 23,
    y: 34,
    tone: 'coral',
    score: 54,
    activities: ['쪽지 2회'],
  },
  {
    id: 'pobi',
    name: '포비',
    emoji: '🤓',
    cohort: '6기',
    track: '백엔드',
    bio: '테스트 코드와 조용한 대화를 좋아해요',
    note: '요청을 수락하면 첫 오프라인 연결이 생겨요',
    x: 18,
    y: 66,
    tone: 'blue',
    score: 28,
    activities: ['쪽지 1회'],
  },
  {
    id: 'hari',
    name: '하리',
    emoji: '😄',
    cohort: '6기',
    track: '프론트엔드',
    bio: '운동, 독서, 가벼운 회고를 좋아해요',
    note: '최근에 같은 리뷰어 피드백을 받았어요',
    x: 42,
    y: 82,
    tone: 'yellow',
    score: 35,
    activities: ['밥 1회'],
  },
  {
    id: 'river',
    name: '리버',
    emoji: '😎',
    cohort: '6기',
    track: '백엔드',
    bio: '백엔드와 프론트 연결 지점을 파고들어요',
    note: '같은 스터디에 있지만 아직 활동 기록이 적어요',
    x: 82,
    y: 38,
    tone: 'blue',
    score: 41,
    activities: ['팔로우'],
  },
  {
    id: 'jeje',
    name: '제제',
    emoji: '🥳',
    cohort: '6기',
    track: '풀스택',
    bio: '맛집 공유와 회고 대화를 좋아해요',
    note: '밥 요청으로 관계 점수를 올리기 좋아요',
    x: 73,
    y: 72,
    tone: 'green',
    score: 47,
    activities: ['커피 1회'],
  },
]


export const initialRelations = [
  { crewId: 'tommy', weight: 4, activity: '커피', tone: 'green', type: 'coffee' },
  { crewId: 'luna', weight: 3, activity: '쪽지', tone: 'coral', type: 'message' },
  { crewId: 'pobi', weight: 2, activity: '쪽지', tone: 'blue', type: 'message' },
  { crewId: 'hari', weight: 2, activity: '밥', tone: 'yellow', type: 'meal' },
  { crewId: 'river', weight: 3, activity: '팔로우', tone: 'blue', type: 'follow' },
  { crewId: 'jeje', weight: 3, activity: '술', tone: 'green', type: 'drink' },
]

export const secondaryLinks = [
  { source: 'luna', target: 'tommy', type: 'coffee', weight: 2 },
  { source: 'pobi', target: 'jeje', type: 'message', weight: 1 },
  { source: 'hari', target: 'river', type: 'meal', weight: 2 },
  { source: 'jeje', target: 'river', type: 'follow', weight: 1 },
]

export const initialRequests = [
  { id: 'request-pobi', crewId: 'pobi', activity: '커피', time: '2시간 전' },
  { id: 'request-jeje', crewId: 'jeje', activity: '밥', time: '5시간 전' },
]

export const activityTone = {
  쪽지: 'blue',
  커피: 'green',
  밥: 'yellow',
}

export const relationColors = {
  follow: '#4ade80',
  message: '#60a5fa',
  coffee: '#fbbf24',
  meal: '#fb923c',
  drink: '#e879f9',
}

export const initialActivityLogs = [
  {
    id: 1,
    crewName: '토미',
    type: 'coffee',
    activity: '커피',
    emoji: '☕',
    description: '카페인 수혈 완료',
    time: '2시간 전',
  },
  {
    id: 2,
    crewName: '루나',
    type: 'meal',
    activity: '밥',
    emoji: '🍜',
    description: '라면 각이다',
    time: '어제',
  },
  {
    id: 3,
    crewName: '리버',
    type: 'follow',
    activity: '팔로우',
    emoji: '👀',
    description: '눈팅 시작',
    time: '3일 전',
  },
  {
    id: 4,
    crewName: '제제',
    type: 'drink',
    activity: '술',
    emoji: '🍺',
    description: '맥주 3잔에 인생상담',
    time: '1주 전',
  },
]

