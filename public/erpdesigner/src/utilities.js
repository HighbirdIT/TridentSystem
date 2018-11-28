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

function fetchJsonPosts(url, postdata, callBack, key = '', timeout = 2) {
	timeout = Math.min(Math.max(30, timeout), 120) * 1000;
	var thisFetch = {};
	thisFetch.callBack = callBack;
	var timeoutHandler = setTimeout(() => {
		if (thisFetch.callBack) {
			thisFetch.callBack(fetchResult(key, false, { err: { info: '啊哦，服务器没响应了' } }, postdata));
		}
	}, timeout);

	return fetch(url, {
		method: "POST",
		body: JSON.stringify(postdata),
		headers: {
			"Content-Type": "application/json"
		},
		//credentials: "include",
	}).then(
		response => {
			clearTimeout(timeoutHandler);
			if (response.ok) {
				return response.json();
			}
			else {
				if (thisFetch.callBack) {
					thisFetch.callBack(fetchResult(key, false, { err: { info: response.statusText } }, postdata));
				}
				return null;
			}
		},
		error => console.log('An error occurred.', error)
	).then(json => {
		if (json != null) {
			if (thisFetch.callBack) {
				thisFetch.callBack(fetchResult(key, true, json, postdata));
			}
		}
	});
}

function IsEmptyString(val){
	return val == null || val == '';
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