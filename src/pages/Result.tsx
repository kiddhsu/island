import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
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
    <div
      className="page result-page"
      style={{
        ['--island-accent' as string]: island.accent,
        ['--island-soft' as string]: island.soft,
      }}
    >
      <div className="hub-top">
        <span />
        <SoundToggle />
      </div>
      <div className="result-card">
        <p className="eyebrow">{island.name}</p>
        <h1>本回合結束！</h1>
        <p className="result-stars">
          {'★'.repeat(state.stars)}
          {'☆'.repeat(3 - state.stars)}
        </p>
        <p>
          答對 {state.correct} / {state.total} 題
        </p>
        <div className="result-actions">
          <BigButton
            onClick={() => {
              playSfx('enter', 0.45)
              navigate(`/island/${island.id}/play`)
            }}
          >
            再玩一次
          </BigButton>
          <BigButton
            variant="soft"
            onClick={() => {
              playSfx('tap', 0.4)
              navigate('/')
            }}
          >
            回地圖
          </BigButton>
          <Link to={`/island/${island.id}`} className="text-link">
            回島嶼介紹
          </Link>
        </div>
      </div>
    </div>
  )
}
