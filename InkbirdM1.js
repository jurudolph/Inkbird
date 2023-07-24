/****************************************************
Inkbird Gateway IBS-M1
Daten aus dem Tuya Adapter lesen
****************************************************/
const Scriptversion = 'v0.04';   // 24.07.2023  jrudolph

/* meine speziellen Variablen für den Inkbird und Tuya Adapter */
const sID = 'bfxxxxxxxxxxxxxxxxxxxx'; // Device ID muss an das konkrete Gerät angepasst werden
const sInkbird = '0_userdata.0.Inkbird_M1.' + sID + '.'; // userdata Bereich für die ermittelten Inkbird Daten
const sTuya = 'tuya.0.' + sID + '.'; // Datenbereich des Tuya Adapters für das Inkbird Gerät; Tuya Adapter Instanz ggf. ändern

/* allgemeine Variablen für den Tuya Adapter */
var iChMin = 1; // minimale Inkbird Channelnummer
var iChMax = 50; // maximale Inkbird Channelnummer (IBS-M1 unterstützt bis zu 50 Geräte)

/* Variablen für die Channels */
var ichRecLen = 250; // Channel Record Length (250 bytes)
// 103 Parameter
var ichPara = 103; // Channel Parameter
var ichParaLen = 5; // Channel Parameter Length
// 114+123 Real Time Data
var ichRtdPos = [114,123]; // Channel Real Time Data
var ichRtdLen = 10; // Channel Real Time Data Length
// 118-122 Name
var ichNamePos = [118,119,120,121,122]; // Channel Name
var ichNameLen = 25; // Channel Name Length

/* Variablen */
var tin, fin, tex, fex, batt; // Temperature/Humidity internal/external, battery %

/* allgemeine Variablen */
var i, ix, iy, ich; //index
var b1, b2, b3, b4; //Buffer Bytes


//
// Create Device Inkbird IBS-M1
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
        if (chPara(i) > 0)//wenn der Kanal belegt ist
        {
            // Create Channel
            createState(sInkbird+ch(i),{name: ch(i)});//Channel

            createState(sInkbird+ch(i)+'.'+'Name',chName(i),{name: ch(i)+'.Name'});//Name

            chRtd(i);

            // Create Real Time Data points
            createState(sInkbird+ch(i)+'.'+'CurrentTempInt',tin,{name: ch(i)+'.CurrentTempInt', unit: '°C'});//
            createState(sInkbird+ch(i)+'.'+'CurrentHumInt',fin,{name: ch(i)+'.CurrentHumInt', unit: '%'});//
            createState(sInkbird+ch(i)+'.'+'CurrentTempExt',tex,{name: ch(i)+'.CurrentTempExt', unit: '°C'});//
            createState(sInkbird+ch(i)+'.'+'CurrentHumExt',fex,{name: ch(i)+'.CurrentHumExt', unit: '%'});//
            createState(sInkbird+ch(i)+'.'+'Battery',batt,{name: ch(i)+'.Battery', unit: '%'});//
        }
    }
}

function ch(i)
{
    return 'ch_'+('0'+i).slice(-2);//Format ch_00
}

function chName(ich)//Channel Name
{
    iy = ichNamePos[Math.floor((ich-1)/(ichRecLen/ichNameLen))];
    ix = (ich-1) % (ichRecLen/ichNameLen);
    return Buffer.from(getState(sTuya+iy).val, 'base64').toString('utf8',ix*ichNameLen,(ix+1)*ichNameLen);
}

function chPara(ich)//Channel Parameter
{
    iy = ichPara;
    ix = ich - 1;
    //b1 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(1+ix*ichParaLen);
    //b2 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(2+ix*ichParaLen);
    //b3 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(3+ix*ichParaLen);
    //b4 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(4+ix*ichParaLen);
    return Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(0+ix*ichParaLen);
}

function chRtd(ich)//Channel RealTimeData
{
    iy = ichRtdPos[Math.floor((ich-1)/(ichRecLen/ichRtdLen))];
    ix = (ich-1) % (ichRecLen/ichRtdLen);
    tin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(1+ix*ichRtdLen)/10.;
    fin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(3+ix*ichRtdLen)/10.;
    tex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(5+ix*ichRtdLen)/10.;
    fex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(7+ix*ichRtdLen)/10.;
    batt = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(9+ix*ichRtdLen);
    if (tin >= 130.) {tin='n/a';}
    if (tex >= 130.) {tex='n/a';}
    if (fin >= 130.||fin < 0.) {fin='n/a';}
    if (fex >= 130.||fex < 0.) {fex='n/a';}
}


//
// Update Funktionen
//
function updateName() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        setState(sInkbird+ch(i)+'.'+'Name',chName(i));//
        }
    }
};


function updateRtd() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        chRtd(i);
        setState(sInkbird+ch(i)+'.'+'CurrentTempInt',tin);//
        setState(sInkbird+ch(i)+'.'+'CurrentHumInt',fin);//
        setState(sInkbird+ch(i)+'.'+'CurrentTempExt',tex);//
        setState(sInkbird+ch(i)+'.'+'CurrentHumExt',fex);//
        setState(sInkbird+ch(i)+'.'+'Battery',batt);//
        }
    }
};



// IBS-M1 Gateway --> Tuya --> Inkbird userdata
/* Subscribe on Tuya Name changes */
on ([sTuya+ichNamePos[0],sTuya+ichNamePos[1],sTuya+ichNamePos[2],sTuya+ichNamePos[3],sTuya+ichNamePos[4]], function() {updateName();});//Name
/* Subscribe on Tuya RTD states */
on ({id: sTuya+ichRtdPos[0], change: 'any'}, function() {updateRtd();});//Real Time Data
on ({id: sTuya+ichRtdPos[1], change: 'any'}, function() {updateRtd();});//Real Time Data
/* Subscribe on Tuya Para changes */
on (sTuya+ichPara, function() {createChannels();});//Create new Channels
