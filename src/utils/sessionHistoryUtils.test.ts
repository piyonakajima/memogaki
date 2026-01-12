import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSessionHistory,
  loadSessionHistory,
  clearSessionHistory,
} from './sessionHistoryUtils';
import { STORAGE_KEYS, STORAGE_LIMITS, type Memo } from '../types/storage';

describe('sessionHistoryUtils', () => {
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

  describe('saveSessionHistory', () => {
    it('セッション履歴を保存できる', () => {
      const memos = [createMemo(1, 'テスト1'), createMemo(2, 'テスト2')];

      const result = saveSessionHistory(memos, 10);

      expect(result.success).toBe(true);
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      expect(stored).not.toBeNull();
    });

    it('保存時にIDと完了日時が自動付与される', () => {
      const memos = [createMemo(1, 'テスト')];

      saveSessionHistory(memos, 5);

      const result = loadSessionHistory();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBeDefined();
        expect(result.data[0].completedAt).toBeDefined();
        expect(result.data[0].totalRounds).toBe(5);
        expect(result.data[0].memos).toEqual(memos);
      }
    });

    it('最大10件の履歴を保存できる', () => {
      for (let i = 0; i < 10; i++) {
        saveSessionHistory([createMemo(1, `テスト${i}`)], 10);
      }

      const result = loadSessionHistory();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toHaveLength(10);
      }
    });

    it('10件を超えると最も古い履歴が削除される', () => {
      // 10件保存
      for (let i = 0; i < 10; i++) {
        saveSessionHistory([createMemo(1, `old-${i}`)], 10);
      }

      // 11件目を保存
      saveSessionHistory([createMemo(1, 'new')], 10);

      const result = loadSessionHistory();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toHaveLength(STORAGE_LIMITS.MAX_HISTORY_COUNT);
        // 最新のものが含まれている
        const hasNew = result.data.some(
          (entry) => entry.memos[0].originalText === 'new'
        );
        expect(hasNew).toBe(true);
        // 最も古いものは削除されている
        const hasOld0 = result.data.some(
          (entry) => entry.memos[0].originalText === 'old-0'
        );
        expect(hasOld0).toBe(false);
      }
    });

    it('空のメモ配列でも保存できる', () => {
      const result = saveSessionHistory([], 10);

      expect(result.success).toBe(true);
    });
  });

  describe('loadSessionHistory', () => {
    it('履歴がない場合は空配列を返す', () => {
      const result = loadSessionHistory();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('保存された履歴を読み込める', () => {
      const memos = [createMemo(1, 'テスト'), createMemo(2, 'テスト2')];
      saveSessionHistory(memos, 10);

      const result = loadSessionHistory();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].memos).toEqual(memos);
      }
    });

    it('破損したデータの場合空配列を返しデータをクリアする', () => {
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, 'invalid json {{{');

      const result = loadSessionHistory();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
      // 破損データはクリアされる
      expect(localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY)).toBeNull();
    });

    it('履歴は新しいものが後ろに来る（時系列順）', () => {
      saveSessionHistory([createMemo(1, 'first')], 10);
      saveSessionHistory([createMemo(1, 'second')], 10);
      saveSessionHistory([createMemo(1, 'third')], 10);

      const result = loadSessionHistory();
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data[0].memos[0].originalText).toBe('first');
        expect(result.data[2].memos[0].originalText).toBe('third');
      }
    });
  });

  describe('clearSessionHistory', () => {
    it('全ての履歴を削除できる', () => {
      saveSessionHistory([createMemo(1, 'テスト')], 10);
      saveSessionHistory([createMemo(1, 'テスト2')], 10);

      clearSessionHistory();

      const result = loadSessionHistory();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('他のストレージキーに影響しない', () => {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, '{"totalRounds":15}');
      saveSessionHistory([createMemo(1, 'テスト')], 10);

      clearSessionHistory();

      expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).toBe(
        '{"totalRounds":15}'
      );
    });
  });
});
