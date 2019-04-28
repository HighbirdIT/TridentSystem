"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_2headstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_2tdstyle0 = { "width": "33.3%", "maxWidth": "33.3%" };
var M_Form_2_tableStyle = { "marginTop": "-50px" };
var M_Form_2_headtableStyle = { "marginBottom": "0px" };
var M_Form_1headstyle0 = { "width": "11.1%", "maxWidth": "11.1%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle0 = { "width": "11.1%", "maxWidth": "11.1%" };
var M_Form_1headstyle1 = { "width": "22.2%", "maxWidth": "22.2%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle1 = { "width": "22.2%", "maxWidth": "22.2%" };
var M_Form_1headstyle2 = { "width": "44.4%", "maxWidth": "44.4%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle2 = { "width": "44.4%", "maxWidth": "44.4%" };
var M_Form_1_tableStyle = { "marginTop": "-50px" };
var M_Form_1_headtableStyle = { "marginBottom": "0px" };
var M_Form_5_style = { "height": "200px" };
var M_Form_5headstyle0 = { "width": "14.3%", "maxWidth": "14.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_5tdstyle0 = { "width": "14.3%", "maxWidth": "14.3%" };
var M_Form_5headstyle1 = { "width": "28.6%", "maxWidth": "28.6%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_5tdstyle1 = { "width": "28.6%", "maxWidth": "28.6%" };
var M_Form_5_tableStyle = { "marginTop": "-50px" };
var M_Form_5_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/KQGL';
var thisAppTitle = '考勤管理';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_2Page: bind_M_Form_2Page.bind(window), ReBindM_Form_1Page: bind_M_Form_1Page.bind(window), ReBindM_Form_5Page: bind_M_Form_5Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_0.M_Form_0.M_Form_2.pageIndex': bind_M_Form_2.bind(window), 'M_Page_0.M_Form_0.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_0.M_Form_0.M_Form_1.pageIndex': bind_M_Form_1.bind(window), 'M_Page_1.M_Form_3.records_arr': fresh_M_Form_3.bind(window), 'M_Page_1.M_Form_3.recordIndex': bind_M_Form_3.bind(window), 'M_Page_1.M_Form_3.M_Form_4.records_arr': fresh_M_Form_4.bind(window), 'M_Page_1.M_Form_3.M_Form_4.recordIndex': bind_M_Form_4.bind(window), 'M_Page_1.M_Form_3.M_Form_6.records_arr': fresh_M_Form_6.bind(window), 'M_Page_1.M_Form_3.M_Form_6.recordIndex': bind_M_Form_6.bind(window), 'M_Page_1.M_Form_3.M_Form_5.records_arr': fresh_M_Form_5.bind(window), 'M_Page_1.M_Form_3.M_Form_5.pageIndex': bind_M_Form_5.bind(window), 'M_Page_0.M_Form_0.M_Text_1.value': M_Text_1_value_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_2';
	switch (flowStep) {
		case 27:
			{
				targetPageID = 'M_Page_0';
				break;
			}
		case 30:
			{
				targetPageID = 'M_Page_1';
				break;
			}
	}
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
	return state;
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Label_0.text'] = M_Label_0_textfield_get(retState, bundle);
	needSetState['M_Text_1.value'] = M_Text_1_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_1.value'] = '1';
	needSetState['M_Dropdown_2.text'] = null;
	needSetState['M_Dropdown_2.value'] = null;
	needSetState['M_Text_5.value'] = null;
	needSetState['M_Text_6.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_0(retState);
	return retState;
}
function M_Label_0_textfield_get(state, bundle) {
	return g_envVar.username;
}
function M_Text_1_validchecker(nowValue, comeState, comeValidErrState) {
	var 日期间隔天数;
	var state = store.getState();
	日期间隔天数 = getDateDiff('天', new Date(nowValue), getNowDate());
	if (日期间隔天数 > 15) {
		return '只能补登15天之内的考勤';
	} else {
		if (日期间隔天数 < 0) {
			return '补登日期不能大于当前日期';
		}
	}
}
function M_Text_1_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function button_1_onclick() {
	var state = store.getState();
	var scriptBP_8_msg = null;
	var callback_final = function callback_final(state, data, err) {
		if (err) {
			if (scriptBP_8_msg) {
				scriptBP_8_msg.setData(err.info, EMessageBoxType.Error, '下一条异常日期');
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
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_8_msg = PopMessageBox('', EMessageBoxType.Loading, '下一条异常日期');;
	var bundle_querysql_0 = {
		员工代码: g_envVar.userid
	};
	setTimeout(function () {
		if (fetchTracer['button_1_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_8_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			if (data_querysql_0 == null) {
				var ret = callback_final(state, null, { info: '没有找到' });
				return ret == null ? state : ret;
			} else {
				setTimeout(function () {
					store.dispatch(makeAction_setStateByPath(getFormatDateString(new Date(data_querysql_0)), 'M_Page_0.M_Form_0.M_Text_1.value'));
				}, 50);
				var ret = callback_final(state, 1, null);
				return ret == null ? state : ret;
			}
		}, false)));
	}, 50);
}
function pull_M_Dropdown_1() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_2() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_2' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_2', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_5_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Text_5_state = getStateByPath(M_Form_0_state, 'M_Text_5', {});
	var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
	var M_Text_5_value = M_Text_5_state.value;
	var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
	var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
	var M_Dropdown_1_value = M_Dropdown_1_state.value;
	var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
	var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
	var M_Dropdown_2_value = M_Dropdown_2_state.value;
	var M_Text_6_state = getStateByPath(M_Form_0_state, 'M_Text_6', {});
	var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
	var M_Text_6_value = M_Text_6_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_2_msg = null;
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
			if (scriptBP_2_msg) {
				scriptBP_2_msg.setData(err.info, EMessageBoxType.Error, '登记提交');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_2_msg) {
			scriptBP_2_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_5_state, M_Text_5_state, M_Text_5_value, 'time', false, 'M_Text_5', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_5.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_3_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_6_state, M_Text_6_state, M_Text_6_value, 'string', false, 'M_Text_6', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_6.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_2_msg = PopMessageBox('', EMessageBoxType.Loading, '登记提交');;
	var bundle_querysql_0 = {
		员工姓名: g_envVar.userid,
		考勤日期: M_Text_1_value,
		考勤时间: M_Text_5_value
	};
	setTimeout(function () {
		if (fetchTracer['button_0_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_2_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			if (data_querysql_0.length > 0) {
				var ret = callback_final(state, null, { info: '不可重复登记' });
				return ret == null ? state : ret;
			} else {
				var bundle_insert_table_0 = {
					员工登记姓名代码: g_envVar.userid,
					M_Text_1_value: M_Text_1_value,
					M_Dropdown_1_value: M_Dropdown_1_value,
					M_Dropdown_2_value: M_Dropdown_2_value,
					M_Text_5_value: M_Text_5_value,
					M_Text_6_value: M_Text_6_value,
					审核确认状态: 1
				};
				setTimeout(function () {
					store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_0_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
						if (err_insert_table_0 == null) {
							setTimeout(function () {
								pull_M_Form_1();
							}, 50);
							setTimeout(function () {
								pull_M_Form_2();
							}, 50);
							var ret = callback_final(state, data_insert_table_0, null);
							return ret == null ? state : ret;
						} else {
							return callback_final(state, data_insert_table_0, err_insert_table_0);
						}
					})));
				}, 50);
			}
		}, false)));
	}, 50);
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
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Text_1_value = M_Text_1_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
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
	bundle.M_Text_1_value = M_Text_1_value;
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
		needSetState['row_' + rowIndex + '.M_Label_5.text'] = nowRecord['考勤登记种类'];
		needSetState['row_' + rowIndex + '.M_Label_6.text'] = nowRecord['考勤登记时间'];
		needSetState['row_' + rowIndex + '.M_Label_7.text'] = nowRecord['考勤登记地点'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_2', needSetState);
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
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Text_1_value = M_Text_1_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
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
	bundle.M_Text_1_value = M_Text_1_value;
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
		needSetState['row_' + rowIndex + '.M_Label_4.text'] = nowRecord['记录种类名称'];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['记录开始时间'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['记录结束时间'];
		needSetState['row_' + rowIndex + '.M_Label_3.text'] = nowRecord['记录开始地点'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', needSetState);
}
function active_M_Page_1(state) {
	var needSetState = {};
	state.nowPage = 'M_Page_1';
	if (gDataCache.get('M_Page_1_opened')) {
		return state;
	}
	gDataCache.set('M_Page_1_opened', 1);
	needSetState['M_Page_1.M_Text_2.value'] = M_Text_2_defaultvalue_get(state);
	state = setManyStateByPath(state, '', needSetState);
	setTimeout(function () {
		pull_M_Form_4();
		pull_M_Form_3();
	}, 50);
	return state;
}
function button_5_onclick() {
	var 日期;
	var state = store.getState();
	var M_Text_2_state = getStateByPath(store.getState(), 'M_Page_1.M_Text_2');
	var M_Text_2_value = M_Text_2_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_14_msg = null;
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
			if (scriptBP_14_msg) {
				scriptBP_14_msg.setData(err.info, EMessageBoxType.Error, '前一天');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_14_msg) {
			scriptBP_14_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_Text_2_state, M_Text_2_state, M_Text_2_value, 'date', false, 'M_Text_2', validErrState);
	validErrState['M_Page_1.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	setTimeout(function () {
		store.dispatch(makeAction_setStateByPath(getFormatDateString(new Date(new Date(M_Text_2_value).setDate(new Date(M_Text_2_value).getDate() + -1))), 'M_Page_1.M_Text_2.value'));
	}, 50);
}
function M_Text_2_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
}
function M_Text_2_defaultvalue_get(state, bundle) {
	var callback_final = function callback_final(state, data, err) {
		var needSetState = {};
		needSetState.value = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_1.M_Text_2', needSetState);
	};
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Text_2_defaultvalue_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_1.M_Text_2', { fetching: true, fetchingErr: null });
	var bundle_querysql_0 = {
		员工代码: g_envVar.userid
	};
	setTimeout(function () {
		if (fetchTracer['M_Text_2_defaultvalue_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_12_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			if (null == data_querysql_0) {
				var bundle_querysql_1 = {
					员工代码: g_envVar.userid
				};
				setTimeout(function () {
					if (fetchTracer['M_Text_2_defaultvalue_get'] != fetchid) return;
					store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_1, action: 'scriptBP_12_querysql_1' }, makeFTD_Callback(function (state, data_querysql_1, error_querysql_1) {
						if (error_querysql_1) {
							return callback_final(state, null, error_querysql_1);
						}
						var ret = callback_final(state, data_querysql_1, null);
						return ret == null ? state : ret;
					}, false)));
				}, 50);
			} else {
				var ret = callback_final(state, data_querysql_0, null);
				return ret == null ? state : ret;
			}
		}, false)));
	}, 50);
}
function button_6_onclick() {
	var state = store.getState();
	var M_Text_2_state = getStateByPath(store.getState(), 'M_Page_1.M_Text_2');
	var M_Text_2_value = M_Text_2_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_15_msg = null;
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
			if (scriptBP_15_msg) {
				scriptBP_15_msg.setData(err.info, EMessageBoxType.Error, '后一天');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_15_msg) {
			scriptBP_15_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_Text_2_state, M_Text_2_state, M_Text_2_value, 'date', false, 'M_Text_2', validErrState);
	validErrState['M_Page_1.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	if (getFormatDateString(new Date(M_Text_2_value).setDate(new Date(M_Text_2_value).getDate() + 1)) > getFormatDateString(getNowDate())) {
		setTimeout(function () {
			store.dispatch(makeAction_setStateByPath(getFormatDateString(getNowDate()), 'M_Page_1.M_Text_2.value'));
		}, 50);
	} else {
		setTimeout(function () {
			store.dispatch(makeAction_setStateByPath(getFormatDateString(new Date(M_Text_2_value).setDate(new Date(M_Text_2_value).getDate() + 1)), 'M_Page_1.M_Text_2.value'));
		}, 50);
	}
}
function fresh_M_Form_3(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_1.M_Form_3', bind_M_Form_3);
}
function bind_M_Form_3(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_3_nowRecord = nowRecord;
		needSetState['M_Label_8.text'] = nowRecord['考勤登记日期'];
		needSetState['M_Label_9.text'] = nowRecord['当日状态'];
		needSetState['M_Label_10.text'] = nowRecord['异常情况说明'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3', needSetState);
	pull_M_Form_5(retState);
	return retState;
}
function pull_M_Form_3(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_3' }, makeFTD_Prop('M_Page_1', 'M_Form_3', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	retState = pull_M_Form_7(retState);
	return state;
}
function fresh_M_Form_4(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_1.M_Form_3.M_Form_4', bind_M_Form_4);
}
function bind_M_Form_4(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_4', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_4_nowRecord = nowRecord;
		needSetState['M_Label_11.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_12.text'] = nowRecord['考勤登记种类'];
		needSetState['M_Label_13.text'] = nowRecord['内勤工作时间'];
		needSetState['M_Label_14.text'] = nowRecord['申报内勤时间'];
		needSetState['M_Label_15.text'] = nowRecord['外勤工作时间'];
		needSetState['M_Label_16.text'] = nowRecord['工作时间调减'];
		needSetState['M_Label_17.text'] = nowRecord['工时调整说明'];
		needSetState['M_Label_18.text'] = nowRecord['计算有效工时'];
		needSetState['M_Label_19.text'] = nowRecord['确认有效工时'];
		needSetState['M_Label_20.text'] = nowRecord['是否认定迟到'];
		needSetState['M_Label_21.text'] = nowRecord['是否认定早退'];
		needSetState['M_Label_22.text'] = nowRecord['是否认定离岗'];
		needSetState['M_Label_23.text'] = nowRecord['是否已经认定'];
		needSetState['M_Label_24.text'] = nowRecord['其它说明'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_4', needSetState);
	pull_M_Form_6(retState);
	return retState;
}
function pull_M_Form_4(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_4' }, makeFTD_Prop('M_Page_1.M_Form_3', 'M_Form_4', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function fresh_M_Form_6(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_1.M_Form_3.M_Form_6', bind_M_Form_6);
}
function bind_M_Form_6(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_6', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_6_nowRecord = nowRecord;
		needSetState['M_Label_30.text'] = nowRecord['总结'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_6', needSetState);
	return retState;
}
function pull_M_Form_6(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_4_nowRecord = getStateByPath(state, 'M_Page_1.M_Form_3.M_Form_4.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_4_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_3.M_Form_6.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_3.M_Form_6.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_3.M_Form_6.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_3.M_Form_6.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.员工登记姓名代码_9160 = M_Form_4_nowRecord.员工登记姓名代码;
	bundle.考勤登记日期_9160 = M_Form_4_nowRecord.考勤登记日期;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_6' }, makeFTD_Prop('M_Page_1.M_Form_3', 'M_Form_6', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function fresh_M_Form_7(retState, records_arr) {
	bind_M_Form_7(retState);
}
function bind_M_Form_7(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_7', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Text_0.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_7', needSetState);
	return retState;
}
function pull_M_Form_7(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_7(retState);
	return retState;
}
function fresh_M_Form_5(retState, records_arr) {
	bind_M_Form_5(retState);
}
function bind_M_Form_5(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_5', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = false;
	var pageCount = formState.pageCount;
	var pageIndex = formState.pageIndex;
	if (records_arr != null && records_arr.length > 0) {
		var rowPerPage = formState.rowPerPage == null ? 20 : formState.rowPerPage;
		needSetState.rowPerPage = rowPerPage;
		pageCount = Math.ceil(records_arr.length / rowPerPage);
		if (pageIndex == null || pageIndex < 0) {
			pageIndex = 0;
		} else if (pageIndex >= pageCount) {
			pageIndex = pageCount - 1;
		}
	} else {
		pageCount = 0;
		pageIndex = 0;
	}
	needSetState.pageCount = pageCount;
	needSetState.pageIndex = pageIndex;
	needActiveBindPage = pageIndex == formState.pageIndex;
	needSetState['invalidbundle'] = false;
	if (needActiveBindPage) {
		retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_5', needSetState);
		return bind_M_Form_5Page(retState);
	}
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_5', needSetState);
	return retState;
}
function pull_M_Form_5(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_3_nowRecord = getStateByPath(state, 'M_Page_1.M_Form_3.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_3_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_3.M_Form_5.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_3.M_Form_5.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_3.M_Form_5.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_3.M_Form_5.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.考勤登记日期_12006 = M_Form_3_nowRecord.考勤登记日期;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_5' }, makeFTD_Prop('M_Page_1.M_Form_3', 'M_Form_5', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_5Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_5', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var pageIndex = formState.pageIndex;
	var rowPerPage = formState.rowPerPage;
	var startRowIndex = pageIndex * rowPerPage;
	var endRowIndex = (pageIndex + 1) * rowPerPage - 1;
	if (endRowIndex >= records_arr.length) {
		endRowIndex = records_arr.length - 1;
	}
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_25.text'] = nowRecord['记录开始时间'];
		needSetState['row_' + rowIndex + '.M_Label_26.text'] = nowRecord['记录结束时间'];
		needSetState['row_' + rowIndex + '.M_Label_27.text'] = nowRecord['记录种类名称'];
		needSetState['row_' + rowIndex + '.M_Label_28.text'] = nowRecord['记录开始地点'];
		needSetState['row_' + rowIndex + '.M_Label_29.text'] = nowRecord['记录结束地点'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_1.M_Form_3.M_Form_5', needSetState);
}
function active_M_Page_2(state) {
	state.nowPage = 'M_Page_2';
	if (gDataCache.get('M_Page_2_opened')) {
		return state;
	}
	gDataCache.set('M_Page_2_opened', 1);
	setTimeout(function () {}, 50);
	return state;
}
function button_3_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_0'));
	}, 50);
}
function button_4_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_1'));
	}, 50);
}
function M_Text_1_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	if (delayActs['call_pull_M_Form_1'] == null) {
		delayActs['call_pull_M_Form_1'] = { callfun: pull_M_Form_1 };
	};
	if (delayActs['call_pull_M_Form_2'] == null) {
		delayActs['call_pull_M_Form_2'] = { callfun: pull_M_Form_2 };
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
					"\u8003\u52E4\u8865\u767B"
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
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_0", parentPath: "M_Page_0.M_Form_0", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" },
									React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_0", parentPath: "M_Page_0.M_Form_0", type: "string" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_1", parentPath: "M_Page_0.M_Form_0", label: "\u8003\u52E4\u767B\u8BB0\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "date" })
								),
								React.createElement(
									"button",
									{ className: "btn btn-link erp-control ", id: "button_1", onClick: button_1_onclick },
									"\u4E0B\u4E00\u6761\u5F02\u5E38\u65E5\u671F"
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_2", parentPath: "M_Page_0.M_Form_0", label: "\u8865\u767B\u539F\u56E0\u79CD\u7C7B" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_1, textAttrName: "\u8865\u767B\u539F\u56E0\u79CD\u7C7B", valueAttrName: "\u8865\u767B\u539F\u56E0\u79CD\u7C7B\u4EE3\u7801", label: "\u8865\u767B\u539F\u56E0\u79CD\u7C7B" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_3", parentPath: "M_Page_0.M_Form_0", label: "\u8865\u767B\u8003\u52E4\u5730\u70B9" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_2", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_2, textAttrName: "\u8003\u52E4\u767B\u8BB0\u5730\u70B9", valueAttrName: "\u8003\u52E4\u767B\u8BB0\u5730\u70B9\u4EE3\u7801", label: "\u8865\u767B\u8003\u52E4\u5730\u70B9" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_5", parentPath: "M_Page_0.M_Form_0", label: "\u8865\u767B\u8003\u52E4\u65F6\u95F4" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_5", parentPath: "M_Page_0.M_Form_0", type: "time" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_6", parentPath: "M_Page_0.M_Form_0", label: "\u539F\u56E0\u8BE6\u7EC6\u8BF4\u660E" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_6", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
								),
								React.createElement(
									"button",
									{ className: "btn btn-primary erp-control ", id: "button_0", onClick: button_0_onclick },
									"\u767B\u8BB0\u63D0\u4EA4"
								),
								React.createElement(VisibleCM_Form_2, { id: "M_Form_2", parentPath: "M_Page_0.M_Form_0", title: "\u5F53\u65E5\u8003\u52E4\u8BB0\u5F55", pagebreak: false, reBindAT: "ReBindM_Form_2Page" }),
								React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_0.M_Form_0", title: "\u5F53\u65E5\u884C\u8E2A", pagebreak: false, reBindAT: "ReBindM_Form_1Page" })
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

var CM_Form_2 = function (_React$PureComponent4) {
	_inherits(CM_Form_2, _React$PureComponent4);

	function CM_Form_2(props) {
		_classCallCheck(this, CM_Form_2);

		var _this4 = _possibleConstructorReturn(this, (CM_Form_2.__proto__ || Object.getPrototypeOf(CM_Form_2)).call(this, props));

		ERPC_GridForm(_this4);
		_this4.tableBodyScroll = _this4.tableBodyScroll.bind(_this4);
		return _this4;
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

var CM_Form_2_THead = function (_React$PureComponent5) {
	_inherits(CM_Form_2_THead, _React$PureComponent5);

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
						"\u6765\u6E90\u79CD\u7C7B"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u8003\u52E4\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_2headstyle0 },
						"\u8003\u52E4\u5730\u70B9"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_2_THead;
}(React.PureComponent);

var CM_Form_2_TBody = function (_React$PureComponent6) {
	_inherits(CM_Form_2_TBody, _React$PureComponent6);

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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_5", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_6", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "time" })
					),
					React.createElement(
						"td",
						{ style: M_Form_2tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_7", parentPath: "M_Page_0.M_Form_0.M_Form_2", type: "string" })
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

var CM_Form_1 = function (_React$PureComponent7) {
	_inherits(CM_Form_1, _React$PureComponent7);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this7 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_GridForm(_this7);
		_this7.tableBodyScroll = _this7.tableBodyScroll.bind(_this7);
		return _this7;
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

var CM_Form_1_THead = function (_React$PureComponent8) {
	_inherits(CM_Form_1_THead, _React$PureComponent8);

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
						"\u79CD\u7C7B\u540D\u79F0"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle1 },
						"\u5F00\u59CB\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle1 },
						"\u7ED3\u675F\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle2 },
						"\u5F00\u59CB\u5730\u70B9"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_1_THead;
}(React.PureComponent);

var CM_Form_1_TBody = function (_React$PureComponent9) {
	_inherits(CM_Form_1_TBody, _React$PureComponent9);

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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_4", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_1", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "time" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_2", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "time" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle2 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_3", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
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

var CM_Page_1 = function (_React$PureComponent10) {
	_inherits(CM_Page_1, _React$PureComponent10);

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
			var routeElem = pageRouter.length > 1 ? React.createElement("i", { className: "fa fa-arrow-left" }) : null;
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					{ onClick: pageRoute_Back },
					routeElem,
					"\u8003\u52E4\u8BA4\u5B9A"
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
					{ className: "flex-grow-0 flex-shrink-0 d-flex erp-control " },
					React.createElement(
						"button",
						{ className: "flex-grow-1 btn btn-secondary erp-control ", id: "button_5", onClick: button_5_onclick },
						"\u524D\u4E00\u5929"
					),
					React.createElement(VisibleERPC_Text, { className: "flex-grow-1 ", id: "M_Text_2", parentPath: "M_Page_1", type: "date", readonly: true }),
					React.createElement(
						"button",
						{ className: "flex-grow-1 btn btn-secondary erp-control ", id: "button_6", onClick: button_6_onclick },
						"\u540E\u4E00\u5929"
					)
				),
				React.createElement(VisibleCM_Form_3, { id: "M_Form_3", parentPath: "M_Page_1" })
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

var CM_Form_3 = function (_React$PureComponent11) {
	_inherits(CM_Form_3, _React$PureComponent11);

	function CM_Form_3(props) {
		_classCallCheck(this, CM_Form_3);

		var _this11 = _possibleConstructorReturn(this, (CM_Form_3.__proto__ || Object.getPrototypeOf(CM_Form_3)).call(this, props));

		ERPC_PageForm(_this11);
		return _this11;
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
						if (!this.props.canInsert && this.props.nowRecord == null) {
							retElem = React.createElement(
								"div",
								{ className: "m-auto" },
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(
								"div",
								{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
								React.createElement(
									"div",
									{ className: "d-flex flex-grow-1  flex-column" },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_13", parentPath: "M_Page_1.M_Form_3", label: "\u8003\u52E4\u767B\u8BB0\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_1.M_Form_3", type: "date" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_14", parentPath: "M_Page_1.M_Form_3", label: "\u5F53\u65E5\u72B6\u6001" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_1.M_Form_3", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_15", parentPath: "M_Page_1.M_Form_3", label: "\u5F02\u5E38\u60C5\u51B5\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_10", parentPath: "M_Page_1.M_Form_3", type: "string" })
									),
									React.createElement(VisibleCM_Form_4, { id: "M_Form_4", parentPath: "M_Page_1.M_Form_3" }),
									React.createElement(VisibleCM_Form_6, { id: "M_Form_6", parentPath: "M_Page_1.M_Form_3" }),
									React.createElement(
										"div",
										{ className: "d-flex flex-grow-1 flex-shrink-1 erp-control " },
										React.createElement(VisibleCM_Form_7, { id: "M_Form_7", parentPath: "M_Page_1.M_Form_3" })
									),
									React.createElement(VisibleCM_Form_5, { id: "M_Form_5", parentPath: "M_Page_1.M_Form_3", title: "\u5458\u5DE5\u884C\u8E2A\u8BB0\u5F55", pagebreak: true, reBindAT: "ReBindM_Form_5Page" }),
									React.createElement(
										"button",
										{ className: "btn btn-success erp-control ", id: "button_2" },
										"\u8BA4\u5B9A\u786E\u8BA4"
									)
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

	return CM_Form_3;
}(React.PureComponent);

function CM_Form_3_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_3', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_3_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_3 = ReactRedux.connect(CM_Form_3_mapstatetoprops, CM_Form_3_disptchtoprops)(CM_Form_3);

var CM_Form_4 = function (_React$PureComponent12) {
	_inherits(CM_Form_4, _React$PureComponent12);

	function CM_Form_4(props) {
		_classCallCheck(this, CM_Form_4);

		var _this12 = _possibleConstructorReturn(this, (CM_Form_4.__proto__ || Object.getPrototypeOf(CM_Form_4)).call(this, props));

		ERPC_PageForm(_this12);
		return _this12;
	}

	_createClass(CM_Form_4, [{
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
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(
								"div",
								{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
								React.createElement(
									"div",
									{ className: "d-flex flex-grow-1  flex-column" },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_16", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_11", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_17", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u8003\u52E4\u767B\u8BB0\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_12", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_18", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5185\u52E4\u5DE5\u4F5C\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_13", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_19", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u7533\u62A5\u5185\u52E4\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_14", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_20", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5916\u52E4\u5DE5\u4F5C\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_15", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_21", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5DE5\u4F5C\u65F6\u95F4\u8C03\u51CF" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_16", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_22", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5DE5\u65F6\u8C03\u6574\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_17", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_23", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u8BA1\u7B97\u6709\u6548\u5DE5\u65F6" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_18", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_24", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u786E\u8BA4\u6709\u6548\u5DE5\u65F6" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_19", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_25", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u662F\u5426\u8BA4\u5B9A\u8FDF\u5230" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_20", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_26", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u662F\u5426\u8BA4\u5B9A\u65E9\u9000" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_21", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_27", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u662F\u5426\u8BA4\u5B9A\u79BB\u5C97" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_22", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_28", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u662F\u5426\u5DF2\u7ECF\u8BA4\u5B9A" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_23", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_29", parentPath: "M_Page_1.M_Form_3.M_Form_4", label: "\u5176\u5B83\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_24", parentPath: "M_Page_1.M_Form_3.M_Form_4", type: "string" })
									)
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

	return CM_Form_4;
}(React.PureComponent);

function CM_Form_4_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_3.M_Form_4', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_4_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_4 = ReactRedux.connect(CM_Form_4_mapstatetoprops, CM_Form_4_disptchtoprops)(CM_Form_4);

var CM_Form_6 = function (_React$PureComponent13) {
	_inherits(CM_Form_6, _React$PureComponent13);

	function CM_Form_6(props) {
		_classCallCheck(this, CM_Form_6);

		var _this13 = _possibleConstructorReturn(this, (CM_Form_6.__proto__ || Object.getPrototypeOf(CM_Form_6)).call(this, props));

		ERPC_PageForm(_this13);
		return _this13;
	}

	_createClass(CM_Form_6, [{
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
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(
								"div",
								{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
								React.createElement(
									"div",
									{ className: "d-flex flex-grow-1  flex-column" },
									React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_30", parentPath: "M_Page_1.M_Form_3.M_Form_6", type: "string" })
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

	return CM_Form_6;
}(React.PureComponent);

function CM_Form_6_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_3.M_Form_6', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_6_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_6 = ReactRedux.connect(CM_Form_6_mapstatetoprops, CM_Form_6_disptchtoprops)(CM_Form_6);

var CM_Form_7 = function (_React$PureComponent14) {
	_inherits(CM_Form_7, _React$PureComponent14);

	function CM_Form_7(props) {
		_classCallCheck(this, CM_Form_7);

		var _this14 = _possibleConstructorReturn(this, (CM_Form_7.__proto__ || Object.getPrototypeOf(CM_Form_7)).call(this, props));

		ERPC_PageForm(_this14);
		return _this14;
	}

	_createClass(CM_Form_7, [{
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
								React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_1.M_Form_3.M_Form_7", type: "string", linetype: "single" })
							),
							this.renderNavigater()
						);
					}
				}
			}
			return retElem;
		}
	}]);

	return CM_Form_7;
}(React.PureComponent);

function CM_Form_7_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_3.M_Form_7', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = true;
	return retProps;
}
function CM_Form_7_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_7 = ReactRedux.connect(CM_Form_7_mapstatetoprops, CM_Form_7_disptchtoprops)(CM_Form_7);

var CM_Form_5 = function (_React$PureComponent15) {
	_inherits(CM_Form_5, _React$PureComponent15);

	function CM_Form_5(props) {
		_classCallCheck(this, CM_Form_5);

		var _this15 = _possibleConstructorReturn(this, (CM_Form_5.__proto__ || Object.getPrototypeOf(CM_Form_5)).call(this, props));

		ERPC_GridForm(_this15);
		_this15.tableBodyScroll = _this15.tableBodyScroll.bind(_this15);
		return _this15;
	}

	_createClass(CM_Form_5, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "tableBodyScroll",
		value: function tableBodyScroll(ev) {
			document.getElementById('M_Form_5tableheader').scrollLeft = ev.target.scrollLeft;
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
							retElem = React.createElement(CM_Form_5_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
							if (this.props.pagebreak) {
								navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
							}
						}
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column ", style: M_Form_5_style },
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
					{ id: "M_Form_5tableheader", className: "mw-100 hidenOverflow flex-shrink-0" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_5_headtableStyle },
						React.createElement(CM_Form_5_THead, null)
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

	return CM_Form_5;
}(React.PureComponent);

function CM_Form_5_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_3.M_Form_5', {});
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
function CM_Form_5_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_5 = ReactRedux.connect(CM_Form_5_mapstatetoprops, CM_Form_5_disptchtoprops)(CM_Form_5);

var CM_Form_5_THead = function (_React$PureComponent16) {
	_inherits(CM_Form_5_THead, _React$PureComponent16);

	function CM_Form_5_THead(props) {
		_classCallCheck(this, CM_Form_5_THead);

		return _possibleConstructorReturn(this, (CM_Form_5_THead.__proto__ || Object.getPrototypeOf(CM_Form_5_THead)).call(this, props));
	}

	_createClass(CM_Form_5_THead, [{
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
						{ scope: "col", style: M_Form_5headstyle0 },
						"\u5F00\u59CB\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle0 },
						"\u7ED3\u675F\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle0 },
						"\u8BB0\u5F55\u79CD\u7C7B"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle1 },
						"\u5F00\u59CB\u5730\u70B9"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle1 },
						"\u7ED3\u675F\u5730\u70B9"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_5_THead;
}(React.PureComponent);

var CM_Form_5_TBody = function (_React$PureComponent17) {
	_inherits(CM_Form_5_TBody, _React$PureComponent17);

	function CM_Form_5_TBody(props) {
		_classCallCheck(this, CM_Form_5_TBody);

		return _possibleConstructorReturn(this, (CM_Form_5_TBody.__proto__ || Object.getPrototypeOf(CM_Form_5_TBody)).call(this, props));
	}

	_createClass(CM_Form_5_TBody, [{
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
						{ style: M_Form_5tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_25", parentPath: "M_Page_1.M_Form_3.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_26", parentPath: "M_Page_1.M_Form_3.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_27", parentPath: "M_Page_1.M_Form_3.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_28", parentPath: "M_Page_1.M_Form_3.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_29", parentPath: "M_Page_1.M_Form_3.M_Form_5", type: "string" })
					)
				));
			}
			return React.createElement(
				"table",
				{ className: "table table-striped table-hover ", style: M_Form_5_tableStyle },
				React.createElement(CM_Form_5_THead, null),
				React.createElement(
					"tbody",
					null,
					trElems_arr
				)
			);
		}
	}]);

	return CM_Form_5_TBody;
}(React.PureComponent);

var CM_Page_2 = function (_React$PureComponent18) {
	_inherits(CM_Page_2, _React$PureComponent18);

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
					"\u8003\u52E4\u7BA1\u7406"
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
					{ className: "btn-group-vertical d-flex flex-grow-1 flex-shrink-1 erp-control flex-column " },
					React.createElement(
						"button",
						{ className: "btn btn-primary erp-control ", id: "button_3", onClick: button_3_onclick },
						"\u8003\u52E4\u8865\u767B"
					),
					React.createElement(
						"button",
						{ className: "btn btn-primary erp-control ", id: "button_4", onClick: button_4_onclick },
						"\u8003\u52E4\u8BA4\u5B9A"
					)
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

gCusValidChecker_map['M_Text_1'] = M_Text_1_validchecker;
gCusValidChecker_map['M_Text_5'] = M_Text_5_validchecker;
gCusValidChecker_map['M_Text_2'] = M_Text_2_validchecker;
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
