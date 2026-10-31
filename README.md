# おにホーム

配信者おにや（o-228）の放送を追うための、個人用の静的ポータルサイト。
カトホーム（web.katohome.jp）の「日付別アーカイブ一覧」という構成を参考にし、文言・デザイン・データはすべてオリジナルです。

- 公開予定: https://lv20koji.github.io/oniya-portal/ （リポジトリ `lv20koji/oniya-portal`、本書作成時点では未公開）
- 仕様・計画: `specs/001-oni-home/`（spec.md / plan.md / tasks.md）、原則: `.specify/memory/constitution.md`、調査メモ: `spec-research.md`

## 構成ファイル

| ファイル | 役割 |
|---|---|
| index.html | 画面（クイックリンク、最終チェック日時、放送アーカイブ、絞り込み、補助リンク） |
| style.css | 独自デザイン（ライト基調カードUI） |
| app.js | broadcasts.json の描画（日付グループ・フィルタ）、視聴メモの保存・入出力 |
| broadcasts.json | 放送データ（公開フィード／公開ページから取得した実データのみ） |

## データの更新

- APIキーは使わず、公開情報をもとに1日2回（朝・夜）Muse が確認し、broadcasts.json をマージ更新します（スケジュール登録は公開フェーズで実施）。
- 取得元： YouTube RSS（メイン `UCLiQ--EXgzUV03q5jKQYWcw`／サブ「天才おにや」`UCC0FNUII8Zp2OAc7IaetICg`）、FollowBoard（https://followboard.jp/streamers/s-0112、予定・Twitch 側の確認）、X（@oniyanogame、ベストエフォート。確認できなかった回は broadcasts.json の `meta.xChecked` が `false` になります）。
- 「放送中」等の状態は最終チェック時点の情報です。画面上部に最終チェック日時を常時表示します。

## 自分の視聴メモ

- 各放送への状態（見た／あとで見る／途中）とメモは、ブラウザの localStorage（キー `onihome.logs.v1`）にのみ保存され、外部送信されません。
- JSON エクスポート／インポートで別端末へ移せます。

## 公式リンク

- Twitch: https://www.twitch.tv/oniyadayo
- YouTube メイン: https://www.youtube.com/channel/UCLiQ--EXgzUV03q5jKQYWcw
- YouTube サブ「天才おにや」: https://www.youtube.com/channel/UCC0FNUII8Zp2OAc7IaetICg
- X: https://twitter.com/oniyanogame
- FollowBoard: https://followboard.jp/streamers/s-0112
- TwitchTracker: https://twitchtracker.com/oniyadayo
- Streams Charts: https://streamscharts.com/channels/oniyadayo

## 制限

- GitHub Pages は静的サイトのため、配信開始の通知やリアルタイム判定はできません。
- YouTube RSS は直近約15件／チャンネルまで。長さ（duration）は RSS に含まれないため、取れた場合のみ表示します。
- Twitch 本体のページは自動取得できないため、FollowBoard 等の公開情報で代替確認します。
