import { useEffect, useState } from 'react'
import { db, type CachedChannel } from '@/db/db'
import { getSubscriptions, YouTubeError } from '@/api/youtube'
import { useAuthStore } from '@/store/authStore'

const TTL = 3_600_000

export function useSubscriptions() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const [channels, setChannels] = useState<CachedChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cached = await db.channels
          .where('cachedAt')
          .above(Date.now() - TTL)
          .toArray()

        if (cached.length > 0) {
          if (!cancelled) setChannels(cached)
        } else {
          const fresh = await getSubscriptions(accessToken!)
          await db.channels.bulkPut(fresh)
          if (!cancelled) setChannels(fresh)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof YouTubeError) {
          if (err.code === 401) logout()
          else setError(err.message)
        } else {
          setError('Impossible de joindre YouTube, mode cache activé.')
          const fallback = await db.channels.toArray()
          if (!cancelled) setChannels(fallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [accessToken, logout])

  return { channels, loading, error }
}
