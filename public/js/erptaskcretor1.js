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
            this.props.dropdownctl.dropDownClosed();
        }
    }, {
        key: "clickCloseHandler",
        value: function clickCloseHandler() {
            this.props.dropdownctl.dropDownClosed();
        }
    }, {
        key: "render",
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            return React.createElement(ERPC_DropDown, {
                value: this.props.value,
                text: this.props.text,
                fetching: this.props.fetching,
                fetchingErr: this.props.fetchingErr,
                optionsData: this.props.optionsData,
                invalidInfo: this.props.invalidInfo,
                selectOpt: this.props.selectOpt,
                rowIndex: this.props.rowIndex,
                id: this.props.id,
                parentPath: this.props.parentPath,
                type: "string",
                pullOnce: true,
                pullDataSource: this.pullUserTask,
                options_arr: this.props.options_arr,
                plainTextMode: this.props.plainTextMode,
                fullParentPath: this.props.fullParentPath,
                fullPath: this.props.fullPath,
                label: this.props.label,
                createTitleBarRightElem: this.createTitleBarRightElem
            });
        }
    }]);

    return ERPC_TaskCreator;
}(React.PureComponent);

function ERPC_TaskCreator_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_TaskCreator_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_TaskCreator = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_TaskCreator = ReactRedux.connect(ERPC_TaskCreator_mapstatetoprops, ERPC_TaskCreator_dispatchtoprops)(ERPC_TaskCreator);
});