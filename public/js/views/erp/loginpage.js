'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mianServerPath = '/erppage/server/main';

var MainApp = function (_React$PureComponent) {
    _inherits(MainApp, _React$PureComponent);

    function MainApp(props) {
        _classCallCheck(this, MainApp);

        var _this = _possibleConstructorReturn(this, (MainApp.__proto__ || Object.getPrototypeOf(MainApp)).call(this, props));

        _this.state = {
            account: '',
            password: '',
            info: '',
            loging: false
        };
        _this.pwdInputRef = React.createRef();

        autoBind(_this);
        return _this;
    }

    _createClass(MainApp, [{
        key: 'userLogin',
        value: function userLogin(userid, username) {
            if (userid > 0) {
                var query = getQueryObject();
                if (query.goto) {
                    var gotourl = query.goto;
                    var search = '';
                    for (var si in query) {
                        if (si != 'goto' && query[si]) {
                            search += (search.length == 0 ? '?' : '&') + si + '=' + query[si];
                        }
                    }
                    location.href = gotourl + search;
                    return;
                }
            }
            var newState = {
                userid: userid,
                username: username
            };
            this.setState(newState);
            this.projectListRef.current.fresh();
        }
    }, {
        key: 'accountChanged',
        value: function accountChanged(ev) {
            this.setState({
                account: ev.target.value
            });
        }
    }, {
        key: 'passwordChanged',
        value: function passwordChanged(ev) {
            this.setState({
                password: ev.target.value
            });
        }
    }, {
        key: 'loginFetchend',
        value: function loginFetchend(respon) {
            if (respon.err) {
                this.setState({
                    loging: false,
                    info: respon.err.info
                });
            } else if (respon.data) {
                if (respon.data.err) {
                    this.setState({
                        loging: false,
                        info: respon.err.info
                    });
                    return;
                }
                console.log(respon.data);
                this.setState({
                    loging: false,
                    info: '登录成功'
                });
            }
        }
    }, {
        key: 'getPreLogDataCallBack',
        value: function getPreLogDataCallBack(respon) {
            if (respon.data) {
                var rsa = forge.pki.rsa;
                var usePublickKey = forge.pki.publicKeyFromPem(respon.data.publicKey);
                var account = this.state.account;
                var password = this.pwdInputRef.current.value;
                var encryptPass = usePublickKey.encrypt(password);
                var encryptAccount = usePublickKey.encrypt(account);
                var self = this;
                nativeFetchJson(false, mianServerPath, { action: 'userlogin', account: encryptAccount, password: encryptPass }).then(function (ret) {
                    self.loginFetchend(ret);
                });
            } else {
                this.setState({
                    loging: false,
                    info: respon.err.info
                });
            }
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler() {
            var account = this.state.account;
            var password = this.pwdInputRef.current.value;
            if (password.length == 0 || account.length == 0 || this.state.loging) {
                return;
            }
            this.setState({
                loging: true
            });
            var self = this;
            nativeFetchJson(false, mianServerPath, { action: 'readyLogin' }).then(function (ret) {
                self.getPreLogDataCallBack(ret);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 h-100' },
                React.createElement(
                    'div',
                    { className: 'd-flex align-items-center' },
                    React.createElement(
                        'span',
                        null,
                        '\u8D26\u53F7'
                    ),
                    React.createElement('input', { onChange: this.accountChanged, type: 'text', className: 'flex-grow-1 flex-shrink-1', style: { minWidth: '10px' }, value: this.state.account })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex align-items-center' },
                    React.createElement(
                        'span',
                        null,
                        '\u5BC6\u7801'
                    ),
                    React.createElement('input', { ref: this.pwdInputRef, type: 'password', className: 'flex-grow-1 flex-shrink-1', style: { minWidth: '10px' } })
                ),
                React.createElement(
                    'button',
                    { onClick: this.clickHandler, type: 'button', className: 'btn btn-primary', disabled: this.state.loging ? 'disabled' : null },
                    '\u767B\u5F55'
                ),
                React.createElement(
                    'div',
                    null,
                    this.state.info
                )
            );
        }
    }]);

    return MainApp;
}(React.PureComponent);

ReactDOM.render(React.createElement(MainApp, null), document.getElementById('reactRoot'));