import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
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
  const ended = useRef(false)

  const pack = useMemo(() => {
    return shuffle(
      question.choices.map((label, i) => ({
        label,
        correct: i === question.answerIndex,
      })),
    )
  }, [question])

  useEffect(() => {
    ended.current = false
    setLocked(false)
    setItems(
      pack.map((p, i) => ({
        id: `${question.id}-${i}`,
        label: p.label,
        correct: p.correct,
        x: 18 + i * 22,
        y: -10 - i * 18,
      })),
    )
  }, [pack, question.id])

  useEffect(() => {
    if (locked) return
    const timer = window.setInterval(() => {
      setItems((prev) =>
        prev.map((it) => ({ ...it, y: it.y + 2.2 })),
      )
    }, 40)
    return () => window.clearInterval(timer)
  }, [locked, question.id])

  useEffect(() => {
    if (locked || ended.current) return
    for (const it of items) {
      if (it.y < 72 || it.y > 92) continue
      if (Math.abs(it.x - heroX) > 12) continue
      ended.current = true
      setLocked(true)
      if (it.correct) {
        playSfx('correct', 0.55)
        window.setTimeout(() => onResult(true), 400)
      } else {
        playSfx('wrong', 0.45)
        window.setTimeout(() => onResult(false), 450)
      }
      return
    }
    if (items.length && items.every((it) => it.y > 105) && !ended.current) {
      ended.current = true
      setLocked(true)
      playSfx('wrong', 0.4)
      window.setTimeout(() => onResult(false), 400)
    }
  }, [items, heroX, locked, onResult])

  function move(dx: number) {
    if (locked) return
    playSfx('tap', 0.25)
    setHeroX((x) => Math.min(90, Math.max(10, x + dx)))
  }

  return (
    <div>
      <div className="play-stage grounded">
        <p className="nes-prompt" style={{ margin: 8 }}>
          {question.prompt}
          {'\n'}左右移動，只接正確的！
        </p>
        {items.map((it) => (
          <div
            key={it.id}
            className="catch-item"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
          >
            {it.label}
          </div>
        ))}
        <div className="catch-hero" style={{ left: `calc(${heroX}% - 24px)` }} />
      </div>
      <div className="ctrl-bar">
        <button type="button" className="ctrl-pad" onClick={() => move(-12)}>
          ◀
        </button>
        <button type="button" className="ctrl-pad" onClick={() => move(12)}>
          ▶
        </button>
      </div>
    </div>
  )
}
