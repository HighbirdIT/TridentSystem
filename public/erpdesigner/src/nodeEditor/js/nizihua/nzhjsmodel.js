const JSNODE_WHILE = 'jswhile';
const JSNODE_ARRAY_CONCAT = 'concat';
const JSNODE_TERNARY_OPERATOR = 'ternary_operator';
const JSNODE_ARRAYS_PUSHANDPOP = 'push_pop';
const JSNODE_ARRAY_JOIN='array_join'
const JSNODE_ARRAY_SLICE='array_slice'
const JSNODE_STORED_PROCEDURE='stored_procedure'
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
class JSNode_Arrays_PushAndPop extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNode_ARRAYS_PUSHANDPOP, 'push_pop', false, nodeJson);
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
        selfCompileRet.setSocketOut(this.outSocket, socketValue + '.push(' + arrar_addValue + ')');
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
                if(theSocket.type =='array' && IsEmptyString(theSocket.defval)){
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '需要设置参数']);
                    return false;
                }
                if(theSocket.type !='array' && IsEmptyString(theSocket.defval)){
                    tValue = "','";
                }else{
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
                    tValue = "'" +tValue.replace(/\'/g, '')+"'"
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
        var end_value=null;

        var execute_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var socketComRet = this.getSocketCompileValue(helper, this.inputScokets_arr[i], usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            execute_arr.push(socketComRet.value.replace(/\'/g, ''));
        }
        socketValue=execute_arr[0];
        start_value =execute_arr[1];
        end_value=execute_arr[2];
        if((start_value | 0) != start_value || (end_value | 0) != end_value ){
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '应该输入整数']);
            return false;
        }
        if(start_value >end_value){
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '起始参数应该小于结束参数']);
            return false;
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, execute_arr[0].replace(/\'/g, '') + '.slice(' + start_value+','+end_value+ ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Stored_Procedure extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STORED_PROCEDURE, 'stored_procedure', false, nodeJson);
        this.isServerSide = true;
        autoBind(this);
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outDataSocket = this.outputScokets_arr[0];
            }
            if (this.outputScokets_arr.length > 1) {
                this.outErrorSocket = this.outputScokets_arr[1];
            }
        }
        if (this.outDataSocket == null) {
            this.outDataSocket = new NodeSocket('outdata', this, false, { type: ValueType.Any });
            this.addSocket(this.outDataSocket);
        }
        if (this.outErrorSocket == null) {
            this.outErrorSocket = new NodeSocket('outerror', this, false, { type: ValueType.Object });
            this.addSocket(this.outErrorSocket);
        }
        this.outDataSocket.label = '结果';
        this.outErrorSocket.label = '错误';

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var project = createHelper.project;
                var dataMaster = null;
                if (createHelper.project) {
                    dataMaster = project.dataMaster;
                }
                else if (createHelper.dataMaster) {
                    dataMaster = createHelper.dataMaster;
                }
                this.targetEntity = dataMaster.getDataSourceByCode(tem_arr[1]);
                if (this.targetEntity) {
                    this.targetEntity.on('syned', this.entitySynedHandler);
                    if (this.targetEntity.isCustomDS) {
                        this.entitySynedHandler();
                    }
                }
            }
            else {
                this.targetEntity = null;
            }
        }
        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
        else{
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'flow_c_foreach':
                        this.clientForEachSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'flow_s_foreach':
                        this.serverForEachSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!bluePrintIsServer) {
            if(this.clientForEachSocket == null){
                this.clientForEachSocket = new NodeFlowSocket('flow_c_foreach', this, false);
                this.addSocket(this.clientForEachSocket);
            }
            this.clientForEachSocket.label = 'ForEach';
        }
        else{
            if (this.clientForEachSocket) {
                this.removeSocket(this.clientForEachSocket);
            }
        }
        if(this.serverForEachSocket == null){
            this.serverForEachSocket = new NodeFlowSocket('flow_s_foreach', this, false);
            this.addSocket(this.serverForEachSocket);
        }
        this.serverForEachSocket.label = 'server ForEach';

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        
    }

    preRemoveSocket(theSocket){
        return theSocket != this.outDataSocket && this.outErrorSocket != theSocket;
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
            jsonProf.useEntity(this.targetEntity);
        }
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity']);
    }

    inputSocketSortFun(sa, sb) {
        return sa.index > sb.index;
    }

    entitySynedHandler() {
        var entity = this.targetEntity;
        if (entity && entity.loaded) {
            var entity_param_arr = [];
            var params_arr = entity.getParams();
            if (params_arr) {
                if (!entity.isCustomDS) {
                    params_arr.forEach((param, i) => {
                        if (param.isreturn == false) {
                            // param.parent != null 说明是自订数据源中的参数
                            entity_param_arr.push(param);
                        }
                    });
                }
                else {
                    entity_param_arr = params_arr;
                }
            }

            this.inputScokets_arr.forEach(item => {
                item._validparam = false;
            });
            var hadChanged = false;
            entity_param_arr.forEach((param, i) => {
                var theSocket = this.getScoketByName(param.name);
                if (theSocket == null) {
                    this.addSocket(new NodeSocket(param.name, this, true, { type: SqlVarType_Scalar, label: param.name, index: i }));
                    hadChanged = true;
                }
                else {
                    theSocket._validparam = true;
                    if (theSocket.label != param.name) {
                        theSocket.set({ label: param.name });
                    }
                    theSocket.index = i;
                }
            }
            );
            var needSort = false;
            for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                var theSocket = this.inputScokets_arr[si];
                if (theSocket._validparam == false) {
                    this.removeSocket(theSocket);
                    --si;
                    hadChanged = true;
                }
                else {
                    if (!needSort) {
                        needSort = theSocket.index == si;
                    }
                }
            }
            if (needSort) {
                this.inputScokets_arr.sort(this.inputSocketSortFun);
            }
            if (hadChanged || needSort) {
                this.fireEvent(Event_SocketNumChanged, 20);
                this.bluePrint.fireChanged();
            }
        }
        this.fireChanged();
        this.fireMoved(10);
    }

    genOutSocket() {
        var theDS = this.targetEntity;
        if (theDS == null) {
            return null;
        }
        var hadColumns_arr = [];
        for (var si in this.outputScokets_arr) {
            var outSocket = this.outputScokets_arr[si];
            var columnName = outSocket.getExtra('colName');
            if (columnName != null) {
                hadColumns_arr.push(columnName);
            }
        }
        var emptyCol = theDS.columns.find(colItem => {
            return hadColumns_arr.indexOf(colItem.name) == -1;
        });
        if (emptyCol == null) {
            return null;
        }
        var newSocket = new NodeSocket(this.getUseableOutSocketName('col'), this, false, { type: ValueType.String });
        newSocket.setExtra('colName', emptyCol.name);
        return newSocket;
    }

    setEntity(entity) {
        var dataMaster = null;
        if (this.bluePrint.master && this.bluePrint.master.project) {
            dataMaster = this.bluePrint.master.project.dataMaster;
        }
        else if (this.bluePrint.dataMaster) {
            dataMaster = this.bluePrint.dataMaster;
        }
        if (typeof entity === 'string') {
            if (entity != '0') {
                entity = dataMaster.getDataSourceByCode(entity);
            }
            else {
                entity = null;
            }
        }
        if (this.targetEntity == entity)
            return;
        if (this.targetEntity != null) {
            this.targetEntity.off('syned', this.entitySynedHandler);
        }
        this.targetEntity = entity;
        if (entity) {
            entity.on('syned', this.entitySynedHandler);
            this.outDataSocket.type = entity.isScalar() ? SqlVarType_Scalar : SqlVarType_Table;
        }
        else {
            this.outDataSocket.type = SqlVarType_Unknown;
        }
        this.entitySynedHandler();
        this.outDataSocket.fireEvent('changed');
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();

        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                params_arr.push({ name: theSocket.name.trim().replace('@', ''), value: socketValue });
            }
        }
        var targetColumns_arr = [];
        var targetColumnSockets_arr = [];
        for (i = 0; i < this.outputScokets_arr.length; ++i) {
            var theSocket = this.outputScokets_arr[i];
            if(theSocket == this.outDataSocket || theSocket == this.outErrorSocket){
                continue;
            }
            var colName = theSocket.getExtra('colName');
            var columnItem = this.targetEntity.getColumnByName(colName);
            if(this.checkCompileFlag(columnItem == null,colName + '不是个有效的列名', helper)){
                return false;
            }
            if(targetColumns_arr.indexOf(colName) == -1){
                targetColumns_arr.push(colName);
            }
            targetColumnSockets_arr.push(theSocket);
        }
        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        if(this.checkCompileFlag(!isScalar && targetColumns_arr.length == 0,'请至少选择一个输出列', helper)){
            return false;
        }
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        // make server side code
        var paramVarName = this.id + 'params_arr';
        var paramInitBlock = new FormatFileBlock('initparam');
        paramInitBlock.pushLine('var ' + paramVarName + '=[', 1);
        myJSBlock.pushChild(paramInitBlock);
        params_arr.forEach(param => {
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
        });
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        var sqlInitValue = '';
        if (targetEntity.group == 'custom') {
            // 定制数据源
            if (helper.sqlBPCacheManager) {
                sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
            }
            else {
                var bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                bpCompileHelper.clickLogBadgeItemHandler = null;
                var compileRet = targetEntity.compile(bpCompileHelper);
                if (compileRet == false) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                    '自订数据源' + targetEntity.name + '编译发生错误，无法继续']);
                    return false;
                }
                sqlInitValue = compileRet.sql;
            }
        }
        else {
            if (isScalar) {
                sqlInitValue = 'select dbo.' + targetEntity.name + '(' + paramListStr + ')';
            }
            else {
                sqlInitValue = 'select ';
                    targetColumns_arr.forEach((colName,i)=>{
                        sqlInitValue += (i==0 ? '[' : ',[') + colName + ']';
                    });
                sqlInitValue += ' from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
            }
        }
        var sqlVarName = this.id + '_sql';
        var dataVarName = this.id + '_data';
        var errVarName = this.id + '_err';
        myJSBlock.pushLine('var ' + sqlVarName + '=' + doubleQuotesStr(sqlInitValue) + ';');
        var rcdRltVarName = this.id + '_rcdRlt';
        myJSBlock.pushLine("var " + rcdRltVarName + " = null;");
        myJSBlock.pushLine("var " + dataVarName + " = null;");
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine('var ' + errVarName + '=eo.message;');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myJSBlock.pushChild(tryBlock);
        if (isScalar) {
            tryBlock.bodyBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
        }
        else {
            tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
            myJSBlock.pushLine(dataVarName + " = " + rcdRltVarName + '.recordset;');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        targetColumnSockets_arr.forEach(socket=>{
            selfCompileRet.setSocketOut(socket, this.id + '_' + socket.getExtra('colName'));
        });

        var serverForEachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverForEachSocket);
        if (serverForEachFlowLinks_arr.length > 0) {
            var serverForachBlock = new FormatFileBlock('serverForachBlock');
            myJSBlock.pushChild(serverForachBlock);
            var serverForachBodyBlock = new FormatFileBlock('serverForachBodyBlock');
            var indexVarName = 'index_' + this.id;
            var nowRowVarName = 'row_' + this.id;
            serverForachBlock.pushLine('var ' + indexVarName + ' = 0;');
            if(isScalar){
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBodyBlock.pushLine('var ' + this.id + '_' + targetColumns_arr[0] + '=' + dataVarName + ';');
            }
            else{
                serverForachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', dataVarName, '.length;++',indexVarName,'){'), 1);
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBlock.subNextIndent();
                serverForachBlock.pushLine('}');
                serverForachBodyBlock.pushLine('var ' + nowRowVarName + '=' + dataVarName + '[' + indexVarName + '];');
                targetColumns_arr.forEach(colName=>{
                    serverForachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            this.compileFlowNode(serverForEachFlowLinks_arr[0], helper, usePreNodes_arr, serverForachBodyBlock);
        }

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(this.targetEntity == null, '需要选择一个数据实体', helper)) {
            return false;
        }
        if (this.checkCompileFlag(this.targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
            return false;
        }
        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }
        var blockInServer = belongBlock.getScope().isServerSide;
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        var i;
        var theSocket;
        if (this.inputScokets_arr.length > 0) {
            for (i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                params_arr.push({ name: theSocket.name.trim().replace('@', ''), value: socketValue });
            }
        }

        var targetColumns_arr = [];
        var targetColumnSockets_arr = [];
        for (i = 0; i < this.outputScokets_arr.length; ++i) {
            var theSocket = this.outputScokets_arr[i];
            if(theSocket == this.outDataSocket || theSocket == this.outErrorSocket){
                continue;
            }
            var colName = theSocket.getExtra('colName');
            var columnItem = this.targetEntity.getColumnByName(colName);
            if(this.checkCompileFlag(columnItem == null,colName + '不是个有效的列名', helper)){
                return false;
            }
            if(targetColumns_arr.indexOf(colName) == -1){
                targetColumns_arr.push(colName);
            }
            targetColumnSockets_arr.push(theSocket);
        }
        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        if(this.checkCompileFlag(!isScalar && targetColumns_arr.length == 0,'请至少选择一个输出列', helper)){
            return false;
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = this.bluePrint.id + '_' + this.id;
        var rcdRltVarName = this.id + '_rcdRlt';
        var serverForachBlock = new FormatFileBlock('serverForachBlock');
        var serverForachBodyBlock = new FormatFileBlock('serverForachBodyBlock');
        if (theServerSide != null) {
            var queryFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(queryFun);
            queryFun.bundleCheckBlock = new FormatFileBlock('bundleCheck');
            queryFun.bodyBlock.pushChild(queryFun.bundleCheckBlock);
            var paramVarName = this.id + 'params_arr';
            queryFun.scope.getVar(paramVarName, true, 'null');
            queryFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            queryFun.pushLine(paramVarName + " = null;");
            var paramListStr = '';
            if (params_arr.length > 0) {
                queryFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
                var paramInitBlock = new FormatFileBlock('initparam');
                paramInitBlock.pushLine(paramVarName + "=[", 1);
                params_arr.forEach(param => {
                    paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                    queryFun.bundleCheckBlock.pushLine("if(" + postBundleVarName + '.' + param.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + param.name + ']");}');
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + postBundleVarName + "." + param.name + "),");
                });
                paramInitBlock.subNextIndent();
                paramInitBlock.pushLine('];');
                queryFun.pushChild(paramInitBlock);
            }
            var sqlInitValue = '';
            if (targetEntity.group == 'custom') {
                // 定制数据源
                if (helper.sqlBPCacheManager) {
                    sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                }
                else {
                    var bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
                    bpCompileHelper.clickLogBadgeItemHandler = null;
                    var compileRet = targetEntity.compile(bpCompileHelper);
                    if (compileRet == false) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                        '自订数据源' + targetEntity.name + '编译发生错误，无法继续']);
                        return false;
                    }
                    sqlInitValue = compileRet.sql;
                }
            }
            else {
                if (isScalar) {
                    sqlInitValue = 'select dbo.' + targetEntity.name + '(' + paramListStr + ')';
                }
                else {
                    sqlInitValue = 'select ';
                    targetColumns_arr.forEach((colName,i)=>{
                        sqlInitValue += (i==0 ? '[' : ',[') + colName + ']';
                    });
                    sqlInitValue += ' from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
                }
            }
            var sqlVarName = this.id + 'sql';
            queryFun.scope.getVar(sqlVarName, true, doubleQuotesStr(sqlInitValue));
            queryFun.pushLine("var " + rcdRltVarName + " = null;");
            var tryBlock = new JSFile_Try('try');
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            queryFun.pushChild(tryBlock);
            if (isScalar) {
                tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
                tryBlock.bodyBlock.pushChild(serverForachBlock);
                queryFun.pushLine("return " + rcdRltVarName + ';');
            }
            else {
                tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
                tryBlock.bodyBlock.pushChild(serverForachBlock);
                queryFun.pushLine("return " + rcdRltVarName + '.recordset;');
            }
            theServerSide.processesMapVarInitVal[queryFun.name] = queryFun.name;
        }

        // makeClient
        helper.compilingFun.hadServerFetch = true;
        var myJSBlock = new FormatFileBlock(this.id);
        var initBundleBlock = new FormatFileBlock('initbundle');
        belongBlock.pushChild(myJSBlock);
        params_arr.forEach(param => {
            initBundleBlock.pushLine(param.name + ':' + param.value + ',');
        });

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        if (params_arr.length > 0) {
            myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
            helper.addInitClientBundleBlock(initBundleBlock);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
        }
        else {
            myJSBlock.pushLine("var " + bundleVarName + " = {};");
        }
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        myJSBlock.pushLine('setTimeout(() => {', 1);
        myJSBlock.pushLine("if(fetchTracer['" + helper.compilingFun.name + "'] != fetchid) return;");
        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},false)));');
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}, 50);');

        var indexVarName = 'index_' + this.id;
        var nowRowVarName = 'row_' + this.id;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        targetColumnSockets_arr.forEach(socket=>{
            selfCompileRet.setSocketOut(socket, this.id + '_' + socket.getExtra('colName'));
        });

        var serverForEachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverForEachSocket);
        if (serverForEachFlowLinks_arr.length > 0) {
            serverForachBlock.pushLine('var ' + indexVarName + ' = 0;');
            if(isScalar){
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBodyBlock.pushLine('var ' + this.id + '_' + targetColumns_arr[0] + '=' + rcdRltVarName + ';');
            }
            else{
                serverForachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', rcdRltVarName, '.recordset.length;++',indexVarName,'){'), 1);
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBlock.subNextIndent();
                serverForachBlock.pushLine('}');
                serverForachBodyBlock.pushLine('var ' + nowRowVarName + '=' + rcdRltVarName + '.recordset[' + indexVarName + '];');
                targetColumns_arr.forEach(colName=>{
                    serverForachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            this.compileFlowNode(serverForEachFlowLinks_arr[0], helper, usePreNodes_arr, serverForachBodyBlock);
        }

        var clientForEachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.clientForEachSocket);
        if (clientForEachFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '此节点的client流无法被执行到', helper)) {
                return false;
            }
            var clientForEachBlock = new FormatFileBlock('clientforeach');
            fetchEndBlock.pushChild(clientForEachBlock);
            clientForEachBlock.pushLine('var ' + indexVarName + ' = 0;');
            var clientForEachBodyBlock = new FormatFileBlock('clientforeachbody');
            if(isScalar){
                clientForEachBlock.pushChild(clientForEachBodyBlock);
                clientForEachBodyBlock.pushLine('var ' + this.id + '_' + targetColumns_arr[0] + '=' + dataVarName + ';');
            }
            else{
                clientForEachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', dataVarName, '.length;++',indexVarName,'){'), 1);
                clientForEachBlock.pushChild(clientForEachBodyBlock);
                clientForEachBlock.subNextIndent();
                clientForEachBlock.pushLine('}');
                clientForEachBodyBlock.pushLine('var ' + nowRowVarName + '=' + dataVarName + '[' + indexVarName + '];');
                targetColumns_arr.forEach(colName=>{
                    clientForEachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            this.compileFlowNode(clientForEachFlowLinks_arr[0], helper, usePreNodes_arr, clientForEachBodyBlock);
        }

        if (this.compileOutFlow(helper, usePreNodes_arr, fetchEndBlock) == false) {
            return false;
        }
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
JSNodeClassMap[JSNODE_ARRAYS_PUSHANDPOP] = {
    modelClass: JSNode_Arrays_PushAndPop,
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

JSNodeClassMap[JSNODE_STORED_PROCEDURE] = {
    modelClass: JSNode_Stored_Procedure,
    comClass: C_JSNode_Stored_Procedure,
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
JSNodeEditorControls_arr.push(
    {
        label: '数组尾部增减',
        nodeClass: JSNode_Arrays_PushAndPop,
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
        label: '查询存储过程',
        nodeClass: JSNode_Stored_Procedure,
        type: '数据源'
    });    