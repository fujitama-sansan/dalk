import { HelpContent } from '../help/HelpContent'

const main: HelpContent = {
  title: 'SQS(lk-dev)',
  description: `lk-devのSQSを使ってMessaging.Serverに自由にメッセージを送信できます。
  
メッセージ内容を保存して再利用できます。

「送信」ボタンをクリックすると、最下部に表示されているJSONを送信します。

### 注意
この機能を使うためには、\`$UserProfile/.aws/credentials\`に適切な設定が必要です。

aws-vault等サードパーティツールを使用した時にcredentialsが壊れることがあるため、その場合は再度設定してください。

### Name
メッセージを保存する際の名前です。

### Queue
lk-devに存在するキューを選択します。

### Message class, Correlation ID, Graph
Messaging.Serverの仕様で指定する内容です。`,
  tooltip: '使い方'
}

export const SqsViewHelp = {
  main
}
