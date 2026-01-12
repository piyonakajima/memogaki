/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** AdSenseパブリッシャーID */
  readonly VITE_ADSENSE_PUBLISHER_ID: string;
  /** AdSense広告スロットID */
  readonly VITE_ADSENSE_SLOT_ID: string;
  /** AdSense有効化フラグ */
  readonly VITE_ADSENSE_ENABLED: string;
  /** AdSenseテストモードフラグ */
  readonly VITE_ADSENSE_TEST_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
