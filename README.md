# dalk

LKの開発に必要なDBやAWS操作をGUIで行う便利ツール

# セットアップ

```shell
npm install
npm run setup
```

`.env`ファイルと、`$HOME/.dalk/sqlite.db`ファイルを生成します。

# 起動するには

開発用の実行を利用してください。

LKの開発用 or ステージングDBに接続できるネットワークが必要です。

```shell
npm run dev
```

もしくは、VSCodeのLauncher（Debug All）で起動するとデバッガが使えます。

# 配布するには

electron製なのでビルドして配布することもできます。（未テスト）

## For Windows

```shell
npm run build:win
```

## For Mac

```shell
npm run build:mac
```

# 開発するには

推奨エディタはVSCodeです。

## Frontendのみ開発する場合

DB接続とかAWSとかをすべてMockで置き換えてコンポーネントだけ開発できます。

```shell
npm run ladle
```

## テスト

DB接続とかAWSとかをすべてMockで置き換えてUI以外の部分をテストできます。

```shell
npm run test
```

# 技術スタック

## 全体

### Electron

- [Electronとは何ですか](https://www.electronjs.org/ja/docs/latest/)

## mainプロセス

### Prisma

- [Get started with Prisma](https://www.prisma.io/docs/getting-started)

2つの用途に利用しています。

- LKのDBアクセス。cmnを使わずdataだけ。
- Dalkで使うデータを格納するSqliteアクセス

## rendererプロセス

### React

- [クイックスタート – React](https://ja.react.dev/learn)

### Jotai

Reactでコンポーネントをまたいだ状態管理

- [Documentation — Jotai](https://jotai.org/docs)

### MUI

UIコンポーネントにMUIのMaterial UIを利用しています。

- [Material UI](https://mui.com/material-ui/getting-started/)

### React Hook Form

フォーム画面を便利に実装する

- [React Hook Form](https://react-hook-form.com/)

### Ladle

Storybookみたいなやつ。すごく軽い。

- [Introduction \| Ladle](https://ladle.dev/docs/)
