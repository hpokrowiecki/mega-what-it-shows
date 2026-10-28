import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

// Pages are .svx (Markdown with components); `layout: runbook` in the frontmatter picks the frame.
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook } })],
  kit: {
    // desk-view/ is the kb as the desk sees it: static HTML with the styles inlined.
    adapter: adapter({ pages: 'desk-view', assets: 'desk-view', strict: false }),
    alias: { '#lib': 'src/lib' },
    inlineStyleThreshold: Infinity,
    prerender: { entries: ['/kb'], handleHttpError: 'warn' },
  },
};
