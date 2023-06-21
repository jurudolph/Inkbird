# Inkbird

## Skripte für den ioBroker zum Extrahieren von Daten aus dem Tuya Adapter für die Inkbird Gateways IBS-M1 (Gen2) und IBS-M2
Voraussetzung für die Verwendung der Skripte ist, dass
1. das Inkbird Gateway bereits nach Anleitung des Tuya Adapters eingebunden ist
2. das Skript für das eigene Gateway konfiguriert wird.

In Zeile 8 MUSS für die sID die eigene Device ID des Gateways aus dem Tuya Adapter übernommen werde.

In Zeile 9 KANN der Zielbereich userdata angepasst werden.

In Zeile 10 ist die Tuya Instanz hinterlegt. Falls nicht "tuya.0" dann bitte anpassen.


### IBS-M1
Das Skript InkbirdM1.js ist für das Gateway M1 vorgesehen. Es liest die Gerätenamen, die Echtzeitdaten für Temperatur und Feuchte, sowie Batteriezustand aus.

Die verbundenen Devices (max. 5ß) werden über ch_01 bis ch_50 ausgegeben.

Das Skript wurde mit Gateway IBS-M1S2.0 und Poolsensor IBS-P01R, sowie ITH-20R getestet.

### IBS-M2
Das Skript InkbirdM2.js ist für das Gateway M2 vorgesehen. Es liest die Echtzeitdaten für Temperatur und Feuchte, sowie Batteriezustand aus.

Die ausgegebenen Daten für ch_0 sind die Sensordaten des internen Sensors des Gateways.
Die verbundenen Devices (max. 9) werden über ch_1 bis ch_9 ausgegeben.

Das Skript wurde mit Gateway IBS-M2 und Poolsensor IBS-P02R getestet.

