"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Form_0headstyle0 = { "width": "45.7%", "maxWidth": "45.7%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle0 = { "width": "45.7%", "maxWidth": "45.7%", "verticalAlign": "middle" };
var M_Form_0headstyle1 = { "width": "51.1%", "maxWidth": "51.1%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_0tdstyle1 = { "width": "51.1%", "maxWidth": "51.1%", "verticalAlign": "middle" };
var M_Form_0_tableStyle = { "marginTop": "-50px" };
var M_Form_0_headtableStyle = { "marginBottom": "0px" };
var M_Form_1headstyle0 = { "width": "32.2%", "maxWidth": "32.2%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle0 = { "width": "32.2%", "maxWidth": "32.2%", "verticalAlign": "middle" };
var M_Form_1headstyle1 = { "width": "64.4%", "maxWidth": "64.4%", "whiteSpace": "nowrap", "overflow": "hidden" };
var M_Form_1tdstyle1 = { "width": "64.4%", "maxWidth": "64.4%", "verticalAlign": "middle" };
var M_Form_1_tableStyle = { "marginTop": "-50px" };
var M_Form_1_headtableStyle = { "marginBottom": "0px" };
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/GZXZGL';
var thisAppTitle = '工作小组管理';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window), ReBindM_Form_1Page: bind_M_Form_1Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.pageIndex': bind_M_Form_0.bind(window), 'M_Page_0.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_0.M_Form_1.pageIndex': bind_M_Form_1.bind(window), 'M_Page_0.M_Form_0.selectedRows_arr': M_Form_0_selectedRows_arr_changed.bind(window) };
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
		case 'M_Page_1':
			{
				retState = active_M_Page_1(retState);
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
	return init_M_Page_0(state);
}
function init_M_Page_0(state) {
	var needSetState = {};
	var hadState = state != null;
	if (!hadState) {
		state = store.getState();
	}
	needSetState['M_Page_0.M_CheckBox_0.value'] = '0';
	needSetState['M_Page_0.M_Dropdown_1.text'] = null;
	needSetState['M_Page_0.M_Dropdown_1.value'] = null;
	state = setManyStateByPath(state, '', needSetState);
	setTimeout(function () {
		pull_M_Form_0();
	}, 50);
	if (hadState) {
		state = setManyStateByPath(state, '', needSetState);
	} else {
		store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
	}
	return state;
}
function pull_M_Dropdown_1(parentPath) {
	var rowIndexInfo_map = getRowIndexMapFromPath(parentPath);
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_1' }, makeFTD_Prop(parentPath, 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
}
function fresh_M_Form_0(retState, records_arr) {
	bind_M_Form_0(retState);
}
function bind_M_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = false;
	needSetState['row_new.M_Text_1.value'] = null;
	var pageCount = formState.pageCount;
	var pageIndex = formState.pageIndex;
	if (records_arr != null && records_arr.length > 0) {
		var rowPerPage = formState.rowPerPage == null ? 20 : formState.rowPerPage;
		needSetState.rowPerPage = rowPerPage;
		pageCount = Math.ceil(records_arr.length / rowPerPage);
		if (pageIndex == null || pageIndex < 0) {
			pageIndex = 0;
		} else if (pageIndex >= pageCount) {
			pageIndex = pageCount - 1;
		}
	} else {
		pageCount = 0;
		pageIndex = 0;
	}
	needSetState.pageCount = pageCount;
	needSetState.pageIndex = pageIndex;
	needActiveBindPage = pageIndex == formState.pageIndex;
	needSetState['invalidbundle'] = false;
	if (needActiveBindPage) {
		retState = setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
		return bind_M_Form_0Page(retState);
	}
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
	var pageIndex = formState.pageIndex;
	var rowPerPage = formState.rowPerPage;
	var startRowIndex = pageIndex * rowPerPage;
	var endRowIndex = (pageIndex + 1) * rowPerPage - 1;
	if (endRowIndex >= records_arr.length) {
		endRowIndex = records_arr.length - 1;
	}
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_new.M_Text_1.value'] = null;
		needSetState['row_' + rowIndex + '.M_Text_1.value'] = nowRecord['工作小组名称'];
		needSetState['row_' + rowIndex + '.M_Label_1.text'] = nowRecord['登记确认时间'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}
function fresh_M_Form_1(retState, records_arr) {
	bind_M_Form_1(retState);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var needActiveBindPage = false;
	var pageCount = formState.pageCount;
	var pageIndex = formState.pageIndex;
	if (records_arr != null && records_arr.length > 0) {
		var rowPerPage = formState.rowPerPage == null ? 20 : formState.rowPerPage;
		needSetState.rowPerPage = rowPerPage;
		pageCount = Math.ceil(records_arr.length / rowPerPage);
		if (pageIndex == null || pageIndex < 0) {
			pageIndex = 0;
		} else if (pageIndex >= pageCount) {
			pageIndex = pageCount - 1;
		}
	} else {
		pageCount = 0;
		pageIndex = 0;
	}
	needSetState.pageCount = pageCount;
	needSetState.pageIndex = pageIndex;
	needActiveBindPage = pageIndex == formState.pageIndex;
	needSetState['invalidbundle'] = false;
	if (needActiveBindPage) {
		retState = setManyStateByPath(retState, 'M_Page_0.M_Form_1', needSetState);
		return bind_M_Form_1Page(retState);
	}
	retState = setManyStateByPath(retState, 'M_Page_0.M_Form_1', needSetState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Form_0_selectedRows_arr = M_Form_0_state.selectedRows_arr;
	var M_Form_0_nowRecord;
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (M_Form_0_selectedRows_arr == null || M_Form_0_selectedRows_arr.length == 0) {
		hadValidErr = true;
	} else {
		M_Form_0_nowRecord = M_Form_0_state.records_arr[M_Form_0_selectedRows_arr[0]];
	}
	if (IsEmptyString(M_Form_0_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_1.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_0.M_Form_1.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_0.M_Form_1.invalidbundle'));
		}
		return;
	}
	var bundle = {};
	bundle.工作小组代码_12642 = M_Form_0_nowRecord.工作小组代码;
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_1' }, makeFTD_Prop('M_Page_0', 'M_Form_1', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function bind_M_Form_1Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var pageIndex = formState.pageIndex;
	var rowPerPage = formState.rowPerPage;
	var startRowIndex = pageIndex * rowPerPage;
	var endRowIndex = (pageIndex + 1) * rowPerPage - 1;
	if (endRowIndex >= records_arr.length) {
		endRowIndex = records_arr.length - 1;
	}
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		needSetState['row_' + rowIndex + '.M_Label_0.text'] = nowRecord['员工登记姓名'];
		needSetState['row_' + rowIndex + '.M_Label_2.text'] = nowRecord['加入确认时间'];
	}
	needSetState.startRowIndex = startRowIndex;
	needSetState.endRowIndex = endRowIndex;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_1', needSetState);
}
function button_0_onclick() {
	var state = store.getState();
	var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
	var M_Form_0_selectedRows_arr = M_Form_0_state.selectedRows_arr;
	var M_Form_0_nowRecord;
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
				scriptBP_4_msg.setData(err.info, EMessageBoxType.Error, '调入成员');
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
	if (M_Form_0_selectedRows_arr == null || M_Form_0_selectedRows_arr.length == 0) {
		SendToast('需要在[所有小组]中选择一条数据。', EToastType.Warning);return;
	}
	M_Form_0_nowRecord = M_Form_0_state.records_arr[M_Form_0_selectedRows_arr[0]];
	if (IsEmptyString(M_Form_0_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	var popPage_0_callback = function popPage_0_callback(undefined) {
		if (popPage_0exportParam.新增人数 > 0) {
			setTimeout(function () {
				pull_M_Form_1();
			}, 50);
		}
	};
	var popPage_0entryParam = {
		目标小组代码: M_Form_0_nowRecord['工作小组代码'],
		目标小组名称: M_Form_0_nowRecord['工作小组名称'],
		callBack: popPage_0_callback
	};
	gDataCache.set('M_Page_1entryParam', popPage_0entryParam);
	init_M_Page_1();
	popPage('M_Page_1', React.createElement(VisibleCM_Page_1, { key: "M_Page_1" }));
}
function button_1_onclick() {
	var state = store.getState();
	scriptBP_6_msg.query('啦啦啦', [{ label: '知道了', key: '知道了' }], function (popmessagebox_0_key) {
		if (popmessagebox_0_key == '知道了') {
			scriptBP_6_msg.fireClose();
		}
	});
}
function active_M_Page_1(state) {
	return init_M_Page_1(state);
}
function init_M_Page_1(state) {
	var needSetState = {};
	var hadState = state != null;
	if (!hadState) {
		state = store.getState();
	}
	needSetState['M_Page_1.M_Label_3.text'] = M_Label_3_textfield_get(state);
	needSetState['M_Page_1.M_Dropdown_0.text'] = null;
	needSetState['M_Page_1.M_Dropdown_0.value'] = null;
	needSetState['M_Page_1.M_Text_0.value'] = M_Text_0_defaultvalue_get(state);
	state = setManyStateByPath(state, '', needSetState);
	setTimeout(function () {}, 50);
	if (hadState) {
		state = setManyStateByPath(state, '', needSetState);
	} else {
		store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
	}
	return state;
}
function M_Label_3_textfield_get(state, bundle) {
	return '正在向[' + getPageEntryParam('M_Page_1', '目标小组名称', '未知小组') + ']调入人员。';
}
function pull_M_Dropdown_0(parentPath) {
	var rowIndexInfo_map = getRowIndexMapFromPath(parentPath);
	var bundle = {};
	var useState = store.getState();
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Dropdown_0' }, makeFTD_Prop(parentPath, 'M_Dropdown_0', 'options_arr', false), EFetchKey.FetchPropValue));
}
function M_Text_0_defaultvalue_get(state, bundle) {
	return getFormatDateString(getNowDate());
}
function button_2_onclick() {
	var state = store.getState();
	var closePage_0exportParam = {
		新增人数: 1
	};
	closePage('M_Page_1');
	var closePage_0_callback = getPageEntryParam('M_Page_1', 'callBack');
	if (closePage_0_callback) {
		closePage_0_callback(closePage_0exportParam);
	}
}
function M_Form_0_selectedRows_arr_changed(state, newValue, oldValue, path, visited, delayActs, rowIndexInfo_map) {
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
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_3", parentPath: "M_Page_0", label: "\u5DF2\u89E3\u6563\u7684" },
					React.createElement(VisibleERPC_CheckBox, { id: "M_CheckBox_0", parentPath: "M_Page_0" })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_8", parentPath: "M_Page_0", label: "asdf" },
					React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: "M_Page_0", multiselect: true, pullOnce: true, pullDataSource: pull_M_Dropdown_1, textAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u540D\u79F0", valueAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u4EE3\u7801", label: "asdf" })
				),
				React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_0", title: "\u6240\u6709\u5C0F\u7EC4", pagebreak: true, reBindAT: "ReBindM_Form_0Page" }),
				React.createElement(VisibleCM_Form_1, { id: "M_Form_1", parentPath: "M_Page_0", title: "\u6210\u5458\u5217\u8868", pagebreak: true, reBindAT: "ReBindM_Form_1Page" })
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
			var M_Form_0_nowRecord = M_Form_0_state.records_arr[rowIndex];
			var M_Form_0_rowState = M_Form_0_state['row_' + rowIndex];
			var M_Text_1_state = getStateByPath(M_Form_0_rowState, 'M_Text_1', {});
			var M_LC_1_state = getStateByPath(M_Form_0_rowState, 'M_LC_1', {});
			var M_Text_1_value = M_Text_1_state.value;
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
						scriptBP_0_msg.setData(err.info, EMessageBoxType.Error, '修改');
					}
					return;
				}
				if (scriptBP_0_msg) {
					scriptBP_0_msg.fireClose();
				}
				if (err == null && callBack != null) {
					callBack(state);
				}
			};
			if (IsEmptyString(M_Form_0_nowRecord)) {
				return callback_final(state, null, { info: gPreconditionInvalidInfo });
			}
			validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + '.M_Text_1.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			if (hadValidErr) {
				return callback_final(null, null, { info: gPreconditionInvalidInfo });
			}
			var fetchid = Math.round(Math.random() * 999999);
			var fetchKey = 'M_Form_0_修改_' + rowIndex;
			fetchTracer[fetchKey] = fetchid;
			scriptBP_0_msg = PopMessageBox('', EMessageBoxType.Loading, '修改');
			var bundle_update_table_0 = {
				RCDKEY: M_Form_0_nowRecord['工作小组代码'],
				M_Text_1_value: M_Text_1_value
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
			var M_Form_0_nowRecord = M_Form_0_state.records_arr[rowIndex];
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
						scriptBP_1_msg.setData(err.info, EMessageBoxType.Error, '删除');
					}
					return;
				}
				if (scriptBP_1_msg) {
					scriptBP_1_msg.fireClose();
				}
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
			scriptBP_1_msg = PopMessageBox('', EMessageBoxType.Loading, '删除');
			scriptBP_1_msg.query('确定要删除工作组[' + M_Form_0_nowRecord['工作小组名称'] + ']吗？', [{ label: '确定', key: '确定' }, { label: '取消', key: '取消' }], function (popmessagebox_0_key) {
				if (popmessagebox_0_key == '确定') {
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
				if (popmessagebox_0_key == '取消') {
					scriptBP_1_msg.fireClose();
				}
			});
		}
	}, {
		key: "submitInsert",
		value: function submitInsert(callBack) {
			var state = store.getState();
			var rowIndex = 'new';
			var M_Form_0_state = getStateByPath(state, 'M_Page_0.M_Form_0', {});
			var M_Form_0_rowState = M_Form_0_state['row_' + rowIndex];
			var M_Text_1_state = getStateByPath(M_Form_0_rowState, 'M_Text_1', {});
			var M_LC_1_state = getStateByPath(M_Form_0_rowState, 'M_LC_1', {});
			var M_Text_1_value = M_Text_1_state.value;
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
						scriptBP_3_msg.setData(err.info, EMessageBoxType.Error, '新增');
					}
					return;
				}
				if (scriptBP_3_msg) {
					scriptBP_3_msg.fireClose();
				}
				if (err == null && callBack != null) {
					callBack(state);
				}
			};
			validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
			validErrState['M_Page_0.M_Form_0.row_' + rowIndex + '.M_Text_1.invalidInfo'] = validErr;
			if (validErr != null) hadValidErr = true;
			if (hadValidErr) {
				return callback_final(null, null, { info: gPreconditionInvalidInfo });
			}
			var fetchid = Math.round(Math.random() * 999999);
			var fetchKey = 'M_Form_0_新增_' + rowIndex;
			fetchTracer[fetchKey] = fetchid;
			scriptBP_3_msg = PopMessageBox('', EMessageBoxType.Loading, '新增');
			var bundle_querysql_0 = {
				小组名称: M_Text_1_value
			};
			setTimeout(function () {
				if (fetchTracer[fetchKey] != fetchid) return;
				store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: 'scriptBP_3_querysql_0' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
					if (error_querysql_0) {
						return callback_final(state, null, error_querysql_0);
					}
					if (data_querysql_0.length != 0) {
						var ret = callback_final(state, null, { info: '已经有同名的工作小组了' });
						return ret == null ? state : ret;
					} else {
						var bundle_insert_table_0 = {
							M_Text_1_value: M_Text_1_value
						};
						setTimeout(function () {
							store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_insert_table_0, action: 'M_Form_0_onInsert_insert_table_0' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
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
				}, false)));
			}, 50);
		}
	}]);

	return CM_Form_0;
}(React.PureComponent);

function CM_Form_0_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var propProfile = getControlPropProfile(ownprops, state);
	var ctlState = propProfile.ctlState;
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
	retProps.selectMode = 'single';
	retProps.selectedRows_arr = ctlState.selectedRows_arr == null ? gEmptyArr : ctlState.selectedRows_arr;
	retProps.fullPath = propProfile.fullPath;
	retProps.fullParentPath = propProfile.fullParentPath;
	retProps.selectMode = 'single';
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
					React.createElement("th", { scope: "col", className: "selectorTableHeader" }),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle0 },
						"\u5C0F\u7EC4\u540D\u79F0"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_0headstyle1 },
						"\u767B\u8BB0\u65F6\u95F4"
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
					VisibleERPC_GridSelectableRow,
					{ key: rowIndex - startRowIndex, rowIndex: rowIndex, form: this.props.form },
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle0 },
						React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
					),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_1", parentPath: "M_Page_0.M_Form_0", type: "date" })
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
					React.createElement("td", { className: "selectorTableHeader" }),
					React.createElement(
						"td",
						{ style: M_Form_0tdstyle0 },
						React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_1", parentPath: "M_Page_0.M_Form_0", type: "string", linetype: "single" })
					),
					React.createElement("td", { style: M_Form_0tdstyle1 }),
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
					React.createElement("td", { className: "selectorTableHeader" }),
					React.createElement("td", { style: M_Form_0headstyle0 }),
					React.createElement("td", { style: M_Form_0headstyle1 }),
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

var CM_Form_1 = function (_React$PureComponent7) {
	_inherits(CM_Form_1, _React$PureComponent7);

	function CM_Form_1(props) {
		_classCallCheck(this, CM_Form_1);

		var _this7 = _possibleConstructorReturn(this, (CM_Form_1.__proto__ || Object.getPrototypeOf(CM_Form_1)).call(this, props));

		ERPC_GridForm(_this7);
		_this7.tableBodyScroll = _this7.tableBodyScroll.bind(_this7);
		return _this7;
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
							retElem = React.createElement(CM_Form_1_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex, form: this });
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
					{ id: "M_Form_1tableheader", className: "mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv" },
					React.createElement(
						"table",
						{ className: "table", style: M_Form_1_headtableStyle },
						React.createElement(CM_Form_1_THead, null)
					)
				),
				React.createElement(
					"div",
					{ onScroll: this.tableBodyScroll, className: "mw-100 autoScroll" },
					retElem
				),
				React.createElement(
					"div",
					{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
					React.createElement(
						VisibleERPC_Button,
						{ className: "btn btn-primary erp-control ", id: "button_0", parentPath: "M_Page_0.M_Form_1", onClick: button_0_onclick },
						"\u8C03\u5165\u6210\u5458"
					),
					React.createElement(
						VisibleERPC_Button,
						{ className: "btn btn-warning erp-control ", id: "button_1", parentPath: "M_Page_0.M_Form_1", onClick: button_1_onclick },
						"\u8C03\u51FA\u6210\u5458"
					)
				),
				navElem
			);
		}
	}]);

	return CM_Form_1;
}(React.PureComponent);

function CM_Form_1_mapstatetoprops(state, ownprops) {
	var retProps = {};
	var propProfile = getControlPropProfile(ownprops, state);
	var ctlState = propProfile.ctlState;
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
	retProps.selectMode = 'none';
	retProps.selectedRows_arr = ctlState.selectedRows_arr == null ? gEmptyArr : ctlState.selectedRows_arr;
	retProps.fullPath = propProfile.fullPath;
	retProps.fullParentPath = propProfile.fullParentPath;
	return retProps;
}
function CM_Form_1_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_1 = ReactRedux.connect(CM_Form_1_mapstatetoprops, CM_Form_1_disptchtoprops)(CM_Form_1);

var CM_Form_1_THead = function (_React$PureComponent8) {
	_inherits(CM_Form_1_THead, _React$PureComponent8);

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
						{ scope: "col", className: "indexTableHeader" },
						"\u5E8F\u53F7"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle0 },
						"\u59D3\u540D"
					),
					React.createElement(
						"th",
						{ scope: "col", style: M_Form_1headstyle1 },
						"\u52A0\u5165\u65F6\u95F4"
					)
				)
			);
			return retElem;
		}
	}]);

	return CM_Form_1_THead;
}(React.PureComponent);

var CM_Form_1_TBody = function (_React$PureComponent9) {
	_inherits(CM_Form_1_TBody, _React$PureComponent9);

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
						{ className: "indexTableHeader" },
						rowIndex - startRowIndex + 1
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle0 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_0", parentPath: "M_Page_0.M_Form_1", type: "string" })
					),
					React.createElement(
						"td",
						{ style: M_Form_1tdstyle1 },
						React.createElement(VisibleERPC_Label, { className: "erp-control ", rowIndex: rowIndex, id: "M_Label_2", parentPath: "M_Page_0.M_Form_1", type: "date" })
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

var CM_Page_1 = function (_React$PureComponent10) {
	_inherits(CM_Page_1, _React$PureComponent10);

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
				{ className: "d-flex flex-column popPage bg-light" },
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
					"\u8C03\u5165\u6210\u5458"
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
				React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_3", parentPath: "M_Page_1", type: "string" }),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_0", parentPath: "M_Page_1", label: "\u5458\u5DE5\u59D3\u540D" },
					React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: "M_Page_1", textType: "int", multiselect: true, pullOnce: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u5458\u5DE5\u59D3\u540D" })
				),
				React.createElement(
					VisibleERPC_LabeledControl,
					{ id: "M_LC_4", parentPath: "M_Page_1", label: "\u8C03\u5165\u65E5\u671F" },
					React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_1", type: "string", linetype: "single" })
				),
				React.createElement(
					"div",
					{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
					React.createElement(
						VisibleERPC_Button,
						{ className: "flex-grow-1 btn btn-success erp-control ", id: "button_2", parentPath: "M_Page_1", onClick: button_2_onclick },
						"\u786E\u8BA4\u63D0\u4EA4"
					),
					React.createElement(
						VisibleERPC_Button,
						{ className: "flex-grow-1 btn btn-danger erp-control ", id: "button_3", parentPath: "M_Page_1" },
						"\u653E\u5F03\u64CD\u4F5C"
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
