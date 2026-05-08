import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="flex flex-col items-center gap-7 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-4xl font-800 tracking-tight text-white">
            YoutubeFocus
          </h1>
          <div className="h-px w-12 bg-amber-400/60" />
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
          Tes abonnements YouTube sans les Shorts, les recommandations, ni les publicités.
        </p>
        <button
          onClick={login}
          className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-200 shadow transition-all duration-150 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-4 w-4"
          />
          Se connecter avec Google
        </button>
      </div>
    </div>
  )
}
