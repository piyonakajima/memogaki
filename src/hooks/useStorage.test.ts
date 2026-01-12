import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import { STORAGE_KEYS, type SessionState, type Memo } from '../types/storage';

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createMemo = (round: number, text: string): Memo => ({
    round,
    originalText: text,
    addition: '',
    mergedText: text,
    createdAt: new Date().toISOString(),
  });

  const createSessionState = (currentRound = 3): SessionState => ({
    phase: 'writing',
    currentRound,
    totalRounds: 10,
    memos: [],
    currentText: 'テスト中のテキスト',
  });

  describe('初期化', () => {
    it('ストレージが利用可能であることを検出する', () => {
      const { result } = renderHook(() => useStorage());

      expect(result.current.isAvailable).toBe(true);
    });

    it('初期状態ではエラーがない', () => {
      const { result } = renderHook(() => useStorage());

      expect(result.current.lastError).toBeNull();
    });

    it('保存済み履歴を読み込む', () => {
      const memos = [createMemo(1, 'テスト')];
      localStorage.setItem(
        STORAGE_KEYS.SESSION_HISTORY,
        JSON.stringify([
          {
            id: 'test-id',
            completedAt: '2026-01-12T00:00:00Z',
            totalRounds: 10,
            memos,
          },
        ])
      );

      const { result } = renderHook(() => useStorage());

      expect(result.current.history).toHaveLength(1);
    });

    it('保存済み設定を読み込む', () => {
      localStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify({ totalRounds: 15 })
      );

      const { result } = renderHook(() => useStorage());

      expect(result.current.settings?.totalRounds).toBe(15);
    });

    it('保存済み中断セッションを読み込む', () => {
      const state = createSessionState(5);
      localStorage.setItem(
        STORAGE_KEYS.INTERRUPTED_SESSION,
        JSON.stringify({ state, savedAt: '2026-01-12T00:00:00Z' })
      );

      const { result } = renderHook(() => useStorage());

      expect(result.current.interruptedSession?.state.currentRound).toBe(5);
    });
  });

  describe('saveHistory', () => {
    it('履歴を保存して状態を更新する', () => {
      const { result } = renderHook(() => useStorage());
      const memos = [createMemo(1, 'テスト')];

      act(() => {
        result.current.saveHistory(memos, 10);
      });

      expect(result.current.history).toHaveLength(1);
    });

    it('保存成功時にtrueを返す', () => {
      const { result } = renderHook(() => useStorage());
      const memos = [createMemo(1, 'テスト')];

      let success = false;
      act(() => {
        success = result.current.saveHistory(memos, 10);
      });

      expect(success).toBe(true);
    });
  });

  describe('saveSettings', () => {
    it('設定を保存して状態を更新する', () => {
      const { result } = renderHook(() => useStorage());

      act(() => {
        result.current.saveSettings({ totalRounds: 20 });
      });

      expect(result.current.settings?.totalRounds).toBe(20);
    });

    it('保存成功時にtrueを返す', () => {
      const { result } = renderHook(() => useStorage());

      let success = false;
      act(() => {
        success = result.current.saveSettings({ totalRounds: 15 });
      });

      expect(success).toBe(true);
    });
  });

  describe('saveInterrupted', () => {
    it('中断セッションを保存して状態を更新する', () => {
      const { result } = renderHook(() => useStorage());
      const state = createSessionState(7);

      act(() => {
        result.current.saveInterrupted(state);
      });

      expect(result.current.interruptedSession?.state.currentRound).toBe(7);
    });
  });

  describe('clearInterrupted', () => {
    it('中断セッションを削除して状態を更新する', () => {
      const { result } = renderHook(() => useStorage());
      const state = createSessionState(3);

      act(() => {
        result.current.saveInterrupted(state);
      });
      expect(result.current.interruptedSession).not.toBeNull();

      act(() => {
        result.current.clearInterrupted();
      });
      expect(result.current.interruptedSession).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('破損データ読み込み時にフォールバックする', () => {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, 'invalid json {{{');

      const { result } = renderHook(() => useStorage());

      expect(result.current.settings).toBeNull();
    });
  });
});
