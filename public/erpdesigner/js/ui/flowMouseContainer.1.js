'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FlowMouseContainer = function (_React$PureComponent) {
    _inherits(FlowMouseContainer, _React$PureComponent);

    function FlowMouseContainer(props) {
        _classCallCheck(this, FlowMouseContainer);

        var _this = _possibleConstructorReturn(this, (FlowMouseContainer.__proto__ || Object.getPrototypeOf(FlowMouseContainer)).call(this, props));

        autoBind(_this);

        var initState = {
            x: 0,
            y: 0,
            getContentFun: null
        };
        _this.state = initState;
        return _this;
    }

    _createClass(FlowMouseContainer, [{
        key: 'onMouseMoveHandler',
        value: function onMouseMoveHandler(ev) {
            var newX = Math.round(ev.x);
            var newY = Math.round(ev.y);
            if (newX == this.state.x && newY == this.state.y) {
                return;
            }
            this.setState({
                x: newX + 20,
                y: newY + 20
            });
            if (this.props.positionChanged) {
                this.props.positionChanged({ x: newX, y: newY });
            }
        }
    }, {
        key: 'setGetContentFun',
        value: function setGetContentFun(theFun) {
            if (theFun) {
                if (this.state.getContentFun == null) {
                    window.addEventListener('mousemove', this.onMouseMoveHandler);
                }
            } else {
                if (this.state.getContentFun != null) {
                    window.removeEventListener('mousemove', this.onMouseMoveHandler);
                }
            }
            this.setState({
                getContentFun: theFun,
                x: WindowMouse.x + 10,
                y: WindowMouse.y + 10
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            //window.addEventListener('mousemove', this.onMouseMoveHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            //window.removeEventListener('mousemove', this.onMouseMoveHandler);
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.state.getContentFun) return null;
            return React.createElement(
                'div',
                { className: 'position-fixed bg-light border-1 shadow flowMouseContainer', style: { left: this.state.x + 'px', top: this.state.y + 'px' } },
                this.state.getContentFun()
            );
        }
    }]);

    return FlowMouseContainer;
}(React.PureComponent);