/* PS10,000 game catalog.
 * type: html5 | original | rom
 * input.mode: 'pad'  -> game reads the Gamepad API (shim feeds virtual pads)
 *             'keys' -> shim turns pad buttons into keyboard events (per player maps)
 * input.aim:  'mouse' -> right stick aims a virtual mouse around the screen centre, RT/A fires
 * Pad button names: a b x y lb rb lt rt select start l3 r3 up down left right home
 * Stick directions are folded into up/down/left/right (left stick) and rup/rdown/rleft/rright (right stick).
 */
window.PS_CATALOG = (function () {
  const K = (key, code, keyCode) => ({ key, code, keyCode });
  const ARROWS = { up: K('ArrowUp', 'ArrowUp', 38), down: K('ArrowDown', 'ArrowDown', 40), left: K('ArrowLeft', 'ArrowLeft', 37), right: K('ArrowRight', 'ArrowRight', 39) };
  const WASD = { up: K('w', 'KeyW', 87), down: K('s', 'KeyS', 83), left: K('a', 'KeyA', 65), right: K('d', 'KeyD', 68) };
  const RARROWS = { rup: ARROWS.up, rdown: ARROWS.down, rleft: ARROWS.left, rright: ARROWS.right };
  const SPACE = K(' ', 'Space', 32), ENTER = K('Enter', 'Enter', 13), ESC = K('Escape', 'Escape', 27);
  const key = (c) => K(c.toLowerCase(), 'Key' + c.toUpperCase(), c.toUpperCase().charCodeAt(0));
  const digit = (d) => K(String(d), 'Digit' + d, 48 + d);

  const games = [
    // ------------------------------------------------------------ originals
    {
      id: 'ember-tide', type: 'original', url: 'originals/ember-tide/index.html',
      title: 'Ember & Tide', genre: 'Co-op puzzle platformer', tags: ['coop', 'puzzle', 'platformer', 'multiplayer', 'original'],
      players: '1-2', modes: ['Co-op'], color: '#ff7a3d',
      blurb: 'Fire and water, one level, two friends. Ember walks through lava, Tide swims through water. Both must reach their doors.',
      controls: ['Stick / D-pad: move', 'A: jump', 'Start: pause / restart level'],
      input: { mode: 'pad' }, license: 'Original — PS10,000 (code MIT)', source: 'Made for PS10,000', credits: 'Design & code: PS10,000'
    },
    {
      id: 'jet-rush', type: 'original', url: 'originals/jet-rush/index.html',
      title: 'Jet Rush', genre: 'Jetpack runner', tags: ['runner', 'arcade', 'original', 'multiplayer'],
      players: '1-4', modes: ['Versus'], color: '#ffd23f',
      blurb: 'Hold to fly, release to fall. Dodge zappers and missiles, grab coins. Up to four racers in the same lab.',
      controls: ['A (hold): jetpack up', 'Start: pause'],
      input: { mode: 'pad' }, license: 'Original — PS10,000 (code MIT)', source: 'Made for PS10,000', credits: 'Design & code: PS10,000'
    },
    {
      id: 'night-shift', type: 'original', url: 'originals/night-shift/index.html',
      title: 'Night Shift', genre: 'Stealth heist', tags: ['stealth', 'puzzle', 'original'],
      players: '1', modes: ['Solo'], color: '#7a6cff',
      blurb: 'Sneak past guards and cameras, grab the loot, reach the van. Stay out of the light.',
      controls: ['Stick / D-pad: move', 'B (hold): sneak — guards can\'t hear you', 'Walk over loot to grab it', 'Start: restart heist'],
      input: { mode: 'pad' }, license: 'Original — PS10,000 (code MIT)', source: 'Made for PS10,000', credits: 'Design & code: PS10,000'
    },
    {
      id: 'brawl-box', type: 'original', url: 'originals/brawl-box/index.html',
      title: 'Brawl Box', genre: 'Party arena brawler', tags: ['party', 'fighting', 'multiplayer', 'original'],
      players: '2-4', modes: ['Versus'], color: '#ff3d7f',
      blurb: 'Punch your friends off the platforms. Last one standing wins the round, first to three rounds wins.',
      controls: ['Stick / D-pad: move', 'A: jump (double jump)', 'X: punch', 'B: dash'],
      input: { mode: 'pad' }, license: 'Original — PS10,000 (code MIT)', source: 'Made for PS10,000', credits: 'Design & code: PS10,000'
    },

    // ---------------------------------------------------------------- html5
    {
      id: 'pvp', type: 'html5', url: 'games/pvp/client/index.html#kiosk',
      title: 'Player Versus Player', genre: 'Arena shooter', tags: ['shooter', 'multiplayer', 'split'],
      players: '1-4', modes: ['Versus', 'Split-screen'], color: '#c0392b',
      blurb: 'Split-screen arena shooter for up to four. Pick a map, grab weapons, frag your friends.',
      controls: ['Uses controllers directly', 'Menus: D-pad + A'],
      input: { mode: 'pad', keys: { 1: { up: ARROWS.up, down: ARROWS.down, left: ARROWS.left, right: ARROWS.right, a: ENTER, start: ENTER } } },
      license: 'GPL-3.0', source: 'https://github.com/kesiev/pvp', credits: 'KesieV'
    },
    {
      id: 'spacehuggers', type: 'html5', url: 'games/spacehuggers/index.html',
      title: 'Space Huggers', genre: 'Run-and-gun', tags: ['shooter', 'platformer', 'coop', 'multiplayer'],
      players: '1-4', modes: ['Co-op'], color: '#3fae5a',
      blurb: 'Fast run-and-gun with destructible levels. Drop in with up to four controllers and blast through the alien base together.',
      controls: ['Stick: move / aim', 'A: jump', 'X / RT: shoot', 'B: grenade'],
      input: { mode: 'pad' }, license: 'GPL-3.0', source: 'https://github.com/KilledByAPixel/SpaceHuggers', credits: 'Frank Force (KilledByAPixel)'
    },
    {
      id: 'onslaught', type: 'html5', url: 'games/onslaught/htdocs/index.html',
      title: 'Onslaught! Arena', genre: 'Arena action', tags: ['action', 'shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#b8862b',
      blurb: 'Fight off waves of goblins, cyclopes, wizards and a dragon in a medieval arena. Twin-stick style.',
      controls: ['Left stick: move', 'Right stick: attack direction', 'Start: menu / pause'],
      input: { mode: 'keys', keys: { 1: Object.assign({}, WASD, RARROWS, { a: SPACE, start: ENTER, select: key('p'), b: ESC }) } },
      hide: '#tip', fit: 'canvas',
      license: 'GPL (code); assets free to share, not resell', source: 'https://github.com/lostdecade/onslaught_arena', credits: 'Lost Decade Games'
    },
    {
      id: 'radiusraid', type: 'html5', url: 'games/radiusraid/index.html',
      title: 'Radius Raid', genre: 'Twin-stick shooter', tags: ['shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#e0e0e0',
      blurb: 'Space shooter where enemies pour in from every side. Upgrade, survive, chase the high score.',
      controls: ['Left stick: move', 'Right stick: aim (auto-fire)', 'A: click menus', 'Start: pause'],
      input: { mode: 'keys', aim: 'mouse', keys: { 1: Object.assign({}, WASD, { start: key('p'), select: key('m') }) } },
      license: 'MIT', source: 'https://github.com/jackrugile/radius-raid-js13k', credits: 'Jack Rugile'
    },
    {
      id: 'underrun', type: 'html5', url: 'games/underrun/index-debug.html',
      title: 'Underrun', genre: 'Twin-stick shooter', tags: ['shooter', 'action'],
      players: '1', modes: ['Solo'], color: '#e99a2c',
      blurb: 'Dark sci-fi twin-stick shooter. Reboot the systems, fight the spider bots, find the way out.',
      controls: ['Left stick: move', 'Right stick: aim + fire', 'A: start'],
      input: { mode: 'keys', aim: 'mouse', keys: { 1: Object.assign({}, WASD, { start: SPACE, a: SPACE }) } },
      license: 'MIT', source: 'https://github.com/phoboslab/underrun', credits: 'Dominic Szablewski (phoboslab)'
    },
    {
      id: 'sorades', type: 'html5', url: 'games/sorades/index.html',
      title: 'Starship Sorades', genre: 'Vertical shmup', tags: ['shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#6b8cff',
      blurb: 'Classic vertical shoot-em-up packed into 13 KB. Dodge the bullet curtains and take down the bosses.',
      controls: ['Stick / D-pad: fly', 'A: fire', 'Start: pause'],
      input: { mode: 'keys', keys: { 1: Object.assign({}, ARROWS, { a: key('x'), x: key('x'), start: key('p'), select: key('m') }) } },
      hide: 'body > *:not(canvas)', fit: 'canvas',
      license: 'CC BY-SA 3.0 DE', source: 'https://github.com/maettig/starship-sorades-13k', credits: 'Thiemo Mättig'
    },
    {
      id: 'racer', type: 'html5', url: 'games/racer/v4.final.html',
      title: 'Outrun Racer', genre: 'Arcade racer', tags: ['racing', 'arcade'],
      players: '1', modes: ['Solo'], color: '#e74c3c',
      blurb: 'Pseudo-3D arcade racing on a sunny coast road with hills and curves. Beat your lap time.',
      controls: ['A: accelerate', 'B: brake', 'Stick / D-pad: steer'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, up: ARROWS.up, down: ARROWS.down, a: ARROWS.up, rt: ARROWS.up, b: ARROWS.down, lt: ARROWS.down } } },
      hide: 'body > *:not(#racer)', fit: '#racer',
      license: 'MIT', source: 'https://github.com/jakesgordon/javascript-racer', credits: 'Jake Gordon'
    },
    {
      id: 'pong', type: 'html5', url: 'games/pong/index.html',
      title: 'Pong', genre: 'Classic versus', tags: ['sports', 'multiplayer', 'arcade', 'classic'],
      players: '1-2', modes: ['Versus'], color: '#ffffff',
      blurb: 'The original. Player 1 vs CPU or a friend. First to nine.',
      controls: ['Stick / D-pad: paddle up / down', 'Start: 1 player', 'Y: 2 players'],
      input: { mode: 'keys', keys: { 1: { up: key('q'), down: key('a'), start: digit(1), y: digit(2), b: ESC }, 2: { up: key('p'), down: key('l'), start: digit(2) } } },
      hide: '#sidebar,#unsupported', fit: '#game',
      license: 'MIT', source: 'https://github.com/jakesgordon/javascript-pong', credits: 'Jake Gordon'
    },
    {
      id: 'tetris', type: 'html5', url: 'games/tetris/index.html',
      title: 'Blocks', genre: 'Falling-block puzzle', tags: ['puzzle', 'classic'],
      players: '1', modes: ['Solo'], color: '#2f9cf4',
      blurb: 'Rotate and drop the falling blocks, clear rows, chase a high score.',
      controls: ['Left / right: move', 'A or Up: rotate', 'Down: drop faster', 'Start: begin'],
      input: { mode: 'keys', keys: { 1: Object.assign({}, ARROWS, { a: ARROWS.up, x: ARROWS.up, start: SPACE, b: ESC }) } },
      fit: '#tetris',
      license: 'MIT', source: 'https://github.com/jakesgordon/javascript-tetris', credits: 'Jake Gordon'
    },
    {
      id: 'hextris', type: 'html5', url: 'games/hextris/index.html',
      title: 'Hextris', genre: 'Hex puzzle', tags: ['puzzle', 'arcade'],
      players: '1', modes: ['Solo'], color: '#e8b04b',
      blurb: 'Rotate the hexagon to stack falling blocks into same-colour groups. Easy to learn, very hard to stop.',
      controls: ['Left / right: rotate', 'Down: speed up', 'A: start / resume', 'B: pause'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, down: ARROWS.down, a: ENTER, start: ENTER, b: key('p'), lb: ARROWS.left, rb: ARROWS.right } } },
      hide: '#socialShare,#openSideBar,#helpScreen,#pauseBtn,#restartBtn,#buttonCont,#badges,.rrssb-buttons', fit: null,
      license: 'GPL-3.0', source: 'https://github.com/Hextris/hextris', credits: 'Logan Engstrom, Garrett Finucane, Noah Moroze, Michael Yang'
    },
    {
      id: '2048', type: 'html5', url: 'games/2048/index.html',
      title: '2048', genre: 'Sliding puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#edc22e',
      blurb: 'Slide the tiles, merge equal numbers, reach 2048.',
      controls: ['Stick / D-pad: slide tiles', 'Start: new game'],
      input: { mode: 'keys', keys: { 1: Object.assign({}, ARROWS) } },
      hide: '.game-explanation,.game-intro,hr,p,.above-game .restart-button~*', fit: null,
      license: 'MIT', source: 'https://github.com/gabrielecirulli/2048', credits: 'Gabriele Cirulli'
    }
  ];

  // ------------------------------------------------------------- retro slots
  // Licence-cleared homebrew (Tier A). Put the ROM file into PS10,000 (upload from a phone,
  // or copy into the ROM folder) and it appears in the library.
  const rom = (id, title, system, file, genre, players, tags, blurb, license, source, credits, color) => ({
    id, type: 'rom', system, rom: file, title, genre, players, tags: tags.concat(['retro', system]), blurb,
    modes: players.indexOf('2') >= 0 ? ['Versus'] : ['Solo'], color, license, source, credits,
    controls: system === 'nes' ? ['D-pad: move', 'A / B: as on the NES pad', 'Start / Select'] : ['D-pad: move', 'A / B', 'Start / Select'],
    input: { mode: 'pad' }
  });
  const roms = [
    rom('nova', 'Nova the Squirrel', 'nes', 'nova.nes', 'Platformer', '1', ['platformer'], 'A Mario-style NES adventure starring a squirrel with a big ability toolbox.', 'GPLv3 code, CC BY-NC-SA art', 'https://github.com/NovaSquirrel/NovaTheSquirrel', 'NovaSquirrel', '#4fc36b'),
    rom('supertiltbro', 'Super Tilt Bro.', 'nes', 'tilt.nes', 'Platform fighter', '1-2', ['fighting', 'multiplayer'], 'Smash-style fighting on the NES. Knock your friend off the stage.', 'WTFPL', 'https://github.com/sgadrat/super-tilt-bro', 'Sylvain Gadrat', '#ff8a3d'),
    rom('rhde', 'RHDE: Furniture Fight', 'nes', 'rhde.nes', 'Strategy battle', '1-2', ['strategy', 'multiplayer'], 'Build your house, then wreck your rival\'s with furniture cannons.', 'GNU All-Permissive', 'https://pineight.com/nes/', 'Damian Yerrick', '#c9a26b'),
    rom('thwaite', 'Thwaite', 'nes', 'thwaite.nes', 'Missile defense', '1', ['arcade', 'shooter'], 'Defend the villages from incoming missiles, Missile Command style.', 'GNU GPL', 'https://pineight.com/nes/', 'Damian Yerrick', '#5aa0ff'),
    rom('croom', 'Concentration Room', 'nes', 'croom.nes', 'Memory puzzle', '1-2', ['puzzle', 'multiplayer'], 'Match the cards before the room fills with gas.', 'GNU GPL', 'https://pineight.com/nes/', 'Damian Yerrick', '#9be36b'),
    rom('roulette', 'Russian Roulette', 'nes', 'roulette.nes', 'Party', '1-2', ['party', 'multiplayer'], 'A tense little party game for friends.', 'GNU All-Permissive', 'https://pineight.com/nes/', 'Damian Yerrick', '#d84a4a'),
    rom('lanmaster', 'Lan Master', 'nes', 'lanmaster.nes', 'Puzzle', '1', ['puzzle'], 'Rotate cable pieces to connect every computer to the network.', 'CC0', 'https://shiru.untergrund.net/', 'Shiru', '#46c2c9'),
    rom('lawnmower', 'Lawn Mower', 'nes', 'lawnmower.nes', 'Action puzzle', '1', ['puzzle', 'arcade'], 'Mow every patch of grass before the fuel runs out.', 'CC0', 'https://shiru.untergrund.net/', 'Shiru', '#6cc04a'),
    rom('zoomingsecretary', 'Zooming Secretary', 'nes', 'zooming.nes', 'Arcade', '1', ['arcade'], 'Answer every phone in the office before callers hang up.', 'CC-BY', 'https://shiru.untergrund.net/', 'Shiru', '#f0c040'),
    rom('dabg', 'Double Action Blaster Guys', 'nes', 'dabg.nes', 'Shooter', '1-2', ['shooter', 'coop', 'multiplayer'], 'Two blaster guys, one screen, lots of enemies.', 'Author OK for compilations', 'https://forums.nesdev.org/', 'NovaSquirrel', '#ff5a5a'),
    rom('nes15', 'NES15', 'nes', 'nes15.nes', '15-puzzle', '1', ['puzzle'], 'The classic sliding 15-puzzle.', 'BSD-2', 'https://forums.nesdev.org/', 'NESdev', '#8888ff'),
    rom('escapepong', 'Escape from Pong', 'nes', 'escapepong.nes', 'Arcade', '1', ['arcade'], 'You are the ball. Escape the paddles.', 'BSD-3', 'https://forums.nesdev.org/', 'NESdev', '#cccccc'),
    rom('brickbreaker', 'BrickBreaker', 'nes', 'brickbreaker.nes', 'Breakout', '1', ['arcade'], 'Break every brick with the ball and paddle.', 'MIT', 'https://forums.nesdev.org/', 'NESdev', '#ff9f43'),
    rom('bolts', 'The 1007 Bolts', 'nes', 'bolts.nes', 'Arcade', '1', ['arcade'], 'Collect the bolts and survive.', 'CC0', 'https://forums.nesdev.org/', 'NESdev', '#aab0c0'),
    rom('tobutobu', 'Tobu Tobu Girl', 'gb', 'tobutobugirl.gb', 'Vertical platformer', '1', ['platformer'], 'Bounce higher and higher off enemies to rescue your cat. Polished Game Boy gem.', 'MIT code, CC BY 4.0 art', 'https://github.com/SimonLarsen/tobutobugirl', 'Simon Larsen & Lukas Erekson', '#f7a8b8'),
    rom('ucity', 'µCity', 'gbc', 'ucity.gbc', 'City builder', '1', ['strategy'], 'A full SimCity-style city builder on the Game Boy Color.', 'GPLv3 code, CC BY-SA art', 'https://github.com/AntonioND/ucity', 'Antonio Niño Díaz', '#58b368')
  ];

  const SYSTEMS = {
    nes: { name: 'NES', core: 'fceumm', ext: ['nes'] },
    snes: { name: 'SNES', core: 'snes9x', ext: ['sfc', 'smc'] },
    gb: { name: 'Game Boy', core: 'gambatte', ext: ['gb'] },
    gbc: { name: 'Game Boy Color', core: 'gambatte', ext: ['gbc'] },
    gba: { name: 'Game Boy Advance', core: 'mgba', ext: ['gba'] },
    segaMD: { name: 'Mega Drive', core: 'genesis_plus_gx', ext: ['md', 'gen', 'smd', 'bin'] },
    segaMS: { name: 'Master System', core: 'smsplus', ext: ['sms'] },
    segaGG: { name: 'Game Gear', core: 'genesis_plus_gx', ext: ['gg'] }
  };
  // map catalog system ids to EmulatorJS system ids
  const EJS = { nes: 'nes', snes: 'snes', gb: 'gb', gbc: 'gb', gba: 'gba', segaMD: 'segaMD', segaMS: 'segaMS', segaGG: 'segaGG' };

  function systemForFile(name) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    for (const id in SYSTEMS) if (SYSTEMS[id].ext.indexOf(ext) >= 0) return id;
    return null;
  }

  return { games, roms, SYSTEMS, EJS, systemForFile };
})();
