import { useMemo, useState } from 'react'
import type { MatchQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { shuffle } from '../../lib/shuffle'
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

  function finish(ok: boolean) {
    window.setTimeout(() => onResult(ok), 400)
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
      const nextMatched = [...matched, a.pairId]
      setMatched(nextMatched)
      setOpen([])
      setLocked(false)
      if (nextMatched.length >= need) {
        playSfx('success', 0.5)
        finish(true)
      }
    } else {
      playSfx('wrong', 0.4)
      const nextMisses = misses + 1
      setMisses(nextMisses)
      window.setTimeout(() => {
        setOpen([])
        setLocked(false)
        if (nextMisses >= MAX_MISSES) finish(false)
      }, 700)
    }
  }

  return (
    <div className="play-stage" style={{ background: '#143c8c' }}>
      <p className="nes-prompt" style={{ margin: 8 }}>
        翻開兩張「成對」的牌（例如 上↔下、大↔小）
        {'\n'}已配對 {matched.length}/{need}　失誤 {misses}/{MAX_MISSES}
      </p>
      <div className="flip-board">
        {cards.map((c) => {
          const shown = open.includes(c.id) || matched.includes(c.pairId)
          return (
            <button
              key={c.id}
              type="button"
              className={`flip-card ${shown ? 'open' : ''} ${
                matched.includes(c.pairId) ? 'matched' : ''
              }`}
              onClick={() => click(c)}
            >
              {shown ? c.text : '?'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
