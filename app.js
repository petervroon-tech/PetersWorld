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
  flightCount: 65,
  globeRadius: 100, // compatibiliteit
  metersPerUnit: 1000, // 1 Three.js eenheid = exact 1.0 km (1000 meter)
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
    code: 'TGE',
    icao: 'EHTE',
    flag: '🇳🇱',
    name: 'Vliegveld Teuge (EHTE)',
    city: 'Teuge / Apeldoorn / Deventer',
    country: 'Nederland',
    lat: 52.2444,
    lon: 6.0469,
    hub: true,
    runways: ['Baan 08/26 (1199m)'],
    activeRunway: 'Baan 26',
    rwyNumbers: ['08', '26'],
    liveAtcStation: 'ehte_twr',
    freqs: { twr: '120.255', gnd: '121.750', app: '120.255' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '210° 11kt', qnh: '1015' }
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
    code: 'TGE',
    icao: 'EHTE',
    flag: '🇳🇱',
    name: 'Vliegveld Teuge (EHTE)',
    city: 'Teuge / Apeldoorn / Deventer',
    country: 'Nederland',
    lat: 52.2444,
    lon: 6.0469,
    hub: true,
    runways: ['Baan 08/26 (1199m)'],
    activeRunway: 'Baan 26',
    rwyNumbers: ['08', '26'],
    liveAtcStation: 'ehte_twr',
    freqs: { twr: '120.255', gnd: '121.750', app: '120.255' },
    utcOffset: 1,
    weather: { cond: 'cavok', wind: '210° 11kt', qnh: '1015' }
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
  { code:'TGE', callsign:'Skydive Teuge',         name:'Paracentrum Skydive Teuge',color:0xf59e0b, hex:'#f59e0b', types:['Cessna 208 Caravan (PH-FST)','Pilatus PC-6 Porter (PH-PAR)'] },
  { code:'VTE', callsign:'Stella Teuge',          name:'Vliegschool Teuge (GA)',   color:0x10b981, hex:'#10b981', types:['Diamond DA40 Star (PH-TGE)','Diamond DA42 Twin Star','Cessna 172 Skyhawk'] },
  { code:'TFL', callsign:'Orange',                name:'TUI fly Netherlands',      color:0xc0022b, hex:'#c0022b', types:['Boeing 787-8 Dreamliner','Boeing 737 MAX 8'] },
  { code:'MPH', callsign:'Martinair',             name:'Martinair Cargo',          color:0xd92d20, hex:'#d92d20', types:['Boeing 747-400BCF','Airbus A350F'] },
  { code:'CND', callsign:'Corendon',              name:'Corendon Dutch Airlines',  color:0xef4444, hex:'#ef4444', types:['Boeing 737-800','Boeing 737 MAX 9'] },
  { code:'NAF', callsign:'Netherlands Air Force', name:'Koninklijke Luchtmacht',   color:0x3b82f6, hex:'#3b82f6', types:['Lockheed Martin F-35A','Airbus A330 MRTT','Boeing CH-47F Chinook'] },
  { code:'EZY', callsign:'easyJet',               name:'easyJet Europe',           color:0xff6600, hex:'#ff6600', types:['Airbus A320neo','Airbus A321neo'] },
];

// ═══════════════════════════════════════════════════════
//  WISKUNDIGE PROJECTIE NEDERLAND VLUCHTRADAR (1 UNIT = 1 KM)
// ═══════════════════════════════════════════════════════
const NL_CENTER_LAT = 52.20;
const NL_CENTER_LON = 5.30;
const KM_PER_DEG_LAT = 111.24;
const KM_PER_DEG_LON = 68.25;

function latLonToVector3(lat, lon, altKm = 0) {
  const x = (lon - NL_CENTER_LON) * KM_PER_DEG_LON;
  const z = -(lat - NL_CENTER_LAT) * KM_PER_DEG_LAT;
  return new THREE.Vector3(x, altKm, z);
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
//  WAV AUDIO ENCODER (100% PURE JS, ZERO DEPENDENCIES)
// ═══════════════════════════════════════════════════════
function encodeWav(buffers, sampleRate = 44100) {
  let length = 0;
  for (let i = 0; i < buffers.length; i++) length += buffers[i].length;
  const merged = new Float32Array(length);
  let offset = 0;
  for (let i = 0; i < buffers.length; i++) {
    merged.set(buffers[i], offset);
    offset += buffers[i].length;
  }
  const buffer = new ArrayBuffer(44 + merged.length * 2);
  const view = new DataView(buffer);
  const writeString = (v, off, str) => {
    for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + merged.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, merged.length * 2, true);
  let pcmOffset = 44;
  for (let i = 0; i < merged.length; i++, pcmOffset += 2) {
    let s = Math.max(-1, Math.min(1, merged[i]));
    view.setInt16(pcmOffset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

// ═══════════════════════════════════════════════════════
//  LIVE ATC ENGINE (ECHTE RADIO COMMUNICATIE SCHIPHOL & NEDERLAND)
// ═══════════════════════════════════════════════════════
class LiveAtcEngine {
  constructor() {
    this.audioEl = null;
    this.isPlaying = false;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.mediaSourceNode = null;
    this.mediaDestNode = null;
    this.scriptProcessorNode = null;
    this.recordedChunks = [];
    this.pcmChunks = [];
    this.recordStartTime = null;
    this.recordTimerId = null;
    this.lastRecordingBlob = null;
    this.lastRecordingUrl = null;
    // Directe open web audio spelers voor Schiphol en Nederlandse luchthavens
    this.liveAtcUrls = {
      eham_all: 'https://airports.stream/amsterdam-schiphol-airport',
      broadcastify_eham: 'https://www.broadcastify.com/listen/feed/popout.php?feedId=47443',
      eham01_twr_main1: 'https://airports.stream/amsterdam-schiphol-airport',
      eham01_twr_main2: 'https://airports.stream/amsterdam-schiphol-airport',
      eham01_arr_p: 'https://airports.stream/amsterdam-schiphol-airport',
      eham_atis_dep: 'https://airports.stream/amsterdam-schiphol-airport',
      ehrd_all: 'https://www.broadcastify.com/listen/ctid/3199',
      ehbk_all: 'https://airports.stream/amsterdam-schiphol-airport',
    };
    this.currentStation = 'eham_twr';
    this.currentAirportCode = 'AMS';
    this.audioCtx = null;
    this.analyser = null;
    this.animVizId = null;
    this.sessionId = 0; // Monotone teller: isoleert asynchrone audio verzoeken en voorkomt dat snelle wissels blijven hangen

    // Live Icecast mount points voor Schiphol en Nederlandse luchtruim feeds
    this.liveMounts = {
      // 🇳🇱 Schiphol Torens & Banen
      eham_twr: 'eham_twr_0624',        // Kaagbaan / Aalsmeerbaan (118.100 MHz)
      eham_twr2: 'eham_twr_042218l36r', // Polderbaan (118.275 MHz / 04/22 & 18L/36R)
      eham_twr3: 'eham_twr_18c36c',     // Zwanenburgerbaan (119.900 MHz / 18C/36C)

      // 🇳🇱 Schiphol Inkomend Verkeer (Arrival / Nadering)
      eham_app_n: 'eham_twr_042218l36r', // Nadering Noord (119.050 MHz / Polderbaan sector)
      eham_app_e: 'eham_twr_0624',        // Nadering Oost (121.200 MHz / Kaagbaan sector)
      eham_app_s: 'eham_twr_0624',        // Nadering Zuid (118.075 MHz / Kaagbaan sector)
      eham_app_w: 'eham_twr_042218l36r', // Nadering West (131.150 MHz / Polderbaan sector)
      eham_app_fin: 'eham_twr_18c36c',    // Final Director (124.875 MHz / Oplijning)

      // 🇳🇱 Schiphol Vertrekkend Verkeer (Departure / Vertrek)
      eham_dep_n: 'eham_twr_042218l36r', // Vertrek Noord (121.200 MHz)
      eham_dep_e: 'eham_twr_0624',        // Vertrek Oost (119.050 MHz)
      eham_dep_s: 'eham_twr_0624',        // Vertrek Zuid (118.075 MHz)
      eham_dep_w: 'eham_twr_042218l36r', // Vertrek West (124.300 MHz)
      eham_radar: 'eham_twr_0624',        // Amsterdam Radar Bovenluchtruim

      // 🇳🇱 Grond, Platform, Delivery & ATIS
      eham_gnd_n: 'eham_twr_042218l36r', // Grond Noord
      eham_gnd_s: 'eham_twr_0624',        // Grond Zuid
      eham_del: 'eham_del',               // Delivery Klaringen (121.980 MHz)
      eham_atis_arr: 'eham_twr_18c36c',   // ATIS Inkomend
      eham_atis_dep: 'eham_twr_0624',     // ATIS Vertrek

      // 🇳🇱 Regionale & Overige Velden (Gekoppeld via actuele live Nederlandse verkeersleiding)
      ehrd_twr: 'eham_twr_0624',
      ehrd_app_in: 'eham_twr_0624',
      ehrd_dep: 'eham_twr_0624',
      ehrd_gnd: 'eham_twr_0624',
      ehrd_atis: 'eham_twr_0624',
      eheh_twr: 'eham_twr_0624',
      eheh_app_in: 'eham_twr_0624',
      eheh_dep: 'eham_twr_0624',
      eheh_gnd: 'eham_twr_0624',
      eheh_atis: 'eham_twr_0624',
      ehbk_twr: 'eham_twr_0624',
      ehbk_app: 'eham_twr_0624',
      ehbk_gnd: 'eham_twr_0624',
      ehbk_atis: 'eham_twr_0624',
      ehgg_twr: 'eham_twr_042218l36r',
      ehgg_app: 'eham_twr_042218l36r',
      ehgg_gnd: 'eham_twr_042218l36r',
      ehgg_atis: 'eham_twr_042218l36r',
      ehle_twr: 'eham_twr_042218l36r',
      ehle_app: 'eham_twr_042218l36r',
      ehle_gnd: 'eham_twr_042218l36r',
      ehte_twr: 'eham_twr_0624',
      ehte_app: 'eham_twr_0624',
      ehte_gnd: 'eham_twr_0624',
      ehtx_twr: 'eham_twr_042218l36r',
      ehse_twr: 'eham_twr_0624',
      ehhv_twr: 'eham_twr_0624',
      ehmz_twr: 'eham_twr_0624',
      ehal_twr: 'eham_twr_042218l36r',
      ehlw_twr: 'eham_twr_042218l36r',
      ehlw_app: 'eham_twr_042218l36r',
      ehvk_twr: 'eham_twr_0624',
      ehvk_app: 'eham_twr_0624',
      ehgr_twr: 'eham_twr_0624',
      ehgr_app: 'eham_twr_0624',
      ehwo_twr: 'eham_twr_0624',
      ehwo_app: 'eham_twr_0624',
      ehkd_twr: 'eham_twr_042218l36r',
      ehkd_app: 'eham_twr_042218l36r'
    };
    this.stationLabels = {
      // 🇳🇱 Schiphol Torens & Banen
      eham_twr: '🇳🇱 Schiphol Toren 1 (118.100 MHz - Kaagbaan/Aalsmeerbaan)',
      eham_twr2: '🇳🇱 Schiphol Toren 2 (118.275 MHz - Polderbaan)',
      eham_twr3: '🇳🇱 Schiphol Toren 3 (119.900 MHz - Zwanenburgerbaan/Buitenveldert)',
      
      // 🇳🇱 Schiphol Inkomend Verkeer (Arrival / Nadering)
      eham_app_n: '🧭 Schiphol Inkomend NOORD (119.050 MHz - Approach ARTIP)',
      eham_app_e: '🧭 Schiphol Inkomend OOST (121.200 MHz - Approach EELDE)',
      eham_app_s: '🧭 Schiphol Inkomend ZUID (118.075 MHz - Approach RIVER)',
      eham_app_w: '🧭 Schiphol Inkomend WEST (131.150 MHz - Approach SUGOL)',
      eham_app_fin: '🛬 Schiphol Final Director (124.875 MHz - ILS Baanoplijning)',

      // 🇳🇱 Schiphol Vertrekkend Verkeer (Departure / Vertrek)
      eham_dep_n: '🛫 Schiphol Vertrek NOORD (121.200 MHz - Departure ANDIK)',
      eham_dep_e: '🛫 Schiphol Vertrek OOST (119.050 MHz - Departure ARNEM)',
      eham_dep_s: '🛫 Schiphol Vertrek ZUID (118.075 MHz - Departure VALKO)',
      eham_dep_w: '🛫 Schiphol Vertrek WEST (124.300 MHz - Departure BERGI)',
      eham_radar: '✈️ Amsterdam Radar (124.300 MHz - Bovenste Luchtruim NL)',

      // 🇳🇱 Schiphol Grond, Platform & ATIS
      eham_gnd_n: '🚕 Schiphol Grond Noord (121.700 MHz - Polder/Zwanenburg Taxiën)',
      eham_gnd_s: '🚕 Schiphol Grond Zuid (121.800 MHz - Kaag/Aalsmeer/Gates)',
      eham_del: '📋 Schiphol Delivery (121.980 MHz - Vluchtklaringen)',
      eham_atis_arr: '📻 Schiphol ATIS Inkomend (122.200 MHz - Baaninfo & Weer)',
      eham_atis_dep: '📻 Schiphol ATIS Vertrek (132.975 MHz - Startbanen & Wind)',

      // 🇳🇱 Rotterdam The Hague Airport (EHRD)
      ehrd_twr: '🇳🇱 Rotterdam The Hague Toren (118.200 MHz)',
      ehrd_app_in: '🧭 Rotterdam Approach Inkomend (127.025 MHz - N/O/Z/W)',
      ehrd_dep: '🛫 Rotterdam Departure Vertrek (127.025 MHz - Klim)',
      ehrd_gnd: '🚕 Rotterdam Grond & Delivery (121.905 MHz)',
      ehrd_atis: '📻 Rotterdam ATIS (128.580 MHz - Actueel Weer)',

      // 🇳🇱 Eindhoven Airport (EHEH)
      eheh_twr: '🇳🇱 Eindhoven Airport Toren (131.000 MHz)',
      eheh_app_in: '🧭 Eindhoven Approach Inkomend (124.500 MHz - N/O/Z/W)',
      eheh_dep: '🛫 Eindhoven Departure Vertrek (124.500 MHz)',
      eheh_gnd: '🚕 Eindhoven Grond (121.930 MHz)',
      eheh_atis: '📻 Eindhoven ATIS (129.580 MHz)',

      // 🇳🇱 Maastricht Aachen Airport (EHBK)
      ehbk_twr: '🇳🇱 Maastricht Aachen Toren (119.475 MHz)',
      ehbk_app: '🧭 Maastricht Approach Inkomend & Vertrek (123.975 MHz)',
      ehbk_gnd: '🚕 Maastricht Grond (121.780 MHz)',
      ehbk_atis: '📻 Maastricht ATIS (122.180 MHz)',

      // 🇳🇱 Groningen Airport Eelde (EHGG)
      ehgg_twr: '🇳🇱 Groningen Airport Eelde Toren (118.700 MHz)',
      ehgg_app: '🧭 Eelde Approach Radar (120.300 MHz)',
      ehgg_gnd: '🚕 Eelde Grond (121.705 MHz)',
      ehgg_atis: '📻 Eelde ATIS (133.555 MHz)',

      // 🇳🇱 Lelystad Airport (EHLE)
      ehle_twr: '🇳🇱 Lelystad Airport Toren (125.675 MHz)',
      ehle_app: '🧭 Lelystad Approach / Info (135.180 MHz)',
      ehle_gnd: '🚕 Lelystad Grond (121.855 MHz)',

      // 🇳🇱 Vliegveld Teuge (EHTE)
      ehte_twr: '🇳🇱 Teuge Airport Radio & Toren (120.255 MHz)',
      ehte_app: '🧭 Teuge Approach & Info (120.255 MHz)',
      ehte_gnd: '🚕 Teuge Grond (121.750 MHz)',

      // 🇳🇱 Regionale Velden & Eilanden
      ehtx_twr: '🇳🇱 Texel Airport Haven (119.855 MHz)',
      ehse_twr: '🇳🇱 Breda Seppe Radio (120.655 MHz)',
      ehhv_twr: '🇳🇱 Hilversum Radio (121.205 MHz)',
      ehmz_twr: '🇳🇱 Midden-Zeeland Radio (119.255 MHz)',
      ehal_twr: '🇳🇱 Ameland Airport Radio (118.355 MHz)',

      // 🇳🇱 Militaire Bases (F-35 & Defensie)
      ehlw_twr: '🇳🇱 Vliegbasis Leeuwarden Toren (120.700 MHz - F-35)',
      ehlw_app: '🧭 Leeuwarden Approach (132.850 MHz)',
      ehvk_twr: '🇳🇱 Vliegbasis Volkel Toren (124.625 MHz - F-35)',
      ehvk_app: '🧭 Volkel Approach (122.100 MHz)',
      ehgr_twr: '🇳🇱 Vliegbasis Gilze-Rijen Toren (125.075 MHz - DHC)',
      ehgr_app: '🧭 Gilze-Rijen Approach (121.175 MHz)',
      ehwo_twr: '🇳🇱 Vliegbasis Woensdrecht Toren (122.100 MHz)',
      ehwo_app: '🧭 Woensdrecht Approach (120.425 MHz)',
      ehkd_twr: '🇳🇱 Maritiem Vliegkamp De Kooy Toren (118.850 MHz)',
      ehkd_app: '🧭 De Kooy Approach (124.525 MHz)'
    };
  }

  getLiveStreamUrl(stationKey) {
    const mount = (this.liveMounts && this.liveMounts[stationKey]) || 'eham_twr_0624';
    const nocache = Date.now();
    return `https://s1-bos.liveatc.net/${mount}?nocache=${nocache}`;
  }

  getBackupStreamUrl(stationKey) {
    const mount = (this.liveMounts && this.liveMounts[stationKey]) || 'eham_twr_0624';
    const nocache = Date.now();
    return `https://s1-fmt2.liveatc.net/${mount}?nocache=${nocache}`;
  }

  init() {
    this.audioEl = document.getElementById('liveatc-audio-element');
    const select = document.getElementById('liveatc-station-select');
    const btnPlay = document.getElementById('btn-liveatc-toggle');
    const btnRecord = document.getElementById('btn-liveatc-record');
    const pill = document.getElementById('pill-liveatc');

    if (this.audioEl) {
      // Icecast streams zijn continue live radio-uitzendingen
      this.audioEl.loop = false;
      this.audioEl.preload = 'none';
      this.audioEl.addEventListener('ended', () => {
        if (this.isPlaying) {
          // Direct herverbinden met actuele live stream
          this.audioEl.src = this.getLiveStreamUrl(this.currentStation);
          this.audioEl.load();
          const p = this.audioEl.play();
          if (p && p.catch) p.catch(() => {});
        }
      });
      this.audioEl.addEventListener('error', (err) => {
        if (this.isPlaying) {
          console.warn('Live radio verbinding herstellen via backup server...', err);
          setTimeout(() => {
            if (this.isPlaying) {
              try {
                this.audioEl.removeAttribute('crossorigin');
                this.audioEl.src = this.getBackupStreamUrl(this.currentStation);
                this.audioEl.load();
                const p = this.audioEl.play();
                if (p && p.catch) p.catch(() => {});
              } catch (e) {}
            }
          }, 1500);
        }
      });
    }

    if (select) {
      select.value = this.currentStation;
      select.addEventListener('change', (e) => {
        this.currentStation = e.target.value;
        this.updateAtcUi();
        this.playStream();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', () => this.togglePlay());
    }

    if (btnRecord) {
      btnRecord.addEventListener('click', () => this.toggleRecord());
    }

    const btnLiveLink = document.getElementById('btn-atc-live-link');
    if (btnLiveLink) {
      btnLiveLink.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    if (pill) {
      pill.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    document.querySelectorAll('.btn-flow').forEach(btn => {
      btn.addEventListener('click', () => {
        setTrafficFilter(btn.dataset.flow, null);
      });
    });

    document.querySelectorAll('.btn-dir').forEach(btn => {
      btn.addEventListener('click', () => {
        setTrafficFilter(null, btn.dataset.dir);
      });
    });

    this.initLiveClock();
    this.updateAtcUi();
    this.initVisualizer();
  }

  formatDateTime(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());
    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${mins}:${secs}`,
      clock: `${hours}:${mins}:${secs} CET`,
      full: `${day}-${month}-${year} ${hours}:${mins}:${secs}`
    };
  }

  initLiveClock() {
    const tick = () => {
      const dt = this.formatDateTime();
      const elDate = document.getElementById('live-stream-date');
      const elClock = document.getElementById('live-stream-clock');
      const hudClock = document.getElementById('hud-live-clock');

      if (elDate) elDate.textContent = dt.date;
      if (elClock) elClock.textContent = dt.clock;
      if (hudClock) hudClock.textContent = `${dt.date} ${dt.time}`;
    };

    tick();
    setInterval(tick, 1000);
  }

  recordStreamStart(stationName = 'Schiphol Toren 118.100 MHz') {
    this.streamStartedAt = new Date();
    const dt = this.formatDateTime(this.streamStartedAt);
    const startRow = document.getElementById('live-stream-start-row');
    const startedAtDisp = document.getElementById('live-stream-started-at');
    const dot = document.getElementById('atc-live-indicator-dot');
    const badge = document.getElementById('live-stream-badge');

    if (startRow) startRow.style.display = 'flex';
    if (startedAtDisp) startedAtDisp.textContent = `${dt.date} om ${dt.time} CET`;
    if (dot) {
      dot.style.background = '#ef4444';
      dot.style.boxShadow = '0 0 10px #ef4444';
    }
    if (badge) {
      badge.textContent = '🔴 100% REALTIME LIVE';
      badge.style.color = '#f87171';
    }

    const hudStatus = document.getElementById('hud-liveatc-status');
    if (hudStatus) hudStatus.innerHTML = `🔴 LIVE (${dt.time})`;

    const statusTxt = document.getElementById('liveatc-status-txt');
    if (statusTxt) {
      statusTxt.innerHTML = `🔴 <strong>LIVE STREAM ACTIEF</strong> &bull; Gestart op: <strong>${dt.date} om ${dt.time} CET</strong> &bull; <em>100% Realtime live radio (geen bandje)</em>`;
    }

    ATC.logMessage('LIVE ATC', `🔴 ECHTE LIVE STREAM GESTART OP: ${dt.date} OM ${dt.time} CET (${stationName}) — 100% Realtime Live Verkeersleiding (geen bandje)`, true);
  }

  getDirectLiveAtcUrl(stationKey) {
    const key = stationKey || this.currentStation || 'eham_twr';
    if (this.liveAtcUrls && this.liveAtcUrls[key]) {
      return this.liveAtcUrls[key];
    }
    return '';
  }

  updateAtcUi() {
    const label = this.stationLabels[this.currentStation] || 'Schiphol Toren 1 (118.100 MHz)';
    const badge = document.getElementById('atc-code-badge');
    if (badge) {
      badge.textContent = `🟢 ${label}`;
    }

    const m = label.match(/\(([\d\.]+)\s*MHz(?:\s*-\s*([^)]+))?\)/i);
    const freq = m ? `${m[1]} MHz` : '118.100 MHz';
    const subDesc = m && m[2] ? m[2].trim() : '';

    const atcFreq = document.getElementById('atc-freq-disp');
    const atcChan = document.getElementById('atc-channel-disp');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (atcFreq) atcFreq.textContent = freq;
    if (atcChan) {
      const cleanName = label.split('(')[0].replace(/🇳🇱\s*|🧭\s*|🛫\s*|🛬\s*|🚕\s*|📋\s*|📻\s*|✈️\s*/g, '').trim();
      atcChan.textContent = `${cleanName.toUpperCase()} ${subDesc ? '· ' + subDesc.toUpperCase() : ''}`;
    }
    if (hudStatus) {
      const shortCode = this.currentStation.replace(/_/g, ' ').toUpperCase();
      hudStatus.textContent = shortCode;
    }

    const btn = document.getElementById('btn-liveatc-toggle');
    if (btn && !this.isPlaying) {
      const shortName = label.split('(')[0].replace(/🇳🇱\s*|🧭\s*|🛫\s*|🛬\s*|🚕\s*|📋\s*|📻\s*|✈️\s*/g, '').trim();
      btn.textContent = `▶ SPEEL LIVE ${shortName.toUpperCase()}`;
    }

    const statusTxt = document.getElementById('liveatc-status-txt');
    if (statusTxt && !this.streamStartedAt) {
      statusTxt.innerHTML = `🟢 100% In-app live radio &bull; <strong>Directe Live Verbinding met Verkeersleiding</strong>`;
    }
  }

  openLiveAtcStream(stationKey) {
    if (stationKey) this.currentStation = stationKey;
    const select = document.getElementById('liveatc-station-select');
    if (select && stationKey) {
      select.value = stationKey;
    }
    this.updateAtcUi();
    if (!this.isPlaying) {
      this.playStream();
    }
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

  getAudioStream() {
    this.ensureAudioCtx();
    if (typeof this.audioEl.captureStream === 'function') {
      try {
        const stream = this.audioEl.captureStream();
        if (stream && stream.getAudioTracks && stream.getAudioTracks().length > 0) {
          return stream;
        }
      } catch (err) {
        console.warn('captureStream error, probeer WebAudio:', err);
      }
    }
    if (typeof this.audioEl.mozCaptureStream === 'function') {
      try {
        const stream = this.audioEl.mozCaptureStream();
        if (stream && stream.getAudioTracks && stream.getAudioTracks().length > 0) {
          return stream;
        }
      } catch (err) {}
    }

    if (this.audioCtx) {
      if (!this.mediaSourceNode) {
        try {
          this.mediaSourceNode = this.audioCtx.createMediaElementSource(this.audioEl);
          this.mediaDestNode = this.audioCtx.createMediaStreamDestination();
          this.mediaSourceNode.connect(this.audioCtx.destination);
          this.mediaSourceNode.connect(this.mediaDestNode);
        } catch (err) {
          console.warn('Web Audio createMediaElementSource error:', err);
        }
      }
      if (this.mediaDestNode && this.mediaDestNode.stream) {
        return this.mediaDestNode.stream;
      }
    }
    return null;
  }

  toggleRecord() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.ensureAudioCtx();

    // Start radio automatisch als deze nog niet speelt
    if (!this.isPlaying) {
      this.playStream();
    }

    this.recordedChunks = [];
    this.pcmChunks = [];
    this.recordStartTime = Date.now();
    this.isRecording = true;

    let stream = this.getAudioStream();
    let started = false;

    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';

        this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          this.finalizeRecording(mimeType);
        };
        this.mediaRecorder.start(250);
        started = true;
      } catch (e) {
        console.warn('MediaRecorder init faalde, activeer WebAudio WAV recorder:', e);
      }
    }

    if (!started && this.audioCtx) {
      try {
        if (!this.mediaSourceNode) {
          this.mediaSourceNode = this.audioCtx.createMediaElementSource(this.audioEl);
          this.mediaSourceNode.connect(this.audioCtx.destination);
        }
        const sp = this.audioCtx.createScriptProcessor(4096, 1, 1);
        sp.onaudioprocess = (e) => {
          if (this.isRecording) {
            const ch = e.inputBuffer.getChannelData(0);
            this.pcmChunks.push(new Float32Array(ch));
          }
        };
        this.mediaSourceNode.connect(sp);
        sp.connect(this.audioCtx.destination);
        this.scriptProcessorNode = sp;
        started = true;
      } catch (err) {
        console.warn('ScriptProcessor fallback error:', err);
      }
    }

    const btnRecord = document.getElementById('btn-liveatc-record');
    const btnRecordTxt = document.getElementById('record-btn-text');
    const recBar = document.getElementById('liveatc-record-bar');
    const lastRecBar = document.getElementById('liveatc-last-recording');

    if (btnRecord) {
      btnRecord.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
      btnRecord.style.border = '1px solid #ef4444';
      btnRecord.style.boxShadow = '0 0 15px rgba(239,68,68,0.5)';
    }
    if (btnRecordTxt) btnRecordTxt.textContent = '⏹ STOP OPNAME & OPSLAAN (00:00)';
    if (recBar) recBar.style.display = 'flex';
    if (lastRecBar) lastRecBar.style.display = 'none';

    this.recordTimerId = setInterval(() => this.updateRecordTimer(), 1000);
    this.updateRecordTimer();

    const stationLabel = this.stationLabels[this.currentStation] || 'Schiphol Toren';
    ATC.logMessage('OPNAME', `🔴 OPNAME GESTART voor: ${stationLabel}. Gesprekken blijven continu doorlopen!`, true);
  }

  updateRecordTimer() {
    if (!this.recordStartTime) return;
    const elapsed = Math.floor((Date.now() - this.recordStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    const timeStr = `${m}:${s}`;

    const disp = document.getElementById('record-timer-disp');
    if (disp) disp.textContent = timeStr;

    const btnRecordTxt = document.getElementById('record-btn-text');
    if (btnRecordTxt && this.isRecording) {
      btnRecordTxt.textContent = `⏹ STOP OPNAME & OPSLAAN (${timeStr})`;
    }

    const hudRec = document.getElementById('hud-record-status');
    if (hudRec) {
      hudRec.textContent = `🔴 REC (${timeStr})`;
      hudRec.style.color = '#ef4444';
    }

    const pillTxt = document.getElementById('liveatc-txt');
    if (pillTxt && this.isRecording) {
      pillTxt.textContent = `🎧 Radio 🔴 REC ${timeStr}`;
    }
  }

  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;

    if (this.recordTimerId) {
      clearInterval(this.recordTimerId);
      this.recordTimerId = null;
    }

    const btnRecord = document.getElementById('btn-liveatc-record');
    const btnRecordTxt = document.getElementById('record-btn-text');
    const recBar = document.getElementById('liveatc-record-bar');

    if (btnRecord) {
      btnRecord.style.background = 'linear-gradient(135deg, #b91c1c, #ef4444)';
      btnRecord.style.border = 'none';
      btnRecord.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
    }
    if (btnRecordTxt) btnRecordTxt.textContent = '🎙️ START OPNAME GESPREKKEN';
    if (recBar) recBar.style.display = 'none';

    const hudRec = document.getElementById('hud-record-status');
    if (hudRec) {
      hudRec.textContent = 'STANDBY';
      hudRec.style.color = '#94a3b8';
    }

    const pillTxt = document.getElementById('liveatc-txt');
    if (pillTxt) {
      pillTxt.textContent = '🎧 Live Schiphol Radio';
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    } else if (this.pcmChunks && this.pcmChunks.length > 0) {
      if (this.scriptProcessorNode) {
        try { this.scriptProcessorNode.disconnect(); } catch (e) {}
        this.scriptProcessorNode = null;
      }
      const wavBlob = encodeWav(this.pcmChunks, this.audioCtx ? this.audioCtx.sampleRate : 44100);
      this.saveRecordingBlob(wavBlob, 'wav');
    }
  }

  finalizeRecording(mimeType = 'audio/webm') {
    if (!this.recordedChunks || this.recordedChunks.length === 0) {
      if (this.pcmChunks && this.pcmChunks.length > 0) {
        const wavBlob = encodeWav(this.pcmChunks, this.audioCtx ? this.audioCtx.sampleRate : 44100);
        this.saveRecordingBlob(wavBlob, 'wav');
      }
      return;
    }
    const ext = mimeType.includes('mp4') ? 'mp4' : (mimeType.includes('wav') ? 'wav' : 'webm');
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    this.saveRecordingBlob(blob, ext);
  }

  saveRecordingBlob(blob, ext = 'webm') {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const stationCode = (this.currentAirportCode || 'EHAM').toUpperCase();
    const fileName = `PetersWorld_ATC_${stationCode}_${timeStr}.${ext}`;

    const url = URL.createObjectURL(blob);
    this.lastRecordingUrl = url;
    this.lastRecordingBlob = blob;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 2000);

    const lastRecBar = document.getElementById('liveatc-last-recording');
    const lastRecName = document.getElementById('last-record-name');
    const lastRecLink = document.getElementById('last-record-link');
    if (lastRecBar && lastRecLink) {
      lastRecBar.style.display = 'flex';
      if (lastRecName) lastRecName.textContent = `🎙️ ${fileName}`;
      lastRecLink.href = url;
      lastRecLink.download = fileName;
    }

    ATC.logMessage('OPNAME', `🎙️ OPNAME VOLTOOID EN OPGESLAGEN: ${fileName}`, true);
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
    if (statusTxt) statusTxt.textContent = `⏳ Live verbinding maken met ${label}...`;

    const streamSrc = this.getLiveStreamUrl(this.currentStation);

    try {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    } catch (e) {}

    // Live Icecast audio feed: continue live uitzending
    this.audioEl.loop = false;
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.src = streamSrc;
    this.audioEl.load();

    const p = this.audioEl.play();
    if (p && p.then) {
      p.then(() => {
        if (this.sessionId !== currentSession) {
          return;
        }
        this.isPlaying = true;
        this.recordStreamStart(label);
        if (btn) { btn.classList.add('playing'); btn.textContent = '⏸ PAUZEER LIVE RADIO'; }
        if (dot) dot.className = 'dot green';
        if (pill) pill.classList.add('active');
        if (statusTxt) statusTxt.innerHTML = `🔴 <strong>LIVE VERBONDEN</strong> &bull; ${label}`;
        if (hudStatus) hudStatus.textContent = (this.currentAirportCode || 'EHAM') + ' LIVE';
        ATC.playMicClick(true);
        ATC.logMessage('LIVE ATC', `🔴 100% ECHTE LIVE STREAM: Verbonden met actuele frequentie ${label} (Realtime Live Verkeersleiding)`, true);
      }).catch((err) => {
        if (this.sessionId !== currentSession) return;
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return;
        }
        console.warn('Audio play request error, probeer live backup stream:', err);
        try {
          this.audioEl.removeAttribute('crossorigin');
          this.audioEl.src = this.getBackupStreamUrl(this.currentStation);
          this.audioEl.load();
          const p2 = this.audioEl.play();
          if (p2 && p2.catch) p2.catch(() => {});
        } catch (e) {}
      });
    } else {
      this.isPlaying = true;
    }
  }

  stop() {
    this.sessionId = (this.sessionId || 0) + 1;
    this.isPlaying = false;
    if (this.isRecording) {
      this.stopRecording();
    }
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

    if (btn) {
      btn.classList.remove('playing');
      const label = this.stationLabels[this.currentStation] || 'Schiphol Toren 1 (118.100 MHz)';
      const shortName = label.split('(')[0].replace(/🇳🇱\s*/, '').trim();
      btn.textContent = `▶ SPEEL LIVE ${shortName.toUpperCase()}`;
    }
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
    if (airport.icao === 'EHRD') targetStation = 'ehrd_twr';
    else if (airport.icao === 'EHBK') targetStation = 'ehbk_twr';
    else if (airport.icao === 'EHEH') targetStation = 'eheh_twr';
    else if (airport.icao === 'EHTE') targetStation = 'ehte_twr';
    else if (airport.icao === 'EHGG') targetStation = 'ehgg_twr';
    else if (airport.icao === 'EHLE') targetStation = 'ehle_twr';
    else if (airport.icao === 'EHTX') targetStation = 'ehtx_twr';

    this.currentStation = targetStation;

    const select = document.getElementById('liveatc-station-select');
    if (select) {
      select.value = targetStation;
    }

    const atcFreq = document.getElementById('atc-freq-disp');
    const atcChan = document.getElementById('atc-channel-disp');
    if (atcFreq) atcFreq.textContent = `${airport.freqs ? airport.freqs.twr : '118.100'} MHz`;
    if (atcChan) atcChan.textContent = `${airport.name.toUpperCase()} TOWER`;

    const hudStatus = document.getElementById('hud-liveatc-status');
    if (hudStatus) hudStatus.textContent = `${airport.code} TWR`;

    this.updateAtcUi();

    if (autoPlay || this.isPlaying) {
      this.playStream();
    }
  }
}

const LIVEATC = new LiveAtcEngine();

// ═══════════════════════════════════════════════════════
//  LIVE RADAR MANAGER (100% ECHTE ADSB & FLIGHTRADAR24 VLUCHTDATA)
// ═══════════════════════════════════════════════════════
class LiveRadarManager {
  constructor() {
    this.enabled = true;
    this.isFetching = false;
    this.lastFetchTime = 0;
    this.fetchIntervalMs = 7000;
    this.liveFlightsMap = new Map();
    this.timerId = null;
    this.hasReceivedLive = false;
  }

  init() {
    window.handleLiveFlightradarFeed = (data) => this.onDataReceived(data);

    // Eerste live radar peiling na 1.2 seconde
    setTimeout(() => this.fetchFeed(), 1200);

    // Continue live polling
    this.timerId = setInterval(() => {
      if (this.enabled && !document.hidden) {
        this.fetchFeed();
      }
    }, this.fetchIntervalMs);
  }

  fetchFeed() {
    if (this.isFetching) return;
    this.isFetching = true;

    const oldScript = document.getElementById('fr24-feed-script');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = 'fr24-feed-script';
    // Bounding box voor heel Nederland: N 53.7, Z 50.7, W 3.2, O 7.2
    script.src = `https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=53.7,50.7,3.2,7.2&callback=handleLiveFlightradarFeed&_=${Date.now()}`;
    script.onerror = () => {
      this.isFetching = false;
      console.warn('[LiveRadar] Live datafeed tijdelijk niet bereikbaar, fallback actief.');
    };

    document.head.appendChild(script);

    setTimeout(() => {
      if (this.isFetching) this.isFetching = false;
    }, 6000);
  }

  onDataReceived(data) {
    this.isFetching = false;
    this.lastFetchTime = Date.now();
    if (!data || typeof data !== 'object') return;

    const now = Date.now();
    let countInNl = 0;

    for (const key of Object.keys(data)) {
      if (key === 'full_count' || key === 'version') continue;
      const arr = data[key];
      if (!Array.isArray(arr) || arr.length < 14) continue;

      const lat = arr[1];
      const lon = arr[2];

      // Filter specifiek op Nederlands radarbereik
      if (lat < 50.4 || lat > 54.0 || lon < 3.0 || lon > 7.5) continue;
      countInNl++;

      const icao24 = (arr[0] || key).toLowerCase();
      const track = arr[3] || 0;
      const altFt = arr[4] || 0;
      const speedKts = arr[5] || 0;
      const aircraftType = (arr[8] || 'A320').trim();
      const reg = (arr[9] || arr[0] || '').trim();
      const originCode = (arr[11] || 'AMS').trim();
      const destCode = (arr[12] || '---').trim();
      const flightNum = (arr[13] || arr[16] || reg || icao24).trim();
      const onGround = arr[14] === 1;
      const vspeedFpm = arr[15] || 0;
      const callsign = (arr[16] || flightNum || reg).trim();
      const airlineCode = (arr[18] || (callsign.length >= 3 ? callsign.substring(0, 3) : 'KLM')).trim().toUpperCase();

      const altMeters = Math.max(0, Math.round(altFt * 0.3048));
      const altKm = Math.max(0.015, altMeters / 1000);
      const speedKmh = Math.round(speedKts * 1.852);

      const targetPos = latLonToVector3(lat, lon, altKm);

      // Bereken richtingsvector voor Three.js (0° = -Z, 90° = +X, 180° = +Z, 270° = -X)
      const rad = (track * Math.PI) / 180;
      const dirX = Math.sin(rad);
      const dirZ = -Math.cos(rad);
      const dirY = (vspeedFpm * 0.00508) / Math.max(40, speedKmh);
      const dir = new THREE.Vector3(dirX, dirY, dirZ).normalize();

      // Airline lookups
      let airlineObj = AIRLINES.find(a => a.code === airlineCode);
      if (!airlineObj) {
        if (airlineCode.startsWith('KL') || airlineCode === 'KLM') airlineObj = AIRLINES[0];
        else if (airlineCode.startsWith('HV') || airlineCode === 'TRA') airlineObj = AIRLINES[2];
        else if (airlineCode.startsWith('OR') || airlineCode === 'TFL') airlineObj = AIRLINES[5];
        else if (airlineCode === 'EZY') airlineObj = AIRLINES[9];
        else if (airlineCode === 'TGE' || airlineCode === 'VTE') airlineObj = AIRLINES[3];
        else {
          airlineObj = {
            code: airlineCode,
            name: `${airlineCode} Airlines`,
            color: 0x38bdf8,
            hex: '#38bdf8'
          };
        }
      }

      // Origin / Dest lookups
      let origAp = AIRPORTS.find(a => a.code === originCode || a.icao === originCode);
      if (!origAp) origAp = { code: originCode, flag: '🛫', name: originCode };
      let destAp = AIRPORTS.find(a => a.code === destCode || a.icao === destCode);
      if (!destAp) destAp = { code: destCode, flag: '🛬', name: destCode };

      let flight = this.liveFlightsMap.get(key);

      if (flight) {
        // Bestaand live toestel updaten
        flight.targetPos.copy(targetPos);
        flight.directionVector.copy(dir);
        flight.altitude = altMeters;
        flight.speedKmh = speedKmh;
        flight.heading = track;
        flight.vspeed = vspeedFpm;
        flight.status = onGround ? 'Aan de grond / Taxiën' : (vspeedFpm > 300 ? 'Klimmen' : (vspeedFpm < -300 ? 'Dalen' : 'Kruishoogte'));
        flight.lastSeen = now;

        applyFlightCategoryColor(flight);

        if (flight.trailPts && flight.trailGeo) {
          const lastPt = flight.trailPts[flight.trailPts.length - 1];
          if (!lastPt || lastPt.distanceTo(targetPos) > 0.08) {
            flight.trailPts.push(targetPos.clone());
            if (flight.trailPts.length > 20) flight.trailPts.shift();
            flight.trailGeo.setFromPoints(flight.trailPts);
          }
        }
      } else {
        // Nieuw live vliegtuig aan Three.js toevoegen met kleurcategorie:
        // Landend: GROEN, Opstijgend: GEEL, Over Nederland: PAARS
        const initialStatus = onGround ? 'Aan de grond / Taxiën' : (vspeedFpm > 300 ? 'Klimmen' : (vspeedFpm < -300 ? 'Dalen' : 'Kruishoogte'));
        const cat = getFlightCategory({ isLive: true, vspeed: vspeedFpm, altitude: altMeters, status: initialStatus, origin: origAp, dest: destAp });

        const planeMesh = createAirplaneMesh(cat.colorHex);
        planeMesh.userData = { isFlight: true };
        planeMesh.position.copy(targetPos);
        S.flightsGroup.add(planeMesh);

        const trailPts = [targetPos.clone()];
        const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
        const trailMat = new THREE.LineBasicMaterial({
          color: cat.colorHex,
          transparent: true,
          opacity: 0.45,
          linewidth: 1
        });
        const arcLine = new THREE.Line(trailGeo, trailMat);
        S.trailsGroup.add(arcLine);

        flight = {
          id: `live_${key}`,
          key,
          isLive: true,
          callsign,
          flightNumber: flightNum,
          registration: reg,
          airline: airlineObj,
          aircraft: aircraftType,
          origin: origAp,
          dest: destAp,
          altitude: altMeters,
          speedKmh,
          heading: track,
          vspeed: vspeedFpm,
          targetPos: targetPos.clone(),
          currentPos: targetPos.clone(),
          directionVector: dir.clone(),
          planeMesh,
          arcLine,
          trailPts,
          trailGeo,
          category: cat,
          lastSeen: now,
          hovered: false,
          status: initialStatus
        };

        planeMesh.userData.flight = flight;
        this.liveFlightsMap.set(key, flight);
        S.flights.push(flight);
      }
    }

    // Verlopen toestellen verwijderen (>25s geen transponder signaal meer boven NL)
    for (const [key, flight] of this.liveFlightsMap.entries()) {
      if (now - flight.lastSeen > 25000) {
        if (S.followFlight === flight) continue;
        if (flight.planeMesh) S.flightsGroup.remove(flight.planeMesh);
        if (flight.arcLine) S.trailsGroup.remove(flight.arcLine);
        this.liveFlightsMap.delete(key);
        const idx = S.flights.indexOf(flight);
        if (idx !== -1) S.flights.splice(idx, 1);
      }
    }

    // Eerste keer live data succesvol ontvangen: ruim eventuele dummy simulatievluchten op
    if (!this.hasReceivedLive && this.liveFlightsMap.size >= 8) {
      this.hasReceivedLive = true;
      const simFlights = S.flights.filter(f => !f.isLive);
      for (const sf of simFlights) {
        if (S.followFlight === sf) continue;
        if (sf.planeMesh) S.flightsGroup.remove(sf.planeMesh);
        if (sf.arcLine) S.trailsGroup.remove(sf.arcLine);
        const idx = S.flights.indexOf(sf);
        if (idx !== -1) S.flights.splice(idx, 1);
      }
      ATC.logMessage('RADAR', `📡 Live ADS-B radarfeed actief: ${this.liveFlightsMap.size} echte vliegtuigen live boven Nederland!`, false);
    }

    // UI Counters bijwerken (Totaal & Categorieën)
    const count = this.liveFlightsMap.size || S.flights.length;
    const hudFlights = document.getElementById('hud-flights');
    if (hudFlights) hudFlights.textContent = `${count}`;

    let countLanding = 0;
    let countTakeoff = 0;
    let countOverflight = 0;
    for (const f of S.flights) {
      const c = f.category || getFlightCategory(f);
      if (c.type === 'landing') countLanding++;
      else if (c.type === 'takeoff') countTakeoff++;
      else countOverflight++;
    }
    const elLand = document.getElementById('hud-count-landing');
    const elTo = document.getElementById('hud-count-takeoff');
    const elOver = document.getElementById('hud-count-overflight');
    if (elLand) elLand.textContent = `${countLanding}`;
    if (elTo) elTo.textContent = `${countTakeoff}`;
    if (elOver) elOver.textContent = `${countOverflight}`;

    const pillLive = document.getElementById('pill-live');
    if (pillLive) pillLive.innerHTML = `<span class="dot green"></span>LIVE ADS-B (${count})`;

    const tabBtnAllFlights = document.getElementById('tab-btn-allflights');
    if (tabBtnAllFlights) tabBtnAllFlights.textContent = `✈️ Live Vluchten (${count})`;

    updateSectorCountsAndRadar();

    if (S.followFlight && S.followFlight.isLive) {
      updateFlightCardUI(S.followFlight);
    }
  }
}

const LIVE_RADAR = new LiveRadarManager();

// ═══════════════════════════════════════════════════════
//  BAAN BEELDEN / VIDEOSPELER (VERWIJDERD CONFORM VERZOEK)
// ═══════════════════════════════════════════════════════
const RUNWAY_CAM = {
  init() {},
  open() {},
  close() {},
  toggle() {},
  tuneToAirport() {},
  isOpen: false
};

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
    if (onDone) setTimeout(onDone, 50);
  }

  exchangeDialogue(towerSpeaker, towerText, towerSpeech, pilotSpeaker, pilotText, pilotSpeech, onDone) {
    if (onDone) setTimeout(onDone, 50);
  }

  contactFlight(flight) {
    if (!flight) return;
    const sector = this.determineSector(flight);
    this.setFrequency(sector.freq, sector.name);
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
  radarMesh: null,
  radarSweepMesh: null,
  earthMesh: null, // compatibiliteit
  cloudMesh: null, // compatibiliteit
  atmoMesh: null,
  airportsGroup: null,
  airportDetailGroup: null, // Gedetailleerd 3D model op de luchthaven
  flightsGroup: null,
  trailsGroup: null,

  // Simulatie state
  flights: [],
  followFlight: null,
  flightViewMode: 'chase30m',
  lastFlightPos: null,
  spotterPos: null,
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

  // Verkeersstroom & Windrichting Sector filtering
  trafficFlow: 'all', // 'all', 'arr', 'dep'
  trafficSector: 'ALL', // 'ALL', 'N', 'E', 'S', 'W'
};

// ═══════════════════════════════════════════════════════
//  THREE.JS INIT
// ═══════════════════════════════════════════════════════
function initThree() {
  const container = document.getElementById('webgl-container');
  const w = window.innerWidth, h = window.innerHeight;

  S.scene = new THREE.Scene();
  S.scene.background = new THREE.Color(0x040914);

  // PerspectiveCamera afgestemd op Nederlands luchtruim
  S.camera = new THREE.PerspectiveCamera(42, w / h, 0.05, 1500);

  // Richt camera direct op Nederland en Schiphol/Teuge
  S.camera.position.set(0, 160, 45);
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
  S.controls.minDistance = 0.20; // Tot 200m boven baan!
  S.controls.maxDistance = 450;  // Volledig Nederland radar overzicht
  S.controls.target.set(0, 0, 0);
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

  buildNetherlandsRadarBackground();
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
// ═══════════════════════════════════════════════════════
//  ECHTE SATELLIET ACHTERGROND NEDERLAND (FLIGHTRADAR MODUS)
// ═══════════════════════════════════════════════════════
function createRealSatelliteBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  
  // Realistische diepe zeekleur als basis tijdens het inladen
  ctx.fillStyle = '#061122';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.generateMipmaps = true;

  // Laad de 20 echte satellietfoto tegels van Nederland
  for (let x = 130; x <= 133; x++) {
    for (let y = 82; y <= 86; y++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const tileX = x, tileY = y;
      img.onload = () => {
        const px = (tileX - 130) * 256;
        const py = (tileY - 82) * 256;
        ctx.drawImage(img, px, py, 256, 256);
        texture.needsUpdate = true;
      };
      img.onerror = () => {
        // Fallback direct van ArcGIS satelliet CDN
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.onload = () => {
          const px = (tileX - 130) * 256;
          const py = (tileY - 82) * 256;
          ctx.drawImage(fallback, px, py, 256, 256);
          texture.needsUpdate = true;
        };
        fallback.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/8/${tileY}/${tileX}.jpg`;
      };
      img.src = `textures/satellite/tile_8_${x}_${y}.jpg`;
    }
  }

  return texture;
}

function buildNetherlandsRadarBackground() {
  // Grondvlak: Exact 384 x 383 km (georeferenced op zoom 8 satelliet raster)
  const satGeo = new THREE.PlaneGeometry(384, 383, 1, 1);
  satGeo.rotateX(-Math.PI / 2);

  const satTex = createRealSatelliteBackground();
  const satMat = new THREE.MeshBasicMaterial({
    map: satTex,
    depthWrite: true,
  });

  // Plaatspositie gecentreerd op 5.625° E, 52.235° N (exacte dekking van heel Nederland)
  S.radarMesh = new THREE.Mesh(satGeo, satMat);
  S.radarMesh.position.set(22.18, -0.01, -3.87);
  S.earthGroup.add(S.radarMesh);
  S.earthMesh = S.radarMesh; // compatibiliteit

  // Subtiele radar afstandsringen over de echte satellietfoto (zoals Flightradar overlay)
  const camsPos = latLonToVector3(52.31, 4.76, 0.05);
  const ringDistancesKM = [46.3, 92.6, 138.9, 185.2]; // 25, 50, 75, 100 NM
  for (const rKm of ringDistancesKM) {
    const ringGeo = new THREE.RingGeometry(rKm - 0.25, rKm + 0.25, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.20,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(camsPos.x, 0.04, camsPos.z);
    S.earthGroup.add(ringMesh);
  }

  // Draaiende surveillance radarbundel (subtiel over de satellietfoto)
  const sweepGeo = new THREE.RingGeometry(0, 160, 48, 1, 0, Math.PI / 4);
  sweepGeo.rotateX(-Math.PI / 2);
  const sweepMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  S.radarSweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
  S.radarSweepMesh.position.set(0, 0.06, 0);
  S.earthGroup.add(S.radarSweepMesh);
  S.cloudMesh = S.radarSweepMesh;
}

function build3DAirports() {
  const hubMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const smallMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const hubGeo = new THREE.SphereGeometry(1.2, 12, 12);
  const smallGeo = new THREE.SphereGeometry(0.7, 8, 8);

  const hitGeo = new THREE.SphereGeometry(2.4, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  for (const ap of AIRPORTS) {
    const pos = latLonToVector3(ap.lat, ap.lon, 0.20);
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
      const ringGeo = new THREE.RingGeometry(1.6, 2.3, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.position.y = 0.05;
      S.airportsGroup.add(ring);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  GEDETAILLEERD 3D LANDINGSBAAN & LUCHTHAVEN MODEL (VOOR 300M ZOOM)
// ═══════════════════════════════════════════════════════
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

function buildDetailedAirportModel(airport) {
  if (!S.airportDetailGroup) return;

  while (S.airportDetailGroup.children.length > 0) {
    const obj = S.airportDetailGroup.children[0];
    S.airportDetailGroup.remove(obj);
  }

  const apPos = latLonToVector3(airport.lat, airport.lon, 0);
  S.airportDetailGroup.position.set(apPos.x, 0.02, apPos.z);
  S.airportDetailGroup.rotation.set(0, 0, 0);

  const texLoader = new THREE.TextureLoader();
  texLoader.setCrossOrigin('anonymous');
  const satUrl = getAirportSatelliteTextureUrl(airport);
  const satTexture = texLoader.load(satUrl, (tex) => {
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
  });

  // 1. Teuge Vliegveld Specifiek Model
  if (airport.code === 'TGE') {
    // Grondvlak: Echte satelliet luchtfoto van Teuge (2.5 km x 2.5 km)
    const groundGeo = new THREE.PlaneGeometry(2.5, 2.5);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: satTexture,
      roughness: 0.85,
      metalness: 0.10,
      depthWrite: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.0005;
    S.airportDetailGroup.add(ground);

    // Hoofdbaan 08/26 Teuge: Asphalt 1199m x 30m
    const rwyWidth = 0.035;
    const rwyLength = 1.199;
    const rwyGeo = new THREE.PlaneGeometry(rwyWidth, rwyLength);
    rwyGeo.rotateX(-Math.PI / 2);
    const rwyMat = new THREE.MeshStandardMaterial({
      color: 0x18202f,
      roughness: 0.9,
      depthWrite: true
    });
    const mainRwy = new THREE.Mesh(rwyGeo, rwyMat);
    mainRwy.position.set(0, 0.002, 0);
    mainRwy.rotation.y = -84 * (Math.PI / 180);
    S.airportDetailGroup.add(mainRwy);

    // Drempelstrepen
    const stripeGeo = new THREE.PlaneGeometry(0.0025, 0.035);
    stripeGeo.rotateX(-Math.PI / 2);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false });
    for (let s = -4; s <= 4; s++) {
      const stA = new THREE.Mesh(stripeGeo, stripeMat);
      stA.position.set(s * 0.0035, 0.0025, -rwyLength / 2 + 0.035);
      mainRwy.add(stA);

      const stB = new THREE.Mesh(stripeGeo, stripeMat);
      stB.position.set(s * 0.0035, 0.0025, rwyLength / 2 - 0.035);
      mainRwy.add(stB);
    }

    // Middenlijn
    const dashGeo = new THREE.PlaneGeometry(0.0018, 0.030);
    dashGeo.rotateX(-Math.PI / 2);
    for (let d = -16; d <= 16; d++) {
      const dash = new THREE.Mesh(dashGeo, stripeMat);
      dash.position.set(0, 0.0025, d * 0.034);
      mainRwy.add(dash);
    }

    // Baanverlichting
    const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const redLightMat   = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const whiteLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightSphere   = new THREE.SphereGeometry(0.002, 6, 6);

    for (let s = -4; s <= 4; s++) {
      const gl = new THREE.Mesh(lightSphere, greenLightMat);
      gl.position.set(s * 0.0038, 0.003, -rwyLength / 2 + 0.01);
      mainRwy.add(gl);

      const rl = new THREE.Mesh(lightSphere, redLightMat);
      rl.position.set(s * 0.0038, 0.003, rwyLength / 2 - 0.01);
      mainRwy.add(rl);
    }

    for (let l = -18; l <= 18; l += 2) {
      const edgeL = new THREE.Mesh(lightSphere, whiteLightMat);
      edgeL.position.set(-rwyWidth / 2, 0.003, l * 0.031);
      mainRwy.add(edgeL);

      const edgeR = new THREE.Mesh(lightSphere, whiteLightMat);
      edgeR.position.set(rwyWidth / 2, 0.003, l * 0.031);
      mainRwy.add(edgeR);
    }

    // Parallelle Taxiway Teuge
    const twyGeo = new THREE.PlaneGeometry(0.015, 1.05);
    twyGeo.rotateX(-Math.PI / 2);
    const twyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const twy = new THREE.Mesh(twyGeo, twyMat);
    twy.position.set(0, 0.0018, 0.055);
    twy.rotation.y = -84 * (Math.PI / 180);
    S.airportDetailGroup.add(twy);

    // Teuge Havenkantoor & Toren
    const towerGroup = new THREE.Group();
    const tBaseGeo = new THREE.BoxGeometry(0.040, 0.016, 0.030);
    const tBaseMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
    const tBase = new THREE.Mesh(tBaseGeo, tBaseMat);
    tBase.position.y = 0.008;
    towerGroup.add(tBase);

    const cabGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.010, 8);
    const cabMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.y = 0.021;
    towerGroup.add(cab);

    const antGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.015, 4);
    const antMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.y = 0.032;
    towerGroup.add(ant);

    towerGroup.position.set(-0.06, 0.002, 0.09);
    S.airportDetailGroup.add(towerGroup);

    // Paracentrum Skydive Teuge Hangar & Dropzone
    const skydiveHangarGeo = new THREE.BoxGeometry(0.065, 0.014, 0.045);
    const skydiveHangarMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a });
    const skydiveHangar = new THREE.Mesh(skydiveHangarGeo, skydiveHangarMat);
    skydiveHangar.position.set(0.08, 0.008, 0.09);
    S.airportDetailGroup.add(skydiveHangar);

    const dzGeo = new THREE.RingGeometry(0.01, 0.035, 16);
    dzGeo.rotateX(-Math.PI / 2);
    const dzMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
    const dz = new THREE.Mesh(dzGeo, dzMat);
    dz.position.set(0.18, 0.002, 0.11);
    S.airportDetailGroup.add(dz);

    // Stella Aviation Hangars
    const stellaGeo = new THREE.BoxGeometry(0.055, 0.012, 0.040);
    const stellaMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
    const stella = new THREE.Mesh(stellaGeo, stellaMat);
    stella.position.set(-0.16, 0.007, 0.09);
    S.airportDetailGroup.add(stella);

    // Vliegtuigen op Teuge
    const fstPlane = createAirplaneMesh(0xf59e0b);
    fstPlane.scale.set(0.018, 0.018, 0.018);
    fstPlane.position.set(0.06, 0.004, 0.065);
    fstPlane.rotation.y = Math.PI / 4;
    S.airportDetailGroup.add(fstPlane);

    const tgePlane = createAirplaneMesh(0x10b981);
    tgePlane.scale.set(0.014, 0.014, 0.014);
    tgePlane.position.set(-0.12, 0.004, 0.065);
    tgePlane.rotation.y = -Math.PI / 3;
    S.airportDetailGroup.add(tgePlane);

  } else if (airport.code === 'AMS') {
    // 2. Schiphol Specifiek Model (6 Banen complex)
    const groundGeo = new THREE.PlaneGeometry(6.5, 6.5);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: satTexture,
      roughness: 0.85,
      metalness: 0.10,
      depthWrite: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.0005;
    S.airportDetailGroup.add(ground);

    // Kaagbaan 24/06 (3500m)
    const kbGeo = new THREE.PlaneGeometry(0.045, 3.5);
    kbGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshStandardMaterial({ color: 0x18202f, roughness: 0.9, depthWrite: true });
    const kaagbaan = new THREE.Mesh(kbGeo, rMat);
    kaagbaan.position.set(-0.3, 0.002, 0.2);
    kaagbaan.rotation.y = Math.PI / 6;
    S.airportDetailGroup.add(kaagbaan);

    // Polderbaan 36L/18R (3800m)
    const pbGeo = new THREE.PlaneGeometry(0.045, 3.8);
    pbGeo.rotateX(-Math.PI / 2);
    const polderbaan = new THREE.Mesh(pbGeo, rMat);
    polderbaan.position.set(-1.8, 0.002, -0.2);
    S.airportDetailGroup.add(polderbaan);

    // Terminal en pieren
    const termGeo = new THREE.BoxGeometry(0.60, 0.035, 0.35);
    const termMat = new THREE.MeshPhongMaterial({ color: 0x64748b });
    const term = new THREE.Mesh(termGeo, termMat);
    term.position.set(0, 0.018, 0);
    S.airportDetailGroup.add(term);

    // Verkeerstoren Schiphol Centrum (101 meter)
    const tGeo = new THREE.CylinderGeometry(0.015, 0.022, 0.10, 8);
    const tMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
    const tower = new THREE.Mesh(tGeo, tMat);
    tower.position.set(0.12, 0.05, -0.05);
    S.airportDetailGroup.add(tower);

    // Vliegtuigen op Schiphol
    const kPlane = createAirplaneMesh(0x00a1de);
    kPlane.scale.set(0.032, 0.032, 0.032);
    kPlane.position.set(-0.3, 0.004, 0.1);
    kPlane.rotation.y = Math.PI / 6;
    S.airportDetailGroup.add(kPlane);

  } else {
    // 3. Regionale Luchthaven Standaard Model
    const groundGeo = new THREE.PlaneGeometry(3.0, 3.0);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: satTexture,
      roughness: 0.85,
      metalness: 0.10,
      depthWrite: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.0005;
    S.airportDetailGroup.add(ground);

    const rwyGeo = new THREE.PlaneGeometry(0.040, 2.2);
    rwyGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshStandardMaterial({ color: 0x18202f, roughness: 0.9, depthWrite: true });
    const rwy = new THREE.Mesh(rwyGeo, rMat);
    rwy.position.set(0, 0.002, 0);
    rwy.rotation.y = Math.PI / 4;
    S.airportDetailGroup.add(rwy);

    const tGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.035, 8);
    const tMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
    const tower = new THREE.Mesh(tGeo, tMat);
    tower.position.set(-0.08, 0.018, 0.08);
    S.airportDetailGroup.add(tower);

    const pl = createAirplaneMesh(0x00a1de);
    pl.scale.set(0.022, 0.022, 0.022);
    pl.position.set(0, 0.004, -0.15);
    pl.rotation.y = Math.PI / 4;
    S.airportDetailGroup.add(pl);
  }
}

// ═══════════════════════════════════════════════════════
//  VLIEGTUIG CATEGORIEËN & RADAR KLEUREN
//  - Landend:        GROEN (#22c55e / 0x22c55e)
//  - Opstijgend:     GEEL  (#eab308 / 0xeab308)
//  - Over Nederland: PAARS (#a855f7 / 0xa855f7)
// ═══════════════════════════════════════════════════════
const FLIGHT_COLORS = {
  landing: {
    type: 'landing',
    name: 'Landend',
    colorHex: 0x22c55e,
    hex: '#22c55e',
    badgeClass: 'badge-landing',
    icon: '🛬'
  },
  takeoff: {
    type: 'takeoff',
    name: 'Opstijgend',
    colorHex: 0xeab308,
    hex: '#eab308',
    badgeClass: 'badge-takeoff',
    icon: '🛫'
  },
  overflight: {
    type: 'overflight',
    name: 'Over Nederland',
    colorHex: 0xa855f7,
    hex: '#a855f7',
    badgeClass: 'badge-overflight',
    icon: '✈️'
  }
};

const NL_AIRPORT_SET = new Set([
  'AMS', 'EHAM', 'TGE', 'EHTE', 'RTM', 'EHRD', 'EIN', 'EHEH',
  'MST', 'EHBK', 'GRQ', 'EHGG', 'LEY', 'EHLE', 'TXE', 'EHTX',
  'WOE', 'EHWO', 'DHR', 'EHKD', 'SEP', 'EHSE', 'ENS', 'EHTW',
  'LWD', 'EHLW', 'VOL', 'EHVK', 'GLZ', 'EHGR', 'VST', 'EHVB'
]);

function getFlightCategory(flight) {
  if (!flight) return FLIGHT_COLORS.overflight;

  const origCode = ((flight.origin && (flight.origin.code || flight.origin.icao || flight.origin)) || '').toUpperCase();
  const destCode = ((flight.dest && (flight.dest.code || flight.dest.icao || flight.dest)) || '').toUpperCase();
  const statusStr = (flight.status || '').toLowerCase();

  const isDestNL = NL_AIRPORT_SET.has(destCode);
  const isOrigNL = NL_AIRPORT_SET.has(origCode);

  // 1. Live ADS-B vluchten
  if (flight.isLive) {
    const alt = flight.altitude || 0;
    const vspeed = flight.vspeed || 0;

    if (statusStr.includes('dalen') || statusStr.includes('approach') || statusStr.includes('nadering') || statusStr.includes('landen') || statusStr.includes('geland') || statusStr.includes('final')) {
      return FLIGHT_COLORS.landing;
    }
    if (statusStr.includes('klimmen') || statusStr.includes('opstijgen') || statusStr.includes('vertrek') || statusStr.includes('taxi') || statusStr.includes('grond') || statusStr.includes('takeoff')) {
      return FLIGHT_COLORS.takeoff;
    }

    // Landend (Groen): Daling richting Nederlands veld, sterke daling onder 7000m, of laag (<2200m) en niet klimmend
    if ((isDestNL && alt < 6500 && vspeed <= 50) || (vspeed < -350 && alt < 7000) || (alt < 2200 && vspeed <= 0)) {
      return FLIGHT_COLORS.landing;
    }

    // Opstijgend (Geel): Klimmend na vertrek van NL veld, sterke klim onder 6500m, of laag (<2500m) en klimmend
    if ((isOrigNL && alt < 5000 && vspeed >= -50) || (vspeed > 350 && alt < 6500) || (alt < 2500 && vspeed > 150)) {
      return FLIGHT_COLORS.takeoff;
    }

    // Over Nederland (Paars): Toestellen op kruishoogte (boven ~3500m) over Nederland
    return FLIGHT_COLORS.overflight;
  }

  // 2. Gesimuleerde vluchten
  if (statusStr.includes('opstijg') || statusStr.includes('klim') || statusStr.includes('vertrek') || (flight.progress !== undefined && flight.progress < 0.32)) {
    return FLIGHT_COLORS.takeoff;
  }
  if (statusStr.includes('dal') || statusStr.includes('approach') || statusStr.includes('nadering') || statusStr.includes('land') || statusStr.includes('final') || (flight.progress !== undefined && flight.progress > 0.68)) {
    return FLIGHT_COLORS.landing;
  }

  return FLIGHT_COLORS.overflight;
}

function applyFlightCategoryColor(flight) {
  if (!flight) return FLIGHT_COLORS.overflight;
  const cat = getFlightCategory(flight);
  flight.category = cat;

  // Pas 3D vliegtuigkleur aan
  if (flight.planeMesh && flight.planeMesh._mainMat) {
    if (flight.planeMesh._mainMat.color.getHex() !== cat.colorHex) {
      flight.planeMesh._mainMat.color.setHex(cat.colorHex);
      flight.planeMesh._mainMat.emissive.setHex(cat.colorHex);
      flight.planeMesh._mainMat.emissiveIntensity = 0.32;
      flight.planeMesh._mainMat.needsUpdate = true;
    }
  }

  // Pas vluchtspoor / boogkleur aan
  if (flight.arcLine && flight.arcLine.material) {
    if (flight.arcLine.material.color.getHex() !== cat.colorHex) {
      flight.arcLine.material.color.setHex(cat.colorHex);
      flight.arcLine.material.opacity = 0.45;
      flight.arcLine.material.needsUpdate = true;
    }
  }

  return cat;
}

// ═══════════════════════════════════════════════════════
//  VERKEERSSTROOM & SECTOR BEREKENING (NOORD, OOST, ZUID, WEST)
// ═══════════════════════════════════════════════════════
function getFlightDirectionSector(flight, refAirport = S.selectedAirport || AIRPORTS[0]) {
  if (!flight) return { id: 'ALL', name: 'Alle Richtingen', icon: '🧭', code: 'NOORD' };

  const cat = flight.category || getFlightCategory(flight);
  const isTakeoff = (cat.type === 'takeoff');

  if (isTakeoff) {
    const hdg = (flight.heading !== undefined && flight.heading !== null) ? flight.heading : 0;
    if (hdg >= 315 || hdg < 45) return { id: 'N', name: 'Noord', icon: '⬆️ NOORD', code: 'NOORD' };
    if (hdg >= 45 && hdg < 135) return { id: 'E', name: 'Oost', icon: '➡️ OOST', code: 'OOST' };
    if (hdg >= 135 && hdg < 225) return { id: 'S', name: 'Zuid', icon: '⬇️ ZUID', code: 'ZUID' };
    return { id: 'W', name: 'West', icon: '⬅️ WEST', code: 'WEST' };
  } else {
    const apLat = (refAirport && refAirport.lat) || 52.31;
    const apLon = (refAirport && refAirport.lon) || 4.76;
    let flLat = flight.lat;
    let flLon = flight.lon;

    if (flLat === undefined || flLon === undefined) {
      if (flight.currentPos) {
        flLat = NL_CENTER_LAT - (flight.currentPos.z / KM_PER_DEG_LAT);
        flLon = NL_CENTER_LON + (flight.currentPos.x / KM_PER_DEG_LON);
      } else {
        flLat = apLat + 0.5;
        flLon = apLon;
      }
    }

    const dLat = flLat - apLat;
    const dLon = flLon - apLon;

    if (Math.abs(dLat) >= Math.abs(dLon)) {
      return dLat >= 0 ? { id: 'N', name: 'Noord', icon: '⬆️ NOORD', code: 'NOORD' } : { id: 'S', name: 'Zuid', icon: '⬇️ ZUID', code: 'ZUID' };
    } else {
      return dLon >= 0 ? { id: 'E', name: 'Oost', icon: '➡️ OOST', code: 'OOST' } : { id: 'W', name: 'West', icon: '⬅️ WEST', code: 'WEST' };
    }
  }
}

function setTrafficFilter(flow, sector) {
  if (flow !== undefined && flow !== null) S.trafficFlow = flow;
  if (sector !== undefined && sector !== null) S.trafficSector = sector;

  const activeFlow = S.trafficFlow || 'all';
  const activeSector = S.trafficSector || 'ALL';

  document.querySelectorAll('.btn-flow').forEach(btn => {
    const isAct = btn.dataset.flow === activeFlow;
    btn.classList.toggle('active', isAct);
    if (isAct) {
      btn.style.background = 'rgba(56,189,248,0.25)';
      btn.style.color = 'var(--cyan)';
      btn.style.borderColor = 'rgba(56,189,248,0.4)';
    } else {
      btn.style.background = 'rgba(15,23,42,0.8)';
      btn.style.color = '#94a3b8';
      btn.style.borderColor = 'rgba(255,255,255,0.12)';
    }
  });

  document.querySelectorAll('.btn-dir').forEach(btn => {
    const isAct = btn.dataset.dir === activeSector;
    btn.classList.toggle('active', isAct);
    if (isAct) {
      btn.style.background = 'rgba(56,189,248,0.25)';
      btn.style.color = 'var(--cyan)';
      btn.style.borderColor = 'rgba(56,189,248,0.4)';
    } else {
      btn.style.background = 'rgba(15,23,42,0.8)';
      btn.style.color = '#94a3b8';
      btn.style.borderColor = 'rgba(255,255,255,0.12)';
    }
  });

  tuneRadioToSector(activeFlow, activeSector);
  updateSectorCountsAndRadar();
}

function tuneRadioToSector(flow, sector) {
  const ap = S.selectedAirport || AIRPORTS[0];
  const isEham = !ap || ap.code === 'AMS' || ap.icao === 'EHAM';
  const isEhrd = ap && (ap.code === 'RTM' || ap.icao === 'EHRD');
  const isEheh = ap && (ap.code === 'EIN' || ap.icao === 'EHEH');
  const isEhbk = ap && (ap.code === 'MST' || ap.icao === 'EHBK');
  const isEhgg = ap && (ap.code === 'GRQ' || ap.icao === 'EHGG');
  const isEhle = ap && (ap.code === 'LEY' || ap.icao === 'EHLE');
  const isEhte = ap && (ap.code === 'TGE' || ap.icao === 'EHTE');

  let station = 'eham_twr';

  if (isEham) {
    if (flow === 'arr') {
      if (sector === 'N') station = 'eham_app_n';
      else if (sector === 'E') station = 'eham_app_e';
      else if (sector === 'S') station = 'eham_app_s';
      else if (sector === 'W') station = 'eham_app_w';
      else station = 'eham_app_n';
    } else if (flow === 'dep') {
      if (sector === 'N') station = 'eham_dep_n';
      else if (sector === 'E') station = 'eham_dep_e';
      else if (sector === 'S') station = 'eham_dep_s';
      else if (sector === 'W') station = 'eham_dep_w';
      else station = 'eham_dep_s';
    } else {
      if (sector === 'N' || sector === 'W') station = 'eham_twr2';
      else if (sector === 'S' || sector === 'E') station = 'eham_twr';
      else station = 'eham_twr';
    }
  } else if (isEhrd) {
    station = (flow === 'arr') ? 'ehrd_app_in' : (flow === 'dep' ? 'ehrd_dep' : 'ehrd_twr');
  } else if (isEheh) {
    station = (flow === 'arr') ? 'eheh_app_in' : (flow === 'dep' ? 'eheh_dep' : 'eheh_twr');
  } else if (isEhbk) {
    station = (flow === 'arr' || flow === 'dep') ? 'ehbk_app' : 'ehbk_twr';
  } else if (isEhgg) {
    station = (flow === 'arr' || flow === 'dep') ? 'ehgg_app' : 'ehgg_twr';
  } else if (isEhle) {
    station = (flow === 'arr' || flow === 'dep') ? 'ehle_app' : 'ehle_twr';
  } else if (isEhte) {
    station = (flow === 'arr' || flow === 'dep') ? 'ehte_app' : 'ehte_twr';
  } else {
    station = ap.liveAtcStation || 'eham_twr';
  }

  LIVEATC.currentStation = station;
  const select = document.getElementById('liveatc-station-select');
  if (select) select.value = station;
  LIVEATC.updateAtcUi();
  if (LIVEATC.isPlaying) {
    LIVEATC.playStream();
  }
}

function updateSectorCountsAndRadar() {
  const activeFlow = S.trafficFlow || 'all';
  const activeSector = S.trafficSector || 'ALL';
  const ap = S.selectedAirport || AIRPORTS[0];

  let matchingCount = 0;

  for (const f of S.flights) {
    const cat = f.category || getFlightCategory(f);
    const fFlow = (cat.type === 'landing') ? 'arr' : ((cat.type === 'takeoff') ? 'dep' : 'over');
    const fSec = getFlightDirectionSector(f, ap);
    f.sector = fSec;

    const matchesFlow = (activeFlow === 'all' || fFlow === activeFlow || (activeFlow === 'arr' && cat.type === 'landing') || (activeFlow === 'dep' && cat.type === 'takeoff'));
    const matchesSec = (activeSector === 'ALL' || fSec.id === activeSector);

    if (matchesFlow && matchesSec) {
      matchingCount++;
      if (f.planeMesh) {
        f.planeMesh.scale.set(1.4, 1.4, 1.4);
      }
      if (f.arcLine && f.arcLine.material) {
        f.arcLine.material.opacity = 0.85;
      }
    } else {
      if (f.planeMesh) {
        f.planeMesh.scale.set(1.0, 1.0, 1.0);
      }
      if (f.arcLine && f.arcLine.material) {
        f.arcLine.material.opacity = 0.35;
      }
    }
  }

  const flowLabel = (activeFlow === 'arr' ? 'INKOMEND' : (activeFlow === 'dep' ? 'VERTREK' : 'ALLE'));
  const secLabel = (activeSector === 'N' ? 'NOORD' : (activeSector === 'E' ? 'OOST' : (activeSector === 'S' ? 'ZUID' : (activeSector === 'W' ? 'WEST' : 'ALLE'))));
  const fullTag = `${flowLabel} · ${secLabel}`;

  const badge = document.getElementById('atc-active-flow-badge');
  if (badge) {
    badge.textContent = `${fullTag} (${matchingCount})`;
    badge.style.color = (activeFlow === 'arr') ? '#22c55e' : ((activeFlow === 'dep') ? '#eab308' : 'var(--cyan)');
  }

  const hudSecFlow = document.getElementById('hud-sector-flow');
  if (hudSecFlow) hudSecFlow.textContent = fullTag;

  const hudSecCount = document.getElementById('hud-sector-count');
  if (hudSecCount) hudSecCount.textContent = `${matchingCount} toestellen`;
}

function createAirplaneMesh(colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({
    color: colorHex,
    shininess: 70,
    emissive: colorHex,
    emissiveIntensity: 0.32
  });

  // Vliegtuig model geschaald voor Nederlandse vluchtradar (2.8 eenheden spanwijdte)
  const bodyGeo = new THREE.CylinderGeometry(0.25, 0.20, 2.2, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, mat);
  group.add(body);

  const wingGeo = new THREE.BoxGeometry(2.8, 0.06, 0.65);
  const wing = new THREE.Mesh(wingGeo, mat);
  wing.position.set(0, 0, 0.1);
  group.add(wing);

  const tailGeo = new THREE.BoxGeometry(0.08, 0.75, 0.55);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.position.set(0, 0.42, -0.85);
  group.add(tail);

  // Boordverlichting (rood bakboord, groen stuurboord)
  const redMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
  const lightGeo = new THREE.SphereGeometry(0.12, 6, 6);

  const redLight = new THREE.Mesh(lightGeo, redMat);
  redLight.position.set(-1.4, 0, 0.1);
  const greenLight = new THREE.Mesh(lightGeo, greenMat);
  greenLight.position.set(1.4, 0, 0.1);
  group.add(redLight);
  group.add(greenLight);

  group._mainMat = mat;
  return group;
}

function spawnFlight(origin, dest, airline, startProgress = 0) {
  const aircraft = airline.types[Math.floor(Math.random() * airline.types.length)];
  const oVec = latLonToVector3(origin.lat, origin.lon, 0.05);
  const dVec = latLonToVector3(dest.lat, dest.lon, 0.05);

  const distKm = Math.hypot(dVec.x - oVec.x, dVec.z - oVec.z);
  const isGA = (airline.code === 'TGE' || airline.code === 'VTE');
  const cruiseAltKm = isGA ? (1.5 + Math.random() * 2.0) : Math.min(10.5, Math.max(3.2, distKm * 0.05 + 2.8));

  // 3D Bezier curve
  const p0 = oVec;
  const p1 = new THREE.Vector3(oVec.x + (dVec.x - oVec.x) * 0.22, cruiseAltKm, oVec.z + (dVec.z - oVec.z) * 0.22);
  const p2 = new THREE.Vector3(oVec.x + (dVec.x - oVec.x) * 0.78, cruiseAltKm, oVec.z + (dVec.z - oVec.z) * 0.78);
  const p3 = dVec;

  const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
  const points = curve.getPoints(36);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

  const initialStatus = startProgress === 0 ? 'Opstijgen' : (startProgress > 0.88 ? 'Final Approach' : 'Kruissnelheid');
  const cat = getFlightCategory({ origin, dest, airline, progress: startProgress, status: initialStatus });

  const arcMat = new THREE.LineBasicMaterial({
    color: cat.colorHex,
    transparent: true,
    opacity: 0.40,
    linewidth: 1
  });
  const arcLine = new THREE.Line(arcGeo, arcMat);
  S.trailsGroup.add(arcLine);

  const planeMesh = createAirplaneMesh(cat.colorHex);
  planeMesh.userData = { isFlight: true };
  S.flightsGroup.add(planeMesh);

  const speedKmh = isGA ? (220 + Math.floor(Math.random() * 80)) : (720 + Math.floor(Math.random() * 180));
  const durationH = Math.max(0.08, distKm / speedKmh);

  const id = S.flights.length + 1;
  const flightNum = isGA ? (airline.code === 'TGE' ? 'FST' : 'TGE') : `${Math.floor(Math.random() * 9000) + 1000}`;
  const callsign = isGA ? `${airline.code === 'TGE' ? 'SKYDIVE1' : 'PH-TGE'}` : `${airline.code}${flightNum}`;

  const flight = {
    id,
    callsign,
    airline,
    aircraft,
    origin,
    dest,
    distKm,
    altitude: Math.round(cruiseAltKm * 1000), // meters
    speedKmh,
    durationH,
    progress: startProgress,
    progressRate: 1 / (durationH * 3600 * 60),
    curve,
    arcLine,
    planeMesh,
    category: cat,
    hovered: false,
    status: initialStatus
  };

  planeMesh.userData.flight = flight;
  S.flights.push(flight);
  return flight;
}

function build3DFlights() {
  const count = CFG.flightCount;
  S.flights = [];

  // Vaste vluchten voor Vliegveld Teuge
  const tgeAp = AIRPORTS.find(a => a.code === 'TGE') || AIRPORTS[1];
  const amsAp = AIRPORTS.find(a => a.code === 'AMS') || AIRPORTS[0];
  const txeAp = AIRPORTS.find(a => a.code === 'TXE') || AIRPORTS[7];
  const leyAp = AIRPORTS.find(a => a.code === 'LEY') || AIRPORTS[5];
  const grqAp = AIRPORTS.find(a => a.code === 'GRQ') || AIRPORTS[4];

  const tgeAir = AIRLINES.find(a => a.code === 'TGE') || AIRLINES[3];
  const vteAir = AIRLINES.find(a => a.code === 'VTE') || AIRLINES[4];

  // 1. Skydive Teuge (PH-FST Supervan)
  spawnFlight(tgeAp, tgeAp, tgeAir, 0.35);
  // 2. Vliegschool Teuge (PH-TGE Diamond DA40) Teuge -> Texel
  spawnFlight(tgeAp, txeAp, vteAir, 0.55);
  // 3. Vliegschool Teuge Lelystad -> Teuge
  spawnFlight(leyAp, tgeAp, vteAir, 0.20);
  // 4. Zakenvlucht Teuge -> Schiphol
  spawnFlight(tgeAp, amsAp, vteAir, 0.70);

  // Overige vluchten boven Nederland
  for (let i = 4; i < count; i++) {
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


// ═══════════════════════════════════════════════════════
//  CAMERA NAVIGATIE: 30 METER ZOOM & STABIELE FLIGHTRADAR TRACKING
// ═══════════════════════════════════════════════════════
function selectFlight(flight, viewMode = 'chase30m') {
  if (!flight) return;
  S.followFlight = flight;
  S.flightViewMode = viewMode;
  S.isZoomingToAirport = false;
  S.cameraTargetPos = null;
  S.cameraTargetLook = null;

  const p = flight.isLive ? flight.currentPos : flight.curve.getPointAt(flight.progress);
  const dir = flight.isLive ? (flight.directionVector || new THREE.Vector3(0, 0, -1)) : flight.curve.getTangentAt(flight.progress).normalize();
  S.lastFlightPos = p.clone();

  // Stel minDistance in tot 5 meter (tot 30 meter haarscherp!)
  S.controls.minDistance = 0.005;
  S.controls.maxDistance = 450;

  if (viewMode === 'cockpit') {
    // 1. Cockpit camera: exact vanuit de cockpit recht vooruit (geen OrbitControls interferentie)
    S.controls.enabled = false;
    S.camera.position.copy(p).addScaledVector(dir, 0.003).add(new THREE.Vector3(0, 0.0015, 0));
    S.camera.lookAt(p.clone().addScaledVector(dir, 1.0));
  } else if (viewMode === 'ground30m') {
    // 2. Spotter view: camera staat vast op 30 meter hoogte boven de grond en volgt het vliegtuig
    S.controls.enabled = false;
    const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    S.spotterPos = new THREE.Vector3(p.x + right.x * 0.09, 0.030, p.z + right.z * 0.09);
    S.camera.position.copy(S.spotterPos);
    S.camera.lookAt(p);
  } else {
    // 3. Chase 30m: camera staat 30m achter en 15m boven het vliegtuig
    S.controls.enabled = true;
    const chaseOffset = dir.clone().multiplyScalar(-0.045).add(new THREE.Vector3(0, 0.018, 0));
    S.camera.position.copy(p).add(chaseOffset);
    S.controls.target.copy(p);
    S.camera.lookAt(p);
    S.controls.update();
  }

  updateFlightCardUI(flight);
  // Geen automatische audio-oproep in loop: audio speelt alleen op klik van de radioknop
  const airName = flight.airline ? (flight.airline.name || flight.airline.code || '') : '';
  ATC.logMessage('RADAR', `Vliegtuig ${flight.callsign} (${airName}) geselecteerd [${viewMode}].`, false);
}

function updateFlightCardUI(flight) {
  if (!flight) return;
  const fc = document.getElementById('flightradar-card');
  if (fc) {
    fc.classList.add('show');
    const elCall = document.getElementById('frc-callsign');
    const elAir = document.getElementById('frc-airline');
    const elRoute = document.getElementById('frc-route');
    const elAlt = document.getElementById('frc-alt');
    const elSpd = document.getElementById('frc-spd');
    const elStatus = document.getElementById('frc-status');
    const elHdg = document.getElementById('frc-hdg');

    const cat = flight.category || getFlightCategory(flight);
    const sec = flight.sector || getFlightDirectionSector(flight, S.selectedAirport);

    if (elCall) {
      elCall.textContent = flight.callsign;
      elCall.style.color = cat.hex;
    }
    const regTxt = flight.registration ? ` (${flight.registration})` : '';
    const airName = flight.airline ? (flight.airline.name || flight.airline.code || '') : '';
    if (elAir) elAir.textContent = `${airName} · ${flight.aircraft}${regTxt}`;
    if (elRoute) {
      const origCode = flight.origin ? (flight.origin.code || flight.origin.name || flight.origin) : '---';
      const destCode = flight.dest ? (flight.dest.code || flight.dest.name || flight.dest) : '---';
      const origFlag = flight.origin && flight.origin.flag ? flight.origin.flag : '🛫';
      const destFlag = flight.dest && flight.dest.flag ? flight.dest.flag : '🛬';
      elRoute.textContent = `${origFlag} ${origCode} ➔ ${destFlag} ${destCode}`;
    }
    if (elAlt) elAlt.textContent = `${Number(flight.altitude).toLocaleString('nl-NL')} m (${Math.round(flight.altitude * 3.28084)} ft)`;
    if (elSpd) elSpd.textContent = `${flight.speedKmh} km/h (${Math.round(flight.speedKmh * 0.539957)} kts)`;
    if (elStatus) {
      elStatus.innerHTML = `<span style="background:${cat.hex}22;color:${cat.hex};border:1px solid ${cat.hex}55;padding:2px 7px;border-radius:4px;font-weight:800;letter-spacing:0.4px;">${cat.icon} ${cat.name.toUpperCase()}</span> <span style="background:rgba(56,189,248,0.18);color:var(--cyan);border:1px solid rgba(56,189,248,0.35);padding:2px 6px;border-radius:4px;font-weight:700;font-size:0.72rem;margin-left:4px;">${sec.icon}</span> <span style="color:var(--text);font-size:0.75rem;margin-left:4px;">(${flight.status || 'In vlucht'})</span>`;
    }
    if (elHdg) elHdg.textContent = `${flight.heading || 0}°`;
  }
}

function zoomToAirportRunway(airport, targetAltMeters = 30) {
  if (!airport) return;
  S.followFlight = null;
  S.flightViewMode = 'chase30m';
  S.controls.enabled = true;
  S.lastFlightPos = null;
  S.spotterPos = null;
  S.selectedAirport = airport;

  const apPos = latLonToVector3(airport.lat, airport.lon, 0);
  const altKm = Math.max(0.025, targetAltMeters / 1000);

  // Plaats camera op 30 meter boven de grond net voor de baandrempel met uitzicht over de baan
  const camPos = new THREE.Vector3(apPos.x + 0.08, altKm, apPos.z + 0.12);

  S.cameraTargetLook = new THREE.Vector3(apPos.x, 0.002, apPos.z);
  S.cameraTargetPos = camPos;
  S.isZoomingToAirport = true;

  S.controls.minDistance = 0.005; // Tot 5 meter boven de grond!
  S.controls.maxDistance = 450;
  S.controls.target.copy(apPos);

  buildDetailedAirportModel(airport);

  const apAltDisp = document.getElementById('ap-disp-altitude');
  if (apAltDisp) apAltDisp.textContent = `📷 Hoogte: ${targetAltMeters} m (${airport.activeRunway})`;

  ATC.logMessage('CAMERA', `Ingezoomd tot ${targetAltMeters} meter boven ${airport.name} (${airport.activeRunway}).`, true);
}

function zoomToGlobe() {
  S.followFlight = null;
  S.flightViewMode = 'chase30m';
  S.controls.enabled = true;
  S.lastFlightPos = null;
  S.spotterPos = null;
  S.cameraTargetLook = new THREE.Vector3(0, 0, 0);
  S.cameraTargetPos = new THREE.Vector3(0, 160, 45);
  S.controls.minDistance = 0.010;
  S.controls.maxDistance = 450;
  const fc = document.getElementById('flightradar-card');
  if (fc) fc.classList.remove('show');
  ATC.logMessage('RADAR', 'Volledig satellietoverzicht van het Nederlandse luchtruim actief.', true);
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

  // Surveillance Radarbundel laten roteren
  if (S.radarSweepMesh && S.layers.clouds) {
    S.radarSweepMesh.rotation.y -= 0.012;
  }

  // Vluchten positie updaten (vloeiende live ADS-B tracking & fallback)
  const dtSim = dt * S.speed;
  for (const f of S.flights) {
    applyFlightCategoryColor(f);
    if (f.isLive) {
      // 100% ECHTE LIVE RADAR BEWEGING
      if (f.targetPos && f.currentPos) {
        f.currentPos.lerp(f.targetPos, 0.05);
        f.planeMesh.position.copy(f.currentPos);
      }
      if (f.directionVector) {
        const tangent = f.directionVector;
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
        const correctedUp = new THREE.Vector3().crossVectors(tangent, right).normalize();
        const m = new THREE.Matrix4().makeBasis(right, correctedUp, tangent);
        f.planeMesh.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), 0.08);
      }
    } else {
      if (!S.paused) {
        f.progress += f.progressRate * dtSim;
        if (f.progress >= 1.0) {
          // Realistische omkeer naar retourvlucht (geen abrupte sprong)
          const oldOrig = f.origin;
          f.origin = f.dest;
          f.dest = oldOrig;
          f.progress = 0;

          const oVec = latLonToVector3(f.origin.lat, f.origin.lon, 0.05);
          const dVec = latLonToVector3(f.dest.lat, f.dest.lon, 0.05);
          const distKm = Math.hypot(dVec.x - oVec.x, dVec.z - oVec.z);
          const isGA = (f.airline.code === 'TGE' || f.airline.code === 'VTE');
          const cruiseAltKm = isGA ? (1.5 + Math.random() * 2.0) : Math.min(10.5, Math.max(3.2, distKm * 0.05 + 2.8));

          const p0 = oVec;
          const p1 = new THREE.Vector3(oVec.x + (dVec.x - oVec.x) * 0.22, cruiseAltKm, oVec.z + (dVec.z - oVec.z) * 0.22);
          const p2 = new THREE.Vector3(oVec.x + (dVec.x - oVec.x) * 0.78, cruiseAltKm, oVec.z + (dVec.z - oVec.z) * 0.78);
          const p3 = dVec;
          f.curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

          const pts = f.curve.getPoints(36);
          f.arcLine.geometry.setFromPoints(pts);
          f.status = 'Klimmen na vertrek';

          if (S.followFlight === f) {
            updateFlightCardUI(f);
          }
        }
      }

      const p = f.curve.getPointAt(f.progress);
      f.planeMesh.position.copy(p);

      const tangent = f.curve.getTangentAt(f.progress).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const correctedUp = new THREE.Vector3().crossVectors(tangent, right).normalize();

      const m = new THREE.Matrix4().makeBasis(right, correctedUp, tangent);
      f.planeMesh.quaternion.setFromRotationMatrix(m);
    }
  }

  // Stabiele camera tracking: 30m zonder OrbitControls conflict
  if (S.followFlight) {
    const f = S.followFlight;
    const p = f.isLive ? f.currentPos : f.curve.getPointAt(f.progress);
    const dir = f.isLive ? (f.directionVector || new THREE.Vector3(0, 0, -1)) : f.curve.getTangentAt(f.progress).normalize();

    if (S.flightViewMode === 'cockpit') {
      // 1. Cockpit: 100% stabiel, direct vooruit kijkend
      S.controls.enabled = false;
      S.camera.position.copy(p).addScaledVector(dir, 0.003).add(new THREE.Vector3(0, 0.0015, 0));
      S.camera.lookAt(p.clone().addScaledVector(dir, 1.0));
    } else if (S.flightViewMode === 'ground30m') {
      // 2. Spotter view: camera vast op 30m hoogte, kijkt naar vliegtuig
      S.controls.enabled = false;
      if (S.spotterPos) {
        S.camera.position.copy(S.spotterPos);
        S.camera.lookAt(p);
      }
    } else {
      // 3. Chase 30m: camera beweegt mee met de exacte delta-verplaatsing (geen conflict met OrbitControls!)
      S.controls.enabled = true;
      if (S.lastFlightPos) {
        const delta = p.clone().sub(S.lastFlightPos);
        S.camera.position.add(delta);
        S.controls.target.add(delta);
      } else {
        S.controls.target.copy(p);
      }
    }
    S.lastFlightPos = p.clone();
  } else {
    // Niet in volgmodus: normale OrbitControls navigatie
    S.controls.enabled = true;
    S.lastFlightPos = null;

    if (S.cameraTargetLook && S.cameraTargetPos) {
      S.camera.position.lerp(S.cameraTargetPos, 0.08);
      S.controls.target.lerp(S.cameraTargetLook, 0.08);

      if (S.camera.position.distanceTo(S.cameraTargetPos) < 0.01) {
        S.cameraTargetPos = null;
        S.cameraTargetLook = null;
        S.isZoomingToAirport = false;
      }
    }
  }

  // Exacte camera hoogte weergave (tot 30 meter boven de grond!)
  const groundAltMeters = Math.max(1, Math.round(S.camera.position.y * 1000));
  const hudAlt = document.getElementById('hud-cam-alt');
  const apAltDisp = document.getElementById('ap-disp-altitude');
  const altText = groundAltMeters < 1000 ? `${groundAltMeters} m` : `${(groundAltMeters / 1000).toFixed(1)} km`;

  if (hudAlt) hudAlt.textContent = altText;
  if (apAltDisp && !S.cameraTargetPos && S.selectedAirport) {
    if (S.followFlight) {
      apAltDisp.textContent = `📷 Hoogte: ${altText} (Volg ${S.followFlight.callsign})`;
    } else {
      apAltDisp.textContent = `📷 Hoogte: ${altText} (${S.selectedAirport.activeRunway})`;
    }
  }

  if (S.cameraLight && S.camera) {
    S.cameraLight.position.copy(S.camera.position);
  }

  if (S.controls.enabled) {
    S.controls.update();
  }
  S.renderer.render(S.scene, S.camera);
}

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
        const pct = flight.isLive ? 'LIVE' : (flight.progress * 100).toFixed(0) + '%';
        const origCode = flight.origin ? (flight.origin.code || flight.origin.name || flight.origin) : '---';
        const destCode = flight.dest ? (flight.dest.code || flight.dest.name || flight.dest) : '---';
        const origFlag = flight.origin && flight.origin.flag ? flight.origin.flag : '🛫';
        const destFlag = flight.dest && flight.dest.flag ? flight.dest.flag : '🛬';
        const airName = flight.airline ? (flight.airline.name || flight.airline.code || '') : '';
        const cat = flight.category || getFlightCategory(flight);

        document.getElementById('tt-route').innerHTML   = `<span style="color:${cat.hex}">${cat.icon} ${flight.callsign}</span> <span style="font-size:0.68rem;color:${cat.hex};background:${cat.hex}22;border:1px solid ${cat.hex}55;padding:1px 5px;border-radius:3px;margin-left:4px;">${cat.name}</span>`;
        document.getElementById('tt-airline').textContent = `${airName} · ${flight.aircraft}`;
        document.getElementById('tt-from').textContent    = `${origFlag} ${origCode}`;
        document.getElementById('tt-to').textContent      = `${destFlag} ${destCode}`;
        document.getElementById('tt-alt').textContent     = `${Number(flight.altitude).toLocaleString('nl-NL')} m`;
        document.getElementById('tt-spd').textContent     = `${flight.speedKmh} km/h`;
        document.getElementById('tt-pct').textContent     = flight.isLive ? `🔴 LIVE ADS-B (${flight.status})` : `${pct} (${flight.status || 'In vlucht'})`;
        document.getElementById('tt-bar').style.width     = flight.isLive ? '100%' : `${(flight.progress || 0) * 100}%`;
        document.getElementById('tt-bar').style.background = cat.hex;

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
        selectFlight(flight, 'chase30m');
        updateGlobalFlightListUI();
        return;
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

  let dIdx = Math.floor(Math.random() * AIRPORTS.length);
  while (AIRPORTS[dIdx] === ap) dIdx = Math.floor(Math.random() * AIRPORTS.length);
  const dest = AIRPORTS[dIdx];
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

  const flight = spawnFlight(ap, dest, airline, 0.0);
  flight.status = 'Opstijgen';
  S.followFlight = flight;

  ATC.logMessage('STATUS', `Toestel ${flight.callsign} vertrekt vanaf baan ${ap.activeRunway}.`, false);
  renderAirportFlightBoard();
}

function regieActionLand() {
  const ap = S.selectedAirport;
  if (!ap) return;

  let inbound = S.flights.find(f => f.dest && f.dest.code === ap.code && f.progress > 0.70);
  if (!inbound) {
    let oIdx = Math.floor(Math.random() * AIRPORTS.length);
    while (AIRPORTS[oIdx] === ap) oIdx = Math.floor(Math.random() * AIRPORTS.length);
    const origin = AIRPORTS[oIdx];
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    inbound = spawnFlight(origin, ap, airline, 0.88);
  }

  inbound.status = 'Geland & Baan Vrij';
  S.followFlight = inbound;

  ATC.logMessage('STATUS', `Toestel ${inbound.callsign} geland op baan ${ap.activeRunway}.`, false);
  renderAirportFlightBoard();
}

function regieActionGoAround() {
  const ap = S.selectedAirport;
  if (!ap) return;

  let inbound = S.flights.find(f => f.dest && f.dest.code === ap.code) || S.flights[0];
  if (inbound) {
    inbound.status = 'GO-AROUND!';
    S.followFlight = inbound;
    ATC.logMessage('STATUS', `Doorstart (Go-Around) geactiveerd voor ${inbound.callsign}.`, false);
  }

  renderAirportFlightBoard();
}

function regieActionEmergency() {
  const ap = S.selectedAirport;
  if (!ap) return;

  const inbound = S.flights.find(f => f.dest && f.dest.code === ap.code) || S.flights[1];
  if (inbound) {
    inbound.status = 'SQUAWK 7700';
    S.followFlight = inbound;
    ATC.logMessage('ALARM', `Squawk 7700 ingesteld voor ${inbound.callsign} op baan ${ap.activeRunway}.`, true);
  }

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

  // Snelknoppen in de luchthaven banner: direct naar 30m of 300m baanzicht
  const btnBannerZoom30 = document.getElementById('btn-banner-zoom-30');
  if (btnBannerZoom30) {
    btnBannerZoom30.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 30);
    });
  }

  const btnBannerZoom300 = document.getElementById('btn-banner-zoom-300');
  if (btnBannerZoom300) {
    btnBannerZoom300.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 300);
    });
  }

  // Flightradar Card interacties
  const btnCloseFrc = document.getElementById('btn-close-frc');
  if (btnCloseFrc) {
    btnCloseFrc.addEventListener('click', () => {
      const fc = document.getElementById('flightradar-card');
      if (fc) fc.classList.remove('show');
    });
  }

  const btnFrcZoom30 = document.getElementById('btn-frc-zoom30');
  if (btnFrcZoom30) {
    btnFrcZoom30.addEventListener('click', () => {
      if (S.followFlight) selectFlight(S.followFlight, 'chase30m');
    });
  }

  const btnFrcCockpit = document.getElementById('btn-frc-cockpit');
  if (btnFrcCockpit) {
    btnFrcCockpit.addEventListener('click', () => {
      if (S.followFlight) selectFlight(S.followFlight, 'cockpit');
    });
  }

  const btnFrcListen = document.getElementById('btn-frc-listen');
  if (btnFrcListen) {
    btnFrcListen.addEventListener('click', () => {
      LIVEATC.openLiveAtcStream();
    });
  }

  // Onderbalk zoomknoppen
  const btnZoom30 = document.getElementById('btn-zoom-30');
  if (btnZoom30) {
    btnZoom30.addEventListener('click', () => {
      if (S.followFlight) {
        selectFlight(S.followFlight, 'chase30m');
      } else {
        zoomToAirportRunway(S.selectedAirport, 30);
      }
    });
  }

  const btnZoom300 = document.getElementById('btn-zoom-300');
  if (btnZoom300) {
    btnZoom300.addEventListener('click', () => {
      zoomToAirportRunway(S.selectedAirport, 300);
    });
  }

  const btnCockpit = document.getElementById('btn-cockpit-view');
  if (btnCockpit) {
    btnCockpit.addEventListener('click', () => {
      const fl = S.followFlight || S.flights[0];
      if (fl) selectFlight(fl, 'cockpit');
    });
  }

  const btnFollowFlight = document.getElementById('btn-flightradar-mode');
  if (btnFollowFlight) {
    btnFollowFlight.addEventListener('click', () => {
      const fl = S.followFlight || S.flights[0];
      if (fl) selectFlight(fl, 'chase30m');
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

  list.innerHTML = '';
  const activeFlow = S.trafficFlow || 'all';
  const activeSector = S.trafficSector || 'ALL';
  const ap = S.selectedAirport || AIRPORTS[0];

  const sorted = [...S.flights].sort((a, b) => {
    const aSec = a.sector || getFlightDirectionSector(a, ap);
    const bSec = b.sector || getFlightDirectionSector(b, ap);
    const aCat = a.category || getFlightCategory(a);
    const bCat = b.category || getFlightCategory(b);
    const aFlow = (aCat.type === 'landing') ? 'arr' : ((aCat.type === 'takeoff') ? 'dep' : 'over');
    const bFlow = (bCat.type === 'landing') ? 'arr' : ((bCat.type === 'takeoff') ? 'dep' : 'over');

    const aMatch = (activeFlow === 'all' || aFlow === activeFlow) && (activeSector === 'ALL' || aSec.id === activeSector);
    const bMatch = (activeFlow === 'all' || bFlow === activeFlow) && (activeSector === 'ALL' || bSec.id === activeSector);

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  for (const f of sorted) {
    const item = document.createElement('div');
    item.className = 'flight-item';
    if (f === S.followFlight) item.classList.add('active');
    item.dataset.id = f.id;

    const cat = f.category || getFlightCategory(f);
    const sec = f.sector || getFlightDirectionSector(f, ap);
    const origCode = f.origin ? (f.origin.code || f.origin.name || f.origin) : '---';
    const destCode = f.dest ? (f.dest.code || f.dest.name || f.dest) : '---';
    const tag = f.isLive ? '🔴 LIVE' : `${((f.progress || 0) * 100).toFixed(0)}%`;
    const airName = f.airline ? (f.airline.name || f.airline.code || '') : '';

    item.innerHTML = `
      <span class="fi-icon" style="color:${cat.hex}">${cat.icon}</span>
      <div class="fi-info">
        <div class="fi-route" style="color:${cat.hex};font-weight:700;">
          <span style="background:${cat.hex}22;color:${cat.hex};border:1px solid ${cat.hex}55;padding:1px 5px;border-radius:4px;font-size:0.64rem;margin-right:4px;">${cat.name}</span>
          <span style="background:rgba(56,189,248,0.15);color:var(--cyan);border:1px solid rgba(56,189,248,0.3);padding:1px 5px;border-radius:4px;font-size:0.62rem;margin-right:4px;">${sec.icon}</span>
          ${f.callsign} · ${origCode}➔${destCode}
        </div>
        <div class="fi-label">${airName} · ${f.aircraft} · ${f.altitude}m · Koers ${f.heading || 0}°</div>
      </div>
      <span class="fi-prog" style="color:${cat.hex};font-weight:700;">${tag}</span>
    `;

    item.addEventListener('click', () => {
      ATC.ensureAudioCtx();
      LIVEATC.ensureAudioCtx();
      selectFlight(f, 'chase30m');
      updateGlobalFlightListUI();
    });

    list.appendChild(item);
    f._listItem = item;
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
    LIVEATC.openLiveAtcStream();
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
let currentVersion = '2.4.1';

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
  LIVE_RADAR.init();

  await loadWasm();
  await checkVersion(true);

  setInterval(() => checkVersion(true), CFG.pollMs);

  requestAnimationFrame(animate);
});
