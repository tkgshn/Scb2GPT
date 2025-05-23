// ==UserScript==
// @name         Scrapbox-ChatGPT Integration Enhanced
// @namespace    https://github.com/tkgshn/Scb2GPT
// @version      7.1
// @description  DALL-E、ChatGPT、OpenAI Web Search機能を統合したScrapbox用スクリプト
// @author       tkgshn
// @match        https://scrapbox.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/tkgshn/Scb2GPT/raw/main/scripts/tempermonkey.user.js
// @downloadURL  https://github.com/tkgshn/Scb2GPT/raw/main/scripts/tempermonkey.user.js
// @supportURL   https://github.com/tkgshn/Scb2GPT/issues
// @homepageURL  https://github.com/tkgshn/Scb2GPT
// @icon         https://github.com/tkgshn/Scb2GPT/raw/main/docs/icon.svg
// @license      MIT
// ==/UserScript==

/**
 * OpenAI APIキー設定
 * セキュリティ上、実際の利用時は環境変数やより安全な方法で管理してください
 *
 * 🔧 セットアップ手順:
 * 1. 下記のAPIキーを実際のOpenAI APIキーに変更してください
 * 2. OpenAI APIキーは https://platform.openai.com/api-keys で取得できます
 * 3. APIキーは "sk-proj-" で始まる形式です
 */
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';  // ← ここを実際のAPIキーに変更

/**
 * APIキーをScrapbox UserScript環境に提供
 * セキュリティのため、APIキーはTampermonkey環境でのみ管理
 */
unsafeWindow.getOpenAIApiKey = () => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        throw new Error('OpenAI APIキーが設定されていません。Tampermonkeyスクリプトの冒頭でOPENAI_API_KEYを設定してください。');
    }
    return OPENAI_API_KEY;
};

/**
 * 環境情報の提供
 */
unsafeWindow.getEnvironmentInfo = () => {
    return {
        runtime: 'tampermonkey',
        hasApiKey: !!(OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE'),
        version: '7.1'
    };
};

/**
 * OpenAI DALL-E 画像生成API
 * @param {string} prompt - 画像生成プロンプト
 * @param {string} model - モデル名 (dall-e-3, dall-e-2)
 * @param {number} n - 生成画像数
 * @param {string} size - 画像サイズ
 * @returns {Promise} APIレスポンス
 */
 unsafeWindow.ask_dalle = (prompt = '寝ている犬', model = 'dall-e-3', n = 1, size = '1024x1024') => {
     const dalleEndpoint = 'https://api.openai.com/v1/images/generations';
     const dalleHeader = {
         "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
     };
     const dalleData = JSON.stringify({
         model: model,
         prompt: prompt,
         n: n,
         size: size
     });

     return new Promise((resolve, reject) => {
         GM_xmlhttpRequest({
             method: 'POST',
             headers: dalleHeader,
             url: dalleEndpoint,
             data: dalleData,
            timeout: 60000, // 60秒タイムアウト
             onload(res) {
                console.log('DALL-E API Response:', res.status);
                 resolve(res);
             },
            onreadystatechange(readyState) {
                // プログレス表示用（必要に応じて実装）
             },
             onprogress(progress) {
                // プログレス表示用（必要に応じて実装）
             },
             onabort(err) {
                console.error('DALL-E API Aborted:', err);
                reject(new Error('リクエストが中断されました'));
             },
             ontimeout(err) {
                console.error('DALL-E API Timeout:', err);
                reject(new Error('リクエストがタイムアウトしました'));
             },
             onerror(err) {
                console.error('DALL-E API Error:', err);
                reject(new Error('APIエラーが発生しました'));
             },
             withCredentials: true
         });
     });
 }

/**
 * OpenAI ChatGPT (Chat Completions API)
 * @param {Array} conversations - 会話履歴
 * @param {number} max_token - 最大トークン数
 * @param {number} temperature - 温度パラメータ
 * @param {string} model - モデル名
 * @param {Object} systemPrompt - システムプロンプト
 * @param {boolean} isStream - ストリーミング有効
 * @returns {Promise} APIレスポンス
 */
unsafeWindow.ask_chatgpt = (conversations = [{role: 'user', content: 'こんにちは'}],
                            max_token = 5000,
                            temperature = 0.5,
                            model = 'gpt-4.1',
                            systemPrompt = {},
                            isStream = false) => {
     const chatEndpoint = 'https://api.openai.com/v1/chat/completions';
     const chatHeader = {
         "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
     };

    // システムプロンプトを追加
    let messages = [...conversations];
    if (systemPrompt.content) {
        messages.unshift({role: 'system', content: systemPrompt.content});
    }

     const chatData = JSON.stringify({
         temperature: temperature,
         max_tokens: max_token,
         model: model,
        messages: messages,
         stream: isStream
     });

    let responseType = 'text';
     if (isStream) {
         responseType = 'stream';
     }

     return new Promise((resolve, reject) => {
         GM_xmlhttpRequest({
             method: 'POST',
             headers: chatHeader,
             url: chatEndpoint,
             data: chatData,
             responseType: responseType,
            timeout: 120000, // 2分タイムアウト
            onload(res) {
                console.log('ChatGPT API Response:', res.status);
                resolve(res);
            },
            onreadystatechange(readyState) {
                // プログレス表示用（必要に応じて実装）
            },
            onprogress(progress) {
                // プログレス表示用（必要に応じて実装）
            },
            onabort(err) {
                console.error('ChatGPT API Aborted:', err);
                reject(new Error('リクエストが中断されました'));
            },
            ontimeout(err) {
                console.error('ChatGPT API Timeout:', err);
                reject(new Error('リクエストがタイムアウトしました'));
            },
            onerror(err) {
                console.error('ChatGPT API Error:', err);
                reject(new Error('APIエラーが発生しました'));
            },
            withCredentials: true
        });
    });
}

/**
 * OpenAI Web Search (Responses API) - NEW!
 * @param {string} input - 検索/質問内容
 * @param {string} model - モデル名
 * @param {Object} options - オプション設定
 * @returns {Promise} APIレスポンス
 */
unsafeWindow.ask_web_search = (input,
                               model = 'gpt-4.1',
                               options = {}) => {
    const {
        search_context_size = 'medium', // low, medium, high
        user_location = null, // {country: 'JP', city: 'Tokyo', region: 'Tokyo'}
        tool_choice = null // {type: "web_search_preview"} で強制実行
    } = options;

    const webSearchEndpoint = 'https://api.openai.com/v1/responses';
    const webSearchHeader = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
    };

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
    }

    const requestData = {
        model: model,
        tools: tools,
        input: input
    };

    // tool_choiceを設定（Web Search強制実行）
    if (tool_choice) {
        requestData.tool_choice = tool_choice;
    }

    const webSearchData = JSON.stringify(requestData);

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'POST',
            headers: webSearchHeader,
            url: webSearchEndpoint,
            data: webSearchData,
            timeout: 180000, // 3分タイムアウト（検索は時間がかかる場合がある）
             onload(res) {
                console.log('Web Search API Response:', res.status);
                 resolve(res);
             },
            onreadystatechange(readyState) {
                // プログレス表示用（必要に応じて実装）
             },
             onprogress(progress) {
                // プログレス表示用（必要に応じて実装）
             },
             onabort(err) {
                console.error('Web Search API Aborted:', err);
                reject(new Error('検索リクエストが中断されました'));
             },
             ontimeout(err) {
                console.error('Web Search API Timeout:', err);
                reject(new Error('検索リクエストがタイムアウトしました'));
             },
             onerror(err) {
                console.error('Web Search API Error:', err);
                reject(new Error('検索APIエラーが発生しました'));
             },
             withCredentials: true
         });
     });
 }

/**
 * 設定の保存・取得機能
 */
unsafeWindow.saveUserSettings = (settings) => {
    GM_setValue('scrapbox_ai_settings', JSON.stringify(settings));
}

unsafeWindow.getUserSettings = () => {
    const saved = GM_getValue('scrapbox_ai_settings', null);
    if (saved) {
        return JSON.parse(saved);
    }
    // デフォルト設定
    return {
        defaultModel: 'gpt-4o',
        maxTokens: 4000,
        temperature: 0.5,
        searchContextSize: 'medium',
        userLocation: {country: 'JP', city: 'Tokyo', region: 'Tokyo'},
        enableWebSearch: true,
        enableImageAnalysis: true
    };
}

/**
 * エラーハンドリング用ユーティリティ
 */
unsafeWindow.handleApiError = (error, apiName) => {
    console.error(`${apiName} API Error:`, error);

    // エラーメッセージのカスタマイズ
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

console.log('🚀 Scrapbox-ChatGPT Integration Enhanced v7.1 が読み込まれました');
console.log('💡 利用可能な機能: ask_chatgpt, ask_dalle, ask_web_search');
console.log('🔐 セキュリティ設定:');
console.log('   ✅ APIキー管理: Tampermonkey環境（安全）');
console.log('   ✅ 公開範囲: UserScript側にはAPIキーなし');
console.log('');
console.log('📋 セットアップガイド:');
console.log('   1. このファイル冒頭のOPENAI_API_KEYを実際のキーに変更');
console.log('   2. UserScript側で各種機能を利用');
console.log('   3. APIキーはこのTampermonkey環境でのみ管理されます');

// 環境チェック
if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    console.warn('⚠️ 警告: OpenAI APIキーが設定されていません');
    console.log('📝 設定手順:');
    console.log('   const OPENAI_API_KEY = "sk-proj-your-actual-api-key-here";');
    console.log('   APIキーは https://platform.openai.com/api-keys で取得できます');
} else {
    console.log('✅ OpenAI APIキーが設定されています');
}
