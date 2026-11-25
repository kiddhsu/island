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

/** 自理島：把正確的習慣／物品裝進背包（飛入過渡純表現） */
export function PackPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const items = useMemo(() => pickPlayChoices(question, 4), [question])
  const [packed, setPacked] = useState<number | null>(null)
  const [flying, setFlying] = useState<string | null>(null)
  const [catching, setCatching] = useState(false)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)

  useEffect(() => {
    setPacked(null)
    setFlying(null)
    setCatching(false)
    setLocked(false)
    setBurst(null)
  }, [question.id])

  function pack(i: number) {
    if (!ready || locked) return
    setLocked(true)
    const label = items[i]?.label ?? ''
    const ok = items[i]?.correct ?? false
    setFlying(label)
    playSfx('tap', 0.35)
    window.setTimeout(() => {
      setCatching(true)
      setFlying(null)
      setPacked(i)
      setBurst(ok)
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    }, 480)
    window.setTimeout(() => onResult(ok), 980)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage pack-stage">
        <p className="play-stage-tip">
          {ready ? '點正確的放進背包' : '先想清楚再裝'}
        </p>
        <div
          className={`pack-bag ${packed != null ? 'is-closed' : ''} ${
            catching ? 'is-catching' : ''
          }`}
        >
          <div className="pack-bag-body">
            <span className="pack-bag-pocket" />
            {packed != null ? (
              <span className="pack-bag-item">{items[packed]?.label}</span>
            ) : (
              <span className="pack-bag-empty">背包空空的</span>
            )}
          </div>
        </div>
        <AnimatePresence>
          {flying ? (
            <motion.span
              key={flying}
              className="pack-fly"
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
        <div className="play-pick-grid">
          {items.map((it, i) => (
            <motion.button
              key={`${question.id}-pack-${i}`}
              type="button"
              className={`play-pick-btn ${
                packed === i ? (it.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={!ready || locked || (flying != null && packed !== i)}
              onClick={() => pack(i)}
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
