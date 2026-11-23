import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import {
  PROFILE_COLORS,
  PROFILE_EMOJIS,
  isDefaultProfile,
} from '../lib/profiles'
import type { Grade } from '../types'
import { BigButton } from '../components/BigButton'
import { playSfx } from '../lib/sfx'

export function Profiles() {
  const navigate = useNavigate()
  const {
    ready,
    cloudEnabled,
    user,
    profiles,
    activeProfile,
    syncing,
    syncError,
    signInWithGoogle,
    signOutUser,
    selectProfile,
    createProfile,
    renameProfile,
    deleteProfile,
  } = useAuthProfile()

  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(PROFILE_COLORS[0])
  const [emoji, setEmoji] = useState<string>(PROFILE_EMOJIS[0])
  const [grade, setGrade] = useState<Grade>(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!ready) {
    return <div className="page center">載入中…</div>
  }

  if (activeProfile) {
    return <Navigate to="/" replace />
  }

  async function onSelect(id: string) {
    setBusy(true)
    setErr(null)
    try {
      playSfx('enter', 0.45)
      await selectProfile(id)
      navigate('/')
    } catch {
      setErr('選取失敗，請再試一次')
    } finally {
      setBusy(false)
    }
  }

  async function onCreate() {
    setBusy(true)
    setErr(null)
    try {
      const p = await createProfile({ name, color, emoji, grade })
      playSfx('success', 0.5)
      await selectProfile(p.id)
      navigate('/')
    } catch {
      setErr('建立失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="nes-frame profiles-nes">
      <header className="nes-hud">
        <div>
          <div className="nes-title">PLAYER SELECT</div>
          選探險家・年級決定題庫
        </div>
      </header>
      <div style={{ padding: 12 }}>

      {cloudEnabled ? (
        <section className="card-block auth-block">
          {user ? (
            <div className="auth-row">
              <span>已登入：{user.displayName || user.email}</span>
              <BigButton variant="ghost" onClick={() => void signOutUser()}>
                登出
              </BigButton>
            </div>
          ) : (
            <div className="auth-row">
              <span>用 Google 登入，進度可同步到其他裝置</span>
              <BigButton
                onClick={() =>
                  void signInWithGoogle().catch(() =>
                    setErr('登入失敗，請確認已設定 Firebase'),
                  )
                }
              >
                Google 登入
              </BigButton>
            </div>
          )}
          {syncing ? <p className="muted">同步中…</p> : null}
          {syncError ? <p className="error">{syncError}</p> : null}
        </section>
      ) : (
        <p className="muted">尚未設定雲端，進度只會存在這台裝置。</p>
      )}

      <section className="profile-grid">
        {profiles.map((p) => (
          <article key={p.id} className="profile-card" style={{ borderColor: p.color }}>
            <button
              type="button"
              className="profile-main"
              disabled={busy}
              onClick={() => void onSelect(p.id)}
            >
              <span className="avatar" style={{ background: p.color }}>
                {p.emoji}
              </span>
              <strong>{p.name}</strong>
              <small>小{p.grade === 1 ? '一' : '二'}</small>
            </button>
            <div className="profile-tools">
              <button
                type="button"
                onClick={() =>
                  void renameProfile(p.id, {
                    grade: p.grade === 1 ? 2 : 1,
                  })
                }
              >
                改為小{p.grade === 1 ? '二' : '一'}
              </button>
              {!isDefaultProfile(p) ? (
                <button type="button" onClick={() => void deleteProfile(p.id)}>
                  刪除
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="card-block">
        <h2>新增小朋友</h2>
        <label className="field">
          暱稱
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：小美"
          />
        </label>
        <div className="field">
          <span>年級</span>
          <div className="seg">
            <button
              type="button"
              className={grade === 1 ? 'is-on' : ''}
              onClick={() => setGrade(1)}
            >
              小一
            </button>
            <button
              type="button"
              className={grade === 2 ? 'is-on' : ''}
              onClick={() => setGrade(2)}
            >
              小二
            </button>
          </div>
        </div>
        <div className="field">
          <span>顏色</span>
          <div className="swatches">
            {PROFILE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${color === c ? 'is-on' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <span>頭像</span>
          <div className="swatches">
            {PROFILE_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-pick ${emoji === e ? 'is-on' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <BigButton disabled={busy || !name.trim()} onClick={() => void onCreate()}>
          建立並開始
        </BigButton>
      </section>

      {err ? <p className="error">{err}</p> : null}
      </div>
    </div>
  )
}
