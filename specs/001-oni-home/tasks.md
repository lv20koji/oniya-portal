# タスク: おにホーム（001-oni-home）

## 仕様策定（Spec Kit）
- [x] 調査メモ作成（カトホーム構造・取得元評価）→ `spec-research.md`
- [x] 憲法（原則）の策定 → `.specify/memory/constitution.md`
- [x] 仕様書の作成（確定した決定事項・ユーザーストーリー・受け入れ条件）→ `spec.md`
- [x] 実装計画の作成（アーキテクチャ・データスキーマ・パース規則）→ `plan.md`
- [x] 本タスクリストの作成 → `tasks.md`

## データ（シード）
- [x] YouTube RSS（メイン UCLiQ--EXgzUV03q5jKQYWcw）を取得し15件を収録
- [x] YouTube RSS（サブ「天才おにや」UCC0FNUII8Zp2OAc7IaetICg）を取得し15件を収録
- [x] FollowBoard 個別ページを確認（次回予定あり・開始未定を meta.scheduleNote に記録）
- [x] カテゴリのパース規則を適用（ブラケット優先＋キーワード判定）
- [x] meta.lastCheckedAt に実際の取得時刻（JST）を記録
- [x] X はシード時に未確認のため meta.xChecked=false と注記を記録

## サイト実装
- [x] index.html 改訂（クイックリンク5件、最終チェック日時、フィルタ、アーカイブ枠、補助リンク）
- [x] style.css 改訂（独自デザイン：ライト基調＋紺/オレンジ、モバイルファースト）
- [x] app.js 改訂（日付グループ表示、カテゴリ/状態フィルタ、放送中バッジ、長さ表示）
- [x] 視聴メモ（状態＋メモ）を localStorage `onihome.logs.v1` に保存し一覧へ統合
- [x] 件数サマリー表示（全件／見た／あとで見る／途中）
- [x] 視聴メモの JSON エクスポート／インポート
- [x] README.md 更新（構成・更新方式・公式リンク・制限）

## 検証
- [x] 全ファイルの存在確認
- [x] broadcasts.json の JSON 妥当性確認（30件）
- [x] app.js の構文チェック（node --check）
- [x] ローカル HTTP で全ファイル 200 を確認

## 次ステップ（親エージェント担当・本タスク範囲外）
- [ ] GitHub リポジトリ `lv20koji/oniya-portal` 作成と公開（GitHub Pages 有効化）
- [ ] 1日2回（朝・夜）の定期チェック＋broadcasts.json 更新スケジュール登録
