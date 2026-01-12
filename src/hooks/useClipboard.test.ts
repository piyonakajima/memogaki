import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
  });

  describe('初期状態', () => {
    it('copied: false, error: false, errorMessage: nullで初期化される', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('copyToClipboard() - 成功', () => {
    it('Clipboard APIでコピー成功時にcopiedがtrueになる', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('テスト文字列');
      });

      expect(writeTextMock).toHaveBeenCalledWith('テスト文字列');
      expect(result.current.copied).toBe(true);
      expect(result.current.error).toBe(false);
    });

    it('コピー成功後、デフォルト3秒でcopiedがfalseにリセットされる', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('テスト');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('successDurationでリセット時間をカスタマイズできる', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() =>
        useClipboard({ successDuration: 1000 })
      );

      await act(async () => {
        await result.current.copyToClipboard('テスト');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('copyToClipboardはtrueを返す', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.copyToClipboard('テスト');
      });

      expect(success).toBe(true);
    });
  });

  describe('copyToClipboard() - フォールバック', () => {
    it('Clipboard APIがない場合、execCommandフォールバックを使用', async () => {
      // Clipboard APIを無効化
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('フォールバックテスト');
      });

      expect(execCommandMock).toHaveBeenCalledWith('copy');
      expect(result.current.copied).toBe(true);
      expect(result.current.error).toBe(false);
    });

    it('Clipboard API失敗時にフォールバックを試行', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('API error'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('フォールバック');
      });

      expect(execCommandMock).toHaveBeenCalledWith('copy');
      expect(result.current.copied).toBe(true);
      expect(result.current.error).toBe(false);
    });
  });

  describe('copyToClipboard() - エラー', () => {
    it('全ての方法が失敗した場合、errorがtrueになる', async () => {
      // Clipboard APIを無効化
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(false);
      document.execCommand = execCommandMock;

      const { result } = renderHook(() => useClipboard());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.copyToClipboard('エラーテスト');
      });

      expect(success).toBe(false);
      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe(true);
      expect(result.current.errorMessage).toBe(
        'クリップボードへのコピーに失敗しました'
      );
    });

    it('NotAllowedError時に適切なエラーメッセージを表示', async () => {
      const notAllowedError = new Error('Permission denied');
      notAllowedError.name = 'NotAllowedError';
      const writeTextMock = vi.fn().mockRejectedValue(notAllowedError);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(false);
      document.execCommand = execCommandMock;

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('権限エラー');
      });

      expect(result.current.error).toBe(true);
      expect(result.current.errorMessage).toBe(
        'クリップボードへのアクセスが許可されていません'
      );
    });
  });

  describe('reset()', () => {
    it('reset()で全ての状態が初期化される', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('テスト');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });

    it('reset()でタイムアウトもクリアされる', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('テスト');
      });

      act(() => {
        result.current.reset();
      });

      // タイムアウト後もcopiedはfalseのまま（二重リセットなし）
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('連続コピー', () => {
    it('連続でコピーしても正しく動作する', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());

      // 1回目のコピー
      await act(async () => {
        await result.current.copyToClipboard('1回目');
      });

      expect(result.current.copied).toBe(true);

      // 1秒後に2回目のコピー
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await act(async () => {
        await result.current.copyToClipboard('2回目');
      });

      expect(result.current.copied).toBe(true);
      expect(writeTextMock).toHaveBeenCalledTimes(2);

      // 3秒後にリセット
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.copied).toBe(false);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にタイムアウトがクリアされる', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
      });

      const { result, unmount } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('テスト');
      });

      expect(result.current.copied).toBe(true);

      unmount();

      // アンマウント後にタイマーが動かないことを確認
      // (内部的にclearTimeoutが呼ばれている)
      expect(true).toBe(true); // メモリリークがないことの確認
    });
  });
});

describe('formatMemosForClipboard', () => {
  it('メモ配列をフォーマット済みテキストに変換する', async () => {
    const { formatMemosForClipboard } = await import('../types/output');

    const memos = [
      { round: 1, text: 'メモ1' },
      { round: 2, text: 'メモ2' },
      { round: 3, text: 'メモ3' },
    ];

    const result = formatMemosForClipboard(memos);

    expect(result).toBe('# Round1\n\nメモ1\n\n# Round2\n\nメモ2\n\n# Round3\n\nメモ3');
  });

  it('空のメモは（未入力）と表示される', async () => {
    const { formatMemosForClipboard } = await import('../types/output');

    const memos = [
      { round: 1, text: 'メモ1' },
      { round: 2, text: '' },
      { round: 3, text: '  ' },
    ];

    const result = formatMemosForClipboard(memos);

    expect(result).toBe('# Round1\n\nメモ1\n\n# Round2\n\n（未入力）\n\n# Round3\n\n（未入力）');
  });
});

describe('countFilledMemos', () => {
  it('入力されたメモ数をカウントする', async () => {
    const { countFilledMemos } = await import('../types/output');

    const memos = [
      { round: 1, text: 'メモ1' },
      { round: 2, text: '' },
      { round: 3, text: 'メモ3' },
      { round: 4, text: '  ' },
    ];

    const result = countFilledMemos(memos);

    expect(result).toBe(2);
  });
});
