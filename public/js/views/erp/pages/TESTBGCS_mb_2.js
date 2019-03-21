'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/BGCS';
var thisAppTitle = '表格测试';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = { AT_PAGELOADED: pageLoadedReducer.bind(window), AT_GOTOPAGE: gotoPageReducer.bind(window) };
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));
var appStateChangedAct_map = { 'M_Page_0.M_Form_0.records_arr': fresh_M_Form_0.bind(window), 'M_Page_0.M_Form_0.pageIndex': bind_M_Form_0.bind(window) };

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
		pull_M_Form_0(state);
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

	var pageCount = formState.pageCount;
	var pageIndex = formState.pageIndex;
	if (records_arr != null && records_arr.length == 0) {
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
	needSetState['invalidbundle'] = false;
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}

function bind_M_Form_0Page(retState) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0', {});
	var records_arr = formState.records_arr;
	var needSetState = {};

	var pageCount = formState.pageCount;
	var pageIndex = formState.pageIndex;
	var rowPerPage = formState.rowPerPage;
	var startRowIndex = pageIndex * rowPerPage;
	var endRowIndex = pageIndex * rowPerPage + rowPerPage - 1;

	for (var rowIndex = startRowIndex; rowIndex < endRowIndex && rowIndex < records_arr.length; ++rowIndex) {
		var rowRecord = records_arr[rowIndex];
		needSetState['rowState' + rowIndex + '.员工登记姓名'] = rowRecord.员工登记姓名;
		needSetState['rowState' + rowIndex + '.员工登记性别'] = rowRecord.员工登记性别;
		needSetState['rowState' + rowIndex + '.身份证件号码'] = rowRecord.身份证件号码;
		needSetState['rowState' + rowIndex + '.身份证件地址'] = rowRecord.身份证件地址;
		needSetState['rowState' + rowIndex + '.出生年月日期'] = rowRecord.出生年月日期;
	}
	return setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}
function pull_M_Form_0(retState) {
	var bundle = {};
	var useState = retState == null ? store.getState() : retState;
	if (bundle == null) {
		store.dispatch(makeAction_setStateByPath(true, 'M_Page_0.M_Form_0.invalidbundle'));
	}
	store.dispatch(fetchJsonPost(appServerUrl, { bundle: bundle, action: 'pulldata_M_Form_0' }, makeFTD_Prop('M_Page_0', 'M_Form_0', 'records_arr', false), EFetchKey.FetchPropValue));
	return retState;
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
					'\u4E3B\u9875\u9762'
				)
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll flex-column ' },
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

var Form_0_headstyle1 = {
	width: '8.4em',
	maxWidth: '8.4em',
	whiteSpace: 'nowrap',
	overflow: 'hidden'
};

var Form_0_tdstyle1 = {
	width: '8.4em',
	maxWidth: '8.4em'
};

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
		key: 'tableBodyScroll',
		value: function tableBodyScroll(ev) {
			document.getElementById('tableHeaderdiv').scrollLeft = ev.target.scrollLeft;
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			var retElem = null;
			var contentElem = null;
			if (this.props.invalidbundle) {
				contentElem = renderInvalidBundleDiv();
			} else if (this.props.fetchingErr) {
				contentElem = renderFetcingErrDiv(this.props.fetchingErr.info);
			} else if (!this.props.loaded || this.props.fetching) {
				contentElem = React.createElement(
					'div',
					{ className: 'w-100 h-100' },
					renderFetcingTipDiv()
				);
			} else if (!this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
				contentElem = React.createElement(
					'div',
					null,
					'\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E'
				);
			} else {
				contentElem = React.createElement(
					'div',
					{ onScroll: this.tableBodyScroll, id: 'tablebodydiv', className: 'mw-100 autoScroll', style: { height: '100%' } },
					React.createElement(
						'table',
						{ className: 'table table-striped table-hover ', style: { width: '42em', marginTop: '-50px' } },
						React.createElement(
							'thead',
							{ className: 'thead-dark' },
							React.createElement(
								'tr',
								null,
								React.createElement(
									'th',
									{ scope: 'col', style: Form_0_headstyle1 },
									'\u5458\u5DE5\u767B\u8BB0\u59D3\u540D'
								),
								React.createElement(
									'th',
									{ scope: 'col', style: Form_0_headstyle1 },
									'\u5458\u5DE5\u767B\u8BB0\u6027\u522B'
								),
								React.createElement(
									'th',
									{ scope: 'col', style: Form_0_headstyle1 },
									'\u8EAB\u4EFD\u8BC1\u4EF6\u53F7\u7801'
								),
								React.createElement(
									'th',
									{ scope: 'col', style: Form_0_headstyle1 },
									'\u8EAB\u4EFD\u8BC1\u4EF6\u5730\u5740'
								),
								React.createElement(
									'th',
									{ scope: 'col', style: Form_0_headstyle1 },
									'\u51FA\u751F\u5E74\u6708\u65E5\u671F'
								)
							)
						),
						React.createElement(
							'tbody',
							null,
							this.props.records_arr.map(function (record, index) {
								return React.createElement(
									'tr',
									{ key: index },
									React.createElement(
										'td',
										{ style: Form_0_tdstyle1 },
										React.createElement(VisibleERPC_Label, { text: record.员工登记姓名, className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
									),
									React.createElement(
										'td',
										{ style: Form_0_tdstyle1 },
										React.createElement(VisibleERPC_Label, { text: record.员工登记性别, className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
									),
									React.createElement(
										'td',
										{ style: Form_0_tdstyle1 },
										React.createElement(VisibleERPC_Label, { text: record.身份证件号码, className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
									),
									React.createElement(
										'td',
										{ style: Form_0_tdstyle1 },
										React.createElement(VisibleERPC_Label, { text: record.身份证件地址, className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
									),
									React.createElement(
										'td',
										{ style: Form_0_tdstyle1 },
										React.createElement(VisibleERPC_Label, { text: record.出生年月日期, className: 'erp-control ', id: 'M_Label_1', parentPath: 'M_Page_0.M_Form_0' })
									)
								);
							})
						)
					)
				);
			}

			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-0 autoScroll flex-column ' },
				React.createElement(
					'div',
					{ className: 'mh-100 mw-100 hidenOverflow position-relative', style: { clear: 'both', height: '400px', paddingBottom: '50px' } },
					React.createElement(
						'div',
						{ id: 'tableHeaderdiv', className: 'mw-100 hidenOverflow' },
						React.createElement(
							'table',
							{ className: 'table', style: { width: '42em', marginBottom: '0px' } },
							React.createElement(
								'thead',
								{ className: 'thead-dark' },
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'col', style: Form_0_headstyle1 },
										'\u5458\u5DE5\u767B\u8BB0\u59D3\u540D'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: Form_0_headstyle1 },
										'\u5458\u5DE5\u767B\u8BB0\u6027\u522B'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: Form_0_headstyle1 },
										'\u8EAB\u4EFD\u8BC1\u4EF6\u53F7\u7801'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: Form_0_headstyle1 },
										'\u8EAB\u4EFD\u8BC1\u4EF6\u5730\u5740'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: Form_0_headstyle1 },
										'\u51FA\u751F\u5E74\u6708\u65E5\u671F'
									)
								)
							)
						)
					),
					contentElem
				)
			);
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
	location.href = '/?goto=' + location.pathname;
}
store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));