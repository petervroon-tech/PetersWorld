# Antigravity Project Richtlijnen & UI Voorkeuren - PetersWorld

Deze richtlijnen gelden voor alle huidige en toekomstige aanpassingen in PetersWorld.

## 1. UI & Design Standaard: "Smooth, Donker & Nooit Lomp of Wit Vierkant"
- **Dark Glassmorphism:** Gebruik donkere glas-esthetiek (`rgba(9, 14, 26, 0.88)` tot `0.94`, `backdrop-filter: blur(16px)`).
- **Afgeronde vormen:** Badges, app-kaarten en knoppen hebben altijd afgeronde pil-vormen of zachte hoeken.

## 2. Mobile & Tablet Conventies: Single-Focus Intent ("Keep It Simple & Sweet - KISS")
- **Mobile-friendly single-focus intent:** Structuur volgens mobiele/tablet conventies i.p.v. zware desktop-metaforen ("KISS").
- **Directe Feedback op Knoppen/Acties (Click/Tick):** Bevestig elke klik/tap direct (gelukt, fout, status).
- **Leesbaarheid & Makkelijke Scroll:** Knoppen en teksten geheel leesbaar zonder afkapping; vloeiend touch-scrollen (`-webkit-overflow-scrolling: touch`).
- **Datavalidatie & Bronvermelding:** Toon transparant de herkomst van externe links, app-statussen en gegevens.

## 3. Deployment & GitHub Online Standaard: Alleen Online via GitHub
- Niet lokaal testen, direct online via GitHub Pages en GitHub Actions CI/CD.
- Automatische live updates via `version.json`.
