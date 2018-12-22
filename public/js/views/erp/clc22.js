'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = false;

var appInitState = {};

function appReducer(state, action) {
    if (state == null) {
        // 返回默认state
        return {
            page: {
                text01: ''
            }
        };
    }
    if (action.type != 'InputChanged') {
        return state; // 我不管
    }
    var newSate = Object.assign({}, state);
    newSate.page = Object.assign({}, state.page, { text01: action.value });
    console.log(action);
    return newSate;
}

var store = Redux.createStore(appReducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var Page = function (_React$PureComponent) {
    _inherits(Page, _React$PureComponent);

    function Page(props) {
        _classCallCheck(this, Page);

        var _this = _possibleConstructorReturn(this, (Page.__proto__ || Object.getPrototypeOf(Page)).call(this));

        autoBind(_this);
        return _this;
    }

    _createClass(Page, [{
        key: 'inputChanged',
        value: function inputChanged(ev) {
            //console.log(ev.target.value);
            store.dispatch({ type: 'InputChanged', value: ev.target.value });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('input', { type: 'text', onChange: this.inputChanged, value: this.props.pageState.text01 });
        }
    }]);

    return Page;
}(React.PureComponent);

function Page_mapStateToProps(state, ownprop) {
    // 映射属性到App组件
    //var pageState = state.page;
    return {
        //        inputValue:state.page.text01,
        pageState: state.page
    };
}

function Page_dispathToProps(dispatch, ownprop) {
    // 映射方法到App组件
    return {};
}

var VisiblePage = ReactRedux.connect(Page_mapStateToProps, Page_dispathToProps)(Page);

var App = function (_React$PureComponent2) {
    _inherits(App, _React$PureComponent2);

    function App(props) {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex w-100 flex-column' },
                React.createElement(VisiblePage, null)
            );
        }
    }]);

    return App;
}(React.PureComponent);

function App_mapStateToProps(state, ownprop) {
    // 映射属性到App组件
    return {};
}

function App_dispathToProps(dispatch, ownprop) {
    // 映射方法到App组件
    return {};
}

var VisibleApp = ReactRedux.connect(App_mapStateToProps, App_dispathToProps)(App);

ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(VisibleApp, { count: 5 })
), document.getElementById('reactRoot'));