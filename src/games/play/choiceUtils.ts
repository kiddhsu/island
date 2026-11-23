import type { ChoiceQuestion } from '../../types'
import { shuffle } from '../../lib/shuffle'

export type PlayChoice = {
  label: string
  correct: boolean
}

/** 保證正確答案一定在選項裡（最多 max 個） */
export function pickPlayChoices(
  question: ChoiceQuestion,
  max = 3,
): PlayChoice[] {
  const correct = question.choices[question.answerIndex]
  if (correct == null) {
    return question.choices.slice(0, max).map((label) => ({
      label,
      correct: false,
    }))
  }
  const wrongs = question.choices.filter((_, i) => i !== question.answerIndex)
  const pickedWrong = shuffle(wrongs).slice(0, Math.max(0, max - 1))
  return shuffle([
    { label: correct, correct: true },
    ...pickedWrong.map((label) => ({ label, correct: false })),
  ])
}
