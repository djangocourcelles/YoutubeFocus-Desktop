import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CredentialsStore {
  apiKey: string
  oauthClientId: string
  isConfigured: boolean
  setCredentials: (apiKey: string, oauthClientId: string) => void
  clearCredentials: () => void
}

export const useCredentialsStore = create<CredentialsStore>()(
  persist(
    (set) => ({
      apiKey: '',
      oauthClientId: '',
      isConfigured: false,
      setCredentials: (apiKey, oauthClientId) =>
        set({ apiKey, oauthClientId, isConfigured: apiKey.trim().length > 0 && oauthClientId.trim().length > 0 }),
      clearCredentials: () => set({ apiKey: '', oauthClientId: '', isConfigured: false }),
    }),
    {
      name: 'yt-credentials',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isConfigured = state.apiKey.trim().length > 0 && state.oauthClientId.trim().length > 0
        }
      },
    }
  )
)

export function getCredentials(): { apiKey: string; oauthClientId: string } {
  const { apiKey, oauthClientId } = useCredentialsStore.getState()
  return { apiKey, oauthClientId }
}
