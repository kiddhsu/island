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

/** 自然島：把正確答案投進分類桶（投擲動畫純表現） */
export function BinsPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const items = useMemo(() => pickPlayChoices(question, 4), [question])
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [tossed, setTossed] = useState(false)
  const [catching, setCatching] = useState(false)

  useEffect(() => {
    setSelected(null)
    setLocked(false)
    setBurst(null)
    setTossed(false)
    setCatching(false)
  }, [question.id])

  function choose(i: number) {
    if (!ready || locked) return
    playSfx('tap', 0.3)
    setSelected(i)
  }

  function toss() {
    if (!ready || locked || selected == null) return
    setLocked(true)
    setTossed(true)
    const ok = items[selected]?.correct ?? false
    window.setTimeout(() => {
      setCatching(true)
      setBurst(ok)
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    }, 280)
    window.setTimeout(() => onResult(ok), 900)
  }

  const busy = !ready || locked

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage bins-stage">
        <p className="play-stage-tip">
          {ready ? '先點答案，再投進分類桶' : '先看題目'}
        </p>
        <div className="bins-shelf">
          {items.map((it, i) => (
            <motion.button
              key={`${question.id}-bin-item-${i}`}
              type="button"
              className={`bins-chip ${selected === i ? 'is-on' : ''} ${
                tossed && selected === i ? 'is-tossing' : ''
              } ${
                tossed && selected === i ? (it.correct ? 'is-ok' : 'is-bad') : ''
              }`}
              disabled={busy}
              onClick={() => choose(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: tossed && selected === i ? 0 : 1, y: 0 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 380, damping: 24 }}
              whileTap={{ scale: 0.96 }}
            >
              {it.label}
            </motion.button>
          ))}
        </div>
        <motion.button
          type="button"
          className={`bins-target ${selected != null ? 'is-armed' : ''} ${
            catching ? 'is-catching' : ''
          } ${tossed ? (burst ? 'is-ok' : 'is-bad') : ''}`}
          disabled={busy || selected == null}
          onClick={toss}
          whileTap={selected != null && !busy ? { scale: 0.97 } : undefined}
        >
          <span className="bins-target-lid" />
          <strong>分類桶</strong>
          <small>{selected == null ? '先選答案' : '點我投入'}</small>
        </motion.button>
        {burst != null ? <PlayBurst ok={burst} y="58%" /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
    </div>
  )
}
