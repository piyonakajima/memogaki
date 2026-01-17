import { useEffect, useState, useRef, useMemo } from 'react';
import { adsenseConfig, loadAdSenseScript } from '../../../config/adsense';
import type { AdBannerProps, AdLoadState } from '../../../types/adsense';
import './AdBanner.css';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * AdSense広告バナーコンポーネント
 * - 設定に基づいて広告を表示
 * - 広告ブロッカー検出と graceful degradation
 * - エラー時は空白を残さず非表示
 */
export function AdBanner({ className }: AdBannerProps) {
  // 設定チェックを先に行い、無効な場合は初期状態を'error'に
  const isConfigValid = useMemo(
    () => adsenseConfig.enabled && adsenseConfig.publisherId,
    []
  );

  const [loadState, setLoadState] = useState<AdLoadState>(
    isConfigValid ? 'loading' : 'error'
  );
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // 広告が無効または設定が不足している場合は何もしない
    if (!isConfigValid) {
      return;
    }

    // 重複初期化を防ぐ
    if (initialized.current) return;
    initialized.current = true;

    // 広告ブロッカー検出のタイムアウト（5秒）
    const timeout = setTimeout(() => {
      setLoadState((prev) => (prev === 'loading' ? 'blocked' : prev));
    }, 5000);

    // AdSenseスクリプトを動的に読み込んでから広告を初期化
    loadAdSenseScript()
      .then(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setLoadState('loaded');
        } catch {
          setLoadState('error');
        }
      })
      .catch(() => {
        setLoadState('error');
      });

    return () => clearTimeout(timeout);
  }, [isConfigValid]);

  // エラーまたはブロック時は何も表示しない（空白を残さない）
  if (loadState === 'error' || loadState === 'blocked') {
    return null;
  }

  return (
    <div className={`ad-banner ${className || ''}`}>
      <ins
        ref={adRef}
        className="adsbygoogle ad-banner__unit"
        style={{ display: 'block' }}
        data-ad-client={adsenseConfig.publisherId}
        data-ad-slot={adsenseConfig.slotId}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
        {...(adsenseConfig.testMode && { 'data-adtest': 'on' })}
      />
    </div>
  );
}
