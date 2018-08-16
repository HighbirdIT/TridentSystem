'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;

var LoadingModal = function (_React$Component) {
    _inherits(LoadingModal, _React$Component);

    function LoadingModal(props) {
        _classCallCheck(this, LoadingModal);

        var _this = _possibleConstructorReturn(this, (LoadingModal.__proto__ || Object.getPrototypeOf(LoadingModal)).call(this, props));

        _this.state = {
            isModalOpen: true
        };
        _this.openModal = _this.openModal.bind(_this);
        _this.closeModal = _this.closeModal.bind(_this);
        _this.getModalRole = _this.getModalRole.bind(_this);
        return _this;
    }

    _createClass(LoadingModal, [{
        key: 'openModal',
        value: function openModal() {
            this.setState({
                isModalOpen: true
            });
        }
    }, {
        key: 'closeModal',
        value: function closeModal() {
            this.setState({
                isModalOpen: false
            });
        }
    }, {
        key: 'onOpen',
        value: function onOpen() {
            console.log('modal open....');
        }
    }, {
        key: 'onClosed',
        value: function onClosed() {
            console.log('modal closed....');
        }
    }, {
        key: 'getModalRole',
        value: function getModalRole() {
            return this.props.modalProps.role;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                Modal,
                _extends({
                    ref: 'modal',
                    isOpen: this.state.isModalOpen,
                    onDismiss: this.closeModal,
                    onOpen: this.onOpen,
                    onClosed: this.onClosed,
                    onAction: this.handleAction
                }, this.props.modalProps),
                this.getModalRole() !== 'loading' && this.props.children
            );
        }
    }]);

    return LoadingModal;
}(React.Component);

var step1Fields = [{
    label: '姓名',
    type: 'text',
    placeholder: "必填项",
    name: 'name'
}, {
    label: '性别',
    type: 'select',
    options: [{ label: '男', value: 'm' }, { label: '女', value: 'f' }],
    name: 'sex'
}, {
    label: '出生日期',
    type: 'date',
    placeholder: "必填项",
    name: 'borndate'
}, {
    label: '籍贯',
    type: 'text',
    placeholder: "必填项",
    name: 'jiguan'
}, {
    label: '当前状态',
    type: 'select',
    options: [{ label: '在职', value: '在职' }, { label: '应届生', value: '应届生' }, { label: '待业', value: '待业' }],
    name: 'workState'
}, {
    label: '学历',
    type: 'select',
    options: [{ label: '大专', value: '大专' }, { label: '本科', value: '本科' }, { label: '硕士', value: '硕士' }, { label: '博士', value: '博士' }],
    name: 'xueli'
}, {
    label: '毕业院校',
    type: 'text',
    placeholder: "必填项",
    name: 'school'
}, {
    label: '专业名称',
    type: 'text',
    placeholder: "必填项",
    name: 'zhuanye'
}, {
    label: '英语等级',
    type: 'select',
    name: 'englishlevel',
    options: [{ label: '不能确定', value: '1' }, { label: '可阅读普通刊物', value: '2' }, { label: '可翻译普通刊物', value: '3' }, { label: '可阅读专业刊物', value: '4' }, { label: '可翻译专业刊物', value: '5' }]
}, {
    label: '手机号码',
    type: 'number',
    placeholder: "必填项",
    name: 'tel'
}, {
    label: '现居住地',
    type: 'text',
    placeholder: "必填项",
    name: 'address'
}, {
    label: '应聘岗位',
    type: 'select',
    placeholder: "必填项",
    options: [{ label: '工程师', value: '1' }],
    name: 'post'
}, {
    label: '期望薪资',
    type: 'number',
    placeholder: "必填项",
    name: 'money'
}, {
    label: '工作年限',
    type: 'number',
    placeholder: "必填项",
    name: 'workyear'
}, {
    label: '到岗日期',
    type: 'date',
    name: 'fastdate'
}, {
    label: '健康状态',
    type: 'select',
    name: 'bodystate',
    options: [{ label: '良好', value: '1' }, { label: '18周岁后住院超过3天或有可能传染的或影响工作及岗位安排', value: '2' }]
}];

var questions_arr = [{
    label: '在学习或工作期间，你认为自己最大的成就是什么，为什么？'
}];

function handleSwitch() {
    console.log(this.refs.field.checked);
}

var freshSwitch = React.createElement(Switch, { onValueChange: handleSwitch, value: false });
var workingSwitch = React.createElement(Switch, { onValueChange: handleSwitch, value: false });

var clickHandler = function clickHandler(item, e) {
    e.preventDefault();
    console.log(item);
};

var itemLeft = {
    href: '#',
    title: '上一步'
};

var itemRight = {
    href: '#',
    title: '下一步'
};
var step1Navbar = {
    title: '基本资料',
    rightNav: [{ title: '下一步', icon: 'right-nav' }]
};

var fullNavbar = {
    title: '基本资料',
    leftNav: [{ title: '上一步', icon: 'left-nav' }],
    rightNav: [{ title: '下一步', icon: 'right-nav' }],
    onAction: clickHandler
};

function getValueCookie(name) {
    if (name == null) {
        return '';
    }
    var rlt = Cookies.get(name);
    return rlt == null ? '' : rlt;
}

var MyModel = function (_React$Component2) {
    _inherits(MyModel, _React$Component2);

    function MyModel(props) {
        _classCallCheck(this, MyModel);

        var _this2 = _possibleConstructorReturn(this, (MyModel.__proto__ || Object.getPrototypeOf(MyModel)).call(this, props));

        _this2.state = {
            isModalOpen: false
        };
        _this2.openModal = _this2.openModal.bind(_this2);
        _this2.closeModal = _this2.closeModal.bind(_this2);
        _this2.handleAction = _this2.handleAction.bind(_this2);
        _this2.getModalRole = _this2.getModalRole.bind(_this2);
        return _this2;
    }

    _createClass(MyModel, [{
        key: 'openModal',
        value: function openModal() {
            this.setState({ isModalOpen: true });
        }
    }, {
        key: 'closeModal',
        value: function closeModal() {
            this.setState({ isModalOpen: false });
        }
    }, {
        key: 'handleAction',
        value: function handleAction(data) {}
    }, {
        key: 'getModalRole',
        value: function getModalRole() {
            return this.props.modalProps.role;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    Button,
                    {
                        amStyle: 'primary',
                        onClick: this.openModal
                    },
                    this.props.title
                ),
                React.createElement(
                    Modal,
                    _extends({
                        ref: 'modal',
                        isOpen: this.state.isModalOpen,
                        onAction: this.handleAction
                    }, this.props.modalProps),
                    this.getModalRole() !== 'loading' && this.props.children
                )
            );
        }
    }]);

    return MyModel;
}(React.Component);

var OnlineInterView = function (_React$Component3) {
    _inherits(OnlineInterView, _React$Component3);

    function OnlineInterView(props) {
        _classCallCheck(this, OnlineInterView);

        var _this3 = _possibleConstructorReturn(this, (OnlineInterView.__proto__ || Object.getPrototypeOf(OnlineInterView)).call(this, props));

        _this3.state = {
            step: 0,
            workState: '在职'
        };
        _this3.clickNavHandler = _this3.clickNavHandler.bind(_this3);
        _this3.handleChange = _this3.handleChange.bind(_this3);
        return _this3;
    }

    _createClass(OnlineInterView, [{
        key: 'clickNavHandler',
        value: function clickNavHandler(item, e) {
            e.preventDefault();
            if (this.state.step == 1) {}
            this.setState({ step: this.state.step + 1 });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            console.log(event.target.name + '->' + event.target.value);
            Cookies.set(event.target.name, event.target.value, { expires: 7 });
            if (event.target.name == 'workState') {
                this.setState({ workState: event.target.value });
            }
            event.preventDefault();
        }
    }, {
        key: 'renderStep',
        value: function renderStep() {
            var _this4 = this;

            if (this.state.step == 0) {
                return React.createElement(
                    List,
                    null,
                    step1Fields.filter(function (field, i) {
                        if (field.name == 'workyear' && _this4.state.workState == '应届生') {
                            return null;
                        }
                        if (field.name == 'fastdate' && _this4.state.workState == '在职') {
                            return null;
                        }
                        return field;
                    }).map(function (field, i) {
                        return React.createElement(
                            List.Item,
                            { key: i, nested: 'input' },
                            React.createElement(
                                Field,
                                _extends({}, field, {
                                    containerClassName: 'my-label',
                                    onChange: _this4.handleChange,
                                    defaultValue: getValueCookie(field.name),
                                    placeholder: field.placeholder
                                }),
                                field.options && field.options.map(function (opt, i) {
                                    return React.createElement(
                                        'option',
                                        { value: opt.value, key: opt.value },
                                        opt.label
                                    );
                                })
                            )
                        );
                    })
                );
            } else {
                return React.createElement(Container, _extends({}, this.props, { fill: true }));
            }
        }
    }, {
        key: 'renderNavBar',
        value: function renderNavBar() {
            var navConfig = {};
            if (this.state.step == 0) {
                navConfig.title = '基本资料';
                navConfig.rightNav = [{ title: '下一步', icon: 'right-nav' }];
            } else {
                navConfig.title = '不知道';
            }
            return React.createElement(NavBar, _extends({}, navConfig, {
                onAction: this.clickNavHandler,
                amStyle: 'primary' }));
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                Container,
                _extends({}, this.props, { fill: true }),
                React.createElement(
                    View,
                    null,
                    this.renderNavBar(),
                    React.createElement(
                        Container,
                        { scrollable: true },
                        this.renderStep()
                    )
                )
            );
        }
    }]);

    return OnlineInterView;
}(React.Component);

$(function () {
    //alert('page loaded');
    ReactDOM.render(React.createElement(LoadingModal, { title: 'Loading Modal',
        modalProps: {
            title: '初始化中...',
            role: 'loading'
        } }), document.getElementById('root'));
    ReactDOM.render(React.createElement(OnlineInterView, null), document.getElementById('root'));
});