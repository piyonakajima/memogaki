/**
 * 読み返しモード（ReviewMode）コンポーネントの型定義
 */

/**
 * ReviewMode完了時に返されるデータ
 */
export interface ReviewModeResult {
  /** 元のテキスト（書き出しモードで入力されたもの） */
  originalText: string;
  /** 追記テキスト */
  addition: string;
  /** 統合されたテキスト */
  mergedText: string;
}

/**
 * ReviewModeコンポーネントのプロパティ
 */
export interface ReviewModeProps {
  /** 表示するテキスト（前のラウンドで書いた内容） */
  text: string;
  /** 現在のラウンド番号（1始まり） */
  currentRound: number;
  /** 総ラウンド数 */
  totalRounds: number;
  /** 最終ラウンドかどうか */
  isLastRound?: boolean;
  /** 追記入力エリアのプレースホルダー */
  additionPlaceholder?: string;
  /** テキストが空の場合のプレースホルダー */
  emptyTextPlaceholder?: string;
  /** 完了時のコールバック（元テキスト、追記、統合テキストを渡す） */
  onComplete?: (result: ReviewModeResult) => void;
  /** 追加のCSSクラス */
  className?: string;
}

/** 追記入力エリアのデフォルトプレースホルダー */
export const DEFAULT_ADDITION_PLACEHOLDER = '追記があればここに...';

/** テキストが空の場合のデフォルトプレースホルダー */
export const DEFAULT_EMPTY_TEXT_PLACEHOLDER = '入力がありませんでした';
