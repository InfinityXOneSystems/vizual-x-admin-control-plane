/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_AI_API_KEY: string;
  readonly VITE_GOOGLE_PROJECT_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_GOOGLE_REDIRECT_URI: string;
  readonly VITE_GEMINI_MODEL: string;
  readonly VITE_GEMINI_TEMPERATURE: string;
  readonly VITE_GEMINI_MAX_TOKENS: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
