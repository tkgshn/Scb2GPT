# Scrapbox-ChatGPT Integration Enhanced - 設計書

## 📋 概要

### プロジェクト目標

Scrapbox と最新の OpenAI API を統合し、ユーザーがシームレスに AI 機能を活用できる高機能な UserScript システムを提供する。

### 主要な改善点（v7.0）

1. **OpenAI Web Search API 統合**: リアルタイム検索機能
2. **堅牢性の向上**: エラーハンドリング、タイムアウト管理
3. **ユーザビリティ**: 直感的な設定 UI、プログレス表示
4. **保守性**: モジュール化、設定管理の分離

## 🏗️ システムアーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Layer                        │
├─────────────────────────────────────────────────────────────┤
│                      Tampermonkey                           │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  API Wrappers   │  │  Configuration  │                  │
│  │  - ChatGPT      │  │  - Settings     │                  │
│  │  - DALL-E       │  │  - Error Handle │                  │
│  │  - Web Search   │  │  - Utils        │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                      Scrapbox UserScript                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   UI Layer      │  │  Business Logic │  │ Data Layer   │ │
│  │  - Dialogs      │  │  - execGPT      │  │ - Cache      │ │
│  │  - Progress     │  │  - execDALLE    │  │ - Settings   │ │
│  │  - Menus        │  │  - Context      │  │ - State      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       Scrapbox Platform                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Page API      │  │   Text API      │  │  Menu API    │ │
│  │  - fetchSBPage  │  │  - insertText   │  │ - PopupMenu  │ │
│  │  - Project      │  │  - Selection    │  │ - PageMenu   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                      │                     │
           ▼                      ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   OpenAI APIs   │  │   DuckDuckGo    │  │  External URLs  │
│  - Chat Compl.  │  │  (Fallback)     │  │  (Web Content)  │
│  - DALL-E       │  │                 │  │                 │
│  - Responses    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### コンポーネント設計

#### 1. Tampermonkey Layer (`tempermonkey.js`)

**責務**: OpenAI API との安全な通信とグローバル関数の提供

**主要モジュール**:

- `ask_chatgpt`: Chat Completions API wrapper
- `ask_dalle`: DALL-E API wrapper
- `ask_web_search`: Responses API wrapper（新機能）
- `getUserSettings`: 設定管理
- `handleApiError`: エラーハンドリング

#### 2. UserScript Layer (`userscript.js`)

**責務**: UI 制御、ビジネスロジック、Scrapbox 統合

**主要モジュール**:

- UI Manager: ダイアログ、プログレス表示
- Context Collector: ページ・リンク・URL 情報収集
- AI Executor: AI 機能の実行制御
- Settings Manager: ユーザー設定の管理

## 🔧 詳細設計

### データフロー

#### 1. ChatGPT 実行フロー

```
User Selection → Context Collection → AI Processing → Response Insertion
     │                   │                  │              │
     ▼                   ▼                  ▼              ▼
[テキスト選択]    [ページ・リンク・URL]   [OpenAI API]   [結果挿入]
     │                   │                  │              │
     ├─ 指示文入力       ├─ Web検索         ├─ エラー処理    ├─ フォーマット
     ├─ 設定読込         ├─ 画像解析        ├─ タイムアウト   ├─ タイムスタンプ
     └─ 進捗表示         └─ キャッシュ      └─ リトライ      └─ エラー表示
```

#### 2. Web 検索フロー（新機能）

```
Search Query → OpenAI Web Search → Result Processing → Context Integration
     │                 │                    │                   │
     ▼                 ▼                    ▼                   ▼
[search:"query"]  [Responses API]     [Citation Extract]   [Text Merge]
     │                 │                    │                   │
     ├─ クエリ抽出      ├─ Context Size     ├─ URL情報         ├─ セクション分け
     ├─ 複数対応        ├─ User Location    ├─ タイトル        ├─ 引用リンク
     └─ フォールバック   └─ Tool Choice     └─ アノテーション   └─ エラー回復
                              │
                              ▼
                        [DuckDuckGo Fallback]
```

### API 設計

#### OpenAI Web Search API 統合

```javascript
/**
 * OpenAI Web Search API呼び出し
 * @param {string} input - 検索クエリ/質問
 * @param {string} model - AIモデル（gpt-4.1推奨）
 * @param {Object} options - 設定オプション
 * @returns {Promise<Object>} API応答
 */
ask_web_search(input, model, options) {
    // 設定例:
    options = {
        search_context_size: 'medium', // low/medium/high
        user_location: {
            country: 'JP',
            city: 'Tokyo',
            region: 'Tokyo'
        },
        tool_choice: { type: "web_search_preview" }
    }
}
```

#### レスポンス形式

```json
{
  "status": 200,
  "response": [
    {
      "type": "web_search_call",
      "id": "ws_xxx",
      "status": "completed"
    },
    {
      "type": "message",
      "content": [
        {
          "type": "output_text",
          "text": "検索結果に基づく回答...",
          "annotations": [
            {
              "type": "url_citation",
              "start_index": 100,
              "end_index": 200,
              "url": "https://example.com",
              "title": "参考サイト"
            }
          ]
        }
      ]
    }
  ]
}
```

### エラーハンドリング設計

#### エラー分類と対処

```javascript
const ERROR_CATEGORIES = {
  NETWORK: {
    timeout: "ネットワークタイムアウト",
    connection: "接続エラー",
    handler: (error) => retry(error, 3),
  },
  API: {
    401: "認証エラー - APIキー確認",
    429: "レート制限 - 待機後リトライ",
    500: "サーバーエラー - 時間をおいて再試行",
    handler: (error) => showUserError(error),
  },
  VALIDATION: {
    emptyInput: "入力が空です",
    invalidFormat: "形式が正しくありません",
    handler: (error) => showValidationError(error),
  },
};
```

#### フォールバック戦略

1. **OpenAI Web Search 失敗** → DuckDuckGo 検索
2. **外部 URL 取得失敗** → エラーをログして継続
3. **画像解析失敗** → テキストのみで処理継続
4. **メイン API 失敗** → エラー詳細をユーザーに表示

### パフォーマンス設計

#### キャッシュ戦略

```javascript
const cache = new Map(); // LRU Cache実装予定

// キャッシュキー設計
const CACHE_KEYS = {
  scrapboxPage: (project, title) => `sb:${project}:${title}`,
  externalUrl: (url) => `ext:${hashCode(url)}`,
  settings: "user_settings",
};

// キャッシュ期限
const CACHE_TTL = {
  scrapboxPage: 5 * 60 * 1000, // 5分
  externalUrl: 30 * 60 * 1000, // 30分
  settings: Infinity, // 永続
};
```

#### 並列処理最適化

```javascript
// 並列実行するタスク
const parallelTasks = [
  fetchLinkedPages(linkTitles),
  fetchExternalUrls(externalURLs.slice(0, 5)),
  executeWebSearch(searchQueries),
];

// Promise.allSettledで部分的失敗を許容
const results = await Promise.allSettled(parallelTasks);
```

### セキュリティ設計

#### API キー管理

- Tampermonkey 内で暗号化保存（将来実装）
- 定期的なキーローテーション推奨
- ローカル環境変数での管理オプション

#### データ保護

- ユーザー設定は GM_setValue/GM_getValue で安全に保存
- 外部通信は必要最小限に制限
- センシティブ情報のログ出力を避ける

#### CORS 対策

- GM_xmlhttpRequest で CORS 制限を回避
- 信頼できるドメインのみアクセス許可
- タイムアウト設定で DDoS 防止

## 🔄 開発フロー

### バージョン管理戦略

```
main    ──●──●──●──v7.0──●──●──●──v7.1
          │  │  │         │  │  │
develop   ●──●──●─────────●──●──●
          │  │  │         │  │  │
feature   ●──●──●         ●──●──●
```

### テスト戦略

1. **ユニットテスト**: 個別関数の動作確認
2. **統合テスト**: API 統合の動作確認
3. **E2E テスト**: Scrapbox 上での実際の動作確認
4. **パフォーマンステスト**: レスポンス時間、メモリ使用量

### デプロイ戦略

1. **ステージング**: 開発者環境での事前検証
2. **カナリアリリース**: 限定ユーザーでの段階的展開
3. **プロダクション**: 全ユーザーへの展開

## 📊 監視・メトリクス

### パフォーマンスメトリクス

- API レスポンス時間
- キャッシュヒット率
- エラー発生率
- ユーザー操作完了時間

### ユーザー体験メトリクス

- 機能利用頻度
- エラー率
- タイムアウト発生率
- 設定変更頻度

### システムメトリクス

- メモリ使用量
- CPU 使用率
- ネットワーク使用量
- ストレージ使用量

## 🔮 将来拡張設計

### プラグインアーキテクチャ（v8.0 予定）

```javascript
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  register(plugin) {
    this.plugins.set(plugin.name, plugin);
    this.setupHooks(plugin);
  }

  execute(hookName, context) {
    const handlers = this.hooks.get(hookName) || [];
    return Promise.all(handlers.map((h) => h(context)));
  }
}
```

### マルチプロバイダー対応

```javascript
const AI_PROVIDERS = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
  google: GoogleProvider,
};

class AIProviderFactory {
  static create(provider, config) {
    const Provider = AI_PROVIDERS[provider];
    return new Provider(config);
  }
}
```

### 設定システムの拡張

```javascript
const SETTINGS_SCHEMA = {
  version: "1.0",
  categories: {
    ai: {
      provider: { type: "select", options: ["openai", "anthropic"] },
      model: { type: "select", dynamic: true },
      temperature: { type: "range", min: 0, max: 2 },
    },
    ui: {
      theme: { type: "select", options: ["light", "dark", "auto"] },
      animations: { type: "boolean", default: true },
    },
  },
};
```

## ⚠️ 制限事項と注意点

### 技術的制限

- Tampermonkey 環境依存
- CORS 制限（一部回避済み）
- ブラウザメモリ制限
- OpenAI API 利用制限

### ユーザー利用制限

- API キー必須
- インターネット接続必須
- Scrapbox アカウント必須
- 一部ブラウザで動作制限あり

### セキュリティ考慮事項

- API キーの適切な管理
- 外部 URL アクセスのリスク
- プライベート情報の取り扱い
- レート制限の遵守

## 📝 まとめ

本設計書は、Scrapbox-ChatGPT Integration Enhanced の包括的な技術設計を示している。主要な改善点として：

1. **モジュラーアーキテクチャ**: 保守性と拡張性の向上
2. **堅牢なエラーハンドリング**: ユーザー体験の向上
3. **最新 API 統合**: Web 検索機能による情報の最新性確保
4. **パフォーマンス最適化**: キャッシュと並列処理による高速化

これらの設計により、高品質で使いやすい AI 統合システムを実現している。
