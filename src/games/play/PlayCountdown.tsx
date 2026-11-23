import { useEffect, useState } from 'react'
import { playSfx } from '../../lib/sfx'

type Props = {
  /** 換題時重跑倒數 */
  resetKey: string
  seconds?: number
  onReady: () => void
}

/**
 * 限時／動作關卡開場倒數（3→2→1→開始）
 * 翻牌、水管等玩家自訂節奏的關卡不必使用。
 */
export function PlayCountdown({
  resetKey,
  seconds = 3,
  onReady,
}: Props) {
  const [left, setLeft] = useState(seconds)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    setLeft(seconds)
    setGone(false)
    let n = seconds
    playSfx('tap', 0.25)

    const timer = window.setInterval(() => {
      n -= 1
      if (n > 0) {
        setLeft(n)
        playSfx('tap', 0.25)
        return
      }
      window.clearInterval(timer)
      setLeft(0)
      playSfx('enter', 0.4)
      window.setTimeout(() => {
        setGone(true)
        onReady()
      }, 420)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resetKey, seconds, onReady])

  if (gone) return null

  return (
    <div className="play-countdown" aria-live="assertive">
      <div className="play-countdown-card">
        <p className="play-countdown-label">準備</p>
        <p className="play-countdown-num">{left > 0 ? left : '開始！'}</p>
        <p className="play-countdown-hint">先看清楚題目再動手</p>
      </div>
    </div>
  )
}
