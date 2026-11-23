import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChoiceEngine } from '../games/engines/ChoiceEngine'
import { MatchEngine } from '../games/engines/MatchEngine'
import { OrderEngine } from '../games/engines/OrderEngine'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getBank } from '../data/banks'
import { getIsland } from '../data/islands'
import { SoundToggle } from '../components/SoundToggle'
import { loadProgress, recordRoundResult } from '../lib/progress'
import { playSfx } from '../lib/sfx'
import { drawRound } from '../lib/shuffle'
import type {
  ChoiceQuestion,
  MatchQuestion,
  OrderQuestion,
  Question,
} from '../types'

const ROUND_SIZE = 8

function isChoice(q: Question): q is ChoiceQuestion {
  return q.engine === 'choice' || q.engine === 'scenario'
}

function checkMatch(q: MatchQuestion, mapping: Record<string, string>) {
  return q.pairs.every((p) => mapping[p.left] === p.right)
}

function checkOrder(q: OrderQuestion, order: string[]) {
  return (
    order.length === q.correctOrder.length &&
    order.every((item, i) => item === q.correctOrder[i])
  )
}

export function GameSession() {
  const { islandId = '' } = useParams()
  const navigate = useNavigate()
  const { ready, activeProfile } = useAuthProfile()
  const island = getIsland(islandId)

  const roundKey = `${island?.id ?? ''}:${activeProfile?.id ?? ''}:${activeProfile?.grade ?? ''}`
  const questions = useMemo(() => {
    if (!island || !activeProfile) return []
    const progress = loadProgress()
    const bank = getBank(island.id, activeProfile.grade)
    return drawRound(bank, ROUND_SIZE, {
      wrongIds: progress.wrongIds,
      recentCorrectIds: progress.recentCorrectIds,
    })
  }, [roundKey, island, activeProfile])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [correctIds, setCorrectIds] = useState<string[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [reveal, setReveal] = useState(false)
  const [locked, setLocked] = useState(false)

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />
  if (questions.length === 0) {
    return (
      <div className="page center">
        <p>這座島還沒有題目。</p>
        <Link to="/">回地圖</Link>
      </div>
    )
  }

  const q = questions[index]!
  const total = questions.length

  function finishRound(nextCorrect: number, nextWrong: string[], nextOk: string[]) {
    const { earned } = recordRoundResult({
      islandId: island!.id,
      correct: nextCorrect,
      total,
      wrongQuestionIds: nextWrong,
      correctQuestionIds: nextOk,
    })
    playSfx('success', 0.6)
    navigate(`/island/${island!.id}/result`, {
      replace: true,
      state: { correct: nextCorrect, total, stars: earned },
    })
  }

  function advance(isCorrect: boolean) {
    const nextCorrect = correctCount + (isCorrect ? 1 : 0)
    const nextWrong = isCorrect ? wrongIds : [...wrongIds, q.id]
    const nextOk = isCorrect ? [...correctIds, q.id] : correctIds
    setCorrectCount(nextCorrect)
    setWrongIds(nextWrong)
    setCorrectIds(nextOk)

    if (index + 1 >= total) {
      finishRound(nextCorrect, nextWrong, nextOk)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setReveal(false)
    setLocked(false)
  }

  function feedback(ok: boolean) {
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
  }

  function afterChoice(i: number) {
    if (locked || !isChoice(q)) return
    setSelected(i)
    setLocked(true)
    setReveal(true)
    const ok = i === q.answerIndex
    feedback(ok)
    window.setTimeout(() => advance(ok), 900)
  }

  function afterMatch(mapping: Record<string, string>) {
    if (locked || q.engine !== 'match') return
    setLocked(true)
    setReveal(true)
    const ok = checkMatch(q, mapping)
    feedback(ok)
    window.setTimeout(() => advance(ok), 1100)
  }

  function afterOrder(order: string[]) {
    if (locked || q.engine !== 'order') return
    setLocked(true)
    setReveal(true)
    const ok = checkOrder(q, order)
    feedback(ok)
    window.setTimeout(() => advance(ok), 1100)
  }

  return (
    <div
      className="page game-page"
      style={{
        ['--island-accent' as string]: island.accent,
        ['--island-soft' as string]: island.soft,
        ['--island-deep' as string]: island.deep,
      }}
    >
      <header className="game-top">
        <Link to={`/island/${island.id}`} className="back-link">
          ← 離開
        </Link>
        <div className="game-top-right">
          <SoundToggle />
          <div className="progress-pill">
            {index + 1} / {total}
          </div>
        </div>
      </header>

      <div className="game-card">
        <h1>{island.name}</h1>
        {isChoice(q) ? (
          <ChoiceEngine
            question={q}
            selected={selected}
            reveal={reveal}
            disabled={locked}
            onSelect={afterChoice}
          />
        ) : null}
        {q.engine === 'match' ? (
          <MatchEngine
            question={q}
            reveal={reveal}
            disabled={locked}
            onSubmit={afterMatch}
          />
        ) : null}
        {q.engine === 'order' ? (
          <OrderEngine
            key={q.id}
            question={q}
            reveal={reveal}
            disabled={locked}
            onSubmit={afterOrder}
          />
        ) : null}
      </div>
    </div>
  )
}
