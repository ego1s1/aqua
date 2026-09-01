(function (global) {
  "use strict";

  const params = new URLSearchParams(location.search);
  if (params.get("boot") === "0") return;
  const DURATION = params.get("boot") === "slow" ? 6000 : 700;

  const chimeOn = params.get("sound") !== "0" && params.get("chime") !== "0";

  const boot = document.createElement("div");
  boot.className = "boot aqua";
  boot.innerHTML =
    '<div class="boot-panel">' +
      '<div class="boot-apple" aria-hidden="true"></div>' +
      '<div class="boot-word">Mac OS X</div>' +
      '<aqua-progress class="boot-bar" value="0" max="100"></aqua-progress>' +
    '</div>';
  document.body.appendChild(boot);
  document.documentElement.classList.add("booting");

  // authentic iMac G3 boot chime — wav (with Web Audio fallback)
  var chimeAudio = null;
  function playChime() {
    if (!chimeOn) return;
    try {
      if (!chimeAudio) {
        chimeAudio = new Audio("assets/startup.wav");
        chimeAudio.volume = 0.85;
        chimeAudio.preload = "auto";
      }
      var p = chimeAudio.play();
      if (p && p.catch) p.catch(function(){ fallbackChime(); });
    } catch (e) { fallbackChime(); }
  }
  function fallbackChime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      if (ctx.state === "suspended") ctx.resume().catch(function(){});
      var now = ctx.currentTime;
      var freqs = [174.61, 220.0, 261.63, 349.23];
      freqs.forEach(function(f) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var filt = ctx.createBiquadFilter();
        osc.type = "triangle";
        osc.frequency.value = f;
        filt.type = "lowpass";
        filt.frequency.value = 4200;
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
        osc.connect(filt).connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.4);
      });
      setTimeout(function(){ try{ ctx.close(); }catch(e2){} }, 1800);
    } catch (e2) {}
  }
  var chimed = false;
  function tryChime() {
    if (chimed || !chimeOn) return;
    chimed = true;
    playChime();
  }
  // attempt immediately (may be blocked), then on first user gesture
  setTimeout(tryChime, 80);
  window.addEventListener("click", tryChime, { once: true });
  window.addEventListener("keydown", tryChime, { once: true });
  boot.addEventListener("click", tryChime, { once: true });

  const bar = boot.querySelector(".boot-bar");
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    boot.classList.add("out");
    document.documentElement.classList.remove("booting");
    boot.addEventListener("transitionend", () => boot.remove(), { once: true });
    setTimeout(() => boot.remove(), 1200);           // in case the tab is hidden
  }

  const ease = (t) => t * t * (3 - 2 * t);
  const t0 = performance.now();
  (function frame() {
    if (done) return;
    const p = Math.min(1, (performance.now() - t0) / DURATION);
    bar.setAttribute("value", (100 * ease(p)).toFixed(1));
    if (p >= 1) { setTimeout(finish, 180); return; }
    requestAnimationFrame(frame);
  })();
  setTimeout(finish, DURATION + 1500);

  global.replayBoot = () => location.reload();

  addEventListener("keydown", finish, { once: true });
  boot.addEventListener("click", finish);
})(window);
