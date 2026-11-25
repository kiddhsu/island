import type { CSSProperties } from 'react'

export type HeroMood = 'idle' | 'leap' | 'fall' | 'cheer' | 'oops'

type Props = {
  className?: string
  style?: CSSProperties
  /** catch | jump | fork */
  pose?: 'catch' | 'jump' | 'fork'
  mood?: HeroMood
}

/** 關卡探險小人：柔霧幾何造型＋情緒動作（純表現，不影響判定） */
export function PlayHero({
  className = '',
  style,
  pose = 'catch',
  mood = 'idle',
}: Props) {
  const moodClass =
    mood === 'idle' ? '' : mood === 'leap' ? 'is-leap' : mood === 'fall' ? 'is-fall' : mood === 'cheer' ? 'is-cheer' : 'is-oops'

  return (
    <div
      className={`play-hero play-hero--${pose} ${moodClass} ${className}`.trim()}
      style={style}
      aria-hidden
    >
      <span className="play-hero-shadow" />
      <span className="play-hero-figure">
        <span className="play-hero-hat" />
        <span className="play-hero-head">
          <span className="play-hero-eye left" />
          <span className="play-hero-eye right" />
          <span className="play-hero-cheek left" />
          <span className="play-hero-cheek right" />
          <span className="play-hero-smile" />
        </span>
        <span className="play-hero-scarf" />
        <span className="play-hero-torso" />
        <span className="play-hero-arm left" />
        <span className="play-hero-arm right" />
        <span className="play-hero-leg left" />
        <span className="play-hero-leg right" />
      </span>
    </div>
  )
}
