import type { PrivacyPolicyProps } from '../../types/adsense';
import './PrivacyPolicy.css';

/**
 * プライバシーポリシーページコンポーネント
 * - Google AdSenseに関する説明
 * - Cookie使用に関する説明
 * - 第三者への情報提供に関する説明
 * - お問い合わせ方法
 */
export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="privacy-policy">
      <header className="privacy-policy__header">
        <button
          type="button"
          className="privacy-policy__back-button"
          onClick={onBack}
        >
          ← 戻る
        </button>
        <h1>プライバシーポリシー</h1>
      </header>

      <main className="privacy-policy__content">
        <section>
          <h2>広告について</h2>
          <p>
            当サイトでは、第三者配信の広告サービス（Google
            AdSense）を利用しています。
            広告配信事業者は、ユーザーの興味に応じた広告を表示するために
            Cookie（クッキー）を使用することがあります。
          </p>
          <p>
            Cookieを無効にする設定およびGoogleアドセンスに関する詳細は、
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
            >
              広告 – ポリシーと規約 – Google
            </a>
            をご覧ください。
          </p>
        </section>

        <section>
          <h2>アクセス解析ツールについて</h2>
          <p>
            当サイトでは、Googleによるアクセス解析ツールを使用する場合があります。
            このツールはトラフィックデータの収集のためにCookieを使用しています。
            このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          </p>
        </section>

        <section>
          <h2>免責事項</h2>
          <p>
            当サイトからリンクやバナーなどによって他のサイトに移動された場合、
            移動先サイトで提供される情報、サービス等について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2>お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、GitHubリポジトリのIssueよりお願いいたします。
          </p>
        </section>

        <p className="privacy-policy__updated">最終更新日: 2026年1月</p>
      </main>
    </div>
  );
}
