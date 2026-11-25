import type { ISourceOptions } from '@tsparticles/engine'
import { getFxBudget } from './deviceFx'

/** 與 tokens 對齊：珊瑚／梅紫／薄荷／石米／霧藍 */
const COLORS = ['#e07a5f', '#7b5ea7', '#6fbfa0', '#e8dcc8', '#f7f2ea', '#9bb8e8', '#c4a890']

function baseOptions(count: number, fpsLimit: number): ISourceOptions {
  return {
    fullScreen: { enable: false },
    fpsLimit,
    detectRetina: true,
    particles: {
      number: { value: 0 },
      color: { value: COLORS },
      /* 只用方塊石屑，避免圓形煙火感 */
      shape: { type: 'square' },
      opacity: {
        value: { min: 0.35, max: 0.78 },
        animation: {
          enable: true,
          speed: 0.4,
          sync: false,
          startValue: 'max',
          destroy: 'min',
        },
      },
      size: { value: { min: 2, max: 5 } },
      rotate: {
        value: { min: 0, max: 45 },
        animation: { enable: true, speed: 5, sync: false },
      },
      life: { duration: { sync: true, value: 0.55 }, count: 1 },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 6 },
        speed: { min: 3, max: 9 },
        decay: 0.12,
        direction: 'none',
        outModes: { default: 'destroy' },
      },
    },
    emitters: {
      position: { x: 50, y: 36 },
      rate: { quantity: count, delay: 0.1 },
      life: { count: 1, duration: 0.1 },
      size: { width: 0, height: 0 },
    },
    interactivity: { detectsOn: 'window', events: {} },
  }
}

function dualEmitters(count: number, fpsLimit: number): ISourceOptions {
  const half = Math.max(14, Math.floor(count / 2))
  const base = baseOptions(half, fpsLimit)
  return {
    ...base,
    emitters: [
      {
        position: { x: 22, y: 40 },
        rate: { quantity: half, delay: 0.1 },
        life: { count: 1, duration: 0.1 },
        size: { width: 0, height: 0 },
      },
      {
        position: { x: 78, y: 40 },
        rate: { quantity: half, delay: 0.1 },
        life: { count: 1, duration: 0.1 },
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
      life: { duration: { sync: true, value: 0.95 }, count: 1 },
      size: { value: { min: 2.5, max: 7 } },
      move: {
        enable: true,
        gravity: { enable: true, acceleration: 6.5 },
        speed: { min: 5, max: 14 },
        decay: 0.08,
        direction: 'none',
        outModes: { default: 'destroy' },
      },
    },
    emitters: [
      {
        position: { x: 50, y: 30 },
        rate: { quantity: Math.floor(count * 0.5), delay: 0.12 },
        life: { count: 1, duration: 0.12 },
        size: { width: 10, height: 0 },
      },
      {
        position: { x: 28, y: 52 },
        rate: { quantity: Math.floor(count * 0.25), delay: 0.14 },
        life: { count: 1, duration: 0.1 },
        size: { width: 0, height: 0 },
      },
      {
        position: { x: 72, y: 52 },
        rate: { quantity: Math.floor(count * 0.25), delay: 0.14 },
        life: { count: 1, duration: 0.1 },
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
  showGem: boolean
  durationMs: number
}

export function buildCorrectBurst(): CelebratePayload {
  const budget = getFxBudget()
  if (budget.tier === 'off' || budget.correct <= 0) {
    return {
      kind: 'correct',
      options: null,
      showGem: false,
      durationMs: 0,
    }
  }
  return {
    kind: 'correct',
    options: baseOptions(budget.correct, budget.fpsLimit),
    showGem: false,
    durationMs: 700,
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
      showGem: n >= 5,
      durationMs: 800,
    }
  }
  if (n === 3) {
    return {
      kind: 'streak3',
      options: baseOptions(budget.streak3, budget.fpsLimit),
      showGem: false,
      durationMs: 800,
    }
  }
  if (n === 5) {
    return {
      kind: 'streak5',
      options: baseOptions(budget.streak5, budget.fpsLimit),
      showGem: true,
      durationMs: 1000,
    }
  }
  return {
    kind: 'streak8',
    options: dualEmitters(budget.streak8, budget.fpsLimit),
    showGem: true,
    durationMs: 1100,
  }
}

export function buildResultBurst(stars: number): CelebratePayload {
  const budget = getFxBudget()
  if (budget.tier === 'off') {
    return {
      kind: 'result',
      stars,
      options: null,
      showGem: stars >= 1,
      durationMs: 0,
    }
  }
  const count = budget.result(stars)
  return {
    kind: 'result',
    stars,
    options: resultOptions(count, budget.fpsLimit),
    showGem: stars >= 1,
    durationMs: stars >= 2 ? 1200 : 900,
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
