/**
 * ユーザー設定管理ユーティリティ
 * ユーザー設定をlocalStorageに保存・読み込みする
 */

import {
  STORAGE_KEYS,
  createStorageSuccess,
  type UserSettings,
  type StorageResult,
} from '../types/storage';
import { getItem, setItem, removeItem } from './storageUtils';

/**
 * ユーザー設定を保存する
 * @param settings ユーザー設定
 * @returns 保存結果
 */
export function saveUserSettings(
  settings: UserSettings
): StorageResult<void> {
  return setItem(STORAGE_KEYS.USER_SETTINGS, settings);
}

/**
 * ユーザー設定を読み込む
 * @returns ユーザー設定（存在しない場合はnull）
 */
export function loadUserSettings(): StorageResult<UserSettings | null> {
  const result = getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS);

  if (!result.success) {
    // パースエラーの場合、破損データを削除してnullを返す
    if (result.error.type === 'PARSE_ERROR') {
      removeItem(STORAGE_KEYS.USER_SETTINGS);
      return createStorageSuccess(null);
    }
    return result;
  }

  return createStorageSuccess(result.data);
}
