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

function updateItemInArrayByIndex(array, index, updateItemCallback) {
    var updatedItems = array.map(function (item,i) {
        if (i !== index) {
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

function fetchJsonPosts(url, postdata) {
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