# ECHOPFでブログを管理するCLIクライアント

## 使い方

### インストール

こちらは予定です。今はcloneして使います。

```
$ npm install echopf-blog -g
```

### 初期化

対話型に設定ファイルが生成されます。

```
$ echopf-blog init .
? ドメイン名（例：your-domain.echopf.com）:  
? アプリケーションID:  
? アプリケーションキー:  
? インスタンスID:  
? ユーザ管理のインスタンスID: 
```

### 既存記事の取得

```
$ echopf-blog pull
```

`entries` ディレクトリ以下にMarkdownファイルが生成されます。

### 新しい記事の作成

新しいブログ記事のテンプレートが生成されます。

```
$ echopf-blog new
記事を生成しました。./20171014113806.md
```

### 新しい記事の投稿

```
$ echopf-blog post 20171014105614.md 
記事をアップロードしました。 http://example.echopf.com/information/entry/20171014105614
記事一覧を更新します。
記事を取得しました。
```

## LICENSE

MIT LICENSE

