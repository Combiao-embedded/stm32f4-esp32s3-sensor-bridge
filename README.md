# STM32F4 & ESP32-S3 Sensor Bridge

[![Build STM32F4 Firmware](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-stm32f4.yml/badge.svg)](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-stm32f4.yml)
[![Build ESP32-S3 Firmware](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-esp32s3.yml/badge.svg)](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-esp32s3.yml)

Dual-microcontroller embedded system where an **STM32F4** handles real-time sensor reading and actuator control, while an **ESP32-S3** acts as a wireless WiFi bridge for remote monitoring and control.

---

## System Architecture

```text
+--------------------+          +--------------------+          +--------------------+
| Sensors / Actuators|          |      STM32F4       |   UART   |      ESP32-S3      |
|--------------------|  GPIO /  |--------------------| (115200) |--------------------|
| • KY-021 (Reed)    | -------> | • Sensor Polling   | =======> | • Packet Parser    | ----> WiFi / Cloud
| • KY-012 (Buzzer)  | <------- | • PWM / GPIO Ctrl  | <======= | • WiFi / MQTT      | <---- Remote Cmds
| • KY-016 (RGB LED) |   PWM    |                    |          |                    |
+--------------------+          +--------------------+          +--------------------+
```

---

## Hardware Components

| Component | Module | Role |
| :--- | :--- | :--- |
| **Main MCU** | STM32F4 | Real-time sensor acquisition & actuator control |
| **WiFi Co-Processor** | ESP32-S3 | UART-to-WiFi gateway & cloud communication |
| **Magnetic Sensor** | KY-021 | Mini magnetic reed switch module (digital input) |
| **Buzzer** | KY-012 | Active piezoelectric buzzer (digital output) |
| **Status LED** | KY-016 | 3-color RGB LED module (3-channel PWM output) |

---

## Repository Structure

| Path | Description |
| :--- | :--- |
| [`firmware-stm32f4/`](./firmware-stm32f4/README.md) | STM32F4 firmware source code, sensor drivers, and build guide |
| [`firmware-esp32s3/`](./firmware-esp32s3/README.md) | ESP32-S3 WiFi bridge firmware and local credential setup |
| [`docs/wiring-pinout.md`](./docs/wiring-pinout.md) | GPIO pin assignments, UART wiring, and JSON packet protocol |
| [`.github/workflows/`](./.github/workflows/) | Automated GitHub Actions CI build checks for both MCUs |

---

## Quick Start for Teammates

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge.git](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge.git)
   cd stm32f4-esp32s3-sensor-bridge
   ```
2. **Verify wiring:** Review [`docs/wiring-pinout.md`](./docs/wiring-pinout.md) before powering on the boards (3.3V logic only).
3. **Create a feature branch:** Never push directly to `main`.
   ```bash
   git checkout -b feat/<stm32-or-esp32>-<task-name>
   ```
4. **Build & Flash:** Follow the toolchain instructions in [`firmware-stm32f4/README.md`](./firmware-stm32f4/README.md) or [`firmware-esp32s3/README.md`](./firmware-esp32s3/README.md).

---

## Team Members

| Role | Member | GitHub |
| :--- | :--- | :--- |
| **STM32F4 Developer 1** | Name 1 | `@username1` |
| **STM32F4 Developer 2** | Name 2 | `@username2` |
| **ESP32-S3 Developer 1** | Name 3 | `@username3` |
| **ESP32-S3 Developer 2** | Name 4 | `@username4` |
