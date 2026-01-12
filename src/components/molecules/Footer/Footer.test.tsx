import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from './Footer';

// AdSense設定をモック（無効状態）
vi.mock('../../../config/adsense', () => ({
  adsenseConfig: {
    publisherId: '',
    slotId: '',
    enabled: false,
    testMode: true,
  },
}));

// AdBannerをモック
vi.mock('../../atoms/AdBanner', () => ({
  AdBanner: () => <div data-testid="ad-banner">Ad Banner</div>,
}));

describe('Footer', () => {
  const mockOnPrivacyClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('フッターが正しくレンダリングされる', () => {
    render(<Footer onPrivacyClick={mockOnPrivacyClick} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    render(<Footer onPrivacyClick={mockOnPrivacyClick} />);
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
  });

  it('プライバシーリンクをクリックするとコールバックが呼ばれる', () => {
    render(<Footer onPrivacyClick={mockOnPrivacyClick} />);
    const link = screen.getByText('プライバシーポリシー');
    fireEvent.click(link);
    expect(mockOnPrivacyClick).toHaveBeenCalledTimes(1);
  });

  it('showAd=falseの場合、広告が表示されない', () => {
    render(<Footer onPrivacyClick={mockOnPrivacyClick} showAd={false} />);
    expect(screen.queryByTestId('ad-banner')).not.toBeInTheDocument();
  });

  it('広告が無効の場合、広告コンテナが表示されない', () => {
    // adsenseConfig.enabled = false なので広告は表示されない
    render(<Footer onPrivacyClick={mockOnPrivacyClick} showAd={true} />);
    expect(screen.queryByTestId('ad-banner')).not.toBeInTheDocument();
  });
});
