import type { IslandId, ProgressState } from '../types'
import { getActiveProfile, progressKeyForProfile } from './profiles'

export const defaultProgressState = (): ProgressState => ({
  stars: {},
  clears: {},
  wrongIds: [],
  recentCorrectIds: [],
  sessionStartedAt: null,
  restPromptDismissedUntil: null,
})

function activeProgressKey() {
  const profile = getActiveProfile()
  if (!profile) return 'island-progress-v1:guest'
  return progressKeyForProfile(profile.id)
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(activeProgressKey())
    if (!raw) return defaultProgressState()
    return { ...defaultProgressState(), ...JSON.parse(raw) }
  } catch {
    return defaultProgressState()
  }
}

export function loadProgressForProfile(profileId: string): ProgressState {
  try {
    const raw = localStorage.getItem(progressKeyForProfile(profileId))
    if (!raw) return defaultProgressState()
    return { ...defaultProgressState(), ...JSON.parse(raw) }
  } catch {
    return defaultProgressState()
  }
}

type SaveOptions = { skipCloud?: boolean }

let cloudSaveHandler: ((profileId: string, state: ProgressState) => void) | null =
  null

export function registerCloudProgressSaver(
  handler: ((profileId: string, state: ProgressState) => void) | null,
) {
  cloudSaveHandler = handler
}

export function saveProgress(state: ProgressState, options: SaveOptions = {}) {
  const next = { ...state, updatedAt: Date.now() }
  localStorage.setItem(activeProgressKey(), JSON.stringify(next))
  if (options.skipCloud) return
  const profile = getActiveProfile()
  if (profile && cloudSaveHandler) cloudSaveHandler(profile.id, next)
}

export function saveProgressForProfile(
  profileId: string,
  state: ProgressState,
  options: SaveOptions = {},
) {
  const next = { ...state, updatedAt: Date.now() }
  localStorage.setItem(progressKeyForProfile(profileId), JSON.stringify(next))
  if (options.skipCloud) return
  if (cloudSaveHandler) cloudSaveHandler(profileId, next)
}

export function starKey(islandId: IslandId) {
  return `island:${islandId}`
}

export function starsFromCorrect(correct: number, total: number) {
  if (total <= 0 || correct <= 0) return 0
  return Math.min(3, Math.max(1, Math.round((correct / total) * 3)))
}

export function recordRoundResult(input: {
  islandId: IslandId
  correct: number
  total: number
  wrongQuestionIds: string[]
  correctQuestionIds: string[]
}) {
  const state = loadProgress()
  const key = starKey(input.islandId)
  const earned = starsFromCorrect(input.correct, input.total)
  state.stars[key] = Math.max(state.stars[key] ?? 0, earned)
  state.clears[input.islandId] = (state.clears[input.islandId] ?? 0) + 1

  const wrongSet = new Set(state.wrongIds)
  for (const id of input.wrongQuestionIds) wrongSet.add(id)
  for (const id of input.correctQuestionIds) wrongSet.delete(id)
  state.wrongIds = [...wrongSet].slice(-80)

  const recent = [
    ...input.correctQuestionIds,
    ...state.recentCorrectIds.filter((id) => !input.wrongQuestionIds.includes(id)),
  ]
  state.recentCorrectIds = [...new Set(recent)].slice(0, 60)

  saveProgress(state)
  return { earned, state }
}

export function getIslandStars(islandId: IslandId) {
  return loadProgress().stars[starKey(islandId)] ?? 0
}

export function getIslandClears(islandId: IslandId) {
  return loadProgress().clears[islandId] ?? 0
}

export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const stars: Record<string, number> = { ...a.stars }
  for (const [k, v] of Object.entries(b.stars)) {
    stars[k] = Math.max(stars[k] ?? 0, v)
  }
  const clears: Record<string, number> = { ...a.clears }
  for (const [k, v] of Object.entries(b.clears)) {
    clears[k] = Math.max(clears[k] ?? 0, v)
  }
  return {
    stars,
    clears,
    wrongIds: [...new Set([...a.wrongIds, ...b.wrongIds])].slice(-80),
    recentCorrectIds: [
      ...new Set([...a.recentCorrectIds, ...b.recentCorrectIds]),
    ].slice(0, 60),
    sessionStartedAt: a.sessionStartedAt ?? b.sessionStartedAt,
    restPromptDismissedUntil:
      a.restPromptDismissedUntil ?? b.restPromptDismissedUntil,
    updatedAt: Math.max(a.updatedAt ?? 0, b.updatedAt ?? 0) || undefined,
  }
}
