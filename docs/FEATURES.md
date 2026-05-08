# Features — YoutubeFocus

## Phase 1 — MVP

### Auth & connexion
- [ ] Auth OAuth 2.0 YouTube (scope `youtube.readonly`)
- [ ] Persistance du token (localStorage + refresh automatique)
- [ ] Page d'accueil avec bouton « Se connecter avec Google »
- [ ] Déconnexion

### Navigation de base
- [ ] Sidebar : liste des abonnements (nom + avatar chaîne)
- [ ] Page Playlists d'une chaîne
- [ ] Page Vidéos d'une playlist (grille de cartes)
- [ ] Filtrage automatique des Shorts (durée < 60 s)

### Cache
- [ ] Mise en cache IndexedDB (Dexie) de tous les appels API
- [ ] TTL 1h sur les listes, TTL infini sur les métadonnées vidéo

### Dark mode
- [ ] Toggle soleil/lune dans le header
- [ ] Respect de `prefers-color-scheme` au premier chargement
- [ ] Persistance dans localStorage

---

## Phase 2 — Productivité

### Lecture & suivi
- [ ] Marquage « Vu » par vidéo (stocké localement)
- [ ] Filtre « Masquer les vidéos vues » par playlist
- [ ] Badge de comptage non-vus dans la sidebar

### Playlists personnelles
- [ ] Accès aux playlists « À regarder plus tard » et « Aimées »
- [ ] Vue dédiée « Mes playlists »

### Recherche locale
- [ ] Recherche full-text dans le cache (titres des vidéos)

### Tri & filtres
- [ ] Tri par date, durée, titre
- [ ] Filtre par durée minimale / maximale

---

## Phase 3 — Polish

### UX
- [ ] Skeleton loaders pendant les fetches API
- [ ] Gestion d'erreur gracieuse (quota épuisé, token expiré)
- [ ] Pagination infinie (scroll) dans les listes longues
- [ ] Raccourcis clavier (navigation, marquer vu)

### Paramètres
- [ ] Seuil personnalisable pour la détection des Shorts (défaut : 60 s)
- [ ] Bouton « Vider le cache »
- [ ] Affichage du quota API consommé

---

## Idées futures (non planifiées)

- Export de la liste « À regarder » en markdown
- Groupement des abonnements par catégorie (manuel)
- Statistiques personnelles de visionnage (durée totale vue, chaînes les plus regardées)
- Mode hors-ligne complet (PWA + Service Worker)
