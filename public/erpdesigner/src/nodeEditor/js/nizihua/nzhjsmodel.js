const JSNODE_WHILE = 'jswhile';
const JSNODE_ARRAY_CONCAT = 'concat';
const JSNODE_TERNARY_OPERATOR = 'ternary_operator';
const JSNODE_ARRAY_PUSHPOP = 'push_pop';
const JSNODE_ARRAY_JOIN = 'array_join';
const JSNODE_ARRAY_SLICE = 'array_slice';
const JSNODE_GETDAY = 'getDay';
const JSNODE_FORMATNUM = 'formatnum';
const JSNODE_CAPITALNUM = 'capitalnum';
const JSNODE_CONVERT_TIMEZONE='convert_timezone'
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
class JSNode_Array_PushPop extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_PUSHPOP, '数组尾部增加', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Array, inputable: false }));
            this.addSocket(new NodeSocket('inputtwo', this, true, { type: ValueType.String, inputable: true }));
        } 
        this.inputScokets_arr[0].label = '数组';
        this.inputScokets_arr[0].inputable = false;
        this.inputScokets_arr[1].inputable = true;
        this.inputScokets_arr[1].label = '字符串';

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
      
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
        selfCompileRet.setSocketOut(this.outSocket, socketValue + '.push(' + tValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
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
        if ((start_value | 0) != start_value || (end_value | 0) != end_value) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '应该输入整数']);
            return false;
        }
        if (start_value > end_value) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '起始参数应该小于结束参数']);
            return false;
        }
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
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, inputable: true }));
        }
        this.inputScokets_arr[0].label = '日期';
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
        var endstr='';
        var socketlink = socketComRet.link;
        var outSocket = this.outputScokets_arr[0];
        var selfCompileRet = new CompileResult(this);
        if (socketComRet.link ==null){
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
                    blockInServer = temNode.hadFetchFun;
                    break;
                }
            }
        }
        var funPreFix = blockInServer ? 'serverhelper.DateFun.' : '';
        endstr=funPreFix+"getweekDay("+dateStr+")" ;
        
        selfCompileRet.setSocketOut(outSocket, endstr);
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

        if(socketlink == null){
            
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
            this.addSocket(new NodeSocket('inputone', this, true, { type: ValueType.Object, inputable: true }));
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

        var result_arr=[];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[i], usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var dateStr = socketComRet.value;
            if(socketComRet.link ==null){
                if(i==0){
                    if(!checkTime(dateStr)){
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            "应该输入时间"]);
                        return false;
                    }
                }else{
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
        var dateTime =result_arr[0];
        var timeZoneO =result_arr[1];
        var timeZoneT =result_arr[2];
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' Convert_TimeZone(' + dateTime+','+ timeZoneO+','+ timeZoneT+') ');
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
JSNodeClassMap[JSNODE_ARRAY_PUSHPOP] = {
    modelClass: JSNode_Array_PushPop,
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
JSNodeEditorControls_arr.push(
    {
        label: '数组尾部增减',
        nodeClass: JSNode_Array_PushPop,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '数组并为字符串',
        nodeClass: JSNode_Array_Join,
        type: '数组操控'
    });
JSNodeEditorControls_arr.push(
    {
        label: '获取数组片段',
        nodeClass: JSNode_Array_Slice,
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
