import type { AIGuidanceProps } from '../../../types/output';

/**
 * AIガイダンスコンポーネント
 * AIエージェントへの貼り付けを促すガイダンスを表示
 */
export function AIGuidance({ hasCopied }: AIGuidanceProps) {
  return (
    <div
      className={`ai-guidance ${hasCopied ? 'ai-guidance--highlighted' : ''}`}
    >
      <h3 className="ai-guidance__title">
        {hasCopied ? '次のステップ' : 'AIで深掘りしよう'}
      </h3>

      <p className="ai-guidance__description">
        {hasCopied
          ? 'コピーしたメモをAIエージェントに貼り付けて、思考を整理・発展させましょう。'
          : '上のボタンでメモをコピーして、AIエージェントに貼り付けてみましょう。'}
      </p>

      <div className="ai-guidance__services">
        <span className="ai-guidance__service-label">おすすめ:</span>
        <span className="ai-guidance__service">Claude</span>
        <span className="ai-guidance__service">ChatGPT</span>
      </div>

      <div className="ai-guidance__prompt">
        <span className="ai-guidance__prompt-label">プロンプト例:</span>
        <code className="ai-guidance__prompt-text">
          以下のメモを整理して、共通するテーマや深掘りすべきポイントを教えてください
        </code>
      </div>
    </div>
  );
}
