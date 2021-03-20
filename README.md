# ui-gesture-control
User Interface controlling via Ardunio Nano 33 BLE Gesture Sensor

## Requirements

- NodeJS
- Python3
- BlueZ && Bleak
- Tmux

## Installation

### Python Libraries

First of all install the dependencies for Python:

```bash
$ sudo -H python3 -m pip install -r requirements.txt
```

### BlueZ && Bleak

First install the following dependencies for Python:

```bash
$ sudo apt-get install libdbus-1-dev libusb-dev libglib2.0-dev libudev-dev libical-dev libreadline-dev
```


Install Latest BlueZ:

```bash
$ wget www.kernel.org/pub/linus/bluetooth/bluez-5.50.tar.xz
$ tar xvf bluez-5.50.tar.xz && cd bluez-5.50
$ ./configure --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var --enable-experimental
$ make -j4
$ sudo make install
$ sudo reboot
```

Now you can install the Bleak library:

```bash
$ sudo -H python3 -m pip install bleak
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

## Run

1. Create a Tmux window: `$ tmux new -s server`
2. You have to start server first: `$ sudo node app.js`
3. `CTRL + B`, then `D`. (Deattaching)
4. Then, you can go to `http://localhost` from your browser.
5. Create another Tmux window: `$ tmux new -s script`
6. Run the gesture script `$ python3 get_gesture.py` or `$ ./get_gesture.py`
7. `CTRL + B`, then `D`. (Deattaching)

Now, you should be able to see both Server and Script connected on the browser, and every gesture should appear on the webpage. (UP, DOWN, LEFT or RIGHT)

In order to connect back (attach) to Tmux windows: `$ tmux a -t server` or `$ tmux a -t script`

To close the Tmux windows (If you really want to terminate server or script):

1. Attach the window: `$ tmux a -t server`
2. `CTRL + C`, to kill the process.
3. `CTRL + D`, to terminate the Tmux window.

