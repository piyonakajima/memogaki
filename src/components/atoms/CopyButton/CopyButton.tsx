import { useClipboard } from '../../../hooks/useClipboard';
import type { CopyButtonProps } from '../../../types/output';

/**
 * コピーボタンコンポーネント
 * クリップボードへのコピーとフィードバック表示を管理
 */
export function CopyButton({ textToCopy, onCopySuccess }: CopyButtonProps) {
  const { copied, error, errorMessage, copyToClipboard } = useClipboard();

  const handleClick = async () => {
    const success = await copyToClipboard(textToCopy);
    if (success && onCopySuccess) {
      onCopySuccess();
    }
  };

  return (
    <div className="copy-button-container">
      <button
        type="button"
        className={`copy-button ${copied ? 'copy-button--copied' : ''} ${error ? 'copy-button--error' : ''}`}
        onClick={handleClick}
        aria-label={copied ? 'コピーしました' : 'すべてのメモをコピー'}
      >
        {copied ? 'コピーしました！' : 'すべてコピー'}
      </button>

      {/* コピー成功時のスクリーンリーダー通知 */}
      {copied && (
        <div role="status" aria-live="polite" className="sr-only">
          コピーしました
        </div>
      )}

      {/* エラー時の表示 */}
      {error && errorMessage && (
        <div role="alert" aria-live="assertive" className="copy-button__error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
