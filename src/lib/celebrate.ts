import type { ISourceOptions } from '@tsparticles/engine'
import { getFxBudget } from './deviceFx'

const COLORS = ['#f0c420', '#ff6b6b', '#4ecdc4', '#2b8cff', '#ffe66d', '#ff8fab', '#ffffff']

function baseOptions(count: number, fpsLimit: number): ISourceOptions {
  return {
    fullScreen: { enable: false },
    fpsLimit,
    detectRetina: true,
    particles: {
      number: { value: 0 },
      color: { value: COLORS },
      shape: { type: ['circle', 'square', 'star'] },
      opacity: {
        value: { min: 0.55, max: 1 },
        animation: {
          enable: true,
          speed: 0.8,
          sync: false,
          startValue: 'max',
          destroy: 'min',
        },
      },
      size: { value: { min: 3, max: 8 } },
      life: { duration: { sync: true, value: 0.85 }, count: 1 },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 12 },
        speed: { min: 12, max: 28 },
        decay: 0.08,
        direction: 'none',
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      position: { x: 50, y: 38 },
      rate: { quantity: count, delay: 0.08 },
      life: { count: 1, duration: 0.12 },
      size: { width: 0, height: 0 },
    },
    interactivity: { detectsOn: 'window', events: {} },
  }
}

function dualEmitters(count: number, fpsLimit: number): ISourceOptions {
  const half = Math.max(20, Math.floor(count / 2))
  const base = baseOptions(half, fpsLimit)
  return {
    ...base,
    emitters: [
      {
        position: { x: 18, y: 42 },
        rate: { quantity: half, delay: 0.08 },
        life: { count: 1, duration: 0.14 },
        size: { width: 0, height: 0 },
      },
      {
        position: { x: 82, y: 42 },
        rate: { quantity: half, delay: 0.08 },
        life: { count: 1, duration: 0.14 },
        size: { width: 0, height: 0 },
      },
    ],
  }
}

function resultOptions(count: number, fpsLimit: number): ISourceOptions {
  const base = baseOptions(count, fpsLimit)
  return {
    ...base,
    particles: {
      ...base.particles,
      life: { duration: { sync: true, value: 1.35 }, count: 1 },
      size: { value: { min: 3, max: 10 } },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 9 },
        speed: { min: 10, max: 32 },
        decay: 0.05,
        direction: 'none',
        outModes: { default: 'destroy' },
      },
    },
    emitters: [
      {
        position: { x: 50, y: 28 },
        rate: { quantity: Math.floor(count * 0.45), delay: 0.1 },
        life: { count: 1, duration: 0.18 },
        size: { width: 12, height: 0 },
      },
      {
        position: { x: 22, y: 55 },
        rate: { quantity: Math.floor(count * 0.28), delay: 0.12 },
        life: { count: 1, duration: 0.16 },
        size: { width: 0, height: 0 },
      },
      {
        position: { x: 78, y: 55 },
        rate: { quantity: Math.floor(count * 0.28), delay: 0.12 },
        life: { count: 1, duration: 0.16 },
        size: { width: 0, height: 0 },
      },
    ],
  }
}

export type CelebrateKind = 'correct' | 'streak3' | 'streak5' | 'streak8' | 'result'

export type CelebratePayload = {
  kind: CelebrateKind
  stars?: number
  options: ISourceOptions | null
  showLottie: boolean
  lottie: 'streak' | 'result' | null
  durationMs: number
}

export function buildCorrectBurst(): CelebratePayload {
  const budget = getFxBudget()
  if (budget.tier === 'off' || budget.correct <= 0) {
    return {
      kind: 'correct',
      options: null,
      showLottie: false,
      lottie: null,
      durationMs: 0,
    }
  }
  return {
    kind: 'correct',
    options: baseOptions(budget.correct, budget.fpsLimit),
    showLottie: false,
    lottie: null,
    durationMs: 900,
  }
}

export function buildStreakBurst(n: number): CelebratePayload | null {
  if (n !== 3 && n !== 5 && n !== 8) return null
  const budget = getFxBudget()
  const kind = n === 3 ? 'streak3' : n === 5 ? 'streak5' : 'streak8'
  if (budget.tier === 'off') {
    return {
      kind,
      options: null,
      showLottie: false,
      lottie: null,
      durationMs: 900,
    }
  }
  if (n === 3) {
    return {
      kind: 'streak3',
      options: baseOptions(budget.streak3, budget.fpsLimit),
      showLottie: false,
      lottie: null,
      durationMs: 1000,
    }
  }
  if (n === 5) {
    return {
      kind: 'streak5',
      options: baseOptions(budget.streak5, budget.fpsLimit),
      showLottie: true,
      lottie: 'streak',
      durationMs: 1200,
    }
  }
  return {
    kind: 'streak8',
    options: dualEmitters(budget.streak8, budget.fpsLimit),
    showLottie: true,
    lottie: 'streak',
    durationMs: 1200,
  }
}

export function buildResultBurst(stars: number): CelebratePayload {
  const budget = getFxBudget()
  if (budget.tier === 'off') {
    return {
      kind: 'result',
      stars,
      options: null,
      showLottie: false,
      lottie: null,
      durationMs: 0,
    }
  }
  const count = budget.result(stars)
  return {
    kind: 'result',
    stars,
    options: resultOptions(count, budget.fpsLimit),
    showLottie: stars >= 1,
    lottie: 'result',
    durationMs: stars >= 2 ? 1800 : 1400,
  }
}

export function streakLabel(streak: number): string {
  if (streak >= 8) return '無敵！'
  if (streak >= 5) return '太棒了！'
  if (streak >= 3) return '好厲害！'
  return '答對了！'
}

export function resultTitle(stars: number): string {
  if (stars >= 3) return '超級探險家'
  if (stars >= 2) return '很會冒險'
  if (stars >= 1) return '繼續加油'
  return '再挑戰一次'
}

export function milestoneBanner(n: number): string | null {
  if (n === 3) return '連續 3 題！'
  if (n === 5) return '連續 5 題！'
  if (n === 8) return '連續 8 題！'
  return null
}
