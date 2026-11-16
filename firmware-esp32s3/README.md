# ESP32-S3 Firmware — WiFi Bridge

Acts as the wireless gateway between the STM32F4 microcontroller and the cloud/dashboard over WiFi.

## Team Owners
* **Developer 3:** `@github-username-3`
* **Developer 4:** `@github-username-4`

## Responsibilities
* **UART Bridge:** Receive sensor packets from the STM32F4 and forward remote control commands (buzzer/RGB) back to the STM32F4.
* **WiFi Manager:** Maintain stable WiFi connection with automatic reconnect handling.
* **Cloud / API Client:** Publish telemetry and subscribe to control payloads via MQTT / HTTP.

## Local Setup (WiFi Credentials)
Before building, create a local `secrets.h` file inside your source directory (this file is ignored by Git so passwords are never uploaded):

```c
#pragma once
#define WIFI_SSID     "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"