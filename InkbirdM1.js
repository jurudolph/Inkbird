/****************************************************
Inkbird Gateway IBS-M1
Daten aus dem Tuya Adapter lesen
****************************************************/
//const Scriptversion = 'v0.04';   // 24.07.2023  jrudolph
const Scriptversion = 'v0.05';   // 13.08.2025 optimiert

/* meine speziellen Variablen für den Inkbird und Tuya Adapter */
const sID = 'bfxxxxxxxxxxxxxxxxxxxx'; // Device ID muss an das konkrete Gerät angepasst werden
const sInkbird = `0_userdata.0.Inkbird_M1.${sID}.`; // userdata Bereich für die ermittelten Inkbird Daten
const sTuya = `tuya.0.${sID}.`; // Datenbereich des Tuya Adapters für das Inkbird Gerät; Tuya Adapter Instanz ggf. ändern
/* Ende der eigenen Anpassungen */

/* allgemeine Variablen für den Tuya Adapter */
const iChMin = 1; // minimale Inkbird Channelnummer
const iChMax = 50; // maximale Inkbird Channelnummer (IBS-M1 unterstützt bis zu 50 Geräte)

/* Konstanten für die Channels */
const iChRecLen = 250;
// Parameter
const iChPara = 103;
const iChParaLen = 5;
// Real Time Data
const iChRtdPos = [114, 123];
const iChRtdLen = 10;
// Name
const iChNamePos = [118, 119, 120, 121, 122];
const iChNameLen = 25;

createChannels();

/**
 * Erstellt Channels für belegte Inkbird-Kanäle
 */
function createChannels() {
    for (let i = iChMin; i <= iChMax; i++) {
        if (chPara(i) > 0) {
            const channelPath = `${sInkbird}${ch(i)}`;
            createState(channelPath, { name: ch(i) });

            createState(`${channelPath}.Name`, chName(i), { name: `${ch(i)}.Name` });

            const data = chRtd(i);
            createState(`${channelPath}.CurrentTempInt`, data.tin, { name: `${ch(i)}.CurrentTempInt`, unit: '°C' });
            createState(`${channelPath}.CurrentHumInt`, data.fin, { name: `${ch(i)}.CurrentHumInt`, unit: '%' });
            createState(`${channelPath}.CurrentTempExt`, data.tex, { name: `${ch(i)}.CurrentTempExt`, unit: '°C' });
            createState(`${channelPath}.CurrentHumExt`, data.fex, { name: `${ch(i)}.CurrentHumExt`, unit: '%' });
            createState(`${channelPath}.Battery`, data.batt, { name: `${ch(i)}.Battery`, unit: '%' });
        }
    }
}

/**
 * Liefert den Channel-String: ch_01, ch_02, ...
 */
function ch(i) {
    return `ch_${String(i).padStart(2, '0')}`;
}

/**
 * Liest den Namen eines Kanals aus
 */
function chName(i) {
    const bufferIndex = Math.floor((i - 1) / (iChRecLen / iChNameLen));
    const byteIndex = (i - 1) % (iChRecLen / iChNameLen);
    const dp = getState(`${sTuya}${iChNamePos[bufferIndex]}`);
    if (!dp || !dp.val) return 'n/a';
    try {
        return Buffer.from(dp.val, 'base64').toString('utf8', byteIndex * iChNameLen, (byteIndex + 1) * iChNameLen).replace(/\0/g, '').trim();
    } catch {
        return 'n/a';
    }
}

/**
 * Liest die Parameter eines Kanals (nur wenn belegt)
 */
function chPara(i) {
    const byteIndex = (i - 1) * iChParaLen;
    const dp = getState(`${sTuya}${iChPara}`);
    if (!dp || !dp.val) return 0;
    try {
        return Buffer.from(dp.val, 'base64').readInt8(byteIndex);
    } catch {
        return 0;
    }
}

/**
 * Liest RealTimeData eines Kanals aus
 */
function chRtd(i) {
    const bufferIndex = Math.floor((i - 1) / (iChRecLen / iChRtdLen));
    const byteIndex = (i - 1) % (iChRecLen / iChRtdLen);
    const dp = getState(`${sTuya}${iChRtdPos[bufferIndex]}`);
    if (!dp || !dp.val) return defaultRtd();

    try {
        const buf = Buffer.from(dp.val, 'base64');
        const tin = sanitizeTemp(buf.readInt16LE(1 + byteIndex * iChRtdLen));
        const fin = sanitizeHum(buf.readInt16LE(3 + byteIndex * iChRtdLen));
        const tex = sanitizeTemp(buf.readInt16LE(5 + byteIndex * iChRtdLen));
        const fex = sanitizeHum(buf.readInt16LE(7 + byteIndex * iChRtdLen));
        const batt = buf.readInt8(9 + byteIndex * iChRtdLen);
        return { tin, fin, tex, fex, batt };
    } catch {
        return defaultRtd();
    }
}

function defaultRtd() {
    return { tin: 'n/a', fin: 'n/a', tex: 'n/a', fex: 'n/a', batt: 0 };
}

function sanitizeTemp(value) {
    const temp = value / 10;
    return (temp >= 130 || temp <= -50) ? 'n/a' : temp;
}

function sanitizeHum(value) {
    const hum = value / 10;
    return (hum >= 130 || hum < 0) ? 'n/a' : hum;
}

/**
 * Aktualisiert nur die Namen
 */
function updateName() {
    for (let i = iChMin; i <= iChMax; i++) {
        if (chPara(i) > 0) {
            setState(`${sInkbird}${ch(i)}.Name`, chName(i));
        }
    }
}

/**
 * Aktualisiert RealTimeData
 */
function updateRtd() {
    for (let i = iChMin; i <= iChMax; i++) {
        if (chPara(i) > 0) {
            const data = chRtd(i);
            const base = `${sInkbird}${ch(i)}`;
            setState(`${base}.CurrentTempInt`, data.tin);
            setState(`${base}.CurrentHumInt`, data.fin);
            setState(`${base}.CurrentTempExt`, data.tex);
            setState(`${base}.CurrentHumExt`, data.fex);
            setState(`${base}.Battery`, data.batt);
        }
    }
}

/* Subscriptions für Änderungen im Tuya Adapter */
on(iChNamePos.map(pos => `${sTuya}${pos}`), updateName);
on({ id: `${sTuya}${iChRtdPos[0]}`, change: 'any' }, updateRtd);
on({ id: `${sTuya}${iChRtdPos[1]}`, change: 'any' }, updateRtd);
on(`${sTuya}${iChPara}`, createChannels);
