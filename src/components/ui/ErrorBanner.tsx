interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 rounded-md bg-red-500/20 px-3 py-1 text-xs font-medium hover:bg-red-500/30 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
