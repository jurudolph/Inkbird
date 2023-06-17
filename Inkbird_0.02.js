/****************************************************
Inkbird Gateway IBS-M1 (mit Poolthermometer IBS-P01R)
Daten aus dem Tuya Adapter lesen
v0.02   19.12.2022  jrudolph
****************************************************/

/* meine speziellen Variablen für den Inkbird und Tuya Adapter */
var sInkbird = '0_userdata.0.Inkbird.ibs_m1.'; // userdata Bereich für die ermittelten Inkbird Daten
var sTuya = 'tuya.0.bf1c35a45b033bed278cjy.'; // Datenbereich des Tuya Adapters für das Inkbird Gerät

/* allgemeine Variablen für den Tuya Adapter */
var iChMin = 0; // minimale Inkbird Channelnummer
var iChMax = 49; // maximale Inkbird Channelnummer (IBS-M1 unterstützt bis zu 50 Geräte)

/* Variablen für das Gateay */
var iANSt = 111; // Alarm Notify Status

/* Variablen für die Channels */
// 118-122 Name
var ichNamePos = [118,119,120,121,122]; // Channel Name
var ichNameLen = 25; // Channel Name Length
// 104-108 Configuration
//DEVvar ichCfgPos = [104,105,106,107,108]; // Channel Configuration
//DEVvar ichCfgLen = 25; // Channel Configuration Length
// 114+123 Real Time Data
var ichRtdPos = [114,123]; // Channel Real Time Data
var ichRtdLen = 10; // Channel Real Time Data Length
//DEV// 126-127, (115-117, 124) History
//DEVvar ichHisAlPos = [126,127]; // Channel Alarm History
//DEVvar ichHisAlLen = 10; // Channel Alarm History Length
// 103 Parameter
var ichPara = 103; // Channel Parameter
var ichParaLen = 5; // Channel Parameter Length
//DEV// 109, (110+125) Alarm
//DEVvar ichAlarm = 109; // Channel Alarm
//DEVvar ichAlarmLen = 5; // Channel Alarm Length
//DEV// (112-113) Scene
//DEV// (101,102) Command

//DEVvar alarmTinMin, alarmTinMax, alarmTexMin, alarmTexMax; // Alarm Temperature internal/external min/max
//DEVvar alarmFinMin, alarmFinMax, alarmFexMin, alarmFexMax; // Alarm Humidity internal/external min/max
//DEVvar corrTin, corrTex, corrFin, corrFex; // Corrective Value for Temperature/Humidity internal/external
var chAvail, tin, fin, tex, fex, batt; // Channel Availability, Temperature/Humidity internal/external, battery %
//DEVvar altin, alfin, altex, alfex, sAlDateTime; // Alarm Temperature/Humidity internal/external, Alarm Date and Time String

/* allgemeine Variablen */
var i, ix, iy, ich; //index
var b1, b2, b3, b4; //Buffer Bytes
var t; //transformierter Wert
//DEVvar sNativeName, sCommonName; //chin., engl. Namen

//
// Create Device Inkbird IBS-M1
//
createState(sInkbird+'.'+'AlarmNotifyStatus',getState(sTuya+iANSt).val);//AlarmNotifyStatus
//
// Create Channels if needed
//
createChannels();
//sleep(3000);
//setTimeout(function () {createChannels();},2000);
//*
updateRtd();
//DEVupdateHisAl();
updateANSt();
updateName();
//DEVupdateCfg();
/*/

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
            // Channel
            createState(sInkbird+('0'+i).slice(-2),{name: 'Ch'+('0'+i).slice(-2)});//Channel
            // Name (118 - 122)
            createState(sInkbird+('0'+i).slice(-2)+'.'+'Name',chName(i),{name: 'Ch'+('0'+i).slice(-2)+'.Name'});//Name
            // Config (104 - 108)
//DEV            chCfg(i);
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempIntMax',alarmTinMax,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmTempIntMax', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempIntMin',alarmTinMin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmTempIntMin', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempExtMax',alarmTexMax,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmTempExtMax', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempExtMin',alarmTexMin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmTempExtMin', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrTempInt',corrTin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueCorrTempInt', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrTempExt',corrTex,{name: 'Ch'+('0'+i).slice(-2)+'.ValueCorrTempExt', unit: '°C'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumIntMax',alarmFinMax,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmHumIntMax', unit: '%'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumIntMin',alarmFinMin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmHumIntMin', unit: '%'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumExtMax',alarmFexMax,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmHumExtMax', unit: '%'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumExtMin',alarmFexMin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueAlarmHumExtMin', unit: '%'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrHumInt',corrFin,{name: 'Ch'+('0'+i).slice(-2)+'.ValueCorrHumInt', unit: '%'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrHumExt',corrFex,{name: 'Ch'+('0'+i).slice(-2)+'.ValueCorrHumExt', unit: '%'});//
            // Real Time Data (114 + 123)
            chRtd(i);
            createState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentTempInt',tin,{name: 'Ch'+('0'+i).slice(-2)+'.CurrentTempInt', unit: '°C'});//
            createState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentHumInt',fin,{name: 'Ch'+('0'+i).slice(-2)+'.CurrentHumInt', unit: '%'});//
            createState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentTempExt',tex,{name: 'Ch'+('0'+i).slice(-2)+'.CurrentTempExt', unit: '°C'});//
            createState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentHumExt',fex,{name: 'Ch'+('0'+i).slice(-2)+'.CurrentHumExt', unit: '%'});//
            createState(sInkbird+('0'+i).slice(-2)+'.'+'Battery',batt,{name: 'Ch'+('0'+i).slice(-2)+'.Battery', unit: '%'});//
            // History Alarm (126 - 127)
//DEV            chHisAl(i);
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmTempInt',altin,{name: 'Ch'+('0'+i).slice(-2)+'.HistAlarmTempInt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmHumInt',alfin,{name: 'Ch'+('0'+i).slice(-2)+'.HistAlarmHumInt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmTempExt',altex,{name: 'Ch'+('0'+i).slice(-2)+'.HistAlarmTempExt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmHumExt',alfex,{name: 'Ch'+('0'+i).slice(-2)+'.HistAlarmHumExt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmDateTime',sAlDateTime,{name: 'Ch'+('0'+i).slice(-2)+'.HistAlarmDateTime'});//
//DEV            chAlarm(i);
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmTempInt',b1,{name: 'Ch'+('0'+i).slice(-2)+'.countAlarmTempInt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmHumInt',b2,{name: 'Ch'+('0'+i).slice(-2)+'.countAlarmHumInt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmTempExt',b3,{name: 'Ch'+('0'+i).slice(-2)+'.countAlarmTempExt'});//
//DEV            createState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmHumExt',b4,{name: 'Ch'+('0'+i).slice(-2)+'.countAlarmHumExt'});//
        }
    }
}

function chName(ich)//Channel Name
{
    iy = ichNamePos[Math.floor(ich/10)];
    ix = ich % 10;
    return Buffer.from(getState(sTuya+iy).val, 'base64').toString('utf8',ix*ichNameLen,(ix+1)*ichNameLen);
}

function chPara(ich)//Channel Parameter
{
    iy = ichPara;
    ix = ich;
    b1 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(1+ix*ichParaLen);
    b2 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(2+ix*ichParaLen);
    b3 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(3+ix*ichParaLen);
    b4 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(4+ix*ichParaLen);
    return Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(0+ix*ichParaLen);
}

function chAlarm(ich)//Channel Parameter
{
    iy = ichAlarm;
    ix = ich;
    b1 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(1+ix*ichAlarmLen);
    b2 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(2+ix*ichAlarmLen);
    b3 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(3+ix*ichAlarmLen);
    b4 = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(4+ix*ichAlarmLen);
    return Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(0+ix*ichAlarmLen);
}

function chCfg(ich)//Channel Cfg
{
    iy = ichCfgPos[Math.floor(ich/10)];
    ix = ich % 10;
    alarmTinMax = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(0+ix*ichCfgLen)/10.;
    alarmFinMax = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(2+ix*ichCfgLen)/10.;
    alarmTexMax = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(4+ix*ichCfgLen)/10.;
    alarmFexMax = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(6+ix*ichCfgLen)/10.;
    alarmTinMin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(8+ix*ichCfgLen)/10.;
    alarmFinMin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(10+ix*ichCfgLen)/10.;
    alarmTexMin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(12+ix*ichCfgLen)/10.;
    alarmFexMin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(14+ix*ichCfgLen)/10.;
    corrTin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(16+ix*ichCfgLen)/10.;
    corrFin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(18+ix*ichCfgLen)/10.;
    corrTex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(20+ix*ichCfgLen)/10.;
    corrFex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt16LE(22+ix*ichCfgLen)/10.;
}

function chRtd(ich)//Channel RealTimeData
{
    iy = ichRtdPos[Math.floor(ich/25)];
    ix = ich % 25;
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

function chHisAl(ich)//Channel HistoryAlarm
{
    iy = ichHisAlPos[Math.floor(ich/25)];
    ix = ich % 10;
    sAlDateTime = '' +
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',2+ix*ichHisAlLen,3+ix*ichHisAlLen) + '.' + //day
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',1+ix*ichHisAlLen,2+ix*ichHisAlLen) + '.20' + //month
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',0+ix*ichHisAlLen,1+ix*ichHisAlLen) + ' ' + //year
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',3+ix*ichHisAlLen,4+ix*ichHisAlLen) + ':' + //hour
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',4+ix*ichHisAlLen,5+ix*ichHisAlLen) + ':' + //minute
        Buffer.from(getState(sTuya+iy).val, 'base64').toString('hex',5+ix*ichHisAlLen,6+ix*ichHisAlLen); //second
    altin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(6+ix*ichHisAlLen);
    alfin = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(7+ix*ichHisAlLen);
    altex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(8+ix*ichHisAlLen);
    alfex = Buffer.from(getState(sTuya+iy).val, 'base64').readInt8(9+ix*ichHisAlLen);
}

//
// Update Funktionen
//
function updateName() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        setState(sInkbird+('0'+i).slice(-2)+'.'+'Name',chName(i));//
        }
    }
};

function updateCfg() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
            chCfg(i);
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempIntMax',alarmTinMax);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempIntMin',alarmTinMin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempExtMax',alarmTexMax);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmTempExtMin',alarmTexMin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrTempInt',corrTin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrTempExt',corrTex);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumIntMax',alarmFinMax);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumIntMin',alarmFinMin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumExtMax',alarmFexMax);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueAlarmHumExtMin',alarmFexMin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrHumInt',corrFin);//
            setState(sInkbird+('0'+i).slice(-2)+'.'+'ValueCorrHumExt',corrFex);//
        }
    }
};

function updateRtd() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        chRtd(i);
        setState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentTempInt',tin);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentHumInt',fin);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentTempExt',tex);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'CurrentHumExt',fex);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'Battery',batt);//
        }
    }
};

function updateHisAl() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        chHisAl(i);
        setState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmTempInt',altin);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmHumInt',alfin);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmTempExt',altex);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmHumExt',alfex);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'HistAlarmDateTime',sAlDateTime);//
        }
    }
};

function updateAlarm() {
    for (i = iChMin; i <= iChMax; i++)
    {
        if (chPara(i) > 0)
        {
        chAlarm(i);
        setState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmTempInt',b1);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmHumInt',b2);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmTempExt',b3);//
        setState(sInkbird+('0'+i).slice(-2)+'.'+'countAlarmHumExt',b4);//
        }
    }
};

function updateANSt() {
    setState(sInkbird+'.'+'AlarmNotifyStatus',getState(sTuya+iANSt).val);//AlarmNotifyStatus
};
function updateANStReverse() {
    setState(sTuya+iANSt,getState(sInkbird+'.'+'AlarmNotifyStatus').val);//alarm_notify_status
};

// IBS-M1 Gateway --> Tuya --> Inkbird userdata
on ([sTuya+ichNamePos[0],sTuya+ichNamePos[1],sTuya+ichNamePos[2],sTuya+ichNamePos[3],sTuya+ichNamePos[4]], function() {updateName();});//Name
//DEVon ([sTuya+ichCfgPos[0],sTuya+ichCfgPos[1],sTuya+ichCfgPos[2],sTuya+ichCfgPos[3],sTuya+ichCfgPos[4]], function() {updateCfg();});//Cfg
//on ([sTuya+ichRtdPos[0],sTuya+ichRtdPos[1]], function() {updateRtd();});//Real Time Data
on ({id: sTuya+ichRtdPos[0], change: 'any'}, function() {updateRtd();});//Real Time Data
on ({id: sTuya+ichRtdPos[1], change: 'any'}, function() {updateRtd();});//Real Time Data
//DEVon ([sTuya+ichHisAlPos[0],sTuya+ichHisAlPos[1]], function() {updateHisAl();});//History Alarm
//DEVon (sTuya+ichAlarm, function() {updateAlarm();});//Alarm Status
on (sTuya+iANSt, function() {updateANSt();});//Alarm Notify Status
on (sTuya+ichPara, function() {createChannels();});//Create new Channels

// Inkbird userdata --> Tuya --> IBS-M1 Gateway
on (sInkbird+'.'+'AlarmNotifyStatus', function() {updateANStReverse();});//Alarm Notify Status *reverse*


/*************************************************************************
* Doku Inkbird Gateway IBC-M1S2.0 (Gen2!!!) für max. 50 Devices (Channels)
**************************************************************************


Tuya Status Set
Code	            Type Values
app_add_device_cmd	Raw	{}
g_scan_device	    Raw	{}
ch_para	            Raw	{} 250 Byte
* note * Hat 50 Datensätze zu je 5 Byte. Vermutlich eine Geräteinformation (z.B. 0x01030184e6 für ITC-P01R)

ch_cfg1	            Raw	{} 250 Byte
ch_cfg2	            Raw	{}  ""
ch_cfg3	            Raw	{}  ""
ch_cfg4	            Raw	{}  ""
ch_cfg5	            Raw	{}  ""
* note * Jeder ch_cfgX hat 10 Datensätze zu je 25 Byte. ch_cfg1 beginnt mit Device1 und ch_cfg5 endet mit Device50.
ch_alarm	        Raw	{}
ch_alarm_trig1	Bitmap	
{
  "label": [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
    "c11",
    "c12",
    "c13",
    "c14",
    "c15",
    "c16",
    "c17",
    "c18",
    "c19",
    "c20",
    "c21",
    "c22",
    "c23",
    "c24",
    "c25",
    "c26",
    "c27",
    "c28",
    "c29",
    "c30"
  ],
  "maxlen": 30
}
alarm_notify_status	Boolean	"{true,false}"
ch_scene1	        Raw	{}
ch_scene2	        Raw	{}
ch_rtd1	            Raw	{}
his_ask_cmd	        Raw	{}
his_answer	        Raw	{}
his_data	        Raw	{}

ch_name1	        Raw	{}  250 Byte
ch_name2	        Raw	{}  ""
ch_name3	        Raw	{}  ""
ch_name4	        Raw	{}  ""
ch_name5	        Raw	{}  ""
* note * Jeder ch_nameX hat 10 Datensätze zu je 25 Byte. ch_name1 beginnt mit Channel1 und ch_name5 endet mit Channel50.
Jeder Channel-Name kann also 25 Zeichen lang sein.

ch_rtd2	            Raw	{}
his_data_time	    Raw	{}
ch_alarm_trig2	    Bitmap	
{
  "label": [
    "c31",
    "c32",
    "c33",
    "c34",
    "c35",
    "c36",
    "c37",
    "c38",
    "c39",
    "c40",
    "c41",
    "c42",
    "c43",
    "c44",
    "c45",
    "c46",
    "c47",
    "c48",
    "c49",
    "c50"
  ],
  "maxlen": 20
}
his_alarm1	        Raw	{}
his_alarm2	        Raw	{}

Tuya Instruction Set
Code	            Type Values
app_add_device_cmd	Raw	{}
g_scan_device	    Raw	{}
ch_para	            Raw	{}
ch_cfg1	            Raw	{}
ch_cfg2	            Raw	{}
ch_cfg3	            Raw	{}
ch_cfg4	            Raw	{}
ch_cfg5	            Raw	{}
ch_alarm	        Raw	{}
alarm_notify_status Boolean "{true,false}"
ch_scene1	        Raw	{}
ch_scene2	        Raw	{}
ch_rtd1	            Raw	{}
his_ask_cmd	        Raw	{}
ch_name1	        Raw	{}
ch_name2	        Raw	{}
ch_name3	        Raw	{}
ch_name4	        Raw	{}
ch_name5	        Raw	{}
*/