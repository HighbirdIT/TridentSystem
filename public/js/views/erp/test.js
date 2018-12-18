'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var isDebug = false;
var fetchTracer = {};
var thisAppTitle = '功能测试页面';

var appInitState = {
    loaded: false,
    ui: {},
    page1: {}
};

var appReducer = createReducer(appInitState, {
    AT_FETCHBEGIN: fetchBeginHandler,
    AT_FETCHEND: fetchEndHandler,
    AT_SETSTATEBYPATH: setStateByPathHandler,
    AT_SETMANYSTATEBYPATH: setManyStateByPathHandler
});

function fetchBeginHandler(state, action) {
    //console.log('fetchBeginHandler');
    var retState = state;
    var triggerData = action.fetchData.triggerData;
    var fetchIdentify = null;

    var isModel = true;
    if (triggerData) {
        isModel = triggerData.isModel != false;
        if (triggerData.base != null && triggerData.id != null && triggerData.propName != null) {
            fetchIdentify = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
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
            var propPath = triggerData.base + '.' + triggerData.id;
            retState = setManyStateByPath(retState, propPath, {
                fetching: true,
                fetchingpropname: triggerData.propName
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
            fetchIdentify = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
        }
    }
    if (fetchIdentify) {
        if (fetchTracer[fetchIdentify] != action.fetchData) {
            console.warn('丢弃了一个fetchResult');
            return state;
        }
    }

    if (action.err != null) {
        console.warn(action.err);
        if (triggerData) {
            var propPath = triggerData.base + '.' + triggerData.id + '.fetching';
            retState = setStateByPath(retState, propPath, false);
        }

        if (isModel) {
            var newFetchState = Object.assign({}, retState.ui.fetchState);
            newFetchState.err = action.err;
            retState.ui.fetchState = newFetchState;
        }
        return retState == state ? Object.assign({}, retState) : retState;
    }

    if (triggerData) {
        if (triggerData.base != null && triggerData.id != null) {
            var propPath = triggerData.base + '.' + triggerData.id + '.fetching';
            retState = setStateByPath(retState, propPath, false);
        }
    }

    if (isModel) {
        retState.ui = Object.assign({}, retState.ui, { fetchState: null });
    }

    switch (action.key) {
        case 'pageloaded':
            return Object.assign({}, retState, { loaded: true });
        case 'fetchpropvalue':
            {
                var propPath = triggerData.base + '.' + triggerData.id + '.' + triggerData.propName;
                return setStateByPath(retState, propPath, action.json.data);
            }
    }
    return retState == state ? Object.assign({}, retState) : retState;
}

function setStateByPathHandler(state, action) {
    return setStateByPath(state, action.path, action.value);
}

function setManyStateByPathHandler(state, action) {
    return setManyStateByPath(state, action.path, action.value);
}

function controlStateChanged(state, path, newValue) {
    var visited = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (visited[path] != null) {
        console.err('controlStateChanged回路访问:' + path);
    }
    var retState = state;
    switch (path) {
        case 'page1.testControl01.text':
            setTimeout(function () {
                store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonCode', name: newValue }, {
                    base: 'page1',
                    id: 'text01',
                    propName: 'text',
                    isModel: false
                }, 'fetchpropvalue'));
            }, 20);
            break;
        case 'page1.text01.text':
            setTimeout(function () {
                store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonIdentify', id: newValue }, {
                    base: 'page1',
                    id: 'text02',
                    propName: 'text',
                    isModel: false
                }, 'fetchpropvalue'));
            }, 20);
            break;
    }
    return retState;
}

var reducer = Redux.combineReducers({ app: appReducer });
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var TestControl = function (_React$PureComponent) {
    _inherits(TestControl, _React$PureComponent);

    function TestControl(props) {
        _classCallCheck(this, TestControl);

        return _possibleConstructorReturn(this, (TestControl.__proto__ || Object.getPrototypeOf(TestControl)).call(this));
    }

    _createClass(TestControl, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                { className: 'list-group flex-grow-1 flex-shrink-1 autoScroll' },
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-dark flex-shrink-0', onClick: this.props.clickFresh },
                    '\u5237\u65B0'
                ),
                this.props.data.map(function (item) {
                    return React.createElement(
                        'div',
                        { key: item[_this2.props.textName], onClick: _this2.props.onClickItem, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (item[_this2.props.textName] == _this2.props.selectedValue ? 'active' : '') },
                        item[_this2.props.textName]
                    );
                })
            );
        }
    }]);

    return TestControl;
}(React.PureComponent);

var selectTestControlData = function selectTestControlData(state, ownProp) {
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.ctrlID, {});
    return ctlState.data == null ? [] : ctlState.data;
};

var selectTestControlSelectedValue = function selectTestControlSelectedValue(state, ownProp) {
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.ctrlID, {});
    return ctlState.selectedValue;
};

var TestControl_dataSelector = Reselect.createSelector(selectTestControlData, function (b) {
    return b;
});

function TestControl_mapstatetoprops(state, ownprops) {
    return {
        data: TestControl_dataSelector(state, ownprops),
        selectedValue: selectTestControlSelectedValue(state, ownprops)
    };
}

function TestControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {
        clickFresh: function clickFresh(ev) {
            store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getData', ctrlId: 't_0' }, {
                base: 'page1',
                id: 'testControl01',
                propName: 'data'
            }, 'fetchpropvalue'));
        },
        onClickItem: function onClickItem(ev) {
            var text = ev.target.innerText;
            store.dispatch(makeAction_setStateByPath(text, ctrlBasePath + '.selectedValue'));
        }
    };
}

var VisibleTestControl = ReactRedux.connect(TestControl_mapstatetoprops, TestControl_dispatchtorprops)(TestControl);

var TextControl = function (_React$PureComponent2) {
    _inherits(TextControl, _React$PureComponent2);

    function TextControl(props) {
        _classCallCheck(this, TextControl);

        return _possibleConstructorReturn(this, (TextControl.__proto__ || Object.getPrototypeOf(TextControl)).call(this));
    }

    _createClass(TextControl, [{
        key: 'renderContent',
        value: function renderContent() {
            if (this.props.fetching) {
                return React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw' });
            }
            return this.props.text;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-grow-1 flex-shrink-1' },
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0' },
                    this.props.label
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    this.renderContent()
                )
            );
        }
    }]);

    return TextControl;
}(React.PureComponent);

function TextControl_mapstatetoprops(state, ownprops) {
    var ctlState = getStateByPath(state, 'app.' + ownprops.parentPath + '.' + ownprops.ctrlID, {});
    return {
        text: ctlState.text,
        fetching: ctlState.fetching
    };
}

function TextControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.ctrlID;
    return {};
}

var VisibleTextControl = ReactRedux.connect(TextControl_mapstatetoprops, TextControl_dispatchtorprops)(TextControl);

function pullDL01DataSource() {
    store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'getPersonList' }, {
        base: 'page1',
        id: 'testControl01',
        propName: 'options_arr',
        isModel: true
    }, 'fetchpropvalue'));
}

var App = function (_React$PureComponent3) {
    _inherits(App, _React$PureComponent3);

    function App(props) {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));
    }

    _createClass(App, [{
        key: 'renderLoadingTip',
        value: function renderLoadingTip() {
            if (this.props.fetchState == null) {
                return null;
            }
            var fetchState = this.props.fetchState;
            var tipElem = null;
            if (fetchState.err == null) {
                tipElem = React.createElement(
                    'div',
                    { className: 'd-flex align-items-center' },
                    React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-fw fa-3x' }),
                    fetchState.tip
                );
            } else {
                tipElem = React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        'div',
                        { className: 'bg-danger text-light d-flex d-flex align-items-center' },
                        React.createElement('i', { className: 'fa fa-warning fa-2x' }),
                        React.createElement(
                            'h3',
                            null,
                            '\u9519\u8BEF'
                        )
                    ),
                    React.createElement('div', { className: 'dropdown-divider' }),
                    React.createElement(
                        'div',
                        { className: 'd-flex align-items-center' },
                        fetchState.err.info
                    ),
                    React.createElement(
                        'button',
                        { onClick: this.props.clickLoadingErrorBtn, type: 'button', className: 'btn btn-danger' },
                        '\u77E5\u9053\u4E86'
                    )
                );
            }
            return React.createElement(
                'div',
                { className: 'loadingTipBG' },
                React.createElement(
                    'div',
                    { className: 'loadingTip bg-light rounded d-flex flex-column' },
                    tipElem
                )
            );
        }
    }, {
        key: 'renderContent',
        value: function renderContent() {
            if (!this.props.loaded) {
                return null;
            }
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(VisibleERPC_DropDownControl, { pullDataSource: pullDL01DataSource, ctrlID: 'testControl01', label: '\u5458\u5DE5\u59D3\u540D', parentPath: 'page1', textAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D', valueAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801' }),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-shrink-0' },
                    React.createElement(VisibleTextControl, { label: '\u4EE3\u7801', ctrlID: 'text01', parentPath: 'page1' }),
                    React.createElement(VisibleTextControl, { label: '\u8EAB\u4EFD\u8BC1', ctrlID: 'text02', parentPath: 'page1' })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
                this.renderLoadingTip(),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap' },
                    React.createElement(
                        'h3',
                        null,
                        thisAppTitle
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 hidenOverflow' },
                    this.renderContent()
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light' },
                    React.createElement(
                        'h3',
                        null,
                        '\u9875\u811A'
                    )
                )
            );
        }
    }]);

    return App;
}(React.PureComponent);

function App_mapstatetoprops(state) {
    return {
        loaded: state.app.loaded,
        fetchState: state.app.ui.fetchState
    };
}

function App_distpatchtoprops(dispatch, ownprops) {
    return {
        clickLoadingErrorBtn: function clickLoadingErrorBtn(ev) {
            dispatch(makeAction_setStateByPath(null, 'ui.fetchState'));
        }
    };
}

var VisiblaeApp = ReactRedux.connect(App_mapstatetoprops, App_distpatchtoprops)(App);

ErpControlInit();

ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(VisiblaeApp, null)
), document.getElementById('reactRoot'));

store.dispatch(fetchJsonPost('/erppage/server/test', { action: 'pageloaded' }, null, 'pageloaded', '页面加载中'));