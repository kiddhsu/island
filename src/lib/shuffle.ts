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

/**
 * 抽題時優先讓 prompt 不重複（避免同一輪一直刷同一情境）。
 */
export function drawRoundDiversePrompt<T extends { id: string; prompt: string }>(
  bank: T[],
  count: number,
  options: {
    wrongIds?: string[]
    recentCorrectIds?: string[]
  } = {},
): T[] {
  const pool = drawRound(bank, Math.min(bank.length, Math.max(count * 3, count)), options)
  const picked: T[] = []
  const seenPrompt = new Set<string>()
  for (const q of pool) {
    if (picked.length >= count) break
    if (seenPrompt.has(q.prompt)) continue
    seenPrompt.add(q.prompt)
    picked.push(q)
  }
  if (picked.length < count) {
    for (const q of pool) {
      if (picked.length >= count) break
      if (picked.some((p) => p.id === q.id)) continue
      picked.push(q)
    }
  }
  if (picked.length < count) {
    for (const q of drawRound(bank, bank.length, options)) {
      if (picked.length >= count) break
      if (picked.some((p) => p.id === q.id)) continue
      picked.push(q)
    }
  }
  return shuffle(picked)
}
