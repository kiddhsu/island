import { useEffect, useMemo, useState } from 'react'
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

/** 安全島：看燈號，選最安全的做法 */
export function TrafficPlay({ question, onResult }: Props) {
  const { ready, onReady } = usePlayReady(question.id)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])
  const [light, setLight] = useState<'red' | 'yellow' | 'green'>('red')
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setLocked(false)
    setFlash(null)
    setBurst(null)
    setLight('red')
  }, [question.id])

  useEffect(() => {
    if (!ready) return
    setLight('red')
    const t1 = window.setTimeout(() => setLight('yellow'), 700)
    const t2 = window.setTimeout(() => setLight('green'), 1400)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [ready, question.id])

  function pick(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setFlash(i)
    const ok = roads[i]?.correct ?? false
    setBurst(ok)
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 750)
  }

  const busy = !ready || locked

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage traffic-stage">
        <div className={`traffic-light is-${light}`} aria-hidden>
          <span className="tl red" />
          <span className="tl yellow" />
          <span className="tl green" />
        </div>
        <p className="play-stage-tip">
          {ready ? '選最安全的做法過馬路' : '先讀題，燈亮再選'}
        </p>
        <div className="traffic-crosswalk" />
        <PlayHero pose="fork" style={{ left: '50%', bottom: '18%' }} />
        {burst != null ? <PlayBurst ok={burst} y="48%" /> : null}
        {!ready ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <div className="play-pick-grid cols-3">
          {roads.map((r, i) => (
            <button
              key={`${question.id}-tr-${i}`}
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
