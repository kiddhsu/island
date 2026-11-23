import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getBank } from '../data/banks'
import { getIsland } from '../data/islands'
import { PlayStage } from '../games/play/PlayStage'
import { loadProgress, recordRoundResult } from '../lib/progress'
import { playSfx } from '../lib/sfx'
import { drawRound } from '../lib/shuffle'

const ROUND_SIZE = 8

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
    const opts = {
      wrongIds: progress.wrongIds,
      recentCorrectIds: progress.recentCorrectIds,
    }
    const isChoiceLike = (q: (typeof bank)[number]) =>
      q.engine === 'choice' || q.engine === 'scenario'

    // 依玩法抽對應題型，避免出現「此題暫不支援」
    if (island.playMode === 'flip') {
      const matches = bank.filter((q) => q.engine === 'match')
      const others = bank.filter(isChoiceLike)
      const matchPick = drawRound(matches, Math.min(3, matches.length), opts)
      const otherPick = drawRound(
        others,
        Math.max(0, ROUND_SIZE - matchPick.length),
        opts,
      )
      return [...matchPick, ...otherPick]
    }
    if (island.playMode === 'pipe') {
      const orders = bank.filter((q) => q.engine === 'order')
      const others = bank.filter(isChoiceLike)
      const orderPick = drawRound(orders, Math.min(4, orders.length), opts)
      const otherPick = drawRound(
        others,
        Math.max(0, ROUND_SIZE - orderPick.length),
        opts,
      )
      return [...orderPick, ...otherPick]
    }
    // jump / catch / fork：只用選擇／情境題
    const playable = bank.filter(isChoiceLike)
    return drawRound(playable.length ? playable : bank, ROUND_SIZE, opts)
  }, [roundKey, island, activeProfile])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [correctIds, setCorrectIds] = useState<string[]>([])
  const [lives, setLives] = useState(3)

  const finishRound = useCallback(
    (nextCorrect: number, nextWrong: string[], nextOk: string[]) => {
      if (!island) return
      const { earned } = recordRoundResult({
        islandId: island.id,
        correct: nextCorrect,
        total: questions.length,
        wrongQuestionIds: nextWrong,
        correctQuestionIds: nextOk,
      })
      playSfx('success', 0.6)
      navigate(`/island/${island.id}/result`, {
        replace: true,
        state: { correct: nextCorrect, total: questions.length, stars: earned },
      })
    },
    [island, navigate, questions.length],
  )

  const onResult = useCallback(
    (ok: boolean) => {
      if (!island) return
      const q = questions[index]
      if (!q) return

      const nextCorrect = correctCount + (ok ? 1 : 0)
      const nextWrong = ok ? wrongIds : [...wrongIds, q.id]
      const nextOk = ok ? [...correctIds, q.id] : correctIds
      const nextLives = ok ? lives : lives - 1

      setCorrectCount(nextCorrect)
      setWrongIds(nextWrong)
      setCorrectIds(nextOk)
      setLives(nextLives)

      if (nextLives <= 0) {
        finishRound(nextCorrect, nextWrong, nextOk)
        return
      }
      if (index + 1 >= questions.length) {
        finishRound(nextCorrect, nextWrong, nextOk)
        return
      }
      setIndex((i) => i + 1)
    },
    [
      island,
      questions,
      index,
      correctCount,
      wrongIds,
      correctIds,
      lives,
      finishRound,
    ],
  )

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />
  if (questions.length === 0) {
    return (
      <div className="nes-frame page center">
        <p>這座島還沒有題目。</p>
        <Link to="/">回地圖</Link>
      </div>
    )
  }

  const q = questions[index]!
  const total = questions.length

  return (
    <div
      className="nes-frame"
      style={{
        ['--island-accent' as string]: island.accent,
      }}
    >
      <header className="nes-hud">
        <div>
          {island.name}
          <br />
          STAGE {index + 1}/{total}
        </div>
        <div className="lives">♥×{Math.max(0, lives)}</div>
        <div>SCORE {correctCount}</div>
      </header>

      <div style={{ padding: 10 }}>
        <Link
          to={`/island/${island.id}`}
          className="nes-btn ghost"
          style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 10 }}
          onClick={() => playSfx('tap', 0.3)}
        >
          EXIT
        </Link>
        <PlayStage mode={island.playMode} question={q} onResult={onResult} />
        <p
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 8,
            lineHeight: 1.6,
            marginTop: 10,
            opacity: 0.85,
          }}
        >
          {island.howToPlay}
        </p>
      </div>
    </div>
  )
}
