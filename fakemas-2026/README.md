# Fakemas — The Ross Family Christmas Quiz

**Live: <https://lucho-git.github.io/fakemas/fakemas-2026/>**

A self-contained, static slide deck for the Fakemas event. It is one event on
the site: the home page one folder up links to it, and every path below is
relative to this folder. No build step, no
dependencies (fonts load from Google Fonts, everything else is local).

## Files

```
index.html               markup skeleton — nav, deck container, script tags
assets/css/styles.css    all styling
assets/js/content.js      questions, riddles, players, people, trip  ← edit this
assets/js/slides.js       slide builders & running order
assets/js/app.js          navigation, timeline, scoreboard, reveals, snowfall, jingle
assets/img/               photos (standalone media)
assets/img/trip/          the Philippines bonus slideshow
assets/img/movies/        "guess the movie scene" stills
assets/img/people/        photos for the family quiz answers
assets/img/birds/         the bird round
assets/img/dogs/          Jack & Thumper, for their gift card
assets/img/cards/         square face crops for the naughty or nice cards
assets/img/gifts/         photos on the other gift cards
assets/video/             video clips
assets/audio/jingle.mp3   background jingle (loops)
assets/audio/trip.mp3     stand-in music for the Philippines slideshow
assets/audio/sfx/         sound effects (grumble, wolf howl, dog bark)
assets/audio/local/       optional: your own audio files — not in git, never published
```

## Run it

The deck is published with GitHub Pages from the `main` branch root, so every
push to `main` redeploys <https://lucho-git.github.io/fakemas/fakemas-2026/> in about a minute.

To run it locally (and preview changes before pushing), open `index.html`
directly in a browser, or serve the folder:

```
python -m http.server 8123
```

then visit <http://127.0.0.1:8123/>.

## Editing content

Everything you normally want to change is in [content.js](assets/js/content.js):

- `players` — the names on the scoreboard (see below).
- `quiz` — Part 1, the family questions (13 of them), with an intermission in
  the middle: an entry with `intermission` (its heading) and a `video` is a slide
  where a silent clip plays by itself on a loop, and it takes no question number.
- `trivia` — Part 2, general Christmas trivia. Same shape as `quiz`, so
  `long:true` shrinks wordy answers and `media` still works. Some have
  multiple-choice options (see below).
- `riddles` — Part 4. `lines` are printed one per line; `ask` is optional.
- `movieScenes` — Part 5, guess the movie scene, then a question on that film
  (see below).
- `birds` — the surprise bird round after the movies (see below).
- `codeWords` — Part 6, the "Santa's Code Words" clue game (see below).
  `codePoster` is the photo on its title slide.
- `people` — Part 7 cards, dealt in the order listed. `v` is `"naughty"` or
  `"nice"`; `why` is the reason that appears when the card is stamped, with `tag`
  in brackets under it; `photo` is a square picture that spins into the
  silhouette at the same moment (leave it off and the silhouette stays).
- `trip` — the bonus section after the riddles: "who is Santa?", then the
  Philippines slideshow (see below).

Add or remove questions freely: the "12 Questions…" ribbons and the slide
numbers count themselves.

The deck opens straight on Part 1 — there is no cover or overview slide.

## Multiple choice

Any question (family quiz, trivia or a movie question) can offer choices. Add
`options` and `correct` to it in [content.js](assets/js/content.js):

```js
{ q: "Which country sends London the giant Christmas tree for Trafalgar Square each year?",
  a: "Norway.", icon: "🌲",
  options: ["Sweden", "Canada", "Germany", "Norway"], correct: "Norway" }
```

The options are lettered A–D under the question. On reveal the `correct` one
turns green, the others fade, and the answer banner leads with that option's
letter ("B: Dad.") so the two always agree. `correct`
must be spelt exactly as its option. Leave `correct` off and no option is
marked — useful when the "answer" is an argument (Jev and Ella's first date).

## Guess the Movie Scene

Part 5 is a seven-film round with two slides per film:

1. **The scene** — a still, *"Which Christmas movie is this from?"*, and `Space`
   reveals the title.
2. **The question** — one question about that film, on the next slide, so nobody
   sees the film's name or its question until the scene has been guessed.

Both live in `movieScenes` in [content.js](assets/js/content.js):

```js
const movieScenes = [
  { file: "die-hard.jpg", title: "Die Hard",
    q: "What is the name of the tower John McClane is trapped in?",
    a: "Nakatomi Plaza.", icon: "🏢" },
  ...
];
```

`file` is relative to `assets/img/movies/` and `title` is what gets revealed.
`q`, `a` and `icon` make the follow-up question; leave `q` off a scene to skip
it. Add `options` and `correct` to make it multiple choice (most of them are). To add or swap a film, drop the image in that folder and add a line — the
"Scene 1 of 7" counter and slide count update themselves.

Image `alt` text is deliberately generic ("Christmas movie scene 3") so screen
readers don't spoil the answer.

**Covers.** When a scene's title is revealed, the film's cover spins in as a DVD
case. `cover` on each scene is the address of its poster, shown straight from
Wikipedia rather than stored in this project, so it needs internet. With no
connection (or no `cover`) the case shows the film's title instead.

## Do You Know Your Birds?

The surprise round after the movies, set in `birds` in
[content.js](assets/js/content.js). It has two slides:

1. **The opener** — `opener`, an ordinary question with its photo on show from
   the start ("What kind of bird is this?").
2. **The matching game** — `match`, a list of `{ name, src }`. Each name gets a
   letter in list order (A, B, C…) and the photos are dealt out shuffled above
   them, numbered 1, 2, 3… so players can write their answers down as
   "3 = C". The host can also drag a photo onto a name; dropping onto a taken
   name swaps the two, and dragging back to the tray takes it off. On a touch
   screen, tap a photo and then tap where it goes.

`Space` shows the answers: every photo moves to its correct name, still wearing
its number, so the key reads straight off the screen. Any photo that had been
dragged into place also gets a ✓ or ✗.
Photos are in `assets/img/birds/`, cropped to 4:3. `birds.poster` is the photo
beside the title on the round's opening slide (Dad); delete the line to go
without one.

## Santa's Code Words

Part 6 is a three-round clue game. Each round shows one clue word, a number,
and a 4 × 4 board of 16 words; the number is how many words on the board link to the
clue. The rounds live in `codeWords` in [content.js](assets/js/content.js):

```js
const codeWords = [
  { clue: "Stocking",
    hits: ["COAL", "SHELF", "LEG"],          // the answers
    why:  "<b>Coal</b> in a naughty one · …",   // one line, shown once they're all found
    words: [ "TINSEL", "PIANO", "COAL", … ] }, // the whole board, in reading order
  ...
];
```

- `hits` must be spelt exactly as they appear in `words`. The number beside the
  clue is just `hits.length`, so it updates itself.
- Boards are 16 words, four across on every screen. Keep the count a multiple
  of four for a tidy grid.
- Some of the wrong words are deliberate traps (`GLOVE`, `MOOSE`, `KING`…).
  When swapping words in, check a new one doesn't accidentally fit the clue.

To play: someone calls a word and the presenter clicks its card — it turns
green if it's an answer, grey if not. `Space` turns over the remaining answers
one at a time, then shows the explanation, then moves on.

## The bonus section: who is Santa?

The bonus section comes straight after the riddles and before the movie round.
It runs in four beats, all set in `trip` inside
[content.js](assets/js/content.js):

1. **The question** — `reveal.question`, with Santa and Mrs Claus drawn as two
   shadowy figures. On reveal they dissolve into `reveal.photo` and the banner
   shows `reveal.answer`.
2. **The credit** — "This quiz was brought to you by" (`credit.lead`) and
   `credit.names`. The slideshow music starts here.
3. **The photos** — one slide per photo and nothing else: no captions,
   commentary or interjection slides. Each photo arrives with its own entrance
   (spin, drop, fly, zoom, swing, flip, roll) while the one before it slides off
   to rest at the side, so up to three are on screen at once. The last photo
   carries the sign-off from `outro` ("Fakemas — brought to you by Lach &
   Eleanor") on its polaroid.
4. **The pop quiz** — first `stop`: a photo of Lach holding up a stop sign slams
   in beside "Stop right there!", the line under it and the "worth triple
   points" banner (`title`, `line`, `kicker`). Then `popQuiz`, the question
   itself, on the next slide. Its `media` photo appears with the answer. A wolf
   howls while the question is up and dogs bark on the reveal (its `sound`).
   Delete `stop` or `popQuiz` to drop either slide.

```js
const trip = {
  reveal: { question: "What are Santa Claus and Mrs Claus's real identities?",
            answer: "Lachie and Eleanor!",
            photo: "assets/img/trip/trip-01.jpg" },
  credit: { lead: "This quiz was brought to you by", names: "Lach &amp; Eleanor" },
  outro: { title: "Fakemas", line: "brought to you by Lach &amp; Eleanor" },
  stop: { src: "assets/img/stop-sign.jpg", title: "Stop right there!",
          line: "…", kicker: "Pop quiz — worth triple points" },
  popQuiz: { q: "…", a: "…", media: { src: "assets/img/trip/flex-07.jpg" } },
  photos: [
    { src: "assets/img/trip/flex-01.jpg" },
    ...
  ]
};
```

- Photos run in list order; each gets a polaroid frame and the counter
  `01 / 29`. Reorder the lines to reorder the slideshow.
- **It plays by itself.** `autoplay: 5` moves to the next photo every 5 seconds;
  a thin bar under the photo counts down. `Space` or `→` skips ahead, `←` steps
  back and pauses, and `P` pauses and resumes. It stops on the last photo and
  waits for you. Set `autoplay: 0` to turn it off and click through by hand.
- The current order is `flex-01…flex-14` (the "Lach Flexing" set, in the order
  of that folder) and then the couple set as
  `trip-01, 06, 07, 03, 04, 05, 08, 02, 09, 10, 11, 12, 13, 14, 15`.
- To caption a photo, add `caption: "…"` to its line. Captioned photos are shown
  slightly smaller to make room.
- `reveal.photo` works best as a landscape photo with both faces near the
  middle; it is cropped to a 4:3 frame.

## Sound effects

Short clips live in `assets/audio/sfx/` and are named in `sfx` at the top of
[content.js](assets/js/content.js). Any question can play them:

```js
sound: { reveal: "grumble" }               // plays as the answer is revealed
sound: { enter: "howl", reveal: "bark" }   // `enter` starts when the slide arrives
                                           // and stops at the reveal
```

Two Star Tommy grumbles; the pop quiz howls and barks. The music dips while a
clip plays, and muting the music (`M`) silences the effects too. To swap a
sound, replace its file or point its name at another one.

## Gifts and the winner

The two Nice List gift cards are set in `gifts` in
[content.js](assets/js/content.js): `parents` (a photo beside a ticket with
`icon`, `title` and `line`) and `dogs` (a `main` photo with the `more` photos
fanned out around it, and a `line` underneath).

The Finale opens with a teaser, "And the Winner Is…". Its envelope opens on
whoever is leading the scoreboard at that moment (a tie names everyone on the
top score); the full table is on the next slide.

## Scoreboard

The 🏆 **Scores** button (or the `S` key) opens a tally for everyone listed in
`players` in [content.js](assets/js/content.js). `+` and `−` change a score,
the leader gets a crown, and `Esc` or `✕` closes it. Scores can go negative.

**Teams:** drag one card onto another (mouse or touch) and the two become a
team with a single score — their scores so far are added together. Drag more
cards on to grow the team. **Split** on a team card breaks it back up, and each
member leaves with the team's score.

Tallies and teams are saved in the browser (`localStorage`), so a reload or a
jump along the timeline doesn't lose them — but they belong to that browser on
that computer. **Reset** needs two clicks and zeroes the scores; teams stay as
they are. The "Final Scores" slide just before the thank-you slide shows the
same tallies ranked, and updates live.

## Music

Music is set in `music` at the top of [content.js](assets/js/content.js):

```js
const music = {
  source: "spotify",
  playlist:  [{ title: "A Nonsense Christmas — Sabrina Carpenter",
                spotify: "73ye7F9Ub51dQ3CrnCHFhr", youtube: "s_eCNuHS6kk" },
              ...
              { title: "Jingle Bells (synth stand-in)", file: "assets/audio/jingle.mp3" }],
  slideshow: [{ title: "Bebot — The Black Eyed Peas",
                spotify: "4nZwaKTdxczLpUHfLVAozA", youtube: "wESgcExetso" },
              { title: "Slideshow loop (synth stand-in)", file: "assets/audio/trip.mp3" }]
};
```

- **`playlist`** is the background music for the whole deck. The songs play in
  a shuffled order and none repeats until every one has had a turn.
- **`slideshow`** takes over on the "brought to you by" slide, plays through
  the photos and the pop quiz, and hands back when the movie round starts.

Every song is listed on both Spotify and YouTube. `source` says which one to
use; the ♪ menu has a **Play from** switch between them, and the choice is
remembered on that browser. Either way the song is streamed through that
service's own embedded player and nothing is downloaded or stored in this
project. Both need an internet connection, and the player sits in a small dock
in a corner: the ⤢ button moves it to another corner if it is covering
something.
On Spotify the – button beside it tucks the player away to a single ♫ button
(click that to bring it back); the music keeps playing. YouTube's player has to
stay in view, so it cannot be tucked away.

**Spotify.** `spotify: "TRACK_ID"` is the part after `/track/` in a song's share
link (Share → Copy song link). Things to know:

- **Sign in first.** Spotify plays whole songs only in a browser that is signed
  in to Spotify: open <https://open.spotify.com>, sign in, then load the deck in
  the same browser. Signed out, it plays a 30-second sample of each song, and
  the ♪ menu says so.
- Use an ordinary Chrome or Edge window. A private window, or a browser that
  blocks third-party cookies (Safari, Brave, Firefox on strict), hides the
  sign-in from the player, so it falls back to samples.
- If nothing starts after your first click on the deck, press play on the
  Spotify bar once.
- Spotify's player has no volume control, so the music does not dip under the
  sound effects as it does on YouTube.

**YouTube.** `youtube: "VIDEO_ID"` is the part after `watch?v=` in the video's
address. YouTube shows the video in the dock, may play an advert first, and a
video's owner can switch off playing on other websites; a track that will not
play is skipped. If Spotify cannot be reached at all, the deck uses YouTube by
itself.

**Audio files.** `file: "assets/audio/…mp3"` plays a file from this project.
`jingle.mp3` (30 seconds of *Jingle Bells*) and `trip.mp3` (a 37-second
tropical-house style loop) were synthesised for this deck with no licensing
strings. They are the stand-ins at the bottom of each list and only play when
nothing above them can — no internet, for instance. Your own files can also go
in `assets/audio/local/`, which is left out of git and so never published.

Music starts on the first click or keypress — browsers block audio until the
presenter interacts.

**The ♪ menu.** Clicking ♪ opens a small menu: which list is playing
(background or slideshow), the song that is on now, a button for every song
(click one to switch to it), the Spotify / YouTube switch, and a mute switch. `M` mutes and unmutes without
opening it; `Esc` closes it. `title` is the name each song is shown under.

Volumes are the number near the end of the two `makeChannel(...)` lines in
[app.js](assets/js/app.js).

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

### Photos that arrive with the answer (`fx`)

For a bit of old-PowerPoint drama, give a question `fx` instead of relying on
its emoji:

```js
{ q: "Who whinges the most if a family member isn't present for Christmas?",
  a: "Two star Tommy.", icon: "😭⭐⭐",
  fx: { photos: [{ src: "assets/img/two-star-tommy.jpg", alt: "Tom" }],
        effect: "spin", stars: 2, outOf: 5 } }
```

| Key | What it does |
| --- | --- |
| `photos` | One or more pictures, each `"path"` or `{ src, alt }`. A file that is missing is simply left out. |
| `effect` | `"spin"` (whirls in — the default), `"bounce"` (drops and bounces), `"fly"` (shoots in from the side), `"swivel"` (spins like a coin), `"creep"` (rises out of the gloom) or `"ambush"` (see below). |
| `intruder` | For `"ambush"` only: the picture that springs out, as `{ src, alt }`. |
| `shape` | `"portrait"` for tall rounded frames. Otherwise photos are circles, so use a square image centred on the face. |
| `shadow` | `true` draws a hooded mystery figure instead of a photo. |
| `stars` / `outOf` | Gold stars pop in after the photo; `outOf` adds hollow ones up to that total (2 out of 5). |
| `quote` | A line in quotation marks above the stars. |
| `caption` | A line of small print that fades in underneath. |

With several photos, `spin` brings them in from the left, top and right, and
`fly` from the left then the right. `ambush` takes exactly two photos of the
same person: the first pops in calm, the `intruder` springs out beside it, and
the second photo then takes over and shakes (Jev and the ferret). Timings are in the "fx" block of
[styles.css](assets/css/styles.css). People photos live in `assets/img/people/`.

### Votes

Give a family-quiz entry `choices` instead of an answer and it becomes a vote
with no right answer ("Style Selection: who wore it best?"): the photos sit side
by side, lettered and named, and clicking one crowns it. ↺ clears the crown.

```js
{ q: "Style Selection: who wore it best?",
  choices: [{ name: "Lach", src: "assets/img/people/sunnies-lach.jpg" }, ...] }
```

A question can also carry a `photo` (shown from the start, unlike `media`, which
waits for the answer), `faces` (a row of round photos shown from the start, as
on the first-date question) and a `kicker` (a banner above the question).

## Controls

| Action | Keys |
| --- | --- |
| Next / previous slide | `→` `←` `PageDown` `PageUp` |
| Reveal answer, then advance | `Space` / `Enter` |
| First / last slide | `Home` / `End` |
| Fullscreen | `F` or the button |
| Scoreboard | `S` or the 🏆 button (`Esc` closes it) |
| Pause / resume the self-running slideshow | `P` |
| Music menu / mute | the ♪ button / `M` |
| Reset this slide | `R` or the ↺ button |
| Reset every slide | `Shift`+`R` or `Shift`-click ↺ |
| Advance | swipe left/right on touch |

The current slide number is kept in the URL (`index.html#12`), so you can
bookmark or reload a slide.

## Resetting

↺ (or `R`) puts the current slide back to how it started: answers hidden
again, Code Words cards face down, naughty-or-nice stamps cleared, bird photos
back in the tray. Hold `Shift` to do it for every slide at once — handy after a
rehearsal. Scores are not touched; the scoreboard has its own Reset.

## Section timeline

The strip above the Back/Next buttons has one button per section. Click one to
jump straight to that section's first slide. Sections already finished are
red, the current one is gold, and the thin line along the bottom of each shows
how far through it you are. Below 1000px wide the labels drop away and only
the icons show.

The sections are declared in [slides.js](assets/js/slides.js) with
`section("Label", "🎁")`, called just before that section's first slide is
pushed. Add, rename or remove a `section(...)` line and the timeline follows.

## Adding or reordering slides

Slides are built in [slides.js](assets/js/slides.js) into the `slides` array —
order in the file is order on screen. Helpers:

- `section("Label", "🎁")` — starts a new entry on the bottom timeline.
- `part(1, "Title", "🎄")` — a part divider.
- `mystery("Reveal answer", "🎁")` + `<div class="rv" data-rv>…</div>` — the
  click-to-reveal pair.
- `media({ … })` — photo or video block.
- `kicker: "…"` on any question adds a banner above it ("Worth triple points").
- `data-card` on an element makes it turn over on click *and* on `Space` (in
  page order); `data-flip` makes it turn over on click only.

## Photo and sound credits

- Wolf howl (`assets/audio/sfx/wolf-howl.mp3`): the first 20 seconds of
  "Wolf howls.ogg" from Wikimedia Commons, public domain.
- Dog bark (`assets/audio/sfx/dog-bark.mp3`): "Barking of a dog" by Amada44, via
  Wikimedia Commons, played twice over, licensed
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Grumble (`assets/audio/sfx/grumble.mp3`): generated on this computer with the
  built-in Windows speech voice, then pitched down.
- Film covers: not stored here; shown from each film's Wikipedia article.
- Wakesurfing clip (`assets/video/wakesurf.mp4`): from a reel posted on Facebook
  by Wakesurfing WA, with its soundtrack removed.

- Ferret (`assets/img/ferret.jpg`): cropped from "Mustela putorius furo
  profile" by Aurélien Mora, via Wikimedia Commons, licensed
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
