import { useState, useCallback } from 'react';
import { SessionManager, OutputResult } from './components/organisms';
import { Footer } from './components/molecules';
import { PrivacyPolicy } from './templates';
import type { Memo as SessionMemo } from './types/session';
import type { Memo as OutputMemo } from './types/output';

type AppMode = 'session' | 'result';
type Route = 'app' | 'privacy';

/**
 * SessionのMemoをOutputのMemoに変換
 */
function convertToOutputMemos(sessionMemos: SessionMemo[]): OutputMemo[] {
  return sessionMemos.map((memo) => ({
    round: memo.round,
    text: memo.mergedText,
  }));
}

function App() {
  const [mode, setMode] = useState<AppMode>('session');
  const [route, setRoute] = useState<Route>('app');
  const [memos, setMemos] = useState<OutputMemo[]>([]);

  const handleSessionComplete = useCallback((sessionMemos: SessionMemo[]) => {
    const outputMemos = convertToOutputMemos(sessionMemos);
    setMemos(outputMemos);
    setMode('result');
  }, []);

  const handleStartNewSession = useCallback(() => {
    setMemos([]);
    setMode('session');
  }, []);

  const handlePrivacyClick = useCallback(() => {
    setRoute('privacy');
  }, []);

  const handleBackFromPrivacy = useCallback(() => {
    setRoute('app');
  }, []);

  // プライバシーポリシーページ
  if (route === 'privacy') {
    return (
      <div className="app">
        <PrivacyPolicy onBack={handleBackFromPrivacy} />
      </div>
    );
  }

  // メインアプリ
  return (
    <div className="app app--with-footer">
      {mode === 'session' && (
        <SessionManager onSessionComplete={handleSessionComplete} />
      )}

      {mode === 'result' && (
        <OutputResult
          memos={memos}
          onStartNewSession={handleStartNewSession}
        />
      )}

      <Footer onPrivacyClick={handlePrivacyClick} />
    </div>
  );
}

export default App;
