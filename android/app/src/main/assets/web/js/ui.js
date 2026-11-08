/* PS10,000 launcher UI */
(function () {
  const $ = id => document.getElementById(id);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const C = window.PS_CATALOG;

  // ------------------------------------------------------------------ icons (own drawings)
  const I = {
    pad: '<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.9 4l.9 4.7a2.6 2.6 0 0 1-4.6 2.1L16.4 16H7.6l-1.8 1.8a2.6 2.6 0 0 1-4.6-2.1l.9-4.7A5 5 0 0 1 7 7zm1 3v1.5H6.5v1.5H8v1.5h1.5V13H11v-1.5H9.5V10H8zm7.5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h8V5H8zm4 14.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 8v7h2v-7h-2zm1-4a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 12 6z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M10.6 2h2.8l.5 2.6 1.6.7 2.2-1.5 2 2-1.5 2.2.7 1.6 2.6.5v2.8l-2.6.5-.7 1.6 1.5 2.2-2 2-2.2-1.5-1.6.7-.5 2.6h-2.8l-.5-2.6-1.6-.7-2.2 1.5-2-2 1.5-2.2-.7-1.6L2 13.4v-2.8l2.6-.5.7-1.6-1.5-2.2 2-2 2.2 1.5 1.6-.7zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 10.5c4.4 0 8 2.2 8 5V21H4v-2.5c0-2.8 3.6-5 8-5z"/></svg>',
    power: '<svg viewBox="0 0 24 24"><path d="M11 2h2v10h-2zM6.3 5.3l1.4 1.4A7 7 0 1 0 16.3 6.7l1.4-1.4A9 9 0 1 1 6.3 5.3z"/></svg>',
    players: '<svg viewBox="0 0 24 24"><path d="M9 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm8 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM9 12.5c3.9 0 7 1.9 7 4.3V19H2v-2.2c0-2.4 3.1-4.3 7-4.3zm8 .5c2.8 0 5 1.4 5 3.3V19h-4v-2.2c0-1.4-.6-2.7-1.6-3.6l.6-.2z"/></svg>',
    resume: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 2v5h8V5H7zm5 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
    load: '<svg viewBox="0 0 24 24"><path d="M12 3l6 6h-4v6h-4V9H6zm-8 14h16v4H4z"/></svg>',
    restart: '<svg viewBox="0 0 24 24"><path d="M12 4a8 8 0 1 1-7.9 9.3h2A6 6 0 1 0 12 6v3L7 5l5-4v3z"/></svg>',
    quit: '<svg viewBox="0 0 24 24"><path d="M6.4 5L12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M7 3h10v2h4v3a5 5 0 0 1-4.6 5A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1A5 5 0 0 1 7.6 13 5 5 0 0 1 3 8V5h4zm-2 4v1a3 3 0 0 0 2 2.8V7zm14 0h-2v3.8A3 3 0 0 0 19 8z"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 5v6l5 3 1-1.6-4-2.4V7h-2z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"/></svg>'
  };
  PS.icons = I;

  // ------------------------------------------------------------------ stage scaling
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    const st = $('stage');
    st.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  addEventListener('resize', fit); fit();

  // ------------------------------------------------------------------ library model
  let romFiles = [];
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function tint(id) { const hh = hash(id) % 360; return `linear-gradient(135deg, hsl(${hh},65%,42%), hsl(${(hh + 50) % 360},70%,22%))`; }
  function cleanName(n) { return n.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s*[\(\[].*?[\)\]]/g, '').trim() || n; }

  function allGames() {
    const list = C.games.map(g => Object.assign({ available: true }, g));
    const byFile = new Map(romFiles.map(f => [f.name.toLowerCase(), f]));
    const used = new Set();
    // forgiving match: exact file name, or the file name contains the game title ("Nova the Squirrel (v1.2).nes")
    const norm = s => s.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/g, '');
    const find = r => {
      const exact = byFile.get(r.rom.toLowerCase());
      if (exact) return exact;
      const t = norm(r.title), base = norm(r.rom);
      return romFiles.find(f => !used.has(f.name.toLowerCase()) && C.systemForFile(f.name) && (C.SYSTEMS[C.systemForFile(f.name)].core === C.SYSTEMS[r.system].core) && (norm(f.name) === base || (t.length > 3 && norm(f.name).indexOf(t) >= 0)));
    };
    for (const r of C.roms) {
      const f = find(r);
      if (f) used.add(f.name.toLowerCase());
      list.push(Object.assign({}, r, { available: !!f, file: f ? f.name : null }));
    }
    for (const f of romFiles) {
      if (used.has(f.name.toLowerCase())) continue;
      const sys = C.systemForFile(f.name);
      if (!sys) continue;
      list.push({ id: 'user:' + f.name, type: 'rom', system: sys, file: f.name, rom: f.name, title: cleanName(f.name), genre: C.SYSTEMS[sys].name + ' game', players: '1-2', modes: [], tags: ['retro', sys, 'yours'], blurb: 'Added from your phone.', color: '#888', license: 'Added by you', source: '', credits: '', controls: ['D-pad: move', 'A / B', 'Start / Select'], input: { mode: 'pad' }, available: true, user: true });
    }
    return list;
  }
  function maxPlayers(g) { const m = String(g.players).match(/(\d+)\s*$/); return m ? +m[1] : 1; }
  function systemLabel(g) { return g.type === 'rom' ? C.SYSTEMS[g.system].name : g.type === 'original' ? 'PS10,000 Original' : 'HTML5'; }
  function art(g, kind) { return g.user ? null : `art/${g.id}/${kind}.jpg`; }
  function paintArt(el, g, kind) {
    const u = art(g, kind);
    el.style.backgroundImage = tint(g.id);
    if (!u) return;
    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url("${u}")`; el.classList.add('has-art'); if (el.parentElement && el.parentElement.classList.contains('lg')) el.parentElement.classList.add('has-art'); };
    img.src = u;
  }

  // ------------------------------------------------------------------ stats
  function profile() { return PS.profiles.current() || PS.profiles.list()[0]; }
  function stats() { return PS.profiles.stats(profile().id); }
  function recordPlay(g, ms) {
    const s = stats(); const e = s.games[g.id] || { plays: 0, ms: 0, last: 0 };
    e.plays++; e.ms += ms; e.last = Date.now(); s.games[g.id] = e; PS.profiles.saveStats(profile().id, s);
  }
  PS.recordPlay = recordPlay;
  function fmtTime(ms) { const m = Math.round(ms / 60000); return m < 60 ? m + ' min' : (m / 60).toFixed(1) + ' h'; }
  function ago(t) { if (!t) return 'Never'; const d = (Date.now() - t) / 1000; if (d < 3600) return Math.max(1, Math.round(d / 60)) + ' min ago'; if (d < 86400) return Math.round(d / 3600) + ' h ago'; return Math.round(d / 86400) + ' days ago'; }

  // ------------------------------------------------------------------ background
  let bgFlip = false, bgCurrent = '';
  function setBg(g) {
    const u = g ? art(g, 'hero') : null;
    const key = u || (g ? g.id : '');
    if (key === bgCurrent) return;
    bgCurrent = key;
    const a = $(bgFlip ? 'bgA' : 'bgB'), b = $(bgFlip ? 'bgB' : 'bgA');
    bgFlip = !bgFlip;
    const show = () => { a.classList.add('on'); b.classList.remove('on'); };
    if (!u) { a.style.backgroundImage = g ? tint(g.id) : 'none'; show(); return; }
    const img = new Image();
    img.onload = () => { if (bgCurrent !== key) return; a.style.backgroundImage = `url("${u}")`; show(); };
    img.onerror = () => { if (bgCurrent !== key) return; a.style.backgroundImage = tint(g.id); show(); };
    img.src = u;
  }

  // ------------------------------------------------------------------ screens
  let current = null;
  const screens = {};
  const history = [];
  function show(name, opts) {
    if (current && current !== name && !(opts && opts.replace)) history.push(current);
    for (const k of ['boot', 'profiles', 'home', 'hub', 'library', 'controllers', 'addgames', 'settings', 'player']) $(k).classList.toggle('active', k === name);
    const prev = current; current = name;
    document.body.classList.toggle('plain-bg', ['boot', 'profiles'].includes(name));
    if (screens[name] && screens[name].enter) screens[name].enter(opts, prev);
  }
  function back() {
    const prev = history.pop();
    if (prev) { PS.sfx.back(); show(prev, { replace: true, back: true }); }
  }
  PS.ui = { show, back, get current() { return current; }, allGames, recordPlay, art, paintArt, tint, systemLabel, maxPlayers, refreshRoms, toast, esc };

  // ------------------------------------------------------------------ toasts
  function toast(title, sub, color, icon) {
    const t = h('div', 'toast', `<i style="background:${color || '#3d8bff'}">${icon || I.pad}</i><div>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`);
    $('toasts').appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, 3800);
    while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
  }

  // ================================================================== BOOT
  screens.boot = {
    enter() { setTimeout(() => PS.sfx.boot(), 200); this.ready = Date.now() + 1500; },
    nav(a) { if (Date.now() < this.ready) return; if (['ok', 'start', 'x', 'y'].includes(a)) { PS.sfx.unlock(); PS.sfx.ok(); show('profiles', { replace: true }); } }
  };

  // ================================================================== PROFILES
  const AV_COLORS = ['#3d8bff', '#ff4d5e', '#3ddc84', '#ffc53d', '#a77bff', '#ff8a3d'];
  screens.profiles = {
    i: 0,
    enter() {
      buildBokeh();
      $('powerBtn').innerHTML = I.power;
      const list = PS.profiles.list();
      const cur = PS.profiles.current();
      this.i = cur ? Math.max(0, list.findIndex(p => p.id === cur.id)) : 0;
      this.render();
    },
    render() {
      const row = $('profileRow'); row.innerHTML = '';
      const list = PS.profiles.list();
      list.forEach((p, i) => {
        const st = PS.profiles.stats(p.id); const n = Object.keys(st.games).length;
        const e = h('div', 'pf' + (i === this.i ? ' focus' : ''), `<div class="av" style="background:${AV_COLORS[p.color % AV_COLORS.length]}">${esc(p.name.trim()[0] || '?').toUpperCase()}</div><div class="nm">${esc(p.name)}</div>`);
        row.appendChild(e);
      });
      if (list.length < 6) row.appendChild(h('div', 'pf add' + (this.i === list.length ? ' focus' : ''), `<div class="av">+</div><div class="nm">Add User</div>`));
    },
    nav(a) {
      const list = PS.profiles.list(); const n = list.length + (list.length < 6 ? 1 : 0);
      // power button under the avatars
      if (a === 'down' && !this.power) { this.power = true; PS.sfx.tick(); $('powerBtn').classList.add('focus'); return; }
      if (this.power) {
        if (a === 'up' || a === 'back') { this.power = false; PS.sfx.tick(); $('powerBtn').classList.remove('focus'); }
        else if (a === 'ok') { if (window.PSAndroid && PSAndroid.exit) PSAndroid.exit(); else toast('Close the app with the TV Home button', '', '#444', I.power); }
        return;
      }
      if (a === 'left' && this.i > 0) { this.i--; PS.sfx.move(); this.render(); }
      else if (a === 'right' && this.i < n - 1) { this.i++; PS.sfx.move(); this.render(); }
      else if (a === 'ok') {
        if (this.i === list.length) return this.addProfile();
        PS.sfx.ok(); PS.profiles.setCurrent(list[this.i].id); show('home', { replace: true, fresh: true });
        PS.music.start();
      } else if (a === 'y' && this.i < list.length) {
        keyboard('Rename player', list[this.i].name, v => { if (v.trim()) { list[this.i].name = v.trim().slice(0, 16); PS.profiles.save(list); } this.render(); });
      }
    },
    addProfile() {
      keyboard('New player name', '', v => {
        if (!v.trim()) return;
        const list = PS.profiles.list();
        list.push({ id: 'p' + Date.now().toString(36), name: v.trim().slice(0, 16), avatar: list.length, color: list.length });
        PS.profiles.save(list); this.render();
      });
    }
  };

  // ================================================================== HOME
  const TABS = [
    { id: 'games', name: 'Games' },
    { id: 'multi', name: 'Multiplayer' },
    { id: 'retro', name: 'Retro' }
  ];
  screens.home = {
    tab: 0, i: 0, zone: 'row', ai: 0, si: 0, ti: 0, items: [],
    enter(opts) {
      if (opts && opts.fresh) { this.zone = 'row'; this.i = 0; this.tab = 0; }
      this.build(); this.renderAll();
    },
    build() {
      const all = allGames();
      const st = stats().games;
      const recent = (a, b) => ((st[b.id] && st[b.id].last) || 0) - ((st[a.id] && st[a.id].last) || 0);
      let list;
      const tab = TABS[this.tab].id;
      if (tab === 'games') list = all.filter(g => g.available).sort(recent);
      else if (tab === 'multi') list = all.filter(g => g.available && maxPlayers(g) >= 2).sort(recent);
      else list = all.filter(g => g.type === 'rom').sort((a, b) => (b.available - a.available) || recent(a, b));
      const items = list.map(g => ({ kind: 'game', g }));
      if (tab === 'retro') items.push({ kind: 'add' });
      items.push({ kind: 'library' });
      if (tab !== 'retro') items.push({ kind: 'add' });
      this.items = items;
      if (this.i >= items.length) this.i = items.length - 1;
    },
    renderAll() {
      // tabs
      const tabs = $('tabs'); tabs.innerHTML = '';
      TABS.forEach((t, i) => tabs.appendChild(h('div', 'tab' + (i === this.tab ? ' on' : '') + (this.zone === 'tabs' && i === this.ti ? ' focus' : ''), t.name)));
      // tiles
      const row = $('tileRow'); row.innerHTML = '';
      this.items.forEach((it, i) => {
        let e;
        if (it.kind === 'game') {
          e = h('div', 'tile' + (it.g.available ? '' : ' missing'), `<div class="ring"></div><div class="shine"></div><div class="tl">${esc(it.g.title)}</div><div class="tname">${esc(it.g.title)}</div>` + (it.g.type === 'rom' ? `<div class="badge">${esc(C.SYSTEMS[it.g.system].name.replace('Game Boy Color', 'GBC').replace('Game Boy Advance', 'GBA').replace('Game Boy', 'GB'))}</div>` : ''));
          paintArt(e, it.g, 'cover');
        } else if (it.kind === 'library') e = h('div', 'tile icon', '<div class="ring"></div>' + I.grid + '<div class="tname">Game Library</div>');
        else e = h('div', 'tile icon', '<div class="ring"></div>' + I.plus + '<div class="tname">Add retro games</div>');
        row.appendChild(e);
      });
      this.renderTop();
      this.focus(true);
    },
    renderTop() {
      const p = profile();
      const me = $('me'); me.textContent = (p.name.trim()[0] || '?').toUpperCase(); me.style.background = AV_COLORS[p.color % AV_COLORS.length];
      me.classList.toggle('focus', this.zone === 'top' && this.ti === 2);
      $('padDots').classList.toggle('focus', this.zone === 'top' && this.ti === 0);
      const gear = $('topGear'); if (!gear.innerHTML) gear.innerHTML = I.gear;
      gear.classList.toggle('focus', this.zone === 'top' && this.ti === 1);
      renderPadDots();
      $('tabs').querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('focus', this.zone === 'tabs' && i === this.ti));
    },
    focus(instant) {
      const row = $('tileRow');
      [...row.children].forEach((t, i) => {
        const f = i === this.i && this.zone === 'row';
        t.classList.toggle('focus', f);
        // make room for the title that sits to the right of the focused tile

      });
      // keep the focused tile at the second slot so the row scrolls under it, like a console home
      const step = 141; const offset = Math.max(0, this.i - 1) * step;
      row.style.transition = instant ? 'none' : '';
      row.style.transform = `translateX(${-offset}px)`;
      if (instant) requestAnimationFrame(() => row.style.transition = '');
      const it = this.items[this.i];
      this.renderInfo(it);
      this.renderShelf(it);
      this.renderTop();
    },
    renderInfo(it) {
      const gi = $('gameInfo');
      const g = it && it.kind === 'game' ? it.g : null;
      gi.classList.add('swap');
      clearTimeout(this.swapT);
      this.swapT = setTimeout(() => {
        if (g) {
          setBg(g);
          $('giSystem').textContent = systemLabel(g);
          $('giTitle').textContent = g.title;
          const st = stats().games[g.id];
          $('giMeta').innerHTML = [
            `<span class="chip">${I.players}${esc(g.players)} player${g.players === '1' ? '' : 's'}</span>`,
            `<span class="chip">${esc(g.genre)}</span>`,
            ...(g.modes || []).filter(m => m !== 'Solo').map(m => `<span class="chip">${esc(m)}</span>`),
            st ? `<span class="chip">${I.trophy}${st.plays} plays · ${fmtTime(st.ms)}</span>` : ''
          ].join('');
          $('giBlurb').textContent = g.available ? g.blurb : g.blurb + '  — Add the ROM to play it.';
        } else {
          setBg(null);
          $('giSystem').textContent = '';
          $('giTitle').textContent = it && it.kind === 'library' ? 'Game Library' : 'Add retro games';
          $('giMeta').innerHTML = '';
          $('giBlurb').textContent = it && it.kind === 'library' ? 'Every game on this console, with filters for multiplayer, retro, co-op and more.' : 'Send NES, SNES, Game Boy, GBA, Mega Drive and Master System homebrew from your phone straight to this TV.';
        }
        this.renderActions();
        gi.classList.remove('swap');
      }, 90);
    },
    actions() {
      const it = this.items[this.i];
      if (!it) return [];
      if (it.kind !== 'game') return [{ id: 'open', label: 'Open', icon: I.play, primary: true }];
      if (!it.g.available) return [{ id: 'add', label: 'Add ROM', icon: I.plus, primary: true }, { id: 'info', label: '', icon: I.info, round: true }];
      return [{ id: 'play', label: 'Play', icon: I.play, primary: true }, { id: 'info', label: '', icon: I.info, round: true }];
    },
    renderActions() {
      const box = $('giActions'); box.innerHTML = '';
      this.actions().forEach((a, i) => box.appendChild(h('div', 'btn' + (a.primary ? ' primary' : '') + (a.round ? ' round' : '') + (this.zone === 'actions' && i === this.ai ? ' focus' : ''), a.icon + (a.label ? esc(a.label) : ''))));
    },
    shelfCards(it) {
      const cards = [];
      const n = PS.input.connectedCount();
      cards.push({ id: 'controllers', html: `<h4>Players</h4><div class="big">${n ? n + ' connected' : 'Add players'}</div><div class="small">Scan with a phone</div><div class="mini-qr" data-qr></div>`, wide: false });
      const all = allGames(); const st = stats().games;
      const rec = all.filter(g => st[g.id] && g.available).sort((a, b) => st[b.id].last - st[a.id].last).slice(0, 4);
      cards.push({ id: 'recent', html: `<h4>Recently played</h4>${rec.length ? `<div class="thumbs">${rec.map(g => `<b data-art="${esc(g.id)}"></b>`).join('')}</div>` : '<div class="big">Nothing yet</div><div class="small">Your recent games show up here</div>'}`, wide: true, games: rec });
      if (it && it.kind === 'game') cards.push({ id: 'howto', html: `<h4>How to play</h4><div class="small">${(it.g.controls || []).slice(0, 3).map(esc).join('<br>')}</div>` });
      cards.push({ id: 'party', html: `<h4>Party picks</h4><div class="big">${all.filter(g => g.available && maxPlayers(g) >= 3).length} games</div><div class="small">for 3–4 players</div>` });
      return cards;
    },
    renderShelf(it) {
      const sh = $('shelf'); sh.innerHTML = '';
      this.cards = this.shelfCards(it);
      if (this.si >= this.cards.length) this.si = this.cards.length - 1;
      this.cards.forEach((c, i) => {
        const e = h('div', 'card' + (c.wide ? ' wide' : '') + (c.id === 'controllers' ? ' qr-card' : '') + (this.zone === 'shelf' && i === this.si ? ' focus' : ''), c.html);
        sh.appendChild(e);
        const q = e.querySelector('[data-qr]'); if (q) drawQr(q, PS.net.padUrl(), 3);
        e.querySelectorAll('[data-art]').forEach(b => { const g = allGames().find(x => x.id === b.dataset.art); if (g) paintArt(b, g, 'cover'); });
      });
    },
    nav(a) {
      const z = this.zone;
      if (a === 'home') return openCC();
      if (a === 'back') {
        if (z !== 'row') { this.zone = 'row'; PS.sfx.back(); return this.focus(); }
        return exitPrompt();
      }
      if (z === 'row') {
        if (a === 'left' && this.i > 0) { this.i--; PS.sfx.move(); this.focus(); }
        else if (a === 'right' && this.i < this.items.length - 1) { this.i++; PS.sfx.move(); this.focus(); }
        else if (a === 'up') { this.zone = 'tabs'; this.ti = this.tab; PS.sfx.tick(); this.focus(); }
        else if (a === 'down') { this.zone = 'actions'; this.ai = 0; PS.sfx.tick(); this.focus(); }
        else if (a === 'ok' || a === 'start') this.activate(this.actions()[0].id);
        else if (a === 'x' || a === 'y') { const it = this.items[this.i]; if (it.kind === 'game') openHub(it.g); }
        else if (a === 'lb' || a === 'rb') this.switchTab(this.tab + (a === 'rb' ? 1 : -1));
      } else if (z === 'actions') {
        const n = this.actions().length;
        if (a === 'left' && this.ai > 0) { this.ai--; PS.sfx.move(); this.renderActions(); }
        else if (a === 'right' && this.ai < n - 1) { this.ai++; PS.sfx.move(); this.renderActions(); }
        else if (a === 'up') { this.zone = 'row'; PS.sfx.tick(); this.focus(); }
        else if (a === 'down') { this.zone = 'shelf'; this.si = 0; PS.sfx.tick(); this.renderActions(); this.renderShelf(this.items[this.i]); }
        else if (a === 'ok') this.activate(this.actions()[this.ai].id);
      } else if (z === 'shelf') {
        if (a === 'left' && this.si > 0) { this.si--; PS.sfx.move(); this.renderShelf(this.items[this.i]); }
        else if (a === 'right' && this.si < this.cards.length - 1) { this.si++; PS.sfx.move(); this.renderShelf(this.items[this.i]); }
        else if (a === 'up') { this.zone = 'actions'; PS.sfx.tick(); this.renderShelf(this.items[this.i]); this.renderActions(); }
        else if (a === 'ok') {
          const c = this.cards[this.si]; PS.sfx.ok();
          if (c.id === 'controllers') show('controllers');
          else if (c.id === 'recent' && c.games && c.games.length) openHub(c.games[0]);
          else if (c.id === 'howto') openHub(this.items[this.i].g);
          else if (c.id === 'party') show('library', { filter: 'party' });
          else if (c.id === 'recent') show('library');
        }
      } else if (z === 'tabs') {
        if (a === 'left') { if (this.ti > 0) { this.ti--; PS.sfx.move(); this.switchTab(this.ti, true); } }
        else if (a === 'right') {
          if (this.ti < TABS.length - 1) { this.ti++; PS.sfx.move(); this.switchTab(this.ti, true); }
          else { this.zone = 'top'; this.ti = 0; PS.sfx.move(); this.renderTop(); }
        }
        else if (a === 'down' || a === 'ok') { this.zone = 'row'; PS.sfx.tick(); this.focus(); }
      } else if (z === 'top') {
        if (a === 'left') { if (this.ti > 0) { this.ti--; PS.sfx.move(); this.renderTop(); } else { this.zone = 'tabs'; this.ti = TABS.length - 1; PS.sfx.move(); this.renderTop(); } }
        else if (a === 'right' && this.ti < 2) { this.ti++; PS.sfx.move(); this.renderTop(); }
        else if (a === 'down') { this.zone = 'row'; PS.sfx.tick(); this.focus(); }
        else if (a === 'ok') { PS.sfx.ok(); show(['controllers', 'settings', 'profiles'][this.ti]); }
      }
    },
    switchTab(t, keepZone) {
      t = (t + TABS.length) % TABS.length;
      if (t === this.tab && !keepZone) return;
      this.tab = t; this.i = 0; if (!keepZone) this.zone = 'row';
      PS.sfx.tick(); this.build(); this.renderAll();
    },
    activate(id) {
      const it = this.items[this.i];
      const tile = $('tileRow').children[this.i]; if (tile && this.zone === 'row') { tile.classList.add('pressed'); setTimeout(() => tile.classList.remove('pressed'), 140); }
      if (!it) return;
      if (it.kind === 'library') { PS.sfx.ok(); return show('library'); }
      if (it.kind === 'add' || id === 'add') { PS.sfx.ok(); return show('addgames'); }
      if (id === 'info') return openHub(it.g);
      if (id === 'play') return PS.host.launch(it.g);
    }
  };

  function renderPadDots() {
    const box = $('padDots'); if (!box) return;
    box.innerHTML = '';
    PS.input.slots.forEach((s, i) => {
      const d = h('div', 'pad-dot' + (s ? (s.connected ? ' on' : ' off') : ''), s ? (s.kind === 'phone' ? I.phone : I.pad) : I.pad);
      if (s) d.style.background = s.color;
      box.appendChild(d);
    });
  }

  let exitAt = 0;
  function exitPrompt() {
    if (Date.now() - exitAt < 2200) { if (window.PSAndroid && PSAndroid.exit) PSAndroid.exit(); return; }
    exitAt = Date.now();
    toast('Press Back again to exit', 'or press Menu for the Control Center', '#444', I.power);
  }

  // ================================================================== HUB
  let hubGame = null;
  function openHub(g) { hubGame = g; PS.sfx.open(); show('hub'); }
  PS.ui.openHub = openHub;
  screens.hub = {
    zone: 'actions', ai: 0, ci: 0,
    enter() { this.zone = 'actions'; this.ai = 0; this.ci = 0; this.render(); },
    actions() {
      const g = hubGame;
      if (!g.available) return [{ id: 'add', label: 'Add ROM', icon: I.plus, primary: true }];
      const a = [{ id: 'play', label: 'Play', icon: I.play, primary: true }, { id: 'more', label: '', icon: I.dots, round: true }];
      if (g.type === 'rom' && PS.host.hasState(g)) a.push({ id: 'resume', label: 'Continue from save', icon: I.load });
      if (g.user) a.push({ id: 'delete', label: 'Remove', icon: I.quit });
      return a;
    },
    render() {
      const g = hubGame; setBg(g);
      $('hubSystem').textContent = systemLabel(g);
      $('hubTitle').textContent = g.title;
      $('hubMeta').innerHTML = [`<span class="chip">${I.players}${esc(g.players)} player${g.players === '1' ? '' : 's'}</span>`, `<span class="chip">${esc(g.genre)}</span>`, ...(g.modes || []).filter(m => m !== 'Solo').map(m => `<span class="chip">${esc(m)}</span>`)].join('');
      const box = $('hubActions'); box.innerHTML = '';
      this.actions().forEach((a, i) => box.appendChild(h('div', 'btn' + (a.primary ? ' primary' : '') + (a.round ? ' round' : '') + (this.zone === 'actions' && i === this.ai ? ' focus' : ''), a.icon + esc(a.label))));
      const st = stats().games[g.id];
      $('hubMini').innerHTML = `<b></b>${esc(g.title)}`; paintArt($('hubMini').firstChild, g, 'cover');
      $('hubTime').innerHTML = I.clock + (st ? fmtTime(st.ms) : '0 min');
      const cards = [
        `<h4>About</h4><p>${esc(g.blurb)}</p>`,
        `<h4>Controls</h4><ul>${(g.controls || []).map(c => `<li>${esc(c)}</li>`).join('')}</ul>`,
        `<h4>Your stats</h4>${st ? `<div class="stat">${st.plays}<small>plays</small></div><div class="stat">${fmtTime(st.ms)}<small>played</small></div><p>Last played ${ago(st.last)}</p>` : '<p>Not played yet. Press Play to start.</p>'}`,
        `<h4>Credits &amp; licence</h4><p><b>${esc(g.credits || '—')}</b></p><p>${esc(g.license || '')}</p>${g.source ? `<p><a>${esc(g.source)}</a></p>` : ''}${g.available || g.type !== 'rom' ? '' : `<p>File name: <b>${esc(g.rom)}</b></p>`}`
      ];
      const cb = $('hubCards'); cb.innerHTML = '';
      cards.forEach((c, i) => cb.appendChild(h('div', 'hcard' + (this.zone === 'cards' && i === this.ci ? ' focus' : ''), c)));
    },
    nav(a) {
      if (a === 'home') return openCC();
      if (a === 'back') return back();
      if (this.zone === 'actions') {
        const n = this.actions().length;
        if (a === 'left' && this.ai > 0) { this.ai--; PS.sfx.move(); }
        else if (a === 'right' && this.ai < n - 1) { this.ai++; PS.sfx.move(); }
        else if (a === 'down') { this.zone = 'cards'; PS.sfx.tick(); }
        else if (a === 'ok' || a === 'start') {
          const act = this.actions()[this.ai].id;
          if (act === 'play') return PS.host.launch(hubGame);
          if (act === 'more') { this.zone = 'cards'; this.ci = 0; PS.sfx.tick(); return this.render(); }
          if (act === 'resume') return PS.host.launch(hubGame, { loadState: true });
          if (act === 'add') { PS.sfx.ok(); return show('addgames'); }
          if (act === 'delete') { PS.net.deleteRom(hubGame.file).then(() => { refreshRoms(); back(); }); return; }
        } else return;
      } else {
        if (a === 'left' && this.ci > 0) { this.ci--; PS.sfx.move(); }
        else if (a === 'right' && this.ci < 3) { this.ci++; PS.sfx.move(); }
        else if (a === 'up') { this.zone = 'actions'; PS.sfx.tick(); }
        else return;
      }
      this.render();
    }
  };

  // ================================================================== LIBRARY
  const FILTERS = [
    { id: 'all', name: 'All', f: () => true },
    { id: 'multi', name: 'Multiplayer', f: g => maxPlayers(g) >= 2 },
    { id: 'party', name: 'Party (3–4)', f: g => maxPlayers(g) >= 3 },
    { id: 'coop', name: 'Co-op', f: g => (g.tags || []).includes('coop') },
    { id: 'retro', name: 'Retro', f: g => g.type === 'rom' },
    { id: 'shooter', name: 'Shooters', f: g => (g.tags || []).includes('shooter') },
    { id: 'platformer', name: 'Platformers', f: g => (g.tags || []).includes('platformer') },
    { id: 'puzzle', name: 'Puzzle', f: g => (g.tags || []).includes('puzzle') },
    { id: 'original', name: 'Originals', f: g => g.type === 'original' }
  ];
  screens.library = {
    fi: 0, i: 0, zone: 'grid',
    enter(opts) {
      if (opts && opts.filter) this.fi = Math.max(0, FILTERS.findIndex(f => f.id === opts.filter));
      if (!(opts && opts.back)) { this.i = 0; this.zone = 'grid'; }
      this.render();
    },
    list() { return allGames().filter(FILTERS[this.fi].f).sort((a, b) => (b.available - a.available)); },
    render() {
      const chips = $('libChips'); chips.innerHTML = '';
      FILTERS.forEach((f, i) => chips.appendChild(h('div', 'chip' + (i === this.fi ? ' on' : '') + (this.zone === 'chips' && i === this.fi ? ' focus' : ''), esc(f.name))));
      const list = this.items = this.list();
      $('libCount').textContent = list.filter(g => g.available).length + ' playable · ' + list.length + ' total';
      const grid = $('libGrid'); grid.innerHTML = '';
      if (this.i >= list.length) this.i = Math.max(0, list.length - 1);
      list.forEach((g, i) => {
        const e = h('div', 'lg' + (g.available ? '' : ' missing') + (this.zone === 'grid' && i === this.i ? ' focus' : ''), `<div class="cv">${esc(g.title)}</div><div class="nm">${esc(g.title)}</div><div class="sb">${esc(systemLabel(g))}${g.available ? '' : ' · add ROM'}</div>`);
        paintArt(e.firstChild, g, 'cover');
        grid.appendChild(e);
      });
      this.scroll();
    },
    focus() { [...$('libGrid').children].forEach((e, i) => e.classList.toggle('focus', this.zone === 'grid' && i === this.i)); this.scroll(); },
    scroll() { const r = Math.floor(this.i / 5); $('libGrid').style.transform = `translateY(${-Math.max(0, r - 1) * 314}px)`; },
    nav(a) {
      const n = this.items.length, c = 5;
      if (a === 'home') return openCC();
      if (a === 'back') return back();
      if (a === 'lb' || a === 'rb') { this.fi = (this.fi + (a === 'rb' ? 1 : -1) + FILTERS.length) % FILTERS.length; this.i = 0; PS.sfx.tick(); return this.render(); }
      if (this.zone === 'chips') {
        if (a === 'left') { this.fi = (this.fi - 1 + FILTERS.length) % FILTERS.length; this.i = 0; PS.sfx.move(); this.render(); }
        else if (a === 'right') { this.fi = (this.fi + 1) % FILTERS.length; this.i = 0; PS.sfx.move(); this.render(); }
        else if ((a === 'down' || a === 'ok') && n) { this.zone = 'grid'; PS.sfx.tick(); this.render(); }
        return;
      }
      if (a === 'left' && this.i % c > 0) { this.i--; PS.sfx.move(); this.focus(); }
      else if (a === 'right' && this.i < n - 1 && this.i % c < c - 1) { this.i++; PS.sfx.move(); this.focus(); }
      else if (a === 'down' && this.i + c < n) { this.i += c; PS.sfx.move(); this.focus(); }
      else if (a === 'down' && Math.floor(this.i / c) < Math.floor((n - 1) / c)) { this.i = n - 1; PS.sfx.move(); this.focus(); }
      else if (a === 'up' && this.i - c >= 0) { this.i -= c; PS.sfx.move(); this.focus(); }
      else if (a === 'up') { this.zone = 'chips'; PS.sfx.tick(); this.render(); }
      else if (a === 'ok' || a === 'x') { const g = this.items[this.i]; if (!g) return; if (a === 'ok' && g.available) PS.host.launch(g); else openHub(g); }
    }
  };

  // ================================================================== CONTROLLERS
  function drawQr(el, text, cell) {
    try {
      const q = qrcode(0, 'M'); q.addData(text); q.make();
      el.innerHTML = q.createSvgTag({ cellSize: cell || 6, margin: 0, scalable: true });
    } catch (e) { el.textContent = text; }
  }
  PS.ui.drawQr = drawQr;
  screens.controllers = {
    i: 0,
    async enter() { await PS.net.refreshInfo(); this.render(); },
    render() {
      drawQr($('qrBig'), PS.net.padUrl(), 8);
      $('ctlUrl').textContent = PS.net.padUrl().replace(/\?k=.*/, '');
      $('ctlPin').textContent = PS.net.info.key || '—';
      const g = $('slotGrid'); g.innerHTML = '';
      PS.input.slots.forEach((s, i) => {
        const on = s && s.connected;
        const e = h('div', 'slot' + (on ? ' on' : s ? ' off' : '') + (i === this.i ? ' focus' : ''), `<div class="sn" style="color:${PS.input.COLORS[i]}">PLAYER ${i + 1}</div><div class="sd">${s ? esc(s.name) : 'Empty'}</div><div class="sk">${on ? (s.kind === 'phone' ? 'Phone controller' : 'Controller') : s ? 'Disconnected — rejoin to take this slot back' : 'Press A on any controller'}</div>${s ? (s.kind === 'phone' ? I.phone : I.pad) : ''}`);
        if (on) e.style.background = `linear-gradient(135deg, ${PS.input.COLORS[i]}44, rgba(255,255,255,.05))`;
        g.appendChild(e);
      });
    },
    nav(a) {
      if (a === 'home') return openCC();
      if (a === 'back') return back();
      const m = { left: -1, right: 1, up: -2, down: 2 }[a];
      if (m) { const n = this.i + m; if (n >= 0 && n < 4 && !(a === 'left' && this.i % 2 === 0) && !(a === 'right' && this.i % 2 === 1)) { this.i = n; PS.sfx.move(); this.render(); } }
      if (a === 'x') { PS.input.freeSlot(this.i); PS.sfx.back(); this.render(); }
    }
  };

  // ================================================================== ADD GAMES
  screens.addgames = {
    i: 0,
    async enter() {
      await PS.net.refreshInfo();
      drawQr($('qrAdd'), PS.net.padUrl() + '&tab=add', 7);
      const folder = window.PSAndroid && PSAndroid.romFolder ? PSAndroid.romFolder() : '';
      $('romFolder').innerHTML = folder ? `Or copy files with a USB drive or file manager into <b>${esc(folder)}</b>` : '';
      await refreshRoms(); this.render();
    },
    render() {
      const box = $('romList'); box.innerHTML = '';
      if (!romFiles.length) { box.appendChild(h('div', 'rom-empty', 'No ROMs yet.')); return; }
      if (this.i >= romFiles.length) this.i = romFiles.length - 1;
      const start = Math.max(0, Math.min(this.i - 2, romFiles.length - 5));
      romFiles.slice(start, start + 5).forEach((f, k) => {
        const i = start + k;
        box.appendChild(h('div', 'rom' + (i === this.i ? ' focus' : ''), `${esc(f.name)}<span>${(f.size / 1024).toFixed(0)} KB</span>`));
      });
    },
    nav(a) {
      if (a === 'home') return openCC();
      if (a === 'back') return back();
      if (a === 'up' && this.i > 0) { this.i--; PS.sfx.move(); this.render(); }
      else if (a === 'down' && this.i < romFiles.length - 1) { this.i++; PS.sfx.move(); this.render(); }
      else if (a === 'x' && romFiles[this.i]) { const f = romFiles[this.i]; PS.net.deleteRom(f.name).then(() => refreshRoms().then(() => this.render())); PS.sfx.back(); toast('Removed', f.name, '#ff4d5e', I.quit); }
    }
  };

  async function refreshRoms() {
    romFiles = await PS.net.roms();
    if (current === 'home') { screens.home.build(); screens.home.renderAll(); }
    if (current === 'library') screens.library.render();
    if (current === 'addgames') screens.addgames.render();
    return romFiles;
  }
  document.addEventListener('ps-roms', () => { refreshRoms().then(() => toast('New game added', 'Sent from a phone', '#3ddc84', I.plus)); });

  // ================================================================== SETTINGS
  const LITE = ['auto', 'on', 'off'];
  const LITE_LABEL = { auto: 'Auto', on: 'Lite (faster)', off: 'Full effects' };
  screens.settings = {
    i: 0, scroll: 0,
    items() {
      const s = PS.settings;
      return [
        { id: 'sound', name: 'UI sounds', val: s.sound ? 'On' : 'Off', desc: '<h3>UI sounds</h3><p>Clicks, swooshes and the startup chime. All sounds are made live by PS10,000 — no sound files.</p>' },
        { id: 'music', name: 'Home music', val: s.music ? 'On' : 'Off', desc: '<h3>Home music</h3><p>A soft ambient pad that plays on the home screen and stops during games.</p>' },
        { id: 'volume', name: 'Volume', val: Math.round(s.volume * 100) + '%', desc: '<h3>Volume</h3><p>Volume of menu sounds and music. Game volume follows the TV.</p>' },
        { id: 'lite', name: 'Visual effects', val: LITE_LABEL[s.lite], desc: `<h3>Visual effects</h3><p><b>Auto</b> switches to Lite on TVs with less than 1.6 GB RAM. This TV reports ${PS.device.memMB ? Math.round(PS.device.memMB) + ' MB' : 'unknown memory'} — currently <b>${PS.isLite() ? 'Lite' : 'Full'}</b>.</p><p>Lite turns off moving backgrounds and shadows so menus stay smooth.</p>` },
        { id: 'fps', name: 'Show FPS counter', val: s.fps ? 'On' : 'Off', desc: '<h3>FPS counter</h3><p>Shows frames per second in the corner. Useful to check smoothness on this TV.</p>' },
        { id: 'about', name: 'About this console', val: '', desc: `<h3>PS10,000</h3><p>Version 1.0 · ${allGames().filter(g => g.available).length} games ready</p><p>TV address: ${esc(PS.net.info.ip || '—')}:${esc(PS.net.info.port || '')}</p><p>Memory: ${PS.device.memMB ? Math.round(PS.device.memMB) + ' MB' : 'unknown'} · ${PS.device.android ? 'Android TV app' : 'Browser'}</p><p>A private console for friends. Not affiliated with any console maker.</p>` },
        { id: 'licenses', name: 'Licences & credits', val: '', desc: licenseHtml(), scroll: true },
        { id: 'reset', name: 'Reset stats for this player', val: '', desc: '<h3>Reset stats</h3><p>Clears play counts and play time for the current player. Saves are kept.</p><p>Press A twice to confirm.</p>' }
      ];
    },
    enter() { this.scroll = 0; this.render(); },
    render() {
      const list = $('setList'); list.innerHTML = '';
      const items = this.items();
      items.forEach((it, i) => list.appendChild(h('div', 'set-item' + (i === this.i ? ' focus' : ''), `${esc(it.name)}<span class="val">${esc(it.val)}</span>`)));
      const d = $('setDetail'); d.innerHTML = `<div class="set-scroll">${items[this.i].desc}</div>`;
      d.firstChild.style.transform = `translateY(${-this.scroll}px)`;
    },
    nav(a) {
      if (a === 'home') return openCC();
      if (a === 'back') { if (this.scroll) { this.scroll = 0; return this.render(); } return back(); }
      const items = this.items(); const it = items[this.i]; const s = PS.settings;
      if (it.scroll && (a === 'right' || a === 'left')) { this.scroll = Math.max(0, this.scroll + (a === 'right' ? 400 : -400)); return this.render(); }
      if (a === 'up' && this.i > 0) { this.i--; this.scroll = 0; PS.sfx.move(); }
      else if (a === 'down' && this.i < items.length - 1) { this.i++; this.scroll = 0; PS.sfx.move(); }
      else if (a === 'ok' || ((a === 'left' || a === 'right') && it.id === 'volume')) {
        if (it.id === 'sound') s.sound = !s.sound;
        else if (it.id === 'music') { s.music = !s.music; s.music ? PS.music.start() : PS.music.stop(); }
        else if (it.id === 'volume') { s.volume = Math.round(Math.min(1, Math.max(0, s.volume + (a === 'left' ? -0.1 : 0.1))) * 10) / 10; if (a === 'ok') s.volume = s.volume >= 1 ? 0.1 : s.volume; }
        else if (it.id === 'lite') { s.lite = LITE[(LITE.indexOf(s.lite) + 1) % LITE.length]; applyLite(); }
        else if (it.id === 'fps') { s.fps = !s.fps; $('fps').style.display = s.fps ? 'block' : 'none'; }
        else if (it.id === 'licenses') { this.scroll += 400; }
        else if (it.id === 'reset') { if (this.confirm) { PS.profiles.saveStats(profile().id, { games: {} }); toast('Stats cleared', profile().name, '#ff4d5e', I.trophy); this.confirm = false; } else { this.confirm = true; toast('Press A again to clear stats', '', '#444', I.trophy); setTimeout(() => this.confirm = false, 2500); } }
        PS.saveSettings(); PS.sfx.ok();
      }
      this.render();
    }
  };
  function licenseHtml() {
    const g = allGames().filter(x => !x.user);
    return `<h3>Licences &amp; credits</h3><p class="lic">Press Right to scroll.</p><ul class="lic">` +
      g.map(x => `<li><b>${esc(x.title)}</b> — ${esc(x.credits)} · ${esc(x.license)}${x.source ? ' · ' + esc(x.source) : ''}</li>`).join('') +
      `<li><b>EmulatorJS 4.2.3</b> — GPL-3.0 · github.com/EmulatorJS/EmulatorJS (cores: FCEUmm, Snes9x, Gambatte, mGBA, Genesis Plus GX, SMS Plus — GPL / non-commercial licences)</li>` +
      `<li><b>Source Sans 3</b> typeface — Adobe · SIL Open Font License 1.1</li>` +
      `<li><b>qrcode-generator</b> — Kazuhiko Arase · MIT</li>` +
      `<li><b>Launcher layout</b> — based on WPS5 by angelvc25, used with permission</li>` +
      `<li><b>PS10,000</b> launcher, originals, sounds and icons — made for this console</li></ul>`;
  }

  function applyLite() {
    const lite = PS.isLite();
    document.body.classList.toggle('lite', lite);
    document.body.classList.toggle('fx', !lite);
  }

  // ================================================================== CONTROL CENTER (also the pause menu)
  const cc = { open: false, zone: 'bar', i: 0, gi: 0 };
  function ccButtons() {
    return [
      { id: 'home', name: 'Home', icon: I.home },
      { id: 'library', name: 'Library', icon: I.grid },
      { id: 'controllers', name: 'Controllers', icon: I.pad },
      { id: 'addgames', name: 'Add games', icon: I.plus },
      { id: 'settings', name: 'Settings', icon: I.gear },
      { id: 'profiles', name: 'Switch player', icon: I.user },
      { id: 'power', name: 'Exit', icon: I.power }
    ];
  }
  function ccGameActions() {
    const g = PS.host.running;
    if (!g) return [];
    const a = [{ id: 'resume', name: 'Resume', icon: I.resume, primary: true }];
    if (g.type === 'rom') a.push({ id: 'save', name: 'Save state', icon: I.save }, { id: 'load', name: 'Load state', icon: I.load });
    a.push({ id: 'restart', name: 'Restart', icon: I.restart }, { id: 'quit', name: 'Quit game', icon: I.quit });
    return a;
  }
  function openCC() {
    cc.open = true; cc.i = 0; cc.gi = 0;
    cc.zone = PS.host.running ? 'game' : 'bar';
    PS.host.pause(true);
    PS.input.setNav(true);
    // take keyboard / remote focus back from the game frame so the menu can be navigated
    try { $('gameFrame').blur(); window.focus(); document.body.focus(); } catch (e) {}
    PS.sfx.open();
    renderCC();
    $('cc').classList.add('active');
  }
  function closeCC(resume) {
    cc.open = false; $('cc').classList.remove('active'); PS.sfx.close();
    if (resume && PS.host.running) { PS.host.pause(false); }
  }
  PS.ui.openCC = openCC;
  function renderCC() {
    const g = PS.host.running;
    const gb = $('ccGame');
    if (g) {
      gb.classList.add('on');
      gb.innerHTML = `<div class="cv"></div><div><h3>${esc(g.title)}</h3><p>${esc(systemLabel(g))} · paused · ${PS.input.connectedCount()} player${PS.input.connectedCount() === 1 ? '' : 's'} connected</p><div class="cc-actions">${ccGameActions().map((a, i) => `<div class="btn${a.primary ? ' primary' : ''}${cc.zone === 'game' && i === cc.gi ? ' focus' : ''}">${a.icon}${esc(a.name)}</div>`).join('')}</div></div>`;
      paintArt(gb.querySelector('.cv'), g, 'cover');
    } else gb.classList.remove('on');
    $('ccBar').innerHTML = ccButtons().map((b, i) => `<div class="cc-btn${cc.zone === 'bar' && i === cc.i ? ' focus' : ''}"><span class="cc-ic">${b.icon}</span>${esc(b.name)}</div>`).join('');
  }
  function ccNav(a) {
    if (a === 'back' || a === 'home') return closeCC(true);
    if (cc.zone === 'game') {
      const acts = ccGameActions();
      if (a === 'left' && cc.gi > 0) { cc.gi--; PS.sfx.move(); }
      else if (a === 'right' && cc.gi < acts.length - 1) { cc.gi++; PS.sfx.move(); }
      else if (a === 'down') { cc.zone = 'bar'; PS.sfx.tick(); }
      else if (a === 'ok') {
        const id = acts[cc.gi].id; PS.sfx.ok();
        if (id === 'resume') return closeCC(true);
        if (id === 'save') { PS.host.saveState(); return closeCC(true); }
        if (id === 'load') { PS.host.loadState(); return closeCC(true); }
        if (id === 'restart') { closeCC(false); return PS.host.restart(); }
        if (id === 'quit') { closeCC(false); return PS.host.quit(); }
      }
    } else {
      const bs = ccButtons();
      if (a === 'left' && cc.i > 0) { cc.i--; PS.sfx.move(); }
      else if (a === 'right' && cc.i < bs.length - 1) { cc.i++; PS.sfx.move(); }
      else if (a === 'up' && PS.host.running) { cc.zone = 'game'; PS.sfx.tick(); }
      else if (a === 'ok') {
        const id = bs[cc.i].id; PS.sfx.ok();
        if (id === 'power') { if (window.PSAndroid && PSAndroid.exit) PSAndroid.exit(); else toast('Close the app with the TV Home button', '', '#444', I.power); return; }
        closeCC(false);
        if (PS.host.running) PS.host.quit(true);
        history.length = 0;
        if (id === 'home') show('home', { replace: true });
        else { if (current !== 'home') show('home', { replace: true }); show(id); }
        return;
      }
    }
    renderCC();
  }

  // ================================================================== ON-SCREEN KEYBOARD
  const osk = { open: false, i: 0, val: '', cb: null };
  const OSK_KEYS = '1234567890QWERTYUIOPASDFGHJKL-ZXCVBNM_.'.split('').concat(['SPACE', 'DEL', 'DONE']);
  function keyboard(title, val, cb) {
    osk.open = true; osk.i = 10; osk.val = val || ''; osk.cb = cb;
    $('oskTitle').textContent = title; renderOsk(); $('osk').classList.add('active'); PS.sfx.open();
  }
  function renderOsk() {
    $('oskField').textContent = osk.val;
    $('oskKeys').innerHTML = OSK_KEYS.map((k, i) => `<div class="osk-k${k.length > 1 ? ' wide' : ''}${i === osk.i ? ' focus' : ''}">${k === 'SPACE' ? 'Space' : k === 'DEL' ? '⌫ Delete' : k === 'DONE' ? 'Done' : k}</div>`).join('');
  }
  function oskNav(a) {
    const cols = 10;
    // map index -> grid col (wide keys take 2 columns in the last row)
    const n = OSK_KEYS.length;
    if (a === 'back') { osk.open = false; $('osk').classList.remove('active'); PS.sfx.close(); return; }
    if (a === 'left' && osk.i > 0) osk.i--;
    else if (a === 'right' && osk.i < n - 1) osk.i++;
    else if (a === 'down') osk.i = Math.min(n - 1, osk.i + cols);
    else if (a === 'up' && osk.i >= cols) osk.i = osk.i >= 40 ? osk.i - 9 - (osk.i - 39) : osk.i - cols;
    else if (a === 'x') osk.val = osk.val.slice(0, -1);
    else if (a === 'ok' || a === 'start') {
      const k = OSK_KEYS[osk.i];
      if (k === 'DONE' || a === 'start') { osk.open = false; $('osk').classList.remove('active'); PS.sfx.ok(); osk.cb && osk.cb(osk.val); return; }
      if (k === 'DEL') osk.val = osk.val.slice(0, -1);
      else if (osk.val.length < 16) osk.val += k === 'SPACE' ? ' ' : (osk.val.length && osk.val.slice(-1) !== ' ' ? k.toLowerCase() : k);
    } else return;
    PS.sfx.move(); renderOsk();
  }

  // ================================================================== nav routing
  PS.input.on('nav', ev => {
    if (osk.open) return oskNav(ev.action);
    if (cc.open) return ccNav(ev.action);
    if (current === 'player') { if (ev.action === 'home' || ev.action === 'back') openCC(); return; }
    const s = screens[current];
    if (s && s.nav) s.nav(ev.action);
  });
  PS.input.on('home', () => { if (current === 'player' && !cc.open) openCC(); });
  PS.input.on('joined', s => {
    PS.sfx.join();
    toast(`Player ${s.index + 1} joined`, s.name, s.color, s.kind === 'phone' ? I.phone : I.pad);
    PS.input.setPhoneLayout(PS.host.running ? PS.host.layoutFor(PS.host.running) : 'menu');
  });
  PS.input.on('left', s => { PS.sfx.leave(); toast(`Player ${s.index + 1} left`, s.name, '#555', s.kind === 'phone' ? I.phone : I.pad); });
  PS.input.on('slots', () => {
    renderPadDots();
    if (current === 'controllers') screens.controllers.render();
    if (current === 'home' && screens.home.zone !== 'shelf') screens.home.renderShelf(screens.home.items[screens.home.i]);
  });
  PS.input.on('phone', () => PS.input.setPhoneLayout(PS.host.running ? PS.host.layoutFor(PS.host.running) : 'menu'));

  // ================================================================== clock / fps / start
  function tickClock() {
    const d = new Date(), hh = d.getHours() % 12 || 12, mm = d.getMinutes().toString().padStart(2, '0'), ap = d.getHours() < 12 ? 'AM' : 'PM';
    $('clock').innerHTML = `${hh}:${mm}<small>${ap}</small>`;
    $('clock2').textContent = `${hh}:${mm} ${ap}`;
  }
  // soft out-of-focus lights behind the user picker
  function buildBokeh() {
    const b = $('bokeh'); if (b.childElementCount) return;
    const n = PS.isLite() ? 24 : 46;
    for (let i = 0; i < n; i++) {
      const e = document.createElement('i'), sz = 4 + Math.random() * (i % 7 === 0 ? 46 : 14);
      e.style.cssText = `left:${Math.random() * 100}%;top:${30 + Math.random() * 70}%;width:${sz}px;height:${sz}px;opacity:${0.25 + Math.random() * 0.6};--d:${10 + Math.random() * 14}s;--dx:${(Math.random() - .5) * 60}px;--dy:${-10 - Math.random() * 40}px`;
      b.appendChild(e);
    }
  }
  setInterval(tickClock, 5000); tickClock();
  let frames = 0, lastF = performance.now();
  (function fpsLoop(t) { frames++; if (t - lastF >= 1000) { if (PS.settings.fps) $('fps').textContent = frames + ' fps'; frames = 0; lastF = t; } requestAnimationFrame(fpsLoop); })(performance.now());
  $('fps').style.display = PS.settings.fps ? 'block' : 'none';

  applyLite();
  PS.net.connect();
  PS.net.refreshInfo();
  refreshRoms();
  document.addEventListener('visibilitychange', () => { if (document.hidden) PS.music.stop(); else if (current !== 'player' && current !== 'boot') PS.music.start(); });
  show('boot', { replace: true });
})();
