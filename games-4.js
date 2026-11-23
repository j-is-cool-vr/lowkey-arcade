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
