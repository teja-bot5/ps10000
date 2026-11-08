/* PS10,000 originals: tiny shared engine. 960x540 logical canvas, scaled to the screen. */
(function () {
  const W = 960, H = 540;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  document.body.style.cssText = 'margin:0;background:#000;overflow:hidden;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;cursor:none';
  cv.style.cssText = 'image-rendering:auto;display:block';
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; }
  addEventListener('resize', fit); fit();

  // ---------------------------------------------------------------- input
  // per player: {x,y (stick/dpad), a,b,x,y,start,lb,rb + *P pressed-this-frame}
  const KB = new Set(), KBP = new Set(); // KBP latches taps shorter than one frame
  addEventListener('keydown', e => { KB.add(e.code); KBP.add(e.code); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => KB.delete(e.code));
  const prev = [{}, {}, {}, {}];
  const players = [{}, {}, {}, {}];
  const BTN = { a: 0, b: 1, xb: 2, yb: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9 };
  const KEYS = ['a', 'b', 'xb', 'yb', 'start', 'lb', 'rb'];
  function poll() {
    let pads = [];
    try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) {}
    for (let i = 0; i < 4; i++) {
      const p = pads[i];
      const s = { on: !!p, x: 0, y: 0 };
      if (p) {
        const ax = p.axes || [], b = p.buttons || [];
        const pr = k => !!(b[k] && (b[k].pressed || b[k].value > 0.5));
        s.x = Math.abs(ax[0]) > 0.2 ? ax[0] : 0; s.y = Math.abs(ax[1]) > 0.2 ? ax[1] : 0;
        if (pr(14)) s.x = -1; if (pr(15)) s.x = 1; if (pr(12)) s.y = -1; if (pr(13)) s.y = 1;
        for (const k in BTN) s[k] = pr(BTN[k]);
      }
      // keyboard: P1 = arrows/WASD, Space/Z = A, X = B, C = X, V = Y, Enter = Start; P2 = IJKL, U = A, O = B
      const k = c => KB.has(c) || KBP.has(c);
      if (i === 0) {
        if (k('ArrowLeft') || k('KeyA')) s.x = -1; if (k('ArrowRight') || k('KeyD')) s.x = 1;
        if (k('ArrowUp') || k('KeyW')) s.y = -1; if (k('ArrowDown') || k('KeyS')) s.y = 1;
        if (k('Space') || k('KeyZ')) s.a = true; if (k('KeyX')) s.b = true; if (k('KeyC')) s.xb = true; if (k('KeyV')) s.yb = true; if (k('Enter')) s.start = true;
        if (KB.size) s.on = true;
      }
      if (i === 1) {
        if (k('KeyJ')) s.x = -1; if (k('KeyL')) s.x = 1; if (k('KeyI')) s.y = -1; if (k('KeyK')) s.y = 1;
        if (k('KeyU')) s.a = true; if (k('KeyO')) s.b = true; if (k('KeyP')) s.xb = true;
        if (k('KeyJ') || k('KeyL') || k('KeyI') || k('KeyK') || k('KeyU')) s.on = true;
      }
      const pv = prev[i];
      for (const key of KEYS) s[key + 'P'] = !!s[key] && !pv[key];
      s.upP = s.y < -0.5 && !(pv.y < -0.5); s.downP = s.y > 0.5 && !(pv.y > 0.5);
      s.leftP = s.x < -0.5 && !(pv.x < -0.5); s.rightP = s.x > 0.5 && !(pv.x > 0.5);
      prev[i] = { a: s.a, b: s.b, xb: s.xb, yb: s.yb, start: s.start, lb: s.lb, rb: s.rb, x: s.x, y: s.y };
      players[i] = s;
    }
    KBP.clear();
    return players;
  }
  function any(key) { return players.some(p => p[key]); }
  function connected() { return players.filter(p => p.on).length; }

  // ---------------------------------------------------------------- sound
  let ac = null;
  function ctx() { if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); } if (ac.state === 'suspended') ac.resume(); return ac; }
  function beep(f, d, type, vol, to) {
    const c = ctx(); if (!c) return;
    const t = c.currentTime, o = c.createOscillator(), gn = c.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    gn.gain.setValueAtTime(vol || 0.06, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(gn); gn.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function noise(d, vol, freq) {
    const c = ctx(); if (!c) return;
    const b = c.createBuffer(1, c.sampleRate * d | 0, c.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1800;
    const gn = c.createGain(); gn.gain.value = vol || 0.15;
    s.connect(f); f.connect(gn); gn.connect(c.destination); s.start();
  }
  const sfx = {
    jump: () => beep(420, 0.12, 'square', 0.05, 760),
    coin: () => { beep(988, 0.06, 'square', 0.04); setTimeout(() => beep(1318, 0.1, 'square', 0.04), 55); },
    hit: () => { noise(0.18, 0.18, 1400); beep(160, 0.15, 'sawtooth', 0.05, 60); },
    boom: () => { noise(0.5, 0.25, 700); beep(90, 0.4, 'sine', 0.12, 30); },
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.07), i * 110)),
    lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 0.22, 'triangle', 0.07), i * 150)),
    click: () => beep(1200, 0.04, 'square', 0.03),
    thrust: () => noise(0.05, 0.03, 900),
    punch: () => { noise(0.08, 0.2, 2500); beep(220, 0.08, 'square', 0.05, 110); }
  };

  // ---------------------------------------------------------------- drawing helpers
  const COLORS = ['#3d8bff', '#ff4d5e', '#3ddc84', '#ffc53d'];
  function text(s, x, y, size, color, align, weight) {
    g.font = (weight || 800) + ' ' + size + 'px PSUI, system-ui, sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.fillStyle = color || '#fff'; g.fillText(s, x, y);
  }
  function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const parts = [];
  function burst(x, y, color, n, speed) {
    for (let i = 0; i < (n || 14); i++) { const a = Math.random() * Math.PI * 2, s = (speed || 3) * (0.4 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 30 + Math.random() * 20, color }); }
  }
  function drawParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      g.globalAlpha = Math.min(1, p.life / 20); g.fillStyle = p.color; g.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    g.globalAlpha = 1;
  }
  let shakeT = 0;
  function shake(n) { shakeT = Math.max(shakeT, n || 8); }

  // overlay card: title screen / results
  function panel(title, lines, color) {
    g.fillStyle = 'rgba(4,6,12,.78)'; g.fillRect(0, 0, W, H);
    text(title, W / 2, H / 2 - 70, 54, color || '#fff');
    (lines || []).forEach((l, i) => text(l, W / 2, H / 2 + 4 + i * 34, i === lines.length - 1 ? 20 : 22, i === lines.length - 1 ? '#a3acbd' : '#dfe5f0', 'center', i === lines.length - 1 ? 600 : 700));
  }

  // ---------------------------------------------------------------- main loop (fixed 60 Hz step)
  function run(update, draw) {
    let last = performance.now(), acc = 0;
    function frame(t) {
      acc += Math.min(100, t - last); last = t;
      let steps = 0;
      while (acc >= 1000 / 60 && steps < 4) { poll(); update(); acc -= 1000 / 60; steps++; }
      g.save();
      if (shakeT > 0) { g.translate((Math.random() - 0.5) * shakeT, (Math.random() - 0.5) * shakeT); shakeT *= 0.85; if (shakeT < 0.5) shakeT = 0; }
      draw(g);
      drawParts();
      g.restore();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.G = { W, H, g, cv, poll, players, any, connected, sfx, beep, noise, text, rrect, burst, shake, panel, run, COLORS, clamp: (v, a, b) => Math.max(a, Math.min(b, v)), rand: (a, b) => a + Math.random() * (b - a) };
})();
