export type FxTier = 'off' | 'iosHigh'

export type FxBudget = {
  tier: FxTier
  fpsLimit: number
  correct: number
  streak3: number
  streak5: number
  streak8: number
  result: (stars: number) => number
  lottieMaxWidth: string
}

const OFF: FxBudget = {
  tier: 'off',
  fpsLimit: 30,
  correct: 0,
  streak3: 0,
  streak5: 0,
  streak8: 0,
  result: () => 0,
  lottieMaxWidth: '0px',
}

/** iPhone 17／iPad mini 以上：高階預設檔 */
const IOS_HIGH: FxBudget = {
  tier: 'iosHigh',
  fpsLimit: 60,
  correct: 72,
  streak3: 110,
  streak5: 130,
  streak8: 160,
  result: (stars) => {
    if (stars >= 3) return 220
    if (stars >= 2) return 160
    if (stars >= 1) return 120
    return 40
  },
  lottieMaxWidth: 'min(420px, 70vw)',
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
