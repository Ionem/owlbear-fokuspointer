# GM Tools – Fokuspointer 0.2.0

Erweiterung für Owlbear Rodeo. **Neu in 0.2.0**: zusätzlich zur bisherigen gefüllten Pointer-Darstellung ein **hohler, dynamisch beweglicher Fokusring**.

## Neue Einstellungen

- **Darstellung → Fokusring**: Kreis mit vollständig transparenter Füllung und farbiger Umrandung; keine Spur.
- **Darstellung → Pointer**: bisheriger nativer Owlbear-Pointer mit gefülltem Zentrum und Bewegungsspur.
- **Ringkontur**: Stärke von 2 bis 12 Bildschirm-Pixeln (am sendenden Client, Näherung).
- Größe, Farbwahl, Karten-/Bildschirmmodus und Klick-Ping aus 0.1.0 bleiben erhalten.

Neuinstallationen starten standardmäßig mit **Fokusring**. Die bisherigen Einstellungen werden über die gleichbleibende Tool-ID `de.gmtools.fokuspointer/tool` weiterverwendet; das bisher unbekannte Feld `display` fällt auf `ring` zurück. Über die Einstellungen kann wieder auf den Pointer gewechselt werden.

## Bedienung

- Klicken: kurzzeitiger Ring/Pointer auf der markierten Stelle.
- Mit gedrückter Maustaste ziehen: Ring/Pointer folgt der Maus und wird für Spieler übertragen.
- Werkzeugmenü → Zahnrad: Einstellungen ändern.
- Ein Ring wird nur als Echtzeit-Interaktion angezeigt und **nicht dauerhaft als Zeichnung auf der Karte gespeichert**.
- Eine Interaktion ist seitens Owlbear auf 30 Sekunden begrenzt. Danach die Maustaste loslassen und erneut ziehen.

## Aktualisierung bei GitHub Pages

Das Paket ist bereits für dein Repository `Ionem/owlbear-fokuspointer` konfiguriert.

1. ZIP entpacken.
2. Auf https://github.com/Ionem/owlbear-fokuspointer im Reiter **Code** auf **Add file → Upload files** klicken.
3. **Alle neun Dateien des entpackten Pakets** in die oberste Verzeichnisebene ziehen (nicht das ZIP und nicht den Ordner als zusätzlichen Unterordner).
4. GitHub fragt beim Upload nach dem Überschreiben vorhandener Dateien; die Änderungen anschließend unten mit **Commit changes** bestätigen.
5. GitHub Pages veröffentlicht weiter unter `https://ionem.github.io/owlbear-fokuspointer/manifest.json`. In Owlbear muss die Erweiterung **nicht neu installiert** werden.
6. Bei einer noch geladenen Version nach dem Deployment den Owlbear-Tab neu laden (bei hartnäckigem Cache mit Strg+F5), dann erneut Einstellungen öffnen.

## Technik

- Owlbear SDK `@owlbear-rodeo/sdk@3.1.0` über jsDelivr als ES-Modul
- Ring als temporäre `Shape` (`shapeType: CIRCLE`, `fillOpacity: 0`, `strokeWidth`) auf der `POINTER`-Ebene; via `OBR.interaction.startItemInteraction` synchronisiert
- Shape-Position wird um den Radius versetzt, damit der Mauszeiger im Kreismittelpunkt liegt.
- Konturbreite und optional Radius werden mit dem *lokalen* Zoomfaktor des steuernden Clients kompensiert; bei unterschiedlichen Zoomfaktoren der Zuschauer weicht die sichtbare Größe ab.
- Kein Serverprozess auf dem eigenen PC, keine neuen Berechtigungen und keine permanenten Kartenobjekte.

**Teststatus:** Code- und simulierte API-Tests durchgeführt. Ein vollständiger Interaktionstest mit Owlbear Rodeo und verschiedenen Spieler-Clients ist noch erforderlich, insbesondere die Darstellung von `Shape`-Interaktionen auf der `POINTER`-Ebene. Das alte Pointer-Verhalten ist als auswählbarer Rückfallmodus erhalten.

## API-Dokumentation

- https://docs.owlbear.rodeo/extensions/reference/builders/shape/
- https://docs.owlbear.rodeo/extensions/reference/builders/item/
- https://docs.owlbear.rodeo/extensions/apis/interaction/
