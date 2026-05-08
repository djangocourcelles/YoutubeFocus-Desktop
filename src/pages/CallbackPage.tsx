import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function CallbackPage() {
  const handleCallback = useAuthStore((s) => s.handleCallback)
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  useEffect(() => {
    const success = handleCallback()
    if (success) {
      navigate('/', { replace: true })
    } else {
      setError(true)
    }
  }, [handleCallback, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <p className="mb-4 text-red-400">Échec de l'authentification.</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm text-zinc-400 underline hover:text-white"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <p className="text-zinc-400">Connexion en cours…</p>
    </div>
  )
}
