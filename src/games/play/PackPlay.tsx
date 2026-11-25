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

/** 自理島：把正確的習慣／物品裝進背包 */
export function PackPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const items = useMemo(() => pickPlayChoices(question, 4), [question])
  const [packed, setPacked] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setPacked(null)
    setLocked(false)
    setBurst(null)
  }, [question.id])

  function pack(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setPacked(i)
    const ok = items[i]?.correct ?? false
    setBurst(ok)
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 750)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage pack-stage">
        <p className="play-stage-tip">
          {ready ? '點正確的放進背包' : '先想清楚再裝'}
        </p>
        <div className={`pack-bag ${packed != null ? 'is-closed' : ''}`}>
          <div className="pack-bag-body">
            <span className="pack-bag-pocket" />
            {packed != null ? (
              <span className="pack-bag-item">{items[packed]?.label}</span>
            ) : (
              <span className="pack-bag-empty">背包空空的</span>
            )}
          </div>
        </div>
        {burst != null ? <PlayBurst ok={burst} y="40%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <div className="play-pick-grid">
          {items.map((it, i) => (
            <button
              key={`${question.id}-pack-${i}`}
              type="button"
              className={`play-pick-btn ${
                packed === i ? (it.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked}
              onClick={() => pack(i)}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
