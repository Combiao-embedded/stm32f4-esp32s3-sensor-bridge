// Copy this file to config.js (same folder) and fill in your values.
// config.js is ignored by git: never commit a real token, the repo is public.
//
// Leave mode as "mock" to run against a simulated board with no cloud.
window.DASHBOARD_CONFIG = {
  mode: "mock",              // "mock" or "netpie"

  // NETPIE 2020 credentials of the *dashboard* device (not the ESP32's).
  // Both devices must be in the same Device Group.
  clientId: "YOUR_DASHBOARD_CLIENT_ID",
  token: "YOUR_DASHBOARD_TOKEN",

  // Alias of the ESP32 device whose shadow holds the board state.
  deviceAlias: "YOUR_ESP32_ALIAS",

  // The ESP32 subscribes to @msg/<commandTopic>.
  commandTopic: "cmd",

  pollMs: 2000,              // NETPIE rate-limits requests; keep this >= 1000
};
