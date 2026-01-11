import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerStatus, UseTimerOptions, UseTimerReturn } from '../types/timer';

const DEFAULT_SECONDS = 20;

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { initialSeconds, onComplete } = options;

  // 不正な初期値の防御
  const safeInitialSeconds =
    initialSeconds && initialSeconds > 0 ? initialSeconds : DEFAULT_SECONDS;

  const [seconds, setSeconds] = useState(safeInitialSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');

  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // onComplete を最新の参照で保持
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // インターバルをクリアするヘルパー
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const start = useCallback(() => {
    // 既に動作中の場合は無視
    if (status === 'running') {
      return;
    }

    setStatus('running');

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus('completed');
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [status, clearTimer]);

  const pause = useCallback(() => {
    if (status === 'running') {
      clearTimer();
      setStatus('paused');
    }
  }, [status, clearTimer]);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');

      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setStatus('completed');
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [status, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setSeconds(safeInitialSeconds);
    setStatus('idle');
  }, [clearTimer, safeInitialSeconds]);

  const isRunning = status === 'running';
  const isWarning = seconds <= 5 && status === 'running';

  return {
    seconds,
    status,
    isRunning,
    isWarning,
    start,
    pause,
    resume,
    reset,
  };
}
