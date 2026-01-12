/**
 * ローカルストレージ保存機能の型定義
 */

import type { Memo, SessionState, InterruptedSession } from './session';

// 型の再エクスポート
export type { Memo, SessionState, InterruptedSession };

// ============================================
// ストレージキー定数
// ============================================

/**
 * localStorageで使用するキー
 */
export const STORAGE_KEYS = {
  /** 中断セッションデータ */
  INTERRUPTED_SESSION: 'memogaki_interrupted_session',
  /** セッション履歴 */
  SESSION_HISTORY: 'memogaki_session_history',
  /** ユーザー設定 */
  USER_SETTINGS: 'memogaki_user_settings',
} as const;

/**
 * ストレージキーの型
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ============================================
// ストレージ容量定数
// ============================================

/**
 * ストレージ容量制限
 */
export const STORAGE_LIMITS = {
  /** セッション履歴の最大保存件数 */
  MAX_HISTORY_COUNT: 10,
} as const;

// ============================================
// データモデル
// ============================================

/**
 * セッション履歴エントリ
 * 完了したセッションの記録
 */
export interface SessionHistoryEntry {
  /** 一意識別子（UUID v4形式） */
  id: string;
  /** 完了日時（ISO8601形式） */
  completedAt: string;
  /** 総ラウンド数 */
  totalRounds: number;
  /** 全メモデータ */
  memos: Memo[];
}

/**
 * ユーザー設定
 * アプリの永続化される設定
 */
export interface UserSettings {
  /** 繰り返し回数 */
  totalRounds: number;
}

// ============================================
// ストレージ操作結果
// ============================================

/**
 * ストレージエラー種別
 */
export type StorageErrorType =
  | 'QUOTA_EXCEEDED'
  | 'PARSE_ERROR'
  | 'STORAGE_UNAVAILABLE';

/**
 * ストレージエラー
 */
export interface StorageError {
  /** エラー種別 */
  type: StorageErrorType;
  /** エラーメッセージ */
  message: string;
}

/**
 * ストレージ操作の成功結果
 */
export interface StorageSuccess<T> {
  success: true;
  data: T;
}

/**
 * ストレージ操作の失敗結果
 */
export interface StorageFailure {
  success: false;
  error: StorageError;
}

/**
 * ストレージ操作の結果
 * 成功時はdataを、失敗時はerrorを含む
 */
export type StorageResult<T> = StorageSuccess<T> | StorageFailure;

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 成功結果を作成
 */
export function createStorageSuccess<T>(data: T): StorageSuccess<T> {
  return { success: true, data };
}

/**
 * 失敗結果を作成
 */
export function createStorageFailure(
  type: StorageErrorType,
  message: string
): StorageFailure {
  return { success: false, error: { type, message } };
}

/**
 * 一意のIDを生成（UUID v4形式）
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * デフォルトのユーザー設定
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  totalRounds: 10,
};
