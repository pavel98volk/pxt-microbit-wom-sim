# Simulator Module Sprites (`sim/public/sprites/`)

This directory contains PNG sprite images representing the physical building-block hardware modules (sensors, actuators, displays) and their parts, used in the Microsoft MakeCode micro:bit simulator.

---

## 1. Role in the Simulator Architecture

In the simulator view (`sim/visuals/`):
1. **Base Block Sprite**: A PNG image rendered as the background layer via an SVG `<image>` element.
2. **Interactive Elements Overlaid**: Dynamic controls (sliders, push buttons, switches, LED swatches) are overlaid on top of the base sprite using SVG elements and semantic HTML5 controls inside `<foreignObject>`.
3. **Wire Terminals**: Pin terminals (`VCC`, `GND`, signal pins) are positioned along the module borders to connect Bezier curve wires to the micro:bit edge connector.

```svg
<g class="wom-module wom-ultrasonic">
  <!-- 1. Base Block Sprite PNG -->
  <image href="/sim/sprites/wom_ultrasonic.png" x="0" y="0" width="200" height="130" />
  
  <!-- 2. Overlaid Interactive Controls (<foreignObject>) -->
  <foreignObject x="20" y="70" width="160" height="40">
    <input type="range" min="2" max="400" value="50" style="width: 100%;" />
  </foreignObject>

  <!-- 3. Dynamic Text Readout / Indicator -->
  <text x="100" y="55" text-anchor="middle" fill="#f1c40f">50 cm</text>
</g>
```

---

## 2. Serving & URL Resolution

- Files placed in `sim/public/sprites/` are statically served by the MakeCode local server (`pxt serve`) and the web client at:
  ```
  /sim/sprites/<filename>.png
  ```
- MakeCode's `server.js` includes `sim/public` in its static asset lookup paths, automatically serving PNG files with the proper `image/png` MIME header.

---

## 3. Recommended Sprite Specifications

- **Format**: PNG with 32-bit RGBA alpha transparency.
- **Resolution**: $\approx 400 \times 260\text{px}$ (rendered at $200 \times 130\text{px}$ for crisp 2x retina display).
- **Aspect Ratio**: Standard modules use $\approx 200 \times 130$ ($1.54:1$).
- **Content**: Clean top-down or slight angle view of the physical building block enclosure, PCB, and permanent hardware components (e.g. transducers, sensors, header pins). Exclude dynamic state indicators (like lighted LEDs or slider thumbs) that will be rendered dynamically by SVG/HTML5 overlays.

---

## 4. Module Inventory & Expected Filenames (Yahboom Module-World)

| Module (base .png image with transparent background) | Expected Filename | Description |
|---|---|---|
| **Button Module** | `wom_button.png` | Push-button tactile switch, square. When pressed on a central area, semi-transparent shadow circle must be drawn over it to signify button being pressed |
| **Buzzer Module** | `wom_buzzer.png` | Single sound buzzer, square. When buzzer buzzes - yellow circle or animation must be drawn over it |
| **Color recognition Module** | `wom_color_recognition.png` | A module with RGB color recognition and a simple white LED that is allways lit when it is active, must be used with a color selection triangle and intensity slider, square |
| **DHT11 Temp & Humidity** | `wom_dht11.png` | Blue DHT11 sensor enclosure on module PCB, square |
| **IR Obstacle Sensor** | `wom_ir.png` | IR transmitter and photodiode receiver pair, square |
| **Joystick** | `wom_joystick_base.png` | Joystick base (must be used with `joystick-stick.svg` as interactive draggable part), square |
| **Light Sensor** | `wom_photoresistor.png` | Photoresistor (LDR) sensor square PCB, square |
| **PIR Motion Sensor** | `wom_pir.png` | PIR sensor dome / lens housing on PCB, square |
| **Potentiometer** | `wom_potentiometer.png` | Rotary potentiometer/knob base, must be used with interactive `potentiometer_rotor.svg`, square |
| **RGB LED** | `wom_rgb.png` | RGB diode block on PCB, RGB color set in command must be drawn on top of center square, with alpha of (R+G+B)/255, square |
| **Continuous Servo** | `wom_servo_continuous.png` | Stator part of a continuous rotation servo, must be used with animated `servo_rotor.svg`, servo connection is near the center of uppoer half |
| **Positional Servo** | `wom_servo.png` | Stator part of a positional servo, must be used with animated `servo_rotor.svg`, servo connection is near the center of upper half |
| **tm1650 4 digit segment display** | `wom_tm1650.png` | segment display with all segments disabled. Overlay must represent segments lit in red color |
| **Ultrasonic Sensor** | `wom_ultrasonic.png` | Dual ultrasonic transducers + Yahboom block housing. Overlay must be a left to right slider showing distance to object, cm |


| Module (Additional .svg images for interactive/animated parts) | Expected Filename | Description |
| **Joystick Stick** | `joystick_stick.svg` | A centered circle to represent joystick moving part. Can be dragged up/down/left/right to a certain degree. |
| **Servo Rotor** | `servo_rotor.svg` | A rotor lever `arm` that should be placed on servo rotor where its right circle is, and rotated around that circle. Used to show servo position |
| **Potentiometer Rotor** | `potentiometer_rotor.svg` | a centered circle with a tick to represent potentiometer moving part, must be rotated when dragged left/right |

