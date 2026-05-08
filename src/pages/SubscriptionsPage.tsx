import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { CachedChannel } from '@/db/db'

type SortKey = 'alpha-asc' | 'alpha-desc' | 'recent' | 'oldest'

const SORT_LABELS: Record<SortKey, string> = {
  'alpha-asc':  'A → Z',
  'alpha-desc': 'Z → A',
  'recent':     'Abonné récemment',
  'oldest':     'Abonné anciennement',
}

function sortChannels(channels: CachedChannel[], key: SortKey): CachedChannel[] {
  const sorted = [...channels]
  switch (key) {
    case 'alpha-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    case 'alpha-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'fr'))
    case 'recent':
      return sorted.sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt))
    case 'oldest':
      return sorted.sort((a, b) => a.subscribedAt.localeCompare(b.subscribedAt))
  }
}

function ChannelCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl p-4">
      <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-2.5 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  )
}

export function SubscriptionsPage() {
  usePageTitle('Abonnements')
  const { channels, loading, error } = useSubscriptions()
  const [sortKey, setSortKey] = useState<SortKey>('alpha-asc')

  const displayed = sortChannels(channels, sortKey)

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {!loading && channels.length > 0 && (
        <div className="flex">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {loading
          ? Array.from({ length: 16 }).map((_, i) => <ChannelCardSkeleton key={i} />)
          : displayed.map((channel) => (
              <Link
                key={channel.id}
                to={`/channel/${channel.id}`}
                className="group flex flex-col items-center gap-2.5 rounded-xl p-3 transition-all duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 ring-2 ring-transparent transition-all duration-150 group-hover:ring-amber-500/60 dark:group-hover:ring-amber-400/60">
                  <span className="select-none text-lg font-semibold text-zinc-500 dark:text-zinc-300">
                    {channel.title.charAt(0).toUpperCase()}
                  </span>
                  {channel.thumbnailUrl && (
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full rounded-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>
                <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-zinc-500 dark:text-zinc-400 transition-colors group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                  {channel.title}
                </span>
              </Link>
            ))}
      </div>
      {!loading && channels.length === 0 && !error && (
        <p className="text-sm text-zinc-500">Aucun abonnement trouvé.</p>
      )}
    </div>
  )
}
