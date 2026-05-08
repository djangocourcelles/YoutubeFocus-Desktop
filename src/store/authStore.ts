import { create } from 'zustand'
import { buildAuthUrl, clearToken, getToken, parseHashToken, saveToken } from '@/api/auth'

interface AuthStore {
  accessToken: string | null
  login: () => void
  handleCallback: () => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: getToken(),

  login: () => {
    window.location.href = buildAuthUrl()
  },

  handleCallback: () => {
    const result = parseHashToken()
    if (!result) return false
    saveToken(result.accessToken, result.expiresIn)
    set({ accessToken: result.accessToken })
    window.history.replaceState(null, '', '/')
    return true
  },

  logout: () => {
    clearToken()
    set({ accessToken: null })
  },
}))
