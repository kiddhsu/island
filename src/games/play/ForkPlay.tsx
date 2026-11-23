import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayCountdown } from './PlayCountdown'
import { PlayHero } from './PlayHero'
import { usePlayReady } from './usePlayReady'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

export function ForkPlay({ question, onResult }: Props) {
  const { ready, onReady } = usePlayReady(question.id)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])

  const [hero, setHero] = useState({ left: '50%', bottom: '22%' })
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )
  const busy = !ready || locked

  function pick(i: number) {
    if (busy) return
    setLocked(true)
    const lefts = ['18%', '50%', '82%']
    const left = lefts[i] ?? '50%'
    setHero({ left, bottom: '48%' })
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = roads[i]?.correct ?? false
      setBurst({ ok, x: left, y: '40%' })
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 750)
    }, 320)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage">
        <div className="fork-road" />
        <p className="play-stage-tip">
          {ready ? '選正確的路前進' : '先讀完題目再選路'}
        </p>
        <PlayHero pose="fork" style={hero} />
        {roads.map((r, i) => (
          <button
            key={`${question.id}-fork-${i}-${r.label}`}
            type="button"
            className={`fork-choice ${
              flash === i ? (r.correct ? 'is-ok' : 'is-bad') : ''
            }`}
            style={{ left: `${10 + i * 30}%` }}
            disabled={busy}
            onClick={() => pick(i)}
          >
            {r.label}
          </button>
        ))}
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {!ready ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <div className="play-pick-grid cols-3">
          {roads.map((r, i) => (
            <button
              key={`pick-${question.id}-${i}`}
              type="button"
              className={`play-pick-btn ${
                flash === i ? (r.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={busy}
              onClick={() => pick(i)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
