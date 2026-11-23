import type { ChoiceQuestion, MatchQuestion, OrderQuestion, Question } from '../../types'

export type PlayResultHandler = (ok: boolean) => void

export function asChoice(q: Question): ChoiceQuestion | null {
  if (q.engine === 'choice' || q.engine === 'scenario') return q
  return null
}

export function asMatch(q: Question): MatchQuestion | null {
  if (q.engine === 'match') return q
  return null
}

export function asOrder(q: Question): OrderQuestion | null {
  if (q.engine === 'order') return q
  return null
}

/** 把一般選擇題轉成翻牌用的假配對（答案 vs 提示） */
export function choiceToFlipPairs(q: ChoiceQuestion): { left: string; right: string }[] {
  const answer = q.choices[q.answerIndex] ?? ''
  const wrong = q.choices.filter((_, i) => i !== q.answerIndex).slice(0, 2)
  return [
    { left: '正確', right: answer },
    ...wrong.map((w, i) => ({ left: `干擾${i + 1}`, right: w })),
  ].slice(0, 3)
}
