import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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

/** 自然島：介面同自理島（舞台目標＋下方選項），目標改為分類桶 */
export function BinsPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const items = useMemo(() => pickPlayChoices(question, 4), [question])
  const [tossed, setTossed] = useState<number | null>(null)
  const [flying, setFlying] = useState<string | null>(null)
  const [catching, setCatching] = useState(false)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setTossed(null)
    setFlying(null)
    setCatching(false)
    setLocked(false)
    setBurst(null)
  }, [question.id])

  function toss(i: number) {
    if (!ready || locked) return
    setLocked(true)
    const label = items[i]?.label ?? ''
    const ok = items[i]?.correct ?? false
    setFlying(label)
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setCatching(true)
      setFlying(null)
      setTossed(i)
      setBurst(ok)
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    }, 480)
    window.setTimeout(() => onResult(ok), 980)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage bins-stage">
        <p className="play-stage-tip">
          {ready ? '點正確的投進分類桶' : '先想清楚再投'}
        </p>
        <div
          className={`bins-target ${tossed != null ? 'is-closed' : ''} ${
            catching ? 'is-catching' : ''
          } ${
            tossed != null ? (burst ? 'is-ok' : 'is-bad') : ''
          }`}
        >
          <span className="bins-target-lid" aria-hidden />
          <span className="bins-target-rim" aria-hidden />
          {tossed != null ? (
            <span className="bins-target-item">{items[tossed]?.label}</span>
          ) : (
            <span className="bins-target-empty">
              <strong>分類桶</strong>
              <small>等你投入</small>
            </span>
          )}
        </div>
        <AnimatePresence>
          {flying ? (
            <motion.span
              key={flying}
              className="bins-fly"
              initial={{ opacity: 0, y: 36, scale: 0.85 }}
              animate={{ opacity: 1, y: -96, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, y: -120 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              {flying}
            </motion.span>
          ) : null}
        </AnimatePresence>
        {burst != null ? <PlayBurst ok={burst} y="40%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel">
        <p className="play-pick-hint">
          {locked
            ? burst
              ? '投入成功！'
              : '投錯了'
            : '選一個投進分類桶'}
        </p>
        <div className="play-pick-grid">
          {items.map((it, i) => (
            <motion.button
              key={`${question.id}-bin-${i}`}
              type="button"
              className={`play-pick-btn ${
                tossed === i ? (it.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked || (flying != null && tossed !== i)}
              onClick={() => toss(i)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 380, damping: 24 }}
              whileTap={{ scale: 0.96 }}
            >
              {it.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
