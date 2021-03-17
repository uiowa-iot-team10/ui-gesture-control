from bluepy import btle
import struct
import time
from sense_hat import SenseHat

sense = SenseHat()
p = btle.Peripheral("07:ef:6f:a9:54:00")
services = p.getServices()
s = p.getServiceByUUID(list(services)[2].uuid)
c = s.getCharacteristics()[1]
print(c)
while(True):
  x = str(struct.unpack('i',c.read()))
  print(x)
  sense.show_letter(x[1],[255,0,0])
  time.sleep(1)
