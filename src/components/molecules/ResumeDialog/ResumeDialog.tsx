import { useEffect, useRef, useCallback } from 'react';
import type { ResumeDialogProps } from '../../../types/session';
import './ResumeDialog.css';

/**
 * 中断セッション再開確認ダイアログ
 * 中断されたセッションがある場合に表示され、再開または新規開始を選択できる
 */
export function ResumeDialog({
  interruptedRound,
  totalRounds,
  onResume,
  onNewSession,
}: ResumeDialogProps) {
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ダイアログ表示時に再開ボタンにフォーカス
  useEffect(() => {
    resumeButtonRef.current?.focus();
  }, []);

  // Escapeキーで新規開始
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNewSession();
      }
    },
    [onNewSession]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // バックドロップクリックは何もしない（意図的な選択を促す）

  return (
    <div className="resume-dialog" data-testid="resume-dialog">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-dialog-title"
        className="resume-dialog__content"
      >
        <h2 id="resume-dialog-title" className="resume-dialog__title">
          中断されたセッションがあります
        </h2>

        <p className="resume-dialog__info">
          {interruptedRound} / {totalRounds} ラウンド目で中断されました
        </p>

        <div className="resume-dialog__buttons">
          <button
            ref={resumeButtonRef}
            type="button"
            className="resume-dialog__button resume-dialog__button--resume"
            onClick={onResume}
          >
            再開する
          </button>

          <button
            type="button"
            className="resume-dialog__button resume-dialog__button--new"
            onClick={onNewSession}
          >
            最初からはじめる
          </button>
        </div>
      </div>
    </div>
  );
}
