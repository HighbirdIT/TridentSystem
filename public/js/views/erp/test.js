'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var pageInitState = {};

var mainReducer = createReducer(pageInitState, {
    WELCOMINFOCHANGED: welcomInfoChangedHandler
});

var WELCOMINFOCHANGED = 'WELCOMINFOCHANGED';
var welcomInfoChanged = makeActionCreator(WELCOMINFOCHANGED, 'name', 'value');
function welcomInfoChangedHandler(state, action) {
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, _defineProperty({}, action.name, action.value));
}

var reducer = Redux.combineReducers({ main: mainReducer });
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var ThisPage = function (_React$PureComponent) {
    _inherits(ThisPage, _React$PureComponent);

    function ThisPage() {
        _classCallCheck(this, ThisPage);

        return _possibleConstructorReturn(this, (ThisPage.__proto__ || Object.getPrototypeOf(ThisPage)).apply(this, arguments));
    }

    _createClass(ThisPage, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                'Hello World'
            );
        }
    }]);

    return ThisPage;
}(React.PureComponent);

ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(ThisPage, null)
), document.getElementById('reactRoot'));

//store.dispatch(fetchJsonPost('onlineinterview_process', { action: 'pageinit' }, 'pageiniting'));