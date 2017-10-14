const ECHOPF = require('../ECHO');
const path = require('path');
const fs = require('fs');
const toMarkdown = require('to-markdown');

module.exports = (() => {
  class BlogBase {
    constructor(options) {
      this.dir = `${path.resolve(options.dir)}/entries/`;
      this.configPath = `${path.resolve(options.dir)}/echopf.config.json`;
      this.config = options.config;
      if (this.configPath) {
        this.config = require(this.configPath);
        ECHOPF.initialize(
          this.config.domain,
          this.config.applicationId,
          this.config.applicationKey,
        );
        this.ECHOPF = ECHOPF;
      }
      this.bodySplit = '<!--more-->';
    }
    login() {
      return this.ECHOPF.Members.login(
        this.config.memberInstanceId,
        this.config.login_id,
        this.config.password,
      );
    }
    saveEntries(entries) {
      const me = this;
      return new Promise((res, rej) => {
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          const data = this.entryToMarkdown(entry);
          fs.writeFile(`${me.dir}/${entry.refid}.md`, data.join('\n'), err => (err ? rej(err) : ''));
        }
        res(true);
      });
    }
    entryToMarkdown(entry) {
      // 書き込み
      let data = ['---'];
      data.push(`refid: ${entry.refid}`);

      const metas = [
        'title',
        'description',
        'keywords',
        'robots',
        'link_status',
        'owner',
        'published',
      ];
      data = data.concat(this.pushMeta(metas, entry));
      data = data.concat(this.pushCategories(entry.get('categories')));

      data = data.concat(this.pushAcl(entry.getACL()));

      data.push('---');

      data = data.concat(this.pushContent(entry.get('contents')));

      return data;
    }

    pushContent(contents) {
      if (!contents) return [];
      const data = [];
      const contentType = ['main', 'detail'];
      for (let i = 0; i < contentType.length; i += 1) {
        const type = contentType[i];
        const content = contents[type];
        data.push(toMarkdown(content)
          .replace(/!\[(.*?)\]\((.*?)\)/g, `![$1](https://${this.config.domain}$2)`));
        if (type === 'main') { data.push(`\n${this.bodySplit}\n`); }
      }
      return data;
    }

    pushMeta(metas, data) {
      return metas.map(meta => `${meta}: ${data.get(meta) || ''}`);
    }

    pushCategories(categories) {
      const data = [];
      if (!categories) return [];
      data.push('categories: ');
      for (let i = 0; i < categories.length; i += 1) {
        const category = categories[i];
        data.push(`  - ${category.get('refid')} : ${category.get('name')}`);
      }
      return data;
    }

    pushAcl(acls) {
      if (!acls) return [];
      const data = [];
      const metas = [
        '_all',
        '_allMembers',
        '_specificGroups',
        '_specificMembers',
      ];
      data.push('acl:');
      for (let i = 0; i < metas.length; i += 1) {
        const meta = metas[i];
        if (Object.keys(acls[meta]).length === 0) {
        // Empty
          data.push(`  ${meta}: `);
        } else {
          data.push(`  ${meta}:`);
          const acl = acls[meta];
          const subMetas = ['get', 'list', 'edit', 'delete'];
          for (let j = 0; j < subMetas.length; j += 1) {
            const key = subMetas[j];
            if (typeof acl[key] !== 'undefined') {
              data.push(`    ${key}: ${acl[key]}`);
            }
          }
        }
      }
      return data;
    }
  }


  return BlogBase;
})();
