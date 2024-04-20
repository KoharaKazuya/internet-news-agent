# Google Cloud メモ

## 構成

- Cloud Run ジョブ: dispatcher の定期実行をする
  - 環境変数: `CLOUD_RUN_JOB_NAME`
  - スケジュールトリガー: `43 4 * * *`
- Cloud Run ジョブ: poller の環境変数、並列数を設定する
  - 環境変数: `OPENAI_API_KEY`
  - 並列処理のカスタム上限 (と並列数の上限のためのタスク数): 1
    - (OpenAI API の Tier1 のレートリミットだと 60,000 TPM。概ね 5,000 Token/Request で 5 Request/Minute ぐらいなので並列数を上げなくても結構ギリギリ)
- Firebase Firestore: まとめの保存、既読管理をする
  - ネイティブモード
  - ロケーションタイプ: リージョン `asia-northeast1`
  - その他各パラメーターはデフォルト設定
- Firebase Hosting: web のホスティング、サーブ
  - カスタムドメインを追加
- Firebase Authentication: web の認証
  - プロバイダとして Google を追加する
  - 承認済みドメインにカスタムドメインを追加する

## デプロイ方法

### poller

```console
$ cd poller
$ gcloud run jobs deploy --source .
```

### web

```console
$ cd web
$ npm run build
$ firebase deploy
```
