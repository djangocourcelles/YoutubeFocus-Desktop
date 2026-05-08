# LLD — Low-Level Design

> Modèle C4 niveau 3 (Composants) + diagrammes de séquence

## Niveau 3 — Composants par module

### Module API (`src/api/`)

```
┌─────────────────────────────────────────────────────────┐
│                      src/api/                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  auth.ts                                          │   │
│  │  ─────────────────────────────────────────────── │   │
│  │  + buildAuthUrl(): string                         │   │
│  │    → construit URL Google OAuth (params URLSearch) │   │
│  │  + parseHashToken(): {accessToken, expiresIn}|null │   │
│  │    → extrait access_token du hash window.location │   │
│  │  + saveToken(token, expiresIn): void               │   │
│  │    → localStorage: yt_access_token + expiry ts    │   │
│  │  + getToken(): string|null                         │   │
│  │    → vérifie expiry avant de retourner le token   │   │
│  │  + clearToken(): void                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  youtube.ts                                       │   │
│  │  ─────────────────────────────────────────────── │   │
│  │  + YouTubeError(message, code: 401|403|number)    │   │
│  │  - apiFetch<T>(url, accessToken): Promise<T>      │   │
│  │    → fetch + header Authorization Bearer          │   │
│  │    → throw YouTubeError sur 401/403               │   │
│  │  + getSubscriptions(accessToken): CachedChannel[] │   │
│  │    → subscriptions.list (pagination complète)     │   │
│  │  + getChannelPlaylists(channelId, token): ...     │   │  ← Prompt 5
│  │  + getPlaylistItems(playlistId, token): ...        │   │  ← Prompt 5
│  │  + getVideoDetails(ids[], token): ...              │   │  ← Prompt 5
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Module DB (`src/db/`)

```
┌─────────────────────────────────────────────────────────┐
│  src/db/db.ts  [Dexie — IndexedDB]                       │
│                                                          │
│  YoutubeFocusDB extends Dexie                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Table<CachedChannel>  channels                      │ │
│  │   PK: id (channelId YouTube)                       │ │
│  │   Index: cachedAt  ← pour requête TTL              │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Table<CachedPlaylist>  playlists                    │ │
│  │   PK: id                                           │ │
│  │   Index: channelId, cachedAt                       │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Table<CachedVideo>  videos                          │ │
│  │   PK: id                                           │ │
│  │   Index: playlistId, isShort, watched, cachedAt    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  TTL constants                                           │
│    CHANNEL_TTL  = 3 600 000 ms (1h)                     │
│    PLAYLIST_TTL = 3 600 000 ms (1h)                     │
│    VIDEO_TTL    = ∞  (métadonnées stables)              │
└─────────────────────────────────────────────────────────┘
```

### Module Store (`src/store/`)

```
┌────────────────────────────────────────────────────────────────┐
│  authStore (Zustand)                                            │
│  ──────────────────────────────────────────────────────────    │
│  state   : accessToken: string | null                          │
│  init    : getToken() depuis localStorage (vérifie expiry)     │
│  login() : window.location.href = buildAuthUrl()               │
│  handleCallback() : parseHashToken() → saveToken() → setState  │
│  logout() : clearToken() → setState({ accessToken: null })     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  themeStore (Zustand)                                           │
│  ──────────────────────────────────────────────────────────    │
│  state   : theme: 'light' | 'dark'                             │
│  init    : localStorage → prefers-color-scheme                 │
│  toggle(): bascule → localStorage + classList <html>           │
│  effet de bord : applyTheme() appelé au module load (anti-FOUC)│
└────────────────────────────────────────────────────────────────┘
```

---

## Diagrammes de séquence

### Séquence 1 — Authentification OAuth

```
Utilisateur    LoginPage    authStore     Google OAuth
    │               │            │              │
    │  clic login   │            │              │
    │──────────────►│            │              │
    │               │  login()   │              │
    │               │───────────►│              │
    │               │            │ redirect     │
    │               │            │─────────────►│
    │               │            │              │ (consent)
    │               │            │              │
    │               │◄─── redirect /callback#access_token=...
    │               │            │              │
    │        CallbackPage        │              │
    │               │ handleCallback()          │
    │               │───────────►│              │
    │               │            │ parseHashToken()
    │               │            │ saveToken()  │
    │               │            │ setState()   │
    │               │ navigate('/') │           │
    │◄──────────────│            │              │
```

### Séquence 2 — Chargement des abonnements

```
SubscriptionsPage  useSubscriptions    Dexie (IDB)    YouTube API
       │                  │                 │               │
       │  mount           │                 │               │
       │─────────────────►│                 │               │
       │                  │ query channels  │               │
       │                  │ where cachedAt  │               │
       │                  │ > now - TTL     │               │
       │                  │────────────────►│               │
       │                  │                 │               │
       │                  │◄── [] (vide ou expiré)          │
       │                  │                 │               │
       │                  │  getSubscriptions(token)        │
       │                  │────────────────────────────────►│
       │                  │◄── [{channelId, title, ...}]   │
       │                  │                                 │
       │                  │ bulkPut(channels)               │
       │                  │────────────────►│               │
       │                  │ setState(channels)              │
       │◄─────────────────│                 │               │
       │  render grille   │                 │               │
       │  (skeleton → cards)                │               │
```

### Séquence 3 — Chargement playlist + filtrage Shorts (Prompt 5)

```
PlaylistPage  usePlaylistVideos  Dexie    youtube.ts     videos.list
     │               │            │           │               │
     │  playlistId   │            │           │               │
     │──────────────►│            │           │               │
     │               │ query videos           │               │
     │               │────────────►│          │               │
     │               │◄── [] (cache miss)     │               │
     │               │            │           │               │
     │               │ getPlaylistItems()     │               │
     │               │────────────────────────►              │
     │               │◄── [{videoId, ...}]                   │
     │               │            │           │               │
     │               │ getVideoDetails(ids batch 50)         │
     │               │────────────────────────────────────────►
     │               │◄── [{durationSeconds}]                 │
     │               │            │           │               │
     │               │ filterShorts (< 60s)   │               │
     │               │ bulkPut(videos)         │               │
     │               │────────────►│          │               │
     │◄──────────────│ videos.filter(!isShort)│               │
     │  render grille│            │           │               │
```

---

## Stratégie de gestion d'erreurs

```
apiFetch()
  ├── 401 → YouTubeError(401) → authStore.logout() → redirect /login
  ├── 403 → YouTubeError(403) → ErrorBanner "Quota épuisé"
  ├── réseau KO → Error natif → ErrorBanner "Mode cache" + fallback Dexie
  └── 2xx → parse JSON → retour données
```

---

## Interfaces TypeScript complètes

```typescript
// src/db/db.ts
interface CachedChannel {
  id: string           // channelId YouTube
  title: string
  thumbnailUrl: string
  subscribedAt: string // ISO 8601
  cachedAt: number     // Date.now()
}

interface CachedPlaylist {
  id: string
  channelId: string
  title: string
  itemCount: number
  thumbnailUrl: string
  cachedAt: number
}

interface CachedVideo {
  id: string
  playlistId: string
  channelId: string
  title: string
  thumbnailUrl: string
  publishedAt: string   // ISO 8601
  durationSeconds: number
  isShort: boolean      // durationSeconds < SHORT_THRESHOLD (défaut 60)
  watched: boolean      // état local uniquement, jamais envoyé à YouTube
  cachedAt: number
}

// src/store/authStore.ts
interface AuthStore {
  accessToken: string | null
  login: () => void
  handleCallback: () => boolean
  logout: () => void
}

// src/store/themeStore.ts
interface ThemeStore {
  theme: 'light' | 'dark'
  toggle: () => void
}
```
