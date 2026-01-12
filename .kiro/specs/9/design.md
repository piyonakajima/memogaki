# Technical Design Document

## 概要

Google AdSense統合機能の技術設計。フッターへの広告配置、プライバシーポリシーページ、および関連コンポーネントの実装方針を定義する。

---

## アーキテクチャ

### コンポーネント構成

```
src/
├── components/
│   ├── Footer/                    # 新規: フッターコンポーネント
│   │   ├── Footer.tsx
│   │   ├── Footer.css
│   │   ├── Footer.test.tsx
│   │   └── index.ts
│   ├── AdBanner/                  # 新規: 広告バナーコンポーネント
│   │   ├── AdBanner.tsx
│   │   ├── AdBanner.css
│   │   ├── AdBanner.test.tsx
│   │   └── index.ts
│   └── PrivacyPolicy/             # 新規: プライバシーポリシーページ
│       ├── PrivacyPolicy.tsx
│       ├── PrivacyPolicy.css
│       ├── PrivacyPolicy.test.tsx
│       └── index.ts
├── config/                        # 新規: 設定ファイル
│   └── adsense.ts
├── types/
│   └── adsense.ts                 # 新規: AdSense関連型定義
└── App.tsx                        # 修正: ルーティング追加
```

### データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ route: 'app' | 'privacy'                            │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────┐          ┌─────────────────────┐       │
│  │ SessionManager  │          │   PrivacyPolicy     │       │
│  │ / OutputResult  │          │                     │       │
│  └─────────────────┘          └─────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                     Footer                          │    │
│  │  ┌──────────────────┐  ┌─────────────────────┐     │    │
│  │  │    AdBanner      │  │   Privacy Link      │     │    │
│  │  └──────────────────┘  └─────────────────────┘     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 詳細設計

### 1. AdSense設定 (`src/config/adsense.ts`)

```typescript
/**
 * AdSense設定
 * 環境変数またはデフォルト値から設定を読み込む
 */
export interface AdSenseConfig {
  /** パブリッシャーID (ca-pub-XXXXXXXXXXXXXXXX) */
  publisherId: string;
  /** 広告スロットID */
  slotId: string;
  /** 広告を有効化するかどうか */
  enabled: boolean;
  /** テストモード */
  testMode: boolean;
}

export const adsenseConfig: AdSenseConfig = {
  publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '',
  slotId: import.meta.env.VITE_ADSENSE_SLOT_ID || '',
  enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
  testMode: import.meta.env.DEV || import.meta.env.VITE_ADSENSE_TEST_MODE === 'true',
};
```

### 2. 型定義 (`src/types/adsense.ts`)

```typescript
/**
 * AdBannerコンポーネントのProps
 */
export interface AdBannerProps {
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 広告読み込み状態
 */
export type AdLoadState = 'loading' | 'loaded' | 'error' | 'blocked';

/**
 * Footerコンポーネントのprops
 */
export interface FooterProps {
  /** プライバシーポリシーリンククリック時のコールバック */
  onPrivacyClick: () => void;
  /** 広告を表示するかどうか */
  showAd?: boolean;
}
```

### 3. AdBannerコンポーネント (`src/components/AdBanner/AdBanner.tsx`)

```typescript
import { useEffect, useState, useRef } from 'react';
import { adsenseConfig } from '../../config/adsense';
import type { AdLoadState } from '../../types/adsense';
import './AdBanner.css';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({ className }: { className?: string }) {
  const [loadState, setLoadState] = useState<AdLoadState>('loading');
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // 広告が無効の場合は何もしない
    if (!adsenseConfig.enabled || !adsenseConfig.publisherId) {
      setLoadState('error');
      return;
    }

    // 重複初期化を防ぐ
    if (initialized.current) return;
    initialized.current = true;

    // 広告ブロッカー検出のタイムアウト
    const timeout = setTimeout(() => {
      if (loadState === 'loading') {
        setLoadState('blocked');
      }
    }, 3000);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }

    return () => clearTimeout(timeout);
  }, []);

  // エラーまたはブロック時は何も表示しない
  if (loadState === 'error' || loadState === 'blocked') {
    return null;
  }

  return (
    <div className={`ad-banner ${className || ''}`}>
      <ins
        ref={adRef}
        className="adsbygoogle ad-banner__unit"
        style={{ display: 'block' }}
        data-ad-client={adsenseConfig.publisherId}
        data-ad-slot={adsenseConfig.slotId}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
        {...(adsenseConfig.testMode && { 'data-adtest': 'on' })}
      />
    </div>
  );
}
```

### 4. Footerコンポーネント (`src/components/Footer/Footer.tsx`)

```typescript
import { AdBanner } from '../AdBanner';
import { adsenseConfig } from '../../config/adsense';
import type { FooterProps } from '../../types/adsense';
import './Footer.css';

export function Footer({ onPrivacyClick, showAd = true }: FooterProps) {
  return (
    <footer className="footer">
      {showAd && adsenseConfig.enabled && (
        <div className="footer__ad-container">
          <AdBanner />
        </div>
      )}
      <div className="footer__links">
        <button
          type="button"
          className="footer__privacy-link"
          onClick={onPrivacyClick}
        >
          プライバシーポリシー
        </button>
      </div>
    </footer>
  );
}
```

### 5. Footerスタイル (`src/components/Footer/Footer.css`)

```css
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  z-index: 100;
}

.footer__ad-container {
  max-width: var(--max-width-content);
  margin: 0 auto;
  min-height: 50px;
  max-height: 60px;
  overflow: hidden;
}

.footer__links {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xs);
  background-color: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
}

.footer__privacy-link {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.footer__privacy-link:hover {
  color: var(--color-text-secondary);
}

.footer__privacy-link:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* フッター分のスペース確保用 */
:root {
  --footer-height: 80px;
}
```

### 6. PrivacyPolicyコンポーネント (`src/components/PrivacyPolicy/PrivacyPolicy.tsx`)

```typescript
import './PrivacyPolicy.css';

interface PrivacyPolicyProps {
  onBack: () => void;
}

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
            当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。
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
            本ポリシーに関するお問い合わせは、サイト内のお問い合わせフォームまたは
            GitHubリポジトリのIssueよりお願いいたします。
          </p>
        </section>

        <p className="privacy-policy__updated">最終更新日: 2026年1月</p>
      </main>
    </div>
  );
}
```

### 7. App.tsx修正

```typescript
import { useState, useCallback } from 'react';
import { SessionManager } from './components/SessionManager';
import { OutputResult } from './components/OutputResult';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import type { Memo as SessionMemo } from './types/session';
import type { Memo as OutputMemo } from './types/output';

type AppMode = 'session' | 'result';
type Route = 'app' | 'privacy';

function convertToOutputMemos(sessionMemos: SessionMemo[]): OutputMemo[] {
  return sessionMemos.map((memo) => ({
    round: memo.round,
    text: memo.mergedText,
  }));
}

function App() {
  const [mode, setMode] = useState<AppMode>('session');
  const [route, setRoute] = useState<Route>('app');
  const [memos, setMemos] = useState<OutputMemo[]>([]);

  const handleSessionComplete = useCallback((sessionMemos: SessionMemo[]) => {
    const outputMemos = convertToOutputMemos(sessionMemos);
    setMemos(outputMemos);
    setMode('result');
  }, []);

  const handleStartNewSession = useCallback(() => {
    setMemos([]);
    setMode('session');
  }, []);

  const handlePrivacyClick = useCallback(() => {
    setRoute('privacy');
  }, []);

  const handleBackFromPrivacy = useCallback(() => {
    setRoute('app');
  }, []);

  // プライバシーポリシーページ
  if (route === 'privacy') {
    return (
      <div className="app">
        <PrivacyPolicy onBack={handleBackFromPrivacy} />
      </div>
    );
  }

  // メインアプリ
  return (
    <div className="app app--with-footer">
      {mode === 'session' && (
        <SessionManager onSessionComplete={handleSessionComplete} />
      )}

      {mode === 'result' && (
        <OutputResult
          memos={memos}
          onStartNewSession={handleStartNewSession}
        />
      )}

      <Footer onPrivacyClick={handlePrivacyClick} />
    </div>
  );
}

export default App;
```

### 8. index.html修正

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>瞬発思考</title>
    <!-- Google AdSense -->
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
      crossorigin="anonymous"
    ></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 環境変数

### `.env.example`

```env
# Google AdSense Configuration
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_ID=XXXXXXXXXX
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_TEST_MODE=false
```

### 環境別設定

| 環境 | ENABLED | TEST_MODE | 説明 |
|------|---------|-----------|------|
| 開発 (dev) | false | - | 広告非表示 |
| ステージング | true | true | テスト広告表示 |
| 本番 | true | false | 本番広告表示 |

---

## スタイル設計

### global.css追記

```css
/* フッター対応のパディング */
.app--with-footer {
  padding-bottom: calc(var(--footer-height) + var(--spacing-lg));
}
```

### レスポンシブ対応

```css
/* AdBanner.css */
.ad-banner__unit {
  width: 100%;
  height: auto;
  min-height: 50px;
}

@media (max-width: 768px) {
  .footer__ad-container {
    min-height: 50px;
  }
}

@media (min-width: 769px) {
  .footer__ad-container {
    min-height: 60px;
  }
}
```

---

## テスト方針

### ユニットテスト

| コンポーネント | テスト内容 |
|---------------|-----------|
| AdBanner | 設定無効時にnullを返す、DOM要素の属性確認 |
| Footer | リンククリックでコールバック呼び出し、広告表示/非表示切り替え |
| PrivacyPolicy | 戻るボタンのコールバック、コンテンツ表示確認 |

### 統合テスト

- App.tsxでのルーティング動作確認
- プライバシーリンク → ポリシーページ → 戻るの遷移

### 手動テスト

- 広告ブロッカー有効時の動作
- 各デバイスサイズでの広告表示
- AdSenseポリシー準拠確認

---

## 要件トレーサビリティ

| 要件ID | 設計要素 |
|--------|----------|
| FR-1.1 | index.html AdSenseスクリプト |
| FR-1.2 | src/config/adsense.ts 環境変数 |
| FR-1.3 | script async属性 |
| FR-2.1 | Footer + AdBanner (position: fixed) |
| FR-2.2 | data-ad-format="horizontal" |
| FR-2.3 | adsenseConfig.slotId |
| FR-2.4 | .footer__ad-container min-height |
| FR-2.5 | AdBanner loadState → null返却 |
| FR-3.1 | PrivacyPolicy コンポーネント |
| FR-3.2 | Footer__privacy-link |
| FR-3.3 | App.tsx route state |
| FR-3.4 | PrivacyPolicy コンテンツ |
| FR-4.1 | Footer コンポーネント |
| FR-4.2 | Footer (AdBanner + link) |
| FR-4.3 | .footer position: fixed |
| FR-4.4 | .app--with-footer padding-bottom |
| NFR-5.3 | adsenseConfig.enabled |
| NFR-6.1 | CSS変数使用 |

---

## 実装上の注意点

1. **AdSenseポリシー準拠**
   - 広告の近くにクリック誘導要素を配置しない
   - 広告とコンテンツを明確に区別する

2. **パフォーマンス**
   - AdSenseスクリプトはasyncで読み込み
   - 広告コンポーネントの重複初期化を防ぐ

3. **GitHub Pages対応**
   - React Routerを使わず、シンプルなstate管理でルーティング
   - ハッシュルーティング不要（SPAとして完結）

4. **広告ブロッカー対応**
   - タイムアウトで検出し、UIを崩さない
   - 空白領域を残さない

---

## 次のステップ

1. **レビュー**: この設計ドキュメントを確認し、修正・追加があればお知らせください
2. **承認後**: `/kiro:spec-tasks 9` でタスク一覧を生成
