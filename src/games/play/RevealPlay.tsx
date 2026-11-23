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
    }, 320)
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div className="play-stage play-stage-cards">
        <div className="flip-board cols-2">
          {cards.map((c, i) => {
            const isPicked = picked === i
            return (
              <button
                key={`${question.id}-rev-${i}-${c.label}`}
                type="button"
                className={[
                  'flip-card',
                  'is-flipped',
                  'is-reveal',
                  isPicked ? (c.correct ? 'is-matched' : 'is-missed') : '',
                  isPicked ? 'is-pick-pop' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${i * 50}ms` }}
                disabled={locked}
                onClick={() => open(i)}
              >
                <span className="flip-card-inner">
                  <span className="flip-card-face back" aria-hidden>
                    ?
                  </span>
                  <span className="flip-card-face front">{c.label}</span>
                </span>
              </button>
            )
          })}
        </div>
        {burst != null ? <PlayBurst ok={burst} /> : null}
      </div>
    </div>
  )
}
