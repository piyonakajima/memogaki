/**
 * セッション管理（session-flow）の型定義
 */

// ReviewModeResultはreview.tsで定義されているものをインポート・再エクスポート
import type { ReviewModeResult } from './review';
export type { ReviewModeResult };

/**
 * セッションのフェーズ
 * - setup: 繰り返し回数設定
 * - writing: 書き出し中
 * - review: 読み返し・追記中
 * - completed: セッション完了
 * - resuming: 中断セッション再開確認
 */
export type SessionPhase =
  | 'setup'
  | 'writing'
  | 'review'
  | 'completed'
  | 'resuming';

/**
 * 1ラウンドのメモデータ
 */
export interface Memo {
  /** ラウンド番号（1始まり） */
  round: number;
  /** 書き出しモードで入力されたテキスト */
  originalText: string;
  /** 読み返しモードで追記されたテキスト */
  addition: string;
  /** 統合されたテキスト */
  mergedText: string;
  /** 作成日時（ISO8601形式） */
  createdAt: string;
}

/**
 * セッション状態
 */
export interface SessionState {
  /** 現在のフェーズ */
  phase: SessionPhase;
  /** 現在のラウンド番号（1始まり） */
  currentRound: number;
  /** 総ラウンド数 */
  totalRounds: number;
  /** 全ラウンドのメモ */
  memos: Memo[];
  /** 現在のラウンドの一時テキスト（書き出し→読み返し間で保持） */
  currentText: string;
}

/**
 * セッションアクション
 */
export type SessionAction =
  | { type: 'SET_TOTAL_ROUNDS'; payload: number }
  | { type: 'START_SESSION' }
  | { type: 'COMPLETE_WRITING'; payload: string }
  | { type: 'COMPLETE_REVIEW'; payload: ReviewModeResult }
  | { type: 'RESET_SESSION' }
  | { type: 'RESTORE_SESSION'; payload: SessionState }
  | { type: 'SET_PHASE'; payload: SessionPhase };

/**
 * localStorage保存用の中断セッションデータ
 */
export interface InterruptedSession {
  /** セッション状態 */
  state: SessionState;
  /** 保存日時（ISO8601形式） */
  savedAt: string;
}

/**
 * useSessionフックのオプション
 */
export interface UseSessionOptions {
  /** デフォルトの繰り返し回数 */
  defaultTotalRounds?: number;
  /** 自動保存を有効にするか */
  enableAutoSave?: boolean;
}

/**
 * useSessionフックの戻り値
 */
export interface UseSessionReturn {
  /** 現在のセッション状態 */
  state: SessionState;
  /** セッション開始 */
  startSession: () => void;
  /** 繰り返し回数を更新 */
  setTotalRounds: (count: number) => void;
  /** 書き出し完了（メモ保存） */
  completeWriting: (text: string) => void;
  /** 読み返し完了（次のラウンドへ） */
  completeReview: (data: ReviewModeResult) => void;
  /** セッションをリセット */
  resetSession: () => void;
  /** 中断セッションを再開 */
  resumeSession: () => void;
  /** 中断セッションを破棄 */
  discardInterruptedSession: () => void;
  /** 最終ラウンドかどうか */
  isLastRound: boolean;
  /** 中断セッションがあるかどうか */
  hasInterruptedSession: boolean;
}

/**
 * SetupScreenコンポーネントのProps
 */
export interface SetupScreenProps {
  /** 現在の繰り返し回数 */
  totalRounds: number;
  /** 回数変更時コールバック */
  onTotalRoundsChange: (count: number) => void;
  /** 開始ボタンクリック時コールバック */
  onStart: () => void;
  /** カスタムスタイル用クラス名 */
  className?: string;
}

/**
 * ResumeDialogコンポーネントのProps
 */
export interface ResumeDialogProps {
  /** 中断時のラウンド番号 */
  interruptedRound: number;
  /** 中断時の総ラウンド数 */
  totalRounds: number;
  /** 再開選択時コールバック */
  onResume: () => void;
  /** 新規開始選択時コールバック */
  onNewSession: () => void;
}

/**
 * SessionManagerコンポーネントのProps
 */
export interface SessionManagerProps {
  /** デフォルトの繰り返し回数 */
  defaultTotalRounds?: number;
  /** タイマー初期秒数 */
  timerSeconds?: number;
  /** セッション完了時コールバック */
  onSessionComplete: (memos: Memo[]) => void;
  /** カスタムスタイル用クラス名 */
  className?: string;
}

// ============================================
// 定数
// ============================================

/** デフォルトの繰り返し回数 */
export const DEFAULT_TOTAL_ROUNDS = 10;

/** 最小繰り返し回数 */
export const MIN_ROUNDS = 1;

/** 最大繰り返し回数 */
export const MAX_ROUNDS = 99;

/** localStorage保存キー */
export const STORAGE_KEY = 'memogaki_interrupted_session';

// ============================================
// 初期状態
// ============================================

/**
 * セッションの初期状態を生成
 */
export function createInitialSessionState(
  totalRounds: number = DEFAULT_TOTAL_ROUNDS
): SessionState {
  return {
    phase: 'setup',
    currentRound: 1,
    totalRounds,
    memos: [],
    currentText: '',
  };
}

/** デフォルトの初期状態 */
export const initialSessionState: SessionState = createInitialSessionState();

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 繰り返し回数を有効な範囲にクランプ
 */
export function clampRounds(count: number): number {
  return Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, Math.floor(count)));
}

/**
 * テキストを統合する
 */
export function mergeTexts(original: string, addition: string): string {
  const trimmedAddition = addition.trim();
  if (!trimmedAddition) {
    return original;
  }
  return `${original}\n\n---\n\n${trimmedAddition}`;
}
