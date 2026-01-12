# Requirements Document

## Introduction

本ドキュメントは、瞬発思考アプリの「ローカルストレージ保存」機能に関する要件を定義する。この機能により、ユーザーのセッション履歴と設定がブラウザのlocalStorageに永続化され、ページ再読み込みやブラウザ再起動後も継続して利用可能になる。

## Requirements

### Requirement 1: セッション履歴の保存

**Objective:** ユーザーとして、完了したセッションの履歴を保存したい。後から振り返りや分析ができるようにするため。

#### Acceptance Criteria

1. WHEN セッションが完了する THEN アプリ SHALL 全メモデータをセッション履歴としてlocalStorageに保存する
2. WHEN セッション履歴を保存する THEN アプリ SHALL 完了日時、ラウンド数、全メモ内容を含める
3. IF localStorageの容量が不足している THEN アプリ SHALL 最も古いセッション履歴から削除して新しいセッションを保存する
4. WHEN ユーザーがアプリを再度開く THEN アプリ SHALL 保存されたセッション履歴を読み込み可能な状態にする

### Requirement 2: 中断セッションの復元

**Objective:** ユーザーとして、途中で中断したセッションを復元したい。ページ離脱や誤ってブラウザを閉じた際にも作業を継続できるようにするため。

#### Acceptance Criteria

1. WHILE セッションが進行中である間 THE アプリ SHALL 現在のセッション状態を定期的にlocalStorageに自動保存する
2. WHEN ユーザーがアプリを開く AND 中断セッションが存在する THEN アプリ SHALL 再開するか新規開始するかの選択肢を表示する
3. WHEN ユーザーが「再開」を選択する THEN アプリ SHALL 中断時点のラウンドとフェーズから正確に復元する
4. WHEN ユーザーが「新規開始」を選択する THEN アプリ SHALL 中断セッションを破棄して新しいセッションを開始する
5. WHEN セッションが完了またはリセットされる THEN アプリ SHALL 中断セッションデータをlocalStorageから削除する

### Requirement 3: ユーザー設定の永続化

**Objective:** ユーザーとして、繰り返し回数などの設定を保存したい。毎回同じ設定を入力する手間を省くため。

#### Acceptance Criteria

1. WHEN ユーザーが繰り返し回数を変更する THEN アプリ SHALL 変更をlocalStorageに保存する
2. WHEN ユーザーがアプリを開く AND 保存された設定が存在する THEN アプリ SHALL 保存された繰り返し回数を初期値として適用する
3. IF 保存された設定が存在しない THEN アプリ SHALL デフォルト値（10回）を使用する
4. WHEN 設定を保存する THEN アプリ SHALL 即座にlocalStorageに書き込む（遅延なし）

### Requirement 4: データの読み込み・書き込み

**Objective:** 開発者として、統一されたlocalStorage操作インターフェースを使用したい。コードの保守性と一貫性を確保するため。

#### Acceptance Criteria

1. WHEN データを保存する THEN アプリ SHALL JSON形式でシリアライズしてlocalStorageに書き込む
2. WHEN データを読み込む THEN アプリ SHALL localStorageからJSONをデシリアライズして型安全なオブジェクトを返す
3. IF localStorageのデータが破損している THEN アプリ SHALL エラーを適切に処理しデフォルト値にフォールバックする
4. IF localStorageが利用不可（プライベートブラウズ等）THEN アプリ SHALL エラーなく動作を継続する（保存は無効）
5. WHEN データを削除する THEN アプリ SHALL 指定されたキーのデータのみを削除し他のデータに影響しない

### Requirement 5: ストレージ容量管理

**Objective:** ユーザーとして、ストレージ容量の問題でアプリが動作しなくなることを避けたい。安定した利用を継続するため。

#### Acceptance Criteria

1. WHEN セッション履歴を保存する THEN アプリ SHALL 最大保存件数（10件）を超えないよう古いものから削除する
2. IF localStorage書き込みでQuotaExceededErrorが発生する THEN アプリ SHALL 古いセッション履歴を削除して再試行する
3. WHILE 再試行しても容量不足が解消しない間 THE アプリ SHALL ユーザーに保存失敗を通知する（アプリ動作は継続）
