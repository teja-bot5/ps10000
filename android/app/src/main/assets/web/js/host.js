/* PS10,000 game host: launches games in one iframe, pause / resume, save states, play-time tracking. */
(function () {
  const $ = id => document.getElementById(id);
  const frame = $('gameFrame');
  let running = null, startedAt = 0, cfg = null, launchOpts = {};

  function stateKey(g) { const p = PS.profiles.current(); return (p ? p.id : 'p1') + ':' + g.id; }
  const savedStates = PS.store.get('states', {});

  function layoutFor(g) {
    if (!g) return 'menu';
    if (g.type === 'rom') return 'retro';
    if (g.input && g.input.aim) return 'twin';
    if (g.id === 'jet-rush') return 'onebutton';
    return 'modern';
  }

  function urlFor(g, opts) {
    if (g.type === 'rom') {
      const q = new URLSearchParams({ system: PS_CATALOG.EJS[g.system], core: PS_CATALOG.SYSTEMS[g.system].core, rom: '/roms/' + g.file, id: stateKey(g), lite: PS.isLite() ? 1 : 0 });
      if (opts && opts.loadState) q.set('load', '1');
      return 'emu/player.html?' + q.toString();
    }
    return g.url;
  }

  function launch(g, opts) {
    if (!g || !g.available) return;
    launchOpts = opts || {};
    running = g; cfg = g.input || { mode: 'pad' }; startedAt = Date.now();
    PS.sfx.launch();
    PS.music.stop();
    PS.input.setNav(false);
    PS.input.setPhoneLayout(layoutFor(g));
    $('loadingText').textContent = 'Starting ' + g.title;
    $('loading').classList.remove('hide');
    PS.ui.show('player');
    setTimeout(() => { frame.src = urlFor(g, launchOpts); }, 350);
  }

  frame.addEventListener('load', () => {
    if (!running || frame.src === 'about:blank' || !frame.src) return;
    try { inject(frame.contentWindow); } catch (e) { console.warn('shim inject failed', e); }
    setTimeout(() => $('loading').classList.add('hide'), 450);
    try { frame.contentWindow.focus(); } catch (e) {}
  });

  function inject(w) {
    if (!w || w.__ps10k) return;
    w.PS_GAME_CFG = Object.assign({}, cfg, { hide: running.hide || null, fit: running.fit || null });
    const d = w.document;
    if (w.__ps10kShimLoaded) return; // the emulator page loads the shim itself
    const s = d.createElement('script');
    s.src = '/shim/shim.js';
    (d.head || d.documentElement).appendChild(s);
  }

  function pause(on) {
    const w = frame.contentWindow;
    if (!running || !w) return;
    try { if (w.PSShim) w.PSShim.pause(on); } catch (e) {}
    try { if (w.PSEmu) w.PSEmu.pause(on); } catch (e) {}
    if (!on) { PS.input.setNav(false); try { w.focus(); } catch (e) {} }
  }

  function quit(silent) {
    if (!running) return;
    const g = running, ms = Date.now() - startedAt;
    if (ms > 5000) PS.ui.recordPlay(g, ms);
    try { const w = frame.contentWindow; if (w && w.PSEmu) w.PSEmu.autosave(); } catch (e) {}
    running = null;
    setTimeout(() => { frame.src = 'about:blank'; }, 60);
    PS.input.setNav(true);
    PS.input.setPhoneLayout('menu');
    if (!silent) { PS.ui.show('home', { replace: true }); PS.music.start(); }
    else PS.music.start();
  }

  function restart() {
    if (!running) return;
    $('loading').classList.remove('hide');
    PS.input.setNav(false);
    const u = urlFor(running, {});
    frame.src = 'about:blank';
    setTimeout(() => { frame.src = u; }, 120);
  }

  function saveState() {
    const w = frame.contentWindow;
    if (w && w.PSEmu) w.PSEmu.save().then(ok => { if (ok) { savedStates[stateKey(running)] = Date.now(); PS.store.set('states', savedStates); PS.ui.toast('State saved', running.title, '#3ddc84', PS.icons.save); } else PS.ui.toast('Could not save', '', '#ff4d5e', PS.icons.save); });
  }
  function loadState() {
    const w = frame.contentWindow;
    if (w && w.PSEmu) w.PSEmu.load().then(ok => PS.ui.toast(ok ? 'State loaded' : 'No saved state yet', running ? running.title : '', ok ? '#3d8bff' : '#555', PS.icons.load));
  }
  function hasState(g) { return !!savedStates[stateKey(g)]; }

  // the emulator page reports its own autosaves
  window.addEventListener('message', e => {
    const m = e.data || {};
    if (m.ps10k === 'saved' && running) { savedStates[stateKey(running)] = Date.now(); PS.store.set('states', savedStates); }
    if (m.ps10k === 'error' && running) { PS.ui.toast('Game failed to start', m.msg || '', '#ff4d5e', PS.icons.quit); quit(); }
  });

  PS.host = {
    launch, quit, restart, pause, saveState, loadState, hasState, layoutFor,
    get running() { return running; },
    cfg: () => cfg
  };
})();
