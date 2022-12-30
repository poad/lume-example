import lume from "lume/mod.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import mdx from "lume/plugins/mdx.ts";
import a11yEmoji from 'npm:@fec/remark-a11y-emoji';
import rehypeRemoveComments from 'npm:rehype-remove-comments@5';
import emoji from "npm:markdown-it-emoji";
import anchor from "npm:markdown-it-anchor";
import footnote from "npm:markdown-it-footnote";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.1.0/toc/mod.ts";
import cheerio from 'https://jspm.dev/cheerio';

// Markdown plugin configuration
const markdown = {
  plugins: [emoji, [anchor, { level: 2 }], footnote, toc],
  keepDefaultPlugins: true,
};

const site = lume({
  src: "./src",
  dest: "./public",
  emptyDest: true,
}, { markdown });

site
  .use(multilanguage())
  .use(codeHighlight())
  .use(jsx())
  .use(mdx({
    remarkPlugins: [a11yEmoji],
    rehypePlugins: [rehypeRemoveComments],
  }));

site.filter('groups', items => items.reduce((grouped, item) => {
    const {group} = item.data;
    (grouped[group] = grouped[group] || []).push(item);
    return grouped;
  }, {})
);

site.filter('toc', content => {
  const $ = cheerio.load(content);
  const toc = [];
  $('h1[id],h2[id],h3[id]').each((_, el) => {
    const $el = $(el);
    toc.push({
      level: Number(el.name.substring(1)),
      anchor: $el.attr('id'),
      text: $el.text().replace(/^#/, ''),
    });
  });
  return toc;
});

export default site;
