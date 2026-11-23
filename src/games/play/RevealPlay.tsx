import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

/** 紅白機式翻牌尋寶：背面朝上，找出正確答案 */
export function RevealPlay({ question, onResult }: Props) {
  const cards = useMemo(
    () =>
      shuffle(
        question.choices.map((label, i) => ({
          label,
          correct: i === question.answerIndex,
        })),
      ),
    [question],
  )
  const [opened, setOpened] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  function open(i: number) {
    if (locked || opened !== null) return
    setOpened(i)
    setLocked(true)
    playSfx('tap', 0.35)
    const ok = cards[i]?.correct ?? false
    window.setTimeout(() => {
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 550)
    }, 280)
  }

  return (
    <div className="play-stage" style={{ background: '#143c8c' }}>
      <p className="nes-prompt" style={{ margin: 8 }}>
        {question.prompt}
        {'\n'}翻開正確的那一張！
      </p>
      <div className="flip-board">
        {cards.map((c, i) => (
          <button
            key={`${question.id}-rev-${i}`}
            type="button"
            className={`flip-card ${opened === i ? 'open' : ''} ${
              opened === i && c.correct ? 'matched' : ''
            }`}
            disabled={locked}
            onClick={() => open(i)}
          >
            {opened === i ? c.label : '?'}
          </button>
        ))}
      </div>
    </div>
  )
}
