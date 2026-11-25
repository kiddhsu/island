import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  buildCorrectBurst,
  buildResultBurst,
  buildStreakBurst,
  milestoneBanner,
  type CelebratePayload,
} from '../lib/celebrate'
import { EffectOverlay } from '../components/EffectOverlay'

type CelebrationApi = {
  streak: number
  setStreak: (n: number) => void
  banner: string | null
  scorePulse: number
  livesPulse: number
  bumpScore: () => void
  bumpLives: () => void
  burstCorrect: () => void
  burstStreak: (n: number) => void
  burstResult: (stars: number) => void
  clearBanner: () => void
}

const CelebrationContext = createContext<CelebrationApi | null>(null)

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const [scorePulse, setScorePulse] = useState(0)
  const [livesPulse, setLivesPulse] = useState(0)
  const [effect, setEffect] = useState<CelebratePayload | null>(null)
  const [effectKey, setEffectKey] = useState(0)
  const bannerTimer = useRef<number | null>(null)

  const playEffect = useCallback((payload: CelebratePayload | null) => {
    if (!payload) return
    setEffect(payload)
    setEffectKey((k) => k + 1)
  }, [])

  const clearBanner = useCallback(() => {
    setBanner(null)
    if (bannerTimer.current != null) {
      window.clearTimeout(bannerTimer.current)
      bannerTimer.current = null
    }
  }, [])

  const showBanner = useCallback(
    (text: string, ms = 1400) => {
      clearBanner()
      setBanner(text)
      bannerTimer.current = window.setTimeout(() => {
        setBanner(null)
        bannerTimer.current = null
      }, ms)
    },
    [clearBanner],
  )

  const burstCorrect = useCallback(() => {
    playEffect(buildCorrectBurst())
  }, [playEffect])

  const burstStreak = useCallback(
    (n: number) => {
      const payload = buildStreakBurst(n)
      const text = milestoneBanner(n)
      if (text) showBanner(text)
      playEffect(payload)
    },
    [playEffect, showBanner],
  )

  const burstResult = useCallback(
    (stars: number) => {
      playEffect(buildResultBurst(stars))
    },
    [playEffect],
  )

  const bumpScore = useCallback(() => {
    setScorePulse((n) => n + 1)
  }, [])

  const bumpLives = useCallback(() => {
    setLivesPulse((n) => n + 1)
  }, [])

  const api = useMemo<CelebrationApi>(
    () => ({
      streak,
      setStreak,
      banner,
      scorePulse,
      livesPulse,
      bumpScore,
      bumpLives,
      burstCorrect,
      burstStreak,
      burstResult,
      clearBanner,
    }),
    [
      streak,
      banner,
      scorePulse,
      livesPulse,
      bumpScore,
      bumpLives,
      burstCorrect,
      burstStreak,
      burstResult,
      clearBanner,
    ],
  )

  return (
    <CelebrationContext.Provider value={api}>
      {children}
      {banner ? (
        <div className="fx-banner" role="status">
          {banner}
        </div>
      ) : null}
      <EffectOverlay effect={effect} effectKey={effectKey} />
    </CelebrationContext.Provider>
  )
}

export function useCelebration(): CelebrationApi {
  const ctx = useContext(CelebrationContext)
  if (!ctx) {
    throw new Error('useCelebration must be used within CelebrationProvider')
  }
  return ctx
}

export function useCelebrationOptional(): CelebrationApi | null {
  return useContext(CelebrationContext)
}
