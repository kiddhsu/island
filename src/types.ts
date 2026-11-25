export type Grade = 1 | 2

export type IslandId =
  | 'zhuyin'
  | 'chars'
  | 'reading'
  | 'number'
  | 'measure'
  | 'safety'
  | 'nature'
  | 'health'
  | 'selfcare'
  | 'mood'

/** 每座島一種玩法（題庫內容融進操作） */
export type PlayMode =
  | 'jump'
  | 'catch'
  | 'fork'
  | 'flip'
  | 'pipe'
  | 'clock'
  | 'traffic'
  | 'bins'
  | 'pack'
  | 'pop'

export type EngineKind = 'choice' | 'match' | 'order' | 'scenario'

export type ChoiceQuestion = {
  id: string
  engine: 'choice' | 'scenario'
  prompt: string
  hint?: string
  choices: string[]
  answerIndex: number
  explain?: string
}

export type MatchQuestion = {
  id: string
  engine: 'match'
  prompt: string
  pairs: { left: string; right: string }[]
}

export type OrderQuestion = {
  id: string
  engine: 'order'
  prompt: string
  items: string[]
  correctOrder: string[]
}

export type Question = ChoiceQuestion | MatchQuestion | OrderQuestion

export type ProgressState = {
  stars: Record<string, number>
  clears: Record<string, number>
  wrongIds: string[]
  recentCorrectIds: string[]
  sessionStartedAt: number | null
  restPromptDismissedUntil: number | null
  updatedAt?: number
}
