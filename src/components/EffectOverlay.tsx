import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import type { CelebratePayload } from '../lib/celebrate'

const ParticlesHost = lazy(() => import('./ParticlesHost'))

type Props = {
  effect: CelebratePayload | null
  effectKey: number
}

export function EffectOverlay({ effect, effectKey }: Props) {
  const [showParticles, setShowParticles] = useState(false)
  const [showGem, setShowGem] = useState(false)

  useEffect(() => {
    if (!effect) {
      setShowParticles(false)
      setShowGem(false)
      return
    }
    setShowParticles(Boolean(effect.options))
    setShowGem(Boolean(effect.showGem))

    if (effect.durationMs <= 0) return
    const t = window.setTimeout(() => {
      setShowParticles(false)
      setShowGem(false)
    }, effect.durationMs)
    return () => window.clearTimeout(t)
  }, [effect, effectKey])

  if (!effect) return null

  const overlayStyle: CSSProperties = {
    pointerEvents: 'none',
  }

  return (
    <div className="fx-overlay" style={overlayStyle} aria-hidden>
      {showParticles && effect.options ? (
        <Suspense fallback={null}>
          <ParticlesHost key={`p-${effectKey}`} options={effect.options} />
        </Suspense>
      ) : null}
      {showGem ? (
        <div className={`fx-gem fx-gem--${effect.kind}`} key={`g-${effectKey}`}>
          <span className="fx-gem-core" />
          <span className="fx-gem-ring" />
        </div>
      ) : null}
    </div>
  )
}
