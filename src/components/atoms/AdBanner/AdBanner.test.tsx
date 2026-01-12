import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AdBanner } from './AdBanner';

// AdSense設定をモック
vi.mock('../../../config/adsense', () => ({
  adsenseConfig: {
    publisherId: '',
    slotId: '',
    enabled: false,
    testMode: true,
  },
}));

describe('AdBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('設定が無効な場合', () => {
    it('何も表示しない', () => {
      const { container } = render(<AdBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('パブリッシャーIDが未設定の場合', () => {
    it('何も表示しない', () => {
      const { container } = render(<AdBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  it('classNameプロパティが受け入れられる', () => {
    // 設定が無効なので何も表示されないが、propsの型は正しい
    const { container } = render(<AdBanner className="custom-class" />);
    expect(container.firstChild).toBeNull();
  });
});
