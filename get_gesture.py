#! /usr/bin/env python3
"""
This Python script generates random gestures in every 2 seconds.

This can be updated to be used with Arduino Gesture sensor over BLE.
"""
import time
import random
import socketio

GESTURES = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT"
}
PORT = 9999

def generate_gesture():
    random_gesture_index = random.randint(0, 3)
    return GESTURES[random_gesture_index]

def main():
    sio = socketio.Client()
    @sio.event
    def connect():
        print('connection established')

    @sio.event
    def disconnect():
        print('disconnected from server')

    sio.connect('http://localhost:{}'.format(PORT))
    while True:
        try:
            gesture = generate_gesture()
            print("[LOG] Sending gesture: {}".format(gesture))
            sio.emit("gesture", gesture)
            time.sleep(2.0)
        except KeyboardInterrupt:
            break

if (__name__ == "__main__"):
    main()