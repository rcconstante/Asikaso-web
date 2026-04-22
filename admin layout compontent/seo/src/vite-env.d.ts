/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_HUBSPOT_CLIENT_ID: string;
  readonly VITE_HUBSPOT_REDIRECT_URI: string;
  readonly VITE_HUBSPOT_ACCESS_TOKEN: string;
  readonly VITE_HUBSPOT_PORTAL_ID: string;
  readonly VITE_CONVEX_URL: string;
  // more env variables...
}
