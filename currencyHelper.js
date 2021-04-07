const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require("fs");
const fetch = require('node-fetch');
const sqlconfig = require('./dbconfig.js');
var path = require("path");
var execSync = require('child_process').execSync;
const { exec } = require('child_process');


function decodeRatesData(data) {
    try {
        var strip4 = data.substr(data.length - 4);
        var codepos = strip4.charCodeAt(0) + strip4.charCodeAt(1) + strip4.charCodeAt(2) + strip4.charCodeAt(3);
        codepos = (data.length - 10) % codepos;
        codepos = (codepos > (data.length - 10 - 4)) ? (data.length - 10 - 4) : codepos;

        var key = data.substr(codepos, 10);
        data = data.substr(0, codepos) + data.substr(codepos + 10);
        var decodedData = decode64(decodeURIComponent(data));

        if (decodedData === false) {
            return false;
        }

        var result = "";
        var i = 0;
        var j = 0;
        for (i = 0; i < decodedData.length; i += 10) {
            var char1 = decodedData.charAt(i);
            var keychar = key.charAt(((j % key.length) - 1) < 0 ? (key.length + (j % key.length) - 1) : ((j % key.length) - 1));
            char1 = String.fromCharCode(char1.charCodeAt(0) - keychar.charCodeAt(0));
            result += (char1 + decodedData.substring(i + 1, i + 10));
            j++;
        }
        return result;
    } catch (e) {
        return false;
    }
}

function decode64(input) {
    try {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            return false;
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return unescape(output);
    } catch (e) {
        return false;
    }
}

//var t = decodeRatesData('ri4wMzUwODA4JyLZ2NwvYwMIEy');
//return;

function _getCurrencyRate_old() {
    return co(function* () {
        var geturl = "https://www.xe.com/api/protected/midmarket-converter/";
        try {
            var ret = yield fetch(geturl, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(
                response => {
                    if (response.ok) {
                        return response.json();
                    }
                    else {
                        return { errInfo: 'no response' };
                    }
                }
            ).then(
                json => {
                    if (json.payload && json.payload.rates && json.payload.rates.rate) {
                        var timestamp = json.payload.rates.timestamp;
                        var gettime = timestamp.substr(0, 4) + '-' + timestamp.substr(4, 2) + '-' + timestamp.substr(6, 2) + ' ' + timestamp.substr(8, 2) + ':' + timestamp.substr(10, 2);
                        return {
                            rate: decodeRatesData(json.payload.rates.rate),
                            gettime: gettime,
                        };
                    }
                    return 0;
                }
            );
            return ret;
        } catch (eo) {
            return 0;
        }
    });
}

var execProcess = null;

function _cmdCallback(err, stdout, stderr, needUpdates) {
    execProcess = null;
    if (err) {
        serverhelper.InformSysManager(JSON.stringify(err), 'FreshCurrencyRate');
        return;
    }
    if (stderr && stderr.length > 0) {
        serverhelper.InformSysManager(stderr, 'FreshCurrencyRate');
        return;
    }
    var result = stdout.replace(/\\/g, "");
    //console.log(result);
    var sPos = result.indexOf('rlt="');
    if (sPos == -1) {
        serverhelper.InformSysManager('找不到 rlt="{' + result + '"', 'FreshCurrencyRate');
        return;
    }
    var ePos = result.indexOf('"=tlr', sPos);
    if (ePos == -1) {
        serverhelper.InformSysManager('找不到 endpos"' + result + '"', 'FreshCurrencyRate');
        return;
    }
    bodyStr = result.substring(sPos + 5, ePos);
    if (bodyStr == '{}') {
        return; // 获取失败
    }
    var midMarket = JSON.parse(bodyStr);
    if (midMarket.err && midMarket.err.length > 0) {
        serverhelper.InformSysManager('获取汇率出错:' + rateRet.err);
        return;
    }
    if (midMarket.timestamp == null || midMarket.rates.CNY == null || midMarket.rates.USD != 1) {
        serverhelper.InformSysManager('midMarket有误:"' + bodyStr + '"', 'FreshCurrencyRate');
        return;
    }
    var cnyRate = midMarket.rates.CNY;
    var time = new Date(midMarket.timestamp);
    for (var si in needUpdates) {
        var record = needUpdates[si];
        var otherRate = midMarket.rates[record.货币标识代码];
        if(otherRate == null){
            serverhelper.InformSysManager('midMarket中没有:"' + record.货币标识代码 + '"', 'FreshCurrencyRate');
            continue;
        }
        //console.log(record.货币标识代码 + ":" + (cnyRate / otherRate));
        try{
            dbhelper.asynExcute('P811P更新货币当前汇率', [
                dbhelper.makeSqlparam('货币代码', sqlTypes.Int, record.货币种类代码),
                dbhelper.makeSqlparam('最新汇率', sqlTypes.Float, cnyRate / otherRate),
                dbhelper.makeSqlparam('更新时间', sqlTypes.NVarChar(100), serverhelper.DateFun.getFullFormatDateString(time)),
                dbhelper.makeSqlparam('通信密码', sqlTypes.NVarChar(100), sqlconfig.ratepasword),
            ]);
        }catch(eo){
            
        }
    }
}

function _getMidMarketRate(needUpdates) {
    var scriptDir = path.join(__dirname, 'scripts/python/');
    var scriptPath = path.join(scriptDir, 'getMidMarketRate.py');
    try {
        var startPythonCmd = 'python3 -W ignore ' + scriptPath;
        execProcess = exec(startPythonCmd, (err, stdout, stderr) => {
            if (err && err.killed) {
                return; // 被kill掉的
            }
            _cmdCallback(err, stdout, stderr, needUpdates);
        });
    }
    catch (eo) {
        execProcess = null;
        serverhelper.InformSysManager(JSON.stringify(eo), 'FreshCurrencyRate');
    }
}

function FreshCurrencyRate() {
    if (execProcess) {
        if (execProcess.kill()) {
            execProcess = null;
            serverhelper.InformSysManager("execProcess kill 成功", 'FreshCurrencyRate');
        }
        else {
            serverhelper.InformSysManager("execProcess kill 失败", 'FreshCurrencyRate');
            return;
        }
    }
    return co(function* () {
        var sql = 'select 货币种类代码,货币标识代码 from(select [货币种类代码],max(汇率更新时间) as 更新时间 from [T811E货币当日汇率] group by [货币种类代码]) as t3 inner join T801B结算货币种类 on T801B结算货币种类.结算货币种类代码=t3.货币种类代码 where DATEDIFF(day,更新时间,getdate()) >= 1 ';
        var waitFresh_ret = null;
        try {
            waitFresh_ret = yield dbhelper.asynQueryWithParams(sql);
        }
        catch (eo) {
            serverhelper.InformSysManager(JSON.stringify(eo), 'FreshCurrencyRate');
        }
        if (waitFresh_ret && waitFresh_ret.recordset.length > 0) {
            var needUpdates = waitFresh_ret.recordset;
            /*
            needUpdates = [{
                "货币标识代码": 'USD',
                "货币种类代码": 1
            },
            {
                "货币标识代码": 'AUD',
                "货币种类代码": 16
            },
            {
                "货币标识代码": 'QAR',
                "货币种类代码": 9
            }];
            */
            _getMidMarketRate(needUpdates);
        }
    });
}

module.exports = {
    freshCurrencyRate: FreshCurrencyRate,
};

FreshCurrencyRate();
