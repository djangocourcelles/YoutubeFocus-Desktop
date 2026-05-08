import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { useAuthStore } from '@/store/authStore'

function UnwatchedBadge({ playlistId }: { playlistId: string }) {
  const count = useLiveQuery(
    () =>
      db.videos
        .where('playlistId')
        .equals(playlistId)
        .and((v) => !v.watched && !v.isShort)
        .count(),
    [playlistId],
  )
  if (!count) return null
  return (
    <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 border-l-2 py-2 pl-[14px] pr-3 text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-white/5 text-zinc-900 dark:text-white'
      : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.04] dark:hover:border-zinc-700'
  }`

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const recentPlaylists = useLiveQuery(
    () => db.playlists.orderBy('cachedAt').reverse().limit(5).toArray(),
    [],
  ) ?? []

  return (
    <aside className="flex h-full w-56 flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/60">
      <div className="h-14 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-800/60">
        <span className="font-display text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
          YoutubeFocus
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3">
        <NavLink to="/" end className={navLink}>
          Abonnements
        </NavLink>
        <NavLink to="/playlists" className={navLink}>
          Playlists
        </NavLink>

        {recentPlaylists.length > 0 && (
          <p className="mt-4 mb-1 pl-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-600">
            Récents
          </p>
        )}
        {recentPlaylists.map((pl) => (
          <NavLink
            key={pl.id}
            to={`/playlist/${pl.id}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 border-l-2 py-1.5 pl-[14px] pr-3 text-[13px] transition-all duration-150 ${
                isActive
                  ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-white/5 text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.04]'
              }`
            }
          >
            <span className="flex-1 truncate">{pl.title}</span>
            <UnwatchedBadge playlistId={pl.id} />
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-zinc-200 dark:border-zinc-800/60 py-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 border-l-2 py-2 pl-[14px] pr-3 text-sm transition-all duration-150 ${
              isActive
                ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-white/5 text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.04]'
            }`
          }
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Paramètres
        </NavLink>
        <button
          className="flex items-center gap-2.5 border-l-2 border-transparent py-2 pl-[14px] pr-3 text-sm text-zinc-500 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
