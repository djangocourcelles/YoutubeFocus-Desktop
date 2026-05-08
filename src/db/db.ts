import Dexie, { type Table } from 'dexie'

export interface CachedChannel {
  id: string
  title: string
  thumbnailUrl: string
  subscribedAt: string
  cachedAt: number
}

export interface CachedPlaylist {
  id: string
  channelId: string
  title: string
  itemCount: number
  thumbnailUrl: string
  cachedAt: number
}

export interface CachedVideo {
  id: string
  playlistId: string
  channelId: string
  title: string
  thumbnailUrl: string
  publishedAt: string
  durationSeconds: number
  isShort: boolean
  watched: boolean
  cachedAt: number
}

class YoutubeFocusDB extends Dexie {
  channels!: Table<CachedChannel>
  playlists!: Table<CachedPlaylist>
  videos!: Table<CachedVideo>

  constructor() {
    super('youtubefocus')
    this.version(1).stores({
      channels: '&id, cachedAt',
      playlists: '&id, channelId, cachedAt',
      videos: '&id, playlistId, isShort, watched, cachedAt',
    })
  }
}

export const db = new YoutubeFocusDB()

export async function toggleWatched(videoId: string): Promise<void> {
  const video = await db.videos.get(videoId)
  if (video) await db.videos.update(videoId, { watched: !video.watched })
}
