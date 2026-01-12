# Google AdSense 設定手順書

このドキュメントでは、memogaki（瞬発思考）アプリにGoogle AdSenseを設定する手順を説明します。

## 前提条件

- Google アカウントを持っていること
- 独自ドメインまたはGitHub Pagesでサイトを公開していること
- サイトにある程度のコンテンツがあること（審査通過のため）

---

## 1. Google AdSense アカウントの作成

### 1.1 AdSenseに申し込む

1. [Google AdSense](https://www.google.com/adsense/) にアクセス
2. 「ご利用開始」をクリック
3. Googleアカウントでログイン
4. 以下の情報を入力：
   - **サイトのURL**: `https://your-domain.com` または `https://username.github.io/memogaki`
   - **メールアドレス**: 通知を受け取るアドレス
   - **国/地域**: 日本

### 1.2 サイトの所有権確認

AdSenseから提供されるコードをサイトに追加して所有権を確認します。

> **注意**: このアプリでは既に `index.html` にAdSenseスクリプトのプレースホルダーが設置済みです。
> パブリッシャーIDを実際の値に置き換えてデプロイすることで確認できます。

### 1.3 審査を待つ

- 審査には数日〜2週間かかることがあります
- 審査中はサイトを正常に運用してください
- 承認されるとメールで通知が届きます

---

## 2. 広告ユニットの作成

### 2.1 AdSense管理画面にログイン

1. [AdSense管理画面](https://www.google.com/adsense/) にログイン
2. 左メニューから「広告」→「広告ユニット別」を選択

### 2.2 ディスプレイ広告ユニットを作成

1. 「ディスプレイ広告」をクリック
2. 以下を設定：
   - **広告ユニット名**: `memogaki-footer`（任意の名前）
   - **広告サイズ**: 「レスポンシブ」を選択
   - **広告の形状**: 「横長」を選択（フッター向け）
3. 「作成」をクリック

### 2.3 広告コードを確認

作成後に表示されるコードから以下を取得：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"></script>
```

- **パブリッシャーID**: `ca-pub-XXXXXXXXXXXXXXXX`（ca-pub-から始まる16桁の数字）

```html
<ins class="adsbygoogle"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
```

- **スロットID**: `data-ad-slot` の値（10桁程度の数字）

---

## 3. 環境変数の設定

### 3.1 ローカル開発環境

1. `.env.sample` をコピーして `.env` を作成：

```bash
cp .env.sample .env
```

2. `.env` を編集：

```env
# Google AdSense Configuration
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_ID=XXXXXXXXXX
VITE_ADSENSE_ENABLED=false
VITE_ADSENSE_TEST_MODE=true
```

> **開発環境では `ENABLED=false` を推奨**: 開発中は広告を表示しないことで、無効なクリックやインプレッションを防ぎます。

### 3.2 本番環境（GitHub Pages）

GitHub Actionsで環境変数を設定する場合：

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」で以下を追加：

| Name | Value |
|------|-------|
| `VITE_ADSENSE_PUBLISHER_ID` | `ca-pub-XXXXXXXXXXXXXXXX` |
| `VITE_ADSENSE_SLOT_ID` | `XXXXXXXXXX` |
| `VITE_ADSENSE_ENABLED` | `true` |
| `VITE_ADSENSE_TEST_MODE` | `false` |

3. ワークフローファイル（`.github/workflows/deploy.yml`）で環境変数を使用：

```yaml
- name: Build
  run: npm run build
  env:
    VITE_ADSENSE_PUBLISHER_ID: ${{ secrets.VITE_ADSENSE_PUBLISHER_ID }}
    VITE_ADSENSE_SLOT_ID: ${{ secrets.VITE_ADSENSE_SLOT_ID }}
    VITE_ADSENSE_ENABLED: ${{ secrets.VITE_ADSENSE_ENABLED }}
    VITE_ADSENSE_TEST_MODE: ${{ secrets.VITE_ADSENSE_TEST_MODE }}
```

---

## 4. index.html の更新

`index.html` の `<head>` セクションにあるAdSenseスクリプトのパブリッシャーIDを更新：

```html
<!-- Google AdSense -->
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous"
></script>
```

`ca-pub-XXXXXXXXXXXXXXXX` を実際のパブリッシャーIDに置き換えてください。

---

## 5. デプロイと確認

### 5.1 ローカルでの確認

```bash
# 本番ビルドを作成
npm run build

# プレビュー
npm run preview
```

### 5.2 本番デプロイ

```bash
git add .
git commit -m "feat: configure AdSense credentials"
git push origin main
```

### 5.3 広告表示の確認

1. デプロイ完了後、本番サイトにアクセス
2. フッター部分に広告が表示されることを確認
3. プライバシーポリシーページが正しく表示されることを確認

---

## トラブルシューティング

### 広告が表示されない

| 原因 | 対処法 |
|------|--------|
| AdSense審査中 | 審査完了を待つ |
| 環境変数が未設定 | `.env` の設定を確認 |
| `ENABLED=false` | 本番では `true` に設定 |
| 広告ブロッカー | ブラウザの広告ブロッカーを無効化 |
| キャッシュ | ブラウザのキャッシュをクリア |

### コンソールエラーが出る

- `adsbygoogle.push() error`: AdSenseスクリプトが読み込まれる前に広告を初期化しようとしている。ページリロードで解消することが多い。

### 審査に落ちた

- コンテンツ量を増やす
- プライバシーポリシーが表示されていることを確認
- サイトが正常に動作していることを確認
- 再申請する

---

## 環境変数一覧

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_ADSENSE_PUBLISHER_ID` | AdSenseパブリッシャーID | `ca-pub-1234567890123456` |
| `VITE_ADSENSE_SLOT_ID` | 広告ユニットのスロットID | `1234567890` |
| `VITE_ADSENSE_ENABLED` | 広告を有効化するか | `true` / `false` |
| `VITE_ADSENSE_TEST_MODE` | テスト広告を表示するか | `true` / `false` |

---

## 関連リンク

- [Google AdSense ヘルプ](https://support.google.com/adsense/)
- [AdSense プログラム ポリシー](https://support.google.com/adsense/answer/48182)
- [広告 – ポリシーと規約 – Google](https://policies.google.com/technologies/ads?hl=ja)
