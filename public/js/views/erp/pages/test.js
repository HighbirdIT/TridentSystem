'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var ReactRedux = window.ReactRedux;
/*
alert(Redux.ReactRedux);
try{
    var info = ReactRedux.Provider;
    alert(info);
}
catch(eo){
    alert(eo);
}
*/
var Provider = ReactRedux.Provider;

var isDebug = false;
var thisAppTitle = '功能测试页面';
var appServerUrl = '/erppage/server/test';

var appInitState = {
    loaded: false,
    ui: {},
    page1: {}
};

var appReducerSetting = { AT_FETCHBEGIN: fetchBeginHandler, AT_FETCHEND: fetchEndHandler };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));

//let reducer = Redux.combineReducers({ app: appReducer });
var store = Redux.createStore(appReducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var appStateChangedAct_map = {
    'page1.testControl01.text': function page1TestControl01Text(state, path, newValue, visited) {
        setTimeout(function () {
            store.dispatch(fetchJsonPost(appServerUrl, { action: 'getPersonCode', name: newValue }, makeFTD_Prop('page1', 'text01', 'text', false), EFetchKey.FetchPropValue));
        }, 20);
    },
    'page1.text01.text': function page1Text01Text(state, path, newValue, visited) {
        setTimeout(function () {
            store.dispatch(fetchJsonPost(appServerUrl, { action: 'getPersonIdentify', id: newValue }, makeFTD_Prop('page1', 'text02', 'text', false), EFetchKey.FetchPropValue));
        }, 20);
    },
    'page1.text03.value': function page1Text03Value(state, path, newValue, visited) {
        return setStateByPath(state, MakePath('page1.text04.value'), '没想到' + newValue + '哈哈', visited);
    }
};

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
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.id, {});
    return ctlState.data == null ? [] : ctlState.data;
};

var selectTestControlSelectedValue = function selectTestControlSelectedValue(state, ownProp) {
    var ctlState = getStateByPath(state, 'app.' + ownProp.parentPath + '.' + ownProp.id, {});
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
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.id;
    return {
        clickFresh: function clickFresh(ev) {
            store.dispatch(fetchJsonPost(appServerUrl, { action: 'getData', ctrlId: 't_0' }, makeFTD_Prop('page1', 'testControl01', 'data'), EFetchKey.FetchPropValue));
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
    var ctlState = getStateByPath(state, 'app.' + ownprops.parentPath + '.' + ownprops.id, {});
    return {
        text: ctlState.text,
        fetching: ctlState.fetching
    };
}

function TextControl_dispatchtorprops(dispatch, ownprops) {
    var ctrlBasePath = ownprops.parentPath + '.' + ownprops.id;
    return {};
}

var VisibleTextControl = ReactRedux.connect(TextControl_mapstatetoprops, TextControl_dispatchtorprops)(TextControl);

function pullDL01DataSource() {
    store.dispatch(fetchJsonPost(appServerUrl, { action: 'getPersonList' }, makeFTD_Prop('page1', 'testControl01', 'options_arr', true), EFetchKey.FetchPropValue));
}

function pullControl01DataSource() {
    store.dispatch(fetchJsonPost(appServerUrl, { action: 'getControl01_ds' }, makeFTD_Prop('page1', 'control01', 'options_arr', false), EFetchKey.FetchPropValue));
}

function pullControl02DataSource() {
    store.dispatch(fetchJsonPost(appServerUrl, { action: 'getControl02_ds' }, makeFTD_Prop('page1', 'control02', 'options_arr', false), EFetchKey.FetchPropValue));
}

var App = function (_React$PureComponent3) {
    _inherits(App, _React$PureComponent3);

    function App(props) {
        _classCallCheck(this, App);

        var _this4 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

        _this4.renderLoadingTip = baseRenderLoadingTip.bind(_this4);
        return _this4;
    }

    _createClass(App, [{
        key: 'renderContent',
        value: function renderContent() {
            if (!this.props.loaded) {
                return null;
            }

            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    VisibleERPC_LabeledControl,
                    { id: 'test01_label', parentPath: 'page1', label: '\u6240\u5C5E\u90E8\u95E8' },
                    React.createElement(VisibleERPC_DropDown, { pullDataSource: pullControl01DataSource, label: '\u9009\u62E9\u5458\u5DE5\u59D3\u540D', id: 'control01', parentPath: 'page1', textAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D', valueAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801', groupAttr: '\u5458\u5DE5\u5728\u804C\u72B6\u6001,\u5458\u5DE5\u5DE5\u65F6\u72B6\u6001,\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0', recentCookieKey: 'recent_user' })
                )
            );
        }
    }, {
        key: 'clickTest',
        value: function clickTest() {
            alert('test');
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
                React.createElement(FixedContainer, { ref: gFixedContainerRef }),
                this.renderLoadingTip(),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
                    React.createElement(
                        'h3',
                        null,
                        thisAppTitle
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 autoScroll_Touch' },
                    React.createElement(
                        'form',
                        { className: 'needs-validation' },
                        this.renderContent()
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter' },
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
        loaded: state.loaded,
        fetchState: state.ui.fetchState
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