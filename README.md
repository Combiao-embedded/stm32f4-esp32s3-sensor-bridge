# STM32F4 & ESP32-S3 IoT Sensor Bridge

[![Build STM32F4 Firmware](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-stm32f4.yml/badge.svg)](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-stm32f4.yml)
[![Build ESP32-S3 Firmware](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-esp32s3.yml/badge.svg)](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge/actions/workflows/build-esp32s3.yml)

Dual-microcontroller IoT system where an **STM32F4** performs real-time sensor acquisition, debouncing, and local actuator control, while an **ESP32-S3** acts as a UART-to-WiFi cloud bridge for remote monitoring and control.

---

## System Architecture

```text
+--------------------+          +--------------------+          +--------------------+          +------------------+
| Sensors / Actuators|          |      STM32F4       |   UART   |      ESP32-S3      |   WiFi   | Cloud & Dashboard|
|--------------------|  GPIO /  |--------------------| (115200) |--------------------|  MQTT /  |------------------|
| • KY-021 (Reed)    | -------> | • Debounce & State | =======> | • JSON Parser      | =======> | • NETPIE / Cloud |
| • KY-012 (Buzzer)  | <------- | • Local Alert Logic| <======= | • Rate Limiting    | <======= | • Web UI Control |
| • KY-016 (RGB LED) |   PWM    | • PWM / GPIO Ctrl  |          | • WiFi Reconnect   |          |                  |
+--------------------+          +--------------------+          +--------------------+          +------------------+
```

---

## Hardware & Cloud Components

| Component | Module / Platform | Role |
| :--- | :--- | :--- |
| **Main MCU** | STM32F4 | Sensor polling, debouncing, local alert state machine, PWM control |
| **WiFi Co-Processor** | ESP32-S3 (NodeMCU) | UART packet parsing, filtering, and WiFi/cloud telemetry bridge |
| **Magnetic Sensor** | KY-021 | Mini magnetic reed switch module (digital input) |
| **Buzzer** | KY-012 | Active piezoelectric buzzer (digital output) |
| **Status LED** | KY-016 | 3-color RGB LED module (3-channel PWM output) |
| **Cloud & UI** | NETPIE 2020 / Web UI | Cloud broker, telemetry visualization, and remote actuator control |

---

## Repository Structure

| Path | Description |
| :--- | :--- |
| [`firmware-stm32f4/`](./firmware-stm32f4/README.md) | STM32F4 firmware source code, sensor/actuator drivers, and build guide |
| [`firmware-esp32s3/`](./firmware-esp32s3/README.md) | ESP32-S3 WiFi/cloud bridge firmware and credential template |
| [`dashboard/`](./dashboard/README.md) | Cloud dashboard configuration and web UI assets |
| [`docs/wiring-pinout.md`](./docs/wiring-pinout.md) | GPIO pin assignments, UART wiring, and JSON packet protocol |
| [`.github/workflows/`](./.github/workflows/) | Automated GitHub Actions CI build checks for both MCUs |

---

## Quick Start for Teammates

1. **Clone the repository and switch to `dev`:**
   ```bash
   git clone [https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge.git](https://github.com/Combiao-embedded/stm32f4-esp32s3-sensor-bridge.git)
   cd stm32f4-esp32s3-sensor-bridge
   git checkout dev
   ```
2. **Verify wiring & protocol:** Review [`docs/wiring-pinout.md`](./docs/wiring-pinout.md) before powering on the boards (3.3V logic only).
3. **Create a feature branch:** Never push directly to `main` or `dev`.
   ```bash
   git checkout -b feat/<area>-<task-name>
   ```
4. **Configure local secrets:** Copy `firmware-esp32s3/secrets.h.example` to `firmware-esp32s3/secrets.h` and fill in your WiFi and cloud credentials before building.

---

## Team Members & Responsibilities

| Role | Primary Ownership | Member | GitHub |
| :--- | :--- | :--- | :--- |
| **System Architecture & Integration** | UART protocol, hardware wiring, end-to-end integration testing | Name 1 | `@username1` |
| **STM32F4 Embedded Firmware** | KY-021, KY-012, KY-016 drivers, debouncing & local state logic | Name 2 | `@username2` |
| **ESP32-S3 & Cloud Bridge** | UART JSON parser, WiFi management, NETPIE/cloud telemetry | Name 3 | `@username3` |
| **UI/UX & Project Management** | Dashboard UI, weekly MCV reports, demo & final report | Name 4 | `@username4` |
