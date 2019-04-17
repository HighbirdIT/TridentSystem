'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_FlowNodeDef_Var_Get = function (_React$PureComponent) {
    _inherits(C_FlowNodeDef_Var_Get, _React$PureComponent);

    function C_FlowNodeDef_Var_Get(props) {
        _classCallCheck(this, C_FlowNodeDef_Var_Get);

        var _this = _possibleConstructorReturn(this, (C_FlowNodeDef_Var_Get.__proto__ || Object.getPrototypeOf(C_FlowNodeDef_Var_Get)).call(this, props));

        autoBind(_this);

        C_NodeCom_Base(_this);
        _this.state = {
            //nodedata:this.props.nodedata,
        };
        return _this;
    }

    _createClass(C_FlowNodeDef_Var_Get, [{
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

    return C_FlowNodeDef_Var_Get;
}(React.PureComponent);

var C_FlowNodeDef_Var_Set = function (_React$PureComponent2) {
    _inherits(C_FlowNodeDef_Var_Set, _React$PureComponent2);

    function C_FlowNodeDef_Var_Set(props) {
        _classCallCheck(this, C_FlowNodeDef_Var_Set);

        var _this2 = _possibleConstructorReturn(this, (C_FlowNodeDef_Var_Set.__proto__ || Object.getPrototypeOf(C_FlowNodeDef_Var_Set)).call(this, props));

        autoBind(_this2);

        C_NodeCom_Base(_this2);

        _this2.state = {};
        return _this2;
    }

    _createClass(C_FlowNodeDef_Var_Set, [{
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

    return C_FlowNodeDef_Var_Set;
}(React.PureComponent);

var C_FlowNode_Query_Sql = function (_React$PureComponent3) {
    _inherits(C_FlowNode_Query_Sql, _React$PureComponent3);

    function C_FlowNode_Query_Sql(props) {
        _classCallCheck(this, C_FlowNode_Query_Sql);

        var _this3 = _possibleConstructorReturn(this, (C_FlowNode_Query_Sql.__proto__ || Object.getPrototypeOf(C_FlowNode_Query_Sql)).call(this, props));

        autoBind(_this3);
        C_NodeCom_Base(_this3);

        _this3.state = {};

        _this3.dropdownRef = React.createRef();
        return _this3;
    }

    _createClass(C_FlowNode_Query_Sql, [{
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
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.getEntitiesByType, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
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

    return C_FlowNode_Query_Sql;
}(React.PureComponent);

var C_FlowNode_QueryKeyRecord = function (_React$PureComponent4) {
    _inherits(C_FlowNode_QueryKeyRecord, _React$PureComponent4);

    function C_FlowNode_QueryKeyRecord(props) {
        _classCallCheck(this, C_FlowNode_QueryKeyRecord);

        var _this4 = _possibleConstructorReturn(this, (C_FlowNode_QueryKeyRecord.__proto__ || Object.getPrototypeOf(C_FlowNode_QueryKeyRecord)).call(this, props));

        autoBind(_this4);
        C_NodeCom_Base(_this4);

        _this4.state = {};

        _this4.dropdownRef = React.createRef();
        _this4.keyColumnRef = React.createRef();
        return _this4;
    }

    _createClass(C_FlowNode_QueryKeyRecord, [{
        key: 'nodeDataChangedHandler',
        value: function nodeDataChangedHandler() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            if (entity) {
                this.dropdownRef.current.setValue(entity.code);
                var self = this;
                setTimeout(function () {
                    self.keyColumnRef.current.setValue(nodeData.keyColumn);
                }, 50);
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
        key: 'keyColumnChangedHandler',
        value: function keyColumnChangedHandler(colName) {
            var nodeData = this.props.nodedata;
            nodeData.keyColumn = colName;
        }
    }, {
        key: 'socketColumnSelectChanged',
        value: function socketColumnSelectChanged(newVal, ddc) {
            var socket = ddc.props.socket;
            socket.setExtra('colName', newVal);
        }
    }, {
        key: 'mouseDownOutSocketHand',
        value: function mouseDownOutSocketHand(ev) {
            var colName = getAttributeByNode(ev.target, 'd-colname', true, 5);
            if (colName == null) {
                return;
            }
            var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
            if (socketid == null) {
                return;
            }
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            if (entity == null) {
                return;
            }
            var theSocket = nodeData.bluePrint.getSocketById(socketid);
            var bornPos = theSocket.currentComponent.getCenterPos();
            if (entity.containColumn(colName)) {
                var newNode = new FlowNode_ColumnVar({
                    keySocketID: socketid,
                    newborn: true,
                    left: bornPos.x,
                    top: bornPos.y
                }, nodeData.parent);
            }
        }
    }, {
        key: 'customSocketRender',
        value: function customSocketRender(socket) {
            if (socket.isIn == true) {
                return null;
            }
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;

            var nowVal = socket.getExtra('colName');
            return React.createElement(
                'span',
                { className: 'd-flex align-items-center' },
                React.createElement(DropDownControl, { itemChanged: this.socketColumnSelectChanged, btnclass: 'btn-dark', options_arr: entity == null ? [] : entity.columns, rootclass: 'flex-grow-1 flex-shrink-1', value: nowVal, socket: socket, textAttrName: 'name' }),
                React.createElement(
                    'button',
                    { onMouseDown: this.mouseDownOutSocketHand, 'd-colname': nowVal, type: 'button', className: 'btn btn-secondary' },
                    React.createElement('i', { className: 'fa fa-hand-paper-o' })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var dataloaded = entity ? entity.loaded : false;

            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, getTitleFun: this.getNodeTitle, editor: this.props.editor, headType: 'tiny', headText: '\u67E5\u8BE2\u5173\u952E\u8BB0\u5F55' },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.getEntitiesByType, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1' },
                    React.createElement(DropDownControl, { ref: this.keyColumnRef, itemChanged: this.keyColumnChangedHandler, btnclass: 'btn-dark', options_arr: entity == null ? [] : entity.columns, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', value: nodeData.keyColumn })
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor }),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.processOutputSockets, customSocketRender: this.customSocketRender })
                )
            );
        }
    }]);

    return C_FlowNode_QueryKeyRecord;
}(React.PureComponent);