import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useWatched } from '@/hooks/useWatched'
import { VideoCard } from '@/components/ui/VideoCard'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const { results, loading } = useSearch(query)
  const { isWatched, toggleWatched } = useWatched()

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          autoFocus
          type="text"
          placeholder="Rechercher dans le cache…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl bg-zinc-100 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      {query.trim() === '' && (
        <p className="text-sm text-zinc-500">
          Recherche uniquement dans les vidéos déjà chargées (cache local).
        </p>
      )}

      {loading && (
        <p className="text-sm text-zinc-500">Recherche…</p>
      )}

      {!loading && query.trim() !== '' && results.length === 0 && (
        <p className="text-sm text-zinc-500">Aucun résultat pour « {query} ».</p>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-zinc-500">{results.length} résultat{results.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                watched={isWatched(video.id)}
                onToggleWatched={toggleWatched}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
