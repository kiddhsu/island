export type SfxName = 'tap' | 'correct' | 'wrong' | 'success' | 'enter'

const FILES: Record<SfxName, string> = {
  tap: 'tap.mp3',
  correct: 'correct.mp3',
  wrong: 'wrong.mp3',
  success: 'success.mp3',
  enter: 'enter.mp3',
}

const cache = new Map<SfxName, HTMLAudioElement>()

function urlFor(name: SfxName) {
  return `${import.meta.env.BASE_URL}sounds/${FILES[name]}`
}

function getAudio(name: SfxName) {
  let audio = cache.get(name)
  if (!audio) {
    audio = new Audio(urlFor(name))
    audio.preload = 'auto'
    cache.set(name, audio)
  }
  return audio
}

export function preloadSfx(
  names: SfxName[] = ['tap', 'correct', 'wrong', 'success', 'enter'],
) {
  for (const name of names) {
    try {
      getAudio(name)
    } catch {
      /* ignore */
    }
  }
}

export function playSfx(name: SfxName, volume = 0.55) {
  if (typeof window === 'undefined') return
  try {
    const base = getAudio(name)
    const node = base.cloneNode(true) as HTMLAudioElement
    node.volume = Math.min(1, Math.max(0, volume))
    void node.play().catch(() => {
      /* 瀏覽器可能擋自動播放；等使用者點過後即可 */
    })
  } catch {
    /* ignore */
  }
}
