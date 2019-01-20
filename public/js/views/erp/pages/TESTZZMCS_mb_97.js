'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.recordIndex': bind_M_Form_0.bind(window), 'M_Page_0.M_Form_1.M_LC_4.label': M_LC_4_label_changed.bind(window) };

function pageLoadedReducer(state) {
	return gotoPage('M_Page_0', state);
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
	}
	return Object.assign({}, retState);
}
function active_M_Page_0(state) {
	state.nowPage = 'M_Page_0';
	setTimeout(function () {
		pull_M_Form_0(state);
	}, 50);
	state = bind_M_Form_1(state);
	return state;
}
function fresh_M_Form_0(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_0.M_Form_0');
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1) {} else {
		nowRecord = records_arr[useIndex];
		needSetState['M_Label_1.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_4.text'] = nowRecord['身份证件号码'];
		needSetState['M_Label_2.text'] = nowRecord['身份证件地址'];
		needSetState['M_Text_2.value'] = nowRecord['出生年月日期'];
	}
	bundle = { M_Form_0_nowrecord: nowRecord };
	if (nowRecord) {
		needSetState['M_LC_3.label'] = M_LC_3_textfield_get(retState, bundle);
	} else {}
	needSetState['nowRecord'] = nowRecord;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}
function pull_M_Form_0(retState) {
	store.dispatch(fetchJsonPost(appServerUrl, { action: 'pulldata_M_Form_0' }, makeFTD_Prop('M_Page_0', 'M_Form_0', 'records_arr', false), EFetchKey.FetchPropValue));
	return retState;
}
function M_LC_3_textfield_get(state, bundle) {
	var M_Form_0_nowrecord = bundle != null && bundle.M_Form_0_nowrecord != null ? bundle.M_Form_0_nowrecord : getStateByPath(state, 'M_Page_0.M_Form_0.nowRecord');
	return M_Form_0_nowrecord['员工登记姓名'] + '我不信你的生日是' + M_Form_0_nowrecord['出生年月日期'];
}
function fresh_M_Form_1(retState, records_arr) {
	bind_M_Form_1(retState);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_1', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Text_0.value'] = 'A';
	needSetState['M_Text_1.value'] = 'B';
	return setManyStateByPath(retState, 'M_Page_0.M_Form_1', needSetState);
}
function pull_M_Form_1(retState) {
	retState = bind_M_Form_1(retState);
	return retState;
}
function M_LC_5_textfield_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_0.M_Form_1');
	var M_LC_4_textfield = bundle != null && bundle['M_LC_4_textfield'] != null ? bundle['M_LC_4_textfield'] : getStateByPath(M_Form_1_state, 'M_Page_0.M_Form_1.M_LC_4.textfield');
	return M_LC_4_textfield + '呵呵';
}
function M_LC_4_label_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_0.M_Form_1.M_LC_5.label'] = M_LC_5_textfield_get(state);
	return setManyStateByPath(needSetState, '', needSetState);
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
		key: 'render',
		value: function render() {
			var retElem = null;
			var pageElem;
			switch (this.props.nowPage) {
				case 'M_Page_0':
					{
						pageElem = React.createElement(VisibleCM_Page_0, null);
						break;
					}
			}
			retElem = React.createElement(
				'div',
				{ className: 'w-100 h-100' },
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
		key: 'render',
		value: function render() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
				this.renderHead(),
				this.renderContent()
			);
			return retElem;
		}
	}, {
		key: 'renderHead',
		value: function renderHead() {
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					null,
					'\u8D75\u667A\u6DFC'
				)
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column ' },
				React.createElement(
					'div',
					{ className: 'flex-grow-0 d-flex flex-shrink-1 erp-control ' },
					React.createElement('div', { className: 'flex-grow-1 d-flex flex-shrink-1 erp-control ' }),
					React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_0', parentPath: 'M_Page_0', text: '2019-1-9' }),
					React.createElement('div', { className: 'flex-grow-1 d-flex flex-shrink-1 erp-control ' })
				),
				React.createElement(VisibleCM_Form_0, { id: 'M_Form_0', parentPath: 'M_Page_0' }),
				React.createElement(VisibleCM_Form_1, { id: 'M_Form_1', parentPath: 'M_Page_0' })
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
		key: 'render',
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			if (this.props.fetchErr) {
				return renderFetcingErrDiv(this.props.fetchErr.info);
			}
			if (!this.props.loaded || this.props.fetching) {
				return renderFetcingTipDiv();
			}
			retElem = React.createElement(
				'div',
				{ className: 'flex-grow-0 d-flex flex-shrink-1 erp-form flex-column ' },
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_1', parentPath: 'M_Page_0.M_Form_0', label: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D' },
					React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_3', parentPath: 'M_Page_0.M_Form_0' },
					React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_4', parentPath: 'M_Page_0.M_Form_0' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_2', parentPath: 'M_Page_0.M_Form_0', label: '\u8EAB\u4EFD\u8BC1\u4EF6\u5730\u5740' },
					React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_2', parentPath: 'M_Page_0.M_Form_0' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_0', parentPath: 'M_Page_0.M_Form_0', label: '\u51FA\u751F\u5E74\u6708\u65E5\u671F' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_2', parentPath: 'M_Page_0.M_Form_0', type: 'date' })
				),
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
	retProps.fetchErr = ctlState.fetchErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_0_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_0 = ReactRedux.connect(CM_Form_0_mapstatetoprops, CM_Form_0_disptchtoprops)(CM_Form_0);

var CM_Form_1 = function (_React$PureComponent4) {
	_inherits(CM_Form_1, _React$PureComponent4);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this4 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_PageForm(_this4);
		return _this4;
	}

	_createClass(CM_Form_1, [{
		key: 'render',
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			if (this.props.fetchErr) {
				return renderFetcingErrDiv(this.props.fetchErr.info);
			}
			if (!this.props.loaded || this.props.fetching) {
				return renderFetcingTipDiv();
			}
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_4', parentPath: 'M_Page_0.M_Form_1', label: 'A' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_0', parentPath: 'M_Page_0.M_Form_1', type: 'float', precision: '2' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_5', parentPath: 'M_Page_0.M_Form_1' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_1', parentPath: 'M_Page_0.M_Form_1', type: 'float', precision: '2' })
				),
				this.renderNavigater()
			);
			return retElem;
		}
	}]);

	return CM_Form_1;
}(React.PureComponent);

function CM_Form_1_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_1', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchErr = ctlState.fetchErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.loaded = true;
	return retProps;
}
function CM_Form_1_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_1 = ReactRedux.connect(CM_Form_1_mapstatetoprops, CM_Form_1_disptchtoprops)(CM_Form_1);

ErpControlInit();
ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(VisibleApp, null)
), document.getElementById('reactRoot'));
store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));
