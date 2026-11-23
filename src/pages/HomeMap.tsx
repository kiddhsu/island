import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IslandMarker } from '../components/IslandMarker'
import { BigButton } from '../components/BigButton'
import { SoundToggle } from '../components/SoundToggle'
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
    <div className="page home-page">
      <header className="map-top">
        <div>
          <p className="brand">Island 學習島</p>
          <h1>今天要去哪一座島？</h1>
          <p className="sub">
            {activeProfile.emoji} {activeProfile.name}・小
            {activeProfile.grade === 1 ? '一' : '二'}
            {cloudEnabled && user ? '・已同步' : ''}
          </p>
        </div>
        <div className="map-actions">
          <SoundToggle />
          <BigButton
            variant="soft"
            onClick={() => {
              playSfx('tap', 0.4)
              setListOpen((v) => !v)
            }}
          >
            {listOpen ? '關閉清單' : '島嶼清單'}
          </BigButton>
          <BigButton
            variant="ghost"
            onClick={() => {
              playSfx('tap', 0.35)
              clearActiveProfile()
            }}
          >
            換人
          </BigButton>
        </div>
      </header>

      <div className="map-stage" aria-label="學習小島地圖">
        <div className="map-sea" />
        <div className="map-glow" />
        {ISLANDS.map((island) => (
          <IslandMarker
            key={island.id}
            island={island}
            stars={starsMap[island.id] ?? 0}
          />
        ))}
      </div>

      {listOpen ? (
        <aside className="island-list" aria-label="島嶼清單">
          <h2>全部小島</h2>
          <ul>
            {ISLANDS.map((island) => (
              <li key={island.id}>
                <Link
                  to={`/island/${island.id}`}
                  onClick={() => playSfx('enter', 0.4)}
                >
                  <span
                    className="dot"
                    style={{ background: island.accent }}
                  />
                  {island.name}
                  <small>{island.short}</small>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  )
}
