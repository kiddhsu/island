import { useMemo, useState } from 'react'
import type { OrderQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
import type { PlayResultHandler } from './types'

type Props = {
  question: OrderQuestion
  onResult: PlayResultHandler
}

export function PipePlay({ question, onResult }: Props) {
  const pool = useMemo(() => shuffle(question.items), [question])
  const [filled, setFilled] = useState<string[]>([])
  const [remain, setRemain] = useState(pool)
  const [locked, setLocked] = useState(false)

  function pick(item: string) {
    if (locked) return
    const expect = question.correctOrder[filled.length]
    playSfx('tap', 0.3)
    if (item !== expect) {
      playSfx('wrong', 0.45)
      setLocked(true)
      window.setTimeout(() => onResult(false), 500)
      return
    }
    playSfx('correct', 0.4)
    const nextFilled = [...filled, item]
    setFilled(nextFilled)
    setRemain((r) => r.filter((x) => x !== item))
    if (nextFilled.length >= question.correctOrder.length) {
      setLocked(true)
      playSfx('success', 0.55)
      window.setTimeout(() => onResult(true), 500)
    }
  }

  return (
    <div className="play-stage grounded">
      <p className="nes-prompt" style={{ margin: 8 }}>
        {question.prompt}
        {'\n'}依序把步驟推進水管！
      </p>
      <div className="pipe-track">
        {question.correctOrder.map((_, i) => (
          <div key={i} className="pipe-slot">
            {i + 1}. {filled[i] ?? '（空）'}
          </div>
        ))}
        <div className="pipe-options">
          {remain.map((item) => (
            <button
              key={item}
              type="button"
              className="pipe-chip"
              disabled={locked}
              onClick={() => pick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
