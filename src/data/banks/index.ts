import type { Grade, IslandId, Question } from '../../types'
import charsG1 from './chars/g1.json'
import charsG2 from './chars/g2.json'
import healthG1 from './health/g1.json'
import healthG2 from './health/g2.json'
import measureG1 from './measure/g1.json'
import measureG2 from './measure/g2.json'
import moodG1 from './mood/g1.json'
import moodG2 from './mood/g2.json'
import natureG1 from './nature/g1.json'
import natureG2 from './nature/g2.json'
import numberG1 from './number/g1.json'
import numberG2 from './number/g2.json'
import readingG1 from './reading/g1.json'
import readingG2 from './reading/g2.json'
import safetyG1 from './safety/g1.json'
import safetyG2 from './safety/g2.json'
import selfcareG1 from './selfcare/g1.json'
import selfcareG2 from './selfcare/g2.json'
import zhuyinG1 from './zhuyin/g1.json'
import zhuyinG2 from './zhuyin/g2.json'

const BANKS: Record<IslandId, Record<Grade, Question[]>> = {
  zhuyin: { 1: zhuyinG1 as Question[], 2: zhuyinG2 as Question[] },
  chars: { 1: charsG1 as Question[], 2: charsG2 as Question[] },
  reading: { 1: readingG1 as Question[], 2: readingG2 as Question[] },
  number: { 1: numberG1 as Question[], 2: numberG2 as Question[] },
  measure: { 1: measureG1 as Question[], 2: measureG2 as Question[] },
  safety: { 1: safetyG1 as Question[], 2: safetyG2 as Question[] },
  nature: { 1: natureG1 as Question[], 2: natureG2 as Question[] },
  health: { 1: healthG1 as Question[], 2: healthG2 as Question[] },
  selfcare: { 1: selfcareG1 as Question[], 2: selfcareG2 as Question[] },
  mood: { 1: moodG1 as Question[], 2: moodG2 as Question[] },
}

export function getBank(islandId: IslandId, grade: Grade): Question[] {
  const bank = BANKS[islandId][grade] ?? []
  // 時鐘島只抽時間題（錢幣／形狀已併入加減島題庫）
  if (islandId === 'measure') {
    return bank.filter((q) => q.id.includes('-time-'))
  }
  return bank
}
