"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Text_0_style = { "maxWidth": "12em" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/ZZMCS';
var thisAppTitle = '赵智淼测试';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = {};

function pageLoadedReducer(state) {
	return gotoPage('M_Page_2', state);
}
function gotoPageReducer(state, action) {
	return gotoPage(action.pageName, state);
}
function gotoPage(pageName, state) {
	var retState = state;
	if (state.nowPage == pageName) {
		return state;
	}
	switch (pageName) {
		case 'M_Page_0':
			{
				retState = active_M_Page_0(retState);
				break;
			}
		case 'M_Page_1':
			{
				retState = active_M_Page_1(retState);
				break;
			}
		case 'M_Page_2':
			{
				retState = active_M_Page_2(retState);
				break;
			}
	}
	return Object.assign({}, retState);
}
function active_M_Page_0(state) {
	var needSetState = {};
	needSetState['M_Page_0.M_Text_0.value'] = M_Text_0_defaultvalue_get(state);
	state = setManyStateByPath(state, '', needSetState);
	state.nowPage = 'M_Page_0';
	setTimeout(function () {}, 50);
	state = bind_M_Form_0(state);
	return state;
}
function button_0_onclik() {
	var 当前日期_1;
	var temp_1;
	var M_Text_0_value = getStateByPath(store.getState(), 'M_Page_0.M_Text_0.value');
	当前日期_1 = new Date(M_Text_0_value);
	temp_1 = 当前日期_1.setDate(当前日期_1.getDate() + -1);
	store.dispatch(makeAction_setStateByPath(getFormatDateString(当前日期_1), 'M_Page_0.M_Text_0.value'));
}
function M_Text_0_defaultvalue_get(state, bundle) {
	var nowDate_1 = new Date();
	return getFormatDateString(nowDate_1);
}
function button_1_onclik() {
	var nowDate_1;
	var temp_1;
	var M_Text_0_value = getStateByPath(store.getState(), 'M_Page_0.M_Text_0.value');
	nowDate_1 = new Date(M_Text_0_value);
	temp_1 = nowDate_1.setDate(nowDate_1.getDate() + 1);
	store.dispatch(makeAction_setStateByPath(getFormatDateString(nowDate_1), 'M_Page_0.M_Text_0.value'));
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var needSetState = {};
	var bundle = {};
	needSetState['invalidbundle'] = false;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}
function pull_M_Form_0(retState) {
	retState = bind_M_Form_0(retState);
	return retState;
}
function active_M_Page_1(state) {
	state.nowPage = 'M_Page_1';
	setTimeout(function () {}, 50);
	return state;
}
function active_M_Page_2(state) {
	var needSetState = {};
	needSetState['M_Page_2.M_Dropdown_0.value'] = M_Dropdown_0_defaultvalue_get(state);
	needSetState['M_Page_2.M_Text_1.value'] = M_Text_1_defaultvalue_get(state);
	needSetState['M_Page_2.M_Text_2.value'] = M_Text_2_defaultvalue_get(state);
	state = setManyStateByPath(state, '', needSetState);
	state.nowPage = 'M_Page_2';
	setTimeout(function () {}, 50);
	return state;
}
function M_Dropdown_0_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_2', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_1() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop('M_Page_2', 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_1_defaultvalue_get(state, bundle) {
	return getFormatDateString(new Date());
}
function M_Text_2_defaultvalue_get(state, bundle) {
	return getFormatTimeString(new Date());
}

var App = function (_React$PureComponent) {
	_inherits(App, _React$PureComponent);

	function App(props) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.renderLoadingTip = baseRenderLoadingTip.bind(_this);
		return _this;
	}

	_createClass(App, [{
		key: "render",
		value: function render() {
			var retElem = null;
			var pageElem;
			switch (this.props.nowPage) {
				case 'M_Page_0':
					{
						pageElem = React.createElement(VisibleCM_Page_0, null);
						break;
					}
				case 'M_Page_1':
					{
						pageElem = React.createElement(VisibleCM_Page_1, null);
						break;
					}
				case 'M_Page_2':
					{
						pageElem = React.createElement(VisibleCM_Page_2, null);
						break;
					}
			}
			retElem = React.createElement(
				"div",
				{ className: "w-100 h-100" },
				React.createElement(FixedContainer, { ref: gFixedContainerRef }),
				this.renderLoadingTip(),
				pageElem
			);
			return retElem;
		}
	}]);

	return App;
}(React.PureComponent);

function App_mapstatetoprops(state, ownprops) {
	var retProps = {};
	retProps.nowPage = state.nowPage;
	retProps.loaded = state.loaded;
	if (!state.loaded) {
		retProps.fetchState = state.ui.fetchState;
	}
	return retProps;
}
function App_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleApp = ReactRedux.connect(App_mapstatetoprops, App_disptchtoprops)(App);

var CM_Page_0 = function (_React$PureComponent2) {
	_inherits(CM_Page_0, _React$PureComponent2);

	function CM_Page_0(props) {
		_classCallCheck(this, CM_Page_0);

		return _possibleConstructorReturn(this, (CM_Page_0.__proto__ || Object.getPrototypeOf(CM_Page_0)).call(this, props));
	}

	_createClass(CM_Page_0, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100" },
				this.renderHead(),
				this.renderContent()
			);
			return retElem;
		}
	}, {
		key: "renderHead",
		value: function renderHead() {
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					null,
					"\u603B\u7ED3\u7BA1\u7406"
				)
			);
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column " },
				React.createElement(
					"div",
					{ className: "flex-grow-0 d-flex flex-shrink-1 erp-control " },
					React.createElement(
						"button",
						{ className: "flex-grow-1 btn btn-dark erp-control ", id: "button_0", onClick: button_0_onclik },
						"\u524D\u4E00\u5929"
					),
					React.createElement(VisibleERPC_Text, { style: M_Text_0_style, id: "M_Text_0", parentPath: "M_Page_0", type: "date" }),
					React.createElement(
						"button",
						{ className: "flex-grow-1 btn btn-dark erp-control ", id: "button_1", onClick: button_1_onclik },
						"\u540E\u4E00\u5929"
					)
				),
				React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_1", parentPath: "M_Page_0" }),
				React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_0" })
			);
			return retElem;
		}
	}]);

	return CM_Page_0;
}(React.PureComponent);

function CM_Page_0_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_0_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_0 = ReactRedux.connect(CM_Page_0_mapstatetoprops, CM_Page_0_disptchtoprops)(CM_Page_0);

var CM_Form_0 = function (_React$PureComponent3) {
	_inherits(CM_Form_0, _React$PureComponent3);

	function CM_Form_0(props) {
		_classCallCheck(this, CM_Form_0);

		var _this3 = _possibleConstructorReturn(this, (CM_Form_0.__proto__ || Object.getPrototypeOf(CM_Form_0)).call(this, props));

		ERPC_PageForm(_this3);
		return _this3;
	}

	_createClass(CM_Form_0, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			if (this.props.invalidbundle) {
				return renderInvalidBundleDiv();
			}
			if (this.props.fetchingErr) {
				return renderFetcingErrDiv(this.props.fetchingErr.info);
			}
			if (!this.props.loaded || this.props.fetching) {
				return renderFetcingTipDiv();
			}
			if (!this.props.canInsert && this.props.nowRecord == null) {
				return React.createElement(
					"div",
					null,
					"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
				);
			}
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
				this.renderNavigater()
			);
			return retElem;
		}
	}]);

	return CM_Form_0;
}(React.PureComponent);

function CM_Form_0_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = true;
	return retProps;
}
function CM_Form_0_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_0 = ReactRedux.connect(CM_Form_0_mapstatetoprops, CM_Form_0_disptchtoprops)(CM_Form_0);

var CM_Page_1 = function (_React$PureComponent4) {
	_inherits(CM_Page_1, _React$PureComponent4);

	function CM_Page_1(props) {
		_classCallCheck(this, CM_Page_1);

		return _possibleConstructorReturn(this, (CM_Page_1.__proto__ || Object.getPrototypeOf(CM_Page_1)).call(this, props));
	}

	_createClass(CM_Page_1, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100" },
				this.renderHead(),
				this.renderContent()
			);
			return retElem;
		}
	}, {
		key: "renderHead",
		value: function renderHead() {
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					null,
					"\u624B\u673A\u9875\u9762_1"
				)
			);
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column " },
				React.createElement(
					"div",
					{ className: "btn-group-vertical flex-grow-0 flex-shrink-0 d-flex erp-control " },
					React.createElement(
						"button",
						{ className: "btn btn-secondary erp-control ", id: "button_2" },
						"\u6B63\u5E38\u8BF7\u5047"
					),
					React.createElement(
						"button",
						{ className: "btn btn-info erp-control ", id: "button_3" },
						"p2"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Page_1;
}(React.PureComponent);

function CM_Page_1_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_1_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_1 = ReactRedux.connect(CM_Page_1_mapstatetoprops, CM_Page_1_disptchtoprops)(CM_Page_1);

var CM_Page_2 = function (_React$PureComponent5) {
	_inherits(CM_Page_2, _React$PureComponent5);

	function CM_Page_2(props) {
		_classCallCheck(this, CM_Page_2);

		return _possibleConstructorReturn(this, (CM_Page_2.__proto__ || Object.getPrototypeOf(CM_Page_2)).call(this, props));
	}

	_createClass(CM_Page_2, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100" },
				this.renderHead(),
				this.renderContent()
			);
			return retElem;
		}
	}, {
		key: "renderHead",
		value: function renderHead() {
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					null,
					"\u8BF7\u5047\u7533\u8BF7"
				)
			);
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column " },
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_0", parentPath: "M_Page_2", label: "\u8BF7\u5047\u4EBA\u5458" },
					React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: "M_Page_2", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u8BF7\u5047\u4EBA\u5458" })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_1", parentPath: "M_Page_2", label: "\u5047\u671F\u79CD\u7C7B" },
					React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: "M_Page_2", pullDataSource: pull_M_Dropdown_1, textAttrName: "\u5458\u5DE5\u5047\u671F\u79CD\u7C7B", valueAttrName: "\u5458\u5DE5\u5047\u671F\u79CD\u7C7B\u4EE3\u7801", label: "\u5047\u671F\u79CD\u7C7B" })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_2", parentPath: "M_Page_2", label: "\u8D77\u59CB\u65E5\u671F" },
					React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_2", type: "date" })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_3", parentPath: "M_Page_2", label: "\u8D77\u59CB\u65F6\u95F4" },
					React.createElement(VisibleERPC_Text, { id: "M_Text_2", parentPath: "M_Page_2", type: "time" })
				)
			);
			return retElem;
		}
	}]);

	return CM_Page_2;
}(React.PureComponent);

function CM_Page_2_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_2_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_2 = ReactRedux.connect(CM_Page_2_mapstatetoprops, CM_Page_2_disptchtoprops)(CM_Page_2);

if (g_envVar.userid != null) {
	ErpControlInit();
	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(VisibleApp, null)
	), document.getElementById('reactRoot'));
} else {
	location.href = '/?goto=' + location.pathname;
}
store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));