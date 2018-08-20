"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function MenuCammandItem(props) {
    return React.createElement(
        "a",
        { className: "dropdown-item", href: "#" },
        props.text
    );
}

var MenuItem = function (_React$PureComponent) {
    _inherits(MenuItem, _React$PureComponent);

    function MenuItem(props) {
        _classCallCheck(this, MenuItem);

        var _this = _possibleConstructorReturn(this, (MenuItem.__proto__ || Object.getPrototypeOf(MenuItem)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(MenuItem, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "dropdown ml-1 " + this.props.className },
                React.createElement(
                    "button",
                    { className: "btn btn-secondary dropdown-toggle", type: "button", id: this.props.id + "dmb", "data-toggle": "dropdown" },
                    this.props.text
                ),
                React.createElement(
                    "div",
                    { className: "dropdown-menu" },
                    this.props.children
                )
            );
        }
    }]);

    return MenuItem;
}(React.PureComponent);

var MainMenu = function (_React$PureComponent2) {
    _inherits(MainMenu, _React$PureComponent2);

    function MainMenu(props) {
        _classCallCheck(this, MainMenu);

        var _this2 = _possibleConstructorReturn(this, (MainMenu.__proto__ || Object.getPrototypeOf(MainMenu)).call(this, props));

        _this2.state = {};
        return _this2;
    }

    _createClass(MainMenu, [{
        key: "render",
        value: function render() {
            return null;
            return React.createElement(
                "div",
                { id: "mainMenuContainer", className: "flex-grow-0 flex-shrink-0 bg-secondary d-flex MainMenu" },
                React.createElement(
                    "div",
                    { className: "btn-group", role: "group" },
                    React.createElement(
                        MenuItem,
                        { id: "MI_FILE", text: "\u6587\u4EF6" },
                        React.createElement(MenuCammandItem, { text: "\u6253\u5F00" }),
                        React.createElement(MenuCammandItem, { text: "\u521B\u5EFA" })
                    ),
                    React.createElement(
                        MenuItem,
                        { id: "MI_FILE", text: "\u6570\u636E\u5E93" },
                        React.createElement(MenuCammandItem, { text: "\u7BA1\u7406" })
                    )
                )
            );
        }
    }]);

    return MainMenu;
}(React.PureComponent);