/**
 * PetersWorld – Real 3D Globe, Global Flight Radar & Live ATC Radio
 * Fotorealistische 3D wereldbol met Three.js (NASA Blue Marble), WebAssembly en Web Audio ATC.
 * Versie: 1.3.0
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
//  LUCHTHAVENS & AIRLINES DATABASE
// ═══════════════════════════════════════════════════════
const AIRPORTS = [
  // Europa
  { code:'AMS', name:'Amsterdam Schiphol',         lat: 52.31, lon:   4.76, hub:true  },
  { code:'LHR', name:'London Heathrow',             lat: 51.47, lon:  -0.46, hub:true  },
  { code:'CDG', name:'Paris Charles de Gaulle',     lat: 49.01, lon:   2.55, hub:true  },
  { code:'FRA', name:'Frankfurt Main',              lat: 50.03, lon:   8.57, hub:true  },
  { code:'MAD', name:'Madrid Barajas',              lat: 40.47, lon:  -3.57, hub:false },
  { code:'FCO', name:'Rome Fiumicino',              lat: 41.80, lon:  12.25, hub:false },
  { code:'ARN', name:'Stockholm Arlanda',           lat: 59.65, lon:  17.93, hub:false },
  { code:'ZRH', name:'Zürich Airport',              lat: 47.46, lon:   8.55, hub:false },
  { code:'BRU', name:'Brussels Airport',            lat: 50.90, lon:   4.48, hub:false },
  { code:'VIE', name:'Vienna International',        lat: 48.11, lon:  16.57, hub:false },
  // Noord-Amerika
  { code:'JFK', name:'New York JFK',                lat: 40.64, lon: -73.78, hub:true  },
  { code:'LAX', name:'Los Angeles International',   lat: 33.94, lon:-118.40, hub:true  },
  { code:'ORD', name:"Chicago O'Hare",              lat: 41.98, lon: -87.90, hub:true  },
  { code:'ATL', name:'Atlanta Hartsfield',          lat: 33.64, lon: -84.43, hub:false },
  { code:'DFW', name:'Dallas Fort Worth',           lat: 32.90, lon: -97.04, hub:false },
  { code:'YYZ', name:'Toronto Pearson',             lat: 43.68, lon: -79.63, hub:false },
  { code:'MIA', name:'Miami International',         lat: 25.80, lon: -80.28, hub:false },
  { code:'SFO', name:'San Francisco International', lat: 37.62, lon:-122.38, hub:false },
  // Azië & Midden-Oosten
  { code:'DXB', name:'Dubai International',         lat: 25.25, lon:  55.36, hub:true  },
  { code:'HND', name:'Tokyo Haneda',                lat: 35.55, lon: 139.78, hub:true  },
  { code:'PEK', name:'Beijing Capital',             lat: 40.08, lon: 116.58, hub:true  },
  { code:'SIN', name:'Singapore Changi',            lat:  1.36, lon: 103.99, hub:true  },
  { code:'HKG', name:'Hong Kong International',     lat: 22.31, lon: 113.91, hub:false },
  { code:'BOM', name:'Mumbai Chhatrapati Shivaji',   lat: 19.09, lon:  72.87, hub:false },
  { code:'ICN', name:'Seoul Incheon',               lat: 37.46, lon: 126.44, hub:false },
  { code:'BKK', name:'Bangkok Suvarnabhumi',        lat: 13.69, lon: 100.75, hub:false },
  { code:'DOH', name:'Doha Hamad',                  lat: 25.27, lon:  51.61, hub:false },
  // Oceanië, Afrika, Zuid-Amerika
  { code:'SYD', name:'Sydney Kingsford Smith',      lat:-33.95, lon: 151.18, hub:true  },
  { code:'MEL', name:'Melbourne Tullamarine',       lat:-37.67, lon: 144.84, hub:false },
  { code:'JNB', name:'Johannesburg OR Tambo',       lat:-26.14, lon:  28.24, hub:false },
  { code:'NBO', name:'Nairobi Jomo Kenyatta',       lat: -1.32, lon:  36.93, hub:false },
  { code:'CAI', name:'Cairo International',         lat: 30.12, lon:  31.41, hub:false },
  { code:'GRU', name:'São Paulo Guarulhos',         lat:-23.43, lon: -46.47, hub:false },
  { code:'BOG', name:'Bogotá El Dorado',            lat:  4.70, lon: -74.14, hub:false },
  { code:'LIM', name:'Lima Jorge Chávez',           lat:-12.02, lon: -77.11, hub:false },
  { code:'MEX', name:'Mexico City NAICM',           lat: 19.43, lon: -99.07, hub:false },
];

const AIRLINES = [
  { code:'KLM',  callsign:'KLM',       name:'KLM Royal Dutch Airlines', color:0x00a1de, hex:'#00a1de', types:['Boeing 737','Boeing 777','Airbus A330'] },
  { code:'DLH',  callsign:'Lufthansa', name:'Lufthansa',                 color:0xf9ba00, hex:'#f9ba00', types:['Airbus A320','Airbus A350','Boeing 747'] },
  { code:'BAW',  callsign:'Speedbird', name:'British Airways',           color:0x075aaa, hex:'#075aaa', types:['Boeing 777','Airbus A380','Boeing 787'] },
  { code:'AFR',  callsign:'Air France',name:'Air France',                color:0x002157, hex:'#002157', types:['Airbus A320','Airbus A380','Boeing 777'] },
  { code:'UAE',  callsign:'Emirates',  name:'Emirates',                  color:0xc8102e, hex:'#c8102e', types:['Boeing 777','Airbus A380'] },
  { code:'UAL',  callsign:'United',    name:'United Airlines',           color:0x005daa, hex:'#005daa', types:['Boeing 737','Boeing 777','Boeing 787'] },
  { code:'AAL',  callsign:'American',  name:'American Airlines',         color:0xc8102e, hex:'#c8102e', types:['Boeing 737','Boeing 777','Airbus A321'] },
  { code:'DAL',  callsign:'Delta',     name:'Delta Air Lines',           color:0x9d1f26, hex:'#9d1f26', types:['Boeing 737','Airbus A330','Boeing 767'] },
  { code:'ANA',  callsign:'All Nippon',name:'All Nippon Airways',        color:0x13448f, hex:'#13448f', types:['Boeing 787','Boeing 777','Airbus A380'] },
  { code:'SIA',  callsign:'Singapore', name:'Singapore Airlines',        color:0x172e69, hex:'#172e69', types:['Airbus A350','Airbus A380','Boeing 777'] },
  { code:'QFA',  callsign:'Qantas',    name:'Qantas',                    color:0xe8111a, hex:'#e8111a', types:['Boeing 737','Airbus A380','Boeing 787'] },
  { code:'TKA',  callsign:'Turkish',   name:'Turkish Airlines',          color:0xc70000, hex:'#c70000', types:['Boeing 737','Airbus A330','Boeing 777'] },
  { code:'RYR',  callsign:'Ryanair',   name:'Ryanair',                   color:0x073590, hex:'#073590', types:['Boeing 737'] },
  { code:'EZY',  callsign:'easyJet',   name:'easyJet',                   color:0xff6600, hex:'#ff6600', types:['Airbus A319','Airbus A320'] },
  { code:'TUI',  callsign:'TUI',       name:'TUI Airways',               color:0xc0022b, hex:'#c0022b', types:['Boeing 737','Boeing 767'] },
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
//  ATC RADIO ENGINE
// ═══════════════════════════════════════════════════════
class AtcRadioEngine {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
    this.isTransmitting = false;
    this.voices = [];
    this.currentFreq = '118.100';
    this.currentChannel = 'SCHIPHOL TOWER';
    this.timer = null;
  }

  init() {
    if ('speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
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

  playMicClick(isStart = true) {
    if (!this.enabled) return;
    this.ensureAudioCtx();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const dur = isStart ? 0.035 : 0.055;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isStart ? 2200 : 1600, now);
      filter.Q.setValueAtTime(isStart ? 4 : 2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isStart ? 0.20 : 0.30, now);
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

    while (logBox.children.length > 15) {
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

      if (!this.voices || !this.voices.length) {
        this.voices = window.speechSynthesis.getVoices();
      }
      const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
      if (enVoices.length > 0) {
        utt.voice = isTower ? enVoices[0] : (enVoices[1] || enVoices[0]);
      }

      if (isTower) {
        utt.rate = 1.12;
        utt.pitch = 1.05;
      } else {
        utt.rate = 1.04;
        utt.pitch = 0.88;
      }

      this.playMicClick(true);
      this.setTxIndicator(isTower ? 'tower' : 'pilot');

      let doneFired = false;
      const finish = () => {
        if (doneFired) return;
        doneFired = true;
        this.playMicClick(false);
        this.setTxIndicator('idle');
        if (onDone) setTimeout(onDone, 300);
      };

      utt.onend = finish;
      utt.onerror = finish;

      window.speechSynthesis.speak(utt);
    } catch (e) {
      if (onDone) setTimeout(onDone, 1000);
    }
  }

  contactFlight(flight) {
    if (this.isTransmitting || !flight) return;
    this.isTransmitting = true;
    this.ensureAudioCtx();

    const sector = this.determineSector(flight);
    this.setFrequency(sector.freq, sector.name);

    const numOnly = flight.callsign.replace(/\D/g, '');
    const callsignSpoken = flight.airline.callsign + ' ' + numOnly;
    const dialogue = this.generateDialogue(flight, sector, callsignSpoken);

    this.logMessage(sector.code, dialogue.towerText, true);
    this.speak(dialogue.towerSpeech, true, () => {
      setTimeout(() => {
        this.logMessage(flight.callsign, dialogue.pilotText, false);
        this.speak(dialogue.pilotSpeech, false, () => {
          this.isTransmitting = false;
        });
      }, 400);
    });
  }

  determineSector(flight) {
    const lat = flight.origin.lat;
    const lon = flight.origin.lon;

    if (lat > 35 && lat < 65 && lon > -15 && lon < 30) {
      if (flight.origin.code === 'AMS' || flight.dest.code === 'AMS') {
        return { name: 'SCHIPHOL TOWER', code: 'AMS TWR', freq: '118.100' };
      }
      if (flight.origin.code === 'LHR' || flight.dest.code === 'LHR') {
        return { name: 'LONDON CONTROL', code: 'LON RADAR', freq: '132.850' };
      }
      return { name: 'AMSTERDAM RADAR', code: 'AMS RADAR', freq: '124.300' };
    }
    if (lon < -50 && lat > 20) {
      if (flight.origin.code === 'JFK' || flight.dest.code === 'JFK') {
        return { name: 'NEW YORK DEPARTURE', code: 'NY DEP', freq: '125.750' };
      }
      return { name: 'NEW YORK CENTER', code: 'NY CENTER', freq: '133.450' };
    }
    if (lon > 40 && lon < 80) {
      return { name: 'DUBAI TOWER', code: 'DXB TWR', freq: '118.750' };
    }
    if (lon >= 80 && lon < 150) {
      if (flight.origin.code === 'HND' || flight.dest.code === 'HND') {
        return { name: 'TOKYO RADAR', code: 'TOKYO RADAR', freq: '120.400' };
      }
      return { name: 'SINGAPORE RADAR', code: 'SIN RADAR', freq: '134.400' };
    }
    if (lat < 0 && lon > 100) {
      return { name: 'SYDNEY CONTROL', code: 'SYD RADAR', freq: '124.550' };
    }
    return { name: 'AREA CONTROL CENTER', code: 'RADAR', freq: '121.500' };
  }

  generateDialogue(flight, sector, callsignSpoken) {
    const fl = Math.floor(flight.altitude / 304.8);
    const waypoints = ['SPYKER', 'EELDE', 'RIVER', 'LAMSO', 'KENNO', 'SANDY', 'BOBBO', 'GATOW', 'MERIT', 'VAPOR'];
    const rwys = ['18C', '24', '27', '09L', '22R', '31L', '16R', '34L'];
    const wpt = waypoints[Math.floor(Math.random() * waypoints.length)];
    const rwy = rwys[Math.floor(Math.random() * rwys.length)];
    const hdg = (Math.floor(Math.random() * 36) * 10).toString().padStart(3, '0');
    const mach = 'decimal ' + (78 + Math.floor(Math.random() * 8));

    const progress = flight.progress;

    if (progress < 0.15) {
      return {
        towerText: `${flight.callsign}, wind 210 at 11 knots, runway ${rwy}, cleared for takeoff.`,
        towerSpeech: `${callsignSpoken}, wind 210 at 11 knots, runway ${rwy}, cleared for takeoff.`,
        pilotText: `Cleared for takeoff runway ${rwy}, ${flight.callsign}.`,
        pilotSpeech: `Cleared for takeoff runway ${rwy}, ${callsignSpoken}.`
      };
    } else if (progress > 0.85) {
      return {
        towerText: `${flight.callsign}, descend and maintain 3000 feet, expect ILS runway ${rwy}.`,
        towerSpeech: `${callsignSpoken}, descend and maintain 3000 feet, expect ILS runway ${rwy}.`,
        pilotText: `Descend 3000 feet, ILS runway ${rwy}, ${flight.callsign}.`,
        pilotSpeech: `Descend 3000 feet, ILS runway ${rwy}, ${callsignSpoken}.`
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
          towerText: `${flight.callsign}, maintain Mach ${mach} for separation.`,
          towerSpeech: `${callsignSpoken}, maintain Mach ${mach} for separation.`,
          pilotText: `Speed Mach ${mach}, ${flight.callsign}.`,
          pilotSpeech: `Speed Mach ${mach}, ${callsignSpoken}.`
        };
      } else {
        const nextFreq = (119 + Math.floor(Math.random() * 15)).toFixed(3);
        return {
          towerText: `${flight.callsign}, contact Control on ${nextFreq}, good day.`,
          towerSpeech: `${callsignSpoken}, contact Control on ${nextFreq}, good day.`,
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
      this.logMessage('ATC RADIO', 'Luchtverkeersleiding radio kanaal actief.', true);
    }
  }

  startPeriodicTransmission(getFlightFunc) {
    const nextCall = () => {
      const delay = 9000 + Math.random() * 8000;
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
  paused: false,
  speed: 1,
  tick: 0,
  layers: { flights: true, airports: true, trails: true, clouds: true, atmosphere: true },

  // FPS
  lastTime: 0,
  fpsCount: 0,
  fpsLast: 0,
};

function initThreeScene() {
  const container = document.getElementById('webgl-container');

  // Scene
  S.scene = new THREE.Scene();

  // Camera
  S.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  S.camera.position.set(0, 50, 260);

  // Renderer
  S.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  S.renderer.setSize(window.innerWidth, window.innerHeight);
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(S.renderer.domElement);

  // OrbitControls
  S.controls = new THREE.OrbitControls(S.camera, S.renderer.domElement);
  S.controls.enableDamping = true;
  S.controls.dampingFactor = 0.05;
  S.controls.minDistance = 115;
  S.controls.maxDistance = 600;
  S.controls.rotateSpeed = 0.6;
  S.controls.zoomSpeed = 0.8;

  // Verlichting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  S.scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
  sunLight.position.set(300, 100, 200);
  S.scene.add(sunLight);

  // Starfield
  createStarfield();

  // Earth Group
  S.earthGroup = new THREE.Group();
  S.scene.add(S.earthGroup);

  // Realistische Aardbol & Atmosfeer
  createRealEarth(sunLight.position);

  // Groepen voor luchthavens en vluchten
  S.airportsGroup = new THREE.Group();
  S.flightsGroup = new THREE.Group();
  S.trailsGroup = new THREE.Group();
  S.earthGroup.add(S.airportsGroup);
  S.earthGroup.add(S.flightsGroup);
  S.earthGroup.add(S.trailsGroup);

  // Render luchthavens & vluchten
  build3DAirports();
  build3DFlights();

  // Resize handler
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  S.camera.aspect = window.innerWidth / window.innerHeight;
  S.camera.updateProjectionMatrix();
  S.renderer.setSize(window.innerWidth, window.innerHeight);
}

function createStarfield() {
  const count = 1600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 700 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const shade = 0.7 + Math.random() * 0.3;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade * (0.9 + Math.random() * 0.1);
    colors[i * 3 + 2] = 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.85
  });

  const stars = new THREE.Points(geometry, material);
  S.scene.add(stars);
}

function createRealEarth(sunPos) {
  const textureLoader = new THREE.TextureLoader();

  // Textures laden
  const dayMap      = textureLoader.load('textures/earth_atmos_2048.jpg');
  const nightMap    = textureLoader.load('textures/earth_lights_2048.png');
  const normalMap   = textureLoader.load('textures/earth_normal_2048.jpg');
  const specularMap = textureLoader.load('textures/earth_specular_2048.jpg');
  const cloudsMap   = textureLoader.load('textures/earth_clouds_1024.png');

  // Shader die dag-satellietfoto overdag toont, oceanen laat glinsteren en 's nachts stadslichten aandoet
  const earthShader = {
    uniforms: {
      dayTexture:      { value: dayMap },
      nightTexture:    { value: nightMap },
      specularTexture: { value: specularMap },
      sunDirection:    { value: sunPos.clone().normalize() }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D specularTexture;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 sunDir = normalize(sunDirection);
        float NdotL = dot(normal, sunDir);

        float dayFactor = clamp(NdotL * 1.5 + 0.15, 0.0, 1.0);
        float nightFactor = clamp(-NdotL * 1.5 + 0.25, 0.0, 1.0);

        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float specFactor = texture2D(specularTexture, vUv).r;

        // Oceaan glans
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir = normalize(sunDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 30.0) * specFactor * 0.55 * dayFactor;

        vec3 ambient = vec3(0.06, 0.08, 0.12);
        vec3 color = dayColor.rgb * (dayFactor + ambient) + spec + (nightColor.rgb * nightFactor * 1.6);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  };

  const earthGeo = new THREE.SphereGeometry(CFG.globeRadius, 64, 64);
  const earthMat = new THREE.ShaderMaterial({
    uniforms: earthShader.uniforms,
    vertexShader: earthShader.vertexShader,
    fragmentShader: earthShader.fragmentShader
  });

  S.earthMesh = new THREE.Mesh(earthGeo, earthMat);
  S.earthGroup.add(S.earthMesh);

  // Wolkenlaag
  const cloudGeo = new THREE.SphereGeometry(CFG.globeRadius + 0.8, 64, 64);
  const cloudMat = new THREE.MeshLambertMaterial({
    map: cloudsMap,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending
  });
  S.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  S.earthGroup.add(S.cloudMesh);

  // Atmosfeer gloed shader (Fresnel Rayleigh halo)
  const atmoGeo = new THREE.SphereGeometry(CFG.globeRadius + 2.8, 64, 64);
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float fresnel = 1.0 - dot(vNormal, viewDir);
        fresnel = pow(fresnel, 2.8);
        vec3 atmoColor = vec3(0.24, 0.65, 1.0);
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
  const hubGeo = new THREE.SphereGeometry(0.75, 12, 12);
  const smallGeo = new THREE.SphereGeometry(0.45, 8, 8);

  for (const ap of AIRPORTS) {
    const pos = latLonToVector3(ap.lat, ap.lon, CFG.globeRadius + 0.2);
    const mesh = new THREE.Mesh(ap.hub ? hubGeo : smallGeo, ap.hub ? hubMat : smallMat);
    mesh.position.copy(pos);
    mesh.userData = { isAirport: true, airport: ap };
    S.airportsGroup.add(mesh);

    if (ap.hub) {
      // Pulserende radar ring voor hubs
      const ringGeo = new THREE.RingGeometry(0.9, 1.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      S.airportsGroup.add(ring);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  3D VLIEGTUIG MESH & TRAJECTEN
// ═══════════════════════════════════════════════════════
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

  // Vleugels (Swept wings)
  const wingGeo = new THREE.BoxGeometry(3.4, 0.05, 0.7);
  const wing = new THREE.Mesh(wingGeo, mat);
  wing.position.set(0, 0, 0.1);
  group.add(wing);

  // Staart (Tail fin)
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
    const aircraft = airline.types[Math.floor(Math.random() * airline.types.length)];

    const oVec = latLonToVector3(origin.lat, origin.lon, CFG.globeRadius);
    const dVec = latLonToVector3(dest.lat, dest.lon, CFG.globeRadius);

    // 3D Parabolische boogcurve
    const dist = oVec.distanceTo(dVec);
    const mid = oVec.clone().add(dVec).multiplyScalar(0.5);
    const alt = CFG.globeRadius + 3.0 + (dist * 0.08); // Hoogtepiek
    mid.normalize().multiplyScalar(alt);

    const curve = new THREE.QuadraticBezierCurve3(oVec, mid, dVec);

    // Vluchtboog grafisch visualiseren
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

    // Vliegtuig 3D mesh
    const planeMesh = createAirplaneMesh(airline.color);
    planeMesh.userData = { isFlight: true, flightId: i };
    S.flightsGroup.add(planeMesh);

    const distKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
    const speedKmh = 800 + Math.floor(Math.random() * 160);
    const durationH = distKm / speedKmh;

    const flight = {
      id: i,
      callsign: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
      airline,
      aircraft,
      origin,
      dest,
      altitude: 9000 + Math.floor(Math.random() * 3500),
      speedKmh,
      durationH,
      progress: Math.random(),
      progressRate: 1 / (durationH * 3600 * 60),
      curve,
      arcLine,
      planeMesh,
      hovered: false
    };

    planeMesh.userData.flight = flight;
    S.flights.push(flight);
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

  // Wolken en aarde langzaam laten roteren
  if (S.cloudMesh && S.layers.clouds) {
    S.cloudMesh.rotation.y += 0.00015;
  }

  // Update positie en oriëntatie van alle 3D vliegtuigen
  const dtSim = dt * S.speed;
  for (const f of S.flights) {
    if (!S.paused) {
      f.progress += f.progressRate * dtSim;
      if (f.progress >= 1.0) f.progress = 0;
    }

    // 3D positie op de boog
    const p = f.curve.getPointAt(f.progress);
    f.planeMesh.position.copy(p);

    // Tangens vector (vliegrichting)
    const tangent = f.curve.getTangentAt(f.progress).normalize();
    // Buitenwaartse normaal vanaf het centrum van de aarde
    const up = p.clone().normalize();

    // Richt de neus van het vliegtuig langs de vliegrichting
    const matrix = new THREE.Matrix4();
    const zAxis = tangent.clone();
    const yAxis = up.clone();
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
    yAxis.crossVectors(zAxis, xAxis).normalize();

    matrix.makeBasis(xAxis, yAxis, zAxis);
    f.planeMesh.quaternion.setFromRotationMatrix(matrix);

    // Lijnkleur markeren indien geselecteerd
    if (f === S.followFlight) {
      f.arcLine.material.opacity = 0.85;
      f.arcLine.material.color.setHex(0xfacc15);
    } else if (f.hovered) {
      f.arcLine.material.opacity = 0.65;
    } else {
      f.arcLine.material.opacity = S.layers.trails ? 0.28 : 0.0;
      f.arcLine.material.color.setHex(f.airline.color);
    }
  }

  // Camera track modus (volg geselecteerd vliegtuig)
  if (S.followFlight) {
    const targetPos = S.followFlight.planeMesh.position;
    S.controls.target.lerp(targetPos, 0.08);

    // Camera soepel laten meebewegen
    const offset = targetPos.clone().normalize().multiplyScalar(40);
    const idealCamPos = targetPos.clone().add(offset);
    S.camera.position.lerp(idealCamPos, 0.04);
  }

  // OrbitControls bijwerken
  S.controls.update();

  // Renderen
  S.renderer.render(S.scene, S.camera);
}

// ═══════════════════════════════════════════════════════
//  INTERACTIE & RAYCASTING
// ═══════════════════════════════════════════════════════
function setupInteraction() {
  const container = document.getElementById('webgl-container');

  const onPointerMove = (e) => {
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);
    const intersects = S.raycaster.intersectObjects(S.flightsGroup.children, true);

    for (const f of S.flights) f.hovered = false;
    const tt = document.getElementById('tooltip');

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj.parent && !topObj.userData.flight) {
        topObj = topObj.parent;
      }

      const flight = topObj.userData.flight;
      if (flight) {
        flight.hovered = true;
        const pct = (flight.progress * 100).toFixed(0);
        document.getElementById('tt-route').textContent   = flight.callsign;
        document.getElementById('tt-airline').textContent = `${flight.airline.name} · ${flight.aircraft}`;
        document.getElementById('tt-from').textContent    = flight.origin.code;
        document.getElementById('tt-to').textContent      = flight.dest.code;
        document.getElementById('tt-alt').textContent     = `${Number(flight.altitude).toLocaleString('nl-NL')} m`;
        document.getElementById('tt-spd').textContent     = `${flight.speedKmh} km/h`;
        document.getElementById('tt-pct').textContent     = `${pct}%`;
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

    tt.classList.remove('show');
    container.style.cursor = 'grab';
  };

  const onClick = (e) => {
    ATC.ensureAudioCtx();
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    S.raycaster.setFromCamera(S.mouse, S.camera);
    const intersects = S.raycaster.intersectObjects(S.flightsGroup.children, true);

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj.parent && !topObj.userData.flight) {
        topObj = topObj.parent;
      }
      const flight = topObj.userData.flight;
      if (flight) {
        S.followFlight = (S.followFlight === flight) ? null : flight;
        updateFlightPanelUI();
        ATC.contactFlight(flight);
      }
    }
  };

  container.addEventListener('mousemove', onPointerMove);
  container.addEventListener('click', onClick);
}

// ═══════════════════════════════════════════════════════
//  VLUCHT PANEL UI
// ═══════════════════════════════════════════════════════
function buildFlightPanel() {
  const list = document.getElementById('flight-list');
  if (!list) return;
  list.innerHTML = '';

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
      updateFlightPanelUI();
      ATC.contactFlight(f);
    });

    list.appendChild(item);
    f._listItem = item;
  }
}

function updateFlightPanelUI() {
  for (const f of S.flights) {
    if (!f._listItem) continue;
    f._listItem.classList.toggle('active', f === S.followFlight);
    const pctEl = document.getElementById(`fp-pct-${f.id}`);
    if (pctEl) pctEl.textContent = `${(f.progress * 100).toFixed(0)}%`;
  }

  const btn = document.getElementById('btn-follow');
  if (btn) btn.textContent = S.followFlight ? '📍 Stop volgen' : '📍 Volg vlucht';
}

setInterval(updateFlightPanelUI, 500);

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
    S.controls.target.set(0, 0, 0);
    S.camera.position.set(0, 50, 260);
    updateFlightPanelUI();
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
    updateFlightPanelUI();
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
async function checkVersion(isInit = false) {
  try {
    const r = await fetch(`${CFG.versionFile}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (!r.ok) return;
    const data = await r.json();

    const remoteBuild = parseInt(data.build || 0, 10);
    const remoteVer = data.version || '1.3.0';

    const verTxt = document.getElementById('ver-txt');
    if (verTxt) verTxt.textContent = `v${remoteVer}`;

    const storedBuild = parseInt(localStorage.getItem('pw_build') || '0', 10);
    if (isInit && !localStorage.getItem('pw_build')) {
      localStorage.setItem('pw_build', remoteBuild);
      localStorage.setItem('pw_ver', remoteVer);
      return;
    }

    if (remoteBuild > storedBuild) {
      const banner = document.getElementById('update-banner');
      document.getElementById('upd-ver').textContent = `v${remoteVer} (Build #${remoteBuild})`;
      if (data.features && data.features[0]) {
        document.getElementById('upd-note').textContent = data.features[0];
      }
      banner.classList.add('show');
      const dot = document.getElementById('ver-dot');
      if (dot) {
        dot.style.background = '#facc15';
        dot.style.boxShadow = '0 0 8px #facc15';
      }
    }
  } catch {}
}

async function applyUpdate() {
  if ('caches' in window) {
    for (const k of await caches.keys()) await caches.delete(k);
  }
  const url = new URL(location.href);
  url.searchParams.set('v', Date.now());
  location.href = url.toString();
}

// ═══════════════════════════════════════════════════════
//  INITIALISATIE
// ═══════════════════════════════════════════════════════
async function init() {
  initThreeScene();
  setupInteraction();
  setupControls();
  buildFlightPanel();

  await loadWasm();

  ATC.init();
  ATC.startPeriodicTransmission(() => {
    return S.followFlight || S.flights[Math.floor(Math.random() * S.flights.length)];
  });

  await checkVersion(true);
  setInterval(() => checkVersion(false), CFG.pollMs);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  requestAnimationFrame(animate);
  console.log('🌍 [PetersWorld] Fotorealistische 3D Earth & Global Flight Radar gereed!');
}

document.addEventListener('DOMContentLoaded', init);
