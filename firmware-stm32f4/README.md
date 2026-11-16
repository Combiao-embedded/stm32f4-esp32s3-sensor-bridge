# STM32F4 Firmware — Sensor & Actuator Node

Handles real-time hardware interfacing for the **KY-021**, **KY-012**, and **KY-016** modules and communicates state/commands with the ESP32-S3 over UART.

## Team Owners
* **Developer 1:** `@github-username-1`
* **Developer 2:** `@github-username-2`

## Responsibilities
* **KY-021 (Magnetic Reed Switch):** Read digital state (interrupt or polling) to detect magnet presence.
* **KY-012 (Active Buzzer):** Trigger audible alerts based on sensor events or remote commands from the ESP32-S3.
* **KY-016 (RGB LED):** Drive 3 PWM channels (`R`, `G`, `B`) for status indication and color control.
* **UART Bridge:** Send formatted sensor telemetry to the ESP32-S3 and parse incoming control commands.

## Build & Flash Instructions
1. Open the `.ioc` / project file in **STM32CubeIDE** (or your configured toolchain).
2. Build the project (`Ctrl + B` / `Cmd + B`).
3. Connect the ST-Link programmer and click **Run / Debug** to flash the STM32F4.

## Folder Layout
* `Core/Inc/` — Header files (`ky021.h`, `ky012.h`, `ky016.h`, `uart_bridge.h`)
* `Core/Src/` — Source files and `main.c`