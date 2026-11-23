import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

export function JumpPlay({ question, onResult }: Props) {
  const slots = useMemo(() => {
    const picks = pickPlayChoices(question, 4)
    const n = Math.max(picks.length, 1)
    return picks.map((p, i) => ({
      ...p,
      left: `${6 + (i * 88) / n}%`,
      width: `${Math.min(24, 80 / n)}%`,
    }))
  }, [question])

  const [heroLeft, setHeroLeft] = useState('50%')
  const [heroBottom, setHeroBottom] = useState('28%')
  const [flash, setFlash] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  function jumpTo(i: number) {
    if (locked) return
    setLocked(true)
    const slot = slots[i]!
    setHeroLeft(slot.left)
    setHeroBottom('38%')
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      if (slot.correct) {
        playSfx('correct', 0.55)
        setHeroBottom('48%')
        window.setTimeout(() => onResult(true), 650)
      } else {
        playSfx('wrong', 0.45)
        setHeroBottom('8%')
        window.setTimeout(() => onResult(false), 700)
      }
    }, 280)
  }

  return (
    <div className="play-stage grounded">
      <p className="nes-prompt" style={{ margin: 8 }}>
        {question.prompt}
        {'\n'}跳上正確的平台！
      </p>
      <div className="jump-hero" style={{ left: heroLeft, bottom: heroBottom }} />
      {slots.map((s, i) => (
        <button
          key={`${question.id}-${i}-${s.label}`}
          type="button"
          className={`jump-platform ${
            flash === i ? (s.correct ? 'correct-flash' : 'wrong-flash') : ''
          }`}
          style={{ left: s.left, width: s.width, minWidth: s.width }}
          disabled={locked}
          onClick={() => jumpTo(i)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
