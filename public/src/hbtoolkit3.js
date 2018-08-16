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

const CLICK_ADD = 'CLICK_ADD';
const clickItem = makeActionCreator(CLICK_ADD, 'id');

function updateObject(oldObject, newValues) {
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
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';

function requestPosts(key, tip,postData) {
    return {
        type: REQUEST_POSTS,
        tip: tip,
        key: key,
        postData:postData,
    };
}

function receivePosts(key, json,postData) {
    return {
        type: RECEIVE_POSTS,
        key: key,
        posts: json,
        receivedAt: Date.now(),
        postData:postData
    };
}

function fetchJsonPosts(url, postdata, key = '', tip = '加载中', timeout = 15) {
    timeout = Math.min(Math.max(30,timeout),120) * 1000;
    return function (dispatch) {
        dispatch(requestPosts(key, tip,postdata));
        var timeoutHandler = setTimeout(() => {
            dispatch(receivePosts(key, { err: {info:'啊哦，服务器没响应了',postdata:postdata} }));
        }, timeout);
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(postdata),
            headers: {
                "Content-Type": "application/json"
            },
            //credentials: "include",
        })
            .then(
                response => {
                    clearTimeout(timeoutHandler);
                    if (response.ok) {
                        return response.json();
                    }
                    else {
                        var error = new Error(response.statusText)
                        dispatch(receivePosts(key, { err: {info:response.statusText} }));
                        return null;
                    }
                },
                // 不要使用 catch，因为会捕获
                // 在 dispatch 和渲染中出现的任何错误，
                // 导致 'Unexpected batch number' 错误。
                // https://github.com/facebook/react/issues/6895
                error => console.log('An error occurred.', error)
            )
            .then(json => {
                if (json != null) {
                    dispatch(receivePosts(key, json,postdata));
                }
            }
            )
    }
}

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}

function checkDate(date){
    var dateVal = new Date(Date.parse(date));
    return !isNaN(dateVal.getDate());
}

// commonreducer
const logger = store => next => action => {
    console.log('dispatching', action);
    //action.meta = {delay : 1000 * 2};
    let result = next(action);
    console.log('next state', store.getState());
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