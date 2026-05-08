# Prompts séquentiels — YoutubeFocus

Lance ces prompts dans l'ordre dans Claude Code. Chaque prompt produit un résultat testable avant de passer au suivant.

---

## 🏗️ 1. Bootstrap — Config et structure

```
Initialise le projet YoutubeFocus :

1. Mets à jour package.json avec ces dépendances :
   - react, react-dom, react-router-dom v6
   - zustand, dexie, dexie-react-hooks
   - lucide-react
   - Dev : vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom, eslint

2. Crée vite.config.ts avec alias @/ → src/

3. Crée tsconfig.json (strict: true, paths pour @/)

4. Initialise Tailwind (tailwind.config.js) avec darkMode: 'class' et content: ['./src/**/*.{ts,tsx}']

5. Crée src/main.tsx (React 18 createRoot, BrowserRouter, import index.css)

6. Crée src/index.css (directives Tailwind : @tailwind base/components/utilities)

7. Crée src/App.tsx avec une route / qui affiche "YoutubeFocus — OK" en texte

Résultat attendu : npm run dev affiche "YoutubeFocus — OK" dans le navigateur.
```

---

## 🎨 2. Layout — Shell de l'application

```
Crée le shell de l'application YoutubeFocus dans src/components/layout/ :

1. AppShell.tsx : div plein écran flex avec Sidebar à gauche (w-64) et zone principale à droite (flex-1 overflow-auto). Supporte le dark mode (bg-zinc-950 dark, bg-white light).

2. Sidebar.tsx : barre latérale fixe avec :
   - Logo "YoutubeFocus" en haut
   - Liste de liens de navigation (placeholder : "Abonnements", "Playlists")
   - En bas : bouton de déconnexion (placeholder)

3. Header.tsx : barre horizontale en haut de la zone principale avec :
   - Titre de la page courante (prop)
   - ThemeToggle (icône Sun/Moon de lucide-react, bascule classe 'dark' sur <html>)

4. Crée src/store/themeStore.ts avec Zustand : état theme ('light'|'dark'), action toggle, initialisation depuis localStorage + prefers-color-scheme.

5. Branche le ThemeToggle sur themeStore.

6. Mets à jour App.tsx pour utiliser AppShell.

Résultat attendu : shell visible avec sidebar et toggle dark/light fonctionnel.
```

---

## 🔑 3. Auth — OAuth YouTube

```
Implémente l'authentification OAuth 2.0 YouTube dans YoutubeFocus :

1. Crée src/api/auth.ts :
   - buildAuthUrl() : construit l'URL Google OAuth avec client_id (VITE_OAUTH_CLIENT_ID), scope 'https://www.googleapis.com/auth/youtube.readonly', redirect_uri, response_type=token
   - parseHashToken() : extrait access_token + expires_in du hash de l'URL de retour
   - saveToken(token, expiresIn) / getToken() / clearToken() dans localStorage

2. Crée src/store/authStore.ts avec Zustand : état accessToken (string|null), actions login (redirige vers Google), handleCallback (parse le hash), logout (efface token + redirige)

3. Crée src/pages/LoginPage.tsx : page centrée avec logo et bouton "Se connecter avec Google" (appelle authStore.login())

4. Crée src/pages/CallbackPage.tsx : appelle handleCallback() au mount, redirige vers / si succès, affiche erreur sinon

5. Dans App.tsx : ajoute route /callback → CallbackPage, redirige vers /login si !accessToken

6. Ajoute VITE_OAUTH_CLIENT_ID et VITE_OAUTH_REDIRECT_URI dans .env.example

Résultat attendu : clic "Se connecter" → Google OAuth → retour sur l'app avec token stocké.
```

---

## 📡 4. Data — Fetch abonnements et cache

```
Implémente le fetch des abonnements YouTube avec cache IndexedDB dans YoutubeFocus :

1. Crée src/db/db.ts avec Dexie :
   - Tables : channels (index: id, cachedAt), playlists (index: id, channelId), videos (index: id, playlistId, isShort, watched)
   - Interfaces TypeScript pour CachedChannel, CachedPlaylist, CachedVideo (voir docs/ARCHITECTURE.md)

2. Crée src/api/youtube.ts :
   - getSubscriptions(accessToken) : appelle subscriptions.list (part=snippet, mine=true, maxResults=50), gère la pagination avec pageToken, retourne Channel[]
   - Gère les erreurs 401 (token expiré → logout) et 403 (quota dépassé → message explicite)

3. Crée src/hooks/useSubscriptions.ts :
   - Vérifie Dexie : channels valides (cachedAt > Date.now() - 3600000) ?
   - Si non : appelle getSubscriptions(), upsert dans Dexie
   - Retourne { channels, loading, error }

4. Crée src/pages/SubscriptionsPage.tsx : grille de cartes chaîne (avatar + nom), utilise useSubscriptions(), skeleton pendant le chargement

5. Branche la route / sur SubscriptionsPage dans App.tsx

Résultat attendu : page Abonnements affiche les chaînes depuis l'API (puis depuis le cache au refresh).
```

---

## 🎬 5. Features — Playlists et filtrage Shorts

```
Implémente les playlists et le filtrage des Shorts dans YoutubeFocus :

1. Dans src/api/youtube.ts, ajoute :
   - getChannelPlaylists(channelId, accessToken) : playlists.list (part=snippet,contentDetails, channelId, maxResults=50)
   - getPlaylistItems(playlistId, accessToken) : playlistItems.list (toutes les pages)
   - getVideoDetails(videoIds: string[], accessToken) : videos.list (part=contentDetails, ids en batch de 50 max), retourne { id, durationSeconds }

2. Dans src/utils/filterShorts.ts :
   - parseDuration(isoDuration: string): number — convertit PT1M30S → 90
   - isShort(durationSeconds: number): boolean — retourne durationSeconds < 60

3. Crée src/hooks/usePlaylistVideos.ts :
   - Fetch items + détails vidéo, calcule isShort pour chaque vidéo
   - Cache dans Dexie (videos table)
   - Retourne { videos: CachedVideo[], loading, error } avec Shorts déjà filtrés

4. Crée src/pages/PlaylistPage.tsx : grille de cartes vidéo (thumbnail + titre + durée), utilise usePlaylistVideos(playlistId depuis useParams())

5. Crée src/pages/ChannelPlaylistsPage.tsx : liste les playlists d'une chaîne, lien vers PlaylistPage

6. Ajoute les routes /channel/:channelId et /playlist/:playlistId dans App.tsx
7. Rends les cartes chaîne de SubscriptionsPage cliquables → ChannelPlaylistsPage

Résultat attendu : navigation complète Abonnements → Playlists → Vidéos sans Shorts.
```

---

## ✅ 6. Feature — Marquage « Vu »

```
Implémente le marquage "Vu" des vidéos dans YoutubeFocus :

1. Dans src/db/db.ts, ajoute une méthode toggleWatched(videoId: string) qui bascule watched dans Dexie

2. Crée src/hooks/useWatched.ts : retourne { toggleWatched, isWatched(id) } en lisant Dexie en live (useLiveQuery de dexie-react-hooks)

3. Dans la carte vidéo (src/components/ui/VideoCard.tsx) :
   - Icône CheckCircle (lucide-react) en overlay sur la thumbnail
   - Clic sur l'icône → toggleWatched(video.id)
   - Carte légèrement désaturée si watched: true (opacity-60 + grayscale-[30%])

4. Dans PlaylistPage, ajoute un toggle "Masquer les vidéos vues" (state local) qui filtre la liste affichée

5. Dans la Sidebar, affiche un badge de comptage des vidéos non vues pour chaque playlist visitée (lecture Dexie)

Résultat attendu : cliquer sur la coche marque la vidéo vue, le toggle cache les vues, le badge se met à jour.
```

---

## 🔍 7. Feature — Recherche locale

```
Ajoute la recherche full-text dans le cache local de YoutubeFocus :

1. Dans src/db/db.ts, ajoute un index sur videos.title pour la recherche (ou utilise une recherche JS simple)

2. Crée src/hooks/useSearch.ts :
   - Prend un query: string
   - Recherche dans Dexie videos où title.toLowerCase().includes(query.toLowerCase()) et !isShort
   - Debounce 300ms
   - Retourne { results: CachedVideo[], loading }

3. Crée src/pages/SearchPage.tsx :
   - Input de recherche en haut (autofocus)
   - Grille de résultats vidéo avec nom de la playlist/chaîne
   - Message "Aucun résultat" si vide
   - Recherche uniquement dans le cache (pas d'appel API)

4. Ajoute une icône Search dans le Header qui navigue vers /search
5. Ajoute la route /search dans App.tsx

Résultat attendu : taper dans la barre de recherche filtre les vidéos du cache en temps réel.
```

---

## ✨ 8. Polish — UX et gestion d'erreurs

```
Finalise l'UX de YoutubeFocus :

1. Crée src/components/ui/SkeletonCard.tsx : placeholder animé (animate-pulse, bg-zinc-200 dark:bg-zinc-700) aux dimensions d'une VideoCard. Utilise-le dans tous les états loading.

2. Crée src/components/ui/ErrorBanner.tsx : bannière rouge en haut de page avec message et bouton "Réessayer". Cas gérés :
   - Token expiré → "Session expirée, reconnecte-toi"
   - Quota dépassé → "Quota YouTube API atteint (réinitialisé demain)"
   - Réseau → "Impossible de joindre YouTube, mode cache activé"

3. Dans src/pages/ (SubscriptionsPage, PlaylistPage) : branche ErrorBanner sur les erreurs retournées par les hooks

4. Crée src/pages/SettingsPage.tsx :
   - Seuil de détection Shorts (slider 30s–120s, défaut 60s) → stocké dans Zustand + localStorage
   - Bouton "Vider le cache" → efface toutes les tables Dexie + recharge la page
   - Affichage du nombre de vidéos en cache

5. Ajoute /settings dans la Sidebar et les routes App.tsx

6. Vérifie que toutes les pages ont des titres <title> corrects (via react-router ou un hook usePageTitle)

Résultat attendu : expérience complète et robuste, tous les cas d'erreur affichés proprement.
```
