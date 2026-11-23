/** Fisher–Yates 洗牌（不改動原陣列） */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

/**
 * 從題庫抽一輪：優先避開最近答對；錯題略加重權重；抽完才允許重複。
 */
export function drawRound<T extends { id: string }>(
  bank: T[],
  count: number,
  options: {
    wrongIds?: string[]
    recentCorrectIds?: string[]
  } = {},
): T[] {
  const wrong = new Set(options.wrongIds ?? [])
  const recent = new Set(options.recentCorrectIds ?? [])
  const preferred = shuffle(
    bank.filter((q) => wrong.has(q.id) || !recent.has(q.id)),
  )
  const fallback = shuffle(bank.filter((q) => recent.has(q.id) && !wrong.has(q.id)))
  const pool = [...preferred, ...fallback]
  const seen = new Set<string>()
  const out: T[] = []
  for (const q of pool) {
    if (seen.has(q.id)) continue
    seen.add(q.id)
    out.push(q)
    if (out.length >= count) break
  }
  if (out.length < count) {
    for (const q of shuffle(bank)) {
      if (seen.has(q.id)) continue
      seen.add(q.id)
      out.push(q)
      if (out.length >= count) break
    }
  }
  return shuffle(out)
}
