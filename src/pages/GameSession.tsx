import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  CelebrationProvider,
  useCelebration,
} from '../context/CelebrationContext'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getBank } from '../data/banks'
import { getIsland } from '../data/islands'
import { PlayStage } from '../games/play/PlayStage'
import { loadProgress, recordRoundResult } from '../lib/progress'
import { playSfx } from '../lib/sfx'
import { drawRound, drawRoundDiversePrompt } from '../lib/shuffle'

const ROUND_SIZE = 8

function GameSessionInner() {
  const { islandId = '' } = useParams()
  const navigate = useNavigate()
  const { ready, activeProfile } = useAuthProfile()
  const island = getIsland(islandId)
  const {
    streak,
    setStreak,
    scorePulse,
    livesPulse,
    bumpScore,
    bumpLives,
    burstCorrect,
    burstStreak,
  } = useCelebration()

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
      const orderPick = drawRoundDiversePrompt(
        orders,
        Math.min(6, orders.length),
        opts,
      )
      const otherPick = drawRound(
        others,
        Math.max(0, ROUND_SIZE - orderPick.length),
        opts,
      )
      return [...orderPick, ...otherPick]
    }
    const playable = bank.filter(isChoiceLike)
    const pool = playable.length ? playable : bank
    return drawRoundDiversePrompt(pool, ROUND_SIZE, opts)
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
      const nextStreak = ok ? streak + 1 : 0

      setCorrectCount(nextCorrect)
      setWrongIds(nextWrong)
      setCorrectIds(nextOk)
      setLives(nextLives)
      setStreak(nextStreak)

      if (ok) {
        bumpScore()
        if (nextStreak === 3 || nextStreak === 5 || nextStreak === 8) {
          burstStreak(nextStreak)
        } else {
          burstCorrect()
        }
      } else {
        bumpLives()
      }

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
      streak,
      setStreak,
      bumpScore,
      bumpLives,
      burstCorrect,
      burstStreak,
      finishRound,
    ],
  )

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />
  if (questions.length === 0) {
    return (
      <div className="app-shell page center">
        <p>這座島還沒有題目。</p>
        <Link to="/" className="app-btn soft">
          回地圖
        </Link>
      </div>
    )
  }

  const q = questions[index]!
  const total = questions.length

  return (
    <div
      className="app-shell"
      style={{
        ['--accent' as string]: island.accent,
        ['--soft' as string]: island.soft,
        ['--deep' as string]: island.deep,
        ['--tone-top' as string]: island.soft,
        ['--tone-left' as string]: island.accent,
        ['--tone-right' as string]: island.deep,
      }}
    >
      <header className="app-topbar session-topbar">
        <div>
          <p className="app-kicker">{island.short}</p>
          <h1 className="app-heading">{island.name}</h1>
          <p className="app-sub">
            第 {index + 1} / {total} 題
          </p>
        </div>
        <div className="app-chip-row">
          {streak >= 2 ? (
            <span className="app-chip streak-chip" key={streak}>
              連擊 ×{streak}
            </span>
          ) : null}
          <span
            className={`app-chip lives${livesPulse ? ' is-pulse' : ''}`}
            key={`lives-${livesPulse}`}
          >
            ♥ {Math.max(0, lives)}
          </span>
          <span
            className={`app-chip score${scorePulse ? ' is-pop' : ''}`}
            key={`score-${scorePulse}`}
          >
            得分 {correctCount}
          </span>
          <Link
            to={`/island/${island.id}`}
            className="app-btn soft"
            onClick={() => playSfx('tap', 0.3)}
          >
            離開
          </Link>
        </div>
      </header>

      <PlayStage mode={island.playMode} question={q} onResult={onResult} />
      <p className="play-help session-help">{island.howToPlay}</p>
    </div>
  )
}

export function GameSession() {
  return (
    <CelebrationProvider>
      <GameSessionInner />
    </CelebrationProvider>
  )
}
