import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { ProgressState } from '../types'
import {
  defaultProgressState,
  loadProgressForProfile,
  mergeProgress,
  saveProgressForProfile,
} from './progress'
import type { PlayerProfile } from './profiles'
import {
  DEFAULT_PROFILE_NAME,
  resolveProfileColor,
  resolveProfileMark,
  loadProfileStore,
  progressKeyForProfile,
  replaceLocalProfiles,
  saveProfileStore,
} from './profiles'

/** 與一年級練習、好奇小勇者分開：island/{uid}/... */
function profilesCol(db: Firestore, uid: string) {
  return collection(db, 'island', uid, 'profiles')
}

function progressDoc(db: Firestore, uid: string, profileId: string) {
  return doc(db, 'island', uid, 'progress', profileId)
}

export async function pullCloudProfiles(db: Firestore, uid: string) {
  const snap = await getDocs(profilesCol(db, uid))
  const profiles: PlayerProfile[] = []
  snap.forEach((d) => {
    const data = d.data() as Omit<PlayerProfile, 'id'> & { id?: string }
    profiles.push({
      id: d.id,
      name: data.name || '使用者',
      color: resolveProfileColor(data.color),
      emoji: resolveProfileMark(data.emoji),
      grade: data.grade === 2 ? 2 : 1,
      isDefault: data.isDefault === true,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    })
  })
  if (profiles.length) replaceLocalProfiles(profiles)
  return profiles
}

export async function pushCloudProfile(
  db: Firestore,
  uid: string,
  profile: PlayerProfile,
) {
  await setDoc(doc(profilesCol(db, uid), profile.id), {
    name: profile.name,
    color: profile.color,
    emoji: profile.emoji,
    grade: profile.grade,
    isDefault: profile.isDefault === true,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  })
}

export async function deleteCloudProfile(
  db: Firestore,
  uid: string,
  profileId: string,
) {
  await deleteDoc(doc(profilesCol(db, uid), profileId))
  await deleteDoc(progressDoc(db, uid, profileId))
}

export async function pullAndMergeProgress(
  db: Firestore,
  uid: string,
  profileId: string,
) {
  const local = loadProgressForProfile(profileId)
  const remoteSnap = await getDoc(progressDoc(db, uid, profileId))
  if (!remoteSnap.exists()) {
    if (Object.keys(local.stars).length || local.wrongIds.length) {
      await pushCloudProgress(db, uid, profileId, local)
    }
    return local
  }
  const remote = {
    ...defaultProgressState(),
    ...(remoteSnap.data() as ProgressState),
  }
  const merged = mergeProgress(local, remote)
  saveProgressForProfile(profileId, merged, { skipCloud: true })
  await pushCloudProgress(db, uid, profileId, merged)
  return merged
}

export async function pushCloudProgress(
  db: Firestore,
  uid: string,
  profileId: string,
  state: ProgressState,
) {
  await setDoc(progressDoc(db, uid, profileId), {
    ...state,
    updatedAt: Date.now(),
  })
}

export async function syncAllProfilesProgress(
  db: Firestore,
  uid: string,
  profiles: PlayerProfile[],
) {
  for (const p of profiles) {
    await pullAndMergeProgress(db, uid, p.id)
  }
}

export function cleanupOrphanLocalAfterCloud(
  remoteIds: Set<string>,
  keepId: string,
) {
  const local = loadProfileStore()
  for (const localP of local.profiles) {
    if (remoteIds.has(localP.id)) continue
    const merged = mergeProgress(
      loadProgressForProfile(keepId),
      loadProgressForProfile(localP.id),
    )
    saveProgressForProfile(keepId, merged, { skipCloud: true })
    try {
      localStorage.removeItem(progressKeyForProfile(localP.id))
    } catch {
      /* ignore */
    }
  }
}

export function markDefaultName(profiles: PlayerProfile[]) {
  return profiles.map((p) =>
    p.name === '小老師'
      ? { ...p, name: DEFAULT_PROFILE_NAME, updatedAt: Date.now() }
      : p,
  )
}

export function persistProfiles(profiles: PlayerProfile[], activeProfileId: string | null) {
  saveProfileStore({ profiles, activeProfileId })
}
