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