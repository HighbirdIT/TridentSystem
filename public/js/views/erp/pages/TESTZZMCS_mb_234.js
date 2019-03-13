'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/ZZMCS';
var thisAppTitle = '赵智淼测试';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_2.M_Form_1.M_Dropdown_0.value': M_Dropdown_0_value_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_0.text': M_Dropdown_0_text_changed.bind(window), 'M_Page_2.M_Form_1.M_Dropdown_1.value': M_Dropdown_1_value_changed.bind(window), 'M_Page_2.M_Form_1.M_LC_3.visible': M_LC_3_visible_changed.bind(window) };

function pageLoadedReducer(state) {
	return gotoPage('M_Page_2', state);
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
		case 'M_Page_2':
			{
				retState = active_M_Page_2(retState);
				break;
			}
	}
	return Object.assign({}, retState);
}
function active_M_Page_2(state) {
	state.nowPage = 'M_Page_2';
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
	needSetState['M_Text_1.value'] = M_Text_1_defaultvalue_get(retState, bundle);
	needSetState['M_Text_2.value'] = M_Text_2_defaultvalue_get(retState, bundle);
	needSetState['M_Text_5.value'] = '17:30';
	needSetState['invalidbundle'] = false;
	return setManyStateByPath(retState, 'M_Page_2.M_Form_1', needSetState);
}
function pull_M_Form_1(retState) {
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
function pull_M_Dropdown_1() {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop('M_Page_2.M_Form_1', 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_4_defaultvalue_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1');
	var M_Dropdown_0_value = bundle != null && bundle['M_Dropdown_0_value'] != null ? bundle['M_Dropdown_0_value'] : getStateByPath(M_Form_1_state, 'M_Dropdown_0.value');
	var M_Dropdown_0_text = bundle != null && bundle['M_Dropdown_0_text'] != null ? bundle['M_Dropdown_0_text'] : getStateByPath(M_Form_1_state, 'M_Dropdown_0.text');
	var M_Dropdown_1_value = bundle != null && bundle['M_Dropdown_1_value'] != null ? bundle['M_Dropdown_1_value'] : getStateByPath(M_Form_1_state, 'M_Dropdown_1.value');
	var callback_final = function callback_final(state, data, err) {
		var needSetState = {};
		needSetState.value = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Text_4', needSetState);
	};
	if (IsEmptyString(M_Dropdown_0_value) || IsEmptyString(M_Dropdown_0_text) || IsEmptyString(M_Dropdown_1_value)) {
		return callback_final(state, null, { info: '条件不足' });
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
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_queryfb_0, action: '_query_FB员工请假提示' }, makeFTD_Callback(function (state, data_queryfb_0, err) {
			var bundle_queryfb_1 = {
				员工代码: M_Dropdown_0_value
			};
			setTimeout(function () {
				if (fetchTracer['M_Text_4_defaultvalue_get'] != fetchid) return;
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_queryfb_1, action: '_query_FB查询RTX状态' }, makeFTD_Callback(function (state, data_queryfb_1, err) {
					var ret = callback_final(state, data_queryfb_0 + '[RTX:' + data_queryfb_1 + ']' + M_Dropdown_0_text, err);
					return ret == null ? state : ret;
				}, false)));
			}, 50);
		}, false)));
	}, 50);
	return null;
}
function M_Text_1_defaultvalue_get(state, bundle) {
	return getFormatDateString(new Date());
}
function M_LC_3_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1');
	var M_Dropdown_1_value = bundle != null && bundle['M_Dropdown_1_value'] != null ? bundle['M_Dropdown_1_value'] : getStateByPath(M_Form_1_state, 'M_Dropdown_1.value');
	var callback_final = function callback_final(state, data, err) {
		var needSetState = {};
		needSetState.visible = err == null ? data : null;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_LC_3', needSetState);
	};
	if (IsEmptyString(M_Dropdown_1_value)) {
		return callback_final(state, null, { info: '条件不足' });
	}
	return M_Dropdown_1_value == 11;
	return null;
}
function M_Text_2_defaultvalue_get(state, bundle) {
	return getFormatTimeString(new Date(), false);
}
function M_Label_0_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1');
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : getStateByPath(M_Form_1_state, 'M_LC_3.visible');
	var callback_final = function callback_final(state, data, err) {
		var needSetState = {};
		needSetState.visible = err == null ? data : null;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Label_0', needSetState);
	};
	if (IsEmptyString(M_LC_3_visible)) {
		return callback_final(state, null, { info: '条件不足' });
	}
	return M_LC_3_visible == true;
	return null;
}
function M_LC_6_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1');
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : getStateByPath(M_Form_1_state, 'M_LC_3.visible');
	var callback_final = function callback_final(state, data, err) {
		var needSetState = {};
		needSetState.visible = err == null ? data : null;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_LC_6', needSetState);
	};
	if (IsEmptyString(M_LC_3_visible)) {
		return callback_final(state, null, { info: '条件不足' });
	}
	return M_LC_3_visible;
	return null;
}
function button_4_onclik() {
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1');
	var M_Dropdown_0_value = getStateByPath(M_Form_1_state, 'M_Dropdown_0.value');
	var M_Dropdown_1_value = getStateByPath(M_Form_1_state, 'M_Dropdown_1.value');
	var M_Text_4_value = getStateByPath(M_Form_1_state, 'M_Text_4.value');
	var M_Text_1_value = getStateByPath(M_Form_1_state, 'M_Text_1.value');
	var M_Text_2_value = getStateByPath(M_Form_1_state, 'M_Text_2.value');
	var M_Text_3_value = getStateByPath(M_Form_1_state, 'M_Text_3.value');
	var M_Text_5_value = getStateByPath(M_Form_1_state, 'M_Text_5.value');
	var M_Text_6_value = getStateByPath(M_Form_1_state, 'M_Text_6.value');
	var callback_final = function callback_final(state, data, err) {};
	if (IsEmptyString(M_Dropdown_0_value) || IsEmptyString(M_Dropdown_1_value) || IsEmptyString(M_Text_4_value) || IsEmptyString(M_Text_1_value) || IsEmptyString(M_Text_2_value) || IsEmptyString(M_Text_3_value) || IsEmptyString(M_Text_5_value) || IsEmptyString(M_Text_6_value)) {
		return callback_final(state, null, { info: '条件不足' });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_4_onclik'] = fetchid;
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
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: '_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
			if (err_insert_table_0 == null) {}
		})));
	}, 50);
}
function M_Dropdown_0_value_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_Text_4.value'] = M_Text_4_defaultvalue_get(state);
	return setManyStateByPath(state, '', needSetState);
}
function M_Dropdown_0_text_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
	needSetState['M_Page_2.M_Form_1.M_Text_4.value'] = M_Text_4_defaultvalue_get(state);
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
	needSetState['M_Page_2.M_Form_1.M_Label_0.visible'] = M_Label_0_isdisplay_get(state);
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
		key: 'render',
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
				'div',
				{ className: 'w-100 h-100' },
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
					'\u8BF7\u5047\u7533\u8BF7'
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

var CM_Form_1 = function (_React$PureComponent3) {
	_inherits(CM_Form_1, _React$PureComponent3);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this3 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_PageForm(_this3);
		return _this3;
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
			if (this.props.invalidbundle) {
				return renderInvalidBundleDiv();
			}
			if (this.props.fetchingErr) {
				return renderFetcingErrDiv(this.props.fetchingErr.info);
			}
			if (!this.props.loaded || this.props.fetching) {
				return renderFetcingTipDiv();
			}
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_0', parentPath: 'M_Page_2.M_Form_1', label: '\u8BF7\u5047\u4EBA\u5458' },
					React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_0', parentPath: 'M_Page_2.M_Form_1', pullDataSource: pull_M_Dropdown_0, textAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D', valueAttrName: '\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801', label: '\u8BF7\u5047\u4EBA\u5458' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_1', parentPath: 'M_Page_2.M_Form_1', label: '\u5047\u671F\u79CD\u7C7B' },
					React.createElement(VisibleERPC_DropDown, { id: 'M_Dropdown_1', parentPath: 'M_Page_2.M_Form_1', pullDataSource: pull_M_Dropdown_1, textAttrName: '\u5458\u5DE5\u5047\u671F\u79CD\u7C7B', valueAttrName: '\u5458\u5DE5\u5047\u671F\u79CD\u7C7B\u4EE3\u7801', label: '\u5047\u671F\u79CD\u7C7B' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_5', parentPath: 'M_Page_2.M_Form_1', label: '\u5F53\u524D\u72B6\u6001' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_4', parentPath: 'M_Page_2.M_Form_1', type: 'string', linetype: '1x', readonly: true })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_2', parentPath: 'M_Page_2.M_Form_1', label: '\u8D77\u59CB\u65E5\u671F' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_1', parentPath: 'M_Page_2.M_Form_1', type: 'date' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_3', parentPath: 'M_Page_2.M_Form_1', label: '\u8D77\u59CB\u65F6\u95F4' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_2', parentPath: 'M_Page_2.M_Form_1', type: 'time' })
				),
				React.createElement(VisibleERPC_Label, { className: 'text-primary erp-control ', id: 'M_Label_0', parentPath: 'M_Page_2.M_Form_1', text: '\u5F53\u65E5\u4E34\u65F6\u5047\u7684\u8D77\u59CB\u65F6\u95F4\u4ECE\u767B\u8BB0\u7684\u4E00\u523B\u5F00\u59CB\uFF0C\u4E0D\u53EF\u53D8\u66F4\u3002' }),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_4', parentPath: 'M_Page_2.M_Form_1', label: '\u7ED3\u675F\u65E5\u671F' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_3', parentPath: 'M_Page_2.M_Form_1', type: 'date' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_6', parentPath: 'M_Page_2.M_Form_1', label: '\u7ED3\u675F\u65F6\u95F4' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_5', parentPath: 'M_Page_2.M_Form_1', type: 'time' })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: 'M_LC_7', parentPath: 'M_Page_2.M_Form_1', label: '\u4E8B\u7531\u8BF4\u660E' },
					React.createElement(VisibleERPC_Text, { id: 'M_Text_6', parentPath: 'M_Page_2.M_Form_1', type: 'string', linetype: '1x' })
				),
				React.createElement(
					'button',
					{ className: 'btn btn-primary erp-control ', id: 'button_4', onClick: button_4_onclik },
					'\u63D0\u4EA4\u7533\u8BF7'
				),
				this.renderNavigater()
			);
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

if (g_envVar.userid != null) {
	ErpControlInit();
	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(VisibleApp, null)
	), document.getElementById('reactRoot'));
} else {
	location.href = '/?goto=' + location.pathname;
}
store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));