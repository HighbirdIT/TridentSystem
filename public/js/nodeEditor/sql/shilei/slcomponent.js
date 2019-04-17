'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_SqlNode_Aggregate = function (_React$PureComponent) {
    _inherits(C_SqlNode_Aggregate, _React$PureComponent);

    function C_SqlNode_Aggregate(props) {
        _classCallCheck(this, C_SqlNode_Aggregate);

        var _this = _possibleConstructorReturn(this, (C_SqlNode_Aggregate.__proto__ || Object.getPrototypeOf(C_SqlNode_Aggregate)).call(this, props));

        autoBind(_this);

        C_NodeCom_Base(_this);
        _this.state = {
            aggregate: _this.props.nodedata.aggregate
        };
        return _this;
    }

    _createClass(C_SqlNode_Aggregate, [{
        key: 'LikeChangedHandler',
        value: function LikeChangedHandler(newoperator) {
            var nodeData = this.props.nodedata;
            nodeData.aggregate = newoperator;
            this.setState({
                aggregate: newoperator
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
                React.createElement(DropDownControl, { options_arr: Aggregate_arr, value: nodeData.aggregate, itemChanged: this.LikeChangedHandler, style: this.ddcStyle })
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

    return C_SqlNode_Aggregate;
}(React.PureComponent);

var C_SqlNode_XApply = function (_React$PureComponent2) {
    _inherits(C_SqlNode_XApply, _React$PureComponent2);

    function C_SqlNode_XApply(props) {
        _classCallCheck(this, C_SqlNode_XApply);

        var _this2 = _possibleConstructorReturn(this, (C_SqlNode_XApply.__proto__ || Object.getPrototypeOf(C_SqlNode_XApply)).call(this, props));

        autoBind(_this2);

        C_NodeCom_Base(_this2);
        _this2.state = {
            xapplyType: _this2.props.nodedata.xapplyType
        };
        _this2.dropdownRef = React.createRef();
        return _this2;
    }

    _createClass(C_SqlNode_XApply, [{
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
            this.setState({ magicObj: {} });
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
        key: 'LikeChangedHandler',
        value: function LikeChangedHandler(newoperator) {
            var nodeData = this.props.nodedata;
            nodeData.xapplyType = newoperator;
            this.setState({
                xapply: newoperator
            });
        }
    }, {
        key: 'cusHeaderFuc',
        value: function cusHeaderFuc() {
            if (this.ddcStyle == null) {
                this.ddcStyle = {
                    width: '120px',
                    margin: 'auto'
                };
                this.outDivStyle = {
                    minWidth: '150px'
                };
            }
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var dataloaded = entity ? entity.loaded : false;
            return React.createElement(
                'div',
                { style: this.outDivStyle, 'f-canmove': 1 },
                React.createElement(DropDownControl, { options_arr: ['cross apply', 'outer apply'], value: nodeData.xapplyType, itemChanged: this.LikeChangedHandler, rootclass: 'flex-grow-1 flex-shrink-1', style: this.ddcStyle }),
                React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.entities_arr, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
            );
        }
    }, {
        key: 'renderParams',
        value: function renderParams() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            if (entity == null || entity.params.length == 0) {
                return React.createElement(
                    'div',
                    null,
                    React.createElement('div', { className: 'dropdown-divider' }),
                    React.createElement(
                        'div',
                        null,
                        '\u65E0\u53C2\u6570'
                    )
                );
            }
            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement('div', { className: 'dropdown-divider' }),
                entity.params.map(function (param) {
                    return React.createElement(
                        'div',
                        { key: param.position, className: 'text-nowrap' },
                        param.name + '  ' + param.cvalType
                    );
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
            return React.createElement(
                C_Node_Frame,
                { ref: this.frameRef, nodedata: nodeData, editor: this.props.editor, getTitleFun: this.getNodeTitle },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(DropDownControl, { options_arr: ['Cross Apply', 'Outer Apply'], value: nodeData.xapplyType, itemChanged: this.LikeChangedHandler, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' } }),
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: g_dataBase.entities_arr, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.inputScokets_arr, align: 'start', editor: this.props.editor, processFun: nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null, nameMoveable: nodeData.scoketNameMoveable }),
                    this.renderParams(),
                    React.createElement(C_SqlNode_ScoketsPanel, { nodedata: nodeData, data: nodeData.outputScokets_arr, align: 'end', editor: this.props.editor, processFun: nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null, nameMoveable: nodeData.scoketNameMoveable })
                )
            );
        }
    }]);

    return C_SqlNode_XApply;
}(React.PureComponent);