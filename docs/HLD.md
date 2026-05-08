# HLD — High-Level Design

> Modèle C4 niveaux 1 et 2 (Contexte et Conteneurs)

## Niveau 1 — Contexte système

```
┌─────────────────────────────────────────────────────────────────┐
│                        Contexte système                          │
│                                                                  │
│   ┌───────────┐          ┌──────────────────┐                   │
│   │           │  OAuth   │                  │                   │
│   │ Laurent   │─────────►│  YoutubeFocus    │                   │
│   │(utilisat.)│  + API   │  [Single Page    │                   │
│   │           │◄─────────│   Application]   │                   │
│   └───────────┘  données └────────┬─────────┘                   │
│                                   │ YouTube                     │
│                                   │ Data API v3                 │
│                                   ▼                             │
│                          ┌─────────────────┐                   │
│                          │  Google / YouTube│                   │
│                          │  [Système externe│                   │
│                          │   OAuth 2.0 +   │                   │
│                          │   REST API]     │                   │
│                          └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

**Flux principal :** l'utilisateur s'authentifie via OAuth 2.0 Google (implicit flow), obtient un `access_token` côté navigateur, et l'app interroge directement YouTube Data API v3. Aucun backend intermédiaire.

---

## Niveau 2 — Conteneurs

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YoutubeFocus [Browser]                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React SPA (Vite)                           │   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │   │
│  │  │   Pages /   │  │   Zustand    │  │   Dexie             │ │   │
│  │  │  Components │◄─►   Stores    │  │   [IndexedDB]       │ │   │
│  │  │             │  │              │  │                     │ │   │
│  │  │ - LoginPage │  │ - authStore  │  │ - channels (TTL 1h) │ │   │
│  │  │ - Callback  │  │ - themeStore │  │ - playlists (TTL 1h)│ │   │
│  │  │ - Subscript.│  └──────────────┘  │ - videos (TTL ∞)   │ │   │
│  │  │ - Playlist  │                    └──────────┬──────────┘ │   │
│  │  │ - Search    │                               │            │   │
│  │  └──────┬──────┘                               │            │   │
│  │         │                                      │            │   │
│  │  ┌──────▼──────────────────────────────────────▼──────────┐ │   │
│  │  │                   Hooks (logique métier)                │ │   │
│  │  │  useSubscriptions · usePlaylistVideos · useWatched      │ │   │
│  │  │  useSearch · useTheme                                   │ │   │
│  │  └──────────────────────────┬─────────────────────────────┘ │   │
│  │                             │                               │   │
│  │  ┌──────────────────────────▼─────────────────────────────┐ │   │
│  │  │                   API Layer (src/api/)                  │ │   │
│  │  │  auth.ts (OAuth helpers) · youtube.ts (fetch wrappé)   │ │   │
│  │  └──────────────────────────┬─────────────────────────────┘ │   │
│  └─────────────────────────────┼─────────────────────────────── ┘  │
│                                │ HTTPS                             │
└────────────────────────────────┼─────────────────────────────────── ┘
                                 ▼
                    ┌────────────────────────┐
                    │   YouTube Data API v3   │
                    │   accounts.google.com   │
                    │   (OAuth 2.0)           │
                    └────────────────────────┘
```

---

## Décisions d'architecture

| Décision | Choix | Justification |
|----------|-------|---------------|
| Pas de backend | SPA pure | Projet solo, pas de données sensibles à protéger côté serveur |
| OAuth implicit flow | Token dans le hash URL | Adapté aux SPA sans backend — token éphémère (1h) |
| Cache IndexedDB (Dexie) | TTL 1h listes, ∞ vidéos | Quota API 10k unités/jour — ne jamais re-fetcher inutilement |
| Zustand vs Redux | Zustand | API minimaliste suffisante pour 2 stores simples |
| Filtrage Shorts client | `durationSeconds < 60` | Pas de flag officiel dans l'API YouTube |

---

## Contraintes et risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Quota API épuisé | App non fonctionnelle | Cache agressif + message d'erreur explicite |
| Token expiré (1h) | Perte d'accès silencieuse | Vérification expiry au `getToken()`, logout automatique sur 401 |
| Révocation OAuth Google | Déconnexion forcée | Géré par le 401 handler dans `youtube.ts` |
| Pas de détection Shorts fiable | Quelques faux positifs/négatifs | Seuil configurable dans les settings (Prompt 8) |
