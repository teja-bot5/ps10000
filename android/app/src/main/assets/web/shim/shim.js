/* PS10,000 in-game shim. Loaded inside every game frame.
 * - Replaces navigator.getGamepads() with the console's 4 virtual pads (phones + controllers)
 * - Turns pad buttons into keyboard events for keyboard-only games (per-game maps)
 * - Optional twin-stick mouse aim
 * - Pause support (freezes requestAnimationFrame and suspends audio)
 * - Hides page clutter and scales the game to fill the TV
 */
(function () {
  if (window.__ps10kShimLoaded) return;
  window.__ps10kShimLoaded = true;
  let P = null;
  try { P = window.parent && window.parent !== window ? window.parent.PS : null; } catch (e) { P = null; }
  const cfg = window.PS_GAME_CFG || (P && P.host && P.host.cfg && P.host.cfg()) || { mode: 'pad' };
  const NAMES = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'select', 'start', 'l3', 'r3', 'up', 'down', 'left', 'right', 'home'];

  // ------------------------------------------------------------- pause gate (rAF + audio)
  let paused = false;
  const nativeRAF = window.requestAnimationFrame.bind(window);
  const queued = [];
  window.requestAnimationFrame = function (cb) {
    if (paused) { queued.push(cb); return -1; }
    return nativeRAF(cb);
  };
  const contexts = [];
  ['AudioContext', 'webkitAudioContext'].forEach(n => {
    const A = window[n];
    if (!A) return;
    const W = function (...args) { const c = new A(...args); contexts.push(c); return c; };
    W.prototype = A.prototype;
    try { window[n] = W; } catch (e) {}
  });
  function setPaused(on) {
    if (on === paused) return;
    paused = on;
    contexts.forEach(c => { try { on ? c.suspend() : c.resume(); } catch (e) {} });
    document.querySelectorAll('audio,video').forEach(m => { try { if (on) { m.__psWas = !m.paused; m.pause(); } else if (m.__psWas) m.play(); } catch (e) {} });
    if (!on) { const q = queued.splice(0); q.forEach(cb => nativeRAF(cb)); releaseAll(); }
    if (on) releaseAll();
  }
  window.PSShim = { pause: setPaused };

  // ------------------------------------------------------------- virtual gamepads
  if (P && P.input) {
    // retro systems have no analog stick: fold the left stick into the D-pad so any controller works
    const fold = p => {
      if (!p || !cfg.retro) return p;
      const ax = p.axes, T = 0.5, b = p.buttons;
      const set = (i, on) => { if (on && !b[i].pressed) b[i] = { pressed: true, touched: true, value: 1 }; };
      set(12, ax[1] < -T); set(13, ax[1] > T); set(14, ax[0] < -T); set(15, ax[0] > T);
      return p;
    };
    const getPads = () => P.input.pads().map(fold);
    try { Object.defineProperty(Navigator.prototype, 'getGamepads', { value: getPads, configurable: true, writable: true }); } catch (e) {}
    try { Object.defineProperty(navigator, 'getGamepads', { value: getPads, configurable: true, writable: true }); } catch (e) {}
    // gamepadconnected / disconnected events so games that wait for them notice phones
    const known = [false, false, false, false];
    const announce = () => {
      const pads = getPads();
      pads.forEach((p, i) => {
        const on = !!p;
        if (on !== known[i]) {
          known[i] = on;
          const ev = new Event(on ? 'gamepadconnected' : 'gamepaddisconnected');
          Object.defineProperty(ev, 'gamepad', { value: p || { index: i, connected: false } });
          window.dispatchEvent(ev);
        }
      });
    };
    setInterval(announce, 250);
    setTimeout(announce, 30);
  }

  // ------------------------------------------------------------- pad -> keyboard
  const down = new Map(); // keyId -> keydef
  function fireKey(type, k) {
    const ev = new KeyboardEvent(type, { key: k.key, code: k.code, bubbles: true, cancelable: true });
    try {
      Object.defineProperty(ev, 'keyCode', { get: () => k.keyCode });
      Object.defineProperty(ev, 'which', { get: () => k.keyCode });
      Object.defineProperty(ev, 'charCode', { get: () => type === 'keypress' ? k.keyCode : 0 });
    } catch (e) {}
    const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : (document.body || document);
    target.dispatchEvent(ev);
  }
  function releaseAll() { for (const [id, k] of down) fireKey('keyup', k); down.clear(); mouseUp(); }

  function readPlayer(i) {
    const st = P && P.input ? P.input.slotState(i) : null;
    if (!st) return null;
    const b = st.buttons, ax = st.axes;
    const v = {};
    NAMES.forEach((n, j) => v[n] = b[j] > 0.5);
    const T = 0.5;
    v.up = v.up || ax[1] < -T; v.down = v.down || ax[1] > T; v.left = v.left || ax[0] < -T; v.right = v.right || ax[0] > T;
    v.rup = ax[3] < -T; v.rdown = ax[3] > T; v.rleft = ax[2] < -T; v.rright = ax[2] > T;
    v.lt = v.lt || b[6] > 0.3; v.rt = v.rt || b[7] > 0.3;
    v._ax = ax;
    return v;
  }

  function keysTick() {
    if (cfg.mode !== 'keys' || !cfg.keys || paused) return;
    const want = new Map();
    for (const pk in cfg.keys) {
      const map = cfg.keys[pk];
      const st = readPlayer((+pk) - 1);
      if (!st) continue;
      for (const btn in map) if (st[btn]) want.set(map[btn].code + '|' + map[btn].keyCode, map[btn]);
    }
    for (const [id, k] of down) if (!want.has(id)) { fireKey('keyup', k); down.delete(id); }
    for (const [id, k] of want) if (!down.has(id)) { fireKey('keydown', k); if (k.key.length === 1) fireKey('keypress', k); down.set(id, k); }
  }

  // ------------------------------------------------------------- twin-stick mouse aim
  let mouseIsDown = false, lastAim = { x: 0, y: 0 }, aBtnPrev = false, aimRing = null;
  function aimTarget() { return document.querySelector(cfg.aimTarget || 'canvas') || document.body; }
  function mouseEv(type, x, y) {
    const t = aimTarget();
    const ev = new MouseEvent(type, { clientX: x, clientY: y, screenX: x, screenY: y, bubbles: true, cancelable: true, button: 0, buttons: type === 'mouseup' ? 0 : (mouseIsDown ? 1 : 0), view: window });
    t.dispatchEvent(ev);
  }
  function mouseUp() { if (mouseIsDown) { mouseIsDown = false; mouseEv('mouseup', lastAim.x, lastAim.y); } }
  function aimTick() {
    if (cfg.aim !== 'mouse' || paused) return;
    const st = readPlayer(0);
    if (!st) return;
    const t = aimTarget(); const r = t.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ax = st._ax, mag = Math.hypot(ax[2], ax[3]);
    const rad = Math.min(r.width, r.height) * 0.42;
    let x = cx, y = cy;
    if (mag > 0.25) { x = cx + ax[2] / Math.max(1, mag) * rad; y = cy + ax[3] / Math.max(1, mag) * rad; }
    else { x = lastAim.x || cx; y = lastAim.y || cy; }
    if (Math.abs(x - lastAim.x) > 0.5 || Math.abs(y - lastAim.y) > 0.5) { lastAim = { x, y }; mouseEv('mousemove', x, y); }
    // visible aim ring (mouse cursors are hidden on the TV)
    if (!aimRing) { aimRing = document.createElement('div'); aimRing.style.cssText = 'position:fixed;z-index:2147483647;width:26px;height:26px;margin:-13px 0 0 -13px;border:3px solid rgba(255,255,255,.9);border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,.5);pointer-events:none;left:0;top:0'; document.body.appendChild(aimRing); }
    aimRing.style.transform = `translate(${x}px,${y}px)`;
    const fire = mag > 0.6 || st.rt || st.rb;
    if (fire && !mouseIsDown) { mouseIsDown = true; mouseEv('mousedown', x, y); }
    else if (!fire && mouseIsDown) mouseUp();
    // A = click (menus)
    if (st.a && !aBtnPrev) { mouseEv('mousedown', x, y); mouseEv('mouseup', x, y); mouseEv('click', x, y); }
    aBtnPrev = st.a;
  }

  // ------------------------------------------------------------- tidy page + fit to screen
  function css() {
    const s = document.createElement('style');
    s.textContent = 'html,body{background:#000 !important;overflow:hidden !important;cursor:none !important;}' +
      (cfg.hide ? cfg.hide + '{display:none !important;}' : '') +
      (cfg.fit ? 'html,body{margin:0 !important;padding:0 !important;width:100% !important;height:100% !important;}' + cfg.fit.split(',').map(x => x.trim()).join(',') + '{position:fixed !important;left:50% !important;top:50% !important;margin:0 !important;transform-origin:50% 50% !important;}' : '');
    (document.head || document.documentElement).appendChild(s);
  }
  function fit() {
    if (!cfg.fit) return;
    const el = document.querySelector(cfg.fit.split(',')[0]) || document.querySelector(cfg.fit);
    if (!el) return;
    const w = el.offsetWidth || el.width, h = el.offsetHeight || el.height;
    if (!w || !h) return;
    const s = Math.min(innerWidth / w, innerHeight / h);
    el.style.setProperty('transform', `translate(-50%,-50%) scale(${s})`, 'important');
  }

  function loop() {
    try { keysTick(); aimTick(); } catch (e) {}
    nativeRAF(loop);
  }

  // a real Back / Escape press (TV remote, keyboard) opens the console pause menu.
  // Synthetic keys sent by this shim are untrusted, so games that map B to Escape still get it.
  addEventListener('keydown', e => {
    if (!e.isTrusted) return;
    if (e.key === 'Escape' || e.key === 'GoBack' || e.key === 'BrowserBack' || e.key === 'ContextMenu') {
      e.preventDefault(); e.stopImmediatePropagation();
      try { P && P.ui && P.ui.openCC(); } catch (err) {}
    }
  }, true);

  function start() {
    css(); fit();
    addEventListener('resize', fit);
    setInterval(fit, 1000);
    nativeRAF(loop);
    try { window.focus(); } catch (e) {}
  }
  window.__ps10kShimStart = start;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
