"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_0_style = { "minHeight": "300px" };
var M_Form_0headstyle0 = { "width": "2.2%", "maxWidth": "2.2%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle0 = { "width": "2.2%", "maxWidth": "2.2%" };
var M_Form_0headstyle1 = { "width": "8.9%", "maxWidth": "8.9%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle1 = { "width": "8.9%", "maxWidth": "8.9%" };
var M_Form_0headstyle2 = { "width": "11.1%", "maxWidth": "11.1%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle2 = { "width": "11.1%", "maxWidth": "11.1%" };
var M_Form_0headstyle3 = { "width": "6.2%", "maxWidth": "6.2%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle3 = { "width": "6.2%", "maxWidth": "6.2%" };
var M_Form_0headstyle4 = { "width": "24.9%", "maxWidth": "24.9%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle4 = { "width": "24.9%", "maxWidth": "24.9%" };
var M_Form_0headstyle5 = { "width": "18.7%", "maxWidth": "18.7%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle5 = { "width": "18.7%", "maxWidth": "18.7%" };
var M_Form_0headstyle6 = { "width": "28%", "maxWidth": "28%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle6 = { "width": "28%", "maxWidth": "28%" };
var M_Form_0_tableStyle = { "marginTop": "-50px" };
var M_Form_0_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/QJSH';
var thisAppTitle = '请假审核';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_2.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_2.M_Form_1.recordIndex': bind_M_Form_1.bind(window), 'M_Page_2.M_Form_1.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_Form_0.pageIndex': bind_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_LC_3.visible': M_LC_3_visible_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_2';
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
		case 'M_Page_2':
			{
				retState = active_M_Page_2(retState);
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
function active_M_Page_2(state) {
	state.nowPage = 'M_Page_2';
	if (gDataCache.get('M_Page_2_opened')) {
		return state;
	}
	gDataCache.set('M_Page_2_opened', 1);
	setTimeout(function () {
		pull_M_Form_1();
	}, 50);
	return state;
}
function fresh_M_Form_1(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_2.M_Form_1', bind_M_Form_1);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	needSetState['M_Dropdown_0.text'] = null;
	needSetState['M_Dropdown_0.value'] = null;
	needSetState['M_Label_15.text'] = M_Label_15_textfield_get(retState, bundle);
	needSetState['M_Label_16.text'] = M_Label_16_textfield_get(retState, bundle);
	needSetState['M_Text_0.value'] = '同意';
	needSetState['M_LC_12.visible'] = false;
	needSetState['M_Text_1.value'] = null;
	needSetState['M_Text_4.value'] = null;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_1_nowRecord = nowRecord;
		needSetState['M_Label_3.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_4.text'] = nowRecord['员工假期种类'];
		needSetState['M_Label_5.text'] = nowRecord['请假起始日期'];
		needSetState['M_Label_8.text'] = nowRecord['请假起始时间'];
		needSetState['M_Label_6.text'] = nowRecord['请假结束日期'];
		needSetState['M_Label_9.text'] = nowRecord['请假结束时间'];
		needSetState['M_Label_7.text'] = nowRecord['请假事由说明'];
		needSetState['M_Label_10.text'] = M_Label_10_textfield_get(retState, bundle);
		needSetState['M_LC_3.visible'] = M_LC_3_isdisplay_get(retState, bundle);
		needSetState['M_LC_4.visible'] = M_LC_4_isdisplay_get(retState, bundle);
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1', needSetState);
	pull_M_Form_0(retState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_1' }, makeFTD_Prop('M_Page_2', 'M_Form_1', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_2.M_Form_1', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Label_15_textfield_get(state, bundle) {
	return 0;
}
function M_Label_16_textfield_get(state, bundle) {
	return true;
}
function M_Label_10_textfield_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.text = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Label_10', needSetState);
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Label_10_textfield_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Label_10', { fetching: true, fetchingErr: null });
	var bundle_querysql_0 = {
		员工代码: M_Form_1_nowRecord['员工登记姓名代码'],
		假期种类代码: M_Form_1_nowRecord['员工假期种类代码']
	};
	setTimeout(function () {
		if (fetchTracer['M_Label_10_textfield_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_26_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var ret = callback_final(state, data_querysql_0, null);
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function M_LC_3_isdisplay_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_1_nowRecord['员工假期种类代码'] == 11;
}
function M_LC_4_isdisplay_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_1_nowRecord['员工假期种类代码'] != 11;
}
function M_LC_6_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : M_LC_3_state.visible;
	return M_LC_3_visible;
}
function button_4_onclick() {
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Text_0_state = getStateByPath(M_Form_1_state, 'M_Text_0', {});
	var M_LC_11_state = getStateByPath(M_Form_1_state, 'M_LC_11', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_1_nowRecord = getStateByPath(M_Form_1_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_21_msg = null;
	var callback_final = function callback_final(state, data, err) {
		if (state == null) {
			store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
		} else {
			setManyStateByPath(state, '', validErrState);
		}
		if (hadValidErr) {
			SendToast('验证失败，无法执行', EToastType.Warning);return;
		}
		if (err) {
			if (scriptBP_21_msg) {
				scriptBP_21_msg.setData(err.info, EMessageBoxType.Error, '通过申请');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_21_msg) {
			scriptBP_21_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_11_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_4_onclick'] = fetchid;
	scriptBP_21_msg = PopMessageBox('', EMessageBoxType.Loading, '通过申请');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_1_nowRecord['员工请假记录代码'],
		M_Text_0_value: M_Text_0_value,
		审核确认状态: 1,
		M_Form_1_员工请假记录代码: M_Form_1_nowRecord['员工请假记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_4_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_1();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function button_0_onclick() {
	var 当前日期_1;
	var temp_1;
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Text_0_state = getStateByPath(M_Form_1_state, 'M_Text_0', {});
	var M_LC_11_state = getStateByPath(M_Form_1_state, 'M_LC_11', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_1_nowRecord = getStateByPath(M_Form_1_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_8_msg = null;
	var callback_final = function callback_final(state, data, err) {
		if (state == null) {
			store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
		} else {
			setManyStateByPath(state, '', validErrState);
		}
		if (hadValidErr) {
			SendToast('验证失败，无法执行', EToastType.Warning);return;
		}
		if (err) {
			if (scriptBP_8_msg) {
				scriptBP_8_msg.setData(err.info, EMessageBoxType.Error, '拒绝申请');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_8_msg) {
			scriptBP_8_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_11_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_8_msg = PopMessageBox('', EMessageBoxType.Loading, '拒绝申请');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_1_nowRecord['员工请假记录代码'],
		M_Text_0_value: M_Text_0_value,
		审核确认状态: 2,
		M_Form_1_员工请假记录代码: M_Form_1_nowRecord['员工请假记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_0_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_1();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', needSetState);
	return bind_M_Form_0Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', needSetState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_1_nowRecord = getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.员工登记姓名代码_sqlBP_7 = M_Form_1_nowRecord.员工登记姓名代码;
	bundle.员工登记姓名_sqlBP_7 = M_Form_1_nowRecord.员工登记姓名;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_0' }, makeFTD_Prop('M_Page_2.M_Form_1', 'M_Form_0', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_0Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_0.text'] = nowRecord['员工假期种类'];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['请假区间'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['请假事由'];
		needSetState['row_' + rowIndex + '.M_Label_11.text'] = nowRecord['姓名'];
		needSetState['row_' + rowIndex + '.M_Label_12.text'] = nowRecord['员工假期种类代码'];
		needSetState['row_' + rowIndex + '.M_Label_13.text'] = nowRecord['登记确认时间'];
		needSetState['row_' + rowIndex + '.M_Label_14.text'] = nowRecord[' 员工登记姓名代码'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', needSetState);
}
function M_LC_3_visible_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_LC_6.visible'] = M_LC_6_isdisplay_get(state);
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
				case 'M_Page_2':
					{
						pageElem = React.createElement(VisibleCM_Page_2, null);
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

var CM_Page_2 = function (_React$PureComponent2) {
	_inherits(CM_Page_2, _React$PureComponent2);

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
			var routeElem = pageRouter.length > 1 ? React.createElement("i", { className: "fa fa-arrow-left" }) : null;
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					{ onClick: pageRoute_Back },
					routeElem,
					"\u8BF7\u5047\u5BA1\u6838"
				)
			);
		}
	}, {
		key: "renderContent",
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column fixPageContent " },
				React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_2" })
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

var CM_Form_1 = function (_React$PureComponent3) {
	_inherits(CM_Form_1, _React$PureComponent3);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this3 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_PageForm(_this3);
		return _this3;
	}

	_createClass(CM_Form_1, [{
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
						if (!this.props.canInsert && this.props.nowRecord == null) {
							retElem = React.createElement(
								"div",
								{ className: "m-auto" },
								"\u6CA1\u6709\u7B49\u5F85\u5BA1\u6838\u7684\u8BF7\u5047\u8BB0\u5F55\u4E86"
							);
						} else {
							retElem = React.createElement(
								"div",
								{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
								React.createElement(
									"div",
									{ className: "d-flex flex-grow-1  flex-column autoScroll_Touch" },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_13", parentPath: "M_Page_2.M_Form_1", label: "\u4EBA\u5458" },
										React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: "M_Page_2.M_Form_1", pullOnce: true, pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u4EBA\u5458" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_14", parentPath: "M_Page_2.M_Form_1", label: "ert" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_15", parentPath: "M_Page_2.M_Form_1", type: "boolean" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_20", parentPath: "M_Page_2.M_Form_1", label: "244" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_16", parentPath: "M_Page_2.M_Form_1", type: "boolean" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_0", parentPath: "M_Page_2.M_Form_1", label: "\u8BF7\u5047\u4EBA\u5458" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_3", parentPath: "M_Page_2.M_Form_1", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_1", parentPath: "M_Page_2.M_Form_1", label: "\u5047\u671F\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_4", parentPath: "M_Page_2.M_Form_1", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_5", parentPath: "M_Page_2.M_Form_1", label: "\u5F53\u524D\u72B6\u6001" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_10", parentPath: "M_Page_2.M_Form_1", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_2", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_5", parentPath: "M_Page_2.M_Form_1", type: "date" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_3", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_2.M_Form_1", type: "time" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_4", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_6", parentPath: "M_Page_2.M_Form_1", type: "date" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_6", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_2.M_Form_1", type: "time" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_7", parentPath: "M_Page_2.M_Form_1", label: "\u4E8B\u7531\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_7", parentPath: "M_Page_2.M_Form_1", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_11", parentPath: "M_Page_2.M_Form_1", label: "\u5BA1\u6838\u8BF4\u660E" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "1x" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_12", parentPath: "M_Page_2.M_Form_1", label: "test", visible: false },
										React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_15", parentPath: "M_Page_2.M_Form_1", label: "C" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_4", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_Button,
										{ className: "btn btn-primary erp-control ", id: "button_1", parentPath: "M_Page_2.M_Form_1" },
										"\u540C\u610F\u4E13\u7528"
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
										React.createElement(
											VisibleERPC_Button,
											{ className: "btn-success flex-grow-1 btn btn-primary erp-control ", id: "button_4", parentPath: "M_Page_2.M_Form_1", onClick: button_4_onclick },
											"\u901A\u8FC7\u7533\u8BF7"
										),
										React.createElement(
											VisibleERPC_Button,
											{ className: "btn-danger flex-grow-1 btn btn-primary erp-control ", id: "button_0", parentPath: "M_Page_2.M_Form_1", onClick: button_0_onclick },
											"\u62D2\u7EDD\u7533\u8BF7"
										)
									),
									React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_2.M_Form_1", title: "\u4ED6\u7684\u6700\u8FD1\u8BF7\u5047", pagebreak: false, reBindAT: "ReBindM_Form_0Page" })
								),
								this.renderNavigater()
							);
						}
					}
				}
			}
			return retElem;
		}
	}]);

	return CM_Form_1;
}(React.PureComponent);

function CM_Form_1_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_1_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_1 = ReactRedux.connect(CM_Form_1_mapstatetoprops, CM_Form_1_disptchtoprops)(CM_Form_1);

var CM_Form_0 = function (_React$PureComponent4) {
	_inherits(CM_Form_0, _React$PureComponent4);

	function CM_Form_0(props) {
		_classCallCheck(this, CM_Form_0);

		var _this4 = _possibleConstructorReturn(this, (CM_Form_0.__proto__ || Object.getPrototypeOf(CM_Form_0)).call(this, props));

		ERPC_GridForm(_this4);
		_this4.tableBodyScroll = _this4.tableBodyScroll.bind(_this4);
		return _this4;
	}

	_createClass(CM_Form_0, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "tableBodyScroll",
		value: function tableBodyScroll(ev) {
			document.getElementById('M_Form_0tableheader').scrollLeft = ev.target.scrollLeft;
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
							retElem = React.createElement(CM_Form_0_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
							if (this.props.pagebreak) {
								navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
							}
						}
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "flex-grow-0 d-flex flex-shrink-1 erp-form flex-column ", style: M_Form_0_style },
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
					{ id: "M_Form_0tableheader", className: "mw-100 hidenOverflow flex-shrink-0" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_0_headtableStyle },
						React.createElement(CM_Form_0_THead, null)
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

	return CM_Form_0;
}(React.PureComponent);

function CM_Form_0_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0', {});
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
function CM_Form_0_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_0 = ReactRedux.connect(CM_Form_0_mapstatetoprops, CM_Form_0_disptchtoprops)(CM_Form_0);

var CM_Form_0_THead = function (_React$PureComponent5) {
	_inherits(CM_Form_0_THead, _React$PureComponent5);

	function CM_Form_0_THead(props) {
		_classCallCheck(this, CM_Form_0_THead);

		return _possibleConstructorReturn(this, (CM_Form_0_THead.__proto__ || Object.getPrototypeOf(CM_Form_0_THead)).call(this, props));
	}

	_createClass(CM_Form_0_THead, [{
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
						{ scope: "col", style: M_Form_0headstyle0 },
						"\u79CD\u7C7B"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle1 },
						"\u8BF7\u5047\u533A\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle2 },
						"\u8BF7\u5047\u4E8B\u7531"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle3 },
						"\u59D3\u540D"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle4 },
						"\u5458\u5DE5\u5047\u671F\u79CD\u7C7B\u4EE3\u7801"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle5 },
						"\u767B\u8BB0\u786E\u8BA4\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle6 },
						" \u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_0_THead;
}(React.PureComponent);

var CM_Form_0_TBody = function (_React$PureComponent6) {
	_inherits(CM_Form_0_TBody, _React$PureComponent6);

	function CM_Form_0_TBody(props) {
		_classCallCheck(this, CM_Form_0_TBody);

		return _possibleConstructorReturn(this, (CM_Form_0_TBody.__proto__ || Object.getPrototypeOf(CM_Form_0_TBody)).call(this, props));
	}

	_createClass(CM_Form_0_TBody, [{
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
						{ style: M_Form_0tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_0", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_1", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle2 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_2", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle3 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_11", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle4 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_12", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle5 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_13", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle6 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_14", parentPath: "M_Page_2.M_Form_1.M_Form_0", type: "string" })
					)
				));
			}
			return React.createElement(
				"table",
				{ className: "table table-striped table-hover ", style: M_Form_0_tableStyle },
				React.createElement(CM_Form_0_THead, null),
				React.createElement(
					"tbody",
					null,
					trElems_arr
				)
			);
		}
	}]);

	return CM_Form_0_TBody;
}(React.PureComponent);

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