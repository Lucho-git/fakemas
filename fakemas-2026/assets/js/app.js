/* ==========================================================================
   ENGINE
   Deck navigation, click-to-reveal, keyboard + swipe controls, snowfall.
   ========================================================================== */

const deck = document.getElementById("deck");
deck.innerHTML = slides.join("");

const els = [...deck.querySelectorAll(".slide")];
const countEl = document.getElementById("count");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progEl = document.getElementById("prog");
const fsBtn = document.getElementById("fs");
let cur = 0;

const pending = (slide) =>
  [...slide.querySelectorAll("[data-rv]:not(.on), [data-card]:not(.on)")];

function syncMystery(slide) {
  const done = !pending(slide).length;
  slide.classList.toggle("revealed", done);
  slide.querySelectorAll("[data-reveal]").forEach((b) => {
    b.classList.toggle("gone", done);
    b.tabIndex = done ? -1 : 0;
    b.setAttribute("aria-hidden", String(done));
  });
}

function revealNext() {
  const slide = els[cur];
  const item = pending(slide)[0];
  if (!item) return false;
  item.classList.add("on");
  if (item.hasAttribute("data-match-reveal")) gradeMatch(slide);
  // A reveal with a sound plays it; any other reveal just ends the slide's arrival sound.
  if (item.dataset.sfx) playSfx(item.dataset.sfx);
  else stopSfx();
  syncMystery(slide);
  return true;
}

/* ============ TIMELINE ============ */
// One button per section (see `sections` in slides.js); clicking jumps to its first slide.
const timelineEl = document.getElementById("timeline");
sections.forEach((s, k) => {
  s.end = (k + 1 < sections.length ? sections[k + 1].start : els.length) - 1;
});
timelineEl.innerHTML = sections.map((s, k) => {
  const count = s.end - s.start + 1;
  const tip = `${s.label} · ${count} slide${count === 1 ? "" : "s"}`;
  return `<button type="button" class="tl-seg" data-section="${k}" title="${esc(tip)}" aria-label="${esc(tip)}">` +
    `<span class="tl-ic" aria-hidden="true">${s.icon}</span><span class="tl-lbl">${esc(s.label)}</span></button>`;
}).join("");
const segEls = [...timelineEl.children];

function paintTimeline() {
  segEls.forEach((el, k) => {
    const s = sections[k];
    const state = cur > s.end ? "done" : cur >= s.start ? "now" : "todo";
    el.dataset.state = state;
    if (state === "now") el.setAttribute("aria-current", "step");
    else el.removeAttribute("aria-current");
    const done = state === "done" ? 1 : state === "now" ? (cur - s.start + 1) / (s.end - s.start + 1) : 0;
    el.style.setProperty("--p", done);
  });
}

timelineEl.addEventListener("click", (e) => {
  const seg = e.target.closest("[data-section]");
  if (!seg) return;
  show(sections[Number(seg.dataset.section)].start);
  if (e.detail) seg.blur(); // mouse/touch: hand the keyboard back to the deck
});

function show(i, updateHash = true) {
  cur = Math.max(0, Math.min(els.length - 1, i));
  paintTimeline();
  syncMusic();
  els.forEach((el, k) => {
    el.classList.toggle("active", k === cur);
    el.classList.toggle("past", k < cur);
  });
  countEl.textContent = `${cur + 1} / ${els.length}`;
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === els.length - 1;
  progEl.style.width = `${((cur + 1) / els.length) * 100}%`;
  if (updateHash) history.replaceState(null, "", `#${cur + 1}`);
  // A slide's arrival sound plays until its answer is revealed.
  stopSfx();
  if (els[cur].dataset.sfxEnter && pending(els[cur]).length) playSfx(els[cur].dataset.sfxEnter);
  // An intermission clip stops when its slide leaves. When the slide arrives it starts
  // from the top, once the slide's hype reel (data-clip-delay, in seconds) has run.
  clearTimeout(clipTimer);
  deck.querySelectorAll("video[data-clip]").forEach((clip) => {
    clip.pause();
    if (!els[cur].contains(clip)) return;
    clip.currentTime = 0;
    const wait = CALM.matches ? 0 : Number(clip.dataset.clipDelay || 0) * 1000;
    clipTimer = setTimeout(() => clip.play().catch(() => {}), wait);
  });
  syncAuto();
}
let clipTimer = 0;
const CALM = window.matchMedia("(prefers-reduced-motion: reduce)");

// A browser will not start a clip in a hidden tab, so try again when the page comes back.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) els[cur].querySelectorAll("video[data-clip]").forEach((clip) => clip.play().catch(() => {}));
});

/* ============ TYPED ANSWERS ============ */
// Text boxes on a slide (data-write) keep what is typed in them on this device.
const WRITES_KEY = "fakemas-writes";
let writes = {};
try { writes = JSON.parse(localStorage.getItem(WRITES_KEY)) || {}; } catch (err) { writes = {}; }
function saveWrites() {
  try { localStorage.setItem(WRITES_KEY, JSON.stringify(writes)); } catch (err) { /* private mode */ }
}
deck.querySelectorAll("textarea[data-write]").forEach((box) => { box.value = writes[box.dataset.write] || ""; });
deck.addEventListener("input", (e) => {
  const key = e.target.dataset && e.target.dataset.write;
  if (key === undefined) return;
  writes[key] = e.target.value;
  saveWrites();
});

// Puts a slide back to how it was before anything was revealed, flipped, stamped, matched or typed.
function resetSlide(slide) {
  if (slide === els[cur]) stopSfx();
  slide.querySelectorAll("[data-rv].on, [data-card].on, [data-flip].on").forEach((el) => el.classList.remove("on"));
  const boxes = slide.querySelectorAll("textarea[data-write]");
  boxes.forEach((box) => { box.value = ""; delete writes[box.dataset.write]; });
  if (boxes.length) saveWrites();
  resetMatch(slide);
  syncMystery(slide);
}
function resetDeck(everything) {
  (everything ? els : [els[cur]]).forEach(resetSlide);
}

// Stepping back into the self-running slideshow pauses it; stepping forward carries on.
const next = () => { autoPaused = false; show(cur + 1); };
const prev = () => { autoPaused = true; show(cur - 1); };

nextBtn.onclick = next;
prevBtn.onclick = prev;
// Reset button: this slide, or every slide with Shift held. Scores are never touched.
const resetBtn = document.getElementById("reset");
resetBtn.onclick = (e) => {
  resetDeck(e.shiftKey);
  if (e.detail) resetBtn.blur();
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};
fsBtn.onclick = toggleFullscreen;
document.addEventListener("fullscreenchange", () => {
  fsBtn.querySelector(".fs-lbl").textContent = document.fullscreenElement ? " Exit" : " Fullscreen";
});

/* ============ SCOREBOARD ============ */
// Every card is a team of one or more `players` (content.js) sharing one score.
// Drag a card onto another to team them up; "Split" undoes it. Kept in localStorage.
const BOARD_KEY = "fakemas-scoreboard";
const scoresEl = document.getElementById("scores");
const scoresBtn = document.getElementById("scores-btn");

const soloBoard = () => players.map((name) => ({members: [name], score: 0}));

function loadBoard() {
  try {
    const saved = JSON.parse(localStorage.getItem(BOARD_KEY));
    const names = saved.flatMap((t) => t.members);
    // Only trust a saved board that still matches the player list exactly.
    if (names.length === players.length && players.every((p) => names.includes(p))) {
      return saved.map((t) => ({members: t.members, score: Number(t.score) || 0}));
    }
  } catch (err) { /* nothing saved yet, or unreadable */ }
  return soloBoard();
}

let board = loadBoard();
const saveBoard = () => {
  try { localStorage.setItem(BOARD_KEY, JSON.stringify(board)); } catch (err) { /* private mode: carry on unsaved */ }
};
const teamName = (t) => t.members.map(esc).join(" &amp; ");

scoresEl.innerHTML = `
  <div class="sb-head">
    <h2>Scoreboard</h2>
    <span class="sb-hint">Drag one card onto another to make a team</span>
    <button type="button" data-score-reset>Reset</button>
    <button type="button" data-score-close aria-label="Close scoreboard">✕</button>
  </div>
  <div class="sb-grid"></div>`;
const gridEl = scoresEl.querySelector(".sb-grid");

// Rebuilds the cards; needed whenever teams change, not for a plain score change.
function renderBoard() {
  gridEl.innerHTML = board.map((t, k) => `
    <div class="sb-player${t.members.length > 1 ? " team" : ""}" data-team="${k}">
      <div class="sb-name">${teamName(t)}</div>
      <div class="sb-row">
        <button type="button" data-score="-1" aria-label="Take a point from ${teamName(t)}">−</button>
        <output class="sb-score"></output>
        <button type="button" data-score="1" aria-label="Give ${teamName(t)} a point">+</button>
      </div>
      ${t.members.length > 1 ? `<button type="button" class="sb-split" data-score-split aria-label="Split up ${teamName(t)}">Split</button>` : ""}
    </div>`).join("");
  paintScores();
}

function paintScores() {
  const best = Math.max(...board.map((t) => t.score));
  const leads = (t) => best > 0 && t.score === best;
  gridEl.querySelectorAll(".sb-player").forEach((el, k) => {
    el.querySelector(".sb-score").textContent = board[k].score;
    el.classList.toggle("lead", leads(board[k]));
  });
  // The "Final Scores" slide: highest first, ties stay in board order.
  const ranked = [...board].sort((a, b) => b.score - a.score);
  deck.querySelectorAll("[data-final-scores]").forEach((list) => {
    list.innerHTML = ranked.map((t) =>
      `<li class="${leads(t) ? "lead" : ""}"><span class="ic">${leads(t) ? "👑" : "🎄"}</span>` +
      `<span class="fs-name">${teamName(t)}</span><b>${t.score}</b></li>`).join("");
  });
  // The "And the winner is…" slide: whoever leads, or everyone who shares the lead.
  const champs = board.filter(leads);
  deck.querySelectorAll("[data-winner]").forEach((el) => {
    el.innerHTML = champs.length
      ? `<span class="winner-crown">👑</span><span class="winner-name">${champs.map(teamName).join(" <i>and</i> ")}</span>` +
        `<span class="winner-line">${champs.length > 1 ? "tied on" : "with"} ${best} point${best === 1 ? "" : "s"}</span>`
      : `<span class="winner-name">Nobody yet!</span><span class="winner-line">There are no points on the scoreboard</span>`;
  });
}

function toggleScores(open = scoresEl.hidden) {
  scoresEl.hidden = !open;
  scoresBtn.setAttribute("aria-expanded", String(open));
}

let resetArmed = null;
scoresEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const card = btn.closest("[data-team]");
  if (btn.dataset.score) {
    board[Number(card.dataset.team)].score += Number(btn.dataset.score);
    saveBoard();
    paintScores();
  } else if ("scoreSplit" in btn.dataset) {
    // Everyone leaves with the score the team had earned together.
    const k = Number(card.dataset.team);
    const team = board[k];
    board.splice(k, 1, ...team.members.map((name) => ({members: [name], score: team.score})));
    saveBoard();
    renderBoard();
  } else if ("scoreClose" in btn.dataset) {
    toggleScores(false);
  } else if ("scoreReset" in btn.dataset) {
    // Two clicks to zero the scores, so a stray click can't do it. Teams are kept.
    if (resetArmed) {
      clearTimeout(resetArmed);
      resetArmed = null;
      board.forEach((t) => { t.score = 0; });
      saveBoard();
      paintScores();
      btn.textContent = "Reset";
    } else {
      btn.textContent = "Sure?";
      resetArmed = setTimeout(() => { resetArmed = null; btn.textContent = "Reset"; }, 3000);
    }
  }
  if (e.detail) btn.blur(); // mouse/touch: hand the keyboard back to the deck
});

// Dragging a card (mouse or touch). Dropping it on another card merges the two teams.
let drag = null;
gridEl.addEventListener("pointerdown", (e) => {
  const card = e.target.closest(".sb-player");
  if (!card || e.target.closest("button") || drag) return;
  drag = {card, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, over: null};
  card.setPointerCapture(e.pointerId);
});
gridEl.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  drag.moved = true;
  drag.card.classList.add("dragging"); // also makes it click-through, so we can see what is underneath
  drag.card.style.transform = `translate(${dx}px, ${dy}px) rotate(-3deg)`;
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const target = under && under.closest(".sb-player");
  if (target !== drag.over) {
    if (drag.over) drag.over.classList.remove("drop");
    if (target) target.classList.add("drop");
    drag.over = target || null;
  }
});
function endDrag(e, merge) {
  if (!drag || e.pointerId !== drag.id) return;
  const {card, over, moved} = drag;
  drag = null;
  if (merge && moved && over) {
    const from = Number(card.dataset.team);
    const into = board[Number(over.dataset.team)];
    into.members.push(...board[from].members);
    into.score += board[from].score;
    board.splice(from, 1);
    saveBoard();
    renderBoard();
    return;
  }
  card.classList.remove("dragging");
  card.style.transform = "";
  if (over) over.classList.remove("drop");
}
gridEl.addEventListener("pointerup", (e) => endDrag(e, true));
gridEl.addEventListener("pointercancel", (e) => endDrag(e, false));

scoresBtn.onclick = (e) => {
  toggleScores();
  if (e.detail) scoresBtn.blur();
};
renderBoard();

/* ============ MATCHING GAME ============ */
// Slides built by matchSlide(): drag a photo tile onto a lettered name (or tap a tile, then
// tap where it goes). Dropping onto a taken name swaps the two. Revealing the slide marks it.
function placeTile(tile, target) {
  const from = tile.parentElement;
  if (target.matches(".mt-slot")) {
    const drop = target.querySelector(".mt-drop");
    const sitting = drop.querySelector(".mt-tile");
    if (sitting && sitting !== tile) from.append(sitting); // swap places
    drop.append(tile);
  } else {
    target.append(tile); // back to the tray
  }
}

function gradeMatch(slide) {
  const slots = [...slide.querySelectorAll(".mt-slot")];
  // Note what the host had placed before anything moves, then put every photo where it belongs.
  const placed = slots.map((slot) => slot.querySelector(".mt-tile"));
  const wasRight = slots.map((slot, k) => Boolean(placed[k]) && placed[k].dataset.tile === slot.dataset.slot);
  slots.forEach((slot, k) => {
    slot.querySelector(".mt-drop").append(slide.querySelector(`.mt-tile[data-tile="${slot.dataset.slot}"]`));
    // Only photos that had been placed get a tick or a cross; untouched ones are just shown.
    if (placed[k]) slot.classList.add(wasRight[k] ? "right" : "wrong");
  });
  slide.querySelectorAll(".picked").forEach((el) => el.classList.remove("picked"));
  slide.classList.add("graded");
  const status = slide.querySelector("[data-match-status]");
  if (status) {
    const tried = placed.filter(Boolean).length;
    status.textContent = tried ? `${wasRight.filter(Boolean).length} / ${tried} placed correctly` : "The answers";
  }
}

// Back to the start: photos in the tray in their dealt order, no marks.
function resetMatch(slide) {
  const tray = slide.querySelector("[data-tray]");
  if (!tray) return;
  [...slide.querySelectorAll(".mt-tile")]
    .sort((x, y) => Number(x.dataset.order) - Number(y.dataset.order))
    .forEach((tile) => tray.append(tile));
  slide.querySelectorAll(".mt-slot").forEach((slot) => slot.classList.remove("right", "wrong", "drop"));
  slide.classList.remove("graded");
  const status = slide.querySelector("[data-match-status]");
  if (status) status.textContent = status.dataset.matchStatus;
}

// A click on a photo (a press that does not turn into a drag) shows it large, so the room
// can see it; any click or key puts it away again. Once the answers are out, the large
// view carries the bird's name as well as its number.
const zoomEl = document.createElement("div");
zoomEl.id = "zoom";
zoomEl.hidden = true;
zoomEl.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>`;
document.body.append(zoomEl);
function zoomTile(tile) {
  const num = tile.querySelector(".mt-num");
  const slot = tile.closest(".graded") && tile.closest(".mt-slot");
  const name = slot && slot.querySelector(".mt-name span");
  zoomEl.querySelector("img").src = tile.querySelector("img").src;
  zoomEl.querySelector("figcaption").innerHTML =
    `${num ? `<b>${esc(num.textContent)}</b>` : ""}${name ? `<span>${esc(name.textContent)}</span>` : ""}`;
  zoomEl.hidden = false;
}
const closeZoom = () => { zoomEl.hidden = true; };
zoomEl.addEventListener("click", closeZoom);

let tileDrag = null;
const dropZone = (el) => el && el.closest(".mt-slot, [data-tray]");

deck.addEventListener("pointerdown", (e) => {
  const tile = e.target.closest(".mt-tile");
  if (!tile || tileDrag || tile.closest(".graded")) return;
  tileDrag = {tile, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, over: null};
  tile.setPointerCapture(e.pointerId);
});
deck.addEventListener("pointermove", (e) => {
  if (!tileDrag || e.pointerId !== tileDrag.id) return;
  const dx = e.clientX - tileDrag.x;
  const dy = e.clientY - tileDrag.y;
  if (!tileDrag.moved && Math.hypot(dx, dy) < 6) return;
  tileDrag.moved = true;
  tileDrag.tile.classList.add("dragging"); // click-through while held, so we can see what is under it
  tileDrag.tile.style.transform = `translate(${dx}px, ${dy}px) rotate(-3deg)`;
  const zone = dropZone(document.elementFromPoint(e.clientX, e.clientY)) || null;
  if (zone !== tileDrag.over) {
    if (tileDrag.over) tileDrag.over.classList.remove("drop");
    if (zone) zone.classList.add("drop");
    tileDrag.over = zone;
  }
});
function endTileDrag(e, commit) {
  if (!tileDrag || e.pointerId !== tileDrag.id) return;
  const {tile, over, moved} = tileDrag;
  tileDrag = null;
  tile.classList.remove("dragging");
  tile.style.transform = "";
  if (over) over.classList.remove("drop");
  if (!commit) return;
  if (!moved) zoomTile(tile);
  else if (over) placeTile(tile, over);
}
deck.addEventListener("pointerup", (e) => endTileDrag(e, true));
deck.addEventListener("pointercancel", (e) => endTileDrag(e, false));
// Once the answers are out the photos no longer drag, but they still open large.
deck.addEventListener("click", (e) => {
  const tile = e.target.closest(".graded .mt-tile");
  if (tile) zoomTile(tile);
});

/* ============ MUSIC ============ */
// Two channels (see `music` in content.js): the background playlist, and the slideshow
// music that takes over on slides marked data-music="trip". A track can be played four
// ways: through Spotify itself once someone has signed in ("connect"), through Spotify's
// embedded player, through YouTube's, or from an audio file. The two embedded players sit
// in a small dock. The ♪ button opens a menu of what is playing, with a button per song,
// a switch between Spotify and YouTube, and the Spotify sign-in.
const jingleBtn = document.getElementById("jingle");
const musicMenu = document.getElementById("music-menu");
const ytDock = document.getElementById("yt-dock");
const STAND_IN = /assets\/audio\/(jingle|trip)\.mp3$/; // the generated tracks
const asTrack = (t) => (typeof t === "string"
  ? {file: t, title: t.split("/").pop().replace(/\.\w+$/, "").replace(/-/g, " ")}
  : t);

// Which service plays the songs: `music.source` to begin with, then whatever was last
// picked in the ♪ menu on this browser.
const SOURCE_KEY = "fakemas-music-source";
const SOURCES = {spotify: "Spotify", youtube: "YouTube"};
let musicSource = music.source in SOURCES ? music.source : "youtube";
try {
  const saved = localStorage.getItem(SOURCE_KEY);
  if (saved && saved in SOURCES) musicSource = saved;
} catch (err) { /* private mode: use the default */ }
// A service whose player script would not load (offline, or blocked) is not tried again.
const serviceDown = {spotify: false, youtube: false};

// How a track will be played right now: the chosen service if the song is on it,
// otherwise the other service, otherwise its audio file.
function kindOf(t) {
  if (!t) return null;
  if (musicSource === "spotify" && t.spotify && connect.status === "ready") return "connect";
  const order = musicSource === "spotify" ? ["spotify", "youtube"] : ["youtube", "spotify"];
  return order.find((service) => t[service] && !serviceDown[service]) || (t.file ? "file" : null);
}

// Which audio files are really there? (Only a web server can be asked; opened straight
// from disk we find out when a song fails to play.) Streamed tracks are taken on trust.
async function present(list) {
  const tracks = list.map(asTrack);
  if (!/^https?:$/.test(location.protocol)) return tracks;
  const found = await Promise.all(tracks.map((t) =>
    (t.spotify || t.youtube ? true : fetch(t.file, {method: "HEAD"}).then((r) => r.ok, () => false))));
  return tracks.filter((_, k) => found[k]);
}

// Each service's player script, fetched once and only if a track needs it. Each rejects
// when it cannot be reached, and the channels then fall back to the next way of playing.
let ytApiPromise = null;
function ytApi() {
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) { resolve(); return; }
      const giveUp = setTimeout(() => reject(new Error("YouTube did not load")), 10000);
      window.onYouTubeIframeAPIReady = () => { clearTimeout(giveUp); resolve(); };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => { clearTimeout(giveUp); reject(new Error("YouTube is unreachable")); };
      document.head.append(script);
    });
  }
  return ytApiPromise;
}
let spotifyApiPromise = null;
function spotifyApi() {
  if (!spotifyApiPromise) {
    spotifyApiPromise = new Promise((resolve, reject) => {
      const giveUp = setTimeout(() => reject(new Error("Spotify did not load")), 10000);
      window.onSpotifyIframeApiReady = (api) => { clearTimeout(giveUp); resolve(api); };
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => { clearTimeout(giveUp); reject(new Error("Spotify is unreachable")); };
      document.head.append(script);
    });
  }
  return spotifyApiPromise;
}
function serviceFailed(service) {
  if (serviceDown[service]) return;
  serviceDown[service] = true;
  refreshChannels();
}

/* ---- Spotify, signed in ---- */
// With a Spotify app's Client ID in content.js (music.spotifyApp), "Connect Spotify" in the
// ♪ menu signs a Premium listener in on Spotify's own page (PKCE, so no secret is kept
// here). The songs then play whole, inside this page, through Spotify's Web Playback SDK:
// a track played this way has the kind "connect". One player is shared by both channels.
const SP_APP = music.spotifyApp || {};
const SP_HERE = location.origin + location.pathname.replace(/index\.html$/, "");
const SP_REDIRECT = (SP_APP.redirects || []).includes(SP_HERE) ? SP_HERE : null;
const SP_TOKENS = "fakemas-spotify";
const SP_PKCE = "fakemas-spotify-pkce";
const SP_SCOPES = "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state";
const connect = {
  // off (no app, or not at a registered address) | signed-out | starting | ready | failed
  status: SP_APP.client && SP_REDIRECT ? "signed-out" : "off",
  problem: "",       // what to tell the listener when it is not working
  player: null,
  device: null,
  owner: null,       // the channel that last asked for a song
  id: null,          // that song's track ID
  volume: 0.4,
  playing: false,    // the owner wants its song playing
  position: 0,       // the song's last known position, in ms
  duration: 0,
  ended: false,
  onEnded: null,
  startedAt: 0,      // when the song was last asked for
  heardAt: 0,        // when it was last heard playing
  ticket: 0          // bumped by every request, so a slow reply to an old one is ignored
};

function spTokens() {
  try { return JSON.parse(localStorage.getItem(SP_TOKENS)); } catch (err) { return null; }
}
function spStore(tokens) {
  try {
    if (tokens) localStorage.setItem(SP_TOKENS, JSON.stringify(tokens));
    else localStorage.removeItem(SP_TOKENS);
  } catch (err) { /* private mode */ }
}
async function spTokenRequest(params) {
  const reply = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({client_id: SP_APP.client, ...params})
  });
  if (!reply.ok) throw new Error(`Spotify sign-in failed (${reply.status})`);
  const d = await reply.json();
  const old = spTokens() || {};
  const tokens = {access: d.access_token, refresh: d.refresh_token || old.refresh, expires: Date.now() + (d.expires_in - 60) * 1000};
  spStore(tokens);
  return tokens;
}
// A token that is good right now: the saved one, or a fresh one if that has run out.
let spRefreshing = null;
async function spToken() {
  const tokens = spTokens();
  if (!tokens) throw new Error("not signed in");
  if (Date.now() < tokens.expires) return tokens.access;
  if (!spRefreshing) {
    spRefreshing = spTokenRequest({grant_type: "refresh_token", refresh_token: tokens.refresh})
      .finally(() => { spRefreshing = null; });
  }
  return (await spRefreshing).access;
}

const spBase64 = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// Off to Spotify's sign-in page. It sends the listener back here with a code.
async function spSignIn() {
  if (connect.status === "off") return;
  const verifier = spBase64(crypto.getRandomValues(new Uint8Array(48)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const state = spBase64(crypto.getRandomValues(new Uint8Array(12)));
  sessionStorage.setItem(SP_PKCE, JSON.stringify({verifier, state, slide: cur + 1}));
  location.assign(`https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: SP_APP.client,
    response_type: "code",
    redirect_uri: SP_REDIRECT,
    code_challenge_method: "S256",
    code_challenge: spBase64(new Uint8Array(digest)),
    scope: SP_SCOPES,
    state
  })}`);
}
// Back from Spotify's sign-in page: swap the code for tokens, and put the address (and the
// slide) back as they were.
async function spFinishSignIn() {
  const query = new URLSearchParams(location.search);
  if (!query.has("code") && !query.has("error")) return;
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(SP_PKCE)); sessionStorage.removeItem(SP_PKCE); } catch (err) { /* no session storage */ }
  history.replaceState(null, "", location.pathname + (saved && saved.slide ? `#${saved.slide}` : location.hash));
  if (!query.has("code")) { connect.problem = "Spotify sign-in was cancelled."; return; }
  if (!saved || saved.state !== query.get("state")) { connect.problem = "Spotify sign-in did not finish. Try again."; return; }
  await spTokenRequest({grant_type: "authorization_code", code: query.get("code"), redirect_uri: SP_REDIRECT, code_verifier: saved.verifier});
}

function spFail(problem) {
  connect.status = "failed";
  connect.problem = problem;
  connect.playing = false;
  refreshChannels();
}
function spSignOut(problem = "") {
  spStore(null);
  if (connect.player) connect.player.disconnect();
  connect.player = null;
  connect.device = null;
  connect.playing = false;
  connect.status = "signed-out";
  connect.problem = problem;
  refreshChannels();
}

// Starts Spotify's player in this page. Resolves once it is ready, or has failed.
let spStarting = null;
function spStartPlayer() {
  if (spStarting) return spStarting;
  connect.status = "starting";
  spStarting = new Promise((resolve) => {
    const giveUp = setTimeout(() => { if (connect.status === "starting") spFail("Spotify's player did not start."); resolve(); }, 9000);
    const done = () => { clearTimeout(giveUp); resolve(); };
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: "Fakemas Quiz",
        getOAuthToken: (give) => { spToken().then(give, () => spSignOut("Spotify needs you to sign in again.")); },
        volume: connect.volume
      });
      connect.player = player;
      player.addListener("ready", ({device_id: device}) => {
        connect.device = device;
        connect.status = "ready";
        connect.problem = "";
        done();
        refreshChannels();
      });
      // e.g. the connection dropped: the songs fall back to the other ways of playing
      player.addListener("not_ready", () => {
        if (connect.status !== "ready") return;
        connect.status = "starting";
        connect.playing = false;
        refreshChannels();
      });
      player.addListener("initialization_error", () => { spFail("This browser cannot run Spotify's player. Use Chrome or Edge on a computer."); done(); });
      player.addListener("authentication_error", () => { spSignOut("Spotify needs you to sign in again."); done(); });
      player.addListener("account_error", () => { spFail("Spotify Premium is needed to play whole songs here."); done(); });
      player.addListener("player_state_changed", spHeard);
      player.connect().then((ok) => { if (!ok) { spFail("Spotify's player could not connect."); done(); } });
    };
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.onerror = () => { spFail("Spotify is unreachable."); done(); };
    document.head.append(script);
  });
  return spStarting;
}

// Asks the player for one song, from `position` ms in. `onEnded` runs when it finishes.
async function spPlay(owner, id, position, volume, onEnded) {
  const ticket = ++connect.ticket;
  Object.assign(connect, {owner, id, volume, playing: true, position, duration: 0, ended: false, onEnded,
    startedAt: performance.now(), heardAt: 0});
  connect.player.setVolume(volume).catch(() => {});
  try {
    const token = await spToken();
    if (ticket !== connect.ticket) return;
    const reply = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${connect.device}`, {
      method: "PUT",
      headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      body: JSON.stringify({uris: [`spotify:track:${id}`], position_ms: Math.max(0, Math.floor(position))})
    });
    if (ticket !== connect.ticket) return;
    if (reply.status === 401) spSignOut("Spotify needs you to sign in again.");
    else if (reply.status === 403) spFail("Spotify would not play that here. Premium is needed for whole songs.");
  } catch (err) { /* offline or signed out: the watcher below tries again, or the sign-out has been dealt with */ }
}
function spPause(owner) {
  if (connect.owner !== owner || !connect.playing) return;
  connect.playing = false;
  connect.ticket += 1;
  if (connect.player) connect.player.pause().catch(() => {});
}

// What the player says it is doing. Spotify sends no "finished" message, so a song is over
// when it reaches its end, stops in its last moments, or something else has come on instead.
function spHeard(state) {
  if (!state || !connect.owner || !connect.player) return;
  const now = performance.now();
  if (!connect.playing) {
    if (!state.paused) connect.player.pause().catch(() => {});   // it came to life late
    return;
  }
  const track = state.track_window && state.track_window.current_track;
  const ours = track && (track.id === connect.id || (track.linked_from && track.linked_from.id === connect.id));
  let over = false;
  if (ours) {
    connect.duration = state.duration || connect.duration;
    if (!state.paused) { connect.position = state.position; connect.heardAt = now; }
    const d = connect.duration;
    over = d > 0 && (state.paused ? connect.heardAt > 0 && connect.position >= d - 3000 : state.position >= d - 1200);
  } else {
    // Spotify has moved on to a song of its own choosing: ours must have finished.
    over = !state.paused && now - connect.startedAt > 6000;
  }
  if (over && !connect.ended) {
    connect.ended = true;
    connect.playing = false;
    if (connect.onEnded) connect.onEnded();
  }
}
// The player only reports changes, so ask it once a second while a song should be playing,
// and ask for the song again if nothing has been heard of it for a while.
setInterval(() => {
  if (connect.status !== "ready" || !connect.playing || !connect.player) return;
  connect.player.getCurrentState().then((state) => {
    if (state) spHeard(state);
    const now = performance.now();
    const quiet = now - Math.max(connect.heardAt, connect.startedAt);
    if (connect.playing && !connect.ended && quiet > 7000) {
      spPlay(connect.owner, connect.id, connect.position, connect.volume, connect.onEnded);
    }
  }, () => {});
}, 1000);

// On load: finish a sign-in that is under way, then start the player if someone is signed in.
const connectBoot = (async () => {
  if (connect.status === "off") return;
  try { await spFinishSignIn(); } catch (err) { connect.problem = "Spotify sign-in did not finish. Try again."; }
  if (spTokens()) await spStartPlayer();
})();

// A channel plays its tracks one at a time: shuffled, each once per round.
// The generated stand-in only plays when there is nothing else.
function makeChannel(name, el, tracks, volume, label) {
  const songs = tracks.filter((t) => !(t.file && STAND_IN.test(t.file)));
  const standIn = tracks.find((t) => t.file && STAND_IN.test(t.file)) || null;
  const dead = new Set();   // songs that turned out not to play
  let queue = [];
  let now = null;
  let nowKind = null;       // how `now` is being played: "spotify", "youtube", "file" or null
  let wantPlaying = false;
  let ducked = false;       // turned down while a sound effect plays
  const level = () => volume * (ducked ? 0.3 : 1);
  el.volume = volume;

  // This channel's YouTube player, made when first needed.
  let yt = null;
  let ytReady = false;
  let ytWanted = null;      // the video the player should be showing
  // This channel's Spotify player, likewise. Spotify only reports what it is doing through
  // "playback_update" messages, so the state below is our record of the latest one.
  let sp = null;
  let spMaking = false;
  let spWanted = null;      // the track the player should have loaded ("spotify:track:…")
  let spLoaded = null;
  let spPaused = true;
  let spAsked = false;      // we have asked it to play since it last paused
  let spAskedAt = 0;
  let spLastPos = 0;        // last position heard while playing, in ms
  let spHeardAt = 0;        // when it last reported anything
  let spDone = false;       // the loaded song has played to its end
  let spSample = false;     // it is only playing a 30-second sample (not signed in)
  // Where this channel's song is up to on the signed-in Spotify player, which it shares.
  let cPos = 0;

  const pool = () => songs.filter((t) => !dead.has(t) && kindOf(t));
  const shuffled = (list) => {
    const out = [...list];
    for (let k = out.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [out[k], out[j]] = [out[j], out[k]];
    }
    // don't open a new round with the song that just finished
    if (out.length > 1 && out[0] === now) out.push(out.shift());
    return out;
  };
  function drop(track) {
    dead.add(track);
    queue = queue.filter((t) => t !== track);
  }
  // The song finished: a lone track goes round again, otherwise the next one starts.
  const loops = () => pool().length <= 1;

  /* ---- YouTube ---- */
  function showVideo() {
    if (!ytReady || !ytWanted || nowKind !== "youtube") return;
    const showing = yt.getVideoData && yt.getVideoData().video_id;
    if (showing !== ytWanted) {
      if (wantPlaying) yt.loadVideoById(ytWanted);
      else yt.cueVideoById(ytWanted);
    } else if (wantPlaying) {
      yt.playVideo();
    }
  }
  function useYouTube(id) {
    ytWanted = id;
    ytApi().then(() => {
      if (yt) { showVideo(); return; }
      yt = new YT.Player(`yt-${name}`, {
        width: "100%",
        height: "100%",
        videoId: id,
        playerVars: {playsinline: 1, rel: 0},
        events: {
          onReady: () => { ytReady = true; yt.setVolume(Math.round(level() * 100)); showVideo(); },
          onStateChange: (e) => {
            if (e.data !== YT.PlayerState.ENDED || nowKind !== "youtube") return;
            if (loops()) { yt.seekTo(0); yt.playVideo(); }
            else load(true);
          },
          // e.g. the owner does not allow this video to play on other websites
          onError: () => { if (nowKind === "youtube") { drop(now); load(channelWanted(channel)); } }
        }
      });
    }).catch(() => serviceFailed("youtube"));
  }

  /* ---- Spotify ---- */
  // A playing song reports about once a second, so a long silence means it has stopped.
  const spStopped = () => spPaused || performance.now() - spHeardAt > 5000;
  function askSpotifyToPlay() {
    // resume() starts a freshly loaded track and carries on a paused one. Asking again
    // while it is still starting up would only stutter, so allow one ask per 1.5 seconds.
    if (performance.now() - spAskedAt < 1500) return;
    spAskedAt = performance.now();
    spAsked = true;
    sp.resume();
  }
  function showSpotify() {
    if (!sp || !spWanted || nowKind !== "spotify") return;
    if (spLoaded !== spWanted) {
      spLoaded = spWanted;
      spPaused = true;
      spAsked = false;
      spAskedAt = 0;
      spLastPos = 0;
      spDone = false;
      sp.loadUri(spWanted);
    }
    if (wantPlaying && spStopped()) askSpotifyToPlay();
  }
  function onSpotifyUpdate(e) {
    const d = e.data || {};
    const wasSample = spSample;
    if (d.duration > 0) spSample = d.duration < 40000;
    spHeardAt = performance.now();
    // Spotify sends no "finished" message. A song is over when its position reaches its
    // length (it then goes quiet), or when it stops within its last moments.
    let ended = false;
    if (!d.isPaused) {
      spPaused = false;
      spLastPos = d.position || 0;
      ended = d.duration > 0 && spLastPos >= d.duration - 400;
      // It came to life after this channel stopped being wanted: quieten it again.
      if (!wantPlaying || nowKind !== "spotify") sp.pause();
    } else {
      ended = !spPaused && d.duration > 0 && spLastPos >= d.duration - 2500;
      spPaused = true;
      spAsked = false;
    }
    if (ended && !spDone) {
      spDone = true;          // the last position is reported more than once
      spPaused = true;
      if (nowKind === "spotify" && wantPlaying) {
        spAskedAt = 0;
        if (loops()) { spDone = false; spLastPos = 0; sp.seek(0); askSpotifyToPlay(); }
        else load(true);
      }
    }
    if (wasSample !== spSample) paintMusicMenu();
  }
  function useSpotify(id) {
    spWanted = `spotify:track:${id}`;
    spotifyApi().then((api) => {
      if (sp) { showSpotify(); return; }
      if (spMaking) return;
      spMaking = true;
      const first = spWanted;
      api.createController(document.getElementById(`sp-${name}`), {uri: first, width: "100%", height: 80}, (controller) => {
        sp = controller;
        spLoaded = first;
        sp.addListener("playback_update", onSpotifyUpdate);
        sp.addListener("ready", showSpotify);
        showSpotify();
      });
    }).catch(() => serviceFailed("spotify"));
  }

  /* ---- Spotify, signed in ---- */
  const connectMine = () => connect.owner === name && connect.playing;
  function connectStart() {
    spPlay(name, now.spotify, cPos, level(), () => {
      if (nowKind !== "connect") return;
      cPos = 0;
      if (!loops()) load(wantPlaying);
      else if (wantPlaying) connectStart();
    });
  }

  function play() {
    wantPlaying = true;
    if (nowKind === "connect") {
      if (!connectMine()) connectStart();
    } else if (nowKind === "spotify") {
      showSpotify();
    } else if (nowKind === "youtube") {
      if (ytReady) yt.playVideo();
    } else if (el.getAttribute("src")) {
      const started = el.play();
      if (started && started.catch) started.catch(() => {}); // blocked until the first gesture
    }
  }
  function quieten(except) {
    // a song on the shared player is left where it is, to be picked up again from there
    if (except !== "connect" && connectMine()) { cPos = connect.position; spPause(name); }
    if (except !== "youtube" && ytReady) yt.pauseVideo();
    if (except !== "spotify" && sp && (spAsked || !spPaused)) { spAsked = false; sp.pause(); }
    if (except !== "file" && !el.paused) el.pause();
  }
  function pause() {
    wantPlaying = false;
    quieten(null);
  }
  // Starts `now` on whichever player it currently belongs to.
  function start(andPlay) {
    wantPlaying = Boolean(andPlay);
    nowKind = kindOf(now);
    quieten(nowKind);
    if (nowKind !== "file") el.removeAttribute("src");
    if (nowKind === "connect") {
      cPos = 0;
      if (andPlay) connectStart();
      else spPause(name);
    } else if (nowKind === "spotify") {
      useSpotify(now.spotify);
    } else if (nowKind === "youtube") {
      useYouTube(now.youtube);
    } else if (nowKind === "file") {
      el.loop = loops();
      el.src = now.file;
      if (andPlay) play();
    }
    paintMusicMenu();
  }
  // Loads the next song in the round, or `pick` if a particular one was asked for.
  function load(andPlay, pick) {
    const playable = pool();
    queue = queue.filter((t) => t !== pick && playable.includes(t));
    if (!pick && !queue.length) queue = shuffled(playable);
    now = pick || queue.shift() || standIn;
    start(andPlay);
  }
  el.addEventListener("ended", () => { if (nowKind === "file") load(true); });
  el.addEventListener("error", () => {
    if (nowKind !== "file" || !now) return;
    // A file that will not play is dropped, and the round moves on.
    const bad = now;
    drop(bad);
    if (bad === standIn) { now = null; nowKind = null; el.removeAttribute("src"); paintMusicMenu(); return; }
    load(channelWanted(channel));
  });

  const channel = {
    label,
    play,
    pause,
    paused: () => (nowKind === "connect" ? !connectMine()
      : nowKind === "spotify" ? spStopped()
      : nowKind === "youtube" ? !ytReady || ![YT.PlayerState.PLAYING, YT.PlayerState.BUFFERING].includes(yt.getPlayerState())
      : el.paused),
    restart: () => {
      if (nowKind === "connect") { cPos = 0; if (connectMine()) connectStart(); }
      else if (nowKind === "spotify") { if (sp) { spLastPos = 0; spDone = false; sp.seek(0); } }
      else if (nowKind === "youtube") { if (ytReady) yt.seekTo(0); }
      else { try { el.currentTime = 0; } catch (err) { /* not loaded yet */ } }
    },
    tracks: () => { const playable = pool(); return playable.length ? playable : standIn ? [standIn] : []; },
    current: () => now,
    kind: () => nowKind,
    sampling: () => nowKind === "spotify" && spSample,
    choose: (track) => load(true, track),
    // Spotify's embedded player has no volume control: signed in it can be turned down,
    // as YouTube and files can.
    duck: (on) => {
      ducked = on;
      el.volume = level();
      if (connectMine() && connect.player) connect.player.setVolume(level()).catch(() => {});
      if (ytReady) yt.setVolume(Math.round(level() * 100));
    },
    // The service changed (picked in the menu, or one failed): move the current song across.
    refresh: () => {
      if (now && !kindOf(now)) load(wantPlaying);
      else if (kindOf(now) !== nowKind) start(wantPlaying);
    }
  };
  load(false);
  return channel;
}

let channels = null;       // made once we know which files exist
let musicWanted = true;
let lastChannel = "jingle";

const slideChannel = () => (channels && channels[els[cur].dataset.music] ? els[cur].dataset.music : "jingle");
// A slide marked data-music="none" stops the music for as long as it is up.
const wantedName = () => (musicWanted && els[cur].dataset.music !== "none" ? slideChannel() : null);
function channelWanted(channel) {
  return Boolean(channels) && channels[wantedName()] === channel;
}
function refreshChannels() {
  if (!channels) return;
  Object.values(channels).forEach((channel) => channel.refresh());
  syncMusic();
}

function syncMusic() {
  if (!channels) return;
  const want = wantedName();
  if (want && want !== lastChannel) {
    // The slideshow music starts from the top whenever the deck arrives at it.
    if (want !== "jingle") channels[want].restart();
    lastChannel = want;
  }
  Object.entries(channels).forEach(([name, channel]) => {
    if (name !== want) channel.pause();
    else if (channel.paused()) channel.play();
  });
  paintMusicMenu();
}

// The Spotify sign-in, as it appears in the ♪ menu while Spotify is the chosen service.
function connectMenu(from) {
  if (from !== "spotify" || !SP_APP.client) return "";
  if (connect.status === "off") {
    return `<div class="mm-connect">For whole songs, open the quiz at ${esc((SP_APP.redirects || [""])[0].replace(/^https?:\/\//, ""))} and connect Spotify there.</div>`;
  }
  if (connect.status === "ready") {
    return `<div class="mm-connect ok">Spotify connected: whole songs
      <button type="button" class="mm-link" data-disconnect>Disconnect</button></div>`;
  }
  if (connect.status === "starting") return `<div class="mm-connect">Connecting to Spotify…</div>`;
  return `<button type="button" class="mm-connect-btn" data-connect>Connect Spotify</button>
    <div class="mm-connect">${esc(connect.problem || "Sign in with Premium to play whole songs.")}</div>`;
}

let musicMenuHtml = "";
function paintMusicMenu() {
  jingleBtn.setAttribute("aria-pressed", String(musicWanted));
  if (!channels) return;
  const active = slideChannel();
  const channel = channels[active];
  const now = channel.current();
  const kind = channel.kind();
  const from = kind in SOURCES ? kind : musicSource;   // the service really in use, if one is
  const html = `
    <div class="mm-head">${esc(channel.label)}</div>
    <div class="mm-now">${musicWanted && now ? "Now playing" : "Muted"}${now ? `: <b>${esc(now.title)}</b>` : ""}</div>
    <div class="mm-list">${channel.tracks().map((t, k) =>
      `<button type="button" class="mm-track${t === now ? " now" : ""}" data-track="${k}"` +
      `${t === now ? ' aria-current="true"' : ""}>${esc(t.title)}</button>`).join("")}</div>
    <div class="mm-source" role="group" aria-label="Play the songs from">
      <span>Play from</span>${Object.entries(SOURCES).map(([key, text]) =>
        `<button type="button" class="mm-src${key === from ? " now" : ""}" data-source="${key}"` +
        `${key === from ? ' aria-pressed="true"' : ' aria-pressed="false"'}${serviceDown[key] ? " disabled" : ""}>${text}</button>`).join("")}
    </div>
    ${connectMenu(from)}
    ${channel.sampling() ? `<div class="mm-note">Spotify is only playing 30-second samples here. ${
      connect.status === "off" ? "Sign in at open.spotify.com in this browser and reload, or switch to YouTube."
        : "Connect Spotify for whole songs, or switch to YouTube."}</div>` : ""}
    <button type="button" class="mm-mute" data-mute>${musicWanted ? "Mute music" : "Unmute music"}</button>`;
  // Only touch the page when something changed: this runs on every click and key press, and
  // rebuilding the buttons mid-click would swallow the click.
  if (html !== musicMenuHtml) {
    musicMenuHtml = html;
    musicMenu.innerHTML = html;
  }
  // A streaming service's player stays on screen whenever it is the one playing.
  const docked = kind in SOURCES;
  ytDock.hidden = !docked;
  ytDock.dataset.kind = docked ? kind : "";
  ytDock.querySelectorAll(".yt-frame").forEach((frame) =>
    frame.classList.toggle("live", docked && frame.dataset.channel === active && frame.dataset.kind === kind));
}

function toggleMusicMenu(open = musicMenu.hidden) {
  musicMenu.hidden = !open;
  jingleBtn.setAttribute("aria-expanded", String(open));
}
function toggleMute() {
  musicWanted = !musicWanted;
  if (!musicWanted) stopSfx();
  syncMusic();
}

jingleBtn.onclick = (e) => {
  toggleMusicMenu();
  if (e.detail) jingleBtn.blur();
};
musicMenu.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || !channels) return;
  if ("mute" in btn.dataset) {
    toggleMute();
  } else if ("connect" in btn.dataset) {
    spSignIn();
  } else if ("disconnect" in btn.dataset) {
    spSignOut();
  } else if (btn.dataset.source) {
    musicSource = btn.dataset.source;
    try { localStorage.setItem(SOURCE_KEY, musicSource); } catch (err) { /* private mode */ }
    refreshChannels();
  } else if (btn.dataset.track) {
    // Picking a song also un-mutes.
    const channel = channels[slideChannel()];
    musicWanted = true;
    channel.choose(channel.tracks()[Number(btn.dataset.track)]);
    syncMusic();
  }
});

// The dock can be parked in any corner, in case it covers something on a slide.
const DOCK_CORNERS = ["br", "bl", "tl", "tr"];
try { ytDock.dataset.corner = localStorage.getItem("fakemas-dock") || "br"; } catch (err) { ytDock.dataset.corner = "br"; }
document.getElementById("yt-move").onclick = (e) => {
  const next = DOCK_CORNERS[(DOCK_CORNERS.indexOf(ytDock.dataset.corner) + 1) % DOCK_CORNERS.length];
  ytDock.dataset.corner = next;
  try { localStorage.setItem("fakemas-dock", next); } catch (err) { /* private mode */ }
  if (e.detail) e.currentTarget.blur();
};

// The dock can also be tucked away to a small button while the music carries on.
// (Not for YouTube, whose player has to stay in view: the styles ignore it there.)
const ytMin = document.getElementById("yt-min");
function setDockMin(min) {
  ytDock.classList.toggle("min", min);
  ytMin.textContent = min ? "♫" : "–";
  ytMin.title = min ? "Show the player" : "Hide the player";
  ytMin.setAttribute("aria-label", ytMin.title);
}
try { setDockMin(localStorage.getItem("fakemas-dock-min") === "1"); } catch (err) { setDockMin(false); }
ytMin.onclick = (e) => {
  const min = !ytDock.classList.contains("min");
  setDockMin(min);
  try { localStorage.setItem("fakemas-dock-min", min ? "1" : "0"); } catch (err) { /* private mode */ }
  if (e.detail) e.currentTarget.blur();
};

Promise.all([present(music.playlist), present(music.slideshow), connectBoot]).then(([background, slideshow]) => {
  channels = {
    jingle: makeChannel("jingle", document.getElementById("jingle-audio"), background, 0.4, "Background playlist"),
    trip: makeChannel("trip", document.getElementById("trip-audio"), slideshow, 0.5, "Slideshow music")
  };
  syncMusic();
});
paintMusicMenu();

// Browsers block autoplay, so kick the music off on the first interaction. (Spotify's own
// player also has to be told about that interaction before it may make a sound.)
["pointerdown", "keydown", "touchstart"].forEach((evt) =>
  document.addEventListener(evt, () => {
    if (connect.player && connect.player.activateElement) connect.player.activateElement().catch(() => {});
    syncMusic();
  }, {passive: true})
);

/* ============ SOUND EFFECTS ============ */
// Named clips from `sfx` in content.js, one playing at a time. A slide's data-sfx-enter
// plays when the deck arrives on it; a data-sfx on a reveal plays as it is revealed.
// The music dips while a clip plays, and muting the music silences these too.
const sfxPlayers = {};
Object.entries(typeof sfx === "undefined" ? {} : sfx).forEach(([name, src]) => {
  const clip = new Audio(src);
  clip.preload = "auto";
  clip.addEventListener("ended", () => duckMusic(false));
  clip.addEventListener("error", () => duckMusic(false));
  sfxPlayers[name] = clip;
});
function duckMusic(on) {
  if (channels) Object.values(channels).forEach((channel) => channel.duck(on));
}
function stopSfx() {
  Object.values(sfxPlayers).forEach((clip) => { if (!clip.paused) clip.pause(); });
  duckMusic(false);
}
function playSfx(name) {
  stopSfx();
  const clip = sfxPlayers[name];
  if (!clip || !musicWanted) return;
  try { clip.currentTime = 0; } catch (err) { /* not loaded yet: it starts from the top anyway */ }
  duckMusic(true);
  const started = clip.play();
  if (started && started.catch) started.catch(() => duckMusic(false)); // blocked until the first gesture
}

/* ============ AUTOPLAY ============ */
// A slide with data-auto="seconds" moves on by itself (the Philippines photos). Space and →
// still skip ahead. ← steps back and pauses; P pauses and resumes. The last photo has no
// data-auto, so the deck stops there and waits for the host.
let autoTimer = null;
let autoPaused = false;
function syncAuto() {
  clearTimeout(autoTimer);
  autoTimer = null;
  els.forEach((el) => el.classList.remove("auto-run", "auto-held"));
  const slide = els[cur];
  const seconds = Number(slide.dataset.auto);
  if (!seconds) { autoPaused = false; return; }
  if (autoPaused) { slide.classList.add("auto-held"); return; }
  slide.style.setProperty("--auto", `${seconds}s`);
  void slide.offsetWidth;            // restart the countdown bar's animation
  slide.classList.add("auto-run");
  autoTimer = setTimeout(() => show(cur + 1), seconds * 1000);
}
function toggleAuto() {
  if (!els[cur].dataset.auto) return;
  autoPaused = !autoPaused;
  syncAuto();
}

/* `data-card` turns over on click or on Space (in order); `data-flip` on click only. */
const FLIPPABLE = "[data-card], [data-flip]";
const isUnflipped = (t) =>
  t instanceof Element && t.matches(FLIPPABLE) && !t.classList.contains("on");

// Turning a card over by hand plays its sound, as Space does through revealNext.
function flipOn(card) {
  if (card.classList.contains("on")) return;
  card.classList.add("on");
  if (card.dataset.sfx) playSfx(card.dataset.sfx);
}
deck.addEventListener("click", (e) => {
  if (e.target.closest("[data-reveal]")) return revealNext();
  const card = e.target.closest(FLIPPABLE);
  if (card) flipOn(card);
});

deck.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && isUnflipped(e.target)) {
    e.preventDefault();
    e.stopPropagation();
    flipOn(e.target);
  }
});

document.addEventListener("keydown", (e) => {
  // With a photo open large, any key just puts it away.
  if (!zoomEl.hidden) { e.preventDefault(); closeZoom(); return; }
  // Typing in a text box is just typing: no shortcuts, and Escape hands the keyboard back.
  if (e.target instanceof Element && e.target.closest("textarea, input")) {
    if (e.key === "Escape") e.target.blur();
    return;
  }
  // A card that is already face-up no longer swallows Space, so it carries on revealing.
  if (isUnflipped(e.target) && (e.key === " " || e.key === "Enter")) return;
  // A focused timeline or scoreboard button gets pressed, rather than advancing the deck.
  const onControl = e.target instanceof Element && e.target.closest("#timeline, #scores, #scores-btn, #music-menu, #yt-dock");
  if (onControl && (e.key === " " || e.key === "Enter")) return;
  switch (e.key) {
    case "ArrowRight": case "PageDown": next(); break;
    case "ArrowLeft": case "PageUp": prev(); break;
    case " ": case "Enter":
      e.preventDefault();
      if (!revealNext()) next();
      break;
    case "Home": show(0); break;
    case "End": show(els.length - 1); break;
    case "f": case "F": toggleFullscreen(); break;
    case "s": case "S": toggleScores(); break;
    case "r": case "R": resetDeck(e.shiftKey); break; // with Shift: every slide
    case "m": case "M": toggleMute(); break;
    case "p": case "P": toggleAuto(); break;
    case "Escape": toggleScores(false); toggleMusicMenu(false); break;
  }
});

let touchX = null;
document.addEventListener("touchstart", (e) => {
  const onPanel = e.target instanceof Element && e.target.closest("#scores, #timeline, #music-menu, #yt-dock, .mt-tile");
  touchX = onPanel ? null : e.touches[0].clientX;
}, {passive: true});
document.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 70) (dx < 0 ? next : prev)();
  touchX = null;
});

show((parseInt(location.hash.slice(1), 10) || 1) - 1, false);

addEventListener("hashchange", () => {
  const n = parseInt(location.hash.slice(1), 10);
  if (n && n - 1 !== cur) show(n - 1, false);
});

/* ============ SNOW ============ */
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let W = 0, H = 0, flakes = [];

function sizeCanvas() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
addEventListener("resize", sizeCanvas);
sizeCanvas();

const makeFlake = () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: Math.random() * 2.6 + 0.6,
  s: Math.random() * 0.8 + 0.3,
  d: Math.random() * Math.PI * 2
});
for (let i = 0; i < 110; i++) flakes.push(makeFlake());

function drawSnow() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.75)";
  flakes.forEach((f) => {
    f.y += f.s;
    f.d += 0.012;
    f.x += Math.sin(f.d) * 0.4;
    if (f.y > H) { f.y = -5; f.x = Math.random() * W; }
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, 7);
    ctx.fill();
  });
  requestAnimationFrame(drawSnow);
}

if (reduceMotion) {
  ctx.fillStyle = "rgba(255,255,255,.6)";
  flakes.forEach((f) => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, 7);
    ctx.fill();
  });
} else {
  requestAnimationFrame(drawSnow);
}
