import { useState, useRef, useCallback, useEffect } from 'react';
import type { UseClipboardOptions, UseClipboardReturn } from '../types/output';
import { DEFAULT_SUCCESS_DURATION } from '../types/output';

/**
 * クリップボード操作を管理するカスタムフック
 * Clipboard API優先、非対応時はexecCommandフォールバック
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { successDuration = DEFAULT_SUCCESS_DURATION } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);

  // タイムアウトをクリアするヘルパー
  const clearCopyTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      clearCopyTimeout();
    };
  }, [clearCopyTimeout]);

  // execCommandを使用したフォールバックコピー
  const fallbackCopy = useCallback((text: string): boolean => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // スタイルを設定して画面外に配置
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    }

    document.body.removeChild(textArea);
    return success;
  }, []);

  // クリップボードにコピーする関数
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      // 既存のタイムアウトをクリア
      clearCopyTimeout();

      // 状態をリセット
      setError(false);
      setErrorMessage(null);

      try {
        // Clipboard API が利用可能か確認
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          setCopied(true);

          // successDuration後に自動リセット
          timeoutRef.current = window.setTimeout(() => {
            setCopied(false);
          }, successDuration);

          return true;
        }

        // フォールバック: execCommand
        const success = fallbackCopy(text);
        if (success) {
          setCopied(true);

          timeoutRef.current = window.setTimeout(() => {
            setCopied(false);
          }, successDuration);

          return true;
        }

        // フォールバックも失敗
        setError(true);
        setErrorMessage('クリップボードへのコピーに失敗しました');
        return false;
      } catch (err) {
        // エラー処理
        setError(true);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setErrorMessage('クリップボードへのアクセスが許可されていません');
          } else {
            setErrorMessage('クリップボードへのコピーに失敗しました');
          }
        } else {
          setErrorMessage('クリップボードへのコピーに失敗しました');
        }

        // フォールバックを試行
        const success = fallbackCopy(text);
        if (success) {
          setError(false);
          setErrorMessage(null);
          setCopied(true);

          timeoutRef.current = window.setTimeout(() => {
            setCopied(false);
          }, successDuration);

          return true;
        }

        return false;
      }
    },
    [successDuration, clearCopyTimeout, fallbackCopy]
  );

  // 状態をリセットする関数
  const reset = useCallback(() => {
    clearCopyTimeout();
    setCopied(false);
    setError(false);
    setErrorMessage(null);
  }, [clearCopyTimeout]);

  return {
    copied,
    error,
    errorMessage,
    copyToClipboard,
    reset,
  };
}
