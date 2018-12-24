'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function autoBind(self, options) {
	options = Object.assign({}, options);
	var filter = function filter(key) {
		var match = function match(pattern) {
			return typeof pattern === 'string' ? key === pattern : pattern.test(key);
		};
		if (options.include) {
			return options.include.some(match);
		}
		if (options.exclude) {
			return !options.exclude.some(match);
		}
		return true;
	};

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Object.getOwnPropertyNames(self.constructor.prototype)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var key = _step.value;

			var val = self[key];

			if (key !== 'constructor' && typeof val === 'function' && filter(key)) {
				self[key] = val.bind(self);
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return self;
}

function assginObjByProperties(dstObj, srcObj, pros_arr) {
	pros_arr.forEach(function (pName) {
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
	if (upserach == null) upserach = true;
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
	return str == true || str == 'true' || str == '1';
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
	props_arr.forEach(function (prop) {
		if (obj && obj[prop.name] != null) rlt[prop.name] = obj[prop.name];else {
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

function fetchResult(key, sucess, json, postdata) {
	return {
		success: sucess,
		key: key,
		json: json,
		receivedAt: Date.now(),
		postData: postdata
	};
}

function fetchJson(useGet, url, params, callBack) {
	var key = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
	var timeout = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 2;

	timeout = Math.min(Math.max(30, timeout), 120) * 1000;
	var thisFetch = {};
	thisFetch.callBack = callBack;
	var timeoutHandler = setTimeout(function () {
		if (thisFetch.callBack) {
			thisFetch.callBack(fetchResult(key, false, { err: { info: '啊哦，服务器没响应了' } }, params));
		}
	}, timeout);

	var fetchParam = {
		method: useGet ? "GET" : "POST",
		headers: {
			"Content-Type": "application/json"
		},
		credentials: "include"
	};
	if (useGet) {
		if (params != null) {
			var str = '';
			for (var si in params) {
				str += si + '=' + params[si];
			}
			if (str.length > 0) {
				url += '?' + str;
			}
		}
	} else {
		fetchParam.body = JSON.stringify(params);
	}

	//console.log(url);

	return fetch(url, fetchParam).then(function (response) {
		clearTimeout(timeoutHandler);
		if (response.ok) {
			return response.json();
		} else {
			if (thisFetch.callBack) {
				thisFetch.callBack(fetchResult(key, false, { err: { info: response.statusText } }, params));
			}
			return null;
		}
	}, function (error) {
		return console.log('An error occurred.', error);
	}).then(function (json) {
		if (json != null) {
			if (thisFetch.callBack) {
				thisFetch.callBack(fetchResult(key, true, json, params));
			}
		}
	});
}

function fetchJsonPost(url, postdata, callBack) {
	var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
	var timeout = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;

	fetchJson(false, url, postdata, callBack, key, timeout);
}

function fetchJsonGet(url, params, callBack) {
	var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
	var timeout = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;

	fetchJson(true, url, params, callBack, key, timeout);
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

function EV_BanEvent(et) {
	var nowVal = this.suspressEvents[et];
	this.suspressEvents[et] = nowVal == null ? 1 : nowVal + 1;
}

function EV_AllowEvent(et) {
	var nowVal = this.suspressEvents[et];
	if (nowVal > 0) {
		this.suspressEvents[et] = nowVal - 1;
	} else {
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
	} else if (delay > 500) {
		console.warn('长达' + delay + '毫秒的延迟fire' + et);
	}
	var self = this;
	if (delay > 0) {
		setTimeout(function () {
			self.emit(et, arg == null ? self : arg);
		}, delay);
	} else {
		self.emit(et, arg == null ? self : arg);
	}
}

function EnhanceEventEmiter(target) {
	target.suspressEvents = {};
	target.fireEvent = EV_FireEvent.bind(target);
	target.banEvent = EV_BanEvent.bind(target);
	target.allowEvent = EV_AllowEvent.bind(target);
}

function singleQuotesStr(val) {
	return "'" + val + "'";
}

function doubleQuotesStr(val) {
	return '"' + val + '"';
}

function bracketStr(val) {
	return '(' + val + ')';
}

function clampStr(val, char) {
	return char + val + char;
}

function JsObjectToString(obj) {
	var objtype = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	if (objtype === 'string') {
		return obj;
	}
	if (objtype === 'number') {
		return obj;
	} else if (objtype != 'object') {
		console.err('what is ' + objtype);
	}
	var rltStr = '{';
	if (obj.length != null && typeof obj.length === 'function') {
		rltStr = '[';
		obj.forEach(function (e, i) {
			rltStr += (i == 0 ? '' : ',') + JsObjectToString(e);
		});
		rltStr += ']';
	} else {
		for (var si in obj) {
			rltStr += si + ':' + JsObjectToString(obj[si]) + ',';
		}
		rltStr += '}';
	}

	return rltStr;
}