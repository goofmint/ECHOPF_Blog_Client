#!/usr/bin/env node

const BlogInit = require('./libs/init');
const BlogPull = require('./libs/pull');
const BlogNew = require('./libs/new');
const BlogPost = require('./libs/post');

const program = require('commander');

program
  .version('1.0.0')
  .command('init [path]')
  .description('初期設定ファイルを生成します。最初に実行してください。')
  .action((dir) => {
    // 設定ファイルの生成
    const init = new BlogInit(dir);
    init
      .createConfigFile()
      .then(() =>
        // ディレクトリの作成
        init.createDirectory())
      .then(() => {
        console.log('初期設定が完了しました。続けて list コマンドを実行してみましょう');
      })
      .catch((err) => {
        console.log(`エラーが発生しました。${JSON.stringify(err)}`);
      });
  });

program
  .command('pull')
  .description('サーバ上の記事をダウンロードします。')
  .action(() => {
    const blogPull = new BlogPull({
      dir: '.',
    });

    blogPull
      .pull()
      .then(() => {
        console.log('記事を取得しました');
      })
      .catch((err) => {
        console.log(`エラーが発生しました。${JSON.stringify(err)}`);
      });
  });

program
  .command('new')
  .description('新しい記事のベースを作成します')
  .action(() => {
    const blogNew = new BlogNew({
      dir: '.',
    });

    blogNew
      .generate()
      .then(() => {
        console.log(`記事を生成しました。./${blogNew.entry.refid}.md`);
      });
  });

program
  .command('post [filePath]')
  .description('記事を新規投稿します')
  .action((filePath) => {
    const blogPost = new BlogPost({
      dir: '.',
      filePath,
    });
    blogPost
      .post()
      .then((entry) => {
        console.log(`記事をアップロードしました。 ${entry.get('url')}`);
        const blogPull = new BlogPull({
          dir: '.',
        });
        console.log('記事一覧を更新します。');
        return blogPull.pull();
      })
      .then(() => {
        console.log('記事を取得しました。');
      })
      .catch((err) => {
        console.log(`エラーが発生しました。${JSON.stringify(err)}`);
      });
  });

program.parse(process.argv);
