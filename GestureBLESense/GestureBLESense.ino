/*
  Button LED

  This example creates a BLE peripheral with service that contains a
  characteristic to control an LED and another characteristic that
  represents the state of the button.

  The circuit:
  - Arduino MKR WiFi 1010, Arduino Uno WiFi Rev2 board, Arduino Nano 33 IoT,
    Arduino Nano 33 BLE, or Arduino Nano 33 BLE Sense board.
  - Button connected to pin 4

  You can use a generic BLE central app, like LightBlue (iOS and Android) or
  nRF Connect (Android), to interact with the services and characteristics
  created in this sketch.

  This example code is in the public domain.
*/

#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>
#include <Arduino_APDS9960.h>


//float x = 0;
//float y = 0;
//float z = 0;

BLEService dataService("19B10010-E8F2-537E-4F6C-D104768A1214"); // create service


BLEFloatCharacteristic gyroXChar("19B10011-E8F2-537E-4F6C-D104768A1214",BLEWrite | BLERead | BLENotify);
BLEIntCharacteristic movementChar("19B10012-E8F2-537E-4F6C-D104768A1214",BLEWrite | BLERead | BLENotify);

void setup() {
  Serial.begin(9600);
   while (!Serial);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1);
  }
  if(!IMU.begin()){
    Serial.println("Failed to initialize IMU!");
    while(1);
  }
  if(!APDS.begin()){
    Serial.println("Error initializing APDS9960 sensor!");
  }

  // set the local name peripheral advertises
  BLE.setLocalName("GestureSense");
  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(dataService);

  // add the characteristics to the service
  dataService.addCharacteristic(gyroXChar);
  dataService.addCharacteristic(movementChar);

  // add the service
  BLE.addService(dataService);

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth device active, waiting for connections...");
}

void loop() {
  BLEDevice central = BLE.central();

  if(central)
  {
    Serial.println("Connected");
    while(central.connected())
    {
      if (APDS.gestureAvailable()) 
      {
        int gesture = APDS.readGesture();

        switch (gesture) {
          case GESTURE_UP:
            Serial.println("Detected UP gesture");
            movementChar.writeValue(gesture);
            break;

          case GESTURE_DOWN:
            Serial.println("Detected DOWN gesture");
            movementChar.writeValue(gesture);
            break;

         case GESTURE_LEFT:
            Serial.println("Detected LEFT gesture");
            movementChar.writeValue(gesture);
            break;

          case GESTURE_RIGHT:
            Serial.println("Detected RIGHT gesture");
            movementChar.writeValue(gesture);
            break;
          case GESTURE_NEAR:
            Serial.println("Detected NEAR gesture");
            movementChar.writeValue(gesture);
            break;

          default:
            // ignore
            break;
        }
      }
    }
  }
}
