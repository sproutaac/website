// ── Nav scroll effect ─────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Smooth scroll ─────────────────────────────────────────────
const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

function smoothScrollTo(target, duration) {
  duration = duration || 1600;
  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + window.scrollY;
  const distance = end - start;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    const id = link.getAttribute('href').slice(1);
    if (!id) { e.preventDefault(); return; }
    const target = document.getElementById(id);
    if (!target) { e.preventDefault(); return; }
    e.preventDefault();
    smoothScrollTo(target);
  });
});

// ── Voice selection ───────────────────────────────────────────
// Prefer voices that run on the device: network voices (e.g. Chrome's
// "Google US English") can end with an audible pop/thump when the audio
// stream closes, and they need a connection.
let preferredVoice = null;
const voicePreference = [
  'Samantha',
  'Microsoft Aria Online Natural - English (United States)',
  'Microsoft Jenny Online Natural - English (United States)',
  'Microsoft Zira Desktop - English (United States)',
  'Karen',
  'Moira',
  'Google US English',
];
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const english = voices.filter(v => v.lang && v.lang.startsWith('en'));
  for (const local of [true, false]) {
    for (const name of voicePreference) {
      const v = english.find(v => v.name === name && v.localService === local);
      if (v) { preferredVoice = v; return; }
    }
  }
  preferredVoice = english.find(v => v.localService && v.lang === 'en-US') ||
                   english.find(v => v.localService) ||
                   english.find(v => v.lang === 'en-US') || english[0] || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

// Keep the audio output open while the demo is in use. When speech ends,
// some browsers close the output device, and many speakers/headsets "thump"
// as they power down. A silent tone keeps the device open between taps;
// it's released after 15 s idle so it doesn't drain the battery.
let audioCtx = null;
let idleTimer = null;
function keepAudioAwake() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => audioCtx && audioCtx.suspend(), 15000);
  } catch (e) { /* no Web Audio: speech still works */ }
}

// ── Tablet demo interaction ───────────────────────────────────
let outputWords = [];
function demoSpeak(word) {
  outputWords.push(word);
  if (outputWords.length > 5) outputWords.shift();
  const out = document.getElementById('output-text');
  out.textContent = outputWords.join(' ');

  if ('speechSynthesis' in window) {
    keepAudioAwake();
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.rate = 0.9;
    if (preferredVoice) utt.voice = preferredVoice;
    speechSynthesis.speak(utt);
  }
}
document.querySelectorAll('.tablet-cell').forEach(btn =>
  btn.addEventListener('click', () => demoSpeak(btn.dataset.word)));

// ── FAQ accordion ─────────────────────────────────────────────
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
  });
  // Open clicked (unless it was already open)
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// ── Signup forms ──────────────────────────────────────────────
async function handleSignup(e, formId) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Joining…';

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, betaTester: form.querySelector('input[type="checkbox"]')?.checked || false }),
    });
    if (!res.ok) throw new Error();

    form.style.display = 'none';
    const successEl = document.getElementById(formId + '-success');
    successEl.style.display = 'flex';
    successEl.classList.add('show');
  } catch {
    btn.disabled = false;
    btn.textContent = originalText;
    const input = form.querySelector('input[type="email"]');
    input.style.borderColor = '#e05555';
    input.placeholder = 'Something went wrong — try again';
    setTimeout(() => {
      input.style.borderColor = '';
      input.placeholder = 'your@email.com';
    }, 3000);
  }
}

// ── Signup count ──────────────────────────────────────────────
fetch('/api/count')
  .then(r => r.json())
  .then(d => {
    if (d.count >= 10) {
      document.getElementById('hero-count-num').textContent = d.count.toLocaleString();
      document.getElementById('hero-count').style.display = 'block';
    }
  })
  .catch(() => {});

// ── Back to top ───────────────────────────────────────────────
function smoothScrollToTop() {
  const start = window.scrollY;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / 1600, 1);
    window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', function() {
  btt.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
btt.addEventListener('click', function() {
  if (navigator.vibrate) navigator.vibrate(40);
  smoothScrollToTop();
});

// ── Event wiring (no inline handlers, so the CSP can block inline script) ──
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => toggleFaq(btn));
});
document.getElementById('hero-form').addEventListener('submit', (e) => handleSignup(e, 'hero'));
document.getElementById('final-form').addEventListener('submit', (e) => handleSignup(e, 'final'));
