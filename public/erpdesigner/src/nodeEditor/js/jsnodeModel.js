const JSNODE_VAR_GET = 'var_get';
const JSNODE_VAR_SET = 'var_set';
const JSNODE_START = 'start';
const JSNODE_RETURN = 'return';
const JSNODE_CONSTVALUE = 'constvalue';
const JSNODE_NOPERAND = 'noperand';
const JSNODE_COMPARE = 'compare';
const JSNODE_IF = 'jsif';
const JSNODE_SWITCH = 'jsswitch';
const JSNODE_BREAK = 'jsbreak';
const JSNODE_SEQUENCE = 'sequence';
const JSNODE_CURRENTDATAROW = 'currentdatarow';
const JSNODE_CTLKERNEL = 'ctlkernel';
const JSNODE_INSERT_TABLE = 'insert_table';
const JSNODE_CONTROL_API_PROP = 'controlapiprop';
const JSNODE_CONTROL_API_PROPSETTER = 'controlapipropsetter';
const JSNODE_DATEFUN = 'jsdatefun';

const JSDEF_VAR = 'def_variable';

var JSNodeClassMap = {};

class JSNode_Base extends Node_Base {
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
}

class JSDef_Variable extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSDEF_VAR, '变量', false, nodeJson);

        this.name = ReplaceIfNull(this.name, 'unname');
        this.valType = ReplaceIfNull(this.valType, ValueType.Int);
        this.default = ReplaceIfNull(this.default, '');
        this.isParam = ReplaceIfNaN(this.isParam, 0);
        autoBind(this);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.name = this.name;
        rlt.valType = this.valType;
        rlt.isParam = this.isParam;
        rlt.default = this.default;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['name', 'valType', 'isParam', 'default']);
    }

    setProp(data) {
        if (data.name != null) {
            var newName = data.name;
            if (newName.length == 0) {
                newName = '未命名';
            }
            if (this.bluePrint) {
                if (this.bluePrint.getVariableByName(newName) != this) {
                    newName += '_1';
                }
            }
            this.name = newName;
        }
        if (data.valType != null) {
            this.valType = data.valType;
        }
        if (data.isParam != null) {
            this.isParam = data.isParam == '参数';
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
        var defaultvar = IsEmptyString(this.default) ? 'null' : (isNaN(this.default) ? singleQuotesStr(this.default) : this.default);
        return 'var ' + this.name + ' ' + defaultvar + ';';
    }
}


class JSNode_BluePrint extends EventEmitter {
    constructor(initData, bluePrintJson, createHelper) {
        super();
        EnhanceEventEmiter(this);

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

        if (bluePrintJson != null) {
            assginObjByProperties(this, bluePrintJson, ['type', 'code', 'name', 'startNodeId', 'editorLeft', 'editorTop', 'group', 'ctlID']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(varJson => {
                    var newVar = new JSDef_Variable({}, this, createHelper, varJson);
                });
            }
            var newChildNodes_arr = this.genNodesByJsonArr(this, bluePrintJson.nodes_arr, createHelper);
            this.startNode = newChildNodes_arr.find(node => {
                return node.id == bluePrintJson.startNodeId;
            });
            if (this.startNode == null) {
                this.startNode = new JSNode_Start({}, this, createHelper);
            }
            this.linkPool.restorFromJson(bluePrintJson.links_arr, createHelper);
        }
        if (this.type == null) {
            console.error('new JSNode_BluePrint type is null');
        }
        this.id = this.code;
        if (this.group == null) {
            console.error('new JSNode_BluePrint group is null');
            this.group = 'custom';
        }

        if (this.startNode == null) {
            this.startNode = new JSNode_Start({}, this);
        }
        else {
            this.startNode.isConstNode = true;
        }
        createHelper.fireEvent('complete', createHelper);

        //var newVar = this.createEmptyVariable();
        //newVar.setProp({editing:false});
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
        var rlt = new JSDef_Variable({ name: varName, valType: ValueType.String }, this);
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
        if (node.isConstNode) {
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

    getSocketById(socketID) {
        var pos = socketID.indexOf('$');
        var nodeId = socketID.substr(0, pos);
        var theNode = getNodeByID(nodeId);
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
        var setting = JSNodeClassMap[nodeJson.type];
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

    getJson() {
        var self = this;
        // save base info
        var theJson = {
            code: self.id,
            startNodeId: this.startNode.id,
            name: this.name,
            type: this.type,
            group: this.group,
        }
        if (this.ctlID) {
            theJson.ctlID = this.ctlID;
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
            varJson_arr.push(varData.getJson());
        });
        if (varJson_arr.length > 0) {
            theJson.variables_arr = varJson_arr;
        }

        if (this.nodes_arr.length > 0) {
            var nodeJson_arr = [];
            this.nodes_arr.forEach(nodeData => {
                nodeJson_arr.push(nodeData.getJson());
            });
            theJson.nodes_arr = nodeJson_arr;
        }
        theJson.links_arr = this.linkPool.getJson();

        return theJson;
    }

    compile(compilHelper) {
        if (this.group == FunGroup.CtlAttr || this.group == FunGroup.CtlEvent) {
            var ctlKernel = this.master.project.getControlById(this.ctlID);
            if (ctlKernel == null) {
                compilHelper.logManager.error('蓝图关联控件' + this.ctlID + '无法找到');
                return false;
            }
            this.ctlKernel = ctlKernel;
        }
        var theFun = compilHelper.scope.getFunction(this.name, true);
        var params_arr = [];
        this.vars_arr.forEach(varData => {
            if (varData.isParam) {
                params_arr.push(varData.name);
            }
            else {
                theFun.scope.getVar(varData.name, true, varData.default);
            }
        });
        if (params_arr.length > 0) {
            if (this.group == FunGroup.CtlAttr) {
                compilHelper.logManager.error('本蓝图种类不允许出现参数');
                return false;
            }
        }
        var ret = this.startNode.compile(compilHelper, [], theFun.bodyBlock);
        if (ret == false) {
            return false;
        }
        var initValue;
        var varName;
        var usectlid;
        var useCtlData;
        var propName;
        var propApiitem;
        if (this.group == FunGroup.CtlAttr || this.group == FunGroup.CtlEvent) {
            if(this.group == FunGroup.CtlAttr)
            {
                params_arr = [VarNames.State, VarNames.Bundle];
            }
            for (var formId in compilHelper.useForm_map) {
                var useFormData = compilHelper.useForm_map[formId];
                var formStateVarName = null;
                if (!IsEmptyObject(useFormData.useControls_map)) {
                    formStateVarName = formId + '_state';
                    initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()));
                    theFun.scope.getVar(formStateVarName, true, initValue);

                    for (usectlid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[usectlid];
                        for (var propName in useCtlData.useprops_map) {
                            var propApiitem = useCtlData.useprops_map[propName];
                            varName = usectlid + '_' + propApiitem.stateName;
                            initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                            theFun.scope.getVar(varName, true, initValue);
                        }
                    }
                }
                if (!IsEmptyObject(useFormData.useColumns_map)) {
                    var nowRecordVarName = formId + '_nowrecord' + '';
                    initValue = 'bundle != null && bundle.' + nowRecordVarName + ' != null ? bundle.' + nowRecordVarName + ' : ' + makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)));
                    theFun.scope.getVar(nowRecordVarName, true, initValue);
                }
            }
            for (usectlid in compilHelper.useGlobalControls_map) {
                useCtlData = compilHelper.useGlobalControls_map[usectlid];
                for (propName in useCtlData.useprops_map) {
                    propApiitem = useCtlData.useprops_map[propName];
                    varName = usectlid + '_' + propApiitem.stateName;
                    if(this.group == FunGroup.CtlAttr ){
                        initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                    }
                    else{
                        initValue = makeStr_getStateByPath('store.getState()', singleQuotesStr(useCtlData.kernel.getStatePath(propApiitem.stateName)));
                    }
                    theFun.scope.getVar(varName, true, initValue);
                }
            }
        }
        theFun.params_arr = params_arr;
        theFun.useForm_map = compilHelper.useForm_map;
        return theFun;
    }
}

class JSNode_Var_Get extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_VAR_GET, '变量-获取', false, nodeJson);
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
        helper.addUseVariable(this.varData.name, this.varData.valType, this.varData.getDefineString());
        selfCompileRet.setSocketOut(this.outSocket, this.varData.getRealName());
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Var_Set extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_VAR_SET, '变量-设置', false, nodeJson);
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
        var socketValue = '';

        if (this.varData == null || this.varData.removed) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '无效变量']);
            return false;
        }

        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
        if (datalinks_arr.length == 0) {
            if (IsEmptyString(this.inSocket.defval)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '必须有输入值']);
                return false;
            }
            socketValue = this.inSocket.defval;
            if (isNaN(socketValue)) {
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

class JSNode_Start extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_START, 'START', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

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
        var usePreNodes_arr = preNodes_arr.concat(this);
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length == 0) {
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                this.bluePrint.name,
                this.bluePrint,
                helper.clickLogBadgeItemHandler),
                '是个空蓝图']);
        }
        else {
            flowLinks_arr[0].inSocket.node.compile(helper, usePreNodes_arr, belongBlock);
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outFlowSocket, '', belongBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

class JSNode_Return extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_RETURN, 'RETURN', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
        }
        this.inSocket.inputable = true;
        this.inSocket.type = ValueType.Any;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
        var socketValue = 'null';
        if (datalinks_arr.length == 0) {
            if (!IsEmptyString(this.inSocket.defval)) {
                socketValue = this.inSocket.defval;
                if (isNaN(socketValue)) {
                    socketValue = singleQuotesStr(socketValue);
                }
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
                compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
            }
            if (compileRet == false) {
                return false;
            }
            socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
        }
        var setLine = new FormatFile_Line('return ' + socketValue + ';');
        belongBlock.pushChild(setLine);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', setLine);
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

class JSNode_ConstValue extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CONSTVALUE, '常量', false, nodeJson);
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
        this.outSocket.inputable = true;
        this.headType = 'empty';
    }

    getValue() {
        return this.outSocket.defval;
    }

    getValueType() {
        return this.outSocket.type;
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var value = this.getValue();
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (IsEmptyString(value)) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '无效值']);
            return false;
        }
        if (isNaN(value)) {
            value = "'" + value + "'";
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_NOperand extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_NOPERAND, '四则运算', false, nodeJson);
        autoBind(this);

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
        this.outSocket.isSimpleVal = false;
        this.insocketInitVal = {
            type: ValueType.String,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(this.genInSocket());
            this.addSocket(this.genInSocket());
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            });
        }
        if (this.operator == null) {
            this.operator = '+';
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

    genInSocket() {
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
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
        var allNumberic = true;
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (IsEmptyString(theSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval;
                if (isNaN(tValue)) {
                    allNumberic = false;
                    tValue = singleQuotesStr(tValue);
                }
            }
            else {
                var dataLink = tLinks[0];
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
                    compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
                }
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
                if (!dataLink.outSocket.isSimpleVal) {
                    tValue = '(' + tValue + ')';
                }
            }
            socketVal_arr.push(tValue);
        }
        if (!allNumberic) {
            // 不是所有的输入都是数值类型，把是数值类型的值转为字符值
            for (var si in socketVal_arr) {
                if (!isNaN(socketVal_arr[si])) {
                    socketVal_arr[si] = singleQuotesStr(socketVal_arr[si]);
                }
            }
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : nodeThis.operator) + x;
        });
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Compare extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_COMPARE, '比较', false, nodeJson);
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
            this.addSocket(new NodeSocket('in0', this, true, { type: ValueType.String }));
            this.addSocket(new NodeSocket('in1', this, true, { type: ValueType.String }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.operator == null) {
            this.operator = '==';
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

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal1 = '';
        var socketVal2 = '';
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (IsEmptyString(theSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval;
                if (isNaN(tValue)) {
                    tValue = "'" + tValue + "'";
                }
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
                if (!link.outSocket.isSimpleVal) {
                    tValue = '(' + tValue + ')';
                }
            }
            if (i == 0) {
                socketVal1 = tValue;
            }
            else {
                socketVal2 = tValue;
            }
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, socketVal1 + this.operator + socketVal2);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_IF extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_IF, 'IF', false, nodeJson);
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
        this.inputSocket.label = 'flag';
        this.inputSocket.type = ValueType.Boolean;

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.trueFlowSocket = new NodeFlowSocket('true', this, false);
            this.falseFlowSocket = new NodeFlowSocket('false', this, false);
            this.addSocket(this.trueFlowSocket);
            this.addSocket(this.falseFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                if (this.outFlowSockets_arr[si].name == 'true') {
                    this.trueFlowSocket = this.outFlowSockets_arr[si];
                }
                else {
                    this.falseFlowSocket = this.outFlowSockets_arr[si];
                }
            }
        }
        this.trueFlowSocket.label = "True";
        this.falseFlowSocket.label = "False";
    }

    getNodeTitle() {
        return 'IF';
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
                '必须有输入值']);
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
                compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
            }
            if (compileRet == false) {
                return false;
            }
            socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
        }

        var myJSBlock = new FormatFileBlock(this.id);
        var myJS = new JSFile_IF('if', socketValue);
        myJSBlock.pushChild(myJS);
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;

        for (var fi = 0; fi < 2; ++fi) {
            var theFlowSocket = fi == 0 ? this.trueFlowSocket : this.falseFlowSocket;
            var useBlock = fi == 0 ? myJS.trueBlock : myJS.falseBlock;
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(theFlowSocket);
            if (flowLinks_arr.length != 0) {
                flowLink = flowLinks_arr[0];
                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, useBlock);
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

class JSNode_Switch extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SWITCH, 'Switch', false, nodeJson);
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
        this.inputSocket.label = 'target';
        this.inputSocket.type = ValueType.String;

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
        else {
            this.outFlowSockets_arr.forEach(item => {
                item.inputable = true;
            });
        }
    }

    genOutFlowSocket() {
        var nameI = this.outFlowSockets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('case' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeFlowSocket('case' + nameI, this, false, { inputable: true });
    }

    getNodeTitle() {
        return 'Switch';
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

        if (this.outFlowSockets_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '必须要有case设置']);
            return false;
        }

        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;
        for (var oi in this.outFlowSockets_arr) {
            var caseFlowSocket = this.outFlowSockets_arr[oi];
            if (IsEmptyString(caseFlowSocket.defval)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    'case输入不能为空']);
                return false;
            }
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
                    'case 流程不能为空']);
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

class JSNode_Break extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_BREAK, 'break', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var setLine = new FormatFile_Line('break;');
        belongBlock.pushChild(setLine);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', setLine);
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

class JSNode_Sequence extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SEQUENCE, 'Sequence', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
    }

    genOutFlowSocket() {
        var nameI = this.outFlowSockets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('outflow' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeFlowSocket('outflow' + nameI, this, false);
    }

    getNodeTitle() {
        return 'Sequence';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.outFlowSockets_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '至少要有一个输出流！']);
            return false;
        }
        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;
        for (var oi in this.outFlowSockets_arr) {
            var flowSocket = this.outFlowSockets_arr[oi];
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(flowSocket);
            if (flowLinks_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                '第' + (oi + 1) + '个输出流为空']);
                return false;
            }
            flowLink = flowLinks_arr[0];
            nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, myJSBlock);
            if (nextNodeCompileRet == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_CurrentDataRow extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CURRENTDATAROW, 'DATAROW', false, nodeJson);
        autoBind(this);
        this.addFrameButton(FrameButton_ClearEmptyOutputSocket, '清理');
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.formID = this.formID;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['varName', 'formID']);
    }

    /*
    getColumnType(columnName){
        var formKernel = this.bluePrint.master.project.getControlById(this.formID);
        if(formKernel == null){
            return ValueType.Unknown;
        }
        var theDS = formKernel.getAttribute(AttrNames.DataSource);
        if(theDS == null){
            return ValueType.Unknown;
        }
        var theCol = theDS.getColumnByName(columnName);
        return theCol == null ? ValueType.Unknown : theCol.cvalType;
    }
    */

    getNodeTitle() {
        return 'CurrentRow';
    }

    genOutSocket() {
        var formKernel = this.bluePrint.master.project.getControlById(this.formID);
        if (formKernel == null) {
            return null;
        }
        var theDS = formKernel.getAttribute(AttrNames.DataSource);
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
            return hadColumns_arr.indexOf(colItem.name) == -1
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
        var usePreNodes_arr = preNodes_arr.concat(this);

        var formKernel = this.bluePrint.master.project.getControlById(this.formID);
        if (formKernel == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
            this.formID + '没找到！']);
            return false;
        }
        var theDS = formKernel.getAttribute(AttrNames.DataSource);
        if (theDS == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '关联Form没有数据源！']);
            return false;
        }
        var theScope = belongBlock.getScope();
        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        for (var si in this.outputScokets_arr) {
            var outSocket = this.outputScokets_arr[si];
            var colName = outSocket.getExtra('colName');
            var columnItem = theDS.columns.find(x => { return x.name == colName; });
            if (columnItem == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                '第' + (si + 1) + '个输出接口列名无效！']);
                return false;
            }
            helper.addUseColumn(formKernel, colName);
            selfCompileRet.setSocketOut(outSocket, this.formID + '_nowrecord' + "['" + colName + "']");
        }
        return selfCompileRet;
    }
}

class JSNODE_CtlKernel extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CTLKERNEL, 'CtlKernel', false, nodeJson);
        autoBind(this);
        this.headType = 'empty';
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.outSocket.label = this.ctlID;
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = SocketType_CtlKernel;
    }

    preRenderFrame() {
        var kernel = this.bluePrint.master.project.getControlById(this.ctlID);
        if (this.outSocket.kernel != kernel) {
            this.outSocket.label = kernel.getReadableName();
            this.outSocket.kernelType = kernel.type;
            this.outSocket.fireEvent('changed', 10);
        }
        else {
            this.outSocket.kernelType = null;
            this.outSocket.label = this.ctlID + '(不存在)';
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.ctlID = this.ctlID;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['ctlID']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.outFlowSockets_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '至少要有一个输出流！']);
            return false;
        }
        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;
        for (var oi in this.outFlowSockets_arr) {
            var flowSocket = this.outFlowSockets_arr[oi];
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(flowSocket);
            if (flowLinks_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                '第' + (oi + 1) + '个输出流为空']);
                return false;
            }
            flowLink = flowLinks_arr[0];
            nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, myJSBlock);
            if (nextNodeCompileRet == false) {
                return false;
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_Insert_table extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_INSERT_TABLE, 'Insert', false, nodeJson);
        autoBind(this);
        this.onlyServerside = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outputScokets_arr.length > 0) {
            for (var si in this.outputScokets_arr) {
                var socket = this.outputScokets_arr[si];
                if (socket.name == 'identity') {
                    this.identityOutSocket = socket;
                    socket.label = 'id';
                }
                else if (socket.name == 'err') {
                    this.errInfoOutSocket = socket;
                    socket.label = 'errinfo';
                }
            }
        }
        if (this.identityOutSocket == null) {
            this.identityOutSocket = new NodeSocket('identity', this, false, { label: 'Identity', type: ValueType.Int });
            this.addSocket(this.identityOutSocket);
        }
        if (this.errInfoOutSocket == null) {
            this.errInfoOutSocket = new NodeSocket('err', this, false, { label: '错误信息', type: ValueType.String });
            this.addSocket(this.errInfoOutSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.sucessFlowSocket = new NodeFlowSocket('sucess', this, false);
            this.failFlowSocket = new NodeFlowSocket('fail', this, false);
            this.addSocket(this.sucessFlowSocket);
            this.addSocket(this.failFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                if (this.outFlowSockets_arr[si].name == 'sucess') {
                    this.sucessFlowSocket = this.outFlowSockets_arr[si];
                }
                else {
                    this.failFlowSocket = this.outFlowSockets_arr[si];
                }
            }
        }
        if (!IsEmptyString(this.dsCode)) {
            this.setDSCode(this.dsCode);
        }
        this.sucessFlowSocket.label = '成功';
        this.failFlowSocket.label = '失败';
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.dsCode = this.dsCode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['dsCode']);
    }

    inputSocketSortFun(sa, sb) {
        return sa.index > sb.index;
    }

    dsSynedHandler() {
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS && theDS.loaded) {
            if (theDS.columns == null) {
                this.bluePrint.master.project.logManager.warn('数据源:' + this.dsCode + '无效');
                return;
            }
            var hadChanged = false;
            this.inputScokets_arr.forEach(item => {
                item._validcolumn = false;
            });
            var hadIdentity = false;
            theDS.columns.forEach((column, i) => {
                if (column.is_identity) {
                    hadIdentity = true;
                    return;
                }
                var theSocket = this.getScoketByName(column.name);
                if (theSocket == null) {
                    this.addSocket(new NodeSocket(column.name, this, true, { type: column.cvalType, label: column.name, index: i }));
                    hadChanged = true;
                }
                else {
                    theSocket._validcolumn = true;
                    theSocket.set({ label: column.name });
                    theSocket.index = i;
                    //theSocket.type = column.cvalType;
                    theSocket.fireEvent('changed', 10);
                }
            });
            var needSort = false;
            for (var si = 0; si < this.inputScokets_arr.length; ++si) {
                var theSocket = this.inputScokets_arr[si];
                if (theSocket._validcolumn == false) {
                    this.removeSocket(theSocket);
                    --si;
                    hadChanged = true;
                }
                else {
                    if (!needSort) {
                        needSort = theSocket.index == si + (hadIdentity ? 1 : 0);
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
    }

    listenDS(theDS) {
        if (theDS) {
            theDS.on('syned', this.dsSynedHandler);
        }
        this.listenedDS = theDS;
    }

    unlistenDS(theDS) {
        if (theDS) {
            theDS.off('syned', this.dsSynedHandler);
        }
        this.listenedDS = null;
    }

    setDSCode(code) {
        this.dsCode = code;
        var theDS = g_dataBase.getEntityByCode(code);
        this.unlistenDS(this.listenedDS);
        this.listenDS(theDS);
        if (theDS.loaded) {
            this.dsSynedHandler();
        }
    }

    customSocketRender(socket) {
        return null;
        if (socket.isIn) {
            return null;
        }
        var kernel = this.bluePrint.master.project.getControlById(this.ctlID);
        var type = '控件';
        var label = this.ctlID;
        if (kernel == null) {
            return (<span f-canmove={1} className='badge badge-danger'>{label}不存在</span>);
        }
        else {
            type = ReplaceIfNull(GetControlTypeReadableName(kernel.type), kernel.type);
        }
        return <span f-canmove={1}>{label}<span f-canmove={1} className='badge badge-primary'>{type}</span></span>;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        var useDS = g_dataBase.getEntityByCode(this.dsCode);
        if (!useDS.loaded) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
            useDS + '正在同步中，请稍后再试。']);
            return false;
        }
        if (useDS.columns == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
            useDS + '是个无效数据源']);
            return false;
        }
        var needInsertColumns_arr = [];
        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            var column = useDS.getColumnByName(socket.name);
            var dataLinks_arr = this.bluePrint.linkPool.getLinksBySocket(socket);
            var socketValue = null;
            if (dataLinks_arr.length == 0) {
                if (IsEmptyString(socket.defval)) {
                    if (!column.is_nullable || column.cdefault) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                        socket.name + '必须要有输入']);
                        return false;
                    }
                }
                else {
                    socketValue = socket.defval;
                    if (isNaN(socketValue)) {
                        socketValue = singleQuotesStr(socketValue);
                    }
                }
            }
            else {
                var dataLink = dataLinks_arr[0];
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
                    compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
                }
                if (compileRet == false) {
                    return false;
                }
                socketValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
            }

            if (socketValue != null) {
                needInsertColumns_arr.push({
                    name: column.name,
                    value: socketValue,
                });
            }
        }
        var insertSqlStr = 'insert ' + midbracketStr(useDS.name) + '(';
        var valuesStr = '';
        var sqlVarName = this.id + '_sql';
        var paramArrVarName = this.id + '_paramArr';
        var newRecordIdVarName = this.id + '_newrcdid';
        var paramArrVarBlock = new FormatFileBlock('paramarr');
        selfCompileRet.setSocketOut(this.identityOutSocket, newRecordIdVarName);
        paramArrVarBlock.pushLine("var " + paramArrVarName + '=[', 1);
        needInsertColumns_arr.forEach((item, i) => {
            insertSqlStr += (i == 0 ? '' : ',') + midbracketStr(item.name);
            valuesStr += (i == 0 ? '@' : ',@') + item.name;
            paramArrVarBlock.pushLine("dbhelper.makeSqlparam('" + item.name + "', sqlTypes.NVarChar, " + item.value + "),");
        });
        paramArrVarBlock.subNextIndent();
        paramArrVarBlock.pushLine('];');
        myJSBlock.pushLine("var " + sqlVarName + "='" + insertSqlStr + ')values(' + valuesStr + ") select SCOPE_IDENTITY()';");
        myJSBlock.pushChild(paramArrVarBlock);
        var retVarName = this.id + '_queryRet';
        var errVarName = this.id + '_queryErrmsg';
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errVarName);
        myJSBlock.pushLine("var " + errVarName + " = null;");
        myJSBlock.pushLine("var " + retVarName + " = null;");
        myJSBlock.pushLine('try{', 1);
        myJSBlock.pushLine(retVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramArrVarName + ");");
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}catch(eo){', 1);
        myJSBlock.pushLine(errVarName + '=eo.message;');
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');
        var rcdIfBlock = new JSFile_IF('rcdif', retVarName + ' != null');
        myJSBlock.pushChild(rcdIfBlock);
        rcdIfBlock.trueBlock.pushLine('var ' + newRecordIdVarName + '=' + retVarName + ".recordset[0][''];");

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, rcdIfBlock.trueBlock);
        }

        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, rcdIfBlock.falseBlock);
        }

        //var finalStr = 'insert ' + midbracketStr(useDS.name) + '(' + insertColumnStr + ') values(' + insertValueStr + ')'
        //console.log(finalStr);
        return selfCompileRet;
    }
}

class JSNode_Control_Api_Prop extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CONTROL_API_PROP, 'CtlApiProp', false, nodeJson);
        autoBind(this);
        var apiItem = this.apiItem;
        var apiClass = this.apiClass;
        if (apiItem == null) {
            apiClass = g_controlApi_arr.find(e => { return e.ctltype == this.ctltype; });
            apiItem = apiClass.getApiItemByid(this.apiid);
            if (apiClass == null || apiItem == null) {
                console.error('查询控件api失败！');
            }
            this.apiClass = apiClass;
            this.apiItem = apiItem;
        }
        this.label = apiClass.ctllabel + '.' + apiItem.attrItem.label;
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
        this.inSocket.inputable = false;
        this.inSocket.type = SocketType_CtlKernel;
        this.inSocket.kernelType = apiClass.ctltype;

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = apiItem.attrItem.valueType;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.ctltype = this.apiClass.ctltype;
        rlt.apiid = this.apiItem.id;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['ctltype', 'apiid']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var selectedCtlid = this.inSocket.getExtra('ctlid');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (selectedKernel == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '需要选择控件']);
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (canAccessCtls_arr.indexOf(selectedKernel) == -1) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '指定的控件不可访问']);
            return false;
        }
        helper.addUseControlPropApi(selectedKernel, this.apiItem);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, selectedKernel.id + '_' + this.apiItem.stateName);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


class JSNode_Control_Api_PropSetter extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CONTROL_API_PROPSETTER, 'CtlApiPropsetter', false, nodeJson);
        autoBind(this);
        var apiItem = this.apiItem;
        var apiClass = this.apiClass;
        if (apiItem == null) {
            apiClass = g_controlApi_arr.find(e => { return e.ctltype == this.ctltype; });
            apiItem = apiClass.getApiItemByid(this.apiid);
            if (apiClass == null || apiItem == null) {
                console.error('查询控件api失败！');
            }
            this.apiClass = apiClass;
            this.apiItem = apiItem;
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        this.label = 'Set:' + apiClass.ctllabel + '.' + apiItem.stateName;
        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.ctlSocket = this.inputScokets_arr[0];
                this.valueSocket = this.inputScokets_arr[1];
            }
        }
        if (this.ctlSocket == null) {
            this.ctlSocket = new NodeSocket('ctl', this, true);
            this.addSocket(this.ctlSocket);
        }
        this.ctlSocket.inputable = false;
        this.ctlSocket.type = SocketType_CtlKernel;
        this.ctlSocket.kernelType = apiClass.ctltype;
        if (this.valueSocket == null) {
            this.valueSocket = new NodeSocket('val', this, true);
            this.addSocket(this.valueSocket);
        }
        this.valueSocket.type = ValueType.Any;
        this.valueSocket.inputable = true;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.ctltype = this.apiClass.ctltype;
        rlt.apiid = this.apiItem.id;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['ctltype', 'apiid']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var selectedCtlid = this.ctlSocket.getExtra('ctlid');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (selectedKernel == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '需要选择控件']);
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (canAccessCtls_arr.indexOf(selectedKernel) == -1) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '指定的控件不可访问']);
            return false;
        }
        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.valueSocket);
        var valueStr = null;
        if (datalinks_arr.length == 0) {
            if (IsEmptyString(this.valueSocket.defval)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '必须有输入值']);
                return false;
            }
            valueStr = this.inSocket.defval;
            if (isNaN(socketValue)) {
                valueStr = singleQuotesStr(socketValue);
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
            valueStr = compileRet.getSocketOut(dataLink.outSocket).strContent;
        }
        var myJSBlock = new FormatFileBlock(this.id);
        myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath(" + valueStr + ",'" + selectedKernel.getStatePath(this.apiItem.stateName) + "'))");
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

const gJSDateFuns_arr = [
    {
        name: 'CastDate',
        inputs: [{ label: '', type: ValueType.String }],
        outputs: [{ label: '', type: ValueType.Date }]
    },
    {
        name: 'AddDay',
        inputs: [{ label: '日期', type: ValueType.Date },
                 { label: '偏移', type: ValueType.Int, inputable:true },
        ],
        outputs: [{ label: '', type: ValueType.Date }]
    },
    {
        name: 'Format[yyyy-mm-hh]',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
];

class JSNode_DateFun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DATEFUN, 'datefun', false, nodeJson);
        autoBind(this);
        if (this.funName == null) {
            this.setFunName(gJSDateFuns_arr[1].name);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.funName = this.funName;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['funName']);
    }

    setFunName(funName) {
        if (this.funName == funName) {
            return;
        }
        this.funName = funName;
        var funData = gJSDateFuns_arr.find(e => { return e.name == funName; });
        var socket_i = 0;
        for (; socket_i < funData.inputs.length; ++socket_i) {
            var socketData = funData.inputs[socket_i];
            var nowSocket = this.inputScokets_arr[socket_i];
            if (nowSocket == null) {
                nowSocket = this.addSocket(new NodeSocket('in' + socket_i, this, true, { label: socketData.label, type: socketData.type, inputable:socketData.inputable == true }));
            }
            else {
                nowSocket.label = socketData.label;
                nowSocket.type = socketData.type;
                nowSocket.fireEvent('changed');
            }
        }
        while (socket_i < this.inputScokets_arr.length) {
            this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
        }
        socket_i = 0;
        for (; socket_i < funData.outputs.length; ++socket_i) {
            var socketData = funData.outputs[socket_i];
            var nowSocket = this.outputScokets_arr[socket_i];
            if (nowSocket == null) {
                nowSocket = this.addSocket(new NodeSocket('out' + socket_i, this, false, { label: socketData.label, type: socketData.type }));
            }
            else {
                nowSocket.label = socketData.label;
                nowSocket.type = socketData.type;
                nowSocket.fireEvent('changed');
            }
        }
        while (socket_i < this.outputScokets_arr.length) {
            this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
        }
        this.fireEvent(Event_SocketNumChanged,20);
        this.fireMoved(10);
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
        for(var socket_i=0;socket_i<this.inputScokets_arr.length;++socket_i){
            var theSocket = this.inputScokets_arr[socket_i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (theSocket.inputable == false || IsEmptyString(theSocket.defval)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                        '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval;
            }
            else {
                var dataLink = tLinks[0];
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
                    compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
                }
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(dataLink.outSocket).strContent;
            }
            socketVal_arr.push(tValue);
        }
        var outSocket = this.outputScokets_arr[0];
        var selfCompileRet = new CompileResult(this);
        switch(this.funName){
            case 'Format[yyyy-mm-hh]':
            selfCompileRet.setSocketOut(outSocket, 'getFormatDateString(' + socketVal_arr[0] + ')');
            break;
            case 'AddDay':
            var varName = socketVal_arr[0];
            selfCompileRet.setSocketOut(outSocket, varName + '.setDate(' + varName + '.getDate() + ' + socketVal_arr[1] + ')');
            break;
            case 'CastDate':
            selfCompileRet.setSocketOut(outSocket, 'new Date(' + socketVal_arr[0] + ')');
            break;
        }

        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


JSNodeClassMap[JSNODE_VAR_GET] = {
    modelClass: JSNode_Var_Get,
    comClass: C_JSNode_Var_Get,
};
JSNodeClassMap[JSNODE_VAR_SET] = {
    modelClass: JSNode_Var_Set,
    comClass: C_JSNode_Var_Set,
};
JSNodeClassMap[JSNODE_START] = {
    modelClass: JSNode_Start,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CONSTVALUE] = {
    modelClass: JSNode_ConstValue,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_RETURN] = {
    modelClass: JSNode_Return,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_NOPERAND] = {
    modelClass: JSNode_NOperand,
    comClass: C_SqlNode_NOperand,
};
JSNodeClassMap[JSNODE_COMPARE] = {
    modelClass: JSNode_Compare,
    comClass: C_SqlNode_Compare,
};
JSNodeClassMap[JSNODE_IF] = {
    modelClass: JSNode_IF,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_SWITCH] = {
    modelClass: JSNode_Switch,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_BREAK] = {
    modelClass: JSNode_Break,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_SEQUENCE] = {
    modelClass: JSNode_Sequence,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CURRENTDATAROW] = {
    modelClass: JSNode_CurrentDataRow,
    comClass: C_JSNode_CurrentDataRow,
};
JSNodeClassMap[JSNODE_CTLKERNEL] = {
    modelClass: JSNODE_CtlKernel,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_INSERT_TABLE] = {
    modelClass: JSNODE_Insert_table,
    comClass: C_JSNODE_Insert_table,
};
JSNodeClassMap[JSNODE_CONTROL_API_PROP] = {
    modelClass: JSNode_Control_Api_Prop,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DATEFUN] = {
    modelClass: JSNode_DateFun,
    comClass: C_JSNode_DateFun,
};
JSNodeClassMap[JSNODE_CONTROL_API_PROPSETTER] = {
    modelClass: JSNode_Control_Api_PropSetter,
    comClass: C_Node_SimpleNode,
};