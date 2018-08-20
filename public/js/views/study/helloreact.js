'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MyApp = function (_React$PureComponent) {
    _inherits(MyApp, _React$PureComponent);

    function MyApp(props) {
        _classCallCheck(this, MyApp);

        var _this = _possibleConstructorReturn(this, (MyApp.__proto__ || Object.getPrototypeOf(MyApp)).call(this, props));

        _this.state = {
            count: 0
        };

        _this.clickBtnHandler = _this.clickBtnHandler.bind(_this);
        return _this;
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
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'w-100 h-100 d-flex flex-column' },
                React.createElement(
                    'div',
                    null,
                    '\u4F60\u70B9\u4E86:',
                    this.state.count,
                    '\u6B21\u6309\u94AE'
                ),
                React.createElement(
                    'button',
                    { onClick: this.clickBtnHandler, type: 'button', className: 'btn btn-primary', name: 'add' },
                    '\u70B9\u51FB\u559C\u52A0\u4E00'
                ),
                React.createElement(
                    'button',
                    { onClick: this.clickBtnHandler, type: 'button', className: 'btn btn-danger', name: 'sub' },
                    '\u70B9\u51FB\u559C-1'
                )
            );
        }
    }]);

    return MyApp;
}(React.PureComponent);

// React start


ReactDOM.render(React.createElement(MyApp, { name: 'Hello3React' }), document.getElementById('reactRoot'));