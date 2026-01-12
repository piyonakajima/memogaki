import { useReducer, useCallback, useEffect, useState, useMemo } from 'react';
import type {
  SessionState,
  SessionAction,
  UseSessionOptions,
  UseSessionReturn,
  ReviewModeResult,
  InterruptedSession,
  Memo,
} from '../types/session';
import {
  DEFAULT_TOTAL_ROUNDS,
  clampRounds,
  createInitialSessionState,
} from '../types/session';
import type { StorageError, UserSettings } from '../types/storage';
import {
  saveInterruptedSession as saveInterruptedSessionUtil,
  loadInterruptedSession as loadInterruptedSessionUtil,
  clearInterruptedSession as clearInterruptedSessionUtil,
} from '../utils/interruptedSessionUtils';
import {
  saveSessionHistory,
} from '../utils/sessionHistoryUtils';
import {
  saveUserSettings,
  loadUserSettings,
} from '../utils/userSettingsUtils';

/**
 * セッション状態のリデューサー
 */
function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case 'SET_TOTAL_ROUNDS': {
      // セッション進行中は変更不可
      if (state.phase !== 'setup') {
        return state;
      }
      return {
        ...state,
        totalRounds: clampRounds(action.payload),
      };
    }

    case 'START_SESSION': {
      return {
        ...state,
        phase: 'writing',
        currentRound: 1,
        memos: [],
        currentText: '',
      };
    }

    case 'COMPLETE_WRITING': {
      return {
        ...state,
        phase: 'review',
        currentText: action.payload,
      };
    }

    case 'COMPLETE_REVIEW': {
      const { originalText, addition, mergedText } = action.payload;
      const newMemo: Memo = {
        round: state.currentRound,
        originalText,
        addition,
        mergedText,
        createdAt: new Date().toISOString(),
      };

      const isLastRound = state.currentRound >= state.totalRounds;

      if (isLastRound) {
        return {
          ...state,
          phase: 'completed',
          memos: [...state.memos, newMemo],
          currentText: '',
        };
      }

      return {
        ...state,
        phase: 'writing',
        currentRound: state.currentRound + 1,
        memos: [...state.memos, newMemo],
        currentText: '',
      };
    }

    case 'RESET_SESSION': {
      return {
        ...createInitialSessionState(state.totalRounds),
        totalRounds: state.totalRounds,
      };
    }

    case 'RESTORE_SESSION': {
      return action.payload;
    }

    case 'SET_PHASE': {
      return {
        ...state,
        phase: action.payload,
      };
    }

    default:
      return state;
  }
}

/**
 * localStorageから中断セッションを読み込む
 * 新しいストレージユーティリティを使用
 */
function loadInterruptedSession(): InterruptedSession | null {
  const result = loadInterruptedSessionUtil();
  return result.success ? result.data : null;
}

/**
 * localStorageにセッション状態を保存する
 * 新しいストレージユーティリティを使用
 */
function saveSessionToStorage(state: SessionState): void {
  saveInterruptedSessionUtil(state);
}

/**
 * localStorageからセッション状態を削除する
 * 新しいストレージユーティリティを使用
 */
function clearSessionFromStorage(): void {
  clearInterruptedSessionUtil();
}

/**
 * ユーザー設定を読み込む
 */
function loadSettings(): UserSettings | null {
  const result = loadUserSettings();
  return result.success ? result.data : null;
}

/**
 * 拡張されたuseSessionオプション
 */
export interface UseSessionOptionsExtended extends UseSessionOptions {
  /** 設定の自動読み込みを有効にするか */
  enableSettingsPersistence?: boolean;
  /** セッション履歴の自動保存を有効にするか */
  enableHistorySave?: boolean;
}

/**
 * 拡張されたuseSession戻り値
 */
export interface UseSessionReturnExtended extends UseSessionReturn {
  /** ユーザー設定が読み込まれたか */
  settingsLoaded: boolean;
  /** ストレージエラー */
  storageError: StorageError | null;
}

/**
 * セッション状態管理フック
 */
export function useSession(options: UseSessionOptionsExtended = {}): UseSessionReturnExtended {
  const {
    defaultTotalRounds = DEFAULT_TOTAL_ROUNDS,
    enableAutoSave = true,
    enableSettingsPersistence = true,
    enableHistorySave = true,
  } = options;

  // 初期状態の計算（設定から読み込み）
  const initialState = useMemo(() => {
    if (enableSettingsPersistence) {
      const savedSettings = loadSettings();
      if (savedSettings) {
        return createInitialSessionState(savedSettings.totalRounds);
      }
    }
    return createInitialSessionState(defaultTotalRounds);
  }, [defaultTotalRounds, enableSettingsPersistence]);

  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // 設定読み込み完了フラグ
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<StorageError | null>(null);

  // 中断セッションの検出（初回のみ読み込み、その後は状態で管理）
  const [interruptedSession, setInterruptedSession] =
    useState<InterruptedSession | null>(() => loadInterruptedSession());
  const hasInterruptedSession = interruptedSession !== null;

  // 最終ラウンド判定
  const isLastRound = state.currentRound >= state.totalRounds;

  // 設定読み込み完了を通知
  useEffect(() => {
    setSettingsLoaded(true);
  }, []);

  // 自動保存（セッション進行中のみ）
  useEffect(() => {
    if (
      enableAutoSave &&
      (state.phase === 'writing' || state.phase === 'review')
    ) {
      saveSessionToStorage(state);
    }
  }, [state, enableAutoSave]);

  // セッション完了時にストレージをクリアし、履歴を保存
  useEffect(() => {
    if (state.phase === 'completed') {
      clearSessionFromStorage();

      // セッション履歴を保存
      if (enableHistorySave && state.memos.length > 0) {
        const result = saveSessionHistory(state.memos, state.totalRounds);
        if (!result.success) {
          setStorageError(result.error);
          console.warn('セッション履歴の保存に失敗しました:', result.error);
        }
      }
    }
  }, [state.phase, state.memos, state.totalRounds, enableHistorySave]);

  const setTotalRounds = useCallback((count: number) => {
    dispatch({ type: 'SET_TOTAL_ROUNDS', payload: count });

    // 設定を永続化
    if (enableSettingsPersistence) {
      const result = saveUserSettings({ totalRounds: clampRounds(count) });
      if (!result.success) {
        setStorageError(result.error);
      }
    }
  }, [enableSettingsPersistence]);

  const startSession = useCallback(() => {
    dispatch({ type: 'START_SESSION' });
  }, []);

  const completeWriting = useCallback((text: string) => {
    dispatch({ type: 'COMPLETE_WRITING', payload: text });
  }, []);

  const completeReview = useCallback((data: ReviewModeResult) => {
    dispatch({ type: 'COMPLETE_REVIEW', payload: data });
  }, []);

  const resetSession = useCallback(() => {
    clearSessionFromStorage();
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const resumeSession = useCallback(() => {
    if (interruptedSession) {
      let restoredState = interruptedSession.state;

      // 書き出し中に中断された場合は、そのまま書き出しフェーズから再開
      // currentTextはクリアして最初からやり直し
      if (restoredState.phase === 'writing') {
        restoredState = {
          ...restoredState,
          currentText: '',
        };
      }

      dispatch({ type: 'RESTORE_SESSION', payload: restoredState });
      clearSessionFromStorage();
      setInterruptedSession(null);
    }
  }, [interruptedSession]);

  const discardInterruptedSession = useCallback(() => {
    clearSessionFromStorage();
    setInterruptedSession(null);
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  return {
    state,
    startSession,
    setTotalRounds,
    completeWriting,
    completeReview,
    resetSession,
    resumeSession,
    discardInterruptedSession,
    isLastRound,
    hasInterruptedSession,
    settingsLoaded,
    storageError,
  };
}
