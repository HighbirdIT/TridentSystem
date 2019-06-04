"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_1headstyle0 = { "width": "12.5%", "maxWidth": "12.5%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle0 = { "width": "12.5%", "maxWidth": "12.5%" };
var M_Form_1headstyle1 = { "width": "37.5%", "maxWidth": "37.5%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle1 = { "width": "37.5%", "maxWidth": "37.5%" };
var M_Form_1_tableStyle = { "marginTop": "-50px" };
var M_Form_1_headtableStyle = { "marginBottom": "0px" };
var M_Form_2headstyle0 = { "width": "14.3%", "maxWidth": "14.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_2tdstyle0 = { "width": "14.3%", "maxWidth": "14.3%" };
var M_Form_2headstyle1 = { "width": "42.9%", "maxWidth": "42.9%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_2tdstyle1 = { "width": "42.9%", "maxWidth": "42.9%" };
var M_Form_2_tableStyle = { "marginTop": "-50px" };
var M_Form_2_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/KJXXCX';
var thisAppTitle = '快捷信息查询';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_1Page: bind_M_Form_1Page.bind(window), ReBindM_Form_2Page: bind_M_Form_2Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_0.M_Form_0.M_Form_1.pageIndex': bind_M_Form_1.bind(window), 'M_Page_0.M_Form_0.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_0.M_Form_0.M_Form_2.pageIndex': bind_M_Form_2.bind(window), 'M_Page_0.M_Form_0.M_Text_0.value': M_Text_0_value_changed.bind(window), 'M_Page_0.M_Form_0.M_Text_1.value': M_Text_1_value_changed.bind(window), 'M_Page_0.M_Form_0.M_Text_2.value': M_Text_2_value_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_0';
	switch (flowStep) {}
	return gotoPage(targetPageID, state);
}
function gotoPageReducer(state, action) {
	return gotoPage(action.pageName, state);
}
function gotoPage(pageName, state) {
	var retState = state;
	if (state.nowPage == pageName) {
		return state;
	}
	pageRouter.push(pageName);
	switch (pageName) {
		case 'M_Page_0':
			{
				retState = active_M_Page_0(retState);
				break;
			}
	}
	return Object.assign({}, retState);
}
function pageRoute_Back() {
	if (pageRouter.length > 1) {
		pageRouter.pop();
		store.dispatch(makeAction_gotoPage(pageRouter.pop()));
	}
}
function active_M_Page_0(state) {
	state.nowPage = 'M_Page_0';
	if (gDataCache.get('M_Page_0_opened')) {
		return state;
	}
	gDataCache.set('M_Page_0_opened', 1);
	setTimeout(function () {}, 50);
	state = bind_M_Form_0(state);
	state = bind_M_Form_3(state);
	return state;
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Text_0.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_0(retState);
	return retState;
}
function M_Text_1_defaultvalue_get(state, bundle) {
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
	var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
	var M_Text_0_value = bundle != null && bundle['M_Text_0_value'] != null ? bundle['M_Text_0_value'] : M_Text_0_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.value = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_0.M_Form_0.M_Text_1', needSetState);
	};
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Text_0_state, M_Text_0_value, 'int', false, 'M_Text_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Text_1_defaultvalue_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_0.M_Form_0.M_Text_1', { fetching: true, fetchingErr: null });
	var bundle_querysql_0 = {
		记录代码: M_Text_0_value
	};
	setTimeout(function () {
		if (fetchTracer['M_Text_1_defaultvalue_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_1_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var ret = callback_final(state, data_querysql_0, data_querysql_0 != null ? null : { info: '没有找到' });
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function M_Text_2_defaultvalue_get(state, bundle) {
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Text_1_value = bundle != null && bundle['M_Text_1_value'] != null ? bundle['M_Text_1_value'] : M_Text_1_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.value = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_0.M_Form_0.M_Text_2', needSetState);
	};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Text_2_defaultvalue_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_0.M_Form_0.M_Text_2', { fetching: true, fetchingErr: null });
	var bundle_querysql_0 = {
		往来记录代码: M_Text_1_value
	};
	setTimeout(function () {
		if (fetchTracer['M_Text_2_defaultvalue_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_2_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var ret = callback_final(state, data_querysql_0, data_querysql_0 == null ? { info: '没有找到' } : null);
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function fresh_M_Form_1(retState, records_arr) {
	bind_M_Form_1(retState);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', needSetState);
	return bind_M_Form_1Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', needSetState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
	var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
	var M_Text_2_value = M_Text_2_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Text_2_state, M_Text_2_value, 'string', false, 'M_Text_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.M_Text_2_value = M_Text_2_value;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_1' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Form_1', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_1Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['年份'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['月份'];
		needSetState['row_' + rowIndex + '.M_Label_3.text'] = nowRecord['流水号'];
		needSetState['row_' + rowIndex + '.M_Label_4.text'] = nowRecord['金额'];
		needSetState['row_' + rowIndex + '.M_Label_5.text'] = nowRecord['说明'];
		needSetState['row_' + rowIndex + '.M_Label_6.text'] = nowRecord['公司'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', needSetState);
}
function fresh_M_Form_2(retState, records_arr) {
	bind_M_Form_2(retState);
}
function bind_M_Form_2(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', needSetState);
	return bind_M_Form_2Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', needSetState);
	return retState;
}
function pull_M_Form_2(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
	var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
	var M_Text_2_value = M_Text_2_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Text_2_state, M_Text_2_value, 'string', false, 'M_Text_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_0.M_Form_2.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_0.M_Form_2.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.M_Text_2_value = M_Text_2_value;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_2' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Form_2', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_2Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_7.text'] = nowRecord['明细代码'];
		needSetState['row_' + rowIndex + '.M_Label_8.text'] = nowRecord['子目号'];
		needSetState['row_' + rowIndex + '.M_Label_9.text'] = nowRecord['方向'];
		needSetState['row_' + rowIndex + '.M_Label_10.text'] = nowRecord['摘要'];
		needSetState['row_' + rowIndex + '.M_Label_11.text'] = nowRecord['金额'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', needSetState);
}
function fresh_M_Form_3(retState, records_arr) {
	bind_M_Form_3(retState);
}
function bind_M_Form_3(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_3', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Text_3.value'] = null;
	needSetState['M_Text_5.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_3', needSetState);
	return retState;
}
function pull_M_Form_3(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_3(retState);
	return retState;
}
function M_Text_5_validchecker(nowValue, comeState, comeValidErrState) {
	var id;
	var state = store.getState();
	var M_Form_3_state = getStateByPath(state, 'M_Page_0.M_Form_3', {});
	var M_Text_3_state = getStateByPath(M_Form_3_state, 'M_Text_3', {});
	var M_LC_14_state = getStateByPath(M_Form_3_state, 'M_LC_14', {});
	var M_Text_3_value = M_Text_3_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = comeValidErrState == null ? {} : comeValidErrState;
	var callback_final = function callback_final(state, data, err) {
		if (comeValidErrState == null) {
			if (comeState) {
				setManyStateByPath(comeState, '', validErrState);
			} else {
				setTimeout(function () {
					store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
				}, 50);
			}
		}
		return err == null ? null : err.info;
	};
	if (validErrState.hasOwnProperty('M_Page_0.M_Form_3.M_Text_3.invalidInfo')) {
		validErr = validErrState['M_Page_0.M_Form_3.M_Text_3.invalidInfo'];
	} else {
		validErr = BaseIsValueValid(comeState, M_LC_14_state, M_Text_3_state, M_Text_3_value, 'int', false, 'M_Text_3', validErrState);
		validErrState['M_Page_0.M_Form_3.M_Text_3.invalidInfo'] = validErr;
	}
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Text_5_validchecker'] = fetchid;
	var bundle_querysql_0 = {
		报销记录代码: M_Text_3_value
	};
	setTimeout(function () {
		if (fetchTracer['M_Text_5_validchecker'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_3_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var index_querysql_0 = 0;
			for (index_querysql_0 = 0; index_querysql_0 < data_querysql_0.length; ++index_querysql_0) {
				var row_querysql_0 = data_querysql_0[index_querysql_0];
				var querysql_0_财务凭证记录代码 = row_querysql_0.财务凭证记录代码;
				id = querysql_0_财务凭证记录代码;
			}
			var ret = callback_final(state, id, data_querysql_0.length == 0 ? { info: '没有找到' } : null);
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function M_Text_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_0.M_Form_0.M_Text_1.value'] = M_Text_1_defaultvalue_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_Text_1_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_0.M_Form_0.M_Text_2.value'] = M_Text_2_defaultvalue_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_Text_2_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	if (delayActs['call_pull_M_Form_2'] == null) {
		delayActs['call_pull_M_Form_2'] = { callfun: pull_M_Form_2 };
	};
	if (delayActs['call_pull_M_Form_1'] == null) {
		delayActs['call_pull_M_Form_1'] = { callfun: pull_M_Form_1 };
	};
	return setManyStateByPath(state, '', needSetState);
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
			}
			retElem = React.createElement(
				"div",
				{ className: "w-100 h-100" },
				React.createElement(CToastManger, { ref: gCToastMangerRef }),
				React.createElement(CMessageBoxManger, { ref: gCMessageBoxMangerRef }),
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
			var routeElem = pageRouter.length > 1 ? React.createElement("i", { className: "fa fa-arrow-left" }) : null;
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					{ onClick: pageRoute_Back },
					routeElem,
					"\u51ED\u8BC1\u67E5\u8BE2"
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
				React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_0" }),
				React.createElement(VisibleCM_Form_3, { id: "M_Form_3", parentPath: "M_Page_0" })
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
			var navElem = null;
			if (this.props.fetching) {
				retElem = renderFetcingTipDiv();
			} else {
				if (this.props.fetchingErr) {
					retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
				} else {
					if (this.props.invalidbundle) {
						retElem = renderInvalidBundleDiv();
					} else {
						retElem = React.createElement(
							"div",
							{ className: "flex-grow-0 d-flex flex-shrink-1 erp-form flex-column " },
							React.createElement(
								"div",
								{ className: "d-flex flex-grow-1  flex-column" },
								React.createElement(VisibleERPC_Label, { className: "bg-dark text-light erp-control ", id: "M_Label_0", parentPath: "M_Page_0.M_Form_0", type: "string", text: "\u6302\u8D26\u53D8\u66F4" }),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_0", parentPath: "M_Page_0.M_Form_0", label: "\u53D8\u66F4\u8BB0\u5F55\u4EE3\u7801" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_0.M_Form_0", type: "int" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_1", parentPath: "M_Page_0.M_Form_0", label: "\u5F80\u6765\u8BB0\u5F55\u4EE3\u7801" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_2", parentPath: "M_Page_0.M_Form_0", label: "\u8D22\u52A1\u51ED\u8BC1\u4EE3\u7801" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_2", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
								),
								React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_0.M_Form_0", title: "\u51ED\u8BC1\u8BB0\u5F55", pagebreak: false, reBindAT: "ReBindM_Form_1Page" }),
								React.createElement(VisibleCM_Form_2, { id: "M_Form_2", parentPath: "M_Page_0.M_Form_0", title: "\u53D8\u66F4\u51ED\u8BC1\u660E\u7EC6", pagebreak: false, reBindAT: "ReBindM_Form_2Page" })
							),
							this.renderNavigater()
						);
					}
				}
			}
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

var CM_Form_1 = function (_React$PureComponent4) {
	_inherits(CM_Form_1, _React$PureComponent4);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this4 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_GridForm(_this4);
		_this4.tableBodyScroll = _this4.tableBodyScroll.bind(_this4);
		return _this4;
	}

	_createClass(CM_Form_1, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "tableBodyScroll",
		value: function tableBodyScroll(ev) {
			document.getElementById('M_Form_1tableheader').scrollLeft = ev.target.scrollLeft;
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			var navElem = null;
			if (this.props.fetching) {
				retElem = renderFetcingTipDiv();
			} else {
				if (this.props.fetchingErr) {
					retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
				} else {
					if (this.props.invalidbundle) {
						retElem = renderInvalidBundleDiv();
					} else {
						if (!this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
							retElem = React.createElement(
								"div",
								{ className: "m-auto" },
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(CM_Form_1_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
							if (this.props.pagebreak) {
								navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
							}
						}
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
				this.props.title && React.createElement(
					"div",
					{ className: "bg-dark text-light justify-content-center d-flex flex-shrink-0" },
					React.createElement(
						"span",
						null,
						this.props.title
					)
				),
				React.createElement(
					"div",
					{ id: "M_Form_1tableheader", className: "mw-100 hidenOverflow flex-shrink-0" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_1_headtableStyle },
						React.createElement(CM_Form_1_THead, null)
					)
				),
				React.createElement(
					"div",
					{ onScroll: this.tableBodyScroll, className: "mw-100 autoScroll h-100" },
					retElem
				),
				navElem
			);
		}
	}]);

	return CM_Form_1;
}(React.PureComponent);

function CM_Form_1_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_0.M_Form_1', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	retProps.startRowIndex = ctlState.startRowIndex;
	retProps.endRowIndex = ctlState.endRowIndex;
	retProps.pageCount = ctlState.pageCount;
	retProps.pageIndex = ctlState.pageIndex;
	retProps.rowPerPage = ctlState.rowPerPage;
	return retProps;
}
function CM_Form_1_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_1 = ReactRedux.connect(CM_Form_1_mapstatetoprops, CM_Form_1_disptchtoprops)(CM_Form_1);

var CM_Form_1_THead = function (_React$PureComponent5) {
	_inherits(CM_Form_1_THead, _React$PureComponent5);

	function CM_Form_1_THead(props) {
		_classCallCheck(this, CM_Form_1_THead);

		return _possibleConstructorReturn(this, (CM_Form_1_THead.__proto__ || Object.getPrototypeOf(CM_Form_1_THead)).call(this, props));
	}

	_createClass(CM_Form_1_THead, [{
		key: "render",
		value: function render() {
			var retElem = null;
			return React.createElement(
				"thead",
				{ className: "thead-dark" },
				React.createElement(
					"tr",
					null,
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u5E74\u4EFD"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u6708\u4EFD"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u6D41\u6C34\u53F7"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u91D1\u989D"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle1 },
						"\u8BF4\u660E"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u516C\u53F8"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_1_THead;
}(React.PureComponent);

var CM_Form_1_TBody = function (_React$PureComponent6) {
	_inherits(CM_Form_1_TBody, _React$PureComponent6);

	function CM_Form_1_TBody(props) {
		_classCallCheck(this, CM_Form_1_TBody);

		return _possibleConstructorReturn(this, (CM_Form_1_TBody.__proto__ || Object.getPrototypeOf(CM_Form_1_TBody)).call(this, props));
	}

	_createClass(CM_Form_1_TBody, [{
		key: "render",
		value: function render() {
			var retElem = null;
			var trElems_arr = [];
			var startRowIndex = this.props.startRowIndex;
			var endRowIndex = this.props.endRowIndex;
			for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
				trElems_arr.push(React.createElement(
					"tr",
					{ key: rowIndex - startRowIndex },
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_1", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_2", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_3", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_4", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_5", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_6", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					)
				));
			}
			return React.createElement(
				"table",
				{ className: "table table-striped table-hover ", style: M_Form_1_tableStyle },
				React.createElement(CM_Form_1_THead, null),
				React.createElement(
					"tbody",
					null,
					trElems_arr
				)
			);
		}
	}]);

	return CM_Form_1_TBody;
}(React.PureComponent);

var CM_Form_2 = function (_React$PureComponent7) {
	_inherits(CM_Form_2, _React$PureComponent7);

	function CM_Form_2(props) {
		_classCallCheck(this, CM_Form_2);

		var _this7 = _possibleConstructorReturn(this, (CM_Form_2.__proto__ || Object.getPrototypeOf(CM_Form_2)).call(this, props));

		ERPC_GridForm(_this7);
		_this7.tableBodyScroll = _this7.tableBodyScroll.bind(_this7);
		return _this7;
	}

	_createClass(CM_Form_2, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "tableBodyScroll",
		value: function tableBodyScroll(ev) {
			document.getElementById('M_Form_2tableheader').scrollLeft = ev.target.scrollLeft;
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			var navElem = null;
			if (this.props.fetching) {
				retElem = renderFetcingTipDiv();
			} else {
				if (this.props.fetchingErr) {
					retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
				} else {
					if (this.props.invalidbundle) {
						retElem = renderInvalidBundleDiv();
					} else {
						if (!this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
							retElem = React.createElement(
								"div",
								{ className: "m-auto" },
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(CM_Form_2_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
							if (this.props.pagebreak) {
								navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
							}
						}
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
				this.props.title && React.createElement(
					"div",
					{ className: "bg-dark text-light justify-content-center d-flex flex-shrink-0" },
					React.createElement(
						"span",
						null,
						this.props.title
					)
				),
				React.createElement(
					"div",
					{ id: "M_Form_2tableheader", className: "mw-100 hidenOverflow flex-shrink-0" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_2_headtableStyle },
						React.createElement(CM_Form_2_THead, null)
					)
				),
				React.createElement(
					"div",
					{ onScroll: this.tableBodyScroll, className: "mw-100 autoScroll h-100" },
					retElem
				),
				navElem
			);
		}
	}]);

	return CM_Form_2;
}(React.PureComponent);

function CM_Form_2_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_0.M_Form_2', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	retProps.startRowIndex = ctlState.startRowIndex;
	retProps.endRowIndex = ctlState.endRowIndex;
	retProps.pageCount = ctlState.pageCount;
	retProps.pageIndex = ctlState.pageIndex;
	retProps.rowPerPage = ctlState.rowPerPage;
	return retProps;
}
function CM_Form_2_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_2 = ReactRedux.connect(CM_Form_2_mapstatetoprops, CM_Form_2_disptchtoprops)(CM_Form_2);

var CM_Form_2_THead = function (_React$PureComponent8) {
	_inherits(CM_Form_2_THead, _React$PureComponent8);

	function CM_Form_2_THead(props) {
		_classCallCheck(this, CM_Form_2_THead);

		return _possibleConstructorReturn(this, (CM_Form_2_THead.__proto__ || Object.getPrototypeOf(CM_Form_2_THead)).call(this, props));
	}

	_createClass(CM_Form_2_THead, [{
		key: "render",
		value: function render() {
			var retElem = null;
			return React.createElement(
				"thead",
				{ className: "thead-dark" },
				React.createElement(
					"tr",
					null,
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u660E\u7EC6\u4EE3\u7801"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u5B50\u76EE\u53F7"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u65B9\u5411"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle1 },
						"\u6458\u8981"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u91D1\u989D"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_2_THead;
}(React.PureComponent);

var CM_Form_2_TBody = function (_React$PureComponent9) {
	_inherits(CM_Form_2_TBody, _React$PureComponent9);

	function CM_Form_2_TBody(props) {
		_classCallCheck(this, CM_Form_2_TBody);

		return _possibleConstructorReturn(this, (CM_Form_2_TBody.__proto__ || Object.getPrototypeOf(CM_Form_2_TBody)).call(this, props));
	}

	_createClass(CM_Form_2_TBody, [{
		key: "render",
		value: function render() {
			var retElem = null;
			var trElems_arr = [];
			var startRowIndex = this.props.startRowIndex;
			var endRowIndex = this.props.endRowIndex;
			for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
				trElems_arr.push(React.createElement(
					"tr",
					{ key: rowIndex - startRowIndex },
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_7", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_8", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_9", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_10", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_11", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					)
				));
			}
			return React.createElement(
				"table",
				{ className: "table table-striped table-hover ", style: M_Form_2_tableStyle },
				React.createElement(CM_Form_2_THead, null),
				React.createElement(
					"tbody",
					null,
					trElems_arr
				)
			);
		}
	}]);

	return CM_Form_2_TBody;
}(React.PureComponent);

var CM_Form_3 = function (_React$PureComponent10) {
	_inherits(CM_Form_3, _React$PureComponent10);

	function CM_Form_3(props) {
		_classCallCheck(this, CM_Form_3);

		var _this10 = _possibleConstructorReturn(this, (CM_Form_3.__proto__ || Object.getPrototypeOf(CM_Form_3)).call(this, props));

		ERPC_PageForm(_this10);
		return _this10;
	}

	_createClass(CM_Form_3, [{
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
			var navElem = null;
			if (this.props.fetching) {
				retElem = renderFetcingTipDiv();
			} else {
				if (this.props.fetchingErr) {
					retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
				} else {
					if (this.props.invalidbundle) {
						retElem = renderInvalidBundleDiv();
					} else {
						retElem = React.createElement(
							"div",
							{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
							React.createElement(
								"div",
								{ className: "d-flex flex-grow-1  flex-column" },
								React.createElement(VisibleERPC_Label, { className: "text-light bg-dark erp-control ", id: "M_Label_12", parentPath: "M_Page_0.M_Form_3", type: "string", text: "\u4E2A\u4EBA\u62A5\u9500" }),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_14", parentPath: "M_Page_0.M_Form_3", label: "\u62A5\u9500\u8BB0\u5F55\u4EE3\u7801" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_3", parentPath: "M_Page_0.M_Form_3", type: "int" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_16", parentPath: "M_Page_0.M_Form_3", label: "\u8D22\u52A1\u51ED\u8BC1\u4EE3\u7801" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_5", parentPath: "M_Page_0.M_Form_3", type: "int" })
								)
							),
							this.renderNavigater()
						);
					}
				}
			}
			return retElem;
		}
	}]);

	return CM_Form_3;
}(React.PureComponent);

function CM_Form_3_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_3', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = true;
	return retProps;
}
function CM_Form_3_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_3 = ReactRedux.connect(CM_Form_3_mapstatetoprops, CM_Form_3_disptchtoprops)(CM_Form_3);

gCusValidChecker_map['M_Text_5'] = M_Text_5_validchecker;
if (g_envVar.userid != null) {
	ErpControlInit();
	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(VisibleApp, null)
	), document.getElementById('reactRoot'));
} else {
	var search = location.search.replace('?', '');
	location.href = '/?goto=' + location.pathname + '&' + search;
}
store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));
