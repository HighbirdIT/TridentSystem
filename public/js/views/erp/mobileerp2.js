'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mianServerPath = '/erppage/server/main';
var nowuserid;
var nowusername;

var C_ModelTip = function (_React$PureComponent) {
    _inherits(C_ModelTip, _React$PureComponent);

    function C_ModelTip(props) {
        _classCallCheck(this, C_ModelTip);

        var _this = _possibleConstructorReturn(this, (C_ModelTip.__proto__ || Object.getPrototypeOf(C_ModelTip)).call(this, props));

        _this.state = {
            info: '1234',
            show: false
        };

        autoBind(_this);
        return _this;
    }

    _createClass(C_ModelTip, [{
        key: 'showInfo',
        value: function showInfo(str, btnLabel, btnCallBack) {
            var hadBtn = btnCallBack != null || btnLabel != null;
            this.setState({
                show: true,
                info: str,
                hadBtn: hadBtn,
                btnLabel: !hadBtn ? null : btnLabel == null ? 'OK' : btnLabel,
                btnCallBack: btnCallBack
            });
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({
                show: false
            });
        }
    }, {
        key: 'clickBtnHandler',
        value: function clickBtnHandler(ev) {
            this.setState({
                show: false
            });
            var callBack = this.state.btnCallBack;
            if (callBack) {
                setTimeout(function () {
                    callBack();
                }, 20);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.show == false) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'fixedBackGround' },
                React.createElement(
                    'div',
                    { className: 'loadingTip bg-light rounded flex-column d-flex' },
                    this.state.info,
                    this.state.hadBtn && React.createElement(
                        'button',
                        { className: 'flex-grow-0 flex-shrink-0 btn btn-primary', onClick: this.clickBtnHandler },
                        this.state.btnLabel
                    )
                )
            );
        }
    }]);

    return C_ModelTip;
}(React.PureComponent);

function freshPage() {
    location.reload();
}

function userLogSuccess(userid, username) {
    clearModelTip();
    mainAppRef.current.userLogin(userid, username);
}

var mainAppRef = React.createRef();
var modelTipRef = React.createRef();

function showModelTip(info, btnLabel, btnCallBack) {
    if (modelTipRef.current) {
        modelTipRef.current.showInfo(info, btnLabel, btnCallBack);
    }
}

function clearModelTip() {
    if (modelTipRef.current) {
        modelTipRef.current.close();
    }
}

var C_ProjectList = function (_React$PureComponent2) {
    _inherits(C_ProjectList, _React$PureComponent2);

    function C_ProjectList(props) {
        _classCallCheck(this, C_ProjectList);

        var _this2 = _possibleConstructorReturn(this, (C_ProjectList.__proto__ || Object.getPrototypeOf(C_ProjectList)).call(this, props));

        _this2.state = {
            items_arr: []
        };

        autoBind(_this2);
        return _this2;
    }

    _createClass(C_ProjectList, [{
        key: 'fresh',
        value: function fresh() {
            var _this3 = this;

            this.setState({
                loading: true,
                fetchErrInfo: null,
                items_arr: []
            });
            nativeFetchJson(false, mianServerPath, { action: 'getMenu' }).then(function (ret) {
                console.log(ret);
                var newState = {
                    loading: false,
                    items_arr: ret.data
                };
                if (ret.err) {
                    newState.fetchErrInfo = '加载数据失败:' + ret.err.info;
                }
                _this3.setState(newState);
            });
        }
    }, {
        key: 'clickProjLinkHandler',
        value: function clickProjLinkHandler(ev) {
            var code = getAttributeByNode(ev.target, 'd-code');
            if (code == null) {
                return;
            }
            var projItem = this.state.items_arr.find(function (x) {
                return x.系统方案名称代码 == code;
            });
            if (projItem == null) {
                return;
            }
            var targetPath = '/erppage/';
            if (projItem.移动端名称.length > 0) {
                targetPath += 'mb/' + projItem.方案英文名称;
            } else {
                targetPath += 'pc/' + projItem.方案英文名称;
            }
            location.href = targetPath;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            if (this.state.loading) {
                return React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement(
                        'h3',
                        { className: 'd-flex align-items-center' },
                        React.createElement('i', { className: 'fa fa-refresh fa-spin' }),
                        '\u83DC\u5355\u52A0\u8F7D\u4E2D'
                    )
                );
            }
            if (this.state.fetchErrInfo) {
                return React.createElement(
                    'div',
                    { className: 'text-danger' },
                    this.state.fetchErrInfo
                );
            }

            var items_arr = this.state.items_arr;
            if (items_arr == null) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'list-group flex-grow-1 flex-shrink-1 autoScroll_Touch' },
                items_arr.map(function (item) {
                    var label = item.系统方案名称;
                    var canClick = true;
                    var appendElem = null;
                    if (item.完成确认状态 == '0') {
                        if (item.桌面端名称.length > 0 || item.移动端名称.length > 0) {
                            appendElem = React.createElement(
                                'span',
                                { className: 'badge badge-info' },
                                '\u5F00\u53D1\u4E2D21'
                            );
                        } else {
                            useable = false;
                            appendElem = React.createElement(
                                'span',
                                { className: 'badge badge-secondary' },
                                '\u4E0D\u53EF\u7528'
                            );
                        }
                    }
                    return React.createElement(
                        'div',
                        { key: item.系统方案名称代码, onClick: canClick ? _this4.clickProjLinkHandler : null, 'd-code': item.系统方案名称代码, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' },
                        appendElem,
                        label
                    );
                })
            );
        }
    }]);

    return C_ProjectList;
}(React.PureComponent);

var MainApp = function (_React$PureComponent3) {
    _inherits(MainApp, _React$PureComponent3);

    function MainApp(props) {
        _classCallCheck(this, MainApp);

        var _this5 = _possibleConstructorReturn(this, (MainApp.__proto__ || Object.getPrototypeOf(MainApp)).call(this, props));

        _this5.state = {
            infos: []
        };
        _this5.projectListRef = React.createRef();

        autoBind(_this5);
        return _this5;
    }

    _createClass(MainApp, [{
        key: 'userLogin',
        value: function userLogin(userid, username) {
            var newState = {
                userid: userid,
                username: username
            };
            this.setState(newState);
            this.projectListRef.current.fresh();
        }
    }, {
        key: 'renderContent',
        value: function renderContent() {
            return React.createElement(
                'div',
                { className: 'flex-grow-1 flex-shrink-1 d-flex' },
                React.createElement(C_ProjectList, { ref: this.projectListRef })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var infos = this.state.infos;
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
                React.createElement(C_ModelTip, { ref: modelTipRef }),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader' },
                    '\u6D77\u52C3ERP',
                    React.createElement('div', { className: 'flex-grow-1 flex-shrink-1' }),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-shrink-0 align-items-center' },
                        React.createElement('i', { className: 'fa fa-user-o' }),
                        this.state.username
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                    this.renderContent()
                )
            );
        }
    }]);

    return MainApp;
}(React.PureComponent);

ReactDOM.render(React.createElement(MainApp, { ref: mainAppRef }), document.getElementById('reactRoot'));