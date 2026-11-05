/**
 * PetersWorld – Global Flight Radar
 * WebAssembly-aangedreven 3D wereldbol met live vluchten.
 * Versie: 1.1.0
 */

'use strict';

// ═══════════════════════════════════════════════════════
//  CONFIGURATIE
// ═══════════════════════════════════════════════════════
const CFG = {
  wasmFile: 'petersworld.wasm',
  versionFile: 'version.json',
  pollMs: 30_000,
  flightCount: 120,         // aantal gesimuleerde vluchten
  globeRadius: 180,
};

// ═══════════════════════════════════════════════════════
//  VLUCHTEN DATABASE  –  echte routes, luchthavens & airlines
// ═══════════════════════════════════════════════════════
const AIRPORTS = [
  // Europa
  { code:'AMS', name:'Amsterdam Schiphol',       lat: 52.31, lon:  4.76, hub:true  },
  { code:'LHR', name:'London Heathrow',           lat: 51.47, lon: -0.46, hub:true  },
  { code:'CDG', name:'Paris Charles de Gaulle',   lat: 49.01, lon:  2.55, hub:true  },
  { code:'FRA', name:'Frankfurt Main',            lat: 50.03, lon:  8.57, hub:true  },
  { code:'MAD', name:'Madrid Barajas',            lat: 40.47, lon: -3.57, hub:false },
  { code:'FCO', name:'Rome Fiumicino',            lat: 41.80, lon: 12.25, hub:false },
  { code:'ARN', name:'Stockholm Arlanda',         lat: 59.65, lon: 17.93, hub:false },
  { code:'ZRH', name:'Zürich Airport',            lat: 47.46, lon:  8.55, hub:false },
  { code:'BRU', name:'Brussels Airport',          lat: 50.90, lon:  4.48, hub:false },
  { code:'VIE', name:'Vienna International',      lat: 48.11, lon: 16.57, hub:false },
  // Noord-Amerika
  { code:'JFK', name:'New York JFK',              lat: 40.64, lon:-73.78, hub:true  },
  { code:'LAX', name:'Los Angeles International', lat: 33.94, lon:-118.40, hub:true },
  { code:'ORD', name:"Chicago O'Hare",            lat: 41.98, lon:-87.90, hub:true  },
  { code:'ATL', name:'Atlanta Hartsfield',        lat: 33.64, lon:-84.43, hub:false },
  { code:'DFW', name:'Dallas Fort Worth',         lat: 32.90, lon:-97.04, hub:false },
  { code:'YYZ', name:'Toronto Pearson',           lat: 43.68, lon:-79.63, hub:false },
  { code:'MIA', name:'Miami International',       lat: 25.80, lon:-80.28, hub:false },
  { code:'SFO', name:'San Francisco International',lat:37.62, lon:-122.38, hub:false},
  // Azië & Midden-Oosten
  { code:'DXB', name:'Dubai International',       lat: 25.25, lon: 55.36, hub:true  },
  { code:'HND', name:'Tokyo Haneda',              lat: 35.55, lon:139.78, hub:true  },
  { code:'PEK', name:'Beijing Capital',           lat: 40.08, lon:116.58, hub:true  },
  { code:'SIN', name:'Singapore Changi',          lat:  1.36, lon:103.99, hub:true  },
  { code:'HKG', name:'Hong Kong International',   lat: 22.31, lon:113.91, hub:false },
  { code:'BOM', name:'Mumbai Chhatrapati Shivaji', lat:19.09, lon: 72.87, hub:false },
  { code:'ICN', name:'Seoul Incheon',             lat: 37.46, lon:126.44, hub:false },
  { code:'BKK', name:'Bangkok Suvarnabhumi',      lat: 13.69, lon:100.75, hub:false },
  { code:'DOH', name:'Doha Hamad',                lat: 25.27, lon: 51.61, hub:false },
  // Oceanie & Afrika & Zuid-Amerika
  { code:'SYD', name:'Sydney Kingsford Smith',    lat:-33.95, lon:151.18, hub:true  },
  { code:'MEL', name:'Melbourne Tullamarine',     lat:-37.67, lon:144.84, hub:false },
  { code:'JNB', name:'Johannesburg OR Tambo',     lat:-26.14, lon: 28.24, hub:false },
  { code:'NBO', name:'Nairobi Jomo Kenyatta',     lat: -1.32, lon: 36.93, hub:false },
  { code:'CAI', name:'Cairo International',       lat: 30.12, lon: 31.41, hub:false },
  { code:'GRU', name:'São Paulo Guarulhos',       lat:-23.43, lon:-46.47, hub:false },
  { code:'BOG', name:'Bogotá El Dorado',          lat:  4.70, lon:-74.14, hub:false },
  { code:'LIM', name:'Lima Jorge Chávez',         lat:-12.02, lon:-77.11, hub:false },
  { code:'MEX', name:'Mexico City NAICM',         lat: 19.43, lon:-99.07, hub:false },
];

const AIRLINES = [
  { code:'KLM',  name:'KLM Royal Dutch Airlines',   color:'#00a1de', types:['Boeing 737','Boeing 777','Airbus A330'] },
  { code:'DLH',  name:'Lufthansa',                   color:'#f9ba00', types:['Airbus A320','Airbus A350','Boeing 747'] },
  { code:'BAW',  name:'British Airways',             color:'#075aaa', types:['Boeing 777','Airbus A380','Boeing 787'] },
  { code:'AFR',  name:'Air France',                  color:'#002157', types:['Airbus A320','Airbus A380','Boeing 777'] },
  { code:'UAE',  name:'Emirates',                    color:'#c8102e', types:['Boeing 777','Airbus A380'] },
  { code:'UAL',  name:'United Airlines',             color:'#005daa', types:['Boeing 737','Boeing 777','Boeing 787'] },
  { code:'AAL',  name:'American Airlines',           color:'#c8102e', types:['Boeing 737','Boeing 777','Airbus A321'] },
  { code:'DAL',  name:'Delta Air Lines',             color:'#9d1f26', types:['Boeing 737','Airbus A330','Boeing 767'] },
  { code:'ANA',  name:'All Nippon Airways',          color:'#13448f', types:['Boeing 787','Boeing 777','Airbus A380'] },
  { code:'SIA',  name:'Singapore Airlines',          color:'#172e69', types:['Airbus A350','Airbus A380','Boeing 777'] },
  { code:'QFA',  name:'Qantas',                      color:'#e8111a', types:['Boeing 737','Airbus A380','Boeing 787'] },
  { code:'TKA',  name:'Turkish Airlines',            color:'#c70000', types:['Boeing 737','Airbus A330','Boeing 777'] },
  { code:'RYR',  name:'Ryanair',                     color:'#073590', types:['Boeing 737'] },
  { code:'EZY',  name:'easyJet',                     color:'#ff6600', types:['Airbus A319','Airbus A320'] },
  { code:'TUI',  name:'TUI Airways',                 color:'#c0022b', types:['Boeing 737','Boeing 767'] },
];

// ═══════════════════════════════════════════════════════
//  VLUCHT GENERATOR  –  willekeurige maar realistische routes
// ═══════════════════════════════════════════════════════
function seededRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF; };
}

function generateFlights(count) {
  const rng = seededRng(0xDEADBEEF);
  const flights = [];

  const flightNumFor = (al, idx) =>
    `${al.code}${String(Math.floor(rng() * 9000) + 1000).padStart(4,'0')}`;

  for (let i = 0; i < count; i++) {
    const originIdx  = Math.floor(rng() * AIRPORTS.length);
    let   destIdx    = Math.floor(rng() * AIRPORTS.length);
    while (destIdx === originIdx) destIdx = Math.floor(rng() * AIRPORTS.length);

    const airline = AIRLINES[Math.floor(rng() * AIRLINES.length)];
    const aircraft = airline.types[Math.floor(rng() * airline.types.length)];

    const o = AIRPORTS[originIdx];
    const d = AIRPORTS[destIdx];

    // Groote-cirkelbogen berekenen voor het pad
    const gcArc = computeGreatCircleArc(o.lat, o.lon, d.lat, d.lon, 48);

    // Hoogte in meters (realistisch: 9000-12500m)
    const altitude = 9000 + Math.floor(rng() * 3500);
    // Snelheid in km/h (800-960 afhankelijk van vliegtuigtype)
    const speedKmh = 800 + Math.floor(rng() * 160);
    // Vluchtduur (uur)
    const distKm = haversineKm(o.lat, o.lon, d.lat, d.lon);
    const durationH = distKm / speedKmh;
    // Willekeurig startpunt in de vlucht (0-1)
    const startProgress = rng();

    flights.push({
      id: i,
      callsign: `${airline.code}${Math.floor(rng() * 9000) + 1000}`,
      airline,
      aircraft,
      origin: o,
      dest: d,
      altitude,
      speedKmh,
      durationH,
      progress: startProgress,       // 0 = vertrek, 1 = aankomst
      progressRate: 1 / (durationH * 3600 * 60), // per simulatiems bij 1×
      arc: gcArc,
      color: airline.color,
      hovered: false,
      selected: false,
      // Trail: array van recente posities
      trail: [],
      trailMaxLen: 20,
    });
  }

  return flights;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeGreatCircleArc(lat1, lon1, lat2, lon2, steps) {
  // SLERP op de eenheidsssfeer voor een correcte groote-cirkelroute
  const toXYZ = (la, lo) => {
    const φ = la * Math.PI / 180, λ = lo * Math.PI / 180;
    return [Math.cos(φ)*Math.sin(λ), -Math.sin(φ), Math.cos(φ)*Math.cos(λ)];
  };
  const toLaLo = ([x, y, z]) => {
    const la = -Math.asin(Math.max(-1, Math.min(1, y))) * 180 / Math.PI;
    const lo = Math.atan2(x, z) * 180 / Math.PI;
    return [la, lo];
  };

  const p1 = toXYZ(lat1, lon1);
  const p2 = toXYZ(lat2, lon2);
  const dot = p1[0]*p2[0] + p1[1]*p2[1] + p1[2]*p2[2];
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));

  const arc = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (theta < 1e-6) { arc.push([lat1, lon1]); continue; }
    const sinT = Math.sin(theta);
    const w1 = Math.sin((1 - t) * theta) / sinT;
    const w2 = Math.sin(t * theta) / sinT;
    const pt = [w1*p1[0]+w2*p2[0], w1*p1[1]+w2*p2[1], w1*p1[2]+w2*p2[2]];
    arc.push(toLaLo(pt));
  }
  return arc;
}

// Interpoleer positie op de groote-cirkelroute op basis van voortgang (0-1)
function getPositionOnArc(arc, t) {
  const idx = Math.min(arc.length - 2, Math.floor(t * (arc.length - 1)));
  const frac = t * (arc.length - 1) - idx;
  const a = arc[idx], b = arc[idx + 1];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

// ═══════════════════════════════════════════════════════
//  WORLD STATE
// ═══════════════════════════════════════════════════════
const W = {
  wasm: null,
  canvas: null,
  ctx: null,
  w: 0, h: 0,
  dpr: window.devicePixelRatio || 1,

  // Camera
  rotY: 0.4, rotX: 0.3,
  targetRotY: 0.4, targetRotX: 0.3,
  zoom: 1.0, targetZoom: 1.0,
  isDragging: false, lastX: 0, lastY: 0,
  velX: 0, velY: 0,
  autoRotate: true,
  autoRotateSpeed: 0.00025,

  // Simulatie
  paused: false,
  speed: 1,
  tick: 0,
  flights: [],
  layers: { flights: true, airports: true, trails: true, grid: true },

  // Versie
  currentVersion: '1.1.0',
  currentBuild: 4,
  remoteData: null,

  // Follow
  followFlight: null,

  // FPS
  lastFrame: 0,
  fps: 60,
  fpsCount: 0,
  fpsLast: 0,
};

// ═══════════════════════════════════════════════════════
//  3D PROJECTIE
// ═══════════════════════════════════════════════════════
function project3D(latDeg, lonDeg, r) {
  const φ = latDeg * Math.PI / 180;
  const λ = lonDeg * Math.PI / 180;

  // Coördinaten op bol
  let x = r * Math.cos(φ) * Math.sin(λ);
  let y = -r * Math.sin(φ);
  let z = r * Math.cos(φ) * Math.cos(λ);

  // Rotatie Y (yaw / azimuth)
  const cY = Math.cos(W.rotY), sY = Math.sin(W.rotY);
  const x1 = x * cY + z * sY;
  const z1 = -x * sY + z * cY;

  // Rotatie X (pitch / tilt)
  const cX = Math.cos(W.rotX), sX = Math.sin(W.rotX);
  const y2 = y * cX - z1 * sX;
  const z2 = y * sX + z1 * cX;

  const sc = W.zoom;
  const cx = W.w / 2, cy = W.h / 2;
  return {
    x: cx + x1 * sc,
    y: cy + y2 * sc,
    z: z2,
    visible: z2 > -r * 0.1,     // kleine buffer zodat het niet te abrupt knipt
    front: z2 > 0,
  };
}

// ═══════════════════════════════════════════════════════
//  WASM BRUG
// ═══════════════════════════════════════════════════════
async function loadWasm() {
  try {
    const url = `${CFG.wasmFile}?v=${Date.now()}`;
    let instance;
    if (WebAssembly.instantiateStreaming) {
      try {
        const r = await WebAssembly.instantiateStreaming(fetch(url), {});
        instance = r.instance;
      } catch {
        const buf = await (await fetch(url)).arrayBuffer();
        instance = (await WebAssembly.instantiate(buf, {})).instance;
      }
    } else {
      const buf = await (await fetch(url)).arrayBuffer();
      instance = (await WebAssembly.instantiate(buf, {})).instance;
    }
    W.wasm = instance.exports;
    W.wasm.init_world(0xBEEF);
    const ver = W.wasm.get_version();
    document.getElementById('hud-wasm').textContent = `v${(ver/100).toFixed(2)}`;
    console.log(`[WASM] PetersWorld engine v${(ver/100).toFixed(2)} geladen.`);
  } catch (e) {
    console.error('[WASM] Laad fout:', e);
  }
}

// ═══════════════════════════════════════════════════════
//  VERSIE MANAGER
// ═══════════════════════════════════════════════════════
async function checkVersion(isInit = false) {
  try {
    const r = await fetch(`${CFG.versionFile}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    if (!r.ok) return;
    const data = await r.json();
    W.remoteData = data;

    const remoteBuild = parseInt(data.build || 0, 10);
    const remoteVer   = data.version || W.currentVersion;

    document.getElementById('ver-txt').textContent = `v${W.currentVersion}`;

    if (isInit && !localStorage.getItem('pw_build')) {
      localStorage.setItem('pw_build', remoteBuild);
      localStorage.setItem('pw_ver',   remoteVer);
      setVerDot(false);
      return;
    }

    const storedBuild = parseInt(localStorage.getItem('pw_build') || '0', 10);
    const newer = remoteBuild > storedBuild || remoteVer !== (localStorage.getItem('pw_ver') || W.currentVersion);

    if (newer) {
      showUpdateBanner(data);
      setVerDot(true);
    } else {
      setVerDot(false);
    }
  } catch {}
}

function setVerDot(hasUpdate) {
  const dot = document.getElementById('ver-dot');
  if (!dot) return;
  if (hasUpdate) {
    dot.style.background = '#facc15';
    dot.style.boxShadow  = '0 0 8px #facc15';
  } else {
    dot.style.background = '#22c55e';
    dot.style.boxShadow  = '0 0 7px #22c55e';
  }
}

function showUpdateBanner(data) {
  const banner = document.getElementById('update-banner');
  document.getElementById('upd-ver').textContent  = `v${data.version} build #${data.build}`;
  if (data.features && data.features[0]) {
    document.getElementById('upd-note').textContent = data.features[0];
  }
  banner.classList.add('show');
}

async function applyUpdate() {
  if (W.remoteData) {
    localStorage.setItem('pw_build', W.remoteData.build);
    localStorage.setItem('pw_ver',   W.remoteData.version);
  }
  if ('caches' in window) {
    for (const k of await caches.keys()) await caches.delete(k);
  }
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
  }
  const url = new URL(location.href);
  url.searchParams.set('v', Date.now());
  location.href = url.toString();
}

// ═══════════════════════════════════════════════════════
//  RENDER ENGINE
// ═══════════════════════════════════════════════════════
function resize() {
  W.w = window.innerWidth;
  W.h = window.innerHeight;
  W.canvas.width  = W.w * W.dpr;
  W.canvas.height = W.h * W.dpr;
  W.ctx.scale(W.dpr, W.dpr);
}

let _globeR = CFG.globeRadius;
function globeR() { return _globeR * W.zoom; }

function drawBackground() {
  const { ctx, w, h } = W;
  const cx = w/2, cy = h/2;
  const bg = ctx.createRadialGradient(cx, cy, 60, cx, cy, Math.max(w, h));
  bg.addColorStop(0,   '#091525');
  bg.addColorStop(0.5, '#060e1a');
  bg.addColorStop(1,   '#030810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Sterren (statisch, enkel op eerste frame genereren)
  if (!W._stars) {
    const rng = seededRng(0xCAFE);
    W._stars = Array.from({length: 320}, () => ({
      x: rng() * w, y: rng() * h,
      r: rng() * 1.4,
      a: 0.3 + rng() * 0.7
    }));
  }
  for (const s of W._stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  }
}

function drawAtmosphere() {
  const { ctx, w, h } = W;
  const cx = w/2, cy = h/2;
  const r  = globeR();
  const atmo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.3);
  atmo.addColorStop(0,   'rgba(56,189,248,0.40)');
  atmo.addColorStop(0.4, 'rgba(56,189,248,0.12)');
  atmo.addColorStop(1,   'rgba(56,189,248,0)');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlobe() {
  const { ctx, w, h } = W;
  const cx = w/2, cy = h/2;
  const r  = globeR();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Basiskoe donker
  ctx.fillStyle = '#071324';
  ctx.fillRect(cx - r - 2, cy - r - 2, r * 2 + 4, r * 2 + 4);

  // Oceaan gradient
  const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  ocean.addColorStop(0,   '#0f3a6e');
  ocean.addColorStop(0.6, '#0a2550');
  ocean.addColorStop(1,   '#071324');
  ctx.fillStyle = ocean;
  ctx.fillRect(cx - r - 2, cy - r - 2, r * 2 + 4, r * 2 + 4);

  // Dag/nacht terminator
  const termGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  termGrad.addColorStop(0,   'rgba(0,0,0,0.65)');
  termGrad.addColorStop(0.42,'rgba(0,0,0,0.35)');
  termGrad.addColorStop(0.5, 'rgba(255,170,80,0.08)');
  termGrad.addColorStop(0.58,'rgba(255,255,255,0.0)');
  termGrad.addColorStop(1,   'rgba(255,255,255,0.0)');
  ctx.fillStyle = termGrad;
  ctx.fillRect(cx - r - 2, cy - r - 2, r * 2 + 4, r * 2 + 4);

  ctx.restore();

  // Rand / limb glow
  const limb = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r);
  limb.addColorStop(0, 'transparent');
  limb.addColorStop(1, 'rgba(56,189,248,0.35)');
  ctx.strokeStyle = 'rgba(56,189,248,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGrid() {
  if (!W.layers.grid) return;
  const { ctx } = W;
  const r = _globeR;
  ctx.strokeStyle = 'rgba(56,189,248,0.10)';
  ctx.lineWidth = 0.8;

  // Breedtegraden
  for (const lat of [-60, -30, 0, 30, 60]) {
    ctx.beginPath();
    let started = false;
    for (let lo = -180; lo <= 180; lo += 4) {
      const p = project3D(lat, lo, r);
      if (p.visible) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      } else started = false;
    }
    ctx.stroke();
  }

  // Lengtegraden
  for (let lo = -180; lo < 180; lo += 30) {
    ctx.beginPath();
    let started = false;
    for (let la = -88; la <= 88; la += 4) {
      const p = project3D(la, lo, r);
      if (p.visible) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      } else started = false;
    }
    ctx.stroke();
  }
}

// Gestileerde continentpolygonen (vereenvoudigd maar herkenbaar)
const CONTINENT_SHAPES = [
  // Europa
  [[71,25],[70,19],[63,10],[58,-5],[43,-9],[36,-5],[38,15],[42,21],[46,30],[48,40],[55,37],[60,30],[65,25],[68,20]],
  // Afrika
  [[37,10],[34,32],[30,32],[14,42],[-5,41],[-25,33],[-34,19],[-28,17],[-20,13],[0,10],[8,2],[15,-17],[30,-10],[35,-5]],
  // Azië (vereenvoudigd)
  [[72,60],[71,140],[60,165],[35,140],[22,115],[8,105],[20,85],[30,60],[47,40],[55,37],[60,30],[70,38]],
  // Noord-Amerika
  [[72,-140],[70,-95],[60,-65],[47,-54],[30,-81],[23,-107],[28,-111],[32,-118],[48,-125],[60,-140]],
  // Zuid-Amerika
  [[12,-72],[7,-52],[-5,-35],[-10,-38],[-25,-48],[-45,-65],[-55,-68],[-33,-71],[-18,-70],[-5,-80]],
  // Australië
  [[-12,130],[-15,145],[-28,154],[-38,145],[-35,118],[-20,115]],
  // Groenland (Arctic)
  [[83,-45],[77,-18],[72,-24],[75,-57],[81,-57]],
  // Japan (gestileerd)
  [[44,145],[42,142],[35,137],[34,130],[37,136],[40,141]],
  // Groot-Brittannië
  [[59,-3],[57,-6],[51,-5],[51,2],[54,0],[58,-5]],
];

function drawContinents() {
  const { ctx } = W;
  const r = _globeR;

  ctx.fillStyle   = 'rgba(34,197,94,0.22)';
  ctx.strokeStyle = 'rgba(74,222,128,0.70)';
  ctx.lineWidth   = 1.2;

  for (const poly of CONTINENT_SHAPES) {
    ctx.beginPath();
    let visCount = 0;
    let first = true;
    for (const [la, lo] of poly) {
      const p = project3D(la, lo, r + 0.5);
      if (p.front) visCount++;
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    if (visCount > 1) { ctx.fill(); ctx.stroke(); }
  }
}

function drawAirports() {
  if (!W.layers.airports) return;
  const { ctx } = W;
  const now = Date.now() / 1000;
  const r = _globeR;

  for (const ap of AIRPORTS) {
    const p = project3D(ap.lat, ap.lon, r + 1);
    if (!p.front) continue;

    const alpha = 0.5 + p.z / (r * 1.5) * 0.5;
    const isHub = ap.hub;

    if (isHub) {
      // Radar ring animatie voor hubs
      const pulse = (Math.sin(now * 1.8 + ap.lat) + 1) / 2;
      ctx.strokeStyle = `rgba(250,204,21,${0.4 + pulse * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(250,204,21,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = `bold 9px ${getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'}`;
      ctx.fillStyle = `rgba(250,204,21,${alpha * 0.9})`;
      ctx.fillText(ap.code, p.x + 6, p.y - 4);
    } else {
      ctx.fillStyle = `rgba(148,163,184,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFlightTrail(flight) {
  if (!W.layers.trails || flight.trail.length < 2) return;
  const { ctx } = W;

  ctx.beginPath();
  let first = true;
  for (let i = 0; i < flight.trail.length; i++) {
    const [la, lo] = flight.trail[i];
    const p = project3D(la, lo, _globeR + 1);
    const alpha = (i / flight.trail.length) * 0.6;
    if (p.front && p.visible) {
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    } else { first = true; }
  }

  const isSelected = flight === W.followFlight;
  ctx.strokeStyle = isSelected
    ? `rgba(250,204,21,0.6)`
    : hexToRgba(flight.color, 0.4);
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.stroke();
}

function drawFlight(flight, pos) {
  if (!W.layers.flights) return;
  const { ctx } = W;

  const p = project3D(pos[0], pos[1], _globeR + 2);
  if (!p.visible) return;

  flight._screenX = p.x;
  flight._screenY = p.y;
  flight._front   = p.front;

  const alpha = p.front ? 1.0 : 0.25;
  const isSelected = flight === W.followFlight;
  const isHovered  = flight.hovered;

  // Vliegtuig icoontje (driehoekig)
  const size = isSelected ? 7 : (isHovered ? 6 : 4);

  // Richting berekenen op basis van arc delta
  const nextT = Math.min(1, flight.progress + 0.01);
  const nextPos = getPositionOnArc(flight.arc, nextT);
  const pNext = project3D(nextPos[0], nextPos[1], _globeR + 2);
  const angle = Math.atan2(pNext.y - p.y, pNext.x - p.x);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);

  // Vleugels
  ctx.fillStyle = isSelected ? '#facc15' : (isHovered ? '#fff' : flight.color);
  ctx.beginPath();
  // Neus
  ctx.moveTo(size, 0);
  // Rechter vleugel
  ctx.lineTo(-size * 0.4, size * 1.1);
  // Staart rechts
  ctx.lineTo(-size * 0.6, size * 0.3);
  // Romp achter
  ctx.lineTo(-size, 0);
  // Staart links
  ctx.lineTo(-size * 0.6, -size * 0.3);
  // Linker vleugel
  ctx.lineTo(-size * 0.4, -size * 1.1);
  ctx.closePath();
  ctx.fill();

  if (isSelected || isHovered) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

function drawFlightArcPreview(flight) {
  if (flight !== W.followFlight && !flight.hovered) return;
  const { ctx } = W;

  ctx.beginPath();
  let first = true;
  for (let i = 0; i <= flight.arc.length - 1; i++) {
    const [la, lo] = flight.arc[i];
    const p = project3D(la, lo, _globeR + 1);
    if (p.visible) {
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    } else first = true;
  }
  ctx.strokeStyle = flight === W.followFlight
    ? 'rgba(250,204,21,0.35)'
    : hexToRgba(flight.color, 0.25);
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ═══════════════════════════════════════════════════════
//  SIMULATIE UPDATE
// ═══════════════════════════════════════════════════════
function updateSimulation(dt) {
  if (W.paused) return;

  // WASM tick
  if (W.wasm) {
    W.tick = W.wasm.update(Math.round(dt), W.speed) || W.tick + 1;
  } else {
    W.tick++;
  }

  const dtSim = dt * W.speed;

  for (const f of W.flights) {
    // Voortgang
    f.progress += f.progressRate * dtSim;
    if (f.progress >= 1) {
      // Vlucht geland → reset naar begin
      f.progress = 0;
      f.trail = [];
    }

    // Positie
    const pos = getPositionOnArc(f.arc, f.progress);

    // Trail
    f.trail.push(pos);
    if (f.trail.length > f.trailMaxLen) f.trail.shift();
  }

  // Camera follow
  if (W.followFlight) {
    const pos = getPositionOnArc(W.followFlight.arc, W.followFlight.progress);
    const tLon = pos[1] * Math.PI / 180;
    const tLat = -pos[0] * Math.PI / 180;
    W.targetRotY += ((-tLon) - W.targetRotY) * 0.03;
    W.targetRotX += (tLat - W.targetRotX) * 0.03;
  } else if (W.autoRotate && !W.isDragging) {
    W.targetRotY += W.autoRotateSpeed * dtSim * W.speed;
  }
}

// ═══════════════════════════════════════════════════════
//  HOOFD RENDER LOOP
// ═══════════════════════════════════════════════════════
function render(now) {
  requestAnimationFrame(render);

  const dt = Math.min(100, now - (W.lastFrame || now));
  W.lastFrame = now;

  // FPS
  W.fpsCount++;
  if (now - W.fpsLast >= 1000) {
    W.fps = W.fpsCount;
    W.fpsCount = 0;
    W.fpsLast = now;
    document.getElementById('hud-fps').textContent = `${W.fps} fps`;
  }

  // Camera smooth
  W.rotY += (W.targetRotY - W.rotY) * 0.1;
  W.rotX += (W.targetRotX - W.rotX) * 0.1;
  W.zoom += (W.targetZoom  - W.zoom)  * 0.12;

  // Simulatie
  updateSimulation(dt);

  // HUD update
  document.getElementById('hud-tick').textContent = W.tick;
  if (W.wasm) {
    document.getElementById('hud-flights').textContent = W.wasm.get_stat(6);
    document.getElementById('hud-pax').textContent     = Number(W.wasm.get_stat(9)).toLocaleString('nl-NL');
  }

  // Tekenen
  const { ctx, w, h } = W;
  ctx.clearRect(0, 0, w, h);

  drawBackground();
  drawAtmosphere();
  drawGlobe();
  drawGrid();
  drawContinents();
  drawAirports();

  // Sporen (achter vliegtuigen)
  for (const f of W.flights) {
    drawFlightTrail(f);
  }
  // Route preview (geselecteerd / hover)
  for (const f of W.flights) {
    if (f === W.followFlight || f.hovered) drawFlightArcPreview(f);
  }
  // Vliegtuigen
  for (const f of W.flights) {
    const pos = getPositionOnArc(f.arc, f.progress);
    drawFlight(f, pos);
  }
}

// ═══════════════════════════════════════════════════════
//  INTERACTIE
// ═══════════════════════════════════════════════════════
function setupInteraction() {
  const canvas = W.canvas;

  // Muis
  canvas.addEventListener('mousedown', e => {
    W.isDragging = true;
    W.autoRotate = false;
    W.lastX = e.clientX; W.lastY = e.clientY;
    W.velX = 0; W.velY = 0;
  });

  window.addEventListener('mousemove', e => {
    if (W.isDragging) {
      const dx = e.clientX - W.lastX, dy = e.clientY - W.lastY;
      W.targetRotY += dx * 0.005;
      W.targetRotX = Math.max(-1.3, Math.min(1.3, W.targetRotX + dy * 0.005));
      W.velX = dx * 0.005; W.velY = dy * 0.005;
      W.lastX = e.clientX; W.lastY = e.clientY;
    } else {
      checkHover(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', e => {
    if (W.isDragging) {
      W.isDragging = false;
      const movedDist = Math.hypot(W.velX, W.velY);
      if (movedDist < 0.005) handleClick(e.clientX, e.clientY);
    }
  });

  // Touch
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      W.isDragging = true;
      W.autoRotate = false;
      W.lastX = e.touches[0].clientX;
      W.lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (W.isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - W.lastX;
      const dy = e.touches[0].clientY - W.lastY;
      W.targetRotY += dx * 0.005;
      W.targetRotX = Math.max(-1.3, Math.min(1.3, W.targetRotX + dy * 0.005));
      W.lastX = e.touches[0].clientX;
      W.lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', e => { W.isDragging = false; });

  // Zoom
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    W.targetZoom = Math.max(0.55, Math.min(3.0, W.targetZoom - e.deltaY * 0.001));
  }, { passive: false });
}

function findFlightAt(cx, cy) {
  let best = null, bestD = 18;
  for (const f of W.flights) {
    if (!f._front) continue;
    const d = Math.hypot((f._screenX || -999) - cx, (f._screenY || -999) - cy);
    if (d < bestD) { bestD = d; best = f; }
  }
  return best;
}

function checkHover(mx, my) {
  const hit = findFlightAt(mx, my);
  for (const f of W.flights) f.hovered = false;
  const tt = document.getElementById('tooltip');

  if (hit) {
    hit.hovered = true;
    const pct = (hit.progress * 100).toFixed(0);
    document.getElementById('tt-route').textContent   = hit.callsign;
    document.getElementById('tt-airline').textContent = `${hit.airline.name} · ${hit.aircraft}`;
    document.getElementById('tt-from').textContent    = hit.origin.code;
    document.getElementById('tt-to').textContent      = hit.dest.code;
    document.getElementById('tt-alt').textContent     = `${Number(hit.altitude).toLocaleString('nl-NL')} m`;
    document.getElementById('tt-spd').textContent     = `${hit.speedKmh} km/h`;
    document.getElementById('tt-pct').textContent     = `${pct}%`;
    document.getElementById('tt-bar').style.width     = `${pct}%`;

    const tx = Math.min(W.w - 220, mx + 15);
    const ty = Math.min(W.h - 180, my - 10);
    tt.style.left = tx + 'px';
    tt.style.top  = ty + 'px';
    tt.classList.add('show');
    canvas.style.cursor = 'pointer';
  } else {
    tt.classList.remove('show');
    W.canvas.style.cursor = W.isDragging ? 'grabbing' : 'grab';
  }
}

function handleClick(mx, my) {
  const hit = findFlightAt(mx, my);
  if (hit) {
    W.followFlight = (W.followFlight === hit) ? null : hit;
    updateFlightPanel();
  } else {
    W.followFlight = null;
    W.autoRotate = true;
    updateFlightPanel();
  }
}

// ═══════════════════════════════════════════════════════
//  VLUCHT PANEL UI
// ═══════════════════════════════════════════════════════
function buildFlightPanel() {
  const list = document.getElementById('flight-list');
  list.innerHTML = '';

  for (const f of W.flights) {
    const item = document.createElement('div');
    item.className = 'flight-item';
    item.dataset.id = f.id;

    const pct = (f.progress * 100).toFixed(0);
    item.innerHTML = `
      <span class="fi-icon">✈</span>
      <div class="fi-info">
        <div class="fi-route" style="color:${f.color}">${f.callsign} · ${f.origin.code}→${f.dest.code}</div>
        <div class="fi-label">${f.airline.name} · ${f.aircraft}</div>
      </div>
      <span class="fi-prog" id="fp-pct-${f.id}">${pct}%</span>
    `;

    item.addEventListener('click', () => {
      W.followFlight = (W.followFlight === f) ? null : f;
      updateFlightPanel();
    });

    list.appendChild(item);
    f._listItem = item;
  }
}

function updateFlightPanel() {
  for (const f of W.flights) {
    if (!f._listItem) continue;
    f._listItem.classList.toggle('active', f === W.followFlight);

    const pctEl = document.getElementById(`fp-pct-${f.id}`);
    if (pctEl) pctEl.textContent = `${(f.progress * 100).toFixed(0)}%`;
  }

  // Follow knop tekst
  const btn = document.getElementById('btn-follow');
  if (btn) btn.textContent = W.followFlight ? '📍 Stop volgen' : '📍 Volg vlucht';
}

// Periodiek panel updaten (niet elke frame)
setInterval(updateFlightPanel, 500);

// ═══════════════════════════════════════════════════════
//  CONTROLS KNOPPEN
// ═══════════════════════════════════════════════════════
function setupControls() {
  // Layers
  for (const btn of document.querySelectorAll('[data-layer]')) {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      W.layers[layer] = !W.layers[layer];
      btn.classList.toggle('active', W.layers[layer]);
    });
  }

  // Snelheid
  for (const btn of document.querySelectorAll('[data-speed]')) {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      W.speed = parseInt(btn.dataset.speed, 10);
      W.paused = false;
      document.getElementById('btn-pause').classList.remove('active');
    });
  }

  document.getElementById('btn-pause').addEventListener('click', () => {
    W.paused = !W.paused;
    document.getElementById('btn-pause').classList.toggle('active', W.paused);
    document.getElementById('btn-pause').textContent = W.paused ? '▶' : '⏸';
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    W.targetRotY = 0.4; W.targetRotX = 0.3; W.targetZoom = 1.0;
    W.followFlight = null;
    W.autoRotate = true;
    updateFlightPanel();
  });

  document.getElementById('btn-follow').addEventListener('click', () => {
    if (W.followFlight) {
      W.followFlight = null;
      W.autoRotate = true;
    } else {
      // Volg willekeurig een zichtbaar vliegtuig
      const front = W.flights.filter(f => f._front);
      if (front.length) {
        W.followFlight = front[Math.floor(Math.random() * front.length)];
        W.autoRotate = false;
      }
    }
    updateFlightPanel();
  });

  // Header knoppen
  document.getElementById('btn-refresh').addEventListener('click', () => checkVersion(false));

  // Update banner
  document.getElementById('btn-apply-upd').addEventListener('click', applyUpdate);
  document.getElementById('btn-dismiss-upd').addEventListener('click', () => {
    document.getElementById('update-banner').classList.remove('show');
  });
}

// ═══════════════════════════════════════════════════════
//  HULPFUNCTIES
// ═══════════════════════════════════════════════════════
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ═══════════════════════════════════════════════════════
//  INITIALISATIE
// ═══════════════════════════════════════════════════════
async function init() {
  W.canvas = document.getElementById('canvas');
  W.ctx    = W.canvas.getContext('2d');

  resize();
  window.addEventListener('resize', () => { W._stars = null; resize(); });

  // Genereer vluchten
  W.flights = generateFlights(CFG.flightCount);
  console.log(`[PetersWorld] ${W.flights.length} vluchten gegenereerd over ${AIRPORTS.length} luchthavens.`);

  // WASM laden
  await loadWasm();

  // Versie check
  await checkVersion(true);
  setInterval(() => checkVersion(false), CFG.pollMs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkVersion(false);
  });

  // Service Worker
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // UI
  setupInteraction();
  setupControls();
  buildFlightPanel();

  // Start render loop
  requestAnimationFrame(render);

  console.log('[PetersWorld] ✈  Klaar voor vlucht!');
}

document.addEventListener('DOMContentLoaded', init);
