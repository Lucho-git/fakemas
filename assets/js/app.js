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
}

// Puts a slide back to how it was before anything was revealed, flipped, stamped or matched.
function resetSlide(slide) {
  slide.querySelectorAll("[data-rv].on, [data-card].on, [data-flip].on").forEach((el) => el.classList.remove("on"));
  resetMatch(slide);
  syncMystery(slide);
}
function resetDeck(everything) {
  (everything ? els : [els[cur]]).forEach(resetSlide);
}

const next = () => show(cur + 1);
const prev = () => show(cur - 1);

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
    .forEach((tile) => { tile.classList.remove("picked"); tray.append(tile); });
  slide.querySelectorAll(".mt-slot").forEach((slot) => slot.classList.remove("right", "wrong", "drop"));
  slide.classList.remove("graded");
  const status = slide.querySelector("[data-match-status]");
  if (status) status.textContent = status.dataset.matchStatus;
  pickedTile = null;
}

let tileDrag = null;
let pickedTile = null;
const pickTile = (tile) => {
  if (pickedTile) pickedTile.classList.remove("picked");
  pickedTile = tile === pickedTile ? null : tile;
  if (pickedTile) pickedTile.classList.add("picked");
};
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
  if (moved) {
    if (over) placeTile(tile, over);
    pickTile(null);
  } else if (pickedTile && pickedTile !== tile && tile.closest(".mt-slot")) {
    placeTile(pickedTile, tile.closest(".mt-slot")); // tap a second, placed tile: swap with it
    pickTile(null);
  } else {
    pickTile(tile); // a tap picks it up (or puts it down again)
  }
}
deck.addEventListener("pointerup", (e) => endTileDrag(e, true));
deck.addEventListener("pointercancel", (e) => endTileDrag(e, false));
// With a tile picked, tapping a name (or the tray) puts it there.
deck.addEventListener("click", (e) => {
  if (!pickedTile || e.target.closest(".mt-tile")) return;
  const zone = dropZone(e.target);
  if (zone && zone.closest(".slide") === pickedTile.closest(".slide")) {
    placeTile(pickedTile, zone);
    pickTile(null);
  }
});

/* ============ MUSIC ============ */
// Two channels (see `music` in content.js): the background playlist, and the slideshow
// music that takes over on slides marked data-music="trip". A track is either a YouTube
// video, streamed through YouTube's own embedded player (shown in a small dock), or an
// audio file. The ♪ button opens a menu of what is playing, with a button per song.
const jingleBtn = document.getElementById("jingle");
const musicMenu = document.getElementById("music-menu");
const ytDock = document.getElementById("yt-dock");
const STAND_IN = /assets\/audio\/(jingle|trip)\.mp3$/; // the generated tracks
const asTrack = (t) => (typeof t === "string"
  ? {file: t, title: t.split("/").pop().replace(/\.\w+$/, "").replace(/-/g, " ")}
  : t);

// Which audio files are really there? (Only a web server can be asked; opened straight
// from disk we find out when a song fails to play.) YouTube tracks are taken on trust.
async function present(list) {
  const tracks = list.map(asTrack);
  if (!/^https?:$/.test(location.protocol)) return tracks;
  const found = await Promise.all(tracks.map((t) =>
    (t.youtube ? true : fetch(t.file, {method: "HEAD"}).then((r) => r.ok, () => false))));
  return tracks.filter((_, k) => found[k]);
}

// YouTube's player script, fetched once and only if a track needs it. Rejects when it
// cannot be reached (no internet), and the channels then fall back to their audio files.
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

// A channel plays its tracks one at a time: shuffled, each once per round.
// The generated stand-in only plays when there is nothing else.
function makeChannel(name, el, tracks, volume, label) {
  let pool = tracks.filter((t) => !(t.file && STAND_IN.test(t.file)));
  const standIn = tracks.find((t) => t.file && STAND_IN.test(t.file)) || null;
  let queue = [];
  let now = null;
  let wantPlaying = false;
  let yt = null;            // this channel's YouTube player, made when first needed
  let ytReady = false;
  let ytWanted = null;      // the video the player should be showing
  el.volume = volume;

  const onYouTube = () => Boolean(now && now.youtube);
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
    pool = pool.filter((t) => t !== track);
    queue = queue.filter((t) => t !== track);
  }
  // No YouTube (offline, or the script was blocked): carry on with whatever files there are.
  function dropYouTube() {
    const wasOn = onYouTube();
    pool.filter((t) => t.youtube).forEach(drop);
    if (wasOn) load(channelWanted(channel));
  }

  function showVideo() {
    if (!ytReady || !ytWanted) return;
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
          onReady: () => { ytReady = true; yt.setVolume(Math.round(volume * 100)); showVideo(); },
          onStateChange: (e) => {
            if (e.data !== YT.PlayerState.ENDED || !onYouTube()) return;
            if (pool.length <= 1) { yt.seekTo(0); yt.playVideo(); } // a lone track just loops
            else load(true);
          },
          // e.g. the owner does not allow this video to play on other websites
          onError: () => { if (onYouTube()) { drop(now); load(channelWanted(channel)); } }
        }
      });
    }).catch(dropYouTube);
  }

  function play() {
    wantPlaying = true;
    if (onYouTube()) {
      if (ytReady) yt.playVideo();
    } else if (el.getAttribute("src")) {
      const started = el.play();
      if (started && started.catch) started.catch(() => {}); // blocked until the first gesture
    }
  }
  function pause() {
    wantPlaying = false;
    if (ytReady) yt.pauseVideo();
    if (!el.paused) el.pause();
  }
  // Loads the next song in the round, or `pick` if a particular one was asked for.
  function load(andPlay, pick) {
    if (pick) queue = queue.filter((t) => t !== pick);
    else if (!queue.length) queue = shuffled(pool);
    now = pick || queue.shift() || standIn;
    wantPlaying = Boolean(andPlay);
    if (onYouTube()) {
      if (!el.paused) el.pause();
      el.removeAttribute("src");
      useYouTube(now.youtube);
    } else {
      if (ytReady) yt.pauseVideo();
      if (now) {
        el.loop = pool.length <= 1;        // a lone track just loops
        el.src = now.file;
        if (andPlay) play();
      } else {
        el.removeAttribute("src");
      }
    }
    paintMusicMenu();
  }
  el.addEventListener("ended", () => { if (!onYouTube()) load(true); });
  el.addEventListener("error", () => {
    if (onYouTube() || !now) return;
    // A file that will not play is dropped, and the round moves on.
    const bad = now;
    drop(bad);
    if (bad === standIn) { now = null; el.removeAttribute("src"); paintMusicMenu(); return; }
    load(channelWanted(channel));
  });

  const channel = {
    label,
    play,
    pause,
    paused: () => (onYouTube()
      ? !ytReady || ![YT.PlayerState.PLAYING, YT.PlayerState.BUFFERING].includes(yt.getPlayerState())
      : el.paused),
    restart: () => {
      if (onYouTube()) { if (ytReady) yt.seekTo(0); }
      else { try { el.currentTime = 0; } catch (err) { /* not loaded yet */ } }
    },
    tracks: () => (pool.length ? pool : standIn ? [standIn] : []),
    current: () => now,
    choose: (track) => load(true, track)
  };
  load(false);
  return channel;
}

let channels = null;       // made once we know which files exist
let musicWanted = true;
let lastChannel = "jingle";

const slideChannel = () => (channels && channels[els[cur].dataset.music] ? els[cur].dataset.music : "jingle");
const wantedName = () => (musicWanted ? slideChannel() : null);
function channelWanted(channel) {
  return Boolean(channels) && channels[wantedName()] === channel;
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

let musicMenuHtml = "";
function paintMusicMenu() {
  jingleBtn.setAttribute("aria-pressed", String(musicWanted));
  if (!channels) return;
  const active = slideChannel();
  const channel = channels[active];
  const now = channel.current();
  const html = `
    <div class="mm-head">${esc(channel.label)}</div>
    <div class="mm-now">${musicWanted && now ? "Now playing" : "Muted"}${now ? `: <b>${esc(now.title)}</b>` : ""}</div>
    <div class="mm-list">${channel.tracks().map((t, k) =>
      `<button type="button" class="mm-track${t === now ? " now" : ""}" data-track="${k}"` +
      `${t === now ? ' aria-current="true"' : ""}>${esc(t.title)}</button>`).join("")}</div>
    <button type="button" class="mm-mute" data-mute>${musicWanted ? "Mute music" : "Unmute music"}</button>`;
  // Only touch the page when something changed: this runs on every click and key press, and
  // rebuilding the buttons mid-click would swallow the click.
  if (html !== musicMenuHtml) {
    musicMenuHtml = html;
    musicMenu.innerHTML = html;
  }
  // The YouTube player stays on screen whenever a YouTube track is the current one.
  const onYouTube = Boolean(now && now.youtube);
  ytDock.hidden = !onYouTube;
  ytDock.querySelectorAll(".yt-frame").forEach((frame) =>
    frame.classList.toggle("live", onYouTube && frame.dataset.channel === active));
}

function toggleMusicMenu(open = musicMenu.hidden) {
  musicMenu.hidden = !open;
  jingleBtn.setAttribute("aria-expanded", String(open));
}
function toggleMute() {
  musicWanted = !musicWanted;
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

Promise.all([present(music.playlist), present(music.slideshow)]).then(([background, slideshow]) => {
  channels = {
    jingle: makeChannel("jingle", document.getElementById("jingle-audio"), background, 0.4, "Background playlist"),
    trip: makeChannel("trip", document.getElementById("trip-audio"), slideshow, 0.5, "Slideshow music")
  };
  syncMusic();
});
paintMusicMenu();

// Browsers block autoplay, so kick the music off on the first interaction.
["pointerdown", "keydown", "touchstart"].forEach((evt) =>
  document.addEventListener(evt, syncMusic, {passive: true})
);

/* `data-card` turns over on click or on Space (in order); `data-flip` on click only. */
const FLIPPABLE = "[data-card], [data-flip]";
const isUnflipped = (t) =>
  t instanceof Element && t.matches(FLIPPABLE) && !t.classList.contains("on");

deck.addEventListener("click", (e) => {
  if (e.target.closest("[data-reveal]")) return revealNext();
  const card = e.target.closest(FLIPPABLE);
  if (card) card.classList.add("on");
});

deck.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && isUnflipped(e.target)) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add("on");
  }
});

document.addEventListener("keydown", (e) => {
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
