import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEYS,
  STORAGE_LIMITS,
  createStorageSuccess,
  createStorageFailure,
  generateId,
  DEFAULT_USER_SETTINGS,
  type SessionHistoryEntry,
  type UserSettings,
  type StorageResult,
  type StorageError,
} from './storage';

describe('storage types', () => {
  describe('STORAGE_KEYS', () => {
    it('中断セッションのキーが定義されている', () => {
      expect(STORAGE_KEYS.INTERRUPTED_SESSION).toBe(
        'memogaki_interrupted_session'
      );
    });

    it('セッション履歴のキーが定義されている', () => {
      expect(STORAGE_KEYS.SESSION_HISTORY).toBe('memogaki_session_history');
    });

    it('ユーザー設定のキーが定義されている', () => {
      expect(STORAGE_KEYS.USER_SETTINGS).toBe('memogaki_user_settings');
    });
  });

  describe('STORAGE_LIMITS', () => {
    it('履歴の最大保存件数が10件である', () => {
      expect(STORAGE_LIMITS.MAX_HISTORY_COUNT).toBe(10);
    });
  });

  describe('createStorageSuccess', () => {
    it('成功結果を作成できる', () => {
      const data = { value: 'test' };
      const result = createStorageSuccess(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('voidデータの成功結果を作成できる', () => {
      const result = createStorageSuccess(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('createStorageFailure', () => {
    it('容量超過エラーを作成できる', () => {
      const result = createStorageFailure('QUOTA_EXCEEDED', '容量が不足しています');

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('QUOTA_EXCEEDED');
      expect(result.error.message).toBe('容量が不足しています');
    });

    it('パースエラーを作成できる', () => {
      const result = createStorageFailure('PARSE_ERROR', 'JSONパースに失敗しました');

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('PARSE_ERROR');
      expect(result.error.message).toBe('JSONパースに失敗しました');
    });

    it('ストレージ利用不可エラーを作成できる', () => {
      const result = createStorageFailure(
        'STORAGE_UNAVAILABLE',
        'localStorageが利用できません'
      );

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('STORAGE_UNAVAILABLE');
      expect(result.error.message).toBe('localStorageが利用できません');
    });
  });

  describe('generateId', () => {
    it('UUID形式のIDを生成する', () => {
      const id = generateId();

      // UUID v4形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('毎回異なるIDを生成する', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('DEFAULT_USER_SETTINGS', () => {
    it('デフォルトの繰り返し回数が10回である', () => {
      expect(DEFAULT_USER_SETTINGS.totalRounds).toBe(10);
    });
  });

  describe('型の互換性テスト', () => {
    it('SessionHistoryEntryの型が正しく定義されている', () => {
      const entry: SessionHistoryEntry = {
        id: 'test-id',
        completedAt: '2026-01-12T00:00:00Z',
        totalRounds: 10,
        memos: [
          {
            round: 1,
            originalText: 'テスト',
            addition: '',
            mergedText: 'テスト',
            createdAt: '2026-01-12T00:00:00Z',
          },
        ],
      };

      expect(entry.id).toBe('test-id');
      expect(entry.totalRounds).toBe(10);
      expect(entry.memos).toHaveLength(1);
    });

    it('UserSettingsの型が正しく定義されている', () => {
      const settings: UserSettings = {
        totalRounds: 15,
      };

      expect(settings.totalRounds).toBe(15);
    });

    it('StorageResultの成功型が正しく定義されている', () => {
      const result: StorageResult<string> = createStorageSuccess('test');

      if (result.success) {
        expect(result.data).toBe('test');
      }
    });

    it('StorageResultの失敗型が正しく定義されている', () => {
      const result: StorageResult<string> = createStorageFailure(
        'PARSE_ERROR',
        'エラー'
      );

      if (!result.success) {
        expect(result.error.type).toBe('PARSE_ERROR');
      }
    });

    it('StorageErrorの型が正しく定義されている', () => {
      const error: StorageError = {
        type: 'QUOTA_EXCEEDED',
        message: 'テストエラー',
      };

      expect(error.type).toBe('QUOTA_EXCEEDED');
      expect(error.message).toBe('テストエラー');
    });
  });
});
