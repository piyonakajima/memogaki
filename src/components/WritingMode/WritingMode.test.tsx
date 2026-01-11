import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WritingMode } from './WritingMode';

describe('WritingMode Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期表示', () => {
    it('textareaが表示される', () => {
      render(<WritingMode />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('初期状態で空のテキストが表示される', () => {
      render(<WritingMode />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('initialTextが設定されている場合、初期値として表示される', () => {
      render(<WritingMode initialText="初期テキスト" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('初期テキスト');
    });

    it('残り時間が表示される', () => {
      render(<WritingMode />);

      expect(screen.getByTestId('timer-display')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('initialSecondsで指定した秒数が表示される', () => {
      render(<WritingMode initialSeconds={30} />);

      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  describe('プレースホルダー', () => {
    it('デフォルトのプレースホルダーが表示される', () => {
      render(<WritingMode />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute(
        'placeholder',
        '頭に浮かんだことを書いてみましょう...'
      );
    });

    it('カスタムプレースホルダーが表示される', () => {
      render(<WritingMode placeholder="カスタムヒント" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'カスタムヒント');
    });
  });

  describe('テキスト入力', () => {
    it('テキストを入力できる', () => {
      render(<WritingMode />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'テスト入力' } });

      expect(textarea).toHaveValue('テスト入力');
    });

    it('テキスト入力時にonChangeが呼ばれる', () => {
      const onChange = vi.fn();
      render(<WritingMode onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'テスト' } });

      expect(onChange).toHaveBeenCalledWith('テスト');
    });
  });

  describe('autoStart機能', () => {
    it('autoStart=trueでタイマーが自動的に開始される', () => {
      render(<WritingMode autoStart={true} />);

      expect(screen.getByText('20')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('19')).toBeInTheDocument();
    });

    it('autoStart=falseではタイマーが自動開始されない', () => {
      render(<WritingMode autoStart={false} />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  describe('タイマー終了', () => {
    it('タイマーが0秒になるとtextareaが無効化される', () => {
      render(<WritingMode autoStart={true} initialSeconds={2} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toBeDisabled();

      // 1秒ずつ進めて状態を確認
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('1')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('タイマー終了時にonCompleteが入力テキスト付きで呼ばれる', () => {
      const onComplete = vi.fn();
      render(
        <WritingMode autoStart={true} initialSeconds={2} onComplete={onComplete} />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '入力したテキスト' } });

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledWith('入力したテキスト');
    });

    it('タイマー終了後は入力できない', () => {
      render(<WritingMode autoStart={true} initialSeconds={2} />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('警告表示', () => {
    it('残り5秒以下で警告スタイルが適用される', () => {
      render(<WritingMode autoStart={true} initialSeconds={7} />);

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

  describe('アクセシビリティ', () => {
    it('textareaにaria-labelが設定される', () => {
      render(<WritingMode />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', '思考を書き出すエリア');
    });

    it('残り5秒以下でaria-live通知エリアが存在する', () => {
      render(<WritingMode autoStart={true} initialSeconds={6} />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('カスタムスタイル', () => {
    it('classNameプロパティでカスタムクラスを適用できる', () => {
      render(<WritingMode className="my-custom-class" />);

      const container = screen.getByTestId('writing-mode-container');
      expect(container).toHaveClass('my-custom-class');
    });
  });
});
