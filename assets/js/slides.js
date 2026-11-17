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

/* One question slide: badge, question, then a click/Space reveal. */
const questionSlide = (x, i) => `
<section class="slide">
  <div class="qbadge">Q${i + 1}</div>
  <div class="parch">
    <h2 class="q" style="padding-top:clamp(36px,6vw,20px)">${x.q}</h2>
    <div class="stage">
      ${mystery("Reveal answer", "🎁")}
      <div class="rv" data-rv>
        ${media(x.media)}
        <div class="art">${x.icon}</div>
        <div class="answer ${x.long ? "long" : ""}">A: ${x.a}</div>
      </div>
    </div>
  </div>
</section>`;

function buildSlides() {
  const slides = [];

  // 1 – Cover / teaser
  slides.push(`
<section class="slide" style="background:radial-gradient(ellipse at 70% 10%,rgba(80,110,220,.3),transparent 50%),radial-gradient(ellipse at 10% 40%,rgba(255,110,30,.25),transparent 50%)">
  <div class="cover-moon"><span>🛷</span></div>
  <div class="kicker" style="position:relative;z-index:1">❄ ${EVENT.name} ❄</div>
  <div class="duo">🎅🤶</div>
  <div class="script" style="font-size:clamp(2rem,5vw,3.6rem);position:relative;z-index:1">Will Santa Be</div>
  <div class="title-red" style="position:relative;z-index:1">Naughty <span class="script" style="font-size:.5em;-webkit-text-fill-color:var(--gold-l)">or</span> Nice?</div>
  <div class="ribbon" style="position:relative;z-index:1;font-family:'Cinzel',serif;font-style:normal;letter-spacing:.3em;font-size:clamp(.8rem,1.6vw,1.1rem)">EVENT TEASER</div>
  <div class="pill" style="position:relative;z-index:1">${EVENT.when}</div>
  <div class="feats">
    <div class="feat"><div class="fi">📋</div><div class="ribbon">A Christmas<em>Quiz!</em></div></div>
    <div class="feat"><div class="fi">⚖️</div><div class="ribbon">Everybody will receive a<em>Naughty or Nice</em>Judgement!</div></div>
    <div class="feat"><div class="fi">🎮</div><div class="ribbon">A Christmas<em>Game!</em></div></div>
  </div>
</section>`);

  // 2 – Title
  slides.push(`
<section class="slide">
  <div class="duo" style="font-size:clamp(3rem,8vw,6rem)">🎅🤶</div>
  <div class="script" style="font-size:clamp(2rem,5vw,3.5rem)">The Ross Family</div>
  <div class="title-xl" style="font-size:clamp(3.5rem,12vw,9rem)">Christmas Quiz</div>
  <div class="ribbon">A Festive Family Trivia &amp; Games Presentation</div>
  <p class="hint">Press <b>→</b> to begin &nbsp;·&nbsp; <b>Space</b> to reveal answers</p>
</section>`);

  // 3 – Overview
  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(820px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(1.8rem,4.2vw,3.1rem);color:var(--red-d);text-shadow:none;margin-bottom:10px">Presentation Overview</h2>
    <ul class="list">
      <li><span class="ic">🎁</span>Part 1: Family Christmas Quiz</li>
      <li><span class="ic">🔔</span>Part 2: Christmas Trivia</li>
      <li><span class="ic">📜</span>Part 3: Mum &amp; Dad's Naughty List</li>
      <li><span class="ic">❓</span>Part 4: Christmas Riddles</li>
      <li><span class="ic">🎬</span>Part 5: Guess the Movie Scene</li>
      <li><span class="ic">😇</span>Part 6: Naughty or Nice?</li>
      <li><span class="ic">🎀</span>Part 7: Special Gifts</li>
      <li><span class="ic">🌴</span>Bonus: Lach &amp; Eleanor's Philippines Trip</li>
    </ul>
  </div>
</section>`);

  // Part 1
  slides.push(part(1, "The Family<br>Christmas Quiz", "🎄🍒🎄"));
  slides.push(`
<section class="slide">
  <div class="title-xl">The Christmas<br>Family Quiz</div>
  <div class="ribbon">12 Questions from Our Family Group Chat</div>
  <div style="font-size:clamp(4rem,10vw,7rem)">📱🎄</div>
</section>`);

  quiz.forEach((x, i) => slides.push(questionSlide(x, i)));

  // Part 2 – general Christmas trivia
  slides.push(part(2, "Christmas<br>Trivia", "🔔🧦🔔"));
  slides.push(`
<section class="slide">
  <div class="title-xl">Christmas<br>Trivia</div>
  <div class="ribbon">16 Questions on Christmas Itself</div>
  <div style="font-size:clamp(4rem,10vw,7rem)">🍗🎄</div>
</section>`);

  trivia.forEach((x, i) => slides.push(questionSlide(x, i)));

  // Part 3
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
    <h2 class="script" style="font-weight:400;font-size:clamp(2.2rem,5vw,3.6rem);color:var(--red-d)">Open Question &amp; Answer</h2>
    <p>Write down the reasons you think each of you has been on the kids' Naughty Lists.</p>
    <div class="writes">
      <div class="write"><b>Mum's Guess</b><small>(Why am I on the Naughty List?)</small></div>
      <div class="write"><b>Dad's Guess</b><small>(Why am I on the Naughty List?)</small></div>
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
  slides.push(part(4, "Christmas Riddles<br>&amp; Quiz", "❓🎄"));
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

  // Part 5
  slides.push(part(5, "Guess the<br>Movie Scene", "🎬🍿"));
  movieScenes.forEach((m, i) => {
    slides.push(`
<section class="slide movie">
  <div class="movie-head">Scene ${i + 1} of ${movieScenes.length} · Which Christmas movie is this from?</div>
  <figure class="movie-shot">
    <img src="assets/img/movies/${m.file}" alt="Christmas movie scene ${i + 1}">
  </figure>
  <div class="stage">
    ${mystery("Reveal movie", "🎬")}
    <div class="rv" data-rv>
      <div class="answer">${m.title}</div>
    </div>
  </div>
</section>`);
  });

  // Part 6
  slides.push(part(6, "Naughty or Nice?", "😈😇"));
  slides.push(`
<section class="slide">
  <div class="script" style="font-size:clamp(2.6rem,6vw,4.6rem)">Naughty or Nice?</div>
  <div class="ribbon">Stamp each member of the party!</div>
  <div class="nn-grid">
    ${people.map((p) => `
    <div class="nn ${p.v === "naughty" ? "naughty-c" : "nice-c"}" data-card tabindex="0" role="button" aria-label="${esc(p.n)}">
      <div class="sil">${p.i}</div>
      <div class="nm">${p.n}${p.d ? `<small>${p.d}</small>` : "<small>&nbsp;</small>"}</div>
      <div style="height:34px"></div>
      <div class="stamp ${p.v}">${p.v.toUpperCase()}</div>
    </div>`).join("")}
  </div>
  <p class="hint">Click a card to stamp it &nbsp;·&nbsp; or press <b>Space</b> to stamp the next one</p>
</section>`);

  // Part 7
  slides.push(part(7, "Special Gifts", "🎁🎀"));

  slides.push(`
<section class="slide">
  <div class="kicker">A Special Gift for</div>
  <div class="script" style="font-size:clamp(2.6rem,6vw,4.4rem);margin-bottom:6px">Tom &amp; Vic</div>
  <div class="parch" style="width:min(960px,100%)">
    <div class="stage" style="min-height:260px;margin-top:0">
      ${mystery("Unwrap your gift", "🎁")}
      <div class="rv" data-rv style="width:100%">
        <div class="passes">
          <div class="ticket">
            <div style="font-size:3rem">💞</div>
            <h3>Anniversary<br>Guest Pass</h3>
            <p style="margin-top:8px">A free pass for your friends <b>Eleanor &amp; Lachie</b> to come and spend quality time with you!</p>
            <div class="fine">REDEEMABLE ON YOUR ANNIVERSARY DATE ONLY</div>
          </div>
          <div class="tcs">
            <h4>NAUGHTY REDEEMABLE<br>TERMS &amp; CONDITIONS</h4>
            <ol>
              <li>Valid only on your anniversary date.</li>
              <li>Eleanor &amp; Lachie must be physically present (no substitutes).</li>
              <li>Quality time must be spent together (no hiding in separate rooms!).</li>
              <li>This is a Monkey's Paw gift — use it wisely!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="kicker">A Special Gift for</div>
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
  <div class="title-xl" style="font-size:clamp(3.5rem,10vw,7.5rem)">Bonus Gifts</div>
  <div class="ribbon">Something Special for Everyone</div>
  <div style="font-size:4.5rem">🎁🎁🎁</div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(760px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.4rem,5.5vw,4rem);color:var(--red-d)">A Gift for Mum &amp; Dad</h2>
    <div class="stage">
      ${mystery("Unwrap your gift", "🎁")}
      <div class="rv" data-rv>
        <div class="art">🎁✨</div>
        <p><b>A well-earned treat!</b></p>
        <p style="font-style:italic;font-size:clamp(.95rem,1.9vw,1.25rem)">(A special experience or indulgence for the two of you to enjoy together!)</p>
      </div>
    </div>
  </div>
</section>`);

  slides.push(`
<section class="slide">
  <div class="parch" style="width:min(760px,100%)">
    <h2 class="script" style="font-weight:400;font-size:clamp(2.4rem,5.5vw,4rem);color:var(--red-d)">Treats for Jack &amp; Thumper</h2>
    <div class="stage">
      ${mystery("Open the bowl", "🥣")}
      <div class="rv" data-rv>
        <div class="art">🦴🐕🐾</div>
        <p><b>A Christmas stash of their favourite treats!</b></p>
      </div>
    </div>
  </div>
</section>`);

  // Bonus – Lach & Eleanor's trip to the Philippines
  slides.push(`
<section class="slide trip">
  <div class="part-no">✦ Bonus ✦</div>
  <div class="trip-title" style="font-size:clamp(2.6rem,7vw,5.4rem)">${trip.title}</div>
  <div class="trip-flag">🌴</div>
  <div class="ribbon">${trip.blurb}</div>
</section>`);

  slides.push(`
<section class="slide trip">
  <div class="trip-brief">
    <h2 class="trip-title small">Why are we showing you this?</h2>
    <ul>
      ${trip.intro.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  </div>
</section>`);

  trip.photos.forEach((photo, i) => {
    slides.push(`
<section class="slide trip">
  <div class="trip-tag">🌴 Philippines · ${String(i + 1).padStart(2, "0")} / ${trip.photos.length}</div>
  <figure class="photo-frame ${i % 2 ? "tilt-r" : "tilt-l"}">
    <img src="${photo.src}" alt="${esc(photo.alt || photo.caption)}" loading="lazy">
    <figcaption>${photo.caption}</figcaption>
  </figure>
</section>`);

    trip.interjections
      .filter((q) => q.after === i + 1)
      .forEach((q) => {
        slides.push(`
<section class="slide trip">
  <div class="quip">
    <div class="quip-by">${q.by} interjects</div>
    <div class="quip-text">“${q.text}”</div>
  </div>
</section>`);
      });
  });

  slides.push(`
<section class="slide trip">
  <div class="trip-flag">🌴</div>
  <div class="trip-title">Salamat!</div>
  <div class="ribbon">Normal Christmas programming resumes.</div>
</section>`);

  // Finale
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
