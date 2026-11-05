//! # PetersWorld Native CLI Runner
//!
//! Voert de PetersWorld simulatie-engine rechtstreeks uit in de terminal op
//! macOS, Linux of Windows.

use std::thread::sleep;
use std::time::Duration;

mod lib;
use lib::*;

fn main() {
    println!("============================================================");
    println!("🌍 Welkom bij PetersWorld - Native CLI Simulatie Runner");
    println!("============================================================");
    println!("Engine Versie: v{}", get_version() as f32 / 100.0);

    init_world(42);
    println!("Initialisatie geslaagd!");
    println!("Actieve Landmarks:   {}", get_stat(7));
    println!("Actieve Satellieten: {}", get_stat(6));
    println!("Wereldbevolking:     {} miljoen inwoners", get_stat(11));
    println!("Starten van simulatie ticks (druk Ctrl+C om te stoppen)...");
    println!("------------------------------------------------------------");

    for step in 1..=10 {
        let tick = update(50, 1);
        let rot_y = get_stat(3) as f32 / 1000.0;
        let sun = get_stat(5) as f32 / 1000.0;

        println!(
            "[{:03}] Tick: {:05} | Rotatie Y: {:.3} rad | Zonhoek: {:.3} rad | Energie: {}%",
            step, tick, rot_y, sun, get_stat(9)
        );

        if step == 3 {
            println!("⚡ [Event] Sensor puls getriggerd op Peter's Citadel!");
            add_pulse(5237, 490, 100);
        } else if step == 6 {
            println!("🛰️  [Event] Nieuwe communicatiesatelliet gelanceerd in orbit!");
            add_satellite(260, 50, 40, 1);
        }

        sleep(Duration::from_millis(200));
    }

    println!("------------------------------------------------------------");
    println!("✅ Simulatie run succesvol afgerond.");
    println!("Bekijk de visuele 3D browser ervaring via index.html of GitHub Pages!");
}
