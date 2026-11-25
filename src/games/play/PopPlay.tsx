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

/** 錯落高度／水平，製造遠近層次（柔霧幾何風） */
const BALLOON_LAYOUT = [
  { left: '6%', bottom: '28%', size: 1.08, delay: 0 },
  { left: '28%', bottom: '46%', size: 0.92, delay: 0.35 },
  { left: '52%', bottom: '22%', size: 1.14, delay: 0.12 },
  { left: '74%', bottom: '40%', size: 0.98, delay: 0.55 },
] as const

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
    const layout = BALLOON_LAYOUT[i] ?? BALLOON_LAYOUT[0]
    setBurst({ ok, x: `calc(${layout.left} + 12%)`, y: '36%' })
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResult(ok), 780)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className={`play-stage pop-stage ${floatOn ? 'is-floating' : ''}`}>
        <div className="pop-sky" aria-hidden>
          <span className="pop-terrace t1" />
          <span className="pop-terrace t2" />
          <span className="pop-terrace t3" />
        </div>
        <p className="play-stage-tip">
          {ready ? '點破正確的氣球！' : '先看清楚再點'}
        </p>
        {balloons.map((b, i) => {
          const layout = BALLOON_LAYOUT[i] ?? BALLOON_LAYOUT[0]
          return (
            <motion.button
              key={`${question.id}-pop-${i}-${b.label}`}
              type="button"
              className={`pop-balloon n${i} ${
                gone === i ? (b.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              style={{
                left: layout.left,
                bottom: layout.bottom,
                ['--i' as string]: i,
                ['--float-delay' as string]: `${layout.delay}s`,
                ['--balloon-scale' as string]: layout.size,
              }}
              disabled={!ready || locked}
              onClick={() => pick(i)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                gone === i
                  ? { opacity: 0, scale: 1.4 }
                  : { opacity: 1, scale: layout.size }
              }
              transition={{
                delay: gone === i ? 0 : 0.08 * i,
                type: 'spring',
                stiffness: 280,
                damping: 16,
              }}
              whileTap={gone === i ? undefined : { scale: layout.size * 1.06 }}
            >
              <span className="pop-balloon-drift">
                <span className="pop-balloon-body">
                  <span className="pop-balloon-facet" aria-hidden />
                  <span className="pop-balloon-label">{b.label}</span>
                </span>
                <span className="pop-balloon-knot" aria-hidden />
                <span className="pop-balloon-string" aria-hidden />
              </span>
            </motion.button>
          )
        })}
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
    </div>
  )
}
