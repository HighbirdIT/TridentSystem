'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_SqlNode_Select = function (_React$PureComponent) {
    _inherits(C_SqlNode_Select, _React$PureComponent);

    function C_SqlNode_Select(props) {
        _classCallCheck(this, C_SqlNode_Select);

        var _this = _possibleConstructorReturn(this, (C_SqlNode_Select.__proto__ || Object.getPrototypeOf(C_SqlNode_Select)).call(this, props));

        autoBind(_this);
        C_NodeCom_Base(_this);

        _this.state = {};
        return _this;
    }

    _createClass(C_SqlNode_Select, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {}
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
        key: 'renderColumns',
        value: function renderColumns() {
            var nodeData = this.props.nodedata;
            var columns_arr = nodeData.columns_arr;
            if (columns_arr.length == 0) {
                return null;
            }
            var topValue = nodeData.columnNode.topValue;
            var distChecked = nodeData.columnNode.distChecked;
            if (topValue == null) {
                topValue = '';
            } else {
                topValue = ' top ' + topValue;
            }

            if (distChecked == null) {
                distChecked = false;
            } else {
                distChecked = true;
            }

            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement('div', { className: 'dropdown-divider' }),
                React.createElement(
                    'div',
                    null,
                    'Select',
                    topValue,
                    distChecked ? ' distinct' : ''
                ),
                columns_arr.map(function (column) {
                    return React.createElement(
                        'div',
                        { key: column.name, className: 'text-nowrap' },
                        column.name
                    );
                })
            );
        }
    }, {
        key: 'renderOrderColumns',
        value: function renderOrderColumns() {
            var nodeData = this.props.nodedata;
            var columns_arr = nodeData.orderColumns_arr;
            if (columns_arr.length == 0) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement('div', { className: 'dropdown-divider' }),
                React.createElement(
                    'div',
                    null,
                    'Order by'
                ),
                columns_arr.map(function (column) {
                    return React.createElement(
                        'div',
                        { key: column.name, className: 'text-nowrap' },
                        column.name + '  ' + column.orderType
                    );
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor })
                ),
                this.renderColumns(),
                this.renderOrderColumns()
            );
        }
    }]);

    return C_SqlNode_Select;
}(React.PureComponent);

var C_SqlNode_Select_Output = function (_React$PureComponent2) {
    _inherits(C_SqlNode_Select_Output, _React$PureComponent2);

    function C_SqlNode_Select_Output(props) {
        _classCallCheck(this, C_SqlNode_Select_Output);

        var _this2 = _possibleConstructorReturn(this, (C_SqlNode_Select_Output.__proto__ || Object.getPrototypeOf(C_SqlNode_Select_Output)).call(this, props));

        autoBind(_this2);

        _this2.state = {
            nodedata: _this2.props.nodedata
        };
        return _this2;
    }

    _createClass(C_SqlNode_Select_Output, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {}
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenData(this.state.nodedata);
            clearTimeout(this.delaySetTO);
        }
    }, {
        key: 'listenData',
        value: function listenData(nodeData) {}
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {}
    }, {
        key: 'clickHandler',
        value: function clickHandler() {
            //console.log('clickHandler');
            this.props.editor.setEditeNode(this.props.nodedata);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.state.nodedata != this.props.nodedata) {
                this.unlistenData(this.state.nodedata);
                this.listenData(this.props.nodedata);
                clearTimeout(this.delaySetTO);
                var self = this;
                this.delaySetTO = setTimeout(function () {
                    _this3.setState({
                        nodedata: _this3.props.nodedata
                    });
                    self.delaySetTO = null;
                }, 10);
            }
            var nodeData = this.state.nodedata;
            return React.createElement(
                C_Node_Frame,
                { nodedata: nodeData, clickHandler: this.clickHandler, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    '\u5217\u540D'
                )
            );
        }
    }]);

    return C_SqlNode_Select_Output;
}(React.PureComponent);

var C_SqlNode_Var_Get = function (_React$PureComponent3) {
    _inherits(C_SqlNode_Var_Get, _React$PureComponent3);

    function C_SqlNode_Var_Get(props) {
        _classCallCheck(this, C_SqlNode_Var_Get);

        var _this4 = _possibleConstructorReturn(this, (C_SqlNode_Var_Get.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Get)).call(this, props));

        autoBind(_this4);

        C_NodeCom_Base(_this4);
        _this4.state = {
            //nodedata:this.props.nodedata,
        };
        return _this4;
    }

    _createClass(C_SqlNode_Var_Get, [{
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

    return C_SqlNode_Var_Get;
}(React.PureComponent);

var C_SqlNode_NOperand = function (_React$PureComponent4) {
    _inherits(C_SqlNode_NOperand, _React$PureComponent4);

    function C_SqlNode_NOperand(props) {
        _classCallCheck(this, C_SqlNode_NOperand);

        var _this5 = _possibleConstructorReturn(this, (C_SqlNode_NOperand.__proto__ || Object.getPrototypeOf(C_SqlNode_NOperand)).call(this, props));

        autoBind(_this5);

        C_NodeCom_Base(_this5);
        _this5.state = {
            operator: _this5.props.nodedata.operator
        };
        return _this5;
    }

    _createClass(C_SqlNode_NOperand, [{
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

    return C_SqlNode_NOperand;
}(React.PureComponent);

var C_SqlNode_Compare = function (_React$PureComponent5) {
    _inherits(C_SqlNode_Compare, _React$PureComponent5);

    function C_SqlNode_Compare(props) {
        _classCallCheck(this, C_SqlNode_Compare);

        var _this6 = _possibleConstructorReturn(this, (C_SqlNode_Compare.__proto__ || Object.getPrototypeOf(C_SqlNode_Compare)).call(this, props));

        autoBind(_this6);

        C_NodeCom_Base(_this6);
        _this6.state = {
            operator: _this6.props.nodedata.operator
        };
        return _this6;
    }

    _createClass(C_SqlNode_Compare, [{
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
                    width: '50px',
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
                React.createElement(DropDownControl, { options_arr: ['>', '>=', '<', '<=', '==', '!='], value: nodeData.operator, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle })
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

    return C_SqlNode_Compare;
}(React.PureComponent);

var C_SqlNode_XJoin = function (_React$PureComponent6) {
    _inherits(C_SqlNode_XJoin, _React$PureComponent6);

    function C_SqlNode_XJoin(props) {
        _classCallCheck(this, C_SqlNode_XJoin);

        var _this7 = _possibleConstructorReturn(this, (C_SqlNode_XJoin.__proto__ || Object.getPrototypeOf(C_SqlNode_XJoin)).call(this, props));

        autoBind(_this7);

        C_NodeCom_Base(_this7);
        _this7.state = {
            joinType: _this7.props.nodedata.joinType
        };
        return _this7;
    }

    _createClass(C_SqlNode_XJoin, [{
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(newJoinType) {
            var nodeData = this.props.nodedata;
            nodeData.joinType = newJoinType;
            this.setState({
                joinType: newJoinType
            });
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    width: '100px',
                    margin: 'auto'
                };
                this.outDivStyle = {
                    minWidth: '150px'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(
                'div',
                { style: this.outDivStyle, 'f-canmove': 1 },
                React.createElement(DropDownControl, { options_arr: JoinTypes_arr, value: nodeData.joinType, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle })
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

    return C_SqlNode_XJoin;
}(React.PureComponent);

var C_Node_SimpleNode = function (_React$PureComponent7) {
    _inherits(C_Node_SimpleNode, _React$PureComponent7);

    function C_Node_SimpleNode(props) {
        _classCallCheck(this, C_Node_SimpleNode);

        var _this8 = _possibleConstructorReturn(this, (C_Node_SimpleNode.__proto__ || Object.getPrototypeOf(C_Node_SimpleNode)).call(this, props));

        autoBind(_this8);

        C_NodeCom_Base(_this8);
        _this8.state = {};
        return _this8;
    }

    _createClass(C_Node_SimpleNode, [{
        key: 'listenNode',
        value: function listenNode(theNode) {
            if (theNode) {
                theNode.on('changed', this.reDraw);
            }
            this.listenedNode = theNode;
        }
    }, {
        key: 'unlistenNode',
        value: function unlistenNode(theNode) {
            if (theNode) {
                theNode.off('changed', this.reDraw);
            }
        }
    }, {
        key: 'cus_componentWillUnmount',
        value: function cus_componentWillUnmount() {
            this.unlistenNode(this.props.nodedata);
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            if (this.listenedNode != nodeData) {
                this.unlistenNode(this.listenedNode);
                this.listenNode(nodeData);
            }
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            var rightElem = null;
            if (nodeData.outFlowSockets_arr == null) {
                rightElem = React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable });
            } else {
                rightElem = React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outFlowSockets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                );
            }
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: headType, headText: nodeData.label },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    rightElem
                )
            );
        }
    }]);

    return C_Node_SimpleNode;
}(React.PureComponent);

var C_SqlNode_DBEntity_ColumnSelector = function (_React$PureComponent8) {
    _inherits(C_SqlNode_DBEntity_ColumnSelector, _React$PureComponent8);

    function C_SqlNode_DBEntity_ColumnSelector(props) {
        _classCallCheck(this, C_SqlNode_DBEntity_ColumnSelector);

        var _this9 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity_ColumnSelector.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity_ColumnSelector)).call(this, props));

        autoBind(_this9);
        C_NodeCom_Base(_this9);

        _this9.state = {
            hadCheckbox: _this9.props.nodedata.parent.isSelectColumn != null
        };

        _this9.checkmap = {};
        return _this9;
    }

    _createClass(C_SqlNode_DBEntity_ColumnSelector, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            this.reDraw();
        }
    }, {
        key: 'selectChangedHandler',
        value: function selectChangedHandler(data) {
            var nodeData = this.props.nodedata;
            var needReDraw = false;
            if (data.tableAlias) {
                needReDraw = data.tableAlias == nodeData.alias;
            } else {
                needReDraw = data.tableCode == data.tableCode;
            }
            if (needReDraw) {
                this.reDraw();
            }
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
                nodeData.parent.on('selectchanged', this.selectChangedHandler);
            }
        }
    }, {
        key: 'unlistenData',
        value: function unlistenData(nodeData) {
            if (nodeData) {
                nodeData.off('changed', this.nodeDataChangedHandler);
                nodeData.parent.off('selectchanged', this.selectChangedHandler);
            }
        }
    }, {
        key: 'mouseDownColumnNameHandler',
        value: function mouseDownColumnNameHandler(ev) {
            if (ev.button == 0) {
                var nodeData = this.props.nodedata;
                var parentNodeData = nodeData.parent;
                var entity = nodeData.entity;
                var initPos = this.props.editor.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });

                var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
                var column = entity.columns.find(function (x) {
                    return x.name == columnName;
                });
                if (column) {
                    var newNode = parentNodeData.addNewColumn(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, initPos.x, initPos.y, true);
                }
                this.props.editor.reDraw();
            }
        }
    }, {
        key: 'checkboxChangeHandler',
        value: function checkboxChangeHandler(ev) {
            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
            var column = entity.columns.find(function (x) {
                return x.name == columnName;
            });
            if (column) {
                if (parentNodeData.bluePrint.type == "标量值") {
                    nodeData.clickFrameButton('unselect-all');
                    if (!this.checkmap[columnName]) setTimeout(function () {
                        parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, true);
                    }, 10);
                } else {
                    parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, !this.checkmap[columnName]);
                }
            }
        }
    }, {
        key: 'renderColumn',
        value: function renderColumn(entity, column, parentNodeData, nodeData) {
            var nodeData = this.props.nodedata;
            var compareKey = (nodeData.alias == null ? entity.code : nodeData.alias) + '.' + column.name;
            var hadCheckbox = this.state.hadCheckbox;
            var isCheck = hadCheckbox ? parentNodeData.isSelectColumn(compareKey) : false;
            this.checkmap[column.name] = isCheck;
            return React.createElement(
                'div',
                { key: column.name, className: 'd-flex flex-grow-1 align-items-center ', 'data-colname': column.name },
                hadCheckbox && React.createElement('input', { type: 'checkbox', onChange: this.checkboxChangeHandler, checked: isCheck }),
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 text-nowrap', onMouseDown: hadCheckbox ? this.checkboxChangeHandler : null },
                    column.name
                ),
                React.createElement('i', { className: 'fa fa-hand-paper-o cursor-pointer', onMouseDown: this.mouseDownColumnNameHandler })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: 'tiny', headText: nodeData.label },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-column' },
                    entity.columns.map(function (column) {
                        return _this10.renderColumn(entity, column, parentNodeData, nodeData);
                    })
                )
            );
        }
    }]);

    return C_SqlNode_DBEntity_ColumnSelector;
}(React.PureComponent);

var C_SqlNode_Var_Set = function (_React$PureComponent9) {
    _inherits(C_SqlNode_Var_Set, _React$PureComponent9);

    function C_SqlNode_Var_Set(props) {
        _classCallCheck(this, C_SqlNode_Var_Set);

        var _this11 = _possibleConstructorReturn(this, (C_SqlNode_Var_Set.__proto__ || Object.getPrototypeOf(C_SqlNode_Var_Set)).call(this, props));

        autoBind(_this11);

        C_NodeCom_Base(_this11);

        _this11.state = {};
        return _this11;
    }

    _createClass(C_SqlNode_Var_Set, [{
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

    return C_SqlNode_Var_Set;
}(React.PureComponent);

/**
 * 逻辑运算符 and or not
 */


var C_SqlNode_Logical_Operator = function (_React$PureComponent10) {
    _inherits(C_SqlNode_Logical_Operator, _React$PureComponent10);

    function C_SqlNode_Logical_Operator(props) {
        _classCallCheck(this, C_SqlNode_Logical_Operator);

        var _this12 = _possibleConstructorReturn(this, (C_SqlNode_Logical_Operator.__proto__ || Object.getPrototypeOf(C_SqlNode_Logical_Operator)).call(this, props));

        autoBind(_this12);

        C_NodeCom_Base(_this12);
        _this12.state = {
            LogicalType: _this12.props.nodedata.LogicalType
        };
        return _this12;
    }

    _createClass(C_SqlNode_Logical_Operator, [{
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

    return C_SqlNode_Logical_Operator;
}(React.PureComponent);

var C_SqlNode_Ret_Columns = function (_React$PureComponent11) {
    _inherits(C_SqlNode_Ret_Columns, _React$PureComponent11);

    function C_SqlNode_Ret_Columns(props) {
        _classCallCheck(this, C_SqlNode_Ret_Columns);

        var _this13 = _possibleConstructorReturn(this, (C_SqlNode_Ret_Columns.__proto__ || Object.getPrototypeOf(C_SqlNode_Ret_Columns)).call(this, props));

        autoBind(_this13);

        C_NodeCom_Base(_this13);
        _this13.state = {
            topValue: _this13.props.nodedata.topValue,
            distChecked: _this13.props.nodedata.distChecked

        };
        return _this13;
    }

    _createClass(C_SqlNode_Ret_Columns, [{
        key: 'topInputChangeHandler',
        value: function topInputChangeHandler(ev) {
            var topValue = ev.target.value;
            this.setState({ topValue: topValue });
            this.props.nodedata.topValue = topValue;
        }
    }, {
        key: 'distinctChangeHandler',
        value: function distinctChangeHandler(ev) {
            var distChecked = ev.target.checked;
            this.setState({
                distChecked: distChecked
            });
            this.props.nodedata.distChecked = distChecked;
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var topVal = this.state.topValue;
            var distvalue = this.state.distChecked;
            var disabled = null;
            if (topVal == null) {
                topVal = '';
            }
            if (nodeData.bluePrint.type == "标量值") {
                topVal = 1;
                disabled = "disabled";
            }
            if (distvalue == null) {
                distvalue = false;
            }
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: headType, headText: nodeData.label },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        null,
                        'Top:',
                        React.createElement('input', { type: 'text', className: 'flex-grow-1 flex-shrink-1', value: topVal, onChange: this.topInputChangeHandler, style: { width: '60px', height: '30px' }, disabled: disabled })
                    ),
                    React.createElement(
                        'div',
                        null,
                        'Distinct:',
                        React.createElement('input', { type: 'checkbox', id: 'distinct', className: 'flex-grow-1 flex-shrink-1 distinct', checked: distvalue, onChange: this.distinctChangeHandler, style: { display: 'none' } }),
                        React.createElement('label', { htmlFor: 'distinct', className: 'distinct' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.bluePrint.type == '表值' ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                )
            );
        }
    }]);

    return C_SqlNode_Ret_Columns;
}(React.PureComponent);

var C_SqlNode_Isnull_Operator = function (_React$PureComponent12) {
    _inherits(C_SqlNode_Isnull_Operator, _React$PureComponent12);

    function C_SqlNode_Isnull_Operator(props) {
        _classCallCheck(this, C_SqlNode_Isnull_Operator);

        var _this14 = _possibleConstructorReturn(this, (C_SqlNode_Isnull_Operator.__proto__ || Object.getPrototypeOf(C_SqlNode_Isnull_Operator)).call(this, props));

        autoBind(_this14);

        C_NodeCom_Base(_this14);
        _this14.state = {
            operator: _this14.props.nodedata.operator
        };
        return _this14;
    }

    _createClass(C_SqlNode_Isnull_Operator, [{
        key: 'IsNullChangedHandler',
        value: function IsNullChangedHandler(newoperator) {
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
                    width: '100px',
                    margin: 'auto'
                };
                this.outDivStyle = {
                    minWidth: '150px'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(
                'div',
                { style: this.outDivStyle, 'f-canmove': 1 },
                React.createElement(DropDownControl, { options_arr: [SqlOperator_IsNull, SqlOperator_IsNotNull], value: nodeData.operator, itemChanged: this.IsNullChangedHandler, style: this.ddcStyle })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: headType, headText: nodeData.label, cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                )
            );
        }
    }]);

    return C_SqlNode_Isnull_Operator;
}(React.PureComponent);

var C_SqlNode_Like = function (_React$PureComponent13) {
    _inherits(C_SqlNode_Like, _React$PureComponent13);

    function C_SqlNode_Like(props) {
        _classCallCheck(this, C_SqlNode_Like);

        var _this15 = _possibleConstructorReturn(this, (C_SqlNode_Like.__proto__ || Object.getPrototypeOf(C_SqlNode_Like)).call(this, props));

        autoBind(_this15);

        C_NodeCom_Base(_this15);
        _this15.state = {
            operator: _this15.props.nodedata.operator
        };
        return _this15;
    }

    _createClass(C_SqlNode_Like, [{
        key: 'LikeChangedHandler',
        value: function LikeChangedHandler(newoperator) {
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
                    width: '78px',
                    margin: 'auto'
                };
                this.outDivStyle = {
                    minWidth: '150px'
                };
            }
            var nodeData = this.props.nodedata;
            return React.createElement(
                'div',
                { style: this.outDivStyle, 'f-canmove': 1 },
                React.createElement(DropDownControl, { options_arr: ['like', 'not like'], value: nodeData.operator, itemChanged: this.LikeChangedHandler, style: this.ddcStyle })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, headType: headType, headText: nodeData.label, cusHeaderFuc: this.cusHeaderFuc },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                )
            );
        }
    }]);

    return C_SqlNode_Like;
}(React.PureComponent);

var C_SqlNode_DBEntity = function (_React$PureComponent14) {
    _inherits(C_SqlNode_DBEntity, _React$PureComponent14);

    function C_SqlNode_DBEntity(props) {
        _classCallCheck(this, C_SqlNode_DBEntity);

        var _this16 = _possibleConstructorReturn(this, (C_SqlNode_DBEntity.__proto__ || Object.getPrototypeOf(C_SqlNode_DBEntity)).call(this, props));

        autoBind(_this16);
        C_NodeCom_Base(_this16);

        _this16.state = {};

        _this16.dropdownRef = React.createRef();
        return _this16;
    }

    _createClass(C_SqlNode_DBEntity, [{
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
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            if (nodeData.title && nodeData.title.length > 0) {
                return nodeData.title;
            }
            var nodeTitle = entity == null ? '' : entity.loaded ? '' : '正在加载:' + entity.code;
            return nodeTitle;
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, getTitleFun: this.getNodeTitle, editor: this.props.editor },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: nodeData.bluePrint.master.getAllEntities, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
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

    return C_SqlNode_DBEntity;
}(React.PureComponent);