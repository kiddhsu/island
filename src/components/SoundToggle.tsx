import { useEffect, useState } from 'react'
import { isSfxMuted, playSfx, setSfxMuted } from '../lib/sfx'

type Props = {
  className?: string
}

export function SoundToggle({ className = '' }: Props) {
  const [muted, setMuted] = useState(() => isSfxMuted())

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail
      setMuted(Boolean(detail))
    }
    window.addEventListener('island-sfx-mute', onChange)
    return () => window.removeEventListener('island-sfx-mute', onChange)
  }, [])

  function toggle() {
    const next = !muted
    setSfxMuted(next)
    setMuted(next)
    if (!next) playSfx('tap', 0.4)
  }

  return (
    <button
      type="button"
      className={`sound-toggle ${className}`.trim()}
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? '開啟音效' : '關閉音效'}
      title={muted ? '音效關閉' : '音效開啟'}
    >
      {muted ? '🔇' : '🔊'}
      <span>{muted ? '音效關' : '音效開'}</span>
    </button>
  )
}
