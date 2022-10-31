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

// 大连项目适用
var DalianServerURL = '/erppage/server/dalian';
var DaLianStatus_Setting = {
    CellSize: 33,
    BtnSize: 28
};
var DaLianStatus_HheaderCellSyle = { width: DaLianStatus_Setting.CellSize + 'px', height: DaLianStatus_Setting.CellSize + 'px' };
var DaLianStatus_NormalCellSyle = { width: DaLianStatus_Setting.CellSize + 'px', height: DaLianStatus_Setting.CellSize + 'px', padding: '2px' };
var DaLianStatus_ButtonCellSyle = { width: DaLianStatus_Setting.BtnSize + 'px', height: DaLianStatus_Setting.BtnSize + 'px' };

var CDSComponentData = function CDSComponentData(data) {
    _classCallCheck(this, CDSComponentData);

    this.data = data;
    for (var si in data) {
        this[si] = data[si];
    }
};

var C_DaLianStatusCell = function (_React$PureComponent2) {
    _inherits(C_DaLianStatusCell, _React$PureComponent2);

    function C_DaLianStatusCell(props) {
        _classCallCheck(this, C_DaLianStatusCell);

        var _this2 = _possibleConstructorReturn(this, (C_DaLianStatusCell.__proto__ || Object.getPrototypeOf(C_DaLianStatusCell)).call(this, props));

        _this2.state = {};
        _this2.btnClickHandler = _this2.btnClickHandler.bind(_this2);
        return _this2;
    }

    _createClass(C_DaLianStatusCell, [{
        key: 'btnClickHandler',
        value: function btnClickHandler(ev) {
            if (this.props.onClick) {
                this.props.onClick(this);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var contentElem = null;
            var data = this.props.data;
            var rootClassName = 'd-block border text-center flex-shrink-0 flex-grow-0';
            if (data == null) {
                rootClassName += ' bg-secondary';
            } else {
                contentElem = React.createElement(
                    'button',
                    { onClick: this.btnClickHandler, type: 'button', className: 'btn btn-sm btn-primary p-1', style: DaLianStatus_ButtonCellSyle },
                    data.列号
                );
            }
            return React.createElement(
                'div',
                { className: rootClassName, style: DaLianStatus_NormalCellSyle },
                contentElem
            );
        }
    }]);

    return C_DaLianStatusCell;
}(React.PureComponent);

var C_DaLianStatusRow = function (_React$PureComponent3) {
    _inherits(C_DaLianStatusRow, _React$PureComponent3);

    function C_DaLianStatusRow(props) {
        _classCallCheck(this, C_DaLianStatusRow);

        var _this3 = _possibleConstructorReturn(this, (C_DaLianStatusRow.__proto__ || Object.getPrototypeOf(C_DaLianStatusRow)).call(this, props));

        _this3.state = {};
        return _this3;
    }

    _createClass(C_DaLianStatusRow, [{
        key: 'render',
        value: function render() {
            var contentElem = null;
            if (this.props.data == null) {} else {}
            return React.createElement(
                'div',
                { className: 'd-flex flex-shrink-0 flex-grow-0' },
                Children
            );
        }
    }]);

    return C_DaLianStatusRow;
}(React.PureComponent);

var ERPC_DaLianStatus = function (_React$PureComponent4) {
    _inherits(ERPC_DaLianStatus, _React$PureComponent4);

    function ERPC_DaLianStatus(props) {
        _classCallCheck(this, ERPC_DaLianStatus);

        var _this4 = _possibleConstructorReturn(this, (ERPC_DaLianStatus.__proto__ || Object.getPrototypeOf(ERPC_DaLianStatus)).call(this, props));

        ERPControlBase(_this4);
        _this4.state = Object.assign(_this4.initState, {
            钢框架cell_dic: null,
            行Range: null,
            列Range: null
        });
        _this4.gridDivScrollHandler = _this4.gridDivScrollHandler.bind(_this4);
        _this4.clickSearchHandler = _this4.clickSearchHandler.bind(_this4);
        _this4.processData = _this4.processData.bind(_this4);
        _this4.clickCellHandler = _this4.clickCellHandler.bind(_this4);

        _this4.gridDivRef = React.createRef();
        _this4.rowHeaderDivRef = React.createRef();
        _this4.columnHeaderDiv = React.createRef();
        _this4.selectRef = React.createRef();
        return _this4;
    }

    _createClass(ERPC_DaLianStatus, [{
        key: 'gridDivScrollHandler',
        value: function gridDivScrollHandler(ev) {
            if (this.gridDivRef.current) {
                var gridDiv = this.gridDivRef.current;
                // console.log(`${gridDiv.scrollTop}:${gridDiv.scrollLeft}`);
                this.rowHeaderDivRef.current.scrollTop = gridDiv.scrollTop;
                this.columnHeaderDiv.current.scrollLeft = gridDiv.scrollLeft;
            }
        }
    }, {
        key: 'clickSearchHandler',
        value: function clickSearchHandler(ev) {
            var _this5 = this;

            if (this.selectRef.current == null) {
                return;
            }
            if (this.state.fetching) {
                return;
            }
            var self = this;
            this.setState({
                fetching: true
            });
            nativeFetchJson(false, DalianServerURL, {
                action: 'getConstructState',
                bundle: { userid: g_envVar.userid, 全局代码: this.selectRef.current.value, 材料种类: 'K' }
            }).then(function (retJson) {
                if (retJson.err != null) {
                    self.setState({
                        fetching: false,
                        fetchingErr: retJson.err.info
                    });
                } else {
                    // self.setState({
                    //     fetching:false,
                    // });
                    self.钢框架数据_arr = retJson.data;
                    _this5.processData();
                }
            });
            // nativeFetchJson();
        }
    }, {
        key: 'processData',
        value: function processData() {
            var 钢框架cell_dic = {};
            var 钢框架数据_arr = this.钢框架数据_arr;
            var min行号 = 999;
            var max行号 = 0;
            var min列号 = 999;
            var max列号 = 0;
            for (var si in 钢框架数据_arr) {
                var data = 钢框架数据_arr[si];
                min行号 = Math.min(min行号, data.行号);
                max行号 = Math.max(max行号, data.行号);
                min列号 = Math.min(min列号, data.列号);
                max列号 = Math.max(max列号, data.列号);
                var key = data.行号 + '_' + data.列号;
                钢框架cell_dic[key] = new CDSComponentData(data);
            }

            this.setState({
                fetching: false,
                钢框架cell_dic: 钢框架cell_dic,
                行Range: [min行号, max行号],
                列Range: [min列号, max列号]
            });
        }
    }, {
        key: 'clickCellHandler',
        value: function clickCellHandler(cellElem) {
            console.log(cellElem);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var columnHeaderElems = [];
            var rowHeaderElems = [];
            var rowElems = [];

            var titleInfo = null;
            var infoTye = 'warning';
            if (this.state.fetching) {
                titleInfo = '数据获取中';
            } else if (this.state.fetchingErr != null) {
                titleInfo = this.state.fetchingErr;
                infoTye = 'danger';
            } else if (this.state.钢框架cell_dic == null) {
                titleInfo = '请点击检索按钮';
                infoTye = 'light';
            } else {
                var 钢框架cell_dic = this.state.钢框架cell_dic;
                var 行Range = this.state.行Range;
                var 列Range = this.state.列Range;
                var rowCount = 行Range[1] - 行Range[0] + 1;
                var columnCount = 列Range[1] - 列Range[0] + 1;
                //autoScroll_Touch
                var CellSize = DaLianStatus_Setting.CellSize;
                for (var i = 列Range[0]; i <= columnCount; ++i) {
                    columnHeaderElems.push(React.createElement(
                        'div',
                        { key: i, className: 'd-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0', style: DaLianStatus_HheaderCellSyle },
                        i
                    ));
                }

                for (var i = 行Range[1]; i >= 行Range[0]; --i) {
                    rowHeaderElems.push(React.createElement(
                        'div',
                        { key: i, className: 'd-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0', style: DaLianStatus_HheaderCellSyle },
                        i
                    ));
                }

                for (var row_i = 行Range[1]; row_i >= 行Range[0]; --row_i) {
                    // rowElems.push(<C_DaLianStatusRow key={row_i} />);
                    // continue;
                    var cellElems = [];
                    for (var col_i = 列Range[0]; col_i <= 列Range[1]; ++col_i) {
                        var cellKey = row_i + '_' + col_i;
                        cellElems.push(React.createElement(C_DaLianStatusCell, { key: col_i, data: 钢框架cell_dic[cellKey], onClick: this.clickCellHandler }));
                    }
                    rowElems.push(React.createElement(
                        'div',
                        { key: row_i, className: 'd-flex flex-shrink-0 flex-grow-0' },
                        cellElems
                    ));
                }
            }

            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 hidenOverflow' },
                React.createElement(
                    'div',
                    { className: 'bg-dark d-flex flex-grow-0 flex-shrink-1 align-items-center p-2' },
                    React.createElement(
                        'span',
                        { className: 'h4 text-light mb-0 p-1' },
                        '\u5927\u8FDE\u751F\u4EA7\u65BD\u5DE5\u8FFD\u8E2A'
                    ),
                    React.createElement(
                        'select',
                        { ref: this.selectRef, className: 'h4' },
                        React.createElement(
                            'option',
                            { value: '1' },
                            'F1'
                        ),
                        React.createElement(
                            'option',
                            { value: '2' },
                            'F2'
                        ),
                        React.createElement(
                            'option',
                            { value: '3' },
                            'F3'
                        )
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-primary ml-1' + (this.state.fetching ? ' disabled' : ''), onClick: this.clickSearchHandler },
                        React.createElement('i', { className: 'fa fa-search' }),
                        '\u68C0\u7D22\u6570\u636E'
                    ),
                    titleInfo == null ? null : React.createElement(
                        'span',
                        { className: 'h5 mb-0 p-1 ml-2 badge badge-' + infoTye },
                        titleInfo
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-shrink-0 border-bottom' },
                    React.createElement('div', { className: 'd-block flex-shrink-0 flex-grow-0 text-center bg-secondary', style: DaLianStatus_HheaderCellSyle }),
                    React.createElement(
                        'div',
                        { id: 'columnHeaderDiv', ref: this.columnHeaderDiv, className: 'd-flex flex-grow-1 flex-shrink-1 hidenOverflow flex-nowrap' },
                        columnHeaderElems,
                        React.createElement('div', { className: 'd-block flex-shrink-0 flex-grow-0', style: { width: '18px' } })
                    )
                ),
                React.createElement(
                    'div',
                    { id: 'bottomDiv', className: 'd-flex flex-shrink-1 flex-grow-1' },
                    React.createElement(
                        'div',
                        { id: 'rowHeaderDiv', ref: this.rowHeaderDivRef, className: 'd-flex flex-column flex-shrink-0 flex-grow-0 hidenOverflow border-right', style: { width: CellSize + 'px' } },
                        rowHeaderElems,
                        React.createElement('div', { className: 'd-block flex-shrink-0 flex-grow-0', style: { height: '18px' } })
                    ),
                    React.createElement(
                        'div',
                        { id: 'gridDiv', ref: this.gridDivRef, className: 'flex-shrink-1 flex-grow-1', onScroll: this.gridDivScrollHandler, style: { overflow: 'scroll' } },
                        rowElems
                    )
                )
            );
        }
    }]);

    return ERPC_DaLianStatus;
}(React.PureComponent);

function ERPC_DaLianStatus_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    return {
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath
    };
}

function ERPC_DaLianStatus_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_TaskSelector = null;
var VisibleERPC_DaLianStatus = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_TaskSelector = ReactRedux.connect(ERPC_TaskSelector_mapstatetoprops, ERPC_TaskSelector_dispatchtoprops)(ERPC_TaskSelector);
    VisibleERPC_DaLianStatus = ReactRedux.connect(ERPC_DaLianStatus_mapstatetoprops, ERPC_DaLianStatus_dispatchtoprops)(ERPC_DaLianStatus);
});