/**
 * ==============================================================================
 * PetersWorld - WebAssembly 3D Planet Engine & Auto-Version Manager
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Configuratie & State
// ------------------------------------------------------------------------------
const APP_CONFIG = {
  appName: 'PetersWorld',
  defaultVersion: '1.0.0',
  defaultBuild: 1,
  pollIntervalMs: 30000, // Controleer elke 30 seconden op updates
  wasmFile: 'petersworld.wasm',
  versionFile: 'version.json'
};

const state = {
  wasm: null,
  wasmMemory: null,
  currentVersion: APP_CONFIG.defaultVersion,
  currentBuild: APP_CONFIG.defaultBuild,
  currentCommit: 'dev-local',
  remoteVersionData: null,
  updateAvailable: false,
  autoReloadEnabled: true,

  // Render & Camera State
  theme: 'hologram', // 'hologram' | 'topo' | 'matrix'
  isPaused: false,
  speedFactor: 1,
  rotY: 0,
  rotX: 0.35,
  zoom: 1.0,
  targetRotY: 0,
  targetRotX: 0.35,
  targetZoom: 1.0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  dragVelocityX: 0,
  dragVelocityY: 0,

  // Simulatie entiteiten
  satellites: [
    { name: 'Vroon-Relay Alpha', radius: 240, speed: 0.022, angle: 0.0, inc: 0.35, color: '#38bdf8' },
    { name: 'Peter-Sat Sentinel', radius: 275, speed: -0.016, angle: 1.8, inc: -0.65, color: '#facc15' },
    { name: 'Orbital Hub Gamma', radius: 310, speed: 0.012, angle: 3.4, inc: 1.15, color: '#c084fc' },
    { name: 'DeepScan Delta', radius: 230, speed: 0.028, angle: 4.9, inc: -0.20, color: '#22c55e' }
  ],
  landmarks: [
    { name: "Peter's Citadel", lat: 52.37, lon: 4.90, type: 'Hoofdstad', desc: 'Centrale metropool en bestuurszetel van PetersWorld.' },
    { name: 'Vroon Orbital Station', lat: 0.0, lon: 10.0, type: 'Ruimtehaven', desc: 'Equatoriale lanceerbasis en verbinding met de ruimtelift.' },
    { name: 'Cyber Tokyo', lat: 35.68, lon: 139.76, type: 'Mega Hub', desc: 'Technologisch knooppunt voor quantum dataverwerking.' },
    { name: 'Silicon Bay', lat: 37.77, lon: -122.42, type: 'Tech Vallei', desc: 'Onderzoekscentrum voor neurale architecturen en WASM.' },
    { name: 'Quantum Observatory', lat: -24.62, lon: -70.40, type: 'Observatorium', desc: 'Hooggelegen telescooparray voor deep-space scans.' },
    { name: 'Aurora Polar Station', lat: 64.14, lon: -21.94, type: 'Onderzoekslab', desc: 'Poolbasis voor atmosfeer- en plasmametingen.' },
    { name: 'Mariana Power Core', lat: 11.35, lon: 142.20, type: 'Energiebron', desc: 'Geothermische diepzee-energiecentrale.' },
    { name: 'Neo Alexandria', lat: 31.20, lon: 29.91, type: 'Kennisbank', desc: 'Universeel archief van menselijke en AI kennis.' }
  ],
  pulses: [], // { lat, lon, radius, maxRadius, intensity, color }
  audioEnabled: false,
  audioCtx: null
};

// ------------------------------------------------------------------------------
// 2. Audio Synthesizer (Futuristische Sound FX via Web Audio API)
// ------------------------------------------------------------------------------
function initAudio() {
  if (!state.audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      state.audioCtx = new AudioContext();
    }
  }
}

function playSound(type) {
  if (!state.audioEnabled || !state.audioCtx) return;
  try {
    const ctx = state.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'pulse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'update') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    // Negeer audio errors stilzwijgend
  }
}

// ------------------------------------------------------------------------------
// 3. Automatische Versie- & Update Detectie Engine
// ------------------------------------------------------------------------------
class VersionManager {
  static async init() {
    // Lees eerder opgeslagen client versie
    const savedVer = localStorage.getItem('petersworld_version');
    const savedBuild = localStorage.getItem('petersworld_build');
    if (savedVer) state.currentVersion = savedVer;
    if (savedBuild) state.currentBuild = parseInt(savedBuild, 10);

    // Controleer direct bij het laden van de pagina
    await this.checkForUpdates(true);

    // Periodieke background polling
    setInterval(() => {
      this.checkForUpdates(false);
    }, APP_CONFIG.pollIntervalMs);

    // Controleer onmiddellijk wanneer de gebruiker terugkeert naar het tabblad
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates(false);
      }
    });

    // Registreer Service Worker
    this.registerServiceWorker();
  }

  static async checkForUpdates(isInitial = false) {
    try {
      // Gebruik timestamp cache-busting en explicit no-store headers
      const res = await fetch(`${APP_CONFIG.versionFile}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) return;

      const remote = await res.json();
      state.remoteVersionData = remote;

      const remoteVer = remote.version || APP_CONFIG.defaultVersion;
      const remoteBuild = parseInt(remote.build || 0, 10);
      const remoteCommit = remote.git_hash || 'dev';

      // Werk modal telemetry bij
      const modalServerBuild = document.getElementById('modal-server-build');
      const modalCommitHash = document.getElementById('modal-commit-hash');
      const modalBuildTime = document.getElementById('modal-build-time');
      if (modalServerBuild) modalServerBuild.textContent = `#${remoteBuild}`;
      if (modalCommitHash) modalCommitHash.textContent = remoteCommit;
      if (modalBuildTime && remote.timestamp) {
        modalBuildTime.textContent = new Date(remote.timestamp).toLocaleString('nl-NL');
      }

      // Controleer of er een nieuwere versie of build is
      const isNewer = (remoteBuild > state.currentBuild) || 
                      (remoteVer !== state.currentVersion && remoteBuild >= state.currentBuild);

      if (isInitial && !localStorage.getItem('petersworld_version')) {
        // Eerste bezoek van deze gebruiker: markeer huidige versie als up-to-date
        state.currentVersion = remoteVer;
        state.currentBuild = remoteBuild;
        state.currentCommit = remoteCommit;
        localStorage.setItem('petersworld_version', remoteVer);
        localStorage.setItem('petersworld_build', remoteBuild.toString());
        this.updateBadgeUI(false);
        return;
      }

      if (isNewer) {
        this.onNewVersionDetected(remote);
      } else {
        this.updateBadgeUI(false);
      }
    } catch (err) {
      console.warn('[VersionManager] Update controle kon niet worden voltooid:', err);
    }
  }

  static onNewVersionDetected(remote) {
    state.updateAvailable = true;
    this.updateBadgeUI(true);

    const banner = document.getElementById('update-banner');
    const versionTag = document.getElementById('banner-version-tag');
    const notes = document.getElementById('banner-notes');

    if (versionTag) versionTag.textContent = `v${remote.version} (Build #${remote.build})`;
    if (notes && remote.features && remote.features.length > 0) {
      notes.textContent = remote.features[0];
    }
    if (banner) banner.classList.add('show');

    playSound('update');

    // Indien automatische herlaadoptie actief is én dit niet tijdens draggen is
    if (state.autoReloadEnabled && !state.isDragging && localStorage.getItem('petersworld_version')) {
      console.log('🚀 [PetersWorld] Nieuwe versie gedetecteerd! Automatische herlaad geactiveerd.');
      // Geef de banner 1.5 seconde de tijd om op te vallen en ververs dan netjes
      setTimeout(() => {
        this.applyUpdate();
      }, 1500);
    }
  }

  static updateBadgeUI(hasUpdate) {
    const versionDisplay = document.getElementById('version-display');
    const versionDot = document.getElementById('version-dot');
    const badge = document.getElementById('badge-version');

    if (versionDisplay) {
      versionDisplay.textContent = `v${state.currentVersion}`;
    }

    if (hasUpdate) {
      if (badge) badge.classList.add('update-pending');
      if (versionDot) {
        versionDot.style.background = '#facc15';
        versionDot.style.boxShadow = '0 0 10px #facc15';
      }
    } else {
      if (badge) badge.classList.remove('update-pending');
      if (versionDot) {
        versionDot.style.background = '#22c55e';
        versionDot.style.boxShadow = '0 0 8px #22c55e';
      }
    }

    const modalClientVer = document.getElementById('modal-client-ver');
    if (modalClientVer) modalClientVer.textContent = `v${state.currentVersion} (#${state.currentBuild})`;
  }

  static async applyUpdate() {
    if (state.remoteVersionData) {
      localStorage.setItem('petersworld_version', state.remoteVersionData.version);
      localStorage.setItem('petersworld_build', state.remoteVersionData.build.toString());
    }

    // Leeg eventuele Service Worker CacheStorage
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(k => caches.delete(k)));
      } catch (e) {
        console.warn('Cache wissen fout:', e);
      }
    }

    // Informeer Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }

    // Herlaad de browser geforceerd met cache-busting querystring
    const timestamp = Date.now();
    const url = new URL(window.location.href);
    url.searchParams.set('v', timestamp.toString());
    window.location.href = url.toString();
  }

  static registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              VersionManager.checkForUpdates(false);
            }
          });
        });
      }).catch((e) => {
        // Stille fallback voor offline of sandboxed omgevingen
      });
    }
  }
}

// ------------------------------------------------------------------------------
// 4. WebAssembly Initialisatie & Bridge
// ------------------------------------------------------------------------------
class WasmBridge {
  static async load() {
    const wasmUrl = `${APP_CONFIG.wasmFile}?v=${Date.now()}`;
    const imports = {
      env: {}
    };

    try {
      let wasmInstance;
      if (WebAssembly.instantiateStreaming) {
        try {
          const res = await WebAssembly.instantiateStreaming(fetch(wasmUrl), imports);
          wasmInstance = res.instance;
        } catch (e) {
          // Fallback indien mime-type niet direct streaming toestaat
          const response = await fetch(wasmUrl);
          const buffer = await response.arrayBuffer();
          const module = await WebAssembly.compile(buffer);
          wasmInstance = await WebAssembly.instantiate(module, imports);
        }
      } else {
        const response = await fetch(wasmUrl);
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        wasmInstance = await WebAssembly.instantiate(module, imports);
      }

      state.wasm = wasmInstance.exports;
      state.wasmMemory = wasmInstance.exports.memory;

      // Initialiseer wereld status in WASM geheugen
      if (state.wasm.init_world) {
        state.wasm.init_world(Date.now() & 0xFFFF);
      }

      const versionInt = state.wasm.get_version ? state.wasm.get_version() : 100;
      console.log(`✅ [PetersWorld WASM] Engine v${versionInt / 100} succesvol geladen in geheugen.`);

      // Update badge
      const wasmBadge = document.getElementById('badge-wasm');
      if (wasmBadge) {
        wasmBadge.innerHTML = `<span class="badge-dot" style="background:#22c55e;box-shadow:0 0 8px #22c55e;"></span><span>WASM v${versionInt / 100}</span>`;
      }

      return true;
    } catch (err) {
      console.error('❌ [PetersWorld WASM] Fout bij laden van WASM module:', err);
      return false;
    }
  }
}

// ------------------------------------------------------------------------------
// 5. 3D Planet Graphics & Canvas Renderer
// ------------------------------------------------------------------------------
class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.lastFrameTime = performance.now();
    this.fpsCounter = 60;
    this.framesCount = 0;
    this.lastFpsUpdate = performance.now();

    // Genereer synthetische continent polygonen voor de wereldbol
    this.continents = this.generateContinentPolygons();

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  generateContinentPolygons() {
    // Gestileerde geografische coördinaten voor herkenbare werelddelen
    return [
      // Europa
      { points: [[58, -5], [62, 10], [55, 20], [45, 15], [38, -5], [42, -9], [52, 4]] },
      // Afrika
      { points: [[36, -5], [34, 10], [30, 32], [10, 45], [-5, 40], [-25, 32], [-34, 20], [-20, 12], [5, 2], [15, -15], [30, -10]] },
      // Azië
      { points: [[70, 40], [72, 80], [70, 130], [60, 165], [40, 140], [35, 120], [22, 115], [10, 105], [20, 85], [30, 60], [45, 40]] },
      // Noord-Amerika
      { points: [[70, -140], [72, -95], [60, -65], [45, -60], [30, -80], [20, -100], [32, -118], [48, -125], [60, -140]] },
      // Zuid-Amerika
      { points: [[12, -75], [5, -50], [-10, -36], [-25, -45], [-45, -65], [-55, -68], [-35, -72], [-15, -75], [-5, -80]] },
      // Australië
      { points: [[-12, 130], [-15, 145], [-28, 153], [-38, 145], [-35, 118], [-20, 115]] },
      // Antarctica
      { points: [[-72, 0], [-74, 60], [-73, 120], [-75, 180], [-72, -120], [-70, -60]] }
    ];
  }

  setupInteractions() {
    const canvas = this.canvas;

    const onPointerDown = (clientX, clientY) => {
      state.isDragging = true;
      state.lastMouseX = clientX;
      state.lastMouseY = clientY;
      state.dragVelocityX = 0;
      state.dragVelocityY = 0;
      this.hidePopover();
    };

    const onPointerMove = (clientX, clientY) => {
      if (state.isDragging) {
        const dx = clientX - state.lastMouseX;
        const dy = clientY - state.lastMouseY;
        state.targetRotY += dx * 0.006;
        state.targetRotX = Math.max(-1.4, Math.min(1.4, state.targetRotX + dy * 0.006));
        state.dragVelocityX = dx * 0.006;
        state.dragVelocityY = dy * 0.006;
        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
      } else {
        this.checkHover(clientX, clientY);
      }
    };

    const onPointerUp = (clientX, clientY) => {
      if (state.isDragging) {
        state.isDragging = false;
        // Klik check: als er nauwelijks bewogen is, trigger interactie
        const movedDist = Math.hypot(state.dragVelocityX, state.dragVelocityY);
        if (movedDist < 0.01) {
          this.handleClickOnSphere(clientX, clientY);
        }
      }
    };

    // Muis events
    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => onPointerUp(e.clientX, e.clientY));

    // Touch events (voor mobiel & tablets)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        onPointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    });

    // Zoom via scrollwiel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.targetZoom = Math.max(0.65, Math.min(2.2, state.targetZoom - e.deltaY * 0.0012));
    }, { passive: false });
  }

  // Wiskundige 3D sferische projectie
  project(latDeg, lonDeg, radius = 180) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;

    // 1. Basis coördinaten
    let x = radius * Math.cos(lat) * Math.sin(lon);
    let y = -radius * Math.sin(lat);
    let z = radius * Math.cos(lat) * Math.cos(lon);

    // 2. Rotatie rond Y as
    const cosY = Math.cos(state.rotY);
    const sinY = Math.sin(state.rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // 3. Rotatie rond X as (pitch tilt)
    const cosX = Math.cos(state.rotX);
    const sinX = Math.sin(state.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // 4. Projecteer naar 2D scherm
    const cx = this.width / 2;
    const cy = this.height / 2;
    const scale = state.zoom;

    return {
      x: cx + x1 * scale,
      y: cy + y2 * scale,
      z: z2 * scale,
      visible: z2 > 0 // Zichtbaar op de voorzijde van de planeet
    };
  }

  handleClickOnSphere(clientX, clientY) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = 180 * state.zoom;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist <= r) {
      // Raycast benadering naar lat/lon
      const nx = dx / r;
      const ny = dy / r;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

      // Omgekeerde rotatie X & Y
      const cosX = Math.cos(-state.rotX);
      const sinX = Math.sin(-state.rotX);
      const ry = ny * cosX - nz * sinX;
      const rz = ny * sinX + nz * cosX;

      const cosY = Math.cos(-state.rotY);
      const sinY = Math.sin(-state.rotY);
      const rx = nx * cosY + rz * sinY;
      const rfinalZ = -nx * sinY + rz * cosY;

      const lat = -Math.asin(Math.max(-1, Math.min(1, ry))) * (180 / Math.PI);
      const lon = Math.atan2(rx, rfinalZ) * (180 / Math.PI);

      this.triggerPulse(lat, lon, 1.0);
      playSound('pulse');
    }
  }

  checkHover(clientX, clientY) {
    let hovered = null;
    for (const marker of state.landmarks) {
      const p = this.project(marker.lat, marker.lon, 184);
      if (p.visible) {
        const d = Math.hypot(clientX - p.x, clientY - p.y);
        if (d < 16) {
          hovered = { marker, x: p.x, y: p.y };
          break;
        }
      }
    }

    if (hovered) {
      this.showPopover(hovered.marker, hovered.x, hovered.y);
    } else {
      this.hidePopover();
    }
  }

  showPopover(marker, x, y) {
    const pop = document.getElementById('landmark-popover');
    if (!pop) return;
    document.getElementById('popover-title').textContent = marker.name;
    document.getElementById('popover-coords').textContent = `${marker.lat.toFixed(2)}° N, ${marker.lon.toFixed(2)}° E`;
    document.getElementById('popover-desc').textContent = marker.desc;

    pop.style.left = `${Math.min(window.innerWidth - 240, x + 15)}px`;
    pop.style.top = `${Math.min(window.innerHeight - 120, y - 20)}px`;
    pop.classList.add('visible');
  }

  hidePopover() {
    const pop = document.getElementById('landmark-popover');
    if (pop) pop.classList.remove('visible');
  }

  triggerPulse(lat, lon, intensity = 1.0) {
    state.pulses.push({
      lat,
      lon,
      radius: 0,
      maxRadius: 40,
      intensity: intensity,
      color: state.theme === 'matrix' ? '#22c55e' : (state.theme === 'topo' ? '#facc15' : '#38bdf8')
    });

    // Registreer ook in WebAssembly lineair geheugen
    if (state.wasm && state.wasm.add_pulse) {
      state.wasm.add_pulse(Math.round(lat * 100), Math.round(lon * 100), Math.round(intensity * 100));
    }
  }

  addSatellite() {
    const colors = ['#38bdf8', '#facc15', '#c084fc', '#22c55e', '#f43f5e'];
    const idx = state.satellites.length + 1;
    const newSat = {
      name: `Peter-Relay #${idx}`,
      radius: 220 + (Math.random() * 120),
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.012 + Math.random() * 0.02),
      angle: Math.random() * Math.PI * 2,
      inc: (Math.random() - 0.5) * 2.2,
      color: colors[idx % colors.length]
    };
    state.satellites.push(newSat);

    // Registreer in WASM
    if (state.wasm && state.wasm.add_satellite) {
      state.wasm.add_satellite(Math.round(newSat.radius), Math.round(newSat.speed * 1000), Math.round(newSat.inc * 100), 1);
    }

    const hudSats = document.getElementById('hud-sats');
    if (hudSats) hudSats.textContent = state.satellites.length.toString();

    playSound('click');
  }

  // Render loop
  render() {
    const now = performance.now();
    const dt = Math.min(100, now - this.lastFrameTime);
    this.lastFrameTime = now;

    // FPS berekening
    this.framesCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.fpsCounter = this.framesCount;
      this.framesCount = 0;
      this.lastFpsUpdate = now;
      const hudFps = document.getElementById('hud-fps');
      if (hudFps) hudFps.textContent = `${this.fpsCounter} FPS`;
    }

    // 1. WASM Simulation Step
    if (state.wasm && state.wasm.update && !state.isPaused) {
      const tick = state.wasm.update(Math.round(dt), state.speedFactor);
      const hudTick = document.getElementById('hud-tick');
      if (hudTick) hudTick.textContent = tick.toString();
    }

    // 2. Camera & Momentum Physics
    if (!state.isPaused && !state.isDragging) {
      state.targetRotY += 0.003 * state.speedFactor;
    }
    state.rotY += (state.targetRotY - state.rotY) * 0.12;
    state.rotX += (state.targetRotX - state.rotX) * 0.12;
    state.zoom += (state.targetZoom - state.zoom) * 0.15;

    // Update HUD telemetry
    const hudRot = document.getElementById('hud-rot');
    if (hudRot) hudRot.textContent = `${((state.rotY % (Math.PI * 2)) * (180 / Math.PI)).toFixed(1)}°`;

    // 3. Canvas schoonmaken
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = 180 * state.zoom;

    // Achtergrond sfeer & sterren
    this.drawSpaceBackground(cx, cy);

    // Buitenste sfeer / atmosferische halo
    this.drawAtmosphere(cx, cy, r);

    // Planeet basis bol & schaduw
    this.drawPlanetSphere(cx, cy, r);

    // Rasterlijnen (Meridianen & Parallellen)
    this.drawGrid(r);

    // Continenten
    this.drawContinents(r);

    // Puls golven
    this.drawPulses(dt);

    // Landmarks & Steden
    this.drawLandmarks();

    // Satellieten & Banen
    this.drawSatellites(dt);

    requestAnimationFrame(() => this.render());
  }

  drawSpaceBackground(cx, cy) {
    const ctx = this.ctx;
    // Donkere gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(this.width, this.height));
    bgGrad.addColorStop(0, '#090f1d');
    bgGrad.addColorStop(0.6, '#060a12');
    bgGrad.addColorStop(1, '#030509');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawAtmosphere(cx, cy, r) {
    const ctx = this.ctx;
    let haloColor = 'rgba(56, 189, 248, ';
    if (state.theme === 'matrix') haloColor = 'rgba(34, 197, 94, ';
    else if (state.theme === 'topo') haloColor = 'rgba(250, 204, 21, ';

    const atmoGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.25);
    atmoGrad.addColorStop(0, haloColor + '0.45)');
    atmoGrad.addColorStop(0.5, haloColor + '0.15)');
    atmoGrad.addColorStop(1, haloColor + '0)');

    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlanetSphere(cx, cy, r) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Bol achtergrondkleur afhankelijk van thema
    if (state.theme === 'matrix') {
      ctx.fillStyle = '#05180f';
    } else if (state.theme === 'topo') {
      ctx.fillStyle = '#0a2540';
    } else {
      ctx.fillStyle = '#0a1324';
    }
    ctx.fill();

    // Dag / Nacht schaduw (terminator)
    const sunAngle = state.rotY * 0.5;
    const shadowX = cx + Math.cos(sunAngle) * r * 0.5;
    const shadowGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');

    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();
  }

  drawGrid(r) {
    const ctx = this.ctx;
    let strokeCol = 'rgba(56, 189, 248, 0.16)';
    if (state.theme === 'matrix') strokeCol = 'rgba(34, 197, 94, 0.2)';
    else if (state.theme === 'topo') strokeCol = 'rgba(255, 255, 255, 0.08)';

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;

    // Parallellen (breedtecirkels)
    const lats = [-60, -30, 0, 30, 60];
    for (const lat of lats) {
      ctx.beginPath();
      let started = false;
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = this.project(lat, lon, r);
        if (p.visible) {
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else { ctx.lineTo(p.x, p.y); }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // Meridianen (lengtecirkels)
    const lons = [0, 45, 90, 135, 180, -135, -90, -45];
    for (const lon of lons) {
      ctx.beginPath();
      let started = false;
      for (let lat = -90; lat <= 90; lat += 5) {
        const p = this.project(lat, lon, r);
        if (p.visible) {
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else { ctx.lineTo(p.x, p.y); }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
  }

  drawContinents(r) {
    const ctx = this.ctx;
    let fillCol = 'rgba(56, 189, 248, 0.25)';
    let borderCol = 'rgba(56, 189, 248, 0.7)';
    if (state.theme === 'matrix') {
      fillCol = 'rgba(34, 197, 94, 0.22)';
      borderCol = '#22c55e';
    } else if (state.theme === 'topo') {
      fillCol = 'rgba(34, 197, 94, 0.45)';
      borderCol = '#4ade80';
    }

    ctx.fillStyle = fillCol;
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.5;

    for (const cont of this.continents) {
      ctx.beginPath();
      let visibleCount = 0;
      let first = true;

      for (const pt of cont.points) {
        const p = this.project(pt[0], pt[1], r + 1);
        if (p.visible) visibleCount++;
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.closePath();

      // Alleen tekenen als er punten op de zichtbare voorzijde zijn
      if (visibleCount > 1) {
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  drawPulses(dt) {
    const ctx = this.ctx;
    for (let i = state.pulses.length - 1; i >= 0; i--) {
      const pulse = state.pulses[i];
      pulse.radius += (dt * 0.05);
      pulse.intensity -= (dt * 0.0012);

      if (pulse.intensity <= 0 || pulse.radius >= pulse.maxRadius) {
        state.pulses.splice(i, 1);
        continue;
      }

      const p = this.project(pulse.lat, pulse.lon, 182);
      if (p.visible) {
        ctx.save();
        ctx.strokeStyle = pulse.color;
        ctx.globalAlpha = Math.max(0, pulse.intensity);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse.radius * state.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawLandmarks() {
    const ctx = this.ctx;
    const now = performance.now() * 0.003;

    for (const m of state.landmarks) {
      const p = this.project(m.lat, m.lon, 184);
      if (p.visible) {
        // Gloeiende radar ring rondom landmark
        const pulseR = 4 + Math.sin(now + m.lat) * 2;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Kern stip
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label bij belangrijke hoofdstad Peter's Citadel
        if (m.name.includes("Peter's") || state.zoom > 1.2) {
          ctx.font = '10px SFMono-Regular, monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(m.name, p.x + 8, p.y - 4);
        }
      }
    }
  }

  drawSatellites(dt) {
    const ctx = this.ctx;

    for (const sat of state.satellites) {
      if (!state.isPaused) {
        sat.angle += sat.speed * state.speedFactor;
      }

      // Baanvlak projectie in 3D
      const r = sat.radius;
      const cosA = Math.cos(sat.angle);
      const sinA = Math.sin(sat.angle);

      // Baan inclinatie
      const inc = sat.inc;
      const x0 = r * cosA;
      const y0 = r * sinA * Math.sin(inc);
      const z0 = r * sinA * Math.cos(inc);

      // Rotatie rond Y
      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);
      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;

      // Rotatie rond X
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const cx = this.width / 2;
      const cy = this.height / 2;
      const scale = state.zoom;
      const sx = cx + x1 * scale;
      const sy = cy + y2 * scale;

      // Alleen voorzijde satellieten krijgen volledige helderheid
      const isFront = z2 > 0;
      ctx.save();
      ctx.globalAlpha = isFront ? 1.0 : 0.35;

      // Satelliet stip
      ctx.fillStyle = sat.color;
      ctx.shadowColor = sat.color;
      ctx.shadowBlur = isFront ? 10 : 2;
      ctx.beginPath();
      ctx.arc(sx, sy, isFront ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Klein label
      if (isFront && state.zoom > 1.1) {
        ctx.font = '9px SFMono-Regular, monospace';
        ctx.fillStyle = sat.color;
        ctx.fillText(sat.name, sx + 6, sy - 4);
      }
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------------------------
// 6. UI Event Listeners & Interactie Koppelingen
// ------------------------------------------------------------------------------
function setupUI(renderer) {
  // Snelheid knoppen
  const speedBtns = document.querySelectorAll('[data-speed]');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.speedFactor = parseInt(btn.dataset.speed, 10);
      state.isPaused = false;
      document.getElementById('btn-pause').classList.remove('active');
      playSound('click');
    });
  });

  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      state.isPaused = !state.isPaused;
      pauseBtn.classList.toggle('active', state.isPaused);
      playSound('click');
    });
  }

  // Thema knoppen
  const themeBtns = document.querySelectorAll('[data-theme]');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.theme = btn.dataset.theme;
      playSound('click');
    });
  });

  // Puls afvuren
  const triggerPulseBtn = document.getElementById('btn-trigger-pulse');
  if (triggerPulseBtn) {
    triggerPulseBtn.addEventListener('click', () => {
      // Trigger puls op Peter's Citadel
      renderer.triggerPulse(52.37, 4.90, 1.2);
      playSound('pulse');
    });
  }

  // Satelliet toevoegen
  const addSatBtn = document.getElementById('btn-add-sat');
  if (addSatBtn) {
    addSatBtn.addEventListener('click', () => {
      renderer.addSatellite();
    });
  }

  // Camera reset
  const resetCamBtn = document.getElementById('btn-reset-cam');
  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => {
      state.targetRotY = 0;
      state.targetRotX = 0.35;
      state.targetZoom = 1.0;
      playSound('click');
    });
  }

  // Audio Toggle
  const audioBtn = document.getElementById('btn-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      initAudio();
      state.audioEnabled = !state.audioEnabled;
      audioBtn.textContent = state.audioEnabled ? '🔊' : '🔇';
      audioBtn.style.color = state.audioEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)';
      if (state.audioEnabled) playSound('click');
    });
  }

  // Banner knoppen
  const applyUpdateBtn = document.getElementById('btn-apply-update');
  if (applyUpdateBtn) {
    applyUpdateBtn.addEventListener('click', () => {
      VersionManager.applyUpdate();
    });
  }

  const dismissUpdateBtn = document.getElementById('btn-dismiss-update');
  if (dismissUpdateBtn) {
    dismissUpdateBtn.addEventListener('click', () => {
      const banner = document.getElementById('update-banner');
      if (banner) banner.classList.remove('show');
    });
  }

  // Handmatige update check
  const checkUpdateBtn = document.getElementById('btn-check-update');
  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener('click', async () => {
      checkUpdateBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => { checkUpdateBtn.style.transform = ''; }, 600);
      await VersionManager.checkForUpdates(false);
      playSound('click');
    });
  }

  // Modal openen en sluiten
  const modal = document.getElementById('version-modal');
  const badgeVersion = document.getElementById('badge-version');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const modalCheckBtn = document.getElementById('btn-modal-check');
  const modalReloadBtn = document.getElementById('btn-modal-reload');
  const autoReloadCheck = document.getElementById('check-auto-reload');

  if (badgeVersion && modal) {
    badgeVersion.addEventListener('click', () => {
      modal.classList.add('active');
      playSound('click');
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (modalCheckBtn) {
    modalCheckBtn.addEventListener('click', async () => {
      modalCheckBtn.textContent = 'Bezig met zoeken...';
      await VersionManager.checkForUpdates(false);
      modalCheckBtn.textContent = 'Zoeken naar updates';
    });
  }

  if (modalReloadBtn) {
    modalReloadBtn.addEventListener('click', () => {
      VersionManager.applyUpdate();
    });
  }

  if (autoReloadCheck) {
    state.autoReloadEnabled = autoReloadCheck.checked;
    autoReloadCheck.addEventListener('change', (e) => {
      state.autoReloadEnabled = e.target.checked;
    });
  }
}

// ------------------------------------------------------------------------------
// 7. Hoofd Initialisatie
// ------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🌍 [PetersWorld] Initialiseren van de 3D WebAssembly applicatie...');

  const canvas = document.getElementById('world-canvas');
  const renderer = new WorldRenderer(canvas);

  setupUI(renderer);

  // 1. Initialiseer versie- en update-beheer
  await VersionManager.init();

  // 2. Laad de WebAssembly simulatiemodule
  await WasmBridge.load();

  // 3. Start de render- & simulatie-loop
  renderer.render();

  console.log('✨ [PetersWorld] Gereed voor interactie.');
});
