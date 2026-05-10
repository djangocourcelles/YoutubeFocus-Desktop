import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Zap, Key, CheckCircle2 } from 'lucide-react'
import { open } from '@tauri-apps/plugin-shell'
import { useCredentialsStore } from '@/store/credentialsStore'

const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono'

const CARD_CLASS =
  'rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 flex gap-4'

const BADGE_CLASS =
  'flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center'

export function SetupPage() {
  const navigate = useNavigate()
  const { setCredentials } = useCredentialsStore()
  const [apiKey, setApiKey] = useState('')
  const [oauthClientId, setOauthClientId] = useState('')

  const canSave = apiKey.trim().length > 0 && oauthClientId.trim().length > 0

  function handleSave() {
    setCredentials(apiKey.trim(), oauthClientId.trim())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">YoutubeFocus</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-base">
            Configurez votre accès YouTube en 4 étapes
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className={CARD_CLASS}>
            <div className={BADGE_CLASS}>1</div>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-amber-500 flex-shrink-0" />
                <h2 className="font-semibold text-sm">Créer un projet Google</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Rendez-vous sur{' '}
                <button
                  onClick={() => open('https://console.cloud.google.com')}
                  className="text-amber-500 hover:underline"
                >
                  console.cloud.google.com
                </button>{' '}
                et connectez-vous avec votre compte Google. En haut à gauche, cliquez sur le sélecteur de projet
                {' '}&rarr; &laquo;&nbsp;Nouveau projet&nbsp;&raquo;. Donnez-lui un nom (ex.&nbsp;: &laquo;&nbsp;MesVideos&nbsp;&raquo;)
                et cliquez &laquo;&nbsp;Créer&nbsp;&raquo;.
              </p>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className={BADGE_CLASS}>2</div>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500 flex-shrink-0" />
                <h2 className="font-semibold text-sm">Activer l'API YouTube</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Dans le menu de gauche &rarr; &laquo;&nbsp;API et services&nbsp;&raquo; &rarr;
                &laquo;&nbsp;Bibliothèque&nbsp;&raquo;. Recherchez &laquo;&nbsp;YouTube Data API v3&nbsp;&raquo;,
                cliquez dessus puis cliquez &laquo;&nbsp;Activer&nbsp;&raquo;.
              </p>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className={BADGE_CLASS}>3</div>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-amber-500 flex-shrink-0" />
                <h2 className="font-semibold text-sm">Créer vos identifiants</h2>
              </div>
              <div className="flex flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">Clé API</p>
                  <p>
                    Dans &laquo;&nbsp;API et services&nbsp;&raquo; &rarr; &laquo;&nbsp;Identifiants&nbsp;&raquo;
                    &rarr; &laquo;&nbsp;+ Créer des identifiants&nbsp;&raquo; &rarr; &laquo;&nbsp;Clé API&nbsp;&raquo;.
                    Copiez la clé affichée.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">ID client OAuth</p>
                  <p>
                    Cliquez &laquo;&nbsp;+ Créer des identifiants&nbsp;&raquo; &rarr;
                    &laquo;&nbsp;ID client OAuth 2.0&nbsp;&raquo; &rarr; &laquo;&nbsp;Application Web&nbsp;&raquo;.
                    Dans &laquo;&nbsp;URI de redirection autorisées&nbsp;&raquo;, ajoutez exactement&nbsp;:
                  </p>
                  <div className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 select-all">
                    <code className="text-amber-300 font-mono text-sm">http://localhost:5173/callback</code>
                  </div>
                  <p className="mt-2">
                    Cliquez &laquo;&nbsp;Créer&nbsp;&raquo; et copiez l'&laquo;&nbsp;ID client&nbsp;&raquo;.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className={BADGE_CLASS}>4</div>
            <div className="flex flex-col gap-4 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
                <h2 className="font-semibold text-sm">Saisir vos identifiants</h2>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                    Clé API
                  </label>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                    ID client OAuth
                  </label>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="123456789-abc...apps.googleusercontent.com"
                    value={oauthClientId}
                    onChange={(e) => setOauthClientId(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="w-full mt-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm transition-colors"
                >
                  Enregistrer et continuer
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <button
            onClick={() => navigate('/login')}
            className="text-amber-500 hover:underline"
          >
            Déjà configuré ? Se connecter &rarr;
          </button>
        </p>
      </div>
    </div>
  )
}
