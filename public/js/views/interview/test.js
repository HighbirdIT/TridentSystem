'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;
var Grid = AMUITouch.Grid;
var Col = AMUITouch.Col;
var Card = AMUITouch.Card;
var Icon = AMUITouch.Icon;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;

var MySelection = function (_React$PureComponent) {
  _inherits(MySelection, _React$PureComponent);

  function MySelection(props) {
    _classCallCheck(this, MySelection);

    var _this = _possibleConstructorReturn(this, (MySelection.__proto__ || Object.getPrototypeOf(MySelection)).call(this, props));

    _this.state = { isOpen: false, id: 123 };
    _this.onClickHandler = _this.onClickHandler.bind(_this);
    _this.onBlurHandler = _this.onBlurHandler.bind(_this);
    _this.onFocusHandler = _this.onFocusHandler.bind(_this);
    return _this;
  }

  _createClass(MySelection, [{
    key: 'onClickHandler',
    value: function onClickHandler() {
      this.setState(function (currentState) {
        return {
          isOpen: !currentState.isOpen
        };
      });
      this.setState(function (currentState) {
        return {
          id: 3456
        };
      });
      var g = 0;
    }
  }, {
    key: 'onBlurHandler',
    value: function onBlurHandler() {
      var _this2 = this;

      this.timeOutId = setTimeout(function () {
        _this2.setState({
          isOpen: false
        });
      });
    }
  }, {
    key: 'onFocusHandler',
    value: function onFocusHandler() {
      clearTimeout(this.timeOutId);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { onBlur: this.onBlurHandler,
          onFocus: this.onFocusHandler },
        React.createElement(
          'button',
          { onClick: this.onClickHandler,
            'aria-haspopup': 'true',
            'aria-expanded': this.state.isOpen },
          'Select an option'
        ),
        this.state.isOpen ? React.createElement(
          'ul',
          null,
          React.createElement(
            'li',
            null,
            'Option 1'
          ),
          React.createElement(
            'li',
            null,
            'Option 2'
          ),
          React.createElement(
            'li',
            null,
            'Option 3'
          )
        ) : null,
        function (them) {
          return React.createElement(
            'div',
            null,
            'dferer'
          );
        }
      );
    }
  }]);

  return MySelection;
}(React.PureComponent);

var CHANGED = 'CHAGNED';
var mk_changeAction = makeActionCreator(CHANGED, 'label', 'value');

function reducer(state, action) {
  if (state == null) {
    return {
      A: '',
      B: '',
      C: ''
    };
  }
  console.log(action);
  switch (action.type) {
    case CHANGED:
      return updateObject(state, _defineProperty({}, action.label, action.value));
      break;
  }
  return state;
}

var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee'
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222'
  }
};

var ThemeContext = React.createContext({
  theme: themes.light,
  toggleFun: function toggleFun() {}
});

function ThemedButton(props) {
  return React.createElement(
    ThemeContext.Consumer,
    null,
    function (_ref) {
      var theme = _ref.theme,
          toggleFun = _ref.toggleFun;
      return React.createElement('button', _extends({}, props, {
        onClick: toggleFun,
        style: { backgroundColor: theme.background }
      }));
    }
  );
}

function Toolbar(props) {
  return React.createElement(
    ThemedButton,
    null,
    'Change Theme'
  );
}

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this3 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    var g = _this3.feret.sdfer;
    _this3.toggleTheme = _this3.toggleTheme.bind(_this3);
    _this3.state = {
      themeContext: { theme: themes.light, toggleFun: _this3.toggleTheme }
    };
    return _this3;
  }

  _createClass(App, [{
    key: 'toggleTheme',
    value: function toggleTheme() {
      var _this4 = this;

      console.log('toggle');
      this.setState(function (state) {
        return {
          themeContext: {
            theme: state.themeContext.theme === themes.dark ? themes.light : themes.dark,
            toggleFun: _this4.toggleTheme
          }
        };
      });
    }
  }, {
    key: 'render',
    value: function render() {
      // The ThemedButton button inside the ThemeProvider
      // uses the theme from state while the one outside uses
      // the default dark theme
      return React.createElement(
        View,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(
            'h2',
            null,
            'Wrong'
          ),
          React.createElement(
            'details',
            { style: { whiteSpace: 'pre-wrap' } },
            'dfgerteryyrert'
          )
        ),
        React.createElement(
          ThemeContext.Provider,
          { value: this.state.themeContext },
          React.createElement(Toolbar, null)
        ),
        React.createElement(
          Container,
          null,
          React.createElement(
            ThemedButton,
            null,
            'Button'
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

var ErrorBoundary = function (_React$Component2) {
  _inherits(ErrorBoundary, _React$Component2);

  function ErrorBoundary(props) {
    _classCallCheck(this, ErrorBoundary);

    var _this5 = _possibleConstructorReturn(this, (ErrorBoundary.__proto__ || Object.getPrototypeOf(ErrorBoundary)).call(this, props));

    _this5.state = { hasError: false };
    return _this5;
  }

  _createClass(ErrorBoundary, [{
    key: 'componentDidCatch',
    value: function componentDidCatch(error, info) {
      // Display fallback UI
      this.setState({ hasError: true, errInfo: error });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return React.createElement(
          'div',
          null,
          React.createElement(
            'h1',
            null,
            'Something went wrong.'
          ),
          React.createElement(
            'details',
            { style: { whiteSpace: 'pre-wrap' } },
            this.state.errInfo.toString()
          )
        );
      }
      return this.props.children;
    }
  }]);

  return ErrorBoundary;
}(React.Component);

var MyInputor = function (_React$Component3) {
  _inherits(MyInputor, _React$Component3);

  function MyInputor(props) {
    _classCallCheck(this, MyInputor);

    var _this6 = _possibleConstructorReturn(this, (MyInputor.__proto__ || Object.getPrototypeOf(MyInputor)).call(this, props));

    _this6.state = {};
    return _this6;
  }

  _createClass(MyInputor, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            null,
            'input',
            this.props.label
          ),
          React.createElement('input', { name: this.props.label, type: 'text', value: this.props.value, onChange: this.props.onChanged }),
          React.createElement(
            'div',
            null,
            'value:',
            this.props.value
          )
        )
      );
    }
  }]);

  return MyInputor;
}(React.Component);

function MyInputor_mapstatetoprops(state, ownprops) {
  return { value: state[ownprops.label] };
}

function MyInputor_mapdispatchtoprops(dispatch, ownprops) {
  return {
    onChanged: function onChanged(inputItem) {
      dispatch(mk_changeAction(ownprops.label, inputItem.target.value));
      inputItem.preventDefault();
    }
  };
}

var VisibleMyInputor = ReactRedux.connect(MyInputor_mapstatetoprops, MyInputor_mapdispatchtoprops)(MyInputor);

ReactDOM.render(React.createElement(
  Provider,
  { store: store },
  React.createElement(
    ErrorBoundary,
    null,
    React.createElement(VisibleMyInputor, { label: 'A' }),
    React.createElement(VisibleMyInputor, { label: 'B' }),
    React.createElement(VisibleMyInputor, { label: 'C' })
  )
), document.getElementById('root'));