/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly BASE_URL: string;
  readonly DRACO_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
