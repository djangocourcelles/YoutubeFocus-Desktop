# Architecture — YoutubeFocus

## Schéma global

```
┌─────────────────────────────────────────────────────────┐
│                      Navigateur                          │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  React   │◄──►│   Zustand    │◄──►│  Dexie (IDB)  │  │
│  │  Pages / │    │    store     │    │  Cache local  │  │
│  │Components│    └──────────────┘    └───────────────┘  │
│  └────┬─────┘                                           │
│       │                                                  │
│  ┌────▼─────┐                                           │
│  │  api/    │────── YouTube Data API v3 ───────────────► │
│  │ (fetch)  │◄────── JSON responses ◄─────────────────── │
│  └──────────┘                                           │
└─────────────────────────────────────────────────────────┘
```

## Flux de données principaux

### 1. Chargement des abonnements

```
Page Subscriptions
  → useSubscriptions()
    → Dexie: subscriptions valides (TTL < 1h) ?
      ✓ → retourne le cache
      ✗ → api/youtube.getSubscriptions()
            → YouTube API: subscriptions.list (max 50/page, pagination)
            → Dexie: upsert + timestamp
            → Zustand: setSubscriptions()
    ← composants re-renderés
```

### 2. Chargement d'une playlist (avec filtrage Shorts)

```
Page Playlist
  → usePlaylistVideos(playlistId)
    → Dexie: items du cache ?
      ✗ → api/youtube.getPlaylistItems(playlistId)
            → YouTube API: playlistItems.list
            → ids des vidéos sans durée
            → api/youtube.getVideoDetails(ids)  ← batch 50 max
              → YouTube API: videos.list (contentDetails.duration)
              → filterShorts() : isShort = durationSeconds < 60
            → Dexie: upsert vidéos avec isShort
    → store: setCurrentPlaylist(videos.filter(v => !v.isShort))
    ← liste rendue sans Shorts
```

### 3. Toggle dark mode

```
ThemeToggle (composant header)
  → useTheme().toggle()
    → Zustand: theme = 'dark' | 'light'
    → localStorage.setItem('theme', ...)
    → document.documentElement.classList.toggle('dark')
```

## Modèle de données (Dexie)

```typescript
// db/schema.ts

interface CachedChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscribedAt: string;
  cachedAt: number;       // Date.now() — pour TTL
}

interface CachedPlaylist {
  id: string;
  channelId: string;
  title: string;
  itemCount: number;
  thumbnailUrl: string;
  cachedAt: number;
}

interface CachedVideo {
  id: string;
  playlistId: string;
  channelId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
  isShort: boolean;
  watched: boolean;       // état local, jamais envoyé à YouTube
  cachedAt: number;
}

// Tables Dexie
db.version(1).stores({
  channels:  '&id, cachedAt',
  playlists: '&id, channelId, cachedAt',
  videos:    '&id, playlistId, isShort, watched, cachedAt',
});
```

## Stratégie de cache

| Ressource | TTL | Invalidation manuelle |
|-----------|-----|-----------------------|
| Abonnements | 1h | bouton « Rafraîchir » |
| Playlists d'une chaîne | 1h | — |
| Items d'une playlist | 1h | — |
| Métadonnées vidéo (durée) | ∞ | jamais (stable) |
| État `watched` | ∞ | clic sur la vidéo |

## Gestion du quota YouTube

- Budget quotidien : 10 000 unités
- `subscriptions.list` : 1 unité × N pages
- `playlistItems.list` : 1 unité × N pages
- `videos.list` : 1 unité par batch de 50
- Stratégie : ne jamais appeler l'API si un cache valide existe en IDB
