const pd = require('pretty-data').pd;
const fs = require('fs');
const inquirer = require('inquirer');
const BlogBase = require('./base');

module.exports = (() => {
  const askConfig = () => inquirer.prompt([
    {
      name: 'domain',
      message: 'ドメイン名（例：your-domain.echopf.com）: ',
    },
    {
      name: 'applicationId',
      message: 'アプリケーションID: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'アプリケーションIDは英数字しか使えません。'),
    },
    {
      name: 'applicationKey',
      message: 'アプリケーションキー: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'アプリケーションキーは英数字しか使えません。'),
    },
    {
      name: 'blogInstanceId',
      message: 'インスタンスID: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'インスタンスIDは英数字しか使えません。'),
    },
    {
      name: 'memberInstanceId',
      message: 'ユーザ管理のインスタンスID: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'インスタンスIDは英数字しか使えません。'),
    },
    {
      name: 'login_id',
      message: 'ログインID: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'インスタンスIDは英数字しか使えません。'),
    },
    {
      name: 'password',
      message: 'パスワード: ',
      validate: input => (input.match(/^[a-zA-Z0-9]*$/) ? true : 'インスタンスIDは英数字しか使えません。'),
    },
  ]);

  class BlogInit extends BlogBase {
    constructor(dir) {
      super({ dir });
    }

    createConfigFile() {
      const me = this;
      return new Promise((res, rej) => {
        me.checkConfig()
          .then(() => askConfig())
          .then((config) => {
            const json = pd.json(config);
            fs.writeFile(me.configPath, json, err => (err ? rej(err) : res()));
          })
          .catch((err) => {
            if (err.code === 'exit') res();
            rej(err);
          });
      });
    }

    checkConfig() {
      const me = this;
      return new Promise((res, rej) => {
        fs.access(me.configPath, (err) => {
          // ファイルがない場合
          if (err) return res();

          inquirer.prompt([{
            name: 'file',
            message: '設定ファイルが存在します。上書きしていいですか？',
            type: 'confirm',
          }])
            .then(answers => (answers.file ? res() : rej({ code: 'exit' })));
        });
      });
    }

    createDirectory() {
      const dirName = `${this.dir}/entries`;
      return new Promise((res, rej) => {
        fs.access(dirName, (err) => {
          if (!err) {
            return res(err);
          }
          fs.mkdir(dirName, (err) => {
            err ? rej(err) : res();
          });
        });
      });
    }
  }

  return BlogInit;
})();

