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
  gauge: '量尺點選',
  traffic: '紅綠燈過關',
  bins: '分類投放',
  pack: '背包收拾',
  pop: '氣球點破',
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
    <div
      className="app-shell"
      style={{
        ['--accent' as string]: island.accent,
        ['--soft' as string]: island.soft,
        ['--deep' as string]: island.deep,
      }}
    >
      <div className="hub-wrap">
        <header className="app-topbar">
          <div>
            <p className="app-kicker">{island.short}</p>
            <h1 className="app-heading">{island.name}</h1>
            <p className="app-sub">
              ★{stars}/3 · 完成 {clears} 次
            </p>
          </div>
          <Link
            to="/"
            className="app-btn soft"
            onClick={() => playSfx('tap', 0.3)}
          >
            ← 地圖
          </Link>
        </header>

        <div className="app-card">
          <p style={{ lineHeight: 1.7, marginTop: 0 }}>{island.blurb}</p>
          <p className="app-muted">
            玩法：{MODE_LABEL[island.playMode] ?? island.playMode}
            <br />
            {island.howToPlay}
            <br />
            年級：小{activeProfile.grade === 1 ? '一' : '二'}題庫
          </p>
          <button
            type="button"
            className="app-btn block"
            style={{ marginTop: 14 }}
            onClick={() => {
              playSfx('enter', 0.5)
              navigate(`/island/${island.id}/play`)
            }}
          >
            開始探險
          </button>
        </div>
      </div>
    </div>
  )
}
