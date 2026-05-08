# YoutubeFocus

Navigue dans tes abonnements et playlists YouTube sans la pollution de Google : pas de Shorts, pas de recommandations algorithmiques, pas de distractions. Interface sobre, dark mode, usage 100 % personnel.

## Features

- Connexion OAuth YouTube (lecture seule)
- Liste des abonnements et playlists
- Filtrage automatique des Shorts (durée < 60 s)
- Cache local IndexedDB (quota API préservé)
- Dark mode (toggle + respect `prefers-color-scheme`)

## Prérequis

- Node 20+
- Clé YouTube Data API v3 (Google Cloud Console, scope `youtube.readonly`)
- OAuth 2.0 Client ID avec `http://localhost:5173` en domaine autorisé

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner VITE_API_KEY
npm run dev
```

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Cache local | Dexie (IndexedDB) |
| API | YouTube Data API v3 |
| Routing | React Router v6 |
