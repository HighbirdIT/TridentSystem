'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TaskServerURL = '/erppage/server/task';

var ERPC_TaskSelector = function (_React$PureComponent) {
    _inherits(ERPC_TaskSelector, _React$PureComponent);

    function ERPC_TaskSelector(props) {
        _classCallCheck(this, ERPC_TaskSelector);

        var _this = _possibleConstructorReturn(this, (ERPC_TaskSelector.__proto__ || Object.getPrototypeOf(ERPC_TaskSelector)).call(this, props));

        ERPControlBase(_this);
        _this.pullUserTask = _this.pullUserTask.bind(_this);
        _this.createTitleBarRightElem = _this.createTitleBarRightElem.bind(_this);
        _this.popupCreator = _this.popupCreator.bind(_this);

        _this.popPanelRef = React.createRef();
        _this.popPanelItem = React.createElement(ERPC_TaskCreator, { ref: _this.popPanelRef, selector: _this, key: gFixedItemCounter++ });
        return _this;
    }

    _createClass(ERPC_TaskSelector, [{
        key: 'pullUserTask',
        value: function pullUserTask() {
            var ownprops = this.props;
            var parentStatePath = MakePath(ownprops.parentPath, ownprops.rowIndex == null ? null : 'row_' + ownprops.rowIndex, ownprops.id);
            store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentStatePath, ownprops.id), 'options_arr', false), EFetchKey.FetchPropValue);
        }
    }, {
        key: 'popupCreator',
        value: function popupCreator() {
            addFixedItem(this.popPanelItem);
        }
    }, {
        key: 'closeCreator',
        value: function closeCreator() {
            removeFixedItem(this.popPanelItem);
        }
    }, {
        key: 'createTitleBarRightElem',
        value: function createTitleBarRightElem() {
            return React.createElement(
                'button',
                { type: 'button', onClick: this.popupCreator, className: 'btn btn-success' },
                React.createElement('i', { className: 'fa fa-plus' }),
                '\u521B\u5EFA\u4EFB\u52A1'
            );
        }
    }, {
        key: 'render',
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
                type: 'string',
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

    return ERPC_TaskSelector;
}(React.PureComponent);

function ERPC_TaskSelector_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = propProfile.fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_DropDown_textName, selectERPC_DropDown_valueName, selectERPC_DropDown_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (!useValue) {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowIndex != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_TaskSelector_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_TaskSelector = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_TaskSelector = ReactRedux.connect(ERPC_TaskSelector_mapstatetoprops, ERPC_TaskSelector_dispatchtoprops)(ERPC_TaskSelector);
});