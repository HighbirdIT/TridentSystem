"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_1headstyle0 = { "width": "20%", "maxWidth": "20%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle0 = { "width": "20%", "maxWidth": "20%" };
var M_Form_1headstyle1 = { "width": "10%", "maxWidth": "10%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle1 = { "width": "10%", "maxWidth": "10%" };
var M_Form_1headstyle2 = { "width": "50%", "maxWidth": "50%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle2 = { "width": "50%", "maxWidth": "50%" };
var M_Form_1_tableStyle = { "marginTop": "-50px" };
var M_Form_1_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/KXZF';
var thisAppTitle = '款项支付';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_1Page: bind_M_Form_1Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_0.M_Form_0.M_Form_1.pageIndex': bind_M_Form_1.bind(window), 'M_Page_1.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_1.M_Form_2.recordIndex': bind_M_Form_2.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_2';
	switch (flowStep) {
		case 29:
			{
				targetPageID = 'M_Page_1';
				break;
			}
		case 31:
			{
				targetPageID = 'M_Page_0';
				break;
			}
		case 32:
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
	setTimeout(function () {
		pull_M_Form_1();
	}, 50);
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
	needSetState['M_Label_9.text'] = M_Label_9_textfield_get(retState, bundle);
	needSetState['M_Dropdown_1.value'] = M_Dropdown_1_defaultvalue_get(retState, bundle);
	needSetState['M_Text_2.value'] = null;
	needSetState['M_Dropdown_2.value'] = M_Dropdown_2_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_3.value'] = M_Dropdown_3_defaultvalue_get(retState, bundle);
	needSetState['M_Text_5.value'] = null;
	needSetState['M_Dropdown_0.value'] = M_Dropdown_0_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_4.text'] = null;
	needSetState['M_Dropdown_4.value'] = null;
	needSetState['M_Text_7.value'] = null;
	needSetState['M_Text_8.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_0(retState);
	return retState;
}
function M_Label_9_textfield_get(state, bundle) {
	return g_envVar.username;
}
function M_Dropdown_1_defaultvalue_get(state, bundle) {
	return 0;
}
function pull_M_Dropdown_1() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_2_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
	if (nowValue <= 0) {
		return '金额不能小于0';
	}
}
function M_Dropdown_2_defaultvalue_get(state, bundle) {
	return 0;
}
function pull_M_Dropdown_2() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_2' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_2', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Dropdown_3_defaultvalue_get(state, bundle) {
	return 2;
}
function pull_M_Dropdown_3() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_3' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_3', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Dropdown_0_defaultvalue_get(state, bundle) {
	return g_envVar.companyCode;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_4() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_4' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_4', 'options_arr', false), EFetchKey.FetchPropValue));
}
function button_1_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Dropdown_1_value = M_Dropdown_1_state.value;
	var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
	var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
	var M_Text_2_value = M_Text_2_state.value;
	var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
	var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
	var M_Dropdown_2_value = M_Dropdown_2_state.value;
	var M_Dropdown_3_state = getStateByPath(M_Form_0_state, 'M_Dropdown_3', {});
	var M_LC_4_state = getStateByPath(M_Form_0_state, 'M_LC_4', {});
	var M_Dropdown_3_value = M_Dropdown_3_state.value;
	var M_Text_5_state = getStateByPath(M_Form_0_state, 'M_Text_5', {});
	var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
	var M_Text_5_value = M_Text_5_state.value;
	var M_Dropdown_4_state = getStateByPath(M_Form_0_state, 'M_Dropdown_4', {});
	var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
	var M_Dropdown_4_value = M_Dropdown_4_state.value;
	var M_Text_7_state = getStateByPath(M_Form_0_state, 'M_Text_7', {});
	var M_LC_7_state = getStateByPath(M_Form_0_state, 'M_LC_7', {});
	var M_Text_7_value = M_Text_7_state.value;
	var M_Text_8_state = getStateByPath(M_Form_0_state, 'M_Text_8', {});
	var M_LC_8_state = getStateByPath(M_Form_0_state, 'M_LC_8', {});
	var M_Text_8_value = M_Text_8_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_6_msg = null;
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
			if (scriptBP_6_msg) {
				scriptBP_6_msg.setData(err.info, EMessageBoxType.Error, '登记提交 ');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_6_msg) {
			scriptBP_6_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Text_2_state, M_Text_2_value, 'float', false, 'M_Text_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_3_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_4_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_3.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_5_state, M_Text_5_state, M_Text_5_value, 'string', false, 'M_Text_5', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_5.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_6_state, M_Dropdown_4_state, M_Dropdown_4_value, 'string', false, 'M_Dropdown_4', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_4.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_7_state, M_Text_7_state, M_Text_7_value, 'string', false, 'M_Text_7', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_7.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_8_state, M_Text_8_state, M_Text_8_value, 'string', false, 'M_Text_8', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_8.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_6_msg = PopMessageBox('', EMessageBoxType.Loading, '登记提交 ');;
	var bundle_querysql_0 = {
		员工代码: g_envVar.userid
	};
	setTimeout(function () {
		if (fetchTracer['button_1_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_6_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var bundle_insert_table_0 = {
				M_Dropdown_4_value: M_Dropdown_4_value,
				经办员工姓名代码: g_envVar.userid,
				M_Dropdown_1_value: M_Dropdown_1_value,
				M_Text_7_value: M_Text_7_value,
				M_Text_8_value: M_Text_8_value,
				M_Text_2_value: M_Text_2_value,
				M_Dropdown_2_value: M_Dropdown_2_value,
				M_Dropdown_3_value: M_Dropdown_3_value,
				M_Text_5_value: M_Text_5_value,
				入帐公司名称代码: data_querysql_0
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_1_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
					if (err_insert_table_0 == null) {
						fresh_M_Form_0(state);
						setTimeout(function () {
							pull_M_Form_1();
						}, 50);
						var ret = callback_final(state, data_insert_table_0, null);
						return ret == null ? state : ret;
					} else {
						return callback_final(state, data_insert_table_0, err_insert_table_0);
					}
				})));
			}, 50);
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
	var bundle = {};
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
		needSetState['row_' + rowIndex + '.M_Label_0.text'] = nowRecord['项目登记名称'];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['申请支付金额'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['记录状态'];
		needSetState['row_' + rowIndex + '.M_Label_3.text'] = nowRecord['事由要求用途'];
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
	needSetState['M_LC_18.visible'] = M_LC_18_isdisplay_get(retState, bundle);
	needSetState['M_Text_0.value'] = '同意';
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_2_nowRecord = nowRecord;
		needSetState['M_Label_4.text'] = nowRecord['经办员工姓名'];
		needSetState['M_Label_5.text'] = nowRecord['项目登记名称'];
		needSetState['M_Label_8.text'] = nowRecord['申请支付金额'];
		needSetState['M_Label_12.text'] = nowRecord['结算货币种类'];
		needSetState['M_Label_10.text'] = nowRecord['对方银行账号'];
		needSetState['M_Label_14.text'] = nowRecord['入帐公司名称'];
		needSetState['M_Label_11.text'] = nowRecord['直接支付事由'];
		needSetState['M_Label_6.text'] = nowRecord['事由要求用途'];
		needSetState['M_Label_7.text'] = nowRecord['金额数量详述'];
		needSetState['M_Label_15.text'] = M_Label_15_textfield_get(retState, bundle);
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_2', needSetState);
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
function M_Label_15_textfield_get(state, bundle) {
	var M_Form_2_nowRecord = bundle != null && bundle.M_Form_2_nowRecord != null ? bundle.M_Form_2_nowRecord : getStateByPath(state, 'M_Page_1.M_Form_2.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.text = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_1.M_Form_2.M_Label_15', needSetState);
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Label_15_textfield_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_1.M_Form_2.M_Label_15', { fetching: true, fetchingErr: null });
	if (M_Form_2_nowRecord['审核确认状态'] == 0) {
		return '';
	} else {
		var bundle_querysql_0 = {
			员工工号: M_Form_2_nowRecord['审核确认用户']
		};
		setTimeout(function () {
			if (fetchTracer['M_Label_15_textfield_get'] != fetchid) return;
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_16_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
				if (error_querysql_0) {
					return callback_final(state, null, error_querysql_0);
				}
				var ret = callback_final(state, data_querysql_0 + '在' + getFormatDateString(castDate(M_Form_2_nowRecord['登记确认时间'])) + (M_Form_2_nowRecord['审核确认状态'] == 1 ? '审核同意' : '审核拒绝') + ',说明:' + M_Form_2_nowRecord['审核确认说明'], null);
				return ret == null ? state : ret;
			}, false)));
		}, 50);
	}
}
function M_LC_18_isdisplay_get(state, bundle) {}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_1.M_Form_2', {});
	var M_Text_0_state = getStateByPath(M_Form_2_state, 'M_Text_0', {});
	var M_LC_18_state = getStateByPath(M_Form_2_state, 'M_LC_18', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_2_nowRecord = getStateByPath(M_Form_2_state, 'nowRecord');
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
				scriptBP_8_msg.setData(err.info, EMessageBoxType.Error, '审核同意');
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
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_18_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_1.M_Form_2.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_8_msg = PopMessageBox('', EMessageBoxType.Loading, '审核同意');;
	if (M_Form_2_nowRecord['审核确认状态'] == 1) {
		var bundle_update_table_1 = {
			RCDKEY: M_Form_2_nowRecord['直接支付记录代码'],
			复核确认状态: 1,
			复核确认说明: M_Text_0_value,
			M_Form_2_直接支付记录代码: M_Form_2_nowRecord['直接支付记录代码'],
			M_Form_2_审核确认状态: M_Form_2_nowRecord['审核确认状态']
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_1, action: 'button_0_onclick_update_table_1' }, makeFTD_Callback(function (state, data_update_table_1, err_update_table_1) {
				if (err_update_table_1 == null) {
					setTimeout(function () {
						pull_M_Form_2();
					}, 50);
					var ret = callback_final(state, 1, null);
					return ret == null ? state : ret;
				} else {
					return callback_final(state, data_update_table_1, err_update_table_1);
				}
			})));
		}, 50);
	} else {
		var bundle_update_table_0 = {
			RCDKEY: M_Form_2_nowRecord['直接支付记录代码'],
			审核确认说明: M_Text_0_value,
			审核确认状态: 1,
			M_Form_2_直接支付记录代码: M_Form_2_nowRecord['直接支付记录代码'],
			M_Form_2_审核确认状态: M_Form_2_nowRecord['审核确认状态']
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_0_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
				if (err_update_table_0 == null) {
					setTimeout(function () {
						pull_M_Form_2();
					}, 50);
					var ret = callback_final(state, 1, null);
					return ret == null ? state : ret;
				} else {
					return callback_final(state, data_update_table_0, err_update_table_0);
				}
			})));
		}, 50);
	}
}
function button_2_onclick() {
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_1.M_Form_2', {});
	var M_Text_0_state = getStateByPath(M_Form_2_state, 'M_Text_0', {});
	var M_LC_18_state = getStateByPath(M_Form_2_state, 'M_LC_18', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_2_nowRecord = getStateByPath(M_Form_2_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_9_msg = null;
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
			if (scriptBP_9_msg) {
				scriptBP_9_msg.setData(err.info, EMessageBoxType.Error, '审核拒绝');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_9_msg) {
			scriptBP_9_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_18_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_1.M_Form_2.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_2_onclick'] = fetchid;
	scriptBP_9_msg = PopMessageBox('', EMessageBoxType.Loading, '审核拒绝');;
	if (M_Text_0_value == '同意') {
		var ret = callback_final(state, null, { info: '审核拒绝请给出原因说明' });
		return ret == null ? state : ret;
	} else {
		if (M_Form_2_nowRecord['审核确认状态'] == 1) {
			var bundle_update_table_1 = {
				RCDKEY: M_Form_2_nowRecord['直接支付记录代码'],
				复核确认状态: 2,
				复核确认说明: M_Text_0_value,
				M_Form_2_审核确认状态: M_Form_2_nowRecord['审核确认状态'],
				M_Form_2_直接支付记录代码: M_Form_2_nowRecord['直接支付记录代码']
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_1, action: 'button_2_onclick_update_table_1' }, makeFTD_Callback(function (state, data_update_table_1, err_update_table_1) {
					if (err_update_table_1 == null) {
						setTimeout(function () {
							pull_M_Form_2();
						}, 50);
						var ret = callback_final(state, data_update_table_1, null);
						return ret == null ? state : ret;
					} else {
						return callback_final(state, data_update_table_1, err_update_table_1);
					}
				})));
			}, 50);
		} else {
			var bundle_update_table_0 = {
				RCDKEY: M_Form_2_nowRecord['直接支付记录代码'],
				审核确认说明: M_Text_0_value,
				审核确认状态: 2,
				M_Form_2_审核确认状态: M_Form_2_nowRecord['审核确认状态'],
				M_Form_2_直接支付记录代码: M_Form_2_nowRecord['直接支付记录代码']
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
	}
}
function active_M_Page_2(state) {
	state.nowPage = 'M_Page_2';
	if (gDataCache.get('M_Page_2_opened')) {
		return state;
	}
	gDataCache.set('M_Page_2_opened', 1);
	setTimeout(function () {}, 50);
	state = bind_M_Form_3(state);
	return state;
}
function fresh_M_Form_3(retState, records_arr) {
	bind_M_Form_3(retState);
}
function bind_M_Form_3(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_3', {});
	var needSetState = {};
	var bundle = {};
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_3', needSetState);
	return retState;
}
function pull_M_Form_3(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_3(retState);
	return retState;
}
function button_3_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_0'));
	}, 50);
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
					"\u76F4\u63A5\u652F\u4ED8 "
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
									{ id: "M_LC_0", parentPath: "M_Page_0.M_Form_0", label: "\u7ECF\u529E\u4EBA\u5458" },
									React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_0.M_Form_0", type: "string" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_1", parentPath: "M_Page_0.M_Form_0", label: "\u9879\u76EE\u540D\u79F0" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: "M_Page_0.M_Form_0", groupAttr: "\u9879\u76EE\u8FD0\u884C\u9636\u6BB5,\u9879\u76EE\u72B6\u6001\u540D\u79F0,\u9879\u76EE\u5E94\u7528\u9886\u57DF", pullDataSource: pull_M_Dropdown_1, textAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0", valueAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0\u4EE3\u7801", label: "\u9879\u76EE\u540D\u79F0" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_2", parentPath: "M_Page_0.M_Form_0", label: "\u7533\u8BF7\u652F\u4ED8\u91D1\u989D" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_2", parentPath: "M_Page_0.M_Form_0", type: "float", precision: "2" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_3", parentPath: "M_Page_0.M_Form_0", label: "\u8D27\u5E01\u79CD\u7C7B" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_2", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_2, textAttrName: "\u7ED3\u7B97\u8D27\u5E01\u79CD\u7C7B", valueAttrName: "\u7ED3\u7B97\u8D27\u5E01\u79CD\u7C7B\u4EE3\u7801", label: "\u8D27\u5E01\u79CD\u7C7B" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_4", parentPath: "M_Page_0.M_Form_0", label: "\u652F\u4ED8\u65B9\u5F0F" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_3", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_3, textAttrName: "\u6536\u652F\u65B9\u5F0F\u79CD\u7C7B", valueAttrName: "\u6536\u652F\u65B9\u5F0F\u79CD\u7C7B\u4EE3\u7801", label: "\u652F\u4ED8\u65B9\u5F0F" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_5", parentPath: "M_Page_0.M_Form_0", label: "\u5BF9\u65B9\u94F6\u884C\u8D26\u53F7" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_5", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_23", parentPath: "M_Page_0.M_Form_0", label: "\u4ED8\u6B3E\u516C\u53F8\u540D\u79F0" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u6240\u5C5E\u516C\u53F8\u540D\u79F0", valueAttrName: "\u6240\u5C5E\u516C\u53F8\u540D\u79F0\u4EE3\u7801", label: "\u4ED8\u6B3E\u516C\u53F8\u540D\u79F0" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_6", parentPath: "M_Page_0.M_Form_0", label: "\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_4", parentPath: "M_Page_0.M_Form_0", pullDataSource: pull_M_Dropdown_4, textAttrName: "\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531", valueAttrName: "\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531\u4EE3\u7801", label: "\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_7", parentPath: "M_Page_0.M_Form_0", label: "\u4E8B\u7531\u8981\u6C42\u7528\u9014" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_7", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "1x" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_8", parentPath: "M_Page_0.M_Form_0", label: "\u91D1\u989D\u6570\u91CF\u8BE6\u8FF0" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_8", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "1x" })
								),
								React.createElement(
									VisibleERPC_Button,
									{ className: "btn btn-primary erp-control ", id: "button_1", parentPath: "M_Page_0.M_Form_0", onClick: button_1_onclick },
									"\u767B\u8BB0\u63D0\u4EA4"
								),
								React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_0.M_Form_0", title: "\u6700\u8FD1\u76F4\u63A5\u652F\u4ED8\u8BB0\u5F55", pagebreak: false, reBindAT: "ReBindM_Form_1Page" })
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
						"\u9879\u76EE\u540D\u79F0"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle1 },
						"\u652F\u4ED8\u91D1\u989D"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u8BB0\u5F55\u72B6\u6001"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle2 },
						"\u4E8B\u7531\u8981\u6C42\u7528\u9014"
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
						{ style: M_Form_1tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_1", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "int" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_2", parentPath: "M_Page_0.M_Form_0.M_Form_1", type: "string" })
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
					"\u76F4\u63A5\u652F\u4ED8\u5BA1\u6838"
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
										{ id: "M_LC_13", parentPath: "M_Page_1.M_Form_2", label: "\u7ECF\u529E\u5458\u5DE5\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_4", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_14", parentPath: "M_Page_1.M_Form_2", label: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_5", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_17", parentPath: "M_Page_1.M_Form_2", label: "\u7533\u8BF7\u652F\u4ED8\u91D1\u989D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_21", parentPath: "M_Page_1.M_Form_2", label: "\u7ED3\u7B97\u8D27\u5E01\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_12", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_19", parentPath: "M_Page_1.M_Form_2", label: "\u5BF9\u65B9\u94F6\u884C\u8D26\u53F7" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_10", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_22", parentPath: "M_Page_1.M_Form_2", label: "\u5165\u5E10\u516C\u53F8\u540D\u79F0" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_14", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_20", parentPath: "M_Page_1.M_Form_2", label: "\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_11", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_15", parentPath: "M_Page_1.M_Form_2", label: "\u4E8B\u7531\u8981\u6C42\u7528\u9014" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_6", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_16", parentPath: "M_Page_1.M_Form_2", label: "\u91D1\u989D\u6570\u91CF\u8BE6\u8FF0" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_7", parentPath: "M_Page_1.M_Form_2", type: "string" })
									),
									React.createElement(VisibleERPC_Label, { className: "text-info erp-control ", id: "M_Label_15", parentPath: "M_Page_1.M_Form_2", type: "string" }),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_18", parentPath: "M_Page_1.M_Form_2", label: "\u786E\u8BA4\u8BF4\u660E" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_1.M_Form_2", type: "string", linetype: "single" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
										React.createElement(
											VisibleERPC_Button,
											{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_0", parentPath: "M_Page_1.M_Form_2", onClick: button_0_onclick },
											"\u5BA1\u6838\u540C\u610F"
										),
										React.createElement(
											VisibleERPC_Button,
											{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_2", parentPath: "M_Page_1.M_Form_2", onClick: button_2_onclick },
											"\u5BA1\u6838\u62D2\u7EDD"
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

var CM_Page_2 = function (_React$PureComponent9) {
	_inherits(CM_Page_2, _React$PureComponent9);

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
					"\u6B3E\u9879\u652F\u4ED8"
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
				React.createElement(VisibleCM_Form_3, { id: "M_Form_3", parentPath: "M_Page_2" })
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
								React.createElement(
									"div",
									{ className: "btn-group-vertical d-flex flex-grow-1 flex-shrink-1 erp-control " },
									React.createElement(
										VisibleERPC_Button,
										{ className: "btn btn-primary erp-control ", id: "button_3", parentPath: "M_Page_2.M_Form_3", onClick: button_3_onclick },
										"\u76F4\u63A5\u652F\u4ED8\u767B\u8BB0"
									),
									React.createElement(
										VisibleERPC_Button,
										{ className: "btn btn-primary erp-control ", id: "button_4", parentPath: "M_Page_2.M_Form_3" },
										"\u96F6\u661F\u652F\u4ED8\u767B\u8BB0"
									)
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
	var ctlState = getStateByPath(state, 'M_Page_2.M_Form_3', {});
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
