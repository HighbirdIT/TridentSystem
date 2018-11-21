'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QuickMenuItem = function QuickMenuItem(label, key, config) {
    _classCallCheck(this, QuickMenuItem);

    this.label = label;
    this.key = key;
    this.config = config == null ? {} : config;
};

var QuickMenuItem_Visible = function (_React$PureComponent) {
    _inherits(QuickMenuItem_Visible, _React$PureComponent);

    function QuickMenuItem_Visible(props) {
        _classCallCheck(this, QuickMenuItem_Visible);

        var _this = _possibleConstructorReturn(this, (QuickMenuItem_Visible.__proto__ || Object.getPrototypeOf(QuickMenuItem_Visible)).call(this, props));

        autoBind(_this);
        return _this;
    }

    _createClass(QuickMenuItem_Visible, [{
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.clickMenuHandler(this.props.item);
        }
    }, {
        key: 'render',
        value: function render() {
            var menuItem = this.props.item;
            return React.createElement(
                'button',
                { type: 'button', className: 'btn ' + menuItem.config.btnClass, onClick: this.clickHandler },
                menuItem.label
            );
        }
    }]);

    return QuickMenuItem_Visible;
}(React.PureComponent);

var QuickMenuContainer = function (_React$PureComponent2) {
    _inherits(QuickMenuContainer, _React$PureComponent2);

    function QuickMenuContainer(props) {
        _classCallCheck(this, QuickMenuContainer);

        var _this2 = _possibleConstructorReturn(this, (QuickMenuContainer.__proto__ || Object.getPrototypeOf(QuickMenuContainer)).call(this, props));

        autoBind(_this2);

        _this2.rootRef = React.createRef();

        var initState = {};
        _this2.state = initState;
        return _this2;
    }

    _createClass(QuickMenuContainer, [{
        key: 'popMenu',
        value: function popMenu(items_arr, pos, callback) {
            if (items_arr) {
                if (this.state.items_arr == null) {
                    window.addEventListener('mouseup', this.onMouseUpHandler);
                }
                this.setState({
                    items_arr: items_arr,
                    x: pos.x,
                    y: pos.y
                });
            } else {
                if (this.state.items_arr != null) {
                    window.removeEventListener('mouseup', this.onMouseUpHandler);
                }
                this.setState({
                    items_arr: null
                });
            }
            this.callback = callback;
            this.pos = pos;
        }
    }, {
        key: 'onMouseUpHandler',
        value: function onMouseUpHandler(ev) {
            if (!isNodeHasParent(ev.target, this.rootRef.current)) {
                this.popMenu(null);
            }
        }
    }, {
        key: 'clickMenuHandler',
        value: function clickMenuHandler(menuItem) {
            this.callback(menuItem, this.pos);
            this.popMenu(null);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (!this.state.items_arr) return null;
            return React.createElement(
                'div',
                { ref: this.rootRef, className: 'position-fixed shadow quickMenuContainer d-flex flex-column', style: { left: this.state.x + 'px', top: this.state.y + 'px' } },
                this.state.items_arr.map(function (item) {
                    return React.createElement(QuickMenuItem_Visible, { key: item.key, item: item, clickMenuHandler: _this3.clickMenuHandler });
                })
            );
        }
    }]);

    return QuickMenuContainer;
}(React.PureComponent);