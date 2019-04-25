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
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/QJDJ';
var thisAppTitle = '请假登记';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window), ReBindM_Form_3Page: bind_M_Form_3Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_2.M_Form_1.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_Form_0.pageIndex': bind_M_Form_0.bind(window), 'M_Page_0.M_Form_2.records_arr': fresh_M_Form_2.bind(window), 'M_Page_0.M_Form_2.recordIndex': bind_M_Form_2.bind(window), 'M_Page_0.M_Form_2.M_Form_3.records_arr': fresh_M_Form_3.bind(window), 'M_Page_0.M_Form_2.M_Form_3.pageIndex': bind_M_Form_3.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_0.value': M_Dropdown_0_value_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_0.text': M_Dropdown_0_text_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_1.value': M_Dropdown_1_value_changed.bind(window), 'M_Page_2.M_Form_1.M_LC_3.visible': M_LC_3_visible_changed.bind(window), 'M_Page_0.M_Form_2.M_LC_14.visible': M_LC_14_visible_changed.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	var flowStep = parseInt(getQueryVariable('flowStep'));
	var targetPageID = 'M_Page_2';
	switch (flowStep) {
		case 10:
			{
				targetPageID = 'M_Page_0';
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
	var M_Dropdown_0_text = bundle != null && bundle['M_Dropdown_0_text'] != null ? bundle['M_Dropdown_0_text'] : M_Dropdown_0_state.text;
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
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_text, 'string', false, 'M_Dropdown_0', validErrState);
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
			var bundle_queryfb_1 = {
				员工代码: M_Dropdown_0_value
			};
			setTimeout(function () {
				if (fetchTracer['M_Text_4_defaultvalue_get'] != fetchid) return;
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_queryfb_1, action: 'queryfb_1' }, makeFTD_Callback(function (state, data_queryfb_1, error_queryfb_1) {
					if (error_queryfb_1) {
						return callback_final(state, null, error_queryfb_1);
					}
					var ret = callback_final(state, data_queryfb_0 + '[RTX:' + data_queryfb_1 + ']' + M_Dropdown_0_text, null);
					return ret == null ? state : ret;
				}, false)));
			}, 50);
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
function M_Dropdown_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_Text_4.value'] = M_Text_4_defaultvalue_get(state);
	if (delayActs['call_pull_M_Form_0'] == null) {
		delayActs['call_pull_M_Form_0'] = { callfun: pull_M_Form_0 };
	};
	return setManyStateByPath(state, '', needSetState);
}
function M_Dropdown_0_text_changed(state, newValue, oldValue, path, visited, delayActs) {
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

gCusValidChecker_map['M_Text_1'] = M_Text_1_validchecker;
gCusValidChecker_map['M_Text_3'] = M_Text_3_validchecker;
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
