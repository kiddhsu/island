import type { IslandId, PlayMode } from '../types'

export type IslandMeta = {
  id: IslandId
  name: string
  short: string
  blurb: string
  howToPlay: string
  /** 3D 地圖極座標：角度（度）、半徑 */
  angle: number
  radius: number
  accent: string
  soft: string
  deep: string
  playMode: PlayMode
}

export const ISLANDS: IslandMeta[] = [
  {
    id: 'zhuyin',
    name: '注音島',
    short: '拼讀聲調',
    blurb: '接住正確注音！像紅白機接金幣一樣練拼讀。',
    howToPlay: '左右移動角色，接住正確答案；接到錯的會扣命。',
    /* 角度從遠側開始，避免 01 注音島一進來就被鏡頭近端裁切標題 */
    angle: 210,
    radius: 4.2,
    accent: '#2b8cff',
    soft: '#d7ecff',
    deep: '#0b4f9c',
    playMode: 'catch',
  },
  {
    id: 'chars',
    name: '識字島',
    short: '常用國字',
    blurb: '卡牌尋寶與配對，把國字與線索找出來。',
    howToPlay: '一般題：點正確卡牌。配對題：翻兩張成對的牌（限 4 次失誤）。',
    angle: 245,
    radius: 4.6,
    accent: '#f08a24',
    soft: '#ffe6c8',
    deep: '#9a4b05',
    playMode: 'flip',
  },
  {
    id: 'reading',
    name: '閱讀島',
    short: '短文大意',
    blurb: '讀完短文，在岔路選正確方向繼續冒險。',
    howToPlay: '看上方故事，點左／中／右路前進。',
    angle: 280,
    radius: 4.1,
    accent: '#2f9e5b',
    soft: '#d9f5e4',
    deep: '#146338',
    playMode: 'fork',
  },
  {
    id: 'number',
    name: '數感島',
    short: '加減位值',
    blurb: '跳上正確答案平台，像瑪利歐過關。',
    howToPlay: '點要跳的平台；跳對加分，跳錯掉下去。',
    angle: 315,
    radius: 4.5,
    accent: '#e6b800',
    soft: '#fff3b0',
    deep: '#8a6a00',
    playMode: 'jump',
  },
  {
    id: 'measure',
    name: '量尺島',
    short: '時間錢幣',
    blurb: '時間與量感關卡：跳上正確的答案台。',
    howToPlay: '看題目後點正確平台。',
    angle: 350,
    radius: 4.0,
    accent: '#1aa6a0',
    soft: '#d4f5f3',
    deep: '#0b6b67',
    playMode: 'jump',
  },
  {
    id: 'safety',
    name: '安全島',
    short: '交通校園',
    blurb: '到路口選安全的路，過關保命。',
    howToPlay: '角色跑到岔路時，選最安全的方向。',
    angle: 25,
    radius: 4.4,
    accent: '#e4572e',
    soft: '#ffd8cc',
    deep: '#8f2a10',
    playMode: 'fork',
  },
  {
    id: 'nature',
    name: '自然島',
    short: '四季觀察',
    blurb: '接住正確的自然知識掉落物。',
    howToPlay: '左右移動接住正確答案。',
    angle: 60,
    radius: 4.2,
    accent: '#4caf50',
    soft: '#dff5e0',
    deep: '#1b5e20',
    playMode: 'catch',
  },
  {
    id: 'health',
    name: '健康島',
    short: '衛生習慣',
    blurb: '把步驟依序推進水管，完成洗手／刷牙關。',
    howToPlay: '依正確順序點選下一步推進。',
    angle: 95,
    radius: 3.9,
    accent: '#00a896',
    soft: '#d2f5ef',
    deep: '#06685d',
    playMode: 'pipe',
  },
  {
    id: 'selfcare',
    name: '自理島',
    short: '生活自理',
    blurb: '生活岔路：選對習慣繼續前進。',
    howToPlay: '情境出現時點正確的路。',
    angle: 130,
    radius: 4.3,
    accent: '#c4a484',
    soft: '#f3ebe1',
    deep: '#6d5238',
    playMode: 'fork',
  },
  {
    id: 'mood',
    name: '心情島',
    short: '情緒社交',
    blurb: '情緒冒險：用對的選擇化解衝突。',
    howToPlay: '到岔路選溫柔又清楚的做法。',
    angle: 165,
    radius: 4.0,
    accent: '#c77dff',
    soft: '#f0e0ff',
    deep: '#6b2d9b',
    playMode: 'fork',
  },
]

export function getIsland(id: string): IslandMeta | undefined {
  return ISLANDS.find((i) => i.id === id)
}

export function islandPosition(island: IslandMeta): [number, number, number] {
  const rad = (island.angle * Math.PI) / 180
  return [Math.cos(rad) * island.radius, 0.35, Math.sin(rad) * island.radius]
}
