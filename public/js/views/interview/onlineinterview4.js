'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;
var Grid = AMUITouch.Grid;
var Col = AMUITouch.Col;
var Card = AMUITouch.Card;
var Icon = AMUITouch.Icon;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;

function clickAdd(state, action) {
    var nextCount = (state.count == null ? 0 : state.count) + 1;
    console.log('CLICK_ADD');
    return Object.assign({}, state, { count: nextCount });
}

var pageInitState = {
    pageinited: false,
    pageiniting: true,
    step: getNumberFromCookies('lastStep', 0),
    identify: getValFromCookies('identify')
};

var requestpostsHandler = function requestpostsHandler(state, action) {
    switch (action.key) {
        case 'pageiniting':
            setTimeout(function () {
                store.dispatch(uiModelOpen('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: true });

        case 'uploading':
            setTimeout(function () {
                store.dispatch(uiModelOpen('LoadingModel', '资料上传中'));
            }, 1);
            return state;
    }
    return state;
};

var receivepostsHandler = function receivepostsHandler(state, action) {
    if (action.posts.err != null) {
        setTimeout(function () {
            store.dispatch(uiModelClose('all'));
            var aftAct = null;
            if (action.key == 'pageiniting') {
                aftAct = function aftAct() {
                    location.reload();
                };
            }
            store.dispatch(uiModelOpen('AlertModel', '通讯异常', action.posts.err.info, aftAct));
        }, 1);
        return state;
    }
    switch (action.key) {
        case 'pageiniting':
            pageInitDataLoaded(action.posts);
            setTimeout(function () {
                store.dispatch(quesCanInit());
                store.dispatch(uiModelClose('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: false, pageinited: true });

        case 'uploading':
            setTimeout(function () {
                store.dispatch(uiModelClose('LoadingModel'));
                store.dispatch(recordUploaedAction(action.posts.data.identify));
            }, 1);
            break;
    }
    return state;
};

var RECORDUPLOADED = 'RECORDUPLOADED';
var recordUploaedAction = makeActionCreator(RECORDUPLOADED, 'identify');
var recordUploaedHandler = function recordUploaedHandler(sate, action) {
    Cookies.set('identify', action.identify, { expires: 7 });
    Cookies.set('lastStep', 0, { expires: 7 });
    return updateObject(sate, { identify: action.identify, step: 0 });
};

var CHANGESTEP = 'CHANGESTEP';
var changeStepAction = makeActionCreator(CHANGESTEP, 'act');
var changeStepHandler = function changeStepHandler(state, action) {
    var newStep = state.step + (action.act == 'pre' ? -1 : 1);
    Cookies.set('lastStep', newStep, { expires: 7 });
    return updateObject(state, { step: newStep });
};

var pageReducer = createReducer(pageInitState, {
    REQUEST_POSTS: requestpostsHandler,
    RECEIVE_POSTS: receivepostsHandler,
    CHANGESTEP: changeStepHandler,
    RECORDUPLOADED: recordUploaedHandler
});

var UI_MODEL_OPEN = "UI_MODEL_OPEN";
var UI_MODEL_CLOSE = "UI_MODEL_CLOSE";

var uiModelOpen = makeActionCreator(UI_MODEL_OPEN, 'modelid', 'title', 'content', 'aftAct');
var uiModelClose = makeActionCreator(UI_MODEL_CLOSE, 'modelid');

var uiModelOpenHandler = function uiModelOpenHandler(state, action) {
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: true, title: action.title == null ? '加载中' : action.title, content: action.content, aftAct: action.aftAct });
    var newModelState = updateObject(state.model, _defineProperty({}, action.modelid, newTargetModelState));
    return updateObject(state, { model: newModelState });
};

var uiModelCloseHandler = function uiModelCloseHandler(state, action) {
    var newModelState = null;
    if (action.modelid == 'all') {
        newModelState = updateObject(state.model, {});
        for (var child in newModelState) {
            newModelState[child].isopen = false;
        }
        return updateObject(state, { model: newModelState });
    }
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: false });
    newModelState = updateObject(state.model, _defineProperty({}, action.modelid, newTargetModelState));
    return updateObject(state, { model: newModelState });
};

var uiTipsInitState = {
    model: {
        LoadingModel: {
            isopen: false,
            title: ''
        },
        AlertModel: {
            isopen: false,
            title: ''
        }
    }
};

var uiTipsReducer = createReducer(uiTipsInitState, {
    UI_MODEL_OPEN: uiModelOpenHandler,
    UI_MODEL_CLOSE: uiModelCloseHandler
});

function counterValueChangedHandler(state, action) {
    Cookies.set(action.counterID + action.name, action.value, { expires: 7 });
    var newtstate = Object.assign({}, state[action.counterID], _defineProperty({}, action.name, action.value));
    return Object.assign({}, state, _defineProperty({}, action.counterID, newtstate));
}

function getValFromCookies(identity, defaultVal) {
    var a = Cookies.get(identity);
    return a == null ? defaultVal : a;
}

function getNumberFromCookies(identity, defaultVal) {
    return parseFloat(getValFromCookies(identity, defaultVal));
}

var counters = [];
//[{ id: 'counter1', title: '计算器A' }, { id: 'counter2', title: '计算器B' }, { id: 'counter3', title: '计算器C' }, { id: 'counter4', title: '计算器D' }];

var counterInitData = {};
counters.forEach(function (item) {
    counterInitData[item.id] = {
        a: getNumberFromCookies(item.id + 'a', 0),
        b: getNumberFromCookies(item.id + 'a', 0),
        op: getValFromCookies(item.id + 'op', '+')
    };
});

var counterReducer = createReducer(counterInitData, {
    COUNTER_VALUE_CHANGED: counterValueChangedHandler
});

var employeeInfoInitState = {
    name: getValFromCookies('p-name', ''),
    sex: getValFromCookies('p-sex', 0),
    borndate: getValFromCookies('p-borndate', ''),
    jiguan: getValFromCookies('p-jiguan', ''),
    workState: getValFromCookies('p-workState', 0),
    xueli: getValFromCookies('p-xueli', 0),
    school: getValFromCookies('p-school', ''),
    zhuanye: getValFromCookies('p-zhuanye', ''),
    englishlevel: getValFromCookies('p-englishlevel', 0),
    tel: getValFromCookies('p-tel', ''),
    address: getValFromCookies('p-address', ''),
    post: getValFromCookies('p-post', 0),
    money: getValFromCookies('p-money', ''),
    workyear: getValFromCookies('p-workyear', ''),
    fastdate: getValFromCookies('p-fastdate', ''),
    bodystate: getValFromCookies('p-bodystate', ''),
    quesIndex: 0
};

var BASEINFOCHANGED = 'BASEINFOCHANGED';
var baseInfoChanged = makeActionCreator(BASEINFOCHANGED, 'name', 'value');

function baseInfoChangedHandler(state, action) {
    if (typeof action.value == 'string') {
        action.value = myTrim(action.value);
    }
    if (action.name == 'workyear') {
        action.value = parseInt(action.value);
    }
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, _defineProperty({}, action.name, action.value));
}

var WELCOMINFOCHANGED = 'WELCOMINFOCHANGED';
var welcomInfoChanged = makeActionCreator(WELCOMINFOCHANGED, 'name', 'value');
function welcomInfoChangedHandler(state, action) {
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, _defineProperty({}, action.name, action.value));
}

var QUES_ANSWER_CHANGED = 'QUES_ANSWER_CHANGED';
var QUES_CANINIT = 'QUES_CANINIT';
var QUES_NEXT = 'QUES_NEXT';
var QUES_PREVE = 'QUES_PREVE';
var quesAnserChanged = makeActionCreator(QUES_ANSWER_CHANGED, 'answer');
var quesCanInit = makeActionCreator(QUES_CANINIT);
var quesNext = makeActionCreator(QUES_NEXT);
var quesPreve = makeActionCreator(QUES_PREVE);
function quesAnserChangedHandler(state, action) {
    var mustAnserQues_arr = getMustAnswerQues(state);
    var nowQues = updateObject(mustAnserQues_arr[state.quesIndex], { answer: action.answer });
    var newQues_arr = mustAnserQues_arr.map(function (que) {
        return que.id == nowQues.id ? nowQues : que;
    });
    Cookies.set('answer' + nowQues.id, nowQues.answer, { expires: 7 });

    return updateObject(state, {
        ques_arr: newQues_arr
    });
}
function quesCanInitHandler(state, action) {
    var newState = {
        quesCount: pageInitData.ques_arr.length,
        ques_arr: pageInitData.ques_arr.map(function (ques) {
            return {
                title: ques.title,
                id: ques.id,
                应届可答: ques.应届可答,
                可以跳过: ques.可以跳过,
                answer: getValFromCookies('answer' + ques.id, ''),
                relPost: ques.relPost
            };
        })
    };
    return updateObject(state, newState);
}
function quesNextHandler(state, action) {
    var newIndex = state.quesIndex + 1;
    var mustAnserQues_arr = getMustAnswerQues(state);
    if (newIndex >= mustAnserQues_arr.length) {
        setTimeout(function () {
            store.dispatch(changeStepAction('aft'));
        }, 1);
        return state;
    }
    return updateObject(state, { quesIndex: newIndex });
}
function quesPreveHandler(state, action) {
    var newIndex = Math.max(0, state.quesIndex - 1);
    return updateObject(state, { quesIndex: newIndex });
}
function getMustAnswerQues(state) {
    return state.ques_arr == null ? [] : state.ques_arr.filter(function (que) {
        return (que.relPost == 0 || que.relPost == state.post) && (que.应届可答 || state.workState != '应届生');
    });
}

var WANTSUBMIT = 'WANTSUBMIT';
var submitInfo = makeActionCreator(WANTSUBMIT);
function submitHandler(state, action) {
    setTimeout(function () {
        store.dispatch(changeStepAction('aft'));
    }, 1);
    return state;
}

var mainReducer = createReducer(employeeInfoInitState, {
    BASEINFOCHANGED: baseInfoChangedHandler,
    WELCOMINFOCHANGED: welcomInfoChangedHandler,
    QUES_ANSWER_CHANGED: quesAnserChangedHandler,
    QUES_CANINIT: quesCanInitHandler,
    QUES_NEXT: quesNextHandler,
    QUES_PREVE: quesPreveHandler,
    WANTSUBMIT: submitHandler
});

var reducer = Redux.combineReducers({ page: pageReducer, ui: uiTipsReducer, main: mainReducer });
var store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

var ModalWind = function (_React$PureComponent) {
    _inherits(ModalWind, _React$PureComponent);

    function ModalWind(props) {
        _classCallCheck(this, ModalWind);

        var _this = _possibleConstructorReturn(this, (ModalWind.__proto__ || Object.getPrototypeOf(ModalWind)).call(this, props));

        _this.getModalRole = _this.getModalRole.bind(_this);
        _this.handleAction = _this.handleAction.bind(_this);
        return _this;
    }

    _createClass(ModalWind, [{
        key: 'getModalRole',
        value: function getModalRole() {
            return this.props.modalProps.role;
        }
    }, {
        key: 'handleAction',
        value: function handleAction(data) {
            if (this.props.modalProps.role == 'alert') {
                if (this.props.aftAct) {
                    this.props.aftAct();
                }
                store.dispatch(uiModelClose(this.props.id));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                Modal,
                _extends({
                    isOpen: this.props.isModalOpen,
                    onDismiss: this.closeModal,
                    onOpen: this.onOpen,
                    onClosed: this.onClosed,
                    onAction: this.handleAction,
                    title: this.props.title
                }, this.props.modalProps),
                this.getModalRole() !== 'loading' && this.props.content
            );
        }
    }]);

    return ModalWind;
}(React.PureComponent);

var isModalOpenSelector = Reselect.createSelector(function (state, ownProps) {
    return state.ui.model[ownProps.id].isopen;
}, function (op) {
    return op;
});

var ModalWind_mapStateToProps = function ModalWind_mapStateToProps(state, ownProps) {
    return {
        isModalOpen: isModalOpenSelector(state, ownProps),
        modalProps: ownProps.modalProps,
        title: state.ui.model[ownProps.id].title,
        content: state.ui.model[ownProps.id].content,
        aftAct: state.ui.model[ownProps.id].aftAct
    };
};

var ModalWind_mapDispatchToProps = function ModalWind_mapDispatchToProps(dispatch, ownProps) {
    return {
        openModal: function openModal() {
            dispatch(uiModelOpen(ownProps.id));
        },

        closeModal: function closeModal() {
            dispatch(uiModelClose(ownProps.id));
        },

        onOpen: function onOpen() {
            console.log('loading modal open....');
        },

        onClosed: function onClosed() {
            console.log('loading modal closed....');
        }
    };
};

var VisibleModalWind = ReactRedux.connect(ModalWind_mapStateToProps, ModalWind_mapDispatchToProps)(ModalWind);

var makeBaseInfoItem = function makeBaseInfoItem(name, label, type, isrequired, options, readonly) {
    if (options != null) {
        options.unshift({ label: '请选择', value: '=select-default=' });
    }
    return {
        attr: {
            name: name,
            label: label,
            type: type,
            readOnly: readonly ? 'readOnly' : null
        },
        isrequired: isrequired,
        options: options,
        placeholder: options == null && isrequired ? '必填项' : ''
    };
};

var baseInfoFields = [];
var pageInitData = null;

function pageInitDataLoaded(postdata) {
    pageInitData = postdata.data;
    /*
        makeBaseInfoItem('post', '应聘岗位', 'select', true, postdata.data.pots_arr.map(item => { return { label: item.label, value: item.id }; })),
        makeBaseInfoItem('postInfo', '岗位信息', 'textarea', false, null, true),
    */
    baseInfoFields = [makeBaseInfoItem('name', '姓名', 'text', true), makeBaseInfoItem('sex', '性别', 'select', true, [{ label: '男', value: 'm' }, { label: '女', value: 'f' }]), makeBaseInfoItem('borndate', '出生日期', 'date', true), makeBaseInfoItem('jiguan', '籍贯', 'text', true), makeBaseInfoItem('workState', '当前状态', 'select', true, [{ label: '在职', value: '在职' }, { label: '应届生', value: '应届生' }, { label: '待业', value: '待业' }]), makeBaseInfoItem('xueli', '学历', 'select', true, [{ label: '大专', value: '大专' }, { label: '本科', value: '本科' }, { label: '硕士', value: '硕士' }, { label: '博士', value: '博士' }]), makeBaseInfoItem('zhuanye', '专业名称', 'text', true), makeBaseInfoItem('englishlevel', '英语等级', 'select', true, postdata.data.englishLevels_arr.map(function (item) {
        return { label: item.label, value: item.id };
    })), makeBaseInfoItem('tel', '手机号码', 'text', true), makeBaseInfoItem('address', '现居住地', 'text', true), makeBaseInfoItem('money', '期望薪资', 'number', true), makeBaseInfoItem('workyear', '工作年限', 'number', true), makeBaseInfoItem('fastdate', '最快到岗', 'date', true), makeBaseInfoItem('bodystate', '健康状态', 'select', true, [{ label: '良好', value: '良好' }, { label: '18周岁后住院超过3天或有可能传染的或影响工作及岗位安排', value: '18周岁后住院超过3天或有可能传染的或影响工作及岗位安排' }])];

    pageInitData.pots_arr.forEach(function (post) {
        var itemIndex = 0;
        post.infohtml = [];

        post.info.split('\n').forEach(function (str, i) {
            var keypos = str.indexOf(':');
            if (keypos == -1) keypos = str.indexOf('：');
            if (keypos != -1 && keypos <= 5) {
                post.infohtml.push(React.createElement(
                    'b',
                    { key: itemIndex++ },
                    str.substr(0, keypos + 1)
                ));
                if (keypos < str.length - 1) post.infohtml.push(React.createElement(
                    'span',
                    { key: itemIndex++ },
                    str.substr(keypos + 1)
                ));
            } else {
                post.infohtml.push(React.createElement(
                    'span',
                    { key: itemIndex++, className: 'postinfospan' },
                    str
                ));
            }
            post.infohtml.push(React.createElement('br', { key: itemIndex++ }));
        });
    });
}

function handleSwitch() {
    console.log(this.refs.field.checked);
}

var freshSwitch = React.createElement(Switch, { onValueChange: handleSwitch, value: false });
var workingSwitch = React.createElement(Switch, { onValueChange: handleSwitch, value: false });

var ErroInfo = function (_React$PureComponent2) {
    _inherits(ErroInfo, _React$PureComponent2);

    function ErroInfo(props) {
        _classCallCheck(this, ErroInfo);

        var _this2 = _possibleConstructorReturn(this, (ErroInfo.__proto__ || Object.getPrototypeOf(ErroInfo)).call(this, props));

        _this2.refItem = _this2.refItem.bind(_this2);
        return _this2;
    }

    _createClass(ErroInfo, [{
        key: 'refItem',
        value: function refItem(item) {
            if (item == null) {
                return;
            }
            var $item = $(item);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.err == null) return null;
            return React.createElement(
                'span',
                { style: { color: 'red', paddingLeft: '5em' } },
                React.createElement(Icon, { name: 'info' }),
                this.props.err
            );
        }
    }]);

    return ErroInfo;
}(React.PureComponent);

var BaseInfoView = function (_React$PureComponent3) {
    _inherits(BaseInfoView, _React$PureComponent3);

    function BaseInfoView(props) {
        _classCallCheck(this, BaseInfoView);

        return _possibleConstructorReturn(this, (BaseInfoView.__proto__ || Object.getPrototypeOf(BaseInfoView)).call(this, props));
    }

    _createClass(BaseInfoView, [{
        key: 'render',
        value: function render() {
            var _this4 = this;

            return React.createElement(
                Container,
                { fill: true, style: { display: 'flex', flexFlow: 'column nowrap' } },
                React.createElement(
                    Container,
                    { style: { flex: '1 1 auto' }, scrollable: true },
                    React.createElement(
                        List,
                        null,
                        getUsedFields(this.props).map(function (field, i) {
                            return React.createElement(
                                List.Item,
                                { key: field.attr.name, nested: 'input', after: React.createElement(Icon, { name: field.iserr ? 'star' : 'check' }) },
                                React.createElement(
                                    Container,
                                    { style: { flex: '1 1 auto' } },
                                    React.createElement(
                                        Field,
                                        _extends({}, field.attr, {
                                            containerClassName: 'my-label',
                                            onChange: _this4.props.handleChange,
                                            value: _this4.props[field.attr.name],
                                            placeholder: field.placeholder
                                        }),
                                        field.options && field.options.map(function (opt, i) {
                                            return React.createElement(
                                                'option',
                                                { value: opt.value, key: opt.value },
                                                opt.label
                                            );
                                        })
                                    ),
                                    React.createElement(ErroInfo, { err: field.err })
                                )
                            );
                        })
                    )
                ),
                React.createElement(
                    Button,
                    { className: 'fixflex', amStyle: 'primary', block: true, disabled: !this.props.canNext, onClick: this.props.clickNext },
                    !this.props.canNext ? '请登记完整资料' : '继续'
                )
            );
        }
    }]);

    return BaseInfoView;
}(React.PureComponent);

function getUsedFields(state) {
    return baseInfoFields.filter(function (field, i) {
        if (field.attr.name == 'workyear' && (state.workState == 0 || state.workState == '应届生')) {
            return null;
        }
        return field;
    });
}

function BaseInfoView_mapStateToProps(state, ownprops) {
    var rlt = Object.assign({}, state.main);
    rlt.step = stepSelector(state);
    rlt.post = state.main.post;
    var usedFields_arr = getUsedFields(rlt);
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    usedFields_arr.forEach(function (field) {
        if (field.isrequired) {
            var nowValue = rlt[field.attr.name];
            var errInfo = null;
            var iserr = nowValue == null || nowValue == '' || field.attr.type == 'select' && nowValue == '=select-default=';
            if (!iserr) {
                if (field.attr.name == 'name') {
                    errInfo = nowValue.length == 1 || nowValue.length > 5 ? '2-4位' : null;
                } else if (field.attr.name == 'workyear') {
                    errInfo = nowValue < 0 || nowValue > 30 ? '数据有误' : null;
                } else if (field.attr.name == 'money') {
                    errInfo = nowValue > 100000 ? '数据有误' : null;
                } else if (field.attr.name == 'tel') {
                    errInfo = nowValue.length != 11 ? '数据有误' : null;
                } else if (field.attr.name == 'zhuanye') {
                    errInfo = nowValue.length < 2 || nowValue.length > 30 ? '数据有误' : null;
                } else if (field.attr.name == 'jiguan') {
                    errInfo = nowValue.length < 2 || nowValue.length > 10 ? '数据有误' : null;
                } else if (field.attr.name == 'address') {
                    errInfo = nowValue.length < 2 || nowValue.length > 30 ? '数据有误' : null;
                } else if (field.attr.type == 'date') {
                    errInfo = nowValue != '' && !checkDate(nowValue) ? '格式错误' : null;
                    if (errInfo == null) {
                        var theDate = new Date(nowValue);
                        if (field.attr.name == 'borndate') {
                            var year = now.getFullYear() - theDate.getFullYear();
                            errInfo = year < 18 || year > 50 ? '年龄不合适' : null;
                        } else if (field.attr.name == 'fastdate') {
                            var difday = (theDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                            errInfo = difday < 0 ? '数据有误' : difday > 90 ? '只接受90天内' : null;
                        }
                    }
                }
            }
            field.err = errInfo;
            field.iserr = iserr || errInfo;
        }
    });
    rlt.canNext = usedFields_arr.find(function (item) {
        return item.iserr;
    }) == null;
    /*
    let postsField = baseInfoFields.find(x => x.attr.name == 'post');
    if (postsField) {
        let selectedPost = pageInitData.pots_arr.find(x => x.id == rlt.post);
        if (selectedPost) {
            rlt.postInfo = selectedPost.info;
        }
    }
    */
    return rlt;
}

function BaseInfoView_mapDisptch(dispatch, ownProps) {
    return {
        handleChange: function handleChange(event) {
            dispatch(baseInfoChanged(event.target.name, event.target.value));
            event.preventDefault();
        },
        clickNext: function clickNext(event) {
            dispatch(changeStepAction('next'));
        }
    };
}

var VisibleBaseInfoView = ReactRedux.connect(BaseInfoView_mapStateToProps, BaseInfoView_mapDisptch)(BaseInfoView);

var WelComeView = function (_React$PureComponent4) {
    _inherits(WelComeView, _React$PureComponent4);

    function WelComeView(props) {
        var _this5;

        _classCallCheck(this, WelComeView);

        (_this5 = _possibleConstructorReturn(this, (WelComeView.__proto__ || Object.getPrototypeOf(WelComeView)).call(this, props)), _this5), _this5.refItem = _this5.refItem.bind(_this5);
        return _this5;
    }

    _createClass(WelComeView, [{
        key: 'refItem',
        value: function refItem(item) {
            if (item == null) return;
            if (item.name == 'logo') {
                var $item = $(item);
                var height = $item.height();
                var width = $item.width();
                var size = Math.min(width, height);
                $item.css('height', size + 'px');
                $item.css('width', size + 'px');
            }
        }
    }, {
        key: 'getPostOptions',
        value: function getPostOptions() {
            if (this.props.post == 0) {
                return;
            }
        }
    }, {
        key: 'renderContent',
        value: function renderContent() {
            if (this.props.identify == null) {
                return React.createElement(
                    Container,
                    { style: { flex: '1 1 auto' } },
                    React.createElement(
                        Container,
                        null,
                        React.createElement(
                            'h3',
                            null,
                            '\u5E94\u8058\u804C\u4F4D:'
                        ),
                        React.createElement(
                            'select',
                            { name: 'post', value: this.props.post, onChange: this.props.postChanged },
                            this.props.postOptions
                        )
                    ),
                    React.createElement(
                        Container,
                        this.props.post == 0 ? { style: { display: 'none' } } : null,
                        React.createElement(
                            Card,
                            null,
                            this.props.postInfos_arr
                        )
                    )
                );
            } else {
                return React.createElement(
                    Container,
                    { style: { flex: '1 1 auto' } },
                    React.createElement(
                        'h3',
                        null,
                        this.props.name
                    ),
                    React.createElement(
                        'h3',
                        null,
                        '\u4F60\u5E94\u8058"',
                        this.props.postName,
                        '"\u7684\u8D44\u6599\u5DF2\u7ECF\u63D0\u4EA4'
                    )
                );
            }
        }
    }, {
        key: 'renderNextBtn',
        value: function renderNextBtn() {
            if (this.props.identify == null) {
                return React.createElement(
                    Button,
                    { className: 'fixflex', amStyle: 'primary', block: true, disabled: this.props.post == 0, onClick: this.props.clickNext },
                    '\u7EE7\u7EED'
                );
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                Container,
                { fill: true, style: { display: 'flex', flexFlow: 'column nowrap' } },
                React.createElement(
                    Container,
                    { className: 'fixflex' },
                    React.createElement(
                        'h1',
                        null,
                        '\u6D77\u52C3\u516C\u53F8\u7EBF\u4E0A\u5E94\u8058\u7CFB\u7EDF'
                    )
                ),
                React.createElement(
                    Container,
                    { style: { width: '10em', height: '10em', margin: 'auto', flex: '0 1 auto' } },
                    React.createElement('img', { name: 'logo', src: '../res/img/logo.png', style: { width: '100%', height: '100%' } })
                ),
                this.renderContent(),
                ';',
                this.renderNextBtn(),
                ';'
            );
        }
    }]);

    return WelComeView;
}(React.PureComponent);

function WelComeView_mapStateToProps(state, ownProps) {
    var rlt = Object.assign({}, state.main);
    var selectedPost = pageInitData.pots_arr.find(function (x) {
        return x.id == rlt.post;
    });
    rlt.postOptions = pageInitData.pots_arr.map(function (item) {
        return React.createElement(
            'option',
            { key: item.id, value: item.id },
            item.label
        );
    });
    if (selectedPost) {
        var reg = new RegExp("\n", "g");
        rlt.postInfos_arr = selectedPost.infohtml;
        rlt.postName = selectedPost.label;
    } else {
        rlt.postInfo = '';
        rlt.postOptions = [React.createElement(
            'option',
            { key: 0, value: 0 },
            '\u8BF7\u9009\u62E9'
        )].concat(rlt.postOptions);
    }
    rlt.identify = state.page.identify;
    return rlt;
}

function WelComeView_dispatchToProps(dispatch, ownpros) {
    return {
        postChanged: function postChanged(event) {
            dispatch(welcomInfoChanged(event.target.name, event.target.value));
            event.preventDefault();
        },
        clickNext: function clickNext(event) {
            dispatch(changeStepAction('next'));
        }
    };
}

var VisibleWelComeView = ReactRedux.connect(WelComeView_mapStateToProps, WelComeView_dispatchToProps)(WelComeView);

var QuestionView = function (_React$PureComponent5) {
    _inherits(QuestionView, _React$PureComponent5);

    function QuestionView(props) {
        _classCallCheck(this, QuestionView);

        return _possibleConstructorReturn(this, (QuestionView.__proto__ || Object.getPrototypeOf(QuestionView)).call(this, props));
    }

    _createClass(QuestionView, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                Container,
                { fill: true, style: { display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' } },
                React.createElement(
                    Card,
                    { className: 'fixflex' },
                    this.props.nowQue.title,
                    this.props.nowQue.可以跳过 ? '(可以跳过)' : ''
                ),
                React.createElement('textarea', { style: { flex: '1 1 auto', margin: '0em 1em 1em 1em' }, name: '\u56DE\u7B54', type: 'textarea', placeholder: '请作答', onChange: this.props.answerChanged, value: this.props.nowQue.answer }),
                React.createElement(
                    Button,
                    { className: 'fixflex', amStyle: 'primary', block: true, disabled: !this.props.cannext, onClick: this.props.clickNext },
                    this.props.cannext ? this.props.nowQue.answer.length == 0 ? '跳过' : '继续' : '请作答'
                )
            );
        }
    }]);

    return QuestionView;
}(React.PureComponent);

function QuestionView_mapstatetoprops(state, ownProps) {
    var rlt = {
        nowQue: {}
    };
    if (state.main.ques_arr != null) {
        var mustAnserQues = getMustAnswerQues(state.main);
        rlt.nowQue = mustAnserQues[state.main.quesIndex];
        rlt.cannext = rlt.nowQue.answer.length > 0 || rlt.nowQue.可以跳过;
    }

    return rlt;
}

function QuestionView_mapdisptchtoprops(dispatch, ownProps) {
    return {
        answerChanged: function answerChanged(event) {
            dispatch(quesAnserChanged(event.target.value));
        },
        clickNext: function clickNext(event) {
            dispatch(quesNext());
        }
    };
}

var VisibleQuestionView = ReactRedux.connect(QuestionView_mapstatetoprops, QuestionView_mapdisptchtoprops)(QuestionView);
var selectedFileBase64 = null;
var nextBtnInPhoto = null;
var Orientation = null;

var PhotoView = function (_React$PureComponent6) {
    _inherits(PhotoView, _React$PureComponent6);

    function PhotoView(props) {
        _classCallCheck(this, PhotoView);

        return _possibleConstructorReturn(this, (PhotoView.__proto__ || Object.getPrototypeOf(PhotoView)).call(this, props));
    }

    _createClass(PhotoView, [{
        key: 'uploadCreated',
        value: function uploadCreated(divelem) {
            if (divelem == null) return;
            var preFileid = null;
            var uploader = WebUploader.create({
                auto: false, // 选完文件后，是否自动上传 
                server: 'upload', // 文件接收服务端 
                pick: { id: '#filePicker', multiple: false }, // 选择文件的按钮。可选
                resize: true,
                accept: {
                    title: 'Images',
                    extensions: 'jpg,jpeg,png',
                    mimeTypes: 'image/jpg,image/jpeg,image/png'
                },
                thumb: {
                    type: 'image/jpg,jpeg,png'
                },
                fileNumLimit: 2, //限制上传个数
                fileSingleSizeLimit: 1024000 * 5 //限制单个上传图片的大小
            });

            uploader.on('fileQueued', function (file) {
                if (preFileid != null) {
                    uploader.removeFile(preFileid);
                }
                var srcSeted = false;
                var fileReaded = false;
                var orientationReaded = false;
                EXIF.getData(file.source.source, function () {
                    EXIF.getAllTags(this);
                    Orientation = EXIF.getTag(this, 'Orientation');
                    orientationReaded = true;
                    setSrcFunc();
                });
                var setSrcFunc = function setSrcFunc() {
                    if (!fileReaded || !orientationReaded) return;
                    var $img = $('#thumbImg');
                    $img.attr('src', selectedFileBase64);
                    var rotateDeg = 0;
                    switch (Orientation) {
                        case 1:
                            rotateDeg = 0;
                            break;
                        case 3:
                            rotateDeg = 180;
                            break;
                        case 6:
                            rotateDeg = 90;
                            break;
                        case 8:
                            rotateDeg = -90;
                            break;
                    }
                    $img.css('transform', 'rotate(' + rotateDeg + 'deg)');
                    /*
                    let $imgparent = $('#imgContainer');
                    let height = $img.height();
                    let width = $img.width();
                    let parentheight = $imgparent.height();
                    let parentwidth = $imgparent.width();
                    let scale = 1;
                    if(parentheight > parentwidth){
                        scale = parentwidth / width;
                    }
                    else{
                        scale = parentheight / height;
                    }
                    $img.css('height', height * scale + 'px');
                    $img.css('width', width * scale + 'px');
                    */
                    var nextBtn = document.getElementById('nextBtn');
                    if (nextBtn) {
                        nextBtn.innerHTML = '确认提交';
                    }
                };
                var reader = new FileReader();
                reader.onload = function (file2) {
                    return function (e) {
                        //console.info(this.result); //这个就是base64的数据了
                        selectedFileBase64 = this.result;
                        fileReaded = true;
                        setSrcFunc();
                    };
                }(file);
                reader.readAsDataURL(file.source.source);
                preFileid = file;
            });

            uploader.on('uploadProgress', function (file, percentage) {
                console.log(file.id + '-' + percentage);
            });

            uploader.on('uploadSuccess', function (file) {});

            uploader.on('uploadError', function (file) {});
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                Container,
                { fill: true, style: { display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' } },
                React.createElement(
                    'h3',
                    { style: { textAlign: 'center' } },
                    '\u53EF\u4EE5\u7559\u4E00\u5F20\u4F60\u7684\u7167\u7247\u5417\uFF1F'
                ),
                React.createElement(
                    Container,
                    { style: { flex: '1 1 auto', display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' } },
                    React.createElement('img', { id: 'thumbImg', src: selectedFileBase64, style: { width: '100%', height: 'auto' } })
                ),
                React.createElement(
                    'div',
                    { style: { alignSelf: 'center', flex: '0 0 auto' }, id: 'filePicker', ref: this.uploadCreated },
                    selectedFileBase64 == null ? '选择图片' : '更换图片'
                ),
                React.createElement(
                    Button,
                    { className: 'fixflex', amStyle: 'primary', block: true, id: 'nextBtn', onClick: this.props.clickNext },
                    selectedFileBase64 == null ? '跳过' : '确认提交'
                )
            );
        }
    }]);

    return PhotoView;
}(React.PureComponent);

function photoViewmapstatetoprops(state, ownProps) {
    return {};
}

function photoViewDisptchToprops(dispatch, ownProps) {
    return {
        clickNext: function clickNext() {
            // 上传数据
            var state = store.getState();
            var postData = updateObject(state.main, { action: 'upload' });
            postData.ques_arr = getMustAnswerQues(state.main);
            postData.imgBase64 = selectedFileBase64;
            postData.Orientation = Orientation;
            store.dispatch(fetchJsonPost('onlineinterview_process', postData, 'uploading'));
            //store.dispatch(uiModelOpen('LoadingModel','正在上传'));
        }
    };
}

var VisiblePhotoView = ReactRedux.connect(null, photoViewDisptchToprops)(PhotoView);

var StepRender = function (_React$PureComponent7) {
    _inherits(StepRender, _React$PureComponent7);

    function StepRender(props) {
        _classCallCheck(this, StepRender);

        var _this8 = _possibleConstructorReturn(this, (StepRender.__proto__ || Object.getPrototypeOf(StepRender)).call(this, props));

        _this8.renderNavBar = _this8.renderNavBar.bind(_this8);
        _this8.renderStep = _this8.renderStep.bind(_this8);
        return _this8;
    }

    _createClass(StepRender, [{
        key: 'renderNavBar',
        value: function renderNavBar() {
            if (this.props.stepInfo.navTitle == undefined) {
                return null;
            }
            var navConfig = {
                title: this.props.stepInfo.navTitle,
                leftNav: this.props.stepInfo.leftNav
            };
            return React.createElement(NavBar, _extends({}, navConfig, {
                onAction: this.props.clickNavHandler,
                className: 'fixflex',
                amStyle: 'primary' }));
        }
    }, {
        key: 'renderStep',
        value: function renderStep() {
            if (this.props.step < 0) {
                return null;
            }
            {
                this.renderNavBar();
            }
            switch (this.props.step) {
                case 0:
                    return React.createElement(VisibleWelComeView, null);
                case 1:
                    return React.createElement(VisibleBaseInfoView, null);
                case 2:
                    return React.createElement(VisibleQuestionView, null);
                case 3:
                    return React.createElement(VisiblePhotoView, null);

                default:
                    return null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                View,
                null,
                this.renderNavBar(),
                React.createElement(
                    Container,
                    { fill: true, style: { display: 'flex', overflowX: 'hidden' } },
                    this.renderStep()
                )
            );
        }
    }]);

    return StepRender;
}(React.PureComponent);

var stepSelector = Reselect.createSelector(function (state) {
    return state.page.pageinited ? state.page.step : -1;
}, function (b) {
    return b;
});
function selectStepInfo(state) {
    var step = stepSelector(state);
    var rlt = {};
    switch (step) {
        case 1:
            rlt = {
                navTitle: '基本资料',
                leftNav: [{ title: '上一步', icon: 'left-nav', act: 'pre', type: 'step' }]
            };
            break;
        case 2:
            var mustAnswerQues_arr = getMustAnswerQues(state.main);
            rlt = {
                navTitle: '问题 ' + (state.main.quesIndex + 1) + '/' + mustAnswerQues_arr.length,
                leftNav: [{ title: state.main.quesIndex == 0 ? '上一步' : '上一题', icon: 'left-nav', act: 'pre', type: state.main.quesIndex == 0 ? 'step' : 'que' }]
            };
            break;
        case 3:
            rlt = {
                navTitle: '最后一步',
                leftNav: [{ title: '上一步', icon: 'left-nav', act: 'pre', type: 'step' }]
            };
            break;
    }
    return rlt;
}
var stepInfoSelector = Reselect.createSelector(selectStepInfo, function (b) {
    return b;
});

function StepRender_mapstatetoprops(state, ownprops) {
    return {
        step: stepSelector(state),
        stepInfo: stepInfoSelector(state)
    };
}

function StepRender_dispatchTorprops(dispatch, ownprops) {
    return {
        clickNavHandler: function clickNavHandler(navbtn) {
            if (navbtn.type == 'step') {
                dispatch(changeStepAction(navbtn.act));
            } else if (navbtn.type == 'que') {
                dispatch(quesPreve());
            }
        }
    };
}

var VisibleStepRender = ReactRedux.connect(StepRender_mapstatetoprops, StepRender_dispatchTorprops)(StepRender);

var ThisPage = function (_React$Component) {
    _inherits(ThisPage, _React$Component);

    function ThisPage() {
        _classCallCheck(this, ThisPage);

        return _possibleConstructorReturn(this, (ThisPage.__proto__ || Object.getPrototypeOf(ThisPage)).apply(this, arguments));
    }

    _createClass(ThisPage, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                Container,
                _extends({}, this.props, { fill: true }),
                React.createElement(VisibleModalWind, { title: 'Loading Modal', id: 'LoadingModel',
                    modalProps: {
                        role: 'loading'
                    } }),
                React.createElement(VisibleModalWind, {
                    title: 'Alert Modal',
                    id: 'AlertModel',
                    modalProps: {
                        role: 'alert'
                    }
                }),
                React.createElement(VisibleStepRender, null)
            );
        }
    }]);

    return ThisPage;
}(React.Component);

/*
function Counter(props){
    PropTypes.checkPropTypes();
    return(
        <div>
            <input type='button' value='+' onClick={props.onClick} />
            <span>{props.count}</span>
        </div>
    );
}
*/

/*
class Counter extends React.Component {
    render() {
        return (
            <div>
                <div>{this.props.title}</div>
                <span>A:
                    <input name='a' type='number' value={this.props.a} onChange={this.props.inputChanged} />
                </span>
                <select name='op' onChange={this.props.inputChanged} value={this.props.op} >
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                    <option value='*'>*</option>
                    <option value='/'>/</option>
                </select>
                <span>B:</span>
                <input name='b' type='number' value={this.props.b} onChange={this.props.inputChanged} />
                <span>{this.props.title}结果={this.props.rlt}</span>
                {this.children}
            </div>
        );
    }
}

Counter.propTypes = {
    inputChanged: PropTypes.func.isRequired,
    a: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
}
*/

/*
function initCounterState(state, ownProps) {
    let counterName = ownProps.id;
    state.counter[counterName] = {
        a: 0,
        b: 0
    };
}
*/
/*
const getCounterValue = (state, ownProps, valueName) => {
    let counterName = ownProps.id;
    if (state.counter[counterName] == null) {
        return '';
    }
    return state.counter[counterName][valueName];
};

const getCounterValueA = (state, ownProp) => {
    return getCounterValue(state, ownProp, 'a');
}

const getCounterValueB = (state, ownProp) => {
    return getCounterValue(state, ownProp, 'b');
}

const counterValueASelector = Reselect.createSelector(
    getCounterValueA,
    a => { return a; }
);

const counterValueBSelector = Reselect.createSelector(
    getCounterValueB,
    b => { return b; }
);

const counterOPSelector = Reselect.createSelector(
    (state, ownProp) => { return getCounterValue(state, ownProp, 'op') },
    op => { return op; }
);

const counterRltSelector = Reselect.createSelector(
    [counterValueASelector, counterValueBSelector, counterOPSelector],
    (a, b, op) => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            default:

        }
    }
);


const Counter_mapStateToProps = (state, ownProps) => {
    return {
        a: counterValueASelector(state, ownProps),
        b: counterValueBSelector(state, ownProps),
        op: counterOPSelector(state, ownProps),
        rlt: counterRltSelector(state, ownProps),
    }
}

const Counter_mapDispatchToProps = (dispatch, ownProps) => {
    return {
        inputChanged: (event) => {
            let inputed = event.target.value;
            if (event.target.name == 'a' || event.target.name == 'b') {
                inputed = parseFloat(inputed);
                if (isNaN(inputed)) {
                    event.preventDefault();
                    return;
                }
            }
            dispatch(counterValueChanged(event.target.name, inputed, ownProps.id));
            console.log(event.target.name + '->' + event.target.value);
            event.preventDefault();
        }
    }
}


const VisibleCounter = ReactRedux.connect(
    Counter_mapStateToProps,
    Counter_mapDispatchToProps
)(Counter);
*/

/*
$(function () {
    //alert('page loaded');
    ReactDOM.render(<LoadingModal title="Loading Modal"
    modalProps={{
      title: '初始化中...',
      role: 'loading'
    }}>
    </LoadingModal>, document.getElementById('root'));
    ReactDOM.render(<OnlineInterView />, document.getElementById('root'));
});
*/

//store.dispatch(Actions.pageLoaded());

/*
function TestKKK() {
    return (
        <div>
            {
                counters.map(item => { return (<VisibleCounter key={item.id} id={item.id} title={item.title} />); })
            }
        </div>
    );
}
*/

ReactDOM.render(React.createElement(
    Provider,
    { store: store },
    React.createElement(ThisPage, null)
), document.getElementById('root'));

store.dispatch(fetchJsonPost('onlineinterview_process', { action: 'pageinit' }, 'pageiniting'));