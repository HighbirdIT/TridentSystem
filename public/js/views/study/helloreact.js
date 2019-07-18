'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Calculator = function (_React$PureComponent) {
    _inherits(Calculator, _React$PureComponent);

    function Calculator(props) {
        _classCallCheck(this, Calculator);

        var _this = _possibleConstructorReturn(this, (Calculator.__proto__ || Object.getPrototypeOf(Calculator)).call(this, props));

        _this.state = {
            a: 0,
            b: 0,
            rlt: 0,
            process: '+'
        };

        _this.ctlOnchange = _this.ctlOnchange.bind(_this);
        _this.clickBtnHandler = _this.clickBtnHandler.bind(_this);
        return _this;
    }

    _createClass(Calculator, [{
        key: 'ctlOnchange',
        value: function ctlOnchange(ev) {
            var target = ev.target;
            var id = target.getAttribute('id');
            var newState = {};
            switch (id) {
                case this.props.name + 'a_input':
                    newState.a = target.value;
                    break;52;
                case this.props.name + 'b_input':
                    newState.b = target.value;
                    break;
                case this.props.name + 'process':
                    newState.process = target.value;
                    break;
            }

            this.setState(newState);
            this.setState(function (nowState) {
                var rlt = 0;
                switch (nowState.process) {
                    case '+':
                        rlt = parseFloat(nowState.a) + parseFloat(nowState.b);
                        break;
                    case '-':
                        rlt = parseFloat(nowState.a) - parseFloat(nowState.b);
                        break;
                    case 'x':
                        rlt = parseFloat(nowState.a) * parseFloat(nowState.b);
                        break;
                    case '÷':
                        rlt = parseFloat(nowState.a) / parseFloat(nowState.b);
                        break;
                }
                return { rlt: rlt };
            });
        }
    }, {
        key: 'clickBtnHandler',
        value: function clickBtnHandler(ev) {
            this.setState(function (nowState) {
                var rlt = 0;
                switch (nowState.process) {
                    case '+':
                        rlt = parseFloat(nowState.a) + parseFloat(nowState.b);
                        break;
                    case '-':
                        rlt = parseFloat(nowState.a) - parseFloat(nowState.b);
                        break;
                    case 'x':
                        rlt = parseFloat(nowState.a) * parseFloat(nowState.b);
                        break;
                    case '÷':
                        rlt = parseFloat(nowState.a) / parseFloat(nowState.b);
                        break;
                }
                return { rlt: rlt };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { name: 'CalculatorDiv', className: 'w-100 d-flex align-items-center' },
                React.createElement(
                    'div',
                    { className: 'topMsg' },
                    'finfinienf'
                ),
                React.createElement(
                    'div',
                    { className: 'badge badge-primary' },
                    this.props.name
                ),
                React.createElement(
                    'span',
                    null,
                    'A:'
                ),
                React.createElement('input', { type: 'Number', value: this.state.a, id: this.props.name + 'a_input', onChange: this.ctlOnchange }),
                React.createElement(
                    'select',
                    { id: this.props.name + 'process', className: 'ml-', style: { width: '10%' }, value: this.state.process, onChange: this.ctlOnchange },
                    React.createElement(
                        'option',
                        { value: '+' },
                        '+'
                    ),
                    React.createElement(
                        'option',
                        { value: '-' },
                        '-'
                    ),
                    React.createElement(
                        'option',
                        { value: 'x' },
                        'x'
                    ),
                    React.createElement(
                        'option',
                        { value: '\xF7' },
                        '\xF7'
                    )
                ),
                React.createElement(
                    'span',
                    { className: 'ml-1' },
                    'B:'
                ),
                React.createElement('input', { type: 'Number', value: this.state.b, id: this.props.name + 'b_input', onChange: this.ctlOnchange }),
                this.props.hadbtn ? React.createElement(
                    'button',
                    { style: { width: '200px' }, onClick: this.clickBtnHandler, type: 'button', className: 'ml-1 btn btn-primary' },
                    '='
                ) : null,
                React.createElement(
                    'div',
                    { className: 'ml-1' },
                    React.createElement(
                        'h1',
                        null,
                        this.state.rlt
                    )
                )
            );
        }
    }]);

    return Calculator;
}(React.PureComponent);

var MyApp = function (_React$PureComponent2) {
    _inherits(MyApp, _React$PureComponent2);

    function MyApp(props) {
        _classCallCheck(this, MyApp);

        var _this2 = _possibleConstructorReturn(this, (MyApp.__proto__ || Object.getPrototypeOf(MyApp)).call(this, props));

        _this2.state = {};

        _this2.clickBtnHandler = _this2.clickBtnHandler.bind(_this2);
        return _this2;
    }

    _createClass(MyApp, [{
        key: 'clickBtnHandler',
        value: function clickBtnHandler(ev) {
            var theBtn = ev.target;
            var newCount = this.state.count;
            if (theBtn.getAttribute('name') == 'add') {
                newCount += 1;
            } else if (theBtn.getAttribute('name') == 'sub') {
                newCount -= 1;
            }

            this.setState({ count: newCount });
        }
    }, {
        key: 'renderCalculator',
        value: function renderCalculator(count) {
            var rlt = [];
            for (var i = 1; i <= count; ++i) {
                rlt.push(React.createElement(Calculator, { key: i, name: '计算器' + i, hadbtn: false }));
            }
            return rlt;
        }
    }, {
        key: 'render',
        value: function render() {
            return this.renderCalculator(1);
            /*
            return (
            <div className="w-100 h-100 d-flex flex-column">
                <div>
                    你点了:{this.state.count}次按钮
                </div>
                <button onClick={this.clickBtnHandler} type='button' className='btn btn-primary' name='add'>点击喜加一</button>
                <button onClick={this.clickBtnHandler} type='button' className='btn btn-danger' name='sub'>点击喜-1</button>
            </div>);
            */
        }
    }]);

    return MyApp;
}(React.PureComponent);

// React start


ReactDOM.render(React.createElement(MyApp, { name: 'Hello3React' }), document.getElementById('reactRoot'));