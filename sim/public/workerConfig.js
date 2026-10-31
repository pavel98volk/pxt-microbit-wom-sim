// Service worker configuration for simulator offline assets
if (typeof self !== "undefined" && self.setSimulatorWorkerOptions) {
    self.setSimulatorWorkerOptions({
        urls: [
            "/sim/sprites/color_camera.svg",
            "/sim/sprites/dht_clouds.svg",
            "/sim/sprites/dht_dune.svg",
            "/sim/sprites/dht_rain.svg",
            "/sim/sprites/dht_sun.svg",
            "/sim/sprites/dht_sun_cloud.svg",
            "/sim/sprites/joystick_stick.svg",
            "/sim/sprites/pir_hand.svg",
            "/sim/sprites/pir_robot.svg",
            "/sim/sprites/potentiometer_rotor.svg",
            "/sim/sprites/servo_rotor.svg",
            "/sim/sprites/wom_button.png",
            "/sim/sprites/wom_color_recognition.png",
            "/sim/sprites/wom_dht11.png",
            "/sim/sprites/wom_ir.png",
            "/sim/sprites/wom_joystick_base.png",
            "/sim/sprites/wom_photoresistor.png",
            "/sim/sprites/wom_pir.png",
            "/sim/sprites/wom_potentiometer.png",
            "/sim/sprites/wom_rgb.png",
            "/sim/sprites/wom_servo.png",
            "/sim/sprites/wom_servo_continuous.png",
            "/sim/sprites/wom_tm1650.png",
            "/sim/sprites/wom_ultrasonic.png"
        ]
    });
}
