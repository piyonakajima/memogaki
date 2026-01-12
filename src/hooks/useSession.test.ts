import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from './useSession';
import {
  DEFAULT_TOTAL_ROUNDS,
  MIN_ROUNDS,
  MAX_ROUNDS,
  STORAGE_KEY,
} from '../types/session';
import { STORAGE_KEYS } from '../types/storage';
import type { ReviewModeResult } from '../types/session';

describe('useSession', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('デフォルトの初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.state.phase).toBe('setup');
      expect(result.current.state.currentRound).toBe(1);
      expect(result.current.state.totalRounds).toBe(DEFAULT_TOTAL_ROUNDS);
      expect(result.current.state.memos).toEqual([]);
      expect(result.current.state.currentText).toBe('');
    });

    it('カスタムのデフォルト繰り返し回数を設定できる', () => {
      const { result } = renderHook(() =>
        useSession({ defaultTotalRounds: 5 })
      );

      expect(result.current.state.totalRounds).toBe(5);
    });

    it('isLastRoundは初期状態でfalse', () => {
      const { result } = renderHook(() => useSession());

      expect(result.current.isLastRound).toBe(false);
    });
  });

  describe('setTotalRounds', () => {
    it('繰り返し回数を変更できる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(15);
      });

      expect(result.current.state.totalRounds).toBe(15);
    });

    it('最小値より小さい値はMIN_ROUNDSにクランプされる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(0);
      });

      expect(result.current.state.totalRounds).toBe(MIN_ROUNDS);
    });

    it('最大値より大きい値はMAX_ROUNDSにクランプされる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(100);
      });

      expect(result.current.state.totalRounds).toBe(MAX_ROUNDS);
    });

    it('小数値は切り捨てられる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(5.9);
      });

      expect(result.current.state.totalRounds).toBe(5);
    });

    it('セッション進行中は回数を変更できない', () => {
      const { result } = renderHook(() => useSession());

      // セッション開始
      act(() => {
        result.current.startSession();
      });

      // 変更を試みる
      act(() => {
        result.current.setTotalRounds(5);
      });

      // 変更されていないことを確認（開始時のデフォルト値のまま）
      expect(result.current.state.totalRounds).toBe(DEFAULT_TOTAL_ROUNDS);
    });
  });

  describe('startSession', () => {
    it('セッション開始でフェーズがwritingに遷移する', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
      });

      expect(result.current.state.phase).toBe('writing');
    });

    it('セッション開始で状態が初期化される', () => {
      const { result } = renderHook(() => useSession());

      // 回数を変更してから開始
      act(() => {
        result.current.setTotalRounds(5);
        result.current.startSession();
      });

      expect(result.current.state.currentRound).toBe(1);
      expect(result.current.state.memos).toEqual([]);
      expect(result.current.state.currentText).toBe('');
      expect(result.current.state.totalRounds).toBe(5);
    });
  });

  describe('completeWriting', () => {
    it('書き出し完了でフェーズがreviewに遷移する', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
      });

      act(() => {
        result.current.completeWriting('テスト入力');
      });

      expect(result.current.state.phase).toBe('review');
    });

    it('書き出し完了でテキストが保存される', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
      });

      act(() => {
        result.current.completeWriting('テスト入力');
      });

      expect(result.current.state.currentText).toBe('テスト入力');
    });
  });

  describe('completeReview', () => {
    const reviewResult: ReviewModeResult = {
      originalText: 'オリジナル',
      addition: '追記',
      mergedText: 'オリジナル\n\n---\n\n追記',
    };

    it('読み返し完了でメモが追加される', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
        result.current.completeWriting('オリジナル');
      });

      act(() => {
        result.current.completeReview(reviewResult);
      });

      expect(result.current.state.memos).toHaveLength(1);
      expect(result.current.state.memos[0].originalText).toBe('オリジナル');
      expect(result.current.state.memos[0].addition).toBe('追記');
      expect(result.current.state.memos[0].round).toBe(1);
    });

    it('読み返し完了でラウンドがインクリメントされる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
        result.current.completeWriting('テスト');
      });

      act(() => {
        result.current.completeReview(reviewResult);
      });

      expect(result.current.state.currentRound).toBe(2);
    });

    it('次のラウンドがある場合、フェーズがwritingに戻る', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(3);
        result.current.startSession();
        result.current.completeWriting('テスト');
      });

      act(() => {
        result.current.completeReview(reviewResult);
      });

      expect(result.current.state.phase).toBe('writing');
    });

    it('最終ラウンドの読み返し完了でフェーズがcompletedになる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(1);
        result.current.startSession();
        result.current.completeWriting('テスト');
      });

      act(() => {
        result.current.completeReview(reviewResult);
      });

      expect(result.current.state.phase).toBe('completed');
    });
  });

  describe('isLastRound', () => {
    it('最終ラウンドでtrueを返す', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(1);
        result.current.startSession();
      });

      expect(result.current.isLastRound).toBe(true);
    });

    it('最終ラウンド以外でfalseを返す', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(3);
        result.current.startSession();
      });

      expect(result.current.isLastRound).toBe(false);
    });
  });

  describe('resetSession', () => {
    it('リセットでフェーズがsetupに戻る', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.startSession();
        result.current.completeWriting('テスト');
      });

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.state.phase).toBe('setup');
    });

    it('リセットで全状態が初期化される', () => {
      const { result } = renderHook(() => useSession());

      const reviewResult: ReviewModeResult = {
        originalText: 'テスト',
        addition: '',
        mergedText: 'テスト',
      };

      act(() => {
        result.current.setTotalRounds(5);
        result.current.startSession();
        result.current.completeWriting('テスト');
        result.current.completeReview(reviewResult);
      });

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.state.currentRound).toBe(1);
      expect(result.current.state.memos).toEqual([]);
      expect(result.current.state.currentText).toBe('');
      // totalRoundsは保持される
      expect(result.current.state.totalRounds).toBe(5);
    });
  });

  describe('セッション中断・再開', () => {
    it('セッション進行中に状態が自動保存される', () => {
      const { result } = renderHook(() =>
        useSession({ enableAutoSave: true })
      );

      act(() => {
        result.current.startSession();
        result.current.completeWriting('保存テスト');
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.state.currentText).toBe('保存テスト');
    });

    it('中断セッションを検出できる', () => {
      // 中断セッションを保存
      const interruptedState = {
        state: {
          phase: 'review',
          currentRound: 3,
          totalRounds: 10,
          memos: [],
          currentText: '中断テスト',
        },
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interruptedState));

      const { result } = renderHook(() => useSession());

      expect(result.current.hasInterruptedSession).toBe(true);
    });

    it('中断セッションを再開できる', () => {
      // 中断セッションを保存
      const interruptedState = {
        state: {
          phase: 'review' as const,
          currentRound: 3,
          totalRounds: 10,
          memos: [],
          currentText: '中断テスト',
        },
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interruptedState));

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.resumeSession();
      });

      expect(result.current.state.phase).toBe('review');
      expect(result.current.state.currentRound).toBe(3);
      expect(result.current.state.currentText).toBe('中断テスト');
    });

    it('中断セッションを破棄できる', () => {
      // 中断セッションを保存
      const interruptedState = {
        state: {
          phase: 'review',
          currentRound: 3,
          totalRounds: 10,
          memos: [],
          currentText: '中断テスト',
        },
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interruptedState));

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.discardInterruptedSession();
      });

      expect(result.current.hasInterruptedSession).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('書き出し中に中断された場合、再開時に読み返しフェーズから開始する', () => {
      // 書き出し中に中断されたセッションを保存
      const interruptedState = {
        state: {
          phase: 'writing' as const,
          currentRound: 2,
          totalRounds: 10,
          memos: [
            {
              round: 1,
              originalText: 'ラウンド1',
              addition: '',
              mergedText: 'ラウンド1',
              createdAt: new Date().toISOString(),
            },
          ],
          currentText: '',
        },
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interruptedState));

      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.resumeSession();
      });

      // 書き出し中だった場合は、そのラウンドの書き出しからやり直し
      expect(result.current.state.phase).toBe('writing');
      expect(result.current.state.currentRound).toBe(2);
      expect(result.current.state.currentText).toBe('');
    });

    it('破損したlocalStorageデータは無視される', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      const { result } = renderHook(() => useSession());

      expect(result.current.hasInterruptedSession).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('複数ラウンドのフロー', () => {
    it('3ラウンドのセッションを完走できる', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setTotalRounds(3);
        result.current.startSession();
      });

      // ラウンド1
      act(() => {
        result.current.completeWriting('ラウンド1');
      });
      act(() => {
        result.current.completeReview({
          originalText: 'ラウンド1',
          addition: '',
          mergedText: 'ラウンド1',
        });
      });

      expect(result.current.state.currentRound).toBe(2);
      expect(result.current.state.phase).toBe('writing');

      // ラウンド2
      act(() => {
        result.current.completeWriting('ラウンド2');
      });
      act(() => {
        result.current.completeReview({
          originalText: 'ラウンド2',
          addition: '追記2',
          mergedText: 'ラウンド2\n\n---\n\n追記2',
        });
      });

      expect(result.current.state.currentRound).toBe(3);
      expect(result.current.isLastRound).toBe(true);

      // ラウンド3（最終）
      act(() => {
        result.current.completeWriting('ラウンド3');
      });
      act(() => {
        result.current.completeReview({
          originalText: 'ラウンド3',
          addition: '',
          mergedText: 'ラウンド3',
        });
      });

      expect(result.current.state.phase).toBe('completed');
      expect(result.current.state.memos).toHaveLength(3);
    });
  });

  describe('ストレージ統合', () => {
    describe('settingsLoaded', () => {
      it('設定読み込み完了フラグが提供される', () => {
        const { result } = renderHook(() => useSession());

        expect(result.current.settingsLoaded).toBe(true);
      });
    });

    describe('storageError', () => {
      it('初期状態ではストレージエラーがない', () => {
        const { result } = renderHook(() => useSession());

        expect(result.current.storageError).toBeNull();
      });
    });

    describe('設定の永続化', () => {
      it('setTotalRounds時に設定が永続化される', () => {
        const { result } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );

        act(() => {
          result.current.setTotalRounds(15);
        });

        const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        expect(saved).not.toBeNull();

        const parsed = JSON.parse(saved!);
        expect(parsed.totalRounds).toBe(15);
      });

      it('enableSettingsPersistence=falseで設定が永続化されない', () => {
        const { result } = renderHook(() =>
          useSession({ enableSettingsPersistence: false })
        );

        act(() => {
          result.current.setTotalRounds(15);
        });

        const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        expect(saved).toBeNull();
      });

      it('保存済み設定がアプリ起動時に読み込まれる', () => {
        localStorage.setItem(
          STORAGE_KEYS.USER_SETTINGS,
          JSON.stringify({ totalRounds: 20 })
        );

        const { result } = renderHook(() =>
          useSession({ enableSettingsPersistence: true })
        );

        expect(result.current.state.totalRounds).toBe(20);
      });
    });

    describe('セッション履歴の自動保存', () => {
      it('セッション完了時に履歴が保存される', () => {
        const { result } = renderHook(() =>
          useSession({ enableHistorySave: true })
        );

        act(() => {
          result.current.setTotalRounds(1);
          result.current.startSession();
          result.current.completeWriting('テスト');
        });

        act(() => {
          result.current.completeReview({
            originalText: 'テスト',
            addition: '',
            mergedText: 'テスト',
          });
        });

        expect(result.current.state.phase).toBe('completed');

        const saved = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
        expect(saved).not.toBeNull();

        const parsed = JSON.parse(saved!);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].memos).toHaveLength(1);
        expect(parsed[0].totalRounds).toBe(1);
      });

      it('enableHistorySave=falseで履歴が保存されない', () => {
        const { result } = renderHook(() =>
          useSession({ enableHistorySave: false })
        );

        act(() => {
          result.current.setTotalRounds(1);
          result.current.startSession();
          result.current.completeWriting('テスト');
        });

        act(() => {
          result.current.completeReview({
            originalText: 'テスト',
            addition: '',
            mergedText: 'テスト',
          });
        });

        const saved = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
        expect(saved).toBeNull();
      });
    });

    describe('useStorageとの統合', () => {
      it('中断セッションがストレージユーティリティ経由で保存される', () => {
        const { result } = renderHook(() =>
          useSession({ enableAutoSave: true })
        );

        act(() => {
          result.current.startSession();
          result.current.completeWriting('テスト');
        });

        // 新しいストレージキーで保存されていることを確認
        const saved = localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION);
        expect(saved).not.toBeNull();

        const parsed = JSON.parse(saved!);
        expect(parsed.state.currentText).toBe('テスト');
        expect(parsed.savedAt).toBeDefined();
      });

      it('セッション完了時に中断セッションが削除される', () => {
        const { result } = renderHook(() =>
          useSession({ enableAutoSave: true })
        );

        act(() => {
          result.current.setTotalRounds(1);
          result.current.startSession();
          result.current.completeWriting('テスト');
        });

        // 中断セッションが保存されている
        expect(
          localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)
        ).not.toBeNull();

        act(() => {
          result.current.completeReview({
            originalText: 'テスト',
            addition: '',
            mergedText: 'テスト',
          });
        });

        // 完了後、中断セッションは削除される
        expect(
          localStorage.getItem(STORAGE_KEYS.INTERRUPTED_SESSION)
        ).toBeNull();
      });
    });
  });
});
