"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_0headstyle0 = { "width": "10%", "maxWidth": "10%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle0 = { "width": "10%", "maxWidth": "10%" };
var M_Form_0headstyle1 = { "width": "40%", "maxWidth": "40%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle1 = { "width": "40%", "maxWidth": "40%" };
var M_Form_0headstyle2 = { "width": "50%", "maxWidth": "50%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle2 = { "width": "50%", "maxWidth": "50%" };
var M_Form_0_tableStyle = { "marginTop": "-50px" };
var M_Form_0_headtableStyle = { "marginBottom": "0px" };
var M_Form_3_style = { "minHeight": "300px" };
var M_Form_3headstyle0 = { "width": "10%", "maxWidth": "10%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_3tdstyle0 = { "width": "10%", "maxWidth": "10%" };
var M_Form_3headstyle1 = { "width": "40%", "maxWidth": "40%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_3tdstyle1 = { "width": "40%", "maxWidth": "40%" };
var M_Form_3headstyle2 = { "width": "50%", "maxWidth": "50%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_3tdstyle2 = { "width": "50%", "maxWidth": "50%" };
var M_Form_3_tableStyle = { "marginTop": "-50px" };
var M_Form_3_headtableStyle = { "marginBottom": "0px" };
var M_Form_5headstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_5tdstyle0 = { "width": "33.3%", "maxWidth": "33.3%" };
var M_Form_5_tableStyle = { "marginTop": "-50px" };
var M_Form_5_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/QJJCC';
var thisAppTitle = '请假及出差';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window), ReBindM_Form_3Page: bind_M_Form_3Page.bind(window), ReBindM_Form_5Page: bind_M_Form_5Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_2.M_Form_1.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_Form_0.pageIndex': bind_M_Form_0.bind(window), 'M_Page_0.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_0.M_Form_2.recordIndex': bind_M_Form_2.bind(window), 'M_Page_0.M_Form_2.M_Form_3.records_arr': fresh_M_Form_3.bind(window), 'M_Page_0.M_Form_2.M_Form_3.pageIndex': bind_M_Form_3.bind(window), 'M_Page_1.M_Form_4.M_Form_5.records_arr': fresh_M_Form_5.bind(window), 'M_Page_1.M_Form_4.M_Form_5.pageIndex': bind_M_Form_5.bind(window), 'M_Page_4.M_Form_6.records_arr': fresh_M_Form_6.bind(window), 'M_Page_4.M_Form_6.recordIndex': bind_M_Form_6.bind(window), 'M_Page_6.M_Form_8.records_arr': fresh_M_Form_8.bind(window), 'M_Page_6.M_Form_8.recordIndex': bind_M_Form_8.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_0.value': M_Dropdown_0_value_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_1.value': M_Dropdown_1_value_changed.bind(window), 'M_Page_2.M_Form_1.M_LC_3.visible': M_LC_3_visible_changed.bind(window), 'M_Page_0.M_Form_2.M_LC_14.visible': M_LC_14_visible_changed.bind(window), 'M_Page_1.M_Form_4.M_Dropdown_2.value': M_Dropdown_2_value_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_0.text': M_Dropdown_0_text_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_3';
	switch (flowStep) {
		case 10:
			{
				targetPageID = 'M_Page_0';
				break;
			}
		case 12:
			{
				targetPageID = 'M_Page_4';
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
		case 'M_Page_2':
			{
				retState = active_M_Page_2(retState);
				break;
			}
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
		case 'M_Page_3':
			{
				retState = active_M_Page_3(retState);
				break;
			}
		case 'M_Page_4':
			{
				retState = active_M_Page_4(retState);
				break;
			}
		case 'M_Page_5':
			{
				retState = active_M_Page_5(retState);
				break;
			}
		case 'M_Page_6':
			{
				retState = active_M_Page_6(retState);
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
	setTimeout(function () {}, 50);
	state = bind_M_Form_1(state);
	return state;
}
function fresh_M_Form_1(retState, records_arr) {
	bind_M_Form_1(retState);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_1', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Dropdown_0.value'] = M_Dropdown_0_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_1.text'] = null;
	needSetState['M_Dropdown_1.value'] = null;
	needSetState['M_Text_1.value'] = M_Text_1_defaultvalue_get(retState, bundle);
	needSetState['M_Text_2.value'] = M_Text_2_defaultvalue_get(retState, bundle);
	needSetState['M_Text_3.value'] = M_Text_3_defaultvalue_get(retState, bundle);
	needSetState['M_Text_5.value'] = '17:30';
	needSetState['M_Text_6.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1', needSetState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_1(retState);
	return retState;
}
function M_Dropdown_0_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_2.M_Form_1', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
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
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Dropdown_0_state = getStateByPath(M_Form_1_state, 'M_Dropdown_0', {});
	var M_LC_0_state = getStateByPath(M_Form_1_state, 'M_LC_0', {});
	var M_Dropdown_0_value = M_Dropdown_0_state.value;
	var M_Dropdown_0_text = M_Dropdown_0_state.text;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_text, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.M_Dropdown_0_value = M_Dropdown_0_value;
	bundle.M_Dropdown_0_text = M_Dropdown_0_text;
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
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_2.M_Form_1.M_Form_0', needSetState);
}
function pull_M_Dropdown_1() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop('M_Page_2.M_Form_1', 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_4_defaultvalue_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Dropdown_0_state = getStateByPath(M_Form_1_state, 'M_Dropdown_0', {});
	var M_LC_0_state = getStateByPath(M_Form_1_state, 'M_LC_0', {});
	var M_Dropdown_0_value = bundle != null && bundle['M_Dropdown_0_value'] != null ? bundle['M_Dropdown_0_value'] : M_Dropdown_0_state.value;
	var M_Dropdown_1_state = getStateByPath(M_Form_1_state, 'M_Dropdown_1', {});
	var M_LC_1_state = getStateByPath(M_Form_1_state, 'M_LC_1', {});
	var M_Dropdown_1_value = bundle != null && bundle['M_Dropdown_1_value'] != null ? bundle['M_Dropdown_1_value'] : M_Dropdown_1_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.value = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Text_4', needSetState);
	};
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Text_4_defaultvalue_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Text_4', { fetching: true, fetchingErr: null });
	var bundle_queryfb_0 = {
		员工代码: M_Dropdown_0_value,
		假期种类代码: M_Dropdown_1_value
	};
	setTimeout(function () {
		if (fetchTracer['M_Text_4_defaultvalue_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_queryfb_0, action: 'queryfb_0' }, makeFTD_Callback(function (state, data_queryfb_0, error_queryfb_0) {
			if (error_queryfb_0) {
				return callback_final(state, null, error_queryfb_0);
			}
			var ret = callback_final(state, data_queryfb_0, null);
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function M_Text_1_validchecker(nowValue, comeState, comeValidErrState) {
	var startDate_1;
	var nowDate_1;
	var 间隔天_1;
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Dropdown_1_state = getStateByPath(M_Form_1_state, 'M_Dropdown_1', {});
	var M_LC_1_state = getStateByPath(M_Form_1_state, 'M_LC_1', {});
	var M_Dropdown_1_value = M_Dropdown_1_state.value;
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
	if (validErrState.hasOwnProperty('M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo')) {
		validErr = validErrState['M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo'];
	} else {
		validErr = BaseIsValueValid(comeState, M_LC_1_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
		validErrState['M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo'] = validErr;
	}
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	startDate_1 = new Date(nowValue);
	nowDate_1 = getNowDate();
	间隔天_1 = getDateDiff('天', startDate_1, nowDate_1);
	if (M_Dropdown_1_value == 11) {
		if (间隔天_1 > 0) {
			return '过去的临时假不能补请';
		} else {
			if (间隔天_1 < -2) {
				return '临时假只能请今明两天的。';
			}
		}
	} else {
		if (间隔天_1 > 2) {
			return '只能补2天之内的请假';
		}
	}
}
function M_Text_1_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function M_LC_3_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Dropdown_1_state = getStateByPath(M_Form_1_state, 'M_Dropdown_1', {});
	var M_LC_1_state = getStateByPath(M_Form_1_state, 'M_LC_1', {});
	var M_Dropdown_1_value = bundle != null && bundle['M_Dropdown_1_value'] != null ? bundle['M_Dropdown_1_value'] : M_Dropdown_1_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Dropdown_1_value == 11;
}
function M_Text_2_defaultvalue_get(state, bundle) {
	return getFormatTimeString(getNowDate(), false);
}
function M_LC_4_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : M_LC_3_state.visible;
	return M_LC_3_visible != true;
}
function M_Text_3_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Text_1_state = getStateByPath(M_Form_1_state, 'M_Text_1', {});
	var M_LC_2_state = getStateByPath(M_Form_1_state, 'M_LC_2', {});
	var M_Text_1_value = M_Text_1_state.value;
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
	if (validErrState.hasOwnProperty('M_Page_2.M_Form_1.M_Text_1.invalidInfo')) {
		validErr = validErrState['M_Page_2.M_Form_1.M_Text_1.invalidInfo'];
	} else {
		validErr = BaseIsValueValid(comeState, M_LC_2_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
		validErrState['M_Page_2.M_Form_1.M_Text_1.invalidInfo'] = validErr;
	}
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	if (getDateDiff('天', nowValue, M_Text_1_value) > 0) {
		return '必须大于等于起始日期';
	}
}
function M_Text_3_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function M_LC_6_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : M_LC_3_state.visible;
	return M_LC_3_visible;
}
function M_Text_5_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Text_2_state = getStateByPath(M_Form_1_state, 'M_Text_2', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_Text_2_value = M_Text_2_state.value;
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
	if (validErrState.hasOwnProperty('M_Page_2.M_Form_1.M_Text_2.invalidInfo')) {
		validErr = validErrState['M_Page_2.M_Form_1.M_Text_2.invalidInfo'];
	} else {
		validErr = BaseIsValueValid(comeState, M_LC_3_state, M_Text_2_state, M_Text_2_value, 'time', false, 'M_Text_2', validErrState);
		validErrState['M_Page_2.M_Form_1.M_Text_2.invalidInfo'] = validErr;
	}
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	if (getDateDiff('分', M_Text_2_value, nowValue) < 0) {
		return '结束时间必须大于起始时间。';
	}
}
function button_4_onclick() {
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Dropdown_0_state = getStateByPath(M_Form_1_state, 'M_Dropdown_0', {});
	var M_LC_0_state = getStateByPath(M_Form_1_state, 'M_LC_0', {});
	var M_Dropdown_0_value = M_Dropdown_0_state.value;
	var M_Dropdown_0_text = M_Dropdown_0_state.text;
	var M_Text_1_state = getStateByPath(M_Form_1_state, 'M_Text_1', {});
	var M_LC_2_state = getStateByPath(M_Form_1_state, 'M_LC_2', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Text_3_state = getStateByPath(M_Form_1_state, 'M_Text_3', {});
	var M_LC_4_state = getStateByPath(M_Form_1_state, 'M_LC_4', {});
	var M_Text_3_value = M_Text_3_state.value;
	var M_Dropdown_1_state = getStateByPath(M_Form_1_state, 'M_Dropdown_1', {});
	var M_LC_1_state = getStateByPath(M_Form_1_state, 'M_LC_1', {});
	var M_Dropdown_1_value = M_Dropdown_1_state.value;
	var M_Text_4_state = getStateByPath(M_Form_1_state, 'M_Text_4', {});
	var M_LC_5_state = getStateByPath(M_Form_1_state, 'M_LC_5', {});
	var M_Text_4_value = M_Text_4_state.value;
	var M_Text_2_state = getStateByPath(M_Form_1_state, 'M_Text_2', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_Text_2_value = M_Text_2_state.value;
	var M_Text_5_state = getStateByPath(M_Form_1_state, 'M_Text_5', {});
	var M_LC_6_state = getStateByPath(M_Form_1_state, 'M_LC_6', {});
	var M_Text_5_value = M_Text_5_state.value;
	var M_Text_6_state = getStateByPath(M_Form_1_state, 'M_Text_6', {});
	var M_LC_7_state = getStateByPath(M_Form_1_state, 'M_LC_7', {});
	var M_Text_6_value = M_Text_6_state.value;
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
				scriptBP_21_msg.setData(err.info, EMessageBoxType.Error, '提交申请');
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
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_text, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_4_state, M_Text_3_state, M_Text_3_value, 'date', false, 'M_Text_3', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_3.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_5_state, M_Text_4_state, M_Text_4_value, 'string', false, 'M_Text_4', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_4.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_3_state, M_Text_2_state, M_Text_2_value, 'time', false, 'M_Text_2', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_6_state, M_Text_5_state, M_Text_5_value, 'time', false, 'M_Text_5', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_5.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_7_state, M_Text_6_state, M_Text_6_value, 'string', false, 'M_Text_6', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_6.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_4_onclick'] = fetchid;
	scriptBP_21_msg = PopMessageBox('', EMessageBoxType.Loading, '提交申请');;
	var bundle_querysql_0 = {
		员工代码: M_Dropdown_0_value,
		起始日期: M_Text_1_value,
		结束日期: M_Text_3_value
	};
	setTimeout(function () {
		if (fetchTracer['button_4_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			if (data_querysql_0.length > 0) {
				var ret = callback_final(state, null, { info: M_Dropdown_0_text + '在' + M_Text_1_value + '已经有一条生效中的请假记录了' });
				return ret == null ? state : ret;
			} else {
				var bundle_insert_table_0 = {
					M_Dropdown_0_value: M_Dropdown_0_value,
					M_Dropdown_1_value: M_Dropdown_1_value,
					M_Text_2_value: M_Text_2_value,
					M_Text_5_value: M_Text_5_value,
					M_Text_1_value: M_Text_1_value,
					M_Text_3_value: M_Text_3_value,
					M_Text_6_value: M_Text_6_value,
					M_Text_4_value: M_Text_4_value
				};
				setTimeout(function () {
					store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_4_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
						if (err_insert_table_0 == null) {
							fresh_M_Form_1(state);
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
function active_M_Page_0(state) {
	state.nowPage = 'M_Page_0';
	if (gDataCache.get('M_Page_0_opened')) {
		return state;
	}
	gDataCache.set('M_Page_0_opened', 1);
	setTimeout(function () {
		pull_M_Form_2();
	}, 50);
	return state;
}
function fresh_M_Form_2(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_0.M_Form_2', bind_M_Form_2);
}
function bind_M_Form_2(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_2', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	needSetState['M_Text_9.value'] = '同意';
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_2_nowRecord = nowRecord;
		needSetState['M_Label_3.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_4.text'] = nowRecord['员工假期种类'];
		needSetState['M_Label_5.text'] = nowRecord['请假起始日期'];
		needSetState['M_Label_6.text'] = nowRecord['请假起始时间'];
		needSetState['M_Label_7.text'] = nowRecord['请假结束日期'];
		needSetState['M_Label_8.text'] = nowRecord['请假结束时间'];
		needSetState['M_Label_9.text'] = nowRecord['请假事由说明'];
		needSetState['M_LC_14.visible'] = M_LC_14_isdisplay_get(retState, bundle);
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_2', needSetState);
	pull_M_Form_3(retState);
	return retState;
}
function pull_M_Form_2(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_2' }, makeFTD_Prop('M_Page_0', 'M_Form_2', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function M_LC_14_isdisplay_get(state, bundle) {
	var M_Form_2_nowRecord = bundle != null && bundle.M_Form_2_nowRecord != null ? bundle.M_Form_2_nowRecord : getStateByPath(state, 'M_Page_0.M_Form_2.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_2_nowRecord['员工假期种类代码'] == 11;
}
function M_LC_16_isdisplay_get(state, bundle) {
	var M_Form_2_state = getStateByPath(state, 'M_Page_0.M_Form_2', {});
	var M_LC_14_state = getStateByPath(M_Form_2_state, 'M_LC_14', {});
	var M_LC_14_visible = bundle != null && bundle['M_LC_14_visible'] != null ? bundle['M_LC_14_visible'] : M_LC_14_state.visible;
	return M_LC_14_visible;
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_0.M_Form_2', {});
	var M_Text_9_state = getStateByPath(M_Form_2_state, 'M_Text_9', {});
	var M_LC_21_state = getStateByPath(M_Form_2_state, 'M_LC_21', {});
	var M_Text_9_value = M_Text_9_state.value;
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
				scriptBP_8_msg.setData(err.info, EMessageBoxType.Error, '通过申请');
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
	validErr = BaseIsValueValid(state, M_LC_21_state, M_Text_9_state, M_Text_9_value, 'string', false, 'M_Text_9', validErrState);
	validErrState['M_Page_0.M_Form_2.M_Text_9.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_8_msg = PopMessageBox('', EMessageBoxType.Loading, '通过申请');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_2_nowRecord['员工请假记录代码'],
		M_Text_9_value: M_Text_9_value,
		审核确认状态: 1,
		M_Form_2_员工请假记录代码: M_Form_2_nowRecord['员工请假记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_0_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
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
function button_1_onclick() {
	var nowDate_1;
	var temp_1;
	var state = store.getState();
	var M_Form_2_state = getStateByPath(state, 'M_Page_0.M_Form_2', {});
	var M_Text_9_state = getStateByPath(M_Form_2_state, 'M_Text_9', {});
	var M_LC_21_state = getStateByPath(M_Form_2_state, 'M_LC_21', {});
	var M_Text_9_value = M_Text_9_state.value;
	var M_Form_2_nowRecord = getStateByPath(M_Form_2_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_10_msg = null;
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
			if (scriptBP_10_msg) {
				scriptBP_10_msg.setData(err.info, EMessageBoxType.Error, '拒绝申请');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_10_msg) {
			scriptBP_10_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_21_state, M_Text_9_state, M_Text_9_value, 'string', false, 'M_Text_9', validErrState);
	validErrState['M_Page_0.M_Form_2.M_Text_9.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_10_msg = PopMessageBox('', EMessageBoxType.Loading, '拒绝申请');;
	if (M_Text_9_value == '同意') {
		var ret = callback_final(state, null, { info: '请登记拒绝理由' });
		return ret == null ? state : ret;
	} else {
		var bundle_update_table_0 = {
			RCDKEY: M_Form_2_nowRecord['员工请假记录代码'],
			M_Text_9_value: M_Text_9_value,
			审核确认状态: 2,
			M_Form_2_员工请假记录代码: M_Form_2_nowRecord['员工请假记录代码']
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_1_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
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
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_2.M_Form_3', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_2.M_Form_3', needSetState);
	return bind_M_Form_3Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_2.M_Form_3', needSetState);
	return retState;
}
function pull_M_Form_3(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_2_nowRecord = getStateByPath(state, 'M_Page_0.M_Form_2.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_2_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_2.M_Form_3.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_2.M_Form_3.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_2.M_Form_3.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_2.M_Form_3.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.员工登记姓名代码_sqlBP_8 = M_Form_2_nowRecord.员工登记姓名代码;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_3' }, makeFTD_Prop('M_Page_0.M_Form_2', 'M_Form_3', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_3Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_2.M_Form_3', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_10.text'] = nowRecord['员工假期种类'];
		needSetState['row_' + rowIndex + '.M_Label_11.text'] = nowRecord['请假区间'];
		needSetState['row_' + rowIndex + '.M_Label_12.text'] = nowRecord['请假事由说明'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_2.M_Form_3', needSetState);
}
function active_M_Page_1(state) {
	state.nowPage = 'M_Page_1';
	if (gDataCache.get('M_Page_1_opened')) {
		return state;
	}
	gDataCache.set('M_Page_1_opened', 1);
	setTimeout(function () {}, 50);
	state = bind_M_Form_4(state);
	return state;
}
function fresh_M_Form_4(retState, records_arr) {
	bind_M_Form_4(retState);
}
function bind_M_Form_4(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_4', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Dropdown_2.value'] = M_Dropdown_2_defaultvalue_get(retState, bundle);
	needSetState['M_Text_7.value'] = M_Text_7_defaultvalue_get(retState, bundle);
	needSetState['M_Text_8.value'] = null;
	needSetState['M_Text_10.value'] = null;
	needSetState['M_Dropdown_3.text'] = null;
	needSetState['M_Dropdown_3.value'] = null;
	needSetState['M_Dropdown_4.text'] = null;
	needSetState['M_Dropdown_4.value'] = null;
	needSetState['M_Dropdown_5.text'] = null;
	needSetState['M_Dropdown_5.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_4', needSetState);
	return retState;
}
function pull_M_Form_4(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_4(retState);
	return retState;
}
function M_Dropdown_2_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_2() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_2' }, makeFTD_Prop('M_Page_1.M_Form_4', 'M_Dropdown_2', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_7_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
	if (getDateDiff('天', nowValue, getNowDate()) > 3) {
		return '只能补3天之内的申请';
	}
}
function M_Text_7_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function M_Text_8_validchecker(nowValue, comeState, comeValidErrState) {
	var state = store.getState();
	var M_Form_4_state = getStateByPath(state, 'M_Page_1.M_Form_4', {});
	var M_Text_7_state = getStateByPath(M_Form_4_state, 'M_Text_7', {});
	var M_LC_23_state = getStateByPath(M_Form_4_state, 'M_LC_23', {});
	var M_Text_7_value = M_Text_7_state.value;
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
	if (validErrState.hasOwnProperty('M_Page_1.M_Form_4.M_Text_7.invalidInfo')) {
		validErr = validErrState['M_Page_1.M_Form_4.M_Text_7.invalidInfo'];
	} else {
		validErr = BaseIsValueValid(comeState, M_LC_23_state, M_Text_7_state, M_Text_7_value, 'date', false, 'M_Text_7', validErrState);
		validErrState['M_Page_1.M_Form_4.M_Text_7.invalidInfo'] = validErr;
	}
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	if (getDateDiff('天', M_Text_7_value, nowValue) < 0) {
		return '必须大于等于起始日期';
	}
}
function pull_M_Dropdown_3() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_3' }, makeFTD_Prop('M_Page_1.M_Form_4', 'M_Dropdown_3', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_4() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_4' }, makeFTD_Prop('M_Page_1.M_Form_4', 'M_Dropdown_4', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_5() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_5' }, makeFTD_Prop('M_Page_1.M_Form_4', 'M_Dropdown_5', 'options_arr', false), EFetchKey.FetchPropValue));
}
function button_2_onclick() {
	var state = store.getState();
	var M_Form_4_state = getStateByPath(state, 'M_Page_1.M_Form_4', {});
	var M_Dropdown_2_state = getStateByPath(M_Form_4_state, 'M_Dropdown_2', {});
	var M_LC_22_state = getStateByPath(M_Form_4_state, 'M_LC_22', {});
	var M_Dropdown_2_value = M_Dropdown_2_state.value;
	var M_Text_7_state = getStateByPath(M_Form_4_state, 'M_Text_7', {});
	var M_LC_23_state = getStateByPath(M_Form_4_state, 'M_LC_23', {});
	var M_Text_7_value = M_Text_7_state.value;
	var M_Text_8_state = getStateByPath(M_Form_4_state, 'M_Text_8', {});
	var M_LC_24_state = getStateByPath(M_Form_4_state, 'M_LC_24', {});
	var M_Text_8_value = M_Text_8_state.value;
	var M_Text_10_state = getStateByPath(M_Form_4_state, 'M_Text_10', {});
	var M_LC_25_state = getStateByPath(M_Form_4_state, 'M_LC_25', {});
	var M_Text_10_value = M_Text_10_state.value;
	var M_Dropdown_3_state = getStateByPath(M_Form_4_state, 'M_Dropdown_3', {});
	var M_LC_26_state = getStateByPath(M_Form_4_state, 'M_LC_26', {});
	var M_Dropdown_3_value = M_Dropdown_3_state.value;
	var M_Dropdown_4_state = getStateByPath(M_Form_4_state, 'M_Dropdown_4', {});
	var M_LC_27_state = getStateByPath(M_Form_4_state, 'M_LC_27', {});
	var M_Dropdown_4_value = M_Dropdown_4_state.value;
	var M_Dropdown_5_state = getStateByPath(M_Form_4_state, 'M_Dropdown_5', {});
	var M_LC_28_state = getStateByPath(M_Form_4_state, 'M_LC_28', {});
	var M_Dropdown_5_value = M_Dropdown_5_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_29_msg = null;
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
			if (scriptBP_29_msg) {
				scriptBP_29_msg.setData(err.info, EMessageBoxType.Error, '提交申请');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_29_msg) {
			scriptBP_29_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_LC_22_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Dropdown_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_23_state, M_Text_7_state, M_Text_7_value, 'date', false, 'M_Text_7', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Text_7.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_24_state, M_Text_8_state, M_Text_8_value, 'date', false, 'M_Text_8', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Text_8.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_25_state, M_Text_10_state, M_Text_10_value, 'string', false, 'M_Text_10', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Text_10.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_26_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Dropdown_3.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_27_state, M_Dropdown_4_state, M_Dropdown_4_value, 'string', false, 'M_Dropdown_4', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Dropdown_4.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_28_state, M_Dropdown_5_state, M_Dropdown_5_value, 'string', false, 'M_Dropdown_5', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Dropdown_5.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_2_onclick'] = fetchid;
	scriptBP_29_msg = PopMessageBox('', EMessageBoxType.Loading, '提交申请');;
	var bundle_querysql_0 = {
		员工代码: M_Dropdown_2_value,
		起始日期: M_Text_7_value,
		结束日期: M_Text_8_value
	};
	setTimeout(function () {
		if (fetchTracer['button_2_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			if (data_querysql_0.length > 0) {
				var ret = callback_final(state, null, { info: '所选日期范围有生效中的出差申请了！' });
				return ret == null ? state : ret;
			} else {
				var bundle_insert_table_0 = {
					M_Dropdown_2_value: M_Dropdown_2_value,
					M_Text_7_value: M_Text_7_value,
					M_Text_8_value: M_Text_8_value,
					M_Text_10_value: M_Text_10_value,
					M_Dropdown_3_value: M_Dropdown_3_value,
					M_Dropdown_4_value: M_Dropdown_4_value,
					M_Dropdown_5_value: M_Dropdown_5_value
				};
				setTimeout(function () {
					store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_2_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
						if (err_insert_table_0 == null) {
							fresh_M_Form_4(state);
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
function fresh_M_Form_5(retState, records_arr) {
	bind_M_Form_5(retState);
}
function bind_M_Form_5(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_4.M_Form_5', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_4.M_Form_5', needSetState);
	return bind_M_Form_5Page(retState);
	retState = setManyStateByPath(retState, 'M_Page_1.M_Form_4.M_Form_5', needSetState);
	return retState;
}
function pull_M_Form_5(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_4_state = getStateByPath(state, 'M_Page_1.M_Form_4', {});
	var M_Dropdown_2_state = getStateByPath(M_Form_4_state, 'M_Dropdown_2', {});
	var M_LC_22_state = getStateByPath(M_Form_4_state, 'M_LC_22', {});
	var M_Dropdown_2_value = M_Dropdown_2_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	validErr = BaseIsValueValid(state, M_LC_22_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
	validErrState['M_Page_1.M_Form_4.M_Dropdown_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_1.M_Form_4.M_Form_5.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_1.M_Form_4.M_Form_5.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.M_Dropdown_2_value = M_Dropdown_2_value;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_5' }, makeFTD_Prop('M_Page_1.M_Form_4', 'M_Form_5', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_5Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_1.M_Form_4.M_Form_5', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_13.text'] = nowRecord['出差起始日期'];
		needSetState['row_' + rowIndex + '.M_Label_14.text'] = nowRecord['出差结束日期'];
		needSetState['row_' + rowIndex + '.M_Label_15.text'] = nowRecord['出差地域名称'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_1.M_Form_4.M_Form_5', needSetState);
}
function active_M_Page_3(state) {
	state.nowPage = 'M_Page_3';
	if (gDataCache.get('M_Page_3_opened')) {
		return state;
	}
	gDataCache.set('M_Page_3_opened', 1);
	setTimeout(function () {}, 50);
	return state;
}
function button_3_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_2'));
	}, 50);
}
function button_5_onclick() {
	var state = store.getState();
	setTimeout(function () {
		store.dispatch(makeAction_gotoPage('M_Page_1'));
	}, 50);
}
function active_M_Page_4(state) {
	state.nowPage = 'M_Page_4';
	if (gDataCache.get('M_Page_4_opened')) {
		return state;
	}
	gDataCache.set('M_Page_4_opened', 1);
	setTimeout(function () {
		pull_M_Form_6();
	}, 50);
	return state;
}
function fresh_M_Form_6(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_4.M_Form_6', bind_M_Form_6);
}
function bind_M_Form_6(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_4.M_Form_6', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	needSetState['M_Text_0.value'] = '同意';
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_6_nowRecord = nowRecord;
		needSetState['M_Label_16.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_17.text'] = nowRecord['出差起始日期'];
		needSetState['M_Label_18.text'] = nowRecord['出差结束日期'];
		needSetState['M_Label_19.text'] = nowRecord['出差地域名称'];
		needSetState['M_Label_20.text'] = nowRecord['出差目的打算'];
		needSetState['M_Label_21.text'] = nowRecord['交通方式种类'];
		needSetState['M_Label_22.text'] = nowRecord['住宿报销种类'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_4.M_Form_6', needSetState);
	return retState;
}
function pull_M_Form_6(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_6' }, makeFTD_Prop('M_Page_4', 'M_Form_6', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function button_7_onclick() {
	var state = store.getState();
	var M_Form_6_state = getStateByPath(state, 'M_Page_4.M_Form_6', {});
	var M_Text_0_state = getStateByPath(M_Form_6_state, 'M_Text_0', {});
	var M_LC_39_state = getStateByPath(M_Form_6_state, 'M_LC_39', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_6_nowRecord = getStateByPath(M_Form_6_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_36_msg = null;
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
			if (scriptBP_36_msg) {
				scriptBP_36_msg.setData(err.info, EMessageBoxType.Error, '批准出差');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_36_msg) {
			scriptBP_36_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_6_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_39_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_4.M_Form_6.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_7_onclick'] = fetchid;
	scriptBP_36_msg = PopMessageBox('', EMessageBoxType.Loading, '批准出差');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_6_nowRecord['出差住宿记录代码'],
		M_Text_0_value: M_Text_0_value,
		审核确认状态: 1,
		M_Form_6_出差住宿记录代码: M_Form_6_nowRecord['出差住宿记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_7_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_6();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function button_6_onclick() {
	var state = store.getState();
	var M_Form_6_state = getStateByPath(state, 'M_Page_4.M_Form_6', {});
	var M_Text_0_state = getStateByPath(M_Form_6_state, 'M_Text_0', {});
	var M_LC_39_state = getStateByPath(M_Form_6_state, 'M_LC_39', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Form_6_nowRecord = getStateByPath(M_Form_6_state, 'nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_37_msg = null;
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
			if (scriptBP_37_msg) {
				scriptBP_37_msg.setData(err.info, EMessageBoxType.Error, '拒绝出差');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_37_msg) {
			scriptBP_37_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_6_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	validErr = BaseIsValueValid(state, M_LC_39_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_4.M_Form_6.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_6_onclick'] = fetchid;
	scriptBP_37_msg = PopMessageBox('', EMessageBoxType.Loading, '拒绝出差');;
	if (M_Text_0_value == '同意') {
		var ret = callback_final(state, null, { info: '请给出拒绝的理由。' });
		return ret == null ? state : ret;
	} else {
		var bundle_update_table_0 = {
			RCDKEY: M_Form_6_nowRecord['出差住宿记录代码'],
			M_Text_0_value: M_Text_0_value,
			审核确认状态: 2,
			M_Form_6_出差住宿记录代码: M_Form_6_nowRecord['出差住宿记录代码']
		};
		setTimeout(function () {
			store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_6_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
				if (err_update_table_0 == null) {
					setTimeout(function () {
						pull_M_Form_6();
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
function active_M_Page_5(state) {
	state.nowPage = 'M_Page_5';
	if (gDataCache.get('M_Page_5_opened')) {
		return state;
	}
	gDataCache.set('M_Page_5_opened', 1);
	setTimeout(function () {}, 50);
	state = bind_M_Form_7(state);
	return state;
}
function fresh_M_Form_7(retState, records_arr) {
	bind_M_Form_7(retState);
}
function bind_M_Form_7(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_5.M_Form_7', {});
	var needSetState = {};
	var bundle = {};
	needSetState['M_Dropdown_6.value'] = M_Dropdown_6_defaultvalue_get(retState, bundle);
	needSetState['M_Text_12.value'] = M_Text_12_defaultvalue_get(retState, bundle);
	needSetState['M_Text_13.value'] = null;
	needSetState['M_Dropdown_7.value'] = M_Dropdown_7_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_8.text'] = null;
	needSetState['M_Dropdown_8.value'] = null;
	needSetState['M_Text_16.value'] = '上海';
	needSetState['M_CheckBox_0.value'] = '0';
	needSetState['M_Text_18.value'] = null;
	needSetState['M_Dropdown_9.value'] = '1';
	needSetState['M_Text_20.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_5.M_Form_7', needSetState);
	return retState;
}
function pull_M_Form_7(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_7(retState);
	return retState;
}
function M_Dropdown_6_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_6() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_6' }, makeFTD_Prop('M_Page_5.M_Form_7', 'M_Dropdown_6', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_12_defaultvalue_get(state, bundle) {
	return getNowDate();
}
function M_Dropdown_7_defaultvalue_get(state, bundle) {
	return g_envVar.workRegionCode;
}
function pull_M_Dropdown_7() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_7' }, makeFTD_Prop('M_Page_5.M_Form_7', 'M_Dropdown_7', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_8() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_8' }, makeFTD_Prop('M_Page_5.M_Form_7', 'M_Dropdown_8', 'options_arr', false), EFetchKey.FetchPropValue));
}
function pull_M_Dropdown_9() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_9' }, makeFTD_Prop('M_Page_5.M_Form_7', 'M_Dropdown_9', 'options_arr', false), EFetchKey.FetchPropValue));
}
function button_8_onclick() {
	var state = store.getState();
	var M_Form_7_state = getStateByPath(state, 'M_Page_5.M_Form_7', {});
	var M_Dropdown_6_state = getStateByPath(M_Form_7_state, 'M_Dropdown_6', {});
	var M_LC_40_state = getStateByPath(M_Form_7_state, 'M_LC_40', {});
	var M_Dropdown_6_value = M_Dropdown_6_state.value;
	var M_Text_12_state = getStateByPath(M_Form_7_state, 'M_Text_12', {});
	var M_LC_41_state = getStateByPath(M_Form_7_state, 'M_LC_41', {});
	var M_Text_12_value = M_Text_12_state.value;
	var M_Dropdown_7_state = getStateByPath(M_Form_7_state, 'M_Dropdown_7', {});
	var M_LC_43_state = getStateByPath(M_Form_7_state, 'M_LC_43', {});
	var M_Dropdown_7_value = M_Dropdown_7_state.value;
	var M_Dropdown_8_state = getStateByPath(M_Form_7_state, 'M_Dropdown_8', {});
	var M_LC_44_state = getStateByPath(M_Form_7_state, 'M_LC_44', {});
	var M_Dropdown_8_value = M_Dropdown_8_state.value;
	var M_Text_16_state = getStateByPath(M_Form_7_state, 'M_Text_16', {});
	var M_LC_45_state = getStateByPath(M_Form_7_state, 'M_LC_45', {});
	var M_Text_16_value = M_Text_16_state.value;
	var M_CheckBox_0_state = getStateByPath(M_Form_7_state, 'M_CheckBox_0', {});
	var M_LC_46_state = getStateByPath(M_Form_7_state, 'M_LC_46', {});
	var M_CheckBox_0_value = M_CheckBox_0_state.value;
	var M_Text_18_state = getStateByPath(M_Form_7_state, 'M_Text_18', {});
	var M_LC_47_state = getStateByPath(M_Form_7_state, 'M_LC_47', {});
	var M_Text_18_value = M_Text_18_state.value;
	var M_Dropdown_9_state = getStateByPath(M_Form_7_state, 'M_Dropdown_9', {});
	var M_LC_48_state = getStateByPath(M_Form_7_state, 'M_LC_48', {});
	var M_Dropdown_9_value = M_Dropdown_9_state.value;
	var M_Text_20_state = getStateByPath(M_Form_7_state, 'M_Text_20', {});
	var M_LC_49_state = getStateByPath(M_Form_7_state, 'M_LC_49', {});
	var M_Text_20_value = M_Text_20_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_41_msg = null;
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
			if (scriptBP_41_msg) {
				scriptBP_41_msg.setData(err.info, EMessageBoxType.Error, '申请提交');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_41_msg) {
			scriptBP_41_msg.fireClose();
		}
		SendToast('执行成功');
	};
	validErr = BaseIsValueValid(state, M_LC_40_state, M_Dropdown_6_state, M_Dropdown_6_value, 'string', false, 'M_Dropdown_6', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Dropdown_6.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_41_state, M_Text_12_state, M_Text_12_value, 'date', false, 'M_Text_12', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Text_12.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_43_state, M_Dropdown_7_state, M_Dropdown_7_value, 'string', false, 'M_Dropdown_7', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Dropdown_7.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_44_state, M_Dropdown_8_state, M_Dropdown_8_value, 'string', false, 'M_Dropdown_8', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Dropdown_8.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_45_state, M_Text_16_state, M_Text_16_value, 'string', false, 'M_Text_16', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Text_16.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_46_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
	validErrState['M_Page_5.M_Form_7.M_CheckBox_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_47_state, M_Text_18_state, M_Text_18_value, 'time', false, 'M_Text_18', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Text_18.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_48_state, M_Dropdown_9_state, M_Dropdown_9_value, 'string', false, 'M_Dropdown_9', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Dropdown_9.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_49_state, M_Text_20_state, M_Text_20_value, 'string', false, 'M_Text_20', validErrState);
	validErrState['M_Page_5.M_Form_7.M_Text_20.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_8_onclick'] = fetchid;
	scriptBP_41_msg = PopMessageBox('', EMessageBoxType.Loading, '申请提交');;
	var bundle_insert_table_0 = {
		M_Dropdown_7_value: M_Dropdown_7_value,
		M_Text_20_value: M_Text_20_value,
		M_Dropdown_8_value: M_Dropdown_8_value,
		M_Text_16_value: M_Text_16_value,
		M_CheckBox_0_value: M_CheckBox_0_value,
		M_Text_18_value: M_Text_18_value,
		M_Dropdown_6_value: M_Dropdown_6_value,
		M_Text_12_value: M_Text_12_value,
		M_Dropdown_9_value: M_Dropdown_9_value
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_8_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
			if (err_insert_table_0 == null) {
				fresh_M_Form_7(state);
				var ret = callback_final(state, data_insert_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_insert_table_0, err_insert_table_0);
			}
		})));
	}, 50);
}
function active_M_Page_6(state) {
	state.nowPage = 'M_Page_6';
	if (gDataCache.get('M_Page_6_opened')) {
		return state;
	}
	gDataCache.set('M_Page_6_opened', 1);
	setTimeout(function () {
		pull_M_Form_8();
	}, 50);
	return state;
}
function fresh_M_Form_8(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_6.M_Form_8', bind_M_Form_8);
}
function bind_M_Form_8(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_6.M_Form_8', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_8_nowRecord = nowRecord;
		needSetState['M_Text_11.value'] = nowRecord['申请人姓名'];
		needSetState['M_Text_14.value'] = nowRecord['申请外出日期'];
		needSetState['M_Text_15.value'] = nowRecord['申请外出时间'];
		needSetState['M_Text_17.value'] = nowRecord['前往地域名称'];
		needSetState['M_Text_19.value'] = nowRecord['前往地点名称'];
		needSetState['M_Text_21.value'] = nowRecord['是否返回'];
		needSetState['M_Text_22.value'] = nowRecord['预计返回时间'];
		needSetState['M_Text_23.value'] = nowRecord['用车需求'];
		needSetState['M_Text_24.value'] = nowRecord['外出事由说明'];
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_6.M_Form_8', needSetState);
	return retState;
}
function pull_M_Form_8(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_8' }, makeFTD_Prop('M_Page_6', 'M_Form_8', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function button_10_onclick() {
	var state = store.getState();
	var M_Form_8_nowRecord = getStateByPath(state, 'M_Page_6.M_Form_8.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_42_msg = null;
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
			if (scriptBP_42_msg) {
				scriptBP_42_msg.setData(err.info, EMessageBoxType.Error, '同意');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_42_msg) {
			scriptBP_42_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_8_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_10_onclick'] = fetchid;
	scriptBP_42_msg = PopMessageBox('', EMessageBoxType.Loading, '同意');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_8_nowRecord['员工外出记录代码'],
		审核确认状态: 1,
		M_Form_8_员工外出记录代码: M_Form_8_nowRecord['员工外出记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_10_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_8();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function button_11_onclick() {
	var state = store.getState();
	var M_Form_8_nowRecord = getStateByPath(state, 'M_Page_6.M_Form_8.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var scriptBP_43_msg = null;
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
			if (scriptBP_43_msg) {
				scriptBP_43_msg.setData(err.info, EMessageBoxType.Error, '拒绝');
			} else {
				SendToast(err.info, EToastType.Error);
			}
			return;
		}
		if (scriptBP_43_msg) {
			scriptBP_43_msg.fireClose();
		}
		SendToast('执行成功');
	};
	if (IsEmptyString(M_Form_8_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_11_onclick'] = fetchid;
	scriptBP_43_msg = PopMessageBox('', EMessageBoxType.Loading, '拒绝');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_8_nowRecord['员工外出记录代码'],
		审核确认状态: 2,
		M_Form_8_员工外出记录代码: M_Form_8_nowRecord['员工外出记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'button_11_onclick_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				setTimeout(function () {
					pull_M_Form_8();
				}, 50);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
	}, 50);
}
function M_Dropdown_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_Text_4.value'] = M_Text_4_defaultvalue_get(state);
	if (delayActs['call_pull_M_Form_0'] == null) {
		delayActs['call_pull_M_Form_0'] = { callfun: pull_M_Form_0 };
	};
	return setManyStateByPath(state, '', needSetState);
}
function M_Dropdown_1_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_Text_4.value'] = M_Text_4_defaultvalue_get(state);
	needSetState['M_Page_2.M_Form_1.M_LC_3.visible'] = M_LC_3_isdisplay_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_LC_3_visible_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_LC_4.visible'] = M_LC_4_isdisplay_get(state);
	needSetState['M_Page_2.M_Form_1.M_LC_6.visible'] = M_LC_6_isdisplay_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_LC_14_visible_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_0.M_Form_2.M_LC_16.visible'] = M_LC_16_isdisplay_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_Dropdown_2_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	if (delayActs['call_pull_M_Form_5'] == null) {
		delayActs['call_pull_M_Form_5'] = { callfun: pull_M_Form_5 };
	};
	return setManyStateByPath(state, '', needSetState);
}
function M_Dropdown_0_text_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	if (delayActs['call_pull_M_Form_0'] == null) {
		delayActs['call_pull_M_Form_0'] = { callfun: pull_M_Form_0 };
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
				case 'M_Page_2':
					{
						pageElem = React.createElement(VisibleCM_Page_2, null);
						break;
					}
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
				case 'M_Page_3':
					{
						pageElem = React.createElement(VisibleCM_Page_3, null);
						break;
					}
				case 'M_Page_4':
					{
						pageElem = React.createElement(VisibleCM_Page_4, null);
						break;
					}
				case 'M_Page_5':
					{
						pageElem = React.createElement(VisibleCM_Page_5, null);
						break;
					}
				case 'M_Page_6':
					{
						pageElem = React.createElement(VisibleCM_Page_6, null);
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
					"\u8BF7\u5047\u767B\u8BB0"
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
						retElem = React.createElement(
							"div",
							{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
							React.createElement(
								"div",
								{ className: "d-flex flex-grow-1  flex-column" },
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_0", parentPath: "M_Page_2.M_Form_1", label: "\u8BF7\u5047\u4EBA\u5458" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: "M_Page_2.M_Form_1", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u8BF7\u5047\u4EBA\u5458" })
								),
								React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_2.M_Form_1", title: "\u4ED6\u7684\u6700\u8FD1\u8BF7\u5047", pagebreak: false, reBindAT: "ReBindM_Form_0Page" }),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_1", parentPath: "M_Page_2.M_Form_1", label: "\u5047\u671F\u79CD\u7C7B" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: "M_Page_2.M_Form_1", pullDataSource: pull_M_Dropdown_1, textAttrName: "\u5458\u5DE5\u5047\u671F\u79CD\u7C7B", valueAttrName: "\u5458\u5DE5\u5047\u671F\u79CD\u7C7B\u4EE3\u7801", label: "\u5047\u671F\u79CD\u7C7B" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_5", parentPath: "M_Page_2.M_Form_1", label: "\u5F53\u524D\u72B6\u6001" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_4", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "single", readonly: true })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_2", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: "M_Page_2.M_Form_1", type: "date" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_3", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65F6\u95F4" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_2", parentPath: "M_Page_2.M_Form_1", type: "time" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_4", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_3", parentPath: "M_Page_2.M_Form_1", type: "date" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_6", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65F6\u95F4" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_5", parentPath: "M_Page_2.M_Form_1", type: "time" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_7", parentPath: "M_Page_2.M_Form_1", label: "\u4E8B\u7531\u8BF4\u660E" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_6", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "1x" })
								),
								React.createElement(
									"button",
									{ className: "btn btn-primary erp-control ", id: "button_4", onClick: button_4_onclick },
									"\u63D0\u4EA4\u7533\u8BF7"
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
	retProps.loaded = true;
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
				{ className: "flex-grow-0 d-flex flex-shrink-1 erp-form flex-column " },
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

var CM_Page_0 = function (_React$PureComponent7) {
	_inherits(CM_Page_0, _React$PureComponent7);

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
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column " },
				React.createElement(VisibleCM_Form_2, { id: "M_Form_2", parentPath: "M_Page_0" })
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
										{ id: "M_LC_11", parentPath: "M_Page_0.M_Form_2", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_3", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_12", parentPath: "M_Page_0.M_Form_2", label: "\u5458\u5DE5\u5047\u671F\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_4", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_13", parentPath: "M_Page_0.M_Form_2", label: "\u8BF7\u5047\u8D77\u59CB\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_5", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_14", parentPath: "M_Page_0.M_Form_2", label: "\u8BF7\u5047\u8D77\u59CB\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_6", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_15", parentPath: "M_Page_0.M_Form_2", label: "\u8BF7\u5047\u7ED3\u675F\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_7", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_16", parentPath: "M_Page_0.M_Form_2", label: "\u8BF7\u5047\u7ED3\u675F\u65F6\u95F4" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_17", parentPath: "M_Page_0.M_Form_2", label: "\u8BF7\u5047\u4E8B\u7531\u8BF4\u660E" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_0.M_Form_2", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_21", parentPath: "M_Page_0.M_Form_2", label: "\u5BA1\u6838\u610F\u89C1" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_9", parentPath: "M_Page_0.M_Form_2", type: "string", linetype: "single" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-shrink-0 flex-grow-0 d-flex erp-control " },
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_0", onClick: button_0_onclick },
											"\u901A\u8FC7\u7533\u8BF7"
										),
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_1", onClick: button_1_onclick },
											"\u62D2\u7EDD\u7533\u8BF7"
										)
									),
									React.createElement(VisibleCM_Form_3, { id: "M_Form_3", parentPath: "M_Page_0.M_Form_2", title: "\u4ED6\u6700\u8FD1\u7684\u8BF7\u5047\u8BB0\u5F55", pagebreak: false, reBindAT: "ReBindM_Form_3Page" })
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
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_2', {});
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
				{ className: "flex-grow-0 d-flex flex-shrink-1 erp-form flex-column ", style: M_Form_3_style },
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
	var ctlState = getStateByPath(state, 'M_Page_0.M_Form_2.M_Form_3', {});
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
						"\u5458\u5DE5\u5047\u671F\u79CD\u7C7B"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_3headstyle1 },
						"\u8BF7\u5047\u533A\u95F4"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_3headstyle2 },
						"\u8BF7\u5047\u4E8B\u7531\u8BF4\u660E"
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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_10", parentPath: "M_Page_0.M_Form_2.M_Form_3", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_3tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_11", parentPath: "M_Page_0.M_Form_2.M_Form_3", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_3tdstyle2 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_12", parentPath: "M_Page_0.M_Form_2.M_Form_3", type: "string" })
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

var CM_Page_1 = function (_React$PureComponent12) {
	_inherits(CM_Page_1, _React$PureComponent12);

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
					"\u7533\u8BF7\u51FA\u5DEE"
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
				React.createElement(VisibleCM_Form_4, { id: "M_Form_4", parentPath: "M_Page_1" })
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

var CM_Form_4 = function (_React$PureComponent13) {
	_inherits(CM_Form_4, _React$PureComponent13);

	function CM_Form_4(props) {
		_classCallCheck(this, CM_Form_4);

		var _this13 = _possibleConstructorReturn(this, (CM_Form_4.__proto__ || Object.getPrototypeOf(CM_Form_4)).call(this, props));

		ERPC_PageForm(_this13);
		return _this13;
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
						retElem = React.createElement(
							"div",
							{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
							React.createElement(
								"div",
								{ className: "d-flex flex-grow-1  flex-column" },
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_22", parentPath: "M_Page_1.M_Form_4", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_2", parentPath: "M_Page_1.M_Form_4", groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_2, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_23", parentPath: "M_Page_1.M_Form_4", label: "\u51FA\u5DEE\u8D77\u59CB\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_7", parentPath: "M_Page_1.M_Form_4", type: "date" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_24", parentPath: "M_Page_1.M_Form_4", label: "\u51FA\u5DEE\u7ED3\u675F\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_8", parentPath: "M_Page_1.M_Form_4", type: "date" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_25", parentPath: "M_Page_1.M_Form_4", label: "\u51FA\u5DEE\u76EE\u7684\u6253\u7B97" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_10", parentPath: "M_Page_1.M_Form_4", type: "string", linetype: "1x" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_26", parentPath: "M_Page_1.M_Form_4", label: "\u4EA4\u901A\u65B9\u5F0F\u4EE3\u7801" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_3", parentPath: "M_Page_1.M_Form_4", pullDataSource: pull_M_Dropdown_3, textAttrName: "\u4EA4\u901A\u65B9\u5F0F\u79CD\u7C7B", valueAttrName: "\u4EA4\u901A\u65B9\u5F0F\u79CD\u7C7B\u4EE3\u7801", label: "\u4EA4\u901A\u65B9\u5F0F\u4EE3\u7801" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_27", parentPath: "M_Page_1.M_Form_4", label: "\u4F4F\u5BBF\u62A5\u9500\u79CD\u7C7B" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_4", parentPath: "M_Page_1.M_Form_4", pullDataSource: pull_M_Dropdown_4, textAttrName: "\u4F4F\u5BBF\u62A5\u9500\u79CD\u7C7B", valueAttrName: "\u4F4F\u5BBF\u62A5\u9500\u79CD\u7C7B\u4EE3\u7801", label: "\u4F4F\u5BBF\u62A5\u9500\u79CD\u7C7B" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_28", parentPath: "M_Page_1.M_Form_4", label: "\u51FA\u5DEE\u5730\u57DF\u4EE3\u7801" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_5", parentPath: "M_Page_1.M_Form_4", groupAttr: "\u4E00\u7EA7\u5730\u57DF\u540D\u79F0,\u4E8C\u7EA7\u5730\u57DF\u540D\u79F0", pullDataSource: pull_M_Dropdown_5, textAttrName: "\u6240\u5C5E\u5730\u57DF\u540D\u79F0", valueAttrName: "\u6240\u5C5E\u5730\u57DF\u540D\u79F0\u4EE3\u7801", label: "\u51FA\u5DEE\u5730\u57DF\u4EE3\u7801" })
								),
								React.createElement(
									"button",
									{ className: "btn btn-primary erp-control ", id: "button_2", onClick: button_2_onclick },
									"\u63D0\u4EA4\u7533\u8BF7"
								),
								React.createElement(VisibleCM_Form_5, { id: "M_Form_5", parentPath: "M_Page_1.M_Form_4", title: "\u4ED6\u6700\u8FD1\u7684\u51FA\u5DEE\u8BB0\u5F55", pagebreak: false, reBindAT: "ReBindM_Form_5Page" })
							),
							this.renderNavigater()
						);
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
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_4', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = true;
	return retProps;
}
function CM_Form_4_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_4 = ReactRedux.connect(CM_Form_4_mapstatetoprops, CM_Form_4_disptchtoprops)(CM_Form_4);

var CM_Form_5 = function (_React$PureComponent14) {
	_inherits(CM_Form_5, _React$PureComponent14);

	function CM_Form_5(props) {
		_classCallCheck(this, CM_Form_5);

		var _this14 = _possibleConstructorReturn(this, (CM_Form_5.__proto__ || Object.getPrototypeOf(CM_Form_5)).call(this, props));

		ERPC_GridForm(_this14);
		_this14.tableBodyScroll = _this14.tableBodyScroll.bind(_this14);
		return _this14;
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
	var ctlState = getStateByPath(state, 'M_Page_1.M_Form_4.M_Form_5', {});
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

var CM_Form_5_THead = function (_React$PureComponent15) {
	_inherits(CM_Form_5_THead, _React$PureComponent15);

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
						"\u51FA\u5DEE\u8D77\u59CB\u65E5\u671F"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle0 },
						"\u51FA\u5DEE\u7ED3\u675F\u65E5\u671F"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_5headstyle0 },
						"\u51FA\u5DEE\u5730\u57DF\u540D\u79F0"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_5_THead;
}(React.PureComponent);

var CM_Form_5_TBody = function (_React$PureComponent16) {
	_inherits(CM_Form_5_TBody, _React$PureComponent16);

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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_13", parentPath: "M_Page_1.M_Form_4.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_14", parentPath: "M_Page_1.M_Form_4.M_Form_5", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_5tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_15", parentPath: "M_Page_1.M_Form_4.M_Form_5", type: "string" })
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

var CM_Page_3 = function (_React$PureComponent17) {
	_inherits(CM_Page_3, _React$PureComponent17);

	function CM_Page_3(props) {
		_classCallCheck(this, CM_Page_3);

		return _possibleConstructorReturn(this, (CM_Page_3.__proto__ || Object.getPrototypeOf(CM_Page_3)).call(this, props));
	}

	_createClass(CM_Page_3, [{
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
					"\u5BFC\u822A"
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
					{ className: "btn-group-vertical d-flex flex-grow-1 flex-shrink-1 erp-control " },
					React.createElement(
						"button",
						{ className: "btn btn-primary erp-control ", id: "button_3", onClick: button_3_onclick },
						"\u7533\u8BF7\u8BF7\u5047"
					),
					React.createElement(
						"button",
						{ className: "btn btn-primary erp-control ", id: "button_5", onClick: button_5_onclick },
						"\u7533\u8BF7\u51FA\u5DEE"
					)
				)
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

var CM_Page_4 = function (_React$PureComponent18) {
	_inherits(CM_Page_4, _React$PureComponent18);

	function CM_Page_4(props) {
		_classCallCheck(this, CM_Page_4);

		return _possibleConstructorReturn(this, (CM_Page_4.__proto__ || Object.getPrototypeOf(CM_Page_4)).call(this, props));
	}

	_createClass(CM_Page_4, [{
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
					"\u51FA\u5DEE\u5BA1\u6838"
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
				React.createElement(VisibleCM_Form_6, { id: "M_Form_6", parentPath: "M_Page_4" })
			);
			return retElem;
		}
	}]);

	return CM_Page_4;
}(React.PureComponent);

function CM_Page_4_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_4_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_4 = ReactRedux.connect(CM_Page_4_mapstatetoprops, CM_Page_4_disptchtoprops)(CM_Page_4);

var CM_Form_6 = function (_React$PureComponent19) {
	_inherits(CM_Form_6, _React$PureComponent19);

	function CM_Form_6(props) {
		_classCallCheck(this, CM_Form_6);

		var _this19 = _possibleConstructorReturn(this, (CM_Form_6.__proto__ || Object.getPrototypeOf(CM_Form_6)).call(this, props));

		ERPC_PageForm(_this19);
		return _this19;
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
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_32", parentPath: "M_Page_4.M_Form_6", label: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_16", parentPath: "M_Page_4.M_Form_6", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_33", parentPath: "M_Page_4.M_Form_6", label: "\u51FA\u5DEE\u8D77\u59CB\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_17", parentPath: "M_Page_4.M_Form_6", type: "date" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_34", parentPath: "M_Page_4.M_Form_6", label: "\u51FA\u5DEE\u7ED3\u675F\u65E5\u671F" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_18", parentPath: "M_Page_4.M_Form_6", type: "date" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_35", parentPath: "M_Page_4.M_Form_6", label: "\u51FA\u5DEE\u5730\u57DF\u540D\u79F0" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_19", parentPath: "M_Page_4.M_Form_6", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_36", parentPath: "M_Page_4.M_Form_6", label: "\u51FA\u5DEE\u76EE\u7684\u6253\u7B97" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_20", parentPath: "M_Page_4.M_Form_6", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_37", parentPath: "M_Page_4.M_Form_6", label: "\u4EA4\u901A\u65B9\u5F0F\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_21", parentPath: "M_Page_4.M_Form_6", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_38", parentPath: "M_Page_4.M_Form_6", label: "\u4F4F\u5BBF\u62A5\u9500\u79CD\u7C7B" },
										React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_22", parentPath: "M_Page_4.M_Form_6", type: "string" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_39", parentPath: "M_Page_4.M_Form_6", label: "\u5BA1\u6838\u610F\u89C1" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_4.M_Form_6", type: "string", linetype: "single" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_7", onClick: button_7_onclick },
											"\u6279\u51C6\u51FA\u5DEE"
										),
										React.createElement(
											"button",
											{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_6", onClick: button_6_onclick },
											"\u62D2\u7EDD\u51FA\u5DEE"
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

	return CM_Form_6;
}(React.PureComponent);

function CM_Form_6_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_4.M_Form_6', {});
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

var CM_Page_5 = function (_React$PureComponent20) {
	_inherits(CM_Page_5, _React$PureComponent20);

	function CM_Page_5(props) {
		_classCallCheck(this, CM_Page_5);

		return _possibleConstructorReturn(this, (CM_Page_5.__proto__ || Object.getPrototypeOf(CM_Page_5)).call(this, props));
	}

	_createClass(CM_Page_5, [{
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
					"\u5916\u51FA\u7533\u8BF7"
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
				React.createElement(VisibleCM_Form_7, { id: "M_Form_7", parentPath: "M_Page_5" })
			);
			return retElem;
		}
	}]);

	return CM_Page_5;
}(React.PureComponent);

function CM_Page_5_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_5_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_5 = ReactRedux.connect(CM_Page_5_mapstatetoprops, CM_Page_5_disptchtoprops)(CM_Page_5);

var CM_Form_7 = function (_React$PureComponent21) {
	_inherits(CM_Form_7, _React$PureComponent21);

	function CM_Form_7(props) {
		_classCallCheck(this, CM_Form_7);

		var _this21 = _possibleConstructorReturn(this, (CM_Form_7.__proto__ || Object.getPrototypeOf(CM_Form_7)).call(this, props));

		ERPC_PageForm(_this21);
		return _this21;
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
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_40", parentPath: "M_Page_5.M_Form_7", label: "\u5458\u5DE5\u59D3\u540D" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_6", parentPath: "M_Page_5.M_Form_7", groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_6, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u5458\u5DE5\u59D3\u540D" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_41", parentPath: "M_Page_5.M_Form_7", label: "\u5916\u51FA\u65E5\u671F" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_12", parentPath: "M_Page_5.M_Form_7", type: "date" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_42", parentPath: "M_Page_5.M_Form_7", label: "\u5916\u51FA\u65F6\u95F4" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_13", parentPath: "M_Page_5.M_Form_7", type: "time" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_43", parentPath: "M_Page_5.M_Form_7", label: "\u5F53\u524D\u5DE5\u4F5C\u5730\u70B9" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_7", parentPath: "M_Page_5.M_Form_7", pullDataSource: pull_M_Dropdown_7, textAttrName: "\u5E38\u4F4F\u5DE5\u4F5C\u5730\u70B9", valueAttrName: "\u5E38\u4F4F\u5DE5\u4F5C\u5730\u70B9\u4EE3\u7801", label: "\u5F53\u524D\u5DE5\u4F5C\u5730\u70B9" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_44", parentPath: "M_Page_5.M_Form_7", label: "\u524D\u5F80\u5730\u57DF" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_8", parentPath: "M_Page_5.M_Form_7", pullDataSource: pull_M_Dropdown_8, textAttrName: "\u6240\u5C5E\u5730\u57DF\u540D\u79F0", valueAttrName: "\u6240\u5C5E\u5730\u57DF\u540D\u79F0\u4EE3\u7801", label: "\u524D\u5F80\u5730\u57DF" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_45", parentPath: "M_Page_5.M_Form_7", label: "\u524D\u5F80\u5730\u70B9\u540D\u79F0" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_16", parentPath: "M_Page_5.M_Form_7", type: "string", linetype: "single" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_46", parentPath: "M_Page_5.M_Form_7", label: "\u662F\u5426\u8FD4\u56DE\u9A7B\u5730" },
									React.createElement(VisibleERPC_CheckBox, { id: "M_CheckBox_0", parentPath: "M_Page_5.M_Form_7" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_47", parentPath: "M_Page_5.M_Form_7", label: "\u9884\u8BA1\u8FD4\u56DE\u65F6\u95F4" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_18", parentPath: "M_Page_5.M_Form_7", type: "time" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_48", parentPath: "M_Page_5.M_Form_7", label: "\u7528\u8F66\u7C7B\u578B" },
									React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_9", parentPath: "M_Page_5.M_Form_7", pullDataSource: pull_M_Dropdown_9, textAttrName: "\u7528\u8F66\u7C7B\u578B", valueAttrName: "\u7528\u8F66\u7C7B\u578B\u4EE3\u7801", label: "\u7528\u8F66\u7C7B\u578B" })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: "M_LC_49", parentPath: "M_Page_5.M_Form_7", label: "\u5916\u51FA\u4E8B\u7531\u8BF4\u660E" },
									React.createElement(VisibleERPC_Text, { id: "M_Text_20", parentPath: "M_Page_5.M_Form_7", type: "string", linetype: "1x" })
								),
								React.createElement(
									"button",
									{ className: "btn btn-primary erp-control ", id: "button_8", onClick: button_8_onclick },
									"\u7533\u8BF7\u63D0\u4EA4"
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

	return CM_Form_7;
}(React.PureComponent);

function CM_Form_7_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_5.M_Form_7', {});
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

var CM_Page_6 = function (_React$PureComponent22) {
	_inherits(CM_Page_6, _React$PureComponent22);

	function CM_Page_6(props) {
		_classCallCheck(this, CM_Page_6);

		return _possibleConstructorReturn(this, (CM_Page_6.__proto__ || Object.getPrototypeOf(CM_Page_6)).call(this, props));
	}

	_createClass(CM_Page_6, [{
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
					"\u5916\u51FA\u5BA1\u6838"
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
				React.createElement(VisibleCM_Form_8, { id: "M_Form_8", parentPath: "M_Page_6" })
			);
			return retElem;
		}
	}]);

	return CM_Page_6;
}(React.PureComponent);

function CM_Page_6_mapstatetoprops(state, ownprops) {
	var retProps = {};
	return retProps;
}
function CM_Page_6_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Page_6 = ReactRedux.connect(CM_Page_6_mapstatetoprops, CM_Page_6_disptchtoprops)(CM_Page_6);

var CM_Form_8 = function (_React$PureComponent23) {
	_inherits(CM_Form_8, _React$PureComponent23);

	function CM_Form_8(props) {
		_classCallCheck(this, CM_Form_8);

		var _this23 = _possibleConstructorReturn(this, (CM_Form_8.__proto__ || Object.getPrototypeOf(CM_Form_8)).call(this, props));

		ERPC_PageForm(_this23);
		return _this23;
	}

	_createClass(CM_Form_8, [{
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
										{ id: "M_LC_50", parentPath: "M_Page_6.M_Form_8", label: "\u7533\u8BF7\u4EBA\u59D3\u540D" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_11", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_51", parentPath: "M_Page_6.M_Form_8", label: "\u7533\u8BF7\u5916\u51FA\u65E5\u671F" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_14", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_52", parentPath: "M_Page_6.M_Form_8", label: "\u7533\u8BF7\u5916\u51FA\u65F6\u95F4" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_15", parentPath: "M_Page_6.M_Form_8", type: "time" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_53", parentPath: "M_Page_6.M_Form_8", label: "\u524D\u5F80\u5730\u57DF\u540D\u79F0" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_17", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_54", parentPath: "M_Page_6.M_Form_8", label: "\u524D\u5F80\u5730\u70B9\u540D\u79F0" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_19", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_55", parentPath: "M_Page_6.M_Form_8", label: "\u662F\u5426\u8FD4\u56DE" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_21", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_56", parentPath: "M_Page_6.M_Form_8", label: "\u9884\u8BA1\u8FD4\u56DE\u65F6\u95F4" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_22", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_57", parentPath: "M_Page_6.M_Form_8", label: "\u7528\u8F66\u9700\u6C42" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_23", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "single" })
									),
									React.createElement(
										VisibleERPC_LabeledControl,
										{ id: "M_LC_58", parentPath: "M_Page_6.M_Form_8", label: "\u5916\u51FA\u4E8B\u7531\u8BF4\u660E" },
										React.createElement(VisibleERPC_Text, { id: "M_Text_24", parentPath: "M_Page_6.M_Form_8", type: "string", linetype: "1x" })
									),
									React.createElement(
										"div",
										{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
										React.createElement(
											"button",
											{ className: "btn-grow flex-grow-1 btn btn-success erp-control ", id: "button_10", onClick: button_10_onclick },
											"\u540C\u610F"
										),
										React.createElement(
											"button",
											{ className: "btn-grow flex-grow-1 btn btn-danger erp-control ", id: "button_11", onClick: button_11_onclick },
											"\u62D2\u7EDD"
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

	return CM_Form_8;
}(React.PureComponent);

function CM_Form_8_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var ctlState = getStateByPath(state, 'M_Page_6.M_Form_8', {});
	retProps.fetching = ctlState.fetching;
	retProps.fetchingErr = ctlState.fetchingErr;
	retProps.records_arr = ctlState.records_arr;
	retProps.recordIndex = ctlState.recordIndex;
	retProps.nowRecord = ctlState.nowRecord;
	retProps.invalidbundle = ctlState.invalidbundle;
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_8_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_8 = ReactRedux.connect(CM_Form_8_mapstatetoprops, CM_Form_8_disptchtoprops)(CM_Form_8);

gCusValidChecker_map['M_Text_1'] = M_Text_1_validchecker;
gCusValidChecker_map['M_Text_3'] = M_Text_3_validchecker;
gCusValidChecker_map['M_Text_5'] = M_Text_5_validchecker;
gCusValidChecker_map['M_Text_7'] = M_Text_7_validchecker;
gCusValidChecker_map['M_Text_8'] = M_Text_8_validchecker;
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
