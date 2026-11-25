import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CelebrationProvider,
  useCelebration,
} from '../context/CelebrationContext'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getIsland } from '../data/islands'
import { resultTitle } from '../lib/celebrate'
import { playSfx } from '../lib/sfx'

type ResultState = {
  correct: number
  total: number
  stars: number
}

function ResultInner() {
  const { islandId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { ready, activeProfile } = useAuthProfile()
  const island = getIsland(islandId)
  const state = (location.state as ResultState | null) ?? null
  const { burstResult } = useCelebration()
  const [litStars, setLitStars] = useState(0)
  const [ctaReady, setCtaReady] = useState(false)

  const stars = state?.stars ?? 0

  useEffect(() => {
    if (state == null) return
    burstResult(stars)
    setLitStars(0)
    setCtaReady(false)

    const timers: number[] = []
    for (let i = 1; i <= stars; i++) {
      timers.push(
        window.setTimeout(() => setLitStars(i), 320 + (i - 1) * 320),
      )
    }
    timers.push(window.setTimeout(() => setCtaReady(true), 1000))
    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [islandId, stars, state, burstResult])

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />
  if (!state) return <Navigate to={`/island/${island.id}`} replace />

  const title = resultTitle(state.stars)

  return (
    <div
      className="app-shell"
      style={{
        ['--accent' as string]: island.accent,
        ['--soft' as string]: island.soft,
        ['--deep' as string]: island.deep,
      }}
    >
      <div className="result-wrap">
        <header className="app-topbar">
          <div>
            <p className="app-kicker">本回合結束</p>
            <h1 className="app-heading">{island.name}</h1>
          </div>
        </header>
        <div className="app-card result-card-fx">
          <p className="result-title">{title}</p>
          <p className="result-stars" aria-label={`${state.stars} 顆星`}>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`result-star${i < litStars ? ' is-lit' : ''}`}
              >
                {i < litStars ? '★' : '☆'}
              </span>
            ))}
          </p>
          <p>
            答對 {state.correct} / {state.total}
          </p>
          <div
            className={`result-actions${ctaReady ? ' is-ready' : ''}`}
            style={{ display: 'grid', gap: 10, marginTop: 16 }}
          >
            <button
              type="button"
              className="app-btn block"
              onClick={() => {
                playSfx('enter', 0.45)
                navigate(`/island/${island.id}/play`)
              }}
            >
              再玩一次
            </button>
            <button
              type="button"
              className="app-btn soft block"
              onClick={() => {
                playSfx('tap', 0.4)
                navigate('/')
              }}
            >
              回地圖
            </button>
            <Link to={`/island/${island.id}`} className="app-btn ghost block">
              回關卡介紹
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Result() {
  return (
    <CelebrationProvider>
      <ResultInner />
    </CelebrationProvider>
  )
}
