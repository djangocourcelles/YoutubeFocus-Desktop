# YoutubeFocus Desktop

Navigate your YouTube subscriptions and playlists **without Google's noise**: no Shorts, no algorithmic recommendations, no ads. A clean, fast interface that respects your attention.

Desktop app for macOS and Windows, built with Tauri v2 + React.

---

## Features

- **Subscriptions**: all your channels in a grid, sortable (A→Z, Z→A, recent, oldest)
- **Playlists**: your personal playlists with thumbnails
- **Videos**: grid per playlist, "watched / unwatched" filter, sort by date or duration
- **Shorts hidden**: videos shorter than 60s are automatically filtered out
- **Search**: across your locally cached content
- **Dark mode**: follows your system preference, manually toggleable
- **Local cache**: your data stays on your device — API quota preserved

---

## Installation

Go to the [Releases](../../releases) tab and download the installer for your platform.

### macOS

- **Apple Silicon (M1/M2/M3/M4)** → `YoutubeFocus_x.x.x_aarch64.dmg`
- **Intel** → `YoutubeFocus_x.x.x_x64.dmg`

Open the `.dmg`, drag the app to Applications, launch it.

> First launch: right-click → Open (Gatekeeper warning — app is unsigned).

### Windows

- **Windows 10/11 (64-bit)** → `YoutubeFocus_x.x.x_x64-setup.exe` or `YoutubeFocus_x.x.x_x64_en-US.msi`

Double-click the installer.

> First launch: click "More info" → "Run anyway" (SmartScreen warning — app is unsigned).

---

## First Setup — Configure Your Google Credentials

The app does not include any API key. On first launch, a setup guide walks you through it. Full details:

### Step 1 — Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in.
2. Top-left, click the **project selector** → **"New project"**.
3. Give it a name (e.g. `MyVideos`) and click **"Create"**.

### Step 2 — Enable the YouTube API

1. Left menu → **"APIs & Services"** → **"Library"**.
2. Search for `YouTube Data API v3`, click it, then **"Enable"**.

### Step 3 — Create your API key

1. Left menu → **"APIs & Services"** → **"Credentials"**.
2. Click **"+ Create Credentials"** → **"API key"**.
3. Copy the key shown (e.g. `AIzaSyAbc123...`).

### Step 4 — Create your OAuth Client ID

1. Still in **"Credentials"** → **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**.
2. If prompted, configure the OAuth consent screen:
   - User type: **External**
   - App name: `YoutubeFocus`
   - Your email address → Save.
3. Application type: **"Web application"**.
4. Under **"Authorized redirect URIs"**, add exactly:
   ```
   http://localhost:5173/callback
   ```
5. Click **"Create"** and copy the **Client ID** shown.

### Step 5 — Authorize your account

1. Left menu → **"Google Auth Platform"** → **"Audience"**.
2. Scroll to **"Test users"** and add your Gmail address.

> This step is required while your app is in "Testing" mode (perfect for personal use).

### Step 6 — Enter your credentials in the app

On first launch, the setup screen appears automatically.

Paste your **API Key** and **OAuth Client ID**, click **"Save and continue"**, sign in with Google — you're all set.

> Your credentials are stored locally in the app's data directory. They never leave your device.

---

## Architecture

```
src/
├── components/     # React components (SubscriptionGrid, VideoGrid, Settings...)
├── pages/          # Views (Home, Playlist, Search, Config)
├── hooks/          # useYouTube, useCache, useTheme
├── services/       # YouTube API client, local cache (IndexedDB)
└── types/          # TypeScript types

src-tauri/
├── src/lib.rs      # Rust: plugins + OAuth callback interceptor
└── tauri.conf.json # Tauri config
```

---

## Build from source

### Prerequisites

- Node.js 20+
- Rust + Cargo (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- macOS: Xcode Command Line Tools
- Windows: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) + [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (included in Windows 11)

```bash
git clone https://github.com/djangocourcelles/YoutubeFocus-Desktop.git
cd YoutubeFocus-Desktop
npm install
npm run tauri dev        # development
```

**macOS:**
```bash
PATH="$HOME/.cargo/bin:$PATH" npm run tauri build
# → src-tauri/target/release/bundle/macos/YoutubeFocus.app
# → src-tauri/target/release/bundle/dmg/YoutubeFocus_x.x.x_aarch64.dmg
```

**Windows:**
```powershell
npm run tauri build
# → src-tauri\target\release\bundle\msi\YoutubeFocus_x.x.x_x64_en-US.msi
# → src-tauri\target\release\bundle\nsis\YoutubeFocus_x.x.x_x64-setup.exe
```

---

## Technical notes

- **OAuth in Tauri**: the webview intercepts Google's redirect to `http://localhost:5173/callback` via `on_navigation` in Rust, rerouted to `tauri://localhost/callback` — no local server needed.
- **API quota**: all lists are cached (TTL 1h). Video metadata cached indefinitely. `videos.list` batched in groups of 50 to minimize API calls.
- **Shorts detection**: no reliable API flag — detection by `durationSeconds < threshold` (configurable in Settings).

---

## License

MIT
