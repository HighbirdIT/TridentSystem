const dbhelper = require('./dbhelper.js');
const serverhelper = require('./erpserverhelper.js');
const co = require('co');
const sqlTypes = dbhelper.Types;
const fs = require("fs");
const fetch = require('node-fetch');
const sqlconfig = require('./dbconfig.js');
var path = require("path");
var execSync = require('child_process').execSync;


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
                        var gettime = timestamp.substr(0,4) + '-' + timestamp.substr(4,2) + '-' + timestamp.substr(6,2) + ' ' + timestamp.substr(8,2) + ':' + timestamp.substr(10,2);
                        return {
                            rate:decodeRatesData(json.payload.rates.rate),
                            gettime:gettime,
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

function _getCurrencyRate(currencyCode) {
    return co(function* () {
        var scriptDir = path.join(__dirname, 'scripts/python/');
        var scriptPath = path.join(scriptDir, 'getCurrencyRate.py');
        var result = '';
        try {
            var startPythonCmd = 'python3 -W ignore ' + scriptPath;
            result = execSync(startPythonCmd).toString();
            var sPos = result.indexOf('rlt={');
            if(sPos == -1){
                throw new Error('找不到 rlt={');
            }
            var ePos = result.indexOf('}', sPos);
            if(ePos == -1){
                throw new Error('找不到 endpos');
            }
            var rltJson = JSON.parse(result.substring(sPos + 4, ePos + 1));
            return rltJson;
        }
        catch (eo) {
            return {
                err: eo.message
            };
        }
    });
}

function FreshCurrencyRate() {
    return co(function* () {
        var sql = 'select 货币种类代码,货币标识代码 from(select [货币种类代码],max(汇率更新时间) as 更新时间 from [T811E货币当日汇率] group by [货币种类代码]) as t3 inner join T801B结算货币种类 on T801B结算货币种类.结算货币种类代码=t3.货币种类代码 where DATEDIFF(day,更新时间,getdate()) >= 1 ';
        var waitFresh_ret = null;
        try {
            waitFresh_ret = yield dbhelper.asynQueryWithParams(sql);
        }
        catch (eo) {
            serverhelper.InformSysManager(JSON.stringify(eo), 'FreshCurrencyRate');
        }
        if (waitFresh_ret && waitFresh_ret.recordset) {
            for (var si in waitFresh_ret.recordset) {
                var record = waitFresh_ret.recordset[si];
                var rateRet = yield _getCurrencyRate(record.货币标识代码);
                if(rateRet.err && rateRet.err.length>0){
                    serverhelper.InformSysManager('获取汇率出错:' + rateRet.err);
                    break;
                }
                try{
                    var proret = yield dbhelper.asynExcute('P811P更新货币当前汇率', [
                        dbhelper.makeSqlparam('货币代码', sqlTypes.Int, record.货币种类代码),
                        dbhelper.makeSqlparam('最新汇率', sqlTypes.Float, rateRet.rate),
                        dbhelper.makeSqlparam('更新时间', sqlTypes.NVarChar(100), serverhelper.DateFun.getFullFormatDateString(new Date(rateRet.time))),
                        dbhelper.makeSqlparam('通信密码', sqlTypes.NVarChar(100), sqlconfig.ratepasword),
                    ]);
                }catch(eo){
                    
                }
            }
        }
    });
}

module.exports = {
    freshCurrencyRate: FreshCurrencyRate,
};

