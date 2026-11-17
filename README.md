# Fakemas — The Ross Family Christmas Quiz

**Live: <https://lucho-git.github.io/fakemas/>**

A self-contained, static slide deck for the Fakemas event. No build step, no
dependencies (fonts load from Google Fonts, everything else is local).

## Files

```
index.html               markup skeleton — nav, deck container, script tags
assets/css/styles.css    all styling
assets/js/content.js      questions, riddles, people, trip, event  ← edit this
assets/js/slides.js       slide builders & running order
assets/js/app.js          navigation, reveals, keyboard/swipe, snowfall, jingle
assets/img/               photos (standalone media)
assets/img/trip/          the Philippines bonus slideshow
assets/img/movies/        "guess the movie scene" stills
assets/video/             video clips
assets/audio/jingle.mp3   background jingle (loops)
```

## Run it

The deck is published with GitHub Pages from the `main` branch root, so every
push to `main` redeploys <https://lucho-git.github.io/fakemas/> in about a minute.

To run it locally (and preview changes before pushing), open `index.html`
directly in a browser, or serve the folder:

```
python -m http.server 8123
```

then visit <http://127.0.0.1:8123/>.

## Editing content

Everything you normally want to change is in [content.js](assets/js/content.js):

- `EVENT` — teaser name and date shown on the opening slide.
- `quiz` — Part 1 questions (12 of them). `long:true` shrinks the answer text
  for wordy answers.
- `riddles` — Part 3. `lines` are printed one per line; `ask` is optional.
- `people` — Part 5 cards. `v` is `"naughty"` or `"nice"`.
- `movieScenes` — Part 4, the "guess the movie scene" game (see below).
- `trip` — the bonus section, the Philippines slideshow (see below).

If you add or remove quiz questions, update the "12 Questions…" ribbon in
[slides.js](assets/js/slides.js) to match — slide numbers look after themselves.

## Guess the Movie Scene

Part 4 is a seven-scene film round. Each picture is a still from a Christmas
movie, the slide asks *"Which Christmas movie is this from?"*, and `Space`
reveals the title. The list lives in `movieScenes` in
[content.js](assets/js/content.js):

```js
const movieScenes = [
  { file: "bad-santa.jpg", title: "Bad Santa" },
  ...
];
```

`file` is relative to `assets/img/movies/`, `title` is what gets revealed. To
add or swap a scene, drop the image in that folder and add a line — the
"Scene 1 of 7" counter and slide count update themselves.

Image `alt` text is deliberately generic ("Christmas movie scene 3") so screen
readers don't spoil the answer.

## The Philippines bonus section

The bonus section is the "Lach & Eleanor's Trip to the Philippines" interlude. It lives in
`trip` inside [content.js](assets/js/content.js):

```js
const trip = {
  kicker, title, blurb,      // divider slide text
  intro: [ ... ],            // bullet lines on the "why are we showing you this" slide
  photos: [
    { src: "assets/img/trip/trip-01.jpg", caption: "Photo 01 — caption placeholder" },
    ...
  ],
  interjections: [
    { after: 3, by: "Lach", text: "Interjection placeholder — …" },
    ...
  ]
};
```

- Photos run in list order; each gets its own slide with a polaroid frame and
  the slide counter `01 / 29`.
- `after: N` drops an interjection slide in **after photo N** — that's where the
  random commentary goes.
- Captions, intro lines and interjections are all placeholders; replace the text
  between the quotes. The section is styled teal/sand rather than Christmas red,
  which is why it isn't pretending to be festive.

The current photos are `trip-01…trip-15` (the main set) then `flex-01…flex-14`
(the "Lach Flexing" set), both in alphabetical order of the original filenames.

## Music

`assets/audio/jingle.mp3` is a 30-second synth loop of *Jingle Bells* (a
public-domain tune) generated for this deck, so there are no licensing strings
attached. It starts on the first click or keypress — browsers block audio until
the presenter interacts — and loops for the whole presentation. The `♪` button
in the bar mutes and unmutes it.

To use your own track, replace `assets/audio/jingle.mp3` (keep the name) or
point the `<audio>` element in [index.html](index.html) at another file. Volume
is set in [app.js](assets/js/app.js) (`jingleEl.volume = 0.4`).

## Adding photos & video

1. Drop the file into `assets/img/` or `assets/video/`.
2. Add a `media` object to the question or riddle it belongs to:

```js
{ q: "Was Santa's belly real or a prosthetic?",
  a: "Real.",
  icon: "🎅",
  media: { src: "assets/img/santa-belly.jpg", alt: "Santa at the door" } }

{ q: "How did mum and dad stop us from peeking?",
  a: "…",
  media: { src: "assets/video/peeking.mp4",
           poster: "assets/img/peeking-poster.jpg",
           caption: "The kids wing, 9:58 pm",
           wide: true } }
```

Video is detected from the file extension (`.mp4`, `.webm`, `.mov`, `.m4v`,
`.ogv`). It plays with native controls; `poster` shows a still before playback
and `wide: true` gives it a taller frame. If an image path is wrong it is
hidden rather than showing a broken-image icon.

Videos autoplay nothing — the presenter taps play. Keep clips short (5–15 s)
and 720p or smaller so they load quickly.

## Controls

| Action | Keys |
| --- | --- |
| Next / previous slide | `→` `←` `PageDown` `PageUp` |
| Reveal answer, then advance | `Space` / `Enter` |
| First / last slide | `Home` / `End` |
| Fullscreen | `F` or the button |
| Advance | swipe left/right on touch |

The current slide number is kept in the URL (`index.html#12`), so you can
bookmark or reload a slide.

## Adding or reordering slides

Slides are built in [slides.js](assets/js/slides.js) into the `slides` array —
order in the file is order on screen. Helpers:

- `part(1, "Title", "🎄")` — a part divider.
- `mystery("Reveal answer", "🎁")` + `<div class="rv" data-rv>…</div>` — the
  click-to-reveal pair.
- `media({ … })` — photo or video block.
