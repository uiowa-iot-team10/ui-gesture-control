# ui-gesture-control
At a high level, this project developed a video game platform, enabling users to play various games, including Connect 4 and Tic-tac-toe. To interact with our system, the players optionally use a Raspberry Pi and Arduino device to control the graphical user interface using the gesture sensor embedded inside the Arduino Nano 33 BLE. In this platform, the user can play against another human (PvP) or they can play against various AIs ranging in difficulty. 

Pi vs Pi or PvP for short, is a Node JS application run on the Raspberry Pi which allows it to act as a gaming console. The motivation behind this project was as simple as creating a fun platform to play games on using the hardware from the class labs. As the name suggests, users running the same application are able to play against one another or an AI via the user interface. This interface is controlled by an Arduino Nano BLE Sense and connected to the Pi through Bluetooth.

## Installation

### Python Libraries

First of all install the dependencies for Python:

```bash
$ sudo -H python3 -m pip install -r requirements.txt
```

#### Tensorflow-light Installation on Pi
Run the following commands on your Pi to install tensorflow-light.

```bash
echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | sudo tee /etc/apt/sources.list.d/coral-edgetpu.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install python3-tflite-runtime
```

### NodeJS

For NodeJS, if they are not already installed:

```bash
$ npm install
```

### Tmux

Install Tmux:

```bash
$ sudo apt-get install tmux
```

### Arduino Code - Library - Update
1. Locate the Arduino library Arduino_APDS9960 on your computer.
2. Navigate to `Arduino_APDS9960.cpp` and add the following code after line 313 `if ((totalY <= 10 && totalY >= -10) && (totalX <= 10 && totalX >= -10))   { _detectedGesture = GESTURE_NEAR; }`
3. Navigate to `Arduino_APDS9960.h` and add the following code after line 31 `GESTURE_NEAR = 4`

## Run

1. Create a Tmux window: `$ tmux new -s server`
2. You have to start the NodeJS server: `$ sudo node app.js`
3. `CTRL + B`, then `D`. (Deattaching)
4. Then, you can go to `http://localhost` from your browser or you can go `http://raspberrypi.local` from a different device connected to same network with Pi.

Now, you should be able to access to your PvP system.

In order to connect back (attach) to Tmux windows: `$ tmux a -t server`

To close the Tmux window:

1. Attach the window: `$ tmux a -t server`
2. `CTRL + C`, to kill the process.
3. `CTRL + D`, to terminate the Tmux window.
