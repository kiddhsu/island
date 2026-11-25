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

/** 錯落高度，比較像浮空石台 */
const PLATFORM_BOTTOM = ['12%', '22%', '10%', '20%'] as const

export function JumpPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const slots = useMemo(() => {
    const picks = pickPlayChoices(question, 4)
    const n = Math.max(picks.length, 1)
    return picks.map((p, i) => ({
      ...p,
      left: `${5 + (i * 90) / n}%`,
      width: `${Math.min(22, 78 / n)}%`,
      mid: `${5 + (i * 90) / n + Math.min(22, 78 / n) / 2}%`,
      bottom: PLATFORM_BOTTOM[i % PLATFORM_BOTTOM.length]!,
    }))
  }, [question])

  const [heroLeft, setHeroLeft] = useState('50%')
  const [heroBottom, setHeroBottom] = useState('6%')
  const [mood, setMood] = useState<HeroMood>('idle')
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
    setMood('leap')
    setHeroLeft(slot.mid)
    // 跳到該平台略上方
    const base = Number.parseFloat(slot.bottom)
    setHeroBottom(`${base + 14}%`)
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setFlash(i)
      const ok = slot.correct
      setBurst({ ok, x: slot.mid, y: `${base + 20}%` })
      if (ok) {
        playSfx('correct', 0.55)
        setMood('cheer')
        setHeroBottom(`${base + 18}%`)
        window.setTimeout(() => onResult(true), 820)
      } else {
        playSfx('wrong', 0.45)
        setMood('fall')
        setHeroBottom('4%')
        window.setTimeout(() => onResult(false), 880)
      }
    }, 320)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage grounded jump-stage">
        <div className="jump-sky" aria-hidden>
          <span className="jump-mesa m1" />
          <span className="jump-mesa m2" />
        </div>
        <p className="play-stage-tip">
          {ready ? '點正確的平台跳上去' : '先看清楚再跳'}
        </p>
        <PlayHero
          pose="jump"
          mood={mood}
          style={{ left: heroLeft, bottom: heroBottom }}
        />
        {slots.map((s, i) => (
          <motion.button
            key={`${question.id}-${i}-${s.label}`}
            type="button"
            className={`jump-platform ${
              flash === i ? (s.correct ? 'correct-flash' : 'wrong-flash') : ''
            }`}
            style={{ left: s.left, width: s.width, bottom: s.bottom }}
            disabled={busy}
            onClick={() => jumpTo(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 20 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="jump-plat-shadow" aria-hidden />
            <span className="jump-plat-block">
              <span className="jump-plat-cliff" aria-hidden />
              <span className="jump-plat-top" aria-hidden />
              <span className="jump-plat-side-l" aria-hidden />
              <span className="jump-plat-side-r" aria-hidden />
              <span className="jump-plat-label">{s.label}</span>
            </span>
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
