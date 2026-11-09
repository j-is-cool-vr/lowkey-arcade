try {
(function () {
'use strict';


const LW = 960, LH = 600, TAU = Math.PI * 2;
const SIM = 1 / 60, MAX_STEPS = 8;
const CS = 2, WALL_H = 2.4, CUT_H = 0.28, PR = 0.36;
const SPD_SNEAK = 1.75, SPD_WALK = 3.3, SPD_SPRINT = 5.3;
const MAXW = 30, MAXH = 20, MAXN = MAXW * MAXH;
const MAXG = 10, MAXC = 8, CONE_R = 17, MAX_P = 260, MAX_SMOKE = 3, MAX_LURE = 3;
const G_RANGE = 9, G_HALF = 0.66, C_RANGE = 10, C_HALF = 0.46;
const FONT_D = '"Bungee", "Impact", sans-serif';
const FONT_B = '"Figtree", system-ui, sans-serif';
const FONT_M = '"JetBrains Mono", ui-monospace, monospace';
const UI = {
scrim: 'rgba(8, 12, 22, 0.72)', panel: 'rgba(16, 22, 38, 0.92)', stroke: 'rgba(255, 255, 255, 0.12)',
head: '#FFFFFF', body: '#C9D3E3', dim: '#8FA3C4', hi: '#FFC93C', danger: '#FF5D5D', ok: '#4BE3A0', cyan: '#5FE6FF', violet: '#B58CFF',
};
const T_FLOOR = 0, T_WALL = 1, T_GLASS = 2, T_RACK = 3, T_PROP = 4, T_DOOR = 5, T_VENT = 6, T_LOCKER = 7,
T_VAULT = 8, T_PANEL = 9, T_EXIT = 10, T_LASER = 11, T_PLATE = 12;
const DX4 = [1, -1, 0, 0], DZ4 = [0, 0, 1, -1];
const GADGETS = [
{ id: 'emp', name: 'EMP', col: '#5FE6FF', tip: 'Stuns a robot or blinds a camera' },
{ id: 'lure', name: 'LURE', col: '#FFB347', tip: 'Thrown ahead: guards go to check it' },
{ id: 'smoke', name: 'SMOKE', col: '#B8C2D6', tip: 'Cloud that blocks cones and lasers' },
{ id: 'drone', name: 'DRONE', col: '#B58CFF', tip: 'Fly ahead to reveal patrol routes' },
];
const UPGRADES = [
{ id: 'emp', name: 'Extra EMP charge', desc: '+1 EMP per heist', cost: [6000, 16000] },
{ id: 'empT', name: 'Overclocked EMP', desc: 'Stuns last 2 s longer', cost: [8000, 20000] },
{ id: 'lure', name: 'Lure pack', desc: '+2 lures per heist', cost: [5000, 14000] },
{ id: 'smoke', name: 'Smoke canisters', desc: '+1 smoke per heist', cost: [9000, 22000] },
{ id: 'drone', name: 'Drone battery', desc: '+1 drone flight, +4 s air time', cost: [10000, 26000] },
{ id: 'shoes', name: 'Quiet soles', desc: 'Footsteps carry much less', cost: [7000, 18000] },
{ id: 'picks', name: 'Tension tools', desc: 'Wider sweet spots on locks and dials', cost: [8000, 21000] },
];
const SITES = [
{ name: 'Halcyon Spire', sub: 'Glass penthouse gallery, 90 floors up', price: 0,
floor: 0x23304a, wall: 0x46597d, rack: 0x3a4766, prop: 0xc9d3e8, accent: 0x7fb8ff, fog: 0x070b16, pool: [0.55, 0.72, 1.0], amb: 0.46, city: true },
{ name: 'Marrow Arcade', sub: 'Bank vault under a shopping arcade', price: 25000,
floor: 0x3a2c20, wall: 0x6b5236, rack: 0x5a4430, prop: 0x8a6a45, accent: 0xffb347, fog: 0x0c0806, pool: [1.0, 0.78, 0.48], amb: 0.44, city: false },
{ name: 'Coldframe Halls', sub: 'A data centre that never sleeps', price: 70000,
floor: 0x17262c, wall: 0x324b55, rack: 0x1c2b33, prop: 0x3c5a66, accent: 0x4fe3ff, fog: 0x031014, pool: [0.62, 0.95, 1.0], amb: 0.42, city: false },
{ name: 'Saltgate Yard', sub: 'Cargo port and container yard', price: 140000,
floor: 0x26292b, wall: 0x50565e, rack: 0x8a4a32, prop: 0x6a5a40, accent: 0xff7a4f, fog: 0x07090c, pool: [1.0, 0.72, 0.38], amb: 0.4, city: false },
];

const HEISTS = [
{ name: 'Opening Night', site: 0, val: 1500, vault: 2, cash: 12000, lock: 80, par: 170, tut: true,
brief: 'The Spire gallery opens tomorrow. Tonight one guard bot and one camera watch the art. Grab the keycard, crack the vault, ride the lift home.',
map: [
'######################',
'#k.,#,,,......$..#..V#',
'#...#,,T....o..T.#...#',
'#...D,,..........K...#',
'#...#,,..........#.$.#',
'#####,,T.....$..T#####',
'#####,,..........#####',
'##########D###########',
'#...#.......o......,,#',
'#S..D....m.......$,,,#',
'#XX.#.............,,,#',
'######################',
],
guards: [{ p: [[8, 2], [14, 2], [14, 4], [8, 4]], w: 1.8, s: 0.8 }],
cams: [[11, 0, 90, 40, 0.45]], laser: null },
{ name: 'Glass Floor', site: 0, val: 1800, vault: 2, cash: 18000, lock: 70, par: 200,
brief: 'Glass walls hide nothing. A laser gate guards the helipad stairs. Crawl the north vent or pick the side door into the vault room.',
map: [
'########################',
'#$,,,vvvvvvvvvvvvv....V#',
'#,..,#############....$#',
'#,..,#$....g.....#.....#',
'#,..,D..T..g..T..P.....#',
'#,..,#.....g.....#..o..#',
'#,..,#ggg.ggg.ggg####=##',
'#,..,#.....o.......,,$.#',
'#,..,D..T.....T....,,..#',
'#,..,########D###D######',
'#,..,#......=..#,,,,,,.#',
'#S..,D...o..=..P,,XXX..#',
'#,..,#......=..#$,,,,,.#',
'########################',
],
guards: [{ p: [[7, 4], [9, 7], [15, 7], [13, 4], [16, 4]], w: 1.5, s: 0.9 }, { p: [[19, 8], [19, 11], [21, 11], [21, 8]], w: 1.2, s: 0.9 }],
cams: [[14, 9, 270, 45, 0.5], [23, 3, 180, 35, 0.6]], laser: { per: 3.2, duty: 0.5, ph: 0.4 } },
{ name: 'Sky Lounge', site: 0, val: 2200, vault: 3, cash: 26000, lock: 70, par: 230,
brief: 'Party is over, the bots are not. Pressure plates ring the lounge. The office has the keycard and a vent straight into the vault.',
map: [
'##########################',
'#...#k...#..V..#,..,#,,XX#',
'#...#....v.....#.$..#,,,,#',
'#...D....#.$.$.#....D,,,,#',
'#...#.T..#.....#..T.#,,,,#',
'#,..###D####K####D###,,..#',
'#,..#L.....,,,,.....L#..,#',
'#,..D..T..o....o..T..D..,#',
'#,..#......^^c^^.....#..,#',
'#,..#L.....,,,,.....L#..,#',
'#,..###D######D####D###..#',
'#...#...L.#...o...#..L#..#',
'#...#.$...#..T.T..#.$.#..#',
'#...##D#####D#######D##..#',
'#S..........,,,,,......,.#',
'##########################',
],
guards: [{ p: [[6, 7], [19, 7], [19, 8], [6, 8]], w: 1.5, s: 1 }, { p: [[2, 2], [2, 13], [11, 14], [2, 13]], w: 1.2, s: 1 },
{ p: [[17, 2], [22, 3], [23, 4], [17, 3]], w: 1.6, s: 1 }],
cams: [[12, 10, 270, 50, 0.5], [15, 2, 180, 30, 0.6]], laser: null },
{ name: 'After Hours', site: 1, val: 2600, vault: 3, cash: 32000, lock: 65, par: 220,
brief: 'The Marrow Arcade shops share one back vent. Crawl it shop to shop, or pick the bank front door under the camera.',
map: [
'##########################',
'#....#....#....#....#.V..#',
'#.T..v..T.v.$..v..T.v..$.#',
'#,...#...,#....#,...#====#',
'#..o.#.o..#.o..#..o.#.o..#',
'###D####D####D####D####P##',
'#,......o.......o......,,#',
'#S...T.....T.....T.....,,#',
'#,..........m...........,#',
'#,......o.......o......,,#',
'###D####D####D####D###D###',
'#....#.$..#....#L...#...A#',
'#.T..#..T.#.T.T#....#....#',
'#..$.v....v....v....v....#',
'#XX..#..,,#,,..#.,,.#.,..#',
'##########################',
],
guards: [{ p: [[22, 7], [22, 8], [3, 8], [3, 7]], w: 1.4, s: 1 }, { p: [[21, 4], [24, 4], [24, 2]], w: 1.8, s: 0.9 },
{ p: [[17, 11], [17, 14], [13, 12]], w: 1.5, s: 1 }],
cams: [[25, 2, 180, 35, 0.5], [11, 5, 90, 60, 0.4], [11, 10, 270, 55, 0.45]], laser: { per: 3.0, duty: 0.55, ph: 0.0 } },
{ name: 'Deposit Boxes', site: 1, val: 3000, vault: 3, cash: 40000, lock: 60, par: 240,
brief: 'A laser fence splits the box hall. The manager keeps the vault keycard in the west office. The maintenance ring runs all the way round.',
map: [
'##########################',
'#S,,,,,,,,,,,,,,,,,,,,,,,#',
'#,###D###########v######,#',
'#,#.....#....=....#....#,#',
'#,#..T..D....=....D..$.#,#',
'#,#.....#....=....#....#,#',
'#,##D####....=....######,#',
'#,#....,#....=....#,..$#,#',
'#,#.k..,D....=....D....#,#',
'#,#....,#....=....#.L..#,#',
'#,#..T.,#....=....#....#,#',
'#,#####A#....=....##K###,#',
'#,v..$..#....=....#.,V.#,#',
'#,##########D###########,#',
'#,,,,,,,,,,,,,,,,,,,,,XX,#',
'##########################',
],
guards: [{ p: [[23, 1], [24, 13], [3, 14], [3, 1]], w: 1.0, s: 1 }, { p: [[10, 4], [10, 11], [12, 11]], w: 1.6, s: 1 },
{ p: [[16, 4], [16, 11]], w: 1.6, s: 1 }, { p: [[20, 4], [20, 8], [21, 9]], w: 1.4, s: 0.9 }],
cams: [[8, 6, 0, 40, 0.5], [18, 6, 180, 40, 0.55]], laser: { per: 3.4, duty: 0.5, ph: 0.22 } },
{ name: 'The Undercroft', site: 1, val: 3400, vault: 4, cash: 52000, lock: 60, par: 270,
brief: 'The deep vault. Plates ring the safe, spare guard bots sleep in the dock and wake on any alarm. Two hatches bypass the security hall.',
map: [
'##########################',
'#S..,#.R.R.R.R.R.R.#L..L.#',
'#...,D.R.R.R.R.R.R.D.....#',
'#...,#.........$...#..$.k#',
'#.o.,#.R.R.o.R.R.R.#.o...#',
'#v#D######D####D#####D####',
'#,,....m.......o.....m..,#',
'#,,..T.....,c,,.....T...,#',
'#v##D####P#####K####D#####',
'#.....A#..^....^..#......#',
'#......#.^......^.#,,....#',
'#..c..,#..........D......#',
'#......D....V.....#..XX..#',
'#.L....#.^......^.#,,....#',
'#......#..^....^..#.$..L.#',
'#.$...,#....$.....#......#',
'##########################',
],
guards: [{ p: [[6, 3], [18, 3], [16, 1], [8, 1]], w: 1.4, s: 1 }, { p: [[2, 6], [23, 7]], w: 2.0, s: 1 },
{ p: [[9, 10], [16, 10], [16, 14], [9, 14]], w: 1.2, s: 1 }, { p: [[20, 10], [23, 15]], w: 1.6, s: 1 }],
dorm: [[2, 10], [4, 14]],
cams: [[7, 10, 0, 40, 0.5], [18, 13, 180, 40, 0.5], [12, 5, 90, 55, 0.45]], laser: null },
{ name: 'Cold Aisle', site: 2, val: 3800, vault: 3, cash: 58000, lock: 60, par: 240,
brief: 'Rack rows make long sightlines. Cameras watch the aisle ends. The core keycard sits at the far side of the hall.',
map: [
'##########################',
'#S...#,,,,,,,,,,,,#.....V#',
'#....D,,,,,,,,,,,,K..$...#',
'#.o..#####D######D########',
'#....D...................#',
'#....#.RRRRRR.RRRRRR.RRR.#',
'#,...#.....m.......o....k#',
'#,...#.RRR.RRRRRR.RRRRRR.#',
'#,.L.D......$............#',
'#,...#.RRRRRR.RRR.RRRRRR.#',
'#,...#..o.......m.....$..#',
'#,...#.RRRRRR.RRRRRR.RRR.#',
'#,...#........$..........#',
'#v####A#######D#########v#',
'#,,,,,,,,,,,,,,,,,,,,,,XX#',
'##########################',
],
guards: [{ p: [[6, 1], [17, 2]], w: 1.8, s: 1 }, { p: [[6, 4], [24, 4], [24, 8], [6, 8]], w: 1.2, s: 1 },
{ p: [[6, 10], [24, 10], [24, 12], [6, 12]], w: 1.2, s: 1 }],
cams: [[5, 6, 0, 14, 0.6], [25, 10, 180, 14, 0.6], [12, 0, 90, 45, 0.5]], laser: null },
{ name: 'Core Sync', site: 2, val: 4200, vault: 4, cash: 66000, lock: 55, par: 250,
brief: 'Three server rooms in a row, joined by rolling laser gates up top and doors below. The maintenance duct runs under all of them.',
map: [
'##########################',
'#S..#....#....#....#....V#',
'#...#.T..=.$..=..T.#..$..#',
'#...D....=....=....K.....#',
'#.o.#..o.=..o.=.o..#.....#',
'#...#....#....#....#######',
'#...#....#....#....#,,,,,#',
'#.L.#.R..D..R.P.R..D,,,,,#',
'#...#.R..#..R.#.R..#,,X,,#',
'#...#.$..#....#..$.#,,X,,#',
'#.o.#....#.ok.#....#,,,,,#',
'#...#..m.#....#.m..#,,,,,#',
'#...##v####v####v###,,,,,#',
'#...,,,,,,,,,,,,,,,,,,,,,#',
'##########################',
],
guards: [{ p: [[5, 6], [8, 10]], w: 1.6, s: 1 }, { p: [[10, 2], [13, 11], [10, 11]], w: 1.4, s: 1 },
{ p: [[15, 5], [18, 11]], w: 1.6, s: 1 }, { p: [[21, 6], [23, 13], [5, 13]], w: 1.4, s: 1 }],
cams: [[25, 9, 180, 30, 0.5], [9, 9, 180, 30, 0.5], [14, 10, 0, 30, 0.5], [24, 5, 270, 35, 0.6]], laser: { per: 2.8, duty: 0.5, ph: 0.3 } },
{ name: 'Blackout Protocol', site: 2, val: 4600, vault: 4, cash: 76000, lock: 55, par: 270,
brief: 'The ops centre runs five bots and two spares. Hack the panel in the ops room to loop the cameras, then slip into the core vault.',
map: [
'##########################',
'#S..,#..............#..V.#',
'#...,#.RRRR.RRRR.RR.#.$..#',
'#...,D......o.......K....#',
'#.L.,#.RR.RRRR.RRRR.#....#',
'#...,#..$...m.......######',
'#...,#.RRRR.RR.RRRR.#,,,,#',
'#...,#.......o......D,,,,#',
'#,,,,#.RR.RRRR.RRRR.#,c,,#',
'#,,,,#......$.......#,,,,#',
'#v#####D#########D###,,,,#',
'#,,,#....A....#.....D,,,,#',
'#,X,D..T...T..D..m..#,,,,#',
'#,X,#.........#.k$..#,,,,#',
'#,,,#..L...L..#.....D,,,,#',
'##########################',
],
guards: [{ p: [[6, 1], [19, 1], [19, 9], [6, 9]], w: 1.2, s: 1 }, { p: [[6, 5], [19, 5]], w: 1.6, s: 1 },
{ p: [[22, 6], [23, 14]], w: 1.4, s: 1 }, { p: [[6, 12], [13, 12]], w: 1.6, s: 1 }, { p: [[3, 9], [3, 5]], w: 1.6, s: 1 }],
dorm: [[6, 13], [12, 13]],
cams: [[5, 7, 0, 18, 0.6], [25, 10, 180, 30, 0.5], [20, 1, 180, 15, 0.6], [14, 14, 180, 40, 0.5]], laser: null },
{ name: 'Night Shift', site: 3, val: 5000, vault: 4, cash: 84000, lock: 60, par: 270,
brief: 'Saltgate after dark: sodium lamps, long container rows and five patrol bots. The strongbox is in the harbour office. The boat waits at the pier.',
map: [
'############################',
'#S..,,,,....o.......,,,,...#',
'#..RRRR..RRRRRR..RRRR..RR..#',
'#..RRRR,,RRRRRR,,RRRR..RR..#',
'#....,,,,..$.....,,..o.....#',
'#.RR.RRRR.RR..RRRR.RR.RRRR.#',
'#.RR.RRRR.RR..RRRR.RR.RRRR.#',
'#,,,,..o...,,,,...m..,,,,..#',
'#RRRR.RR.RRRRRR.RRRR.RR.RR.#',
'#RRRR.RR,RRRRRR.RRRR,RR.RR.#',
'#.....,,,....$.,,,,.....o..#',
'####K######..######D########',
'#..o.....v.,,.#..T...T..$..#',
'#.L...V..#.,,.D..T...T.....#',
'#.$....A.#.,,.#..T...T..k..#',
'#,,,,,,,,#.,,.#,,,,,,,,,,,,#',
'##########XXXX##############',
'############################',
],
guards: [{ p: [[26, 4], [1, 4]], w: 1.4, s: 1 }, { p: [[26, 7], [1, 7]], w: 1.4, s: 1 }, { p: [[1, 10], [26, 10], [24, 7]], w: 1.2, s: 1 },
{ p: [[15, 12], [26, 15]], w: 1.6, s: 1 }, { p: [[11, 12], [12, 15]], w: 1.8, s: 0.9 }],
cams: [[9, 11, 270, 45, 0.45], [27, 10, 180, 20, 0.5]], laser: null },
{ name: 'Customs Hold', site: 3, val: 5600, vault: 4, cash: 96000, lock: 55, par: 280,
brief: 'Seized cargo sits behind a laser scanner hall. The customs office keycard is in the east hold. The west storage has a duct down to the office.',
map: [
'############################',
'#S.,,,,RRRR,,,,o,,,,RRRR...#',
'#...,,,RRRR.......,,RRRR.$.#',
'#..........m...........,,..#',
'##D#######P######D#######D##',
'#....#..=..=..=..#,,,,,,,,,#',
'#.L..D..=..=..=..D..RR..RR.#',
'#....#..=..=..=..#..RR..RR.#',
'#.$..#..=..=..=..#......$k.#',
'#....#..=..=..=..#,,RR..RR,#',
'##v###.....o.....##D########',
'#,,,,######K#####.,,,,,,,,,#',
'#,,,,D...$...V#............#',
'#,,,,#.T..T...#....RR..RR..#',
'#,,,,#..o...L.P....RR..RR..#',
'#,,,,#.$......#.......XXXX.#',
'############################',
],
guards: [{ p: [[26, 3], [1, 3]], w: 1.4, s: 1 }, { p: [[7, 5], [15, 10]], w: 1.4, s: 1 }, { p: [[18, 6], [26, 9], [19, 9]], w: 1.4, s: 1 },
{ p: [[16, 12], [26, 12], [26, 15]], w: 1.4, s: 1 }, { p: [[8, 13], [12, 15]], w: 1.8, s: 0.9 }],
cams: [[17, 7, 180, 40, 0.5], [5, 8, 0, 40, 0.55], [27, 13, 180, 35, 0.5]], laser: { per: 2.6, duty: 0.5, ph: 0.33 } },
{ name: 'The Last Crate', site: 3, val: 6200, vault: 5, cash: 120000, lock: 50, par: 300,
brief: 'One crate, one fortune. The sanctum sits inside a guarded compound: lasers at the gate, plates by the side doors, a hatch from the south strip.',
map: [
'############################',
'#S..,,,,.......o.......,,,.#',
'#..RRRR..RRRR....RRRR..RRRR#',
'#..RRRR..RRRR.m..RRRR......#',
'#,,....,,.....$.....,,,..o.#',
'#.RR.#########D##########..#',
'#.RR.#,,,,...===...,,,,,#..#',
'#....#.L..########...L..#..#',
'#.RR.#....#.$..$.#......#..#',
'#.RR.D.^^.P..V...K.^^...D..#',
'#....#....#......#......#.k#',
'#..o.#..o.###v####..o...#..#',
'#....#,,,,,,,,,,,,,,,,,,#..#',
'#.RR.###D###########v####..#',
'#.......,,,,......,,,,.....#',
'#..RRR..RRR..o..RRR..RRR...#',
'#,,,,,,,,,,,XXXX,,,,,,,,,,,#',
'############################',
],
guards: [{ p: [[26, 4], [1, 4]], w: 1.2, s: 1 }, { p: [[6, 7], [9, 12]], w: 1.4, s: 1 }, { p: [[23, 7], [18, 12]], w: 1.4, s: 1 },
{ p: [[6, 12], [23, 12]], w: 1.6, s: 1 }, { p: [[1, 14], [26, 14]], w: 1.2, s: 1 }, { p: [[25, 5], [26, 15]], w: 1.4, s: 1 }],
dorm: [[8, 8], [21, 10]],
cams: [[14, 7, 270, 50, 0.45], [10, 11, 180, 30, 0.5], [17, 11, 0, 30, 0.5], [27, 9, 180, 30, 0.5]], laser: { per: 2.4, duty: 0.5, ph: 0.0 } },
];

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
function easeOut(t) { const u = 1 - clamp(t, 0, 1); return 1 - u * u * u; }
function fmtCash(n) {
const s = String(Math.max(0, Math.round(n)));
let out = '';
for (let i = 0; i < s.length; i++) { if (i > 0 && (s.length - i) % 3 === 0) out += ','; out += s.charAt(i); }
return '$' + out;
}
function fmtTime(sec) {
const s = Math.max(0, Math.floor(sec)), m = Math.floor(s / 60), r = s % 60;
return m + ':' + (r < 10 ? '0' : '') + r;
}
function font(size, family, weight) { return (weight ? weight + ' ' : '') + size + 'px ' + family; }
function txt(ctx, s, x, y, size, family, color, align, maxW, weight) {
ctx.font = font(size, family, weight);
if (maxW) {
const w = ctx.measureText(s).width;
if (w > maxW) { size = Math.max(8, Math.floor(size * maxW / w)); ctx.font = font(size, family, weight); }
}
ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
ctx.fillText(s, x, y);
}
function roundRectPath(ctx, x, y, w, h, r) {
const rr = Math.max(0, Math.min(r, w / 2, h / 2));
ctx.beginPath();
ctx.moveTo(x + rr, y);
ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr);
ctx.closePath();
}
function panel(ctx, x, y, w, h) {
roundRectPath(ctx, x, y, w, h, 18);
ctx.fillStyle = UI.panel; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = UI.stroke; ctx.stroke();
}
function wrapLines(ctx, text, maxW, size, family, weight) {
ctx.font = font(size, family, weight);
const words = String(text).split(' '), out = [];
let line = '';
for (let i = 0; i < words.length; i++) {
const test = line ? line + ' ' + words[i] : words[i];
if (line && ctx.measureText(test).width > maxW) { out.push(line); line = words[i]; } else line = test;
}
if (line) out.push(line);
return out;
}
function hexCss(h, a) {
const r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255;
return a === undefined ? 'rgb(' + r + ', ' + g + ', ' + b + ')' : 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

const CH_TILE = { '#': T_WALL, 'g': T_GLASS, 'R': T_RACK, 'T': T_PROP, 'D': T_DOOR, 'K': T_DOOR, 'P': T_DOOR, 'v': T_VENT,
'L': T_LOCKER, 'V': T_VAULT, 'A': T_PANEL, 'X': T_EXIT, '=': T_LASER, '^': T_PLATE };
function parseHeist(def) {
const rows = def.map, H = Math.min(MAXH, rows.length);
let W = 0;
for (let z = 0; z < H; z++) W = Math.max(W, rows[z].length);
W = Math.min(MAXW, W);
const tile = new Uint8Array(W * H), shade = new Uint8Array(W * H), marks = [];
for (let z = 0; z < H; z++) {
for (let x = 0; x < W; x++) {
let ch = rows[z].charAt(x) || '#';
if (x === 0 || z === 0 || x === W - 1 || z === H - 1) { if (ch !== 'X' && ch !== '#') ch = '#'; }
const t = CH_TILE[ch];
tile[z * W + x] = t === undefined ? T_FLOOR : t;
if (ch === ',') shade[z * W + x] = 1;
if ('SVk$LKPmAco'.indexOf(ch) >= 0 || ch === 'D') marks.push({ ch: ch, x: x, z: z });
}
}
return { W: W, H: H, tile: tile, shade: shade, marks: marks };
}

function thumb(ctx, w, h) {
const sx = w / 480, sy = h / 300;
ctx.save();
ctx.scale(sx, sy);
let g = ctx.createLinearGradient(0, 0, 0, 300);
g.addColorStop(0, '#070b18'); g.addColorStop(1, '#141c33');
ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 300);
function poly(pts, col) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
for (let r = 0; r < 7; r++) {
for (let c = 0; c < 10; c++) {
const x0 = -40 + c * 56 + r * 6, y0 = 120 + r * 26, shade = ((r * 7 + c * 3) % 5) * 3;
poly([x0, y0, x0 + 56, y0, x0 + 62, y0 + 26, x0 + 6, y0 + 26], 'rgb(' + (26 + shade) + ', ' + (34 + shade) + ', ' + (56 + shade) + ')');
}
}
g = ctx.createRadialGradient(330, 210, 4, 330, 210, 120);
g.addColorStop(0, 'rgba(140, 180, 255, 0.35)'); g.addColorStop(1, 'rgba(140, 180, 255, 0)');
ctx.fillStyle = g; ctx.fillRect(200, 100, 260, 200);
poly([0, 40, 480, 40, 480, 122, 0, 122], '#1d2742');
poly([0, 118, 480, 118, 480, 126, 0, 126], '#3b4c74');
for (let i = 0; i < 8; i++) poly([i * 64, 40, i * 64 + 3, 40, i * 64 + 3, 118, i * 64, 118], 'rgba(0, 0, 0, 0.25)');
ctx.save();
ctx.translate(96, 82);
ctx.shadowColor = '#FFC93C'; ctx.shadowBlur = 18;
ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.fillStyle = '#56607a'; ctx.fill();
ctx.shadowBlur = 0;
ctx.beginPath(); ctx.arc(0, 0, 29, 0, TAU); ctx.fillStyle = '#2a3249'; ctx.fill();
ctx.strokeStyle = '#FFC93C'; ctx.lineWidth = 3;
ctx.beginPath(); ctx.arc(0, 0, 20, -0.4, TAU - 0.9); ctx.stroke();
for (let i = 0; i < 6; i++) {
const a = i * TAU / 6;
ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26);
ctx.strokeStyle = '#8b95ad'; ctx.lineWidth = 3; ctx.stroke();
}
ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fillStyle = '#FFC93C'; ctx.fill();
ctx.restore();
for (let i = 0; i < 5; i++) {
const bx = 150 + (i % 3) * 18 + (i > 2 ? 9 : 0), by = 160 - (i > 2 ? 10 : 0);
poly([bx, by, bx + 16, by, bx + 20, by + 8, bx + 4, by + 8], '#ffd25a');
poly([bx + 4, by + 8, bx + 20, by + 8, bx + 20, by + 12, bx + 4, by + 12], '#b8862a');
}
ctx.save();
ctx.globalCompositeOperation = 'lighter';
for (let i = 0; i < 3; i++) {
const y = 150 + i * 16;
ctx.strokeStyle = 'rgba(255, 60, 70, 0.9)'; ctx.lineWidth = 2;
ctx.shadowColor = '#ff3344'; ctx.shadowBlur = 10;
ctx.beginPath(); ctx.moveTo(226, y); ctx.lineTo(246, y + 70); ctx.stroke();
}
ctx.restore();
ctx.save();
ctx.globalCompositeOperation = 'lighter';
g = ctx.createRadialGradient(392, 168, 6, 392, 168, 200);
g.addColorStop(0, 'rgba(255, 201, 60, 0.55)'); g.addColorStop(1, 'rgba(255, 120, 40, 0)');
ctx.fillStyle = g;
ctx.beginPath(); ctx.moveTo(392, 168); ctx.lineTo(250, 112); ctx.lineTo(236, 250); ctx.closePath(); ctx.fill();
ctx.restore();
poly([372, 196, 412, 196, 418, 206, 366, 206], 'rgba(0, 0, 0, 0.45)');
poly([376, 150, 408, 150, 412, 196, 372, 196], '#3e4a66');
poly([376, 150, 392, 150, 390, 196, 372, 196], '#4f5d80');
poly([380, 128, 404, 128, 406, 150, 378, 150], '#56648a');
ctx.save();
ctx.shadowColor = '#FFC93C'; ctx.shadowBlur = 14;
poly([380, 136, 404, 136, 404, 142, 380, 142], '#FFC93C');
ctx.restore();
ctx.save();
ctx.shadowColor = '#FFC93C'; ctx.shadowBlur = 12;
ctx.beginPath(); ctx.arc(392, 108, 12, 0, TAU); ctx.fillStyle = 'rgba(16, 22, 38, 0.9)'; ctx.fill();
ctx.lineWidth = 3; ctx.strokeStyle = '#FFC93C';
ctx.beginPath(); ctx.arc(392, 108, 12, -Math.PI / 2, -Math.PI / 2 + TAU * 0.62); ctx.stroke();
ctx.fillStyle = '#FFC93C'; ctx.font = '900 16px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillText('?', 392, 109);
ctx.restore();
g = ctx.createLinearGradient(0, 0, 210, 0);
g.addColorStop(0, 'rgba(0, 0, 0, 0.55)'); g.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = g; ctx.fillRect(0, 126, 220, 174);
poly([150, 250, 196, 250, 200, 258, 146, 258], 'rgba(0, 0, 0, 0.5)');
poly([156, 214, 186, 210, 194, 250, 152, 250], '#1b2130');
poly([160, 218, 172, 214, 170, 250, 154, 250], '#252d40');
poly([162, 192, 184, 190, 188, 212, 160, 214], '#202738');
ctx.save();
ctx.shadowColor = '#5FE6FF'; ctx.shadowBlur = 12;
poly([166, 198, 186, 196, 186, 201, 166, 203], '#5FE6FF');
ctx.restore();
poly([184, 214, 200, 212, 202, 236, 186, 238], '#2c3550');
ctx.strokeStyle = 'rgba(95, 230, 255, 0.6)'; ctx.lineWidth = 2;
ctx.beginPath(); ctx.ellipse(174, 254, 34, 9, 0, 0, TAU); ctx.stroke();
ctx.save();
ctx.globalCompositeOperation = 'lighter';
ctx.strokeStyle = 'rgba(95, 230, 255, 0.8)'; ctx.lineWidth = 2; ctx.shadowColor = '#5FE6FF'; ctx.shadowBlur = 8;
ctx.beginPath(); ctx.moveTo(200, 206);
for (let i = 1; i <= 8; i++) ctx.lineTo(200 + i * 21, 206 - Math.sin(i * 1.7) * 9 - i * 4);
ctx.stroke();
ctx.restore();
g = ctx.createRadialGradient(240, 160, 120, 240, 160, 300);
g.addColorStop(0, 'rgba(0, 0, 0, 0)'); g.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 300);
ctx.restore();
}

function webglAvailable() {
try {
const c = document.createElement('canvas');
const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
if (!gl) return false;
const lose = gl.getExtension('WEBGL_lose_context');
if (lose) lose.loseContext();
return true;
} catch (err) { return false; }
}

function mount(root, api) {
const THREE = window.THREE;
function notice(text) {
const d = document.createElement('div');
d.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;' +
'padding:24px;box-sizing:border-box;text-align:center;background:#05070d;color:#C9D3E3;font:600 18px ' + FONT_B + ';';
d.textContent = text;
root.appendChild(d);
return { destroy: function () { if (d.parentNode) d.parentNode.removeChild(d); }, restart: function () { /* nothing to restart */ } };
}
if (!THREE || !THREE.WebGLRenderer) return notice("The 3D engine didn't load. Check your internet connection and press Restart.");
const NO_GL = 'This game needs WebGL (3D graphics), which is turned off in this browser.';
if (!webglAvailable()) return notice(NO_GL);
const CSS = 'position:absolute;left:0;top:0;display:block;width:100%;height:100%;touch-action:none;outline:none;';
const glCanvas = document.createElement('canvas');
glCanvas.style.cssText = CSS;
let renderer = null;
try {
renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, powerPreference: 'high-performance', alpha: false });
} catch (err) { renderer = null; }
if (!renderer) return notice(NO_GL);
const hud = document.createElement('canvas'); // transparent 2D overlay: HUD, screens and all pointer input
hud.style.cssText = CSS;
hud.tabIndex = 0;
root.appendChild(glCanvas); root.appendChild(hud);
const ctx = hud.getContext('2d');

function start() {
const maxPR = Math.min(window.devicePixelRatio || 1, 1);
let pixelRatio = maxPR;
renderer.setPixelRatio(pixelRatio);
renderer.setClearColor(0x05070d, 1);
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let touchUI = !!api.isTouch;
let destroyed = false, raf = 0, lastT = performance.now(), acc = 0, animT = 0, dirty = true;
let mode = 'title', paused = false, ui = null, overAt = 0;
const view = { w: 1, h: 1, s: 1, dpr: 1 };

function freshSave() {
const h = [];
for (let i = 0; i < HEISTS.length; i++) h.push({ done: false, grade: '', ghost: false, loot: 0, time: 0 });
return { v: 1, cash: 0, career: 0, up: { emp: 0, empT: 0, lure: 0, smoke: 0, drone: 0, shoes: 0, picks: 0 }, h: h, site: [true, false, false, false], last: 0 };
}
function num(v) { return typeof v === 'number' && isFinite(v); }
function loadSave() {
const s = freshSave();
try {
const raw = api.load ? api.load('save') : null;
const o = raw ? JSON.parse(raw) : null;
if (!o || typeof o !== 'object') return s;
if (num(o.cash)) s.cash = clamp(Math.floor(o.cash), 0, 1e9);
if (num(o.career)) s.career = clamp(Math.floor(o.career), 0, 1e10);
if (o.up && typeof o.up === 'object') for (const k in s.up) if (num(o.up[k])) s.up[k] = clamp(Math.floor(o.up[k]), 0, 2);
if (Array.isArray(o.h)) {
for (let i = 0; i < HEISTS.length; i++) {
const e = o.h[i];
if (!e || typeof e !== 'object') continue;
s.h[i].done = e.done === true; s.h[i].ghost = e.ghost === true;
s.h[i].grade = typeof e.grade === 'string' && /^[SABCD]$/.test(e.grade) ? e.grade : '';
if (num(e.loot)) s.h[i].loot = clamp(e.loot, 0, 1);
if (num(e.time)) s.h[i].time = clamp(e.time, 0, 36000);
}
}
if (Array.isArray(o.site)) for (let i = 1; i < SITES.length; i++) s.site[i] = o.site[i] === true;
if (num(o.last)) s.last = clamp(Math.floor(o.last), 0, HEISTS.length - 1);
} catch (err) { /* unreadable save: start fresh */ }
return s;
}
const SV = loadSave();
function writeSave() { try { if (api.save) api.save('save', JSON.stringify(SV)); } catch (err) { /* storage blocked: progress lasts this session */ } }

const own = [], lvOwn = [];
function keep(o) { own.push(o); return o; }
function lkeep(o) { lvOwn.push(o); return o; }
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
scene.fog = new THREE.Fog(0x05070d, 24, 75);
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 160);
camera.position.set(0, 20, 14);
const hemi = new THREE.HemisphereLight(0x8fa6d8, 0x1a1c28, 0.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xc4d2ff, 0.5);
sun.position.set(-14, 30, 20);
scene.add(sun); scene.add(sun.target);
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpS = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color(), tmpE = new THREE.Euler(), UPV = new THREE.Vector3(0, 1, 0);
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
const focusV = new THREE.Vector3();
function setInst(mesh, i, x, y, z, yaw, sx, sy, sz) {
tmpV.set(x, y, z); tmpE.set(0, yaw, 0); tmpQ.setFromEuler(tmpE); tmpS.set(sx, sy, sz);
tmpM.compose(tmpV, tmpQ, tmpS);
mesh.setMatrixAt(i, tmpM);
}
function hideInst(mesh, i) { mesh.setMatrixAt(i, ZERO_M); }

function canvasTex(size, draw, repeat) {
const c = document.createElement('canvas'); c.width = c.height = size;
draw(c.getContext('2d'), size);
const t = keep(new THREE.CanvasTexture(c));
if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
return t;
}
const blobTex = canvasTex(64, function (g, s) {
const gr = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
gr.addColorStop(0, 'rgba(0, 0, 0, 0.75)'); gr.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)'); gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
g.fillStyle = gr; g.fillRect(0, 0, s, s);
});
const glowTex = canvasTex(64, function (g, s) {
const gr = g.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2);
gr.addColorStop(0, 'rgba(255, 255, 255, 1)'); gr.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)'); gr.addColorStop(1, 'rgba(255, 255, 255, 0)');
g.fillStyle = gr; g.fillRect(0, 0, s, s);
});
function speckle(g, s, n, a) {
for (let i = 0; i < n; i++) {
g.fillStyle = Math.random() < 0.5 ? 'rgba(255, 255, 255, ' + (a * Math.random()).toFixed(3) + ')' : 'rgba(0, 0, 0, ' + (a * 1.3 * Math.random()).toFixed(3) + ')';
const r = 1 + Math.random() * 2.5;
g.fillRect(Math.random() * s, Math.random() * s, r, r);
}
}
const floorTexes = [], wallTexes = [], rackTexes = [];
function floorTex(site) {
if (floorTexes[site]) return floorTexes[site];
floorTexes[site] = canvasTex(128, function (g, s) {
g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, s, s);
speckle(g, s, 260, 0.12);
g.strokeStyle = 'rgba(0, 0, 0, 0.35)'; g.lineWidth = 3;
if (site === 0) { g.strokeRect(1, 1, s - 2, s - 2); g.fillStyle = 'rgba(255, 255, 255, 0.10)'; g.fillRect(6, 6, s / 2 - 8, s / 2 - 8); }
else if (site === 1) { g.fillStyle = 'rgba(0, 0, 0, 0.12)'; g.fillRect(0, 0, s / 2, s / 2); g.fillRect(s / 2, s / 2, s / 2, s / 2); g.strokeRect(0, 0, s, s); }
else if (site === 2) { g.strokeRect(2, 2, s - 4, s - 4); g.fillStyle = 'rgba(0, 0, 0, 0.25)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(14 + i * 28, 14 + j * 28, 6, 6); }
else { g.fillStyle = 'rgba(255, 220, 120, 0.18)'; g.fillRect(0, s * 0.47, s, s * 0.06); speckle(g, s, 300, 0.15); }
}, false);
return floorTexes[site];
}
function wallTex(site) {
if (wallTexes[site]) return wallTexes[site];
wallTexes[site] = canvasTex(128, function (g, s) {
g.fillStyle = '#d0d0d0'; g.fillRect(0, 0, s, s);
speckle(g, s, 200, 0.1);
g.fillStyle = 'rgba(0, 0, 0, 0.28)'; g.fillRect(0, s * 0.86, s, s * 0.14);
g.fillStyle = 'rgba(255, 255, 255, 0.18)'; g.fillRect(0, 0, s, s * 0.06);
g.strokeStyle = 'rgba(0, 0, 0, 0.3)'; g.lineWidth = 2;
g.beginPath(); g.moveTo(s / 2, s * 0.06); g.lineTo(s / 2, s * 0.86); g.stroke();
if (site === 3) { for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(0, 0, 0, 0.18)'; g.fillRect(i * 16, 0, 3, s); } }
}, false);
return wallTexes[site];
}
function rackTex(site) {
if (rackTexes[site]) return rackTexes[site];
rackTexes[site] = canvasTex(128, function (g, s) {
g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, s, s);
if (site === 2) {
g.fillStyle = '#2a2a2a'; g.fillRect(6, 6, s - 12, s - 12);
for (let r = 0; r < 12; r++) {
g.fillStyle = 'rgba(255, 255, 255, 0.12)'; g.fillRect(10, 10 + r * 9.5, s - 20, 6);
for (let k = 0; k < 3; k++) { g.fillStyle = Math.random() < 0.7 ? '#4fe3ff' : '#4be3a0'; g.fillRect(14 + k * 7 + Math.random() * 60, 12 + r * 9.5, 3, 2); }
}
} else if (site === 3) {
for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)'; g.fillRect(i * 8, 0, 8, s); }
g.fillStyle = 'rgba(0, 0, 0, 0.3)'; g.fillRect(0, 0, s, 6); g.fillRect(0, s - 6, s, 6);
} else {
speckle(g, s, 200, 0.12);
for (let r = 0; r < 4; r++) { g.fillStyle = 'rgba(0, 0, 0, 0.3)'; g.fillRect(0, r * 32 + 28, s, 4); }
}
}, false);
return rackTexes[site];
}

const baseBox = keep(new THREE.BoxGeometry(1, 1, 1));
baseBox.translate(0, 0.5, 0);
(function () {
const pos = baseBox.getAttribute('position'), nor = baseBox.getAttribute('normal'), n = pos.count, col = new Float32Array(n * 3);
for (let i = 0; i < n; i++) {
const y = pos.getY(i), top = nor.getY(i) > 0.5;
const v = top ? 1.0 : 0.38 + 0.5 * y;
col[i * 3] = v; col[i * 3 + 1] = v; col[i * 3 + 2] = v;
}
baseBox.setAttribute('color', new THREE.BufferAttribute(col, 3));
})();
const cBox = keep(new THREE.BoxGeometry(1, 1, 1));
const flatG = keep(new THREE.PlaneGeometry(1, 1)); flatG.rotateX(-Math.PI / 2);
const ringG = keep(new THREE.RingGeometry(0.86, 1, 40)); ringG.rotateX(-Math.PI / 2);
const octG = keep(new THREE.OctahedronGeometry(0.32, 0));
const cylG = keep(new THREE.CylinderGeometry(0.5, 0.5, 1, 12)); cylG.translate(0, 0.5, 0);
const sphG = keep(new THREE.SphereGeometry(0.5, 10, 8));
const icoG = keep(new THREE.IcosahedronGeometry(1, 1));
function basicMat(col, add, opacity) {
return new THREE.MeshBasicMaterial({ color: col, transparent: !!add || opacity !== undefined, opacity: opacity === undefined ? 1 : opacity,
blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !add && opacity === undefined, fog: true });
}
function inst(geo, mat, n, colored, cull) {
const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
if (colored) { for (let i = 0; i < Math.max(1, n); i++) m.setColorAt(i, tmpC.setRGB(1, 1, 1)); }
for (let i = 0; i < Math.max(1, n); i++) hideInst(m, i);
if (!cull) m.frustumCulled = false;
m.count = n;
return m;
}

const dyn = new THREE.Group();
scene.add(dyn);
const gBaseMat = keep(new THREE.MeshLambertMaterial({ color: 0x2a3142 }));
const gBodyMat = keep(new THREE.MeshLambertMaterial({ color: 0x8c99b5 }));
const gHeadMat = keep(new THREE.MeshLambertMaterial({ color: 0xaab6cf }));
const gVisMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff }));
const gSkirtG = keep(new THREE.CylinderGeometry(0.34, 0.46, 0.35, 10)); gSkirtG.translate(0, 0.28, 0);
const gBodyG = keep(new THREE.BoxGeometry(0.72, 0.8, 0.52)); gBodyG.translate(0, 0.86, 0);
const gHeadG = keep(new THREE.BoxGeometry(0.56, 0.38, 0.48)); gHeadG.translate(0, 1.5, 0);
const gVisG = keep(new THREE.BoxGeometry(0.46, 0.11, 0.06)); gVisG.translate(0, 1.52, 0.25);
const gMesh = [inst(gSkirtG, gBaseMat, MAXG, false), inst(gBodyG, gBodyMat, MAXG, false), inst(gHeadG, gHeadMat, MAXG, false), inst(gVisG, gVisMat, MAXG, true)];
for (let i = 0; i < 4; i++) dyn.add(gMesh[i]);
const camBodyG = keep(new THREE.BoxGeometry(0.34, 0.3, 0.62)); camBodyG.translate(0, 0, 0.18);
const camLensG = keep(new THREE.BoxGeometry(0.22, 0.18, 0.06)); camLensG.translate(0, 0, 0.5);
const cBodyMat = keep(new THREE.MeshLambertMaterial({ color: 0x9aa6bd }));
const cLensMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff }));
const camMesh = [inst(camBodyG, cBodyMat, MAXC, false), inst(camLensG, cLensMat, MAXC, true)];
dyn.add(camMesh[0]); dyn.add(camMesh[1]);
const thief = new THREE.Group();
const tBodyMat = keep(new THREE.MeshLambertMaterial({ color: 0x2b3245 }));
const tDarkMat = keep(new THREE.MeshLambertMaterial({ color: 0x1a1f2c }));
const tGlowMat = keep(new THREE.MeshBasicMaterial({ color: 0x5fe6ff }));
const tBody = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.26, 0.32, 0.86, 10)), tBodyMat); tBody.position.y = 0.62;
const tHead = new THREE.Mesh(keep(new THREE.SphereGeometry(0.23, 10, 8)), tDarkMat); tHead.position.y = 1.24;
const tGog = new THREE.Mesh(keep(new THREE.BoxGeometry(0.34, 0.07, 0.1)), tGlowMat); tGog.position.set(0, 1.27, 0.17);
const tPack = new THREE.Mesh(keep(new THREE.BoxGeometry(0.38, 0.42, 0.2)), tDarkMat); tPack.position.set(0, 0.78, -0.27);
const tLegs = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.2, 0.18, 0.36, 8)), tDarkMat); tLegs.position.y = 0.18;
thief.add(tBody); thief.add(tHead); thief.add(tGog); thief.add(tPack); thief.add(tLegs);
dyn.add(thief);
const youRing = new THREE.Mesh(ringG, keep(basicMat(0x5fe6ff, true))); youRing.scale.set(0.62, 1, 0.62);
dyn.add(youRing);
const blobMat = keep(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, color: 0xffffff }));
const blobs = inst(flatG, blobMat, MAXG + 2, false); dyn.add(blobs);
const drone = new THREE.Group();
const dBody = new THREE.Mesh(keep(new THREE.BoxGeometry(0.42, 0.14, 0.42)), keep(new THREE.MeshLambertMaterial({ color: 0x6a5a9a })));
const dRot = new THREE.Mesh(keep(new THREE.TorusGeometry(0.36, 0.04, 4, 16)), keep(new THREE.MeshBasicMaterial({ color: 0xb58cff })));
dRot.rotation.x = Math.PI / 2;
drone.add(dBody); drone.add(dRot); drone.visible = false; dyn.add(drone);
const lureMat = keep(new THREE.MeshBasicMaterial({ color: 0xffb347 }));
const lureMeshes = [];
for (let i = 0; i < MAX_LURE; i++) { const m = new THREE.Mesh(sphG, lureMat); m.scale.setScalar(0.24); m.visible = false; dyn.add(m); lureMeshes.push(m); }
const empMesh = new THREE.Mesh(sphG, keep(basicMat(0x5fe6ff, true))); empMesh.scale.setScalar(0.5); empMesh.visible = false; dyn.add(empMesh);
const aimMat = keep(basicMat(0xffc93c, true));
const aimRing = new THREE.Mesh(ringG, aimMat); aimRing.visible = false; dyn.add(aimRing);
const smokeMat = keep(new THREE.MeshLambertMaterial({ color: 0x9aa3b5, transparent: true, opacity: 0.62, depthWrite: false }));
const smokeMesh = inst(icoG, smokeMat, MAX_SMOKE * 7, false); dyn.add(smokeMesh);
const noiseMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
const NOISE_N = 6;
const noiseMesh = inst(ringG, noiseMat, NOISE_N, true); dyn.add(noiseMesh);
const noiseFx = [];
for (let i = 0; i < NOISE_N; i++) noiseFx.push({ on: false, x: 0, z: 0, r: 0, t: 0, col: 0 });
const CONE_V = CONE_R + 1, CONE_MAX = MAXG + MAXC;
const conePos = new Float32Array(CONE_MAX * CONE_V * 3), coneCol = new Float32Array(CONE_MAX * CONE_V * 3);
const coneIdx = new Uint16Array(CONE_MAX * (CONE_R - 1) * 3);
for (let c = 0, k = 0; c < CONE_MAX; c++) for (let i = 0; i < CONE_R - 1; i++) { coneIdx[k++] = c * CONE_V; coneIdx[k++] = c * CONE_V + 1 + i; coneIdx[k++] = c * CONE_V + 2 + i; }
const coneGeo = keep(new THREE.BufferGeometry());
coneGeo.setAttribute('position', new THREE.BufferAttribute(conePos, 3));
coneGeo.setAttribute('color', new THREE.BufferAttribute(coneCol, 3));
coneGeo.setIndex(new THREE.BufferAttribute(coneIdx, 1));
coneGeo.setDrawRange(0, 0);
const coneMesh = new THREE.Mesh(coneGeo, keep(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
coneMesh.frustumCulled = false; coneMesh.renderOrder = 2;
dyn.add(coneMesh);
const partPos = new Float32Array(MAX_P * 3), partCol = new Float32Array(MAX_P * 3);
const pvx = new Float32Array(MAX_P), pvy = new Float32Array(MAX_P), pvz = new Float32Array(MAX_P), plife = new Float32Array(MAX_P), pmax = new Float32Array(MAX_P);
const pr0 = new Float32Array(MAX_P), pg0 = new Float32Array(MAX_P), pb0 = new Float32Array(MAX_P);
for (let i = 0; i < MAX_P; i++) partPos[i * 3 + 1] = -100;
const partGeo = keep(new THREE.BufferGeometry());
partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
partGeo.setAttribute('color', new THREE.BufferAttribute(partCol, 3));
const parts = new THREE.Points(partGeo, keep(new THREE.PointsMaterial({ size: 0.32, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
parts.frustumCulled = false; dyn.add(parts);
let partNext = 0;
function spark(x, y, z, vx, vy, vz, life, r, g, b) {
const i = partNext; partNext = (partNext + 1) % MAX_P;
partPos[i * 3] = x; partPos[i * 3 + 1] = y; partPos[i * 3 + 2] = z;
pvx[i] = vx; pvy[i] = vy; pvz[i] = vz; plife[i] = life; pmax[i] = life; pr0[i] = r; pg0[i] = g; pb0[i] = b;
}
function burst(x, y, z, n, spd, life, r, g, b, up) {
for (let k = 0; k < n; k++) {
const a = Math.random() * TAU, s = spd * (0.3 + Math.random() * 0.7);
spark(x, y, z, Math.cos(a) * s, (up || 0) + Math.random() * spd * 0.6, Math.sin(a) * s, life * (0.6 + Math.random() * 0.4), r, g, b);
}
}
const ROUTE_MAX = 600;
const routePos = new Float32Array(ROUTE_MAX * 3);
const routeGeo = keep(new THREE.BufferGeometry());
routeGeo.setAttribute('position', new THREE.BufferAttribute(routePos, 3));
routeGeo.setDrawRange(0, 0);
const routeLines = new THREE.LineSegments(routeGeo, keep(new THREE.LineBasicMaterial({ color: 0xffc93c, transparent: true, opacity: 0.55, depthWrite: false })));
routeLines.frustumCulled = false; dyn.add(routeLines);
const cityN = 700, cityPos = new Float32Array(cityN * 3), cityCol = new Float32Array(cityN * 3);
for (let i = 0; i < cityN; i++) {
const a = Math.random() * TAU, r = 30 + Math.random() * 110;
cityPos[i * 3] = 28 + Math.cos(a) * r; cityPos[i * 3 + 1] = -30 - Math.random() * 6; cityPos[i * 3 + 2] = 16 + Math.sin(a) * r;
const warm = Math.random() < 0.6;
cityCol[i * 3] = warm ? 1 : 0.5; cityCol[i * 3 + 1] = warm ? 0.75 : 0.7; cityCol[i * 3 + 2] = warm ? 0.4 : 1;
}
const cityGeo = keep(new THREE.BufferGeometry());
cityGeo.setAttribute('position', new THREE.BufferAttribute(cityPos, 3));
cityGeo.setAttribute('color', new THREE.BufferAttribute(cityCol, 3));
const city = new THREE.Points(cityGeo, keep(new THREE.PointsMaterial({ size: 0.9, map: glowTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
city.frustumCulled = false; scene.add(city);
const groundMat = keep(new THREE.MeshBasicMaterial({ color: 0x0a0d14 }));
const ground = new THREE.Mesh(flatG, groundMat); ground.position.y = -0.03; scene.add(ground);

const L = {
i: -1, def: null, site: 0, W: 1, H: 1, tile: new Uint8Array(MAXN), shade: new Uint8Array(MAXN), light: new Float32Array(MAXN),
doorAt: new Int16Array(MAXN), laserAt: new Int16Array(MAXN), plateAt: new Int16Array(MAXN), lockerAt: new Int16Array(MAXN),
panelAt: new Int16Array(MAXN), itemAt: new Int16Array(MAXN), checkAt: new Int16Array(MAXN),
doors: [], lasers: [], plates: [], sensors: [], panels: [], lockers: [], checks: [], items: [], lamps: [], exits: [], vault: null,
sx: 0, sz: 0, hasK: false, nVal: 0, lootMax: 0, det: 1, gspd: 1,
};
const LM = {}; // per-level meshes that change at runtime
let lvGroup = null;
const SENSOR_R = 4.6;
const cutMesh = [null, null], cutN = [0, 0];
const cutWho = new Uint8Array(MAXN), cutIdx = new Int16Array(MAXN), cutX = new Float32Array(MAXN), cutZ = new Float32Array(MAXN);
const cutH = new Float32Array(MAXN), cutCur = new Float32Array(MAXN), cutYaw = new Float32Array(MAXN);
let cutTotal = 0;
function wc(c) { return (c + 0.5) * CS; }
function cellAt(x, z) { return (x < 0 || z < 0 || x >= L.W || z >= L.H) ? -1 : z * L.W + x; }
function cellOf(wx, wz) { return cellAt(Math.floor(wx / CS), Math.floor(wz / CS)); }
function isWallish(x, z) {
const ci = cellAt(x, z);
if (ci < 0) return true;
const t = L.tile[ci];
return t === T_WALL || t === T_RACK || t === T_GLASS || t === T_VAULT || t === T_PANEL || t === T_LOCKER;
}
function openCell(t) { return t === T_FLOOR || t === T_EXIT || t === T_LASER || t === T_PLATE; }
function faceDir(x, z) {
for (let d = 0; d < 4; d++) { const ci = cellAt(x + DX4[d], z + DZ4[d]); if (ci >= 0 && openCell(L.tile[ci])) return d; }
for (let d = 0; d < 4; d++) { const ci = cellAt(x + DX4[d], z + DZ4[d]); if (ci >= 0 && L.tile[ci] === T_DOOR) return d; }
return 2;
}
function dirYaw(d) { return Math.atan2(DX4[d], DZ4[d]); } // yaw that makes local +z point along direction d

function unloadLevel() {
if (lvGroup) { lvGroup.traverse(function (o) { if (o.isInstancedMesh && typeof o.dispose === "function") { try { o.dispose(); } catch (err) { /* gone */ } } }); scene.remove(lvGroup); lvGroup = null; }
for (let i = 0; i < lvOwn.length; i++) { try { lvOwn[i].dispose(); } catch (err) { /* already gone */ } }
lvOwn.length = 0;
for (const k in LM) delete LM[k];
cutMesh[0] = cutMesh[1] = null; cutN[0] = cutN[1] = 0; cutTotal = 0;
}

function lampAt(wx, wz) {
let s = 0;
for (let i = 0; i < L.lamps.length; i++) {
const dx = (wx - L.lamps[i].x) / CS, dz = (wz - L.lamps[i].z) / CS, d = Math.sqrt(dx * dx + dz * dz);
if (d < 3.4) { const f = 1 - d / 3.4; s += f * f * 0.95; }
}
return s;
}

function buildLevel(idx) {
unloadLevel();
const def = HEISTS[idx], site = SITES[def.site], P0 = parseHeist(def);
L.i = idx; L.def = def; L.site = def.site; L.W = P0.W; L.H = P0.H;
L.det = 0.62 + 0.06 * idx; L.gspd = 0.86 + 0.025 * idx;
const W = L.W, H = L.H, N = W * H;
L.tile.fill(T_WALL); L.shade.fill(0);
for (let i = 0; i < N; i++) { L.tile[i] = P0.tile[i]; L.shade[i] = P0.shade[i]; }
L.doorAt.fill(-1); L.laserAt.fill(-1); L.plateAt.fill(-1); L.lockerAt.fill(-1); L.panelAt.fill(-1); L.itemAt.fill(-1); L.checkAt.fill(-1);
L.doors = []; L.lasers = []; L.plates = []; L.sensors = []; L.panels = []; L.lockers = []; L.checks = []; L.items = []; L.lamps = []; L.exits = [];
L.vault = null; L.hasK = false; L.nVal = 0; L.sx = wc(1); L.sz = wc(1);
for (let k = 0; k < P0.marks.length; k++) {
const m = P0.marks[k], ci = m.z * W + m.x;
if (m.ch === 'S') { L.sx = wc(m.x); L.sz = wc(m.z); }
else if (m.ch === 'o') L.lamps.push({ x: wc(m.x), z: wc(m.z) });
else if (m.ch === '$' || m.ch === 'k') { L.itemAt[ci] = L.items.length; L.items.push({ cx: m.x, cz: m.z, x: wc(m.x), z: wc(m.z), kind: m.ch, got: false, val: m.ch === '$' ? def.val : 0 }); if (m.ch === '$') L.nVal++; }
else if (m.ch === 'c') { L.checkAt[ci] = L.checks.length; L.checks.push({ cx: m.x, cz: m.z, x: wc(m.x), z: wc(m.z), got: false }); }
else if (m.ch === 'm') L.sensors.push({ x: wc(m.x), z: wc(m.z), cool: 0, off: 0 });
}
for (let z = 0; z < H; z++) {
for (let x = 0; x < W; x++) {
const ci = z * W + x, t = L.tile[ci], ch = def.map[z] ? def.map[z].charAt(x) : '#';
if (t === T_DOOR) {
const kind = ch === 'K' ? 'K' : ch === 'P' ? 'P' : 'D';
if (kind === 'K') L.hasK = true;
L.doorAt[ci] = L.doors.length;
L.doors.push({ cx: x, cz: z, x: wc(x), z: wc(z), kind: kind, lock0: kind === 'K' ? 1 : kind === 'P' ? 2 : 0, lock: 0, open: 0, axis: isWallish(x - 1, z) && isWallish(x + 1, z) ? 0 : 1, pins: 0, seal: -1 });
} else if (t === T_LASER) {
const lz = (cellAt(x - 1, z) >= 0 && L.tile[cellAt(x - 1, z)] === T_LASER) || (cellAt(x + 1, z) >= 0 && L.tile[cellAt(x + 1, z)] === T_LASER);
const lzz = (cellAt(x, z - 1) >= 0 && L.tile[cellAt(x, z - 1)] === T_LASER) || (cellAt(x, z + 1) >= 0 && L.tile[cellAt(x, z + 1)] === T_LASER);
let alongZ;
if (lz) alongZ = false; else if (lzz) alongZ = true;
else if (isWallish(x - 1, z) && isWallish(x + 1, z)) alongZ = false; else alongZ = isWallish(x, z - 1) && isWallish(x, z + 1);
L.laserAt[ci] = L.lasers.length;
L.lasers.push({ cx: x, cz: z, x: wc(x), z: wc(z), alongZ: alongZ, ph: (x + z) * (def.laser ? def.laser.ph : 0), on: false, warn: false, off: 0 });
} else if (t === T_PLATE) { L.plateAt[ci] = L.plates.length; L.plates.push({ x: wc(x), z: wc(z), off: 0 }); }
else if (t === T_PANEL) { L.panelAt[ci] = L.panels.length; L.panels.push({ cx: x, cz: z, x: wc(x), z: wc(z), face: faceDir(x, z), used: false }); }
else if (t === T_LOCKER) { L.lockerAt[ci] = L.lockers.length; L.lockers.push({ cx: x, cz: z, x: wc(x), z: wc(z), face: faceDir(x, z) }); }
else if (t === T_VAULT) { if (!L.vault) L.vault = { cx: x, cz: z, x: wc(x), z: wc(z), face: faceDir(x, z) }; }
else if (t === T_EXIT) L.exits.push({ x: wc(x), z: wc(z) });
}
}
if (!L.vault) L.vault = { cx: 1, cz: 1, x: wc(1), z: wc(1), face: 0 };
L.lootMax = def.cash + L.nVal * def.val;
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
const ci = z * W + x, sh = L.shade[ci] === 1;
L.light[ci] = clamp((sh ? 0.08 : site.amb) + lampAt(wc(x), wc(z)) * (sh ? 0.35 : 1), 0, 1);
}

lvGroup = new THREE.Group();
scene.add(lvGroup);
scene.background.set(site.fog); scene.fog.color.set(site.fog);
renderer.setClearColor(site.fog, 1);
city.visible = !!site.city;
const gpad = site.city ? 3 : 140;
ground.scale.set(W * CS + gpad, 1, H * CS + gpad); ground.position.set(W * CS / 2, -0.03, H * CS / 2);
groundMat.color.set(site.city ? 0x03050a : site.fog);

const fc = new THREE.Color(site.floor), pc = site.pool;
const pos = [], col = [], uv = [], ind = [];
for (let z = 0; z < H; z++) {
for (let x = 0; x < W; x++) {
const ci = z * W + x, t = L.tile[ci];
if (t === T_WALL || t === T_RACK) continue;
const sh = L.shade[ci] === 1, base = sh ? 0.07 : site.amb, v0 = pos.length / 3;
for (let j = 0; j < 3; j++) {
for (let i = 0; i < 3; i++) {
const wx = x * CS + i * CS / 2, wz = z * CS + j * CS / 2, lp = lampAt(wx, wz) * (sh ? 0.3 : 1);
let k = 0.2 + 1.05 * Math.min(1.1, base + lp), r = fc.r * k + pc[0] * lp * 0.12, g = fc.g * k + pc[1] * lp * 0.12, b = fc.b * k + pc[2] * lp * 0.12;
if (t === T_VENT) { r *= 0.5; g *= 0.55; b *= 0.7; }
else if (t === T_EXIT) { r = r * 0.5 + 0.05; g = g * 0.6 + 0.22; b = b * 0.5 + 0.12; }
else if (t === T_LASER) { r += 0.08; }
else if (sh) { r *= 0.85; g *= 0.85; b *= 1.05; }
pos.push(wx, 0, wz); col.push(r, g, b); uv.push(i / 2, 1 - j / 2);
}
}
for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
const a = v0 + j * 3 + i, b2 = a + 1, c = a + 3, d = a + 4;
ind.push(a, c, b2, b2, c, d);
}
}
}
const fg = lkeep(new THREE.BufferGeometry());
fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
fg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
fg.setIndex(ind);
const floor = new THREE.Mesh(fg, lkeep(new THREE.MeshBasicMaterial({ vertexColors: true, map: floorTex(L.site) })));
lvGroup.add(floor);

let nW = 0, nR = 0, nG = 0, nT = 0, nV = 0;
for (let i = 0; i < N; i++) { const t = L.tile[i]; if (t === T_WALL) nW++; else if (t === T_RACK) nR++; else if (t === T_GLASS) nG++; else if (t === T_PROP) nT++; else if (t === T_VENT) nV++; }
const wallMat = lkeep(new THREE.MeshLambertMaterial({ color: 0xffffff, map: wallTex(L.site), vertexColors: true }));
const rackMat = lkeep(new THREE.MeshLambertMaterial({ color: 0xffffff, map: rackTex(L.site), vertexColors: true }));
const walls = inst(baseBox, wallMat, nW, true), racks = inst(baseBox, rackMat, nR, true);
lvGroup.add(walls); lvGroup.add(racks);
cutMesh[0] = walls; cutMesh[1] = racks;
const CONT = [0x8a4a32, 0x2f5f8a, 0x3f7a4a, 0x8a7a3a, 0x5f6670, 0x7a3a55];
let wi = 0, ri = 0;
const rackH = L.site === 3 ? 2.5 : L.site === 2 ? 2.2 : 2.0;
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
const ci = z * W + x, t = L.tile[ci];
if (t !== T_WALL && t !== T_RACK) continue;
const who = t === T_WALL ? 0 : 1, mesh = who ? racks : walls, ii = who ? ri++ : wi++;
const v = 0.9 + Math.random() * 0.12;
if (who) { tmpC.set(L.site === 3 ? CONT[(x * 7 + z * 3 + (x >> 1)) % CONT.length] : site.rack); } else tmpC.set(site.wall);
tmpC.r *= v; tmpC.g *= v; tmpC.b *= v;
mesh.setColorAt(ii, tmpC);
const k = cutTotal++;
cutWho[k] = who; cutIdx[k] = ii; cutX[k] = wc(x); cutZ[k] = wc(z);
cutH[k] = who ? rackH : WALL_H; cutCur[k] = cutH[k]; cutYaw[k] = 0;
setInst(mesh, ii, cutX[k], 0, cutZ[k], 0, CS, cutH[k], CS);
}
cutN[0] = wi; cutN[1] = ri;
walls.instanceMatrix.needsUpdate = true; racks.instanceMatrix.needsUpdate = true;
if (walls.instanceColor) walls.instanceColor.needsUpdate = true;
if (racks.instanceColor) racks.instanceColor.needsUpdate = true;

const glass = inst(cBox, lkeep(new THREE.MeshLambertMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.22, depthWrite: false })), nG, false);
const props = inst(baseBox, lkeep(new THREE.MeshLambertMaterial({ color: site.prop, vertexColors: true })), nT, false);
const art = inst(octG, lkeep(basicMat(site.accent)), L.site === 0 ? nT : 0, false);
const vents = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: site.accent, transparent: true, opacity: 0.12, depthWrite: false })), nV, false);
let gi = 0, ti = 0, vi = 0;
for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
const t = L.tile[z * W + x];
if (t === T_GLASS) {
const alongX = isWallish(x - 1, z) || isWallish(x + 1, z);
setInst(glass, gi++, wc(x), 1.15, wc(z), 0, alongX ? CS : 0.22, 2.3, alongX ? 0.22 : CS);
} else if (t === T_PROP) {
setInst(props, ti, wc(x), 0, wc(z), 0, 1.45, L.site === 3 ? 1.1 : 0.82, 1.45);
if (L.site === 0) setInst(art, ti, wc(x), 1.2, wc(z), ti * 0.7, 1, 1.3, 1);
ti++;
} else if (t === T_VENT) setInst(vents, vi++, wc(x), 0.55, wc(z), 0, CS * 0.98, 1.1, CS * 0.98);
}
lvGroup.add(glass); lvGroup.add(props); lvGroup.add(vents);
if (L.site === 0) { LM.art = art; lvGroup.add(art); }

const nD = L.doors.length;
LM.doors = inst(cBox, lkeep(new THREE.MeshLambertMaterial({ color: 0xffffff })), nD, true);
LM.doorLights = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff })), nD, true);
lvGroup.add(LM.doors); lvGroup.add(LM.doorLights);
LM.lockers = inst(baseBox, lkeep(new THREE.MeshLambertMaterial({ color: 0x5d6b86, vertexColors: true })), L.lockers.length, false);
for (let i = 0; i < L.lockers.length; i++) { const o = L.lockers[i]; setInst(LM.lockers, i, o.x - DX4[o.face] * 0.25, 0, o.z - DZ4[o.face] * 0.25, dirYaw(o.face), 1.25, 2.05, 1.1); }
lvGroup.add(LM.lockers);
LM.panelBody = inst(baseBox, lkeep(new THREE.MeshLambertMaterial({ color: 0x3a4256, vertexColors: true })), L.panels.length, false);
LM.panelScr = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff })), L.panels.length, true);
for (let i = 0; i < L.panels.length; i++) {
const o = L.panels[i], yaw = dirYaw(o.face);
setInst(LM.panelBody, i, o.x - DX4[o.face] * 0.45, 0, o.z - DZ4[o.face] * 0.45, yaw, 1.1, 1.55, 0.7);
setInst(LM.panelScr, i, o.x - DX4[o.face] * 0.08, 1.2, o.z - DZ4[o.face] * 0.08, yaw, 0.75, 0.42, 0.04);
}
lvGroup.add(LM.panelBody); lvGroup.add(LM.panelScr);
const vt = L.vault, vyaw = dirYaw(vt.face);
const vFrame = new THREE.Mesh(baseBox, lkeep(new THREE.MeshLambertMaterial({ color: 0x59617a, vertexColors: true })));
vFrame.position.set(vt.x - DX4[vt.face] * 0.35, 0, vt.z - DZ4[vt.face] * 0.35); vFrame.rotation.y = vyaw; vFrame.scale.set(1.95, 2.35, 1.2);
const vPivot = new THREE.Group();
vPivot.position.set(vt.x + DX4[vt.face] * 0.28 + DZ4[vt.face] * 0.82, 1.15, vt.z + DZ4[vt.face] * 0.28 - DX4[vt.face] * 0.82); vPivot.rotation.y = vyaw;
const vDoorG = lkeep(new THREE.CylinderGeometry(0.82, 0.82, 0.2, 20)); vDoorG.rotateX(Math.PI / 2); vDoorG.translate(-0.82, 0, 0);
const vDoor = new THREE.Mesh(vDoorG, lkeep(new THREE.MeshLambertMaterial({ color: 0x9aa4ba })));
const vWheel = new THREE.Mesh(lkeep(new THREE.TorusGeometry(0.36, 0.05, 6, 18)), lkeep(new THREE.MeshLambertMaterial({ color: 0xd8dde8 })));
vWheel.position.set(-0.82, 0, 0.14);
const vRing = new THREE.Mesh(lkeep(new THREE.TorusGeometry(0.7, 0.035, 4, 28)), lkeep(new THREE.MeshBasicMaterial({ color: 0xffc93c })));
vRing.position.set(-0.82, 0, 0.12);
vPivot.add(vDoor); vPivot.add(vWheel); vPivot.add(vRing);
lvGroup.add(vFrame); lvGroup.add(vPivot);
LM.vPivot = vPivot; LM.vWheel = vWheel; LM.vRing = vRing; LM.vyaw = vyaw;
const nL = L.lasers.length;
LM.beams = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })), nL * 3, true);
LM.strips = inst(flatG, lkeep(new THREE.MeshBasicMaterial({ color: 0xff2a3a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })), nL, false);
for (let i = 0; i < nL; i++) { const o = L.lasers[i]; setInst(LM.strips, i, o.x, 0.02, o.z, o.alongZ ? Math.PI / 2 : 0, CS, 1, 0.12); }
lvGroup.add(LM.beams); lvGroup.add(LM.strips);
LM.plates = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff })), L.plates.length, true);
for (let i = 0; i < L.plates.length; i++) setInst(LM.plates, i, L.plates[i].x, 0.03, L.plates[i].z, 0, 1.55, 0.06, 1.55);
lvGroup.add(LM.plates);
LM.sensPost = inst(cylG, lkeep(new THREE.MeshLambertMaterial({ color: 0x4a5266 })), L.sensors.length, false);
LM.sensRing = inst(ringG, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })), L.sensors.length, true);
for (let i = 0; i < L.sensors.length; i++) {
setInst(LM.sensPost, i, L.sensors[i].x, 0, L.sensors[i].z, 0, 0.3, 0.7, 0.3);
setInst(LM.sensRing, i, L.sensors[i].x, 0.04, L.sensors[i].z, 0, SENSOR_R, 1, SENSOR_R);
}
lvGroup.add(LM.sensPost); lvGroup.add(LM.sensRing);
LM.exits = inst(flatG, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })), L.exits.length, true);
for (let i = 0; i < L.exits.length; i++) setInst(LM.exits, i, L.exits[i].x, 0.05, L.exits[i].z, 0, CS * 0.92, 1, CS * 0.92);
LM.checks = inst(cylG, lkeep(new THREE.MeshBasicMaterial({ color: 0xffffff })), L.checks.length, true);
for (let i = 0; i < L.checks.length; i++) setInst(LM.checks, i, L.checks[i].x, 0, L.checks[i].z, 0, 1.1, 0.06, 1.1);
lvGroup.add(LM.exits); lvGroup.add(LM.checks);
let nVal = 0, nCard = 0;
for (let i = 0; i < L.items.length; i++) { if (L.items[i].kind === '$') L.items[i].slot = nVal++; else L.items[i].slot = nCard++; }
LM.vals = inst(octG, lkeep(new THREE.MeshBasicMaterial({ color: 0xffd25a })), nVal, false);
LM.cards = inst(cBox, lkeep(new THREE.MeshBasicMaterial({ color: 0x5fb3ff })), nCard, false);
lvGroup.add(LM.vals); lvGroup.add(LM.cards);
const poolMat = lkeep(new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(pc[0] * 0.3, pc[1] * 0.3, pc[2] * 0.3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
const pools = inst(flatG, poolMat, L.lamps.length, false);
const heads = inst(sphG, lkeep(new THREE.MeshBasicMaterial({ color: new THREE.Color(pc[0], pc[1], pc[2]) })), L.lamps.length, false);
const poles = inst(cylG, lkeep(new THREE.MeshLambertMaterial({ color: 0x3a3f4a })), L.site === 3 ? L.lamps.length : 0, false);
for (let i = 0; i < L.lamps.length; i++) {
const o = L.lamps[i];
setInst(pools, i, o.x, 0.03, o.z, 0, CS * 5.4, 1, CS * 5.4);
setInst(heads, i, o.x, L.site === 3 ? 3.3 : 2.75, o.z, 0, 0.32, 0.14, 0.32);
if (L.site === 3) setInst(poles, i, o.x + 0.3, 0, o.z + 0.3, 0, 0.12, 3.3, 0.12);
}
lvGroup.add(pools); lvGroup.add(heads); lvGroup.add(poles);

guards.length = 0; cams.length = 0;
const gdefs = def.guards || [];
for (let i = 0; i < gdefs.length && guards.length < MAXG; i++) guards.push(makeGuard(gdefs[i].p, gdefs[i].w, gdefs[i].s, false));
const dd = def.dorm || [];
for (let i = 0; i < dd.length && guards.length < MAXG; i++) guards.push(makeGuard([dd[i]], 2, 1, true));
const cd = def.cams || [];
for (let i = 0; i < cd.length && cams.length < MAXC; i++) {
const c = cd[i], a = c[2] * Math.PI / 180, dx = Math.cos(a), dz = Math.sin(a);
cams.push({ cx: c[0], cz: c[1], x: wc(c[0]) + dx * (CS * 0.5 + 0.12), z: wc(c[1]) + dz * (CS * 0.5 + 0.12), base: Math.PI / 2 - a, sw: c[3] * Math.PI / 180, sp: c[4], ph: i * 1.7,
yaw: Math.PI / 2 - a, susp: 0, blind: 0, see: false, known: false, track: 0, alarmed: false });
}
for (let i = 0; i < 4; i++) gMesh[i].count = guards.length;
camMesh[0].count = cams.length; camMesh[1].count = cams.length;
for (let i = 0; i < cams.length; i++) {
setInst(camMesh[0], i, cams[i].x, 2.15, cams[i].z, cams[i].base, 1, 1, 1);
}
camMesh[0].instanceMatrix.needsUpdate = true;
updateRoutes();
}

const guards = [], cams = [];
const P = { x: 0, z: 0, vx: 0, vz: 0, yaw: Math.PI, crouch: false, sprint: false, moving: false, speed: 0, hidden: -1, hx: 0, hz: 0,
inVent: false, stepT: 0, stuckT: 0, sx: 0, sz: 0, exitWarn: 0 };
const R = { time: 0, loot: 0, spotted: false, everAlarm: false, alarm: false, lockT: 0, lockMax: 1, sealOrder: [], sealI: 0, sealGap: 1, sealNext: 0,
card: false, ch: [0, 0, 0, 0], sel: 0, vaultDone: false, endT: -1, endKind: '', caughtBy: -1, loopT: 0, laserKill: false, lockerSeen: -1,
ck: null, ckUsed: 0, alarmReason: '', result: null, radioCD: 0, maxSusp: 0, shake: 0, flash: 0, flashCol: 0 };
const SMK = [], LUR = [];
for (let i = 0; i < MAX_SMOKE; i++) SMK.push({ on: false, x: 0, z: 0, r: 0, t: 0, life: 0 });
for (let i = 0; i < MAX_LURE; i++) LUR.push({ on: false, x: 0, z: 0, sx: 0, sz: 0, ex: 0, ez: 0, t: 0, fly: 0, beeps: 0 });
const DR = { on: false, ret: false, x: 0, z: 0, y: 0, t: 0, yaw: 0 };
const EMP = { on: false, x: 0, z: 0, sx: 0, sz: 0, tx: 0, tz: 0, t: 0, kind: '', ref: -1 };
const CH = { on: false, kind: '', ref: -1, t: 0, dur: 1, x: 0, z: 0, noiseT: 0 };
const D8X = [1, -1, 0, 0, 1, 1, -1, -1], D8Z = [0, 0, 1, -1, 1, -1, 1, -1];

function guardPass(ci) {
if (ci < 0) return false;
const t = L.tile[ci];
if (openCell(t)) return true;
return t === T_DOOR && L.doors[L.doorAt[ci]].lock === 0;
}
function playerPass(ci) {
if (ci < 0) return false;
const t = L.tile[ci];
if (openCell(t)) return true;
if (t === T_VENT) return P.crouch;
return t === T_DOOR && L.doors[L.doorAt[ci]].lock === 0;
}
function blocksSight(ci) {
if (ci < 0) return true;
const t = L.tile[ci];
if (t === T_WALL || t === T_RACK || t === T_LOCKER || t === T_VAULT || t === T_PANEL) return true;
return t === T_DOOR && L.doors[L.doorAt[ci]].open < 0.5;
}
function fixCell(x, z) {
if (guardPass(cellAt(x, z))) return [x, z];
for (let r = 1; r <= 3; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (guardPass(cellAt(x + dx, z + dz))) return [x + dx, z + dz];
return [x, z];
}
function makeGuard(route, w, s, dorm) {
const r = [];
for (let i = 0; i < route.length; i++) r.push(fixCell(route[i][0], route[i][1]));
return { route: r, w: w || 1.5, spd: s || 1, dorm: !!dorm, x: 0, z: 0, yaw: 0, st: 'patrol', susp: 0, t: 0, wi: 0, path: new Int16Array(400), pn: 0, pi: 0,
gx: 0, gz: 0, lx: 0, lz: 0, see: false, radio: 0, lost: 0, stun: 0, stuckT: 0, px: 0, pz: 0, stuckN: 0, repath: 0, revealed: false, obs: 0,
lookBase: 0, active: !dorm, heard: 0, anim: Math.random() * 6, lunge: 0, mark: 0, rc: null };
}

const bfsPrev = new Int16Array(MAXN), bfsQ = new Int16Array(MAXN), bfsSeen = new Uint16Array(MAXN);
let bfsStamp = 0;
function bfsTo(sci, tci, out) {
if (sci < 0 || tci < 0) return 0;
if (!guardPass(tci)) {
let best = -1;
for (let d = 0; d < 8 && best < 0; d++) { const ci = cellAt(tci % L.W + D8X[d], ((tci / L.W) | 0) + D8Z[d]); if (guardPass(ci)) best = ci; }
if (best < 0) return 0;
tci = best;
}
if (sci === tci) return 0;
bfsStamp++;
if (bfsStamp > 65000) { bfsSeen.fill(0); bfsStamp = 1; }
let qh = 0, qt = 0, found = false;
bfsQ[qt++] = sci; bfsSeen[sci] = bfsStamp; bfsPrev[sci] = -1;
while (qh < qt && !found) {
const c = bfsQ[qh++], cx = c % L.W, cz = (c / L.W) | 0;
for (let d = 0; d < 8; d++) {
const dx = D8X[d], dz = D8Z[d], ni = cellAt(cx + dx, cz + dz);
if (ni < 0 || bfsSeen[ni] === bfsStamp || !guardPass(ni)) continue;
if (dx !== 0 && dz !== 0 && (!guardPass(cellAt(cx + dx, cz)) || !guardPass(cellAt(cx, cz + dz)))) continue;
bfsSeen[ni] = bfsStamp; bfsPrev[ni] = c; bfsQ[qt++] = ni;
if (ni === tci) { found = true; break; }
}
}
if (!found) return 0;
let n = 0;
for (let c = tci; c !== sci && c >= 0; c = bfsPrev[c]) n++;
n = Math.min(n, out.length);
let k = n - 1;
for (let c = tci; c !== sci && c >= 0 && k >= 0; c = bfsPrev[c]) out[k--] = c;
return n;
}
function goTo(G, wx, wz) {
G.gx = wx; G.gz = wz;
G.pn = bfsTo(cellOf(G.x, G.z), cellOf(wx, wz), G.path); G.pi = 0;
}
function goWaypoint(G) { const w = G.route[G.wi]; goTo(G, wc(w[0]), wc(w[1])); }
function turnTo(G, target, maxStep) { G.yaw += clamp(angDiff(G.yaw, target), -maxStep, maxStep); }
function moveAlong(G, spd, dt) {
if (G.pi >= G.pn) return true;
const c = G.path[G.pi], tx = wc(c % L.W), tz = wc((c / L.W) | 0);
const dx = tx - G.x, dz = tz - G.z, d = Math.sqrt(dx * dx + dz * dz);
if (d < 0.05) { G.pi++; return G.pi >= G.pn; }
const st = Math.min(d, spd * dt);
G.x += dx / d * st; G.z += dz / d * st;
turnTo(G, Math.atan2(dx, dz), 7 * dt);
return false;
}

function collide(o, r, pass) {
for (let it = 0; it < 2; it++) {
const cx = Math.floor(o.x / CS), cz = Math.floor(o.z / CS);
for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
const ci = cellAt(cx + dx, cz + dz);
if (pass(ci)) continue;
const ins = ci >= 0 && L.tile[ci] === T_PROP ? 0.26 : 0;
const x0 = (cx + dx) * CS + ins, z0 = (cz + dz) * CS + ins, sz = CS - ins * 2;
const nx = clamp(o.x, x0, x0 + sz), nz = clamp(o.z, z0, z0 + sz);
const ddx = o.x - nx, ddz = o.z - nz, d2 = ddx * ddx + ddz * ddz;
if (d2 >= r * r) continue;
if (d2 > 1e-8) { const d = Math.sqrt(d2), push = r - d; o.x += ddx / d * push; o.z += ddz / d * push; }
else {
const l = o.x - x0, rr = x0 + sz - o.x, t = o.z - z0, b = z0 + sz - o.z, m = Math.min(l, rr, t, b);
if (m === l) o.x = x0 - r; else if (m === rr) o.x = x0 + sz + r; else if (m === t) o.z = z0 - r; else o.z = z0 + sz + r;
}
}
}
}

function rayDist(x0, z0, dx, dz, maxD, smoke) {
let cx = Math.floor(x0 / CS), cz = Math.floor(z0 / CS);
const sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
const tdx = Math.abs(dx) > 1e-6 ? CS / Math.abs(dx) : 1e9, tdz = Math.abs(dz) > 1e-6 ? CS / Math.abs(dz) : 1e9;
let tmx = Math.abs(dx) > 1e-6 ? (dx > 0 ? (cx + 1) * CS - x0 : x0 - cx * CS) / Math.abs(dx) : 1e9;
let tmz = Math.abs(dz) > 1e-6 ? (dz > 0 ? (cz + 1) * CS - z0 : z0 - cz * CS) / Math.abs(dz) : 1e9;
let hit = maxD;
for (let it = 0; it < 80; it++) {
let t;
if (tmx < tmz) { t = tmx; tmx += tdx; cx += sx; } else { t = tmz; tmz += tdz; cz += sz; }
if (t >= maxD) break;
if (blocksSight(cellAt(cx, cz))) { hit = t; break; }
}
if (smoke) {
for (let i = 0; i < SMK.length; i++) {
const s = SMK[i];
if (!s.on || s.r < 0.3) continue;
const fx = x0 - s.x, fz = z0 - s.z, b = fx * dx + fz * dz, c = fx * fx + fz * fz - s.r * s.r;
if (c < 0) return 0;
const disc = b * b - c;
if (disc < 0) continue;
const te = -b - Math.sqrt(disc);
if (te > 0 && te < hit) hit = te;
}
}
return hit;
}
function losClear(ax, az, bx, bz, smoke) {
const dx = bx - ax, dz = bz - az, d = Math.sqrt(dx * dx + dz * dz);
if (d < 1e-4) return true;
return rayDist(ax, az, dx / d, dz / d, d, smoke) >= d - 0.02;
}
function inSmoke(x, z, pad) {
for (let i = 0; i < SMK.length; i++) { const s = SMK[i]; if (s.on && (x - s.x) * (x - s.x) + (z - s.z) * (z - s.z) < (s.r + (pad || 0)) * (s.r + (pad || 0))) return true; }
return false;
}
function playerLightF() { const ci = cellOf(P.x, P.z); return 0.28 + 0.72 * (ci >= 0 ? L.light[ci] : 0.5); }
function stanceF() { return P.crouch ? 0.6 : (P.sprint && P.moving) ? 1.25 : P.moving ? 1.05 : 0.95; }
function visTo(fx, fz, yaw, half, range, prox) {
if (P.hidden >= 0 || P.inVent || R.endT >= 0) return 0;
const dx = P.x - fx, dz = P.z - fz, d2 = dx * dx + dz * dz;
if (d2 > range * range) return 0;
const d = Math.sqrt(d2), eff = range * clamp(playerLightF() * stanceF(), 0.22, 1.15);
const close = prox && d < 1.3;
if (!close) {
if (d > eff) return 0;
if (Math.abs(angDiff(yaw, Math.atan2(dx, dz))) > half) return 0;
}
if (!losClear(fx, fz, P.x, P.z, true)) return 0;
return close ? 0.9 : clamp(1 - d / eff, 0.06, 1);
}

function noiseRing(x, z, r, col) {
for (let i = 0; i < noiseFx.length; i++) {
const n = noiseFx[i];
if (n.on) continue;
n.on = true; n.x = x; n.z = z; n.r = r; n.t = 0; n.col = col || 0;
return;
}
}
function makeNoise(x, z, r, strong, ring, col) {
if (ring) noiseRing(x, z, r, col);
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active || G.st === 'alert' || G.st === 'stun') continue;
const dx = G.x - x, dz = G.z - z, d = Math.sqrt(dx * dx + dz * dz);
if (d > r) continue;
if (d > r * 0.6 && !losClear(G.x, G.z, x, z, false)) continue;
G.susp = Math.max(G.susp, strong ? 0.55 : 0.4);
G.lx = x; G.lz = z; G.heard = 1.4;
G.st = 'inv'; goTo(G, x, z);
}
}

function toSusp(G) { G.st = 'susp'; G.t = 0; G.pn = 0; if (G.mark !== 1) { G.mark = 1; api.tone(660, 0.08, { type: 'triangle', vol: 0.05 }); } }
function toAlert(G) {
G.st = 'alert'; G.radio = 0; G.lost = 0; G.repath = 0; G.mark = 2;
if (!R.spotted) hint('spotted', R.alarm ? 'Spotted! Break line of sight, then hide.' : 'Spotted! Break line of sight before it radios in. Lockers and shadows help.', 5);
R.spotted = true;
api.tone(880, 0.12, { type: 'square', vol: 0.06 }); api.tone(1180, 0.14, { type: 'square', vol: 0.05, delay: 0.1 });
}
function guardSpeed(G) { return 1.55 * G.spd * L.gspd * (R.alarm ? 1.18 : 1); }
function guardStep(G, dt) {
G.anim += dt;
if (G.heard > 0) G.heard -= dt;
if (!G.active) return;
if (G.st === 'stun') {
G.stun -= dt;
if (Math.random() < dt * 8) spark(G.x + rand(-0.3, 0.3), 1.4 + Math.random() * 0.4, G.z + rand(-0.3, 0.3), rand(-1, 1), 1.5, rand(-1, 1), 0.4, 0.4, 0.9, 1);
if (G.stun <= 0) { G.st = 'search'; G.t = 2.5; G.lookBase = G.yaw; G.susp = 0.35; }
return;
}
const v = visTo(G.x, G.z, G.yaw, G_HALF, G_RANGE * (R.alarm ? 1.12 : 1), true);
G.see = v > 0;
if (G.see) { G.susp = Math.min(1.25, G.susp + v * L.det * (R.alarm ? 1.35 : 1) * (0.5 + 1.9 * v) * dt); G.lx = P.x; G.lz = P.z; }
else if (G.st !== 'alert') G.susp = Math.max(0, G.susp - 0.11 * dt);
const spd = guardSpeed(G);
let moving = false;
switch (G.st) {
case 'patrol':
if (G.susp >= 0.3) { toSusp(G); break; }
moving = true;
if (moveAlong(G, spd, dt)) { G.st = 'look'; G.t = G.w; G.lookBase = G.yaw; }
break;
case 'look':
if (G.susp >= 0.3) { toSusp(G); break; }
G.t -= dt;
G.yaw = G.lookBase + Math.sin((G.w - G.t) * 2.1) * 0.95;
if (G.t <= 0) { if (G.route.length > 1) { G.wi = (G.wi + 1) % G.route.length; goWaypoint(G); G.st = 'patrol'; } else { G.t = G.w; G.lookBase = G.yaw; } }
break;
case 'susp':
turnTo(G, Math.atan2(G.lx - G.x, G.lz - G.z), 3.2 * dt);
if (G.susp >= 1) { toAlert(G); break; }
if (G.see) G.t = 0; else G.t += dt;
if (G.susp < 0.12 && G.t > 0.6) { G.st = 'return'; G.mark = 0; goWaypoint(G); }
else if (G.t > 1.1) { G.st = 'inv'; goTo(G, G.lx, G.lz); }
break;
case 'inv':
if (G.susp >= 1 && G.see) { toAlert(G); break; }
moving = true;
if (moveAlong(G, spd * 1.35, dt)) { G.st = 'search'; G.t = 3.2; G.lookBase = G.yaw; }
break;
case 'search':
if (G.susp >= 1 && G.see) { toAlert(G); break; }
if (G.susp >= 0.3 && G.see) { toSusp(G); break; }
G.t -= dt;
G.yaw = G.lookBase + Math.sin(G.t * 1.9) * 1.3;
if (G.t <= 0) { G.st = 'return'; G.mark = 0; goWaypoint(G); }
break;
case 'return':
if (G.susp >= 0.3 && G.see) { toSusp(G); break; }
moving = true;
if (moveAlong(G, spd, dt)) { G.st = 'look'; G.t = G.w * 0.6; G.lookBase = G.yaw; }
break;
case 'alert': {
R.spotted = true;
if (G.see) {
G.lost = 0; G.radio += dt;
if (G.radio > 2.4 && !R.alarm) triggerAlarm(G.x, G.z, 'A guard bot radioed it in');
} else G.lost += dt;
const hunting = P.hidden >= 0 && R.lockerSeen === P.hidden;
const tx = G.see || hunting ? P.x : G.lx, tz = G.see || hunting ? P.z : G.lz;
const dx = P.x - G.x, dz = P.z - G.z, d = Math.sqrt(dx * dx + dz * dz);
const cs = 3.85 * L.gspd * (R.alarm ? 1.08 : 1);
moving = true;
if (G.see && d < 2.4 && d > 0.01) {
G.x += dx / d * Math.min(d, cs * dt); G.z += dz / d * Math.min(d, cs * dt);
collide(G, 0.34, guardPass);
turnTo(G, Math.atan2(dx, dz), 9 * dt);
} else {
G.repath -= dt;
if (G.repath <= 0) { G.repath = 0.35; goTo(G, tx, tz); }
moveAlong(G, cs, dt);
}
if (P.hidden < 0 && G.see && d < 0.85) caught(G);
else if (hunting && d < 2.4) caught(G);
if (!G.see && !hunting && G.lost > 3.2 && G.pi >= G.pn) { G.st = 'search'; G.t = 5; G.susp = 0.7; G.mark = 1; G.lookBase = G.yaw; }
break;
}
default: break;
}
if (moving) {
const mx = G.x - G.px, mz = G.z - G.pz;
if (mx * mx + mz * mz > 0.06) { G.px = G.x; G.pz = G.z; G.stuckT = 0; }
else {
G.stuckT += dt;
if (G.stuckT > 2.5) {
G.stuckT = 0; G.stuckN++;
if (G.stuckN > 3 && G.pi < G.pn) { const c = G.path[G.pi]; G.x = wc(c % L.W); G.z = wc((c / L.W) | 0); G.stuckN = 0; }
else if (G.pi < G.pn) G.pi++;
else if (G.st === 'patrol' || G.st === 'return') { G.wi = (G.wi + 1) % G.route.length; goWaypoint(G); }
else if (G.st === 'inv') { G.st = 'search'; G.t = 2; G.lookBase = G.yaw; }
else goTo(G, G.gx, G.gz);
}
}
} else { G.px = G.x; G.pz = G.z; G.stuckT = 0; }
}

function camStep(c, dt) {
const dxp = P.x - c.x, dzp = P.z - c.z;
if (dxp * dxp + dzp * dzp < 100 && !c.known) c.known = true;
if (c.blind > 0 || R.loopT > 0) {
if (c.blind > 0) { c.blind -= dt; if (Math.random() < dt * 6) spark(c.x, 2.15, c.z, rand(-1, 1), 0.5, rand(-1, 1), 0.35, 0.4, 0.9, 1); }
c.see = false; c.susp = Math.max(0, c.susp - dt);
return;
}
const v = visTo(c.x, c.z, c.yaw, C_HALF, C_RANGE, false);
c.see = v > 0;
if (c.see) {
c.susp = Math.min(1.2, c.susp + v * L.det * 1.05 * (0.6 + 1.6 * v) * dt);
c.track = 1.4;
const want = Math.atan2(dxp, dzp), lim = c.sw + 0.4;
let t = c.yaw + clamp(angDiff(c.yaw, want), -1.1 * dt, 1.1 * dt);
const off = angDiff(c.base, t);
if (Math.abs(off) > lim) t = c.base + Math.sign(off) * lim;
c.yaw = t;
if (c.susp >= 1 && !R.alarm) triggerAlarm(c.x, c.z, 'A camera caught you on film');
if (R.alarm && R.radioCD <= 0) { R.radioCD = 2; callNearest(P.x, P.z); }
} else {
c.susp = Math.max(0, c.susp - 0.25 * dt);
if (c.track > 0) c.track -= dt;
else { c.ph += dt * c.sp; c.yaw += clamp(angDiff(c.yaw, c.base + c.sw * Math.sin(c.ph)), -1.4 * dt, 1.4 * dt); }
}
}
function callNearest(x, z) {
let best = null, bd = 1e9;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active || G.st === 'stun' || G.st === 'alert') continue;
const d = (G.x - x) * (G.x - x) + (G.z - z) * (G.z - z);
if (d < bd) { bd = d; best = G; }
}
if (best) { best.susp = Math.max(best.susp, 0.6); best.lx = x; best.lz = z; best.st = 'inv'; best.mark = 1; goTo(best, x, z); }
}

const keys = {};
const stick = { on: false, id: -1, ox: 0, oy: 0, vx: 0, vy: 0, far: false };
const IV = { x: 0, z: 0, m: 0 };
let camYaw = 0, camYawT = 0, zoom = 17, zoomT = 17;
function inputVec() {
let ix = 0, iz = 0;
if (keys.KeyA || keys.ArrowLeft) ix -= 1;
if (keys.KeyD || keys.ArrowRight) ix += 1;
if (keys.KeyW || keys.ArrowUp) iz += 1;
if (keys.KeyS || keys.ArrowDown) iz -= 1;
if (stick.on) { ix += stick.vx; iz += stick.vy; }
IV.x = ix; IV.z = iz; IV.m = Math.min(1, Math.sqrt(ix * ix + iz * iz));
return IV;
}
function unstick() {
const ci = cellOf(P.x, P.z);
if (playerPass(ci)) { hint('blocked', 'Blocked. Vents need a crouch (' + tk('C', 'SNEAK') + '); locked doors need a keycard or a pick (' + tk('E', 'USE') + ').', 4); return; }
for (let r = 1; r <= 4; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
const cx = Math.floor(P.x / CS) + dx, cz = Math.floor(P.z / CS) + dz, c = cellAt(cx, cz);
if (c >= 0 && openCell(L.tile[c])) { P.x = wc(cx); P.z = wc(cz); P.vx = P.vz = 0; toast('Unstuck', UI.dim); return; }
}
}
function playerStep(dt) {
const pc = cellOf(P.x, P.z);
P.inVent = pc >= 0 && L.tile[pc] === T_VENT;
if (P.hidden >= 0) { P.speed = 0; P.moving = false; P.vx = P.vz = 0; P.sprint = false; return; }
const busy = ui === 'vault' || ui === 'pick' || DR.on || CH.on;
const iv = inputVec();
let tx = 0, tz = 0;
if (!busy && iv.m > 0.08) {
const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
let wx = rx * iv.x + fx * iv.z, wz = rz * iv.x + fz * iv.z;
const wl = Math.sqrt(wx * wx + wz * wz) || 1;
wx /= wl; wz /= wl;
P.sprint = !P.crouch && !!(keys.ShiftLeft || keys.ShiftRight || (stick.on && stick.far));
const ts = (P.crouch ? SPD_SNEAK : P.sprint ? SPD_SPRINT : SPD_WALK) * Math.min(1, iv.m * 1.15);
tx = wx * ts; tz = wz * ts;
P.yaw += clamp(angDiff(P.yaw, Math.atan2(wx, wz)), -12 * dt, 12 * dt);
} else P.sprint = false;
const k = Math.min(1, dt * 14);
P.vx += (tx - P.vx) * k; P.vz += (tz - P.vz) * k;
const ox = P.x, oz = P.z;
P.x += P.vx * dt; P.z += P.vz * dt;
collide(P, PR, playerPass);
const mx = (P.x - ox) / dt, mz = (P.z - oz) / dt;
P.speed = Math.sqrt(mx * mx + mz * mz);
P.moving = P.speed > 0.4;
if (P.moving) {
P.stepT -= P.speed * dt;
if (P.stepT <= 0) {
P.stepT = 1.25;
const shoe = 1 - 0.22 * SV.up.shoes;
if (P.sprint) { makeNoise(P.x, P.z, 6.8 * shoe, false, true, 1); api.noise(0.05, { vol: 0.05, filter: 900 }); }
else if (!P.crouch) { makeNoise(P.x, P.z, 2.3 * shoe, false, false); api.noise(0.03, { vol: 0.016, filter: 600 }); }
}
}
if (!busy && iv.m > 0.3 && P.speed < 0.15) { P.stuckT += dt; if (P.stuckT > 3) { P.stuckT = 0; unstick(); } } else P.stuckT = 0;
for (let i = 0; i < L.items.length; i++) {
const it = L.items[i];
if (it.got) continue;
const dx = it.x - P.x, dz = it.z - P.z;
if (dx * dx + dz * dz < 0.9 * 0.9) pickup(it);
}
for (let i = 0; i < L.checks.length; i++) {
const c = L.checks[i];
if (c.got) continue;
const dx = c.x - P.x, dz = c.z - P.z;
if (dx * dx + dz * dz < 1.0) { c.got = true; takeSnapshot(i); toast('Checkpoint saved', UI.ok); api.tone(523, 0.1, { type: 'triangle', vol: 0.06 }); api.tone(784, 0.14, { type: 'triangle', vol: 0.06, delay: 0.1 }); }
}
if (pc >= 0 && L.tile[pc] === T_EXIT) {
if (R.vaultDone) endRun('escape');
else if (P.exitWarn <= 0) { P.exitWarn = 4; toast('The vault is still locked', UI.hi); }
}
if (P.exitWarn > 0) P.exitWarn -= dt;
}
function pickup(it) {
it.got = true;
if (it.kind === '$') {
R.loot += it.val;
toast('+' + fmtCash(it.val), UI.hi);
burst(it.x, 0.8, it.z, 14, 2.2, 0.6, 1, 0.82, 0.3, 1);
api.tone(880, 0.06, { type: 'triangle', vol: 0.06 }); api.tone(1320, 0.1, { type: 'triangle', vol: 0.05, delay: 0.06 });
} else {
R.card = true;
for (let i = 0; i < L.doors.length; i++) if (L.doors[i].lock === 1) L.doors[i].lock = 0;
toast('Keycard: blue doors now open', UI.cyan);
hint('card', 'Keycard acquired. Blue keycard doors open for you now.', 4);
burst(it.x, 0.8, it.z, 14, 2, 0.6, 0.4, 0.7, 1, 1);
api.tone(660, 0.08, { type: 'sine', vol: 0.07 }); api.tone(990, 0.12, { type: 'sine', vol: 0.06, delay: 0.08 });
}
}

const FOC = { kind: '', ref: -1, label: '', x: 0, z: 0 };
let focBD = 0, focPX = 0, focPZ = 0;
function focCand(kind, ref, cx, cz, label) {
if (Math.abs(cx - focPX) + Math.abs(cz - focPZ) !== 1) return;
const x = wc(cx), z = wc(cz), d = (x - P.x) * (x - P.x) + (z - P.z) * (z - P.z);
if (d < 2.4 * 2.4 && d < focBD) { focBD = d; FOC.kind = kind; FOC.ref = ref; FOC.label = label; FOC.x = x; FOC.z = z; }
}
function findFocus() {
FOC.kind = ''; FOC.ref = -1; FOC.label = '';
if (mode !== 'playing' || R.endT >= 0) return;
if (P.hidden >= 0) { FOC.kind = 'unhide'; FOC.label = 'step out of the locker'; return; }
if (ui || DR.on || CH.on) return;
focBD = 1e9; focPX = Math.floor(P.x / CS); focPZ = Math.floor(P.z / CS);
if (!R.vaultDone) focCand('vault', 0, L.vault.cx, L.vault.cz, 'crack the vault');
for (let i = 0; i < L.doors.length; i++) {
const d = L.doors[i];
if (d.lock === 2) focCand('pick', i, d.cx, d.cz, 'pick the lock');
else if (d.lock === 3) focCand('force', i, d.cx, d.cz, 'force the sealed door (loud)');
else if (d.lock === 1) focCand('needcard', i, d.cx, d.cz, 'keycard needed');
}
for (let i = 0; i < L.panels.length; i++) {
const p = L.panels[i];
if (!p.used) focCand('hack', i, p.cx, p.cz, R.alarm ? 'hack the panel: stop the alarm' : 'hack the panel: loop cameras, cut lasers');
}
for (let i = 0; i < L.lockers.length; i++) focCand('locker', i, L.lockers[i].cx, L.lockers[i].cz, 'hide in the locker');
}
function interact() {
if (mode !== 'playing' || R.endT >= 0) return;
if (ui === 'vault') { vaultSet(); return; }
if (ui === 'pick') { pickSet(); return; }
if (ui) return;
if (DR.on) { DR.ret = true; return; }
if (P.hidden >= 0) { leaveLocker(); return; }
if (CH.on) return;
findFocus();
switch (FOC.kind) {
case 'vault': ui = 'vault'; P.vx = P.vz = 0; hint('vault', tk('Turn the dial with A / D (or the arrows). When the pulse peaks and the dial glows, press E.', 'Hold the arrow buttons to turn the dial. When the pulse peaks and the dial glows, tap SET.'), 7, true); api.tone(330, 0.06, { type: 'triangle', vol: 0.05 }); break;
case 'pick': startPick(FOC.ref); break;
case 'force': startChannel('force', FOC.ref); break;
case 'hack': startChannel('hack', FOC.ref); break;
case 'locker': enterLocker(FOC.ref); break;
case 'needcard': toast('Locked: find the keycard first', UI.danger); api.tone(200, 0.1, { type: 'square', vol: 0.04 }); break;
default: api.tone(220, 0.04, { type: 'triangle', vol: 0.025 }); break;
}
}
function enterLocker(i) {
const o = L.lockers[i];
P.hidden = i; P.hx = P.x; P.hz = P.z; P.x = o.x; P.z = o.z; P.vx = P.vz = 0;
R.lockerSeen = -1;
for (let k = 0; k < guards.length; k++) if (guards[k].st === 'alert' && guards[k].see) R.lockerSeen = i;
api.noise(0.08, { vol: 0.05, filter: 1200 });
hint('hidden', 'Hidden. Bots that did not see you get in will give up. ' + tk('E or any move key', 'USE or the stick') + ' to step out.', 5);
}
function leaveLocker() {
const o = L.lockers[P.hidden], fx = o.cx + DX4[o.face], fz = o.cz + DZ4[o.face];
if (playerPass(cellAt(fx, fz))) { P.x = wc(fx) - DX4[o.face] * 0.3; P.z = wc(fz) - DZ4[o.face] * 0.3; } else { P.x = P.hx; P.z = P.hz; }
P.hidden = -1; R.lockerSeen = -1;
api.noise(0.08, { vol: 0.05, filter: 1200 });
}
function toggleCrouch() {
if (P.hidden >= 0 || mode !== 'playing') return;
if (P.crouch) {
const was = P.crouch; P.crouch = false;
const cx = Math.floor(P.x / CS), cz = Math.floor(P.z / CS);
let blocked = false;
for (let dz = -1; dz <= 1 && !blocked; dz++) for (let dx = -1; dx <= 1; dx++) {
const ci = cellAt(cx + dx, cz + dz);
if (ci < 0 || L.tile[ci] !== T_VENT) continue;
const x0 = (cx + dx) * CS, z0 = (cz + dz) * CS, nx = clamp(P.x, x0, x0 + CS), nz = clamp(P.z, z0, z0 + CS);
if ((P.x - nx) * (P.x - nx) + (P.z - nz) * (P.z - nz) < PR * PR) { blocked = true; break; }
}
if (blocked) { P.crouch = was; toast('No room to stand in the vent', UI.dim); return; }
} else P.crouch = true;
api.tone(P.crouch ? 300 : 380, 0.04, { type: 'triangle', vol: 0.035 });
}

function baseCharges() { return [2 + SV.up.emp, 3 + 2 * SV.up.lure, 1 + SV.up.smoke, 1 + SV.up.drone]; }
function empDur() { return 5 + 2 * SV.up.empT; }
function selectGadget(i) {
if (i < 0 || i > 3 || R.sel === i) return;
R.sel = i;
api.tone(520 + i * 60, 0.03, { type: 'triangle', vol: 0.04 });
}
const ET = { kind: '', ref: -1, x: 0, z: 0 };
function findEmpTarget() {
ET.kind = ''; ET.ref = -1;
let best = 1e9;
const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw);
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active || G.st === 'stun') continue;
const dx = G.x - P.x, dz = G.z - P.z, d = Math.sqrt(dx * dx + dz * dz);
if (d > 7.5 || d < 0.01) continue;
const sc = d - (dx * fx + dz * fz) / d * 2.5;
if (sc < best && losClear(P.x, P.z, G.x, G.z, false)) { best = sc; ET.kind = 'g'; ET.ref = i; ET.x = G.x; ET.z = G.z; }
}
for (let i = 0; i < cams.length; i++) {
const c = cams[i];
if (c.blind > 0) continue;
const dx = c.x - P.x, dz = c.z - P.z, d = Math.sqrt(dx * dx + dz * dz);
if (d > 7.5 || d < 0.01) continue;
const sc = d - (dx * fx + dz * fz) / d * 2.5;
if (sc < best && losClear(P.x, P.z, c.x, c.z, false)) { best = sc; ET.kind = 'c'; ET.ref = i; ET.x = c.x; ET.z = c.z; }
}
}
const LL = { x: 0, z: 0 };
function lureLanding() {
const dx = Math.sin(P.yaw), dz = Math.cos(P.yaw), d = Math.max(0.4, rayDist(P.x, P.z, dx, dz, 7, false) - 0.6);
LL.x = P.x + dx * d; LL.z = P.z + dz * d;
}
function useGadget() {
if (mode !== 'playing' || R.endT >= 0) return;
if (ui === 'vault') { vaultSet(); return; }
if (ui === 'pick') { pickSet(); return; }
if (ui) return;
if (DR.on) { DR.ret = true; return; }
if (P.hidden >= 0) { toast('Step out of the locker first', UI.dim); return; }
const g = R.sel;
if (R.ch[g] <= 0) { toast('No ' + GADGETS[g].name + ' left: pick another' + tk(' (1-4)', ''), UI.danger); api.tone(180, 0.08, { type: 'square', vol: 0.04 }); return; }
if (g === 0) {
R.ch[0]--; findEmpTarget();
EMP.on = true; EMP.t = 0; EMP.sx = P.x; EMP.sz = P.z;
if (ET.kind) { EMP.kind = ET.kind; EMP.ref = ET.ref; EMP.tx = ET.x; EMP.tz = ET.z; }
else { EMP.kind = 'pulse'; EMP.ref = -1; EMP.tx = P.x + Math.sin(P.yaw) * 1.6; EMP.tz = P.z + Math.cos(P.yaw) * 1.6; }
api.tone(1400, 0.18, { type: 'sawtooth', vol: 0.05, slide: 300 });
} else if (g === 1) {
let s = null;
for (let i = 0; i < LUR.length; i++) if (!LUR[i].on) { s = LUR[i]; break; }
if (!s) s = LUR[0];
R.ch[1]--; lureLanding();
s.on = true; s.sx = P.x; s.sz = P.z; s.ex = LL.x; s.ez = LL.z; s.x = P.x; s.z = P.z; s.fly = 0; s.t = 0; s.beeps = 0;
api.tone(500, 0.06, { type: 'triangle', vol: 0.05, slide: 700 });
} else if (g === 2) {
let s = null;
for (let i = 0; i < SMK.length; i++) if (!SMK[i].on) { s = SMK[i]; break; }
if (!s) s = SMK[0];
R.ch[2]--;
s.on = true; s.x = P.x; s.z = P.z; s.r = 0.4; s.t = 0; s.life = 9;
api.noise(0.7, { vol: 0.12, filter: 2600 });
hint('smoke', 'Smoke blocks vision cones and lasers while it lasts.', 4);
} else {
R.ch[3]--;
DR.on = true; DR.ret = false; DR.x = P.x; DR.z = P.z; DR.y = 1.2; DR.t = 9 + 4 * SV.up.drone; DR.yaw = P.yaw;
api.tone(700, 0.12, { type: 'sine', vol: 0.05, slide: 1100 });
hint('drone', 'Fly the drone with ' + tk('W A S D', 'the stick') + '. Robots it spots show their patrol route. ' + tk('F or E', 'GADGET') + ' calls it back.', 6);
}
}
function disableNear(x, z, r, t) {
const r2 = r * r;
for (let i = 0; i < L.lasers.length; i++) { const o = L.lasers[i]; if ((o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) < r2) o.off = t; }
for (let i = 0; i < L.plates.length; i++) { const o = L.plates[i]; if ((o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) < r2) o.off = t; }
for (let i = 0; i < L.sensors.length; i++) { const o = L.sensors[i]; if ((o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) < (r + SENSOR_R) * (r + SENSOR_R)) o.off = t; }
}
function empHit() {
EMP.on = false;
burst(EMP.tx, 1.3, EMP.tz, 26, 4, 0.5, 0.4, 0.9, 1, 1.5);
noiseRing(EMP.tx, EMP.tz, 3.2, 3);
api.noise(0.25, { vol: 0.1, filter: 3000 });
if (EMP.kind === 'g' && guards[EMP.ref]) {
const G = guards[EMP.ref];
G.st = 'stun'; G.stun = empDur(); G.susp = 0; G.mark = 0; G.pn = 0;
toast('Guard bot stunned', UI.cyan);
} else if (EMP.kind === 'c' && cams[EMP.ref]) {
cams[EMP.ref].blind = empDur() + 2; cams[EMP.ref].susp = 0;
toast('Camera blinded', UI.cyan);
}
disableNear(EMP.tx, EMP.tz, 3.2, empDur() + 2);
}
function droneStep(dt) {
if (!DR.on) return;
DR.y += (3.4 - DR.y) * Math.min(1, dt * 3);
if (DR.ret) {
const dx = P.x - DR.x, dz = P.z - DR.z, d = Math.sqrt(dx * dx + dz * dz);
if (d < 0.6) { DR.on = false; DR.ret = false; return; }
const st = Math.min(d, 15 * dt);
DR.x += dx / d * st; DR.z += dz / d * st;
return;
}
DR.t -= dt;
if (DR.t <= 0) { DR.ret = true; toast('Drone battery low: returning', UI.violet); return; }
const iv = inputVec();
if (iv.m > 0.08) {
const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
const wx = rx * iv.x + fx * iv.z, wz = rz * iv.x + fz * iv.z;
DR.x += wx * 6.5 * dt; DR.z += wz * 6.5 * dt;
DR.yaw = Math.atan2(wx, wz);
}
DR.x = clamp(DR.x, CS, (L.W - 1) * CS); DR.z = clamp(DR.z, CS, (L.H - 1) * CS);
const dx = DR.x - P.x, dz = DR.z - P.z, d = Math.sqrt(dx * dx + dz * dz);
if (d > 24) { DR.x = P.x + dx / d * 24; DR.z = P.z + dz / d * 24; }
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (G.revealed || !G.active || G.route.length < 2) continue;
if ((G.x - DR.x) * (G.x - DR.x) + (G.z - DR.z) * (G.z - DR.z) < 81) { G.revealed = true; routesDirty = true; toast('Patrol route revealed', UI.violet); api.tone(990, 0.06, { type: 'sine', vol: 0.05 }); }
}
for (let i = 0; i < cams.length; i++) { const c = cams[i]; if (!c.known && (c.x - DR.x) * (c.x - DR.x) + (c.z - DR.z) * (c.z - DR.z) < 121) c.known = true; }
}

const PK = { door: -1, pos: 0, dir: 1, spd: 1, z0: 0, z1: 0, cool: 0, flash: 0, ok: false };
function pinsNeeded() { return 2 + Math.floor(L.i / 4); }
function newPin() {
const d = L.doors[PK.door], w = Math.max(0.12, 0.2 + 0.06 * SV.up.picks - 0.005 * L.i - 0.01 * d.pins);
const c = rand(w / 2 + 0.05, 1 - w / 2 - 0.05);
PK.z0 = c - w / 2; PK.z1 = c + w / 2;
PK.spd = 0.7 + 0.1 * d.pins + 0.02 * L.i;
}
function startPick(di) {
ui = 'pick'; PK.door = di; PK.pos = 0; PK.dir = 1; PK.cool = 0; PK.flash = 0; P.vx = P.vz = 0;
newPin();
hint('pick', tk('Press E (or Space / F)', 'Tap SET') + ' while the pin is inside the gold zone. Misses make noise.', 6, true);
}
function pickStep(dt) {
if (PK.cool > 0) PK.cool -= dt;
if (PK.flash > 0) PK.flash -= dt;
PK.pos += PK.dir * PK.spd * dt;
if (PK.pos > 1) { PK.pos = 1; PK.dir = -1; } else if (PK.pos < 0) { PK.pos = 0; PK.dir = 1; }
}
function pickSet() {
if (PK.cool > 0) return;
const d = L.doors[PK.door];
if (!d) { ui = null; return; }
if (PK.pos >= PK.z0 - 0.01 && PK.pos <= PK.z1 + 0.01) {
d.pins++; PK.flash = 0.3; PK.ok = true;
api.tone(700 + d.pins * 120, 0.06, { type: 'triangle', vol: 0.07 });
if (d.pins >= pinsNeeded()) { d.lock = 0; ui = null; toast('Lock open', UI.ok); api.tone(1200, 0.1, { type: 'triangle', vol: 0.06, delay: 0.06 }); }
else newPin();
} else {
PK.flash = 0.35; PK.ok = false; PK.cool = 0.5;
makeNoise(d.x, d.z, 4, false, true, 1);
api.tone(160, 0.12, { type: 'square', vol: 0.06 });
}
}

const VT = { dial: 0, tum: [], i: 0, cool: 0, flash: 0, ok: false, beat: 0, amp: 0, inZone: false, open: 0, lastU: 0, drag: -1, dragX: 0, btn: 0 };
function circ(a, b) { let d = Math.abs(a - b) % 100; if (d > 50) d = 100 - d; return d; }
function setupVault() {
VT.tum.length = 0;
const n = L.def.vault;
for (let i = 0; i < n; i++) {
const t = rand(0, 100);
let dec = -1;
if (L.i >= 3) { dec = (t + rand(25, 75)) % 100; }
VT.tum.push({ t: t, w: Math.max(1.3, 2.9 - L.i * 0.12 + SV.up.picks * 0.9), dec: dec });
}
VT.i = 0; VT.dial = rand(0, 100); VT.cool = 0; VT.flash = 0; VT.beat = 0; VT.amp = 0; VT.open = 0; VT.lastU = Math.floor(VT.dial); VT.drag = -1; VT.btn = 0;
}
function vaultTurn(delta) {
VT.dial = ((VT.dial + delta) % 100 + 100) % 100;
const u = Math.floor(VT.dial);
if (u !== VT.lastU) { VT.lastU = u; api.tone(380 + VT.amp * 900, 0.015, { type: 'square', vol: 0.012 + VT.amp * 0.03 }); }
}
function vaultStep(dt) {
if (VT.cool > 0) VT.cool -= dt;
if (VT.flash > 0) VT.flash -= dt;
let dir = VT.btn;
if (keys.KeyA || keys.ArrowLeft) dir -= 1;
if (keys.KeyD || keys.ArrowRight) dir += 1;
if (dir) vaultTurn(dir * 22 * dt);
const T = VT.tum[VT.i];
if (!T) { VT.amp = 0; VT.inZone = false; return; }
const d = circ(VT.dial, T.t);
let a = d < 16 ? (1 - d / 16) * (1 - d / 16) : 0;
if (T.dec >= 0) { const dd = circ(VT.dial, T.dec); if (dd < 7) a = Math.max(a, 0.55 * (1 - dd / 7) * (1 - dd / 7)); }
VT.amp += (a - VT.amp) * Math.min(1, dt * 10);
VT.inZone = d <= T.w;
VT.beat += dt * (1.2 + VT.amp * 5);
}
function vaultSet() {
if (VT.cool > 0) return;
const T = VT.tum[VT.i];
if (!T) return;
if (circ(VT.dial, T.t) <= T.w) {
VT.i++; VT.flash = 0.4; VT.ok = true;
api.tone(240, 0.12, { type: 'square', vol: 0.07 }); api.tone(480, 0.1, { type: 'triangle', vol: 0.05, delay: 0.05 });
if (VT.i >= VT.tum.length) openVault();
} else {
VT.flash = 0.45; VT.ok = false; VT.cool = 0.8;
makeNoise(L.vault.x, L.vault.z, 6.5, true, true, 1);
toast('Slip! The dial clanked', UI.danger);
api.tone(130, 0.18, { type: 'square', vol: 0.07 });
}
}
function openVault() {
R.vaultDone = true; R.loot += L.def.cash; ui = null;
toast('Vault cracked: +' + fmtCash(L.def.cash), UI.hi);
burst(L.vault.x, 1.2, L.vault.z, 40, 3.5, 1.0, 1, 0.82, 0.3, 2);
api.tone(523, 0.12, { type: 'triangle', vol: 0.07 }); api.tone(659, 0.12, { type: 'triangle', vol: 0.07, delay: 0.12 }); api.tone(784, 0.2, { type: 'triangle', vol: 0.07, delay: 0.24 });
hint('escape', 'Vault cracked! Now get to the green exit.', 5, true);
}

function startChannel(kind, ref) {
CH.on = true; CH.kind = kind; CH.ref = ref; CH.t = 0; CH.dur = kind === 'hack' ? (R.alarm ? 4 : 2.5) : 2.6; CH.x = P.x; CH.z = P.z; CH.noiseT = 0;
P.vx = P.vz = 0;
api.tone(kind === 'hack' ? 900 : 200, 0.06, { type: 'square', vol: 0.04 });
}
function channelStep(dt) {
if (!CH.on) return;
const iv = inputVec();
if (iv.m > 0.3 || P.hidden >= 0) { CH.on = false; toast('Interrupted', UI.dim); return; }
CH.t += dt;
if (CH.kind === 'force') {
CH.noiseT -= dt;
if (CH.noiseT <= 0) { CH.noiseT = 0.8; makeNoise(P.x, P.z, 6.5, false, true, 1); api.noise(0.12, { vol: 0.08, filter: 500 }); }
} else if (Math.random() < dt * 10) {
const p = L.panels[CH.ref];
if (p) spark(p.x, 1.2, p.z, rand(-1, 1), 1, rand(-1, 1), 0.3, 0.3, 1, 0.6);
}
if (CH.t >= CH.dur) {
CH.on = false;
if (CH.kind === 'hack') {
const p = L.panels[CH.ref];
if (p) p.used = true;
if (R.alarm) { cancelAlarm(); toast('Alarm cancelled. Doors unsealed.', UI.ok); }
else { R.loopT = 30; R.laserKill = true; toast('Cameras looped 30 s, lasers cut', UI.ok); }
api.tone(1047, 0.1, { type: 'triangle', vol: 0.06 }); api.tone(1319, 0.14, { type: 'triangle', vol: 0.06, delay: 0.1 });
} else {
const d = L.doors[CH.ref];
if (d) { d.lock = 0; d.forced = true; }
toast('Door forced open', UI.hi);
api.noise(0.3, { vol: 0.12, filter: 400 });
}
}
}

function exitDist(d) {
let best = 1e9;
for (let i = 0; i < L.exits.length; i++) { const e = L.exits[i], v = (e.x - d.x) * (e.x - d.x) + (e.z - d.z) * (e.z - d.z); if (v < best) best = v; }
return best;
}
function triggerAlarm(x, z, reason) {
if (R.endT >= 0) return;
if (R.alarm) { if (R.radioCD <= 0) { R.radioCD = 2; callNearest(x, z); } return; }
R.alarm = true; R.everAlarm = true; R.spotted = true; R.lockMax = L.def.lock; R.lockT = R.lockMax; R.alarmReason = reason;
const ord = [];
for (let i = 0; i < L.doors.length; i++) if (L.doors[i].lock === 0 && L.doors[i].kind === 'D' && !L.doors[i].forced) ord.push(i);
ord.sort(function (a, b) { return exitDist(L.doors[b]) - exitDist(L.doors[a]); });
R.sealOrder = ord; R.sealI = 0; R.sealGap = R.lockMax / (ord.length + 1.5); R.sealNext = R.sealGap;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active) { G.active = true; G.st = 'look'; G.t = 0.4; burst(G.x, 1.4, G.z, 10, 2, 0.5, 1, 0.3, 0.3, 1); }
if (G.st === 'alert' || G.st === 'stun') continue;
if ((G.x - x) * (G.x - x) + (G.z - z) * (G.z - z) < 18 * 18) { G.susp = Math.max(G.susp, 0.7); G.lx = x; G.lz = z; G.st = 'inv'; G.mark = 1; goTo(G, x, z); }
}
R.shake = 0.5; R.flash = 1; R.flashCol = 1;
api.tone(740, 0.25, { type: 'square', vol: 0.07 }); api.tone(520, 0.3, { type: 'square', vol: 0.07, delay: 0.25 });
hint('alarm', 'ALARM! Doors seal one by one. Crack the vault and get out before lockdown, or hack an alarm panel (' + tk('E', 'USE') + ') to stop it.', 7, true);
toast(reason, UI.danger);
}
function cancelAlarm() {
R.alarm = false; R.lockT = 0;
for (let i = 0; i < L.doors.length; i++) if (L.doors[i].lock === 3) L.doors[i].lock = 0;
repathAll();
}
function repathAll() {
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (G.active && (G.st === 'patrol' || G.st === 'inv' || G.st === 'return' || G.st === 'alert')) goTo(G, G.gx, G.gz);
}
}
function doorBusy(d) {
if (Math.abs(P.x - d.x) < 1.4 && Math.abs(P.z - d.z) < 1.4) return true;
for (let i = 0; i < guards.length; i++) if (guards[i].active && Math.abs(guards[i].x - d.x) < 1.3 && Math.abs(guards[i].z - d.z) < 1.3) return true;
return false;
}
function alarmStep(dt) {
if (!R.alarm) return;
R.lockT -= dt; R.sealNext -= dt;
if (R.sealNext <= 0 && R.sealI < R.sealOrder.length) {
const d = L.doors[R.sealOrder[R.sealI]];
if (doorBusy(d)) R.sealNext = 0.7;
else {
d.lock = 3; R.sealI++; R.sealNext = R.sealGap;
repathAll();
api.tone(150, 0.25, { type: 'square', vol: 0.05 });
const near = (d.x - P.x) * (d.x - P.x) + (d.z - P.z) * (d.z - P.z) < 200;
if (near) toast('A door just sealed (' + tk('E', 'USE') + ' to force it)', UI.danger);
}
}
if (R.lockT <= 0) { R.lockT = 0; endRun('locked'); }
}
function doorsStep(dt) {
for (let i = 0; i < L.doors.length; i++) {
const d = L.doors[i];
let want = 0;
if (d.lock === 0) {
if (d.forced) want = 1;
else {
const dx = P.x - d.x, dz = P.z - d.z;
if (dx * dx + dz * dz < 1.8 * 1.8 && P.hidden < 0) want = 1;
for (let k = 0; k < guards.length && !want; k++) {
const G = guards[k];
if (G.active && (G.x - d.x) * (G.x - d.x) + (G.z - d.z) * (G.z - d.z) < 1.7 * 1.7) want = 1;
}
}
}
const was = d.open;
d.open += clamp(want - d.open, -dt * 3.5, dt * 3.5);
if (was === 0 && d.open > 0) {
const dx = P.x - d.x, dz = P.z - d.z;
if (dx * dx + dz * dz < 100) api.noise(0.12, { vol: 0.025, filter: 1800 });
}
}
}
function securityStep(dt) {
if (R.loopT > 0) R.loopT -= dt;
const lz = L.def.laser;
for (let i = 0; i < L.lasers.length; i++) {
const o = L.lasers[i];
if (o.off > 0) o.off -= dt;
let on = true, warn = false;
if (lz) { let f = (R.time / lz.per + o.ph) % 1; if (f < 0) f += 1; on = f < lz.duty; warn = !on && f > 1 - 0.14; }
if (R.laserKill || o.off > 0) { on = false; warn = false; }
o.on = on; o.warn = warn;
if (on && P.hidden < 0 && R.endT < 0 && !inSmoke(o.x, o.z, 0.3)) {
const ax = Math.abs(P.x - o.x), az = Math.abs(P.z - o.z);
const hit = o.alongZ ? (ax < PR * 0.85 && az < CS * 0.5) : (az < PR * 0.85 && ax < CS * 0.5);
if (hit) { burst(P.x, 1, P.z, 12, 2, 0.4, 1, 0.2, 0.2, 1); o.off = 1.5; triggerAlarm(o.x, o.z, 'Laser grid tripped'); }
}
}
const pc = cellOf(P.x, P.z);
for (let i = 0; i < L.plates.length; i++) {
const o = L.plates[i];
if (o.off > 0) { o.off -= dt; continue; }
if (P.hidden < 0 && pc === cellOf(o.x, o.z)) { o.off = 3; burst(o.x, 0.3, o.z, 12, 2, 0.4, 1, 0.6, 0.2, 1); triggerAlarm(o.x, o.z, 'Pressure plate stepped on'); }
}
for (let i = 0; i < L.sensors.length; i++) {
const o = L.sensors[i];
if (o.cool > 0) o.cool -= dt;
if (o.off > 0) { o.off -= dt; continue; }
if (o.cool > 0 || P.hidden >= 0 || P.inVent) continue;
const dx = P.x - o.x, dz = P.z - o.z;
if (dx * dx + dz * dz < SENSOR_R * SENSOR_R && P.speed > SPD_SNEAK + 0.35) {
o.cool = 4;
makeNoise(o.x, o.z, 13, true, true, 2);
api.tone(1200, 0.1, { type: 'square', vol: 0.06 }); api.tone(1200, 0.1, { type: 'square', vol: 0.06, delay: 0.18 });
toast('Motion sensor tripped: bots are coming', UI.danger);
hint('sensor2', 'Sensors hear movement. Sneak (' + tk('C', 'SNEAK') + ') and you can pass right through the ring.', 6, true);
}
}
}

function fxStep(dt) {
if (EMP.on) {
EMP.t += dt / 0.22;
const t = Math.min(1, EMP.t);
EMP.x = lerp(EMP.sx, EMP.tx, t); EMP.z = lerp(EMP.sz, EMP.tz, t);
spark(EMP.x, 1.2, EMP.z, rand(-0.5, 0.5), rand(0, 0.5), rand(-0.5, 0.5), 0.3, 0.3, 0.8, 1);
if (EMP.t >= 1) empHit();
}
for (let i = 0; i < LUR.length; i++) {
const s = LUR[i];
if (!s.on) continue;
if (s.fly < 1) {
s.fly += dt / 0.55;
const t = Math.min(1, s.fly);
s.x = lerp(s.sx, s.ex, t); s.z = lerp(s.sz, s.ez, t);
if (s.fly >= 1) { makeNoise(s.ex, s.ez, 11, true, true, 2); api.tone(1500, 0.05, { type: 'square', vol: 0.05 }); s.beeps = 1; s.t = 0; }
} else {
s.t += dt;
if (s.beeps < 4 && s.t > s.beeps * 0.8) { s.beeps++; noiseRing(s.ex, s.ez, 4, 2); api.tone(1500, 0.05, { type: 'square', vol: 0.04 }); }
if (s.t > 5) s.on = false;
}
}
for (let i = 0; i < SMK.length; i++) {
const s = SMK[i];
if (!s.on) continue;
s.t += dt;
s.r = s.t > s.life - 1 ? Math.max(0, 2.8 * (s.life - s.t)) : Math.min(2.8, 0.4 + s.t * 4);
if (s.t >= s.life) s.on = false;
}
for (let i = 0; i < noiseFx.length; i++) { const n = noiseFx[i]; if (n.on) { n.t += dt / 0.6; if (n.t >= 1) n.on = false; } }
for (let i = 0; i < MAX_P; i++) {
if (plife[i] <= 0) continue;
plife[i] -= dt;
const j = i * 3;
if (plife[i] <= 0) { partPos[j + 1] = -100; partCol[j] = partCol[j + 1] = partCol[j + 2] = 0; continue; }
pvy[i] -= 5 * dt;
partPos[j] += pvx[i] * dt; partPos[j + 1] = Math.max(0.05, partPos[j + 1] + pvy[i] * dt); partPos[j + 2] += pvz[i] * dt;
const f = plife[i] / pmax[i];
partCol[j] = pr0[i] * f; partCol[j + 1] = pg0[i] * f; partCol[j + 2] = pb0[i] * f;
}
if (R.shake > 0) R.shake = Math.max(0, R.shake - dt);
if (R.flash > 0) R.flash = Math.max(0, R.flash - dt * 1.6);
}

const HINT = { text: '', t: 0 };
let shown = {}, hintTick = 0, obsTick = 0;
function hint(key, text, dur, urgent) {
if (shown[key]) return;
if (HINT.t > 0.6 && !urgent) return;
shown[key] = true; HINT.text = text; HINT.t = dur || 5;
}
const toasts = [];
function toast(text, col) {
if (toasts.length >= 4) toasts.pop();
toasts.unshift({ text: text, col: col || UI.body, t: 2.6 });
}
function near(x, z, r) { const dx = x - P.x, dz = z - P.z; return dx * dx + dz * dz < r * r; }
function tk(k, t) { return touchUI ? t : k; }
function hintStep(dt) {
if (HINT.t > 0) HINT.t -= dt;
for (let i = toasts.length - 1; i >= 0; i--) { toasts[i].t -= dt; if (toasts[i].t <= 0) toasts.splice(i, 1); }
hintTick -= dt;
if (hintTick > 0) return;
hintTick = 0.25;
if (L.def.tut) hint('t_move', tk('Move with W A S D or the arrow keys. Q / R turn the view, Z / X zoom.', 'Drag on the left half to move. The arrow buttons turn the view.'), 6);
if (R.time > 24) hint('tab', tk('Tab', 'MAP') + ' opens the plan map: walls, cameras and any patrol routes you have revealed. The action pauses there.', 6);
for (let i = 0; i < L.sensors.length; i++) if (near(L.sensors[i].x, L.sensors[i].z, SENSOR_R + 6.5)) hint('sensor', 'Motion sensor ring ahead: ' + tk('press C', 'tap SNEAK') + ' to sneak through it. Walking or running sets it off.', 7, true);
for (let i = 0; i < guards.length; i++) if (guards[i].active && near(guards[i].x, guards[i].z, 11)) hint('guard', 'Robot guard: keep out of its vision cone. Dark floor and sneaking (' + tk('C', 'SNEAK') + ') make you much harder to see.', 7);
for (let i = 0; i < cams.length; i++) if (near(cams[i].x, cams[i].z, 11)) hint('cam', 'Camera: stay out of its cone, or ' + tk('pick EMP (1) and press F', 'pick EMP and tap GADGET') + ' to blind it for a while.', 6);
for (let i = 0; i < L.lasers.length; i++) if (near(L.lasers[i].x, L.lasers[i].z, 5)) hint('laser', 'Laser grid: it switches on and off. Cross in the gap, or cut it with SMOKE' + tk(' (3)', '') + ' or an EMP.', 6);
for (let i = 0; i < L.plates.length; i++) if (near(L.plates[i].x, L.plates[i].z, 4.5)) hint('plate', 'Pressure plates (amber squares) trip the alarm. Step around them.', 5);
for (let i = 0; i < L.lockers.length; i++) if (near(L.lockers[i].x, L.lockers[i].z, 3)) hint('locker', 'Locker: ' + tk('press E', 'tap USE') + ' next to it to hide.', 4);
for (let i = 0; i < L.panels.length; i++) if (near(L.panels[i].x, L.panels[i].z, 3.5)) hint('panel', 'Alarm panel: ' + tk('press E', 'tap USE') + ' to hack it. It loops the cameras, cuts lasers, or stops an alarm.', 6);
for (let i = 0; i < L.doors.length; i++) {
const d = L.doors[i];
if (d.lock === 2 && near(d.x, d.z, 3.5)) hint('pdoor', 'Lock-pick door: ' + tk('press E', 'tap USE') + ' next to it.', 4);
if (d.lock === 1 && near(d.x, d.z, 3.5)) hint('kdoor', 'Blue keycard door. The keycard is the blue dot on the plan map (' + tk('Tab', 'MAP') + ').', 6);
}
if (!R.vaultDone && near(L.vault.x, L.vault.z, 4)) hint('vaultnear', 'The vault! Stand next to it and ' + tk('press E', 'tap USE') + ' to start cracking.', 5);
const ci = cellOf(P.x, P.z);
for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
const c = ci + dz * L.W + dx;
if (c >= 0 && c < L.W * L.H && L.tile[c] === T_VENT) hint('vent', 'Vent: ' + tk('press C', 'tap SNEAK') + ' to crouch and crawl in. Nothing can see you inside.', 5);
}
obsTick += 0.25;
if (obsTick >= 0.5) {
obsTick = 0;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (G.revealed || !G.active || G.route.length < 2 || !near(G.x, G.z, 9) || !losClear(P.x, P.z, G.x, G.z, true)) continue;
G.obs += 0.5;
if (G.obs >= 3) { G.revealed = true; routesDirty = true; toast('Patrol route mapped', UI.hi); }
}
}
}
function objective() {
if (R.vaultDone) return R.alarm ? 'LOCKDOWN: get to a green exit now' : 'Escape: reach a green exit';
if (R.alarm) return 'LOCKDOWN: crack the vault fast, or hack a panel';
if (L.def.tut) return R.card ? 'Crack the vault: east room, through the blue door' : 'Grab the keycard: north-west room, hug the dark wall';
if (L.hasK && !R.card) return 'Crack the vault (a keycard is hidden here)';
return 'Crack the vault';
}

let routesDirty = true;
const routeTmp = new Int16Array(400);
function computeRoute(G) {
const rc = [];
const legs = G.route.length === 2 ? 1 : G.route.length;
rc.push(cellAt(G.route[0][0], G.route[0][1]));
for (let w = 0; w < legs; w++) {
const a = G.route[w], b = G.route[(w + 1) % G.route.length];
const n = bfsTo(cellAt(a[0], a[1]), cellAt(b[0], b[1]), routeTmp);
for (let k = 0; k < n; k++) rc.push(routeTmp[k]);
}
G.rc = rc;
}
function updateRoutes() {
routesDirty = false;
let n = 0;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.revealed || G.route.length < 2) continue;
if (!G.rc) computeRoute(G);
for (let k = 1; k < G.rc.length && n + 2 <= ROUTE_MAX; k++) {
const a = G.rc[k - 1], b = G.rc[k];
routePos[n * 3] = wc(a % L.W); routePos[n * 3 + 1] = 0.07; routePos[n * 3 + 2] = wc((a / L.W) | 0); n++;
routePos[n * 3] = wc(b % L.W); routePos[n * 3 + 1] = 0.07; routePos[n * 3 + 2] = wc((b / L.W) | 0); n++;
}
}
routeGeo.setDrawRange(0, n);
routeGeo.getAttribute('position').needsUpdate = true;
}

function takeSnapshot(ci) {
const c = L.checks[ci];
R.ck = {
x: c.x, z: c.z, items: L.items.map(function (o) { return o.got; }), checks: L.checks.map(function (o) { return o.got; }),
doors: L.doors.map(function (d) { return d.lock === 3 ? 0 : d.lock; }), forced: L.doors.map(function (d) { return !!d.forced; }),
panels: L.panels.map(function (p) { return p.used; }), card: R.card, ch: R.ch.slice(), vaultDone: R.vaultDone, vi: VT.i,
loot: R.loot, spotted: R.spotted, everAlarm: R.everAlarm, time: R.time, laserKill: R.laserKill,
};
}
function resetRun(fromCk) {
const ck = fromCk ? R.ck : null;
for (let i = 0; i < L.items.length; i++) L.items[i].got = ck ? !!ck.items[i] : false;
for (let i = 0; i < L.checks.length; i++) L.checks[i].got = ck ? !!ck.checks[i] : false;
for (let i = 0; i < L.doors.length; i++) {
const d = L.doors[i];
d.lock = ck ? ck.doors[i] : d.lock0; d.forced = ck ? ck.forced[i] : false; d.open = d.forced ? 1 : 0; d.pins = 0;
}
for (let i = 0; i < L.panels.length; i++) L.panels[i].used = ck ? !!ck.panels[i] : false;
for (let i = 0; i < L.lasers.length; i++) { L.lasers[i].off = 0; L.lasers[i].on = false; }
for (let i = 0; i < L.plates.length; i++) L.plates[i].off = 0;
for (let i = 0; i < L.sensors.length; i++) { L.sensors[i].cool = 0; L.sensors[i].off = 0; }
R.time = ck ? ck.time : 0; R.loot = ck ? ck.loot : 0; R.spotted = ck ? ck.spotted : false; R.everAlarm = ck ? ck.everAlarm : false;
R.alarm = false; R.lockT = 0; R.lockMax = L.def.lock; R.sealOrder = []; R.sealI = 0;
R.card = ck ? ck.card : false; R.ch = ck ? ck.ch.slice() : baseCharges(); R.sel = 0; R.vaultDone = ck ? ck.vaultDone : false;
R.endT = -1; R.endKind = ''; R.caughtBy = -1; R.loopT = 0; R.laserKill = ck ? ck.laserKill : false; R.lockerSeen = -1;
R.result = null; R.radioCD = 0; R.maxSusp = 0; R.shake = 0; R.flash = 0;
if (fromCk) R.ckUsed++;
setupVault();
if (ck) VT.i = Math.min(ck.vi, VT.tum.length);
VT.open = R.vaultDone ? 1 : 0;
P.x = ck ? ck.x : L.sx; P.z = ck ? ck.z : L.sz; P.vx = P.vz = 0; P.crouch = false; P.sprint = false; P.moving = false; P.speed = 0;
P.hidden = -1; P.inVent = false; P.stepT = 0.6; P.stuckT = 0; P.exitWarn = 0; P.yaw = Math.PI;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
let wi = 0;
if (ck && !G.dorm) {   // after a checkpoint restore, start each bot at the waypoint farthest from the thief
let bd = -1;
for (let k = 0; k < G.route.length; k++) { const dx = wc(G.route[k][0]) - P.x, dz = wc(G.route[k][1]) - P.z, d = dx * dx + dz * dz; if (d > bd) { bd = d; wi = k; } }
}
const w = G.route[wi];
G.x = wc(w[0]); G.z = wc(w[1]); G.wi = wi; G.st = 'look'; G.t = 0.6 + i * 0.35; G.susp = 0; G.active = !G.dorm; G.stun = 0; G.mark = 0;
G.see = false; G.radio = 0; G.lost = 0; G.pn = 0; G.pi = 0; G.stuckT = 0; G.stuckN = 0; G.px = G.x; G.pz = G.z; G.heard = 0; G.lunge = 0; G.repath = 0;
G.gx = G.x; G.gz = G.z;
if (!ck) { G.revealed = false; G.obs = 0; }
if (G.route.length > 1) { const n = G.route[(wi + 1) % G.route.length]; G.yaw = Math.atan2(wc(n[0]) - G.x, wc(n[1]) - G.z); } else G.yaw = Math.PI;
G.lookBase = G.yaw;
}
for (let i = 0; i < cams.length; i++) {
const c = cams[i];
c.yaw = c.base; c.susp = 0; c.blind = 0; c.track = 0; c.see = false; c.ph = i * 1.7;
c.known = true;
}
routesDirty = true;
for (let i = 0; i < SMK.length; i++) SMK[i].on = false;
for (let i = 0; i < LUR.length; i++) LUR[i].on = false;
for (let i = 0; i < noiseFx.length; i++) noiseFx[i].on = false;
for (let i = 0; i < MAX_P; i++) { plife[i] = 0; partPos[i * 3 + 1] = -100; partCol[i * 3] = partCol[i * 3 + 1] = partCol[i * 3 + 2] = 0; }
DR.on = false; DR.ret = false; EMP.on = false; CH.on = false;
ui = null; HINT.t = 0; toasts.length = 0; hintTick = 0; obsTick = 0;
stick.on = false; stick.id = -1; VT.btn = 0;
camYaw = camYawT = 0; snapCamera = true;
acc = 0; dirty = true;
}
function heistOpen(i) { return i >= 0 && i < HEISTS.length && (i === 0 || SV.h[i - 1].done) && SV.site[HEISTS[i].site]; }
function startHeist(i) {
if (L.i !== i || !lvGroup) buildLevel(i);
R.ck = null; R.ckUsed = 0;
for (let k = 0; k < guards.length; k++) { guards[k].rc = null; guards[k].revealed = false; }
if (L.def.tut) shown = {};
resetRun(false);
mode = 'playing'; paused = false; ui = null; overAt = 0;
SV.last = i; selH = i;
audioStop(); audioStart();
}
function retryCheckpoint() {
if (!R.ck) { startHeist(L.i); return; }
resetRun(true);
mode = 'playing'; paused = false;
toast('Back at the checkpoint', UI.ok);
audioStop(); audioStart();
}
function endRun(kind) {
if (R.endT >= 0 || mode !== 'playing') return;
R.endT = 0; R.endKind = kind; ui = null; CH.on = false; DR.on = false;
if (kind === 'escape') { api.tone(523, 0.1, { type: 'triangle', vol: 0.07 }); api.tone(784, 0.16, { type: 'triangle', vol: 0.07, delay: 0.1 }); api.tone(1047, 0.24, { type: 'triangle', vol: 0.07, delay: 0.22 }); }
else { api.tone(330, 0.3, { type: 'sawtooth', vol: 0.06, slide: 110 }); R.shake = 0.3; }
}
function caught(G) {
if (R.endT >= 0) return;
R.caughtBy = guards.indexOf(G);
if (P.hidden >= 0) leaveLocker();
endRun('caught');
}
function finish() {
const kind = R.endKind, ok = kind === 'escape', def = L.def, h = SV.h[L.i];
const pct = L.lootMax > 0 ? clamp(R.loot / L.lootMax, 0, 1) : 0;
const ghost = ok && !R.spotted, fast = ok && R.time <= def.par;
const pts = ok ? 1 + (ghost ? 1 : 0) + (pct >= 0.8 ? 1 : 0) + (fast ? 1 : 0) - (R.everAlarm ? 1 : 0) : -1;
const grade = !ok ? '' : pts >= 4 ? 'S' : pts === 3 ? 'A' : pts === 2 ? 'B' : pts === 1 ? 'C' : 'D';
const banked = ok ? R.loot : 0;
let unlockedNext = false;
if (ok) {
SV.cash += banked; SV.career += banked;
if (!h.done && L.i + 1 < HEISTS.length) unlockedNext = true;
h.done = true;
if (!h.grade || 'DCBAS'.indexOf(grade) > 'DCBAS'.indexOf(h.grade)) h.grade = grade;
if (ghost) h.ghost = true;
h.loot = Math.max(h.loot, pct);
if (!h.time || R.time < h.time) h.time = R.time;
}
const nb = !!api.submit(SV.career);
writeSave();
R.result = { kind: kind, ok: ok, banked: banked, loot: R.loot, pct: pct, ghost: ghost, fast: fast, time: R.time, par: def.par, grade: grade,
newBest: nb, alarm: R.everAlarm, unlockedNext: unlockedNext, hasCk: !!R.ck };
mode = 'over'; overAt = performance.now(); ui = null;
audioStop(); clearHeld();
}
function nextHeistTarget() {
if (!R.result || !R.result.ok) return -1;
const n = L.i + 1;
return n < HEISTS.length && heistOpen(n) ? n : -1;
}

function step(dt) {
if (R.endT >= 0) {
R.endT += dt;
fxStep(dt);
const G = guards[R.caughtBy];
if (R.endKind === 'caught' && G) { G.lunge = Math.min(1, G.lunge + dt * 3); turnTo(G, Math.atan2(P.x - G.x, P.z - G.z), 8 * dt); }
if (R.endT > (R.endKind === 'escape' ? 1.1 : 1.8)) finish();
return;
}
R.time += dt;
if (R.radioCD > 0) R.radioCD -= dt;
if (ui === 'vault') vaultStep(dt); else if (ui === 'pick') pickStep(dt);
playerStep(dt);
if (R.endT >= 0) return;
droneStep(dt); channelStep(dt); doorsStep(dt);
let ms = 0;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
guardStep(G, dt);
if (R.endT >= 0) return;
if (G.active && G.st !== 'stun' && G.susp > ms) ms = G.susp;
}
for (let i = 0; i < cams.length; i++) { camStep(cams[i], dt); if (cams[i].susp > ms) ms = cams[i].susp; }
R.maxSusp = ms;
securityStep(dt);
alarmStep(dt);
fxStep(dt);
hintStep(dt);
if (routesDirty) updateRoutes();
}

let AU = null, auT = 0, auPoll = 0;
function getA() { try { return typeof api.audio === 'function' ? api.audio() : null; } catch (err) { return null; } }
function audioStart() {
if (AU || destroyed) return;
const A = getA();
if (!A || !A.ctx || !A.out) return;
try {
const c = A.ctx, srcs = [], nodes = [];
const bus = c.createGain(); bus.gain.value = 0.8; bus.connect(A.out); nodes.push(bus);
const len = Math.floor(c.sampleRate * 2), buf = c.createBuffer(1, len, c.sampleRate), dd = buf.getChannelData(0);
for (let i = 0; i < len; i++) dd[i] = Math.random() * 2 - 1;
const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
const nf = c.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 300;
const ng = c.createGain(); ng.gain.value = 0.045;
n.connect(nf); nf.connect(ng); ng.connect(bus); srcs.push(n); nodes.push(n, nf, ng);
const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 82.4;
const og = c.createGain(); og.gain.value = 0.028;
o1.connect(og); o2.connect(og); og.connect(bus); srcs.push(o1, o2); nodes.push(o1, o2, og);
const t1 = c.createOscillator(); t1.type = 'sine'; t1.frequency.value = 46;
const tg = c.createGain(); tg.gain.value = 0;
t1.connect(tg); tg.connect(bus); srcs.push(t1); nodes.push(t1, tg);
const s1 = c.createOscillator(); s1.type = 'sawtooth'; s1.frequency.value = 600;
const sf = c.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 1400;
const sg = c.createGain(); sg.gain.value = 0;
s1.connect(sf); sf.connect(sg); sg.connect(bus); srcs.push(s1); nodes.push(s1, sf, sg);
const t0 = c.currentTime;
for (let i = 0; i < srcs.length; i++) srcs[i].start(t0);
AU = { c: c, srcs: srcs, nodes: nodes, tg: tg, sg: sg, s1: s1 };
} catch (err) { AU = null; }
}
function audioStop() {
if (!AU) return;
const a = AU;
AU = null;
for (let i = 0; i < a.srcs.length; i++) { try { a.srcs[i].stop(); } catch (err) { /* already stopped */ } }
for (let i = 0; i < a.nodes.length; i++) { try { a.nodes[i].disconnect(); } catch (err) { /* already gone */ } }
}
function audioUpdate(dt) {
const want = mode === 'playing' && !paused && R.endT < 0;
if (!want) { if (AU) audioStop(); return; }
auPoll -= dt;
if (auPoll <= 0) {
auPoll = 0.5;
const A = getA();
if (!A && AU) audioStop();
else if (A && AU && A.ctx !== AU.c) { audioStop(); audioStart(); }
else if (A && !AU) audioStart();
}
if (!AU || AU.c.state !== 'running') return;
auT -= dt;
if (auT > 0) return;
auT = 0.1;
try {
const now = AU.c.currentTime;
AU.tg.gain.setTargetAtTime(clamp(R.maxSusp, 0, 1) * 0.07, now, 0.15);
AU.sg.gain.setTargetAtTime(R.alarm ? 0.03 : 0, now, 0.1);
if (R.alarm) AU.s1.frequency.setTargetAtTime(640 + 240 * Math.sin(animT * 3.4), now, 0.06);
} catch (err) { /* context gone */ }
}

let snapCamera = true, camFX = 0, camFZ = 0;
const PITCH = 0.98;
function updateCamera(dt) {
let fx = P.x, fz = P.z;
if (DR.on) { fx = DR.x; fz = DR.z; }
if (mode === 'title' || mode === 'select') { fx = L.W * CS / 2; fz = L.H * CS / 2; camYaw += dt * 0.05; camYawT = camYaw; }
if (snapCamera) { camFX = fx; camFZ = fz; camYaw = camYawT; zoom = zoomT; }
else {
const k = Math.min(1, dt * 7);
camFX += (fx - camFX) * k; camFZ += (fz - camFZ) * k;
camYaw += (camYawT - camYaw) * Math.min(1, dt * 9);
zoom += (zoomT - zoom) * Math.min(1, dt * 6);
}
const d = (mode === 'title' || mode === 'select') ? Math.max(L.W, L.H) * CS * 0.75 : mode === 'brief' ? zoom + 4 : zoom;
let sx = 0, sz = 0;
if (R.shake > 0 && !reduceMotion && mode === 'playing') { sx = rand(-1, 1) * R.shake * 0.5; sz = rand(-1, 1) * R.shake * 0.5; }
const cp = Math.cos(PITCH) * d;
camera.position.set(camFX + Math.sin(camYaw) * cp + sx, Math.sin(PITCH) * d, camFZ + Math.cos(camYaw) * cp + sz);
focusV.set(camFX + sx, 0.6, camFZ + sz);
camera.lookAt(focusV);
scene.fog.near = d + 5; scene.fog.far = d + 55;
sun.position.set(camFX - 14, 30, camFZ + 20); sun.target.position.set(camFX, 0, camFZ);
sun.target.updateMatrixWorld();
}
function updateCutaway(dt, snap) {
const fx = camFX, fz = camFZ, sy = Math.sin(camYaw), cy = Math.cos(camYaw);
const active = mode === 'playing' || mode === 'over' || mode === 'brief';
let a0 = false, a1 = false;
for (let k = 0; k < cutTotal; k++) {
const dx = cutX[k] - fx, dz = cutZ[k] - fz, toward = dx * sy + dz * cy, side = Math.abs(dx * cy - dz * sy);
const want = active && toward > -1.2 && toward < 6 && side < 3.8 + toward * 0.2 ? CUT_H : cutH[k];
const cur = cutCur[k];
if (Math.abs(cur - want) < 0.002) continue;
const nv = snap ? want : cur + clamp(want - cur, -dt * 9, dt * 9);
cutCur[k] = nv;
setInst(cutMesh[cutWho[k]], cutIdx[k], cutX[k], 0, cutZ[k], 0, CS, nv, CS);
if (cutWho[k]) a1 = true; else a0 = true;
}
if (a0 && cutMesh[0]) cutMesh[0].instanceMatrix.needsUpdate = true;
if (a1 && cutMesh[1]) cutMesh[1].instanceMatrix.needsUpdate = true;
}

function coneSlot(slot, x, z, yaw, half, range, r, g, b) {
const base = slot * CONE_V * 3;
conePos[base] = x; conePos[base + 1] = 0.09; conePos[base + 2] = z;
coneCol[base] = r; coneCol[base + 1] = g; coneCol[base + 2] = b;
for (let i = 0; i < CONE_R; i++) {
const a = yaw - half + (2 * half) * i / (CONE_R - 1), dx = Math.sin(a), dz = Math.cos(a);
const d = rayDist(x, z, dx, dz, range, true), j = base + (i + 1) * 3, f = 0.22 + 0.15 * (1 - d / range);
conePos[j] = x + dx * d; conePos[j + 1] = 0.09; conePos[j + 2] = z + dz * d;
coneCol[j] = r * f; coneCol[j + 1] = g * f; coneCol[j + 2] = b * f;
}
}
function suspCol(s, alert) {
if (alert) { tmpC.setRGB(0.75, 0.12, 0.1); return; }
const t = clamp(s, 0, 1);
tmpC.setRGB(lerp(0.2, 0.75, t), lerp(0.42, 0.55, t), lerp(0.5, 0.08, t));
}
const LOCK_COL = [0x7b8aa8, 0x3d7bff, 0xffb340, 0xff3b3b];
function syncScene(dt) {
const hideP = P.hidden >= 0 || (R.endKind === 'escape' && R.endT > 0.5);
thief.visible = !hideP && mode !== 'title' && mode !== 'select';
thief.position.set(P.x, 0, P.z);
thief.rotation.y = P.yaw;
thief.scale.set(1, P.crouch ? 0.7 : 1, 1);
tBody.position.y = 0.62 + (P.moving ? Math.abs(Math.sin(animT * 11)) * 0.04 : 0);
youRing.visible = thief.visible;
youRing.position.set(P.x, 0.05, P.z);
const lf = playerLightF() * stanceF();
youRing.material.color.setRGB(0.15 + 0.4 * clamp(lf, 0, 1), 0.45 + 0.45 * clamp(lf, 0, 1), 0.55 + 0.4 * clamp(lf, 0, 1));
let bi = 0;
if (thief.visible) setInst(blobs, bi++, P.x, 0.04, P.z, 0, 1.1, 1, 1.1);
tmpE.set(0, 0, 0);
let slot = 0;
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
const bob = G.active && G.st !== 'stun' ? Math.sin(G.anim * 3) * 0.05 : -0.08;
const lx = G.lunge * 0.35 * Math.sin(G.yaw), lz = G.lunge * 0.35 * Math.cos(G.yaw);
for (let k = 0; k < 4; k++) setInst(gMesh[k], i, G.x + lx, bob, G.z + lz, G.yaw, 1, 1, 1);
if (!G.active) tmpC.setRGB(0.08, 0.1, 0.14);
else if (G.st === 'stun') { const f = 0.4 + 0.4 * Math.sin(animT * 30); tmpC.setRGB(0.5 * f, 0.4 * f, 1 * f); }
else if (G.st === 'alert') tmpC.setRGB(1, 0.18, 0.15);
else if (G.susp > 0.05 || G.st === 'inv' || G.st === 'search') tmpC.setRGB(1, 0.78, 0.2);
else tmpC.setRGB(0.35, 0.9, 1);
gMesh[3].setColorAt(i, tmpC);
setInst(blobs, bi++, G.x, 0.04, G.z, 0, 1.4, 1, 1.4);
if (G.active && G.st !== 'stun' && slot < CONE_MAX) {
suspCol(G.susp, G.st === 'alert');
coneSlot(slot++, G.x, G.z, G.yaw, G_HALF, G_RANGE * (R.alarm ? 1.12 : 1), tmpC.r, tmpC.g, tmpC.b);
}
}
for (let k = 0; k < 4; k++) gMesh[k].instanceMatrix.needsUpdate = true;
if (gMesh[3].instanceColor) gMesh[3].instanceColor.needsUpdate = true;
for (let i = 0; i < cams.length; i++) {
const c = cams[i];
setInst(camMesh[0], i, c.x, 2.15, c.z, c.yaw, 1, 1, 1);
setInst(camMesh[1], i, c.x, 2.15, c.z, c.yaw, 1, 1, 1);
const off = c.blind > 0 || R.loopT > 0;
if (c.blind > 0) tmpC.setRGB(0.2, 0.2, 0.3 + 0.3 * Math.random());
else if (R.loopT > 0) tmpC.setRGB(0.2, 0.45, 1);
else if (R.alarm) tmpC.setRGB(1, 0.15, 0.15);
else suspCol(c.susp, false);
camMesh[1].setColorAt(i, tmpC);
if (!off && slot < CONE_MAX) {
if (R.alarm) tmpC.setRGB(0.6, 0.1, 0.08); else suspCol(c.susp, false);
coneSlot(slot++, c.x, c.z, c.yaw, C_HALF, C_RANGE, tmpC.r * 0.9, tmpC.g * 0.9, tmpC.b * 0.9);
}
}
camMesh[0].instanceMatrix.needsUpdate = true; camMesh[1].instanceMatrix.needsUpdate = true;
if (camMesh[1].instanceColor) camMesh[1].instanceColor.needsUpdate = true;
const showCones = mode === 'playing' || mode === 'brief';
coneGeo.setDrawRange(0, showCones ? slot * (CONE_R - 1) * 3 : 0);
coneGeo.getAttribute('position').needsUpdate = true; coneGeo.getAttribute('color').needsUpdate = true;
drone.visible = DR.on;
if (DR.on) {
drone.position.set(DR.x, DR.y + Math.sin(animT * 6) * 0.05, DR.z); drone.rotation.y = DR.yaw; dRot.rotation.z = animT * 20;
setInst(blobs, bi++, DR.x, 0.04, DR.z, 0, 0.8, 1, 0.8);
}
for (let i = bi; i < MAXG + 2; i++) hideInst(blobs, i);
blobs.instanceMatrix.needsUpdate = true;
if (LM.doors) {
for (let i = 0; i < L.doors.length; i++) {
const d = L.doors[i], sl = d.open * CS * 0.92;
if (d.axis === 0) { setInst(LM.doors, i, d.x + sl, 0, d.z, 0, CS, 2.2, 0.26); setInst(LM.doorLights, i, d.x + sl, 2.25, d.z, 0, CS * 0.7, 0.1, 0.3); }
else { setInst(LM.doors, i, d.x, 0, d.z + sl, 0, 0.26, 2.2, CS); setInst(LM.doorLights, i, d.x, 2.25, d.z + sl, 0, 0.3, 0.1, CS * 0.7); }
tmpC.set(LOCK_COL[d.lock] || LOCK_COL[0]);
if (d.forced) tmpC.set(0x9a7a55);
LM.doorLights.setColorAt(i, tmpC);
tmpC.multiplyScalar(d.lock === 0 && !d.forced ? 1 : 0.8);
LM.doors.setColorAt(i, tmpC);
}
LM.doors.position.y = 1.1;
LM.doors.instanceMatrix.needsUpdate = true; LM.doorLights.instanceMatrix.needsUpdate = true;
if (LM.doors.instanceColor) LM.doors.instanceColor.needsUpdate = true;
if (LM.doorLights.instanceColor) LM.doorLights.instanceColor.needsUpdate = true;
}
if (LM.vPivot) {
VT.open += ((R.vaultDone ? 1 : 0) - VT.open) * Math.min(1, dt * 2);
LM.vPivot.rotation.y = LM.vyaw + VT.open * 1.7;
LM.vWheel.rotation.z = VT.dial * TAU / 100;
if (R.vaultDone) LM.vRing.material.color.setRGB(0.3, 0.9, 0.6);
else if (ui === 'vault') { const f = 0.5 + VT.amp * 0.5; LM.vRing.material.color.setRGB(f, f * 0.8, 0.2); }
else LM.vRing.material.color.setRGB(1, 0.79, 0.24);
}
for (let i = 0; i < L.panels.length; i++) {
const p = L.panels[i];
if (p.used) tmpC.setRGB(0.25, 0.6, 1); else if (R.alarm) tmpC.setRGB(Math.sin(animT * 10) > 0 ? 1 : 0.3, 0.1, 0.1); else tmpC.setRGB(0.3, 1, 0.6);
LM.panelScr.setColorAt(i, tmpC);
}
if (LM.panelScr && LM.panelScr.instanceColor) LM.panelScr.instanceColor.needsUpdate = true;
for (let i = 0; i < L.lasers.length; i++) {
const o = L.lasers[i];
const vis = o.on || (o.warn && Math.sin(animT * 40) > 0);
for (let k = 0; k < 3; k++) {
const idx = i * 3 + k;
if (!vis) { hideInst(LM.beams, idx); continue; }
const y = 0.35 + k * 0.55;
if (o.alongZ) setInst(LM.beams, idx, o.x, y, o.z, 0, 0.05, 0.05, CS); else setInst(LM.beams, idx, o.x, y, o.z, 0, CS, 0.05, 0.05);
const f = o.on ? 0.85 + 0.15 * Math.sin(animT * 50 + idx) : 0.3;
tmpC.setRGB(f, 0.12 * f, 0.15 * f);
LM.beams.setColorAt(idx, tmpC);
}
}
if (LM.beams) { LM.beams.instanceMatrix.needsUpdate = true; if (LM.beams.instanceColor) LM.beams.instanceColor.needsUpdate = true; }
for (let i = 0; i < L.plates.length; i++) { if (L.plates[i].off > 0) tmpC.setRGB(0.25, 0.25, 0.3); else tmpC.setRGB(0.55, 0.42, 0.12); LM.plates.setColorAt(i, tmpC); }
if (LM.plates && LM.plates.instanceColor) LM.plates.instanceColor.needsUpdate = true;
for (let i = 0; i < L.sensors.length; i++) {
const o = L.sensors[i], f = o.off > 0 ? 0.08 : o.cool > 0 ? 0.6 : 0.18 + 0.1 * Math.sin(animT * 3 + i);
tmpC.setRGB(f, o.cool > 0 ? f * 0.3 : f * 0.75, o.cool > 0 ? f * 0.2 : f * 0.3);
LM.sensRing.setColorAt(i, tmpC);
}
if (LM.sensRing && LM.sensRing.instanceColor) LM.sensRing.instanceColor.needsUpdate = true;
for (let i = 0; i < L.exits.length; i++) {
const f = R.vaultDone ? 0.45 + 0.25 * Math.sin(animT * 4) : 0.12;
if (R.vaultDone) tmpC.setRGB(0.1 * f, f, 0.5 * f); else tmpC.setRGB(f, 0.6 * f, 0.2 * f);
LM.exits.setColorAt(i, tmpC);
}
if (LM.exits && LM.exits.instanceColor) LM.exits.instanceColor.needsUpdate = true;
for (let i = 0; i < L.checks.length; i++) { if (L.checks[i].got) tmpC.setRGB(0.3, 0.95, 0.6); else tmpC.setRGB(0.9, 0.75, 0.25); LM.checks.setColorAt(i, tmpC); }
if (LM.checks && LM.checks.instanceColor) LM.checks.instanceColor.needsUpdate = true;
for (let i = 0; i < L.items.length; i++) {
const it = L.items[i], m = it.kind === '$' ? LM.vals : LM.cards;
if (it.got) { hideInst(m, it.slot); continue; }
const y = 0.75 + Math.sin(animT * 2.5 + i) * 0.1;
if (it.kind === '$') setInst(m, it.slot, it.x, y, it.z, animT * 1.6 + i, 1, 1.3, 1);
else setInst(m, it.slot, it.x, y, it.z, animT * 1.6 + i, 0.5, 0.05, 0.32);
}
if (LM.vals) { LM.vals.instanceMatrix.needsUpdate = true; LM.cards.instanceMatrix.needsUpdate = true; }
for (let i = 0; i < SMK.length; i++) {
const s = SMK[i];
for (let k = 0; k < 7; k++) {
const idx = i * 7 + k;
if (!s.on || s.r < 0.05) { hideInst(smokeMesh, idx); continue; }
const a = k * 0.9 + s.t * 0.3, rr = k === 0 ? 0 : s.r * 0.55;
setInst(smokeMesh, idx, s.x + Math.cos(a) * rr, 0.6 + (k % 3) * 0.35, s.z + Math.sin(a) * rr, a, s.r * 0.55, s.r * 0.45, s.r * 0.55);
}
}
smokeMesh.instanceMatrix.needsUpdate = true;
for (let i = 0; i < LUR.length; i++) {
const s = LUR[i], m = lureMeshes[i];
m.visible = s.on;
if (s.on) { const t = Math.min(1, s.fly); m.position.set(s.x, 0.2 + Math.sin(t * Math.PI) * 1.4, s.z); m.scale.setScalar(s.fly >= 1 && Math.sin(animT * 14) > 0 ? 0.3 : 0.22); }
}
empMesh.visible = EMP.on;
if (EMP.on) empMesh.position.set(EMP.x, 1.2, EMP.z);
let aim = false;
if (mode === 'playing' && !ui && !DR.on && P.hidden < 0 && R.endT < 0 && R.ch[R.sel] > 0) {
if (R.sel === 1) { lureLanding(); aimRing.position.set(LL.x, 0.06, LL.z); aimRing.scale.set(0.7, 1, 0.7); aimMat.color.setRGB(1, 0.7, 0.28); aim = true; }
else if (R.sel === 0) {
findEmpTarget();
if (ET.kind) { aimRing.position.set(ET.x, ET.kind === 'c' ? 0.06 : 0.06, ET.z); aimRing.scale.set(0.9, 1, 0.9); aimMat.color.setRGB(0.37, 0.9, 1); aim = true; }
}
}
aimRing.visible = aim;
if (aim) aimRing.rotation.y = animT;
for (let i = 0; i < noiseFx.length; i++) {
const n = noiseFx[i];
if (!n.on) { hideInst(noiseMesh, i); continue; }
const r = n.r * easeOut(n.t), f = (1 - n.t) * 0.6;
setInst(noiseMesh, i, n.x, 0.08, n.z, 0, r, 1, r);
if (n.col === 1) tmpC.setRGB(f, f, f); else if (n.col === 2) tmpC.setRGB(f, f * 0.6, f * 0.15); else tmpC.setRGB(f * 0.3, f * 0.8, f);
noiseMesh.setColorAt(i, tmpC);
}
noiseMesh.instanceMatrix.needsUpdate = true;
if (noiseMesh.instanceColor) noiseMesh.instanceColor.needsUpdate = true;
partGeo.getAttribute('position').needsUpdate = true; partGeo.getAttribute('color').needsUpdate = true;
updateCutaway(dt, snapCamera);
snapCamera = false;
}

const lp = { x: 0, y: 0 }, PJ = { x: 0, y: 0, ok: false };
function anchor(ax, ay) {
const s = view.s, d = view.dpr;
ctx.setTransform(d * s, 0, 0, d * s, (view.w - LW * s) * ax * d, (view.h - LH * s) * ay * d);
}
function toLogical(cx, cy, ax, ay) {
const s = view.s;
lp.x = (cx - (view.w - LW * s) * ax) / s; lp.y = (cy - (view.h - LH * s) * ay) / s;
return lp;
}
function project(x, y, z) {
tmpV.set(x, y, z).project(camera);
PJ.ok = tmpV.z < 1 && tmpV.z > -1;
PJ.x = (tmpV.x * 0.5 + 0.5) * view.w; PJ.y = (-tmpV.y * 0.5 + 0.5) * view.h;
return PJ;
}
function blinkOn() { return animT % 1.1 < 0.75; }
function overReady() { return performance.now() - overAt >= 600; }
function disc(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
const HITS = [];
for (let k = 0; k < 48; k++) HITS.push({ x: 0, y: 0, w: 0, h: 0, id: '', n: 0, ax: 0, ay: 0 });
let hitN = 0, curAX = 0, curAY = 0;
function anchorH(ax, ay) { curAX = ax; curAY = ay; anchor(ax, ay); }
function addHit(x, y, w, h, id, n) { if (hitN >= HITS.length) return; const r = HITS[hitN++]; r.x = x; r.y = y; r.w = w; r.h = h; r.id = id; r.n = n || 0; r.ax = curAX; r.ay = curAY; }
function hitAt(cx, cy) {
for (let k = hitN - 1; k >= 0; k--) {
const r = HITS[k], p = toLogical(cx, cy, r.ax, r.ay);
if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return r;
}
return null;
}
function button(x, y, w, h, label, id, n, hot, col) {
roundRectPath(ctx, x, y, w, h, 10);
ctx.fillStyle = hot ? 'rgba(255, 201, 60, 0.18)' : 'rgba(255, 255, 255, 0.06)'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = hot ? UI.hi : 'rgba(255, 255, 255, 0.16)'; ctx.stroke();
txt(ctx, label, x + w / 2, y + h / 2 + 1, Math.min(16, h * 0.42), FONT_B, col || (hot ? UI.hi : UI.head), 'center', w - 12, '700');
addHit(x, y, w, h, id, n);
}
function pill(x, y, text, size, col, bg, maxW) {
ctx.font = font(size, FONT_B, '700');
const w = Math.min(maxW || 900, ctx.measureText(text).width + 28), h = size + 16;
roundRectPath(ctx, x - w / 2, y - h / 2, w, h, h / 2);
ctx.fillStyle = bg || 'rgba(10, 14, 26, 0.78)'; ctx.fill();
ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'; ctx.stroke();
txt(ctx, text, x, y + 1, size, FONT_B, col || UI.head, 'center', w - 20, '700');
}

function markerAt(px, py, s, amt, sym, col) {
disc(px, py, 13 * s); ctx.fillStyle = 'rgba(10, 14, 26, 0.85)'; ctx.fill();
ctx.lineWidth = 3 * s; ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
disc(px, py, 13 * s); ctx.stroke();
ctx.strokeStyle = col;
ctx.beginPath(); ctx.arc(px, py, 13 * s, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(amt, 0, 1)); ctx.stroke();
txt(ctx, sym, px, py + 1, Math.round(16 * s), FONT_B, col, 'center', 0, '900');
}
function drawWorldMarks() {
const s = Math.max(0.7, view.s), d = view.dpr;
ctx.setTransform(d, 0, 0, d, 0, 0);
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active) continue;
let sym = '', col = UI.hi, amt = G.susp;
if (G.st === 'stun') { sym = 'z'; col = UI.violet; amt = G.stun / empDur(); }
else if (G.st === 'alert') { sym = '!'; col = UI.danger; amt = R.alarm ? 1 : G.radio / 2.4; }
else if (G.susp > 0.03 || G.st === 'inv' || G.st === 'search' || G.heard > 0) { sym = '?'; col = G.susp > 0.6 ? '#FF9A3C' : UI.hi; amt = Math.max(G.susp, 0.08); }
if (!sym) continue;
const p = project(G.x, 2.35, G.z);
if (p.ok && p.x > 0 && p.x < view.w && p.y > 0 && p.y < view.h) {
markerAt(p.x, p.y, s, amt, sym, col);
if (G.st === 'alert' && !R.alarm && G.see) txt(ctx, 'RADIOING', p.x, p.y - 22 * s, Math.round(10 * s), FONT_M, UI.danger, 'center', 0, '700');
} else if (sym === '!' || G.susp > 0.25) {
const cx = view.w / 2, cy = view.h / 2;
let ax = p.x - cx, ay = p.y - cy;
if (!p.ok) { ax = -ax; ay = -ay; }
const l = Math.sqrt(ax * ax + ay * ay) || 1, k = Math.min((view.w / 2 - 30) / Math.abs(ax / l || 1e-3), (view.h / 2 - 30) / Math.abs(ay / l || 1e-3));
const ex = cx + ax / l * k, ey = cy + ay / l * k, ang = Math.atan2(ay, ax);
ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
ctx.beginPath(); ctx.moveTo(14 * s, 0); ctx.lineTo(-8 * s, -9 * s); ctx.lineTo(-8 * s, 9 * s); ctx.closePath();
ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
}
for (let i = 0; i < cams.length; i++) {
const c = cams[i];
if (c.blind > 0 || R.loopT > 0 || c.susp < 0.03) continue;
const p = project(c.x, 2.9, c.z);
if (p.ok) markerAt(p.x, p.y, s * 0.85, c.susp, '\u25C9', c.susp > 0.6 ? UI.danger : UI.hi);
}
if (mode !== 'playing' || R.endT >= 0) return;
if (CH.on) {
const p = project(P.x, 2.0, P.z);
if (p.ok) {
disc(p.x, p.y, 18 * s); ctx.fillStyle = 'rgba(10, 14, 26, 0.8)'; ctx.fill();
ctx.lineWidth = 4 * s; ctx.strokeStyle = CH.kind === 'hack' ? UI.cyan : UI.hi;
ctx.beginPath(); ctx.arc(p.x, p.y, 18 * s, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(CH.t / CH.dur, 0, 1)); ctx.stroke();
pill(p.x, p.y - 34 * s, CH.kind === 'hack' ? 'Hacking... keep still' : 'Forcing the door... keep still', Math.round(12 * s), UI.head);
}
} else if (FOC.kind && !ui) {
const p = project(P.x, 2.1, P.z);
if (p.ok) pill(p.x, p.y - 12 * s, (FOC.kind === 'needcard' ? '' : (touchUI ? 'USE: ' : 'E: ')) + FOC.label, Math.round(13 * s), FOC.kind === 'needcard' ? UI.danger : UI.hi);
}
}

function gadgetIcon(i, x, y, r, col) {
ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5;
if (i === 0) { ctx.beginPath(); ctx.moveTo(x - r * 0.2, y - r); ctx.lineTo(x - r * 0.6, y + r * 0.1); ctx.lineTo(x, y + r * 0.1); ctx.lineTo(x - r * 0.3, y + r); ctx.lineTo(x + r * 0.6, y - r * 0.2); ctx.lineTo(x + r * 0.05, y - r * 0.2); ctx.lineTo(x + r * 0.3, y - r); ctx.closePath(); ctx.fill(); }
else if (i === 1) { disc(x, y + r * 0.2, r * 0.55); ctx.fill(); ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 0.95, -2.4, -0.7); ctx.stroke(); }
else if (i === 2) { disc(x - r * 0.35, y + r * 0.2, r * 0.45); ctx.fill(); disc(x + r * 0.3, y + r * 0.1, r * 0.55); ctx.fill(); disc(x, y - r * 0.35, r * 0.45); ctx.fill(); }
else { ctx.fillRect(x - r * 0.35, y - r * 0.12, r * 0.7, r * 0.24); disc(x - r * 0.7, y - r * 0.3, r * 0.3); ctx.stroke(); disc(x + r * 0.7, y - r * 0.3, r * 0.3); ctx.stroke(); disc(x - r * 0.7, y + r * 0.4, r * 0.3); ctx.stroke(); disc(x + r * 0.7, y + r * 0.4, r * 0.3); ctx.stroke(); }
}
function drawPlayHud() {
const def = L.def;
if (R.maxSusp > 0.08 || R.alarm || R.flash > 0) {
ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
const a = clamp(Math.max(R.maxSusp * 0.45, R.alarm ? 0.28 + 0.12 * Math.sin(animT * 6) : 0, R.flash * 0.5), 0, 0.6);
const red = R.alarm || R.maxSusp >= 1;
const g = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.35, view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.75);
g.addColorStop(0, 'rgba(0, 0, 0, 0)'); g.addColorStop(1, red ? 'rgba(255, 50, 50, ' + a.toFixed(3) + ')' : 'rgba(255, 190, 60, ' + a.toFixed(3) + ')');
ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
}
anchorH(0, 0);
roundRectPath(ctx, 14, 12, 236, 76, 14); ctx.fillStyle = 'rgba(10, 14, 26, 0.78)'; ctx.fill();
txt(ctx, 'LOOT', 28, 28, 11, FONT_M, UI.dim, 'left', 0, '700');
txt(ctx, fmtCash(R.loot), 28, 50, 24, FONT_M, UI.hi, 'left', 150, '700');
const pct = L.lootMax > 0 ? R.loot / L.lootMax : 0;
roundRectPath(ctx, 28, 70, 140, 6, 3); ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
if (pct > 0) { roundRectPath(ctx, 28, 70, 140 * clamp(pct, 0, 1), 6, 3); ctx.fillStyle = UI.hi; ctx.fill(); }
txt(ctx, Math.round(pct * 100) + '%', 176, 73, 11, FONT_M, UI.body, 'left', 0, '700');
txt(ctx, fmtTime(R.time), 236, 28, 13, FONT_M, R.time > def.par ? UI.dim : UI.body, 'right', 0, '700');
txt(ctx, def.name, 236, 50, 12, FONT_B, UI.dim, 'right', 88, '700');
anchorH(0.5, 0);
pill(480, 26, objective(), 15, R.alarm ? UI.danger : UI.head, R.alarm ? 'rgba(60, 10, 14, 0.82)' : null, 420);
let ty = 62;
if (DR.on) { pill(480, ty, 'DRONE ' + Math.max(0, DR.t).toFixed(1) + ' s  -  ' + (touchUI ? 'GADGET' : 'F / E') + ': call back', 13, UI.violet); ty += 32; }
for (let i = 0; i < toasts.length; i++) {
const t = toasts[i];
ctx.globalAlpha = clamp(t.t / 0.4, 0, 1);
pill(480, ty + i * 30, t.text, 13, t.col);
ctx.globalAlpha = 1;
}
anchorH(1, 0);
const ry = touchUI ? 64 : 12;
if (R.alarm) {
roundRectPath(ctx, 726, ry, 220, 70, 14); ctx.fillStyle = 'rgba(70, 8, 14, 0.85)'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = blinkOn() ? UI.danger : 'rgba(255, 93, 93, 0.3)'; ctx.stroke();
txt(ctx, 'LOCKDOWN', 742, ry + 18, 13, FONT_D, UI.danger, 'left', 0);
txt(ctx, fmtTime(R.lockT + 0.99), 930, ry + 20, 24, FONT_M, UI.head, 'right', 0, '700');
txt(ctx, 'Doors sealed ' + R.sealI + ' / ' + R.sealOrder.length, 742, ry + 50, 12, FONT_B, UI.body, 'left', 190, '700');
} else {
roundRectPath(ctx, 776, ry, 170, 44, 14); ctx.fillStyle = 'rgba(10, 14, 26, 0.78)'; ctx.fill();
const col = R.spotted ? '#FF9A3C' : UI.ok;
ctx.beginPath(); ctx.ellipse(800, ry + 22, 12, 7, 0, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
disc(800, ry + 22, 3.5); ctx.fillStyle = col; ctx.fill();
txt(ctx, R.spotted ? 'SPOTTED' : 'GHOST', 820, ry + 23, 14, FONT_M, col, 'left', 0, '700');
if (R.loopT > 0) txt(ctx, 'cams looped ' + Math.ceil(R.loopT) + 's', 940, ry + 58, 11, FONT_M, UI.cyan, 'right', 0, '700');
}
if (touchUI) {
tButton(924, 34, 22, 'II', 'pause');
tButton(870, 34, 22, 'MAP', 'plan');
tButton(816, 34, 22, '\u21BA', 'rotL');
tButton(762, 34, 22, '\u21BB', 'rotR');
}
anchorH(0, 1);
roundRectPath(ctx, 14, 532, 196, 56, 14); ctx.fillStyle = 'rgba(10, 14, 26, 0.78)'; ctx.fill();
const stance = P.hidden >= 0 ? 'HIDDEN' : P.inVent ? 'IN VENT' : P.crouch ? 'SNEAK' : P.sprint && P.moving ? 'SPRINT' : 'WALK';
txt(ctx, stance, 28, 550, 14, FONT_M, P.hidden >= 0 || P.inVent ? UI.ok : P.sprint && P.moving ? UI.danger : P.crouch ? UI.cyan : UI.head, 'left', 0, '700');
const vis = P.hidden >= 0 || P.inVent ? 0 : clamp(playerLightF() * stanceF(), 0, 1.15) / 1.15;
for (let i = 0; i < 6; i++) {
roundRectPath(ctx, 28 + i * 22, 566, 18, 8, 3);
ctx.fillStyle = i < Math.round(vis * 6) ? (vis > 0.7 ? '#FF9A3C' : vis > 0.4 ? UI.hi : UI.ok) : 'rgba(255, 255, 255, 0.1)'; ctx.fill();
}
txt(ctx, 'seen', 196, 570, 10, FONT_M, UI.dim, 'right', 0);
const lightNow = L.light[Math.max(0, cellOf(P.x, P.z))];
if (P.hidden < 0 && !P.inVent && lightNow < 0.2) txt(ctx, 'in shadow', 196, 550, 11, FONT_B, UI.ok, 'right', 0, '700');
anchorH(0.5, 1);
if (!ui) {
const bx = 480 - 2 * 92 + 4;
for (let i = 0; i < 4; i++) {
const x = bx + i * 92, y = 528, sel = R.sel === i, g = GADGETS[i], n = R.ch[i];
roundRectPath(ctx, x, y, 84, 60, 12);
ctx.fillStyle = sel ? 'rgba(255, 201, 60, 0.16)' : 'rgba(10, 14, 26, 0.78)'; ctx.fill();
ctx.lineWidth = sel ? 2.5 : 1.5; ctx.strokeStyle = sel ? UI.hi : 'rgba(255, 255, 255, 0.12)'; ctx.stroke();
gadgetIcon(i, x + 22, y + 24, 9, n > 0 ? g.col : 'rgba(255, 255, 255, 0.25)');
txt(ctx, String(i + 1), x + 74, y + 12, 11, FONT_M, sel ? UI.hi : UI.dim, 'right', 0, '700');
txt(ctx, g.name, x + 42, y + 46, 12, FONT_B, n > 0 ? UI.head : UI.dim, 'center', 76, '800');
txt(ctx, 'x' + n, x + 58, y + 26, 15, FONT_M, n > 0 ? UI.head : UI.danger, 'center', 0, '700');
addHit(x, y, 84, 60, 'gad', i);
}
if (!touchUI) txt(ctx, 'F: use ' + GADGETS[R.sel].name, 480, 516, 12, FONT_B, UI.dim, 'center', 0, '700');
}
if (HINT.t > 0 && HINT.text) {
ctx.globalAlpha = clamp(HINT.t / 0.5, 0, 1);
const hw = touchUI && !ui ? 540 : 640;
const lines = wrapLines(ctx, HINT.text, hw - 40, 15, FONT_B, '600'), h = lines.length * 20 + 18, y0 = (ui ? 300 : 500) - h;
roundRectPath(ctx, 480 - hw / 2, y0, hw, h, 14); ctx.fillStyle = 'rgba(16, 22, 38, 0.9)'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 201, 60, 0.45)'; ctx.stroke();
for (let i = 0; i < lines.length; i++) txt(ctx, lines[i], 480, y0 + 19 + i * 20, 15, FONT_B, UI.head, 'center', hw - 20, '600');
ctx.globalAlpha = 1;
}
if (ui === 'vault') drawVaultUI();
else if (ui === 'pick') drawPickUI();
if (touchUI && !ui) drawTouchControls();
if (ui === 'plan') drawPlanOverlay();
if (R.endT >= 0) {
ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
const f = clamp(R.endT / (R.endKind === 'escape' ? 1.0 : 1.5), 0, 1);
ctx.fillStyle = R.endKind === 'escape' ? 'rgba(6, 10, 18, ' + f.toFixed(3) + ')' : 'rgba(20, 4, 8, ' + f.toFixed(3) + ')';
ctx.fillRect(0, 0, view.w, view.h);
anchorH(0.5, 0.5);
if (R.endKind === 'caught') txt(ctx, 'GRABBED', 480, 300, 44, FONT_D, 'rgba(255, 93, 93, ' + f.toFixed(3) + ')', 'center', 0);
else if (R.endKind === 'locked') txt(ctx, 'LOCKED IN', 480, 300, 44, FONT_D, 'rgba(255, 93, 93, ' + f.toFixed(3) + ')', 'center', 0);
else txt(ctx, 'GETAWAY', 480, 300, 44, FONT_D, 'rgba(75, 227, 160, ' + f.toFixed(3) + ')', 'center', 0);
}
}
function tButton(x, y, r, label, id, hot) {
disc(x, y, r); ctx.fillStyle = hot ? 'rgba(255, 201, 60, 0.3)' : 'rgba(16, 22, 38, 0.72)'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = hot ? UI.hi : 'rgba(255, 255, 255, 0.22)'; disc(x, y, r); ctx.stroke();
txt(ctx, label, x, y + 1, Math.round(r * 0.55), FONT_B, hot ? UI.hi : UI.head, 'center', r * 1.8, '800');
addHit(x - r, y - r, r * 2, r * 2, id, 0);
}
const STICK = { x: 112, y: 440, r: 62 };
function drawTouchControls() {
anchorH(0, 1);
const sx = stick.on ? stick.ox : STICK.x, sy = stick.on ? stick.oy : STICK.y;
disc(sx, sy, STICK.r); ctx.fillStyle = 'rgba(16, 22, 38, 0.45)'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; disc(sx, sy, STICK.r); ctx.stroke();
disc(sx + stick.vx * STICK.r * 0.7, sy - stick.vy * STICK.r * 0.7, 26); ctx.fillStyle = stick.on ? 'rgba(255, 201, 60, 0.5)' : 'rgba(255, 255, 255, 0.2)'; ctx.fill();
if (!stick.on) txt(ctx, 'drag to move', STICK.x, STICK.y + STICK.r + 14, 11, FONT_B, UI.dim, 'center', 0, '600');
anchorH(1, 1);
tButton(880, 470, 44, 'USE', 'use', !!FOC.kind);
tButton(790, 500, 36, 'GADGET', 'gadget');
tButton(880, 380, 32, P.crouch ? 'STAND' : 'SNEAK', 'sneak', P.crouch);
}

function drawVaultUI() {
anchorH(0.5, 1);
panel(ctx, 250, 330, 460, 256);
txt(ctx, 'VAULT DIAL', 276, 354, 15, FONT_D, UI.hi, 'left', 0);
txt(ctx, 'Tumbler ' + Math.min(VT.i + 1, VT.tum.length) + ' / ' + VT.tum.length, 690, 354, 13, FONT_M, UI.body, 'right', 0, '700');
const cx = 360, cy = 460, r = 74;
disc(cx, cy, r + 8); ctx.fillStyle = '#1b2236'; ctx.fill();
disc(cx, cy, r); ctx.fillStyle = VT.inZone ? 'rgba(255, 201, 60, 0.22)' : '#252e46'; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.stroke();
for (let i = 0; i < 50; i++) {
const a = (i / 50) * TAU - VT.dial / 100 * TAU - Math.PI / 2, l = i % 5 === 0 ? 12 : 6;
ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2)); ctx.lineTo(cx + Math.cos(a) * (r - 2 - l), cy + Math.sin(a) * (r - 2 - l));
ctx.strokeStyle = i % 5 === 0 ? UI.body : UI.dim; ctx.lineWidth = i % 5 === 0 ? 2 : 1; ctx.stroke();
}
ctx.beginPath(); ctx.moveTo(cx, cy - r - 12); ctx.lineTo(cx - 8, cy - r - 24); ctx.lineTo(cx + 8, cy - r - 24); ctx.closePath(); ctx.fillStyle = UI.hi; ctx.fill();
txt(ctx, String(Math.floor(VT.dial)).padStart(2, '0'), cx, cy, 28, FONT_M, UI.head, 'center', 0, '700');
for (let i = 0; i < VT.tum.length; i++) { disc(cx - (VT.tum.length - 1) * 9 + i * 18, cy + 34, 5); ctx.fillStyle = i < VT.i ? UI.ok : 'rgba(255, 255, 255, 0.18)'; ctx.fill(); }
const mx = 456, my = 390, mw = 232, mh = 90;
roundRectPath(ctx, mx, my, mw, mh, 10); ctx.fillStyle = 'rgba(5, 10, 18, 0.9)'; ctx.fill();
ctx.strokeStyle = 'rgba(75, 227, 160, 0.15)'; ctx.lineWidth = 1;
for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(mx, my + i * mh / 4); ctx.lineTo(mx + mw, my + i * mh / 4); ctx.stroke(); }
ctx.beginPath();
for (let i = 0; i <= 60; i++) {
const u = i / 60, ph = (VT.beat - u * 2.2) % 1, b = ph < 0 ? ph + 1 : ph;
let y = 0;
if (b < 0.12) y = Math.sin(b / 0.12 * Math.PI) * VT.amp; else if (b < 0.2) y = -Math.sin((b - 0.12) / 0.08 * Math.PI) * VT.amp * 0.4;
const px = mx + mw - u * mw, py = my + mh / 2 - y * (mh * 0.42) - Math.sin(u * 40 + animT * 9) * 1.2;
if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
}
ctx.strokeStyle = VT.inZone ? UI.hi : UI.ok; ctx.lineWidth = 2; ctx.stroke();
txt(ctx, 'PULSE', mx + 10, my + 12, 10, FONT_M, UI.dim, 'left', 0, '700');
if (VT.flash > 0) txt(ctx, VT.ok ? 'CLICK!' : 'SLIP!', mx + mw / 2, my + mh + 16, 16, FONT_D, VT.ok ? UI.ok : UI.danger, 'center', 0);
else txt(ctx, 'Peak = close. Glow = in the zone.', mx + mw / 2, my + mh + 16, 12, FONT_B, UI.dim, 'center', mw, '600');
const k = touchUI ? 'Hold \u25C0 \u25B6 to turn, SET to lock it' : 'A / D turn   E / Space / F set   S leave';
txt(ctx, k, 480, 572, 13, FONT_B, UI.body, 'center', 420, '700');
button(456, 518, 54, 34, '\u25C0', 'dl', 0, VT.btn < 0);
button(516, 518, 54, 34, '\u25B6', 'dr', 0, VT.btn > 0);
button(576, 518, 62, 34, 'SET', 'dset', 0, VT.inZone);
button(644, 518, 48, 34, 'X', 'leave', 0, false);
}
function drawPickUI() {
anchorH(0.5, 1);
panel(ctx, 270, 380, 420, 196);
const d = L.doors[PK.door];
txt(ctx, 'LOCK PICK', 296, 404, 15, FONT_D, UI.hi, 'left', 0);
txt(ctx, 'Pin ' + Math.min((d ? d.pins : 0) + 1, pinsNeeded()) + ' / ' + pinsNeeded(), 664, 404, 13, FONT_M, UI.body, 'right', 0, '700');
const bx = 300, by = 440, bw = 360, bh = 34;
roundRectPath(ctx, bx, by, bw, bh, 8); ctx.fillStyle = '#141b2c'; ctx.fill();
roundRectPath(ctx, bx + PK.z0 * bw, by, (PK.z1 - PK.z0) * bw, bh, 6); ctx.fillStyle = 'rgba(255, 201, 60, 0.55)'; ctx.fill();
const px = bx + PK.pos * bw;
ctx.fillStyle = PK.flash > 0 ? (PK.ok ? UI.ok : UI.danger) : UI.head;
ctx.fillRect(px - 2, by - 6, 4, bh + 12);
for (let i = 0; i < pinsNeeded(); i++) { disc(480 - (pinsNeeded() - 1) * 10 + i * 20, 494, 6); ctx.fillStyle = d && i < d.pins ? UI.ok : 'rgba(255, 255, 255, 0.18)'; ctx.fill(); }
txt(ctx, touchUI ? 'Tap SET when the pin is in the gold zone' : 'E / Space / F when the pin is in the gold zone   S leave', 480, 522, 13, FONT_B, UI.body, 'center', 400, '700');
button(390, 536, 110, 32, 'SET', 'pset', 0, PK.pos >= PK.z0 && PK.pos <= PK.z1);
button(510, 536, 70, 32, 'LEAVE', 'leave', 0, false);
}

function drawPlan(x0, y0, w, h, live) {
const cs = Math.max(4, Math.floor(Math.min(w / L.W, h / L.H))), ox = x0 + Math.floor((w - cs * L.W) / 2), oy = y0 + Math.floor((h - cs * L.H) / 2);
ctx.fillStyle = '#0a0f1c'; ctx.fillRect(ox - 4, oy - 4, cs * L.W + 8, cs * L.H + 8);
for (let z = 0; z < L.H; z++) for (let x = 0; x < L.W; x++) {
const ci = z * L.W + x, t = L.tile[ci], px = ox + x * cs, py = oy + z * cs;
let c = null;
if (t === T_WALL) c = '#4a5878'; else if (t === T_RACK) c = '#3a4660'; else if (t === T_GLASS) c = '#5d8fb8';
else if (t === T_VENT) c = '#1c2a3c'; else if (t === T_EXIT) c = R.vaultDone ? '#2f9e6c' : '#2a4a3c';
else if (t === T_LASER) c = '#5a1e26'; else if (t === T_PLATE) c = '#6b5420'; else if (t === T_PROP) c = '#2c3448';
else if (t === T_LOCKER) c = '#56627a'; else if (t === T_PANEL) c = '#3a8f6a'; else if (t === T_VAULT) c = '#FFC93C';
else if (t === T_DOOR) { const d = L.doors[L.doorAt[ci]]; c = d.lock === 1 ? '#3d7bff' : d.lock === 2 ? '#ffb340' : d.lock === 3 ? '#ff3b3b' : '#7b8aa8'; }
else c = L.shade[ci] ? '#101724' : '#1a2336';
ctx.fillStyle = c; ctx.fillRect(px, py, cs, cs);
if (t === T_VENT) { ctx.fillStyle = 'rgba(127, 184, 255, 0.35)'; ctx.fillRect(px, py + cs * 0.4, cs, cs * 0.2); }
}
for (let i = 0; i < L.sensors.length; i++) {
const o = L.sensors[i]; ctx.strokeStyle = 'rgba(255, 150, 60, 0.5)'; ctx.lineWidth = 1.5;
disc(ox + o.x / CS * cs, oy + o.z / CS * cs, SENSOR_R / CS * cs); ctx.stroke();
}
for (let i = 0; i < L.items.length; i++) {
const it = L.items[i];
if (it.got) continue;
disc(ox + it.x / CS * cs, oy + it.z / CS * cs, cs * 0.28); ctx.fillStyle = it.kind === '$' ? '#ffd25a' : '#5fb3ff'; ctx.fill();
}
for (let i = 0; i < L.checks.length; i++) { const c = L.checks[i]; ctx.strokeStyle = c.got ? UI.ok : UI.hi; ctx.lineWidth = 1.5; disc(ox + c.x / CS * cs, oy + c.z / CS * cs, cs * 0.3); ctx.stroke(); }
ctx.setLineDash([cs * 0.4, cs * 0.3]); ctx.lineWidth = Math.max(1.5, cs * 0.14); ctx.strokeStyle = 'rgba(255, 201, 60, 0.8)';
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.revealed || !G.rc) continue;
ctx.beginPath();
for (let k = 0; k < G.rc.length; k++) { const c = G.rc[k], px = ox + (c % L.W + 0.5) * cs, py = oy + (((c / L.W) | 0) + 0.5) * cs; if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
ctx.stroke();
}
ctx.setLineDash([]);
for (let i = 0; i < cams.length; i++) {
const c = cams[i];
if (!c.known) continue;
const px = ox + c.x / CS * cs, py = oy + c.z / CS * cs, rr = C_RANGE / CS * cs;
ctx.beginPath(); ctx.moveTo(px, py);
const a0 = Math.PI / 2 - c.base - c.sw - C_HALF, a1 = Math.PI / 2 - c.base + c.sw + C_HALF;
ctx.arc(px, py, rr, a0, a1); ctx.closePath();
ctx.fillStyle = 'rgba(255, 93, 93, 0.14)'; ctx.fill();
disc(px, py, cs * 0.3); ctx.fillStyle = c.blind > 0 || R.loopT > 0 ? '#5a6a8a' : UI.danger; ctx.fill();
}
if (live) {
for (let i = 0; i < guards.length; i++) {
const G = guards[i];
if (!G.active || (!G.revealed && !near(G.x, G.z, 10))) continue;
disc(ox + G.x / CS * cs, oy + G.z / CS * cs, cs * 0.34); ctx.fillStyle = G.st === 'alert' ? UI.danger : G.st === 'stun' ? UI.violet : '#9fe9ff'; ctx.fill();
}
const px = ox + P.x / CS * cs, py = oy + P.z / CS * cs;
disc(px, py, cs * 0.42 + Math.sin(animT * 6) * 1.5); ctx.fillStyle = UI.ok; ctx.fill();
if (DR.on) { disc(ox + DR.x / CS * cs, oy + DR.z / CS * cs, cs * 0.3); ctx.fillStyle = UI.violet; ctx.fill(); }
} else {
disc(ox + L.sx / CS * cs, oy + L.sz / CS * cs, cs * 0.42); ctx.fillStyle = UI.ok; ctx.fill();
}
return cs;
}
function drawPlanOverlay() {
ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
ctx.fillStyle = UI.scrim; ctx.fillRect(0, 0, view.w, view.h);
anchorH(0.5, 0.5);
panel(ctx, 40, 24, 880, 552);
txt(ctx, 'PLAN MAP', 70, 52, 20, FONT_D, UI.hi, 'left', 0);
txt(ctx, L.def.name + '  -  ' + SITES[L.site].name, 890, 52, 13, FONT_B, UI.body, 'right', 500, '700');
drawPlan(60, 76, 840, 430, true);
const lg = [['#4ae3a0', 'you'], ['#FFC93C', 'vault'], ['#ffd25a', 'loot'], ['#5fb3ff', 'keycard'], ['#ff5d5d', 'camera'], ['#3d7bff', 'key door'], ['#ffb340', 'pick door'], ['#5a1e26', 'laser'], ['#6b5420', 'plate'], ['#1c2a3c', 'vent']];
for (let i = 0; i < lg.length; i++) {
const x = 70 + i * 84;
ctx.fillStyle = lg[i][0]; ctx.fillRect(x, 520, 12, 12);
txt(ctx, lg[i][1], x + 17, 527, 11, FONT_B, UI.body, 'left', 64, '600');
}
txt(ctx, (touchUI ? 'Tap anywhere' : 'Tab') + ' to close  -  dashed lines are revealed patrol routes (scout with the DRONE, or watch a bot)', 480, 556, 12, FONT_B, UI.dim, 'center', 840, '600');
}

let selH = clamp(SV.last, 0, HEISTS.length - 1), selTab = 0, selUp = 0, msg = '', msgT = 0;
const INFO = HEISTS.map(function (d) {
const all = d.map.join('');
function has(ch) { return all.indexOf(ch) >= 0; }
return { lasers: has('='), plates: has('^'), sensors: has('m'), vents: has('v'), panels: has('A'), ck: has('c'), kdoor: has('K'), pdoor: has('P'), lockers: has('L'),
vals: all.split('$').length - 1 };
});
function say(t) { msg = t; msgT = 2.6; }
function scrim(a) { ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); ctx.fillStyle = a === undefined ? UI.scrim : 'rgba(8, 12, 22, ' + a + ')'; ctx.fillRect(0, 0, view.w, view.h); }
function promptLine(text, y) { txt(ctx, text, 480, y, 17, FONT_B, blinkOn() ? UI.hi : 'rgba(255, 201, 60, 0.35)', 'center', 820, '800'); }
function heistsDone() { let n = 0; for (let i = 0; i < HEISTS.length; i++) if (SV.h[i].done) n++; return n; }
function drawTitle() {
ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
const g = ctx.createLinearGradient(0, 0, 0, view.h);
g.addColorStop(0, 'rgba(5, 8, 16, 0.86)'); g.addColorStop(0.5, 'rgba(5, 8, 16, 0.55)'); g.addColorStop(1, 'rgba(5, 8, 16, 0.9)');
ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
anchorH(0.5, 0.5);
ctx.save(); ctx.shadowColor = 'rgba(255, 201, 60, 0.6)'; ctx.shadowBlur = 24;
txt(ctx, 'VAULT RUN', 480, 190, 78, FONT_D, UI.head, 'center', 800);
ctx.restore();
ctx.fillStyle = UI.hi; ctx.fillRect(330, 236, 300, 4);
txt(ctx, 'Twelve break-ins. Robot guards, cameras, lasers. One vault each.', 480, 276, 19, FONT_B, UI.body, 'center', 820, '600');
txt(ctx, 'Stay out of the cones, sneak through the dark, stun and fool the bots. Nobody gets hurt.', 480, 306, 15, FONT_B, UI.dim, 'center', 820, '600');
promptLine(api.isTouch || touchUI ? 'Tap to start' : 'Press Space to start', 372);
const b = api.best();
if (b !== null && b !== undefined && isFinite(b)) txt(ctx, 'Best: ' + fmtCash(b) + ' total loot', 480, 420, 15, FONT_M, UI.body, 'center', 0, '700');
txt(ctx, 'Cash ' + fmtCash(SV.cash) + '   -   Heists cracked ' + heistsDone() + ' / ' + HEISTS.length, 480, 448, 13, FONT_M, UI.dim, 'center', 0, '700');
txt(ctx, touchUI ? 'Drag the left side to move   SNEAK crouch   USE interact   GADGET   MAP plan   II pause' : 'W A S D move   C sneak   Shift sprint   E use   1-4 + F gadgets   Tab plan map   Esc pause', 480, 560, 12, FONT_B, UI.dim, 'center', 900, '600');
}
function openSelect(focus) {
mode = 'select'; paused = false; ui = null; selTab = 0;
if (focus >= 0) selH = clamp(focus, 0, HEISTS.length - 1);
else {
selH = clamp(SV.last, 0, HEISTS.length - 1);
for (let i = 0; i < HEISTS.length; i++) if (!SV.h[i].done && (i === 0 || SV.h[i - 1].done)) { selH = i; break; }
}
audioStop(); clearHeld();
api.tone(520, 0.04, { type: 'triangle', vol: 0.04 });
}
function firstUsefulUp() {
for (let i = 0; i < UPGRADES.length; i++) { const lv = SV.up[UPGRADES[i].id]; if (lv < 2 && UPGRADES[i].cost[lv] <= SV.cash) return i; }
for (let i = 0; i < UPGRADES.length; i++) if (SV.up[UPGRADES[i].id] < 2) return i;
return 0;
}
function heistState(i) {
if (!(i === 0 || SV.h[i - 1].done)) return 'locked';
if (!SV.site[HEISTS[i].site]) return 'buy';
return 'open';
}
function selectAction() {
if (selTab === 0) {
const st = heistState(selH), site = SITES[HEISTS[selH].site];
if (st === 'locked') { say('Crack "' + HEISTS[selH - 1].name + '" first'); api.tone(180, 0.08, { type: 'square', vol: 0.04 }); }
else if (st === 'buy') {
if (SV.cash >= site.price) { SV.cash -= site.price; SV.site[HEISTS[selH].site] = true; writeSave(); say('Access to ' + site.name + ' bought'); api.tone(784, 0.1, { type: 'triangle', vol: 0.06 }); }
else { say('Need ' + fmtCash(site.price - SV.cash) + ' more: replay heists to earn it'); api.tone(180, 0.08, { type: 'square', vol: 0.04 }); }
} else openBrief(selH);
} else {
const u = UPGRADES[selUp], lv = SV.up[u.id];
if (lv >= 2) { say('Already maxed'); return; }
if (SV.cash < u.cost[lv]) { say('Need ' + fmtCash(u.cost[lv] - SV.cash) + ' more'); api.tone(180, 0.08, { type: 'square', vol: 0.04 }); return; }
SV.cash -= u.cost[lv]; SV.up[u.id] = lv + 1; writeSave();
say(u.name + ' bought'); api.tone(660, 0.08, { type: 'triangle', vol: 0.06 }); api.tone(990, 0.1, { type: 'triangle', vol: 0.05, delay: 0.08 });
}
}
function openBrief(i) {
if (L.i !== i || !lvGroup) buildLevel(i);
R.ck = null;
resetRun(false);
mode = 'brief'; ui = null; paused = false; snapCamera = true; selH = i;
api.tone(600, 0.05, { type: 'triangle', vol: 0.05 });
}
function drawSelect() {
scrim(0.62);
anchorH(0.5, 0.5);
panel(ctx, 20, 16, 920, 568);
button(40, 30, 130, 36, 'HEISTS', 'tab', 0, selTab === 0);
button(180, 30, 130, 36, 'GEAR', 'tab', 1, selTab === 1);
txt(ctx, 'Cash ' + fmtCash(SV.cash), 916, 40, 17, FONT_M, UI.hi, 'right', 0, '700');
txt(ctx, 'Total loot ' + fmtCash(SV.career), 916, 62, 12, FONT_M, UI.dim, 'right', 0, '700');
if (selTab === 0) {
let y = 96;
for (let s = 0; s < SITES.length; s++) {
const site = SITES[s];
txt(ctx, site.name.toUpperCase() + (SV.site[s] ? '' : '   ' + fmtCash(site.price) + ' to unlock'), 44, y, 12, FONT_M, SV.site[s] ? hexCss(site.accent) : UI.dim, 'left', 380, '700');
y += 22;
for (let k = 0; k < 3; k++) {
const i = s * 3 + k;
if (i >= HEISTS.length) break;
const hot = selH === i, st = heistState(i), h = SV.h[i];
roundRectPath(ctx, 38, y - 13, 384, 26, 8);
ctx.fillStyle = hot ? 'rgba(255, 201, 60, 0.16)' : 'rgba(255, 255, 255, 0.04)'; ctx.fill();
if (hot) { ctx.lineWidth = 2; ctx.strokeStyle = UI.hi; ctx.stroke(); }
addHit(38, y - 13, 384, 26, 'heist', i);
txt(ctx, (i + 1) + '. ' + HEISTS[i].name, 52, y, 15, FONT_B, st === 'locked' ? UI.dim : UI.head, 'left', 250, '700');
let tag = st === 'locked' ? 'LOCKED' : st === 'buy' ? 'BUY SITE' : h.done ? 'GRADE ' + h.grade : 'NEW';
if (h.done && h.ghost) tag += '  GHOST';
txt(ctx, tag, 410, y, 11, FONT_M, h.done ? UI.ok : st === 'open' ? UI.hi : UI.dim, 'right', 140, '700');
y += 28;
}
}
const d = HEISTS[selH], inf = INFO[selH], h = SV.h[selH], st = heistState(selH), site = SITES[d.site];
roundRectPath(ctx, 440, 84, 480, 486, 14); ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();
txt(ctx, site.name + '  -  ' + site.sub, 460, 106, 12, FONT_M, hexCss(site.accent), 'left', 440, '700');
txt(ctx, d.name, 460, 136, 26, FONT_D, UI.head, 'left', 440);
const lines = wrapLines(ctx, d.brief, 440, 15, FONT_B, '600');
for (let i = 0; i < lines.length && i < 4; i++) txt(ctx, lines[i], 460, 172 + i * 21, 15, FONT_B, UI.body, 'left', 445, '600');
const intel = [
'Guard bots: ' + d.guards.length + (d.dorm ? ' (+' + d.dorm.length + ' asleep)' : ''), 'Cameras: ' + d.cams.length,
'Vault: ' + d.vault + ' tumblers, ' + fmtCash(d.cash), 'Loot pieces: ' + inf.vals + ' x ' + fmtCash(d.val),
'Lockdown: ' + fmtTime(d.lock), 'Par time: ' + fmtTime(d.par),
];
const feats = [];
if (inf.lasers) feats.push('lasers'); if (inf.plates) feats.push('plates'); if (inf.sensors) feats.push('sensors'); if (inf.vents) feats.push('vents');
if (inf.kdoor) feats.push('keycard'); if (inf.pdoor) feats.push('locks'); if (inf.panels) feats.push('alarm panel'); if (inf.ck) feats.push('checkpoint');
for (let i = 0; i < intel.length; i++) txt(ctx, intel[i], 460 + (i % 2) * 230, 270 + Math.floor(i / 2) * 24, 13, FONT_B, UI.body, 'left', 220, '600');
txt(ctx, 'Security: ' + feats.join(', '), 460, 348, 13, FONT_B, UI.dim, 'left', 445, '600');
if (h.done) {
txt(ctx, 'Best grade ' + h.grade + (h.ghost ? '  -  ghosted' : '') + '  -  loot ' + Math.round(h.loot * 100) + '%  -  best time ' + fmtTime(h.time), 460, 380, 13, FONT_M, UI.ok, 'left', 445, '700');
}
const label = st === 'locked' ? 'Locked' : st === 'buy' ? 'Buy access ' + fmtCash(site.price) : 'Open briefing';
button(460, 404, 300, 44, label, 'go', 0, st !== 'locked', st === 'locked' ? UI.dim : null);
txt(ctx, 'Ratings: GHOST (never spotted), LOOT 80%+, under PAR time.', 460, 470, 12, FONT_B, UI.dim, 'left', 445, '600');
txt(ctx, 'An alarm lowers the grade.', 460, 490, 12, FONT_B, UI.dim, 'left', 445, '600');
txt(ctx, 'Replays bank their loot again, so you can always earn more cash.', 460, 510, 12, FONT_B, UI.dim, 'left', 445, '600');
} else {
txt(ctx, 'Upgrades last for every heist. Earn cash by banking loot.', 44, 96, 14, FONT_B, UI.body, 'left', 600, '600');
for (let i = 0; i < UPGRADES.length; i++) {
const u = UPGRADES[i], lv = SV.up[u.id], y = 124 + i * 58, hot = selUp === i, max = lv >= 2;
roundRectPath(ctx, 38, y, 884, 50, 10);
ctx.fillStyle = hot ? 'rgba(255, 201, 60, 0.16)' : 'rgba(255, 255, 255, 0.04)'; ctx.fill();
if (hot) { ctx.lineWidth = 2; ctx.strokeStyle = UI.hi; ctx.stroke(); }
addHit(38, y, 884, 50, 'up', i);
txt(ctx, u.name, 56, y + 17, 16, FONT_B, UI.head, 'left', 360, '800');
txt(ctx, u.desc, 56, y + 37, 13, FONT_B, UI.dim, 'left', 420, '600');
for (let k = 0; k < 2; k++) { roundRectPath(ctx, 560 + k * 26, y + 18, 20, 14, 4); ctx.fillStyle = k < lv ? UI.ok : 'rgba(255, 255, 255, 0.12)'; ctx.fill(); }
txt(ctx, max ? 'MAXED' : fmtCash(u.cost[lv]), 900, y + 25, 15, FONT_M, max ? UI.ok : SV.cash >= u.cost[lv] ? UI.hi : UI.dim, 'right', 200, '700');
}
}
if (msgT > 0) pill(480, 536, msg, 14, UI.hi);
txt(ctx, (touchUI ? 'Tap a row, tap it again to open' : 'W / S choose   Space: ' + (selTab === 0 ? (heistState(selH) === 'buy' ? 'buy access' : 'open') : 'buy') + '   A / D or Tab: ' + (selTab === 0 ? 'gear' : 'heists') + '   Esc: title'), 480, 566, 13, FONT_B, UI.dim, 'center', 880, '600');
}
function drawBrief() {
scrim(0.35);
anchorH(0.5, 0.5);
const d = L.def, site = SITES[L.site], ch = baseCharges();
panel(ctx, 24, 24, 420, 552);
txt(ctx, site.name.toUpperCase(), 48, 52, 12, FONT_M, hexCss(site.accent), 'left', 380, '700');
txt(ctx, d.name, 48, 84, 28, FONT_D, UI.head, 'left', 380);
txt(ctx, 'BRIEFING', 48, 116, 12, FONT_M, UI.hi, 'left', 0, '700');
const lines = wrapLines(ctx, d.brief, 370, 15, FONT_B, '600');
for (let i = 0; i < lines.length && i < 6; i++) txt(ctx, lines[i], 48, 140 + i * 21, 15, FONT_B, UI.body, 'left', 376, '600');
let y = 150 + Math.min(6, lines.length) * 21;
txt(ctx, 'OBJECTIVE', 48, y, 12, FONT_M, UI.hi, 'left', 0, '700');
txt(ctx, 'Crack the vault (' + d.vault + ' tumblers), then reach a green exit.', 48, y + 22, 14, FONT_B, UI.head, 'left', 376, '600');
txt(ctx, 'Lockdown after an alarm: ' + fmtTime(d.lock) + '   Par: ' + fmtTime(d.par), 48, y + 44, 13, FONT_B, UI.dim, 'left', 376, '600');
y += 76;
txt(ctx, 'LOADOUT', 48, y, 12, FONT_M, UI.hi, 'left', 0, '700');
for (let i = 0; i < 4; i++) {
gadgetIcon(i, 60 + i * 94, y + 28, 8, GADGETS[i].col);
txt(ctx, GADGETS[i].name + ' x' + ch[i], 74 + i * 94, y + 28, 12, FONT_B, UI.head, 'left', 74, '700');
}
y += 52;
for (let i = 0; i < 4 && y < 500; i++, y += 18) txt(ctx, (i + 1) + ' ' + GADGETS[i].name + ': ' + GADGETS[i].tip, 48, y, 12, FONT_B, UI.dim, 'left', 380, '600');
promptLine(touchUI ? 'Tap to start the heist' : 'Press Space to start the heist', 528);
button(48, 548, 150, 24, touchUI ? 'BACK' : 'Esc: back', 'back', 0, false);
panel(ctx, 460, 24, 476, 552);
txt(ctx, 'BLUEPRINT', 484, 52, 14, FONT_D, UI.hi, 'left', 0);
txt(ctx, 'green dot: you   gold: vault   red: cameras', 912, 52, 11, FONT_B, UI.dim, 'right', 260, '600');
drawPlan(476, 72, 444, 490, false);
}
function overPrimary() {
const r = R.result;
if (!r) return;
if (r.ok) { const n = nextHeistTarget(); if (n >= 0) openBrief(n); else openSelect(Math.min(L.i + 1, HEISTS.length - 1)); }
else if (r.hasCk) retryCheckpoint();
else startHeist(L.i);
}
function overPrimaryLabel() {
const r = R.result;
if (!r) return '';
if (r.ok) return nextHeistTarget() >= 0 ? 'next heist' : 'heist list';
return r.hasCk ? 'retry from checkpoint' : 'retry heist';
}
function overPrimaryVerb() {
const r = R.result;
if (!r) return '';
if (r.ok) return nextHeistTarget() >= 0 ? 'brief the next heist' : 'open the heist list';
return r.hasCk ? 'retry from the checkpoint' : 'retry the heist';
}
function overKey(c) {
if (c === 'Space' || c === 'Enter') overPrimary();
else if (c === 'KeyR') startHeist(L.i);
else if (c === 'KeyM' || c === 'Escape') openSelect(L.i);
}
function drawOver() {
const r = R.result;
if (!r) return;
scrim();
anchorH(0.5, 0.5);
panel(ctx, 190, 70, 580, 460);
const head = r.ok ? (r.alarm ? 'Escaped under lockdown' : r.ghost ? 'Clean getaway' : 'Getaway') : r.kind === 'caught' ? 'Caught' : 'Locked in';
txt(ctx, head, 480, 112, 32, FONT_D, r.ok ? UI.head : UI.danger, 'center', 540);
const sub = r.ok ? L.def.name + ' cracked in ' + fmtTime(r.time) : r.kind === 'caught' ? 'A guard bot grabbed you. The loot stays behind.' : 'The lockdown sealed every exit.';
txt(ctx, sub, 480, 146, 15, FONT_B, UI.body, 'center', 540, '600');
if (r.ok) {
disc(300, 238, 52); ctx.fillStyle = 'rgba(255, 201, 60, 0.12)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = UI.hi; ctx.stroke();
txt(ctx, r.grade, 300, 242, 54, FONT_D, UI.hi, 'center', 0);
txt(ctx, 'GRADE', 300, 304, 11, FONT_M, UI.dim, 'center', 0, '700');
const med = [[r.ghost, 'GHOST', r.ghost ? 'never spotted' : 'you were spotted'], [r.pct >= 0.8, 'LOOT ' + Math.round(r.pct * 100) + '%', '80% or more'], [r.fast, 'TIME ' + fmtTime(r.time), 'par ' + fmtTime(r.par)]];
for (let i = 0; i < 3; i++) {
const y = 196 + i * 40;
disc(398, y, 9); ctx.fillStyle = med[i][0] ? UI.ok : 'rgba(255, 255, 255, 0.12)'; ctx.fill();
txt(ctx, med[i][1], 416, y - 1, 15, FONT_M, med[i][0] ? UI.head : UI.dim, 'left', 200, '700');
txt(ctx, med[i][2], 740, y - 1, 12, FONT_B, UI.dim, 'right', 120, '600');
}
if (r.alarm) txt(ctx, 'Alarm raised: grade lowered', 416, 318, 12, FONT_B, UI.danger, 'left', 300, '700');
} else {
txt(ctx, 'Loot carried: ' + fmtCash(r.loot) + ' (lost)', 480, 220, 17, FONT_M, UI.dim, 'center', 500, '700');
txt(ctx, r.hasCk ? 'Your checkpoint is saved.' : 'Tip: shadows, lockers and the plan map (' + tk('Tab', 'MAP') + ') are your friends.', 480, 256, 14, FONT_B, UI.body, 'center', 520, '600');
}
txt(ctx, 'Banked ' + fmtCash(r.banked), 480, 356, 20, FONT_M, r.ok ? UI.hi : UI.dim, 'center', 0, '700');
txt(ctx, 'Total loot ' + fmtCash(SV.career) + '   -   Cash ' + fmtCash(SV.cash), 480, 384, 14, FONT_M, UI.body, 'center', 540, '700');
if (r.newBest) txt(ctx, 'New best!', 480, r.unlockedNext ? 404 : 412, 18, FONT_D, UI.ok, 'center', 0);
if (r.unlockedNext) {
const ns = HEISTS[Math.min(L.i + 1, HEISTS.length - 1)].site;
txt(ctx, SV.site[ns] ? 'Next heist unlocked' : 'Next heist unlocked: buy ' + SITES[ns].name + ' access in the heist list', 480, r.newBest ? 426 : 412, r.newBest ? 13 : 15, FONT_B, UI.ok, 'center', 540, '700');
}
const ready = overReady();
button(214, 440, 230, 40, (touchUI ? '' : 'Space: ') + overPrimaryLabel(), 'o_space', 0, ready);
button(454, 440, 150, 40, touchUI ? 'Restart' : 'R: restart', 'o_r', 0, false);
button(614, 440, 140, 40, touchUI ? 'Heist list' : 'M: heists', 'o_m', 0, false);
if (ready) promptLine((touchUI ? 'Tap' : 'Press Space') + ' to ' + overPrimaryVerb(), 506);
}
function drawPause() {
scrim();
anchorH(0.5, 0.5);
panel(ctx, 290, 170, 380, 260);
txt(ctx, 'Paused', 480, 216, 34, FONT_D, UI.head, 'center', 0);
txt(ctx, touchUI ? 'Tap to resume' : 'Press P or click to resume', 480, 262, 16, FONT_B, UI.body, 'center', 340, '600');
button(320, 300, 150, 40, touchUI ? 'Restart' : 'R: restart', 'prestart', 0, false);
button(490, 300, 150, 40, touchUI ? 'Heist list' : 'M: heists', 'pquit', 0, false);
txt(ctx, L.def.name + '  -  ' + fmtTime(R.time), 480, 380, 13, FONT_M, UI.dim, 'center', 340, '700');
}
function drawHUD() {
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.clearRect(0, 0, hud.width, hud.height);
hitN = 0;
if (msgT > 0) msgT -= 1 / 60;
if (mode === 'playing') drawWorldMarks();
if (mode === 'playing') drawPlayHud();
else if (mode === 'title') drawTitle();
else if (mode === 'select') drawSelect();
else if (mode === 'brief') drawBrief();
else if (mode === 'over') drawOver();
if (mode === 'playing' && paused) { hitN = 0; drawPause(); }
}

const GAME_KEYS = {
KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1,
KeyC: 1, KeyE: 1, KeyF: 1, KeyQ: 1, KeyR: 1, KeyZ: 1, KeyX: 1, KeyM: 1, KeyP: 1, Tab: 1, Escape: 1, Space: 1, Enter: 1, NumpadEnter: 1, Backspace: 1,
Digit1: 1, Digit2: 1, Digit3: 1, Digit4: 1, Numpad1: 1, Numpad2: 1, Numpad3: 1, Numpad4: 1,
};
const HELD = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1 };
const MOVE_KEYS = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1 };
const CONFIRM = { Space: 1, Enter: 1, NumpadEnter: 1 };
const MENU_KEYS = {
title: CONFIRM,
select: { ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, Tab: 1, Space: 1, Enter: 1, NumpadEnter: 1, Escape: 1, Backspace: 1, KeyM: 1 },
brief: { Space: 1, Enter: 1, NumpadEnter: 1, Escape: 1, Backspace: 1, KeyM: 1 },
over: { Space: 1, Enter: 1, NumpadEnter: 1, KeyR: 1, KeyM: 1, Escape: 1 },
};
const KEY_FALLBACK = { ' ': 'Space', Spacebar: 'Space', Esc: 'Escape', Escape: 'Escape', Tab: 'Tab', Enter: 'Enter', Backspace: 'Backspace', Shift: 'ShiftLeft',
ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight' };
function codeOf(e) {
if (e.code) return e.code;
const k = e.key || '';
if (KEY_FALLBACK[k]) return KEY_FALLBACK[k];
if (k.length === 1) { const u = k.toUpperCase(); if (u >= 'A' && u <= 'Z') return 'Key' + u; if (u >= '0' && u <= '9') return 'Digit' + u; }
return k;
}
function isEditable(t) { return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable === true); }
function clearHeld() {
for (const k in keys) keys[k] = false;
stick.on = false; stick.id = -1; stick.vx = stick.vy = 0; stick.far = false; VT.btn = 0; VT.drag = -1; dialPtr = -1;
}
function pause() {
if (mode !== 'playing' || paused || R.endT >= 0) return;
paused = true; dirty = true;
if (ui === 'plan') ui = null;
audioStop(); clearHeld();
}
function resume() {
if (!paused) return;
paused = false; acc = 0; lastT = performance.now();
}
function togglePlan() {
if (ui === 'plan') { ui = null; return; }
if (ui) return;
ui = 'plan'; clearHeld();
api.tone(640, 0.03, { type: 'triangle', vol: 0.04 });
}
function rotateView(d) { camYawT += d * Math.PI / 2; api.tone(440, 0.02, { type: 'triangle', vol: 0.025 }); }
function selectKey(c, rep) {
const up = c === 'ArrowUp' || c === 'KeyW', dn = c === 'ArrowDown' || c === 'KeyS';
if (up || dn) {
const d = up ? -1 : 1;
if (selTab === 0) selH = (selH + d + HEISTS.length) % HEISTS.length; else selUp = (selUp + d + UPGRADES.length) % UPGRADES.length;
api.tone(500, 0.02, { type: 'triangle', vol: 0.025 });
return;
}
if (rep) return;
if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'KeyA' || c === 'KeyD' || c === 'Tab') { selTab = 1 - selTab; if (selTab === 1) selUp = firstUsefulUp(); api.tone(560, 0.03, { type: 'triangle', vol: 0.03 }); }
else if (c === 'Space' || c === 'Enter' || c === 'NumpadEnter') selectAction();
else if (c === 'Escape' || c === 'Backspace' || c === 'KeyM') mode = 'title';
}
function onKeyDown(e) {
if (isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
const c = codeOf(e);
if (!GAME_KEYS[c]) return;
if (HELD[c]) keys[c] = true;
if (mode !== 'playing' && !(MENU_KEYS[mode] && MENU_KEYS[mode][c])) return;   // menus leave keys they do not use alone
e.preventDefault();
if (mode === 'title') { if (!e.repeat && (c === 'Space' || c === 'Enter' || c === 'NumpadEnter')) openSelect(-1); return; }
if (mode === 'select') { selectKey(c, e.repeat); return; }
if (mode === 'brief') {
if (e.repeat) return;
if (c === 'Space' || c === 'Enter' || c === 'NumpadEnter') startHeist(L.i);
else if (c === 'Escape' || c === 'Backspace' || c === 'KeyM') openSelect(L.i);
return;
}
if (mode === 'over') { if (!e.repeat && overReady()) overKey(c === 'NumpadEnter' ? 'Enter' : c); return; }
if (mode !== 'playing') return;
if (paused) {
if (e.repeat) return;
if (c === 'KeyP' || c === 'Escape') resume();
else if (c === 'KeyR') startHeist(L.i);
else if (c === 'KeyM') openSelect(L.i);
return;
}
if (e.repeat) return;
if (c === 'KeyP' || c === 'Escape') { pause(); return; }
if (R.endT >= 0) return;
if (c === 'Tab') { togglePlan(); return; }
if (ui === 'plan') { if (c === 'Space' || c === 'Enter') ui = null; return; }
const setKey = c === 'KeyE' || c === 'Space' || c === 'KeyF' || c === 'Enter' || c === 'NumpadEnter';
const leaveKey = c === 'KeyS' || c === 'ArrowDown' || c === 'Backspace';
if (ui === 'vault') {
if (setKey) vaultSet();
else if (c === 'KeyA' || c === 'ArrowLeft') vaultTurn(-1);
else if (c === 'KeyD' || c === 'ArrowRight') vaultTurn(1);
else if (leaveKey) ui = null;
return;
}
if (ui === 'pick') { if (setKey) pickSet(); else if (leaveKey) ui = null; return; }
if (P.hidden >= 0 && MOVE_KEYS[c]) { leaveLocker(); return; }
switch (c) {
case 'KeyE': case 'Space': case 'Enter': case 'NumpadEnter': interact(); break;
case 'KeyF': useGadget(); break;
case 'KeyC': toggleCrouch(); break;
case 'Digit1': case 'Numpad1': selectGadget(0); break;
case 'Digit2': case 'Numpad2': selectGadget(1); break;
case 'Digit3': case 'Numpad3': selectGadget(2); break;
case 'Digit4': case 'Numpad4': selectGadget(3); break;
case 'KeyQ': rotateView(1); break;
case 'KeyR': rotateView(-1); break;
case 'KeyZ': zoomT = clamp(zoomT - 3, 10, 26); break;
case 'KeyX': zoomT = clamp(zoomT + 3, 10, 26); break;
default: break;
}
}
function onKeyUp(e) {
const c = codeOf(e);
if (!HELD[c]) return;
keys[c] = false;
if (!isEditable(e.target) && mode === 'playing') e.preventDefault();
}
function onBlur() { pause(); clearHeld(); }
function onVisibility() { if (document.hidden) { pause(); clearHeld(); } }
let dialPtr = -1;
function capture(e) { try { hud.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ } }
function onPointerDown(e) {
try { hud.focus({ preventScroll: true }); } catch (err) { /* focus is best effort */ }
const touch = e.pointerType === 'touch';
if (touch) touchUI = true;
if (!touch && e.button !== 0) return;
e.preventDefault();
const r = hud.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
const h = hitAt(cx, cy);
if (mode === 'title') { openSelect(-1); return; }
if (mode === 'select') {
if (!h) return;
if (h.id === 'tab') { selTab = h.n; if (selTab === 1) selUp = firstUsefulUp(); }
else if (h.id === 'heist') { if (selH === h.n) selectAction(); else { selH = h.n; api.tone(500, 0.02, { type: 'triangle', vol: 0.025 }); } }
else if (h.id === 'up') { if (selUp === h.n) selectAction(); else selUp = h.n; }
else if (h.id === 'go') selectAction();
return;
}
if (mode === 'brief') { if (h && h.id === 'back') openSelect(L.i); else startHeist(L.i); return; }
if (mode === 'over') {
if (!overReady()) return;
if (h && h.id === 'o_r') startHeist(L.i); else if (h && h.id === 'o_m') openSelect(L.i); else overPrimary();
return;
}
if (mode !== 'playing') return;
if (paused) {
if (h && h.id === 'prestart') startHeist(L.i); else if (h && h.id === 'pquit') openSelect(L.i); else resume();
return;
}
if (R.endT >= 0) return;
if (ui === 'plan') { ui = null; return; }
if (h) {
switch (h.id) {
case 'pause': pause(); return;
case 'plan': togglePlan(); return;
case 'rotL': rotateView(1); return;
case 'rotR': rotateView(-1); return;
case 'gad': if (R.sel === h.n && touch) useGadget(); else selectGadget(h.n); return;
case 'use': interact(); return;
case 'gadget': useGadget(); return;
case 'sneak': toggleCrouch(); return;
case 'dl': VT.btn = -1; vaultTurn(-1); dialPtr = e.pointerId; capture(e); return;
case 'dr': VT.btn = 1; vaultTurn(1); dialPtr = e.pointerId; capture(e); return;
case 'dset': vaultSet(); return;
case 'pset': pickSet(); return;
case 'leave': ui = null; return;
default: break;
}
}
if (ui === 'vault') { VT.drag = e.pointerId; VT.dragX = e.clientX; capture(e); return; }
if (ui) return;
if (touchUI && P.hidden >= 0) { leaveLocker(); return; }
if (touchUI && !stick.on) {
const p = toLogical(cx, cy, 0, 1);
if (cx < view.w * 0.5) { stick.on = true; stick.id = e.pointerId; stick.ox = p.x; stick.oy = p.y; stick.vx = stick.vy = 0; capture(e); }
}
}
function onPointerMove(e) {
if (mode !== 'playing' || paused) return;
if (VT.drag === e.pointerId && ui === 'vault') {
vaultTurn((e.clientX - VT.dragX) / Math.max(0.3, view.s) * 0.12);
VT.dragX = e.clientX;
return;
}
if (stick.on && e.pointerId === stick.id) {
const r = hud.getBoundingClientRect(), p = toLogical(e.clientX - r.left, e.clientY - r.top, 0, 1);
let dx = p.x - stick.ox, dy = p.y - stick.oy;
const d = Math.sqrt(dx * dx + dy * dy), R0 = STICK.r;
stick.far = d > R0 * 1.55;
if (d > R0) { dx = dx / d * R0; dy = dy / d * R0; }
if (d < 6) { stick.vx = 0; stick.vy = 0; } else { stick.vx = clamp(dx / R0, -1, 1); stick.vy = clamp(-dy / R0, -1, 1); }
}
}
function onPointerUp(e) {
if (stick.on && e.pointerId === stick.id) { stick.on = false; stick.id = -1; stick.vx = stick.vy = 0; stick.far = false; }
if (e.pointerId === dialPtr) { VT.btn = 0; dialPtr = -1; }
if (e.pointerId === VT.drag) VT.drag = -1;
}
function onContextMenu(e) { e.preventDefault(); }

function resize() {
const w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight);
view.w = w; view.h = h; view.s = Math.min(w / LW, h / LH); view.dpr = Math.min(window.devicePixelRatio || 1, 2);
renderer.setSize(w, h, false);
camera.aspect = w / h; camera.updateProjectionMatrix();
const bw = Math.round(w * view.dpr), bh = Math.round(h * view.dpr);
if (hud.width !== bw || hud.height !== bh) { hud.width = bw; hud.height = bh; }
dirty = true;
}
let frameAvg = 16.7, workAvg = 8, slowT = 0, fastT = 0;
function adaptResolution(raw, work) {
if (raw <= 0 || raw > 0.25 || paused || document.hidden) return;
frameAvg += (raw * 1000 - frameAvg) * 0.05;
workAvg += (work - workAvg) * 0.05;
if (frameAvg > 20) {
slowT += raw; fastT = 0;
if (slowT > 1.5 && pixelRatio > 0.551) { pixelRatio = Math.max(0.55, pixelRatio - 0.15); renderer.setPixelRatio(pixelRatio); resize(); slowT = 0; frameAvg = 16.7; }
} else if (frameAvg < 18 && workAvg < 12) {
fastT += raw; slowT = 0;
if (fastT > 4 && pixelRatio < maxPR - 0.001) { pixelRatio = Math.min(maxPR, pixelRatio + 0.1); renderer.setPixelRatio(pixelRatio); resize(); fastT = 0; }
} else { slowT = 0; fastT = 0; }
}

function frame(now) {
if (destroyed) return;
raf = requestAnimationFrame(frame);
let raw = (now - lastT) / 1000;
lastT = now;
if (!(raw > 0)) raw = 0;
const dt = Math.min(raw, 1 / 30), t0 = performance.now();
animT += dt;
const live = mode === 'playing' && !paused && ui !== 'plan';
if (live) {
acc += dt;
let n = 0;
while (acc >= SIM && n < MAX_STEPS && mode === 'playing') { step(SIM); acc -= SIM; n++; }
if (n >= MAX_STEPS) acc = 0;
findFocus();
}
audioUpdate(dt);
if (!paused || dirty) {
const sdt = live || mode !== 'playing' ? dt : 0;
updateCamera(sdt);
syncScene(sdt);
renderer.render(scene, camera);
dirty = false;
}
drawHUD();
adaptResolution(raw, performance.now() - t0);
}

const LISTENERS = [
[window, 'keydown', onKeyDown], [window, 'keyup', onKeyUp], [window, 'blur', onBlur], [document, 'visibilitychange', onVisibility],
[hud, 'pointerdown', onPointerDown], [hud, 'pointermove', onPointerMove], [hud, 'pointerup', onPointerUp], [hud, 'pointercancel', onPointerUp],
[hud, 'contextmenu', onContextMenu],
];
buildLevel(selH);
resetRun(false);
resize();
let ro = null;
if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(function () { if (!destroyed) resize(); }); ro.observe(root); }
else LISTENERS.push([window, 'resize', resize]);
for (let i = 0; i < LISTENERS.length; i++) LISTENERS[i][0].addEventListener(LISTENERS[i][1], LISTENERS[i][2]);
raf = requestAnimationFrame(frame);

function destroy() {
if (destroyed) return;
destroyed = true;
cancelAnimationFrame(raf);
for (let i = 0; i < LISTENERS.length; i++) LISTENERS[i][0].removeEventListener(LISTENERS[i][1], LISTENERS[i][2]);
if (ro) ro.disconnect();
audioStop();
unloadLevel();
const seen = new Set();
function disp(o) { if (o && !seen.has(o) && typeof o.dispose === 'function') { seen.add(o); try { o.dispose(); } catch (err) { /* already gone */ } } }
scene.traverse(function (o) {
if (o.geometry) disp(o.geometry);
if (o.material) {
const ms = Array.isArray(o.material) ? o.material : [o.material];
for (let i = 0; i < ms.length; i++) { if (ms[i].map) disp(ms[i].map); disp(ms[i]); }
}
if (o.isInstancedMesh) disp(o);
});
for (let i = 0; i < own.length; i++) disp(own[i]);
renderer.dispose();
renderer.forceContextLoss();
if (glCanvas.parentNode) glCanvas.parentNode.removeChild(glCanvas);
if (hud.parentNode) hud.parentNode.removeChild(hud);
}
function restart() {
if (destroyed) return;
let t = mode === 'playing' || mode === 'over' || mode === 'brief' ? L.i : selH;
if (!heistOpen(t)) t = heistOpen(L.i) ? L.i : 0;   // never launch a locked heist highlighted in the list
startHeist(t);
}
return { destroy: destroy, restart: restart };
}
try {
return start();
} catch (err) { // never leave a live WebGL context behind if the build fails on an odd device
try { renderer.dispose(); renderer.forceContextLoss(); } catch (e2) { /* context already gone */ }
if (glCanvas.parentNode) glCanvas.parentNode.removeChild(glCanvas);
if (hud.parentNode) hud.parentNode.removeChild(hud);
return notice("Vault Run couldn't start in this browser. Press Restart to try again.");
}
}

(window.RECESS = window.RECESS || { games: [] }).games.push({
id: 'vault-run',
title: 'Vault Run',
blurb: 'Slip past robot guards, cameras and lasers, crack the vault and get out clean.',
genre: 'Adventure',
is3D: true,
controls: [
['W A S D / Arrows', 'Move'],
['C / Shift', 'Sneak / sprint'],
['E / F', 'Use / gadget'],
['1-4', 'Pick gadget'],
['Q R / Z X', 'Turn / zoom view'],
['Tab / Esc', 'Plan map / pause'],
],
scoreLabel: 'Total loot ($)',
lowerIsBetter: false,
thumb: thumb,
mount: mount,
});
})();

} catch (e) { console.error("[Recess] vault-run failed to load", e); }
try {
(function () {
'use strict';


const FONT_D = '"Bungee", "Impact", sans-serif';
const FONT_B = '"Figtree", system-ui, sans-serif';
const FONT_M = '"JetBrains Mono", ui-monospace, monospace';
const UI = {
scrim: 'rgba(8, 12, 22, 0.72)', panel: 'rgba(16, 22, 38, 0.92)', stroke: 'rgba(255, 255, 255, 0.12)',
head: '#FFFFFF', body: '#C9D3E3', dim: '#8494B0', hi: '#FFC93C', danger: '#FF5D5D', ok: '#4BE3A0',
glass: 'rgba(12, 18, 32, 0.6)', cyan: '#7CF3FF', shield: '#5CC8FF', hull: '#FF9A4A', foe: '#FF4D4D', friend: '#4BE3A0',
};
const TAU = Math.PI * 2;
const STEP = 1 / 120, MAX_STEPS = 8;
const ENT_MAX = 72, BOLT_MAX = 280, MSL_MAX = 40, FLR_MAX = 24, DEB_MAX = 150, AST_MAX = 180, RING_MAX = 14, PICK_MAX = 12, SHOCK_MAX = 6;
const LASER_SPD = 560, EBOLT_SPD = 230, LOCK_CONE = Math.cos(20 * Math.PI / 180), LOCK_RANGE = 460, JAM_RANGE = 150;
const CELL = 64;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(e0, e1, x) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
function rnd(a) { return (Math.random() * 2 - 1) * a; }
function rr(a, b) { return a + Math.random() * (b - a); }
function pad(n, w) { let s = String(n); while (s.length < w) s = '0' + s; return s; }
function fmtTime(sec) {
sec = Math.max(0, sec || 0);
const t = Math.floor(sec);
return Math.floor(t / 60) + ':' + pad(t % 60, 2);
}
function fmtNum(n) {
n = Math.round(n || 0);
const s = String(Math.abs(n));
let o = '';
for (let i = 0; i < s.length; i++) { if (i && (s.length - i) % 3 === 0) o += ','; o += s.charAt(i); }
return (n < 0 ? '-' : '') + o;
}
function mkRng(seed) {
let a = seed >>> 0;
return function () {
a = (a + 0x6D2B79F5) >>> 0;
let t = a;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
}
function hash3(ix, iy, iz, seed) {
let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(iz | 0, 1274126177) ^ Math.imul(seed | 0, 1442695041);
h = Math.imul(h ^ (h >>> 13), 1103515245);
h ^= h >>> 16;
return (h >>> 0) / 4294967296;
}
function vnoise3(x, y, z, seed) {
const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
const fx = x - ix, fy = y - iy, fz = z - iz;
const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
const a = lerp(hash3(ix, iy, iz, seed), hash3(ix + 1, iy, iz, seed), ux), b = lerp(hash3(ix, iy + 1, iz, seed), hash3(ix + 1, iy + 1, iz, seed), ux);
const c = lerp(hash3(ix, iy, iz + 1, seed), hash3(ix + 1, iy, iz + 1, seed), ux), d = lerp(hash3(ix, iy + 1, iz + 1, seed), hash3(ix + 1, iy + 1, iz + 1, seed), ux);
return lerp(lerp(a, b, uy), lerp(c, d, uy), uz);
}
function fbm3(x, y, z, seed) {
let s = 0, a = 0.5, f = 1, n = 0;
for (let i = 0; i < 4; i++) { s += a * vnoise3(x * f, y * f, z * f, seed + i * 31); n += a; a *= 0.5; f *= 2.07; }
return s / n;
}
function hexRGB(h) { return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]; }

const SHIPS = [
{ id: 'tern', name: 'VL-1 Tern', role: 'Balanced fighter', minSpd: 10, maxSpd: 84, boostSpd: 150, accel: 46, turn: 1.6, roll: 2.7,
shield: 100, hull: 100, dmg: 10, cd: 0.12, heat: 4.3, msl: 6, boost: 1, guns: 2, body: 0xd5dbe6, accent: 0x5cc8ff, unlock: 0,
blurb: 'Steady handling and a forgiving shield. The fleet\u2019s workhorse.' },
{ id: 'quill', name: 'VL-2 Quill', role: 'Fast interceptor', minSpd: 14, maxSpd: 100, boostSpd: 178, accel: 58, turn: 1.9, roll: 3.3,
shield: 80, hull: 75, dmg: 9, cd: 0.1, heat: 3.9, msl: 4, boost: 1.35, guns: 2, body: 0x2a2f3c, accent: 0xffd25a, unlock: 3,
blurb: 'Light, twitchy and very fast. Out-turns every drone in the Lattice.' },
{ id: 'anvil', name: 'VL-3 Anvil', role: 'Heavy gunship', minSpd: 8, maxSpd: 70, boostSpd: 130, accel: 38, turn: 1.3, roll: 2.1,
shield: 150, hull: 160, dmg: 11, cd: 0.13, heat: 4.0, msl: 10, boost: 0.85, guns: 3, body: 0x8a8f78, accent: 0xff8a3c, unlock: 6,
blurb: 'Three cannons, deep missile racks and armor to soak a broadside.' },
{ id: 'lumen', name: 'VL-X Lumen', role: 'Experimental prototype', minSpd: 12, maxSpd: 94, boostSpd: 172, accel: 54, turn: 1.85, roll: 3.1,
shield: 140, hull: 120, dmg: 13, cd: 0.105, heat: 3.4, msl: 8, boost: 1.25, guns: 2, body: 0xeef0f6, accent: 0xc08bff, unlock: 11, lance: 1.6,
blurb: 'Ring-core reactor, fast-charging lance and the best guns in the fleet.' },
];
const UPG = [
{ name: 'Laser damage', desc: '+10% laser damage per level' },
{ name: 'Cooling', desc: 'Less heat per shot, faster cool-down' },
{ name: 'Shields', desc: '+12% shield strength, faster recharge' },
{ name: 'Missiles', desc: '+1 missile per sortie, faster lock' },
{ name: 'Boost', desc: 'Bigger boost meter, faster refill' },
];
const UPG_COST = [200, 450, 800, 1250];
const LANCE_UNLOCK = 4; // completing mission 4 unlocks the lance beam
const KINDS = [
{ n: 'Shard interceptor', hp: 30, r: 2.4, hl: 0, spd: 66, turn: 1.9, pts: 50 },
{ n: 'Mauler bomber', hp: 85, r: 3.2, hl: 1.6, spd: 40, turn: 1.0, pts: 90 },
{ n: 'Pike frigate', hp: 280, r: 4.6, hl: 9, spd: 20, turn: 0.35, pts: 220 },
{ n: 'Sentry platform', hp: 190, r: 5.6, hl: 0, spd: 0, turn: 0, pts: 130 },
{ n: 'Mine', hp: 12, r: 2.0, hl: 0, spd: 0, turn: 0, pts: 20 },
{ n: 'Target drone', hp: 24, r: 2.8, hl: 0, spd: 9, turn: 0.6, pts: 30 },
{ n: 'Kite drone', hp: 90, r: 2.4, hl: 0, spd: 72, turn: 2.0, pts: 0 },
{ n: 'Jammer relay', hp: 320, r: 6.5, hl: 4, spd: 0, turn: 0, pts: 300 },
{ n: 'Watcher drone', hp: 40, r: 2.6, hl: 0, spd: 24, turn: 1.2, pts: 60 },
];
const SUB_NAME = ['Shield generator', 'Turret', 'Engine', 'Launch bay', 'Reactor'];
const SUB_HP = [400, 130, 420, 300, 800];
const SUB_PTS = [250, 100, 250, 200, 1500];

const PALS = [
{ bg: 0x02050d, c1: 0x0d4f6c, c2: 0x2a8fa8, c3: 0xa8ecff, fog: 0x061322, sky: 0x9fd8ff, gnd: 0x101828, sun: 0xdff4ff },
{ bg: 0x090205, c1: 0x6e1a18, c2: 0xc2552a, c3: 0xffc07a, fog: 0x170708, sky: 0xffd0b0, gnd: 0x1a0c10, sun: 0xffe0c0 },
{ bg: 0x06030d, c1: 0x431c70, c2: 0xa03488, c3: 0xff9be0, fog: 0x10071c, sky: 0xe0c0ff, gnd: 0x140c20, sun: 0xffe8ff },
{ bg: 0x0a0d0c, c1: 0x2c4640, c2: 0x5f8070, c3: 0xc8e8d0, fog: 0x1b2624, sky: 0xc8e0d8, gnd: 0x101614, sun: 0xe8fff0 },
{ bg: 0x090602, c1: 0x5e4012, c2: 0xb47c22, c3: 0xffe7a0, fog: 0x161006, sky: 0xffe8c0, gnd: 0x1a1408, sun: 0xfff0d0 },
];

const CAPDEFS = [
{ name: 'Basalt-class warship', s: 1, spd: 9,
sub: [[0, -17, 15, -24, 0, 1, 0], [0, 17, 15, -24, 0, 1, 0],
[1, -17, 13.5, -42, 0, 1, 0], [1, 17, 13.5, -42, 0, 1, 0], [1, -17, 13.5, 36, 0, 1, 0], [1, 17, 13.5, 36, 0, 1, 0],
[1, 0, 9.4, -72, 0, 1, 0], [1, 0, -13.5, 6, 0, -1, 0],
[2, -10, 0, 103.3, 0, 0, 1], [2, 10, 0, 103.3, 0, 0, 1], [4, 0, 4.5, 8, 0, 1, 0]] },
{ name: 'Lattice flagship', s: 1.45, spd: 6,
sub: [[0, -17, 15, -30, 0, 1, 0], [0, 17, 15, -30, 0, 1, 0], [0, -17, 15, 30, 0, 1, 0], [0, 17, 15, 30, 0, 1, 0],
[1, -17, 13.5, -45, 0, 1, 0], [1, 17, 13.5, -45, 0, 1, 0], [1, -17, 13.5, 0, 0, 1, 0], [1, 17, 13.5, 0, 0, 1, 0],
[1, -17, 13.5, 46, 0, 1, 0], [1, 17, 13.5, 46, 0, 1, 0], [1, 0, 9.4, -72, 0, 1, 0], [1, -35, -4, -10, -1, 0, 0],
[1, 35, -4, -10, 1, 0, 0], [1, 0, -13.5, 30, 0, -1, 0],
[2, -10, 0, 103.3, 0, 0, 1], [2, 0, 0, 103.3, 0, 0, 1], [2, 10, 0, 103.3, 0, 0, 1], [3, 0, -12.5, -20, 0, -1, 0], [4, 0, 4.5, 8, 0, 1, 0]] },
];
const CAP_BOX = [[0, 0, -78, 12, 6, 22], [0, 0, -58, 20, 11, 7], [0, -5, 4, 24, 7, 56], [-17, 7, 4, 7, 5, 56], [17, 7, 4, 7, 5, 56],
[0, 0, 80, 20, 10, 20], [0, 18, 77, 6, 8, 11], [0, -17, 30, 1, 5, 31]];

function runWaves(S, m, W) {
if (m.wi === undefined) { m.wi = 0; m.since = 0; m.wnext = W[0].delay !== undefined ? W[0].delay : 2; }
m.since += STEP;
const left = S.left();
if (m.wi < W.length) {
const w = W[m.wi];
if (m.since >= m.wnext || (m.wi > 0 && left <= (w.when || 0) && m.since > 3)) {
S.spawnWave(w);
m.wi++; m.since = 0;
m.wnext = m.wi < W.length ? (W[m.wi].gap || 45) : 1e9;
S.toast(W.length > 1 ? 'WAVE ' + m.wi + ' / ' + W.length : 'CONTACTS', UI.danger);
}
}
return m.wi >= W.length && S.left() === 0;
}
const WV = {
picket: [{ delay: 5, spawn: [[0, 4]] }, { gap: 40, spawn: [[0, 5]] }, { gap: 40, spawn: [[0, 5], [1, 1]] }],
haul: [{ delay: 6, spawn: [[0, 3]], near: 1 }, { gap: 24, spawn: [[1, 2], [0, 2]], near: 1 }, { gap: 24, spawn: [[1, 2], [0, 3]], near: 1 }, { gap: 24, spawn: [[1, 3], [0, 2]], near: 1 }],
anchor: [{ delay: 14, spawn: [[1, 2], [0, 2]], near: 2 }, { gap: 35, spawn: [[1, 3], [0, 3]], near: 2 }, { gap: 35, spawn: [[1, 3], [0, 4]], near: 2 }, { gap: 35, spawn: [[1, 4], [0, 3]], near: 2 }],
glass: [{ delay: 20, spawn: [[0, 3]], near: 1 }, { gap: 30, spawn: [[1, 2], [0, 2]], near: 1 }, { gap: 30, spawn: [[1, 2], [0, 3]], near: 1 }],
rock: [{ delay: 4, spawn: [[0, 6]] }, { gap: 45, spawn: [[0, 4], [1, 3]] }, { gap: 45, spawn: [[2, 2], [0, 4]] }, { gap: 45, spawn: [[2, 2], [1, 3], [0, 5]] }],
};
const MISSIONS = [
{ name: 'Cold Start', pal: 0, par: 150, reserves: 1, brief: 'Flight drill on the Relay range: nav rings, target drones, then a live patrol.',
env: { planet: [0.5, -0.35, -0.8], pr: 120, pc: [0x3c8fb0, 0x0f2c44], ring: true, ast: 26, ac: [0, 0, -420], as: [420, 120, 380], amin: 4, amax: 16 },
setup: function (S, m) {
m.ph = 0;
S.ring(0, 8, -120, 16); S.ring(46, 22, -250, 16); S.ring(-20, 12, -380, 16);
S.clear(0, 0, 0, 0, 10, -400, 40);
S.obj('Fly through the nav rings', '0 / 3');
S.hint('steer', 'Move the POINTER away from the center to steer (or use the ARROW keys). Fly through the ring.', 'Drag the left stick to steer. Fly through the ring.', 12);
},
step: function (S, m) {
if (m.ph === 0) {
const d = S.ringsDone();
S.objSub(d + ' / 3');
if (d >= 2 && !m.h1) { m.h1 = true; S.hint('thr', 'W / S set the throttle. Hold SHIFT to boost.', 'Slide the THROTTLE bar. Hold BOOST to sprint.', 8); } // ring 1 is dead ahead: keep the steering hint up until the player has had to steer
if (d >= 3) {
m.ph = 1; m.ph1T = S.t;
S.group(5, 4, -20, 10, -540, 26);
S.obj('Destroy the target drones', '0 / 4');
S.hint('fire', 'Press F or CLICK to fire lasers. Aim at the yellow diamond ahead of the target.', 'Hold FIRE. Aim at the yellow diamond ahead of the target.', 10);
}
} else if (m.ph === 1) {
const left = S.count(5);
S.objSub((4 - left) + ' / 4');
if (left === 0) {
m.ph = 2;
S.reload();
const e = S.spawn(5, 10, 18, -760, { hp: 140 });
if (e) e.armored = true;
S.obj('Missile test: destroy the armored drone', 'Lasers barely scratch it');
S.hint('msl', 'Keep it near the center until the lock ring closes. HOLD SPACE to lock, release to fire.', 'Hold MSL while the lock ring closes, release to fire.', 12);
}
} else if (m.ph === 2) {
if (S.msl === 0 && S.count(5) > 0) S.reload();
if (S.count(5) === 0) {
m.ph = 3;
S.reload();
S.group(0, 3, 0, 30, -1000, 30, { weak: true });
S.obj('Live contacts! Destroy the interceptors', '0 / 3');
S.hint('shield', 'Interceptors shoot back. Your blue shield recharges when you avoid fire. Your hull does not.', '', 9);
}
} else if (m.ph === 3) {
const left = S.count(0);
S.objSub((3 - left) + ' / 3');
if (left < 3 && !m.h3) { m.h3 = true; S.hint('tgt', 'Press T to switch targets. The arrow at the screen edge points to your target.', 'The arrow at the screen edge points to your target.', 7); }
if (left === 0) S.win('Drill complete. Welcome to the squadron, Lancer.');
}
} },
{ name: 'Picket Duty', pal: 0, par: 200, reserves: 1, brief: 'Hold the picket line with your two Kite wing drones. Three waves are inbound.',
env: { planet: [-0.6, 0.25, -0.75], pr: 150, pc: [0x6aa8c0, 0x1c3a50], ring: false, ast: 40, ac: [0, 0, -300], as: [520, 160, 420], amin: 4, amax: 22 },
setup: function (S, m) {
S.wing(true);
S.obj('Hold the picket line', 'Wave 0 / 3');
S.hint('wing', 'Your Kite drones fly with you. Press Q to order them: ATTACK MY TARGET or DEFEND ME.', 'Tap WING to order your drones: ATTACK MY TARGET or DEFEND ME.', 10);
},
step: function (S, m) {
const done = runWaves(S, m, WV.picket);
S.objSub('Wave ' + m.wi + ' / 3   Hostiles ' + S.left());
if (done) S.win('Picket line held.');
} },
{ name: 'Long Haul', pal: 1, par: 0, reserves: 1, brief: 'Escort the freighter Saltwick to the jump buoy. Mauler bombers will go for it.',
env: { planet: [0.7, 0.2, 0.6], pr: 130, pc: [0xd07040, 0x401810], ring: true, ast: 34, ac: [100, 0, -700], as: [600, 140, 600], amin: 5, amax: 20 },
setup: function (S, m) {
S.wing(true);
S.freighter([[30, -10, -60], [60, 0, -450], [-40, 20, -900], [20, 0, -1350]], 15);
S.obj('Escort the freighter to the jump buoy', '');
S.hint('frt', 'Stay near the freighter. Bombers go for it: shoot them first (red diamond = bomber).', '', 9);
},
step: function (S, m) {
const clear = runWaves(S, m, WV.haul);
const f = S.frt;
if (clear && !m.sprint && !f.arrived && f.prog < 0.9) { m.sprint = true; f.spd *= 2.4; S.toast('ROUTE CLEAR: SALTWICK BURNING FOR THE BUOY', UI.ok); } // no long empty escort after the last wave
S.objSub('Freighter hull ' + Math.ceil(100 * f.hp / f.maxHp) + '%   Route ' + Math.floor(f.prog * 100) + '%');
if (f.arrived) { S.bonus(Math.round(1500 * f.hp / f.maxHp), 'Freighter intact'); S.win('Saltwick jumped clear.'); }
} },
{ name: 'The Scree', pal: 2, par: 95, reserves: 1, timer: 150, brief: 'Timed run through the Scree asteroid belt. Mines and sentries guard the gates.',
env: { planet: [-0.3, -0.5, -0.8], pr: 140, pc: [0x9050b0, 0x2a1040], ring: true, ast: 170, ac: [0, 0, -900], as: [380, 160, 1000], amin: 5, amax: 34 },
setup: function (S, m) {
const P = [[0, 0, -140], [40, 20, -320], [-30, 40, -500], [-80, 0, -660], [-20, -40, -830], [60, -20, -990], [90, 30, -1150],
[20, 50, -1320], [-60, 20, -1480], [-40, -30, -1650], [30, -10, -1800], [0, 0, -1950]];
let px = 0, py = 0, pz = 0;
for (let i = 0; i < P.length; i++) { S.clear(px, py, pz, P[i][0], P[i][1], P[i][2], 16); px = P[i][0]; py = P[i][1]; pz = P[i][2]; S.ring(px, py, pz, 14); }
S.mine(52, 12, -330); S.mine(30, 32, -318); S.mine(-70, 10, -670); S.mine(-10, -30, -842); S.mine(100, 40, -1160); S.mine(80, 20, -1140);
S.mine(-50, 30, -1492); S.mine(40, 0, -1812);
S.spawn(3, 40, 60, -900, {}); S.spawn(3, -90, -30, -1560, {});
S.obj('Run the gates before the clock runs out', '0 / 12');
S.hint('boost', 'Hold SHIFT to boost through open stretches. Press V to toggle flight assist and drift through turns.', 'Hold BOOST through open stretches.', 10);
},
step: function (S, m) {
const d = S.ringsDone();
S.objSub(d + ' / 12');
if (d >= 12) { S.bonus(Math.round(S.timeLeft() * 20), 'Time to spare'); S.win('Gate run complete.'); }
} },
{ name: 'Pike Season', pal: 1, par: 240, reserves: 1, brief: 'Three Pike missile frigates are shelling the relay lanes. Sink them.',
env: { planet: [0.4, 0.4, -0.8], pr: 110, pc: [0xe0a060, 0x603010], ring: false, ast: 50, ac: [0, 0, -500], as: [650, 200, 500], amin: 4, amax: 24 },
setup: function (S, m) {
S.wing(true);
S.spawn(2, -160, 20, -420, {}); S.spawn(2, 200, -30, -560, {}); S.spawn(2, 0, 60, -820, {});
S.group(0, 2, -150, 30, -380, 30); S.group(0, 2, 190, -20, -520, 30); S.group(0, 2, 0, 70, -780, 30);
S.obj('Destroy the missile frigates', '0 / 3');
S.hint('flare', 'Pike frigates fire homing missiles. When MISSILE flashes, press R for flares or boost away.', 'When MISSILE flashes, tap FLARE or boost away.', 10);
},
step: function (S, m) {
const left = S.count(2);
S.objSub((3 - left) + ' / 3');
if (S.lanceReady() && !m.hl) { m.hl = true; S.hint('lance', 'Your LANCE beam is charged: press E. It pierces everything in a line.', 'Your LANCE is charged: tap LANCE. It pierces everything in a line.', 9); }
if (left === 0) S.win('The lanes are clear.');
else if (S.t > 40 && S.count(0) < 2 && !m.re) { m.re = true; S.spawnWave({ spawn: [[0, 4]] }); }
} },
{ name: 'Anchor Point', pal: 0, par: 260, reserves: 1, brief: 'Defend Anchor Station from bomber waves and the sentry guns shelling it.',
env: { planet: [-0.5, -0.2, -0.85], pr: 160, pc: [0x4a90c0, 0x10304a], ring: true, ast: 30, ac: [0, 0, -400], as: [700, 200, 500], amin: 4, amax: 18 },
setup: function (S, m) {
S.wing(true);
S.station(-120, -20, -320);
S.spawn(3, 150, 40, -520, { shell: 1 }); S.spawn(3, -380, 60, -560, { shell: 1 });
S.obj('Protect Anchor Station', '');
S.hint('stn', 'The sentry platforms shell the station. Bombers will follow. Keep the station alive.', '', 9);
},
step: function (S, m) {
const done = runWaves(S, m, WV.anchor);
const st = S.stn;
S.objSub('Station ' + Math.ceil(100 * st.hp / st.maxHp) + '%   Wave ' + m.wi + ' / 4   Sentries ' + S.count(3));
if (done && S.count(3) === 0) { S.bonus(Math.round(1500 * st.hp / st.maxHp), 'Station intact'); S.win('Anchor Station is safe.'); }
} },
{ name: 'Static Veil', pal: 3, par: 160, reserves: 1, fog: [30, 250], jam: true, brief: 'Sensors jammed. Slip past the watcher drones in the nebula and kill the jammer.',
env: { planet: [0.2, 0.6, -0.75], pr: 90, pc: [0x7ab0a0, 0x203830], ring: false, ast: 60, ac: [0, 0, -500], as: [400, 160, 520], amin: 4, amax: 26 },
setup: function (S, m) {
S.spawn(7, 20, 10, -980, {});
S.spawn(3, 70, 20, -960, { sleep: true }); S.spawn(3, -40, -20, -1010, { sleep: true });
S.spawn(8, 0, 0, -260, { patrol: [[-90, 0, -260], [90, 10, -260]] });
S.spawn(8, 0, 0, -420, { patrol: [[60, -30, -400], [-60, 30, -440]] });
S.spawn(8, 0, 0, -560, { patrol: [[-80, 20, -560], [40, -20, -600], [100, 30, -540]] });
S.spawn(8, 0, 0, -720, { patrol: [[80, 0, -700], [-80, 0, -740]] });
S.spawn(8, 0, 0, -850, { patrol: [[0, 70, -850], [0, -60, -860]] });
S.spawn(8, 0, 0, -900, { patrol: [[-120, 0, -880], [120, 20, -920]] });
S.clear(20, 10, -980, 20, 10, -980, 30);
S.obj('Destroy the jammer relay', 'Undetected');
S.hint('stealth', 'Sensors are jammed. Fly slow (S) to shrink the watchers\u2019 detection rings. Boosting and firing make you loud.', 'Fly slow to shrink the watchers\u2019 detection rings. Boosting and firing make you loud.', 12);
},
step: function (S, m) {
S.objSub(S.alarmed() ? 'DETECTED: reinforcements inbound' : 'Undetected   Signature ' + Math.round(S.signature() * 100) + '%');
if (S.count(7) === 0) { if (!S.alarmed()) S.bonus(1500, 'Ghost bonus: never detected'); S.win('Jammer destroyed. Sensors are back.'); }
} },
{ name: 'Hull Breaker', pal: 2, par: 260, reserves: 1, brief: 'A Basalt-class warship is moving on the colonies. Drop its shields and burn its reactor.',
env: { planet: [-0.7, 0.3, -0.6], pr: 170, pc: [0xb070d0, 0x301048], ring: true, ast: 40, ac: [0, 0, -500], as: [700, 220, 500], amin: 4, amax: 20 },
setup: function (S, m) {
S.wing(true);
m.cap = S.capital(0, 60, 0, -480, 1.4, { path: [[-500, 0, -620], [500, 0, -380]] });
S.group(0, 4, 40, 30, -360, 30);
S.obj('Destroy the shield generators', '0 / 2');
S.hint('cap', 'Warship hulls are armored. Target the blue SHIELD GENERATORS first; their turrets are orange.', '', 10);
},
step: function (S, m) {
const c = m.cap;
if (c.gens > 0) S.objSub((2 - c.gens) + ' / 2');
else if (!c.dead) {
if (!m.h2) { m.h2 = true; S.obj('Shields down! Destroy the reactor', 'Fly down the trench'); S.hint('trench', 'The reactor glows red in the trench along the spine. Dive in and fire!', '', 9); }
}
if (S.t > 30 && S.count(0) < 2 && !c.dead && S.t - (m.rt || 0) > 40) { m.rt = S.t; S.spawnWave({ spawn: [[0, 3]] }); }
if (c.dead) S.win('Warship destroyed.');
} },
{ name: 'Glass Mile', pal: 1, par: 0, reserves: 1, brief: 'Escort a freighter through a seeded minefield. Clear the mines before it reaches them.',
env: { planet: [0.6, -0.3, -0.7], pr: 120, pc: [0xd08050, 0x502010], ring: false, ast: 60, ac: [0, 0, -700], as: [600, 180, 600], amin: 4, amax: 24 },
setup: function (S, m) {
S.wing(true);
const path = [[-40, -10, -60], [-60, 0, -420], [40, 20, -820], [0, 0, -1300]];
S.freighter(path, 13);
const rg = mkRng(91);
for (let i = 0; i < 18; i++) {
const t = 0.12 + 0.85 * (i / 18), seg = Math.min(2, Math.floor(t * 3)), u = t * 3 - seg;
const a = path[seg], b = path[seg + 1];
S.mine(lerp(a[0], b[0], u) + (rg() * 2 - 1) * 14, lerp(a[1], b[1], u) + (rg() * 2 - 1) * 10, lerp(a[2], b[2], u), { marked: true });
}
S.obj('Clear the minefield ahead of the freighter', '');
S.hint('mines', 'Mines on the route are marked in yellow. Shoot them from range: they blast anything close.', '', 10);
},
step: function (S, m) {
const clear = runWaves(S, m, WV.glass);
const f = S.frt;
if (clear && S.count(4) === 0 && !m.sprint && !f.arrived && f.prog < 0.9) { m.sprint = true; f.spd *= 2.4; S.toast('FIELD CLEAR: FREIGHTER BURNING FOR THE BUOY', UI.ok); }
S.objSub('Freighter ' + Math.ceil(100 * f.hp / f.maxHp) + '%   Mines ' + S.count(4) + '   Route ' + Math.floor(f.prog * 100) + '%');
if (f.arrived) { S.bonus(Math.round(1500 * f.hp / f.maxHp), 'Freighter intact'); S.win('The freighter made it through.'); }
} },
{ name: 'Rockfall', pal: 2, par: 280, reserves: 1, brief: 'Survive four waves inside a dense asteroid field. Use the rocks as cover.',
env: { planet: [0.1, -0.7, -0.7], pr: 150, pc: [0xa050a0, 0x301030], ring: true, ast: 150, ac: [0, 0, -250], as: [520, 220, 520], amin: 5, amax: 30 },
setup: function (S, m) { S.wing(true); S.obj('Survive the waves', 'Wave 0 / 4'); },
step: function (S, m) {
const done = runWaves(S, m, WV.rock);
S.objSub('Wave ' + m.wi + ' / 4   Hostiles ' + S.left());
if (done) S.win('The field is yours.');
} },
{ name: 'Cut the Engines', pal: 0, par: 260, reserves: 1, timer: 160, brief: 'A warship is charging its jump drive. Kill both engines before it escapes.',
env: { planet: [0.5, 0.3, -0.8], pr: 140, pc: [0x50a0c0, 0x103048], ring: false, ast: 30, ac: [0, 0, -500], as: [700, 200, 500], amin: 4, amax: 18 },
setup: function (S, m) {
S.wing(true);
m.cap = S.capital(0, -40, 10, -430, -1.2, { path: [[600, 10, -560], [-600, 10, -360]] });
S.group(0, 4, 0, 30, -320, 30);
S.obj('Destroy both engines before the jump', '0 / 2');
S.hint('eng', 'Engines are the purple glows at the stern. Stop the jump, then finish the ship.', '', 9);
},
step: function (S, m) {
const c = m.cap;
if (!m.stop) {
S.objSub((2 - c.engs) + ' / 2');
if (c.engs === 0) { m.stop = true; S.stopTimer(); S.obj('Jump stopped! Drop the shields', ''); S.toast('JUMP DRIVE OFFLINE', UI.ok); }
else if (S.timeLeft() <= 0) S.fail('The warship jumped away.');
} else if (c.gens > 0) S.objSub('Generators ' + (2 - c.gens) + ' / 2');
else if (!c.dead) S.obj('Destroy the reactor', 'Fly down the trench');
if (S.t > 35 && S.count(0) < 2 && !c.dead && S.t - (m.rt || 0) > 40) { m.rt = S.t; S.spawnWave({ spawn: [[0, 3]] }); }
if (c.dead) S.win('Warship destroyed before the jump.');
} },
{ name: 'Lantern Watch', pal: 1, par: 300, reserves: 1, brief: 'A warship is closing on Lantern Station and launching bombers. Stop it.',
env: { planet: [-0.4, 0.5, -0.75], pr: 130, pc: [0xc06040, 0x401808], ring: true, ast: 34, ac: [0, 0, -500], as: [700, 220, 600], amin: 4, amax: 20 },
setup: function (S, m) {
S.wing(true);
S.station(150, 0, -200);
m.cap = S.capital(0, -300, 20, -900, 0.6, { path: [[60, 0, -360]], hangar: 26, stopAt: 240 });
S.obj('Protect Lantern Station: destroy the warship', 'Generators 0 / 2');
S.hint('bay', 'The warship launches bombers from its belly. Kill bombers near the station, then hit the generators.', '', 9);
},
step: function (S, m) {
const c = m.cap, st = S.stn;
if (c.gens > 0) S.objSub('Generators ' + (2 - c.gens) + ' / 2   Station ' + Math.ceil(100 * st.hp / st.maxHp) + '%');
else if (!c.dead) { if (!m.h2) { m.h2 = true; S.obj('Shields down! Destroy the reactor', ''); } S.objSub('Station ' + Math.ceil(100 * st.hp / st.maxHp) + '%'); }
if (c.dead) { S.bonus(Math.round(1500 * st.hp / st.maxHp), 'Station intact'); S.win('Lantern Station is safe.'); }
} },
{ name: 'Blind Current', pal: 3, par: 240, reserves: 1, fog: [30, 260], jam: true, brief: 'Three jammer relays hide in a drifting nebula. Find and destroy them all.',
env: { planet: [-0.3, 0.6, -0.7], pr: 100, pc: [0x80b0a0, 0x203830], ring: false, ast: 110, ac: [0, 0, -500], as: [640, 200, 520], amin: 4, amax: 28 },
setup: function (S, m) {
const R = [[-380, 20, -520], [360, -30, -620], [20, 50, -980]];
for (let i = 0; i < R.length; i++) {
S.spawn(7, R[i][0], R[i][1], R[i][2], {}); S.clear(R[i][0], R[i][1], R[i][2], R[i][0], R[i][1], R[i][2], 34);
S.spawn(3, R[i][0] + 50, R[i][1] + 20, R[i][2] + 30, { sleep: true });
}
const W8 = [[[-200, 0, -300], [-60, 20, -360]], [[100, 10, -280], [250, -20, -380]], [[-300, 30, -440], [-420, -10, -600]],
[[300, 0, -500], [420, -40, -700]], [[-100, 40, -650], [120, 30, -700]], [[0, 0, -850], [80, 60, -1000]], [[-80, 20, -900], [-60, 80, -1060]],
[[-250, -40, -700], [-150, 40, -800]], [[200, 20, -820], [260, -20, -700]]];
for (let i = 0; i < W8.length; i++) S.spawn(8, W8[i][0][0], W8[i][0][1], W8[i][0][2], { patrol: W8[i] });
S.obj('Destroy the jammer relays', '0 / 3');
S.hint('stealth2', 'Relays glow red through the fog. Stay slow and quiet near watchers, or fight your way in.', '', 10);
},
step: function (S, m) {
S.objSub((3 - S.count(7)) + ' / 3' + (S.alarmed() ? '   DETECTED' : '   Undetected'));
if (S.count(7) === 0) { if (!S.alarmed()) S.bonus(2000, 'Ghost bonus: never detected'); S.win('All relays down.'); }
} },
{ name: 'Twin Keels', pal: 4, par: 340, reserves: 2, brief: 'Two warships are running escort for each other. Break both of them.',
env: { planet: [0.6, 0.2, -0.75], pr: 170, pc: [0xd0a050, 0x503010], ring: true, ast: 40, ac: [0, 0, -600], as: [800, 240, 600], amin: 4, amax: 22 },
setup: function (S, m) {
S.wing(true);
m.a = S.capital(0, -150, 0, -560, 0.2, { path: [[-150, 0, -900], [-150, 0, -300]] });
m.b = S.capital(0, 170, 30, -680, -0.2, { path: [[170, 30, -300], [170, 30, -900]] });
S.group(0, 4, 0, 20, -400, 40);
S.obj('Destroy both warships', '0 / 2');
},
step: function (S, m) {
S.objSub(((m.a.dead ? 1 : 0) + (m.b.dead ? 1 : 0)) + ' / 2');
if (S.t > 30 && S.count(0) + S.count(2) < 3 && S.t - (m.rt || 0) > 38) { m.rt = S.t; S.spawnWave({ spawn: m.wv ? [[0, 3], [2, 1]] : [[0, 4]] }); m.wv = !m.wv; }
if (m.a.dead && m.b.dead) S.win('Both keels broken.');
} },
{ name: 'Heart of the Lattice', pal: 4, par: 420, reserves: 2, brief: 'The Lattice flagship. Four generators, a wall of turrets, a reactor deep in the trench.',
env: { planet: [-0.5, -0.25, -0.83], pr: 210, pc: [0xe0b060, 0x603808], ring: false, ast: 50, ac: [0, 0, -700], as: [900, 260, 600], amin: 4, amax: 26 },
setup: function (S, m) {
S.wing(true);
m.cap = S.capital(1, 0, -10, -720, 0.35, { path: [[-500, -10, -800], [500, -10, -640]], hangar: 22 });
S.spawn(2, -260, 40, -520, {}); S.spawn(2, 260, -30, -540, {});
S.group(0, 4, 0, 30, -420, 40);
S.obj('Destroy the flagship\u2019s shield generators', '0 / 4');
S.hint('final', 'This is it, Lancer. Generators first, then the reactor. Use your missiles and lance.', '', 8);
},
step: function (S, m) {
const c = m.cap;
if (c.gens > 0) S.objSub((4 - c.gens) + ' / 4');
else if (!c.dead && !m.h2) { m.h2 = true; S.obj('Reactor exposed! Make the trench run', ''); S.objSub(''); S.toast('FLAGSHIP SHIELDS DOWN', UI.ok); }
if (S.t > 30 && S.count(0) < 3 && !c.dead && S.t - (m.rt || 0) > 34) { m.rt = S.t; S.spawnWave({ spawn: [[0, 4], [1, 1]] }); }
if (c.dead) S.win('The Lattice flagship is gone. The lanes are free.');
} },
];
const NM = MISSIONS.length;

function thumb(ctx, w, h) {
ctx.save();
ctx.scale(w / 480, h / 300);
let g = ctx.createLinearGradient(0, 0, 480, 300);
g.addColorStop(0, '#060818'); g.addColorStop(0.55, '#14082a'); g.addColorStop(1, '#02030a');
ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 300);
const blobs = [[110, 70, 190, 'rgba(110,40,170,0.55)'], [380, 220, 210, 'rgba(20,130,170,0.42)'], [300, 50, 130, 'rgba(220,70,100,0.33)'], [40, 250, 120, 'rgba(60,90,200,0.3)']];
for (let i = 0; i < blobs.length; i++) {
const b = blobs[i];
g = ctx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
g.addColorStop(0, b[3]); g.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 300);
}
const r = mkRng(7);
for (let i = 0; i < 140; i++) {
const a = 0.3 + r() * 0.7;
ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')';
const s = r() < 0.08 ? 2 : 1;
ctx.fillRect(Math.floor(r() * 480), Math.floor(r() * 300), s, s);
}
g = ctx.createRadialGradient(40, 330, 20, 60, 340, 170);
g.addColorStop(0, '#2a5a7a'); g.addColorStop(0.7, '#123048'); g.addColorStop(1, '#081422');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(60, 340, 150, 0, TAU); ctx.fill();
ctx.strokeStyle = 'rgba(140,220,255,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(60, 340, 150, -1.25, -0.25); ctx.stroke();
function P(pts, col) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
P([[160, 72], [470, 18], [480, 40], [480, 128], [300, 140], [170, 92]], '#262b38');
P([[160, 72], [470, 18], [480, 30], [180, 80]], '#3d4456');
P([[220, 92], [480, 70], [480, 84], [226, 104]], '#1a1e28');
P([[250, 84], [470, 52], [472, 60], [252, 92]], '#0e1118');
for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 ? 'rgba(255,90,70,0.9)' : 'rgba(255,200,120,0.9)'; ctx.fillRect(260 + i * 22, 112 - i * 2.4, 6, 2); }
ctx.fillStyle = '#5cc8ff'; ctx.shadowColor = '#5cc8ff'; ctx.shadowBlur = 10;
ctx.beginPath(); ctx.arc(300, 64, 7, Math.PI, 0); ctx.fill();
ctx.beginPath(); ctx.arc(410, 44, 6, Math.PI, 0); ctx.fill();
ctx.shadowBlur = 0;
const ex = 352, ey = 76;
g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 70);
g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.18, 'rgba(255,200,90,0.95)'); g.addColorStop(0.5, 'rgba(255,90,40,0.5)'); g.addColorStop(1, 'rgba(255,60,30,0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 70, 0, TAU); ctx.fill();
ctx.fillStyle = '#1b1f29';
const sh = [[-46, -20, 8], [40, -30, 6], [52, 14, 7], [-30, 30, 6], [10, -46, 5], [-60, 8, 5], [70, -6, 4]];
for (let i = 0; i < sh.length; i++) { const q = sh[i]; P([[ex + q[0], ey + q[1]], [ex + q[0] + q[2], ey + q[1] + 2], [ex + q[0] + 2, ey + q[1] + q[2]]], '#1b1f29'); }
const dr = [[120, 150, 1], [205, 128, 0.8], [96, 112, 0.7]];
for (let i = 0; i < dr.length; i++) {
const d = dr[i], k = d[2];
P([[d[0] - 12 * k, d[1]], [d[0], d[1] - 6 * k], [d[0] + 12 * k, d[1]], [d[0], d[1] + 6 * k]], '#3a404e');
P([[d[0] - 12 * k, d[1]], [d[0], d[1] - 6 * k], [d[0], d[1]]], '#555d70');
ctx.fillStyle = '#ff3b30'; ctx.shadowColor = '#ff3b30'; ctx.shadowBlur = 8;
ctx.beginPath(); ctx.arc(d[0], d[1], 2.2 * k, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
}
g = ctx.createRadialGradient(170, 200, 0, 170, 200, 26);
g.addColorStop(0, 'rgba(255,240,200,0.95)'); g.addColorStop(0.4, 'rgba(255,150,60,0.6)'); g.addColorStop(1, 'rgba(255,100,40,0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(170, 200, 26, 0, TAU); ctx.fill();
P([[160, 190], [168, 186], [164, 196]], '#2b303c'); P([[180, 206], [188, 208], [182, 214]], '#2b303c');
ctx.strokeStyle = 'rgba(140,240,255,0.95)'; ctx.lineWidth = 2.6; ctx.shadowColor = '#7cf3ff'; ctx.shadowBlur = 10;
const tr = [[240, 236, 300, 150], [282, 240, 336, 160], [250, 210, 290, 150], [300, 214, 330, 168]];
for (let i = 0; i < tr.length; i++) { ctx.beginPath(); ctx.moveTo(tr[i][0], tr[i][1]); ctx.lineTo(tr[i][2], tr[i][3]); ctx.stroke(); }
ctx.strokeStyle = 'rgba(255,90,70,0.9)'; ctx.shadowColor = '#ff5040';
ctx.beginPath(); ctx.moveTo(120, 160); ctx.lineTo(150, 196); ctx.stroke();
ctx.shadowBlur = 0;
ctx.save();
ctx.translate(268, 246); ctx.rotate(-0.32);
g = ctx.createRadialGradient(-22, 14, 0, -22, 14, 26); g.addColorStop(0, 'rgba(120,230,255,0.95)'); g.addColorStop(1, 'rgba(80,200,255,0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-22, 14, 26, 0, TAU); ctx.fill();
g = ctx.createRadialGradient(22, 14, 0, 22, 14, 26); g.addColorStop(0, 'rgba(120,230,255,0.95)'); g.addColorStop(1, 'rgba(80,200,255,0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(22, 14, 26, 0, TAU); ctx.fill();
P([[-100, 10], [-30, -6], [30, -6], [100, 10], [96, 16], [-96, 16]], '#aab3c4');
P([[-100, 10], [-30, -6], [-24, 2], [-96, 16]], '#d8dee8');
P([[100, 10], [30, -6], [24, 2], [96, 16]], '#8a93a6');
P([[-100, 10], [-92, -14], [-88, 12]], '#5cc8ff'); P([[100, 10], [92, -14], [88, 12]], '#5cc8ff');
P([[-16, -30], [16, -30], [24, 16], [-24, 16]], '#dfe4ee');
P([[-16, -30], [0, -36], [16, -30], [8, -18], [-8, -18]], '#eef2f8');
P([[-9, -22], [9, -22], [7, -10], [-7, -10]], '#16324c');
P([[-30, 6], [-14, 6], [-14, 20], [-30, 20]], '#3a4252'); P([[30, 6], [14, 6], [14, 20], [30, 20]], '#3a4252');
ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(-22, 14, 5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(22, 14, 5, 0, TAU); ctx.fill();
ctx.restore();
g = ctx.createRadialGradient(240, 150, 120, 240, 150, 300);
g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 300);
ctx.restore();
}

function mount(root, api) {
function showFallback(msg) {
const box = document.createElement('div');
box.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;' +
'padding:24px;box-sizing:border-box;text-align:center;background:#070a16;color:#C9D3E3;font:600 17px ' + FONT_B + ';';
box.textContent = msg;
root.appendChild(box);
return box;
}
if (!window.THREE) {
let box = showFallback("The 3D engine didn't load. Check your internet connection and press Restart.");
let inner = null;
const removeBox = function () { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; };
return {
destroy: function () { if (inner) inner.destroy(); inner = null; removeBox(); },
restart: function () {
if (inner) { inner.restart(); return; }
if (window.THREE) { removeBox(); inner = mountGame(root, api, showFallback); }
},
};
}
return mountGame(root, api, showFallback);
}

function mountGame(root, api, showFallback) {
const THREE = window.THREE;

const hud = document.createElement('canvas');
const glc = document.createElement('canvas');
const baseCss = 'position:absolute;left:0;top:0;display:block;width:100%;height:100%;touch-action:none;outline:none;';
hud.style.cssText = baseCss + 'z-index:2;';
glc.style.cssText = baseCss + 'z-index:1;pointer-events:none;';
hud.tabIndex = 0;
hud.setAttribute('aria-label', 'Void Lancer');
root.appendChild(hud);
root.appendChild(glc);
let renderer = null;
try {
renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, powerPreference: 'high-performance', alpha: false });
} catch (err) { renderer = null; }
if (!renderer) {
if (hud.parentNode) hud.parentNode.removeChild(hud);
if (glc.parentNode) glc.parentNode.removeChild(glc);
const box = showFallback('This game needs WebGL (3D graphics), which is turned off in this browser.');
return { destroy: function () { if (box.parentNode) box.parentNode.removeChild(box); }, restart: function () {} };
}
const hctx = hud.getContext('2d');
const maxPR = Math.min(window.devicePixelRatio || 1, 1);
let pixelRatio = maxPR;
renderer.setPixelRatio(pixelRatio);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 1);
const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

let destroyed = false, raf = 0;
const disposables = new Set();
function own(o) { disposables.add(o); return o; }
function snd(f, d, o) { try { api.tone(f, d, o); } catch (e) { /* sound is optional */ } }
function nz(d, o) { try { api.noise(d, o); } catch (e) { /* sound is optional */ } }
function tri(f, d, v, delay) { snd(f, d, { type: 'triangle', vol: v, delay: delay || 0 }); }
function sq(f, d, v, slide, delay) { snd(f, d, { type: 'square', vol: v, slide: slide || 0, delay: delay || 0 }); }

const skyScene = new THREE.Scene();
const scene = new THREE.Scene();
const fogCol = new THREE.Color(0x061322);
scene.fog = new THREE.Fog(fogCol.getHex(), 320, 590);
const BASE_FOV = 68;
const camera = new THREE.PerspectiveCamera(BASE_FOV, 16 / 10, 0.3, 600);
camera.position.set(0, 4, 14);
const hemi = new THREE.HemisphereLight(0x9fd8ff, 0x101828, 0.6);
scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffffff, 1.05);
sunL.position.set(0.5, 0.6, 0.4);
scene.add(sunL);
scene.add(sunL.target);

const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3(), V5 = new THREE.Vector3();
const V6 = new THREE.Vector3(), V7 = new THREE.Vector3(), V8 = new THREE.Vector3(), VP = new THREE.Vector3();
const Q1 = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), Q3 = new THREE.Quaternion();
const M1 = new THREE.Matrix4(), M2 = new THREE.Matrix4(), E1 = new THREE.Euler();
const SC = new THREE.Vector3(1, 1, 1), C1 = new THREE.Color();
const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1), V0 = new THREE.Vector3(0, 0, 0);
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
const SUN = new THREE.Vector3(0.5, 0.6, 0.4).normalize();

function canvasTex(w, h, draw) {
const c = document.createElement('canvas');
c.width = w; c.height = h;
const x = c.getContext('2d');
draw(x, w, h);
return own(new THREE.CanvasTexture(c));
}
function radial(x, s, stops) {
const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
x.fillStyle = g; x.fillRect(0, 0, s, s);
}
const texDot = canvasTex(64, 64, function (x, s) { radial(x, s, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]); });
const texGlow = canvasTex(128, 128, function (x, s) { radial(x, s, [[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.8)'], [0.4, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)']]); });
const texCloud = canvasTex(256, 256, function (x, s) {
const r = mkRng(4);
for (let i = 0; i < 46; i++) {
const a = r() * TAU, d = r() * s * 0.28, cx = s / 2 + Math.cos(a) * d, cy = s / 2 + Math.sin(a) * d, rad = s * (0.08 + r() * 0.2);
const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
g.addColorStop(0, 'rgba(255,255,255,' + (0.06 + r() * 0.1).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
x.fillStyle = g; x.fillRect(0, 0, s, s);
}
});
const texHex = canvasTex(128, 128, function (x, s) {
x.fillStyle = 'rgba(0,0,0,1)'; x.fillRect(0, 0, s, s);
x.strokeStyle = 'rgba(160,220,255,0.9)'; x.lineWidth = 2;
const R = 16, hgt = R * Math.sqrt(3);
for (let row = -1; row < 6; row++) for (let col = -1; col < 6; col++) {
const cx = col * R * 1.5 * 1.0 + 0, cy = row * hgt + (col & 1 ? hgt / 2 : 0);
x.beginPath();
for (let k = 0; k <= 6; k++) { const a = k * Math.PI / 3; const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R; if (k) x.lineTo(px, py); else x.moveTo(px, py); }
x.stroke();
}
});
texHex.wrapS = texHex.wrapT = THREE.RepeatWrapping;
texHex.repeat.set(2, 10);
const planetCanvas = document.createElement('canvas');
planetCanvas.width = 256; planetCanvas.height = 128;
const planetTex = own(new THREE.CanvasTexture(planetCanvas));

const SKY_R = 540;
const skyGeo = own(new THREE.SphereGeometry(SKY_R, 40, 22));
const skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
const sky = new THREE.Mesh(skyGeo, own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
sky.renderOrder = 0; sky.frustumCulled = false;
skyScene.add(sky);
const STAR_N = 1500;
const starGeo = own(new THREE.BufferGeometry());
(function () {
const p = new Float32Array(STAR_N * 3), c = new Float32Array(STAR_N * 3), r = mkRng(17);
for (let i = 0; i < STAR_N; i++) {
const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
p[i * 3] = Math.cos(a) * s * 500; p[i * 3 + 1] = u * 500; p[i * 3 + 2] = Math.sin(a) * s * 500;
const b = 0.35 + Math.pow(r(), 3) * 0.65, t = r();
c[i * 3] = b * (t < 0.2 ? 1 : 0.85); c[i * 3 + 1] = b * 0.9; c[i * 3 + 2] = b * (t > 0.7 ? 1 : 0.8);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(p, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(c, 3));
})();
const stars = new THREE.Points(starGeo, own(new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true })));
stars.renderOrder = 1; stars.frustumCulled = false;
skyScene.add(stars);
const NEB_N = 6, nebs = [], nebDir = [];
for (let i = 0; i < NEB_N; i++) {
const s = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: texCloud, color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
s.renderOrder = 2; s.frustumCulled = false;
skyScene.add(s); nebs.push(s); nebDir.push(new THREE.Vector3(0, 0, -1));
}
const sunSpr = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: texGlow, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
sunSpr.scale.set(170, 170, 1); sunSpr.renderOrder = 3; sunSpr.frustumCulled = false;
skyScene.add(sunSpr);
const planetGeo = own(new THREE.SphereGeometry(1, 40, 24));
const planetCol = new Float32Array(planetGeo.attributes.position.count * 3);
planetGeo.setAttribute('color', new THREE.BufferAttribute(planetCol, 3));
const planet = new THREE.Mesh(planetGeo, own(new THREE.MeshBasicMaterial({ map: planetTex, vertexColors: true, fog: false })));
planet.renderOrder = 4; planet.frustumCulled = false;
skyScene.add(planet);
const halo = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: texGlow, color: 0x88ccff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
halo.renderOrder = 3; halo.frustumCulled = false;
skyScene.add(halo);
const pRingGeo = own(new THREE.RingGeometry(1.35, 2.2, 72, 3));
const pRingCol = new Float32Array(pRingGeo.attributes.position.count * 3);
pRingGeo.setAttribute('color', new THREE.BufferAttribute(pRingCol, 3));
const pRing = new THREE.Mesh(pRingGeo, own(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, fog: false })));
pRing.renderOrder = 5; pRing.frustumCulled = false;
skyScene.add(pRing);
const planetDir = new THREE.Vector3(0, 0, -1);
let planetR = 120;

function paintEnv(mi, pal, env, fog) {
const P = PALS[pal], bg = hexRGB(P.bg), c1 = hexRGB(P.c1), c2 = hexRGB(P.c2), c3 = hexRGB(P.c3);
const seed = 100 + mi * 13;
const rg = mkRng(seed);
SUN.set(rg() * 2 - 1, 0.25 + rg() * 0.6, rg() * 2 - 1).normalize();
V1.set(rg() * 2 - 1, (rg() * 2 - 1) * 0.4, rg() * 2 - 1).normalize(); // nebula band axis
const pos = skyGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
const x = pos.getX(i) / SKY_R, y = pos.getY(i) / SKY_R, z = pos.getZ(i) / SKY_R;
const n1 = fbm3(x * 2.1 + 3, y * 2.1, z * 2.1, seed), n2 = fbm3(x * 4.3, y * 4.3 + 5, z * 4.3, seed + 7);
const d = x * V1.x + y * V1.y + z * V1.z, band = Math.exp(-d * d * 5);
const a = smooth(0.42, 0.78, n1) * (0.35 + band * 0.9), b = smooth(0.5, 0.85, n2) * band * 0.85, c = Math.pow(band, 6) * smooth(0.45, 0.7, n1) * 0.35;
const sd = Math.max(0, x * SUN.x + y * SUN.y + z * SUN.z), sg = Math.pow(sd, 12) * 0.25;
skyCol[i * 3] = bg[0] + c1[0] * a + c2[0] * b + c3[0] * c + sg;
skyCol[i * 3 + 1] = bg[1] + c1[1] * a + c2[1] * b + c3[1] * c + sg * 0.9;
skyCol[i * 3 + 2] = bg[2] + c1[2] * a + c2[2] * b + c3[2] * c + sg * 0.8;
}
skyGeo.attributes.color.needsUpdate = true;
for (let i = 0; i < NEB_N; i++) {
const t = rg() * TAU, off = (rg() * 2 - 1) * 0.5;
V2.set(Math.cos(t), off, Math.sin(t));
V3.copy(V1).multiplyScalar(-V2.dot(V1)); V2.add(V3).normalize();
nebDir[i].copy(V2);
const s = 260 + rg() * 260;
nebs[i].scale.set(s, s * (0.6 + rg() * 0.5), 1);
nebs[i].material.color.setHex(i % 3 === 0 ? P.c3 : i % 2 ? P.c2 : P.c1);
nebs[i].material.opacity = 0.18 + rg() * 0.25;
nebs[i].material.rotation = rg() * TAU;
}
sunSpr.material.color.setHex(P.sun);
sunL.color.setHex(P.sun); sunL.position.copy(SUN).multiplyScalar(100);
hemi.color.setHex(P.sky); hemi.groundColor.setHex(P.gnd);
fogCol.setHex(P.fog); scene.fog.color.copy(fogCol);
const fg = fog || [320, 590];
scene.fog.near = fg[0]; scene.fog.far = fg[1];
FX.uni.uFogNear.value = SMK.uni.uFogNear.value = fg[0];
FX.uni.uFogFar.value = SMK.uni.uFogFar.value = fg[1];
const pe = env;
planetDir.set(pe.planet[0], pe.planet[1], pe.planet[2]).normalize();
planetR = pe.pr;
const px = planetCanvas.getContext('2d'), pa = hexRGB(pe.pc[0]), pb = hexRGB(pe.pc[1]);
const rp = mkRng(seed + 3);
for (let yy = 0; yy < 128; yy += 2) {
const t = 0.5 + 0.5 * Math.sin(yy * 0.11 + rp() * 0.6) * Math.sin(yy * 0.037 + 1.3);
const r = Math.floor(255 * lerp(pb[0], pa[0], t)), g = Math.floor(255 * lerp(pb[1], pa[1], t)), bl = Math.floor(255 * lerp(pb[2], pa[2], t));
px.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')'; px.fillRect(0, yy, 256, 2);
}
for (let i = 0; i < 40; i++) {
px.fillStyle = 'rgba(255,255,255,' + (0.03 + rp() * 0.06).toFixed(3) + ')';
px.beginPath(); px.ellipse(rp() * 256, rp() * 128, 10 + rp() * 40, 2 + rp() * 5, 0, 0, TAU); px.fill();
}
planetTex.needsUpdate = true;
const pp = planetGeo.attributes.position;
for (let i = 0; i < pp.count; i++) {
const nx = pp.getX(i), ny = pp.getY(i), nzz = pp.getZ(i);
const l = Math.max(0, nx * SUN.x + ny * SUN.y + nzz * SUN.z), vdot = -(nx * planetDir.x + ny * planetDir.y + nzz * planetDir.z);
const rim = Math.pow(1 - Math.max(0, vdot), 3) * 0.6 * (0.3 + l);
const k = 0.07 + l * 1.05;
planetCol[i * 3] = k + rim * 0.6; planetCol[i * 3 + 1] = k + rim * 0.8; planetCol[i * 3 + 2] = k + rim;
}
planetGeo.attributes.color.needsUpdate = true;
halo.material.color.setRGB(pa[0] * 0.6 + 0.3, pa[1] * 0.6 + 0.3, pa[2] * 0.6 + 0.35);
halo.scale.set(planetR * PL_K * 2.7, planetR * PL_K * 2.7, 1);
pRing.visible = !!pe.ring;
const rp2 = pRingGeo.attributes.position;
for (let i = 0; i < rp2.count; i++) {
const r = Math.hypot(rp2.getX(i), rp2.getY(i)), b = 0.5 + 0.5 * Math.sin(r * 23), lit = 0.4 + 0.6 * b;
pRingCol[i * 3] = lerp(pb[0], pa[0], b) * lit + 0.15; pRingCol[i * 3 + 1] = lerp(pb[1], pa[1], b) * lit + 0.15; pRingCol[i * 3 + 2] = lerp(pb[2], pa[2], b) * lit + 0.15;
}
pRingGeo.attributes.color.needsUpdate = true;
pRing.rotation.set(1.2 + rg() * 0.3, rg() * 0.6, rg() * 0.5);
}
const PL_D = 300, PL_K = 0.65;
function placeSky() {
const c = camera.position, pr = planetR * PL_K;
sky.position.copy(c); stars.position.copy(c);
for (let i = 0; i < NEB_N; i++) nebs[i].position.copy(c).addScaledVector(nebDir[i], 505);
sunSpr.position.copy(c).addScaledVector(SUN, 500);
planet.position.copy(c).addScaledVector(planetDir, PL_D);
planet.scale.set(pr, pr, pr);
halo.position.copy(planet.position).addScaledVector(planetDir, 20);
pRing.position.copy(planet.position);
pRing.scale.set(pr, pr, pr);
}

function mtx(x, y, z, rx, ry, rz, s) {
E1.set(rx || 0, ry || 0, rz || 0, 'XYZ');
Q1.setFromEuler(E1);
V1.set(x || 0, y || 0, z || 0);
if (s === undefined) SC.set(1, 1, 1); else if (typeof s === 'number') SC.set(s, s, s); else SC.set(s[0], s[1], s[2]);
return M1.compose(V1, Q1, SC);
}
function Mesher() { this.p = []; this.c = []; }
Mesher.prototype.add = function (geo, col, x, y, z, rx, ry, rz, s) {
const g = geo.index ? geo.toNonIndexed() : geo;
g.applyMatrix4(mtx(x, y, z, rx, ry, rz, s));
const p = g.attributes.position.array, c = hexRGB(col);
for (let i = 0; i < p.length; i++) this.p.push(p[i]);
for (let i = 0; i < p.length / 3; i++) this.c.push(c[0], c[1], c[2]);
if (g !== geo) g.dispose();
geo.dispose();
return this;
};
Mesher.prototype.tri = function (a, b, c, col) {
const k = hexRGB(col);
this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
for (let i = 0; i < 3; i++) this.c.push(k[0], k[1], k[2]);
};
Mesher.prototype.quad = function (a, b, c, d, col) { this.tri(a, b, c, col); this.tri(a, c, d, col); };
Mesher.prototype.block = function (k, col, colTop) {
this.quad(k[0], k[3], k[2], k[1], col); this.quad(k[4], k[5], k[6], k[7], colTop === undefined ? col : colTop);
this.quad(k[0], k[1], k[5], k[4], col); this.quad(k[1], k[2], k[6], k[5], col);
this.quad(k[2], k[3], k[7], k[6], col); this.quad(k[3], k[0], k[4], k[7], col);
};
Mesher.prototype.build = function () {
const p = new Float32Array(this.p), c = new Float32Array(this.c), n = new Float32Array(p.length);
for (let i = 0; i < p.length; i += 9) {
const ax = p[i + 3] - p[i], ay = p[i + 4] - p[i + 1], az = p[i + 5] - p[i + 2];
const bx = p[i + 6] - p[i], by = p[i + 7] - p[i + 1], bz = p[i + 8] - p[i + 2];
let nx = ay * bz - az * by, ny = az * bx - ax * bz, nn = ax * by - ay * bx;
const l = Math.sqrt(nx * nx + ny * ny + nn * nn);
if (l < 1e-9) { nx = 0; ny = 1; nn = 0; } else { nx /= l; ny /= l; nn /= l; }
for (let k = 0; k < 9; k += 3) { n[i + k] = nx; n[i + k + 1] = ny; n[i + k + 2] = nn; }
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
geo.setAttribute('normal', new THREE.BufferAttribute(n, 3));
geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
geo.computeBoundingSphere();
return own(geo);
};
const G = {
box: function (w, h, d) { return new THREE.BoxGeometry(w, h, d); },
cyl: function (rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, s || 8); },
cone: function (r, h, s) { return new THREE.ConeGeometry(r, h, s || 8); },
sph: function (r, w, h) { return new THREE.SphereGeometry(r, w || 8, h || 6); },
oct: function (r) { return new THREE.OctahedronGeometry(r, 0); },
ico: function (r, d) { return new THREE.IcosahedronGeometry(r, d || 0); },
tor: function (R, t, rs, ts) { return new THREE.TorusGeometry(R, t, rs || 6, ts || 16); },
};
const HPI = Math.PI / 2;
function wing(m, col, side, x0, x1, zr0, zr1, zt0, zt1, y, t, dy) {
const s = side, a = y - t / 2, b = y + t / 2, ta = a + (dy || 0), tb = b + (dy || 0);
m.block([[s * x0, a, zr0], [s * x1, ta, zt0], [s * x1, ta, zt1], [s * x0, a, zr1], [s * x0, b, zr0], [s * x1, tb, zt0], [s * x1, tb, zt1], [s * x0, b, zr1]], col);
}

function buildShip(i, mb, mg) {
const sh = SHIPS[i], B = sh.body, A = sh.accent, D = 0x262b36, W = 0xe8fbff;
if (i === 0) { // Tern
mb.add(G.box(1.0, 0.62, 4.0), B, 0, 0, 0.1);
mb.add(G.cone(0.52, 1.7, 6), B, 0, 0, -2.75, -HPI, 0, 0, [1, 1, 0.75]);
mb.add(G.oct(1), 0x15304a, 0, 0.36, -0.9, 0, 0, 0, [0.34, 0.24, 0.8]);
wing(mb, B, 1, 0.45, 2.7, -0.4, 1.7, 0.9, 1.7, -0.05, 0.14, 0.12); wing(mb, B, -1, 0.45, 2.7, -0.4, 1.7, 0.9, 1.7, -0.05, 0.14, 0.12);
wing(mb, A, 1, 1.6, 2.6, 0.75, 1.55, 1.05, 1.65, 0.04, 0.05, 0.1); wing(mb, A, -1, 1.6, 2.6, 0.75, 1.55, 1.05, 1.65, 0.04, 0.05, 0.1);
mb.add(G.box(0.1, 0.7, 0.9), A, 2.72, 0.42, 1.35); mb.add(G.box(0.1, 0.7, 0.9), A, -2.72, 0.42, 1.35);
mb.add(G.cyl(0.3, 0.36, 1.3, 8), D, 0.55, 0, 2.05, HPI); mb.add(G.cyl(0.3, 0.36, 1.3, 8), D, -0.55, 0, 2.05, HPI);
mb.add(G.box(0.12, 0.12, 1.4), D, 1.2, -0.1, -0.7); mb.add(G.box(0.12, 0.12, 1.4), D, -1.2, -0.1, -0.7);
mg.add(G.cyl(0.24, 0.24, 0.1, 8), W, 0.55, 0, 2.72, HPI); mg.add(G.cyl(0.24, 0.24, 0.1, 8), W, -0.55, 0, 2.72, HPI);
mg.add(G.box(0.14, 0.08, 0.3), A, 2.72, 0.8, 1.3); mg.add(G.box(0.14, 0.08, 0.3), A, -2.72, 0.8, 1.3);
return { eng: [[0.55, 0, 2.9], [-0.55, 0, 2.9]], guns: [[1.2, -0.1, -1.5], [-1.2, -0.1, -1.5]], r: 3.1, len: 5.8 };
}
if (i === 1) { // Quill
mb.add(G.box(0.7, 0.55, 4.6), B, 0, 0, 0.2);
mb.add(G.cone(0.4, 2.4, 6), B, 0, 0, -3.4, -HPI, 0, 0, [1, 1, 0.8]);
mb.add(G.oct(1), 0x3a2a08, 0, 0.32, -1.2, 0, 0, 0, [0.28, 0.22, 0.75]);
wing(mb, B, 1, 0.3, 1.9, 0.2, 1.9, -0.6, 0.2, 0, 0.1, -0.15); wing(mb, B, -1, 0.3, 1.9, 0.2, 1.9, -0.6, 0.2, 0, 0.1, -0.15);
wing(mb, A, 1, 0.3, 1.0, -1.6, -0.6, -1.4, -0.8, 0, 0.08, 0); wing(mb, A, -1, 0.3, 1.0, -1.6, -0.6, -1.4, -0.8, 0, 0.08, 0);
mb.add(G.box(0.08, 1.0, 1.2), A, 0, 0.6, 1.8);
mb.add(G.cyl(0.42, 0.5, 1.4, 8), D, 0, 0, 2.6, HPI);
mb.add(G.box(0.1, 0.1, 1.2), D, 0.9, 0, -0.3); mb.add(G.box(0.1, 0.1, 1.2), D, -0.9, 0, -0.3);
mg.add(G.cyl(0.34, 0.34, 0.1, 8), W, 0, 0, 3.32, HPI);
mg.add(G.box(0.5, 0.06, 0.1), A, 1.6, -0.12, -0.2); mg.add(G.box(0.5, 0.06, 0.1), A, -1.6, -0.12, -0.2);
return { eng: [[0, 0, 3.5]], guns: [[0.9, 0, -0.9], [-0.9, 0, -0.9]], r: 3.0, len: 6.6 };
}
if (i === 2) { // Anvil
mb.add(G.box(1.8, 1.0, 4.4), B, 0, 0, 0.2);
mb.add(G.box(1.2, 0.8, 1.6), B, 0, -0.05, -2.6);
mb.add(G.oct(1), 0x2a1a08, 0, 0.6, -1.0, 0, 0, 0, [0.5, 0.3, 0.9]);
wing(mb, B, 1, 0.8, 3.0, -0.6, 1.9, 0.4, 1.6, -0.1, 0.24, 0); wing(mb, B, -1, 0.8, 3.0, -0.6, 1.9, 0.4, 1.6, -0.1, 0.24, 0);
mb.add(G.box(0.6, 0.6, 3.2), D, 3.0, -0.1, 0.4); mb.add(G.box(0.6, 0.6, 3.2), D, -3.0, -0.1, 0.4);
mb.add(G.box(0.16, 0.16, 1.6), D, 3.0, -0.1, -1.8); mb.add(G.box(0.16, 0.16, 1.6), D, -3.0, -0.1, -1.8);
mb.add(G.box(0.2, 0.2, 2.2), D, 0, -0.55, -2.9);
mb.add(G.box(0.7, 0.12, 1.6), A, 1.6, 0.08, 0.6); mb.add(G.box(0.7, 0.12, 1.6), A, -1.6, 0.08, 0.6);
mb.add(G.cyl(0.45, 0.55, 1.5, 8), D, 0.75, 0, 2.6, HPI); mb.add(G.cyl(0.45, 0.55, 1.5, 8), D, -0.75, 0, 2.6, HPI);
mg.add(G.cyl(0.36, 0.36, 0.1, 8), W, 0.75, 0, 3.36, HPI); mg.add(G.cyl(0.36, 0.36, 0.1, 8), W, -0.75, 0, 3.36, HPI);
mg.add(G.box(0.62, 0.1, 0.1), A, 3.0, 0.22, -0.8); mg.add(G.box(0.62, 0.1, 0.1), A, -3.0, 0.22, -0.8);
return { eng: [[0.75, 0, 3.5], [-0.75, 0, 3.5]], guns: [[3.0, -0.1, -2.6], [-3.0, -0.1, -2.6], [0, -0.55, -4.0]], r: 3.8, len: 6.6 };
}
mb.add(G.box(0.8, 0.5, 4.4), B, 0, 0, 0.1);
mb.add(G.cone(0.46, 2.0, 6), B, 0, 0, -3.1, -HPI, 0, 0, [1, 1, 0.7]);
mb.add(G.oct(1), 0x1a0f30, 0, 0.3, -1.0, 0, 0, 0, [0.3, 0.22, 0.85]);
mb.add(G.tor(2.2, 0.16, 5, 28), B, 0, 0, 1.0);
wing(mb, D, 1, 0.35, 2.1, 0.2, 1.4, 0.8, 1.2, 0, 0.1, 0); wing(mb, D, -1, 0.35, 2.1, 0.2, 1.4, 0.8, 1.2, 0, 0.1, 0);
mb.add(G.box(0.1, 1.6, 0.6), D, 0, 1.2, 1.0); mb.add(G.box(0.1, 1.6, 0.6), D, 0, -1.2, 1.0);
mb.add(G.cyl(0.32, 0.4, 1.2, 8), D, 0, 0, 2.6, HPI);
mg.add(G.tor(2.2, 0.07, 4, 28), A, 0, 0, 1.0, 0, 0, 0, [1.02, 1.02, 3]);
mg.add(G.cyl(0.28, 0.28, 0.1, 8), W, 0, 0, 3.22, HPI);
mg.add(G.box(0.08, 0.08, 1.0), A, 0.42, 0.26, -1.4); mg.add(G.box(0.08, 0.08, 1.0), A, -0.42, 0.26, -1.4);
return { eng: [[0, 0, 3.35]], guns: [[2.1, 0, -0.6], [-2.1, 0, -0.6]], r: 3.2, len: 6.2 };
}

const RED = 0xff3b30, ORG = 0xff7a3a, TEAL = 0x38e8c8;
function buildKind(k, mb, mg) {
if (k === 0) { // Shard interceptor
mb.add(G.oct(1), 0x3b414f, 0, 0, 0, 0, 0, 0, [0.9, 0.7, 2.4]);
mb.add(G.box(3.8, 0.12, 1.1), 0x2a2f3a, 0, 0, 0.6); mb.add(G.box(0.12, 2.6, 1.0), 0x2a2f3a, 0, 0, 0.8);
mb.add(G.box(0.34, 0.34, 1.6), 0x505868, 1.9, 0, 0.4); mb.add(G.box(0.34, 0.34, 1.6), 0x505868, -1.9, 0, 0.4);
mg.add(G.box(0.55, 0.28, 0.3), RED, 0, 0.12, -2.15); mg.add(G.box(0.6, 0.6, 0.2), ORG, 0, 0, 2.3);
mg.add(G.box(0.12, 0.12, 0.5), RED, 1.9, 0, -0.45); mg.add(G.box(0.12, 0.12, 0.5), RED, -1.9, 0, -0.45);
} else if (k === 1) { // Mauler bomber
mb.block([[-1.8, -0.7, -3.2], [1.8, -0.7, -3.2], [2.4, -0.7, 3.0], [-2.4, -0.7, 3.0], [-1.0, 0.7, -2.6], [1.0, 0.7, -2.6], [1.6, 0.9, 3.0], [-1.6, 0.9, 3.0]], 0x3d3a40);
wing(mb, 0x2e2c33, 1, 2.0, 4.2, 0, 2.6, 1.4, 2.6, -0.2, 0.3, -0.4); wing(mb, 0x2e2c33, -1, 2.0, 4.2, 0, 2.6, 1.4, 2.6, -0.2, 0.3, -0.4);
mb.add(G.cyl(0.55, 0.55, 3.4, 8), 0x55505a, 1.5, -1.1, 0.2, HPI); mb.add(G.cyl(0.55, 0.55, 3.4, 8), 0x55505a, -1.5, -1.1, 0.2, HPI);
mb.add(G.cone(0.55, 0.9, 8), 0x8a3a30, 1.5, -1.1, -1.9, -HPI); mb.add(G.cone(0.55, 0.9, 8), 0x8a3a30, -1.5, -1.1, -1.9, -HPI);
mg.add(G.box(0.4, 0.2, 0.2), RED, 0.7, 0.3, -2.95); mg.add(G.box(0.4, 0.2, 0.2), RED, -0.7, 0.3, -2.95);
mg.add(G.box(1.0, 0.5, 0.15), ORG, 1.0, 0.1, 3.05); mg.add(G.box(1.0, 0.5, 0.15), ORG, -1.0, 0.1, 3.05);
} else if (k === 2) { // Pike frigate
mb.add(G.box(2.6, 2.6, 21), 0x3a3f4c, 0, 0, 0);
mb.add(G.box(3.8, 2.4, 4.2), 0x454b5a, 0, 2.2, 4);
mb.add(G.box(2.1, 1.7, 6.5), 0x2c313c, 2.5, 0, -2); mb.add(G.box(2.1, 1.7, 6.5), 0x2c313c, -2.5, 0, -2);
mb.add(G.cone(1.85, 5.2, 6), 0x454b5a, 0, 0, -13.1, -HPI);
mb.add(G.box(4.8, 3.4, 3.2), 0x2c313c, 0, 0, 10);
mb.add(G.box(0.3, 6.0, 3.0), 0x3a3f4c, 0, 0.8, 8.6); mb.add(G.box(8.0, 0.3, 2.4), 0x3a3f4c, 0, -0.4, 8.6);
for (let j = 0; j < 4; j++) { mb.add(G.box(0.5, 0.5, 0.5), 0x555c6c, 3.6, 0.4, -4.4 + j * 1.2); mb.add(G.box(0.5, 0.5, 0.5), 0x555c6c, -3.6, 0.4, -4.4 + j * 1.2); }
mg.add(G.box(3.9, 0.4, 0.3), RED, 0, 2.7, 1.85);
mg.add(G.box(0.16, 0.5, 5.0), RED, 3.6, -0.3, -2); mg.add(G.box(0.16, 0.5, 5.0), RED, -3.6, -0.3, -2);
mg.add(G.cyl(0.9, 0.9, 0.2, 8), ORG, 1.3, 0, 11.65, HPI); mg.add(G.cyl(0.9, 0.9, 0.2, 8), ORG, -1.3, 0, 11.65, HPI);
} else if (k === 3) { // Sentry platform
mb.add(G.ico(2.6, 0), 0x3a404c, 0, 0, 0);
mb.add(G.tor(4.3, 0.42, 4, 12), 0x2c313c, 0, 0, 0, HPI);
mb.add(G.box(9.4, 0.6, 0.6), 0x2c313c, 0, 0, 0); mb.add(G.box(0.6, 0.6, 9.4), 0x2c313c, 0, 0, 0);
mb.add(G.box(2.6, 0.12, 1.8), 0x1d3a5a, 5.4, 0, 0); mb.add(G.box(2.6, 0.12, 1.8), 0x1d3a5a, -5.4, 0, 0);
mb.add(G.box(1.8, 0.12, 2.6), 0x1d3a5a, 0, 0, 5.4); mb.add(G.box(1.8, 0.12, 2.6), 0x1d3a5a, 0, 0, -5.4);
mb.add(G.sph(1.3, 8, 6), 0x4a5060, 0, 2.6, 0);
mb.add(G.box(0.26, 0.26, 2.8), 0x22262e, 0.45, 2.7, -1.5); mb.add(G.box(0.26, 0.26, 2.8), 0x22262e, -0.45, 2.7, -1.5);
mg.add(G.box(0.8, 0.3, 0.2), RED, 0, 2.75, -1.15);
mg.add(G.box(0.4, 0.4, 0.4), RED, 4.3, 0, 0); mg.add(G.box(0.4, 0.4, 0.4), RED, -4.3, 0, 0);
mg.add(G.box(0.4, 0.4, 0.4), RED, 0, 0, 4.3); mg.add(G.box(0.4, 0.4, 0.4), RED, 0, 0, -4.3);
} else if (k === 4) { // Mine
mb.add(G.ico(1.4, 0), 0x40363a, 0, 0, 0);
mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, 0, 1.6, 0); mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, 0, -1.6, 0, Math.PI);
mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, 1.6, 0, 0, 0, 0, -HPI); mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, -1.6, 0, 0, 0, 0, HPI);
mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, 0, 0, 1.6, HPI); mb.add(G.cone(0.28, 1.3, 5), 0x5a5a62, 0, 0, -1.6, -HPI);
mg.add(G.sph(0.5, 6, 4), RED, 0, 0, 0, 0, 0, 0, [2.9, 0.5, 2.9]);
} else if (k === 5) { // Target drone
mb.add(G.box(2.2, 2.2, 2.2), 0xd8892e, 0, 0, 0);
mb.add(G.box(2.28, 0.45, 2.28), 0x222428, 0, 0, 0);
mb.add(G.tor(2.4, 0.18, 4, 16), 0xd8dde6, 0, 0, 0);
mg.add(G.box(0.5, 0.5, 0.5), 0xffd25a, 0, 1.35, 0); mg.add(G.box(0.7, 0.3, 0.1), 0xffd25a, 0, 0.6, -1.16);
} else if (k === 6) { // Kite wing drone (friendly)
mb.add(G.oct(1), 0xc8d0dc, 0, 0, 0, 0, 0, 0, [0.8, 0.6, 2.3]);
wing(mb, 0x9aa4b4, 1, 0.4, 2.2, 0, 1.2, 0.7, 1.2, 0, 0.12, 0.2); wing(mb, 0x9aa4b4, -1, 0.4, 2.2, 0, 1.2, 0.7, 1.2, 0, 0.12, 0.2);
mb.add(G.box(0.1, 0.9, 0.8), 0x9aa4b4, 0, 0.5, 1.2);
mg.add(G.box(0.5, 0.22, 0.3), TEAL, 0, 0.12, -2.05); mg.add(G.box(0.5, 0.5, 0.2), TEAL, 0, 0, 2.25);
mg.add(G.box(0.2, 0.08, 0.4), TEAL, 2.2, 0.2, 0.9); mg.add(G.box(0.2, 0.08, 0.4), TEAL, -2.2, 0.2, 0.9);
} else if (k === 7) { // Jammer relay
mb.add(G.cyl(0.6, 0.9, 14, 6), 0x3a3f4c, 0, 0.5, 0);
mb.add(G.sph(2.3, 8, 6), 0x2a2f3a, 0, -1, 0);
mb.add(G.box(6.5, 1.4, 6.5), 0x2c313c, 0, -6.4, 0);
mb.add(G.box(9, 0.3, 0.3), 0x454b5a, 0, 5.5, 0); mb.add(G.box(0.3, 0.3, 9), 0x454b5a, 0, 3.5, 0);
mb.add(G.cone(2.6, 1.2, 10), 0x5a6070, 0, 2.2, 0, Math.PI);
mb.add(G.cone(1.6, 0.8, 8), 0x5a6070, 4.4, 5.5, 0, 0, 0, HPI); mb.add(G.cone(1.6, 0.8, 8), 0x5a6070, -4.4, 5.5, 0, 0, 0, -HPI);
mg.add(G.tor(3.1, 0.35, 4, 18), RED, 0, -1, 0, HPI); mg.add(G.box(0.9, 0.9, 0.9), RED, 0, 7.8, 0);
mg.add(G.box(0.4, 0.4, 0.4), RED, 4.6, 5.5, 0); mg.add(G.box(0.4, 0.4, 0.4), RED, -4.6, 5.5, 0);
} else { // Watcher drone
mb.add(G.sph(1.6, 8, 6), 0x3a404a, 0, 0, 0);
mb.add(G.tor(1.05, 0.26, 4, 12), 0x2a2e36, 0, 0, -1.25);
mb.add(G.box(0.15, 3.2, 1.2), 0x2a2e36, 0, 0, 0.6); mb.add(G.box(3.2, 0.15, 1.2), 0x2a2e36, 0, 0, 0.6);
mg.add(G.sph(0.72, 8, 6), 0xffb02e, 0, 0, -1.35);
}
}
const kindGeo = [];
for (let k = 0; k < KINDS.length; k++) {
const mb = new Mesher(), mg = new Mesher();
buildKind(k, mb, mg);
kindGeo.push({ body: mb.build(), glow: mg.build() });
}

function buildCapitalGeo(flag, mb, mg) {
const HC = 0x4a4f5c, HD = 0x343843, HR = 0x5a3434, HL = 0x5c6270;
mb.block([[-3, -2, -100], [3, -2, -100], [22, -12, -52], [-22, -12, -52], [-3, 2, -100], [3, 2, -100], [22, 12, -52], [-22, 12, -52]], HC, HL);
mb.add(G.box(48, 14, 112), HC, 0, -5, 4);
mb.add(G.box(14, 10, 112), HL, -17, 7, 4); mb.add(G.box(14, 10, 112), HL, 17, 7, 4);
mb.add(G.box(40, 20, 40), HC, 0, 0, 80);
mb.add(G.box(12, 16, 22), HL, 0, 18, 77);
mb.add(G.box(2, 10, 62), HD, 0, -17, 30);
mb.add(G.cyl(6, 7, 6, 10), HD, -10, 0, 100, HPI); mb.add(G.cyl(6, 7, 6, 10), HD, 10, 0, 100, HPI);
if (flag) mb.add(G.cyl(6, 7, 6, 10), HD, 0, 0, 100, HPI);
mb.add(G.box(2.2, 1.2, 104), HD, -6, 2.6, 4); mb.add(G.box(2.2, 1.2, 104), HD, 6, 2.6, 4);
for (let z = -44; z <= 54; z += 14) { mb.add(G.box(0.9, 10, 1.2), HD, -9.6, 7, z); mb.add(G.box(0.9, 10, 1.2), HD, 9.6, 7, z); }
const r = mkRng(flag ? 33 : 21);
for (let i = 0; i < (flag ? 70 : 46); i++) {
const side = r() < 0.5 ? -1 : 1, w = 1 + r() * 4, h = 0.6 + r() * 2, d = 2 + r() * 8;
const zone = r();
if (zone < 0.45) mb.add(G.box(0.8, h, d), r() < 0.3 ? HR : HD, side * 24.3, -10 + r() * 12, -48 + r() * 104);
else if (zone < 0.75) mb.add(G.box(w, 0.8, d), r() < 0.25 ? HR : HD, side * (11 + r() * 12), 12.3, -48 + r() * 104);
else mb.add(G.box(w, h, d), HD, side * r() * 16, 10.2, 62 + r() * 34);
}
if (flag) {
mb.add(G.box(10, 8, 70), HC, -29, -4, 0); mb.add(G.box(10, 8, 70), HC, 29, -4, 0);
mb.add(G.cone(3, 16, 6), HL, -29, -4, -43, -HPI); mb.add(G.cone(3, 16, 6), HL, 29, -4, -43, -HPI);
mb.add(G.box(1.2, 14, 8), HD, 0, 30, 80);
}
mg.add(G.box(0.3, 0.6, 96), RED, -24.4, -4, 2); mg.add(G.box(0.3, 0.6, 96), RED, 24.4, -4, 2);
mg.add(G.box(10, 1.2, 0.3), 0xffb070, 0, 22, 65.8);
for (let z = -40; z <= 50; z += 10) { mg.add(G.box(0.3, 0.5, 1.2), ORG, -24.4, 0, z); mg.add(G.box(0.3, 0.5, 1.2), ORG, 24.4, 0, z); }
for (let z = -44; z <= 54; z += 14) { mg.add(G.box(0.4, 0.4, 0.4), RED, -9.1, 10.5, z); mg.add(G.box(0.4, 0.4, 0.4), RED, 9.1, 10.5, z); }
if (flag) { mg.add(G.box(0.3, 0.6, 60), RED, -34.2, -4, 0); mg.add(G.box(0.3, 0.6, 60), RED, 34.2, -4, 0); mg.add(G.box(0.6, 0.6, 0.6), RED, 0, 37.4, 80); }
}
const capGeo = [];
for (let f = 0; f < 2; f++) { const mb = new Mesher(), mg = new Mesher(); buildCapitalGeo(f === 1, mb, mg); capGeo.push({ body: mb.build(), glow: mg.build() }); }
const frtGeo = (function () {
const mb = new Mesher(), mg = new Mesher(), CC = [0x2f7f7a, 0xc0682a, 0x6a7280, 0x8a3c3c, 0x2f5f8a, 0xb0a040];
mb.add(G.box(4, 4, 42), 0x8a8f9a, 0, 0, 0);
for (let i = 0; i < 6; i++) { mb.add(G.box(7, 6.5, 5), CC[i], 0, 0.5, -13 + i * 5.4); mb.add(G.box(7.2, 0.4, 5.2), 0x55595f, 0, 3.9, -13 + i * 5.4); }
mb.add(G.box(5.5, 4, 6), 0xb8bec8, 0, 3.6, -18.5);
mb.add(G.box(9, 7, 5), 0x6a6f7a, 0, 0, 21);
mb.add(G.cyl(1.6, 2, 2.4, 8), 0x3a3e46, -2.4, 0, 24.4, HPI); mb.add(G.cyl(1.6, 2, 2.4, 8), 0x3a3e46, 2.4, 0, 24.4, HPI);
mg.add(G.cyl(1.3, 1.3, 0.2, 8), 0xcfe8ff, -2.4, 0, 25.7, HPI); mg.add(G.cyl(1.3, 1.3, 0.2, 8), 0xcfe8ff, 2.4, 0, 25.7, HPI);
mg.add(G.box(5.6, 0.6, 0.2), 0x9ff7ff, 0, 4.2, -21.6);
for (let i = 0; i < 6; i++) { mg.add(G.box(0.2, 0.3, 0.3), TEAL, 3.6, 3.4, -13 + i * 5.4); mg.add(G.box(0.2, 0.3, 0.3), TEAL, -3.6, 3.4, -13 + i * 5.4); }
return { body: mb.build(), glow: mg.build() };
})();
const stnGeo = (function () {
const mb = new Mesher(), mg = new Mesher(), rb = new Mesher(), rg = new Mesher();
mb.add(G.cyl(14, 14, 50, 12), 0x8a909c, 0, 0, 0);
mb.add(G.cone(14, 10, 12), 0x7a808c, 0, 30, 0); mb.add(G.cone(14, 10, 12), 0x7a808c, 0, -30, 0, Math.PI);
mb.add(G.cyl(3, 3, 22, 8), 0x5a606c, 0, 44, 0); mb.add(G.cyl(3, 3, 22, 8), 0x5a606c, 0, -44, 0);
for (let i = 0; i < 4; i++) {
const a = i * HPI;
mb.add(G.box(22, 0.4, 9), 0x1d3a6a, Math.cos(a) * 26, 44, Math.sin(a) * 26, 0, -a, 0);
mb.add(G.box(22, 0.4, 9), 0x1d3a6a, Math.cos(a) * 26, -44, Math.sin(a) * 26, 0, -a, 0);
}
mb.add(G.box(8, 6, 18), 0x6a707c, 0, 0, -22);
mg.add(G.box(9, 1, 0.4), 0x9ff7ff, 0, 0, -31.2);
for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; mg.add(G.box(1, 1.2, 1), TEAL, Math.cos(a) * 14.1, 12, Math.sin(a) * 14.1, 0, -a, 0); mg.add(G.box(1, 1.2, 1), 0xffe08a, Math.cos(a) * 14.1, -10, Math.sin(a) * 14.1, 0, -a, 0); }
mg.add(G.box(1.4, 1.4, 1.4), 0xff5050, 0, 55.5, 0);
rb.add(G.tor(55, 5, 6, 36), 0x7a808c, 0, 0, 0, HPI);
for (let i = 0; i < 4; i++) { const a = i * HPI + Math.PI / 4; rb.add(G.box(41, 2.4, 2.4), 0x5a606c, Math.cos(a) * 34.5, 0, Math.sin(a) * 34.5, 0, -a, 0); }
for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; rg.add(G.box(1.6, 1.1, 0.3), i % 3 ? 0xffe8a8 : TEAL, Math.cos(a) * 60.1, 0, Math.sin(a) * 60.1, 0, -a + HPI, 0); }
return { body: mb.build(), glow: mg.build(), ring: rb.build(), ringGlow: rg.build() };
})();
const astGeo = [];
for (let v = 0; v < 3; v++) {
const g = new THREE.IcosahedronGeometry(1, 1);
const p = g.attributes.position.array, col = new Float32Array(p.length);
for (let i = 0; i < p.length; i += 3) {
const kx = Math.round(p[i] * 1000), ky = Math.round(p[i + 1] * 1000), kz = Math.round(p[i + 2] * 1000);
const f = 0.78 + hash3(kx, ky, kz, 50 + v) * 0.42;
p[i] *= f; p[i + 1] *= f * (v === 2 ? 0.75 : 1); p[i + 2] *= f * (v === 1 ? 1.25 : 1);
}
for (let i = 0; i < p.length; i += 9) {
const b = 0.55 + hash3(i, v, 3, 9) * 0.35;
for (let k = 0; k < 9; k += 3) { col[i + k] = b; col[i + k + 1] = b * 0.94; col[i + k + 2] = b * 0.88; }
}
g.setAttribute('color', new THREE.BufferAttribute(col, 3));
g.computeVertexNormals();
g.computeBoundingSphere();
astGeo.push(own(g));
}

function makeParticles(max, additive) {
const geo = own(new THREE.BufferGeometry());
const pos = new Float32Array(max * 3), col = new Float32Array(max * 4), size = new Float32Array(max);
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('aColor', new THREE.BufferAttribute(col, 4));
geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
const uni = {
uScale: { value: 300 }, uFogColor: { value: fogCol }, uFogNear: { value: 320 }, uFogFar: { value: 590 },
uMap: { value: texDot }, uAdd: { value: additive ? 1 : 0 },
};
const mat = own(new THREE.ShaderMaterial({
uniforms: uni,
vertexShader: [
'attribute vec4 aColor; attribute float aSize; varying vec4 vColor; varying float vFog;',
'uniform float uScale; uniform float uFogNear; uniform float uFogFar;',
'void main() {',
'  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
'  gl_Position = projectionMatrix * mv;',
'  gl_PointSize = min(aSize * uScale / max(0.5, -mv.z), 320.0);',
'  vColor = aColor; vFog = smoothstep(uFogNear, uFogFar, -mv.z);',
'}',
].join('\n'),
fragmentShader: [
'uniform vec3 uFogColor; uniform sampler2D uMap; uniform float uAdd; varying vec4 vColor; varying float vFog;',
'void main() {',
'  float a = texture2D(uMap, gl_PointCoord).a * vColor.a;',
'  if (a < 0.01) discard;',
'  vec3 c = mix(mix(vColor.rgb, uFogColor, vFog), vColor.rgb * (1.0 - vFog), uAdd);',
'  gl_FragColor = vec4(c, a);',
'}',
].join('\n'),
transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
}));
const pts = new THREE.Points(geo, mat);
pts.frustumCulled = false;
pts.renderOrder = additive ? 6 : 5;
scene.add(pts);
const vel = new Float32Array(max * 3), life = new Float32Array(max), maxL = new Float32Array(max);
const s0 = new Float32Array(max), s1 = new Float32Array(max), a0 = new Float32Array(max), drag = new Float32Array(max);
let cursor = 0, alive = 0;
return {
uni: uni,
spawn: function (x, y, z, vx, vy, vz, l, sa, sb, r, g, b, a, dr) {
const i = cursor; cursor = (cursor + 1) % max;
if (life[i] <= 0) alive++;
pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
life[i] = l > 0.01 ? l : 0.01; maxL[i] = life[i]; s0[i] = sa; s1[i] = sb; a0[i] = a; drag[i] = dr || 0;
col[i * 4] = r; col[i * 4 + 1] = g; col[i * 4 + 2] = b; col[i * 4 + 3] = 0; size[i] = sa;
},
update: function (dt) {
if (alive <= 0) return;
alive = 0;
for (let i = 0; i < max; i++) {
if (life[i] <= 0) continue;
life[i] -= dt;
if (life[i] <= 0) { col[i * 4 + 3] = 0; size[i] = 0; continue; }
alive++;
const k = i * 3, d = Math.max(0, 1 - drag[i] * dt);
vel[k] *= d; vel[k + 1] *= d; vel[k + 2] *= d;
pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
const t = 1 - life[i] / maxL[i];
size[i] = s0[i] + (s1[i] - s0[i]) * t;
col[i * 4 + 3] = a0[i] * Math.min(1, t * 10) * (1 - t);
}
geo.attributes.position.needsUpdate = true;
geo.attributes.aColor.needsUpdate = true;
geo.attributes.aSize.needsUpdate = true;
},
clear: function () {
for (let i = 0; i < max; i++) { life[i] = 0; size[i] = 0; col[i * 4 + 3] = 0; }
alive = 0;
geo.attributes.aColor.needsUpdate = true; geo.attributes.aSize.needsUpdate = true;
},
};
}
const FX = makeParticles(1500, true);  // sparks, fire, engine glow, flares, flashes
const SMK = makeParticles(600, false); // smoke and dust
function sparks(x, y, z, n, spd, life, size, r, g, b) {
for (let i = 0; i < n; i++) FX.spawn(x, y, z, rnd(spd), rnd(spd), rnd(spd), life * (0.5 + Math.random() * 0.7), size, size * 0.2, r, g, b, 1, 1.2);
}
function smoke(x, y, z, n, size, dark, life) {
for (let i = 0; i < n; i++) {
const c = dark ? 0.12 + Math.random() * 0.1 : 0.45 + Math.random() * 0.2;
SMK.spawn(x + rnd(1), y + rnd(1), z + rnd(1), rnd(4), rnd(4), rnd(4), (life || 2) * (0.7 + Math.random() * 0.5), size * 0.5, size * 1.9, c, c * 0.95, c * 1.05, dark ? 0.7 : 0.45, 0.8);
}
}
function flash(x, y, z, size, r, g, b, life) { FX.spawn(x, y, z, 0, 0, 0, life || 0.25, size, size * 1.6, r, g, b, 1, 0); }

function makeInst(geo, mat, cap, scatter) {
const m = new THREE.InstancedMesh(geo, own(mat), cap);
m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
for (let i = 0; i < cap; i++) { m.setMatrixAt(i, ZERO_M); m.setColorAt(i, C1.setRGB(1, 1, 1)); }
if (m.instanceColor) m.instanceColor.needsUpdate = true;
m.count = 0;
m.frustumCulled = !scatter; // instances spread across the world: never cull by the base bounding sphere
scene.add(m);
return m;
}
const debMesh = makeInst(own(new THREE.OctahedronGeometry(1, 0)), new THREE.MeshLambertMaterial({ color: 0xffffff }), DEB_MAX, true);
const DEB = [];
for (let i = 0; i < DEB_MAX; i++) DEB.push({ on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), q: new THREE.Quaternion(), ax: new THREE.Vector3(1, 0, 0), spin: 0, s: new THREE.Vector3(1, 1, 1), life: 0, max: 1, ember: false, col: new THREE.Color(), et: 0 });
let debCursor = 0;
function debris(x, y, z, n, spd, sz, colHex, emberChance, bvx, bvy, bvz) {
for (let j = 0; j < n; j++) {
const d = DEB[debCursor];
debCursor = (debCursor + 1) % DEB_MAX;
d.on = true; d.p.set(x + rnd(sz), y + rnd(sz), z + rnd(sz));
d.v.set(rnd(spd) + (bvx || 0), rnd(spd) + (bvy || 0), rnd(spd) + (bvz || 0));
d.ax.set(rnd(1), rnd(1), rnd(1));
if (d.ax.lengthSq() < 0.01) d.ax.set(0, 1, 0);
d.ax.normalize(); d.spin = rnd(6); d.q.set(0, 0, 0, 1);
const s = sz * (0.35 + Math.random() * 0.8);
d.s.set(s, s * (0.25 + Math.random() * 0.5), s * (0.5 + Math.random() * 0.9));
d.life = d.max = 2.2 + Math.random() * 2.2;
d.ember = Math.random() < (emberChance || 0); d.et = 0;
d.col.setHex(Math.random() < 0.35 ? 0x1c1f26 : colHex);
}
}

const ringGeoShock = own(new THREE.RingGeometry(0.82, 1, 40));
const SHOCK = [];
for (let i = 0; i < SHOCK_MAX; i++) {
const m = new THREE.Mesh(ringGeoShock, own(new THREE.MeshBasicMaterial({ color: 0xffc080, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
m.visible = false; m.renderOrder = 7; scene.add(m);
SHOCK.push({ m: m, t: 0, dur: 0.6, size: 20, on: false });
}
let shockCursor = 0;
function shock(x, y, z, size, colHex, dur) {
const s = SHOCK[shockCursor]; shockCursor = (shockCursor + 1) % SHOCK_MAX;
s.on = true; s.t = 0; s.dur = dur || 0.6; s.size = size; s.m.position.set(x, y, z); s.m.material.color.setHex(colHex || 0xffc080); s.m.visible = true;
}

const boltMesh = makeInst(own(new THREE.BoxGeometry(1, 1, 1)), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), BOLT_MAX, true);
boltMesh.renderOrder = 8;
const BOLT = [];
for (let i = 0; i < BOLT_MAX; i++) BOLT.push({ on: false, team: 0, p: new THREE.Vector3(), pp: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, dmg: 0, len: 5, w: 0.25, col: new THREE.Color(), src: null, player: false });
let boltCursor = 0;
function spawnBolt(team, x, y, z, vx, vy, vz, life, dmg, len, w, colHex, src) {
for (let k = 0; k < BOLT_MAX; k++) {
const b = BOLT[boltCursor]; boltCursor = (boltCursor + 1) % BOLT_MAX;
if (b.on) continue;
b.on = true; b.team = team; b.p.set(x, y, z); b.pp.set(x, y, z); b.v.set(vx, vy, vz); b.life = life; b.dmg = dmg;
b.len = len; b.w = w; b.col.setHex(colHex); b.src = src || null; b.player = src === P;
if (net) netBoltEv(b, src);
return b;
}
return null;
}

const mslGeo = (function () {
const m = new Mesher();
m.add(G.cyl(0.22, 0.22, 2.2, 6), 0xd8dde6, 0, 0, 0, HPI);
m.add(G.cone(0.22, 0.6, 6), 0xd84a3a, 0, 0, -1.4, -HPI);
m.add(G.box(0.9, 0.06, 0.4), 0x5a606c, 0, 0, 0.9); m.add(G.box(0.06, 0.9, 0.4), 0x5a606c, 0, 0, 0.9);
return m.build();
})();
const mslMesh = makeInst(mslGeo, new THREE.MeshLambertMaterial({ vertexColors: true }), MSL_MAX, true);
const MSL = [];
for (let i = 0; i < MSL_MAX; i++) MSL.push({ on: false, team: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), f: new THREE.Vector3(0, 0, -1), tgt: null, life: 0, spd: 140, turn: 3, dmg: 120, torp: false, hp: 0, trailT: 0, homing: 1, r: 1.6, bt: 'msl', col: new THREE.Color(), flare: false });
const FLR = [];
for (let i = 0; i < FLR_MAX; i++) FLR.push({ on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, bt: 'flare', r: 1 });

const KCAP = [32, 12, 6, 8, 40, 6, 2, 3, 10];
const kindMesh = [];
for (let k = 0; k < KINDS.length; k++) {
kindMesh.push({
body: makeInst(kindGeo[k].body, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), KCAP[k], true),
glow: makeInst(kindGeo[k].glow, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), KCAP[k], true),
});
}
const ENTS = [];
for (let i = 0; i < ENT_MAX; i++) {
ENTS.push({ on: false, idx: i, kind: 0, team: 1, bt: 'ent', p: new THREE.Vector3(), v: new THREE.Vector3(), f: new THREE.Vector3(0, 0, -1), u: new THREE.Vector3(0, 1, 0),
home: new THREE.Vector3(), goal: new THREE.Vector3(), hp: 1, maxHp: 1, r: 2, hl: 0, spd: 60, turn: 1.5, state: 0, stT: 0, fireT: 0, burst: 0, burstT: 0, mslT: 0,
flash: 0, tgt: null, patrol: null, pi: 0, armed: 0, sleep: false, weak: false, armored: false, marked: false, shell: 0, firstHit: -1,
stuckT: 0, spin: 0, wing: -1, down: 0, shield: 0, regenT: 0, fromCap: false, jinkT: 0, dodge: new THREE.Vector3() });
}

const astMesh = [];
for (let v = 0; v < 3; v++) astMesh.push(makeInst(astGeo[v], new THREE.MeshLambertMaterial({ vertexColors: true }), AST_MAX, true));
const AST = [];
for (let i = 0; i < AST_MAX; i++) AST.push({ on: false, p: new THREE.Vector3(), r: 5, v: 0, q: new THREE.Quaternion(), tint: new THREE.Color() });
let astN = 0;
const astGrid = new Map(), EMPTY = [];
function cellKey(ix, iy, iz) { return ((ix + 64) * 128 + (iy + 64)) * 128 + (iz + 64); }
function astCell(x, y, z) {
const ix = Math.floor(x / CELL), iy = Math.floor(y / CELL), iz = Math.floor(z / CELL);
if (ix < -64 || ix > 63 || iy < -64 || iy > 63 || iz < -64 || iz > 63) return EMPTY;
const c = astGrid.get(cellKey(ix, iy, iz));
return c || EMPTY;
}
function rebuildAst() {
astGrid.clear();
const cnt = [0, 0, 0];
for (let i = 0; i < astN; i++) {
const a = AST[i];
if (!a.on) continue;
const m = a.r + 8;
const x0 = Math.floor((a.p.x - m) / CELL), x1 = Math.floor((a.p.x + m) / CELL), y0 = Math.floor((a.p.y - m) / CELL), y1 = Math.floor((a.p.y + m) / CELL);
const z0 = Math.floor((a.p.z - m) / CELL), z1 = Math.floor((a.p.z + m) / CELL);
for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) for (let iz = z0; iz <= z1; iz++) {
if (ix < -64 || ix > 63 || iy < -64 || iy > 63 || iz < -64 || iz > 63) continue;
const k = cellKey(ix, iy, iz);
let c = astGrid.get(k);
if (!c) { c = []; astGrid.set(k, c); }
c.push(i);
}
const mesh = astMesh[a.v];
SC.set(a.r, a.r, a.r);
M1.compose(a.p, a.q, SC);
mesh.setMatrixAt(cnt[a.v], M1);
mesh.setColorAt(cnt[a.v], a.tint);
cnt[a.v]++;
}
for (let v = 0; v < 3; v++) {
astMesh[v].count = cnt[v];
astMesh[v].visible = cnt[v] > 0;
astMesh[v].instanceMatrix.needsUpdate = true;
if (astMesh[v].instanceColor) astMesh[v].instanceColor.needsUpdate = true;
}
}

const ringMesh = makeInst(own(new THREE.TorusGeometry(1, 0.07, 6, 40)), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), RING_MAX, true);
const RINGS = [];
for (let i = 0; i < RING_MAX; i++) RINGS.push({ on: false, p: new THREE.Vector3(), n: new THREE.Vector3(0, 0, 1), r: 14, passed: false, idx: i });
let ringN = 0, ringNext = 0;

const pickMesh = makeInst(own(new THREE.OctahedronGeometry(1.2, 0)), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), PICK_MAX, true);
const PICK = [];
for (let i = 0; i < PICK_MAX; i++) PICK.push({ on: false, kind: 0, p: new THREE.Vector3(), life: 0, spin: 0 });

const genGeo = (function () { const m = new Mesher(); m.add(G.cyl(2.2, 3.2, 3, 8), 0x3a3f4c, 0, -1.5, 0); m.add(G.box(7, 0.6, 1.2), 0x2c313c, 0, -2.6, 0); return m.build(); })();
const domeGeo = own(new THREE.SphereGeometry(3.4, 12, 6, 0, TAU, 0, Math.PI / 2));
const turGeo = (function () {
const m = new Mesher();
m.add(G.sph(1.9, 8, 6), 0x50566a, 0, 0, 0);
m.add(G.box(0.42, 0.42, 3.8), 0x22262e, 0.65, 0.2, -2.2); m.add(G.box(0.42, 0.42, 3.8), 0x22262e, -0.65, 0.2, -2.2);
m.add(G.box(1.2, 0.3, 0.8), 0x8a3a30, 0, 0.9, -0.8);
return m.build();
})();
const genMesh = makeInst(genGeo, new THREE.MeshLambertMaterial({ vertexColors: true }), 8, true);
const domeMesh = makeInst(domeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false }), 8, true);
const turMesh = makeInst(turGeo, new THREE.MeshLambertMaterial({ vertexColors: true }), 24, true);
const engMesh = makeInst(own(new THREE.CircleGeometry(5.6, 16)), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, side: THREE.DoubleSide }), 6, true);
const bayMesh = makeInst(own(new THREE.BoxGeometry(12, 0.3, 18)), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), 2, true);
const reactorGeo = own(new THREE.SphereGeometry(3.2, 12, 8));
const lidGeo = own(new THREE.PlaneGeometry(20, 112));
lidGeo.rotateX(-HPI); lidGeo.translate(0, 12.7, 4);
const CAPS = [];
for (let i = 0; i < 2; i++) {
const g = new THREE.Group();
const hull = new THREE.Mesh(capGeo[0].body, own(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
const glow = new THREE.Mesh(capGeo[0].glow, own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
const lid = new THREE.Mesh(lidGeo, own(new THREE.MeshBasicMaterial({ map: texHex, color: 0x4aa8ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
const reactor = new THREE.Mesh(reactorGeo, own(new THREE.MeshBasicMaterial({ color: 0x661010 })));
reactor.position.set(0, 4.5, 8);
lid.renderOrder = 7;
g.add(hull); g.add(glow); g.add(lid); g.add(reactor);
g.visible = false;
scene.add(g);
CAPS.push({ on: false, idx: i, def: 0, s: 1, g: g, hull: hull, glow: glow, lid: lid, reactor: reactor, p: g.position, q: g.quaternion, qi: new THREE.Quaternion(),
yaw: 0, spd: 0, v: new THREE.Vector3(), path: null, wp: 0, subs: [], gens: 0, engs: 0, dead: false, dying: false, dieT: 0, boomT: 0,
hangar: 0, hangarT: 0, stopAt: 0, lidFlash: 0, boxes: [], R: 120, bt: 'cap', hp: 1 });
}

const frtGroup = new THREE.Group();
frtGroup.add(new THREE.Mesh(frtGeo.body, own(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }))));
frtGroup.add(new THREE.Mesh(frtGeo.glow, own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))));
frtGroup.visible = false; scene.add(frtGroup);
const FRT = { on: false, bt: 'frt', p: frtGroup.position, q: frtGroup.quaternion, qi: new THREE.Quaternion(), f: new THREE.Vector3(0, 0, -1), v: new THREE.Vector3(),
path: [], wp: 0, spd: 14, hp: 1500, maxHp: 1500, prog: 0, arrived: false, r: 16, flash: 0, total: 1, travelled: 0, warpT: 0, boxes: [[0, 0, 0, 6, 5, 24]] };
const stnGroup = new THREE.Group(), stnRing = new THREE.Group();
stnGroup.add(new THREE.Mesh(stnGeo.body, own(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }))));
stnGroup.add(new THREE.Mesh(stnGeo.glow, own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))));
stnRing.add(new THREE.Mesh(stnGeo.ring, own(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }))));
stnRing.add(new THREE.Mesh(stnGeo.ringGlow, own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))));
stnGroup.add(stnRing);
stnGroup.visible = false; scene.add(stnGroup);
const STN = { on: false, bt: 'stn', p: stnGroup.position, v: new THREE.Vector3(), hp: 3000, maxHp: 3000, r: 62, flash: 0, q: stnGroup.quaternion, qi: new THREE.Quaternion(),
boxes: [[0, 0, 0, 14, 36, 14], [0, 0, -22, 4, 3, 9]] };

const shipGeo = [];
for (let i = 0; i < SHIPS.length; i++) { const mb = new Mesher(), mg = new Mesher(); const info = buildShip(i, mb, mg); shipGeo.push({ body: mb.build(), glow: mg.build(), info: info }); }
const shipGroup = new THREE.Group();
const shipBody = new THREE.Mesh(shipGeo[0].body, own(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
const shipGlowMat = own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
const shipGlow = new THREE.Mesh(shipGeo[0].glow, shipGlowMat);
shipGroup.add(shipBody); shipGroup.add(shipGlow);
const flameMat = own(new THREE.SpriteMaterial({ map: texGlow, color: 0x8fe0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
const flames = [];
for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(flameMat); s.visible = false; shipGroup.add(s); flames.push(s); }
const bubble = new THREE.Mesh(own(new THREE.SphereGeometry(1, 16, 10)), own(new THREE.MeshBasicMaterial({ color: 0x5cc8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })));
bubble.renderOrder = 7;
shipGroup.add(bubble);
scene.add(shipGroup);
let shipInfo = shipGeo[0].info, shipRGB = hexRGB(SHIPS[0].accent);
function applyShip(i) {
const sg = shipGeo[i];
shipBody.geometry = sg.body; shipGlow.geometry = sg.glow; shipInfo = sg.info; shipRGB = hexRGB(SHIPS[i].accent);
for (let k = 0; k < 3; k++) {
const e = sg.info.eng[k];
flames[k].visible = !!e;
if (e) flames[k].position.set(e[0], e[1], e[2] + 0.4);
}
flameMat.color.setHex(SHIPS[i].accent);
bubble.scale.set(sg.info.r, sg.info.r * 0.7, sg.info.r * 1.2);
}

const lanceGeo = own(new THREE.CylinderGeometry(1, 1, 1, 10, 1, true));
lanceGeo.rotateX(-HPI); lanceGeo.translate(0, 0, -0.5);
const lanceOuter = new THREE.Mesh(lanceGeo, own(new THREE.MeshBasicMaterial({ color: 0xc08bff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })));
const lanceCore = new THREE.Mesh(lanceGeo, own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })));
lanceOuter.visible = lanceCore.visible = false; lanceOuter.frustumCulled = lanceCore.frustumCulled = false;
lanceOuter.renderOrder = lanceCore.renderOrder = 8;
scene.add(lanceOuter); scene.add(lanceCore);

const DUST_N = 150, DUST_BOX = 80;
const dustPos = new Float32Array(DUST_N * 3), dustLine = new Float32Array(DUST_N * 6);
for (let i = 0; i < DUST_N * 3; i++) dustPos[i] = rnd(DUST_BOX / 2);
const dustGeo = own(new THREE.BufferGeometry());
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustLine, 3));
const dustMat = own(new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
const dust = new THREE.LineSegments(dustGeo, dustMat);
dust.frustumCulled = false; dust.renderOrder = 4;
scene.add(dust);

const save = { best: [], done: [], gWave: 0, gScore: 0, cr: 0, ship: 0, up: [0, 0, 0, 0, 0], mouse: true, inv: false, lvl: true, shake: true, cam: 0 };
for (let i = 0; i < NM; i++) { save.best.push(0); save.done.push(false); }
(function loadSave() {
let o = null;
try { const raw = api.load('save'); o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
if (!o || typeof o !== 'object') return;
const num = function (v, lo, hi) { const n = Number(v); return isFinite(n) ? clamp(Math.floor(n), lo, hi) : lo; };
for (let i = 0; i < NM; i++) {
save.best[i] = Array.isArray(o.best) ? num(o.best[i], 0, 99999) : 0;
save.done[i] = Array.isArray(o.done) ? o.done[i] === true : false;
if (save.best[i] > 0) save.done[i] = true;
}
save.gWave = num(o.gWave, 0, 9999); save.gScore = num(o.gScore, 0, 9999999); save.cr = num(o.cr, 0, 9999999);
save.ship = num(o.ship, 0, SHIPS.length - 1);
for (let i = 0; i < 5; i++) save.up[i] = Array.isArray(o.up) ? num(o.up[i], 0, 4) : 0;
save.mouse = o.mouse !== false; save.inv = o.inv === true; save.lvl = o.lvl !== false; save.shake = o.shake !== false; save.cam = o.cam === 1 ? 1 : 0;
})();
function persist() { try { api.save('save', JSON.stringify(save)); } catch (e) { /* storage blocked */ } }
function campaignScore() { let s = 0; for (let i = 0; i < NM; i++) s += save.best[i]; return s; }
function shipUnlocked(i) { const u = SHIPS[i].unlock; return u === 0 || save.done[u - 1]; }
function lanceUnlocked() { return save.done[LANCE_UNLOCK - 1] || save.ship === 3; }
function missionUnlocked(i) { return i === 0 || save.done[i - 1] || save.done[i] || (i === NM && save.done[0]); }
if (!shipUnlocked(save.ship)) save.ship = 0;

let state = 'title', paused = false, overAt = 0, run = null;
let net = null, NH = false, NG = false, NV = false, lastBy = -1, netOwn = -1; // online: session, host / guest / versus flags
let menuSel = 0, selIdx = 0, hangRow = 0, hangShip = save.ship, setSel = 0, pauseSel = 0, overSel = 0;
let shake = 0, hitFlash = 0, shieldFlash = 0, toastMsg = '', toastCol = UI.hi, toastT = 0, killT = 0, killX = 0, killY = 0;
let hintMsg = '', hintT = 0, touchMode = !!api.isTouch, camMode = save.cam, attractT = 0;
for (let i = 0; i < NM; i++) if (missionUnlocked(i) && !save.done[i]) { selIdx = i; break; }
if (save.done[NM - 1]) selIdx = NM - 1;
const P = {
bt: 'player', on: true, team: 0, r: 2.3, p: new THREE.Vector3(), pp: new THREE.Vector3(), v: new THREE.Vector3(), q: new THREE.Quaternion(),
f: new THREE.Vector3(0, 0, -1), u: new THREE.Vector3(0, 1, 0), rt: new THREE.Vector3(1, 0, 0), pr: 0, yr: 0, rr: 0, spd: 40, thr: 0.55,
boost: 1, boostLock: false, boosting: false, boostWait: 0, shield: 100, hull: 100, regenT: 0, heat: 0, over: false, fireCD: 0, gun: 0,
msl: 6, flares: 8, flareCD: 0, flareRegen: 0, lance: 0, lanceChg: -1, lanceVis: 0, tgt: null, tgtT: 0, lockT: 0, locked: false, lockBeep: 0,
mslHeld: false, fireTap: false, assist: true, dead: false, deadT: 0, inv: 0, contactT: 0, stuckT: 0, outT: 0, sig: 0.5, fireSig: 0, bank: 0,
hitDir: new THREE.Vector3(), hitDirT: 0, mslCD: 0, warnDist: 1e9, lastFireT: 0, overheatOnce: false, respawnT: 0, lastN: null,
};
const ST = { maxSpd: 84, minSpd: 10, boostSpd: 150, accel: 46, turn: 1.6, roll: 2.7, shieldMax: 100, hullMax: 100, dmg: 10, cd: 0.12, heat: 4.3, cool: 34, msl: 6,
lockRate: 1, boostDrain: 0.34, boostRegen: 0.2, regen: 14, guns: 2, lanceRate: 1 / 13 };
function computeStats() {
const sh = SHIPS[save.ship], u = save.up;
ST.maxSpd = sh.maxSpd; ST.minSpd = sh.minSpd; ST.boostSpd = sh.boostSpd; ST.accel = sh.accel; ST.turn = sh.turn; ST.roll = sh.roll;
ST.shieldMax = Math.round(sh.shield * (1 + 0.12 * u[2])); ST.hullMax = sh.hull; ST.dmg = sh.dmg * (1 + 0.1 * u[0]); ST.cd = sh.cd;
ST.heat = sh.heat * (1 - 0.08 * u[1]); ST.cool = 34 * (1 + 0.12 * u[1]); ST.msl = sh.msl + u[3]; ST.lockRate = (1 / 1.05) * (1 + 0.14 * u[3]);
ST.boostDrain = 0.34 / (sh.boost * (1 + 0.14 * u[4])); ST.boostRegen = 0.2 * (1 + 0.12 * u[4]); ST.regen = 14 * (1 + 0.12 * u[2]);
ST.guns = sh.guns; ST.lanceRate = (sh.lance || 1) / 13;
}
const keys = {};
const inp = { sx: 0, sy: 0, stick: false, fire: false, boost: false, msl: false, mx: 0, my: 0, mouseIn: false, mouseArmed: false, mouseUsed: false, mfire: false, kx: 0, ky: 0, ox: 0, oy: 0 };

function toast(msg, col) { toastMsg = msg; toastCol = col || UI.hi; toastT = 2.4; }
function addShake(a) { if (save.shake && !reducedMotion) shake = Math.min(1.6, shake + a); }
function dk() { return run ? run.dk : 1; }

function kindCount(k) { let n = 0; for (let i = 0; i < ENT_MAX; i++) if (ENTS[i].on && ENTS[i].kind === k) n++; return n; }
function warpFx(x, y, z, big) {
flash(x, y, z, big ? 40 : 16, 0.6, 0.8, 1, 0.35);
sparks(x, y, z, big ? 18 : 6, 30, 0.5, 1.6, 0.6, 0.85, 1);
}
function pushFromAst(pt, pad) {
const c = astCell(pt.x, pt.y, pt.z);
for (let k = 0; k < c.length; k++) {
const a = AST[c[k]];
if (!a.on) continue;
V5.subVectors(pt, a.p);
const d = V5.length(), need = a.r + pad;
if (d < need) { if (d < 0.01) V5.set(0, 1, 0); else V5.multiplyScalar(1 / d); pt.copy(a.p).addScaledVector(V5, need + 1); }
}
}
function spawnEnt(kind, x, y, z, opt) {
opt = opt || {};
if (kindCount(kind) >= KCAP[kind]) return null;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (e.on) continue;
const K = KINDS[kind];
e.on = true; e.kind = kind; e.team = kind === 6 ? 0 : 1;
e.hp = e.maxHp = opt.hp || K.hp; e.r = K.r; e.hl = K.hl; e.spd = K.spd * (opt.weak ? 0.66 : 1); e.turn = K.turn * (opt.weak ? 0.75 : 1);
e.p.set(x, y, z);
if (kind !== 7) pushFromAst(e.p, e.r + 3);
e.v.set(0, 0, 0); e.home.copy(e.p); e.goal.copy(e.p);
V1.subVectors(P.p, e.p);
if (V1.lengthSq() < 1) V1.set(0, 0, 1);
e.f.copy(V1.normalize()); e.u.set(0, 1, 0);
if (kind === 7) e.f.set(0, 0, -1);
e.state = 0; e.stT = Math.random() * 2; e.fireT = 2 + Math.random() * 2.5; e.burst = 0; e.burstT = 0; e.mslT = 5 + Math.random() * 4;
e.flash = 0; e.tgt = opt.tgt || null; e.pi = 0; e.armed = 0; e.sleep = !!opt.sleep; e.weak = !!opt.weak; e.armored = false; e.marked = !!opt.marked;
e.shell = opt.shell || 0; e.firstHit = -1; e.stuckT = 0; e.spin = Math.random() * TAU;
e.wing = -1; e.down = 0; e.shield = 0; e.fromCap = !!opt.fromCap; e.jinkT = 0; e.dodge.set(0, 0, 0);
e.patrol = null;
if (opt.patrol) { e.patrol = []; for (let j = 0; j < opt.patrol.length; j++) e.patrol.push(new THREE.Vector3(opt.patrol[j][0], opt.patrol[j][1], opt.patrol[j][2])); e.p.copy(e.patrol[0]); e.home.copy(e.p); }
if (opt.warp) warpFx(e.p.x, e.p.y, e.p.z, kind === 2);
return e;
}
return null;
}
function launchWing() {
for (let w = 0; w < 2; w++) {
V1.copy(P.p).addScaledVector(P.rt, w ? 9 : -9).addScaledVector(P.f, -6).addScaledVector(P.u, 1.5);
const e = spawnEnt(6, V1.x, V1.y, V1.z, {});
if (e) { e.wing = w; e.f.copy(P.f); e.v.copy(P.f).multiplyScalar(P.spd); e.shield = 40; }
}
}

function genAsteroids(seed, env) {
const r = mkRng(seed);
astN = 0;
const n = Math.min(AST_MAX, env.ast || 0);
for (let i = 0; i < n; i++) {
const a = AST[astN];
let x = 0, y = 0, z = 0;
for (let t = 0; t < 4; t++) {
x = (r() * 2 - 1); y = (r() * 2 - 1); z = (r() * 2 - 1);
if (x * x + y * y + z * z <= 1) break;
}
a.p.set(env.ac[0] + x * env.as[0], env.ac[1] + y * env.as[1], env.ac[2] + z * env.as[2]);
const big = r() < 0.08;
a.r = big ? env.amax * (1.2 + r() * 0.9) : env.amin + Math.pow(r(), 2.2) * (env.amax - env.amin);
a.v = Math.floor(r() * 3);
V1.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
a.q.setFromAxisAngle(V1, r() * TAU);
const b = 0.75 + r() * 0.35, pal = PALS[run ? run.pal : 0], tc = hexRGB(pal.c2);
a.tint.setRGB(b * (0.85 + tc[0] * 0.25), b * (0.82 + tc[1] * 0.2), b * (0.8 + tc[2] * 0.25));
a.on = true;
astN++;
}
}
function clearAst(ax, ay, az, bx, by, bz, rad) {
V6.set(bx - ax, by - ay, bz - az);
const L2 = V6.lengthSq();
for (let i = 0; i < astN; i++) {
const a = AST[i];
if (!a.on) continue;
let t = L2 > 0 ? ((a.p.x - ax) * V6.x + (a.p.y - ay) * V6.y + (a.p.z - az) * V6.z) / L2 : 0;
t = clamp(t, 0, 1);
const dx = a.p.x - (ax + V6.x * t), dy = a.p.y - (ay + V6.y * t), dz = a.p.z - (az + V6.z * t);
if (dx * dx + dy * dy + dz * dz < (rad + a.r) * (rad + a.r)) a.on = false;
}
}

const S = {
get t() { return run ? run.t : 0; },
get frt() { return FRT; },
get stn() { return STN; },
get msl() { return P.msl; },
obj: function (text, sub) { run.obj = text; if (sub !== undefined) run.sub = sub; },
objSub: function (s) { run.sub = s; },
hint: function (id, text, touch, dur) {
if (!run || run.hints[id]) return;
run.hints[id] = 1;
hintMsg = touchMode && touch ? touch : text; hintT = dur || 8;
},
toast: function (m, c) { toast(m, c); },
spawn: function (k, x, y, z, opt) { return spawnEnt(k, x, y, z, opt); },
group: function (k, n, x, y, z, s, opt) { for (let i = 0; i < n; i++) spawnEnt(k, x + rnd(s), y + rnd(s * 0.5), z + rnd(s), opt); },
mine: function (x, y, z, opt) { return spawnEnt(4, x, y, z, opt); },
count: function (k) { let n = 0; for (let i = 0; i < ENT_MAX; i++) { const e = ENTS[i]; if (e.on && e.team === 1 && e.kind === k) n++; } return n; },
left: function () { let n = 0; for (let i = 0; i < ENT_MAX; i++) { const e = ENTS[i]; if (e.on && e.team === 1 && e.kind !== 4 && e.kind !== 7) n++; } return n; },
spawnWave: function (w) { spawnWave(w); },
ring: function (x, y, z, r) {
if (ringN >= RING_MAX) return -1;
const g = RINGS[ringN];
g.on = true; g.passed = false; g.p.set(x, y, z); g.r = r || 14;
const prev = ringN > 0 ? RINGS[ringN - 1].p : V0;
g.n.subVectors(g.p, prev);
if (g.n.lengthSq() < 1e-6) g.n.set(0, 0, -1);
g.n.normalize();
return ringN++;
},
ringsDone: function () { return ringNext; },
clear: function (ax, ay, az, bx, by, bz, r) { clearAst(ax, ay, az, bx, by, bz, r); },
wing: function (on) { run.wingOn = !!on; },
freighter: function (path, spd) { setupFreighter(path, spd); },
station: function (x, y, z) {
STN.on = true; STN.p.set(x, y, z); STN.hp = STN.maxHp = 3000; STN.flash = 0; STN.qi.copy(STN.q).conjugate();
stnGroup.visible = true; clearAst(x, y, z, x, y, z, 95);
},
capital: function (d, x, y, z, yaw, opt) { return setupCapital(d, x, y, z, yaw, opt || {}); },
timeLeft: function () { return run.timer; },
stopTimer: function () { run.timerOn = false; },
lanceReady: function () { return lanceUnlocked() && P.lance >= 1; },
reload: function () { P.msl = Math.max(P.msl, ST.msl); P.flares = Math.max(P.flares, 8); toast('MISSILES RELOADED', UI.ok); },
alarmed: function () { return run.alarm; },
signature: function () { return P.sig; },
bonus: function (n, label) { if (n > 0) run.bonus.push([label, Math.round(n)]); },
win: function (msg) { finishRun(true, msg); },
fail: function (msg) { finishRun(false, msg); },
};
function spawnWave(w) {
const near = w.near === 1 && FRT.on && !FRT.arrived ? FRT : w.near === 2 && STN.on ? STN : null;
const base = near ? near.p : P.p;
if (near) {
const a = Math.random() * TAU;
V2.set(Math.cos(a), rnd(0.25), Math.sin(a)).normalize();
} else {
const yaw = rnd(1.1), pitch = rnd(0.35);
V2.copy(P.f).applyAxisAngle(P.u, yaw).applyAxisAngle(P.rt, pitch);
}
const dist = w.dist || (near ? 330 : 400);
V3.copy(base).addScaledVector(V2, dist);
V4.subVectors(V3, run.zc);
if (V4.length() > run.zr * 0.85) { V4.setLength(run.zr * 0.85); V3.copy(run.zc).add(V4); }
warpFx(V3.x, V3.y, V3.z, true);
shock(V3.x, V3.y, V3.z, 60, 0x9fd8ff, 0.8);
if (NH) evp(9, V3, 0, 0, 0);
nz(0.6, { vol: 0.14, filter: 900 });
for (let i = 0; i < w.spawn.length; i++) {
const sp = w.spawn[i];
for (let j = 0; j < sp[1]; j++) {
const e = spawnEnt(sp[0], V3.x + rnd(36), V3.y + rnd(18), V3.z + rnd(36), { warp: true });
if (e && sp[0] === 1 && near) e.tgt = near;
}
}
}
function setupFreighter(path, spd) {
FRT.on = true; FRT.arrived = false; FRT.warpT = 0; FRT.path.length = 0;
for (let i = 0; i < path.length; i++) FRT.path.push(new THREE.Vector3(path[i][0], path[i][1], path[i][2]));
FRT.p.copy(FRT.path[0]); FRT.wp = 1; FRT.spd = spd; FRT.hp = FRT.maxHp = 1500; FRT.prog = 0; FRT.travelled = 0; FRT.flash = 0;
let L = 0;
for (let i = 1; i < FRT.path.length; i++) { L += FRT.path[i].distanceTo(FRT.path[i - 1]); clearAst(path[i - 1][0], path[i - 1][1], path[i - 1][2], path[i][0], path[i][1], path[i][2], 42); }
FRT.total = Math.max(1, L);
FRT.f.subVectors(FRT.path[1], FRT.path[0]).normalize();
frtOrient();
frtGroup.visible = true;
}
function frtOrient() {
M1.lookAt(V0, FRT.f, AY);
FRT.q.setFromRotationMatrix(M1);
FRT.qi.copy(FRT.q).conjugate();
}
function setupCapital(d, x, y, z, yaw, opt) {
let c = null;
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].on) { c = CAPS[i]; break; }
if (!c) return { gens: 0, engs: 0, dead: true, on: false };
const def = CAPDEFS[d], s = def.s;
c.on = true; c.def = d; c.s = s; c.g.scale.set(s, s, s);
c.hull.geometry = capGeo[d].body; c.glow.geometry = capGeo[d].glow;
c.p.set(x, y, z); c.spd = def.spd; c.wp = 0; c.dead = false; c.dying = false; c.dieT = 0; c.boomT = 0; c.lidFlash = 0;
c.path = null;
if (opt.path) {
c.path = [];
for (let i = 0; i < opt.path.length; i++) c.path.push(new THREE.Vector3(opt.path[i][0], opt.path[i][1], opt.path[i][2]));
yaw = Math.atan2(-(c.path[0].x - x), -(c.path[0].z - z));
let px = x, py = y, pz = z;
for (let i = 0; i < c.path.length; i++) { clearAst(px, py, pz, c.path[i].x, c.path[i].y, c.path[i].z, 70 * s); px = c.path[i].x; py = c.path[i].y; pz = c.path[i].z; }
if (c.path.length > 1) clearAst(px, py, pz, c.path[0].x, c.path[0].y, c.path[0].z, 70 * s);
}
clearAst(x, y, z, x, y, z, 120 * s);
c.yaw = yaw; c.q.setFromAxisAngle(AY, yaw); c.qi.copy(c.q).conjugate();
c.v.set(0, 0, 0);
c.hangar = opt.hangar || 0; c.hangarT = 10; c.stopAt = opt.stopAt || 0;
c.subs = [];
c.gens = 0; c.engs = 0;
for (let i = 0; i < def.sub.length; i++) {
const sd = def.sub[i], t = sd[0];
const sub = { bt: 'sub', cap: c, type: t, lp: new THREE.Vector3(sd[1] * s, sd[2] * s, sd[3] * s), ln: new THREE.Vector3(sd[4], sd[5], sd[6]),
p: new THREE.Vector3(), n: new THREE.Vector3(), v: c.v, hp: SUB_HP[t] * (d === 1 ? 1.25 : 1), maxHp: SUB_HP[t] * (d === 1 ? 1.25 : 1), on: true,
r: [4.4, 2.8, 6.2, 7, 5][t] * s, ad: new THREE.Vector3(0, 1, 0), fireT: 2 + Math.random() * 3, burst: 0, burstT: 0, flash: 0, smokeT: 0, team: 1 };
c.subs.push(sub);
if (t === 0) c.gens++;
if (t === 2) c.engs++;
}
c.boxes = [];
for (let i = 0; i < CAP_BOX.length; i++) { const b = CAP_BOX[i]; c.boxes.push([b[0] * s, b[1] * s, b[2] * s, b[3] * s, b[4] * s, b[5] * s]); }
if (d === 1) { c.boxes.push([-29 * s, -4 * s, 0, 5 * s, 4 * s, 35 * s]); c.boxes.push([29 * s, -4 * s, 0, 5 * s, 4 * s, 35 * s]); }
c.R = 112 * s;
c.lid.visible = true; c.reactor.material.color.setHex(0x661010);
c.g.visible = true;
capSubsUpdate(c);
return c;
}

function clearWorld() {
for (let i = 0; i < ENT_MAX; i++) ENTS[i].on = false;
for (let i = 0; i < BOLT_MAX; i++) BOLT[i].on = false;
for (let i = 0; i < MSL_MAX; i++) MSL[i].on = false;
for (let i = 0; i < FLR_MAX; i++) FLR[i].on = false;
for (let i = 0; i < DEB_MAX; i++) DEB[i].on = false;
for (let i = 0; i < PICK_MAX; i++) PICK[i].on = false;
for (let i = 0; i < RING_MAX; i++) RINGS[i].on = false;
for (let i = 0; i < SHOCK_MAX; i++) { SHOCK[i].on = false; SHOCK[i].m.visible = false; }
for (let i = 0; i < CAPS.length; i++) { CAPS[i].on = false; CAPS[i].g.visible = false; CAPS[i].subs = []; }
ringN = 0; ringNext = 0;
FRT.on = false; frtGroup.visible = false; STN.on = false; stnGroup.visible = false;
FX.clear(); SMK.clear();
lanceOuter.visible = lanceCore.visible = false;
for (let i = 0; i < astN; i++) AST[i].on = false;
astN = 0;
}
const GAUNTLET = { name: 'Gauntlet', pal: 2, par: 0, reserves: 0, brief: 'Endless waves. How long can you last?',
env: { planet: [0.4, -0.4, -0.8], pr: 150, pc: [0x8a60c0, 0x201040], ring: true, ast: 70, ac: [0, 0, -200], as: [600, 220, 600], amin: 4, amax: 26 } };
function beginRun(kind, mi, ns) { // ns: online match setup (shared sector, palette and seed)
const def = ns ? ns.def : kind === 'mission' ? MISSIONS[mi] : GAUNTLET;
clearWorld();
audioStop();
const gpal = ns ? ns.pal : kind === 'gauntlet' ? Math.floor(Math.random() * PALS.length) : def.pal;
const r = {
kind: kind, mi: mi, def: def, pal: gpal, t: 0, done: false, ok: false, endT: 0, endDelay: 2.5, result: null, m: {}, obj: '', sub: '',
hints: {}, kills: 0, killPts: 0, bonus: [], reserves: def.reserves || 0, usedRes: 0, timer: def.timer || 0, timerOn: !!def.timer,
jam: !!def.jam, alarm: false, wingOn: false, dk: kind === 'mission' ? 0.55 + mi * 0.04 : 0.72,
zc: new THREE.Vector3(def.env.ac[0], def.env.ac[1], def.env.ac[2]), zr: Math.max(def.env.as[0], def.env.as[1], def.env.as[2]) + 650,
wave: 0, gT: 3, gBreak: false, wingOrder: 0,
};
run = r;
paintEnv(ns ? ns.sky : kind === 'mission' ? mi : 20 + Math.floor(Math.random() * 40), gpal, def.env, def.fog);
genAsteroids(ns ? ns.seed : kind === 'mission' ? 1000 + mi * 77 : Math.floor(Math.random() * 99999), def.env);
rebuildAst(); // valid grid while the mission script places its units
computeStats();
applyShip(save.ship);
P.p.set(0, 0, 0); P.pp.copy(P.p); P.q.set(0, 0, 0, 1); P.f.set(0, 0, -1); P.u.set(0, 1, 0); P.rt.set(1, 0, 0);
P.pr = P.yr = P.rr = 0; P.thr = 0.55; P.spd = lerp(ST.minSpd, ST.maxSpd, P.thr); P.v.copy(P.f).multiplyScalar(P.spd);
P.boost = 1; P.boostLock = false; P.boosting = false; P.boostWait = 0; P.shield = ST.shieldMax; P.hull = ST.hullMax; P.regenT = 0;
P.heat = 0; P.over = false; P.fireCD = 0; P.gun = 0; P.msl = ST.msl; P.flares = 8; P.flareCD = 0; P.flareRegen = 0;
P.lance = lanceUnlocked() ? 1 : 0; P.lanceChg = -1; P.lanceVis = 0; P.tgt = null; P.tgtT = 0; P.lockT = 0; P.locked = false; P.lockBeep = 0;
P.mslHeld = false; P.fireTap = false; P.assist = true; P.dead = false; P.deadT = 0; P.inv = 2.5; P.contactT = 0; P.stuckT = 0; P.outT = 0;
P.sig = 0.5; P.fireSig = 0; P.bank = 0; P.hitDirT = 0; P.mslCD = 0; P.warnDist = 1e9; P.overheatOnce = false; P.respawnT = 0;
shipGroup.visible = true; shipGlowMat.color.setRGB(1, 1, 1);
hintMsg = ''; hintT = 0;
if (def.setup) def.setup(S, r.m);
if (kind === 'gauntlet') { r.wingOn = true; r.obj = 'Survive the Gauntlet'; r.sub = 'Wave 1 incoming'; }
clearAst(0, 0, 40, 0, 0, -280, 46);
rebuildAst();
if (r.wingOn) launchWing();
state = 'play'; paused = false; shake = 0; hitFlash = 0; shieldFlash = 0; toastT = 0; killT = 0; hitMarkT = 0; acc = 0;
inp.mouseArmed = false; autoX = 0; autoY = 0;
toast(def.name.toUpperCase(), UI.hi);
snapCamera();
audioStart();
}
function restartRun() { if (run) beginRun(run.kind, run.mi); else beginRun('mission', selIdx < NM ? selIdx : 0); }

function finishRun(ok, msg) {
if (!run || run.done) return;
const r = run;
r.done = true; r.ok = ok; r.endT = 0; r.endDelay = ok ? 2.8 : 2.6;
const res = { title: '', sub: msg || '', lines: [], score: 0, campaign: 0, newBest: false, notes: [], ok: ok, credits: 0, best: false };
const shipsBefore = []; for (let i = 0; i < SHIPS.length; i++) shipsBefore.push(shipUnlocked(i));
const lanceBefore = lanceUnlocked();
if (r.kind === 'gauntlet') {
const waves = Math.max(0, r.wave - 1);
res.title = 'Gauntlet over';
res.score = r.killPts + waves * 250;
res.lines.push(['Waves cleared', String(waves)], ['Machines downed', String(r.kills)], ['Gauntlet score', fmtNum(res.score)]);
if (waves > save.gWave) save.gWave = waves;
if (res.score > save.gScore) { save.gScore = res.score; res.notes.push('New Gauntlet record!'); }
res.credits = Math.floor(res.score / 12);
} else if (ok) {
const def = r.def;
const timeB = def.par ? Math.min(1500, Math.max(0, Math.round((def.par - r.t) * 6))) : 0;
const hullB = Math.round(600 * clamp(P.hull / ST.hullMax, 0, 1));
let bonus = 0;
for (let i = 0; i < r.bonus.length; i++) bonus += r.bonus[i][1];
const pen = r.usedRes * 400;
res.score = Math.max(100, Math.round(1000 + r.killPts + timeB + hullB + bonus - pen));
res.title = 'Mission complete';
res.lines.push(['Objective', '+1,000'], ['Machines downed (' + r.kills + ')', '+' + fmtNum(r.killPts)]);
if (def.par) res.lines.push(['Time ' + fmtTime(r.t) + ' (par ' + fmtTime(def.par) + ')', '+' + fmtNum(timeB)]);
res.lines.push(['Hull ' + Math.round(100 * clamp(P.hull / ST.hullMax, 0, 1)) + '%', '+' + fmtNum(hullB)]);
for (let i = 0; i < r.bonus.length; i++) res.lines.push([r.bonus[i][0], '+' + fmtNum(r.bonus[i][1])]);
if (pen) res.lines.push(['Backup frames used (' + r.usedRes + ')', '-' + fmtNum(pen)]);
if (res.score > save.best[r.mi]) { save.best[r.mi] = res.score; res.best = true; }
save.done[r.mi] = true;
res.credits = Math.floor(res.score / 8);
} else {
res.title = 'Mission failed';
res.lines.push(['Machines downed', String(r.kills)], ['Time', fmtTime(r.t)]);
res.credits = Math.floor(r.killPts / 20);
}
save.cr += res.credits;
for (let i = 0; i < SHIPS.length; i++) if (!shipsBefore[i] && shipUnlocked(i)) res.notes.push('New ship unlocked: ' + SHIPS[i].name);
if (!lanceBefore && lanceUnlocked()) res.notes.push('Lance beam unlocked: press E in combat');
if (r.kind === 'mission' && ok && r.mi + 1 < NM && !save.done[r.mi + 1] && res.notes.length < 2) res.notes.push('Next mission unlocked: ' + MISSIONS[r.mi + 1].name);
persist();
res.campaign = campaignScore();
let nb = false;
try { nb = !!api.submit(res.campaign); } catch (e) { nb = false; }
res.newBest = nb;
r.result = res;
if (ok) { tri(523, 0.14, 0.2); tri(659, 0.14, 0.2, 0.12); tri(784, 0.34, 0.22, 0.24); }
else snd(220, 0.5, { type: 'sawtooth', vol: 0.12, slide: 90 });
}
function toOver() { state = 'over'; overAt = performance.now(); overSel = 0; audioStop(); clearHeld(); }
function leaveRun(to) {
if (run && !run.done) finishRun(false, run.kind === 'gauntlet' ? 'Gauntlet abandoned.' : 'Mission aborted.');
run = null; state = to; paused = false; audioStop(); clearHeld(); toastT = 0;
setupAttract();
}

function leadPoint(sp, sv, tp, tv, s, out) {
const rx = tp.x - sp.x, ry = tp.y - sp.y, rz = tp.z - sp.z;
const wx = tv.x - (sv ? sv.x : 0), wy = tv.y - (sv ? sv.y : 0), wz = tv.z - (sv ? sv.z : 0);
const a = wx * wx + wy * wy + wz * wz - s * s, b = 2 * (rx * wx + ry * wy + rz * wz), c = rx * rx + ry * ry + rz * rz;
let t = Math.sqrt(c) / s;
const disc = b * b - 4 * a * c;
if (Math.abs(a) > 1e-6 && disc >= 0) {
const sd = Math.sqrt(disc), t1 = (-b - sd) / (2 * a), t2 = (-b + sd) / (2 * a);
t = t1 > 0 && (t1 < t2 || t2 <= 0) ? t1 : t2 > 0 ? t2 : t;
}
if (!(t >= 0) || t > 3) t = Math.min(3, Math.sqrt(c) / s);
out.set(tp.x + wx * t, tp.y + wy * t, tp.z + wz * t);
return t;
}
function capDist(e, x, y, z) {
let dx = x - e.p.x, dy = y - e.p.y, dz = z - e.p.z;
if (e.hl > 0) {
const t = clamp(dx * e.f.x + dy * e.f.y + dz * e.f.z, -e.hl, e.hl);
dx -= e.f.x * t; dy -= e.f.y * t; dz -= e.f.z * t;
}
return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function segHit(ax, ay, az, bx, by, bz, cx, cy, cz, r) {
const dx = bx - ax, dy = by - ay, dz = bz - az, L2 = dx * dx + dy * dy + dz * dz;
let t = L2 > 0 ? ((cx - ax) * dx + (cy - ay) * dy + (cz - az) * dz) / L2 : 0;
t = t < 0 ? 0 : t > 1 ? 1 : t;
const ex = ax + dx * t - cx, ey = ay + dy * t - cy, ez = az + dz * t - cz;
return ex * ex + ey * ey + ez * ez <= r * r;
}
function boxPush(body, pt, r) {
V7.subVectors(pt, body.p).applyQuaternion(body.qi);
let hit = false;
for (let i = 0; i < body.boxes.length; i++) {
const b = body.boxes[i];
const dx = V7.x - b[0], dy = V7.y - b[1], dz = V7.z - b[2];
const px = b[3] + r - Math.abs(dx), py = b[4] + r - Math.abs(dy), pz = b[5] + r - Math.abs(dz);
if (px <= 0 || py <= 0 || pz <= 0) continue;
hit = true;
if (px < py && px < pz) { V7.x += dx < 0 ? -px : px; V8.set(dx < 0 ? -1 : 1, 0, 0); }
else if (py < pz) { V7.y += dy < 0 ? -py : py; V8.set(0, dy < 0 ? -1 : 1, 0); }
else { V7.z += dz < 0 ? -pz : pz; V8.set(0, 0, dz < 0 ? -1 : 1); }
}
if (hit) { V8.applyQuaternion(body.q); pt.copy(V7.applyQuaternion(body.q)).add(body.p); }
return hit;
}
function inBoxes(body, x, y, z, pad) {
V7.set(x - body.p.x, y - body.p.y, z - body.p.z).applyQuaternion(body.qi);
for (let i = 0; i < body.boxes.length; i++) {
const b = body.boxes[i];
if (Math.abs(V7.x - b[0]) < b[3] + pad && Math.abs(V7.y - b[1]) < b[4] + pad && Math.abs(V7.z - b[2]) < b[5] + pad) return true;
}
return false;
}
function rayBoxes(body, o, d, maxT) {
V7.subVectors(o, body.p).applyQuaternion(body.qi);
VP.copy(d).applyQuaternion(body.qi);
let best = maxT;
for (let i = 0; i < body.boxes.length; i++) {
const b = body.boxes[i];
let t0 = 0, t1 = best;
for (let ax = 0; ax < 3; ax++) {
const oc = ax === 0 ? V7.x - b[0] : ax === 1 ? V7.y - b[1] : V7.z - b[2];
const dd = ax === 0 ? VP.x : ax === 1 ? VP.y : VP.z, hh = b[3 + ax];
if (Math.abs(dd) < 1e-8) { if (oc < -hh || oc > hh) { t0 = 1; t1 = 0; break; } continue; }
let ta = (-hh - oc) / dd, tb = (hh - oc) / dd;
if (ta > tb) { const tt = ta; ta = tb; tb = tt; }
if (ta > t0) t0 = ta;
if (tb < t1) t1 = tb;
if (t0 > t1) break;
}
if (t0 <= t1 && t0 < best) best = t0;
}
return best;
}
function rayBlock(o, d, maxT) {
let best = maxT;
for (let i = 0; i < astN; i++) {
const a = AST[i];
if (!a.on) continue;
const ox = a.p.x - o.x, oy = a.p.y - o.y, oz = a.p.z - o.z, t = ox * d.x + oy * d.y + oz * d.z;
if (t < 0 || t - a.r > best) continue;
const r2 = ox * ox + oy * oy + oz * oz - t * t, rr2 = a.r * a.r * 0.85;
if (r2 < rr2) { const th = t - Math.sqrt(rr2 - r2); if (th < best) best = Math.max(0, th); }
}
for (let i = 0; i < CAPS.length; i++) if (CAPS[i].on && !CAPS[i].dead) best = rayBoxes(CAPS[i], o, d, best);
if (FRT.on && !FRT.arrived) best = rayBoxes(FRT, o, d, best);
if (STN.on) best = rayBoxes(STN, o, d, best);
return best;
}

let autoX = 0, autoY = 0;
function steerInput(h) {
const tx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), ty = (keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0);
const kr = tx || ty ? 6 : 10;
inp.kx += (tx - inp.kx) * Math.min(1, kr * h); inp.ky += (ty - inp.ky) * Math.min(1, kr * h);
let sx = inp.kx, sy = inp.ky;
if (save.mouse && inp.mouseIn && inp.mouseArmed) {
const R = Math.min(VW, VH) * 0.3;
let dx = (inp.mx - VW / 2) / R, dy = -(inp.my - VH / 2) / R;
const l = Math.sqrt(dx * dx + dy * dy);
if (l < 0.07) { dx = 0; dy = 0; } else { const k = Math.min(1, (l - 0.07) / 0.93) / l; dx *= k; dy *= k; }
sx += dx; sy += dy;
}
if (inp.stick) { sx += inp.sx; sy -= inp.sy; }
if (save.inv) sy = -sy;
if (P.outT > 2.5) { sx = autoX; sy = autoY; }
inp.ox = clamp(sx, -1, 1); inp.oy = clamp(sy, -1, 1);
}
function flyStep(h) {
if (P.dead) {
P.deadT += h;
P.v.multiplyScalar(1 - 0.35 * h);
P.pp.copy(P.p); P.p.addScaledVector(P.v, h);
E1.set(0.4 * h, 0.25 * h, 0.9 * h, 'XYZ'); Q1.setFromEuler(E1); P.q.multiply(Q1).normalize();
P.f.set(0, 0, -1).applyQuaternion(P.q); P.u.set(0, 1, 0).applyQuaternion(P.q); P.rt.set(1, 0, 0).applyQuaternion(P.q);
if (Math.random() < 0.3) sparks(P.p.x + rnd(1.5), P.p.y + rnd(1), P.p.z + rnd(1.5), 1, 8, 0.4, 0.8, 1, 0.75, 0.4);
if (Math.random() < 0.15) smoke(P.p.x, P.p.y, P.p.z, 1, 2.5, true, 1.6);
if (P.respawnT > 0 && P.deadT >= P.respawnT && !run.done) respawnPlayer();
return;
}
steerInput(h);
const roll = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
const drift = !P.assist;
const tk = ST.turn * (drift ? 1.25 : 1) * (P.boosting ? 0.82 : 1);
const tp = inp.oy * tk, ty = -inp.ox * tk * 0.85;
let tr = -roll * ST.roll;
if (save.lvl && P.assist && roll === 0 && Math.abs(P.f.y) < 0.88) {
const bank = Math.atan2(P.rt.y, P.u.y);
tr += clamp(-bank * 1.7, -1.3, 1.3);
}
const kk = Math.min(1, 9 * h);
P.pr += (tp - P.pr) * kk; P.yr += (ty - P.yr) * kk; P.rr += (tr - P.rr) * Math.min(1, 7 * h);
E1.set(P.pr * h, P.yr * h, P.rr * h, 'XYZ');
Q1.setFromEuler(E1);
P.q.multiply(Q1).normalize();
P.f.set(0, 0, -1).applyQuaternion(P.q); P.u.set(0, 1, 0).applyQuaternion(P.q); P.rt.set(1, 0, 0).applyQuaternion(P.q);
if (keys.KeyW) P.thr = Math.min(1, P.thr + 0.75 * h);
if (keys.KeyS) P.thr = Math.max(0, P.thr - 0.75 * h);
const want = (keys.ShiftLeft || keys.ShiftRight || inp.boost) && !P.boostLock && P.boost > 0;
if (want) {
if (!P.boosting) { nz(0.5, { vol: 0.1, filter: 700 }); snd(90, 0.35, { type: 'sawtooth', vol: 0.06, slide: 160 }); }
P.boosting = true; P.boost -= ST.boostDrain * h; P.boostWait = 0.8;
if (P.boost <= 0) { P.boost = 0; P.boostLock = true; P.boosting = false; toast('BOOST EMPTY', UI.dim); }
} else {
P.boosting = false; P.boostWait -= h;
if (P.boostWait <= 0) P.boost = Math.min(1, P.boost + ST.boostRegen * h);
if (P.boostLock && P.boost >= 0.3) P.boostLock = false;
}
const target = P.boosting ? ST.boostSpd : lerp(ST.minSpd, ST.maxSpd, P.thr);
const ac = (P.boosting ? ST.accel * 2.4 : ST.accel) * h;
P.spd += clamp(target - P.spd, -ac * 1.3, ac);
V1.copy(P.f).multiplyScalar(P.spd);
P.v.lerp(V1, Math.min(1, (P.assist ? 3.4 : 0.42) * h));
P.pp.copy(P.p);
P.p.addScaledVector(P.v, h);
playerCollide(h);
if (ringNext < ringN) {
const g = RINGS[ringNext];
const d0 = (P.pp.x - g.p.x) * g.n.x + (P.pp.y - g.p.y) * g.n.y + (P.pp.z - g.p.z) * g.n.z;
const d1 = (P.p.x - g.p.x) * g.n.x + (P.p.y - g.p.y) * g.n.y + (P.p.z - g.p.z) * g.n.z;
if ((d0 < 0) !== (d1 < 0)) { // either direction counts, so a missed ring can be taken on the way back
const t = d0 / (d0 - d1);
V2.copy(P.pp).lerp(P.p, t);
if (V2.distanceTo(g.p) <= g.r + 1.5) {
g.passed = true; ringNext++;
tri(880, 0.1, 0.14); tri(1320, 0.16, 0.12, 0.08);
flash(g.p.x, g.p.y, g.p.z, g.r * 2.4, 1, 0.85, 0.4, 0.35);
if (run.timerOn) { run.timer += 4; toast('+4 s', UI.ok); }
}
}
}
V2.subVectors(P.p, run.zc);
const zd = V2.length();
if (zd > run.zr) {
P.outT += h;
V2.multiplyScalar(-1 / Math.max(1, zd));
Q2.copy(P.q).conjugate();
V3.copy(V2).applyQuaternion(Q2);
autoX = V3.z > 0.5 ? 1 : clamp(V3.x * 3, -1, 1); autoY = clamp(V3.y * 3, -1, 1);
} else P.outT = Math.max(0, P.outT - h * 2);
P.fireSig = Math.max(0, P.fireSig - h * 0.7);
P.sig = clamp(0.22 + 0.62 * (P.spd / ST.maxSpd) + (P.boosting ? 0.55 : 0) + P.fireSig, 0.15, 1.7);
}
function playerCollide(h) {
let contact = false;
const c = astCell(P.p.x, P.p.y, P.p.z);
for (let k = 0; k < c.length; k++) {
const a = AST[c[k]];
if (!a.on) continue;
V1.subVectors(P.p, a.p);
const d = V1.length(), R = a.r * 0.93 + P.r;
if (d < R && d > 0.001) { V1.multiplyScalar(1 / d); P.p.copy(a.p).addScaledVector(V1, R); bumpPlayer(V1); contact = true; }
}
for (let i = 0; i < CAPS.length; i++) {
const cp = CAPS[i];
if (!cp.on || cp.dead || P.p.distanceToSquared(cp.p) > (cp.R + 12) * (cp.R + 12)) continue;
if (boxPush(cp, P.p, P.r)) { bumpPlayer(V8); contact = true; }
}
if (FRT.on && !FRT.arrived && P.p.distanceToSquared(FRT.p) < 900 && boxPush(FRT, P.p, P.r)) { bumpPlayer(V8); contact = true; }
if (STN.on && P.p.distanceToSquared(STN.p) < 72 * 72) {
if (boxPush(STN, P.p, P.r)) { bumpPlayer(V8); contact = true; }
V1.subVectors(P.p, STN.p);
const hr = Math.sqrt(V1.x * V1.x + V1.z * V1.z);
if (hr > 1) {
V2.set(STN.p.x + V1.x / hr * 55, STN.p.y, STN.p.z + V1.z / hr * 55);
V3.subVectors(P.p, V2);
const d = V3.length();
if (d < 5.5 + P.r && d > 0.001) { V3.multiplyScalar(1 / d); P.p.copy(V2).addScaledVector(V3, 5.5 + P.r); bumpPlayer(V3); contact = true; }
}
}
if (contact) {
P.contactT += h;
if (P.contactT > 2 && (keys.KeyW || P.thr > 0.2)) S.hint('wedge', 'Scraping hull! Ease off with S and steer away from the obstacle.', 'Scraping hull! Slide the throttle down and steer away.', 6);
if (P.contactT > 3.5) {
P.p.addScaledVector(P.lastN, 14); P.v.copy(P.lastN).multiplyScalar(20); P.contactT = 0;
toast('AUTO-RECOVER', UI.cyan); warpFx(P.p.x, P.p.y, P.p.z, false);
}
} else P.contactT = Math.max(0, P.contactT - h * 1.5);
}
const lastN = new THREE.Vector3(0, 1, 0);
P.lastN = lastN;
function bumpPlayer(n) {
lastN.copy(n);
const vn = P.v.dot(n);
if (vn >= 0) return;
P.v.addScaledVector(n, -vn * 1.5);
const sp = -vn;
if (sp > 6) {
sparks(P.p.x - n.x * P.r, P.p.y - n.y * P.r, P.p.z - n.z * P.r, Math.min(14, 2 + Math.floor(sp / 4)), 14, 0.4, 1, 1, 0.8, 0.5);
if (sp > 16) { damagePlayer((sp - 16) * 0.6, P.p.x - n.x * 3, P.p.y - n.y * 3, P.p.z - n.z * 3, true); addShake(Math.min(0.8, sp * 0.015)); nz(0.25, { vol: 0.16, filter: 600 }); }
}
P.spd *= 0.85;
}

function damagePlayer(dmg, hx, hy, hz, bump) {
if (!run || P.dead || P.inv > 0 || (run.done && (run.ok || net))) return; // online: nothing lands after the result
if (NG) { NF.push(4, n1(dmg), n1(hx), n1(hy), n1(hz)); return; } // the host applies it
if (!bump && run.kind === 'mission' && run.mi === 0) dmg *= 0.6;
P.regenT = 3.2;
const hdx = hx - P.p.x, hdy = hy - P.p.y, hdz = hz - P.p.z; // no shared temp: callers (lance, collisions) may be using V1
if (hdx * hdx + hdy * hdy + hdz * hdz > 0.01) { P.hitDir.set(hdx, hdy, hdz).normalize(); P.hitDirT = 1; }
if (P.shield > 0) {
const a = Math.min(P.shield, dmg);
P.shield -= a; dmg -= a; shieldFlash = Math.min(1, shieldFlash + 0.45);
snd(300, 0.08, { type: 'sine', vol: 0.08, slide: 180 });
if (P.shield <= 0) { sq(200, 0.3, 0.08, 90); toast('SHIELDS DOWN', UI.danger); S.hint('shdown', 'Shields down! Break away and avoid fire to let them recharge.', '', 6); }
}
if (dmg > 0) {
P.hull -= dmg;
hitFlash = Math.min(1, hitFlash + 0.3 + dmg * 0.02);
addShake(0.22 + Math.min(0.6, dmg * 0.02));
sparks(hx, hy, hz, 8, 16, 0.5, 1.1, 1, 0.7, 0.3);
nz(0.2, { vol: 0.14, filter: 1400 });
if (P.hull <= 0) playerDown();
}
}
function playerDown() {
P.hull = 0; P.dead = true; P.deadT = 0; P.boosting = false; P.lanceChg = -1; P.mslHeld = false; P.tgt = null; P.lockT = 0; P.locked = false;
shipGlowMat.color.setRGB(0.12, 0.12, 0.15);
sparks(P.p.x, P.p.y, P.p.z, 40, 22, 0.8, 1.6, 1, 0.75, 0.35);
flash(P.p.x, P.p.y, P.p.z, 18, 1, 0.8, 0.5, 0.4);
smoke(P.p.x, P.p.y, P.p.z, 8, 4, true, 2.2);
debris(P.p.x, P.p.y, P.p.z, 5, 10, 0.5, 0xb8c0cc, 0.4, P.v.x, P.v.y, P.v.z);
addShake(1); snd(400, 0.9, { type: 'sawtooth', vol: 0.14, slide: 50 }); nz(0.8, { vol: 0.2, filter: 500 });
toast('SYSTEMS DOWN', UI.danger);
if (net) { P.respawnT = 0; netDown(); }
else if (run.kind === 'mission' && run.reserves - run.usedRes > 0 && !run.done) P.respawnT = 2.6;
else { P.respawnT = 0; finishRun(false, 'Your fighter was knocked out of action and recalled.'); }
}
function respawnPlayer() {
run.usedRes++;
P.dead = false; P.respawnT = 0; P.hull = ST.hullMax; P.shield = ST.shieldMax; P.inv = 3.5; P.heat = 0; P.over = false; P.boost = 1; P.boostLock = false;
shipGlowMat.color.setRGB(1, 1, 1);
P.q.set(0, 0, 0, 1);
V1.subVectors(run.zc, P.p);
if (V1.lengthSq() > 1) { V1.normalize(); M1.lookAt(V0, V1, AY); P.q.setFromRotationMatrix(M1); }
P.f.set(0, 0, -1).applyQuaternion(P.q); P.u.set(0, 1, 0).applyQuaternion(P.q); P.rt.set(1, 0, 0).applyQuaternion(P.q);
P.spd = lerp(ST.minSpd, ST.maxSpd, 0.55); P.v.copy(P.f).multiplyScalar(P.spd); P.pr = P.yr = P.rr = 0;
for (let i = 0; i < MSL_MAX; i++) if (MSL[i].on && MSL[i].team === 1 && MSL[i].tgt === P) MSL[i].tgt = null;
for (let i = 0; i < BOLT_MAX; i++) if (BOLT[i].on && BOLT[i].team === 1 && BOLT[i].p.distanceToSquared(P.p) < 300 * 300) BOLT[i].on = false;
pushFromAst(P.p, P.r + 4);
warpFx(P.p.x, P.p.y, P.p.z, true);
const left = run.reserves - run.usedRes;
toast('BACKUP FRAME ONLINE (' + left + ' left)', UI.ok);
snapCamera(); audioStart();
}

const LASER_COL = [0x9ff4ff, 0xfff08a, 0xffb070, 0xe8c8ff], LASER_RGB = LASER_COL.map(hexRGB);
function targetable(b) {
if (!b || !b.on) return false;
if (b.bt === 'ent') return b.team === 1;
if (b.bt === 'sub') return b.cap.on && !b.cap.dying && (b.type !== 4 || b.cap.gens === 0);
if (b.bt === 'rp') return NV && !b.me;
return false;
}
function fireLasers() {
const gp = shipInfo.guns;
P.gun = (P.gun + 1) % gp.length;
const g = gp[P.gun];
V1.set(g[0], g[1], g[2]).applyQuaternion(P.q).add(P.p);
V3.copy(P.f);
const tg = P.tgt;
if (targetable(tg)) {
leadPoint(V1, P.v, tg.p, tg.v, LASER_SPD, V2);
V4.subVectors(V2, V1);
const d = V4.length();
if (d > 1 && d < 520) {
V4.multiplyScalar(1 / d);
if (V4.dot(P.f) > 0.9936) V3.lerp(V4, 0.9).normalize(); // gentle aim assist inside ~6.5 degrees
}
}
spawnBolt(0, V1.x, V1.y, V1.z, P.v.x + V3.x * LASER_SPD, P.v.y + V3.y * LASER_SPD, P.v.z + V3.z * LASER_SPD, 0.72, ST.dmg, 6, 0.3, LASER_COL[save.ship], P);
const c = LASER_RGB[save.ship];
FX.spawn(V1.x + P.f.x, V1.y + P.f.y, V1.z + P.f.z, P.v.x, P.v.y, P.v.z, 0.06, 1.6, 0.6, c[0], c[1], c[2], 1, 0);
snd(760 + Math.random() * 60, 0.05, { type: 'square', vol: 0.035, slide: 380 });
P.fireSig = Math.min(0.9, P.fireSig + 0.12);
}
function pressMissile() {
if (!run || state !== 'play' || paused || P.dead) return;
P.mslHeld = true;
}
function releaseMissile() {
if (!P.mslHeld) return;
P.mslHeld = false;
if (!run || state !== 'play' || paused || P.dead) return;
if (P.msl <= 0) { toast('NO MISSILES: USE LASERS', UI.danger); sq(150, 0.15, 0.08); return; }
if (P.mslCD > 0) return;
const tg = targetable(P.tgt) ? P.tgt : null;
const m = launchMissile(0, P.p.x - P.u.x * 0.9 + P.f.x * 2, P.p.y - P.u.y * 0.9 + P.f.y * 2, P.p.z - P.u.z * 0.9 + P.f.z * 2, P.f, P.v, tg, false);
if (m) {
m.homing = P.locked && tg ? 1 : tg ? 0.3 : 0;
P.msl--; P.mslCD = 0.3;
if (P.locked) P.lockT = 0.45;
P.locked = false;
nz(0.35, { vol: 0.12, filter: 2400 }); snd(220, 0.3, { type: 'sawtooth', vol: 0.07, slide: 520 });
P.fireSig = Math.min(1, P.fireSig + 0.4);
}
}
function launchMissile(team, x, y, z, dir, vel, tgt, torp) {
if (NG) return netMslReq(x, y, z, dir, vel, tgt);
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i];
if (m.on) continue;
m.on = true; m.team = team; m.p.set(x, y, z); m.f.copy(dir); m.v.copy(vel).addScaledVector(dir, 24); m.tgt = tgt; m.torp = !!torp;
m.life = torp ? 12 : team === 0 ? 6 : 9; m.spd = torp ? 58 : team === 0 ? 150 : 96; m.turn = torp ? 1.0 : team === 0 ? 3.1 : 1.55;
m.dmg = torp ? 95 : team === 0 ? 120 : 30 * dk(); m.hp = torp ? 8 : 4; m.trailT = 0; m.homing = 1; m.r = torp ? 2.2 : 1.6; m.flare = false;
m.col.setHex(team === 0 ? 0xffffff : torp ? 0xff7060 : 0xc04040);
m.own = netOwn;
if (NV && team === 0) { m.team = 2; m.dmg = 70; m.col.setHex(0xffd27a); }
return m;
}
return null;
}
function dropFlares() {
if (!run || P.dead || paused) return;
if (P.flares <= 0) { toast('NO FLARES', UI.danger); return; }
if (P.flareCD > 0) return;
P.flares--; P.flareCD = 0.6; P.flareRegen = 0;
if (net) netFlare();
let n = 0;
for (let i = 0; i < FLR_MAX && n < 4; i++) {
const f = FLR[i];
if (f.on) continue;
f.on = true; f.life = 3.2; f.p.copy(P.p).addScaledVector(P.f, -3);
f.v.copy(P.v).multiplyScalar(0.3).addScaledVector(P.u, rnd(18)).addScaledVector(P.rt, (n & 1 ? 1 : -1) * (14 + Math.random() * 10)).addScaledVector(P.f, -20);
n++;
}
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i];
if (m.on && m.team !== 0 && m.tgt === P && m.p.distanceToSquared(P.p) < 420 * 420 && Math.random() < 0.9) {
for (let k = 0; k < FLR_MAX; k++) if (FLR[k].on) { m.tgt = FLR[k]; m.flare = true; break; }
}
}
snd(1200, 0.2, { type: 'triangle', vol: 0.08, slide: 400 }); nz(0.2, { vol: 0.08, filter: 3000 });
}
function startLance() {
if (!run || P.dead || paused) return;
if (net) { toast('LANCE IS OFFLINE IN ONLINE PLAY', UI.dim); return; }
if (!lanceUnlocked()) { toast('LANCE LOCKED: COMPLETE MISSION ' + LANCE_UNLOCK, UI.dim); return; }
if (P.lanceChg >= 0) return;
if (P.lance < 1) { toast('LANCE CHARGING ' + Math.floor(P.lance * 100) + '%', UI.dim); sq(180, 0.1, 0.06); return; }
P.lanceChg = 0;
snd(200, 0.7, { type: 'sawtooth', vol: 0.08, slide: 900 });
}
function fireLance() {
P.lance = 0;
V1.copy(P.p).addScaledVector(P.f, 3);
V3.copy(P.f);
if (targetable(P.tgt)) {
V4.subVectors(P.tgt.p, V1);
const d = V4.length();
if (d > 1) { V4.multiplyScalar(1 / d); if (V4.dot(P.f) > 0.994) V3.copy(V4); }
}
const L = rayBlock(V1, V3, 620);
let hits = 0;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.team !== 1) continue;
V2.subVectors(e.p, V1);
const t = V2.dot(V3);
if (t < 0 || t > L + e.r) continue;
V2.addScaledVector(V3, -t);
if (V2.length() < e.r + e.hl * 0.5 + 2.6) { damageEnt(e, 220, P, e.p.x, e.p.y, e.p.z); hits++; }
}
for (let c = 0; c < CAPS.length; c++) {
const cp = CAPS[c];
if (!cp.on || cp.dying) continue;
for (let k = 0; k < cp.subs.length; k++) {
const s = cp.subs[k];
if (!s.on) continue;
V2.subVectors(s.p, V1);
const t = V2.dot(V3);
if (t < 0 || t > L + s.r + 4) continue;
V2.addScaledVector(V3, -t);
if (V2.length() < s.r + 2.6) { damageSub(s, 150, P); hits++; }
}
}
lanceOuter.visible = lanceCore.visible = true;
M1.lookAt(V0, V3, P.u); Q1.setFromRotationMatrix(M1);
lanceOuter.position.copy(V1); lanceCore.position.copy(V1);
lanceOuter.quaternion.copy(Q1); lanceCore.quaternion.copy(Q1);
lanceOuter.scale.set(1.6, 1.6, Math.max(1, L)); lanceCore.scale.set(0.55, 0.55, Math.max(1, L));
lanceOuter.material.color.setHex(save.ship === 3 ? 0xc08bff : 0x8fd8ff);
P.lanceVis = 0.5;
for (let i = 0; i < 30; i++) { const t = Math.random() * L; FX.spawn(V1.x + V3.x * t, V1.y + V3.y * t, V1.z + V3.z * t, rnd(6), rnd(6), rnd(6), 0.5, 2.4, 0.4, 0.8, 0.7, 1, 1, 1); }
V2.copy(V1).addScaledVector(V3, L);
flash(V2.x, V2.y, V2.z, 22, 0.9, 0.8, 1, 0.4); sparks(V2.x, V2.y, V2.z, 20, 30, 0.6, 1.6, 0.8, 0.8, 1);
flash(V1.x, V1.y, V1.z, 10, 1, 1, 1, 0.2);
addShake(0.5); P.v.addScaledVector(P.f, -16);
snd(90, 0.6, { type: 'sawtooth', vol: 0.18, slide: 40 }); nz(0.6, { vol: 0.2, filter: 1200 });
P.fireSig = 1.2;
if (hits) toast('LANCE: ' + hits + ' HIT' + (hits > 1 ? 'S' : ''), UI.cyan);
}
function weaponsStep(h) {
if (P.dead) return;
const firing = !!(keys.KeyF || inp.mfire || inp.fire || P.fireTap);
P.fireCD -= h;
if (P.over) { P.heat -= ST.cool * 1.3 * h; P.fireTap = false; if (P.heat <= 35) P.over = false; }
else if (firing && P.fireCD <= 0) {
fireLasers();
P.fireTap = false; P.fireCD = ST.cd; P.heat += ST.heat; P.lastFireT = run.t;
if (P.heat >= 100) {
P.heat = 100; P.over = true; toast('LASERS OVERHEATED', UI.danger); sq(240, 0.3, 0.08, 120);
if (!P.overheatOnce) { P.overheatOnce = true; S.hint('heat', 'Lasers overheat if you hold the trigger. Fire in short bursts.', '', 6); }
}
}
if (!P.over && run.t - P.lastFireT > 0.22) P.heat = Math.max(0, P.heat - ST.cool * h);
P.mslCD -= h; P.flareCD -= h;
P.flareRegen += h;
if (P.flareRegen > 14 && P.flares < 8) { P.flares++; P.flareRegen = 0; }
if (lanceUnlocked() && P.lance < 1 && !net) { P.lance = Math.min(1, P.lance + ST.lanceRate * h); if (P.lance >= 1) tri(1046, 0.18, 0.08); }
if (P.lanceChg >= 0) {
P.lanceChg += h;
V1.copy(P.p).addScaledVector(P.f, 3.4);
if (Math.random() < 0.6) FX.spawn(V1.x + rnd(3), V1.y + rnd(3), V1.z + rnd(3), P.v.x + (V1.x - P.p.x) * 0.2, P.v.y, P.v.z, 0.25, 1.2, 0.2, 0.75, 0.6, 1, 1, 0);
if (P.lanceChg >= 0.7) { P.lanceChg = -1; fireLance(); }
}
P.regenT -= h;
if (P.regenT <= 0 && P.shield < ST.shieldMax && !NG) P.shield = Math.min(ST.shieldMax, P.shield + ST.regen * h);
P.inv -= h;
}

function aimCos(b) {
V1.subVectors(b.p, P.p);
const d = V1.length();
return d > 0.01 ? V1.dot(P.f) / d : 1;
}
function candidate(b) {
if (!targetable(b)) return false;
const d2 = b.p.distanceToSquared(P.p);
if (run.jam && b.bt === 'ent' && b.kind !== 7 && d2 > JAM_RANGE * JAM_RANGE * 2.2) return false;
return d2 < 900 * 900;
}
function autoTarget(h) {
P.tgtT -= h;
if (P.tgt && !targetable(P.tgt)) { P.tgt = null; P.lockT = 0; P.locked = false; }
if (P.tgtT > 0) return;
P.tgtT = 0.25;
let best = null, bc = -2, near = null, nd = 1e12;
const cur = P.tgt ? aimCos(P.tgt) : -2;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.team !== 1 || !candidate(e)) continue;
const c = aimCos(e) + (e.kind === 4 && !e.marked ? -0.02 : 0);
if (c > bc) { bc = c; best = e; }
const d = e.p.distanceToSquared(P.p);
if (e.kind !== 4 && d < nd) { nd = d; near = e; }
}
for (let k = 0; k < CAPS.length; k++) {
const cp = CAPS[k];
if (!cp.on || cp.dying) continue;
for (let j = 0; j < cp.subs.length; j++) {
const s = cp.subs[j];
if (!candidate(s)) continue;
const c = aimCos(s) + (s.type === 4 ? 0.01 : s.type === 0 ? 0.004 : 0);
if (c > bc) { bc = c; best = s; }
const d = s.p.distanceToSquared(P.p);
if (d < nd) { nd = d; near = s; }
}
}
if (NV) for (let i = 0; i < 4; i++) { // Versus: the other pilots
const s = PL[i];
if (!candidate(s)) continue;
const c = aimCos(s), d = s.p.distanceToSquared(P.p);
if (c > bc) { bc = c; best = s; }
if (d < nd) { nd = d; near = s; }
}
if (best && bc > 0.88) {
if (!P.tgt || cur < 0.88 || (best !== P.tgt && bc > cur + 0.025 && bc > 0.975)) { if (best !== P.tgt) { P.lockT = 0; P.locked = false; } P.tgt = best; }
} else if (!P.tgt && near) P.tgt = near;
}
function cycleTarget() {
if (!run || P.dead) return;
const cur = P.tgt ? aimCos(P.tgt) : 2;
let pick = null, pc = -3, top = null, tc = -3;
const consider = function (b) {
if (!candidate(b) || b === P.tgt) return;
const c = aimCos(b);
if (c < cur && c > pc) { pc = c; pick = b; }
if (c > tc) { tc = c; top = b; }
};
for (let i = 0; i < ENT_MAX; i++) if (ENTS[i].on && ENTS[i].team === 1) consider(ENTS[i]);
for (let k = 0; k < CAPS.length; k++) if (CAPS[k].on) for (let j = 0; j < CAPS[k].subs.length; j++) consider(CAPS[k].subs[j]);
if (NV) for (let i = 0; i < 4; i++) consider(PL[i]);
const nt = pick || top;
if (nt) { P.tgt = nt; P.lockT = 0; P.locked = false; P.tgtT = 2.5; sq(660, 0.05, 0.05); }
}
function lockStep(h) {
const tg = P.tgt;
let inCone = false;
if (targetable(tg) && !P.dead) {
V1.subVectors(tg.p, P.p);
const d = V1.length();
inCone = d > 1 && V1.dot(P.f) / d > LOCK_CONE && d < (run.jam ? JAM_RANGE * 1.6 : LOCK_RANGE);
}
if (inCone && P.msl > 0) P.lockT += h * ST.lockRate * (P.mslHeld ? 1.5 : 1);
else P.lockT = Math.max(0, P.lockT - h * 1.4);
if (P.lockT >= 1) {
P.lockT = 1;
if (!P.locked) { P.locked = true; sq(1320, 0.14, 0.07); }
} else P.locked = false;
P.lockBeep -= h;
if (inCone && !P.locked && P.msl > 0 && P.lockT > 0.05 && P.lockBeep <= 0) { sq(880, 0.035, 0.04); P.lockBeep = 0.3 - 0.2 * P.lockT; }
if (P.locked && P.lockBeep <= 0) { sq(1320, 0.03, 0.03); P.lockBeep = 0.5; }
}

function boom(x, y, z, size, vx, vy, vz) {
const k = size;
flash(x, y, z, 7 * k, 1, 0.85, 0.55, 0.3);
sparks(x, y, z, Math.round(10 + 8 * k), 18 * k, 0.7, 1.2 * k, 1, 0.65, 0.25);
for (let i = 0; i < Math.round(4 + 3 * k); i++) FX.spawn(x + rnd(k), y + rnd(k), z + rnd(k), rnd(5 * k) + (vx || 0) * 0.5, rnd(5 * k) + (vy || 0) * 0.5, rnd(5 * k) + (vz || 0) * 0.5, 0.5 + Math.random() * 0.3, 2.5 * k, 4.5 * k, 1, 0.5 + Math.random() * 0.25, 0.15, 0.9, 2);
smoke(x, y, z, Math.round(3 + 2 * k), 2.6 * k, true, 2.4);
}
function soundBoom(x, y, z, big) {
const d = Math.sqrt((x - P.p.x) * (x - P.p.x) + (y - P.p.y) * (y - P.p.y) + (z - P.p.z) * (z - P.p.z));
const v = clamp(1 - d / 520, 0.15, 1);
nz(big ? 1.1 : 0.45, { vol: (big ? 0.34 : 0.2) * v, filter: big ? 500 : 900 });
snd(big ? 70 : 110, big ? 0.6 : 0.25, { type: 'sine', vol: (big ? 0.25 : 0.12) * v, slide: 40 });
}
function markKill(b) {
VP.copy(b.p).project(camera);
if (VP.z < 1) { killX = (VP.x * 0.5 + 0.5) * VW; killY = (-VP.y * 0.5 + 0.5) * VH; killT = 0.7; }
}
function damageEnt(e, dmg, src, hx, hy, hz) {
if (!e.on || e.down > 0) return;
if (e.kind === 6) {
if (e.shield > 0) { const a = Math.min(e.shield, dmg); e.shield -= a; dmg -= a; }
e.hp -= dmg; e.flash = 1; e.regenT = 3;
if (e.hp <= 0) {
e.down = 20; e.hp = e.maxHp; e.shield = 40; boom(e.p.x, e.p.y, e.p.z, 1.2, e.v.x, e.v.y, e.v.z);
debris(e.p.x, e.p.y, e.p.z, 4, 10, 0.6, 0xb8c0cc, 0.3, e.v.x, e.v.y, e.v.z);
toast('KITE-' + (e.wing + 1) + ' KNOCKED OUT: RELAUNCH IN 20 s', UI.dim);
}
return;
}
if (e.armored && src && src.bt !== 'msl' && dmg < 200) dmg *= 0.5;
e.hp -= dmg; e.flash = 1;
if (e.sleep) e.sleep = false;
if (e.kind === 8 && e.firstHit < 0) e.firstHit = run.t;
if (src === P && run.jam && e.kind !== 7) P.fireSig = Math.max(P.fireSig, 0.5);
if (e.hp <= 0) killEnt(e, src);
else if (hx !== undefined) sparks(hx, hy, hz, 4, 10, 0.3, 0.8, 1, 0.8, 0.45);
}
function killEnt(e, src) {
e.on = false;
const k = e.kind, sz = k === 2 ? 3.2 : k === 3 || k === 7 ? 2.6 : k === 1 ? 1.7 : k === 4 ? 1.4 : 1.1;
boom(e.p.x, e.p.y, e.p.z, sz, e.v.x, e.v.y, e.v.z);
debris(e.p.x, e.p.y, e.p.z, k === 2 ? 14 : k === 3 || k === 7 ? 10 : k === 4 ? 3 : 6, 9 + sz * 3, 0.45 * sz, k === 5 ? 0xd8892e : 0x4a5060, 0.35, e.v.x, e.v.y, e.v.z);
if (sz >= 2.5) { shock(e.p.x, e.p.y, e.p.z, 30 * sz, 0xffb070, 0.7); addShake(0.3); }
soundBoom(e.p.x, e.p.y, e.p.z, sz >= 2.5);
if (e.team === 1) {
run.kills++; run.killPts += KINDS[k].pts;
if (src === P || (src && src.team === 0)) markKill(e);
if (src === P && k !== 4) tri(1180, 0.08, 0.09, 0.05);
if (k !== 4 && k !== 5 && k !== 7 && !net) {
const r2 = Math.random(), big = k === 2 || k === 3;
if (r2 < (big ? 0.35 : 0.07)) spawnPick(0, e.p); else if (r2 < (big ? 0.6 : 0.13)) spawnPick(1, e.p);
}
}
if (k === 4) mineBlast(e.p, e);
if (P.tgt === e) { P.tgt = null; P.lockT = 0; P.locked = false; P.tgtT = 0; }
if (NH) netKill(e, src);
}
function mineBlast(p, self) {
flash(p.x, p.y, p.z, 30, 1, 0.5, 0.3, 0.35); shock(p.x, p.y, p.z, 40, 0xff7050, 0.5);
const R = 26;
if (!P.dead && P.p.distanceToSquared(p) < R * R) damagePlayer(48 * (1 - P.p.distanceTo(p) / R) + 12, p.x, p.y, p.z);
if (NH) netBlast(p, R);
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e === self || e.down > 0) continue;
if (e.p.distanceToSquared(p) < R * R) damageEnt(e, e.kind === 4 ? 50 : 60, null, e.p.x, e.p.y, e.p.z);
}
if (FRT.on && !FRT.arrived && FRT.p.distanceToSquared(p) < 40 * 40) damageFrt(110);
addShake(clamp(1 - P.p.distanceTo(p) / 160, 0, 0.6));
}
function damageSub(s, dmg, src) {
const c = s.cap;
if (!s.on || !c.on || c.dying) return;
if (s.type === 4 && c.gens > 0) { c.lidFlash = 1; return; }
s.hp -= dmg; s.flash = 1;
if (s.hp > 0) return;
s.on = false;
boom(s.p.x, s.p.y, s.p.z, s.type === 1 ? 2 : 3, c.v.x, c.v.y, c.v.z);
debris(s.p.x, s.p.y, s.p.z, 8, 14, 1.2 * c.s, 0x4a4f5c, 0.4, c.v.x, c.v.y, c.v.z);
shock(s.p.x, s.p.y, s.p.z, 50, s.type === 0 ? 0x7fd0ff : 0xffb070, 0.7);
addShake(0.4); soundBoom(s.p.x, s.p.y, s.p.z, true);
run.killPts += SUB_PTS[s.type]; run.kills++;
markKill(s);
if (s.type === 0) {
c.gens--;
if (c.gens > 0) toast('SHIELD GENERATOR DOWN: ' + c.gens + ' LEFT', UI.ok);
else { toast('SHIELDS DOWN: REACTOR EXPOSED', UI.ok); c.lid.visible = false; tri(523, 0.2, 0.15); tri(784, 0.3, 0.15, 0.15); }
} else if (s.type === 2) { c.engs--; toast(c.engs > 0 ? 'ENGINE DESTROYED' : 'ALL ENGINES DOWN', UI.ok); }
else if (s.type === 3) { c.hangar = 0; toast('LAUNCH BAY DESTROYED', UI.ok); }
else if (s.type === 4) capitalDeath(c);
if (P.tgt === s) { P.tgt = null; P.lockT = 0; P.locked = false; P.tgtT = 0; }
}
function capitalDeath(c) {
c.dying = true; c.dieT = 0; c.boomT = 0;
toast('REACTOR CRITICAL: GET CLEAR!', UI.hi);
snd(140, 1.2, { type: 'sawtooth', vol: 0.12, slide: 600 });
}
function damageFrt(d) {
if (!FRT.on || FRT.arrived || !run || run.done) return;
FRT.hp -= d; FRT.flash = 1;
S.hint('frtdmg', 'The freighter is taking hits! Kill the bombers and shoot down their slow red torpedoes.', '', 7);
if (FRT.hp <= 0) {
FRT.hp = 0; FRT.on = false; frtGroup.visible = false;
boom(FRT.p.x, FRT.p.y, FRT.p.z, 6); shock(FRT.p.x, FRT.p.y, FRT.p.z, 160, 0xffb070, 1);
debris(FRT.p.x, FRT.p.y, FRT.p.z, 24, 20, 3, 0x8a8f9a, 0.4);
soundBoom(FRT.p.x, FRT.p.y, FRT.p.z, true); addShake(0.8);
finishRun(false, 'The freighter was destroyed.');
}
}
function damageStn(d) {
if (!STN.on || !run || run.done) return;
STN.hp -= d; STN.flash = 1;
if (STN.hp < STN.maxHp * 0.5) S.hint('stndmg', 'The station is below half strength! Bombers first.', '', 6);
if (STN.hp <= 0) {
STN.hp = 0;
boom(STN.p.x, STN.p.y, STN.p.z, 10); shock(STN.p.x, STN.p.y, STN.p.z, 240, 0xffb070, 1.2);
debris(STN.p.x, STN.p.y, STN.p.z, 30, 24, 4, 0x8a909c, 0.4);
soundBoom(STN.p.x, STN.p.y, STN.p.z, true); addShake(1);
finishRun(false, 'The station was destroyed.');
}
}
function spawnPick(kind, p) {
for (let i = 0; i < PICK_MAX; i++) {
const k = PICK[i];
if (k.on) continue;
k.on = true; k.kind = kind; k.p.copy(p); k.life = 25; k.spin = 0;
return;
}
}

const A1 = new THREE.Vector3(), A2 = new THREE.Vector3(), A3 = new THREE.Vector3(), A4 = new THREE.Vector3(), A5 = new THREE.Vector3();
function fireRate() { return run.t < 20 ? 0.6 : 1; }
function enemyShoot(e, aim, dmg, spread, col, spd, life) {
A3.subVectors(aim, e.p).normalize();
A3.x += rnd(spread); A3.y += rnd(spread); A3.z += rnd(spread);
A3.normalize();
const s = spd || EBOLT_SPD;
const ox = e.p.x + e.f.x * (e.r + 1), oy = e.p.y + e.f.y * (e.r + 1), oz = e.p.z + e.f.z * (e.r + 1);
spawnBolt(e.team, ox, oy, oz, A3.x * s, A3.y * s, A3.z * s, life || 1.7, dmg, 3.6, 0.38, col, e);
if (e.p.distanceToSquared(P.p) < 200 * 200) sq(e.team ? 330 : 520, 0.05, 0.02, e.team ? 160 : 260);
}
function avoid(e, D) {
A4.copy(e.p).addScaledVector(e.f, 20);
const c = astCell(A4.x, A4.y, A4.z);
for (let k = 0; k < c.length; k++) {
const a = AST[c[k]];
if (!a.on) continue;
A5.subVectors(e.p, a.p);
const d = A5.length(), m = a.r + e.r + 16;
if (d < m && d > 0.01) D.addScaledVector(A5, (m - d) / (m * d) * 3.5);
}
for (let i = 0; i < CAPS.length; i++) {
const cp = CAPS[i];
if (!cp.on || cp.dead || e.p.distanceToSquared(cp.p) > (cp.R + 40) * (cp.R + 40)) continue;
if (inBoxes(cp, A4.x, A4.y, A4.z, 10)) { A5.subVectors(e.p, cp.p).normalize(); D.addScaledVector(A5, 2.5); D.y += 0.8; }
}
if (STN.on && e.p.distanceToSquared(STN.p) < 110 * 110) { A5.subVectors(e.p, STN.p).normalize(); D.addScaledVector(A5, 1.2); }
}
const AN = new THREE.Vector3(); // entCollide: normal of the last contact (A5 is reused per rock, so it is not always unit length)
function entCollide(e, h) {
let hit = false;
const c = astCell(e.p.x, e.p.y, e.p.z);
for (let k = 0; k < c.length; k++) {
const a = AST[c[k]];
if (!a.on) continue;
A5.subVectors(e.p, a.p);
const d = A5.length(), R = a.r * 0.93 + e.r;
if (d < R && d > 0.001) { A5.multiplyScalar(1 / d); e.p.copy(a.p).addScaledVector(A5, R); e.v.addScaledVector(A5, Math.max(0, -e.v.dot(A5))); AN.copy(A5); hit = true; }
}
for (let i = 0; i < CAPS.length; i++) {
const cp = CAPS[i];
if (!cp.on || cp.dead || e.p.distanceToSquared(cp.p) > (cp.R + 10) * (cp.R + 10)) continue;
if (boxPush(cp, e.p, e.r)) { hit = true; e.v.addScaledVector(V8, Math.max(0, -e.v.dot(V8))); AN.copy(V8); }
}
if (STN.on && e.p.distanceToSquared(STN.p) < 70 * 70 && boxPush(STN, e.p, e.r)) { hit = true; AN.copy(V8); }
if (FRT.on && !FRT.arrived && e.p.distanceToSquared(FRT.p) < 900 && boxPush(FRT, e.p, e.r)) { hit = true; AN.copy(V8); }
if (hit) {
e.stuckT += h;
if (e.stuckT > 2) {
e.p.addScaledVector(AN, 24); e.state = 1; e.stT = 0; e.goal.copy(e.p).addScaledVector(AN, 80); e.stuckT = 0;
if (e.patrol) e.pi = (e.pi + 1) % e.patrol.length; // waypoint behind a rock: skip it
}
} else e.stuckT = Math.max(0, e.stuckT - h);
A5.subVectors(e.p, run.zc);
if (A5.lengthSq() > run.zr * run.zr) { e.state = 1; e.stT = 0; e.goal.copy(run.zc); }
}
function steerEnt(e, D, spd, h, noAvoid) {
if (!noAvoid) avoid(e, D);
if (D.lengthSq() < 1e-8) D.copy(e.f);
D.normalize();
const c = clamp(e.f.dot(D), -1, 1), ang = Math.acos(c);
if (ang > 1e-4) {
A5.crossVectors(e.f, D);
if (A5.lengthSq() < 1e-8) A5.copy(e.u);
A5.normalize();
e.f.applyAxisAngle(A5, Math.min(ang, e.turn * h)).normalize();
}
A5.copy(D).addScaledVector(e.f, -c);
A4.set(0, 1, 0).addScaledVector(A5, 2.4);
A4.addScaledVector(e.f, -A4.dot(e.f));
if (A4.lengthSq() < 1e-4) A4.copy(e.u);
A4.normalize();
e.u.lerp(A4, Math.min(1, 4 * h));
e.u.addScaledVector(e.f, -e.u.dot(e.f));
if (e.u.lengthSq() < 1e-6) e.u.set(0, 1, 0);
e.u.normalize();
A4.copy(e.f).multiplyScalar(spd);
e.v.lerp(A4, Math.min(1, 2.6 * h));
e.p.addScaledVector(e.v, h);
entCollide(e, h);
}
function validFoe(b) {
if (!b || !b.on) return false;
if (b === P) return !P.dead;
if (b.bt === 'ent') return b.down <= 0;
if (b.bt === 'frt') return !b.arrived;
return true;
}
function pickFoeTarget(e) {
const r = Math.random();
if (r < 0.22) {
for (let i = 0; i < ENT_MAX; i++) { const w = ENTS[i]; if (w.on && w.kind === 6 && w.down <= 0 && Math.random() < 0.6) return w; }
}
if (r > 0.86 && FRT.on && !FRT.arrived) return FRT;
if (r > 0.9 && STN.on) return STN;
return NH ? netFoe() : P.dead ? null : P;
}
function nearestFoe(from, maxD) {
let best = null, bd = maxD * maxD;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.team !== 1 || e.kind === 4) continue;
const d = e.p.distanceToSquared(from);
if (d < bd) { bd = d; best = e; }
}
return best;
}
function fighterAI(e, h) {
e.stT += h;
const wing = e.kind === 6;
if (wing) {
const order = run.wingOrder;
let T = null;
if (order === 0) {
T = P.tgt && targetable(P.tgt) && P.tgt.p.distanceToSquared(P.p) < 700 * 700 ? P.tgt : nearestFoe(P.p, 650);
} else {
let best = null, bd = 200 * 200;
for (let i = 0; i < ENT_MAX; i++) {
const f = ENTS[i];
if (!f.on || f.team !== 1 || f.kind === 4) continue;
const d = f.p.distanceToSquared(P.p) * (f.tgt === P ? 0.5 : 1);
if (d < bd) { bd = d; best = f; }
}
T = best;
}
e.tgt = T;
if (!T || run.jam && !run.alarm) {
A1.copy(P.p).addScaledVector(P.rt, e.wing ? 10 : -10).addScaledVector(P.f, -8).addScaledVector(P.u, 2);
A2.subVectors(A1, e.p);
const d = A2.length();
A2.addScaledVector(P.f, Math.min(40, d) * 0.5);
steerEnt(e, A2, clamp(P.spd + d * 0.8, 20, 160), h);
return;
}
} else if (!validFoe(e.tgt) || e.stT > 10) { if (e.state === 0) { e.tgt = pickFoeTarget(e); e.stT = 0; } }
const T = e.tgt;
if (!T) { A2.subVectors(e.home, e.p); steerEnt(e, A2, e.spd * 0.6, h); return; }
A1.subVectors(T.p, e.p);
const d = A1.length();
if (e.state === 0) {
leadPoint(e.p, null, T.p, T.v, wing ? LASER_SPD * 0.7 : EBOLT_SPD, A2);
A1.subVectors(A2, e.p);
e.jinkT -= h;
if (e.jinkT <= 0) { e.jinkT = 0.8 + Math.random(); e.dodge.set(rnd(1), rnd(1), rnd(1)).multiplyScalar(wing ? 4 : e.weak ? 0 : 10); }
A3.copy(A1).add(e.dodge);
const spd = e.spd * (d < 70 ? 0.85 : 1.08) * (e.kind === 8 ? 2 : 1);
if (d < (T === STN ? 90 : T === FRT ? 40 : wing ? 38 : e.weak ? 75 : 55) || e.stT > (wing ? 5 : 7)) {
e.state = 1; e.stT = 0;
A4.set(rnd(1), rnd(1), rnd(1)).normalize();
e.goal.copy(e.p).addScaledVector(A4, e.weak ? 190 : 150).addScaledVector(e.f, 90);
}
const facing = A1.dot(e.f) / Math.max(1, A1.length());
e.fireT -= h * (wing ? 1 : fireRate());
if (e.burst > 0) {
e.burstT -= h;
if (e.burstT <= 0) {
e.burst--; e.burstT = 0.13;
if (wing) enemyShoot(e, A2, 5 * (1 + 0.1 * save.up[0]), 0.015, 0x6ff7e0, LASER_SPD * 0.7);
else enemyShoot(e, A2, (e.weak ? 2.5 : 4.2) * dk(), 0.03 + (1.2 - dk()) * 0.03, 0xff5a3c);
}
} else if (e.fireT <= 0 && facing > 0.975 && d < (wing ? 380 : 320) && !run.done && !(T === P && P.dead)) {
e.burst = wing ? 4 : 3; e.burstT = 0;
e.fireT = wing ? 1 + Math.random() * 0.6 : (1.5 + Math.random() * 1.3) * (e.weak ? 1.8 : 1);
}
steerEnt(e, A3, spd, h);
} else {
A2.subVectors(e.goal, e.p);
const there = A2.lengthSq() < 400; // test before steerEnt, which normalizes A2 in place
steerEnt(e, A2, e.spd * 1.25 * (e.kind === 8 ? 1.6 : 1), h);
if (e.stT > (e.weak ? 3.4 : 2.6) || there) { e.state = 0; e.stT = 0; }
}
}
function bomberAI(e, h) {
e.stT += h;
if (!validFoe(e.tgt)) e.tgt = FRT.on && !FRT.arrived ? FRT : STN.on ? STN : NH ? netFoe() : P.dead ? null : P;
const T = e.tgt;
if (!T) { A2.subVectors(e.home, e.p); steerEnt(e, A2, e.spd * 0.6, h); return; }
A1.subVectors(T.p, e.p);
const d = A1.length(), big = T !== P && T.bt !== 'rp';
e.mslT -= h * fireRate();
if (e.state === 0) {
const facing = A1.dot(e.f) / Math.max(1, d); // before steerEnt, which normalizes A1 in place
steerEnt(e, A1, e.spd, h);
if (big && d < 190 && facing > 0.9 && e.mslT <= 0 && !run.done) {
launchMissile(1, e.p.x, e.p.y - 1, e.p.z, e.f, e.v, T, true);
e.mslT = 8 + Math.random() * 3;
e.state = 1; e.stT = 0;
A4.set(rnd(1), 0.6 + Math.random() * 0.4, rnd(1)).normalize();
e.goal.copy(e.p).addScaledVector(A4, 160);
snd(180, 0.25, { type: 'sawtooth', vol: 0.05, slide: 90 });
} else if (!big) {
e.fireT -= h * fireRate();
if (e.fireT <= 0 && facing > 0.97 && d < 260 && !run.done && validFoe(T)) {
leadPoint(e.p, null, T.p, T.v, EBOLT_SPD, A2);
enemyShoot(e, A2, 7 * dk(), 0.04, 0xff7a3c);
e.fireT = 0.9 + Math.random() * 0.8;
}
if (d < 260 && e.mslT <= 0 && !run.done && validFoe(T)) { launchMissile(1, e.p.x, e.p.y - 1, e.p.z, e.f, e.v, T, true); e.mslT = 12 + Math.random() * 4; }
if (d < 45 || e.stT > 9) { e.state = 1; e.stT = 0; A4.set(rnd(1), rnd(1), rnd(1)).normalize(); e.goal.copy(e.p).addScaledVector(A4, 140); }
} else if (d < (T === STN ? 110 : 60)) { // break off up and away (flying "through" pinned them against the station hull)
e.state = 1; e.stT = 0;
A4.subVectors(e.p, T.p).normalize(); A4.y += 0.7; A4.normalize();
e.goal.copy(e.p).addScaledVector(A4, 150);
}
} else {
A2.subVectors(e.goal, e.p);
const there = A2.lengthSq() < 400; // test before steerEnt, which normalizes A2 in place
steerEnt(e, A2, e.spd * 1.2, h);
if (e.stT > 4 || there) { e.state = 0; e.stT = 0; }
}
}
function frigateAI(e, h) {
e.stT += h;
const T = NH ? netNear(e.p, 1e9) : P.dead ? null : P;
if (!T) { A2.copy(e.f); steerEnt(e, A2, e.spd * 0.5, h); return; }
A1.subVectors(T.p, e.p);
const d = A1.length();
if (d > 330) A2.copy(A1);
else if (d < 160) A2.copy(A1).multiplyScalar(-1);
else { A2.crossVectors(A1, AY); if (A2.lengthSq() < 1) A2.set(1, 0, 0); A2.normalize().multiplyScalar(d).addScaledVector(A1, 0.2); }
steerEnt(e, A2, e.spd, h);
e.mslT -= h * fireRate();
if (e.mslT <= 0 && d < 440 && !run.done) {
launchMissile(1, e.p.x + e.u.x * 3, e.p.y + e.u.y * 3, e.p.z + e.u.z * 3, e.u, e.v, T, false);
e.mslT = (7.5 + Math.random() * 3) / (0.7 + 0.3 * dk());
snd(260, 0.3, { type: 'sawtooth', vol: 0.06, slide: 520 });
}
e.fireT -= h * fireRate();
if (e.burst > 0) {
e.burstT -= h;
if (e.burstT <= 0) { e.burst--; e.burstT = 0.16; leadPoint(e.p, null, T.p, T.v, EBOLT_SPD, A3); enemyShoot(e, A3, 5 * dk(), 0.05, 0xff5a3c); }
} else if (e.fireT <= 0 && d < 240 && !run.done) { e.burst = 4; e.fireT = 2.6 + Math.random() * 1.4; }
}
function sentryAI(e, h) {
e.spin += h * 0.25;
if (e.sleep) { e.f.set(Math.sin(e.spin), 0, Math.cos(e.spin)); return; }
let T = null, dmg = 6 * dk(), spd = EBOLT_SPD;
const tp = NH ? netNear(e.p, 1e9) : P.dead ? null : P, dp = tp ? e.p.distanceTo(tp.p) : 1e9;
if (e.shell && STN.on && dp > 170) { T = STN; dmg = 14; spd = 150; }
else if (dp < 330) T = tp;
if (!T) { e.f.set(Math.sin(e.spin), 0, Math.cos(e.spin)); return; }
leadPoint(e.p, null, T.p, T.v, spd, A2);
A1.subVectors(A2, e.p).normalize();
e.f.lerp(A1, Math.min(1, 2.5 * h)).normalize();
e.fireT -= h * fireRate();
if (e.burst > 0) {
e.burstT -= h;
if (e.burstT <= 0) { e.burst--; e.burstT = 0.14; enemyShoot(e, A2, dmg, T === STN ? 0.01 : 0.04, T === STN ? 0xffa040 : 0xff5a3c, spd, T === STN ? 3.4 : 0); } // shells must reach a station ~350 away
} else if (e.fireT <= 0 && !run.done && e.f.dot(A1) > 0.9) { e.burst = T === STN ? 2 : 4; e.fireT = T === STN ? 3.5 : 2 + Math.random(); }
}
function mineAI(e, h) {
e.spin += h;
e.p.y += Math.sin(e.spin * 0.9 + e.idx) * 0.6 * h;
if (e.armed > 0) {
e.armed -= h;
if (Math.floor(e.armed * 12) % 2 === 0) e.flash = 0.6;
if (e.armed <= 0) { e.hp = 0; killEnt(e, null); }
return;
}
let trig = !P.dead && P.p.distanceToSquared(e.p) < 22 * 22;
if (!trig && NH) trig = !!netNear(e.p, 22);
if (!trig && FRT.on && !FRT.arrived && FRT.p.distanceToSquared(e.p) < 34 * 34) trig = true;
if (!trig) for (let i = 0; i < ENT_MAX; i++) { const w = ENTS[i]; if (w.on && w.kind === 6 && w.down <= 0 && w.p.distanceToSquared(e.p) < 20 * 20) { trig = true; break; } }
if (trig) { e.armed = 0.75; sq(1500, 0.06, 0.06); sq(1500, 0.06, 0.06, 0, 0.18); }
}
function droneAI(e, h) {
e.spin += h * 0.35;
A1.set(e.home.x + Math.cos(e.spin + e.idx) * 14 - e.p.x, e.home.y + Math.sin(e.spin * 0.7) * 5 - e.p.y, e.home.z + Math.sin(e.spin + e.idx) * 14 - e.p.z);
steerEnt(e, A1, e.spd, h, true);
}
function watcherAI(e, h) {
if (run.alarm) { e.spd = 30; e.turn = 1.7; fighterAI(e, h); return; }
const w = e.patrol ? e.patrol[e.pi] : e.home;
A1.subVectors(w, e.p);
if (A1.lengthSq() < 144 && e.patrol) e.pi = (e.pi + 1) % e.patrol.length;
steerEnt(e, A1, e.spd, h);
if (e.firstHit >= 0 && run.t - e.firstHit > 1.6) { triggerAlarm('A watcher called for help!'); return; }
if (P.dead) return;
const R = 30 + 75 * P.sig, d2 = P.p.distanceToSquared(e.p);
let sees = false;
if (d2 < R * R) {
const d = Math.sqrt(d2);
A2.subVectors(P.p, e.p).multiplyScalar(1 / Math.max(0.01, d));
sees = rayBlock(e.p, A2, d) >= d - 1;
}
if (sees) {
e.armed += h * 1.1;
if (e.armed > 0.15) S.hint('seen', 'A watcher is scanning you! Slow down (S) and get out of its ring, or kill it fast.', 'A watcher is scanning you! Slow down and get out of its ring, or kill it fast.', 6);
if (e.armed >= 1) triggerAlarm('DETECTED!');
} else e.armed = Math.max(0, e.armed - h * 0.5);
}
function triggerAlarm(msg) {
if (run.alarm) return;
run.alarm = true;
toast(msg + ' REINFORCEMENTS INBOUND', UI.danger);
for (let i = 0; i < ENT_MAX; i++) { const e = ENTS[i]; if (e.on && e.sleep) e.sleep = false; }
spawnWave({ spawn: [[0, 4]] });
sq(620, 0.18, 0.1); sq(460, 0.18, 0.1, 0, 0.2); sq(620, 0.18, 0.1, 0, 0.4);
}
function entsStep(h) {
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on) continue;
if (e.flash > 0) e.flash = Math.max(0, e.flash - h * 5);
switch (e.kind) {
case 0: fighterAI(e, h); break;
case 1: bomberAI(e, h); break;
case 2: frigateAI(e, h); break;
case 3: sentryAI(e, h); break;
case 4: mineAI(e, h); break;
case 5: droneAI(e, h); break;
case 6:
if (e.down > 0) {
e.down -= h;
if (e.down <= 0) { e.down = 0; e.p.copy(P.p).addScaledVector(P.rt, e.wing ? 12 : -12).addScaledVector(P.f, -10); e.f.copy(P.f); e.v.copy(P.v); warpFx(e.p.x, e.p.y, e.p.z, false); toast('KITE-' + (e.wing + 1) + ' BACK IN FORMATION', UI.ok); }
break;
}
e.regenT = (e.regenT || 0) - h;
if (e.regenT <= 0) e.shield = Math.min(40, e.shield + 8 * h);
fighterAI(e, h); break;
case 7: e.spin += h * 0.4; e.f.set(Math.sin(e.spin), 0, Math.cos(e.spin)); e.u.set(0, 1, 0); break;
default: watcherAI(e, h);
}
}
}

function capSubsUpdate(c) {
for (let i = 0; i < c.subs.length; i++) {
const s = c.subs[i];
s.p.copy(s.lp).applyQuaternion(c.q).add(c.p);
s.n.copy(s.ln).applyQuaternion(c.q);
}
}
function capsStep(h) {
for (let ci = 0; ci < CAPS.length; ci++) {
const c = CAPS[ci];
if (!c.on) continue;
if (c.lidFlash > 0) c.lidFlash = Math.max(0, c.lidFlash - h * 3);
if (c.dying) {
c.dieT += h; c.boomT -= h;
c.p.addScaledVector(c.v, h); c.v.multiplyScalar(1 - 0.5 * h);
capSubsUpdate(c);
if (c.boomT <= 0) {
c.boomT = 0.16 + Math.random() * 0.2;
A1.set(rnd(20), rnd(12), rnd(95)).multiplyScalar(c.s).applyQuaternion(c.q).add(c.p);
boom(A1.x, A1.y, A1.z, 3 + Math.random() * 2); soundBoom(A1.x, A1.y, A1.z, false); addShake(0.15);
debris(A1.x, A1.y, A1.z, 3, 14, 2, 0x4a4f5c, 0.6);
}
if (c.dieT > 3.3) {
boom(c.p.x, c.p.y, c.p.z, 14); flash(c.p.x, c.p.y, c.p.z, 260 * c.s, 1, 0.9, 0.7, 0.7);
shock(c.p.x, c.p.y, c.p.z, 260 * c.s, 0xffc080, 1.4); shock(c.p.x, c.p.y, c.p.z, 160 * c.s, 0x9fd8ff, 1);
for (let k = 0; k < 4; k++) { A1.set(0, 0, (k - 1.5) * 50).multiplyScalar(c.s).applyQuaternion(c.q).add(c.p); boom(A1.x, A1.y, A1.z, 8); }
debris(c.p.x, c.p.y, c.p.z, 46, 26, 7 * c.s, 0x4a4f5c, 0.5);
soundBoom(c.p.x, c.p.y, c.p.z, true); nz(2, { vol: 0.35, filter: 300 }); addShake(1.6);
if (!P.dead && P.p.distanceTo(c.p) < 90 * c.s) damagePlayer(40, c.p.x, c.p.y, c.p.z);
for (let i = 0; i < ENT_MAX; i++) { const e = ENTS[i]; if (e.on && e.team === 1 && e.p.distanceTo(c.p) < 140 * c.s) damageEnt(e, 400, null); }
c.dead = true; c.on = false; c.g.visible = false;
toast('WARSHIP DESTROYED', UI.ok);
}
continue;
}
let spd = c.engs > 0 ? CAPDEFS[c.def].spd : 0;
const shelling = c.stopAt && STN.on && c.p.distanceTo(STN.p) < c.stopAt;
if (shelling) spd = 0;
if (c.path && spd > 0) {
const w = c.path[c.wp];
const dx = w.x - c.p.x, dz = w.z - c.p.z;
if (dx * dx + dz * dz < 60 * 60 && c.path.length > 1) c.wp = (c.wp + 1) % c.path.length;
let dy = Math.atan2(-dx, -dz) - c.yaw;
dy = Math.atan2(Math.sin(dy), Math.cos(dy));
c.yaw += clamp(dy, -0.07 * h, 0.07 * h);
c.p.y += clamp(w.y - c.p.y, -2 * h, 2 * h);
}
c.q.setFromAxisAngle(AY, c.yaw); c.qi.copy(c.q).conjugate();
c.v.set(-Math.sin(c.yaw) * spd, 0, -Math.cos(c.yaw) * spd);
c.p.addScaledVector(c.v, h);
capSubsUpdate(c);
for (let i = 0; i < c.subs.length; i++) {
const s = c.subs[i];
if (s.flash > 0) s.flash = Math.max(0, s.flash - h * 5);
if (!s.on) { s.smokeT -= h; if (s.smokeT <= 0) { s.smokeT = 0.18; smoke(s.p.x, s.p.y, s.p.z, 1, 3 * c.s, true, 2); if (Math.random() < 0.4) sparks(s.p.x, s.p.y, s.p.z, 2, 8, 0.3, 0.8, 1, 0.7, 0.3); } continue; }
if (s.type !== 1) continue;
let T = null;
if (!P.dead && P.p.distanceToSquared(s.p) < (shelling ? 250 * 250 : 340 * 340)) T = P;
else if (shelling) T = STN;
else {
const w = nearestWing(s.p, 260);
if (w) T = w; else if (FRT.on && !FRT.arrived && FRT.p.distanceToSquared(s.p) < 300 * 300) T = FRT;
}
if (!T) continue;
leadPoint(s.p, null, T.p, T.v, EBOLT_SPD, A2);
A1.subVectors(A2, s.p).normalize();
if (A1.dot(s.n) < -0.15) continue;
s.ad.lerp(A1, Math.min(1, 3 * h)).normalize();
s.fireT -= h * fireRate();
if (s.burst > 0) {
s.burstT -= h;
if (s.burstT <= 0) {
s.burst--; s.burstT = 0.15;
A3.copy(s.ad); A3.x += rnd(0.04); A3.y += rnd(0.04); A3.z += rnd(0.04); A3.normalize();
const ox = s.p.x + A3.x * 4 * c.s, oy = s.p.y + A3.y * 4 * c.s, oz = s.p.z + A3.z * 4 * c.s;
spawnBolt(1, ox, oy, oz, A3.x * EBOLT_SPD + c.v.x, A3.y * EBOLT_SPD + c.v.y, A3.z * EBOLT_SPD + c.v.z, 1.8, (T === STN ? 7 : 6) * dk(), 4, 0.45, 0xff6a3a, s);
}
} else if (s.fireT <= 0 && !run.done && s.ad.dot(A1) > 0.95) { s.burst = 3; s.fireT = (2.4 + Math.random() * 1.6) / (0.75 + 0.25 * dk()); }
}
if (c.hangar > 0) {
c.hangarT -= h;
if (c.hangarT <= 0) {
c.hangarT = c.hangar;
if (S.left() < 14) {
A1.set(0, -16 * c.s, -20 * c.s).applyQuaternion(c.q).add(c.p);
for (let k = 0; k < 2; k++) {
const e = spawnEnt(STN.on ? 1 : 0, A1.x + rnd(6), A1.y - k * 6, A1.z + rnd(6), { fromCap: true });
if (e) { e.f.set(0, -1, 0); e.v.copy(c.v); if (STN.on && e.kind === 1) e.tgt = STN; }
}
flash(A1.x, A1.y, A1.z, 14, 1, 0.6, 0.3, 0.3);
toast('WARSHIP LAUNCHING ' + (STN.on ? 'BOMBERS' : 'DRONES'), UI.danger);
}
}
}
}
}
function nearestWing(from, maxD) {
for (let i = 0; i < ENT_MAX; i++) { const w = ENTS[i]; if (w.on && w.kind === 6 && w.down <= 0 && w.p.distanceToSquared(from) < maxD * maxD) return w; }
return null;
}
function frtStep(h) {
if (!FRT.on) return;
if (FRT.flash > 0) FRT.flash = Math.max(0, FRT.flash - h * 4);
if (FRT.arrived) { FRT.warpT += h; if (FRT.warpT > 0.5) frtGroup.visible = false; return; }
const w = FRT.path[FRT.wp];
A1.subVectors(w, FRT.p);
const d = A1.length();
if (d < 10) {
FRT.wp++;
if (FRT.wp >= FRT.path.length) {
FRT.arrived = true; FRT.prog = 1; FRT.warpT = 0;
flash(FRT.p.x, FRT.p.y, FRT.p.z, 90, 0.7, 0.9, 1, 0.6); shock(FRT.p.x, FRT.p.y, FRT.p.z, 120, 0x9fd8ff, 0.9);
snd(220, 0.8, { type: 'sine', vol: 0.15, slide: 1800 });
return;
}
}
A1.multiplyScalar(1 / Math.max(0.01, d));
const c = clamp(FRT.f.dot(A1), -1, 1), ang = Math.acos(c);
if (ang > 1e-4) { A2.crossVectors(FRT.f, A1); if (A2.lengthSq() < 1e-8) A2.set(0, 1, 0); A2.normalize(); FRT.f.applyAxisAngle(A2, Math.min(ang, 0.35 * h)).normalize(); }
FRT.v.copy(FRT.f).multiplyScalar(FRT.spd);
FRT.p.addScaledVector(FRT.v, h);
FRT.travelled += FRT.spd * h;
FRT.prog = Math.min(0.99, FRT.travelled / FRT.total);
frtOrient();
}

function boltHitsAst(b) {
const c = astCell(b.p.x, b.p.y, b.p.z);
for (let k = 0; k < c.length; k++) {
const a = AST[c[k]];
if (!a.on) continue;
const dx = b.p.x - a.p.x, dy = b.p.y - a.p.y, dz = b.p.z - a.p.z;
if (dx * dx + dy * dy + dz * dz < a.r * a.r * 0.9) return true;
}
return false;
}
function boltHitsLid(c, x, y, z) {
if (c.gens <= 0) return false;
V7.set(x - c.p.x, y - c.p.y, z - c.p.z).applyQuaternion(c.qi);
const s = c.s;
return Math.abs(V7.x) < 10 * s && Math.abs(V7.y - 12.7 * s) < 1.6 * s && Math.abs(V7.z - 4 * s) < 56 * s;
}
function boltsStep(h) {
for (let i = 0; i < BOLT_MAX; i++) {
const b = BOLT[i];
if (!b.on) continue;
b.life -= h;
if (b.life <= 0) { b.on = false; continue; }
b.pp.copy(b.p);
b.p.addScaledVector(b.v, h);
const mx = (b.p.x + b.pp.x) * 0.5, my = (b.p.y + b.pp.y) * 0.5, mz = (b.p.z + b.pp.z) * 0.5;
let hit = false;
if (NG || b.team === 2) hit = netBolt(b); // online: guest copies are visual only; Versus fire hits pilots
else if (b.team === 0) {
for (let j = 0; j < ENT_MAX && !hit; j++) {
const e = ENTS[j];
if (!e.on || e.team !== 1) continue;
const q = e.r + e.hl + 7;
if (Math.abs(e.p.x - mx) > q || Math.abs(e.p.y - my) > q || Math.abs(e.p.z - mz) > q) continue;
if (e.hl > 0 ? capDist(e, b.p.x, b.p.y, b.p.z) < e.r || capDist(e, mx, my, mz) < e.r : segHit(b.pp.x, b.pp.y, b.pp.z, b.p.x, b.p.y, b.p.z, e.p.x, e.p.y, e.p.z, e.r)) {
damageEnt(e, b.dmg, b.src, b.p.x, b.p.y, b.p.z); hit = true;
if (b.player) hitMarkT = 0.15;
}
}
for (let j = 0; j < MSL_MAX && !hit; j++) {
const m = MSL[j];
if (!m.on || m.team !== 1) continue;
if (segHit(b.pp.x, b.pp.y, b.pp.z, b.p.x, b.p.y, b.p.z, m.p.x, m.p.y, m.p.z, m.r + 0.6)) {
m.hp -= b.dmg; hit = true;
if (m.hp <= 0) { m.on = false; boom(m.p.x, m.p.y, m.p.z, 0.9); soundBoom(m.p.x, m.p.y, m.p.z, false); if (m.torp) { run.killPts += 25; toast('TORPEDO DOWN', UI.ok); } }
}
}
for (let ci = 0; ci < CAPS.length && !hit; ci++) {
const c = CAPS[ci];
if (!c.on || c.dying || b.p.distanceToSquared(c.p) > (c.R + 8) * (c.R + 8)) continue;
for (let k = 0; k < c.subs.length && !hit; k++) {
const s = c.subs[k];
if (!s.on) continue;
if (segHit(b.pp.x, b.pp.y, b.pp.z, b.p.x, b.p.y, b.p.z, s.p.x, s.p.y, s.p.z, s.r)) {
if (s.type === 4 && c.gens > 0) continue;
damageSub(s, b.dmg, b.src); hit = true;
sparks(b.p.x, b.p.y, b.p.z, 4, 12, 0.3, 0.9, 1, 0.8, 0.45);
if (b.player) hitMarkT = 0.15;
}
}
if (!hit && boltHitsLid(c, b.p.x, b.p.y, b.p.z)) {
hit = true; c.lidFlash = 1;
sparks(b.p.x, b.p.y, b.p.z, 3, 10, 0.3, 0.9, 0.5, 0.8, 1);
if (b.player) S.hint('lid', 'The trench is shielded until every shield generator (blue dome) is destroyed.', '', 7);
}
if (!hit && inBoxes(c, b.p.x, b.p.y, b.p.z, 0)) {
hit = true; sparks(b.p.x, b.p.y, b.p.z, 3, 10, 0.3, 0.8, 1, 0.75, 0.4);
if (b.player) S.hint('armor', 'Warship hulls are armored. Shoot the subsystems: blue generators, orange turrets, purple engines.', '', 8);
}
}
if (!hit && FRT.on && !FRT.arrived && b.p.distanceToSquared(FRT.p) < 900 && inBoxes(FRT, b.p.x, b.p.y, b.p.z, 0)) hit = true;
if (!hit && STN.on && b.p.distanceToSquared(STN.p) < 70 * 70 && inBoxes(STN, b.p.x, b.p.y, b.p.z, 0)) hit = true;
} else {
if (!P.dead && segHit(b.pp.x, b.pp.y, b.pp.z, b.p.x, b.p.y, b.p.z, P.p.x, P.p.y, P.p.z, P.r + 0.5)) { damagePlayer(b.dmg, b.p.x, b.p.y, b.p.z); hit = true; }
if (NH && !hit) hit = netBolt(b);
for (let j = 0; j < ENT_MAX && !hit; j++) {
const e = ENTS[j];
if (!e.on || e.kind !== 6 || e.down > 0) continue;
if (segHit(b.pp.x, b.pp.y, b.pp.z, b.p.x, b.p.y, b.p.z, e.p.x, e.p.y, e.p.z, e.r)) { damageEnt(e, b.dmg, b.src, b.p.x, b.p.y, b.p.z); hit = true; }
}
if (!hit && FRT.on && !FRT.arrived && b.p.distanceToSquared(FRT.p) < 900 && inBoxes(FRT, b.p.x, b.p.y, b.p.z, 0.5)) { damageFrt(b.dmg); hit = true; sparks(b.p.x, b.p.y, b.p.z, 4, 10, 0.3, 0.9, 1, 0.7, 0.4); }
if (!hit && STN.on && b.p.distanceToSquared(STN.p) < 72 * 72) {
let sh = inBoxes(STN, b.p.x, b.p.y, b.p.z, 1);
if (!sh) { const rx = b.p.x - STN.p.x, rz = b.p.z - STN.p.z, hr = Math.sqrt(rx * rx + rz * rz), ry = b.p.y - STN.p.y; sh = (hr - 55) * (hr - 55) + ry * ry < 6.5 * 6.5; }
if (sh) { damageStn(b.dmg); hit = true; sparks(b.p.x, b.p.y, b.p.z, 4, 10, 0.3, 0.9, 1, 0.7, 0.4); }
}
}
if (!hit && boltHitsAst(b)) { hit = true; sparks(b.p.x, b.p.y, b.p.z, 2, 8, 0.3, 0.8, 0.8, 0.7, 0.55); smoke(b.p.x, b.p.y, b.p.z, 1, 1.4, false, 0.8); }
if (hit) b.on = false;
}
}
function mslExplode(m, big) {
m.on = false;
boom(m.p.x, m.p.y, m.p.z, big ? 1.8 : 1.3, m.v.x * 0.2, m.v.y * 0.2, m.v.z * 0.2);
soundBoom(m.p.x, m.p.y, m.p.z, false);
if (NH) evp(8, m.p, big ? 1 : 0, 0, 0);
if (m.team === 0) {
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (e.on && e.team === 1 && e.p.distanceToSquared(m.p) < 100) damageEnt(e, 30, m, e.p.x, e.p.y, e.p.z);
}
}
}
function missilesStep(h) {
P.warnDist = 1e9;
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i];
if (!m.on) continue;
m.life -= h;
if (m.life <= 0) { mslExplode(m, false); continue; }
if (m.tgt && (!m.tgt.on || (m.tgt === P && P.dead) || (m.tgt.bt === 'ent' && m.tgt.down > 0) || (m.tgt.bt === 'frt' && m.tgt.arrived) || (m.tgt.bt === 'sub' && !targetable(m.tgt)))) m.tgt = null;
const T = m.tgt;
if (T) {
A1.subVectors(T.p, m.p);
const d = A1.length();
A1.addScaledVector(T.v, Math.min(2, d / Math.max(30, m.spd)));
A1.normalize();
const c = clamp(m.f.dot(A1), -1, 1), ang = Math.acos(c);
if (ang > 1e-4 && m.homing > 0) {
A2.crossVectors(m.f, A1);
if (A2.lengthSq() > 1e-10) { A2.normalize(); m.f.applyAxisAngle(A2, Math.min(ang, m.turn * m.homing * h)).normalize(); }
}
if (d < (T.r || 2) + 2.5) {
if (T.bt === 'flare') { mslExplode(m, false); continue; }
if (T === P) { lastBy = mOwn(m); damagePlayer(m.dmg, m.p.x, m.p.y, m.p.z); lastBy = -1; }
else if (T.bt === 'rp') damagePilot(T, m.dmg, mOwn(m), m.p.x, m.p.y, m.p.z);
else if (T.bt === 'ent') damageEnt(T, m.dmg, m, m.p.x, m.p.y, m.p.z);
else if (T.bt === 'sub') damageSub(T, m.dmg, m);
else if (T.bt === 'frt') damageFrt(m.dmg);
else if (T.bt === 'stn') damageStn(m.dmg);
mslExplode(m, m.torp);
continue;
}
if (m.team !== 0 && T === P && d < P.warnDist) P.warnDist = d;
}
A3.copy(m.f).multiplyScalar(m.spd);
m.v.lerp(A3, Math.min(1, 3 * h));
m.p.addScaledVector(m.v, h);
m.trailT -= h;
if (m.trailT <= 0) {
m.trailT = 0.025;
const bx = m.p.x - m.f.x * 1.4, by = m.p.y - m.f.y * 1.4, bz = m.p.z - m.f.z * 1.4;
if (m.team === 0) FX.spawn(bx, by, bz, 0, 0, 0, 0.18, 1.4, 0.4, 1, 0.85, 0.6, 1, 0);
else FX.spawn(bx, by, bz, 0, 0, 0, 0.2, m.torp ? 2.2 : 1.5, 0.4, 1, 0.35, 0.25, 1, 0);
SMK.spawn(bx, by, bz, rnd(1), rnd(1), rnd(1), 0.9, 0.6, 2.2, 0.55, 0.55, 0.58, 0.35, 0.5);
}
let hit = false;
if (m.team === 2) hit = netMslHit(m);
else if (m.team === 0) {
for (let j = 0; j < ENT_MAX && !hit; j++) {
const e = ENTS[j];
if (!e.on || e.team !== 1) continue;
if (capDist(e, m.p.x, m.p.y, m.p.z) < e.r + 1.2) { damageEnt(e, m.dmg, m, m.p.x, m.p.y, m.p.z); hit = true; }
}
for (let ci = 0; ci < CAPS.length && !hit; ci++) {
const c = CAPS[ci];
if (!c.on || c.dying || m.p.distanceToSquared(c.p) > (c.R + 8) * (c.R + 8)) continue;
for (let k = 0; k < c.subs.length && !hit; k++) { const s = c.subs[k]; if (s.on && s.p.distanceToSquared(m.p) < (s.r + 1.5) * (s.r + 1.5)) { damageSub(s, m.dmg, m); hit = true; } }
const homingHere = m.tgt && m.tgt.bt === 'sub' && m.tgt.cap === c && m.homing > 0.5;
if (!hit && (boltHitsLid(c, m.p.x, m.p.y, m.p.z) || (!homingHere && inBoxes(c, m.p.x, m.p.y, m.p.z, 0)))) { hit = true; if (c.gens > 0) c.lidFlash = 1; }
}
} else if (m.tgt !== P && !P.dead && m.p.distanceToSquared(P.p) < (P.r + 1.2) * (P.r + 1.2)) { damagePlayer(m.dmg, m.p.x, m.p.y, m.p.z); hit = true; }
if (!hit) {
const c = astCell(m.p.x, m.p.y, m.p.z);
for (let k = 0; k < c.length; k++) { const a = AST[c[k]]; if (a.on && a.p.distanceToSquared(m.p) < a.r * a.r * 0.9) { hit = true; break; } }
}
if (hit) mslExplode(m, m.torp);
}
}
function flaresStep(h) {
for (let i = 0; i < FLR_MAX; i++) {
const f = FLR[i];
if (!f.on) continue;
f.life -= h;
if (f.life <= 0) { f.on = false; continue; }
f.v.multiplyScalar(1 - 1.1 * h);
f.p.addScaledVector(f.v, h);
if (Math.random() < 0.5) FX.spawn(f.p.x, f.p.y, f.p.z, rnd(2), rnd(2), rnd(2), 0.2, 2.6, 0.8, 1, 0.75 + Math.random() * 0.2, 0.4, 1, 0);
}
}
function picksStep(h) {
for (let i = 0; i < PICK_MAX; i++) {
const k = PICK[i];
if (!k.on) continue;
k.life -= h; k.spin += h * 2;
if (k.life <= 0) { k.on = false; continue; }
if (!P.dead && k.p.distanceToSquared(P.p) < 64) {
k.on = false;
if (k.kind === 0) { P.hull = Math.min(ST.hullMax, P.hull + ST.hullMax * 0.3); toast('HULL REPAIRED +30%', UI.ok); }
else { P.msl = Math.min(ST.msl + 4, P.msl + 2); toast('MISSILES +2', UI.ok); }
tri(660, 0.1, 0.14); tri(990, 0.14, 0.14, 0.08);
flash(k.p.x, k.p.y, k.p.z, 8, 0.6, 1, 0.7, 0.3);
}
}
}

function capAlive() { for (let i = 0; i < CAPS.length; i++) if (CAPS[i].on) return true; return false; }
function gauntletStep(h) {
const left = S.left();
if (run.wave === 0 || run.gBreak) {
run.gT -= h;
if (run.gT <= 0) { run.gBreak = false; spawnGauntletWave(); }
} else if (left === 0 && !capAlive()) {
run.gBreak = true; run.gT = 5;
run.killPts += 100;
P.hull = Math.min(ST.hullMax, P.hull + ST.hullMax * 0.25); P.msl = Math.min(ST.msl, P.msl + 2); P.flares = Math.min(8, P.flares + 2);
if (net) netWaveClr();
toast('WAVE ' + run.wave + ' CLEARED: REPAIRS +25%', UI.ok);
tri(660, 0.12, 0.14); tri(880, 0.2, 0.14, 0.1);
}
run.sub = run.gBreak ? 'Next wave in ' + Math.ceil(run.gT) : 'Wave ' + run.wave + '   Hostiles ' + left + (capAlive() ? ' + warship' : '');
}
function spawnGauntletWave() {
run.wave++;
const n = run.wave;
run.dk = Math.min(1.35, 0.72 + 0.035 * n);
const sh = Math.min(14, 2 + Math.floor(n * 1.3)), bo = n >= 3 ? Math.min(6, Math.floor((n - 1) / 2)) : 0, fr = n >= 5 ? Math.min(3, Math.floor((n - 2) / 3)) : 0;
spawnWave({ spawn: [[0, Math.ceil(sh / 2)]] });
spawnWave({ spawn: [[0, Math.floor(sh / 2)], [1, bo]] });
if (fr) spawnWave({ spawn: [[2, fr]], dist: 480 });
if (n >= 4 && n % 3 === 1) { spawnEnt(3, run.zc.x + rnd(200), run.zc.y + rnd(60), run.zc.z + rnd(200), { warp: true }); spawnEnt(3, run.zc.x + rnd(200), run.zc.y + rnd(60), run.zc.z + rnd(200), { warp: true }); }
if (n % 4 === 0) for (let i = 0; i < 10; i++) { V1.set(rnd(1), rnd(0.4), rnd(1)).normalize().multiplyScalar(rr(120, 320)).add(P.p); spawnEnt(4, V1.x, V1.y, V1.z, {}); }
if (n % 6 === 0 && !capAlive() && !net) {
V1.copy(P.f).setY(0); if (V1.lengthSq() < 0.01) V1.set(0, 0, -1); V1.normalize();
V2.copy(P.p).addScaledVector(V1, 560);
if (V2.distanceTo(run.zc) > run.zr * 0.55) { V1.subVectors(run.zc, P.p).setY(0); if (V1.lengthSq() < 1) V1.set(0, 0, -1); V1.normalize(); V2.copy(P.p).addScaledVector(V1, 560); }
V2.y = clamp(P.p.y, run.zc.y - 200, run.zc.y + 200);
setupCapital(0, V2.x, V2.y, V2.z, 0, { path: [[V2.x + 300, V2.y, V2.z], [V2.x - 300, V2.y, V2.z]] });
rebuildAst();
toast('WARSHIP INBOUND', UI.danger);
}
if (net) netWave(n);
toast('WAVE ' + n, UI.danger);
}

function simStep(h) {
if (net) { netSim(h); return; }
run.t += h;
if (run.timerOn && !run.done) {
run.timer -= h;
if (run.timer <= 10 && Math.floor(run.timer + h) !== Math.floor(run.timer)) sq(980, 0.06, 0.06);
if (run.timer <= 0) run.timer = 0;
}
flyStep(h);
weaponsStep(h);
autoTarget(h);
lockStep(h);
if (!run.done) {
if (run.kind === 'gauntlet') gauntletStep(h);
else if (run.def.step) run.def.step(S, run.m);
if (run.timerOn && run.timer <= 0 && !run.done) finishRun(false, 'Out of time.');
}
entsStep(h); capsStep(h); frtStep(h);
if (STN.on && STN.flash > 0) STN.flash = Math.max(0, STN.flash - h * 4);
boltsStep(h); missilesStep(h); flaresStep(h); picksStep(h);
if (run.done) { run.endT += h; if (run.endT >= run.endDelay && state === 'play') toOver(); }
}

const camPos = new THREE.Vector3(0, 4, 14), camUp = new THREE.Vector3(0, 1, 0), camLook = new THREE.Vector3(0, 0, -30);
let fov = BASE_FOV;
function camDesired(out) {
const close = camMode === 1;
out.copy(P.p).addScaledVector(P.f, close ? -6.4 : -12.5).addScaledVector(P.u, close ? 1.55 : 3.6);
}
function camCollide() {
V2.subVectors(camPos, P.p);
const L = V2.length();
if (L < 0.5) return;
V2.multiplyScalar(1 / L);
const t = rayBlock(P.p, V2, L + 1.5);
if (t < L + 1.5) camPos.copy(P.p).addScaledVector(V2, Math.max(2.2, t - 1.5));
}
function snapCamera() {
camDesired(camPos); camUp.copy(P.u); camLook.copy(P.p).addScaledVector(P.f, 40);
camCollide();
applyCamera();
}
function applyCamera() {
camera.position.copy(camPos);
if (shake > 0.001 && !paused) {
const a = shake * shake * 0.7;
camera.position.x += rnd(a); camera.position.y += rnd(a); camera.position.z += rnd(a);
}
camera.up.copy(camUp);
camera.lookAt(camLook);
if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
camera.updateMatrixWorld();
}
function updateCamera(dt) {
if ((state === 'play' || state === 'over' || state === 'nres') && run) {
if (P.dead) V1.copy(P.p).addScaledVector(P.f, -18 - P.deadT * 5).addScaledVector(P.u, 6 + P.deadT * 2);
else camDesired(V1);
camPos.lerp(V1, 1 - Math.exp(-(camMode ? 14 : 9) * dt));
camCollide();
camUp.lerp(P.u, 1 - Math.exp(-5 * dt)).normalize();
V2.copy(P.p).addScaledVector(P.f, camMode ? 60 : 36);
if (P.dead) V2.copy(P.p);
camLook.lerp(V2, 1 - Math.exp(-14 * dt));
const fv = BASE_FOV + (P.boosting ? 12 : 0) + clamp(P.spd / ST.maxSpd, 0, 1.5) * 3;
fov += (fv - fov) * (1 - Math.exp(-4 * dt));
} else {
attractT += dt;
if (state === 'hangar') {
P.q.setFromAxisAngle(AY, attractT * 0.45);
camPos.set(6.5, 2.2, 7.5); camLook.set(-1.6, -0.2, 0);
} else {
E1.set(Math.sin(attractT * 0.5) * 0.06, 0, Math.sin(attractT * 0.35) * 0.18, 'XYZ');
P.q.setFromEuler(E1);
const a = attractT * 0.12 + 0.6;
camPos.set(Math.sin(a) * 13, 3.2 + Math.sin(attractT * 0.2) * 1.5, Math.cos(a) * 13);
V1.subVectors(V0, camPos).normalize(); V2.crossVectors(V1, AY).normalize();
camLook.set(0, 0.4, 0).addScaledVector(V2, -4.2);
}
P.p.set(0, 0, 0); P.v.set(0, 0, 0);
P.f.set(0, 0, -1).applyQuaternion(P.q); P.u.set(0, 1, 0).applyQuaternion(P.q); P.rt.set(1, 0, 0).applyQuaternion(P.q);
camUp.set(0, 1, 0);
fov = BASE_FOV;
}
if (shake > 0) shake = Math.max(0, shake - dt * 2.4);
applyCamera();
}
function setupAttract() {
clearWorld();
paintEnv(7, 2, GAUNTLET.env, null);
genAsteroids(4242, { ast: 40, ac: [0, 0, -260], as: [420, 160, 260], amin: 4, amax: 22 });
clearAst(0, 0, 0, 0, 0, 0, 60);
setupCapital(0, -170, -30, -330, 0.9, {});
rebuildAst();
applyShip(save.ship);
computeStats();
shipGroup.visible = true; shipGlowMat.color.setRGB(1, 1, 1);
P.dead = false; P.boosting = false; P.thr = 0.5; P.spd = 40;
}

let au = null, auPoll = 0, noiseBuf = null, noiseCtx = null;
function hubAudio() {
try {
const r = typeof api.audio === 'function' ? api.audio() : null;
return r && r.ctx && r.out ? r : null;
} catch (e) { return null; }
}
function audioStart() {
if (au || destroyed || state !== 'play' || paused || !run) return;
const a = hubAudio();
if (!a) return;
try {
const ctx = a.ctx, t = ctx.currentTime;
const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
o1.type = 'sawtooth'; o2.type = 'triangle'; o1.frequency.value = 52; o2.frequency.value = 104;
lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 2;
g.gain.value = 0;
o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(a.out);
if (!noiseBuf || noiseCtx !== ctx) {
noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
const d = noiseBuf.getChannelData(0);
for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
noiseCtx = ctx;
}
const src = ctx.createBufferSource();
src.buffer = noiseBuf; src.loop = true;
const bp = ctx.createBiquadFilter(), ng = ctx.createGain();
bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.7;
ng.gain.value = 0;
src.connect(bp); bp.connect(ng); ng.connect(a.out);
const p1 = ctx.createOscillator(), p2 = ctx.createOscillator(), pg = ctx.createGain();
p1.type = 'sine'; p2.type = 'sine'; p1.frequency.value = 55; p2.frequency.value = 82.6;
pg.gain.value = 0;
p1.connect(pg); p2.connect(pg); pg.connect(a.out);
const w1 = ctx.createOscillator(), wg = ctx.createGain();
w1.type = 'square'; w1.frequency.value = 760; wg.gain.value = 0;
w1.connect(wg); wg.connect(a.out);
o1.start(); o2.start(); src.start(); p1.start(); p2.start(); w1.start();
if (ctx.state === 'running') { g.gain.setTargetAtTime(0.04, t, 0.3); pg.gain.setTargetAtTime(0.016, t, 1.2); }
au = { ctx: ctx, o1: o1, o2: o2, lp: lp, g: g, src: src, bp: bp, ng: ng, p1: p1, p2: p2, pg: pg, w1: w1, wg: wg, warnOn: false };
} catch (e) { au = null; }
}
function audioStop() {
if (!au) return;
const a = au;
au = null;
const list = [a.o1, a.o2, a.src, a.p1, a.p2, a.w1];
for (let i = 0; i < list.length; i++) { try { list[i].stop(); } catch (e) { /* already stopped */ } }
const all = [a.o1, a.o2, a.lp, a.g, a.src, a.bp, a.ng, a.p1, a.p2, a.pg, a.w1, a.wg];
for (let i = 0; i < all.length; i++) { try { all[i].disconnect(); } catch (e) { /* ignore */ } }
}
function audioUpdate(dt) {
if (state !== 'play' || paused || !run) return;
if (!au) { auPoll -= dt; if (auPoll <= 0) { auPoll = 1; audioStart(); } return; }
if (au.ctx.state !== 'running') return;
const t = au.ctx.currentTime, thr = P.dead ? 0 : clamp(P.spd / ST.boostSpd, 0, 1);
try {
au.o1.frequency.setTargetAtTime(44 + thr * 70, t, 0.15);
au.o2.frequency.setTargetAtTime(88 + thr * 140, t, 0.15);
au.lp.frequency.setTargetAtTime(220 + thr * 900 + (P.boosting ? 600 : 0), t, 0.2);
au.g.gain.setTargetAtTime(P.dead ? 0 : 0.03 + thr * 0.035, t, 0.2);
au.pg.gain.setTargetAtTime(0.016, t, 1.2);
au.ng.gain.setTargetAtTime(P.boosting ? 0.07 : 0.004 + thr * 0.01, t, 0.15);
au.bp.frequency.setTargetAtTime(500 + thr * 900, t, 0.2);
let on = false;
if (P.warnDist < 450 && !P.dead) {
const rate = 2.5 + (450 - P.warnDist) / 50;
on = Math.floor(performance.now() / 1000 * rate * 2) % 2 === 0;
}
if (on !== au.warnOn) { au.warnOn = on; au.wg.gain.setTargetAtTime(on ? 0.03 : 0, t, 0.008); }
} catch (e) { /* ignore */ }
}

function basisFrom(f, u, out) {
V5.copy(f).multiplyScalar(-1);
V6.crossVectors(u, V5);
if (V6.lengthSq() < 1e-8) V6.set(1, 0, 0);
V6.normalize();
V7.crossVectors(V5, V6);
return out.makeBasis(V6, V7, V5);
}
function dirBasis(d, out) {
V5.copy(d);
if (Math.abs(V5.y) > 0.98) V6.set(1, 0, 0); else V6.set(0, 1, 0);
V7.crossVectors(V6, V5).normalize();
V6.crossVectors(V5, V7);
return out.makeBasis(V7, V6, V5);
}
const kindN = [];
for (let k = 0; k < KINDS.length; k++) kindN.push(0);
let frameNo = 0;
function finishInst(m, c) {
m.count = c; m.visible = c > 0;
if (c) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
}
function syncScene(dt) {
frameNo++;
const playing = state === 'play' && run;
shipGroup.position.copy(P.p);
P.bank += (clamp(P.yr * 0.42, -0.7, 0.7) - P.bank) * Math.min(1, 6 * dt);
Q1.setFromAxisAngle(AZ, P.bank);
shipGroup.quaternion.copy(P.q).multiply(Q1);
const th = P.dead ? 0 : P.boosting ? 1.6 : 0.5 + P.thr * 0.7;
for (let i = 0; i < 3; i++) {
if (!flames[i].visible) continue;
const s = (0.9 + th * 1.4) * (0.85 + Math.random() * 0.3);
flames[i].scale.set(s, s, 1);
}
flameMat.opacity = P.dead ? 0 : 0.75 + 0.25 * Math.random();
bubble.material.opacity = Math.min(0.55, shieldFlash * 0.6 + (P.inv > 0 && playing ? 0.12 + 0.08 * Math.sin(frameNo * 0.5) : 0));
bubble.visible = bubble.material.opacity > 0.01;
if (!P.dead && dt > 0) {
const eng = shipInfo.eng, c = shipRGB;
for (let i = 0; i < eng.length; i++) {
V1.set(eng[i][0], eng[i][1], eng[i][2] + 0.5).applyQuaternion(shipGroup.quaternion).add(P.p);
FX.spawn(V1.x, V1.y, V1.z, P.v.x * 0.7 - P.f.x * 6, P.v.y * 0.7 - P.f.y * 6, P.v.z * 0.7 - P.f.z * 6, P.boosting ? 0.32 : 0.2, P.boosting ? 1.6 : 1.0, 0.25, c[0] * 0.8 + 0.2, c[1] * 0.8 + 0.2, c[2] * 0.8 + 0.2, 0.8, 0);
}
}
for (let k = 0; k < KINDS.length; k++) kindN[k] = 0;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.down > 0) continue;
const k = e.kind, n = kindN[k], km = kindMesh[k];
basisFrom(e.f, e.u, M1);
M1.setPosition(e.p);
km.body.setMatrixAt(n, M1); km.glow.setMatrixAt(n, M1);
const fl = e.flash;
km.body.setColorAt(n, C1.setRGB(1 + fl * 2.5, 1 + fl * 2, 1 + fl * 1.6));
let gr = 1, gg = 1, gb = 1;
if (k === 4) { const b = e.armed > 0 ? (Math.floor(e.armed * 12) % 2 ? 0.3 : 2.2) : 0.6 + 0.4 * Math.sin(e.spin * 3); gr = gg = gb = b; if (e.marked) { gr = 1.6; gg = 1.4; gb = 0.3; } }
else if (k === 8) { if (run && run.alarm) { gr = 1.4; gg = 0.25; gb = 0.2; } else { const a = clamp(e.armed, 0, 1); gr = 1 + a * 0.4; gg = 1 - a * 0.7; gb = 1 - a * 0.7; } }
else if (k === 7) { const p = 0.7 + 0.5 * Math.sin(frameNo * 0.12 + i); gr = gg = gb = p; }
else if (k === 3 && e.sleep) { gr = gg = gb = 0.35; }
km.glow.setColorAt(n, C1.setRGB(gr, gg, gb));
kindN[k] = n + 1;
if (dt > 0 && (k === 0 || k === 1 || k === 6 || k === 2) && (frameNo + i) % 3 === 0) {
const bk = k === 2 ? 12 : k === 1 ? 3.2 : 2.4;
FX.spawn(e.p.x - e.f.x * bk, e.p.y - e.f.y * bk, e.p.z - e.f.z * bk, e.v.x * 0.5, e.v.y * 0.5, e.v.z * 0.5, 0.25, k === 2 ? 3 : 1.2, 0.3, k === 6 ? 0.3 : 1, k === 6 ? 0.95 : 0.45, k === 6 ? 0.85 : 0.25, 0.8, 0);
}
}
for (let k = 0; k < KINDS.length; k++) { finishInst(kindMesh[k].body, kindN[k]); finishInst(kindMesh[k].glow, kindN[k]); }
let n = 0;
for (let i = 0; i < BOLT_MAX; i++) {
const b = BOLT[i];
if (!b.on) continue;
V1.copy(b.v);
const sp = V1.length();
if (sp < 0.01) continue;
V1.multiplyScalar(1 / sp);
dirBasis(V1, M1);
SC.set(b.w, b.w, b.len);
M1.scale(SC);
V2.copy(b.p).addScaledVector(V1, -b.len * 0.5);
M1.setPosition(V2);
boltMesh.setMatrixAt(n, M1); boltMesh.setColorAt(n, b.col);
n++;
}
finishInst(boltMesh, n);
n = 0;
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i];
if (!m.on) continue;
basisFrom(m.f, AY, M1);
if (m.torp) { SC.set(1.7, 1.7, 1.7); M1.scale(SC); }
M1.setPosition(m.p);
mslMesh.setMatrixAt(n, M1); mslMesh.setColorAt(n, m.col);
n++;
}
finishInst(mslMesh, n);
n = 0;
for (let i = 0; i < ringN; i++) {
const g = RINGS[i];
if (!g.on || g.passed) continue;
dirBasis(g.n, M1);
const pulse = i === ringNext ? 1 + 0.06 * Math.sin(frameNo * 0.15) : 1;
SC.set(g.r * pulse, g.r * pulse, g.r * pulse); M1.scale(SC); M1.setPosition(g.p);
ringMesh.setMatrixAt(n, M1);
ringMesh.setColorAt(n, i === ringNext ? C1.setRGB(1.3, 1.05, 0.35) : i === ringNext + 1 ? C1.setRGB(0.35, 0.7, 0.9) : C1.setRGB(0.15, 0.3, 0.42));
n++;
}
finishInst(ringMesh, n);
n = 0;
for (let i = 0; i < PICK_MAX; i++) {
const k = PICK[i];
if (!k.on) continue;
Q1.setFromAxisAngle(AY, k.spin);
SC.set(1, 1, 1); M1.compose(k.p, Q1, SC);
pickMesh.setMatrixAt(n, M1);
pickMesh.setColorAt(n, k.kind === 0 ? C1.setRGB(0.35, 1.2, 0.6) : C1.setRGB(1.2, 0.6, 0.25));
n++;
}
finishInst(pickMesh, n);
let ng = 0, nt = 0, ne = 0, nb = 0;
for (let ci = 0; ci < CAPS.length; ci++) {
const c = CAPS[ci];
if (!c.on) continue;
c.lid.material.opacity = 0.18 + 0.1 * Math.sin(frameNo * 0.07) + c.lidFlash * 0.5;
if (c.gens <= 0) c.reactor.material.color.setRGB(1, 0.25 + 0.2 * Math.sin(frameNo * 0.3), 0.15);
c.hull.material.color.setRGB(1, 1, 1);
if (c.dying) { const f = 1 + 0.6 * Math.abs(Math.sin(c.dieT * 14)); c.hull.material.color.setRGB(f, f * 0.8, f * 0.7); }
for (let i = 0; i < c.subs.length; i++) {
const s = c.subs[i], fl = s.flash;
if (s.type === 0) {
Q1.copy(c.q); SC.set(c.s, c.s, c.s); M1.compose(s.p, Q1, SC);
genMesh.setMatrixAt(ng, M1); genMesh.setColorAt(ng, s.on ? C1.setRGB(1 + fl * 2, 1 + fl * 2, 1 + fl * 2) : C1.setRGB(0.25, 0.22, 0.22));
if (s.on) { domeMesh.setMatrixAt(ng, M1); domeMesh.setColorAt(ng, C1.setRGB(0.35 + fl, 0.75 + fl * 0.5, 1)); }
else domeMesh.setMatrixAt(ng, ZERO_M);
ng++;
} else if (s.type === 1) {
basisFrom(s.ad, s.n, M1);
SC.set(c.s, c.s, c.s); M1.scale(SC); M1.setPosition(s.p);
turMesh.setMatrixAt(nt, M1);
turMesh.setColorAt(nt, s.on ? C1.setRGB(1 + fl * 2.5, 1 + fl * 2, 1 + fl * 1.5) : C1.setRGB(0.2, 0.18, 0.18));
nt++;
} else if (s.type === 2) {
Q1.copy(c.q); SC.set(c.s, c.s, c.s); M1.compose(s.p, Q1, SC);
engMesh.setMatrixAt(ne, M1);
engMesh.setColorAt(ne, s.on ? C1.setRGB(0.75 + fl, 0.45 + fl, 1.2) : C1.setRGB(0.12, 0.1, 0.12));
ne++;
} else if (s.type === 3) {
Q1.copy(c.q); SC.set(c.s, c.s, c.s); M1.compose(s.p, Q1, SC);
bayMesh.setMatrixAt(nb, M1);
bayMesh.setColorAt(nb, s.on ? C1.setRGB(1.2 + fl, 0.55 + fl, 0.2) : C1.setRGB(0.15, 0.12, 0.1));
nb++;
}
}
}
finishInst(genMesh, ng); finishInst(domeMesh, ng); finishInst(turMesh, nt); finishInst(engMesh, ne); finishInst(bayMesh, nb);
if (STN.on) stnRing.rotation.y += dt * 0.08;
n = 0;
for (let i = 0; i < DEB_MAX; i++) {
const d = DEB[i];
if (!d.on) continue;
d.life -= dt;
if (d.life <= 0) { d.on = false; continue; }
d.v.multiplyScalar(1 - 0.25 * dt);
d.p.addScaledVector(d.v, dt);
Q1.setFromAxisAngle(d.ax, d.spin * dt);
d.q.multiply(Q1);
const f = Math.min(1, d.life / 0.6);
SC.copy(d.s).multiplyScalar(f);
M1.compose(d.p, d.q, SC);
debMesh.setMatrixAt(n, M1);
debMesh.setColorAt(n, d.col);
n++;
if (d.ember && dt > 0) { d.et -= dt; if (d.et <= 0) { d.et = 0.06; FX.spawn(d.p.x, d.p.y, d.p.z, 0, 0, 0, 0.35, d.s.x * 1.2, 0.2, 1, 0.55, 0.2, 0.9, 0); } }
}
finishInst(debMesh, n);
for (let i = 0; i < SHOCK_MAX; i++) {
const s = SHOCK[i];
if (!s.on) continue;
s.t += dt;
const u = s.t / s.dur;
if (u >= 1) { s.on = false; s.m.visible = false; continue; }
const sc = s.size * (0.15 + Math.sqrt(u) * 0.85);
s.m.scale.set(sc, sc, sc);
s.m.quaternion.copy(camera.quaternion);
s.m.material.opacity = (1 - u) * 0.75;
}
if (P.lanceVis > 0) {
const a = clamp(P.lanceVis / 0.5, 0, 1);
lanceOuter.material.opacity = a * 0.6; lanceCore.material.opacity = a;
lanceOuter.scale.x = lanceOuter.scale.y = 1.6 * (0.5 + a);
P.lanceVis -= dt;
} else if (lanceOuter.visible) lanceOuter.visible = lanceCore.visible = false;
dust.visible = !!playing;
if (playing) {
const half = DUST_BOX / 2, cx = camera.position.x, cy = camera.position.y, cz = camera.position.z, k = 0.05;
for (let i = 0; i < DUST_N; i++) {
const j = i * 3;
let x = dustPos[j], y = dustPos[j + 1], z = dustPos[j + 2];
if (x - cx > half) x -= DUST_BOX; else if (x - cx < -half) x += DUST_BOX;
if (y - cy > half) y -= DUST_BOX; else if (y - cy < -half) y += DUST_BOX;
if (z - cz > half) z -= DUST_BOX; else if (z - cz < -half) z += DUST_BOX;
dustPos[j] = x; dustPos[j + 1] = y; dustPos[j + 2] = z;
const o = i * 6;
dustLine[o] = x; dustLine[o + 1] = y; dustLine[o + 2] = z;
dustLine[o + 3] = x - P.v.x * k; dustLine[o + 4] = y - P.v.y * k; dustLine[o + 5] = z - P.v.z * k;
}
dustGeo.attributes.position.needsUpdate = true;
dustMat.opacity = clamp(0.12 + P.spd / 200, 0.12, 0.65);
}
FX.update(dt); SMK.update(dt);
placeSky();
}

let VW = 960, VH = 600, hudK = 1, dpr = 1, viewW = 960, viewH = 600, hitMarkT = 0;
const HITS = [];
for (let i = 0; i < 64; i++) HITS.push({ id: '', x: 0, y: 0, w: 0, h: 0 });
let hitN = 0;
function addHit(id, x, y, w, h) { if (hitN >= HITS.length) return; const r = HITS[hitN++]; r.id = id; r.x = x; r.y = y; r.w = w; r.h = h; }
function hitAt(x, y) { for (let i = hitN - 1; i >= 0; i--) { const r = HITS[i]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id; } return ''; }
function font(size, fam, weight) { return (weight ? weight + ' ' : '') + size + 'px ' + fam; }
function T(s, x, y, size, fam, col, align, maxW, weight) {
const c = hctx;
c.font = font(size, fam, weight);
if (maxW) { const w = c.measureText(s).width; if (w > maxW) { size = Math.max(8, Math.floor(size * maxW / w)); c.font = font(size, fam, weight); } }
c.fillStyle = col; c.textAlign = align || 'center'; c.textBaseline = 'middle';
c.fillText(s, x, y);
}
function rrect(x, y, w, h, r) {
const c = hctx, q = Math.max(0, Math.min(r, w / 2, h / 2));
c.beginPath(); c.moveTo(x + q, y);
c.arcTo(x + w, y, x + w, y + h, q); c.arcTo(x + w, y + h, x, y + h, q); c.arcTo(x, y + h, x, y, q); c.arcTo(x, y, x + w, y, q);
c.closePath();
}
function panel(x, y, w, h, fill) { const c = hctx; rrect(x, y, w, h, 18); c.fillStyle = fill || UI.panel; c.fill(); c.lineWidth = 2; c.strokeStyle = UI.stroke; c.stroke(); }
function glass(x, y, w, h, r) { const c = hctx; rrect(x, y, w, h, r || 10); c.fillStyle = UI.glass; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,0.08)'; c.stroke(); }
function bar(x, y, w, h, f, col, bg) {
const c = hctx;
c.fillStyle = bg || 'rgba(255,255,255,0.1)'; c.fillRect(x, y, w, h);
c.fillStyle = col; c.fillRect(x, y, w * clamp(f, 0, 1), h);
}
function button(id, x, y, w, h, label, sel, enabled, size) {
const c = hctx;
rrect(x, y, w, h, 12);
c.fillStyle = sel ? 'rgba(255,201,60,0.18)' : 'rgba(255,255,255,0.06)'; c.fill();
c.lineWidth = sel ? 2 : 1; c.strokeStyle = sel ? UI.hi : 'rgba(255,255,255,0.14)'; c.stroke();
T(label, x + w / 2, y + h / 2 + 1, size || 17, FONT_B, enabled === false ? UI.dim : sel ? UI.hi : UI.head, 'center', w - 16, '700');
addHit(id, x, y, w, h);
}
function blink(now) { return Math.floor(now / 520) % 2 === 0; }
function selBox(x, y, w, h, sel) {
const c = hctx;
rrect(x, y, w, h, 10); c.fillStyle = sel ? 'rgba(255,201,60,0.14)' : 'rgba(255,255,255,0.04)'; c.fill();
c.strokeStyle = sel ? UI.hi : 'rgba(255,255,255,0.08)'; c.lineWidth = sel ? 2 : 1; c.stroke();
}
function makeVig(r, g, b) {
const cv = document.createElement('canvas'); cv.width = 192; cv.height = 120;
const x = cv.getContext('2d'), gr = x.createRadialGradient(96, 60, 30, 96, 60, 115);
gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0.85)');
x.fillStyle = gr; x.fillRect(0, 0, 192, 120);
return cv;
}
const vigRed = makeVig(255, 40, 30), vigBlue = makeVig(60, 170, 255), vigDark = makeVig(0, 0, 0);

const PJ = { x: 0, y: 0, d: 0 };
function proj(p) {
VP.copy(p).applyMatrix4(camera.matrixWorldInverse);
PJ.d = -VP.z;
if (VP.z > -0.5) return false;
VP.applyMatrix4(camera.projectionMatrix);
PJ.x = (VP.x * 0.5 + 0.5) * VW; PJ.y = (-VP.y * 0.5 + 0.5) * VH;
return true;
}
function focal() { return (VH / 2) / Math.tan(camera.fov * Math.PI / 360); }
function onScreen(p, m) { return proj(p) && PJ.x > -m && PJ.x < VW + m && PJ.y > -m && PJ.y < VH + m; }
function edgeArrow(p, col, label) {
VP.copy(p).applyMatrix4(camera.matrixWorldInverse);
let ax = VP.x, ay = -VP.y;
if (VP.z > 0 && Math.abs(ax) + Math.abs(ay) < 0.01) ay = 1;
const a = Math.atan2(ay, ax), cx = VW / 2, cy = VH / 2, rx = VW / 2 - 46, ry = VH / 2 - 46;
const ca = Math.cos(a), sa = Math.sin(a), k = Math.min(rx / Math.max(0.001, Math.abs(ca)), ry / Math.max(0.001, Math.abs(sa)));
const x = cx + ca * k, y = cy + sa * k, c = hctx;
c.save(); c.translate(x, y); c.rotate(a);
c.beginPath(); c.moveTo(14, 0); c.lineTo(-6, -9); c.lineTo(-2, 0); c.lineTo(-6, 9); c.closePath();
c.fillStyle = col; c.fill();
c.restore();
if (label) T(label, x - ca * 22, y - sa * 22, 11, FONT_M, col, 'center');
}
function diamond(x, y, r, col, fill) {
const c = hctx;
c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath();
if (fill) { c.fillStyle = col; c.fill(); } else { c.strokeStyle = col; c.lineWidth = 2; c.stroke(); }
}
function brackets(x, y, s, col, lw) {
const c = hctx, k = Math.max(4, s * 0.4);
c.strokeStyle = col; c.lineWidth = lw || 2;
c.beginPath();
c.moveTo(x - s, y - s + k); c.lineTo(x - s, y - s); c.lineTo(x - s + k, y - s);
c.moveTo(x + s - k, y - s); c.lineTo(x + s, y - s); c.lineTo(x + s, y - s + k);
c.moveTo(x + s, y + s - k); c.lineTo(x + s, y + s); c.lineTo(x + s - k, y + s);
c.moveTo(x - s + k, y + s); c.lineTo(x - s, y + s); c.lineTo(x - s, y + s - k);
c.stroke();
}
function bodyName(b) {
if (b.bt === 'ent') return b.armored ? 'Armored target drone' : KINDS[b.kind].n;
if (b.bt === 'sub') return SUB_NAME[b.type];
if (b.bt === 'rp') return b.name;
return '';
}
function subCol(t) { return t === 0 ? '#6fd0ff' : t === 1 ? '#ff9a4a' : t === 2 ? '#c08bff' : t === 3 ? '#ffb040' : '#ff4d4d'; }

function drawPlay(now) {
const c = hctx, r = run;
if (hitFlash > 0.01) { c.globalAlpha = Math.min(0.85, hitFlash); c.drawImage(vigRed, 0, 0, VW, VH); c.globalAlpha = 1; }
if (shieldFlash > 0.01) { c.globalAlpha = Math.min(0.6, shieldFlash * 0.7); c.drawImage(vigBlue, 0, 0, VW, VH); c.globalAlpha = 1; }
if (r.jam) { c.globalAlpha = 0.35; c.drawImage(vigDark, 0, 0, VW, VH); c.globalAlpha = 1; }
const F = focal();
let shown = 0;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.down > 0 || e === P.tgt) continue;
const d2 = e.p.distanceToSquared(P.p);
const obj = e.kind === 7 || (e.kind === 4 && e.marked);
if (!obj && (d2 > 700 * 700 || (r.jam && d2 > JAM_RANGE * JAM_RANGE * 2.2 && e.kind !== 8))) continue;
if (!onScreen(e.p, 20)) { if (e.kind === 7) edgeArrow(e.p, UI.danger, 'JAM'); continue; }
const s = clamp((e.r + e.hl * 0.4) * F / Math.max(1, PJ.d), 5, 40);
if (e.kind === 6) { c.strokeStyle = UI.friend; c.lineWidth = 1.5; c.beginPath(); c.arc(PJ.x, PJ.y, s + 3, 0, TAU); c.stroke(); T('KITE-' + (e.wing + 1), PJ.x, PJ.y - s - 10, 10, FONT_M, UI.friend); continue; }
if (e.kind === 7) { diamond(PJ.x, PJ.y, s + 8, UI.danger, false); T('JAMMER ' + Math.round(Math.sqrt(d2)) + 'm', PJ.x, PJ.y - s - 18, 11, FONT_M, UI.danger); continue; }
if (e.kind === 4) { if (e.marked || d2 < 160 * 160) diamond(PJ.x, PJ.y, s + 3, e.marked ? UI.hi : 'rgba(255,120,90,0.8)', false); continue; }
if (shown++ > 26) continue;
brackets(PJ.x, PJ.y, s + 2, e.kind === 1 ? 'rgba(255,93,93,0.95)' : 'rgba(255,93,93,0.6)', 1.5);
if (e.kind === 1) diamond(PJ.x, PJ.y - s - 9, 4, UI.danger, true);
if (e.kind === 8 && !r.alarm && PJ.d < 320) {
const R = (30 + 75 * P.sig) * F / Math.max(1, PJ.d);
c.strokeStyle = e.armed > 0.05 ? 'rgba(255,80,60,0.75)' : 'rgba(255,190,80,0.4)'; c.lineWidth = 1.5;
c.beginPath(); c.arc(PJ.x, PJ.y, Math.min(600, R), 0, TAU); c.stroke();
if (e.armed > 0.05) bar(PJ.x - 18, PJ.y + s + 6, 36, 4, e.armed, UI.danger);
}
}
if (FRT.on && !FRT.arrived) {
if (onScreen(FRT.p, 0)) { const s = clamp(22 * F / Math.max(1, PJ.d), 10, 80); c.strokeStyle = FRT.flash > 0.1 ? UI.danger : UI.friend; c.lineWidth = 2; brackets(PJ.x, PJ.y, s, c.strokeStyle, 2); bar(PJ.x - 30, PJ.y + s + 6, 60, 5, FRT.hp / FRT.maxHp, UI.friend); T('FREIGHTER', PJ.x, PJ.y - s - 10, 11, FONT_M, UI.friend); }
else edgeArrow(FRT.p, UI.friend, 'FRT');
}
if (STN.on) {
if (onScreen(STN.p, 0)) { bar(PJ.x - 40, PJ.y - 8, 80, 6, STN.hp / STN.maxHp, UI.friend); T('STATION ' + Math.ceil(100 * STN.hp / STN.maxHp) + '%', PJ.x, PJ.y - 20, 11, FONT_M, STN.flash > 0.1 ? UI.danger : UI.friend); }
else edgeArrow(STN.p, UI.friend, 'STN');
}
if (ringNext < ringN) {
const g = RINGS[ringNext];
if (onScreen(g.p, 0)) { diamond(PJ.x, PJ.y, 7, UI.hi, false); T(Math.round(g.p.distanceTo(P.p)) + 'm', PJ.x, PJ.y + 16, 11, FONT_M, UI.hi); }
else edgeArrow(g.p, UI.hi, 'RING');
}
for (let ci = 0; ci < CAPS.length; ci++) {
const cp = CAPS[ci];
if (!cp.on || cp.dying) continue;
const near = cp.p.distanceToSquared(P.p) < 900 * 900;
if (!onScreen(cp.p, 60)) { edgeArrow(cp.p, UI.danger, 'SHIP'); continue; }
if (!near) { T(CAPDEFS[cp.def].name.toUpperCase(), PJ.x, PJ.y - 14, 11, FONT_M, UI.danger); continue; }
for (let k = 0; k < cp.subs.length; k++) {
const s = cp.subs[k];
if (!s.on || s === P.tgt || (s.type === 4 && cp.gens > 0)) continue;
if (!proj(s.p)) continue;
const sz = clamp(s.r * F / Math.max(1, PJ.d), 3, 18);
c.strokeStyle = subCol(s.type); c.lineWidth = s.type === 4 ? 2.5 : 1.5;
c.strokeRect(PJ.x - sz, PJ.y - sz, sz * 2, sz * 2);
if (s.type === 4) T('REACTOR', PJ.x, PJ.y - sz - 9, 10, FONT_M, UI.danger);
}
}
const tg = targetable(P.tgt) ? P.tgt : null;
if (tg) {
const d = tg.p.distanceTo(P.p);
if (onScreen(tg.p, 0)) {
const tx = PJ.x, ty = PJ.y, s = clamp((tg.r + (tg.hl || 0) * 0.4) * F / Math.max(1, PJ.d), 9, 70) + 4;
const col = tg.bt === 'sub' ? subCol(tg.type) : UI.hi;
brackets(tx, ty, s, col, 2.5);
bar(tx - 26, ty + s + 6, 52, 5, tg.hp / tg.maxHp, col);
T(bodyName(tg) + '  ' + Math.round(d) + 'm', tx, ty - s - 10, 11, FONT_M, col, 'center', 220);
if (P.lockT > 0.01 && P.msl > 0) {
const lr = s + 26 * (1 - P.lockT) + 4;
c.strokeStyle = P.locked ? UI.danger : 'rgba(255,201,60,0.8)'; c.lineWidth = P.locked ? 3 : 2;
c.beginPath(); c.arc(tx, ty, lr, -HPI, -HPI + TAU * P.lockT); c.stroke();
if (P.locked) T('LOCKED', tx, ty + s + 20, 12, FONT_M, UI.danger, 'center', 0, '700');
}
leadPoint(P.p, P.v, tg.p, tg.v, LASER_SPD, V3);
if (d < 600 && proj(V3)) {
diamond(PJ.x, PJ.y, 6, UI.hi, false);
c.strokeStyle = 'rgba(255,201,60,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty); c.lineTo(PJ.x, PJ.y); c.stroke();
}
} else edgeArrow(tg.p, UI.hi, Math.round(d) + 'm');
}
if (P.warnDist < 450) {
for (let i = 0; i < MSL_MAX; i++) { const m = MSL[i]; if (m.on && m.team !== 0 && m.tgt === P && !onScreen(m.p, 0)) edgeArrow(m.p, '#ffffff', ''); }
if (blink(now * 2.2)) T('MISSILE', VW / 2, VH / 2 - 92, 24, FONT_D, UI.danger, 'center');
T(touchMode ? 'Tap FLARE or boost away' : 'R: flares  |  Shift: boost away', VW / 2, VH / 2 - 68, 13, FONT_B, UI.body, 'center');
}
if (P.hitDirT > 0) {
Q2.copy(P.q).conjugate();
V4.copy(P.hitDir).applyQuaternion(Q2);
const a = Math.atan2(-V4.y, V4.x), cx = VW / 2, cy = VH / 2;
c.strokeStyle = 'rgba(255,80,60,' + clamp(P.hitDirT, 0, 1).toFixed(2) + ')'; c.lineWidth = 5;
c.beginPath(); c.arc(cx, cy, 120, a - 0.35, a + 0.35); c.stroke();
}
V4.copy(P.p).addScaledVector(P.f, 140);
let rx = VW / 2, ry = VH / 2;
if (!P.dead && proj(V4)) { rx = PJ.x; ry = PJ.y; }
if (!P.dead) {
c.strokeStyle = P.over ? UI.danger : 'rgba(180,240,255,0.9)'; c.lineWidth = 2;
c.beginPath(); c.arc(rx, ry, 11, 0, TAU); c.stroke();
c.beginPath(); c.moveTo(rx - 22, ry); c.lineTo(rx - 14, ry); c.moveTo(rx + 14, ry); c.lineTo(rx + 22, ry); c.moveTo(rx, ry + 14); c.lineTo(rx, ry + 20); c.stroke();
c.fillStyle = c.strokeStyle; c.fillRect(rx - 1, ry - 1, 2, 2);
if (hitMarkT > 0) {
c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath();
c.moveTo(rx - 8, ry - 8); c.lineTo(rx - 4, ry - 4); c.moveTo(rx + 8, ry - 8); c.lineTo(rx + 4, ry - 4);
c.moveTo(rx - 8, ry + 8); c.lineTo(rx - 4, ry + 4); c.moveTo(rx + 8, ry + 8); c.lineTo(rx + 4, ry + 4); c.stroke();
}
if (save.mouse && inp.mouseIn && inp.mouseUsed && !touchMode) {
const R = Math.min(VW, VH) * 0.3, cx = VW / 2, cy = VH / 2;
if (inp.mouseArmed) {
c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
c.beginPath(); c.arc(cx, cy, R * 0.07, 0, TAU); c.stroke();
c.strokeStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(inp.mx, inp.my); c.stroke();
c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(inp.mx, inp.my, 4, 0, TAU); c.fill();
} else {
const pu = 0.5 + 0.5 * Math.sin(now / 200);
c.strokeStyle = 'rgba(255,201,60,' + (0.4 + 0.5 * pu).toFixed(2) + ')'; c.lineWidth = 2;
c.beginPath(); c.arc(cx, cy, R * 0.07 + 4, 0, TAU); c.stroke();
c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(inp.mx, inp.my, 4, 0, TAU); c.fill();
T('Move the pointer into the ring to steer with the mouse', cx, cy + 46, 13, FONT_B, UI.hi, 'center');
}
}
}
if (killT > 0) {
const a = clamp(killT / 0.7, 0, 1), s = 10 + (1 - a) * 8;
c.strokeStyle = 'rgba(255,201,60,' + a.toFixed(2) + ')'; c.lineWidth = 3;
c.beginPath(); c.moveTo(killX - s, killY - s); c.lineTo(killX + s, killY + s); c.moveTo(killX + s, killY - s); c.lineTo(killX - s, killY + s); c.stroke();
}
glass(16, 14, 220, 58);
if (net) netTop();
else {
T(r.kind === 'gauntlet' ? 'GAUNTLET' : 'MISSION ' + (r.mi + 1), 28, 30, 11, FONT_M, UI.dim, 'left');
T('SCORE ' + fmtNum(r.killPts), 28, 52, 20, FONT_M, UI.head, 'left', 150, '700');
T(r.timerOn || r.def.timer ? fmtTime(r.timer) : fmtTime(r.t), 224, 52, 16, FONT_M, r.timerOn && r.timer < 15 ? UI.danger : UI.body, 'right');
}
const ow = Math.min(460, VW - 520);
glass(VW / 2 - ow / 2, 14, ow, 50);
T(r.obj || '', VW / 2, 32, 15, FONT_B, UI.head, 'center', ow - 20, '700');
T(r.sub || '', VW / 2, 52, 12, FONT_M, UI.body, 'center', ow - 20);
if (hintT > 0 && hintMsg) drawHint();
glass(VW - 236, 14, 220, 58);
T('WING  ' + (r.wingOn ? (r.wingOrder === 0 ? 'ATTACK MY TARGET' : 'DEFEND ME') : 'NONE'), VW - 226, 30, 11, FONT_M, r.wingOn ? UI.friend : UI.dim, 'left', 200);
T((P.assist ? 'ASSIST ON' : 'DRIFT MODE') + '   ' + (camMode ? 'CLOSE VIEW' : 'CHASE VIEW'), VW - 226, 52, 11, FONT_M, P.assist ? UI.body : UI.hi, 'left', 200);
if (touchMode) { button('pause', VW - 64, 82, 48, 40, 'II', false, true, 16); button('view', VW - 120, 82, 48, 40, 'VIEW', false, true, 11); button('drift', VW - 176, 82, 48, 40, 'DRIFT', !P.assist, true, 11); }
const by = touchMode ? 84 : VH - 74, bx = 16;
glass(bx, by, 236, 58);
T('SHIELD', bx + 12, by + 15, 10, FONT_M, UI.shield, 'left');
bar(bx + 66, by + 10, 156, 10, P.shield / ST.shieldMax, UI.shield);
T('HULL', bx + 12, by + 36, 10, FONT_M, P.hull < ST.hullMax * 0.3 && blink(now) ? UI.danger : UI.hull, 'left');
bar(bx + 66, by + 31, 156, 10, P.hull / ST.hullMax, P.hull < ST.hullMax * 0.3 ? UI.danger : UI.hull);
if (r.kind === 'mission') T('BACKUP FRAMES ' + Math.max(0, r.reserves - r.usedRes), bx + 12, by + 50, 9, FONT_M, UI.dim, 'left');
const rR = touchMode ? 46 : 54, rcx = touchMode ? VW - 70 : VW / 2, rcy = touchMode ? 190 : VH - 66;
drawRadar(rcx, rcy, rR, now);
if (!touchMode) {
const mx = VW - 252, my = VH - 112;
glass(mx, my, 236, 96);
T(Math.round(P.spd) + ' m/s', mx + 12, my + 15, 12, FONT_M, P.boosting ? UI.hi : UI.head, 'left');
T('THR', mx + 110, my + 15, 10, FONT_M, UI.dim, 'left');
bar(mx + 138, my + 10, 86, 8, P.thr, UI.body);
T('BOOST', mx + 12, my + 35, 10, FONT_M, P.boostLock ? UI.danger : UI.dim, 'left');
bar(mx + 66, my + 30, 158, 8, P.boost, P.boostLock ? UI.danger : UI.hi);
T(P.over ? 'OVERHEAT' : 'HEAT', mx + 12, my + 53, 10, FONT_M, P.over ? UI.danger : UI.dim, 'left');
bar(mx + 66, my + 48, 158, 8, P.heat / 100, P.over ? UI.danger : P.heat > 70 ? '#ff9a4a' : UI.cyan);
T('MSL ' + P.msl, mx + 12, my + 76, 13, FONT_M, P.msl ? UI.head : UI.danger, 'left');
T('FLR ' + P.flares, mx + 80, my + 76, 13, FONT_M, P.flares ? UI.head : UI.danger, 'left');
if (lanceUnlocked()) { T('LANCE', mx + 142, my + 76, 10, FONT_M, P.lance >= 1 ? UI.cyan : UI.dim, 'left'); bar(mx + 182, my + 72, 42, 8, P.lance, P.lance >= 1 ? UI.cyan : 'rgba(124,243,255,0.45)'); }
}
if (r.timerOn && r.timer < 20 && blink(now)) T(Math.ceil(r.timer) + ' s', VW / 2, 132, 24, FONT_D, UI.danger, 'center');
if (P.outT > 0.3 && !P.dead) {
T('LEAVING THE COMBAT ZONE', VW / 2, VH / 2 + 70, 18, FONT_D, UI.danger, 'center');
T(P.outT > 2.5 ? 'Autopilot turning you back' : 'Turn back', VW / 2, VH / 2 + 94, 13, FONT_B, UI.body, 'center');
}
if (P.dead && !r.done) {
T('SYSTEMS DOWN', VW / 2, VH / 2 - 20, 30, FONT_D, UI.danger, 'center');
T(P.respawnT > 0 ? 'Launching backup frame in ' + Math.max(0, Math.ceil(P.respawnT - P.deadT)) + '...' : '', VW / 2, VH / 2 + 14, 15, FONT_B, UI.body, 'center');
}
if (toastT > 0) {
hctx.globalAlpha = clamp(toastT / 0.4, 0, 1);
T(toastMsg, VW / 2, VH * 0.28, 22, FONT_D, toastCol, 'center', VW - 80);
hctx.globalAlpha = 1;
}
if (r.done && r.endT > 0.3) T(r.ok ? 'MISSION COMPLETE' : r.kind === 'gauntlet' ? 'GAUNTLET OVER' : 'MISSION FAILED', VW / 2, VH * 0.36, 34, FONT_D, r.ok ? UI.ok : UI.danger, 'center');
if (net) netHUD(now);
}
const RD = { cx: 0, cy: 0, R: 50, range: 650, now: 0 };
function radarDot(p, col, sz, blinkIt) {
const c = hctx;
V4.subVectors(p, P.p).applyQuaternion(Q2);
let dx = V4.x / RD.range, dz = V4.z / RD.range;
const l = Math.sqrt(dx * dx + dz * dz);
let edge = false;
if (l > 1) { dx /= l; dz /= l; edge = true; }
const px = RD.cx + dx * RD.R, py = RD.cy + dz * RD.R, ey = clamp(-V4.y / RD.range, -1, 1) * RD.R * 0.5;
if (blinkIt && !blink(RD.now * 3)) return;
if (!edge) { c.strokeStyle = col; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + ey); c.stroke(); c.globalAlpha = 1; }
c.fillStyle = col; c.fillRect(px - sz / 2, py + (edge ? 0 : ey) - sz / 2, sz, sz);
}
let hintSrc = '', hintL1 = '', hintL2 = '';
function drawHint() {
const c = hctx, hw = touchMode ? Math.min(420, VW - 560) : Math.min(560, VW - 420), hy = touchMode ? 130 : 72;
c.font = font(14, FONT_B, '600');
if (hintSrc !== hintMsg) {
hintSrc = hintMsg; hintL1 = hintMsg; hintL2 = '';
if (c.measureText(hintMsg).width > hw - 24) {
let cut = hintMsg.lastIndexOf(' ', Math.floor(hintMsg.length / 2) + 6);
if (cut < 0) cut = hintMsg.indexOf(' ');
if (cut > 0) { hintL1 = hintMsg.slice(0, cut); hintL2 = hintMsg.slice(cut + 1); }
}
}
const hh = hintL2 ? 54 : 36;
c.globalAlpha = clamp(hintT, 0, 1);
rrect(VW / 2 - hw / 2, hy, hw, hh, 10); c.fillStyle = 'rgba(40,30,6,0.82)'; c.fill(); c.strokeStyle = 'rgba(255,201,60,0.55)'; c.lineWidth = 1.5; c.stroke();
T(hintL1, VW / 2, hy + (hintL2 ? 17 : 18), 14, FONT_B, UI.hi, 'center', hw - 24, '600');
if (hintL2) T(hintL2, VW / 2, hy + 37, 14, FONT_B, UI.hi, 'center', hw - 24, '600');
c.globalAlpha = 1;
}
function drawRadar(cx, cy, R, now) {
const c = hctx;
c.fillStyle = 'rgba(10,16,30,0.62)'; c.beginPath(); c.arc(cx, cy, R + 4, 0, TAU); c.fill();
c.strokeStyle = 'rgba(124,243,255,0.25)'; c.lineWidth = 1;
c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
c.beginPath(); c.arc(cx, cy, R * 0.5, 0, TAU); c.stroke();
c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
const range = run.jam ? 170 : 650;
RD.cx = cx; RD.cy = cy; RD.R = R; RD.range = range; RD.now = now;
Q2.copy(P.q).conjugate();
const dot = radarDot;
if (run.jam && !run.alarm) {
for (let i = 0; i < 10; i++) { const a = Math.random() * TAU, d = Math.random() * R; c.fillStyle = 'rgba(160,200,190,0.35)'; c.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 2); }
}
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.down > 0) continue;
if (run.jam && e.kind !== 7 && e.p.distanceToSquared(P.p) > range * range) continue;
dot(e.p, e.team === 0 ? UI.friend : e.kind === 7 ? UI.hi : e.kind === 4 ? 'rgba(255,150,120,0.7)' : UI.foe, e.kind === 2 || e.kind === 7 ? 5 : e.kind === 4 ? 2 : 3.5, false);
}
for (let i = 0; i < CAPS.length; i++) if (CAPS[i].on && !CAPS[i].dying) dot(CAPS[i].p, UI.danger, 8, false);
if (FRT.on && !FRT.arrived) dot(FRT.p, UI.friend, 6, false);
if (STN.on) dot(STN.p, UI.friend, 8, false);
if (ringNext < ringN) dot(RINGS[ringNext].p, UI.hi, 5, false);
for (let i = 0; i < MSL_MAX; i++) { const m = MSL[i]; if (m.on && m.team === 1) dot(m.p, '#ffffff', 3, m.tgt === P); }
if (net) for (let i = 0; i < 4; i++) { const pl = PL[i]; if (pl.used && !pl.me && pl.g && pl.g.visible) dot(pl.p, pl.dead ? UI.danger : NV ? '#ffb070' : UI.friend, 5, pl.dead); }
c.fillStyle = UI.cyan; c.beginPath(); c.moveTo(cx, cy - 5); c.lineTo(cx + 4, cy + 4); c.lineTo(cx - 4, cy + 4); c.closePath(); c.fill();
if (run.jam) T(run.alarm ? 'JAMMED' : 'SENSORS JAMMED', cx, cy - R - 12, 9, FONT_M, UI.hi, 'center');
}

const TB = { stick: { x: 110, y: 470, r: 58 }, fire: { x: 0, y: 0, r: 50 }, msl: { x: 0, y: 0, r: 36 }, boost: { x: 0, y: 0, r: 34 },
flare: { x: 0, y: 0, r: 28 }, lance: { x: 0, y: 0, r: 28 }, wing: { x: 0, y: 0, r: 24 }, thr: { x: 22, y: 220, w: 34, h: 200 } };
let stickId = -1, stickX = 0, stickY = 0;
function layoutTouch() {
TB.fire.x = VW - 92; TB.fire.y = VH - 96;
TB.msl.x = VW - 196; TB.msl.y = VH - 70;
TB.boost.x = VW - 96; TB.boost.y = VH - 212;
TB.flare.x = VW - 186; TB.flare.y = VH - 166;
TB.lance.x = VW - 262; TB.lance.y = VH - 120;
TB.wing.x = VW - 262; TB.wing.y = VH - 46;
TB.thr.x = 22; TB.thr.y = VH * 0.32; TB.thr.h = VH * 0.36;
if (stickId < 0) { TB.stick.x = 120; TB.stick.y = VH - 120; }
}
function hitTouch(x, y) {
const list = ['fire', 'msl', 'boost', 'flare', 'lance', 'wing'];
for (let i = 0; i < list.length; i++) {
const b = TB[list[i]];
if (list[i] === 'lance' && !lanceUnlocked()) continue;
if (list[i] === 'wing' && !(run && run.wingOn)) continue;
const dx = x - b.x, dy = y - b.y;
if (dx * dx + dy * dy <= (b.r + 10) * (b.r + 10)) return list[i];
}
const t = TB.thr;
if (x >= t.x - 12 && x <= t.x + t.w + 12 && y >= t.y - 12 && y <= t.y + t.h + 12) return 'thr';
return '';
}
function tbtn(b, label, on, ring, ringCol) {
const c = hctx;
c.fillStyle = on ? 'rgba(255,201,60,0.35)' : 'rgba(16,22,38,0.5)';
c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill();
c.strokeStyle = on ? UI.hi : 'rgba(255,255,255,0.3)'; c.lineWidth = 2; c.stroke();
if (ring !== undefined) { c.strokeStyle = ringCol; c.lineWidth = 4; c.beginPath(); c.arc(b.x, b.y, b.r + 5, -HPI, -HPI + TAU * clamp(ring, 0, 1)); c.stroke(); }
T(label, b.x, b.y, b.r > 40 ? 16 : 12, FONT_B, UI.head, 'center', b.r * 1.8, '700');
}
function drawTouch() {
const c = hctx, s = TB.stick;
c.fillStyle = 'rgba(16,22,38,0.35)'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill();
c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 2; c.stroke();
c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(s.x + (inp.stick ? inp.sx * s.r : 0), s.y + (inp.stick ? inp.sy * s.r : 0), 22, 0, TAU); c.fill();
tbtn(TB.fire, P.over ? 'HOT' : 'FIRE', inp.fire, P.heat / 100, P.over ? UI.danger : UI.cyan);
tbtn(TB.msl, 'MSL ' + P.msl, inp.msl, P.lockT, P.locked ? UI.danger : UI.hi);
tbtn(TB.boost, 'BOOST', inp.boost, P.boost, UI.hi);
tbtn(TB.flare, 'FLR ' + P.flares, false);
if (lanceUnlocked()) tbtn(TB.lance, 'LANCE', P.lanceChg >= 0, P.lance, UI.cyan);
if (run.wingOn) tbtn(TB.wing, 'WING', false);
const t = TB.thr;
rrect(t.x, t.y, t.w, t.h, 10); c.fillStyle = 'rgba(16,22,38,0.5)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 2; c.stroke();
const ky = t.y + t.h * (1 - P.thr);
c.fillStyle = UI.hi; c.fillRect(t.x + 3, ky - 5, t.w - 6, 10);
T('THR', t.x + t.w / 2, t.y - 12, 10, FONT_M, UI.body, 'center');
}

const MENU = ['Campaign', 'Gauntlet', 'Hangar', 'Settings', 'Online'], MENU_ACT = ['start', 'start the Gauntlet', 'open the hangar', 'open settings', 'play online'];
function drawTitle(now) {
const c = hctx;
c.globalAlpha = 0.55; c.drawImage(vigDark, 0, 0, VW, VH); c.globalAlpha = 1;
const x = 64;
c.save(); c.shadowColor = 'rgba(120,220,255,0.7)'; c.shadowBlur = 18;
T('VOID LANCER', x, 112, 60, FONT_D, UI.head, 'left', VW * 0.6);
c.restore();
T('Starfighter combat against the Lattice, a runaway fleet of war machines.', x + 2, 160, 16, FONT_B, UI.body, 'left', 520);
for (let i = 0; i < MENU.length; i++) {
const locked = (i === 1 && !missionUnlocked(NM)) || (i === 4 && !NET_OK);
button('menu' + i, x, 192 + i * 50, 250, 42, MENU[i] + (locked && i === 1 ? ' (clear mission 1)' : ''), menuSel === i, !locked, 18);
}
if (!NET_OK) T(NET_WHY, x + 264, 413, 12, FONT_B, UI.dim, 'left', VW - x - 290);
T(touchMode ? 'Left stick steers. Hold FIRE, hold MSL to lock.' : 'Pointer or Arrows steer   W/S throttle   A/D roll   F or Click fire', x, 456, 13, FONT_B, UI.body, 'left', 560);
T(touchMode ? 'BOOST to sprint, FLARE against missiles.' : 'Hold Space to lock missiles   R flares   Shift boost   E lance   Q wing   V drift   C view   T target', x, 476, 13, FONT_B, UI.body, 'left', 620);
if (blink(now)) T(menuSel === 4 && !NET_OK ? NET_WHY : (touchMode ? 'Tap to ' : 'Press Space to ') + MENU_ACT[menuSel], x, 512, 20, FONT_B, menuSel === 4 && !NET_OK ? UI.dim : UI.hi, 'left', VW - x - 40, '700');
let best = null;
try { best = api.best(); } catch (e) { best = null; }
if (best !== null && best !== undefined) T('Best: ' + fmtNum(best), x, 548, 15, FONT_M, UI.body, 'left');
T('Campaign score ' + fmtNum(campaignScore()) + '   Credits ' + fmtNum(save.cr), VW - 24, VH - 24, 13, FONT_M, UI.dim, 'right');
}
function drawSelect(now) {
const c = hctx;
c.fillStyle = 'rgba(8,12,22,0.62)'; c.fillRect(0, 0, VW, VH);
T('CAMPAIGN', VW / 2, 40, 30, FONT_D, UI.head, 'center');
const cw = 196, ch = 62, gx = VW / 2 - (cw * 4 + 12 * 3) / 2, gy = 72;
for (let i = 0; i <= NM; i++) {
const col = i % 4, row = Math.floor(i / 4), x = gx + col * (cw + 12), y = gy + row * (ch + 10);
const un = missionUnlocked(i), sel = selIdx === i;
rrect(x, y, cw, ch, 12);
c.fillStyle = sel ? 'rgba(255,201,60,0.16)' : un ? 'rgba(16,22,38,0.85)' : 'rgba(16,22,38,0.5)'; c.fill();
c.lineWidth = sel ? 2 : 1; c.strokeStyle = sel ? UI.hi : 'rgba(255,255,255,0.12)'; c.stroke();
if (i < NM) {
T(pad(i + 1, 2), x + 14, y + 20, 13, FONT_M, un ? UI.hi : UI.dim, 'left');
T(MISSIONS[i].name, x + 42, y + 20, 14, FONT_B, un ? UI.head : UI.dim, 'left', cw - 52, '700');
T(!un ? 'LOCKED' : save.best[i] ? 'Best ' + fmtNum(save.best[i]) : 'Not flown', x + 14, y + 44, 12, FONT_M, save.best[i] ? UI.ok : UI.dim, 'left');
} else {
T('GAUNTLET', x + 14, y + 20, 14, FONT_D, un ? UI.danger : UI.dim, 'left');
T(un ? 'Record: wave ' + save.gWave + ', ' + fmtNum(save.gScore) : 'Clear mission 1', x + 14, y + 44, 12, FONT_M, UI.dim, 'left', cw - 24);
}
addHit('card' + i, x, y, cw, ch);
}
const py = gy + 4 * (ch + 10) + 2, pw = cw * 4 + 36;
panel(gx, py, pw, VH - py - 16);
const def = selIdx < NM ? MISSIONS[selIdx] : GAUNTLET, un = missionUnlocked(selIdx);
T(selIdx < NM ? 'Mission ' + (selIdx + 1) + ': ' + def.name : 'Gauntlet', gx + 22, py + 26, 20, FONT_B, UI.head, 'left', pw - 300, '700');
T(un ? def.brief : 'Complete the previous mission to unlock this one.', gx + 22, py + 54, 14, FONT_B, UI.body, 'left', pw - 44);
if (selIdx < NM) T((def.par ? 'Par ' + fmtTime(def.par) + '   ' : '') + (def.timer ? 'Time limit ' + fmtTime(def.timer) + '   ' : '') + 'Backup frames ' + def.reserves + (def.jam ? '   Sensors jammed' : ''), gx + 22, py + 78, 12, FONT_M, UI.dim, 'left', pw - 44);
const ship = SHIPS[save.ship];
T('Ship: ' + ship.name, gx + pw - 22, py + 26, 13, FONT_M, UI.cyan, 'right');
const bw = 150, byy = VH - 16 - 56;
button('fly', gx + pw - bw - 22, byy, bw, 42, un ? 'Launch' : 'Locked', true, un, 17);
button('hangar', gx + pw - bw * 2 - 34, byy, bw, 42, 'Hangar', false, true, 15);
button('back', gx + 22, byy, 110, 42, 'Back', false, true, 15);
T(touchMode ? 'Tap a mission, then Launch' : 'Arrows choose   Space / Enter launch   H hangar   Esc back', gx + 146, byy + 21, 12, FONT_B, UI.dim, 'left', pw - bw * 2 - 200);
}
function upCost(i) { return save.up[i] >= 4 ? 0 : UPG_COST[save.up[i]]; }
function drawHangar(now) {
const c = hctx;
c.fillStyle = 'rgba(8,12,22,0.45)'; c.fillRect(0, 0, VW, VH);
T('HANGAR', 40, 40, 30, FONT_D, UI.head, 'left');
T('Credits ' + fmtNum(save.cr), VW - 40, 40, 18, FONT_M, UI.hi, 'right');
const sh = SHIPS[hangShip], un = shipUnlocked(hangShip), x = 40, y = 70, w = 380;
panel(x, y, w, 300);
selBox(x + 14, y + 14, w - 28, 44, hangRow === 0);
T('\u25C0', x + 34, y + 36, 16, FONT_B, UI.hi); T('\u25B6', x + w - 34, y + 36, 16, FONT_B, UI.hi);
addHit('shipL', x + 14, y + 14, 50, 44); addHit('shipR', x + w - 64, y + 14, 50, 44); addHit('ship', x + 64, y + 14, w - 128, 44);
T(sh.name, x + w / 2, y + 36, 19, FONT_B, un ? UI.head : UI.dim, 'center', w - 140, '700');
T(sh.role + (save.ship === hangShip ? '  \u2022  EQUIPPED' : ''), x + 22, y + 76, 13, FONT_M, save.ship === hangShip ? UI.ok : UI.cyan, 'left');
T(un ? sh.blurb : 'Locked: complete mission ' + sh.unlock + ' (' + MISSIONS[sh.unlock - 1].name + ').', x + 22, y + 100, 13, FONT_B, UI.body, 'left', w - 44);
const stats = [['Speed', sh.maxSpd / 100], ['Agility', sh.turn / 2], ['Shields', sh.shield / 150], ['Hull', sh.hull / 160], ['Firepower', (sh.dmg / sh.cd) / 130], ['Missiles', sh.msl / 10]];
for (let i = 0; i < stats.length; i++) {
T(stats[i][0], x + 22, y + 130 + i * 24, 12, FONT_M, UI.dim, 'left');
bar(x + 120, y + 124 + i * 24, w - 150, 9, stats[i][1], un ? UI.cyan : UI.dim);
}
T(hangRow === 0 ? (un ? (save.ship === hangShip ? 'Equipped' : 'Space / Enter to equip') : 'Locked') : '', x + w / 2, y + 282, 12, FONT_B, UI.hi, 'center');
const ux = 440, uw = VW - ux - 40;
panel(ux, y, uw, 300);
T('UPGRADES (all ships)', ux + 22, y + 26, 14, FONT_B, UI.head, 'left', 0, '700');
for (let i = 0; i < UPG.length; i++) {
const ry = y + 46 + i * 48, sel = hangRow === i + 1, lv = save.up[i], cost = upCost(i);
selBox(ux + 14, ry, uw - 28, 42, sel);
T(UPG[i].name, ux + 28, ry + 14, 14, FONT_B, UI.head, 'left', 160, '700');
T(UPG[i].desc, ux + 28, ry + 31, 11, FONT_B, UI.dim, 'left', uw - 250);
for (let k = 0; k < 4; k++) { c.fillStyle = k < lv ? UI.cyan : 'rgba(255,255,255,0.14)'; c.fillRect(ux + uw - 196 + k * 18, ry + 15, 13, 13); }
T(lv >= 4 ? 'MAX' : fmtNum(cost) + ' cr', ux + uw - 30, ry + 21, 13, FONT_M, lv >= 4 ? UI.ok : save.cr >= cost ? UI.hi : UI.danger, 'right');
addHit('up' + i, ux + 14, ry, uw - 28, 42);
}
button('hback', 40, VH - 72, 140, 44, 'Back', hangRow === 6, true, 16);
T(touchMode ? 'Tap arrows to browse ships, tap an upgrade to buy' : 'Up / Down choose   Left / Right change ship   Space / Enter equip or buy   Esc back', 200, VH - 50, 12, FONT_B, UI.dim, 'left', VW - 240);
}
const SETS = ['Mouse steering', 'Invert pitch', 'Auto-level', 'Screen shake', 'Camera'];
function setVal(i) { return i === 0 ? (save.mouse ? 'On' : 'Off') : i === 1 ? (save.inv ? 'On' : 'Off') : i === 2 ? (save.lvl ? 'On' : 'Off') : i === 3 ? (save.shake ? 'On' : 'Off') : (save.cam ? 'Close' : 'Chase'); }
function drawSettings(now) {
const c = hctx;
c.fillStyle = 'rgba(8,12,22,0.55)'; c.fillRect(0, 0, VW, VH);
const w = 460, h = 420, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
panel(x, y, w, h);
T('SETTINGS', VW / 2, y + 40, 26, FONT_D, UI.head, 'center');
for (let i = 0; i < SETS.length; i++) {
const ry = y + 76 + i * 52, sel = setSel === i;
selBox(x + 24, ry, w - 48, 44, sel);
T(SETS[i], x + 40, ry + 22, 15, FONT_B, UI.head, 'left', 0, '700');
T(setVal(i), x + w - 40, ry + 22, 15, FONT_M, UI.hi, 'right');
addHit('set' + i, x + 24, ry, w - 48, 44);
}
button('sback', VW / 2 - 70, y + h - 64, 140, 44, 'Back', setSel === SETS.length, true, 16);
}
const PAUSE_ITEMS = ['Resume', 'Restart mission', 'Quit to menu'];
function drawPause(now) {
const c = hctx;
c.fillStyle = UI.scrim; c.fillRect(0, 0, VW, VH);
const w = 500, h = 400, x = VW / 2 - w / 2, y = VH / 2 - h / 2;
panel(x, y, w, h);
T('Paused', VW / 2, y + 44, 34, FONT_D, UI.head, 'center');
T(touchMode ? 'Tap to resume' : 'Press P or click to resume', VW / 2, y + 82, 15, FONT_B, UI.hi, 'center');
for (let i = 0; i < PAUSE_ITEMS.length; i++) button('p' + i, x + 110, y + 106 + i * 54, w - 220, 44, PAUSE_ITEMS[i], pauseSel === i, true, 16);
const L = ['Pointer / Arrows: steer', 'W / S: throttle    A / D: roll', 'F / Click: lasers    Space: missiles', 'R: flares    Shift: boost    E: lance', 'Q: wing orders    V: drift    C: view    T: target'];
for (let i = 0; i < L.length; i++) T(L[i], VW / 2, y + 284 + i * 20, 12, FONT_M, UI.body, 'center', w - 40);
}
function overReady() { return performance.now() - overAt >= 600; }
function hasNext() { return run && run.kind === 'mission' && run.ok && run.mi + 1 < NM; }
function drawOver(now) {
const c = hctx, res = run && run.result;
c.fillStyle = UI.scrim; c.fillRect(0, 0, VW, VH);
if (!res) return;
const w = 560, lines = res.lines.length, h = Math.min(VH - 24, 330 + lines * 22 + res.notes.length * 20), x = VW / 2 - w / 2, y = VH / 2 - h / 2;
panel(x, y, w, h);
T(res.title, VW / 2, y + 38, 30, FONT_D, res.ok ? UI.ok : res.title === 'Gauntlet over' ? UI.head : UI.danger, 'center', w - 40);
T(res.sub, VW / 2, y + 70, 14, FONT_B, UI.body, 'center', w - 40);
let ly = y + 100;
for (let i = 0; i < lines; i++) {
T(res.lines[i][0], x + 40, ly, 14, FONT_B, UI.body, 'left', w - 200);
T(res.lines[i][1], x + w - 40, ly, 14, FONT_M, UI.head, 'right');
ly += 22;
}
ly += 8;
c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x + 40, ly - 6, w - 80, 1);
if (run.kind === 'mission') {
T('MISSION SCORE', x + 40, ly + 14, 15, FONT_B, UI.head, 'left', 0, '700');
T(fmtNum(res.score), x + w - 40, ly + 14, 22, FONT_M, res.ok ? UI.hi : UI.dim, 'right', 0, '700');
ly += 34;
}
T('Campaign score ' + fmtNum(res.campaign) + (res.best ? '   (mission best!)' : ''), VW / 2, ly + 6, 14, FONT_M, UI.body, 'center', w - 40);
if (res.newBest) T('New best!', VW / 2, ly + 30, 18, FONT_D, UI.hi, 'center');
ly += res.newBest ? 52 : 30;
T('+' + fmtNum(res.credits) + ' credits', VW / 2, ly, 13, FONT_M, UI.ok, 'center');
ly += 20;
for (let i = 0; i < res.notes.length; i++) { T(res.notes[i], VW / 2, ly, 13, FONT_B, UI.cyan, 'center', w - 40, '700'); ly += 20; }
const bw = 150, by = y + h - 96;
button('o-again', x + 30, by, bw, 40, 'Play again', overSel === 0, overReady(), 15);
button('o-next', x + w / 2 - bw / 2, by, bw, 40, hasNext() ? 'Next mission' : 'Hangar', overSel === 1, overReady(), 15);
button('o-menu', x + w - 30 - bw, by, bw, 40, run.kind === 'mission' ? 'Missions' : 'Title', overSel === 2, overReady(), 15);
const act = overSel === 0 ? 'play again' : overSel === 1 ? (hasNext() ? 'start the next mission' : 'open the hangar') : 'return to ' + (run.kind === 'mission' ? 'the missions' : 'the title');
if (overReady() && blink(now)) T(touchMode ? 'Tap to play again' : 'Press Space to ' + act, VW / 2, by + 62, 15, FONT_B, UI.hi, 'center');
if (!touchMode) T('Left / Right choose    N: ' + (hasNext() ? 'next mission' : 'hangar') + '    Esc: ' + (run.kind === 'mission' ? 'missions' : 'title'), VW / 2, by + 82, 11, FONT_M, UI.dim, 'center');
}
function drawHUD(now) {
const c = hctx;
c.setTransform(1, 0, 0, 1, 0, 0);
c.clearRect(0, 0, hud.width, hud.height);
c.setTransform(dpr * hudK, 0, 0, dpr * hudK, 0, 0);
hitN = 0;
if (state === 'play' && run) {
drawPlay(now);
if (touchMode && !paused && !run.done && !P.dead) drawTouch();
if (!touchMode && !paused) addHit('field', 0, 0, VW, VH);
if (paused) drawPause(now);
if (net && nmenu) drawNetMenu();
} else if (state === 'over') { if (run) drawPlay(now); drawOver(now); }
else if (state === 'online') drawOnline(now);
else if (state === 'nset') drawNetSetup(now);
else if (state === 'nres') { if (run) drawPlay(now); drawNetRes(now); }
else if (state === 'title') drawTitle(now);
else if (state === 'select') drawSelect(now);
else if (state === 'hangar') drawHangar(now);
else if (state === 'settings') drawSettings(now);
if (state !== 'play' && state !== 'over' && state !== 'nres' && toastT > 0) { // menu feedback, e.g. the locked Gauntlet
c.globalAlpha = clamp(toastT / 0.4, 0, 1); T(toastMsg, VW - 24, VH - 50, 15, FONT_B, toastCol, 'right', VW * 0.6, '700'); c.globalAlpha = 1;
}
}

let hangarFrom = 'title';
function click() { sq(520, 0.04, 0.05); }
function deny() { sq(150, 0.12, 0.07); }
function pauseGame() {
if (state !== 'play' || !run || paused || net) return; // online play never pauses
paused = true; pauseSel = 0;
audioStop(); clearHeld();
}
function resumeGame() {
if (!paused) return;
paused = false; lastT = performance.now(); acc = 0; inp.mouseArmed = false;
audioStart();
}
function pauseAction(i) {
if (i === 0) resumeGame();
else if (i === 1) { paused = false; clearHeld(); restartRun(); }
else leaveRun(run && run.kind === 'mission' ? 'select' : 'title');
}
function toTitle() { state = 'title'; click(); }
function activateMenu(i) {
menuSel = i;
if (i === 0) { state = 'select'; click(); }
else if (i === 1) { if (missionUnlocked(NM)) { selIdx = NM; beginRun('gauntlet', NM); } else { deny(); toast('Clear mission 1 to unlock the Gauntlet', UI.dim); } }
else if (i === 2) openHangar('title');
else if (i === 4) netPage();
else { state = 'settings'; setSel = 0; click(); }
}
function launchSelected() {
if (!missionUnlocked(selIdx)) { deny(); return; }
if (selIdx >= NM) beginRun('gauntlet', NM); else beginRun('mission', selIdx);
}
function openHangar(from) { hangarFrom = from; state = 'hangar'; hangRow = 0; hangShip = save.ship; applyShip(hangShip); click(); }
function leaveHangar() { applyShip(save.ship); state = hangarFrom || 'title'; click(); }
function cycleShip(d) { hangShip = (hangShip + d + SHIPS.length) % SHIPS.length; applyShip(hangShip); click(); }
function hangarAction(row) {
if (row === 0) {
if (!shipUnlocked(hangShip)) { deny(); return; }
save.ship = hangShip; persist(); computeStats();
tri(660, 0.1, 0.12); tri(990, 0.12, 0.12, 0.08);
} else if (row <= UPG.length) {
const i = row - 1;
if (save.up[i] >= 4) { deny(); return; }
const cost = UPG_COST[save.up[i]];
if (save.cr < cost) { deny(); return; }
save.cr -= cost; save.up[i]++; persist(); computeStats();
tri(784, 0.1, 0.14); tri(1046, 0.16, 0.14, 0.08);
} else leaveHangar();
}
function toggleSetting(i) {
if (i === 0) save.mouse = !save.mouse;
else if (i === 1) save.inv = !save.inv;
else if (i === 2) save.lvl = !save.lvl;
else if (i === 3) save.shake = !save.shake;
else if (i === 4) { save.cam = save.cam ? 0 : 1; camMode = save.cam; }
else { state = 'title'; click(); return; }
persist(); click();
}
function overAgain() { if (!overReady() || !run) return; restartRun(); }
function overNext() {
if (!overReady() || !run) return;
if (hasNext()) { selIdx = run.mi + 1; beginRun('mission', selIdx); return; }
const back = run.kind === 'mission' ? 'select' : 'title';
leaveRun(back); openHangar(back);
}
function overMenu() {
if (!overReady() || !run) return;
const sw = run.kind !== 'mission';
if (!sw && run.ok && run.mi + 1 < NM) selIdx = run.mi + 1;
leaveRun(sw ? 'title' : 'select');
click();
}
function toggleCam() { camMode = camMode ? 0 : 1; save.cam = camMode; persist(); toast(camMode ? 'CLOSE VIEW' : 'CHASE VIEW', UI.cyan); }
function toggleAssist() { P.assist = !P.assist; toast(P.assist ? 'FLIGHT ASSIST ON' : 'FLIGHT ASSIST OFF: DRIFT', P.assist ? UI.cyan : UI.hi); tri(P.assist ? 660 : 440, 0.08, 0.1); }
function toggleWing() {
if (!run || !run.wingOn) { toast('NO WINGMEN ON THIS MISSION', UI.dim); return; }
run.wingOrder = run.wingOrder ? 0 : 1;
toast('WING: ' + (run.wingOrder ? 'DEFEND ME' : 'ATTACK MY TARGET'), UI.friend);
sq(880, 0.06, 0.06); sq(660, 0.08, 0.06, 0, 0.07);
}

const GAME_KEYS = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, KeyF: 1, KeyC: 1, KeyV: 1, KeyQ: 1, KeyE: 1, KeyR: 1, KeyT: 1, KeyP: 1, KeyH: 1, KeyN: 1,
Space: 1, Enter: 1, Escape: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1 };
const KEY_ALIAS = { ' ': 'Space', Spacebar: 'Space', Enter: 'Enter', Escape: 'Escape', Esc: 'Escape', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown',
ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight', Shift: 'ShiftLeft' };
function codeOf(e) {
if (e.code && GAME_KEYS[e.code]) return e.code;
const k = e.key || '';
if (KEY_ALIAS[k]) return KEY_ALIAS[k];
if (k.length === 1 && /[a-z]/i.test(k)) return 'Key' + k.toUpperCase();
return e.code || '';
}
function isEditable(t) { return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)); }
const ptrs = new Map();
let downInfo = null;
const ptr = { x: 0, y: 0 };
function clearHeld() {
for (const k in keys) keys[k] = false;
inp.stick = false; inp.sx = inp.sy = 0; inp.fire = inp.boost = inp.msl = inp.mfire = false; inp.kx = inp.ky = 0;
ptrs.clear(); downInfo = null; stickId = -1;
P.mslHeld = false; P.fireTap = false;
layoutTouch();
}
function onKeyDown(e) {
if (destroyed || isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
const c = codeOf(e);
if (!GAME_KEYS[c]) return;
e.preventDefault();
keys[c] = true;
const nav = c.indexOf('Arrow') === 0;
if (e.repeat && !(nav && state !== 'play')) return;
const up = c === 'ArrowUp' || (c === 'KeyW' && state !== 'play'), down = c === 'ArrowDown' || (c === 'KeyS' && state !== 'play');
const left = c === 'ArrowLeft' || (c === 'KeyA' && state !== 'play'), right = c === 'ArrowRight' || (c === 'KeyD' && state !== 'play');
const ok = c === 'Space' || c === 'Enter';
if (state === 'play' && run) {
if (net && netPlayKey(c, up, down, ok)) return;
if (paused) {
if (c === 'KeyP' || c === 'Escape') resumeGame();
else if (up) { pauseSel = (pauseSel + 2) % 3; click(); }
else if (down) { pauseSel = (pauseSel + 1) % 3; click(); }
else if (ok) pauseAction(pauseSel);
return;
}
if (c === 'Escape' || c === 'KeyP') { pauseGame(); return; }
if (run.done) return;
if (c === 'Space') pressMissile();
else if (c === 'KeyF') P.fireTap = true;
else if (c === 'KeyR') dropFlares();
else if (c === 'KeyE') startLance();
else if (c === 'KeyQ') toggleWing();
else if (c === 'KeyV') toggleAssist();
else if (c === 'KeyC') toggleCam();
else if (c === 'KeyT') cycleTarget();
return;
}
if (state === 'online' || state === 'nset' || state === 'nres') { netKey(c, up, down, left, right, ok); return; }
if (state === 'over') {
if (!overReady()) return;
if (ok) { if (overSel === 1) overNext(); else if (overSel === 2) overMenu(); else overAgain(); }
else if (c === 'KeyN') overNext();
else if (c === 'Escape') overMenu();
else if (left) { overSel = (overSel + 2) % 3; click(); }
else if (right) { overSel = (overSel + 1) % 3; click(); }
return;
}
if (state === 'title') {
if (up) { menuSel = (menuSel + MENU.length - 1) % MENU.length; click(); }
else if (down) { menuSel = (menuSel + 1) % MENU.length; click(); }
else if (ok) activateMenu(menuSel);
} else if (state === 'select') {
if (left) selIdx = Math.max(0, selIdx - 1);
else if (right) selIdx = Math.min(NM, selIdx + 1);
else if (up) selIdx = Math.max(0, selIdx - 4);
else if (down) selIdx = Math.min(NM, selIdx + 4);
else if (ok) { launchSelected(); return; }
else if (c === 'Escape') { toTitle(); return; }
else if (c === 'KeyH') { openHangar('select'); return; }
if (up || down || left || right) click();
} else if (state === 'hangar') {
if (up) { hangRow = (hangRow + 6) % 7; click(); }
else if (down) { hangRow = (hangRow + 1) % 7; click(); }
else if ((left || right) && hangRow === 0) cycleShip(left ? -1 : 1);
else if (ok) hangarAction(hangRow);
else if (c === 'Escape') leaveHangar();
} else if (state === 'settings') {
if (up) { setSel = (setSel + SETS.length) % (SETS.length + 1); click(); }
else if (down) { setSel = (setSel + 1) % (SETS.length + 1); click(); }
else if (ok || left || right) toggleSetting(setSel);
else if (c === 'Escape') toTitle();
}
}
function onKeyUp(e) {
const c = codeOf(e);
if (c in keys) keys[c] = false;
if (c === 'ShiftLeft') keys.ShiftRight = false;
if (c === 'Space') releaseMissile();
if (GAME_KEYS[c] && !isEditable(e.target) && !destroyed) e.preventDefault();
}
function onBlur() { pauseGame(); clearHeld(); inp.mouseIn = false; }
function onVisibility() { if (document.hidden) { pauseGame(); clearHeld(); } }
function toLogical(e) {
const r = hud.getBoundingClientRect();
ptr.x = (e.clientX - r.left) / hudK; ptr.y = (e.clientY - r.top) / hudK;
return ptr;
}
function capture(e) { try { hud.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ } }
function syncTouch() {
inp.fire = inp.boost = false;
ptrs.forEach(function (role) { if (role === 'fire') inp.fire = true; else if (role === 'boost') inp.boost = true; });
}
function setStick(x, y) {
let dx = (x - TB.stick.x) / TB.stick.r, dy = (y - TB.stick.y) / TB.stick.r;
const l = Math.sqrt(dx * dx + dy * dy);
if (l > 1) { dx /= l; dy /= l; }
inp.sx = dx; inp.sy = dy; inp.stick = true;
}
function setThr(y) { P.thr = clamp(1 - (y - TB.thr.y) / TB.thr.h, 0, 1); }
function centerArm(x, y) {
const R = Math.min(VW, VH) * 0.3;
if (Math.sqrt((x - VW / 2) * (x - VW / 2) + (y - VH / 2) * (y - VH / 2)) < R * 0.07 + 8) inp.mouseArmed = true;
}
function onPointerDown(e) {
if (destroyed) return;
try { hud.focus({ preventScroll: true }); } catch (err) { /* best effort */ }
if (e.pointerType === 'touch' && !touchMode) { touchMode = true; layoutTouch(); }
if (e.pointerType === 'mouse' && e.button !== 0) return;
e.preventDefault();
const p = toLogical(e);
if (e.pointerType === 'mouse') { inp.mx = p.x; inp.my = p.y; inp.mouseIn = true; }
if (state === 'play' && run && !paused) {
if (net && netPlayPtr(p.x, p.y)) return;
if (run.done) return;
const hid = hitAt(p.x, p.y);
if (hid === 'pause') { pauseGame(); return; }
if (hid === 'view') { toggleCam(); return; }
if (hid === 'drift') { toggleAssist(); return; }
if (touchMode && e.pointerType !== 'mouse') {
const id = hitTouch(p.x, p.y);
if (id === 'flare') { dropFlares(); return; }
if (id === 'lance') { startLance(); return; }
if (id === 'wing') { toggleWing(); return; }
if (id === 'fire' || id === 'boost' || id === 'msl' || id === 'thr') {
ptrs.set(e.pointerId, id); capture(e);
if (id === 'msl') { inp.msl = true; pressMissile(); }
if (id === 'fire') P.fireTap = true; // a quick tap still fires one shot
if (id === 'thr') setThr(p.y);
syncTouch();
return;
}
if (p.x < VW * 0.55 && stickId < 0) {
stickId = e.pointerId;
TB.stick.x = clamp(p.x, 80, VW * 0.5); TB.stick.y = clamp(p.y, 160, VH - 70);
ptrs.set(e.pointerId, 'stick'); setStick(p.x, p.y); capture(e);
}
return;
}
inp.mfire = true; P.fireTap = true; ptrs.set(e.pointerId, 'mfire'); capture(e);
if (e.pointerType === 'mouse') { inp.mouseUsed = true; centerArm(p.x, p.y); }
return;
}
downInfo = { id: e.pointerId, x: p.x, y: p.y };
capture(e);
}
function onPointerMove(e) {
if (destroyed) return;
const p = toLogical(e);
if (e.pointerType === 'mouse') {
const dx = p.x - inp.mx, dy = p.y - inp.my;
inp.mx = p.x; inp.my = p.y; inp.mouseIn = true;
if (Math.abs(dx) + Math.abs(dy) > 0.5) inp.mouseUsed = true;
if (state === 'play' && !inp.mouseArmed && !nmenu) centerArm(p.x, p.y);
}
const role = ptrs.get(e.pointerId);
if (role) {
if (role === 'stick') setStick(p.x, p.y);
else if (role === 'thr') setThr(p.y);
return;
}
if (e.pointerType === 'mouse' && !downInfo) {
const id = hitAt(p.x, p.y);
if (state === 'title' && id.indexOf('menu') === 0) menuSel = +id.slice(4);
else if (state === 'play' && paused && id.charAt(0) === 'p' && id.length === 2) pauseSel = +id.slice(1);
else if (state === 'over' && id.indexOf('o-') === 0) overSel = id === 'o-again' ? 0 : id === 'o-next' ? 1 : 2;
else if (state === 'settings' && id.indexOf('set') === 0) setSel = +id.slice(3);
else if (state === 'hangar' && id.indexOf('up') === 0) hangRow = +id.slice(2) + 1;
else if (state === 'online' || state === 'nset' || state === 'nres' || nmenu) netHover(id);
}
}
function onPointerUp(e) {
if (destroyed) return;
const role = ptrs.get(e.pointerId);
if (role) {
ptrs.delete(e.pointerId);
if (role === 'stick') { stickId = -1; inp.stick = false; inp.sx = inp.sy = 0; layoutTouch(); }
else if (role === 'mfire') inp.mfire = false;
else if (role === 'msl') { inp.msl = false; if (e.type === 'pointercancel') P.mslHeld = false; else releaseMissile(); }
syncTouch();
return;
}
if (!downInfo || downInfo.id !== e.pointerId) return;
downInfo = null;
if (e.type === 'pointercancel') return;
const p = toLogical(e);
clickAt(p.x, p.y);
}
function onPointerLeave(e) { if (e.pointerType === 'mouse') { inp.mouseIn = false; inp.mouseArmed = false; } }
function clickAt(x, y) {
const id = hitAt(x, y);
if (state === 'online' || state === 'nset' || state === 'nres') { netClick(id); return; }
if (state === 'play' && run) {
if (!paused) return;
if (id === 'p1') pauseAction(1); else if (id === 'p2') pauseAction(2); else resumeGame();
} else if (state === 'over') {
if (!overReady()) return;
if (id === 'o-next') overNext(); else if (id === 'o-menu') overMenu(); else overAgain();
} else if (state === 'title') {
if (id.indexOf('menu') === 0) activateMenu(+id.slice(4)); else activateMenu(menuSel);
} else if (state === 'select') {
if (id === 'back') toTitle();
else if (id === 'fly') launchSelected();
else if (id === 'hangar') openHangar('select');
else if (id.indexOf('card') === 0) { const i = +id.slice(4); if (i === selIdx) launchSelected(); else { selIdx = i; click(); } }
} else if (state === 'hangar') {
if (id === 'hback') leaveHangar();
else if (id === 'shipL') { hangRow = 0; cycleShip(-1); }
else if (id === 'shipR') { hangRow = 0; cycleShip(1); }
else if (id === 'ship') { hangRow = 0; hangarAction(0); }
else if (id.indexOf('up') === 0) { hangRow = +id.slice(2) + 1; hangarAction(hangRow); }
} else if (state === 'settings') {
if (id === 'sback') toTitle();
else if (id.indexOf('set') === 0) { setSel = +id.slice(3); toggleSetting(setSel); }
}
}
function onContextMenu(e) { e.preventDefault(); }

const NET_OK = !!(api.net && api.net.supported && typeof api.net.open === 'function');
const NET_WHY = api.net ? 'Online play is not supported in this browser.' : 'Online play is not available here.';
const SECT = ['Glacier Reach', 'Ember Drift', 'Violet Shoals', 'Ashen Belt', 'Gilded Rift'], NS_LAB = ['Mode', 'Sector', 'Bots'], NS_ID = ['ns0', 'ns1', 'ns2'];
const VS_KILLS = 10, VS_TIME = 300, NB = 8, FAST = { fast: true };
const VERSUS = { name: 'Versus', pal: 0, par: 0, reserves: 0, env: Object.assign({}, GAUNTLET.env, { ast: 110, as: [380, 150, 380], amax: 20 }) };
const nrec = { n: 0, w: 0, s: 0, vw: 0, vk: 0 };
try { const o = JSON.parse(api.load('online') || 'null'); if (o) for (const k in nrec) { const v = Math.floor(+o[k]); if (v > 0) nrec[k] = Math.min(v, 1e7); } } catch (e) { /* none yet */ }
function saveRec() { try { api.save('online', JSON.stringify(nrec)); } catch (e) { /* storage blocked */ } }
const PL = []; // remote records double as machine targets on the host
for (let i = 0; i < 4; i++) PL.push({ bt: 'rp', on: false, team: 0, r: 2.3, hl: 0, used: false, idx: -1, me: false, name: '', ship: 0, gs: -1, left: false, idle: false, dead: false,
p: new THREE.Vector3(), v: new THREE.Vector3(), q: new THREE.Quaternion(), kills: 0, deaths: 0, hp: 1, maxHp: 1, buf: new Float64Array(NB * 11), bn: 0, bh: 0, g: null, gb: null, gl: null });
let nmenu = false, nmSel = 0, onlSel = 0, nsSel = 0, resSel = 0, netMsg = '', opening = false, openTok = 0, recNote = '';
let SNT = null, SE, SEF, SEH, SEV, SM, SMV; // guest snapshot ring
const NEV = [], NF = [], SG = [], SPL = [], SEA = [], SMA = [], PD = [];
const MSNAP = { t: 's', b: 0, q: 0, k: 0, g: SG, p: SPL, e: SEA, m: SMA }, MEV = { t: 'e', b: 0, k: 0, d: NEV }, MPOSE = { t: 'p', b: 0, d: PD }, MFIRE = { t: 'f', b: 0, d: NF };
const DUMMY_M = { homing: 0 }, KM = { p: new THREE.Vector3() }, NV1 = new THREE.Vector3(), NV2 = new THREE.Vector3(), SHIP_RGB = SHIPS.map(function (s) { return hexRGB(s.accent); });
function n1(x) { return Math.round(x * 10) / 10; }
function n2(x) { return Math.round(x * 100) / 100; }
function n3(x) { return Math.round(x * 1000) / 1000; }
function nv(d, i) { const v = +d[i]; return isFinite(v) ? v : 0; }
function pv(a, v, f) { a.push(f(v.x), f(v.y), f(v.z)); }
function pq(a, q) { a.push(n3(q.x), n3(q.y), n3(q.z), n3(q.w)); }
function lv(v, A, a, b, w) { return v.set(lerp(A[a], A[b], w), lerp(A[a + 1], A[b + 1], w), lerp(A[a + 2], A[b + 2], w)); }
function nearS(A, a, b, d2) { const x = A[a] - A[b], y = A[a + 1] - A[b + 1], z = A[a + 2] - A[b + 2]; return x * x + y * y + z * z < d2; } // under 400 m/s between snapshots
function evq() { if (!NH || !net) return false; if (NEV.length > 1800) netFlush(); return true; }
function evp(c, v, a, b, e) { if (evq()) NEV.push(c, n1(v.x), n1(v.y), n1(v.z), a, b, e); } // host: an event at a point
const EVL = [0, 11, 7, 7, 7, 2, 2, 2, 7, 7, 2, 0, 7];
function pilotOf(i) { for (let k = 0; k < 4; k++) if (PL[k].used && PL[k].idx === i) return PL[k]; return null; }
function pName(i) { const pl = pilotOf(i); return pl ? pl.name : 'Pilot'; }
function pPos(pl) { return pl.me ? P.p : pl.p; }
function pAlive(pl) { return pl.used && !pl.left && !pl.idle && !pl.dead; }
function pSet(pl) { pl.on = !pl.me && pAlive(pl); pl.hp = Math.max(0, pl.hull) + Math.max(0, pl.shield); pl.maxHp = Math.max(1, pl.hMax + pl.sMax); }
function netGuests() { let n = 0; for (let i = 0; i < 4; i++) if (PL[i].used && !PL[i].me && !PL[i].left) n++; return n; }
function netHide() { for (let i = 0; i < 4; i++) if (PL[i].g) PL[i].g.visible = false; }
function resName(r, i) { for (let k = 0; k < r.p.length; k++) if (Array.isArray(r.p[k]) && r.p[k][0] === i) return String(r.p[k][1]).slice(0, 16); return 'Pilot'; }
function scrim() { hctx.fillStyle = UI.scrim; hctx.fillRect(0, 0, VW, VH); }
function netFoe() {
let n = 0;
for (let i = 0; i < 4; i++) if (pAlive(PL[i])) n++;
let k = Math.floor(Math.random() * n);
for (let i = 0; i < 4; i++) if (pAlive(PL[i]) && k-- === 0) return PL[i].me ? P : PL[i];
return null;
}
function netNear(pt, maxD) {
let best = null, bd = maxD * maxD;
for (let i = 0; i < 4; i++) {
const pl = PL[i], d = pAlive(pl) ? pPos(pl).distanceToSquared(pt) : 1e30;
if (d < bd) { bd = d; best = pl.me ? P : pl; }
}
return best;
}
function ibPush(pl, t, d, o) { // pose ring: t, position, rotation, velocity
if (!isFinite(t) || (pl.bn && t <= pl.buf[pl.bh * 11])) return;
const h = pl.bn ? (pl.bh + 1) % NB : 0, q = h * 11;
pl.buf[q] = t;
for (let j = 0; j < 10; j++) pl.buf[q + 1 + j] = nv(d, o + j);
pl.bh = h;
if (pl.bn < NB) pl.bn++;
}
function ibAt(pl, t) { // interpolated pose at t
const n = pl.bn, b = pl.buf;
if (!n) return;
let a = pl.bh, c = -1;
for (let k = 1; k < n && b[a * 11] > t; k++) { c = a; a = (a + NB - 1) % NB; }
const qa = a * 11, qc = c < 0 ? qa : c * 11, al = c < 0 ? 0 : clamp((t - b[qa]) / Math.max(1, b[qc] - b[qa]), 0, 1), dt = c < 0 ? clamp((t - b[qa]) / 1000, 0, 0.2) : 0;
lv(pl.v, b, qa + 8, qc + 8, al);
lv(pl.p, b, qa + 1, qc + 1, al).addScaledVector(pl.v, dt);
pl.q.set(b[qa + 4], b[qa + 5], b[qa + 6], b[qa + 7]).slerp(Q3.set(b[qc + 4], b[qc + 5], b[qc + 6], b[qc + 7]), al).normalize(); // a zero quaternion normalizes to identity
}
function netInit() {
if (SNT) return;
SNT = new Float64Array(8); SE = new Uint8Array(8 * ENT_MAX); SEF = new Uint8Array(8 * ENT_MAX); SEH = new Uint8Array(8 * ENT_MAX); SEV = new Float32Array(72 * ENT_MAX);
SM = new Uint8Array(8 * MSL_MAX); SMV = new Float32Array(48 * MSL_MAX);
for (let i = 0; i < 4; i++) {
const pl = PL[i];
pl.g = new THREE.Group(); pl.gs = 0;
pl.gb = new THREE.Mesh(shipGeo[0].body, shipBody.material);
pl.gl = new THREE.Mesh(shipGeo[0].glow, own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
pl.g.add(pl.gb, pl.gl); pl.g.visible = false; scene.add(pl.g);
}
}

function netPage() {
if (!NET_OK) { deny(); toast(NET_WHY, UI.dim); return; }
state = 'online'; onlSel = 0; netMsg = ''; click();
}
function netOpen() {
if (!NET_OK || opening || net) return;
const tok = ++openTok;
let pr = null;
try { pr = api.net.open({ maxPlayers: 4, modeLabel: 'Co-op Gauntlet or Versus' }); } catch (e) { /* refused */ }
if (!pr || typeof pr.then !== 'function') { netMsg = 'Online play could not start. Try again.'; deny(); return; }
opening = true; netMsg = ''; click();
pr.then(function (s) {
if (tok === openTok) opening = false;
if (s && tok === openTok && !destroyed && !net && state === 'online') netAttach(s);
else if (s) try { s.close(); } catch (e) { /* gone */ }
}, function () { if (tok === openTok) opening = false; });
}
function netAttach(s) {
netInit();
const t = performance.now(), pls = Array.isArray(s.players) ? s.players : [];
net = { s: s, me: s.me | 0, bid: 0, mo: 0, se: 0, bo: 1, ph: 'setup', rx: t, tA: 0, tP: t, cfgT: 0, q: 0, res: null, nq: [] }; // the rest is set by netBegin
NH = s.role === 'host'; NG = !NH; NV = false;
for (let i = 0; i < 4; i++) {
const pl = PL[i], p = pls[i];
pl.used = !!p; pl.on = false;
if (p) { pl.idx = p.index | 0; pl.me = pl.idx === net.me; pl.left = p.connected === false; pl.name = String(p.name || 'Pilot ' + (pl.idx + 1)).slice(0, 16); }
}
s.on('message', onNetMsg); s.on('leave', onNetLeave); s.on('close', onNetClose);
state = 'nset'; nsSel = 3; netMsg = ''; click();
netCfg();
}
function netCfg() { if (NH) { net.cfgT = performance.now(); net.s.broadcast({ t: 'cfg', b: net.bid, mo: net.mo, se: net.se, bo: net.bo, ph: net.ph }); } }
function onNetLeave(i) {
const pl = net ? pilotOf(i) : null;
if (!pl || pl.me || pl.left) return;
evLeft(pl);
if (NH) { if (evq()) NEV.push(10, pl.idx); netCheck(); }
}
function evLeft(pl) {
pl.left = true; pSet(pl); pl.g.visible = false;
if (P.tgt === pl) P.tgt = null;
toast(pl.name + ' LEFT THE ROOM', UI.dim);
}
function onNetClose(reason) {
if (!net || destroyed) return;
net.s = null;
netQuit(reason === 'host-left' ? 'Host left' : reason === 'connection-lost' ? 'Connection lost' : reason === 'kicked' ? 'You were removed from the room' : 'Room closed');
}
function netDrop(bump) { // safe at any time
if (bump) { openTok++; opening = false; }
const s = net && net.s;
net = null; NH = NG = NV = false; nmenu = false;
for (let i = 0; i < 4; i++) PL[i].used = PL[i].on = false;
netHide();
if (P.tgt && P.tgt.bt === 'rp') P.tgt = null;
if (!s) return;
try { s.off('message', onNetMsg); s.off('leave', onNetLeave); s.off('close', onNetClose); s.close(); } catch (e) { /* closed */ }
}
function netQuit(msg) {
netDrop(false);
run = null; paused = false; state = 'online'; onlSel = 0; netMsg = msg || ''; toastT = 0;
audioStop(); clearHeld(); setupAttract();
}

function onNetMsg(m, from) {
const n = net;
if (!n || destroyed || !m || typeof m !== 'object') return;
n.rx = performance.now();
if (NH) {
const pl = pilotOf(from);
if (!pl || pl.me || pl.left || m.b !== n.bid || !run || state !== 'play' || n.res) return;
if (m.t === 'p') hostPose(pl, m.d);
else if (m.t === 'f') hostFire(pl, m.d);
else if (m.t === 'hi' && !pl.hi) { // once per match, or a repeat would heal
pl.hi = true; pl.ship = clamp(m.s | 0, 0, SHIPS.length - 1); // stats no better than that ship fully upgraded
const sh = SHIPS[pl.ship];
pl.sMax = clamp(+m.sm || 100, 40, Math.round(sh.shield * 1.48)); pl.hMax = clamp(+m.hm || 100, 40, sh.hull); pl.regen = clamp(+m.rg || 14, 0, 20.8);
if (!pl.dead) { pl.hull = pl.hMax; pl.shield = pl.sMax; }
pSet(pl);
}
return;
}
if (from !== 0) return;
if (m.t === 'cfg') { n.mo = m.mo === 1 ? 1 : 0; n.se = clamp(m.se | 0, 0, SECT.length - 1); n.bo = m.bo ? 1 : 0; n.ph = String(m.ph); }
else if (m.t === 'start') { if ((m.b | 0) > n.bid) netBegin(m.b | 0, m.mo, m.se, m.bo, m.r); }
else if (m.b !== n.bid || !run || state !== 'play') return;
else if (m.t === 's') guestSnap(m);
else if (m.t === 'e' && Array.isArray(m.d)) { n.nq.push(m); if (n.nq.length > 40) evFlush(); }
else if (m.t === 'E') { evFlush(); if (net && !net.res) netResult(m.r); }
}
function hostPose(pl, d) {
if (!Array.isArray(d) || d.length < 14) return;
const sq = nv(d, 0);
if (sq <= pl.sq || (d[2] | 0) !== pl.gen) return; // stale
pl.sq = sq; pl.rx = performance.now(); pl.boost = !!d[13];
ibPush(pl, nv(d, 1), d, 3);
if (pl.idle) { pl.idle = false; pSet(pl); }
}
function fireOk(pl, d, o) { // the shot starts near one of the craft's recent reported spots
const b = pl.buf, x = nv(d, o), y = nv(d, o + 1), z = nv(d, o + 2);
for (let i = 0; i < pl.bn; i++) { const q = i * 11, dx = x - b[q + 1], dy = y - b[q + 2], dz = z - b[q + 3]; if (dx * dx + dy * dy + dz * dz < 90000) return true; }
return !pl.bn;
}
function hostFire(pl, d) { // 1 laser, 2 missile, 3 flares, 4 bump; capped per batch (a pilot fires about once per batch)
if (!Array.isArray(d) || pl.dead || run.done) return;
let nl = 0, nm = 0, nf = 0;
for (let o = 0; o < d.length;) {
const c = d[o];
if (c === 1) {
if (nl++ < 6 && fireOk(pl, d, o + 1)) {
NV1.set(nv(d, o + 4), nv(d, o + 5), nv(d, o + 6));
if (NV1.lengthSq() > 640000) NV1.setLength(800);
spawnBolt(0, nv(d, o + 1), nv(d, o + 2), nv(d, o + 3), NV1.x, NV1.y, NV1.z, 0.72, clamp(nv(d, o + 7), 0, SHIPS[pl.ship].dmg * 1.4 + 0.1), 6, 0.3, LASER_COL[pl.ship], pl);
}
o += 8;
} else if (c === 2) {
if (nm++ >= 2 || !fireOk(pl, d, o + 1)) { o += 12; continue; }
NV1.set(nv(d, o + 4), nv(d, o + 5), nv(d, o + 6));
if (NV1.lengthSq() < 0.01) NV1.set(0, 0, -1);
NV1.normalize(); NV2.set(nv(d, o + 7), nv(d, o + 8), nv(d, o + 9));
if (NV2.lengthSq() > 90000) NV2.setLength(300);
const id = d[o + 10] | 0, tp = id >= 100 ? pilotOf(id - 100) : null;
let tg = id >= 0 && id < ENT_MAX ? ENTS[id] : !tp ? null : !tp.me ? tp : NV && !P.dead ? P : null;
if (tg && tg !== P && (tg === pl || !targetable(tg))) tg = null;
netOwn = pl.idx;
const m = launchMissile(0, nv(d, o + 1), nv(d, o + 2), nv(d, o + 3), NV1, NV2, tg, false);
netOwn = -1;
if (m) m.homing = clamp(nv(d, o + 11), 0, 1);
o += 12;
} else if (c === 3) { if (nf++ < 1) { flaresFor(pl); if (evq()) NEV.push(7, pl.idx); } o++; }
else if (c === 4) { damagePilot(pl, clamp(nv(d, o + 1), 0, 60), -1, nv(d, o + 2), nv(d, o + 3), nv(d, o + 4)); o += 5; }
else break;
}
}
function guestSnap(m) {
const n = net, g = m.g, p = m.p, e = m.e, ms = m.m, k = nv(m, 'k');
if (!(+m.q > n.rq) || !Array.isArray(g) || !Array.isArray(p) || !Array.isArray(e) || !Array.isArray(ms)) return;
n.rq = +m.q;
run.wave = g[0] | 0; run.killPts = g[1] | 0; n.ht = nv(g, 2); run.sub = typeof g[3] === 'string' ? g[3].slice(0, 60) : '';
for (let o = 0; o + 22 <= p.length; o += 22) {
const pl = pilotOf(p[o] | 0), fl = p[o + 1] | 0, gen = p[o + 18] | 0;
if (!pl) continue;
pl.kills = p[o + 15] | 0; pl.deaths = p[o + 16] | 0; pl.rev = nv(p, o + 17) / 100;
if (fl & 4) pl.left = true;
if (pl.me) { if (gen === n.gen && !P.dead) { P.hull = nv(p, o + 13); P.shield = nv(p, o + 14); } continue; }
pl.ship = clamp(p[o + 2] | 0, 0, SHIPS.length - 1); pl.dead = !!(fl & 1); pl.idle = !!(fl & 2); pl.boost = !!(fl & 8);
pl.hull = nv(p, o + 13); pl.shield = nv(p, o + 14); pl.hMax = nv(p, o + 20) || 100; pl.sMax = nv(p, o + 21) || 100;
if (gen !== pl.gen) { pl.gen = gen; pl.bn = 0; }
ibPush(pl, k - nv(p, o + 19), p, o + 3);
pSet(pl);
}
const s = (n.sh + 1) % 8;
n.sh = s; n.sn = Math.min(8, n.sn + 1); SNT[s] = k;
SE.fill(0, s * ENT_MAX, s * ENT_MAX + ENT_MAX); SM.fill(0, s * MSL_MAX, s * MSL_MAX + MSL_MAX);
for (let o = 0; o + 13 <= e.length; o += 13) {
const i = e[o] | 0, q = s * ENT_MAX + i;
if (i < 0 || i >= ENT_MAX) continue;
SE[q] = clamp(e[o + 1] | 0, 0, KINDS.length - 1) + 1; SEF[q] = e[o + 11] | 0; SEH[q] = clamp(e[o + 12] | 0, 0, 100);
for (let j = 0; j < 9; j++) SEV[q * 9 + j] = nv(e, o + 2 + j);
}
for (let o = 0; o + 8 <= ms.length; o += 8) {
const i = ms[o] | 0, q = s * MSL_MAX + i;
if (i < 0 || i >= MSL_MAX) continue;
SM[q] = clamp(ms[o + 1] | 0, 0, 120) + 1;
for (let j = 0; j < 6; j++) SMV[q * 6 + j] = nv(ms, o + 2 + j);
}
}
function netApply(rt) { // guest: machines and missiles at rt; past the newest snapshot (a slow link) they carry on for up to 0.2 s
const n = net;
if (!n.sn) return;
let a = n.sh, b = -1;
for (let k = 1; k < n.sn && SNT[a] > rt; k++) { b = a; a = (a + 7) % 8; }
const x = b < 0 && n.sn > 1;
if (x) { b = a; a = (a + 7) % 8; }
const gap = Math.max(1, SNT[b] - SNT[a]), al = b < 0 ? 0 : clamp((rt - SNT[a]) / gap, 0, x ? 1 + 200 / gap : 1), iv = b < 0 ? 0 : 1000 / gap, lim = gap * gap * 0.16;
if (b < 0) b = a;
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i], qa = a * ENT_MAX + i, qb = b * ENT_MAX + i, qp = x ? qb : qa, ka = SE[qp]; // qp: the snapshot that says what exists
if (!ka) { e.on = false; continue; }
const both = SE[qa] === SE[qb] && nearS(SEV, qa * 9, qb * 9, lim), oa = (both ? qa : qp) * 9, ob = (both ? qb : qp) * 9, fl = SEF[qp]; // a reused slot is not blended
if (e.on && e.kind !== ka - 1 && P.tgt === e) P.tgt = null;
e.on = true; e.kind = ka - 1; e.team = e.kind === 6 ? 0 : 1; e.down = 0; e.r = KINDS[e.kind].r; e.hl = KINDS[e.kind].hl;
lv(e.p, SEV, oa, ob, al); lv(e.f, SEV, oa + 3, ob + 3, al).normalize(); lv(e.u, SEV, oa + 6, ob + 6, al).normalize();
e.v.set(SEV[ob] - SEV[oa], SEV[ob + 1] - SEV[oa + 1], SEV[ob + 2] - SEV[oa + 2]).multiplyScalar(iv);
e.flash = fl & 1; e.armed = fl & 2 ? 0.05 + (rt / 1000) % 0.7 : 0; e.wing = fl & 4 ? 1 : 0; e.marked = e.sleep = false; e.hp = SEH[qp]; e.maxHp = 100;
}
P.warnDist = 1e9;
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i], qa = a * MSL_MAX + i, qb = b * MSL_MAX + i, qp = x ? qb : qa, ka = SM[qp];
if (!ka) { m.on = false; continue; }
const c = ka - 1, both = SM[qa] === SM[qb] && nearS(SMV, qa * 6, qb * 6, lim), oa = (both ? qa : qp) * 6, ob = (both ? qb : qp) * 6;
m.on = true; m.team = c & 3; m.torp = !!(c & 4); m.tgt = (c >> 3) - 1 === n.me ? P : null;
lv(m.p, SMV, oa, ob, al); lv(m.f, SMV, oa + 3, ob + 3, al).normalize();
m.col.setHex(m.team === 0 ? 0xffffff : m.team === 2 ? 0xffd27a : m.torp ? 0xff7060 : 0xc04040);
if (m.tgt && m.team) P.warnDist = Math.min(P.warnDist, m.p.distanceTo(P.p));
if ((frameNo + i) & 1) FX.spawn(m.p.x - m.f.x * 1.4, m.p.y - m.f.y * 1.4, m.p.z - m.f.z * 1.4, 0, 0, 0, 0.2, m.torp ? 2.2 : 1.5, 0.4, 1, m.team ? 0.35 : 0.85, m.team ? 0.25 : 0.6, 1, 0);
}
}
function evDue(rt) { const q = net.nq; while (net && q.length && (q[0].k <= rt || q.length > 30)) evRun(q.shift().d); }
function evFlush() { const q = net.nq; while (net && q.length) evRun(q.shift().d); }
function evRun(d) { // guest: [code, x, y, z, a, b, c] or [code, a]
for (let o = 0; o < d.length;) {
const c = d[o] | 0, len = EVL[c] | 0, x = nv(d, o + 1), y = nv(d, o + 2), z = nv(d, o + 3), a = d[o + 4] | 0, b = d[o + 5] | 0, pl = pilotOf(len === 2 ? x : a);
if (!len) break;
o += len;
if (c === 1) {
if (b === net.me) continue;
spawnBolt(a, x, y, z, nv(d, o - 5), nv(d, o - 4), nv(d, o - 3), clamp(nv(d, o - 2), 0.05, 4), 0, a === 1 ? 3.6 : 6, a === 1 ? 0.38 : 0.3, d[o - 1] | 0, pilotOf(b));
if (a && P.p.distanceToSquared(KM.p.set(x, y, z)) < 40000) sq(a === 1 ? 330 : 520, 0.05, 0.02, a === 1 ? 160 : 260);
} else if (c === 2) killFx(a, x, y, z, b === net.me);
else if (c === 8) { boom(x, y, z, a ? 1.8 : 1.3, 0, 0, 0); soundBoom(x, y, z, false); }
else if (c === 9) { warpFx(x, y, z, true); shock(x, y, z, 60, 0x9fd8ff, 0.8); }
else if (c === 12) hurtFx(a, x, y, z, b);
else if (c === 5) toast('WAVE ' + x, UI.danger);
else if (c === 6) { P.msl = Math.min(ST.msl, P.msl + 2); P.flares = Math.min(8, P.flares + 2); toast('WAVE ' + x + ' CLEARED: REPAIRS +25%', UI.ok); tri(660, 0.12, 0.14); }
else if (!pl || (pl.me && c > 4)) continue;
else if (c === 3) evDown(pl, b, x, y, z);
else if (c === 4) evUp(pl, b, x, y, z, !!d[o - 1]);
else if (c === 7) flaresFor(pl);
else if (!pl.left) evLeft(pl);
}
}
function killFx(k, x, y, z, mine) {
const sz = k === 2 ? 3.2 : k === 3 || k === 7 ? 2.6 : k === 1 ? 1.7 : 1.2;
boom(x, y, z, sz, 0, 0, 0); soundBoom(x, y, z, sz > 2.5);
debris(x, y, z, 6, 9 + sz * 3, 0.45 * sz, 0x4a5060, 0.35);
if (k === 4) shock(x, y, z, 40, 0xff7050, 0.5);
if (mine) { KM.p.set(x, y, z); markKill(KM); tri(1180, 0.08, 0.09, 0.05); }
}
function hurtFx(i, x, y, z, hull) {
sparks(x, y, z, 5, 12, 0.4, 1, 1, 0.7, 0.35);
if (i !== net.me) return;
P.regenT = 3.2; P.hitDir.set(x - P.p.x, y - P.p.y, z - P.p.z).normalize(); P.hitDirT = 1;
if (hull) { hitFlash = Math.min(1, hitFlash + 0.4); addShake(0.3); nz(0.2, { vol: 0.14, filter: 1400 }); }
else shieldFlash = Math.min(1, shieldFlash + 0.45);
}

function netBoltEv(b, src) {
if (NG) {
if (src !== P) return;
if (NV) b.team = 2;
if (NF.length < 1500) { NF.push(1); pv(NF, b.p, n1); pv(NF, b.v, n1); NF.push(n1(b.dmg)); }
return;
}
if (NV && b.team === 0) b.team = 2;
if (!evq()) return;
NEV.push(1); pv(NEV, b.p, n1); NEV.push(b.team, src === P ? net.me : src && src.bt === 'rp' ? src.idx : -1); pv(NEV, b.v, n1); NEV.push(n2(b.life), b.col.getHex());
}
function netMslReq(x, y, z, dir, vel, tgt) {
NF.push(2, n1(x), n1(y), n1(z)); pv(NF, dir, n3); pv(NF, vel, n1);
NF.push(!tgt ? -1 : tgt.bt === 'ent' ? tgt.idx : tgt.bt === 'rp' ? 100 + tgt.idx : -1, P.locked && tgt ? 1 : tgt ? 0.3 : 0);
return DUMMY_M;
}
function netFlare() { if (NG) NF.push(3); else if (evq()) NEV.push(7, net.me); }
function flaresFor(pl) {
for (let i = 0, n = 0; i < FLR_MAX && n < 4; i++) {
const f = FLR[i];
if (f.on) continue;
f.on = true; f.life = 3.2; f.p.copy(pl.p); f.v.copy(pl.v).multiplyScalar(0.3); f.v.x += rnd(20); f.v.y += rnd(14); f.v.z += rnd(20);
n++;
}
if (NH) for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i];
if (!m.on || m.team === 0 || m.tgt !== pl || m.p.distanceToSquared(pl.p) > 176400 || Math.random() > 0.9) continue;
for (let k = 0; k < FLR_MAX; k++) if (FLR[k].on) { m.tgt = FLR[k]; m.flare = true; break; }
}
}
function mOwn(m) { return m.team === 1 ? -1 : m.own >= 0 ? m.own : net ? net.me : -1; }
function netBolt(b) { // real on the host, sparks on guests
const bx = b.p.x, by = b.p.y, bz = b.p.z;
if (b.team !== 1) {
for (let j = 0; j < ENT_MAX; j++) {
const e = ENTS[j];
if (!e.on || e.team !== 1 || !segHit(b.pp.x, b.pp.y, b.pp.z, bx, by, bz, e.p.x, e.p.y, e.p.z, e.r + e.hl * 0.5)) continue;
if (NH) damageEnt(e, b.dmg, b.src, bx, by, bz);
else sparks(bx, by, bz, 4, 10, 0.3, 0.8, 1, 0.8, 0.45);
if (b.player) hitMarkT = 0.15;
return true;
}
if (!NV) return false;
}
const own = b.src === P ? net.me : b.src && b.src.bt === 'rp' ? b.src.idx : -1;
for (let i = 0; i < 4; i++) {
const pl = PL[i], o = pPos(pl);
if (!pAlive(pl) || pl.idx === own || (NH && b.team === 1 && pl.me) || !segHit(b.pp.x, b.pp.y, b.pp.z, bx, by, bz, o.x, o.y, o.z, 2.8)) continue;
if (!NH) sparks(bx, by, bz, 4, 10, 0.3, 0.8, 1, 0.7, 0.4);
else if (pl.me) { lastBy = own; damagePlayer(b.dmg, bx, by, bz); lastBy = -1; }
else damagePilot(pl, b.dmg, own, bx, by, bz);
if (b.player) hitMarkT = 0.15;
return true;
}
return false;
}
function netMslHit(m) {
const own = mOwn(m);
for (let i = 0; i < 4; i++) {
const pl = PL[i];
if (!pAlive(pl) || pl.idx === own || pPos(pl).distanceToSquared(m.p) > 12.25) continue;
if (pl.me) { lastBy = own; damagePlayer(m.dmg, m.p.x, m.p.y, m.p.z); lastBy = -1; }
else damagePilot(pl, m.dmg, own, m.p.x, m.p.y, m.p.z);
return true;
}
return false;
}
function damagePilot(pl, dmg, by, x, y, z) {
if (!pl || pl.me || !pAlive(pl) || pl.inv > 0 || !run || run.done) return;
pl.regenT = 3.2;
const a = Math.min(Math.max(0, pl.shield), dmg);
pl.shield -= a; dmg -= a;
if (dmg > 0) pl.hull -= dmg;
evp(12, KM.p.set(x, y, z), pl.idx, dmg > 0 ? 1 : 0, 0);
if (pl.hull <= 0) { pl.hull = 0; netKO(pl, by); }
pSet(pl);
}
function netKO(pl, by) {
const o = pPos(pl);
evDown(pl, by, o.x, o.y, o.z);
evp(3, o, pl.idx, by, 0);
netCheck();
}
function netDown() { const me = NH ? pilotOf(net.me) : null; if (me && !me.dead) netKO(me, lastBy); }
function netBlast(p, R) {
for (let i = 0; i < 4; i++) {
const pl = PL[i], d = pl.p.distanceTo(p);
if (pl.on && d < R) damagePilot(pl, 48 * (1 - d / R) + 12, -1, p.x, p.y, p.z);
}
}
function netKill(e, src) {
const own = src === P ? net.me : !src ? -1 : src.bt === 'rp' ? src.idx : src.bt === 'msl' ? mOwn(src) : -1, pl = NV || e.team !== 1 ? null : pilotOf(own);
if (pl) pl.kills++;
evp(2, e.p, e.kind, own, 0);
}
function netWave(w) {
const k = netGuests();
if (k) spawnWave({ spawn: [[0, k * (1 + Math.floor(w / 3))], [1, w >= 3 ? k : 0]] });
if (evq()) NEV.push(5, w);
}
function netWaveClr() {
for (let i = 0; i < 4; i++) { const pl = PL[i]; if (pl.on) { pl.hull = Math.min(pl.hMax, pl.hull + pl.hMax * 0.25); pSet(pl); } }
if (evq()) NEV.push(6, run.wave);
}
function evDown(pl, by, x, y, z) { // every peer runs this
if (NH) {
pl.deaths++;
const k = NV && by !== pl.idx ? pilotOf(by) : null;
if (k) k.kills++;
}
pl.dead = true; pl.downT = pl.rev = 0; pSet(pl);
if (pl.me && !P.dead) playerDown();
if (NV) {
boom(x, y, z, 2.2, 0, 0, 0); debris(x, y, z, 8, 14, 0.6, 0xb8c0cc, 0.5); soundBoom(x, y, z, true);
if (pl.me) shipGroup.visible = false;
const kn = by >= 0 && by !== pl.idx ? (by === net.me ? 'YOU' : pName(by)) : '';
toast(pl.me ? (kn ? 'SPLASHED BY ' + kn : 'YOUR CRAFT BURST') : kn ? kn + ' SPLASHED ' + pl.name : pl.name + ' BURST', pl.me ? UI.danger : UI.hi);
} else if (!pl.me) {
sparks(x, y, z, 30, 20, 0.8, 1.4, 1, 0.75, 0.35); smoke(x, y, z, 6, 4, true, 2); soundBoom(x, y, z, false);
toast(pl.name + ' IS DOWN: FLY CLOSE TO REVIVE', UI.danger);
}
}
function evUp(pl, gen, x, y, z, full) { // every peer runs this
pl.dead = false; pl.gen = gen; pl.rev = pl.downT = 0; pl.inv = 3;
pl.hull = full ? pl.hMax : pl.hMax * 0.5; pl.shield = pl.sMax;
if (full && !pl.me) { pl.p.set(x, y, z); pl.bn = 0; }
pSet(pl);
if (!pl.me) { warpFx(x, y, z, full); if (!NV) toast(pl.name + ' IS BACK IN THE FIGHT', UI.ok); return; }
net.gen = gen;
if (full) { P.p.set(x, y, z); P.pp.copy(P.p); P.msl = ST.msl; P.flares = 8; }
respawnPlayer();
P.inv = 3; shipGroup.visible = true;
if (!full) P.hull *= 0.5;
toast(full ? 'BACK IN THE FIGHT' : 'REVIVED BY A WINGMATE', UI.ok);
}
function pilotsStep(h) {
for (let i = 0; i < 4; i++) {
const pl = PL[i], o = pPos(pl);
if (!pl.used || pl.left) continue;
if (!pl.me) {
pl.inv -= h; pl.regenT -= h;
if (!pl.dead && pl.regenT <= 0 && pl.shield < pl.sMax) { pl.shield = Math.min(pl.sMax, pl.shield + pl.regen * h); pSet(pl); }
}
if (!pl.dead || run.done) continue;
pl.downT += h;
if (NV) { if (pl.downT >= 3) vsRespawn(pl); continue; }
let near = false;
for (let j = 0; j < 4; j++) if (PL[j] !== pl && pAlive(PL[j]) && pPos(PL[j]).distanceToSquared(o) < 900) near = true;
pl.rev = near ? pl.rev + h / 2.5 : Math.max(0, pl.rev - h * 0.4);
if (pl.rev >= 1) { evUp(pl, pl.gen, o.x, o.y, o.z, false); evp(4, o, pl.idx, pl.gen, 0); }
}
}
function vsRespawn(pl) { // furthest from the other craft
let bd = -1;
for (let t = 0; t < 6; t++) {
const a = Math.random() * TAU;
NV1.set(run.zc.x + Math.sin(a) * 240, run.zc.y + rnd(50), run.zc.z + Math.cos(a) * 240);
pushFromAst(NV1, 8);
let md = 1e12;
for (let j = 0; j < 4; j++) if (PL[j] !== pl && pAlive(PL[j])) md = Math.min(md, pPos(PL[j]).distanceToSquared(NV1));
if (md > bd) { bd = md; NV2.copy(NV1); }
}
const g = pl.gen + 1;
evUp(pl, g, NV2.x, NV2.y, NV2.z, true);
evp(4, NV2, pl.idx, g, 1);
}
function vsStep(h) {
const n = net, sec = Math.floor(run.t);
if (sec !== n.sec) {
n.sec = sec; run.sub = fmtTime(VS_TIME - run.t) + ' left   First to ' + VS_KILLS + ' splashes';
let a = 0;
for (let i = 0; i < 4; i++) if (PL[i].used && !PL[i].left && !PL[i].idle) a++;
n.lone = a < 2 ? n.lone + 1 : 0; // seconds without an opponent that answers
netCheck();
}
if (!n.bo || run.done || (n.spT -= h) > 0) return;
n.spT = 8;
if (S.count(0) >= 3) return;
NV1.set(rnd(1), rnd(0.3), rnd(1)).normalize().multiplyScalar(rr(140, 300)).add(run.zc);
if (spawnEnt(0, NV1.x, NV1.y, NV1.z, { warp: true, weak: true })) evp(9, NV1, 0, 0, 0);
}
function netCheck() {
if (!NH || !run || run.done || state !== 'play') return;
let here = 0, up = 0, top = null;
for (let i = 0; i < 4; i++) {
const pl = PL[i];
if (!pl.used || pl.left) continue;
here++;
if (!pl.dead && !pl.idle) up++;
if (pl.kills >= VS_KILLS && !top) top = pl;
}
if (!NV) { if (!up) netEnd('Every craft is down.'); }
else if (top) netEnd(top.name + ' reached ' + VS_KILLS + ' splashes.');
else if (here < 2) netEnd('Not enough pilots left in the room.');
else if (net.lone > 20) netEnd('No other pilot is responding.');
else if (run.t >= VS_TIME) netEnd('Time is up.');
}
function netEnd(why) {
const n = net, r = localRes(why);
run.done = true;
let bk = -1, tie = false;
for (let i = 0; i < 4; i++) {
const pl = PL[i];
if (!pl.used || pl.left) continue;
if (pl.kills > bk) { bk = pl.kills; r.w = pl.idx; tie = false; } else if (pl.kills === bk) tie = true;
}
if (!NV || tie) r.w = -1;
netFlush();
n.s.broadcast({ t: 'E', b: n.bid, r: r });
netResult(r);
}
function localRes(why) {
const r = { m: NV ? 1 : 0, why: why, wave: NV || !run ? 0 : Math.max(0, run.wave - 1), score: 0, w: -1, p: [] };
if (!NV && run) r.score = run.killPts + r.wave * 250;
for (let i = 0; i < 4; i++) { const pl = PL[i]; if (pl.used) r.p.push([pl.idx, pl.name, pl.kills, pl.deaths, pl.left ? 1 : 0]); }
return r;
}
function netResult(r) {
if (!r || typeof r !== 'object' || !Array.isArray(r.p)) r = localRes('The final result did not arrive.');
net.res = r; net.endT = 0; nmenu = false;
if (run) run.done = true;
}
function toNetRes() {
const n = net, r = n.res;
state = 'nres'; overAt = performance.now(); resSel = 0; nmenu = false; toastT = 0; recNote = '';
audioStop(); clearHeld();
let mk = 0;
for (let i = 0; i < r.p.length; i++) if (Array.isArray(r.p[i]) && r.p[i][0] === n.me) mk = r.p[i][2] | 0;
nrec.n++;
if (r.m === 1) { nrec.vk += mk; if (r.w === n.me) { nrec.vw++; recNote = 'Win added to your online record.'; } }
else {
if ((r.score | 0) > nrec.s) { nrec.s = r.score | 0; recNote = 'New online best team score!'; }
if ((r.wave | 0) > nrec.w) { nrec.w = r.wave | 0; recNote = 'New online best wave!'; }
}
saveRec();
if (NH) { n.ph = 'res'; netCfg(); }
}
function netStart() {
const n = net, r = [];
if (netGuests() < 1) { deny(); toast('Waiting for another pilot to join', UI.dim); return; }
for (let i = 0; i < 4; i++) { const pl = PL[i]; if (pl.used && !pl.left) r.push([pl.idx, pl.name]); }
n.s.broadcast({ t: 'start', b: n.bid + 1, mo: n.mo, se: n.se, bo: n.bo, r: r });
netBegin(n.bid + 1, n.mo, n.se, n.bo, r);
}
function netBegin(bid, mo, se, bo, roster) { // every peer builds the same field
const n = net;
if (!Array.isArray(roster)) return;
n.bid = bid; n.mo = mo === 1 ? 1 : 0; n.se = clamp(se | 0, 0, SECT.length - 1); n.bo = bo ? 1 : 0; n.ph = 'play'; NV = n.mo === 1;
n.res = null; n.endT = n.ht = n.gen = n.sn = n.sh = n.lone = 0; n.nq.length = 0; n.rq = -1; n.spT = 4; n.sec = -1;
NEV.length = NF.length = 0; nmenu = false; netHide();
beginRun('gauntlet', NM, { def: NV ? VERSUS : GAUNTLET, pal: n.se, sky: 3 + n.se * 7, seed: 7000 + n.se * 131 + (NV ? 17 : 0) });
if (NG || NV || !n.bo) for (let i = 0; i < ENT_MAX; i++) ENTS[i].on = false;
run.wingOn = NH && !NV && !!n.bo;
run.obj = NV ? 'Versus: first to ' + VS_KILLS + ' splashes' : 'Co-op Gauntlet: survive together';
if (NV) run.zr = 620;
P.lance = 0;
let cnt = 0;
for (let i = 0; i < 4; i++) if (Array.isArray(roster[i])) cnt++;
for (let i = 0; i < 4; i++) {
const pl = PL[i], e = roster[i];
pl.used = Array.isArray(e); pl.on = false;
if (!pl.used) continue;
pl.idx = e[0] | 0; pl.me = pl.idx === n.me; pl.name = String(e[1] || 'Pilot').slice(0, 16); pl.q.set(0, 0, 0, 1);
if (NV) pl.p.set(run.zc.x + Math.sin(i / cnt * TAU) * 230, run.zc.y, run.zc.z + Math.cos(i / cnt * TAU) * 230);
else pl.p.set((i - (cnt - 1) / 2) * 18, 0, 0);
pl.left = pl.dead = pl.idle = pl.boost = pl.hi = false; pl.kills = pl.deaths = pl.rev = pl.downT = pl.gen = pl.regenT = pl.bn = 0; pl.inv = 2.5; pl.sq = -1;
pl.rx = performance.now() + 4000; pl.v.set(0, 0, 0);
pl.ship = pl.me ? save.ship : 0; pl.hMax = pl.hull = pl.me ? ST.hullMax : 100; pl.sMax = pl.shield = pl.me ? ST.shieldMax : 100; pl.regen = pl.me ? ST.regen : 14;
if (pl.me) { P.p.copy(pl.p); P.pp.copy(P.p); if (NV) respawnPlayer(); } // Versus: on a ring, facing the middle
pSet(pl);
}
snapCamera();
toast((NV ? 'VERSUS: ' : 'CO-OP GAUNTLET: ') + SECT[n.se].toUpperCase(), UI.hi);
if (NG) n.s.send({ t: 'hi', b: bid, s: save.ship, sm: ST.shieldMax, hm: ST.hullMax, rg: ST.regen });
}
function netSim(h) {
run.t += h;
flyStep(h); weaponsStep(h); autoTarget(h); lockStep(h);
if (NH) {
if (!run.done) { if (NV) vsStep(h); else gauntletStep(h); }
pilotsStep(h); entsStep(h);
}
boltsStep(h);
if (NH) missilesStep(h);
flaresStep(h);
}

function netFlush() {
if (!NEV.length || !net || !net.s) return;
MEV.b = net.bid; MEV.k = Math.round(net.s.hostTime());
net.s.broadcast(MEV);
NEV.length = 0;
}
function hostSnap() {
const n = net, k = Math.round(n.s.hostTime());
SG.length = SPL.length = SEA.length = SMA.length = 0;
SG.push(run.wave, run.killPts, n1(run.t), run.sub);
for (let i = 0; i < 4; i++) {
const pl = PL[i], o = pl.me ? P : pl;
if (!pl.used) continue;
if (pl.me) { pl.hull = P.hull; pl.shield = P.shield; pl.boost = P.boosting; }
SPL.push(pl.idx, (pl.dead ? 1 : 0) | (pl.idle ? 2 : 0) | (pl.left ? 4 : 0) | (pl.boost ? 8 : 0), pl.ship);
pv(SPL, o.p, n1); pq(SPL, o.q); pv(SPL, o.v, n1);
SPL.push(n1(pl.hull), n1(pl.shield), pl.kills, pl.deaths, Math.round(pl.rev * 100), pl.gen, pl.me ? 0 : 100, pl.hMax, pl.sMax);
}
for (let i = 0; i < ENT_MAX; i++) {
const e = ENTS[i];
if (!e.on || e.down > 0) continue;
SEA.push(i, e.kind); pv(SEA, e.p, n1); pv(SEA, e.f, n2); pv(SEA, e.u, n2);
SEA.push((e.flash > 0.2 ? 1 : 0) | (e.kind === 4 && e.armed > 0 ? 2 : 0) | (e.wing === 1 ? 4 : 0), Math.round(100 * clamp(e.hp / e.maxHp, 0, 1)));
}
for (let i = 0; i < MSL_MAX; i++) {
const m = MSL[i], t = m.tgt;
if (!m.on) continue;
SMA.push(i, m.team + (m.torp ? 4 : 0) + ((t === P ? n.me : t && t.bt === 'rp' ? t.idx : -1) + 1) * 8); pv(SMA, m.p, n1); pv(SMA, m.f, n2);
}
MSNAP.b = n.bid; MSNAP.q = ++n.q; MSNAP.k = k;
n.s.broadcast(MSNAP, FAST);
}
function netTick(now) {
const n = net, s = n.s, live = state === 'play' && !!run;
if (!s) return;
if (NH) {
if (live) {
hostSnap();
for (let i = 0; i < 4 && !n.res; i++) {
const pl = PL[i];
if (!pl.used || pl.me || pl.left || pl.idle || now - pl.rx < 4000) continue;
pl.idle = true; pSet(pl);
toast(pl.name + ' IS NOT RESPONDING', UI.dim);
netCheck();
}
} else if (now - n.cfgT > 2000) netCfg(); // keep-alive
netFlush();
} else if (live && !n.res) {
PD.length = 0;
PD.push(++n.q, Math.round(s.hostTime()), n.gen); pv(PD, P.p, n1); pq(PD, P.q); pv(PD, P.v, n1); PD.push(P.boosting ? 1 : 0);
MPOSE.b = n.bid; s.send(MPOSE, FAST);
if (NF.length) { MFIRE.b = n.bid; s.send(MFIRE); NF.length = 0; }
}
}
function netPilots(rt) {
for (let i = 0; i < 4; i++) {
const pl = PL[i];
if (!pl.used || pl.me) continue;
ibAt(pl, rt);
pl.g.visible = !pl.left && !pl.idle && !(NV && pl.dead);
if (!pl.g.visible) continue;
if (pl.gs !== pl.ship) { pl.gs = pl.ship; pl.gb.geometry = shipGeo[pl.ship].body; pl.gl.geometry = shipGeo[pl.ship].glow; }
pl.g.position.copy(pl.p); pl.g.quaternion.copy(pl.q);
const k = pl.dead ? 0.15 : 1, c = SHIP_RGB[pl.ship];
pl.gl.material.color.setRGB(k, k, k);
if (pl.dead) { if (Math.random() < 0.15) smoke(pl.p.x, pl.p.y, pl.p.z, 1, 2.5, true, 1.6); continue; }
NV1.set(0, 0, -1).applyQuaternion(pl.q);
FX.spawn(pl.p.x - NV1.x * 2.4, pl.p.y - NV1.y * 2.4, pl.p.z - NV1.z * 2.4, pl.v.x * 0.7 - NV1.x * 6, pl.v.y * 0.7 - NV1.y * 6, pl.v.z * 0.7 - NV1.z * 6,
pl.boost ? 0.32 : 0.2, pl.boost ? 1.6 : 1, 0.25, c[0] * 0.8 + 0.2, c[1] * 0.8 + 0.2, c[2] * 0.8 + 0.2, 0.8, 0);
}
}
function netFrame(now) {
const n = net, dtm = Math.min(250, Math.max(0, now - n.tP));
n.tP = now;
if (NG && now - n.rx > 12000) { netQuit('Connection lost'); return; }
n.tA += dtm;
if (n.tA >= 50) { n.tA = Math.min(n.tA - 50, 50); netTick(now); if (!net) return; }
if (state !== 'play' || !run) return;
const rt = n.s.hostTime() - 100;
if (NH) n.ht = run.t;
else { evDue(rt); if (!net) return; netApply(rt); }
netPilots(rt);
if (n.res && (n.endT += dtm / 1000) >= 1.5) toNetRes();
}

function netTop() {
const me = pilotOf(net.me), tl = Math.max(0, VS_TIME - net.ht);
T(NV ? 'VERSUS' : 'CO-OP GAUNTLET', 28, 30, 11, FONT_M, UI.dim, 'left');
T(NV ? 'SPLASHES ' + (me ? me.kills : 0) : 'SCORE ' + fmtNum(run.killPts), 28, 52, 20, FONT_M, UI.head, 'left', 150, '700');
T(fmtTime(NV ? tl : net.ht), 224, 52, 16, FONT_M, NV && tl < 30 ? UI.danger : UI.body, 'right');
}
function netHUD() {
const F = focal(), sx = touchMode ? 66 : 16, sy = touchMode ? 150 : 82, me = pilotOf(net.me); // touch: clear of the throttle
let y = sy + 31;
for (let i = 0; i < 4; i++) {
const pl = PL[i], col = pl.dead ? UI.danger : NV ? '#ffb070' : UI.friend;
if (!pl.used || pl.me || !pl.g.visible) continue;
if (onScreen(pl.p, 0)) {
const s = clamp(3 * F / Math.max(1, PJ.d), 8, 40), x = PJ.x, py = PJ.y;
if (pl !== P.tgt) brackets(x, py, s, col, 1.5);
T(pl.name, x, py - s - 10, 11, FONT_M, col, 'center', 160);
if (pl.dead) { T('REVIVE: FLY CLOSE', x, py + s + 12, 10, FONT_M, UI.hi, 'center'); bar(x - 26, py + s + 21, 52, 4, pl.rev, UI.ok); }
} else if (pl.dead) edgeArrow(pl.p, UI.danger, 'REVIVE');
}
glass(sx, sy, 220, 26 + 18 * (PL[0].used + PL[1].used + PL[2].used + PL[3].used));
T('PILOTS', sx + 12, sy + 13, 10, FONT_M, UI.dim, 'left');
T(NV ? 'SPLASH / BURST' : 'KILLS', sx + 208, sy + 13, 10, FONT_M, UI.dim, 'right');
for (let i = 0; i < 4; i++) {
const pl = PL[i], st = pl.left ? 'LEFT' : pl.idle ? 'IDLE' : pl.dead ? (NV ? 'OUT' : 'DOWN') : '';
if (!pl.used) continue;
T(pl.name, sx + 12, y, 12, FONT_M, pl.me ? UI.hi : pl.left ? UI.dim : UI.body, 'left', 104);
if (st) T(st, sx + 150, y, 10, FONT_M, pl.dead ? UI.danger : UI.dim, 'right');
T(NV ? pl.kills + ' / ' + pl.deaths : String(pl.kills), sx + 208, y, 12, FONT_M, UI.head, 'right');
y += 18;
}
if (P.dead && !run.done) {
T(NV ? 'A new craft launches in a moment' : 'A wingmate can revive you by flying close', VW / 2, VH / 2 + 40, 14, FONT_B, UI.body, 'center', VW - 80);
if (!NV && me) bar(VW / 2 - 60, VH / 2 + 56, 120, 6, me.rev, UI.ok);
}
}
function drawNetMenu() {
const x = VW / 2 - 190, y = VH / 2 - 118;
hctx.fillStyle = 'rgba(8,12,22,0.45)'; hctx.fillRect(0, 0, VW, VH);
panel(x, y, 380, 236);
T('Online match', VW / 2, y + 36, 26, FONT_D, UI.head, 'center');
T('The match keeps running: online play cannot pause.', VW / 2, y + 66, 13, FONT_B, UI.body, 'center', 340);
button('nm0', x + 70, y + 88, 240, 42, 'Resume', nmSel === 0, true, 16);
button('nm1', x + 70, y + 140, 240, 42, 'Leave match', nmSel === 1, true, 16);
T('Esc resume    Up / Down choose    Space select', VW / 2, y + 212, 11, FONT_M, UI.dim, 'center', 350);
}
function drawOnline() {
const x = VW / 2 - 270, y = VH / 2 - 196;
scrim(); panel(x, y, 540, 392);
T('Online', VW / 2, y + 40, 32, FONT_D, UI.head, 'center');
T('Room-code play for 2 to 4 pilots: Co-op Gauntlet or a Versus dogfight.', VW / 2, y + 76, 14, FONT_B, UI.body, 'center', 500);
T('YOUR ONLINE RECORD', VW / 2, y + 112, 11, FONT_M, UI.dim, 'center');
T('Matches ' + nrec.n + '    Co-op best wave ' + nrec.w + '    Best team score ' + fmtNum(nrec.s), VW / 2, y + 134, 13, FONT_M, UI.body, 'center', 500);
T('Versus wins ' + nrec.vw + '    Splashes ' + fmtNum(nrec.vk), VW / 2, y + 154, 13, FONT_M, UI.body, 'center', 500);
if (netMsg) T(netMsg, VW / 2, y + 188, 16, FONT_B, UI.danger, 'center', 500, '700');
button('no0', x + 120, y + 214, 300, 46, opening ? 'Opening...' : 'Host or join a room', onlSel === 0, !opening, 17);
button('no1', x + 190, y + 274, 160, 40, 'Back', onlSel === 1, true, 15);
T('Up / Down choose    Space select    Esc back', VW / 2, y + 372, 12, FONT_M, UI.dim, 'center');
}
function nsVal(i) { const n = net; return i === 0 ? (n.mo ? 'Versus' : 'Co-op Gauntlet') : i === 1 ? SECT[n.se] : !n.bo ? 'None' : n.mo ? 'Rogue drones' : 'Wing drones'; }
function drawNetSetup() {
const n = net, x = VW / 2 - 300, y = VH / 2 - 215;
scrim(); panel(x, y, 600, 430);
if (!n) return;
T(NH ? 'Room setup' : n.ph === 'res' ? 'Waiting for the host...' : 'Host is setting up...', VW / 2, y + 38, 28, FONT_D, UI.head, 'center', 560);
for (let i = 0; i < 3; i++) {
const ry = y + 64 + i * 50;
if (NH) { selBox(x + 40, ry, 520, 42, nsSel === i); addHit(NS_ID[i], x + 40, ry, 520, 42); }
T(NS_LAB[i], x + 60, ry + 21, 15, FONT_B, UI.body, 'left');
T(NH ? '<  ' + nsVal(i) + '  >' : nsVal(i), x + 540, ry + 21, 15, FONT_M, UI.hi, 'right');
}
T(n.mo ? 'Free-for-all dogfight in a rock field: first to ' + VS_KILLS + ' splashes, or most after 5 minutes.' : 'Endless drone waves and a shared score. Fly close to a downed wingmate to revive them.', VW / 2, y + 226, 13, FONT_B, UI.body, 'center', 560);
for (let i = 0; i < 4; i++) {
const pl = PL[i];
if (pl.used) T(pl.name + (pl.idx === 0 ? ' (host)' : '') + (pl.me ? ' (you)' : '') + (pl.left ? ' (left)' : ''), x + 150 + (i % 2) * 300, y + 258 + (i >> 1) * 22, 13, FONT_M, pl.left ? UI.dim : pl.me ? UI.hi : UI.body, 'center', 270);
}
if (NH) {
T('Keep this tab open and in front while you host.', VW / 2, y + 314, 13, FONT_B, UI.hi, 'center', 560, '700');
button('ns3', x + 60, y + 336, 230, 44, netGuests() ? 'Start match' : 'Waiting for pilots', nsSel === 3, netGuests() > 0, 16);
}
button('ns4', NH ? x + 310 : x + 185, y + 336, 230, 44, 'Leave room', nsSel === 4 || !NH, true, 16);
T(NH ? 'Up / Down choose    Left / Right change    Space select' : 'The match starts when the host is ready.    Space: leave the room', VW / 2, y + 406, 12, FONT_M, UI.dim, 'center', 560);
}
function drawNetRes() {
const n = net, r = n && n.res;
scrim();
if (!r) return;
const rows = Math.min(4, r.p.length), h = 270 + rows * 26, x = VW / 2 - 280, y = VH / 2 - h / 2, vs = r.m === 1, ready = performance.now() - overAt >= 600;
panel(x, y, 560, h);
T(!vs ? 'Gauntlet over' : r.w < 0 ? 'Draw' : r.w === n.me ? 'You win!' : resName(r, r.w) + ' wins', VW / 2, y + 40, 30, FONT_D, vs && r.w === n.me ? UI.ok : UI.head, 'center', 520);
T(String(r.why || ''), VW / 2, y + 72, 14, FONT_B, UI.body, 'center', 520);
if (!vs) T('Waves cleared ' + (r.wave | 0) + '    Team score ' + fmtNum(r.score | 0), VW / 2, y + 98, 15, FONT_M, UI.hi, 'center', 520);
T('PILOT', x + 40, y + 128, 11, FONT_M, UI.dim, 'left');
T(vs ? 'SPLASHES' : 'KILLS', x + 400, y + 128, 11, FONT_M, UI.dim, 'right');
T(vs ? 'BURSTS' : 'DOWNS', x + 520, y + 128, 11, FONT_M, UI.dim, 'right');
for (let i = 0; i < rows; i++) {
const e = r.p[i], ry = y + 152 + i * 26, mine = Array.isArray(e) && e[0] === n.me;
if (!Array.isArray(e)) continue;
T(String(e[1]).slice(0, 16) + (mine ? ' (you)' : '') + (e[4] ? ' (left)' : ''), x + 40, ry, 15, FONT_B, mine ? UI.hi : e[4] ? UI.dim : UI.body, 'left', 300);
T(String(e[2] | 0), x + 400, ry, 15, FONT_M, UI.head, 'right');
T(String(e[3] | 0), x + 520, ry, 15, FONT_M, UI.head, 'right');
}
if (recNote) T(recNote, VW / 2, y + 164 + rows * 26, 13, FONT_B, UI.cyan, 'center', 520, '700');
button('nr0', x + 70, y + h - 76, 190, 42, 'Rematch', resSel === 0, ready, 16);
button('nr1', x + 300, y + h - 76, 190, 42, 'Leave', resSel === 1, ready, 16);
T(NH ? 'Left / Right choose    Space select' : 'Rematch waits in the room for the host to start again', VW / 2, y + h - 18, 11, FONT_M, UI.dim, 'center', 520);
}

function netPlayKey(c, up, down, ok) { // the match keeps running
if (nmenu) {
keys[c] = false;
if (c === 'Escape' || c === 'KeyP') nmenu = false;
else if (up || down) { nmSel = 1 - nmSel; click(); }
else if (ok) { if (nmSel) netQuit(''); else nmenu = false; }
return true;
}
if (c !== 'Escape' && c !== 'KeyP') return false;
nmenu = true; nmSel = 0; clearHeld(); inp.mouseArmed = false; click();
return true;
}
function netPlayPtr(x, y) {
const id = hitAt(x, y);
if (nmenu) { if (id === 'nm1') netQuit(''); else if (id === 'nm0') nmenu = false; return true; }
if (id !== 'pause') return false;
nmenu = true; nmSel = 0; clearHeld(); inp.mouseArmed = false; click();
return true;
}
function nsChange(row, d) {
const n = net;
if (row === 0) n.mo = 1 - n.mo;
else if (row === 1) n.se = (n.se + d + SECT.length) % SECT.length;
else n.bo = 1 - n.bo;
click(); netCfg();
}
function resAct(i) {
if (performance.now() - overAt < 600) return; // input lock
if (i === 1) { netQuit(''); return; }
run = null; nmenu = false; netHide(); setupAttract();
state = 'nset'; nsSel = 3; click();
if (NH) { net.ph = 'setup'; netCfg(); }
}
function netKey(c, up, down, left, right, ok) {
const esc = c === 'Escape';
if (state === 'online') {
if (up || down) { onlSel = 1 - onlSel; click(); }
else if (ok && !onlSel) netOpen();
else if (ok || esc) toTitle();
} else if (!net) return;
else if (state === 'nres') {
if (up || down || left || right) { resSel = 1 - resSel; click(); }
else if (ok) resAct(resSel);
else if (esc) { resSel = 1; click(); }
} else if (!NH) { if (ok || esc) netQuit(''); }
else if (up || down) { nsSel = (nsSel + (up ? 4 : 1)) % 5; click(); }
else if ((left || right || ok) && nsSel < 3) nsChange(nsSel, left ? -1 : 1);
else if (ok) { if (nsSel === 3) netStart(); else netQuit(''); }
else if (esc) { nsSel = 4; click(); }
}
function netHover(id) {
const p = id.length === 3 ? id.slice(0, 2) : '', k = +id.charAt(2);
if (nmenu) { if (p === 'nm') nmSel = k; return false; }
if (p === 'no' && state === 'online') onlSel = k;
else if (p === 'ns' && state === 'nset') nsSel = k;
else if (p === 'nr' && state === 'nres') resSel = k;
else return false;
return true;
}
function netClick(id) { if (netHover(id)) netKey('', false, false, false, false, true); }

function resize() {
if (destroyed) return;
const cw = Math.max(1, root.clientWidth), ch = Math.max(1, root.clientHeight);
viewW = cw; viewH = ch; dpr = window.devicePixelRatio || 1;
renderer.setSize(cw, ch, false);
camera.aspect = cw / ch;
camera.updateProjectionMatrix();
hud.width = Math.max(1, Math.round(cw * dpr)); hud.height = Math.max(1, Math.round(ch * dpr));
hudK = Math.min(cw / 960, ch / 600);
VW = cw / hudK; VH = ch / hudK;
layoutTouch();
}
let lastT = performance.now(), lastFrame = lastT, acc = 0, frameAvg = 16, slowT = 0, fastT = 0, lastCursor = '';
function adaptRes(raw) {
if (!(raw > 0) || raw > 250) return;
frameAvg += (raw - frameAvg) * 0.08;
if (frameAvg > 20) {
fastT = 0; slowT += raw / 1000;
if (slowT > 1.5 && pixelRatio > 0.55) {
pixelRatio = Math.max(0.55, Math.round((pixelRatio - 0.15) * 100) / 100);
renderer.setPixelRatio(pixelRatio); renderer.setSize(viewW, viewH, false);
slowT = 0; frameAvg = 16;
}
} else if (frameAvg < 12) {
slowT = 0; fastT += raw / 1000;
if (fastT > 4 && pixelRatio < maxPR) {
pixelRatio = Math.min(maxPR, Math.round((pixelRatio + 0.1) * 100) / 100);
renderer.setPixelRatio(pixelRatio); renderer.setSize(viewW, viewH, false);
fastT = 0;
}
} else { slowT = 0; fastT = 0; }
}
function frame(now) {
if (destroyed) return;
raf = requestAnimationFrame(frame);
if (!paused) adaptRes(now - lastFrame);
lastFrame = now;
let dt = (now - lastT) / 1000;
lastT = now;
if (!(dt > 0)) dt = 0;
if (dt > 1 / 30) dt = 1 / 30;
if ((window.devicePixelRatio || 1) !== dpr) resize();
if (state === 'play' && run && !paused) {
acc += dt;
let n = 0;
while (acc >= STEP && n < MAX_STEPS) {
simStep(STEP); acc -= STEP; n++;
if (state !== 'play' || !run) break;
}
if (n >= MAX_STEPS) acc = 0;
if (hintT > 0) hintT -= dt;
if (hitFlash > 0) hitFlash = Math.max(0, hitFlash - dt * 1.5);
if (shieldFlash > 0) shieldFlash = Math.max(0, shieldFlash - dt * 2);
if (killT > 0) killT -= dt;
if (hitMarkT > 0) hitMarkT -= dt;
if (P.hitDirT > 0) P.hitDirT -= dt;
audioUpdate(dt);
}
if (toastT > 0 && !paused) toastT -= dt;
if (net) netFrame(now);
if (destroyed) return;
const vdt = paused ? 0 : dt;
updateCamera(vdt);
syncScene(vdt);
const us = viewH * pixelRatio / (2 * Math.tan(camera.fov * Math.PI / 360));
FX.uni.uScale.value = us; SMK.uni.uScale.value = us;
renderer.clear();
renderer.render(skyScene, camera);
renderer.clearDepth();
renderer.render(scene, camera);
drawHUD(now);
const cur = state === 'play' && !paused && save.mouse && !touchMode ? 'none' : 'default';
if (cur !== lastCursor) { lastCursor = cur; hud.style.cursor = cur; }
}

const LISTENERS = [
[window, 'keydown', onKeyDown], [window, 'keyup', onKeyUp], [window, 'blur', onBlur],
[document, 'visibilitychange', onVisibility],
[hud, 'pointerdown', onPointerDown], [hud, 'pointermove', onPointerMove], [hud, 'pointerup', onPointerUp],
[hud, 'pointercancel', onPointerUp], [hud, 'pointerleave', onPointerLeave], [hud, 'contextmenu', onContextMenu],
];
let ro = null;
if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(function () { resize(); }); ro.observe(root); }
else LISTENERS.push([window, 'resize', resize]);
for (let i = 0; i < LISTENERS.length; i++) LISTENERS[i][0].addEventListener(LISTENERS[i][1], LISTENERS[i][2]);

resize();
setupAttract();
updateCamera(0);
raf = requestAnimationFrame(frame);

function destroy() {
if (destroyed) return;
destroyed = true;
netDrop(true);
cancelAnimationFrame(raf);
audioStop();
for (let i = 0; i < LISTENERS.length; i++) LISTENERS[i][0].removeEventListener(LISTENERS[i][1], LISTENERS[i][2]);
if (ro) ro.disconnect();
try { if (document.pointerLockElement === hud && document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* ignore */ }
const collect = function (o) {
if (o.geometry) disposables.add(o.geometry);
if (o.material) {
const ms = Array.isArray(o.material) ? o.material : [o.material];
for (let i = 0; i < ms.length; i++) { disposables.add(ms[i]); if (ms[i].map) disposables.add(ms[i].map); }
}
if (o.isInstancedMesh && typeof o.dispose === 'function') { try { o.dispose(); } catch (e) { /* ignore */ } }
};
scene.traverse(collect); skyScene.traverse(collect);
for (let i = 0; i < capGeo.length; i++) { disposables.add(capGeo[i].body); disposables.add(capGeo[i].glow); }
for (let i = 0; i < shipGeo.length; i++) { disposables.add(shipGeo[i].body); disposables.add(shipGeo[i].glow); }
disposables.forEach(function (d) { try { d.dispose(); } catch (e) { /* ignore */ } });
disposables.clear();
try { renderer.dispose(); } catch (e) { /* ignore */ }
try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
if (hud.parentNode) hud.parentNode.removeChild(hud);
if (glc.parentNode) glc.parentNode.removeChild(glc);
}
function restart() {
if (destroyed) return;
clearHeld();
paused = false;
if (net || opening || state === 'online' || state === 'nset' || state === 'nres') { netDrop(true); run = null; } // leave the room, then a fresh solo run
if (run) { restartRun(); return; }
if (selIdx >= NM && missionUnlocked(NM)) beginRun('gauntlet', NM);
else beginRun('mission', missionUnlocked(selIdx) && selIdx < NM ? selIdx : 0);
}
return { destroy: destroy, restart: restart };
}

(window.RECESS = window.RECESS || { games: [] }).games.push({
id: 'void-lancer',
title: 'Void Lancer',
blurb: 'Starfighter dogfights, drone swarms and warship trench runs. 15 missions plus Gauntlet.',
genre: 'Action',
is3D: true,
controls: [
['Mouse / Arrows', 'Steer'],
['W / S / A / D', 'Throttle / roll'],
['F / Click', 'Lasers'],
['Space / R', 'Missiles / flares'],
['Shift / Esc', 'Boost / pause'],
['E / Q / V / C', 'Lance / wing / drift / view'],
],
scoreLabel: 'Campaign score',
lowerIsBetter: false,
online: { maxPlayers: 4 },
thumb: thumb,
mount: mount,
});
})();

} catch (e) { console.error("[Recess] void-lancer failed to load", e); }
try {
(function () {
'use strict';

/* =====================================================================
* Word Rain (Recess Arcade)
* Words fall over a night city. Type them to zap them with lightning
* from the rooftops before they land and black out a block of lights.
* ===================================================================== */

const W = 960;
const H = 600;
const F_DISPLAY = '"Bungee", "Impact", sans-serif';
const F_BODY = '"Figtree", system-ui, sans-serif';
const F_MONO = '"JetBrains Mono", ui-monospace, monospace';
const UI = {
scrim: 'rgba(8, 12, 22, 0.72)', panel: 'rgba(16, 22, 38, 0.92)', stroke: 'rgba(255, 255, 255, 0.12)',
head: '#FFFFFF', body: '#C9D3E3', hi: '#FFC93C', danger: '#FF5D5D', ok: '#4BE3A0',
};
const BG = '#060916';
const DISTRICTS = 5;          // city blocks = lives
const TAG_H = 34;             // word tag body height
const WORD_PX = 22;           // word font size
const SPAWN_Y = 62;           // words materialise just below the HUD
const MAX_PARTICLES = 420;
const MAX_POPUPS = 24;
const MAX_BOLTS = 28;
const SLOW_TIME = 5;
const SLOW_FACTOR = 0.4;
const RAIN_SLANT = 0.2;
const SENTINEL = ' ';         // kept in the hidden input so soft-keyboard Backspace is detectable
const PAUSE_BTN = { x: 922, y: 32, r: 18 };
const KINDS = {
normal: { top: 'rgba(40, 108, 200, 0.94)', bot: 'rgba(14, 34, 90, 0.96)', rim: '#7FD8FF', glow: '#38B6FF', rgb: '56, 182, 255' },
gold: { top: 'rgba(168, 112, 14, 0.95)', bot: 'rgba(72, 40, 4, 0.97)', rim: '#FFD95E', glow: '#FFB020', rgb: '255, 201, 60' },
ice: { top: 'rgba(56, 168, 204, 0.94)', bot: 'rgba(12, 66, 102, 0.96)', rim: '#E4FBFF', glow: '#8DEBFF', rgb: '141, 235, 255' },
storm: { top: 'rgba(118, 40, 170, 0.95)', bot: 'rgba(46, 12, 78, 0.97)', rim: '#E7A6FF', glow: '#C054FF', rgb: '192, 84, 255' }, // online only
};

const WORD_TEXT = `
ant ape arm art ask bag bat bed bee box bug bus cab cap car cat cow cub cup dad den dig dog dot ear egg elf elk emu eye fan fig
fin fix fox fun gem gum hat hay hen hop hug hut ice ink jam jar jet jog joy key kid kit lab lap leg lid log map mat mix mom mop
mud nap net nod nut oak oar owl pan paw pea pen pet pie pig pin pod pot pup ram ray rib rug run sap saw sea sip sky sun tab tag
tea toe top toy tub van vet wag wax web wig win yak yam yes zip zoo
arch atom baby bake ball band bark barn bean bear bell bike bird boat bone book boot bowl cake calm camp card cave chin city
clam clay coat coin comb cook corn crab cube dart desk dice dish dove drum duck dune echo farm fern fish flag foam fork frog
gate gift glow glue goat gold golf harp hike hill home hook horn iris iron jazz jump kite kiwi knot lake lamp leaf lime lion
loaf mask meal milk mint moon moss nest note oven page park pear pond pony quiz rain ring road robe rock roof rose sail sand
seal ship shoe sing snow soap sock soup star swan tent tide toad town tree tuba vase vine wave wind wing wolf yarn yawn yoga
zero zest zone
acorn amber angel apple arrow badge beach berry bloom bread brick brush cabin camel candy chair chalk cheer chess cliff clock
cloud coral crane crown daisy dance diary dream eagle earth easel fairy feast field flame flute frost fruit ghost giant globe
grape grass happy heart honey horse house igloo jelly jewel juice kayak koala lemon light lunar magic mango maple melon mouse
music night noble north ocean olive orbit otter panda paint party peach pearl piano pilot pizza plant puppy queen quilt radio
raven river robin robot salad scarf shark sheep shell skate sleep smile snack snail spark spoon storm sugar sunny swing table
tiger toast tower train truck tulip uncle unity vapor video vivid voice wagon water whale wheel world yacht young yummy zebra
anchor animal banana basket beetle bridge bubble bucket butter button camera candle canyon carrot castle cherry cookie copper
cotton crayon dragon desert dinner donkey eleven engine falcon family flower forest friend garden ginger glider guitar hammer
harbor helmet island jacket jigsaw jungle kitten ladder lagoon lizard magnet marble meadow mitten monkey muffin nectar noodle
orange oyster paddle palace parade parrot pebble pencil pepper pickle pillow planet pocket puzzle rabbit radish ribbon rocket
saddle salmon school shadow silver spider spring summer sunset tomato travel tunnel turtle velvet violin waffle walnut window
winter wizard yellow yogurt zipper
acrobat balloon bicycle blanket cabbage captain caramel cartoon chicken compass costume cricket crystal cupcake diamond dolphin
emerald evening explore feather firefly freckle gallery giraffe glacier harvest hexagon holiday iceberg jasmine journey kingdom
kitchen lantern leopard library lobster mermaid morning mustard octopus orchard pancake panther peacock penguin pilgrim popcorn
pretzel pumpkin rainbow raccoon sandals science seagull sparrow station sunrise teacher thunder tornado trumpet unicorn uniform
vanilla victory volcano weather whisper
airplane alphabet aquarium backpack baseball birthday blizzard bluebird building campfire cardinal carnival champion chipmunk
cinnamon daffodil daylight dinosaur doorknob dumpling elephant envelope festival firework flamingo football fountain goldfish
hedgehog homework kangaroo keyboard lemonade magazine marathon mountain notebook painting peaceful pinecone platypus postcard
raindrop sandwich seashell snowball sunshine treasure umbrella upstairs vacation
adventure afternoon astronaut blueberry bookshelf breakfast bumblebee butterfly carpenter celebrate chocolate crocodile
dandelion detective dragonfly evergreen fireflies fireplace fireworks gardening goldfinch grassland happiness harmonica
honeycomb hurricane invention jellyfish landscape lightning moonlight nightfall orchestra pineapple porcupine quicksand
rainstorm raspberry riverbank saxophone scarecrow snowflake spaceship starlight submarine sunflower telescope volunteer
waterfall xylophone yardstick zookeeper
applesauce basketball blackboard blueprints campground chimpanzee classmates crossroads earthquake friendship instrument
jackrabbit kingfisher lighthouse lumberjack motorcycle nightlight parachutes peppermint photograph playground rainforest
rhinoceros sandcastle scoreboard skateboard snowflakes strawberry sunglasses tablespoon toothbrush tournament trampoline
turtleneck typewriter underwater volleyball watercolor watermelon wilderness wonderland woodpecker xylophones zookeepers
`;
const BUCKETS = buildBuckets(WORD_TEXT);

function buildBuckets(text) {
const b = {};
const seen = {};
for (let n = 3; n <= 10; n++) b[n] = [];
text.split(/\s+/).forEach(function (raw) {
const w = raw.toLowerCase();
if (/^[a-z]{3,10}$/.test(w) && !seen[w]) { seen[w] = true; b[w.length].push(w); }
});
return b;
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeOutBack(x) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function tagWidth(n, cw) { return Math.max(78, n * cw + 34); }
function mulberry32(seed) {
let a = seed >>> 0;
return function () {
a = (a + 0x6D2B79F5) | 0;
let r = Math.imul(a ^ (a >>> 15), 1 | a);
r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
}
function setFit(c, text, maxW, weight, size, family) {
c.font = weight + ' ' + size + 'px ' + family;
const m = c.measureText(text).width;
if (m > maxW && m > 0) c.font = weight + ' ' + Math.max(9, Math.floor((size * maxW) / m)) + 'px ' + family;
}
function roundRectPath(c, x, y, w, h, r) {
c.beginPath();
c.moveTo(x + r, y);
c.arcTo(x + w, y, x + w, y + h, r);
c.arcTo(x + w, y + h, x, y + h, r);
c.arcTo(x, y + h, x, y, r);
c.arcTo(x, y, x + w, y, r);
c.closePath();
}
function drawPanel(c, x, y, w, h) {
roundRectPath(c, x, y, w, h, 18);
c.fillStyle = UI.panel; c.fill();
c.lineWidth = 2; c.strokeStyle = UI.stroke; c.stroke();
}
function disc(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }

const SIDE_X = 776; // online words fall left of the sidebar
const NET_N = 4;
const STREAK_GAP = 2.5, STORM_CD = 6; // s: most between the 3 words of a storm; storm recharge
const MATCH_T = 180, CAP_T = 360; // s: top-score match, last-city time limit
const COUNT_MS = 3000;
const BOT_ROOF = 490;
const BOT_NAMES = ['Gust', 'Hail', 'Mist'];
const BOT_CPS = [3, 3.8, 4.6]; // letters per second, about 36 / 46 / 55 WPM
const LVS = [1, 3, 5];
const MODES = ['Last city standing', 'Top score in 3 minutes'];
const HEADS = ['YOU WIN!', '2ND PLACE', '3RD PLACE', '4TH PLACE'];
const PLACES = ['1st', '2nd', '3rd', '4th'];
const WHY = { last: 'One city left standing', cap: 'Six-minute limit', time: "Time's up", out: 'Every city went dark', left: 'Everyone else left' };
const CD = ['', '1', '2', '3'];
const FAST = { fast: true };
const REL = {};
const SB_X = SIDE_X + 6, SB_W = W - SIDE_X - 14, SB_Y = 74, ROW_H = 46;
const FN_B11 = '800 11px ' + F_BODY, FN_B13 = '800 13px ' + F_BODY;
const FN_B15 = '700 15px ' + F_BODY, FN_B16 = '600 16px ' + F_BODY, FN_B20 = '800 20px ' + F_BODY;
const FN_M11 = '700 11px ' + F_MONO, FN_M14 = '700 14px ' + F_MONO, FN_D120 = 'normal 120px ' + F_DISPLAY;
const DIM = 'rgba(201, 211, 227, 0.7)';

function makeStream(seed, lv0) { return { rnd: mulberry32(seed), lv0: lv0, list: [], gold: -99, ice: -99 }; }
function streamAt(S, k) {
while (S.list.length <= k) S.list.push(streamNext(S));
return S.list[k];
}
function streamNext(S) {
const k = S.list.length, r = S.rnd, lv = S.lv0 + Math.floor(k / 10);
let lo = Math.min(6, 3 + Math.floor((lv - 1) / 3)), hi = Math.min(10, 4 + lv), kd = 'normal';
const rk = r();
if (k >= 4 && rk < 0.055 && k - S.gold >= 8) { kd = 'gold'; S.gold = k; lo = Math.max(lo, 5); hi = Math.max(hi, 7); }
else if (k >= 4 && rk > 0.94 && k - S.ice >= 8) { kd = 'ice'; S.ice = k; }
let t = null;
for (let i = 0; i < 40 && !t; i++) { // not a recent word, nor a first letter of the last 8
const b = BUCKETS[lo + Math.floor(r() * (hi - lo + 1))];
const w = b[Math.floor(r() * b.length)];
let bad = false;
for (let j = k - 1; j >= 0 && j >= k - 24 && !bad; j--) bad = S.list[j].t === w || (j >= k - 8 && S.list[j].t[0] === w[0]);
if (!bad) t = w;
}
if (!t) t = BUCKETS[lo][Math.floor(r() * BUCKETS[lo].length)];
return { t: t, kd: kd };
}

function makeSky(rnd) {
const stars = [];
for (let i = 0; i < 90; i++) {
stars.push({ x: rnd() * W, y: rnd() * 380, r: rnd() < 0.15 ? 2 : 1.2, a: 0.35 + rnd() * 0.6, sp: 0.8 + rnd() * 2.2, ph: rnd() * 6.283 });
}
const clouds = [];
for (let i = 0; i < 4; i++) {
const puffs = [];
const n = 5 + Math.floor(rnd() * 4);
for (let j = 0; j < n; j++) puffs.push({ dx: j * 34 + rnd() * 16, dy: rnd() * 18 - 9, r: 26 + rnd() * 26 });
clouds.push({ x: rnd() * (W + 700), y: 40 + i * 70 + rnd() * 40, sp: 6 + rnd() * 8, puffs: puffs, a: 0.35 + rnd() * 0.25 });
}
return { stars: stars, clouds: clouds };
}

function makeRain(rnd) {
const a = [];
for (let i = 0; i < 110; i++) a.push({ x: rnd() * (W + 140), y: rnd() * H, len: 10 + rnd() * 16, spd: 380 + rnd() * 260 });
return a;
}

function makeCity(rnd, fw) {
const R = function (a, b) { return a + rnd() * (b - a); };
const far = [];
const farWins = [];
let x = -20;
while (x < W + 20) {
const bw = R(36, 84);
const top = R(392, 462);
far.push({ x: x, w: bw, top: top, spire: rnd() < 0.18 });
for (let wy = top + 10; wy < 520; wy += 12) {
for (let wx = x + 6; wx < x + bw - 6; wx += 9) if (rnd() < 0.18) farWins.push({ x: wx, y: wy });
}
x += bw + R(-6, 2);
}
const near = [];
const dw = (fw || W) / DISTRICTS;
x = -8;
while (x < W + 8) {
const bw = Math.round(R(48, 98));
const top = Math.round(R(482, 534));
const roof = Math.floor(rnd() * 4);
const b = { x: x, w: bw, top: top, roof: roof, hit: roof === 2 ? top - 7 : top, rod: false, wins: [] };
const cols = Math.max(1, Math.floor((bw - 12) / 13));
const gx = x + (bw - cols * 13) / 2 + 3.5;
for (let wy = top + 12; wy < H - 14; wy += 15) {
for (let c = 0; c < cols; c++) {
if (rnd() >= 0.6) continue;
const wx = gx + c * 13;
b.wins.push({ x: wx, y: wy, d: clamp(Math.floor((wx + 3) / dw), 0, DISTRICTS - 1), ph: rnd() * 6.283, warm: rnd() < 0.72 });
}
}
near.push(b);
x += bw + Math.round(R(0, 5));
}
const districts = [];
for (let i = 0; i < DISTRICTS; i++) {
const x0 = i * dw;
const x1 = x0 + dw;
const mid = (x0 + x1) / 2;
let best = null;
for (const b of near) {
const cx = b.x + b.w / 2;
if (cx >= x0 + 20 && cx < x1 - 20 && (!best || b.top < best.top)) best = b;
}
if (!best) {
for (const b of near) if (!best || Math.abs(b.x + b.w / 2 - mid) < Math.abs(best.x + best.w / 2 - mid)) best = b;
}
best.rod = true;
best.roof = 0;
best.hit = best.top;
districts.push({ x0: x0, x1: x1, rodX: best.x + best.w / 2, rodY: best.top - 24, baseY: best.top, dead: false, kill: 0, lit: 1, glow: 0, smokeT: rnd() });
}
return { far: far, farWins: farWins, near: near, districts: districts, dw: dw };
}

function boltPts(x0, y0, x1, y1, rnd, detail) {
let pts = [{ x: x0, y: y0 }, { x: x1, y: y1 }];
let off = Math.hypot(x1 - x0, y1 - y0) * 0.16;
for (let k = 0; k < detail; k++) {
const np = [pts[0]];
for (let i = 1; i < pts.length; i++) {
const a = pts[i - 1];
const b = pts[i];
const dx = b.x - a.x;
const dy = b.y - a.y;
const len = Math.hypot(dx, dy) || 1;
const o = (rnd() * 2 - 1) * off;
np.push({ x: (a.x + b.x) / 2 - (dy / len) * o, y: (a.y + b.y) / 2 + (dx / len) * o }, b);
}
pts = np;
off *= 0.55;
}
return pts;
}

function vGrad(c, y0, y1, stops) {
const g = c.createLinearGradient(0, y0, 0, y1);
for (const s of stops) g.addColorStop(s[0], s[1]);
return g;
}

function drawSky(c, sky, t) {
c.fillStyle = vGrad(c, 0, H, [[0, '#04071a'], [0.5, '#10143c'], [0.8, '#2b1b52'], [1, '#4b2456']]);
c.fillRect(0, 0, W, H);
c.fillStyle = '#FFFFFF';
for (const s of sky.stars) {
c.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
c.fillRect(s.x, s.y, s.r, s.r);
}
c.globalAlpha = 1;
const mx = 818, my = 132;
const mg = c.createRadialGradient(mx, my, 20, mx, my, 130);
mg.addColorStop(0, 'rgba(255, 236, 196, 0.32)');
mg.addColorStop(1, 'rgba(255, 236, 196, 0)');
c.fillStyle = mg; c.fillRect(mx - 130, my - 130, 260, 260);
c.fillStyle = '#FFF2D2'; disc(c, mx, my, 32); c.fill();
c.fillStyle = 'rgba(214, 190, 150, 0.45)';
disc(c, mx - 10, my - 8, 7); c.fill();
disc(c, mx + 12, my + 6, 5); c.fill();
disc(c, mx - 2, my + 15, 4); c.fill();
const span = W + 700;
for (const cl of sky.clouds) {
const cx = (((cl.x + t * cl.sp) % span) + span) % span - 350;
c.fillStyle = 'rgba(22, 26, 58, ' + cl.a + ')';
c.beginPath();
for (const p of cl.puffs) {
c.moveTo(cx + p.dx + p.r, cl.y + p.dy);
c.arc(cx + p.dx, cl.y + p.dy, p.r, 0, Math.PI * 2);
}
c.fill();
}
c.fillStyle = vGrad(c, 360, 540, [[0, 'rgba(255, 120, 170, 0)'], [1, 'rgba(255, 120, 170, 0.2)']]);
c.fillRect(0, 360, W, 180);
}

function drawFarCity(c, city) {
c.fillStyle = '#161c40';
for (const b of city.far) {
c.fillRect(b.x, b.top, b.w, H - b.top);
if (!b.spire) continue;
c.beginPath();
c.moveTo(b.x + b.w / 2 - 6, b.top); c.lineTo(b.x + b.w / 2, b.top - 26); c.lineTo(b.x + b.w / 2 + 6, b.top);
c.fill();
}
c.fillStyle = 'rgba(255, 210, 140, 0.22)';
for (const p of city.farWins) c.fillRect(p.x, p.y, 3, 4);
}

function drawRain(c, rain) {
c.strokeStyle = 'rgba(160, 196, 255, 0.24)';
c.lineWidth = 1.2;
c.beginPath();
for (const r of rain) { c.moveTo(r.x, r.y); c.lineTo(r.x + r.len * RAIN_SLANT, r.y - r.len); }
c.stroke();
}

function drawNearCity(c, city, t) {
c.fillStyle = vGrad(c, 470, H, [[0, '#0f1530'], [1, '#04060d']]);
for (const b of city.near) {
c.fillRect(b.x, b.top, b.w, H - b.top);
if (b.roof === 1) { // water tower
const tx = b.x + b.w * 0.62;
c.fillRect(tx, b.top - 16, 16, 11);
c.fillRect(tx + 2, b.top - 5, 2, 5);
c.fillRect(tx + 12, b.top - 5, 2, 5);
c.beginPath();
c.moveTo(tx - 1, b.top - 16); c.lineTo(tx + 8, b.top - 22); c.lineTo(tx + 17, b.top - 16);
c.fill();
} else if (b.roof === 2) {
c.fillRect(b.x + 8, b.top - 7, b.w - 16, 7);
} else if (b.roof === 3) {
c.fillRect(b.x + b.w * 0.3, b.top - 18, 2, 18);
}
}
c.fillStyle = 'rgba(150, 170, 255, 0.22)';
for (const b of city.near) c.fillRect(b.x, b.top, b.w, 2);
for (const b of city.near) {
for (const wn of b.wins) {
const L = city.districts[wn.d].lit;
if (L < 0.02) { c.globalAlpha = 1; c.fillStyle = '#1a2038'; }
else { c.globalAlpha = L * (0.72 + 0.28 * Math.sin(t * 1.3 + wn.ph)); c.fillStyle = wn.warm ? '#FFD27A' : '#8FE3FF'; }
c.fillRect(wn.x, wn.y, 6, 8);
}
}
c.globalAlpha = 1;
for (const d of city.districts) {
c.strokeStyle = '#2c375e';
c.lineWidth = 2;
c.beginPath();
c.moveTo(d.rodX, d.baseY); c.lineTo(d.rodX, d.rodY + 3);
c.moveTo(d.rodX - 5, d.baseY - 7); c.lineTo(d.rodX + 5, d.baseY - 7);
c.stroke();
const blink = Math.sin(t * 3 + d.rodX) > 0.6;
if (d.glow > 0 || (!d.dead && blink)) {
c.shadowColor = d.glow > 0 ? '#8DEBFF' : '#FF5D5D';
c.shadowBlur = d.glow > 0 ? 18 : 8;
}
c.fillStyle = d.glow > 0 ? '#E8FBFF' : d.dead ? '#3a3f55' : blink ? '#FF5D5D' : '#7a2a3a';
disc(c, d.rodX, d.rodY, d.glow > 0 ? 4.5 : 3);
c.fill();
c.shadowBlur = 0;
}
}

function tagPath(c, tw) {
const r = TAG_H / 2;
const hw = tw / 2;
const top = -r;
c.beginPath();
c.moveTo(0, top - 13);
c.bezierCurveTo(3, top - 7, 9, top - 1, 17, top);
c.lineTo(hw - r, top);
c.arc(hw - r, 0, r, -Math.PI / 2, Math.PI / 2);
c.lineTo(-hw + r, r);
c.arc(-hw + r, 0, r, Math.PI / 2, Math.PI * 1.5);
c.lineTo(-17, top);
c.bezierCurveTo(-9, top - 1, -3, top - 7, 0, top - 13);
c.closePath();
}

function drawSparkle(c, x, y, r, t) {
c.save();
c.translate(x, y); c.rotate(t * 1.5);
c.fillStyle = '#FFF4C2'; c.shadowColor = '#FFC93C'; c.shadowBlur = 10;
c.beginPath();
for (let i = 0; i < 8; i++) {
const a = (i * Math.PI) / 4;
const rr = i % 2 ? r * 0.35 : r;
c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
}
c.closePath(); c.fill();
c.restore();
}

function drawZap(c, x, y, s) {
c.save();
c.translate(x, y); c.scale(s, s);
c.fillStyle = '#F6DDFF'; c.shadowColor = '#C054FF'; c.shadowBlur = 8;
c.beginPath();
c.moveTo(2, -8); c.lineTo(-4, 1); c.lineTo(0, 1); c.lineTo(-2, 8); c.lineTo(5, -2); c.lineTo(1, -2);
c.closePath(); c.fill();
c.restore();
}

function drawFlake(c, x, y, r, t) {
c.save();
c.translate(x, y); c.rotate(t * 0.8);
c.strokeStyle = '#F2FDFF'; c.lineWidth = 1.6; c.shadowColor = '#8DEBFF'; c.shadowBlur = 8;
c.beginPath();
for (let i = 0; i < 3; i++) {
const a = (i * Math.PI) / 3;
c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
c.lineTo(-Math.cos(a) * r, -Math.sin(a) * r);
}
c.stroke();
c.restore();
}

function drawTag(c, x, y, text, typed, kind, o) {
const k = KINDS[kind] || KINDS.normal;
const n = text.length;
const cw = o.cw;
const tw = tagWidth(n, cw);
const hh = TAG_H / 2;
c.save();
c.translate(x, y);
if (o.scale !== 1) c.scale(o.scale, o.scale);
c.globalAlpha = o.alpha;
c.lineCap = 'round';
c.lineJoin = 'round';
if (o.trail) { // rain streaks above the drop
c.strokeStyle = vGrad(c, -hh - 70, -hh - 4, [[0, 'rgba(' + k.rgb + ', 0)'], [1, 'rgba(' + k.rgb + ', 0.5)']]);
c.lineWidth = 2;
c.beginPath();
c.moveTo(-tw * 0.3, -hh - 50); c.lineTo(-tw * 0.3, -hh - 4);
c.moveTo(0, -hh - 66); c.lineTo(0, -hh - 18);
c.moveTo(tw * 0.3, -hh - 40); c.lineTo(tw * 0.3, -hh - 4);
c.stroke();
}
tagPath(c, tw);
c.fillStyle = vGrad(c, -hh - 13, hh, [[0, k.top], [1, k.bot]]);
c.shadowColor = o.locked ? UI.hi : k.glow;
c.shadowBlur = o.locked ? 24 : 14;
c.fill();
c.shadowBlur = 0;
if (o.flash > 0) { c.fillStyle = 'rgba(255, 93, 93, ' + (0.55 * o.flash).toFixed(3) + ')'; c.fill(); }
c.lineWidth = o.locked ? 3 : 2;
c.strokeStyle = o.flash > 0 ? UI.danger : o.locked ? UI.hi : k.rim;
c.stroke();
if (o.danger > 0 && o.flash <= 0) { // pulsing red rim close to the rooftops
c.strokeStyle = 'rgba(255, 93, 93, ' + (o.danger * (0.55 + 0.45 * Math.sin(o.t * 12))).toFixed(3) + ')';
c.lineWidth = 3;
c.stroke();
}
c.fillStyle = 'rgba(255, 255, 255, 0.16)';
c.beginPath(); c.ellipse(-tw / 2 + 24, -hh + 8, 12, 4, -0.25, 0, Math.PI * 2); c.fill();
if (kind === 'gold') drawSparkle(c, tw / 2 - 8, -hh + 1, 7, o.t);
else if (kind === 'ice') drawFlake(c, tw / 2 - 8, -hh + 1, 7, o.t);
else if (kind === 'storm') drawZap(c, tw / 2 - 8, -hh + 1, 1);
c.font = '700 ' + WORD_PX + 'px ' + F_MONO;
c.textAlign = 'center';
c.textBaseline = 'middle';
const x0 = (-n * cw) / 2;
for (let i = 0; i < n; i++) {
c.fillStyle = i < typed ? UI.hi : '#FFFFFF';
c.fillText(text[i], x0 + cw * (i + 0.5), 1);
}
if (o.locked && typed < n) { // caret under the next letter
c.fillStyle = 'rgba(255, 201, 60, ' + (0.7 + 0.3 * Math.sin(o.t * 10)).toFixed(3) + ')';
c.fillRect(x0 + cw * typed + 2, 11, cw - 4, 2.5);
}
if (o.locked) { // lock-on reticle
const p = 6 + 2 * Math.sin(o.t * 8);
const rx = tw / 2 + p;
const ry = hh + p;
c.strokeStyle = UI.hi; c.lineWidth = 2.5;
c.beginPath();
for (let sx = -1; sx <= 1; sx += 2) {
for (let sy = -1; sy <= 1; sy += 2) {
c.moveTo(sx * rx, sy * (ry - 9));
c.lineTo(sx * rx, sy * ry);
c.lineTo(sx * (rx - 12), sy * ry);
}
}
c.stroke();
}
c.restore();
}

function strokePts(c, pts) {
c.beginPath();
c.moveTo(pts[0].x, pts[0].y);
for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
c.stroke();
}

function drawBolt(c, b, t) {
c.save();
c.globalAlpha = clamp(b.life / b.max, 0, 1) * (0.7 + 0.3 * Math.sin(t * 80 + b.seed));
c.lineJoin = 'round';
c.lineCap = 'round';
c.strokeStyle = b.color; c.lineWidth = b.w * 3; c.shadowColor = b.color; c.shadowBlur = 18;
strokePts(c, b.pts);
for (const br of b.branches) strokePts(c, br);
c.shadowBlur = 0;
c.strokeStyle = '#FFFFFF'; c.lineWidth = b.w;
strokePts(c, b.pts);
c.lineWidth = Math.max(0.8, b.w * 0.6);
for (const br of b.branches) strokePts(c, br);
c.restore();
}

function thumb(c, w, h) {
const rnd = mulberry32(20261027);
c.save();
c.fillStyle = BG;
c.fillRect(0, 0, w, h);
const s = Math.max(w / W, h / H); // cover-fit the 960x600 scene
c.translate((w - W * s) / 2, (h - H * s) / 2);
c.scale(s, s);
const sky = makeSky(rnd);
const city = makeCity(rnd);
const dark = city.districts[1]; // one block already blacked out
dark.dead = true;
dark.lit = 0;
const hot = city.districts[3];
hot.glow = 0.3;
drawSky(c, sky, 0.6);
drawFarCity(c, city);
drawRain(c, makeRain(rnd));
const zx = 470, zy = 170;
const bolt = { pts: boltPts(hot.rodX, hot.rodY, zx, zy + 10, rnd, 5), branches: [], color: '#9FE8FF', w: 3, life: 1, max: 1, seed: 1.2 };
bolt.branches.push(boltPts(bolt.pts[12].x, bolt.pts[12].y, bolt.pts[12].x + 60, bolt.pts[12].y - 30, rnd, 3));
drawBolt(c, bolt, 0);
const near = city.districts[2];
drawBolt(c, { pts: boltPts(near.rodX, near.rodY, 600, 352, rnd, 4), branches: [], color: '#9FE8FF', w: 1.4, life: 1, max: 1, seed: 0 }, 0);
c.font = '700 ' + WORD_PX + 'px ' + F_MONO;
const o = { cw: c.measureText('m').width || 13.2, locked: false, flash: 0, danger: 0, scale: 1.3, alpha: 1, t: 0.4, trail: true };
drawTag(c, 200, 150, 'thunder', 0, 'normal', o);
drawTag(c, 790, 250, 'sunshine', 0, 'gold', o);
o.danger = 0.9;
drawTag(c, 230, 392, 'frost', 0, 'ice', o);
o.danger = 0;
o.locked = true;
drawTag(c, 600, 330, 'rainbow', 4, 'normal', o);
drawNearCity(c, city, 0.6);
c.strokeStyle = 'rgba(141, 235, 255, 0.7)'; c.lineWidth = 3;
disc(c, zx, zy, 46); c.stroke();
c.lineCap = 'round'; c.lineWidth = 2.5;
for (let i = 0; i < 18; i++) {
const a = (i / 18) * Math.PI * 2;
const r0 = 30 + rnd() * 20;
const r1 = r0 + 14 + rnd() * 18;
c.strokeStyle = i % 2 ? '#FFC93C' : '#BFF3FF';
c.beginPath();
c.moveTo(zx + Math.cos(a) * r0, zy + Math.sin(a) * r0);
c.lineTo(zx + Math.cos(a) * r1, zy + Math.sin(a) * r1);
c.stroke();
}
c.font = '700 30px ' + F_MONO; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = UI.hi;
const letters = 'spark';
for (let i = 0; i < letters.length; i++) {
c.save();
c.translate(zx - 80 + i * 40, zy - 62 + Math.abs(i - 2) * 14);
c.rotate((i - 2) * 0.35);
c.fillText(letters[i], 0, 0);
c.restore();
}
c.fillStyle = 'rgba(40, 44, 66, 0.55)';
for (let i = 0; i < 6; i++) { disc(c, dark.x0 + 40 + i * 22, 470 - i * 9, 12 + i * 3); c.fill(); }
c.restore();
}

function mount(root, api) {
const canvas = document.createElement('canvas');
canvas.tabIndex = 0;
canvas.setAttribute('aria-label', 'Word Rain game');
canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;';
root.appendChild(canvas);
const ctx = canvas.getContext('2d');

const input = document.createElement('input');
input.type = 'text';
input.value = SENTINEL;
input.tabIndex = -1;
input.setAttribute('autocapitalize', 'off');
input.setAttribute('autocorrect', 'off');
input.setAttribute('autocomplete', 'off');
input.setAttribute('spellcheck', 'false');
input.setAttribute('aria-label', 'Type the falling words');
input.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:40px;margin:0;padding:0;border:0;' +
'opacity:0;font-size:16px;background:transparent;color:transparent;caret-color:transparent;pointer-events:none;';
root.appendChild(input);

const touchUI = !!api.isTouch;
const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let raf = 0;
let last = performance.now();
let destroyed = false;
let dpr = window.devicePixelRatio || 1;
const viewCss = { s: 1, ox: 0, oy: 0 };
let state = 'title';
let paused = false;
let t = 0;   // game time (frozen while paused)
let ui = 0;  // UI time for blinking prompts
const sky = makeSky(Math.random);
const rain = makeRain(Math.random);
let city = makeCity(Math.random);
let words = [], particles = [], popups = [], bolts = [], bannerQ = [];
let banner = null, target = null;
let score = 0, shownScore = 0, level = 1, zapped = 0, combo = 0, bestCombo = 0, lives = DISTRICTS;
let keysGood = 0, keysTotal = 0, runTime = 0, spawnT = 0, slowT = 0, demoT = 0.3;
let shakeT = 0, shakeMag = 0, shakeX = 0, shakeY = 0, hitFlash = 0, whiteFlash = 0, frost = 0;
let overAt = 0, submitted = false, newBest = false, stats = null;
let bestVal = readBest();
let recent = [];
let lv0 = 1; // starting level (online matches may start higher)
let charW = 13.2;
let inLen = SENTINEL.length;
let composing = false;
const tagOpts = { cw: 13.2, locked: false, flash: 0, danger: 0, scale: 1, alpha: 1, t: 0, trail: true };

function readBest() {
const b = api.best();
return typeof b === 'number' && isFinite(b) ? b : null;
}

function resize() {
if (destroyed) return;
dpr = window.devicePixelRatio || 1;
const bw = Math.max(1, Math.round(root.clientWidth * dpr));
const bh = Math.max(1, Math.round(root.clientHeight * dpr));
if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
updateView();
}

function updateView() {
const cssW = canvas.width / dpr;
const cssH = canvas.height / dpr;
let top = 0;
let avail = cssH;
const vv = window.visualViewport;
if (vv && document.activeElement === input && Math.abs((vv.scale || 1) - 1) < 0.05) {
const r = canvas.getBoundingClientRect();
if (r.height > 0) {
const vt = Math.max(0, vv.offsetTop - r.top);
const vb = Math.min(r.height, vv.offsetTop + vv.height - r.top);
if (vb - vt > r.height * 0.3 && vb - vt < r.height - 1) {
const k = cssH / r.height;
top = vt * k;
avail = (vb - vt) * k;
}
}
}
const s = Math.min(cssW / W, avail / H) || 1;
viewCss.s = s;
viewCss.ox = (cssW - W * s) / 2;
viewCss.oy = top + (avail - H * s) / 2;
}

function toLogical(e) {
const r = canvas.getBoundingClientRect();
const k = r.width > 0 ? canvas.width / dpr / r.width : 1;
return {
x: ((e.clientX - r.left) * k - viewCss.ox) / viewCss.s,
y: ((e.clientY - r.top) * k - viewCss.oy) / viewCss.s,
};
}

function addParticle(p) {
if (particles.length >= MAX_PARTICLES) return;
if (p.vx === undefined) p.vx = 0;
if (p.vy === undefined) p.vy = 0;
if (p.g === undefined) p.g = 0;
particles.push(p);
}
function addPopup(x, y, text, color, size) {
if (popups.length >= MAX_POPUPS) popups.shift();
popups.push({ x: clamp(x, 80, W - 80), y: clamp(y, 84, H - 40), text: text, color: color, size: size, life: 1.1, max: 1.1 });
}
function addBolt(x0, y0, x1, y1, color, width, life) {
if (bolts.length >= MAX_BOLTS) bolts.shift();
const pts = boltPts(x0, y0, x1, y1, Math.random, width > 2 ? 5 : 4);
const branches = [];
if (width > 2) {
for (let i = 0; i < 2; i++) {
const a = pts[2 + Math.floor(Math.random() * (pts.length - 4))];
branches.push(boltPts(a.x, a.y, a.x + rand(-60, 60), a.y + rand(-50, 20), Math.random, 3));
}
}
bolts.push({ pts: pts, branches: branches, color: color, w: width, life: life, max: life, seed: rand(0, 6.283) });
}
function pushBanner(text, sub, color) {
const b = { text: text, sub: sub, color: color, life: 1.7, max: 1.7 };
if (!banner) banner = b;
else if (bannerQ.length < 3) bannerQ.push(b);
}
function kick(m) {
if (reduceMotion) return;
shakeMag = Math.max(m, shakeT > 0 ? shakeMag : 0);
shakeT = 0.35;
}
function rodFor(x) {
let best = null;
let bd = Infinity;
for (const d of city.districts) {
if (d.dead && state === 'playing') continue;
const dd = Math.abs(d.rodX - x);
if (dd < bd) { bd = dd; best = d; }
}
return best || city.districts[0];
}
function roofAt(x0, x1) {
let m = H;
for (const b of city.near) if (b.x < x1 && b.x + b.w > x0 && b.hit < m) m = b.hit;
return m === H ? 500 : m;
}

function params(l) {
const lv = l || level;
return {
speed: Math.min(122, 30 + (lv - 1) * 8),
max: Math.min(7, 1 + Math.ceil(lv * 0.75)),
interval: Math.max(0.72, 2.5 - (lv - 1) * 0.2),
minLen: Math.min(6, 3 + Math.floor((lv - 1) / 3)),
maxLen: Math.min(10, 4 + lv),
};
}

function chooseKind() {
if (zapped < 4) return 'normal';
let hasGold = false;
let hasIce = false;
for (const w of words) {
if (w.kind === 'gold') hasGold = true;
else if (w.kind === 'ice') hasIce = true;
}
const r = Math.random();
if (!hasGold && r < 0.055) return 'gold';
if (!hasIce && slowT <= 0 && r > 0.94) return 'ice';
return 'normal';
}

function pickWord(p, kind) {
const used = {};
for (const w of words) used[w.text[0]] = true;
let lo = p.minLen;
let hi = p.maxLen;
if (kind === 'gold') { lo = Math.max(lo, 5); hi = Math.max(hi, 7); }
for (let tries = 0; tries < 40; tries++) {
const b = BUCKETS[randInt(lo, hi)];
if (!b || !b.length) continue;
const word = b[Math.floor(Math.random() * b.length)];
if (used[word[0]] || recent.indexOf(word) >= 0) continue;
return word;
}
for (let len = lo; len <= hi; len++) {
const b = BUCKETS[len] || [];
const off = Math.floor(Math.random() * b.length);
for (let i = 0; i < b.length; i++) {
const word = b[(i + off) % b.length];
if (!used[word[0]]) return word;
}
}
return null;
}

function spawnWord(p, e) {
if (!e && NS.live) e = streamAt(NS.stream, NS.k++);
const kind = e ? e.kd : chooseKind();
const text = e ? e.t : pickWord(p, kind);
if (!text) return false;
recent.push(text);
if (recent.length > 24) recent.shift();
const tw = tagWidth(text.length, charW);
const half = tw / 2 + 16;
const fw = e ? SIDE_X : W;
let bestX = W / 2;
let bestScore = -Infinity;
for (let i = 0; i < 14; i++) { // pick a column clear of the words near the top
const x = rand(half, fw - half);
let sc = 1000;
for (const o of words) {
const gap = Math.abs(o.x - x) - (tagWidth(o.text.length, charW) + tw) / 2;
sc = Math.min(sc, gap + (o.y < SPAWN_Y + 120 ? 0 : 60));
}
if (sc > bestScore) { bestScore = sc; bestX = x; }
if (sc > 30) break;
}
const lenF = 1.12 - text.length * 0.025; // long words fall a little slower
words.push({
text: text, kind: kind, x: bestX, y: SPAWN_Y,
vy: p.speed * lenF * rand(0.92, 1.08) * (kind === 'gold' ? 1.08 : kind === 'storm' ? 1.15 : 1),
typed: 0, clean: true, flash: 0, shake: 0, age: 0, ph: rand(0, 6.283),
roof: roofAt(bestX - tw / 2 - 4, bestX + tw / 2 + 4),
});
if (e && e.from) words[words.length - 1].from = e.from;
return true;
}

function spawnDemo() {
const used = {};
for (const w of words) used[w.text[0]] = true;
let text = null;
for (let i = 0; i < 20 && !text; i++) {
const b = BUCKETS[randInt(3, 6)];
const cand = b[Math.floor(Math.random() * b.length)];
if (!used[cand[0]]) text = cand;
}
if (!text) return;
const tw = tagWidth(text.length, charW);
const x = Math.random() < 0.5 ? rand(tw / 2 + 14, 196 - tw / 2) : rand(764 + tw / 2, W - tw / 2 - 14);
const r = Math.random();
words.push({
text: text, kind: r < 0.15 ? 'gold' : r < 0.3 ? 'ice' : 'normal', x: x, y: 6, vy: rand(34, 48),
typed: 0, clean: true, flash: 0, shake: 0, age: 0, ph: rand(0, 6.283),
roof: roofAt(x - tw / 2, x + tw / 2), zapY: rand(170, 390), autoT: 0,
});
}

function removeWord(w) {
const i = words.indexOf(w);
if (i >= 0) words.splice(i, 1);
if (target === w) target = null;
}

function startRun() {
state = 'playing';
lv0 = 1;
resetRun(W);
submitted = false;
last = performance.now();
resetInput();
pushBanner('LEVEL 1', 'Type the falling words', UI.hi);
api.tone(440, 0.08, { type: 'triangle', vol: 0.09 });
api.tone(660, 0.1, { type: 'triangle', vol: 0.09, delay: 0.08 });
}

function resetRun(fw) {
paused = false;
city = makeCity(Math.random, fw);
words = []; particles = []; popups = []; bolts = []; bannerQ = [];
banner = null; target = null;
score = 0; shownScore = 0; level = lv0; zapped = 0; combo = 0; bestCombo = 0; lives = DISTRICTS;
keysGood = 0; keysTotal = 0; runTime = 0; spawnT = 0.9; slowT = 0; frost = 0;
shakeT = 0; shakeMag = 0; shakeX = 0; shakeY = 0; hitFlash = 0; whiteFlash = 0;
newBest = false; stats = null; recent = [];
}

function fizzle() { // remaining words fizzle out
for (const w of words) {
const k = KINDS[w.kind] || KINDS.normal;
for (let i = 0; i < 8; i++) {
addParticle({ type: 'chunk', x: w.x + rand(-30, 30), y: w.y, vx: rand(-90, 90), vy: rand(-120, 10), g: 380, life: rand(0.4, 0.8), max: 0.8, color: k.rim, size: rand(2, 4) });
}
}
words = [];
}

function endRun() {
if (state !== 'playing') return;
state = 'over';
paused = false;
target = null;
overAt = performance.now();
fizzle();
slowT = 0;
bannerQ = [];
banner = null;
const mins = runTime / 60;
stats = {
wpm: mins > 0.05 ? Math.round(keysGood / 5 / mins) : 0,
acc: keysTotal > 0 ? Math.round((keysGood / keysTotal) * 100) : 0,
};
if (!submitted) {
submitted = true;
newBest = api.submit(score) === true;
bestVal = readBest();
}
api.noise(0.8, { vol: 0.2, filter: 300 });
[392, 330, 262, 196].forEach(function (f, i) {
api.tone(f, 0.22, { type: 'triangle', vol: 0.11, delay: 0.1 + i * 0.16 });
});
if (document.activeElement === input) input.blur(); // let the soft keyboard drop
}

function setPaused(v, quiet) {
if (state !== 'playing' || paused === v) return;
paused = v;
last = performance.now();
if (!quiet) api.tone(v ? 330 : 440, 0.06, { type: 'sine', vol: 0.06 });
}

function onLetter(ch) {
if (state !== 'playing' || paused || NS.menu) return;
keysTotal++;
if (!target) {
let found = null;
for (const w of words) if (w.text[0] === ch && (!found || w.y > found.y)) found = w;
if (!found) {
breakCombo();
hitFlash = Math.max(hitFlash, 0.18);
addPopup(W / 2, 440, ch + '?', UI.danger, 22);
api.tone(150, 0.08, { type: 'square', vol: 0.04, slide: 110 });
return;
}
target = found;
found.typed = 1;
found.clean = true;
keysGood++;
letterHit(found);
api.tone(620, 0.05, { type: 'triangle', vol: 0.08, slide: 760 });
return;
}
const w = target;
if (w.text[w.typed] === ch) {
w.typed++;
keysGood++;
letterHit(w);
if (w.typed >= w.text.length) completeWord(w);
else api.tone(560 + Math.min(w.typed, 10) * 36, 0.04, { type: 'triangle', vol: 0.07 });
} else { // wrong letter: flash red, break combo, keep the lock
w.flash = 0.3;
w.shake = 0.3;
w.clean = false;
breakCombo();
api.tone(170, 0.1, { type: 'square', vol: 0.06, slide: 110 });
}
}

function releaseLock() {
if (!target) return;
target.typed = 0;
target = null;
api.tone(300, 0.06, { type: 'triangle', vol: 0.05, slide: 190 });
}

function breakCombo() {
if (combo >= 5) addPopup(W / 2, 110, 'Combo lost', UI.danger, 18);
combo = 0;
}

function letterHit(w) {
const d = rodFor(w.x);
const lx = w.x - (w.text.length * charW) / 2 + charW * (w.typed - 0.5);
addBolt(d.rodX, d.rodY, lx, w.y + TAG_H / 2, '#9FE8FF', 1, 0.1);
d.glow = Math.max(d.glow, 0.08);
for (let i = 0; i < 4; i++) {
addParticle({ type: 'spark', x: lx, y: w.y + 6, vx: rand(-120, 120), vy: rand(-160, 20), g: 400, life: 0.3, max: 0.3, color: UI.hi, size: 1.6 });
}
}

function completeWord(w) {
if (w.clean) {
combo++;
if (combo > bestCombo) bestCombo = combo;
}
const mult = combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;
const pts = Math.round(w.text.length * level * mult);
score += pts;
zapped++;
addPopup(w.x, w.y - 30, '+' + pts, mult > 1 ? UI.hi : '#FFFFFF', mult > 1 ? 26 : 22);
zapWord(w, true);
api.noise(0.16, { vol: 0.16, filter: 3000 });
api.tone(1046, 0.14, { type: 'sawtooth', vol: 0.045, slide: 260 });
if (w.clean && combo >= 5 && combo % 5 === 0) {
addPopup(w.x, w.y - 58, 'Combo ' + combo + '!  x' + mult, UI.hi, 20);
api.tone(880, 0.08, { type: 'sine', vol: 0.1, delay: 0.05 });
api.tone(1320, 0.14, { type: 'sine', vol: 0.1, delay: 0.13 });
}
if (w.kind === 'gold') skyClear();
else if (w.kind === 'ice') startSlow();
checkLevel();
kick(3);
if (NS.live) netWord(w);
}

function zapWord(w, big) {
removeWord(w);
const k = KINDS[w.kind] || KINDS.normal;
const d = rodFor(w.x);
addBolt(d.rodX, d.rodY, w.x, w.y + TAG_H / 2, big ? '#BFF3FF' : k.glow, big ? 2.6 : 1.8, big ? 0.32 : 0.26);
d.glow = 0.35;
const n = w.text.length;
const x0 = w.x - (n * charW) / 2;
for (let i = 0; i < n; i++) { // the word shatters into its letters
addParticle({
type: 'glyph', ch: w.text[i], x: x0 + charW * (i + 0.5), y: w.y,
vx: (i - (n - 1) / 2) * 26 + rand(-40, 40), vy: rand(-230, -110), g: 560,
rot: 0, spin: rand(-7, 7), life: 0.9, max: 0.9, color: i < w.typed ? UI.hi : '#FFFFFF',
});
}
for (let i = 0; i < 16; i++) {
const a = rand(0, Math.PI * 2);
const s = rand(80, 320);
addParticle({ type: 'spark', x: w.x, y: w.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 300, life: rand(0.25, 0.6), max: 0.6, color: k.rim, size: 2 });
}
addParticle({ type: 'ring', x: w.x, y: w.y, r: 12, grow: 240, life: 0.4, max: 0.4, color: k.glow, size: 4 });
}

function skyClear() {
const rest = words.slice();
let gained = 0;
for (const o of rest) {
gained += o.text.length * level;
zapped++;
zapWord(o, false);
}
score += gained;
pushBanner('SKY CLEAR!', gained ? '+' + gained + ' storm bonus' : 'Golden lightning', UI.hi);
whiteFlash = 0.45;
kick(8);
api.noise(0.5, { vol: 0.26, filter: 1600 });
[784, 988, 1175, 1568].forEach(function (f, i) {
api.tone(f, 0.18, { type: 'triangle', vol: 0.08, delay: 0.05 + i * 0.06 });
});
}

function startSlow() {
slowT = SLOW_TIME;
pushBanner('SLOW-MO', 'The rain drifts for 5 seconds', '#8DEBFF');
api.tone(1500, 0.4, { type: 'sine', vol: 0.07, slide: 600 });
api.tone(2200, 0.25, { type: 'sine', vol: 0.04, slide: 1100, delay: 0.1 });
}

function checkLevel() {
const nl = lv0 + Math.floor(zapped / 10);
if (nl <= level) return;
level = nl;
const tip = level === 2 ? 'More words fall at once' : level === 3 ? 'Longer words incoming' : 'Faster rain, longer words';
pushBanner('LEVEL ' + level, tip, UI.hi);
[523, 659, 784, 1046].forEach(function (f, i) {
api.tone(f, 0.12, { type: 'triangle', vol: 0.09, delay: 0.12 + i * 0.08 });
});
}

function landWord(w) {
removeWord(w);
breakCombo();
const d = knockDistrict(w.x);
lives = 0;
for (const dd of city.districts) if (!dd.dead) lives++;
const k = KINDS[w.kind] || KINDS.normal;
const by = w.y + TAG_H / 2;
for (let i = 0; i < 22; i++) {
addParticle({ type: 'chunk', x: w.x + rand(-30, 30), y: by - rand(0, 20), vx: rand(-260, 260), vy: rand(-280, -40), g: 700, life: rand(0.4, 0.8), max: 0.8, color: k.rim, size: rand(2, 4.5) });
}
for (let i = 0; i < 12; i++) {
addParticle({ type: 'spark', x: rand(d.x0 + 10, d.x1 - 10), y: rand(500, 580), vx: rand(-140, 140), vy: rand(-200, -40), g: 500, life: rand(0.3, 0.7), max: 0.7, color: '#FFD27A', size: 2 });
}
for (let i = 0; i < 4; i++) {
addParticle({ type: 'smoke', x: w.x + rand(-30, 30), y: by, vx: rand(-10, 10), vy: rand(-34, -20), r: rand(8, 14), grow: 14, life: 1.8, max: 1.8, color: '#262b44' });
}
addParticle({ type: 'ring', x: w.x, y: by, r: 10, grow: 300, life: 0.45, max: 0.45, color: UI.danger, size: 5 });
addPopup(w.x, by - 44, 'BLACKOUT', UI.danger, 20);
hitFlash = 0.7;
kick(12);
api.noise(0.5, { vol: 0.3, filter: 420 });
api.tone(130, 0.45, { type: 'sine', vol: 0.2, slide: 45 });
if (NS.live) NS.qn = 0; // a landing ends the storm streak
if (lives <= 0) { if (NS.live) netFell(); else endRun(); }
}

function knockDistrict(x) {
const ds = city.districts;
let i = clamp(Math.floor(x / city.dw), 0, DISTRICTS - 1);
if (ds[i].dead) {
let best = -1;
let bd = 99;
for (let j = 0; j < ds.length; j++) {
if (!ds[j].dead && Math.abs(j - i) < bd) { bd = Math.abs(j - i); best = j; }
}
if (best < 0) return ds[i];
i = best;
}
ds[i].dead = true;
ds[i].kill = 0.8;
return ds[i];
}

function update(dt) {
t += dt;
const ts = state === 'playing' && slowT > 0 ? SLOW_FACTOR : 1;
updateAmbient(dt, ts);
if (state === 'playing') updatePlay(dt, ts);
else if (state === 'title' || (state === 'net' && NS.demo)) updateDemo(dt);
}

function updatePlay(dt, ts) {
runTime += dt;
if (slowT > 0) slowT = Math.max(0, slowT - dt);
const p = params();
if (words.length === 0 && spawnT > 0.5) spawnT = 0.5;
spawnT -= dt * ts;
if (spawnT <= 0 && words.length - (NS.live ? nStorm(words) : 0) < p.max) spawnT = spawnWord(p) ? p.interval * rand(0.85, 1.15) : 0.25;
for (let i = words.length - 1; i >= 0; i--) {
const w = words[i];
w.age += dt;
if (w.flash > 0) w.flash = Math.max(0, w.flash - dt);
if (w.shake > 0) w.shake = Math.max(0, w.shake - dt);
w.y += w.vy * ts * dt; // at most ~4 px per step, so no tunnelling past the roofline
if (w.y + TAG_H / 2 >= w.roof) {
landWord(w);
if (state !== 'playing') return;
}
}
}

function updateDemo(dt) {
demoT -= dt;
if (demoT <= 0) {
demoT = rand(1.1, 1.9);
if (words.length < 4) spawnDemo();
}
for (let i = words.length - 1; i >= 0; i--) {
const w = words[i];
w.age += dt;
w.y += w.vy * dt;
if (w.y >= w.zapY) {
w.autoT -= dt;
if (w.autoT <= 0) {
w.autoT = 0.12;
w.typed++;
if (w.typed >= w.text.length) zapWord(w, false);
else letterHit(w);
}
}
if (w.y + TAG_H / 2 >= w.roof) removeWord(w);
}
}

function updateAmbient(dt, ts) {
for (const r of rain) {
r.y += r.spd * ts * dt;
r.x -= r.spd * RAIN_SLANT * ts * dt;
if (r.y > H + 30 || r.x < -40) { r.y = rand(-40, -5); r.x = rand(0, W + 140); }
}
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];
p.life -= dt;
if (p.life <= 0) { // swap-remove
particles[i] = particles[particles.length - 1];
particles.pop();
continue;
}
p.vy += p.g * dt;
p.x += p.vx * dt;
p.y += p.vy * dt;
if (p.spin) p.rot += p.spin * dt;
if (p.grow) p.r += p.grow * dt;
}
for (let i = bolts.length - 1; i >= 0; i--) {
bolts[i].life -= dt;
if (bolts[i].life <= 0) bolts.splice(i, 1);
}
for (let i = popups.length - 1; i >= 0; i--) {
const p = popups[i];
p.life -= dt;
p.y -= 34 * dt;
if (p.life <= 0) popups.splice(i, 1);
}
for (const d of city.districts) {
if (d.glow > 0) d.glow = Math.max(0, d.glow - dt);
if (!d.dead) continue;
if (d.kill > 0) { // lights flicker out
d.kill = Math.max(0, d.kill - dt);
d.lit = d.kill > 0 ? (Math.random() < 0.45 ? 0.12 : 1) * (d.kill / 0.8) : 0;
} else {
d.lit = 0;
}
d.smokeT -= dt;
if (d.smokeT <= 0) {
d.smokeT = rand(0.35, 0.7);
addParticle({ type: 'smoke', x: rand(d.x0 + 20, d.x1 - 20), y: rand(478, 505), vx: rand(-8, 8), vy: rand(-30, -18), r: rand(6, 10), grow: 12, life: 2.2, max: 2.2, color: '#262b44' });
}
}
if (shakeT > 0) {
shakeT = Math.max(0, shakeT - dt);
const m = shakeMag * (shakeT / 0.35);
shakeX = rand(-m, m);
shakeY = rand(-m, m);
} else {
shakeX = 0; shakeY = 0; shakeMag = 0;
}
if (hitFlash > 0) hitFlash = Math.max(0, hitFlash - dt * 1.6);
if (whiteFlash > 0) whiteFlash = Math.max(0, whiteFlash - dt * 1.8);
frost += ((state === 'playing' && slowT > 0 ? 1 : 0) - frost) * Math.min(1, dt * 5);
if (banner) {
banner.life -= dt;
if (banner.life <= 0) banner = null;
}
if (!banner && bannerQ.length) banner = bannerQ.shift();
shownScore += (score - shownScore) * Math.min(1, dt * 9);
if (Math.abs(score - shownScore) < 0.5) shownScore = score;
}

function render() {
HB.n = 0; // online tap targets are registered while drawing
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.fillStyle = BG; // letterbox bars
ctx.fillRect(0, 0, canvas.width, canvas.height);
updateView();
const s = viewCss.s * dpr;
ctx.setTransform(s, 0, 0, s, viewCss.ox * dpr, viewCss.oy * dpr);
ctx.save();
ctx.beginPath();
ctx.rect(0, 0, W, H);
ctx.clip();
ctx.font = '700 ' + WORD_PX + 'px ' + F_MONO;
charW = ctx.measureText('m').width || 13.2;

ctx.save();
ctx.translate(shakeX, shakeY);
drawSky(ctx, sky, t);
drawFarCity(ctx, city);
drawRain(ctx, rain);
for (const w of words) if (w !== target) drawWord(w);
if (target) drawWord(target);
for (const b of bolts) drawBolt(ctx, b, t);
drawNearCity(ctx, city, t);
drawParticles();
drawPopups();
ctx.restore();

drawScreenFx();
if (state === 'playing') {
drawHUD();
if (NS.live) netHud();
drawHint();
drawBanner();
if (paused) drawPaused();
if (NS.menu) netDrawMenu();
} else if (state === 'title') {
drawTitle();
} else if (state === 'net') {
netDraw();
} else {
drawOver();
}
ctx.restore();
}

function drawWord(w) {
let x = w.x + Math.sin(t * 1.3 + w.ph) * 3;
if (w.shake > 0) x += Math.sin(w.shake * 60) * 6 * (w.shake / 0.3);
const ap = Math.min(1, w.age / 0.3);
const gap = w.roof - (w.y + TAG_H / 2);
tagOpts.cw = charW;
tagOpts.locked = w === target;
tagOpts.flash = w.flash / 0.3;
tagOpts.danger = state === 'playing' ? clamp(1 - gap / 110, 0, 1) : 0;
tagOpts.scale = 0.7 + 0.3 * easeOutBack(ap);
tagOpts.alpha = ap;
tagOpts.t = t;
tagOpts.trail = true;
drawTag(ctx, x, w.y, w.text, w.typed, w.kind, tagOpts);
if (w.from) { // online storm word: who sent it
ctx.globalAlpha = ap;
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
txt(w.from, x, w.y + TAG_H / 2 + 11, FN_B11, KINDS.storm.rim);
ctx.globalAlpha = 1;
}
}

function drawParticles() {
ctx.lineCap = 'round';
ctx.font = '700 ' + WORD_PX + 'px ' + F_MONO;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
for (const p of particles) {
const a = clamp(p.life / p.max, 0, 1);
ctx.globalAlpha = a;
if (p.type === 'spark') { // short streak along its velocity
ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke();
} else if (p.type === 'glyph') { // a letter of a zapped word
ctx.save();
ctx.translate(p.x, p.y); ctx.rotate(p.rot);
ctx.fillStyle = p.color; ctx.fillText(p.ch, 0, 0);
ctx.restore();
} else if (p.type === 'ring') {
ctx.strokeStyle = p.color; ctx.lineWidth = p.size * a + 0.5;
disc(ctx, p.x, p.y, p.r); ctx.stroke();
} else if (p.type === 'smoke') {
ctx.globalAlpha = a * 0.4; ctx.fillStyle = p.color;
disc(ctx, p.x, p.y, p.r); ctx.fill();
} else { // chunk
ctx.fillStyle = p.color;
ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
}
}
ctx.globalAlpha = 1;
}

function drawPopups() {
ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
for (const p of popups) {
const sc = 1 + 0.35 * Math.max(0, 1 - (p.max - p.life) / 0.18); // pop in
ctx.globalAlpha = clamp(p.life / 0.35, 0, 1);
ctx.font = '800 ' + Math.round(p.size * sc) + 'px ' + F_BODY;
ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(5, 8, 20, 0.75)';
ctx.strokeText(p.text, p.x, p.y);
ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
}
ctx.globalAlpha = 1;
}

function vignette(rgb, alpha, inner) {
const g = ctx.createRadialGradient(W / 2, H / 2, inner, W / 2, H / 2, 580);
g.addColorStop(0, 'rgba(' + rgb + ', 0)');
g.addColorStop(1, 'rgba(' + rgb + ', ' + alpha.toFixed(3) + ')');
ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function drawScreenFx() {
if (frost > 0.01) vignette('141, 235, 255', 0.34 * frost, 200);     // ice: frosty edges
if (hitFlash > 0.01) vignette('255, 93, 93', 0.5 * hitFlash, 220);  // landing / miss: red edges
if (whiteFlash > 0.01) { // gold: lightning flash
ctx.fillStyle = 'rgba(255, 244, 210, ' + (0.5 * whiteFlash).toFixed(3) + ')';
ctx.fillRect(0, 0, W, H);
}
}

function txt(s, x, y, font, color) { ctx.font = font; ctx.fillStyle = color; ctx.fillText(s, x, y); }
function fitTxt(s, x, y, maxW, weight, size, family, color) {
setFit(ctx, s, maxW, weight, size, family); ctx.fillStyle = color; ctx.fillText(s, x, y);
}

function drawLamp(x, y, d) {
const L = d.dead ? d.lit : 1;
const on = L > 0.05;
if (on) {
const g = ctx.createRadialGradient(x, y - 3, 2, x, y - 3, 20);
g.addColorStop(0, 'rgba(255, 210, 120, ' + (0.55 * L).toFixed(3) + ')');
g.addColorStop(1, 'rgba(255, 210, 120, 0)');
ctx.fillStyle = g; ctx.fillRect(x - 20, y - 23, 40, 40);
}
disc(ctx, x, y - 3, 8);
ctx.fillStyle = on ? 'rgba(255, 224, 138, ' + (0.35 + 0.65 * L).toFixed(3) + ')' : '#262c44';
ctx.fill();
ctx.lineWidth = 1.5; ctx.strokeStyle = on ? '#FFF1C4' : '#3d4566'; ctx.stroke();
ctx.fillStyle = on ? '#9aa3c4' : '#3d4566';
ctx.fillRect(x - 4, y + 6, 8, 3);
ctx.fillRect(x - 3, y + 10, 6, 3);
if (d.dead && d.kill <= 0) { // cracked bulb
ctx.strokeStyle = UI.danger; ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(x - 4, y - 8); ctx.lineTo(x - 1, y - 4); ctx.lineTo(x - 3, y - 1); ctx.lineTo(x + 2, y + 1);
ctx.stroke();
}
}

function drawHUD() {
ctx.fillStyle = vGrad(ctx, 0, 70, [[0, 'rgba(3, 6, 16, 0.86)'], [1, 'rgba(3, 6, 16, 0)']]);
ctx.fillRect(0, 0, W, 70);
ctx.textAlign = 'left';
ctx.textBaseline = 'alphabetic';
txt('SCORE', 22, 21, '700 12px ' + F_BODY, UI.body);
txt('LEVEL', 200, 21, '700 12px ' + F_BODY, UI.body);
txt(String(Math.round(shownScore)), 22, 49, '700 26px ' + F_MONO, UI.head);
const lvTxt = String(level);
txt(lvTxt, 200, 49, '700 26px ' + F_MONO, UI.head);
const lx = 200 + ctx.measureText(lvTxt).width + 10;
const prog = zapped % 10;
for (let i = 0; i < 10; i++) { // progress to the next level
ctx.fillStyle = i < prog ? UI.hi : 'rgba(255, 255, 255, 0.16)';
ctx.fillRect(lx + i * 8, 38, 5, 11);
}
ctx.textAlign = 'center';
if (combo >= 2) {
const hot = combo >= 5;
txt('COMBO', W / 2, 21, '700 12px ' + F_BODY, hot ? UI.hi : UI.body);
txt(combo + (hot ? (combo >= 10 ? '  x2' : '  x1.5') : ''), W / 2, 48, '700 24px ' + F_MONO, hot ? UI.hi : UI.head);
}
if (slowT > 0) { // slow-mo timer
const bw = 160;
ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
ctx.fillRect(W / 2 - bw / 2, 57, bw, 5);
ctx.fillStyle = '#8DEBFF';
ctx.fillRect(W / 2 - bw / 2, 57, bw * (slowT / SLOW_TIME), 5);
drawFlake(ctx, W / 2 - bw / 2 - 12, 59.5, 6, t);
}
for (let i = 0; i < DISTRICTS; i++) drawLamp(694 + i * 38, 32, city.districts[i]);
disc(ctx, PAUSE_BTN.x, PAUSE_BTN.y, PAUSE_BTN.r);
ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; ctx.fill();
ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'; ctx.stroke();
ctx.fillStyle = UI.head;
if (NS.live) { // online: a menu button (matches don't pause)
for (let i = -1; i <= 1; i++) ctx.fillRect(PAUSE_BTN.x - 7, PAUSE_BTN.y - 1.5 + i * 5, 14, 3);
return;
}
ctx.fillRect(PAUSE_BTN.x - 6, PAUSE_BTN.y - 7, 4, 14);
ctx.fillRect(PAUSE_BTN.x + 2, PAUSE_BTN.y - 7, 4, 14);
}

function drawHint() {
if (zapped > 0 || runTime > 9 || paused) return;
ctx.save();
ctx.globalAlpha = clamp(Math.min(1, runTime / 0.6, 9 - runTime), 0, 1) * (0.75 + 0.25 * Math.sin(ui * 4));
ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'; ctx.shadowBlur = 8;
const msg = touchUI ? 'Tap to show the keyboard, then type a word' : 'Type a word’s first letter to lock on';
fitTxt(msg, W / 2, 446, 600, '700', 18, F_BODY, UI.hi);
ctx.restore();
}

function drawBanner() {
if (!banner || paused) return;
const b = banner;
const el = b.max - b.life;
const yy = 232 - 16 * (1 - easeOutCubic(Math.min(1, el / 0.35)));
ctx.save();
ctx.globalAlpha = clamp(Math.min(el / 0.2, b.life / 0.45), 0, 1);
ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; ctx.shadowBlur = 14;
fitTxt(b.text, W / 2, yy, 700, 'normal', 46, F_DISPLAY, b.color);
if (b.sub) fitTxt(b.sub, W / 2, yy + 32, 600, '600', 18, F_BODY, UI.body);
ctx.restore();
}

function blinkOn() { return ui % 1.1 < 0.75; }

function drawTitle() {
drawPanel(ctx, 210, 92, 540, 416);
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
ctx.save();
ctx.shadowColor = '#38B6FF'; ctx.shadowBlur = 22;
fitTxt('WORD RAIN', W / 2, 174, 470, 'normal', 60, F_DISPLAY, vGrad(ctx, 122, 176, [[0, '#E8FBFF'], [1, '#5CC8FF']]));
ctx.restore();
fitTxt('Type the falling words to zap them with lightning.', W / 2, 222, 480, '500', 18, F_BODY, UI.body);
fitTxt('Every word that lands blacks out a block of the city.', W / 2, 250, 480, '500', 18, F_BODY, UI.body);
const o = { cw: charW, locked: false, flash: 0, danger: 0, scale: 0.8, alpha: 1, t: ui, trail: false };
drawTag(ctx, 318, 300, 'gold', 0, 'gold', o);
drawTag(ctx, 528, 300, 'ice', 0, 'ice', o);
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
fitTxt('clears the sky', 362, 301, 120, '600', 15, F_BODY, UI.body);
fitTxt('slows the rain', 566, 301, 120, '600', 15, F_BODY, UI.body);
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
if (bestVal !== null) txt('Best: ' + bestVal, W / 2, 358, '600 18px ' + F_MONO, UI.body);
if (blinkOn()) txt(touchUI ? 'Tap to start' : 'Press Space to start', W / 2, 414, '800 24px ' + F_BODY, UI.hi);
const hint = touchUI ? 'Tap opens the keyboard  ·  II button pauses' : 'Backspace drops your target  ·  Esc pauses';
fitTxt(hint, W / 2, 466, 480, '500', 14, F_BODY, 'rgba(201, 211, 227, 0.75)');
if (netHas()) netPillDraw();
}

function drawOver() {
ctx.fillStyle = UI.scrim;
ctx.fillRect(0, 0, W, H);
drawPanel(ctx, 200, 84, 560, 432);
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
fitTxt('LIGHTS OUT', W / 2, 148, 500, 'normal', 44, F_DISPLAY, UI.head);
txt('Score', W / 2, 186, '600 16px ' + F_BODY, UI.body);
fitTxt(String(score), W / 2, 240, 480, '700', 54, F_MONO, UI.hi);
if (newBest) txt('New best!', W / 2, 276, '800 20px ' + F_BODY, UI.ok);
else if (bestVal !== null) txt('Best: ' + bestVal, W / 2, 276, '600 16px ' + F_MONO, UI.body);
roundRectPath(ctx, 240, 298, 480, 82, 12);
ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
ctx.fill();
const st = stats || { wpm: 0, acc: 0 };
const cols = [[String(zapped), 'Words zapped'], [String(st.wpm), 'WPM'], [st.acc + '%', 'Accuracy']];
for (let i = 0; i < 3; i++) {
const cx = 320 + i * 160;
fitTxt(cols[i][0], cx, 340, 140, '700', 30, F_MONO, UI.head);
txt(cols[i][1], cx, 364, '600 14px ' + F_BODY, UI.body);
}
fitTxt('Reached level ' + level + '  ·  Best combo ' + bestCombo, W / 2, 412, 480, '500', 15, F_BODY, UI.body);
if (performance.now() - overAt >= 600 && blinkOn()) {
txt(touchUI ? 'Tap to play again' : 'Press Space to play again', W / 2, 470, '800 22px ' + F_BODY, UI.hi);
}
if (netHas()) netPillDraw();
}

function drawPaused() {
ctx.fillStyle = UI.scrim;
ctx.fillRect(0, 0, W, H);
drawPanel(ctx, 280, 206, 400, 188);
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
fitTxt('Paused', W / 2, 270, 340, 'normal', 40, F_DISPLAY, UI.head);
txt(touchUI ? 'Tap to resume' : 'Press Esc or click to resume', W / 2, 318, '700 18px ' + F_BODY, UI.hi);
fitTxt('Level ' + level + '  ·  Score ' + score, W / 2, 356, 340, '500', 15, F_BODY, UI.body);
}

function isEditable(el) {
if (!el || !el.tagName) return false;
const tg = el.tagName;
return tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || !!el.isContentEditable;
}

function onKeyDown(e) {
const own = e.target === input; // our hidden field is the one exempt INPUT
if (!own && isEditable(e.target)) return;
const k = e.key;
const isSpace = k === ' ' || k === 'Spacebar';
if (state === 'net') { netKey(e, k, isSpace); return; }
if (state !== 'playing') {
if ((k === 'o' || k === 'O') && netHas()) {
e.preventDefault();
if (!e.repeat && (state === 'title' || performance.now() - overAt >= 600)) netPill();
return;
}
if (isSpace || k === 'Enter') {
e.preventDefault();
if (e.repeat) return;
if (state === 'over' && performance.now() - overAt < 600) return;
startRun();
}
return;
}
if (k === 'Escape' || k === 'Esc') {
e.preventDefault();
if (!e.repeat) { if (NS.live) netMenu(!NS.menu); else setPaused(!paused); } // online never pauses
return;
}
if (NS.menu) { netMenuKey(e, k, isSpace); return; }
if (isSpace) { // never starts anything mid-play; just keep the page from scrolling
e.preventDefault();
return;
}
if (paused) return;
if (k === 'Backspace') {
e.preventDefault();
releaseLock();
return;
}
if (e.ctrlKey || e.metaKey || e.altKey) return;
if (k && k.length === 1 && ((k >= 'a' && k <= 'z') || (k >= 'A' && k <= 'Z'))) {
if (own) return; // the hidden input's 'input' event delivers this letter
e.preventDefault();
if (e.repeat) return;
onLetter(k.toLowerCase());
}
}

function resetInput() {
if (input.value !== SENTINEL) input.value = SENTINEL;
inLen = SENTINEL.length;
try {
if (document.activeElement === input) input.setSelectionRange(inLen, inLen);
} catch (err) { /* some browsers refuse selection here; harmless */ }
}

function onInput(e) {
const v = input.value;
const live = state === 'playing' && !paused;
const del = e && typeof e.inputType === 'string' && e.inputType.indexOf('delete') === 0;
if (v.length < inLen || del) {
if (live) releaseLock();
} else if (v.length > inLen) {
const added = v.slice(inLen);
for (let i = 0; i < added.length; i++) {
const ch = added[i].toLowerCase();
if (live && ch >= 'a' && ch <= 'z') onLetter(ch);
}
}
inLen = v.length;
if (!composing) resetInput(); // during IME composition, wait for compositionend
}
function onCompStart() { composing = true; }
function onCompEnd() { composing = false; resetInput(); }

function focusInput() {
try {
if (document.activeElement === input) input.blur(); // re-show a dismissed keyboard
input.focus({ preventScroll: true });
resetInput();
} catch (err) { /* focus can fail on a detached node */ }
}

function onPointerDown(e) {
const touchLike = e.pointerType === 'touch' || e.pointerType === 'pen';
const pill = state !== 'playing' && state !== 'net' && netPillHit(e);
NS.noKb = pill || (state === 'net' && NS.scr !== 'count'); // online menus don't raise the soft keyboard
if (touchLike) {
e.preventDefault(); // stops the compat mousedown from moving focus to the canvas
if (!NS.noKb) focusInput();
} else {
if (e.button !== 0) return;
canvas.focus({ preventScroll: true });
}
if (state === 'title') { if (pill) netPill(); else startRun(); return; }
if (state === 'net') { netTap(toLogical(e)); return; }
if (state === 'over') {
if (performance.now() - overAt >= 600) { if (pill) netPill(); else startRun(); }
return;
}
if (NS.live) { netMatchTap(toLogical(e)); return; }
if (paused) { setPaused(false); return; }
const p = toLogical(e);
if (Math.hypot(p.x - PAUSE_BTN.x, p.y - PAUSE_BTN.y) <= PAUSE_BTN.r + 8) setPaused(true);
}

function onPointerUp(e) {
if ((e.pointerType === 'touch' || e.pointerType === 'pen') && document.activeElement !== input && !NS.noKb) {
try { input.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
}
}

function onBlur() { if (!NS.live) setPaused(true, true); }
function onVisibility() { if (document.hidden && !NS.live) setPaused(true, true); }

const NS = {
s: null, tok: 0, opening: false, iv: 0, host: false, me: 0, my: 0, hum: 1,
scr: '', f: 0, menu: false, mf: 0, demo: false, noKb: false, note: '', dirty: false,
rec: null, recTxt: '', md: 0, lv: 1, nb: 0, cfgD: false, cv: ['', '', ''], cfgTxt: '', plTxt: '',
live: false, P: [], stream: null, k: 0, go: 0, end: 0, cdN: 0, done: false, doneT: 0, stopped: false, stopT: 0, why: '',
res: null, resAt: 0, mine: false,
tickAt: 0, txT: 0, lastRx: 0, hbT: 0, sq: 0, sbQ: 0, qn: 0, qt: 0, qc: 0, evSt: 0, evKo: false, hSt: [], hKo: [], hLf: [],
clkS: -1, clkTxt: '', outTxt: '',
};
const IDS = { page: ['host', 'back'], setup: ['md', 'lv', 'nb', 'start', 'leave'], wait: ['leave'], res: ['again', 'leave'] };
const HB = { n: 0, r: new Array(32).fill(0), id: new Array(8).fill('') };
function hbAdd(x, y, w, h, id) { if (HB.n < 8) { const R = HB.r, o = HB.n * 4; R[o] = x; R[o + 1] = x + w; R[o + 2] = y; R[o + 3] = y + h; HB.id[HB.n++] = id; } }
function hbHit(p) {
const R = HB.r;
for (let i = HB.n - 1; i >= 0; i--) if (p.x >= R[i * 4] && p.x <= R[i * 4 + 1] && p.y >= R[i * 4 + 2] && p.y <= R[i * 4 + 3]) return HB.id[i];
return '';
}

function netHas() { return !!api.net && typeof api.net === 'object'; }
function netOk() { const n = api.net; return !!(n && n.supported === true && typeof n.open === 'function'); }
function num(v) { return typeof v === 'number' && isFinite(v); }
function nint(v, a, b, d) { return num(v) ? clamp(Math.round(v), a, b) : d; }
function beep(ok) { api.tone(ok ? 620 : 150, 0.06, { type: ok ? 'triangle' : 'square', vol: ok ? 0.07 : 0.04 }); }
function tri(f, d, dl, sl) { api.tone(f, d, { type: 'triangle', vol: 0.09, delay: dl || 0, slide: sl || 0 }); }
function hostNow() {
try { const h = NS.s.hostTime(); if (num(h)) return h; } catch (e) { /* older hub */ }
return performance.now();
}
function netSend(m, fast) {
const s = NS.s;
if (!s) return;
try { if (NS.host) s.broadcast(m, fast ? FAST : REL); else s.send(m, fast ? FAST : REL); } catch (e) { /* a dead link reports itself through 'close' */ }
}
function netPlayers() { const s = NS.s; return s && Array.isArray(s.players) ? s.players : []; }
function cleanName(v, i) { return String(v || '').replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, 10) || (i < 0 ? 'CPU' : 'Player ' + (i + 1)); }
function netName(i) {
const pl = netPlayers();
for (let j = 0; j < pl.length; j++) if (pl[j] && pl[j].index === i) return cleanName(pl[j].name, i);
return cleanName('', i);
}
function clip(s) { ctx.font = FN_B13; while (s.length > 1 && ctx.measureText(s).width > 92) s = s.slice(0, -1); return s; } // sidebar names
function slotOf(idx) { for (let i = 0; i < NS.P.length; i++) if (!NS.P[i].bot && NS.P[i].idx === idx) return NS.P[i]; return null; }
function netTexts() {
const pl = netPlayers();
let s = '', hum = 0;
for (let j = 0; j < pl.length; j++) {
const p = pl[j];
if (!p || !num(p.index) || p.connected === false) continue;
hum++;
const nm = cleanName(p.name, p.index);
s += (s ? ', ' : '') + nm + (p.index === NS.me ? ' (you)' : '');
}
NS.hum = Math.max(1, hum);
const nb = Math.min(NS.nb, NET_N - NS.hum);
if (NS.host) NS.nb = nb;
for (let i = 0; i < nb; i++) s += ', ' + BOT_NAMES[i] + ' (CPU)';
NS.plTxt = 'In the room: ' + s;
NS.cv[0] = 'Mode:   <  ' + MODES[NS.md] + '  >'; NS.cv[1] = 'Start level:   <  ' + NS.lv + '  >';
NS.cv[2] = 'CPU rivals:   <  ' + (nb || 'none') + '  >' + (NS.hum >= NET_N ? '  (room full)' : '');
NS.cfgTxt = MODES[NS.md] + '  \u00B7  start at level ' + NS.lv + '  \u00B7  CPU rivals: ' + (nb || 'none');
}

function recLoad() {
if (!NS.rec) {
let r = null;
try { r = JSON.parse((typeof api.load === 'function' && api.load('online')) || 'null'); } catch (e) { r = null; }
const g = function (k) { const v = r && typeof r === 'object' ? r[k] : 0; return num(v) && v > 0 ? Math.floor(v) : 0; };
NS.rec = { w: g('w'), p: g('p'), b: g('b') };
}
NS.recTxt = 'Online record: ' + NS.rec.w + ' won of ' + NS.rec.p + '  \u00B7  best score ' + NS.rec.b;
}
function recAdd(won, sc) {
recLoad();
const r = NS.rec;
r.p++; if (won) r.w++; if (sc > r.b) r.b = sc;
try { if (typeof api.save === 'function') api.save('online', JSON.stringify(r)); } catch (e) { /* storage blocked */ }
recLoad();
}

function netScreen(scr) {
if (NS.dirty) { // a fresh, lit city behind the room screens after a match
NS.dirty = false; lv0 = 1;
city = makeCity(Math.random);
words = []; target = null; slowT = 0; bannerQ = []; banner = null;
}
state = 'net'; NS.scr = scr; NS.f = 0; NS.menu = false; NS.demo = true; paused = false;
if (document.activeElement === input) input.blur();
}
function netPage(note) { recLoad(); netScreen('page'); NS.note = note || ''; }
function netPill() { if (netOk()) { NS.dirty = NS.dirty || state === 'over'; netPage(''); } beep(netOk()); }
function netBack() { state = 'title'; NS.scr = ''; NS.demo = false; beep(true); }
function netSetup() { netScreen('setup'); NS.res = null; NS.cfgD = true; NS.note = ''; netTexts(); }
function netWait(rdy) { netScreen('wait'); NS.res = null; NS.mine = rdy; netTexts(); }
function netOpen() {
if (NS.s || NS.opening || !netOk()) return;
let p = null;
try { p = api.net.open({ maxPlayers: NET_N, modeLabel: 'Typing battle' }); } catch (e) { p = null; }
if (!p || typeof p.then !== 'function') { NS.note = "Online play didn't start. Try again."; return; }
const tok = ++NS.tok;
NS.opening = true; NS.note = '';
p.then(function (s) {
if (tok !== NS.tok || destroyed) { try { if (s) s.close(); } catch (e) { /* ignore */ } return; }
NS.opening = false;
if (s && typeof s === 'object') { try { netBegin(s); } catch (e) { netAbort('Connection lost'); } }
}, function () { if (tok === NS.tok) NS.opening = false; });
}
function netBegin(s) {
NS.s = s; NS.host = s.role === 'host'; NS.me = NS.host ? 0 : nint(s.me, 1, 7, 1);
NS.live = false; NS.P.length = 0;
NS.lastRx = NS.tickAt = NS.txT = performance.now(); NS.hbT = 0; NS.sq = NS.sbQ = 0;
s.on('message', netMsg); s.on('leave', netLeft); s.on('close', netClosed);
NS.iv = setInterval(netTick, 100);
if (NS.host) netSetup(); else netWait(false);
}
function netEnd() {
const s = NS.s;
NS.s = null; NS.tok++; NS.opening = false; NS.live = false; NS.menu = false; NS.stream = null; NS.P.length = 0; NS.res = null;
if (NS.iv) { clearInterval(NS.iv); NS.iv = 0; }
if (s) {
try { s.off('message', netMsg); s.off('leave', netLeft); s.off('close', netClosed); } catch (e) { /* ignore */ }
try { s.close(); } catch (e) { /* ignore */ }
}
}
function netAbort(note) { netEnd(); netPage(note); tri(220, 0.3, 0, 150); }
function netLeave() {
if (NS.live && !NS.done && performance.now() >= NS.go) recAdd(false, score); // leaving a match counts as played
netEnd(); netPage(''); tri(330, 0.08, 0, 220);
}
function netClosed(reason) {
if (destroyed || !NS.s) return;
if (reason === 'closed') { netEnd(); netPage(''); return; } // the hub closed it (Restart, unmount)
netAbort(reason === 'host-left' ? 'Host left' : 'Connection lost');
}
function netLeft(i) {
if (destroyed || !NS.s) return;
const P = NS.host && NS.live ? slotOf(i) : null;
if (P) { if (!NS.stopped) netOut(P, true); else { P.left = true; P.fin = true; } }
NS.cfgD = true;
netTexts();
}

function netStart() {
if (!NS.host || !NS.s || NS.live) return;
const pl = [[netName(0), 0]], all = netPlayers();
for (let j = 0; j < all.length && pl.length < NET_N; j++) {
const p = all[j];
if (p && num(p.index) && p.index > 0 && p.connected !== false) pl.push([netName(p.index), p.index]);
}
for (let i = 0; i < NS.nb && pl.length < NET_N; i++) pl.push([BOT_NAMES[i], -1]);
if (pl.length < 2) { NS.note = 'Everyone else left: add a CPU rival to play.'; beep(false); return; }
const m = { t: 'go', seed: 1 + Math.floor(Math.random() * 2147483000), md: NS.md, lv: NS.lv, at: Math.round(hostNow() + COUNT_MS), pl: pl };
netSend(m);
netGo(m);
}
function netGo(m) {
if (NS.live || !num(m.seed) || !Array.isArray(m.pl)) return;
NS.md = m.md === 1 ? 1 : 0; NS.lv = m.lv === 3 || m.lv === 5 ? m.lv : 1;
const P = NS.P;
P.length = 0; NS.my = -1;
let nb = 0;
for (let i = 0; i < m.pl.length && P.length < NET_N; i++) {
const e = m.pl[i];
if (!Array.isArray(e)) continue;
const idx = nint(e[1], -1, 7, -1), bot = idx < 0, nm = cleanName(e[0], idx) + (bot ? ' (CPU)' : '');
if (!bot && idx === NS.me && NS.my < 0) NS.my = P.length;
P.push({ nm: nm, sn: clip(nm), idx: idx, bot: bot, s: 0, l: NS.lv, h: DISTRICTS, z: 0, n: 0, out: false, left: false,
fin: false, outT: 0, ds: 0, sv: -1, sT: '0', lv: -1, lT: '', nT: '0', fl: 0, rx: performance.now(), q: -1, lst: -1e9,
B: bot && NS.host ? { k: 0, spT: 0.9, w: [], tg: null, acc: 0, wait: 0.8, cps: BOT_CPS[nb++ % 3] * rand(0.95, 1.05), slow: 0, combo: 0, qn: 0, qt: -9, qc: 0, t: 0 } : null });
}
if (NS.my < 0 || P.length < 2) { P.length = 0; return; } // a match without me: keep waiting
NS.stream = makeStream(m.seed >>> 0, NS.lv); NS.k = 0; NS.sd = m.seed;
const now = performance.now();
NS.go = now + (NS.host ? COUNT_MS : clamp(num(m.at) ? m.at - hostNow() : COUNT_MS, 0, COUNT_MS + 1000));
NS.end = NS.go + (NS.md === 1 ? MATCH_T : CAP_T) * 1000;
NS.live = true; NS.done = false; NS.stopped = false; NS.why = ''; NS.res = null; NS.cdN = 0; NS.clkS = -1; NS.outTxt = '';
NS.qn = 0; NS.qc = 0; NS.evSt = 0; NS.evKo = false; NS.hSt.length = 0; NS.hKo.length = 0; NS.hLf.length = 0;
NS.mine = false;
NS.dirty = true; lv0 = NS.lv;
resetRun(SIDE_X); // my city, like startRun()
submitted = true; // online scores are never submitted
resetInput();
state = 'net'; NS.scr = 'count'; NS.demo = false; NS.menu = false;
tri(523, 0.08);
}
function netCatch(s) {
let r = Math.min(s, 60);
while (r > 1e-4 && state === 'playing') { const h = Math.min(r, 1 / 30); update(h); r -= h; }
}
function netFrame(dt) {
if (!NS.live) return;
const now = performance.now();
if (state === 'net' && NS.scr === 'count') {
const n = Math.ceil((NS.go - now) / 1000);
if (n !== NS.cdN && n >= 1 && n <= 3) { NS.cdN = n; tri(440, 0.08); }
if (now >= NS.go) {
state = 'playing'; NS.scr = 'play';
pushBanner('GO!', MODES[NS.md], UI.hi);
tri(660, 0.1);
tri(990, 0.14, 0.08);
}
}
if (!NS.done && now >= NS.end) netStopLocal();
if (state === 'playing') netMine();
const e = Math.min(1, dt * 8);
for (let i = 0; i < NS.P.length; i++) { // sidebar numbers ease
const P = NS.P[i];
P.ds += (P.s - P.ds) * e;
if (Math.abs(P.s - P.ds) < 0.5) P.ds = P.s;
const v = Math.round(P.ds);
if (v !== P.sv) { P.sv = v; P.sT = String(v); }
if (P.l !== P.lv) { P.lv = P.l; P.lT = 'Lv ' + P.l; }
if (P.fl > 0) P.fl = Math.max(0, P.fl - dt);
}
const rem = Math.max(0, Math.ceil((NS.end - Math.max(now, NS.go)) / 1000));
if (rem !== NS.clkS) { NS.clkS = rem; NS.clkTxt = Math.floor(rem / 60) + ':' + (rem % 60 < 10 ? '0' : '') + (rem % 60); }
}

function netMine() { const P = NS.P[NS.my]; if (P) { P.s = score; P.l = level; P.h = lives; P.z = zapped; } }
function nStorm(L) { let n = 0; for (let i = 0; i < L.length; i++) if (L[i].kind === 'storm') n++; return n; }
function streak(o, t, clean) {
o.qn = !clean || t < o.qc ? 0 : o.qn > 0 && t - o.qt <= STREAK_GAP ? o.qn + 1 : 1;
o.qt = t;
if (o.qn < 3) return false;
o.qn = 0; o.qc = t + STORM_CD;
return true;
}
function netWord(w) {
if (!streak(NS, runTime, w.clean)) return;
if (NS.host) netStorm(NS.my); else NS.evSt++;
addPopup(w.x, w.y - 84, 'STORM SENT!', KINDS.storm.rim, 22);
addBolt(w.x, w.y, SB_X + SB_W / 2, SB_Y, KINDS.storm.glow, 2.2, 0.3);
api.tone(392, 0.14, { type: 'sawtooth', vol: 0.05, slide: 1200 });
}
function letterBusy(ch) { // on screen, or among my next three stream words
for (let i = 0; i < words.length; i++) if (words[i].text[0] === ch) return true;
for (let k = NS.k; k < NS.k + 3; k++) if (streamAt(NS.stream, k).t[0] === ch) return true;
return false;
}
function netStormHit(from) {
const F = NS.P[from];
let t = null;
if (state !== 'playing' || !F || nStorm(words) >= 2) return; // 2 storm words at a time
for (let i = 0; i < 30 && !t; i++) {
const b = BUCKETS[randInt(5, 7)], c = b[Math.floor(Math.random() * b.length)];
if (!letterBusy(c[0])) t = c;
}
if (!t || !spawnWord(params(), { t: t, kd: 'storm', from: 'storm from ' + F.nm })) return;
const w = words[words.length - 1];
addBolt(SB_X + SB_W / 2, SB_Y, w.x, w.y, KINDS.storm.glow, 1.8, 0.28);
hitFlash = Math.max(hitFlash, 0.25);
api.noise(0.3, { vol: 0.12, filter: 900 });
api.tone(220, 0.25, { type: 'sawtooth', vol: 0.05, slide: 520 });
}
function netFizzle() {
netMine();
fizzle();
target = null; slowT = 0; bannerQ = []; banner = null; NS.menu = false;
const mins = runTime / 60;
NS.outTxt = 'Score ' + score + '  \u00B7  level ' + level + '  \u00B7  ' + (mins > 0.05 ? Math.round(keysGood / 5 / mins) : 0) + ' WPM';
if (document.activeElement === input) input.blur();
}
function netFell() {
netFizzle();
state = 'net'; NS.scr = 'out'; NS.demo = false;
api.noise(0.8, { vol: 0.2, filter: 300 });
tri(262, 0.3, 0.1);
tri(196, 0.45, 0.3);
const me = NS.P[NS.my];
if (NS.host) netOut(me, false);
else { NS.evKo = true; me.out = true; me.h = 0; }
}
function netStopLocal() {
if (!NS.live || NS.done) return;
NS.done = true; NS.doneT = performance.now();
if (state === 'playing') { netFizzle(); tri(784, 0.2); }
state = 'net'; NS.scr = 'tally'; NS.demo = false; NS.menu = false;
if (NS.host) { NS.P[NS.my].fin = true; return; }
guestEv();
netSend({ t: 'fin', g: NS.sd, s: score, l: level, z: zapped, h: lives });
}
function guestEv() {
if (!NS.evSt && !NS.evKo) return;
netSend({ t: 'ev', g: NS.sd, st: NS.evSt, ko: NS.evKo ? 1 : 0, s: score, l: level, z: zapped, h: lives });
NS.evSt = 0; NS.evKo = false;
}

function netEndIn(m) {
if (!NS.live || !Array.isArray(m.r)) return;
const rows = [];
let mine = null;
for (let i = 0; i < m.r.length && rows.length < NS.P.length; i++) {
const r = m.r[i], sl = Array.isArray(r) && r.length >= 7 ? nint(r[0], -1, NS.P.length - 1, -1) : -1;
if (sl < 0) continue;
const f = nint(r[6], 0, 7, 0), pl = nint(r[1], 1, NET_N, rows.length + 1), s = nint(r[2], 0, 9999999, 0);
const o = { pl: pl, me: sl === NS.my, s: s, nm: NS.P[sl].nm + (sl === NS.my ? ' (you)' : ''), plT: PLACES[pl - 1], sT: String(s),
lT: String(nint(r[3], 1, 99, 1)), nT: String(nint(r[5], 0, 999, 0)), tag: f & 2 ? 'LEFT' : f & 1 ? 'DARK' : '' };
rows.push(o);
if (o.me) mine = o;
}
if (!rows.length) return;
if (state === 'playing') netFizzle();
const won = !!mine && mine.pl === 1, why = typeof m.why === 'string' && Object.prototype.hasOwnProperty.call(WHY, m.why) ? WHY[m.why] : '';
NS.live = false; NS.done = true;
if (performance.now() >= NS.go) recAdd(won, mine ? mine.s : score); // not if it ended in the countdown
netScreen('res');
NS.res = { rows: rows, won: won, head: mine ? HEADS[mine.pl - 1] : 'MATCH OVER', sub: MODES[m.md === 1 ? 1 : 0] + (why ? '  \u00B7  ' + why : '') };
NS.resAt = performance.now();
(won ? [523, 659, 784, 1046] : [440, 392, 330]).forEach(function (f, i) { tri(f, 0.18, i * 0.12); });
netTexts();
}
function netAgain() { if (NS.s) { beep(true); if (NS.host) netSetup(); else netWait(true); } }

function netOut(P, left) {
const i = NS.P.indexOf(P);
if (i < 0) return;
if (left && !P.left) { P.left = true; NS.hLf.push(i); }
if (P.out) return;
P.out = true; P.outT = performance.now();
if (!left) { P.h = 0; NS.hKo.push(i); }
}
function netStorm(from) {
const F = NS.P[from];
if (!F || NS.stopped) return;
F.n++; F.nT = String(F.n); F.fl = 1;
NS.hSt.push(from);
for (let i = 0; i < NS.P.length; i++) {
const P = NS.P[i];
if (i === from || P.out) continue;
if (P.bot) { const b = BUCKETS[randInt(5, 7)], t = b[Math.floor(Math.random() * b.length)]; if (nStorm(P.B.w) < 2) botWord(P, t, 'storm', 1.15); }
else if (i === NS.my) netStormHit(from);
}
}
function take(P, m) { // a player's own report: scores only go up, lights only go out
P.s = Math.max(P.s, nint(m.s, 0, 9999999, 0));
P.z = Math.max(P.z, nint(m.z, 0, 99999, 0));
P.l = Math.max(P.l, nint(m.l, 1, 99, P.l));
P.h = Math.min(P.h, nint(m.h, 0, DISTRICTS, P.h));
}
function hostEv() {
if (!NS.hSt.length && !NS.hKo.length && !NS.hLf.length) return;
netSend({ t: 'ev', st: NS.hSt.slice(), ko: NS.hKo.slice(), lf: NS.hLf.slice() });
NS.hSt.length = 0; NS.hKo.length = 0; NS.hLf.length = 0;
}
function checkEnd(now) {
let alive = 0, others = 0;
for (let i = 0; i < NS.P.length; i++) {
if (!NS.P[i].out) alive++;
if (i !== NS.my && !NS.P[i].left) others++;
}
const why = !others ? 'left' : NS.md === 0 ? (alive <= 1 ? 'last' : now >= NS.end ? 'cap' : '') : alive === 0 ? 'out' : now >= NS.end ? 'time' : '';
if (!why) return;
NS.stopped = true; NS.stopT = now; NS.why = why;
hostEv();
netSend({ t: 'stop' });
netStopLocal();
}
function allFin() {
for (let i = 0; i < NS.P.length; i++) { const P = NS.P[i]; if (!P.bot && i !== NS.my && !P.left && !P.fin) return false; }
return true;
}
function cmp(a, b) {
if (a.left !== b.left) return a.left ? 1 : -1;
if (NS.md === 0 && a.out !== b.out) return a.out ? 1 : -1;
if (NS.md === 0 && a.out && a.outT !== b.outT) return b.outT - a.outT;
if (a.s !== b.s) return b.s - a.s;
return a.out === b.out ? 0 : a.out ? 1 : -1;
}
function netResults() {
const P = NS.P, ord = [], rows = [];
for (let i = 0; i < P.length; i++) ord.push(i);
ord.sort(function (a, b) { return cmp(P[a], P[b]) || a - b; });
for (let i = 0; i < ord.length; i++) {
const A = P[ord[i]];
rows.push([ord[i], i + 1, A.s, A.l, A.z, A.n, (A.out ? 1 : 0) | (A.left ? 2 : 0) | (A.bot ? 4 : 0)]);
}
hostEv();
const m = { t: 'end', md: NS.md, why: NS.why, r: rows };
netSend(m);
netEndIn(m);
}

function botWord(P, t, kd, k) { P.B.w.push({ t: t, kind: kd, y: SPAWN_Y, vy: params(P.l).speed * (1.12 - t.length * 0.025) * k, ty: 0, cl: true }); }
function botStep(P, i, dt) {
const B = P.B, ts = B.slow > 0 ? SLOW_FACTOR : 1, p = params(P.l);
B.t += dt;
if (B.slow > 0) B.slow = Math.max(0, B.slow - dt);
if (B.w.length === 0 && B.spT > 0.5) B.spT = 0.5;
B.spT -= dt * ts;
if (B.spT <= 0 && B.w.length - nStorm(B.w) < p.max) { // the same stream as everyone else
const e = streamAt(NS.stream, B.k++);
botWord(P, e.t, e.kd, rand(0.92, 1.08) * (e.kd === 'gold' ? 1.08 : 1));
B.spT = p.interval * rand(0.85, 1.15);
}
if (!B.tg) { // lock the lowest word after a short reaction
B.acc = 0;
B.wait -= dt;
if (B.wait <= 0) for (let j = 0; j < B.w.length; j++) if (!B.tg || B.w[j].y > B.tg.y) B.tg = B.w[j];
} else {
B.acc += dt * B.cps;
while (B.acc >= 1 && B.tg) {
B.acc -= 1;
if (Math.random() < 0.05) { B.tg.cl = false; B.combo = 0; } // a typo costs a keystroke
else if (++B.tg.ty >= B.tg.t.length) botZap(P, i, B.tg);
}
}
for (let j = B.w.length - 1; j >= 0; j--) {
const w = B.w[j];
w.y += w.vy * ts * dt;
if (w.y + TAG_H / 2 < BOT_ROOF) continue;
B.w.splice(j, 1);
if (B.tg === w) { B.tg = null; B.wait = 0.4; }
B.combo = 0; B.qn = 0;
P.h = Math.max(0, P.h - 1);
if (P.h === 0) { B.w.length = 0; B.tg = null; netOut(P, false); return; }
}
}
function botZap(P, i, w) {
const B = P.B;
B.w.splice(B.w.indexOf(w), 1);
B.tg = null; B.wait = rand(0.15, 0.35);
if (w.cl) B.combo++;
P.s += Math.round(w.t.length * P.l * (B.combo >= 10 ? 2 : B.combo >= 5 ? 1.5 : 1)); P.z++;
if (w.kind === 'gold') { for (let j = 0; j < B.w.length; j++) { P.s += B.w[j].t.length * P.l; P.z++; } B.w.length = 0; }
else if (w.kind === 'ice') B.slow = SLOW_TIME;
P.l = NS.lv + Math.floor(P.z / 10);
if (streak(B, B.t, w.cl)) netStorm(i);
}

function netTick() {
if (destroyed || !NS.s) return;
const now = performance.now();
let dt = (now - NS.tickAt) / 1000;
NS.tickAt = now;
if (!(dt > 0)) dt = 0;
if (NS.live && now - last > 250) { netFrame(0); netCatch((now - last) / 1000); last = now; } // hidden tab: play on
if (!NS.live && now - NS.txT >= 1000) { NS.txT = now; netTexts(); }
if (NS.host) { hostTick(dt, now); return; }
if (now - NS.lastRx > 10000) { netAbort('Connection lost'); return; }
if (now - NS.hbT >= 1000) { NS.hbT = now; netSend({ t: 'hb' }); }
if (!NS.live) return;
if (NS.done) { if (now - NS.doneT > 8000) netAbort('Lost touch with the host'); return; }
guestEv();
if (now >= NS.go) netSend({ t: 'st', g: NS.sd, q: ++NS.sq, s: score, l: level, h: lives, z: zapped }, true);
}
function hostTick(dt, now) {
if (!NS.live) {
if (NS.cfgD || now - NS.hbT >= 1000) { NS.hbT = now; NS.cfgD = false; netSend({ t: 'cfg', md: NS.md, lv: NS.lv, nb: NS.nb }); }
return;
}
if (now - NS.hbT >= 1000) { NS.hbT = now; netSend({ t: 'hb' }); }
const run = now >= NS.go && !NS.stopped;
for (let i = 0; i < NS.P.length; i++) {
const P = NS.P[i];
if (P.bot) {
let r = run && !P.out ? Math.min(dt, 5) : 0;
while (r > 1e-6 && !P.out) { const h = Math.min(r, 0.1); botStep(P, i, h); r -= h; }
} else if (i !== NS.my && !P.left && now - P.rx > 10000) netOut(P, true); // went silent
}
if (!NS.stopped) checkEnd(now);
if (NS.stopped && (now - NS.stopT > 1500 || allFin())) { netResults(); return; }
hostEv();
const p = [];
for (let i = 0; i < NS.P.length; i++) { const P = NS.P[i]; p.push(P.s, P.l, P.h, (P.out ? 1 : 0) | (P.left ? 2 : 0)); }
netSend({ t: 'sb', q: ++NS.sq, p: p }, true);
}

function netMsg(m, from) {
if (destroyed || !NS.s || !m || typeof m !== 'object') return;
const t = m.t, now = performance.now();
if (NS.host) {
if (!num(from) || from <= 0) return;
const P = NS.live ? slotOf(from) : null;
if (!P || P.left) return;
P.rx = now;
if (m.g !== NS.sd) return; // hb, or from an old match
if (t === 'st' && !P.fin && num(m.q) && m.q > P.q) {
P.q = m.q;
take(P, m);
} else if (t === 'ev') {
take(P, m);
for (let j = nint(m.st, 0, 3, 0); j > 0; j--) { // 3 words per storm, one per cooldown
if (P.out || NS.stopped || P.n >= Math.floor(P.z / 3) || now - P.lst < (STORM_CD - 1) * 1000) break;
P.lst = now;
netStorm(NS.P.indexOf(P));
}
if (m.ko === 1) netOut(P, false);
} else if (t === 'fin') {
take(P, m);
P.fin = true;
}
if (P.h === 0) netOut(P, false);
return;
}
NS.lastRx = now;
if (t === 'cfg') {
if (NS.live) return;
NS.md = m.md === 1 ? 1 : 0; NS.lv = m.lv === 3 || m.lv === 5 ? m.lv : 1; NS.nb = nint(m.nb, 0, 3, 0);
netTexts();
} else if (t === 'go') {
if (!NS.live && (NS.scr === 'wait' || NS.scr === 'res')) netGo(m);
} else if (!NS.live) {
return;
} else if (t === 'sb') {
if (!Array.isArray(m.p) || !num(m.q) || m.q <= NS.sbQ) return;
NS.sbQ = m.q;
if (now < NS.go) return; // so a late one from the last match can't stick
for (let i = 0; i < NS.P.length && m.p.length >= i * 4 + 4; i++) {
if (i === NS.my) continue; // my own city is drawn from my own numbers
const P = NS.P[i], o = i * 4, f = nint(m.p[o + 3], 0, 3, 0);
P.s = Math.max(P.s, nint(m.p[o], 0, 9999999, 0)); P.l = Math.max(P.l, nint(m.p[o + 1], 1, 99, 1)); P.h = Math.min(P.h, nint(m.p[o + 2], 0, DISTRICTS, P.h));
if (f & 1) P.out = true;
if (f & 2) P.left = true;
}
} else if (t === 'ev') {
evIn(m.st, 0); evIn(m.ko, 1); evIn(m.lf, 2);
} else if (t === 'stop') {
netStopLocal();
} else if (t === 'end') {
netEndIn(m);
}
}
function evIn(a, kind) {
if (!Array.isArray(a)) return;
for (let j = 0; j < a.length && j < 12 && NS.live; j++) {
const i = nint(a[j], -1, NS.P.length - 1, -1), P = NS.P[i];
if (!P) continue;
if (kind === 0) { P.n++; P.nT = String(P.n); P.fl = 1; if (i !== NS.my) netStormHit(i); continue; }
if (i === NS.my) { if (kind === 2) netAbort('Connection lost'); continue; } // the host gave up on me
P.out = true;
if (kind === 1) P.h = 0; else P.left = true;
}
}

function netPillHit(e) { return netHas() && hbHit(toLogical(e)) === 'pill'; }
function netMenu(v) {
if (NS.menu === v) return;
NS.menu = v; NS.mf = 0;
api.tone(v ? 330 : 440, 0.06, { type: 'sine', vol: 0.06 });
}
function netMenuKey(e, k, sp) { // the match menu is open: letters do nothing
if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'Tab') { e.preventDefault(); NS.mf = 1 - NS.mf; beep(true); }
else if (sp || k === 'Enter') { e.preventDefault(); if (!e.repeat) { if (NS.mf) netLeave(); else netMenu(false); } }
}
function netKey(e, k, sp) {
const sc = NS.scr, esc = k === 'Escape' || k === 'Esc', ok = sp || k === 'Enter', L = IDS[sc];
const up = k === 'ArrowUp' || (k === 'Tab' && e.shiftKey), dn = k === 'ArrowDown' || (k === 'Tab' && !e.shiftKey);
const lr = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0;
if (!esc && !ok && !up && !dn && !lr) return;
e.preventDefault();
if ((e.repeat && (esc || ok)) || (sc === 'res' && performance.now() - NS.resAt < 600)) return; // results ignore input at first
if (!L) { // countdown, city dark, tally: Esc opens the match menu
if (esc) netMenu(!NS.menu);
else if (NS.menu) netMenuKey(e, k, sp);
} else if (esc) {
if (sc === 'page') netBack(); else netLeave();
} else if (ok) {
netAct(L[NS.f] || L[0], 1);
} else if (sc === 'setup' && lr && NS.f < 3) {
netAct(L[NS.f], lr);
} else {
NS.f = (NS.f + (up || lr < 0 ? -1 : 1) + L.length) % L.length;
beep(true);
}
}
function netAct(id, d) {
if (id === 'host') netOpen();
else if (id === 'back') netBack();
else if (id === 'start') netStart();
else if (id === 'leave') netLeave();
else if (id === 'again') netAgain();
else if (id === 'resume') netMenu(false);
else if (NS.host && NS.scr === 'setup') {
if (id === 'md') NS.md = 1 - NS.md;
else if (id === 'lv') NS.lv = LVS[(LVS.indexOf(NS.lv) + d + 3) % 3];
else { const m = NET_N - NS.hum + 1; NS.nb = (Math.min(NS.nb, m - 1) + d + m) % m; }
NS.cfgD = true; NS.note = '';
netTexts();
beep(true);
}
}
function netTap(p) {
const L = IDS[NS.scr], id = hbHit(p);
if (!L) netMatchTap(p);
else if (L.indexOf(id) >= 0 && !(NS.scr === 'res' && performance.now() - NS.resAt < 600)) { NS.f = L.indexOf(id); netAct(id, p.x < W / 2 ? -1 : 1); } // setup rows: the < half steps back
}
function netMatchTap(p) {
const id = hbHit(p);
if (!NS.menu) { if (Math.hypot(p.x - PAUSE_BTN.x, p.y - PAUSE_BTN.y) <= PAUSE_BTN.r + 8) netMenu(true); }
else if (id === 'resume') netMenu(false);
else if (id === 'leave') netLeave();
}

function netPillDraw() {
const ok = netOk();
roundRectPath(ctx, 330, 522, 300, 44, 14);
ctx.fillStyle = UI.panel; ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = ok ? 'rgba(192, 84, 255, 0.7)' : UI.stroke; ctx.stroke();
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
if (ok) drawZap(ctx, 356, 544, 1.2);
txt(!ok ? 'Online: not available in this browser' : touchUI ? 'ONLINE BATTLE' : 'ONLINE BATTLE  (press O)',
W / 2 + (ok ? 10 : 0), 545, ok ? FN_B16 : FN_B15, ok ? UI.head : DIM);
hbAdd(330, 522, 300, 44, 'pill');
}
function netBtn(x, y, w, h, label, id, f) {
roundRectPath(ctx, x, y, w, h, 12);
ctx.fillStyle = f ? 'rgba(255, 201, 60, 0.16)' : 'rgba(255, 255, 255, 0.05)'; ctx.fill();
ctx.lineWidth = f ? 2 : 1; ctx.strokeStyle = f ? UI.hi : 'rgba(255, 255, 255, 0.18)'; ctx.stroke();
ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
txt(label, x + w / 2, y + h / 2 + 1, FN_B16, f ? UI.hi : UI.head);
hbAdd(x, y, w, h, id);
ctx.textBaseline = 'alphabetic';
}
function netPanel(x, y, w, h, head, hy, color) {
drawPanel(ctx, x, y, w, h);
ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
fitTxt(head, W / 2, hy, w - 60, 'normal', 36, F_DISPLAY, color);
}
function netDraw() {
const sc = NS.scr;
if (sc === 'page') {
netPanel(220, 96, 520, 408, 'ONLINE BATTLE', 158, UI.head);
txt('Up to 4 cities type the same falling words.', W / 2, 200, FN_B16, UI.body);
txt('3 quick, clean words send a storm word to every rival.', W / 2, 226, FN_B16, UI.body);
txt('Last city standing wins, or top score in 3 minutes.', W / 2, 252, FN_B16, UI.body);
fitTxt(NS.recTxt, W / 2, 290, 470, '700', 14, F_MONO, UI.hi);
if (NS.opening || NS.note) fitTxt(NS.opening ? 'Opening the room screen...' : NS.note, W / 2, 322, 470, '700', 15, F_BODY, NS.opening ? UI.body : UI.danger);
netBtn(330, 344, 300, 48, 'HOST OR JOIN A ROOM', 'host', NS.f === 0);
netBtn(330, 402, 300, 40, 'BACK', 'back', NS.f === 1);
if (!touchUI) txt('Arrows choose  \u00B7  Enter selects  \u00B7  Esc goes back', W / 2, 478, FN_B13, DIM);
} else if (sc === 'setup') {
netPanel(180, 56, 600, 488, 'ROOM SETUP', 108, UI.head);
fitTxt(NS.plTxt, W / 2, 140, 540, '600', 14, F_BODY, UI.body);
for (let i = 0; i < 3; i++) netBtn(210, 162 + i * 54, 540, 44, NS.cv[i], IDS.setup[i], NS.f === i);
txt('CPU rivals type about 36, 46 and 55 words a minute', W / 2, 344, FN_B13, DIM);
netBtn(230, 362, 240, 48, 'START', 'start', NS.f === 3);
netBtn(490, 362, 240, 48, 'LEAVE', 'leave', NS.f === 4);
if (NS.note) fitTxt(NS.note, W / 2, 442, 540, '700', 15, F_BODY, UI.danger);
else txt('Keep this tab open and in front while you host.', W / 2, 442, FN_B15, UI.hi);
txt('Leaving closes the room for everyone.', W / 2, 500, FN_B13, DIM);
if (!touchUI) txt('Up/Down choose  \u00B7  Left/Right change  \u00B7  Enter selects  \u00B7  Esc leaves', W / 2, 472, FN_B13, DIM);
} else if (sc === 'wait') {
netPanel(220, 126, 520, 340, 'HOST IS SETTING UP...', 186, UI.head);
fitTxt(NS.cfgTxt, W / 2, 228, 470, '600', 15, F_BODY, UI.body);
fitTxt(NS.plTxt, W / 2, 256, 470, '600', 15, F_BODY, UI.body);
if (NS.mine) txt("You're in for the rematch.", W / 2, 290, FN_B15, UI.ok);
netBtn(360, 318, 240, 46, 'LEAVE', 'leave', true);
if (!touchUI) txt('Enter or Esc leaves the room', W / 2, 416, FN_B13, DIM);
} else if (sc === 'res') {
const R = NS.res, late = performance.now() - NS.resAt >= 600;
if (!R) return;
ctx.fillStyle = UI.scrim; ctx.fillRect(0, 0, W, H);
netPanel(160, 40, 640, 520, R.head, 96, R.won ? UI.ok : UI.head);
fitTxt(R.sub, W / 2, 126, 560, '600', 15, F_BODY, UI.body);
ctx.textAlign = 'left'; txt('Player', 240, 162, FN_B11, DIM);
ctx.textAlign = 'right'; txt('Score', 610, 162, FN_B11, DIM); txt('Level', 680, 162, FN_B11, DIM); txt('Storms', 770, 162, FN_B11, DIM);
for (let i = 0; i < R.rows.length; i++) {
const o = R.rows[i], y = 194 + i * 38;
if (o.me) { ctx.fillStyle = 'rgba(255, 201, 60, 0.1)'; ctx.fillRect(184, y - 24, 592, 34); }
ctx.textAlign = 'left';
txt(o.plT, 192, y, FN_M14, o.pl === 1 ? UI.ok : UI.body);
txt(o.nm, 240, y, FN_B16, o.me ? UI.hi : UI.head);
ctx.textAlign = 'right';
if (o.tag) txt(o.tag, 530, y, FN_B11, UI.danger);
txt(o.sT, 610, y, FN_M14, UI.head); txt(o.lT, 680, y, FN_M14, UI.body); txt(o.nT, 770, y, FN_M14, KINDS.storm.rim);
}
ctx.textAlign = 'center';
fitTxt(NS.recTxt, W / 2, 372, 560, '700', 14, F_MONO, UI.hi);
netBtn(290, 418, 180, 46, 'REMATCH', 'again', late && NS.f === 0);
netBtn(490, 418, 180, 46, 'LEAVE', 'leave', late && NS.f === 1);
if (late && blinkOn()) txt(touchUI ? 'Tap REMATCH or LEAVE' : 'Arrows choose  \u00B7  Enter selects  \u00B7  Esc leaves', W / 2, 512, FN_B15, UI.hi);
} else if (NS.P.length) { // countdown, city dark, tally: the match stays on screen
drawHUD();
netHud();
ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
if (sc === 'count') {
ctx.save();
ctx.shadowColor = '#38B6FF'; ctx.shadowBlur = 24;
txt(CD[clamp(Math.ceil((NS.go - performance.now()) / 1000), 1, 3)], SIDE_X / 2, 330, FN_D120, UI.head);
ctx.restore();
txt(MODES[NS.md], SIDE_X / 2, 382, FN_B20, UI.hi);
txt(touchUI ? 'Tap to show the keyboard' : 'Get ready to type', SIDE_X / 2, 412, FN_B16, UI.body);
} else {
const dark = sc === 'out';
drawPanel(ctx, SIDE_X / 2 - 230, 196, 460, 150);
fitTxt(dark ? 'YOUR CITY WENT DARK' : NS.clkS === 0 ? 'TIME!' : 'MATCH OVER', SIDE_X / 2, 244, 420, 'normal', 28, F_DISPLAY, dark ? UI.danger : UI.head);
fitTxt(NS.outTxt, SIDE_X / 2, 278, 420, '600', 16, F_BODY, UI.body);
txt(dark ? (touchUI ? 'Watching  \u00B7  the menu button leaves' : 'Watching the others  \u00B7  Esc for the menu') : 'Waiting for the results...', SIDE_X / 2, 314, FN_B15, UI.hi);
}
if (NS.menu) netDrawMenu();
}
}
function netDrawMenu() {
ctx.fillStyle = 'rgba(8, 12, 22, 0.5)'; ctx.fillRect(0, 0, W, H);
netPanel(300, 180, 360, 240, 'MATCH MENU', 226, UI.head);
txt("Online matches don't pause: play goes on", W / 2, 254, FN_B13, UI.body);
netBtn(360, 272, 240, 42, 'RESUME', 'resume', NS.mf === 0);
netBtn(360, 324, 240, 42, 'LEAVE MATCH', 'leave', NS.mf === 1);
if (!touchUI) txt('Arrows choose  \u00B7  Enter selects  \u00B7  Esc resumes', W / 2, 396, FN_B13, DIM);
}
function netHud() {
const n = NS.P.length, x = SB_X, w = SB_W;
roundRectPath(ctx, x, SB_Y, w, 32 + n * ROW_H, 14);
ctx.fillStyle = 'rgba(8, 12, 26, 0.8)'; ctx.fill();
ctx.lineWidth = 1.5; ctx.strokeStyle = UI.stroke; ctx.stroke();
ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
txt(NS.md === 1 ? 'TOP SCORE' : 'LAST CITY', x + 12, SB_Y + 21, FN_B11, UI.body);
ctx.textAlign = 'right';
txt(NS.clkTxt, x + w - 12, SB_Y + 22, FN_M14, NS.clkS <= 10 && NS.md === 1 ? UI.danger : UI.head);
for (let i = 0; i < n; i++) {
const P = NS.P[i], y = SB_Y + 30 + i * ROW_H, me = i === NS.my;
if (me) { ctx.fillStyle = 'rgba(255, 201, 60, 0.1)'; ctx.fillRect(x + 4, y, w - 8, ROW_H - 4); }
if (P.fl > 0) { ctx.globalAlpha = P.fl * 0.45; ctx.fillStyle = KINDS.storm.glow; ctx.fillRect(x + 4, y, w - 8, ROW_H - 4); ctx.globalAlpha = 1; }
ctx.textAlign = 'left';
txt(P.sn, x + 12, y + 18, FN_B13, me ? UI.hi : UI.head);
txt(P.lT, x + 80, y + 35, FN_M11, UI.body);
ctx.textAlign = 'right';
txt(P.sT, x + w - 12, y + 18, FN_M14, UI.head);
txt(P.nT, x + w - 12, y + 35, FN_M11, KINDS.storm.rim);
drawZap(ctx, x + w - 30, y + 31, 0.6);
for (let j = 0; j < DISTRICTS; j++) {
disc(ctx, x + 16 + j * 12, y + 31, 4);
ctx.fillStyle = j < P.h ? '#FFD27A' : '#2a3048'; ctx.fill();
}
if (P.out) {
ctx.globalAlpha = 0.6; ctx.fillStyle = '#080c1a'; ctx.fillRect(x + 4, y, w - 8, ROW_H - 4); ctx.globalAlpha = 1;
ctx.textAlign = 'center';
txt(P.left ? 'LEFT' : 'DARK', x + w / 2, y + 27, FN_B13, UI.danger);
}
}
ctx.textAlign = 'center';
if (state !== 'playing') return;
const cd = NS.qc - runTime, q = runTime - NS.qt <= STREAK_GAP ? NS.qn : 0; // storm streak pips
ctx.textAlign = 'left';
txt('STORM', 340, 21, FN_B11, q ? KINDS.storm.rim : UI.body);
for (let j = 0; j < 3; j++) { ctx.fillStyle = j < q ? KINDS.storm.glow : 'rgba(255, 255, 255, 0.16)'; ctx.fillRect(340 + j * 16, 32, 12, 12); }
if (cd > 0) { ctx.fillStyle = KINDS.storm.rim; ctx.fillRect(340, 48, 44 * (1 - cd / STORM_CD), 3); }
}

function frame(now) {
if (destroyed) return;
raf = requestAnimationFrame(frame);
if ((window.devicePixelRatio || 1) !== dpr) resize();
let dt = (now - last) / 1000;
last = now;
if (!(dt > 0)) dt = 0;
const lag = NS.live && state === 'playing' ? dt - 1 / 30 : 0; // online can't pause: catch up a hidden tab
if (dt > 1 / 30) dt = 1 / 30;
ui += dt;
if (!paused) update(dt);
if (lag > 0) netCatch(lag);
if (NS.s) netFrame(dt);
render();
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('blur', onBlur);
document.addEventListener('visibilitychange', onVisibility);
canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointerup', onPointerUp);
input.addEventListener('input', onInput);
input.addEventListener('compositionstart', onCompStart);
input.addEventListener('compositionend', onCompEnd);
let ro = null;
if (typeof ResizeObserver === 'function') {
ro = new ResizeObserver(resize);
ro.observe(root);
} else {
window.addEventListener('resize', resize);
}
resize();
raf = requestAnimationFrame(frame);

function destroy() {
if (destroyed) return;
destroyed = true;
cancelAnimationFrame(raf);
netEnd();
window.removeEventListener('keydown', onKeyDown);
window.removeEventListener('blur', onBlur);
document.removeEventListener('visibilitychange', onVisibility);
canvas.removeEventListener('pointerdown', onPointerDown);
canvas.removeEventListener('pointerup', onPointerUp);
input.removeEventListener('input', onInput);
input.removeEventListener('compositionstart', onCompStart);
input.removeEventListener('compositionend', onCompEnd);
if (ro) ro.disconnect();
else window.removeEventListener('resize', resize);
if (document.activeElement === input) input.blur();
if (input.parentNode) input.parentNode.removeChild(input);
if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
}

function restart() {
if (destroyed) return;
netEnd(); // leaves any room: a restart is always a fresh single-player run
NS.demo = false;
startRun();
}

return { destroy: destroy, restart: restart };
}

(window.RECESS = window.RECESS || { games: [] }).games.push({
id: 'word-rain',
title: 'Word Rain',
blurb: 'Type the falling words to zap them with lightning before they black out the city.',
genre: 'Word',
controls: [
['Type', 'Zap words'],
['Backspace', 'Drop target'],
['Esc', 'Pause (online: menu)'],
['O (title, game over)', 'Online battle'],
],
scoreLabel: 'Score',
lowerIsBetter: false,
online: { maxPlayers: 4 },
thumb: thumb,
mount: mount,
});
})();

} catch (e) { console.error("[Recess] word-rain failed to load", e); }
