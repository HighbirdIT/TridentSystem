const PAGE_LOADED = 'PAGE_LOADED';

var fetchTracer = {};

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
    if (oldObject == null) {
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
const AT_GOTOPAGE = 'AT_GOTOPAGE';
const AT_PAGELOADED = 'AT_PAGELOADED';
const AT_SETROOTSTATE = 'AT_SETROOTSTATE';
const AT_CALLFUNCTION = 'AT_CALLFUNCTION';

function makeAction_fetchbegin(key, fetchData) {
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

function delayAction() {

}

const makeAction_setStateByPath = makeActionCreator(AT_SETSTATEBYPATH, 'value', 'path');
const makeAction_setManyStateByPath = makeActionCreator(AT_SETMANYSTATEBYPATH, 'value', 'path');
const makeAction_gotoPage = makeActionCreator(AT_GOTOPAGE, 'pageName');
const makeAction_setRootState = makeActionCreator(AT_SETROOTSTATE, 'value');
const makeAction_callFunction = makeActionCreator(AT_CALLFUNCTION, 'fun');

function setStateByPathHandler(state, action) {
    return setStateByPath(state, action.path, action.value);
}

function setManyStateByPathHandler(state, action) {
    return setManyStateByPath(state, action.path, action.value);
}

function setRootStateHandler(state, action) {
    return action.value ? action.value : state;
}

function callFunctionHandler(state, action) {
    var retState = Object.assign({}, state);
    if(typeof action.fun == 'function'){
        action.fun(state);
    }
    return retState;
}

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}

function getNowDate() {
    return castDate(getFormatDateString(new Date()) + ' 00:00');
}

function checkDate(date) {
    var dateVal = new Date(date);
    if (isNaN(dateVal.getDate())) {
        if (typeof date === 'string') {
            date = date.replace(/-/g, '/');
        }
        dateVal = new Date(date);
    }
    return !isNaN(dateVal.getDate());
}

function checkTime(str) {
    if (str == null || str.length == 0) {
        return false;
    }
    var dateVal = new Date('2000/1/1 ' + str);
    return !isNaN(dateVal.getDate());
}

function cutTimePart(date) {
    var rlt = new Date(date);
    rlt.setHours(0);
    rlt.setMinutes(0);
    rlt.setMilliseconds(0);
    rlt.setSeconds(0);
    return rlt;
}

function convertTimeToDate(str) {
    var now = new Date();
    return combineDateAndTime(getFormatDateString(now), str);
}

function combineDateAndTime(dateStr, timeStr) {
    return new Date(Date.parse(dateStr + ' ' + timeStr));
}

var gDateReg = /\d+[-/]\d+[-/]\d+/;
var gTimeReg = /\d+:\d+:\d+/;
var gShortTimeReg = /\d+:\d+/;

const gNumCommaReg_float = /(\d)(?=(\d{3})+\.)/g;
const gNumCommaReg_int = /(\d)(?=(\d{3})+$)/g;

function formatMoneyByComma(num) {
    var reg = num.toString().indexOf('.') > -1 ? gNumCommaReg_float : gNumCommaReg_int;
    return num.toString().replace(reg, '$1,');
}

function castDate(val) {
    if (typeof val === 'string') {
        var dateRegRlt = gDateReg.exec(val);
        var dateStr = '';
        if (dateRegRlt != null) {
            dateStr = dateRegRlt[0];
            var timeRegRlt = gTimeReg.exec(val);
            if (timeRegRlt == null) {
                timeRegRlt = gShortTimeReg.exec(val);
            }
            if (timeRegRlt != null) {
                dateStr += ' ' + timeRegRlt[0];
            }
            else {
                dateStr += ' 00:00';
            }
            var rlt = new Date(dateStr);
            if (isNaN(rlt.getDate())) {
                rlt = new Date(dateStr.replace(/-/g, '/'));
            }
            return rlt;
        }
        return null;
    }
    return new Date(val);
}

function castDateFromTimePart(val) {
    var timeRegRlt = gTimeReg.exec(val);
    if (timeRegRlt == null) {
        timeRegRlt = gShortTimeReg.exec(val);
    }
    if (timeRegRlt == null) {
        return null;
    }

    return new Date('2000/1/1 ' + timeRegRlt[0]);
}

function getDateDiff(type, dateA, dateB) {
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

// commonreducer
const logger = store => next => action => {
    if (gDebugMode != false) {
        console.log('dispatching', action);
    }
    let result = next(action);
    if (gDebugMode != false) {
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

function assginObjByProperties(dstObj, srcObj, pros_arr) {
    pros_arr.forEach(pName => {
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

function parseUnitInt(str) {
    var ret = parseInt(str);
    return isNaN(ret) ? 0 : ret;
}

function parseUnitFloat(str) {
    var ret = parseFloat(str);
    return isNaN(ret) ? 0 : ret;
}

function parseBoolean(str) {
    return str == true || str == 'true' || str == '1' || str == '是' || str == '真';
}

function isNodeHasParent(targetNode, parentNode) {
    if (targetNode == parentNode) {
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

function removeElemFrommArray(arr, elem) {
    var index = arr.indexOf(elem);
    if (index >= 0) {
        arr.splice(index, 1);
        return true;
    }
    return false;
}

function EV_BanEvent(et) {
    var nowVal = this.suspressEvents[et];
    this.suspressEvents[et] = nowVal == null ? 1 : nowVal + 1;
}

function EV_AllowEvent(et) {
    var nowVal = this.suspressEvents[et];
    if (nowVal > 0) {
        this.suspressEvents[et] = nowVal - 1;
    }
    else {
        console.warn('allowEvent执行时count等于' + nowVal);
    }
}

function EV_FireEvent(et, delay, arg) {
    if (this.suspressEvents[et] > 0) {
        console.warn(et + '被压抑了');
        return; // 压抑了此事件
    }
    if (delay == null || isNaN(delay)) {
        delay = 0;
    }
    if (delay < 0) {
        delay = 0;
    }
    else if (delay > 500) {
        console.warn('长达' + delay + '毫秒的延迟fire' + et);
    }
    var self = this;
    if (delay > 0) {
        setTimeout(() => {
            self.emit(et, arg == null ? self : arg);
        }, delay);
    }
    else {
        self.emit(et, arg == null ? self : arg);
    }
}

function EnhanceEventEmiter(target) {
    target.suspressEvents = {};
    target.fireEvent = EV_FireEvent.bind(target);
    target.banEvent = EV_BanEvent.bind(target);
    target.allowEvent = EV_AllowEvent.bind(target);
}

function ReplaceIfNull(val, def) {
    return val == null ? def : val;
}

function ReplaceIfNaN(val, def) {
    return val == null || isNaN(val) ? def : val;
}

function IsEmptyString(val) {
    return val == null || val === '';
}

function IsEmptyArray(val) {
    return val == null || val.length == 0;
}

const ErrType = {
    UNKNOWN: 'UNKNOWN',
    TIMEOUT: 'TIMEOUT',
    SERVERSIDE: 'SERVERSIDE',
    NORESPONSE: 'NORESPONSE',
};

const EFetchKey = {
    FetchPropValue: 'fetchPropValue',
}

function createError(info, type, code, data) {
    return {
        type: type == null ? ErrType.UNKNOWN : type,
        info: info,
        err: 1,
        code: code,
        data: data
    };
}

function makeFTD_Prop(basePath, id, propName, isModel = true) {
    return {
        base: basePath,
        id: id,
        propName: propName,
        isModel: isModel,
    };
}

function makeFTD_Callback(callBack, isModel = true) {
    return {
        callBack: callBack,
        isModel: isModel,
    };
}
const gFetchingProp = {};
const gFetchingQueue = [];
const gMaxFetchingCount = 5;

function hookPropFetch(ftpProp, bundle, autoAdd) {
    var key = ftpProp.id + '_' + ftpProp.propName;
    if (gFetchingProp[key] == null) {
        if (!autoAdd) {
            return false;
        }
        gFetchingProp[key] = [];
    }
    else if (gFetchingProp[key].length > 0) {
        var hited = gFetchingProp[key].find(x => {
            return ObjIsEqual(x.bundle, bundle);
        });
        if (hited) {
            hited.queues_arr.push(ftpProp);
            return true;
        }
    }
    if (autoAdd) {
        gFetchingProp[key].push({
            bundle: bundle,
            queues_arr: []
        });
    }
    return false;
}

function fetchJsonPost(url, sendData, triggerData, key = '', tip = '加载中', timeout = 2) {
    return fetchJson(false, url, sendData, triggerData, key, tip, timeout);
}

function fetchJsonGet(url, sendData, triggerData, key = '', tip = '加载中', timeout = 2) {
    return fetchJson(true, url, sendData, triggerData, key, tip, timeout);
}

var gFetchingCount = 0;

function fetchJson(useGet, url, sendData, triggerData, key = '', tip = '加载中', timeout = 2) {
    switch (key) {
        case EFetchKey.FetchPropValue:
            {
                if (hookPropFetch(triggerData, sendData.bundle, false)) {
                    console.log('fetch做了缓存');
                    return function (dispatch) {
                        dispatch(makeAction_setManyStateByPath({
                            fetching: true,
                            fetchingpropname: triggerData.propName,
                            fetchingErr: null,
                        }, MakePath(triggerData.base, triggerData.id)));
                    }
                }
                sendData.pageid = triggerData.base.split('.')[0];
            }
    }
    timeout = Math.min(Math.max(30, timeout), 120) * 1000;
    var thisFetch = {
        triggerData: triggerData,
        useGet: useGet,
        url: url,
        sendData: sendData,
        key: key,
        tip: tip,
        timeout: timeout,
    };
    gFetchingQueue.push(thisFetch);
    if (gFetchingCount > gMaxFetchingCount) {
        if (key == EFetchKey.FetchPropValue) {
            return function (dispatch) {
                dispatch(makeAction_setManyStateByPath({
                    fetching: true,
                    fetchingpropname: triggerData.propName,
                    fetchingErr: null,
                }, MakePath(triggerData.base, triggerData.id)));
            }
        }
        // enqueue
        return function (dispatch) {
        };
    }

    return _doFetching;
}

function _doNextFetching(dispatch) {
    --gFetchingCount;
    if (gFetchingQueue.length > 0) {
        _doFetching(dispatch);
    }
}

function _doFetching(dispatch) {
    var thisFetch = gFetchingQueue[0];
    gFetchingQueue.shift();
    ++gFetchingCount;
    //console.log('_doFetching:' + JSON.stringify(thisFetch));
    var useGet = thisFetch.useGet;
    var sendData = thisFetch.sendData;
    var triggerData = thisFetch.triggerData;
    var key = thisFetch.key;
    var url = thisFetch.url;
    var timeout = thisFetch.timeout;
    if (key == EFetchKey.FetchPropValue) {
        if (hookPropFetch(triggerData, sendData.bundle, true)) {
            _doNextFetching(dispatch);
            return;
        }
    }
    var fetchParam = {
        method: useGet ? "GET" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
    }
    var dispatched = false;
    if (useGet) {
        if (sendData != null) {
            var str = '';
            for (var si in sendData) {
                str += si + '=' + sendData[si];
            }
            if (str.length > 0) {
                url += '?' + str;
            }
        }
    }
    else {
        fetchParam.body = JSON.stringify(sendData);
    }

    dispatch(makeAction_fetchbegin(key, thisFetch));
    var timeoutHandler = setTimeout(() => {
        dispatched = true;
        var errObj = createError('啊哦，服务器没响应了', ErrType.TIMEOUT);
        dispatch(makeAction_fetchError(key, errObj, thisFetch));
    }, timeout);
    var startTime = new Date().getTime();
    return fetch(url, fetchParam).then(
        response => {
            if (dispatched) {
                console.log('response at dispatched');
                _doNextFetching(dispatch);
                return null;
            }
            clearTimeout(timeoutHandler);
            if (response.ok) {
                return response.json();
            }
            else {
                var errObj = createError(response.statusText, ErrType.NORESPONSE);
                dispatch(makeAction_fetchError(key, errObj, thisFetch));
                _doNextFetching(dispatch);
                return null;
            }
        },
        error => {
            clearTimeout(timeoutHandler);
            if (dispatched) {
                console.log('response at dispatched');
                _doNextFetching(dispatch);
                return null;
            }
            console.warn('An error occurred.', error);
            var errObj = createError(error.toString(), ErrType.NORESPONSE);
            thisFetch.errObj = errObj;
            dispatch(makeAction_fetchError(key, errObj, thisFetch));
            _doNextFetching(dispatch);
        }
    ).then(json => {
        if (thisFetch.errObj) {
            // 已经处理郭error
            return;
        }
        var endTime = new Date().getTime();
        thisFetch.useTime = endTime - startTime;
        if (dispatched) {
            console.log('response at dispatched');
            _doNextFetching(dispatch);
            return null;
        }
        if (json == null) {
            dispatch(makeAction_fetchError(key, createError('"' + url + '"没有响应', ErrType.SERVERSIDE), thisFetch));
        }
        else if (json.err != null) {
            dispatch(makeAction_fetchError(key, createError(json.err.info, ErrType.SERVERSIDE, json.err.code, json.err.data), thisFetch));
        }
        else {
            //setTimeout(() => {
            dispatch(makeAction_fetchend(key, json, thisFetch));
            //}, 2000);
        }
        _doNextFetching(dispatch);
    });
}

function nativeFetchJson(useGet, url, sendData) {
    var thisFetch = {
        useGet: useGet,
        url: url,
        sendData: sendData,
    };
    var fetchParam = {
        method: useGet ? "GET" : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
    }
    if (useGet) {
        if (sendData != null) {
            var str = '';
            for (var si in sendData) {
                str += si + '=' + sendData[si];
            }
            if (str.length > 0) {
                url += '?' + str;
            }
        }
    }
    else {
        fetchParam.body = JSON.stringify(sendData);
    }

    return fetch(url, fetchParam).then(
        response => {
            if (response.ok) {
                return response.json();
            }
            else {
                var errObj = createError(response.statusText, ErrType.NORESPONSE);
                return { err: errObj };
            }
        },
        error => {
            var errObj = createError(error.toString(), ErrType.NORESPONSE);
            return { err: errObj };
        }
    ).then(json => {
        return json;
    });
}

function getValFromCookies(identity, defaultVal) {
    var a = Cookies.get(identity);
    return a == null ? defaultVal : a;
}

function getNumberFromCookies(identity, defaultVal) {
    return parseFloat(getValFromCookies(identity, defaultVal));
}

function getStateByPath(state, path, def) {
    if(path == ''){
        return state;
    }
    if (state == null) {
        return def;
    }
    var t_arr = path.split('.');
    var nowState = state;
    for (var si in t_arr) {
        var prop = t_arr[si];
        if (nowState[prop] == null) {
            return def;
        }
        nowState = nowState[prop];
    }
    return nowState;
}

function setStateByPath(state, path, value, visited) {
    if (path == null || path.length == 0) {
        return state;
    }
    var t_arr = path.split('.');
    var len = t_arr.length;
    var nowState = state;
    var newStateParent = null;
    var newStateName = null;
    var newStateValue = null;
    var preState = state;
    var preStateName = null;
    var oldValue = null;
    for (var i = 0; i < len; ++i) {
        // 最后一个是属性的名字
        var name = t_arr[i];
        if (i >= len - 1) {
            if (newStateParent == null) {
                if (nowState[name] == value) {
                    return state;
                }
                oldValue = nowState[name];
                newStateParent = preState;
                newStateName = preStateName;
                newStateValue = {};
                newStateValue[name] = value;
            }
            else {
                nowState[name] = value;
            }
            break;
        }
        if (nowState[name] == null) {
            if (newStateParent == null) {
                newStateParent = preState;
                newStateName = preStateName;
                nowState = {};
                newStateValue = {};
                newStateValue[name] = nowState;
            }
            else {
                nowState[name] = {};
                nowState = nowState[name];
            }
        }
        else {
            preState = nowState;
            preStateName = name;
            nowState = nowState[name];
        }
    }
    var retState = null;
    if (preStateName == null) {
        retState = Object.assign({}, state, newStateValue);
    }
    else {
        newStateParent[newStateName] = updateObject(newStateParent[newStateName], newStateValue);
        retState = state;
    }
    var delayActs = {};
    retState = aStateChanged(retState, path, value, oldValue, visited == null ? {} : visited, delayActs);
    if (!IsEmptyObject(delayActs)) {
        setTimeout(() => {
            for (var acti in delayActs) {
                var theAct = delayActs[acti];
                if (typeof (theAct.callfun) === 'function') {
                    theAct.callfun.apply(theAct.thisParam ? theAct.thisParam : window, theAct.params_arr);
                }
            }
        }, 50);
    }

    return retState == state ? Object.assign({}, retState) : retState;
}

function setManyStateByPath(state, path, valuesObj, visited) {
    if (path == null || valuesObj == null) {
        return state;
    }
    var t_arr = path.split('.');
    var len = path.length == 0 ? 0 : t_arr.length;
    var nowState = state;
    var newStateParent = null;
    //var newStateValue = null;
    var preState = state;
    var preStatename = null;

    for (var i = 0; i < len; ++i) {
        var name = t_arr[i];
        if (nowState[name] == null) {
            if (newStateParent == null) {
                nowState[name] = {};
                newStateParent = preState;
                //newStateValue = {};
                nowState = nowState[name];
                continue;
            }
            nowState[name] = {};
        }

        if (i == len - 1) {
            if (newStateParent == null) {
                newStateParent = preState;
                //newStateValue = Object.assign({}, nowState[name]);
                nowState[name] = Object.assign({}, nowState[name]);
            }
        }
        preState = nowState;
        preStatename = name;
        nowState = nowState[name];
    }
    var mideState = nowState;
    var changed_arr = [];
    var newStateObj_arr = [];
    for (var vi in valuesObj) {
        var value = valuesObj[vi];
        nowState = mideState;
        t_arr = vi.split('.');
        len = t_arr.length;
        var aidPreStateName = null;
        var aidPreState = null;
        var valueParentPath = path;
        var aidPreStatePath = path;
        for (i = 0; i < len; ++i) {
            name = t_arr[i];
            if (i >= len - 1) {
                if (value != nowState[name]) {
                    changed_arr.push(
                        {
                            path: valueParentPath + '.' + name,
                            name: name,
                            oldValue: nowState[name],
                            newValue: value,
                            state: nowState,
                            preState: aidPreState,
                            preStateName: aidPreStateName,
                            preStatePath: aidPreStatePath,
                            parentPath: valueParentPath,
                        }
                    );
                }
            }
            else {
                aidPreStatePath = valueParentPath;
                valueParentPath += (valueParentPath.length == 0 ? '' : '.') + name;
                if (nowState[name] == null) {
                    nowState[name] = {};
                    newStateObj_arr.push(nowState[name]);
                }
                aidPreState = nowState;
                aidPreStateName = name;
                nowState = nowState[name];
            }
        }
    }
    if (changed_arr.length == 0) {
        return state;
    }

    var newState_map = {};
    var changeState_map = {};
    for (i in changed_arr) {
        var changedInfo = changed_arr[i];
        if (changeState_map[changedInfo.parentPath]) {
            changedInfo.state = changeState_map[changedInfo.parentPath];
        }
        if (changedInfo.preState == null) {
            changedInfo.state[changedInfo.name] = changedInfo.newValue;
            changedInfo.changed == false;
            continue;
        }

        //if(assginedObjs_arr.indexOf(changedInfo.state) == -1){
        //assginedObjs_arr.push(changedInfo.state);
        if (newStateObj_arr.indexOf(changedInfo.state) == -1) {
            var newState = Object.assign({}, changedInfo.state);
            changeState_map[changedInfo.parentPath] = newState;
            changedInfo.state = newState;
            var newPreState = newState_map[changedInfo.preStatePath];
            if(newPreState){
                changedInfo.preState = newPreState;
            }
            newState_map[changedInfo.parentPath] = newState;
            changedInfo.preState[changedInfo.preStateName] = newState;
            newStateObj_arr.push(newState);
        }
        //}
        changedInfo.state[changedInfo.name] = changedInfo.newValue;
    }

    var retState = state;
    /*
    if(newStateParent == state){
        retState = Object.assign({}, state, newStateValue);
    }
    else{
        
        newStateParent[newStateName] = newStateValue;
        retState = state;
    }
    */

    if (visited == null) {
        visited = {};
    }
    var delayActs = {};
    for (i in changed_arr) {
        var changedInfo = changed_arr[i];
        if (changedInfo.changed == false)
            continue;
        retState = aStateChanged(retState, changedInfo.path, changedInfo.newValue, changedInfo.oldValue, visited, delayActs);
    }
    if (!IsEmptyObject(delayActs)) {
        setTimeout(() => {
            for (var acti in delayActs) {
                var theAct = delayActs[acti];
                if (typeof (theAct.callfun) === 'function') {
                    theAct.callfun.apply(theAct.thisParam ? theAct.thisParam : window, theAct.params_arr);
                }
            }
        }, 50);
    }
    return retState == state ? Object.assign({}, retState) : retState;
}

function aStateChanged(state, path, newValue, oldValue, visited = {}, delayActs) {
    if (visited[path] != null) {
        console.error('aStateChanged回路访问:' + path);
    }
    var retState = state;
    visited[path] = 1;
    var rowKeyInfo_map = getRowKeyMapFromPath(path);
    //path = rowKeyInfo_map.newPath;
    /*var belongUserCtlProfile = getBelongUserCtlProfile(path);
    if(belongUserCtlProfile != null){
        console.log(belongUserCtlProfile);
    }*/

    if (appStateChangedAct_map != null) {
        var theAct = appStateChangedAct_map[rowKeyInfo_map.newPath];
        if (theAct) {
            var actRet = theAct(retState, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map);
            if (actRet != null) {
                retState = actRet;
            }
        }
    }
    return retState;
}

function MakePath() {
    var rlt = '';
    for (var i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null || arguments[i].length == 0)
            continue;
        rlt += (rlt.length == 0 ? '' : '.') + arguments[i];
    }
    return rlt;
}

function fetchBeginHandler(state, action) {
    //console.log('fetchBeginHandler');
    var retState = state;
    var fetchIdentify = null;
    var triggerData = action.fetchData.triggerData;

    var isModel = true;
    if (triggerData) {
        isModel = triggerData.isModel != false;
        if (triggerData.base != null && triggerData.id != null && triggerData.propName != null) {
            fetchIdentify = MakePath(triggerData.base, triggerData.id, triggerData.propName);
        }
    }
    if (isModel) {
        var newUI = Object.assign({}, retState.ui);
        newUI.fetchState = action.fetchData;
        retState.ui = newUI;
        retState = Object.assign({}, retState);
    }

    if (triggerData) {
        if (triggerData.base != null && triggerData.id != null) {
            var propPath = MakePath(triggerData.base, triggerData.id);
            retState = setManyStateByPath(retState, propPath, {
                fetching: true,
                fetchingpropname: triggerData.propName,
                fetchingErr: null,
            });
        }
    }

    if (fetchIdentify) {
        fetchTracer[fetchIdentify] = action.fetchData;
    }
    return retState;
}

function fetchEndHandler(state, action) {
    //console.log('fetchEndHandler');
    var retState = state;
    var isModel = true;
    var fetchIdentify = null;
    var triggerData = action.fetchData.triggerData;
    if (triggerData) {
        isModel = triggerData.isModel != false;
        if (triggerData.base != null && triggerData.id != null && triggerData.propName != null) {
            fetchIdentify = MakePath(triggerData.base, triggerData.id, triggerData.propName);
        }
    }
    var discardResult = false;
    if (fetchIdentify) {
        if (fetchTracer[fetchIdentify] != action.fetchData) {
            discardResult = true;
            console.warn('丢弃了一个fetchResult');
            //return state;
        }
    }

    if (action.err != null) {
        console.warn(action.err);
        if (isModel) {
            var newFetchState = Object.assign({}, retState.ui.fetchState);
            newFetchState.err = action.err;
            retState.ui.fetchState = newFetchState;
        }
        else {
            if (triggerData) {
                if (triggerData.base != null && triggerData.id != null) {
                    var propPath = MakePath(triggerData.base, triggerData.id);
                    if (!discardResult) {
                        retState = setManyStateByPath(retState, propPath, {
                            fetching: false,
                            fetchingErr: action.err,
                        });
                    }
                }
            }
        }
        if (triggerData) {
            if (triggerData.callBack) {
                if (!discardResult) {
                    var callbackret = triggerData.callBack(retState, null, action.err, action.fetchData.useTime);
                    if (callbackret != null) {
                        retState = callbackret;
                    }
                }
            }
            else if (action.key == EFetchKey.FetchPropValue) {
                var ftpProp = triggerData;
                var ftpKey = ftpProp.id + '_' + ftpProp.propName;
                needSetState = {};
                var fetching_arr = gFetchingProp[ftpKey];
                var hited = fetching_arr.find(x => {
                    return ObjIsEqual(x.bundle, action.fetchData.sendData.bundle);
                });
                if (!discardResult) {
                    hited.queues_arr.forEach(x => {
                        needSetState[MakePath(x.base, x.id, 'fetching')] = false;
                        needSetState[MakePath(x.base, x.id, 'fetchingErr')] = action.err;
                    });
                }
                fetching_arr.splice(fetching_arr.indexOf(hited), 1);
                retState = setManyStateByPath(retState, '', needSetState);
            }
        }

        return retState == state ? Object.assign({}, retState) : retState;
    }

    if (triggerData) {
        if (triggerData.base != null && triggerData.id != null) {
            var propPath = MakePath(triggerData.base, triggerData.id, 'fetching');
            retState = setStateByPath(retState, propPath, false);
        }
    }

    if (isModel) {
        retState.ui = Object.assign({}, retState.ui, { fetchState: null });
    }
    var needSetState;
    var tPath;
    switch (action.key) {
        case 'pageloaded':
            if (!gDingDingIniting) {
                setTimeout(() => {
                    store.dispatch({ type: AT_PAGELOADED });
                }, 50);
            }
            return Object.assign({}, retState, { loaded: true });
        case EFetchKey.FetchPropValue:
            {
                var ftpProp = triggerData;
                var ftpKey = ftpProp.id + '_' + ftpProp.propName;
                needSetState = {};
                var fetching_arr = gFetchingProp[ftpKey];
                var hited = fetching_arr.find(x => {
                    return ObjIsEqual(x.bundle, action.fetchData.sendData.bundle);
                });
                needSetState[MakePath(triggerData.base, triggerData.id, triggerData.propName)] = action.json.data;
                hited.queues_arr.forEach(x => {
                    needSetState[MakePath(x.base, x.id, x.propName)] = action.json.data;
                    needSetState[MakePath(x.base, x.id, 'fetching')] = false;
                    needSetState[MakePath(x.base, x.id, 'fetchingErr')] = null;
                });
                fetching_arr.splice(fetching_arr.indexOf(hited), 1);
                return setManyStateByPath(retState, '', needSetState);
            }
        default:
            if (triggerData.callBack) {
                var callbackret = triggerData.callBack(retState, action.json.data, null, action.fetchData.useTime);
                if (callbackret != null) {
                    retState = callbackret;
                }
            }
            break;
    }
    return retState == state ? Object.assign({}, retState) : retState;
}


var baseReducerSetting = {
    AT_FETCHBEGIN: fetchBeginHandler,
    AT_FETCHEND: fetchEndHandler,
    AT_SETSTATEBYPATH: setStateByPathHandler,
    AT_SETMANYSTATEBYPATH: setManyStateByPathHandler,
    AT_SETROOTSTATE: setRootStateHandler,
    AT_CALLFUNCTION: callFunctionHandler,
};

function baseRenderLoadingTip() {
    if (this.props.fetchState == null) {
        return null;
    }
    var fetchState = this.props.fetchState;
    var tipElem = null;
    if (fetchState.err == null) {
        tipElem = (<div className='d-flex align-items-center'>
            <i className='fa fa-spinner fa-pulse fa-fw fa-3x' />
            {fetchState.tip}
        </div>)
    }
    else {
        tipElem = (<React.Fragment>
            <div className='bg-danger text-light d-flex d-flex align-items-center'><i className='fa fa-warning fa-2x' /><h3>错误</h3></div>
            <div className='dropdown-divider' />
            <div className='d-flex align-items-center'>
                {fetchState.err.info}
            </div>
            <button onClick={this.props.clickLoadingErrorBtn} type='button' className='btn btn-danger'>知道了</button>
        </React.Fragment>);
    }
    return (<div className='loadingTipBG'>
        <div className='loadingTip bg-light rounded d-flex flex-column'>
            {tipElem}
        </div>
    </div>);
}

function renderFetcingTipDiv(tipstr = '数据加载中') {
    return (
        <div className='w-100 h-100 flex-grow-1 d-flex align-items-center'>
            <div className='m-auto d-flex align-items-center border rounded'>
                <i className='fa fa-spinner fa-pulse fa-fw fa-2x' />
                <div className='text-nowrap'>{tipstr}</div>
            </div>
        </div>
    );
}


function renderFetcingErrDiv(errInfo) {
    return (
        <div className='w-100 h-100 flex-grow-1 d-flex align-items-center autoScroll_Touch'>
            <div className='m-auto d-flex align-items-center border rounded text-danger flex-shrink-0 mw-100'>
                <i className='fa fa-warning fa-fw fa-2x' />
                <div className='text'>出错了:{errInfo}</div>
            </div>
        </div>
    );
}

function renderInvalidBundleDiv() {
    return (
        <div className='w-100 h-100 flex-grow-1 d-flex align-items-center autoScroll_Touch'>
            <div className='m-auto d-flex align-items-center border rounded flex-shrink-0 mw-100'>
                <i className='fa fa-warning fa-fw fa-2x' />
                <div className='text'>前置条件不足</div>
            </div>
        </div>
    );
}

function getFormatDateString_MD(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return (m < 10 ? '0' : '') + m + (d < 10 ? '-0' : '-') + d;
}

function getFormatDateString(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + (m < 10 ? '-0' : '-') + m + (d < 10 ? '-0' : '-') + d;
}

function getFormatTimeString(date, hadSec = true) {
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m + (hadSec ? (s < 10 ? ':0' : ':') + s : '');
}

function getFormatDateTimeString(date, hadSec = true) {
    var y = date.getFullYear();
    var month = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();

    return y + (month < 10 ? '-0' : '-') + month + (d < 10 ? '-0' : '-') + d + ' ' + (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m + (hadSec ? (s < 10 ? ':0' : ':') + s : '');
}

function getFullFormatDateString(date, hadSec = true) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();

    var hour = date.getHours();
    var mi = date.getMinutes();
    var sec = date.getSeconds();

    return y + (m < 10 ? '-0' : '-') + m + (d < 10 ? '-0' : '-') + d + ' ' + (hour < 10 ? '0' : '') + hour + (mi < 10 ? ':0' : ':') + mi + (hadSec ? (sec < 10 ? ':0' : ':') + sec : '');
}

function simpleFreshFormFun(retState, records_arr, formFullID, directBindFun) {
    var formState = getStateByPath(retState, formFullID);
    var needSetState = {};
    if (records_arr == null || records_arr.length == 0) {
        needSetState.recordIndex = -1;
    }
    else {
        var useIndex = formState.recordIndex == null ? 0 : parseInt(formState.recordIndex);
        if (useIndex >= records_arr.length) {
            useIndex = records_arr.length - 1;
        }
        else if (useIndex <= -1) {
            useIndex = 0;
        }
        needSetState.recordIndex = useIndex;
    }
    if (formState.recordIndex == useIndex) {
        if (directBindFun != null) {
            return directBindFun(retState, useIndex, formState.recordIndex, formFullID);
        }
        return retState;
    }
    return setManyStateByPath(retState, formFullID, needSetState);
}

function simpleFreshFormFun2(retState, records_arr, formFullID, rowChangedFun, visited, delayActs, rowKeyInfo_map) {
    var formState = getStateByPath(retState, formFullID);
    var needSetState = {};
    var useIndex = -1;
    if (records_arr == null || records_arr.length == 0) {
        needSetState.recordIndex = -1;
    }
    else {
        useIndex = formState.recordIndex == null ? 0 : parseInt(formState.recordIndex);
        if (useIndex >= records_arr.length) {
            useIndex = records_arr.length - 1;
        }
        else if (useIndex <= -1) {
            useIndex = 0;
        }
        needSetState.recordIndex = useIndex;
    }
    if (formState.recordIndex == useIndex) {
        if (rowChangedFun != null) {
            return rowChangedFun(retState, useIndex, useIndex, formFullID + '.recordIndex', visited, delayActs, rowKeyInfo_map);
        }
        return retState;
    }
    return setManyStateByPath(retState, formFullID, needSetState);
}

function IsEmptyObject(val) {
    for (var si in val) {
        if (val[si] != null) {
            return false;
        }
    }
    return true;
}

function getQueryObject() {
    var rlt = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        rlt[pair[0]] = pair[1];
    }
    return rlt;
}

function getQueryVariable(variable, defVal) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            if (pair[1].length > 2 && pair[1][0] == '{') {
                return JSON.parse(decodeURI(pair[1]));
            }
            return pair[1];
        }
    }
    return defVal;
}

function FormatStringValue(val, type, precision, dotsplit) {
    if (IsEmptyString(val)) {
        return '';
    }
    var rlt = val;
    switch (type) {
        case 'int':
            if(Math.abs(val) < 0.00001){
                return 0;
            }
            rlt = parseInt(val);
            if (isNaN(rlt)) {
                rlt = '';
            }
            if(dotsplit && rlt > 999){
                var strRlt = rlt.toString();
                if(strRlt.indexOf('e') == -1){
                    rlt = '';
                    for(var i=strRlt.length-3;i>-3;i-=3){
                        rlt = (i < 0 ? strRlt.substr(0, 3+i) : strRlt.substr(i,3)) + (rlt.length == 0 ? '' : ',') + rlt;
                    }
                }
            }
            break;
        case 'boolean':
            rlt = parseBoolean(val) ? true : false;
            break;
        case 'float':
            if(Math.abs(val) < 0.00001){
                return 0;
            }
            precision = precision == null ? 2 : parseInt(precision);
            var divisor = Math.pow(10, precision);
            rlt = Math.round(val * divisor) / divisor;
            if (isNaN(rlt)) {
                rlt = '';
            }
            if(dotsplit && rlt > 999){
                var strRlt = rlt.toString();
                if(strRlt.indexOf('e') == -1){
                    var str_arr = strRlt.split('.');
                    strRlt = str_arr[0];
                    rlt = '';
                    for(var i=strRlt.length-3;i>-3;i-=3){
                        rlt = (i < 0 ? strRlt.substr(0, 3+i) : strRlt.substr(i,3)) + (rlt.length == 0 ? '' : ',') + rlt;
                    }
                    if(str_arr.length > 1){
                        rlt += '.' + str_arr[1];
                    }
                }
            }
            break;
        case 'date':
        case 'datetime':
            theDate = castDate(val)
            if (theDate == null) {
                rlt = '';
            }
            else {
                rlt = getFormatDateString(theDate) + (type == 'datetime' ? ' ' + getFormatTimeString(theDate) : '');
            }
            break;
        case 'dateMD':
            if (typeof val == 'string' && val.length == 5) {
                rlt = val;
            }
            else if (!checkDate(val)) {
                rlt = '';
            }
            else if (val.length > 10) {
                var theDate = new Date(val)
                rlt = getFormatDateString_MD(theDate);
            }
            break;
        case 'time':
            if (val && val.length > 8 && checkDate(val)) {
                var regRlt = gTimeReg.exec(val);
                return regRlt[0];
            }
            else if (!checkTime(val)) {
                rlt = '';
            }
            break;
    }
    return rlt;
}

function plainClone(obj) {
    var rlt = {};
    for (var s in obj) {
        var v = obj[s];
        switch (typeof v) {
            case 'boolean':
            case 'number':
            case 'string':
                rlt[s] = v;
                break;
        }
    }
    return rlt;
}

function ObjIsEqual(objA, objB) {
    if (objA == objB) {
        return true;
    }
    if (objA == null || objB == null) {
        return false;
    }
    var attrs_map = {};
    var s;
    for (s in objA) {
        attrs_map[s] = 1;
    }
    for (s in objB) {
        if (!attrs_map.hasOwnProperty(s)) {
            return false;
        }
    }
    for (s in attrs_map) {
        if (objA[s] != objB[s]) {
            return false;
        }
    }
    return true;
}

function getRowKeyMapFromPath(path) {
    var rowKeyInfo_map = {};
    if (path.indexOf('.row_') != -1) {
        var patchs_arr = path.split('.');
        var prePath = null;
        var newPatchs_arr = [];
        for (var si in patchs_arr) {
            var patch = patchs_arr[si];
            if (prePath != null) {
                if (patch.indexOf('row_') == 0) {
                    rowKeyInfo_map[prePath] = patch.substr(4);
                    continue;
                }
            }
            prePath = patch;
            newPatchs_arr.push(patch);
        }
        rowKeyInfo_map.newPath = newPatchs_arr.join('.');
    }
    else {
        rowKeyInfo_map.newPath = path;
    }
    return rowKeyInfo_map;
}

function getRecordFromRowKey(formPath, rowkey){
    if(rowkey == 'new'){
        return {};
    }
    var mapCache = gDataCache.get(formPath + ".KeyToRcd_map");
    if(mapCache == null){
        return null;
    }
    return mapCache[rowkey];
}

function getParentPathByKey(orginPath, key) {
    var index = orginPath.lastIndexOf(key);
    if (index == -1) {
        return '';
    }
    /*
    var endPos = orginPath.indexOf('.', index + 1);
    if (endPos == -1) {
        endPos = orginPath.length;
    }
    */
    return orginPath.substring(0, index) + key;
}

function getPathRoot(orginPath) {
    var index = orginPath.indexOf('.');
    if (index == -1) {
        return orginPath;
    }
    return orginPath.substring(0, index);
}

function getBelongUserCtlPath(orginPath, fromId, skipfirst) {
    var lastDostPos = fromId ? orginPath.lastIndexOf(fromId) - fromId.length : orginPath.length;
    var index = orginPath.lastIndexOf('.UserControl', lastDostPos);
    if(index > 0 && skipfirst){
        index = orginPath.lastIndexOf('.UserControl', index - 1);
    }
    if (index == -1) {
        return '';
    }
    var endPos = orginPath.indexOf('.', index + 1);
    if (endPos == -1) {
        endPos = orginPath.length;
    }
    
    return orginPath.substring(0, endPos);
}

function getBelongUserCtlProfile(orginPath) {
    var index = orginPath.lastIndexOf('UserControl');
    if (index == -1) {
        return null;
    }
    var endPos = orginPath.indexOf('.', index + 1);
    if (endPos == -1) {
        endPos = orginPath.length;
    }
    var ctlID = orginPath.substring(index, endPos);
    var classID = gUserControlInstIdMap[ctlID];
    return {
        parentPath: orginPath.substring(0, endPos),
        ctlID: ctlID,
        classID: classID,
        statePath: classID + orginPath.substr(endPos),
    };
}

function CombineDotStr() {
    var rlt = '';
    for (var i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null || arguments[i].length == 0)
            continue;
        rlt += (rlt.length == 0 ? '' : '.') + arguments[i];
    }
    return rlt;
}

// getday
const gWeekDayName_arr = ["日", "一", "二", "三", "四", "五", "六"];
function getweekDay(date) {
    if (typeof date === 'string') {
        date = castDate(date);
    }
    return "星期" + gWeekDayName_arr[date.getDay()]
}

//格式化数字加逗号
function addComma(num) {
    var reg = num.toString().indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(\d{3})+$)/g;
    return num.toString().replace(reg, '$1,');
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
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)) {
        return "数据非法";  //判断数据是否大于0
    }

    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
    n += "00";

    var indexpoint = n.indexOf('.');  // 如果是小数，截取小数点前面的位数
    if (indexpoint > 12) {
        return '数据过大';
    }
    if (indexpoint < 0 && n.length > 14) {
        return '数据过大';
    }
    if (indexpoint >= 0) {

        n = n.substring(0, indexpoint) + n.substr(indexpoint + 1, 2);   // 若为小数，截取需要使用的unit单位
    }

    unit = unit.substr(unit.length - n.length);  // 若为整数，截取需要使用的unit单位
    for (var i = 0; i < n.length; i++) {
        str += "零壹贰叁肆伍陆柒捌玖".charAt(n.charAt(i)) + unit.charAt(i);  //遍历转化为大写的数字
    }
    var result = str.replace(/零(千|百|拾|角)/g, "零").
        replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").
        replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").
        replace(/元$/g, "元整"); // 替换掉数字里面的零字符，得到结果
    return result;
}

function Convert_TimeZone(pTime, zoneSrc, zoneDst) {
    var rltDate = null;
    if (typeof pTime === 'string') {
        pTime = castDateFromTimePart(pTime);
        rltDate = pTime;
    }
    else{
        rltDate = new Date(pTime);
    }
    var time = pTime.getTime();
    var offset = 0;
    zoneSrc = parseInt(zoneSrc);
    zoneDst = parseInt(zoneDst);
    offset = -zoneSrc + zoneDst;
    if(offset != 0){
        rltDate.setTime(time + 1000 * 60 * 60 * offset);
    }
    return rltDate;
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

function createDate(year, month, day){
    if(day > 32){
        day = 31;
    }
    month = parseInt(month);
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

function RoundFloat(val, precision){
    var valStr = val.toString();
    var t_arr;
    var intPart;
    if(valStr.indexOf('e') != -1){
        t_arr = valStr.split('e');
        var numStr = t_arr[0];
        var dotPos = numStr.indexOf('.');
        var hadDotPos = true;
        if(dotPos == -1){
            dotPos = numStr.length;
            hadDotPos = false;
        }
        var eNum = parseInt(t_arr[1]);
        var newDotPos = dotPos + eNum;

        if(newDotPos <= 0){
            t_arr[1] = numStr.padStart(numStr.length - newDotPos, '0');
            t_arr[0] = '0';
            t_arr[1] = t_arr[1].replace('.','');
        }
        else{
            if(dotPos == numStr.length){
                numStr = numStr.padEnd(newDotPos, '0');
                return parseFloat(numStr);
            }
            numStr = numStr.padEnd(newDotPos, '0');
            t_arr[0] = numStr.substring(0, newDotPos + 1).replace('.','');
            t_arr[1] = numStr.substring(newDotPos + 1, numStr.length).replace('.','');
        }
    }
    else{
        t_arr = valStr.split('.');
    }
    if(t_arr.length==1 || t_arr[1].length <= precision){
        return val;
    }
    intPart = parseInt(t_arr[0]);
    if(precision < t_arr[1].length && t_arr[1][precision] >= 5){
        if(precision == 0){
            ++intPart;
        }
        else{
            var floatPart_arr = [];
            var addVal = 1;
            for(var i=precision-1;i>=0;--i){
                var val = parseInt(t_arr[1][i]) + addVal;
                if(val > 9){
                    floatPart_arr.unshift(val - 10);
                }
                else{
                    floatPart_arr.unshift(val);
                    addVal = 0;
                }
            }
            
            return parseFloat((intPart + addVal).toString() + '.' + floatPart_arr.join(''));
        }
    }
    return parseFloat(intPart.toString() + '.' + t_arr[1].substr(0,precision));
}

var gDingDingIniting = false;
var gInitDingCallBack = null;

function ActiveDing(){
    if(gInitDingCallBack == null){
        return;
    }
    DebugApp('DingDing Actived');
    gDingDingIniting = true;
    dingdingKit = gParentDingKit;
    isInDingTalk = gParentIsInDingTalk;
    store.dispatch({ type: AT_PAGELOADED });
    gInitDingCallBack();
    gInitDingCallBack = null;
}

function InitDingDing(callBack, mobileAppendApi_arr, pcAppendApi_arr) {
    DebugApp('InitDingDing satrt');
    var tjson = {isMobile:isMobile,dingdingKit:dingdingKit};
    DebugApp(JSON.stringify(tjson));
    tjson = {gPageInFrame:gPageInFrame,gWeakParentFrame:(gWeakParentFrame ? 'true' : 'false'),dingdingKit:dingdingKit,isInDingTalk:isInDingTalk};
    DebugApp(JSON.stringify(tjson));
    if(gParentDingKit == null){
        // detect parent
        if(window.parent){
            DebugApp('Had window parent');
            if(window.parent.dingdingKit){
                DebugApp('Window parent have dingdingKit');
                if(window.parent.FrameLoaded){
                    window.parent.FrameLoaded(window, DebugApp);
                }
                else{
                    DebugApp('no FrameLoaded wait active');
                }
                if(gParentDingKit == null){
                    gInitDingCallBack = callBack;
                    DebugApp('wait parent active');
                    return;
                }
            }
            else{
                DebugApp('Window parent have not dingdingKit');
            }
        }
        else{
            DebugApp('No window parent');
        }
    }
    if (gPageInFrame || gWeakParentFrame) {
        gDingDingIniting = true;
        dingdingKit = gParentDingKit;
        isInDingTalk = gParentIsInDingTalk;
        store.dispatch({ type: AT_PAGELOADED });
        callBack();
        DebugApp('InitDingDing end');
        return;
    }
    if (isMobile) {
        dingdingKit = dd;
        isInDingTalk = dd.env.platform != 'notInDingTalk';
        var jsapiArr = [
            'runtime.info',
            'device.notification.prompt',
            'device.notification.confirm',
            'device.notification.alert',
            'device.notification.toast',
            'biz.navigation.close',
            'biz.ding.post',
            'biz.navigation.setRight',
            'biz.navigation.setTitle',
            'device.audio.startRecord',
            'device.audio.stopRecord',];
        if (mobileAppendApi_arr) {
            jsapiArr = jsapiArr.concat(mobileAppendApi_arr);
        }

        dd.config({
            agentId: "29816043",
            corpId: theCorpId,
            timeStamp: pTimeStamp,
            nonceStr: pNonceStr,
            signature: pSignature,
            jsApiList: jsapiArr
        });
        DebugApp('dd.config:' + dd.env.platform);
    }
    else {
        dingdingKit = DingTalkPC;
        isInDingTalk = dingdingKit.ua.isInDingTalk;
        var jsapiArr = [
            'device.notification.alert',
            'device.notification.confirm',
            'device.notification.toast',
            'biz.navigation.close',
            'runtime.permission.requestAuthCode',
            'biz.ding.post'];
        if (pcAppendApi_arr) {
            jsapiArr = jsapiArr.concat(pcAppendApi_arr);
        }
        DingTalkPC.config({
            agentId: "29816043",
            corpId: theCorpId,
            timeStamp: pTimeStamp,
            nonceStr: pNonceStr,
            signature: pSignature,
            jsApiList: jsapiArr
        });
    }
    tjson = {isMobile:isMobile,dingdingKit:dingdingKit,isInDingTalk:isInDingTalk,isProduction:isProduction};
    DebugApp(JSON.stringify(tjson));
    if (!isProduction || !isInDingTalk) {
        callBack();
        DebugApp('InitDingDing end');
        return;
    }
    gDingDingIniting = true;
    dingdingKit.error(err => {
        alert('出错了:' + JSON.stringify(err));
    });
    DebugApp('wait dingdingKit.ready');
    dingdingKit.ready(() => {
        DebugApp('dingdingKit.ready called');
        store.dispatch({ type: AT_PAGELOADED });
        callBack();
        DebugApp('InitDingDing end');
    });
}

function pickLocation(successAct, failAct) {
    if (failAct == null) {
        failAct = function (err) {
            myApp.alert(JSON.stringify(err), "获取位置失败");
        }
    }

    if (!isMobile) {
        if (failAct != null) {
            failAct('需要在手机端使用');
        }
        return;
    }

    dingdingKit.biz.map.locate({
        onSuccess: successAct,
        onFail: failAct
    });
}

function gGetNowLocation(successAct, failAct) {
    if (!isMobile) {
        failAct();
        return;
    }
    dd.device.geolocation.get({
        targetAccuracy: 100,
        coordinate: 1,
        withReGeocode: false,
        onSuccess: successAct,
        onFail: failAct
    });
}

function DynamicLoadJs(url, callback) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    if (typeof (callback) != "undefined") {
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            }
        } else {
            script.onload = function () {
                callback();
            }
        }
    }
    script.src = url;
    document.body.appendChild(script);
}

var AMapJsLoaded = false;
var gAMapCallBacks_arr = [];

function Regeocoder(lat, lon, callBack) {
    if (!AMapJsLoaded) {
        gAMapCallBacks_arr.push({
            lat: lat,
            lon: lon,
            callBack: callBack,
        });
        if (gAMapCallBacks_arr.length == 1) {
            DynamicLoadJs('http://webapi.amap.com/maps?v=1.4.3&key=1ca423f502c4a4d054c8d0572847a623&plugin=AMap.Geocoder', () => {
                AMapJsLoaded = true;
                gAMapCallBacks_arr.forEach(p => {
                    __regeocoder(p.lat, p.lon, p.callBack);
                });
            });
        }
        return;
    }
    __regeocoder(lat, lon, callBack);
}

function __regeocoder(lat, lon, callBack) {
    var geocoder = new AMap.Geocoder({
        radius: 200,
        extensions: "all"
    });
    lat = Math.round(lat * 1000000) / 1000000;
    lon = Math.round(lon * 1000000) / 1000000;
    geocoder.getAddress([lon, lat], function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            callBack(result);
        }
        else {
            callBack(null);
        }
    });
}