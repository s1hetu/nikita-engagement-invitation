/* ═══════════════════════════════════════════════════════════
   Engagement invitation · all behaviour lives here.
   Edit CONFIG to personalise — no other file needs changing.
   ═══════════════════════════════════════════════════════════ */

document.documentElement.classList.add("js");

const CONFIG = {
  groom: "Krunal",
  bride: "Nikita",
  dateText: "15 December 2026",
  countdownTarget: "2026-12-15T19:00:00",

  memories: [
    { src: "images/eng.jpeg", caption: "two hearts, one story" },
    { src: "images/eng.jpeg", caption: "side by side, always" },
    { src: "images/eng.jpeg", caption: "and forever begins", wide: true },
  ],

  events: [
    {
      name: "Engagement",
      date: "15 December 2026",
      time: "7:00 PM onwards",
      venue: "Your Beautiful Venue",
      address: "Your venue address, Your City, India",
      maps: "https://maps.google.com/",
    },
  ],

  // Your Google Form (or any RSVP link).
  rsvpUrl: "https://forms.google.com/",

  // Optional photo behind the countdown, e.g. "images/countdown.jpg".
  // Left empty, the countdown sits on an elegant dark band.
  countdownBg: "",
};

/* ——— helpers ——— */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ——— populate the page from CONFIG ——— */

function populate() {
  $$("[data-groom]").forEach(el => (el.textContent = CONFIG.groom));
  $$("[data-bride]").forEach(el => (el.textContent = CONFIG.bride));
  $$("[data-date]").forEach(el => (el.textContent = CONFIG.dateText));

  $("#memories").innerHTML = CONFIG.memories.map((m, i) => {
    const tilt = (i % 2 ? 1 : -1) * (m.wide ? 0.9 : 1.5 + (i % 3) * 0.7);
    return `
      <figure class="polaroid reveal${m.wide ? " wide" : ""}" style="--r:${tilt}deg">
        <img src="${m.src}" alt="${m.caption || `Memory ${i + 1}`}" loading="lazy" decoding="async">
        ${m.caption ? `<figcaption>${m.caption}</figcaption>` : ""}
      </figure>`;
  }).join("");

  $("#eventList").innerHTML = CONFIG.events.map(e => `
    <article class="event-card reveal">
      <h3 class="ev-name">${e.name}</h3>
      <p class="ev-date">${e.date}</p>
      <p class="ev-time">${e.time}</p>
      <div class="ev-venue">
        <span class="eyebrow">venue</span>
        <strong>${e.venue}</strong>
        <p>${e.address}</p>
        <a class="ev-map" href="${e.maps}" target="_blank" rel="noopener">View location</a>
      </div>
    </article>`).join("");

  $("#rsvpLink").href = CONFIG.rsvpUrl;

  if (CONFIG.countdownBg) {
    $(".countdown").style.background =
      `linear-gradient(rgba(42,33,26,.86), rgba(42,33,26,.9)), url("${CONFIG.countdownBg}") center/cover no-repeat`;
  }
}

/* ——— scroll reveals, armed once the envelope opens ——— */

function makeReveals() {
  const els = $$(".reveal");

  // stagger children of any [data-stagger] group
  $$("[data-stagger]").forEach(group =>
    [...group.children].forEach((child, i) => child.style.setProperty("--d", `${i * 0.12}s`)));

  let started = false;
  return {
    start() {
      if (started) return;
      started = true;
      if (!("IntersectionObserver" in window)) {
        els.forEach(el => el.classList.add("in"));
        return;
      }
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      els.forEach(el => io.observe(el));
    },
  };
}

/* ——— music ——— */

const music = $("#music");
const musicToggle = $("#musicToggle");

function playMusic() {
  if (!music) return;
  music.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}

function setMusicState(playing) {
  musicToggle?.classList.toggle("playing", playing);
  musicToggle?.setAttribute("aria-pressed", String(playing));
  musicToggle?.setAttribute("aria-label", playing ? "Pause music" : "Play music");
}

musicToggle?.addEventListener("click", () => {
  if (!music) return;
  if (music.paused) playMusic();
  else { music.pause(); setMusicState(false); }
});

/* ——— countdown ——— */

function countdown() {
  const timer = $("#timer"), done = $("#timerDone");
  if (!timer || !done) return;

  const target = new Date(CONFIG.countdownTarget).getTime();
  const cells = { d: $("#tDays"), h: $("#tHours"), m: $("#tMins"), s: $("#tSecs") };
  const pad = n => String(n).padStart(2, "0");

  const iv = setInterval(tick, 1000);

  function tick() {
    let diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(iv);
      timer.hidden = true;
      done.hidden = false;
      return;
    }
    cells.d.textContent = pad(Math.floor(diff / 864e5));
    cells.h.textContent = pad(Math.floor(diff / 36e5) % 24);
    cells.m.textContent = pad(Math.floor(diff / 6e4) % 60);
    cells.s.textContent = pad(Math.floor(diff / 1e3) % 60);
  }

  tick();
}

/* ——— scratch card ——— */

function scratchCard() {
  const canvas = $("#scratchCanvas");
  const frame = canvas?.closest(".scratch-frame");
  const skip = $("#scratchSkip");
  if (!canvas || !frame) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let cleared = false, drawing = false, last = null, lastCheck = 0, resizeTimer;
  let prevW = 0, prevH = 0, liveGlitter = 0;

  const GLITTER = ["#E9C980", "#D8AC55", "#FFF3D6", "#C6A05E", "#F7E6BC"];

  // golden dust dropped as the coin moves
  function spawnGlitter(x, y) {
    if (liveGlitter > 90) return;
    liveGlitter++;
    const s = document.createElement("i");
    s.className = "glit";
    const sz = 4 + Math.random() * 5;
    s.style.cssText =
      `left:${x + Math.random() * 16 - 8}px;top:${y + Math.random() * 16 - 8}px;` +
      `width:${sz}px;height:${sz}px;` +
      `background:${GLITTER[(Math.random() * GLITTER.length) | 0]};` +
      `--dx:${Math.random() * 56 - 28}px;--dy:${26 + Math.random() * 60}px;` +
      `--rot:${Math.random() * 300 - 150}deg`;
    s.addEventListener("animationend", () => { liveGlitter--; s.remove(); });
    frame.appendChild(s);
  }

  // joyous confetti burst once the prize shows
  function celebrate() {
    const colors = [...GLITTER, "#E8A0A0", "#F6D8E0"];
    for (let i = 0; i < 42; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.cssText =
        `left:${5 + Math.random() * 90}%;top:${8 + Math.random() * 22}%;` +
        `width:${3 + Math.random() * 3}px;height:${7 + Math.random() * 6}px;` +
        `background:${colors[i % colors.length]};` +
        `--dx:${Math.random() * 180 - 90}px;--dy:${-(90 + Math.random() * 160)}px;` +
        `--fall:${180 + Math.random() * 160}px;` +
        `animation-delay:${(Math.random() * .4).toFixed(2)}s;` +
        `animation-duration:${(1.3 + Math.random() * .8).toFixed(2)}s`;
      c.addEventListener("animationend", () => c.remove());
      frame.appendChild(c);
    }
  }

  function paintCover() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // gold foil
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#C6A05E");
    g.addColorStop(.5, "#A5814A");
    g.addColorStop(1, "#7E5F33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // brushed striations
    ctx.save();
    ctx.globalAlpha = .13;
    ctx.strokeStyle = "#FFF6E6";
    ctx.lineWidth = 1;
    for (let x = -rect.height; x < rect.width; x += 9) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + rect.height, rect.height);
      ctx.stroke();
    }
    ctx.restore();

    // label
    ctx.fillStyle = "rgba(255, 246, 230, .88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 12px 'Manrope', sans-serif";
    ctx.fillText("S C R A T C H   H E R E", rect.width / 2, rect.height / 2);
    ctx.font = "13px serif";
    ctx.fillText("✦", rect.width / 2, rect.height / 2 - 36);
    ctx.fillText("✦", rect.width / 2, rect.height / 2 + 36);
  }

  function sizeAndPaint() {
    const rect = canvas.getBoundingClientRect();
    if (Math.abs(rect.width - prevW) < 2 && Math.abs(rect.height - prevH) < 2) return;
    prevW = rect.width;
    prevH = rect.height;
    if (!cleared) paintCover();
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    if (last) {
      ctx.lineWidth = 52;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    last = { x, y };
    spawnGlitter(x, y);
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function checkCleared() {
    if (!canvas.width || !canvas.height) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] < 130) clear++;
    }
    if (clear / total > 0.55) reveal();
  }

  function reveal() {
    if (cleared) return;
    cleared = true;
    canvas.classList.add("cleared");
    frame.classList.add("revealed");
    skip?.setAttribute("hidden", "");
    celebrate();
    if (navigator.vibrate) navigator.vibrate([20, 50, 30]);
  }

  canvas.addEventListener("pointerdown", e => {
    if (cleared) return;
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const p = pos(e);
    last = null;
    scratch(p.x, p.y);
  });

  canvas.addEventListener("pointermove", e => {
    if (!drawing || cleared) return;
    e.preventDefault();
    const p = pos(e);
    scratch(p.x, p.y);
    const now = performance.now();
    if (now - lastCheck > 150) {
      lastCheck = now;
      checkCleared();
    }
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(type =>
    canvas.addEventListener(type, () => { drawing = false; last = null; }));

  canvas.addEventListener("contextmenu", e => e.preventDefault());

  skip?.addEventListener("click", reveal);

  sizeAndPaint();
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeAndPaint, 180);
  });

  // repaint once fonts arrive so the label uses the right face
  if (document.fonts?.load) {
    document.fonts.load("600 12px Manrope").then(() => { if (!cleared) paintCover(); }).catch(() => {});
  } else if (document.fonts?.ready) {
    document.fonts.ready.then(() => { if (!cleared) paintCover(); });
  }
}

/* ——— rsvp ——— */

function rsvp() {
  const next = $("#rsvpNext"), msg = $("#rsvpMsg");
  if (!next || !msg) return;

  const messages = {
    yes: "Wonderful! We can't wait to celebrate with you — please confirm your details below.",
    no: "You'll be dearly missed. Kindly let us know via the form so we can plan accordingly.",
  };

  $$(".choice").forEach(btn => btn.addEventListener("click", () => {
    $$(".choice").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    msg.textContent = messages[btn.dataset.reply] || "";
    next.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("show")));
  }));
}

/* ——— sealed envelope → open the invitation ——— */

// A hard refresh re-downloads the document over the network (encodedBodySize > 0);
// a soft refresh serves it from cache, so the envelope plays only on first
// visit or hard refresh — normal refreshes land straight on the palace hero.
function isHardReload() {
  try {
    const [nav] = performance.getEntriesByType("navigation");
    return !!nav && nav.type === "reload" && nav.encodedBodySize > 0;
  } catch (e) { return false; }
}

function initEnvelope() {
  const envelope = $("#envelope");
  if (!envelope) { revealCtl.start(); return; }

  function open() {
    if (document.body.classList.contains("opened")) return;
    try { sessionStorage.setItem("invitation-opened", "1"); } catch (e) { /* private mode */ }
    playMusic();
    envelope.classList.add("opening");
    // seal cracks → the two halves slide apart, revealing the hero
    setTimeout(() => document.body.classList.add("opened"), 500);
    setTimeout(() => envelope.classList.add("gone"), 1550);
    setTimeout(() => revealCtl.start(), 1600);
    setTimeout(() => envelope.remove(), 2300);
  }

  let skipped = false;
  try { skipped = !!sessionStorage.getItem("invitation-opened"); } catch (e) { /* private mode */ }
  if (isHardReload()) skipped = false;

  if (skipped) {
    envelope.remove();
    document.body.classList.add("opened");
    revealCtl.start();
    return;
  }

  envelope.addEventListener("click", open);
  envelope.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
}

/* ——— go ——— */

populate();
const revealCtl = makeReveals();
rsvp();
countdown();
scratchCard();
initEnvelope();
