/**
 * セッション履歴管理ユーティリティ
 * 完了したセッションの履歴をlocalStorageに保存・読み込み・削除する
 */

import {
  STORAGE_KEYS,
  STORAGE_LIMITS,
  generateId,
  createStorageSuccess,
  type Memo,
  type SessionHistoryEntry,
  type StorageResult,
} from '../types/storage';
import { getItem, setItem, removeItem } from './storageUtils';

/**
 * セッション履歴を保存する
 * @param memos セッション中のメモ配列
 * @param totalRounds 総ラウンド数
 * @returns 保存結果
 */
export function saveSessionHistory(
  memos: Memo[],
  totalRounds: number
): StorageResult<void> {
  // 既存の履歴を読み込む
  const existingResult = loadSessionHistory();
  const existingHistory = existingResult.success ? existingResult.data ?? [] : [];

  // 新しい履歴エントリを作成
  const newEntry: SessionHistoryEntry = {
    id: generateId(),
    completedAt: new Date().toISOString(),
    totalRounds,
    memos,
  };

  // 既存履歴に追加
  let updatedHistory = [...existingHistory, newEntry];

  // 最大件数を超えた場合、古いものから削除
  if (updatedHistory.length > STORAGE_LIMITS.MAX_HISTORY_COUNT) {
    updatedHistory = updatedHistory.slice(
      updatedHistory.length - STORAGE_LIMITS.MAX_HISTORY_COUNT
    );
  }

  // 保存
  const saveResult = setItem(STORAGE_KEYS.SESSION_HISTORY, updatedHistory);

  if (!saveResult.success) {
    // 容量超過の場合、古い履歴を削除して再試行
    if (saveResult.error.type === 'QUOTA_EXCEEDED') {
      return retryWithReducedHistory(updatedHistory);
    }
    return saveResult;
  }

  return createStorageSuccess(undefined);
}

/**
 * 履歴を減らしながら保存を再試行する
 */
function retryWithReducedHistory(
  history: SessionHistoryEntry[]
): StorageResult<void> {
  let currentHistory = [...history];

  // 最低1件は残しながら再試行
  while (currentHistory.length > 1) {
    // 最も古いものを削除
    currentHistory = currentHistory.slice(1);

    const result = setItem(STORAGE_KEYS.SESSION_HISTORY, currentHistory);
    if (result.success) {
      return createStorageSuccess(undefined);
    }
  }

  // 1件でも失敗した場合はエラーを返す
  return setItem(STORAGE_KEYS.SESSION_HISTORY, currentHistory);
}

/**
 * セッション履歴を読み込む
 * @returns 履歴の配列（存在しない場合は空配列）
 */
export function loadSessionHistory(): StorageResult<SessionHistoryEntry[]> {
  const result = getItem<SessionHistoryEntry[]>(STORAGE_KEYS.SESSION_HISTORY);

  if (!result.success) {
    // パースエラーの場合、破損データを削除して空配列を返す
    if (result.error.type === 'PARSE_ERROR') {
      removeItem(STORAGE_KEYS.SESSION_HISTORY);
      return createStorageSuccess([]);
    }
    return result;
  }

  // nullの場合は空配列を返す
  if (result.data === null) {
    return createStorageSuccess([]);
  }

  // 配列でない場合は破損データとして扱う
  if (!Array.isArray(result.data)) {
    removeItem(STORAGE_KEYS.SESSION_HISTORY);
    return createStorageSuccess([]);
  }

  return createStorageSuccess(result.data);
}

/**
 * 全てのセッション履歴を削除する
 */
export function clearSessionHistory(): void {
  removeItem(STORAGE_KEYS.SESSION_HISTORY);
}
