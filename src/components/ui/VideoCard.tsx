import { Check } from 'lucide-react'
import type { CachedVideo } from '@/db/db'

interface VideoCardProps {
  video: CachedVideo
  watched?: boolean
  onToggleWatched?: (id: string) => void
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoCard({ video, watched = false, onToggleWatched }: VideoCardProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-200 ${
        watched ? 'opacity-50' : ''
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className={`h-full w-full object-cover transition-all duration-300 ${
            watched ? 'sepia-[60%]' : 'group-hover:scale-[1.03]'
          }`}
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
          {formatDuration(video.durationSeconds)}
        </span>
        {onToggleWatched && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWatched(video.id) }}
            className={`absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150 ${
              watched
                ? 'bg-amber-500 text-white opacity-100'
                : 'bg-black/50 text-white/70 opacity-0 backdrop-blur-sm hover:bg-amber-500 hover:text-white group-hover:opacity-100'
            }`}
            aria-label={watched ? 'Marquer non vu' : 'Marquer vu'}
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">
          {video.title}
        </p>
      </div>
    </a>
  )
}
