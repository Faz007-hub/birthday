/**
 * Sir Sufyan's Magical Birthday Surprise Website
 * Created with love by Karishma, Maaz, and Zaara
 * Pure Vanilla JavaScript: Interactive Stages, Canvas Confetti & Web Audio Synthesizer
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Color Palette & Audio Synthesizer Engine (Web Audio API)
  // ==========================================================================
  const PALETTE = [
    '#FF4F9A', // Candy Pink
    '#FF2E88', // Hot Pink
    '#35C9FF', // Sky Blue
    '#FFD93D', // Sunshine Yellow
    '#FF914D', // Tangerine Orange
    '#A855F7', // Birthday Purple
    '#54E6A5', // Mint Green
    '#FF5C5C', // Coral Red
    '#FFF9F0', // Soft Cream
    '#FFFFFF'  // Pure White
  ];

  let audioCtx = null;
  let isSoundFxEnabled = true;
  let isMelodyPlaying = false;
  let melodyTimeoutId = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesized Sound Effects
  const SoundEngine = {
    // Sparkle Chime (arpeggio of soft sine waves)
    playChime() {
      if (!isSoundFxEnabled) return;
      initAudio();
      if (!audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    },

    // Balloon Pop Sound (sub frequency drop + noise punch)
    playPop() {
      if (!isSoundFxEnabled) return;
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      // Pitch sweep pop
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // Noise burst for the rubber snap
      try {
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
      } catch (e) {
        // Fallback for browsers with strict buffer limits
      }
    },

    // Fanfare for Grand Reveal
    playFanfare() {
      if (!isSoundFxEnabled) return;
      initAudio();
      if (!audioCtx) return;

      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.18 }, // G5
        { f: 1046.50, d: 0.55 } // C6
      ];

      let delay = 0;
      const now = audioCtx.currentTime;

      notes.forEach((note) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + note.d);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + note.d + 0.05);
        delay += 0.14;
      });
    },

    // Candle Blow Sound (gentle filtered wind + bell release)
    playBlowCandle() {
      if (!isSoundFxEnabled) return;
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    },

    // Happy Birthday Music Box Synthesis
    playHappyBirthday() {
      initAudio();
      if (!audioCtx) return;

      isMelodyPlaying = true;
      updateMusicUI(true);

      // Notes of Happy Birthday (G4, A4, B4, C5, D5, E5, F5, G5)
      // Standard Happy Birthday:
      // G G A G C B | G G A G D C | G G G(high) E C B A | F F E C D C
      const melody = [
        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 440.00, dur: 0.6, rest: 0.1 }, // A4
        { note: 392.00, dur: 0.6, rest: 0.1 }, // G4
        { note: 523.25, dur: 0.6, rest: 0.1 }, // C5
        { note: 493.88, dur: 1.1, rest: 0.2 }, // B4

        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 440.00, dur: 0.6, rest: 0.1 }, // A4
        { note: 392.00, dur: 0.6, rest: 0.1 }, // G4
        { note: 587.33, dur: 0.6, rest: 0.1 }, // D5
        { note: 523.25, dur: 1.1, rest: 0.2 }, // C5

        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 392.00, dur: 0.3, rest: 0.1 }, // G4
        { note: 783.99, dur: 0.6, rest: 0.1 }, // G5 (High)
        { note: 659.25, dur: 0.6, rest: 0.1 }, // E5
        { note: 523.25, dur: 0.6, rest: 0.1 }, // C5
        { note: 493.88, dur: 0.6, rest: 0.1 }, // B4
        { note: 440.00, dur: 0.9, rest: 0.2 }, // A4

        { note: 698.46, dur: 0.3, rest: 0.1 }, // F5
        { note: 698.46, dur: 0.3, rest: 0.1 }, // F5
        { note: 659.25, dur: 0.6, rest: 0.1 }, // E5
        { note: 523.25, dur: 0.6, rest: 0.1 }, // C5
        { note: 587.33, dur: 0.6, rest: 0.1 }, // D5
        { note: 523.25, dur: 1.4, rest: 0.5 }  // C5
      ];

      let accumulatedTime = 0.1;

      melody.forEach((step) => {
        const timeout = setTimeout(() => {
          if (!isMelodyPlaying) return;
          SoundEngine.playTone(step.note, step.dur);
        }, accumulatedTime * 1000);

        accumulatedTime += step.dur + step.rest;
      });

      // Loop melody if still playing
      melodyTimeoutId = setTimeout(() => {
        if (isMelodyPlaying) {
          SoundEngine.playHappyBirthday();
        }
      }, accumulatedTime * 1000);
    },

    stopHappyBirthday() {
      isMelodyPlaying = false;
      if (melodyTimeoutId) {
        clearTimeout(melodyTimeoutId);
        melodyTimeoutId = null;
      }
      updateMusicUI(false);
    },

    playTone(frequency, duration) {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      // Gentle bell / music-box sound (sine + soft octave overtone)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequency * 2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.05);
      osc2.stop(now + duration + 0.05);
    }
  };

  function updateMusicUI(playing) {
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicText = document.getElementById('music-text');
    const musicIcon = document.getElementById('music-icon');

    if (!musicBtn) return;

    if (playing) {
      musicBtn.classList.add('playing');
      if (musicText) musicText.textContent = 'Pause Music';
      if (musicIcon) musicIcon.textContent = '⏸️';
    } else {
      musicBtn.classList.remove('playing');
      if (musicText) musicText.textContent = 'Play Melody';
      if (musicIcon) musicIcon.textContent = '🎵';
    }
  }

  // ==========================================================================
  // 2. High-Performance Confetti & Sparkles Canvas Engine
  // ==========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const sparkleCanvas = document.getElementById('sparkle-canvas');
  let confettiCtx = null;
  let sparkleCtx = null;

  let width = window.innerWidth;
  let height = window.innerHeight;

  let confettiParticles = [];
  let ambientSparkles = [];

  function initCanvases() {
    if (confettiCanvas) {
      confettiCtx = confettiCanvas.getContext('2d');
    }
    if (sparkleCanvas) {
      sparkleCtx = sparkleCanvas.getContext('2d');
    }
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    // Seed ambient sparkles
    for (let i = 0; i < 35; i++) {
      ambientSparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: (Math.random() - 0.5) * 0.4,
        speedX: (Math.random() - 0.5) * 0.4,
        pulse: Math.random() * Math.PI,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
      });
    }

    requestAnimationFrame(renderCanvasLoop);
  }

  function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    if (confettiCanvas && confettiCtx) {
      confettiCanvas.width = width * dpr;
      confettiCanvas.height = height * dpr;
      confettiCtx.scale(dpr, dpr);
    }

    if (sparkleCanvas && sparkleCtx) {
      sparkleCanvas.width = width * dpr;
      sparkleCanvas.height = height * dpr;
      sparkleCtx.scale(dpr, dpr);
    }
  }

  // Confetti Particle Class
  class ConfettiParticle {
    constructor(x, y, vx, vy, color) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.gravity = 0.25;
      this.drag = 0.96;
      this.color = color || PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.size = Math.random() * 8 + 6;
      this.tilt = Math.random() * 360;
      this.tiltSpeed = Math.random() * 12 + 6;
      this.alpha = 1;
      this.shape = Math.random() > 0.35 ? 'rect' : 'circle';
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.tilt += this.tiltSpeed;
      if (this.y > height * 0.6) {
        this.alpha -= 0.012;
      }
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.tilt * Math.PI) / 180);

      const tiltScale = Math.cos((this.tilt * Math.PI) / 180);
      ctx.scale(1, tiltScale);

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Fire celebratory burst of confetti
  function fireConfettiBurst(options = {}) {
    const originX = options.x !== undefined ? options.x : width / 2;
    const originY = options.y !== undefined ? options.y : height * 0.45;
    const count = options.count || 90;
    const speed = options.speed || 16;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = (Math.random() * 0.7 + 0.3) * speed;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 4; // slight upward lift
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      confettiParticles.push(new ConfettiParticle(originX, originY, vx, vy, color));
    }
  }

  // Fire multi-directional celebration cannon from bottom corners
  function fireCornerCannons() {
    // Left Cannon
    for (let i = 0; i < 60; i++) {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.6;
      const velocity = Math.random() * 18 + 12;
      confettiParticles.push(
        new ConfettiParticle(
          20,
          height - 20,
          Math.cos(angle) * velocity,
          Math.sin(angle) * velocity,
          PALETTE[Math.floor(Math.random() * PALETTE.length)]
        )
      );
    }
    // Right Cannon
    for (let i = 0; i < 60; i++) {
      const angle = (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.6;
      const velocity = Math.random() * 18 + 12;
      confettiParticles.push(
        new ConfettiParticle(
          width - 20,
          height - 20,
          Math.cos(angle) * velocity,
          Math.sin(angle) * velocity,
          PALETTE[Math.floor(Math.random() * PALETTE.length)]
        )
      );
    }
  }

  // Main Canvas Render Loop
  function renderCanvasLoop() {
    // 1. Render Sparkles
    if (sparkleCtx) {
      sparkleCtx.clearRect(0, 0, width, height);
      ambientSparkles.forEach((s) => {
        s.pulse += 0.035;
        s.x += s.speedX;
        s.y += s.speedY;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));
        sparkleCtx.save();
        sparkleCtx.globalAlpha = Math.max(0, currentAlpha);
        sparkleCtx.fillStyle = s.color;
        sparkleCtx.beginPath();
        sparkleCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        sparkleCtx.fill();
        sparkleCtx.restore();
      });
    }

    // 2. Render Confetti
    if (confettiCtx) {
      confettiCtx.clearRect(0, 0, width, height);
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw(confettiCtx);

        if (p.alpha <= 0 || p.y > height + 50) {
          confettiParticles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(renderCanvasLoop);
  }

  // ==========================================================================
  // 3. Navigation & Stage Management
  // ==========================================================================
  let currentStage = 1;
  const totalStages = 5;

  function goToStage(stageNumber) {
    if (stageNumber < 1 || stageNumber > totalStages) return;

    // Remove active class from all stages
    for (let i = 1; i <= totalStages; i++) {
      const stageEl = document.getElementById(`stage-${i}`);
      const navBtn = document.getElementById(`nav-step-${i}`);

      if (stageEl) {
        stageEl.classList.remove('active');
      }
      if (navBtn) {
        navBtn.classList.remove('active');
        if (i < stageNumber) {
          navBtn.classList.add('completed');
        }
      }
    }

    // Activate target stage
    const targetStageEl = document.getElementById(`stage-${stageNumber}`);
    const targetNavBtn = document.getElementById(`nav-step-${stageNumber}`);

    if (targetStageEl) {
      targetStageEl.classList.add('active');
    }
    if (targetNavBtn) {
      targetNavBtn.classList.add('active');
    }

    currentStage = stageNumber;

    // Scroll gently to top of stage
    window.scrollTo({
      top: targetStageEl ? targetStageEl.offsetTop - 80 : 0,
      behavior: 'smooth'
    });

    // Stage specific celebration actions
    if (stageNumber === 3) {
      // Grand Reveal ceremony!
      setTimeout(() => {
        SoundEngine.playFanfare();
        fireConfettiBurst({ count: 120, speed: 18 });
        fireCornerCannons();
        showToast('🎉 Long Live Sir Sufyan! Happy Birthday! 🎉');
        if (!isMelodyPlaying) {
          SoundEngine.playHappyBirthday();
        }
      }, 300);
    }
  }

  // Stepper navigation buttons
  document.querySelectorAll('.step-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      if (step) {
        SoundEngine.playChime();
        goToStage(step);
      }
    });
  });

  // ==========================================================================
  // 4. Stage 1: The Mystery Gift Box Unboxing
  // ==========================================================================
  const giftBoxTrigger = document.getElementById('gift-box-trigger');
  const mysteryGift = document.getElementById('mystery-gift');
  const startAdventureBtn = document.getElementById('start-adventure-btn');
  let isBoxOpened = false;

  function openGiftBox() {
    if (isBoxOpened) {
      goToStage(2);
      return;
    }

    isBoxOpened = true;
    mysteryGift.classList.add('opened');

    // Sounds & Confetti
    SoundEngine.playChime();
    const rect = mysteryGift.getBoundingClientRect();
    fireConfettiBurst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      count: 70,
      speed: 14
    });

    showToast('✨ Mystery Box Unwrapped! Proceeding to the appreciation challenge! ✨');

    setTimeout(() => {
      goToStage(2);
    }, 1100);
  }

  if (giftBoxTrigger) {
    giftBoxTrigger.addEventListener('click', openGiftBox);
    giftBoxTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGiftBox();
      }
    });
  }

  if (startAdventureBtn) {
    startAdventureBtn.addEventListener('click', openGiftBox);
  }

  // ==========================================================================
  // 5. Stage 2: The 3 Balloons Appreciation Challenge
  // ==========================================================================
  const poppedBalloons = new Set();
  const unlockRevealBtn = document.getElementById('unlock-reveal-btn');
  const progressFill = document.getElementById('balloon-progress-fill');
  const progressText = document.getElementById('balloon-progress-text');
  const progressPercent = document.getElementById('balloon-progress-percent');

  function popBalloon(id) {
    if (poppedBalloons.has(id)) return;

    poppedBalloons.add(id);
    const cardEl = document.getElementById(`balloon-card-${id}`);
    const balloonEl = document.getElementById(`balloon-${id}`);

    if (balloonEl) {
      balloonEl.classList.add('popping');
      SoundEngine.playPop();

      const rect = balloonEl.getBoundingClientRect();
      fireConfettiBurst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        count: 50,
        speed: 12
      });
    }

    setTimeout(() => {
      if (cardEl) {
        cardEl.classList.add('popped');
      }
      updateBalloonProgress();
    }, 280);
  }

  function updateBalloonProgress() {
    const count = poppedBalloons.size;
    const pct = Math.round((count / 3) * 100);

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${count} of 3 Balloons Popped`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;

    if (count === 3) {
      if (unlockRevealBtn) {
        unlockRevealBtn.classList.remove('disabled');
        unlockRevealBtn.removeAttribute('disabled');
        unlockRevealBtn.innerHTML = `
          <span>✨ Unlock The Grand Birthday Celebration! ✨</span>
          <span class="btn-arrow">➜</span>
        `;
      }
      SoundEngine.playChime();
      showToast('🎉 All 3 qualities unlocked! Ready for the Grand Reveal! 🎉');
    }
  }

  // Bind balloon click events
  [1, 2, 3].forEach((id) => {
    const el = document.getElementById(`balloon-${id}`);
    if (el) {
      el.addEventListener('click', () => popBalloon(id));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          popBalloon(id);
        }
      });
    }
  });

  if (unlockRevealBtn) {
    unlockRevealBtn.addEventListener('click', () => {
      if (poppedBalloons.size === 3) {
        goToStage(3);
      }
    });
  }

  // ==========================================================================
  // 6. Stage 3: The Grand Celebration & Interactive Cake
  // ==========================================================================
  const birthdayCake = document.getElementById('birthday-cake');
  const blowCandlesBtn = document.getElementById('blow-candles-btn');
  const relightCandlesBtn = document.getElementById('relight-candles-btn');
  const wishRevealBox = document.getElementById('wish-reveal-box');
  const burstConfettiStage3 = document.getElementById('burst-confetti-stage3');
  const goToStage4Btn = document.getElementById('go-to-stage-4-btn');
  let areCandlesBlown = false;

  function blowOutCandles() {
    if (areCandlesBlown) return;

    areCandlesBlown = true;
    SoundEngine.playBlowCandle();

    // Extinguish all flames
    [1, 2, 3].forEach((id) => {
      const flame = document.getElementById(`flame-${id}`);
      if (flame) flame.classList.add('blown-out');
    });

    if (blowCandlesBtn) blowCandlesBtn.classList.add('hidden');
    if (relightCandlesBtn) relightCandlesBtn.classList.remove('hidden');

    // Reveal heartfelt wish
    if (wishRevealBox) {
      wishRevealBox.classList.add('revealed');
    }

    // Confetti celebration
    fireConfettiBurst({ count: 90, speed: 15 });
    SoundEngine.playChime();
    showToast('🎂💨 Candles Blown! May all your prayers come true, Sir Sufyan!');
  }

  function relightCandles() {
    areCandlesBlown = false;
    SoundEngine.playChime();

    [1, 2, 3].forEach((id) => {
      const flame = document.getElementById(`flame-${id}`);
      if (flame) flame.classList.remove('blown-out');
    });

    if (blowCandlesBtn) blowCandlesBtn.classList.remove('hidden');
    if (relightCandlesBtn) relightCandlesBtn.classList.add('hidden');

    showToast('🔥 Candles relit! Ready for another wish!');
  }

  if (blowCandlesBtn) blowCandlesBtn.addEventListener('click', blowOutCandles);
  if (birthdayCake) birthdayCake.addEventListener('click', blowOutCandles);
  if (relightCandlesBtn) relightCandlesBtn.addEventListener('click', relightCandles);

  if (burstConfettiStage3) {
    burstConfettiStage3.addEventListener('click', () => {
      SoundEngine.playChime();
      fireCornerCannons();
      showToast('🎉 Extra Confetti for Sir Sufyan!');
    });
  }

  if (goToStage4Btn) {
    goToStage4Btn.addEventListener('click', () => {
      SoundEngine.playChime();
      goToStage(4);
    });
  }

  // ==========================================================================
  // 7. Stage 4: Heartfelt Letters Navigation
  // ==========================================================================
  const goToStage3Back = document.getElementById('go-to-stage-3-back');
  const goToStage5Btn = document.getElementById('go-to-stage-5-btn');

  if (goToStage3Back) {
    goToStage3Back.addEventListener('click', () => {
      SoundEngine.playChime();
      goToStage(3);
    });
  }

  if (goToStage5Btn) {
    goToStage5Btn.addEventListener('click', () => {
      SoundEngine.playChime();
      goToStage(5);
    });
  }

  // ==========================================================================
  // 8. Stage 5: Celebration Arcade & Fun Zone
  // ==========================================================================
  const cannonBurstBtn = document.getElementById('cannon-burst-btn');
  const blastCountEl = document.getElementById('blast-count');
  let blastCount = 0;

  if (cannonBurstBtn) {
    cannonBurstBtn.addEventListener('click', () => {
      blastCount++;
      if (blastCountEl) blastCountEl.textContent = blastCount;
      SoundEngine.playFanfare();
      fireCornerCannons();
      fireConfettiBurst({ count: 100, speed: 17 });
      showToast(`💥 BOOM! Confetti salvo #${blastCount} fired for Sir Sufyan!`);
    });
  }

  // Wish Chips & Sky Balloon
  let selectedWish = 'Wishing you eternal health, peace, and smiles!';
  const wishChips = document.querySelectorAll('.chip');
  const customWishInput = document.getElementById('custom-wish-input');
  const sendBalloonBtn = document.getElementById('send-balloon-btn');
  const skyArena = document.getElementById('sky-arena');

  wishChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      wishChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      selectedWish = chip.getAttribute('data-wish') || chip.textContent;
      if (customWishInput) customWishInput.value = '';
    });
  });

  if (sendBalloonBtn && skyArena) {
    sendBalloonBtn.addEventListener('click', () => {
      const customText = customWishInput ? customWishInput.value.trim() : '';
      const textToFly = customText || selectedWish;

      SoundEngine.playChime();

      // Create floating balloon
      const balloon = document.createElement('div');
      balloon.className = 'floating-wish-balloon';
      balloon.innerHTML = `<span>🎈</span> <em>${textToFly}</em>`;
      skyArena.appendChild(balloon);

      showToast('🎈 Your birthday blessing is soaring high for Sir Sufyan!');

      setTimeout(() => {
        balloon.remove();
      }, 3600);
    });
  }

  // Keepsake Polaroid Print & Share
  const printKeepsakeBtn = document.getElementById('print-keepsake-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');

  if (printKeepsakeBtn) {
    printKeepsakeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('🔗 Celebration link copied to clipboard!');
        }).catch(() => {
          showToast('🔗 Link: ' + window.location.href);
        });
      } else {
        showToast('🔗 Link: ' + window.location.href);
      }
    });
  }

  // Replay Adventure
  const replayAdventureBtn = document.getElementById('replay-adventure-btn');
  if (replayAdventureBtn) {
    replayAdventureBtn.addEventListener('click', () => {
      // Reset states
      isBoxOpened = false;
      if (mysteryGift) mysteryGift.classList.remove('opened');

      poppedBalloons.clear();
      [1, 2, 3].forEach((id) => {
        const card = document.getElementById(`balloon-card-${id}`);
        const b = document.getElementById(`balloon-${id}`);
        if (card) card.classList.remove('popped');
        if (b) b.classList.remove('popping');
      });
      updateBalloonProgress();

      if (unlockRevealBtn) {
        unlockRevealBtn.classList.add('disabled');
        unlockRevealBtn.setAttribute('disabled', 'true');
        unlockRevealBtn.innerHTML = `
          <span class="btn-lock-icon">🔒</span>
          <span class="btn-text">Pop All 3 Balloons to Unlock Reveal</span>
        `;
      }

      relightCandles();

      // Go back to Stage 1
      goToStage(1);
      showToast('✨ Replaying the magical birthday surprise from the start!');
    });
  }

  // ==========================================================================
  // 9. Audio Controls (Melody & SFX)
  // ==========================================================================
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const soundFxToggle = document.getElementById('sound-fx-toggle');
  const fxIcon = document.getElementById('fx-icon');

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (isMelodyPlaying) {
        SoundEngine.stopHappyBirthday();
      } else {
        SoundEngine.playHappyBirthday();
      }
    });
  }

  if (soundFxToggle) {
    soundFxToggle.addEventListener('click', () => {
      isSoundFxEnabled = !isSoundFxEnabled;
      if (fxIcon) {
        fxIcon.textContent = isSoundFxEnabled ? '🔔' : '🔕';
      }
      showToast(isSoundFxEnabled ? '🔔 Sound effects turned ON' : '🔕 Sound effects MUTED');
    });
  }

  // ==========================================================================
  // 10. Toast Notification System
  // ==========================================================================
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  // Initialize Canvas on page load
  window.addEventListener('DOMContentLoaded', () => {
    initCanvases();
  });

})();
