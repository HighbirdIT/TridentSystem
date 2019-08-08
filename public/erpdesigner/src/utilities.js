import { isDate } from "util";

function autoBind(self, options) {
	options = Object.assign({}, options);
	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		if (options.include) {
			return options.include.some(match);
		}
		if (options.exclude) {
			return !options.exclude.some(match);
		}
		return true;
	};

	for (const key of Object.getOwnPropertyNames(self.constructor.prototype)) {
		const val = self[key];

		if (key !== 'constructor' && typeof val === 'function' && filter(key)) {
			self[key] = val.bind(self);
		}
	}

	return self;
}

function assginObjByProperties(dstObj, srcObj, pros_arr){
	pros_arr.forEach(pName=>{
		dstObj[pName] = srcObj[pName];
	});
}

function updateObject(oldObject, newValues) {
	return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
	var updatedItems = array.map(function (item) {
		if (item.id !== itemId) {
			return item;
		}
		var updatedItem = updateItemCallback(item);
		return updatedItem;
	});

	return updatedItems;
}

function updateItemInArrayByIndex(array, index, updateItemCallback) {
	var updatedItems = array.map(function (item, i) {
		if (i !== index) {
			return item;
		}
		var updatedItem = updateItemCallback(item);
		return updatedItem;
	});

	return updatedItems;
}

function getAttributeByNode(targetNode, attrName, upserach, maxDeep) {
	if (upserach == null)
		upserach = true;
	var tNode = targetNode;
	var count = 0;
	do {
		if (tNode.hasAttribute(attrName)) {
			return tNode.getAttribute(attrName);
		}
		tNode = tNode.parentNode;
		++count;
	} while (tNode && (maxDeep == null || count < maxDeep) && tNode != document.body);
	return null;
}

function parseUnitInt(str){
	var ret = parseInt(str);
	return isNaN(ret) ? 0 : ret;
}

function parseUnitFloat(str){
	var ret = parseFloat(str);
	return isNaN(ret) ? 0 : ret;
}

function parseBoolean(str){
	return str == true || str =='true' || str == '1';
}

function isNodeHasParent(targetNode, parentNode) {
	if(targetNode == parentNode){
		return true;
	}
	var tNode = targetNode;
	var count = 0;
	do {
		if (tNode.parentNode == parentNode) {
			return true;
		}
		tNode = tNode.parentNode;
		++count;
	} while (tNode && tNode.parentNode);
	return false;
}

function extractPropsFromObj(obj, props_arr) {
	var rlt = {};
	props_arr.forEach(prop => {
		if (obj && obj[prop.name] != null)
			rlt[prop.name] = obj[prop.name];
		else {
			rlt[prop.name] = typeof prop.default == 'function' ? prop.default() : prop.default;
		}
	});
	return rlt;
}

function removeElemFrommArray(arr,elem){
	var index = arr.indexOf(elem);
	if(index >= 0){
		arr.splice(index, 1);
		return true;
	}
	return false;
}

const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';

function requestPosts(key, tip, postData) {
	return {
		type: REQUEST_POSTS,
		tip: tip,
		key: key,
		postData: postData,
	};
}

function receivePosts(key, json, postData) {
	return {
		type: RECEIVE_POSTS,
		key: key,
		posts: json,
		receivedAt: Date.now(),
		postData: postData
	};
}

function fetchResult(key, sucess, json, postdata) {
	return {
		success: sucess,
		key: key,
		json: json,
		receivedAt: Date.now(),
		postData: postdata
	};
}

function fetchJson(useGet, url, params, callBack, key = '', timeout = 2){
	timeout = Math.min(Math.max(30, timeout), 120) * 1000;
	var thisFetch = {};
	thisFetch.callBack = callBack;
	var timeoutHandler = setTimeout(() => {
		if (thisFetch.callBack) {
			thisFetch.callBack(fetchResult(key, false, { err: { info: '啊哦，服务器没响应了' } }, params));
		}
	}, timeout);

	var fetchParam = {
		method: useGet ? "GET" : "POST",
		headers: {
			"Content-Type": "application/json"
		},
		credentials: "include",
	}
	if(useGet){
		if(params != null){
			var str = '';
			for(var si in params){
				str += si + '=' + params[si];
			}
			if(str.length > 0){
				url += '?' + str;
			}
		}
	}
	else{
		fetchParam.body = JSON.stringify(params);
	}

	//console.log(url);

	return fetch(url, fetchParam).then(
		response => {
			clearTimeout(timeoutHandler);
			if (response.ok) {
				return response.json();
			}
			else {
				if (thisFetch.callBack) {
					thisFetch.callBack(fetchResult(key, false, { err: { info: response.statusText } }, params));
				}
				return null;
			}
		},
		error => console.log('An error occurred.', error)
	).then(json => {
		if (json != null) {
			if (thisFetch.callBack) {
				thisFetch.callBack(fetchResult(key, true, json, params));
			}
		}
	});
}

function fetchJsonPost(url, postdata, callBack, key = '', timeout = 2) {
	fetchJson(false, url, postdata, callBack, key, timeout);
}

function fetchJsonGet(url, params, callBack, key = '', timeout = 2) {
	fetchJson(true, url, params, callBack, key, timeout);

}

function ReplaceIfNull(val,def){
	return val == null ? def : val;
}

function ReplaceIfNaN(val,def){
	return val == null || isNaN(val) ? def : val;
}

function IsEmptyString(val){
	return val == null || val === '';
}

function IsEmptyObject(val){
	for(var si in val){
		if(val[si] != null){
			return false;
		}
	}
	return true;
}

function IsEmptyArray(val){
	return val == null || val.length == 0;
}

function EV_BanEvent(et){
    var nowVal = this.suspressEvents[et];
    this.suspressEvents[et] = nowVal == null ? 1 : nowVal + 1;
}

function EV_AllowEvent(et){
    var nowVal = this.suspressEvents[et];
    if(nowVal > 0){
        this.suspressEvents[et] = nowVal - 1;
    }
    else{
        console.warn('allowEvent执行时count等于' + nowVal);
    }
}

function EV_FireEvent(et,delay,arg){
    if(this.suspressEvents[et] > 0){
        console.warn(et + '被压抑了');
        return; // 压抑了此事件
    }
    if(delay == null || isNaN(delay)){
        delay = 0;
    }
    if(delay < 0){
        delay = 0;
    }
    else if(delay > 500){
        console.warn('长达' + delay + '毫秒的延迟fire' + et);
    }
    var self = this;
    if(delay > 0)
    {
        setTimeout(() => {
            self.emit(et, arg == null ? self : arg);
        }, delay);
    }
    else{
        self.emit(et, arg == null ? self : arg);
    }
}

function EnhanceEventEmiter(target){
    target.suspressEvents = {};
    target.fireEvent = EV_FireEvent.bind(target);
    target.banEvent = EV_BanEvent.bind(target);
	target.allowEvent = EV_AllowEvent.bind(target);
}

function singleQuotesStr(val){
	return "'" + val + "'";
}

function doubleQuotesStr(val){
	return '"' + val + '"';
}

function bracketStr(val){
	return '(' + val + ')';
}

function midbracketStr(val){
	return '[' + val + ']';
}

function bigbracketStr(val){
	return '{' + val + '}';
}

function clampStr(val, preChar, aftChar){
	return preChar + val + aftChar;
}

function JsObjectToString(obj){
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
				rltStr += (i == 0 ? '' : ',') + JsObjectToString(e);
			}
		);
		rltStr += ']';
	}
	else{
		for(var si in obj){
			rltStr += si + ':' + JsObjectToString(obj[si]) + ',';
		}
		rltStr += '}';
	}
	
	return rltStr;
}

function makeLine_Assign(left, right){
	return left + '=' + right + ';';
}

function makeLine_RetServerError(info, code, data){
	return "return serverhelper.createErrorRet('" + info + "'," + (code == null ? 0 : code) + "," + (data == null ? 'null' : data) + ");";
}

function makeStr_DotProp(){
	var rlt = '';
    for (var i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null || arguments[i].length == 0)
            continue;
        rlt += (rlt.length == 0 ? '' : '.') + arguments[i];
    }
    return rlt;
}

function makeStr_Join(joinChar){
	var rlt = '';
    for (var i = 1; i < arguments.length; ++i) {
        if (arguments[i] == null || arguments[i].length == 0)
            continue;
        rlt += (rlt.length == 0 ? '' : joinChar) + arguments[i];
    }
    return rlt;
}

function makeStr_AddAll(){
    var rlt = '';
    for (var i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null || arguments[i].length == 0)
            continue;
        rlt += arguments[i];
    }
    return rlt;
}

function makeStr_ThisProp(propName){
	return VarNames.ThisProps + '.' + propName;
}

function parseScriptableString(str, scriptMaster){
	/*
	if(IsEmptyString(str)){
		return{
			isScript:false,
			string:''
		};
	}
	var oldValue = '';
	var jsName = '';
	var pos1;
	var pos2;
	var isScript = false;
	var jsBp = null;
	var jsGroup = null;
	var funName = null;
	var ctlID = null;
	var propName = null;
	var funSuffix = null;
	pos1 = str.indexOf('|JS:');
	if(pos1 != -1){
		isScript = true;
		pos1 += 4;
		pos2 = str.indexOf('|', pos1);
		if(pos2 != -1){
			jsName = str.substring(pos1, pos2);
			var t_arr = jsName.split('-');
			jsGroup = t_arr[0];
			funName = t_arr[1];
			t_arr = funName.split('_');
			ctlID = t_arr[0];
			propName = t_arr[1];
			funSuffix = t_arr[2];
			if(scriptMaster){
				jsBp = scriptMaster.getBPByName(funName);
			}
		}
	}
	pos1 = str.indexOf('|OLD:');
	if(pos1 != -1){
		pos1 += 5;
		pos2 = str.indexOf('|', pos1);
		if(pos2 != -1){
			oldValue = str.substring(pos1, pos2);
		}
	}
	return{
		isScript:isScript,
		oldValue:oldValue,
		jsName:jsName,
		jsBp:jsBp,
		string:str,
		jsGroup:jsGroup,
		funName:funName,
		ctlID:ctlID,
		propName:propName,
		funSuffix:funSuffix,
	};
	*/
}

function makeObj_CtlPropJsBind(ctlID, propName, suffix, oldtext){
	return {
		ctlID:ctlID,
		propName:propName,
		suffix:suffix,
		oldtext:oldtext,
		group:EJsBluePrintFunGroup.CtlAttr,
		isScript:true,
	};
}

function parseObj_CtlPropJsBind(str, scriptMaster){
	if(str == null || typeof str === 'string' || typeof str === 'boolean'){
		return{
			isScript:false,
			string:str
		};
	}
	var json = str;
	var funName = json.ctlID + '_' + json.propName + '_' + json.suffix;
	var jsBp = null;
	if(scriptMaster){
		jsBp = scriptMaster.getBPByName(funName);
	}
	return Object.assign({
		isScript:true,
		jsBp:jsBp,
		funName:funName,
	},json);
}

function getFormatDateString(date){
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + (m < 10 ? '-0' : '-') + m + (d < 10 ? '-0' : '-') + d;
}

function getFormatTimeString(date, hadSec = true) {
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m +(hadSec ? (s < 10 ? ':0' : ':') + s : '');
}

function checkDate(date) {
    var dateVal = new Date(date);
    if(isNaN(dateVal.getDate())){
        if(typeof date === 'string'){
            date = date.replace(/-/g,'/');
        }
        dateVal = new Date(date);
    }
    return !isNaN(dateVal.getDate());
}

function checkTime(str) {
	if(str == null || str.length == 0){
		return false;
	}
    var dateVal = new Date('2000/1/1 ' + str);
    return !isNaN(dateVal.getDate());
}

function getLocalDateTimeFromString(str){
	var tDate = new Date(str);
	if(str.indexOf('GMT') == -1 && str.indexOf('UTC') == -1){
		return new Date(tDate.getTime() + tDate.getTimezoneOffset() * 60 * 1000);
	}
	return tDate;
}

function getFormatDateTimeString(date, hadSec = true){
    var y = date.getFullYear();
    var month = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();

    return y + (month < 10 ? '-0' : '-') + month + (d < 10 ? '-0' : '-') + d + ' ' + (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m +(hadSec ? (s < 10 ? ':0' : ':') + s : '');
}

function modifyStatePath(path, belongUserControl, useCombineFun){
	if(belongUserControl == null){
		switch(path[0]){
			case "'":
			case '"':
			return path;
		}
		return singleQuotesStr(path);
	}
	if(useCombineFun){
		return makeStr_callFun('CombineDotStr',[belongUserControl.id + '_path',singleQuotesStr(path)]);
	}
	return belongUserControl.id + '_path' + "+'." + path + "'";
}

function MapColumnValType2ParamType(colVT, needLen){
	switch(colVT){
		case 'int':
		return 'sqlTypes.Int';
		case 'BigInt':
		return 'sqlTypes.BigInt';
		case 'SmallInt':
		return 'sqlTypes.SmallInt';
		case 'TinyInt':
		return 'sqlTypes.TinyInt';
		case 'float':
		return 'sqlTypes.Float';
		case 'bit':
		return 'sqlTypes.Bit';
		case 'Real':
		return 'sqlTypes.Real';
		case 'Date':
		return 'sqlTypes.Date';
		case 'SmallMoney':
		return 'sqlTypes.SmallMoney';
		case 'DateTime':
		return 'sqlTypes.DateTime';
		case 'DateTime2':
		return 'sqlTypes.DateTime2';
		case 'Time':
		return 'sqlTypes.Time';
		case 'Money':
		return 'sqlTypes.Money';
		case 'Binary':
		return 'sqlTypes.Binary';
		case 'Decimal':
		return 'sqlTypes.Decimal';
		default:
		return 'sqlTypes.NVarChar' + (needLen ? '(4000)' : '');
	}
}

function removeDateTimeZone(dateStr){
	var rlt = dateStr.replace(/.\d+Z$/,'');
	return rlt.replace('t',' ');
}

function createDateWithoutTimeZone(dateStr){
	return new Date(removeDateTimeZone(dateStr));
}

function guid2() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

// getday
function getweekDay(date) {
	var weekarr = ["日", "一", "二", "三", "四", "五", "六"];
	if (isDate(date)) {
		var week = new Date(date).getDay();
	} else {
		var dateStr = new Date(date.replace(/-/g, "\/"));
		var week = dateStr.getDay();
	}
	return "星期" + weekarr[week]
}

//格式化数字加逗号
function addComma(num){
	var reg = num.toString().indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(\d{3})+$)/g;
	return num.toString().replace(reg,'$1,');
}

//数字转中文
 function NumToChinese(n) {
	for (i = n.length - 1; i >= 0; i--) {
		n = n.replace(",", "")//替换Num中的“,” 替换Num中的空格
		n = n.replace(" ", "")
	}
	
	if (isNaN(n)) { 
		return "请检查输入金额是否正确";
	}
	if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)){
		return "数据非法";  //判断数据是否大于0
	}

	var unit = "千百拾亿千百拾万千百拾元角分", str = "";
	n += "00";  

	var indexpoint = n.indexOf('.');  // 如果是小数，截取小数点前面的位数
	if(indexpoint >12){
		return '数据过大';
	}
	if(indexpoint<0 && n.length>14){
		return '数据过大';
	}
	if (indexpoint >= 0){

		n = n.substring(0, indexpoint) + n.substr(indexpoint+1, 2);   // 若为小数，截取需要使用的unit单位
	}

	unit = unit.substr(unit.length - n.length);  // 若为整数，截取需要使用的unit单位
	for (var i=0; i < n.length; i++){
		str += "零壹贰叁肆伍陆柒捌玖".charAt(n.charAt(i)) + unit.charAt(i);  //遍历转化为大写的数字
	}
	var result = str.replace(/零(千|百|拾|角)/g, "零").
		replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").
		replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").
		replace(/元$/g, "元整"); // 替换掉数字里面的零字符，得到结果
	return result;
}