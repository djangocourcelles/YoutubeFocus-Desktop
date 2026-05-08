import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePlaylistVideos } from '@/hooks/usePlaylistVideos'
import { useWatched } from '@/hooks/useWatched'
import { VideoCard } from '@/components/ui/VideoCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { CachedVideo } from '@/db/db'

type SortKey = 'recent' | 'oldest' | 'unwatched' | 'longest'

const SORT_LABELS: Record<SortKey, string> = {
  recent:   'Plus récentes',
  oldest:   'Plus anciennes',
  unwatched: 'Non vues en premier',
  longest:  'Les plus longues',
}

function sortVideos(videos: CachedVideo[], key: SortKey, isWatched: (id: string) => boolean): CachedVideo[] {
  const sorted = [...videos]
  switch (key) {
    case 'recent':
      return sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    case 'oldest':
      return sorted.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
    case 'unwatched':
      return sorted.sort((a, b) => {
        const wa = isWatched(a.id) ? 1 : 0
        const wb = isWatched(b.id) ? 1 : 0
        if (wa !== wb) return wa - wb
        return b.publishedAt.localeCompare(a.publishedAt)
      })
    case 'longest':
      return sorted.sort((a, b) => b.durationSeconds - a.durationSeconds)
  }
}

export function PlaylistPage() {
  const { playlistId = '' } = useParams()
  usePageTitle('Playlist')
  const { videos, loading, error } = usePlaylistVideos(playlistId)
  const { isWatched, toggleWatched } = useWatched(playlistId)
  const [hideWatched, setHideWatched] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('recent')

  const filtered = hideWatched ? videos.filter((v) => !isWatched(v.id)) : videos
  const displayed = sortVideos(filtered, sortKey, isWatched)

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {!loading && videos.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideWatched}
              onChange={(e) => setHideWatched(e.target.checked)}
              className="accent-amber-500"
            />
            Masquer les vidéos vues
          </label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="ml-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : displayed.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                watched={isWatched(video.id)}
                onToggleWatched={toggleWatched}
              />
            ))}
      </div>
      {!loading && displayed.length === 0 && !error && (
        <p className="text-sm text-zinc-500">
          {hideWatched ? 'Toutes les vidéos ont été vues.' : 'Aucune vidéo dans cette playlist.'}
        </p>
      )}
    </div>
  )
}
