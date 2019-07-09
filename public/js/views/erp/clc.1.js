'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var isDebug = true;

var appInitState = {};

function setValueHandler(state, action) {
    console.log(action);
    var newCalcState = Object.assign({}, state[action.calcLabel]);
    newCalcState[action.valueLabel] = action.value;
    var newState = {};
    newState[action.calcLabel] = newCalcState;
    return Object.assign({}, state, newState);
}

var makeAction_SetValue = makeActionCreator('SETVALUE', 'calcLabel', 'valueLabel', 'value');

var appReducer = createReducer(appInitState, {
    SETVALUE: setValueHandler
});

var reducer = appReducer;
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var MyInputer_old = function (_React$PureComponent) {
    _inherits(MyInputer_old, _React$PureComponent);

    function MyInputer_old(props) {
        _classCallCheck(this, MyInputer_old);

        var _this = _possibleConstructorReturn(this, (MyInputer_old.__proto__ || Object.getPrototypeOf(MyInputer_old)).call(this));

        _this.state = {
            value: props.value
        };

        _this.inputChangedHandler = _this.inputChangedHandler.bind(_this);
        return _this;
    }

    _createClass(MyInputer_old, [{
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            this.setState({
                value: ev.target.value
            });
            this.props.onChanged(this.props.label, ev.target.value);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex' },
                React.createElement(
                    'span',
                    null,
                    this.props.label + ':'
                ),
                React.createElement('input', { onChange: this.inputChangedHandler, style: this.props.inputStyle, type: this.props.type, value: this.state.value })
            );
        }
    }]);

    return MyInputer_old;
}(React.PureComponent);

var MyInputer = function (_React$PureComponent2) {
    _inherits(MyInputer, _React$PureComponent2);

    function MyInputer(props) {
        _classCallCheck(this, MyInputer);

        var _this2 = _possibleConstructorReturn(this, (MyInputer.__proto__ || Object.getPrototypeOf(MyInputer)).call(this));

        _this2.inputChangedHandler = _this2.inputChangedHandler.bind(_this2);
        return _this2;
    }

    _createClass(MyInputer, [{
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            /*
            this.setState({
                value:ev.target.value,
            });
            */
            var newValue = ev.target.value;
            if (this.props.onChange) {
                this.props.onChange(this.props.label, newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex' },
                React.createElement(
                    'span',
                    null,
                    this.props.label + ':'
                ),
                React.createElement('input', { onChange: this.inputChangedHandler, style: this.props.inputStyle, type: this.props.type, value: this.props.value })
            );
        }
    }]);

    return MyInputer;
}(React.PureComponent);

function MyInputer_mapStateToProps(state, ownprop) {
    // 映射属性到App组件
    return {};
}

function MyInputer_dispathToProps(dispatch, ownprop) {
    // 映射方法到App组件
    return {};
}

var VisibleMyInputer = ReactRedux.connect(MyInputer_mapStateToProps, MyInputer_dispathToProps)(MyInputer);

var MyClac = function (_React$PureComponent3) {
    _inherits(MyClac, _React$PureComponent3);

    function MyClac(props) {
        _classCallCheck(this, MyClac);

        return _possibleConstructorReturn(this, (MyClac.__proto__ || Object.getPrototypeOf(MyClac)).call(this));
    }

    _createClass(MyClac, [{
        key: 'debuginfo',
        value: function debuginfo() {
            return this.props.label + '[' + this.state.valA + ' ' + this.state.opt + ' ' + this.state.valB + ' = ' + this.state.ret + ']';
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex w-100' },
                React.createElement(
                    'span',
                    { className: 'bg-primary text-light' },
                    this.props.label
                ),
                React.createElement(VisibleMyInputer, { label: 'ValueA', type: 'number', value: this.props.valA, onChange: this.props.valueChanged }),
                React.createElement(VisibleMyInputer, { label: 'Opt', type: 'text', value: this.props.opt, inputStyle: { width: '2em' }, onChange: this.props.valueChanged }),
                React.createElement(VisibleMyInputer, { label: 'ValueB', type: 'number', value: this.props.valB, onChange: this.props.valueChanged }),
                React.createElement(
                    'div',
                    null,
                    'Result=',
                    this.props.ret
                )
            );
        }
    }]);

    return MyClac;
}(React.PureComponent);

function MyClac_mapStateToProps(state, ownprop) {
    // 映射属性到App组件
    var calcState = state[ownprop.label];
    if (calcState == null) {
        calcState = {
            ValueA: 0,
            ValueB: 0,
            Opt: '+'
        };
    } else {
        if (calcState.ValueA == null) {
            calcState.ValueA = 0;
        }
        if (calcState.ValueB == null) {
            calcState.ValueB = 0;
        }
        if (calcState.Opt == null) {
            calcState.Opt = '+';
        }
    }
    var valA = parseFloat(calcState.ValueA);
    var valB = parseFloat(calcState.ValueB);
    var ret = 'NaN';
    switch (calcState.Opt) {
        case '+':
            ret = valA + valB;
            break;
        case '-':
            ret = valA - valB;
            break;
        case '*':
            ret = valA * valB;
            break;
        case '/':
            ret = valA / valB;
            break;
    }

    return {
        valA: calcState.ValueA,
        valB: calcState.ValueB,
        opt: calcState.Opt,
        ret: ret
    };
}

function MyClac_dispathToProps(dispatch, ownprop) {
    // 映射方法到App组件
    return {
        valueChanged: function valueChanged(valLabel, value) {
            store.dispatch(makeAction_SetValue(ownprop.label, valLabel, value));
        }
    };
}

var VisibleMyClac = ReactRedux.connect(MyClac_mapStateToProps, MyClac_dispathToProps)(MyClac);

var MyClac_old = function (_React$PureComponent4) {
    _inherits(MyClac_old, _React$PureComponent4);

    function MyClac_old(props) {
        _classCallCheck(this, MyClac_old);

        var _this4 = _possibleConstructorReturn(this, (MyClac_old.__proto__ || Object.getPrototypeOf(MyClac_old)).call(this));

        _this4.state = {
            valA: 0,
            valB: 0,
            opt: '+',
            ret: 0
        };

        _this4.valueChangedHandler = _this4.valueChangedHandler.bind(_this4);
        return _this4;
    }

    _createClass(MyClac_old, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            // 在组件被创建到浏览器时调用
            if (this.props.register) {
                this.props.register(this);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // 在组件被从浏览器移出时调用
        }
    }, {
        key: 'debuginfo',
        value: function debuginfo() {
            return this.props.label + '[' + this.state.valA + ' ' + this.state.opt + ' ' + this.state.valB + ' = ' + this.state.ret + ']';
        }
    }, {
        key: 'valueChangedHandler',
        value: function valueChangedHandler(label, newValue) {
            var valA = this.state.valA;
            var valB = this.state.valB;
            var opt = this.state.opt;
            if (label == 'ValueA') {
                valA = newValue;
            } else if (label == 'ValueB') {
                valB = newValue;
            } else {
                opt = newValue;
            }

            valA = parseFloat(valA);
            valB = parseFloat(valB);
            var ret = 'NaN';
            switch (opt) {
                case '+':
                    ret = valA + valB;
                    break;
                case '-':
                    ret = valA - valB;
                    break;
                case '*':
                    ret = valA * valB;
                    break;
                case '/':
                    ret = valA / valB;
                    break;
            }

            this.setState({
                valA: valA,
                valB: valB,
                ret: ret,
                opt: opt
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex w-100' },
                React.createElement(
                    'span',
                    { className: 'bg-primary text-light' },
                    this.props.label
                ),
                React.createElement(VisibleMyInputer, { label: 'ValueA', type: 'number', value: this.state.valA, onChanged: this.valueChangedHandler }),
                React.createElement(VisibleMyInputer, { label: 'OptA', type: 'text', value: this.state.opt, onChanged: this.valueChangedHandler, inputStyle: { width: '2em' } }),
                React.createElement(VisibleMyInputer, { label: 'ValueB', type: 'number', value: this.state.valB, onChanged: this.valueChangedHandler }),
                React.createElement(
                    'div',
                    null,
                    'Result=',
                    this.state.ret
                )
            );
        }
    }]);

    return MyClac_old;
}(React.PureComponent);

var App = function (_React$PureComponent5) {
    _inherits(App, _React$PureComponent5);

    function App(props) {
        _classCallCheck(this, App);

        var _this5 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

        _this5.clickDebugBtn = _this5.clickDebugBtn.bind(_this5);

        //this.calcRef = React.createRef();
        //this.calcItem_arr = [];
        return _this5;
    }
    /*
        calMounted(item){
            this.calcItem_arr.push(item);
        }
    */

    _createClass(App, [{
        key: 'clickDebugBtn',
        value: function clickDebugBtn() {
            console.log('调试信息');
            for (var i = 0; i < this.props.count; ++i) {
                var calcState = store.getState()['计算器' + i];
                var info = '计算器' + i + '还未被计算过';
                if (calcState != null) {
                    info = '计算器' + i + ':[' + calcState.ValueA + ' ' + calcState.Opt + ' ' + calcState.ValueB + ' = ?]';
                }
                console.log(info);
            }
            /*
            this.calcItem_arr.forEach(item=>{
                console.log(item.debuginfo());
            });     
            */
        }
    }, {
        key: 'render',
        value: function render() {
            var calc_arr = [];
            for (var i = 0; i < this.props.count; ++i) {
                calc_arr.push(React.createElement(VisibleMyClac, { key: i, label: '计算器' + i }));
            }
            return React.createElement(
                'div',
                { className: 'd-flex w-100 flex-column' },
                calc_arr,
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-dark', onClick: this.clickDebugBtn },
                    '\u8C03\u8BD5'
                )
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