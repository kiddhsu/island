import { useMemo, useState } from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import type { PlayResultHandler } from './types'

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
}

/**
 * 翻牌尋寶：選項一律正面可見（避免盲猜），點正確的那張即可。
 */
export function RevealPlay({ question, onResult }: Props) {
  const cards = useMemo(() => pickPlayChoices(question, 4), [question])
  const [picked, setPicked] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)

  function open(i: number) {
    if (locked) return
    setPicked(i)
    setLocked(true)
    playSfx('tap', 0.35)
    const ok = cards[i]?.correct ?? false
    window.setTimeout(() => {
      setBurst(ok)
      playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
      window.setTimeout(() => onResult(ok), 700)
    }, 220)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage play-stage-cards">
        <div className="flip-board cols-2">
          {cards.map((c, i) => (
            <button
              key={`${question.id}-rev-${i}-${c.label}`}
              type="button"
              className={`flip-card open ${
                picked === i ? (c.correct ? 'matched' : 'missed') : ''
              }`}
              disabled={locked}
              onClick={() => open(i)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {burst != null ? <PlayBurst ok={burst} /> : null}
      </div>
    </div>
  )
}
