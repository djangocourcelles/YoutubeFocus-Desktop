import { useEffect, useState } from 'react'
import { db, type CachedPlaylist } from '@/db/db'
import { getChannelPlaylists, YouTubeError } from '@/api/youtube'
import { useAuthStore } from '@/store/authStore'

const TTL = 3_600_000

export function useChannelPlaylists(channelId: string) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const [playlists, setPlaylists] = useState<CachedPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !channelId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cached = await db.playlists
          .where('channelId')
          .equals(channelId)
          .and((p) => p.cachedAt > Date.now() - TTL)
          .toArray()

        if (cached.length > 0) {
          if (!cancelled) {
            setPlaylists(cached)
            setLoading(false)
          }
          return
        }

        const fresh = await getChannelPlaylists(channelId, accessToken!)
        await db.playlists.bulkPut(fresh)
        if (!cancelled) setPlaylists(fresh)
      } catch (err) {
        if (cancelled) return
        if (err instanceof YouTubeError) {
          if (err.code === 401) logout()
          else setError(err.message)
        } else {
          setError('Impossible de joindre YouTube, mode cache activé.')
          const fallback = await db.playlists.where('channelId').equals(channelId).toArray()
          if (!cancelled) setPlaylists(fallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [accessToken, channelId, logout])

  return { playlists, loading, error }
}
