"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControlPanel = function (_React$PureComponent) {
    _inherits(ControlPanel, _React$PureComponent);

    function ControlPanel(props) {
        _classCallCheck(this, ControlPanel);

        var _this = _possibleConstructorReturn(this, (ControlPanel.__proto__ || Object.getPrototypeOf(ControlPanel)).call(this, props));

        var initState = {};
        _this.state = initState;
        return _this;
    }

    _createClass(ControlPanel, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                _extends({}, this.props, { style: { width: '200px' } }),
                React.createElement(
                    "button",
                    { type: "button", "data-toggle": "collapse", "data-target": "#commonCtlList", className: "btn flex-grow-0 flex-shrink-0 bg-secondary text-light", style: { borderRadius: '0em', height: '2.5em' } },
                    "\u754C\u9762\u63A7\u4EF6"
                ),
                React.createElement(
                    "div",
                    { id: "commonCtlList", className: "list-group flex-grow-1 flex-shrink-1 collapse show", style: { overflow: 'auto' } },
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6587\u672C\u6846"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6807\u7B7E\u6846"
                    )
                ),
                React.createElement(
                    "button",
                    { type: "button", "data-toggle": "collapse", "data-target": "#commandCtlList", className: "btn flex-grow-0 flex-shrink-0 bg-secondary text-light", style: { borderRadius: '0em', height: '2.5em' } },
                    "\u6309\u94AE\u63A7\u4EF6"
                ),
                React.createElement(
                    "div",
                    { id: "commandCtlList", className: "list-group flex-grow-1 flex-shrink-1 collapse show", style: { overflow: 'auto' } },
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE1"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "list-group-item list-group-item-action flex-grow-0 flex-shrink-0" },
                        "\u6309\u94AE2"
                    )
                )
            );
        }
    }]);

    return ControlPanel;
}(React.PureComponent);