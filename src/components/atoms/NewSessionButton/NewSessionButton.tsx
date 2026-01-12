import type { NewSessionButtonProps } from '../../../types/output';

/**
 * 新規セッションボタンコンポーネント
 * 新しいセッションを開始するためのボタン
 */
export function NewSessionButton({ onClick }: NewSessionButtonProps) {
  return (
    <button
      type="button"
      className="new-session-button"
      onClick={onClick}
      aria-label="新しいセッションを始める"
    >
      新しいセッションを始める
    </button>
  );
}
