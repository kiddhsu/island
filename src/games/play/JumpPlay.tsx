import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayHero } from './PlayHero'
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
      mid: `${6 + (i * 88) / n + Math.min(24, 80 / n) / 2}%`,
    }))
  }, [question])

  const [heroLeft, setHeroLeft] = useState('50%')
  const [heroBottom, setHeroBottom] = useState('28%')
  const [flash, setFlash] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )

  function jumpTo(i: number) {
    if (locked) return
    setLocked(true)
    const slot = slots[i]!
    setHeroLeft(slot.mid)
    setHeroBottom('38%')
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = slot.correct
      setBurst({ ok, x: slot.mid, y: '36%' })
      if (ok) {
        playSfx('correct', 0.55)
        setHeroBottom('48%')
        window.setTimeout(() => onResult(true), 750)
      } else {
        playSfx('wrong', 0.45)
        setHeroBottom('8%')
        window.setTimeout(() => onResult(false), 800)
      }
    }, 280)
  }

  return (
    <div className="play-stage grounded">
      <p className="app-prompt" style={{ margin: 8 }}>
        {question.prompt}
        {'\n'}跳上正確的平台！
      </p>
      <PlayHero
        pose="jump"
        style={{ left: heroLeft, bottom: heroBottom }}
      />
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
      {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
    </div>
  )
}
