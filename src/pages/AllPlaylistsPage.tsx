import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ListVideo } from 'lucide-react'
import { useMyPlaylists } from '@/hooks/useMyPlaylists'
import type { CachedPlaylist } from '@/db/db'

type SortKey = 'recent' | 'alpha'

function sorted(playlists: CachedPlaylist[], key: SortKey): CachedPlaylist[] {
  return [...playlists].sort((a, b) =>
    key === 'alpha' ? a.title.localeCompare(b.title, 'fr') : b.cachedAt - a.cachedAt,
  )
}

function PlaylistCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4">
      <div className="h-14 w-24 flex-shrink-0 animate-pulse rounded-lg bg-zinc-300 dark:bg-zinc-700" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

export function AllPlaylistsPage() {
  const [sort, setSort] = useState<SortKey>('recent')
  const { playlists, loading, error } = useMyPlaylists()

  const btnClass = (key: SortKey) =>
    `rounded-lg px-3 py-1 text-sm transition-colors ${
      sort === key
        ? 'bg-zinc-800 text-white dark:bg-zinc-600'
        : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-white'
    }`

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={btnClass('recent')} onClick={() => setSort('recent')}>Récents</button>
        <button className={btnClass('alpha')} onClick={() => setSort('alpha')}>A → Z</button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
          : sorted(playlists, sort).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="flex items-center gap-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {playlist.thumbnailUrl ? (
                  <img
                    src={playlist.thumbnailUrl}
                    alt={playlist.title}
                    className="h-14 w-24 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-300 dark:bg-zinc-700">
                    <ListVideo className="h-6 w-6 text-zinc-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-zinc-800 dark:text-zinc-100 truncate">{playlist.title}</p>
                  <p className="text-xs text-zinc-500">{playlist.itemCount} vidéos</p>
                </div>
              </Link>
            ))}

        {!loading && playlists.length === 0 && !error && (
          <p className="text-sm text-zinc-500">Aucune playlist trouvée sur ton compte YouTube.</p>
        )}
      </div>
    </div>
  )
}
