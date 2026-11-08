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
    },

    // ------------------------------------------------------------ open-source picks (added in v1.1)
    {
      id: 'jgbreakout', type: 'html5', url: 'games/jgbreakout/index.html',
      title: 'Breakout', genre: 'Brick breaker', tags: ['arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#dea27a',
      blurb: 'Jake Gordon\'s polished brick breaker with level select, power feel and sound.',
      controls: ['Stick / D-pad: paddle', 'A: launch the ball', 'B: back to menu'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, a: SPACE, start: SPACE, b: ESC } } }, hide: '#controls,#levels', fit: '#canvas',
      license: 'MIT', source: 'https://github.com/jakesgordon/javascript-breakout', credits: 'Jake Gordon'
    },
    {
      id: 'tinyplat', type: 'html5', url: 'games/tinyplat/index.html',
      title: 'Tiny Platformer', genre: 'Platformer', tags: ['platformer'],
      players: '1', modes: ['Solo'], color: '#e85f45',
      blurb: 'A small, tight platformer: collect the gold, stomp the monsters, find the exit.',
      controls: ['Stick / D-pad: run', 'A: jump'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, a: SPACE, up: SPACE } } }, hide: '#instructions', fit: '#canvas',
      license: 'MIT', source: 'https://github.com/jakesgordon/javascript-tiny-platformer', credits: 'Jake Gordon'
    },
    {
      id: 'trex', type: 'html5', url: 'games/trex/index.html',
      title: 'Dino Run', genre: 'Endless runner', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#ffffff',
      blurb: 'The offline dinosaur runner. Jump the cacti, duck the birds, go as far as you can.',
      controls: ['A / Up: jump', 'Down: duck'],
      input: { mode: 'keys', keys: { 1: { a: SPACE, up: SPACE, start: SPACE, down: ARROWS.down } } },
      license: 'BSD-3-Clause (Chromium)', source: 'https://github.com/wayou/t-rex-runner', credits: 'The Chromium Authors, wayou'
    },
    {
      id: 'astray', type: 'html5', url: 'games/astray/index.html',
      title: 'Astray', genre: '3D maze', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#90732c',
      blurb: 'Roll a metal ball through ever bigger 3D labyrinths. Calm, clever and very satisfying.',
      controls: ['Stick / D-pad: roll the ball'],
      input: { mode: 'keys', keys: { 1: Object.assign({}, ARROWS) } }, hide: '#instructions,#help',
      license: 'Public domain (Unlicense)', source: 'https://github.com/wwwtyro/Astray', credits: 'Rye Terrell'
    },
    {
      id: 'asteroids', type: 'html5', url: 'games/asteroids/index.html',
      title: 'Asteroids HTML5', genre: 'Space shooter', tags: ['shooter', 'arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#ffffff',
      blurb: 'Vector rocks, one fragile ship. Thrust, turn and blast everything to dust.',
      controls: ['Left / right: turn', 'Up: thrust', 'A: fire', 'B: pause'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, up: ARROWS.up, a: SPACE, rt: SPACE, start: SPACE, b: key('p') } } }, hide: '#left-controls,#right-controls,.button', fit: '#canvas',
      license: 'MIT', source: 'https://github.com/dmcinnes/HTML5-Asteroids', credits: 'Doug McInnes'
    },
    {
      id: 'alieninv', type: 'html5', url: 'games/alieninv/index.html',
      title: 'Alien Invasion', genre: 'Vertical shooter', tags: ['shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#a8c92e',
      blurb: 'Classic vertical shoot-em-up: dodge the swarm and clear wave after wave.',
      controls: ['Stick / D-pad: move', 'A: fire'],
      input: { mode: 'keys', keys: { 1: { left: ARROWS.left, right: ARROWS.right, a: SPACE, rt: SPACE, start: SPACE } } }, fit: '#game',
      license: 'MIT / GPL', source: 'https://github.com/cykod/AlienInvasion', credits: 'Pascal Rettig (Cykod)'
    },
    {
      id: 'saveforest', type: 'html5', url: 'games/saveforest/index.html',
      title: 'Save the Forest', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#ff5300',
      blurb: 'A js13k game: hop from tree to tree and put out the fires before the forest burns down.',
      controls: ['A: start / jump', 'Right / Up: hop'],
      input: { mode: 'keys', keys: { 1: { right: ARROWS.right, up: ARROWS.up, a: SPACE, start: ENTER } } },
      license: 'MIT', source: 'https://github.com/softvar/save-the-forest', credits: 'Varun Malhotra'
    },
    {
      id: 'spacecrusade', type: 'html5', url: 'games/spacecrusade/index.html',
      title: 'Space Crusade', genre: 'Space shooter', tags: ['shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#21b3ed',
      blurb: 'Pilot a lone fighter through endless enemy waves. Grab power-ups, keep moving.',
      controls: ['Left stick: steer the ship', 'A: select'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/Loopeex/space-crusade', credits: 'Loopeex'
    },
    {
      id: 'towerblocks', type: 'html5', url: 'games/towerblocks/index.html',
      title: 'Tower Blocks', genre: 'Stacking', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#ff6237',
      blurb: 'Drop swinging floors to build the tallest tower you can. Perfect drops score big.',
      controls: ['A: drop the block'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/iamkun/tower_game', credits: 'iamkun (BMQB)'
    },
    {
      id: 'captrogers', type: 'html5', url: 'games/captrogers/index.html',
      title: 'Captain Rogers', genre: 'Arcade flyer', tags: ['arcade', 'shooter'],
      players: '1', modes: ['Solo'], color: '#ffa800',
      blurb: 'Fly through the asteroid belt of Sirius, collect stars and dodge the rocks.',
      controls: ['Up: fly up', 'A: start / continue', 'B: bomb'],
      input: { mode: 'keys', keys: { 1: { up: ARROWS.up, a: ENTER, start: ENTER, b: key('b'), rt: ARROWS.up } } },
      license: 'CC BY-NC 4.0', source: 'https://github.com/EnclaveGames/Captain-Rogers', credits: 'Enclave Games'
    },
    {
      id: 'hexgl', type: 'html5', url: 'games/hexgl/index.html',
      title: 'HexGL', genre: 'Anti-gravity racer', tags: ['racing'],
      players: '1', modes: ['Solo'], color: '#4aa4d1',
      blurb: 'Futuristic anti-gravity racing in full 3D. Heavy for small TVs: try Quality: Low.',
      controls: ['Left / right: steer', 'Up: accelerate', 'LB / RB: air brakes', 'Left stick + A: menus'],
      input: { mode: 'keys', aim: 'mouse', keys: { 1: { left: ARROWS.left, right: ARROWS.right, up: ARROWS.up, rt: ARROWS.up, lb: key('a'), rb: key('d') } } },
      license: 'MIT', source: 'https://github.com/BKcore/HexGL', credits: 'Thibaut Despoulain'
    },
    {
      id: 'ljsplatformer', type: 'html5', url: 'games/ljsplatformer/index.html',
      title: 'Little Platformer', genre: 'Platformer', tags: ['platformer'],
      players: '1', modes: ['Solo'], color: '#d5b454',
      blurb: 'Run, jump and blast through a destructible level. Made with LittleJS.',
      controls: ['Stick / D-pad: move', 'A: jump', 'X: shoot', 'B: dodge'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJS', credits: 'Frank Force'
    },
    {
      id: 'ljspuzzle', type: 'html5', url: 'games/ljspuzzle/index.html',
      title: 'Gem Match', genre: 'Match puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#ff0000',
      blurb: 'Swap tiles to line up matches and chain big combos.',
      controls: ['Left stick: move the pointer', 'A: pick and swap'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJS', credits: 'Frank Force'
    },
    {
      id: 'bounceback', type: 'html5', url: 'games/bounceback/index.html',
      title: 'Bounce Back', genre: 'Twin-stick shooter', tags: ['shooter', 'arcade'],
      players: '1', modes: ['Solo'], color: '#000000',
      blurb: 'Fast twin-stick arena action where every shot bounces. By the maker of Space Huggers.',
      controls: ['Left stick: move', 'Right stick: aim', 'RT: shoot', 'A: dash'],
      input: { mode: 'keys', aim: 'mouse', keys: { 1: Object.assign({}, WASD, { a: SPACE }) } },
      license: 'GPL-3.0', source: 'https://github.com/KilledByAPixel/BounceBack', credits: 'Frank Force'
    },
    {
      id: 'arc-astroblast', type: 'html5', url: 'games/arcade/games/astroblast.html',
      title: 'Astroblast', genre: 'Shooter', tags: ['arcade', 'retro', 'shooter', 'space'],
      players: '1', modes: ['Solo'], color: '#6b6b6d',
      blurb: 'Thrust and blast the rocks.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-blastman', type: 'html5', url: 'games/arcade/games/blastman.html',
      title: 'Blastman', genre: 'Arcade', tags: ['arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#efbf41',
      blurb: 'Bomb the blocks and blast every baddie.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-bobblepop', type: 'html5', url: 'games/arcade/games/bobblePop.html',
      title: 'Bobble Pop', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#00ff00',
      blurb: 'Aim and pop matching bubbles.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-boomer', type: 'html5', url: 'games/arcade/games/boomer.html',
      title: 'Boomer', genre: 'Arcade', tags: ['arcade', 'retro'],
      players: '1', modes: ['Solo'], color: '#ae922d',
      blurb: 'Catch all the bombs.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-brickout', type: 'html5', url: 'games/arcade/games/brickout.html',
      title: 'Brickout', genre: 'Arcade', tags: ['arcade', 'retro'],
      players: '1', modes: ['Solo'], color: '#e1f83d',
      blurb: 'Bounce the ball to break bricks.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-capturego', type: 'html5', url: 'games/arcade/games/captureGo.html',
      title: 'Capture Go', genre: 'Board game', tags: ['board', 'multiplayer'],
      players: '1-2', modes: ['Versus'], color: '#cfb286',
      blurb: 'First to capture wins (Atari Go).',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-centibug', type: 'html5', url: 'games/arcade/games/centibug.html',
      title: 'Centibug', genre: 'Shooter', tags: ['arcade', 'classic', 'retro', 'shooter'],
      players: '1', modes: ['Solo'], color: '#5db96a',
      blurb: 'Blast the centipede before it lands.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-checkers', type: 'html5', url: 'games/arcade/games/checkers.html',
      title: 'Checkers', genre: 'Board game', tags: ['board', 'multiplayer', 'puzzle'],
      players: '1-2', modes: ['Versus'], color: '#e01819',
      blurb: 'Jump to capture your rival.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-chess', type: 'html5', url: 'games/arcade/games/chess.html',
      title: 'Chess', genre: 'Board game', tags: ['board', 'multiplayer', 'puzzle'],
      players: '1-2', modes: ['Versus'], color: '#97673d',
      blurb: 'The classic game of kings and pawns.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-complements', type: 'html5', url: 'games/arcade/games/complements.html',
      title: 'Complements', genre: 'Board game', tags: ['board'],
      players: '1', modes: ['Solo'], color: '#00008a',
      blurb: 'Shoot gems at their opposite color.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-connect4', type: 'html5', url: 'games/arcade/games/connect4.html',
      title: 'Drop Four', genre: 'Board game', tags: ['board', 'multiplayer', 'puzzle'],
      players: '1-2', modes: ['Versus'], color: '#1740a7',
      blurb: 'Drop discs in a line of four.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-dominoes', type: 'html5', url: 'games/arcade/games/dominoes.html',
      title: 'Dominoes', genre: 'Arcade', tags: ['arcade', 'multiplayer'],
      players: '1-2', modes: ['Versus'], color: '#41577d',
      blurb: 'Match tiles end to end.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-drpill', type: 'html5', url: 'games/arcade/games/drPill.html',
      title: 'Dr. Pill', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#c63e3f',
      blurb: 'Drop pills to wipe out viruses.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-emojisurvivors', type: 'html5', url: 'games/arcade/games/emojiSurvivors.html',
      title: 'Emoji Survivors', genre: 'Shooter', tags: ['arcade', 'shooter'],
      players: '1', modes: ['Solo'], color: '#671318',
      blurb: 'Outlast the emoji horde.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-floppybird', type: 'html5', url: 'games/arcade/games/floppyBird.html',
      title: 'Floppy Bird', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#ebb618',
      blurb: 'Tap to flap between the pipes.',
      controls: ['A: flap', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-freethrow', type: 'html5', url: 'games/arcade/games/freeThrow.html',
      title: 'Free Throw', genre: 'Sports', tags: ['sports'],
      players: '1', modes: ['Solo'], color: '#cf6f28',
      blurb: 'Sink free throws before time runs out.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-freecell', type: 'html5', url: 'games/arcade/games/freecell.html',
      title: 'FreeCell Solitaire', genre: 'Cards & strategy', tags: ['board', 'puzzle'],
      players: '1', modes: ['Solo'], color: '#ed7f7f',
      blurb: 'Sort every card back home.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-froggit', type: 'html5', url: 'games/arcade/games/froggit.html',
      title: 'Froggit', genre: 'Arcade', tags: ['arcade', 'classic', 'retro'],
      players: '1', modes: ['Solo'], color: '#72adde',
      blurb: 'Dodge traffic and cross the river.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-gemfighter', type: 'html5', url: 'games/arcade/games/gemFighter.html',
      title: 'Gem Fighter', genre: 'Arcade', tags: ['arcade', 'multiplayer'],
      players: '1-2', modes: ['Versus'], color: '#651529',
      blurb: 'Stack gems to chain combos.',
      controls: ['Stick / D-pad: move pieces', 'A / B: rotate', 'Up: hard drop', 'P2 joins from a second phone'],
      input: { mode: 'keys', keys: { 2: { left: ARROWS.left, right: ARROWS.right, down: ARROWS.down, up: ARROWS.up, a: K(',', 'Comma', 188), b: K('.', 'Period', 190) } } },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-geometryjump', type: 'html5', url: 'games/arcade/games/geometryJump.html',
      title: 'Geometry Jump', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#006263',
      blurb: 'Dodge all the obstacles.',
      controls: ['A: jump', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-go', type: 'html5', url: 'games/arcade/games/go.html',
      title: 'Go', genre: 'Board game', tags: ['board', 'multiplayer'],
      players: '1-2', modes: ['Versus'], color: '#cfb286',
      blurb: 'Surround territory on a 9×9 board.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-homerderby', type: 'html5', url: 'games/arcade/games/homerDerby.html',
      title: 'Home Run Derby', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#298a2a',
      blurb: 'Swing for the fences.',
      controls: ['A: swing', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-jetdash', type: 'html5', url: 'games/arcade/games/jetdash.html',
      title: 'Jetdash', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#766233',
      blurb: 'Boost to dodge the obstacles.',
      controls: ['A: hold to boost', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-jouster', type: 'html5', url: 'games/arcade/games/jouster.html',
      title: 'Jouster', genre: 'Arcade', tags: ['arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#f04902',
      blurb: 'Flap higher than your rival.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-klondike', type: 'html5', url: 'games/arcade/games/klondike.html',
      title: 'Klondike Solitaire', genre: 'Cards & strategy', tags: ['board', 'puzzle'],
      players: '1', modes: ['Solo'], color: '#f2a0a0',
      blurb: 'Arrange cards into foundation piles.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-matchthree', type: 'html5', url: 'games/arcade/games/matchThree.html',
      title: 'Match Three', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#0f8eff',
      blurb: 'Swap gems to match three.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-microracer', type: 'html5', url: 'games/arcade/games/microRacer.html',
      title: 'Micro Racer', genre: 'Arcade', tags: ['arcade', 'racing'],
      players: '1', modes: ['Solo'], color: '#f4161b',
      blurb: 'Race tiny cars on tight tracks.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-minesweeper', type: 'html5', url: 'games/arcade/games/minesweeper.html',
      title: 'Minesweeper', genre: 'Cards & strategy', tags: ['board', 'classic', 'puzzle'],
      players: '1', modes: ['Solo'], color: '#5d5d5d',
      blurb: 'Flag all the mines.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-minigolf', type: 'html5', url: 'games/arcade/games/miniGolf.html',
      title: 'Mini Golf', genre: 'Sports', tags: ['sports'],
      players: '1', modes: ['Solo'], color: '#79471f',
      blurb: 'Putt across tricky little courses.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-missiledefense', type: 'html5', url: 'games/arcade/games/missileDefense.html',
      title: 'Missile Defense', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#796345',
      blurb: 'Shoot down missiles to save cities.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-moonlander', type: 'html5', url: 'games/arcade/games/moonLander.html',
      title: 'Moon Lander', genre: 'Arcade', tags: ['arcade', 'retro'],
      players: '1', modes: ['Solo'], color: '#2a6ad0',
      blurb: 'Touch down gently.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-moonbuggy', type: 'html5', url: 'games/arcade/games/moonbuggy.html',
      title: 'Moonbuggy', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#2c8d35',
      blurb: 'Hop craters and shoot aliens.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-mrdrill', type: 'html5', url: 'games/arcade/games/mrDrill.html',
      title: 'Drillman', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#f1d23d',
      blurb: 'Dig down for air.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-orbitswarm', type: 'html5', url: 'games/arcade/games/orbitswarm.html',
      title: 'OrbitSwarm', genre: 'Cards & strategy', tags: ['board', 'puzzle', 'space'],
      players: '1', modes: ['Solo'], color: '#be5341',
      blurb: 'Build ships and conquer the galaxy.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pegball', type: 'html5', url: 'games/arcade/games/pegball.html',
      title: 'Pegball', genre: 'Physics', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#88411e',
      blurb: 'Aim and drop to clear every peg.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pillars', type: 'html5', url: 'games/arcade/games/pillars.html',
      title: 'Pillars', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#f6695c',
      blurb: 'Rotate falling jewels to match three.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pinball', type: 'html5', url: 'games/arcade/games/pinball.html',
      title: 'Pinball', genre: 'Arcade', tags: ['arcade', 'retro'],
      players: '1', modes: ['Solo'], color: '#d7ad14',
      blurb: 'Launch, flip, and bounce.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-plinko', type: 'html5', url: 'games/arcade/games/plinko.html',
      title: 'Plinker', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#2664c8',
      blurb: 'Drop chips down pegs to score.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pong', type: 'html5', url: 'games/arcade/games/pong.html',
      title: 'Pong', genre: 'Sports', tags: ['retro', 'sports'],
      players: '1', modes: ['Solo'], color: '#ffffff',
      blurb: 'Bounce the ball past your opponent.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pool', type: 'html5', url: 'games/arcade/games/pool.html',
      title: 'Pool', genre: 'Sports', tags: ['sports'],
      players: '1', modes: ['Solo'], color: '#d89b57',
      blurb: 'Cue up and sink all the balls.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-powerwing', type: 'html5', url: 'games/arcade/games/powerwing.html',
      title: 'Powerwing', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#d033f7',
      blurb: 'Blast through the levels.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-protector', type: 'html5', url: 'games/arcade/games/protector.html',
      title: 'Protector', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#00584a',
      blurb: 'Blast aliens and rescue the humans.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-pucman', type: 'html5', url: 'games/arcade/games/pucMan.html',
      title: 'Maze Munch', genre: 'Arcade', tags: ['arcade', 'retro'],
      players: '1', modes: ['Solo'], color: '#357280',
      blurb: 'Eat dots and dodge ghosts.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-reversi', type: 'html5', url: 'games/arcade/games/reversi.html',
      title: 'Reversi', genre: 'Board game', tags: ['board', 'multiplayer', 'puzzle'],
      players: '1-2', modes: ['Versus'], color: '#288928',
      blurb: 'Flank stones to flip them.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-riverstrike', type: 'html5', url: 'games/arcade/games/riverStrike.html',
      title: 'River Strike', genre: 'Arcade', tags: ['arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#0e4194',
      blurb: 'Down enemy ships and collect fuel.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-roborescue', type: 'html5', url: 'games/arcade/games/roboRescue.html',
      title: 'Robo Rescue', genre: 'Shooter', tags: ['arcade', 'retro', 'shooter'],
      players: '1', modes: ['Solo'], color: '#c83534',
      blurb: 'Destroy robots and save humans.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-skiing', type: 'html5', url: 'games/arcade/games/skiing.html',
      title: 'Skiing', genre: 'Arcade', tags: ['arcade', 'racing', 'retro'],
      players: '1', modes: ['Solo'], color: '#3d803e',
      blurb: 'Carve downhill through the gates.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-skyhop', type: 'html5', url: 'games/arcade/games/skyhop.html',
      title: 'Skyhop', genre: 'Arcade', tags: ['arcade', 'platformer'],
      players: '1', modes: ['Solo'], color: '#2be422',
      blurb: 'Bounce high up the platforms.',
      controls: ['Stick: steer', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-snake', type: 'html5', url: 'games/arcade/games/snake.html',
      title: 'Snake', genre: 'Arcade', tags: ['arcade', 'classic'],
      players: '1', modes: ['Solo'], color: '#d10b0a',
      blurb: 'Eat to grow and don’t crash.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-sokoban', type: 'html5', url: 'games/arcade/games/sokoban.html',
      title: 'Sokoban', genre: 'Cards & strategy', tags: ['board', 'classic', 'puzzle'],
      players: '1', modes: ['Solo'], color: '#bb6e27',
      blurb: 'Push every box onto its target.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-spaceintruders', type: 'html5', url: 'games/arcade/games/spaceIntruders.html',
      title: 'Space Intruders', genre: 'Shooter', tags: ['arcade', 'retro', 'shooter', 'space'],
      players: '1', modes: ['Solo'], color: '#ff5e5e',
      blurb: 'Shoot marching aliens.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-speedway', type: 'html5', url: 'games/arcade/games/speedway.html',
      title: 'Speedway', genre: 'Arcade', tags: ['arcade', 'racing', 'retro'],
      players: '1', modes: ['Solo'], color: '#f70000',
      blurb: 'Pass other racers and beat the clock.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-spydriver', type: 'html5', url: 'games/arcade/games/spyDriver.html',
      title: 'Spy Driver', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#1d71d0',
      blurb: 'Drive and shoot.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-sudoku', type: 'html5', url: 'games/arcade/games/sudoku.html',
      title: 'Sudoku', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#877341',
      blurb: 'Fill the grid with 1-9.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-tankcombat', type: 'html5', url: 'games/arcade/games/tankCombat.html',
      title: 'Tank Combat', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#c89c53',
      blurb: 'Bank shots to clear waves of enemy tanks.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-tetrix', type: 'html5', url: 'games/arcade/games/tetrix.html',
      title: 'Tetrix', genre: 'Puzzle', tags: ['classic', 'puzzle'],
      players: '1', modes: ['Solo'], color: '#c8b120',
      blurb: 'Stack blocks to clear lines.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-wordly', type: 'html5', url: 'games/arcade/games/wordly.html',
      title: 'Wordly', genre: 'Puzzle', tags: ['puzzle'],
      players: '1', modes: ['Solo'], color: '#8c8c8c',
      blurb: 'Guess the secret word.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-wulfstein', type: 'html5', url: 'games/arcade/games/wulfstein.html',
      title: 'Wulfstein', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#a67a2c',
      blurb: 'Shoot your way out of the castle.',
      controls: ['Stick / D-pad: move', 'A: action / fire', 'Start: pause / menu'],
      input: { mode: 'pad' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
    },
    {
      id: 'arc-zoomi', type: 'html5', url: 'games/arcade/games/zoomi.html',
      title: 'Zoomi', genre: 'Arcade', tags: ['arcade'],
      players: '1', modes: ['Solo'], color: '#c09b13',
      blurb: 'Shoot marbles, match three to pop.',
      controls: ['Left stick: move the pointer', 'A: select / place', 'Start: menu'],
      input: { mode: 'pad', aim: 'mouse' },
      license: 'MIT', source: 'https://github.com/KilledByAPixel/LittleJSArcade', credits: 'Frank Force (LittleJS Arcade)'
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
