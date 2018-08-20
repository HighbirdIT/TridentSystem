"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttributePanel = function (_React$PureComponent) {
    _inherits(AttributePanel, _React$PureComponent);

    function AttributePanel(props) {
        _classCallCheck(this, AttributePanel);

        var _this = _possibleConstructorReturn(this, (AttributePanel.__proto__ || Object.getPrototypeOf(AttributePanel)).call(this, props));

        var initState = {
            target: _this.props.project,
            version: _this.props.project.attrVersion
        };
        _this.state = initState;
        _this.props.project.designer.attributePanel = _this;

        autoBind(_this, { exclude: ['renderAttribute'] });
        return _this;
    }

    _createClass(AttributePanel, [{
        key: "renderAttribute",
        value: function renderAttribute(target) {
            if (target.attrbuteGroups == null) {
                return React.createElement(
                    "div",
                    null,
                    "\u6B64\u5BF9\u8C61\u6CA1\u6709\u5C5E\u6027"
                );
            }
            return target.attrbuteGroups.map(function (attrGroup, attrGroupIndex) {
                return React.createElement(
                    React.Fragment,
                    { key: attrGroup.label },
                    React.createElement(
                        "button",
                        { type: "button", "data-toggle": "collapse", "data-target": "#attrGroup" + attrGroup.label, className: "btn flex-grow-0 flex-shrink-0 bg-secondary text-light", style: { borderRadius: '0em', height: '2.5em' } },
                        attrGroup.label
                    ),
                    React.createElement(
                        "div",
                        { id: "attrGroup" + attrGroup.label, className: "list-group flex-grow-0 flex-shrink-0 collapse" + (attrGroupIndex == 0 ? ' show' : ''), style: { overflow: 'auto' } },
                        attrGroup.attrs_arr.map(function (attr) {
                            return React.createElement(AttributeEditor, { key: attr.name, targetattr: attr });
                        })
                    )
                );
            });
        }
    }, {
        key: "render",
        value: function render() {
            var target = this.state.target;
            return React.createElement(
                "div",
                { className: "flex-grow-0 flex-shrink-0 bg-light d-flex flex-column", style: { width: '350px' } },
                React.createElement(
                    "button",
                    { type: "button", className: "btn flex-grow-0 flex-shrink-0 bg-secondary text-light", style: { borderRadius: '0em', height: '2.5em', overflow: 'hidden' } },
                    "\u5C5E\u6027:",
                    target.description
                ),
                React.createElement(
                    "div",
                    { className: "flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column", style: { overflow: 'auto' } },
                    this.renderAttribute(target)
                )
            );
        }
    }]);

    return AttributePanel;
}(React.PureComponent);