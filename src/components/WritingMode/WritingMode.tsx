import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimer } from '../../hooks/useTimer';
import type { WritingModeProps } from '../../types/writing';
import { DEFAULT_PLACEHOLDER } from '../../types/writing';
import './WritingMode.css';

export function WritingMode({
  initialSeconds = 20,
  initialText = '',
  placeholder = DEFAULT_PLACEHOLDER,
  autoStart = false,
  onChange,
  onComplete,
  className,
}: WritingModeProps) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef(text);

  // テキストの最新値を保持
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // onCompleteをラップしてテキストを渡す
  const handleTimerComplete = useCallback(() => {
    onComplete?.(textRef.current);
  }, [onComplete]);

  const { seconds, status, isWarning, start } = useTimer({
    initialSeconds,
    onComplete: handleTimerComplete,
  });

  const isCompleted = status === 'completed';

  // autoStart対応
  useEffect(() => {
    if (autoStart && status === 'idle') {
      start();
    }
  }, [autoStart, status, start]);

  // 自動フォーカス
  useEffect(() => {
    if (!isCompleted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isCompleted]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange?.(newText);
  };

  return (
    <div
      className={`writing-mode ${className ?? ''}`}
      data-testid="writing-mode-container"
    >
      <div
        className={`writing-mode__timer ${isWarning ? 'warning' : ''}`}
        data-testid="timer-display"
      >
        {seconds}
      </div>

      {isWarning && (
        <div
          role="status"
          aria-live="polite"
          className="writing-mode__sr-only"
        >
          残り{seconds}秒
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="writing-mode__textarea"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={isCompleted}
        aria-label="思考を書き出すエリア"
      />
    </div>
  );
}
