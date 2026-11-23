import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

export function ForkPlay({ question, onResult }: Props) {
  const roads = useMemo(() => {
    const list = question.choices.slice(0, 3).map((label, i) => ({
      label,
      correct: i === question.answerIndex,
    }))
    while (list.length < 3) {
      list.push({ label: '……', correct: false })
    }
    return list
  }, [question])

  const [hero, setHero] = useState({ left: '50%', bottom: '22%' })
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)

  function pick(i: number) {
    if (locked) return
    setLocked(true)
    const lefts = ['18%', '50%', '82%']
    setHero({ left: lefts[i]!, bottom: '48%' })
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
      <p className="nes-prompt" style={{ margin: 8, position: 'relative', zIndex: 2 }}>
        {question.prompt}
      </p>
      <div className="fork-hero" style={hero} />
      {roads.map((r, i) => (
        <button
          key={`${question.id}-fork-${i}`}
          type="button"
          className="fork-choice"
          style={{
            left: `${10 + i * 30}%`,
            background: flash === i ? (r.correct ? '#00a800' : '#e52521') : '#2038ec',
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
