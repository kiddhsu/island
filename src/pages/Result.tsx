import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getIsland } from '../data/islands'
import { playSfx } from '../lib/sfx'

type ResultState = {
  correct: number
  total: number
  stars: number
}

export function Result() {
  const { islandId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { ready, activeProfile } = useAuthProfile()
  const island = getIsland(islandId)
  const state = (location.state as ResultState | null) ?? null

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />
  if (!state) return <Navigate to={`/island/${island.id}`} replace />

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
        <div className="app-card">
          <p className="result-stars">
            {'★'.repeat(state.stars)}
            {'☆'.repeat(3 - state.stars)}
          </p>
          <p>
            答對 {state.correct} / {state.total}
          </p>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
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
