/* Einstellungen für GM Tools · Fokuspointer. Speichert über Owlbear-Tool-Metadaten. */
import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

const TOOL_ID = "de.gmtools.fokuspointer/tool";
const DEFAULTS = {
  mode: "screen", screenRadius: 85, mapRadius: 240,
  color: "#ff554e", flashMs: 950,
  display: "ring", ringStrokePx: 5,
};
let settings = { ...DEFAULTS };
let initialized = false;
let saving = Promise.resolve();

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v,min,max) => Math.max(min, Math.min(max,v));
function sanitize(meta) {
  return {
    mode: meta?.mode === "map" ? "map" : "screen",
    display: meta?.display === "pointer" ? "pointer" : "ring",
    ringStrokePx: clamp(Number(meta?.ringStrokePx) || 5, 2, 12),
    screenRadius: clamp(Number(meta?.screenRadius) || 85,16,300),
    mapRadius: clamp(Number(meta?.mapRadius) || 240,15,2500),
    color: /^#[0-9a-f]{6}$/i.test(meta?.color) ? meta.color : "#ff554e",
    flashMs: [500,950,1700,3000].includes(Number(meta?.flashMs)) ? Number(meta.flashMs) : 950,
  };
}
function updateUi() {
  const ring = settings.display === "ring";
  $("#styleRing").classList.toggle("selected", ring);
  $("#stylePointer").classList.toggle("selected", !ring);
  $("#styleRing").setAttribute("aria-pressed", String(ring));
  $("#stylePointer").setAttribute("aria-pressed", String(!ring));
  $("#strokeSection").hidden = !ring;
  $("#strokeWidth").value = String(settings.ringStrokePx);
  $("#strokeWidthValue").textContent = `${settings.ringStrokePx} px`;
  const screen = settings.mode === "screen";
  const size = screen ? settings.screenRadius : settings.mapRadius;
  const slider = $("#size");
  slider.min = screen ? "16" : "15";
  slider.max = screen ? "300" : "2500";
  slider.step = screen ? "1" : "5";
  slider.value = String(size);
  $("#sizeValue").textContent = `${Math.round(size)} px`;
  $("#modeScreen").classList.toggle("selected", screen);
  $("#modeMap").classList.toggle("selected", !screen);
  $("#modeScreen").setAttribute("aria-pressed", String(screen));
  $("#modeMap").setAttribute("aria-pressed", String(!screen));
  $("#modeHint").textContent = screen
    ? "Zoomkompensiert am steuernden Bildschirm. Bei anderen Zoomstufen kann die Größe abweichen."
    : "Feste Größe in Kartenpixeln. Der Pointer wird beim Hineinzoomen größer dargestellt.";
  $("#colorValue").textContent = settings.color.toUpperCase();
  $("#customColor").value = settings.color;
  $("#flashMs").value = String(settings.flashMs);
  $$("[data-color]").forEach(button => {
    const active = button.dataset.color.toLowerCase() === settings.color.toLowerCase();
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$("[data-screen]").forEach(button => {
    const target = screen ? Number(button.dataset.screen) : Number(button.dataset.map);
    button.classList.toggle("active", target === size);
  });
  const dot = $("#previewDot");
  const width = clamp(12 + Math.sqrt(size)*2.25, 14, 46);
  dot.style.width = `${width}px`;
  dot.style.height = `${width}px`;
  dot.style.borderColor = settings.color;
  dot.style.borderWidth = ring ? `${settings.ringStrokePx / 2}px` : "2px";
  dot.style.boxShadow = ring ? "none" : `0 0 11px ${settings.color}77`;
  dot.style.background = ring ? "transparent" : settings.color;
  $("#previewLabel").textContent = ring ? "Fokusring · freie Sicht" : "Gefüllter Pointer";
}
function status(message) { $("#state").textContent = message; }
// Serialisierte Schreibvorgänge, damit rasche Preset-Wechsel nicht überschreiben.
function save() {
  if (!initialized) return;
  const snapshot = { ...settings };
  status("Speichere …");
  saving = saving.catch(() => {}).then(() => OBR.tool.setMetadata(TOOL_ID, snapshot));
  saving.then(() => status("Gespeichert"), err => {
    console.error("[Fokuspointer] Einstellungen:", err);
    status("Fehler beim Speichern");
  });
}
function change(patch, persist=true) {
  settings = { ...settings, ...patch };
  updateUi();
  if (persist) save();
}
function wire() {
  $("#styleRing").addEventListener("click", () => change({display:"ring"}));
  $("#stylePointer").addEventListener("click", () => change({display:"pointer"}));
  const stroke = $("#strokeWidth");
  stroke.addEventListener("input", () => change({ringStrokePx:Number(stroke.value)}, false));
  stroke.addEventListener("change", () => save());
  $("#modeScreen").addEventListener("click", () => change({mode:"screen"}));
  $("#modeMap").addEventListener("click", () => change({mode:"map"}));
  const range = $("#size");
  range.addEventListener("input", () => change(
    settings.mode === "screen" ? {screenRadius:Number(range.value)} : {mapRadius:Number(range.value)}, false
  ));
  range.addEventListener("change", () => save());
  $$("[data-screen]").forEach(button => button.addEventListener("click", () => {
    change(settings.mode === "screen"
      ? {screenRadius:Number(button.dataset.screen)}
      : {mapRadius:Number(button.dataset.map)});
  }));
  $$("[data-color]").forEach(button => button.addEventListener("click", () => change({color:button.dataset.color})));
  const color = $("#customColor");
  color.addEventListener("input", () => change({color:color.value}, false));
  color.addEventListener("change", () => save());
  $("#flashMs").addEventListener("change", event => change({flashMs:Number(event.target.value)}));
}
wire();
OBR.onReady(async () => {
  try {
    settings = sanitize(await OBR.tool.getMetadata(TOOL_ID));
    initialized = true;
    updateUi();
    status("Bereit");
  } catch (err) {
    console.error("[Fokuspointer] Metadaten konnten nicht geladen werden", err);
    status("Verbindung fehlgeschlagen");
    updateUi();
  }
});
