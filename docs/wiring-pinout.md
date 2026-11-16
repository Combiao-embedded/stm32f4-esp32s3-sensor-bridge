# Hardware Wiring & UART Bridge Specification

> **Voltage Warning:** Both the **STM32F4** and **ESP32-S3** operate at **3.3V logic**. Do not feed 5V signals into any GPIO pin on either board.

---

## 1. STM32F4 Pinout (Sensors & Actuators)

| Module | Module Pin | STM32F4 Pin | Mode / Peripheral | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **KY-021** (Reed Switch) | `S` (Signal) | `[TBD - STM32 Pin]` | `GPIO_Input` (or `EXTI`) | Digital read (`0` or `1`) |
| | `+` (Middle) | `3V3` | Power | 3.3V supply |
| | `-` | `GND` | Ground | Common GND |
| **KY-012** (Active Buzzer) | `S` (Signal) | `[TBD - STM32 Pin]` | `GPIO_Output` | `HIGH` = ON, `LOW` = OFF |
| | `-` | `GND` | Ground | Common GND |
| **KY-016** (RGB LED) | `R` | `[TBD - TIM PWM]` | `TIMx_CH1` (PWM) | Red channel (0–255) |
| | `G` | `[TBD - TIM PWM]` | `TIMx_CH2` (PWM) | Green channel (0–255) |
| | `B` | `[TBD - TIM PWM]` | `TIMx_CH3` (PWM) | Blue channel (0–255) |
| | `-` | `GND` | Ground | Common cathode GND |

---

## 2. STM32F4 ↔ ESP32-S3 UART Connection

* **Baud Rate:** `115200` bps (`8N1` — 8 data bits, no parity, 1 stop bit)
* **Crossover Rule:** `TX` connects to `RX`, and `RX` connects to `TX`.

| STM32F4 Pin | ESP32-S3 Pin | Signal Direction | Notes |
| :--- | :--- | :--- | :--- |
| `[TBD - UART TX]` | `[TBD - Waiting for board]` | STM32 → ESP32 | Telemetry data |
| `[TBD - UART RX]` | `[TBD - Waiting for board]` | ESP32 → STM32 | Control commands |
| `GND` | `GND` | Shared Reference | **Must be connected together** |

---

## 3. UART Data Packet Format

All messages are newline-terminated (`\n`) JSON strings so both teams can easily debug over a serial monitor.

### STM32F4 → ESP32-S3 (Sensor Telemetry)
Sent periodically (e.g., every `500 ms`) or immediately when the KY-021 state changes:
```json
{"reed":1,"buzzer":0,"rgb":[255,0,128]}
```

### ESP32-S3 → STM32F4 (Actuator Commands)
Sent whenever a remote user updates the buzzer or LED color over WiFi:
```json
{"buzzer":1,"rgb":[0,255,0]}
```