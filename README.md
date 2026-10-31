# MakeCode for micro:bit — World of Modules (WoM) Simulator

A customized [Microsoft MakeCode for micro:bit](https://github.com/microsoft/pxt-microbit) target with interactive web simulator support for **Yahboom Module-World**, **TM1650 4-Digit Display**, and **RGB Color Recognition** hardware extensions.

## Features
- **Interactive Module Visuals**: Real-time simulator components for sensors and actuators (IR, PIR, Ultrasonic, DHT11, Button, Light, Potentiometer, Joystick, RGB LED, 270°/360°/Continuous Servos, Color Sensor, and TM1650 7-Segment Display) with wiring (excludes 3v3 and GND wires).
- **Pin conflict detection**: Detects whether we reuse same pins for different modules or if the pins are used both for modules and to control the internal LED matrix, shows errors in SIM only if that is the case. 
- **Hardware & Simulator Compatible**: Compiles standard micro:bit `.hex` firmware while bridging GPIO, PWM, pulse, and I2C traffic to interactive simulator states.


## Local server setup

The local server lets you to run the editor and serve the documentation from your own computer. It is meant for a single developer used and not designed to serve the editor to a large amount of users.

1. Install [Node.js](https://nodejs.org/) 8.9.4 or higher.
2. Clone this repository.
```
git clone https://github.com/microsoft/pxt-microbit
cd pxt-microbit
```
3. Install the PXT command line (add `sudo` for Mac/Linux shells).
```
npm install -g pxt
```
4. Install the pxt-microbit dependencies.
```
npm install
```

Go to the **Running** section.

### Developer Setup

This is the typical setup used by the MakeCode team to work on the microbit.

1. Install [Node.js](https://nodejs.org/) 8.9.4 or higher.
2. Install [Docker](https://www.docker.com/get-started) if you plan to build ``.cpp`` files.
3. Clone the pxt repository.
```
git clone https://github.com/microsoft/pxt
cd pxt
```
4. Install the dependencies of pxt and build it
```
npm install
npm run build
cd ..
```
5. Clone the pxt-common-packages repository
```
git clone https://github.com/microsoft/pxt-common-packages
cd pxt-common-packages
npm install
```

6. Link pxt-common-packages to pxt
```
npm link ../pxt
cd ..
```

7. Clone this repository.
```
git clone https://github.com/microsoft/pxt-microbit
cd pxt-microbit
```
8. Install the PXT command line (add `sudo` for Mac/Linux shells).
```
npm install -g pxt
```
9. Install the pxt-microbit dependencies.
```
npm install
```
10. Link pxt-microbit back to base pxt repo (add `sudo` for Mac/Linux shells). 
This step is only required if you intend to make changes to pxt and/or 
pxt-common-packages repos. If all you want is serve a local Makecode, you can skip
this step.
```
npm link ../pxt ../pxt-common-packages
```
Note the above command assumes the folder structure of   
```
       makecode
          |
  ----------------------------------
  |       |                        |
 pxt      pxt-common-packages  pxt-microbit
 ```

### Running

Run this command from inside pxt-microbit to open a local web server
```
pxt serve
```
If the local server opens in the wrong browser, make sure to copy the URL containing the local token. 
Otherwise, the editor will not be able to load the projects.

If you need to modify the `.cpp` files (and have installed yotta), enable yotta compilation using the `--localbuild` flag:
```
pxt serve --local
```

If you want to speed up the build, you can use the ``rebundle`` option, which skips building and simply refreshes the target information
```
pxt serve --rebundle
```

### Cleaning

Sometimes, your built folder might be in a bad state, clean it and try again.
```
pxt clean
```
