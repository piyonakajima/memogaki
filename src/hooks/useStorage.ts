/**
 * ストレージ管理カスタムフック
 * ストレージユーティリティをReactフックとしてラップし、状態管理を提供する
 */

import { useState, useCallback, useMemo } from 'react';
import {
  type SessionHistoryEntry,
  type UserSettings,
  type InterruptedSession,
  type SessionState,
  type Memo,
  type StorageError,
} from '../types/storage';
import { isStorageAvailable } from '../utils/storageUtils';
import {
  saveSessionHistory,
  loadSessionHistory,
} from '../utils/sessionHistoryUtils';
import { saveUserSettings, loadUserSettings } from '../utils/userSettingsUtils';
import {
  saveInterruptedSession,
  loadInterruptedSession,
  clearInterruptedSession,
} from '../utils/interruptedSessionUtils';

/**
 * useStorageフックのオプション
 */
export interface UseStorageOptions {
  /** ストレージ利用不可時のフォールバック動作を有効化 */
  enableFallback?: boolean;
}

/**
 * useStorageフックの戻り値
 */
export interface UseStorageReturn {
  /** ストレージが利用可能か */
  isAvailable: boolean;
  /** セッション履歴 */
  history: SessionHistoryEntry[];
  /** ユーザー設定 */
  settings: UserSettings | null;
  /** 中断セッション */
  interruptedSession: InterruptedSession | null;
  /** 履歴を保存 */
  saveHistory: (memos: Memo[], totalRounds: number) => boolean;
  /** 設定を保存 */
  saveSettings: (settings: UserSettings) => boolean;
  /** 中断セッションを保存 */
  saveInterrupted: (state: SessionState) => boolean;
  /** 中断セッションを削除 */
  clearInterrupted: () => void;
  /** 最後のエラー */
  lastError: StorageError | null;
}

/**
 * 初期状態を読み込む
 */
function loadInitialState() {
  const historyResult = loadSessionHistory();
  const settingsResult = loadUserSettings();
  const interruptedResult = loadInterruptedSession();

  return {
    history: historyResult.success ? historyResult.data ?? [] : [],
    settings: settingsResult.success ? settingsResult.data : null,
    interruptedSession: interruptedResult.success
      ? interruptedResult.data
      : null,
  };
}

/**
 * ストレージ管理カスタムフック
 */
export function useStorage(_options?: UseStorageOptions): UseStorageReturn {
  // ストレージの利用可否
  const storageAvailable = useMemo(() => isStorageAvailable(), []);

  // 初期状態を読み込み
  const [state, setState] = useState(() => loadInitialState());
  const [lastError, setLastError] = useState<StorageError | null>(null);

  // 履歴を保存
  const saveHistoryCallback = useCallback(
    (memos: Memo[], totalRounds: number): boolean => {
      if (!storageAvailable) return false;

      const result = saveSessionHistory(memos, totalRounds);
      if (!result.success) {
        setLastError(result.error);
        return false;
      }

      // 状態を再読み込み
      const historyResult = loadSessionHistory();
      if (historyResult.success) {
        setState((prev) => ({
          ...prev,
          history: historyResult.data ?? [],
        }));
      }

      setLastError(null);
      return true;
    },
    [storageAvailable]
  );

  // 設定を保存
  const saveSettingsCallback = useCallback(
    (settings: UserSettings): boolean => {
      if (!storageAvailable) return false;

      const result = saveUserSettings(settings);
      if (!result.success) {
        setLastError(result.error);
        return false;
      }

      setState((prev) => ({
        ...prev,
        settings,
      }));

      setLastError(null);
      return true;
    },
    [storageAvailable]
  );

  // 中断セッションを保存
  const saveInterruptedCallback = useCallback(
    (sessionState: SessionState): boolean => {
      if (!storageAvailable) return false;

      const result = saveInterruptedSession(sessionState);
      if (!result.success) {
        setLastError(result.error);
        return false;
      }

      // 状態を再読み込み
      const interruptedResult = loadInterruptedSession();
      if (interruptedResult.success) {
        setState((prev) => ({
          ...prev,
          interruptedSession: interruptedResult.data,
        }));
      }

      setLastError(null);
      return true;
    },
    [storageAvailable]
  );

  // 中断セッションを削除
  const clearInterruptedCallback = useCallback(() => {
    clearInterruptedSession();
    setState((prev) => ({
      ...prev,
      interruptedSession: null,
    }));
  }, []);

  return {
    isAvailable: storageAvailable,
    history: state.history,
    settings: state.settings,
    interruptedSession: state.interruptedSession,
    saveHistory: saveHistoryCallback,
    saveSettings: saveSettingsCallback,
    saveInterrupted: saveInterruptedCallback,
    clearInterrupted: clearInterruptedCallback,
    lastError,
  };
}
