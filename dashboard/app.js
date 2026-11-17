/*
 * Door Guard dashboard.
 *
 * The page never talks to the board directly. It reads the latest state from
 * the NETPIE device shadow and sends commands as NETPIE messages; the ESP32
 * relays them to the STM32 over UART. With no credentials configured it runs
 * against a simulated board so the UI can be built and demoed offline.
 *
 * State the page expects (shadow "data"):
 *   { reed: 0|1, alarm: 0|1, buzzer: 0|1, rgb: [r,g,b], seq?: number }
 * "reed_state" is accepted as an alias of "reed". Every other field is
 * optional: if the board does not report "alarm", the page latches the
 * alarm itself when the door opens and clears it on Acknowledge.
 * Commands it sends (JSON text on the command topic):
 *   { buzzer: 0|1 }   { rgb: [r,g,b] }   { ack: 1 }
 */

const CFG = Object.assign(
  {
    mode: "mock",            // "mock" or "netpie"
    clientId: "",
    token: "",
    deviceAlias: "",         // alias of the ESP32 device in the same NETPIE group
    commandTopic: "cmd",     // ESP32 subscribes to @msg/<commandTopic>
    pollMs: 2000,
    offlineAfterMs: 10000,
    commandTimeoutMs: 6000,
  },
  window.DASHBOARD_CONFIG || {}
);

const $ = (id) => document.getElementById(id);
const clamp = (v) => Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
const sameRgb = (a, b) => a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
const isLit = (rgb) => Array.isArray(rgb) && rgb.some((v) => v > 0);
const toHex = (rgb) => "#" + rgb.map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const clock = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

/* ------------------------------------------------------------------ */
/* Transports                                                          */
/* ------------------------------------------------------------------ */

/** Talks to NETPIE 2020 over its REST API. */
function netpieTransport() {
  const base = "https://api.netpie.io/v2/device";
  const auth = { Authorization: `Device ${CFG.clientId}:${CFG.token}` };
  return {
    label: "NETPIE",
    async getState() {
      const url = `${base}/shadow/data?alias=${encodeURIComponent(CFG.deviceAlias)}`;
      const res = await fetch(url, { headers: auth, cache: "no-store" });
      if (!res.ok) throw new Error(`Shadow read failed (${res.status})`);
      const json = await res.json();
      return json.data || {};
    },
    async send(cmd) {
      const url = `${base}/message?topic=${encodeURIComponent(CFG.commandTopic)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { ...auth, "Content-Type": "text/plain" },
        body: JSON.stringify(cmd),
      });
      if (!res.ok) throw new Error(`Command failed (${res.status})`);
    },
  };
}

/** Simulated board that follows the same rules the STM32 firmware should. */
function mockTransport() {
  const s = { reed: 0, alarm: 0, buzzer: 0, rgb: [0, 255, 0], seq: 0 };
  let saved = null; // user settings to restore after the alarm is acknowledged
  const later = (fn) => setTimeout(fn, 250 + Math.random() * 350);

  return {
    label: "Demo",
    async getState() {
      s.seq += 1;
      return JSON.parse(JSON.stringify(s));
    },
    async send(cmd) {
      later(() => {
        if (cmd.ack && s.alarm) {
          s.alarm = 0;
          if (saved) Object.assign(s, saved);
          saved = null;
          return;
        }
        if (s.alarm) return; // firmware ignores manual control while alarming
        if ("buzzer" in cmd) s.buzzer = cmd.buzzer ? 1 : 0;
        if (Array.isArray(cmd.rgb)) s.rgb = cmd.rgb.map(clamp);
      });
    },
    setDoor(open) {
      s.reed = open ? 1 : 0;
      if (open && !s.alarm) {
        saved = { buzzer: s.buzzer, rgb: s.rgb.slice() };
        s.alarm = 1;
        s.buzzer = 1;
        s.rgb = [255, 0, 0];
      }
    },
    isDoorOpen: () => s.reed === 1,
  };
}

let transport;
if (CFG.mode === "netpie" && CFG.clientId && CFG.token && CFG.deviceAlias) {
  transport = netpieTransport();
} else {
  transport = mockTransport();
}
const isMock = !!transport.setDoor;

/* ------------------------------------------------------------------ */
/* UI state                                                            */
/* ------------------------------------------------------------------ */

const ui = {
  state: null,            // last state reported by the board
  lastOkAt: 0,            // last successful cloud read
  lastSeq: undefined,
  lastSeqChangeAt: 0,
  doorSince: 0,
  alarmSince: 0,
  lastColor: [0, 255, 0], // colour to restore when the light is switched back on
  pending: null,          // { key, want, label, deadline }
  boardAlarm: false,      // true when the board itself reports "alarm"
  localAlarm: false,      // page-side alarm used when the board does not report one
};

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

function log(text, kind = "") {
  const list = $("log");
  list.querySelector(".empty")?.remove();
  const li = document.createElement("li");
  li.dataset.kind = kind;
  li.innerHTML = `<time>${clock(Date.now())}</time><span></span>`;
  li.querySelector("span").textContent = text;
  list.prepend(li);
  while (list.children.length > 50) list.lastChild.remove();
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function render() {
  const s = ui.state;
  const p = ui.pending;
  const alarm = !!(s && s.alarm);

  // Door
  const door = !s ? "unknown" : s.reed ? "open" : "closed";
  $("door-card").dataset.door = door;
  $("door-state").textContent = door === "unknown" ? "—" : door.toUpperCase();
  $("door-since").textContent = ui.doorSince ? `since ${clock(ui.doorSince)}` : "";

  // Alarm banner
  $("alarm").hidden = !alarm;
  $("alarm-time").textContent = alarm ? `at ${clock(ui.alarmSince)}` : "";
  const note = $("alarm-note"); // may be missing if the browser cached an older index.html
  if (note) note.textContent = ui.boardAlarm
    ? "The light and buzzer are alerting. Controls are locked until you acknowledge."
    : "Press Acknowledge to dismiss.";
  $("ack-btn").disabled = !!(p && p.key === "alarm");
  document.title = alarm ? "⚠ Door opened · Door Guard" : "Door Guard";

  // Light
  const rgb = p && p.key === "rgb" ? p.want : s ? s.rgb : [0, 0, 0];
  const lit = isLit(rgb);
  $("light-toggle").checked = lit;
  $("light-toggle").disabled = !s || alarm;
  $("bulb").style.setProperty("--glow", lit ? toHex(rgb) : "transparent");
  $("light-label").textContent = lit ? `On · ${toHex(rgb).toUpperCase()}` : "Off";
  $("swatches").classList.toggle("locked", !s || alarm);
  for (const b of document.querySelectorAll(".swatch[data-rgb]")) {
    b.setAttribute("aria-pressed", String(lit && sameRgb(b.dataset.rgb.split(",").map(Number), rgb)));
  }
  if (lit && document.activeElement !== $("color-input")) $("color-input").value = toHex(rgb);

  // Buzzer
  const buzz = p && p.key === "buzzer" ? p.want : s ? s.buzzer : 0;
  $("buzzer-toggle").checked = !!buzz;
  $("buzzer-toggle").disabled = !s || alarm;
  $("sound-state").dataset.on = buzz ? "1" : "0";
  $("sound-label").textContent = buzz ? (alarm ? "Alarm sounding" : "Buzzing") : "Silent";

  // Connection pill
  const conn = $("conn");
  if (isMock) {
    conn.dataset.state = "demo";
    $("conn-text").textContent = "Demo (simulated board)";
  } else if (!ui.lastOkAt || Date.now() - ui.lastOkAt > CFG.offlineAfterMs) {
    conn.dataset.state = "offline";
    $("conn-text").textContent = ui.lastOkAt ? "Cloud unreachable" : "Connecting…";
  } else if (ui.lastSeq !== undefined && Date.now() - ui.lastSeqChangeAt > CFG.offlineAfterMs) {
    conn.dataset.state = "offline";
    $("conn-text").textContent = "Board offline";
  } else {
    conn.dataset.state = "online";
    $("conn-text").textContent = `Online · ${clock(ui.lastOkAt)}`;
  }

  // Demo button
  if (isMock) $("demo-door").textContent = transport.isDoorOpen() ? "Close door (bring magnet back)" : "Open door (remove magnet)";
}

/* ------------------------------------------------------------------ */
/* State updates                                                       */
/* ------------------------------------------------------------------ */

function applyState(raw) {
  const prev = ui.state;
  const now = Date.now();
  const reed = Number(raw.reed ?? raw.reed_state) ? 1 : 0;

  ui.boardAlarm = "alarm" in raw;
  let alarm;
  if (ui.boardAlarm) {
    alarm = raw.alarm ? 1 : 0;
  } else {
    if (reed && (!prev || !prev.reed)) ui.localAlarm = true; // door just opened
    alarm = ui.localAlarm ? 1 : 0;
  }

  const next = {
    reed,
    alarm,
    buzzer: raw.buzzer ? 1 : 0,
    rgb: Array.isArray(raw.rgb) ? raw.rgb.map(clamp) : [0, 0, 0],
    seq: raw.seq,
  };

  if (next.seq !== ui.lastSeq) {
    ui.lastSeq = next.seq;
    ui.lastSeqChangeAt = now;
  }

  if (!prev) {
    ui.doorSince = now;
    if (next.alarm) ui.alarmSince = now;
    log(`Connected to ${transport.label}. Door is ${next.reed ? "open" : "closed"}.`);
  } else {
    if (prev.reed !== next.reed) {
      ui.doorSince = now;
      log(next.reed ? "Door opened" : "Door closed", next.reed ? "alarm" : "ok");
    }
    if (!prev.alarm && next.alarm) {
      ui.alarmSince = now;
      log(ui.boardAlarm ? "Alarm triggered — light and buzzer on" : "Alarm triggered", "alarm");
      notify();
    }
    if (prev.alarm && !next.alarm) log("Alarm acknowledged", "ok");
  }

  if (!next.alarm && isLit(next.rgb)) ui.lastColor = next.rgb;
  ui.state = next;
  settlePending();
  render();
}

function settlePending() {
  const p = ui.pending;
  if (!p || !ui.state) return;
  const s = ui.state;
  const done =
    (p.key === "buzzer" && s.buzzer === p.want) ||
    (p.key === "rgb" && sameRgb(s.rgb, p.want)) ||
    (p.key === "alarm" && s.alarm === 0);
  if (done) {
    ui.pending = null;
    toast(null);
    if (p.label) log(p.label);
  } else if (Date.now() > p.deadline) {
    ui.pending = null;
    toast("The board did not confirm the change", true);
    log(`No confirmation: ${p.label || p.key}`, "alarm");
  }
}

/* ------------------------------------------------------------------ */
/* Commands                                                            */
/* ------------------------------------------------------------------ */

async function command(cmd, key, want, label) {
  ui.pending = { key, want, label, deadline: Date.now() + CFG.commandTimeoutMs };
  toast("Sending…");
  render();
  try {
    await transport.send(cmd);
    setTimeout(poll, isMock ? 700 : 800);
  } catch (err) {
    ui.pending = null;
    toast(err.message, true);
    log(err.message, "alarm");
    render();
  }
}

function setLight(rgb) {
  rgb = rgb.map(clamp);
  command({ rgb }, "rgb", rgb, isLit(rgb) ? `Light set to ${toHex(rgb).toUpperCase()}` : "Light turned off");
}

$("light-toggle").addEventListener("change", (e) => {
  setLight(e.target.checked ? ui.lastColor : [0, 0, 0]);
});

$("swatches").addEventListener("click", (e) => {
  const b = e.target.closest(".swatch[data-rgb]");
  if (!b) return;
  const rgb = b.dataset.rgb.split(",").map(Number);
  ui.lastColor = rgb;
  setLight(rgb);
});

// "change" fires once when the picker closes, so dragging does not flood the cloud.
$("color-input").addEventListener("change", (e) => {
  const rgb = fromHex(e.target.value);
  ui.lastColor = rgb;
  setLight(rgb);
});

$("buzzer-toggle").addEventListener("change", (e) => {
  const on = e.target.checked ? 1 : 0;
  command({ buzzer: on }, "buzzer", on, on ? "Buzzer turned on" : "Buzzer turned off");
});

$("ack-btn").addEventListener("click", () => {
  if (ui.boardAlarm) {
    command({ ack: 1 }, "alarm", 0, null);
    return;
  }
  // The board does not report "alarm": clear the page-side alarm now and
  // still tell the board, in case its firmware handles {"ack":1}.
  ui.localAlarm = false;
  if (ui.state) {
    ui.state = { ...ui.state, alarm: 0 };
    log("Alarm acknowledged", "ok");
    render();
  }
  transport.send({ ack: 1 }).catch(() => {});
});

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

function notify() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Door opened", { body: "Door Guard alarm is active.", tag: "door-guard" });
  }
}

function syncNotifyButton() {
  const btn = $("notify-btn");
  if (!("Notification" in window)) { btn.hidden = true; return; }
  btn.disabled = Notification.permission !== "default";
  btn.textContent =
    Notification.permission === "granted" ? "Notifications on" :
    Notification.permission === "denied" ? "Notifications blocked" : "Enable notifications";
}

$("notify-btn").addEventListener("click", async () => {
  await Notification.requestPermission();
  syncNotifyButton();
});

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

let toastTimer;
function toast(text, isError = false) {
  const el = $("pending");
  clearTimeout(toastTimer);
  if (!text) { el.hidden = true; return; }
  el.textContent = text;
  el.classList.toggle("error", isError);
  el.hidden = false;
  if (isError) toastTimer = setTimeout(() => (el.hidden = true), 4000);
}

/* ------------------------------------------------------------------ */
/* Polling loop                                                        */
/* ------------------------------------------------------------------ */

let pollTimer;
let lastError = "";
async function poll() {
  clearTimeout(pollTimer);
  try {
    const data = await transport.getState();
    ui.lastOkAt = Date.now();
    lastError = "";
    applyState(data);
  } catch (err) {
    if (err.message !== lastError) log(err.message, "alarm");
    lastError = err.message;
    settlePending();
    render();
  }
  pollTimer = setTimeout(poll, CFG.pollMs);
}

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

$("log").innerHTML = '<li class="empty">No activity yet.</li>';
syncNotifyButton();

if (isMock) {
  $("demo").hidden = false;
  $("demo-door").addEventListener("click", () => {
    transport.setDoor(!transport.isDoorOpen());
    poll();
  });
  if (CFG.mode === "netpie") log("NETPIE credentials missing in config.js — using the simulated board.", "alarm");
}

render();
poll();
