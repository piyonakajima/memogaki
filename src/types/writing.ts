/**
 * WritingMode コンポーネントの Props
 */
export interface WritingModeProps {
  /** タイマー初期秒数（デフォルト: 20） */
  initialSeconds?: number;
  /** 初期テキスト */
  initialText?: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 自動開始フラグ */
  autoStart?: boolean;
  /** テキスト変更時コールバック */
  onChange?: (text: string) => void;
  /** 書き出し完了時コールバック（タイマー終了時） */
  onComplete?: (text: string) => void;
  /** カスタムスタイル用クラス名 */
  className?: string;
}

/**
 * デフォルト値
 */
export const DEFAULT_PLACEHOLDER = '頭に浮かんだことを書いてみましょう...';
export const DEFAULT_INITIAL_SECONDS = 20;
