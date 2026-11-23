import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IslandWorld3D } from '../components/IslandWorld3D'
import { useAuthProfile } from '../context/AuthProfileContext'
import { ISLANDS } from '../data/islands'
import { getIslandStars } from '../lib/progress'
import { playSfx } from '../lib/sfx'

export function HomeMap() {
  const { ready, activeProfile, clearActiveProfile, user, cloudEnabled } =
    useAuthProfile()
  const [listOpen, setListOpen] = useState(false)

  const starsMap = useMemo(() => {
    const m: Record<string, number> = {}
    for (const island of ISLANDS) {
      m[island.id] = getIslandStars(island.id)
    }
    return m
  }, [activeProfile?.id])

  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />

  return (
    <div className="map-shell">
      <header className="map-topbar">
        <div>
          <p className="map-kicker">學習島</p>
          <h1 className="map-heading">今天想去哪一座？</h1>
          <p className="map-sub">
            {activeProfile.emoji} {activeProfile.name}・小
            {activeProfile.grade === 1 ? '一' : '二'}
            {cloudEnabled && user ? '・已同步' : ''}
          </p>
        </div>
        <div className="map-top-actions">
          <button
            type="button"
            className="map-tool"
            onClick={() => {
              playSfx('tap', 0.3)
              clearActiveProfile()
            }}
          >
            換人
          </button>
        </div>
      </header>

      <IslandWorld3D
        starsMap={starsMap}
        listOpen={listOpen}
        onToggleList={() => {
          playSfx('tap', 0.35)
          setListOpen((v) => !v)
        }}
      />

      {listOpen ? (
        <aside className="map-list-panel" aria-label="島嶼清單">
          <div className="map-list-head">
            <h2>全部小島</h2>
            <button
              type="button"
              className="map-tool"
              onClick={() => {
                playSfx('tap', 0.3)
                setListOpen(false)
              }}
            >
              關閉
            </button>
          </div>
          <ul>
            {ISLANDS.map((island, i) => (
              <li key={island.id}>
                <Link
                  to={`/island/${island.id}`}
                  onClick={() => playSfx('enter', 0.4)}
                >
                  <span className="map-list-num" style={{ color: island.accent }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{island.name}</strong>
                    <small>{island.short}</small>
                  </span>
                  <span className="map-list-stars">
                    ★{starsMap[island.id] ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  )
}
