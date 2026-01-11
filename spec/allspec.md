# 瞬発思考 - Spec一覧

CC-SDDで管理するための機能分割単位。各specは独立して実装可能なサイズに設計。

## Spec一覧

### 1. project-setup
**プロジェクト初期セットアップ**
- React + TypeScript環境構築（Vite）
- GitHub Pages向けビルド設定
- 基本ディレクトリ構成
- ESLint / Prettier設定

### 2. timer-core
**タイマーコア機能**
- 20秒カウントダウンタイマー
- 開始/停止/リセット機能
- 残り時間の大きな表示
- タイマー終了時のコールバック

### 3. writing-mode
**書き出しモード**
- テキスト入力エリア（textarea）
- スマホ対応レスポンシブデザイン
- 入力中のタイマー連携
- プレースホルダーでのヒント表示

### 4. review-mode
**読み返しモード**
- 書いた内容の表示
- 追記機能
- 「次へ」ボタン
- 現在の回数/総回数の表示

### 5. session-flow
**セッション管理**
- 繰り返し回数の設定（デフォルト10回）
- 書き出し→読み返しのモード切替
- セッション進行状態の管理
- セッション完了判定

### 6. output-result
**結果出力機能**
- 全メモの一覧表示
- クリップボードコピー機能
- AIエージェントへの貼り付け案内
- コピー完了フィードバック

### 7. theme-design
**ノート風テーマ・デザイン**
- 黄色い優しい色味のカラーパレット
- ノート風UI（罫線など）
- フォント選定
- 全体レイアウト

### 8. local-storage
**ローカルストレージ保存**
- セッション履歴の保存
- 設定の永続化（繰り返し回数など）
- データ読み込み/書き込み

### 9. adsense-integration
**Google AdSense統合**
- AdSenseスクリプト導入
- 広告配置（常時表示）
- プライバシーポリシー対応

### 10. landing-page
**ランディングページ**
- アプリ紹介セクション
- 使い方説明
- 「始める」ボタン
- OGP/SEO対応

## 推奨実装順序

1. project-setup（土台）
2. theme-design（デザイン基盤）
3. timer-core（コア機能）
4. writing-mode（入力）
5. review-mode（読み返し）
6. session-flow（フロー統合）
7. output-result（出力）
8. local-storage（保存）
9. landing-page（LP）
10. adsense-integration（収益化）

## 備考

- 各specは `.kiro/specs/{spec-name}/` に詳細を配置
- `/kiro:spec-init` で個別に初期化して進める
