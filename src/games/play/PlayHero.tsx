import type { CSSProperties } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
  /** catch | jump | fork */
  pose?: 'catch' | 'jump' | 'fork'
}

/** 關卡裡可左右移動／跳躍的探險小人（取代色塊） */
export function PlayHero({ className = '', style, pose = 'catch' }: Props) {
  return (
    <div
      className={`play-hero play-hero--${pose} ${className}`}
      style={style}
      aria-hidden
    >
      <span className="play-hero-shadow" />
      <span className="play-hero-figure">
        <span className="play-hero-hat" />
        <span className="play-hero-head">
          <span className="play-hero-eye left" />
          <span className="play-hero-eye right" />
          <span className="play-hero-smile" />
        </span>
        <span className="play-hero-torso" />
        <span className="play-hero-arm left" />
        <span className="play-hero-arm right" />
        <span className="play-hero-leg left" />
        <span className="play-hero-leg right" />
      </span>
    </div>
  )
}
