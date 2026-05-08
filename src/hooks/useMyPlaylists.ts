import { useEffect, useState } from 'react'
import { db, type CachedPlaylist } from '@/db/db'
import { getMyPlaylists, YouTubeError } from '@/api/youtube'
import { useAuthStore } from '@/store/authStore'

const TTL = 3_600_000
const MY_PLAYLISTS_CHANNEL = '__mine__'

export function useMyPlaylists() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const [playlists, setPlaylists] = useState<CachedPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cached = await db.playlists
          .where('channelId')
          .equals(MY_PLAYLISTS_CHANNEL)
          .and((p) => p.cachedAt > Date.now() - TTL)
          .toArray()

        if (cached.length > 0) {
          if (!cancelled) {
            setPlaylists(cached)
            setLoading(false)
          }
          return
        }

        const fresh = await getMyPlaylists(accessToken!)
        const tagged = fresh.map((p) => ({ ...p, channelId: MY_PLAYLISTS_CHANNEL }))
        await db.playlists.bulkPut(tagged)
        if (!cancelled) setPlaylists(tagged)
      } catch (err) {
        if (cancelled) return
        if (err instanceof YouTubeError) {
          if (err.code === 401) logout()
          else setError(err.message)
        } else {
          setError('Impossible de joindre YouTube, mode cache activé.')
          const fallback = await db.playlists
            .where('channelId')
            .equals(MY_PLAYLISTS_CHANNEL)
            .toArray()
          if (!cancelled) setPlaylists(fallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [accessToken, logout])

  return { playlists, loading, error }
}
