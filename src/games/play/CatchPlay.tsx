import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
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
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const pack = useMemo(() => pickPlayChoices(question, 4), [question])

  useEffect(() => {
    ended.current = false
    setLocked(false)
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

  useEffect(() => {
    if (locked || ended.current) return

    for (const it of items) {
      // 角色在底部約 78~88% 高度帶接住
      if (it.y < 74 || it.y > 90) continue
      if (Math.abs(it.x - heroX) > 16) continue
      ended.current = true
      setLocked(true)
      if (it.correct) {
        playSfx('correct', 0.55)
        window.setTimeout(() => onResultRef.current(true), 400)
      } else {
        playSfx('wrong', 0.45)
        window.setTimeout(() => onResultRef.current(false), 450)
      }
      return
    }

    // 全部掉出畫面：重掉一次，不直接判錯（避免操作來不及）
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
    // 點擊掉落物也可接住（平板較好操作）
    if (it.y < 20 || it.y > 95) return
    ended.current = true
    setLocked(true)
    playSfx('tap', 0.3)
    if (it.correct) {
      playSfx('correct', 0.55)
      window.setTimeout(() => onResultRef.current(true), 400)
    } else {
      playSfx('wrong', 0.45)
      window.setTimeout(() => onResultRef.current(false), 450)
    }
  }

  return (
    <div>
      <div className="play-stage grounded">
        <p className="nes-prompt" style={{ margin: 8 }}>
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
        <div className="catch-hero" style={{ left: `calc(${heroX}% - 24px)` }} />
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
