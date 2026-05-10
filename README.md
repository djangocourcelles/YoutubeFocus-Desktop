# YoutubeFocus Desktop

Naviguez dans vos abonnements et playlists YouTube **sans la pollution de Google** : pas de Shorts, pas de recommandations algorithmiques, pas de publicités. Une interface sobre, rapide, et qui respecte votre attention.

Application de bureau macOS construite avec Tauri v2 + React.

---

## Fonctionnalités

- **Abonnements** : toutes vos chaînes en grille, triables (A→Z, Z→A, récents, anciens)
- **Playlists** : vos playlists personnelles avec miniatures
- **Vidéos** : grille par playlist, filtre "vus / non vus", tri par date ou durée
- **Shorts masqués** : les vidéos de moins de 60 s sont automatiquement filtrées
- **Recherche** : dans vos contenus mis en cache
- **Dark mode** : suit votre préférence système, basculable manuellement
- **Cache local** : vos données restent sur votre appareil — quota API préservé

---

## Installation

Rendez-vous dans l'onglet [Releases](../../releases) et téléchargez le `.dmg` :

- **Apple Silicon (M1/M2/M3/M4)** → `YoutubeFocus_x.x.x_aarch64.dmg`
- **Intel** → `YoutubeFocus_x.x.x_x64.dmg`

Ouvrez le `.dmg`, glissez l'app dans Applications, lancez-la.

---

## Première utilisation — Configurer vos identifiants Google

L'app n'embarque aucune clé API. À la première ouverture, un guide vous accompagne. Voici le détail complet :

### Étape 1 — Créer un projet Google Cloud

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com) et connectez-vous.
2. En haut à gauche, cliquez sur le **sélecteur de projet** → **"Nouveau projet"**.
3. Donnez-lui un nom (ex. `MesVideos`) et cliquez **"Créer"**.

### Étape 2 — Activer l'API YouTube

1. Menu de gauche → **"API et services"** → **"Bibliothèque"**.
2. Recherchez `YouTube Data API v3`, cliquez dessus, puis **"Activer"**.

### Étape 3 — Créer votre clé API

1. Menu de gauche → **"API et services"** → **"Identifiants"**.
2. Cliquez **"+ Créer des identifiants"** → **"Clé API"**.
3. Copiez la clé affichée (ex. `AIzaSyAbc123...`).

### Étape 4 — Créer votre ID client OAuth

1. Toujours dans **"Identifiants"** → **"+ Créer des identifiants"** → **"ID client OAuth 2.0"**.
2. Si demandé, configurez l'écran de consentement OAuth :
   - Type d'utilisateur : **Externe**
   - Nom de l'application : `YoutubeFocus`
   - Votre adresse e-mail → Enregistrer.
3. Type d'application : **"Application Web"**.
4. Dans **"URI de redirection autorisées"**, ajoutez exactement :
   ```
   http://localhost:5173/callback
   ```
5. Cliquez **"Créer"** et copiez l'**ID client** affiché.

### Étape 5 — Autoriser votre compte

1. Menu de gauche → **"Google Auth Platform"** → **"Audience"**.
2. Faites défiler jusqu'à **"Utilisateurs test"** et ajoutez votre adresse Gmail.

> Cette étape est nécessaire tant que votre app est en mode "Test" (parfait pour un usage personnel).

### Étape 6 — Saisir vos identifiants dans l'app

Au premier lancement, l'écran de configuration s'affiche automatiquement.

Collez votre **Clé API** et votre **ID client OAuth**, cliquez **"Enregistrer et continuer"**, connectez-vous avec Google — c'est prêt.

> Vous pouvez modifier ces identifiants à tout moment dans **Paramètres → Identifiants Google API**.

---

## Questions fréquentes

**Est-ce gratuit ?**
Oui. L'API YouTube est gratuite jusqu'à 10 000 requêtes/jour — largement suffisant pour un usage personnel.

**Mes données sont-elles partagées ?**
Non. Tout est stocké localement sur votre appareil. Aucun serveur tiers.

**L'app affiche "Cette application n'est pas vérifiée"**
Normal. Votre projet Google est en mode Test. Cliquez "Paramètres avancés" → "Accéder à YoutubeFocus" pour continuer.

**Les miniatures de chaînes ne s'affichent pas**
Limitation de la politique de référents de Google Images. Les initiales du nom s'affichent en remplacement.

---

## Développement

### Prérequis

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) via rustup
- Xcode Command Line Tools (macOS)

### Démarrer

```bash
git clone https://github.com/votre-username/youtubefocus-desktop.git
cd youtubefocus-desktop
npm install
PATH="$HOME/.cargo/bin:$PATH" npm run tauri dev
```

### Compiler

```bash
PATH="$HOME/.cargo/bin:$PATH" npm run tauri build
# → src-tauri/target/release/bundle/macos/YoutubeFocus.app
# → src-tauri/target/release/bundle/dmg/YoutubeFocus_x.x.x_aarch64.dmg
```

### Structure

```
src/
├── api/            # auth.ts (OAuth) · youtube.ts (API calls)
├── components/     # layout/ (AppShell, Sidebar) · ui/ (VideoCard, ChannelCard...)
├── db/             # Dexie IndexedDB — cache TTL 1h
├── hooks/          # useSubscriptions, usePlaylistVideos, useWatched...
├── pages/          # SetupPage, LoginPage, SubscriptionsPage, PlaylistPage...
├── store/          # authStore · credentialsStore · themeStore · settingsStore
└── App.tsx         # Routes + guards (SetupRoute, ProtectedRoute)

src-tauri/
├── src/lib.rs      # Rust : plugins + intercepteur OAuth callback
└── tauri.conf.json # Config Tauri
```

### Stack

| Couche | Technologie |
|---|---|
| Shell natif | Tauri v2 (Rust) |
| Frontend | React 18 + Vite 5 + TypeScript strict |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Cache | Dexie v4 (IndexedDB) |
| API | YouTube Data API v3 · OAuth 2.0 implicit flow |
| Routing | React Router v6 |

### Points techniques notables

- **OAuth en production Tauri** : la webview intercepte la redirection Google vers `http://localhost:5173/callback` via `on_navigation` dans Rust, et la rereoute vers `tauri://localhost/callback` sans aucun serveur local.
- **Quota API** : toutes les listes sont mises en cache (TTL 1h). Les métadonnées vidéo sont cachées indéfiniment. `videos.list` est groupé par lots de 50 pour minimiser les appels.
- **Détection Shorts** : pas de flag API fiable — détection par `durationSeconds < seuil` (configurable dans Paramètres).

---

## Licence

MIT
