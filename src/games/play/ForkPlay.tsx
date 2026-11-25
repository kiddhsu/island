import { useMemo, useState } from 'react'
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

export function ForkPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])

  const [hero, setHero] = useState({ left: '50%', bottom: '22%' })
  const [mood, setMood] = useState<HeroMood>('idle')
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
    setMood('leap')
    setHero({ left, bottom: '48%' })
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = roads[i]?.correct ?? false
      setBurst({ ok, x: left, y: '40%' })
      setMood(ok ? 'cheer' : 'oops')
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 780)
    }, 340)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage">
        <div className="fork-road" />
        <p className="play-stage-tip">
          {ready ? '點路上的答案前進' : '先讀完題目再選路'}
        </p>
        <PlayHero pose="fork" mood={mood} style={hero} />
        {roads.map((r, i) => (
          <motion.button
            key={`${question.id}-fork-${i}-${r.label}`}
            type="button"
            className={`fork-choice ${
              flash === i ? (r.correct ? 'is-ok' : 'is-bad') : ''
            }`}
            style={{ left: `${10 + i * 30}%` }}
            disabled={busy}
            onClick={() => pick(i)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 360, damping: 22 }}
            whileTap={{ scale: 0.96 }}
          >
            {r.label}
          </motion.button>
        ))}
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
    </div>
  )
}
