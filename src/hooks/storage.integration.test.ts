/**
 * ストレージ統合テスト
 * セッション履歴、設定、中断セッションの完全フローを検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from './useSession';
import { useStorage } from './useStorage';
import { STORAGE_KEYS } from '../types/storage';
import type { ReviewModeResult } from '../types/session';

describe('ストレージ統合テスト', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createReviewResult = (text: string): ReviewModeResult => ({
    originalText: text,
    addition: '',
    mergedText: text,
  });

  describe('7.1 完全フロー結合テスト', () => {
    describe('セッション完了から履歴保存、読み込みまでの一連の流れ', () => {
      it('セッション完了 → 履歴保存 → 新セッションで履歴読み込み', () => {
        // セッション1: 完了まで実行
        const { result: session1 } = renderHook(() =>
          useSession({ enableHistorySave: true })
        );

        act(() => {
          session1.current.setTotalRounds(2);
          session1.current.startSession();
        });

        // ラウンド1
        act(() => {
          session1.current.completeWriting('セッション1 ラウンド1');
        });
        act(() => {
          session1.current.completeReview(
            createReviewResult('セッション1 ラウンド1')
          );
        });

        // ラウンド2（最終）
        act(() => {
          session1.current.completeWriting('セッション1 ラウンド2');
        });
        act(() => {
          session1.current.completeReview(
            createReviewResult('セッション1 ラウンド2')
          );
        });

        expect(session1.current.state.phase).toBe('completed');

        // 履歴が保存されていることを確認
        const { result: storage } = renderHook(() => useStorage());
        expect(storage.current.history).toHaveLength(1);
        expect(storage.current.history[0].memos).toHaveLength(2);
        expect(storage.current.history[0].totalRounds).toBe(2);
      });

      it('複数セッション完了 → 履歴が累積される', () => {
        // セッション1
        const { result: session1 } = renderHook(() =>
          useSession({ enableHistorySave: true })
        );

        act(() => {
          session1.current.setTotalRounds(1);
          session1.current.startSession();
          session1.current.completeWriting('セッション1');
        });
        act(() => {
          session1.current.completeReview(createReviewResult('セッション1'));
        });

        // セッション2（新しいフック）
        const { result: session2 } = renderHook(() =>
          useSession({ enableHistorySave: true })
        );

        act(() => {
          session2.current.setTotalRounds(1);
          session2.current.startSession();
          session2.current.completeWriting('セッション2');
        });
        act(() => {
          session2.current.completeReview(createReviewResult('セッション2'));
        });

        // 履歴確認
        const { result: storage } = renderHook(() => useStorage());
        expect(storage.current.history).toHaveLength(2);
      });
    });

    describe('設定変更から永続化、再読み込みまでの一連の流れ', () => {
      it('設定変更 → 永続化 → 新セッションで読み込み', () => {
        // セッション1で設定変更
        const { result: session1 } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );

        act(() => {
          session1.current.setTotalRounds(15);
        });

        // 設定が永続化されていることを確認
        expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).not.toBeNull();

        // 新しいフックで読み込み
        const { result: session2 } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );

        expect(session2.current.state.totalRounds).toBe(15);
      });

      it('設定変更がセッション完了後も保持される', () => {
        const { result } = renderHook(() =>
          useSession({
            enableSettingsPersistence: true,
            enableHistorySave: true,
          })
        );

        // 設定変更
        act(() => {
          result.current.setTotalRounds(5);
        });

        // セッション完了
        act(() => {
          result.current.startSession();
          result.current.completeWriting('テスト');
        });
        act(() => {
          result.current.completeReview(createReviewResult('テスト'));
        });

        // リセット
        act(() => {
          result.current.resetSession();
        });

        // 設定は保持される
        expect(result.current.state.totalRounds).toBe(5);

        // 新フックでも同じ
        const { result: session2 } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );
        expect(session2.current.state.totalRounds).toBe(5);
      });
    });

    describe('中断から再開までの完全な復元フロー', () => {
      it('中断 → 再開 → 完了までの一連の流れ', () => {
        // セッション開始と中断
        const { result: session1, unmount } = renderHook(() =>
          useSession({ enableAutoSave: true, enableHistorySave: true })
        );

        act(() => {
          session1.current.setTotalRounds(2);
          session1.current.startSession();
          session1.current.completeWriting('ラウンド1');
        });
        act(() => {
          session1.current.completeReview(createReviewResult('ラウンド1'));
        });

        // ラウンド2の書き出し中に中断
        act(() => {
          session1.current.completeWriting('ラウンド2途中');
        });

        // フック解除（アプリ閉じを模倣）
        unmount();

        // 中断セッションが保存されていることを確認
        expect(
          localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)
        ).not.toBeNull();

        // 新セッションで再開
        const { result: session2 } = renderHook(() =>
          useSession({ enableAutoSave: true, enableHistorySave: true })
        );

        expect(session2.current.hasInterruptedSession).toBe(true);

        act(() => {
          session2.current.resumeSession();
        });

        // 中断時点から再開
        expect(session2.current.state.phase).toBe('review');
        expect(session2.current.state.currentRound).toBe(2);
        expect(session2.current.state.memos).toHaveLength(1);

        // セッション完了
        act(() => {
          session2.current.completeReview(createReviewResult('ラウンド2途中'));
        });

        expect(session2.current.state.phase).toBe('completed');

        // 履歴が保存される
        const { result: storage } = renderHook(() => useStorage());
        expect(storage.current.history).toHaveLength(1);
      });

      it('中断セッションを破棄して新規開始できる', () => {
        // 中断セッションを作成
        const { result: session1, unmount } = renderHook(() =>
          useSession({ enableAutoSave: true })
        );

        act(() => {
          session1.current.setTotalRounds(5);
          session1.current.startSession();
          session1.current.completeWriting('破棄されるテキスト');
        });

        unmount();

        // 新セッションで破棄
        const { result: session2 } = renderHook(() =>
          useSession({ enableAutoSave: true })
        );

        expect(session2.current.hasInterruptedSession).toBe(true);

        act(() => {
          session2.current.discardInterruptedSession();
        });

        expect(session2.current.hasInterruptedSession).toBe(false);
        expect(session2.current.state.phase).toBe('setup');
        expect(
          localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)
        ).toBeNull();
      });
    });
  });

  describe('7.2 エラーケースと境界条件', () => {
    describe('破損データ検出時のフォールバック動作', () => {
      it('破損した履歴データは無視して空配列が返される', () => {
        localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, 'invalid json {{{');

        const { result } = renderHook(() => useStorage());

        expect(result.current.history).toEqual([]);
      });

      it('破損した設定データは無視してデフォルト値が使用される', () => {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, 'invalid json');

        const { result } = renderHook(() =>
          useSession({ enableSettingsPersistence: true, defaultTotalRounds: 10 })
        );

        expect(result.current.state.totalRounds).toBe(10);
      });

      it('破損した中断セッションデータは無視される', () => {
        localStorage.setItem(STORAGE_KEYS.INTERRUPTED_SESSION, '{{invalid}}');

        const { result } = renderHook(() => useSession({ enableAutoSave: true }));

        expect(result.current.hasInterruptedSession).toBe(false);
      });

      it('不正な構造のデータは自動クリアされる', () => {
        localStorage.setItem(
          STORAGE_KEYS.INTERRUPTED_SESSION,
          JSON.stringify({ wrong: 'structure' })
        );

        renderHook(() => useSession({ enableAutoSave: true }));

        // 不正データはクリアされる
        expect(
          localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)
        ).toBeNull();
      });
    });

    describe('履歴の10件制限', () => {
      it('11件目の履歴保存時に最古の履歴が削除される', () => {
        const { result: storage } = renderHook(() => useStorage());

        // 10件の履歴を保存
        for (let i = 1; i <= 10; i++) {
          act(() => {
            storage.current.saveHistory(
              [
                {
                  round: 1,
                  originalText: `履歴${i}`,
                  addition: '',
                  mergedText: `履歴${i}`,
                  createdAt: new Date(2026, 0, i).toISOString(),
                },
              ],
              1
            );
          });
        }

        expect(storage.current.history).toHaveLength(10);

        // 11件目を追加
        act(() => {
          storage.current.saveHistory(
            [
              {
                round: 1,
                originalText: '履歴11',
                addition: '',
                mergedText: '履歴11',
                createdAt: new Date(2026, 0, 11).toISOString(),
              },
            ],
            1
          );
        });

        // 10件を維持
        expect(storage.current.history).toHaveLength(10);

        // 最新の履歴（配列の先頭に追加される）が含まれている
        const historyTexts = storage.current.history.map(
          (h) => h.memos[0].originalText
        );
        expect(historyTexts).toContain('履歴11');

        // 最古の履歴（履歴1）は削除されている
        expect(historyTexts).not.toContain('履歴1');
      });
    });

    describe('セッションとストレージの状態整合性', () => {
      it('リセット後も設定は保持される', () => {
        const { result } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );

        act(() => {
          result.current.setTotalRounds(20);
          result.current.startSession();
        });

        act(() => {
          result.current.resetSession();
        });

        expect(result.current.state.totalRounds).toBe(20);
        expect(result.current.state.phase).toBe('setup');
      });

      it('複数回のセッション完了で履歴が正しく累積される', () => {
        const { result } = renderHook(() =>
          useSession({ enableHistorySave: true })
        );

        // 3セッション完了
        for (let session = 1; session <= 3; session++) {
          act(() => {
            result.current.setTotalRounds(1);
            result.current.startSession();
            result.current.completeWriting(`セッション${session}`);
          });
          act(() => {
            result.current.completeReview(
              createReviewResult(`セッション${session}`)
            );
          });
          act(() => {
            result.current.resetSession();
          });
        }

        const { result: storage } = renderHook(() => useStorage());
        expect(storage.current.history).toHaveLength(3);
      });
    });
  });
});
