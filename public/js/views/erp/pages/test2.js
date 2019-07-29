'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/test2';
var thisAppTitle = 'test2';
var appInitState = { loaded: false, ui: {}, nowPage: '' };
var appReducerSetting = {
	AT_PAGELOADED: pageLoadedReducer.bind(window),
	AT_GOTOPAGE: gotoPageReducer.bind(window)
};
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));;
var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));;
var appStateChangedAct_map = {
	'M_Page_0.M_Form_0.records_arr': FreshCM_Form_0.bind(window),
	'M_Page_0.M_Form_0.recordIndex': BindCM_Form_0.bind(window)
};

function pageLoadedReducer(state) {
	return gotoPage('M_Page_0', state);
}

function gotoPageReducer(state, action) {
	return gotoPage(action.pageName, state);
}

function gotoPage(pageName, state) {
	if (state.nowPage == pageName) {
		return state;
	}
	var rltState = state;
	switch (pageName) {
		case 'M_Page_0':
			rltState = activeM_Page_0(state);
			break;
	}
	return Object.assign({}, rltState);
}

function activeM_Page_0(state) {
	state.nowPage = 'M_Page_0';
	setTimeout(function () {
		pullCM_Form_0Data();
	}, 50);
	return state;
}

function FreshCM_Form_0(retState, newValue) {
	simpleFreshFormFun(retState, newValue, 'M_Page_0.M_Form_0');
	//console.log('123');
}

function BindCM_Form_0(retState, newIndex, oldIndex) {
	var formState = getStateByPath(retState, 'M_Page_0.M_Form_0');
	var records_arr = formState.records_arr;
	var needSetState = {};
	if (oldIndex == -1) {
		// undo insert
		needSetState['insertCache.M_Label0_text'] = getStateByPath(formState, 'M_Label0.text');
		needSetState['insertCache.M_Text_2_value'] = getStateByPath(formState, 'M_Text_2.value');
	}
	var useIndex = newIndex;
	if (records_arr == null || newIndex == -1) {
		var insertCache = getStateByPath(formState, 'insertCache');
		if (insertCache) {
			needSetState['M_Label0.text'] = IsEmptyString(insertCache.M_Label0_text) ? '' : insertCache.M_Label0_text;
			needSetState['M_Text_2.value'] = IsEmptyString(insertCache.M_Text_2_value) ? '' : insertCache.M_Text_2_value;
		} else {
			needSetState['M_Label0.text'] = '';
			needSetState['M_Text_2.value'] = '';
		}
	} else {
		var nowRecord = records_arr[useIndex];
		//needSetState['M_Label0.text'] = nowRecord['员工登记姓名'];
		needSetState['M_Text_2.value'] = nowRecord['出生年月日期'];
		needSetState['M_Label0.text'] = M_Label0_get(retState, {
			form0_record: nowRecord
		});
	}
	setManyStateByPath(retState, 'M_Page_0.M_Form_0', needSetState);
}

function M_Label0_get(state, bundle) {
	var form0_record = bundle.form0_record;
	if (form0_record == null) {
		return '错误';
	}
	return form0_record.员工登记姓名 + '呵呵';
}

function pullCM_Form_0Data() {
	store.dispatch(fetchJsonPost(appServerUrl, { action: 'getCM_Form_0DS' }, makeFTD_Prop('M_Page_0', 'M_Form_0', 'records_arr', false), EFetchKey.FetchPropValue));
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
	if (!retProps.loaded) {
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
					'\u8D75\u667A\u6DFC'
				)
			);
		}
	}, {
		key: 'renderFoot',
		value: function renderFoot() {
			return React.createElement(
				'div',
				{ className: 'flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter' },
				React.createElement(
					'h3',
					null,
					'\u9875\u811A'
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
				React.createElement(VisibleCM_Form_0, { parentPath: 'M_Page_0', id: 'M_Form_0' })
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

		_this3.canInsert = false;
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
			if (this.props.fetchErr) {
				return renderFetcingErrDiv(this.props.fetchErr.info);
			}
			if (!this.props.loaded || this.props.fetching) {
				return renderFetcingTipDiv();
			}
			var nowIndex = this.props.recordIndex;

			retElem = React.createElement(
				'div',
				{ className: 'd-flex flex-grow-1 flex-shrink-1 erp-form flex-column ' },
				React.createElement(
					'div',
					{ className: 'position-relative d-flex flex-grow-1 d-flex flex-shrink-1 flex-column autoScroll_Touch' },
					React.createElement(
						'div',
						{ className: 'flex-grow-0 d-flex flex-shrink-1 erp-control' },
						React.createElement('div', { className: 'flex-grow-1 d-flex flex-shrink-1 erp-control ' }),
						React.createElement(
							'span',
							{ className: 'erp-control ' },
							'2019-1-7'
						),
						React.createElement('div', { className: 'flex-grow-1 d-flex flex-shrink-1 erp-control ' })
					),
					React.createElement(
						VisibleERPC_LabeledControl,
						{ id: 'M_LC_1', parentPath: 'M_Page_0.M_Form_0', label: '\u5458\u5DE5\u59D3\u540D' },
						React.createElement(VisibleERPC_Label, { id: 'M_Label0', parentPath: 'M_Page_0.M_Form_0' })
					),
					React.createElement(
						VisibleERPC_LabeledControl,
						{ id: 'M_LC_0', parentPath: 'M_Page_0.M_Form_0', label: '\u6D4B\u8BD5\u5B57\u6BB5' },
						React.createElement(VisibleERPC_Text, { id: 'M_Text_2', parentPath: 'M_Page_0.M_Form_0', type: 'date' })
					)
				),
				nowIndex == -1 && React.createElement(
					'div',
					{ className: 'btn-group' },
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-success flex-grow-1 processBtn' },
						'\u767B\u8BB0\u6682\u5B58'
					),
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-success flex-grow-1 processBtn' },
						'\u6700\u7EC8\u63D0\u4EA4'
					)
				),
				nowIndex != -1 && React.createElement(
					'div',
					{ className: 'btn-group' },
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-primary flex-grow-1 processBtn' },
						'\u4FEE\u6539\u4FDD\u5B58'
					),
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-primary flex-grow-1 processBtn' },
						'\u5BA1\u6838\u63D0\u4EA4'
					),
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-primary flex-grow-1 processBtn' },
						'\u5BA1\u6838\u62D2\u7EDD'
					),
					React.createElement(
						'button',
						{ type: 'button', className: 'btn btn-primary flex-grow-1 processBtn' },
						'\u5BA1\u6838\u5220\u9664'
					)
				),
				this.renderNavigater()
			);
			return retElem;
		}
	}]);

	return CM_Form_0;
}(React.PureComponent);

function CM_Form_0_mapstatetoprops(state, ownprops) {
	var ctlState = getStateByPath(state, MakePath(ownprops.parentPath, 'M_Form_0'), {});
	var retProps = {
		fetching: ctlState.fetching,
		fetchErr: ctlState.fetchErr,
		records_arr: ctlState.records_arr,
		recordIndex: ctlState.recordIndex
	};
	retProps.loaded = ctlState.records_arr != null;
	return retProps;
}
function CM_Form_0_disptchtoprops(dispatch, ownprops) {
	var retDispath = {};
	return retDispath;
}
var VisibleCM_Form_0 = ReactRedux.connect(CM_Form_0_mapstatetoprops, CM_Form_0_disptchtoprops)(CM_Form_0);

ErpControlInit();
ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(VisibleApp, null)
), document.getElementById('reactRoot'));

store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));