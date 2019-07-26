"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TaskTargetPage_style = { "width": "100%" };
var Form_1headstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "whiteSpace": "nowrap", "overflow": "hidden" };
var Form_1tdstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "verticalAlign": "middle" };
var Form_1_tableStyle = { "marginTop": "-50px" };
var Form_1_headtableStyle = { "marginBottom": "0px" };
var gTaskGoalSetter = null;

var ERPC_TaskCreator = function (_React$PureComponent) {
    _inherits(ERPC_TaskCreator, _React$PureComponent);

    function ERPC_TaskCreator(props) {
        _classCallCheck(this, ERPC_TaskCreator);

        var _this = _possibleConstructorReturn(this, (ERPC_TaskCreator.__proto__ || Object.getPrototypeOf(ERPC_TaskCreator)).call(this, props));

        autoBind(_this);
        _this.contentDivRef = React.createRef();
        _this.inited = false;
        _this.formStyle = {
            maxWidth: '1024px',
            margin: 'auto'
        };
        return _this;
    }

    _createClass(ERPC_TaskCreator, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            var self = this;
            setTimeout(function () {
                self.inited = true;
            }, 50);
            if (appStateChangedAct_map) {
                appStateChangedAct_map['TaskCreatePage.Form0.records_arr'] = gFreshTCKForm;
                appStateChangedAct_map['TaskCreatePage.Form0.recordIndex'] = gBindTCKForm;
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.inited = false;
        }
    }, {
        key: "foceClose",
        value: function foceClose() {
            this.clickCloseHandler();
        }
    }, {
        key: "clickCloseHandler",
        value: function clickCloseHandler() {
            this.props.selector.closeCreator();
        }
    }, {
        key: "renderHead",
        value: function renderHead() {
            return React.createElement(
                "div",
                { className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
                React.createElement(
                    "h3",
                    { onClick: this.clickCloseHandler },
                    React.createElement("i", { className: "fa fa-arrow-left" }),
                    "\u4EFB\u52A1\u521B\u5EFA"
                )
            );
        }
    }, {
        key: "renderContent",
        value: function renderContent() {
            return React.createElement(
                "div",
                { className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column bg-light", style: { maxHeight: 'calc(100% - 40px)' } },
                React.createElement(VisibleTKCForm, { id: "Form0", parentPath: "TaskCreatePage" })
            );
        }
    }, {
        key: "render",
        value: function render() {
            var retElem = null;
            retElem = React.createElement(
                "div",
                { className: "fixedBackGround" },
                React.createElement(
                    "div",
                    { className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100", style: this.formStyle },
                    this.renderHead(),
                    this.renderContent()
                )
            );
            return retElem;
        }
    }]);

    return ERPC_TaskCreator;
}(React.PureComponent);

function ERPC_TaskCreator_mapstatetoprops(state, ownprops) {
    return {};
}

function ERPC_TaskCreator_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_TaskCreator = null;
var VisibleTKCForm = null;
var VisibleERPC_TaskGoalSetter = null;
var VisibleTKCGoalForm = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_TaskCreator = ReactRedux.connect(ERPC_TaskCreator_mapstatetoprops, ERPC_TaskCreator_dispatchtoprops)(ERPC_TaskCreator);
    VisibleTKCForm = ReactRedux.connect(TKCForm_mapstatetoprops, TKCForm_disptchtoprops)(TKCForm);
    VisibleERPC_TaskGoalSetter = ReactRedux.connect(ERPC_TaskGoalSetter_mapstatetoprops, ERPC_TaskGoalSetter_disptchtoprops)(ERPC_TaskGoalSetter);
    VisibleTKCGoalForm = ReactRedux.connect(TKCGoalForm_mapstatetoprops, TKCGoalForm_disptchtoprops)(TKCGoalForm);
});

function gPullTCKForm(retState) {
    setTimeout(function () {
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getTCKFormData' }, makeFTD_Prop('TaskCreatePage', 'Form0', 'records_arr', false), EFetchKey.FetchPropValue));
    }, 50);
    return retState;
}

function gFreshTCKForm(retState, records_arr) {
    simpleFreshFormFun(retState, records_arr, 'TaskCreatePage.Form0', gBindTCKForm);
}

function gBindTCKForm(retState, newIndex, oldIndex, statePath) {
    var Form0_path = 'TaskCreatePage.Form0';
    var formState = getStateByPath(retState, Form0_path, {});
    var records_arr = formState.records_arr;
    var needSetState = {};
    var bundle = {};
    var nowRecord = null;
    var useIndex = newIndex;
    needSetState['M_Dropdown_8.text'] = null;
    needSetState['M_Dropdown_0.text'] = null;
    needSetState['M_Dropdown_1.text'] = null;
    needSetState['M_Dropdown_2.text'] = null;
    needSetState['M_Dropdown_3.text'] = null;
    needSetState['M_Dropdown_4.text'] = null;
    needSetState['M_Dropdown_5.text'] = null;
    needSetState['M_Dropdown_6.text'] = null;
    needSetState['M_Dropdown_7.text'] = null;
    if (records_arr == null || newIndex == -1 || records_arr.length == 0) {
        var insertCache = getStateByPath(formState, 'insertCache');
        if (insertCache) {
            needSetState['M_Text_0.value'] = insertCache.M_Text_0_value;
            needSetState['M_Text_1.value'] = insertCache.M_Text_1_value;
            needSetState['M_Dropdown_8.text'] = insertCache.M_Dropdown_8_text;
            needSetState['M_Dropdown_8.value'] = insertCache.M_Dropdown_8_value;
            needSetState['M_Dropdown_0.text'] = insertCache.M_Dropdown_0_text;
            needSetState['M_Dropdown_0.value'] = insertCache.M_Dropdown_0_value;
            needSetState['M_Dropdown_1.text'] = insertCache.M_Dropdown_1_text;
            needSetState['M_Dropdown_1.value'] = insertCache.M_Dropdown_1_value;
            needSetState['M_Dropdown_2.text'] = insertCache.M_Dropdown_2_text;
            needSetState['M_Dropdown_2.value'] = insertCache.M_Dropdown_2_value;
            needSetState['M_Dropdown_3.text'] = insertCache.M_Dropdown_3_text;
            needSetState['M_Dropdown_3.value'] = insertCache.M_Dropdown_3_value;
            needSetState['M_Dropdown_4.text'] = insertCache.M_Dropdown_4_text;
            needSetState['M_Dropdown_4.value'] = insertCache.M_Dropdown_4_value;
            needSetState['M_Text_4.value'] = insertCache.M_Text_4_value;
            needSetState['M_CheckBox_0.value'] = insertCache.M_CheckBox_0_value;
            needSetState['M_Text_2.value'] = insertCache.M_Text_2_value;
            needSetState['M_Dropdown_5.text'] = insertCache.M_Dropdown_5_text;
            needSetState['M_Dropdown_5.value'] = insertCache.M_Dropdown_5_value;
            needSetState['M_CheckBox_1.value'] = insertCache.M_CheckBox_1_value;
            needSetState['M_Dropdown_6.text'] = insertCache.M_Dropdown_6_text;
            needSetState['M_Dropdown_6.value'] = insertCache.M_Dropdown_6_value;
            needSetState['M_Text_3.value'] = insertCache.M_Text_3_value;
            needSetState['M_Dropdown_7.text'] = insertCache.M_Dropdown_7_text;
            needSetState['M_Dropdown_7.value'] = insertCache.M_Dropdown_7_value;
        } else {
            needSetState['M_Text_0.value'] = null;
            needSetState['M_Text_1.value'] = null;
            needSetState['M_Dropdown_8.value'] = null;
            needSetState['M_Dropdown_0.value'] = null;
            needSetState['M_Dropdown_1.value'] = null;
            needSetState['M_Dropdown_2.value'] = null;
            needSetState['M_Dropdown_3.value'] = null;
            needSetState['M_Dropdown_4.value'] = null;
            needSetState['M_Text_4.value'] = null;
            needSetState['M_CheckBox_0.value'] = 0;
            needSetState['M_Text_2.value'] = null;
            needSetState['M_Dropdown_5.value'] = 4;
            needSetState['M_CheckBox_1.value'] = 0;
            needSetState['M_Dropdown_6.value'] = null;
            needSetState['M_Text_3.value'] = null;
            needSetState['M_Dropdown_7.value'] = 1;
            needSetState['M_Dropdown_0.value'] = g_envVar.userid;
            needSetState['M_Text_4.value'] = getFormatDateString(getNowDate());
            needSetState['M_Text_2.value'] = getFormatDateString(new Date(getNowDate().setDate(getNowDate().getDate() + 3)));
        }
        needSetState['button_2.visible'] = false;
        needSetState['button_1.visible'] = false;
        needSetState['button_0.visible'] = true;
    } else {
        nowRecord = records_arr[useIndex];
        bundle.M_Form_0_nowRecord = nowRecord;
        needSetState['M_Text_0.value'] = nowRecord['任务标题'];
        needSetState['M_Text_1.value'] = nowRecord['任务描述'];
        needSetState['M_Dropdown_8.value'] = nowRecord['任务所属类别代码'];
        needSetState['M_Dropdown_0.value'] = nowRecord['发起人员代码'];
        needSetState['M_Dropdown_1.value'] = nowRecord['执行人员代码'];
        needSetState['M_Dropdown_2.value'] = nowRecord['关联工作小组代码'];
        needSetState['M_Dropdown_3.value'] = nowRecord['关联项目代码'];
        needSetState['M_Dropdown_4.value'] = nowRecord['抄送人员明细'];
        needSetState['M_Text_4.value'] = nowRecord['开始日期'];
        needSetState['M_CheckBox_0.value'] = nowRecord['有无期限'];
        needSetState['M_Text_2.value'] = nowRecord['截止日期'];
        needSetState['M_Dropdown_5.value'] = nowRecord['汇报频率代码'];
        needSetState['M_CheckBox_1.value'] = nowRecord['是否周期任务'];
        needSetState['M_Dropdown_6.value'] = nowRecord['周期单位'];
        needSetState['M_Text_3.value'] = nowRecord['周期数值'];
        needSetState['M_Dropdown_7.value'] = nowRecord['重要程度代码'];
        needSetState['button_2.visible'] = true;
        needSetState['button_1.visible'] = true;
        needSetState['button_0.visible'] = false;
    }
    if (oldIndex == -1) {
        needSetState['insertCache.M_Text_0_value'] = getStateByPath(formState, 'M_Text_0.value');
        needSetState['insertCache.M_Text_1_value'] = getStateByPath(formState, 'M_Text_1.value');
        needSetState['insertCache.M_Dropdown_8_text'] = getStateByPath(formState, 'M_Dropdown_8.text');
        needSetState['insertCache.M_Dropdown_0_text'] = getStateByPath(formState, 'M_Dropdown_0.text');
        needSetState['insertCache.M_Dropdown_0_value'] = getStateByPath(formState, 'M_Dropdown_0.value');
        needSetState['insertCache.M_Dropdown_1_text'] = getStateByPath(formState, 'M_Dropdown_1.text');
        needSetState['insertCache.M_Dropdown_1_value'] = getStateByPath(formState, 'M_Dropdown_1.value');
        needSetState['insertCache.M_Dropdown_2_text'] = getStateByPath(formState, 'M_Dropdown_2.text');
        needSetState['insertCache.M_Dropdown_2_value'] = getStateByPath(formState, 'M_Dropdown_2.value');
        needSetState['insertCache.M_Dropdown_3_text'] = getStateByPath(formState, 'M_Dropdown_3.text');
        needSetState['insertCache.M_Dropdown_3_value'] = getStateByPath(formState, 'M_Dropdown_3.value');
        needSetState['insertCache.M_Dropdown_4_text'] = getStateByPath(formState, 'M_Dropdown_4.text');
        needSetState['insertCache.M_Dropdown_4_value'] = getStateByPath(formState, 'M_Dropdown_4.value');
        needSetState['insertCache.M_Text_4_value'] = getStateByPath(formState, 'M_Text_4.value');
        needSetState['insertCache.M_CheckBox_0_value'] = getStateByPath(formState, 'M_CheckBox_0.value');
        needSetState['insertCache.M_Text_2_value'] = getStateByPath(formState, 'M_Text_2.value');
        needSetState['insertCache.M_Dropdown_5_text'] = getStateByPath(formState, 'M_Dropdown_5.text');
        needSetState['insertCache.M_Dropdown_5_value'] = getStateByPath(formState, 'M_Dropdown_5.value');
        needSetState['insertCache.M_CheckBox_1_value'] = getStateByPath(formState, 'M_CheckBox_1.value');
        needSetState['insertCache.M_Dropdown_6_text'] = getStateByPath(formState, 'M_Dropdown_6.text');
        needSetState['insertCache.M_Dropdown_6_value'] = getStateByPath(formState, 'M_Dropdown_6.value');
        needSetState['insertCache.M_Text_3_value'] = getStateByPath(formState, 'M_Text_3.value');
        needSetState['insertCache.M_Dropdown_7_text'] = getStateByPath(formState, 'M_Dropdown_7.text');
        needSetState['insertCache.M_Dropdown_7_value'] = getStateByPath(formState, 'M_Dropdown_7.value');
    }
    needSetState['nowRecord'] = nowRecord;
    needSetState['invalidbundle'] = false;
    retState = setManyStateByPath(retState, Form0_path, needSetState);
    return retState;
}

var TKCForm = function (_React$PureComponent2) {
    _inherits(TKCForm, _React$PureComponent2);

    function TKCForm(props) {
        _classCallCheck(this, TKCForm);

        var _this2 = _possibleConstructorReturn(this, (TKCForm.__proto__ || Object.getPrototypeOf(TKCForm)).call(this, props));

        ERPC_PageForm(_this2);
        _this2.canInsert = true;

        autoBind(_this2);
        return _this2;
    }

    _createClass(TKCForm, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            gPullTCKForm();
            if (appStateChangedAct_map) {
                appStateChangedAct_map[this.props.fullPath + '.M_CheckBox_0.value'] = this.M_CheckBox_0_value_changed;
                appStateChangedAct_map[this.props.fullPath + '.M_CheckBox_1.value'] = this.M_CheckBox_1_value_changed;
            }
        }
    }, {
        key: "M_CheckBox_0_value_changed",
        value: function M_CheckBox_0_value_changed(state, newValue) {
            var needSetState = {};
            needSetState['M_LC_8.visible'] = newValue ? 1 : 0;
            return setManyStateByPath(state, this.props.fullPath, needSetState);
        }
    }, {
        key: "M_CheckBox_1_value_changed",
        value: function M_CheckBox_1_value_changed(state, newValue) {
            var needSetState = {};
            needSetState['M_LC_11.visible'] = newValue ? 1 : 0;
            needSetState['M_LC_12.visible'] = newValue ? 1 : 0;
            return setManyStateByPath(state, this.props.fullPath, needSetState);
        }
    }, {
        key: "doPullDropdown",
        value: function doPullDropdown(parentPath, dropdownid, action) {
            store.dispatch(fetchJsonPost(TaskServerURL, { action: action }, makeFTD_Prop(parentPath, dropdownid, 'options_arr', false), EFetchKey.FetchPropValue));
        }
    }, {
        key: "pull_M_Dropdown_0",
        value: function pull_M_Dropdown_0(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_0', 'get用系统的用户');
        }
    }, {
        key: "pull_M_Dropdown_1",
        value: function pull_M_Dropdown_1(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_1', 'get用系统的用户');
        }
    }, {
        key: "pull_M_Dropdown_2",
        value: function pull_M_Dropdown_2(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_2', 'get所属工作组List');
        }
    }, {
        key: "pull_M_Dropdown_3",
        value: function pull_M_Dropdown_3(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_3', 'get可用项目List');
        }
    }, {
        key: "pull_M_Dropdown_4",
        value: function pull_M_Dropdown_4(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_4', 'get用系统的用户');
        }
    }, {
        key: "pull_M_Dropdown_5",
        value: function pull_M_Dropdown_5(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_5', 'get汇报频率List');
        }
    }, {
        key: "pull_M_Dropdown_6",
        value: function pull_M_Dropdown_6(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_6', 'get周期单位List');
        }
    }, {
        key: "pull_M_Dropdown_7",
        value: function pull_M_Dropdown_7(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_7', 'get重要程度List');
        }
    }, {
        key: "pull_M_Dropdown_8",
        value: function pull_M_Dropdown_8(parentPath) {
            this.doPullDropdown(parentPath, 'M_Dropdown_8', 'get任务类别');
        }
    }, {
        key: "popupGoalSetter",
        value: function popupGoalSetter(任务名称, 任务代码, 小组名称) {
            if (gTaskGoalSetter == null) {
                gTaskGoalSetter = React.createElement(VisibleERPC_TaskGoalSetter, { ref: this.popPanelRef, selector: this, key: 'TaskGoalSetter' });
            }
            gDataCache.set('TaskGoalSetterentryParam', {
                任务名称: 任务名称,
                任务代码: 任务代码,
                小组名称: 小组名称,
                callBack: null
            });
            addFixedItem(gTaskGoalSetter);
        }
    }, {
        key: "insert_btn_onclick",
        value: function insert_btn_onclick(ev) {
            var _this3 = this;

            var state = store.getState();
            var M_Form_0_Path = this.props.fullPath;
            var M_Form_0_state = getStateByPath(state, M_Form_0_Path, {});
            var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
            var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
            var M_Text_0_value = M_Text_0_state.value;
            var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
            var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
            var M_Text_1_value = M_Text_1_state.value;
            var M_Dropdown_8_state = getStateByPath(M_Form_0_state, 'M_Dropdown_8', {});
            var M_LC_27_state = getStateByPath(M_Form_0_state, 'M_LC_27', {});
            var M_Dropdown_8_value = M_Dropdown_8_state.value;
            var M_Dropdown_0_state = getStateByPath(M_Form_0_state, 'M_Dropdown_0', {});
            var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
            var M_Dropdown_0_value = M_Dropdown_0_state.value;
            var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
            var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
            var M_Dropdown_1_value = M_Dropdown_1_state.value;
            var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
            var M_LC_4_state = getStateByPath(M_Form_0_state, 'M_LC_4', {});
            var M_Dropdown_2_value = M_Dropdown_2_state.value;
            var M_Dropdown_3_state = getStateByPath(M_Form_0_state, 'M_Dropdown_3', {});
            var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
            var M_Dropdown_3_value = M_Dropdown_3_state.value;
            var M_Dropdown_4_state = getStateByPath(M_Form_0_state, 'M_Dropdown_4', {});
            var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
            var M_Dropdown_4_value = M_Dropdown_4_state.value;
            var M_Text_4_state = getStateByPath(M_Form_0_state, 'M_Text_4', {});
            var M_LC_14_state = getStateByPath(M_Form_0_state, 'M_LC_14', {});
            var M_Text_4_value = M_Text_4_state.value;
            var M_CheckBox_0_state = getStateByPath(M_Form_0_state, 'M_CheckBox_0', {});
            var M_LC_7_state = getStateByPath(M_Form_0_state, 'M_LC_7', {});
            var M_CheckBox_0_value = M_CheckBox_0_state.value;
            var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
            var M_LC_8_state = getStateByPath(M_Form_0_state, 'M_LC_8', {});
            var M_Text_2_value = M_Text_2_state.value;
            var M_Dropdown_5_state = getStateByPath(M_Form_0_state, 'M_Dropdown_5', {});
            var M_LC_9_state = getStateByPath(M_Form_0_state, 'M_LC_9', {});
            var M_Dropdown_5_value = M_Dropdown_5_state.value;
            var M_CheckBox_1_state = getStateByPath(M_Form_0_state, 'M_CheckBox_1', {});
            var M_LC_10_state = getStateByPath(M_Form_0_state, 'M_LC_10', {});
            var M_CheckBox_1_value = M_CheckBox_1_state.value;
            var M_Dropdown_6_state = getStateByPath(M_Form_0_state, 'M_Dropdown_6', {});
            var M_LC_11_state = getStateByPath(M_Form_0_state, 'M_LC_11', {});
            var M_Dropdown_6_value = M_Dropdown_6_state.value;
            var M_Text_3_state = getStateByPath(M_Form_0_state, 'M_Text_3', {});
            var M_LC_12_state = getStateByPath(M_Form_0_state, 'M_LC_12', {});
            var M_Text_3_value = M_Text_3_state.value;
            var M_Dropdown_7_state = getStateByPath(M_Form_0_state, 'M_Dropdown_7', {});
            var M_LC_13_state = getStateByPath(M_Form_0_state, 'M_LC_13', {});
            var M_Dropdown_7_value = M_Dropdown_7_state.value;
            var validErr;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_9_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_9_msg) {
                        scriptBP_9_msg.setData(err.info, EMessageBoxType.Error, '提交');
                    } else {
                        SendToast(err.info, EToastType.Error);
                    }
                    return;
                }
                if (scriptBP_9_msg) {
                    scriptBP_9_msg.fireClose();
                }
                SendToast('执行成功');
            };
            validErr = BaseIsValueValid(state, M_LC_0_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_27_state, M_Dropdown_8_state, M_Dropdown_8_value, 'string', false, 'M_Dropdown_8', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_8.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_3_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_4_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_2.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_5_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_3.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_6_state, M_Dropdown_4_state, M_Dropdown_4_value, 'xml', true, 'M_Dropdown_4', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_4.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_14_state, M_Text_4_state, M_Text_4_value, 'date', false, 'M_Text_4', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_4.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_7_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_CheckBox_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_8_state, M_Text_2_state, M_Text_2_value, 'date', false, 'M_Text_2', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_9_state, M_Dropdown_5_state, M_Dropdown_5_value, 'string', false, 'M_Dropdown_5', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_5.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_10_state, M_CheckBox_1_state, M_CheckBox_1_value, 'string', false, 'M_CheckBox_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_CheckBox_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_11_state, M_Dropdown_6_state, M_Dropdown_6_value, 'string', false, 'M_Dropdown_6', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_6.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_12_state, M_Text_3_state, M_Text_3_value, 'float', false, 'M_Text_3', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_3.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_13_state, M_Dropdown_7_state, M_Dropdown_7_value, 'string', false, 'M_Dropdown_7', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_7.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            if (hadValidErr) {
                return callback_final(null, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'button_0_onclick';
            fetchTracer[fetchKey] = fetchid;
            var baseBundle = {};
            scriptBP_9_msg = PopMessageBox('', EMessageBoxType.Loading, '提交');
            var bundle_insert_table_0 = Object.assign({}, baseBundle, {
                M_Text_0_value: M_Text_0_value,
                M_Text_1_value: M_Text_1_value,
                M_Dropdown_8_value: M_Dropdown_8_value,
                M_Dropdown_0_value: M_Dropdown_0_value,
                M_Dropdown_1_value: M_Dropdown_1_value,
                M_Dropdown_2_value: M_Dropdown_2_value,
                M_Dropdown_3_value: M_Dropdown_3_value,
                M_Dropdown_4_value: M_Dropdown_4_value,
                M_CheckBox_0_value: M_CheckBox_0_value,
                M_Text_4_value: M_Text_4_value,
                M_Text_2_value: M_Text_2_value,
                M_Dropdown_5_value: M_Dropdown_5_value,
                M_CheckBox_1_value: M_CheckBox_1_value,
                M_Text_3_value: M_Text_3_value,
                M_Dropdown_6_value: M_Dropdown_6_value,
                M_Dropdown_7_value: M_Dropdown_7_value
            });
            store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_insert_table_0, action: 'createTask' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
                if (err_insert_table_0 == null) {
                    if (scriptBP_9_msg != null) {
                        scriptBP_9_msg.fireClose();
                    }
                    var self = _this3;
                    gPullTCKForm();
                    setTimeout(function () {
                        self.popupGoalSetter(M_Text_0_value, data_insert_table_0, M_Dropdown_2_state.text);
                    }, 50);
                } else {
                    return callback_final(state, data_insert_table_0, err_insert_table_0);
                }
            })));
        }
    }, {
        key: "modifybtn_onclick",
        value: function modifybtn_onclick(ev) {
            var _this4 = this;

            var state = store.getState();
            var M_Form_0_Path = this.props.fullPath;
            var M_Form_0_state = getStateByPath(state, M_Form_0_Path, {});
            var M_Form_0_nowRecord = M_Form_0_state.nowRecord;
            var M_Text_0_state = getStateByPath(M_Form_0_state, 'M_Text_0', {});
            var M_LC_0_state = getStateByPath(M_Form_0_state, 'M_LC_0', {});
            var M_Text_0_value = M_Text_0_state.value;
            var M_Text_1_state = getStateByPath(M_Form_0_state, 'M_Text_1', {});
            var M_LC_1_state = getStateByPath(M_Form_0_state, 'M_LC_1', {});
            var M_Text_1_value = M_Text_1_state.value;
            var M_Dropdown_8_state = getStateByPath(M_Form_0_state, 'M_Dropdown_8', {});
            var M_LC_27_state = getStateByPath(M_Form_0_state, 'M_LC_27', {});
            var M_Dropdown_8_value = M_Dropdown_8_state.value;
            var M_Dropdown_0_state = getStateByPath(M_Form_0_state, 'M_Dropdown_0', {});
            var M_LC_2_state = getStateByPath(M_Form_0_state, 'M_LC_2', {});
            var M_Dropdown_0_value = M_Dropdown_0_state.value;
            var M_Dropdown_1_state = getStateByPath(M_Form_0_state, 'M_Dropdown_1', {});
            var M_LC_3_state = getStateByPath(M_Form_0_state, 'M_LC_3', {});
            var M_Dropdown_1_value = M_Dropdown_1_state.value;
            var M_Dropdown_2_state = getStateByPath(M_Form_0_state, 'M_Dropdown_2', {});
            var M_LC_4_state = getStateByPath(M_Form_0_state, 'M_LC_4', {});
            var M_Dropdown_2_value = M_Dropdown_2_state.value;
            var M_Dropdown_3_state = getStateByPath(M_Form_0_state, 'M_Dropdown_3', {});
            var M_LC_5_state = getStateByPath(M_Form_0_state, 'M_LC_5', {});
            var M_Dropdown_3_value = M_Dropdown_3_state.value;
            var M_Dropdown_4_state = getStateByPath(M_Form_0_state, 'M_Dropdown_4', {});
            var M_LC_6_state = getStateByPath(M_Form_0_state, 'M_LC_6', {});
            var M_Dropdown_4_value = M_Dropdown_4_state.value;
            var M_Text_4_state = getStateByPath(M_Form_0_state, 'M_Text_4', {});
            var M_LC_14_state = getStateByPath(M_Form_0_state, 'M_LC_14', {});
            var M_Text_4_value = M_Text_4_state.value;
            var M_CheckBox_0_state = getStateByPath(M_Form_0_state, 'M_CheckBox_0', {});
            var M_LC_7_state = getStateByPath(M_Form_0_state, 'M_LC_7', {});
            var M_CheckBox_0_value = M_CheckBox_0_state.value;
            var M_Text_2_state = getStateByPath(M_Form_0_state, 'M_Text_2', {});
            var M_LC_8_state = getStateByPath(M_Form_0_state, 'M_LC_8', {});
            var M_Text_2_value = M_Text_2_state.value;
            var M_Dropdown_5_state = getStateByPath(M_Form_0_state, 'M_Dropdown_5', {});
            var M_LC_9_state = getStateByPath(M_Form_0_state, 'M_LC_9', {});
            var M_Dropdown_5_value = M_Dropdown_5_state.value;
            var M_CheckBox_1_state = getStateByPath(M_Form_0_state, 'M_CheckBox_1', {});
            var M_LC_10_state = getStateByPath(M_Form_0_state, 'M_LC_10', {});
            var M_CheckBox_1_value = M_CheckBox_1_state.value;
            var M_Dropdown_6_state = getStateByPath(M_Form_0_state, 'M_Dropdown_6', {});
            var M_LC_11_state = getStateByPath(M_Form_0_state, 'M_LC_11', {});
            var M_Dropdown_6_value = M_Dropdown_6_state.value;
            var M_Text_3_state = getStateByPath(M_Form_0_state, 'M_Text_3', {});
            var M_LC_12_state = getStateByPath(M_Form_0_state, 'M_LC_12', {});
            var M_Text_3_value = M_Text_3_state.value;
            var M_Dropdown_7_state = getStateByPath(M_Form_0_state, 'M_Dropdown_7', {});
            var M_LC_13_state = getStateByPath(M_Form_0_state, 'M_LC_13', {});
            var M_Dropdown_7_value = M_Dropdown_7_state.value;
            var validErr;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_12_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_12_msg) {
                        scriptBP_12_msg.setData(err.info, EMessageBoxType.Error, '提交修改');
                    } else {
                        SendToast(err.info, EToastType.Error);
                    }
                    return;
                }
                if (scriptBP_12_msg) {
                    scriptBP_12_msg.fireClose();
                }
                SendToast('执行成功');
            };
            if (IsEmptyString(M_Form_0_nowRecord)) {
                return callback_final(state, null, { info: gPreconditionInvalidInfo });
            }
            validErr = BaseIsValueValid(state, M_LC_0_state, M_Text_0_state, M_Text_0_value, 'string', false, 'M_Text_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_1_state, M_Text_1_state, M_Text_1_value, 'string', false, 'M_Text_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_27_state, M_Dropdown_8_state, M_Dropdown_8_value, 'string', false, 'M_Dropdown_8', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_8.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_2_state, M_Dropdown_0_state, M_Dropdown_0_value, 'string', false, 'M_Dropdown_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_3_state, M_Dropdown_1_state, M_Dropdown_1_value, 'string', false, 'M_Dropdown_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_4_state, M_Dropdown_2_state, M_Dropdown_2_value, 'string', false, 'M_Dropdown_2', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_2.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_5_state, M_Dropdown_3_state, M_Dropdown_3_value, 'string', false, 'M_Dropdown_3', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_3.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_6_state, M_Dropdown_4_state, M_Dropdown_4_value, 'xml', true, 'M_Dropdown_4', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_4.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_14_state, M_Text_4_state, M_Text_4_value, 'date', false, 'M_Text_4', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_4.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_7_state, M_CheckBox_0_state, M_CheckBox_0_value, 'string', false, 'M_CheckBox_0', validErrState);
            validErrState['M_Page_0.M_Form_0.M_CheckBox_0.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_8_state, M_Text_2_state, M_Text_2_value, 'date', false, 'M_Text_2', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_2.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_9_state, M_Dropdown_5_state, M_Dropdown_5_value, 'string', false, 'M_Dropdown_5', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_5.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_10_state, M_CheckBox_1_state, M_CheckBox_1_value, 'string', false, 'M_CheckBox_1', validErrState);
            validErrState['M_Page_0.M_Form_0.M_CheckBox_1.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_11_state, M_Dropdown_6_state, M_Dropdown_6_value, 'string', false, 'M_Dropdown_6', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_6.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_12_state, M_Text_3_state, M_Text_3_value, 'float', false, 'M_Text_3', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Text_3.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            validErr = BaseIsValueValid(state, M_LC_13_state, M_Dropdown_7_state, M_Dropdown_7_value, 'string', false, 'M_Dropdown_7', validErrState);
            validErrState['M_Page_0.M_Form_0.M_Dropdown_7.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            if (hadValidErr) {
                return callback_final(null, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'button_2_onclick';
            fetchTracer[fetchKey] = fetchid;
            var baseBundle = {};
            scriptBP_12_msg = PopMessageBox('', EMessageBoxType.Loading, '提交修改');
            var bundle_update_table_0 = Object.assign({}, baseBundle, {
                M_Form_0_nowRecord: M_Form_0_nowRecord,
                M_Text_0_value: M_Text_0_value,
                M_Text_1_value: M_Text_1_value,
                M_Dropdown_8_value: M_Dropdown_8_value,
                M_Dropdown_0_value: M_Dropdown_0_value,
                M_Dropdown_1_value: M_Dropdown_1_value,
                M_Dropdown_2_value: M_Dropdown_2_value,
                M_Dropdown_3_value: M_Dropdown_3_value,
                M_Dropdown_4_value: M_Dropdown_4_value,
                M_CheckBox_0_value: M_CheckBox_0_value,
                M_Text_4_value: M_Text_4_value,
                M_Text_2_value: M_Text_2_value,
                M_Dropdown_5_value: M_Dropdown_5_value,
                M_CheckBox_1_value: M_CheckBox_1_value,
                M_Text_3_value: M_Text_3_value,
                M_Dropdown_6_value: M_Dropdown_6_value,
                M_Dropdown_7_value: M_Dropdown_7_value
            });
            store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_update_table_0, action: 'modifyTask' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
                if (err_update_table_0 == null) {
                    if (scriptBP_12_msg != null) {
                        scriptBP_12_msg.fireClose();
                    }
                    var self = _this4;
                    setTimeout(function () {
                        self.popupGoalSetter(M_Text_0_value, M_Form_0_nowRecord['工作任务记录代码'], M_Dropdown_2_state.text);
                    }, 50);
                } else {
                    return callback_final(state, data_update_table_0, err_update_table_0);
                }
            })));
        }
    }, {
        key: "deletebtn_onclick",
        value: function deletebtn_onclick(ev) {
            var state = store.getState();
            var M_Form_0_Path = this.props.fullPath;
            var M_Form_0_state = getStateByPath(state, M_Form_0_Path, {});
            var M_Form_0_nowRecord = M_Form_0_state.nowRecord;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_11_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_11_msg) {
                        scriptBP_11_msg.setData(err.info, EMessageBoxType.Error, '撤销此任务');
                    } else {
                        SendToast(err.info, EToastType.Error);
                    }
                    return;
                }
                if (scriptBP_11_msg) {
                    scriptBP_11_msg.fireClose();
                }
                SendToast('执行成功');
            };
            if (IsEmptyString(M_Form_0_nowRecord)) {
                return callback_final(state, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'button_1_onclick';
            fetchTracer[fetchKey] = fetchid;

            scriptBP_11_msg = PopMessageBox('', EMessageBoxType.Loading, '撤销此任务');
            var bundle_excute_pro_0 = {
                M_Form_0_nowRecord: M_Form_0_nowRecord
            };
            store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_excute_pro_0, action: 'repealTask' }, makeFTD_Callback(function (state, excute_pro_0_ret, error_excute_pro_0) {
                if (error_excute_pro_0) {
                    return callback_final(state, null, error_excute_pro_0);
                }
                setTimeout(function () {
                    gPullTCKForm();
                }, 50);
                var ret = callback_final(state, excute_pro_0_ret.output.执行成功, null);
                return ret == null ? state : ret;
            }, false)));
        }
    }, {
        key: "render",
        value: function render() {
            var retElem = null;
            if (this.props.fetching) {
                retElem = renderFetcingTipDiv();
            } else {
                if (this.props.fetchingErr) {
                    retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
                } else {
                    if (this.props.invalidbundle) {
                        retElem = renderInvalidBundleDiv();
                    } else {
                        if (!this.canInsert && this.props.nowRecord == null) {
                            retElem = React.createElement(
                                "div",
                                { className: "m-auto" },
                                "\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
                            );
                        } else {
                            retElem = React.createElement(
                                "div",
                                { className: "d-flex flex-column d-flex flex-grow-0 flex-shrink-0 erp-form flex-column " },
                                this.props.title && React.createElement(
                                    "div",
                                    { className: "bg-dark text-light justify-content-center d-flex flex-shrink-0" },
                                    React.createElement(
                                        "span",
                                        null,
                                        this.props.title
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "d-flex flex-grow-1  flex-column" },
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_0", parentPath: this.props.fullPath, label: "\u4EFB\u52A1\u6807\u9898" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_0", parentPath: this.props.fullPath, type: "string", linetype: "single" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_1", parentPath: this.props.fullPath, label: "\u4EFB\u52A1\u63CF\u8FF0" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_1", parentPath: this.props.fullPath, type: "string", linetype: "1x" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_27", parentPath: this.props.fullPath, label: "\u4EFB\u52A1\u7C7B\u522B" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_8", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: this.pull_M_Dropdown_8, textAttrName: "\u4EFB\u52A1\u6240\u5C5E\u7C7B\u522B", valueAttrName: "\u4EFB\u52A1\u6240\u5C5E\u7C7B\u522B\u4EE3\u7801", label: "\u4EFB\u52A1\u7C7B\u522B" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_2", parentPath: this.props.fullPath, label: "\u53D1\u8D77\u4EBA" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: this.pull_M_Dropdown_0, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u53D1\u8D77\u4EBA" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_3", parentPath: this.props.fullPath, label: "\u6267\u884C\u4EBA" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: this.pull_M_Dropdown_1, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u6267\u884C\u4EBA", recentCookieKey: "task-executor" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_4", parentPath: this.props.fullPath, label: "\u5173\u8054\u5DE5\u4F5C\u5C0F\u7EC4" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_2", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: this.pull_M_Dropdown_2, textAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u540D\u79F0", valueAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u4EE3\u7801", label: "\u5173\u8054\u5DE5\u4F5C\u5C0F\u7EC4" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_5", parentPath: this.props.fullPath, label: "\u5173\u8054\u9879\u76EE" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_3", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u9879\u76EE\u8FD0\u884C\u9636\u6BB5", pullDataSource: this.pull_M_Dropdown_3, textAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0", valueAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0\u4EE3\u7801", label: "\u5173\u8054\u9879\u76EE", recentCookieKey: "project" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_6", parentPath: this.props.fullPath, label: "\u6284\u9001\u4EBA\u5458" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_4", parentPath: this.props.fullPath, textType: "xml", multiselect: true, pullOnce: true, nullable: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: this.pull_M_Dropdown_4, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u6284\u9001\u4EBA\u5458" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_14", parentPath: this.props.fullPath, label: "\u5F00\u59CB\u65E5\u671F" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_4", parentPath: this.props.fullPath, type: "date" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_7", parentPath: this.props.fullPath, label: "\u6709\u65E0\u671F\u9650" },
                                        React.createElement(VisibleERPC_CheckBox, { id: "M_CheckBox_0", parentPath: this.props.fullPath })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_8", parentPath: this.props.fullPath, label: "\u622A\u6B62\u65E5\u671F" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_2", parentPath: this.props.fullPath, type: "date" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_9", parentPath: this.props.fullPath, label: "\u6C47\u62A5\u9891\u7387" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_5", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: this.pull_M_Dropdown_5, textAttrName: "\u6C47\u62A5\u9891\u7387\u540D\u79F0", valueAttrName: "\u4EFB\u52A1\u6C47\u62A5\u9891\u7387\u4EE3\u7801", label: "\u6C47\u62A5\u9891\u7387" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_10", parentPath: this.props.fullPath, label: "\u662F\u5426\u5468\u671F\u4EFB\u52A1" },
                                        React.createElement(VisibleERPC_CheckBox, { id: "M_CheckBox_1", parentPath: this.props.fullPath })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_11", parentPath: this.props.fullPath, label: "\u5468\u671F\u5355\u4F4D" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_6", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: this.pull_M_Dropdown_6, textAttrName: "\u5468\u671F\u5355\u4F4D", valueAttrName: "\u4EFB\u52A1\u5468\u671F\u5355\u4F4D\u4EE3\u7801", label: "\u5468\u671F\u5355\u4F4D" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_12", parentPath: this.props.fullPath, label: "\u5468\u671F\u6570\u503C" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_3", parentPath: this.props.fullPath, type: "float", precision: "1" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_13", parentPath: this.props.fullPath, label: "\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_7", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: this.pull_M_Dropdown_7, textAttrName: "\u91CD\u8981\u7A0B\u5EA6\u540D\u79F0", valueAttrName: "\u4EFB\u52A1\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801", label: "\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-primary erp-control ", id: "button_2", parentPath: this.props.fullPath, onClick: this.modifybtn_onclick },
                                        "\u63D0\u4EA4\u4FEE\u6539"
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-warning erp-control ", id: "button_1", parentPath: this.props.fullPath, onClick: this.deletebtn_onclick },
                                        "\u64A4\u9500\u6B64\u4EFB\u52A1"
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-primary erp-control ", id: "button_0", parentPath: this.props.fullPath, onClick: this.insert_btn_onclick },
                                        "\u63D0\u4EA4"
                                    )
                                ),
                                this.renderNavigater()
                            );
                        }
                    }
                }
            }
            return retElem;
        }
    }]);

    return TKCForm;
}(React.PureComponent);

function TKCForm_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    return retProps;
}
function TKCForm_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}

var ERPC_TaskGoalSetter = function (_React$PureComponent3) {
    _inherits(ERPC_TaskGoalSetter, _React$PureComponent3);

    function ERPC_TaskGoalSetter(props) {
        _classCallCheck(this, ERPC_TaskGoalSetter);

        var _this5 = _possibleConstructorReturn(this, (ERPC_TaskGoalSetter.__proto__ || Object.getPrototypeOf(ERPC_TaskGoalSetter)).call(this, props));

        autoBind(_this5);
        _this5.contentDivRef = React.createRef();
        _this5.inited = false;
        _this5.formStyle = {
            maxWidth: '1024px',
            margin: 'auto'
        };
        return _this5;
    }

    _createClass(ERPC_TaskGoalSetter, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            var self = this;
            setTimeout(function () {
                self.inited = true;
            }, 50);
            if (appStateChangedAct_map) {
                appStateChangedAct_map['TaskCreatePage.Form1.records_arr'] = gFreshTCKGoalForm;
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.inited = false;
        }
    }, {
        key: "clickCloseHandler",
        value: function clickCloseHandler(ev) {
            removeFixedItem(gTaskGoalSetter);
        }
    }, {
        key: "clickNextHandler",
        value: function clickNextHandler(ev) {
            var scriptBP_18_msg = null;
            var 任务代码 = getPageEntryParam('TaskGoalSetter', '任务代码', 0);
            var 任务名称 = getPageEntryParam('TaskGoalSetter', '任务名称', 0);
            var 小组名称 = getPageEntryParam('TaskGoalSetter', '小组名称', 0);
            var callback_final = function callback_final(state, data, err) {
                if (err) {
                    if (scriptBP_18_msg) {
                        scriptBP_18_msg.setData(err.info, EMessageBoxType.Error, '修改');
                    }
                    return;
                }
                if (scriptBP_18_msg) {
                    scriptBP_18_msg.fireClose();
                }
                removeFixedItem(gTaskGoalSetter);
                removeFixedItem(gTaskCreator);
                if (gWorkingTaskSelector) {
                    gWorkingTaskSelector.taskConfirmed(state, 任务代码, 任务名称, 小组名称);
                };
            };

            scriptBP_18_msg = PopMessageBox('', EMessageBoxType.Loading, '完成任务创建');
            var bundle = {
                任务代码: 任务代码
            };
            store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle, action: 'comfirmTask' }, makeFTD_Callback(function (state, data, err) {
                if (err == null) {
                    return callback_final(state, data, err);
                } else {
                    return callback_final(state, data, err);
                }
            })));
        }
    }, {
        key: "renderHead",
        value: function renderHead() {
            return React.createElement(
                "div",
                { className: "d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader" },
                React.createElement(
                    "button",
                    { className: "btn btn-primary erp-control", onClick: this.clickCloseHandler },
                    React.createElement("i", { className: "fa fa-arrow-left" }),
                    "\u8BBE\u5B9A\u76EE\u6807"
                ),
                React.createElement("span", { className: "flex-grow-1 flex-shrink-1" }),
                React.createElement(
                    "button",
                    { className: "btn btn-primary erp-control", onClick: this.clickNextHandler },
                    "\u4E0B\u4E00\u6B65"
                )
            );
        }
    }, {
        key: "renderContent",
        value: function renderContent() {
            var retElem = null;
            retElem = React.createElement(
                "div",
                { className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column " },
                React.createElement(
                    "h3",
                    { className: "flex-grow-0 flex-shrink-0" },
                    this.props.label,
                    "\u7684\u4EFB\u52A1\u76EE\u6807"
                ),
                React.createElement(VisibleERPC_Label, { className: "bg-dark text-light erp-control ", id: "M_Label_4", parentPath: "TaskCreatePage", type: "string", text: "\u5DF2\u4E3A\u4F60\u521B\u5EFA\u4E86\u4E00\u4E2A\u9ED8\u8BA4\u76EE\u6807\uFF0C\u53EF\u4EE5\u76F4\u63A5\u4E0B\u4E00\u6B65\u3002" }),
                React.createElement(VisibleTKCGoalForm, { id: "Form1", parentPath: "TaskCreatePage", pagebreak: false, reBindAT: "ReBindM_Form_1Page" })
            );
            return retElem;
        }
    }, {
        key: "render",
        value: function render() {
            var retElem = null;
            retElem = React.createElement(
                "div",
                { className: "fixedBackGround" },
                React.createElement(
                    "div",
                    { className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100 bg-light", style: this.formStyle },
                    this.renderHead(),
                    this.renderContent()
                )
            );
            return retElem;
        }
    }]);

    return ERPC_TaskGoalSetter;
}(React.PureComponent);

function ERPC_TaskGoalSetter_mapstatetoprops(state, ownprops) {
    var retProps = {
        label: getPageEntryParam('TaskGoalSetter', '任务名称', '未知')
    };
    return retProps;
}
function ERPC_TaskGoalSetter_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}

function gPullTCKGoalForm(retState) {
    setTimeout(function () {
        var 任务代码 = getPageEntryParam('TaskGoalSetter', '任务代码', 0);
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'get任务目标', taskid: 任务代码 }, makeFTD_Prop('TaskCreatePage', 'Form1', 'records_arr', false), EFetchKey.FetchPropValue));
    }, 50);
    return retState;
}

function gFreshTCKGoalForm(retState, records_arr, oldValue, statePath) {
    var formPath = 'TaskCreatePage.Form1';
    var formState = getStateByPath(retState, formPath);
    var needSetState = {};
    needSetState['row_new.M_Text_7.value'] = null;
    needSetState['invalidbundle'] = false;
    var records_arr = formState.records_arr;
    var startRowIndex = 0;
    var endRowIndex = records_arr.length - 1;
    for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
        var nowRecord = records_arr[rowIndex];
        needSetState['row_' + rowIndex + '.M_Text_7.value'] = nowRecord['目标描述'];
    }
    needSetState.startRowIndex = startRowIndex;
    needSetState.endRowIndex = endRowIndex;
    return setManyStateByPath(retState, formPath, needSetState);
}

var TKCGoalForm = function (_React$PureComponent4) {
    _inherits(TKCGoalForm, _React$PureComponent4);

    function TKCGoalForm(props) {
        _classCallCheck(this, TKCGoalForm);

        var _this6 = _possibleConstructorReturn(this, (TKCGoalForm.__proto__ || Object.getPrototypeOf(TKCGoalForm)).call(this, props));

        ERPC_GridForm(_this6);
        _this6.tableBodyScroll = _this6.tableBodyScroll.bind(_this6);
        _this6.btns = [{ key: 'edit', content: React.createElement("i", { className: "fa fa-edit" }), handler: _this6.onUpdate.bind(_this6) }, { key: 'delete', content: React.createElement("i", { className: "fa fa-trash text-danger" }), handler: _this6.onDelete.bind(_this6) }];
        _this6.state = {};
        return _this6;
    }

    _createClass(TKCGoalForm, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            gPullTCKGoalForm();
            if (appStateChangedAct_map) {
                //appStateChangedAct_map[this.props.fullPath + '.M_CheckBox_0.value'] = this.M_CheckBox_0_value_changed;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var retElem = null;
            retElem = this.renderContent();
            return retElem;
        }
    }, {
        key: "tableBodyScroll",
        value: function tableBodyScroll(ev) {
            document.getElementById('M_Form_1tableheader').scrollLeft = ev.target.scrollLeft;
        }
    }, {
        key: "renderContent",
        value: function renderContent() {
            var retElem = null;
            var navElem = null;
            if (this.props.fetching) {
                retElem = renderFetcingTipDiv();
            } else {
                if (this.props.fetchingErr) {
                    retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
                } else {
                    if (this.props.invalidbundle) {
                        retElem = renderInvalidBundleDiv();
                    } else {
                        if (this.state.hadNewRow != true && !this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
                            retElem = React.createElement(
                                "div",
                                { className: "m-auto" },
                                "\u6CA1\u6709\u67E5\u8BE2\u5230\u6570\u636E"
                            );
                        } else {
                            retElem = React.createElement(TKCGoalForm_TBody, { startRowIndex: this.props.startRowIndex, endRowIndex: this.props.endRowIndex, fullPath: this.props.fullPath, form: this, hadNewRow: this.state.hadNewRow });
                            if (this.props.pagebreak) {
                                navElem = React.createElement(CBaseGridFormNavBar, { pageIndex: this.props.pageIndex, rowPerPage: this.props.rowPerPage, rowPerPageChangedHandler: this.rowPerPageChangedHandler, pageCount: this.props.pageCount, prePageClickHandler: this.prePageClickHandler, nxtPageClickHandler: this.nxtPageClickHandler, pageIndexChangedHandler: this.pageIndexChangedHandler });
                            }
                        }
                    }
                }
            }
            return React.createElement(
                "div",
                { ref: this.rootRef, className: "flex-grow-1 flex-shrink-1 d-flex erp-form flex-column " },
                this.props.title && React.createElement(
                    "div",
                    { className: "bg-dark text-light justify-content-center d-flex flex-shrink-0" },
                    React.createElement(
                        "span",
                        null,
                        this.props.title
                    )
                ),
                React.createElement(
                    "div",
                    { id: "M_Form_1tableheader", className: "mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv" },
                    React.createElement(
                        "table",
                        { className: "table", style: TCKGoalTableStyle1 },
                        React.createElement(TKCGoalForm_THead, null),
                        React.createElement(TKCGoalForm_THeadBody, { form: this })
                    )
                ),
                React.createElement(
                    "div",
                    { onScroll: this.tableBodyScroll, className: "mw-100 autoScroll" },
                    retElem,
                    !this.state.hadNewRow && React.createElement(
                        "button",
                        { onClick: this.clickNewRowHandler, type: "button", className: "btn btn-success" },
                        React.createElement("i", { className: "fa fa-plus" }),
                        "\u65B0\u589E"
                    )
                ),
                navElem
            );
        }
    }, {
        key: "onUpdate",
        value: function onUpdate(rowIndex, callBack) {
            var state = store.getState();
            var M_Form_1_path = this.props.fullPath;
            var M_Form_1_state = getStateByPath(state, this.props.fullPath);
            var M_Form_1_nowRecord = M_Form_1_state.records_arr[rowIndex];
            var M_Form_1_rowState = M_Form_1_state['row_' + rowIndex];
            var M_Text_7_state = getStateByPath(M_Form_1_rowState, 'M_Text_7', {});
            var M_LC_17_state = getStateByPath(M_Form_1_rowState, 'M_LC_17', {});
            var M_Text_7_value = M_Text_7_state.value;
            var validErr;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_18_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_18_msg) {
                        scriptBP_18_msg.setData(err.info, EMessageBoxType.Error, '修改');
                    }
                    return;
                }
                if (scriptBP_18_msg) {
                    scriptBP_18_msg.fireClose();
                }
                if (err == null && callBack != null) {
                    callBack(state);
                }
            };
            if (IsEmptyString(M_Form_1_nowRecord)) {
                return callback_final(state, null, { info: gPreconditionInvalidInfo });
            }
            validErr = BaseIsValueValid(state, M_LC_17_state, M_Text_7_state, M_Text_7_value, 'string', false, 'M_Text_7', validErrState);
            validErrState['TaskCreatePage.Form1.row_' + rowIndex + '.M_Text_7.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            if (hadValidErr) {
                return callback_final(null, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'M_Form_1_修改_' + rowIndex;
            fetchTracer[fetchKey] = fetchid;
            var baseBundle = {};
            scriptBP_18_msg = PopMessageBox('', EMessageBoxType.Loading, '修改');
            var bundle_update_table_0 = Object.assign({}, baseBundle, {
                M_Form_1_nowRecord: M_Form_1_nowRecord,
                M_Text_7_value: M_Text_7_value
            });
            store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_update_table_0, action: 'modifyTaskGoal' }, makeFTD_Callback(function (state, data_update_table_0, err_update_table_0) {
                if (err_update_table_0 == null) {
                    return callback_final(state, data_update_table_0, err_update_table_0);
                } else {
                    return callback_final(state, data_update_table_0, err_update_table_0);
                }
            })));
        }
    }, {
        key: "onDelete",
        value: function onDelete(rowIndex, callBack) {
            var state = store.getState();
            var M_Form_1_path = this.props.fullPath;
            var M_Form_1_state = getStateByPath(state, this.props.fullPath);
            var M_Form_1_nowRecord = M_Form_1_state.records_arr[rowIndex];
            var validErr;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_19_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_19_msg) {
                        scriptBP_19_msg.setData(err.info, EMessageBoxType.Error, '删除');
                    }
                    return;
                }
                if (scriptBP_19_msg) {
                    scriptBP_19_msg.fireClose();
                }
                if (err == null && callBack != null) {
                    callBack(state);
                }
            };
            if (IsEmptyString(M_Form_1_nowRecord)) {
                return callback_final(state, null, { info: gPreconditionInvalidInfo });
            }
            if (hadValidErr) {
                return callback_final(null, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'M_Form_1_删除_' + rowIndex;
            fetchTracer[fetchKey] = fetchid;
            var baseBundle = {};
            scriptBP_19_msg = PopMessageBox('', EMessageBoxType.Loading, '删除');
            scriptBP_19_msg.query('确认删除 目标:' + M_Form_1_nowRecord.目标描述, [{ label: '确认', key: '确认' }, { label: '取消', key: '取消' }], function (popmessagebox_0_key) {
                if (popmessagebox_0_key == '确认') {
                    var bundle_delete_table_0 = Object.assign({}, baseBundle, {
                        M_Form_1_nowRecord: M_Form_1_nowRecord
                    });
                    store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_delete_table_0, action: 'deleteTaskGoal' }, makeFTD_Callback(function (state, data_delete_table_0, err_delete_table_0) {
                        if (err_delete_table_0 == null) {
                            setTimeout(function () {
                                gPullTCKGoalForm();
                            }, 50);
                            var ret = callback_final(state, data_delete_table_0, null);
                            return ret == null ? state : ret;
                        } else {
                            return callback_final(state, data_delete_table_0, err_delete_table_0);
                        }
                    })));
                }
                if (popmessagebox_0_key == '取消') {
                    scriptBP_19_msg.fireClose();
                }
            });
        }
    }, {
        key: "submitInsert",
        value: function submitInsert(callBack) {
            var M_Page_1_任务代码 = getPageEntryParam('TaskGoalSetter', '任务代码', 0);
            var state = store.getState();
            var rowIndex = 'new';
            var M_Form_1_path = this.props.fullPath;
            var M_Form_1_state = getStateByPath(state, this.props.fullPath);
            var M_Form_1_rowState = M_Form_1_state['row_' + rowIndex];
            var M_Text_7_state = getStateByPath(M_Form_1_rowState, 'M_Text_7', {});
            var M_LC_17_state = getStateByPath(M_Form_1_rowState, 'M_LC_17', {});
            var M_Text_7_value = M_Text_7_state.value;
            var validErr;
            var hadValidErr = false;
            var validErrState = {};
            var scriptBP_17_msg = null;
            var callback_final = function callback_final(state, data, err) {
                if (state == null) {
                    store.dispatch(makeAction_setManyStateByPath(validErrState, ''));
                } else {
                    setManyStateByPath(state, '', validErrState);
                }
                if (hadValidErr) {
                    SendToast('验证失败，无法执行', EToastType.Warning);return;
                }
                if (err) {
                    if (scriptBP_17_msg) {
                        scriptBP_17_msg.setData(err.info, EMessageBoxType.Error, '新增');
                    }
                    return;
                }
                if (scriptBP_17_msg) {
                    scriptBP_17_msg.fireClose();
                }
                if (err == null && callBack != null) {
                    callBack(state);
                }
            };
            validErr = BaseIsValueValid(state, M_LC_17_state, M_Text_7_state, M_Text_7_value, 'string', false, 'M_Text_7', validErrState);
            validErrState['TaskCreatePage.Form1.row_' + rowIndex + '.M_Text_7.invalidInfo'] = validErr;
            if (validErr != null) hadValidErr = true;
            if (hadValidErr) {
                return callback_final(null, null, { info: gPreconditionInvalidInfo });
            }
            var fetchid = Math.round(Math.random() * 999999);
            var fetchKey = 'M_Form_1_新增_' + rowIndex;
            fetchTracer[fetchKey] = fetchid;
            var baseBundle = {};
            scriptBP_17_msg = PopMessageBox('', EMessageBoxType.Loading, '新增');
            if (M_Page_1_任务代码 != 0) {
                var bundle_insert_table_0 = Object.assign({}, baseBundle, {
                    M_Page_1_任务代码: M_Page_1_任务代码,
                    M_Text_7_value: M_Text_7_value
                });
                store.dispatch(fetchJsonPost(TaskServerURL, { bundle: bundle_insert_table_0, action: 'createTaskGoal' }, makeFTD_Callback(function (state, data_insert_table_0, err_insert_table_0) {
                    if (err_insert_table_0 == null) {
                        setTimeout(function () {
                            gPullTCKGoalForm();
                        }, 50);
                        var ret = callback_final(state, data_insert_table_0, null);
                        return ret == null ? state : ret;
                    } else {
                        return callback_final(state, data_insert_table_0, err_insert_table_0);
                    }
                })));
            }
        }
    }]);

    return TKCGoalForm;
}(React.PureComponent);

function TKCGoalForm_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.startRowIndex = ctlState.startRowIndex;
    retProps.endRowIndex = ctlState.endRowIndex;
    retProps.pageCount = ctlState.pageCount;
    retProps.pageIndex = ctlState.pageIndex;
    retProps.rowPerPage = ctlState.rowPerPage;
    retProps.selectMode = 'single';
    retProps.selectedRows_arr = ctlState.selectedRows_arr == null ? gEmptyArr : ctlState.selectedRows_arr;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    retProps.selectMode = 'single';
    return retProps;
}
function TKCGoalForm_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}

var TCKGoalTdstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "minWidth": "89.6%", "verticalAlign": "middle" };
var TCKGoalTableStyle = { "marginTop": "-50px" };
var TCKGoalTableStyle1 = { "marginBottom": "0px" };

var TKCGoalForm_THead = function (_React$PureComponent5) {
    _inherits(TKCGoalForm_THead, _React$PureComponent5);

    function TKCGoalForm_THead(props) {
        _classCallCheck(this, TKCGoalForm_THead);

        return _possibleConstructorReturn(this, (TKCGoalForm_THead.__proto__ || Object.getPrototypeOf(TKCGoalForm_THead)).call(this, props));
    }

    _createClass(TKCGoalForm_THead, [{
        key: "render",
        value: function render() {
            var retElem = null;
            return React.createElement(
                "thead",
                { className: "thead-dark" },
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "th",
                        { scope: "col", className: "indexTableHeader" },
                        "\u5E8F\u53F7"
                    ),
                    React.createElement(
                        "th",
                        { style: TCKGoalTdstyle0 },
                        "\u76EE\u6807\u63CF\u8FF0"
                    ),
                    React.createElement("th", { scope: "col" })
                )
            );
            return retElem;
        }
    }]);

    return TKCGoalForm_THead;
}(React.PureComponent);

var TKCGoalForm_TBody = function (_React$PureComponent6) {
    _inherits(TKCGoalForm_TBody, _React$PureComponent6);

    function TKCGoalForm_TBody(props) {
        _classCallCheck(this, TKCGoalForm_TBody);

        return _possibleConstructorReturn(this, (TKCGoalForm_TBody.__proto__ || Object.getPrototypeOf(TKCGoalForm_TBody)).call(this, props));
    }

    _createClass(TKCGoalForm_TBody, [{
        key: "render",
        value: function render() {
            var retElem = null;
            var trElems_arr = [];
            var startRowIndex = this.props.startRowIndex;
            var endRowIndex = this.props.endRowIndex;
            for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
                trElems_arr.push(React.createElement(
                    "tr",
                    { key: rowIndex },
                    React.createElement(
                        "td",
                        { className: "indexTableHeader" },
                        rowIndex + 1
                    ),
                    React.createElement(
                        "td",
                        { style: TCKGoalTdstyle0 },
                        React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_7", parentPath: this.props.fullPath, type: "string", linetype: "1x" })
                    ),
                    React.createElement(
                        "td",
                        null,
                        React.createElement(VisibleERPC_GridForm_BtnCol, { rowIndex: rowIndex, form: this.props.form })
                    )
                ));
            }
            if (this.props.hadNewRow) {
                rowIndex = 'new';
                trElems_arr.push(React.createElement(
                    "tr",
                    { key: rowIndex },
                    React.createElement(
                        "td",
                        { className: "indexTableHeader" },
                        "\u65B0"
                    ),
                    React.createElement(
                        "td",
                        { style: TCKGoalTdstyle0 },
                        React.createElement(VisibleERPC_Text, { rowIndex: rowIndex, id: "M_Text_7", parentPath: this.props.fullPath, type: "string", linetype: "1x" })
                    ),
                    React.createElement(
                        "td",
                        null,
                        React.createElement(VisibleERPC_GridForm_BtnCol, { rowIndex: rowIndex, form: this.props.form })
                    )
                ));
            }
            return React.createElement(
                "table",
                { className: "table table-striped table-hover ", style: TCKGoalTableStyle },
                React.createElement(TKCGoalForm_THead, null),
                React.createElement(
                    "tbody",
                    null,
                    trElems_arr
                )
            );
        }
    }]);

    return TKCGoalForm_TBody;
}(React.PureComponent);

var TKCGoalForm_THeadBody = function (_React$PureComponent7) {
    _inherits(TKCGoalForm_THeadBody, _React$PureComponent7);

    function TKCGoalForm_THeadBody(props) {
        _classCallCheck(this, TKCGoalForm_THeadBody);

        return _possibleConstructorReturn(this, (TKCGoalForm_THeadBody.__proto__ || Object.getPrototypeOf(TKCGoalForm_THeadBody)).call(this, props));
    }

    _createClass(TKCGoalForm_THeadBody, [{
        key: "render",
        value: function render() {
            var retElem = null;
            retElem = React.createElement(
                "tbody",
                null,
                React.createElement(
                    "tr",
                    null,
                    React.createElement("td", { className: "indexTableHeader" }),
                    React.createElement("td", { style: TCKGoalTdstyle0 }),
                    React.createElement(
                        "td",
                        null,
                        React.createElement(VisibleERPC_GridForm_BtnCol, { form: this.props.form })
                    )
                )
            );
            return retElem;
        }
    }]);

    return TKCGoalForm_THeadBody;
}(React.PureComponent);