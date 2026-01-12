/**
 * AdSense設定
 * 環境変数またはデフォルト値から設定を読み込む
 */
export interface AdSenseConfig {
  /** パブリッシャーID (ca-pub-XXXXXXXXXXXXXXXX) */
  publisherId: string;
  /** 広告スロットID */
  slotId: string;
  /** 広告を有効化するかどうか */
  enabled: boolean;
  /** テストモード */
  testMode: boolean;
}

/**
 * AdSense設定インスタンス
 * 環境変数から設定を読み込み、一箇所で管理
 */
export const adsenseConfig: AdSenseConfig = {
  publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '',
  slotId: import.meta.env.VITE_ADSENSE_SLOT_ID || '',
  enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
  testMode:
    import.meta.env.DEV || import.meta.env.VITE_ADSENSE_TEST_MODE === 'true',
};
