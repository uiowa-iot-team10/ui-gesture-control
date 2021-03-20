#!/usr/bin/env python3

import os
import sys
import struct
from bluepy import btle
from sense_hat import SenseHat

GESTURES = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT"
}

class MyDelegate(btle.DefaultDelegate):
    def __init__(self, hndl):
        btle.DefaultDelegate.__init__(self)
        print("handleNotification init")
        self.hndl = hndl

    def handleNotification(self, cHandle, data):
        if (cHandle == self.hndl):
            print("handleNotification handle 0x%04X, data %s" % (cHandle, GESTURES[data[0]]))
        else:
            print("handleNotification handle 0x%04X unknown" % (cHandle))


sense = SenseHat()
ble_bt840_eval_board_max = "5A:6B:31:73:71:00"
print("Connecting to BLE device MAC: " + ble_bt840_eval_board_max)

per = btle.Peripheral("5A:6B:31:73:71:00")
services = per.getServices()
svc = per.getServiceByUUID(list(services)[2].uuid)
ble_characteristic = svc.getCharacteristics()[1]
print(svc)

print("connected")

print(ble_characteristic)
ble_handle = ble_characteristic.getHandle()
print("ble_handle 0x%X" % ble_handle)

ble_handle_cccd = ble_characteristic.getHandle() + 1
print("ble_handle_cccd 0x%X" % ble_handle_cccd)
per.writeCharacteristic(ble_handle_cccd, bytes([0x01, 0x00]))

per.withDelegate(MyDelegate(ble_handle))

print("ble_state %d" % int.from_bytes(ble_characteristic.read(), byteorder='little'))

while True:
    if per.waitForNotifications(1.0):
        print("Notification received")
        continue

    print("Waiting for notifications...")