import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProfileProvider, useAuthProfile } from './context/AuthProfileContext'
import { GameSession } from './pages/GameSession'
import { HomeMap } from './pages/HomeMap'
import { IslandHub } from './pages/IslandHub'
import { Profiles } from './pages/Profiles'
import { Result } from './pages/Result'

function Gate({ children }: { children: ReactNode }) {
  const { ready, activeProfile } = useAuthProfile()
  if (!ready) return <div className="page center">載入中…</div>
  if (!activeProfile) return <Navigate to="/profiles" replace />
  return children
}

export default function App() {
  return (
    <AuthProfileProvider>
      <Routes>
        <Route path="/profiles" element={<Profiles />} />
        <Route
          path="/"
          element={
            <Gate>
              <HomeMap />
            </Gate>
          }
        />
        <Route
          path="/island/:islandId"
          element={
            <Gate>
              <IslandHub />
            </Gate>
          }
        />
        <Route
          path="/island/:islandId/play"
          element={
            <Gate>
              <GameSession />
            </Gate>
          }
        />
        <Route
          path="/island/:islandId/result"
          element={
            <Gate>
              <Result />
            </Gate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProfileProvider>
  )
}
