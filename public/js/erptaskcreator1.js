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

var ERPC_TaskCreator = function (_React$PureComponent) {
    _inherits(ERPC_TaskCreator, _React$PureComponent);

    function ERPC_TaskCreator(props) {
        _classCallCheck(this, ERPC_TaskCreator);

        var _this = _possibleConstructorReturn(this, (ERPC_TaskCreator.__proto__ || Object.getPrototypeOf(ERPC_TaskCreator)).call(this, props));

        autoBind(_this);
        _this.contentDivRef = React.createRef();
        _this.inited = false;
        return _this;
    }

    _createClass(ERPC_TaskCreator, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            var self = this;
            setTimeout(function () {
                self.inited = true;
            }, 50);
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
                { className: "d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column" },
                React.createElement(VisibleCForm0, { id: "Form0", parentPath: "TaskCreatePage" })
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
                    { className: "d-flex flex-column flex-grow-1 flex-shrink-1 h-100 " },
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
var VisibleCForm0 = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_TaskCreator = ReactRedux.connect(ERPC_TaskCreator_mapstatetoprops, ERPC_TaskCreator_dispatchtoprops)(ERPC_TaskCreator);
    VisibleCForm0 = ReactRedux.connect(CForm0_mapstatetoprops, CForm0_disptchtoprops)(CForm0);
});

var CForm0 = function (_React$PureComponent2) {
    _inherits(CForm0, _React$PureComponent2);

    function CForm0(props) {
        _classCallCheck(this, CForm0);

        var _this2 = _possibleConstructorReturn(this, (CForm0.__proto__ || Object.getPrototypeOf(CForm0)).call(this, props));

        ERPC_PageForm(_this2);
        _this2.canInsert = true;
        return _this2;
    }

    _createClass(CForm0, [{
        key: "pullGeteUserSysUserList",
        value: function pullGeteUserSysUserList(parentPath) {
            store.dispatch(fetchJsonPost(TaskServerURL, { action: 'geteUserSysUserList' }, makeFTD_Prop(parentPath, 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
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
                                { className: "d-flex flex-column d-flex flex-grow-1 flex-shrink-1 erp-form flex-column " },
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
                                        { id: "M_LC_2", parentPath: this.props.fullPath, label: "\u53D1\u8D77\u4EBA" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_0", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: this.pullGeteUserSysUserList, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u53D1\u8D77\u4EBA" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_3", parentPath: this.props.fullPath, label: "\u6267\u884C\u4EBA" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_1", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: this.pullGeteUserSysUserList, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u6267\u884C\u4EBA" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_4", parentPath: this.props.fullPath, label: "\u5173\u8054\u5DE5\u4F5C\u5C0F\u7EC4" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_2", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: pull_M_Dropdown_2, textAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u540D\u79F0", valueAttrName: "\u5DE5\u4F5C\u5C0F\u7EC4\u4EE3\u7801", label: "\u5173\u8054\u5DE5\u4F5C\u5C0F\u7EC4" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_5", parentPath: this.props.fullPath, label: "\u5173\u8054\u9879\u76EE" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_3", parentPath: this.props.fullPath, pullOnce: true, groupAttr: "\u9879\u76EE\u8FD0\u884C\u9636\u6BB5", pullDataSource: pull_M_Dropdown_3, textAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0", valueAttrName: "\u9879\u76EE\u767B\u8BB0\u540D\u79F0\u4EE3\u7801", label: "\u5173\u8054\u9879\u76EE" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_6", parentPath: this.props.fullPath, label: "\u6284\u9001\u4EBA\u5458" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_4", parentPath: this.props.fullPath, textType: "xml", multiselect: true, pullOnce: true, nullable: true, groupAttr: "\u6240\u5C5E\u7CFB\u7EDF\u540D\u79F0,\u6240\u5C5E\u90E8\u95E8\u540D\u79F0", pullDataSource: pull_M_Dropdown_4, textAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D", valueAttrName: "\u5458\u5DE5\u767B\u8BB0\u59D3\u540D\u4EE3\u7801", label: "\u6284\u9001\u4EBA\u5458" })
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
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_5", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: pull_M_Dropdown_5, textAttrName: "\u6C47\u62A5\u9891\u7387\u540D\u79F0", valueAttrName: "\u4EFB\u52A1\u6C47\u62A5\u9891\u7387\u4EE3\u7801", label: "\u6C47\u62A5\u9891\u7387" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_10", parentPath: this.props.fullPath, label: "\u662F\u5426\u5468\u671F\u4EFB\u52A1" },
                                        React.createElement(VisibleERPC_CheckBox, { id: "M_CheckBox_1", parentPath: this.props.fullPath })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_11", parentPath: this.props.fullPath, label: "\u5468\u671F\u5355\u4F4D" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_6", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: pull_M_Dropdown_6, textAttrName: "\u5468\u671F\u5355\u4F4D", valueAttrName: "\u4EFB\u52A1\u5468\u671F\u5355\u4F4D\u4EE3\u7801", label: "\u5468\u671F\u5355\u4F4D" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_12", parentPath: this.props.fullPath, label: "\u5468\u671F\u6570\u503C" },
                                        React.createElement(VisibleERPC_Text, { id: "M_Text_3", parentPath: this.props.fullPath, type: "float", precision: "1" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_LabeledControl,
                                        { id: "M_LC_13", parentPath: this.props.fullPath, label: "\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801" },
                                        React.createElement(VisibleERPC_DropDown, { id: "M_Dropdown_7", parentPath: this.props.fullPath, pullOnce: true, pullDataSource: pull_M_Dropdown_7, textAttrName: "\u91CD\u8981\u7A0B\u5EA6\u540D\u79F0", valueAttrName: "\u4EFB\u52A1\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801", label: "\u91CD\u8981\u7A0B\u5EA6\u4EE3\u7801" })
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-primary erp-control ", id: "button_2", parentPath: this.props.fullPath, onClick: this.button_2_onclick },
                                        "\u63D0\u4EA4\u4FEE\u6539"
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-warning erp-control ", id: "button_1", parentPath: this.props.fullPath, onClick: this.button_1_onclick },
                                        "\u64A4\u9500\u6B64\u4EFB\u52A1"
                                    ),
                                    React.createElement(
                                        VisibleERPC_Button,
                                        { className: "btn btn-primary erp-control ", id: "button_0", parentPath: this.props.fullPath, onClick: this.button_0_onclick },
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

    return CForm0;
}(React.PureComponent);

function CForm0_mapstatetoprops(state, ownprops) {
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
function CForm0_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}