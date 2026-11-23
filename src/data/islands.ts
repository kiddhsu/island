import type { EngineKind, IslandId } from '../types'

export type IslandMeta = {
  id: IslandId
  name: string
  short: string
  blurb: string
  /** 地圖上的位置 % */
  x: number
  y: number
  accent: string
  soft: string
  deep: string
  engine: EngineKind
}

export const ISLANDS: IslandMeta[] = [
  {
    id: 'zhuyin',
    name: '注音島',
    short: '拼讀聲調',
    blurb: '練注音符號與聲調，把字音念準。',
    x: 18,
    y: 28,
    accent: '#2b8cff',
    soft: '#d7ecff',
    deep: '#0b4f9c',
    engine: 'choice',
  },
  {
    id: 'chars',
    name: '識字島',
    short: '常用國字',
    blurb: '認識常用字、筆順與部件。',
    x: 42,
    y: 18,
    accent: '#f08a24',
    soft: '#ffe6c8',
    deep: '#9a4b05',
    engine: 'choice',
  },
  {
    id: 'reading',
    name: '閱讀島',
    short: '短文大意',
    blurb: '看短文與圖文，找出大意與句型。',
    x: 68,
    y: 24,
    accent: '#2f9e5b',
    soft: '#d9f5e4',
    deep: '#146338',
    engine: 'choice',
  },
  {
    id: 'number',
    name: '數感島',
    short: '加減位值',
    blurb: '認識數字、位值與加減（二年級含九九入門）。',
    x: 82,
    y: 46,
    accent: '#e6b800',
    soft: '#fff3b0',
    deep: '#8a6a00',
    engine: 'choice',
  },
  {
    id: 'measure',
    name: '量尺島',
    short: '時間錢幣',
    blurb: '時間、錢幣、長度與圖形特徵。',
    x: 70,
    y: 68,
    accent: '#1aa6a0',
    soft: '#d4f5f3',
    deep: '#0b6b67',
    engine: 'choice',
  },
  {
    id: 'safety',
    name: '安全島',
    short: '交通校園',
    blurb: '交通與校園安全，做對選擇保護自己。',
    x: 46,
    y: 78,
    accent: '#e4572e',
    soft: '#ffd8cc',
    deep: '#8f2a10',
    engine: 'scenario',
  },
  {
    id: 'nature',
    name: '自然島',
    short: '四季觀察',
    blurb: '四季、動植物與日常自然現象。',
    x: 22,
    y: 70,
    accent: '#4caf50',
    soft: '#dff5e0',
    deep: '#1b5e20',
    engine: 'choice',
  },
  {
    id: 'health',
    name: '健康島',
    short: '衛生習慣',
    blurb: '洗手、刷牙與健康生活小習慣。',
    x: 12,
    y: 48,
    accent: '#00a896',
    soft: '#d2f5ef',
    deep: '#06685d',
    engine: 'order',
  },
  {
    id: 'selfcare',
    name: '自理島',
    short: '生活自理',
    blurb: '整理書包、聯絡簿與生活自理情境。',
    x: 34,
    y: 48,
    accent: '#c4a484',
    soft: '#f3ebe1',
    deep: '#6d5238',
    engine: 'scenario',
  },
  {
    id: 'mood',
    name: '心情島',
    short: '情緒社交',
    blurb: '認識情緒、輪流等待，用說的解決衝突。',
    x: 56,
    y: 50,
    accent: '#c77dff',
    soft: '#f0e0ff',
    deep: '#6b2d9b',
    engine: 'scenario',
  },
]

export function getIsland(id: string): IslandMeta | undefined {
  return ISLANDS.find((i) => i.id === id)
}
