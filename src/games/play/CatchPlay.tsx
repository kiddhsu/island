import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayHero } from './PlayHero'
import type { PlayResultHandler } from './types'

type Falling = {
  id: string
  label: string
  correct: boolean
  x: number
  y: number
}

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

export function CatchPlay({ question, onResult }: Props) {
  const [heroX, setHeroX] = useState(50)
  const [items, setItems] = useState<Falling[]>([])
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )
  const ended = useRef(false)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const pack = useMemo(() => pickPlayChoices(question, 4), [question])

  useEffect(() => {
    ended.current = false
    setLocked(false)
    setBurst(null)
    setHeroX(50)
    setItems(
      pack.map((p, i) => ({
        id: `${question.id}-${i}`,
        label: p.label,
        correct: p.correct,
        x: 15 + i * 22,
        y: -8 - i * 28,
      })),
    )
  }, [pack, question.id])

  useEffect(() => {
    if (locked) return
    const timer = window.setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, y: it.y + 0.75 })))
    }, 50)
    return () => window.clearInterval(timer)
  }, [locked, question.id])

  function finish(ok: boolean, x: number, y: number) {
    if (ended.current) return
    ended.current = true
    setLocked(true)
    setBurst({
      ok,
      x: `${x}%`,
      y: `${Math.min(78, Math.max(28, y))}%`,
    })
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResultRef.current(ok), ok ? 700 : 750)
  }

  useEffect(() => {
    if (locked || ended.current) return

    for (const it of items) {
      if (it.y < 74 || it.y > 90) continue
      if (Math.abs(it.x - heroX) > 16) continue
      finish(it.correct, it.x, it.y)
      return
    }

    if (items.length && items.every((it) => it.y > 108) && !ended.current) {
      setItems((prev) =>
        prev.map((it, i) => ({
          ...it,
          y: -8 - i * 28,
          x: 15 + i * 22,
        })),
      )
    }
  }, [items, heroX, locked])

  function move(dx: number) {
    if (locked) return
    playSfx('tap', 0.2)
    setHeroX((x) => Math.min(88, Math.max(12, x + dx)))
  }

  function tapItem(it: Falling) {
    if (locked || ended.current) return
    if (it.y < 20 || it.y > 95) return
    playSfx('tap', 0.3)
    finish(it.correct, it.x, it.y)
  }

  return (
    <div>
      <div className="play-stage grounded">
        <p className="app-prompt" style={{ margin: 8 }}>
          {question.prompt}
          {'\n'}左右移動接住正確答案，或直接點它！
        </p>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className="catch-item"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            disabled={locked}
            onClick={() => tapItem(it)}
          >
            {it.label}
          </button>
        ))}
        <PlayHero
          pose="catch"
          style={{ left: `calc(${heroX}% - 28px)` }}
        />
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
      </div>
      <div className="ctrl-bar">
        <button type="button" className="ctrl-pad" onClick={() => move(-14)}>
          ◀
        </button>
        <button type="button" className="ctrl-pad" onClick={() => move(14)}>
          ▶
        </button>
      </div>
    </div>
  )
}
