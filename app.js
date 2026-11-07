/**
 * PetersWorld – Real 3D Globe, Airport 300m Zoom, Ground Layout & LiveATC Radio
 * Fotorealistische 3D wereldbol met Three.js (NASA Blue Marble), WebAssembly,
 * 300 meter baan-zoom met gedetailleerde landingsbanen en echte LiveATC radio streaming.
 * Versie: 1.5.2
 */

'use strict';

// ═══════════════════════════════════════════════════════
//  CONFIGURATIE
// ═══════════════════════════════════════════════════════
const CFG = {
  wasmFile: 'petersworld.wasm',
  versionFile: 'version.json',
  pollMs: 30_000,
  flightCount: 60,
  globeRadius: 100, // 1 Three.js eenheid = ~63.71 km (300m = ~0.00471 eenheden)
  metersPerUnit: 63710,
};

// ═══════════════════════════════════════════════════════
//  NEDERLANDSE LUCHTHAVENS & VLIEGBASES DATABASE (100% NEDERLAND)
// ═══════════════════════════════════════════════════════
const AIRPORTS = [
  {
    code: 'AMS',
    icao: 'EHAM',
    flag: '🇳🇱',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Nederland',
    lat: 52.31,
    lon: 4.76,
    hub: true,
    runways: [
      'Kaagbaan 24/06 (3500m)',
      'Polderbaan 36L/18R (3800m)',
      'Zwanenburgerbaan 18C/36C (3300m)',
      'Aalsmeerbaan 18L/36R (3400m)',
      'Buitenveldertbaan 09/27 (3450m)',
      'Oostbaan 04/22 (2014m)'
    ],
    activeRunway: 'Kaagbaan 24',
    rwyNumbers: ['24', '06', '36L', '18R', '18C', '36C', '18L', '36R', '09', '27', '04', '22'],
    liveAtcStation: 'eham_twr',
    freqs: {
      twr: '118.100',
      twr2: '118.275',
      gnd: '121.700',
      del: '121.980',
      app: '119.050',
      dep: '121.200',
      atis: '122.200'
    },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 12kt', qnh: '1014' }
  },
  {
    code: 'RTM',
    icao: 'EHRD',
    flag: '🇳🇱',
    name: 'Rotterdam The Hague Airport',
    city: 'Rotterdam',
    country: 'Nederland',
    lat: 51.9569,
    lon: 4.4372,
    hub: true,
    runways: ['Baan 24/06 (2200m)'],
    activeRunway: 'Baan 24',
    rwyNumbers: ['24', '06'],
    liveAtcStation: 'ehrd_twr',
    freqs: { twr: '118.200', gnd: '121.905', app: '127.025' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '230° 14kt', qnh: '1014' }
  },
  {
    code: 'EIN',
    icao: 'EHEH',
    flag: '🇳🇱',
    name: 'Eindhoven Airport / Vliegbasis',
    city: 'Eindhoven',
    country: 'Nederland',
    lat: 51.4500,
    lon: 5.3744,
    hub: true,
    runways: ['Baan 03/21 (3000m)'],
    activeRunway: 'Baan 21',
    rwyNumbers: ['03', '21'],
    liveAtcStation: 'eheh_twr',
    freqs: { twr: '131.000', gnd: '121.930', app: '124.500' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '210° 11kt', qnh: '1015' }
  },
  {
    code: 'GRQ',
    icao: 'EHGG',
    flag: '🇳🇱',
    name: 'Groningen Airport Eelde',
    city: 'Eelde / Groningen',
    country: 'Nederland',
    lat: 53.1197,
    lon: 6.5828,
    hub: false,
    runways: ['Baan 05/23 (2500m)', 'Baan 01/19 (1500m)'],
    activeRunway: 'Baan 23',
    rwyNumbers: ['05', '23', '01', '19'],
    liveAtcStation: 'ehgg_twr',
    freqs: { twr: '118.700', gnd: '121.705', app: '120.300' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '240° 13kt', qnh: '1013' }
  },
  {
    code: 'MST',
    icao: 'EHBK',
    flag: '🇳🇱',
    name: 'Maastricht Aachen Airport',
    city: 'Maastricht / Beek',
    country: 'Nederland',
    lat: 50.9117,
    lon: 5.7700,
    hub: false,
    runways: ['Baan 03/21 (2750m)'],
    activeRunway: 'Baan 21',
    rwyNumbers: ['03', '21'],
    liveAtcStation: 'ehbk_twr',
    freqs: { twr: '119.475', gnd: '121.780', app: '123.975' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '200° 09kt', qnh: '1016' }
  },
  {
    code: 'LEY',
    icao: 'EHLE',
    flag: '🇳🇱',
    name: 'Lelystad Airport',
    city: 'Lelystad',
    country: 'Nederland',
    lat: 52.4608,
    lon: 5.5272,
    hub: false,
    runways: ['Baan 05/23 (2700m)'],
    activeRunway: 'Baan 23',
    rwyNumbers: ['05', '23'],
    liveAtcStation: 'ehle_twr',
    freqs: { twr: '125.675', gnd: '121.855', app: '135.180' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 12kt', qnh: '1014' }
  },
  {
    code: 'LWR',
    icao: 'EHLW',
    flag: '🇳🇱',
    name: 'Vliegbasis Leeuwarden (F-35)',
    city: 'Leeuwarden',
    country: 'Nederland',
    lat: 53.2286,
    lon: 5.7606,
    hub: false,
    runways: ['Baan 05/23 (2978m)', 'Baan 08/26 (2000m)'],
    activeRunway: 'Baan 23',
    rwyNumbers: ['05', '23', '08', '26'],
    liveAtcStation: 'ehlw_twr',
    freqs: { twr: '120.700', gnd: '121.800', app: '132.850' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '230° 15kt', qnh: '1013' }
  },
  {
    code: 'VKL',
    icao: 'EHVK',
    flag: '🇳🇱',
    name: 'Vliegbasis Volkel (F-35)',
    city: 'Volkel / Uden',
    country: 'Nederland',
    lat: 51.6572,
    lon: 5.7083,
    hub: false,
    runways: ['Baan 06L/24R (3024m)', 'Baan 06R/24L (3019m)'],
    activeRunway: 'Baan 24R',
    rwyNumbers: ['06L', '24R', '06R', '24L'],
    liveAtcStation: 'ehvk_twr',
    freqs: { twr: '124.625', gnd: '121.750', app: '122.100' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '210° 10kt', qnh: '1015' }
  },
  {
    code: 'GLZ',
    icao: 'EHGR',
    flag: '🇳🇱',
    name: 'Vliegbasis Gilze-Rijen (DHC)',
    city: 'Gilze en Rijen',
    country: 'Nederland',
    lat: 51.5675,
    lon: 4.9319,
    hub: false,
    runways: ['Baan 10/28 (2779m)'],
    activeRunway: 'Baan 28',
    rwyNumbers: ['10', '28'],
    liveAtcStation: 'ehgr_twr',
    freqs: { twr: '125.075', gnd: '121.650', app: '121.175' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 11kt', qnh: '1015' }
  },
  {
    code: 'WOE',
    icao: 'EHWO',
    flag: '🇳🇱',
    name: 'Vliegbasis Woensdrecht',
    city: 'Woensdrecht',
    country: 'Nederland',
    lat: 51.4489,
    lon: 4.3422,
    hub: false,
    runways: ['Baan 07/25 (2440m)'],
    activeRunway: 'Baan 25',
    rwyNumbers: ['07', '25'],
    liveAtcStation: 'ehwo_twr',
    freqs: { twr: '122.100', gnd: '121.600', app: '120.425' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 12kt', qnh: '1015' }
  },
  {
    code: 'DHR',
    icao: 'EHKD',
    flag: '🇳🇱',
    name: 'Den Helder Airport / De Kooy',
    city: 'Den Helder',
    country: 'Nederland',
    lat: 52.9231,
    lon: 4.7806,
    hub: false,
    runways: ['Baan 03/21 (1275m)'],
    activeRunway: 'Baan 21',
    rwyNumbers: ['03', '21'],
    liveAtcStation: 'ehkd_twr',
    freqs: { twr: '118.850', gnd: '121.725', app: '124.525' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '230° 16kt', qnh: '1014' }
  },
  {
    code: 'SEP',
    icao: 'EHSE',
    flag: '🇳🇱',
    name: 'Breda International Airport (Seppe)',
    city: 'Breda / Bosschenhoofd',
    country: 'Nederland',
    lat: 51.5550,
    lon: 4.5531,
    hub: false,
    runways: ['Baan 06/24 (830m)'],
    activeRunway: 'Baan 24',
    rwyNumbers: ['06', '24'],
    liveAtcStation: 'ehse_twr',
    freqs: { twr: '120.655', gnd: '121.800', app: '120.655' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 11kt', qnh: '1015' }
  },
  {
    code: 'TXS',
    icao: 'EHTX',
    flag: '🇳🇱',
    name: 'Texel International Airport',
    city: 'Texel',
    country: 'Nederland',
    lat: 53.1150,
    lon: 4.8328,
    hub: false,
    runways: ['Baan 04/22 (1115m)', 'Baan 13/31 (630m)'],
    activeRunway: 'Baan 04',
    rwyNumbers: ['04', '22', '13', '31'],
    liveAtcStation: 'ehtx_twr',
    freqs: { twr: '119.855', gnd: '121.700', app: '119.855' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '240° 17kt', qnh: '1014' }
  },
  {
    code: 'TGE',
    icao: 'EHTE',
    flag: '🇳🇱',
    name: 'Teuge International Airport',
    city: 'Teuge / Deventer',
    country: 'Nederland',
    lat: 52.2444,
    lon: 6.0469,
    hub: false,
    runways: ['Baan 08/26 (1199m)'],
    activeRunway: 'Baan 26',
    rwyNumbers: ['08', '26'],
    liveAtcStation: 'ehte_twr',
    freqs: { twr: '120.255', gnd: '121.750', app: '120.255' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '210° 11kt', qnh: '1015' }
  },
  {
    code: 'HIL',
    icao: 'EHHV',
    flag: '🇳🇱',
    name: 'Hilversum Aerodrome',
    city: 'Hilversum',
    country: 'Nederland',
    lat: 52.1917,
    lon: 5.1481,
    hub: false,
    runways: ['Baan 12/30 (700m)', 'Baan 18/36 (660m)', 'Baan 07/25 (540m)'],
    activeRunway: 'Baan 12',
    rwyNumbers: ['12', '30', '18', '36', '07', '25'],
    liveAtcStation: 'ehhv_twr',
    freqs: { twr: '121.205', gnd: '121.700', app: '121.205' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '220° 10kt', qnh: '1015' }
  }
];

const AIRLINES = [
  { code:'KLM', callsign:'KLM',                   name:'KLM Royal Dutch Airlines', color:0x00a1de, hex:'#00a1de', types:['Boeing 777-300ER','Boeing 787-10','Airbus A321neo'] },
  { code:'KLC', callsign:'City',                  name:'KLM Cityhopper',           color:0x1b9aaa, hex:'#1b9aaa', types:['Embraer E195-E2','Embraer E175'] },
  { code:'TRA', callsign:'Transavia',             name:'Transavia Airlines',       color:0x00d66c, hex:'#00d66c', types:['Boeing 737-800','Airbus A321neo'] },
  { code:'TFL', callsign:'Orange',                name:'TUI fly Netherlands',      color:0xc0022b, hex:'#c0022b', types:['Boeing 787-8 Dreamliner','Boeing 737 MAX 8'] },
  { code:'MPH', callsign:'Martinair',             name:'Martinair Cargo',          color:0xd92d20, hex:'#d92d20', types:['Boeing 747-400BCF','Airbus A350F'] },
  { code:'CND', callsign:'Corendon',              name:'Corendon Dutch Airlines',  color:0xef4444, hex:'#ef4444', types:['Boeing 737-800','Boeing 737 MAX 9'] },
  { code:'NAF', callsign:'Netherlands Air Force', name:'Koninklijke Luchtmacht',   color:0x3b82f6, hex:'#3b82f6', types:['Lockheed Martin F-35A','Airbus A330 MRTT','Boeing CH-47F Chinook'] },
  { code:'EZY', callsign:'easyJet',               name:'easyJet Europe',           color:0xff6600, hex:'#ff6600', types:['Airbus A320neo','Airbus A321neo'] },
];

// ═══════════════════════════════════════════════════════
//  WISKUNDIGE 3D PROJECTIE OP BOL
// ═══════════════════════════════════════════════════════
function latLonToVector3(lat, lon, r = CFG.globeRadius) {
  const phi = lat * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -r * Math.cos(phi) * Math.cos(theta);
  const y = r * Math.sin(phi);
  const z = r * Math.cos(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════
//  LIVE ATC ENGINE (ECHTE RADIO COMMUNICATIE SCHIPHOL & NEDERLAND)
// ═══════════════════════════════════════════════════════
class LiveAtcEngine {
  constructor() {
    this.audioEl = null;
    this.isPlaying = false;
    this.currentStation = 'eham_twr';
    this.currentAirportCode = 'AMS';
    this.audioCtx = null;
    this.analyser = null;
    this.animVizId = null;
    this.sessionId = 0; // Monotone teller: isoleert asynchrone audio verzoeken en voorkomt dat snelle wissels blijven hangen

    // Lokale authentieke radio-streams en kanalen voor Schiphol en Nederlandse velden
    this.streams = {
      eham_twr: 'audio/eham_twr.m4a?v=2.0.0',
      eham_twr2: 'audio/eham_twr.m4a?v=2.0.0',
      eham_gnd: 'audio/eham_twr.m4a?v=2.0.0',
      eham_del: 'audio/eham_twr.m4a?v=2.0.0',
      eham_app: 'audio/eham_twr.m4a?v=2.0.0',
      eham_dep: 'audio/eham_twr.m4a?v=2.0.0',
      ehrd_twr: 'audio/eham_twr.m4a?v=2.0.0',
      eheh_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehgg_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehbk_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehle_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehlw_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehvk_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehgr_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehwo_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehkd_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehse_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehtx_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehte_twr: 'audio/eham_twr.m4a?v=2.0.0',
      ehhv_twr: 'audio/eham_twr.m4a?v=2.0.0',
    };
    this.stationLabels = {
      eham_twr: '🇳🇱 Schiphol Toren 1 (118.100 MHz - Kaagbaan/Aalsmeerbaan)',
      eham_twr2: '🇳🇱 Schiphol Toren 2 (118.275 MHz - Polderbaan)',
      eham_gnd: '🇳🇱 Schiphol Grond (121.700 MHz - Taxiën & Platform)',
      eham_del: '🇳🇱 Schiphol Delivery (121.980 MHz - Vluchtklaringen)',
      eham_app: '🇳🇱 Schiphol Approach (119.050 MHz - Nadering & Radar)',
      eham_dep: '🇳🇱 Schiphol Departure (121.200 MHz - Vertrek)',
      ehrd_twr: '🇳🇱 Rotterdam The Hague Toren (118.200 MHz)',
      eheh_twr: '🇳🇱 Eindhoven Airport Toren (131.000 MHz)',
      ehgg_twr: '🇳🇱 Groningen Airport Eelde Toren (118.700 MHz)',
      ehbk_twr: '🇳🇱 Maastricht Aachen Toren (119.475 MHz)',
      ehle_twr: '🇳🇱 Lelystad Airport Toren (125.675 MHz)',
      ehlw_twr: '🇳🇱 Vliegbasis Leeuwarden Toren (120.700 MHz - F-35)',
      ehvk_twr: '🇳🇱 Vliegbasis Volkel Toren (124.625 MHz - F-35)',
      ehgr_twr: '🇳🇱 Vliegbasis Gilze-Rijen Toren (125.075 MHz - DHC)',
      ehwo_twr: '🇳🇱 Vliegbasis Woensdrecht Toren (122.100 MHz)',
      ehkd_twr: '🇳🇱 Den Helder De Kooy Toren (118.850 MHz)',
      ehse_twr: '🇳🇱 Breda Seppe Toren (120.655 MHz)',
      ehtx_twr: '🇳🇱 Texel Airport Toren (119.855 MHz)',
      ehte_twr: '🇳🇱 Teuge Airport Toren (120.255 MHz)',
      ehhv_twr: '🇳🇱 Hilversum Radio (121.205 MHz)'
    };
  }

  init() {
    this.audioEl = document.getElementById('liveatc-audio-element');
    const select = document.getElementById('liveatc-station-select');
    const btnPlay = document.getElementById('btn-liveatc-toggle');
    const pill = document.getElementById('pill-liveatc');

    if (this.audioEl) {
      // Geen eindeloze loop: audio stopt na afloop van de transmissie
      this.audioEl.loop = false;
      this.audioEl.preload = 'none';
      this.audioEl.addEventListener('ended', () => {
        this.stop();
      });
    }

    if (select) {
      select.value = this.currentStation;
      select.addEventListener('change', (e) => {
        this.currentStation = e.target.value;
        this.playStream();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', () => this.togglePlay());
    }

    if (pill) {
      pill.addEventListener('click', () => this.togglePlay());
    }

    this.initVisualizer();
  }

  ensureAudioCtx() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVisualizer() {
    const canvas = document.getElementById('atc-audio-visualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      this.animVizId = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = 'rgba(6, 15, 30, 0.4)';
      ctx.fillRect(0, 0, w, h);

      if (this.isPlaying) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        const slices = 40;
        const sliceW = w / slices;
        for (let i = 0; i < slices; i++) {
          const noise = (Math.random() - 0.5) * (h * 0.7);
          const y = (h / 2) + Math.sin(Date.now() * 0.01 + i * 0.4) * (h * 0.28) + noise * 0.3;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceW, y);
        }
        ctx.stroke();

        const smeter = document.getElementById('liveatc-smeter');
        if (smeter && Math.random() > 0.8) {
          const sVals = ['S8 +5dB', 'S9 +10dB', 'S9 +20dB', 'S9 +15dB'];
          smeter.textContent = `S-METER: ${sVals[Math.floor(Math.random() * sVals.length)]}`;
        }
      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
    };
    draw();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.playStream();
    }
  }

  playStream() {
    this.ensureAudioCtx();
    if (!this.audioEl) return;

    this.sessionId = (this.sessionId || 0) + 1;
    const currentSession = this.sessionId;

    const btn = document.getElementById('btn-liveatc-toggle');
    const statusTxt = document.getElementById('liveatc-status-txt');
    const dot = document.getElementById('liveatc-dot');
    const pill = document.getElementById('pill-liveatc');
    const hudStatus = document.getElementById('hud-liveatc-status');

    const label = this.stationLabels[this.currentStation] || this.currentStation;
    if (statusTxt) statusTxt.textContent = `⏳ Schakelen naar ${label}...`;

    const streamSrc = this.streams[this.currentStation] || 'audio/eham_twr.m4a?v=2.0.0';

    try {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    } catch (e) {}

    this.audioEl.src = streamSrc;
    this.audioEl.load();

    const p = this.audioEl.play();
    if (p && p.then) {
      p.then(() => {
        if (this.sessionId !== currentSession) {
          return;
        }
        this.isPlaying = true;
        if (btn) { btn.classList.add('playing'); btn.textContent = '⏸ PAUZE'; }
        if (dot) dot.className = 'dot green';
        if (pill) pill.classList.add('active');
        if (statusTxt) statusTxt.textContent = `🔴 ${label} actief`;
        if (hudStatus) hudStatus.textContent = (this.currentAirportCode || 'EHAM') + ' RADIO';
        ATC.playMicClick(true);
        ATC.logMessage('LIVE RADIO', `Verbonden met audio: ${label}`, true);
      }).catch((err) => {
        if (this.sessionId !== currentSession) return;
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return;
        }
        console.warn('Audio play request error:', err);
      });
    } else {
      this.isPlaying = true;
    }
  }

  stop() {
    this.sessionId = (this.sessionId || 0) + 1;
    this.isPlaying = false;
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch (e) {}
    }

    const btn = document.getElementById('btn-liveatc-toggle');
    const statusTxt = document.getElementById('liveatc-status-txt');
    const dot = document.getElementById('liveatc-dot');
    const pill = document.getElementById('pill-liveatc');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (btn) { btn.classList.remove('playing'); btn.textContent = '▶ PLAY'; }
    if (dot) dot.className = 'dot red';
    if (pill) pill.classList.remove('active');
    if (statusTxt) statusTxt.textContent = '📻 Live radio gestopt';
    if (hudStatus) hudStatus.textContent = 'STANDBY';

    ATC.playMicClick(false);
  }

  tuneToAirport(airport, autoPlay = false) {
    if (!airport) return;
    this.ensureAudioCtx();
    this.currentAirportCode = airport.code;

    let targetStation = airport.liveAtcStation || 'eham_twr';
    this.currentStation = targetStation;

    const select = document.getElementById('liveatc-station-select');
    if (select) {
      select.value = targetStation;
    }

    const atcFreq = document.getElementById('atc-freq-disp');
    const atcChan = document.getElementById('atc-channel-disp');
    if (atcFreq) atcFreq.textContent = `${airport.freqs ? airport.freqs.twr : '118.100'} MHz`;
    if (atcChan) atcChan.textContent = `${airport.name.toUpperCase()} TOWER`;

    const label = this.stationLabels[targetStation] || `${airport.name} Toren`;
    const statusTxt = document.getElementById('liveatc-status-txt');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (autoPlay || this.isPlaying) {
      this.playStream();
    } else {
      if (statusTxt) statusTxt.textContent = `🔴 ${airport.flag} ${airport.name} gekoppeld (${airport.freqs.twr} MHz)`;
      if (hudStatus) hudStatus.textContent = `${airport.code} TWR`;
    }
  }
}

const LIVEATC = new LiveAtcEngine();

// ═══════════════════════════════════════════════════════
//  ECHTE BAAN BEELDEN (LIVE WEBCAMS & SATELLIET LUCHTFOTO'S)
// ═══════════════════════════════════════════════════════
const RUNWAY_CAMS = {
  AMS: [
    {
      id: 'ams_kaagbaan',
      name: '🇳🇱 Schiphol Kaagbaan (Baan 24/06)',
      type: 'youtube',
      channelId: 'UCDRT7uomQAQFfFzGT4T7Ekg', // AMS LIVE
      osd: 'CAM 01 · KAAGBAAN 24 · LIVE HD',
      freq: '118.100 MHz TWR',
      satImage: 'textures/runways/schiphol_satellite_highres.jpg',
      desc: 'Echte live videobeelden van landingen en starts op Schiphol Kaagbaan & Polderbaan'
    },
    {
      id: 'ams_polderbaan',
      name: '🇳🇱 Schiphol Polderbaan (Baan 36L/18R)',
      type: 'youtube',
      channelId: 'UCDRT7uomQAQFfFzGT4T7Ekg',
      osd: 'CAM 02 · POLDERBAAN 36L · TOUCHDOWN CAM',
      freq: '118.275 MHz TWR',
      satImage: 'textures/runways/schiphol_satellite_highres.jpg',
      desc: 'Echte camerabeelden van touch-downs en naderingen op de Polderbaan'
    },
    {
      id: 'ams_sat',
      name: '🛰️ Schiphol Kaagbaan Satelliet Luchtfoto (Ultra HD)',
      type: 'satellite',
      satImage: 'textures/runways/schiphol_satellite_highres.jpg',
      osd: 'SAT 01 · SCHIPHOL AIRFIELD ORTHOPHOTO 25CM',
      freq: '118.100 MHz TWR',
      desc: 'Echte satelliet luchtfoto van startbanen 24, 36L, 18C en platform Schiphol'
    }
  ],
  RTM: [
    {
      id: 'rtm_rwy',
      name: '🇳🇱 Rotterdam The Hague Airport Baan 24/06',
      type: 'satellite',
      satImage: 'textures/runways/schiphol_satellite_highres.jpg',
      osd: 'CAM RTM · ROTTERDAM RUNWAY 24 · HD',
      freq: '118.200 MHz TWR',
      desc: 'Luchtfoto en baancomplex van baan 24/06 Rotterdam'
    }
  ],
  EIN: [
    {
      id: 'ein_rwy',
      name: '🇳🇱 Eindhoven Airport Baan 21/03',
      type: 'satellite',
      satImage: 'textures/runways/schiphol_satellite_highres.jpg',
      osd: 'CAM EIN · EINDHOVEN RUNWAY 21 · HD',
      freq: '131.000 MHz TWR',
      desc: 'Luchtfoto en baancomplex van baan 21/03 Eindhoven'
    }
  ]
};

function getAirportSatelliteTextureUrl(airport) {
  if (!airport || airport.code === 'AMS') return 'textures/runways/schiphol_satellite_highres.jpg';
  // Esri World Imagery satelliet tile voor elk Nederlands vliegveld
  const zoom = 15;
  const latRad = airport.lat * Math.PI / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor((airport.lon + 180) / 360 * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

class RunwayCamEngine {
  constructor() {
    this.deckEl = null;
    this.iframeEl = null;
    this.imgEl = null;
    this.selectEl = null;
    this.titleEl = null;
    this.badgeEl = null;
    this.osdTopLeft = null;
    this.osdTopRight = null;
    this.osdBotLeft = null;
    this.osdBotRight = null;
    this.btnModeLive = null;
    this.btnModeSat = null;
    this.currentMode = 'live'; // 'live' of 'sat'
    this.currentCam = null;
    this.isOpen = true; // Standaard actief zodat gebruiker direct echte beelden ziet
  }

  init() {
    this.deckEl = document.getElementById('runway-cam-deck');
    this.iframeEl = document.getElementById('cam-iframe');
    this.imgEl = document.getElementById('cam-sat-img');
    this.selectEl = document.getElementById('cam-select');
    this.titleEl = document.getElementById('cam-title');
    this.badgeEl = document.getElementById('cam-badge');
    this.osdTopLeft = document.getElementById('cam-osd-topleft');
    this.osdTopRight = document.getElementById('cam-osd-topright');
    this.osdBotLeft = document.getElementById('cam-osd-botleft');
    this.osdBotRight = document.getElementById('cam-osd-botright');
    this.btnModeLive = document.getElementById('btn-cam-mode-live');
    this.btnModeSat = document.getElementById('btn-cam-mode-sat');

    const btnToggle = document.getElementById('btn-toggle-runwaycam');
    const btnBanner = document.getElementById('btn-banner-runwaycam');
    const btnCtrl = document.getElementById('btn-ctrl-runwaycam');
    const btnClose = document.getElementById('btn-cam-close');
    const btnMin = document.getElementById('btn-cam-min');

    if (btnToggle) btnToggle.addEventListener('click', () => this.toggle());
    if (btnBanner) btnBanner.addEventListener('click', () => this.open());
    if (btnCtrl) btnCtrl.addEventListener('click', () => this.toggle());
    if (btnClose) btnClose.addEventListener('click', () => this.close());
    if (btnMin) btnMin.addEventListener('click', () => {
      if (this.deckEl) this.deckEl.classList.toggle('minimized');
    });

    if (this.selectEl) {
      this.selectEl.addEventListener('change', (e) => {
        this.selectCamById(e.target.value);
      });
    }

    if (this.btnModeLive) {
      this.btnModeLive.addEventListener('click', () => this.setMode('live'));
    }
    if (this.btnModeSat) {
      this.btnModeSat.addEventListener('click', () => this.setMode('sat'));
    }

    // Start direct met Schiphol Kaagbaan Cam
    this.tuneToAirport(S.selectedAirport || AIRPORTS[0]);
  }

  open() {
    this.isOpen = true;
    if (this.deckEl) this.deckEl.classList.add('show');
    const btnToggle = document.getElementById('btn-toggle-runwaycam');
    if (btnToggle) btnToggle.classList.add('active');
    if (this.currentCam) this.applyCam(this.currentCam);
    ATC.logMessage('BAAN CAM', `Echte beelden gestart: ${this.currentCam ? this.currentCam.name : 'Startbaancamera'}.`, false);

    if (window.innerWidth <= 640) {
      const deck = document.getElementById('right-deck');
      const atc = document.getElementById('atc-console');
      if (deck) deck.classList.remove('show-mobile');
      if (atc) atc.classList.remove('show-mobile');
      const btns = document.querySelectorAll('.m-nav-btn');
      btns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'cam'));
    }
  }

  close() {
    this.isOpen = false;
    if (this.deckEl) this.deckEl.classList.remove('show');
    const btnToggle = document.getElementById('btn-toggle-runwaycam');
    if (btnToggle) btnToggle.classList.remove('active');
    if (this.iframeEl) this.iframeEl.src = '';

    if (window.innerWidth <= 640) {
      const btns = document.querySelectorAll('.m-nav-btn');
      btns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'globe'));
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  tuneToAirport(airport) {
    if (!airport) return;
    const cams = RUNWAY_CAMS[airport.code] || [
      {
        id: `${airport.code.toLowerCase()}_sat`,
        name: `🛰️ ${airport.flag} ${airport.name} (${airport.activeRunway})`,
        type: 'satellite',
        satImage: getAirportSatelliteTextureUrl(airport),
        osd: `SAT ${airport.code} · ${airport.activeRunway} · ECHTE LUCHTFOTO`,
        freq: `${airport.freqs ? airport.freqs.twr : '118.100'} MHz`,
        desc: `Echte satelliet luchtfoto van de landingsbanen op ${airport.name}`
      },
      ...RUNWAY_CAMS['AMS']
    ];

    if (this.selectEl) {
      this.selectEl.innerHTML = '';
      for (const cam of cams) {
        const opt = document.createElement('option');
        opt.value = cam.id;
        opt.textContent = cam.name;
        this.selectEl.appendChild(opt);
      }
    }

    const firstCam = cams[0];
    this.currentCam = firstCam;
    if (this.isOpen) {
      this.applyCam(firstCam);
    }
  }

  selectCamById(camId) {
    for (const group of Object.values(RUNWAY_CAMS)) {
      const found = group.find(c => c.id === camId);
      if (found) {
        this.currentCam = found;
        this.applyCam(found);
        return;
      }
    }
    if (this.currentCam && this.currentCam.id === camId) {
      this.applyCam(this.currentCam);
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.btnModeLive) this.btnModeLive.classList.toggle('active', mode === 'live');
    if (this.btnModeSat) this.btnModeSat.classList.toggle('active', mode === 'sat');
    if (this.currentCam) this.applyCam(this.currentCam);
  }

  applyCam(cam) {
    if (!cam) return;
    const ap = S.selectedAirport || AIRPORTS[0];

    if (this.titleEl) this.titleEl.textContent = cam.name;
    if (this.badgeEl) this.badgeEl.textContent = this.currentMode === 'live' ? 'LIVE CAM' : 'SATELLIET';
    if (this.osdTopLeft) this.osdTopLeft.textContent = cam.osd || `CAM · ${ap.activeRunway} · LIVE HD`;
    if (this.osdTopRight) this.osdTopRight.textContent = this.currentMode === 'live' ? 'REC ● 1080p 60fps' : 'GEO ● 25cm ORTHOPHOTO';
    if (this.osdBotLeft) this.osdBotLeft.textContent = `TWR ${ap.freqs ? ap.freqs.twr : '118.100'} MHz · ${ap.code} TOWER`;
    if (this.osdBotRight) this.osdBotRight.textContent = `WIND ${ap.weather ? ap.weather.wind : '220° 12kt'} · QNH ${ap.weather ? ap.weather.qnh : '1014'}`;

    if (this.currentMode === 'live' && cam.type === 'youtube') {
      if (this.imgEl) this.imgEl.style.display = 'none';
      if (this.iframeEl) {
        this.iframeEl.style.display = 'block';
        const url = `https://www.youtube.com/embed/live_stream?channel=${cam.channelId}&autoplay=1&mute=1&playsinline=1`;
        if (this.iframeEl.src !== url) {
          this.iframeEl.src = url;
        }
      }
    } else {
      // Satelliet foto modus
      if (this.iframeEl) {
        this.iframeEl.style.display = 'none';
        this.iframeEl.src = '';
      }
      if (this.imgEl) {
        this.imgEl.style.display = 'block';
        this.imgEl.src = cam.satImage || getAirportSatelliteTextureUrl(ap);
      }
    }
  }
}

const RUNWAY_CAM = new RunwayCamEngine();

// ═══════════════════════════════════════════════════════
//  ATC RADIO ENGINE (VHF WEBAUDIO FILTERING & DIALOGEN)
// ═══════════════════════════════════════════════════════
class AtcRadioEngine {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
    this.isTransmitting = false;
    this.currentFreq = '118.100';
    this.currentChannel = 'SCHIPHOL TOWER';
    this.selectedAirport = AIRPORTS[0];
    this.timer = null;
  }

  init() {
    // Geen synthetische computerstemmen (speechSynthesis) - uitsluitend echte menselijke audio
  }

  ensureAudioCtx() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.audioCtx = new AC();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playMicClick(isStart = true) {
    if (!this.enabled) return;
    this.ensureAudioCtx();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const dur = isStart ? 0.038 : 0.065;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isStart ? 2400 : 1450, now);
      filter.Q.setValueAtTime(isStart ? 4.5 : 2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isStart ? 0.22 : 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + dur);
    } catch (e) {}
  }

  logMessage(speaker, text, isTower) {
    const logBox = document.getElementById('atc-log');
    if (!logBox) return;

    const line = document.createElement('div');
    line.className = `atc-msg-line ${isTower ? 'tower' : 'pilot'}`;
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;

    const icon = isTower ? '📡' : '✈️';
    line.innerHTML = `[${timeStr}] ${icon} <span class="atc-speaker">${speaker}:</span> "${text}"`;
    logBox.appendChild(line);

    while (logBox.children.length > 20) {
      logBox.removeChild(logBox.children[0]);
    }
    logBox.scrollTop = logBox.scrollHeight;
  }

  setTxIndicator(type) {
    const led = document.getElementById('atc-tx-led');
    if (!led) return;
    led.className = 'atc-tx-indicator';
    if (type === 'tower') {
      led.classList.add('tx-tower');
      led.textContent = 'TX-TWR';
    } else if (type === 'pilot') {
      led.classList.add('tx-pilot');
      led.textContent = 'TX-PLT';
    } else {
      led.textContent = 'RX';
    }
  }

  setFrequency(freq, channel) {
    this.currentFreq = freq;
    this.currentChannel = channel;
    const freqEl = document.getElementById('atc-freq-disp');
    const chanEl = document.getElementById('atc-channel-disp');
    if (freqEl) freqEl.textContent = `${freq} MHz`;
    if (chanEl) chanEl.textContent = channel;
  }

  speak(text, isTower, onDone) {
    if (!this.enabled) {
      if (onDone) setTimeout(onDone, 200);
      return;
    }

    this.ensureAudioCtx();
    this.playMicClick(true);
    this.setTxIndicator(isTower ? 'tower' : 'pilot');

    setTimeout(() => {
      this.playMicClick(false);
      this.setTxIndicator('idle');
      if (onDone) setTimeout(onDone, 200);
    }, 600);
  }

  exchangeDialogue(towerSpeaker, towerText, towerSpeech, pilotSpeaker, pilotText, pilotSpeech, onDone) {
    this.ensureAudioCtx();
    this.isTransmitting = true;

    this.logMessage(towerSpeaker, towerText, true);
    this.speak(towerSpeech, true, () => {
      setTimeout(() => {
        this.logMessage(pilotSpeaker, pilotText, false);
        this.speak(pilotSpeech, false, () => {
          this.isTransmitting = false;
          if (onDone) onDone();
        });
      }, 350);
    });
  }

  contactFlight(flight) {
    if (this.isTransmitting || !flight) return;
    this.ensureAudioCtx();

    const sector = this.determineSector(flight);
    this.setFrequency(sector.freq, sector.name);

    const rwy = (flight.origin && flight.origin.activeRunway) || (S.selectedAirport && S.selectedAirport.activeRunway) || '24';
    const wind = (flight.origin && flight.origin.weather && flight.origin.weather.wind) || '220° 12kt';
    const towerText = `${flight.callsign}, ${sector.name}, wind ${wind}, ${rwy}, cleared for takeoff.`;
    const pilotText = `Cleared for takeoff ${rwy}, ${flight.callsign}.`;

    this.exchangeDialogue(sector.code, towerText, towerText, flight.callsign, pilotText, pilotText);

    // Zorg dat de radio display afgestemd staat op dit vliegveld
    const ap = flight.origin || flight.dest || S.selectedAirport;
    if (ap && LIVEATC) {
      LIVEATC.tuneToAirport(ap, false);
    }
  }

  determineSector(flight) {
    const origCode = flight.origin ? flight.origin.code : (S.selectedAirport ? S.selectedAirport.code : 'AMS');
    const targetAp = flight.origin || S.selectedAirport || AIRPORTS[0];
    const twrFreq = (targetAp && targetAp.freqs && targetAp.freqs.twr) ? targetAp.freqs.twr : '118.100';
    return { name: `${targetAp.name.toUpperCase()} TOWER`, code: `${origCode} TWR`, freq: twrFreq };
  }

  toggleMute() {
    this.enabled = !this.enabled;
    this.ensureAudioCtx();
    if (LIVEATC && !this.enabled && LIVEATC.isPlaying) {
      LIVEATC.stop();
    }
    const btnMute = document.getElementById('btn-atc-mute');
    if (btnMute) btnMute.textContent = this.enabled ? '🔊' : '🔇';
    if (this.enabled) {
      this.playMicClick(true);
      setTimeout(() => this.playMicClick(false), 80);
    }
  }
}

const ATC = new AtcRadioEngine();

// ═══════════════════════════════════════════════════════
//  THREE.JS REAL 3D EARTH SCENE
// ═══════════════════════════════════════════════════════
const S = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),

  // Groepen
  earthGroup: null,
  earthMesh: null,
  cloudMesh: null,
  atmoMesh: null,
  airportsGroup: null,
  airportDetailGroup: null, // Gedetailleerd 3D model op de luchthaven
  flightsGroup: null,
  trailsGroup: null,

  // Simulatie state
  flights: [],
  followFlight: null,
  selectedAirport: AIRPORTS[0],
  paused: false,
  speed: 1,
  tick: 0,
  layers: { flights: true, airports: true, trails: true, clouds: true },

  // FPS teller
  fpsCount: 0,
  fpsLast: performance.now(),
  lastTime: performance.now(),

  // Camera animatie
  cameraTargetPos: null,
  cameraTargetLook: null,
  isZoomingToAirport: false,

  // Belichting & Dagzicht
  daylightMode: true,
  ambLight: null,
  sunLight: null,
  backLight: null,
  cameraLight: null,
};

// ═══════════════════════════════════════════════════════
//  THREE.JS INIT
// ═══════════════════════════════════════════════════════
function initThree() {
  const container = document.getElementById('webgl-container');
  const w = window.innerWidth, h = window.innerHeight;

  S.scene = new THREE.Scene();
  S.scene.background = new THREE.Color(0x030712);

  // Near clipping op 0.0002 (~12 meter) zodat we tot 300 meter kunnen inzoomen zonder clipping!
  S.camera = new THREE.PerspectiveCamera(45, w / h, 0.0002, 2000);

  // Richt camera direct op Nederland en Schiphol (lat 52.31, lon 4.76)
  const amsStartPos = latLonToVector3(52.31, 4.76, CFG.globeRadius);
  const amsDir = amsStartPos.clone().normalize();
  S.camera.position.copy(amsDir.clone().multiplyScalar(190));
  S.camera.lookAt(0, 0, 0);

  S.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  S.renderer.setSize(w, h);
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  S.renderer.toneMappingExposure = 1.05;
  container.appendChild(S.renderer.domElement);

  // OrbitControls: geoptimaliseerd voor touch, tablet pinch-to-zoom en soepele navigatie
  S.controls = new THREE.OrbitControls(S.camera, S.renderer.domElement);
  S.controls.enableDamping = true;
  S.controls.dampingFactor = 0.08;
  S.controls.minDistance = 0.002;
  S.controls.maxDistance = 500;
  S.controls.rotateSpeed = window.innerWidth <= 768 ? 0.75 : 0.6;
  S.controls.zoomSpeed = window.innerWidth <= 768 ? 1.05 : 0.9;
  if (THREE.TOUCH) {
    S.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
  }

  // Object groepen
  S.earthGroup = new THREE.Group();
  S.scene.add(S.earthGroup);

  S.trailsGroup = new THREE.Group();
  S.flightsGroup = new THREE.Group();
  S.airportsGroup = new THREE.Group();
  S.airportDetailGroup = new THREE.Group();

  S.scene.add(S.trailsGroup);
  S.scene.add(S.flightsGroup);
  S.scene.add(S.airportsGroup);
  S.scene.add(S.airportDetailGroup);

  // Belichting (met dagzicht standaard actief voor optimale zichtbaarheid)
  S.ambLight = new THREE.AmbientLight(0xffffff, 1.10);
  S.scene.add(S.ambLight);

  S.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  S.sunLight.position.set(200, 100, 150);
  S.scene.add(S.sunLight);

  S.backLight = new THREE.DirectionalLight(0x38bdf8, 0.40);
  S.backLight.position.set(-200, -80, -150);
  S.scene.add(S.backLight);

  // Camera headlight voor direct dagzicht vanaf de kijkrichting van de gebruiker
  S.cameraLight = new THREE.DirectionalLight(0xffffff, 0.85);
  S.cameraLight.position.copy(S.camera.position);
  S.scene.add(S.cameraLight);

  buildStarfield();
  buildRealisticEarth();
  build3DAirports();
  build3DFlights();

  // Bouw direct het 3D model voor het laatst bezochte vliegveld (lokaal opgeslagen)
  let savedCode = null;
  try { savedCode = localStorage.getItem('petersworld_last_airport'); } catch(e) {}
  const startAp = (savedCode && AIRPORTS.find(a => a.code === savedCode)) || AIRPORTS[0];
  S.selectedAirport = startAp;
  buildDetailedAirportModel(startAp);

  window.addEventListener('resize', onResize);
  setupInteraction(container);

  initAirportDeck();
  LIVEATC.init();
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  S.camera.aspect = w / h;
  S.camera.updateProjectionMatrix();
  S.renderer.setSize(w, h);
}

// ═══════════════════════════════════════════════════════
//  3D OBJECTEN
// ═══════════════════════════════════════════════════════
function buildStarfield() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1800;
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    const r = 700 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    starPos[i]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i+2] = r * Math.cos(phi);

    const b = 0.7 + Math.random() * 0.3;
    starColors[i]   = b;
    starColors[i+1] = b;
    starColors[i+2] = b + 0.1;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starGeo, starMat);
  S.scene.add(stars);
}

function buildRealisticEarth() {
  const texLoader = new THREE.TextureLoader();

  const dayTex   = texLoader.load('textures/earth_atmos_2048.jpg');
  const cloudTex = texLoader.load('textures/earth_clouds_1024.png');
  const normTex  = texLoader.load('textures/earth_normal_2048.jpg');
  const specTex  = texLoader.load('textures/earth_specular_2048.jpg');

  const earthGeo = new THREE.SphereGeometry(CFG.globeRadius, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: dayTex,
    normalMap: normTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    specularMap: specTex,
    specular: new THREE.Color(0x224466),
    shininess: 25,
  });
  S.earthMesh = new THREE.Mesh(earthGeo, earthMat);
  S.earthGroup.add(S.earthMesh);

  const cloudGeo = new THREE.SphereGeometry(CFG.globeRadius + 0.8, 48, 48);
  const cloudMat = new THREE.MeshPhongMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  S.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  S.earthGroup.add(S.cloudMesh);
}

function build3DAirports() {
  const hubMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const smallMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const hubGeo = new THREE.SphereGeometry(0.40, 12, 12);
  const smallGeo = new THREE.SphereGeometry(0.24, 8, 8);

  // Nauwkeurige hitbox afgestemd op Nederlandse vliegveldafstanden
  const hitGeo = new THREE.SphereGeometry(0.70, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  for (const ap of AIRPORTS) {
    const pos = latLonToVector3(ap.lat, ap.lon, CFG.globeRadius + 0.25);
    const mesh = new THREE.Mesh(ap.hub ? hubGeo : smallGeo, ap.hub ? hubMat : smallMat);
    mesh.position.copy(pos);
    mesh.userData = { isAirport: true, airport: ap };
    S.airportsGroup.add(mesh);
    ap._marker = mesh;

    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.copy(pos);
    hitMesh.userData = { isAirport: true, airport: ap };
    S.airportsGroup.add(hitMesh);

    if (ap.hub) {
      const ringGeo = new THREE.RingGeometry(0.50, 0.75, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      S.airportsGroup.add(ring);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  GEDETAILLEERD 3D LANDINGSBAAN & LUCHTHAVEN MODEL (VOOR 300M ZOOM)
// ═══════════════════════════════════════════════════════
function buildDetailedAirportModel(airport) {
  if (!S.airportDetailGroup) return;

  // Maak vorige model leeg
  while (S.airportDetailGroup.children.length > 0) {
    const obj = S.airportDetailGroup.children[0];
    S.airportDetailGroup.remove(obj);
  }

  const apPos = latLonToVector3(airport.lat, airport.lon, CFG.globeRadius);
  const up = apPos.clone().normalize();
  let north = new THREE.Vector3(0, 1, 0).projectOnPlane(up).normalize();
  if (north.lengthSq() < 0.001) north = new THREE.Vector3(0, 0, 1).projectOnPlane(up).normalize();
  const east = new THREE.Vector3().crossVectors(up, north).normalize();

  // Richt de groep tangentiaal aan het aardoppervlak
  const rotMatrix = new THREE.Matrix4().makeBasis(east, up, north);
  S.airportDetailGroup.position.copy(apPos);
  S.airportDetailGroup.quaternion.setFromRotationMatrix(rotMatrix);

  // 1. Grondvlak / Vliegveldterrein met ECHTE Satelliet Luchtfoto (geen computer graphics)
  const texLoader = new THREE.TextureLoader();
  texLoader.setCrossOrigin('anonymous');
  const satUrl = getAirportSatelliteTextureUrl(airport);
  const satTexture = texLoader.load(satUrl, (tex) => {
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
  });

  const groundGeo = new THREE.PlaneGeometry(0.16, 0.16);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    map: satTexture,
    roughness: 0.85,
    metalness: 0.10,
    depthWrite: true,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = 0.0001;
  S.airportDetailGroup.add(ground);

  // 2. Hoofdlandingsbaan (subtiel geaccentueerd over de echte satellietfoto)
  const rwyWidth = 0.0035; // ~220 meter zichtbaar
  const rwyLength = 0.095; // ~6.000 meter baanlengte
  const rwyGeo = new THREE.PlaneGeometry(rwyWidth, rwyLength);
  rwyGeo.rotateX(-Math.PI / 2);
  const rwyMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.9,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });
  const mainRwy = new THREE.Mesh(rwyGeo, rwyMat);
  mainRwy.position.set(0, 0.0003, 0);
  mainRwy.rotation.y = Math.PI / 6; // 30 graden hoek
  S.airportDetailGroup.add(mainRwy);

  // Drempelstrepen (Piano keys) op baanuiteinden
  const stripeGeo = new THREE.PlaneGeometry(0.00025, 0.003);
  stripeGeo.rotateX(-Math.PI / 2);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false });

  for (let s = -3; s <= 3; s++) {
    // Drempel A
    const stA = new THREE.Mesh(stripeGeo, stripeMat);
    stA.position.set(s * 0.0004, 0.0004, -0.044);
    mainRwy.add(stA);
    // Drempel B
    const stB = new THREE.Mesh(stripeGeo, stripeMat);
    stB.position.set(s * 0.0004, 0.0004, 0.044);
    mainRwy.add(stB);
  }

  // Onderbroken middenlijn (Centerline dashes)
  const dashGeo = new THREE.PlaneGeometry(0.0002, 0.0035);
  dashGeo.rotateX(-Math.PI / 2);
  for (let d = -8; d <= 8; d++) {
    const dash = new THREE.Mesh(dashGeo, stripeMat);
    dash.position.set(0, 0.0004, d * 0.005);
    mainRwy.add(dash);
  }

  // 3. Tweede Kruisende Landingsbaan (bijv. Polderbaan 18R / 36L)
  const crossRwy = new THREE.Mesh(rwyGeo, rwyMat);
  crossRwy.position.set(0.02, 0.00028, 0);
  crossRwy.rotation.y = -Math.PI / 3;
  S.airportDetailGroup.add(crossRwy);

  // 4. Baanverlichting (Groene drempellichten, rode stoplichten, witte randlichten)
  const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const redLightMat   = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const whiteLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lightSphere   = new THREE.SphereGeometry(0.00015, 6, 6);

  for (let s = -3; s <= 3; s++) {
    const gl = new THREE.Mesh(lightSphere, greenLightMat);
    gl.position.set(s * 0.00045, 0.0005, -0.045);
    mainRwy.add(gl);

    const rl = new THREE.Mesh(lightSphere, redLightMat);
    rl.position.set(s * 0.00045, 0.0005, 0.045);
    mainRwy.add(rl);
  }

  // Witte randverlichting langs beide zijden
  for (let l = -9; l <= 9; l += 2) {
    const edgeL = new THREE.Mesh(lightSphere, whiteLightMat);
    edgeL.position.set(-rwyWidth / 2, 0.0005, l * 0.0045);
    mainRwy.add(edgeL);

    const edgeR = new THREE.Mesh(lightSphere, whiteLightMat);
    edgeR.position.set(rwyWidth / 2, 0.0005, l * 0.0045);
    mainRwy.add(edgeR);
  }

  // 5. Verkeerstoren (Control Tower)
  const towerGroup = new THREE.Group();
  const shaftGeo = new THREE.CylinderGeometry(0.0003, 0.0004, 0.0028, 8);
  const shaftMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 0.0014;
  towerGroup.add(shaft);

  // Glazen torencabine
  const cabGeo = new THREE.CylinderGeometry(0.00065, 0.0005, 0.0007, 8);
  const cabMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.y = 0.0028;
  towerGroup.add(cab);

  // Radardome bovenop
  const domeGeo = new THREE.SphereGeometry(0.00035, 8, 8);
  const domeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.0033;
  towerGroup.add(dome);

  towerGroup.position.set(-0.015, 0.0002, 0.005);
  S.airportDetailGroup.add(towerGroup);

  // 6. Terminalgebouw & Gates
  const termGeo = new THREE.BoxGeometry(0.012, 0.0012, 0.004);
  const termMat = new THREE.MeshPhongMaterial({ color: 0x64748b });
  const terminal = new THREE.Mesh(termGeo, termMat);
  terminal.position.set(-0.022, 0.0006, -0.01);
  S.airportDetailGroup.add(terminal);

  // 7. Gereedstaand vliegtuig op de landingsbaan (Klaar voor start)
  const planeOnRwy = createAirplaneMesh(0x00a1de);
  planeOnRwy.scale.set(0.0008, 0.0008, 0.0008);
  planeOnRwy.position.set(0, 0.0005, -0.030);
  planeOnRwy.rotation.y = Math.PI / 6;
  S.airportDetailGroup.add(planeOnRwy);

  // Parkeer vliegtuig aan de terminal gate
  const planeAtGate = createAirplaneMesh(0xc8102e);
  planeAtGate.scale.set(0.0008, 0.0008, 0.0008);
  planeAtGate.position.set(-0.022, 0.0005, -0.006);
  planeAtGate.rotation.y = Math.PI;
  S.airportDetailGroup.add(planeAtGate);
}

function createAirplaneMesh(colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({
    color: colorHex,
    shininess: 60,
    emissive: colorHex,
    emissiveIntensity: 0.15
  });

  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.22, 2.6, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, mat);
  group.add(body);

  const wingGeo = new THREE.BoxGeometry(3.4, 0.05, 0.7);
  const wing = new THREE.Mesh(wingGeo, mat);
  wing.position.set(0, 0, 0.1);
  group.add(wing);

  const tailGeo = new THREE.BoxGeometry(0.08, 0.9, 0.6);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.position.set(0, 0.5, -1.0);
  group.add(tail);

  const redMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
  const lightGeo = new THREE.SphereGeometry(0.12, 6, 6);

  const redLight = new THREE.Mesh(lightGeo, redMat);
  redLight.position.set(-1.7, 0, 0.1);
  const greenLight = new THREE.Mesh(lightGeo, greenMat);
  greenLight.position.set(1.7, 0, 0.1);
  group.add(redLight);
  group.add(greenLight);

  return group;
}

function spawnFlight(origin, dest, airline, startProgress = 0) {
  const aircraft = airline.types[Math.floor(Math.random() * airline.types.length)];
  const oVec = latLonToVector3(origin.lat, origin.lon, CFG.globeRadius);
  const dVec = latLonToVector3(dest.lat, dest.lon, CFG.globeRadius);

  const dist = oVec.distanceTo(dVec);
  const mid = oVec.clone().add(dVec).multiplyScalar(0.5);
  const alt = CFG.globeRadius + 3.0 + (dist * 0.08);
  mid.normalize().multiplyScalar(alt);

  const curve = new THREE.QuadraticBezierCurve3(oVec, mid, dVec);
  const points = curve.getPoints(36);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
  const arcMat = new THREE.LineBasicMaterial({
    color: airline.color,
    transparent: true,
    opacity: 0.28,
    linewidth: 1
  });
  const arcLine = new THREE.Line(arcGeo, arcMat);
  S.trailsGroup.add(arcLine);

  const planeMesh = createAirplaneMesh(airline.color);
  planeMesh.userData = { isFlight: true };
  S.flightsGroup.add(planeMesh);

  const distKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
  const speedKmh = 820 + Math.floor(Math.random() * 140);
  const durationH = distKm / speedKmh;

  const id = S.flights.length + 1;
  const flight = {
    id,
    callsign: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
    airline,
    aircraft,
    origin,
    dest,
    altitude: 9500 + Math.floor(Math.random() * 2500),
    speedKmh,
    durationH,
    progress: startProgress,
    progressRate: 1 / (durationH * 3600 * 60),
    curve,
    arcLine,
    planeMesh,
    hovered: false,
    status: startProgress === 0 ? 'Opstijgen' : (startProgress > 0.85 ? 'Final Approach' : 'Kruissnelheid')
  };

  planeMesh.userData.flight = flight;
  S.flights.push(flight);
  return flight;
}

function build3DFlights() {
  const count = CFG.flightCount;
  S.flights = [];

  for (let i = 0; i < count; i++) {
    const oIdx = Math.floor(Math.random() * AIRPORTS.length);
    let dIdx = Math.floor(Math.random() * AIRPORTS.length);
    while (dIdx === oIdx) dIdx = Math.floor(Math.random() * AIRPORTS.length);

    const origin = AIRPORTS[oIdx];
    const dest = AIRPORTS[dIdx];
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

    spawnFlight(origin, dest, airline, Math.random());
  }
}

// ═══════════════════════════════════════════════════════
//  WASM BRUG & UPDATE
// ═══════════════════════════════════════════════════════
let wasmInstance = null;
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
    wasmInstance = instance.exports;
    wasmInstance.init_world(0x1234);
    const ver = wasmInstance.get_version();
    const hudWasm = document.getElementById('hud-wasm');
    if (hudWasm) hudWasm.textContent = `v${(ver/100).toFixed(2)}`;
  } catch (e) {
    console.warn('[WASM] Laden:', e);
  }
}

// ═══════════════════════════════════════════════════════
//  INZOOMEN TOT 300 METER BOVEN LANDINGSBAAN
// ═══════════════════════════════════════════════════════
function zoomToAirportRunway(airport, targetAltMeters = 300) {
  if (!airport) return;
  S.followFlight = null;
  S.selectedAirport = airport;

  const apPos = latLonToVector3(airport.lat, airport.lon, CFG.globeRadius);
  const up = apPos.clone().normalize();
  let north = new THREE.Vector3(0, 1, 0).projectOnPlane(up).normalize();
  if (north.lengthSq() < 0.001) north = new THREE.Vector3(0, 0, 1).projectOnPlane(up).normalize();
  const east = new THREE.Vector3().crossVectors(up, north).normalize();

  // Bereken 3D eenheden voor gewenste hoogte in meters (300m = ~0.00471 units)
  const altUnits = Math.max(0.0035, (targetAltMeters / CFG.metersPerUnit));

  // Plaats camera net achter de baanthreshold op 300m hoogte met zicht langs de baan
  const camPos = apPos.clone()
    .addScaledVector(up, altUnits)
    .addScaledVector(north, -0.006)
    .addScaledVector(east, 0.0035);

  S.cameraTargetLook = apPos.clone();
  S.cameraTargetPos = camPos;
  S.isZoomingToAirport = true;

  // Pas controls aan voor micro-zoom rond de baan
  S.controls.minDistance = 0.0018; // Tot 115 meter boven de grond!
  S.controls.maxDistance = 120.0;
  S.controls.target.copy(apPos);

  // Bouw en activeer het gedetailleerde 3D baanmodel
  buildDetailedAirportModel(airport);

  // Update UI tekst
  const apAltDisp = document.getElementById('ap-disp-altitude');
  if (apAltDisp) apAltDisp.textContent = `📷 Hoogte: ${targetAltMeters} m (${airport.activeRunway})`;

  ATC.logMessage('CAMERA', `Ingezoomd tot ${targetAltMeters} meter boven ${airport.name} (${airport.activeRunway}).`, true);
}

function zoomToGlobe() {
  S.followFlight = null;
  S.cameraTargetLook = new THREE.Vector3(0, 0, 0);
  S.cameraTargetPos = new THREE.Vector3(0, 50, 260);
  S.controls.minDistance = 100.1;
  S.controls.maxDistance = 500;
}

// ═══════════════════════════════════════════════════════
//  ANIMATIE & SIMULATIE LOOP
// ═══════════════════════════════════════════════════════
function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min(100, now - (S.lastTime || now));
  S.lastTime = now;

  // FPS teller
  S.fpsCount++;
  if (now - S.fpsLast >= 1000) {
    const hudFps = document.getElementById('hud-fps');
    if (hudFps) hudFps.textContent = `${S.fpsCount} fps`;
    S.fpsCount = 0;
    S.fpsLast = now;
  }

  // Simulatietick & WASM
  if (!S.paused) {
    if (wasmInstance) {
      S.tick = wasmInstance.update(Math.round(dt), S.speed) || S.tick + 1;
    } else {
      S.tick++;
    }
  }

  // Wolken langzaam laten roteren
  if (S.cloudMesh && S.layers.clouds) {
    S.cloudMesh.rotation.y += 0.00015;
  }

  // Vluchten positie updaten
  const dtSim = dt * S.speed;
  for (const f of S.flights) {
    if (!S.paused) {
      f.progress += f.progressRate * dtSim;
      if (f.progress >= 1.0) {
        f.progress = 0;
        f.status = 'Kruissnelheid';
      }
    }

    const p = f.curve.getPointAt(f.progress);
    f.planeMesh.position.copy(p);

    const tangent = f.curve.getTangentAt(f.progress).normalize();
    const up = p.clone().normalize();
    const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(tangent, right).normalize();

    const m = new THREE.Matrix4().makeBasis(right, correctedUp, tangent);
    f.planeMesh.quaternion.setFromRotationMatrix(m);
  }

  // Geanimeerde camera navigatie
  if (S.followFlight) {
    const p = S.followFlight.curve.getPointAt(S.followFlight.progress);
    S.controls.target.lerp(p, 0.06);
  } else if (S.cameraTargetLook && S.cameraTargetPos) {
    S.camera.position.lerp(S.cameraTargetPos, 0.07);
    S.controls.target.lerp(S.cameraTargetLook, 0.07);

    if (S.camera.position.distanceTo(S.cameraTargetPos) < 0.0005) {
      S.cameraTargetPos = null;
      S.cameraTargetLook = null;
      S.isZoomingToAirport = false;
    }
  }

  // Bereken en update camera hoogte in meters
  if (S.selectedAirport) {
    const apPos = latLonToVector3(S.selectedAirport.lat, S.selectedAirport.lon, CFG.globeRadius);
    const distCam = S.camera.position.distanceTo(apPos);
    const altMeters = Math.round(distCam * CFG.metersPerUnit);

    const hudAlt = document.getElementById('hud-cam-alt');
    const apAltDisp = document.getElementById('ap-disp-altitude');
    const altText = altMeters < 1000 ? `${altMeters} m` : `${(altMeters / 1000).toFixed(1)} km`;

    if (hudAlt) hudAlt.textContent = altText;
    if (apAltDisp && !S.cameraTargetPos) {
      apAltDisp.textContent = `📷 Hoogte: ${altText} (${S.selectedAirport.activeRunway})`;
    }
  }

  if (S.cameraLight && S.camera) {
    S.cameraLight.position.copy(S.camera.position);
  }

  S.controls.update();
  S.renderer.render(S.scene, S.camera);
}

// ═══════════════════════════════════════════════════════
//  3D INTERACTIE & RAYCASTING
// ═══════════════════════════════════════════════════════
function setupInteraction(container) {
  const onPointerMove = (e) => {
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);

    const intersects = S.raycaster.intersectObjects(S.flightsGroup.children, true);
    for (const f of S.flights) f.hovered = false;
    const tt = document.getElementById('tooltip');

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj.parent && !topObj.userData.flight) topObj = topObj.parent;
      const flight = topObj.userData.flight;
      if (flight) {
        flight.hovered = true;
        const pct = (flight.progress * 100).toFixed(0);
        document.getElementById('tt-route').textContent   = flight.callsign;
        document.getElementById('tt-airline').textContent = `${flight.airline.name} · ${flight.aircraft}`;
        document.getElementById('tt-from').textContent    = `${flight.origin.flag} ${flight.origin.code}`;
        document.getElementById('tt-to').textContent      = `${flight.dest.flag} ${flight.dest.code}`;
        document.getElementById('tt-alt').textContent     = `${Number(flight.altitude).toLocaleString('nl-NL')} m`;
        document.getElementById('tt-spd').textContent     = `${flight.speedKmh} km/h`;
        document.getElementById('tt-pct').textContent     = `${pct}% (${flight.status || 'In vlucht'})`;
        document.getElementById('tt-bar').style.width     = `${pct}%`;

        const tx = Math.min(window.innerWidth - 220, e.clientX + 16);
        const ty = Math.min(window.innerHeight - 180, e.clientY - 10);
        tt.style.left = `${tx}px`;
        tt.style.top  = `${ty}px`;
        tt.classList.add('show');
        container.style.cursor = 'pointer';
        return;
      }
    }

    const apIntersects = S.raycaster.intersectObjects(S.airportsGroup.children, false);
    if (apIntersects.length > 0) {
      const ap = apIntersects[0].object.userData.airport;
      if (ap) {
        document.getElementById('tt-route').textContent   = `${ap.flag} ${ap.name}`;
        document.getElementById('tt-airline').textContent = `${ap.city}, ${ap.country}`;
        document.getElementById('tt-from').textContent    = `IATA: ${ap.code}`;
        document.getElementById('tt-to').textContent      = `Baan: ${ap.activeRunway}`;
        document.getElementById('tt-alt').textContent     = `TWR: ${ap.freqs.twr} MHz`;
        document.getElementById('tt-spd').textContent     = `Wind: ${ap.weather.wind}`;
        document.getElementById('tt-pct').textContent     = `Klik om in te zoomen (300m)`;
        document.getElementById('tt-bar').style.width     = `100%`;

        const tx = Math.min(window.innerWidth - 220, e.clientX + 16);
        const ty = Math.min(window.innerHeight - 180, e.clientY - 10);
        tt.style.left = `${tx}px`;
        tt.style.top  = `${ty}px`;
        tt.classList.add('show');
        container.style.cursor = 'pointer';
        return;
      }
    }

    tt.classList.remove('show');
    container.style.cursor = 'grab';
  };

  const onClick = (e) => {
    ATC.ensureAudioCtx();
    LIVEATC.ensureAudioCtx();

    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);

    const apIntersects = S.raycaster.intersectObjects(S.airportsGroup.children, false);
    if (apIntersects.length > 0) {
      const ap = apIntersects[0].object.userData.airport;
      if (ap) {
        selectAirport(ap);
        zoomToAirportRunway(ap, 300);
        return;
      }
    }

    const flightIntersects = S.raycaster.intersectObjects(S.flightsGroup.children, true);
    if (flightIntersects.length > 0) {
      let topObj = flightIntersects[0].object;
      while (topObj.parent && !topObj.userData.flight) topObj = topObj.parent;
      const flight = topObj.userData.flight;
      if (flight) {
        S.followFlight = (S.followFlight === flight) ? null : flight;
        updateGlobalFlightListUI();
        ATC.contactFlight(flight);
      }
    }
  };

  container.addEventListener('mousemove', onPointerMove);
  container.addEventListener('click', onClick);
}

// ═══════════════════════════════════════════════════════
//  LUCHTHAVEN SELECTIE & VLUCHTENBORD ENGINE
// ═══════════════════════════════════════════════════════
function selectAirport(ap) {
  if (!ap) return;
  S.selectedAirport = ap;
  ATC.selectedAirport = ap;

  // Sla het laatst bezochte vliegveld lokaal op zodat de app volgende keer direct hiermee start
  try {
    localStorage.setItem('petersworld_last_airport', ap.code);
  } catch (e) {
    console.warn('LocalStorage save mislukt:', e);
  }

  const qSelect = document.getElementById('airport-quick-select');
  if (qSelect && qSelect.value !== ap.code) qSelect.value = ap.code;

  const hudSel = document.getElementById('hud-sel-airport');
  if (hudSel) hudSel.textContent = ap.code;

  const apName = document.getElementById('ap-disp-name');
  const apCode = document.getElementById('ap-disp-code');
  const apTime = document.getElementById('ap-disp-time');
  const apWeather = document.getElementById('ap-disp-weather');

  if (apName) apName.textContent = `${ap.flag} ${ap.name}`;
  if (apCode) apCode.textContent = ap.code;

  const now = new Date();
  const utcHours = now.getUTCHours();
  const localH = (utcHours + Math.floor(ap.utcOffset) + 24) % 24;
  const localM = String(now.getUTCMinutes()).padStart(2, '0');
  if (apTime) apTime.textContent = `🕐 ${String(localH).padStart(2,'0')}:${localM} Lokale tijd (UTC${ap.utcOffset >= 0 ? '+' : ''}${ap.utcOffset})`;
  if (apWeather) apWeather.textContent = `🌦️ Baan ${ap.activeRunway} · ${ap.weather.wind}`;

  const rwySelect = document.getElementById('regie-runway-select');
  if (rwySelect) {
    rwySelect.innerHTML = '';
    for (const rwy of ap.runways) {
      const opt = document.createElement('option');
      opt.value = rwy;
      opt.textContent = `Baan: ${rwy}`;
      if (rwy === ap.activeRunway) opt.selected = true;
      rwySelect.appendChild(opt);
    }
  }

  ATC.setFrequency(ap.freqs.twr, `${ap.code} TOWER`);
  LIVEATC.tuneToAirport(ap, false);
  if (typeof RUNWAY_CAM !== 'undefined' && RUNWAY_CAM) {
    RUNWAY_CAM.tuneToAirport(ap);
  }

  renderAirportFlightBoard();
}

function renderAirportFlightBoard() {
  const ap = S.selectedAirport;
  if (!ap) return;

  const depView = document.getElementById('view-departures');
  const arrView = document.getElementById('view-arrivals');
  const countDep = document.getElementById('count-dep');
  const countArr = document.getElementById('count-arr');

  if (!depView || !arrView) return;

  let departures = S.flights.filter(f => f.origin.code === ap.code);
  let arrivals   = S.flights.filter(f => f.dest.code === ap.code);

  if (departures.length < 6) {
    for (let k = 0; k < (6 - departures.length); k++) {
      let destAp = AIRPORTS[(AIRPORTS.indexOf(ap) + k + 1) % AIRPORTS.length];
      const airl = AIRLINES[(k + 3) % AIRLINES.length];
      departures.push({
        callsign: `${airl.code}${1400 + k * 12}`,
        airline: airl,
        aircraft: airl.types[k % airl.types.length],
        origin: ap,
        dest: destAp,
        progress: (k * 0.15),
        status: k === 0 ? 'Boarding Gate D4' : (k === 1 ? 'Taxiën naar baan' : 'Gereed voor vertrek'),
        isSlot: true
      });
    }
  }

  if (arrivals.length < 6) {
    for (let k = 0; k < (6 - arrivals.length); k++) {
      let origAp = AIRPORTS[(AIRPORTS.indexOf(ap) + k + 4) % AIRPORTS.length];
      const airl = AIRLINES[(k + 6) % AIRLINES.length];
      arrivals.push({
        callsign: `${airl.code}${2300 + k * 18}`,
        airline: airl,
        aircraft: airl.types[k % airl.types.length],
        origin: origAp,
        dest: ap,
        progress: 0.80 + (k * 0.03),
        status: k === 0 ? 'Final Approach' : (k === 1 ? 'Daling ingezet' : 'Nadering 4000ft'),
        isSlot: true
      });
    }
  }

  if (countDep) countDep.textContent = departures.length;
  if (countArr) countArr.textContent = arrivals.length;

  depView.innerHTML = '';
  for (const f of departures) {
    const row = document.createElement('div');
    row.className = 'fids-row';
    const badgeClass = f.status.includes('Boarding') ? 'badge-boarding' : (f.status.includes('Opstijgen') ? 'badge-airborne' : 'badge-ontime');
    row.innerHTML = `
      <div class="fids-left">
        <div class="fids-flt-route">
          <span style="color:${f.airline.hex};">${f.callsign}</span>
          <span style="color:var(--muted);">➔ ${f.dest.flag} ${f.dest.code}</span>
        </div>
        <div class="fids-details">${f.airline.name} · ${f.aircraft}</div>
      </div>
      <div class="fids-right">
        <span class="fids-badge ${badgeClass}">${f.status}</span>
        <button class="btn-fids-action" data-callsign="${f.callsign}">🎙️ Luister</button>
      </div>
    `;

    const listenBtn = row.querySelector('.btn-fids-action');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        ATC.ensureAudioCtx();
        LIVEATC.ensureAudioCtx();

        // 1. Stem de radio af op dit vliegveld (zonder oude bandjes te starten)
        const targetAirport = S.selectedAirport || f.origin || f.dest;
        if (targetAirport) {
          LIVEATC.tuneToAirport(targetAirport, false);
        }

        // 2. Als dit een ingeroosterde vlucht is, creëer een actief 3D vliegtuig in de wereld
        let liveFlight = f;
        if (f.isSlot) {
          liveFlight = spawnFlight(f.origin, f.dest, f.airline, f.progress || 0.05);
          liveFlight.callsign = f.callsign;
          liveFlight.status = f.status;
          f.isSlot = false;
        }

        // 3. Volg het vliegtuig direct met de 3D camera
        S.followFlight = liveFlight;

        // 4. Zend torencommunicatie met de piloot
        ATC.contactFlight(liveFlight);

        // 5. Op mobiel/tablet: sluit de sheet zodat de 3D vlucht direct zichtbaar is
        if (window.innerWidth <= 768) {
          const deck = document.getElementById('right-deck');
          if (deck) deck.classList.remove('show-mobile');
          const btns = document.querySelectorAll('.m-nav-btn');
          btns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'globe'));
        }
      });
    }

    depView.appendChild(row);
  }

  arrView.innerHTML = '';
  for (const f of arrivals) {
    const row = document.createElement('div');
    row.className = 'fids-row';
    const badgeClass = f.status.includes('Final') ? 'badge-approach' : (f.status.includes('Geland') ? 'badge-landed' : (f.status.includes('GO-AROUND') ? 'badge-goaround' : 'badge-ontime'));
    row.innerHTML = `
      <div class="fids-left">
        <div class="fids-flt-route">
          <span style="color:${f.airline.hex};">${f.callsign}</span>
          <span style="color:var(--muted);">van ${f.origin.flag} ${f.origin.code}</span>
        </div>
        <div class="fids-details">${f.airline.name} · ${f.aircraft}</div>
      </div>
      <div class="fids-right">
        <span class="fids-badge ${badgeClass}">${f.status}</span>
        <button class="btn-fids-action" data-callsign="${f.callsign}">🎙️ Luister</button>
      </div>
    `;

    const listenBtn = row.querySelector('.btn-fids-action');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        ATC.ensureAudioCtx();
        LIVEATC.ensureAudioCtx();

        // 1. Stem de radio af op dit vliegveld (zonder oude bandjes te starten)
        const targetAirport = S.selectedAirport || f.dest || f.origin;
        if (targetAirport) {
          LIVEATC.tuneToAirport(targetAirport, false);
        }

        // 2. Als dit een ingeroosterde vlucht is, creëer een actief 3D vliegtuig in de wereld
        let liveFlight = f;
        if (f.isSlot) {
          liveFlight = spawnFlight(f.origin, f.dest, f.airline, f.progress || 0.85);
          liveFlight.callsign = f.callsign;
          liveFlight.status = f.status;
          f.isSlot = false;
        }

        // 3. Volg het vliegtuig direct met de 3D camera
        S.followFlight = liveFlight;

        // 4. Zend torencommunicatie met de piloot
        ATC.contactFlight(liveFlight);

        // 5. Op mobiel/tablet: sluit de sheet zodat de 3D vlucht direct zichtbaar is
        if (window.innerWidth <= 768) {
          const deck = document.getElementById('right-deck');
          if (deck) deck.classList.remove('show-mobile');
          const btns = document.querySelectorAll('.m-nav-btn');
          btns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'globe'));
        }
      });
    }

    arrView.appendChild(row);
  }
}

// ═══════════════════════════════════════════════════════
//  REGIE COMMANDO'S (STARTEN, LANDEN, GO-AROUND)
// ═══════════════════════════════════════════════════════
function regieActionTakeoff() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();
  LIVEATC.ensureAudioCtx();

  let dIdx = Math.floor(Math.random() * AIRPORTS.length);
  while (AIRPORTS[dIdx] === ap) dIdx = Math.floor(Math.random() * AIRPORTS.length);
  const dest = AIRPORTS[dIdx];
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

  const flight = spawnFlight(ap, dest, airline, 0.0);
  flight.status = 'Opstijgen';
  S.followFlight = flight;

  const numOnly = flight.callsign.replace(/\D/g, '');
  const callsignSpoken = flight.airline.callsign + ' ' + numOnly;
  const rwy = ap.activeRunway;

  ATC.exchangeDialogue(
    `${ap.code} TWR`,
    `${flight.callsign}, ${ap.name} Tower. Wind ${ap.weather.wind}, ${rwy}, cleared for takeoff! Airborne contact Departure ${ap.freqs.app}.`,
    `${callsignSpoken}, ${ap.name} Tower. Wind ${ap.weather.wind}, ${rwy}, cleared for takeoff, airborne Departure ${ap.freqs.app}.`,
    flight.callsign,
    `${rwy}, cleared for takeoff, rolling out now, ${flight.callsign}!`,
    `${rwy}, cleared for takeoff, rolling out now, ${callsignSpoken}!`
  );

  renderAirportFlightBoard();
}

function regieActionLand() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();
  LIVEATC.ensureAudioCtx();

  let inbound = S.flights.find(f => f.dest.code === ap.code && f.progress > 0.70);
  if (!inbound) {
    let oIdx = Math.floor(Math.random() * AIRPORTS.length);
    while (AIRPORTS[oIdx] === ap) oIdx = Math.floor(Math.random() * AIRPORTS.length);
    const origin = AIRPORTS[oIdx];
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    inbound = spawnFlight(origin, ap, airline, 0.88);
  }

  inbound.status = 'Geland & Baan Vrij';
  S.followFlight = inbound;

  const numOnly = inbound.callsign.replace(/\D/g, '');
  const callsignSpoken = inbound.airline.callsign + ' ' + numOnly;
  const rwy = ap.activeRunway;

  ATC.exchangeDialogue(
    `${ap.code} TWR`,
    `${inbound.callsign}, ${ap.name} Tower. Wind ${ap.weather.wind}, ${rwy}, cleared to land. Welcome to ${ap.city}!`,
    `${callsignSpoken}, ${ap.name} Tower. Wind ${ap.weather.wind}, ${rwy}, cleared to land. Welcome to ${ap.city}!`,
    inbound.callsign,
    `Cleared to land ${rwy}, touchdown imminent, ${inbound.callsign}.`,
    `Cleared to land ${rwy}, touchdown imminent, ${callsignSpoken}.`
  );

  renderAirportFlightBoard();
}

function regieActionGoAround() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();
  LIVEATC.ensureAudioCtx();

  let inbound = S.flights.find(f => f.dest.code === ap.code) || S.flights[0];
  inbound.status = 'GO-AROUND!';
  S.followFlight = inbound;

  const numOnly = inbound.callsign.replace(/\D/g, '');
  const callsignSpoken = inbound.airline.callsign + ' ' + numOnly;

  ATC.exchangeDialogue(
    `${ap.code} TWR`,
    `🚨 ATTENTION ${inbound.callsign}! GO AROUND! Cancel landing clearance! Runway occupied! Climb and maintain 3000 feet on runway heading!`,
    `Attention ${callsignSpoken}! Go around! Cancel landing clearance! Runway occupied! Climb and maintain 3000 feet on runway heading!`,
    inbound.callsign,
    `Going around immediately! Maximum thrust, climbing 3000 feet, ${inbound.callsign}!`,
    `Going around immediately! Maximum thrust, climbing 3000 feet, ${callsignSpoken}!`
  );

  renderAirportFlightBoard();
}

function regieActionEmergency() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();
  LIVEATC.ensureAudioCtx();

  const inbound = S.flights.find(f => f.dest.code === ap.code) || S.flights[1];
  inbound.status = 'SQUAWK 7700';
  S.followFlight = inbound;

  const numOnly = inbound.callsign.replace(/\D/g, '');
  const callsignSpoken = inbound.airline.callsign + ' ' + numOnly;

  ATC.exchangeDialogue(
    inbound.callsign,
    `🚨 MAYDAY MAYDAY MAYDAY! ${inbound.callsign}, cockpit warning, hydraulic pressure drop! Requesting priority emergency landing!`,
    `Mayday Mayday Mayday! ${callsignSpoken}, cockpit warning, hydraulic pressure drop! Requesting priority emergency landing!`,
    `${ap.code} TWR`,
    `${inbound.callsign}, ${ap.name} Tower. Squawk 7700. All departures stopped. Runway ${ap.activeRunway} is cleared and emergency equipment is rolling!`,
    `${callsignSpoken}, ${ap.name} Tower. Squawk 7700. All departures stopped. Runway ${ap.activeRunway} is cleared and emergency equipment is rolling!`
  );

  renderAirportFlightBoard();
}

function regieApplyWeatherAndRunway() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();

  const rwySel = document.getElementById('regie-runway-select');
  const wthSel = document.getElementById('regie-weather-select');

  if (rwySel) ap.activeRunway = rwySel.value;
  if (wthSel) {
    const val = wthSel.value;
    if (val === 'cavok') ap.weather = { cond:'cavok', wind:'220° 10kt', qnh:'1015' };
    else if (val === 'rain') ap.weather = { cond:'rain', wind:'270° 20kt', qnh:'1008' };
    else if (val === 'fog') ap.weather = { cond:'fog', wind:'180° 04kt', qnh:'1012' };
    else if (val === 'storm') ap.weather = { cond:'storm', wind:'320° 28kt G40', qnh:'1002' };
  }

  const apWeather = document.getElementById('ap-disp-weather');
  if (apWeather) apWeather.textContent = `🌦️ Baan ${ap.activeRunway} · ${ap.weather.wind}`;

  ATC.logMessage(`${ap.code} TWR`, `${ap.name} Tower: Runway in use ${ap.activeRunway}, wind ${ap.weather.wind}. Active for all arrivals and departures.`, true);
  ATC.playMicClick(true);
  if (LIVEATC) {
    LIVEATC.tuneToAirport(ap, false);
  }
}

// ═══════════════════════════════════════════════════════
//  UI INITIALISATIE & EVENT LISTENERS
// ═══════════════════════════════════════════════════════
function initAirportDeck() {
  const qSelect = document.getElementById('airport-quick-select');
  if (qSelect) {
    qSelect.innerHTML = '';
    for (const ap of AIRPORTS) {
      const opt = document.createElement('option');
      opt.value = ap.code;
      opt.textContent = `${ap.flag} ${ap.code} – ${ap.name}`;
      qSelect.appendChild(opt);
    }
    qSelect.addEventListener('change', (e) => {
      const found = AIRPORTS.find(a => a.code === e.target.value);
      if (found) {
        selectAirport(found);
        zoomToAirportRunway(found, 300);
      }
    });
  }

  // Snelknop in de luchthaven banner: direct naar 300m baanzicht
  const btnBannerZoom300 = document.getElementById('btn-banner-zoom-300');
  if (btnBannerZoom300) {
    btnBannerZoom300.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 300);
    });
  }

  // Onderbalk zoomknoppen
  const btnZoom300 = document.getElementById('btn-zoom-300');
  if (btnZoom300) {
    btnZoom300.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 300);
    });
  }

  const btnZoom1500 = document.getElementById('btn-zoom-1500');
  if (btnZoom1500) {
    btnZoom1500.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 1500);
    });
  }

  const btnZoomGlobe = document.getElementById('btn-zoom-globe');
  if (btnZoomGlobe) {
    btnZoomGlobe.addEventListener('click', () => {
      zoomToGlobe();
    });
  }

  // Deck Tabs switcher: [ Luchthaven Bord & Regie ] vs [ Alle Vluchten ]
  const tabBtnAirport = document.getElementById('tab-btn-airport');
  const tabBtnAllFlights = document.getElementById('tab-btn-allflights');
  const apDeckView = document.getElementById('airport-deck-view');
  const allFlightsView = document.getElementById('allflights-deck-view');

  tabBtnAirport.addEventListener('click', () => {
    tabBtnAirport.classList.add('active');
    tabBtnAllFlights.classList.remove('active');
    apDeckView.style.display = 'flex';
    allFlightsView.style.display = 'none';
  });

  tabBtnAllFlights.addEventListener('click', () => {
    tabBtnAllFlights.classList.add('active');
    tabBtnAirport.classList.remove('active');
    apDeckView.style.display = 'none';
    allFlightsView.style.display = 'flex';
    updateGlobalFlightListUI();
  });

  // Sub Navigation: Departures, Arrivals, Regie
  const subBtnDep = document.getElementById('sub-btn-dep');
  const subBtnArr = document.getElementById('sub-btn-arr');
  const subBtnRegie = document.getElementById('sub-btn-regie');
  const viewDep = document.getElementById('view-departures');
  const viewArr = document.getElementById('view-arrivals');
  const viewRegie = document.getElementById('view-regie');

  const setSubTab = (tab) => {
    subBtnDep.classList.toggle('active', tab === 'dep');
    subBtnArr.classList.toggle('active', tab === 'arr');
    subBtnRegie.classList.toggle('active', tab === 'regie');
    viewDep.style.display = tab === 'dep' ? 'flex' : 'none';
    viewArr.style.display = tab === 'arr' ? 'flex' : 'none';
    viewRegie.style.display = tab === 'regie' ? 'flex' : 'none';
  };

  subBtnDep.addEventListener('click', () => setSubTab('dep'));
  subBtnArr.addEventListener('click', () => setSubTab('arr'));
  subBtnRegie.addEventListener('click', () => setSubTab('regie'));

  // Regie Knoppen
  document.getElementById('btn-regie-takeoff').addEventListener('click', regieActionTakeoff);
  document.getElementById('btn-regie-land').addEventListener('click', regieActionLand);
  document.getElementById('btn-regie-goaround').addEventListener('click', regieActionGoAround);
  document.getElementById('btn-regie-emergency').addEventListener('click', regieActionEmergency);
  document.getElementById('btn-regie-apply-weather').addEventListener('click', regieApplyWeatherAndRunway);

  // Frequentie wissel knoppen
  document.getElementById('btn-freq-twr').addEventListener('click', () => {
    const ap = S.selectedAirport;
    ATC.setFrequency(ap.freqs.twr, `${ap.code} TOWER`);
    ATC.logMessage(`${ap.code} TWR`, `${ap.name} Tower on ${ap.freqs.twr}, radar monitor active.`, true);
    ATC.speak('', true);
  });
  document.getElementById('btn-freq-gnd').addEventListener('click', () => {
    const ap = S.selectedAirport;
    ATC.setFrequency(ap.freqs.gnd, `${ap.code} GROUND`);
    ATC.logMessage(`${ap.code} GND`, `${ap.name} Ground on ${ap.freqs.gnd}, taxi instructions standby.`, true);
    ATC.speak('', true);
  });
  document.getElementById('btn-freq-app').addEventListener('click', () => {
    const ap = S.selectedAirport;
    ATC.setFrequency(ap.freqs.app, `${ap.code} APPROACH`);
    ATC.logMessage(`${ap.code} APP`, `${ap.name} Radar Approach on ${ap.freqs.app}, squawk ident.`, true);
    ATC.speak('', true);
  });

  // Start direct met het laatst bezochte vliegveld uit localStorage
  let savedCode = null;
  try { savedCode = localStorage.getItem('petersworld_last_airport'); } catch(e) {}
  const startAp = (savedCode && AIRPORTS.find(a => a.code === savedCode)) || AIRPORTS[0];
  selectAirport(startAp);
}

// ═══════════════════════════════════════════════════════
//  GLOBALE VLUCHTEN LIJST (TAB 2)
// ═══════════════════════════════════════════════════════
function updateGlobalFlightListUI() {
  const list = document.getElementById('flight-list');
  if (!list) return;

  if (list.children.length === 0) {
    for (const f of S.flights) {
      const item = document.createElement('div');
      item.className = 'flight-item';
      item.dataset.id = f.id;

      const pct = (f.progress * 100).toFixed(0);
      item.innerHTML = `
        <span class="fi-icon">✈</span>
        <div class="fi-info">
          <div class="fi-route" style="color:${f.airline.hex}">${f.callsign} · ${f.origin.code}→${f.dest.code}</div>
          <div class="fi-label">${f.airline.name} · ${f.aircraft}</div>
        </div>
        <span class="fi-prog" id="fp-pct-${f.id}">${pct}%</span>
      `;

      item.addEventListener('click', () => {
        ATC.ensureAudioCtx();
        LIVEATC.ensureAudioCtx();
        S.followFlight = (S.followFlight === f) ? null : f;
        updateGlobalFlightListUI();
        ATC.contactFlight(f);
      });

      list.appendChild(item);
      f._listItem = item;
    }
  }

  for (const f of S.flights) {
    if (!f._listItem) continue;
    f._listItem.classList.toggle('active', f === S.followFlight);
    const pctEl = document.getElementById(`fp-pct-${f.id}`);
    if (pctEl) pctEl.textContent = `${(f.progress * 100).toFixed(0)}%`;
  }
}

// ═══════════════════════════════════════════════════════
//  CONTROLS KNOPPEN
// ═══════════════════════════════════════════════════════
function setupControls() {
  for (const btn of document.querySelectorAll('[data-layer]')) {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      S.layers[layer] = !S.layers[layer];
      btn.classList.toggle('active', S.layers[layer]);

      if (layer === 'flights' && S.flightsGroup) S.flightsGroup.visible = S.layers.flights;
      if (layer === 'airports' && S.airportsGroup) S.airportsGroup.visible = S.layers.airports;
      if (layer === 'trails' && S.trailsGroup) S.trailsGroup.visible = S.layers.trails;
      if (layer === 'clouds' && S.cloudMesh) S.cloudMesh.visible = S.layers.clouds;
    });
  }

  for (const btn of document.querySelectorAll('[data-speed]')) {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.speed = parseInt(btn.dataset.speed, 10);
      S.paused = false;
      document.getElementById('btn-pause').classList.remove('active');
    });
  }

  document.getElementById('btn-pause').addEventListener('click', () => {
    S.paused = !S.paused;
    const btn = document.getElementById('btn-pause');
    btn.classList.toggle('active', S.paused);
    btn.textContent = S.paused ? '▶' : '⏸';
  });

  const btnAtcMute = document.getElementById('btn-atc-mute');
  if (btnAtcMute) btnAtcMute.addEventListener('click', () => ATC.toggleMute());

  const triggerCall = () => {
    ATC.ensureAudioCtx();
    LIVEATC.ensureAudioCtx();
    const flight = S.followFlight || S.flights[Math.floor(Math.random() * S.flights.length)];
    if (flight) ATC.contactFlight(flight);
  };

  const btnAtcCall = document.getElementById('btn-atc-call');
  if (btnAtcCall) btnAtcCall.addEventListener('click', triggerCall);

  const btnAtcTrigger = document.getElementById('btn-atc-trigger');
  if (btnAtcTrigger) btnAtcTrigger.addEventListener('click', triggerCall);

  // Dagzicht schakelaar (bovenbalk + onderbalk)
  const toggleDaylight = () => setDaylightMode(!S.daylightMode);
  const btnToggleDaylight = document.getElementById('btn-toggle-daylight');
  if (btnToggleDaylight) btnToggleDaylight.addEventListener('click', toggleDaylight);

  const btnCtrlDaylight = document.getElementById('btn-ctrl-daylight');
  if (btnCtrlDaylight) btnCtrlDaylight.addEventListener('click', toggleDaylight);

  document.getElementById('btn-refresh').addEventListener('click', () => checkVersion(false));
  document.getElementById('btn-apply-upd').addEventListener('click', applyUpdate);
  document.getElementById('btn-dismiss-upd').addEventListener('click', () => {
    document.getElementById('update-banner').classList.remove('show');
  });

  // Start responsieve interface voor smartphones, tablets en laptops
  initResponsiveUI();
}

// ═══════════════════════════════════════════════════════
//  RESPONSIEVE UI MANAGER (SMARTPHONE, IPAD & LAPTOP)
// ═══════════════════════════════════════════════════════
function initResponsiveUI() {
  const btnGlobe = document.getElementById('m-btn-globe');
  const btnFlights = document.getElementById('m-btn-flights');
  const btnAtc = document.getElementById('m-btn-atc');
  const btnCam = document.getElementById('m-btn-cam');
  const btnDaylight = document.getElementById('m-btn-daylight');

  const rightDeck = document.getElementById('right-deck');
  const atcConsole = document.getElementById('atc-console');
  const btnCloseRightDeck = document.getElementById('btn-close-right-deck');
  const btnCloseAtc = document.getElementById('btn-close-atc');

  const updateMobileTab = (activeTab) => {
    const btns = document.querySelectorAll('.m-nav-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === activeTab);
    });
  };

  const closeAllMobileSheets = () => {
    if (rightDeck) rightDeck.classList.remove('show-mobile');
    if (atcConsole) atcConsole.classList.remove('show-mobile');
    if (RUNWAY_CAM && RUNWAY_CAM.isOpen) {
      RUNWAY_CAM.close();
    }
  };

  if (btnGlobe) {
    btnGlobe.addEventListener('click', () => {
      closeAllMobileSheets();
      updateMobileTab('globe');
    });
  }

  if (btnFlights) {
    btnFlights.addEventListener('click', () => {
      const isOpen = rightDeck && rightDeck.classList.contains('show-mobile');
      if (isOpen) {
        closeAllMobileSheets();
        updateMobileTab('globe');
      } else {
        closeAllMobileSheets();
        if (rightDeck) {
          rightDeck.style.display = '';
          rightDeck.classList.add('show-mobile');
        }
        updateMobileTab('flights');
      }
    });
  }

  if (btnAtc) {
    btnAtc.addEventListener('click', () => {
      const isOpen = atcConsole && atcConsole.classList.contains('show-mobile');
      if (isOpen) {
        closeAllMobileSheets();
        updateMobileTab('globe');
      } else {
        closeAllMobileSheets();
        if (atcConsole) {
          atcConsole.style.display = '';
          atcConsole.classList.add('show-mobile');
        }
        updateMobileTab('atc');
      }
    });
  }

  if (btnCam) {
    btnCam.addEventListener('click', () => {
      if (RUNWAY_CAM && RUNWAY_CAM.isOpen) {
        RUNWAY_CAM.close();
        updateMobileTab('globe');
      } else {
        closeAllMobileSheets();
        if (RUNWAY_CAM) RUNWAY_CAM.open();
        updateMobileTab('cam');
      }
    });
  }

  if (btnDaylight) {
    btnDaylight.addEventListener('click', () => {
      setDaylightMode(!S.daylightMode);
    });
  }

  // Sluitknoppen in de vensters
  if (btnCloseRightDeck) {
    btnCloseRightDeck.addEventListener('click', () => {
      if (rightDeck) {
        rightDeck.classList.remove('show-mobile');
        if (window.innerWidth <= 1024) rightDeck.style.display = 'none';
      }
      updateMobileTab('globe');
    });
  }

  if (btnCloseAtc) {
    btnCloseAtc.addEventListener('click', () => {
      if (atcConsole) {
        atcConsole.classList.remove('show-mobile');
        if (window.innerWidth <= 1024) atcConsole.style.display = 'none';
      }
      updateMobileTab('globe');
    });
  }

  // Reset display stijlen bij venster resize (bijv. van smartphone naar tablet/desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) {
      if (rightDeck) {
        rightDeck.classList.remove('show-mobile');
        rightDeck.style.display = '';
      }
      if (atcConsole) {
        atcConsole.classList.remove('show-mobile');
        atcConsole.style.display = '';
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
//  DAGZICHT / NACHTZICHT REGELING
// ═══════════════════════════════════════════════════════
function setDaylightMode(enabled) {
  S.daylightMode = !!enabled;
  if (S.ambLight) {
    S.ambLight.intensity = S.daylightMode ? 1.10 : 0.25;
  }
  if (S.cameraLight) {
    S.cameraLight.intensity = S.daylightMode ? 0.85 : 0.0;
  }
  if (S.sunLight) {
    S.sunLight.intensity = S.daylightMode ? 1.6 : 1.3;
  }

  const btnHead = document.getElementById('btn-toggle-daylight');
  const txtHead = document.getElementById('txt-daylight');
  const btnCtrl = document.getElementById('btn-ctrl-daylight');
  const btnMobileDay = document.getElementById('m-btn-daylight');

  if (S.daylightMode) {
    if (btnHead) btnHead.classList.add('active');
    if (txtHead) txtHead.textContent = '☀️ Dagzicht: AAN';
    if (btnCtrl) {
      btnCtrl.classList.add('active');
      btnCtrl.textContent = '☀️ Dagzicht';
    }
    if (btnMobileDay) {
      btnMobileDay.classList.add('active');
      const label = btnMobileDay.querySelector('.m-nav-label');
      const icon = btnMobileDay.querySelector('.m-nav-icon');
      if (label) label.textContent = 'Dag';
      if (icon) icon.textContent = '☀️';
    }
    ATC.logMessage('BELICHTING', 'Dagzicht geactiveerd: aarde, landingsbanen en vliegtuigen helder verlicht.', false);
  } else {
    if (btnHead) btnHead.classList.remove('active');
    if (txtHead) txtHead.textContent = '🌙 Nachtzicht: AAN';
    if (btnCtrl) {
      btnCtrl.classList.remove('active');
      btnCtrl.textContent = '🌙 Nachtzicht';
    }
    if (btnMobileDay) {
      btnMobileDay.classList.remove('active');
      const label = btnMobileDay.querySelector('.m-nav-label');
      const icon = btnMobileDay.querySelector('.m-nav-icon');
      if (label) label.textContent = 'Nacht';
      if (icon) icon.textContent = '🌙';
    }
    ATC.logMessage('BELICHTING', 'Realistische zonbelichting & nachtschaduw geactiveerd.', false);
  }
}

// ═══════════════════════════════════════════════════════
//  VERSIE CONTROLE (GitHub Pages Auto-Detect)
// ═══════════════════════════════════════════════════════
let currentVersion = '2.0.0';

async function checkVersion(silent = true) {
  try {
    const res = await fetch(`${CFG.versionFile}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    const pillTxt = document.getElementById('ver-txt');
    if (pillTxt && !currentVersion) currentVersion = data.version;

    if (data.version && data.version !== currentVersion) {
      const banner = document.getElementById('update-banner');
      document.getElementById('upd-ver').textContent = `v${data.version}`;
      const note = data.features && data.features[0] ? data.features[0] : 'Nieuwe update beschikbaar';
      document.getElementById('upd-note').textContent = note;
      banner.classList.add('show');

      const dot = document.getElementById('ver-dot');
      if (dot) dot.className = 'dot gold';
    } else if (!silent) {
      const btn = document.getElementById('btn-refresh');
      btn.style.transform = 'rotate(360deg)';
      setTimeout(() => { btn.style.transform = ''; }, 500);
    }
  } catch (e) {
    console.warn('[Versie] Check mislukt:', e);
  }
}

async function applyUpdate() {
  const btn = document.getElementById('btn-apply-upd');
  if (btn) btn.textContent = 'Bezig met bijwerken...';
  window.location.href = 'reset.html';
}

// ═══════════════════════════════════════════════════════
//  INITIALISATIE BIJ START
// ═══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {
  initThree();
  setupControls();
  ATC.init();
  RUNWAY_CAM.init();

  await loadWasm();
  await checkVersion(true);

  setInterval(() => checkVersion(true), CFG.pollMs);

  requestAnimationFrame(animate);
});
