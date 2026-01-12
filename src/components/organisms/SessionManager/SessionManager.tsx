import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../../../hooks/useSession';
import { SetupScreen } from '../SetupScreen';
import { ResumeDialog } from '../../molecules/ResumeDialog';
import { WritingMode } from '../WritingMode';
import { ReviewMode } from '../ReviewMode';
import type { SessionManagerProps, ReviewModeResult } from '../../../types/session';
import './SessionManager.css';

/**
 * セッション管理コンポーネント
 * 書き出しモードと読み返しモードを統合し、セッションフローを制御する
 */
export function SessionManager({
  defaultTotalRounds,
  timerSeconds = 20,
  onSessionComplete,
  className,
}: SessionManagerProps) {
  const {
    state,
    startSession,
    setTotalRounds,
    completeWriting,
    completeReview,
    resumeSession,
    discardInterruptedSession,
    isLastRound,
    hasInterruptedSession,
  } = useSession({ defaultTotalRounds });

  // スクリーンリーダー通知用の状態
  const [announcement, setAnnouncement] = useState('');

  // フェーズ変更時の通知
  useEffect(() => {
    switch (state.phase) {
      case 'writing':
        setAnnouncement(
          `ラウンド ${state.currentRound} / ${state.totalRounds}: 書き出しモード`
        );
        break;
      case 'review':
        setAnnouncement(
          `ラウンド ${state.currentRound} / ${state.totalRounds}: 読み返しモード`
        );
        break;
      case 'completed':
        setAnnouncement('セッション完了');
        break;
      default:
        setAnnouncement('');
    }
  }, [state.phase, state.currentRound, state.totalRounds]);

  // セッション完了時の処理
  useEffect(() => {
    if (state.phase === 'completed') {
      try {
        onSessionComplete(state.memos);
      } catch (error) {
        console.error('Session completion callback failed:', error);
      }
    }
  }, [state.phase, state.memos, onSessionComplete]);

  const handleWritingComplete = useCallback(
    (text: string) => {
      completeWriting(text);
    },
    [completeWriting]
  );

  const handleReviewComplete = useCallback(
    (result: ReviewModeResult) => {
      completeReview(result);
    },
    [completeReview]
  );

  const handleResume = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  const handleNewSession = useCallback(() => {
    discardInterruptedSession();
  }, [discardInterruptedSession]);

  const renderContent = () => {
    // 中断セッション確認ダイアログ
    if (hasInterruptedSession && state.phase === 'setup') {
      // localStorageから中断セッションの情報を取得
      const savedData = localStorage.getItem('memogaki_interrupted_session');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return (
          <>
            <SetupScreen
              totalRounds={state.totalRounds}
              onTotalRoundsChange={setTotalRounds}
              onStart={startSession}
            />
            <ResumeDialog
              interruptedRound={parsed.state.currentRound}
              totalRounds={parsed.state.totalRounds}
              onResume={handleResume}
              onNewSession={handleNewSession}
            />
          </>
        );
      }
    }

    switch (state.phase) {
      case 'setup':
        return (
          <SetupScreen
            totalRounds={state.totalRounds}
            onTotalRoundsChange={setTotalRounds}
            onStart={startSession}
          />
        );

      case 'writing':
        return (
          <WritingMode
            initialSeconds={timerSeconds}
            autoStart={true}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
            onComplete={handleWritingComplete}
          />
        );

      case 'review':
        return (
          <ReviewMode
            text={state.currentText}
            currentRound={state.currentRound}
            totalRounds={state.totalRounds}
            isLastRound={isLastRound}
            onComplete={handleReviewComplete}
          />
        );

      case 'completed':
        // 完了状態は親コンポーネントにコールバックで通知
        // ここでは何も表示しない（親が結果画面に切り替える）
        return (
          <div className="session-manager__completed">
            <p>セッション完了</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`session-manager ${className ?? ''}`}
      data-testid="session-manager"
    >
      {/* スクリーンリーダー用通知領域 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="session-manager__sr-only"
      >
        {announcement}
      </div>

      <div className="session-manager__content">{renderContent()}</div>
    </div>
  );
}
