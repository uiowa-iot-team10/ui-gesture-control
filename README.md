# ui-gesture-control
User Interface controlling via Ardunio Nano 33 BLE Gesture Sensor

## gesture_led_output
The arduino has a built-in LED with pins 22, 23, and 24.  It also has another built-in LED with pin LED_BUILTIN.

* LED Pin 22: RED 
* LED Pin 23: GREEN
* LED Pin 24: BLUE 
* LED Pin LED_BUILTIN: Orange

## Requirements

- NodeJS
- Python3

## Installation

First of all install the dependencies for Python:

`$ sudo -H python3 -m pip install -r requirements.txt`

For NodeJS, if they are not already installed:

`$ npm install`

## Run

1. You have to start server first: `$ node app.js`
2. Then, you can go to `http://localhost` from your browser.
3. Run the gesture script `$ python3 get_gesture.py` or `$ ./get_gesture.py`

Now, you should be able to see both Server and Script connected on the browser, and every 2 seconds there should be a gesture appear on the webpage. (UP, DOWN, LEFT or RIGHT)


