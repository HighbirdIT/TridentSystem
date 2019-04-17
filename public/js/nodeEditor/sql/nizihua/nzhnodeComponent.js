'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var C_SqlNode_Union = function (_React$PureComponent) {
    _inherits(C_SqlNode_Union, _React$PureComponent);

    function C_SqlNode_Union(props) {
        _classCallCheck(this, C_SqlNode_Union);

        var _this = _possibleConstructorReturn(this, (C_SqlNode_Union.__proto__ || Object.getPrototypeOf(C_SqlNode_Union)).call(this, props));

        autoBind(_this);

        C_NodeCom_Base(_this);
        _this.state = {
            unionType: _this.props.nodedata.unionType
        };
        return _this;
    }

    _createClass(C_SqlNode_Union, [{
        key: 'selectItemChangedHandler',
        value: function selectItemChangedHandler(newunionType) {
            var nodeData = this.props.nodedata;
            nodeData.unionType = newunionType;
            this.setState({
                unionType: newunionType
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
            return React.createElement(DropDownControl, { options_arr: ['union', 'union all'], value: nodeData.unionType, itemChanged: this.selectItemChangedHandler, style: this.ddcStyle });
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

    return C_SqlNode_Union;
}(React.PureComponent);

//////exists


var C_SqlNode_Exists = function (_React$PureComponent2) {
    _inherits(C_SqlNode_Exists, _React$PureComponent2);

    function C_SqlNode_Exists(props) {
        _classCallCheck(this, C_SqlNode_Exists);

        var _this2 = _possibleConstructorReturn(this, (C_SqlNode_Exists.__proto__ || Object.getPrototypeOf(C_SqlNode_Exists)).call(this, props));

        autoBind(_this2);

        C_NodeCom_Base(_this2);
        _this2.state = {
            operator: _this2.props.nodedata.operator
        };
        return _this2;
    }

    _createClass(C_SqlNode_Exists, [{
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
                React.createElement(DropDownControl, { options_arr: ['exists', 'not exists'], value: nodeData.operator, itemChanged: this.LikeChangedHandler, style: this.ddcStyle })
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

    return C_SqlNode_Exists;
}(React.PureComponent);

var C_SqlNode_FbSource = function (_React$PureComponent3) {
    _inherits(C_SqlNode_FbSource, _React$PureComponent3);

    function C_SqlNode_FbSource(props) {
        _classCallCheck(this, C_SqlNode_FbSource);

        var _this3 = _possibleConstructorReturn(this, (C_SqlNode_FbSource.__proto__ || Object.getPrototypeOf(C_SqlNode_FbSource)).call(this, props));

        autoBind(_this3);
        C_NodeCom_Base(_this3);

        _this3.state = {};

        _this3.dropdownRef = React.createRef();
        return _this3;
    }

    _createClass(C_SqlNode_FbSource, [{
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
        key: 'FBentities_arr',
        value: function FBentities_arr() {
            var fbentities_arr = [];
            g_dataBase.entities_arr.forEach(function (item, i) {
                if (item.type == 'FB') {
                    fbentities_arr.push(item);
                }
            });
            return fbentities_arr;
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
                        React.createElement(DropDownControl, { ref: this.dropdownRef, itemChanged: this.dropdownCtlChangedHandler, btnclass: 'btn-dark', options_arr: this.FBentities_arr, rootclass: 'flex-grow-1 flex-shrink-1', style: { minWidth: '200px', height: '40px' }, textAttrName: 'name', valueAttrName: 'code', value: entity ? entity.code : -1 })
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

    return C_SqlNode_FbSource;
}(React.PureComponent);