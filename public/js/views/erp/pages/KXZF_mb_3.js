'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/KXZF';
var thisAppTitle = '款项支付';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = {};
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
	needSetState['M_Dropdown_5.value'] = M_Dropdown_5_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_1.value'] = M_Dropdown_1_defaultvalue_get(retState, bundle);
	needSetState['M_Text_2.value'] = null;
	needSetState['M_Dropdown_2.value'] = M_Dropdown_2_defaultvalue_get(retState, bundle);
	needSetState['M_Dropdown_3.value'] = M_Dropdown_3_defaultvalue_get(retState, bundle);
	needSetState['M_Text_5.value'] = null;
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
function M_Dropdown_0_defaultvalue_get(state, bundle) {
	return g_envVar.userid;
}
function pull_M_Dropdown_0() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Dropdown_5_defaultvalue_get(state, bundle) {
	return 1;
}
function pull_M_Dropdown_5() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_5' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_5', 'options_arr', false), EFetchKey.FetchPropValue));
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
	return '金额不能小于0';
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
function pull_M_Dropdown_4() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_4' }, makeFTD_Prop('M_Page_0.M_Form_0', 'M_Dropdown_4', 'options_arr', false), EFetchKey.FetchPropValue));
}
function button_1_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Dropdown_0_state = getStateByPath(M_Form_0_state, 'M_Dropdown_0', {});
	var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
	var M_Dropdown_0_value = M_Dropdown_0_state.value;
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
				scriptBP_6_msg.setData(err.info, EMessageBoxType.Error, '登记提交');
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
	validErr = BaseIsValueValid(state, M_LC_0_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
	validErrState['M_Page_0.M_Form_0.M_Dropdown_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
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
	scriptBP_6_msg = PopMessageBox('', EMessageBoxType.Loading, '登记提交');;
	var bundle_querysql_0 = {
		员工代码: M_Dropdown_0_value
	};
	setTimeout(function () {
		if (fetchTracer['button_1_onclick'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_6_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				return callback_final(state, null, error_querysql_0);
			}
			var bundle_insert_table_0 = {
				M_Dropdown_4_value: M_Dropdown_4_value,
				M_Dropdown_0_value: M_Dropdown_0_value,
				M_Dropdown_1_value: M_Dropdown_1_value,
				M_Text_7_value: M_Text_7_value,
				M_Text_8_value: M_Text_8_value,
				M_Text_2_value: M_Text_2_value,
				M_Dropdown_2_value: M_Dropdown_2_value,
				M_Dropdown_3_value: M_Dropdown_3_value,
				M_Text_5_value: M_Text_5_value,
				入帐公司名称代码: querysql_0_所属公司名称代码
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'button_1_onclick_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
					if (err_insert_table_0 == null) {
						fresh_M_Form_0(state);
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
			var routeElem = pageRouter.length > 1 ? React.createElement('i', { className: 'fa fa-arrow-left' }) : null;
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					{ onClick: pageRoute_Back },
					routeElem,
					'\u76F4\u63A5\u652F\u4ED8'
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
									{ id: 'M_LC_9', parentPath: 'M_Page_0.M_Form_0', label: '\u9879\u76EE\u8FD0\u884C\u9636\u6BB5' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_5', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_5, textAttrName: '\u9879\u76EE\u8FD0\u884C\u9636\u6BB5', valueAttrName: '\u9879\u76EE\u8FD0\u884C\u9636\u6BB5\u4EE3\u7801', label: '\u9879\u76EE\u8FD0\u884C\u9636\u6BB5' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_1', parentPath: 'M_Page_0.M_Form_0', label: '\u9879\u76EE\u540D\u79F0' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_1', parentPath: 'M_Page_0.M_Form_0', groupAttr: '\u9879\u76EE\u72B6\u6001\u540D\u79F0,\u9879\u76EE\u5E94\u7528\u9886\u57DF', pullDataSource: pull_M_Dropdown_1, textAttrName: '\u9879\u76EE\u767B\u8BB0\u540D\u79F0', valueAttrName: '\u9879\u76EE\u767B\u8BB0\u540D\u79F0\u4EE3\u7801', label: '\u9879\u76EE\u540D\u79F0' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_2', parentPath: 'M_Page_0.M_Form_0', label: '\u7533\u8BF7\u652F\u4ED8\u91D1\u989D' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_2', parentPath: 'M_Page_0.M_Form_0', type: 'float', precision: '2' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_3', parentPath: 'M_Page_0.M_Form_0', label: '\u8D27\u5E01\u79CD\u7C7B' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_2', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_2, textAttrName: '\u7ED3\u7B97\u8D27\u5E01\u79CD\u7C7B', valueAttrName: '\u7ED3\u7B97\u8D27\u5E01\u79CD\u7C7B\u4EE3\u7801', label: '\u8D27\u5E01\u79CD\u7C7B' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_4', parentPath: 'M_Page_0.M_Form_0', label: '\u652F\u4ED8\u65B9\u5F0F' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_3', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_3, textAttrName: '\u6536\u652F\u65B9\u5F0F\u79CD\u7C7B', valueAttrName: '\u6536\u652F\u65B9\u5F0F\u79CD\u7C7B\u4EE3\u7801', label: '\u652F\u4ED8\u65B9\u5F0F' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_5', parentPath: 'M_Page_0.M_Form_0', label: '\u5BF9\u65B9\u94F6\u884C\u8D26\u53F7' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_5', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_6', parentPath: 'M_Page_0.M_Form_0', label: '\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531' },
									React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_4', parentPath: 'M_Page_0.M_Form_0', pullDataSource: pull_M_Dropdown_4, textAttrName: '\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531', valueAttrName: '\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531\u4EE3\u7801', label: '\u76F4\u63A5\u652F\u4ED8\u4E8B\u7531' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_7', parentPath: 'M_Page_0.M_Form_0', label: '\u4E8B\u7531\u8981\u6C42\u7528\u9014' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_7', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '1x' })
								),
								React.createElement(
									VisibleERPC_LabeledControl,
									{ id: 'M_LC_8', parentPath: 'M_Page_0.M_Form_0', label: '\u91D1\u989D\u6570\u91CF\u8BE6\u8FF0' },
									React.createElement(VisibleERPC_Text, { id: 'M_Text_8', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '1x' })
								),
								React.createElement(
									'button',
									{ className: 'btn btn-primary erp-control ', id: 'button_1', onClick: button_1_onclick },
									'\u767B\u8BB0\u63D0\u4EA4'
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
