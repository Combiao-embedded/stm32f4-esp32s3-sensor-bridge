# AI Assistant & Developer Guidelines

This repository contains firmware and dashboard code for a dual-microcontroller IoT sensor bridge:
- `firmware-stm32f4/` — STM32F4 firmware (reads KY-021 reed switch, drives KY-012 buzzer & KY-016 RGB LED, executes local state logic, communicates via UART).
- `firmware-esp32s3/` — ESP32-S3 firmware (UART-to-WiFi cloud gateway for telemetry and remote commands).
- `dashboard/` — Cloud dashboard configuration (NETPIE Freeboard) or web UI source files.
- `docs/wiring-pinout.md` — Source of truth for GPIO pinouts, baud rate (`115200 8N1`), and UART JSON packet formats.

## Hard Rules for Code Generation
1. **Respect Folder Boundaries:** Only modify files inside `firmware-stm32f4/` for STM32 tasks, `firmware-esp32s3/` for ESP32 tasks, and `dashboard/` for UI tasks.
2. **Never Break the UART Contract:** Do not rename or alter JSON keys (`"reed"`, `"buzzer"`, `"rgb"`) without updating `docs/wiring-pinout.md` and both MCU parsers in the same Pull Request.
3. **Never Hardcode WiFi or Cloud Secrets:** On the ESP32-S3, always `#include "secrets.h"` (copied from `secrets.h.example`) for WiFi and cloud credentials. Never commit real keys or tokens.
4. **Use Current Cloud APIs:** If integrating NETPIE, strictly use the **NETPIE 2020** MQTT/REST API (`broker.netpie.io` with Client ID, Token, and Secret) — never deprecated legacy NETPIE microgear APIs.
5. **Embedded & On-Device Processing Best Practices:**
   - Include genuine processing on both MCUs (e.g., input debouncing and local alert state transitions on STM32F4; JSON validation and telemetry throttling on ESP32-S3), not raw byte pass-through.
   - Avoid long blocking delays inside main loops or interrupt callbacks (`HAL_UART_RxCpltCallback`, `EXTI`); set flags and process in the main loop or RTOS task.
   - Keep KY-016 RGB PWM duty cycle values clamped to `0–255` and assume 3.3V logic only.
6. **Respect STM32CubeMX Sections:** When editing STM32CubeIDE generated files (`main.c`, `main.h`), place all custom code strictly inside `/* USER CODE BEGIN ... */` and `/* USER CODE END ... */` blocks.

## Git & Commit Conventions
- Never commit directly to `main` or `dev`; open Pull Requests from `feat/<area>-<task>` branches.
- Use Conventional Commits: `feat(stm32): ...`, `feat(esp32): ...`, `feat(ui): ...`, `fix(uart): ...`, or `docs: ...`.
