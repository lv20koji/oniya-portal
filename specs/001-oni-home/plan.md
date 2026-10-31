# 実装計画: おにホーム（001-oni-home）

## アーキテクチャ概要

```
[公開情報源] [リポジトリ lv20koji/oniya-portal] [閲覧者]
YouTube RSS（メイン/サブ） ─┐
FollowBoard（予定/Twitch） ─┼─→ Muse 定期チェック ─→ broadcasts.json ─→ GitHub Pages
X（ベストエフォート） ─┘ （1日2回・朝夜） （マージ更新） index.html
app.js（表示＋
localStorage記録）
```

- **配信**: GitHub Pages の静的配信のみ。ビルド工程なし（素の HTML/CSS/JS/JSON）。
- **データ**: 放送一覧は broadcasts.json 一本に集約。サイトはこれを fetch して描画する。
- **更新**: Muse のスケジュール実行（朝・夜の1日2回）が公開情報を取得し、broadcasts.json をマージ更新してコミットする。本計画の範囲ではスケジュール登録は行わず、親エージェントの次ステップとする。
- **個人記録**: 視聴状態とメモは localStorage（キー `onihome.logs.v1`）に保存し、broadcasts.json のエントリIDに紐づけて一覧へ統合表示する。サーバー送信なし。

## 取得方法（ソース別）

| ソース | 方法 | 取れる項目 | 備考 |
|---|---|---|---|
| YouTube RSS メイン/サブ | `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>` | video ID、タイトル、URL、公開日時、サムネイル | 直近約15件。長さ・ライブ状態は含まれない |
| FollowBoard 個別ページ | https://followboard.jp/streamers/s-0112 のページ取得 | 次回予定、アーカイブ一覧、最終更新時刻 | Twitch 側情報の代替確認先。長さは取れない |
| Twitch 本体 | 直接取得不可（ブロック確認済み） | — | FollowBoard / TwitchTracker で代替 |
| X（@oniyanogame） | 毎回確認を試行 | 告知の有無 | 読めない回は meta.xChecked=false を記録して継続 |

## カテゴリのパース規則（決定的・単純に保つ）

1. サブch切り抜きのタイトル末尾ブラケット `` があれば、その要素をカテゴリとする（例: 株、雑談）。
2. ブラケット内の `` 等の単独表記があれば「ゲーム」とする。
3. 上記がなければキーワード判定: 「株」「決算」「相場」を含む→「株」、「シャドウバース」「シャドバ」を含む→「シャドバ」、「APEX」「エーペックス」を含む→「ゲーム」。
4. どれにも当たらなければ空配列（画面ではタグなし）。推測で増やさない。

## データスキーマ（broadcasts.json）

```jsonc
{
"meta": {
"lastCheckedAt": "2026-10-31T19:52:00+09:00", // 最終チェック日時（JST）
"xChecked": false, // 直近チェックでXを確認できたか
"xNote": "任意：X未確認の理由など",
"scheduleNote": "任意：FollowBoardで確認した次回予定メモ"
},
"entries": [
{
"id": "yt-main-xYfrGn7lR7c", // 一意ID（source接頭辞＋video ID等）
"source": "youtube-main", // youtube-main | youtube-sub | twitch | followboard
"title": "放送タイトル",
"url": "https://www.youtube.com/watch?v=...",
"publishedAt": "2026-10-31T08:36:16+00:00", // ISO 8601（画面側でJST換算し日付グループ化）
"durationSec": null, // 秒。不明なら null
"categories": ["株"], // 0件以上
"live": false, // 最終チェック時点で配信中か
"thumbnail": "https://i1.ytimg.com/vi/.../hqdefault.jpg", // 任意（YouTubeのみ）
"fetchedAt": "2026-10-31T19:52:00+09:00"
}
]
}
```

- マージ規則: `id` で重複判定。既存エントリは削除せず、新規のみ追加。タイトル変更等は新しい取得値で更新する。
- 並び: ファイル内は公開日時の降順を基本とし、画面側でも降順に整列してから日付グループ化する。

## 画面構成（index.html / app.js）

- ヘッダー（ヒーロー）: サイト名「おにホーム」、概要、クイックリンク（Twitch / YouTube メイン / 天才おにや / X / FollowBoard）、最終チェック日時、X未確認時の注記。
- サマリー: 全件／見た／あとで見る／途中の件数。
- フィルタ: カテゴリ、状態。
- 一覧: 日付グループ（JST、見出し「M/D（曜）」）。各行はサムネイル、タイトル（元へリンク）、長さ（あれば H:MM:SS）、カテゴリタグ、放送中バッジ、状態セレクト＋メモ欄。
- 補助リンク: アーカイブ導線、統計サイト（TwitchTracker / Streams Charts）。
- 入出力: 状態＋メモの JSON エクスポート／インポート。
- デザイン: モバイルファーストの独自カード UI（ライト基調、紺＋オレンジのアクセント）。カトホームの見た目は模倣しない。

## テスト・検証

- broadcasts.json が正しい JSON であること（パース確認）。
- app.js の構文チェック（node --check）。
- ローカル HTTP サーバーで全ファイルが 200 を返すこと。
- 実データのみでシードされていること（取得記録と突き合わせ）。

## 本計画の範囲外（次ステップ）

- GitHub への公開（リポジトリ作成・push・Pages 有効化）。
- 1日2回更新のスケジュール登録。
→ いずれも親エージェントが本作業の報告後に実施する。
