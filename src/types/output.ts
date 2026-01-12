/**
 * セッションのメモデータ
 */
export interface Memo {
  /** ラウンド番号（1から始まる） */
  round: number;
  /** メモの内容（空文字列の場合あり） */
  text: string;
}

/**
 * OutputResult コンポーネントの Props
 */
export interface OutputResultProps {
  /** セッション中に書き出されたメモの配列 */
  memos: Memo[];
  /** 新しいセッション開始時のコールバック */
  onStartNewSession: () => void;
  /** カスタムスタイル用クラス名 */
  className?: string;
}

/**
 * MemoList コンポーネントの Props
 */
export interface MemoListProps {
  /** 表示するメモの配列 */
  memos: Memo[];
  /** メモ編集時のコールバック */
  onMemoChange?: (round: number, text: string) => void;
}

/**
 * CopyButton コンポーネントの Props
 */
export interface CopyButtonProps {
  /** コピー対象のテキスト */
  textToCopy: string;
  /** コピー完了時のコールバック */
  onCopySuccess?: () => void;
}

/**
 * AIGuidance コンポーネントの Props
 */
export interface AIGuidanceProps {
  /** コピー完了フラグ（強調表示用） */
  hasCopied: boolean;
}

/**
 * NewSessionButton コンポーネントの Props
 */
export interface NewSessionButtonProps {
  /** クリック時のコールバック */
  onClick: () => void;
}

/**
 * useClipboard フックのオプション
 */
export interface UseClipboardOptions {
  /** コピー成功表示の持続時間（ms）。デフォルト: 3000 */
  successDuration?: number;
}

/**
 * useClipboard フックの戻り値
 */
export interface UseClipboardReturn {
  /** コピー成功フラグ */
  copied: boolean;
  /** エラーフラグ */
  error: boolean;
  /** エラーメッセージ */
  errorMessage: string | null;
  /** クリップボードにコピーする関数 */
  copyToClipboard: (text: string) => Promise<boolean>;
  /** 状態をリセットする関数 */
  reset: () => void;
}

/**
 * デフォルト値
 */
export const DEFAULT_SUCCESS_DURATION = 3000;
export const EMPTY_MEMO_PLACEHOLDER = '（未入力）';

/**
 * メモ配列をクリップボード用テキストにフォーマット
 */
export function formatMemosForClipboard(memos: Memo[]): string {
  return memos
    .map((memo) => {
      const content = memo.text.trim() || EMPTY_MEMO_PLACEHOLDER;
      return `# Round${memo.round}\n\n${content}`;
    })
    .join('\n\n');
}

/**
 * 入力されたメモ数をカウント（空でないもの）
 */
export function countFilledMemos(memos: Memo[]): number {
  return memos.filter((memo) => memo.text.trim() !== '').length;
}
