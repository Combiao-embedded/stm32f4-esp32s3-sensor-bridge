# IoT Cloud Dashboard & UI

This directory stores the user interface and cloud visualization assets for the STM32F4 & ESP32-S3 Sensor Bridge.

## Planned Features
- **Live Status Display:** Real-time state indicator for the KY-021 magnetic reed switch (`OPEN` / `CLOSED`).
- **Remote Actuator Controls:**
  - Toggle switch for the KY-012 active buzzer.
  - RGB color picker / sliders (`0–255`) for the KY-016 RGB LED.
- **Alert Mode Toggle:** Switch between automatic local alarm mode (triggered on STM32 when reed switch opens) and manual remote override.
