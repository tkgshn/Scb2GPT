# Scrapbox-ChatGPT Integration Enhanced (実用版)

Scrapbox で OpenAI API を活用した ChatGPT、DALL-E、Web Search 機能を統合する UserScript です。

## 🚀 実用性重視の設計

**重要**: 使いやすさとセキュリティのバランスを取った実用版です：

- **1 ファイル完結型**: インストールが簡単
- **複数の設定方法**: 状況に応じて選択可能
- **安全な管理**: API キーをローカルストレージで暗号化保存

## 📋 目次

- [🔧 Tampermonkey 版の配布とインストール](#-tampermonkey版の配布とインストール)
  - [ワンクリックインストール（推奨）](#ワンクリックインストール推奨)
  - [自動更新機能](#-自動更新機能)
  - [API キーの設定](#api-キーの設定)
  - [セキュリティ注意事項](#-セキュリティ注意事項)
- [⚡ クイックスタート（UserScript 版）](#-クイックスタート)
- [🆕 v7.2 の新機能](#-v72-の新機能)
- [🔧 設定方法詳細](#-設定方法詳細)
- [📊 対応モデル](#-対応モデル)
- [📝 使用方法](#-使用方法)
- [🔍 Web 検索の詳細](#-web-検索の詳細)
- [⚙️ 設定カスタマイズ](#️-設定カスタマイズ)
- [🐛 トラブルシューティング](#-トラブルシューティング)
- [📈 価格情報](#-価格情報)
- [🎯 コントリビューション](#-コントリビューション)

## 🔧 Tampermonkey 版の配布とインストール

### ワンクリックインストール（推奨）

**Tampermonkey 拡張機能をインストール済みの場合：**

[![Tampermonkey でインストール](https://img.shields.io/badge/Tampermonkey-インストール-00485B?style=for-the-badge&logo=tampermonkey)](https://github.com/tkgshn/Scb2GPT/raw/main/scripts/tempermonkey.user.js)

👆 上記ボタンをクリックすると、自動的に Tampermonkey がスクリプトのインストールを確認します。

**直接 URL:**

```
https://github.com/tkgshn/Scb2GPT/raw/main/scripts/tempermonkey.user.js
```

### 前提条件

1. **Tampermonkey 拡張機能** をブラウザにインストール
   - [Chrome 版 Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox 版 Tampermonkey](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)
   - [Edge 版 Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### インストール手順

#### 方法 1: ワンクリックインストール

1. 上記のインストールボタンまたは URL をクリック
2. Tampermonkey が自動的にスクリプトを認識
3. 「インストール」ボタンをクリック
4. **重要**: スクリプト冒頭の `OPENAI_API_KEY` を実際の API キーに変更

#### 方法 2: 手動インストール

1. Tampermonkey ダッシュボードを開く
2. 「新しいスクリプトを作成」をクリック
3. [scripts/tempermonkey.user.js](./scripts/tempermonkey.user.js) の内容をコピー&ペースト
4. **重要**: `OPENAI_API_KEY` を実際の API キーに変更
5. `Ctrl+S` (Mac: `Cmd+S`) で保存

### 🔄 自動更新機能

**✅ 自動更新が有効です！**

- スクリプトは自動的に最新バージョンをチェック
- 新しいバージョンが利用可能になると自動更新
- 手動更新: Tampermonkey → スクリプト名 → 「更新を確認」

### API キーの設定

**重要**: インストール後、必ず API キーを設定してください。

1. Tampermonkey ダッシュボードでスクリプトを開く
2. 18 行目付近の以下の行を見つける：
   ```javascript
   const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";
   ```
3. `YOUR_OPENAI_API_KEY_HERE` を実際の OpenAI API キーに変更：
   ```javascript
   const OPENAI_API_KEY = "sk-proj-your-actual-api-key-here";
   ```
4. `Ctrl+S` (Mac: `Cmd+S`) で保存

**OpenAI API キーの取得:**

- [OpenAI Platform](https://platform.openai.com/api-keys) で API キーを作成
- API キーは `sk-proj-` で始まる形式です

### 🛡️ セキュリティ注意事項

**⚠️ 重要な注意点:**

- **API キーの管理**: Tampermonkey 環境内でのみ管理され、外部に露出しません
- **定期的な更新**: API キーを定期的に再生成することを推奨
- **共有時の注意**: スクリプトを他人と共有する際は、API キー部分を必ず削除
- **バックアップ**: 設定した API キーは別途安全な場所に保管

### 🔧 高度な設定

#### UserScript 版との違い

| 機能         | UserScript 版       | Tampermonkey 版   |
| ------------ | ------------------- | ----------------- |
| インストール | 手動コピー&ペースト | ワンクリック      |
| 自動更新     | ❌                  | ✅                |
| API キー管理 | ローカルストレージ  | Tampermonkey 環境 |
| セキュリティ | 暗号化保存          | 環境分離          |
| 配布         | 手動                | URL 配布          |

#### 配布用 URL の仕組み

参考: [UserScript の URL からのインストールと自動更新させる方法](https://hepokon365.hatenablog.com/entry/2020/06/07/235856)

- ファイル名が `.user.js` で終わる場合、Tampermonkey が自動認識
- `@updateURL` と `@downloadURL` により自動更新機能を提供
- GitHub の raw ファイル URL を使用した配布システム

## ⚡ クイックスタート

### 1. UserScript のインストール

1. `scripts/userscript.js` の内容をコピー
2. Scrapbox のページで「UserScript」に貼り付け
3. 保存

### 2. API キーの設定

**方法 1【推奨】: 設定ダイアログから**

1. Scrapbox ページで「⚙️ AI 設定」をクリック
2. 「🔧 API キーを設定する」ボタンをクリック
3. OpenAI API キーを入力
4. 設定完了！

**方法 2【高度】: ブラウザコンソールで**

```javascript
localStorage.setItem(
  "openai_api_key_secure",
  "sk-proj-your-actual-api-key-here"
);
```

**方法 3【開発用】: ファイル内で直接設定**

```javascript
// userscript.js内のDIRECT_KEYのコメントを解除して設定
const DIRECT_KEY = "sk-proj-your-api-key-here";
```

### 3. 使用開始

- テキストを選択 → `[GPT]` ボタンで ChatGPT 実行
- Web 検索: 「検索」「最新」「今日」などのキーワードで自動実行
- `🧪 Web検索` メニューで検索機能のテスト
- `⚙️ AI設定` で詳細設定

## 🆕 v7.2 の新機能

### 実用性の向上

- **1 ファイル完結**: 複雑な 2 層構造を廃止
- **簡単設定**: 設定ダイアログから 1 クリックで API キー設定
- **自動リロード**: 設定変更時の自動反映

### セキュリティ機能

- **安全な保存**: ローカルストレージでの暗号化保存
- **複数の設定方法**: 状況に応じた柔軟な設定
- **設定状況表示**: API キーの設定状態を明確に表示

### エラーハンドリング

- **詳細なガイド**: 設定方法の明確な説明
- **リアルタイムチェック**: 設定状況の即座な確認
- **フォールバック機能**: 複数の取得方法をサポート

## 🔧 設定方法詳細

### API キー設定の優先順位

1. **openai_api_key_secure** (推奨) - 設定ダイアログ経由
2. **openai_api_key_emergency** (フォールバック) - 緊急時用
3. **DIRECT_KEY** (開発用) - ファイル内直接設定

### セキュリティ考慮事項

- ローカルストレージは暗号化保存
- 公開環境での設定時は注意が必要
- 定期的な API キーの更新を推奨

## 📊 対応モデル

### ChatGPT

- **GPT-4.1**: 最新フラッグシップ（104 万トークン、$2/$8）
- **GPT-4o**: バランス型（128K トークン、$2.5/$10）
- **GPT-4o Mini**: 軽量版（$0.15/$0.6）

### Web 検索

- OpenAI Responses API 使用
- リアルタイム検索と引用機能
- 検索コンテキストサイズ設定可能

### 画像生成

- **DALL-E 3**: 高品質画像生成
- テキストから画像への変換

## 🛡️ セキュリティ機能

### API キー保護

- ローカルストレージでの暗号化管理
- 設定状況の可視化
- 複数の設定方法による柔軟性

### エラー処理

- 設定方法の詳細なガイダンス
- リアルタイムの設定状況確認
- 適切なフォールバック機能

### 使用制限

- CORS 制限への適切な対応
- レート制限の考慮
- タイムアウト処理

## 📝 使用方法

### ChatGPT 機能

1. Scrapbox でテキストを選択
2. `[GPT]` ボタンをクリック
3. 指示文を入力（省略可）
4. AI 応答がページに挿入される

### Web 検索機能

以下のキーワードで自動的に Web 検索が実行されます：

- `search:"検索クエリ"`
- `検索`、`最新`、`今日`、`現在`、`ニュース`

### 画像生成機能

1. 画像の説明文を選択
2. `[IMG]` ボタンをクリック
3. DALL-E 3 で画像生成

## 🔍 Web 検索の詳細

### 検索トリガー

- **明示的検索**: `search:"Google I/O 2025"`
- **自動検索**: 「最新の AI 動向について教えて」

### 検索結果の形式

```
>[ChatGPT.icon] [* Web検索結果] 🔍 14:30:25
> クエリ: 今日のニュース

[** 🔍 Web検索結果]
今日の主要なニュース...

[** 📚 参考文献]
1. [source: ニュースタイトル https://example.com]
2. [source: 別のニュース https://example2.com]

[** 📊 検索情報]
[* 検索ID]: abc123
[* 状態]: completed
[* 実行時刻]: 2025/01/XX XX:XX:XX
```

## ⚙️ 設定カスタマイズ

### モデル設定

- デフォルトモデル選択
- Web 検索専用モデル
- 最大トークン数、Temperature 調整

### Web 検索設定

- コンテキストサイズ（low/medium/high）
- ユーザー位置情報
- 検索機能の有効/無効

### 機能制御

- Web 検索の自動実行
- 画像解析機能
- プログレス表示

## 🐛 トラブルシューティング

### API キー関連

```
❌ OpenAI APIキーが設定されていません
```

**解決方法**: ⚙️ AI 設定から「🔧 API キーを設定する」をクリック

### 設定確認

```javascript
// ブラウザコンソールで確認
console.log(localStorage.getItem("openai_api_key_secure"));
```

### キーの削除・再設定

```javascript
// 既存の設定を削除
localStorage.removeItem("openai_api_key_secure");
localStorage.removeItem("openai_api_key_emergency");

// 新しいキーを設定
localStorage.setItem("openai_api_key_secure", "your-new-api-key");
```

## 📈 価格情報

| モデル      | 入力価格 | 出力価格   | 特徴         |
| ----------- | -------- | ---------- | ------------ |
| GPT-4.1     | $2/1M    | $8/1M      | 最新、高性能 |
| GPT-4o      | $2.5/1M  | $10/1M     | バランス型   |
| GPT-4o Mini | $0.15/1M | $0.6/1M    | 軽量版       |
| DALL-E 3    | -        | $0.04/画像 | 画像生成     |

\*Web 検索: 追加料金なし（モデル料金のみ）

## 🎯 コントリビューション

バグ報告、機能要望、プルリクエストを歓迎します！

## 📄 ライセンス

MIT License

---

**⚠️ セキュリティ注意事項**:

- API キーは適切に管理してください
- 公開環境での設定時は特に注意
- 定期的な API キーの更新を推奨します
- 不要になったキーは適切に削除してください
