import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('表示', () => {
    it('初期状態で残り秒数を表示する', () => {
      render(<Timer />);

      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('initialSecondsで指定した秒数を表示する', () => {
      render(<Timer initialSeconds={30} />);

      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('残り秒数が大きなフォントで表示される', () => {
      render(<Timer />);

      const display = screen.getByTestId('timer-display');
      // CSSクラスが適用されていることを確認
      expect(display).toHaveClass('timer-display');
    });
  });

  describe('開始ボタン', () => {
    it('idle状態で開始ボタンが表示される', () => {
      render(<Timer />);

      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });

    it('開始ボタンをクリックするとカウントダウンが始まる', () => {
      render(<Timer />);

      const startButton = screen.getByRole('button', { name: '開始' });
      fireEvent.click(startButton);

      expect(screen.getByText('20')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('19')).toBeInTheDocument();
    });

    it('running状態では開始ボタンが表示されない', () => {
      render(<Timer />);

      const startButton = screen.getByRole('button', { name: '開始' });
      fireEvent.click(startButton);

      expect(
        screen.queryByRole('button', { name: '開始' })
      ).not.toBeInTheDocument();
    });
  });

  describe('停止/再開ボタン', () => {
    it('running状態で停止ボタンが表示される', () => {
      render(<Timer />);

      const startButton = screen.getByRole('button', { name: '開始' });
      fireEvent.click(startButton);

      expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument();
    });

    it('停止ボタンをクリックするとカウントダウンが一時停止する', () => {
      render(<Timer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('18')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByText('18')).toBeInTheDocument(); // 変わらない
    });

    it('paused状態で再開ボタンが表示される', () => {
      render(<Timer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));
      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();
    });

    it('再開ボタンをクリックするとカウントダウンが再開する', () => {
      render(<Timer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      expect(screen.getByText('18')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '再開' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('16')).toBeInTheDocument();
    });
  });

  describe('リセットボタン', () => {
    it('idle状態ではリセットボタンが無効化される', () => {
      render(<Timer />);

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      expect(resetButton).toBeDisabled();
    });

    it('running状態でリセットボタンが有効になる', () => {
      render(<Timer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      expect(resetButton).not.toBeDisabled();
    });

    it('リセットボタンをクリックすると初期状態に戻る', () => {
      render(<Timer initialSeconds={15} />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('10')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'リセット' }));

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });
  });

  describe('警告表示', () => {
    it('残り5秒以下で警告スタイルが適用される', () => {
      render(<Timer initialSeconds={7} />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('6')).toBeInTheDocument();

      const display = screen.getByTestId('timer-display');
      expect(display).not.toHaveClass('warning');

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(display).toHaveClass('warning');
    });
  });

  describe('タイマー終了', () => {
    it('0秒に達したらonCompleteコールバックが呼ばれる', () => {
      const onComplete = vi.fn();
      render(<Timer initialSeconds={2} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('completed状態でリセットボタンが有効', () => {
      render(<Timer initialSeconds={2} />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const resetButton = screen.getByRole('button', { name: 'リセット' });
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('カスタムスタイル', () => {
    it('classNameプロパティでカスタムクラスを適用できる', () => {
      render(<Timer className="my-custom-timer" />);

      const container = screen.getByTestId('timer-container');
      expect(container).toHaveClass('my-custom-timer');
    });
  });
});
