import type { MemoListProps } from '../../../types/output';
import { EMPTY_MEMO_PLACEHOLDER } from '../../../types/output';

/**
 * メモ一覧表示コンポーネント
 * セッション中の全メモをラウンド番号付きで表示
 */
export function MemoList({ memos }: MemoListProps) {
  const filledCount = memos.filter((memo) => memo.text.trim() !== '').length;

  return (
    <div className="memo-list">
      <div className="memo-list__stats">
        <span className="memo-list__stats-text">
          {memos.length}ラウンド中 {filledCount}件入力
        </span>
      </div>

      <ol className="memo-list__items" aria-label="メモ一覧">
        {memos.map((memo) => {
          const isEmpty = memo.text.trim() === '';
          return (
            <li
              key={memo.round}
              className={`memo-list__item ${isEmpty ? 'memo-list__item--empty' : ''}`}
            >
              <span className="memo-list__round">{memo.round}.</span>
              <span className="memo-list__content">
                {isEmpty ? EMPTY_MEMO_PLACEHOLDER : memo.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
