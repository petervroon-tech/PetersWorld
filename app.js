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
  flightCount: 120,
  globeRadius: 100, // 1 Three.js eenheid = ~63.71 km (300m = ~0.00471 eenheden)
  metersPerUnit: 63710,
};

// ═══════════════════════════════════════════════════════
//  LUCHTHAVENS DATABASE (35 INTERNATIONALE HUBS)
// ═══════════════════════════════════════════════════════
const AIRPORTS = [
  // Europa (Koppeling met Live Schiphol Grond / West-Europa Radar feeds)
  { code:'AMS', flag:'🇳🇱', name:'Amsterdam Schiphol', city:'Amsterdam', country:'Nederland', lat: 52.31, lon: 4.76, hub:true,
    runways:['Kaagbaan 24', 'Polderbaan 36L', 'Zwanenburgerbaan 18C', 'Aalsmeerbaan 18L', 'Buitenveldertbaan 09'], activeRunway:'Kaagbaan 24',
    rwyNumbers:['24','06','18R','36L'], liveAtcStation:'eham_twr_rec',
    freqs:{ twr:'118.100', gnd:'121.700', app:'119.050' }, utcOffset:1, weather:{ cond:'cavok', wind:'220° 12kt', qnh:'1014' } },
  { code:'LHR', flag:'🇬🇧', name:'London Heathrow', city:'Londen', country:'Verenigd Koninkrijk', lat: 51.47, lon: -0.46, hub:true,
    runways:['Runway 27L', 'Runway 27R', 'Runway 09L', 'Runway 09R'], activeRunway:'Runway 27L',
    rwyNumbers:['27L','09R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.500', gnd:'121.900', app:'120.400' }, utcOffset:0, weather:{ cond:'rain', wind:'250° 16kt', qnh:'1011' } },
  { code:'CDG', flag:'🇫🇷', name:'Paris Charles de Gaulle', city:'Parijs', country:'Frankrijk', lat: 49.01, lon: 2.55, hub:true,
    runways:['Runway 26L', 'Runway 26R', 'Runway 08L', 'Runway 08R'], activeRunway:'Runway 26L',
    rwyNumbers:['26L','08R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.650', gnd:'121.800', app:'121.150' }, utcOffset:1, weather:{ cond:'cavok', wind:'190° 09kt', qnh:'1016' } },
  { code:'FRA', flag:'🇩🇪', name:'Frankfurt am Main', city:'Frankfurt', country:'Duitsland', lat: 50.03, lon: 8.57, hub:true,
    runways:['Runway 25C', 'Runway 25L', 'Runway 18', 'Runway 07R'], activeRunway:'Runway 25C',
    rwyNumbers:['25C','07C'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'119.900', gnd:'121.950', app:'120.150' }, utcOffset:1, weather:{ cond:'cavok', wind:'240° 11kt', qnh:'1015' } },
  { code:'MAD', flag:'🇪🇸', name:'Madrid Barajas', city:'Madrid', country:'Spanje', lat: 40.47, lon: -3.57, hub:false,
    runways:['Runway 32L', 'Runway 32R', 'Runway 14L', 'Runway 14R'], activeRunway:'Runway 32L',
    rwyNumbers:['32L','14R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.150', gnd:'121.700', app:'118.400' }, utcOffset:1, weather:{ cond:'cavok', wind:'160° 06kt', qnh:'1019' } },
  { code:'FCO', flag:'🇮🇹', name:'Rome Fiumicino', city:'Rome', country:'Italië', lat: 41.80, lon: 12.25, hub:false,
    runways:['Runway 16L', 'Runway 16R', 'Runway 25'], activeRunway:'Runway 16L',
    rwyNumbers:['16L','34R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.700', gnd:'121.900', app:'125.500' }, utcOffset:1, weather:{ cond:'cavok', wind:'140° 08kt', qnh:'1017' } },
  { code:'ARN', flag:'🇸🇪', name:'Stockholm Arlanda', city:'Stockholm', country:'Zweden', lat: 59.65, lon: 17.93, hub:false,
    runways:['Runway 01L', 'Runway 01R', 'Runway 19L', 'Runway 26'], activeRunway:'Runway 01L',
    rwyNumbers:['01L','19R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.500', gnd:'121.600', app:'123.750' }, utcOffset:1, weather:{ cond:'rain', wind:'340° 14kt', qnh:'1008' } },
  { code:'ZRH', flag:'🇨🇭', name:'Zürich Kloten', city:'Zürich', country:'Zwitserland', lat: 47.46, lon: 8.55, hub:false,
    runways:['Runway 14', 'Runway 16', 'Runway 28'], activeRunway:'Runway 14',
    rwyNumbers:['14','32'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.100', gnd:'121.900', app:'118.000' }, utcOffset:1, weather:{ cond:'cavok', wind:'110° 04kt', qnh:'1020' } },
  { code:'BRU', flag:'🇧🇪', name:'Brussels Airport', city:'Brussel', country:'België', lat: 50.90, lon: 4.48, hub:false,
    runways:['Runway 25L', 'Runway 25R', 'Runway 01'], activeRunway:'Runway 25L',
    rwyNumbers:['25L','07R'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'118.600', gnd:'121.875', app:'118.250' }, utcOffset:1, weather:{ cond:'cavok', wind:'210° 10kt', qnh:'1014' } },
  { code:'VIE', flag:'🇦🇹', name:'Vienna International', city:'Wenen', country:'Oostenrijk', lat: 48.11, lon: 16.57, hub:false,
    runways:['Runway 16', 'Runway 29', 'Runway 11'], activeRunway:'Runway 16',
    rwyNumbers:['16','34'], liveAtcStation:'eham_gnd',
    freqs:{ twr:'119.400', gnd:'121.600', app:'118.775' }, utcOffset:1, weather:{ cond:'cavok', wind:'130° 07kt', qnh:'1018' } },

  // Noord-Amerika (Met directe LiveATC Icecast streams)
  { code:'JFK', flag:'🇺🇸', name:'New York JFK', city:'New York', country:'Verenigde Staten', lat: 40.64, lon: -73.78, hub:true,
    runways:['Runway 31L', 'Runway 31R', 'Runway 22L', 'Runway 22R', 'Runway 04L'], activeRunway:'Runway 31L',
    rwyNumbers:['31L','13R'], liveAtcStation:'kjfk_twr',
    freqs:{ twr:'119.100', gnd:'121.900', app:'125.750' }, utcOffset:-5, weather:{ cond:'cavok', wind:'300° 15kt', qnh:'1013' } },
  { code:'LAX', flag:'🇺🇸', name:'Los Angeles International', city:'Los Angeles', country:'Verenigde Staten', lat: 33.94, lon:-118.40, hub:true,
    runways:['Runway 24L', 'Runway 24R', 'Runway 25L', 'Runway 25R'], activeRunway:'Runway 25L',
    rwyNumbers:['25L','07R'], liveAtcStation:'klax_twr',
    freqs:{ twr:'120.950', gnd:'121.650', app:'124.900' }, utcOffset:-8, weather:{ cond:'cavok', wind:'260° 08kt', qnh:'1016' } },
  { code:'ORD', flag:'🇺🇸', name:"Chicago O'Hare", city:'Chicago', country:'Verenigde Staten', lat: 41.98, lon: -87.90, hub:true,
    runways:['Runway 27L', 'Runway 28C', 'Runway 10L', 'Runway 09R'], activeRunway:'Runway 28C',
    rwyNumbers:['28C','10C'], liveAtcStation:'kord_twr',
    freqs:{ twr:'120.750', gnd:'121.900', app:'128.450' }, utcOffset:-6, weather:{ cond:'rain', wind:'310° 18kt', qnh:'1009' } },
  { code:'ATL', flag:'🇺🇸', name:'Atlanta Hartsfield', city:'Atlanta', country:'Verenigde Staten', lat: 33.64, lon: -84.43, hub:false,
    runways:['Runway 26L', 'Runway 27R', 'Runway 08L', 'Runway 09R'], activeRunway:'Runway 26L',
    rwyNumbers:['26L','08R'], liveAtcStation:'katl_twr',
    freqs:{ twr:'119.500', gnd:'121.900', app:'127.900' }, utcOffset:-5, weather:{ cond:'cavok', wind:'200° 07kt', qnh:'1018' } },
  { code:'DFW', flag:'🇺🇸', name:'Dallas Fort Worth', city:'Dallas', country:'Verenigde Staten', lat: 32.90, lon: -97.04, hub:false,
    runways:['Runway 17R', 'Runway 18L', 'Runway 35L', 'Runway 36R'], activeRunway:'Runway 17R',
    rwyNumbers:['17R','35L'], liveAtcStation:'kdfw_twr',
    freqs:{ twr:'126.550', gnd:'121.650', app:'124.300' }, utcOffset:-6, weather:{ cond:'cavok', wind:'180° 12kt', qnh:'1014' } },
  { code:'YYZ', flag:'🇨🇦', name:'Toronto Pearson', city:'Toronto', country:'Canada', lat: 43.68, lon: -79.63, hub:false,
    runways:['Runway 23', 'Runway 24L', 'Runway 05', 'Runway 06R'], activeRunway:'Runway 23',
    rwyNumbers:['23','05'], liveAtcStation:'cyyz_twr',
    freqs:{ twr:'118.700', gnd:'121.900', app:'128.800' }, utcOffset:-5, weather:{ cond:'cavok', wind:'250° 11kt', qnh:'1015' } },
  { code:'MIA', flag:'🇺🇸', name:'Miami International', city:'Miami', country:'Verenigde Staten', lat: 25.80, lon: -80.28, hub:false,
    runways:['Runway 08R', 'Runway 09', 'Runway 26L', 'Runway 27'], activeRunway:'Runway 08R',
    rwyNumbers:['08R','26L'], liveAtcStation:'kmia_twr',
    freqs:{ twr:'118.300', gnd:'121.800', app:'124.850' }, utcOffset:-5, weather:{ cond:'storm', wind:'110° 22kt', qnh:'1010' } },
  { code:'SFO', flag:'🇺🇸', name:'San Francisco International', city:'San Francisco', country:'Verenigde Staten', lat: 37.62, lon:-122.38, hub:false,
    runways:['Runway 28L', 'Runway 28R', 'Runway 01L', 'Runway 01R'], activeRunway:'Runway 28L',
    rwyNumbers:['28L','10R'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'120.500', gnd:'121.800', app:'135.650' }, utcOffset:-8, weather:{ cond:'fog', wind:'280° 13kt', qnh:'1017' } },

  // Azië & Midden-Oosten
  { code:'DXB', flag:'🇦🇪', name:'Dubai International', city:'Dubai', country:'Verenigde Arabische Emiraten', lat: 25.25, lon: 55.36, hub:true,
    runways:['Runway 30L', 'Runway 30R', 'Runway 12L', 'Runway 12R'], activeRunway:'Runway 30L',
    rwyNumbers:['30L','12R'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.750', gnd:'118.350', app:'124.900' }, utcOffset:4, weather:{ cond:'cavok', wind:'320° 09kt', qnh:'1013' } },
  { code:'HND', flag:'🇯🇵', name:'Tokyo Haneda', city:'Tokio', country:'Japan', lat: 35.55, lon: 139.78, hub:true,
    runways:['Runway 34R', 'Runway 34L', 'Runway 16R', 'Runway 05'], activeRunway:'Runway 34R',
    rwyNumbers:['34R','16L'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.100', gnd:'121.700', app:'119.100' }, utcOffset:9, weather:{ cond:'cavok', wind:'010° 12kt', qnh:'1021' } },
  { code:'PEK', flag:'🇨🇳', name:'Beijing Capital', city:'Peking', country:'China', lat: 40.08, lon: 116.58, hub:true,
    runways:['Runway 36R', 'Runway 36L', 'Runway 01', 'Runway 18L'], activeRunway:'Runway 36R',
    rwyNumbers:['36R','18L'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.500', gnd:'121.800', app:'119.700' }, utcOffset:8, weather:{ cond:'cavok', wind:'030° 08kt', qnh:'1024' } },
  { code:'SIN', flag:'🇸🇬', name:'Singapore Changi', city:'Singapore', country:'Singapore', lat: 1.36, lon: 103.99, hub:true,
    runways:['Runway 02L', 'Runway 02C', 'Runway 20R', 'Runway 20C'], activeRunway:'Runway 02L',
    rwyNumbers:['02L','20R'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.600', gnd:'121.725', app:'120.300' }, utcOffset:8, weather:{ cond:'rain', wind:'060° 10kt', qnh:'1009' } },
  { code:'HKG', flag:'🇭🇰', name:'Hong Kong International', city:'Hongkong', country:'Hongkong', lat: 22.31, lon: 113.91, hub:false,
    runways:['Runway 07L', 'Runway 07R', 'Runway 25L', 'Runway 25R'], activeRunway:'Runway 07L',
    rwyNumbers:['07L','25R'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.700', gnd:'121.600', app:'119.100' }, utcOffset:8, weather:{ cond:'cavok', wind:'080° 14kt', qnh:'1017' } },
  { code:'BOM', flag:'🇮🇳', name:'Mumbai Chhatrapati Shivaji', city:'Mumbai', country:'India', lat: 19.09, lon: 72.87, hub:false,
    runways:['Runway 27', 'Runway 09', 'Runway 14', 'Runway 32'], activeRunway:'Runway 27',
    rwyNumbers:['27','09'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.100', gnd:'121.900', app:'127.900' }, utcOffset:5.5, weather:{ cond:'cavok', wind:'270° 09kt', qnh:'1012' } },
  { code:'ICN', flag:'🇰🇷', name:'Seoul Incheon', city:'Seoel', country:'Zuid-Korea', lat: 37.46, lon: 126.44, hub:false,
    runways:['Runway 33L', 'Runway 33R', 'Runway 34', 'Runway 15R'], activeRunway:'Runway 33L',
    rwyNumbers:['33L','15R'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.200', gnd:'121.650', app:'119.200' }, utcOffset:9, weather:{ cond:'cavok', wind:'310° 10kt', qnh:'1022' } },
  { code:'BKK', flag:'🇹🇭', name:'Bangkok Suvarnabhumi', city:'Bangkok', country:'Thailand', lat: 13.69, lon: 100.75, hub:false,
    runways:['Runway 19L', 'Runway 19R', 'Runway 01L', 'Runway 01R'], activeRunway:'Runway 19L',
    rwyNumbers:['19L','01R'], liveAtcStation:'ksfo_twr',
    freqs:{ twr:'118.100', gnd:'121.750', app:'125.200' }, utcOffset:7, weather:{ cond:'cavok', wind:'170° 06kt', qnh:'1011' } },
  { code:'DOH', flag:'🇶🇦', name:'Doha Hamad', city:'Doha', country:'Qatar', lat: 25.27, lon: 51.61, hub:false,
    runways:['Runway 34L', 'Runway 34R', 'Runway 16L', 'Runway 16R'], activeRunway:'Runway 34L',
    rwyNumbers:['34L','16R'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.900', gnd:'121.850', app:'121.100' }, utcOffset:3, weather:{ cond:'cavok', wind:'330° 11kt', qnh:'1015' } },

  // Oceanië, Afrika, Zuid-Amerika
  { code:'SYD', flag:'🇦🇺', name:'Sydney Kingsford Smith', city:'Sydney', country:'Australië', lat:-33.95, lon: 151.18, hub:true,
    runways:['Runway 34L', 'Runway 34R', 'Runway 16R', 'Runway 07'], activeRunway:'Runway 34L',
    rwyNumbers:['34L','16R'], liveAtcStation:'yssy_twr',
    freqs:{ twr:'120.500', gnd:'121.700', app:'124.400' }, utcOffset:11, weather:{ cond:'cavok', wind:'060° 13kt', qnh:'1020' } },
  { code:'MEL', flag:'🇦🇺', name:'Melbourne Tullamarine', city:'Melbourne', country:'Australië', lat:-37.67, lon: 144.84, hub:false,
    runways:['Runway 16', 'Runway 27', 'Runway 34'], activeRunway:'Runway 16',
    rwyNumbers:['16','34'], liveAtcStation:'ymml_twr',
    freqs:{ twr:'120.500', gnd:'121.700', app:'132.000' }, utcOffset:11, weather:{ cond:'rain', wind:'190° 18kt', qnh:'1010' } },
  { code:'JNB', flag:'🇿🇦', name:'Johannesburg OR Tambo', city:'Johannesburg', country:'Zuid-Afrika', lat:-26.14, lon: 28.24, hub:false,
    runways:['Runway 03L', 'Runway 03R', 'Runway 21L', 'Runway 21R'], activeRunway:'Runway 03L',
    rwyNumbers:['03L','21R'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.100', gnd:'121.900', app:'124.500' }, utcOffset:2, weather:{ cond:'cavok', wind:'020° 08kt', qnh:'1022' } },
  { code:'NBO', flag:'🇰🇪', name:'Nairobi Jomo Kenyatta', city:'Nairobi', country:'Kenia', lat: -1.32, lon: 36.93, hub:false,
    runways:['Runway 06', 'Runway 24'], activeRunway:'Runway 06',
    rwyNumbers:['06','24'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.700', gnd:'121.900', app:'120.100' }, utcOffset:3, weather:{ cond:'cavok', wind:'050° 10kt', qnh:'1017' } },
  { code:'CAI', flag:'🇪🇬', name:'Cairo International', city:'Caïro', country:'Egypte', lat: 30.12, lon: 31.41, hub:false,
    runways:['Runway 05C', 'Runway 05L', 'Runway 23R'], activeRunway:'Runway 05C',
    rwyNumbers:['05C','23L'], liveAtcStation:'katl_twr',
    freqs:{ twr:'118.150', gnd:'121.900', app:'119.050' }, utcOffset:2, weather:{ cond:'cavok', wind:'340° 10kt', qnh:'1016' } },
  { code:'GRU', flag:'🇧🇷', name:'São Paulo Guarulhos', city:'São Paulo', country:'Brazilië', lat:-23.43, lon: -46.47, hub:false,
    runways:['Runway 09R', 'Runway 09L', 'Runway 27L'], activeRunway:'Runway 09R',
    rwyNumbers:['09R','27L'], liveAtcStation:'kmia_twr',
    freqs:{ twr:'118.000', gnd:'121.700', app:'119.350' }, utcOffset:-3, weather:{ cond:'cavok', wind:'120° 07kt', qnh:'1018' } },
  { code:'BOG', flag:'🇨🇴', name:'Bogotá El Dorado', city:'Bogotá', country:'Colombia', lat: 4.70, lon: -74.14, hub:false,
    runways:['Runway 13L', 'Runway 13R', 'Runway 31L'], activeRunway:'Runway 13L',
    rwyNumbers:['13L','31R'], liveAtcStation:'kmia_twr',
    freqs:{ twr:'118.100', gnd:'121.800', app:'119.500' }, utcOffset:-5, weather:{ cond:'rain', wind:'110° 09kt', qnh:'1025' } },
  { code:'LIM', flag:'🇵🇪', name:'Lima Jorge Chávez', city:'Lima', country:'Peru', lat:-12.02, lon: -77.11, hub:false,
    runways:['Runway 16', 'Runway 34'], activeRunway:'Runway 16',
    rwyNumbers:['16','34'], liveAtcStation:'kmia_twr',
    freqs:{ twr:'118.100', gnd:'121.900', app:'119.700' }, utcOffset:-5, weather:{ cond:'fog', wind:'200° 08kt', qnh:'1014' } },
  { code:'MEX', flag:'🇲🇽', name:'Mexico City Benito Juárez', city:'Mexico-Stad', country:'Mexico', lat: 19.43, lon: -99.07, hub:false,
    runways:['Runway 05L', 'Runway 05R', 'Runway 23L'], activeRunway:'Runway 05L',
    rwyNumbers:['05L','23R'], liveAtcStation:'kmia_twr',
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
//  LIVE ATC ENGINE (ECHTE RADIO STREAMS NET ZOALS DE LIVEATC APP)
// ═══════════════════════════════════════════════════════
class LiveAtcEngine {
  constructor() {
    this.audioEl = null;
    this.isPlaying = false;
    this.currentStation = 'eham_twr_rec';
    this.audioCtx = null;
    this.analyser = null;
    this.animVizId = null;
    this.streams = {
      eham_twr_rec: 'audio/eham_twr.mp3',
      eham_gnd: 'https://s1-bos.liveatc.net/eham_gnd_18c36c',
      eham_del: 'https://s1-bos.liveatc.net/eham_del',
      eham_atis_live: 'https://s1-bos.liveatc.net/eham_atis_arr',
      eham_atis_rec: 'audio/eham_atis.mp3',
      kjfk_twr: 'https://s1-bos.liveatc.net/kjfk_twr',
      klax_twr: 'https://s1-bos.liveatc.net/klax_twr',
      kord_twr: 'https://s1-bos.liveatc.net/kord_twr',
      katl_twr: 'https://s1-bos.liveatc.net/katl_twr',
      ksfo_twr: 'https://s1-bos.liveatc.net/ksfo_twr',
      kmia_twr: 'https://s1-bos.liveatc.net/kmia_twr',
      kdfw_twr: 'https://s1-bos.liveatc.net/kdfw_twr',
      cyyz_twr: 'https://s1-bos.liveatc.net/cyyz_twr',
      kewr_twr: 'https://s1-bos.liveatc.net/kewr_twr',
      kbos_twr: 'https://s1-bos.liveatc.net/kbos_twr',
      yssy_twr: 'https://s1-bos.liveatc.net/yssy_twr',
      ymml_twr: 'https://s1-bos.liveatc.net/ymml_twr',
    };
    this.stationLabels = {
      eham_twr_rec: '🇳🇱 Schiphol Toren (Directe Communicatie - Echte Stemmen)',
      eham_gnd: '🇳🇱 Schiphol Grond (121.905 MHz Live)',
      eham_del: '🇳🇱 Schiphol Delivery (121.980 MHz Live)',
      eham_atis_live: '🇳🇱 Schiphol ATIS Live (132.980 MHz)',
      eham_atis_rec: '🇳🇱 Schiphol ATIS (Volledig Weerbericht)',
      kjfk_twr: '🇺🇸 New York JFK Toren (119.100 MHz Live)',
      klax_twr: '🇺🇸 Los Angeles Toren (120.950 MHz Live)',
      kord_twr: "🇺🇸 Chicago O'Hare Toren (120.750 MHz Live)",
      katl_twr: '🇺🇸 Atlanta Toren (119.500 MHz Live)',
      ksfo_twr: '🇺🇸 San Francisco Toren (120.500 MHz Live)',
      kmia_twr: '🇺🇸 Miami Toren (118.300 MHz Live)',
      kdfw_twr: '🇺🇸 Dallas Fort Worth Toren (126.550 MHz Live)',
      cyyz_twr: '🇨🇦 Toronto Pearson Toren (118.700 MHz Live)',
      kewr_twr: '🇺🇸 Newark Liberty Toren (118.300 MHz Live)',
      kbos_twr: '🇺🇸 Boston Logan Toren (119.100 MHz Live)',
      yssy_twr: '🇦🇺 Sydney Kingsford Toren (120.500 MHz Live)',
      ymml_twr: '🇦🇺 Melbourne Toren (120.500 MHz Live)',
    };
  }

  init() {
    this.audioEl = document.getElementById('liveatc-audio-element');
    const select = document.getElementById('liveatc-station-select');
    const btnPlay = document.getElementById('btn-liveatc-toggle');
    const pill = document.getElementById('pill-liveatc');

    if (select) {
      select.value = this.currentStation;
      select.addEventListener('change', (e) => {
        this.currentStation = e.target.value;
        if (this.isPlaying) this.playStream();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', () => this.togglePlay());
    }

    if (pill) {
      pill.addEventListener('click', () => this.togglePlay());
    }

    if (this.audioEl) {
      this.audioEl.addEventListener('error', (e) => {
        console.warn('LiveATC audio error, switching to authentic Schiphol radio recording fallback:', e);
        if (this.isPlaying && this.currentStation !== 'eham_twr_rec') {
          this.fallbackToRealAudio();
        }
      });
      this.audioEl.addEventListener('ended', () => {
        if (this.isPlaying && (this.currentStation === 'eham_twr_rec' || this.currentStation === 'eham_atis_rec')) {
          setTimeout(() => {
            if (this.isPlaying && this.audioEl && (this.currentStation === 'eham_twr_rec' || this.currentStation === 'eham_atis_rec')) {
              this.audioEl.currentTime = 0;
              this.audioEl.play().catch(() => {});
            }
          }, 2000);
        }
      });
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
        // Teken dynamische live VHF radio signaalgolf
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

        // RF S-Meter indicatie
        const smeter = document.getElementById('liveatc-smeter');
        if (smeter && Math.random() > 0.8) {
          const sVals = ['S8 +5dB', 'S9 +10dB', 'S9 +20dB', 'S9 +15dB'];
          smeter.textContent = `S-METER: ${sVals[Math.floor(Math.random() * sVals.length)]}`;
        }
      } else {
        // Vlakke ruislijn bij standby
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

  fallbackToRealAudio() {
    if (!this.audioEl) return;
    const select = document.getElementById('liveatc-station-select');
    const statusTxt = document.getElementById('liveatc-status-txt');
    const hudStatus = document.getElementById('hud-liveatc-status');
    const btn = document.getElementById('btn-liveatc-toggle');
    const dot = document.getElementById('liveatc-dot');
    const pill = document.getElementById('pill-liveatc');

    this.currentStation = 'eham_twr_rec';
    if (select) select.value = 'eham_twr_rec';

    this.audioEl.src = 'audio/eham_twr.mp3';
    this.audioEl.load();
    const p = this.audioEl.play();
    if (p && p.then) {
      p.then(() => {
        this.isPlaying = true;
        if (btn) { btn.classList.add('playing'); btn.textContent = '⏸ PAUZE'; }
        if (dot) dot.className = 'dot green';
        if (pill) pill.classList.add('active');
        if (statusTxt) statusTxt.textContent = '🔴 Schiphol Toren (Directe Communicatie - Echte Stemmen) actief';
        if (hudStatus) hudStatus.textContent = 'EHAM TWR';
        ATC.playMicClick(true);
        ATC.logMessage('LIVE ATC', 'Directe toren-piloot communicatie gestart met echte stemmen!', true);
      }).catch((err) => {
        console.warn('Fallback play failed:', err);
      });
    }
  }

  playStream() {
    this.ensureAudioCtx();
    const btn = document.getElementById('btn-liveatc-toggle');
    const statusTxt = document.getElementById('liveatc-status-txt');
    const dot = document.getElementById('liveatc-dot');
    const pill = document.getElementById('pill-liveatc');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (!this.audioEl) return;

    const label = this.stationLabels[this.currentStation] || this.currentStation;
    if (statusTxt) statusTxt.textContent = `⏳ Verbinden met ${label}...`;

    if (this.currentStation === 'eham_twr_rec') {
      this.audioEl.src = 'audio/eham_twr.mp3';
    } else if (this.currentStation === 'eham_atis_rec') {
      this.audioEl.src = 'audio/eham_atis.mp3';
    } else {
      const url = this.streams[this.currentStation];
      if (!url) {
        this.fallbackToRealAudio();
        return;
      }
      this.audioEl.src = `${url}?nocache=${Date.now()}`;
    }

    this.audioEl.load();

    const p = this.audioEl.play();
    if (p && p.then) {
      p.then(() => {
        this.isPlaying = true;
        if (btn) { btn.classList.add('playing'); btn.textContent = '⏸ PAUZE'; }
        if (dot) dot.className = 'dot green';
        if (pill) pill.classList.add('active');
        if (statusTxt) statusTxt.textContent = `🔴 ${label} actief (Echte Stemmen)`;
        if (hudStatus) hudStatus.textContent = this.currentStation.toUpperCase().replace('_', ' ');
        ATC.playMicClick(true);
        ATC.logMessage('LIVE ATC', `Verbonden met audiofeed: ${label} (Echte menselijke stemmen)`, true);
      }).catch((err) => {
        console.warn('Live stream play failed, switching to real audio recording:', err);
        this.fallbackToRealAudio();
      });
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
    }

    const btn = document.getElementById('btn-liveatc-toggle');
    const statusTxt = document.getElementById('liveatc-status-txt');
    const dot = document.getElementById('liveatc-dot');
    const pill = document.getElementById('pill-liveatc');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (btn) { btn.classList.remove('playing'); btn.textContent = '▶ PLAY'; }
    if (dot) dot.className = 'dot red';
    if (pill) pill.classList.remove('active');
    if (statusTxt) statusTxt.textContent = '📻 LiveATC radio gestopt';
    if (hudStatus) hudStatus.textContent = 'STANDBY';

    ATC.playMicClick(false);
  }

  tuneToAirport(airport, autoPlay = true) {
    if (!airport) return;
    const select = document.getElementById('liveatc-station-select');
    const targetStation = airport.liveAtcStation || 'eham_twr_rec';
    this.currentStation = targetStation;
    if (select) {
      select.value = targetStation;
    }
    const label = this.stationLabels[targetStation] || targetStation;
    const statusTxt = document.getElementById('liveatc-status-txt');
    const hudStatus = document.getElementById('hud-liveatc-status');

    if (autoPlay || this.isPlaying) {
      this.playStream();
    } else {
      if (statusTxt) statusTxt.textContent = `📻 Afgestemd op ${label} (Echte Stemmen)`;
      if (hudStatus) hudStatus.textContent = airport.code + ' ' + (airport.freqs ? airport.freqs.twr : '');
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
  JFK: [
    {
      id: 'jfk_twr',
      name: '🇺🇸 New York JFK Runway 31L/4R Cam',
      type: 'youtube',
      channelId: 'UC7WAqB7dyv1t8jKunD-8krA',
      osd: 'CAM JFK · RUNWAY 31L · LIVE HD',
      freq: '119.100 MHz TWR',
      satImage: 'textures/runways/kjfk_satellite_highres.jpg',
      desc: 'Echte live videobeelden van vertrekkende en landende widebody toestellen'
    },
    {
      id: 'jfk_sat',
      name: '🛰️ New York JFK Satelliet Luchtfoto',
      type: 'satellite',
      satImage: 'textures/runways/kjfk_satellite_highres.jpg',
      osd: 'SAT JFK · KENNEDY INTL RUNWAY SYSTEM',
      freq: '119.100 MHz TWR',
      desc: 'Echte satellietfoto van banen 31L, 31R, 4L, 4R en terminals'
    }
  ],
  LHR: [
    {
      id: 'lhr_rwy',
      name: '🇬🇧 London Heathrow Runway 27L/27R Cam',
      type: 'youtube',
      channelId: 'UCkQef3Fidr7tm3gNuXgGKPw', // BIG JET TV
      osd: 'CAM LHR · RUNWAY 27L · APPROACH & TOUCHDOWN',
      freq: '118.500 MHz TWR',
      satImage: 'textures/runways/lhr_satellite_highres.jpg',
      desc: 'Echte live camerabeelden van zware landingen op Heathrow'
    },
    {
      id: 'lhr_sat',
      name: '🛰️ London Heathrow Satelliet Luchtfoto',
      type: 'satellite',
      satImage: 'textures/runways/lhr_satellite_highres.jpg',
      osd: 'SAT LHR · HEATHROW TWO RUNWAY ORTHO',
      freq: '118.500 MHz TWR',
      desc: 'Echte satellietfoto van banen 27L en 27R'
    }
  ],
  LAX: [
    {
      id: 'lax_rwy',
      name: '🇺🇸 Los Angeles LAX Runway 24L/25R Cam',
      type: 'youtube',
      channelId: 'UC7WAqB7dyv1t8jKunD-8krA', // L.A. Flights
      osd: 'CAM LAX · SOUTH RUNWAY COMPLEX · LIVE',
      freq: '120.950 MHz TWR',
      satImage: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/12975/5607',
      desc: 'Echte live runway beelden vanaf Los Angeles International'
    }
  ],
  SXM: [
    {
      id: 'sxm_maho',
      name: '🇲🇶 St. Maarten Maho Beach Runway 10 Cam',
      type: 'youtube',
      channelId: 'UCRjMuOBDCfSsCNIe2p0_tdg', // SHOWME Caribbean Maho Beach Cam
      osd: 'CAM SXM · MAHO BEACH RUNWAY 10 · 4K LIVE',
      freq: '118.700 MHz TWR',
      desc: 'De beroemde live baancamera met spectaculaire lage landingen'
    }
  ]
};

function getAirportSatelliteTextureUrl(airport) {
  if (!airport) return 'textures/runways/schiphol_satellite_highres.jpg';
  if (airport.code === 'AMS') return 'textures/runways/schiphol_satellite_highres.jpg';
  if (airport.code === 'JFK') return 'textures/runways/kjfk_satellite_highres.jpg';
  if (airport.code === 'LHR') return 'textures/runways/lhr_satellite_highres.jpg';

  // Dynamische Esri World Imagery satelliet tile voor elk vliegveld wereldwijd (open CORS)
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
  }

  close() {
    this.isOpen = false;
    if (this.deckEl) this.deckEl.classList.remove('show');
    const btnToggle = document.getElementById('btn-toggle-runwaycam');
    if (btnToggle) btnToggle.classList.remove('active');
    if (this.iframeEl) this.iframeEl.src = '';
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

    // Start direct de echte LiveATC audiofeed met menselijke stemmen indien nog niet gestart
    if (LIVEATC && !LIVEATC.isPlaying) {
      LIVEATC.tuneToAirport(this.selectedAirport || (S && S.selectedAirport));
      LIVEATC.playStream();
    }

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

    const rwy = flight.origin.activeRunway || '24';
    const towerText = `${flight.callsign}, ${sector.name}, wind 220 at 12 knots, ${rwy}, cleared for takeoff.`;
    const pilotText = `Cleared for takeoff ${rwy}, ${flight.callsign}.`;

    this.exchangeDialogue(sector.code, towerText, towerText, flight.callsign, pilotText, pilotText);
  }

  determineSector(flight) {
    if (flight.origin.code === 'AMS' || flight.dest.code === 'AMS') {
      return { name: 'SCHIPHOL TOWER', code: 'AMS TWR', freq: '118.100' };
    }
    if (flight.origin.code === 'JFK' || flight.dest.code === 'JFK') {
      return { name: 'NEW YORK TOWER', code: 'JFK TWR', freq: '119.100' };
    }
    return { name: `${flight.origin.code} TOWER`, code: `${flight.origin.code} TWR`, freq: flight.origin.freqs.twr };
  }

  toggleMute() {
    this.enabled = !this.enabled;
    this.ensureAudioCtx();
    if (LIVEATC) {
      if (!this.enabled && LIVEATC.isPlaying) {
        LIVEATC.stop();
      } else if (this.enabled && !LIVEATC.isPlaying) {
        LIVEATC.playStream();
      }
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
  S.camera.position.set(0, 50, 260);

  S.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  S.renderer.setSize(w, h);
  S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  S.renderer.toneMappingExposure = 1.05;
  container.appendChild(S.renderer.domElement);

  // OrbitControls: minDistance op 0.002 (~125m) zodat inzoomen tot 300m soepel kan
  S.controls = new THREE.OrbitControls(S.camera, S.renderer.domElement);
  S.controls.enableDamping = true;
  S.controls.dampingFactor = 0.06;
  S.controls.minDistance = 0.002;
  S.controls.maxDistance = 500;
  S.controls.rotateSpeed = 0.6;
  S.controls.zoomSpeed = 0.9;

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

  // Bouw direct het 3D Schiphol baanmodel
  buildDetailedAirportModel(AIRPORTS[0]);

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
  const hubGeo = new THREE.SphereGeometry(0.85, 12, 12);
  const smallGeo = new THREE.SphereGeometry(0.50, 8, 8);

  for (const ap of AIRPORTS) {
    const pos = latLonToVector3(ap.lat, ap.lon, CFG.globeRadius + 0.25);
    const mesh = new THREE.Mesh(ap.hub ? hubGeo : smallGeo, ap.hub ? hubMat : smallMat);
    mesh.position.copy(pos);
    mesh.userData = { isAirport: true, airport: ap };
    S.airportsGroup.add(mesh);
    ap._marker = mesh;

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

  // Schakel LiveATC radio af
  LIVEATC.tuneToAirport(airport);

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
  LIVEATC.tuneToAirport(ap, true);
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

    row.querySelector('.btn-fids-action').addEventListener('click', () => {
      ATC.ensureAudioCtx();
      LIVEATC.ensureAudioCtx();
      if (!LIVEATC.isPlaying) {
        LIVEATC.tuneToAirport(S.selectedAirport || f.dest || f.origin);
        LIVEATC.playStream();
      }
      ATC.contactFlight(f);
      if (!f.isSlot) S.followFlight = f;
    });

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

    row.querySelector('.btn-fids-action').addEventListener('click', () => {
      ATC.ensureAudioCtx();
      LIVEATC.ensureAudioCtx();
      if (!LIVEATC.isPlaying) {
        LIVEATC.tuneToAirport(S.selectedAirport || f.dest || f.origin);
        LIVEATC.playStream();
      }
      ATC.contactFlight(f);
      if (!f.isSlot) S.followFlight = f;
    });

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

  const atisLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const atisText = `Information ${atisLetter}. ${ap.name} Airport. Runway in use: ${ap.activeRunway}. Weather: ${ap.weather.cond.toUpperCase()}. Wind ${ap.weather.wind}. QNH ${ap.weather.qnh}.`;

  ATC.logMessage(`${ap.code} ATIS`, atisText, true);
  ATC.speak(atisText, true);
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
    if (!LIVEATC.isPlaying) {
      LIVEATC.tuneToAirport(S.selectedAirport);
      LIVEATC.playStream();
    }
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

  if (S.daylightMode) {
    if (btnHead) btnHead.classList.add('active');
    if (txtHead) txtHead.textContent = '☀️ Dagzicht: AAN';
    if (btnCtrl) {
      btnCtrl.classList.add('active');
      btnCtrl.textContent = '☀️ Dagzicht';
    }
    ATC.logMessage('BELICHTING', 'Dagzicht geactiveerd: aarde, landingsbanen en vliegtuigen helder verlicht.', false);
  } else {
    if (btnHead) btnHead.classList.remove('active');
    if (txtHead) txtHead.textContent = '🌙 Nachtzicht: AAN';
    if (btnCtrl) {
      btnCtrl.classList.remove('active');
      btnCtrl.textContent = '🌙 Nachtzicht';
    }
    ATC.logMessage('BELICHTING', 'Realistische zonbelichting & nachtschaduw geactiveerd.', false);
  }
}

// ═══════════════════════════════════════════════════════
//  VERSIE CONTROLE (GitHub Pages Auto-Detect)
// ═══════════════════════════════════════════════════════
let currentVersion = '1.6.0';

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
  RUNWAY_CAM.init();

  await loadWasm();
  await checkVersion(true);

  setInterval(() => checkVersion(true), CFG.pollMs);

  requestAnimationFrame(animate);
});
