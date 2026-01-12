/**
 * 中断セッション管理ユーティリティ
 * 中断されたセッションをlocalStorageに保存・読み込み・削除する
 */

import {
  STORAGE_KEYS,
  createStorageSuccess,
  type SessionState,
  type InterruptedSession,
  type StorageResult,
} from '../types/storage';
import { getItem, setItem, removeItem } from './storageUtils';

/**
 * 中断セッションを保存する
 * @param state 現在のセッション状態
 * @returns 保存結果
 */
export function saveInterruptedSession(
  state: SessionState
): StorageResult<void> {
  const data: InterruptedSession = {
    state,
    savedAt: new Date().toISOString(),
  };
  return setItem(STORAGE_KEYS.INTERRUPTED_SESSION, data);
}

/**
 * 中断セッションを読み込む
 * @returns 中断セッション（存在しない場合はnull）
 */
export function loadInterruptedSession(): StorageResult<InterruptedSession | null> {
  const result = getItem<InterruptedSession>(STORAGE_KEYS.INTERRUPTED_SESSION);

  if (!result.success) {
    // パースエラーの場合、破損データを削除してnullを返す
    if (result.error.type === 'PARSE_ERROR') {
      removeItem(STORAGE_KEYS.INTERRUPTED_SESSION);
      return createStorageSuccess(null);
    }
    return result;
  }

  // バリデーション: 必要なフィールドが存在するか確認
  if (result.data !== null && !isValidInterruptedSession(result.data)) {
    removeItem(STORAGE_KEYS.INTERRUPTED_SESSION);
    return createStorageSuccess(null);
  }

  return createStorageSuccess(result.data);
}

/**
 * 中断セッションを削除する
 */
export function clearInterruptedSession(): void {
  removeItem(STORAGE_KEYS.INTERRUPTED_SESSION);
}

/**
 * 中断セッションデータのバリデーション
 */
function isValidInterruptedSession(data: unknown): data is InterruptedSession {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const session = data as Record<string, unknown>;

  // 必須フィールドの存在確認
  if (!session.state || typeof session.state !== 'object') {
    return false;
  }

  const state = session.state as Record<string, unknown>;

  // state の必須フィールド確認
  if (
    typeof state.currentRound !== 'number' ||
    typeof state.totalRounds !== 'number' ||
    typeof state.phase !== 'string' ||
    !Array.isArray(state.memos)
  ) {
    return false;
  }

  return true;
}
