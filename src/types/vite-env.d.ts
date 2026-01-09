/// <reference types="vite/client" />

// Extend Vite environment with commonly used variables (optional)
interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_TOKEN_KEY?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_RECAPTCHA_ENABLED?: string;
  // add other VITE_* vars here as needed
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
