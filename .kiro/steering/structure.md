# Project Structure

## ルートディレクトリ

```
memogaki/
├── .github/workflows/    # CI/CD設定
├── .kiro/                # Kiro spec-driven development
│   ├── steering/         # プロジェクト全体の指針
│   └── specs/            # 機能別仕様
├── src/                  # ソースコード
├── public/               # 静的ファイル
├── dist/                 # ビルド出力（gitignore）
├── node_modules/         # 依存関係（gitignore）
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript設定
├── vite.config.ts        # Vite設定（テスト含む）
├── eslint.config.js      # ESLint設定
├── CLAUDE.md             # AI開発指針
└── README.md             # プロジェクト概要
```

## src/ ディレクトリ構造

```
src/
├── components/           # Reactコンポーネント
│   ├── Timer/
│   │   ├── Timer.tsx        # タイマーコンポーネント
│   │   ├── Timer.test.tsx   # タイマーテスト
│   │   ├── Timer.css        # タイマースタイル
│   │   └── index.ts         # エクスポート
│   └── WritingMode/
│       ├── WritingMode.tsx      # 書き出しモードコンポーネント
│       ├── WritingMode.test.tsx # 書き出しモードテスト
│       ├── WritingMode.css      # 書き出しモードスタイル
│       └── index.ts             # エクスポート
├── hooks/                # カスタムフック
│   ├── useTimer.ts          # タイマーフック
│   └── useTimer.test.ts     # タイマーフックテスト
├── types/                # 型定義
│   ├── timer.ts             # タイマー関連型
│   └── writing.ts           # 書き出しモード関連型
├── styles/               # グローバルスタイル
│   └── global.css           # グローバルCSS
├── test/                 # テスト設定
│   └── setup.ts             # Vitestセットアップ
├── App.tsx               # ルートコンポーネント
├── main.tsx              # エントリーポイント
└── vite-env.d.ts         # Vite環境型定義
```

## .kiro/ ディレクトリ構造

```
.kiro/
├── steering/             # プロジェクト全体の指針
│   ├── product.md           # 製品概要
│   ├── tech.md              # 技術スタック
│   └── structure.md         # プロジェクト構造
└── specs/                # 機能別仕様
    ├── project-setup/       # プロジェクトセットアップ ✅完了
    ├── timer-core/          # タイマーコア機能 ✅実装済み
    ├── 3/                   # 書き出しモード
    ├── 4/                   # 読み返しモード
    ├── 5/                   # セッション管理
    └── 6/                   # 結果出力機能
```

## コンポーネント設計パターン

### ディレクトリ構成

各コンポーネントは独自のディレクトリを持ち、以下のファイルで構成：

```
ComponentName/
├── ComponentName.tsx      # メインコンポーネント
├── ComponentName.test.tsx # テストファイル
├── ComponentName.css      # スタイル
└── index.ts               # 名前付きエクスポート
```

### エクスポートパターン

```typescript
// index.ts
export { ComponentName } from './ComponentName';
```

- 名前付きエクスポートを使用
- デフォルトエクスポートは避ける

### カスタムフック

- `hooks/` ディレクトリに配置
- `use` プレフィックスで命名
- 対応するテストファイルを同階層に配置

### 型定義

- `types/` ディレクトリに機能別ファイルで管理
- インターフェースは `Props`, `State`, `Options`, `Return` などのサフィックス使用
- JSDoc コメントで日本語ドキュメント

## ファイル命名規約

| 種類 | 命名規則 | 例 |
|------|---------|-----|
| コンポーネント | PascalCase | `Timer.tsx` |
| フック | camelCase (useプレフィックス) | `useTimer.ts` |
| 型定義 | camelCase | `timer.ts` |
| テスト | `.test.tsx` / `.test.ts` | `Timer.test.tsx` |
| スタイル | コンポーネント名.css | `Timer.css` |
| インデックス | `index.ts` | `index.ts` |

## インポート規約

```typescript
// 1. Reactインポート
import { useState, useEffect } from 'react';

// 2. 外部ライブラリ

// 3. 内部モジュール（相対パス）
import { useTimer } from '../../hooks/useTimer';
import type { TimerProps } from '../../types/timer';

// 4. スタイル
import './Timer.css';
```

## アーキテクチャ原則

1. **コンポーネント分離**: UI表示とロジック（フック）を分離
2. **型安全性**: 全てのPropsと状態に型定義
3. **テスタビリティ**: 各コンポーネント・フックにテスト
4. **コロケーション**: 関連ファイルは同じディレクトリに配置
5. **シンプル性**: 過度な抽象化を避け、必要最小限の設計
