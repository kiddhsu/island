import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { SoundToggle } from '../components/SoundToggle'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getIsland } from '../data/islands'
import { getIslandClears, getIslandStars } from '../lib/progress'
import { playSfx } from '../lib/sfx'

export function IslandHub() {
  const { islandId = '' } = useParams()
  const navigate = useNavigate()
  const { ready, activeProfile } = useAuthProfile()
  const island = getIsland(islandId)

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  if (!island) return <Navigate to="/" replace />

  const stars = getIslandStars(island.id)
  const clears = getIslandClears(island.id)

  return (
    <div
      className="page island-hub"
      style={{
        ['--island-accent' as string]: island.accent,
        ['--island-soft' as string]: island.soft,
        ['--island-deep' as string]: island.deep,
      }}
    >
      <div className="hub-top">
        <Link to="/" className="back-link" onClick={() => playSfx('tap', 0.35)}>
          ← 回地圖
        </Link>
        <SoundToggle />
      </div>
      <div className="hub-card">
        <p className="eyebrow">{island.short}</p>
        <h1>{island.name}</h1>
        <p>{island.blurb}</p>
        <p className="hub-meta">
          目前 ★ {stars}/3 ・ 完成 {clears} 次 ・ 小
          {activeProfile.grade === 1 ? '一' : '二'}題庫
        </p>
        <BigButton
          onClick={() => {
            playSfx('enter', 0.5)
            navigate(`/island/${island.id}/play`)
          }}
        >
          開始探險
        </BigButton>
      </div>
    </div>
  )
}
