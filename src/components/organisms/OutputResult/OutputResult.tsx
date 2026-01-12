import { useState } from 'react';
import type { OutputResultProps } from '../../../types/output';
import { formatMemosForClipboard } from '../../../types/output';
import { MemoList } from '../../molecules/MemoList';
import { CopyButton } from '../../atoms/CopyButton';
import { AIGuidance } from '../../molecules/AIGuidance';
import { NewSessionButton } from '../../atoms/NewSessionButton';
import './OutputResult.css';

/**
 * 結果出力コンポーネント
 * セッション完了後のメモ一覧表示とAI活用ガイダンスを提供
 */
export function OutputResult({
  memos,
  onStartNewSession,
  className,
}: OutputResultProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const formattedText = formatMemosForClipboard(memos);

  const handleCopySuccess = () => {
    setHasCopied(true);
  };

  const handleStartNewSession = () => {
    onStartNewSession();
  };

  return (
    <div
      className={`output-result ${className ?? ''}`}
      data-testid="output-result-container"
    >
      {/* セッション完了通知（スクリーンリーダー用） */}
      <div role="status" aria-live="polite" className="sr-only">
        セッションが完了しました。{memos.length}件のメモを確認できます。
      </div>

      <header className="output-result__header">
        <h2 className="output-result__title">セッション完了</h2>
        <p className="output-result__subtitle">
          お疲れさまでした！書き出した内容を確認しましょう。
        </p>
      </header>

      <section className="output-result__memos" aria-labelledby="memo-heading">
        <h3 id="memo-heading" className="sr-only">
          メモ一覧
        </h3>
        <MemoList memos={memos} />
      </section>

      <section
        className="output-result__actions"
        aria-labelledby="actions-heading"
      >
        <h3 id="actions-heading" className="sr-only">
          アクション
        </h3>
        <CopyButton textToCopy={formattedText} onCopySuccess={handleCopySuccess} />
      </section>

      <section
        className="output-result__guidance"
        aria-labelledby="guidance-heading"
      >
        <h3 id="guidance-heading" className="sr-only">
          次のステップ
        </h3>
        <AIGuidance hasCopied={hasCopied} />
      </section>

      <footer className="output-result__footer">
        <NewSessionButton onClick={handleStartNewSession} />
      </footer>
    </div>
  );
}
