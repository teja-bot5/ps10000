/* PS10,000 input layer.
 * Every controller (phone, Bluetooth pad via Android, browser Gamepad API) lands in one of 4 player slots.
 * Slots expose standard-mapping gamepad state; games read it through the shim; the launcher reads nav events.
 * Standard button order: 0 A,1 B,2 X,3 Y,4 LB,5 RB,6 LT,7 RT,8 Select,9 Start,10 L3,11 R3,12 Up,13 Down,14 Left,15 Right,16 Home
 */
(function () {
  const NB = 17;
  const COLORS = ['#3d8bff', '#ff4d5e', '#3ddc84', '#ffc53d'];
  const NAMES = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'select', 'start', 'l3', 'r3', 'up', 'down', 'left', 'right', 'home'];

  const slots = [null, null, null, null];
  const sources = new Map(); // sourceKey -> {key, kind, name, buttons:Float32Array, axes:Float32Array, slot, lastSeen, cid?, pid?}
  const listeners = {};
  let navEnabled = true;
  let nativeBridge = false;

  function emit(ev, data) { (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  function on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); }

  function makeSource(key, kind, name) {
    let s = sources.get(key);
    if (!s) {
      s = { key, kind, name: name || kind, buttons: new Float32Array(NB), axes: new Float32Array(4), prev: new Float32Array(NB), slot: -1, lastSeen: performance.now(), stickPrev: { x: 0, y: 0 } };
      sources.set(key, s);
    }
    return s;
  }

  function assignSlot(s) {
    if (s.slot >= 0) return s.slot;
    // reclaim the slot this phone had before (same persistent id)
    let idx = -1;
    if (s.pid) idx = slots.findIndex(x => x && x.pid === s.pid && !x.connected);
    if (idx < 0) idx = slots.findIndex(x => !x || !x.connected);
    if (idx < 0) return -1;
    slots[idx] = { index: idx, source: s.key, kind: s.kind, name: s.name, pid: s.pid || null, color: COLORS[idx], connected: true, since: Date.now() };
    s.slot = idx;
    emit('slots', slots.slice());
    emit('joined', slots[idx]);
    return idx;
  }

  function releaseSource(key) {
    const s = sources.get(key);
    if (!s) return;
    if (s.slot >= 0 && slots[s.slot]) { slots[s.slot].connected = false; emit('left', slots[s.slot]); emit('slots', slots.slice()); }
    sources.delete(key);
  }

  function freeSlot(i) { if (slots[i]) { const k = slots[i].source; const s = sources.get(k); if (s) s.slot = -1; slots[i] = null; emit('slots', slots.slice()); } }

  // --------------------------------------------------------------- nav edge detection
  const repeat = {}; // key -> {t, n}
  function navFrom(s) {
    if (!navEnabled) return;
    const b = s.buttons, p = s.prev;
    const now = performance.now();
    const stickDir = (() => {
      const x = s.axes[0], y = s.axes[1];
      if (Math.abs(x) < 0.55 && Math.abs(y) < 0.55) return null;
      return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
    })();
    const dirs = { up: b[12] > 0.5 || stickDir === 'up', down: b[13] > 0.5 || stickDir === 'down', left: b[14] > 0.5 || stickDir === 'left', right: b[15] > 0.5 || stickDir === 'right' };
    for (const d in dirs) {
      const rk = s.key + d;
      if (dirs[d]) {
        const r = repeat[rk];
        if (!r) { repeat[rk] = { t: now + 380, n: 0 }; fireNav(d, s); }
        else if (now >= r.t) { r.n++; r.t = now + (r.n > 4 ? 70 : 120); fireNav(d, s); }
      } else delete repeat[rk];
    }
    const press = i => b[i] > 0.5 && !(p[i] > 0.5);
    if (press(0)) fireNav('ok', s);
    if (press(1)) fireNav('back', s);
    if (press(2)) fireNav('x', s);
    if (press(3)) fireNav('y', s);
    if (press(9)) fireNav('start', s);
    if (press(8)) fireNav('select', s);
    if (press(16)) fireNav('home', s);
    if (press(4)) fireNav('lb', s);
    if (press(5)) fireNav('rb', s);
  }
  function fireNav(action, s) { emit('nav', { action, slot: s ? s.slot : -1, kind: s ? s.kind : 'remote' }); }

  function update(s) {
    s.lastSeen = performance.now();
    const any = s.buttons.some(v => v > 0.5) || Math.abs(s.axes[0]) > 0.6 || Math.abs(s.axes[1]) > 0.6;
    if (s.slot < 0 && any) assignSlot(s);
    navFrom(s);
    // home button always reaches the host, even while a game runs
    if (!navEnabled && s.buttons[16] > 0.5 && !(s.prev[16] > 0.5)) emit('home', { slot: s.slot });
    s.prev.set(s.buttons);
  }

  // --------------------------------------------------------------- phones (websocket frames)
  // frame: [1, b0, b1, b2, lx, ly, rx, ry]  (signed int8 axes)
  function phoneFrame(cid, bytes) {
    if (bytes[0] !== 1 || bytes.length < 8) return;
    const s = sources.get('phone:' + cid);
    if (!s) return;
    const mask = bytes[1] | (bytes[2] << 8) | (bytes[3] << 16);
    for (let i = 0; i < NB; i++) s.buttons[i] = (mask >> i) & 1;
    const ax = v => { v = v > 127 ? v - 256 : v; return Math.max(-1, v / 127); };
    s.axes[0] = ax(bytes[4]); s.axes[1] = ax(bytes[5]); s.axes[2] = ax(bytes[6]); s.axes[3] = ax(bytes[7]);
    update(s);
  }
  function phoneJoin(m) {
    const s = makeSource('phone:' + m.cid, 'phone', m.name || 'Phone');
    s.cid = m.cid; s.pid = m.pid || null;
    const idx = assignSlot(s); // phones take a slot on join so they get their colour straight away
    emit('phone', { cid: m.cid, slot: idx });
  }
  function phoneLeave(m) { releaseSource('phone:' + m.cid); }

  // --------------------------------------------------------------- native pads (Android bridge)
  // window.PSNative.pad(deviceId, name, mask, lx, ly, rx, ry, lt, rt)
  window.PSNative = {
    pad(id, name, mask, lx, ly, rx, ry, lt, rt) {
      nativeBridge = true;
      const s = makeSource('native:' + id, 'gamepad', name || 'Controller');
      for (let i = 0; i < NB; i++) s.buttons[i] = (mask >> i) & 1;
      if (lt !== undefined) s.buttons[6] = Math.max(s.buttons[6], lt);
      if (rt !== undefined) s.buttons[7] = Math.max(s.buttons[7], rt);
      s.axes[0] = lx || 0; s.axes[1] = ly || 0; s.axes[2] = rx || 0; s.axes[3] = ry || 0;
      update(s);
    },
    gone(id) { releaseSource('native:' + id); },
    back() { fireNav('back', null); },
    menu() { fireNav('home', null); emit('home', { slot: -1 }); }
  };

  // --------------------------------------------------------------- browser Gamepad API
  const realGetGamepads = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : () => [];
  function pollBrowserPads() {
    if (nativeBridge || window.PSAndroid) return;
    let pads;
    try { pads = realGetGamepads(); } catch (e) { return; }
    const seen = new Set();
    for (const gp of pads || []) {
      if (!gp || !gp.connected) continue;
      const key = 'gp:' + gp.index;
      seen.add(key);
      const s = makeSource(key, 'gamepad', (gp.id || 'Gamepad').replace(/\(.*?\)/g, '').trim().slice(0, 28));
      for (let i = 0; i < NB; i++) s.buttons[i] = gp.buttons[i] ? gp.buttons[i].value : 0;
      for (let i = 0; i < 4; i++) { const v = gp.axes[i] || 0; s.axes[i] = Math.abs(v) < 0.12 ? 0 : v; }
      update(s);
    }
    for (const k of Array.from(sources.keys())) if (k.startsWith('gp:') && !seen.has(k)) releaseSource(k);
  }

  // --------------------------------------------------------------- keyboard / TV remote
  const KEYNAV = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', ' ': 'ok', NumpadEnter: 'ok', Escape: 'back', Backspace: 'back', BrowserBack: 'back', GoBack: 'back', ContextMenu: 'home', m: 'home', M: 'home', x: 'x', y: 'y', MediaPlayPause: 'start' };
  window.addEventListener('keydown', e => {
    if (!navEnabled) {
      if (e.key === 'Escape' || e.key === 'BrowserBack' || e.key === 'GoBack' || e.key === 'ContextMenu') { e.preventDefault(); emit('home', { slot: 0 }); }
      return;
    }
    const a = KEYNAV[e.key];
    if (!a) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && a !== 'up' && a !== 'down' && a !== 'ok' && a !== 'back') return;
    e.preventDefault();
    fireNav(a, null);
  });

  // --------------------------------------------------------------- virtual pads for games
  function makePadObject(i) {
    const sl = slots[i];
    if (!sl || !sl.connected) return null;
    const s = sources.get(sl.source);
    if (!s) return null;
    const buttons = Array.from(s.buttons, v => ({ pressed: v > 0.5, touched: v > 0.1, value: v }));
    return { id: 'PS10000 Player ' + (i + 1) + ' (STANDARD GAMEPAD Vendor: 0000 Product: 0000)', index: i, connected: true, mapping: 'standard', timestamp: performance.now(), axes: Array.from(s.axes), buttons, vibrationActuator: null, hapticActuators: [] };
  }
  function pads() { return [0, 1, 2, 3].map(makePadObject); }
  function slotState(i) {
    const sl = slots[i];
    if (!sl || !sl.connected) return null;
    const s = sources.get(sl.source);
    return s ? { buttons: s.buttons, axes: s.axes } : null;
  }

  function rumble(slot, ms) {
    const sl = slots[slot];
    if (!sl) return;
    if (sl.kind === 'phone' && PS.net) { const s = sources.get(sl.source); if (s) PS.net.toPad(s.cid, { t: 'rumble', ms: ms || 60 }); }
    if (sl.kind === 'gamepad' && window.PSAndroid && PSAndroid.rumble) { try { PSAndroid.rumble(sl.source.split(':')[1] | 0, ms || 60); } catch (e) {} }
  }

  function setPhoneLayout(layout) {
    for (const s of sources.values()) if (s.kind === 'phone' && PS.net) PS.net.toPad(s.cid, { t: 'layout', layout });
  }
  function sendSlotInfo() {
    for (const s of sources.values()) if (s.kind === 'phone' && PS.net) PS.net.toPad(s.cid, { t: 'slot', slot: s.slot, color: s.slot >= 0 ? COLORS[s.slot] : '#888' });
  }
  on('slots', sendSlotInfo);

  // stale source cleanup (phones that silently dropped keep their slot greyed)
  function loop() {
    pollBrowserPads();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.PS = window.PS || {};
  PS.input = {
    on, slots, pads, slotState, rumble, freeSlot, setPhoneLayout, COLORS, NAMES,
    phoneFrame, phoneJoin, phoneLeave,
    setNav(v) { navEnabled = v; for (const k in repeat) delete repeat[k]; },
    get navEnabled() { return navEnabled; },
    connectedCount() { return slots.filter(s => s && s.connected).length; }
  };
})();
