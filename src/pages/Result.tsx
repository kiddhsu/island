import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SoundToggle } from '../components/SoundToggle'
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
    <div className="nes-frame">
      <header className="nes-hud">
        <div>STAGE CLEAR</div>
        <SoundToggle />
      </header>
      <div className="result-nes">
        <div className="nes-panel">
          <p className="nes-title">{island.name}</p>
          <p style={{ fontSize: 28, color: '#f8d878', letterSpacing: '0.2em' }}>
            {'★'.repeat(state.stars)}
            {'☆'.repeat(3 - state.stars)}
          </p>
          <p>
            答對 {state.correct} / {state.total}
          </p>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="nes-btn"
              onClick={() => {
                playSfx('enter', 0.45)
                navigate(`/island/${island.id}/play`)
              }}
            >
              再玩一次
            </button>
            <button
              type="button"
              className="nes-btn soft"
              onClick={() => {
                playSfx('tap', 0.4)
                navigate('/')
              }}
            >
              回地圖
            </button>
            <Link to={`/island/${island.id}`} style={{ color: '#fff' }}>
              回關卡介紹
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
