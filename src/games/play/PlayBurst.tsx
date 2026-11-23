type Props = {
  ok: boolean
  /** 百分比定位，相對於 play-stage */
  x?: string
  y?: string
}

/** 答對／答錯的圖示特效 */
export function PlayBurst({ ok, x = '50%', y = '42%' }: Props) {
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
      <span className="play-burst-label">{ok ? '答對了！' : '再試一次'}</span>
    </div>
  )
}
