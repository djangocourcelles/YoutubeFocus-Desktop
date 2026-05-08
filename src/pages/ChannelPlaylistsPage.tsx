import { useParams, Link } from 'react-router-dom'
import { useChannelPlaylists } from '@/hooks/useChannelPlaylists'
import { ListVideo } from 'lucide-react'

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

export function ChannelPlaylistsPage() {
  const { channelId = '' } = useParams()
  const { playlists, loading, error } = useChannelPlaylists(channelId)

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
        : playlists.map((playlist) => (
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
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{playlist.title}</p>
                <p className="text-xs text-zinc-500">{playlist.itemCount} vidéos</p>
              </div>
            </Link>
          ))}
      {!loading && playlists.length === 0 && !error && (
        <p className="text-sm text-zinc-500">Aucune playlist pour cette chaîne.</p>
      )}
    </div>
  )
}
