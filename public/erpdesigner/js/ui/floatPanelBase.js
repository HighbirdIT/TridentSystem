'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FloatPanelbase = function (_React$PureComponent) {
    _inherits(FloatPanelbase, _React$PureComponent);

    function FloatPanelbase(props) {
        _classCallCheck(this, FloatPanelbase);

        var _this = _possibleConstructorReturn(this, (FloatPanelbase.__proto__ || Object.getPrototypeOf(FloatPanelbase)).call(this, props));

        _this.state = {
            show: false,
            maximum: _this.props.initMax == true,
            sizeable: _this.props.sizeable != false,
            closeable: _this.props.closeable != false,
            ismodel: _this.props.ismodel == true
        };
        _this.rootDivRef = React.createRef();
        _this.rootSize = {
            x: 0,
            y: 0,
            width: _this.props.width > 0 ? _this.props.width : null,
            height: _this.props.height > 0 ? _this.props.height : null,
            first: true
        };
        autoBind(_this);
        var self = _this;
        if (_this.props.initShow) {
            setTimeout(function () {
                self.show();
            }, 50);
        }
        return _this;
    }

    _createClass(FloatPanelbase, [{
        key: 'mousemoveWidthMoveHandler',
        value: function mousemoveWidthMoveHandler(ev) {
            var newX = this.moveBase.x + ev.x;
            var newY = this.moveBase.y + ev.y;
            if (newX < 0) {
                newX = 0;
            } else {
                //var rootWidth = $(this.rootDivRef.current).width();
                //var newRight = newX + rootWidth;
                var newLeft = newX - this.moveBase.x;
                var windWidth = $(window).width();
                if (newLeft > windWidth - 100) {
                    newX = windWidth - 100;
                }
            }
            if (newY < 0) {
                newY = 0;
            } else {
                //var rootHeight = $(this.rootDivRef.current).height();
                //var newBottom = newY + rootHeight;
                var newTop = newY - this.moveBase.y;
                var windheight = $(window).height();
                if (newTop > windheight - 100) {
                    newY = windheight - 100;
                }
            }
            this.rootDivRef.current.style.left = newX + 'px';
            this.rootDivRef.current.style.top = newY + 'px';

            this.rootSize.x = newX;
            this.rootSize.y = newY;
        }
    }, {
        key: 'mouseupWidthMoveHandler',
        value: function mouseupWidthMoveHandler(ev) {
            window.removeEventListener('mousemove', this.mousemoveWidthMoveHandler);
            window.removeEventListener('mouseup', this.mouseupWidthMoveHandler);
        }
    }, {
        key: 'moveBarMouseDownHandler',
        value: function moveBarMouseDownHandler(ev) {
            if (this.state.maximum) return;
            var rootPosition = $(this.rootDivRef.current).position();
            this.moveBase = { x: rootPosition.left - WindowMouse.x, y: rootPosition.top - WindowMouse.y };
            window.addEventListener('mousemove', this.mousemoveWidthMoveHandler);
            window.addEventListener('mouseup', this.mouseupWidthMoveHandler);
        }
    }, {
        key: 'sizeBtnMouseDownHandler',
        value: function sizeBtnMouseDownHandler(ev) {
            var $rootDivRef = $(this.rootDivRef.current);
            this.sizeBase = { x: WindowMouse.x, y: WindowMouse.y, width: $rootDivRef.width(), height: $rootDivRef.height(), pos: $rootDivRef.position() };
            window.addEventListener('mousemove', this.mousemoveWidthSizeHandler);
            window.addEventListener('mouseup', this.mouseupWidthSizeHandler);
        }
    }, {
        key: 'mouseupWidthSizeHandler',
        value: function mouseupWidthSizeHandler(ev) {
            window.removeEventListener('mousemove', this.mousemoveWidthSizeHandler);
            window.removeEventListener('mouseup', this.mouseupWidthSizeHandler);
        }
    }, {
        key: 'mousemoveWidthSizeHandler',
        value: function mousemoveWidthSizeHandler(ev) {
            var newWidth = this.sizeBase.width + (ev.x - this.sizeBase.x);
            var newHeight = this.sizeBase.height + (ev.y - this.sizeBase.y);

            var $window = $(window);

            if (newWidth < 200) {
                newWidth = 200;
            } else {
                var newRight = this.sizeBase.pos.left + newWidth;
                if (newRight > $window.width()) {
                    newWidth = $window.width() - this.sizeBase.pos.left;
                }
            }
            if (newHeight < 200) {
                newHeight = 200;
            } else {
                var newBottom = this.sizeBase.pos.top + newHeight;
                if (newBottom > $window.height()) {
                    newHeight = $window.height() - this.sizeBase.pos.top;
                }
            }

            this.rootDivRef.current.style.width = newWidth + 'px';
            this.rootDivRef.current.style.height = newHeight + 'px';

            this.rootSize.width = newWidth;
            this.rootSize.height = newHeight;
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.props.preClose && this.props.preClose(this) == false) {
                return;
            }

            this.setState({ show: false });
        }
    }, {
        key: 'show',
        value: function show() {
            if (this.props.preShow && this.props.preShow() == false) {
                return;
            }
            this.setState({ show: true });
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (this.state.show) {
                this.close();
            } else {
                this.show();
            }
        }
    }, {
        key: 'toggleMaximum',
        value: function toggleMaximum() {
            this.setState({ maximum: !this.state.maximum });
        }
    }, {
        key: 'setMaximum',
        value: function setMaximum(val) {
            this.setState({ maximum: val });
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.state.show) {
                return null;
            }

            if (this.state.ismodel) {
                return React.createElement(
                    'div',
                    { className: 'modelPanelBG' },
                    this.renderPanel()
                );
            } else {
                return this.renderPanel();
            }
        }
    }, {
        key: 'renderPanel',
        value: function renderPanel() {
            var windWidth = $(window).width();
            var windHeight = $(window).height();
            var rootStyle;
            if (this.state.maximum) {
                rootStyle = {
                    left: '0px',
                    top: '0px',
                    width: windWidth + 'px',
                    height: windHeight + 'px'
                };
            } else {
                if (this.rootSize.first) {
                    if (isNaN(this.rootSize.width) || this.rootSize.width == null) this.rootSize.width = Math.round(windWidth * 0.5);
                    if (isNaN(this.rootSize.height) || this.rootSize.height == null) this.rootSize.height = Math.round(windHeight * 0.5);
                    this.rootSize.x = Math.round((windWidth - this.rootSize.width) * 0.5);
                    this.rootSize.y = Math.round((windHeight - this.rootSize.height) * 0.5);
                    this.rootSize.first = false;
                } else {
                    if (this.rootSize.x > windWidth) {
                        this.rootSize.x = windWidth - 100;
                    }
                    if (this.rootSize.y > windHeight) {
                        this.rootSize.y = windHeight - 100;
                    }
                }
                rootStyle = {
                    left: this.rootSize.x + 'px',
                    top: this.rootSize.y + 'px',
                    width: this.rootSize.width + 'px',
                    height: this.rootSize.height + 'px'
                };
            }

            return React.createElement(
                'div',
                { className: 'floatPanel', ref: this.rootDivRef, style: rootStyle },
                React.createElement(
                    'div',
                    { className: 'd-flex w-100 h-100 flex-column bg-secondary' },
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0 paneltitle align-items-baseline' },
                        React.createElement('span', { className: 'icon icon-bars' }),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 panelMoveBar', onMouseDown: this.moveBarMouseDownHandler },
                            this.props.title
                        ),
                        this.state.sizeable && React.createElement('i', { className: "fa fa-" + (this.state.maximum ? 'window-restore' : 'window-maximize'), style: { cursor: 'pointer' }, onClick: this.toggleMaximum }),
                        this.state.closeable && React.createElement('i', { className: 'fa fa-window-close ml-1', style: { cursor: 'pointer' }, onClick: this.close })
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column h-100' },
                        this.props.children
                    ),
                    this.state.sizeable && !this.state.maximum && React.createElement('button', { type: 'button', className: 'panelSizeBtn', onMouseDown: this.sizeBtnMouseDownHandler })
                )
            );
        }
    }]);

    return FloatPanelbase;
}(React.PureComponent);