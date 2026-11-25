export type FxTier = 'off' | 'iosHigh'

export type FxBudget = {
  tier: FxTier
  fpsLimit: number
  correct: number
  streak3: number
  streak5: number
  streak8: number
  result: (stars: number) => number
}

const OFF: FxBudget = {
  tier: 'off',
  fpsLimit: 30,
  correct: 0,
  streak3: 0,
  streak5: 0,
  streak8: 0,
  result: () => 0,
}

/** iPhone 17／iPad mini：柔霧幾何氣質——粒子更少、更短 */
const IOS_HIGH: FxBudget = {
  tier: 'iosHigh',
  fpsLimit: 60,
  correct: 36,
  streak3: 52,
  streak5: 64,
  streak8: 80,
  result: (stars) => {
    if (stars >= 3) return 110
    if (stars >= 2) return 80
    if (stars >= 1) return 56
    return 24
  },
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 本專案主目標為高階 iOS；僅在減少動態效果時關閉庫特效 */
export function getFxBudget(): FxBudget {
  if (prefersReducedMotion()) return OFF
  return IOS_HIGH
}
