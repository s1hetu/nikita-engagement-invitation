/* ═══════════════════════════════════════════════════════════
   Engagement invitation · all behaviour lives here.
   Edit CONFIG to personalise — no other file needs changing.
   ═══════════════════════════════════════════════════════════ */

document.documentElement.classList.add("js");

const CONFIG = {
  groom: "Krunal",
  bride: "Nikita",
  dateText: "12 December 2026",
  // 11:00 AM India time, so guests abroad see the right countdown too.
  countdownTarget: "2026-12-12T11:00:00+05:30",

  memories: [
    { src: "images/krunal-childhood.jpeg", caption: "two hearts, one story" },
    { src: "images/nikki-childhood-new.jpeg", caption: "side by side, always" },
    { src: "images/child-wedding.jpeg", caption: "and forever begins", wide: true },
  ],

  events: [
    {
      name: "Engagement",
      date: "12 December 2026",
      time: "11:00 AM onwards",
      venue: "Malad De Grande",
      address: "Mgl Building, Malad Gymkhana Limited, Marve Rd, Malad, Adarsh Nagar, Malad West, Mumbai, Maharashtra 400064",
      maps: "https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRiPAtIBCDEzNTlqMGo3qAIAsAIA&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KR3t5pVMt-c7MRgDukeYWVwZ&daddr=Mgl+Building,+Malad+Gymkhana+Limited,+Marve+Rd,+Malad,+Adarsh+Nagar,+Malad+West,+Mumbai,+Maharashtra+400064",
    },
  ],

  // Guests who accept fill this Google Form (email, name, phone, diet, members).
  rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLSe9R6Vp9Ro1V7hcaywh-1m8p8Q40YJWyPSiGpQx1fkGeMxxbQ/viewform",

  // Guests who decline just type their name (and optional email); it is sent to this Apps Script
  // web-app URL and lands in the same sheet. See google-apps-script/rsvp.gs.
  rsvpSheetUrl: "https://script.google.com/macros/s/AKfycbwC-A1LXAAozrKTXOaF22TE45sbRXk3W5P1bZvEux1NmFPM4lTbYmBrulIL9kXSYrRQTQ/exec",

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

// Browsers block sound until the visitor interacts with the page, so try
// right away (works where autoplay is allowed) and otherwise start on the
// very first touch, click or key press anywhere — even before the envelope.
function autoStartMusic() {
  if (!music) return;
  const events = ["pointerdown", "touchstart", "keydown"];
  const unlock = e => {
    if (musicToggle?.contains(e.target)) return; // the toggle handles itself
    events.forEach(t => removeEventListener(t, unlock, true));
    if (music.paused) playMusic();
  };
  music.play().then(() => setMusicState(true)).catch(() =>
    events.forEach(t => addEventListener(t, unlock, { capture: true, passive: true })));
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
    set(cells.d, pad(Math.floor(diff / 864e5)));
    set(cells.h, pad(Math.floor(diff / 36e5) % 24));
    set(cells.m, pad(Math.floor(diff / 6e4) % 60));
    set(cells.s, pad(Math.floor(diff / 1e3) % 60));
  }

  // swap the value and replay the drop-in, only when it actually changes
  function set(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  tick();
}

/* ——— gold dust drifting up through the hero ——— */

function heroDust() {
  const host = $(".hero-dust");
  if (!host) return;
  const rnd = (a, b) => a + Math.random() * (b - a);
  host.innerHTML = Array.from({ length: 18 }, () =>
    `<i style="left:${rnd(4, 96).toFixed(1)}%;--s:${rnd(1.5, 3.6).toFixed(1)}px;` +
    `--t:${rnd(11, 20).toFixed(1)}s;--delay:${rnd(-20, 0).toFixed(1)}s;` +
    `--drift:${rnd(-40, 40).toFixed(0)}px;--o:${rnd(.35, .85).toFixed(2)}"></i>`).join("");
}

/* ——— reading progress thread ——— */

function scrollProgress() {
  const bar = $(".scroll-progress");
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);
  update();
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
    const w = rect.width, h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // gold foil with a metallic band of light through the middle
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#9C7638");
    g.addColorStop(.3, "#D9B56A");
    g.addColorStop(.5, "#F3DDA4");
    g.addColorStop(.7, "#C99E52");
    g.addColorStop(1, "#86642F");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // fine metallic grain
    for (let i = 0; i < w * h / 18; i++) {
      ctx.fillStyle = Math.random() < .5 ? "rgba(255,248,225,.16)" : "rgba(70,48,16,.12)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    // brushed striations
    ctx.save();
    ctx.globalAlpha = .08;
    ctx.strokeStyle = "#FFF6E6";
    ctx.lineWidth = 1;
    for (let x = -h; x < w; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.restore();

    // stamped inner border
    ctx.strokeStyle = "rgba(255, 244, 214, .55)";
    ctx.setLineDash([3, 4]);
    ctx.strokeRect(10.5, 10.5, w - 21, h - 21);
    ctx.setLineDash([]);

    // embossed label
    const cx = w / 2, cy = h / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const emboss = (text, font, y) => {
      ctx.font = font;
      ctx.fillStyle = "rgba(90, 62, 22, .45)";
      ctx.fillText(text, cx + 1, y + 1);
      ctx.fillStyle = "rgba(255, 249, 232, .95)";
      ctx.fillText(text, cx, y);
    };
    emboss("✦", "16px serif", cy - 30);
    emboss("S C R A T C H   H E R E", "700 13px 'Manrope', sans-serif", cy);
    emboss("with your finger", "italic 500 15px 'Cormorant Garamond', serif", cy + 26);
  }

  function sizeAndPaint() {
    const rect = canvas.getBoundingClientRect();
    if (Math.abs(rect.width - prevW) < 2 && Math.abs(rect.height - prevH) < 2) return;
    prevW = rect.width;
    prevH = rect.height;
    if (!cleared) paintCover();
  }

  // a coin-like brush: solid core with a ragged, flaky edge,
  // stamped along the path so fast swipes leave no gaps
  const BRUSH = 22;
  function stamp(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = BRUSH - 2 + Math.random() * 7;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1 + Math.random() * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let lastBuzz = 0;
  function scratch(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    const from = last || { x, y };
    const dist = Math.hypot(x - from.x, y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 5));
    for (let i = 1; i <= steps; i++) {
      stamp(from.x + (x - from.x) * i / steps, from.y + (y - from.y) * i / steps);
    }
    last = { x, y };
    spawnGlitter(x, y);
    const now = performance.now();
    if (navigator.vibrate && now - lastBuzz > 90) { lastBuzz = now; navigator.vibrate(4); }
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
    if (clear / total > 0.45) reveal();
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
    frame.classList.add("scratching");
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
    if (now - lastCheck > 120) {
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
  const link = $("#rsvpLink"), form = $("#declineForm");
  if (!next || !msg || !link || !form) return;

  const messages = {
    yes: "Wonderful! We can't wait to celebrate with you — please confirm your details below.",
    no: "You'll be dearly missed. Kindly leave your name so we know you won't be joining us.",
  };

  $$(".choice").forEach(btn => btn.addEventListener("click", () => {
    if (form.classList.contains("sent")) return;
    const yes = btn.dataset.reply === "yes";
    $$(".choice").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    msg.textContent = messages[btn.dataset.reply] || "";
    link.hidden = !yes;
    form.hidden = yes;
    next.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("show")));
    if (!yes) $("#declineName").focus({ preventScroll: true });
  }));

  // declines go straight to the sheet; the response is opaque (no-cors),
  // so a resolved request is treated as delivered
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    if (!form.reportValidity() || !name) { form.elements.name.focus(); return; }
    if (!CONFIG.rsvpSheetUrl) {
      msg.textContent = "RSVP isn't connected yet — please message the family directly.";
      return;
    }
    const button = form.querySelector("button");
    button.disabled = true;
    fetch(CONFIG.rsvpSheetUrl, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({ name, email, status: "Declined" }),
    }).then(() => {
      form.classList.add("sent");
      form.hidden = true;
      $$(".choice").forEach(b => (b.disabled = true));
      msg.textContent = `Thank you, ${name}. You'll be dearly missed — we'll keep you in our hearts on the day.`;
    }).catch(() => {
      button.disabled = false;
      msg.textContent = "Couldn't send just now — please check your connection and try again.";
    });
  });
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
heroDust();
scrollProgress();
scratchCard();
initEnvelope();
autoStartMusic();
