import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { OrderQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
import { PlayBurst } from './PlayBurst'
import type { PlayResultHandler } from './types'

type Props = {
  question: OrderQuestion
  onResult: PlayResultHandler
}

export function PipePlay({ question, onResult }: Props) {
  const steps = question.items
  const pool = useMemo(
    () => shuffle(steps),
    // 每題重洗一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  )
  const [filled, setFilled] = useState<string[]>([])
  const [remain, setRemain] = useState<string[]>(pool)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [justFilled, setJustFilled] = useState<number | null>(null)

  useEffect(() => {
    setFilled([])
    setRemain(shuffle(steps))
    setLocked(false)
    setBurst(null)
    setJustFilled(null)
  }, [question.id, steps])

  function pick(item: string) {
    if (locked) return
    const expect = question.correctOrder[filled.length]
    playSfx('tap', 0.3)
    if (item !== expect) {
      playSfx('wrong', 0.45)
      setBurst(false)
      setLocked(true)
      window.setTimeout(() => onResult(false), 700)
      return
    }
    playSfx('correct', 0.4)
    const nextFilled = [...filled, item]
    setFilled(nextFilled)
    setJustFilled(nextFilled.length - 1)
    setRemain((r) => r.filter((x) => x !== item))
    if (nextFilled.length >= question.correctOrder.length) {
      setBurst(true)
      setLocked(true)
      playSfx('success', 0.55)
      window.setTimeout(() => onResult(true), 780)
    }
  }

  const nextHint = question.correctOrder[filled.length]

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage grounded pipe-stage">
        <div className="pipe-track">
          {question.correctOrder.map((_, i) => (
            <motion.div
              key={i}
              className={`pipe-slot ${filled[i] ? 'is-filled' : ''} ${
                i === filled.length && !locked ? 'is-next' : ''
              } ${justFilled === i ? 'is-filled' : ''}`}
              layout
              animate={
                justFilled === i
                  ? { scale: [0.94, 1.05, 1], backgroundColor: undefined }
                  : { scale: 1 }
              }
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              <span className="pipe-slot-num">{i + 1}</span>
              <span className="pipe-slot-text">
                {filled[i] ?? (i === filled.length ? '下一個 →' : '（空）')}
              </span>
            </motion.div>
          ))}
        </div>
        {burst != null ? <PlayBurst ok={burst} y="55%" /> : null}
      </div>

      <div className="play-pick-panel">
        <p className="play-pick-hint">
          {locked
            ? burst
              ? '完成！'
              : '順序錯了'
            : `點選第 ${filled.length + 1} 步${nextHint ? '（想想：什麼要先做？）' : ''}`}
        </p>
        <div className="pipe-options">
          <AnimatePresence mode="popLayout">
            {remain.map((item) => (
              <motion.button
                key={item}
                type="button"
                className="pipe-chip"
                disabled={locked}
                onClick={() => pick(item)}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: -16 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
