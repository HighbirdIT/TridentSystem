'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SplitPanel = function (_React$PureComponent) {
    _inherits(SplitPanel, _React$PureComponent);

    function SplitPanel(props) {
        _classCallCheck(this, SplitPanel);

        var _this = _possibleConstructorReturn(this, (SplitPanel.__proto__ || Object.getPrototypeOf(SplitPanel)).call(this, props));

        autoBind(_this);
        if (_this.props.fixedOne != null && _this.props.maxSize == null) {
            console.warn('SplitPanel set fixedOne must set maxSize');
        }

        var initState = {
            percent: _this.formatPercent(_this.props.defPercent)
        };
        _this.state = initState;
        _this.rootDivRef = React.createRef();
        _this.splitbarRef = React.createRef();
        _this.panelOneRef = React.createRef();
        _this.panelTwoRef = React.createRef();

        _this.firstRealSizeCaled = false;
        return _this;
    }

    _createClass(SplitPanel, [{
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
        key: 'mouseDownSplitHandler',
        value: function mouseDownSplitHandler(ev) {
            window.addEventListener('mousemove', this.onMouseMoveHandler);
            window.addEventListener('mouseup', this.onMouseUpHandler);
        }
    }, {
        key: 'onMouseMoveHandler',
        value: function onMouseMoveHandler(ev) {
            var newX = Math.round(ev.x);
            var newY = Math.round(ev.y);
            var isHor = this.props.flexColumn != true;
            var rootBoundRect = this.rootDivRef.current.getBoundingClientRect();
            var percent = 0;
            if (isHor) {
                percent = (newX - rootBoundRect.left) / rootBoundRect.width;
            } else {
                percent = (newY - rootBoundRect.top) / rootBoundRect.height;
            }
            //console.log(percent);
            this.setState({
                percent: this.formatPercent(percent)
            });
        }
    }, {
        key: 'formatPercent',
        value: function formatPercent(val) {
            if (val == null || isNaN(val) || val < 0) {
                return 0;
            }
            if (val > 1) {
                return 1;
            }
            return Math.round(val * 100) / 100;
        }
    }, {
        key: 'onMouseUpHandler',
        value: function onMouseUpHandler(ev) {
            window.removeEventListener('mousemove', this.onMouseMoveHandler);
            window.removeEventListener('mouseup', this.onMouseUpHandler);
        }
    }, {
        key: 'render',
        value: function render() {
            var $rootDiv = $(this.rootDivRef.current);
            var $splitbar = $(this.splitbarRef.current);
            var rootWidth = $rootDiv.width();
            var rootHeight = $rootDiv.height();
            var fixedOne = this.props.fixedOne == null || this.props.fixedOne != false;
            var isHor = this.props.flexColumn != true;
            var rootSize = isHor ? rootWidth - $splitbar.width() : rootHeight - $splitbar.height();
            var usePercent = this.state.percent;
            var hideOne = usePercent < 0.1;
            var hideTwo = usePercent > 0.9;

            var maxSize = this.props.maxSize;
            if (maxSize != null) {
                maxSize = parseInt(maxSize);
                if (isNaN(maxSize)) {
                    maxSize = null;
                    console.warn('错误的maxsize:' + this.props.maxSize);
                }
            }

            var panelOneStyle = {};
            var panelTwoStyle = {};

            var panelOneSize = 0;
            var panelTwoSize = 0;
            if (rootSize > 0) {
                if (!this.firstRealSizeCaled) {
                    var $panelOne = $(this.panelOneRef.current);
                    //var $panelTwo = $(this.panelTwoRef.current);
                    //usePercent = (fixedOne ? (isHor ? $panelOne.width() : $panelOne.height()) : (isHor ? $panelTwo.width() : $panelTwo.height())) / rootSize;
                    usePercent = (isHor ? $panelOne.width() : $panelOne.height()) / rootSize;
                    this.firstRealSizeCaled = true;
                }
                if (fixedOne) {
                    panelOneSize = Math.round(maxSize ? Math.min(maxSize, rootSize * usePercent) : rootSize * usePercent);
                    panelTwoSize = rootSize - panelOneSize;
                } else {
                    usePercent = 1 - usePercent;
                    panelTwoSize = Math.round(maxSize ? Math.min(maxSize, rootSize * usePercent) : rootSize * usePercent);
                    panelOneSize = rootSize - panelTwoSize;
                }
                panelOneStyle = isHor ? { width: panelOneSize + 'px' } : { height: panelOneSize + 'px' };
                panelTwoStyle = isHor ? { width: panelTwoSize + 'px' } : { height: panelTwoSize + 'px' };
            } else {
                usePercent *= 100;
                if (maxSize > 0) {
                    if (fixedOne) {
                        panelOneStyle = isHor ? { width: maxSize + 'px' } : { height: maxSize + 'px' };
                        panelTwoStyle = isHor ? { width: 'calc(100% - 0.75em - ' + maxSize + 'px)' } : { height: 'calc(100% - 0.75em - ' + maxSize + 'px)' };
                    } else {
                        panelTwoStyle = isHor ? { width: usePercent + '%', maxWidth: maxSize } : { height: usePercent + '%', maxHeight: maxSize };
                        panelOneStyle = isHor ? { width: 'calc(100% - 0.75em - ' + maxSize + 'px)' } : { height: 'calc(100% - 0.75em - ' + maxSize + 'px)' };
                    }
                } else {
                    if (fixedOne) {
                        panelOneStyle = isHor ? { width: usePercent + '%', maxWidth: maxSize } : { height: usePercent + '%', maxHeight: maxSize };
                        panelTwoStyle = isHor ? { width: 'calc(' + (100 - usePercent) + '% - 0.75em)' } : { height: 'calc(' + (100 - usePercent) + '% - 0.75em)' };
                    } else {
                        usePercent = 100 - usePercent;
                        panelTwoStyle = isHor ? { width: usePercent + '%', maxWidth: maxSize } : { height: usePercent + '%', maxHeight: maxSize };
                        panelOneStyle = isHor ? { width: 'calc(' + (100 - usePercent) + '% - 0.75em)' } : { height: 'calc(' + (100 - usePercent) + '% - 0.75em)' };
                    }
                }
            }

            return React.createElement(
                'div',
                { className: "flex-grow-1 flex-shrink-1 d-flex " + (!isHor ? ' flex-column mw-100 mh-100' : ' mw-100 mh-100'), ref: this.rootDivRef },
                React.createElement(
                    'div',
                    { ref: this.panelOneRef, className: '' + (hideOne ? ' d-none' : ' d-flex') + (fixedOne && !hideTwo ? ' flex-grow-0 flex-shrink-0' : ' flex-grow-1 flex-shrink-1'), style: panelOneStyle },
                    this.props.panel1
                ),
                React.createElement(
                    'div',
                    { ref: this.splitbarRef, onMouseDown: this.mouseDownSplitHandler, className: 'text-justify d-flex flex-grow-0 flex-shrink-0 ' + (isHor ? ' splitbar_H align-items-center' : ' splitbar_V justify-content-center') + (this.props.barClass ? ' ' + this.props.barClass : '') },
                    React.createElement('span', { className: 'icon-sm text-light ' + (isHor ? 'icon-more-vertical' : 'icon-more') })
                ),
                React.createElement(
                    'div',
                    { ref: this.panelTwoRef, className: '' + (hideTwo ? ' d-none' : ' d-flex') + (fixedOne || hideOne ? ' flex-grow-1 flex-shrink-1' : ' flex-grow-0 flex-shrink-0'), style: panelTwoStyle },
                    this.props.panel2
                )
            );
        }
    }]);

    return SplitPanel;
}(React.PureComponent);