'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/WCSH';
var thisAppTitle = '外出审核';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.recordIndex': bind_M_Form_0.bind(window) };

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
		needSetState['M_Text_0.value'] = nowRecord['申请人姓名'];
		needSetState['M_Text_4.value'] = nowRecord['申请外出日期'];
		needSetState['M_Text_8.value'] = nowRecord['申请外出时间'];
		needSetState['M_Text_9.value'] = nowRecord['当前工作地点'];
		needSetState['M_Text_11.value'] = nowRecord['前往地域名称'];
		needSetState['M_Text_15.value'] = nowRecord['前往地点名称'];
		needSetState['M_Text_12.value'] = nowRecord['用车需求'];
		needSetState['M_CheckBox_0.value'] = nowRecord['是否返回驻地'];
		needSetState['M_Text_14.value'] = nowRecord['预计返回时间'];
		needSetState['M_Text_16.value'] = nowRecord['外出事由说明'];
		needSetState['M_LC_11.visible'] = M_LC_11_isdisplay_get(retState, bundle);
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
function M_LC_11_isdisplay_get(state, bundle) {
	var M_Form_0_nowRecord = bundle != null && bundle.M_Form_0_nowRecord != null ? bundle.M_Form_0_nowRecord : getStateByPath(state, 'M_Page_0.M_Form_0.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_0_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_0_nowRecord['是否返回驻地'] == 1;
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_0_nowRecord = getStateByPath(state, 'M_Page_0.M_Form_0.nowRecord');
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
				scriptBP_3_msg.setData(err.info, EMessageBoxType.Error, '通过申请');
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
	if (IsEmptyString(M_Form_0_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['button_0_onclick'] = fetchid;
	scriptBP_3_msg = PopMessageBox('', EMessageBoxType.Loading, '通过申请');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_0_nowRecord['员工外出记录代码'],
		审核确认状态: 1,
		M_Form_0_员工外出记录代码: M_Form_0_nowRecord['员工外出记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: '_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				fresh_M_Form_0(state);
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
				scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '拒绝申请');
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
	scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '拒绝申请');;
	var bundle_update_table_0 = {
		RCDKEY: M_Form_0_nowRecord['员工外出记录代码'],
		审核确认状态: 2,
		M_Form_0_员工外出记录代码: M_Form_0_nowRecord['员工外出记录代码']
	};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: '_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
			if (err_update_table_0 == null) {
				fresh_M_Form_0(state);
				var ret = callback_final(state, data_update_table_0, null);
				return ret == null ? state : ret;
			} else {
				return callback_final(state, data_update_table_0, err_update_table_0);
			}
		})));
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
			return React.createElement(
				'div',
				{ className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
				React.createElement(
					'h3',
					null,
					'\u5916\u51FA\u5BA1\u6838'
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
							{ className: 'd-flex flex-grow-1  flex-column' },
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_0', parentPath: 'M_Page_0.M_Form_0', label: '\u5458\u5DE5\u59D3\u540D' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_0', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_2', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u65E5\u671F' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_4', parentPath: 'M_Page_0.M_Form_0', type: 'date', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_4', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u65F6\u95F4' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_8', parentPath: 'M_Page_0.M_Form_0', type: 'time', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_6', parentPath: 'M_Page_0.M_Form_0', label: '\u5DE5\u4F5C\u5730\u70B9' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_9', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_8', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u5730\u57DF' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_11', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_12', parentPath: 'M_Page_0.M_Form_0', label: '\u5730\u70B9\u540D\u79F0' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_15', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_9', parentPath: 'M_Page_0.M_Form_0', label: '\u7528\u8F66\u9700\u6C42' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_12', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: 'single', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_10', parentPath: 'M_Page_0.M_Form_0', label: '\u662F\u5426\u8FD4\u56DE\u9A7B\u5730' },
								React.createElement(VisibleERPC_CheckBox, { id: 'M_CheckBox_0', parentPath: 'M_Page_0.M_Form_0' })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_11', parentPath: 'M_Page_0.M_Form_0', label: '\u8FD4\u56DE\u65F6\u95F4' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_14', parentPath: 'M_Page_0.M_Form_0', type: 'time', readonly: true })
							),
							React.createElement(
								VisibleERPC_LabeledControl,
								{ id: 'M_LC_13', parentPath: 'M_Page_0.M_Form_0', label: '\u5916\u51FA\u4E8B\u7531' },
								React.createElement(VisibleERPC_Text, { id: 'M_Text_16', parentPath: 'M_Page_0.M_Form_0', type: 'string', linetype: '1x', readonly: true })
							),
							React.createElement(
								'div',
								{ className: 'btn-group flex-grow-0 flex-shrink-0 d-flex erp-control ' },
								React.createElement(
									'button',
									{ className: 'flex-grow-1 btn btn-success erp-control ', id: 'button_0', onClick: button_0_onclick },
									'\u901A\u8FC7\u7533\u8BF7'
								),
								React.createElement(
									'button',
									{ className: 'flex-grow-1 btn btn-danger erp-control ', id: 'button_1', onClick: button_1_onclick },
									'\u62D2\u7EDD\u7533\u8BF7'
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
