const BlogBase = require('./base');

module.exports = (() => {
  class BlogPull extends BlogBase {
    pull() {
      const me = this;
      return new Promise((res, rej) => {
        me
          .fetchBlogEntries()
          .then(entries => me.saveEntries(entries))
          .then(() => {
            res();
          })
          .catch((err) => {
            rej(err);
          });
      });
    }

    fetchBlogEntries() {
      const me = this;
      return new Promise((res, rej) => {
        me.ECHOPF
          .Blogs
          .find(me.config.blogInstanceId)
          .then((results) => {
            const entries = results.map((entry) => {
              if (!entry ||
                  !entry.constructor ||
                  entry.constructor.name !== 'EntryObject') return null;
              return entry;
            });
            res(entries);
          }, (err) => {
            // リソースが見つからない場合
            rej(err);
          });
      });
    }
  }


  return BlogPull;
})();

