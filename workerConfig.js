// Service worker configuration for simulator offline assets
if (typeof self !== "undefined" && self.setSimulatorWorkerOptions) {
    self.setSimulatorWorkerOptions({
        urls: [
            "/pxt-microbit-wom-sim/sprites/color_camera.svg",
            "/pxt-microbit-wom-sim/sprites/dht_clouds.svg",
            "/pxt-microbit-wom-sim/sprites/dht_dune.svg",
            "/pxt-microbit-wom-sim/sprites/dht_rain.svg",
            "/pxt-microbit-wom-sim/sprites/dht_sun.svg",
            "/pxt-microbit-wom-sim/sprites/dht_sun_cloud.svg",
            "/pxt-microbit-wom-sim/sprites/joystick_stick.svg",
            "/pxt-microbit-wom-sim/sprites/pir_hand.svg",
            "/pxt-microbit-wom-sim/sprites/pir_robot.svg",
            "/pxt-microbit-wom-sim/sprites/potentiometer_rotor.svg",
            "/pxt-microbit-wom-sim/sprites/servo_rotor.svg",
            "/pxt-microbit-wom-sim/sprites/wom_button.png",
            "/pxt-microbit-wom-sim/sprites/wom_color_recognition.png",
            "/pxt-microbit-wom-sim/sprites/wom_dht11.png",
            "/pxt-microbit-wom-sim/sprites/wom_ir.png",
            "/pxt-microbit-wom-sim/sprites/wom_joystick_base.png",
            "/pxt-microbit-wom-sim/sprites/wom_photoresistor.png",
            "/pxt-microbit-wom-sim/sprites/wom_pir.png",
            "/pxt-microbit-wom-sim/sprites/wom_potentiometer.png",
            "/pxt-microbit-wom-sim/sprites/wom_rgb.png",
            "/pxt-microbit-wom-sim/sprites/wom_servo.png",
            "/pxt-microbit-wom-sim/sprites/wom_servo_continuous.png",
            "/pxt-microbit-wom-sim/sprites/wom_tm1650.png",
            "/pxt-microbit-wom-sim/sprites/wom_ultrasonic.png"
        ]
    });
}
