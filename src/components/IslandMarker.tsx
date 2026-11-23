import { Link } from 'react-router-dom'
import type { IslandMeta } from '../data/islands'
import { playSfx } from '../lib/sfx'

type Props = {
  island: IslandMeta
  stars: number
}

export function IslandMarker({ island, stars }: Props) {
  return (
    <Link
      to={`/island/${island.id}`}
      className="island-marker"
      onClick={() => playSfx('enter', 0.45)}
      style={{
        left: `${island.x}%`,
        top: `${island.y}%`,
        ['--island-accent' as string]: island.accent,
        ['--island-soft' as string]: island.soft,
      }}
    >
      <span className="island-blob" aria-hidden />
      <span className="island-label">
        <strong>{island.name}</strong>
        <small>{island.short}</small>
        <span className="island-stars" aria-label={`${stars} 星`}>
          {'★'.repeat(stars)}
          {'☆'.repeat(Math.max(0, 3 - stars))}
        </span>
      </span>
    </Link>
  )
}
