import { useEffect, useMemo, useState } from 'react'
import type { OrderQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
import { PlayBurst } from './PlayBurst'
import type { PlayResultHandler } from './types'

type Props = {
  question: OrderQuestion
  onResult: PlayResultHandler
}

export function PipePlay({ question, onResult }: Props) {
  const steps = question.items
  const pool = useMemo(
    () => shuffle(steps),
    // 每題重洗一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  )
  const [filled, setFilled] = useState<string[]>([])
  const [remain, setRemain] = useState<string[]>(pool)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setFilled([])
    setRemain(shuffle(steps))
    setLocked(false)
    setBurst(null)
  }, [question.id, steps])

  function pick(item: string) {
    if (locked) return
    const expect = question.correctOrder[filled.length]
    playSfx('tap', 0.3)
    if (item !== expect) {
      playSfx('wrong', 0.45)
      setBurst(false)
      setLocked(true)
      window.setTimeout(() => onResult(false), 700)
      return
    }
    playSfx('correct', 0.4)
    const nextFilled = [...filled, item]
    setFilled(nextFilled)
    setRemain((r) => r.filter((x) => x !== item))
    if (nextFilled.length >= question.correctOrder.length) {
      setBurst(true)
      setLocked(true)
      playSfx('success', 0.55)
      window.setTimeout(() => onResult(true), 700)
    }
  }

  const nextHint = question.correctOrder[filled.length]

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage grounded pipe-stage">
        <div className="pipe-track">
          {question.correctOrder.map((_, i) => (
            <div
              key={i}
              className={`pipe-slot ${filled[i] ? 'is-filled' : ''} ${
                i === filled.length && !locked ? 'is-next' : ''
              }`}
            >
              <span className="pipe-slot-num">{i + 1}</span>
              <span className="pipe-slot-text">
                {filled[i] ?? (i === filled.length ? '下一個 →' : '（空）')}
              </span>
            </div>
          ))}
        </div>
        {burst != null ? <PlayBurst ok={burst} y="55%" /> : null}
      </div>

      <div className="play-pick-panel">
        <p className="play-pick-hint">
          {locked
            ? burst
              ? '完成！'
              : '順序錯了'
            : `點選第 ${filled.length + 1} 步${nextHint ? '（想想：什麼要先做？）' : ''}`}
        </p>
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
