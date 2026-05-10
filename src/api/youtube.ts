// FICHIER CRITIQUE — maintenir identique dans youtubefocus/src/api/youtube.ts
import type { CachedChannel, CachedPlaylist } from '@/db/db'
import { parseDuration } from '@/utils/filterShorts'

const BASE = 'https://www.googleapis.com/youtube/v3'

export class YouTubeError extends Error {
  constructor(
    message: string,
    public code: 401 | 403 | number,
  ) {
    super(message)
  }
}

async function apiFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) throw new YouTubeError('Session expirée, reconnecte-toi.', 401)
  if (res.status === 403) throw new YouTubeError('Quota YouTube API atteint (réinitialisé demain).', 403)
  if (!res.ok) throw new YouTubeError(`Erreur API YouTube (${res.status}).`, res.status)
  return res.json() as Promise<T>
}

interface SubscriptionItem {
  snippet: {
    resourceId: { channelId: string }
    title: string
    thumbnails: { default?: { url: string }; medium?: { url: string } }
    publishedAt: string
  }
}

interface SubscriptionListResponse {
  items: SubscriptionItem[]
  nextPageToken?: string
}

interface PlaylistItem {
  snippet: {
    title: string
    thumbnails: { medium?: { url: string }; default?: { url: string } }
    channelId: string
  }
  contentDetails: { itemCount: number }
  id: string
}

interface PlaylistListResponse {
  items: PlaylistItem[]
  nextPageToken?: string
}

export async function getChannelPlaylists(
  channelId: string,
  accessToken: string,
): Promise<CachedPlaylist[]> {
  const playlists: CachedPlaylist[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      channelId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    })
    const data = await apiFetch<PlaylistListResponse>(
      `${BASE}/playlists?${params}`,
      accessToken,
    )
    for (const item of data.items) {
      playlists.push({
        id: item.id,
        channelId,
        title: item.snippet.title,
        itemCount: item.contentDetails.itemCount,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          '',
        cachedAt: Date.now(),
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)
  return playlists
}

interface PlaylistItemEntry {
  snippet: {
    resourceId: { videoId: string }
    title: string
    thumbnails: { medium?: { url: string }; default?: { url: string } }
    publishedAt: string
    channelId: string
  }
}

interface PlaylistItemsResponse {
  items: PlaylistItemEntry[]
  nextPageToken?: string
}

interface VideoDetailsResponse {
  items: { id: string; contentDetails: { duration: string } }[]
}

export async function getPlaylistItems(
  playlistId: string,
  accessToken: string,
): Promise<{ videoId: string; title: string; thumbnailUrl: string; publishedAt: string; channelId: string }[]> {
  const items: { videoId: string; title: string; thumbnailUrl: string; publishedAt: string; channelId: string }[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    })
    const data = await apiFetch<PlaylistItemsResponse>(
      `${BASE}/playlistItems?${params}`,
      accessToken,
    )
    for (const item of data.items) {
      items.push({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          '',
        publishedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)
  return items
}

export async function getVideoDetails(
  videoIds: string[],
  accessToken: string,
): Promise<{ id: string; durationSeconds: number }[]> {
  const results: { id: string; durationSeconds: number }[] = []
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const params = new URLSearchParams({ part: 'contentDetails', id: batch.join(',') })
    const data = await apiFetch<VideoDetailsResponse>(
      `${BASE}/videos?${params}`,
      accessToken,
    )
    for (const item of data.items) {
      results.push({ id: item.id, durationSeconds: parseDuration(item.contentDetails.duration) })
    }
  }
  return results
}

export async function getMyPlaylists(accessToken: string): Promise<CachedPlaylist[]> {
  const playlists: CachedPlaylist[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    })
    const data = await apiFetch<PlaylistListResponse>(`${BASE}/playlists?${params}`, accessToken)
    for (const item of data.items) {
      playlists.push({
        id: item.id,
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        itemCount: item.contentDetails.itemCount,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          '',
        cachedAt: Date.now(),
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)
  return playlists
}

export async function getSubscriptions(accessToken: string): Promise<CachedChannel[]> {
  const channels: CachedChannel[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      mine: 'true',
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    })
    const data = await apiFetch<SubscriptionListResponse>(
      `${BASE}/subscriptions?${params}`,
      accessToken,
    )
    for (const item of data.items) {
      channels.push({
        id: item.snippet.resourceId.channelId,
        title: item.snippet.title,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          '',
        subscribedAt: item.snippet.publishedAt,
        cachedAt: Date.now(),
      })
    }
    pageToken = data.nextPageToken
  } while (pageToken)

  return channels
}
