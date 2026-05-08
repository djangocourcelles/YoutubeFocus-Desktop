/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_OAUTH_CLIENT_ID: string
  readonly VITE_OAUTH_REDIRECT_URI: string
  readonly VITE_DEFAULT_LANGUAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
