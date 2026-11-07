/**
 * PetersWorld – Real 3D Globe, Airport Board, Operations Control & Live ATC Radio
 * Fotorealistische 3D wereldbol met Three.js (NASA Blue Marble), WebAssembly en natuurlijke Web Audio ATC.
 * Versie: 1.4.0
 */

'use strict';

// ═══════════════════════════════════════════════════════
//  CONFIGURATIE
// ═══════════════════════════════════════════════════════
const CFG = {
  wasmFile: 'petersworld.wasm',
  versionFile: 'version.json',
  pollMs: 30_000,
  flightCount: 120,
  globeRadius: 100,
};

// ═══════════════════════════════════════════════════════
//  LUCHTHAVENS DATABASE (35 INTERNATIONALE HUBS MET BANEN & FREQUENTIES)
// ═══════════════════════════════════════════════════════
const AIRPORTS = [
  // Europa
  { code:'AMS', flag:'🇳🇱', name:'Amsterdam Schiphol', city:'Amsterdam', country:'Nederland', lat: 52.31, lon: 4.76, hub:true,
    runways:['Kaagbaan 24', 'Polderbaan 36L', 'Zwanenburgerbaan 18C', 'Aalsmeerbaan 18L', 'Buitenveldertbaan 09'], activeRunway:'Kaagbaan 24',
    freqs:{ twr:'118.100', gnd:'121.700', app:'119.050' }, utcOffset:1, weather:{ cond:'cavok', wind:'220° 12kt', qnh:'1014' } },
  { code:'LHR', flag:'🇬🇧', name:'London Heathrow', city:'Londen', country:'Verenigd Koninkrijk', lat: 51.47, lon: -0.46, hub:true,
    runways:['Runway 27L', 'Runway 27R', 'Runway 09L', 'Runway 09R'], activeRunway:'Runway 27L',
    freqs:{ twr:'118.500', gnd:'121.900', app:'120.400' }, utcOffset:0, weather:{ cond:'rain', wind:'250° 16kt', qnh:'1011' } },
  { code:'CDG', flag:'🇫🇷', name:'Paris Charles de Gaulle', city:'Parijs', country:'Frankrijk', lat: 49.01, lon: 2.55, hub:true,
    runways:['Runway 26L', 'Runway 26R', 'Runway 08L', 'Runway 08R'], activeRunway:'Runway 26L',
    freqs:{ twr:'118.650', gnd:'121.800', app:'121.150' }, utcOffset:1, weather:{ cond:'cavok', wind:'190° 09kt', qnh:'1016' } },
  { code:'FRA', flag:'🇩🇪', name:'Frankfurt am Main', city:'Frankfurt', country:'Duitsland', lat: 50.03, lon: 8.57, hub:true,
    runways:['Runway 25C', 'Runway 25L', 'Runway 18', 'Runway 07R'], activeRunway:'Runway 25C',
    freqs:{ twr:'119.900', gnd:'121.950', app:'120.150' }, utcOffset:1, weather:{ cond:'cavok', wind:'240° 11kt', qnh:'1015' } },
  { code:'MAD', flag:'🇪🇸', name:'Madrid Barajas', city:'Madrid', country:'Spanje', lat: 40.47, lon: -3.57, hub:false,
    runways:['Runway 32L', 'Runway 32R', 'Runway 14L', 'Runway 14R'], activeRunway:'Runway 32L',
    freqs:{ twr:'118.150', gnd:'121.700', app:'118.400' }, utcOffset:1, weather:{ cond:'cavok', wind:'160° 06kt', qnh:'1019' } },
  { code:'FCO', flag:'🇮🇹', name:'Rome Fiumicino', city:'Rome', country:'Italië', lat: 41.80, lon: 12.25, hub:false,
    runways:['Runway 16L', 'Runway 16R', 'Runway 25'], activeRunway:'Runway 16L',
    freqs:{ twr:'118.700', gnd:'121.900', app:'125.500' }, utcOffset:1, weather:{ cond:'cavok', wind:'140° 08kt', qnh:'1017' } },
  { code:'ARN', flag:'🇸🇪', name:'Stockholm Arlanda', city:'Stockholm', country:'Zweden', lat: 59.65, lon: 17.93, hub:false,
    runways:['Runway 01L', 'Runway 01R', 'Runway 19L', 'Runway 26'], activeRunway:'Runway 01L',
    freqs:{ twr:'118.500', gnd:'121.600', app:'123.750' }, utcOffset:1, weather:{ cond:'rain', wind:'340° 14kt', qnh:'1008' } },
  { code:'ZRH', flag:'🇨🇭', name:'Zürich Kloten', city:'Zürich', country:'Zwitserland', lat: 47.46, lon: 8.55, hub:false,
    runways:['Runway 14', 'Runway 16', 'Runway 28'], activeRunway:'Runway 14',
    freqs:{ twr:'118.100', gnd:'121.900', app:'118.000' }, utcOffset:1, weather:{ cond:'cavok', wind:'110° 04kt', qnh:'1020' } },
  { code:'BRU', flag:'🇧🇪', name:'Brussels Airport', city:'Brussel', country:'België', lat: 50.90, lon: 4.48, hub:false,
    runways:['Runway 25L', 'Runway 25R', 'Runway 01'], activeRunway:'Runway 25L',
    freqs:{ twr:'118.600', gnd:'121.875', app:'118.250' }, utcOffset:1, weather:{ cond:'cavok', wind:'210° 10kt', qnh:'1014' } },
  { code:'VIE', flag:'🇦🇹', name:'Vienna International', city:'Wenen', country:'Oostenrijk', lat: 48.11, lon: 16.57, hub:false,
    runways:['Runway 16', 'Runway 29', 'Runway 11'], activeRunway:'Runway 16',
    freqs:{ twr:'119.400', gnd:'121.600', app:'118.775' }, utcOffset:1, weather:{ cond:'cavok', wind:'130° 07kt', qnh:'1018' } },

  // Noord-Amerika
  { code:'JFK', flag:'🇺🇸', name:'New York JFK', city:'New York', country:'Verenigde Staten', lat: 40.64, lon: -73.78, hub:true,
    runways:['Runway 31L', 'Runway 31R', 'Runway 22L', 'Runway 22R', 'Runway 04L'], activeRunway:'Runway 31L',
    freqs:{ twr:'119.100', gnd:'121.900', app:'125.750' }, utcOffset:-5, weather:{ cond:'cavok', wind:'300° 15kt', qnh:'1013' } },
  { code:'LAX', flag:'🇺🇸', name:'Los Angeles International', city:'Los Angeles', country:'Verenigde Staten', lat: 33.94, lon:-118.40, hub:true,
    runways:['Runway 24L', 'Runway 24R', 'Runway 25L', 'Runway 25R'], activeRunway:'Runway 25L',
    freqs:{ twr:'120.950', gnd:'121.650', app:'124.900' }, utcOffset:-8, weather:{ cond:'cavok', wind:'260° 08kt', qnh:'1016' } },
  { code:'ORD', flag:'🇺🇸', name:"Chicago O'Hare", city:'Chicago', country:'Verenigde Staten', lat: 41.98, lon: -87.90, hub:true,
    runways:['Runway 27L', 'Runway 28C', 'Runway 10L', 'Runway 09R'], activeRunway:'Runway 28C',
    freqs:{ twr:'120.750', gnd:'121.900', app:'128.450' }, utcOffset:-6, weather:{ cond:'rain', wind:'310° 18kt', qnh:'1009' } },
  { code:'ATL', flag:'🇺🇸', name:'Atlanta Hartsfield', city:'Atlanta', country:'Verenigde Staten', lat: 33.64, lon: -84.43, hub:false,
    runways:['Runway 26L', 'Runway 27R', 'Runway 08L', 'Runway 09R'], activeRunway:'Runway 26L',
    freqs:{ twr:'119.500', gnd:'121.900', app:'127.900' }, utcOffset:-5, weather:{ cond:'cavok', wind:'200° 07kt', qnh:'1018' } },
  { code:'DFW', flag:'🇺🇸', name:'Dallas Fort Worth', city:'Dallas', country:'Verenigde Staten', lat: 32.90, lon: -97.04, hub:false,
    runways:['Runway 17R', 'Runway 18L', 'Runway 35L', 'Runway 36R'], activeRunway:'Runway 17R',
    freqs:{ twr:'126.550', gnd:'121.650', app:'124.300' }, utcOffset:-6, weather:{ cond:'cavok', wind:'180° 12kt', qnh:'1014' } },
  { code:'YYZ', flag:'🇨🇦', name:'Toronto Pearson', city:'Toronto', country:'Canada', lat: 43.68, lon: -79.63, hub:false,
    runways:['Runway 23', 'Runway 24L', 'Runway 05', 'Runway 06R'], activeRunway:'Runway 23',
    freqs:{ twr:'118.700', gnd:'121.900', app:'128.800' }, utcOffset:-5, weather:{ cond:'cavok', wind:'250° 11kt', qnh:'1015' } },
  { code:'MIA', flag:'🇺🇸', name:'Miami International', city:'Miami', country:'Verenigde Staten', lat: 25.80, lon: -80.28, hub:false,
    runways:['Runway 08R', 'Runway 09', 'Runway 26L', 'Runway 27'], activeRunway:'Runway 08R',
    freqs:{ twr:'118.300', gnd:'121.800', app:'124.850' }, utcOffset:-5, weather:{ cond:'storm', wind:'110° 22kt', qnh:'1010' } },
  { code:'SFO', flag:'🇺🇸', name:'San Francisco International', city:'San Francisco', country:'Verenigde Staten', lat: 37.62, lon:-122.38, hub:false,
    runways:['Runway 28L', 'Runway 28R', 'Runway 01L', 'Runway 01R'], activeRunway:'Runway 28L',
    freqs:{ twr:'120.500', gnd:'121.800', app:'135.650' }, utcOffset:-8, weather:{ cond:'fog', wind:'280° 13kt', qnh:'1017' } },

  // Azië & Midden-Oosten
  { code:'DXB', flag:'🇦🇪', name:'Dubai International', city:'Dubai', country:'Verenigde Arabische Emiraten', lat: 25.25, lon: 55.36, hub:true,
    runways:['Runway 30L', 'Runway 30R', 'Runway 12L', 'Runway 12R'], activeRunway:'Runway 30L',
    freqs:{ twr:'118.750', gnd:'118.350', app:'124.900' }, utcOffset:4, weather:{ cond:'cavok', wind:'320° 09kt', qnh:'1013' } },
  { code:'HND', flag:'🇯🇵', name:'Tokyo Haneda', city:'Tokio', country:'Japan', lat: 35.55, lon: 139.78, hub:true,
    runways:['Runway 34R', 'Runway 34L', 'Runway 16R', 'Runway 05'], activeRunway:'Runway 34R',
    freqs:{ twr:'118.100', gnd:'121.700', app:'119.100' }, utcOffset:9, weather:{ cond:'cavok', wind:'010° 12kt', qnh:'1021' } },
  { code:'PEK', flag:'🇨🇳', name:'Beijing Capital', city:'Peking', country:'China', lat: 40.08, lon: 116.58, hub:true,
    runways:['Runway 36R', 'Runway 36L', 'Runway 01', 'Runway 18L'], activeRunway:'Runway 36R',
    freqs:{ twr:'118.500', gnd:'121.800', app:'119.700' }, utcOffset:8, weather:{ cond:'cavok', wind:'030° 08kt', qnh:'1024' } },
  { code:'SIN', flag:'🇸🇬', name:'Singapore Changi', city:'Singapore', country:'Singapore', lat: 1.36, lon: 103.99, hub:true,
    runways:['Runway 02L', 'Runway 02C', 'Runway 20R', 'Runway 20C'], activeRunway:'Runway 02L',
    freqs:{ twr:'118.600', gnd:'121.725', app:'120.300' }, utcOffset:8, weather:{ cond:'rain', wind:'060° 10kt', qnh:'1009' } },
  { code:'HKG', flag:'🇭🇰', name:'Hong Kong International', city:'Hongkong', country:'Hongkong', lat: 22.31, lon: 113.91, hub:false,
    runways:['Runway 07L', 'Runway 07R', 'Runway 25L', 'Runway 25R'], activeRunway:'Runway 07L',
    freqs:{ twr:'118.700', gnd:'121.600', app:'119.100' }, utcOffset:8, weather:{ cond:'cavok', wind:'080° 14kt', qnh:'1017' } },
  { code:'BOM', flag:'🇮🇳', name:'Mumbai Chhatrapati Shivaji', city:'Mumbai', country:'India', lat: 19.09, lon: 72.87, hub:false,
    runways:['Runway 27', 'Runway 09', 'Runway 14', 'Runway 32'], activeRunway:'Runway 27',
    freqs:{ twr:'118.100', gnd:'121.900', app:'127.900' }, utcOffset:5.5, weather:{ cond:'cavok', wind:'270° 09kt', qnh:'1012' } },
  { code:'ICN', flag:'🇰🇷', name:'Seoul Incheon', city:'Seoel', country:'Zuid-Korea', lat: 37.46, lon: 126.44, hub:false,
    runways:['Runway 33L', 'Runway 33R', 'Runway 34', 'Runway 15R'], activeRunway:'Runway 33L',
    freqs:{ twr:'118.200', gnd:'121.650', app:'119.200' }, utcOffset:9, weather:{ cond:'cavok', wind:'310° 10kt', qnh:'1022' } },
  { code:'BKK', flag:'🇹🇭', name:'Bangkok Suvarnabhumi', city:'Bangkok', country:'Thailand', lat: 13.69, lon: 100.75, hub:false,
    runways:['Runway 19L', 'Runway 19R', 'Runway 01L', 'Runway 01R'], activeRunway:'Runway 19L',
    freqs:{ twr:'118.100', gnd:'121.750', app:'125.200' }, utcOffset:7, weather:{ cond:'cavok', wind:'170° 06kt', qnh:'1011' } },
  { code:'DOH', flag:'🇶🇦', name:'Doha Hamad', city:'Doha', country:'Qatar', lat: 25.27, lon: 51.61, hub:false,
    runways:['Runway 34L', 'Runway 34R', 'Runway 16L', 'Runway 16R'], activeRunway:'Runway 34L',
    freqs:{ twr:'118.900', gnd:'121.850', app:'121.100' }, utcOffset:3, weather:{ cond:'cavok', wind:'330° 11kt', qnh:'1015' } },

  // Oceanië, Afrika, Zuid-Amerika
  { code:'SYD', flag:'🇦🇺', name:'Sydney Kingsford Smith', city:'Sydney', country:'Australië', lat:-33.95, lon: 151.18, hub:true,
    runways:['Runway 34L', 'Runway 34R', 'Runway 16R', 'Runway 07'], activeRunway:'Runway 34L',
    freqs:{ twr:'120.500', gnd:'121.700', app:'124.400' }, utcOffset:11, weather:{ cond:'cavok', wind:'060° 13kt', qnh:'1020' } },
  { code:'MEL', flag:'🇦🇺', name:'Melbourne Tullamarine', city:'Melbourne', country:'Australië', lat:-37.67, lon: 144.84, hub:false,
    runways:['Runway 16', 'Runway 27', 'Runway 34'], activeRunway:'Runway 16',
    freqs:{ twr:'120.500', gnd:'121.700', app:'132.000' }, utcOffset:11, weather:{ cond:'rain', wind:'190° 18kt', qnh:'1010' } },
  { code:'JNB', flag:'🇿🇦', name:'Johannesburg OR Tambo', city:'Johannesburg', country:'Zuid-Afrika', lat:-26.14, lon: 28.24, hub:false,
    runways:['Runway 03L', 'Runway 03R', 'Runway 21L', 'Runway 21R'], activeRunway:'Runway 03L',
    freqs:{ twr:'118.100', gnd:'121.900', app:'124.500' }, utcOffset:2, weather:{ cond:'cavok', wind:'020° 08kt', qnh:'1022' } },
  { code:'NBO', flag:'🇰🇪', name:'Nairobi Jomo Kenyatta', city:'Nairobi', country:'Kenia', lat: -1.32, lon: 36.93, hub:false,
    runways:['Runway 06', 'Runway 24'], activeRunway:'Runway 06',
    freqs:{ twr:'118.700', gnd:'121.900', app:'120.100' }, utcOffset:3, weather:{ cond:'cavok', wind:'050° 10kt', qnh:'1017' } },
  { code:'CAI', flag:'🇪🇬', name:'Cairo International', city:'Caïro', country:'Egypte', lat: 30.12, lon: 31.41, hub:false,
    runways:['Runway 05C', 'Runway 05L', 'Runway 23R'], activeRunway:'Runway 05C',
    freqs:{ twr:'118.150', gnd:'121.900', app:'119.050' }, utcOffset:2, weather:{ cond:'cavok', wind:'340° 10kt', qnh:'1016' } },
  { code:'GRU', flag:'🇧🇷', name:'São Paulo Guarulhos', city:'São Paulo', country:'Brazilië', lat:-23.43, lon: -46.47, hub:false,
    runways:['Runway 09R', 'Runway 09L', 'Runway 27L'], activeRunway:'Runway 09R',
    freqs:{ twr:'118.000', gnd:'121.700', app:'119.350' }, utcOffset:-3, weather:{ cond:'cavok', wind:'120° 07kt', qnh:'1018' } },
  { code:'BOG', flag:'🇨🇴', name:'Bogotá El Dorado', city:'Bogotá', country:'Colombia', lat: 4.70, lon: -74.14, hub:false,
    runways:['Runway 13L', 'Runway 13R', 'Runway 31L'], activeRunway:'Runway 13L',
    freqs:{ twr:'118.100', gnd:'121.800', app:'119.500' }, utcOffset:-5, weather:{ cond:'rain', wind:'110° 09kt', qnh:'1025' } },
  { code:'LIM', flag:'🇵🇪', name:'Lima Jorge Chávez', city:'Lima', country:'Peru', lat:-12.02, lon: -77.11, hub:false,
    runways:['Runway 16', 'Runway 34'], activeRunway:'Runway 16',
    freqs:{ twr:'118.100', gnd:'121.900', app:'119.700' }, utcOffset:-5, weather:{ cond:'fog', wind:'200° 08kt', qnh:'1014' } },
  { code:'MEX', flag:'🇲🇽', name:'Mexico City Benito Juárez', city:'Mexico-Stad', country:'Mexico', lat: 19.43, lon: -99.07, hub:false,
    runways:['Runway 05L', 'Runway 05R', 'Runway 23L'], activeRunway:'Runway 05L',
    freqs:{ twr:'118.700', gnd:'121.850', app:'121.200' }, utcOffset:-6, weather:{ cond:'cavok', wind:'040° 06kt', qnh:'1024' } },
];

const AIRLINES = [
  { code:'KLM', callsign:'KLM',       name:'KLM Royal Dutch Airlines', color:0x00a1de, hex:'#00a1de', types:['Boeing 777-300ER','Boeing 787-10','Airbus A321neo'] },
  { code:'DLH', callsign:'Lufthansa', name:'Lufthansa',                 color:0xf9ba00, hex:'#f9ba00', types:['Airbus A350-900','Boeing 747-8','Airbus A320neo'] },
  { code:'BAW', callsign:'Speedbird', name:'British Airways',           color:0x075aaa, hex:'#075aaa', types:['Boeing 787-9','Airbus A380-800','Airbus A350-1000'] },
  { code:'AFR', callsign:'Air France',name:'Air France',                color:0x002157, hex:'#002157', types:['Airbus A350-900','Boeing 777-300ER','Airbus A220-300'] },
  { code:'UAE', callsign:'Emirates',  name:'Emirates',                  color:0xc8102e, hex:'#c8102e', types:['Airbus A380-800','Boeing 777-300ER'] },
  { code:'UAL', callsign:'United',    name:'United Airlines',           color:0x005daa, hex:'#005daa', types:['Boeing 787-9','Boeing 777-200ER','Boeing 737 MAX 9'] },
  { code:'AAL', callsign:'American',  name:'American Airlines',         color:0xc8102e, hex:'#c8102e', types:['Boeing 777-300ER','Boeing 787-8','Airbus A321neo'] },
  { code:'DAL', callsign:'Delta',     name:'Delta Air Lines',           color:0x9d1f26, hex:'#9d1f26', types:['Airbus A350-900','Airbus A330-900neo','Boeing 767-400ER'] },
  { code:'ANA', callsign:'All Nippon',name:'All Nippon Airways',        color:0x13448f, hex:'#13448f', types:['Boeing 787-9','Boeing 777-300ER'] },
  { code:'SIA', callsign:'Singapore', name:'Singapore Airlines',        color:0x172e69, hex:'#172e69', types:['Airbus A350-900','Airbus A380-800','Boeing 787-10'] },
  { code:'QFA', callsign:'Qantas',    name:'Qantas',                    color:0xe8111a, hex:'#e8111a', types:['Boeing 787-9','Airbus A380-800','Airbus A330-300'] },
  { code:'TKA', callsign:'Turkish',   name:'Turkish Airlines',          color:0xc70000, hex:'#c70000', types:['Airbus A350-900','Boeing 787-9','Airbus A321neo'] },
  { code:'RYR', callsign:'Ryanair',   name:'Ryanair',                   color:0x073590, hex:'#073590', types:['Boeing 737-800','Boeing 737 MAX 8200'] },
  { code:'EZY', callsign:'easyJet',   name:'easyJet',                   color:0xff6600, hex:'#ff6600', types:['Airbus A320neo','Airbus A321neo'] },
  { code:'TUI', callsign:'TUI',       name:'TUI Airways',               color:0xc0022b, hex:'#c0022b', types:['Boeing 787-8','Boeing 737 MAX 8'] },
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
//  NATUURLIJKE ATC RADIO ENGINE (ECHTE STEMMEN + VHF FILTERING)
// ═══════════════════════════════════════════════════════
class AtcRadioEngine {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
    this.isTransmitting = false;
    this.voices = [];
    this.currentFreq = '118.100';
    this.currentChannel = 'SCHIPHOL TOWER';
    this.selectedAirport = AIRPORTS[0];
    this.timer = null;
    this.towerVoice = null;
    this.pilotVoice = null;
  }

  init() {
    if ('speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => this.refreshVoices();
    }
  }

  refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    if (!this.voices || !this.voices.length) return;

    // Filter stemmen met prioriteit voor natuurlijke / neurale stemmen
    const enVoices = this.voices.filter(v => v.lang && v.lang.startsWith('en'));
    const pool = enVoices.length ? enVoices : this.voices;

    const scoreVoice = (v) => {
      let score = 0;
      const n = (v.name || '').toLowerCase();
      if (n.includes('natural')) score += 60;
      if (n.includes('enhanced')) score += 50;
      if (n.includes('premium')) score += 45;
      if (n.includes('siri')) score += 40;
      if (n.includes('google')) score += 35;
      if (n.includes('samantha')) score += 30;
      if (n.includes('daniel')) score += 30;
      if (n.includes('ava')) score += 25;
      if (n.includes('evan')) score += 25;
      if (n.includes('neural')) score += 20;
      if (v.lang === 'en-US' || v.lang === 'en-GB') score += 10;
      return score;
    };

    const sorted = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
    this.towerVoice = sorted[0] || null;
    this.pilotVoice = sorted.find(v => v !== this.towerVoice && v.name !== this.towerVoice?.name) || sorted[1] || this.towerVoice;

    const badge = document.getElementById('atc-active-voices');
    if (badge && this.towerVoice && this.pilotVoice) {
      const cleanName = (n) => n.replace(/English|United States|United Kingdom|\(|\)/g, '').trim();
      badge.textContent = `TWR: ${cleanName(this.towerVoice.name)} · PLT: ${cleanName(this.pilotVoice.name)}`;
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

  // Realistische VHF PTT Mic Click + Squelch Burst
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
    const pillTxt = document.getElementById('atc-txt');
    if (freqEl) freqEl.textContent = `${freq} MHz`;
    if (chanEl) chanEl.textContent = channel;
    if (pillTxt) pillTxt.textContent = `📻 ATC: ${freq} MHz [${this.enabled ? 'AAN' : 'GEDEMPT'}]`;
  }

  speak(text, isTower, onDone) {
    if (!this.enabled || !('speechSynthesis' in window)) {
      if (onDone) setTimeout(onDone, 1200);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';

      if (!this.towerVoice || !this.pilotVoice) {
        this.refreshVoices();
      }

      const voice = isTower ? this.towerVoice : this.pilotVoice;
      if (voice) utt.voice = voice;

      if (isTower) {
        utt.rate = 1.08;
        utt.pitch = 1.02;
      } else {
        utt.rate = 1.02;
        utt.pitch = 0.90;
      }

      this.playMicClick(true);
      this.setTxIndicator(isTower ? 'tower' : 'pilot');

      let doneFired = false;
      const finish = () => {
        if (doneFired) return;
        doneFired = true;
        this.playMicClick(false);
        this.setTxIndicator('idle');
        if (onDone) setTimeout(onDone, 320);
      };

      utt.onend = finish;
      utt.onerror = finish;

      window.speechSynthesis.speak(utt);
    } catch (e) {
      if (onDone) setTimeout(onDone, 1000);
    }
  }

  // Radiodialoog tussen toren en piloot
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
      }, 420);
    });
  }

  // Contact legging met een geselecteerde vlucht
  contactFlight(flight) {
    if (this.isTransmitting || !flight) return;
    this.ensureAudioCtx();

    const sector = this.determineSector(flight);
    this.setFrequency(sector.freq, sector.name);

    const numOnly = flight.callsign.replace(/\D/g, '');
    const callsignSpoken = flight.airline.callsign + ' ' + numOnly;
    const dialogue = this.generateDialogue(flight, sector, callsignSpoken);

    this.exchangeDialogue(
      sector.code, dialogue.towerText, dialogue.towerSpeech,
      flight.callsign, dialogue.pilotText, dialogue.pilotSpeech
    );
  }

  determineSector(flight) {
    const lat = flight.origin.lat;
    const lon = flight.origin.lon;

    if (lat > 35 && lat < 65 && lon > -15 && lon < 30) {
      if (flight.origin.code === 'AMS' || flight.dest.code === 'AMS') {
        return { name: 'SCHIPHOL TOWER', code: 'AMS TWR', freq: '118.100' };
      }
      if (flight.origin.code === 'LHR' || flight.dest.code === 'LHR') {
        return { name: 'LONDON CONTROL', code: 'LON RADAR', freq: '118.500' };
      }
      return { name: 'AMSTERDAM RADAR', code: 'AMS RADAR', freq: '124.300' };
    }
    if (lon < -50 && lat > 20) {
      if (flight.origin.code === 'JFK' || flight.dest.code === 'JFK') {
        return { name: 'NEW YORK TOWER', code: 'JFK TWR', freq: '119.100' };
      }
      return { name: 'NEW YORK CENTER', code: 'NY CENTER', freq: '133.450' };
    }
    if (lon > 40 && lon < 80) {
      return { name: 'DUBAI TOWER', code: 'DXB TWR', freq: '118.750' };
    }
    if (lon >= 80 && lon < 150) {
      if (flight.origin.code === 'HND' || flight.dest.code === 'HND') {
        return { name: 'TOKYO TOWER', code: 'HND TWR', freq: '118.100' };
      }
      return { name: 'SINGAPORE RADAR', code: 'SIN RADAR', freq: '120.300' };
    }
    if (lat < 0 && lon > 100) {
      return { name: 'SYDNEY TOWER', code: 'SYD TWR', freq: '120.500' };
    }
    return { name: 'AREA CONTROL', code: 'RADAR', freq: '121.500' };
  }

  generateDialogue(flight, sector, callsignSpoken) {
    const fl = Math.floor(flight.altitude / 304.8);
    const waypoints = ['SPYKER', 'EELDE', 'RIVER', 'LAMSO', 'KENNO', 'SANDY', 'BOBBO', 'GATOW', 'MERIT', 'VAPOR'];
    const rwy = flight.origin.activeRunway || '24';
    const wpt = waypoints[Math.floor(Math.random() * waypoints.length)];
    const hdg = (Math.floor(Math.random() * 36) * 10).toString().padStart(3, '0');
    const mach = 'decimal ' + (78 + Math.floor(Math.random() * 8));

    const progress = flight.progress;

    if (progress < 0.15) {
      return {
        towerText: `${flight.callsign}, wind 220 at 12 knots, ${rwy}, cleared for takeoff.`,
        towerSpeech: `${callsignSpoken}, wind 220 at 12 knots, ${rwy}, cleared for takeoff.`,
        pilotText: `Cleared for takeoff ${rwy}, ${flight.callsign}.`,
        pilotSpeech: `Cleared for takeoff ${rwy}, ${callsignSpoken}.`
      };
    } else if (progress > 0.85) {
      return {
        towerText: `${flight.callsign}, descend and maintain 3000 feet, expect ILS approach, QNH 1014.`,
        towerSpeech: `${callsignSpoken}, descend and maintain 3000 feet, expect ILS approach, QNH 1014.`,
        pilotText: `Descend 3000 feet, QNH 1014, ILS approach, ${flight.callsign}.`,
        pilotSpeech: `Descend 3000 feet, QNH 1014, ILS approach, ${callsignSpoken}.`
      };
    } else {
      const scenario = Math.floor(Math.random() * 4);
      if (scenario === 0) {
        return {
          towerText: `${flight.callsign}, radar contact, climb and maintain flight level ${fl + 20}, direct ${wpt}.`,
          towerSpeech: `${callsignSpoken}, radar contact, climb and maintain flight level ${fl + 20}, direct ${wpt}.`,
          pilotText: `Climbing flight level ${fl + 20}, direct ${wpt}, ${flight.callsign}.`,
          pilotSpeech: `Climbing flight level ${fl + 20}, direct ${wpt}, ${callsignSpoken}.`
        };
      } else if (scenario === 1) {
        return {
          towerText: `${flight.callsign}, turn right heading ${hdg}, radar vectors for spacing.`,
          towerSpeech: `${callsignSpoken}, turn right heading ${hdg}, radar vectors for spacing.`,
          pilotText: `Right heading ${hdg}, ${flight.callsign}.`,
          pilotSpeech: `Right heading ${hdg}, ${callsignSpoken}.`
        };
      } else if (scenario === 2) {
        return {
          towerText: `${flight.callsign}, maintain Mach ${mach} for en-route separation.`,
          towerSpeech: `${callsignSpoken}, maintain Mach ${mach} for en-route separation.`,
          pilotText: `Speed Mach ${mach}, ${flight.callsign}.`,
          pilotSpeech: `Speed Mach ${mach}, ${callsignSpoken}.`
        };
      } else {
        const nextFreq = (119 + Math.floor(Math.random() * 15)).toFixed(3);
        return {
          towerText: `${flight.callsign}, contact Area Radar on ${nextFreq}, good day.`,
          towerSpeech: `${callsignSpoken}, contact Area Radar on ${nextFreq}, good day.`,
          pilotText: `${nextFreq}, good day, ${flight.callsign}.`,
          pilotSpeech: `${nextFreq}, good day, ${callsignSpoken}.`
        };
      }
    }
  }

  toggleMute() {
    this.enabled = !this.enabled;
    this.ensureAudioCtx();
    if (!this.enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const dot = document.getElementById('atc-dot');
    const btnMute = document.getElementById('btn-atc-mute');
    const pill = document.getElementById('pill-atc');
    const pillTxt = document.getElementById('atc-txt');

    if (dot) dot.className = `dot ${this.enabled ? 'green' : 'red'}`;
    if (btnMute) btnMute.textContent = this.enabled ? '🔊' : '🔇';
    if (pill) pill.classList.toggle('active', this.enabled);
    if (pillTxt) pillTxt.textContent = `📻 ATC: ${this.currentFreq} MHz [${this.enabled ? 'AAN' : 'GEDEMPT'}]`;

    if (this.enabled) {
      this.playMicClick(true);
      setTimeout(() => this.playMicClick(false), 80);
      this.logMessage('ATC RADIO', 'Luchtverkeersleiding radio kanaal actief met natuurlijke stemmen.', true);
    }
  }

  startPeriodicTransmission(getFlightFunc) {
    const nextCall = () => {
      const delay = 11000 + Math.random() * 9000;
      this.timer = setTimeout(() => {
        if (this.enabled && !this.isTransmitting) {
          const flight = getFlightFunc();
          if (flight) this.contactFlight(flight);
        }
        nextCall();
      }, delay);
    };
    nextCall();
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

  // Object groepen
  earthGroup: null,
  earthMesh: null,
  cloudMesh: null,
  atmoMesh: null,
  airportsGroup: null,
  flightsGroup: null,
  trailsGroup: null,

  // Simulatie state
  flights: [],
  followFlight: null,
  selectedAirport: AIRPORTS[0],
  paused: false,
  speed: 1,
  tick: 0,
  layers: { flights: true, airports: true, trails: true, clouds: true, atmosphere: true },

  // FPS teller
  fpsCount: 0,
  fpsLast: performance.now(),
  lastTime: performance.now(),

  // Camera animatie naar luchthaven
  cameraTargetPos: null,
  cameraTargetLook: null,
};

// ═══════════════════════════════════════════════════════
//  THREE.JS INIT
// ═══════════════════════════════════════════════════════
function initThree() {
  const container = document.getElementById('webgl-container');
  const w = window.innerWidth, h = window.innerHeight;

  // Scene
  S.scene = new THREE.Scene();
  S.scene.background = new THREE.Color(0x030712);

  // Camera
  S.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
  S.camera.position.set(0, 50, 260);

  // Renderer
  S.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  S.renderer.setSize(w, h);
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  S.renderer.toneMappingExposure = 1.05;
  container.appendChild(S.renderer.domElement);

  // OrbitControls
  S.controls = new THREE.OrbitControls(S.camera, S.renderer.domElement);
  S.controls.enableDamping = true;
  S.controls.dampingFactor = 0.05;
  S.controls.minDistance = 110;
  S.controls.maxDistance = 500;
  S.controls.rotateSpeed = 0.6;
  S.controls.zoomSpeed = 0.8;

  // Groepen
  S.earthGroup = new THREE.Group();
  S.scene.add(S.earthGroup);

  S.trailsGroup = new THREE.Group();
  S.flightsGroup = new THREE.Group();
  S.airportsGroup = new THREE.Group();

  S.scene.add(S.trailsGroup);
  S.scene.add(S.flightsGroup);
  S.scene.add(S.airportsGroup);

  // Lichtbronnen
  const ambLight = new THREE.AmbientLight(0xffffff, 0.35);
  S.scene.add(ambLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
  sunLight.position.set(200, 100, 150);
  S.scene.add(sunLight);

  const backLight = new THREE.DirectionalLight(0x38bdf8, 0.25);
  backLight.position.set(-200, -80, -150);
  S.scene.add(backLight);

  // Sterrenhemel
  buildStarfield();

  // 3D Fotorealistische Aarde
  buildRealisticEarth();

  // 3D Hubs en Vluchten
  build3DAirports();
  build3DFlights();

  // Event handlers
  window.addEventListener('resize', onResize);
  setupInteraction(container);

  // Initialiseer Flight Board
  initAirportDeck();
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  S.camera.aspect = w / h;
  S.camera.updateProjectionMatrix();
  S.renderer.setSize(w, h);
}

// ═══════════════════════════════════════════════════════
//  3D OBJECTEN BOUWEN
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

  // Aardoppervlakte met bump mapping en oceaanreflectie
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

  // Wolkenlaag
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

  // Atmosfeer Fresnel Glow Shader
  const atmoGeo = new THREE.SphereGeometry(CFG.globeRadius + 4.5, 48, 48);
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float fresnel = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmoColor = vec3(0.22, 0.74, 0.98);
        gl_FragColor = vec4(atmoColor, fresnel * 0.75);
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  S.atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
  S.earthGroup.add(S.atmoMesh);
}

function build3DAirports() {
  const hubMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const smallMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const hubGeo = new THREE.SphereGeometry(0.85, 12, 12);
  const smallGeo = new THREE.SphereGeometry(0.50, 8, 8);

  for (const ap of AIRPORTS) {
    const pos = latLonToVector3(ap.lat, ap.lon, CFG.globeRadius + 0.25);
    const mesh = new THREE.Mesh(ap.hub ? hubGeo : smallGeo, ap.hub ? hubMat : smallMat);
    mesh.position.copy(pos);
    mesh.userData = { isAirport: true, airport: ap };
    S.airportsGroup.add(mesh);
    ap._marker = mesh;

    // Pulserende radar ring voor hubs
    if (ap.hub) {
      const ringGeo = new THREE.RingGeometry(1.0, 1.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      S.airportsGroup.add(ring);
    }
  }
}

function createAirplaneMesh(colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({
    color: colorHex,
    shininess: 60,
    emissive: colorHex,
    emissiveIntensity: 0.15
  });

  // Romp (Fuselage)
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.22, 2.6, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, mat);
  group.add(body);

  // Vleugels
  const wingGeo = new THREE.BoxGeometry(3.4, 0.05, 0.7);
  const wing = new THREE.Mesh(wingGeo, mat);
  wing.position.set(0, 0, 0.1);
  group.add(wing);

  // Staart
  const tailGeo = new THREE.BoxGeometry(0.08, 0.9, 0.6);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.position.set(0, 0.5, -1.0);
  group.add(tail);

  // Straalmotoren
  const engGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6);
  engGeo.rotateX(Math.PI / 2);
  const engL = new THREE.Mesh(engGeo, mat);
  engL.position.set(-0.75, -0.15, 0.1);
  const engR = new THREE.Mesh(engGeo, mat);
  engR.position.set(0.75, -0.15, 0.1);
  group.add(engL);
  group.add(engR);

  // Navigatielichten (Rood op bakboord links, Groen op stuurboord rechts)
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
//  ANIMATIE & SIMULATIE LOOP
// ═══════════════════════════════════════════════════════
function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min(100, now - (S.lastTime || now));
  S.lastTime = now;

  // FPS berekening
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

  const hudTick = document.getElementById('hud-tick');
  if (hudTick) hudTick.textContent = S.tick;

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

  // Vlucht volgen met camera indien actief
  if (S.followFlight) {
    const p = S.followFlight.curve.getPointAt(S.followFlight.progress);
    S.controls.target.lerp(p, 0.06);
  } else if (S.cameraTargetLook && S.cameraTargetPos) {
    // Geanimeerde overgang naar geselecteerde luchthaven
    S.camera.position.lerp(S.cameraTargetPos, 0.05);
    S.controls.target.lerp(S.cameraTargetLook, 0.05);
    if (S.camera.position.distanceTo(S.cameraTargetPos) < 1.0) {
      S.cameraTargetPos = null;
      S.cameraTargetLook = null;
    }
  }

  S.controls.update();
  S.renderer.render(S.scene, S.camera);
}

// ═══════════════════════════════════════════════════════
//  CAMERA NAVIGATIE NAAR LUCHTHAVEN
// ═══════════════════════════════════════════════════════
function flyToAirport(airport) {
  if (!airport) return;
  S.followFlight = null;
  const apPos = latLonToVector3(airport.lat, airport.lon, CFG.globeRadius);
  const camPos = latLonToVector3(airport.lat, airport.lon, CFG.globeRadius + 75);

  S.cameraTargetLook = apPos;
  S.cameraTargetPos = camPos;
}

// ═══════════════════════════════════════════════════════
//  3D INTERACTIE & RAYCASTING
// ═══════════════════════════════════════════════════════
function setupInteraction(container) {
  const onPointerMove = (e) => {
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);

    // Raycast vliegtuigen
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

    // Raycast luchthavens
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
        document.getElementById('tt-pct').textContent     = `Klik om te kiezen`;
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
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);

    // 1. Check luchthaven klik
    const apIntersects = S.raycaster.intersectObjects(S.airportsGroup.children, false);
    if (apIntersects.length > 0) {
      const ap = apIntersects[0].object.userData.airport;
      if (ap) {
        selectAirport(ap);
        flyToAirport(ap);
        return;
      }
    }

    // 2. Check vliegtuig klik
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

  // Update header dropdown
  const qSelect = document.getElementById('airport-quick-select');
  if (qSelect && qSelect.value !== ap.code) qSelect.value = ap.code;

  // Update HUD
  const hudSel = document.getElementById('hud-sel-airport');
  if (hudSel) hudSel.textContent = ap.code;

  // Update banner card
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

  // Update regie dropdown banen
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

  // Schakel ATC radio afstemming direct naar deze luchthaven
  ATC.setFrequency(ap.freqs.twr, `${ap.code} TOWER`);

  // Render bord lijsten
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

  // Haal actieve vertrekken en aankomsten op uit simulatie
  let departures = S.flights.filter(f => f.origin.code === ap.code);
  let arrivals   = S.flights.filter(f => f.dest.code === ap.code);

  // Zorg dat elk vliegveld minimaal 6-8 vluchten toont door virtuele slots aan te vullen
  if (departures.length < 6) {
    const needed = 6 - departures.length;
    for (let k = 0; k < needed; k++) {
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
    const needed = 6 - arrivals.length;
    for (let k = 0; k < needed; k++) {
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

  // Render Vertrek
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

    row.querySelector('.btn-fids-action').addEventListener('click', () => {
      ATC.ensureAudioCtx();
      ATC.contactFlight(f);
      if (!f.isSlot) S.followFlight = f;
    });

    depView.appendChild(row);
  }

  // Render Aankomst
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

    row.querySelector('.btn-fids-action').addEventListener('click', () => {
      ATC.ensureAudioCtx();
      ATC.contactFlight(f);
      if (!f.isSlot) S.followFlight = f;
    });

    arrView.appendChild(row);
  }
}

// ═══════════════════════════════════════════════════════
//  LUCHTHAVEN REGIE ACTIES (BEPAAL WAT ER GEBEURT)
// ═══════════════════════════════════════════════════════
function regieActionTakeoff() {
  const ap = S.selectedAirport;
  if (!ap) return;
  ATC.ensureAudioCtx();

  // Kies willekeurige bestemming en maatschappij
  let dIdx = Math.floor(Math.random() * AIRPORTS.length);
  while (AIRPORTS[dIdx] === ap) dIdx = Math.floor(Math.random() * AIRPORTS.length);
  const dest = AIRPORTS[dIdx];
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

  // Lanceer live 3D vlucht
  const flight = spawnFlight(ap, dest, airline, 0.0);
  flight.status = 'Opstijgen';
  S.followFlight = flight;

  // Speel toren startklaring dialoog
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

  // Zoek of maak een naderende vlucht
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

  // Update banner tekst
  const apWeather = document.getElementById('ap-disp-weather');
  if (apWeather) apWeather.textContent = `🌦️ Baan ${ap.activeRunway} · ${ap.weather.wind}`;

  // Zend ATIS weerbericht met de torenstem
  const atisLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const atisText = `Information ${atisLetter}. ${ap.name} Airport. Runway in use: ${ap.activeRunway}. Weather: ${ap.weather.cond.toUpperCase()}. Wind ${ap.weather.wind}. QNH ${ap.weather.qnh}. Confirm Information ${atisLetter} on initial contact.`;

  ATC.logMessage(`${ap.code} ATIS`, atisText, true);
  ATC.speak(atisText, true);
}

// ═══════════════════════════════════════════════════════
//  UI INITIALISATIE & EVENT LISTENERS
// ═══════════════════════════════════════════════════════
function initAirportDeck() {
  // Vul snelle luchthavenkiezer in header
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
        flyToAirport(found);
      }
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
    ATC.speak(`${ap.name} Tower on ${ap.freqs.twr}, radar monitor active.`, true);
  });
  document.getElementById('btn-freq-gnd').addEventListener('click', () => {
    const ap = S.selectedAirport;
    ATC.setFrequency(ap.freqs.gnd, `${ap.code} GROUND`);
    ATC.speak(`${ap.name} Ground on ${ap.freqs.gnd}, taxi instructions standby.`, true);
  });
  document.getElementById('btn-freq-app').addEventListener('click', () => {
    const ap = S.selectedAirport;
    ATC.setFrequency(ap.freqs.app, `${ap.code} APPROACH`);
    ATC.speak(`${ap.name} Radar Approach on ${ap.freqs.app}, squawk ident.`, true);
  });

  // Selecteer standaard Schiphol
  selectAirport(AIRPORTS[0]);
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
  // Lagen in/uitschakelen
  for (const btn of document.querySelectorAll('[data-layer]')) {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      S.layers[layer] = !S.layers[layer];
      btn.classList.toggle('active', S.layers[layer]);

      if (layer === 'flights' && S.flightsGroup) S.flightsGroup.visible = S.layers.flights;
      if (layer === 'airports' && S.airportsGroup) S.airportsGroup.visible = S.layers.airports;
      if (layer === 'trails' && S.trailsGroup) S.trailsGroup.visible = S.layers.trails;
      if (layer === 'clouds' && S.cloudMesh) S.cloudMesh.visible = S.layers.clouds;
      if (layer === 'atmosphere' && S.atmoMesh) S.atmoMesh.visible = S.layers.atmosphere;
    });
  }

  // Snelheid
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

  document.getElementById('btn-reset').addEventListener('click', () => {
    S.followFlight = null;
    S.cameraTargetPos = null;
    S.cameraTargetLook = null;
    S.controls.target.set(0, 0, 0);
    S.camera.position.set(0, 50, 260);
  });

  document.getElementById('btn-focus-airport').addEventListener('click', () => {
    flyToAirport(S.selectedAirport);
  });

  document.getElementById('btn-follow').addEventListener('click', () => {
    ATC.ensureAudioCtx();
    if (S.followFlight) {
      S.followFlight = null;
      S.controls.target.set(0, 0, 0);
    } else {
      S.followFlight = S.flights[Math.floor(Math.random() * S.flights.length)];
      ATC.contactFlight(S.followFlight);
    }
    const btn = document.getElementById('btn-follow');
    if (btn) btn.textContent = S.followFlight ? '📍 Stop volgen' : '📍 Volg vlucht';
  });

  // ATC Knoppen
  const btnAtcMute = document.getElementById('btn-atc-mute');
  if (btnAtcMute) btnAtcMute.addEventListener('click', () => ATC.toggleMute());

  const pillAtc = document.getElementById('pill-atc');
  if (pillAtc) pillAtc.addEventListener('click', () => ATC.toggleMute());

  const triggerCall = () => {
    ATC.ensureAudioCtx();
    const flight = S.followFlight || S.flights[Math.floor(Math.random() * S.flights.length)];
    if (flight) ATC.contactFlight(flight);
  };

  const btnAtcCall = document.getElementById('btn-atc-call');
  if (btnAtcCall) btnAtcCall.addEventListener('click', triggerCall);

  const btnAtcTrigger = document.getElementById('btn-atc-trigger');
  if (btnAtcTrigger) btnAtcTrigger.addEventListener('click', triggerCall);

  // Update check
  document.getElementById('btn-refresh').addEventListener('click', () => checkVersion(false));
  document.getElementById('btn-apply-upd').addEventListener('click', applyUpdate);
  document.getElementById('btn-dismiss-upd').addEventListener('click', () => {
    document.getElementById('update-banner').classList.remove('show');
  });
}

// ═══════════════════════════════════════════════════════
//  VERSIE CONTROLE (GitHub Pages Auto-Detect)
// ═══════════════════════════════════════════════════════
let currentVersion = '1.4.0';

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

function applyUpdate() {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(n => caches.delete(n));
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
}

// ═══════════════════════════════════════════════════════
//  INITIALISATIE BIJ START
// ═══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {
  initThree();
  setupControls();
  ATC.init();

  await loadWasm();
  await checkVersion(true);

  // Periodieke versie polling
  setInterval(() => checkVersion(true), CFG.pollMs);

  // Start automatische achtergrondcommunicatie
  ATC.startPeriodicTransmission(() => {
    if (S.followFlight) return S.followFlight;
    return S.flights[Math.floor(Math.random() * S.flights.length)];
  });

  // Start animatielus
  requestAnimationFrame(animate);
});
