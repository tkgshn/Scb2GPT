# インストールガイド

## 前提条件

- 現代的な Web ブラウザ（Chrome、Firefox、Safari）
- OpenAI API アカウントと API キー
- Scrapbox アカウント

## ステップ 1: OpenAI API キーの取得

1. [OpenAI Platform](https://platform.openai.com/api-keys)にアクセス
2. アカウントにログインまたは新規作成
3. 「Create new secret key」をクリック
4. API キーをコピーして安全な場所に保存

## ステップ 2: Tampermonkey のインストール

### Chrome

1. [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)にアクセス
2. 「Chrome に追加」をクリック
3. 「拡張機能を追加」をクリック

### Firefox

1. [Firefox Add-ons](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)にアクセス
2. 「Firefox へ追加」をクリック
3. 「追加」をクリック

### Safari

1. [Mac App Store](https://apps.apple.com/jp/app/tampermonkey/id1482490089)にアクセス
2. 「入手」をクリック
3. インストール後、Safari 拡張機能を有効化

## ステップ 3: Tampermonkey スクリプトの設定

1. Tampermonkey アイコンをクリック
2. 「ダッシュボード」を選択
3. 「新規スクリプト」をクリック
4. `scripts/tempermonkey.js`の内容をコピー&ペースト
5. **重要**: 以下の行の API キーを変更：
   ```javascript
   const dalleToken = "あなたのAPIキー";
   const chatToken = "あなたのAPIキー";
   ```
6. Ctrl+S（Windows/Linux）または Cmd+S（Mac）で保存

## ステップ 4: Scrapbox UserScript の設定

1. Scrapbox プロジェクトの設定を開く
2. 「UserScript」セクションを探す
3. 以下のコードを追加：
   ```javascript
   import "/api/code/あなたのプロジェクト名/scrapbox-chatgpt/script.js";
   ```
4. 新しいページ「scrapbox-chatgpt」を作成
5. 以下のコードブロックを作成：
   ```
   code:script.js
   // scripts/userscript.jsの内容をここにコピー&ペースト
   ```

## ステップ 5: プロジェクト設定の調整

1. `userscript.js`内のホワイトリストを編集：
   ```javascript
   const whitelist = ["あなたのプロジェクト名"];
   ```
2. 必要に応じて他の設定も調整

## ステップ 6: 動作確認

1. Scrapbox でテキストを選択
2. ページメニューまたはポップアップメニューから機能を実行
3. 正常に動作することを確認

## トラブルシューティング

問題が発生した場合は、[README.md](../README.md)のトラブルシューティングセクションを参照してください。
