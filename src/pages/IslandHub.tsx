import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import { getIsland } from '../data/islands'
import { getIslandClears, getIslandStars } from '../lib/progress'
import { playSfx } from '../lib/sfx'

const MODE_LABEL: Record<string, string> = {
  jump: '跳躍選台',
  catch: '接住答案',
  fork: '岔路冒險',
  flip: '翻牌配對',
  pipe: '水管排序',
}

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
    <div className="nes-frame">
      <header className="nes-hud">
        <div>{island.name}</div>
        <div>
          ★{stars}/3 · CLEAR {clears}
        </div>
      </header>
      <div className="hub-nes">
        <Link
          to="/"
          className="nes-btn ghost"
          style={{ textDecoration: 'none', display: 'inline-block' }}
          onClick={() => playSfx('tap', 0.3)}
        >
          ← 地圖
        </Link>
        <div className="nes-panel" style={{ marginTop: 14 }}>
          <p className="nes-title">{island.name}</p>
          <p style={{ lineHeight: 1.7 }}>{island.blurb}</p>
          <p style={{ opacity: 0.85 }}>
            玩法：{MODE_LABEL[island.playMode] ?? island.playMode}
            <br />
            {island.howToPlay}
            <br />
            年級：小{activeProfile.grade === 1 ? '一' : '二'}題庫
          </p>
          <button
            type="button"
            className="nes-btn"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => {
              playSfx('enter', 0.5)
              navigate(`/island/${island.id}/play`)
            }}
          >
            PRESS START
          </button>
        </div>
      </div>
    </div>
  )
}
