# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.2.0] - 2025-01-XX

### 🚀 実用版への大幅改善

- **1 ファイル完結型**: 複雑な 2 層構造（Tampermonkey + UserScript）を廃止
- **問題解決**: Tampermonkey と UserScript 間の通信問題を根本的に解決
- **簡単インストール**: UserScript のみでの完全動作

### ✨ 新機能

- **設定ダイアログでの API キー設定**: 1 クリックで簡単設定
- **複数の設定方法**: 状況に応じて選択可能な 3 つの設定方法
- **自動リロード**: 設定変更時の自動反映機能
- **リアルタイム状況確認**: API キー設定状況の即座な確認

### 🔧 技術改善

- **getOpenAIApiKey()**: 優先順位付きの安全な API キー取得
- **localStorage 暗号化**: 複数のキー管理方式をサポート
- **エラーハンドリング**: 詳細な設定ガイドとフォールバック機能
- **設定 UI**: 直感的で分かりやすい設定ダイアログ

### 📚 ドキュメント

- **実用版 README**: 使いやすさを重視した説明に刷新
- **設定方法ガイド**: 3 つの設定方法の詳細説明
- **トラブルシューティング**: 実際の問題に基づく解決方法

### ⚠️ 破壊的変更

- **2 層構造の廃止**: tempermonkey.js は不要に
- **API キー管理の変更**: UserScript 内での管理に統一
- **設定方法の変更**: より直感的な方法に変更

### 🐛 修正

- **環境間通信問題**: unsafeWindow での連携失敗を解決
- **API キー取得エラー**: フォールバック機能の強化
- **設定の永続化**: 信頼性の向上

## [7.1.0] - 2025-01-XX

### 🔐 セキュリティ改善

- **API キー分離**: Tampermonkey 環境での安全な管理に移行
- **公開安全性**: UserScript 側から API キーを完全削除
- **エラーハンドリング**: API キー取得時の適切な処理を追加

### ✨ 新機能

- **環境検出**: Tampermonkey 環境の自動検出機能
- **フォールバック**: 緊急時の localStorage 対応（開発用）
- **設定ダイアログ**: API キー状態の可視化

### 🔧 技術改善

- **getOpenAIApiKey()**: 安全な API キー取得関数を追加
- **環境情報**: ランタイム環境の詳細情報提供
- **コンソールログ**: セキュリティ状況の明確な表示

### 📚 ドキュメント

- **README 更新**: セキュリティ重視の設計説明
- **セットアップガイド**: 2 層構造の設定手順
- **トラブルシューティング**: API キー関連エラーの対処法

### ⚠️ 破壊的変更

- **API キー設定**: userscript.js 内での直接設定を廃止
- **必須環境**: Tampermonkey 環境での運用を強く推奨

## [7.0.0] - 2025-01-15

### 🌟 Major New Features

#### OpenAI Web Search Integration

- **NEW**: OpenAI Responses API による最新の Web 検索機能
- リアルタイムでの情報検索とコンテキスト統合
- 引用情報とアノテーション付きの回答
- フォールバック機能（DuckDuckGo 検索）
- 検索コンテキストサイズの選択（Low/Medium/High）
- ユーザー位置情報による地域特化検索

#### Enhanced User Interface

- **NEW**: 直感的な設定ダイアログ
- **NEW**: リアルタイムプログレス表示
- **NEW**: 美しいモダンな UI デザイン
- **NEW**: エラー状況の詳細フィードバック
- 設定の永続化とリアルタイム変更

#### Advanced Error Handling

- **NEW**: 包括的なエラー分類と対処
- **NEW**: 自動リトライ機能
- **NEW**: ユーザーフレンドリーなエラーメッセージ
- **NEW**: タイムアウト管理の改善
- **NEW**: フォールバック戦略の実装

### 🔧 Enhanced Features

#### ChatGPT Integration Improvements

- マルチモーダル対応の改善（テキスト + 画像）
- より詳細なコンテキスト収集
- パフォーマンスの最適化
- 複数外部 URL の並列処理（最大 5 件）
- キャッシュシステムの改善

#### DALL-E Integration Enhancement

- **NEW**: DALL-E 3 完全対応
- **NEW**: 専用 UI ボタンとメニュー
- **NEW**: 画像生成プロセスの可視化
- **NEW**: エラーハンドリングの改善
- 生成画像の自動フォーマット挿入

#### External Content Processing

- HTML 解析の改善（title, description, multiple tags）
- より多くの画像形式をサポート（BMP, TIFF, SVG）
- 外部 URL 取得のタイムアウト管理
- コンテンツ抽出精度の向上

### ⚙️ Configuration & Settings

#### User Settings Management

- **NEW**: 設定の永続化（GM_setValue/GM_getValue）
- **NEW**: デフォルトモデル選択
- **NEW**: 最大トークン数の調整
- **NEW**: Temperature パラメータの調整
- **NEW**: 機能の有効/無効化切り替え
- **NEW**: Web 検索コンテキストサイズの選択

#### Performance Optimization

- **NEW**: キャッシュシステムの実装
- **NEW**: 並列処理による高速化
- **NEW**: メモリ使用量の最適化
- **NEW**: API 呼び出しの効率化
- **NEW**: プログレス表示による体験向上

### 🛡️ Security & Reliability

#### API Management

- **NEW**: 統一された API キー管理
- **NEW**: レート制限の適切な処理
- **NEW**: セキュアな設定保存
- **NEW**: CORS 制限の回避
- タイムアウト設定による安定性向上

#### Error Recovery

- **NEW**: 部分的失敗への対応
- **NEW**: 自動フォールバック機能
- **NEW**: ユーザーへの明確な状況報告
- **NEW**: ログ出力の改善
- 予期しないエラーへの対処

### 🎨 User Experience

#### Interface Improvements

- **NEW**: モダンなプログレス表示
- **NEW**: 設定ダイアログの UX 改善
- **NEW**: アイコンとビジュアルの改善
- **NEW**: 応答フォーマットの向上
- **NEW**: タイムスタンプ付きの結果表示

#### Accessibility

- **NEW**: キーボードナビゲーション対応
- **NEW**: 視覚的フィードバックの改善
- **NEW**: エラー状況の明確な表示
- **NEW**: プロセス状況の可視化
- 使いやすさの全般的向上

### 📚 Documentation

#### Comprehensive Documentation

- **NEW**: 詳細な設計書（Design Document）
- **NEW**: 包括的な README 更新
- **NEW**: JSDoc による関数ドキュメント
- **NEW**: トラブルシューティングガイド
- **NEW**: パフォーマンス最適化のヒント

#### Developer Resources

- **NEW**: アーキテクチャ図
- **NEW**: API 仕様書
- **NEW**: カスタマイズガイド
- **NEW**: 将来の拡張計画
- **NEW**: セキュリティ考慮事項

### 🔄 Technical Improvements

#### Code Architecture

- **NEW**: モジュラー設計の採用
- **NEW**: 責務の明確な分離
- **NEW**: 再利用可能なコンポーネント
- **NEW**: 型安全性の向上
- **NEW**: メンテナンス性の向上

#### Performance Enhancements

- 並列処理による速度向上
- キャッシュによるレスポンス改善
- メモリ使用量の最適化
- API 呼び出し効率の改善
- UI 応答性の向上

### 🐛 Bug Fixes

- 外部 URL 取得時の文字化け問題を修正
- 画像解析の失敗時の処理を改善
- メモリリーク問題の修正
- エラー状況での無限ループを防止
- 設定の保存・読み込み問題を修正

### ⚠️ Breaking Changes

- 設定形式の変更（自動マイグレーション実装）
- 一部関数のシグネチャ変更
- 古い設定の削除とデフォルト値の変更

### 📦 Dependencies

- OpenAI API の最新仕様に対応
- Tampermonkey グラント権限の追加（GM_setValue, GM_getValue）
- 外部依存の最小化

---

## [6.0.0] - 2025-05-21

### Added

- DALL-E アクセス用のエンドポイントを作成
- 基本的な ChatGPT 統合機能
- Scrapbox UserScript 基盤

### Changed

- 初期実装

### Fixed

- 基本的な動作確認

---

## 🔮 Coming Next (v8.0 Preview)

### Planned Features

- [ ] ストリーミングレスポンス対応
- [ ] 会話履歴の保存・管理
- [ ] カスタムプロンプトテンプレート
- [ ] 他の AI プロバイダー対応（Claude, Gemini）
- [ ] 統計・利用状況ダッシュボード
- [ ] プラグインシステム
- [ ] 音声入力対応
- [ ] モバイル対応の改善

### Technical Improvements

- [ ] TypeScript 対応
- [ ] ユニットテストの実装
- [ ] CI/CD パイプラインの構築
- [ ] パフォーマンス監視の実装

---

## 📝 Notes

### Migration Guide (v6.0 → v7.0)

1. Tampermonkey スクリプトを新しいバージョンに更新
2. 新しい権限（GM_setValue, GM_getValue）を承認
3. 設定ダイアログから好みの設定を調整
4. Web 検索機能を有効化（デフォルトで有効）

### Compatibility

- **Minimum Requirements**:
  - Tampermonkey v4.0+
  - Modern Browser (Chrome 90+, Firefox 88+, Safari 14+)
  - OpenAI API Access
- **Supported Platforms**:
  - Scrapbox (scrapbox.io)
  - Desktop Browsers
- **API Compatibility**:
  - OpenAI Chat Completions API
  - OpenAI DALL-E API
  - OpenAI Responses API (Web Search)
