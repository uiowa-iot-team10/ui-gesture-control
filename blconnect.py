#!/usr/bin/env python3

"""
This Python script generates random gestures in every 2 seconds.

This can be updated to be used with Arduino Gesture sensor over BLE.
"""

import os
import sys
import struct
import socketio
from bluepy import btle
from sense_hat import SenseHat

GESTURES = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT"
}
PORT = 9999

class MyDelegate(btle.DefaultDelegate):
    def __init__(self, hndl, sio, sense):
        btle.DefaultDelegate.__init__(self)
        print("[LOG] handleNotification init")
        self.hndl = hndl
        self.sio  = sio
        self.sense = sense

    def handleNotification(self, cHandle, data):
        if (cHandle == self.hndl):
            gesture = GESTURES[data[0]]
            self.sense.show_letter(str(data[0]),[255,0,0])
            print("[LOG] Sending gesture: {}".format(gesture))
            self.sio.emit("gesture", gesture)
            # print("handleNotification handle 0x%04X, data %s" % (cHandle, gesture))
        else:
            print("[LOG] handleNotification handle 0x%04X unknown" % (cHandle))

def main():
    sio = socketio.Client()
    @sio.event
    def connect():
        print('[LOG] connection established')

    @sio.event
    def disconnect():
        print('[LOG] disconnected from server')

    sio.connect('http://localhost:{}'.format(PORT))

    sense = SenseHat()
    ble_bt840_eval_board_max = "5A:6B:31:73:71:00"
    print("[LOG] Connecting to BLE device MAC: " + ble_bt840_eval_board_max)

    per = btle.Peripheral("5A:6B:31:73:71:00")
    services = per.getServices()
    svc = per.getServiceByUUID(list(services)[2].uuid)
    ble_characteristic = svc.getCharacteristics()[1]
    print(svc)
    print(ble_characteristic)
    print("[LOG] connected")

    ble_handle = ble_characteristic.getHandle()
    ble_handle_cccd = ble_characteristic.getHandle() + 1
    per.writeCharacteristic(ble_handle_cccd, bytes([0x01, 0x00]))
    print("[LOG] ble_handle 0x%X" % ble_handle)
    print("[LOG] ble_handle_cccd 0x%X" % ble_handle_cccd)

    per.withDelegate(MyDelegate(ble_handle, sio, sense))

    print("[LOG] ble_state %d" % int.from_bytes(ble_characteristic.read(), byteorder='little'))

    while True:
        if per.waitForNotifications(1.0):
            print("[LOG] Notification received")
            continue

        print("[LOG] Waiting for notifications...")

if (__name__ == "__main__"):
    main()