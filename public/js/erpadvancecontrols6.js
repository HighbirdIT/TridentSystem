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
        _this.dropdownRef = React.createRef();
        _this.pullUserTask = _this.pullUserTask.bind(_this);
        _this.pop = _this.pop.bind(_this);
        _this.createTitleBarRightElem = _this.createTitleBarRightElem.bind(_this);
        _this.popupCreator = _this.popupCreator.bind(_this);
        _this.taskConfirmed = _this.taskConfirmed.bind(_this);
        _this.onloadHandler = _this.onloadHandler.bind(_this);
        _this.onErrorHandler = _this.onErrorHandler.bind(_this);
        _this.sendMessage = _this.sendMessage.bind(_this);
        _this.iframeRef = React.createRef();
        _this.iframeItem = null;
        return _this;
    }

    _createClass(ERPC_TaskSelector, [{
        key: 'pop',
        value: function pop() {
            this.closeCreator();
        }
    }, {
        key: 'pullUserTask',
        value: function pullUserTask(parentPath) {
            store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentPath, this.props.id, 'options_arr', false), EFetchKey.FetchPropValue));
        }
    }, {
        key: 'sendMessage',
        value: function sendMessage(msgtype, data) {
            if (msgtype == '任务已下发') {
                this.taskConfirmed(data.任务代码, data.任务名称, '默认小组');
                this.closeCreator();
            }
        }
    }, {
        key: 'onloadHandler',
        value: function onloadHandler(ev) {
            try {
                ev.target.contentWindow.gPageInFrame = true;
                ev.target.contentWindow.gParentFrame = this;
                ev.target.contentWindow.gParentDingKit = dingdingKit;
                ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
            } catch (eo) {
                console.log(eo);
            }
        }
    }, {
        key: 'onErrorHandler',
        value: function onErrorHandler(ev) {
            alert(JSON.stringify(ev));
        }
    }, {
        key: 'popupCreator',
        value: function popupCreator() {
            this.iframeItem = React.createElement(
                'div',
                { key: this.props.id + 'creator', className: 'd-fixed w-100 h-100', style: { zIndex: 10000 } },
                React.createElement('iframe', { ref: this.iframeRef, src: 'http://192.168.0.15:1330/erppage/mb/ZZMZY?flowStep=144', className: 'w-100 h-100', frameBorder: '0', onLoad: this.onloadHandler, onError: this.onErrorHandler })
            );
            addFixedItem(this.iframeItem);
            if (this.dropdownRef.current) {
                this.dropdownRef.current.dropDownClosed();
            }
        }
    }, {
        key: 'closeCreator',
        value: function closeCreator() {
            if (this.iframeItem) {
                removeFixedItem(this.iframeItem);
            }
        }
    }, {
        key: 'createTitleBarRightElem',
        value: function createTitleBarRightElem() {
            return React.createElement(
                'button',
                { type: 'button', onClick: this.popupCreator, className: 'ml-1 btn btn-success' + (isMobile ? '' : ' btn-sm') },
                React.createElement('i', { className: 'fa fa-plus' }),
                '\u521B\u5EFA\u4EFB\u52A1'
            );
        }
    }, {
        key: 'taskConfirmed',
        value: function taskConfirmed(taskid, taskname, groupname) {
            var newOptions_arr = this.props.optionsData.options_arr;
            newOptions_arr = newOptions_arr.map(function (x) {
                return x.data;
            }).concat({
                工作任务记录代码: taskid,
                任务标题: taskname,
                工作小组名称: groupname
            });
            var needSetState = {
                options_arr: newOptions_arr,
                text: taskname,
                value: taskid
            };
            store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
            if (this.dropdownRef.current) {
                this.dropdownRef.current.dropDownClosed();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            return React.createElement(ERPC_DropDown, {
                ref: this.dropdownRef,
                value: this.props.value,
                text: this.props.text,
                fetching: this.props.fetching,
                fetchingErr: this.props.fetchingErr,
                optionsData: this.props.optionsData,
                invalidInfo: this.props.invalidInfo,
                selectOpt: this.props.selectOpt,
                rowkey: this.props.rowkey,
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
                textAttrName: '\u4EFB\u52A1\u6807\u9898',
                valueAttrName: '\u5DE5\u4F5C\u4EFB\u52A1\u8BB0\u5F55\u4EE3\u7801',
                recentCookieKey: 'task',
                onchanged: this.props.onchanged,
                createTitleBarRightElem: this.createTitleBarRightElem
            });
        }
    }]);

    return ERPC_TaskSelector;
}(React.PureComponent);

var selectERPC_TaskSelector_textName = function selectERPC_TaskSelector_textName(state, ownprops) {
    return '任务标题';
};

var selectERPC_TaskSelector_valueName = function selectERPC_TaskSelector_valueName(state, ownprops) {
    return '工作任务记录代码';
};

var selectERPC_TaskSelector_groupAttrName = function selectERPC_TaskSelector_groupAttrName(state, ownprops) {
    return '工作小组名称';
};

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
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_TaskSelector_textName, selectERPC_TaskSelector_valueName, selectERPC_TaskSelector_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
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
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
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