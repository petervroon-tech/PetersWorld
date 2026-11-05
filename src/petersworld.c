/*
 * PetersWorld - Cross-platform C Implementation
 * Compileerbaar voor desktop (gcc/clang) of WebAssembly (clang/emcc)
 */
#include <stdio.h>
#include <stdint.h>

#define MAGIC 0x50575244
#define VERSION 100

typedef struct {
    uint32_t magic;
    int32_t version;
    int32_t tick;
    int32_t rot_y;
    int32_t rot_x;
    int32_t sun_angle;
    int32_t satellites_count;
    int32_t markers_count;
    int32_t pulses_count;
    int32_t energy_flux;
    int32_t radius;
    int32_t population_millions;
} PetersWorldState;

static PetersWorldState state = {
    MAGIC, VERSION, 0, 0, 350, 0, 4, 8, 0, 100, 180, 8520
};

int32_t get_version(void) { return VERSION; }
void* get_state_ptr(void) { return &state; }

int32_t init_world(int32_t seed) {
    (void)seed;
    state.magic = MAGIC;
    state.version = VERSION;
    state.tick = 0;
    state.rot_y = 0;
    state.rot_x = 350;
    state.sun_angle = 0;
    state.satellites_count = 4;
    state.markers_count = 8;
    state.pulses_count = 0;
    state.energy_flux = 100;
    state.radius = 180;
    state.population_millions = 8520;
    return 1;
}

int32_t update(int32_t dt_ms, int32_t speed_factor) {
    state.tick += 1;
    state.rot_y = (state.rot_y + (dt_ms * speed_factor) / 5) % 6283;
    state.sun_angle = (state.sun_angle + dt_ms * 2) % 6283;
    return state.tick;
}

int32_t add_pulse(int32_t lat_e2, int32_t lon_e2, int32_t intensity) {
    (void)lat_e2; (void)lon_e2; (void)intensity;
    state.pulses_count += 1;
    return state.pulses_count;
}

int32_t add_satellite(int32_t r, int32_t speed, int32_t inc, int32_t type) {
    (void)r; (void)speed; (void)inc; (void)type;
    state.satellites_count += 1;
    return state.satellites_count;
}

int32_t get_stat(int32_t idx) {
    int32_t* ptr = (int32_t*)&state;
    if (idx >= 0 && idx < 12) return ptr[idx];
    return 0;
}

#ifndef __wasm__
int main(void) {
    printf("🌍 PetersWorld C CLI Runner (v%0.2f)\n", (float)VERSION / 100.0f);
    init_world(42);
    printf("Initialisatie geslaagd. Start tick: %d\n", state.tick);
    for (int i = 0; i < 5; i++) {
        int t = update(50, 1);
        printf("Tick %d: rot_y = %d, sun = %d\n", t, state.rot_y, state.sun_angle);
    }
    return 0;
}
#endif
