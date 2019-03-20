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
var appStateChangedAct_map = {};

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
		key: 'bodyScroll',
		value: function bodyScroll(ev) {
			document.getElementById('tableHeaderdiv').scrollLeft = ev.target.scrollLeft;
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
					{ className: 'mh-100 mw-100 hidenOverflow position-relative', style: { clear: 'both', height: '300px', paddingBottom: '50px' } },
					React.createElement(
						'div',
						{ id: 'tableHeaderdiv', className: 'mw-100 hidenOverflow' },
						React.createElement(
							'table',
							{ className: 'table', style: { width: '1000px', marginBottom: '0px' } },
							React.createElement(
								'thead',
								{ className: 'thead-dark' },
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '50px' } },
										'#'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '100px' } },
										'First'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '150px' } },
										'Last'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '200px' } },
										'Handle'
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ onScroll: this.bodyScroll, id: 'tablebodydiv', className: 'mw-100 autoScroll_Touch', style: { height: '100%' } },
						React.createElement(
							'table',
							{ className: 'table table-striped table-hover ', style: { width: '1000px', marginTop: '-50px' } },
							React.createElement(
								'caption',
								null,
								'List of users'
							),
							React.createElement(
								'thead',
								{ className: 'thead-dark' },
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '50px' } },
										'#'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '100px' } },
										'First'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '150px' } },
										'Last'
									),
									React.createElement(
										'th',
										{ scope: 'col', style: { width: '200px' } },
										'Handle'
									)
								)
							),
							React.createElement(
								'tbody',
								null,
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'1'
									),
									React.createElement(
										'td',
										null,
										'Markdsfffffffffffffffffffffffffffffffffffffffffffffff'
									),
									React.createElement(
										'td',
										null,
										'Otto'
									),
									React.createElement(
										'td',
										null,
										'@mdo'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'2'
									),
									React.createElement(
										'td',
										null,
										'Jacob'
									),
									React.createElement(
										'td',
										null,
										'Thornton'
									),
									React.createElement(
										'td',
										null,
										'@fat'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								)
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'mh-100 mw-100 hidenOverflow position-relative', style: { clear: 'both', height: '300px', paddingBottom: '50px' } },
					React.createElement(
						'div',
						{ id: 'tableHeaderdiv', className: 'mw-100 hidenOverflow' },
						React.createElement(
							'table',
							{ className: 'table w-100', style: { marginBottom: '0px' } },
							React.createElement(
								'thead',
								{ className: 'thead-dark' },
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'col' },
										'#'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'First'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'Last'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'Handle'
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ onScroll: this.bodyScroll, id: 'tablebodydiv', className: 'mw-100 autoScroll_Touch', style: { height: '100%' } },
						React.createElement(
							'table',
							{ className: 'table table-striped table-hover', style: { marginTop: '-50px' } },
							React.createElement(
								'caption',
								null,
								'List of users'
							),
							React.createElement(
								'thead',
								{ className: 'thead-dark' },
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'col' },
										'#'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'First'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'Last'
									),
									React.createElement(
										'th',
										{ scope: 'col' },
										'Handle'
									)
								)
							),
							React.createElement(
								'tbody',
								null,
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'1'
									),
									React.createElement(
										'td',
										null,
										'fdghfh'
									),
									React.createElement(
										'td',
										null,
										'Otto'
									),
									React.createElement(
										'td',
										null,
										'@mdo'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'2'
									),
									React.createElement(
										'td',
										null,
										'Jacob'
									),
									React.createElement(
										'td',
										null,
										'Thornton'
									),
									React.createElement(
										'td',
										null,
										'@fat'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								),
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ scope: 'row' },
										'3'
									),
									React.createElement(
										'td',
										null,
										'Larry'
									),
									React.createElement(
										'td',
										null,
										'the Bird'
									),
									React.createElement(
										'td',
										null,
										'@twitter'
									)
								)
							)
						)
					)
				)
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