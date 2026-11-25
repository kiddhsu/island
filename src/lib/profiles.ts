import type { Grade } from '../types'

export type PlayerProfile = {
  id: string
  name: string
  color: string
  emoji: string
  grade: Grade
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export type ProfileStore = {
  profiles: PlayerProfile[]
  activeProfileId: string | null
}

const STORE_KEY = 'island-profiles-v1'
const PROGRESS_PREFIX = 'island-progress-v1'

/** 柔霧幾何選色（對齊 tokens） */
export const PROFILE_COLORS = [
  '#9bb8e8', // 霧藍
  '#e07a5f', // 珊瑚
  '#6fbfa0', // 薄荷
  '#7b5ea7', // 梅紫
  '#c4a890', // 石米
  '#d4b86a', // 柔金
] as const

/** 記號頭像：幾何符號，不再用表情／動物 emoji；仍存進 profile.emoji 欄位以相容舊資料 */
export const PROFILE_MARKS = ['◆', '●', '▲', '■', '◈', '◇', '✦', '⬡'] as const
/** @deprecated 改用 PROFILE_MARKS */
export const PROFILE_EMOJIS = PROFILE_MARKS

function defaultStore(): ProfileStore {
  return { profiles: [], activeProfileId: null }
}

export function loadProfileStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return defaultStore()
    const parsed = JSON.parse(raw) as ProfileStore
    const source = Array.isArray(parsed.profiles) ? parsed.profiles : []
    const profiles = source.map(normalizeProfile)
    const store: ProfileStore = {
      profiles,
      activeProfileId: parsed.activeProfileId ?? null,
    }
    const migrated = profiles.some((p, i) => {
      const o = source[i]
      return !o || o.emoji !== p.emoji || o.color !== p.color || o.grade !== p.grade
    })
    if (migrated) saveProfileStore(store)
    return store
  } catch {
    return defaultStore()
  }
}

const COLOR_SET = new Set<string>(PROFILE_COLORS)
const MARK_SET = new Set<string>(PROFILE_MARKS)

/** 舊玩具色 → 柔霧票 */
const LEGACY_COLOR_MAP: Record<string, string> = {
  '#3aa0ff': PROFILE_COLORS[0],
  '#ffc107': PROFILE_COLORS[5],
  '#ff7eb3': PROFILE_COLORS[1],
  '#3dce9a': PROFILE_COLORS[2],
  '#9b7bff': PROFILE_COLORS[3],
  '#ff8a4c': PROFILE_COLORS[1],
}

/** 顯示／儲存用：非幾何記號一律回落預設 ◆ */
export function resolveProfileMark(emoji: string | undefined | null) {
  if (emoji && MARK_SET.has(emoji)) return emoji
  return PROFILE_MARKS[0]
}

/** 顯示／儲存用：非柔霧色票則對應或回落霧藍 */
export function resolveProfileColor(color: string | undefined | null) {
  if (color && COLOR_SET.has(color)) return color
  if (color && LEGACY_COLOR_MAP[color.toLowerCase()]) {
    return LEGACY_COLOR_MAP[color.toLowerCase()]!
  }
  if (color && LEGACY_COLOR_MAP[color]) return LEGACY_COLOR_MAP[color]!
  return PROFILE_COLORS[0]
}

function normalizeProfile(p: PlayerProfile): PlayerProfile {
  return {
    ...p,
    grade: p.grade === 2 ? 2 : 1,
    color: resolveProfileColor(p.color),
    emoji: resolveProfileMark(p.emoji),
  }
}

export function saveProfileStore(store: ProfileStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function progressKeyForProfile(profileId: string) {
  return `${PROGRESS_PREFIX}:${profileId}`
}

export function createProfileId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_PROFILE_NAME = '小島探險家'

function ensureSingleDefaultFlag(profiles: PlayerProfile[]) {
  if (profiles.length === 0) return profiles
  if (profiles.filter((p) => p.isDefault).length === 1) return profiles
  const preferred =
    profiles.find((p) => p.isDefault) ||
    [...profiles].sort((a, b) => a.createdAt - b.createdAt)[0]
  return profiles.map((p) => ({
    ...p,
    isDefault: p.id === preferred.id,
  }))
}

export function ensureDefaultProfile() {
  const store = loadProfileStore()
  if (store.profiles.length > 0) {
    const migrated = store.profiles.map(normalizeProfile)
    const next = {
      ...store,
      profiles: ensureSingleDefaultFlag(migrated),
    }
    // 寫回：把舊 emoji／亮色頭像升級成柔霧幾何
    if (JSON.stringify(next) !== JSON.stringify(store)) saveProfileStore(next)
    return next
  }
  const now = Date.now()
  const profile: PlayerProfile = {
    id: createProfileId(),
    name: DEFAULT_PROFILE_NAME,
    color: PROFILE_COLORS[0],
    emoji: PROFILE_MARKS[0],
    grade: 1,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }
  const next: ProfileStore = { profiles: [profile], activeProfileId: null }
  saveProfileStore(next)
  return next
}

export function replaceLocalProfiles(profiles: PlayerProfile[]) {
  const store = loadProfileStore()
  const list = ensureSingleDefaultFlag(
    profiles.map(normalizeProfile).sort((a, b) => a.createdAt - b.createdAt),
  )
  const activeProfileId =
    store.activeProfileId && list.some((p) => p.id === store.activeProfileId)
      ? store.activeProfileId
      : null
  const next: ProfileStore = { profiles: list, activeProfileId }
  saveProfileStore(next)
  return next
}

export function setActiveProfileId(profileId: string | null) {
  const store = loadProfileStore()
  store.activeProfileId = profileId
  saveProfileStore(store)
  return store
}

export function addLocalProfile(input: {
  name: string
  color: string
  emoji: string
  grade: Grade
}) {
  const store = loadProfileStore()
  const now = Date.now()
  const profile: PlayerProfile = {
    id: createProfileId(),
    name: input.name.trim() || '新朋友',
    color: input.color,
    emoji: input.emoji,
    grade: input.grade,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }
  store.profiles.push(profile)
  saveProfileStore(store)
  return profile
}

export function updateLocalProfile(
  profileId: string,
  patch: Partial<Pick<PlayerProfile, 'name' | 'color' | 'emoji' | 'grade'>>,
) {
  const store = loadProfileStore()
  const idx = store.profiles.findIndex((p) => p.id === profileId)
  if (idx < 0) return null
  store.profiles[idx] = {
    ...store.profiles[idx],
    ...patch,
    updatedAt: Date.now(),
  }
  saveProfileStore(store)
  return store.profiles[idx]
}

export function isDefaultProfile(profile: PlayerProfile) {
  return profile.isDefault === true
}

export function removeLocalProfile(profileId: string) {
  const store = loadProfileStore()
  const target = store.profiles.find((p) => p.id === profileId)
  if (!target || isDefaultProfile(target)) return store
  store.profiles = store.profiles.filter((p) => p.id !== profileId)
  if (store.activeProfileId === profileId) store.activeProfileId = null
  saveProfileStore(store)
  try {
    localStorage.removeItem(progressKeyForProfile(profileId))
  } catch {
    /* ignore */
  }
  return store
}

export function getActiveProfile() {
  const store = loadProfileStore()
  if (!store.activeProfileId) return null
  return store.profiles.find((p) => p.id === store.activeProfileId) ?? null
}

export function dedupeDefaultProfiles(): string[] {
  const store = loadProfileStore()
  const candidates = store.profiles.filter(
    (p) => p.isDefault || p.name === DEFAULT_PROFILE_NAME,
  )
  if (candidates.length <= 1) {
    if (candidates.length === 1 && !candidates[0].isDefault) {
      saveProfileStore({
        ...store,
        profiles: store.profiles.map((p) =>
          p.id === candidates[0].id ? { ...p, isDefault: true } : p,
        ),
      })
    }
    return []
  }

  const kept = [...candidates].sort((a, b) => {
    if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
      return a.isDefault ? -1 : 1
    }
    return a.createdAt - b.createdAt
  })[0]

  const removedIds: string[] = []
  for (const p of candidates) {
    if (p.id === kept.id) continue
    removedIds.push(p.id)
    try {
      localStorage.removeItem(progressKeyForProfile(p.id))
    } catch {
      /* ignore */
    }
  }

  const profiles = store.profiles
    .filter((p) => !removedIds.includes(p.id))
    .map((p) =>
      p.id === kept.id
        ? {
            ...p,
            name: DEFAULT_PROFILE_NAME,
            isDefault: true,
            updatedAt: Date.now(),
          }
        : { ...p, isDefault: false },
    )
  const activeProfileId =
    store.activeProfileId && removedIds.includes(store.activeProfileId)
      ? kept.id
      : store.activeProfileId

  saveProfileStore({ profiles, activeProfileId })
  return removedIds
}
