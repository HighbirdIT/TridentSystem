'use strict';

var PAGE_LOADED = 'PAGE_LOADED';

function makeActionCreator(type) {
    for (var _len = arguments.length, argNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        argNames[_key - 1] = arguments[_key];
    }

    return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        var action = { type: type };
        argNames.forEach(function (arg, index) {
            action[argNames[index]] = args[index];
        });
        return action;
    };
}

var CLICK_ADD = 'CLICK_ADD';
var clickItem = makeActionCreator(CLICK_ADD, 'id');

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

function createReducer(initialState, handlers) {
    return function reducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];

        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        } else {
            return state;
        }
    };
}

// post functions
var REQUEST_POSTS = 'REQUEST_POSTS';
var RECEIVE_POSTS = 'RECEIVE_POSTS';

function requestPosts(key, tip, postData) {
    return {
        type: REQUEST_POSTS,
        tip: tip,
        key: key,
        postData: postData
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

function fetchJsonPost(url, postdata) {
    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var tip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '加载中';
    var timeout = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 15;

    timeout = Math.min(Math.max(30, timeout), 120) * 1000;
    return function (dispatch) {
        dispatch(requestPosts(key, tip, postdata));
        var timeoutHandler = setTimeout(function () {
            dispatch(receivePosts(key, { err: { info: '啊哦，服务器没响应了', postdata: postdata } }));
        }, timeout);
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(postdata),
            headers: {
                "Content-Type": "application/json"
            }
            //credentials: "include",
        }).then(function (response) {
            clearTimeout(timeoutHandler);
            if (response.ok) {
                return response.json();
            } else {
                var error = new Error(response.statusText);
                dispatch(receivePosts(key, { err: { info: response.statusText } }));
                return null;
            }
        },
        // 不要使用 catch，因为会捕获
        // 在 dispatch 和渲染中出现的任何错误，
        // 导致 'Unexpected batch number' 错误。
        // https://github.com/facebook/react/issues/6895
        function (error) {
            return console.log('An error occurred.', error);
        }).then(function (json) {
            if (json != null) {
                dispatch(receivePosts(key, json, postdata));
            }
        });
    };
}

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}

function checkDate(date) {
    var dateVal = new Date(Date.parse(date));
    return !isNaN(dateVal.getDate());
}

// commonreducer
var logger = function logger(store) {
    return function (next) {
        return function (action) {
            console.log('dispatching', action);
            //action.meta = {delay : 1000 * 2};
            var result = next(action);
            console.log('next state', store.getState());
            return result;
        };
    };
};

var crashReporter = function crashReporter(store) {
    return function (next) {
        return function (action) {
            //console.log('crashReporter start');
            var rlt = null;
            try {
                rlt = next(action);
            } catch (err) {
                console.error('Caught an exception!', err);
                Raven.captureException(err, {
                    extra: {
                        action: action,
                        state: store.getState()
                    }
                });
                throw err;
            }
            //console.log('crashReporter end');
            return rlt;
        };
    };
};

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

function fetchJsonPost(url, postdata, callBack, key = '', timeout = 2) {
	fetchJson(false, url, postdata, callBack, key, timeout);
}

function fetchJsonGet(url, params, callBack, key = '', timeout = 2) {
	fetchJson(true, url, params, callBack, key, timeout);

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
    return function (dispatch) {
        dispatch(requestPosts(key, tip, params));
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
    };
}

function getValFromCookies(identity, defaultVal) {
    var a = Cookies.get(identity);
    return a == null ? defaultVal : a;
}

function getNumberFromCookies(identity, defaultVal) {
    return parseFloat(getValFromCookies(identity, defaultVal));
}