/****************************************************
Inkbird Gateway IBS-M2
Daten aus dem Tuya Adapter lesen
****************************************************/
const Scriptversion = 'v0.01';   // 20.06.2023  jrudolph

/* meine speziellen Konstanten für den Inkbird und Tuya Adapter */
const sID = 'bfxxxxxxxxxxxxxxxxxxxx'; // Device ID muss an das konkrete Gerät angepasst werden
const sInkbird = '0_userdata.0.Inkbird_M2.' + sID + '.'; // userdata Bereich für die ermittelten Inkbird Daten
const sTuya = 'tuya.0.' + sID + '.'; // Datenbereich des Tuya Adapters für das Inkbird Gerät; Tuya Adapter Instanz ggf. ändern

/* allgemeine Variablen für das Gateway am Tuya Adapter */
var iChMin = 0; // minimale Inkbird Channelnummer
var iChMax = 9; // maximale Inkbird Channelnummer (IBS-M2 unterstützt bis zu 9 Geräte)

/* Variablen für die Channels */
// 102 Parameter
var ichPara = 102; // Channel Parameter
var ichParaLen = 5; // Channel Parameter Length
// 103-112 Real Time Data
var ichRtdPos = [103,104,105,106,107,108,109,110,111,112]; // Channel Real Time Data
var ichRtdLen = 10; // Channel Real Time Data Length

/* Variablen */
var tin, fin, tex, fex, batt; // Temperature/Humidity internal/external, battery %

/* allgemeine Variablen */
var i, ix, iy, ich; //index
var b1, b2, b3, b4; //Buffer Bytes


//
// Create Device Inkbird IBS-M2
//
createChannels();

/* Functions */

//
// Channel Funktionen
//
function createChannels()
{
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0 || i == 0)//wenn der Kanal belegt ist oder der interne Kanal ist
        {
            // Create Channel
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name,{name: getObject(sTuya+ichRtdPos[i]).common.name});//Channel

            chRtd(i);

            // Create Real Time Data points
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentTempInt',tin,{name: getObject(sTuya+ichRtdPos[i]).common.name+'.CurrentTempInt', unit: '°C'});//
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentHumInt',fin,{name: getObject(sTuya+ichRtdPos[i]).common.name+'.CurrentHumInt', unit: '%'});//
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentTempExt',tex,{name: getObject(sTuya+ichRtdPos[i]).common.name+'.CurrentTempExt', unit: '°C'});//
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentHumExt',fex,{name: getObject(sTuya+ichRtdPos[i]).common.name+'.CurrentHumExt', unit: '%'});//
            createState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'Battery',batt,{name: getObject(sTuya+ichRtdPos[i]).common.name+'.Battery', unit: '%'});//
        }
    }
}

function chPara(ich)//Channel Parameter
{
    iy = ichPara;
    ix = ich;
    //b1 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(1+ix*ichParaLen);
    //b2 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(2+ix*ichParaLen);
    //b3 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(3+ix*ichParaLen);
    //b4 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(4+ix*ichParaLen);
    return Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(0+ix*ichParaLen);
}

function chRtd(ich)//Channel RealTimeData
{
    iy = ichRtdPos[ich];
    tin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(1)/10.;
    fin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(3)/10.;
    tex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(5)/10.;
    fex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(7)/10.;
    batt = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(9);
    if (tin >= 130.) {tin='n/a';}
    if (tex >= 130.||ich==0) {tex='n/a';}
    if (fin >= 130.||fin < 0.) {fin='n/a';}
    if (fex >= 130.||fex < 0.||ich==0) {fex='n/a';}
}

//
// Update Funktionen
//
function updateRtd(i) {
    if (chPara(i) > 0 || i == 0)
        {
        chRtd(i);
        setState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentTempInt',tin);//
        setState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentHumInt',fin);//
        setState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentTempExt',tex);//
        setState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'CurrentHumExt',fex);//
        setState(sInkbird+getObject(sTuya+ichRtdPos[i]).common.name+'.'+'Battery',batt);//
        }
};

/* Subscribe on Tuya RTD states */
on ({id: sTuya+ichRtdPos[0], change: 'any'}, function() {updateRtd(0);});//Real Time Data
on ({id: sTuya+ichRtdPos[1], change: 'any'}, function() {updateRtd(1);});//Real Time Data
on ({id: sTuya+ichRtdPos[2], change: 'any'}, function() {updateRtd(2);});//Real Time Data
on ({id: sTuya+ichRtdPos[3], change: 'any'}, function() {updateRtd(3);});//Real Time Data
on ({id: sTuya+ichRtdPos[4], change: 'any'}, function() {updateRtd(4);});//Real Time Data
on ({id: sTuya+ichRtdPos[5], change: 'any'}, function() {updateRtd(5);});//Real Time Data
on ({id: sTuya+ichRtdPos[6], change: 'any'}, function() {updateRtd(6);});//Real Time Data
on ({id: sTuya+ichRtdPos[7], change: 'any'}, function() {updateRtd(7);});//Real Time Data
on ({id: sTuya+ichRtdPos[8], change: 'any'}, function() {updateRtd(8);});//Real Time Data
on ({id: sTuya+ichRtdPos[9], change: 'any'}, function() {updateRtd(9);});//Real Time Data
