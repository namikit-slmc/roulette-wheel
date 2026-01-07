# ルーレットホイール (Roulette Wheel)

選択肢をカスタマイズして抽選できるグラフィカルなルーレットアプリケーションです。

## 🎯 プロジェクト概要

- **名前**: roulette-wheel
- **目標**: 選択肢を事前に登録し、ルーレットでランダムに1つを決定するウェブアプリ
- **技術スタック**: Hono + TypeScript + TailwindCSS + Web Audio API

## ✨ 主な機能

### 実装済み機能

1. **選択肢管理**
   - ✅ 選択肢の追加・削除
   - ✅ 選択肢の一時的なオン/オフ切り替え
   - ✅ 当選確率の調整（x1, x2, x3倍）
   - ✅ ローカルストレージでのデータ永続化

2. **ルーレット抽選**
   - ✅ グラフィカルな円形ルーレット（Canvas描画）
   - ✅ 滑らかな回転アニメーション
   - ✅ 確率に基づいた抽選ロジック
   - ✅ 結果表示モーダル

3. **サウンド機能**
   - ✅ 回転中のチクチク音（Web Audio API）
   - ✅ 当選時の祝福サウンド
   - ✅ サウンドのオン/オフ切り替え

4. **UI/UX**
   - ✅ レスポンシブデザイン
   - ✅ グラデーション背景とグラスモーフィズム
   - ✅ アイコン統合（Font Awesome）
   - ✅ スムーズなアニメーション効果

## 🌐 URLs

- **開発環境**: https://3000-i2dzw5excr2erbkr24fta-d0b9e1e2.sandbox.novita.ai
- **GitHub**: (未設定)
- **本番環境**: (未デプロイ)

## 📊 データアーキテクチャ

### データモデル

```typescript
interface Option {
  id: number;           // ユニークID（タイムスタンプ）
  text: string;         // 選択肢のテキスト
  weight: number;       // 確率の重み（1, 2, 3倍）
  enabled: boolean;     // 有効/無効の状態
}
```

### ストレージ

- **フロントエンド**: ブラウザのLocalStorageに選択肢データを保存
- **キー**: `rouletteOptions`
- **バックエンド**: サーバーサイドのデータベースは不使用（完全にクライアントサイド）

## 📖 利用ガイド

### 選択肢の追加

1. 右側パネルの入力フォームに選択肢を入力
2. 「追加」ボタンをクリック（またはEnterキー）

### 確率の調整

- **x1ボタン**: 通常の確率（デフォルト）
- **x2ボタン**: 2倍の確率で当選
- **x3ボタン**: 3倍の確率で当選

### 選択肢の無効化

- 緑色のチェックボタンをクリックして一時的にオフ
- 再度クリックでオンに戻す
- 無効な選択肢は抽選対象外

### ルーレットの実行

1. 「ルーレットを回す」ボタンをクリック
2. 約4秒間の回転アニメーション
3. 結果がモーダルで表示

### サウンド設定

- 画面上部の「サウンド: ON/OFF」ボタンで切り替え

## 🚀 デプロイメント

### 開発環境

```bash
# ビルド
npm run build

# PM2で起動
pm2 start ecosystem.config.cjs

# 動作確認
curl http://localhost:3000
```

### 本番環境（Cloudflare Pages）

```bash
# Cloudflare API認証設定
# Deploy タブで API キーを設定

# デプロイ
npm run deploy:prod
```

## 📁 プロジェクト構造

```
roulette-wheel/
├── src/
│   ├── index.tsx              # Honoメインアプリ
│   └── renderer.tsx           # レンダラー（未使用）
├── public/
│   └── static/
│       └── app.js             # フロントエンドロジック
├── dist/                      # ビルド出力
├── ecosystem.config.cjs       # PM2設定
├── wrangler.jsonc             # Cloudflare設定
├── package.json
└── README.md
```

## 🔧 技術詳細

### フロントエンド

- **Canvas API**: ルーレットの円形描画と色分け
- **CSS Animations**: 回転アニメーション（`transform: rotate`）
- **Web Audio API**: リアルタイムサウンド生成
- **LocalStorage API**: データ永続化

### バックエンド

- **Hono**: 軽量フレームワーク
- **Cloudflare Workers**: エッジランタイム
- **Static Serving**: `/static/*` パスで静的ファイル配信

## 📝 今後の改善案

- [ ] 選択肢のドラッグ&ドロップでの並び替え
- [ ] 抽選履歴の記録と表示
- [ ] カスタムカラーパレットの設定
- [ ] エクスポート/インポート機能（JSON）
- [ ] より多彩なサウンドオプション
- [ ] アニメーション速度の調整機能

## 📜 ライセンス

MIT License

## 最終更新

2026-01-07
