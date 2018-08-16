"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;
var Grid = AMUITouch.Grid;
var Col = AMUITouch.Col;
var Card = AMUITouch.Card;
var Icon = AMUITouch.Icon;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var pageInitState = {
    pageinited: false,
    pageiniting: true
};

var urlParam = null;
function GetUrlPara() {
    if (urlParam == null) {
        urlParam = {};
        var url = document.location.toString();
        var arrUrl = url.split("?");
        var urlParamStr = arrUrl[1];
        if (urlParamStr != null) {
            urlParamStr.split("&").forEach(function (paramStr) {
                var pairArr = paramStr.split("=");
                if (pairArr.length == 2 && pairArr[0].length > 0 && pairArr[1].length > 0) {
                    urlParam[pairArr[0]] = decodeURIComponent(pairArr[1]);
                }
            });
        }
    }
    return urlParam;
}

function getQueryString(name) {
    return GetUrlPara()[name];
}

var requestpostsHandler = function requestpostsHandler(state, action) {
    switch (action.key) {
        case 'pageiniting':
            setTimeout(function () {
                store.dispatch(uiModelOpen('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: true });
    }
    return state;
};

var receivepostsHandler = function receivepostsHandler(state, action) {
    if (action.posts.err != null) {
        setTimeout(function () {
            store.dispatch(uiModelClose('all'));
            var aftAct = null;
            if (action.key == 'pageiniting') {
                aftAct = function aftAct() {
                    location.reload();
                };
            }
            store.dispatch(uiModelOpen('AlertModel', '通讯异常', action.posts.err.info, aftAct));
        }, 1);
        return state;
    }
    switch (action.key) {
        case 'pageiniting':
            pageInitDataLoaded(action.posts);
            setTimeout(function () {
                store.dispatch(uiModelClose('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: false, pageinited: true });
    }
    return state;
};

var pageReducer = createReducer(pageInitState, {
    REQUEST_POSTS: requestpostsHandler,
    RECEIVE_POSTS: receivepostsHandler
});

var UI_MODEL_OPEN = "UI_MODEL_OPEN";
var UI_MODEL_CLOSE = "UI_MODEL_CLOSE";

var uiModelOpen = makeActionCreator(UI_MODEL_OPEN, 'modelid', 'title', 'content', 'aftAct');
var uiModelClose = makeActionCreator(UI_MODEL_CLOSE, 'modelid');

var uiModelOpenHandler = function uiModelOpenHandler(state, action) {
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: true, title: action.title == null ? '加载中' : action.title, content: action.content, aftAct: action.aftAct });
    var newModelState = updateObject(state.model, _defineProperty({}, action.modelid, newTargetModelState));
    return updateObject(state, { model: newModelState });
};

var uiModelCloseHandler = function uiModelCloseHandler(state, action) {
    var newModelState = null;
    if (action.modelid == 'all') {
        newModelState = updateObject(state.model, {});
        for (var child in newModelState) {
            newModelState[child].isopen = false;
        }
        return updateObject(state, { model: newModelState });
    }
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: false });
    newModelState = updateObject(state.model, _defineProperty({}, action.modelid, newTargetModelState));
    return updateObject(state, { model: newModelState });
};

var uiTipsInitState = {
    model: {
        LoadingModel: {
            isopen: false,
            title: ''
        },
        AlertModel: {
            isopen: false,
            title: ''
        }
    }
};

var uiTipsReducer = createReducer(uiTipsInitState, {
    UI_MODEL_OPEN: uiModelOpenHandler,
    UI_MODEL_CLOSE: uiModelCloseHandler
});

var reducer = Redux.combineReducers({ page: pageReducer, ui: uiTipsReducer });

var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

function formatDate(theDate) {
    return theDate.getFullYear() + '-' + theDate.getMonth() + '-' + theDate.getDate();
}
var pageInitData = null;
function pageInitDataLoaded(postdata) {
    pageInitData = postdata.data;
    if (pageInitData.rcdRow) {
        for (var i in pageInitData.rcdRow) {
            if (i.indexOf('日期') == i.length - 2) {
                pageInitData.rcdRow[i] = formatDate(new Date(pageInitData.rcdRow[i]));
            }
        }
    }
}

var ModalWind = function (_React$PureComponent) {
    _inherits(ModalWind, _React$PureComponent);

    function ModalWind(props) {
        _classCallCheck(this, ModalWind);

        var _this = _possibleConstructorReturn(this, (ModalWind.__proto__ || Object.getPrototypeOf(ModalWind)).call(this, props));

        _this.getModalRole = _this.getModalRole.bind(_this);
        _this.handleAction = _this.handleAction.bind(_this);
        return _this;
    }

    _createClass(ModalWind, [{
        key: "getModalRole",
        value: function getModalRole() {
            return this.props.modalProps.role;
        }
    }, {
        key: "handleAction",
        value: function handleAction(data) {
            if (this.props.modalProps.role == 'alert') {
                if (this.props.aftAct) {
                    this.props.aftAct();
                }
                store.dispatch(uiModelClose(this.props.id));
            }
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                Modal,
                _extends({
                    isOpen: this.props.isModalOpen,
                    onDismiss: this.closeModal,
                    onOpen: this.onOpen,
                    onClosed: this.onClosed,
                    onAction: this.handleAction,
                    title: this.props.title
                }, this.props.modalProps),
                this.getModalRole() !== 'loading' && this.props.content
            );
        }
    }]);

    return ModalWind;
}(React.PureComponent);

var isModalOpenSelector = Reselect.createSelector(function (state, ownProps) {
    return state.ui.model[ownProps.id].isopen;
}, function (op) {
    return op;
});

var ModalWind_mapStateToProps = function ModalWind_mapStateToProps(state, ownProps) {
    return {
        isModalOpen: isModalOpenSelector(state, ownProps),
        modalProps: ownProps.modalProps,
        title: state.ui.model[ownProps.id].title,
        content: state.ui.model[ownProps.id].content,
        aftAct: state.ui.model[ownProps.id].aftAct
    };
};

var ModalWind_mapDispatchToProps = function ModalWind_mapDispatchToProps(dispatch, ownProps) {
    return {
        openModal: function openModal() {
            dispatch(uiModelOpen(ownProps.id));
        },

        closeModal: function closeModal() {
            dispatch(uiModelClose(ownProps.id));
        },

        onOpen: function onOpen() {
            console.log('loading modal open....');
        },

        onClosed: function onClosed() {
            console.log('loading modal closed....');
        }
    };
};

var VisibleModalWind = ReactRedux.connect(ModalWind_mapStateToProps, ModalWind_mapDispatchToProps)(ModalWind);

var Record = function (_React$PureComponent2) {
    _inherits(Record, _React$PureComponent2);

    function Record() {
        _classCallCheck(this, Record);

        return _possibleConstructorReturn(this, (Record.__proto__ || Object.getPrototypeOf(Record)).apply(this, arguments));
    }

    _createClass(Record, [{
        key: "render",
        value: function render() {
            if (this.props.unFound) {
                return React.createElement(
                    Card,
                    null,
                    "\u6307\u5B9A\u7684\u5E94\u8058\u8005\u8D44\u6599\u672A\u627E\u5230!"
                );
            } else {
                return React.createElement(
                    "view",
                    null,
                    React.createElement(NavBar, { title: this.props.title,
                        className: "fixflex",
                        amStyle: "primary" }),
                    React.createElement(
                        Container,
                        { fill: true, scrollable: true },
                        React.createElement(
                            Group,
                            { header: "\u57FA\u672C\u8D44\u6599", noPadded: true },
                            React.createElement(
                                List,
                                null,
                                this.props.recordData.map(function (item) {
                                    return React.createElement(
                                        List.Item,
                                        { key: item.name, title: item.name },
                                        React.createElement(
                                            "div",
                                            { className: "dataItem" },
                                            item.value
                                        )
                                    );
                                })
                            )
                        ),
                        React.createElement(
                            Group,
                            { header: "\u7B54\u9898\u4FE1\u606F", noPadded: true },
                            this.props.quesData.map(function (item) {
                                return React.createElement(
                                    Card,
                                    { title: item.title },
                                    item.answer.length == 0 ? '跳过' : item.answer
                                );
                            })
                        ),
                        React.createElement(
                            Group,
                            { header: "\u4E2A\u4EBA\u7167\u7247", noPadded: true },
                            React.createElement(
                                Container,
                                { style: { flex: '1 1 auto', display: 'flex', flexFlow: 'column nowrap', overflow: 'auto', alignItems: 'center' } },
                                React.createElement("img", { id: "thumbImg", src: '/res/img/interviewee/' + rcdUID + '.jpg', style: { width: '50%', height: 'auto' } })
                            )
                        )
                    )
                );
            }
        }
    }]);

    return Record;
}(React.PureComponent);

function getRecordInfoArr() {
    if (pageInitData == null || pageInitData.rcdRow == null) {
        return [];
    }
    var rlt = [];
    var rcdData = pageInitData.rcdRow;
    for (var i in rcdData) {
        rlt.push({ name: i, value: rcdData[i] });
    }
    return rlt;
}

function geQuesDataArr() {
    if (pageInitData == null || pageInitData.ques == null) {
        return [];
    }
    return pageInitData.ques;
}

function getRecordTitle() {
    if (pageInitData == null || pageInitData.rcdRow == null) {
        return '';
    }

    return pageInitData.rcdRow.人员姓名 + '应聘:' + pageInitData.rcdRow.应聘岗位;
}

var Record_mapStateToProps = function Record_mapStateToProps(state, ownProps) {
    return {
        recordData: getRecordInfoArr(),
        quesData: geQuesDataArr(),
        title: getRecordTitle(),
        unFound: pageInitData != null && pageInitData.rcdRow == null
    };
};

var VisibleRecord = ReactRedux.connect(Record_mapStateToProps)(Record);

var ThisPage = function (_React$Component) {
    _inherits(ThisPage, _React$Component);

    function ThisPage() {
        _classCallCheck(this, ThisPage);

        return _possibleConstructorReturn(this, (ThisPage.__proto__ || Object.getPrototypeOf(ThisPage)).apply(this, arguments));
    }

    _createClass(ThisPage, [{
        key: "render",
        value: function render() {
            return React.createElement(
                Container,
                _extends({}, this.props, { fill: true }),
                React.createElement(VisibleModalWind, { title: "Loading Modal", id: "LoadingModel",
                    modalProps: {
                        role: 'loading'
                    } }),
                React.createElement(VisibleModalWind, {
                    title: "Alert Modal",
                    id: "AlertModel",
                    modalProps: {
                        role: 'alert'
                    }
                }),
                React.createElement(VisibleRecord, null)
            );
        }
    }]);

    return ThisPage;
}(React.Component);

ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(ThisPage, null)
), document.getElementById('root'));

var rcdUID = getQueryString('rcdUID');
if (rcdUID == null || rcdUID.length != 36) {
    store.dispatch(uiModelOpen('AlertModel', '错误', '没有提供目标参数'));
} else {
    store.dispatch(fetchJsonPosts('recordinfo_process', { action: 'pageinit', rcdUID: getQueryString('rcdUID') }, 'pageiniting'));
}