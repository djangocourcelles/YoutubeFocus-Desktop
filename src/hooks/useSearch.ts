import { useState, useEffect } from 'react'
import { db, type CachedVideo } from '@/db/db'

export function useSearch(query: string) {
  const [results, setResults] = useState<CachedVideo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const q = query.toLowerCase()
      const found = await db.videos
        .filter((v) => !v.isShort && v.title.toLowerCase().includes(q))
        .toArray()
      setResults(found)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
