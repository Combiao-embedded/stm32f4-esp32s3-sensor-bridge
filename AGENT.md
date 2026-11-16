# AI Assistant & Developer Guidelines

This repository contains firmware for a dual-microcontroller sensor bridge:
- `firmware-stm32f4/` — STM32F4 firmware (reads KY-021 reed switch, drives KY-012 buzzer & KY-016 RGB LED, communicates via UART).
- `firmware-esp32s3/` — ESP32-S3 firmware (UART-to-WiFi gateway for telemetry and remote commands).
- `docs/wiring-pinout.md` — Source of truth for GPIO pinouts, baud rate (`115200 8N1`), and UART JSON packet formats.

## Hard Rules for Code Generation
1. **Respect Folder Boundaries:** Only modify files inside `firmware-stm32f4/` when working on STM32 tasks, and `firmware-esp32s3/` when working on ESP32 tasks.
2. **Never Break the UART Contract:** Do not rename or alter JSON keys (`"reed"`, `"buzzer"`, `"rgb"`) without updating `docs/wiring-pinout.md` and both MCU parsers in the same Pull Request.
3. **Never Hardcode WiFi Secrets:** On the ESP32-S3, always `#include "secrets.h"` for `WIFI_SSID` and `WIFI_PASSWORD`. Never put real credentials in tracked source files.
4. **Embedded Best Practices:**
   - Avoid long blocking delays inside main loops or interrupt callbacks (`HAL_UART_RxCpltCallback`, `EXTI`); set flags and process in the main loop or RTOS task.
   - Keep KY-016 RGB PWM duty cycle values clamped to `0–255`.
   - Use 3.3V logic assumptions only.
5. **Respect STM32CubeMX Sections:** When editing STM32CubeIDE generated files (`main.c`, `main.h`), place all custom code strictly inside `/* USER CODE BEGIN ... */` and `/* USER CODE END ... */` blocks so regenerating `.ioc` files does not erase code.

## Git & Commit Conventions
- Never commit directly to `main`; work on `feat/<mcu>-<task>` branches.
- Use Conventional Commits: `feat(stm32): ...`, `feat(esp32): ...`, `fix(uart): ...`, or `docs: ...`.