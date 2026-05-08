import { Sun, Moon, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'

interface HeaderProps {
  title: string | React.ReactNode
}

export function Header({ title }: HeaderProps) {
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 px-6">
      <h1 className="font-display text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => navigate('/search')}
          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
          aria-label="Rechercher"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={toggle}
          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
          aria-label="Basculer le thème"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
