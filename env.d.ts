interface ImportMetaEnv {
  readonly VITE_USER_API_URL: string;
  readonly VITE_CATALOG_API_URL: string;
  readonly VITE_ORDER_API_URL: string;
  readonly VITE_BASKET_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
