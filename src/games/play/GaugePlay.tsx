import { useEffect, useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayCountdown } from './PlayCountdown'
import { usePlayReady } from './usePlayReady'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

/** 量尺島：在量尺／刻度上點正確答案 */
export function GaugePlay({ question, onResult }: Props) {
  const { ready, onReady } = usePlayReady(question.id)
  const marks = useMemo(() => pickPlayChoices(question, 4), [question])
  const [locked, setLocked] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [needle, setNeedle] = useState(8)

  useEffect(() => {
    setLocked(false)
    setPicked(null)
    setBurst(null)
    setNeedle(8)
  }, [question.id])

  useEffect(() => {
    if (!ready) return
    const timer = window.setInterval(() => {
      setNeedle((n) => (n >= 92 ? 8 : n + 2.2))
    }, 40)
    return () => window.clearInterval(timer)
  }, [ready, question.id, locked])

  function pick(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setPicked(i)
    const ok = marks[i]?.correct ?? false
    setBurst(ok)
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 750)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage gauge-stage">
        <p className="play-stage-tip">
          {ready ? '看刻度，點正確的答案' : '先看題目'}
        </p>
        <div className="gauge-rail" aria-hidden>
          <div className="gauge-track" />
          <div className="gauge-needle" style={{ left: `${needle}%` }} />
        </div>
        <div className="gauge-marks">
          {marks.map((m, i) => (
            <button
              key={`${question.id}-g-${i}`}
              type="button"
              className={`gauge-mark ${
                picked === i ? (m.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              style={{ left: `${14 + i * 24}%` }}
              disabled={!ready || locked}
              onClick={() => pick(i)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {burst != null ? <PlayBurst ok={burst} y="36%" /> : null}
        {!ready ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <div className="play-pick-grid">
          {marks.map((m, i) => (
            <button
              key={`${question.id}-gp-${i}`}
              type="button"
              className={`play-pick-btn ${
                picked === i ? (m.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked}
              onClick={() => pick(i)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
