# YoutubeFocus — One Pager

## Problème

YouTube impose une interface saturée de contenu non sollicité : Shorts omniprésents, flux de recommandations algorithmiques, publicités, suggestions de chaînes non suivies. Pour un utilisateur qui veut simplement consulter ses abonnements et playlists, l'expérience est devenue hostile.

## Solution

YoutubeFocus est une interface alternative, minimaliste et personnelle, qui consomme l'API YouTube officielle pour afficher uniquement ce que l'utilisateur a explicitement choisi de suivre — sans aucune couche algorithmique.

## Utilisateurs cibles

Usage personnel uniquement. Pas de multi-comptes, pas d'auth multi-utilisateurs.

## Fonctionnement

```
Utilisateur → OAuth Google (youtube.readonly) → API YouTube v3
                                                      ↓
                                              Cache IndexedDB (Dexie)
                                                      ↓
                                         Interface React (Vite + Tailwind)
                                           Filtre Shorts côté client
```

## Ce que l'app fait

| Feature | Statut |
|---------|--------|
| Connexion OAuth YouTube | ✅ Prompt 3 |
| Affichage des abonnements | ✅ Prompt 4 |
| Playlists + filtrage Shorts | Prompt 5 |
| Marquage « Vu » local | Prompt 6 |
| Recherche dans le cache | Prompt 7 |
| Skeleton loaders + gestion d'erreurs | Prompt 8 |

## Ce que l'app ne fait PAS

- Pas de recommandations ni de contenu suggéré
- Pas de Shorts (filtrés automatiquement, durée < 60 s)
- Pas de publicités
- Pas de backend propre (100 % client-side + YouTube API)
- Pas de partage ni de fonctions sociales

## Stack technique

React 18 + Vite + TypeScript | Tailwind CSS | Zustand | Dexie (IndexedDB) | YouTube Data API v3

## Contraintes clés

- Quota YouTube API : 10 000 unités/jour → stratégie de cache agressive (TTL 1h listes, ∞ métadonnées)
- Auth : OAuth 2.0 implicit flow, token côté client uniquement
- Détection Shorts : `durationSeconds < 60` (pas de flag officiel dans l'API)
