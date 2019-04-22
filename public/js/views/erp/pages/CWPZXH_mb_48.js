'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/CWPZXH';
var thisAppTitle = '财务凭证校核';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.recordIndex': bind_M_Form_0.bind(window), 'M_Page_2.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_2.M_Form_1.recordIndex': bind_M_Form_1.bind(window), 'M_Page_3.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_3.M_Form_2.recordIndex': bind_M_Form_2.bind(window), 'M_Page_2.M_Dropdown_0.text': M_Dropdown_0_text_changed.bind(window), 'M_Page_2.M_CheckBox_0.value': M_CheckBox_0_value_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_1';
	switch (flowStep) {
		case 19:
			{
				targetPageID = 'M_Page_3';
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
		case 'M_Page_3':
			{
				retState = active_M_Page_3(retState);
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
	needSetState['M_Text_2.value'] = '无';
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_0_nowRecord = nowRecord;
		needSetState['M_Label_0.text'] = nowRecord['凭证统计年份'];
		needSetState['M_Label_1.text'] = nowRecord['凭证统计月份'];
		needSetState['M_Label_2.text'] = nowRecord['凭证种类名称'];
		needSetState['M_Label_10.text'] = nowRecord['凭证流水号码'];
		needSetState['M_Label_26.text'] = nowRecord['子目流水号码'];
		needSetState['M_Label_3.text'] = nowRecord['关联员工姓名'];
		needSetState['M_Label_4.text'] = nowRecord['关联项目名称'];
		needSetState['M_Label_5.text'] = nowRecord['关联客户名称'];
		needSetState['M_Label_6.text'] = nowRecord['记帐发生金额'];
		needSetState['M_Label_7.text'] = nowRecord['借方科目全称'];
		needSetState['M_Label_8.text'] = nowRecord['贷方科目全称'];
		needSetState['M_Text_0.value'] = nowRecord['借方摘要'];
		needSetState['M_Text_1.value'] = nowRecord['贷方摘要'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
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
	var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
	var M_LC_10_state = getStateByPath(M_Form_0_state, 'M_LC_10', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_9_state = getStateByPath(M_Form_0_state, 'M_LC_9', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
	var M_LC_30_state = getStateByPath(M_Form_0_state, 'M_LC_30', {});
	var M_Text_2_value = M_Text_2_state.value;
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
				scriptBP_0_msg.setData(err.info, EMessageBoxType.Error, '提交修改');
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
	validErr = BaseIsValueValid(state, M_LC_10_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_9_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_30_state, M_Text_2_state, M_Text_2_value, 'string', false, 'M_Text_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_0_msg = PopMessageBox('', EMessageBoxType.Loading, '提交修改');;
	if (M_Text_0_value == M_Form_0_nowRecord['借方摘要'] && M_Form_0_nowRecord['贷方摘要'] == M_Text_1_value) {
		var ret = callback_final(state, null, { info: '没有做任何编辑。' });
		return ret == null ? state : ret;
	} else {
		var bundle_insert_table_0 = {
			财务凭证记录代码: M_Form_0_nowRecord['财务凭证记录代码'],
			借方明细记录代码: M_Form_0_nowRecord['借方明细记录代码'],
			贷方明细记录代码: M_Form_0_nowRecord['贷方明细记录代码'],
			原始借方摘要: M_Form_0_nowRecord['借方摘要'],
			M_Text_0_value: M_Text_0_value,
			原始贷方摘要: M_Form_0_nowRecord['贷方摘要'],
			M_Text_1_value: M_Text_1_value,
			M_Text_2_value: M_Text_2_value,
			校核确认状态: 1
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_0_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
				if (err_insert_table_0 == null) {
					setTimeout(function () {
						pull_M_Form_0();
					}, 50);
					var ret = callback_final(state, data_insert_table_0, null);
					return ret == null ? state : ret;
				} else {
					return callback_final(state, data_insert_table_0, err_insert_table_0);
				}
			})));
		}, 50);
	}
}
function button_1_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
	var M_LC_30_state = getStateByPath(M_Form_0_state, 'M_LC_30', {});
	var M_Text_2_value = M_Text_2_state.value;
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
				scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '不做修改');
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
	validErr = BaseIsValueValid(state, M_LC_30_state, M_Text_2_state, M_Text_2_value, 'string', false, 'M_Text_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '不做修改');;
	var bundle_insert_table_0 = {
		财务凭证记录代码: M_Form_0_nowRecord['财务凭证记录代码'],
		借方明细记录代码: M_Form_0_nowRecord['借方明细记录代码'],
		贷方明细记录代码: M_Form_0_nowRecord['贷方明细记录代码'],
		原始借方摘要: M_Form_0_nowRecord['借方摘要'],
		校核借方摘要: M_Form_0_nowRecord['借方摘要'],
		原始贷方摘要: M_Form_0_nowRecord['贷方摘要'],
		校核贷方摘要: M_Form_0_nowRecord['贷方摘要'],
		M_Text_2_value: M_Text_2_value,
		校核确认状态: 2
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_1_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
			if (err_insert_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_0();
				}, 50);
				var ret = callback_final(state, data_insert_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_insert_table_0, err_insert_table_0);
			}
		})));
	}, 50);
}
function active_M_Page_1(state) {
	state.nowPage = 'M_Page_1';
	if (gDataCache.get('M_Page_1_opened')) {
		return state;
	}
	gDataCache.set('M_Page_1_opened', 1);
	setTimeout(function () {}, 50);
	return state;
}
function button_2_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_0'));
	}, 50);
}
function button_3_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_2'));
	}, 50);
}
function active_M_Page_2(state) {
	var needSetState = {};
	state.nowPage = 'M_Page_2';
	if (gDataCache.get('M_Page_2_opened')) {
		return state;
	}
	gDataCache.set('M_Page_2_opened', 1);
	needSetState['M_Page_2.M_Dropdown_0.text'] = null;
	needSetState['M_Page_2.M_Dropdown_0.value'] = null;
	needSetState['M_Page_2.M_CheckBox_0.value'] = '1';
	state = setManyStateByPath(state, '', needSetState);
	setTimeout(function () {}, 50);
	return state;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_2', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
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
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_1_nowRecord = nowRecord;
		needSetState['M_Label_11.text'] = nowRecord['凭证统计年份'];
		needSetState['M_Label_12.text'] = nowRecord['凭证统计月份'];
		needSetState['M_Label_13.text'] = nowRecord['凭证种类名称'];
		needSetState['M_Label_14.text'] = nowRecord['凭证流水号码'];
		needSetState['M_Label_25.text'] = nowRecord['子目流水号码'];
		needSetState['M_Label_15.text'] = nowRecord['借方科目全称'];
		needSetState['M_Label_16.text'] = nowRecord['贷方科目全称'];
		needSetState['M_Label_17.text'] = nowRecord['关联员工姓名'];
		needSetState['M_Label_18.text'] = nowRecord['关联项目名称'];
		needSetState['M_Label_20.text'] = nowRecord['关联客户名称'];
		needSetState['M_Label_19.text'] = nowRecord['记帐发生金额'];
		needSetState['M_Label_21.text'] = nowRecord['原始借方摘要'];
		needSetState['M_Label_23.text'] = nowRecord['原始贷方摘要'];
		needSetState['M_Label_9.text'] = nowRecord['贷方摘要'];
		needSetState['M_Label_24.text'] = nowRecord['校核确认时间'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1', needSetState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Dropdown_0_state = getStateByPath(state, 'M_Page_2.M_Dropdown_0');
	var M_Dropdown_0_text = M_Dropdown_0_state.text;
	var M_CheckBox_0_state = getStateByPath(state, 'M_Page_2.M_CheckBox_0');
	var M_CheckBox_0_value = M_CheckBox_0_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_Dropdown_0_state, M_Dropdown_0_state, M_Dropdown_0_text, 'date', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_CheckBox_0_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
	validErrState['M_Page_2.M_CheckBox_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.M_Dropdown_0_text = M_Dropdown_0_text;
	bundle.M_CheckBox_0_value = M_CheckBox_0_value;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_1' }, makeFTD_Prop('M_Page_2', 'M_Form_1', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function active_M_Page_3(state) {
	state.nowPage = 'M_Page_3';
	if (gDataCache.get('M_Page_3_opened')) {
		return state;
	}
	gDataCache.set('M_Page_3_opened', 1);
	setTimeout(function () {
		pull_M_Form_2();
	}, 50);
	return state;
}
function fresh_M_Form_2(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_3.M_Form_2', bind_M_Form_2);
}
function bind_M_Form_2(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_3.M_Form_2', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_2_nowRecord = nowRecord;
		needSetState['M_Label_27.text'] = nowRecord['凭证统计年份'];
		needSetState['M_Label_28.text'] = nowRecord['凭证统计月份'];
		needSetState['M_Label_29.text'] = nowRecord['凭证种类名称'];
		needSetState['M_Label_30.text'] = nowRecord['凭证流水号码'];
		needSetState['M_Label_31.text'] = nowRecord['子目流水号码'];
		needSetState['M_Label_32.text'] = nowRecord['借方科目全称'];
		needSetState['M_Label_33.text'] = nowRecord['贷方科目全称'];
		needSetState['M_Label_34.text'] = nowRecord['关联员工姓名'];
		needSetState['M_Label_35.text'] = nowRecord['关联项目名称'];
		needSetState['M_Label_36.text'] = nowRecord['关联客户名称'];
		needSetState['M_Label_37.text'] = nowRecord['记帐发生金额'];
		needSetState['M_Label_38.text'] = nowRecord['原始借方摘要'];
		needSetState['M_Label_39.text'] = nowRecord['借方摘要'];
		needSetState['M_Label_40.text'] = nowRecord['原始贷方摘要'];
		needSetState['M_Label_41.text'] = nowRecord['贷方摘要'];
		needSetState['M_Label_44.text'] = nowRecord['备注说明'];
		needSetState['M_Label_42.text'] = nowRecord['校核用户姓名'];
		needSetState['M_Label_43.text'] = nowRecord['校核确认时间'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_3.M_Form_2', needSetState);
	return retState;
}
function pull_M_Form_2(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_2' }, makeFTD_Prop('M_Page_3', 'M_Form_2', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function button_4_onclick() {
	var state = store.getState();
	var M_Form_2_nowRecord = getStateByPath(state, 'M_Page_3.M_Form_2.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_4_msg = null;
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
			if (scriptBP_4_msg) {
				scriptBP_4_msg.setData(err.info, EMessageBoxType.Error, '查阅确认');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_4_msg) {
			scriptBP_4_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_4_onclick'] = fetchid;
	scriptBP_4_msg = PopMessageBox('', EMessageBoxType.Loading, '查阅确认');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_2_nowRecord['凭证摘要校核代码'],
		查看确认状态: 1
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_4_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
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
function M_Dropdown_0_text_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	if (delayActs['call_pull_M_Form_1'] == null) {
		delayActs['call_pull_M_Form_1'] = { callfun: pull_M_Form_1 };
	};
	return setManyStateByPath(state, '', needSetState);
}
function M_CheckBox_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
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
				case 'M_Page_3':
					{
						pageElem = React.createElement(VisibleCM_Page_3, null);
						break;
					}
			}
			retElem = React.createElement(
				'div',
				{ className: 'w-100 h-100' },
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
			var routeElem = pageRouter.length > 1 ? React.createElement('i', { className: 'fa fa-arrow-left' }) : null;
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					{ onClick: pageRoute_Back },
					routeElem,
					'\u6458\u8981\u5BA1\u6838'
				)
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column fixPageContent ' },
				React.createElement(VisibleCM_Form_0, { id: 'M_Form_0', parentPath: 'M_Page_0' })
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
								'div',
								{ className: 'm-auto' },
								'\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E'
							);
						} else {
							retElem = React.createElement(
								'div',
								{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
								React.createElement(
									'div',
									{ className: 'd-flex flex-grow-1  flex-column autoScroll_Touch' },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_0', parentPath: 'M_Page_0.M_Form_0', label: '\u51ED\u8BC1\u7EDF\u8BA1\u5E74\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_0', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_1', parentPath: 'M_Page_0.M_Form_0', label: '\u51ED\u8BC1\u7EDF\u8BA1\u6708\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_2', parentPath: 'M_Page_0.M_Form_0', label: '\u51ED\u8BC1\u79CD\u7C7B\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_2', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_11', parentPath: 'M_Page_0.M_Form_0', label: '\u51ED\u8BC1\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_10', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_29', parentPath: 'M_Page_0.M_Form_0', label: '\u5B50\u76EE\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_26', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_3', parentPath: 'M_Page_0.M_Form_0', label: '\u5173\u8054\u5458\u5DE5\u59D3\u540D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_3', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_4', parentPath: 'M_Page_0.M_Form_0', label: '\u5173\u8054\u9879\u76EE\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_4', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_5', parentPath: 'M_Page_0.M_Form_0', label: '\u5173\u8054\u5BA2\u6237\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_5', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_6', parentPath: 'M_Page_0.M_Form_0', label: '\u8BB0\u5E10\u53D1\u751F\u91D1\u989D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_6', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_7', parentPath: 'M_Page_0.M_Form_0', label: '\u501F\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_7', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_8', parentPath: 'M_Page_0.M_Form_0', label: '\u8D37\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_8', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_10', parentPath: 'M_Page_0.M_Form_0', label: '\u6458\u8981\u501F\u65B9' },
										React.createElement(VisibleERPC_Text, { id: 'M_Text_0', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '2x' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_9', parentPath: 'M_Page_0.M_Form_0', label: '\u8D37\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Text, { id: 'M_Text_1', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '2x' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_30', parentPath: 'M_Page_0.M_Form_0', label: '\u6821\u6838\u5907\u6CE8\u8BF4\u660E' },
										React.createElement(VisibleERPC_Text, { id: 'M_Text_2', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single' })
									),
									React.createElement(
										'div',
										{ className: 'btn-group flex-grow-0 flex-shrink-0 d-flex erp-control ' },
										React.createElement(
											'button',
											{ className: 'flex-grow-1 btn btn-success erp-control ', id: 'button_0', onClick: button_0_onclick },
											'\u63D0\u4EA4\u4FEE\u6539'
										),
										React.createElement(
											'button',
											{ className: 'flex-grow-1 btn btn-secondary erp-control ', id: 'button_1', onClick: button_1_onclick },
											'\u4E0D\u505A\u4FEE\u6539'
										)
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

var CM_Page_1 = function (_React$PureComponent4) {
	_inherits(CM_Page_1, _React$PureComponent4);

	function CM_Page_1(props) {
		_classCallCheck(this, CM_Page_1);

		return _possibleConstructorReturn(this, (CM_Page_1.__proto__ || Object.getPrototypeOf(CM_Page_1)).call(this, props));
	}

	_createClass(CM_Page_1, [{
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
			var routeElem = pageRouter.length > 1 ? React.createElement('i', { className: 'fa fa-arrow-left' }) : null;
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					{ onClick: pageRoute_Back },
					routeElem,
					'\u9009\u62E9\u64CD\u4F5C'
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
					{ className: 'btn-group-vertical btn-group-lg d-flex flex-grow-1 flex-shrink-1 erp-control flex-column ' },
					React.createElement(
						'button',
						{ className: 'btn btn-primary erp-control ', id: 'button_2', onClick: button_2_onclick },
						'\u5BA1\u6838\u6210\u672C\u51ED\u8BC1\u6458\u8981'
					),
					React.createElement(
						'button',
						{ className: 'btn btn-primary erp-control ', id: 'button_3', onClick: button_3_onclick },
						'\u5DF2\u5BA1\u6210\u672C\u51ED\u8BC1\u67E5\u770B'
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
			var routeElem = pageRouter.length > 1 ? React.createElement('i', { className: 'fa fa-arrow-left' }) : null;
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					{ onClick: pageRoute_Back },
					routeElem,
					'\u5DF2\u7533\u6458\u8981\u67E5\u770B'
				)
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column fixPageContent ' },
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_12', parentPath: 'M_Page_2', label: '\u5BA1\u6838\u65E5\u671F' },
					React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_0', parentPath: 'M_Page_2', textType: 'date', pullDataSource: pull_M_Dropdown_0, textAttrName: '\u5BA1\u6838\u65E5\u671F', label: '\u5BA1\u6838\u65E5\u671F' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_27', parentPath: 'M_Page_2', label: '\u7F16\u8F91\u8FC7\u7684' },
					React.createElement(VisibleERPC_CheckBox, { id: 'M_CheckBox_0', parentPath: 'M_Page_2' })
				),
				React.createElement(VisibleCM_Form_1, { id: 'M_Form_1', parentPath: 'M_Page_2' })
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

var CM_Form_1 = function (_React$PureComponent6) {
	_inherits(CM_Form_1, _React$PureComponent6);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this6 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_PageForm(_this6);
		return _this6;
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
								'div',
								{ className: 'm-auto' },
								'\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E'
							);
						} else {
							retElem = React.createElement(
								'div',
								{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
								React.createElement(
									'div',
									{ className: 'd-flex flex-grow-1  flex-column autoScroll_Touch' },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_13', parentPath: 'M_Page_2.M_Form_1', label: '\u51ED\u8BC1\u7EDF\u8BA1\u5E74\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_11', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_14', parentPath: 'M_Page_2.M_Form_1', label: '\u51ED\u8BC1\u7EDF\u8BA1\u6708\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_12', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_15', parentPath: 'M_Page_2.M_Form_1', label: '\u51ED\u8BC1\u79CD\u7C7B\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_13', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_16', parentPath: 'M_Page_2.M_Form_1', label: '\u51ED\u8BC1\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_14', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_28', parentPath: 'M_Page_2.M_Form_1', label: '\u5B50\u76EE\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_25', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_17', parentPath: 'M_Page_2.M_Form_1', label: '\u501F\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_15', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_18', parentPath: 'M_Page_2.M_Form_1', label: '\u8D37\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_16', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_19', parentPath: 'M_Page_2.M_Form_1', label: '\u5173\u8054\u5458\u5DE5\u59D3\u540D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_17', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_20', parentPath: 'M_Page_2.M_Form_1', label: '\u5173\u8054\u9879\u76EE\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_18', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_22', parentPath: 'M_Page_2.M_Form_1', label: '\u5173\u8054\u5BA2\u6237\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_20', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_21', parentPath: 'M_Page_2.M_Form_1', label: '\u8BB0\u5E10\u53D1\u751F\u91D1\u989D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_19', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_23', parentPath: 'M_Page_2.M_Form_1', label: '\u65E7\u501F\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_21', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_24', parentPath: 'M_Page_2.M_Form_1', label: '\u65B0\u501F\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_22', parentPath: 'M_Page_2.M_Form_1', type: 'string', text: '\u65B0\u501F\u65B9\u6458\u8981' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_25', parentPath: 'M_Page_2.M_Form_1', label: '\u65E7\u8D37\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_23', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_31', parentPath: 'M_Page_2.M_Form_1', label: '\u65B0\u8D37\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_9', parentPath: 'M_Page_2.M_Form_1', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_26', parentPath: 'M_Page_2.M_Form_1', label: '\u4FEE\u6539\u65F6\u95F4' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_24', parentPath: 'M_Page_2.M_Form_1', type: 'date' })
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

var CM_Page_3 = function (_React$PureComponent7) {
	_inherits(CM_Page_3, _React$PureComponent7);

	function CM_Page_3(props) {
		_classCallCheck(this, CM_Page_3);

		return _possibleConstructorReturn(this, (CM_Page_3.__proto__ || Object.getPrototypeOf(CM_Page_3)).call(this, props));
	}

	_createClass(CM_Page_3, [{
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
			var routeElem = pageRouter.length > 1 ? React.createElement('i', { className: 'fa fa-arrow-left' }) : null;
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					{ onClick: pageRoute_Back },
					routeElem,
					'\u786E\u8BA4\u6458\u8981\u4FEE\u6539'
				)
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column fixPageContent ' },
				React.createElement(VisibleCM_Form_2, { id: 'M_Form_2', parentPath: 'M_Page_3' })
			);
			return retElem;
		}
	}]);

	return CM_Page_3;
}(React.PureComponent);

function CM_Page_3_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_3_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_3 = ReactRedux.connect(CM_Page_3_mapstatetoprops, CM_Page_3_disptchtoprops)(CM_Page_3);

var CM_Form_2 = function (_React$PureComponent8) {
	_inherits(CM_Form_2, _React$PureComponent8);

	function CM_Form_2(props) {
		_classCallCheck(this, CM_Form_2);

		var _this8 = _possibleConstructorReturn(this, (CM_Form_2.__proto__ || Object.getPrototypeOf(CM_Form_2)).call(this, props));

		ERPC_PageForm(_this8);
		return _this8;
	}

	_createClass(CM_Form_2, [{
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
								'div',
								{ className: 'm-auto' },
								'\u6240\u6709\u4FEE\u6539\u90FD\u786E\u8BA4\u5B8C\u4E86'
							);
						} else {
							retElem = React.createElement(
								'div',
								{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
								React.createElement(
									'div',
									{ className: 'd-flex flex-grow-1  flex-column autoScroll_Touch' },
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_32', parentPath: 'M_Page_3.M_Form_2', label: '\u51ED\u8BC1\u7EDF\u8BA1\u5E74\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_27', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_33', parentPath: 'M_Page_3.M_Form_2', label: '\u51ED\u8BC1\u7EDF\u8BA1\u6708\u4EFD' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_28', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_34', parentPath: 'M_Page_3.M_Form_2', label: '\u51ED\u8BC1\u79CD\u7C7B\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_29', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_35', parentPath: 'M_Page_3.M_Form_2', label: '\u51ED\u8BC1\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_30', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_36', parentPath: 'M_Page_3.M_Form_2', label: '\u5B50\u76EE\u6D41\u6C34\u53F7\u7801' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_31', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_37', parentPath: 'M_Page_3.M_Form_2', label: '\u501F\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_32', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_38', parentPath: 'M_Page_3.M_Form_2', label: '\u8D37\u65B9\u79D1\u76EE\u5168\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_33', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_39', parentPath: 'M_Page_3.M_Form_2', label: '\u5173\u8054\u5458\u5DE5\u59D3\u540D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_34', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_40', parentPath: 'M_Page_3.M_Form_2', label: '\u5173\u8054\u9879\u76EE\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_35', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_41', parentPath: 'M_Page_3.M_Form_2', label: '\u5173\u8054\u5BA2\u6237\u540D\u79F0' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_36', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_42', parentPath: 'M_Page_3.M_Form_2', label: '\u8BB0\u5E10\u53D1\u751F\u91D1\u989D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_37', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_43', parentPath: 'M_Page_3.M_Form_2', label: '\u539F\u59CB\u501F\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_38', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_44', parentPath: 'M_Page_3.M_Form_2', label: '\u501F\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_39', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_45', parentPath: 'M_Page_3.M_Form_2', label: '\u539F\u59CB\u8D37\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_40', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_46', parentPath: 'M_Page_3.M_Form_2', label: '\u8D37\u65B9\u6458\u8981' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_41', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_49', parentPath: 'M_Page_3.M_Form_2', label: '\u5907\u6CE8\u8BF4\u660E' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_44', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_47', parentPath: 'M_Page_3.M_Form_2', label: '\u6821\u6838\u7528\u6237\u59D3\u540D' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_42', parentPath: 'M_Page_3.M_Form_2', type: 'string' })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: 'M_LC_48', parentPath: 'M_Page_3.M_Form_2', label: '\u6821\u6838\u786E\u8BA4\u65F6\u95F4' },
										React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_43', parentPath: 'M_Page_3.M_Form_2', type: 'date' })
									),
									React.createElement(
										'button',
										{ className: 'flex-shrink-0 btn btn-primary erp-control ', id: 'button_4', onClick: button_4_onclick },
										'\u67E5\u9605\u786E\u8BA4'
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

	return CM_Form_2;
}(React.PureComponent);

function CM_Form_2_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_3.M_Form_2', {});
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