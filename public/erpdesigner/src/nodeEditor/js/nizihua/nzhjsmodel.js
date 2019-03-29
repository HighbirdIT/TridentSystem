const JSNODE_WHILE = 'jswhile';
const JSNODE_ARRAY_CONCAT = 'concat';
const JSNODE_TERNARY_OPERATOR = 'ternary_operator';

class JSNode_While extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_WHILE, 'While', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputSocket = this.inputScokets_arr[0];
            this.inputSocket.inputable = false;
        }
        if (this.inputSocket == null) {
            this.inputSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inputSocket);
        }
        this.inputSocket.label = 'condition';

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
        else {
            this.outFlowSockets_arr.forEach(item => {
                item.inputable = true;
            });
        }

    }

    getNodeTitle() {
        return 'While';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketValue = '';

        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inputSocket);
        if (datalinks_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '必须有输入']);
            return false;
        }
        else {
            var dataLink = datalinks_arr[0];
            var outNode = dataLink.outSocket.node;
            var compileRet = null;
            if (outNode.isHadFlow()) {
                compileRet = helper.getCompileRetCache(outNode);
                if (compileRet == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '输入接口设置错误']);
                    return false;
                }
            }
            else {
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '']);
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
}




class JSNode_Array_Concat extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_CONCAT, 'concat', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Array, inputable: false }));
            this.addSocket(new NodeSocket('inputtwo', this, true, { type: ValueType.Object, inputable: false }));
        } else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == ValueType.Array) {
                    socket.type = ValueType.Array;
                    socket.inputable = false;
                }
                else if (socket.type == ValueType.Object) {
                    socket.type = ValueType.Object;
                    socket.inputable = false;
                }
            });
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        //this.inSocket.type = ValueType.Array;
        //this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Array;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
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
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '需要设置参数']);
                return false;
            }
            else {
                var dataLink = datalinks_arr[0];
                var outNode = dataLink.outSocket.node;

                var socket_type = theSocket.type
                var compileRet = null;
                if (outNode.isHadFlow()) {
                    compileRet = helper.getCompileRetCache(outNode);
                    if (compileRet == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            '输入接口设置错误']);
                        return false;
                    }
                }
                else {
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
}

/*
    三元运算符

*/
class JSNode_Ternary_Operator extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_TERNARY_OPERATOR, 'ternary_operator', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in1', this, true, { type: ValueType.Boolean }));
            this.addSocket(new NodeSocket('in2', this, true, { type: ValueType.Object }));
            this.addSocket(new NodeSocket('in3', this, true, { type: ValueType.Object }));
        }

        this.inputScokets_arr[0].label = '条件';
        this.inputScokets_arr[0].inputable = false;
        this.inputScokets_arr[1].inputable = true;
        this.inputScokets_arr[1].label = '真值';
        this.inputScokets_arr[2].inputable = true;
        this.inputScokets_arr[2].label = '假值';

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
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
}

JSNodeClassMap[JSNODE_WHILE] = {
    modelClass: JSNode_While,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_ARRAY_CONCAT] = {
    modelClass: JSNode_Array_Concat,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_TERNARY_OPERATOR] = {
    modelClass: JSNode_Ternary_Operator,
    comClass: C_Node_SimpleNode,
};

JSNodeEditorControls_arr.push(
    {
        label: 'while',
        nodeClass: JSNode_While,
        type: '流控制'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-添加',
        nodeClass: JSNode_Array_Concat,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '三元运算',
        nodeClass: JSNode_Ternary_Operator,
        type: '数组操控'
    });
