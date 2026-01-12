import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveInterruptedSession,
  loadInterruptedSession,
  clearInterruptedSession,
} from './interruptedSessionUtils';
import { STORAGE_KEYS, type SessionState } from '../types/storage';

describe('interruptedSessionUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createSessionState = (
    phase: SessionState['phase'] = 'writing',
    currentRound = 3
  ): SessionState => ({
    phase,
    currentRound,
    totalRounds: 10,
    memos: [],
    currentText: 'テスト中のテキスト',
  });

  describe('saveInterruptedSession', () => {
    it('中断セッションを保存できる', () => {
      const state = createSessionState();

      const result = saveInterruptedSession(state);

      expect(result.success).toBe(true);
      const stored = localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION);
      expect(stored).not.toBeNull();
    });

    it('保存時にsavedAtが自動付与される', () => {
      const state = createSessionState();

      saveInterruptedSession(state);

      const result = loadInterruptedSession();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.savedAt).toBeDefined();
        expect(result.data.state).toEqual(state);
      }
    });
  });

  describe('loadInterruptedSession', () => {
    it('中断セッションがない場合はnullを返す', () => {
      const result = loadInterruptedSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('保存された中断セッションを読み込める', () => {
      const state = createSessionState('review', 5);
      saveInterruptedSession(state);

      const result = loadInterruptedSession();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.state.phase).toBe('review');
        expect(result.data.state.currentRound).toBe(5);
      }
    });

    it('破損したデータの場合nullを返しデータをクリアする', () => {
      localStorage.setItem(
        STORAGE_KEYS.INTERRUPTED_SESSION,
        'invalid json {{{'
      );

      const result = loadInterruptedSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
      expect(localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)).toBeNull();
    });

    it('不正な構造のデータの場合nullを返しデータをクリアする', () => {
      localStorage.setItem(
        STORAGE_KEYS.INTERRUPTED_SESSION,
        JSON.stringify({ invalid: 'data' })
      );

      const result = loadInterruptedSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
      expect(localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)).toBeNull();
    });

    it('stateフィールドがないデータの場合nullを返す', () => {
      localStorage.setItem(
        STORAGE_KEYS.INTERRUPTED_SESSION,
        JSON.stringify({ savedAt: '2026-01-01' })
      );

      const result = loadInterruptedSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('clearInterruptedSession', () => {
    it('中断セッションを削除できる', () => {
      const state = createSessionState();
      saveInterruptedSession(state);

      clearInterruptedSession();

      const result = loadInterruptedSession();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('他のストレージキーに影響しない', () => {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, '{"totalRounds":15}');
      saveInterruptedSession(createSessionState());

      clearInterruptedSession();

      expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).toBe(
        '{"totalRounds":15}'
      );
    });
  });

  describe('フロー統合テスト', () => {
    it('保存→読み込み→削除のフローが正常に動作する', () => {
      const state = createSessionState('writing', 7);

      // 保存
      const saveResult = saveInterruptedSession(state);
      expect(saveResult.success).toBe(true);

      // 読み込み
      const loadResult = loadInterruptedSession();
      expect(loadResult.success).toBe(true);
      if (loadResult.success && loadResult.data) {
        expect(loadResult.data.state.currentRound).toBe(7);
        expect(loadResult.data.state.phase).toBe('writing');
      }

      // 削除
      clearInterruptedSession();
      const afterClearResult = loadInterruptedSession();
      expect(afterClearResult.success).toBe(true);
      if (afterClearResult.success) {
        expect(afterClearResult.data).toBeNull();
      }
    });
  });
});
