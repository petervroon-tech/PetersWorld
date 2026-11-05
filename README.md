# 🌍 PetersWorld

> **Cross-Platform WebAssembly (WASM) 3D Planet & Simulatie Engine**  
> Voorzien van automatische versie-detectie bij laden, GitHub Pages CI/CD deployment en automatische Git push hooks na elke commit.

![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM%201.0-654FF0?logo=webassembly&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform%20(Web%20%2B%20Native)-0284c7)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Automated-22c55e?logo=githubpages&logoColor=white)
![Git Hook](https://img.shields.io/badge/Git%20Hook-Auto--Push%20on%20Commit-facc15)

---

## 📋 Overzicht & Functionaliteiten

**PetersWorld** is een complete, cross-platform WebAssembly applicatie die een interactieve 3D planeet simuleert met realtime baansatellieten, landmarks (zoals *Peter's Citadel*), seismische energiepulsen en dag/nacht-verlichting.

### 🌟 Belangrijkste Eigenschappen:
1. **Cross-Platform WebAssembly Engine**:
   - Geheugengebaseerde WASM-binary (`petersworld.wasm`) geassembleerd via de stand-alone compiler `build.py`.
   - Volledige broncode meegeleverd in **C** (`src/petersworld.c`), **Rust** (`src/lib.rs`, `src/main.rs`, `Cargo.toml`) en **WAT** (`src/petersworld.wat`).
   - Draait native in alle moderne browsers (desktop, tablet, smartphone) én als stand-alone native CLI via standaard C/Rust compilers.

2. **Automatische Versieherkenning bij het Laden**:
   - Bij het openen of verversen van de applicatie controleert de browser direct op de achtergrond `version.json` via een cache-vrije aanroep (`cache: 'no-store'`).
   - Zodra er een nieuwere build of versie op GitHub Pages staat:
     - Verschijnt een duidelijke notificatiebanner: *"🚀 Nieuwe versie beschikbaar: vX.X.X (Build #X)"*.
     - Biedt de knop **"Nu bijwerken"** die caches flusht en de nieuwste WASM-versie inlaadt.
     - Kan naar wens automatisch op de achtergrond verversen via de instelling in het versiebeheer-venster.
   - Luistert tevens naar `visibilitychange` (wanneer u terugkeert naar het tabblad) en voert periodieke polling uit.

3. **Continuous Deployment naar GitHub Pages**:
   - Volledig geconfigureerde GitHub Actions workflow in `.github/workflows/deploy.yml`.
   - Zodra u commits pusht naar de `main` branch, bouwt GitHub Actions de WebAssembly binary, stempelt het buildnummer en commit-SHA af in `version.json`, en publiceert de site direct naar GitHub Pages.

4. **Automatische Push na Commit (Git Hooks)**:
   - Ingerichte Git hook in `.githooks/post-commit` (en `.git/hooks/post-commit`).
   - Zodra u `git commit` uitvoert, detecteert de hook de huidige branch en voert direct automatisch `git push origin <branch>` uit!

---

## 🚀 Snelstart & Lokaal Uitvoeren

### 1. Lokaal starten in de browser:
Er zijn geen externe afhankelijkheden vereist. Gebruik eenvoudig de ingebouwde Python server:
```bash
# Start de lokale ontwikkelserver
make serve
# Of direct via Python:
python3 -m http.server 8080
```
Open vervolgens in uw browser: **[http://localhost:8080](http://localhost:8080)**.

### 2. WebAssembly binary opnieuw bouwen:
```bash
python3 build.py
```
Dit compileert `petersworld.wasm`, valideert de opcodes via de native WebAssembly runtime en werkt `version.json` bij.

---

## 🔄 Automatische Git Push na Commit

De repository is geconfigureerd met een post-commit Git hook:
```bash
# Eenmalig activeren (reeds standaard ingesteld in deze repo):
./setup-hooks.sh
```

Wanneer u nu een wijziging maakt en commit:
```bash
git add .
git commit -m "Nieuwe landmark toegevoegd aan PetersWorld"
```
Ziet u direct de automatische actie:
```text
🚀 [PetersWorld Hook] Automatische push geactiveerd na commit!
📍 Huidige branch: main
🌐 Externe remote: https://github.com/petervroon-tech/PetersWorld.git
📦 Bezig met pushen naar origin/main...
✅ [PetersWorld Hook] Automatische push succesvol voltooid!
🌍 Uw wijzigingen staan online en worden automatisch uitgerold via GitHub Pages.
```

---

## 🌐 GitHub Pages Deployment Instellen

1. Zorg dat de repository op GitHub staat onder uw account:  
   `https://github.com/petervroon-tech/PetersWorld`
2. Ga in uw GitHub repository naar:  
   **Settings** ➔ **Pages**
3. Selecteer onder **Build and deployment** bij **Source**:  
   👉 **GitHub Actions**
4. Vanaf nu zal elke commit automatisch worden gepusht, gebouwd en binnen enkele seconden live staan op GitHub Pages!

---

## 🏗️ Projectstructuur

```text
PetersWorld/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD Pages deployment
├── .githooks/
│   └── post-commit           # Automatische push hook na elke git commit
├── src/
│   ├── lib.rs                # Cross-platform Rust WASM / native bibliotheek
│   ├── main.rs               # Rust native CLI simulatie runner
│   ├── petersworld.c         # C cross-platform implementatie
│   └── petersworld.wat       # WebAssembly Text specificatie
├── app.js                    # 3D Canvas engine, WASM bridge & auto-update detector
├── build.py                  # Standalone WebAssembly compiler & version builder
├── Cargo.toml                # Rust configuratiebestand
├── favicon.svg               # Futuristische planeet vector icon
├── index.html                # Responsive webinterface met HUD & controls
├── Makefile                  # Handige commando's (build, serve, test)
├── manifest.json             # Web App Manifest (PWA gereed)
├── petersworld.wasm          # Gecompileerde WebAssembly module
├── setup-hooks.sh            # Eenvoudig installatiescript voor git hooks
├── style.css                 # Cyberpunk glassmorphic styling
└── version.json              # Realtime build- en versie-telemetrie
```

---

## 🎮 Besturing in PetersWorld

- **Draaien**: Klik en sleep met de linkermuisknop of veeg op een touchscreen om de planeet in 3D rond te draaien.
- **Zoomen**: Gebruik het scrollwiel of pinch-to-zoom op mobiel.
- **Puls Afvuren**: Klik ergens op de planeet of klik op **"⚡ Puls Afvuren"** om seismische energiestromen door het oppervlak te sturen.
- **Satelliet Toevoegen**: Klik op **"🛰️ Satelliet +1"** om direct live een nieuwe satellietbaan toe te voegen in het WASM-geheugen.
- **Thema Wisselen**: Kies tussen *Hologram*, *Topografie* of *Matrix*.
- **Versie Inspecteren**: Klik op de versiebadge `v1.0.0` rechtsboven om de live status, commit-hash en changelog te openen.
