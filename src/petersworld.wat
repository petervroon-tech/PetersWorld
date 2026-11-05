(module
  ;; PetersWorld - WebAssembly Text Format (WAT)
  ;; Biedt 3D wereldrotatie, simulatie state, satellieten en pulse triggers.
  
  (memory (export "memory") 2 4)

  ;; Initialiseert de simulatiestatus in lineair geheugen
  (func $init_world (export "init_world") (param $seed i32) (result i32)
    (i32.store (i32.const 0) (i32.const 1347895876)) ;; Magic 'PWRD'
    (i32.store (i32.const 4) (i32.const 100))        ;; Version 100
    (i32.store (i32.const 8) (i32.const 0))          ;; Tick
    (i32.store (i32.const 12) (i32.const 0))         ;; RotY
    (i32.store (i32.const 16) (i32.const 350))       ;; RotX
    (i32.store (i32.const 20) (i32.const 0))         ;; SunAngle
    (i32.store (i32.const 24) (i32.const 4))         ;; Satellites count
    (i32.store (i32.const 28) (i32.const 8))         ;; Markers count
    (i32.store (i32.const 32) (i32.const 0))         ;; Pulses count
    (i32.store (i32.const 36) (i32.const 100))       ;; Energy flux
    (i32.store (i32.const 40) (i32.const 180))       ;; Radius
    (i32.store (i32.const 44) (i32.const 8520))      ;; Population
    (i32.const 1)
  )

  ;; Berekent de volgende simulatie stap
  (func $update (export "update") (param $dt i32) (param $speed i32) (result i32)
    ;; tick += 1
    (i32.store (i32.const 8)
      (i32.add (i32.load (i32.const 8)) (i32.const 1))
    )
    ;; rot_y = (rot_y + dt * speed / 5) % 6283
    (i32.store (i32.const 12)
      (i32.rem_s
        (i32.add
          (i32.load (i32.const 12))
          (i32.div_s (i32.mul (local.get $dt) (local.get $speed)) (i32.const 5))
        )
        (i32.const 6283)
      )
    )
    ;; sun_angle = (sun_angle + dt * 2) % 6283
    (i32.store (i32.const 20)
      (i32.rem_s
        (i32.add (i32.load (i32.const 20)) (i32.mul (local.get $dt) (i32.const 2)))
        (i32.const 6283)
      )
    )
    (i32.load (i32.const 8))
  )

  (func $get_version (export "get_version") (result i32)
    (i32.const 100)
  )

  (func $get_state_ptr (export "get_state_ptr") (result i32)
    (i32.const 0)
  )

  (func $add_pulse (export "add_pulse") (param $lat i32) (param $lon i32) (param $int i32) (result i32)
    (i32.store (i32.const 32) (i32.add (i32.load (i32.const 32)) (i32.const 1)))
    (i32.load (i32.const 32))
  )

  (func $add_satellite (export "add_satellite") (param $r i32) (param $s i32) (param $inc i32) (param $type i32) (result i32)
    (i32.store (i32.const 24) (i32.add (i32.load (i32.const 24)) (i32.const 1)))
    (i32.load (i32.const 24))
  )

  (func $get_stat (export "get_stat") (param $idx i32) (result i32)
    (i32.load (i32.mul (local.get $idx) (i32.const 4)))
  )
)
