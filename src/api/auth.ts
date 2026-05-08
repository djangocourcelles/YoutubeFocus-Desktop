const TOKEN_KEY = 'yt_access_token'
const TOKEN_EXPIRY_KEY = 'yt_token_expiry'

export function buildAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_OAUTH_CLIENT_ID as string,
    redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI as string,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function parseHashToken(): { accessToken: string; expiresIn: number } | null {
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const expiresIn = params.get('expires_in')
  if (!accessToken || !expiresIn) return null
  return { accessToken, expiresIn: parseInt(expiresIn, 10) }
}

export function saveToken(token: string, expiresIn: number): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token || !expiry) return null
  if (Date.now() > parseInt(expiry, 10)) {
    clearToken()
    return null
  }
  return token
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}
