/* ==========================================================================
   STEALING SANTA
   The helper for the gift-stealing game: it holds the names, draws the numbers,
   shows the playing order and rolls the die. The stealing itself is played at
   the table. Names and numbers are kept in this browser (localStorage), so a
   refresh does not lose them.
   ========================================================================== */

const COUNT = 8;        // players (and gifts)
const ROLL_NEEDED = 3;  // roll this or higher to steal
const LOCK_ROLL = 6;    // this roll steals the gift and locks it for good
const DEFAULT_NAMES = ["Tom", "Vic", "Jev", "Ella", "Mum", "Dad", "Lach", "Eleanor"];
const STORE = "stealing-santa";

const $ = (id) => document.getElementById(id);
const ESCAPES = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

/* ============ state ============ */
// numbers[p] is player p's number, 1 to COUNT, once they have been drawn
const fresh = () => ({names: [...DEFAULT_NAMES], numbers: null});

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Array.isArray(saved.names) && saved.names.length === COUNT) {
      const drawn = Array.isArray(saved.numbers) && saved.numbers.length === COUNT;
      return {names: saved.names, numbers: drawn ? saved.numbers : null};
    }
  } catch (err) { /* nothing saved, or private mode */ }
  return fresh();
}
let state = load();

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (err) { /* private mode */ }
}

const nameOf = (p) => (state.names[p] || "").trim() || `Player ${p + 1}`;
const order = () => state.names.map((_, p) => p).sort((a, b) => state.numbers[a] - state.numbers[b]);

function shuffled(n) {
  const a = Array.from({length: n}, (_, k) => k + 1);
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

/* ============ drawing the page ============ */
function renderRoster() {
  $("roster").innerHTML = state.names.map((name, p) => `
    <li>
      <span class="num${state.numbers ? " drawn" : ""}" data-num="${p}">${state.numbers ? state.numbers[p] : "?"}</span>
      <input type="text" data-name="${p}" value="${esc(name)}" maxlength="18" autocomplete="off"
             placeholder="Player ${p + 1}" aria-label="Name of player ${p + 1}">
    </li>`).join("");
  $("to-game").disabled = !state.numbers;
  $("draw").textContent = state.numbers ? "Draw again" : "Draw the numbers";
  renderHint();
}
function renderHint() {
  $("players-hint").textContent = !state.numbers ? "Type the eight names, then draw the numbers."
    : `Playing order: ${order().map(nameOf).join(" → ")}`;
}

function renderOrder() {
  $("no-order").hidden = !!state.numbers;
  $("order").hidden = !state.numbers;
  $("order").innerHTML = !state.numbers ? "" : order().map((p, k) =>
    `<li style="--k:${k}"><b>${state.numbers[p]}</b><span>${esc(nameOf(p))}</span></li>`).join("");
}

function render() {
  renderRoster();
  renderOrder();
}

/* ============ sections ============ */
const VIEWS = ["rules", "players", "game"];
let view = "rules";
function show(next) {
  view = VIEWS.includes(next) ? next : "rules";
  VIEWS.forEach((v) => { $(v).hidden = v !== view; });
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("on", tab.dataset.view === view));
  window.history.replaceState(null, "", `#${view}`);
  render();
  window.scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-view]");
  if (go && !go.disabled) show(go.dataset.view);
});
$("print").onclick = () => window.print();

/* ============ names and numbers ============ */
$("roster").addEventListener("input", (e) => {
  const p = e.target.dataset.name;
  if (p === undefined) return;
  state.names[Number(p)] = e.target.value;
  save();
  renderHint();
});

let drawing = false;
$("draw").onclick = () => {
  if (drawing) return;
  drawing = true;
  const final = shuffled(COUNT);
  const badges = [...document.querySelectorAll("[data-num]")];
  let ticks = 0;
  // the numbers tumble for a moment before they settle
  const timer = setInterval(() => {
    const spin = shuffled(COUNT);
    badges.forEach((b, p) => { b.textContent = spin[p]; b.classList.add("spin"); });
    if (++ticks < 14) return;
    clearInterval(timer);
    state.numbers = final;
    save();
    drawing = false;
    render();
  }, 90);
};

/* ============ the die ============ */
let rolling = false;
function rollDie() {
  if (rolling) return;
  rolling = true;
  const final = 1 + Math.floor(Math.random() * 6);
  const die = $("die");
  die.className = "die tumbling";
  $("dice-result").textContent = "";
  $("dice-result").className = "dice-result";
  let ticks = 0;
  const timer = setInterval(() => {
    die.dataset.face = 1 + Math.floor(Math.random() * 6);
    if (++ticks < 11) return;
    clearInterval(timer);
    rolling = false;
    const outcome = final >= LOCK_ROLL ? "locked" : final >= ROLL_NEEDED ? "won" : "lost";
    die.dataset.face = final;
    die.className = `die ${outcome}`;
    $("dice-result").textContent = {locked: `${final}! Stolen and locked.`, won: `${final}! Stolen.`, lost: `${final}. Denied!`}[outcome];
    $("dice-result").className = `dice-result ${outcome}`;
  }, 85);
}
$("roll").onclick = rollDie;
// Space rolls the die on the Game page, unless a button or a text box has the keyboard.
document.addEventListener("keydown", (e) => {
  if (e.key !== " " || view !== "game" || e.target.closest("input, button, a")) return;
  e.preventDefault();
  rollDie();
});

/* ============ go ============ */
show(location.hash.slice(1) || (state.numbers ? "game" : "rules"));
