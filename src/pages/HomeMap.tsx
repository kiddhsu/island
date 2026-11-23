import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { IslandWorld3D } from '../components/IslandWorld3D'
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
    <div className="nes-frame">
      <header className="nes-hud">
        <div>
          <div className="nes-title">ISLAND QUEST</div>
          學習島 3D
        </div>
        <div>
          {activeProfile.emoji} {activeProfile.name}
          <br />
          小{activeProfile.grade === 1 ? '一' : '二'}
          {cloudEnabled && user ? ' · CLOUD' : ''}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <SoundToggle />
          <button
            type="button"
            className="nes-btn soft"
            onClick={() => {
              playSfx('tap', 0.35)
              setListOpen((v) => !v)
            }}
          >
            {listOpen ? '關清單' : '清單'}
          </button>
          <button
            type="button"
            className="nes-btn ghost"
            onClick={() => {
              playSfx('tap', 0.3)
              clearActiveProfile()
            }}
          >
            換人
          </button>
        </div>
      </header>

      <div style={{ padding: 10 }}>
        <IslandWorld3D starsMap={starsMap} />
        {listOpen ? (
          <div className="island-list-nes" aria-label="島嶼清單">
            {ISLANDS.map((island) => (
              <Link
                key={island.id}
                to={`/island/${island.id}`}
                onClick={() => playSfx('enter', 0.4)}
              >
                <span className="dot" style={{ background: island.accent }} />
                <span>
                  {island.name}
                  <br />
                  <span style={{ opacity: 0.75 }}>{island.short}</span>
                </span>
                <span style={{ marginLeft: 'auto' }}>
                  ★{starsMap[island.id] ?? 0}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
