'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;
var appServerUrl = '/erppage/server/ZZMCS_server';
var thisAppTitle = '赵智淼测试';
var appInitState = { loaded: false, ui: {} };
var appReducerSetting = {};
var appReducer = createReducer(appInitState, Object.assign(baseReducerSetting, appReducerSetting));;
var reducer = Redux.combineReducers({ app: appReducer });;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));;

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
			return React.createElement(
				'div',
				{ className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
				this.renderLoadingTip(),
				this.renderHead(),
				React.createElement(
					'div',
					{ className: 'd-flex flex-column flex-grow-1 flex-shrink-1 autoScroll' },
					this.renderContent()
				),
				this.renderFoot()
			);
		}
	}, {
		key: 'renderContent',
		value: function renderContent() {
			return React.createElement(
				'div',
				null,
				'Haha'
			);
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
					thisAppTitle
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
	}]);

	return App;
}(React.PureComponent);

function App_mapstatetoprops(state) {
	return {};
}
function App_disptchtoprops(dispatch, ownprops) {
	return {};
}
var VisibleApp = ReactRedux.connect(App_mapstatetoprops, App_disptchtoprops)(App);

ErpControlInit();
ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(VisibleApp, null)
), document.getElementById('reactRoot'));
