(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowPower = reduceMotion || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  var canvas = document.getElementById("confetti-canvas");
  var ctx = canvas.getContext("2d");
  var confetti = [];
  var confettiTimer = null;

  var stageOne = document.getElementById("stage-one");
  var stageTwo = document.getElementById("stage-two");
  var stageThree = document.getElementById("stage-three");
  var giftBox = document.getElementById("gift-box");
  var guessGrid = document.getElementById("guess-grid");
  var guessReply = document.getElementById("guess-reply");
  var mysteryCard = document.getElementById("mystery-card");
  var extraSurprise = document.getElementById("extra-surprise");
  var wishResult = document.getElementById("wish-result");
  var cake = document.getElementById("cake");
  var partyBanner = document.getElementById("party-banner");
  var partyFlash = document.getElementById("party-flash");
  var photoFrame = document.getElementById("photo-frame");
  var heroPhoto = document.getElementById("hero-photo");
  var photoFallback = document.getElementById("photo-fallback");
  var musicToggle = document.getElementById("music-toggle");
  var musicLabel = musicToggle.querySelector(".music-label");

  var audioCtx = null;
  var musicOn = false;
  var musicNodes = [];
  var musicInterval = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function createSparkles() {
    var field = document.getElementById("sparkle-field");
    var count = lowPower ? 12 : 22;
    var html = "";
    for (var i = 0; i < count; i += 1) {
      html +=
        '<span class="star" style="left:' +
        Math.random() * 100 +
        "%;top:" +
        Math.random() * 100 +
        "%;animation-delay:" +
        Math.random() * 3 +
        "s;width:" +
        (3 + Math.random() * 5) +
        "px;height:" +
        (3 + Math.random() * 5) +
        'px"></span>';
    }
    field.innerHTML = html;
  }

  function createBalloons(target, extra) {
    var colors = ["#f472b6", "#818cf8", "#fbbf24", "#fb7185", "#67e8f9", "#c4b5fd"];
    var count = (lowPower ? 6 : 10) + (extra || 0);
    var html = "";
    for (var i = 0; i < count; i += 1) {
      var size = 18 + Math.random() * 22;
      html +=
        '<span class="balloon" style="left:' +
        Math.random() * 100 +
        "%;background:" +
        colors[i % colors.length] +
        ";width:" +
        size +
        "px;height:" +
        (size * 1.3) +
        "px;animation-duration:" +
        (10 + Math.random() * 12) +
        "s;animation-delay:" +
        Math.random() * 8 +
        's"></span>';
    }
    target.innerHTML = html;
  }

  createSparkles();
  createBalloons(document.getElementById("balloon-field"), 0);

  function ensureAudio() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playChime() {
    var ctxAudio = ensureAudio();
    if (!ctxAudio) return;
    var now = ctxAudio.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach(function (freq, index) {
      var osc = ctxAudio.createOscillator();
      var gain = ctxAudio.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + index * 0.08);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now + index * 0.05);
      osc.stop(now + 0.7 + index * 0.08);
    });
  }

  function startMusic() {
    var ctxAudio = ensureAudio();
    if (!ctxAudio) return false;
    stopMusic();
    var notes = [392, 493.88, 587.33, 659.25, 783.99];
    function playNote() {
      if (!musicOn || !audioCtx) return;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
      musicNodes = [osc, gain];
    }
    playNote();
    musicInterval = window.setInterval(playNote, 520);
    return true;
  }

  function stopMusic() {
    if (musicInterval) {
      window.clearInterval(musicInterval);
      musicInterval = null;
    }
    musicNodes.forEach(function (node) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (err) {}
    });
    musicNodes = [];
  }

  musicToggle.addEventListener("click", function () {
    musicOn = !musicOn;
    musicToggle.setAttribute("aria-pressed", String(musicOn));
    musicLabel.textContent = musicOn ? "Music On" : "Music Off";
    if (musicOn) {
      var ok = startMusic();
      if (!ok) {
        musicOn = false;
        musicToggle.setAttribute("aria-pressed", "false");
        musicLabel.textContent = "Music Off";
      }
    } else {
      stopMusic();
    }
  });

  function burstConfetti(amount, originX, originY) {
    if (reduceMotion) return;
    var colors = ["#f472b6", "#fbbf24", "#818cf8", "#34d399", "#fb7185", "#fde68a", "#67e8f9"];
    var count = Math.min(amount || 80, lowPower ? 70 : 160);
    var x = originX == null ? canvas.width / 2 : originX;
    var y = originY == null ? canvas.height / 3 : originY;
    for (var i = 0; i < count; i += 1) {
      confetti.push({
        x: x,
        y: y,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 11,
        vy: Math.random() * -11 - 3,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        color: colors[i % colors.length],
        life: 90 + Math.random() * 40
      });
    }
    if (!confettiTimer) {
      confettiTimer = window.requestAnimationFrame(tickConfetti);
    }
  }

  function tickConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti = confetti.filter(function (p) {
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.life / 120, 0);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      return p.life > 0 && p.y < canvas.height + 30;
    });
    if (confetti.length) {
      confettiTimer = window.requestAnimationFrame(tickConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiTimer = null;
    }
  }

  function showStage(next, current) {
    current.classList.remove("is-active");
    current.hidden = true;
    next.hidden = false;
    next.classList.add("is-active");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (next === stageTwo) {
      window.setTimeout(function () {
        if (stageTwo.classList.contains("is-active") && mysteryCard.hidden) {
          showMysteryPath();
        }
      }, 8000);
    }
  }

  document.getElementById("unlock-btn").addEventListener("click", function () {
    playChime();
    giftBox.classList.add("is-open");
    burstConfetti(90, canvas.width / 2, canvas.height / 2.4);
    window.setTimeout(function () {
      showStage(stageTwo, stageOne);
    }, reduceMotion ? 0 : 850);
  });

  function showMysteryPath() {
    guessReply.hidden = false;
    mysteryCard.hidden = false;
    var hint = document.getElementById("continue-hint");
    if (hint) hint.hidden = true;
  }

  guessGrid.addEventListener("click", function (event) {
    var card = event.target.closest(".guess-card");
    if (!card) return;
    var cards = guessGrid.querySelectorAll(".guess-card");
    for (var i = 0; i < cards.length; i += 1) {
      cards[i].classList.remove("is-picked");
    }
    card.classList.add("is-picked");
    showMysteryPath();
    burstConfetti(40, canvas.width / 2, canvas.height / 2);
  });

  document.getElementById("reveal-btn").addEventListener("click", function () {
    playChime();
    mysteryCard.classList.add("is-flipping");
    burstConfetti(140, canvas.width / 2, canvas.height / 2.6);
    window.setTimeout(function () {
      document.body.classList.add("is-revealed");
      createBalloons(document.getElementById("balloon-field"), lowPower ? 4 : 8);
      showStage(stageThree, stageTwo);
    }, reduceMotion ? 0 : 720);
  });

  heroPhoto.addEventListener("error", function () {
    photoFallback.hidden = false;
    photoFrame.classList.add("has-fallback");
  });

  document.getElementById("extra-btn").addEventListener("click", function () {
    extraSurprise.hidden = false;
    extraSurprise.classList.add("is-open");
    extraSurprise.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  document.getElementById("wish-btn").addEventListener("click", function () {
    cake.classList.add("is-out");
    wishResult.hidden = false;
    burstConfetti(70, canvas.width / 2, canvas.height * 0.55);
    playChime();
  });

  document.getElementById("party-btn").addEventListener("click", function () {
    playChime();
    partyBanner.hidden = false;
    partyFlash.classList.add("is-on");
    burstConfetti(180, canvas.width / 2, canvas.height / 2);
    window.setTimeout(function () {
      burstConfetti(90, canvas.width * 0.2, canvas.height / 2);
      burstConfetti(90, canvas.width * 0.8, canvas.height / 2);
    }, 220);
    createBalloons(document.getElementById("balloon-field"), lowPower ? 8 : 14);
    window.setTimeout(function () {
      partyFlash.classList.remove("is-on");
    }, 1200);
  });
})();
