# Door Guard — Web Dashboard

A single-page web dashboard for the STM32F4 & ESP32-S3 Sensor Bridge. Plain HTML, CSS and JavaScript: no build step and no dependencies.

## Features
- **Door status:** live `OPEN` / `CLOSED` from the KY-021 reed switch.
- **Alarm:** when the door opens, a banner appears, the tab title changes, and (if allowed) a browser notification is shown. The board turns the light red and the buzzer on. Both stay on until someone presses **Acknowledge**.
- **Light (KY-016):** on/off switch, 8 preset colours and a custom colour picker. Turning the light back on restores the last colour.
- **Buzzer (KY-012):** on/off switch.
- **Activity log:** door, alarm and command history.
- **Connection status:** Online / Board offline / Cloud unreachable, or Demo.
- Manual controls are locked while the alarm is active.
- A control shows "Sending…" until the board's reported state confirms the change. If no confirmation arrives within 6 s, an error appears.

## How it connects

```text
Browser (app.js) ──fetch PUT /message──> NETPIE ──@msg/cmd──> ESP32 ──UART──> STM32
Browser (app.js) <──fetch GET /shadow── NETPIE <──shadow───── ESP32 <──UART── STM32
```

Commands are sent as a full state packet, for example `{"data":{"reed_state":1,"buzzer":1,"rgb":[0,255,0],"ack":0}}`.

The shadow can be as small as `{"reed_state": 1}` (`reed` and `reed_state` both work). If the board does not report `alarm`, the page raises the alarm itself when the door opens and clears it when you press Acknowledge.

### Realtime updates
The page also connects to NETPIE over **MQTT on WebSocket** (`wss://mqtt.netpie.io/mqtt`). It listens on `@msg/state` and updates the moment a message arrives. Commands go out over MQTT as well. REST polling stays on as a slow backup (every 15 s) and speeds up to every 2 s if realtime drops. For realtime to work:
- The board (ESP32) must publish its state to `@msg/state`, in addition to `@shadow/data/update`.
- The dashboard must use **its own device** in the same Device Group. MQTT allows one connection per Client ID. If the page detects that its ID is in use elsewhere, it stops realtime and falls back to polling.

The page uses the NETPIE 2020 REST API (`https://api.netpie.io/v2/device`). The API allows browser requests (CORS `*`). The packet format is in [`docs/wiring-pinout.md`](../docs/wiring-pinout.md#4-dashboard-additions-proposed--needs-stm32--esp32-sign-off).

## Run it

1. Copy the config template (only needed for the real board):
   ```bash
   cp config.example.js config.js
   ```
2. Start a local server in this folder:
   ```bash
   python3 -m http.server 8000
   ```
3. Open <http://localhost:8000>.

Without a `config.js`, or with `mode: "mock"`, the page runs against a **simulated board**. Use the "Open door" button at the bottom to test the alarm with no hardware.

## Connect to NETPIE

In the NETPIE portal:
1. Create a device for the dashboard (separate from the ESP32 device).
2. Put both devices in the **same Device Group**. Devices in different groups cannot see each other.
3. In `config.js`, set `mode: "netpie"` and fill in the dashboard's `clientId` and `token`, plus the ESP32's `deviceAlias`.

> `config.js` is git-ignored. Never commit a real token: this repository is public. For the same reason, do not host this page publicly with a token inside it.

## Files

| File | Purpose |
| :--- | :--- |
| `index.html` | Page structure |
| `style.css` | Styling (light and dark mode, mobile layout) |
| `app.js` | Polling, rendering, commands, NETPIE and simulated transports |
| `config.example.js` | Config template (committed) |
| `config.js` | Your real config (not committed) |
