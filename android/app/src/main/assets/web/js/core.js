/* PS10,000 core: storage, sound (synthesised, no sample files), network to the embedded server, device info. */
(function () {
  window.PS = window.PS || {};

  // ------------------------------------------------------------------ storage
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ps10k.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ps10k.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  PS.store = LS;

  const DEFAULT_PROFILES = [
    { id: 'p1', name: 'Player 1', avatar: 0, color: 0 },
    { id: 'p2', name: 'Player 2', avatar: 1, color: 1 },
    { id: 'p3', name: 'Player 3', avatar: 2, color: 2 }
  ];
  PS.profiles = {
    list() { return LS.get('profiles', DEFAULT_PROFILES); },
    save(list) { LS.set('profiles', list); },
    current() { const id = LS.get('currentProfile', null); return this.list().find(p => p.id === id) || null; },
    setCurrent(id) { LS.set('currentProfile', id); },
    stats(pid) { return LS.get('stats.' + pid, { games: {} }); },
    saveStats(pid, s) { LS.set('stats.' + pid, s); }
  };

  PS.settings = Object.assign({ sound: true, music: true, lite: 'auto', fps: false, previews: true, volume: 0.7 }, LS.get('settings', {}));
  PS.saveSettings = () => LS.set('settings', PS.settings);

  // ------------------------------------------------------------------ device / lite mode
  const mem = (window.PSAndroid && PSAndroid.totalMemMB) ? (+PSAndroid.totalMemMB() || 0) : ((navigator.deviceMemory || 4) * 1024);
  PS.device = {
    android: !!window.PSAndroid,
    memMB: mem,
    lowEnd: mem > 0 && mem <= 1600 || (navigator.hardwareConcurrency || 4) <= 2
  };
  PS.isLite = () => PS.settings.lite === 'on' || (PS.settings.lite === 'auto' && PS.device.lowEnd);

  // ------------------------------------------------------------------ sound (WebAudio synth)
  let ac = null, master = null, musicNode = null;
  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = PS.settings.volume;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur, opt) {
    if (!PS.settings.sound) return;
    const c = ctx(); if (!c) return;
    opt = opt || {};
    const t = c.currentTime + (opt.delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = opt.type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opt.gain || 0.12, t + Math.min(0.012, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, opt) {
    if (!PS.settings.sound) return;
    const c = ctx(); if (!c) return;
    opt = opt || {};
    const t = c.currentTime + (opt.delay || 0);
    const buf = c.createBuffer(1, Math.max(1, c.sampleRate * dur | 0), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = opt.freq || 2400; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = opt.gain || 0.05;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  // Console-style UI sounds, synthesised live (no sample files):
  // a soft rounded "tock" for focus moves, a brighter two-step chime for confirm, airy swells for menus.
  function tock(freq, gain, delay) {
    tone(freq, 0.045, { type: 'sine', gain: gain, delay: delay, to: freq * 0.82 });
    tone(freq * 2.01, 0.025, { type: 'sine', gain: gain * 0.35, delay: delay });
  }
  function air(up, dur, gain, delay) {
    noise(dur, { freq: up ? 2600 : 1500, gain: gain, delay: delay });
    tone(up ? 420 : 760, dur, { type: 'sine', gain: gain * 0.9, to: up ? 900 : 380, delay: delay });
  }
  PS.sfx = {
    move() { tock(1480, 0.05); },
    tick() { tock(1180, 0.045); },
    ok() { tock(1760, 0.06); tone(2350, 0.11, { delay: 0.045, gain: 0.04 }); },
    back() { tock(1100, 0.05); tone(820, 0.09, { delay: 0.04, gain: 0.035, to: 640 }); },
    open() { air(true, 0.28, 0.035); },
    close() { air(false, 0.22, 0.03); },
    join() { tone(1046.5, 0.12, { gain: 0.05 }); tone(1568, 0.22, { delay: 0.09, gain: 0.045 }); },
    leave() { tone(1318.5, 0.1, { gain: 0.045 }); tone(880, 0.2, { delay: 0.08, gain: 0.04 }); },
    error() { tone(330, 0.12, { type: 'triangle', gain: 0.05 }); tone(262, 0.18, { delay: 0.1, type: 'triangle', gain: 0.05 }); },
    launch() { air(true, 0.7, 0.04); tone(523.3, 0.9, { gain: 0.035, delay: 0.1 }); tone(784, 0.9, { gain: 0.03, delay: 0.18 }); },
    boot() {
      // our own startup swell: low pad rising into a bright, airy major ninth
      [130.8, 196.0, 261.6, 329.6, 392.0, 587.3].forEach((f, i) => tone(f, 2.6 - i * 0.12, { delay: 0.2 + i * 0.14, gain: 0.038, type: i < 2 ? 'triangle' : 'sine' }));
      air(true, 1.6, 0.02, 0.2);
      tone(1174.7, 1.8, { delay: 1.1, gain: 0.018 });
    },
    unlock() { ctx(); }
  };

  // ambient background music: slow evolving pad, very quiet
  PS.music = {
    start() {
      if (!PS.settings.music || musicNode) return;
      const c = ctx(); if (!c) return;
      const g = c.createGain(); g.gain.value = 0.0; g.connect(master);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(g);
      const chords = [[130.8, 196.0, 246.9, 329.6], [110.0, 164.8, 220.0, 261.6], [98.0, 146.8, 196.0, 293.7], [116.5, 174.6, 233.1, 293.7]];
      const oscs = [];
      for (let i = 0; i < 4; i++) { const o = c.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.detune.value = (i - 1.5) * 6; o.connect(lp); o.start(); oscs.push(o); }
      let ci = 0;
      const step = () => { const ch = chords[ci++ % chords.length]; const t = c.currentTime; oscs.forEach((o, i) => o.frequency.setTargetAtTime(ch[i], t, 1.8)); };
      step();
      const timer = setInterval(step, 7000);
      g.gain.setTargetAtTime(0.05, c.currentTime, 3);
      musicNode = { g, oscs, timer };
    },
    stop() {
      if (!musicNode || !ac) return;
      const m = musicNode; musicNode = null;
      m.g.gain.setTargetAtTime(0, ac.currentTime, 0.4);
      clearInterval(m.timer);
      setTimeout(() => m.oscs.forEach(o => { try { o.stop(); } catch (e) {} }), 1500);
    },
    get playing() { return !!musicNode; }
  };

  // ------------------------------------------------------------------ network
  let ws = null, info = { ip: null, port: location.port || 80, key: '' }, retry = 0;
  const net = {
    info,
    padUrl() {
      const host = info.ip || location.hostname;
      return 'http://' + host + ':' + (info.port || location.port) + '/pad/?k=' + (info.key || '');
    },
    async refreshInfo() {
      try { const r = await fetch('/api/info', { cache: 'no-store' }); Object.assign(info, await r.json()); } catch (e) {}
      return info;
    },
    connect() {
      if (location.protocol === 'file:') return;
      const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws?role=tv';
      try { ws = new WebSocket(url); } catch (e) { return setTimeout(() => net.connect(), 2000); }
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => { retry = 0; PS.input && PS.input.on && null; };
      ws.onmessage = ev => {
        if (typeof ev.data !== 'string') { const b = new Uint8Array(ev.data); PS.input.phoneFrame(b[0], b.subarray(1)); return; }
        let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.t === 'join') PS.input.phoneJoin(m);
        else if (m.t === 'leave') PS.input.phoneLeave(m);
        else if (m.t === 'roms') document.dispatchEvent(new CustomEvent('ps-roms'));
        else if (m.t === 'msg') document.dispatchEvent(new CustomEvent('ps-padmsg', { detail: m }));
      };
      ws.onclose = () => { ws = null; setTimeout(() => net.connect(), Math.min(5000, 500 * ++retry)); };
      ws.onerror = () => {};
    },
    toPad(cid, obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(Object.assign({ to: cid }, obj))); },
    toAll(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(Object.assign({ to: 'all' }, obj))); },
    async roms() { try { const r = await fetch('/api/roms', { cache: 'no-store' }); return await r.json(); } catch (e) { return []; } },
    async deleteRom(name) { try { await fetch('/api/delete?name=' + encodeURIComponent(name), { method: 'POST' }); } catch (e) {} }
  };
  PS.net = net;
})();
