import { useEffect, useState } from 'react'
import { db, type CachedVideo } from '@/db/db'
import { getPlaylistItems, getVideoDetails, YouTubeError } from '@/api/youtube'
import { isShort } from '@/utils/filterShorts'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

const TTL = 3_600_000

export function usePlaylistVideos(playlistId: string) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const shortThreshold = useSettingsStore((s) => s.shortThreshold)
  const [videos, setVideos] = useState<CachedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !playlistId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cached = await db.videos
          .where('playlistId')
          .equals(playlistId)
          .and((v) => v.cachedAt > Date.now() - TTL)
          .toArray()

        if (cached.length > 0) {
          if (!cancelled) {
            setVideos(cached.filter((v) => !v.isShort))
            setLoading(false)
          }
          return
        }

        const items = await getPlaylistItems(playlistId, accessToken!)
        const ids = items.map((i) => i.videoId)
        const details = await getVideoDetails(ids, accessToken!)
        const detailMap = new Map(details.map((d) => [d.id, d.durationSeconds]))

        const now = Date.now()
        const fresh: CachedVideo[] = items.map((item) => {
          const dur = detailMap.get(item.videoId) ?? 0
          return {
            id: item.videoId,
            playlistId,
            channelId: item.channelId,
            title: item.title,
            thumbnailUrl: item.thumbnailUrl,
            publishedAt: item.publishedAt,
            durationSeconds: dur,
            isShort: dur > 0 && isShort(dur, shortThreshold),
            watched: false,
            cachedAt: now,
          }
        })

        await db.videos.bulkPut(fresh)
        if (!cancelled) setVideos(fresh.filter((v) => !v.isShort))
      } catch (err) {
        if (cancelled) return
        if (err instanceof YouTubeError) {
          if (err.code === 401) logout()
          else setError(err.message)
        } else {
          setError('Impossible de joindre YouTube, mode cache activé.')
          const fallback = await db.videos.where('playlistId').equals(playlistId).toArray()
          if (!cancelled) setVideos(fallback.filter((v) => !v.isShort))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [accessToken, playlistId, logout, shortThreshold])

  return { videos, loading, error }
}
