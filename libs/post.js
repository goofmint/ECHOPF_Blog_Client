const path = require('path');
const strftime = require('strftime');
const BlogBase = require('./base');
const fs = require('fs');

module.exports = (() => {
  class BlogPost extends BlogBase {
    constructor(options) {
      super(options);
      this.dir = path.resolve(options.dir);
      this.filePath = path.resolve(options.filePath);
      this.article = null;
    }

    post() {
      return new Promise((res, rej) => {
        const me = this;
        this.entry = new this.ECHOPF.Blogs.EntryObject(this.config.blogInstanceId);
        this
          // ファイルを読み込む
          .readFile()
          .then(contents => me.setContents(contents))
          .then(() => me.login())
          .then((data) => {
            // 保存処理
            if (Object.keys(data).length === 0) {
              throw new Error('認証エラー');
            }
            return this.entry.push();
          })
          .then((success) => {
            // 完了
            res(success);
          })
          .catch((err) => {
            rej(err);
          });
      });
    }

    setContents(contents) {
      const me = this;
      return new Promise((res, rej) => {
        const parts = contents
          .match(/---\n([\s\S]*)\n---\n([\s\S]*)$/);
        const headers = parts[1]
          .split('\n').map(str => str.split(': '));
        for (let i = 0; i < headers.length; i += 1) {
          const header = headers[i];
          if (header[0] === 'published') {
            me.entry.put(header[0], new Date(header[1]));
          } else {
            me.entry.put(header[0], header[1]);
          }
        }
        const d = new Date();
        me.entry.put('modified', d);
        me.entry.put('created', d);
        if (me.entry.get('published') && me.entry.get('published') !== '') {
          me.entry.put('status', true);
        }
        const bodies = parts[2].split(me.bodySplit);
        me.entry.put('contents', {
          main: bodies[0],
          detail: bodies[1],
        });
        const acl = new me.ECHOPF.ACL();
        // get, list, edit, deleteの順
        acl.putEntryForAll(new me.ECHOPF.ACL.Entry(true, true, false, false));
        me.entry.setNewACL(acl);
        res();
      });
    }

    readFile() {
      return new Promise((res, rej) => {
        fs.readFile(this.filePath, 'utf-8', (err, data) => {
          if (err) return rej(err);
          res(data);
        });
      });
    }
  }
  return BlogPost;
})();
