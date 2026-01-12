/**
 * localStorageユーティリティ関数
 * localStorage操作を抽象化し、型安全なアクセスを提供
 */

import {
  createStorageSuccess,
  createStorageFailure,
  type StorageResult,
} from '../types/storage';

/**
 * localStorageが利用可能かどうかを判定
 * プライベートブラウジングモードなどでは利用不可の場合がある
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * localStorageからデータを読み込む
 * @param key ストレージキー
 * @returns 読み込んだデータ（存在しない場合はnull）
 */
export function getItem<T>(key: string): StorageResult<T | null> {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return createStorageSuccess(null);
    }
    const parsed = JSON.parse(item) as T;
    return createStorageSuccess(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createStorageFailure(
        'PARSE_ERROR',
        `JSONパースに失敗しました: ${error.message}`
      );
    }
    return createStorageFailure(
      'STORAGE_UNAVAILABLE',
      `localStorageの読み込みに失敗しました: ${String(error)}`
    );
  }
}

/**
 * localStorageにデータを保存する
 * @param key ストレージキー
 * @param value 保存するデータ
 * @returns 保存結果
 */
export function setItem<T>(key: string, value: T): StorageResult<void> {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return createStorageSuccess(undefined);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return createStorageFailure(
        'QUOTA_EXCEEDED',
        'localStorageの容量が不足しています'
      );
    }
    return createStorageFailure(
      'STORAGE_UNAVAILABLE',
      `localStorageへの書き込みに失敗しました: ${String(error)}`
    );
  }
}

/**
 * localStorageからデータを削除する
 * @param key ストレージキー
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // 削除失敗は無視（ストレージ利用不可でもアプリは継続動作）
    console.warn(`localStorageからの削除に失敗しました: ${key}`);
  }
}
