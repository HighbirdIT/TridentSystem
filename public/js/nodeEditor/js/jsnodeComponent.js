'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_JSNode_Var_Get = function (_React$PureComponent) {
    _inherits(C_JSNode_Var_Get, _React$PureComponent);

    function C_JSNode_Var_Get(props) {
        _classCallCheck(this, C_JSNode_Var_Get);

        var _this = _possibleConstructorReturn(this, (C_JSNode_Var_Get.__proto__ || Object.getPrototypeOf(C_JSNode_Var_Get)).call(this, props));

        autoBind(_this);

        C_NodeCom_Base(_this);
        _this.state = {
            //nodedata:this.props.nodedata,
        };
        return _this;
    }

    _createClass(C_JSNode_Var_Get, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: 'GET' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_JSNode_Var_Get;
}(React.PureComponent);

var C_JSNode_Var_Set = function (_React$PureComponent2) {
    _inherits(C_JSNode_Var_Set, _React$PureComponent2);

    function C_JSNode_Var_Set(props) {
        _classCallCheck(this, C_JSNode_Var_Set);

        var _this2 = _possibleConstructorReturn(this, (C_JSNode_Var_Set.__proto__ || Object.getPrototypeOf(C_JSNode_Var_Set)).call(this, props));

        autoBind(_this2);

        C_NodeCom_Base(_this2);

        _this2.state = {};
        return _this2;
    }

    _createClass(C_JSNode_Var_Set, [{
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: 'SET' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_JSNode_Var_Set;
}(React.PureComponent);

var C_JSNode_NOperand = function (_React$PureComponent3) {
    _inherits(C_JSNode_NOperand, _React$PureComponent3);

    function C_JSNode_NOperand(props) {
        _classCallCheck(this, C_JSNode_NOperand);

        var _this3 = _possibleConstructorReturn(this, (C_JSNode_NOperand.__proto__ || Object.getPrototypeOf(C_JSNode_NOperand)).call(this, props));

        autoBind(_this3);

        C_NodeCom_Base(_this3);
        _this3.state = {
            operator: _this3.props.nodedata.operator
        };
        return _this3;
    }

    _createClass(C_JSNode_NOperand, [{
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(newoperator) {
            var nodeData = this.props.nodedata;
            nodeData.operator = newoperator;
            this.setState({
                operator: newoperator
            });
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    width: '40px',
                    margin: 'auto'
                };
                this.outDivStyle = {
                    minWidth: '100px'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(
                'div',
                { style: this.outDivStyle, 'f-canmove': 1 },
                React.createElement(DropDownControl, { options_arr: ['+', '-', '*', '/'], value: nodeData.operator, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null })
                )
            );
        }
    }]);

    return C_JSNode_NOperand;
}(React.PureComponent);

var C_JSNode_CurrentDataRow = function (_React$PureComponent4) {
    _inherits(C_JSNode_CurrentDataRow, _React$PureComponent4);

    function C_JSNode_CurrentDataRow(props) {
        _classCallCheck(this, C_JSNode_CurrentDataRow);

        var _this4 = _possibleConstructorReturn(this, (C_JSNode_CurrentDataRow.__proto__ || Object.getPrototypeOf(C_JSNode_CurrentDataRow)).call(this, props));

        autoBind(_this4);

        C_NodeCom_Base(_this4);
        var nodeData = _this4.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var formKernel = theProject.getControlById(nodeData.formID);

        _this4.state = {
            formKernel: formKernel
        };
        return _this4;
    }

    _createClass(C_JSNode_CurrentDataRow, [{
        key: 'formAttrChangedHandler',
        value: function formAttrChangedHandler(ev) {
            if (ev.name == AttrNames.DataSource || ev.name == AttrNames.name) {
                this.reDraw();
            }
        }
    }, {
        key: 'cus_componentWillMount',
        value: function cus_componentWillMount() {
            if (this.state.formKernel) {
                this.state.formKernel.on(EATTRCHANGED, this.formAttrChangedHandler);
            }
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            if (this.state.formKernel) {
                this.state.formKernel.off(EATTRCHANGED, this.formAttrChangedHandler);
            }
        }
    }, {
        key: 'socketColumnSelectChanged',
        value: function socketColumnSelectChanged(newVal, ddc) {
            var socket = ddc.props.socket;
            socket.setExtra('colName', newVal);
        }
    }, {
        key: 'getCanUseColumns',
        value: function getCanUseColumns() {
            return this.canUseColumns_arr == null ? [] : this.canUseColumns_arr;
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            if (socket.isIn == true) {
                return null;
            }
            var nowVal = socket.getExtra('colName');

            return React.createElement(
                'span',
                null,
                React.createElement(DropDownControl, { itemChanged: this.socketColumnSelectChanged, btnclass: 'btn-dark', options_arr: this.getCanUseColumns, rootclass: 'flex-grow-1 flex-shrink-1', value: nowVal, socket: socket })
            );
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            var nodeData = this.props.nodedata;
            var formKernel = this.state.formKernel;
            var titleElem = null;
            if (formKernel == null) {
                titleElem = React.createElement(
                    'span',
                    { 'f-canmove': 1, className: 'text-danger' },
                    '\u65E0\u6548\u7684FormID',
                    nodeData.id
                );
            } else {
                var formDS = formKernel.getAttribute(AttrNames.DataSource);
                var newColumns = [];
                if (formDS != null) {
                    formDS.columns.forEach(function (colItem) {
                        newColumns.push(colItem.name);
                    });
                }
                this.canUseColumns_arr = newColumns;
                titleElem = React.createElement(
                    'div',
                    { 'f-canmove': 1, className: 'd-flex flex-column' },
                    React.createElement(
                        'span',
                        { 'f-canmove': 1 },
                        formKernel.getReadableName()
                    ),
                    React.createElement(
                        'span',
                        { 'f-canmove': 1, className: 'badge badge-info' },
                        formDS == null ? '无数据源' : formDS.name + '-当前行'
                    )
                );
            }

            return titleElem;
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.processOutputSockets, customSocketRender: this.customSocketRender })
                )
            );
        }
    }]);

    return C_JSNode_CurrentDataRow;
}(React.PureComponent);

var C_JSNODE_Insert_table = function (_React$PureComponent5) {
    _inherits(C_JSNODE_Insert_table, _React$PureComponent5);

    function C_JSNODE_Insert_table(props) {
        _classCallCheck(this, C_JSNODE_Insert_table);

        var _this5 = _possibleConstructorReturn(this, (C_JSNODE_Insert_table.__proto__ || Object.getPrototypeOf(C_JSNODE_Insert_table)).call(this, props));

        autoBind(_this5);
        _this5.dropdownRef = React.createRef();

        C_NodeCom_Base(_this5);
        return _this5;
    }

    _createClass(C_JSNODE_Insert_table, [{
        key: 'dbItemChanged',
        value: function dbItemChanged(newCode) {
            console.log(newCode);
            this.props.nodedata.setDSCode(newCode);
        }
    }, {
        key: 'render',
        value: function render() {
            var nowVal = this.props.nodedata.dsCode;
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: 'Insert' },
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dbItemChanged, btnclass: 'btn-dark', options_arr: g_dataBase.getAllTable, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: nowVal ? nowVal : -1 })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null }),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-column' },
                        React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outFlowSockets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                        React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null })
                    )
                )
            );
        }
    }]);

    return C_JSNODE_Insert_table;
}(React.PureComponent);

var C_JSNode_DateFun = function (_React$PureComponent6) {
    _inherits(C_JSNode_DateFun, _React$PureComponent6);

    function C_JSNode_DateFun(props) {
        _classCallCheck(this, C_JSNode_DateFun);

        var _this6 = _possibleConstructorReturn(this, (C_JSNode_DateFun.__proto__ || Object.getPrototypeOf(C_JSNode_DateFun)).call(this, props));

        autoBind(_this6);

        C_NodeCom_Base(_this6);
        return _this6;
    }

    _createClass(C_JSNode_DateFun, [{
        key: 'funNameSelectChanged',
        value: function funNameSelectChanged(newVal) {
            this.props.nodedata.setFunName(newVal);
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    minWidth: '150px',
                    margin: 'auto'
                };
            }
            var funName = this.props.nodedata.funName;
            return React.createElement(DropDownControl, { style: this.ddcStyle, itemChanged: this.funNameSelectChanged, btnclass: 'btn-dark', options_arr: gJSDateFuns_arr, rootclass: 'flex-grow-0 flex-shrink-0', value: funName, textAttrName: 'name' });
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_JSNode_DateFun;
}(React.PureComponent);

var C_JSNode_Query_Sql = function (_React$PureComponent7) {
    _inherits(C_JSNode_Query_Sql, _React$PureComponent7);

    function C_JSNode_Query_Sql(props) {
        _classCallCheck(this, C_JSNode_Query_Sql);

        var _this7 = _possibleConstructorReturn(this, (C_JSNode_Query_Sql.__proto__ || Object.getPrototypeOf(C_JSNode_Query_Sql)).call(this, props));

        autoBind(_this7);
        C_NodeCom_Base(_this7);

        _this7.state = {};

        _this7.dropdownRef = React.createRef();
        return _this7;
    }

    _createClass(C_JSNode_Query_Sql, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            if (entity) {
                this.dropdownRef.current.setValue(entity.code);
            }
            this.setState({ magicObj: {} });
        }
    }, {
        key: 'cus_componentWillMount',
        value: function cus_componentWillMount() {
            this.listenData(this.props.nodedata);
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            this.unlistenData(this.props.nodedata);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {
            if (nodeData) {
                nodeData.on('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {
            if (nodeData) {
                nodeData.off('changed', this.nodeDataChangedHandler);
            }
        }
    }, {
        key: 'dropdownCtlChangedHandler',
        value: function dropdownCtlChangedHandler(selectedDBE) {
            var nodeData = this.props.nodedata;
            nodeData.setEntity(selectedDBE);
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, getTitleFun: this.getNodeTitle, editor: this.props.editor, headType: 'tiny', headText: '\u67E5\u8BE2SQL' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: nodeData.bluePrint.master.project.dataMaster.getAllEntities, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                )
            );
        }
    }]);

    return C_JSNode_Query_Sql;
}(React.PureComponent);

var C_JSNode_Logical_Operator = function (_React$PureComponent8) {
    _inherits(C_JSNode_Logical_Operator, _React$PureComponent8);

    function C_JSNode_Logical_Operator(props) {
        _classCallCheck(this, C_JSNode_Logical_Operator);

        var _this8 = _possibleConstructorReturn(this, (C_JSNode_Logical_Operator.__proto__ || Object.getPrototypeOf(C_JSNode_Logical_Operator)).call(this, props));

        autoBind(_this8);

        C_NodeCom_Base(_this8);
        _this8.state = {
            LogicalType: _this8.props.nodedata.LogicalType
        };
        return _this8;
    }

    _createClass(C_JSNode_Logical_Operator, [{
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(newLogicalType) {
            var nodeData = this.props.nodedata;
            nodeData.LogicalType = newLogicalType;
            this.setState({
                LogicalType: newLogicalType
            });
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    width: '100px',
                    margin: '10px'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(DropDownControl, { options_arr: Logical_Operators_arr, value: nodeData.LogicalType, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle });
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null })
                )
            );
        }
    }]);

    return C_JSNode_Logical_Operator;
}(React.PureComponent);

var C_JSNODE_Do_FlowStep = function (_React$PureComponent9) {
    _inherits(C_JSNODE_Do_FlowStep, _React$PureComponent9);

    function C_JSNODE_Do_FlowStep(props) {
        _classCallCheck(this, C_JSNODE_Do_FlowStep);

        var _this9 = _possibleConstructorReturn(this, (C_JSNODE_Do_FlowStep.__proto__ || Object.getPrototypeOf(C_JSNODE_Do_FlowStep)).call(this, props));

        autoBind(_this9);
        _this9.dropdownRef = React.createRef();

        C_NodeCom_Base(_this9);
        return _this9;
    }

    _createClass(C_JSNODE_Do_FlowStep, [{
        key: 'flowStepDDCChanged',
        value: function flowStepDDCChanged(code, ddc, flowStep) {
            this.props.nodedata.setFlowStep(flowStep);
        }
    }, {
        key: 'render',
        value: function render() {
            var nowVal = this.props.nodedata.flowStepCode;
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: '申请执行流程步骤' },
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.flowStepDDCChanged, btnclass: 'btn-dark', options_arr: gFlowMaster.getAllSteps, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'fullName', valueAttrName: 'code', value: nowVal ? nowVal : -1 })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outFlowSockets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null })
                )
            );
        }
    }]);

    return C_JSNODE_Do_FlowStep;
}(React.PureComponent);