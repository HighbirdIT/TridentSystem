const JSNODE_WHILE = 'jswhile';
const JSNODE_ARRAY_CONCAT = 'concat';
const JSNODE_TERNARY_OPERATOR = 'ternary_operator';
const JSNODE_ARRAY_PUSH = 'array_push';
const JSNODE_ARRAY_SHIFT = 'array_shift';
const JSNODE_ARRAY_UNSHIFT = 'array_unshift';
const JSNODE_ARRAY_POP = 'array_pop';
const JSNODE_ARRAY_JOIN = 'array_join';
const JSNODE_ARRAY_SLICE = 'array_slice';
const JSNODE_ARRAY_GET = 'array_get';
const JSNODE_ARRAY_REVERSE = 'array_reverse';
const JSNODE_GETDAY = 'getDay';
const JSNODE_FORMATNUM = 'formatnum';
const JSNODE_CAPITALNUM = 'capitalnum';
const JSNODE_CONVERT_TIMEZONE = 'convert_timezone';
const JSNODE_ASSIGNMENT_OPERATOR = 'addition_assignment_operator';
const JSNODE_ISNULLOPERATOR = 'IsNullOperator';
const JSNODE_MATHFUN = 'mathfun';
const JSNODE_ARRAY_CLEAR = 'clear';
const JSNODE_FOR = 'for';
const JSNODE_EXCELHEADER = 'excelHeader'
const JSNODE_MD5 = 'md5加密'
const JSNODE_FILEDELETE = '文件删除'

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
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
                if (socket.name == 'data') {
                    this.dataSocket = socket;
                }
            });
        }
        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, true));
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
        this.dataSocket.type = ValueType.Object;
        this.dataSocket.label = 'data';
        this.dataSocket.inputable = true;

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

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var dataValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, arrValue + '.concat(' + (dataValue ? dataValue : '') + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Array_Get extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_GET, '数组-Get', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
                if (socket.name == 'data') {
                    this.dataSocket = socket;
                }
            });
        }
        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, true));
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
        this.dataSocket.type = ValueType.Object;
        this.dataSocket.label = 'index';
        this.dataSocket.inputable = true;

        this.outSocket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dataValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, arrValue + '[' + dataValue + ']');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Array_Reverse extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_REVERSE, '数组-Reverse', false, nodeJson);
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
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
            });
        }
        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }
        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        myJSBlock.pushLine(arrValue + '.reverse();');
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

/*
    三元运算符

*/
class JSNode_Ternary_Operator extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_TERNARY_OPERATOR, '?表达式', false, nodeJson);
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


// 数组函数
class JSNode_Array_Push extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_PUSH, '数组-Push', false, nodeJson);
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
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
                if (socket.name == 'data') {
                    this.dataSocket = socket;
                }
            });
        }

        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, true));
        }

        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
        this.dataSocket.type = ValueType.Object;
        this.dataSocket.label = 'data';
        this.dataSocket.inputable = true;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dataValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine(arrValue + '.push(' + dataValue + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_Array_Pop extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_POP, '数组-Pop', false, nodeJson);
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
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
            });
        }

        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }

        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine(arrValue + '.pop();');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}


// 数组函数 join
class JSNode_Array_Join extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_JOIN, 'array_join', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Array, inputable: false }));
            this.addSocket(new NodeSocket('inputtwo', this, true, { type: ValueType.String, inputable: true }));
        } /*else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == ValueType.Array) {
                    socket.type = ValueType.Array;
                    socket.inputable = false;
                }
                else if (socket.type == ValueType.String) {
                    socket.type = ValueType.String;
                    socket.inputable = true;
                }
            });
        }*/
        this.inputScokets_arr[0].label = '数组';
        this.inputScokets_arr[0].inputable = false;
        this.inputScokets_arr[1].inputable = true;
        this.inputScokets_arr[1].label = '字符串';

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
        var tValue = null;
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (datalinks_arr.length == 0) {
                if (theSocket.type == 'array' && IsEmptyString(theSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '需要设置参数']);
                    return false;
                }
                if (theSocket.type != 'array' && IsEmptyString(theSocket.defval)) {
                    tValue = "','";
                } else {
                    tValue = theSocket.defval.replace(/\'/g, '');
                    tValue = "'" + tValue + "'";
                }
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
                    socketValue = socketValue.replace(/\'/g, '')

                } else {
                    tValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
                    tValue = "'" + tValue.replace(/\'/g, '') + "'"
                }
            }
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, socketValue + '.join(' + tValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


// 数组函数 slice
class JSNode_Array_Slice extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_SLICE, 'array_slice', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Array, inputable: false }));
            this.addSocket(new NodeSocket('inputtwo', this, true, { type: ValueType.Int, inputable: true }));
            this.addSocket(new NodeSocket('inputthree', this, true, { type: ValueType.Int, inputable: true }));
        }
        this.inputScokets_arr[0].label = '数组';
        this.inputScokets_arr[0].inputable = false;
        this.inputScokets_arr[1].inputable = true;
        this.inputScokets_arr[1].label = '起始参数';
        this.inputScokets_arr[2].inputable = true;
        this.inputScokets_arr[2].label = '结束参数';

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
        var socketValue = null;
        var start_value = null;
        var end_value = null;

        var execute_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[i], usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            execute_arr.push(socketComRet.value.replace(/\'/g, ''));
        }
        socketValue = execute_arr[0];
        start_value = execute_arr[1];
        end_value = execute_arr[2];
        // if ((start_value | 0) != start_value || (end_value | 0) != end_value) {
        //     helper.logManager.errorEx([helper.logManager.createBadgeItem(
        //         thisNodeTitle,
        //         nodeThis,
        //         helper.clickLogBadgeItemHandler),
        //         '应该输入整数']);
        //     return false;
        // }
        // if (start_value > end_value) {
        //     helper.logManager.errorEx([helper.logManager.createBadgeItem(
        //         thisNodeTitle,
        //         nodeThis,
        //         helper.clickLogBadgeItemHandler),
        //         '起始参数应该小于结束参数']);
        //     return false;
        // }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, execute_arr[0].replace(/\'/g, '') + '.slice(' + start_value + ',' + end_value + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}



/*
    或许当前星期状态

*/
class JSNode_GetDay extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETDAY, '获取星期(?)', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'out') {
                        this.nameSocket = socket;
                    }
                    else if (socket.name == 'num') {
                        this.numSocket = socket;
                    }
                });
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, inputable: true }));
        }
        this.inputScokets_arr[0].label = '日期';
        this.inputScokets_arr[0].inputable = true;

        if (this.nameSocket == null) {
            this.nameSocket = new NodeSocket('out', this, false);
            this.addSocket(this.nameSocket);
        }
        if (this.numSocket == null) {
            this.numSocket = new NodeSocket('num', this, false);
            this.addSocket(this.numSocket);
        }
        this.nameSocket.label = '中文';
        this.nameSocket.type = ValueType.String;
        this.numSocket.label = '数字';
        this.numSocket.type = ValueType.Int;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);


        var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[0], usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dateStr = socketComRet.value;
        var endstr = '';
        var selfCompileRet = new CompileResult(this);
        if (socketComRet.link == null) {
            if (!checkDate(dateStr)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '应该输入时间']);
                return false;
            }
        }
        var blockInServer = belongBlock.getScope().isServerSide;

        if (!blockInServer) {
            var nodeI = 0;
            for (nodeI = preNodes_arr.length - 1; nodeI > 0; --nodeI) {
                var temNode = preNodes_arr[nodeI];
                if (temNode.inFlowSocket) {
                    if(temNode.type != JSNODE_EXPORTEXCEL){
                        blockInServer = temNode.hadFetchFun;
                    }
                    break;
                }
            }
        }
        var funPreFix = blockInServer ? 'serverhelper.DateFun.' : '';
        endstr = funPreFix + "getweekDay(" + dateStr + ")";

        selfCompileRet.setSocketOut(this.nameSocket, endstr);
        selfCompileRet.setSocketOut(this.numSocket, dateStr + '.getDay()');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

/*
    格式化数字

*/
class JSNode_FormatNum extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FORMATNUM, '格式化数字', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, inputable: true }));
        }
        this.inputScokets_arr[0].label = '数字';
        this.inputScokets_arr[0].inputable = true;

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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);


        var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[0], usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dateStr = socketComRet.value;

        var socketlink = socketComRet.link;
        if (socketlink == null) {
            if (isNaN(dateStr)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '应该输入数字']);
                return false;
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' addComma(' + dateStr + ') ');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

/*
    数字转中文

*/
class JSNode_CapitalNum extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CAPITALNUM, '货币中文大写', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, inputable: true }));
        }
        this.inputScokets_arr[0].label = '数字';
        this.inputScokets_arr[0].inputable = true;

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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[0], usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dateStr = socketComRet.value;

        var socketlink = socketComRet.link;

        if (socketlink == null) {

            if (isNaN(dateStr)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    "请检查输入金额是否正确"]);
                return false;
            }
            if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(dateStr)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '数据非法']);
                return false;
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' NumToChinese(' + dateStr + ') ');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


/*
    转换时区节点

*/
class JSNode_Convert_TimeZone extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CONVERT_TIMEZONE, '世界时间转换', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, }));
            this.addSocket(new NodeSocket('inputtwo', this, true, { type: ValueType.Object, inputable: true }));
            this.addSocket(new NodeSocket('inputthree', this, true, { type: ValueType.Object, inputable: true }));
        }
        this.inputScokets_arr[0].label = '时间';
        this.inputScokets_arr[0].inputable = true;
        this.inputScokets_arr[1].label = '原始时区';
        this.inputScokets_arr[1].inputable = true;
        this.inputScokets_arr[2].label = '目的时区';
        this.inputScokets_arr[2].inputable = true;
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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var result_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[i], usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var dateStr = socketComRet.value;
            if (socketComRet.link == null) {
                if (i == 0) {
                    if (!checkTime(dateStr)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            "应该输入时间"]);
                        return false;
                    }
                } else {
                    if (isNaN(dateStr)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            "输入正负整数"]);
                        return false;
                    }
                }
            }
            result_arr.push(dateStr);
        }
        var dateTime = result_arr[0];
        var timeZoneO = result_arr[1];
        var timeZoneT = result_arr[2];
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' Convert_TimeZone(' + dateTime + ',' + timeZoneO + ',' + timeZoneT + ') ');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

//+=
class JSNode_Assignment_Operator extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ASSIGNMENT_OPERATOR, '赋值运算符', false, nodeJson);
        autoBind(this);
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
        else {
            this.outFlowSockets_arr.forEach(item => {
                item.inputable = true;
            });
        }
        // if (nodeJson) {
        //     if (this.outputScokets_arr.length > 0) {
        //         this.outSocket = this.outputScokets_arr[0];
        //         this.outSocket.type = ValueType.String;
        //     }
        // }
        // if (this.outSocket == null) {
        //     this.outSocket = new NodeSocket('out', this, false, { type: ValueType.String });
        //     this.addSocket(this.outSocket);
        // }
        // this.outSocket.isSimpleVal = false;
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('var', this, true, { type: ValueType.Object }));
            this.addSocket(new NodeSocket('value', this, true, { type: ValueType.String }));
        }
        this.inputScokets_arr[0].label = '变量';
        this.inputScokets_arr[0].type = ValueType.Object;
        this.inputScokets_arr[1].label = '值';
        this.inputScokets_arr[1].type = ValueType.String;
        if (this.operator == null) {
            this.operator = '+=';
        }
        this.minInSocketCount = 2;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }

    getNodeTitle() {
        return '运算:' + this.operator;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal_arr = [];
        // var flowSocket = this.outFlowSockets_arr[0];
        // var flowLink = this.bluePrint.linkPool.getLinksBySocket(flowSocket)[0];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var tValue = socketComRet.value;
            if (i == 1) {
                if (socketComRet.link) {
                    if (!socketComRet.link.outSocket.isSimpleVal) {
                        tValue = '(' + tValue + ')';
                    }
                }
                else {
                    if (isNaN(tValue)) {
                        allNumberic = false;
                    }
                }
            }

            socketVal_arr.push(tValue);
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : nodeThis.operator) + x;
        });

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine(' ' + finalStr + ' ');
        myJSBlock.addNextIndent();
        // selfCompileRet.setSocketOut(this.outSocket, finalStr);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;

        for (var fi = 0; fi < 2; ++fi) {
            var theFlowSocket = fi == 0 ? this.trueFlowSocket : this.falseFlowSocket;
            // var useBlock = fi == 0 ? myJS.trueBlock : myJS.falseBlock;
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(theFlowSocket);
            if (flowLinks_arr.length != 0) {
                flowLink = flowLinks_arr[0];
                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, myJSBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }
        }

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}
// js isnull
class JSNode_IsNullOperator extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ISNULLOPERATOR, 'IsNullOperator', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = ValueType.Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: ValueType.Boolean });
            this.addSocket(this.outSocket);
        }
        this.outSocket.isSimpleVal = false;
        this.insocketInitVal = {
            type: ValueType.String,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: ValueType.String, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.operator == null) {
            this.operator = 'is null';
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }

    getNodeTitle() {
        return '比较:' + this.operator;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        //for (var i = 0; i < this.inputScokets_arr.length; ++i) {
        var theSocket = this.inputScokets_arr[0];
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var tValue = socketComRet.value;
        if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
            tValue = tValue
        }
        //}
        var finalStr = tValue + ' ' + (this.operator == 'is null' ? ' == null' : ' != null')
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
//数学函数
class JSNode_Mathfun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MATHFUN, 'mathfun', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除
        //复原
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = ValueType.String;
            }
        }

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: ValueType.String });
            this.addSocket(this.outSocket);
        }
        this.outSocket.isSimpleVal = true;
        if (this.mathType == null) {
            this.mathType = Math_ABS;
        }
        this.setMathType(this.mathType);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.mathType = this.mathType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['mathType']);
    }

    setMathType(newMathType) {
        this.mathType = newMathType;
        var inputCount = 1;
        var inputLabels_arr = ['num'];
        switch (newMathType) {
            case Math_ROUND:
                inputCount = 2;
                inputLabels_arr.push('精度');
                break;
            case Math_POWER:
                inputCount = 2;
                inputLabels_arr.push('幂');
                break;
        }
        var nowCount = this.inputScokets_arr.length;
        if (nowCount != inputCount) {
            var step = Math.sign(inputCount - nowCount);
            for (var i = nowCount; i != inputCount; i += step) {
                if (step > 0) {
                    this.addSocket(new NodeSocket('in' + i, this, true, { type: ValueType.String, inputable: true }));
                }
                else {

                    this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
                }
            }
            this.fireEvent(Event_SocketNumChanged, 0);
        }
        this.inputScokets_arr.forEach((soket, i) => {
            if (soket.label != inputLabels_arr[i]) {
                soket.label = inputLabels_arr[i];
                soket.fireEvent('changed');
            }
        });
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var inSocket = this.inSocket;

        var funName = this.mathType.toLocaleLowerCase();
        switch (this.mathType) {
            case Math_CEILING:
                funName = 'ceil';
                break;
            case Math_POWER:
                funName = 'pow';
                break;
        }

        var finalStr = 'Math.' + funName + '(';
        var socketVal_arr = [];
        var theSocket;
        var socketComRet;
        var i;
        for (i = 0; i < this.inputScokets_arr.length; ++i) {
            theSocket = this.inputScokets_arr[i];
            socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            socketVal_arr.push(socketComRet.value);
        }
        switch (this.mathType) {
            case Math_ROUND:
                finalStr = 'RoundFloat(' + socketVal_arr[0] + ',' + socketVal_arr[1] + ')';
                break;
            case Math_POWER:
                finalStr += socketVal_arr[0] + ',' + socketVal_arr[1] + ')';
                break;
            case Math_ABS:
            case Math_CEILING:
            case Math_FLOOR:
            case Math_SQRT:
            case Math_TAN:
            case Math_SIN:
            case Math_COS:
            case Math_SIGN:
                finalStr += socketVal_arr[0] + ')';
                break;
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
class JSNode_Array_Shift extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_SHIFT, '数组-Shift', false, nodeJson);
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
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
            });
        }

        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }

        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine(arrValue + '.shift();');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_Array_Unshift extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_UNSHIFT, '数组-Unshift', false, nodeJson);
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
            this.inputScokets_arr.forEach(socket => {
                if (socket.name == 'arr') {
                    this.arrSocket = socket;
                }
                if (socket.name == 'data') {
                    this.dataSocket = socket;
                }
            });
        }

        if (this.arrSocket == null) {
            this.arrSocket = this.addSocket(new NodeSocket('arr', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, true));
        }

        this.arrSocket.type = ValueType.Array;
        this.arrSocket.inputable = false;
        this.arrSocket.label = 'array';
        this.dataSocket.type = ValueType.Object;
        this.dataSocket.label = 'data';
        this.dataSocket.inputable = true;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.arrSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var arrValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dataValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine(arrValue + '.unshift(' + dataValue + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_For extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FOR, 'For', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.outFlowSockets_arr == null) {
            this.outFlowSockets_arr = [];
        }
        if (this.inputScokets_arr.length == 0) {
            this.start_iSocket = this.addSocket(new NodeSocket('start_i', this, true));
            this.lenSocket = this.addSocket(new NodeSocket('len', this, true));
            this.increaseSocket = this.addSocket(new NodeSocket('increase', this, true));
        }


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'index') {
                        this.indexSocket = socket;
                    }
                });
            }
            if (this.inputScokets_arr.length > 0) {
                this.inputScokets_arr.forEach(socket => {
                    if (socket.name == 'start_i') {
                        this.start_iSocket = socket;
                    }
                    if (socket.name == 'len') {
                        this.lenSocket = socket;
                    }
                    if(socket.name == 'increase'){
                        this.increaseSocket = socket;
                    }
                });
            }
            if (this.outFlowSockets_arr.length > 0) {
                this.bodyFlowSocket = this.outFlowSockets_arr[0];
            }
        }
        if (this.bodyFlowSocket == null) {
            this.bodyFlowSocket = new NodeFlowSocket('body', this, false);
            this.addSocket(this.bodyFlowSocket);
        }
        this.bodyFlowSocket.label = 'body';
        
        if (this.indexSocket == null) {
            this.indexSocket = this.addSocket(new NodeSocket('index', this, false));
        }
        if (this.manualMode == null) {
            this.manualMode = false;
            console.log('呜呜呜呜呜呜呜');
        }
        this.indexSocket.label = 'index';
        this.indexSocket.type = ValueType.Int;

        this.lenSocket.type = ValueType.Int;
        this.lenSocket.inputable = true;
        this.lenSocket.label = 'max';
        this.increaseSocket.type = ValueType.Int;
        this.increaseSocket.inputable = true;
        this.increaseSocket.label = '步长';
        this.start_iSocket.type = ValueType.Int;
        this.start_iSocket.inputable = true;
        this.start_iSocket.label = 'min';
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.manualMode = this.manualMode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['manualMode']);
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        result.pushVariable(this.id + '_' + targetSocket.name, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var blockInServer = belongBlock.getScope().isServerSide;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            if (theSocket.name == 'start_i'){
                var start_index = socketComRet.value;
            }else if(theSocket.name == 'len'){
                var len_index = socketComRet.value;
            }else{
                var increase = socketComRet.value;
            }
        }

        var bodyFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.bodyFlowSocket);
        if (this.checkCompileFlag(bodyFlowLinks_arr.length == 0, '必须设置循环体', helper)) {
            return false;
        }

        var manualMode = this.manualMode;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var indexVarName = this.id + '_index';
        var childBlock = new FormatFileBlock('child');
        var endBlock = myJSBlock;
        if(manualMode){
            if (this.checkCompileFlag(blockInServer, '服务端无法使用手动模式', helper)) {
                return false;
            }
            helper.compilingFun.hadServerFetch = true;
            myJSBlock.pushLine('var ' + indexVarName + '='+ start_index+';');
    
            var endFunName = this.id + '_end';
            var endBlock = new FormatFileBlock('child');
            myJSBlock.pushLine('var ' + endFunName + '= ()=>{', 1);
            myJSBlock.pushChild(endBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
            var nextFunName = this.id + '_processNext';
            myJSBlock.pushLine('var ' + nextFunName + '= ()=>{', 1);
            myJSBlock.pushLine(indexVarName + '+='+increase+';');
            myJSBlock.pushLine('if(' + indexVarName + '>=' + len_index + '){', 1);
            myJSBlock.pushLine(endFunName + '();');
            myJSBlock.pushLine('return;');
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
           
            myJSBlock.pushChild(childBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');

            myJSBlock.pushLine('setTimeout(' + nextFunName + ', 10);');
        }
        else{
            myJSBlock.pushLine('var ' + indexVarName + '='+ start_index+';');
            myJSBlock.pushLine('for(' + indexVarName + '='+start_index+';'  + indexVarName + '<' + len_index + ';' + indexVarName +'+='+increase +'){', 1);
            myJSBlock.pushChild(childBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        
        selfCompileRet.setSocketOut(this.indexSocket, indexVarName);
        
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileFlowNode(bodyFlowLinks_arr[0], helper, usePreNodes_arr, childBlock) == false) {
            return false;
        }

        if (this.compileOutFlow(helper, usePreNodes_arr, endBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_ExcelHeader extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EXCELHEADER, 'excelHeader', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.outDataSocket = this.outputScokets_arr[0];
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'colWidth':
                        this.colWidthSocket = socket;
                        break;
                    case 'type':
                        this.typeSocket = socket;
                        break;
                    case 'picWidth':
                        this.picWidthSocket = socket;
                        break;
                    case 'picHeight':
                        this.picHeightSocket = socket;
                        break;
                    case 'colName':
                        this.colNameSocket = socket;
                        break;
                    case 'autoWrap':
                        this.autoWrapSocket = socket;
                        break;
                }
            });
        }
        if (this.colNameSocket == null) {
            this.colNameSocket = this.addSocket(new NodeSocket('colName', this, true));
        }
        if (this.colWidthSocket == null) {
            this.colWidthSocket = this.addSocket(new NodeSocket('colWidth', this, true));
        }
        if (this.picWidthSocket == null) {
            this.picWidthSocket = this.addSocket(new NodeSocket('picWidth', this, true));
        }
        if (this.picHeightSocket == null) {
            this.picHeightSocket = this.addSocket(new NodeSocket('picHeight', this, true));
        }
        if (this.typeSocket == null) {
            this.typeSocket = this.addSocket(new NodeSocket('type', this, true));
        }
        if (this.autoWrapSocket == null) {
            this.autoWrapSocket = this.addSocket(new NodeSocket('autoWrap', this, true));
        }
     
        this.colNameSocket.label = '列名';
        this.colWidthSocket.label = '列宽';
        this.picWidthSocket.label = '图宽';
        this.picHeightSocket.label = '图高';
        this.colNameSocket.inputable = true;
        this.autoWrapSocket.label = "自动换行";

        this.colNameSocket.hideIcon = true;
        this.colWidthSocket.hideIcon = true;
        this.picWidthSocket.hideIcon = true;
        this.picHeightSocket.hideIcon = true;
        this.autoWrapSocket.hideIcon = true;

        this.colNameSocket.type = ValueType.String;
        this.typeSocket.type = ValueType.String;
        this.colWidthSocket.type = ValueType.String;
        this.picWidthSocket.type = ValueType.String;
        this.picHeightSocket.type = ValueType.String;
        this.autoWrapSocket.type = ValueType.Boolean;

        this.typeSocket.hideIcon = true;
        if (this.typeSocket.defval == null) {
            this.typeSocket.defval = "文本";
        }

        if (this.outDataSocket == null) {
            this.outDataSocket = new NodeSocket('Header设置', this, false, { type: ValueType.String });
            this.addSocket(this.outDataSocket);
        }
        this.outDataSocket.label = 'Header设置';
        var excelHeader_arr = ['文本','数字','图片']
        this.typeSocket.set({
            inputable: true,
            inputDDC_setting: {
                options_arr: excelHeader_arr,
            },
            label: '类型',
        });
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, []);
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        if (targetSocket == this.outErrorSocket) {
            return;
        }
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '不可在服务端使用', helper)) {
            return false;
        }
        if (this.checkCompileFlag(blockInServer, '不可在服务端调用', helper)) {
            return false;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.colWidthSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var colWidthValue = socketComRet.value;
        
        socketComRet = this.getSocketCompileValue(helper, this.colNameSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var colName = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.picWidthSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var picWidthValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.picHeightSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var picHeightValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.autoWrapSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var autoWrapValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.typeSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var typeValue = socketComRet.value;
        var headerObj = {
            type: typeValue,
        };
        
        var finalStr = "{name:"+colName+",type:" + typeValue + ",";
        finalStr += 'width:' + (parseInt(colWidthValue) > 0 ? parseInt(colWidthValue) : "''");
        finalStr += ',picWidth:' + (parseInt(picWidthValue) > 0 ? parseInt(picWidthValue) : "''");
        finalStr += ',picHeight:' + (parseInt(picHeightValue) > 0 ? parseInt(picHeightValue) : "''");
        finalStr += ',wrapText:' + (autoWrapValue == true);
        finalStr += '}';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outDataSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Md5 extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MD5, 'md5加密', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '返回值': this.returnValueSocket = socket; break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'file_token':
                        this.tokenSocket = socket;
                        break;
            }});
        }
        

        if (this.tokenSocket == null) {
            this.tokenSocket = new NodeSocket('file_token', this, true);
            this.addSocket(this.tokenSocket);
        }
        
        if (this.returnValueSocket == null) {
            this.returnValueSocket = this.addSocket(new NodeSocket('返回值', this, false));
        }
        

        this.tokenSocket.label = 'fileToken';
        this.tokenSocket.type = ValueType.String;

        this.returnValueSocket.label = '返回值';
        this.returnValueSocket.type = ValueType.Object;
      
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_zihua', '../../../../extend_zihua.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        myServerBlock.pushLine(`var ${dataVarName}=null;`);
        var tryBlock = new JSFile_Try('try');
        myServerBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(`${dataVarName} = yield extend_zihua.file_transformMd5(${this.id}_file_token);`);
        tryBlock.bodyBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.returnValueSocket, dataVarName);
     
        
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNode_FileDelete extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FILEDELETE, '文件删除', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '返回值': this.returnValueSocket = socket; break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'file_token':
                        this.tokenSocket = socket;
                        break;
            }});
        }
        

        if (this.tokenSocket == null) {
            this.tokenSocket = new NodeSocket('file_token', this, true);
            this.addSocket(this.tokenSocket);
        }
        
        
        if (this.returnValueSocket == null) {
            this.returnValueSocket = this.addSocket(new NodeSocket('返回值', this, false));
        }
        

        this.tokenSocket.label = 'fileToken';
        this.tokenSocket.type = ValueType.String;

        
        this.returnValueSocket.label = '返回值';
        this.returnValueSocket.type = ValueType.Object;
      
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('fileSystem', '../../../../fileSystem.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        myServerBlock.pushLine(`var ${dataVarName}=null;`);
        var tryBlock = new JSFile_Try('try');
        myServerBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(`${dataVarName} = yield fileSystem.deleteFile(req,${this.id}_file_token);`);
        tryBlock.bodyBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.returnValueSocket, dataVarName);
     
        
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}


JSNodeClassMap[JSNODE_WHILE] = {
    modelClass: JSNode_While,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_TERNARY_OPERATOR] = {
    modelClass: JSNode_Ternary_Operator,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_ARRAY_CONCAT] = {
    modelClass: JSNode_Array_Concat,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_PUSH] = {
    modelClass: JSNode_Array_Push,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_POP] = {
    modelClass: JSNode_Array_Pop,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_GET] = {
    modelClass: JSNode_Array_Get,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_ARRAY_JOIN] = {
    modelClass: JSNode_Array_Join,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_SLICE] = {
    modelClass: JSNode_Array_Slice,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_GETDAY] = {
    modelClass: JSNode_GetDay,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FORMATNUM] = {
    modelClass: JSNode_FormatNum,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CAPITALNUM] = {
    modelClass: JSNode_CapitalNum,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CONVERT_TIMEZONE] = {
    modelClass: JSNode_Convert_TimeZone,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CONVERT_TIMEZONE] = {
    modelClass: JSNode_Convert_TimeZone,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ASSIGNMENT_OPERATOR] = {
    modelClass: JSNode_Assignment_Operator,
    comClass: C_JSNode_Assignment_Operator,
};
JSNodeClassMap[JSNODE_ISNULLOPERATOR] = {
    modelClass: JSNode_IsNullOperator,
    comClass: C_JSNode_IsNullOperator
}
JSNodeClassMap[JSNODE_MATHFUN] = {
    modelClass: JSNode_Mathfun,
    comClass: C_JSNode_Mathfun,
};
JSNodeClassMap[JSNODE_ARRAY_SHIFT] = {
    modelClass: JSNode_Array_Shift,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_UNSHIFT] = {
    modelClass: JSNode_Array_Unshift,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_REVERSE] = {
    modelClass: JSNode_Array_Reverse,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FOR] = {
    modelClass: JSNode_For,
    comClass: C_JSNode_For,
};
JSNodeClassMap[JSNODE_EXCELHEADER] = {
    modelClass: JSNode_ExcelHeader,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_MD5] = {
    modelClass: JSNode_Md5,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FILEDELETE] = {
    modelClass: JSNode_FileDelete,
    comClass: C_Node_SimpleNode,
};
/*
JSNodeEditorControls_arr.push(
    {
        label: 'while',
        nodeClass: JSNode_While,
        type: '流控制'
    });
*/
JSNodeEditorControls_arr.push(
    {
        label: '数组-Concat',
        nodeClass: JSNode_Array_Concat,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '三元运算',
        nodeClass: JSNode_Ternary_Operator,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Get',
        nodeClass: JSNode_Array_Get,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Push',
        nodeClass: JSNode_Array_Push,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Pop',
        nodeClass: JSNode_Array_Pop,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Shift',
        nodeClass: JSNode_Array_Shift,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Unshift',
        nodeClass: JSNode_Array_Unshift,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Join',
        nodeClass: JSNode_Array_Join,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Slice',
        nodeClass: JSNode_Array_Slice,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组-Reverse',
        nodeClass: JSNode_Array_Reverse,
        type: '数组操控'
    });

JSNodeEditorControls_arr.push(
    {
        label: '获取星期(?)',
        nodeClass: JSNode_GetDay,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: '格式化数字',
        nodeClass: JSNode_FormatNum,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: '货币中文大写',
        nodeClass: JSNode_CapitalNum,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: '赋值运算符',
        nodeClass: JSNode_Assignment_Operator,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: 'isNull判断',
        nodeClass: JSNode_IsNullOperator,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数学函数',
        nodeClass: JSNode_Mathfun,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: 'for',
        nodeClass: JSNode_For,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: 'excelHeader',
        nodeClass: JSNode_ExcelHeader,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: 'md5加密',
        nodeClass: JSNode_Md5,
        type: '基础'
    });
JSNodeEditorControls_arr.push(
    {
        label: '文件删除',
        nodeClass: JSNode_FileDelete,
        type: '基础'
    });