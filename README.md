# Inkbird

## Skripte für den ioBroker zum Extrahieren von Daten aus dem Tuya Adapter für die Inkbird Gateways IBS-M1 (Gen2) und IBS-M2

### IBS-M2
Das Skript InkbirdM2.js ist für das Gateway M2 vorgesehen. Es liest die Echtzeitdaten für Temperatur und Feuchte, sowie Batteriezustand aus.

In Zeile 8 MUSS für die sID die eigene Device ID des Gateways aus dem Tuya Adapter übernommen werde.
In Zeile 9 KANN der Zielbereich userdata angepasst werden.
In Zeile 10 ist die Tuya Instanz hinterlegt. Falls nicht "tuya.0" dann bitte anpassen.

Das Skript wurde mit Gateway IBS-M2 und Poolsensor IBS-P02R getestet.

