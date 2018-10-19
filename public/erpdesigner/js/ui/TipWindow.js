'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var gTipWindow = null;
var TipBtnOK = makeAlertBtnData('确定', 'ok', { r: 144, g: 238, b: 144 }, { r: 0, g: 0, b: 0 });
var TipBtnNo = makeAlertBtnData('取消', 'no', { r: 232, g: 144, b: 144 }, { r: 0, g: 0, b: 0 });
function makeAlertBtnData(label, key, bgColor, textColor) {
    if (bgColor == null) {
        bgColor = { r: 200, g: 200, b: 200 };
    }
    if (textColor == null) {
        textColor = { r: 0, g: 0, b: 0 };
    }
    return {
        label: label,
        key: key,
        bgColor: bgColor,
        textColor: textColor
    };
}
function makeAlertData(title, content, callBack, btns_arr) {
    if (btns_arr == null || btns_arr.length == 0) {
        btns_arr = [makeAlertBtnData('确定', 'ok')];
    }
    return {
        title: title,
        content: content,
        btns_arr: btns_arr,
        callBack: callBack
    };
}

var TipPanel = function (_React$PureComponent) {
    _inherits(TipPanel, _React$PureComponent);

    function TipPanel(props) {
        _classCallCheck(this, TipPanel);

        var _this = _possibleConstructorReturn(this, (TipPanel.__proto__ || Object.getPrototypeOf(TipPanel)).call(this, props));

        autoBind(_this);
        return _this;
    }

    _createClass(TipPanel, [{
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'rootDivRef',
        value: function rootDivRef(divItem) {
            if (divItem == null) {
                return;
            }
            var $window = $(window);
            var $div = $(divItem);
            divItem.style.left = Math.round(($window.width() - $div.width()) * 0.5) + 'px';
            divItem.style.top = Math.round(($window.height() - $div.height()) * 0.5) + 'px';
        }
    }, {
        key: 'clickBtnHandler',
        value: function clickBtnHandler(ev) {
            var key = getAttributeByNode(ev.target, 'btnkey');
            this.props.clickBtnHandler(key, this.props.data);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var tipData = this.props.data;
            var index = this.props.index;
            return React.createElement(
                'div',
                { className: 'tippanelroot cursor-arrow', style: { zIndex: index * 10 } },
                React.createElement(
                    'div',
                    { ref: this.rootDivRef, className: 'd-flex flex-column border rounded bg-light', style: { maxWidth: '90%', maxHeight: '90%', position: 'absolute', minWidth: '20%', minHeight: '20%' } },
                    React.createElement(
                        'div',
                        { className: 'd-flex justify-content-center flex-grow-0 flex-shrink-0' },
                        React.createElement(
                            'h3',
                            null,
                            tipData.title
                        )
                    ),
                    React.createElement('div', { className: 'dropdown-divider' }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 p-1 autoScroll' },
                        tipData.content
                    ),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-0 flex-shrink-0' },
                        tipData.btns_arr.map(function (btndata) {
                            var btnStyle = {
                                color: 'rgb(' + btndata.textColor.r + ',' + btndata.textColor.g + ',' + btndata.textColor.b + ')',
                                backgroundColor: 'rgb(' + btndata.bgColor.r + ',' + btndata.bgColor.g + ',' + btndata.bgColor.b + ')'
                            };
                            return React.createElement(
                                'button',
                                { key: btndata.key, onClick: _this2.clickBtnHandler, className: 'btn flex-grow-1 flex-shrink-1', btnkey: btndata.key, type: 'button', style: btnStyle },
                                btndata.label
                            );
                        })
                    )
                )
            );
        }
    }]);

    return TipPanel;
}(React.PureComponent);

var TipWindow = function (_React$PureComponent2) {
    _inherits(TipWindow, _React$PureComponent2);

    function TipWindow(props) {
        _classCallCheck(this, TipWindow);

        var _this3 = _possibleConstructorReturn(this, (TipWindow.__proto__ || Object.getPrototypeOf(TipWindow)).call(this, props));

        _this3.state = {
            tips_arr: []
        };
        gTipWindow = _this3;
        autoBind(_this3);
        return _this3;
    }

    _createClass(TipWindow, [{
        key: 'popAlert',
        value: function popAlert(tipData) {
            var newTipArr = this.state.tips_arr.concat(tipData);
            this.setState({
                tips_arr: newTipArr
            });
        }
    }, {
        key: 'clickBtnHandler',
        value: function clickBtnHandler(btnKey, tipData) {
            var index = this.state.tips_arr.indexOf(tipData);
            var newTipArr = this.state.tips_arr.concat();
            newTipArr.splice(index, 1);
            setTimeout(function () {
                if (tipData.callBack != null) {
                    tipData.callBack(btnKey);
                }
            }, 10);
            this.setState({
                tips_arr: newTipArr
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            return React.createElement(
                'div',
                { className: 'tipwindowroot' + (this.state.tips_arr.length == 0 ? 'd-none' : '') },
                this.state.tips_arr.map(function (data, index) {
                    return React.createElement(TipPanel, { key: index, data: data, index: index, clickBtnHandler: _this4.clickBtnHandler });
                })
            );
        }
    }]);

    return TipWindow;
}(React.PureComponent);