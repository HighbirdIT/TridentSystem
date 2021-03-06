const FLOWNODE_VAR_GET = 'var_get';
const FLOWNODE_VAR_SET = 'var_set';
const FLOWNODE_STEP_START = 'stepstart';
const FLOWNODE_CREATE_SERVERERROR = 'createservererror';
const FLOWNODE_QUERY_KEYRECORD = 'querykeyrecord';
const FLOWNODE_COLUMN_VAR = 'columnvar';
const FLOWNODE_SEND_MESSAGE = 'sendmessage';
const FLOWNODE_MESSAGE_CARDITEM = 'messagecarditem';
const FLOWNODE_CONFIRM_FLOWSTEP = 'confirmflowstep';
const FLOWNODE_NOWDATE = 'nowdate';
const FLOWNODE_EXAM = 'exam';

var FlowNodeClassMap = {
};


class FlowNode_Base extends Node_Base {
    constructor(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        super(initData, parentNode, createHelper, type, label, isContainer, nodeJson);
        this.processOutputFlowSockets = this.processOutputFlowSockets.bind(this);
    }

    compileFlowNode(flowLink, helper, usePreNodes_arr, belongBlock) {
        var nextNodeCompileRet = flowLink.inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
        if (nextNodeCompileRet == false) {
            return false;
        }
        var socketOut = nextNodeCompileRet.getSocketOut(flowLink.inSocket);
        if (socketOut.data.parent != belongBlock) {
            belongBlock.pushChild(socketOut.data.clone());
        }
        return nextNodeCompileRet;
    }

    compileOutFlow(helper, usePreNodes_arr, belongBlock) {
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length > 0) {
            return this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, belongBlock);
        }
        return null;
    }

    isReachable() {
        if (this.type == FLOWNODE_START) {
            return true;
        }
        if (this.inFlowSocket) {
            var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inFlowSocket);
            if (flowLinks_arr.length > 0) {
                for (var fi in flowLinks_arr) {
                    var flowLink = flowLinks_arr[fi];
                    var ret = flowLink.outSocket.node.isReachable();
                    if (ret) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

class FlowDef_Variable extends FlowNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSDEF_VAR, '变量', false, nodeJson);

        this.name = ReplaceIfNull(this.name, 'unname');
        this.valType = ReplaceIfNull(this.valType, ValueType.Int);
        this.default = ReplaceIfNull(this.default, '');
        autoBind(this);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.name = this.name;
        rlt.valType = this.valType;
        rlt.default = this.default;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['name', 'valType', 'default']);
    }

    setProp(data) {
        if (data.name != null) {
            var newName = data.name;
            if (newName.length == 0) {
                newName = '未命名';
            }
            if (this.bluePrint) {
                var hadVar = this.bluePrint.getVariableByName(newName);
                if (hadVar && hadVar != this) {
                    newName += '_1';
                }
            }
            this.name = newName;
        }
        if (data.valType != null) {
            this.valType = data.valType;
        }
        if (data.default != null) {
            this.default = data.default;
        }
        if (data.editing != null) {
            this.needEdit = data.editing;
        }
        this.fireChanged();
    }

    toString() {
        var attrs = this;
        var rlt = attrs.name;

        return rlt;
    }

    getLabel() {
        return this.name;
    }

    getRealName() {
        return this.name;
    }

    getValType() {
        return this.valType;
    }

    getDefineString() {
        var defaultvar = this.getDefault();
        return 'var ' + this.name + ' ' + defaultvar + ';';
    }

    getDefault() {
        var defVal = this.default;
        if(IsEmptyString(this.default)){
            defVal = 'null';
        }
        /*
        else if(defVal == "''" || defVal == '""'){
            defVal = "''";
        }
        else if(isNaN(this.default)){
            defVal = singleQuotesStr(this.default);
        }
        */
        return defVal;
    }
}


class FlowNode_BluePrint extends EventEmitter {
    constructor(initData, bluePrintJson, createHelper) {
        super();
        EnhanceEventEmiter(this);
        this.flowChangedHandler = this.flowChangedHandler.bind(this);
        NodeEditor(this);

        this.nodes_arr = [];
        this.vars_arr = [];
        this.links_arr = [];
        this.linkPool = new ScoketLinkPool(this);
        Object.assign(this, initData);
        var self = this;
        if (createHelper == null) {
            createHelper = new NodeCreationHelper();
        }
        this.bluePrint = this;
        this.allNode_map = {};
        this.allVars_map = {};
        this.nodes_arr = [];
        this.group = EJsBluePrintFunGroup.ServerScript;
        this.dataMaster = new DataMaster(null);
        this.dataMaster.flowBP = this;

        if (bluePrintJson != null) {
            assginObjByProperties(this, bluePrintJson, ['type', 'code', 'name', 'editorLeft', 'editorTop', 'ctlID']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(varJson => {
                    var newVar = new FlowDef_Variable({}, this, createHelper, varJson);
                });
            }
            this.dataMaster.restoreFromJson(bluePrintJson.dataMaster);
            createHelper.dataMaster = this.dataMaster;
            this.genNodesByJsonArr(this, bluePrintJson.nodes_arr, createHelper);
            this.linkPool.restoreFromJson(bluePrintJson.links_arr, createHelper);
        }
        else {
        }
        if (this.flow == null) {
            console.error('new FlowNode_BluePrint flow is null');
            return;
        }
        this.flow.on('changed', this.flowChangedHandler);
        this.flowChangedHandler();

        this.name = this.flow.name;
        this.code = 'flow' + this.flow.code;
        this.id = this.code;
        createHelper.fireEvent('complete', createHelper);
    }

    flowChangedHandler(ev) {
        for (var stepI in this.flow.steps_arr) {
            var step = this.flow.steps_arr[stepI];
            var hadStepNode = this.nodes_arr.find(node => { return node.type == FLOWNODE_STEP_START && node.stepCode == step.code; });
            if (hadStepNode == null) {
                var newStepStartNode = new FlowNode_StepStart({ step: step }, this);
            }
        }
    }

    preEditing(editor) {
        // call pre enter Editing
    }

    postEditing(editor) {
        // call leve eidting
    }

    getNodeParentList(theNode) {
        var rlt = [];
        while (theNode.parent) {
            rlt.unshift(theNode.parent);
            theNode = theNode.parent;
        }

        return rlt;
    }

    getNodeTitle() {
        return this.name;
    }

    genNodeId(prefix) {
        if (prefix == null) {
            console.warn('genNodeId参数不能为空');
            return;
        }
        var testI = 0;
        var useID = '';
        while (testI < 9999) {
            useID = prefix + '_' + testI;
            if (this.allNode_map[useID] == null) {
                break;
            }
            ++testI;
        }
        return useID;
    }

    registerNode(node, parentNode) {
        if (node.type == JSDEF_VAR) {
            this.addVariable(node);// 变量需要注册到根节点中
            return;
        }
        if (parentNode == null) {
            parentNode = this;
        }
        if (parentNode.nodes_arr == null) {
            parentNode.nodes_arr = [];
        }
        var useNodes_arr = parentNode.nodes_arr;
        var useId = node.id;
        if (useId == null || (this.allNode_map[useId] && this.allNode_map[useId] != node)) {
            useId = this.genNodeId(node.type);
        }
        if (useNodes_arr.indexOf(node) == -1) {
            useNodes_arr.push(node);
        }
        node.parent = parentNode;
        node.id = useId;
        this.allNode_map[useId] = node;
        parentNode.fireChanged(10);
    }

    addVariable(varNode) {
        var foundVar = this.vars_arr.find(item => { return item.name == varNode.name });
        if (foundVar) {
            return;
        }
        var useId = varNode.id;
        if (useId == null) {
            useId = this.genNodeId(varNode.type);
            varNode.id = useId;
        }
        varNode.bluePrint = this;
        varNode.parent = this;
        this.allNode_map[useId] = varNode;
        this.vars_arr.push(varNode);
        this.fireEvent('varChanged');
    }

    getVariableByName(varName) {
        return this.vars_arr.find(item => { return item.name == varName });
    }

    createEmptyVariable() {
        var varName;
        for (var i = 0; i < 999; ++i) {
            varName = '未命名_' + i;
            if (this.getVariableByName(varName) == null)
                break;
        }
        var rlt = new FlowDef_Variable({ name: varName, valType: ValueType.String }, this);
        rlt.needEdit = true;
        return rlt;
    }

    removeVariable(varData) {
        var index = this.vars_arr.indexOf(varData);
        if (index != -1) {
            this.vars_arr.splice(index, 1);
            varData.removed = true;
            this.fireEvent('varChanged');
            varData.emit('changed');
        }
    }

    deleteNode(node) {
        if (node.isConstNode || (node.canDelete && !node.canDelete())) {
            return;
        }
        var useId = node.id;
        if (this.allNode_map[useId]) {
            this.allNode_map[useId] = null;
            var index = node.parent.nodes_arr.indexOf(node);
            if (index != -1) {
                node.parent.nodes_arr.splice(index, 1);
            }
            node.bluePrint = null;
            node.parent = null;
            this.linkPool.clearNodeLink(node);
            this.fireChanged();
        }
    }

    deleteNodes(nodes_arr) {
        this.banEvent('changed');
        nodes_arr.forEach(node => { this.deleteNode(node) });
        this.allowEvent('changed');
        this.fireChanged();
    }

    getNodeByID(id) {
        if (id == this.id) {
            return this;
        }
        return this.allNode_map[id];
    }

    getNodesByTypes(targetTypes_arr, mustGoodNode) {
        if (targetTypes_arr == null) {
            return null;
        }
        var isArr = Array.isArray(targetTypes_arr);
        var rlt = null;
        for (var si in this.allNode_map) {
            var node = this.allNode_map[si];
            var wanted = node.type == targetTypes_arr;
            if (isArr) {
                wanted = targetTypes_arr.indexOf(node.type) != -1;
            }
            if (wanted) {
                if (mustGoodNode && !node.isReachable()) {
                    continue;
                }
                if (rlt == null) {
                    rlt = [node];
                }
                else {
                    rlt.push(null);
                }
            }
        }
        return rlt;
    }

    getSocketById(socketID) {
        var pos = socketID.indexOf('$');
        var nodeId = socketID.substr(0, pos);
        var theNode = this.getNodeByID(nodeId);
        if (theNode == null)
            return null;
        return theNode.sockets_map[socketID];
    }

    fireMoved(delay) {
        this.fireEvent('moved', delay);
    }

    fireChanged(delay) {
        this.fireEvent('changed', delay);
    }

    genNodeByJson(parentNode, nodeJson, createHelper) {
        var setting = FlowNodeClassMap[nodeJson.type];
        if (setting == null) {
            console.warn(nodeJson.type + '节点类型未找到对应class map');
            return null;
        }
        return new setting.modelClass({}, parentNode, createHelper, nodeJson);
    }

    genNodesByJsonArr(parentNode, jsonArr, createHelper) {
        var rlt_arr = [];
        if (!IsEmptyArray(jsonArr)) {
            var self = this;
            jsonArr.forEach(nodeJson => {
                var newNode = self.genNodeByJson(parentNode, nodeJson, createHelper);
                if (newNode) {
                    rlt_arr.push(newNode);
                }
            });
        }
        return rlt_arr;
    }

    getJson(jsonProf) {
        if (jsonProf == null) {
            jsonProf = new AttrJsonProfile();
        }
        var self = this;
        // save base info
        var theJson = {
            name: this.flow.name,
            flowCode: this.flow.code,
        }
        if (this.editorLeft) {
            theJson.editorLeft = this.editorLeft;
        }
        if (this.editorTop) {
            theJson.editorTop = this.editorTop;
        }
        // save var info
        var varJson_arr = [];
        this.vars_arr.forEach(varData => {
            varJson_arr.push(varData.getJson(jsonProf));
        });
        if (varJson_arr.length > 0) {
            theJson.variables_arr = varJson_arr;
        }

        if (this.nodes_arr.length > 0) {
            var nodeJson_arr = [];
            this.nodes_arr.forEach(nodeData => {
                nodeJson_arr.push(nodeData.getJson(jsonProf));
            });
            theJson.nodes_arr = nodeJson_arr;
        }
        theJson.links_arr = this.linkPool.getJson(jsonProf);
        theJson.dataMaster = this.dataMaster.getJson(jsonProf);
        theJson.useEntities_arr = jsonProf.entities_arr.map(entity => {
            return entity.code;
        });

        return theJson;
    }


    compile(compilHelper) {
        var flow = this.flow;
        if (flow == null) {
            compilHelper.logManager.error('蓝图需要关联Flow');
            return false;
        }
        if (flow.steps_arr.length == 0) {
            compilHelper.logManager.error('流程没有任何一个步骤');
            return false;
        }
        var flowJSFile = new FlowScriptFile(flow);
        compilHelper.flowFile = flowJSFile;
        var stepSwitchBlock = new JSFile_Switch('step', 'stepCode')
        flowJSFile.processFun.pushChild(stepSwitchBlock);
        // find all stepStart
        var stepNodes_arr = this.nodes_arr.filter(node => { return node.type == FLOWNODE_STEP_START; });
        var si;
        for (si in stepNodes_arr) {
            var stepNode = stepNodes_arr[si];
            var theStep = flow.steps_arr.find(step => { return step == stepNode.step; });
            if (theStep == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    stepNode.getNodeTitle(),
                    stepNode,
                    helper.clickLogBadgeItemHandler),
                    '不是有效的步骤节点']);
                continue;
            }
            var stepFun = flowJSFile.scope.getFunction('_dostep' + theStep.code, true, theStep.params_arr);
            compilHelper.compilingStep = theStep;
            compilHelper.compilingStepFun = stepFun;
            flowJSFile.initProcessFun(stepFun);
            var callFunUseParams_arr = [];
            theStep.params_arr.forEach(param => {
                callFunUseParams_arr.push('param' + (callFunUseParams_arr.length + 1));
                stepFun.headBlock.pushLine('if(' + param + ' == null){return serverhelper.createErrorRet("缺失参数[' + param + ']");}');
            });
            var caseBlock = stepSwitchBlock.getCaseBlock(theStep.code);
            caseBlock.pushLine('return ' + stepFun.name + '(' + callFunUseParams_arr.join(',') + ');');
            stepNode.compile(compilHelper, [], stepFun.bodyBlock);

            for (var vi in compilHelper.useVariables_arr) {
                var varInfo = compilHelper.useVariables_arr[vi];
                stepFun.scope.getVar(varInfo.name, true, varInfo.declareStr);
            }
        }
        flowJSFile.processFun.retBlock.pushLine('return co(function* (){return serverhelper.createErrorRet("无法处理的的步骤" + stepCode);});');
        flowJSFile.compileEnd();
        return flowJSFile;
    }
}

class FlowNode_Var_Get extends FlowNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_VAR_GET, '变量-获取', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }

        this.varData = this.bluePrint.getVariableByName(this.varName);
        if (this.varData != null) {
            this.varData.on('changed', this.varChangedHandler);
        }
        this.varChangedHandler();

        var self = this;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.varName = this.varName;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['varName']);
    }

    getNodeTitle() {
        return 'Get:' + this.varName;
    }

    varChangedHandler() {
        if (this.varData == null) {
            this.outSocket.set(
                MK_NS_Settings(this.varName + '-不存在', ValueType.Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if (this.varData.removed) {
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = ValueType.Unknown;
        }
        else {
            varLabel = this.varData.getLabel();
            valType = this.varData.getValType();
            this.varName = this.varData.name;
        }

        this.outSocket.set(
            MK_NS_Settings(varLabel, valType, null)
        );
        //this.emit('changed');
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.varData == null || this.varData.removed) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '无效变量']);
            return false;
        }
        var selfCompileRet = new CompileResult(this);
        helper.addUseVariable(this.varData.name, this.varData.valType, this.varData.getDefault());
        selfCompileRet.setSocketOut(this.outSocket, this.varData.getRealName());
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class FlowNode_Var_Set extends FlowNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_VAR_SET, '变量-设置', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.isSimpleVal = true;
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        this.varData = this.bluePrint.getVariableByName(this.varName);
        if (this.varData != null) {
            this.varData.on('changed', this.varChangedHandler);
        }
        this.varChangedHandler();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.varName = this.varName;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['varName']);
    }

    getNodeTitle() {
        return 'Set:' + this.varName;
    }

    varChangedHandler() {
        if (this.varData == null) {
            this.inSocket.set(
                MK_NS_Settings(this.varName + '-不存在', ValueType.Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if (this.varData.removed) {
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = ValueType.Unknown;
        }
        else {
            varLabel = this.varData.getLabel();
            valType = this.varData.getValType();
            this.varName = this.varData.name;
        }

        this.inSocket.set(
            MK_NS_Settings(varLabel, valType, this.inSocket.defval)
        );
        this.outSocket.set(
            MK_NS_Settings('', valType, null)
        );
        this.fireChanged();
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量', helper)) {
            return false;
        }

        var socketComRet = this.getSocketCompileValue(helper, (this.inSocket), usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;
        belongBlock.getScope().getVar(this.varData.name, true, this.varData.default);

        var myJSBlock = new FormatFileBlock(this.id);
        myJSBlock.pushLine(this.varData.name + ' = ' + socketValue + ';');
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outSocket, this.varData.name);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class FlowNode_StepStart extends FlowNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_STEP_START, '步骤开始', false, nodeJson);
        autoBind(this);
        //this.isConstNode = true;
        this.cloneable = false;

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.step == null) {
            this.step = this.bluePrint.flow.findStepByCode(this.stepCode);
        }

        if (this.step != null) {
            this.step.on('changed', this.stepChangedHandler);
            this.label = '开始[' + this.step.name + ']';
            this.stepCode = this.step.code;
            this.stepChangedHandler();
        }
    }

    canDelete() {
        return this.step == null;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.stepCode = this.stepCode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['stepCode']);
    }

    stepChangedHandler(ev) {
        var paramCount = this.step.params_arr.length;
        while (this.outputScokets_arr.length != paramCount) {
            if (this.outputScokets_arr.length > paramCount) {
                this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
            }
            else {
                this.addSocket(new NodeSocket('out' + this.outputScokets_arr.length, this, false));
            }
        }
        for (var pi in this.step.params_arr) {
            var outScoket = this.outputScokets_arr[pi];
            outScoket.type = ValueType.String;
            outScoket.label = this.step.params_arr[pi];

            outScoket.fireEvent('changed');
        }

        this.label = '开始[' + this.step.name + ']';

        this.emit('changed');
        this.emit(Event_SocketNumChanged);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outFlowSocket, '', belongBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        this.outputScokets_arr.forEach(socket => {
            selfCompileRet.setSocketOut(socket, socket.label);
        });

        if (this.checkCompileFlag(this.step == null, '无效的流程步骤', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length == 0) {
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '步骤没有后续节点']);
            belongBlock.pushLine('return serverhelper.createErrorRet("没有后续节点");');
        }
        else {
            flowLinks_arr[0].inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
        }

        return selfCompileRet;
    }
}

class FlowNode_QuerySql extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_QUERY_SQL, '查询Sql', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outDataSocket = this.outputScokets_arr[0];
            }
        }
        if (this.outDataSocket == null) {
            this.outDataSocket = new NodeSocket('outdata', this, false, { type: ValueType.Any });
            this.addSocket(this.outDataSocket);
        }
        this.outDataSocket.label = '结果';

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var project = createHelper.project;
                this.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                if (this.targetEntity) {
                    this.targetEntity.on('syned', this.entitySynedHandler);
                }
            }
            else {
                this.targetEntity = null;
            }
        }

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
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

    setEntity(entity) {
        if (typeof entity === 'string') {
            if (entity != '0') {
                entity = g_dataBase.getEntityByCode(entity);
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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.targetEntity == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '需要选择一个数据实体']);
            return false;
        }
        if (this.targetEntity.loaded == false) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '数据实体元数据尚未加载完成']);
            return false;
        }

        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);

        var params_arr = [];
        var compileRet;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var paramValue = null;
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                if (tLinks.length == 0) {
                    paramValue = IsEmptyString(theSocket.defval) ? null : theSocket.defval;
                    if (isNaN(paramValue)) {
                        paramValue = "'" + theSocket.defval + "'";
                    }
                }
                else {
                    compileRet = tLinks[0].outSocket.node.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        // child compile fail
                        return false;
                    }
                    paramValue = compileRet.getSocketOut(tLinks[0].outSocket).strContent;
                }
                if (IsEmptyString(paramValue)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                    '参数:"' + theSocket.name + '"未设置']);
                    return false;
                }
                params_arr.push({ name: theSocket.name.replace('@', ''), value: paramValue });
            }
        }

        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        var paramVarName = this.id + '_params_arr';
        myCodeBlock.pushLine(makeLine_DeclareVar(paramVarName));
        var paramListStr = '';
        if (params_arr.length > 0) {
            var paramInitBlock = new FormatFileBlock('initparam');
            paramInitBlock.pushLine(paramVarName + "=[", 1);
            params_arr.forEach(param => {
                paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.paramValue + "),");
            });
            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
            myCodeBlock.pushChild(paramInitBlock);
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
                compileRet = targetEntity.compile(bpCompileHelper);
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
                sqlInitValue = 'select * from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
            }
        }
        var sqlVarName = this.id + 'sql';
        myCodeBlock.pushLine(makeLine_DeclareVar(sqlVarName, doubleQuotesStr(sqlInitValue)));
        var rcdResultVarName = this.id + '_value';
        myCodeBlock.pushLine(makeLine_DeclareVar(rcdResultVarName));
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myCodeBlock.pushChild(tryBlock);
        if (isScalar) {
            tryBlock.bodyBlock.pushLine(rcdResultVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
        }
        else {
            var rcdRltVarName = this.id + '_rcdRlt';
            tryBlock.bodyBlock.pushLine('var ' + rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
            tryBlock.bodyBlock.pushLine(rcdResultVarName + '=' + rcdRltVarName + '.recordset;');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, rcdResultVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class FlowNode_Create_ServerError extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_CREATE_SERVERERROR, '创建错误', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.inSocket.type = ValueType.String;
        this.inSocket.inputable = true;
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
        var theSocket = this.inSocket;
        var socketValue = null;
        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        if (datalinks_arr.length == 0) {
            socketValue = theSocket.defval;
            if (IsEmptyString(socketValue)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '需要设置参数']);
                return false;
            }
            if (!isNaN(socketValue)) {
                socketValue = singleQuotesStr(socketValue);
            }
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

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'serverhelper.createErrorRet(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class FlowNode_QueryKeyRecord extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_QUERY_KEYRECORD, '查询关键记录', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.keyInSocket = this.inputScokets_arr[0];
            }
        }
        if (this.keyInSocket == null) {
            this.keyInSocket = new NodeSocket('rcdkey', this, true, { type: ValueType.Int });
            this.addSocket(this.keyInSocket);
        }
        this.keyInSocket.label = 'KEY';
        this.keyInSocket.index = -1;

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                var dataMaster = createHelper.dataMaster;
                this.targetEntity = dataMaster.getDataSourceByCode(tem_arr[1]);
                if (this.targetEntity) {
                    this.targetEntity.on('syned', this.entitySynedHandler);
                    if (this.targetEntity.isCustomDS || this.targetEntity.loaded) {
                        this.entitySynedHandler();
                    }
                }
            }
            else {
                this.targetEntity = null;
            }
        }

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
            rlt.keyColumn = this.keyColumn;
            jsonProf.useEntity(this.targetEntity);
        }
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity', 'keyColumn']);
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

            this.inputScokets_arr.forEach((item, i) => {
                item._validparam = i == 0;  // 0 是key参数
            });
            var hadChanged = false;
            entity_param_arr.forEach((param, i) => {
                var theSocket = this.getScoketByName(param.name);
                if (theSocket == null) {
                    this.addSocket(new NodeSocket(param.name, this, true, { type: SqlVarType_Scalar, label: param.name, index: i + 1 }));
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
            for (var si = 1; si < this.inputScokets_arr.length; ++si) {
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

    setEntity(entity) {
        var dataMaster = this.bluePrint.dataMaster;
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
            var kerColumn = entity.columns.find(col => {
                return col.is_identity;
            });
            console.log(kerColumn);
            if (kerColumn) {
                this.keyColumn = kerColumn.name;
            }
            else {
                this.keyColumn = '';
            }
        }
        else {
            this.keyColumn = '';
        }
        this.entitySynedHandler();
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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.targetEntity == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '需要选择一个数据实体']);
            return false;
        }
        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        if (this.checkCompileFlag(isScalar, '目标数据不能是标量值', helper)) {
            return false;
        }
        if (this.checkCompileFlag(targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
            return false;
        }
        var keyColumnItem = targetEntity.getColumnByName(this.keyColumn);
        if (this.checkCompileFlag(keyColumnItem == null, '关键字段设置错误', helper)) {
            return false;
        }
        if (!keyColumnItem.is_identity) {
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '关键字段不是identity字段']);
        }

        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);

        var params_arr = [];
        var compileRet;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var paramValue = null;
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var paramValue = socketComRet.value;
                params_arr.push({ name: theSocket.name.replace('@', ''), value: paramValue });
            }
        }
        var paramVarName = this.id + '_params_arr';
        myCodeBlock.pushLine(makeLine_DeclareVar(paramVarName));
        var paramListStr = '';
        if (params_arr.length > 0) {
            var paramInitBlock = new FormatFileBlock('initparam');
            paramInitBlock.pushLine(paramVarName + "=[", 1);
            params_arr.forEach((param, i) => {
                if (i != 0) {
                    paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
                }
                paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
            });
            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
            myCodeBlock.pushChild(paramInitBlock);
        }
        var selfCompileRet = new CompileResult(this);
        var rcdResultVarName = this.id + '_record';
        var defOutColumnBlock = new FormatFileBlock('defOut');

        var selectColumns_arr = [];
        for (var si in this.outputScokets_arr) {
            var outSocket = this.outputScokets_arr[si];
            var colName = outSocket.getExtra('colName');
            if (this.checkCompileFlag(!targetEntity.containColumn(colName), '第' + (si + 1) + '个输出接口列[' + colName + ']是非法的', helper)) {
                return false;
            }
            if (selectColumns_arr.indexOf('[' + colName + ']') == -1) {
                selectColumns_arr.push('[' + colName + ']');
            }
            defOutColumnBlock.pushLine('var ' + this.id + '_' + colName + '=' + rcdResultVarName + '.' + colName + ';');
            selfCompileRet.setSocketOut(outSocket, this.id + '_' + colName);
        }
        if (this.checkCompileFlag(selectColumns_arr.length == 0, '第没有选择任何一个输出列', helper)) {
            return false;
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
                sqlInitValue = 'select * from (' + compileRet.sql + ') as TRlt where ' + this.keyColumn + '=@' + this.inputScokets_arr[0].name;
            }
        }
        else {
            sqlInitValue = 'select ' + selectColumns_arr.join(',') + ' from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '') + ' where ' + this.keyColumn + '=@' + this.inputScokets_arr[0].name;
        }
        var sqlVarName = this.id + 'sql';
        myCodeBlock.pushLine(makeLine_DeclareVar(sqlVarName, doubleQuotesStr(sqlInitValue)));
        var rcdRltVarName = this.id + '_rcdRlt';
        myCodeBlock.pushLine(makeLine_DeclareVar(rcdRltVarName));
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet('查询[" + this.targetEntity.name + "]出错:' +  eo.message);");
        myCodeBlock.pushChild(tryBlock);
        tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
        myCodeBlock.pushLine('if(' + rcdRltVarName + '.recordset.length!=1){return serverhelper.createErrorRet("关键记录查询[' + targetEntity.name + ']的结果行数是"+' + rcdRltVarName + '.recordset.length);}');
        myCodeBlock.pushLine('var ' + rcdResultVarName + '=' + rcdRltVarName + '.recordset[0];');
        myCodeBlock.pushChild(defOutColumnBlock);

        selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class FlowNode_ColumnVar extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_COLUMN_VAR, '列变量', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = ValueType.String;
        this.outSocket.inputable = false;
        this.headType = 'empty';

        var self = this;
        setTimeout(() => {
            self.freshLabel();
        }, 50);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.keySocketID = this.keySocketID;
        rlt.label = this.label;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity', 'keySocketID']);
    }

    getKeySocket(){
        return this.keySocketID == null ? null : this.bluePrint.getSocketById(this.keySocketID);
    }

    freshLabel() {
        var keySocket = this.keySocketID == null ? null : this.bluePrint.getSocketById(this.keySocketID);
        var columnName = '';
        var project = null;
        if(this.bluePrint.master){
            project = this.bluePrint.master.project;
        }
        if (keySocket != null) {
            if(keySocket.type == SocketType_CtlKernel){
                var ctlid = keySocket.getExtra('ctlid');
                if (project == null) {
                    columnName = '找不到project';
                }
                else{
                    var ctlkernel = project.getControlById(ctlid);
                    if(ctlkernel){
                        this.outSocket.type = SocketType_CtlKernel;
                        this.outSocket.kernelType = ctlkernel.type;
                        var formkernel = ctlkernel.searchParentKernel(M_FormKernel_Type, true);
                        columnName = (formkernel ? formkernel.getReadableName() + '.' : '') + ctlkernel.getReadableName()
                    }
                    else{
                        columnName = '找不到控件';
                    }
                }
            }
            else{
                if (keySocket.getExtra('colName') == null) {
                    columnName = keySocket.label;
                }
                else {
                    columnName = keySocket.getExtra('colName');
                }
            }
        }
        this.keySocket = keySocket;
        this.columnName = !keySocket ? '丢失' : keySocket.getExtra('colName');
        this.outSocket.label = !keySocket ? '丢失节点' : keySocket.node.id + columnName;
        this.outSocket.fireEvent('changed');
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        this.keySocket.node.getUseClientVariable(helper, srcNode, belongFun, this.keySocket, result);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        this.freshLabel();
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();

        if (this.checkCompileFlag(this.keySocket == null || this.keySocket.node == null, '关联节点无效', helper)) {
            return false;
        }
        var relNode = this.keySocket.node;
        var realSocket = relNode.getSocketById(this.keySocket.id);
        if (this.checkCompileFlag(realSocket == null, '关联对象没有此列输出', helper)) {
            return false;
        }

        var relNodeComRet = helper.getCompileRetCache(relNode);
        if (relNodeComRet == null) {
            if (this.checkCompileFlag(relNode.inFlowSocket, '不能早于关联的节点被访问到', helper)) {
                return false;
            }
            relNodeComRet = relNode.compile(helper, preNodes_arr);
        }

        var socketComRet = relNodeComRet.getSocketOut(realSocket);
        if (this.checkCompileFlag(socketComRet == null, '不能找到关联接口的编译结果', helper)) {
            return false;
        }
        var value = socketComRet.strContent;
        /*
        var theColumn = null;
        if (this.keySocket.node.targetEntity != null) {
            theColumn = this.keySocket.node.targetEntity.getColumnByName(this.columnName);
        }
        if (this.checkCompileFlag(theColumn == null, '关联的列名是无效的', helper)) {
            return false;
        }
        var value = this.keySocket.node.id + '_' + this.columnName;

        if (relNode.formKernel && helper.getCache(this.keySocket.node.id + '_clientForEachBlock') == null) {
            value = relNode.formKernel.id + '_' + VarNames.NowRecord + '.' + this.columnName;
        }
        */

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class FlowNode_Send_Message extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_SEND_MESSAGE, '发送通知', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'sendType':
                        this.sendTypeScoket = socket;
                        break;
                    case 'targetType':
                        this.targetTypeScoket = socket;
                        break;
                    case 'targetPerson':
                        this.targetPersonScoket = socket;
                        break;
                    case 'personEduct':
                        this.personEductScoket = socket;
                        break;
                    case 'targetPost':
                        this.targetPostScoket = socket;
                        break;
                    case 'encrypted':
                        this.encrytedScoket = socket;
                        break;
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'content':
                        this.contentScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'msgType':
                        this.msgTypeScoket = socket;
                        break;
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }

        if (this.targetTypeScoket == null) {
            this.targetTypeScoket = new NodeSocket('targetType', this, true, { defval: EMessageTargetType.Person });
            this.addSocket(this.targetTypeScoket);
        }
        this.targetTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageTargetTypes_arr,
            },
            hideIcon: true,
        });
        this.targetTypeScoket.on('changed', this.targetTypeChanged);

        if (this.encrytedScoket == null) {
            this.encrytedScoket = new NodeSocket('encrypted', this, true);
            this.addSocket(this.encrytedScoket);
        }
        this.encrytedScoket.set({
            label: '是否加密',
            hideIcon: true,
            inputable: true,
            type: ValueType.Boolean
        });

        if (this.targetPersonScoket == null) {
            this.targetPersonScoket = new NodeSocket('targetPerson', this, true);
            this.addSocket(this.targetPersonScoket);
        }
        this.targetPersonScoket.label = '目标人员';

        if (this.personEductScoket == null) {
            this.personEductScoket = new NodeSocket('personEduct', this, true, { defval: 0 });
            this.addSocket(this.personEductScoket);
        }
        this.personEductScoket.set({
            label: '人员推算',
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: PersonEductOptions_arr,
            },
            hideIcon: true,
        });

        if (this.targetPostScoket == null) {
            this.targetPostScoket = new NodeSocket('targetPost', this, true);
            this.addSocket(this.targetPostScoket);
        }
        this.targetPostScoket.set({
            label: '目标岗位',
            inputable: true,
            inputDDC_setting: {
                textAttrName: '所属岗位名称',
                valueAttrName: '所属岗位名称代码',
                options_arr: AllPosts_arr,
            },
            hideIcon: true,
        });

        if (this.sendTypeScoket == null) {
            this.sendTypeScoket = new NodeSocket('sendType', this, true, { defval: EMessageSendType.Normal });
            this.addSocket(this.sendTypeScoket);
        }
        this.sendTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageSendTypes_arr,
            },
            hideIcon: true,
        });

        if (this.msgTypeScoket == null) {
            this.msgTypeScoket = new NodeSocket('msgType', this, true, { defval: EMessageType.Normal });
            this.addSocket(this.msgTypeScoket);
        }
        this.msgTypeScoket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'text',
                valueAttrName: 'value',
                options_arr: MessageTypes_arr,
            },
            hideIcon: true,
        });
        this.msgTypeScoket.on('changed', this.msgTypeChanged);

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


        if (this.titleScoket == null) {
            this.titleScoket = new NodeSocket('title', this, true, { type: ValueType.String, inputable: true });
            this.addSocket(this.titleScoket);
        }
        this.titleScoket.label = '标题';
        if (this.contentScoket == null) {
            this.contentScoket = new NodeSocket('content', this, true, { type: ValueType.String, inputable: true });
            this.addSocket(this.contentScoket);
        }
        this.contentScoket.label = '内容';

        this.targetTypeChanged();
        this.msgTypeChanged();

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.inFlowSockets_arr == null) {
            this.inFlowSockets_arr = [];
        }
        else {
            this.inFlowSockets_arr.forEach(socket => {
                socket.label = 'cardItem';
            });
        }
    }

    genInputFlowSocket() {
        var nameI = this.inFlowSockets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('carflow' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        var newSocket = new NodeFlowSocket('carflow' + nameI, this, true);
        newSocket.label = 'cardItem';
        return newSocket;
    }

    msgTypeChanged(ev) {
        //console.log('msgTypeChanged' + ev);
        var isPorcess = this.msgTypeScoket.defval == EMessageType.Process;
        this.flowStepScoket.set({
            visible: isPorcess
        });
        this.projectScoket.set({
            visible: isPorcess
        });
        this.intdataScoket.set({
            visible: isPorcess
        });
    }

    targetTypeChanged(ev) {
        //console.log('targetTypeChanged' + ev);
        var targetIsPerson = this.targetTypeScoket.defval == EMessageTargetType.Person;
        var targetIsPost = this.targetTypeScoket.defval == EMessageTargetType.Post;
        if (!targetIsPerson) {
            this.bluePrint.linkPool.clearSocketLink(this.targetPersonScoket);
        }
        this.targetPersonScoket.set({
            visible: targetIsPerson
        });
        this.personEductScoket.set({
            visible: targetIsPerson
        });
        this.targetPostScoket.set({
            visible: targetIsPost
        });
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, []);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var theFlowStep = preNodes_arr[0].step;
        var sendType = this.sendTypeScoket.defval;
        var targetType = this.targetTypeScoket.defval;
        var personEduct = this.personEductScoket.defval;
        var targetPost = this.targetPostScoket.defval;
        var encrypted = this.encrytedScoket.defval;
        var flowStep = this.flowStepScoket.defval;
        var msgType = this.msgTypeScoket.defval;
        var project = this.projectScoket.defval;

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        var targetPerson = null;
        var socketComRet = null;
        var intDataValue = null;

        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);

        var params_arr = [{ name: '操作人ID', value: 0 },
        { name: '发送人ID', value: 0 },
        { name: '来源流程步骤代码', value: theFlowStep.code },
        { name: '加密内容', value: (encrypted == true ? 1 : 0) },];

        var personVarName = this.id + '_接收人描述';
        params_arr.push({ name: '接收人描述', value: personVarName });
        if (targetType == EMessageTargetType.Person) {
            socketComRet = this.getSocketCompileValue(helper, this.targetPersonScoket, usePreNodes_arr, belongBlock, true, false);
            if (socketComRet.err) {
                return false;
            }
            targetPerson = socketComRet.value;
            if (!isNaN(personEduct) && personEduct != 0) {
                // 有推算
                myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'CP:' + " + targetPerson + " + ' " + personEduct + "'"));
            }
            else {
                myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'SP:' + " + targetPerson));
            }
        }
        else if (targetType == EMessageTargetType.Post) {
            if (this.checkCompileFlag(IsEmptyString(targetPost) || targetPost == 0, '需要选择目标岗位', helper)) {
                return false;
            }
            myCodeBlock.pushLine(makeLine_DeclareVar(personVarName, "'CP:0 " + personEduct + "'"));
        }
        if (this.checkCompileFlag(IsEmptyString(sendType), '需要选择发送方式', helper)) {
            return false;
        }
        params_arr.push({ name: '通知发送方式代码', value: sendType });
        if (this.checkCompileFlag(IsEmptyString(msgType), '需要选择消息类型', helper)) {
            return false;
        }
        params_arr.push({ name: '工作通知种类代码', value: msgType });
        if (msgType == EMessageType.Process) {
            // 处置通知 
            if (this.checkCompileFlag(IsEmptyString(flowStep), '需要关联流程步骤', helper)) {
                return false;
            }
            if (this.checkCompileFlag(IsEmptyString(project), '需要关联方案', helper)) {
                return false;
            }
            socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, false);
            if (socketComRet.err) {
                return false;
            }
            intDataValue = socketComRet.value;
            params_arr.push({ name: '关联方案代码', value: project });
            params_arr.push({ name: '关联步骤代码', value: flowStep });
            params_arr.push({ name: '关联步骤数据', value: intDataValue });
        }

        var cardItemInitBlock = new FormatFileBlock('init carditem');
        cardItemInitBlock.scope = belongBlock.getScope();

        var socketI;
        var cardFlowSocket;
        var cardItemNode;
        for (socketI = 0; socketI < this.inFlowSockets_arr.length; ++socketI) {
            cardFlowSocket = this.inFlowSockets_arr[socketI];
            var links_arr = this.bluePrint.linkPool.getLinksBySocket(cardFlowSocket);
            if (links_arr.length == 0) {
                continue;
            }
            cardItemNode = links_arr[0].outSocket.node;
            if (this.checkCompileFlag(cardItemNode.type != FLOWNODE_MESSAGE_CARDITEM, '输入只能链接通知-CardItem节点', helper)) {
                return false;
            }
            if (cardItemNode.compile(helper, usePreNodes_arr, cardItemInitBlock) == false) {
                return false;
            }
        }
        if (cardItemInitBlock.childs_arr.length > 0) {
            var cardItemVarName = this.id + '_cardItems_arr';
            myCodeBlock.pushLine(makeLine_DeclareVar(cardItemVarName, "[]", false));
            myCodeBlock.pushChild(cardItemInitBlock);
            params_arr.push({ name: 'carditem', value: cardItemVarName + ".join('|')" });
        }

        socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) { return false; }
        var titleValue = socketComRet.value == null ? singleQuotesStr('来自[' + this.bluePrint.flow.name + ']流程的通知') : socketComRet.value;
        var titleVarName = this.id + '_title';
        myCodeBlock.pushLine(makeLine_DeclareVar(titleVarName, titleValue, false));
        params_arr.push({ name: '通知标题', value: titleVarName });

        socketComRet = this.getSocketCompileValue(helper, this.contentScoket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) { return false; }
        var contentValue = socketComRet.value;
        var copntentVarName = this.id + '_content';
        myCodeBlock.pushLine(makeLine_DeclareVar(copntentVarName, contentValue, false));
        params_arr.push({ name: '通知内容', value: copntentVarName });

        var paramVarName = this.id + 'params_arr';
        myCodeBlock.pushLine('var ' + paramVarName + '=[', 1);
        params_arr.forEach(param => {
            myCodeBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
        });
        myCodeBlock.subNextIndent();
        myCodeBlock.pushLine('];');

        var retVarName = this.id + 'ret';
        myCodeBlock.pushLine(makeLine_DeclareVar(retVarName, null));
        var tryBlock = new JSFile_Try('try');
        myCodeBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(retVarName + " = yield dbhelper.asynExcute('P000E发送工作通知'," + paramVarName + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock)
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myCodeBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class FlowNode_Message_CardItem extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_MESSAGE_CARDITEM, '通知CardItem', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
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


        if (this.titleScoket == null) {
            this.titleScoket = new NodeSocket('title', this, true, { type: ValueType.String, inputable: true });
            this.addSocket(this.titleScoket);
        }
        this.titleScoket.label = '标题';

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, []);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var sendMsgNode = preNodes_arr[preNodes_arr.length - 1];
        var flowStep = this.flowStepScoket.defval;
        var project = this.projectScoket.defval;

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = null;
        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);
        var cardItemVarName = sendMsgNode.id + '_cardItems_arr';


        // 处置通知 
        if (this.checkCompileFlag(IsEmptyString(flowStep), '需要关联流程步骤', helper)) {
            return false;
        }
        if (this.checkCompileFlag(IsEmptyString(project), '需要关联方案', helper)) {
            return false;
        }
        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var intDataValue = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) { return false; }
        var titleValue = socketComRet.value;

        var strVarName = this.id + '_str';
        myCodeBlock.pushLine(makeLine_DeclareVar(strVarName, project + " + ','", false));
        myCodeBlock.pushLine(strVarName + "+=" + flowStep + " + ',';");
        myCodeBlock.pushLine(strVarName + "+=" + intDataValue + " + ',';");
        myCodeBlock.pushLine(strVarName + "+=" + titleValue + ";");
        myCodeBlock.pushLine(cardItemVarName + ".push(" + strVarName + ".replace(/\\|/g,''));");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outFlowSocket, '', myCodeBlock)
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

class FlowNode_Confirm_Flowstep extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_CONFIRM_FLOWSTEP, '签阅处置通知', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'flowStepdata':
                        this.flowStepDataScoket = socket;
                        break;
                    case 'operator':
                        this.operatorScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.inputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
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

        if (this.flowStepDataScoket == null) {
            this.flowStepDataScoket = new NodeSocket('flowStepdata', this, true);
            this.addSocket(this.flowStepDataScoket);
        }
        this.flowStepDataScoket.set({
            type: ValueType.Int,
            label: '关联数据',
        });

        if (this.operatorScoket == null) {
            this.operatorScoket = new NodeSocket('operator', this, true);
            this.addSocket(this.operatorScoket);
        }
        this.operatorScoket.label = '操作人员';

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var theFlowStep = preNodes_arr[0].step;

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        var flowStepCode = this.flowStepScoket.defval;
        if (this.checkCompileFlag(IsEmptyString(flowStepCode), '需要关联流程步骤', helper)) {
            return false;
        }
        var socketComRet = this.getSocketCompileValue(helper, this.flowStepDataScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var flowStepData = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.operatorScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var oprator = socketComRet.value;

        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);

        var params_arr = [{ name: '关联步骤代码', value: flowStepCode },
        { name: '关联步骤数据', value: flowStepData },
        { name: '操作确认用户', value: oprator },];

        var paramVarName = this.id + 'params_arr';
        myCodeBlock.pushLine('var ' + paramVarName + '=[', 1);
        params_arr.forEach(param => {
            myCodeBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.Int, " + param.value + "),");
        });
        myCodeBlock.subNextIndent();
        myCodeBlock.pushLine('];');

        var retVarName = this.id + 'ret';
        myCodeBlock.pushLine(makeLine_DeclareVar(retVarName, null));
        var tryBlock = new JSFile_Try('try');
        myCodeBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(retVarName + " = yield dbhelper.asynExcute('P196E流程审批确认'," + paramVarName + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myCodeBlock)
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myCodeBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}
class FlowNode_NowDate extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_NOWDATE, 'Now_Date', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var value = "new Date()";
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class FlowNode_EXAM extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, FLOWNODE_EXAM, '考核', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'targetID':
                        this.targetIDScoket = socket;
                        break;
                    case 'examType':
                        this.examTypeScoket = socket;
                        break;
                    case 'reason':
                        this.reasonScoket = socket;
                        break;
                    case 'processDate':
                        this.processDateScoket = socket;
                        break;
                    case 'processDate':
                        this.processDateScoket = socket;
                        break;
                    case 'processDate':
                        this.processDateScoket = socket;
                        break;
                    case 'processDate':
                        this.processDateScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
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


        if (this.titleScoket == null) {
            this.titleScoket = new NodeSocket('title', this, true, { type: ValueType.String, inputable: true });
            this.addSocket(this.titleScoket);
        }
        this.titleScoket.label = '标题';

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, []);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var sendMsgNode = preNodes_arr[preNodes_arr.length - 1];
        var flowStep = this.flowStepScoket.defval;
        var project = this.projectScoket.defval;

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = null;
        var myCodeBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myCodeBlock);
        var cardItemVarName = sendMsgNode.id + '_cardItems_arr';


        // 处置通知 
        if (this.checkCompileFlag(IsEmptyString(flowStep), '需要关联流程步骤', helper)) {
            return false;
        }
        if (this.checkCompileFlag(IsEmptyString(project), '需要关联方案', helper)) {
            return false;
        }
        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) {
            return false;
        }
        var intDataValue = socketComRet.value;

        socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, belongBlock, true, false);
        if (socketComRet.err) { return false; }
        var titleValue = socketComRet.value;

        var strVarName = this.id + '_str';
        myCodeBlock.pushLine(makeLine_DeclareVar(strVarName, project + " + ','", false));
        myCodeBlock.pushLine(strVarName + "+=" + flowStep + " + ',';");
        myCodeBlock.pushLine(strVarName + "+=" + intDataValue + " + ',';");
        myCodeBlock.pushLine(strVarName + "+=" + titleValue + ";");
        myCodeBlock.pushLine(cardItemVarName + ".push(" + strVarName + ".replace(/\\|/g,''));");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outFlowSocket, '', myCodeBlock)
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

FlowNodeClassMap[FLOWNODE_VAR_GET] = {
    modelClass: FlowNode_Var_Get,
    comClass: C_FlowNodeDef_Var_Get,
};
FlowNodeClassMap[FLOWNODE_VAR_SET] = {
    modelClass: FlowNode_Var_Set,
    comClass: C_FlowNodeDef_Var_Set,
};
FlowNodeClassMap[FLOWNODE_STEP_START] = {
    modelClass: FlowNode_StepStart,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[FLOWNODE_QUERY_KEYRECORD] = {
    modelClass: FlowNode_QueryKeyRecord,
    comClass: C_FlowNode_QueryKeyRecord,
};
FlowNodeClassMap[JSNODE_QUERY_SQL] = {
    modelClass: JSNode_Query_Sql,
    comClass: C_JSNode_Query_Sql,
};
FlowNodeClassMap[FLOWNODE_CREATE_SERVERERROR] = {
    modelClass: FlowNode_Create_ServerError,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[FLOWNODE_COLUMN_VAR] = {
    modelClass: FlowNode_ColumnVar,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[FLOWNODE_SEND_MESSAGE] = {
    modelClass: FlowNode_Send_Message,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[FLOWNODE_CONFIRM_FLOWSTEP] = {
    modelClass: FlowNode_Confirm_Flowstep,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[FLOWNODE_MESSAGE_CARDITEM] = {
    modelClass: FlowNode_Message_CardItem,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_ARRAY_LENGTH] = {
    modelClass: JSNode_Array_Length,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ISEMPTYARRAY] = {
    modelClass: JSNode_IsEmptyArray,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_NEW] = {
    modelClass: JSNode_Array_New,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_CONSTVALUE] = {
    modelClass: JSNode_ConstValue,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_RETURN] = {
    modelClass: JSNode_Return,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_NOPERAND] = {
    modelClass: JSNode_NOperand,
    comClass: C_SqlNode_NOperand,
};
FlowNodeClassMap[JSNODE_COMPARE] = {
    modelClass: JSNode_Compare,
    comClass: C_SqlNode_Compare,
};
FlowNodeClassMap[JSNODE_IF] = {
    modelClass: JSNode_IF,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_SWITCH] = {
    modelClass: JSNode_Switch,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_BREAK] = {
    modelClass: JSNode_Break,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_SEQUENCE] = {
    modelClass: JSNode_Sequence,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_BOOLEANVALUE] = {
    modelClass: JSNode_BooleanValue,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_LOGICAL_OPERATOR] = {
    modelClass: JSNode_Logical_Operator,
    comClass: C_JSNode_Logical_Operator,
};
FlowNodeClassMap[JSNODE_DATEFUN] = {
    modelClass: JSNode_DateFun,
    comClass: C_JSNode_DateFun,
};
FlowNodeClassMap[JSNODE_TERNARY_OPERATOR] = {
    modelClass: JSNode_Ternary_Operator,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_INSERT_TABLE] = {
    modelClass: JSNODE_Insert_table,
    comClass: C_JSNODE_Insert_table,
};
FlowNodeClassMap[JSNODE_UPDATE_TABLE] = {
    modelClass: JSNODE_Update_table,
    comClass: C_JSNODE_Insert_table,
};

// 扩展jsnode
JSNodeClassMap[FLOWNODE_COLUMN_VAR] = {
    modelClass: FlowNode_ColumnVar,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[FLOWNODE_NOWDATE] = {
    modelClass: FlowNode_NowDate,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_EXCUTE_PRO] = {
    modelClass: JSNode_Excute_Pro,
    comClass: C_JSNode_Excute_Pro,
};
FlowNodeClassMap[JSNODE_DO_FLOWSTEP] = {
    modelClass: JSNode_Do_FlowStep,
    comClass: C_JSNODE_Do_FlowStep,
};
FlowNodeClassMap[JSNODE_STRING_LENGTH] = {
    modelClass: JSNode_String_Length,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_STRING_SUBSTRING] = {
    modelClass: JSNode_String_Substring,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_STRING_SUBSTR] = {
    modelClass: JSNode_String_Substr,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_STRING_INDEXOF] = {
    modelClass: JSNode_String_IndexOf,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_PARSEINT] = {
    modelClass: JSNode_ParseInt,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_PARSEFLOAT] = {
    modelClass: JSNode_ParseFloat,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ISNAN] = {
    modelClass: JSNode_IsNaN,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ASSIGNMENT_OPERATOR] = {
    modelClass: JSNode_Assignment_Operator,
    comClass: C_JSNode_Assignment_Operator,
};

FlowNodeClassMap[JSNODE_AI_SENDMESSAGE] = {
    modelClass: JsNode_AI_SendMessage,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_TEXT] = {
    modelClass: JSNode_Message_Text,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_LINK] = {
    modelClass: JSNode_Message_Link,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_SINGLEACTIONCARD] = {
    modelClass: JSNode_Message_SingleActionCard,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_ACTIONCARD] = {
    modelClass: JSNode_Message_ActionCard,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_ACTIONCARDITEM] = {
    modelClass: JSNode_Message_ActionCardItem,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_MESSAGE_MARKDOWN] = {
    modelClass: JSNode_Message_MarkDown,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_STRING_SPLIT] = {
    modelClass: JSNode_String_Split,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_ARRAY_FOR] = {
    modelClass: JSNode_Array_For,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_ARRAY_CONCAT] = {
    modelClass: JSNode_Array_Concat,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_PUSH] = {
    modelClass: JSNode_Array_Push,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_POP] = {
    modelClass: JSNode_Array_Pop,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_GET] = {
    modelClass: JSNode_Array_Get,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_ARRAY_JOIN] = {
    modelClass: JSNode_Array_Join,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_SLICE] = {
    modelClass: JSNode_Array_Slice,
    comClass: C_Node_SimpleNode,
};

FlowNodeClassMap[JSNODE_ARRAY_SHIFT] = {
    modelClass: JSNode_Array_Shift,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_UNSHIFT] = {
    modelClass: JSNode_Array_Unshift,
    comClass: C_Node_SimpleNode,
};
FlowNodeClassMap[JSNODE_ARRAY_REVERSE] = {
    modelClass: JSNode_Array_Reverse,
    comClass: C_Node_SimpleNode,
};