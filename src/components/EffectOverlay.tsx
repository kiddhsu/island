import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { CelebratePayload } from '../lib/celebrate'
import { getFxBudget } from '../lib/deviceFx'

const ParticlesHost = lazy(() => import('./ParticlesHost'))
const LottieHost = lazy(() => import('./LottieHost'))

type Props = {
  effect: CelebratePayload | null
  effectKey: number
}

export function EffectOverlay({ effect, effectKey }: Props) {
  const budget = useMemo(() => getFxBudget(), [])
  const [showParticles, setShowParticles] = useState(false)
  const [showLottie, setShowLottie] = useState(false)
  const [lottieData, setLottieData] = useState<object | null>(null)

  useEffect(() => {
    if (!effect) {
      setShowParticles(false)
      setShowLottie(false)
      setLottieData(null)
      return
    }
    setShowParticles(Boolean(effect.options))
    const wantLottie = Boolean(effect.showLottie && effect.lottie)
    setShowLottie(wantLottie)

    let cancelled = false
    if (wantLottie && effect.lottie) {
      const loader =
        effect.lottie === 'streak'
          ? import('../assets/lottie/streak.json')
          : import('../assets/lottie/result.json')
      void loader.then((mod) => {
        if (!cancelled) setLottieData(mod.default ?? mod)
      })
    } else {
      setLottieData(null)
    }

    if (effect.durationMs <= 0) return
    const t = window.setTimeout(() => {
      setShowParticles(false)
      setShowLottie(false)
    }, effect.durationMs)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
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
      {showLottie && lottieData ? (
        <div className="fx-lottie" style={{ maxWidth: budget.lottieMaxWidth }}>
          <Suspense fallback={null}>
            <LottieHost
              key={`l-${effectKey}`}
              animationData={lottieData}
              loop={false}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
