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
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.recordIndex': bind_M_Form_0.bind(window) };
var pageRouter = [];

function pageLoadedReducer(state) {
	return gotoPage('M_Page_1', state);
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
		needSetState['M_Label_0.text'] = nowRecord['凭证统计年份'];
		needSetState['M_Label_1.text'] = nowRecord['凭证统计月份'];
		needSetState['M_Label_2.text'] = nowRecord['凭证种类名称'];
		needSetState['M_Label_3.text'] = nowRecord['关联员工姓名'];
		needSetState['M_Label_4.text'] = nowRecord['关联项目名称'];
		needSetState['M_Label_5.text'] = nowRecord['关联客户名称'];
		needSetState['M_Label_6.text'] = nowRecord['记帐发生金额'];
		needSetState['M_Label_7.text'] = nowRecord['借方科目全称'];
		needSetState['M_Label_8.text'] = nowRecord['贷方科目全称'];
		needSetState['M_Label_9.text'] = nowRecord['凭证摘要说明'];
		needSetState['M_Text_0.value'] = nowRecord['凭证摘要说明'];
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
				scriptBP_0_msg.setData(err.info, EMessageBoxType.Error, '确认修改');
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
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_0_msg = PopMessageBox('', EMessageBoxType.Loading, '确认修改');;
	if (M_Text_0_value == M_Form_0_nowRecord['凭证摘要说明']) {
		var ret = callback_final(state, null, { info: '没有做任何编辑。' });
		return ret == null ? state : ret;
	} else {
		var bundle_insert_table_0 = {
			财务凭证记录代码: M_Form_0_nowRecord['财务凭证记录代码'],
			原始摘要: M_Form_0_nowRecord['凭证摘要说明'],
			M_Text_0_value: M_Text_0_value,
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
	var M_Form_0_nowRecord = getStateByPath(state, 'M_Page_0.M_Form_0.nowRecord');
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
				scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '不需修改');
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
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_1_onclick'] = fetchid;
	scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '不需修改');;
	var bundle_insert_table_0 = {
		财务凭证记录代码: M_Form_0_nowRecord['财务凭证记录代码'],
		原始摘要: M_Form_0_nowRecord['凭证摘要说明'],
		校核摘要: M_Form_0_nowRecord['凭证摘要说明'],
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
	state.nowPage = 'M_Page_2';
	if (gDataCache.get('M_Page_2_opened')) {
		return state;
	}
	gDataCache.set('M_Page_2_opened', 1);
	setTimeout(function () {}, 50);
	return state;
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
					}
				}
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
								{ id: 'M_LC_9', parentPath: 'M_Page_0.M_Form_0', label: '\u51ED\u8BC1\u6458\u8981\u8BF4\u660E' },
								React.createElement(VisibleERPC_Label, { className: 'erp-control ', id: 'M_Label_9', parentPath: 'M_Page_0.M_Form_0', type: 'string' })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_10', parentPath: 'M_Page_0.M_Form_0', label: '\u6458\u8981\u7F16\u8F91' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_0', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '2x' })
							),
							React.createElement(
								'div',
								{ className: 'btn-group flex-grow-0 flex-shrink-0 d-flex erp-control ' },
								React.createElement(
									'button',
									{ className: 'flex-grow-1 btn btn-success erp-control ', id: 'button_0', onClick: button_0_onclick },
									'\u786E\u8BA4\u4FEE\u6539'
								),
								React.createElement(
									'button',
									{ className: 'flex-grow-1 btn btn-secondary erp-control ', id: 'button_1', onClick: button_1_onclick },
									'\u4E0D\u9700\u4FEE\u6539'
								)
							)
						),
						this.renderNavigater()
					);
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
			retElem = React.createElement('div', { className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column ' });
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
