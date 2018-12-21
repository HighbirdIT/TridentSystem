const PAGE_LOADED = 'PAGE_LOADED';

function makeActionCreator(type, ...argNames) {
    return function (...args) {
        let action = { type };
        argNames.forEach((arg, index) => {
            action[argNames[index]] = args[index]
        });
        return action;
    }
}


function updateObject(oldObject, newValues) {
    if(oldObject == null){
        return Object.assign({}, newValues);
    }
    return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if (item.id !== itemId) {
            return item;
        }
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });

    return updatedItems;
}

function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        } else {
            return state;
        }
    }
}


// post functions
const AT_FETCHBEGIN = 'AT_FETCHBEGIN';
const AT_FETCHEND = 'AT_FETCHEND';
const AT_SETSTATEBYPATH = 'AT_SETSTATEBYPATH';
const AT_SETMANYSTATEBYPATH = 'AT_SETMANYSTATEBYPATH';

function makeAction_fetchbegin(key,fetchData) {
    return {
        type: AT_FETCHBEGIN,
        key: key,
        fetchData: fetchData
    };
}

function makeAction_fetchend(key, json, fetchData) {
    return {
        type: AT_FETCHEND,
        key: key,
        json: json,
        receivedAt: Date.now(),
        fetchData: fetchData
    };
}

function makeAction_fetchError(key, err, fetchData) {
    return {
        type: AT_FETCHEND,
        key: key,
        err: err,
        receivedAt: Date.now(),
        fetchData: fetchData
    };
}

const makeAction_setStateByPath = makeActionCreator(AT_SETSTATEBYPATH, 'value', 'path');
const makeAction_setManyStateByPath = makeActionCreator(AT_SETMANYSTATEBYPATH, 'value', 'path');

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}

function checkDate(date) {
    var dateVal = new Date(Date.parse(date));
    return !isNaN(dateVal.getDate());
}

// commonreducer
const logger = store => next => action => {
    if(isDebug != false){
        console.log('dispatching', action);
    }
    let result = next(action);
    if(isDebug != false){
        console.log('next state', store.getState());
    }
    return result;
}

const crashReporter = store => next => action => {
    //console.log('crashReporter start');
    let rlt = null;
    try {
        rlt = next(action);
    } catch (err) {
        console.error('Caught an exception!', err);
        Raven.captureException(err, {
            extra: {
                action,
                state: store.getState()
            }
        })
        throw err;
    }
    //console.log('crashReporter end');
    return rlt;
}

//const timeoutScheduler = store => next => action => {
    function createThunkMiddleware(extraArgument) {
        return function (_ref) {
            var dispatch = _ref.dispatch,
                getState = _ref.getState;
            return function (next) {
                return function (action) {
                    if (typeof action === 'function') {
                        return action(dispatch, getState, extraArgument);
                    }
    
                    return next(action);
                };
            };
        };
    }

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

function ReplaceIfNull(val,def){
	return val == null ? def : val;
}

function ReplaceIfNaN(val,def){
	return val == null || isNaN(val) ? def : val;
}

function IsEmptyString(val){
	return val == null || val === '';
}

function IsEmptyArray(val){
	return val == null || val.length == 0;
}

const ErrType={
    UNKNOWN:'UNKNOWN',
    TIMEOUT:'TIMEOUT',
    SERVERSIDE:'SERVERSIDE',
    NORESPONSE:'NORESPONSE',
};

function createError(info, type){
    return{
        type:type == null ? ErrType.UNKNOWN : type,
        info:info,
    };
}

function fetchJsonPost(url, sendData, triggerData, key = '',tip = '加载中', timeout = 2) {
	return fetchJson(false, url, sendData, triggerData, key, tip, timeout);
}

function fetchJsonGet(url, sendData, triggerData, key = '',tip = '加载中', timeout = 2) {
	return fetchJson(true, url, sendData, triggerData, key, tip, timeout);
}

function fetchJson(useGet, url, sendData, triggerData, key = '', tip = '加载中', timeout = 2){
	timeout = Math.min(Math.max(30, timeout), 120) * 1000;
	var thisFetch = {
        triggerData:triggerData,
        useGet:useGet,
        url:url,
        sendData:sendData,
        key:key,
        tip:tip,
    };
	var fetchParam = {
		method: useGet ? "GET" : "POST",
		headers: {
			"Content-Type": "application/json"
		},
		credentials: "include",
    }
    var dispatched = false;
	if(useGet){
		if(sendData != null){
			var str = '';
			for(var si in sendData){
				str += si + '=' + sendData[si];
			}
			if(str.length > 0){
				url += '?' + str;
			}
		}
	}
	else{
		fetchParam.body = JSON.stringify(sendData);
	}
    return function (dispatch) {
        dispatch(makeAction_fetchbegin(key, thisFetch));
        var timeoutHandler = setTimeout(() => {
            dispatched = true;
            var errObj = createError('啊哦，服务器没响应了', ErrType.TIMEOUT);
            dispatch(makeAction_fetchError(key, errObj, thisFetch));
        }, timeout);
        return fetch(url, fetchParam).then(
            response => {
                if(dispatched){
                    console.log('response at dispatched');
                    return null;
                }
                clearTimeout(timeoutHandler);
                if (response.ok) {
                    return response.json();
                }
                else {
                    var errObj = createError(response.statusText,ErrType.NORESPONSE, thisFetch);
                    dispatch(makeAction_fetchError(key, errObj, thisFetch));
                    return null;
                }
            },
            error => {
                if(dispatched){
                    console.log('response at dispatched');
                    return null;
                }
                console.warn('An error occurred.', error);
                var errObj = createError(error.toString(),ErrType.NORESPONSE, thisFetch);
                dispatch(makeAction_fetchError(key, errObj, thisFetch));
            }
        ).then(json => {
            if(dispatched){
                console.log('response at dispatched');
                return null;
            }
            if(json == null){
                dispatch(makeAction_fetchError(key, createError('"' + url + '"没有响应', ErrType.SERVERSIDE, thisFetch), thisFetch));
            }
            else if(json.err != null){
                dispatch(makeAction_fetchError(key, createError(json.err.info, ErrType.SERVERSIDE, thisFetch), thisFetch));
            }
            else{
                //setTimeout(() => {
                    dispatch(makeAction_fetchend(key, json, thisFetch));
                //}, 2000);
            }
        });
    };
}

function getValFromCookies(identity, defaultVal) {
    var a = Cookies.get(identity);
    return a == null ? defaultVal : a;
}

function getNumberFromCookies(identity, defaultVal) {
    return parseFloat(getValFromCookies(identity, defaultVal));
}

function getStateByPath(state, path, def){
    var t_arr = path.split('.');
    var nowState = state;
    for(var si in t_arr){
        var prop = t_arr[si];
        if(nowState[prop] == null){
            return def;
        }
        nowState = nowState[prop];
    }
    return nowState;
}

function setStateByPath(state, path, value, visited){
    if(path == null || path.length == 0){
        return state;
    }
    var t_arr = path.split('.');
    var len = t_arr.length;
    var nowState = state;
    var newStatePrent = null;
    var newStateName = null;
    var newStateValue = null;
    var preState = state;
    var preStateName = null;
    for(var i=0; i < len; ++i){
        // 最后一个是属性的名字
        var name = t_arr[i];
        if(i >= len - 1){
            if(newStatePrent == null){
                if(nowState[name] == value){
                    return state;
                }
                newStatePrent = preState;
                newStateName = preStateName;
                newStateValue = {};
                newStateValue[name] = value;
            }
            else{
                nowState[name] = value;
            }
            break;
        }
        if(nowState[name] == null){
            if(newStatePrent == null){
                newStatePrent = preState;
                newStateName = preStateName;
                nowState = {};
                newStateValue = {};
                newStateValue[name] = nowState;
            }
            else{
                nowState[name] = {};
            }
        }
        else{
            preState = nowState;
            preStateName = name;
            nowState = nowState[name];
        }
    }
    if(preStateName == null){
        return newStateValue;
    }
    newStatePrent[newStateName] = updateObject(newStatePrent[newStateName], newStateValue);
    var retState = controlStateChanged(state, path, value, visited == null ? {} : visited);

    return retState == state ? Object.assign({}, retState) : retState;
}

function setManyStateByPath(state, path, valuesObj, visited){
    if(path == null || path.length == 0 || valuesObj == null){
        return state;
    }
    var t_arr = path.split('.');
    var len = t_arr.length;
    var nowState = state;
    var newStatePrent = null;
    var newStateName = null;
    var newStateValue = null;
    var preState = state;
    var preStateName = null;
    for(var i=0; i < len; ++i){
        // 最后一个是属性的名字
        var name = t_arr[i];
        if(i >= len - 1){
            if(newStatePrent == null){
                var hadChange = false;
                for(var pi in valuesObj){
                    if(valuesObj[pi] != nowState[pi]){
                        hadChange = true;
                        break;
                    }
                }
                if(!hadChange){
                    return state;
                }
                newStatePrent = nowState;
                newStateName = name;
                newStateValue = Object.assign({},nowState[name],valuesObj);
            }
            else{
                nowState[name] = Object.assign({},nowState[name],valuesObj);
            }
            break;
        }
        if(nowState[name] == null){
            if(newStatePrent == null){
                newStatePrent = preState;
                newStateName = preStateName;
                nowState = {};
                newStateValue = {};
                newStateValue[name] = nowState;
            }
            else{
                nowState[name] = {};
            }
        }
        else{
            preState = nowState;
            preStateName = name;
            nowState = nowState[name];
        }
    }
    if(preStateName == null){
        return newStateValue;
    }
    newStatePrent[newStateName] = updateObject(newStatePrent[newStateName], newStateValue);
    var retState = Object.assign({},state);

    if(visited == null){
        visited = {};
    }
    var retState = state;
    for(var pi in valuesObj){
        retState = controlStateChanged(retState, path + '.' + pi, valuesObj[pi], visited);
    }
    return retState == state ? Object.assign({}, retState) : retState;
}

function MakePath(){
    var rlt = '';
    for(var i=0;i<arguments.length;++i){
        rlt += (i==0 ? '' : '.') + arguments[i];
    }
    return rlt;
}