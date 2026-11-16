/* GM Tools · Fokuspointer 0.1.0
 * Ein eigenes Werkzeug ohne persistente Kartenobjekte.
 * Das Owlbear-SDK wird als Browser-ES-Modul geladen (kein lokaler Build nötig).
 */
import OBR, { buildPointer } from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

const PREFIX = "de.gmtools.fokuspointer";
const TOOL_ID = `${PREFIX}/tool`;
const MODE_ID = `${PREFIX}/mode`;
const ACTION_ID = `${PREFIX}/settings`;
const POPOVER_ID = `${PREFIX}/popover`;
const DEFAULTS = Object.freeze({
  mode: "screen",          // "screen" = Näherung für Anzeigegröße; "map" = Kartenpixel
  screenRadius: 85,        // angezeigter Kreisradius in Bildschirm-Pixeln (bei gleichem Zoom)
  mapRadius: 240,          // Radius in Karten-Pixeln
  color: "#ff554e",
  flashMs: 950,           // Dauer eines kurzen Klick-Pings
});

const asset = (name) => new URL(name, document.baseURI).href;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function parseSettings(meta = {}) {
  const raw = meta ?? {};
  const color = typeof raw.color === "string" && /^#[\da-fA-F]{6}$/.test(raw.color)
    ? raw.color : DEFAULTS.color;
  return {
    mode: raw.mode === "map" ? "map" : "screen",
    screenRadius: clamp(Number(raw.screenRadius) || DEFAULTS.screenRadius, 16, 300),
    mapRadius: clamp(Number(raw.mapRadius) || DEFAULTS.mapRadius, 15, 2500),
    flashMs: clamp(Number(raw.flashMs) || DEFAULTS.flashMs, 300, 3500),
    color,
  };
}

function showError(message, error) {
  console.error(`[Fokuspointer] ${message}`, error);
  OBR.notification.show(`${message} – Browserkonsole prüfen.`, "ERROR").catch(console.error);
}

async function determineRadius(settings) {
  if (settings.mode === "map") return settings.mapRadius;
  // Owlbear rendert Pointer als Objekte im Kartenraum. Radius wird daher
  // anhand des lokalen Zoomfaktors kompensiert. Andere Clients können
  // bei unabhängigem Zoom eine abweichende sichtbare Größe erhalten.
  try {
    const scale = await OBR.viewport.getScale();
    if (Number.isFinite(scale) && scale > 0) {
      return clamp(settings.screenRadius / scale, 1, 40000);
    }
  } catch (error) {
    console.warn("[Fokuspointer] Zoomfaktor konnte nicht gelesen werden", error);
  }
  return settings.screenRadius;
}

function createPointer(position, settings, radius) {
  return buildPointer()
    .color(settings.color)
    .radius(radius)
    .position(position)
    .build();
}

let drag = null;
let token = 0;
const clickPings = new Set();

function updateDragPosition(current) {
  if (!current || !current.active || !current.manager) return;
  try {
    current.manager[0]((pointer) => {
      pointer.position = { ...current.latest };
    });
  } catch (error) {
    showError("Pointer-Bewegung fehlgeschlagen", error);
    endDrag();
  }
}

function endDrag(finalPosition) {
  const current = drag;
  drag = null;
  if (!current) return;
  if (finalPosition) {
    current.latest = { ...finalPosition };
    updateDragPosition(current);
  }
  current.active = false;
  if (current.manager) {
    try { current.manager[1](); } catch (error) { console.warn(error); }
    current.manager = null;
  }
  // Falls startItemInteraction noch läuft, beendet seine Fortsetzung
  // die später eintreffende Interaktion sofort (siehe beginDrag).
}

async function beginDrag(context, event) {
  endDrag();
  const current = {
    id: ++token,
    active: true,
    manager: null,
    latest: { ...event.pointerPosition },
    settings: parseSettings(context.metadata),
  };
  drag = current;
  try {
    const radius = await determineRadius(current.settings);
    if (!current.active) return;
    const pointer = createPointer(current.latest, current.settings, radius);
    const manager = await OBR.interaction.startItemInteraction(pointer);
    if (!current.active || drag !== current) {
      manager[1]();
      return;
    }
    current.manager = manager;
    updateDragPosition(current); // Mausbewegungen während des await nachholen
  } catch (error) {
    if (current.active) showError("Pointer konnte nicht gestartet werden", error);
    endDrag();
  }
}

async function clickPing(context, event) {
  const settings = parseSettings(context.metadata);
  let manager = null;
  try {
    const radius = await determineRadius(settings);
    manager = await OBR.interaction.startItemInteraction(
      createPointer(event.pointerPosition, settings, radius)
    );
    clickPings.add(manager);
    setTimeout(() => {
      try { manager[1](); } catch (error) { console.warn(error); }
      clickPings.delete(manager);
    }, settings.flashMs);
  } catch (error) {
    if (manager) {
      try { manager[1](); } catch { /* no-op */ }
      clickPings.delete(manager);
    }
    showError("Klick-Ping fehlgeschlagen", error);
  }
}

async function install() {
  const toolIcon = asset("./pointer.svg");
  const settingIcon = asset("./settings.svg");
  // Werkzeug erscheint rechts in der Owlbear-Werkzeugleiste.
  await OBR.tool.create({
    id: TOOL_ID,
    icons: [{ icon: toolIcon, label: "GM Tools · Fokuspointer" }],
    defaultMode: MODE_ID,
    defaultMetadata: { ...DEFAULTS },
  });
  await OBR.tool.createMode({
    id: MODE_ID,
    icons: [{
      icon: toolIcon,
      label: "Zeigen (ziehen) / Ping (klicken)",
      filter: { activeTools: [TOOL_ID] },
    }],
    cursors: [{ cursor: "crosshair" }],
    onToolClick: (context, event) => { void clickPing(context, event); return false; },
    onToolDragStart: (context, event) => { void beginDrag(context, event); },
    onToolDragMove: (_context, event) => {
      if (drag && drag.active) {
        drag.latest = { ...event.pointerPosition };
        updateDragPosition(drag);
      }
    },
    onToolDragEnd: (_context, event) => endDrag(event.pointerPosition),
    onToolDragCancel: () => endDrag(),
  });
  await OBR.tool.createAction({
    id: ACTION_ID,
    icons: [{
      icon: settingIcon,
      label: "Fokuspointer einstellen",
      filter: { activeTools: [TOOL_ID] },
    }],
    onClick: (_context, elementId) => {
      void OBR.popover.open({
        id: POPOVER_ID,
        url: asset("./settings.html"),
        anchorElementId: elementId,
        width: 344,
        height: 510,
      }).catch(error => showError("Einstellungen konnten nicht geöffnet werden", error));
    },
  });
  // Verhindert, dass eine abgebrochene Bewegung als Ghost-Interaktion weiterläuft.
  OBR.tool.onToolChange((id) => {
    if (id !== TOOL_ID) endDrag();
  });
  OBR.tool.onToolModeChange((id) => {
    if (id !== MODE_ID) endDrag();
  });
  console.info("[Fokuspointer] 0.1.0 registriert");
}

OBR.onReady(() => {
  void install().catch((error) => showError("Initialisierung fehlgeschlagen", error));
});
