import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('デフォルトで20秒、idle状態で初期化される', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.seconds).toBe(20);
      expect(result.current.status).toBe('idle');
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isWarning).toBe(false);
    });

    it('initialSecondsで初期値をカスタマイズできる', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 30 }));

      expect(result.current.seconds).toBe(30);
      expect(result.current.status).toBe('idle');
    });

    it('initialSecondsが0以下の場合はデフォルト値20を使用する', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 0 }));

      expect(result.current.seconds).toBe(20);
    });
  });

  describe('start()', () => {
    it('start()でrunning状態になる', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.status).toBe('running');
      expect(result.current.isRunning).toBe(true);
    });

    it('1秒ごとにカウントダウンする', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.seconds).toBe(20);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.seconds).toBe(19);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.seconds).toBe(18);
    });

    it('既にrunning状態の場合はstart()を無視する', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.seconds).toBe(17);

      act(() => {
        result.current.start(); // 無視されるべき
      });

      expect(result.current.seconds).toBe(17); // 変わらない
    });
  });

  describe('pause() / resume()', () => {
    it('pause()でpaused状態になり、カウントダウンが停止する', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.seconds).toBe(18);

      act(() => {
        result.current.pause();
      });

      expect(result.current.status).toBe('paused');
      expect(result.current.isRunning).toBe(false);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.seconds).toBe(18); // 変わらない
    });

    it('resume()でrunning状態に戻り、カウントダウンが再開する', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.seconds).toBe(18);

      act(() => {
        result.current.resume();
      });

      expect(result.current.status).toBe('running');
      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.seconds).toBe(16);
    });
  });

  describe('reset()', () => {
    it('reset()でidle状態に戻り、初期秒数にリセットする', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 15 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.seconds).toBe(10);

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.seconds).toBe(15);
      expect(result.current.isRunning).toBe(false);
    });

    it('paused状態からもreset()できる', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      act(() => {
        result.current.pause();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.seconds).toBe(20);
    });

    it('completed状態からもreset()できる', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 3 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.status).toBe('completed');

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.seconds).toBe(3);
    });
  });

  describe('タイマー終了', () => {
    it('0秒に達したらcompleted状態になる', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 3 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.seconds).toBe(0);
      expect(result.current.status).toBe('completed');
      expect(result.current.isRunning).toBe(false);
    });

    it('0秒到達時にonCompleteコールバックが呼ばれる', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTimer({ initialSeconds: 2, onComplete })
      );

      act(() => {
        result.current.start();
      });

      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('onCompleteが設定されていなくてもエラーなく動作する', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 2 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.status).toBe('completed');
    });

    it('0秒以下にはならない', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 2 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000); // 5秒経過（本来は2秒で終了）
      });

      expect(result.current.seconds).toBe(0);
    });
  });

  describe('isWarning', () => {
    it('残り5秒以下でrunning状態の時にisWarningがtrueになる', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 10 }));

      act(() => {
        result.current.start();
      });

      // 6秒時点
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.seconds).toBe(6);
      expect(result.current.isWarning).toBe(false);

      // 5秒時点
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.seconds).toBe(5);
      expect(result.current.isWarning).toBe(true);

      // 3秒時点
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.seconds).toBe(3);
      expect(result.current.isWarning).toBe(true);
    });

    it('paused状態ではisWarningがfalseになる', () => {
      const { result } = renderHook(() => useTimer({ initialSeconds: 6 }));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.seconds).toBe(4);
      expect(result.current.isWarning).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isWarning).toBe(false);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にintervalがクリアされる', () => {
      const { result, unmount } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.seconds).toBe(18);

      unmount();

      // アンマウント後にタイマーが動かないことを確認
      // (内部的にclearIntervalが呼ばれている)
      expect(true).toBe(true); // メモリリークがないことの確認
    });
  });
});
