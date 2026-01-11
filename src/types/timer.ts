/**
 * タイマーの状態を表す型
 * - idle: 初期状態（未開始）
 * - running: カウントダウン中
 * - paused: 一時停止中
 * - completed: 0秒到達
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * タイマーの内部状態
 */
export interface TimerState {
  seconds: number;
  status: TimerStatus;
}

/**
 * useTimer フックのオプション
 */
export interface UseTimerOptions {
  /** 初期秒数（デフォルト: 20） */
  initialSeconds?: number;
  /** タイマー終了時のコールバック */
  onComplete?: () => void;
}

/**
 * useTimer フックの戻り値
 */
export interface UseTimerReturn {
  /** 現在の残り秒数 */
  seconds: number;
  /** タイマー状態 */
  status: TimerStatus;
  /** タイマーが動作中かどうか */
  isRunning: boolean;
  /** 警告状態（残り5秒以下）かどうか */
  isWarning: boolean;
  /** タイマー開始 */
  start: () => void;
  /** 一時停止 */
  pause: () => void;
  /** 再開 */
  resume: () => void;
  /** リセット */
  reset: () => void;
}

/**
 * Timer コンポーネントの Props
 */
export interface TimerProps {
  /** 初期秒数（デフォルト: 20） */
  initialSeconds?: number;
  /** タイマー終了時のコールバック */
  onComplete?: () => void;
  /** カスタムスタイル用クラス名 */
  className?: string;
}
