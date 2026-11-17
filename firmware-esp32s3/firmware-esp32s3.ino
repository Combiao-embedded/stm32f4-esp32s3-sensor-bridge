#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

// UART Pins for STM32F4 Communication (ปรับเปลี่ยนขาได้ตามวงจรจริง)
#define STM32_RX_PIN 18
#define STM32_TX_PIN 17
#define STM32_BAUD   115200

// NETPIE MQTT Broker
const char* MQTT_SERVER = "mqtt.netpie.io";
const int   MQTT_PORT   = 1883;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup() {
  Serial.begin(115200);
  Serial1.begin(STM32_BAUD, SERIAL_8N1, STM32_RX_PIN, STM32_TX_PIN);

  delay(1000);
  Serial.println("[ESP32-S3] Firmware initialized.");
  Serial.printf("[ESP32-S3] PSRAM Free: %d bytes\n", ESP.getFreePsram());
}

void loop() {
  // Baseline loop — ready for WiFi, NETPIE MQTT, and STM32 UART bridge
}