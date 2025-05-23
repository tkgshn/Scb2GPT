/********************************************************************
 * Scrapbox-ChatGPT Integration Enhanced (実用版)
 * - OpenAI APIを使用したChatGPT、DALL-E、Web Search統合
 * - 実用性重視: 1ファイル完結型
 * - セキュリティ: 設定方法の明確化と注意喚起
 ********************************************************************/

/* ------------------------------------------------ 設定 */
// ⚠️ セキュリティ重要: 本番環境での推奨設定方法
//
// 方法1【推奨】: 環境変数やより安全な方法で管理
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Node.js環境
//
// 方法2【開発用】: 直接設定（注意：この方法は公開時に注意）
// const OPENAI_API_KEY = 'sk-proj-your-api-key-here';
//
// 方法3【動的設定】: ブラウザコンソールで設定
// localStorage.setItem('openai_api_key_secure', 'your-api-key');

/**
 * OpenAI APIキーを安全に取得
 * 複数の方法を優先順位順に試行
 */
function getOpenAIApiKey() {
    try {
        // 優先順位1: ローカルストレージから取得（動的設定用）
        const secureKey = localStorage.getItem('openai_api_key_secure');
        if (secureKey && !secureKey.includes('xxxxxxxxx')) {
            console.log('✅ セキュアAPIキーを使用:', secureKey.substring(0, 20) + '...');
            return secureKey;
        }

        // 優先順位2: 従来のフォールバック
        const fallbackKey = localStorage.getItem('openai_api_key_emergency');
        if (fallbackKey && !fallbackKey.includes('xxxxxxxxx')) {
            console.warn('⚠️ フォールバックAPIキーを使用中:', fallbackKey.substring(0, 20) + '...');
            console.warn('📝 推奨: ⚙️ AI設定から正しいAPIキーを設定してください');
            return fallbackKey;
        }

        // 優先順位3: 直接設定（開発用）
        // const DIRECT_KEY = 'sk-proj-your-api-key-here'; // ← ここに設定
        // if (typeof DIRECT_KEY !== 'undefined' && DIRECT_KEY && !DIRECT_KEY.includes('xxxxxxxxx')) {
        //     console.log('🔧 直接設定APIキーを使用:', DIRECT_KEY.substring(0, 20) + '...');
        //     return DIRECT_KEY;
        // }

        throw new Error(`OpenAI APIキーが設定されていません。\n\n🔧 設定方法:\n\n1.【推奨】ブラウザコンソールで実行:\n   localStorage.setItem('openai_api_key_secure', 'sk-proj-your-api-key');\n\n2.【開発用】このファイル内のDIRECT_KEYのコメントアウトを解除して設定\n\n3.【緊急時】localStorage.setItem('openai_api_key_emergency', 'your-api-key');\n\n💡 設定後、ページをリロードしてください`);

    } catch (error) {
        throw new Error(`APIキー取得エラー: ${error.message}`);
    }
}

/* ------------------------------------------------ 依存モジュール */
import { insertText } from "/api/code/gosyujin/scrapbox-insert-text/script.js";

/* ------------------------------------------------ 設定とグローバル状態 */
const DEFAULT_SETTINGS = {
    defaultModel: 'gpt-4.1',
    maxTokens: 4000,
    temperature: 0.5,
    searchContextSize: 'medium',
    enableWebSearch: true,
    enableImageAnalysis: true,
    userLocation: { country: 'JP', city: 'Tokyo', region: 'Tokyo' },
    webSearchModel: 'gpt-4.1' // Web検索専用モデル
};

let userSettings = { ...DEFAULT_SETTINGS };
const cache = new Map();
const j = (x) => JSON.stringify(x, null, 2);

/* ------------------------------------------------ ユーティリティ関数 */

/**
 * 設定の保存・取得（localStorage使用）
 */
function saveUserSettings(settings) {
    try {
        localStorage.setItem('scrapbox_ai_settings', JSON.stringify(settings));
    } catch (error) {
        console.error('Settings save error:', error);
    }
}

function getUserSettings() {
    try {
        const saved = localStorage.getItem('scrapbox_ai_settings');
        if (saved) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Settings load error:', error);
    }
    return { ...DEFAULT_SETTINGS };
}

/**
 * エラーハンドリング
 */
function handleApiError(error, apiName) {
    console.error(`${apiName} API Error:`, error);

    let userMessage = 'APIエラーが発生しました。';

    if (error.message && error.message.includes('timeout')) {
        userMessage = `${apiName}のリクエストがタイムアウトしました。もう一度お試しください。`;
    } else if (error.message && error.message.includes('中断')) {
        userMessage = `${apiName}のリクエストが中断されました。`;
    } else if (error.status === 429) {
        userMessage = 'APIレート制限に達しました。しばらく待ってからお試しください。';
    } else if (error.status === 401) {
        userMessage = 'APIキーが無効です。設定を確認してください。';
    } else if (error.status >= 500) {
        userMessage = 'サーバーエラーが発生しました。しばらく待ってからお試しください。';
    }

    return userMessage;
}

/**
 * OpenAI ChatGPT API呼び出し
 */
async function askChatGPT(messages, maxTokens = 4000, temperature = 0.5, model = 'gpt-4o') {
    // o3モデルの制限チェック
    if (model === 'o3' || model.includes('o3-')) {
        throw new Error(`${model}モデルはChat Completions APIではサポートされていません。o3モデルはResponses APIでのみ利用可能です。\n\n代替案:\n• GPT-4.1を使用してください（高度な推論能力を持つ最新モデル）\n• o3モデルを使用したい場合は、OpenAIのPlaygroundまたはResponses APIを直接使用してください`);
    }

    const apiKey = getOpenAIApiKey();
    console.log('🤖 ChatGPT API 呼び出し開始');
    console.log('   📋 モデル:', model);
    console.log('   🔑 APIキー:', apiKey.substring(0, 20) + '...');
    console.log('   📊 最大トークン:', maxTokens);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: maxTokens,
            temperature: temperature
        })
    });

    console.log('📥 ChatGPT API レスポンス:', response.status, response.statusText);

    if (!response.ok) {
        if (response.status === 429) {
            // レート制限の詳細なエラーハンドリング
            const retryAfter = response.headers.get('retry-after');
            const errorBody = await response.text();
            console.error('🚫 レート制限エラー (ChatGPT API):');
            console.error('   📊 ステータス:', response.status);
            console.error('   ⏰ 再試行まで:', retryAfter ? `${retryAfter}秒` : '不明');
            console.error('   📝 詳細:', errorBody);

            throw new Error(`レート制限に達しました (ChatGPT API)\n\n詳細:\n• エンドポイント: /v1/chat/completions\n• 使用APIキー: ${apiKey.substring(0, 20)}...\n• 再試行まで: ${retryAfter ? retryAfter + '秒' : '不明'}\n\n解決方法:\n1. 数分待ってから再実行\n2. 異なるAPIキーを使用\n3. ⚙️ AI設定で正しいAPIキーを設定`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * OpenAI DALL-E API呼び出し
 */
async function askDALLE(prompt, model = 'dall-e-3', n = 1, size = '1024x1024') {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getOpenAIApiKey()}`
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: n,
            size: size
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * OpenAI Web Search (Responses API) - 新実装！
 */
async function askWebSearch(input, options = {}) {
    const {
        model = userSettings.webSearchModel,
        search_context_size = userSettings.searchContextSize,
        user_location = userSettings.userLocation,
        force_search = true
    } = options;

    const apiKey = getOpenAIApiKey();

    console.group('🔍 OpenAI Web Search API 実行開始');
    console.log('📝 検索入力:', input);
    console.log('🤖 使用モデル:', model);
    console.log('🔑 APIキー:', apiKey.substring(0, 20) + '...');
    console.log('📊 コンテキストサイズ:', search_context_size);
    console.log('📍 ユーザー位置:', user_location);

    // Web Search ツールの設定
    const tools = [{
        type: "web_search_preview",
        search_context_size: search_context_size
    }];

    // ユーザー位置情報を追加
    if (user_location) {
        tools[0].user_location = {
            type: "approximate",
            ...user_location
        };
        console.log('📍 位置情報を設定:', tools[0].user_location);
    }

    const requestData = {
        model: model,
        tools: tools,
        input: input
    };

    // Web Search強制実行（推奨）
    if (force_search) {
        requestData.tool_choice = { type: "web_search_preview" };
        console.log('🎯 Web検索を強制実行に設定');
    }

    console.log('📤 送信データ:', j(requestData));

    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        console.log('📥 レスポンス状態:', response.status, response.statusText);

        if (!response.ok) {
            if (response.status === 429) {
                // レート制限の詳細なエラーハンドリング
                const retryAfter = response.headers.get('retry-after');
                const errorBody = await response.text();
                console.error('🚫 レート制限エラー (Web Search API):');
                console.error('   📊 ステータス:', response.status);
                console.error('   ⏰ 再試行まで:', retryAfter ? `${retryAfter}秒` : '不明');
                console.error('   📝 詳細:', errorBody);

                throw new Error(`レート制限に達しました (Web Search API)\n\n詳細:\n• エンドポイント: /v1/responses\n• 使用APIキー: ${apiKey.substring(0, 20)}...\n• 再試行まで: ${retryAfter ? retryAfter + '秒' : '不明'}\n\n解決方法:\n1. 数分待ってから再実行\n2. 異なるAPIキーを使用\n3. ⚙️ AI設定で正しいAPIキーを設定`);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 受信データ:', j(data));

        // Web検索が実行されたかチェック（修正：data.output配列から検索）
        const webSearchCall = data.output.find(item => item.type === 'web_search_call');
        if (webSearchCall) {
            console.log('✅ Web検索が実行されました！');
            console.log('🆔 検索ID:', webSearchCall.id);
            console.log('📊 検索状態:', webSearchCall.status);
        } else {
            console.log('❌ Web検索が実行されませんでした');
        }

        // メッセージ内容を解析（修正：data.output配列から検索）
        const messageItem = data.output.find(item => item.type === 'message');
        if (messageItem && messageItem.content) {
            const textContent = messageItem.content.find(c => c.type === 'output_text');
            if (textContent) {
                console.log('📝 応答テキスト:', textContent.text.substring(0, 200) + '...');

                // 引用情報を解析
                if (textContent.annotations && textContent.annotations.length > 0) {
                    console.log('🔗 引用情報が見つかりました:');
                    textContent.annotations.forEach((annotation, index) => {
                        if (annotation.type === 'url_citation') {
                            console.log(`   ${index + 1}. ${annotation.title || 'タイトルなし'}`);
                            console.log(`      URL: ${annotation.url}`);
                            console.log(`      位置: ${annotation.start_index}-${annotation.end_index}`);
                        }
                    });
                } else {
                    console.log('📝 引用情報はありません');
                }
            }
        }

        console.groupEnd();
        return data;

    } catch (error) {
        console.error('❌ Web Search API エラー:', error);
        console.groupEnd();
        throw error;
    }
}

/**
 * Web検索結果をフォーマット
 */
function formatWebSearchResults(searchData) {
    if (!searchData || !searchData.output || !Array.isArray(searchData.output)) {
        return "Web検索結果が取得できませんでした。";
    }

    console.group('🔧 Web検索結果をフォーマット中');

    // Web検索が実行されたかチェック（修正：searchData.output配列から検索）
    const webSearchCall = searchData.output.find(item => item.type === 'web_search_call');
    const messageItem = searchData.output.find(item => item.type === 'message');

    if (!webSearchCall) {
        console.log('❌ Web検索が実行されていません');
        console.groupEnd();
        return "Web検索は実行されませんでした。";
    }

    if (!messageItem || !messageItem.content) {
        console.log('❌ メッセージ内容が見つかりません');
        console.groupEnd();
        return "検索結果のメッセージが取得できませんでした。";
    }

    const textContent = messageItem.content.find(c => c.type === 'output_text');
    if (!textContent) {
        console.log('❌ テキスト内容が見つかりません');
        console.groupEnd();
        return "検索結果のテキストが取得できませんでした。";
    }

    console.log('✅ Web検索結果を正常に取得');
    console.log('📊 検索ID:', webSearchCall.id);
    console.log('📊 検索状態:', webSearchCall.status);
    console.log('📝 テキスト長:', textContent.text.length);

    // Scrapbox記法でフォーマット
    let result = `[** 🔍 Web検索結果]\n${textContent.text}`;

    // 引用情報を追加（Scrapbox記法）
    if (textContent.annotations && textContent.annotations.length > 0) {
        const citations = textContent.annotations
            .filter(a => a.type === 'url_citation')
            .map((a, index) => `${index + 1}. [source: ${a.title || 'リンク'} ${a.url}]`)
            .join('\n');

        if (citations) {
            result += `\n\n[** 📚 参考文献]\n${citations}`;
            console.log('🔗 引用情報を追加:', textContent.annotations.length + '件');
        }
    }

    // 検索メタデータを追加（Scrapbox記法）
    result += `\n\n[** 📊 検索情報]\n[* 検索ID]: ${webSearchCall.id}\n[* 状態]: ${webSearchCall.status}\n[* 実行時刻]: ${new Date().toLocaleString()}`;

    console.groupEnd();
    return result;
}

/**
 * Scrapboxページのテキストを取得
 */
async function fetchSBPage(project, title) {
    if (cache.has(title)) return cache.get(title);

    try {
        const res = await fetch(`/api/pages/${project}/${encodeURIComponent(title)}/text`);
        if (!res.ok) return "";
        const txt = await res.text();
        cache.set(title, txt);
        return txt;
    } catch (error) {
        console.error('Scrapbox page fetch error:', error);
        return "";
    }
}

/**
 * 外部URLの内容を取得（制限付き）
 */
async function fetchExternal(url) {
    try {
        // CORS制限のため、多くの外部サイトはアクセスできません
        // ここでは基本的な情報のみ返します
        return `【${url}】\n外部URLの内容取得は制限されています。直接サイトを確認してください。`;
    } catch (error) {
        console.error('External content fetch error:', error);
        return `【${url}】\n内容の取得に失敗しました。`;
    }
}

/**
 * 画像URL判定
 */
const imgRe = /\.(png|jpe?g|gif|webp|bmp|tiff|svg)(\?.*)?$/i;

/**
 * プログレス表示
 */
function showProgress(message) {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'scrapbox-ai-progress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a90e2;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    progressDiv.textContent = message;
    document.body.appendChild(progressDiv);

    return {
        update: (newMessage) => {
            progressDiv.textContent = newMessage;
        },
        remove: () => {
            if (progressDiv.parentNode) {
                progressDiv.parentNode.removeChild(progressDiv);
            }
        }
    };
}

/**
 * 設定ダイアログ
 */
function showSettingsDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        max-height: 80vh;
        overflow-y: auto;
    `;

    // APIキーの安全な表示と設定方法
    let apiKeyDisplay = '未設定';
    let apiKeyStatus = '❌ 未設定';
    let setupInstructions = '';

    try {
        const apiKey = getOpenAIApiKey();
        if (apiKey && !apiKey.includes('xxxxxxxxx')) {
            apiKeyDisplay = apiKey.substring(0, 20) + '...';
            apiKeyStatus = '✅ 設定済み';
            setupInstructions = '正常に設定されています';
        }
    } catch (error) {
        apiKeyDisplay = 'エラー';
        apiKeyStatus = '❌ エラー';
        setupInstructions = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">🔧 APIキー設定方法</h4>
                <div style="font-size: 14px; color: #856404;">
                    <strong>【推奨】ブラウザコンソールで実行:</strong><br>
                    <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">
                        localStorage.setItem('openai_api_key_secure', 'sk-proj-あなたのAPIキー');
                    </code><br><br>

                    <strong>【開発用】ファイル内で直接設定:</strong><br>
                    UserScript内のDIRECT_KEYのコメントを解除して設定<br><br>

                    <em>※設定後、ページをリロードしてください</em>
                </div>
            </div>
        `;
    }

    dialog.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">🤖 AI設定 - 実用版</h3>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">APIキー状態:</label>
            <input type="password" id="apiKey" value="${apiKeyDisplay}" disabled style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5;">
            <small style="color: #666;">状態: ${apiKeyStatus}</small>
            ${setupInstructions}
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                <button id="setupApiKey" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    🔧 APIキーを設定する
                </button>
            </label>
            <small style="color: #666;">クリックして安全にAPIキーを設定</small>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">デフォルトモデル:</label>
            <select id="defaultModel" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="gpt-4.1">GPT-4.1 (最新フラッグシップ - $2/$8)</option>
                <option value="gpt-4o">GPT-4o (バランス型 - $2.5/$10)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (軽量版)</option>
                <option value="gpt-4">GPT-4 (従来版)</option>
            </select>
            <small style="color: #666; display: block; margin-top: 5px;">
                • GPT-4.1: 複雑なタスクに最適（104万トークン）<br>
                • o3モデルは現在未対応（Responses API専用のため）
            </small>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Web検索モデル:</label>
            <select id="webSearchModel" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="gpt-4.1">GPT-4.1 (推奨 - Web検索最適化)</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini (軽量版)</option>
                <option value="gpt-4o">GPT-4o (バランス型)</option>
            </select>
            <small style="color: #666; display: block; margin-top: 5px;">
                GPT-4.1はWeb検索機能が最適化されており推奨です
            </small>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">最大トークン数:</label>
            <input type="number" id="maxTokens" value="${userSettings.maxTokens}" min="100" max="32000" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <small style="color: #666;">GPT-4.1: 最大32,768</small>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Temperature (0-2):</label>
            <input type="number" id="temperature" value="${userSettings.temperature}" min="0" max="2" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Web検索コンテキストサイズ:</label>
            <select id="searchContextSize" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="low">Low (高速・低コスト)</option>
                <option value="medium">Medium (バランス)</option>
                <option value="high">High (高品質・高コスト)</option>
            </select>
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                <input type="checkbox" id="enableWebSearch" ${userSettings.enableWebSearch ? 'checked' : ''} style="margin-right: 8px;">
                Web検索機能を有効にする
            </label>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                <input type="checkbox" id="enableImageAnalysis" ${userSettings.enableImageAnalysis ? 'checked' : ''} style="margin-right: 8px;">
                画像解析機能を有効にする
            </label>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #495057;">💰 価格情報 (per 1M tokens)</h4>
            <div style="font-size: 14px; color: #6c757d;">
                <strong>GPT-4.1:</strong> 入力$2 / 出力$8<br>
                <strong>GPT-4o:</strong> 入力$2.5 / 出力$10<br>
                <strong>GPT-4o Mini:</strong> 入力$0.15 / 出力$0.6<br>
                <em>o3モデルはResponses API専用（未対応）</em>
            </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancelSettings" style="padding: 10px 20px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">キャンセル</button>
            <button id="saveSettings" style="padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">保存</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 現在の設定値を反映
    document.getElementById('defaultModel').value = userSettings.defaultModel;
    document.getElementById('webSearchModel').value = userSettings.webSearchModel;
    document.getElementById('searchContextSize').value = userSettings.searchContextSize;

    // イベントリスナー
    document.getElementById('setupApiKey').onclick = () => {
        const newApiKey = prompt("🔐 OpenAI APIキーを入力してください:\n\n※このキーはローカルストレージに安全に保存されます");
        if (newApiKey && newApiKey.trim()) {
            try {
                localStorage.setItem('openai_api_key_secure', newApiKey.trim());
                alert("✅ APIキーが正常に設定されました！\n\n次回からこのキーが使用されます。");
                document.body.removeChild(overlay);
                location.reload(); // ページをリロードして新しいキーを反映
            } catch (error) {
                alert("❌ APIキーの設定に失敗しました: " + error.message);
            }
        }
    };

    document.getElementById('cancelSettings').onclick = () => {
        document.body.removeChild(overlay);
    };

    document.getElementById('saveSettings').onclick = () => {
        userSettings = {
            ...userSettings,
            defaultModel: document.getElementById('defaultModel').value,
            webSearchModel: document.getElementById('webSearchModel').value,
            maxTokens: parseInt(document.getElementById('maxTokens').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            searchContextSize: document.getElementById('searchContextSize').value,
            enableWebSearch: document.getElementById('enableWebSearch').checked,
            enableImageAnalysis: document.getElementById('enableImageAnalysis').checked
        };

        saveUserSettings(userSettings);
        document.body.removeChild(overlay);
        console.log('設定が保存されました:', userSettings);
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

/**
 * GPT実行本体
 */
async function execGPT() {
    // APIキーの確認
    try {
        const apiKey = getOpenAIApiKey();
        if (!apiKey || apiKey.includes('xxxxxxxxx')) {
            throw new Error('有効なAPIキーが設定されていません');
        }
    } catch (error) {
        insertText({
            text: `\n\n>[error.icon] [* エラー]: ${error.message}\n> Tampermonkeyスクリプト(tempermonkey.js)でOPENAI_API_KEYを設定してください。\n\n`
        });
        return;
    }

    const textarea = document.getElementById("text-input");
    if (!textarea || !textarea.value) {
        console.error("Select text");
        return;
    }

    const select = textarea.value;
    insertText({ text: select }); // 元に戻す

    const instruction = window.prompt("指示文を入力してください (空欄可):", "") ?? "";

    const progress = showProgress("🤖 AIが処理中...");

    try {
        progress.update("📄 ページ情報を取得中...");

        // 基本情報取得
  const project = scrapbox.Project.name;
  const current = scrapbox.Page.title;
        const fullPage = await fetchSBPage(project, current);

        // 選択テキストからリンクと外部URL抽出
        const linkTitles = [...select.matchAll(/\[([^\]]+?)\]/g)].map(m => m[1]);
        const externalURLs = [...select.matchAll(/https?:\/\/[^\s\]]+/g)].map(m => m[0]);

        progress.update("🔗 リンク先ページを取得中...");

        // リンク先ページ取得
        const linked = await Promise.all(linkTitles.map(async t => {
            const txt = await fetchSBPage(project, t);
            return { title: t, body: txt };
        }));

        progress.update("🌐 外部URLの内容を取得中...");

        // 外部URL内容取得（制限付き）
        const externals = await Promise.all(externalURLs.slice(0, 3).map(async u => {
            const body = await fetchExternal(u);
            return { url: u, body };
        }));

        // 画像URL抽出
        let imageURLs = [];
        if (userSettings.enableImageAnalysis) {
            imageURLs = [...select.matchAll(/https?:\/\/[^\s\]]+/g)]
                .map(m => m[0])
                .filter(u => imgRe.test(u));
        }

        // Web検索実行チェック
        const shouldPerformWebSearch = userSettings.enableWebSearch && (
            instruction.includes("search:") ||
            instruction.includes("検索") ||
            instruction.includes("最新") ||
            instruction.includes("今日") ||
            instruction.includes("現在") ||
            instruction.includes("ニュース")
        );

        let webSearchResult = "";
        if (shouldPerformWebSearch) {
            progress.update("🔍 OpenAI Web検索を実行中...");

            try {
                // search:"query"形式の抽出
                const searchQueries = [...instruction.matchAll(/search:"([^"]+)"/g)].map(m => m[1]);

                // 検索クエリが明示的にない場合は、全体のコンテキストで検索
                const searchInput = searchQueries.length > 0
                    ? searchQueries.join(" AND ")
                    : `${instruction} ${select}`.substring(0, 500); // 長すぎる場合は切り詰め

                console.log('🎯 Web検索を実行します:', searchInput);

                const searchData = await askWebSearch(searchInput, {
                    search_context_size: userSettings.searchContextSize,
                    user_location: userSettings.userLocation,
                    force_search: true
                });

                webSearchResult = formatWebSearchResults(searchData);
                console.log('✅ Web検索完了:', webSearchResult.substring(0, 200) + '...');

            } catch (searchError) {
                console.error('❌ Web検索エラー:', searchError);
                webSearchResult = `### ❌ Web検索エラー\n検索中にエラーが発生しました: ${searchError.message}`;
            }
        } else {
            console.log('ℹ️ Web検索はスキップされました（条件に該当しないため）');
        }

        progress.update("💭 AIが応答を生成中...");

        // メッセージ構築
        const textParts = [
            instruction.trim() ? `### 指示文\n${instruction.trim()}` : "",
            `### 選択テキスト\n${select}`,
            `### ページコンテキスト\n${fullPage}`,
            ...linked.filter(p => p.body).map(p => `### リンクページ: ${p.title}\n${p.body}`),
            ...externals.filter(e => e.body).map(e => `### 外部URL: ${e.url}\n${e.body}`),
            webSearchResult
  ].filter(Boolean).join("\n\n");

        // マルチモーダル対応
        const visionContent = [
            { type: "text", text: textParts },
            ...imageURLs.map(u => ({ type: "image_url", image_url: { url: u } }))
        ];

        const userMsg = { role: "user", content: visionContent };

        // デバッグログ
        console.group("🔸 GPT Enhanced Request");
        console.log('📊 使用モデル:', userSettings.defaultModel);
        console.log('📊 最大トークン:', userSettings.maxTokens);
        console.log('📊 Temperature:', userSettings.temperature);
        console.log('🔍 Web検索実行:', shouldPerformWebSearch ? 'はい' : 'いいえ');
        console.log('🖼️ 画像URL数:', imageURLs.length);
        console.log('🔗 リンクページ数:', linked.filter(p => p.body).length);
        console.log('📄 テキスト長:', textParts.length);
  console.groupEnd();

        // API送信
        const messages = [userMsg];
        const response = await askChatGPT(
            messages,
            userSettings.maxTokens,
            userSettings.temperature,
            userSettings.defaultModel
        );

        progress.remove();

        if (response.choices && response.choices[0]) {
            const txt = response.choices[0].message.content;

            // 結果を挿入（Scrapbox記法）
            const timestamp = new Date().toLocaleTimeString();
            const webSearchIndicator = shouldPerformWebSearch ? ' 🔍' : '';
            const formattedResponse = `\n\n>[ChatGPT.icon] [* AI応答]${webSearchIndicator} ${timestamp}\n${txt.split("\n").map(l => `> ${l}`).join("\n")}\n\n`;
            insertText({ text: formattedResponse });

        } else {
            const errorMsg = handleApiError(response, 'ChatGPT');
            insertText({ text: `\n\n>[error.icon] [* エラー]: ${errorMsg}\n\ncode:json\n${j(response)}\n\n` });
        }

    } catch (error) {
        progress.remove();
        console.error('execGPT error:', error);
        const errorMsg = handleApiError(error, 'AI処理');
        insertText({ text: `\n\n>[error.icon] [* エラー]: ${errorMsg}\n> ${error.message}\n\n` });
    }
}

/**
 * DALL-E実行
 */
async function execDALLE() {
    // APIキーの確認
    try {
        const apiKey = getOpenAIApiKey();
        if (!apiKey || apiKey.includes('xxxxxxxxx')) {
            throw new Error('有効なAPIキーが設定されていません');
        }
    } catch (error) {
        insertText({
            text: `\n\n>[error.icon] [* エラー]: ${error.message}\n> Tampermonkeyスクリプト(tempermonkey.js)でOPENAI_API_KEYを設定してください。\n\n`
        });
        return;
    }

    const textarea = document.getElementById("text-input");
    if (!textarea || !textarea.value) {
        console.error("Select text for image generation");
        return;
    }

    const prompt = textarea.value;
    insertText({ text: prompt }); // 元に戻す

    const progress = showProgress("🎨 画像を生成中...");

    try {
        const response = await askDALLE(prompt, 'dall-e-3', 1, '1024x1024');
        progress.remove();

        if (response.data && response.data[0]) {
            const imageUrl = response.data[0].url;
            const timestamp = new Date().toLocaleTimeString();

            insertText({
                text: `\n\n>[DALL-E.icon] [* 画像生成完了] ${timestamp}\n> プロンプト: ${prompt}\n\n[${imageUrl}]\n\n`
            });
        } else {
            const errorMsg = handleApiError(response, 'DALL-E');
            insertText({ text: `\n\n>[error.icon] [* 画像生成エラー]: ${errorMsg}\n\n` });
        }

    } catch (error) {
        progress.remove();
        console.error('DALL-E error:', error);
        const errorMsg = handleApiError(error, 'DALL-E');
        insertText({ text: `\n\n>[error.icon] [* 画像生成エラー]: ${errorMsg}\n> ${error.message}\n\n` });
    }
}

/**
 * Web検索テスト用関数
 */
async function testWebSearch() {
    const testQuery = window.prompt("Web検索をテストします。検索クエリを入力してください:", "今日のニュース");
    if (!testQuery) return;

    const progress = showProgress("🔍 Web検索をテスト中...");

    try {
        console.log('🧪 Web検索テスト開始');
        const searchData = await askWebSearch(testQuery, {
            search_context_size: userSettings.searchContextSize,
            force_search: true
        });

        const result = formatWebSearchResults(searchData);
        progress.remove();

        // ChatGPTと同様の形式で結果を表示（Scrapbox記法）
        const timestamp = new Date().toLocaleTimeString();
        const formattedResult = `\n\n>[ChatGPT.icon] [* Web検索結果] 🔍 ${timestamp}\n> クエリ: ${testQuery}\n\n${result.split("\n").map(l => `> ${l}`).join("\n")}\n\n`;

        insertText({
            text: formattedResult
        });

    } catch (error) {
        progress.remove();
        console.error('Web検索テストエラー:', error);
        const errorMsg = handleApiError(error, 'Web検索');
        insertText({
            text: `\n\n>[error.icon] [* Web検索エラー]: ${errorMsg}\n> ${error.message}\n\n`
        });
    }
}

/**
 * デバッグ用: APIキー設定状況を確認
 */
function checkApiKeyStatus() {
    console.group('🔍 APIキー設定状況の確認');

    try {
        const secureKey = localStorage.getItem('openai_api_key_secure');
        const emergencyKey = localStorage.getItem('openai_api_key_emergency');

        console.log('📊 設定状況:');
        console.log('   🔐 セキュアキー:', secureKey ? `設定済み (${secureKey.substring(0, 20)}...)` : '未設定');
        console.log('   🆘 緊急時キー:', emergencyKey ? `設定済み (${emergencyKey.substring(0, 20)}...)` : '未設定');

        // 現在使用されるキーを確認
        try {
            const currentKey = getOpenAIApiKey();
            console.log('   ✅ 現在使用中:', currentKey.substring(0, 20) + '...');

            // キーの種類を判定
            if (secureKey && currentKey === secureKey) {
                console.log('   📱 キー種類: セキュアキー (推奨)');
            } else if (emergencyKey && currentKey === emergencyKey) {
                console.log('   ⚠️ キー種類: 緊急時キー (フォールバック)');
            } else {
                console.log('   🔧 キー種類: 直接設定キー (開発用)');
            }

        } catch (error) {
            console.error('   ❌ キー取得エラー:', error.message);
        }

    } catch (error) {
        console.error('❌ 設定確認エラー:', error);
    }

    console.groupEnd();
}

// グローバル関数として公開（ブラウザコンソールから呼び出し可能）
if (typeof window !== 'undefined') {
    window.checkApiKeyStatus = checkApiKeyStatus;
}

/* ------------------------------------------------ 初期化 */
// 設定読み込み
userSettings = getUserSettings();

// メニュー登録
if (typeof scrapbox !== 'undefined') {
    // ChatGPT
    scrapbox.PopupMenu.addButton({ title: "[GPT]", onClick: execGPT });
    // scrapbox.PageMenu.addMenu({
    //     title: "🤖 ChatGPTに尋ねる",
    //     image: "https://i.gyazo.com/4cfa45dc994af2ca4c40069ce4ee75a3/raw",
    //     onClick: execGPT
    // });

    // // DALL-E
    // scrapbox.PopupMenu.addButton({ title: "[IMG]", onClick: execDALLE });
    // scrapbox.PageMenu.addMenu({
    //     title: "🎨 DALL-Eで画像生成",
    //     image: "https://i.gyazo.com/thumb/200/4cfa45dc994af2ca4c40069ce4ee75a3.png",
    //     onClick: execDALLE
    // });

    // 設定
    scrapbox.PageMenu.addMenu({
        title: "⚙️ AI設定",
        image: "https://i.gyazo.com/thumb/200/4cfa45dc994af2ca4c40069ce4ee75a3.png",
        onClick: showSettingsDialog
    });

    // Web検索テスト
scrapbox.PageMenu.addMenu({
        title: "🤖 Web検索",
        image: "https://i.gyazo.com/thumb/200/4cfa45dc994af2ca4c40069ce4ee75a3.png",
        onClick: testWebSearch
    });

    console.log("🚀 Scrapbox-ChatGPT Integration Enhanced (実用版) が読み込まれました");
    console.log("💡 使用方法:");
    console.log("   1. ⚙️ AI設定 からAPIキーを設定（推奨）");
    console.log("   2. または：ブラウザコンソールで localStorage.setItem('openai_api_key_secure', 'your-api-key');");
    console.log("   3. テキストを選択して [GPT] ボタンをクリック");
    console.log("   4. 'search:\"検索クエリ\"'、\"検索\"、\"最新\"、\"今日\" などでWeb検索が自動実行");
    console.log("   5. 🧪 Web検索テスト でWeb検索機能を単体テスト可能");
    console.log("   6. [IMG] ボタンで DALL-E 画像生成");
    console.log("   7. ⚙️ AI設定 でカスタマイズ可能");
    console.log("   📊 Console で詳細ログを確認してください");
    console.log("🔧 APIキー設定:");
    console.log("   • 設定ダイアログから簡単設定（推奨）");
    console.log("   • コンソールコマンドで直接設定");
    console.log("   • ファイル内で直接設定（開発用）");
    console.log("🆕 最新モデル対応:");
    console.log("   • GPT-4.1: 最新フラッグシップモデル（104万トークン）");
    console.log("   • GPT-4o: バランス型モデル（128Kトークン）");
    console.log("   ⚠️ o3モデルは現在未対応（Responses API専用のため）");
    console.log("   💰 価格: GPT-4.1($2/$8) / GPT-4o($2.5/$10) per 1M tokens");

    // APIキー設定状況の詳細チェック
    console.log("\n" + "=".repeat(50));
    console.log("🔍 APIキー設定状況の確認");

    const secureKey = localStorage.getItem('openai_api_key_secure');
    const emergencyKey = localStorage.getItem('openai_api_key_emergency');

    console.log("📊 設定状況:");
    console.log("   🔐 セキュアキー:", secureKey ? "✅ 設定済み" : "❌ 未設定");
    console.log("   🆘 緊急時キー:", emergencyKey ? "⚠️ 設定済み" : "❌ 未設定");

    try {
        const currentKey = getOpenAIApiKey();
        console.log("   ✅ 現在使用中: " + currentKey.substring(0, 20) + "...");

        // 問題の識別とアドバイス
        if (emergencyKey && !secureKey) {
            console.warn("⚠️ 警告: フォールバックキーのみが設定されています");
            console.warn("📝 推奨アクション:");
            console.warn("   1. ⚙️ AI設定 から正しいAPIキーを設定");
            console.warn("   2. または: localStorage.setItem('openai_api_key_secure', 'your-main-api-key');");
            console.warn("   3. フォールバックキーはレート制限に達している可能性があります");
        } else if (secureKey) {
            console.log("✅ 正常: セキュアキーが設定されています");
        }

    } catch (error) {
        console.error("❌ APIキー設定エラー:", error.message);
        console.error("🔧 解決方法:");
        console.error("   1. ⚙️ AI設定 ボタンからAPIキーを設定");
        console.error("   2. ブラウザコンソールで: checkApiKeyStatus() を実行して詳細確認");
    }

    console.log("=".repeat(50) + "\n");

    // デバッグ用コマンドの案内
    console.log("🛠️ デバッグコマンド:");
    console.log("   • checkApiKeyStatus() - APIキー状況の詳細確認");
    console.log("   • localStorage.clear() - 全設定のリセット（注意）");
} else {
    console.error("Scrapbox環境が検出されませんでした");
}
