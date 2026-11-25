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
  introCountdown?: boolean
}

/** 心情島：點破正確的心情氣球 */
export function PopPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const balloons = useMemo(() => pickPlayChoices(question, 4), [question])
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )
  const [gone, setGone] = useState<number | null>(null)
  const [floatOn, setFloatOn] = useState(false)

  useEffect(() => {
    setLocked(false)
    setBurst(null)
    setGone(null)
    setFloatOn(false)
  }, [question.id])

  useEffect(() => {
    if (ready) setFloatOn(true)
  }, [ready])

  function pick(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setGone(i)
    const ok = balloons[i]?.correct ?? false
    const left = 18 + (i % 4) * 20
    setBurst({ ok, x: `${left}%`, y: '42%' })
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 750)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className={`play-stage pop-stage ${floatOn ? 'is-floating' : ''}`}>
        <p className="play-stage-tip">
          {ready ? '點破正確的氣球！' : '先看清楚再點'}
        </p>
        {balloons.map((b, i) => (
          <button
            key={`${question.id}-pop-${i}-${b.label}`}
            type="button"
            className={`pop-balloon n${i} ${gone === i ? (b.correct ? 'is-ok' : 'is-bad') : ''}`}
            style={{ ['--i' as string]: i }}
            disabled={!ready || locked}
            onClick={() => pick(i)}
          >
            <span className="pop-balloon-body">{b.label}</span>
            <span className="pop-balloon-string" />
          </button>
        ))}
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
    </div>
  )
}
