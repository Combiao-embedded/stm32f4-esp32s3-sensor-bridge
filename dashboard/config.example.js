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
  // Leave empty ("") to read the shadow of the device above instead
  // (handy when testing with a single device).
  deviceAlias: "",

  // The ESP32 subscribes to @msg/<commandTopic>.
  commandTopic: "cmd",

  // Realtime: the page connects to wss://mqtt.netpie.io/mqtt with the Client ID
  // above and listens on @msg/<stateTopic>. The board must publish its state
  // there too (as well as to the shadow). MQTT allows one connection per
  // Client ID, so the dashboard needs its own device, not the ESP32's.
  realtime: true,
  stateTopic: "state",

  pollMs: 2000,              // REST polling when realtime is off; keep this >= 1000
};
