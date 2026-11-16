# GM Tools – Fokuspointer 0.1.0

Ein separates Pointer-Werkzeug für Owlbear Rodeo mit einstellbarer Größe, Farbe, zwei Skalierungsmodi und kurzzeitigem Klick-Ping.

## Bedienung

1. In Owlbear Rodeo rechts das Werkzeug **GM Tools · Fokuspointer** auswählen (Fadenkreuz).
2. **Klicken:** Pointer erscheint kurz an der Stelle (einstellbar: 0,5–3 s).
3. **Ziehen:** Pointer folgt der Maus, solange die Maustaste gehalten wird. Die Bewegung wird per Owlbear-Echtzeitinteraktion für Mitspieler sichtbar gemacht.
4. In der oberen Werkzeugleiste auf das **Zahnrad** klicken, um Größe, Farbe und Skalierung zu ändern.
5. Die Einstellungen werden in den lokalen Werkzeugmetadaten von Owlbear gespeichert.

**Skalierung:**
- **Bildschirm** berechnet den Kartenradius näherungsweise aus `Bildschirmradius / Zoomfaktor`. Das orientiert sich an der Bildschirmgröße des Senders. Bei abweichendem Zoom der Mitspieler kann die angezeigte Größe abweichen.
- **Karte** verwendet den gewählten Radius direkt als Kartenpixel. Beim Zoomen ändert sich die sichtbare Größe.

**Hinweise:** Die Erweiterung benutzt den nativen Owlbear-Pointer (`buildPointer()`). Dieser zeichnet einen Pointer mit integrierter Spur, keinen beliebig gestaltbaren Kreis. Die Kartenobjekte werden nicht gespeichert. Einzelne Interaktionen sind durch Owlbear auf 30 Sekunden begrenzt; danach die Maustaste lösen und neu ziehen. Ein Synchron-/Kompatibilitätstest in deiner tatsächlichen Owlbear-Runde steht noch aus.

## Installation: Einmalige Veröffentlichung auf statischem Hosting

Die Erweiterung ist vollständig statisch (HTML, CSS, JavaScript). **Es braucht weder Node.js noch einen lokalen Entwicklungsserver oder eine .exe.** Zum Laden des Owlbear-SDK wird die externe Datei `https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm` verwendet. Dafür ist eine Internetverbindung erforderlich.

### Option A: Cloudflare Pages (Upload)

1. Bei Cloudflare anmelden und eine Pages-Site mit **Direct Upload** erstellen.
2. Den *Inhalt* dieses Ordners hochladen – `manifest.json` muss im Wurzelverzeichnis der Website liegen.
3. Die veröffentlichte Pages-Adresse öffnen und prüfen, ob `https://DEINE-ADRESSE/manifest.json` erreichbar ist.
4. In Owlbear Rodeo unten links **Extras → Erweiterungen → Hinzufügen** öffnen, die vollständige `manifest.json`-Adresse eintragen und die Erweiterung im Raum aktivieren.

### Option B: GitHub Pages

1. Ein neues Repository anlegen und alle Dateien dieses Ordners ins Repository-Wurzelverzeichnis hochladen.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, Branch `main`, Ordner `/(root)`.
3. **Vor dem Upload** in `manifest.json` die beiden Werte für `icon` und `background_url` auf `https://BENUTZER.github.io/REPOSITORY/pointer.svg` bzw. `https://BENUTZER.github.io/REPOSITORY/index.html` ändern. Für GitHub Pages mit Unterpfad sind absolute URLs in Owlbear-Manifests robuster als relative Angaben.
4. Nach Veröffentlichung ist die Manifest-URL üblicherweise `https://BENUTZER.github.io/REPOSITORY/manifest.json`. Diese URL in Owlbear hinzufügen und im Raum aktivieren.

**Wichtig:** Eine ZIP-Datei direkt im Browser zu öffnen oder als Datei in Owlbear hochzuladen installiert die Erweiterung nicht. Owlbear benötigt eine erreichbare Manifest-URL per HTTPS (oder für Entwicklung `http://localhost`). Die ZIP ist deshalb das veröffentlichungsfertige Dateipaket, nicht ein direkt installierbares Owlbear-Archiv.

## Technische Angaben

- Manifest-Version: 1
- SDK: Owlbear Rodeo SDK 3.1.0 (jsDelivr-ESM, zur Laufzeit geladen)
- Tool-ID: `de.gmtools.fokuspointer/tool`
- Mode-ID: `de.gmtools.fokuspointer/mode`
- Action-ID: `de.gmtools.fokuspointer/settings`
- Kein eigenes Backend, keine Datenbank und kein zusätzlicher Prozess erforderlich
- JavaScript/HTML-Dateipfade sind relativ und funktionieren unter Unterverzeichnissen. Das Manifest ist für Root-Hosting (`/index.html`) vorkonfiguriert; bei GitHub Pages mit Repository-Unterpfad müssen die beiden Manifest-URLs angepasst werden.

### Testsequenz

1. Owlbear mit einem GM-Tab und einem Spieler-Tab öffnen.
2. In GM-Tab den Fokuspointer auswählen, mittlere Größe einstellen und über die Karte ziehen. Prüfen, ob der Spieler die Bewegung sieht.
3. Karte deutlich herauszoomen; Größe im Bildschirmmodus prüfen.
4. Zwischen Bildschirm- und Kartenmodus wechseln. Einmal kurz klicken, sodass der Ping selbständig verschwindet.
5. Einstellungen ändern, Popover schließen und wieder öffnen. Sollwerte müssen erhalten bleiben.
6. Zwei Tabs mit verschiedenen Zoomstufen testen, um die Einschränkung der Zoomkompensation zu beurteilen.

## Quellen

- https://docs.owlbear.rodeo/extensions/apis/interaction/
- https://docs.owlbear.rodeo/extensions/apis/tool/
- https://docs.owlbear.rodeo/extensions/apis/viewport/
- https://docs.owlbear.rodeo/extensions/reference/builders/pointer/
- https://docs.owlbear.rodeo/extensions/tutorial-sharing-your-extension/hosting-your-extension/

## Bekannte Grenzen

- Es gibt derzeit keinen Live-Test in einem tatsächlichen Owlbear-Raum.
- Das SDK wird beim Laden aus einem externen CDN bezogen. Falls das CDN blockiert ist, startet die Erweiterung nicht. Eine spätere lokal gebündelte SDK-Version würde diese Abhängigkeit entfernen.
- Konstante Bildschirmgröße wird nur relativ zum Zoom des steuernden Nutzers angestrebt; pro-Spieler-Zoomkompensation benötigt eine andere Render-/Broadcast-Architektur.
