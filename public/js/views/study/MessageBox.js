"use strict";

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
            keyword: 0,
            arr: [],
            html: "Edit <b>me</b> !"
        };

        _this.keyChanged = _this.keyChanged.bind(_this);
        _this.messageboxonclick = _this.messageboxonclick.bind(_this);
        return _this;
    }

    _createClass(MyApp, [{
        key: "keyChanged",
        value: function keyChanged(ev) {
            var target = ev.target;
            var keyword = target.value;

            this.setState({ keyword: keyword });
        }
    }, {
        key: "handleChange",
        value: function handleChange(evt) {
            this.setState({ html: evt.target.value });
        }
    }, {
        key: "messageboxonclick",
        value: function messageboxonclick() {

            var times = this.state.keyword;
            times = times + 1;
            this.setState({ keyword: times });
            var arr_list = [];
            arr_list.push(times);
            this.setState({ arr: arr_list });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                { className: "w-100 h-100 d-flex flex-column" },
                React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "button",
                        { onClick: this.messageboxonclick },
                        "\u6D4B\u8BD5\u6309\u94AE"
                    ),
                    React.createElement(
                        "div",
                        { className: 'topMsg ' + (this.state.keyword > 0 ? 'fadeIn' : 'fadeOut'), onClick: this.messageboxonclick },
                        "Info!Some text......"
                    )
                ),
                React.createElement(
                    "div",
                    { name: "listDIV", className: "list-group flex-grow-1 flex-shrink-1", style: { overflow: 'auto' } },
                    this.state.arr.map(function (item, i) {
                        return React.createElement(
                            "div",
                            { onClick: _this2.messageboxonclick, className: 'topMsg ' + (_this2.state.keyword > 0 ? 'fadeIn' : 'fadeOut'), key: i, code: item.code },
                            React.createElement(
                                "div",
                                { className: "col-6" },
                                item.name
                            ),
                            React.createElement(
                                "div",
                                { className: "col-6" },
                                item.code
                            )
                        );
                    })
                ),
                React.createElement("div", { contentEditable: true, className: "li-instead-input" })
            );
        }
    }]);

    return MyApp;
}(React.PureComponent);

ReactDOM.render(React.createElement(MyApp, { name: "Hello3React" }), document.getElementById('reactRoot'));