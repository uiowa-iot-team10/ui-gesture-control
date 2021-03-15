/*
  APDS9960 - Gesture Sensor

  This example reads gesture data from the on-board APDS9960 sensor of the
  Nano 33 BLE Sense and prints any detected gestures to the Serial Monitor.

  Gesture directions are as follows:
  - UP:    from USB connector towards antenna
  - DOWN:  from antenna towards USB connector
  - LEFT:  from analog pins side towards digital pins side
  - RIGHT: from digital pins side towards analog pins side

  The circuit:
  - Arduino Nano 33 BLE Sense

  This example code is in the public domain.
*/

#include <Arduino_APDS9960.h>

const int ledP1 = 22;
const int ledP2 = 23;
const int ledP3 = 24;

void setup() {
  pinMode(22, OUTPUT); // Red 
  pinMode(23, OUTPUT); // Green
  pinMode(24, OUTPUT); // Blue
  pinMode(LED_BUILTIN, OUTPUT); // Orange
  // HIGH = off, LOW = on
  digitalWrite(ledP1, HIGH);
  digitalWrite(ledP2, HIGH);
  digitalWrite(ledP3, HIGH);
  Serial.begin(9600);
  while (!Serial);

  if (!APDS.begin()) {
    Serial.println("Error initializing APDS9960 sensor!");
  }

  // for setGestureSensitivity(..) a value between 1 and 100 is required.
  // Higher values makes the gesture recognition more sensible but less accurate
  // (a wrong gesture may be detected). Lower values makes the gesture recognition
  // more accurate but less sensible (some gestures may be missed).
  // Default is 80
  //APDS.setGestureSensitivity(80);

  Serial.println("Detecting gestures ...");
}
void loop() {
  if (APDS.gestureAvailable()) {
    // a gesture was detected, read and print to serial monitor
    int gesture = APDS.readGesture();

    switch (gesture) {
      case GESTURE_UP:
        Serial.println("Detected UP gesture");
        digitalWrite(ledP1, LOW);
        delay(1000);
        digitalWrite(ledP1, HIGH);
        break;

      case GESTURE_DOWN:
        Serial.println("Detected DOWN gesture");
        digitalWrite(ledP2, LOW);
        delay(1000);
        digitalWrite(ledP2, HIGH);
        break;

      case GESTURE_LEFT:
        Serial.println("Detected LEFT gesture");
        digitalWrite(ledP3, LOW);
        delay(1000);
        digitalWrite(ledP3, HIGH);
        break;

      case GESTURE_RIGHT:
        Serial.println("Detected RIGHT gesture");
        digitalWrite(LED_BUILTIN, LOW);
        delay(1000);
        digitalWrite(LED_BUILTIN, HIGH);
        break;

      default:
        // ignore
        break;
    }
  }
}
