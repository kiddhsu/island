import { streakLabel } from '../../lib/celebrate'
import { useCelebrationOptional } from '../../context/CelebrationContext'

type Props = {
  ok: boolean
  /** 百分比定位，相對於 play-stage */
  x?: string
  y?: string
  /** 若玩法已知連擊可傳入；否則讀 CelebrationContext */
  streak?: number
}

/** 答對／答錯的圖示特效 */
export function PlayBurst({ ok, x = '50%', y = '42%', streak }: Props) {
  const cele = useCelebrationOptional()
  const streakNow = streak ?? cele?.streak ?? 0
  const label = ok ? streakLabel(streakNow + 1) : '再試一次'

  return (
    <div
      className={`play-burst ${ok ? 'is-ok' : 'is-bad'}`}
      style={{ left: x, top: y }}
      aria-live="polite"
    >
      <span className="play-burst-ring" />
      <span className="play-burst-spark s1" />
      <span className="play-burst-spark s2" />
      <span className="play-burst-spark s3" />
      <span className="play-burst-spark s4" />
      <span className="play-burst-icon">{ok ? '★' : '✕'}</span>
      {ok ? <span className="play-burst-plus">+1</span> : null}
      <span className="play-burst-label">{label}</span>
    </div>
  )
}
