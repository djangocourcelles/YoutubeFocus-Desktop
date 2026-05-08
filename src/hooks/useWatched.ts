import { useLiveQuery } from 'dexie-react-hooks'
import { db, toggleWatched as dbToggleWatched } from '@/db/db'

export function useWatched(playlistId?: string) {
  const watchedIds = useLiveQuery(async () => {
    const query = playlistId
      ? db.videos.where('playlistId').equals(playlistId).and((v) => v.watched)
      : db.videos.filter((v) => v.watched)
    const watched = await query.toArray()
    return new Set(watched.map((v) => v.id))
  }, [playlistId]) ?? new Set<string>()

  const unwatchedCount = useLiveQuery(async () => {
    if (!playlistId) return 0
    return db.videos
      .where('playlistId')
      .equals(playlistId)
      .and((v) => !v.watched && !v.isShort)
      .count()
  }, [playlistId]) ?? 0

  function isWatched(id: string): boolean {
    return watchedIds.has(id)
  }

  return { isWatched, toggleWatched: dbToggleWatched, unwatchedCount }
}
