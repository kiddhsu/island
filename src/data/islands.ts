import type { IslandId, PlayMode } from "../types";

export type IslandMeta = {
  id: IslandId;
  name: string;
  short: string;
  blurb: string;
  howToPlay: string;
  /** 3D 地圖極座標：角度（度）、半徑 */
  angle: number;
  radius: number;
  /** 頂面／亮面 */
  accent: string;
  /** 左側面 */
  soft: string;
  /** 右側面／暗面 */
  deep: string;
  playMode: PlayMode;
};

export const ISLANDS: IslandMeta[] = [
  {
    id: "zhuyin",
    name: "注音島",
    short: "拼讀聲調",
    blurb: "接住正確注音！",
    howToPlay: "左右移動角色，接住正確答案；接到錯的會扣命。",
    angle: 210,
    radius: 4.2,
    accent: "#9bb8e8",
    soft: "#c5d6f0",
    deep: "#4a628a",
    playMode: "catch",
  },
  {
    id: "chars",
    name: "識字島",
    short: "常用國字",
    blurb: "卡牌尋寶與配對，把國字與線索找出來。",
    howToPlay: "一般題：點正確卡牌。配對題：翻兩張成對的牌（限 4 次失誤）。",
    angle: 245,
    radius: 4.6,
    accent: "#e8a878",
    soft: "#f2d4b8",
    deep: "#8a5230",
    playMode: "flip",
  },
  {
    id: "reading",
    name: "閱讀島",
    short: "短文大意",
    blurb: "讀完短文，在岔路選正確方向繼續冒險。",
    howToPlay: "看上方故事，點畫面上的路前進。",
    angle: 280,
    radius: 4.1,
    accent: "#7dba92",
    soft: "#c5e4d0",
    deep: "#3a6b4c",
    playMode: "fork",
  },
  {
    id: "number",
    name: "數感島",
    short: "加減位值",
    blurb: "跳上正確答案平台，像瑪利歐過關。",
    howToPlay: "點畫面上的平台跳過去；跳對加分，跳錯掉下去。",
    angle: 315,
    radius: 4.5,
    accent: "#e0c46a",
    soft: "#f0e4b0",
    deep: "#8a7030",
    playMode: "jump",
  },
  {
    id: "measure",
    name: "量尺島",
    short: "時間錢幣",
    blurb: "在量尺刻度上找出正確的時間或錢幣答案。",
    howToPlay: "看題目後點畫面上的刻度標籤。",
    angle: 350,
    radius: 4.0,
    accent: "#6eb8b0",
    soft: "#c2e4e0",
    deep: "#2f6b66",
    playMode: "gauge",
  },
  {
    id: "safety",
    name: "安全島",
    short: "交通校園",
    blurb: "看紅綠燈，選最安全的過關方式。",
    howToPlay: "倒數後看燈號變化，再點最安全的做法。",
    angle: 25,
    radius: 4.4,
    accent: "#e07a5f",
    soft: "#f0c4b4",
    deep: "#8a3a28",
    playMode: "traffic",
  },
  {
    id: "nature",
    name: "自然島",
    short: "四季觀察",
    blurb: "觀察自然知識，把正確答案投進分類桶。",
    howToPlay: "先點正確答案，再點分類桶投入。",
    angle: 60,
    radius: 4.2,
    accent: "#6fbfa0",
    soft: "#c8e8d8",
    deep: "#2f6b52",
    playMode: "bins",
  },
  {
    id: "health",
    name: "健康島",
    short: "衛生習慣",
    blurb: "把步驟依序推進水管，完成洗手／刷牙關。",
    howToPlay: "依正確順序點選下一步推進。",
    angle: 95,
    radius: 3.9,
    accent: "#5eb8a8",
    soft: "#bce8e0",
    deep: "#2a6b60",
    playMode: "pipe",
  },
  {
    id: "selfcare",
    name: "自理島",
    short: "生活自理",
    blurb: "把正確的生活習慣裝進探險背包。",
    howToPlay: "想清楚後，點正確的選項裝進背包。",
    angle: 130,
    radius: 4.3,
    accent: "#c4a890",
    soft: "#e8dcc8",
    deep: "#6d5238",
    playMode: "pack",
  },
  {
    id: "mood",
    name: "心情島",
    short: "情緒社交",
    blurb: "點破正確的心情氣球，練習好好表達。",
    howToPlay: "倒數後點破正確的氣球；點錯會扣命。",
    angle: 165,
    radius: 4.0,
    accent: "#b894d4",
    soft: "#e0d0f0",
    deep: "#5a3a7a",
    playMode: "pop",
  },
];

export function getIsland(id: string): IslandMeta | undefined {
  return ISLANDS.find((i) => i.id === id);
}

export function islandPosition(island: IslandMeta): [number, number, number] {
  const rad = (island.angle * Math.PI) / 180;
  return [Math.cos(rad) * island.radius, 0.35, Math.sin(rad) * island.radius];
}
