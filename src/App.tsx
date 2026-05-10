import { Navigate, Routes, Route, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { CallbackPage } from '@/pages/CallbackPage'
import { SetupPage } from '@/pages/SetupPage'
import { SubscriptionsPage } from '@/pages/SubscriptionsPage'
import { ChannelPlaylistsPage } from '@/pages/ChannelPlaylistsPage'
import { PlaylistPage } from '@/pages/PlaylistPage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AllPlaylistsPage } from '@/pages/AllPlaylistsPage'
import { useAuthStore } from '@/store/authStore'
import { useCredentialsStore } from '@/store/credentialsStore'
import { db } from '@/db/db'
import { useEffect, useState } from 'react'

function SetupRoute({ children }: { children: React.ReactNode }) {
  const isConfigured = useCredentialsStore((s) => s.isConfigured)
  if (!isConfigured) return <Navigate to="/setup" replace />
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isConfigured = useCredentialsStore((s) => s.isConfigured)
  if (!isConfigured) return <Navigate to="/setup" replace />
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ChannelTitle() {
  const { channelId = '' } = useParams()
  const [title, setTitle] = useState('Playlists')
  useEffect(() => {
    db.channels.get(channelId).then((c) => { if (c) setTitle(c.title) })
  }, [channelId])
  return <>{title}</>
}

function App() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/login" element={<SetupRoute><LoginPage /></SetupRoute>} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell title="Abonnements">
              <SubscriptionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel/:channelId"
        element={
          <ProtectedRoute>
            <AppShell title={<ChannelTitle /> as unknown as string}>
              <ChannelPlaylistsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlist/:playlistId"
        element={
          <ProtectedRoute>
            <AppShell title="Playlist">
              <PlaylistPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <AppShell title="Playlists">
              <AllPlaylistsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppShell title="Recherche">
              <SearchPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell title="Paramètres">
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
