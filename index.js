import { el, icon, Segment, SideTabs, VuMeter, Toast } from "./hub.js";

const STORAGE_KEYS = {
  settings: "retos-workstation-settings",
  notes: "retos-workstation-notes",
  todos: "retos-workstation-todos",
};
const DEFAULT_BROWSER_ROUTE = "retos://start";
const PDF_VIEW_HASH = "#toolbar=0&navpanes=0&view=FitH";

const APP_INFO = [
  { key: "browser", label: "Navigator", desc: "The live web through Marginalia, plus local pages and uploads.", icon: "globe" },
  { key: "player", label: "Media Deck", desc: "TP-7 style disk deck: big keys, OLED counter, drag-in tapes.", icon: "disc" },
  { key: "settings", label: "Settings", desc: "Theme, wallpaper, audio defaults, and startup layout.", icon: "gear" },
  { key: "manual", label: "PDF Viewer", desc: "A clean PDF viewer. Load a file or drop one in.", icon: "doc" },
  { key: "notes", label: "Notes", desc: "Multi-file pad: markdown and live TeX preview, folder import.", icon: "pencil" },
  { key: "pomodoro", label: "Pomodoro", desc: "Focus timer with quick task loading.", icon: "clock" },
  { key: "todo", label: "Todo", desc: "Task list with filters and persistence.", icon: "list" },
  { key: "calc", label: "Calculator", desc: "Desk calculator with a full scientific mode.", icon: "plus" },
];

const desktop = document.getElementById("desktop");
const canvas = document.getElementById("canvas");
const activeApp = document.getElementById("activeApp");
const themeLabel = document.getElementById("themeLabel");
const todayLabel = document.getElementById("todayLabel");
const toasts = document.getElementById("toasts");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const objectUrlMeta = new Map();
const objectUrls = new Set();
let browserReady = false;

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
  }[char]));
}

function routeBase(route) {
  return String(route || "").split("#")[0];
}

function rememberObjectUrl(file, kind) {
  const url = URL.createObjectURL(file);
  objectUrls.add(url);
  objectUrlMeta.set(url, { label: file.name, kind });
  return url;
}

function metaForRoute(route) {
  return objectUrlMeta.get(routeBase(route)) || null;
}

function isExternalRoute(route) {
  return /^https?:\/\//i.test(route);
}

/* Big platforms refuse to be framed (X-Frame-Options / CSP), but some keep a
   dedicated embeddable endpoint. Rewrite what can be saved... */
function rewriteEmbedRoute(route) {
  try {
    const u = new URL(route);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) { return "https://www.youtube.com/embed/" + id; }
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname.startsWith("/embed/")) { return route; }
      const id = u.pathname.startsWith("/shorts/")
        ? u.pathname.split("/")[2]
        : u.searchParams.get("v");
      if (id) { return "https://www.youtube.com/embed/" + id; }
    }
    if (host === "vimeo.com") {
      const id = u.pathname.slice(1).split("/")[0];
      if (/^\d+$/.test(id)) { return "https://player.vimeo.com/video/" + id; }
    }
  } catch (err) { /* not a parsable URL, leave it alone */ }
  return route;
}

/* ...and give the rest an honest page instead of a silently blank frame. */
const FRAME_HOSTILE_HOSTS = [
  "youtube.com", "google.com", "github.com", "x.com", "twitter.com",
  "facebook.com", "instagram.com", "reddit.com", "netflix.com",
  "spotify.com", "twitch.tv", "tiktok.com", "amazon.com", "discord.com",
];
function frameHostile(route) {
  try {
    const u = new URL(route);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if ((host === "youtube.com" || host === "youtube-nocookie.com") &&
        u.pathname.startsWith("/embed/")) { return false; }
    if (u.hostname === "player.vimeo.com" || u.hostname === "player.twitch.tv") { return false; }
    return FRAME_HOSTILE_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch (err) { return false; }
}

function isPdfRoute(route) {
  const meta = metaForRoute(route);
  return (meta && meta.kind === "pdf") || /\.pdf($|[?#])/i.test(routeBase(route));
}

function isHtmlRoute(route) {
  const meta = metaForRoute(route);
  return (meta && meta.kind === "html") || /\.(html?)($|[?#])/i.test(routeBase(route));
}

window.addEventListener("pagehide", () => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.clear();
  objectUrlMeta.clear();
});

function showToast(message, glyph = "check") {
  const toast = Toast({ icon: glyph, children: message });
  toasts.prepend(toast);
  while (toasts.children.length > 3) {
    toasts.lastElementChild.remove();
  }
  window.setTimeout(() => toast.remove(), 3800);
}

function syncClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  todayLabel.textContent = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
syncClock();
window.setInterval(syncClock, 15000);

const THEMES = [
  { id: "", label: "Paper", swatches: ["#f4f4f0", "#cfe4f7", "#171717"] },
  { id: "sunset", label: "Sunset", swatches: ["#f7e7c3", "#f2c08d", "#5a3c2d"] },
  { id: "mono", label: "Mono", swatches: ["#f2f2ee", "#b3b3ad", "#1c1c1c"] },
  { id: "night", label: "Night", swatches: ["#c2ddf1", "#7ea7c9", "#19283a"] },
  { id: "vapor", label: "Vapor", swatches: ["#ffd9de", "#a6f2ea", "#315764"] },
  { id: "dark", label: "Dark", swatches: ["#1b1d20", "#3c4048", "#f3f1e8"] },
  { id: "phosphor", label: "Phosphor", swatches: ["#03130b", "#1f7a46", "#9effbe"] },
  { id: "amber", label: "Amber", swatches: ["#120b03", "#855a12", "#ffd28c"] },
];

const defaultSettings = {
  theme: "",
  tint: "lagoon",
  wall: "grid",
  wallpaper: "",
  scanlines: true,
  shadows: true,
  boot: true,
  playerVolume: 82,
  dismissedDemos: [],
  startup: {
    browser: true,
    player: true,
    settings: false,
    manual: false,
    notes: true,
    pomodoro: true,
    todo: true,
    calc: false,
  },
};

const savedSettings = safeLoad(STORAGE_KEYS.settings, null);
const settings = Object.assign({}, defaultSettings, savedSettings || {});
settings.startup = Object.assign({}, defaultSettings.startup, settings.startup || {});

function persistSettings() {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (err) {
    // a large wallpaper can blow the storage quota; keep it for the session
  }
}

function themeName(id) {
  const theme = THEMES.find((item) => item.id === id);
  return theme ? theme.label : "Paper";
}

function setThemeTarget(node, themeId) {
  if (!node) { return; }
  if (themeId) { node.setAttribute("data-ps-theme", themeId); }
  else { node.removeAttribute("data-ps-theme"); }
}

function syncEmbeddedFrameTheme(frame) {
  let doc;
  try {
    doc = frame && frame.contentDocument;
  } catch (err) {
    return;
  }
  if (!doc || !doc.documentElement || !doc.body) { return; }
  const styles = getComputedStyle(desktop);
  const paper = styles.getPropertyValue("--ps-paper").trim() || "#ffffff";
  const ink = styles.getPropertyValue("--ps-ink").trim() || "#000000";
  setThemeTarget(doc.documentElement, settings.theme);
  setThemeTarget(doc.body, settings.theme);
  doc.documentElement.style.height = "100%";
  doc.documentElement.style.minHeight = "100%";
  doc.documentElement.style.backgroundColor = paper;
  doc.body.style.margin = "0";
  doc.body.style.height = "100%";
  doc.body.style.minHeight = "100%";
  doc.body.style.overflow = "auto";
  doc.body.style.backgroundColor = paper;
  doc.body.style.color = ink;
}

function setSwitch(btn, on) {
  btn.setAttribute("aria-checked", String(!!on));
}

function toggleSettingSwitch(btn, value) {
  setSwitch(btn, value);
  persistSettings();
}

function applyTheme(id) {
  setThemeTarget(document.documentElement, id);
  setThemeTarget(document.body, id);
  setThemeTarget(desktop, id);
  settings.theme = id;
  const label = themeName(id);
  themeLabel.textContent = "Theme: " + label;
  document.getElementById("settingsThemeName").textContent = label;
  document.querySelectorAll(".ro-themechip").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.theme === id || (!btn.dataset.theme && !id)));
  });
  browserTabFrames.forEach((frame) => syncEmbeddedFrameTheme(frame));
  syncEmbeddedFrameTheme(manualFrame);
  persistSettings();
  refreshBrowserInternal();
  // theme swaps can nudge text metrics; refit so nothing overflows by a hair
  if (typeof fitVisibleAutoWindows === "function") { fitVisibleAutoWindows(); }
}

function applyDesktopOptions() {
  desktop.dataset.tint = settings.tint;
  desktop.dataset.wall = settings.wall;
  desktop.dataset.scanlines = settings.scanlines ? "on" : "off";
  desktop.dataset.shadows = settings.shadows ? "on" : "off";
  if (settings.wallpaper) {
    desktop.style.setProperty("--ro-wallpaper", "url(" + settings.wallpaper + ")");
    desktop.dataset.customWall = "true";
  } else {
    desktop.style.removeProperty("--ro-wallpaper");
    delete desktop.dataset.customWall;
  }
  document.getElementById("tintSelect").value = settings.tint;
  document.getElementById("wallSelect").value = settings.wall;
  setSwitch(document.getElementById("scanToggle"), settings.scanlines);
  setSwitch(document.getElementById("shadowToggle"), settings.shadows);
  setSwitch(document.getElementById("bootToggle"), settings.boot);
  persistSettings();
}

const themeGrid = document.getElementById("themeGrid");
THEMES.forEach((theme) => {
  const btn = el("button", {
    class: "ro-themechip",
    type: "button",
    data: { theme: theme.id },
    "aria-pressed": "false",
  },
  el("span", { class: "ro-themechip__swatches" },
    theme.swatches.map((color) => el("i", { style: { background: color } }))),
  el("span", { class: "ro-themechip__label" }, theme.label));
  btn.addEventListener("click", () => {
    applyTheme(theme.id);
    showToast("Theme set to " + theme.label + ".", "gear");
  });
  themeGrid.appendChild(btn);
});

// the menubar theme readout jumps straight to Settings > Appearance
document.getElementById("themeLabel").addEventListener("click", () => {
  showWindow("settings");
  const firstTab = document.querySelector("#settingsTabs .ps-tab");
  if (firstTab) { firstTab.click(); }
});

document.getElementById("tintSelect").addEventListener("change", (e) => {
  settings.tint = e.target.value;
  applyDesktopOptions();
  showToast("Backdrop tint updated.", "image");
});
document.getElementById("wallSelect").addEventListener("change", (e) => {
  settings.wall = e.target.value;
  applyDesktopOptions();
  showToast("Desk pattern updated.", "window");
});
const wallFile = document.getElementById("wallFile");
const wallStatus = document.getElementById("wallStatus");
document.getElementById("wallUpload").addEventListener("click", () => wallFile.click());
wallFile.addEventListener("change", () => {
  const file = wallFile.files && wallFile.files[0];
  wallFile.value = "";
  if (!file) { return; }
  if (!/^image\//.test(file.type)) {
    showToast("Wallpapers must be images.", "caution");
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    showToast("That image is over 4 MB. Pick something smaller.", "caution");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    settings.wallpaper = String(reader.result);
    applyDesktopOptions();
    wallStatus.textContent = file.name + " set.";
    showToast("Wallpaper set.", "image");
  };
  reader.readAsDataURL(file);
});
document.getElementById("wallClear").addEventListener("click", () => {
  if (!settings.wallpaper) { return; }
  settings.wallpaper = "";
  applyDesktopOptions();
  wallStatus.textContent = "No image set; tint and pattern show through.";
  showToast("Wallpaper cleared.", "trash");
});

document.getElementById("scanToggle").addEventListener("click", () => {
  settings.scanlines = document.getElementById("scanToggle").getAttribute("aria-checked") !== "true";
  applyDesktopOptions();
});
document.getElementById("shadowToggle").addEventListener("click", () => {
  settings.shadows = document.getElementById("shadowToggle").getAttribute("aria-checked") !== "true";
  applyDesktopOptions();
});
document.getElementById("bootToggle").addEventListener("click", () => {
  settings.boot = document.getElementById("bootToggle").getAttribute("aria-checked") !== "true";
  applyDesktopOptions();
});

const windowMap = {
  browser: document.getElementById("win-browser"),
  player: document.getElementById("win-player"),
  settings: document.getElementById("win-settings"),
  manual: document.getElementById("win-manual"),
  notes: document.getElementById("win-notes"),
  pomodoro: document.getElementById("win-pomodoro"),
  todo: document.getElementById("win-todo"),
  calc: document.getElementById("win-calc"),
};

/* Cascade: the two big windows sit at the back, the small utilities land on
   top of them offset down the desk, so every titlebar is visible at boot
   even on a 900px-tall screen where overlap is unavoidable. */
const defaultLayout = {
  browser: { left: 96, top: 24, width: 720, height: 600 },
  player: { left: 850, top: 24, width: 420, height: 560 },
  settings: { left: 260, top: 110, width: 612, height: 560 },
  manual: { left: 360, top: 90, width: 702, height: 560 },
  notes: { left: 140, top: 372, width: 416, height: 392 },
  todo: { left: 580, top: 336, width: 320, height: 420 },
  pomodoro: { left: 1244, top: 330, width: 246, height: 364 },
  calc: { left: 1180, top: 320, width: 218, height: 406 },
};

/* first entry ends up on top of the stack */
const DEFAULT_STACK = ["notes", "todo", "pomodoro", "calc", "manual", "settings", "player", "browser"];
const AUTO_FIT_KEYS = new Set(["player", "settings", "notes", "calc", "pomodoro"]);
const fitQueue = new Set();
const WINDOW_Z_BASE = 200;
const WINDOW_Z_LIMIT = 90000;
const LIFT_POINTER_EVENTS = window.PointerEvent ? ["pointerdown"] : ["mousedown", "touchstart"];
let zTop = WINDOW_Z_BASE;
let fitScheduled = false;

function windowZ(win) {
  return Number.parseInt(win.style.zIndex || window.getComputedStyle(win).zIndex || "0", 10) || 0;
}

function syncWindowStates(focused) {
  Object.values(windowMap).forEach((win) => {
    win.dataset.state = !win.hidden && win === focused ? "active" : "inactive";
  });
}

function windowFromNode(node) {
  return node instanceof Element ? node.closest(".ps-window") : null;
}

function resetWindowStack() {
  DEFAULT_STACK.forEach((key, index) => {
    const win = windowMap[key];
    if (win) { win.style.zIndex = String(160 - index); }
  });
  zTop = WINDOW_Z_BASE;
}

function viewportFrame() {
  const compact = window.innerWidth < 1180;
  const rect = canvas.getBoundingClientRect();
  const top = compact ? 44 : 24;
  // the dock floats over the canvas bottom; keep windows clear of it
  const bottomInset = compact ? 88 : 96;
  const left = compact ? 12 : 24;
  const rightInset = compact ? 12 : 18;
  const heightBase = rect.height || window.innerHeight || 900;
  const widthBase = rect.width || window.innerWidth || 1280;
  const usableHeight = Math.max(320, heightBase - top - bottomInset);
  return {
    compact,
    top,
    bottom: top + usableHeight,
    left,
    right: Math.max(left + 320, widthBase - rightInset),
  };
}

function maximisedGeom() {
  const frame = viewportFrame();
  return {
    left: frame.left,
    top: frame.top,
    width: Math.max(320, frame.right - frame.left),
    height: Math.max(280, frame.bottom - frame.top),
    tx: 0,
    ty: 0,
  };
}

function clampToFrame(geom) {
  const frame = viewportFrame();
  const width = Math.min(geom.width || 320, frame.right - frame.left);
  const height = Math.min(geom.height || 280, frame.bottom - frame.top);
  return {
    left: clamp(geom.left || frame.left, frame.left, frame.right - width),
    top: clamp(geom.top || frame.top, frame.top, frame.bottom - height),
    width,
    height,
    tx: 0,
    ty: 0,
  };
}

function flushFitQueue() {
  fitScheduled = false;
  const keys = Array.from(fitQueue);
  fitQueue.clear();
  keys.forEach((key) => fitWindowToContent(key));
}

function scheduleFitWindow(key) {
  if (!AUTO_FIT_KEYS.has(key)) { return; }
  fitQueue.add(key);
  if (fitScheduled) { return; }
  fitScheduled = true;
  window.requestAnimationFrame(flushFitQueue);
}

function readGeom(win) {
  return {
    left: parseFloat(win.style.left || "0"),
    top: parseFloat(win.style.top || "0"),
    width: parseFloat(win.style.width || String(win.offsetWidth || 320)),
    height: parseFloat(win.style.height || String(win.offsetHeight || 280)),
    tx: parseFloat(win.dataset.tx || "0"),
    ty: parseFloat(win.dataset.ty || "0"),
  };
}

function setGeom(win, geom) {
  if ("left" in geom) { win.style.left = geom.left + "px"; }
  if ("top" in geom) { win.style.top = geom.top + "px"; }
  if ("width" in geom) { win.style.width = geom.width + "px"; }
  if ("height" in geom) { win.style.height = geom.height + "px"; }
  const tx = "tx" in geom ? geom.tx : parseFloat(win.dataset.tx || "0");
  const ty = "ty" in geom ? geom.ty : parseFloat(win.dataset.ty || "0");
  win.dataset.tx = String(tx);
  win.dataset.ty = String(ty);
  win.style.transform = "translate(" + tx + "px, " + ty + "px)";
}

function clearMaxState(win) {
  win.dataset.max = "false";
  delete win.dataset.restore;
}

function compactWindowStack() {
  const ordered = Object.values(windowMap).sort((a, b) => windowZ(a) - windowZ(b));
  zTop = WINDOW_Z_BASE;
  ordered.forEach((win) => { win.style.zIndex = String(++zTop); });
}

function focusWindow(win) {
  if (!win || win.hidden) { return; }
  win.style.zIndex = String(++zTop);
  if (zTop >= WINDOW_Z_LIMIT) { compactWindowStack(); }
  activeApp.textContent = win.dataset.app || "Workspace";
  syncWindowStates(win);
  syncLaunchers();
}

function topVisibleWindow() {
  return Object.values(windowMap)
    .filter((win) => !win.hidden)
    .sort((a, b) => windowZ(a) - windowZ(b))
    .pop() || null;
}

function showWindow(key) {
  const win = windowMap[key];
  if (!win) { return; }
  win.hidden = false;
  focusWindow(win);
  scheduleFitWindow(key);
}

function hideWindow(key) {
  const win = windowMap[key];
  if (!win) { return; }
  win.hidden = true;
  const next = topVisibleWindow();
  activeApp.textContent = next ? next.dataset.app : "Workspace";
  syncWindowStates(next);
  syncLaunchers();
  refreshBrowserInternal();
}

function syncLaunchers() {
  const focused = topVisibleWindow();
  document.querySelectorAll("[data-open]").forEach((btn) => {
    const key = btn.dataset.open;
    const open = windowMap[key] && !windowMap[key].hidden;
    btn.setAttribute("aria-current", focused && windowMap[key] === focused ? "page" : "false");
    btn.setAttribute("data-opened", String(open));
  });
}

function installWindowChrome(key, win) {
  const handle = win.querySelector(".ps-window__titlebar");
  handle.style.touchAction = "none";
  let drag = null;
  handle.addEventListener("pointerdown", (e) => {
    if (window.innerWidth < 1180) { return; }
    if (e.button !== 0 || e.target.closest(".ps-winbtn, button, input, select, a")) { return; }
    if (win.dataset.max === "true") { return; }
    drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: parseFloat(win.dataset.tx || "0"),
      baseY: parseFloat(win.dataset.ty || "0"),
    };
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handle.addEventListener("pointermove", (e) => {
    if (!drag || drag.pointerId !== e.pointerId) { return; }
    const tx = Math.round(drag.baseX + e.clientX - drag.startX);
    const ty = Math.round(drag.baseY + e.clientY - drag.startY);
    win.dataset.tx = String(tx);
    win.dataset.ty = String(ty);
    win.style.transform = "translate(" + tx + "px, " + ty + "px)";
  });
  function endDrag(e) {
    if (!drag || drag.pointerId !== e.pointerId) { return; }
    if (handle.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }
    drag = null;
  }
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}

/* Only the reading/writing windows resize; the utilities keep their size. */
const RESIZABLE_KEYS = new Set(["browser", "manual", "notes"]);

function installWindowResize(key, win) {
  if (!RESIZABLE_KEYS.has(key)) { return; }
  const grip = el("button", { class: "ro-resize", type: "button", "aria-label": "Resize window" });
  win.appendChild(grip);
  let rs = null;
  grip.addEventListener("pointerdown", (e) => {
    if (window.innerWidth < 1180 || win.dataset.max === "true" || e.button !== 0) { return; }
    grip.setPointerCapture(e.pointerId);
    rs = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, w: win.offsetWidth, h: win.offsetHeight };
    e.preventDefault();
    e.stopPropagation();
  });
  grip.addEventListener("pointermove", (e) => {
    if (!rs || rs.pointerId !== e.pointerId) { return; }
    const computed = window.getComputedStyle(win);
    const frame = viewportFrame();
    const minW = parseFloat(computed.minWidth) || 320;
    const minH = parseFloat(computed.minHeight) || 280;
    const width = clamp(rs.w + e.clientX - rs.x, minW, frame.right - frame.left);
    const height = clamp(rs.h + e.clientY - rs.y, minH, frame.bottom - frame.top);
    setGeom(win, { width, height });
    win.dataset.userSized = "true";
  });
  function endResize(e) {
    if (!rs || rs.pointerId !== e.pointerId) { return; }
    if (grip.hasPointerCapture(e.pointerId)) { grip.releasePointerCapture(e.pointerId); }
    rs = null;
  }
  grip.addEventListener("pointerup", endResize);
  grip.addEventListener("pointercancel", endResize);
}

function liftWindowFromTarget(target) {
  const win = windowFromNode(target);
  if (win) { focusWindow(win); }
}

function installEmbeddedFrameFocusProxy(frame) {
  if (!frame) { return; }
  const raise = () => {
    const win = frame.closest(".ps-window");
    if (win) { focusWindow(win); }
  };

  [...LIFT_POINTER_EVENTS, "focus", "focusin"].forEach((type) => {
    frame.addEventListener(type, raise, true);
  });

  frame.addEventListener("load", () => {
    try {
      const innerDoc = frame.contentWindow && frame.contentWindow.document;
      if (!innerDoc) { return; }
      [...LIFT_POINTER_EVENTS, "focusin"].forEach((type) => {
        innerDoc.addEventListener(type, raise, true);
      });
    } catch (error) {
      // Native PDF viewers and cross-origin documents cannot be instrumented directly.
    }
  });
}

function fitMaximisedWindows() {
  Object.values(windowMap).forEach((win) => {
    if (win.dataset.max !== "true") { return; }
    setGeom(win, maximisedGeom());
  });
}

function fitWindowToContent(key) {
  if (!AUTO_FIT_KEYS.has(key)) { return; }
  const win = windowMap[key];
  if (!win || win.hidden || win.dataset.max === "true") { return; }
  if (win.dataset.userSized === "true") { return; }   // a human chose this size
  const titlebar = win.querySelector(".ps-window__titlebar");
  const body = win.querySelector(".ps-window__body");
  if (!body) { return; }
  const computed = window.getComputedStyle(win);
  const frame = viewportFrame();
  const fallback = defaultLayout[key] || { left: frame.left, top: frame.top, width: 320, height: 280 };
  const geom = readGeom(win);
  // measure the real non-body chrome (titlebar + borders); a guessed floor
  // that overshoots by even a pixel turns the resize-observer loop into a
  // ratchet that grows the window every frame
  const chromeHeight = Math.max(0, win.offsetHeight - body.offsetHeight);
  void titlebar;
  const minWidth = parseFloat(computed.minWidth || "0") || fallback.width;
  const minHeight = parseFloat(computed.minHeight || "0") || fallback.height;
  // if the content genuinely overflows (font metrics settled after the last
  // fit, fractional px), grow past it with a little headroom; at rest the
  // pad is zero, so this cannot ratchet
  const overflowPad = body.scrollHeight > body.clientHeight + 1 ? 4 : 0;
  const desiredWidth = Math.ceil(Math.max(minWidth, body.scrollWidth + 2));
  const desiredHeight = Math.ceil(Math.max(minHeight, chromeHeight + body.scrollHeight + overflowPad));
  const nextWidth = Math.min(frame.right - frame.left, Math.max(fallback.width, desiredWidth));
  const nextHeight = Math.min(frame.bottom - frame.top, Math.max(fallback.height, desiredHeight));
  const nextLeft = Math.max(frame.left, Math.min(geom.left, frame.right - nextWidth));
  const nextTop = Math.max(frame.top, Math.min(geom.top, frame.bottom - nextHeight));
  if (
    nextWidth !== geom.width ||
    nextHeight !== geom.height ||
    nextLeft !== geom.left ||
    nextTop !== geom.top
  ) {
    setGeom(win, { left: nextLeft, top: nextTop, width: nextWidth, height: nextHeight });
  }
}

function fitVisibleAutoWindows() {
  AUTO_FIT_KEYS.forEach((key) => scheduleFitWindow(key));
}

function toggleMaximise(key) {
  const win = windowMap[key];
  if (!win) { return; }
  focusWindow(win);
  if (win.dataset.max === "true") {
    const saved = win.dataset.restore ? JSON.parse(win.dataset.restore) : clampToFrame(defaultLayout[key]);
    win.dataset.max = "false";
    setGeom(win, saved);
    delete win.dataset.restore;
    scheduleFitWindow(key);
    return;
  }
  win.dataset.restore = JSON.stringify(readGeom(win));
  win.dataset.max = "true";
  setGeom(win, maximisedGeom());
}

function restoreLayout(respectStartup = true) {
  resetWindowStack();
  Object.entries(windowMap).forEach(([key, win]) => {
    clearMaxState(win);
    delete win.dataset.userSized;
    setGeom(win, clampToFrame(defaultLayout[key]));
    win.hidden = respectStartup ? !settings.startup[key] : false;
  });
  const focused = topVisibleWindow() || windowMap.browser;
  if (focused) { focusWindow(focused); }
  syncLaunchers();
  refreshBrowserInternal();
  fitVisibleAutoWindows();
}

Object.entries(windowMap).forEach(([key, win]) => {
  installWindowChrome(key, win);
  installWindowResize(key, win);
});

[...LIFT_POINTER_EVENTS, "focusin"].forEach((type) => {
  document.addEventListener(type, (e) => liftWindowFromTarget(e.target), true);
});

document.addEventListener("click", (e) => {
  const closeBtn = e.target.closest("[data-close]");
  if (closeBtn) {
    e.preventDefault();
    e.stopPropagation();
    hideWindow(closeBtn.dataset.close);
    return;
  }
  const zoomBtn = e.target.closest("[data-zoom]");
  if (zoomBtn) {
    e.preventDefault();
    e.stopPropagation();
    toggleMaximise(zoomBtn.dataset.zoom);
    return;
  }
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) {
    showWindow(openBtn.dataset.open);
    return;
  }
});

window.addEventListener("resize", () => {
  fitMaximisedWindows();
  fitVisibleAutoWindows();
});

const settingsTabs = SideTabs({ tabs: ["Appearance", "Desktop", "Audio", "Startup"], selected: 0 });
document.getElementById("settingsTabs").appendChild(settingsTabs);

function selectSettingsPanel(name) {
  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== name;
  });
}
selectSettingsPanel("appearance");
settingsTabs.addEventListener("change", (e) => {
  const panel = e.detail.label.toLowerCase();
  selectSettingsPanel(panel);
  fitVisibleAutoWindows();
});

function renderStartupList() {
  const wrap = document.getElementById("startupList");
  wrap.innerHTML = "";
  APP_INFO.forEach((app) => {
    const toggle = el("button", {
      class: "ps-switch",
      type: "button",
      "aria-label": "Launch " + app.label + " on startup",
      "aria-checked": String(!!settings.startup[app.key]),
      onclick: () => {
        settings.startup[app.key] = !settings.startup[app.key];
        persistSettings();
        renderStartupList();
        refreshBrowserInternal();
      },
    }, el("span", { class: "ps-switch__knob" }));
    wrap.appendChild(el("div", { class: "ro-startup__item" },
      el("div", null,
        el("strong", null, app.label),
        el("div", { class: "ro-startup__meta" }, app.desc)),
      toggle));
  });
}

document.getElementById("startupApply").addEventListener("click", () => {
  restoreLayout(true);
  showToast("Startup layout re-applied.", "window");
});
document.getElementById("startupOpenAll").addEventListener("click", () => {
  restoreLayout(false);
  showToast("Every app opened.", "grid");
});
document.getElementById("layoutReset").addEventListener("click", () => {
  restoreLayout(true);
  showToast("Window positions reset.", "refresh");
});

/* ---------------- notes: multi-document, markdown + live TeX ------------- */

const notesTitle = document.getElementById("notesTitle");
const notesPad = document.getElementById("notesPad");
const notesStatus = document.getElementById("notesStatus");
const notesPreview = document.getElementById("notesPreview");
const notesListSeat = document.getElementById("notesList");

const NOTE_KIND_SET = new Set(["plain", "markdown", "tex", "image"]);
function kindFromName(name) {
  if (/\.(tex|sty|bib)$/i.test(name)) { return "tex"; }
  if (/\.(md|markdown)$/i.test(name)) { return "markdown"; }
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) { return "image"; }
  return "plain";
}

/* image assets imported into the notes, addressable with or without their
   extension, with or without their folder */
function findImageDoc(name) {
  const clean = String(name || "").trim();
  if (!clean) { return null; }
  return notesDocs.find((d) => d.kind === "image" &&
    (d.name === clean || d.name.endsWith("/" + clean) ||
     d.name.replace(/\.[a-z0-9]+$/i, "") === clean ||
     d.name.replace(/\.[a-z0-9]+$/i, "").endsWith("/" + clean))) || null;
}

const notesDefaultDocs = [
  {
    name: "Desk Notes.md",
    kind: "markdown",
    body: `# RetOS Workstation

- The **navigator** dials the live web through Marginalia.
- Settings persist theme, tint, wallpaper, and startup layout.
- The media deck starts with a demo playlist and accepts your own files.

Switch this pad to *TeX mode* and math like $e^{i\\pi} + 1 = 0$ starts rendering.`,
  },
  {
    name: "main.tex",
    kind: "tex",
    body: `\\section{Field notes}
The workstation renders TeX live. Inline math like $\\frac{a}{b}$ works,
and so do display equations:

$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$

\\subsection{Multi-file}
Import a folder and \\textbf{inputs resolve against it}: \\input{appendix}`,
  },
  {
    name: "appendix.tex",
    kind: "tex",
    body: `\\emph{This paragraph lives in appendix.tex} and was pulled in by the
line above. Matrices work too:

$$\\begin{aligned} x + y &= 7 \\\\ 2x - y &= 2 \\end{aligned}$$`,
  },
];

let notesDocs = notesDefaultDocs;
let notesActive = 0;
let notesPreviewOn = false;
const notesSaved = safeLoad(STORAGE_KEYS.notes, null);
if (notesSaved && Array.isArray(notesSaved.docs) && notesSaved.docs.length) {
  notesDocs = notesSaved.docs
    .filter((d) => d && typeof d.body === "string")
    .map((d) => ({
      name: String(d.name || "Untitled"),
      kind: NOTE_KIND_SET.has(d.kind) ? d.kind : kindFromName(String(d.name || "")),
      body: d.body,
    }));
  if (!notesDocs.length) { notesDocs = notesDefaultDocs; }
  notesActive = clamp(Number(notesSaved.active) || 0, 0, notesDocs.length - 1);
} else if (notesSaved && typeof notesSaved.body === "string") {
  // migrate the old single-note shape
  notesDocs = [{ name: notesSaved.title || "Desk Notes", kind: "plain", body: notesSaved.body }];
}
/* folders live in doc names ("chapters/one.tex"); the explicit list keeps
   empty folders alive, and collapsed paths persist alongside */
let notesFolders = (notesSaved && Array.isArray(notesSaved.folders))
  ? notesSaved.folders.filter((f) => typeof f === "string" && f) : [];
const notesCollapsed = new Set((notesSaved && Array.isArray(notesSaved.collapsed)) ? notesSaved.collapsed : []);
let notesFolderRenaming = null;

function activeNote() {
  return notesDocs[notesActive];
}

function persistNotes() {
  const now = new Date();
  let saved = true;
  try {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify({
      docs: notesDocs, active: notesActive,
      folders: notesFolders, collapsed: Array.from(notesCollapsed),
    }));
  } catch (err) {
    saved = false;
  }
  notesStatus.textContent = saved
    ? "Saved " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0")
    : "Too large to autosave; kept for this session.";
  refreshBrowserInternal();
  scheduleFitWindow("notes");
}

/* tiny markdown renderer: escape first, then structure */
function mdInline(t) {
  return t
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      const doc = findImageDoc(src);
      const url = doc ? doc.body : (/^https?:/.test(src) ? src : "");
      return url ? '<img class="tex-img" src="' + url + '" alt="' + alt + '">' : m;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+|#[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function mdToHtml(src) {
  const lines = escapeHtml(src).split("\n");
  const out = [];
  let para = [];
  let list = "";
  let fence = false;
  const flushPara = () => {
    if (para.length) { out.push("<p>" + mdInline(para.join(" ")) + "</p>"); para = []; }
  };
  const flushList = () => {
    if (list) { out.push("</" + list + ">"); list = ""; }
  };
  lines.forEach((line) => {
    if (/^```/.test(line)) {
      flushPara(); flushList();
      out.push(fence ? "</code></pre>" : "<pre><code>");
      fence = !fence;
      return;
    }
    if (fence) { out.push(line + "\n"); return; }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara(); flushList();
      const level = heading[1].length;
      out.push("<h" + level + ">" + mdInline(heading[2]) + "</h" + level + ">");
      return;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) { flushPara(); flushList(); out.push("<hr>"); return; }
    if (/^\s*&gt;\s?/.test(line)) {
      flushPara(); flushList();
      out.push("<blockquote>" + mdInline(line.replace(/^\s*&gt;\s?/, "")) + "</blockquote>");
      return;
    }
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const want = ul ? "ul" : "ol";
      if (list !== want) { flushList(); out.push("<" + want + ">"); list = want; }
      out.push("<li>" + mdInline((ul || ol)[1]) + "</li>");
      return;
    }
    if (!line.trim()) { flushPara(); flushList(); return; }
    para.push(line);
  });
  flushPara(); flushList();
  if (fence) { out.push("</code></pre>"); }
  return out.join("\n");
}

/* TeX preview: resolve \input{} against the imported docs, translate light
   structure to HTML, and let KaTeX pick up the math afterwards */
function resolveTexInputs(body, depth, seen) {
  if (depth >= 3) { return body; }
  return body.replace(/\\(?:input|include)\{([^}]+)\}/g, (m, name) => {
    const clean = name.trim();
    const doc = notesDocs.find((d) =>
      d.name === clean || d.name === clean + ".tex" || d.name.replace(/\.tex$/i, "") === clean ||
      d.name.endsWith("/" + clean) || d.name.endsWith("/" + clean + ".tex"));
    if (!doc || seen.has(doc)) { return "[missing " + clean + "]"; }
    seen.add(doc);
    return "\n" + resolveTexInputs(doc.body, depth + 1, seen) + "\n";
  });
}

/* balanced-brace helpers: real preambles span lines and nest braces, which
   single-line regexes cannot survive */
function texEatGroup(s, open) {
  let depth = 0;
  for (let j = open; j < s.length; j += 1) {
    if (s[j] === "{") { depth += 1; }
    else if (s[j] === "}") { depth -= 1; if (!depth) { return j + 1; } }
  }
  return s.length;
}

function stripTexCommands(s, table) {
  Object.entries(table).forEach(([name, groups]) => {
    const re = new RegExp("\\\\" + name + "\\b");
    let idx;
    while ((idx = s.search(re)) !== -1) {
      let end = idx + 1 + name.length;
      if (s[end] === "*") { end += 1; }   // starred variants take the same arguments
      let taken = 0;
      for (;;) {
        while (/\s/.test(s[end]) && taken < groups) { end += 1; }
        if (s[end] === "[") { const close = s.indexOf("]", end); end = close === -1 ? s.length : close + 1; continue; }
        if (s[end] === "{" && taken < groups) { end = texEatGroup(s, end); taken += 1; continue; }
        break;
      }
      // trailing optional (e.g. \titleformat's) may sit on the next line
      let ahead = end;
      while (/\s/.test(s[ahead]) && ahead - end < 6) { ahead += 1; }
      if (s[ahead] === "[") {
        const close = s.indexOf("]", ahead);
        end = close === -1 ? s.length : close + 1;
      }
      s = s.slice(0, idx) + s.slice(end);
    }
  });
  return s;
}

/* dimensions: 20mm stays, 0.6\textwidth → 60%, \dimexpr chains → calc() */
function texDimToCss(v) {
  const t = String(v || "").trim();
  const scaled = /^([\d.]+)\s*\\(?:line|text|column)width$/.exec(t);
  if (scaled) { return Math.round(parseFloat(scaled[1]) * 100) + "%"; }
  let out = t.replace(/\\dimexpr|\\relax/g, "").replace(/\\(?:line|text|column)width/g, "100%").trim();
  if (/^[\d.]+(mm|cm|pt|px|em|in|%)$/.test(out)) { return out; }
  if (out.includes("100%") && /[-+]/.test(out)) {
    return "calc(" + out.replace(/([-+])/g, " $1 ") + ")";
  }
  return "";
}

/* \textcolor{c}{x} and {\LARGE\bfseries x} groups become class-carrying
   spans, so the typographic hierarchy of a title page survives */
function texStyleSpans(s) {
  const tc = /\\textcolor\*?\s*\{([^}]*)\}\s*\{/;
  let m;
  while ((m = tc.exec(s))) {
    const open = m.index + m[0].length - 1;
    const close = texEatGroup(s, open);
    const cls = "tex-color-" + m[1].replace(/[^a-zA-Z0-9-]/g, "");
    s = s.slice(0, m.index) + "@@TEXFSO|" + cls + "@@" +
      s.slice(open + 1, close - 1) + "@@TEXFSC@@" + s.slice(close);
  }
  const fg = /\{\s*((?:\\(?:LARGE|Large|large|normalsize|small|footnotesize|scriptsize|tiny|bfseries|itshape|em|color\{[^}]*\})\s*)+)/;
  while ((m = fg.exec(s))) {
    const open = m.index;
    const close = texEatGroup(s, open);
    const inner = s.slice(m.index + m[0].length, close - 1);
    const classes = [];
    (m[1].match(/\\[A-Za-z]+/g) || []).forEach((sw) => {
      const name = sw.slice(1);
      if (/^(LARGE|Large|large|small|footnotesize|scriptsize|tiny)$/.test(name)) { classes.push("tex-fs-" + name); }
      else if (name === "bfseries") { classes.push("tex-bf"); }
      else if (name === "itshape" || name === "em") { classes.push("tex-it"); }
    });
    const colorM = /\\color\{([^}]*)\}/.exec(m[1]);
    if (colorM) { classes.push("tex-color-" + colorM[1].replace(/[^a-zA-Z0-9-]/g, "")); }
    s = s.slice(0, open) + "@@TEXFSO|" + classes.join(" ") + "@@" + inner + "@@TEXFSC@@" + s.slice(close);
  }
  return s;
}

/* \textcolor{ink}{content} and friends: drop the command, keep the payload */
function keepLastGroup(s, name, groups) {
  const re = new RegExp("\\\\" + name + "\\b");
  let idx;
  while ((idx = s.search(re)) !== -1) {
    let end = idx + 1 + name.length;
    if (s[end] === "*") { end += 1; }
    let last = "";
    let ok = true;
    for (let g = 0; g < groups; g += 1) {
      while (/\s/.test(s[end])) { end += 1; }
      if (s[end] !== "{") { ok = false; break; }
      const close = texEatGroup(s, end);
      last = s.slice(end + 1, close - 1);
      end = close;
    }
    if (!ok) { s = s.slice(0, idx) + s.slice(idx + 1 + name.length); continue; }
    s = s.slice(0, idx) + last + s.slice(end);
  }
  return s;
}

/* \begin{minipage}[t]{width} carries a size argument that must go with it */
function stripEnvBegin(s, env, groups) {
  const re = new RegExp("\\\\begin\\{" + env + "\\}");
  let m;
  while ((m = re.exec(s))) {
    let end = m.index + m[0].length;
    if (s[end] === "[") { const close = s.indexOf("]", end); end = close === -1 ? s.length : close + 1; }
    for (let g = 0; g < groups; g += 1) {
      while (/\s/.test(s[end])) { end += 1; }
      if (s[end] !== "{") { break; }
      end = texEatGroup(s, end);
    }
    s = s.slice(0, m.index) + s.slice(end);
  }
  return s.replace(new RegExp("\\\\end\\{" + env + "\\}", "g"), "");
}

function extractTexCommand(s, name) {
  const m = new RegExp("\\\\" + name + "\\s*\\{").exec(s);
  if (!m) { return { s, value: null }; }
  const open = m.index + m[0].length - 1;
  const end = texEatGroup(s, open);
  return { s: s.slice(0, m.index) + s.slice(end), value: s.slice(open + 1, end - 1) };
}

/* a parsed .bib file, when one is found among the notes */
let texBib = null;

function parseBibTex(src) {
  const entries = [];
  const byKey = {};
  const re = /@(\w+)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    if (/^(comment|preamble|string)$/i.test(m[1])) { continue; }
    const open = m.index + m[0].length - 1;
    const close = texEatGroup(src, open);
    const body = src.slice(open + 1, close - 1);
    const comma = body.indexOf(",");
    if (comma === -1) { re.lastIndex = close; continue; }
    const key = body.slice(0, comma).trim();
    const fields = {};
    let i = comma + 1;
    for (;;) {
      const fre = /(\w+)\s*=\s*/g;
      fre.lastIndex = i;
      const f = fre.exec(body);
      if (!f) { break; }
      let at = fre.lastIndex;
      let value;
      if (body[at] === "{") {
        const end = texEatGroup(body, at);
        value = body.slice(at + 1, end - 1);
        i = end;
      } else if (body[at] === '"') {
        const end = body.indexOf('"', at + 1);
        value = body.slice(at + 1, end === -1 ? body.length : end);
        i = end === -1 ? body.length : end + 1;
      } else {
        let end = body.indexOf(",", at);
        if (end === -1) { end = body.length; }
        value = body.slice(at, end);
        i = end;
      }
      fields[f[1].toLowerCase()] = value
        .replace(/\\"(\w)/g, (mm, c) => ({ a: "ä", o: "ö", u: "ü", A: "Ä", O: "Ö", U: "Ü" }[c] || c))
        .replace(/\\'(\w)/g, (mm, c) => ({ a: "á", e: "é", i: "í", o: "ó", u: "ú" }[c] || c))
        .replace(/\\`(\w)/g, (mm, c) => ({ a: "à", e: "è" }[c] || c))
        .replace(/[{}]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const next = body.indexOf(",", i);
      if (next === -1) { break; }
      i = next + 1;
    }
    const entry = { key, fields, num: entries.length + 1 };
    entries.push(entry);
    byKey[key] = entry;
    re.lastIndex = close;
  }
  return { entries, byKey };
}

function formatBibEntry(e) {
  const f = e.fields;
  const authors = (f.author || "").split(/\s+and\s+/).join(", ");
  const venue = f.journal || f.booktitle || f.publisher || f.howpublished || "";
  const bits = [authors, f.title, venue, f.year].filter(Boolean);
  return escapeHtml(bits.join(". ") + ".");
}

/* inline commands, applied to already-escaped text */
function texInline(t) {
  return t
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>')
    .replace(/\\textbf\{([^}]*)\}/g, "<b>$1</b>")
    .replace(/\\(?:emph|textit)\{([^}]*)\}/g, "<i>$1</i>")
    .replace(/\\texttt\{([^}]*)\}/g, "<code>$1</code>")
    .replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>")
    .replace(/\\(?:eq)?ref\{([^}]*)\}/g, '<span class="tex-ref">($1)</span>')
    .replace(/\\(?:auto)?cite\{([^}]*)\}/g, (m, keys) =>
      '<span class="tex-ref">[' + keys.split(",").map((k) => {
        const key = k.trim();
        return texBib && texBib.byKey[key] ? texBib.byKey[key].num : key;
      }).join(", ") + "]</span>")
    .replace(/\\LaTeX\\?/g, "LaTeX")
    .replace(/\\TeX\\?/g, "TeX");
}

/* captions may nest braces (\ref{...} inside), so extraction is balanced */
function extractTexCaption(block) {
  const m = /\\caption\{/.exec(block);
  if (!m) { return null; }
  const open = m.index + m[0].length - 1;
  return block.slice(open + 1, texEatGroup(block, open) - 1);
}

/* ---------------- TikZ subset → native SVG ----------------
   A real interpreter for the common core: \draw/\fill/\node/\coordinate,
   polylines, -| |-, bezier, rectangle/circle/ellipse/arc/grid, arrow tips
   (incl. arrows.meta Latex[...]), \tikzset styles with inheritance,
   \foreach (with pairs and ...), named-node edges trimmed at borders,
   pos= edge labels, definecolor/xcolor mixes. Node text renders as HTML
   in foreignObject, so KaTeX math works inside nodes. Geometry that needs
   text metrics resolves in a post-layout pass over the live DOM. */
const TIKZ_PXMM = 3.7795;
const TIKZ_NAMED = {
  red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], cyan: [0, 255, 255],
  magenta: [255, 0, 255], yellow: [255, 255, 0], orange: [255, 128, 0],
  gray: [128, 128, 128], grey: [128, 128, 128], brown: [191, 128, 64],
  lime: [191, 255, 0], olive: [128, 128, 0], pink: [255, 191, 191],
  purple: [191, 0, 64], teal: [0, 128, 128], violet: [128, 0, 128],
  darkgray: [64, 64, 64], lightgray: [191, 191, 191],
  black: [0, 0, 0], white: [255, 255, 255],
};
let tikzUid = 0;

function tikzSplitTop(str, sep) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    if ("{[(".includes(ch)) { depth += 1; }
    else if ("}])".includes(ch)) { depth -= 1; }
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; }
    else { cur += ch; }
  }
  out.push(cur);
  return out;
}

function tikzNum(expr) {
  const t = String(expr).trim();
  if (!/^[0-9+\-*/(). ]+$/.test(t) || !t) { return 0; }
  try { return Function('"use strict";return(' + t + ")")() || 0; } catch (err) { return 0; }
}

/* "4mm" → px; bare numbers scale by the picture's unit */
function tikzDim(str, unit) {
  const m = /^(.*?)(mm|cm|pt|em|ex|px)\s*$/.exec(String(str).trim());
  if (!m) { return tikzNum(str) * unit; }
  const n = tikzNum(m[1]);
  return n * ({ mm: TIKZ_PXMM, cm: TIKZ_PXMM * 10, pt: 96 / 72.27, em: 14, ex: 7, px: 1 }[m[2]]);
}

function tikzRgb(name, colors) {
  const key = name.trim();
  const own = colors && colors[key];
  if (own) {
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(own) || /#([0-9a-f]{6})/i.exec(own);
    if (m && m.length === 4) { return [Number(m[1]), Number(m[2]), Number(m[3])]; }
    if (m) { return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)]; }
  }
  return TIKZ_NAMED[key] || null;
}

function tikzColorCss(spec, colors) {
  const t = String(spec).trim();
  if (!t.includes("!")) {
    if (t === "black") { return "var(--ps-ink, #111)"; }
    if (t === "white") { return "var(--ps-paper, #fff)"; }
    const rgb = tikzRgb(t, colors);
    return rgb ? "rgb(" + rgb.join(",") + ")" : "";
  }
  // xcolor mixes: a!30 (with white), a!30!b, chained left to right
  const parts = t.split("!").map((x) => x.trim());
  let cur = tikzRgb(parts[0], colors) || [0, 0, 0];
  for (let i = 1; i < parts.length; i += 2) {
    const pct = tikzNum(parts[i]) / 100;
    const other = tikzRgb(parts[i + 1] || "white", colors) || [255, 255, 255];
    cur = cur.map((c, k) => Math.round(c * pct + other[k] * (1 - pct)));
  }
  return "rgb(" + cur.join(",") + ")";
}

function collectTikzStyles(body, into) {
  tikzSplitTop(body, ",").forEach((item) => {
    const m = /^\s*([\w\s-]+?)\s*\/\.(?:append )?style\s*=\s*\{/.exec(item);
    if (!m) { return; }
    const open = item.indexOf("{", m[1].length);
    const close = texEatGroup(item, open);
    into[m[1].trim()] = item.slice(open + 1, close - 1);
  });
}

/* option list → props; style names expand recursively, bare colors apply */
function tikzParseOpts(str, styles, colors, unit, depth = 0) {
  const props = {};
  if (depth > 5) { return props; }
  tikzSplitTop(str || "", ",").forEach((raw) => {
    const item = raw.trim();
    if (!item) { return; }
    const eq = (() => {
      let d = 0;
      for (let i = 0; i < item.length; i += 1) {
        if ("{[(".includes(item[i])) { d += 1; }
        else if ("}])".includes(item[i])) { d -= 1; }
        else if (item[i] === "=" && d === 0) { return i; }
      }
      return -1;
    })();
    if (eq === -1) {
      if (styles[item]) { Object.assign(props, tikzParseOpts(styles[item], styles, colors, unit, depth + 1)); return; }
      if (item === "dashed") { props.dash = "7 5"; return; }
      if (item === "densely dashed") { props.dash = "6 2"; return; }
      if (item === "dotted") { props.dash = "1.5 3"; return; }
      if (item === "thin") { props.lw = 0.8; return; }
      if (item === "thick") { props.lw = 2.1; return; }
      if (item === "very thick") { props.lw = 3.2; return; }
      if (item === "ultra thick") { props.lw = 4.4; return; }
      if (item === "rounded corners") { props.rounded = 6; return; }
      if (item === "circle") { props.shape = "circle"; return; }
      if (item === "midway") { props.pos = 0.5; return; }
      if (item === "near start") { props.pos = 0.25; return; }
      if (item === "near end") { props.pos = 0.75; return; }
      if (/^(above|below|left|right)( (left|right))?$/.test(item)) { props.place = item; props.dist = props.dist || 0; return; }
      if (item === "draw") { props.draw = "currentColor"; return; }
      if (item === "fill") { props.fill = "currentColor"; return; }
      if (item === "on background layer" || item === "align" ) { return; }
      // arrow spec: a bare item containing "-" at depth 0
      if (/[-]/.test(item) && !/^[\w! ]+$/.test(item)) {
        let d = 0;
        for (let i = 0; i < item.length; i += 1) {
          if ("{[".includes(item[i])) { d += 1; }
          else if ("}]".includes(item[i])) { d -= 1; }
          else if (item[i] === "-" && d === 0) {
            const head = item.slice(0, i);
            const tail = item.slice(i + 1);
            if (head) { props.arrowStart = head; }
            if (tail) { props.arrowEnd = tail; }
            return;
          }
        }
      }
      const css = tikzColorCss(item, colors);
      if (css) { props.color = css; }
      return;
    }
    const key = item.slice(0, eq).trim();
    const val = item.slice(eq + 1).trim();
    if (key === "draw") { props.draw = tikzColorCss(val, colors) || "currentColor"; }
    else if (key === "fill") { props.fill = tikzColorCss(val, colors) || "currentColor"; }
    else if (key === "color") { props.color = tikzColorCss(val, colors) || "currentColor"; }
    else if (key === "text") { props.text = tikzColorCss(val, colors) || ""; }
    else if (key === "line width") { props.lw = tikzDim(val, unit); }
    else if (key === "inner sep") { props.inner = tikzDim(val, unit); }
    else if (key === "text width") { props.textWidth = tikzDim(val, unit); }
    else if (key === "minimum width") { props.minW = tikzDim(val, unit); }
    else if (key === "minimum height") { props.minH = tikzDim(val, unit); }
    else if (key === "minimum size") { props.minW = props.minH = tikzDim(val, unit); }
    else if (key === "anchor") { props.anchor = val; }
    else if (key === "align") { props.align = val; }
    else if (key === "pos") { props.pos = tikzNum(val); }
    else if (key === "step") { props.step = tikzDim(val, unit); }
    else if (key === "rounded corners") { props.rounded = tikzDim(val, unit); }
    else if (key === "scale") { props.scale = tikzNum(val); }
    else if (key === "font") {
      const fm = /\\fontsize\{([\d.]+)\}/.exec(val);
      if (fm) { props.fontSize = tikzNum(fm[1]) * (96 / 72.27); }
      if (/\\bfseries|\\bf\b/.test(val)) { props.bold = true; }
    }
    else if (/^(above|below|left|right)( (left|right))?$/.test(key)) { props.place = key; props.dist = tikzDim(val, unit); }
    else if (key === "x") { props.unitX = tikzDim(val, 1); }
    else if (key === "y") { props.unitY = tikzDim(val, 1); }
  });
  return props;
}

/* \foreach \a/\b in {s1/s2,0,...,4} <stmt or {group}> — textual expansion */
function tikzExpandForeach(body) {
  let guard = 0;
  const re = /\\foreach\s+((?:\\[A-Za-z]+\s*\/?\s*)+)in\s*\{/;
  let m;
  while ((m = re.exec(body)) && guard < 40) {
    guard += 1;
    const vars = (m[1].match(/\\[A-Za-z]+/g) || []).map((v) => v.slice(1));
    const listOpen = m.index + m[0].length - 1;
    const listClose = texEatGroup(body, listOpen);
    let items = tikzSplitTop(body.slice(listOpen + 1, listClose - 1), ",").map((x) => x.trim());
    const dots = items.indexOf("...");
    if (dots > 0) {
      const start = tikzNum(items[0]);
      const step = dots >= 2 ? tikzNum(items[dots - 1]) - tikzNum(items[dots - 2]) || 1
        : (tikzNum(items[dots + 1]) >= start ? 1 : -1);
      const stop = tikzNum(items[dots + 1]);
      items = [];
      for (let v = start; step > 0 ? v <= stop + 1e-9 : v >= stop - 1e-9; v += step) {
        items.push(String(Math.round(v * 1e6) / 1e6));
      }
    }
    let at = listClose;
    while (/\s/.test(body[at])) { at += 1; }
    let tpl;
    let end;
    if (body[at] === "{") { end = texEatGroup(body, at); tpl = body.slice(at + 1, end - 1); }
    else { end = body.indexOf(";", at); end = end === -1 ? body.length : end + 1; tpl = body.slice(at, end); }
    const expanded = items.map((item) => {
      const vals = item.split("/").map((x) => x.trim());
      let inst = tpl;
      vars.forEach((v, i) => {
        inst = inst.replace(new RegExp("\\\\" + v + "(?![A-Za-z])", "g"), vals[i] != null ? vals[i] : vals[0]);
      });
      return inst;
    }).join("\n");
    body = body.slice(0, m.index) + expanded + body.slice(end);
  }
  return body;
}

function tikzCoordSpec(txt, ux, uy) {
  const t = txt.trim();
  if (t.includes(",")) {
    const parts = tikzSplitTop(t, ",");
    return { x: tikzDim(parts[0], ux), y: -tikzDim(parts[1] || "0", uy) };
  }
  const polar = /^([-+\d.]+)\s*:\s*(.+)$/.exec(t);
  if (polar) {
    const ang = tikzNum(polar[1]) * Math.PI / 180;
    const r = tikzDim(polar[2], ux);
    return { x: r * Math.cos(ang), y: -r * Math.sin(ang) };
  }
  const ref = /^([A-Za-z][\w]*)\s*(?:\.\s*([a-z][a-z ]*))?$/.exec(t);
  if (ref) { return { ref: ref[1], anchor: (ref[2] || "").trim() }; }
  return { x: 0, y: 0 };
}

function tikzToSvg(rawBody, pictureOpts, colors, styles) {
  tikzUid += 1;
  const uid = tikzUid;
  const gOpts = tikzParseOpts(pictureOpts, styles, colors, TIKZ_PXMM * 10);
  const scale = gOpts.scale || 1;
  const ux = (gOpts.unitX || TIKZ_PXMM * 10) * scale;
  const uy = (gOpts.unitY || TIKZ_PXMM * 10) * scale;
  let body = rawBody.replace(/\\(begin|end)\{scope\}(\[[^\]]*\])?/g, "");
  body = tikzExpandForeach(body);

  const parts = [];
  const markers = {};
  function markerId(color, size) {
    const key = color + "|" + size;
    if (!markers[key]) {
      markers[key] = "tkm" + uid + "-" + Object.keys(markers).length;
    }
    return markers[key];
  }
  function nodeHtml(text) {
    return texInline(escapeHtml(text.trim()))
      .replace(/\\\\(\[[^\]]*\])?/g, "<br>")
      .replace(/\\(bfseries|centering|small|footnotesize)\b/g, "")
      .replace(/\\([ ,;])/g, " ")
      .replace(/~/g, " ");
  }
  function attrJson(obj) { return escapeHtml(JSON.stringify(obj)); }

  function emitNode(spec) {
    const o = spec.opts;
    const style = [];
    if (o.textWidth) { style.push("width:" + Math.round(o.textWidth) + "px", "white-space:normal"); }
    else { style.push("white-space:nowrap"); }
    style.push("text-align:" + (o.align || "center"));
    const tint = o.text || o.color;
    if (tint) { style.push("color:" + tint); }
    style.push("font-size:" + Math.round(o.fontSize || 13) + "px");
    if (o.bold) { style.push("font-weight:700"); }
    const meta = {
      x: spec.x, y: spec.y, ref: spec.ref || "", refAnchor: spec.refAnchor || "",
      shape: o.shape || "rect", draw: o.draw || "", fill: o.fill || "",
      lw: o.lw || 1.2, dash: o.dash || "", inner: o.inner != null ? o.inner : 5,
      anchor: o.anchor || "", place: o.place || "", dist: o.dist || 0,
      minW: o.minW || 0, minH: o.minH || 0, rounded: o.rounded || 0,
      onPath: spec.onPath || null,
    };
    const shape = (o.draw || o.fill)
      ? (meta.shape === "circle"
        ? '<circle class="tikz-shape" cx="0" cy="0" r="1"/>'
        : '<rect class="tikz-shape" x="0" y="0" width="1" height="1"/>')
      : "";
    return '<g class="tikz-node"' + (spec.name ? ' data-name="' + escapeHtml(spec.name) + '"' : "") +
      " data-meta=\"" + attrJson(meta) + '">' + shape +
      '<foreignObject class="tikz-fo" x="0" y="0" width="900" height="500">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" class="tikz-nodetext" style="' + style.join(";") + '">' +
      nodeHtml(spec.text || "") + "</div></foreignObject></g>";
  }

  function parsePathStatement(cmd, opts, rest) {
    const ops = [];
    const labels = [];
    let i = 0;
    let lastConn = null;
    function ws() { while (i < rest.length && /\s/.test(rest[i])) { i += 1; } }
    function readParen() {
      let depth = 0;
      let j = i;
      for (; j < rest.length; j += 1) {
        if (rest[j] === "(") { depth += 1; }
        else if (rest[j] === ")") { depth -= 1; if (!depth) { break; } }
      }
      const inner = rest.slice(i + 1, j);
      i = j + 1;
      return inner;
    }
    function readBracket() {
      if (rest[i] !== "[") { return ""; }
      let depth = 0;
      let j = i;
      for (; j < rest.length; j += 1) {
        if (rest[j] === "[") { depth += 1; }
        else if (rest[j] === "]") { depth -= 1; if (!depth) { break; } }
      }
      const inner = rest.slice(i + 1, j);
      i = j + 1;
      return inner;
    }
    while (i < rest.length) {
      ws();
      if (i >= rest.length) { break; }
      let rel = 0;
      if (rest.startsWith("++", i)) { rel = 1; i += 2; }
      else if (rest[i] === "+" && rest[i + 1] === "(") { rel = 2; i += 1; }
      if (rest[i] === "(") {
        const pt = tikzCoordSpec(readParen(), ux, uy);
        pt.rel = rel;
        ops.push({ c: lastConn || (ops.length ? "line" : "start"), pt });
        lastConn = null;
        continue;
      }
      if (rest.startsWith("--", i)) {
        i += 2;
        if (rest[i] === "|") { lastConn = "hv"; i += 1; } else { lastConn = "line"; }
        continue;
      }
      if (rest.startsWith("-|", i)) { lastConn = "hv"; i += 2; continue; }
      if (rest.startsWith("|-", i)) { lastConn = "vh"; i += 2; continue; }
      if (rest.startsWith("..", i)) {
        i += 2;
        ws();
        let c1 = null;
        let c2 = null;
        if (rest.startsWith("controls", i)) {
          i += 8; ws();
          if (rest[i] === "(") { c1 = tikzCoordSpec(readParen(), ux, uy); }
          ws();
          if (rest.startsWith("and", i)) { i += 3; ws(); if (rest[i] === "(") { c2 = tikzCoordSpec(readParen(), ux, uy); } }
          ws();
          if (rest.startsWith("..", i)) { i += 2; }
        }
        ws();
        let relB = 0;
        if (rest.startsWith("++", i)) { relB = 1; i += 2; }
        if (rest[i] === "(") {
          const pt = tikzCoordSpec(readParen(), ux, uy);
          pt.rel = relB;
          ops.push({ c: "bez", c1, c2: c2 || c1, pt });
        }
        continue;
      }
      const word = /^([a-z]+)/.exec(rest.slice(i));
      if (word) {
        const kw = word[1];
        if (kw === "cycle") { ops.push({ c: "close" }); i += 5; continue; }
        if (kw === "rectangle") { i += 9; lastConn = "rect"; continue; }
        if (kw === "grid") { i += 4; ws(); const bOpt = readBracket(); const gp = tikzParseOpts(bOpt, styles, colors, ux); ws(); if (rest[i] === "(") { const pt = tikzCoordSpec(readParen(), ux, uy); ops.push({ c: "grid", pt, step: gp.step || opts.step || ux }); } continue; }
        if (kw === "circle") {
          i += 6; ws();
          if (rest[i] === "(") { ops.push({ c: "circle", r: tikzDim(readParen(), ux) }); }
          else if (rest[i] === "[") { const ro = tikzParseOpts(readBracket(), styles, colors, ux); ops.push({ c: "circle", r: ro.radius || tikzDim((/radius\s*=\s*([^,\]]+)/.exec(rest) || [0, "3"])[1], ux) }); }
          continue;
        }
        if (kw === "ellipse") {
          i += 7; ws();
          if (rest[i] === "(") {
            const spec = readParen();
            const mm2 = /(.+)\s+and\s+(.+)/.exec(spec);
            ops.push({ c: "ellipse", rx: tikzDim(mm2 ? mm2[1] : spec, ux), ry: tikzDim(mm2 ? mm2[2] : spec, uy) });
          }
          continue;
        }
        if (kw === "arc") {
          i += 3; ws();
          let spec = "";
          if (rest[i] === "(") { spec = readParen(); }
          else if (rest[i] === "[") { spec = readBracket(); }
          const am = /([-\d.]+)\s*:\s*([-\d.]+)\s*:\s*(.+)/.exec(spec);
          if (am) { ops.push({ c: "arc", a1: tikzNum(am[1]), a2: tikzNum(am[2]), r: tikzDim(am[3], ux) }); }
          continue;
        }
        if (kw === "to") {
          i += 2; ws();
          const toOpts = readBracket();
          const bend = /bend (left|right)\s*(?:=\s*([\d.]+))?/.exec(toOpts || "");
          lastConn = bend ? (bend[1] === "left" ? "bendl" : "bendr") : "line";
          continue;
        }
        if (kw === "node") {
          i += 4; ws();
          let nOpts = "";
          let nName = "";
          if (rest[i] === "[") { nOpts = readBracket(); ws(); }
          if (rest[i] === "(") { nName = readParen(); ws(); }
          if (rest[i] === "[") { nOpts = nOpts + "," + readBracket(); ws(); }
          let text = "";
          if (rest[i] === "{") {
            const close = texEatGroup(rest, i);
            text = rest.slice(i + 1, close - 1);
            i = close;
          }
          const parsed = tikzParseOpts(nOpts, styles, colors, ux);
          // between a connective and its coordinate the label rides the
          // upcoming segment; after a coordinate it rides the one just drawn
          labels.push({ atOp: lastConn != null ? ops.length : ops.length - 1, pending: lastConn != null, opts: parsed, text, name: nName });
          continue;
        }
      }
      i += 1;   // unknown token: step past
    }
    return { ops, labels };
  }

  const statements = tikzSplitTop(body, ";").map((x) => x.trim()).filter(Boolean);
  let pathIndex = 0;
  statements.forEach((st) => {
    const m = /^\\(draw|fill|filldraw|path|node|coordinate)\b\s*/.exec(st);
    if (!m) { return; }
    let rest = st.slice(m[0].length);
    let optStr = "";
    if (rest[0] === "[") {
      let depth = 0;
      let j = 0;
      for (; j < rest.length; j += 1) {
        if (rest[j] === "[") { depth += 1; }
        else if (rest[j] === "]") { depth -= 1; if (!depth) { break; } }
      }
      optStr = rest.slice(1, j);
      rest = rest.slice(j + 1);
    }
    const opts = tikzParseOpts(optStr, styles, colors, ux);
    if (m[1] === "node" || m[1] === "coordinate") {
      let name = "";
      let at = null;
      let text = "";
      let i2 = 0;
      const ws2 = () => { while (i2 < rest.length && /\s/.test(rest[i2])) { i2 += 1; } };
      ws2();
      if (rest[i2] === "(") { const c = rest.indexOf(")", i2); name = rest.slice(i2 + 1, c); i2 = c + 1; }
      ws2();
      if (rest.startsWith("at", i2)) {
        i2 += 2; ws2();
        if (rest[i2] === "(") {
          let depth = 0;
          let j = i2;
          for (; j < rest.length; j += 1) {
            if (rest[j] === "(") { depth += 1; }
            else if (rest[j] === ")") { depth -= 1; if (!depth) { break; } }
          }
          at = tikzCoordSpec(rest.slice(i2 + 1, j), ux, uy);
          i2 = j + 1;
        }
      }
      ws2();
      if (rest[i2] === "{") { const close = texEatGroup(rest, i2); text = rest.slice(i2 + 1, close - 1); }
      if (m[1] === "coordinate") {
        parts.push('<g class="tikz-node" data-name="' + escapeHtml(name) + '" data-meta="' +
          attrJson({ x: at ? at.x : 0, y: at ? at.y : 0, shape: "point", inner: 0 }) + '"></g>');
        return;
      }
      parts.push(emitNode({
        name, x: at ? at.x : 0, y: at ? at.y : 0,
        ref: at && at.ref, refAnchor: at && at.anchor, opts, text,
      }));
      return;
    }
    const { ops, labels } = parsePathStatement(m[1], opts, rest);
    if (!ops.length) { return; }
    const stroke = m[1] === "fill" ? "none" : (opts.draw || opts.color || "currentColor");
    const fill = (m[1] === "fill" || m[1] === "filldraw") ? (opts.fill || opts.color || "currentColor") : "none";
    const lw = opts.lw || 1.2;
    const attrs = ['stroke="' + escapeHtml(m[1] === "path" ? "none" : stroke) + '"',
      'fill="' + escapeHtml(fill) + '"',
      'stroke-width="' + lw.toFixed(2) + '"'];
    if (opts.dash) { attrs.push('stroke-dasharray="' + opts.dash + '"'); }
    if (opts.rounded) { attrs.push('stroke-linejoin="round"'); }
    if (opts.arrowEnd) { attrs.push('marker-end="url(#' + markerId(stroke, opts.arrowEnd) + ')"'); }
    if (opts.arrowStart) { attrs.push('marker-start="url(#' + markerId(stroke, opts.arrowStart) + ')"'); }
    parts.push('<path class="tikz-path" data-path="' + pathIndex + '" data-ops="' +
      attrJson(ops) + '" ' + attrs.join(" ") + " d=\"\"/>");
    labels.forEach((lb) => {
      parts.push(emitNode({
        name: lb.name, x: 0, y: 0, opts: lb.opts, text: lb.text,
        onPath: { path: pathIndex, atOp: lb.atOp, pos: lb.opts.pos != null ? lb.opts.pos : (lb.pending ? 0.5 : null) },
      }));
    });
    pathIndex += 1;
  });

  const defs = Object.entries(markers).map(([key, id]) => {
    const [color, spec] = key.split("|");
    const lm = /length\s*=\s*([^,\]]+)/.exec(spec);
    const wm2 = /width\s*=\s*([^,\]]+)/.exec(spec);
    const len = lm ? tikzDim(lm[1], ux) : 11;
    const wid = wm2 ? tikzDim(wm2[1], ux) : len * 0.72;
    return '<marker id="' + id + '" orient="auto-start-reverse" markerUnits="userSpaceOnUse"' +
      ' markerWidth="' + len + '" markerHeight="' + wid + '" refX="' + (len - 1) + '" refY="' + (wid / 2) + '">' +
      '<path d="M0,0 L' + len + "," + (wid / 2) + " L0," + wid + ' z" fill="' + escapeHtml(color) + '"/></marker>';
  }).join("");

  return '<svg class="tikz" data-tikz="' + uid + '" viewBox="0 0 100 100">' +
    (defs ? "<defs>" + defs + "</defs>" : "") + parts.join("") + "</svg>";
}

/* Second pass, on the live DOM: measure node text, size and place shapes,
   resolve node-reference path endpoints (trimming bare refs at borders),
   settle on-path labels, then fit the viewBox. */
function layoutTikz(root) {
  root.querySelectorAll("svg[data-tikz]").forEach((svg) => {
    const registry = {};
    const bbox = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    const grow = (x, y, pad) => {
      const p = pad || 0;
      bbox.x1 = Math.min(bbox.x1, x - p); bbox.y1 = Math.min(bbox.y1, y - p);
      bbox.x2 = Math.max(bbox.x2, x + p); bbox.y2 = Math.max(bbox.y2, y + p);
    };
    const anchorVec = (name) => {
      const a = { x: 0, y: 0 };
      if (/north/.test(name)) { a.y = -1; }
      if (/south/.test(name)) { a.y = 1; }
      if (/east/.test(name)) { a.x = 1; }
      if (/west/.test(name)) { a.x = -1; }
      return a;
    };
    const anchorPoint = (ext, name) => {
      const v = anchorVec(name || "");
      if (ext.shape === "circle") {
        const len = Math.hypot(v.x, v.y) || 1;
        return { x: ext.cx + (v.x / len) * ext.r, y: ext.cy + (v.y / len) * ext.r };
      }
      return { x: ext.cx + v.x * ext.hw, y: ext.cy + v.y * ext.hh };
    };
    const borderToward = (ext, from) => {
      const dx = from.x - ext.cx;
      const dy = from.y - ext.cy;
      const len = Math.hypot(dx, dy);
      if (!len) { return { x: ext.cx, y: ext.cy }; }
      if (ext.shape === "circle") {
        return { x: ext.cx + (dx / len) * ext.r, y: ext.cy + (dy / len) * ext.r };
      }
      const t = Math.min(dx ? Math.abs(ext.hw / dx) : Infinity, dy ? Math.abs(ext.hh / dy) : Infinity);
      return { x: ext.cx + dx * Math.min(t, 1), y: ext.cy + dy * Math.min(t, 1) };
    };

    function placeNode(g, cx, cy) {
      const meta = JSON.parse(g.getAttribute("data-meta"));
      const fo = g.querySelector(".tikz-fo");
      let w = 0;
      let h = 0;
      if (fo) {
        const div = fo.querySelector(".tikz-nodetext");
        w = Math.ceil(div.offsetWidth) + 1;
        h = Math.ceil(div.offsetHeight);
      }
      const inner = meta.inner != null ? meta.inner : 5;
      let hw = Math.max(w / 2 + inner, (meta.minW || 0) / 2);
      let hh = Math.max(h / 2 + inner, (meta.minH || 0) / 2);
      let r = Math.max(hw, hh);
      if (meta.shape === "point") { hw = hh = r = 0; }
      // placement: explicit anchor wins, else above/below/left/right offsets
      if (meta.anchor) {
        const v = anchorVec(meta.anchor);
        cx -= v.x * (meta.shape === "circle" ? r : hw);
        cy -= v.y * (meta.shape === "circle" ? r : hh);
      } else if (meta.place) {
        const d = meta.dist || 0;
        if (/above/.test(meta.place)) { cy -= hh + d; }
        if (/below/.test(meta.place)) { cy += hh + d; }
        if (/left/.test(meta.place)) { cx -= hw + d; }
        if (/right/.test(meta.place)) { cx += hw + d; }
      }
      const shape = g.querySelector(".tikz-shape");
      if (shape) {
        if (shape.tagName === "circle") {
          shape.setAttribute("cx", cx); shape.setAttribute("cy", cy); shape.setAttribute("r", r);
        } else {
          shape.setAttribute("x", cx - hw); shape.setAttribute("y", cy - hh);
          shape.setAttribute("width", hw * 2); shape.setAttribute("height", hh * 2);
          if (meta.rounded) { shape.setAttribute("rx", meta.rounded); }
        }
        shape.setAttribute("fill", meta.fill || "none");
        shape.setAttribute("stroke", meta.draw || "none");
        shape.setAttribute("stroke-width", meta.lw || 1.2);
        if (meta.dash) { shape.setAttribute("stroke-dasharray", meta.dash); }
      }
      if (fo) {
        fo.setAttribute("x", cx - w / 2);
        fo.setAttribute("y", cy - h / 2);
        fo.setAttribute("width", Math.max(1, w));
        fo.setAttribute("height", Math.max(1, h));
      }
      if (meta.shape !== "point") { grow(cx - hw, cy - hh); grow(cx + hw, cy + hh); }
      const ext = { cx, cy, hw, hh, r, shape: meta.shape === "circle" ? "circle" : "rect" };
      const name = g.getAttribute("data-name");
      if (name) { registry[name] = ext; }
      return ext;
    }

    // 1. free-standing nodes (registry + geometry); on-path labels wait
    const deferred = [];
    svg.querySelectorAll("g.tikz-node").forEach((g) => {
      const meta = JSON.parse(g.getAttribute("data-meta"));
      if (meta.onPath) { deferred.push(g); return; }
      let cx = meta.x;
      let cy = meta.y;
      if (meta.ref && registry[meta.ref]) {
        const p = anchorPoint(registry[meta.ref], meta.refAnchor);
        cx = p.x; cy = p.y;
      }
      placeNode(g, cx, cy);
    });

    // 2. paths: resolve coordinates, trim bare node refs, build d
    const segStore = {};
    svg.querySelectorAll("path[data-ops]").forEach((p) => {
      const ops = JSON.parse(p.getAttribute("data-ops"));
      const pts = [];   // resolved anchor list aligned with ops
      let cur = { x: 0, y: 0 };
      ops.forEach((op) => {
        if (!op.pt) { pts.push(null); return; }
        let pt;
        if (op.pt.ref != null) {
          const ext = registry[op.pt.ref];
          pt = ext
            ? (op.pt.anchor ? anchorPoint(ext, op.pt.anchor) : { x: ext.cx, y: ext.cy, trim: op.pt.ref })
            : { x: 0, y: 0 };
        } else if (op.pt.rel) {
          pt = { x: cur.x + op.pt.x, y: cur.y + op.pt.y };
        } else {
          pt = { x: op.pt.x, y: op.pt.y };
        }
        pts.push(pt);
        cur = pt;
      });
      // trim straight segments that end (or begin) at a bare node reference
      ops.forEach((op, i) => {
        if (!pts[i] || (op.c !== "line" && op.c !== "start")) { return; }
        if (pts[i].trim && registry[pts[i].trim]) {
          const other = op.c === "line" ? pts[i - 1] : pts[i + 1];
          if (other) {
            const t = borderToward(registry[pts[i].trim], other);
            pts[i] = { x: t.x, y: t.y };
          }
        }
      });
      const segs = [];
      let d = "";
      cur = { x: 0, y: 0 };
      ops.forEach((op, i) => {
        const pt = pts[i];
        if (op.c === "start") { d += "M" + pt.x.toFixed(1) + " " + pt.y.toFixed(1); grow(pt.x, pt.y, 2); cur = pt; segs[i] = { a: pt, b: pt }; return; }
        if (op.c === "line") { d += "L" + pt.x.toFixed(1) + " " + pt.y.toFixed(1); grow(pt.x, pt.y, 2); segs[i] = { a: cur, b: pt }; cur = pt; return; }
        if (op.c === "hv") { d += "L" + pt.x.toFixed(1) + " " + cur.y.toFixed(1) + "L" + pt.x.toFixed(1) + " " + pt.y.toFixed(1); grow(pt.x, pt.y, 2); grow(pt.x, cur.y, 2); segs[i] = { a: cur, b: pt }; cur = pt; return; }
        if (op.c === "vh") { d += "L" + cur.x.toFixed(1) + " " + pt.y.toFixed(1) + "L" + pt.x.toFixed(1) + " " + pt.y.toFixed(1); grow(pt.x, pt.y, 2); grow(cur.x, pt.y, 2); segs[i] = { a: cur, b: pt }; cur = pt; return; }
        if (op.c === "bendl" || op.c === "bendr") {
          const mx = (cur.x + pt.x) / 2;
          const my = (cur.y + pt.y) / 2;
          const nx = -(pt.y - cur.y);
          const ny = pt.x - cur.x;
          const s = (op.c === "bendl" ? -0.25 : 0.25);
          d += "Q" + (mx + nx * s).toFixed(1) + " " + (my + ny * s).toFixed(1) + " " + pt.x.toFixed(1) + " " + pt.y.toFixed(1);
          grow(pt.x, pt.y, 2); segs[i] = { a: cur, b: pt }; cur = pt; return;
        }
        if (op.c === "bez") {
          const c1 = op.c1 ? { x: op.c1.x, y: op.c1.y } : cur;
          const c2 = op.c2 ? { x: op.c2.x, y: op.c2.y } : pt;
          d += "C" + c1.x.toFixed(1) + " " + c1.y.toFixed(1) + " " + c2.x.toFixed(1) + " " + c2.y.toFixed(1) + " " + pt.x.toFixed(1) + " " + pt.y.toFixed(1);
          grow(c1.x, c1.y, 2); grow(c2.x, c2.y, 2); grow(pt.x, pt.y, 2);
          segs[i] = { a: cur, b: pt }; cur = pt; return;
        }
        if (op.c === "rect") { d += "M" + cur.x.toFixed(1) + " " + cur.y.toFixed(1) + "H" + pt.x.toFixed(1) + "V" + pt.y.toFixed(1) + "H" + cur.x.toFixed(1) + "Z"; grow(pt.x, pt.y, 2); segs[i] = { a: cur, b: pt }; cur = pt; return; }
        if (op.c === "circle") { d += "M" + (cur.x + op.r).toFixed(1) + " " + cur.y.toFixed(1) + "A" + op.r + " " + op.r + " 0 1 0 " + (cur.x - op.r).toFixed(1) + " " + cur.y.toFixed(1) + "A" + op.r + " " + op.r + " 0 1 0 " + (cur.x + op.r).toFixed(1) + " " + cur.y.toFixed(1); grow(cur.x, cur.y, op.r + 2); return; }
        if (op.c === "ellipse") { d += "M" + (cur.x + op.rx).toFixed(1) + " " + cur.y.toFixed(1) + "A" + op.rx + " " + op.ry + " 0 1 0 " + (cur.x - op.rx).toFixed(1) + " " + cur.y.toFixed(1) + "A" + op.rx + " " + op.ry + " 0 1 0 " + (cur.x + op.rx).toFixed(1) + " " + cur.y.toFixed(1); grow(cur.x, cur.y, Math.max(op.rx, op.ry) + 2); return; }
        if (op.c === "arc") {
          const a1 = op.a1 * Math.PI / 180;
          const a2 = op.a2 * Math.PI / 180;
          const cx0 = cur.x - op.r * Math.cos(a1);
          const cy0 = cur.y + op.r * Math.sin(a1);
          const ex = cx0 + op.r * Math.cos(a2);
          const ey = cy0 - op.r * Math.sin(a2);
          d += "A" + op.r + " " + op.r + " 0 " + (Math.abs(op.a2 - op.a1) > 180 ? 1 : 0) + " " + (op.a2 > op.a1 ? 0 : 1) + " " + ex.toFixed(1) + " " + ey.toFixed(1);
          grow(cx0, cy0, op.r + 2);
          cur = { x: ex, y: ey };
          return;
        }
        if (op.c === "grid") {
          const step = op.step || 38;
          let gd = "";
          for (let gx = Math.min(cur.x, pt.x); gx <= Math.max(cur.x, pt.x) + 0.01; gx += step) {
            gd += "M" + gx.toFixed(1) + " " + cur.y.toFixed(1) + "V" + pt.y.toFixed(1);
          }
          for (let gy = Math.min(cur.y, pt.y); gy <= Math.max(cur.y, pt.y) + 0.01; gy += step) {
            gd += "M" + cur.x.toFixed(1) + " " + gy.toFixed(1) + "H" + pt.x.toFixed(1);
          }
          d += gd;
          grow(pt.x, pt.y, 2);
          return;
        }
        if (op.c === "close") { d += "Z"; }
      });
      p.setAttribute("d", d);
      segStore[p.getAttribute("data-path")] = segs.filter(Boolean);
    });

    // 3. labels riding on paths
    deferred.forEach((g) => {
      const meta = JSON.parse(g.getAttribute("data-meta"));
      const segs = segStore[String(meta.onPath.path)] || [];
      const seg = meta.onPath.pos != null
        ? (segs[meta.onPath.atOp] || segs[segs.length - 1])
        : segs[segs.length - 1];
      if (!seg) { placeNode(g, 0, 0); return; }
      const t = meta.onPath.pos != null ? meta.onPath.pos : 1;
      placeNode(g, seg.a.x + (seg.b.x - seg.a.x) * t, seg.a.y + (seg.b.y - seg.a.y) * t);
    });

    if (bbox.x1 === Infinity) { bbox.x1 = 0; bbox.y1 = 0; bbox.x2 = 100; bbox.y2 = 100; }
    const pad = 8;
    const w = bbox.x2 - bbox.x1 + pad * 2;
    const h = bbox.y2 - bbox.y1 + pad * 2;
    svg.setAttribute("viewBox", (bbox.x1 - pad).toFixed(1) + " " + (bbox.y1 - pad).toFixed(1) + " " + w.toFixed(1) + " " + h.toFixed(1));
    svg.setAttribute("width", Math.round(w));
    svg.setAttribute("height", Math.round(h));
  });
}

function renderTexTable(block) {
  const cap = extractTexCaption(block);
  // the column spec may nest braces (@{}, p{66mm}), so eat it balanced
  const start = /\\begin\{tabular\}\s*\{/.exec(block);
  if (!start) { return ""; }
  const open = start.index + start[0].length - 1;
  const close = texEatGroup(block, open);
  const endTab = /\\end\{tabular\}/.exec(block);
  const tab = [null,
    block.slice(open + 1, close - 1),
    block.slice(close, endTab ? endTab.index : block.length)];
  const aligns = (tab[1].match(/[lcr]|p\{[^}]*\}/g) || []).map((ch) =>
    ch === "c" ? "center" : ch === "r" ? "right" : "left");
  const rows = tab[2].split("\\\\")
    .map((r) => r.replace(/^\s*\[[^\]]*\]/, "")   // \\[1.5mm] row spacing
      .replace(/\\(hline|toprule|midrule|bottomrule)/g, "")
      .replace(/\\rowcolor\{[^}]*\}/g, "").trim())
    .filter(Boolean);
  const body = rows.map((row, ri) => {
    const tag = ri === 0 ? "th" : "td";
    const cells = row.split("&").map((cell, ci) =>
      "<" + tag + ' style="text-align:' + (aligns[ci] || "left") + '">' +
      texInline(escapeHtml(cell.trim())) + "</" + tag + ">").join("");
    return "<tr>" + cells + "</tr>";
  }).join("");
  return '<figure class="tex-table"><table>' + body + "</table>" +
    (cap ? "<figcaption>" + texInline(escapeHtml(cap)) + "</figcaption>" : "") + "</figure>";
}

function renderTexFigure(block) {
  const cap = extractTexCaption(block);
  const img = /\\includegraphics(\[[^\]]*\])?\{([^}]*)\}/.exec(block);
  const asset = img ? findImageDoc(img[2]) : null;
  const wm = img ? /width\s*=\s*([^,\]]+)/.exec(img[1] || "") : null;
  const width = wm ? texDimToCss(wm[1]) : "";
  const inlineChunks = (block.match(/@@TEXCHUNK\d+@@/g) || []).join(" ");
  const body = asset
    ? '<img class="tex-img"' + (width ? ' style="width:' + width + '"' : "") +
      ' src="' + asset.body + '" alt="' + escapeHtml(img[2]) + '">'
    : inlineChunks ||
      '<div class="tex-figure__frame">' + (img ? "[ graphic: " + escapeHtml(img[2]) + " ]" : "[ graphic ]") + "</div>";
  return '<figure class="tex-figure">' + body +
    (cap ? "<figcaption>" + texInline(escapeHtml(cap)) + "</figcaption>" : "") + "</figure>";
}

function texToHtml(src) {
  let s = resolveTexInputs(src, 0, new Set());
  s = s.replace(/(^|[^\\])%.*$/gm, "$1");

  // theorem-like environments the document declares
  const thmNames = { proof: "Proof" };
  s.replace(/\\newtheorem\{(\w+)\}(?:\[\w+\])?\{([^}]*)\}(?:\[\w+\])?/g, (m, env, label) => {
    thmNames[env] = label;
    return m;
  });

  // bibliography: \addbibresource names a .bib that may live among the notes
  texBib = null;
  const bibNames = [];
  s.replace(/\\addbibresource\{([^}]*)\}/g, (m, name) => { bibNames.push(name.trim()); return m; });
  bibNames.some((name) => {
    const doc = notesDocs.find((d) => d.name === name || d.name.endsWith("/" + name));
    if (doc) { texBib = parseBibTex(doc.body); return true; }
    return false;
  });

  // \newcommand macros: parameterless ones expand in place and go to KaTeX;
  // parameterized ones ([n], optionally with an [default]) expand by
  // #1..#9 substitution, so poster-style \postersection{01}{...} works
  const macros = {};
  const paramMacros = {};
  {
    const re = /\\(?:re)?newcommand\*?\{\\([A-Za-z]+)\}/g;
    const spans = [];
    let m;
    while ((m = re.exec(s))) {
      let at = m.index + m[0].length;
      let params = 0;
      let optDefault = null;
      if (s[at] === "[") { const c = s.indexOf("]", at); params = parseInt(s.slice(at + 1, c), 10) || 0; at = c === -1 ? at : c + 1; }
      if (s[at] === "[") { const c = s.indexOf("]", at); optDefault = s.slice(at + 1, c); at = c === -1 ? at : c + 1; }
      if (s[at] !== "{") { continue; }
      const close = texEatGroup(s, at);
      const body = s.slice(at + 1, close - 1);
      if (params > 0) { paramMacros[m[1]] = { params, optDefault, body }; }
      else { macros[m[1]] = body; }
      spans.push([m.index, close]);
    }
    for (let i = spans.length - 1; i >= 0; i -= 1) { s = s.slice(0, spans[i][0]) + s.slice(spans[i][1]); }
  }
  for (let pass = 0; pass < 2; pass += 1) {
    Object.keys(macros).sort((a, b) => b.length - a.length).forEach((name) => {
      s = s.replace(new RegExp("\\\\" + name + "(?![A-Za-z])", "g"), () => macros[name]);
    });
  }
  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;
    Object.keys(paramMacros).sort((a, b) => b.length - a.length).forEach((name) => {
      const def = paramMacros[name];
      const re = new RegExp("\\\\" + name + "(?![A-Za-z])");
      let m;
      let hops = 0;
      while ((m = re.exec(s)) && hops < 200) {
        hops += 1;
        let at = m.index + m[0].length;
        const args = [];
        if (def.optDefault != null) {
          while (/\s/.test(s[at])) { at += 1; }
          if (s[at] === "[") { const c = s.indexOf("]", at); args.push(s.slice(at + 1, c)); at = c === -1 ? at : c + 1; }
          else { args.push(def.optDefault); }
        }
        let ok = true;
        while (ok && args.length < def.params) {
          while (/\s/.test(s[at])) { at += 1; }
          if (s[at] === "{") { const close = texEatGroup(s, at); args.push(s.slice(at + 1, close - 1)); at = close; }
          else { ok = false; args.push(""); }
        }
        s = s.slice(0, m.index) +
          def.body.replace(/#(\d)/g, (mm, d) => args[Number(d) - 1] || "") + s.slice(at);
        changed = true;
      }
    });
    if (!changed) { break; }
  }
  const kmacros = {};
  Object.entries(macros).forEach(([k, v]) => { kmacros["\\" + k] = v; });
  texToHtml.lastMacros = kmacros;

  // \definecolor palette → real CSS, so colorboxes and textcolors keep their ink
  const texColors = { white: "#ffffff", black: "#000000" };
  s.replace(/\\definecolor\{(\w+)\}\{(\w+)\}\{([^}]*)\}/g, (m, name, model, val) => {
    const nums = val.split(",").map((x) => parseFloat(x));
    if (model === "gray" && nums.length === 1 && isFinite(nums[0])) {
      const g = Math.round(nums[0] * 255);
      texColors[name] = "rgb(" + g + "," + g + "," + g + ")";
    } else if (model === "rgb" && nums.length === 3) {
      texColors[name] = "rgb(" + nums.map((x) => Math.round((x || 0) * 255)).join(",") + ")";
    } else if (model === "HTML") {
      texColors[name] = "#" + val.trim().replace(/[^0-9a-fA-F]/g, "");
    }
    return m;
  });

  // callout environments: \newtcolorbox names, plus any \newenvironment
  // whose definition is built on tcolorbox (keybox stays as the fallback)
  const boxEnvs = new Set(["keybox"]);
  s.replace(/\\newtcolorbox\{(\w+)\}/g, (m, name) => { boxEnvs.add(name); return m; });
  {
    const re = /\\(?:re)?newenvironment\{(\w+)\}/g;
    let m;
    while ((m = re.exec(s))) {
      let probe = m.index + m[0].length;
      const parts = [];
      for (let g = 0; g < 2; g += 1) {
        while (probe < s.length && (/\s/.test(s[probe]) || s[probe] === "[")) {
          if (s[probe] === "[") { const c = s.indexOf("]", probe); probe = c === -1 ? s.length : c + 1; }
          else { probe += 1; }
        }
        if (s[probe] !== "{") { break; }
        const close = texEatGroup(s, probe);
        parts.push(s.slice(probe + 1, close - 1));
        probe = close;
      }
      if (parts.join(" ").includes("tcolorbox")) { boxEnvs.add(m[1]); }
    }
  }

  // tikz styles declared with \tikzset{ name/.style={...} } or \tikzstyle
  const tikzStyles = {};
  {
    const re = /\\tikzset\s*\{/g;
    let m;
    while ((m = re.exec(s))) {
      const open = m.index + m[0].length - 1;
      const close = texEatGroup(s, open);
      collectTikzStyles(s.slice(open + 1, close - 1), tikzStyles);
      re.lastIndex = close;
    }
    const re2 = /\\tikzstyle\s*\{([^}]*)\}\s*=\s*\[/g;
    while ((m = re2.exec(s))) {
      let depth = 0;
      let j = m.index + m[0].length - 1;
      for (; j < s.length; j += 1) {
        if (s[j] === "[") { depth += 1; }
        else if (s[j] === "]") { depth -= 1; if (!depth) { break; } }
      }
      tikzStyles[m[1].trim()] = s.slice(m.index + m[0].length, j);
      re2.lastIndex = j;
    }
    s = s.replace(/\\tikzstyle\s*\{[^}]*\}\s*=\s*\[[^\]]*\]/g, "");
  }

  // \IfFileExists checks the imported notes and takes the honest branch
  {
    const re = /\\IfFileExists(?![A-Za-z])/;
    let m;
    while ((m = re.exec(s))) {
      const idx = m.index;
      let end = idx + m[0].length;
      const groups = [];
      for (let g = 0; g < 3; g += 1) {
        while (/\s/.test(s[end])) { end += 1; }
        if (s[end] !== "{") { break; }
        const close = texEatGroup(s, end);
        groups.push(s.slice(end + 1, close - 1));
        end = close;
      }
      if (groups.length < 3) { s = s.slice(0, idx) + s.slice(idx + m[0].length); continue; }
      const wanted = groups[0].trim();
      const exists = !!findImageDoc(wanted) || notesDocs.some((d) => d.name === wanted);
      s = s.slice(0, idx) + (exists ? groups[1] : groups[2]) + s.slice(end);
    }
  }

  // frontmatter: pull title/author/date out, mark where \maketitle sat
  const title = extractTexCommand(s, "title");
  s = title.s;
  const author = extractTexCommand(s, "author");
  s = author.s;
  const date = extractTexCommand(s, "date");
  s = date.s;
  const hadMaketitle = /\\maketitle/.test(s);
  s = s.replace(/\\maketitle/g, "\n@@TEXTITLE@@\n");
  s = s.replace(/\\tableofcontents/g, "\n@@TEXTOC@@\n");
  s = s.replace(/\\printbibliography/g, "\n@@TEXBIB@@\n");

  // labels must go before math is tokenized, or KaTeX would meet \label
  s = s.replace(/\\label\{[^}]*\}/g, "");
  // display environments to $$, then protect every math segment from the
  // text pipeline (it may contain <, &, braces, and user macros)
  s = s.replace(/\\begin\{(equation|align|gather)\*?\}([\s\S]*?)\\end\{\1\*?\}/g,
    (m, env, inner) => env === "equation"
      ? "\n$$" + inner + "$$\n"
      : "\n$$\\begin{aligned}" + inner + "\\end{aligned}$$\n");
  const maths = [];
  // the lookbehind keeps \\[6mm] line breaks from reading as \[ display math
  s = s.replace(/\$\$[\s\S]*?\$\$|(?<!\\)\\\[[\s\S]*?\\\]|\$[^$\n]*\$/g, (m) => {
    maths.push(m);
    return "@@TEXMATH" + (maths.length - 1) + "@@";
  });

  // floats become placeholder chunks before any escaping mangles their guts
  const chunks = [];
  // tikzpictures first, so figures that wrap one keep the drawing
  s = s.replace(/\\begin\{tikzpicture\}\s*(\[[^\]]*\])?([\s\S]*?)\\end\{tikzpicture\}/g, (m, opt, tikzBody) => {
    const idx = chunks.push(tikzToSvg(tikzBody, opt ? opt.slice(1, -1) : "", texColors, tikzStyles)) - 1;
    return "\n@@TEXCHUNK" + idx + "@@\n";
  });
  s = s.replace(/\\begin\{table\}(?:\[[^\]]*\])?[\s\S]*?\\end\{table\}/g, (m) => {
    chunks.push(renderTexTable(m));
    return "\n@@TEXCHUNK" + (chunks.length - 1) + "@@\n";
  });
  s = s.replace(/\\begin\{figure\}(?:\[[^\]]*\])?[\s\S]*?\\end\{figure\}/g, (m) => {
    chunks.push(renderTexFigure(m));
    return "\n@@TEXCHUNK" + (chunks.length - 1) + "@@\n";
  });
  // bare tabulars (outside a table float) still deserve a real table
  s = s.replace(/\\begin\{tabular\}[\s\S]*?\\end\{tabular\}/g, (m) => {
    chunks.push(renderTexTable(m));
    return "\n@@TEXCHUNK" + (chunks.length - 1) + "@@\n";
  });
  // loose \includegraphics resolves against imported images too
  s = s.replace(/\\includegraphics(\[[^\]]*\])?\{([^}]*)\}/g, (m, opt, name) => {
    const asset = findImageDoc(name);
    if (!asset) { return ""; }
    const wm = /width\s*=\s*([^,\]]+)/.exec(opt || "");
    const width = wm ? texDimToCss(wm[1]) : "";
    const idx = chunks.push('<img class="tex-img"' + (width ? ' style="width:' + width + '"' : "") +
      ' src="' + asset.body + '" alt="' + escapeHtml(name) + '">') - 1;
    return "@@TEXCHUNK" + idx + "@@";
  });

  // theorem-like environments become framed blocks with running numbers
  const envAlt = Object.keys(thmNames).join("|");
  let thmCount = 0;
  s = s.replace(new RegExp("\\\\begin\\{(" + envAlt + ")\\}(\\[[^\\]]*\\])?", "g"), (m, env, opt) => {
    if (env === "proof") {
      return "\n\n@@TEXTHMO|" + (opt ? opt.slice(1, -1) : "Proof") + "@@\n\n";
    }
    thmCount += 1;
    return "\n\n@@TEXTHMO|" + thmNames[env] + " " + thmCount +
      (opt ? "|" + opt.slice(1, -1) : "") + "@@\n\n";
  });
  s = s.replace(new RegExp("\\\\end\\{(" + envAlt + ")\\}", "g"), (m, env) =>
    env === "proof" ? "\n\n@@TEXTHMC|qed@@\n\n" : "\n\n@@TEXTHMC@@\n\n");

  // abstract and keybox keep their own quiet boxes
  s = s.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (m, inner) => {
    const idx = chunks.push(
      '<section class="tex-abstract"><h3>Abstract</h3><p>' +
      texInline(escapeHtml(inner.trim().replace(/\s+/g, " "))) + "</p></section>") - 1;
    return "\n@@TEXCHUNK" + idx + "@@\n";
  });
  boxEnvs.forEach((env) => {
    s = s.replace(new RegExp("\\\\begin\\{" + env + "\\}(?:\\[([^\\]]*)\\])?", "g"),
      (m, t) => "\n\n@@TEXBOXO|" + (t || "") + "@@\n\n");
    s = s.replace(new RegExp("\\\\end\\{" + env + "\\}", "g"), "\n\n@@TEXBOXC@@\n\n");
  });

  // horizontal space collapses to a space BEFORE the stripper (which would
  // otherwise glue the band number to its title)
  s = s.replace(/\\hspace\*?\{[^}]*\}/g, " ");
  s = s.replace(/\\XeTeXlinebreak\w+\s*(?:=\s*\S+|"[^"]*")?/g, "");
  // the preamble: strip commands with their (possibly multi-line) arguments
  s = stripTexCommands(s, {
    documentclass: 1, usepackage: 1, geometry: 1, setlength: 2, definecolor: 3,
    pagestyle: 1, thispagestyle: 1, fancyhf: 1, fancyhead: 1, fancyfoot: 1,
    renewcommand: 2, newcommand: 2, providecommand: 2, hypersetup: 1,
    titleformat: 5, titlespacing: 4, addbibresource: 1, bibliography: 1,
    bibliographystyle: 1, setcounter: 2, vspace: 1, label: 1,
    IfFontExistsTF: 3, setmainfont: 1, setmathfont: 1,
    tcbuselibrary: 1, AtEveryBibitem: 1, newtheoremstyle: 9, theoremstyle: 1,
    newtheorem: 2, newtcolorbox: 2, captionsetup: 1, setlist: 1, color: 1,
    includegraphics: 1, clearfield: 1, phantom: 1,
    newenvironment: 3, renewenvironment: 3, newlength: 1, tcbset: 1,
    AddToShipoutPictureFG: 1, AddToShipoutPictureBG: 1, fontsize: 2,
    usetikzlibrary: 1, tikzset: 1,
  });
  // \par is a paragraph break; \mbox and \resizebox keep their payloads
  s = s.replace(/\\par\b/g, "\n\n");
  s = keepLastGroup(s, "mbox", 1);
  s = keepLastGroup(s, "resizebox", 3);
  // AFTER the preamble strip: minipages become side-by-side columns, and
  // colour / font-switch groups become styled spans (doing this earlier
  // would eat braces inside preamble arguments and unbalance the stripper)
  {
    const re = /\\begin\{minipage\}/;
    let mp;
    while ((mp = re.exec(s))) {
      let end = mp.index + mp[0].length;
      // posters write [t][\colh][s]{\colw} — eat every optional group
      while (s[end] === "[" || /\s/.test(s[end])) {
        if (s[end] === "[") { const c = s.indexOf("]", end); end = c === -1 ? s.length : c + 1; }
        else { end += 1; }
      }
      let width = "";
      if (s[end] === "{") {
        const close = texEatGroup(s, end);
        width = texDimToCss(s.slice(end + 1, close - 1));
        end = close;
      }
      s = s.slice(0, mp.index) + "\n\n@@TEXMPO|" + width + "@@\n\n" + s.slice(end);
    }
    s = s.replace(/\\end\{minipage\}/g, "\n\n@@TEXMPC@@\n\n");
  }
  s = texStyleSpans(s);
  // \colorbox{c}{...} and \fcolorbox{edge}{bg}{...} become block markers —
  // divs, not spans, because their payload usually holds whole paragraphs
  [
    { re: /\\fcolorbox\*?\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{/, cls: (m) => "tex-fbox tex-bg-" + m[2].replace(/\W/g, "") },
    { re: /\\colorbox\*?\s*\{([^}]*)\}\s*\{/, cls: (m) => "tex-cbox tex-bg-" + m[1].replace(/\W/g, "") },
  ].forEach(({ re, cls }) => {
    let m;
    while ((m = re.exec(s))) {
      const open = m.index + m[0].length - 1;
      const close = texEatGroup(s, open);
      s = s.slice(0, m.index) + "\n\n@@TEXFDO|" + cls(m) + "@@\n\n" +
        s.slice(open + 1, close - 1) + "\n\n@@TEXFDC@@\n\n" + s.slice(close);
    }
  });
  ["center", "flushleft", "flushright", "RaggedRight"].forEach((env) => {
    s = stripEnvBegin(s, env, 0);
  });
  s = s.replace(/\\(begin|end)\{document\}/g, "")
    .replace(/\\(makeatletter|makeatother|centering|noindent|newpage|clearpage|normalfont|bfseries|itshape|Large|large|LARGE|Huge|huge|small|footnotesize|scriptsize|tiny|normalsize|RaggedRight|raggedright|today|relax|hfill|fill|indent|thepage|selectfont|ignorespaces|justifying|strut)\b/g, "");

  // structure, on escaped text, numbering sections as we go
  let secN = 0;
  let subN = 0;
  const toc = [];
  let html = escapeHtml(s)
    .replace(/\\(sub)?section(\*)?\{([^}]*)\}/g, (m, sub, star, text) => {
      if (!star) { if (sub) { subN += 1; } else { secN += 1; subN = 0; } }
      const num = star ? "" : (sub ? secN + "." + subN : String(secN));
      const label = (num ? num + "&emsp;" : "") + texInline(text);
      if (!star) { toc.push({ level: sub ? 2 : 1, label }); }
      return sub ? "<h3>" + label + "</h3>" : "<h2>" + label + "</h2>";
    })
    .replace(/\\begin\{itemize\}(\[[^\]]*\])?/g, "<ul>")
    .replace(/\\end\{itemize\}/g, "</ul>")
    .replace(/\\begin\{enumerate\}(\[[^\]]*\])?/g, "<ol>")
    .replace(/\\end\{enumerate\}/g, "</ol>")
    .replace(/\\item\s*/g, "<li>")
    .replace(/\\rule\{[^{}]*\}\{[^{}]*\}/g, '<hr class="tex-hrule">')
    .replace(/\\\\(\[[^\]]*\])?/g, "<br>")
    .replace(/\\q?quad\b/g, "&emsp;")
    .replace(/\\&amp;/g, "&amp;")
    .replace(/\\([%#_])/g, "$1")
    .replace(/---/g, "&mdash;")
    .replace(/--/g, "&ndash;")
    .replace(/\\ /g, " ")
    .replace(/~/g, " ");
  html = texInline(html);
  html = html.replace(/[{}]/g, "");   // leftover TeX grouping braces; math is tokenized

  html = html.split(/\n{2,}/).map((chunk) => {
    const t = chunk.trim();
    if (!t) { return ""; }
    return /^</.test(t) || /^@@TEX/.test(t) ? t : "<p>" + t.replace(/\n/g, " ") + "</p>";
  }).join("\n");

  html = html
    .replace(/@@TEXTHMO\|([^|@]*)\|([^@]*)@@/g,
      '<div class="tex-thm"><p class="tex-thm__head"><b>$1</b> <i>($2)</i></p>')
    .replace(/@@TEXTHMO\|([^|@]*)@@/g,
      '<div class="tex-thm"><p class="tex-thm__head"><b>$1.</b></p>')
    .replace(/@@TEXTHMC\|qed@@/g, '<p class="tex-thm__qed">&#8718;</p></div>')
    .replace(/@@TEXTHMC@@/g, "</div>")
    .replace(/@@TEXBOXO\|([^@]*)@@/g, (m, t) =>
      '<div class="tex-keybox">' + (t ? '<p class="tex-keybox__title">' + t + "</p>" : ""))
    .replace(/@@TEXBOXC@@/g, "</div>")
    .replace(/@@TEXFDO\|([^@]*)@@/g, '<div class="$1">')
    .replace(/@@TEXFDC@@/g, "</div>")
    .replace(/@@TEXMPO\|([^@]*)@@/g, (m, w) =>
      '<div class="tex-mp"' + (w ? ' style="width:' + w + '"' : "") + ">")
    .replace(/@@TEXMPC@@/g, "</div>")
    .replace(/@@TEXFSO\|([^@]*)@@/g, '<span class="$1">')
    .replace(/@@TEXFSC@@/g, "</span>");

  // frontmatter block: where \maketitle sat, or on top when only \title exists
  let titleBlock = "";
  if (title.value != null || author.value != null) {
    const when = (date.value == null || /\\today/.test(date.value))
      ? new Date().toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })
      : texInline(escapeHtml(date.value));
    const authors = (author.value || "").split(/\\\\/).map((line) =>
      texInline(escapeHtml(line.trim()))).filter(Boolean).join("<br>");
    titleBlock = '<header class="tex-title">' +
      (title.value != null ? "<h1>" + texInline(escapeHtml(title.value)) + "</h1>" : "") +
      (authors ? '<div class="tex-title__authors">' + authors + "</div>" : "") +
      '<div class="tex-title__date">' + when + "</div></header>";
  }
  html = html.replace(/@@TEXTITLE@@/g, titleBlock);
  if (titleBlock && !hadMaketitle) { html = titleBlock + "\n" + html; }

  const tocHtml = toc.length
    ? '<nav class="tex-toc"><h3>Contents</h3><ol>' +
      toc.map((e) => '<li class="tex-toc__l' + e.level + '">' + e.label + "</li>").join("") +
      "</ol></nav>"
    : "";
  html = html.replace(/@@TEXTOC@@/g, tocHtml);
  html = html.replace(/@@TEXBIB@@/g, texBib && texBib.entries.length
    ? '<section class="tex-bib"><h2>References</h2><ol class="tex-bib__list">' +
      texBib.entries.map((e) => "<li>" + formatBibEntry(e) + "</li>").join("") +
      "</ol></section>"
    : '<section class="tex-bib"><h2>References</h2><p class="tex-ref">' +
      "No .bib file found among the notes; import it next to the .tex and citations resolve.</p></section>");
  // chunks may nest (a figure holding a tikz marker), so resolve in passes
  for (let pass = 0; pass < 3 && /@@TEXCHUNK\d+@@/.test(html); pass += 1) {
    html = html.replace(/@@TEXCHUNK(\d+)@@/g, (m, i) => chunks[Number(i)] || "");
  }
  // math goes back in last, escaped; KaTeX reads the decoded text at render time
  html = html.replace(/@@TEXMATH(\d+)@@/g, (m, i) => escapeHtml(maths[Number(i)]));
  // the document's own \definecolor palette rides along, so the preview and
  // the PDF both paint colorboxes and textcolors with the declared inks
  const colorCss = Object.entries(texColors).map(([n, c]) =>
    ".tex-color-" + n + "{color:" + c + "}.tex-bg-" + n + "{background:" + c + "}").join("");
  return (colorCss ? "<style>" + colorCss + "</style>" : "") + html;
}

const KATEX_DELIMS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "$", right: "$", display: false },
  { left: "\\(", right: "\\)", display: false },
];

function compiledNoteHtml(doc) {
  if (doc.kind === "markdown") { return mdToHtml(doc.body); }
  if (doc.kind === "tex") { return texToHtml(doc.body); }
  if (doc.kind === "image") { return '<img class="tex-img" src="' + doc.body + '" alt="' + escapeHtml(doc.name) + '">'; }
  return "<p>" + escapeHtml(doc.body).replace(/\n/g, "<br>") + "</p>";
}

let notesPreviewTimer = 0;
function renderNotesPreview() {
  if (!notesPreviewOn) { return; }
  const doc = activeNote();
  if (!doc) { notesPreview.innerHTML = ""; return; }
  notesPreview.innerHTML = compiledNoteHtml(doc);
  if (doc.kind !== "plain" && window.renderMathInElement) {
    window.renderMathInElement(notesPreview, {
      delimiters: KATEX_DELIMS,
      throwOnError: false,
      macros: Object.assign({}, texToHtml.lastMacros),
    });
  }
  layoutTikz(notesPreview);
}

/* "Compile to PDF": typeset the document into an A4 print shell — math is
   pre-rendered here so the popup is pure HTML+CSS — then hand it to the
   browser's print engine, whose "Save as PDF" output is vector and
   selectable, Overleaf style. */
function compileNotePdf() {
  const doc = activeNote();
  const stage = el("div");
  stage.innerHTML = compiledNoteHtml(doc);
  if (doc.kind !== "plain" && window.renderMathInElement) {
    stage.style.position = "fixed";
    stage.style.left = "-9999px";
    document.body.appendChild(stage);
    window.renderMathInElement(stage, {
      delimiters: KATEX_DELIMS,
      throwOnError: false,
      macros: Object.assign({}, texToHtml.lastMacros),
    });
    layoutTikz(stage);   // tikz geometry needs live text metrics
    stage.remove();
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast("The browser blocked the PDF window.", "caution");
    return;
  }
  const katexCss = new URL("vendor/katex/katex.min.css", window.location.href).href;
  const title = escapeHtml(doc.name.replace(/\.[a-z0-9]+$/i, ""));
  const stamp = new Date().toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
  popup.document.write([
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">',
    "<title>" + title + "</title>",
    '<link rel="stylesheet" href="' + katexCss + '">',
    "<style>",
    "@page { size: A4; margin: 24mm; }",
    "html { background: #777; }",
    "body { margin: 0 auto; max-width: 162mm; padding: 24mm 0 32mm; background: #fff;",
    "  font-family: Georgia, 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #111; }",
    "@media screen { body { padding: 24mm 18mm 32mm; box-shadow: 0 2px 18px rgba(0,0,0,.45); margin: 18px auto; } }",
    "@media print { html { background: #fff; } body { box-shadow: none; margin: 0 auto; } }",
    ".doc-head { border-bottom: 1px solid #111; margin-bottom: 18px; padding-bottom: 8px; }",
    ".doc-head h1 { margin: 0 0 4px; font-size: 21pt; font-weight: 400; }",
    ".doc-head .byline { font-size: 9pt; color: #555; letter-spacing: .04em; }",
    "h1, h2, h3 { font-weight: 400; margin: 18px 0 8px; }",
    "h2 { font-size: 15pt; } h3 { font-size: 12.5pt; }",
    "p { margin: 0 0 9px; } ul, ol { margin: 0 0 9px; }",
    "code { font-family: 'Courier New', monospace; font-size: 10pt; background: #f2f2f2; padding: 0 3px; }",
    "pre { background: #f2f2f2; padding: 8px 10px; overflow: auto; }",
    "blockquote { margin: 0 0 9px; padding: 2px 12px; border-left: 2px solid #111; color: #444; }",
    "hr { border: 0; border-top: 1px solid #111; margin: 14px 0; }",
    ".katex-display { margin: 12px 0; }",
    "a { color: #111; }",
    ".tex-title { text-align: center; margin: 0 0 16px; }",
    ".tex-title h1 { margin: 0 0 8px; font-size: 19pt; }",
    ".tex-title__authors { line-height: 1.55; }",
    ".tex-title__date { margin-top: 4px; color: #555; font-size: 9.5pt; }",
    ".tex-abstract { margin: 0 10% 14px; padding: 4px 14px; }",
    ".tex-abstract h3 { text-align: center; font-size: 11pt; }",
    ".tex-abstract p { font-size: 10.5pt; }",
    ".tex-toc { margin: 0 0 14px; } .tex-toc ol { margin: 0; padding-left: 4px; list-style: none; }",
    ".tex-toc__l2 { margin-left: 18px; list-style: none; }",
    ".tex-figure, .tex-table { margin: 0 0 14px; text-align: center; page-break-inside: avoid; }",
    ".tex-figure__frame { padding: 30px 14px; border: 1px dashed #999; color: #777; font-family: 'Courier New', monospace; }",
    ".tex-table table { margin: 0 auto; border-collapse: collapse; }",
    ".tex-table th, .tex-table td { padding: 4px 14px; border-top: 1px solid #111; border-bottom: 1px solid #111; }",
    "figcaption { margin-top: 6px; color: #555; font-size: 9.5pt; }",
    ".tex-ref { color: #555; }",
    ".tex-thm { margin: 0 0 11px; padding: 5px 12px; border-left: 2px solid #111; background: #f6f6f6; page-break-inside: avoid; }",
    ".tex-thm__head { margin-bottom: 4px; }",
    ".tex-thm__qed { text-align: right; margin: 0; }",
    ".tex-keybox { margin: 0 0 13px; padding: 7px 13px; border: 1px solid #999; border-left: 2px solid #111; background: #f6f6f6; }",
    ".tex-keybox__title { margin: -7px -13px 8px; padding: 4px 13px; background: #111; color: #fff; font-weight: 700; }",
    ".tex-cbox { margin: 0 0 13px; padding: 6px 13px; }",
    ".tex-fbox { margin: 0 0 13px; padding: 22px 13px; border: 1px solid #999; text-align: center; }",
    ".tikz { display: block; margin: 12px auto; max-width: 100%; height: auto; color: #111; overflow: visible; page-break-inside: avoid; }",
    ".tikz-fo { overflow: visible; }",
    ".tikz-nodetext { display: inline-block; font-size: 13px; line-height: 1.3; }",
    ".tex-hrule { border: 0; border-top: 1px solid #111; margin: 9px 0; }",
    ".tex-bib__list { padding-left: 22px; } .tex-bib__list li { margin-bottom: 5px; font-size: 10.5pt; }",
    ".tex-img { max-width: 100%; }",
    ".tex-mp { display: inline-block; vertical-align: top; min-width: 0; box-sizing: border-box; }",
    ".tex-fs-LARGE { font-size: 1.55em; line-height: 1.25; } .tex-fs-Large { font-size: 1.35em; }",
    ".tex-fs-large { font-size: 1.15em; } .tex-fs-small { font-size: 0.92em; }",
    ".tex-fs-footnotesize { font-size: 0.85em; } .tex-fs-scriptsize { font-size: 0.78em; } .tex-fs-tiny { font-size: 0.7em; }",
    ".tex-bf { font-weight: 700; } .tex-it { font-style: italic; }",
    ".tex-color-soft { color: #555; } .tex-color-edge { color: #999; }",
    "</style></head><body>",
    '<header class="doc-head"><h1>' + title + "</h1>",
    '<div class="byline">RetOS Workstation · typeset ' + escapeHtml(stamp) + "</div></header>",
    "<main>" + stage.innerHTML + "</main>",
    "</body></html>",
  ].join(""));
  popup.document.close();
  showToast("Typeset ready — choose “Save as PDF” in the print dialog.", "doc");
  window.setTimeout(() => {
    try { popup.focus(); popup.print(); } catch (err) { /* popup already closed */ }
  }, 450);
}

document.getElementById("notesPdf").addEventListener("click", compileNotePdf);

function scheduleNotesPreview() {
  window.clearTimeout(notesPreviewTimer);
  notesPreviewTimer = window.setTimeout(renderNotesPreview, 150);
}

const NOTE_ICONS = { plain: "list", markdown: "pencil", tex: "doc", image: "image" };

function noteFolderOf(name) { return name.includes("/") ? name.slice(0, name.lastIndexOf("/")) : ""; }
function noteBase(name) { return name.slice(name.lastIndexOf("/") + 1); }

/* every folder that exists: declared explicitly, or implied by a doc path */
function allNoteFolders() {
  const set = new Set(notesFolders);
  notesDocs.forEach((d) => {
    let path = noteFolderOf(d.name);
    while (path) { set.add(path); path = noteFolderOf(path); }
  });
  return set;
}

function moveNoteToFolder(index, path) {
  const doc = notesDocs[index];
  if (!doc) { return; }
  const target = (path ? path + "/" : "") + noteBase(doc.name);
  if (target === doc.name) { return; }
  if (notesDocs.some((d, i) => i !== index && d.name === target)) {
    showToast("A note with that name is already there.", "caution");
    return;
  }
  doc.name = target;
  if (index === notesActive) { notesTitle.value = doc.name; }
  renderNotesList();
  persistNotes();
  showToast("Moved " + noteBase(target) + " to " + (path || "the top level") + ".", "folder-open");
}

function renameNoteFolder(oldPath, rawName) {
  const seg = rawName.trim().replace(/[/\\]/g, "");
  notesFolderRenaming = null;
  if (!seg || seg === noteBase(oldPath)) { renderNotesList(); return; }
  const parent = noteFolderOf(oldPath);
  const newPath = (parent ? parent + "/" : "") + seg;
  const swap = (name) => name === oldPath ? newPath
    : name.startsWith(oldPath + "/") ? newPath + name.slice(oldPath.length) : name;
  notesDocs.forEach((d) => { d.name = swap(d.name); });
  notesFolders = Array.from(new Set(notesFolders.map(swap)));
  Array.from(notesCollapsed).forEach((p) => {
    if (swap(p) !== p) { notesCollapsed.delete(p); notesCollapsed.add(swap(p)); }
  });
  notesTitle.value = activeNote().name;
  renderNotesList();
  persistNotes();
}

function deleteNoteFolder(path) {
  const goners = notesDocs.filter((d) => d.name.startsWith(path + "/"));
  const activeDoc = activeNote();
  notesDocs = notesDocs.filter((d) => !d.name.startsWith(path + "/"));
  notesFolders = notesFolders.filter((f) => f !== path && !f.startsWith(path + "/"));
  Array.from(notesCollapsed).forEach((p) => {
    if (p === path || p.startsWith(path + "/")) { notesCollapsed.delete(p); }
  });
  if (!notesDocs.length) { notesDocs.push({ name: "Untitled", kind: "plain", body: "" }); }
  const keep = notesDocs.indexOf(activeDoc);
  setActiveNote(keep >= 0 ? keep : 0);
  persistNotes();
  showToast("Deleted " + path + (goners.length ? " and " + goners.length +
    (goners.length === 1 ? " note" : " notes") : "") + ".", "trash");
}

function noteDropTarget(row, path) {
  row.addEventListener("dragover", (e) => { e.preventDefault(); row.dataset.drop = "true"; });
  row.addEventListener("dragleave", () => { row.dataset.drop = "false"; });
  row.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    row.dataset.drop = "false";
    const idx = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isInteger(idx)) { moveNoteToFolder(idx, path); }
  });
}

function renderNotesList() {
  notesListSeat.innerHTML = "";
  const folders = allNoteFolders();
  const childFolders = (path) => Array.from(folders)
    .filter((f) => noteFolderOf(f) === path).sort();
  const childDocs = (path) => notesDocs
    .map((doc, index) => ({ doc, index }))
    .filter(({ doc }) => noteFolderOf(doc.name) === path);

  const renderLevel = (path, depth) => {
    childFolders(path).forEach((folder) => {
      const collapsed = notesCollapsed.has(folder);
      const renaming = notesFolderRenaming === folder;
      const label = renaming
        ? el("input", {
          class: "ps-input ro-notes__folderedit",
          value: noteBase(folder),
          "aria-label": "Folder name",
          onkeydown: (e) => {
            if (e.key === "Enter") { renameNoteFolder(folder, e.target.value); }
            if (e.key === "Escape") { notesFolderRenaming = null; renderNotesList(); }
          },
          onblur: (e) => renameNoteFolder(folder, e.target.value),
        })
        : el("span", { class: "ro-notes__foldername" }, noteBase(folder));
      const btn = el("button", {
        class: "ro-notes__folderbtn",
        type: "button",
        style: { paddingLeft: (8 + depth * 14) + "px" },
        "aria-expanded": String(!collapsed),
        onclick: () => {
          if (renaming) { return; }
          if (collapsed) { notesCollapsed.delete(folder); } else { notesCollapsed.add(folder); }
          renderNotesList();
          persistNotes();
        },
        ondblclick: () => { notesFolderRenaming = folder; renderNotesList(); },
      }, el("span", { class: "ro-notes__twist", "aria-hidden": "true" }, collapsed ? "▸" : "▾"),
      icon("folder-open", 12), " ", label);
      const eject = el("button", {
        class: "ps-winbtn ro-track__eject",
        type: "button",
        "aria-label": "Delete folder " + folder,
        onclick: () => deleteNoteFolder(folder),
      }, icon("close"));
      const row = el("div", { class: "ro-track ro-notes__folderrow" }, btn, eject);
      noteDropTarget(row, folder);
      notesListSeat.appendChild(row);
      if (renaming) { window.setTimeout(() => { const input = row.querySelector("input"); if (input) { input.focus(); input.select(); } }, 0); }
      if (!collapsed) { renderLevel(folder, depth + 1); }
    });
    childDocs(path).forEach(({ doc, index }) => {
      const opt = el("button", {
        class: "ps-listbox__opt",
        role: "option",
        type: "button",
        draggable: "true",
        style: { paddingLeft: (10 + depth * 14) + "px" },
        "aria-selected": String(index === notesActive),
        onclick: () => setActiveNote(index),
        ondragstart: (e) => e.dataTransfer.setData("text/plain", String(index)),
      }, icon(NOTE_ICONS[doc.kind] || "list", 12), " " + noteBase(doc.name));
      const eject = el("button", {
        class: "ps-winbtn ro-track__eject",
        type: "button",
        "aria-label": "Delete " + doc.name,
        onclick: () => deleteNote(index),
      }, icon("close"));
      notesListSeat.appendChild(el("div", { class: "ro-track" }, opt, eject));
    });
  };
  renderLevel("", 0);
}

const notesModeSeg = Segment({ options: ["Plain", "Markdown", "TeX"], value: "Markdown" });
document.getElementById("notesModeSeat").appendChild(notesModeSeg);
notesModeSeg.addEventListener("change", (e) => {
  activeNote().kind = e.detail.value.toLowerCase();
  renderNotesList();
  persistNotes();
  renderNotesPreview();
});

function syncNotesModeSeg() {
  const kind = activeNote().kind;
  const want = kind === "tex" ? "TeX" : kind === "markdown" ? "Markdown" : "Plain";
  notesModeSeg.querySelectorAll(".ps-segment__opt").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.textContent === want));
  });
}

function setActiveNote(index) {
  notesActive = clamp(index, 0, notesDocs.length - 1);
  const doc = activeNote();
  notesTitle.value = doc.name;
  if (doc.kind === "image") {
    notesPad.value = "";
    notesPad.disabled = true;
    notesPad.placeholder = "Image asset. Use it as \\includegraphics{" + doc.name +
      "} in TeX or ![alt](" + doc.name + ") in markdown.";
  } else {
    notesPad.disabled = false;
    notesPad.placeholder = "Write anything. Markdown and TeX both live-preview.";
    notesPad.value = doc.body;
  }
  syncNotesModeSeg();
  renderNotesList();
  renderNotesPreview();
  persistNotes();
}

function deleteNote(index) {
  const doc = notesDocs[index];
  notesDocs.splice(index, 1);
  if (!notesDocs.length) { notesDocs.push({ name: "Untitled", kind: "plain", body: "" }); }
  setActiveNote(index <= notesActive ? Math.max(0, notesActive - 1) : notesActive);
  showToast("Deleted " + doc.name + ".", "trash");
}

function importNoteFiles(fileList, fromFolder) {
  const isImage = (f) => /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name) || /^image\//.test(f.type);
  const textual = Array.from(fileList).filter((f) =>
    /\.(txt|md|markdown|tex|sty|bib)$/i.test(f.name) || /^text\//.test(f.type) || isImage(f));
  if (!textual.length) {
    showToast("No text, markdown, TeX, or image files in that selection.", "caution");
    return;
  }
  const capped = textual.slice(0, 40);
  Promise.all(capped.map((f) => {
    if (f.size > (isImage(f) ? 3 * 1024 * 1024 : 1024 * 1024)) { return null; }
    // folder imports keep the folder itself: "proj/chapters/one.tex"
    const rel = (fromFolder && f.webkitRelativePath) || f.name;
    if (isImage(f)) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: rel, kind: "image", body: String(reader.result) });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(f);
      });
    }
    return f.text().then((body) => ({ name: rel, kind: kindFromName(rel), body }));
  })).then((results) => {
    const docs = results.filter(Boolean);
    if (!docs.length) { return; }
    docs.forEach((doc) => {
      const existing = notesDocs.findIndex((d) => d.name === doc.name);
      if (existing >= 0) { notesDocs[existing] = doc; } else { notesDocs.push(doc); }
    });
    // activate the most interesting THING WE JUST IMPORTED: its main.tex,
    // else its first .tex, else the last file of the batch
    const pick = docs.find((d) => /(^|\/)main\.tex$/i.test(d.name)) ||
      docs.find((d) => d.kind === "tex" && /\.tex$/i.test(d.name)) ||
      docs[docs.length - 1];
    setActiveNote(notesDocs.findIndex((d) => d.name === pick.name));
    const skipped = textual.length - docs.length;
    showToast(docs.length + (docs.length === 1 ? " file" : " files") + " imported" +
      (skipped > 0 ? ", " + skipped + " skipped" : "") + ".", "folder-open");
  });
}

document.getElementById("notesImportFilesBtn").addEventListener("click", () =>
  document.getElementById("notesImportFiles").click());
document.getElementById("notesImportFolderBtn").addEventListener("click", () =>
  document.getElementById("notesImportFolder").click());
document.getElementById("notesImportFiles").addEventListener("change", (e) => {
  importNoteFiles(e.target.files, false);
  e.target.value = "";
});
document.getElementById("notesImportFolder").addEventListener("change", (e) => {
  importNoteFiles(e.target.files, true);
  e.target.value = "";
});

let notesPreviewGeom = null;
document.getElementById("notesPreviewToggle").addEventListener("click", () => {
  notesPreviewOn = !notesPreviewOn;
  const btn = document.getElementById("notesPreviewToggle");
  const win = windowMap.notes;
  btn.setAttribute("aria-pressed", String(notesPreviewOn));
  notesPreview.hidden = !notesPreviewOn;
  if (notesPreviewOn) {
    // remember the frame so closing the preview puts it back exactly
    notesPreviewGeom = readGeom(win);
    win.dataset.preview = "true";
    const frame = viewportFrame();
    const want = Math.min(820, frame.right - frame.left);
    if (notesPreviewGeom.width < want) {
      setGeom(win, { left: Math.min(notesPreviewGeom.left, frame.right - want), width: want });
    }
  } else {
    delete win.dataset.preview;
    if (notesPreviewGeom) {
      setGeom(win, { left: notesPreviewGeom.left, width: notesPreviewGeom.width, height: notesPreviewGeom.height });
      notesPreviewGeom = null;
    }
  }
  renderNotesPreview();
});

document.getElementById("notesNew").addEventListener("click", () => {
  notesDocs.push({ name: "Untitled " + (notesDocs.length + 1), kind: "plain", body: "" });
  setActiveNote(notesDocs.length - 1);
  notesTitle.focus();
});
document.getElementById("notesNewFolder").addEventListener("click", () => {
  const taken = allNoteFolders();
  let n = 1;
  while (taken.has("Folder " + n)) { n += 1; }
  const path = "Folder " + n;
  notesFolders.push(path);
  notesFolderRenaming = path;   // rail opens straight into naming it
  renderNotesList();
  persistNotes();
});
// dropping a note on the rail's empty space files it back at the top level
noteDropTarget(notesListSeat, "");

notesTitle.addEventListener("input", () => {
  const doc = activeNote();
  doc.name = notesTitle.value.trim() || "Untitled";
  if (/\.(txt|md|markdown|tex|sty|bib)$/i.test(doc.name)) { doc.kind = kindFromName(doc.name); }
  syncNotesModeSeg();
  renderNotesList();
  persistNotes();
});
notesPad.addEventListener("input", () => {
  activeNote().body = notesPad.value;
  persistNotes();
  scheduleNotesPreview();
});
document.getElementById("notesClear").addEventListener("click", () => {
  activeNote().body = "";
  notesPad.value = "";
  persistNotes();
  renderNotesPreview();
  showToast("Cleared " + activeNote().name + ".", "trash");
});
document.getElementById("notesExport").addEventListener("click", () => {
  const doc = activeNote();
  if (doc.kind === "image") {
    const link = document.createElement("a");
    link.href = doc.body;   // data URLs download directly
    link.download = doc.name;
    link.click();
    showToast(doc.name + " exported.", "download");
    return;
  }
  const hasExt = /\.[a-z0-9]+$/i.test(doc.name);
  const ext = doc.kind === "tex" ? ".tex" : doc.kind === "markdown" ? ".md" : ".txt";
  const blob = new Blob([doc.body], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = hasExt ? doc.name : doc.name + ext;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(doc.name + " exported.", "download");
});

setActiveNote(notesActive);

let todos = safeLoad(STORAGE_KEYS.todos, null) || [
  { id: 1, text: "Review the handbook PDF", done: false },
  { id: 2, text: "Drop a real MP3 into the media deck", done: false },
  { id: 3, text: "Choose a permanent theme in Settings", done: true },
];
let todoFilter = "Open";

const todoFilterSeg = Segment({ options: ["Open", "All", "Done"], value: todoFilter });
document.getElementById("todoFilters").appendChild(todoFilterSeg);
todoFilterSeg.addEventListener("change", (e) => {
  todoFilter = e.detail.value;
  renderTodos();
});

function persistTodos() {
  localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
  refreshBrowserInternal();
}

function nextOpenTodo() {
  const todo = todos.find((item) => !item.done);
  return todo ? todo.text : "";
}

function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";
  const filtered = todos.filter((todo) => {
    if (todoFilter === "All") { return true; }
    if (todoFilter === "Done") { return todo.done; }
    return !todo.done;
  });
  filtered.forEach((todo) => {
    const row = el("div", { class: "ro-todo__item", data: { done: String(todo.done) } },
      el("button", {
        class: "ro-todo__toggle",
        type: "button",
        "aria-pressed": String(todo.done),
        onclick: () => {
          todo.done = !todo.done;
          persistTodos();
          renderTodos();
        },
      }, todo.done ? icon("check", 12) : ""),
      el("span", { class: "ro-todo__text" }, todo.text),
      el("button", {
        class: "ps-winbtn",
        type: "button",
        "aria-label": "Remove task",
        onclick: () => {
          todos = todos.filter((item) => item.id !== todo.id);
          persistTodos();
          renderTodos();
        },
      }, icon("close")));
    list.appendChild(row);
  });
  const open = todos.filter((todo) => !todo.done).length;
  document.getElementById("todoCount").textContent = open + (open === 1 ? " open task" : " open tasks");
  document.getElementById("mbTasks").textContent = open + (open === 1 ? " task" : " tasks");
}

document.getElementById("todoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("todoInput");
  const text = input.value.trim();
  if (!text) { return; }
  todos.unshift({ id: Date.now(), text, done: false });
  input.value = "";
  persistTodos();
  renderTodos();
});

document.getElementById("todoClearDone").addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  persistTodos();
  renderTodos();
});

renderTodos();

const pomoModes = {
  "Focus 25": { label: "Focus block", seconds: 25 * 60 },
  "Break 5": { label: "Short break", seconds: 5 * 60 },
  "Long 15": { label: "Long break", seconds: 15 * 60 },
};

let currentPomoMode = "Focus 25";
let pomoRemaining = pomoModes[currentPomoMode].seconds;
let pomoDeadline = 0;
let pomoRunning = false;
let pomoTimer = 0;
let pomoSessions = 0;

const pomoSeg = Segment({ options: Object.keys(pomoModes), value: currentPomoMode });
document.getElementById("pomoModes").appendChild(pomoSeg);
pomoSeg.addEventListener("change", (e) => {
  currentPomoMode = e.detail.value;
  resetPomodoro();
});

/* the PT-1 dial: a real 60-minute face — the wedge's angular span IS the
   remaining time, so Focus 25 physically covers 25 minutes of dial */
const SVG_NS = "http://www.w3.org/2000/svg";
const pomoDial = document.getElementById("pomoDial");
let pomoWedge = null;
{
  for (let minute = 0; minute < 60; minute += 1) {
    const angle = (minute / 60) * 2 * Math.PI;
    const quarter = minute % 15 === 0;
    const five = minute % 5 === 0;
    const outer = 96;
    const inner = quarter ? 82 : five ? 86 : 91;
    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("x1", String(100 + inner * Math.sin(angle)));
    tick.setAttribute("y1", String(100 - inner * Math.cos(angle)));
    tick.setAttribute("x2", String(100 + outer * Math.sin(angle)));
    tick.setAttribute("y2", String(100 - outer * Math.cos(angle)));
    tick.setAttribute("class", quarter ? "ro-dial__tick ro-dial__tick--q" : "ro-dial__tick");
    pomoDial.appendChild(tick);
  }
  const rim = document.createElementNS(SVG_NS, "circle");
  rim.setAttribute("cx", "100"); rim.setAttribute("cy", "100"); rim.setAttribute("r", "96");
  rim.setAttribute("class", "ro-dial__rim");
  pomoDial.appendChild(rim);
  pomoWedge = document.createElementNS(SVG_NS, "path");
  pomoWedge.setAttribute("class", "ro-dial__wedge");
  pomoDial.appendChild(pomoWedge);
  const hub = document.createElementNS(SVG_NS, "circle");
  hub.setAttribute("cx", "100"); hub.setAttribute("cy", "100"); hub.setAttribute("r", "44");
  hub.setAttribute("class", "ro-dial__hubring");
  pomoDial.appendChild(hub);
}

function drawPomoWedge(seconds) {
  const frac = clamp(seconds / 3600, 0, 1);
  if (frac <= 0) { pomoWedge.setAttribute("d", ""); return; }
  const r = 78;
  const theta = frac * 2 * Math.PI;
  const x = 100 + r * Math.sin(theta);
  const y = 100 - r * Math.cos(theta);
  pomoWedge.setAttribute("d",
    "M 100 100 L 100 " + (100 - r) +
    " A " + r + " " + r + " 0 " + (frac > 0.5 ? 1 : 0) + " 1 " + x.toFixed(2) + " " + y.toFixed(2) + " Z");
}

function renderPomoTally() {
  const seat = document.getElementById("pomoTally");
  seat.querySelectorAll("i").forEach((n) => n.remove());
  const cells = Math.max(4, Math.min(8, pomoSessions));
  const count = document.getElementById("pomoSessions");
  for (let i = cells - 1; i >= 0; i -= 1) {
    const cell = document.createElement("i");
    cell.setAttribute("data-done", String(i < pomoSessions));
    seat.insertBefore(cell, count);
  }
}

function fmtClock(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function syncPomodoro() {
  const config = pomoModes[currentPomoMode];
  document.getElementById("pomoLabel").textContent = config.label;
  document.getElementById("pomoTime").textContent = fmtClock(pomoRemaining);
  drawPomoWedge(pomoRemaining);
  document.getElementById("pomoLamp").setAttribute("data-on", String(pomoRunning));
  document.getElementById("pomoSessions").textContent = String(pomoSessions);
  renderPomoTally();
  const mbPomo = document.getElementById("mbPomo");
  mbPomo.hidden = !pomoRunning;
  document.getElementById("mbPomoText").textContent = fmtClock(pomoRemaining);
  refreshBrowserInternal();
}

function tickPomodoro() {
  if (!pomoRunning) { return; }
  pomoRemaining = Math.max(0, Math.round((pomoDeadline - Date.now()) / 1000));
  syncPomodoro();
  if (pomoRemaining <= 0) {
    pomoRunning = false;
    clearInterval(pomoTimer);
    pomoSessions += 1;
    document.getElementById("pomoStatus").textContent = "Block complete. Take a breath.";
    showToast(currentPomoMode + " finished.", "clock");
    syncPomodoro();
  }
}

function startPomodoro() {
  if (pomoRunning) { return; }
  pomoRunning = true;
  pomoDeadline = Date.now() + pomoRemaining * 1000;
  clearInterval(pomoTimer);
  pomoTimer = setInterval(tickPomodoro, 1000);
  document.getElementById("pomoStatus").textContent = "Timer is running.";
  syncPomodoro();
}

function pausePomodoro() {
  if (!pomoRunning) { return; }
  tickPomodoro();
  pomoRunning = false;
  clearInterval(pomoTimer);
  document.getElementById("pomoStatus").textContent = "Paused with " + fmtClock(pomoRemaining) + " remaining.";
  syncPomodoro();
}

function resetPomodoro() {
  pomoRunning = false;
  clearInterval(pomoTimer);
  pomoRemaining = pomoModes[currentPomoMode].seconds;
  document.getElementById("pomoStatus").textContent = "Next block is ready when you are.";
  syncPomodoro();
}

scheduleFitWindow("pomodoro");
document.getElementById("pomoStart").addEventListener("click", startPomodoro);
document.getElementById("pomoPause").addEventListener("click", pausePomodoro);
document.getElementById("pomoReset").addEventListener("click", resetPomodoro);
document.getElementById("pomoFromTodo").addEventListener("click", () => {
  const next = nextOpenTodo();
  document.getElementById("pomoTask").value = next;
  document.getElementById("pomoStatus").textContent = next ? "Loaded next task into focus." : "No open task to load.";
});
resetPomodoro();

let calcExpr = "0";
let calcAngle = "deg";
let calcAns = 0;
const calcKeys = [
  "CE", "DEL", "/", "*",
  "7", "8", "9", "-",
  "4", "5", "6", "+",
  "1", "2", "3", "=",
  "0", ".", "(", ")",
];
const calcSciKeys = [
  "sin(", "cos(", "tan(", "ln(", "^",
  "asin(", "acos(", "atan(", "log(", "√(",
  "π", "e", "!", "abs(", "exp(",
  "x²", "1/x", "%", "Ans", "DEG",
];

function renderCalc() {
  document.getElementById("calcDisplay").textContent = calcExpr || "0";
}

function calcFactorial(n) {
  if (n < 0 || n !== Math.floor(n) || n > 170) { return NaN; }
  let out = 1;
  for (let i = 2; i <= n; i += 1) { out *= i; }
  return out;
}

/* preprocess the human expression into plain JS, whitelist what remains,
   then evaluate with angle-aware trig bound in */
function calcEvaluate(expr) {
  let js = expr
    .replace(/√/g, "sqrt")
    .replace(/π/g, "PI")
    .replace(/\^/g, "**")
    .replace(/\bAns\b/gi, "(" + String(calcAns) + ")");
  let prev;
  do {
    prev = js;
    js = js.replace(/(\([^()]*\)|\d+(?:\.\d+)?)!/g, "fact($1)");
  } while (js !== prev);
  js = js.replace(/(^|[^a-zA-Z0-9_.])e(?![a-zA-Z0-9(])/g, "$1E");
  const stripped = js.replace(/\b(asin|acos|atan|sin|cos|tan|ln|log|sqrt|abs|exp|fact|PI|E)\b/g, "");
  if (!/^[0-9e+\-*/(),.%\s]*$/.test(stripped)) { return NaN; }
  const toRad = (x) => (calcAngle === "deg" ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (calcAngle === "deg" ? (x * 180) / Math.PI : x);
  try {
    const fn = Function(
      "sin", "cos", "tan", "asin", "acos", "atan",
      "ln", "log", "sqrt", "abs", "exp", "fact", "PI", "E",
      "return (" + js + ");");
    const result = fn(
      (x) => Math.sin(toRad(x)), (x) => Math.cos(toRad(x)), (x) => Math.tan(toRad(x)),
      (x) => fromRad(Math.asin(x)), (x) => fromRad(Math.acos(x)), (x) => fromRad(Math.atan(x)),
      Math.log, Math.log10, Math.sqrt, Math.abs, Math.exp, calcFactorial, Math.PI, Math.E);
    return typeof result === "number" ? result : NaN;
  } catch (err) {
    return NaN;
  }
}

function calcInput(key) {
  if (key === "CE") {
    calcExpr = "0";
  } else if (key === "DEL") {
    calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : "0";
  } else if (key === "=") {
    const result = calcEvaluate(calcExpr);
    if (Number.isFinite(result)) {
      calcAns = result;
      // 12 significant digits, without trailing float noise
      calcExpr = String(Number(result.toPrecision(12)));
    } else {
      calcExpr = "ERR";
    }
  } else if (key === "x²") {
    if (calcExpr !== "ERR") { calcExpr = "(" + calcExpr + ")^2"; }
  } else if (key === "1/x") {
    if (calcExpr !== "ERR") { calcExpr = "1/(" + calcExpr + ")"; }
  } else if (key === "DEG" || key === "RAD") {
    calcAngle = calcAngle === "deg" ? "rad" : "deg";
    syncCalcAngle();
  } else {
    calcExpr = calcExpr === "0" || calcExpr === "ERR" ? key : calcExpr + key;
  }
  renderCalc();
}

const calcKeySeat = document.getElementById("calcKeys");
calcKeys.forEach((key) => {
  const variant = /^[/*\-+=]$/.test(key) ? "accent" : "face";
  calcKeySeat.appendChild(el("button", {
    class: "ps-btn ps-btn--" + variant,
    type: "button",
    onclick: () => calcInput(key),
  }, key));
});

let calcAngleBtn = null;
const calcSciSeat = document.getElementById("calcSciKeys");
calcSciKeys.forEach((key) => {
  const btn = el("button", {
    class: "ps-btn ps-btn--face",
    type: "button",
    onclick: () => calcInput(key === "DEG" ? "DEG" : key),
  }, key);
  if (key === "DEG") { calcAngleBtn = btn; }
  calcSciSeat.appendChild(btn);
});

function syncCalcAngle() {
  const label = calcAngle.toUpperCase();
  if (calcAngleBtn) { calcAngleBtn.textContent = label; }
  document.getElementById("calcAngleReadout").textContent = label;
}

const calcModeSeg = Segment({ options: ["Basic", "Sci"], value: "Basic" });
document.getElementById("calcModeSeat").appendChild(calcModeSeg);
let calcBasicGeom = null;
calcModeSeg.addEventListener("change", (e) => {
  const sci = e.detail.value === "Sci";
  const win = windowMap.calc;
  calcSciSeat.hidden = !sci;
  document.getElementById("calcAngleReadout").hidden = !sci;
  win.dataset.calcmode = sci ? "sci" : "basic";
  if (sci) {
    // remember the basic frame; leaving sci mode restores it exactly
    calcBasicGeom = readGeom(win);
    scheduleFitWindow("calc");
  } else if (calcBasicGeom) {
    setGeom(win, { left: calcBasicGeom.left, top: calcBasicGeom.top, width: calcBasicGeom.width, height: calcBasicGeom.height });
    calcBasicGeom = null;
  }
});
syncCalcAngle();
renderCalc();

document.addEventListener("keydown", (e) => {
  if (topVisibleWindow() !== windowMap.calc) { return; }
  if (e.metaKey || e.ctrlKey || e.altKey) { return; }
  if (/^[0-9]$/.test(e.key) || [".", "+", "-", "*", "/", "(", ")", "^", "!", "%"].includes(e.key)) {
    calcInput(e.key);
    e.preventDefault();
  } else if (e.key === "Enter") {
    calcInput("=");
    e.preventDefault();
  } else if (e.key === "Backspace") {
    calcInput("DEL");
    e.preventDefault();
  } else if (e.key === "Escape") {
    calcInput("CE");
    e.preventDefault();
  }
});

const browserAddress = document.getElementById("browserAddress");
const browserFiles = document.getElementById("browserFiles");
const browserOpenFile = document.getElementById("browserOpenFile");
const manualFrame = document.getElementById("manualFrame");
const manualFiles = document.getElementById("manualFiles");
const manualOpenFull = document.getElementById("manualOpenFull");
const browserFrameSeat = document.getElementById("browserFrameSeat");
const browserRouteView = document.getElementById("browserRouteView");
const browserTabsSeat = document.getElementById("browserTabs");
const browserStatus = document.getElementById("browserStatus");
const browserRouteReadout = document.getElementById("browserRouteReadout");
const manualDrop = document.getElementById("manualDrop");
const manualStatus = document.getElementById("manualStatus");
let manualRoute = "";
let manualFrameRoute = "";
let manualUploadUrl = "";

installEmbeddedFrameFocusProxy(manualFrame);

if (window.ResizeObserver) {
  const fitObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const win = entry.target.closest(".ps-window");
      const key = win ? Object.keys(windowMap).find((name) => windowMap[name] === win) : "";
      if (key) { scheduleFitWindow(key); }
    });
  });
  AUTO_FIT_KEYS.forEach((key) => {
    const body = windowMap[key] && windowMap[key].querySelector(".ps-window__body");
    if (body) { fitObserver.observe(body); }
  });
}

const browserResources = [
  { title: "Navigator start", url: DEFAULT_BROWSER_ROUTE, meta: "The internal RetOS landing page." },
  { title: "FrogFind", url: "http://frogfind.com/", meta: "Retro search engine, strips the modern web to text." },
  { title: "Wiby", url: "https://wiby.me/", meta: "Search engine for the classic hand-made web." },
  { title: "Wikipedia roulette", url: "https://en.wikipedia.org/wiki/Special:Random", meta: "A random article, embedded live." },
  { title: "TextFiles", url: "http://textfiles.com/", meta: "The BBS-era text archive, still online." },
];

function joinHtml(parts) {
  return parts.join("");
}

const browserInternalPages = {
  "retos://start": () => {
    const openCount = Object.values(windowMap).filter((win) => !win.hidden).length;
    const openTasks = todos.filter((todo) => !todo.done).length;
    const notePreview = activeNote().body.trim().split("\n").slice(0, 2).join(" ");
    const currentTrack = tracks[playerIndex] || { name: "No track", artist: "Silent shelf" };
    return browserDoc("RetOS Start", joinHtml([
      '<div class="hero">',
      '<div class="eyebrow">Workstation overview</div>',
      '<h1>Everything is live.</h1>',
      '<p>The navigator dials the real web through Marginalia, opens your own pages and files, and keeps up with the actual state of the desktop.</p>',
      '<form data-search class="search">',
      '<input type="text" name="q" value="" placeholder="Search the old web, or type an address">',
      '<button type="submit">Search</button>',
      '</form>',
      '</div>',
      '<div class="stats">',
      '<div class="stat"><strong>' + openCount + '</strong><span>windows open</span></div>',
      '<div class="stat"><strong>' + openTasks + '</strong><span>open tasks</span></div>',
      '<div class="stat"><strong>' + themeName(settings.theme) + '</strong><span>current theme</span></div>',
      '<div class="stat"><strong>' + escapeHtml(currentTrack.name) + '</strong><span>' +
        (playerPlaying ? "now playing" : "loaded in deck") + '</span></div>',
      '</div>',
      '<div class="grid">',
      appCard("Navigator", "The live web, routes, and local pages", "browser"),
      appCard("Media Deck", "Spinning disk player with uploads", "player"),
      appCard("Settings", "Theme, tint, audio, startup", "settings"),
      appCard("PDF Viewer", "Embedded handbook reader", "manual"),
      appCard("Notes", "Autosaving desktop scratchpad", "notes"),
      appCard("Todo", "Persistent task list", "todo"),
      appCard("Pomodoro", "Focus timer tied to next task", "pomodoro"),
      appCard("Calculator", "Keyboard-ready desk calculator", "calc"),
      '</div>',
      '<div class="section"><h2>Quick actions</h2><div class="grid">',
      '<a class="card" data-url="http://frogfind.com/"><strong>Search the web with FrogFind</strong><div class="meta">The retro search engine, live in this window.</div></a>',
      '<a class="card" data-url="https://wiby.me/"><strong>Surf the hand-made web on Wiby</strong><div class="meta">Old-web search with a surprise button.</div></a>',
      '<a class="card" data-url="retos://library"><strong>Open navigator routes</strong><div class="meta">Web shelves and local resources.</div></a>',
      '<button class="card" data-action="open-all"><strong>Open every app</strong><div class="meta">Bring the whole desktop online at once.</div></button>',
      '<button class="card" data-action="reset-layout"><strong>Reset the studio layout</strong><div class="meta">Snap windows back to their intended positions.</div></button>',
      '</div></div>',
      '<div class="section"><h2>Desk note preview</h2><p>' + escapeHtml(notePreview || "No note written yet.") + '</p></div>',
    ]));
  },
  "retos://apps": () => browserDoc("App Drawer", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">Launchers</div>',
    '<h1>Every app in the workstation.</h1>',
    '<p>The dock, desktop icons, and this page all point at the same live windows.</p>',
    '</div>',
    '<div class="grid">',
    APP_INFO.map((app) => appCard(app.label, app.desc, app.key)).join(""),
    '</div>',
  ])),
  "retos://library": () => browserDoc("Navigator Routes", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">Web shelves and local resources</div>',
    '<h1>Places worth dialling.</h1>',
    '<p>Live sites that still embed politely, plus your own local pages and PDFs.</p>',
    '</div>',
    '<div class="grid">',
    browserResources.map((page) =>
      '<a class="card" data-url="' + page.url + '">' +
      '<strong>' + escapeHtml(page.title) + '</strong>' +
      '<div class="meta">' + escapeHtml(page.meta) + '</div>' +
      '</a>').join(""),
    '</div>',
  ])),
  "retos://manual": () => browserDoc("Handbook", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">PDF viewer</div>',
    '<h1>RetOS handbook.</h1>',
    '<p>The same PDF can live in the dedicated viewer or in this library tab. Both use the local file in <code>pdf/</code>.</p>',
    '</div>',
    '<div class="grid">',
    '<button class="card" data-open="manual"><strong>Open the PDF Viewer window</strong><div class="meta">Jump straight into the embedded manual.</div></button>',
    '<a class="card" data-url="./pdf/retos-handbook.pdf"><strong>Open handbook in this tab</strong><div class="meta">Treat the library as a PDF shelf too.</div></a>',
    '<a class="card" data-url="retos://storage"><strong>See saved workstation data</strong><div class="meta">Inspect what RetOS is storing locally.</div></a>',
    '</div>',
  ])),
  "retos://storage": () => {
    const openTasks = todos.filter((todo) => !todo.done).length;
    const startupApps = APP_INFO.filter((app) => settings.startup[app.key]).map((app) => app.label).join(", ");
    return browserDoc("Local Storage", joinHtml([
      '<div class="hero">',
      '<div class="eyebrow">Persistence</div>',
      '<h1>What this workstation remembers.</h1>',
      '<p>RetOS keeps everything local to this workstation: theme, wallpaper, notes, todos, startup choices, and deck volume.</p>',
      '</div>',
      '<div class="stats">',
      '<div class="stat"><strong>' + themeName(settings.theme) + '</strong><span>theme</span></div>',
      '<div class="stat"><strong>' + openTasks + '</strong><span>open tasks</span></div>',
      '<div class="stat"><strong>' + notesDocs.length + '</strong><span>note files</span></div>',
      '<div class="stat"><strong>' + settings.playerVolume + '%</strong><span>deck volume</span></div>',
      '</div>',
      '<div class="section"><h2>Startup apps</h2><p>' + escapeHtml(startupApps || "None selected.") + '</p></div>',
      '<div class="section"><h2>Current focus</h2><p>' +
        escapeHtml(document.getElementById("pomoTask").value || "No focus task loaded.") +
        '</p></div>',
    ]));
  },
};

function appCard(title, meta, appKey) {
  return `
    <button class="card" data-open="${appKey}">
      <strong>${escapeHtml(title)}</strong>
      <div class="meta">${escapeHtml(meta)}</div>
    </button>`;
}

function browserDoc(title, body) {
  return `<style>
    .ro-browser-page {
      min-height: 100%;
      display: grid;
      align-content: start;
      padding: 20px;
      box-sizing: border-box;
      background: var(--ps-paper);
      color: var(--ps-ink);
      font-family: "Pixelify Sans", sans-serif;
      line-height: 1.55;
    }
    .ro-browser-page * { box-sizing: border-box; }
    .ro-browser-page code { padding: 1px 4px; border: var(--ps-hair); background: var(--ps-chrome); color: var(--ps-ink); font-family: "VT323", monospace; font-size: 1.05em; }
    .ro-browser-page h1, .ro-browser-page h2 { margin: 0 0 10px; font-family: "DotGothic16", sans-serif; font-weight: 400; }
    .ro-browser-page .hero { margin-bottom: 18px; padding: 16px; border: var(--ps-hair); background: linear-gradient(180deg, var(--ps-paper), var(--ps-chrome)); box-shadow: var(--ps-shadow-sm); }
    .ro-browser-page .eyebrow { margin-bottom: 8px; color: var(--ps-gray-400); font-family: "VT323", monospace; font-size: 19px; letter-spacing: 1px; text-transform: uppercase; }
    .ro-browser-page .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .ro-browser-page .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 18px; }
    .ro-browser-page .stat { padding: 12px; border: var(--ps-hair); background: var(--ps-paper); box-shadow: var(--ps-shadow-sm); }
    .ro-browser-page .stat strong { display: block; font-family: "DotGothic16", sans-serif; font-size: 22px; line-height: 1; }
    .ro-browser-page .stat span { display: block; margin-top: 6px; color: var(--ps-gray-400); font-size: 14px; }
    .ro-browser-page .section { margin-top: 18px; }
    .ro-browser-page .card { display: block; width: 100%; padding: 12px; border: var(--ps-hair); background: var(--ps-paper); color: inherit; text-decoration: none; text-align: left; font: inherit; box-shadow: var(--ps-shadow-sm); cursor: pointer; }
    .ro-browser-page .card:hover, .ro-browser-page .card:focus-visible { background: var(--ps-face-hi); outline: none; }
    .ro-browser-page .card:active { box-shadow: var(--ps-inset); transform: translate(1px, 1px); }
    .ro-browser-page .meta { margin-top: 8px; color: var(--ps-gray-400); font-size: 14px; }
    .ro-browser-page .search { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .ro-browser-page .search input { flex: 1 1 220px; min-width: 0; padding: 8px 10px; border: var(--ps-hair); background: var(--ps-paper); color: var(--ps-ink); font: inherit; }
    .ro-browser-page .search button { padding: 8px 14px; border: var(--ps-hair); background: var(--ps-accent); color: var(--ps-ink); font: inherit; cursor: pointer; box-shadow: var(--ps-shadow-sm); }
    .ro-browser-page .search button:hover, .ro-browser-page .search button:focus-visible { background: var(--ps-face-hi); outline: none; }
    .ro-browser-page .search button:active { box-shadow: var(--ps-inset); transform: translate(1px, 1px); }
    .ro-browser-page p { margin: 0 0 10px; }
  </style>
  <div class="ro-browser-page">
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </div>`;
}

function blockedSiteDoc(route) {
  let host = "That site";
  try { host = new URL(route).hostname.replace(/^www\./, ""); } catch (err) { /* keep default */ }
  const youtubeHint = /youtube\.com$/.test(host)
    ? '<div class="card"><strong>Want a video in here?</strong><div class="meta">Paste any watch, shorts, or youtu.be link — the navigator rewrites it to the embeddable player and it plays right in this window.</div></div>'
    : "";
  return browserDoc("Won't Be Framed", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">X-Frame-Options</div>',
    '<h1>' + escapeHtml(host) + ' refuses to appear in a frame.</h1>',
    '<p>Big platforms send a header that forbids embedding, and no honest browser will override it. RetOS can hand the page to a real tab, or you can stay on the web that still likes being visited.</p>',
    '</div>',
    '<div class="grid">',
    '<a class="card" href="' + escapeHtml(route) + '" target="_blank" rel="noopener"><strong>Pop it out</strong><div class="meta">Open ' + escapeHtml(route) + ' in a real browser tab.</div></a>',
    youtubeHint,
    '<a class="card" data-url="https://search.marginalia.nu/"><strong>Search the open web instead</strong><div class="meta">Marginalia indexes the sites that still embed politely.</div></a>',
    '<a class="card" data-url="retos://start"><strong>Back to Start</strong><div class="meta">Return to the workstation overview.</div></a>',
    '</div>',
  ]));
}

function localPageDoc(route) {
  return browserDoc("Local Page", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">Standalone file</div>',
    '<h1>' + escapeHtml(labelFromRoute(route)) + '</h1>',
    '<p>This page has its own full desktop chrome, so the library links out to it instead of nesting another workstation inside this window.</p>',
    '</div>',
    '<div class="grid">',
    '<a class="card" href="' + escapeHtml(route) + '" target="_blank" rel="noopener"><strong>Open this page in a new tab</strong><div class="meta">' + escapeHtml(route) + '</div></a>',
    '<a class="card" data-url="retos://library"><strong>Back to library routes</strong><div class="meta">Browse supported local routes and files.</div></a>',
    '</div>',
  ]));
}

function labelFromRoute(route) {
  if (!route) { return "Blank"; }
  const meta = metaForRoute(route);
  if (meta) { return meta.label.replace(/\.[a-z0-9]+$/i, ""); }
  if (route.startsWith("retos://search")) { return "Search"; }
  if (browserInternalPages[route]) {
    return route.replace("retos://", "").replace(/^\w/, (c) => c.toUpperCase());
  }
  const resource = browserResources.find((item) => routeBase(item.url) === routeBase(route));
  if (resource) { return resource.title; }
  if (isPdfRoute(route)) { return "PDF"; }
  if (isHtmlRoute(route)) { return routeBase(route).split("/").pop().replace(".html", ""); }
  if (isExternalRoute(route)) {
    try { return new URL(route).hostname.replace(/^www\./, ""); } catch (err) { return "Web"; }
  }
  return route.length > 18 ? route.slice(0, 18) + "..." : route;
}

function searchResults(query) {
  const term = query.trim().toLowerCase();
  const localPages = browserResources.map((item) => ({
    title: item.title,
    meta: item.meta,
    url: item.url,
  }));
  const apps = APP_INFO.map((item) => ({
    title: item.label,
    meta: item.desc,
    open: item.key,
  }));
  return localPages.concat(apps).filter((item) => {
    const hay = [item.title, item.meta, item.url || item.open].join(" ").toLowerCase();
    return hay.includes(term);
  });
}

function routeToInternal(raw) {
  const match = /^retos:\/\/search\?q=(.*)$/i.exec(raw);
  if (match) {
    const query = decodeURIComponent(match[1] || "");
    const hits = searchResults(query);
    const resultsMarkup = hits.length
      ? hits.map((item) => {
        if (item.url) {
          return '<a class="card" data-url="' + item.url + '"><strong>' +
            escapeHtml(item.title) + '</strong><div class="meta">' +
            escapeHtml(item.meta) + '</div></a>';
        }
        return '<button class="card" data-open="' + item.open + '"><strong>' +
          escapeHtml(item.title) + '</strong><div class="meta">' +
          escapeHtml(item.meta) + '</div></button>';
      }).join("")
      : joinHtml([
        '<a class="card" data-url="retos://apps"><strong>Open app drawer</strong><div class="meta">Browse every built-in utility.</div></a>',
        '<a class="card" data-url="retos://library"><strong>Open library routes</strong><div class="meta">Jump into local pages in this repo.</div></a>',
      ]);
    return browserDoc("Search", joinHtml([
      '<div class="hero">',
      '<div class="eyebrow">Search</div>',
      '<h1>Results for "' + escapeHtml(query) + '"</h1>',
      '<p>' + (hits.length ? "Pick a result or open a direct route." : "Nothing matched. Try a local page, app name, or route.") + '</p>',
      '</div>',
      '<div class="grid">',
      resultsMarkup,
      '</div>',
    ]));
  }
  const page = browserInternalPages[raw];
  return page ? page() : browserDoc("Unknown Route", joinHtml([
    '<div class="hero">',
    '<div class="eyebrow">No route</div>',
    '<h1>' + escapeHtml(raw) + '</h1>',
    '<p>This workstation does not know that internal route yet.</p>',
    '</div>',
    '<div class="grid">',
    '<a class="card" data-url="retos://start"><strong>Return to Start</strong><div class="meta">Go back to the main workstation page.</div></a>',
    '<a class="card" data-url="retos://library"><strong>Browse local pages</strong><div class="meta">Open a real page from the repo instead.</div></a>',
    '</div>',
  ]));
}

function normaliseAddress(raw) {
  const value = raw.trim();
  if (!value) { return DEFAULT_BROWSER_ROUTE; }
  const lower = value.toLowerCase();
  if (value.startsWith("blob:")) { return value; }
  if (lower.startsWith("app://")) { return lower; }
  if (lower.startsWith("retos://")) { return lower; }
  if (/^https?:\/\//i.test(value)) { return value; }
  if (/^(\.\.\/|\.\/|\/)/.test(value) || /\.(html?|pdf)$/i.test(value)) { return value; }
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(value)) { return "https://" + value; }
  // words go to the live web through Marginalia, the old-web search engine
  return "https://search.marginalia.nu/search?query=" + encodeURIComponent(value);
}

let browserTabId = 4;
let browserTabs = [
  { id: 1, history: [DEFAULT_BROWSER_ROUTE], index: 0, label: "Start" },
  { id: 2, history: ["retos://library"], index: 0, label: "Routes" },
];
let activeBrowserTab = 1;

function currentBrowserTab() {
  return browserTabs.find((tab) => tab.id === activeBrowserTab) || browserTabs[0];
}

function currentBrowserRoute() {
  const tab = currentBrowserTab();
  return tab ? tab.history[tab.index] : "retos://start";
}

/* One live iframe per tab: switching tabs hides the old frame instead of
   unloading it, so a PDF keeps the page you left off and embedded pages
   keep their scroll and state. Closing a tab drops its frame. */
const browserTabFrames = new Map();

function ensureBrowserTabFrame(id) {
  let frame = browserTabFrames.get(id);
  if (frame) { return frame; }
  frame = el("iframe", { title: "RetOS library view", data: { live: "false" } });
  browserTabFrames.set(id, frame);
  installEmbeddedFrameFocusProxy(frame);
  frame.addEventListener("load", () => {
    syncEmbeddedFrameTheme(frame);
    if (id !== activeBrowserTab) { return; }
    const route = currentBrowserRoute();
    browserStatus.textContent = isExternalRoute(route)
      ? "Loaded " + labelFromRoute(route) + ". Blank page? That site refuses embedding — pop it out."
      : "Loaded " + labelFromRoute(route) + ".";
  });
  browserFrameSeat.appendChild(frame);
  return frame;
}

function showBrowserTabFrame(active) {
  browserTabFrames.forEach((frame) => { frame.dataset.live = String(frame === active); });
}

function dropBrowserTabFrame(id) {
  const frame = browserTabFrames.get(id);
  if (!frame) { return; }
  frame.remove();
  browserTabFrames.delete(id);
}

function mountBrowserTabFrame(tab, route) {
  browserRouteView.hidden = true;
  browserRouteView.innerHTML = "";
  const frame = ensureBrowserTabFrame(tab.id);
  if (frame.getAttribute("src") !== route) { frame.src = route; }
  showBrowserTabFrame(frame);
}

function syncBrowserButtons() {
  const tab = currentBrowserTab();
  document.getElementById("browserBack").disabled = !tab || tab.index <= 0;
  document.getElementById("browserForward").disabled = !tab || tab.index >= tab.history.length - 1;
}

function renderBrowserTabs() {
  browserTabsSeat.innerHTML = "";
  browserTabs.forEach((tab) => {
    const wrap = el("div", { class: "ro-browsertab", data: { active: String(tab.id === activeBrowserTab) } },
      el("button", {
        class: "ro-browsertab__main",
        type: "button",
        onclick: () => {
          activeBrowserTab = tab.id;
          renderBrowserTabs();
          renderBrowserRoute(currentBrowserRoute());
        },
      }, icon(tab.id === activeBrowserTab ? "book" : "window", 12),
      el("span", { class: "ro-browsertab__label" }, tab.label)),
      browserTabs.length > 1 ? el("button", {
        class: "ro-browsertab__close",
        type: "button",
        "aria-label": "Close tab",
        onclick: (e) => {
          e.stopPropagation();
          const index = browserTabs.findIndex((item) => item.id === tab.id);
          browserTabs.splice(index, 1);
          dropBrowserTabFrame(tab.id);
          if (activeBrowserTab === tab.id) {
            activeBrowserTab = browserTabs[Math.max(0, index - 1)].id;
          }
          renderBrowserTabs();
          renderBrowserRoute(currentBrowserRoute());
        },
      }, icon("close", 12)) : null);
    browserTabsSeat.appendChild(wrap);
  });
}

function createBrowserTab(route = DEFAULT_BROWSER_ROUTE) {
  const tab = { id: browserTabId++, history: [route], index: 0, label: labelFromRoute(route) };
  browserTabs.push(tab);
  activeBrowserTab = tab.id;
  renderBrowserTabs();
  renderBrowserRoute(route);
}

function renderBrowserRoute(route) {
  const tab = currentBrowserTab();
  if (!tab) { return; }
  tab.label = labelFromRoute(route);
  renderBrowserTabs();
  // never rewrite the address while the operator is typing in it
  if (document.activeElement !== browserAddress) { browserAddress.value = route; }
  browserRouteReadout.textContent = route;
  const hostile = isExternalRoute(route) && frameHostile(route);
  browserStatus.textContent = route.startsWith("retos://") ? "Loaded internal route." :
    isPdfRoute(route) ? "Loaded local PDF." :
    isHtmlRoute(route) ? "Standalone page linked out from the navigator." :
    hostile ? "That site refuses to be embedded." :
    isExternalRoute(route) ? "Dialling the live web…" :
    "Ready.";
  if (route.startsWith("retos://")) {
    showBrowserTabFrame(null);
    browserRouteView.hidden = false;
    browserRouteView.innerHTML = routeToInternal(route);
  } else if (hostile) {
    showBrowserTabFrame(null);
    browserRouteView.hidden = false;
    browserRouteView.innerHTML = blockedSiteDoc(route);
  } else if (isExternalRoute(route)) {
    mountBrowserTabFrame(tab, route);
  } else if (isHtmlRoute(route)) {
    showBrowserTabFrame(null);
    browserRouteView.hidden = false;
    browserRouteView.innerHTML = localPageDoc(route);
  } else {
    mountBrowserTabFrame(tab, route);
  }
  syncBrowserButtons();
}

function browserGo(raw, push = true) {
  const route = rewriteEmbedRoute(normaliseAddress(raw));
  if (route.startsWith("app://")) {
    showWindow(route.slice(6));
    browserStatus.textContent = "Opened app window.";
    return;
  }
  const tab = currentBrowserTab();
  if (push) {
    tab.history = tab.history.slice(0, tab.index + 1);
    tab.history.push(route);
    tab.index = tab.history.length - 1;
  }
  renderBrowserRoute(route);
}

function refreshBrowserInternal() {
  if (!browserReady) { return; }
  // live ticks (pomodoro, autosave, deck events) rebuild this page's HTML;
  // hold off while the operator is typing in one of its fields
  if (browserRouteView.contains(document.activeElement)) { return; }
  const route = currentBrowserRoute();
  if (route && route.startsWith("retos://")) {
    renderBrowserRoute(route);
  }
}

function handleBrowserFrameAction(payload) {
  if (!payload || !payload.type) { return; }
  if (payload.type === "route") {
    browserGo(payload.url || "", true);
  } else if (payload.type === "open") {
    showWindow(payload.app);
  } else if (payload.type === "theme") {
    applyTheme(payload.theme || "");
  } else if (payload.type === "action") {
    if (payload.action === "open-all") {
      restoreLayout(false);
      showToast("Every app opened.", "grid");
    } else if (payload.action === "reset-layout") {
      restoreLayout(true);
      showToast("Studio layout restored.", "refresh");
    }
  }
}

function openBrowserFile(file) {
  if (!file) { return; }
  const lower = file.name.toLowerCase();
  const kind = lower.endsWith(".pdf") || file.type === "application/pdf" ? "pdf" :
    (lower.endsWith(".html") || lower.endsWith(".htm") || /html/.test(file.type)) ? "html" :
    /^image\//.test(file.type) ? "image" :
    /^text\//.test(file.type) ? "text" : "file";
  if (kind === "file") {
    showToast("That file type does not preview well here.", "caution");
    return;
  }
  const url = rememberObjectUrl(file, kind);
  browserGo(kind === "pdf" ? url + PDF_VIEW_HASH : url, true);
  showToast(file.name + " opened in the library.", kind === "pdf" ? "doc" : "folder-open");
}

function applyManualRoute(baseRoute, label) {
  manualRoute = baseRoute;
  manualFrameRoute = baseRoute + PDF_VIEW_HASH;
  if (manualFrame.getAttribute("src") !== manualFrameRoute) {
    manualFrame.src = manualFrameRoute;
  }
  manualFrame.hidden = false;
  document.getElementById("manualEmpty").hidden = true;
  manualOpenFull.hidden = false;
  manualOpenFull.href = baseRoute;
  manualOpenFull.setAttribute("aria-label", "Open " + label + " full size");
  if (manualStatus) {
    manualStatus.textContent = label + " loaded.";
  }
}

function openManualFile(file) {
  if (!file) { return; }
  const valid = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!valid) {
    showToast("Only PDF files belong in the viewer.", "caution");
    return;
  }
  if (manualUploadUrl) {
    URL.revokeObjectURL(manualUploadUrl);
    objectUrls.delete(manualUploadUrl);
    objectUrlMeta.delete(manualUploadUrl);
  }
  manualUploadUrl = rememberObjectUrl(file, "pdf");
  applyManualRoute(manualUploadUrl, file.name);
  showToast(file.name + " loaded into the viewer.", "doc");
}

document.getElementById("browserGo").addEventListener("click", () => {
  browserAddress.blur();   // committed: let the bar show the normalised route
  browserGo(browserAddress.value, true);
});
document.getElementById("browserHome").addEventListener("click", () => browserGo(DEFAULT_BROWSER_ROUTE, true));
document.getElementById("browserNewTab").addEventListener("click", () => createBrowserTab(DEFAULT_BROWSER_ROUTE));
document.getElementById("browserBack").addEventListener("click", () => {
  const tab = currentBrowserTab();
  if (!tab || tab.index <= 0) { return; }
  tab.index -= 1;
  renderBrowserRoute(tab.history[tab.index]);
});
document.getElementById("browserForward").addEventListener("click", () => {
  const tab = currentBrowserTab();
  if (!tab || tab.index >= tab.history.length - 1) { return; }
  tab.index += 1;
  renderBrowserRoute(tab.history[tab.index]);
});
browserAddress.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    browserAddress.blur();   // committed: let the bar show the normalised route
    browserGo(browserAddress.value, true);
  }
});
browserOpenFile.addEventListener("click", () => browserFiles.click());
browserFiles.addEventListener("change", () => {
  openBrowserFile(browserFiles.files && browserFiles.files[0]);
  browserFiles.value = "";
});
document.querySelector(".ro-browser__bookmarks").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-url]");
  if (!btn) { return; }
  browserGo(btn.dataset.url, true);
});

browserRouteView.addEventListener("click", (e) => {
  const routeBtn = e.target.closest("[data-url]");
  const openBtn = e.target.closest("[data-open]");
  const themeBtn = e.target.closest("[data-theme]");
  const actionBtn = e.target.closest("[data-action]");
  if (routeBtn) {
    e.preventDefault();
    handleBrowserFrameAction({ type: "route", url: routeBtn.getAttribute("data-url") });
    return;
  }
  if (openBtn) {
    e.preventDefault();
    handleBrowserFrameAction({ type: "open", app: openBtn.getAttribute("data-open") });
    return;
  }
  if (themeBtn) {
    e.preventDefault();
    handleBrowserFrameAction({ type: "theme", theme: themeBtn.getAttribute("data-theme") });
    return;
  }
  if (actionBtn) {
    e.preventDefault();
    handleBrowserFrameAction({ type: "action", action: actionBtn.getAttribute("data-action") });
  }
});

browserRouteView.addEventListener("submit", (e) => {
  const form = e.target.closest("form[data-search]");
  if (!form) { return; }
  e.preventDefault();
  const field = form.querySelector("[name=q]");
  handleBrowserFrameAction({ type: "route", url: field ? field.value : "" });
});

document.getElementById("browserReload").addEventListener("click", () => {
  const route = currentBrowserRoute();
  const frame = browserTabFrames.get(activeBrowserTab);
  if (route.startsWith("retos://")) {
    renderBrowserRoute(route);
  } else if (frame && frame.dataset.live === "true" && frame.getAttribute("src")) {
    frame.src = frame.getAttribute("src");   // cross-origin-safe reload
    browserStatus.textContent = "Reloading…";
  } else {
    renderBrowserRoute(route);
  }
});

document.getElementById("browserPopout").addEventListener("click", () => {
  const route = currentBrowserRoute();
  if (route.startsWith("retos://")) {
    showToast("Internal pages only live inside RetOS.", "caution");
    return;
  }
  window.open(route, "_blank", "noopener");
  showToast("Opened in a real browser tab.", "window");
});

document.getElementById("manualUpload").addEventListener("click", () => manualFiles.click());
manualFiles.addEventListener("change", () => {
  openManualFile(manualFiles.files && manualFiles.files[0]);
  manualFiles.value = "";
});

document.getElementById("manualReload").addEventListener("click", () => {
  if (!manualFrameRoute) {
    showToast("Nothing to reload — load a PDF first.", "caution");
    return;
  }
  manualFrame.src = manualFrameRoute;
  showToast("PDF viewer reloaded.", "doc");
});

document.getElementById("manualInBrowser").addEventListener("click", () => {
  if (!manualRoute) {
    showToast("Load a PDF first.", "caution");
    return;
  }
  showWindow("browser");
  browserGo(manualRoute, true);
});

["dragenter", "dragover"].forEach((type) => {
  windowMap.manual.addEventListener(type, (e) => {
    e.preventDefault();
    if (manualDrop) { manualDrop.dataset.drop = "true"; }
  });
});
["dragleave", "drop"].forEach((type) => {
  windowMap.manual.addEventListener(type, (e) => {
    e.preventDefault();
    if (manualDrop) { manualDrop.dataset.drop = "false"; }
  });
});
windowMap.manual.addEventListener("drop", (e) => {
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    openManualFile(e.dataTransfer.files[0]);
  }
});

const playerFiles = document.getElementById("playerFiles");
const playerUpload = document.getElementById("playerUpload");
const playerFolder = document.getElementById("playerFolder");
const playerDisc = document.getElementById("playerDisc");
const playerTitle = document.getElementById("playerTitle");
const playerMeta = document.getElementById("playerMeta");
const playerWave = document.getElementById("playerWave");
const playerPlaylist = document.getElementById("playerPlaylist");
/* the side tick strip IS the volume readout: one tick per 10%, lit in accent */
const playerVolTicks = document.getElementById("playerVolTicks");
const volTicks = [];
for (let i = 0; i < 10; i += 1) {
  const tick = document.createElement("i");
  playerVolTicks.appendChild(tick);
  volTicks.push(tick);
}
const settingsVolume = document.getElementById("settingsVolume");
const settingsVolumeText = document.getElementById("settingsVolumeText");
const playerLamp = document.getElementById("playerLamp");
const playerOledTime = document.getElementById("playerOledTime");
const playerOledIndex = document.getElementById("playerOledIndex");
const audio = new Audio();
audio.preload = "auto";

const vu = VuMeter({ bars: 18 });
document.getElementById("playerVu").appendChild(vu);
const vuBars = Array.from(vu.children);

let decodeContext = null;
function getDecodeContext() {
  if (!decodeContext) { decodeContext = new OfflineAudioContext(1, 1, 44100); }
  return decodeContext;
}

let audioContext = null;
let audioSource = null;
let playerGain = null;
let analyser = null;
let playerFreq = null;
let waveBars = [];
let playerPlaying = false;
let playerSeeking = false;

function ensurePlayerAudio() {
  if (audioContext) { return; }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioSource = audioContext.createMediaElementSource(audio);
  playerGain = audioContext.createGain();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.75;
  playerFreq = new Uint8Array(analyser.frequencyBinCount);
  audioSource.connect(playerGain);
  playerGain.connect(analyser);
  analyser.connect(audioContext.destination);
  syncVolume(settings.playerVolume, false);
}

function wavBlobFromChannels(channels, sampleRate) {
  const frames = channels[0].length;
  const channelCount = channels.length;
  const ab = new ArrayBuffer(44 + frames * channelCount * 2);
  const view = new DataView(ab);
  const write = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + frames * channelCount * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 2, true);
  view.setUint16(32, channelCount * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, frames * channelCount * 2, true);
  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    for (let c = 0; c < channelCount; c += 1) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

function peaksFromArray(data, count) {
  const step = Math.max(1, Math.floor(data.length / count));
  const peaks = [];
  for (let i = 0; i < count; i += 1) {
    let max = 0;
    const start = i * step;
    const end = Math.min(data.length, start + step);
    for (let j = start; j < end; j += 16) {
      const value = Math.abs(data[j] || 0);
      if (value > max) { max = value; }
    }
    peaks.push(10 + Math.min(88, max * 120));
  }
  return peaks;
}

function peaksFromBuffer(buffer) {
  return peaksFromArray(buffer.getChannelData(0), 96);
}

function synthDemoTrack(name, artist, base, pad, sparkle, duration) {
  const rate = 22050;
  const frames = Math.floor(rate * duration);
  const mono = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    const t = i / rate;
    const beat = t % 0.44;
    const kick = Math.sin(2 * Math.PI * base * t) * Math.exp(-beat * 8);
    const chord = 0.18 * Math.sin(2 * Math.PI * pad * t) +
      0.12 * Math.sin(2 * Math.PI * pad * 1.5 * t);
    const fizz = 0.04 * Math.sin(2 * Math.PI * sparkle * t);
    const hiss = ((((i * 1103515245) + 12345) >>> 0) / 4294967295) * 2 - 1;
    mono[i] = Math.max(-1, Math.min(1, kick * 0.55 + chord + fizz + hiss * 0.02));
  }
  return {
    name,
    artist,
    url: URL.createObjectURL(wavBlobFromChannels([mono], rate)),
    duration,
    peaks: peaksFromArray(mono, 96),
    demo: true,
  };
}

function buildDemoTracks() {
  // ejected demos stay ejected; "Restore demo playlist" clears the dismissals
  const dismissed = settings.dismissedDemos || [];
  return [
    ["Startup Jam", "RetOS demo disk", 98, 220, 660, 6.4],
    ["Night Bus", "Transit loop", 112, 196, 784, 7.2],
    ["Warm Boot", "Utility tape", 86, 174, 522, 5.8],
  ].filter((spec) => !dismissed.includes(spec[0]))
    .map((spec) => synthDemoTrack(...spec));
}

let tracks = buildDemoTracks();
let playerIndex = 0;

/* Your own tracks persist in IndexedDB (audio blobs are far too big for
   localStorage). Demo tracks are synthesized fresh on every boot instead. */
let trackDB = null;
function openTrackDB() {
  return new Promise((resolve) => {
    if (trackDB) { resolve(trackDB); return; }
    let req;
    try { req = indexedDB.open("retos-workstation", 1); } catch (err) { resolve(null); return; }
    req.onupgradeneeded = () => {
      req.result.createObjectStore("tracks", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => { trackDB = req.result; resolve(trackDB); };
    req.onerror = () => resolve(null);
  });
}

function storeTrack(track, blob) {
  openTrackDB().then((db) => {
    if (!db) { return; }
    const record = {
      name: track.name, artist: track.artist, blob,
      duration: track.duration || 0, peaks: track.peaks || null,
    };
    if (track.id != null) { record.id = track.id; }
    const req = db.transaction("tracks", "readwrite").objectStore("tracks").put(record);
    req.onsuccess = () => { track.id = req.result; };
  });
}

function unstoreTrack(id) {
  if (id == null) { return; }
  openTrackDB().then((db) => {
    if (db) { db.transaction("tracks", "readwrite").objectStore("tracks").delete(id); }
  });
}

function clearTrackStore() {
  openTrackDB().then((db) => {
    if (db) { db.transaction("tracks", "readwrite").objectStore("tracks").clear(); }
  });
}

function loadStoredTracks() {
  openTrackDB().then((db) => {
    if (!db) { return; }
    const req = db.transaction("tracks").objectStore("tracks").getAll();
    req.onsuccess = () => {
      const rows = req.result || [];
      if (!rows.length) { return; }
      const deckWasEmpty = !tracks.length;
      rows.forEach((row) => {
        tracks.push({
          id: row.id,
          name: row.name,
          artist: row.artist || "From your shelf",
          url: URL.createObjectURL(row.blob),
          duration: row.duration || 0,
          peaks: row.peaks || peaksFromArray(new Float32Array(96), 96),
          demo: false,
        });
      });
      /* with the demos dismissed the deck booted empty on stale markup;
         prime the first real song so title, waveform, and OLED are live */
      if (deckWasEmpty) {
        loadTrack(0);
      } else {
        renderPlaylist();
        refreshBrowserInternal();
      }
      showToast(rows.length + (rows.length === 1 ? " saved track" : " saved tracks") + " back on the deck.", "disc");
    };
  });
}

function renderWave(peaks) {
  const wrap = el("div", { class: "ps-waveform" });
  peaks.forEach((height) => {
    wrap.appendChild(el("span", {
      class: "ps-waveform__bar",
      data: { past: "false" },
      style: { height: height + "%" },
    }));
  });
  playerWave.innerHTML = "";
  playerWave.appendChild(wrap);
  waveBars = Array.from(wrap.children);
}

function paintWaveProgress(ratio) {
  const played = Math.floor(clamp(ratio, 0, 1) * waveBars.length);
  waveBars.forEach((bar, index) => bar.setAttribute("data-past", String(index < played)));
  playerWave.setAttribute("aria-valuenow", String(Math.round(clamp(ratio, 0, 1) * 100)));
}

function renderPlaylist() {
  playerPlaylist.innerHTML = "";
  if (!tracks.length) {
    playerPlaylist.appendChild(
      el("div", { class: "ps-meta", style: { padding: "10px 12px" } },
        "Deck is empty. Load or drop audio, or restore the demo playlist in Settings."));
    scheduleFitWindow("player");
    return;
  }
  tracks.forEach((track, index) => {
    const opt = el("button", {
      class: "ps-listbox__opt",
      role: "option",
      type: "button",
      "aria-selected": String(index === playerIndex),
      onclick: () => {
        loadTrack(index);
        if (playerPlaying) { playTrack(); }
      },
    }, index === playerIndex && playerPlaying ? icon("play", 12) : icon("disc", 12),
    " " + track.name + " · " + fmtClock(Math.round(track.duration || 0)));
    const eject = el("button", {
      class: "ps-winbtn ro-track__eject",
      type: "button",
      "aria-label": "Eject " + track.name,
      onclick: () => removeTrack(index),
    }, icon("close"));
    playerPlaylist.appendChild(el("div", { class: "ro-track" }, opt, eject));
  });
  scheduleFitWindow("player");
}

function clearDeckReadout() {
  playerTitle.textContent = "Deck empty";
  playerMeta.textContent = "Load or drop audio to begin.";
  playerOledTime.textContent = "0.00.00";
  playerOledIndex.textContent = "00";
  renderWave(peaksFromArray(new Float32Array(96), 96));
}

function removeTrack(index) {
  const track = tracks[index];
  if (!track) { return; }
  const removingCurrent = index === playerIndex;
  if (!track.demo) { URL.revokeObjectURL(track.url); }
  if (track.demo && !settings.dismissedDemos.includes(track.name)) {
    settings.dismissedDemos.push(track.name);
    persistSettings();
  }
  unstoreTrack(track.id);
  tracks.splice(index, 1);
  if (!tracks.length) {
    audio.pause();
    audio.removeAttribute("src");
    playerPlaying = false;
    playerIndex = 0;
    clearDeckReadout();
    syncPlayerButtons();
    renderPlaylist();
    refreshBrowserInternal();
  } else if (removingCurrent) {
    const wasPlaying = playerPlaying;
    playerPlaying = false;
    loadTrack(Math.min(index, tracks.length - 1));
    if (wasPlaying) { playTrack(); } else { syncPlayerButtons(); }
  } else {
    if (index < playerIndex) { playerIndex -= 1; }
    renderPlaylist();
  }
  showToast("Ejected " + track.name + ".", "trash");
}

/* the title is hashed into two hues; HSL keeps saturation and lightness in
   a tasteful band so any name lands on a good-looking pair */
function discColors(name) {
  let h = 5381;
  for (let i = 0; i < name.length; i += 1) { h = ((h << 5) + h + name.charCodeAt(i)) >>> 0; }
  const h1 = h % 360;
  const h2 = (h1 + 50 + ((h >> 8) % 70)) % 360;
  return ["hsl(" + h1 + ", 62%, 58%)", "hsl(" + h2 + ", 68%, 42%)"];
}

function loadTrack(index) {
  if (!tracks.length) { return; }
  playerIndex = ((index % tracks.length) + tracks.length) % tracks.length;
  const track = tracks[playerIndex];
  const tint = discColors(track.name);
  playerDisc.style.setProperty("--ro-disc-a", tint[0]);
  playerDisc.style.setProperty("--ro-disc-b", tint[1]);
  audio.src = track.url;
  audio.currentTime = 0;
  playerTitle.textContent = track.name;
  playerMeta.textContent = track.artist + " · 00:00 / " + fmtClock(Math.round(track.duration || 0));
  playerOledTime.textContent = "0.00.00";
  playerOledIndex.textContent = String(playerIndex + 1).padStart(2, "0");
  renderWave(track.peaks || peaksFromArray(new Float32Array(96), 96));
  renderPlaylist();
  refreshBrowserInternal();
  scheduleFitWindow("player");
}

function syncPlayerButtons() {
  const playBtn = document.getElementById("playerPlay");
  const label = playerPlaying ? "Pause playback" : "Play track";
  playBtn.replaceChildren(playerPlaying ? icon("pause", 24) : icon("play", 24));
  playBtn.setAttribute("aria-label", label);
  playBtn.setAttribute("aria-pressed", String(playerPlaying));
  playBtn.title = label;
  playerDisc.setAttribute("data-spin", String(playerPlaying && !prefersReduced));
  playerLamp.setAttribute("data-on", String(playerPlaying));
  const mbTrack = document.getElementById("mbTrack");
  const current = tracks[playerIndex];
  mbTrack.hidden = !(playerPlaying && current);
  if (current) { document.getElementById("mbTrackText").textContent = current.name; }
}

function syncVolume(value, persist = true) {
  const clean = clamp(Number(value) || 0, 0, 100);
  settingsVolume.value = String(clean);
  settingsVolumeText.textContent = clean + "%";
  const lit = Math.round((clean / 100) * volTicks.length);
  volTicks.forEach((tick, index) => tick.setAttribute("data-lit", String(index < lit)));
  playerVolTicks.setAttribute("aria-valuenow", String(clean));
  playerVolTicks.title = "Volume " + clean + "%";
  settings.playerVolume = clean;
  if (playerGain) { playerGain.gain.value = Math.pow(clean / 100, 1.6); }
  if (persist) { persistSettings(); }
  refreshBrowserInternal();
}

function playTrack() {
  if (!tracks.length) { return; }
  ensurePlayerAudio();
  if (audioContext.state === "suspended") { audioContext.resume(); }
  audio.play().then(() => {
    playerPlaying = true;
    syncPlayerButtons();
    renderPlaylist();
    refreshBrowserInternal();
  }).catch(() => {
    showToast("The deck refused to roll. Try another file.", "caution");
  });
}

function pauseTrack() {
  audio.pause();
  playerPlaying = false;
  syncPlayerButtons();
  renderPlaylist();
  refreshBrowserInternal();
}

function stopTrack() {
  audio.pause();
  audio.currentTime = 0;
  playerPlaying = false;
  syncPlayerButtons();
  renderPlaylist();
  refreshBrowserInternal();
}

function restoreDemoPlaylist() {
  tracks.forEach((track) => {
    if (!track.demo) { URL.revokeObjectURL(track.url); }
  });
  clearTrackStore();
  settings.dismissedDemos = [];
  persistSettings();
  tracks = buildDemoTracks();
  playerPlaying = false;
  loadTrack(0);
  syncPlayerButtons();
  showToast("Demo playlist restored.", "disc");
  scheduleFitWindow("player");
}

function addFiles(fileList) {
  Array.from(fileList).forEach((file) => {
    if (!/^audio\//.test(file.type) && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
      showToast("Skipped " + file.name + ".", "caution");
      return;
    }
    const track = {
      name: file.name.replace(/\.[a-z0-9]+$/i, ""),
      artist: "From your shelf",
      url: URL.createObjectURL(file),
      duration: 0,
      peaks: peaksFromArray(new Float32Array(96), 96),
      demo: false,
    };
    tracks.push(track);
    file.arrayBuffer()
      .then((ab) => getDecodeContext().decodeAudioData(ab))
      .then((buffer) => {
        track.duration = buffer.duration;
        track.peaks = peaksFromBuffer(buffer);
        if (tracks[playerIndex] === track) {
          renderWave(track.peaks);
        }
        renderPlaylist();
        scheduleFitWindow("player");
        storeTrack(track, file);
      })
      .catch(() => {
        showToast("Could not read waveform for " + file.name + ".", "caution");
        storeTrack(track, file);
      });
    renderPlaylist();
    loadTrack(tracks.length - 1);
    showToast(track.name + " loaded into the deck.", "disc");
    scheduleFitWindow("player");
  });
}

document.getElementById("playerPlay").addEventListener("click", () => {
  if (playerPlaying) { pauseTrack(); }
  else { playTrack(); }
});
document.getElementById("playerStop").addEventListener("click", stopTrack);
document.getElementById("playerPrev").addEventListener("click", () => {
  loadTrack(playerIndex - 1);
  if (playerPlaying) { playTrack(); }
});
document.getElementById("playerNext").addEventListener("click", () => {
  loadTrack(playerIndex + 1);
  if (playerPlaying) { playTrack(); }
});
/* one LOAD hub, both worlds: native pickers cannot mix files and folders in
   a single dialog, so the hub opens a two-key menu */
const playerLoadMenu = document.getElementById("playerLoadMenu");
playerUpload.addEventListener("click", () => {
  playerLoadMenu.hidden = !playerLoadMenu.hidden;
});
document.getElementById("playerLoadFiles").addEventListener("click", () => {
  playerLoadMenu.hidden = true;
  playerFiles.click();
});
document.getElementById("playerLoadFolder").addEventListener("click", () => {
  playerLoadMenu.hidden = true;
  playerFolder.click();
});
document.addEventListener("click", (e) => {
  if (!playerLoadMenu.hidden && !e.target.closest("#playerLoadMenu, #playerUpload")) {
    playerLoadMenu.hidden = true;
  }
});
playerFiles.addEventListener("change", () => {
  addFiles(playerFiles.files);
  playerFiles.value = "";
});
playerFolder.addEventListener("change", () => {
  addFiles(playerFolder.files);   // addFiles filters the folder down to audio
  playerFolder.value = "";
});

/* seeking lives in the waveform now: press paints the scrub position live,
   release commits it to the transport */
function waveRatio(e) {
  const rect = playerWave.getBoundingClientRect();
  return rect.width ? clamp((e.clientX - rect.left) / rect.width, 0, 1) : 0;
}
function trackDuration() {
  return audio.duration || (tracks[playerIndex] && tracks[playerIndex].duration) || 0;
}
let waveScrub = 0;
playerWave.addEventListener("pointerdown", (e) => {
  if (!tracks.length || !trackDuration()) { return; }
  playerSeeking = true;
  waveScrub = waveRatio(e);
  paintWaveProgress(waveScrub);
  playerWave.setPointerCapture(e.pointerId);
});
playerWave.addEventListener("pointermove", (e) => {
  if (!playerSeeking) { return; }
  waveScrub = waveRatio(e);
  paintWaveProgress(waveScrub);
});
playerWave.addEventListener("pointerup", () => {
  if (!playerSeeking) { return; }
  audio.currentTime = waveScrub * trackDuration();
  playerSeeking = false;
});
playerWave.addEventListener("pointercancel", () => {
  playerSeeking = false;
});
playerWave.addEventListener("keydown", (e) => {
  const duration = trackDuration();
  if (!duration) { return; }
  const jumps = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5 };
  if (e.key in jumps) {
    audio.currentTime = clamp(audio.currentTime + jumps[e.key], 0, duration);
    e.preventDefault();
  } else if (e.key === "Home") {
    audio.currentTime = 0;
    e.preventDefault();
  } else if (e.key === "End") {
    audio.currentTime = duration;
    e.preventDefault();
  }
});

settingsVolume.addEventListener("input", () => syncVolume(settingsVolume.value));
document.getElementById("playerVolUp").addEventListener("click", () => syncVolume(settings.playerVolume + 5));
document.getElementById("playerVolDown").addEventListener("click", () => syncVolume(settings.playerVolume - 5));
/* hearts write to a real Request Sheet note, not into the void */
document.getElementById("playerHeart").addEventListener("click", () => {
  const track = tracks[playerIndex];
  if (!track) { return; }
  const now = new Date();
  const stamp = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  let sheet = notesDocs.find((d) => d.name === "Request Sheet.md");
  if (!sheet) {
    sheet = { name: "Request Sheet.md", kind: "markdown", body: "# Request Sheet\n" };
    notesDocs.push(sheet);
  }
  sheet.body += "\n- **" + stamp + "** " + track.name + " — " + track.artist;
  if (activeNote() === sheet) {
    notesPad.value = sheet.body;
    scheduleNotesPreview();
  }
  renderNotesList();
  persistNotes();
  showToast("“" + track.name + "” logged to the Request Sheet in Notes.", "heart");
});
document.getElementById("playerRestoreDemo").addEventListener("click", restoreDemoPlaylist);

/* drops anywhere in the window still load tracks; the hint strip is gone */
["dragenter", "dragover", "dragleave"].forEach((type) => {
  windowMap.player.addEventListener(type, (e) => e.preventDefault());
});
windowMap.player.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files) {
    addFiles(e.dataTransfer.files);
  }
});

audio.addEventListener("ended", () => {
  if (!tracks.length) { return; }
  loadTrack(playerIndex + 1);
  playTrack();
});

function tickPlayer() {
  const track = tracks[playerIndex];
  const duration = audio.duration || (track && track.duration) || 0;
  const current = audio.currentTime || 0;
  if (track) {
    playerMeta.textContent = track.artist + " · " + fmtClock(Math.round(current)) +
      " / " + fmtClock(Math.round(duration));
    playerOledTime.textContent = "0." + fmtClock(Math.round(current)).replace(":", ".");
  }
  if (!playerSeeking) {
    paintWaveProgress(duration ? current / duration : 0);
  }
  if (analyser && playerPlaying) {
    analyser.getByteFrequencyData(playerFreq);
    const bucket = Math.max(1, Math.floor(playerFreq.length / vuBars.length));
    vuBars.forEach((bar, index) => {
      let peak = 0;
      for (let i = index * bucket; i < Math.min(playerFreq.length, (index + 1) * bucket); i += 1) {
        if (playerFreq[i] > peak) { peak = playerFreq[i]; }
      }
      const level = Math.max(6, Math.round((peak / 255) * 100));
      bar.style.height = level + "%";
      bar.setAttribute("data-hot", String(level > 82));
    });
  } else {
    vuBars.forEach((bar) => {
      const currentHeight = parseFloat(bar.style.height || "6");
      bar.style.height = Math.max(6, currentHeight - 4) + "%";
      bar.setAttribute("data-hot", "false");
    });
  }
  requestAnimationFrame(tickPlayer);
}

audio.addEventListener("play", () => refreshBrowserInternal());
audio.addEventListener("pause", () => refreshBrowserInternal());

/* an empty queue must not leave the markup's placeholder on the deck */
if (tracks.length) {
  loadTrack(0);
} else {
  clearDeckReadout();
  renderPlaylist();
}
syncPlayerButtons();
syncVolume(settings.playerVolume, false);
loadStoredTracks();
requestAnimationFrame(tickPlayer);

function startBootSequence() {
  const controller = window.__retosBoot;
  if (!controller) { return; }
  if (!settings.boot || prefersReduced) {
    controller.complete("", true);
    return;
  }
  controller.start();
  const elapsed = controller.startedAt ? Date.now() - controller.startedAt : 0;
  const remaining = Math.max(0, 1350 - elapsed);
  window.setTimeout(() => controller.complete("Desktop ready."), remaining);
}

applyTheme(settings.theme);
applyDesktopOptions();
renderStartupList();
restoreLayout(true);
browserReady = true;
renderBrowserTabs();
renderBrowserRoute(currentBrowserRoute());
startBootSequence();
syncLaunchers();
fitVisibleAutoWindows();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    fitVisibleAutoWindows();
  });
}
