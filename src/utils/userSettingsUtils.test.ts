import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveUserSettings,
  loadUserSettings,
} from './userSettingsUtils';
import { STORAGE_KEYS, DEFAULT_USER_SETTINGS } from '../types/storage';

describe('userSettingsUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveUserSettings', () => {
    it('ユーザー設定を保存できる', () => {
      const settings = { totalRounds: 15 };

      const result = saveUserSettings(settings);

      expect(result.success).toBe(true);
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      expect(stored).toBe(JSON.stringify(settings));
    });

    it('既存の設定を上書きできる', () => {
      saveUserSettings({ totalRounds: 10 });
      saveUserSettings({ totalRounds: 20 });

      const result = loadUserSettings();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.totalRounds).toBe(20);
      }
    });
  });

  describe('loadUserSettings', () => {
    it('設定がない場合はnullを返す', () => {
      const result = loadUserSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('保存された設定を読み込める', () => {
      const settings = { totalRounds: 25 };
      saveUserSettings(settings);

      const result = loadUserSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(settings);
      }
    });

    it('破損したデータの場合nullを返しデータをクリアする', () => {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, 'invalid json {{{');

      const result = loadUserSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
      // 破損データはクリアされる
      expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).toBeNull();
    });
  });

  describe('DEFAULT_USER_SETTINGS', () => {
    it('デフォルト値が正しく定義されている', () => {
      expect(DEFAULT_USER_SETTINGS.totalRounds).toBe(10);
    });
  });

  describe('他のストレージキーとの独立性', () => {
    it('ユーザー設定の保存が他のキーに影響しない', () => {
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, '[]');

      saveUserSettings({ totalRounds: 15 });

      expect(localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY)).toBe('[]');
    });
  });
});
