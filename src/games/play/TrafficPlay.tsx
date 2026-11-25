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

/** 安全島：看燈號，選最安全的做法 */
export function TrafficPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])
  const [light, setLight] = useState<'red' | 'yellow' | 'green'>('red')
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [mood, setMood] = useState<HeroMood>('idle')
  const [heroBottom, setHeroBottom] = useState('18%')

  useEffect(() => {
    setLocked(false)
    setFlash(null)
    setBurst(null)
    setLight('red')
    setMood('idle')
    setHeroBottom('18%')
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
    setMood(ok ? 'cheer' : 'oops')
    if (ok) setHeroBottom('28%')
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 780)
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
        <PlayHero
          pose="fork"
          mood={mood}
          style={{ left: '50%', bottom: heroBottom }}
        />
        {burst != null ? <PlayBurst ok={burst} y="48%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
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
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 380, damping: 24 }}
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
