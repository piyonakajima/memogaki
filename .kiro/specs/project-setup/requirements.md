# Requirements Document

## Introduction

「瞬発思考」アプリの開発基盤を構築するための初期セットアップ要件。本フェーズでは、React + TypeScript環境の構築、GitHub Pagesへのデプロイ設定、コード品質管理ツールの導入を行い、以降の機能開発をスムーズに進められる土台を整える。

## Requirements

### Requirement 1: React + TypeScript開発環境

**Objective:** 開発者として、モダンなReact + TypeScript開発環境を構築したい。これにより、型安全で保守性の高いコードを効率的に開発できる。

#### Acceptance Criteria

1. WHEN 開発者が `npm create vite@latest` を実行する THEN プロジェクトセットアップ SHALL React + TypeScriptテンプレートでプロジェクトを初期化する
2. WHEN プロジェクトが初期化される THEN プロジェクトセットアップ SHALL TypeScript 5.x以上を使用する
3. WHEN プロジェクトが初期化される THEN プロジェクトセットアップ SHALL React 18.x以上を使用する
4. WHEN 開発者が `npm run dev` を実行する THEN Vite開発サーバー SHALL ホットリロード機能を有効にしてローカルサーバーを起動する
5. WHEN TypeScriptファイルに型エラーがある THEN ビルドプロセス SHALL コンパイルエラーを報告する

### Requirement 2: GitHub Pagesデプロイ設定

**Objective:** 開発者として、GitHub Pagesへ自動デプロイできる設定を整えたい。これにより、コードをプッシュするだけで本番環境に反映できる。

#### Acceptance Criteria

1. WHEN 開発者が `npm run build` を実行する THEN ビルドプロセス SHALL GitHub Pages向けに最適化された静的ファイルを `dist/` ディレクトリに出力する
2. WHEN ビルドが完了する THEN 出力ファイル SHALL 相対パスでアセットを参照する（GitHub Pagesのサブディレクトリ対応）
3. WHEN `vite.config.ts` が設定される THEN ビルド設定 SHALL `base` オプションにリポジトリ名を含むパスを設定する
4. WHEN mainブランチにプッシュされる THEN GitHub Actions SHALL 自動的にビルドとデプロイを実行する
5. WHEN デプロイが完了する THEN アプリケーション SHALL `https://<username>.github.io/<repo-name>/` でアクセス可能になる

### Requirement 3: ディレクトリ構成

**Objective:** 開発者として、拡張性のある標準的なディレクトリ構成を持ちたい。これにより、機能追加時にコードの配置場所が明確になる。

#### Acceptance Criteria

1. WHEN プロジェクトが初期化される THEN ディレクトリ構成 SHALL `src/` 配下にソースコードを配置する
2. WHEN コンポーネントを追加する THEN ディレクトリ構成 SHALL `src/components/` にReactコンポーネントを配置する
3. WHEN ページを追加する THEN ディレクトリ構成 SHALL `src/pages/` にページコンポーネントを配置する
4. WHEN カスタムフックを追加する THEN ディレクトリ構成 SHALL `src/hooks/` にカスタムフックを配置する
5. WHEN ユーティリティ関数を追加する THEN ディレクトリ構成 SHALL `src/utils/` にユーティリティを配置する
6. WHEN 型定義を追加する THEN ディレクトリ構成 SHALL `src/types/` に共通型定義を配置する
7. WHEN スタイルを追加する THEN ディレクトリ構成 SHALL `src/styles/` にグローバルスタイルを配置する

### Requirement 4: ESLint設定

**Objective:** 開発者として、コード品質を自動的にチェックしたい。これにより、一貫性のあるコードスタイルを維持し、潜在的なバグを早期に発見できる。

#### Acceptance Criteria

1. WHEN プロジェクトが初期化される THEN ESLint設定 SHALL TypeScript対応のESLint設定を含む
2. WHEN プロジェクトが初期化される THEN ESLint設定 SHALL React Hooks用のルールを含む（eslint-plugin-react-hooks）
3. WHEN 開発者が `npm run lint` を実行する THEN ESLint SHALL `src/` 配下の全ファイルをチェックする
4. WHEN リントエラーがある THEN ESLint SHALL エラー箇所と修正方法を報告する
5. WHEN 自動修正可能なエラーがある AND 開発者が `npm run lint:fix` を実行する THEN ESLint SHALL 自動的にコードを修正する

### Requirement 5: Prettier設定

**Objective:** 開発者として、コードフォーマットを自動化したい。これにより、スタイルの議論を排除し、一貫したコード整形を実現できる。

#### Acceptance Criteria

1. WHEN プロジェクトが初期化される THEN Prettier設定 SHALL `.prettierrc` または `prettier.config.js` を含む
2. WHEN Prettierが設定される THEN フォーマット設定 SHALL シングルクォートを使用する
3. WHEN Prettierが設定される THEN フォーマット設定 SHALL セミコロンを使用する
4. WHEN Prettierが設定される THEN フォーマット設定 SHALL インデント幅2スペースを使用する
5. WHEN 開発者が `npm run format` を実行する THEN Prettier SHALL `src/` 配下の全ファイルをフォーマットする
6. WHEN ESLintとPrettierが同時に使用される THEN 設定 SHALL ルールの競合を解消する（eslint-config-prettier）

### Requirement 6: 開発スクリプト

**Objective:** 開発者として、よく使うコマンドをnpmスクリプトとして利用したい。これにより、開発作業を効率化できる。

#### Acceptance Criteria

1. WHEN package.jsonが設定される THEN スクリプト SHALL `dev`（開発サーバー起動）を含む
2. WHEN package.jsonが設定される THEN スクリプト SHALL `build`（本番ビルド）を含む
3. WHEN package.jsonが設定される THEN スクリプト SHALL `preview`（ビルド結果プレビュー）を含む
4. WHEN package.jsonが設定される THEN スクリプト SHALL `lint`（ESLintチェック）を含む
5. WHEN package.jsonが設定される THEN スクリプト SHALL `format`（Prettierフォーマット）を含む
6. WHEN package.jsonが設定される THEN スクリプト SHALL `type-check`（TypeScript型チェック）を含む
