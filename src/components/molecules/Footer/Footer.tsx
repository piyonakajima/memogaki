import { AdBanner } from '../../atoms/AdBanner';
import { adsenseConfig } from '../../../config/adsense';
import type { FooterProps } from '../../../types/adsense';
import './Footer.css';

/**
 * フッターコンポーネント
 * - 画面下部に固定表示
 * - 広告バナーとプライバシーポリシーリンクを含む
 */
export function Footer({ onPrivacyClick, showAd = true }: FooterProps) {
  return (
    <footer className="footer">
      {showAd && adsenseConfig.enabled && (
        <div className="footer__ad-container">
          <AdBanner />
        </div>
      )}
      <div className="footer__links">
        <button
          type="button"
          className="footer__privacy-link"
          onClick={onPrivacyClick}
        >
          プライバシーポリシー
        </button>
      </div>
    </footer>
  );
}
