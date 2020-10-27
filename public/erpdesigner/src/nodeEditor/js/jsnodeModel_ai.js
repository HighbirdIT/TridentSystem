const JSNODE_AI_SENDMESSAGE = 'ai_sendmessage';
const JSNODE_MESSAGE_TEXT = 'message_text';
const JSNODE_MESSAGE_LINK = 'message_link';
const JSNODE_MESSAGE_SINGLEACTIONCARD = 'message_singleactioncard';
const JSNODE_MESSAGE_ACTIONCARD = 'message_actioncard';
const JSNODE_MESSAGE_ACTIONCARDITEM = 'message_actioncarditem';
const JSNODE_MESSAGE_MARKDOWN = 'message_markdown';


class JsNode_AI_SendMessage extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_AI_SENDMESSAGE, '推送机器人消息', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        var isServerScript = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (isServerScript) {
            if (this.outFlowSocket == null) {
                this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
                this.addSocket(this.outFlowSocket);
            }
        }
        else {
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
        }

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'aiid':
                        this.aiidScoket = socket;
                        break;
                    case 'data':
                        this.dataScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
        }

        if (this.aiidScoket == null) {
            this.aiidScoket = this.addSocket(new NodeSocket('aiid', this, true));
        }
        this.aiidScoket.set({
            inputable: true,
            label:'目标',
            inputDDC_setting: {
                textAttrName: 'name',
                valueAttrName: 'code',
                options_arr: AI_arr,
            },
        });
        if (this.dataScoket == null) {
            this.dataScoket = this.addSocket(new NodeSocket('data', this, true));
        }
        this.dataScoket.label = '发送消息';
        this.dataScoket.type = ValueType.Object;
        this.dataScoket.inputable = false;
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJsBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJsBlock);

        var socketComRet = this.getSocketCompileValue(helper, this.aiidScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var aiid = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataScoket, usePreNodes_arr, belongBlock, false, false);
        if (socketComRet.err) {
            return false;
        }
        var sendData = socketComRet.value;
        if (this.checkCompileFlag(socketComRet.link == null || 
            !(socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_TEXT ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_LINK ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_SINGLEACTIONCARD ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_ACTIONCARD ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_MARKDOWN ||
              socketComRet.link.outSocket.node.type == JSNODE_VAR_GET ||
              socketComRet.link.outSocket.node.type == JSNODE_VAR_SET)
            , '不支持的消息体节点', helper)) {
            return false;
        }

        helper.flowFile.appendImport('dingAIHelper', '../../../../dingding/ai/dingAIHelper.js');

        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myJsBlock.pushChild(tryBlock);
        tryBlock.bodyBlock.pushLine('yield dingAIHelper.SendToAI(' + aiid + ',' + sendData + ');');
        var endtryBlock = new JSFile_Try('endtry');
        myJsBlock.pushChild(endtryBlock);

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJsBlock);

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        if (serverFlow_links.length > 0) {
            if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, endtryBlock) == false) {
                return false;
            }
        }
        return selfCompileRet;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var socketComRet = this.getSocketCompileValue(helper, this.aiidScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var aiid = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataScoket, usePreNodes_arr, belongBlock, false, false);
        if (socketComRet.err) {
            return false;
        }
        var sendData = socketComRet.value;
        if (this.checkCompileFlag(socketComRet.link == null || 
            !(socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_TEXT ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_LINK ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_SINGLEACTIONCARD ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_ACTIONCARD ||
              socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_MARKDOWN ||
              socketComRet.link.outSocket.node.type == JSNODE_VAR_GET ||
              socketComRet.link.outSocket.node.type == JSNODE_VAR_SET)
            , '不支持的消息体节点', helper)) {
            return false;
        }

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('dingAIHelper', '../../../../dingding/ai/dingAIHelper.js');
        }

        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var paramVarName = this.id + 'params_arr';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var paramInitBlock = new FormatFileBlock('initparam');
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }

        var serverSideActName = this.id;

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
        serverFun.scope.getVar(paramVarName, true, 'null');
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(paramInitBlock);
        serverFunBodyBlock.pushChild(myServerBlock);

        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock
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

        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myServerBlock.pushChild(tryBlock);
        tryBlock.bodyBlock.pushLine('yield dingAIHelper.SendToAI(' + aiid + ',' + sendData + ');');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
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
        helper.setCompileRetCache(this, selfCompileRet);
        var autoCallFetchEnd = this.autoCallFetchEnd != false;

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }
            else if (autoCallFetchEnd) {
                fetchEndBlock.pushLine('return callback_final(state, null,' + errVarName + ');');
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
        }
        return selfCompileRet;
    }
}

class JSNode_Message_Text extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_TEXT, '创建文本消息', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'atall':
                        this.atallScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.contentScoket == null) {
            this.contentScoket = this.addSocket(new NodeSocket('content', this, true));
        }
        this.contentScoket.label = '内容';
        this.contentScoket.inputable = true;
        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '消息对象';

        if (this.atallScoket == null) {
            this.atallScoket = this.addSocket(new NodeSocket('atall', this, true));
        }
        this.atallScoket.type = ValueType.Boolean;
        this.atallScoket.label = '@所有人';
        this.atallScoket.inputable = true;
        if(this.atallScoket.defval == null){
            this.atallScoket.defval = false;
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var content = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.atallScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var atall = socketComRet.value;

        var retData = '{type: "text",content: ' + content + ', isAtAll:' + atall + '}';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Message_Link extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_LINK, '创建链接消息', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    case 'ispc':
                        this.ispcScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleScoket.label = '标题';
        this.titleScoket.inputable = true;

        if (this.contentScoket == null) {
            this.contentScoket = this.addSocket(new NodeSocket('content', this, true));
        }
        this.contentScoket.label = '内容';
        this.contentScoket.inputable = true;

        if (this.flowStepScoket == null) {
            this.flowStepScoket = new NodeSocket('flowStep', this, true);
            this.addSocket(this.flowStepScoket);
        }
        this.flowStepScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'fullName',
                valueAttrName: 'code',
                options_arr: gFlowMaster.getAllSteps,
            },
            hideIcon: true,
            label: '关联流程步骤',
        });

        if (this.projectScoket == null) {
            this.projectScoket = new NodeSocket('project', this, true);
            this.addSocket(this.projectScoket);
        }
        this.projectScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: ProjectRecords_arr,
            },
            hideIcon: true,
            label: '关联方案',
        });

        if (this.intdataScoket == null) {
            this.intdataScoket = new NodeSocket('intdata', this, true);
            this.addSocket(this.intdataScoket);
        }
        this.intdataScoket.set({
            type: ValueType.Int,
            label: '关联数据',
        });

        if (this.ispcScoket == null) {
            this.ispcScoket = this.addSocket(new NodeSocket('ispc', this, true));
        }
        this.ispcScoket.label = '限定PC页面';
        this.ispcScoket.type = ValueType.Boolean;
        this.ispcScoket.inputable = true;
        if(this.ispcScoket.defval == null){
            this.ispcScoket.defval = false;
        }

        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '消息对象';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var content = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.projectScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var project = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.flowStepScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var flowStep = socketComRet.value;
        if(flowStep == null){
            flowStep = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var stepData = socketComRet.value;
        if(stepData == null){
            stepData = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.ispcScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var ispc = socketComRet.value;

        var retData = "{type:'link',title:" + title + ",content:" + content + ",proj:" + project + ",flowStep:" + flowStep + ",stepData:" + stepData + ",ispc:" + ispc + "}"
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Message_SingleActionCard extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_SINGLEACTIONCARD, '创建独立卡片消息', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'singleTitle':
                        this.singleTitleScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    case 'ispc':
                        this.ispcScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleScoket.label = '标题';
        this.titleScoket.inputable = true;

        if (this.contentScoket == null) {
            this.contentScoket = this.addSocket(new NodeSocket('content', this, true));
        }
        this.contentScoket.label = '内容';
        this.contentScoket.inputable = true;

        if (this.singleTitleScoket == null) {
            this.singleTitleScoket = this.addSocket(new NodeSocket('singleTitle', this, true));
        }
        this.singleTitleScoket.label = '小标题';
        this.singleTitleScoket.inputable = true;

        if(this.singleTitleScoket.defval == null){
            this.singleTitleScoket.defval = '查看详情';
        }

        if (this.flowStepScoket == null) {
            this.flowStepScoket = new NodeSocket('flowStep', this, true);
            this.addSocket(this.flowStepScoket);
        }
        this.flowStepScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'fullName',
                valueAttrName: 'code',
                options_arr: gFlowMaster.getAllSteps,
            },
            hideIcon: true,
            label: '关联流程步骤',
        });

        if (this.projectScoket == null) {
            this.projectScoket = new NodeSocket('project', this, true);
            this.addSocket(this.projectScoket);
        }
        this.projectScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: ProjectRecords_arr,
            },
            hideIcon: true,
            label: '关联方案',
        });

        if (this.intdataScoket == null) {
            this.intdataScoket = new NodeSocket('intdata', this, true);
            this.addSocket(this.intdataScoket);
        }
        this.intdataScoket.set({
            type: ValueType.Int,
            label: '关联数据',
        });

        if (this.ispcScoket == null) {
            this.ispcScoket = this.addSocket(new NodeSocket('ispc', this, true));
        }
        this.ispcScoket.label = '限定PC页面';
        this.ispcScoket.type = ValueType.Boolean;
        this.ispcScoket.inputable = true;
        if(this.ispcScoket.defval == null){
            this.ispcScoket.defval = false;
        }

        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '消息对象';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var content = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.singleTitleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var singleTitle = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.projectScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var project = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.flowStepScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var flowStep = socketComRet.value;
        if(flowStep == null){
            flowStep = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var stepData = socketComRet.value;
        if(stepData == null){
            stepData = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.ispcScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var ispc = socketComRet.value;

        var retData = "{type:'singleActionCard',title:" + title + ",text:" + content + ",singleTitle:" + singleTitle + ",proj:" + project + ",flowStep:" + flowStep + ",stepData:" + stepData + ",ispc:" + ispc + "}"
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Message_ActionCard extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_ACTIONCARD, '创建卡片消息', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'btnOrientation':
                        this.btnOrientationScoket = socket;
                        break;
                    case 'cards':
                        this.cardsScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleScoket.label = '标题';
        this.titleScoket.inputable = true;

        if (this.contentScoket == null) {
            this.contentScoket = this.addSocket(new NodeSocket('content', this, true));
        }
        this.contentScoket.label = '内容';
        this.contentScoket.inputable = true;

        if (this.btnOrientationScoket == null) {
            this.btnOrientationScoket = this.addSocket(new NodeSocket('btnOrientation', this, true));
        }
        this.btnOrientationScoket.label = '横向按钮';
        this.btnOrientationScoket.inputable = true;
        this.btnOrientationScoket.type = ValueType.Boolean;

        if(this.btnOrientationScoket.defval == null){
            this.btnOrientationScoket.defval = false;
        }

        if (this.cardsScoket == null) {
            this.cardsScoket = this.addSocket(new NodeSocket('cards', this, true));
        }
        
        this.cardsScoket.label = '卡片数组';
        this.cardsScoket.type = ValueType.Array;
        this.cardsScoket.inputable = false;

        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '消息对象';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var content = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.btnOrientationScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var btnOrientation = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.cardsScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var cards = socketComRet.value;

        if (this.checkCompileFlag(
              socketComRet.link.outSocket.node.type != JSNODE_MESSAGE_ACTIONCARD &&
              socketComRet.link.outSocket.node.type != JSNODE_ARRAY_NEW &&
              socketComRet.link.outSocket.node.type != JSNODE_VAR_GET
            , '不支持的卡片数组输入值', helper)) {
            return false;
        }

        if(socketComRet.link.outSocket.node.type == JSNODE_MESSAGE_ACTIONCARD){
            cards = '[' + cards + ']';
        }

        var retData = "{type:'actionCard',title:" + title + ",text:" + content + ",btnOrientation:" + (btnOrientation ? 1 : 0) + ",btns:" + cards + "}"
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Message_ActionCardItem extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_ACTIONCARDITEM, '卡片消息项', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    case 'ispc':
                        this.ispcScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleScoket.label = '标题';
        this.titleScoket.inputable = true;

        if (this.flowStepScoket == null) {
            this.flowStepScoket = new NodeSocket('flowStep', this, true);
            this.addSocket(this.flowStepScoket);
        }
        this.flowStepScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'fullName',
                valueAttrName: 'code',
                options_arr: gFlowMaster.getAllSteps,
            },
            hideIcon: true,
            label: '关联流程步骤',
        });

        if (this.projectScoket == null) {
            this.projectScoket = new NodeSocket('project', this, true);
            this.addSocket(this.projectScoket);
        }
        this.projectScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: ProjectRecords_arr,
            },
            hideIcon: true,
            label: '关联方案',
        });

        if (this.intdataScoket == null) {
            this.intdataScoket = new NodeSocket('intdata', this, true);
            this.addSocket(this.intdataScoket);
        }
        this.intdataScoket.set({
            type: ValueType.Int,
            label: '关联数据',
        });

        if (this.ispcScoket == null) {
            this.ispcScoket = this.addSocket(new NodeSocket('ispc', this, true));
        }
        this.ispcScoket.label = '限定PC页面';
        this.ispcScoket.type = ValueType.Boolean;
        this.ispcScoket.inputable = true;
        if(this.ispcScoket.defval == null){
            this.ispcScoket.defval = false;
        }

        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '卡片项';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.projectScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var project = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.flowStepScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var flowStep = socketComRet.value;
        if(flowStep == null){
            flowStep = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var stepData = socketComRet.value;
        if(stepData == null){
            stepData = -1;
        }

        socketComRet = this.getSocketCompileValue(helper, this.ispcScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var ispc = socketComRet.value;

        var retData = "{title:" + title + ",proj:" + project + ",flowStep:" + flowStep + ",stepData:" + stepData + ",ispc:" + ispc + "}"
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Message_MarkDown extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MESSAGE_MARKDOWN, '创建MarkDown消息', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'atall':
                        this.atallScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleScoket.label = '标题';
        this.titleScoket.inputable = true;

        if (this.contentScoket == null) {
            this.contentScoket = this.addSocket(new NodeSocket('content', this, true));
        }
        this.contentScoket.label = '内容';
        this.contentScoket.inputable = true;
        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('output', this, false));
        }
        this.outSocket.label = '消息对象';

        if (this.atallScoket == null) {
            this.atallScoket = this.addSocket(new NodeSocket('atall', this, true));
        }
        this.atallScoket.type = ValueType.Boolean;
        this.atallScoket.label = '@所有人';
        this.atallScoket.inputable = true;
        if(this.atallScoket.defval == null){
            this.atallScoket.defval = false;
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var content = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.atallScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var atall = socketComRet.value;

        var retData = '{type: "markdown",text: ' + content + ',title:' + title + ',isAtAll:' + atall + '}';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, retData);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

JSNodeClassMap[JSNODE_AI_SENDMESSAGE] = {
    modelClass: JsNode_AI_SendMessage,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_TEXT] = {
    modelClass: JSNode_Message_Text,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_LINK] = {
    modelClass: JSNode_Message_Link,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_SINGLEACTIONCARD] = {
    modelClass: JSNode_Message_SingleActionCard,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_ACTIONCARD] = {
    modelClass: JSNode_Message_ActionCard,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_ACTIONCARDITEM] = {
    modelClass: JSNode_Message_ActionCardItem,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_MESSAGE_MARKDOWN] = {
    modelClass: JSNode_Message_MarkDown,
    comClass: C_Node_SimpleNode,
};

JSNodeEditorControls_arr.push(
{
    label: '推送机器人消息',
    nodeClass: JsNode_AI_SendMessage,
    type: '机器人'
});

JSNodeEditorControls_arr.push(
{
    label: '创建文本消息',
    nodeClass: JSNode_Message_Text,
    type: '通知'
});

JSNodeEditorControls_arr.push(
{
    label: '创建链接消息',
    nodeClass: JSNode_Message_Link,
    type: '通知'
});
JSNodeEditorControls_arr.push(
{
    label: '创建独立卡片消息',
    nodeClass: JSNode_Message_SingleActionCard,
    type: '通知'
});
JSNodeEditorControls_arr.push(
{
    label: '创建卡片消息',
    nodeClass: JSNode_Message_ActionCard,
    type: '通知'
});
JSNodeEditorControls_arr.push(
{
    label: '创建卡片消息项',
    nodeClass: JSNode_Message_ActionCardItem,
    type: '通知'
});
    
JSNodeEditorControls_arr.push(
{
    label: '创建MarkDown消息',
    nodeClass: JSNode_Message_MarkDown,
    type: '通知'
});