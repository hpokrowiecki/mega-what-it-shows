# mega-what-it-shows

MEGA.dev S01E03. `support-kb/` is the support desk's kb export, with one page added:

- the page: `support-kb/src/routes/kb/incidents/4471-problems/+page.svx` (signed, desk ref `DR-EE97-0404`)
- the page as the desk sees it, next to it: `support-kb/src/routes/kb/incidents/4471-problems/4471-problems.html`
  and `4471-problems.png`; the whole kb as built: `support-kb/desk-view/` (this page at
  `support-kb/desk-view/kb/incidents/4471-problems.html`), served on GitHub Pages:
  https://hpokrowiecki.github.io/mega-what-it-shows/kb/incidents/4471-problems.html
- the tickets: issues #1 (parser), #2 (hint) and #3 (one-day move) in this repo

Build the kb again with `cd support-kb && npm install && npm run build`.
