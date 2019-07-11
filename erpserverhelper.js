const co = require('co');
const dbhelper = require('./dbhelper.js');
const sqlTypes = dbhelper.Types;

var helper = {};

helper.createErrorRet = (info, code, data) => {
    return {
        err: {
            info: info,
            code: code,
            data: data,
        }
    };
};

helper.commonProcess = (req, res, next, action_map, ignoreENVCheck) => {
    var rlt = {};
    if(req.body == null){
        rlt.err = {
            info: 'no bdoy'
        };
        res.json(rlt);
    }
    else if(req.body.action == null){
        rlt.err = {
            info: 'no action'
        };
        res.json(rlt);
    }
    else if(ignoreENVCheck != true && req.session.g_envVar == null){
        rlt.err = {
            info: '登录信息失效，无法使用'
        };
        res.json(rlt);
    }
    else{
        var processer = action_map[req.body.action];
        if(processer == null){
            rlt.err = {
                info: '不支持的action:' + req.body.action
            };
            res.json(rlt);
        }
        else{
            processer(req, res)
            .then((data) => {
                if(data){
                    if (data.err) {
                        rlt.err = data.err;
                    }
                    else if (data.banAutoReturn) {
                        return;
                    }
                }
                rlt.data = data;
                res.json(rlt);
            })
            .catch(err => {
                rlt.err = {
                    info: err.message
                };
                res.json(rlt);
                console.error(rlt);
            });
        }
    }
};

helper.JsObjectToString = (obj)=>{
	var objtype = typeof obj;
	if(objtype === 'string' || objtype === 'number' || objtype === 'boolean'){
		return obj;
	}
	else if(objtype != 'object'){
		console.error('what is ' + objtype);
	}
	var rltStr = '{';
	if(obj.length != null && typeof obj.length === 'function'){
		rltStr = '[';
		obj.forEach(
			(e,i)=>{
				rltStr += (i == 0 ? '' : ',') + helper.JsObjectToString(e);
			}
		);
		rltStr += ']';
	}
	else{
		for(var si in obj){
			rltStr += si + ':' + helper.JsObjectToString(obj[si]) + ',';
		}
		rltStr += '}';
	}
	
	return rltStr;
};

helper.IsEmptyObject = (val)=>{
	for(var si in val){
		if(val[si] != null){
			return false;
		}
	}
	return true;
};

helper.IsEmptyString = (val)=>{
    return val == null || val === '';
};

helper.IsEmptyArray = (val)=>{
    return Array.isArray(val) && val.length == 0;
};

helper.InformSysManager = (text, identity)=>{
    dbhelper.asynExcute('P000M通知系统管理员', [
        dbhelper.makeSqlparam('发送者标识', sqlTypes.NVarChar(1000), identity),
        dbhelper.makeSqlparam('通知内容', sqlTypes.NVarChar(1000), text),
    ]);
};

function checkArrayData(val) {
    if(Array.isArray(val)){
        return val[0];
    }
    return val;
}

function GetFormatDateString_MD(date) {
    date = checkArrayData(date);
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return m + (d < 10 ? '-0' : '-') + d;
}

function GetFullFormatDateString(date,hadSec) {
    date = checkArrayData(date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();

    var hour = date.getHours();
    var mi = date.getMinutes();
    var sec = date.getSeconds();

    return y + (m < 10 ? '-0' : '-') + m + (d < 10 ? '-0' : '-') + d + ' ' + (hour < 10 ? '0' : '') + hour + (mi < 10 ? ':0' : ':') + mi + (hadSec != false ? (sec < 10 ? ':0' : ':') + sec : '');
}

function GetFormatDateString(date) {
    date = checkArrayData(date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + (m < 10 ? '-0' : '-') + m + (d < 10 ? '-0' : '-') + d;
}

function GetFormatTimeString(date,hadSec) {
    date = checkArrayData(date);
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m + (hadSec != false ? (s < 10 ? ':0' : ':') + s : '');
}

function GetNowDate() {
    return new Date(GetFormatDateString(new Date()));
}

function CheckDate(date) {
    date = checkArrayData(date);
    var dateVal = new Date(Date.parse(date));
    return !isNaN(dateVal.getDate());
}

function CheckTime(str) {
    var dateVal = new Date(Date.parse('2000-1-1 ' + str));
    return !isNaN(dateVal.getDate());
}

function CutTimePart(date) {
    date = checkArrayData(date);
    var rlt = new Date(date);
    rlt.setHours(0);
    rlt.setMinutes(0);
    rlt.setMilliseconds(0);
    rlt.setSeconds(0);
    return rlt;
}

function ConvertTimeToDate(str) {
    var now = new Date();
    return combineDateAndTime(getFormatDateString(now), str);
}

function CombineDateAndTime(dateStr, timeStr) {
    return new Date(Date.parse(dateStr + ' ' + timeStr));
}

function GetDateDiff(type, dateA, dateB) {
    var divNum = 0;
    switch (type.toLowerCase()) {
        case '秒':
            divNum = 1000;
            break;
        case '分':
            divNum = 1000 * 60;
            break;
        case '时':
            divNum = 1000 * 60 * 60;
            break;
        case '天':
            divNum = 1000 * 60 * 60 * 24;
            break;
        case '月':
            divNum = 1000 * 60 * 60 * 24 * 30;
            break;
        case '年':
            divNum = 1000 * 60 * 60 * 24 * 365;
            break;
    }
    if (typeof dateA === 'string') {
        dateA = new Date(dateA);
    }
    if (typeof dateB === 'string') {
        dateB = new Date(dateB);
    }
    return (dateB.getTime() - dateA.getTime()) / divNum;
}

var gDateReg = /\d+[-/]\d+[-/]\d+/;
var gTimeReg = /\d+:\d+:\d+/;
var gShortTimeReg = /\d+:\d+/;

function CastDate(val){
    if(typeof val === 'string'){
        var dateRegRlt = gDateReg.exec(val);
        var dateStr = '';
        if(dateRegRlt != null){
            dateStr = dateRegRlt[0];
            var timeRegRlt = gTimeReg.exec(val);
            if(timeRegRlt == null){
                timeRegRlt = gShortTimeReg.exec(val);
            }
            if(timeRegRlt != null){
                dateStr += ' ' + timeRegRlt[0];
            }
            return new Date(dateStr);
        }
        return null;
    }
    
    return new Date(val);
}

helper.DateFun={
    getNowDate:GetNowDate,
    checkDate:CheckDate,
    checkTime:CheckTime,
    cutTimePart:CutTimePart,
    convertTimeToDate:ConvertTimeToDate,
    combineDateAndTime:CombineDateAndTime,
    getDateDiff:GetDateDiff,
    getFormatDateString:GetFormatDateString,
    getFormatTimeString:GetFormatTimeString,
    castDate:CastDate,
    getFormatDateString_MD:GetFormatDateString_MD,
    getFullFormatDateString:GetFullFormatDateString,
};

module.exports = helper;