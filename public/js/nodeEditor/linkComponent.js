'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_Node_Link = function (_React$PureComponent) {
    _inherits(C_Node_Link, _React$PureComponent);

    function C_Node_Link(props) {
        _classCallCheck(this, C_Node_Link);

        var _this = _possibleConstructorReturn(this, (C_Node_Link.__proto__ || Object.getPrototypeOf(C_Node_Link)).call(this, props));

        autoBind(_this);
        var initState = {};
        if (_this.props.link) {
            initState.start = _this.props.link.outSocket.currentComponent ? _this.props.link.outSocket.currentComponent.getCenterPos() : null;
            initState.end = _this.props.link.inSocket.currentComponent ? _this.props.link.inSocket.currentComponent.getCenterPos() : null;
            initState.link = _this.props.link;
        } else {
            initState.start = _this.props.start;
            initState.end = _this.props.end;
        }
        _this.state = initState;

        _this.rootDivRef = React.createRef();
        return _this;
    }

    _createClass(C_Node_Link, [{
        key: 'startNodeMovedHandler',
        value: function startNodeMovedHandler() {
            var newVal = this.state.link.outSocket.currentComponent ? this.state.link.outSocket.currentComponent.getCenterPos() : null;
            this.setState({
                start: newVal
            });
        }
    }, {
        key: 'endNodeMovedHandler',
        value: function endNodeMovedHandler() {
            var newVal = this.state.link.inSocket.currentComponent ? this.state.link.inSocket.currentComponent.getCenterPos() : null;
            this.setState({
                end: newVal
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            if (this.props.link) {
                this.props.link.outSocket.node.on('moved', this.startNodeMovedHandler);
                this.props.link.outSocket.node.on(Event_CurrentComponentchanged, this.startNodeMovedHandler);
                this.props.link.inSocket.node.on('moved', this.endNodeMovedHandler);
                this.props.link.inSocket.node.on(Event_CurrentComponentchanged, this.endNodeMovedHandler);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.link) {
                this.props.link.outSocket.node.off('moved', this.startNodeMovedHandler);
                this.props.link.outSocket.node.off(Event_CurrentComponentchanged, this.startNodeMovedHandler);
                this.props.link.inSocket.node.off('moved', this.endNodeMovedHandler);
                this.props.link.inSocket.node.off(Event_CurrentComponentchanged, this.endNodeMovedHandler);
            }
        }
    }, {
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            if (ev.altKey) {
                console.log('delete link');
                if (this.props.link) {
                    this.props.link.pool.removeLink(this.props.link);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var start = this.state.start;
            var end = this.state.end;
            if (start == null || end == null) return null;
            var dis = Math.round(MyMath.disBetweenPoint(start, end));
            //console.log('dis:' + dis);
            var angle = dis == 0 ? 0 : Math.asin((end.y - start.y) / dis) * (180 / Math.PI);
            if (end.x < start.x) {
                if (end.y > start.y) angle = 180 - angle;else angle = -180 - angle;
            }
            var linkflow = null;
            if (this.state.startScoket != null && this.state.startScoket.isFlowSocket) {
                linkflow = '1';
            } else if (this.state.link != null && this.state.link.inSocket.isFlowSocket) {
                linkflow = '1';
            }
            //console.log(angle);
            var thisStyle = { width: dis + 'px', height: '2px', transform: 'rotate(' + angle + 'deg)', left: start.x + 'px', top: start.y + 'px' };
            return React.createElement('div', { ref: this.rootDivRef, className: 'nodepath', style: thisStyle, linkflow: linkflow, draging: this.state.draging ? 1 : null, onMouseDown: this.mouseDownHandler });
        }
    }]);

    return C_Node_Link;
}(React.PureComponent);