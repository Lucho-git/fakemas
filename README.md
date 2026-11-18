# Luchodore

A static site of events. The home page shows one cover per event; clicking a
cover opens that event. No build step.

**Live: <https://luchodore.com/>**

```
index.html          the home page: one cover per event
home/               the covers shown on the home page
fakemas-2026/       Fakemas 2026, the Ross family Christmas quiz (see its README)
```

## Adding an event

1. Put the event in its own folder beside `index.html`, with its own
   `index.html` inside. Keep its paths relative so the folder works wherever the
   site is hosted.
2. Save its cover image in `home/`.
3. In `index.html`, copy the `<a class="event">` block and point the copy at the
   new folder and cover. Two or more covers sit side by side and shrink to fit.

## Preview and publish

Run `python -m http.server 8123` in this folder and open
<http://localhost:8123>.

Pushing to `main` publishes the site. Cloudflare builds it from this repository
(the `fakemas` project under Workers & Pages) and serves it at luchodore.com;
`wrangler.jsonc` tells it to serve the folder as static files and
`.assetsignore` lists what to leave out. GitHub Pages still serves a copy at
<https://lucho-git.github.io/fakemas/>.
