'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/WCSQ';
var thisAppTitle = '外出申请';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.M_CheckBox_0.value': M_CheckBox_0_value_changed.bind(window) };

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
	needSetState['M_Dropdown_0.value'] = M_Dropdown_0_defaultvalue_get(retState, bundle);
	needSetState['M_Text_1.value'] = M_Text_1_defaultvalue_get(retState, bundle);
	needSetState['M_Text_4.value'] = M_Text_4_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_1.value'] = M_Dropdown_1_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_2.text'] = null;
	needSetState['M_Dropdown_2.value'] = null;
	needSetState['M_Text_3.value'] = M_Text_3_defaultvalue_get(retState, bundle);
	needSetState['M_CheckBox_0.value'] = '0';
	needSetState['M_Text_0.value'] = null;
	needSetState['M_Dropdown_3.value'] = M_Dropdown_3_defaultvalue_get(retState, bundle);
	needSetState['M_Text_10.value'] = null;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	return retState;
}
function pull_M_Form_0(retState) {
	var hadStateParam = retState != null;
	retState = bind_M_Form_0(retState);
	return retState;
}
function M_Dropdown_0_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_1_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function M_Text_4_defaultvalue_get(state, bundle) {
	return getFormatTimeString(new Date(), false);
}
function M_Dropdown_1_defaultvalue_get(state, bundle) {
	var 未命名_0;
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
function M_Text_3_defaultvalue_get(state, bundle) {
	return g_envVar.workRegionCode;
}
function M_LC_7_isdisplay_get(state, bundle) {
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_CheckBox_0_state = getStateByPath(M_Form_0_state, 'M_CheckBox_0', {});
	var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
	var M_CheckBox_0_value = bundle != null && bundle['M_CheckBox_0_value'] != null ? bundle['M_CheckBox_0_value'] : M_CheckBox_0_state.value;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	validErr = BaseIsValueValid(state, M_LC_6_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_CheckBox_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_CheckBox_0_value == 1;
}
function M_Dropdown_3_defaultvalue_get(state, bundle) {
	return 1;
}
function pull_M_Dropdown_3() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_3' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_3', 'options_arr', false), EFetchKey.FetchPropValue));
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Dropdown_0_state = getStateByPath(M_Form_0_state, 'M_Dropdown_0', {});
	var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
	var M_Dropdown_0_value = M_Dropdown_0_state.value;
	var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
	var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
	var M_Text_1_value = M_Text_1_state.value;
	var M_Text_4_state = getStateByPath(M_Form_0_state, 'M_Text_4', {});
	var M_LC_4_state = getStateByPath(M_Form_0_state, 'M_LC_4', {});
	var M_Text_4_value = M_Text_4_state.value;
	var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
	var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
	var M_Dropdown_1_value = M_Dropdown_1_state.value;
	var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
	var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
	var M_Dropdown_2_value = M_Dropdown_2_state.value;
	var M_Text_3_state = getStateByPath(M_Form_0_state, 'M_Text_3', {});
	var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
	var M_Text_3_value = M_Text_3_state.value;
	var M_CheckBox_0_state = getStateByPath(M_Form_0_state, 'M_CheckBox_0', {});
	var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
	var M_CheckBox_0_value = M_CheckBox_0_state.value;
	var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
	var M_LC_7_state = getStateByPath(M_Form_0_state, 'M_LC_7', {});
	var M_Text_0_value = M_Text_0_state.value;
	var M_Dropdown_3_state = getStateByPath(M_Form_0_state, 'M_Dropdown_3', {});
	var M_LC_8_state = getStateByPath(M_Form_0_state, 'M_LC_8', {});
	var M_Dropdown_3_value = M_Dropdown_3_state.value;
	var M_Text_10_state = getStateByPath(M_Form_0_state, 'M_Text_10', {});
	var M_LC_10_state = getStateByPath(M_Form_0_state, 'M_LC_10', {});
	var M_Text_10_value = M_Text_10_state.value;
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
				scriptBP_10_msg.setData(err.info, EMessageBoxType.Error, '提交');
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
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'date', false, 'M_Text_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_4_state, M_Text_4_state, M_Text_4_value, 'time', false, 'M_Text_4', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_4.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_1.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_5_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_2.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_3_state, M_Text_3_state, M_Text_3_value, 'string', false, 'M_Text_3', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_3.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_6_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_CheckBox_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_7_state, M_Text_0_state, M_Text_0_value, 'time', true, 'M_Text_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_8_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_3.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	validErr = BaseIsValueValid(state, M_LC_10_state, M_Text_10_state, M_Text_10_value, 'string', false, 'M_Text_10', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Text_10.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_10_msg = PopMessageBox('', EMessageBoxType.Loading, '提交');;
	var bundle_insert_table_0 = {
		M_Dropdown_1_value: M_Dropdown_1_value,
		M_Text_10_value: M_Text_10_value,
		M_Dropdown_2_value: M_Dropdown_2_value,
		M_Text_3_value: M_Text_3_value,
		M_CheckBox_0_value: M_CheckBox_0_value,
		M_Text_0_value: M_Text_0_value,
		M_Dropdown_0_value: M_Dropdown_0_value,
		M_Text_1_value: M_Text_1_value,
		M_Text_4_value: M_Text_4_value,
		M_Dropdown_3_value: M_Dropdown_3_value
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: '_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
			if (err_insert_table_0 == null) {
				fresh_M_Form_0(state);
				var ret = callback_final(state, data_insert_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_insert_table_0, err_insert_table_0);
			}
		})));
	}, 50);
}
function M_CheckBox_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_0.M_Form_0.M_LC_7.visible'] = M_LC_7_isdisplay_get(state);
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
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					null,
					'\u5916\u51FA\u7533\u8BF7'
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
						retElem = React.createElement(
							'div',
							{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
							React.createElement(
								'div',
								{ className: 'd-flex flex-grow-1  flex-column' },
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_0', parentPath: 'M_Page_0.M_Form_0', label: '\u5458\u5DE5\u59D3\u540D' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_0', parentPath: 'M_Page_0.M_Form_0', groupAttr: '\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0', pullDataSource: pull_M_Dropdown_0, textAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D', valueAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801', label: '\u5458\u5DE5\u59D3\u540D' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_1', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u65E5\u671F' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_1', parentPath: 'M_Page_0.M_Form_0', type: 'date' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_4', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u65F6\u95F4' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_4', parentPath: 'M_Page_0.M_Form_0', type: 'time' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_2', parentPath: 'M_Page_0.M_Form_0', label: '\u5DE5\u4F5C\u5730\u70B9' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_1', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_1, textAttrName: '\u5E38\u4F4F\u5DE5\u4F5C\u5730\u70B9', valueAttrName: '\u5E38\u4F4F\u5DE5\u4F5C\u5730\u70B9\u4EE3\u7801', label: '\u5DE5\u4F5C\u5730\u70B9' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_5', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u5730\u57DF' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_2', parentPath: 'M_Page_0.M_Form_0', groupAttr: '\u4E00\u7EA7\u5730\u57DF\u540D\u79F0,\u4E8C\u7EA7\u5730\u57DF\u540D\u79F0', pullDataSource: pull_M_Dropdown_2, textAttrName: '\u6240\u5C5E\u5730\u57DF\u540D\u79F0', valueAttrName: '\u6240\u5C5E\u5730\u57DF\u540D\u79F0\u4EE3\u7801', label: '\u5916\u51FA\u5730\u57DF' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_3', parentPath: 'M_Page_0.M_Form_0', label: '\u5730\u70B9\u540D\u79F0' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_3', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_6', parentPath: 'M_Page_0.M_Form_0', label: '\u662F\u5426\u8FD4\u56DE' },
									React.createElement(VisibleERPC_CheckBox, { id: 'M_CheckBox_0', parentPath: 'M_Page_0.M_Form_0' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_7', parentPath: 'M_Page_0.M_Form_0', label: '\u8FD4\u56DE\u65F6\u95F4' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_0', parentPath: 'M_Page_0.M_Form_0', type: 'time', nullable: true })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_8', parentPath: 'M_Page_0.M_Form_0', label: '\u7528\u8F66\u9700\u6C42' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_3', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_3, textAttrName: '\u9700\u6C42\u7528\u8F66\u540D\u79F0', valueAttrName: '\u5916\u51FA\u7528\u8F66\u9700\u6C42\u4EE3\u7801', label: '\u7528\u8F66\u9700\u6C42' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_10', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u4E8B\u7531' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_10', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '1x' })
								),
								React.createElement(
									'button',
									{ className: 'btn btn-success erp-control ', id: 'button_0', onClick: button_0_onclick },
									'\u63D0\u4EA4'
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