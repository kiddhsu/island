import { useMemo, useState } from 'react'
import type { MatchQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
import { PlayBurst } from './PlayBurst'
import type { PlayResultHandler } from './types'

type Card = {
  id: string
  text: string
  pairId: string
}

type Props = {
  question: MatchQuestion
  onResult: PlayResultHandler
}

const MAX_MISSES = 4

export function FlipPlay({ question, onResult }: Props) {
  const pairs = useMemo(() => question.pairs.slice(0, 3), [question])
  const need = pairs.length

  const cards = useMemo(() => {
    const raw: Card[] = []
    pairs.forEach((p, i) => {
      const pairId = `p${i}`
      raw.push({ id: `${pairId}-l`, text: p.left, pairId })
      raw.push({ id: `${pairId}-r`, text: p.right, pairId })
    })
    return shuffle(raw)
  }, [pairs])

  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<boolean | null>(null)
  const [shakeIds, setShakeIds] = useState<string[]>([])

  function finish(ok: boolean) {
    setBurst(ok)
    window.setTimeout(() => onResult(ok), 700)
  }

  function click(card: Card) {
    if (locked) return
    if (matched.includes(card.pairId) || open.includes(card.id)) return
    playSfx('tap', 0.3)
    const next = [...open, card.id]
    setOpen(next)
    if (next.length < 2) return

    const [aId, bId] = next
    const a = cards.find((c) => c.id === aId)
    const b = cards.find((c) => c.id === bId)
    if (!a || !b) {
      setOpen([])
      return
    }

    setLocked(true)
    if (a.pairId === b.pairId) {
      playSfx('correct', 0.5)
      setBurst(true)
      const nextMatched = [...matched, a.pairId]
      setMatched(nextMatched)
      setOpen([])
      window.setTimeout(() => {
        setBurst(null)
        setLocked(false)
        if (nextMatched.length >= need) {
          playSfx('success', 0.5)
          finish(true)
        }
      }, 550)
    } else {
      playSfx('wrong', 0.4)
      setBurst(false)
      setShakeIds([a.id, b.id])
      const nextMisses = misses + 1
      setMisses(nextMisses)
      window.setTimeout(() => {
        setShakeIds([])
        setBurst(null)
        setOpen([])
        setLocked(false)
        if (nextMisses >= MAX_MISSES) finish(false)
      }, 780)
    }
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">
        翻開兩張成對的牌
        {'\n'}已配對 {matched.length}/{need}　失誤 {misses}/{MAX_MISSES}
      </p>
      <div className="play-stage play-stage-cards">
        <div className="flip-board cols-3">
          {cards.map((c, i) => {
            const shown = open.includes(c.id) || matched.includes(c.pairId)
            const isMatched = matched.includes(c.pairId)
            const isShake = shakeIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                className={[
                  'flip-card',
                  shown ? 'is-flipped' : '',
                  isMatched ? 'is-matched' : '',
                  isShake ? 'is-shake' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${i * 45}ms` }}
                onClick={() => click(c)}
              >
                <span className="flip-card-inner">
                  <span className="flip-card-face back" aria-hidden>
                    ?
                  </span>
                  <span className="flip-card-face front">{c.text}</span>
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
