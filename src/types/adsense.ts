/**
 * AdSense関連の型定義
 */

/**
 * AdBannerコンポーネントのProps
 */
export interface AdBannerProps {
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 広告読み込み状態
 * - loading: 読み込み中
 * - loaded: 読み込み完了
 * - error: エラー発生
 * - blocked: 広告ブロッカーによりブロック
 */
export type AdLoadState = 'loading' | 'loaded' | 'error' | 'blocked';

/**
 * Footerコンポーネントのprops
 */
export interface FooterProps {
  /** プライバシーポリシーリンククリック時のコールバック */
  onPrivacyClick: () => void;
  /** 広告を表示するかどうか */
  showAd?: boolean;
}

/**
 * PrivacyPolicyコンポーネントのprops
 */
export interface PrivacyPolicyProps {
  /** 戻るボタンクリック時のコールバック */
  onBack: () => void;
}
