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

export function JumpPlay({ question, onResult }: Props) {
  const { ready, onReady } = usePlayReady(question.id)
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
  const busy = !ready || locked

  function jumpTo(i: number) {
    if (busy) return
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
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage grounded">
        <p className="play-stage-tip">
          {ready ? '點平台或下方答案跳上去' : '先看清楚再跳'}
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
            disabled={busy}
            onClick={() => jumpTo(i)}
          >
            {s.label}
          </button>
        ))}
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {!ready ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <div className="play-pick-grid">
          {slots.map((s, i) => (
            <button
              key={`pick-${question.id}-${i}`}
              type="button"
              className={`play-pick-btn ${
                flash === i ? (s.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={busy}
              onClick={() => jumpTo(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
