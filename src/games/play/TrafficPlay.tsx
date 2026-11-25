import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayCountdown } from './PlayCountdown'
import { PlayHero, type HeroMood } from './PlayHero'
import { usePlayReady } from './usePlayReady'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
  introCountdown?: boolean
}

/** 安全島：通用守護場景，選最安全的做法（適用交通／校園／生活） */
export function TrafficPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [mood, setMood] = useState<HeroMood>('idle')
  const [heroBottom, setHeroBottom] = useState('16%')

  useEffect(() => {
    setLocked(false)
    setFlash(null)
    setBurst(null)
    setMood('idle')
    setHeroBottom('16%')
  }, [question.id])

  function pick(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setFlash(i)
    const ok = roads[i]?.correct ?? false
    setBurst(ok)
    setMood(ok ? 'cheer' : 'oops')
    if (ok) setHeroBottom('34%')
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 780)
  }

  const busy = !ready || locked

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage traffic-stage">
        <div className="safety-scene" aria-hidden>
          <span className="safety-mesa m1" />
          <span className="safety-mesa m2" />
          <span className="safety-gate left" />
          <span className="safety-gate right" />
          <span className="safety-path" />
          <span className="safety-shield">
            <span className="safety-shield-core">
              <span className="safety-shield-mark">◆</span>
            </span>
          </span>
        </div>
        <p className="play-stage-tip">
          {ready ? '想清楚，選最安全的做法' : '先讀題再選'}
        </p>
        <PlayHero
          pose="fork"
          mood={mood}
          className={!locked && ready && mood === 'idle' ? 'is-stroll' : ''}
          style={{ left: '50%', bottom: heroBottom }}
        />
        {burst != null ? <PlayBurst ok={burst} y="42%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <p className="play-pick-hint">
          {locked ? (burst ? '這樣最安全' : '再想想更安全的做法') : '哪一個最安全？'}
        </p>
        <div className="play-pick-grid cols-3">
          {roads.map((r, i) => (
            <motion.button
              key={`${question.id}-tr-${i}`}
              type="button"
              className={`play-pick-btn ${
                flash === i ? (r.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={busy}
              onClick={() => pick(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.2 }}
              whileTap={{ scale: 0.96 }}
            >
              {r.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
