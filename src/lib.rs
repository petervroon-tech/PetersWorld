//! # PetersWorld - Core Simulatie Engine
//!
//! Deze module levert de cross-platform logica voor PetersWorld.
//! Kan gecompileerd worden naar WebAssembly (`wasm32-unknown-unknown`)
//! of als native library voor macOS, Linux en Windows.

pub const MAGIC: u32 = 0x50575244; // "PWRD"
pub const VERSION: i32 = 100;       // v1.0.0

#[repr(C)]
pub struct PetersWorldState {
    pub magic: u32,
    pub version: i32,
    pub tick: i32,
    pub rot_y: i32,
    pub rot_x: i32,
    pub sun_angle: i32,
    pub satellites_count: i32,
    pub markers_count: i32,
    pub pulses_count: i32,
    pub energy_flux: i32,
    pub radius: i32,
    pub population_millions: i32,
}

static mut STATE: PetersWorldState = PetersWorldState {
    magic: MAGIC,
    version: VERSION,
    tick: 0,
    rot_y: 0,
    rot_x: 350,
    sun_angle: 0,
    satellites_count: 4,
    markers_count: 8,
    pulses_count: 0,
    energy_flux: 100,
    radius: 180,
    population_millions: 8520,
};

#[no_mangle]
pub extern "C" fn get_version() -> i32 {
    VERSION
}

#[no_mangle]
pub extern "C" fn get_state_ptr() -> *const PetersWorldState {
    unsafe { &STATE as *const PetersWorldState }
}

#[no_mangle]
pub extern "C" fn init_world(_seed: i32) -> i32 {
    unsafe {
        STATE.magic = MAGIC;
        STATE.version = VERSION;
        STATE.tick = 0;
        STATE.rot_y = 0;
        STATE.rot_x = 350;
        STATE.sun_angle = 0;
        STATE.satellites_count = 4;
        STATE.markers_count = 8;
        STATE.pulses_count = 0;
        STATE.energy_flux = 100;
        STATE.radius = 180;
        STATE.population_millions = 8520;
    }
    1
}

#[no_mangle]
pub extern "C" fn update(dt_ms: i32, speed_factor: i32) -> i32 {
    unsafe {
        STATE.tick += 1;
        STATE.rot_y = (STATE.rot_y + (dt_ms * speed_factor) / 5) % 6283;
        STATE.sun_angle = (STATE.sun_angle + dt_ms * 2) % 6283;
        STATE.tick
    }
}

#[no_mangle]
pub extern "C" fn add_pulse(_lat_e2: i32, _lon_e2: i32, _intensity: i32) -> i32 {
    unsafe {
        STATE.pulses_count += 1;
        STATE.pulses_count
    }
}

#[no_mangle]
pub extern "C" fn add_satellite(_r: i32, _speed: i32, _inc: i32, _type: i32) -> i32 {
    unsafe {
        STATE.satellites_count += 1;
        STATE.satellites_count
    }
}

#[no_mangle]
pub extern "C" fn get_stat(idx: i32) -> i32 {
    unsafe {
        match idx {
            0 => STATE.magic as i32,
            1 => STATE.version,
            2 => STATE.tick,
            3 => STATE.rot_y,
            4 => STATE.rot_x,
            5 => STATE.sun_angle,
            6 => STATE.satellites_count,
            7 => STATE.markers_count,
            8 => STATE.pulses_count,
            9 => STATE.energy_flux,
            10 => STATE.radius,
            11 => STATE.population_millions,
            _ => 0,
        }
    }
}
