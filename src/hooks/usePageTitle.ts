import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — YoutubeFocus` : 'YoutubeFocus'
    return () => { document.title = 'YoutubeFocus' }
  }, [title])
}
