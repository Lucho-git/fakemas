/* ==========================================================================
   SLIDE BUILDERS
   Each builder returns the markup for one <section class="slide">.
   The running order is the order they are pushed into `slides` at the bottom.
   ========================================================================== */

const VIDEO_EXT = /\.(mp4|m4v|webm|ogv|ogg|mov)$/i;
const ESCAPES = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

/* Renders a photo or (based on file extension) a video. Returns "" if unset. */
const media = (m) => {
  if (!m || !m.src) return "";
  const img = VIDEO_EXT.test(m.src)
    ? `<video src="${esc(m.src)}"${m.poster ? ` poster="${esc(m.poster)}"` : ""} controls playsinline preload="metadata"></video>`
    : `<img src="${esc(m.src)}" alt="${esc(m.alt || "")}" loading="lazy"
            onerror="this.closest('.media').classList.add('is-missing')">`;
  return `<figure class="media${m.wide ? " wide" : ""}">${img}${
    m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""
  }</figure>`;
};

const mystery = (label = "Click to reveal", box = "🎁") =>
  `<button class="mystery" data-reveal><span class="box">${box}</span><span class="lbl">${label}</span></button>`;

const part = (n, t, ic = "🎄") => `
<section class="slide">
  <div class="part-no">✦ Part ${n} ✦</div>
  <div class="title-xl" style="font-size:clamp(3rem,10vw,7.5rem)">${t}</div>
  <div class="holly">${ic}</div>
</section>`;

/* Multiple choice: `options` are listed A–D and `correct` (spelt exactly as its
   option) lights up green when the answer is revealed. */
const optionList = (x) => !x.options ? "" : `
    <ol class="opts${x.correct ? "" : " no-key"}">
      ${x.options.map((o, k) =>
        `<li class="opt${o === x.correct ? " correct" : ""}"><b>${"ABCDEF"[k]}</b><span>${o}</span></li>`).join("")}
    </ol>`;

/* A hooded figure in shadow, for anyone who would rather not be pictured. */
const SHROUD = `<svg class="fx-pic fx-shroud" viewBox="0 0 200 200" role="img" aria-label="A hooded figure in shadow">
            <path d="M100 14C54 14 36 64 42 108C26 126 16 156 12 200H188C184 156 174 126 158 108C164 64 146 14 100 14Z"/>
            <ellipse cx="100" cy="88" rx="33" ry="42"/>
            <text x="100" y="106">?</text>
          </svg>`;

/* `fx` on a question: photos that arrive with the answer, then stars and a caption.
   The effects and their timing live in the "fx" block of styles.css. */
const fxBlock = (x) => {
  const f = x.fx;
  if (f.effect === "ambush") {
    // Photo 1 arrives calm, the intruder pops out on it, then photo 2 takes over and shakes.
    const [calm, freak] = (f.photos || []).map((photo) => (typeof photo === "string" ? {src: photo} : photo));
    return `
        <div class="fx fx-ambush">
          <div class="fx-row">
            <div class="fx-stack">
              <div class="fx-face">
                <img class="fx-pic" src="${esc(calm.src)}" alt="${esc(calm.alt || "")}">
                ${freak ? `<img class="fx-pic fx-freak" src="${esc(freak.src)}" alt="${esc(freak.alt || "")}" onerror="this.remove()">` : ""}
              </div>
              ${f.intruder ? `<img class="fx-intruder" src="${esc(f.intruder.src)}" alt="${esc(f.intruder.alt || "")}" onerror="this.remove()">` : ""}
            </div>
          </div>
          ${f.caption ? `<div class="fx-caption">${f.caption}</div>` : ""}
        </div>`;
  }
  const pics = (f.photos || []).map((photo, k) => {
    const pic = typeof photo === "string" ? {src: photo} : photo;
    // a photo that is missing simply does not appear
    return `<img class="fx-pic" style="--i:${k}" src="${esc(pic.src)}" alt="${esc(pic.alt || "")}" onerror="this.remove()">`;
  }).join("");
  const gold = f.stars || 0;
  const hollow = Math.max(0, (f.outOf || 0) - gold);
  // the hollow stars start a beat after the gold ones have landed
  const stars = !(gold + hollow) ? "" : `<span class="fx-stars" role="img" aria-label="${gold} out of ${gold + hollow} stars">${
    Array.from({length: gold}, (_, k) => `<span class="gold" style="--i:${k}">★</span>`).join("") +
    Array.from({length: hollow}, (_, k) => `<span style="--i:${gold + k + 1}">☆</span>`).join("")
  }</span>`;
  // a quote sits on top of the stars, in the same column
  const rating = !f.quote ? stars
    : `<span class="fx-rating"><span class="fx-quote">&ldquo;${f.quote}&rdquo;</span>${stars}</span>`;
  return `
        <div class="fx fx-${f.effect || "spin"}${f.shape ? ` fx-${f.shape}` : ""}">
          <div class="fx-row">${pics}${f.shadow ? SHROUD : ""}${rating}</div>
          ${f.caption ? `<div class="fx-caption">${f.caption}</div>` : ""}
        </div>`;
};

/* What goes in front of the answer: the winning option's letter on a multiple-choice
   question (so "B: To rob the mall" matches option B), otherwise "A" for Answer. */
const answerLabel = (x) => {
  if (!x.options) return "A: ";
  const k = x.options.indexOf(x.correct);
  return k < 0 ? "" : `${"ABCDEF"[k]}: `;
};

/* One question slide: badge, question, then a click/Space reveal.
   `badge` is the label in the corner ("Q3"); `cls` adds a slide style and `attrs`
   extra attributes. A question's own `kicker` is a banner above it, and its `photo`
   (or row of round `faces`) is on show from the start, unlike `media`, which waits for
   the answer. `sound` names clips from `sfx` to play on arrival and on the reveal. */
const facesRow = (faces) => !faces ? "" : `
    <div class="q-faces">${faces.map((f) =>
      `<img src="${esc(f.src)}" alt="${esc(f.alt || "")}" onerror="this.remove()">`).join("")}</div>`;

const questionSlide = (x, badge, cls = "", attrs = "") => `
<section class="slide ${cls}"${attrs}${x.sound && x.sound.enter ? ` data-sfx-enter="${esc(x.sound.enter)}"` : ""}>
  <div class="qbadge"${badge.length > 3 ? ' style="font-size:1.15rem"' : ""}>${badge}</div>
  <div class="parch">
    ${x.kicker ? `<div class="q-kicker">${x.kicker}</div>` : ""}
    <h2 class="q" style="padding-top:${x.kicker ? "6px" : "clamp(36px,6vw,20px)"}">${x.q}</h2>
    ${x.photo ? `<div class="q-photo${x.options ? " with-opts" : ""}">${media(x.photo)}</div>` : ""}${facesRow(x.faces)}${optionList(x)}
    <div class="stage${x.photo || x.faces ? " slim" : ""}">
      ${mystery("Reveal answer", "🎁")}
      <div class="rv" data-rv${x.sound && x.sound.reveal ? ` data-sfx="${esc(x.sound.reveal)}"` : ""}>
        ${media(x.media)}
        ${x.fx ? fxBlock(x) : `<div class="art">${x.icon}</div>`}
        <div class="answer ${x.long ? "long" : ""}">${answerLabel(x)}${x.a}</div>
      </div>
    </div>
  </div>
</section>`;

/* An intermission: a silent clip in a tall frame, announced with far too much fuss.
   The `.hype` layer is the countdown, tape, rings and burst ("hype reel" in styles.css);
   app.js holds the clip back until that is over, then loops it while the slide is up. */
const HYPE_BURST = ["🌊", "🏄", "⚡", "🔥", "✨", "💥", "🎉", "🌊", "🏄", "⚡", "🔥", "✨", "💥", "🎉"];
const intermissionSlide = (x) => `
<section class="slide interval">
  <div class="hype" aria-hidden="true">
    <div class="hype-rays"></div>
    <div class="hype-tape top"><span>⚠ ${x.intermission} incoming ⚠</span></div>
    <div class="hype-tape bottom"><span>⚠ Stand by ⚠</span></div>
    ${[0, 1, 2, 3].map((n) => `<div class="hype-ring" style="--n:${n}"></div>`).join("")}
    <div class="hype-count">${[3, 2, 1].map((c, n) => `<b style="--n:${n}">${c}</b>`).join("")}</div>
    <div class="hype-burst">${HYPE_BURST.map((e, k) =>
      `<i style="--a:${Math.round(k * 360 / HYPE_BURST.length)}deg;--k:${k}">${e}</i>`).join("")}</div>
    ${x.star ? `<div class="hype-star">${x.star}</div>` : ""}
    <div class="hype-flash"></div>
  </div>
  <div class="hype-title">${x.intermission}</div>
  <figure class="interval-clip">
    <video src="${esc(x.video.src)}"${x.video.poster ? ` poster="${esc(x.video.poster)}"` : ""} muted loop playsinline preload="metadata" data-clip data-clip-delay="5.8"></video>
  </figure>
</section>`;

/* The bird-watch card that opens the bird round: a sky of birds, each one locked onto and
   tagged as it crosses, with binoculars scanning from the bottom ("bird-watch card" in
   styles.css). Each bird is [emoji, height up the slide, seconds to cross, head start in
   seconds, direction, when it is spotted]. */
const FLOCK = [
  ["🦜", 5, 15, 2, 1, ""], ["🦆", 14, 19, 9, -1, "late"], ["🦅", 22, 12, 6, 1, "late"],
  ["🐦", 9, 22, 15, -1, ""], ["🦉", 66, 17, 4, 1, "late"], ["🦩", 73, 21, 12, -1, ""],
  ["🕊️", 60, 14, 9, -1, "late"], ["🐧", 78, 24, 18, 1, ""]
];
const BINOCULARS = `<svg class="spot-binos" viewBox="0 0 200 150" aria-hidden="true">
      <defs>
        <linearGradient id="spot-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#fff8d0" stop-opacity=".75"/><stop offset="1" stop-color="#fff8d0" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="spot-lens" cx="35%" cy="35%" r="75%">
          <stop offset="0" stop-color="#bfe9ff"/><stop offset=".6" stop-color="#2d6f9a"/><stop offset="1" stop-color="#0c2a3d"/>
        </radialGradient>
      </defs>
      <path class="beam" d="M30 38L-70-420H180L80 38Z"/>
      <path class="beam" d="M120 38L20-420H270L170 38Z"/>
      <rect x="84" y="66" width="32" height="26" rx="7" fill="#22323b"/>
      <rect x="91" y="54" width="18" height="16" rx="5" fill="#e9c46a" stroke="#8a6320" stroke-width="2"/>
      <g>
        <rect x="18" y="36" width="74" height="112" rx="20" fill="#1b2a33" stroke="#0b1217" stroke-width="3"/>
        <rect x="18" y="96" width="74" height="12" fill="#e9c46a" opacity=".85"/>
        <ellipse cx="55" cy="40" rx="39" ry="17" fill="#0b1217" stroke="#e9c46a" stroke-width="3"/>
        <ellipse cx="55" cy="39" rx="30" ry="12" fill="url(#spot-lens)"/>
        <ellipse class="glint" cx="44" cy="35" rx="9" ry="3.5" fill="#fff"/>
      </g>
      <g>
        <rect x="108" y="36" width="74" height="112" rx="20" fill="#1b2a33" stroke="#0b1217" stroke-width="3"/>
        <rect x="108" y="96" width="74" height="12" fill="#e9c46a" opacity=".85"/>
        <ellipse cx="145" cy="40" rx="39" ry="17" fill="#0b1217" stroke="#e9c46a" stroke-width="3"/>
        <ellipse cx="145" cy="39" rx="30" ry="12" fill="url(#spot-lens)"/>
        <ellipse class="glint" cx="134" cy="35" rx="9" ry="3.5" fill="#fff"/>
      </g>
    </svg>`;
const birdWatchSlide = (x) => `
<section class="slide birdwatch">
  <div class="spot-sky" aria-hidden="true">
    <div class="spot-cloud" style="top:8vh;animation-delay:-12s"></div>
    <div class="spot-cloud" style="top:30vh;animation-delay:-38s;opacity:.6"></div>
    <div class="spot-cloud" style="top:58vh;animation-delay:-52s;opacity:.45"></div>
    ${FLOCK.map(([bird, top, dur, ahead, dir, when]) => `
    <div class="spot-bird${dir < 0 ? " rtl" : ""}${when ? ` ${when}` : ""}" style="--top:${top}vh;--dur:${dur}s;--delay:-${ahead}s;--rest:${10 + top}vw">
      <span class="spot-ring"></span><i>${bird}</i><b>Spotted!</b>
    </div>`).join("")}
    ${BINOCULARS}
  </div>
  <div class="parch spot-card">
    <div class="spot-tag">✦ ${x.tag} ✦</div>
    <h2>${x.title}</h2>
    <p>${x.q}</p>
    <div class="ribbon">${x.points}</div>
  </div>
</section>`;

/* The sponsors reel that opens the slideshow: an announcement, then a title card and the
   sponsor's name. It reuses the intermission's `.hype` pieces; its own timings are under
   "sponsors reel" in styles.css. */
const burst = (emoji, cls = "") => `<div class="hype-burst${cls}">${emoji.map((e, k) =>
  `<i style="--a:${Math.round(k * 360 / emoji.length)}deg;--k:${k}">${e}</i>`).join("")}</div>`;
const sponsorSlide = (x) => `
<section class="slide trip sponsor" data-music="trip">
  <div class="hype" aria-hidden="true">
    <div class="hype-rays"></div>
    <div class="hype-tape top"><span>★ ${x.lead.join(" ")} ★</span></div>
    <div class="hype-tape bottom"><span>★ ${x.lead.join(" ")} ★</span></div>
    <div class="hype-ring" style="--n:2.4"></div>
    <div class="hype-ring" style="--n:5.4"></div>
    <div class="sp-lead">${x.lead.map((line, n) => `<b style="--n:${n}">${line}</b>`).join("")}</div>
    <div class="sp-plane">✈️</div>
    <div class="sp-palm l">🌴</div>
    <div class="sp-palm r">🌴</div>
    ${burst(["🌴", "🥥", "🌊", "☀️", "🍹", "🐠", "🌺", "🌴", "🥥", "🌊", "☀️", "🍹", "🐠", "🌺"])}
    ${burst(["✨", "⭐", "💫", "✨", "⭐", "💫", "✨", "⭐", "💫", "✨", "⭐", "💫"], " late")}
    <div class="hype-flash"></div>
  </div>
  <div class="sp-card">
    <div class="trip-title sp-title">${x.title}</div>
    <div class="sp-place">${x.place}</div>
    <div class="sp-by">${x.by}</div>
    <div class="sp-name"><span>${x.name}</span></div>
  </div>
</section>`;

/* A vote: named photos side by side, no right answer. Clicking one crowns it (click-only,
   so Space just moves on); the reset button clears the crown. */
const voteSlide = (x, badge) => `
<section class="slide">
  <div class="qbadge"${badge.length > 3 ? ' style="font-size:1.15rem"' : ""}>${badge}</div>
  <div class="parch">
    <h2 class="q" style="padding-top:clamp(36px,6vw,20px)">${x.q}</h2>
    <div class="vote-row">
      ${x.choices.map((c, k) => `
      <button type="button" class="vote-card" data-flip>
        <img src="${esc(c.src)}" alt="${esc(c.name)}">
        <span class="vote-name"><b>${"ABCDEF"[k]}</b>${esc(c.name)}</span>
      </button>`).join("")}
    </div>
  </div>
</section>`;

/* The drag-and-drop matching slide: photos dealt into a tray, lettered names underneath.
   Each photo carries a number, so players can write "3 = C" on paper; the host can also
   drag photos onto names. app.js does the dragging and shows the answers on reveal. */
const matchSlide = (items) => {
  // A fixed shuffle, so the photos are out of order but the same every time.
  const deal = items.map((_, k) => k)
    .sort((a, b) => ((a * 5 + 3) % items.length) - ((b * 5 + 3) % items.length));
  // ...and never leave a photo sitting directly above its own name.
  deal.forEach((k, pos) => {
    if (k === pos) {
      const next = (pos + 1) % deal.length;
      [deal[pos], deal[next]] = [deal[next], deal[pos]];
    }
  });
  return `
<section class="slide match">
  <div class="cn-head" data-match-status="Match each numbered bird to a letter">Match each numbered bird to a letter</div>
  <div class="mt-tray" data-tray>
    ${deal.map((k, pos) => `<div class="mt-tile" data-tile="${k}" data-order="${pos}"><img src="${esc(items[k].src)}" alt="" draggable="false"><b class="mt-num">${pos + 1}</b></div>`).join("")}
  </div>
  <div class="mt-slots">
    ${items.map((item, k) => `
    <div class="mt-slot" data-slot="${k}">
      <div class="mt-drop"></div>
      <div class="mt-name"><b>${"ABCDEFGHIJKL"[k]}</b><span>${esc(item.name)}</span></div>
    </div>`).join("")}
  </div>
  <span data-rv data-match-reveal></span>
</section>`;
};

/* One Code Words round: the clue, its number, and a board of word cards.
   Answer cards are `data-card`, so Space turns them over one at a time;
   the rest are `data-flip`, which only turn over when clicked. */
const codeSlide = (r, i, total) => `
<section class="slide code">
  <div class="cn-head">Round ${i + 1} / ${total}</div>
  <div class="cn-grid">
    ${r.words.map((w) => r.hits.includes(w)
      ? `<button type="button" class="cn-card hit" data-card><span class="cn-word">${esc(w)}</span></button>`
      : `<button type="button" class="cn-card miss" data-flip><span class="cn-word">${esc(w)}</span></button>`).join("")}
  </div>
  <div class="cn-clue">
    <span class="cn-clue-word">${esc(r.clue)}</span>
    <span class="cn-clue-n" aria-label="${r.hits.length} words">${r.hits.length}</span>
  </div>
  <div class="cn-why" data-rv>${r.why}</div>
</section>`;

/* Santa and Mrs Claus as shadows, for the "who is Santa?" slide: two head-and-shoulders
   shapes in Santa hats (his with a beard, hers with a bob), each wearing a question mark. */
const SHADOW_FIGURES = `
      <svg class="unmask-shadow" viewBox="0 0 420 250" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <g class="fig">
          <path d="M8 250C8 190 48 166 104 166s96 24 96 84z"/>
          <circle cx="104" cy="112" r="43"/>
          <path d="M61 116c0 62 43 84 43 84s43-22 43-84z"/>
          <path d="M60 76C70 14 132 2 170 44c-16-2-25 10-22 32z"/>
          <rect x="52" y="68" width="104" height="24" rx="12"/>
          <circle cx="172" cy="48" r="14"/>
        </g>
        <g class="fig">
          <path d="M232 250c0-56 36-80 84-80s84 24 84 80z"/>
          <circle cx="316" cy="116" r="39"/>
          <path d="M270 112c-8 26-4 50 10 62h72c14-12 18-36 10-62z"/>
          <path d="M360 80C350 20 290 6 254 46c15-2 24 9 21 34z"/>
          <rect x="266" y="72" width="100" height="23" rx="11.5"/>
          <circle cx="252" cy="50" r="14"/>
        </g>
        <text x="104" y="236">?</text>
        <text x="316" y="236">?</text>
      </svg>`;

/* The dogs' gift: the main photo in the middle, the others fanned out either side of it. */
const pupPhotos = (g) => {
  const pup = (p, k, cls = "") =>
    `<img class="pup${cls}" style="--i:${k};--r:${[-6, 4, 0, -4, 6][k % 5]}deg" src="${esc(p.src)}" alt="${esc(p.alt || "")}" onerror="this.remove()">`;
  const more = g.more || [];
  const half = Math.ceil(more.length / 2);
  return [
    ...more.slice(0, half).map((p, k) => pup(p, k)),
    pup(g.main, 2, " pup-main"),
    ...more.slice(half).map((p, k) => pup(p, k + 3))
  ].join("");
};

/* How the slideshow photos arrive, used in turn (keyframes: "slideshow" in styles.css). */
const SHOW_ENTRANCES = ["spin", "drop", "fly-r", "zoom", "swing", "fly-l", "flip", "roll"];

/* The timeline along the bottom: one entry per section, filled in by buildSlides.
   `start` is the index of the section's first slide. */
const sections = [];

function buildSlides() {
  const slides = [];
  // Call this just before pushing a section's first slide.
  const section = (label, icon) => sections.push({label, icon, start: slides.length});

  // Part 1 – this is the opening slide
  section("Family Quiz", "🎁");
  slides.push(`
<section class="slide">
  <div class="part-no">✦ Part 1 ✦</div>
  <div class="title-xl">The Family<br>Christmas Quiz</div>
  <div class="ribbon">${quiz.filter((x) => !x.intermission).length} Questions from Our Family Group Chat</div>
  <div style="font-size:clamp(4rem,10vw,7rem)">📱🎄</div>
</section>`);

  // An intermission is a slide of its own and does not take a question number.
  let qNo = 0;
  quiz.forEach((x) => slides.push(x.intermission ? intermissionSlide(x)
    : (x.choices ? voteSlide : questionSlide)(x, `Q${++qNo}`)));

  // Part 2 – general Christmas trivia
  section("Trivia", "🔔");
  slides.push(part(2, "Christmas<br>Trivia", "🔔🧦🔔"));
  slides.push(`
<section class="slide">
  <div class="title-xl">Christmas<br>Trivia</div>
  <div class="ribbon">${trivia.length} Questions on Christmas Itself</div>
  <div style="font-size:clamp(4rem,10vw,7rem)">🍗🎄</div>
</section>`);

  trivia.forEach((x, i) => slides.push(questionSlide(x, `Q${i + 1}`)));

  // Part 3
  section("Naughty List", "📜");
  slides.push(part(3, "Mum &amp; Dad's<br>Naughty List", "📜"));
  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(760px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.4rem,5.5vw,4rem);color:var(--red-d)">Why Are You on the Naughty List?</h2>
    <p style="margin-top:18px"><b>Mum &amp; Dad…</b></p>
    <p>You've both made the Naughty List!</p>
    <p style="margin-top:10px">Now it's your turn to guess why!</p>
    <div style="font-size:4rem;margin-top:10px">📋🎅</div>
  </div>
</section>`);
  slides.push(`
<section class="slide">
  <div class="parch">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.2rem,5vw,3.6rem);color:var(--red-d)">We Know What You Did</h2>
    <p>Your children already have an answer in mind.</p>
    <p>We won't be telling you what it is. <b>You'll be telling us.</b></p>
    <p class="must-write">Leaving it blank is not an option. You must write something down.</p>
    <div class="writes">
      <div class="write"><b>Mum's Answer</b><small>(What do you think you did?)</small>
        <textarea data-write="mum" aria-label="Mum's answer" placeholder="Type it here…" spellcheck="false"></textarea></div>
      <div class="write"><b>Dad's Answer</b><small>(What do you think you did?)</small>
        <textarea data-write="dad" aria-label="Dad's answer" placeholder="Type it here…" spellcheck="false"></textarea></div>
    </div>
  </div>
</section>`);
  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(760px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.2rem,5vw,3.6rem);color:var(--red-d)">The Naughty List Stories</h2>
    <p style="margin-top:14px">Now write a short story about a time you were on each of your children's Naughty Lists.</p>
    <div style="font-size:4.5rem;margin-top:10px">🪶📜</div>
  </div>
</section>`);

  // Part 4
  section("Riddles", "❓");
  slides.push(part(4, "Christmas<br>Riddles", "❓🎄"));
  riddles.forEach((r, i) => {
    slides.push(`
<section class="slide">
  <div class="qbadge" style="font-size:1.15rem">Riddle ${i + 1}</div>
  <div class="parch">
    <div class="riddle" style="padding-top:clamp(34px,5vw,10px)">${r.lines.join("<br>")}</div>
    ${r.ask ? `<div class="riddle-q">${r.ask}</div>` : ""}
    <div class="stage">
      ${mystery("Reveal answer", "🎁")}
      <div class="rv" data-rv>
        ${media(r.media)}
        <div class="art">${r.icon}</div>
        <div class="answer">A: ${r.a}</div>
      </div>
    </div>
  </div>
</section>`);
  });

  // Bonus – who is Santa?, then Lach & Eleanor's trip to the Philippines (runs straight after the riddles)
  section("Bonus", "🌴");
  // Santa and Mrs Claus stand in shadow until the answer is revealed.
  slides.push(`
<section class="slide">
  <div class="qbadge" style="font-size:1.15rem">Bonus Question</div>
  <div class="parch">
    <h2 class="q" style="padding-top:clamp(36px,6vw,20px)">${trip.reveal.question}</h2>
    <div class="unmask">
      <img src="${esc(trip.reveal.photo)}" alt="">
      ${SHADOW_FIGURES}
    </div>
    <div class="stage slim">
      ${mystery("Reveal answer", "🎁")}
      <div class="rv" data-rv>
        <div class="answer">A: ${trip.reveal.answer}</div>
      </div>
    </div>
  </div>
</section>`);

  // From here to the end of the photos the slideshow track plays instead of the jingle.
  slides.push(trip.sponsor ? sponsorSlide(trip.sponsor) : `
<section class="slide trip" data-music="trip">
  <div class="trip-tag" style="font-size:clamp(.8rem,1.8vw,1.3rem)">${trip.credit.lead}</div>
  <div class="trip-title" style="font-size:clamp(3.2rem,10vw,7.5rem)">${trip.credit.names}</div>
  <div class="trip-flag">🌴</div>
</section>`);

  // Each photo arrives with the next entrance in SHOW_ENTRANCES while the one before it
  // slides off to rest at the side, on top of the one before that. Every photo slide but
  // the last has data-auto, so the deck moves through them on its own and then waits.
  const tilt = (k) => (k % 2 ? "tilt-r" : "tilt-l");
  const rest = (k) => (k % 2 ? "rest-r" : "rest-l");
  const older = (k, cls) => `<figure class="photo-frame show-old ${cls} ${tilt(k)} ${rest(k)}" aria-hidden="true">
      <img src="${esc(trip.photos[k].src)}" alt="">
    </figure>`;
  trip.photos.forEach((photo, i) => {
    const last = i === trip.photos.length - 1;
    // The last photo carries the sign-off, written on the polaroid.
    const caption = last && trip.outro
      ? `<figcaption class="outro"><span class="outro-title">${trip.outro.title}</span>${trip.outro.line}</figcaption>`
      : photo.caption ? `<figcaption>${photo.caption}</figcaption>` : "";
    const auto = !last && trip.autoplay > 0;
    slides.push(`
<section class="slide trip show" data-music="trip"${auto ? ` data-auto="${trip.autoplay}"` : ""}>
  <div class="trip-tag">🌴 Philippines · ${String(i + 1).padStart(2, "0")} / ${trip.photos.length}</div>
  <div class="show-stage">
    ${i > 1 ? older(i - 2, "show-older") : ""}
    ${i > 0 ? older(i - 1, "show-prev") : ""}
    <figure class="photo-frame show-new in-${SHOW_ENTRANCES[i % SHOW_ENTRANCES.length]} ${tilt(i)}">
      <img src="${esc(photo.src)}" alt="${esc(photo.alt || photo.caption || `Philippines trip photo ${i + 1}`)}">
      ${caption}
    </figure>
  </div>
  ${auto ? `<div class="auto-bar" aria-hidden="true"><i></i></div>` : ""}
</section>`);
  });

  // Stop right there: one photo to halt the slideshow before the pop quiz.
  if (trip.stop) slides.push(`
<section class="slide stop-slide" data-music="trip">
  <div class="stop-row">
    <figure class="stop-shot">
      <img src="${esc(trip.stop.src)}" alt="${esc(trip.stop.alt || "")}">
    </figure>
    <div class="stop-text">
      ${trip.stop.title ? `<div class="title-xl stop-title">${trip.stop.title}</div>` : ""}
      ${trip.stop.line ? `<p class="stop-line">${trip.stop.line}</p>` : ""}
      ${trip.stop.kicker ? `<div class="q-kicker">${trip.stop.kicker}</div>` : ""}
    </div>
  </div>
</section>`);

  // Were they paying attention? One question about the photos, music still playing.
  if (trip.popQuiz) slides.push(questionSlide(trip.popQuiz, "Pop Quiz", "", ' data-music="trip"'));

  // Part 5
  section("Movies", "🎬");
  slides.push(part(5, "Guess the<br>Movie Scene", "🎬🍿"));
  movieScenes.forEach((m, i) => {
    slides.push(`
<section class="slide movie">
  <div class="movie-head">Scene ${i + 1} of ${movieScenes.length} · Which Christmas movie is this from?</div>
  <div class="movie-stage">
    <figure class="movie-shot">
      <img src="assets/img/movies/${m.file}" alt="Christmas movie scene ${i + 1}">
    </figure>
    <div class="dvd" aria-hidden="true">
      <div class="dvd-cover">
        <span><i>🎬</i>${m.title}</span>
        ${m.cover ? `<img src="${esc(m.cover)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
      </div>
    </div>
  </div>
  <div class="stage">
    ${mystery("Reveal movie", "🎬")}
    <div class="rv" data-rv>
      <div class="answer">${m.title}</div>
    </div>
  </div>
</section>`);
    // The follow-up comes on its own slide, so the title stays hidden until the scene is guessed.
    if (m.q) slides.push(questionSlide(m, m.title, "movie"));
  });

  // Surprise round – do you know your birds?
  section("Birds", "🐦");
  if (birds.watch) slides.push(birdWatchSlide(birds.watch));
  slides.push(`
<section class="slide">
  <div class="poster-row">
    ${birds.poster ? `<figure class="poster-shot"><img src="${esc(birds.poster.src)}" alt="${esc(birds.poster.alt || "")}" onerror="this.closest('figure').remove()"></figure>` : ""}
    <div class="poster-text">
      <div class="part-no">✦ Surprise Round ✦</div>
      <div class="title-xl" style="font-size:clamp(2.6rem,7.4vw,6.2rem)">${birds.title}</div>
      <div class="ribbon">${birds.ribbon}</div>
      <div class="holly">🐦🔭</div>
    </div>
  </div>
</section>`);
  slides.push(questionSlide(birds.opener, "Bird 1"));
  slides.push(matchSlide(birds.match));

  // Part 6 – Santa's Code Words
  section("Code Words", "🕵️");
  // First the record screeches and the music stops (data-music="none"): what is missing?
  if (typeof codeTeaser !== "undefined" && codeTeaser) {
    slides.push(questionSlide({...codeTeaser, q: `<span class="vinyl" aria-hidden="true"></span>
      <span class="hold">${codeTeaser.hold}</span>
      <span class="hold-q">${codeTeaser.q}</span>
      <span class="hold-line">${codeTeaser.line}</span>
      <span class="hold-points">${codeTeaser.points}</span>`}, "Wait", "screech", ' data-music="none"'));
  }
  slides.push(`
<section class="slide">
  <div class="poster-row">
    ${codePoster ? `<figure class="poster-shot"><img src="${esc(codePoster.src)}" alt="${esc(codePoster.alt || "")}" onerror="this.closest('figure').remove()"></figure>` : ""}
    <div class="poster-text">
      <div class="part-no">✦ Part 6 ✦</div>
      <div class="title-xl" style="font-size:clamp(2.6rem,7.4vw,6.2rem)">Santa's<br>Code Words</div>
      <div class="holly">🕵️🎄</div>
    </div>
  </div>
</section>`);
  codeWords.forEach((r, i) => slides.push(codeSlide(r, i, codeWords.length)));

  // Part 7
  section("Judgement", "😇");
  slides.push(part(7, "Naughty or Nice?", "😈😇"));
  slides.push(`
<section class="slide">
  <div class="script" style="font-size:clamp(2.6rem,6vw,4.6rem)">Naughty or Nice?</div>
  <div class="ribbon">Stamp each member of the party!</div>
  <div class="nn-grid">
    ${people.map((p) => `
    <div class="nn ${p.v === "naughty" ? "naughty-c" : "nice-c"}" data-card tabindex="0" role="button" aria-label="${esc(p.n)}">
      <div class="sil${p.photo ? " has-photo" : ""}"><span>${p.i}</span>${p.photo
        ? `<img src="${esc(p.photo)}" alt="" onerror="this.parentNode.classList.remove('has-photo');this.remove()">` : ""}</div>
      <div class="nm">${p.n}${p.d ? `<small>${p.d}</small>` : ""}</div>
      <div class="why">${p.why ? `${p.why}${p.tag ? `<small>(${p.tag})</small>` : ""}` : ""}</div>
      <div class="stamp ${p.v}">${p.v.toUpperCase()}</div>
    </div>`).join("")}
  </div>
  <p class="hint">Click a card to stamp it &nbsp;·&nbsp; or press <b>Space</b> to stamp the next one</p>
</section>`);

  // The gifts follow from the verdicts, so they stay in this section: naughty first, then nice.

  slides.push(`
<section class="slide">
  <div class="kicker">A Naughty List Gift for</div>
  <div class="script" style="font-size:clamp(2.6rem,6vw,4.4rem);margin-bottom:6px">Tom &amp; Vic</div>
  <div class="parch" style="width:min(960px,100%)">
    <div class="stage" style="min-height:260px;margin-top:0">
      ${mystery("Unwrap your gift", "🎁")}
      <div class="rv" data-rv style="width:100%">
        <div class="passes">
          <div class="ticket">
            <div style="font-size:3rem">💞</div>
            <h3>Guest Pass</h3>
            <p style="margin-top:8px">A free pass for your friends <b>Eleanor &amp; Lachie</b> to come and spend quality time with you!</p>
            <div class="fine">REDEEMABLE ON THE 30TH OF NOVEMBER ONLY</div>
          </div>
          <div class="tcs">
            <h4>TERMS &amp; CONDITIONS</h4>
            <ol>
              <li>Valid on the 30th of November only.</li>
              <li>Eleanor &amp; Lachie must be physically present (no substitutes).</li>
              <li>Quality time must be spent together (no hiding in separate rooms!).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="kicker">A Naughty List Gift for</div>
  <div class="script" style="font-size:clamp(2.6rem,6vw,4.4rem);margin-bottom:6px">Jev &amp; Ella</div>
  <div class="parch" style="width:min(960px,100%)">
    <div class="stage" style="min-height:260px;margin-top:0">
      ${mystery("Unwrap your gift", "🎁")}
      <div class="rv" data-rv style="width:100%">
        <div class="beach">
          <div class="beach-card">
            <div class="art">🏖️🌊</div>
            <div style="font-family:'Great Vibes',cursive;font-size:clamp(1.9rem,4vw,3rem);color:#0b3a52;line-height:1.1">Front Row Pass to<br>Wave Watching Party</div>
            <p style="font-size:clamp(.95rem,1.8vw,1.2rem);margin-top:8px;color:#0b3a52">A day at the beach with pristine surf conditions, to sit back, relax and watch the waves!</p>
          </div>
          <div class="nosign">STRICTLY<br>NO SURFBOARDS<br>ALLOWED<span class="no">🏄🚫</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="part-no">✦ ✦ ✦</div>
  <div class="title-xl" style="font-size:clamp(3.5rem,10vw,7.5rem)">Nice List Gifts</div>
  <div class="ribbon">For Those Who Behaved</div>
  <div style="font-size:4.5rem">🎁🎁🎁</div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(860px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.4rem,5.5vw,4rem);color:var(--red-d)">A Gift for Mum &amp; Dad</h2>
    <div class="stage">
      ${mystery("Unwrap your gift", "🎁")}
      <div class="rv" data-rv style="width:100%">
        <div class="gift-row">
          <img class="gift-photo" src="${esc(gifts.parents.photo.src)}" alt="${esc(gifts.parents.photo.alt || "")}" onerror="this.remove()">
          <div class="ticket">
            <div class="gift-icon">${gifts.parents.icon}</div>
            <h3>${gifts.parents.title}</h3>
            <p style="margin-top:8px">${gifts.parents.line}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(920px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.4rem,5.5vw,4rem);color:var(--red-d)">Treats for Jack &amp; Thumper</h2>
    <div class="stage">
      ${mystery("Open the bowl", "🥣")}
      <div class="rv" data-rv style="width:100%">
        <div class="pups">${pupPhotos(gifts.dogs)}</div>
        <p><b>🦴 ${gifts.dogs.line} 🐾</b></p>
      </div>
    </div>
  </div>
</section>`);

  // Finale
  section("Finale", "🎄");
  // The teaser: the envelope opens on whoever is leading the scoreboard (app.js fills it in).
  slides.push(`
<section class="slide">
  <div class="part-no">✦ The Scores Are In ✦</div>
  <div class="title-xl" style="font-size:clamp(3rem,9vw,7rem)">And the<br>Winner Is&hellip;</div>
  <div class="stage winner-stage">
    ${mystery("Open the envelope", "✉️")}
    <div class="rv" data-rv>
      <div class="winner" data-winner></div>
    </div>
  </div>
</section>`);
  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(620px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.2rem,5vw,3.6rem);color:var(--red-d);text-shadow:none;margin-bottom:10px">Final Scores</h2>
    <ol class="list final-scores" data-final-scores></ol>
  </div>
</section>`);
  slides.push(`
<section class="slide">
  <div class="duo">🎅🤶</div>
  <div class="title-xl" style="font-size:clamp(3rem,9vw,7rem)">Thank You<br>for Playing!</div>
  <div class="ribbon">Merry Christmas from the Ross Family!</div>
  <div style="font-size:3rem">🎄✨🎁</div>
</section>`);

  return slides;
}

const slides = buildSlides();
