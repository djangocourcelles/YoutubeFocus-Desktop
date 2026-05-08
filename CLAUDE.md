# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**YoutubeFocus** est une webapp personnelle qui donne accès aux abonnements et playlists YouTube sans la pollution de l'interface Google (Shorts, recommandations, publicités). Navigation sobre, dark mode, usage solo.

## Stack technique

- **Frontend** : React 18 + Vite 5 + TypeScript (strict)
- **Styling** : Tailwind CSS v3, dark mode via classe `dark` sur `<html>`
- **State** : Zustand — `authStore` (token OAuth), `themeStore` (dark/light)
- **Cache local** : Dexie (IndexedDB) — TTL 1h sur les listes, ∞ sur métadonnées vidéo
- **API** : YouTube Data API v3, OAuth 2.0 implicit flow (scope `youtube.readonly`)
- **Routing** : React Router v6

## Fichiers clés

```
src/
├── api/
│   ├── auth.ts          # buildAuthUrl, parseHashToken, saveToken/getToken/clearToken
│   └── youtube.ts       # getSubscriptions() — pagination complète, YouTubeError (401/403)
├── components/layout/
│   ├── AppShell.tsx     # Shell flex h-screen : Sidebar + Header + <main>
│   ├── Header.tsx       # Titre page + ThemeToggle (Sun/Moon lucide)
│   └── Sidebar.tsx      # Logo + NavLinks + bouton Déconnexion
├── db/
│   └── db.ts            # Dexie v1 : tables channels, playlists, videos + interfaces
├── hooks/
│   └── useSubscriptions.ts  # Cache Dexie TTL 1h → fetch API → fallback cache
├── pages/
│   ├── CallbackPage.tsx     # Parse hash OAuth, redirige / ou affiche erreur
│   ├── LoginPage.tsx        # Page de connexion Google
│   └── SubscriptionsPage.tsx # Grille chaînes + skeleton + bandeau erreur
├── store/
│   ├── authStore.ts     # accessToken, login(), handleCallback(), logout()
│   └── themeStore.ts    # theme, toggle() — init localStorage + prefers-color-scheme
├── App.tsx              # ProtectedRoute + routes : /login, /callback, /, /playlists
├── main.tsx             # Bootstrap React 18 + BrowserRouter
└── vite-env.d.ts        # Types ImportMetaEnv
```

## Principes fondamentaux

### Ce qu'on FAIT
- Afficher abonnements et playlists de l'utilisateur authentifié
- Filtrer automatiquement les Shorts (durée < 60 s)
- Cacher toutes les données en IndexedDB pour préserver le quota API (10 000 unités/jour)
- Dark mode persisté, respecte `prefers-color-scheme` au premier chargement

### Ce qu'on NE FAIT PAS
- ❌ Pas de recommandations ni suggestions algorithmiques
- ❌ Pas de Shorts affichés (filtrés côté client)
- ❌ Pas de backend propre — tout repose sur YouTube API + stockage local
- ❌ Pas de fonctions sociales (commentaires, likes, partage)

## Conventions de code

- **Langue du code** : anglais ; **Langue de l'UI** : français
- **Composants** : functional + named exports (pas de default sauf `App`)
- **Fichiers** : PascalCase composants, camelCase hooks/utils/stores
- **Types** : interfaces TypeScript, pas de `any`, `noUnusedLocals` activé
- **Imports** : alias `@/` → `src/`
- **Commits** : Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`) — 1 commit par prompt

## Modèle de données (Dexie — src/db/db.ts)

```typescript
interface CachedChannel  { id, title, thumbnailUrl, subscribedAt, cachedAt }
interface CachedPlaylist { id, channelId, title, itemCount, thumbnailUrl, cachedAt }
interface CachedVideo    { id, playlistId, channelId, title, thumbnailUrl,
                           publishedAt, durationSeconds, isShort, watched, cachedAt }
```

## Variables d'environnement

```env
VITE_API_KEY=               # Clé YouTube Data API v3 (appels non-auth)
VITE_OAUTH_CLIENT_ID=       # Client ID OAuth 2.0 (type : application web)
VITE_OAUTH_REDIRECT_URI=    # Ex. http://localhost:5173/callback
VITE_DEFAULT_LANGUAGE=fr
```

## Commandes utiles

```bash
npm run dev          # Vite dev server
npm run build        # tsc --noEmit && vite build
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
```

## Pièges connus

- ⚠️ Quota YouTube : 10 000 unités/jour. Ne jamais re-fetcher ce qui est en cache Dexie valide.
- ⚠️ `videos.list` nécessaire pour la durée (détection Shorts) : batch de 50 ids max par appel.
- ⚠️ OAuth — Google Cloud Console, deux champs distincts :
  - **Origines JavaScript autorisées** : `http://localhost:5173` (sans chemin, sans slash final)
  - **URI de redirection autorisées** : `http://localhost:5173/callback`
  - Mettre `/callback` dans les Origines provoque l'erreur « Origine non valide ».
- ⚠️ `isShort` : pas de flag fiable dans l'API — détecter par `durationSeconds < 60`.
- ⚠️ `themeStore` applique la classe `dark` au module load (hors React) pour éviter le flash FOUC.
