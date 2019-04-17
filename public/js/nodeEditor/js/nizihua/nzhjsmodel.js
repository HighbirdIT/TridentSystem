'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSNODE_WHILE = 'jswhile';
var JSNODE_ARRAY_CONCAT = 'concat';
var JSNODE_TERNARY_OPERATOR = 'ternary_operator';

var JSNode_While = function (_JSNode_Base) {
    _inherits(JSNode_While, _JSNode_Base);

    function JSNode_While(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_While);

        var _this = _possibleConstructorReturn(this, (JSNode_While.__proto__ || Object.getPrototypeOf(JSNode_While)).call(this, initData, parentNode, createHelper, JSNODE_WHILE, 'While', false, nodeJson));

        autoBind(_this);

        if (_this.inFlowSocket == null) {
            _this.inFlowSocket = new NodeFlowSocket('flow_i', _this, true);
            _this.addSocket(_this.inFlowSocket);
        }
        if (_this.outFlowSocket == null) {
            _this.outFlowSocket = new NodeFlowSocket('flow_o', _this, false);
            _this.addSocket(_this.outFlowSocket);
        }
        if (_this.inputScokets_arr.length > 0) {
            _this.inputSocket = _this.inputScokets_arr[0];
            _this.inputSocket.inputable = false;
        }
        if (_this.inputSocket == null) {
            _this.inputSocket = new NodeSocket('in', _this, true);
            _this.addSocket(_this.inputSocket);
        }
        _this.inputSocket.label = 'condition';

        if (_this.outFlowSockets_arr == null || _this.outFlowSockets_arr.length == 0) {
            _this.outFlowSockets_arr = [];
        } else {
            _this.outFlowSockets_arr.forEach(function (item) {
                item.inputable = true;
            });
        }

        return _this;
    }

    _createClass(JSNode_While, [{
        key: 'getNodeTitle',
        value: function getNodeTitle() {
            return 'While';
        }
    }, {
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_While.prototype.__proto__ || Object.getPrototypeOf(JSNode_While.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var socketValue = '';

            var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inputSocket);
            if (datalinks_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '必须有输入']);
                return false;
            } else {
                var dataLink = datalinks_arr[0];
                var outNode = dataLink.outSocket.node;
                var compileRet = null;
                if (outNode.isHadFlow()) {
                    compileRet = helper.getCompileRetCache(outNode);
                    if (compileRet == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入接口设置错误']);
                        return false;
                    }
                } else {
                    compileRet = outNode.compile(helper, usePreNodes_arr);
                }
                if (compileRet == false) {
                    return false;
                }
                socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
            }

            var myJSBlock = new FormatFileBlock(this.id);
            belongBlock.pushChild(myJSBlock);
            myJSBlock.pushLine('switch(' + socketValue + '){');
            myJSBlock.addNextIndent();

            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
            helper.setCompileRetCache(this, selfCompileRet);
            var flowLinks_arr = null;
            var flowLink = null;
            var nextNodeCompileRet = null;
            for (var oi in this.outFlowSockets_arr) {
                var caseFlowSocket = this.outFlowSockets_arr[oi];

                var caseStr = caseFlowSocket.defval;
                if (isNaN(caseStr)) {
                    if (caseStr != 'default') {
                        caseStr = singleQuotesStr(caseStr);
                    }
                }
                flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(caseFlowSocket);
                if (flowLinks_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '']);
                    return false;
                }
                flowLink = flowLinks_arr[0];
                myJSBlock.pushLine((caseStr == 'default' ? '' : 'case ') + caseStr + ':{');
                var caseBlock = new FormatFileBlock('case' + caseStr);
                myJSBlock.pushChild(caseBlock);
                myJSBlock.pushLine('}');

                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, caseBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');

            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }

            return selfCompileRet;
        }
    }]);

    return JSNode_While;
}(JSNode_Base);

var JSNode_Array_Concat = function (_JSNode_Base2) {
    _inherits(JSNode_Array_Concat, _JSNode_Base2);

    function JSNode_Array_Concat(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Array_Concat);

        var _this2 = _possibleConstructorReturn(this, (JSNode_Array_Concat.__proto__ || Object.getPrototypeOf(JSNode_Array_Concat)).call(this, initData, parentNode, createHelper, JSNODE_ARRAY_CONCAT, 'concat', false, nodeJson));

        autoBind(_this2);

        if (nodeJson) {
            if (_this2.outputScokets_arr.length > 0) {
                _this2.outSocket = _this2.outputScokets_arr[0];
            }
        }
        if (_this2.inputScokets_arr.length == 0) {
            _this2.addSocket(new NodeSocket('inputone', _this2, true, { type: ValueType.Array, inputable: false }));
            _this2.addSocket(new NodeSocket('inputtwo', _this2, true, { type: ValueType.Object, inputable: false }));
        } else {
            _this2.inputScokets_arr.forEach(function (socket) {
                if (socket.type == ValueType.Array) {
                    socket.type = ValueType.Array;
                    socket.inputable = false;
                } else if (socket.type == ValueType.Object) {
                    socket.type = ValueType.Object;
                    socket.inputable = false;
                }
            });
        }
        if (_this2.outSocket == null) {
            _this2.outSocket = new NodeSocket('out', _this2, false);
            _this2.addSocket(_this2.outSocket);
        }
        //this.inSocket.type = ValueType.Array;
        //this.inSocket.inputable = false;
        _this2.outSocket.type = ValueType.Array;
        return _this2;
    }

    _createClass(JSNode_Array_Concat, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Array_Concat.prototype.__proto__ || Object.getPrototypeOf(JSNode_Array_Concat.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            var theSocket = this.inSocket;
            var socketValue = null;
            var arrar_addValue = null;
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                if (datalinks_arr.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '需要设置参数']);
                    return false;
                } else {
                    var dataLink = datalinks_arr[0];
                    var outNode = dataLink.outSocket.node;

                    var socket_type = theSocket.type;
                    var compileRet = null;
                    if (outNode.isHadFlow()) {
                        compileRet = helper.getCompileRetCache(outNode);
                        if (compileRet == null) {
                            helper.logManager.errorEx([helper.logManager.createBadgeItem(thisNodeTitle, nodeThis, helper.clickLogBadgeItemHandler), '输入接口设置错误']);
                            return false;
                        }
                    } else {
                        compileRet = outNode.compile(helper, usePreNodes_arr);
                    }
                    if (compileRet == false) {
                        return false;
                    }
                    if (socket_type == 'array') {
                        socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
                    } else {
                        arrar_addValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
                    }
                }
            }
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, socketValue + '.concat(' + arrar_addValue + ')');
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Array_Concat;
}(JSNode_Base);

/*
    三元运算符

*/


var JSNode_Ternary_Operator = function (_JSNode_Base3) {
    _inherits(JSNode_Ternary_Operator, _JSNode_Base3);

    function JSNode_Ternary_Operator(initData, parentNode, createHelper, nodeJson) {
        _classCallCheck(this, JSNode_Ternary_Operator);

        var _this3 = _possibleConstructorReturn(this, (JSNode_Ternary_Operator.__proto__ || Object.getPrototypeOf(JSNode_Ternary_Operator)).call(this, initData, parentNode, createHelper, JSNODE_TERNARY_OPERATOR, '?表达式', false, nodeJson));

        autoBind(_this3);

        if (nodeJson) {
            if (_this3.outputScokets_arr.length > 0) {
                _this3.outSocket = _this3.outputScokets_arr[0];
            }
        }
        if (_this3.inputScokets_arr.length == 0) {
            _this3.addSocket(new NodeSocket('in1', _this3, true, { type: ValueType.Boolean }));
            _this3.addSocket(new NodeSocket('in2', _this3, true, { type: ValueType.Object }));
            _this3.addSocket(new NodeSocket('in3', _this3, true, { type: ValueType.Object }));
        }

        _this3.inputScokets_arr[0].label = '条件';
        _this3.inputScokets_arr[0].inputable = false;
        _this3.inputScokets_arr[1].inputable = true;
        _this3.inputScokets_arr[1].label = '真值';
        _this3.inputScokets_arr[2].inputable = true;
        _this3.inputScokets_arr[2].label = '假值';

        if (_this3.outSocket == null) {
            _this3.outSocket = new NodeSocket('out', _this3, false);
            _this3.addSocket(_this3.outSocket);
        }
        _this3.outSocket.type = ValueType.Object;
        return _this3;
    }

    _createClass(JSNode_Ternary_Operator, [{
        key: 'compile',
        value: function compile(helper, preNodes_arr, belongBlock) {
            var superRet = _get(JSNode_Ternary_Operator.prototype.__proto__ || Object.getPrototypeOf(JSNode_Ternary_Operator.prototype), 'compile', this).call(this, helper, preNodes_arr);
            if (superRet == false || superRet != null) {
                return superRet;
            }

            var usePreNodes_arr = preNodes_arr.concat(this);
            var execute_arr = [];
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[i], usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                execute_arr.push(socketComRet.value);
            }
            var endstr = null;
            endstr = "(" + execute_arr[0] + " ? (" + execute_arr[1] + ') : (' + execute_arr[2] + "))";
            var selfCompileRet = new CompileResult(this);
            selfCompileRet.setSocketOut(this.outSocket, endstr);
            helper.setCompileRetCache(this, selfCompileRet);
            return selfCompileRet;
        }
    }]);

    return JSNode_Ternary_Operator;
}(JSNode_Base);

JSNodeClassMap[JSNODE_WHILE] = {
    modelClass: JSNode_While,
    comClass: C_Node_SimpleNode
};

JSNodeClassMap[JSNODE_ARRAY_CONCAT] = {
    modelClass: JSNode_Array_Concat,
    comClass: C_Node_SimpleNode
};

JSNodeClassMap[JSNODE_TERNARY_OPERATOR] = {
    modelClass: JSNode_Ternary_Operator,
    comClass: C_Node_SimpleNode
};

JSNodeEditorControls_arr.push({
    label: 'while',
    nodeClass: JSNode_While,
    type: '流控制'
});
JSNodeEditorControls_arr.push({
    label: '数组-添加',
    nodeClass: JSNode_Array_Concat,
    type: '数组操控'
});
JSNodeEditorControls_arr.push({
    label: '三元运算',
    nodeClass: JSNode_Ternary_Operator,
    type: '数组操控'
});