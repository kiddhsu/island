import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

export function ForkPlay({ question, onResult }: Props) {
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])

  const [hero, setHero] = useState({ left: '50%', bottom: '22%' })
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)

  function pick(i: number) {
    if (locked) return
    setLocked(true)
    const lefts = ['18%', '50%', '82%']
    setHero({ left: lefts[i] ?? '50%', bottom: '48%' })
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = roads[i]?.correct ?? false
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 650)
    }, 320)
  }

  return (
    <div className="play-stage">
      <div className="fork-road" />
      <p className="app-prompt" style={{ margin: 8, position: 'relative', zIndex: 2 }}>
        {question.prompt}
        {'\n'}選正確的路前進
      </p>
      <div className="fork-hero" style={hero} />
      {roads.map((r, i) => (
        <button
          key={`${question.id}-fork-${i}-${r.label}`}
          type="button"
          className="fork-choice"
          style={{
            left: `${10 + i * 30}%`,
            background:
              flash === i
                ? r.correct
                  ? '#2f9e5b'
                  : '#e4572e'
                : 'rgba(255,255,255,0.95)',
            color: flash === i ? '#fff' : '#1c2a3a',
          }}
          disabled={locked}
          onClick={() => pick(i)}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
