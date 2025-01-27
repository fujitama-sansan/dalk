import { HelpContent } from '../help/HelpContent'

const main: HelpContent = {
  title: 'クエリの実行速度計測',
  description: `選択中のDBに対して、選択したUcompanyIdごとにSQLを実行し、時間を計測します。
### グラフ表示用：実行時間しきい値（ミリ秒）
「実行」をクリックした際、この時間を超えたUcompanyIdだけがグラフに表示されます。

### UcompanyId
指定すると、このUcompanyIdに対してクエリを実行します。

カンマまたはスペース区切りで複数指定できます。SQLのSELECT文を書くと、全shardで1回ずつ実行してUcompanyIdを動的に取得できます。

ここで得られたUcompanyIdの数だけ、クエリ本体を実行します。

指定しない場合は、クエリ本体を全shardで1回ずつ実行します。

### クエリ本体
SQLには@で始まる変数を含めることができます。

"@UcompanyId"は特別に予約されていて、常に使うことができます。

SQL中に\`@変数名\`を含めると、その変数を取得するSQLを入力するためのテキストエリアが追加されます。

### @変数名 を取得するSQL
クエリ本体と同様に、@で始まる変数を含めることができます。
`,
  tooltip: '使い方'
}

export const SQLViewHelp = {
  main
}
