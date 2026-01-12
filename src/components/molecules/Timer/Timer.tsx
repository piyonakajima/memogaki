import { useTimer } from '../../../hooks/useTimer';
import type { TimerProps } from '../../../types/timer';
import './Timer.css';

export function Timer({
  initialSeconds = 20,
  onComplete,
  className,
}: TimerProps) {
  const { seconds, status, isWarning, start, pause, resume, reset } = useTimer({
    initialSeconds,
    onComplete,
  });

  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div
      className={`timer ${className ?? ''}`}
      data-testid="timer-container"
    >
      <div
        className={`timer-display ${isWarning ? 'warning' : ''}`}
        data-testid="timer-display"
      >
        {seconds}
      </div>

      <div className="timer-buttons">
        {isIdle && (
          <button
            type="button"
            className="timer-button timer-button--start"
            onClick={start}
          >
            開始
          </button>
        )}

        {isRunning && (
          <button
            type="button"
            className="timer-button timer-button--pause"
            onClick={pause}
          >
            停止
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            className="timer-button timer-button--resume"
            onClick={resume}
          >
            再開
          </button>
        )}

        <button
          type="button"
          className="timer-button timer-button--reset"
          onClick={reset}
          disabled={isIdle}
        >
          リセット
        </button>
      </div>
    </div>
  );
}
