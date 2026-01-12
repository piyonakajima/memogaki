import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReviewModeProps } from '../../../types/review';
import { DEFAULT_EMPTY_TEXT_PLACEHOLDER } from '../../../types/review';
import './ReviewMode.css';

export function ReviewMode({
  text,
  currentRound,
  totalRounds,
  isLastRound = false,
  emptyTextPlaceholder = DEFAULT_EMPTY_TEXT_PLACEHOLDER,
  onComplete,
  className,
}: ReviewModeProps) {
  const [editedText, setEditedText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを内容に合わせて自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  const handleComplete = useCallback(() => {
    onComplete?.({
      originalText: text,
      addition: '',
      mergedText: editedText,
    });
  }, [text, editedText, onComplete]);

  const buttonLabel = isLastRound ? '完了' : '次へ';

  return (
    <div
      className={`review-mode ${className ?? ''}`}
      data-testid="review-mode-container"
    >
      <div
        className="review-mode__progress"
        data-testid="progress-indicator"
        aria-live="polite"
      >
        <span className="review-mode__sr-only">
          ラウンド {currentRound} / {totalRounds}
        </span>
        <span aria-hidden="true">
          {currentRound} / {totalRounds}
        </span>
      </div>

      <div className="review-mode__memo-card">
        <div className="review-mode__memo-header">
          <span className="review-mode__memo-round">Round {currentRound}</span>
        </div>
        <textarea
          ref={textareaRef}
          className="review-mode__textarea"
          value={editedText}
          onChange={handleChange}
          placeholder={emptyTextPlaceholder}
          aria-label={`ラウンド${currentRound}のメモ`}
          data-testid="text-editor"
          rows={1}
        />
      </div>

      <button
        className={`review-mode__button ${isLastRound ? 'review-mode__button--final' : ''}`}
        onClick={handleComplete}
        data-testid="complete-button"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
