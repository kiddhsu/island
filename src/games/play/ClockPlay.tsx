import { useEffect, useMemo, useState } from 'react'
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

/** 從題幹解析時針／分針指到的鐘點數字 */
export function parseClockPrompt(prompt: string): { hour: number; minute: number } | null {
  const m = prompt.match(/時針指\s*(\d+)\s*[、,，]\s*分針指\s*(\d+)/)
  if (!m) return null
  const hourNum = Number(m[1])
  const minNum = Number(m[2])
  if (!Number.isFinite(hourNum) || !Number.isFinite(minNum)) return null
  const hour = ((hourNum - 1 + 12) % 12) + 1
  // 鐘面數字 → 分鐘：12=0、3=15、6=30、9=45
  const minute = (minNum % 12) * 5
  return { hour, minute }
}

function handAngles(hour: number, minute: number) {
  const minuteDeg = minute * 6
  const hourDeg = (hour % 12) * 30 + minute * 0.5
  return { hourDeg, minuteDeg }
}

/** 時鐘島：看鐘面，點正確時刻 */
export function ClockPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const marks = useMemo(() => pickPlayChoices(question, 4), [question])
  const parsed = useMemo(() => parseClockPrompt(question.prompt), [question.prompt])
  const angles = useMemo(
    () => (parsed ? handAngles(parsed.hour, parsed.minute) : { hourDeg: 0, minuteDeg: 0 }),
    [parsed],
  )
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

  const ticks = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage clock-stage">
        <p className="play-stage-tip">
          {ready ? '看鐘面，點正確的時刻' : '先看題目'}
        </p>
        <div className="clock-face" aria-hidden={!parsed}>
          <span className="clock-pedestal" />
          <span className="clock-face-ring" />
          <span className="clock-face-disc">
            <span className="clock-face-shade-l" />
            <span className="clock-face-shade-r" />
            {ticks.map((t) => (
              <span
                key={t}
                className={`clock-tick ${t % 3 === 0 ? 'is-major' : ''}`}
                style={{ transform: `rotate(${t * 30}deg)` }}
              />
            ))}
            {[12, 3, 6, 9].map((n) => (
              <span key={n} className={`clock-num n${n}`}>
                {n}
              </span>
            ))}
            <motion.span
              className="clock-hand hour"
              animate={{ rotate: angles.hourDeg }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
            <motion.span
              className="clock-hand minute"
              animate={{ rotate: angles.minuteDeg }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            />
            <span className="clock-hub" />
          </span>
        </div>
        {burst != null ? <PlayBurst ok={burst} y="28%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <p className="play-pick-hint">
          {locked ? (burst ? '答對了！' : '再看一次鐘') : '這是幾點？'}
        </p>
        <div className="play-pick-grid">
          {marks.map((m, i) => (
            <motion.button
              key={`${question.id}-clk-${i}`}
              type="button"
              className={`play-pick-btn ${
                picked === i ? (m.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked}
              onClick={() => pick(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
