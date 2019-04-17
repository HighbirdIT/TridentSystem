'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSNodeEditorControls_arr = [{
    label: '常量',
    nodeClass: JSNode_ConstValue,
    type: '基础'
}, {
    label: '布尔常量',
    nodeClass: JSNode_BooleanValue,
    type: '基础'
}, {
    label: '环境变量',
    nodeClass: JSNode_Env_Var,
    type: '基础'
}, {
    label: 'Return',
    nodeClass: JSNode_Return,
    type: '流控制'
}, {
    label: 'CallOnFetchEnd',
    nodeClass: JSNode_CallOnFetchEnd,
    type: '流控制'
}, {
    label: 'IF',
    nodeClass: JSNode_IF,
    type: '流控制'
}, {
    label: '逻辑运算',
    nodeClass: JSNode_Logical_Operator,
    type: '数学'
}, {
    label: '四则运算',
    nodeClass: JSNode_NOperand,
    type: '数学'
}, {
    label: '比较',
    nodeClass: JSNode_Compare,
    type: '数学'
}, {
    label: 'Switch',
    nodeClass: JSNode_Switch,
    type: '流控制'
}, {
    label: 'Break',
    nodeClass: JSNode_Break,
    type: '流控制'
}, {
    label: 'Sequence',
    nodeClass: JSNode_Sequence,
    type: '流控制'
}, {
    label: 'Insert',
    nodeClass: JSNODE_Insert_table,
    type: '数据库交互'
}, {
    label: 'Update',
    nodeClass: JSNODE_Update_table,
    type: '数据库交互'
}, {
    label: '日期函数',
    nodeClass: JSNode_DateFun,
    type: '运算'
}, {
    label: '查询SQL',
    nodeClass: JSNode_Query_Sql,
    type: '数据库交互'
}, {
    label: '执行流程步骤',
    nodeClass: JSNode_Do_FlowStep,
    type: '数据库交互'
}, {
    label: '数组-长度',
    nodeClass: JSNode_Array_Length,
    type: '数组操纵'
}, {
    label: '创建自订错误',
    nodeClass: JSNode_Create_Cuserror,
    type: '错误控制'
}, {
    label: '刷新表单',
    nodeClass: JSNode_FreshForm,
    type: '表单控制'
}];

var EApiType = {
    Prop: 'prop',
    Fun: 'fun',
    PropSetter: 'propsetter'
};

function gCreateControlApiItem(apiType, apiName) {}

var g_controlApi_arr = [];

function gFindPropApiItem(ctltype, attrName) {
    var rlt = null;
    var ctlApi = g_controlApi_arr.find(function (item) {
        return item.ctltype == ctltype;
    });
    if (ctlApi != null) {
        rlt = ctlApi.propapi_arr.find(function (item) {
            return item.attrItem.name == attrName;
        });
    }
    return rlt;
}

var JSNode_CompileHelper = function (_SqlNode_CompileHelpe) {
    _inherits(JSNode_CompileHelper, _SqlNode_CompileHelpe);

    function JSNode_CompileHelper(logManager, editor, scope) {
        _classCallCheck(this, JSNode_CompileHelper);

        var _this = _possibleConstructorReturn(this, (JSNode_CompileHelper.__proto__ || Object.getPrototypeOf(JSNode_CompileHelper)).call(this, logManager, editor));

        _this.scope = scope == null ? new JSFile_Scope() : scope;
        _this.clickLogBadgeItemHandler = _this.clickLogBadgeItemHandler.bind(_this);
        _this.useForm_map = {};
        _this.useGlobalControls_map = {};
        _this.appendedOutputItems_arr = [];
        _this.clientInitBundleBlocks_arr = [];
        return _this;
    }

    _createClass(JSNode_CompileHelper, [{
        key: 'appendOutputItem',
        value: function appendOutputItem(item) {
            this.appendedOutputItems_arr.push(item);
        }
    }, {
        key: 'addInitClientBundleBlock',
        value: function addInitClientBundleBlock(block) {
            this.clientInitBundleBlocks_arr.push(block);
        }
    }, {
        key: 'addUseColumn',
        value: function addUseColumn(formKernel, columnName, serverFun) {
            var formObj = this.addUseForm(formKernel);
            formObj.useNowRecord = true;
            if (formObj.useColumns_map[columnName] == null) {
                formObj.useColumns_map[columnName] = {
                    serverFuns_arr: []
                };
            }
            if (serverFun) {
                var useColumnObj = formObj.useColumns_map[columnName];
                if (useColumnObj.serverFuns_arr.indexOf(serverFun) == -1) {
                    useColumnObj.serverFuns_arr.push(serverFun);
                }
            }
        }
    }, {
        key: 'addUseForm',
        value: function addUseForm(formKernel) {
            if (this.useForm_map[formKernel.id] == null) {
                this.useForm_map[formKernel.id] = {
                    useColumns_map: {},
                    useControls_map: {},
                    useNowRecord: false,
                    formKernel: formKernel
                };
            }
            return this.useForm_map[formKernel.id];
        }
    }, {
        key: 'addUseControlPropApi',
        value: function addUseControlPropApi(ctrKernel, apiitem) {
            var rlt = null;
            var belongFormKernel = ctrKernel.searchParentKernel(M_FormKernel_Type, true);
            if (belongFormKernel == null) {
                rlt = this.useGlobalControls_map[ctrKernel.id];
                if (rlt == null) {
                    rlt = {
                        kernel: ctrKernel,
                        useprops_map: {}
                    };
                    this.useGlobalControls_map[ctrKernel.id] = rlt;
                }
                rlt.useprops_map[apiitem.attrItem.name] = apiitem;
                return;
            } else {
                var formObj = this.addUseForm(belongFormKernel);
                rlt = formObj.useControls_map[ctrKernel.id];
                if (rlt == null) {
                    rlt = {
                        kernel: ctrKernel,
                        useprops_map: {}
                    };
                    formObj.useControls_map[ctrKernel.id] = rlt;
                }
            }
            rlt.useprops_map[apiitem.attrItem.name] = apiitem;
        }
    }]);

    return JSNode_CompileHelper;
}(SqlNode_CompileHelper);

var JSNodeEditorLeftPanel = function (_React$PureComponent) {
    _inherits(JSNodeEditorLeftPanel, _React$PureComponent);

    function JSNodeEditorLeftPanel(props) {
        _classCallCheck(this, JSNodeEditorLeftPanel);

        var _this2 = _possibleConstructorReturn(this, (JSNodeEditorLeftPanel.__proto__ || Object.getPrototypeOf(JSNodeEditorLeftPanel)).call(this, props));

        autoBind(_this2);
        return _this2;
    }

    _createClass(JSNodeEditorLeftPanel, [{
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('changed', this.editingNodeChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('changed', this.editingNodeChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            //listenNode(this.state.editingNode);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'editingNodeChangedhandler',
        value: function editingNodeChangedhandler() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'clickOutlineImteHandler',
        value: function clickOutlineImteHandler(nodeData) {
            this.props.editor.showNodeData(nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.listenedNode != this.props.editingNode) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode);
            }
            var nowBlueprint = null;
            if (this.props.editingNode) {
                nowBlueprint = this.props.editingNode;
            }
            return React.createElement(SplitPanel, {
                fixedOne: true,
                maxSize: 200,
                defPercent: 0.3,
                flexColumn: true,
                panel1: React.createElement(
                    'div',
                    { className: 'w-100 h-100 autoScroll d-flex flex-column' },
                    this.props.editingNode.nodes_arr.map(function (nodeData) {
                        return React.createElement(SqlNodeOutlineItem, { key: nodeData.id, nodeData: nodeData, clickHandler: _this3.clickOutlineImteHandler });
                    })
                ),
                panel2: React.createElement(
                    'div',
                    { className: 'd-flex flex-column h-100 w-100' },
                    React.createElement(JSNodeEditorVariables, { editingNode: this.props.editingNode, editor: this.props.editor }),
                    React.createElement(JSNodeEditorCanUseNodePanel, { bluePrint: nowBlueprint, onMouseDown: this.props.onMouseDown, editor: this.props.editor })
                )
            });
        }
    }]);

    return JSNodeEditorLeftPanel;
}(React.PureComponent);

var JSNodeEditorCanUseNodePanel = function (_React$PureComponent2) {
    _inherits(JSNodeEditorCanUseNodePanel, _React$PureComponent2);

    function JSNodeEditorCanUseNodePanel(props) {
        _classCallCheck(this, JSNodeEditorCanUseNodePanel);

        var _this4 = _possibleConstructorReturn(this, (JSNodeEditorCanUseNodePanel.__proto__ || Object.getPrototypeOf(JSNodeEditorCanUseNodePanel)).call(this, props));

        autoBind(_this4);
        _this4.state = {
            canUseDS_arr: [],
            canAccessKernel_arr: [],
            showCanUseDS: true,
            showCtlApi: false,
            showCanAccessCtl: false
        };
        var self = _this4;
        return _this4;
    }

    _createClass(JSNodeEditorCanUseNodePanel, [{
        key: 'scanBlueprint',
        value: function scanBlueprint(bluePrint) {
            this.scanedBP = bluePrint;
            if (bluePrint == null) {
                return;
            }
            var scriptMaster = bluePrint.master;
            var project = scriptMaster.project;
            var logManager = this.props.editor.logManager;
            logManager.clear();
            var canUseDS_arr = [];
            var canAccessKernel_arr = [];
            if (bluePrint.group == EJsBluePrintFunGroup.CtlAttr || bluePrint.group == EJsBluePrintFunGroup.CtlEvent || bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
                // 控件类型,获取上下文
                var ctlKernel = project.getControlById(bluePrint.ctlID);
                if (bluePrint.ctlID == null || ctlKernel == null) {
                    logManager.error('本蓝图没有找到相应的控件[' + bluePrint.ctlID + ']');
                    return;
                }
                // 获取可用的数据源
                var parentForms_arr = ctlKernel.searchParentKernel(M_FormKernel_Type);
                if (parentForms_arr != null) {
                    parentForms_arr.forEach(function (formKernel) {
                        var useDS = formKernel.getAttribute(AttrNames.DataSource);
                        if (useDS != null) {
                            canUseDS_arr.push({
                                entity: useDS,
                                label: formKernel.getReadableName() + '当前行',
                                formID: formKernel.id
                            });
                        }
                    });
                }

                canAccessKernel_arr = ctlKernel.getAccessableKernels();
            }
            //console.log(canUseDS_arr);
            this.setState({
                canUseDS_arr: canUseDS_arr,
                canAccessKernel_arr: canAccessKernel_arr
            });
        }
    }, {
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var ctlItem = JSNodeEditorControls_arr.find(function (item) {
                return item.label == itemValue;
            });
            if (ctlItem) {
                this.props.onMouseDown(ctlItem);
            }
        }
    }, {
        key: 'mouseDownCanUseDSHandler',
        value: function mouseDownCanUseDSHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            var theDSItem = this.state.canUseDS_arr.find(function (e) {
                return e.formID == itemValue;
            });
            if (theDSItem) {
                this.props.editor.createCanUseDS(theDSItem);
            }
        }
    }, {
        key: 'mouseDownCanAccessCtlHandler',
        value: function mouseDownCanAccessCtlHandler(ev) {
            var itemValue = getAttributeByNode(ev.target, 'data-value');
            if (itemValue == null) return;
            this.props.editor.createCtrlKernel(itemValue);
        }
    }, {
        key: 'clickCanUseDSHeader',
        value: function clickCanUseDSHeader(ev) {
            this.setState({ showCanUseDS: !this.state.showCanUseDS });
        }
    }, {
        key: 'clickAccessCtlHeader',
        value: function clickAccessCtlHeader(ev) {
            this.setState({ showCanAccessCtl: !this.state.showCanAccessCtl });
        }
    }, {
        key: 'clickCtlApuHeader',
        value: function clickCtlApuHeader(ev) {
            this.setState({ showCtlApi: !this.state.showCtlApi });
        }
    }, {
        key: 'clickControlAPIHandler',
        value: function clickControlAPIHandler(ev) {
            var ctltype = getAttributeByNode(ev.target, 'data-ctltype');
            if (ctltype == null) return;
            var apiid = getAttributeByNode(ev.target, 'data-apiid');
            if (apiid == null) return;
            var theApiObj = g_controlApi_arr.find(function (e) {
                return e.ctltype == ctltype;
            });
            var apiItem = theApiObj.getApiItemByid(apiid);
            this.props.editor.createApiObj(theApiObj, apiItem);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            if (this.props.bluePrint != this.scanedBP) {
                if (this.scanTimeout == null) {
                    var self = this;
                    setTimeout(function () {
                        self.scanBlueprint(self.props.bluePrint);
                        self.scanTimeout = null;
                    }, 10);
                }
                return null;
            }
            var canUseDS_arr = this.state.canUseDS_arr;
            var canAccessKernel_arr = this.state.canAccessKernel_arr;
            var targetID = this.props.bluePrint.code + 'canUseNode';
            var showCanUseDS = this.state.showCanUseDS;
            var showCanAccessCtl = this.state.showCanAccessCtl;
            var showCtlApi = this.state.showCtlApi;
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'button',
                    { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                    '\u53EF\u7528\u8282\u70B9'
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-1 flex-shrink-1 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        canUseDS_arr.length > 0 && React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-shrink-0' },
                                React.createElement(
                                    'span',
                                    { onClick: this.clickCanUseDSHeader, className: 'btn btn-info flex-grow-1 flex-shrink-1' },
                                    '\u4F5C\u7528\u57DF\u6570\u636E',
                                    showCanUseDS ? '-' : '+'
                                )
                            ),
                            showCanUseDS && React.createElement(
                                'div',
                                { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                                canUseDS_arr.map(function (item) {
                                    return React.createElement(
                                        'button',
                                        { key: item.formID, onMouseDown: _this5.mouseDownCanUseDSHandler, 'data-value': item.formID, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                        item.label
                                    );
                                })
                            )
                        ),
                        canAccessKernel_arr.length > 0 && React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-shrink-0' },
                                React.createElement(
                                    'span',
                                    { onClick: this.clickAccessCtlHeader, className: 'btn btn-info flex-grow-1 flex-shrink-1' },
                                    '\u4F5C\u7528\u57DF\u63A7\u4EF6',
                                    showCanAccessCtl ? '-' : '+'
                                )
                            ),
                            showCanAccessCtl && React.createElement(
                                'div',
                                { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                                canAccessKernel_arr.map(function (item) {
                                    return React.createElement(
                                        'button',
                                        { key: item.id, onMouseDown: _this5.mouseDownCanAccessCtlHandler, 'data-value': item.id, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                        item.getReadableName()
                                    );
                                })
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                            React.createElement(
                                'span',
                                { className: 'btn btn-info', onClick: this.clickCtlApuHeader },
                                '\u63A7\u4EF6\u63A5\u53E3',
                                showCtlApi ? '-' : '+'
                            ),
                            showCtlApi && g_controlApi_arr.map(function (ctlApi) {
                                var rlt = [];
                                ctlApi.allapi_arr.forEach(function (apiItem, index) {
                                    rlt.push(React.createElement(
                                        'button',
                                        { key: apiItem.uniqueID, onMouseDown: _this5.clickControlAPIHandler, 'data-ctltype': ctlApi.ctltype, 'data-apiid': apiItem.id, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                        apiItem.toString()
                                    ));
                                });
                                return rlt;
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100 flex-shrink-0' },
                            React.createElement(
                                'span',
                                { className: 'btn btn-info' },
                                '\u8282\u70B9'
                            ),
                            JSNodeEditorControls_arr.map(function (item) {
                                return React.createElement(
                                    'button',
                                    { key: item.label, onMouseDown: _this5.mouseDownHandler, 'data-value': item.label, type: 'button', className: 'btn flex-grow-0 flex-shrink-0 btn-dark text-left' },
                                    item.label
                                );
                            })
                        )
                    )
                )
            );
        }
    }]);

    return JSNodeEditorCanUseNodePanel;
}(React.PureComponent);

var JSNodeEditorVariables = function (_React$PureComponent3) {
    _inherits(JSNodeEditorVariables, _React$PureComponent3);

    function JSNodeEditorVariables(props) {
        _classCallCheck(this, JSNodeEditorVariables);

        var _this6 = _possibleConstructorReturn(this, (JSNodeEditorVariables.__proto__ || Object.getPrototypeOf(JSNodeEditorVariables)).call(this, props));

        autoBind(_this6);
        return _this6;
    }

    _createClass(JSNodeEditorVariables, [{
        key: 'clickAddHandler',
        value: function clickAddHandler(ev) {
            this.props.editingNode.bluePrint.createEmptyVariable();
        }
    }, {
        key: 'varChangedhandler',
        value: function varChangedhandler() {
            this.setState({
                magicobj: {}
            });
        }
    }, {
        key: 'listenNode',
        value: function listenNode(node) {
            if (node) {
                node.on('varChanged', this.varChangedhandler);
            }
            this.listenedNode = node;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(node) {
            if (node) {
                node.off('varChanged', this.varChangedhandler);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.props.editingNode);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            if (this.listenedNode != this.props.editingNode.bluePrint) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(this.props.editingNode.bluePrint);
            }
            var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
            var targetID = blueprintPrefix + 'variables';
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center' },
                    React.createElement(
                        'button',
                        { type: 'button', 'data-toggle': 'collapse', 'data-target': "#" + targetID, className: 'btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn', style: { borderRadius: '0em', height: '2.5em' } },
                        ' \u53D8\u91CF'
                    ),
                    React.createElement('i', { className: 'fa fa-plus fa-lg text-light cursor-pointer', onClick: this.clickAddHandler, style: { width: '30px' } })
                ),
                React.createElement(
                    'div',
                    { id: targetID, className: 'list-group flex-grow-0 flex-shrink-0 collapse show', style: { overflow: 'auto' } },
                    React.createElement(
                        'div',
                        { className: 'mw-100 d-flex flex-column' },
                        React.createElement(
                            'div',
                            { className: 'btn-group-vertical mw-100' },
                            this.props.editingNode.bluePrint.vars_arr.map(function (varData) {
                                return React.createElement(JSDef_Variable_Component, { belongNode: _this7.props.editingNode, key: blueprintPrefix + varData.id, varData: varData, editor: _this7.props.editor });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return JSNodeEditorVariables;
}(React.PureComponent);

var C_JSNode_Editor = function (_React$PureComponent4) {
    _inherits(C_JSNode_Editor, _React$PureComponent4);

    function C_JSNode_Editor(props) {
        _classCallCheck(this, C_JSNode_Editor);

        var _this8 = _possibleConstructorReturn(this, (C_JSNode_Editor.__proto__ || Object.getPrototypeOf(C_JSNode_Editor)).call(this, props));

        _this8.state = {
            draing: false,
            editingNode: _this8.props.bluePrint,
            showLink: false,
            scale: 1
        };

        var self = _this8;
        setTimeout(function () {
            _this8.setState({
                showLink: true
            });
        }, 50);

        autoBind(_this8);
        _this8.dragingPathRef = React.createRef();
        _this8.editorDivRef = React.createRef();
        _this8.containerRef = React.createRef();
        _this8.topBarRef = React.createRef();
        _this8.zoomDivRef = React.createRef();
        _this8.selectRectRef = React.createRef();
        _this8.logManager = new LogManager('jsnodeEditorLogManager');

        _this8.selectedNFManager = new SelectItemManager(_this8.cb_addNF, _this8.cb_removeNF);
        return _this8;
    }

    _createClass(C_JSNode_Editor, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'blueprinkChanged',
        value: function blueprinkChanged(ev) {
            this.reDraw();
        }
    }, {
        key: 'cb_removeNF',
        value: function cb_removeNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(false);
            }
        }
    }, {
        key: 'cb_addNF',
        value: function cb_addNF(target) {
            if (target && !target.unmounted) {
                target.setSelected(true);
            }
        }
    }, {
        key: 'setSelectedNF',
        value: function setSelectedNF(target, addMode) {
            if (target == null) {
                this.selectedNFManager.clear();
                return;
            }
            if (this.selectedNFManager.isSelected(target)) {
                return;
            }
            if (addMode == null || target == null) {
                addMode = false;
            }
            if (!addMode) {
                this.selectedNFManager.clear();
            }
            this.selectedNFManager.add(target);
        }
    }, {
        key: 'showNodeData',
        value: function showNodeData(nodeData) {
            var editingNode = this.state.editingNode;
            if (nodeData.bluePrint == null || nodeData.bluePrint != editingNode.bluePrint || nodeData.parent == null) return;

            if (editingNode != nodeData.parent) {
                this.setEditeNode(nodeData.parent);
                var self = this;
                setTimeout(function () {
                    self.showNodeData(nodeData);
                }, 50);
                return;
            }

            if (nodeData.currentComponent) {
                var frameElem = nodeData.currentComponent.frameRef.current;
                if (frameElem == null) return null;
                this.setSelectedNF(frameElem);
                var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
                var zoomRect = this.zoomDivRef.current.getBoundingClientRect();

                if (!MyMath.intersectRect(frameRect, zoomRect)) {
                    var targetPos = {
                        x: Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                        y: Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5)
                    };
                    //console.log(targetPos);
                    this.editorDivRef.current.style.left = targetPos.x + 'px';
                    this.editorDivRef.current.style.top = targetPos.y + 'px';
                }
            }
        }
    }, {
        key: 'keyUpHandler',
        value: function keyUpHandler(ev) {
            //console.log(ev);
            switch (ev.keyCode) {
                case 27:
                    // esc
                    if (!this.selectedNFManager.isEmpty()) {
                        this.setSelectedNF(null);
                    }
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                case 46:
                    if (!this.selectedNFManager.isEmpty()) {
                        var titles = '';
                        var nodes_arr = [];
                        this.selectedNFManager.forEach(function (nf) {
                            titles += nf.getNodeTitle(true) + ';';
                            nodes_arr.push(nf.props.nodedata);
                        });
                        this.wantDeleteNode(nodes_arr, titles);
                    }
                    break;
            }
        }
    }, {
        key: 'keyDownHandler',
        value: function keyDownHandler(ev) {
            if (!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40) {
                var offset = { x: 0, y: 0 };
                switch (ev.keyCode) {
                    case 40:
                        offset.y = 10;
                        break;
                    case 38:
                        offset.y = -10;
                        break;
                    case 37:
                        offset.x = -10;
                        break;
                    case 39:
                        offset.x = 10;
                        break;
                }
                this.selectedNFManager.forEach(function (nf) {
                    nf.addOffset(offset);
                });
                ev.preventDefault();
            }
        }
    }, {
        key: 'nodeFrameStartMove',
        value: function nodeFrameStartMove(srcNF) {
            if (this.selectedNFManager.count() > 1) {
                var srcPos = { x: srcNF.props.nodedata.left, y: srcNF.props.nodedata.top };
                this.selectedNFManager.forEach(function (nf) {
                    if (nf == srcNF) {
                        return;
                    }
                    nf.offsetBase = { x: nf.props.nodedata.left - srcPos.x, y: nf.props.nodedata.top - srcPos.y };
                });
            }
        }
    }, {
        key: 'nodeFrameMoving',
        value: function nodeFrameMoving(srcNF) {
            if (this.selectedNFManager.count() > 1) {
                var srcPos = { x: srcNF.props.nodedata.left, y: srcNF.props.nodedata.top };
                this.selectedNFManager.forEach(function (nf) {
                    if (nf == srcNF) {
                        return;
                    }
                    var theNode = nf.props.nodedata;
                    var offsetBase = nf.offsetBase;
                    theNode.setPos(srcPos.x + offsetBase.x, srcPos.y + offsetBase.y);
                    nf.reDraw();
                });
            }
        }
    }, {
        key: 'wantDeleteNode',
        value: function wantDeleteNode(nodeData_arr, title) {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除' + nodeData_arr.length + '个节点:"' + title + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo], nodeData_arr));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key, nodeData_arr) {
            if (key == 'ok') {
                this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
                this.setSelectedNF(null);
            }
        }
    }, {
        key: 'freshZoomDiv',
        value: function freshZoomDiv() {
            if (this.zoomDivRef.current) {
                var zoomDivElem = this.zoomDivRef.current;
                var $containerElem = $(this.containerRef.current);
                var $topBarElem = $(this.topBarRef.current);

                var newZoomDivSize = {
                    height: $containerElem.height() - $topBarElem.height(),
                    width: $containerElem.width(),
                    top: $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
                };

                if (this.preZoomDivSize == null) {
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                } else {
                    if (Math.abs(this.preZoomDivSize.height - newZoomDivSize.height) > 1) {
                        zoomDivElem.style.height = newZoomDivSize.height + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.width - newZoomDivSize.width) > 1) {
                        zoomDivElem.style.width = newZoomDivSize.width + 'px';
                    }
                    if (Math.abs(this.preZoomDivSize.top - newZoomDivSize.top) > 1) {
                        zoomDivElem.style.top = newZoomDivSize.top + 'px';
                    }
                }

                this.preZoomDivSize = newZoomDivSize;
            }
        }
    }, {
        key: 'listenBlueprint',
        value: function listenBlueprint(bp) {
            if (bp) {
                bp.on('changed', this.blueprinkChanged);
            };
            this.listenedBP = bp;
        }
    }, {
        key: 'unlistenBlueprint',
        value: function unlistenBlueprint(bp) {
            if (bp) {
                bp.off('changed', this.blueprinkChanged);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this9 = this;

            window.addEventListener('keyup', this.keyUpHandler);
            window.addEventListener('keydown', this.keyDownHandler);

            this.freshInt = setInterval(this.freshZoomDiv, 500);
            this.freshZoomDiv();

            if (this.state.editingNode) {
                var theNode = this.state.editingNode;
                setTimeout(function () {
                    _this9.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                    _this9.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
                }, 50);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            window.removeEventListener('keyup', this.keyUpHandler);
            window.removeEventListener('keydown', this.keyDownHandler);
            this.unlistenBlueprint(this.props.bluePrint);
            clearTimeout(this.delaySetTO);
            clearInterval(this.freshZoomDiv);
        }
    }, {
        key: 'mousemoveWidthDragingHandler',
        value: function mousemoveWidthDragingHandler(ev) {
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            var end = { x: ev.x - rootRect.left, y: ev.y - rootRect.top };
            var dragingPath = this.dragingPathRef.current;
            dragingPath.setState({
                end: end
            });
        }
    }, {
        key: 'mouseupWidthDragingHandler',
        value: function mouseupWidthDragingHandler(ev) {
            if (ev.target == this.editorDivRef.current) {
                if (this.preClickTime != null && Date.now() - this.preClickTime < 200) {
                    var dragingPath = this.dragingPathRef.current;
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                } else {
                    this.preClickTime = Date.now();
                    return;
                }
            }
        }
    }, {
        key: 'clickSocket',
        value: function clickSocket(srcSocket) {
            var srcNode = srcSocket.node;
            var dragingPath = this.dragingPathRef.current;
            if (dragingPath.state.draging == true) {
                var cancelDrag = false;
                if (srcSocket == dragingPath.state.startScoket) {
                    // 同一个socket连续点击
                    cancelDrag = true;
                } else if (dragingPath.state.startNode == srcNode) {
                    // 相同的node 忽略
                    //console.log('相同的node');
                    return;
                } else if (srcSocket.isFlowSocket != dragingPath.state.startScoket.isFlowSocket) {
                    return;
                } else {
                    // 点击了不同的socket
                    if (srcSocket.isIn != dragingPath.state.startScoket.isIn) {
                        // 不同node的in out才能相互链接
                        this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                        cancelDrag = true;
                    }
                }
                if (cancelDrag) {
                    dragingPath.setState({
                        draging: false,
                        start: null,
                        end: null
                    });
                    window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                    window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
                }
            } else {
                var rootRect = this.editorDivRef.current.getBoundingClientRect();
                dragingPath.setState({
                    draging: true,
                    start: srcSocket.currentComponent.getCenterPos(),
                    end: { x: WindowMouse.x - rootRect.left, y: WindowMouse.y - rootRect.top },
                    startScoket: srcSocket,
                    startNode: srcNode
                });
                window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }
    }, {
        key: 'setEditeNode',
        value: function setEditeNode(theNode) {
            var _this10 = this;

            if (theNode == this.state.editingNode) {
                return;
            }

            var editingNode = this.state.editingNode;
            if (editingNode) {
                editingNode.editorLeft = parseUnitInt(this.editorDivRef.current.style.left);
                editingNode.editorTop = parseUnitInt(this.editorDivRef.current.style.top);
                editingNode.postEditing(this);
            }

            this.setState({
                draging: false,
                editingNode: theNode,
                scale: 1,
                showLink: false
            });

            var self = this;
            setTimeout(function () {
                _this10.setState({
                    showLink: true
                });
            }, 50);

            if (theNode) {
                theNode.preEditing(this);
                theNode.bluePrint.editingNode = theNode;
                setTimeout(function () {
                    _this10.editorDivRef.current.style.left = (theNode.editorLeft == null ? 0 : theNode.editorLeft) + 'px';
                    _this10.editorDivRef.current.style.top = (theNode.editorTop == null ? 0 : theNode.editorTop) + 'px';
                }, 50);
            }
        }
    }, {
        key: 'genJSNode_Component',
        value: function genJSNode_Component(CName, nodeData) {
            var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
            return React.createElement(CName, { key: blueprintPrefix + nodeData.id, nodedata: nodeData, editorDivRef: this.editorDivRef, editor: this });
        }
    }, {
        key: 'renderNode',
        value: function renderNode(nodeData) {
            if (nodeData == null) return null;
            var settting = JSNodeClassMap[nodeData.type];
            if (settting == null) {
                console.warn(nodeData.type + ' 节点类型找不到映射');
                return null;
            }
            return this.genJSNode_Component(settting.comClass, nodeData);
        }
    }, {
        key: 'transToEditorPos',
        value: function transToEditorPos(pt) {
            var $zoomDivElem = $(this.zoomDivRef.current);
            var zoomOffset = $zoomDivElem.offset();

            var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
            var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
            return {
                x: x,
                y: y
            };
        }
    }, {
        key: 'addVarGSNode',
        value: function addVarGSNode(config, windPos) {
            var editingNode = this.state.editingNode;
            var editorPos = this.transToEditorPos(windPos);
            var newNodeData = null;
            if (config.isGet) {
                newNodeData = new JSNode_Var_Get({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            } else {
                newNodeData = new JSNode_Var_Set({ left: editorPos.x, top: editorPos.y, varName: config.varName }, editingNode);
            }
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'createNewNode',
        value: function createNewNode(nodeClass, initData) {
            var editorDiv = this.editorDivRef.current;
            var editingNode = this.state.editingNode;
            var newNode = new nodeClass(Object.assign({
                newborn: true,
                left: -parseUnitInt(editorDiv.style.left),
                top: -parseUnitInt(editorDiv.style.top)
            }, initData), editingNode);

            this.setState({
                magicObj: {}
            });
            return newNode;
        }
    }, {
        key: 'createCanUseDS',
        value: function createCanUseDS(dsconfig) {
            this.createNewNode(JSNode_CurrentDataRow, {
                formID: dsconfig.formID,
                dscode: dsconfig.entity.code,
                dsentity: dsconfig.entity
            });
        }
    }, {
        key: 'createCtrlKernel',
        value: function createCtrlKernel(ctlID) {
            this.createNewNode(JSNODE_CtlKernel, {
                ctlID: ctlID
            });
        }
    }, {
        key: 'createApiObj',
        value: function createApiObj(apiClass, apiItem) {
            switch (apiItem.type) {
                case EApiType.Prop:
                    this.createNewNode(JSNode_Control_Api_Prop, {
                        apiClass: apiClass,
                        apiItem: apiItem
                    });
                    break;
                case EApiType.PropSetter:
                    this.createNewNode(JSNode_Control_Api_PropSetter, {
                        apiClass: apiClass,
                        apiItem: apiItem
                    });
                    break;
            }
        }
    }, {
        key: 'mouseDownNodeCtlrHandler',
        value: function mouseDownNodeCtlrHandler(ctlData) {
            var editorDiv = this.editorDivRef.current;
            var editingNode = this.state.editingNode;
            var newNodeData = new ctlData.nodeClass({ newborn: true, left: -parseUnitInt(editorDiv.style.left), top: -parseUnitInt(editorDiv.style.top) }, editingNode);
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'mousemoveWithDragHandler',
        value: function mousemoveWithDragHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            //var scrollNode = this.editorDivRef.current.parentNode;
            //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
            //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
            //console.log(offset);
            var editingNode = this.state.editingNode;
            editingNode.editorLeft = this.dragOrgin.left + offset.x;
            editingNode.editorTop = this.dragOrgin.top + offset.y;
            this.editorDivRef.current.style.left = editingNode.editorLeft + 'px';
            this.editorDivRef.current.style.top = editingNode.editorTop + 'px';
        }
    }, {
        key: 'mouseupWithDragHandler',
        value: function mouseupWithDragHandler(ev) {
            this.draging = false;
            window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
            window.removeEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }, {
        key: 'mousemoveWithSelectHandler',
        value: function mousemoveWithSelectHandler(ev) {
            var offset = { x: ev.x - this.dragOrgin.x, y: ev.y - this.dragOrgin.y };
            this.selectRectRef.current.setSize({
                width: offset.x,
                height: offset.y
            });
        }
    }, {
        key: 'mouseupWithSelectHandler',
        value: function mouseupWithSelectHandler(ev) {
            // check
            var theRect = this.selectRectRef.current.getRect();
            var hitNodes_arr = [];
            this.state.editingNode.nodes_arr.forEach(function (node) {
                var nodeRect = node.getRect();
                if (MyMath.intersectRect(nodeRect, theRect)) {
                    hitNodes_arr.push(node);
                }
            });
            if (!ev.ctrlKey) {
                this.selectedNFManager.clear();
            }
            if (hitNodes_arr.length > 0) {
                for (var i in hitNodes_arr) {
                    this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
                }
            }

            window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
            window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
            this.selectRectRef.current.setSize({
                width: 0,
                height: 0
            });
        }
    }, {
        key: 'rootMouseDownHandler',
        value: function rootMouseDownHandler(ev) {
            if (ev.target == this.zoomDivRef.current && this.draging != true) {
                var nowPos = {
                    x: parseUnitInt(this.editorDivRef.current.style.left),
                    y: parseUnitInt(this.editorDivRef.current.style.top)
                };
                this.dragOrgin = { x: WindowMouse.x, y: WindowMouse.y, left: nowPos.x, top: nowPos.y };
                if (ev.button == 0) {
                    // 拉取选择范围
                    var editorPos = this.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });
                    this.selectRectRef.current.setSize({
                        left: editorPos.x,
                        top: editorPos.y
                    });
                    window.addEventListener('mousemove', this.mousemoveWithSelectHandler);
                    window.addEventListener('mouseup', this.mouseupWithSelectHandler);
                    return;
                }
                this.draging = true;
                //var scrollNode = this.editorDivRef.current.parentNode;
                //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
                window.addEventListener('mousemove', this.mousemoveWithDragHandler);
                window.addEventListener('mouseup', this.mouseupWithDragHandler);
            }
        }
    }, {
        key: 'mouseWhileHandler',
        value: function mouseWhileHandler(ev) {
            console.log(ev);
        }
    }, {
        key: 'clickBigBtnHandler',
        value: function clickBigBtnHandler(ev) {
            var newScale = Math.min(this.state.scale + 0.1, 1);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickSmallBtnHandler',
        value: function clickSmallBtnHandler(ev) {
            var newScale = Math.max(this.state.scale - 0.1, 0.3);
            if (newScale != this.state.scale) {
                this.setState({
                    scale: newScale
                });
            }
        }
    }, {
        key: 'clickNavBtnHandler',
        value: function clickNavBtnHandler(ev) {
            var nodeId = getAttributeByNode(ev.target, 'data-id');
            if (nodeId == null) return;
            var theNode = this.props.bluePrint.getNodeByID(nodeId);
            if (theNode == this.state.editingNode) {
                return;
            }
            this.setEditeNode(theNode);
        }
    }, {
        key: 'clickCompileBtnHandler',
        value: function clickCompileBtnHandler(ev) {
            var theBluePrint = this.props.bluePrint;
            this.logManager.clear();
            this.logManager.log("开始编译[" + theBluePrint.name + ']');
            var compileHelper = new JSNode_CompileHelper(this.logManager, this);
            var compileRet = theBluePrint.compile(compileHelper);
            if (compileRet == false) {
                this.logManager.log('[' + theBluePrint.name + ']编译失败');
            } else {
                this.logManager.log('[' + theBluePrint.name + ']编译成功');
                this.logManager.log(compileRet.getString('', '\t', '\n'));
                console.log(compileRet.getString('', '\t', '\n'));
                compileHelper.appendedOutputItems_arr.forEach(function (item) {
                    console.log(item.getString('', '\t', '\n'));
                });
            }
            this.logManager.log('共' + this.logManager.getCount(LogTag_Warning) + '条警告,' + this.logManager.getCount(LogTag_Error) + '条错误,');
        }
    }, {
        key: 'clickExportBtnHandler',
        value: function clickExportBtnHandler(ev) {
            console.log("Start export");
            var editingNode = this.state.editingNode;
            var json = editingNode.bluePrint.getJson();
            var text = JSON.stringify(json);
            console.log(text);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var editingNode = this.state.editingNode;
            var self = this;
            if (editingNode == null && this.props.bluePrint == null) {
                return null;
            }
            if (editingNode == null || this.props.bluePrint != editingNode.bluePrint) {
                this.selectedNFManager.clear(false);
                clearTimeout(this.delaySetTO);
                this.delaySetTO = setTimeout(function () {
                    self.setEditeNode(self.props.bluePrint == null ? null : self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint);
                    self.delaySetTO = null;
                }, 10);
            }
            if (editingNode == null) {
                return null;
            }
            var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
            nodeParentList.push(editingNode);
            if (this.editorDivRef.current) {
                this.editorDivRef.current.scale = this.state.scale;
            }
            var self = this;
            var blueprintPrefix = editingNode.bluePrint.id + '_';
            if (this.listenedBP != editingNode.bluePrint) {
                this.unlistenBlueprint(this.listenedBP);
                this.listenBlueprint(editingNode.bluePrint);
            }
            var linkPool = editingNode.bluePrint.linkPool;

            return React.createElement(SplitPanel, {
                defPercent: 0.2,
                maxSize: '400px',
                barClass: 'bg-secondary',
                panel1: React.createElement(JSNodeEditorLeftPanel, { onMouseDown: this.mouseDownNodeCtlrHandler, editingNode: editingNode, editorDivRef: this.editorDivRef, editor: self }),
                panel2: React.createElement(SplitPanel, {
                    defPercent: 0.8,
                    barClass: 'bg-secondary',
                    flexColumn: true,
                    panel1: React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column', ref: this.containerRef },
                        React.createElement(
                            'div',
                            { className: 'flex-grow-0 flex-shrink-0 border bg-light ', style: { height: '40px' }, ref: this.topBarRef },
                            React.createElement(
                                'div',
                                { className: 'd-flex flex-grow-1 flex-shrink-1' },
                                React.createElement(
                                    'ul',
                                    { className: 'nav nav-pills flex-grow-1 flex-shrink-1' },
                                    nodeParentList.map(function (nodeData) {
                                        return React.createElement(
                                            'li',
                                            { className: 'nav-item', key: nodeData.id },
                                            React.createElement(
                                                'a',
                                                { className: "nav-link" + (nodeData == editingNode ? ' active' : ''), href: '#', 'data-id': nodeData.id, onClick: _this11.clickNavBtnHandler },
                                                nodeData.getNodeTitle(),
                                                nodeData != editingNode && React.createElement('i', { className: 'fa fa-angle-right ml-1' })
                                            )
                                        );
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'btn-group flex-grow-0 flex-shrink-0' },
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickCompileBtnHandler, className: 'btn btn-dark' },
                                        '\u7F16\u8BD1'
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickExportBtnHandler, className: 'btn btn-dark' },
                                        '\u5BFC\u51FA'
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickBigBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-plus' })
                                    ),
                                    React.createElement(
                                        'button',
                                        { type: 'button', onClick: this.clickSmallBtnHandler, className: 'btn btn-dark' },
                                        React.createElement('i', { className: 'fa fa-search-minus' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'flex-grow-1 flex-shrink-1 position-absolute hidenOverflow', style: { zoom: this.state.scale }, ref: this.zoomDivRef, onMouseDown: this.rootMouseDownHandler },
                            React.createElement(
                                'div',
                                { ref: this.editorDivRef, className: 'd-block position-absolute bg-dark', style: { width: '10px', height: '10px', overflow: 'visible' } },
                                editingNode.nodes_arr.map(function (nd) {
                                    return _this11.renderNode(nd); //<G_Node key={nd.id} data={nd} />
                                }),
                                React.createElement(C_Node_Link, { ref: this.dragingPathRef, editorDivRef: this.editorDivRef }),
                                this.state.showLink && linkPool.getAllLink().map(function (linkobj) {
                                    return React.createElement(C_Node_Link, { key: blueprintPrefix + linkobj.id, link: linkobj, editorDivRef: _this11.editorDivRef });
                                }),
                                React.createElement(C_SelectRect, { ref: this.selectRectRef })
                            )
                        )
                    ),
                    panel2: React.createElement(
                        'div',
                        { className: 'bg-dark m-100 h-100 flex-grow-1 flex-shrink-1' },
                        React.createElement(LogOutputPanel, { source: this.logManager })
                    )
                })
            });
        }
    }]);

    return C_JSNode_Editor;
}(React.PureComponent);

var JsNodeOutlineItem = function (_React$PureComponent5) {
    _inherits(JsNodeOutlineItem, _React$PureComponent5);

    function JsNodeOutlineItem(props) {
        _classCallCheck(this, JsNodeOutlineItem);

        var _this12 = _possibleConstructorReturn(this, (JsNodeOutlineItem.__proto__ || Object.getPrototypeOf(JsNodeOutlineItem)).call(this, props));

        autoBind(_this12);

        _this12.state = {
            label: _this12.props.nodeData.getNodeTitle(true),
            nodeData: _this12.props.nodeData
        };
        return _this12;
    }

    _createClass(JsNodeOutlineItem, [{
        key: 'listenNode',
        value: function listenNode(target) {
            target.on('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(target) {
            target.off('changed', this.nodeChangedhandler);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenNode(this.state.nodeData);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenNode(this.state.nodeData);
        }
    }, {
        key: 'nodeChangedhandler',
        value: function nodeChangedhandler() {
            this.setState({
                label: this.state.nodeData.getNodeTitle()
            });
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            this.props.clickHandler(this.state.nodeData);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.nodeData != this.props.nodeData) {
                this.unlistenNode(this.state.nodeData);
                this.listenNode(this.props.nodeData);
                var self = this;
                var newNodeData = this.props.nodeData;
                setTimeout(function () {
                    self.setState({
                        nodeData: newNodeData,
                        label: newNodeData.getNodeTitle(true)
                    });
                }, 20);
                return null;
            }
            return React.createElement(
                'div',
                { className: 'text-nowrap text-light cursor-pointer', onClick: this.clickHandler },
                this.state.label
            );
        }
    }]);

    return JsNodeOutlineItem;
}(React.PureComponent);

var JSDef_Variable_Component = function (_React$PureComponent6) {
    _inherits(JSDef_Variable_Component, _React$PureComponent6);

    function JSDef_Variable_Component(props) {
        _classCallCheck(this, JSDef_Variable_Component);

        var _this13 = _possibleConstructorReturn(this, (JSDef_Variable_Component.__proto__ || Object.getPrototypeOf(JSDef_Variable_Component)).call(this, props));

        var varData = _this13.props.varData;
        _this13.state = {
            name: varData.name,
            valType: varData.valType,
            isParam: varData.isParam,
            default: varData.default,
            editing: varData.needEdit == true
        };

        autoBind(_this13);
        return _this13;
    }

    _createClass(JSDef_Variable_Component, [{
        key: 'varChanged',
        value: function varChanged() {
            if (this.state.editing) {
                return;
            }
            var varData = this.props.varData;
            this.setState({
                name: varData.name,
                valType: varData.valType,
                isParam: varData.isParam,
                editing: varData.editing,
                default: varData.default
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.varData.on('changed', this.varChanged);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.varData.off('changed', this.varChanged);
        }
    }, {
        key: 'nameInputChangeHanlder',
        value: function nameInputChangeHanlder(ev) {
            this.setState({
                name: ev.target.value
            });
        }
    }, {
        key: 'valTypeChangedHandler',
        value: function valTypeChangedHandler(newData) {
            this.setState({
                valType: newData
            });
        }
    }, {
        key: 'isParamChangedHandler',
        value: function isParamChangedHandler(newCode) {
            this.setState({
                isParam: newCode
            });
        }
    }, {
        key: 'defaultInputChangedHandler',
        value: function defaultInputChangedHandler(ev) {
            this.setState({
                default: ev.target.value
            });
        }
    }, {
        key: 'clickEditBtnHandler',
        value: function clickEditBtnHandler() {
            if (this.state.editing) {
                var tval = Object.assign({}, this.state);
                tval.editing = false;
                this.props.varData.setProp(tval);
            }
            this.setState({
                editing: !this.state.editing
            });
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler() {
            gTipWindow.popAlert(makeAlertData('警告', '确定删除变量:"' + this.state.name + '"?', this.deleteTipCallback, [TipBtnOK, TipBtnNo]));
        }
    }, {
        key: 'deleteTipCallback',
        value: function deleteTipCallback(key) {
            if (key == 'ok') {
                this.props.varData.bluePrint.removeVariable(this.props.varData);
            }
        }
    }, {
        key: 'labelMouseDownHandler',
        value: function labelMouseDownHandler(ev) {
            this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
            window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
        }
    }, {
        key: 'labelWindowMouseUpHandler',
        value: function labelWindowMouseUpHandler(ev) {
            if (this.dragTimeOut) {
                clearTimeout(this.dragTimeOut);
            }
        }
    }, {
        key: 'genDragContentFun',
        value: function genDragContentFun() {
            var varData = this.props.varData;
            return React.createElement(
                'span',
                { className: 'text-nowrap border bg-dark text-light' },
                '变量:' + varData.name
            );
        }
    }, {
        key: 'dragTimeOutHandler',
        value: function dragTimeOutHandler() {
            var designer = this.props.varData.bluePrint.master.project.designer;
            designer.startDrag({ info: '放置变量' }, this.dragEndHandler, this.genDragContentFun);
        }
    }, {
        key: 'dragMenuCallBack',
        value: function dragMenuCallBack(menuItem, pos) {
            var varData = this.props.varData;
            if (menuItem.key == 'SET') {
                this.props.editor.addVarGSNode({ isGet: false, varName: varData.name }, pos);
            } else if (menuItem.key == 'GET') {
                //console.log('get');
                this.props.editor.addVarGSNode({ isGet: true, varName: varData.name }, pos);
            }
        }
    }, {
        key: 'dragEndHandler',
        value: function dragEndHandler(pos) {
            var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
            if (MyMath.isPointInRect(editorRect, pos)) {
                var designer = this.props.varData.bluePrint.master.project.designer;
                var varData = this.props.varData;
                //this.dragMenuCallBack(new QuickMenuItem('Get ' + varData.name, 'GET'), pos);
                designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'), new QuickMenuItem('Get ' + varData.name, 'GET')], pos, this.dragMenuCallBack);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var varData = this.props.varData;
            var editing = this.state.editing;
            if (!editing) {
                return React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg', onClick: this.clickEditBtnHandler }),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem',
                            onMouseDown: this.labelMouseDownHandler },
                        varData.name,
                        varData.isParam ? React.createElement(
                            'span',
                            { className: 'm-1 badge badge-info' },
                            '\u53C2\u6570'
                        ) : null,
                        React.createElement(
                            'span',
                            { className: 'm-1 badge badge-secondary' },
                            varData.valType
                        )
                    ),
                    React.createElement('i', { className: 'fa fa-trash fa-lg', onClick: this.clickTrashHandler })
                );
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary' },
                React.createElement(
                    'div',
                    { className: 'd-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center' },
                    React.createElement('i', { className: 'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info'), onClick: this.clickEditBtnHandler }),
                    React.createElement('input', { onChange: this.nameInputChangeHanlder, type: 'text', value: this.state.name, className: 'flexinput flex-grow-1 flex-shrink-1' }),
                    React.createElement(DropDownControl, { itemChanged: this.valTypeChangedHandler, btnclass: 'btn-dark', options_arr: JsValueTypes, rootclass: 'flex-grow-0 flex-shrink-0', textAttrName: 'name', valueAttrName: 'code', value: this.state.valType })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex w-100 flex-grow-0 flex-shrink-0 align-items-center' },
                    React.createElement(
                        'span',
                        { className: 'text-light' },
                        '\u9ED8\u8BA4\u503C'
                    ),
                    React.createElement('input', { onChange: this.defaultInputChangedHandler, type: 'text', value: this.state.default, className: 'flexinput flex-grow-1 flex-shrink-1' }),
                    React.createElement(DropDownControl, { itemChanged: this.isParamChangedHandler, btnclass: 'btn-dark', options_arr: ISParam_Options_arr, rootclass: 'flex-grow-0 flex-shrink-0', textAttrName: 'name', valueAttrName: 'code', value: this.state.isParam })
                )
            );
        }
    }]);

    return JSDef_Variable_Component;
}(React.PureComponent);