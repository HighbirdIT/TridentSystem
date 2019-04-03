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
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/QJSH';
var thisAppTitle = '请假审核';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window), ReBindM_Form_0Page: bind_M_Form_0Page.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_2.M_Form_1.records_arr': fresh_M_Form_1.bind(window), 'M_Page_2.M_Form_1.recordIndex': bind_M_Form_1.bind(window), 'M_Page_2.M_Form_1.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_Form_0.pageIndex': bind_M_Form_0.bind(window), 'M_Page_2.M_Form_1.M_LC_3.visible': M_LC_3_visible_changed.bind(window) };

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
	setTimeout(function () {
		pull_M_Form_1();
	}, 50);
	return state;
}
function fresh_M_Form_1(retState, records_arr) {
	simpleFreshFormFun(retState, records_arr, 'M_Page_2.M_Form_1', bind_M_Form_1);
}
function bind_M_Form_1(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_2.M_Form_1', {});
	var records_arr = formState.records_arr;
	var needSetState = {};
	var bundle = {};
	var nowRecord = null;
	var useIndex = newIndex;
	needSetState['M_Text_0.value'] = '同意';
	if (records_arr == null || newIndex == -1 || records_arr.length == 0) {} else {
		nowRecord = records_arr[useIndex];
		bundle.M_Form_1_nowRecord = nowRecord;
		needSetState['M_Label_3.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Label_4.text'] = nowRecord['员工假期种类'];
		needSetState['M_Label_5.text'] = nowRecord['请假起始日期'];
		needSetState['M_Label_8.text'] = nowRecord['请假起始时间'];
		needSetState['M_Label_6.text'] = nowRecord['请假结束日期'];
		needSetState['M_Label_9.text'] = nowRecord['请假结束时间'];
		needSetState['M_Label_7.text'] = nowRecord['请假事由说明'];
		needSetState['M_Label_10.text'] = M_Label_10_textfield_get(retState, bundle);
		needSetState['M_LC_3.visible'] = M_LC_3_isdisplay_get(retState, bundle);
		needSetState['M_LC_4.visible'] = M_LC_4_isdisplay_get(retState, bundle);
	}
	needSetState['nowRecord'] = nowRecord;
	needSetState['invalidbundle'] = false;
	retState = setManyStateByPath(retState, 'M_Page_2.M_Form_1', needSetState);
	pull_M_Form_0(retState);
	return retState;
}
function pull_M_Form_1(retState) {
	var hadStateParam = retState != null;
	var state = hadStateParam ? retState : store.getState();
	var bundle = {};
	setTimeout(function () {
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_1' }, makeFTD_Prop('M_Page_2', 'M_Form_1', 'records_arr', false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}
function M_Label_10_textfield_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		var needSetState = {};
		needSetState.text = err == null ? data : null;
		needSetState.fetching = false;
		needSetState.fetchingErr = err;
		return setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Label_10', needSetState);
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	var fetchid = Math.round(Math.random() * 999999);
	fetchTracer['M_Label_10_textfield_get'] = fetchid;
	state = setManyStateByPath(state, 'M_Page_2.M_Form_1.M_Label_10', { fetching: true, fetchingErr: null });
	var bundle_querysql_0 = {
		员工代码: M_Form_1_nowRecord['员工登记姓名代码'],
		假期种类代码: M_Form_1_nowRecord['员工假期种类代码']
	};
	setTimeout(function () {
		if (fetchTracer['M_Label_10_textfield_get'] != fetchid) return;
		store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle_querysql_0, action: '_query_FB员工请假提示' }, makeFTD_Callback(function (state, data_querysql_0, error_querysql_0) {
			if (error_querysql_0) {
				callback_final(state, null, error_querysql_0);
			}
			var ret = callback_final(state, data_querysql_0, null);
			return ret == null ? state : ret;
		}, false)));
	}, 50);
}
function M_LC_3_isdisplay_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_1_nowRecord['员工假期种类代码'] == 11;
}
function M_LC_4_isdisplay_get(state, bundle) {
	var M_Form_1_nowRecord = bundle != null && bundle.M_Form_1_nowRecord != null ? bundle.M_Form_1_nowRecord : getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	var callback_final = function callback_final(state, data, err) {
		setManyStateByPath(state, '', validErrState);
		return err == null ? data : null;
	};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	if (hadValidErr) {
		return callback_final(state, null, { info: gPreconditionInvalidInfo });
	}
	return M_Form_1_nowRecord['员工假期种类代码'] != 11;
}
function M_LC_6_isdisplay_get(state, bundle) {
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_LC_3_state = getStateByPath(M_Form_1_state, 'M_LC_3', {});
	var M_LC_3_visible = bundle != null && bundle['M_LC_3_visible'] != null ? bundle['M_LC_3_visible'] : M_LC_3_state.visible;
	return M_LC_3_visible;
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
	var M_Form_1_nowRecord = getStateByPath(state, 'M_Page_2.M_Form_1.nowRecord');
	var validErr;
	var hadValidErr = false;
	var validErrState = {};
	if (IsEmptyString(M_Form_1_nowRecord)) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle'));
		}
	}
	if (hadValidErr) {
		if (hadStateParam) {
			return setStateByPath(state, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle', gPreconditionInvalidInfo);
		} else {
			store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo, 'M_Page_2.M_Form_1.M_Form_0.invalidbundle'));
		}
	}
	var bundle = {};
	bundle.sqlBP_7_员工登记姓名代码 = sqlBP_7_员工登记姓名代码;
	bundle.sqlBP_7_员工登记姓名 = sqlBP_7_员工登记姓名;
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
function button_4_onclick() {
	var state = store.getState();
}
function button_0_onclick() {
	var 当前日期_1;
	var temp_1;
	var state = store.getState();
	var M_Form_1_state = getStateByPath(state, 'M_Page_2.M_Form_1', {});
	var M_Text_0_state = getStateByPath(M_Form_1_state, 'M_Text_0', {});
	var M_LC_11_state = getStateByPath(M_Form_1_state, 'M_LC_11', {});
	var M_Text_0_value = M_Text_0_state.value;
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
				scriptBP_8_msg.setData(err.info, EMessageBoxType.Error, '拒绝申请');
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
	validErr = BaseIsValueValid(state, M_LC_11_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
	validErrState['M_Page_2.M_Form_1.M_Text_0.invalidInfo'] = validErr;
	if (validErr != null) hadValidErr = true;
	if (hadValidErr) {
		return callback_final(null, null, { info: gPreconditionInvalidInfo });
	}
	当前日期_1 = new Date(M_Text_0_value);
	temp_1 = 当前日期_1.setDate(当前日期_1.getDate() + -1);
	store.dispatch(makeAction_setStateByPath(getFormatDateString(当前日期_1), 'M_Page_2.M_Form_1.M_Text_0.value'));
}
function M_LC_3_visible_changed(state, newValue, oldValue, path, visited, delayActs) {
	var needSetState = {};
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
			return React.createElement(
				"div",
				{ className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
				React.createElement(
					"h3",
					null,
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
				{ className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column fixPageContent " },
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
					}
				}
				if (!this.props.canInsert && this.props.nowRecord == null) {
					retElem = React.createElement(
						"div",
						null,
						"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
					);
				} else {
					retElem = React.createElement(
						"div",
						{ className: "d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_0", parentPath: "M_Page_2.M_Form_1", label: "\u8BF7\u5047\u4EBA\u5458" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_3", parentPath: "M_Page_2.M_Form_1", type: "string" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_1", parentPath: "M_Page_2.M_Form_1", label: "\u5047\u671F\u79CD\u7C7B" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_4", parentPath: "M_Page_2.M_Form_1", type: "string" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_5", parentPath: "M_Page_2.M_Form_1", label: "\u5F53\u524D\u72B6\u6001" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_10", parentPath: "M_Page_2.M_Form_1", type: "string" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_2", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65E5\u671F" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_5", parentPath: "M_Page_2.M_Form_1", type: "date" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_3", parentPath: "M_Page_2.M_Form_1", label: "\u8D77\u59CB\u65F6\u95F4" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_8", parentPath: "M_Page_2.M_Form_1", type: "time" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_4", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65E5\u671F" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_6", parentPath: "M_Page_2.M_Form_1", type: "date" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_6", parentPath: "M_Page_2.M_Form_1", label: "\u7ED3\u675F\u65F6\u95F4" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_9", parentPath: "M_Page_2.M_Form_1", type: "time" })
						),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_7", parentPath: "M_Page_2.M_Form_1", label: "\u4E8B\u7531\u8BF4\u660E" },
							React.createElement(VisibleERPC_Label, { className: "erp-control ", id: "M_Label_7", parentPath: "M_Page_2.M_Form_1", type: "string" })
						),
						React.createElement(VisibleCM_Form_0, { id: "M_Form_0", parentPath: "M_Page_2.M_Form_1", title: "\u4ED6\u7684\u6700\u8FD1\u8BF7\u5047", pagebreak: false, reBindAT: "ReBindM_Form_0Page" }),
						React.createElement(
							VisibleERPC_LabeledControl,
							{ id: "M_LC_11", parentPath: "M_Page_2.M_Form_1", label: "\u5BA1\u6838\u8BF4\u660E", visible: false },
							React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: "M_Page_2.M_Form_1", type: "string", linetype: "1x" })
						),
						React.createElement(
							"div",
							{ className: "btn-group flex-grow-0 flex-shrink-0 d-flex erp-control " },
							React.createElement(
								"button",
								{ className: "btn-success flex-grow-1 btn btn-primary erp-control ", id: "button_4", onClick: button_4_onclick },
								"\u901A\u8FC7\u7533\u8BF7"
							),
							React.createElement(
								"button",
								{ className: "btn-danger flex-grow-1 btn btn-primary erp-control ", id: "button_0", onClick: button_0_onclick },
								"\u62D2\u7EDD\u7533\u8BF7"
							)
						),
						this.renderNavigater()
					);
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
	retProps.loaded = ctlState.records_arr != null;
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
					}
				}
				if (!this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
					retElem = React.createElement(
						"div",
						null,
						"\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
					);
				} else {
					retElem = React.createElement(CM_Form_0_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex });
					if (this.props.pagebreak) {
						navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
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
