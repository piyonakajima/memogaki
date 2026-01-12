# Technology Stack

## アーキテクチャ

- **フロントエンド完結型**: バックエンド不要のSPA構成
- **静的ホスティング**: GitHub Pages でデプロイ
- **データ保存**: localStorage（ブラウザ内保存）

## フレームワーク・ライブラリ

### コア

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | ^18.3.1 | UIフレームワーク |
| TypeScript | ~5.6.2 | 型安全な開発 |
| Vite | ^6.0.7 | ビルドツール・開発サーバー |

### テスト

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vitest | ^4.0.16 | テストランナー |
| @testing-library/react | ^16.3.1 | Reactコンポーネントテスト |
| @testing-library/jest-dom | ^6.9.1 | カスタムマッチャー |
| happy-dom | ^20.1.0 | DOM環境 |

### コード品質

| 技術 | バージョン | 用途 |
|------|-----------|------|
| ESLint | ^9.39.2 | コード静的解析 |
| Prettier | ^3.7.4 | コードフォーマット |
| typescript-eslint | ^8.52.0 | TypeScript用ESLintルール |
| eslint-plugin-react-hooks | ^7.0.1 | React Hooks ルール |

## 開発環境

### 必要ツール

- Node.js 20.x
- npm

### 開発サーバー

```bash
npm run dev
```

- ポート: 5173（Viteデフォルト）
- ホットリロード対応

## よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果プレビュー |
| `npm run test` | テスト実行（watchモード） |
| `npm run test:run` | テスト実行（単発） |
| `npm run lint` | ESLint実行 |
| `npm run lint:fix` | ESLint自動修正 |
| `npm run format` | Prettier実行 |
| `npm run format:check` | Prettierチェック |
| `npm run type-check` | TypeScript型チェック |

## ビルド・デプロイ

### ビルド設定

```typescript
// vite.config.ts
{
  base: '/memogaki/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}
```

### CI/CD

- **GitHub Actions**: `main` ブランチへのpushで自動デプロイ
- **デプロイ先**: GitHub Pages
- **ワークフロー**: `.github/workflows/deploy.yml`

### デプロイフロー

1. `main` ブランチにpush
2. GitHub Actions が `npm ci && npm run build` を実行
3. `dist/` を GitHub Pages にデプロイ

## テスト設定

```typescript
// vite.config.ts (test section)
{
  globals: true,
  environment: 'happy-dom',
  setupFiles: ['./src/test/setup.ts'],
}
```

## TypeScript設定

- **ターゲット**: ES2020
- **モジュール**: ESNext (bundler mode)
- **Strict Mode**: 有効
- **未使用変数チェック**: 有効

## コーディング規約

- ESLint + Prettier による自動フォーマット
- React Hooks ルールの遵守
- TypeScript strict mode 準拠
