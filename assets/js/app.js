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
  syncMystery(slide);
  return true;
}

function show(i, updateHash = true) {
  cur = Math.max(0, Math.min(els.length - 1, i));
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

const next = () => show(cur + 1);
const prev = () => show(cur - 1);

nextBtn.onclick = next;
prevBtn.onclick = prev;

const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};
fsBtn.onclick = toggleFullscreen;
document.addEventListener("fullscreenchange", () => {
  fsBtn.textContent = document.fullscreenElement ? "⛶ Exit" : "⛶ Fullscreen";
});

/* ============ JINGLE ============ */
const jingleEl = document.getElementById("jingle-audio");
const jingleBtn = document.getElementById("jingle");
let jingleWanted = true;

function playJingle() {
  if (!jingleWanted || !jingleEl.paused) return;
  const started = jingleEl.play();
  if (started && started.catch) started.catch(() => {}); // blocked until the first gesture
}

function paintJingle() {
  jingleBtn.setAttribute("aria-pressed", String(jingleWanted));
  jingleBtn.title = jingleWanted ? "Mute Christmas jingle" : "Play Christmas jingle";
}

jingleEl.volume = 0.4;
jingleBtn.onclick = () => {
  jingleWanted = !jingleWanted;
  if (jingleWanted) playJingle();
  else jingleEl.pause();
  paintJingle();
};
jingleEl.addEventListener("error", () => { jingleBtn.hidden = true; });
paintJingle();

// Browsers block autoplay, so kick the music off on the first interaction.
["pointerdown", "keydown", "touchstart"].forEach((evt) =>
  document.addEventListener(evt, playJingle, {passive: true})
);
playJingle();

deck.addEventListener("click", (e) => {
  if (e.target.closest("[data-reveal]")) return revealNext();
  const card = e.target.closest("[data-card]");
  if (card) card.classList.add("on");
});

deck.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element && e.target.matches("[data-card]")) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add("on");
  }
});

document.addEventListener("keydown", (e) => {
  const onCard = e.target instanceof Element && e.target.matches("[data-card]");
  if (onCard && (e.key === " " || e.key === "Enter")) return;
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
  }
});

let touchX = null;
document.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, {passive: true});
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
