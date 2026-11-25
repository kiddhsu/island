import { useEffect, useMemo, useRef, useState } from 'react'
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

const STROLL_MIN = 28
const STROLL_MAX = 72
/** 人物站在選項下方，避免擋住路牌 */
const HERO_BOTTOM = '9%'

export function ForkPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const roads = useMemo(() => pickPlayChoices(question, 3), [question])

  const [heroLeft, setHeroLeft] = useState(50)
  const [heroBottom, setHeroBottom] = useState(HERO_BOTTOM)
  const [mood, setMood] = useState<HeroMood>('idle')
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )
  const dirRef = useRef(1)
  const busy = !ready || locked

  useEffect(() => {
    setHeroLeft(50)
    setHeroBottom(HERO_BOTTOM)
    setMood('idle')
    setLocked(false)
    setFlash(null)
    setBurst(null)
    dirRef.current = Math.random() > 0.5 ? 1 : -1
  }, [question.id])

  // 閒置時左右散步
  useEffect(() => {
    if (!ready || locked) return
    const timer = window.setInterval(() => {
      setHeroLeft((x) => {
        let next = x + dirRef.current * 0.55
        if (next >= STROLL_MAX) {
          next = STROLL_MAX
          dirRef.current = -1
        } else if (next <= STROLL_MIN) {
          next = STROLL_MIN
          dirRef.current = 1
        }
        return next
      })
    }, 40)
    return () => window.clearInterval(timer)
  }, [ready, locked, question.id])

  function pick(i: number) {
    if (busy) return
    setLocked(true)
    const lefts = [18, 50, 82]
    const left = lefts[i] ?? 50
    setMood('leap')
    setHeroLeft(left)
    setHeroBottom('48%')
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = roads[i]?.correct ?? false
      setBurst({ ok, x: `${left}%`, y: '40%' })
      setMood(ok ? 'cheer' : 'oops')
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 780)
    }, 340)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage fork-stage">
        <div className="fork-road" aria-hidden />
        <p className="play-stage-tip">
          {ready ? '點路上的答案前進' : '先讀完題目再選路'}
        </p>
        <PlayHero
          pose="fork"
          mood={mood}
          className={!locked && ready && mood === 'idle' ? 'is-stroll' : ''}
          style={{ left: `${heroLeft}%`, bottom: heroBottom }}
        />
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
