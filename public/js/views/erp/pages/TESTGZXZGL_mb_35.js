"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_0_style = { "height": "500px" };
var M_Form_0headstyle0 = { "width": "12.5%", "maxWidth": "12.5%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle0 = { "width": "12.5%", "maxWidth": "12.5%", "verticalAlign": "middle" };
var M_Form_0headstyle1 = { "width": "62.5%", "maxWidth": "62.5%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle1 = { "width": "62.5%", "maxWidth": "62.5%", "verticalAlign": "middle" };
var M_Form_0headstyle2 = { "width": "25%", "maxWidth": "25%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle2 = { "width": "25%", "maxWidth": "25%", "verticalAlign": "middle" };
var M_Form_0_tableStyle = { "marginTop": "-50px" };
var M_Form_0_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/GZXZGL';
var thisAppTitle = '工作小组管理';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.pageIndex': bind_M_Form_0.bind(window) };
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
	setTimeout(function () {
		pull_M_Form_0();
	}, 50);
	return state;
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = true;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
	return bind_M_Form_0Page(retState);
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
function bind_M_Form_0Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var startRowIndex = 0;
	var endRowIndex = records_arr.length - 1;
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_0.text'] = nowRecord['工作小组代码'];
		needSetState['row_' + rowIndex + '.M_Text_1.value'] = nowRecord['工作小组名称'];
		needSetState['row_' + rowIndex + '.M_Dropdown_0.value'] = nowRecord['登记确认用户'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}
function pull_M_Dropdown_0(parentPath) {
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop(parentPath, 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
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
					"\u4E3B\u9875\u9762"
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
				React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_0", title: "\u6240\u6709\u5C0F\u7EC4", pagebreak: false, reBindAT: "ReBindM_Form_0Page" })
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

		ERPC_GridForm(_this3);
		_this3.tableBodyScroll = _this3.tableBodyScroll.bind(_this3);
		_this3.btns = [{ key: 'edit', content: React.createElement("i", { className: "fa fa-edit" }), handler: _this3.onUpdate.bind(_this3) }, { key: 'delete', content: React.createElement("i", { className: "fa fa-trash text-danger" }), handler: _this3.onDelete.bind(_this3) }];
		_this3.state = {};
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
						if (this.state.hadNewRow != true && !this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
							retElem = React.createElement(
								"div",
								{ className: "m-auto" },
								"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
							);
						} else {
							retElem = React.createElement(CM_Form_0_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex, form: this, hadNewRow: this.state.hadNewRow });
							if (this.props.pagebreak) {
								navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
							}
						}
					}
				}
			}
			return React.createElement(
				"div",
				{ className: "flex-grow-0 d-flex flex-shrink-1 erp-form flex-column ", style: M_Form_0_style },
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
					{ id: "M_Form_0tableheader", className: "mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_0_headtableStyle },
						React.createElement(CM_Form_0_THead, null),
						React.createElement(CM_Form_0_THeadBody, { form: this })
					)
				),
				React.createElement(
					"div",
					{ onScroll: this.tableBodyScroll, className: "mw-100 autoScroll" },
					retElem,
					!this.state.hadNewRow && React.createElement(
						"button",
						{ onClick: this.clickNewRowHandler, type: "button", className: "btn btn-success" },
						React.createElement("i", { className: "fa fa-plus" }),
						"\u65B0\u589E"
					)
				),
				navElem
			);
		}
	}, {
		key: "onUpdate",
		value: function onUpdate(rowIndex, callBack) {
			var state = store.getState();
			var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
			var M_Form_0_rowState = getStateByPath(M_Form_0_state, 'row_' + rowIndex, {});
			var M_Text_1_state = getStateByPath(M_Form_0_rowState, 'M_Text_1', {});
			var M_LC_1_state = getStateByPath(M_Form_0_rowState, 'M_LC_1', {});
			var M_Text_1_value = M_Text_1_state.value;
			var M_Dropdown_0_state = getStateByPath(M_Form_0_rowState, 'M_Dropdown_0', {});
			var M_LC_2_state = getStateByPath(M_Form_0_rowState, 'M_LC_2', {});
			var M_Dropdown_0_value = M_Dropdown_0_state.value;
			var M_Form_0_nowRecord = this.props.records_arr[rowIndex];
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
					scriptBP_0_msg.setData(err.info, EMessageBoxType.Error, '修改');
					return;
				}
				scriptBP_0_msg.fireClose();
				if (err == null && callBack != null) {
					callBack(state);
				}
			};
			if (IsEmptyString(M_Form_0_nowRecord)) {
				return callback_final(state, null, { info: gPreconditionInvalidInfo });
			}
			validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + 'M_Text_1.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + 'M_Dropdown_0.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			if (hadValidErr) {
				return callback_final(null, null, { info: gPreconditionInvalidInfo });
			}
			var fetchid = Math.round(Math.random() * 999999);
			var fetchKey = 'M_Form_0_修改_' + rowIndex;
			fetchTracer[fetchKey] = fetchid;
			scriptBP_0_msg = PopMessageBox('', EMessageBoxType.Loading, '修改');;
			var bundle_update_table_0 = {
				RCDKEY: M_Form_0_nowRecord['工作小组代码'],
				M_Text_1_value: M_Text_1_value,
				M_Dropdown_0_value: M_Dropdown_0_value
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_update_table_0, action: 'M_Form_0_onUpdate_update_table_0' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
					if (err_update_table_0 == null) {
						return callback_final(state, data_update_table_0, err_update_table_0);
					} else {
						return callback_final(state, data_update_table_0, err_update_table_0);
					}
				})));
			}, 50);
		}
	}, {
		key: "onDelete",
		value: function onDelete(rowIndex, callBack) {
			var state = store.getState();
			var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
			var M_Form_0_rowState = getStateByPath(M_Form_0_state, 'row_' + rowIndex, {});
			var M_Form_0_nowRecord = this.props.records_arr[rowIndex];
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
					scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '删除');
					return;
				}
				scriptBP_1_msg.fireClose();
				if (err == null && callBack != null) {
					callBack(state);
				}
			};
			if (IsEmptyString(M_Form_0_nowRecord)) {
				return callback_final(state, null, { info: gPreconditionInvalidInfo });
			}
			if (hadValidErr) {
				return callback_final(null, null, { info: gPreconditionInvalidInfo });
			}
			var fetchid = Math.round(Math.random() * 999999);
			var fetchKey = 'M_Form_0_删除_' + rowIndex;
			fetchTracer[fetchKey] = fetchid;
			scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '删除');;
			var bundle_delete_table_0 = {
				工作小组代码: M_Form_0_nowRecord['工作小组代码']
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_delete_table_0, action: 'M_Form_0_onDelete_delete_table_0' }, makeFTD_Callback(function (state, data_delete_table_0, err_delete_table_0) {
					if (err_delete_table_0 == null) {
						setTimeout(function () {
							pull_M_Form_0();
						}, 50);
					} else {
						return callback_final(state, data_delete_table_0, err_delete_table_0);
					}
				})));
			}, 50);
		}
	}, {
		key: "submitInsert",
		value: function submitInsert(callBack) {
			var state = store.getState();
			var rowIndex = 'new';
			var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
			var M_Form_0_rowState = getStateByPath(M_Form_0_state, 'row_' + rowIndex, {});
			var M_Text_1_state = getStateByPath(M_Form_0_rowState, 'M_Text_1', {});
			var M_LC_1_state = getStateByPath(M_Form_0_rowState, 'M_LC_1', {});
			var M_Text_1_value = M_Text_1_state.value;
			var M_Dropdown_0_state = getStateByPath(M_Form_0_rowState, 'M_Dropdown_0', {});
			var M_LC_2_state = getStateByPath(M_Form_0_rowState, 'M_LC_2', {});
			var M_Dropdown_0_value = M_Dropdown_0_state.value;
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
					scriptBP_3_msg.setData(err.info, EMessageBoxType.Error, '新增');
					return;
				}
				scriptBP_3_msg.fireClose();
				if (err == null && callBack != null) {
					callBack(state);
				}
			};
			validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + 'M_Text_1.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + 'M_Dropdown_0.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			if (hadValidErr) {
				return callback_final(null, null, { info: gPreconditionInvalidInfo });
			}
			var fetchid = Math.round(Math.random() * 999999);
			var fetchKey = 'M_Form_0_新增_' + rowIndex;
			fetchTracer[fetchKey] = fetchid;
			scriptBP_3_msg = PopMessageBox('', EMessageBoxType.Loading, '新增');;
			var bundle_insert_table_0 = {
				M_Text_1_value: M_Text_1_value,
				M_Dropdown_0_value: M_Dropdown_0_value
			};
			setTimeout(function () {
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'M_Form_0_onInsert_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
					if (err_insert_table_0 == null) {
						return callback_final(state, data_insert_table_0, err_insert_table_0);
					} else {
						return callback_final(state, data_insert_table_0, err_insert_table_0);
					}
				})));
			}, 50);
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

var CM_Form_0_THead = function (_React$PureComponent4) {
	_inherits(CM_Form_0_THead, _React$PureComponent4);

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
						"\u5C0F\u7EC4\u4EE3\u7801"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle1 },
						"\u5C0F\u7EC4\u540D\u79F0"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle2 },
						"\u767B\u8BB0\u4EBA\u5458"
					),
					React.createElement("th", { scope: "col" })
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_0_THead;
}(React.PureComponent);

var CM_Form_0_TBody = function (_React$PureComponent5) {
	_inherits(CM_Form_0_TBody, _React$PureComponent5);

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
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_0", parentPath: "M_Page_0.M_Form_0", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle1 },
						React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle2 },
						React.createElement(VisibleERPC_DropDown, { rowIndex: rowIndex, id: "M_Dropdown_0", parentPath: "M_Page_0.M_Form_0", pullOnce: true, groupAttr: "\u5458\u5DE5\u5728\u804C\u72B6\u6001,\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u767B\u8BB0\u4EBA\u5458" })
					),
					React.createElement(
						"td",
						null,
						React.createElement(VisibleERPC_GridForm_BtnCol, { rowIndex: rowIndex, form: this.props.form })
					)
				));
			}
			if (this.props.hadNewRow) {
				rowIndex = 'new';
				trElems_arr.push(React.createElement(
					"tr",
					{ key: rowIndex },
					React.createElement("td", { style: M_Form_0tdstyle0 }),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle1 },
						React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle2 },
						React.createElement(VisibleERPC_DropDown, { rowIndex: rowIndex, id: "M_Dropdown_0", parentPath: "M_Page_0.M_Form_0", pullOnce: true, groupAttr: "\u5458\u5DE5\u5728\u804C\u72B6\u6001,\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u767B\u8BB0\u4EBA\u5458" })
					),
					React.createElement(
						"td",
						null,
						React.createElement(VisibleERPC_GridForm_BtnCol, { rowIndex: rowIndex, form: this.props.form })
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

var CM_Form_0_THeadBody = function (_React$PureComponent6) {
	_inherits(CM_Form_0_THeadBody, _React$PureComponent6);

	function CM_Form_0_THeadBody(props) {
		_classCallCheck(this, CM_Form_0_THeadBody);

		return _possibleConstructorReturn(this, (CM_Form_0_THeadBody.__proto__ || Object.getPrototypeOf(CM_Form_0_THeadBody)).call(this, props));
	}

	_createClass(CM_Form_0_THeadBody, [{
		key: "render",
		value: function render() {
			var retElem = null;
			retElem = React.createElement(
				"tbody",
				null,
				React.createElement(
					"tr",
					null,
					React.createElement("td", { style: M_Form_0headstyle0 }),
					React.createElement("td", { style: M_Form_0headstyle1 }),
					React.createElement("td", { style: M_Form_0headstyle2 }),
					React.createElement(
						"td",
						null,
						React.createElement(VisibleERPC_GridForm_BtnCol, { form: this.props.form })
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_0_THeadBody;
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