import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrivacyPolicy } from './PrivacyPolicy';

describe('PrivacyPolicy', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('プライバシーポリシーページが正しくレンダリングされる', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
  });

  it('戻るボタンが表示される', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    expect(screen.getByText('← 戻る')).toBeInTheDocument();
  });

  it('戻るボタンをクリックするとコールバックが呼ばれる', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    const backButton = screen.getByText('← 戻る');
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  describe('必須コンテンツの表示', () => {
    it('広告についてセクションが表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText('広告について')).toBeInTheDocument();
    });

    it('Google AdSenseに関する説明が表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText(/Google AdSense/)).toBeInTheDocument();
    });

    it('Cookieに関する説明が表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      // Cookieは複数箇所に出現するのでgetAllByTextを使用
      const cookieTexts = screen.getAllByText(/Cookie/);
      expect(cookieTexts.length).toBeGreaterThan(0);
    });

    it('アクセス解析ツールについてセクションが表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText('アクセス解析ツールについて')).toBeInTheDocument();
    });

    it('免責事項セクションが表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText('免責事項')).toBeInTheDocument();
    });

    it('お問い合わせセクションが表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    });

    it('最終更新日が表示される', () => {
      render(<PrivacyPolicy onBack={mockOnBack} />);
      expect(screen.getByText(/最終更新日/)).toBeInTheDocument();
    });
  });

  it('Googleポリシーへの外部リンクが正しく設定されている', () => {
    render(<PrivacyPolicy onBack={mockOnBack} />);
    const link = screen.getByText('広告 – ポリシーと規約 – Google');
    expect(link).toHaveAttribute(
      'href',
      'https://policies.google.com/technologies/ads?hl=ja'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
