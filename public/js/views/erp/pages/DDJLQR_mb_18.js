"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_1_style = { "minHeight": "300px" };
var M_Form_1headstyle0 = { "width": "25%", "maxWidth": "25%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle0 = { "width": "25%", "maxWidth": "25%" };
var M_Form_1_tableStyle = { "marginTop": "-50px" };
var M_Form_1_headtableStyle = { "marginBottom": "0px" };
var M_Form_3headstyle0 = { "width": "14.3%", "maxWidth": "14.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_3tdstyle0 = { "width": "14.3%", "maxWidth": "14.3%" };
var M_Form_3headstyle1 = { "width": "28.6%", "maxWidth": "28.6%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_3tdstyle1 = { "width": "28.6%", "maxWidth": "28.6%" };
var M_Form_3_tableStyle = { "marginTop": "-50px" };
var M_Form_3_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/DDJLQR';
var thisAppTitle = '滴滴记录确认';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_1Page: bind_M_Form_1Page.bind(window), ReBindM_Form_3Page: bind_M_Form_3Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.recordIndex': bind_M_Form_0.bind(window), 'M_Page_0.M_Form_0.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_0.M_Form_0.M_Form_1.pageIndex': bind_M_Form_1.bind(window), 'M_Page_1.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_1.M_Form_2.recordIndex': bind_M_Form_2.bind(window), 'M_Page_1.M_Form_2.M_Form_3.records_arr': fresh_M_Form_3.bind(window), 'M_Page_1.M_Form_2.M_Form_3.pageIndex': bind_M_Form_3.bind(window) };
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
		case 'M_Page_1':
			{
				retState = active_M_Page_1(retState);
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
	setTimeout(function () {
		pull_M_Form_0();
	}, 50);
	return state;
}
function fresh_M_Form_0(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_0.M_Form_0', bind_M_Form_0);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_0_nowRecord = nowRecord;
		needSetState['M_Label_4.text'] = nowRecord['实际车型'];
		needSetState['M_Label_5.text'] = nowRecord['下单人姓名'];
		needSetState['M_Label_6.text'] = nowRecord['订单总金额'];
		needSetState['M_Label_7.text'] = nowRecord['企业实付金额'];
		needSetState['M_Label_8.text'] = nowRecord['个人实付金额'];
		needSetState['M_Label_9.text'] = nowRecord['用券抵扣金额'];
		needSetState['M_Label_10.text'] = nowRecord['实际里程数'];
		needSetState['M_Label_11.text'] = nowRecord['开始计费时间'];
		needSetState['M_Label_12.text'] = nowRecord['结束计费时间'];
		needSetState['M_Label_13.text'] = nowRecord['时长'];
		needSetState['M_Label_14.text'] = nowRecord['用车城市'];
		needSetState['M_Label_15.text'] = nowRecord['出发地地址'];
		needSetState['M_Label_16.text'] = nowRecord['目的地地址'];
		needSetState['M_Label_17.text'] = nowRecord['下单人员工ID'];
		needSetState['M_Text_0.value'] = nowRecord['用车备注说明'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	pull_M_Form_1(retState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_0' }, makeFTD_Prop('M_Page_0', 'M_Form_0', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Label_17_state = getStateByPath(M_Form_0_state, 'M_Label_17', {});
	var M_LC_17_state = getStateByPath(M_Form_0_state, 'M_LC_17', {});
	var M_Label_17_text = M_Label_17_state.text;
	var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
	var M_LC_18_state = getStateByPath(M_Form_0_state, 'M_LC_18', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_0_nowRecord = getStateByPath(M_Form_0_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_0_msg = null;
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
			if (scriptBP_0_msg) {
				scriptBP_0_msg.setData(err.info, EMessageBoxType.Error, '工作用车');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_0_msg) {
			scriptBP_0_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_0_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_18_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_0_msg = PopMessageBox('', EMessageBoxType.Loading, '工作用车');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_0_nowRecord['滴滴乘车记录代码'],
		M_Label_17_text: M_Label_17_text,
		用车确认状态: 1,
		M_Text_0_value: M_Text_0_value,
		M_Form_0_滴滴乘车记录代码: M_Form_0_nowRecord['滴滴乘车记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_0_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_0();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function button_1_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Label_17_state = getStateByPath(M_Form_0_state, 'M_Label_17', {});
	var M_LC_17_state = getStateByPath(M_Form_0_state, 'M_LC_17', {});
	var M_Label_17_text = M_Label_17_state.text;
	var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
	var M_LC_18_state = getStateByPath(M_Form_0_state, 'M_LC_18', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_0_nowRecord = getStateByPath(M_Form_0_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_1_msg = null;
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
			if (scriptBP_1_msg) {
				scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '私人用车');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_1_msg) {
			scriptBP_1_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_0_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_18_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '私人用车');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_0_nowRecord['滴滴乘车记录代码'],
		M_Label_17_text: M_Label_17_text,
		用车确认状态: 2,
		M_Text_0_value: M_Text_0_value
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_1_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_0();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
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
	var M_Form_0_nowRecord = getStateByPath(state, 'M_Page_0.M_Form_0.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_0_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_0.M_Form_1.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.下单人员工ID_12623 = M_Form_0_nowRecord.下单人员工ID;
	bundle.开始计费时间_12623 = M_Form_0_nowRecord.开始计费时间;
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
		needSetState['row_' + rowIndex + '.M_Label_0.text'] = nowRecord['记录种类名称'];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['记录开始时间'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['记录结束时间'];
		needSetState['row_' + rowIndex + '.M_Label_3.text'] = nowRecord['记录开始地点'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0.M_Form_1', needSetState);
}
function active_M_Page_1(state) {
	state.nowPage = 'M_Page_1';
	if (gDataCache.get('M_Page_1_opened')) {
		return state;
	}
	gDataCache.set('M_Page_1_opened', 1);
	setTimeout(function () {
		pull_M_Form_2();
	}, 50);
	return state;
}
function fresh_M_Form_2(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_1.M_Form_2', bind_M_Form_2);
}
function bind_M_Form_2(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_2', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_2_nowRecord = nowRecord;
		needSetState['M_Label_18.text'] = nowRecord['下单人姓名'];
		needSetState['M_Label_19.text'] = nowRecord['订单总金额'];
		needSetState['M_Label_20.text'] = nowRecord['个人实付金额'];
		needSetState['M_Label_21.text'] = nowRecord['企业实付金额'];
		needSetState['M_Label_24.text'] = nowRecord['实际里程数'];
		needSetState['M_Label_22.text'] = nowRecord['用券抵扣金额'];
		needSetState['M_Label_27.text'] = nowRecord['用车城市'];
		needSetState['M_Label_25.text'] = nowRecord['出发地地址'];
		needSetState['M_Label_26.text'] = nowRecord['目的地地址'];
		needSetState['M_Label_28.text'] = nowRecord['开始计费时间'];
		needSetState['M_Label_29.text'] = nowRecord['结束计费时间'];
		needSetState['M_Label_23.text'] = nowRecord['用车备注说明'];
		needSetState['M_Text_1.value'] = nowRecord['审核确认说明'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_2', needSetState);
	pull_M_Form_3(retState);
	return retState;
}
function pull_M_Form_2(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_2' }, makeFTD_Prop('M_Page_1', 'M_Form_2', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function button_2_onclick() {
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_1.M_Form_2', {});
	var M_Text_1_state = getStateByPath(M_Form_2_state, 'M_Text_1', {});
	var M_LC_31_state = getStateByPath(M_Form_2_state, 'M_LC_31', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Form_2_nowRecord = getStateByPath(M_Form_2_state, 'nowRecord');
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
				scriptBP_2_msg.setData(err.info, EMessageBoxType.Error, '同意');
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
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_31_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
	validErrState['M_Page_1.M_Form_2.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_2_onclick'] = fetchid;
	scriptBP_2_msg = PopMessageBox('', EMessageBoxType.Loading, '同意');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_2_nowRecord['滴滴乘车记录代码'],
		审核确认状态: 1,
		M_Text_1_value: M_Text_1_value,
		M_Form_2_滴滴乘车记录代码: M_Form_2_nowRecord['滴滴乘车记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_2_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_2();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function button_3_onclick() {
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_1.M_Form_2', {});
	var M_Text_1_state = getStateByPath(M_Form_2_state, 'M_Text_1', {});
	var M_LC_31_state = getStateByPath(M_Form_2_state, 'M_LC_31', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Form_2_nowRecord = getStateByPath(M_Form_2_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_3_msg = null;
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
			if (scriptBP_3_msg) {
				scriptBP_3_msg.setData(err.info, EMessageBoxType.Error, '不同意');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_3_msg) {
			scriptBP_3_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_31_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
	validErrState['M_Page_1.M_Form_2.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_3_onclick'] = fetchid;
	scriptBP_3_msg = PopMessageBox('', EMessageBoxType.Loading, '不同意');;
	if (M_Text_1_value == '无') {
		var ret = callback_final(state, null, { info: '请给出拒绝的理由' });
		return ret == null ? state : ret;
	} else {
		var bundle_update_table_0 = {
			RCDKEY: M_Form_2_nowRecord['滴滴乘车记录代码'],
			审核确认状态: 2,
			M_Text_1_value: M_Text_1_value,
			M_Form_2_滴滴乘车记录代码: M_Form_2_nowRecord['滴滴乘车记录代码']
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_3_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
				if (err_update_table_0 == null) {
					setTimeout(function () {
						pull_M_Form_2();
					}, 50);
					var ret = callback_final(state, data_update_table_0, null);
					return ret == null ? state : ret;
				} else {
					return callback_final(state, data_update_table_0, err_update_table_0);
				}
			})));
		}, 50);
	}
}
function fresh_M_Form_3(retState, records_arr) {
	bind_M_Form_3(retState);
}
function bind_M_Form_3(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_2.M_Form_3', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_2.M_Form_3', needSetState);
	return bind_M_Form_3Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_2.M_Form_3', needSetState);
	return retState;
}
function pull_M_Form_3(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_2_nowRecord = getStateByPath(state, 'M_Page_1.M_Form_2.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_2.M_Form_3.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_2.M_Form_3.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_2.M_Form_3.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_2.M_Form_3.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.下单人员工ID_12623 = M_Form_2_nowRecord.下单人员工ID;
	bundle.开始计费时间_12623 = M_Form_2_nowRecord.开始计费时间;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_3' }, makeFTD_Prop('M_Page_1.M_Form_2', 'M_Form_3', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_3Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_2.M_Form_3', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_30.text'] = nowRecord['记录种类名称'];
		needSetState['row_' + rowIndex + '.M_Label_31.text'] = nowRecord['记录开始时间'];
		needSetState['row_' + rowIndex + '.M_Label_32.text'] = nowRecord['记录结束时间'];
		needSetState['row_' + rowIndex + '.M_Label_33.text'] = nowRecord['记录开始地点'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_1.M_Form_2.M_Form_3', needSetState);
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
					"\u6EF4\u6EF4\u8BB0\u5F55\u786E\u8BA4"
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
									{ className: "d-flex flex-grow-1  flex-column autoScroll_Touch" },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_0", parentPath: "M_Page_0.M_Form_0", label: "\u53EB\u8F66\u7C7B\u578B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_4", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_1", parentPath: "M_Page_0.M_Form_0", label: "\u5458\u5DE5\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_5", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_2", parentPath: "M_Page_0.M_Form_0", label: "\u8BA2\u5355\u603B\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_6", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_3", parentPath: "M_Page_0.M_Form_0", label: "\u4F01\u4E1A\u652F\u4ED8\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_7", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_4", parentPath: "M_Page_0.M_Form_0", label: "\u4E2A\u4EBA\u652F\u4ED8\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_5", parentPath: "M_Page_0.M_Form_0", label: "\u7528\u52B5\u62B5\u6263\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_6", parentPath: "M_Page_0.M_Form_0", label: "\u8FD0\u884C\u516C\u91CC" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_10", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_7", parentPath: "M_Page_0.M_Form_0", label: "\u8D77\u59CB\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_11", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_8", parentPath: "M_Page_0.M_Form_0", label: "\u7ED3\u675F\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_12", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_9", parentPath: "M_Page_0.M_Form_0", label: "\u8FD0\u884C\u5206\u949F\u6570" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_13", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_11", parentPath: "M_Page_0.M_Form_0", label: "\u7528\u8F66\u57CE\u5E02" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_14", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_12", parentPath: "M_Page_0.M_Form_0", label: "\u51FA\u53D1\u5730\u5740" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_15", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_10", parentPath: "M_Page_0.M_Form_0", label: "\u7ED3\u675F\u5730\u5740" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_16", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_17", parentPath: "M_Page_0.M_Form_0", label: "\u4E0B\u5355\u4EBA\u5458\u5DE5ID", visible: false },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_17", parentPath: "M_Page_0.M_Form_0", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_18", parentPath: "M_Page_0.M_Form_0", label: "\u7528\u8F66\u5907\u6CE8\u8BF4\u660E" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "1x" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_0", onClick: button_0_onclick },
											"\u5DE5\u4F5C\u7528\u8F66"
										),
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_1", onClick: button_1_onclick },
											"\u79C1\u4EBA\u7528\u8F66"
										)
									),
									React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_0.M_Form_0", title: "\u5F53\u65E5\u884C\u8E2A", pagebreak: false, reBindAT: "ReBindM_Form_1Page" })
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
				{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column ", style: M_Form_1_style },
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
						"\u8BB0\u5F55\u79CD\u7C7B\u540D\u79F0"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u8BB0\u5F55\u5F00\u59CB\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u8BB0\u5F55\u7ED3\u675F\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u8BB0\u5F55\u5F00\u59CB\u5730\u70B9"
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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_0", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
					),
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

var CM_Page_1 = function (_React$PureComponent7) {
	_inherits(CM_Page_1, _React$PureComponent7);

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
					"\u56E0\u516C\u5BA1\u6838"
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
				React.createElement(VisibleCM_Form_2, { id: "M_Form_2", parentPath: "M_Page_1" })
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

var CM_Form_2 = function (_React$PureComponent8) {
	_inherits(CM_Form_2, _React$PureComponent8);

	function CM_Form_2(props) {
		_classCallCheck(this, CM_Form_2);

		var _this8 = _possibleConstructorReturn(this, (CM_Form_2.__proto__ || Object.getPrototypeOf(CM_Form_2)).call(this, props));

		ERPC_PageForm(_this8);
		return _this8;
	}

	_createClass(CM_Form_2, [{
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
										{ id: "M_LC_19", parentPath: "M_Page_1.M_Form_2", label: "\u4E0B\u5355\u4EBA\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_18", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_20", parentPath: "M_Page_1.M_Form_2", label: "\u8BA2\u5355\u603B\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_19", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_21", parentPath: "M_Page_1.M_Form_2", label: "\u4E2A\u4EBA\u5B9E\u4ED8\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_20", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_22", parentPath: "M_Page_1.M_Form_2", label: "\u4F01\u4E1A\u5B9E\u4ED8\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_21", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_25", parentPath: "M_Page_1.M_Form_2", label: "\u5B9E\u9645\u91CC\u7A0B\u6570" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_24", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_23", parentPath: "M_Page_1.M_Form_2", label: "\u7528\u5238\u62B5\u6263\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_22", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_28", parentPath: "M_Page_1.M_Form_2", label: "\u7528\u8F66\u57CE\u5E02" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_27", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_26", parentPath: "M_Page_1.M_Form_2", label: "\u51FA\u53D1\u5730\u5730\u5740" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_25", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_27", parentPath: "M_Page_1.M_Form_2", label: "\u76EE\u7684\u5730\u5730\u5740" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_26", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_29", parentPath: "M_Page_1.M_Form_2", label: "\u5F00\u59CB\u8BA1\u8D39\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_28", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_30", parentPath: "M_Page_1.M_Form_2", label: "\u7ED3\u675F\u8BA1\u8D39\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_29", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_24", parentPath: "M_Page_1.M_Form_2", label: "\u7528\u8F66\u5907\u6CE8\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_23", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_31", parentPath: "M_Page_1.M_Form_2", label: "\u5BA1\u6838\u786E\u8BA4\u8BF4\u660E" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_1.M_Form_2", type: "string", linetype: "1x" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-shrink-0 d-flex flex-grow-1 erp-control " },
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_2", onClick: button_2_onclick },
											"\u540C\u610F"
										),
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_3", onClick: button_3_onclick },
											"\u4E0D\u540C\u610F"
										)
									),
									React.createElement(VisibleCM_Form_3, { id: "M_Form_3", parentPath: "M_Page_1.M_Form_2", pagebreak: false, reBindAT: "ReBindM_Form_3Page" })
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

	return CM_Form_2;
}(React.PureComponent);

function CM_Form_2_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_2', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_2_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_2 = ReactRedux.connect(CM_Form_2_mapstatetoprops, CM_Form_2_disptchtoprops)(CM_Form_2);

var CM_Form_3 = function (_React$PureComponent9) {
	_inherits(CM_Form_3, _React$PureComponent9);

	function CM_Form_3(props) {
		_classCallCheck(this, CM_Form_3);

		var _this9 = _possibleConstructorReturn(this, (CM_Form_3.__proto__ || Object.getPrototypeOf(CM_Form_3)).call(this, props));

		ERPC_GridForm(_this9);
		_this9.tableBodyScroll = _this9.tableBodyScroll.bind(_this9);
		return _this9;
	}

	_createClass(CM_Form_3, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = this.renderContent();
			return retElem;
		}
	}, {
		key: "tableBodyScroll",
		value: function tableBodyScroll(ev) {
			document.getElementById('M_Form_3tableheader').scrollLeft = ev.target.scrollLeft;
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
							retElem = React.createElement(CM_Form_3_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
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
					{ id: "M_Form_3tableheader", className: "mw-100 hidenOverflow flex-shrink-0" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_3_headtableStyle },
						React.createElement(CM_Form_3_THead, null)
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

	return CM_Form_3;
}(React.PureComponent);

function CM_Form_3_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_2.M_Form_3', {});
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
function CM_Form_3_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_3 = ReactRedux.connect(CM_Form_3_mapstatetoprops, CM_Form_3_disptchtoprops)(CM_Form_3);

var CM_Form_3_THead = function (_React$PureComponent10) {
	_inherits(CM_Form_3_THead, _React$PureComponent10);

	function CM_Form_3_THead(props) {
		_classCallCheck(this, CM_Form_3_THead);

		return _possibleConstructorReturn(this, (CM_Form_3_THead.__proto__ || Object.getPrototypeOf(CM_Form_3_THead)).call(this, props));
	}

	_createClass(CM_Form_3_THead, [{
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
						{ scope: "col", style: M_Form_3headstyle0 },
						"\u79CD\u7C7B"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_3headstyle1 },
						"\u5F00\u59CB\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_3headstyle1 },
						"\u7ED3\u675F\u65F6\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_3headstyle1 },
						"\u5F00\u59CB\u5730\u70B9"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_3_THead;
}(React.PureComponent);

var CM_Form_3_TBody = function (_React$PureComponent11) {
	_inherits(CM_Form_3_TBody, _React$PureComponent11);

	function CM_Form_3_TBody(props) {
		_classCallCheck(this, CM_Form_3_TBody);

		return _possibleConstructorReturn(this, (CM_Form_3_TBody.__proto__ || Object.getPrototypeOf(CM_Form_3_TBody)).call(this, props));
	}

	_createClass(CM_Form_3_TBody, [{
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
						{ style: M_Form_3tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_30", parentPath: "M_Page_1.M_Form_2.M_Form_3", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_3tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_31", parentPath: "M_Page_1.M_Form_2.M_Form_3", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_3tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_32", parentPath: "M_Page_1.M_Form_2.M_Form_3", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_3tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_33", parentPath: "M_Page_1.M_Form_2.M_Form_3", type: "string" })
					)
				));
			}
			return React.createElement(
				"table",
				{ className: "table table-striped table-hover ", style: M_Form_3_tableStyle },
				React.createElement(CM_Form_3_THead, null),
				React.createElement(
					"tbody",
					null,
					trElems_arr
				)
			);
		}
	}]);

	return CM_Form_3_TBody;
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