# 📖 PetersWorld — Gebruikershandleiding & Werkende Functionaliteiten (v2.8.5)

Welkom bij **PetersWorld** (Realtime Vluchtradar Nederland & Schiphol Live ATC).  
In dit document zijn **uitsluitend de daadwerkelijk geteste en 100% werkende functies** van de applicatie opgenomen, inclusief bediening voor computer, iPad, iPhone en Android.

---

## ✈️ 1. Realtime Vluchtopsporing & Vliegtuigselectie

### Hoe selecteer je een vliegtuig?
* **Op de 3D-kaart (Desktop):** Klik met de muis direct op een vliegtuigicoon.
* **Op de 3D-kaart (iPad / iPhone / Android):** Tik met je vinger direct op het toestel. Dankzij de vergrote aanraaksfeer (hit-target) selecteert de app direct het dichtstbijzijnde toestel onder je vinger.
* **Via het Luchthavenbord (FIDS):** Klik of tik op een willekeurige rij in het overzicht **Vertrek & Aankomst** of **Alle Vluchten**.

### Wat gebeurt er bij selectie?
1. De camera beweegt vloeiend (*chase view*) naar het toestel toe op 30 meter afstand.
2. De **Vliegtuigkaart (Flightradar Card)** opent met:
   - **Roepnaam (Callsign)** en registratienummer (bijv. `KLM1234 (PH-BXO)`).
   - **Luchtvaartmaatschappij & Vliegtuigtype** (bijv. `KLM Royal Dutch Airlines · Boeing 737-800`).
   - **Herkomst & Bestemming** met landenvlaggen.
   - **Hoogte in meters & voeten** en **grondsnelheid in km/u & knopen**.
   - **Baan-indicatie**: Toont exact op welke baan het toestel stijgt of landt (bijv. `🛬 Polderbaan 18R (3800m)` of `🛫 Kaagbaan 24 (3500m)`).
3. De radio stemt direct af op de juiste toren- of naderingsfrequentie van dat toestel.

### Vliegtuigkleuren op de radar:
* 🟢 **Donkergroen (`#15803d`):** Dalende toestellen (Approach / Landing).
* 🟡 **Donkergeel (`#ca8a04`):** Stijgende toestellen (Departure / Takeoff).
* 🟣 **Donkerpaars (`#6b21a8`):** Overvliegende toestellen op kruishoogte (Overflight / En route).

---

## 📻 2. Live ATC Verkeersleiding & Radiocommunicatie

In het venster **ATC Gesprekken & Radio** zijn twee audiomodi beschikbaar:

### Modus 1: `🎯 Alleen dit vliegtuig` (Standaard bij selectie)
* **Werking:** Zodra u een individueel vliegtuig aanklikt, wordt de algemene frequentie-stream **direct gedempt**.
* **Wat hoort u?** Uitsluitend de 1-op-1 communicatie tussen de verkeerstoren en de cockpit van dát specifieke toestel. Er komen **geen** gesprekken van andere vliegtuigen tussendoor.
* **Inhoud:** Reële klaringen aangepast aan de vluchtfase (landing, start of kruisvlucht), baan, wind en hoogte:
  - Torenklaring: *"KLM 1234, Schiphol Tower, runway 24, wind 230 at 12 knots, cleared to land."*
  - Cockpit-readback van de piloot: *"Cleared to land runway 24, KLM 1234."*
* **Indicatoren:** De zend-LED toont `TX-TWR` (toren zendt), `TX-PLT` (piloot zendt) en `RX` (ontvangst).

### Modus 2: `📻 Alles uitluisteren`
* **Werking:** Schakelt over naar de **ongefilterde live scanner-feed** via LiveATC (Icecast stream).
* **Wat hoort u?** Alle vliegtuigen en de verkeersleider die tegelijk actief zijn op de gekozen frequentie (bijv. Schiphol Toren 1 118.100 MHz, Polderbaan Toren 118.275 MHz, Nadering, Vertrek of Delivery).
* **Kanalenkeuze:** U kunt via het dropdown-menu handmatig schakelen tussen o.a.:
  - *Schiphol Toren 1 (118.100 MHz - Kaagbaan/Aalsmeerbaan)*
  - *Schiphol Toren 2 (118.275 MHz - Polderbaan)*
  - *Schiphol Toren 3 (119.900 MHz - Zwanenburgerbaan)*
  - *Schiphol Approach N/O/Z/W (119.050 / 121.200 / 118.075 / 131.150 MHz)*
  - *Schiphol Final Director (124.875 MHz - ILS Oplijning)*
  - *Schiphol Delivery (121.980 MHz - Vluchtklaringen)*
  - *Rotterdam The Hague, Eindhoven, Maastricht Aachen, Eelde, Lelystad, Teuge, Texel*.

---

## 🎙️ 3. Gesprekken Opnemen in WAV-formaat (.wav)

De app bevat een ingebouwde audio-opnamefunctie voor radiocommunicatie:

1. **Opname starten:** Klik of tik op de rode knop `🎙️ START OPNAME (WAV)`.
2. **Timer:** Een timerbalk toont de actieve opnameduur.
3. **Opname stoppen:** Klik op `⏹️ STOP & DOWNLOAD WAV`.
4. **Opslag:** Het audiobestand wordt automatisch en direct als zuivere, ongecomprimeerde `.wav` gedownload naar uw computer of telefoon:
   - Bestandsnaamvoorbeeld: `PetersWorld_ATC_EHAM_KLM1234_20261114_130000.wav`.
   - Zowel de 1-op-1 communicatie als de live scanner stream kunnen worden opgenomen.

---

## 📷 4. Camera & Zoommodi

Onderin het scherm (of via de sneltoetsen) kunt u schakelen tussen 5 camerastanden:

1. **`🔍 30m Grond` (Sneltoets `1`):**  
   Plaatst de camera op exact 30 meter boven de grond of de baandrempel met uitzicht over de landingsbaan.
2. **`🛬 300m Baan` (Sneltoets `2`):**  
   Overzichtscamera op 300 meter boven de actieve baan van de gekozen luchthaven.
3. **`🛩️ Cockpit` (Sneltoets `C`):**  
   Plaatst u direct in de cockpit van het geselecteerde vliegtuig en kijkt recht vooruit in de vliegrichting.
4. **`✈️ Volg Vliegtuig (30m)` (Sneltoets `F`):**  
   Volgt het vliegtuig soepel van achteren (30m afstand, 15m hoogte). Vrij rondkijken met de muis of vinger blijft mogelijk.
5. **`🛰️ Satelliet NL` (Sneltoets `3`):**  
   Zoomt uit naar een compleet satellietoverzicht van Nederland en het omliggende luchtruim.

---

## 🛰️ 5. Satellietbeelden & Schiphol

* **PDOK & Esri Luchtfoto's:** De ondergrond toont actuele, fotorealistische 25cm luchtfoto's van Nederland. Polders, waterwegen, steden en startbanen zijn haarscherp zichtbaar tot op 30 meter hoogte.
* **Schiphol in 3D:**
  - Alle 6 start- en landingsbanen liggen op hun exacte geografische positie met witte drempelmarkeringen en centerlines.
  - Terminals, pieren (B t/m H/M) en Schiphol Plaza zijn voorzien van glazen vliesgevels, bitumen daken met HVAC-installaties en telescopische slurven (jet bridges).
  - De 101 meter hoge verkeerstoren is uitgevoerd in architectonisch beton.
  - **0% Geel:** Alle gele testmarkeringen en ringen zijn verwijderd. Bij het inzoomen verdwijnen ook de luchthavenmarkers automatisch zodat het satellietbeeld volledig vrij zichtbaar is.

---

## 📐 6. Scherm & Vensterbeheer (Desktop & Laptop)

Alle infopanelen (**Radar HUD**, **Luchthaven Bord** en **ATC Gesprekken**) zijn flexibel aanpasbaar:

* **Vrij verplaatsen (Drag & Drop):**  
  Pak een venster vast aan de bovenste titelbalk óf aan de onderste sleepbalk en sleep het naar elke gewenste plek op het scherm.
* **Formaat wijzigen (8-kanten resize):**  
  Sleep aan de randen of hoeken van een venster om het breder, smaller, hoger of lager te maken.
* **Minimaliseren & Sluiten:**  
  Klik op `_` (minimaliseren) of `✕` (sluiten) in de titelbalk. Er verschijnt onderin een zwevende herstelknop om het venster direct weer terug te halen.
* **`📐 Scherm Ordenen` (Sneltoets `X`):**  
  Eén klik op deze knop in de menubalk zet alle geopende en verplaatste vensters direct netjes, geordend en zonder overlap terug op hun standaardposities.

---

## 📱 7. Bediening op iPad, iPhone en Android

Op mobiele apparaten past de interface zich automatisch aan:

* **Vingertik-selectie:** Tik direct op een vliegtuig om het te volgen en de radio te openen.
* **Onderste Navigatiebalk:**
  - `🗺️ Kaart`: Sluit geopende panelen en toont het volledige 3D-radarbeeld.
  - `📋 Vluchten`: Opent het Luchthavenbord onderin het scherm als compacte bottom-sheet.
  - `📻 Gesprekken`: Opent de ATC-radioconsole met 1-op-1 torencommunicatie en transcript.
  - `📷 Camera`: Opent snelknoppen voor 30m Grond, Cockpit en Baanzicht.
* **Touch-bewegingen:**
  - 1 vinger slepen: Kaart roteren / rondkijken.
  - 2 vingers knijpen/spreiden (pinch-to-zoom): In- en uitzoomen.
  - 2 vingers slepen: Kaart verschuiven (pan).

---

## ⌨️ 8. Sneltoetsen Overzicht (Toetsenbord)

| Toets | Actie |
| :--- | :--- |
| `1` | Zoom naar 30 meter boven de grond / baan |
| `2` | Zoom naar 300 meter boven de luchthaven |
| `3` | Volledig satellietoverzicht van Nederland |
| `C` | Cockpit weergave van het geselecteerde toestel |
| `F` | Volg geselecteerd vliegtuig (30m chase) |
| `R` | Open / sluit ATC Gesprekken & Radio venster |
| `B` | Open / sluit Luchthavenbord (vluchtenlijst) |
| `X` | Scherm Ordenen (reset alle vensterposities) |
| `L` | Wissel tussen Dagzicht en Realistisch Nachtzicht |
| `M` | Audio dempen / inschakelen (Mute) |
| `ESC` | Deselecteer vliegtuig en sluit vliegtuigkaart |

---

## 🔄 9. Updates & Versiebeheer

* **Automatische detectie:** Bij het openen controleert de applicatie direct `version.json` op de server.
* **Nieuwe update:** Zodra er een nieuwe versie is, toont de oranje banner bovenaan:  
  *🚀 vX.X.X beschikbaar • Klik op "Nu bijwerken"*.
* **Handmatig forceren:** Klik op het **🔄** verversicoon rechtsboven om direct de cache te wissen en de nieuwste WebAssembly engine te laden.

---
*Versie: **v2.8.5** • Live URL: **[https://petervroon-tech.github.io/PetersWorld/](https://petervroon-tech.github.io/PetersWorld/)***
