インターネットの新着記事をユーザーの代わりに定期的に自動チェックし、要約して短い見出しにまとめ直してくれるサービス。
ユーザーは 1 つの記事あたり 1 画面の UI でどんどんスワイプすることで表示、既読管理し、気になった記事は元サイトにジャンプすることで読むこともできます。

## 仕組み

1. サーバーで毎日ユーザーが登録した RSS をすべて取得する
2. サーバーで取得した新規記事ごとにユーザーが入力したプロンプトを持つ AI が記事内容をサイトにアクセスして取得し、内容を要約してまとめ記事を生成する
3. サーバーはまとめ記事をクライアントに配信する
4. ユーザーはクライアントで未読のまとめ記事を読み、読んだまとめ記事は既読をつける
5. ユーザーは気になる記事を元サイトを開くことで詳細に読むこともできる

## Google Cloud のセットアップ

<./google-cloud.md>

## 開発

ローカルで poller のテスト実行をする:

```console
$ cd poller/
$ cp .env.example .env && vi .env # 各種変数を設定する
$ docker build -t internet-news-agent/poller:dev . && docker run --rm -it -v "$(pwd)/.env:/home/node/app/.env:ro" -v "$HOME/.config/gcloud:/root/.config/gcloud:ro" internet-news-agent/poller:dev
```

ローカルで web のテスト実行をする:

```console
$ cd web/
$ npm ci
$ npm run dev
```
