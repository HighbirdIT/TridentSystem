const co = require('co');
const dbhelper = require('./dbhelper.js');
const sqlTypes = dbhelper.Types;
var fs = require('fs');
var path = require("path");

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

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

helper.guid2 = ()=>{
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
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
    return new Date(GetFormatDateString(new Date()) + ' 00:00');
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
            else{
                dateStr += ' 00:00';
            }
            return new Date(dateStr);
        }
        return null;
    }
    
    return new Date(val);
}

function CastDateFromTimePart(val) {
    var timeRegRlt = gTimeReg.exec(val);
    if (timeRegRlt == null) {
        timeRegRlt = gShortTimeReg.exec(val);
    }
    if (timeRegRlt == null) {
        return null;
    }

    return new Date('2000-1-1 ' + timeRegRlt[0]);
}

const gWeekDayName_arr = ["日", "一", "二", "三", "四", "五", "六"];
function GetweekDay(date) {
	if (!checkDate(date)) {
		date = castDate(date);
	}
	return "星期" + gWeekDayName_arr[date.getDay()]
}

function Convert_TimeZone(time, zoneSrc, zoneDst) {
    var firsttime;
    if (typeof time === 'string') {
        firsttime = castDateFromTimePart(time);
    }else{
        firsttime=time;
    }
    var datetime = firsttime.getTime();
    var offset = 0;
    zoneSrc = parseInt(zoneSrc);
    zoneDst = parseInt(zoneDst);
    offset = -zoneSrc + zoneDst;
    return new Date(firsttime.setTime(datetime + 1000 * 60 * 60 * offset));
}

function Convert_DateZone(pDate, zoneDst) {
    var rltDate = new Date(pDate);
    var time = pDate.getTime();
    var offset = 0;
    var zoneSrc = Math.floor(rltDate.getTimezoneOffset()/-60);    
    zoneDst = parseInt(zoneDst);
    offset = -zoneSrc + zoneDst;
    if(offset != 0){
        rltDate.setTime(time + 1000 * 60 * 60 * offset);
    }
    return rltDate;
}

function CreateDate(year, month, day){
    if(day > 32){
        day = 31;
    }
    var rlt = new Date(year, month - 1, Math.max(day,0));
    if(day == 32){
        rlt.setDate(1);
    }
    else if(day > 0 && (rlt.getMonth() != month-1 || rlt.getFullYear() != year)){
        rlt.setDate(1);
        rlt = new Date(rlt - 86400000);
    }
    return rlt;
}


helper.CheckPermission = (req, projid, groups_arr)=>{
    return co(function* () {
        var session =  req && req.session ? req.session : null;
        var g_envVar = session ? session.g_envVar : null;
        if(g_envVar == null){
            return false;
        }
        if(projid == null){
            return false;
        }
        if(groups_arr == null){
            groups_arr = [];
        }
        var cache = session.permissionCache;
        if(cache == null){
            cache = {};
        }
        else{
            var queryData;
            var nowTime = new Date().toLocaleTimeString();
            if(groups_arr.length == 0){
                queryData = cache[projid + '_0'];
                if(queryData && nowTime < queryData.过期时间){
                    return queryData.有效授权;
                }
            }
            else{
                var allhit = true;
                for(var gi=0;gi<groups_arr.length;++gi){
                    queryData = cache[projid + '_' + groups_arr[gi]];
                    if(queryData && nowTime < queryData.过期时间){
                        if(queryData.有效授权){
                            return true;
                        }
                    }
                    else{
                        allhit = false;
                    }
                }
                if(allhit){
                    return false;
                }
            }
        }
        var sql = 'select 权限组代码,有效授权,信息 from FT访问权限检查(@登录标识,@方案代码,@权限组)';
        var rcdRlt = yield dbhelper.asynQueryWithParams(sql, [
            dbhelper.makeSqlparam('登录标识', sqlTypes.NVarChar(100), g_envVar.logrcdid),
            dbhelper.makeSqlparam('方案代码', sqlTypes.Int, projid),
            dbhelper.makeSqlparam('权限组', sqlTypes.NVarChar(500), groups_arr.join(',')),
        ]);
        var recordset = rcdRlt.recordset;
        var hadPermissioin = false;
        recordset.forEach(rcd=>{
            cache[projid + '_' + rcd.权限组代码] = {
                有效授权:rcd.有效授权,
                过期时间:new Date(new Date().getTime() + 1000 * 60 * (rcd.有效授权 ? 60 : 3)).toLocaleTimeString(),  //有效授权缓存60分钟，无效授权缓存3分钟
            };
            if(rcd.有效授权){
                if(rcd.权限组代码 == 0){
                    if(groups_arr.length == 0){
                        hadPermissioin = rcd.有效授权;
                    }
                }
                else if(rcd.有效授权){
                    hadPermissioin = true;
                }
            }
        });
        session.permissionCache = cache;
        return hadPermissioin;
    });
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
    castDateFromTimePart:CastDateFromTimePart,
    getweekDay:GetweekDay,
    Convert_TimeZone:Convert_TimeZone,
    Convert_DateZone:Convert_DateZone,
    createDate:CreateDate,
};


module.exports = helper;