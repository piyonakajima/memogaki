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

/** AdSenseスクリプトの読み込み状態 */
let scriptLoadPromise: Promise<void> | null = null;

/**
 * AdSenseスクリプトを動的に読み込む
 * 一度だけ読み込み、以降はキャッシュされたPromiseを返す
 */
export function loadAdSenseScript(): Promise<void> {
  // 設定が無効または既にエラー状態の場合は即座にreject
  if (!adsenseConfig.enabled || !adsenseConfig.publisherId) {
    return Promise.reject(new Error('AdSense is not configured'));
  }

  // 既に読み込み中または完了している場合はキャッシュを返す
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 既にスクリプトが存在する場合はresolve
  const existingScript = document.querySelector(
    'script[src*="adsbygoogle.js"]'
  );
  if (existingScript) {
    scriptLoadPromise = Promise.resolve();
    return scriptLoadPromise;
  }

  // 新規にスクリプトを読み込む
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.publisherId}`;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AdSense script'));

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}
