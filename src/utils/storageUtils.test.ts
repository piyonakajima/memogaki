import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  isStorageAvailable,
  getItem,
  setItem,
  removeItem,
} from './storageUtils';
import { STORAGE_KEYS } from '../types/storage';

describe('storageUtils', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    // モックをリセット
    vi.restoreAllMocks();
  });

  describe('isStorageAvailable', () => {
    it('localStorageが利用可能な場合trueを返す', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('localStorage自体がundefinedの場合falseを返す', () => {
      const originalLocalStorage = globalThis.localStorage;
      // @ts-expect-error - テスト用にlocalStorageをundefinedに設定
      globalThis.localStorage = undefined;

      expect(isStorageAvailable()).toBe(false);

      globalThis.localStorage = originalLocalStorage;
    });
  });

  describe('getItem', () => {
    it('保存されたデータを読み込める', () => {
      const testData = { value: 'test', count: 42 };
      localStorage.setItem('test_key', JSON.stringify(testData));

      const result = getItem<typeof testData>('test_key');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(testData);
      }
    });

    it('存在しないキーの場合nullを返す', () => {
      const result = getItem<string>('nonexistent_key');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('不正なJSONの場合PARSE_ERRORを返す', () => {
      localStorage.setItem('invalid_json', 'not a valid json {{{');

      const result = getItem<unknown>('invalid_json');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('PARSE_ERROR');
      }
    });
  });

  describe('setItem', () => {
    it('データを保存できる', () => {
      const testData = { value: 'test', count: 42 };

      const result = setItem('test_key', testData);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('test_key')).toBe(JSON.stringify(testData));
    });

    it('nullを保存できる', () => {
      const result = setItem('test_key', null);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('test_key')).toBe('null');
    });

    it('配列を保存できる', () => {
      const testData = [1, 2, 3, 'test'];

      const result = setItem('test_key', testData);

      expect(result.success).toBe(true);
      expect(localStorage.getItem('test_key')).toBe(JSON.stringify(testData));
    });
  });

  describe('removeItem', () => {
    it('指定したキーのデータを削除できる', () => {
      localStorage.setItem('test_key', 'value');
      localStorage.setItem('other_key', 'other_value');

      removeItem('test_key');

      expect(localStorage.getItem('test_key')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });

    it('存在しないキーを削除してもエラーにならない', () => {
      expect(() => removeItem('nonexistent_key')).not.toThrow();
    });

    it('localStorageが利用不可でもエラーを投げない', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      expect(() => removeItem('test_key')).not.toThrow();
    });
  });

  describe('統合テスト', () => {
    it('保存→読み込み→削除のフローが正常に動作する', () => {
      const testData = {
        id: 'test-123',
        items: ['a', 'b', 'c'],
        nested: { value: 100 },
      };

      // 保存
      const saveResult = setItem(STORAGE_KEYS.USER_SETTINGS, testData);
      expect(saveResult.success).toBe(true);

      // 読み込み
      const loadResult = getItem<typeof testData>(STORAGE_KEYS.USER_SETTINGS);
      expect(loadResult.success).toBe(true);
      if (loadResult.success) {
        expect(loadResult.data).toEqual(testData);
      }

      // 削除
      removeItem(STORAGE_KEYS.USER_SETTINGS);
      const afterDeleteResult = getItem<typeof testData>(
        STORAGE_KEYS.USER_SETTINGS
      );
      expect(afterDeleteResult.success).toBe(true);
      if (afterDeleteResult.success) {
        expect(afterDeleteResult.data).toBeNull();
      }
    });

    it('他のキーのデータに影響を与えない', () => {
      const key1 = STORAGE_KEYS.USER_SETTINGS;
      const key2 = STORAGE_KEYS.SESSION_HISTORY;
      const data1 = { totalRounds: 10 };
      const data2 = [{ id: '1' }];

      setItem(key1, data1);
      setItem(key2, data2);

      // key1を削除
      removeItem(key1);

      // key2は残っている
      const result = getItem<typeof data2>(key2);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data2);
      }
    });
  });
});
