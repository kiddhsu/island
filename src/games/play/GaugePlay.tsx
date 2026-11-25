import { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
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

const GaugeNeedle = memo(function GaugeNeedle({
  locked,
  ready,
  pickIndex,
}: {
  locked: boolean
  ready: boolean
  pickIndex: number | null
}) {
  const [needle, setNeedle] = useState(8)

  useEffect(() => {
    setNeedle(8)
  }, [ready])

  useEffect(() => {
    if (pickIndex != null) {
      setNeedle(14 + pickIndex * 24)
    }
  }, [pickIndex])

  useEffect(() => {
    if (!ready || locked) return
    const timer = window.setInterval(() => {
      setNeedle((n) => (n >= 92 ? 8 : n + 2.2))
    }, 40)
    return () => window.clearInterval(timer)
  }, [ready, locked])

  return (
    <motion.div
      className="gauge-needle"
      animate={{ left: `${needle}%` }}
      transition={
        locked
          ? { type: 'spring', stiffness: 280, damping: 20 }
          : { duration: 0.04, ease: 'linear' }
      }
    />
  )
})

/** 量尺島：在量尺／刻度上點正確答案 */
export function GaugePlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const marks = useMemo(() => pickPlayChoices(question, 4), [question])
  const [locked, setLocked] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setLocked(false)
    setPicked(null)
    setBurst(null)
  }, [question.id])

  function pick(i: number) {
    if (!ready || locked) return
    setLocked(true)
    setPicked(i)
    const ok = marks[i]?.correct ?? false
    setBurst(ok)
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 780)
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
          <GaugeNeedle locked={locked} ready={ready} pickIndex={picked} />
        </div>
        <div className="gauge-marks">
          {marks.map((m, i) => (
            <motion.button
              key={`${question.id}-g-${i}`}
              type="button"
              className={`gauge-mark ${
                picked === i ? (m.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked}
              onClick={() => pick(i)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04 * i, duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>
        {burst != null ? <PlayBurst ok={burst} y="36%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
    </div>
  )
}
