import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { useSettingsStore } from '@/store/settingsStore'
import { useCredentialsStore } from '@/store/credentialsStore'
import { usePageTitle } from '@/hooks/usePageTitle'

export function SettingsPage() {
  usePageTitle('Paramètres')
  const { shortThreshold, setShortThreshold } = useSettingsStore()
  const [sliderValue, setSliderValue] = useState(shortThreshold)
  const { apiKey, oauthClientId, setCredentials } = useCredentialsStore()
  const [editKey, setEditKey] = useState(apiKey)
  const [editClientId, setEditClientId] = useState(oauthClientId)
  const [credsSaved, setCredsSaved] = useState(false)

  function handleSaveCredentials() {
    setCredentials(editKey.trim(), editClientId.trim())
    setCredsSaved(true)
    setTimeout(() => setCredsSaved(false), 2000)
  }

  const videoCount = useLiveQuery(() => db.videos.count(), []) ?? 0
  const channelCount = useLiveQuery(() => db.channels.count(), []) ?? 0
  const playlistCount = useLiveQuery(() => db.playlists.count(), []) ?? 0

  useEffect(() => { setSliderValue(shortThreshold) }, [shortThreshold])

  function handleClearCache() {
    if (!window.confirm('Vider tout le cache ? L\'app rechargera.')) return
    Promise.all([db.videos.clear(), db.channels.clear(), db.playlists.clear()]).then(() =>
      window.location.reload(),
    )
  }

  return (
    <div className="max-w-lg space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Identifiants Google API
        </h2>
        <div className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Clé API</label>
            <input
              type="text"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">ID client OAuth</label>
            <input
              type="text"
              value={editClientId}
              onChange={(e) => setEditClientId(e.target.value)}
              placeholder="123456789-abc...apps.googleusercontent.com"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
          <button
            onClick={handleSaveCredentials}
            disabled={!editKey.trim() || !editClientId.trim()}
            className="w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {credsSaved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
          <p className="text-xs text-zinc-500">
            Ces identifiants sont stockés uniquement sur votre appareil. Pour les obtenir, rendez-vous dans Paramètres → Configuration initiale.
          </p>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Détection des Shorts
        </h2>
        <div className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Seuil de durée
            </span>
            <span className="text-sm font-mono font-semibold text-red-500">
              {sliderValue}s
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={120}
            step={5}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            onMouseUp={() => setShortThreshold(sliderValue)}
            onTouchEnd={() => setShortThreshold(sliderValue)}
            className="w-full accent-red-500"
          />
          <p className="text-xs text-zinc-500">
            Les vidéos de moins de {sliderValue}s seront masquées. Les nouveaux caches appliquent ce seuil.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Cache local
        </h2>
        <div className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-800 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Chaînes</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{channelCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Playlists</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{playlistCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Vidéos</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{videoCount}</span>
          </div>
          <button
            onClick={handleClearCache}
            className="mt-3 w-full rounded-lg bg-red-500/10 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
          >
            Vider le cache
          </button>
        </div>
      </section>
    </div>
  )
}
