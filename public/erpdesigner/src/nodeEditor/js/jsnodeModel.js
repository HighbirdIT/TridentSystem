const JSNODE_VAR_GET = 'var_get';
const JSNODE_VAR_SET = 'var_set';
const JSNODE_START = 'start';
const JSNODE_RETURN = 'return';
const JSNODE_CONSTVALUE = 'constvalue';
const JSNODE_NOPERAND = 'noperand';
const JSNODE_LOGICAL_OPERATOR = 'logical_operator';
const JSNODE_COMPARE = 'compare';
const JSNODE_IF = 'jsif';
const JSNODE_SWITCH = 'jsswitch';
const JSNODE_BREAK = 'jsbreak';
const JSNODE_SEQUENCE = 'sequence';
const JSNODE_CURRENTDATAROW = 'currentdatarow';
const JSNODE_CTLKERNEL = 'ctlkernel';
const JSNODE_INSERT_TABLE = 'insert_table';
const JSNODE_UPDATE_TABLE = 'update_table';
const JSNODE_CONTROL_API_PROP = 'controlapiprop';
const JSNODE_CONTROL_API_PROPSETTER = 'controlapipropsetter';
const JSNODE_DATEFUN = 'jsdatefun';
const JSNODE_ENV_VAR = 'envvar';
const JSNODE_BOOLEANVALUE = 'booleanvalue';
const JSNODE_QUERY_SQL = 'querysql';
const JSNODE_CALLONFETCHEND = 'callonfetchend';
const JSNODE_ARRAY_LENGTH = 'arraylength';
const JSNODE_CREATE_CUSERROR = 'createcuserror';
const JSNODE_FRESH_FORM = 'freshform';
const JSNODE_DO_FLOWSTEP = 'doflowstep';

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

    isReachable() {
        if (this.type == JSNODE_START) {
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
        var ctlKernel = this.master.project.getControlById(this.ctlID);
        if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid) {
            if (ctlKernel == null) {
                compilHelper.logManager.error('蓝图关联控件' + this.ctlID + '无法找到');
                return false;
            }
            this.ctlKernel = ctlKernel;
        }
        var theFun = compilHelper.scope.getFunction(this.name, true);
        compilHelper.compilingFun = theFun;
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
            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                compilHelper.logManager.error('本蓝图种类不允许出现参数');
                return false;
            }
        }
        var ret = this.startNode.compile(compilHelper, [], theFun.bodyBlock);
        if (ret == false) {
            return false;
        }
        if (this.group == EJsBluePrintFunGroup.CtlValid) {
            params_arr = ['nowValue', 'comeState', 'comeValidErrState'];
            if (compilHelper.clientSide) {
                compilHelper.clientSide.setCusValidCheckerBlock.pushLine("gCusValidChecker_map['" + ctlKernel.id + "'] = " + theFun.name + ";");
            }
        }
        var initValue;
        var varName;
        var usectlid;
        var useCtlData;
        var propName;
        var propApiitem;
        var needCheckVars_arr = [];
        var needCheckProps_map = {};
        var ctlStateVarName;
        var ctlParentStateVarName;
        var nullableChecker = null;
        if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid) {
            var hadCallParm = this.group == EJsBluePrintFunGroup.CtlAttr;
            if (!hadCallParm) {
                theFun.scope.getVar(VarNames.State, true, 'store.getState()');
            }
            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                params_arr = [VarNames.State, VarNames.Bundle];
            }
            for (var formId in compilHelper.useForm_map) {
                var useFormData = compilHelper.useForm_map[formId];
                var formStateVarName = null;
                ctlParentStateVarName = null;
                ctlStateVarName = null;
                if (!IsEmptyObject(useFormData.useControls_map)) {
                    formStateVarName = formId + '_state';
                    initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                    theFun.scope.getVar(formStateVarName, true, initValue);

                    for (usectlid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[usectlid];
                        ctlStateVarName = usectlid + '_state';
                        initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(usectlid), '{}');
                        theFun.scope.getVar(ctlStateVarName, true, initValue);
                        if (useCtlData.kernel.isAEditor()) {
                            ctlParentStateVarName = useCtlData.kernel.parent.id + '_state';
                            initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.parent.id), '{}');
                            theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                        }

                        for (propName in useCtlData.useprops_map) {
                            propApiitem = useCtlData.useprops_map[propName];
                            varName = usectlid + '_' + propApiitem.stateName;
                            if (hadCallParm) {
                                initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + ctlStateVarName + '.' + propApiitem.stateName;
                                //initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                            }
                            else {
                                initValue = ctlStateVarName + '.' + propApiitem.stateName;
                                //makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.id + '.' + propApiitem.stateName));
                            }
                            theFun.scope.getVar(varName, true, initValue);
                            if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                                needCheckProps_map[varName] = 1;
                                nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                                needCheckVars_arr.push({
                                    kernel: useCtlData.kernel,
                                    nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                    visibleStateVar: ctlParentStateVarName == null ? ctlStateVarName : ctlParentStateVarName,
                                    ctlStateVar: ctlStateVarName,
                                    valueVar: varName
                                });
                            }
                        }
                    }
                }
                if (!IsEmptyObject(useFormData.useColumns_map)) {
                    var nowRecordVarName = formId + '_' + VarNames.NowRecord + '';
                    if (hadCallParm) {
                        initValue = 'bundle != null && bundle.' + nowRecordVarName + ' != null ? bundle.' + nowRecordVarName + ' : ' + makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)));
                    }
                    else {
                        initValue = makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, formStateVarName == null ? singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)) : singleQuotesStr(VarNames.NowRecord));
                    }
                    theFun.scope.getVar(nowRecordVarName, true, initValue);
                    needCheckVars_arr.push(nowRecordVarName);

                    for(var columnName in useFormData.useColumns_map){
                        var useFormColumn = useFormData.useColumns_map[columnName];
                        if(useFormColumn.serverFuns_arr.length > 0){
                            useFormColumn.serverFuns_arr.forEach(serverFun=>{
                                serverFun.bundleCheckBlock.pushLine('if(req.body.' + VarNames.Bundle + '.' + formId + '_' + columnName + "==null){return serverhelper.createErrorRet('缺少参数" + columnName + "');}");
                            });
                            compilHelper.clientInitBundleBlocks_arr.forEach(block=>{
                                block.pushLine(formId + '_' + columnName + ':' + formId + '_' + VarNames.NowRecord + "['" + columnName + "']" + ',');
                            });
                        }
                    }
                }
            }
            for (usectlid in compilHelper.useGlobalControls_map) {
                useCtlData = compilHelper.useGlobalControls_map[usectlid];
                ctlStateVarName = usectlid + '_state';
                if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                    initValue = "bundle != null && bundle['" + varName + "'] != null ? bundle['" + varName + "'] : " + makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()));
                }
                else {
                    initValue = makeStr_getStateByPath('store.getState()', singleQuotesStr(useCtlData.kernel.getStatePath()));
                }
                theFun.scope.getVar(ctlStateVarName, true, initValue);

                for (propName in useCtlData.useprops_map) {
                    propApiitem = useCtlData.useprops_map[propName];
                    varName = usectlid + '_' + propApiitem.stateName;
                    theFun.scope.getVar(varName, true, ctlStateVarName + '.' + propApiitem.stateName);
                    if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                        needCheckProps_map[varName] = 1;
                        nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                        needCheckVars_arr.push({
                            kernel: useCtlData.kernel,
                            nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                            visibleStateVar: ctlStateVarName,
                            ctlStateVar: ctlStateVarName,
                            valueVar: varName
                        });
                    }
                }
            }
        }
        var finalCallBack_bk = new FormatFileBlock('finalcallback');
        theFun.headBlock.pushChild(finalCallBack_bk);
        var needFinalCallback = false;
        if (needCheckVars_arr.length > 0) {
            var validErrVar = theFun.scope.getVar('validErr', true);
            var hadValidErrVar = theFun.scope.getVar('hadValidErr', true, 'false');
            var validErrStateVarInitval = '{}';
            if (this.group == EJsBluePrintFunGroup.CtlValid) {
                validErrStateVarInitval = 'comeValidErrState == null ? {} : comeValidErrState';
            }
            var validErrStateVar = theFun.scope.getVar('validErrState', true, validErrStateVarInitval);
            needFinalCallback = true;
            var checkVarValidStr = '';
            var validKernelBlock = new FormatFileBlock('validkernel');
            needCheckVars_arr.forEach(varObj => {
                if (typeof varObj === 'string') {
                    checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varObj + ')';
                    return;
                }
                var valueType = 'string';
                if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                    valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                }
                var infoStatePath = varObj.kernel.getStatePath('invalidInfo');
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    validKernelBlock.pushLine("if(validErrState.hasOwnProperty('" + infoStatePath + "')){validErr=validErrState['" + infoStatePath + "'];}");
                    validKernelBlock.pushLine('else{', 1);
                }
                validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [
                    this.group == EJsBluePrintFunGroup.CtlValid ? 'comeState' : VarNames.State,
                    varObj.visibleStateVar,
                    varObj.ctlStateVar,
                    varObj.valueVar,
                    singleQuotesStr(valueType),
                    varObj.nullable.toString(),
                    singleQuotesStr(varObj.kernel.id),
                    validErrStateVar.name
                ]) + ";");
                validKernelBlock.pushLine("validErrState['" + infoStatePath + "']=validErr;");
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    validKernelBlock.subNextIndent();
                    validKernelBlock.pushLine('}');
                }
                validKernelBlock.pushLine("if(validErr != null) hadValidErr = true;");
                //checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
            });
            if (checkVarValidStr.length > 0) {
                var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                theFun.headBlock.pushChild(checkVarValidIf);
                checkVarValidIf.trueBlock.pushLine("return callback_final(state, null, {info:gPreconditionInvalidInfo});");
            }
            theFun.headBlock.pushChild(validKernelBlock);
            var stateParam = 'null';
            switch (this.group) {
                case EJsBluePrintFunGroup.CtlAttr:
                    stateParam = VarNames.State;
                    break;
            }
            theFun.headBlock.pushLine("if(hadValidErr){return callback_final(" + stateParam + ", null, {info:gPreconditionInvalidInfo});}");
        }
        if (theFun.needFetchEndCallBack) {
            // 需要callbackmain
            needFinalCallback = true;
        }
        var startFtech_bk = null;
        if (theFun.hadServerFetch) {
            needFinalCallback = true;

            theFun.headBlock.pushLine("var fetchid = Math.round(Math.random() * 999999);");
            theFun.headBlock.pushLine("fetchTracer['" + theFun.name + "'] = fetchid;");
            startFtech_bk = new FormatFileBlock('startfetch');
            theFun.headBlock.pushChild(startFtech_bk);
            theFun.startFtech_bk = startFtech_bk;
            /*
            var hadActiveCallFinal = compilHelper.compileSeq.find(node=>{return node.type == JSNODE_CALLONFETCHEND;});
            if (!hadActiveCallFinal) {
                // 检查有没有主动调用final
                if(this.group != EJsBluePrintFunGroup.CtlEvent){
                    compilHelper.logManager.error('蓝图有后台fetch，但没有主动callfetchend');
                    return false;
                }
                // CtlEvent 的蓝图自动加上callfetchend
                if(theFun.defaultBlock == null){
                    compilHelper.logManager.error('没有设置defaultBlock');
                    return false;
                }
                theFun.defaultBlock.pushLine("return callback_final(state,null,null);");
            }
            */
        }
        if (needFinalCallback) {
            finalCallBack_bk.pushLine('var callback_final = (state, data, err)=>{', 1);
            var finalCallBackBody_bk = new FormatFileBlock('finalcallbackbody');
            var finalCallBackReturn_bk = new FormatFileBlock('finalcallbackreturn');
            finalCallBack_bk.pushChild(finalCallBackBody_bk);
            finalCallBack_bk.pushChild(finalCallBackReturn_bk);
            finalCallBack_bk.subNextIndent();
            finalCallBack_bk.pushLine('};');
            theFun.finalCallBackBody_bk = finalCallBackBody_bk;
            theFun.finalCallBackReturn_bk = finalCallBackReturn_bk;

            var setInvalidStateBlock = new FormatFileBlock('setvalidstate');
            finalCallBackBody_bk.pushChild(setInvalidStateBlock);
            if (this.group == EJsBluePrintFunGroup.CtlValid) {
                setInvalidStateBlock.pushLine("if(comeValidErrState == null){", 1);
                setInvalidStateBlock.pushLine("if(comeState){setManyStateByPath(comeState, '', validErrState);}");
                setInvalidStateBlock.pushLine("else{setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}, 50);}}");
                //var hadValidErrIf = new JSFile_IF('hadValidErr', 'hadValidErr');
                //setInvalidStateBlock.pushChild(hadValidErrIf);
                //hadValidErrIf.trueBlock.pushLine("return err.info;");
            }
            else if (this.group == EJsBluePrintFunGroup.CtlEvent) {
                // needMsgBox
                var msgBoxVarName = this.id + '_msg';
                theFun.scope.getVar(msgBoxVarName, true, 'null');
                var ctlName = ctlKernel.getAttribute(AttrNames.Name);
                if (startFtech_bk) {
                    startFtech_bk.pushLine(makeLine_Assign(msgBoxVarName, "PopMessageBox('',EMessageBoxType.Loading, '" + ctlName + "');"));
                }

                if (needCheckVars_arr.length > 0) {
                    setInvalidStateBlock.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}");
                    setInvalidStateBlock.pushLine("else{setManyStateByPath(state,'',validErrState);}");
                    setInvalidStateBlock.pushLine("if(hadValidErr){SendToast('验证失败，无法执行', EToastType.Warning);return;}");
                }
                setInvalidStateBlock.pushLine("if(err){", 1);
                setInvalidStateBlock.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".setData(err.info, EMessageBoxType.Error, '" + ctlName + "');}");
                setInvalidStateBlock.pushLine("else{SendToast(err.info, EToastType.Error);}");
                setInvalidStateBlock.pushLine("return;", -1);
                setInvalidStateBlock.pushLine("}");

                finalCallBackReturn_bk.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".fireClose();}");
                finalCallBackReturn_bk.pushLine("SendToast('执行成功');");
            }
            else {
                if (needCheckVars_arr.length > 0) {
                    setInvalidStateBlock.pushLine("setManyStateByPath(" + VarNames.State + ", '', validErrState);");
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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量')) {
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

        if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量', helper)) {
            return false;
        }

        var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;


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

        if (this.bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
            if (this.outputScokets_arr.length > 0) {
                this.newValSocket = this.outputScokets_arr[0];
            }
            if (this.newValSocket == null) {
                this.newValSocket = new NodeSocket('newval', this, false, { type: ValueType.String });
                this.addSocket(this.newValSocket);
            }
            this.newValSocket.label = 'NowValue';
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outFlowSocket, '', belongBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
            selfCompileRet.setSocketOut(this.newValSocket, 'nowValue');
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

        var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var value = this.getValue();
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(IsEmptyString(value), '无效值', helper)) {
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
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var tValue = socketComRet.value;
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

    compile(helper, preNodes_arr, belongBlock) {
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
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var tValue = socketComRet.value;
            if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
                tValue = '(' + tValue + ')';
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

        var socketComRet = this.getSocketCompileValue(helper, this.inputSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

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

        var socketComRet = this.getSocketCompileValue(helper, this.inputSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

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
        if (this.checkCompileFlag(this.outFlowSockets_arr.length == 0, '至少要有一个输出流！', helper)) {
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
        assginObjByProperties(this, attrsJson, ['formID']);
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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope.isServerSide;
        var superRet = super.compile(helper, preNodes_arr, blockInServer);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var formKernel = this.bluePrint.master.project.getControlById(this.formID);
        if (this.checkCompileFlag(formKernel == null, this.formID + '没找到！', helper)) {
            return false;
        }
        var theDS = formKernel.getAttribute(AttrNames.DataSource);
        if (this.checkCompileFlag(theDS == null, '关联Form没有数据源！', helper)) {
            return false;
        }
        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet, blockInServer);
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
            helper.addUseColumn(formKernel, colName, blockInServer ? theScope.fun : null);
            if(blockInServer){
                selfCompileRet.setSocketOut(outSocket, 'req.body.' + VarNames.Bundle + '.' + this.formID + '_' + colName);
            }
            else{
                selfCompileRet.setSocketOut(outSocket, this.formID + '_' + VarNames.NowRecord + "['" + colName + "']");
            }
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

        this.addFrameButton(FrameButton_LineSocket, '拉平');
        this.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');

        this.insocketDDC_setting = {
            options_arr: this.getUseDSColumns,
            textAttrName: 'name',
            valueAttrName: 'name'
        }

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
            this.serverSucessFlowSocket = new NodeFlowSocket('serverSucess', this, false);
            this.serverFailFlowSocket = new NodeFlowSocket('serverFail', this, false);
            this.addSocket(this.serverSucessFlowSocket);
            this.addSocket(this.serverFailFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'sucess':
                        this.sucessFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'fail':
                        this.failFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'serverSucess':
                        this.serverSucessFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'serverFail':
                        this.serverFailFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!IsEmptyString(this.dsCode)) {
            this.setDSCode(this.dsCode);
        }
        this.inputScokets_arr.forEach(socket => {
            socket.inputable = true;
            socket.inputDDC_setting = this.insocketDDC_setting;
        });
        this.sucessFlowSocket.label = '成功';
        this.failFlowSocket.label = '失败';
        this.serverSucessFlowSocket.label = 'server成功';
        this.serverFailFlowSocket.label = 'server失败';
    }

    getUseDSColumns() {
        var rlt = [];
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS != null && theDS.columns != null) {
            return theDS.columns;
        }
        return rlt;
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

    genInSocket() {
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS == null || theDS.columns == null) {
            return null;
        }
        var useColumn = null;
        for (var ci in theDS.columns) {
            var column = theDS.columns[ci];
            if (column.is_identity) {
                continue;
            }
            if (this.inputScokets_arr.filter(socket => { return socket.defval == column.name; }).length == 0) {
                useColumn = column;
                break;
            }
        }
        if (useColumn) {
            var useSocketName = null;
            var i = 0;
            while (i < 999) {
                useSocketName = 'in_' + i;
                if (this.inputScokets_arr.filter(socket => { return socket.name == useSocketName; }).length == 0) {
                    break;
                }
                i += 1;
            }
            return new NodeSocket(useSocketName, this, true, {
                inputable: true,
                defval: useColumn.name,
                inputDDC_setting: this.insocketDDC_setting,
            });
        }
        return null;
    }

    dsSynedHandler() {
        return;
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

        var relKernel = this.bluePrint.ctlKernel;
        if (this.checkCompileFlag(relKernel == null || relKernel.type != ButtonKernel_Type, '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
            return false;
        }

        var useDS = g_dataBase.getEntityByCode(this.dsCode);
        if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
            return false;
        }
        var columnProfile_obj = {};
        useDS.columns.forEach(column => {
            if (column.is_identity) {
                return;
            }
            column.is_nullable;
            column.cdefault
            columnProfile_obj[column.name] = {
                name: column.name,
                nullable: column.is_nullable || column.cdefault != null,
                value: null,
            };
        });

        var columnProfile = null;
        // 优先使用设置的节点
        var needInsertColumns_arr = [];
        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            columnProfile = columnProfile_obj[socket.defval];
            if (this.checkCompileFlag(columnProfile == null, '第' + (si) + '个输入接口不是有效的列名[' + socket.defval + ']', helper)) {
                return false;
            }
            if (this.checkCompileFlag(columnProfile.value != null, '第' + (si) + '个输入接口重复设置了[' + socket.defval + ']', helper)) {
                return false;
            }
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            columnProfile.value = socketValue;
        }
        // 在所属Form中搜集交互类型为读写的可访问控件
        var formKernel = relKernel.searchParentKernel([M_FormKernel_Type], true);
        if (formKernel != null) {
            var accessableLabelKernels = formKernel.searchChildKernel(M_LabeledControlKernel_Type, false, true, [M_FormKernel_Type]);
            if (accessableLabelKernels != null) {
                accessableLabelKernels.forEach(labelKernel => {
                    var interType = labelKernel.getAttribute(AttrNames.InteractiveType);
                    if (interType != EInterActiveType.ReadWrite) {
                        // 只要读写的
                        return;
                    }
                    var interField = labelKernel.getAttribute(AttrNames.InteractiveField);
                    columnProfile = columnProfile_obj[interField];
                    if (columnProfile == null) {
                        var textField = labelKernel.getAttribute(AttrNames.TextField);
                        columnProfile = columnProfile_obj[textField];
                    }
                    if (columnProfile == null || columnProfile.value != null) {
                        // not found or already had values
                        return;
                    }
                    var theEditor = labelKernel.editor;
                    var apiItem = null;
                    if (theEditor.hasAttribute(AttrNames.ValueField)) {
                        apiItem = gFindPropApiItem(theEditor.type, AttrNames.ValueField);
                    }
                    if (apiItem == null) {
                        apiItem = gFindPropApiItem(theEditor.type, AttrNames.TextField);
                    }
                    if (apiItem) {
                        helper.addUseControlPropApi(theEditor, apiItem);
                        columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                    }
                });
            }
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var serverClickFun = null;
        var paramInitBlock = null;
        var postCheckBlock = null;
        var insertPartVar = null;
        var valuePartVar = null;
        var insertSqlStr = '';
        var valuesStr = '';

        var sqlVarName = this.id + '_sql';
        var paramArrVarName = this.id + '_paramArr';
        var paramArrVarBlock = new FormatFileBlock('paramarr');
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;
        var needOperator = false;

        if (theServerSide != null) {
            var serverSideActName = '_' + this.id;
            serverClickFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverClickFun);
            var paramVarName = this.id + 'params_arr';
            serverClickFun.scope.getVar(paramVarName, true, 'null');
            insertPartVar = serverClickFun.scope.getVar(this.id + '_insert', true, "''");
            valuePartVar = serverClickFun.scope.getVar(this.id + '_values', true, "''");
            serverClickFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);

            postCheckBlock = new FormatFileBlock('postCheckBlock');
            serverClickFun.bundleCheckBlock = postCheckBlock;
            serverClickFun.pushChild(postCheckBlock);
            postCheckBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            paramInitBlock = new FormatFileBlock('initparam');
            serverClickFun.pushChild(paramInitBlock);
            paramInitBlock.pushLine(paramVarName + "=[", 1);

            serverClickFun.pushLine("var " + sqlVarName + " = " + insertPartVar.name + ' + ' + valuePartVar.name + ';');
            serverClickFun.pushLine("var " + dataVarName + " = -1;");
            serverClickFun.pushLine("try{", 1);
            serverClickFun.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select SCOPE_IDENTITY()', " + paramVarName + ");");
            serverClickFun.subNextIndent();
            serverClickFun.pushLine("}catch(" + errorVarName + "){", 1);
            serverClickFun.pushChild(serverFailBlock);
            serverClickFun.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
            serverClickFun.subNextIndent();
            serverClickFun.pushLine('}');
            serverClickFun.pushChild(serverCompleteBlock);
            serverClickFun.pushLine("return " + dataVarName + ";");
            theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
        }

        var mustHadColumns_arr = [];
        var optioniHadColumns_arr = [];
        var initBundleBlock = new FormatFileBlock('initbundle');
        for (var columnName in columnProfile_obj) {
            columnProfile = columnProfile_obj[columnName];
            if (columnProfile.value == null) {
                switch (columnName) {
                    case '登记确认状态':
                        columnProfile.value = '1';
                        columnProfile.isStatic = true;
                        break;
                    case '登记确认时间':
                        columnProfile.value = 'getdate()';
                        columnProfile.isStatic = true;
                        break;
                    case '登记确认用户':
                        columnProfile.value = '@_operator';
                        columnProfile.isStatic = true;
                        needOperator = true;
                        break;
                    default:
                        if (this.checkCompileFlag(!columnProfile.nullable, 'Insert[' + useDS.name + ']时搜寻不到[' + columnProfile.name + ']的匹配值', helper)) {
                            return false;
                        }
                }
            }
            if (columnProfile.value == null) {
                continue;
            }
            if (columnProfile.nullable) {
                optioniHadColumns_arr.push(columnProfile);
            }
            else {
                mustHadColumns_arr.push(columnProfile);
            }
            if (paramInitBlock) {
                if (columnProfile.isStatic) {
                    insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                    valuesStr += valuesStr.length == 0 ? columnProfile.value : ',' + columnProfile.value;
                }
                else {
                    var postName = ReplaceIfNull(columnProfile.postName, columnProfile.name);
                    if (!columnProfile.nullable) {
                        insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                        valuesStr += (valuesStr.length == 0 ? '@' : ',@') + postName;
                        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){return serverhelper.createErrorRet("缺少参数[' + postName + ']");}');
                    }
                    else {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){', 1);
                        //postCheckBlock.pushLine(insertPartVar.name + "+=" + insertPartVar.name + ".length == 0 ? '[" + columnProfile.name + "]' : ',[" + columnProfile.name + "]';");
                        //postCheckBlock.pushLine(valuePartVar.name + "+=" + valuePartVar.name + ".length == 0 ? '@" + columnProfile.name + "' : ',@" + columnProfile.name + "';");
                        postCheckBlock.pushLine(insertPartVar.name + "+= ',[" + columnProfile.name + "]';");
                        postCheckBlock.pushLine(valuePartVar.name + "+= ',@" + postName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + postName + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + postName + "),");
                    initBundleBlock.pushLine(postName + ':' + columnProfile.value + ',');
                }
            }
        }

        if (needOperator) {
            if(paramInitBlock){
                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }
        }

        if (optioniHadColumns_arr.length == 0) {
            insertSqlStr += ')';
            valuesStr += ')';
        }
        else if (postCheckBlock) {
            postCheckBlock.pushLine(insertPartVar.name + " += ')';");
            postCheckBlock.pushLine(valuePartVar.name + " += ')';");
        }
        if (insertPartVar) {
            insertPartVar.initVal = "'insert into " + midbracketStr(useDS.name) + "(" + insertSqlStr + "'";
            valuePartVar.initVal = "'values(" + valuesStr + "'";

            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
        }

        // make client
        helper.compilingFun.hadServerFetch = true;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        helper.addInitClientBundleBlock(initBundleBlock);
        myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
        helper.addInitClientBundleBlock(initBundleBlock);
        myJSBlock.pushChild(initBundleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        myJSBlock.pushLine('setTimeout(() => {', 1);
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        var errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
        fetchEndBlock.pushChild(errCheckIf);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('})))}, 50);');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.identityOutSocket, dataVarName);
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
        helper.setCompileRetCache(this, selfCompileRet);

        helper.compilingFun.defaultBlock = errCheckIf.trueBlock;

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock);
        }
        else {
            errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }

        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock);
        }
        else {
            errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (theServerSide != null && serverTrueFlowLinks_arr.length > 0) {
            this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock);
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (theServerSide != null && serverFalseFlowLinks_arr.length > 0) {
            this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock);
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
        if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
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
        if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
            return false;
        }
        var socketComRet = this.getSocketCompileValue(helper, this.valueSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var valueStr = socketComRet.value;

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
        { label: '偏移', type: ValueType.Int, inputable: true },
        ],
        outputs: [{ label: '', type: ValueType.Date }]
    },
    {
        name: 'Format[yyyy-mm-dd]',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'Format[hh:mm:ss]',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'Format[hh:mm]',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'DateDiff',
        inputs: [{ label: '间隔', type: ValueType.String, inputable: true, inputDDC_setting: { options_arr: ['秒', '分', '时', '天', '月', '年'] } },
        { label: '日期A', type: ValueType.Date, inputable: true },
        { label: '日期B', type: ValueType.Date, inputable: true }],
        outputs: [{ label: '', type: ValueType.Float }]
    },
    {
        name: 'CutTimePart',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.Date }]
    },
];

class JSNode_DateFun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DATEFUN, 'datefun', false, nodeJson);
        autoBind(this);
        if (this.funName == null) {
            this.setFunName(gJSDateFuns_arr[1].name);
        }
        else {
            this.setFunName(this.funName, true);
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

    setFunName(funName, force) {
        if (this.funName == funName && force != true) {
            return;
        }

        this.funName = funName;
        var funData = gJSDateFuns_arr.find(e => { return e.name == funName; });
        var socket_i = 0;
        for (; socket_i < funData.inputs.length; ++socket_i) {
            var socketData = funData.inputs[socket_i];
            var nowSocket = this.inputScokets_arr[socket_i];
            if (nowSocket == null) {
                nowSocket = this.addSocket(new NodeSocket('in' + socket_i, this, true, {
                    label: socketData.label,
                    type: socketData.type,
                    inputable: socketData.inputable == true,
                    inputDDC_setting: socketData.inputDDC_setting
                }));
            }
            else {
                nowSocket.label = socketData.label;
                nowSocket.type = socketData.type;
                nowSocket.inputable = socketData.inputable;
                nowSocket.inputDDC_setting = socketData.inputDDC_setting;
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
        this.fireEvent(Event_SocketNumChanged, 20);
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
        for (var socket_i = 0; socket_i < this.inputScokets_arr.length; ++socket_i) {
            var theSocket = this.inputScokets_arr[socket_i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            socketVal_arr.push(socketComRet.value);
        }
        var outSocket = this.outputScokets_arr[0];
        var selfCompileRet = new CompileResult(this);
        var callStr = '';
        var blockInServer = belongBlock.getScope().isServerSide;
        var funPreFix = blockInServer ? 'serverhelper.DateFun.' : '';
        switch (this.funName) {
            case 'Format[yyyy-mm-dd]':
                callStr = funPreFix + 'getFormatDateString(' + socketVal_arr[0] + ')';
                break;
            case 'AddDay':
                var varName = socketVal_arr[0];
                callStr = varName + '.setDate(' + varName + '.getDate() + ' + socketVal_arr[1] + ')';
                break;
            case 'CastDate':
                callStr = 'new Date(' + socketVal_arr[0] + ')';
                break;
            case 'Format[hh:mm:ss]':
                callStr = funPreFix + 'getFormatTimeString(' + socketVal_arr[0] + ')';
            case 'Format[hh:mm]':
                callStr = funPreFix + 'getFormatTimeString(' + socketVal_arr[0] + ',false)';
                break;
            case 'CutTimePart':
                callStr = funPreFix + 'cutTimePart(' + socketVal_arr[0] + ')';
                break;
            case 'DateDiff':
                callStr = funPreFix + 'getDateDiff(' + socketVal_arr[0] + ',' + socketVal_arr[1] + ',' + socketVal_arr[2] + ')';
                break;
            default:
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '不支持的日期方法']);
                return false;
        }
        selfCompileRet.setSocketOut(outSocket, callStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Env_Var extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ENV_VAR, '环境变量', false, nodeJson);
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
        this.outSocket.type = SqlVarType_Scalar;
        this.outSocket.inputable = true;
        this.outSocket.inputDDC_setting = {
            options_arr: EnvVariables_arr,
            textAttrName: 'text',
            valueAttrName: 'value'
        };
        this.headType = 'empty'
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var enName = this.outSocket.defval;
        if (this.checkCompileFlag(EnvVariable[enName] == null, '无效值', helper)) {
            return false;
        }

        var outSocket = this.outSocket;
        var selfCompileRet = new CompileResult(this);
        switch (EnvVariable[enName]) {
            case EnvVariable.userid:
            case EnvVariable.username:
            case EnvVariable.workRegionCode:
            case EnvVariable.companyCode:
            case EnvVariable.wokerTypeCode:
            case EnvVariable.departmentCode:
            case EnvVariable.systemCode:
                selfCompileRet.setSocketOut(outSocket, 'g_envVar.' + enName);
                break;
            case EnvVariable.nowDate:
                selfCompileRet.setSocketOut(outSocket, 'getNowDate()');
                break;
            case EnvVariable.nowTime:
                selfCompileRet.setSocketOut(outSocket, 'new Date()');
                break;
            default:
                if (this.checkCompileFlag(true, '不支持的环境变量:' + enName, helper)) {
                    return false;
                }
                break;
        }

        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_BooleanValue extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_BOOLEANVALUE, '布尔值', false, nodeJson);
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
        this.outSocket.type = ValueType.Boolean;
        this.outSocket.inputable = true;
        this.headType = 'empty';
    }

    getValue() {
        return this.outSocket.defval;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var value = this.getValue();
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (value == true || value == 'true') {
            value = true;
        }
        else {
            value = false;
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Query_Sql extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_QUERY_SQL, 'Query', false, nodeJson);
        this.isServerSide = true;
        autoBind(this);

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
                this.targetEntity = project.dataMaster.getDataSourceByCode(tem_arr[1]);
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

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
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
                entity = this.bluePrint.master.project.dataMaster.getDataSourceByCode(entity);
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
        if (this.checkCompileFlag(this.targetEntity == null, '需要选择一个数据实体', helper)) {
            return false;
        }
        if (this.checkCompileFlag(this.targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
            return false;
        }
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
                params_arr.push({ name: theSocket.name.replace('@', ''), value: socketValue });
            }
        }

        var targetEntity = this.targetEntity;
        // make server side code
        var isScalar = targetEntity.isScalar();
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = '_query_' + targetEntity.name;
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
                    sqlInitValue = 'select * from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
                }
            }
            var sqlVarName = this.id + 'sql';
            queryFun.scope.getVar(sqlVarName, true, doubleQuotesStr(sqlInitValue));
            var rcdRltVarName = this.id + '_rcdRlt';
            if (!isScalar) {
                queryFun.pushLine("var " + rcdRltVarName + " = null;");
            }
            var tryBlock = new JSFile_Try('try');
            tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
            queryFun.pushChild(tryBlock);
            if (isScalar) {
                tryBlock.bodyBlock.pushLine("return yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
            }
            else {
                tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
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

        helper.compilingFun.defaultBlock = fetchEndBlock;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, fetchEndBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_CallOnFetchEnd extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CALLONFETCHEND, 'CallOnFechEnd', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inDataSocket = this.inputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 1) {
                this.inErrorSocket = this.inputScokets_arr[1];
            }
        }

        if (this.inDataSocket == null) {
            this.inDataSocket = new NodeSocket('indata', this, true, { type: ValueType.Any });
            this.addSocket(this.inDataSocket);
        }
        if (this.inErrorSocket == null) {
            this.inErrorSocket = new NodeSocket('inerror', this, true, { type: ValueType.Object });
            this.addSocket(this.inErrorSocket);
        }
        this.inDataSocket.label = '结果';
        this.inErrorSocket.label = '错误';

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
        helper.compilingFun.needFetchEndCallBack = true;

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketValues_arr = [];
        for (var si in this.inputScokets_arr) {
            var theSocket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            socketValues_arr.push(socketValue);
        }
        var dataValue = socketValues_arr[0];
        var errValue = socketValues_arr.length > 1 ? socketValues_arr[1] : null;
        if (this.checkCompileFlag(dataValue == null && errValue == null, '需要设置data、error至少一项', helper)) {
            return false;
        }

        var myJSBlock = new FormatFileBlock('ret');
        myJSBlock.pushLine("var ret = callback_final(state, " + dataValue + ", " + errValue + ");");
        myJSBlock.pushLine("return ret == null ? state : ret;");
        belongBlock.pushChild(myJSBlock);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Logical_Operator extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_LOGICAL_OPERATOR, '逻辑', false, nodeJson);
        autoBind(this);

        if (this.LogicalType == null) {
            this.LogicalType = Logical_Operator_and;
        }

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

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: ValueType.String, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: ValueType.String, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = ValueType.String;
                socket.inputable = false;
            });
            this.minInSocketCount = 2;
        }
    }

    getNodeTitle() {
        return '逻辑:' + this.LogicalType;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.LogicalType = this.LogicalType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['LogicalType']);
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: ValueType.String, inputable: false });
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
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            tValue = socketComRet.value;
            if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
                tValue = '(' + tValue + ')';
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : nodeThis.LogicalType) + x;
        });

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Array_Length extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_LENGTH, 'ArrayLen', false, nodeJson);
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
        this.inSocket.type = ValueType.Array;
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Int;
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
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, socketValue + '.length');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Create_Cuserror extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CREATE_CUSERROR, '创建错误', false, nodeJson);
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

        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, '{info:' + socketValue + '}');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_FreshForm extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FRESH_FORM, 'FreshForm', false, nodeJson);
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

        this.inSocket.inputable = false;
        this.inSocket.type = SocketType_CtlKernel;
        this.inSocket.kernelType = M_FormKernel_Type;

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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketValue = null;
        var theSocket = this.inSocket;
        var datalinks_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var selectedKernel = null;
        if (datalinks_arr.length == 0) {
            var selectedCtlid = theSocket.getExtra('ctlid');
            selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
            if (selectedKernel != null) {
                socketValue = selectedCtlid;
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
        if (IsEmptyString(socketValue)) {
            // 探寻目标formkernel
            if (this.checkCompileFlag(this.bluePrint.ctlKernel == null, '无法定目标FORM', helper)) {
                return false;
            }
            var formKernel = this.bluePrint.ctlKernel.searchParentKernel([M_FormKernel_Type], true);
            if (this.checkCompileFlag(formKernel == null, '无法定目标FORM', helper)) {
                return false;
            }
            socketValue = formKernel.id;
            selectedKernel = formKernel;
        }
        var freshFunName = 'fresh_' + socketValue;
        var formDS = selectedKernel.getAttribute(AttrNames.DataSource);
        
        var myJSBlock = new FormatFileBlock('ret');
        if(formDS != null){
            freshFunName = makeFName_pull(selectedKernel);
            myJSBlock.pushLine('setTimeout(() => {' + freshFunName + '();},50);');
        }
        else{
            myJSBlock.pushLine(makeStr_callFun(freshFunName, ['state']));
        }
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

class JSNode_Do_FlowStep extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DO_FLOWSTEP, '执行流程步骤', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.serverFlowSocket);
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

        gFlowMaster.on('changed', this.flwoMasterChanged);
        this.fresh();
    }

    setFlowStep(newValue) {
        this.flowStepCode = newValue ? newValue.code : -1;
        this.fresh();
    }

    flwoMasterChanged() {
        this.fresh();
    }

    fresh() {
        var flowStep = gFlowMaster.findStepByCode(this.flowStepCode);
        this.flowStep = flowStep;
        var paramCount = flowStep ? flowStep.params_arr.length : 0;
        while (this.inputScokets_arr.length > paramCount) {
            this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
        }
        while (this.inputScokets_arr.length < paramCount) {
            this.addSocket(new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: ValueType.String }));
        }
        this.inputScokets_arr.forEach((socket, i) => {
            socket.label = flowStep.params_arr[i];
            socket.fireEvent('changed');
        });
        this.fireEvent(Event_SocketNumChanged);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.flowStepCode = this.flowStepCode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['flowStepCode']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        this.fresh();
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.flowStep == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '需要选择一个流程步骤']);
            return false;
        }

        var blockInServer = belongBlock.getScope().isServerSide;
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var paramValue = socketComRet.value;
                params_arr.push({ name: theSocket.label.replace('@', ''), value: paramValue, inBundleName: this.id + '_' + theSocket.label.replace('@', '') });
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var paramVarName = this.id + 'params_arr';
        var serverSideActName = '_doflowStep_' + this.flowStep.code;
        if (blockInServer) {
            // 已在serverside之中直接生成代码
            belongBlock.pushChild(myServerBlock);
        }
        else {
            var theServerSide = helper.serverSide;
            if (theServerSide != null) {
                var serverSideFun = theServerSide.scope.getFunction(serverSideActName);
                if (serverSideFun == null) {
                    serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
                    theServerSide.initProcessFun(serverSideFun);
                    serverSideFun.scope.getVar(paramVarName, true, 'null');
                    serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
                    theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
                    serverSideFun.bundleCheckBlock = new FormatFileBlock('bundleCheck');
                    serverSideFun.pushChild(serverSideFun.bundleCheckBlock);
                }
                serverSideFun.pushChild(myServerBlock);
            }
        }
        if (params_arr.length > 0) {
            if (!blockInServer) {
                myServerBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
                params_arr.forEach(param => {
                    myServerBlock.pushLine("if(" + postBundleVarName + '.' + param.inBundleName + "==null){return serverhelper.createErrorRet('缺少参数" + param.name + "');}");
                });
            }
        }
        myServerBlock.pushLine(paramVarName + '=[', 1);
        params_arr.forEach((param, i) => {
            if (blockInServer) {
                myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (i + 1) + "', sqlTypes.NVarChar(4000), " + param.value + "),");
            }
            else {
                myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (i + 1) + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + param.inBundleName + "),");
            }
        });
        /*
        for(var pi=params_arr.length; pi <3; ++pi){
            myServerBlock.pushLine("dbhelper.makeSqlparam('参数" + (pi+1) + "', sqlTypes.NVarChar, null),");
        }
        */
        myServerBlock.pushLine("dbhelper.makeSqlparam('流程操作步骤代码', sqlTypes.Int, " + this.flowStep.code + "),");
        myServerBlock.pushLine("dbhelper.makeSqlparam('提交用户', sqlTypes.Int, req.session.g_envVar.userid),");
        myServerBlock.pushLine('];', -1);
        var rcdVarName = this.id + 'rcd';
        myServerBlock.pushLine('var ' + rcdVarName + ';');
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myServerBlock.pushChild(tryBlock);
        tryBlock.bodyBlock.pushLine(rcdVarName + " = yield dbhelper.asynExcute('P007E申请执行步骤'," + paramVarName + ',[dbhelper.makeSqlparam("执行记录代码", sqlTypes.Int)]);');

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
            var initBundleBlock = new FormatFileBlock('initbundle');
            belongBlock.pushChild(myClientBlock);
            params_arr.forEach(param => {
                initBundleBlock.pushLine(param.inBundleName + ':' + param.value + ',');
            });

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            if (params_arr.length > 0) {
                myClientBlock.pushLine("var " + bundleVarName + " = {", 1);
                helper.addInitClientBundleBlock(initBundleBlock);
                myClientBlock.pushChild(initBundleBlock);
                myClientBlock.subNextIndent();
                myClientBlock.pushLine('};');
            }
            else {
                myClientBlock.pushLine("var " + bundleVarName + " = {};");
            }
            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            myClientBlock.pushLine('setTimeout(() => {', 1);
            myClientBlock.pushLine("if(fetchTracer['" + helper.compilingFun.name + "'] != fetchid) return;");
            var dataVarName = 'data_' + this.id;
            var errVarName = 'error_' + this.id;
            myClientBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('}, 50);');

        }

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock);
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            if (clientFlow_links.length > 0) {
                this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock);
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            }
            if (serverFlow_links.length > 0) {
                this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock);
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_Update_table extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_UPDATE_TABLE, 'Update', false, nodeJson);
        autoBind(this);
        this.onlyServerside = true;

        this.addFrameButton(FrameButton_LineSocket, '拉平');
        this.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');

        this.insocketDDC_setting = {
            options_arr: this.getUseDSColumns,
            textAttrName: 'name',
            valueAttrName: 'name'
        }

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outputScokets_arr.length > 0) {
            this.rowCountOutSocket = this.outputScokets_arr[0];
        }
        if (this.rowCountOutSocket == null) {
            this.rowCountOutSocket = new NodeSocket('rowcount', this, false, { label: '行数', type: ValueType.Int });
            this.addSocket(this.rowCountOutSocket);
        }
        this.rowCountOutSocket.label = '行数';

        var si;
        if (this.inputScokets_arr.length > 0) {
            for (si in this.inputScokets_arr) {
                if (this.inputScokets_arr[si].name == 'key') {
                    this.keySocket = this.inputScokets_arr[si];
                }
            }
        }
        if (this.keySocket == null) {
            this.keySocket = new NodeSocket('key', this, true, { type: ValueType.Int });
            this.addSocket(this.keySocket);
        }
        this.keySocket.label = 'KEY';
        this.keySocket.inputable = false;

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.sucessFlowSocket = new NodeFlowSocket('sucess', this, false);
            this.failFlowSocket = new NodeFlowSocket('fail', this, false);
            this.addSocket(this.sucessFlowSocket);
            this.addSocket(this.failFlowSocket);
            this.serverSucessFlowSocket = new NodeFlowSocket('serverSucess', this, false);
            this.serverFailFlowSocket = new NodeFlowSocket('serverFail', this, false);
            this.addSocket(this.serverSucessFlowSocket);
            this.addSocket(this.serverFailFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'sucess':
                        this.sucessFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'fail':
                        this.failFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'serverSucess':
                        this.serverSucessFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'serverFail':
                        this.serverFailFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!IsEmptyString(this.dsCode)) {
            this.setDSCode(this.dsCode);
        }
        else {
            this.dsCode = 0;
        }
        this.inputScokets_arr.forEach(socket => {
            if (socket != this.keySocket) {
                socket.inputable = true;
                socket.inputDDC_setting = this.insocketDDC_setting;
                socket.autoHideInput = false;
            }
        });
        this.sucessFlowSocket.label = '成功';
        this.failFlowSocket.label = '失败';
        this.serverSucessFlowSocket.label = 'server成功';
        this.serverFailFlowSocket.label = 'server失败';
    }

    preRemoveSocket(socket) {
        return socket != this.keySocket;
    }

    getUseDSColumns() {
        var rlt = [];
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS != null && theDS.columns != null) {
            return theDS.columns;
        }
        return rlt;
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

    genInSocket() {
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS == null || theDS.columns == null) {
            return null;
        }
        var useColumn = null;
        for (var ci in theDS.columns) {
            var column = theDS.columns[ci];
            if (column.is_identity) {
                continue;
            }
            if (this.inputScokets_arr.filter(socket => { return socket.defval == column.name; }).length == 0) {
                useColumn = column;
                break;
            }
        }
        if (useColumn) {
            var useSocketName = null;
            var i = 0;
            while (i < 999) {
                useSocketName = 'in_' + i;
                if (this.inputScokets_arr.filter(socket => { return socket.name == useSocketName; }).length == 0) {
                    break;
                }
                i += 1;
            }
            return new NodeSocket(useSocketName, this, true, {
                inputable: true,
                defval: useColumn.name,
                autoHideInput: false,
                inputDDC_setting: this.insocketDDC_setting,
            });
        }
        return null;
    }

    dsSynedHandler() {
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
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var relKernel = this.bluePrint.ctlKernel;
        if (this.checkCompileFlag(relKernel == null || relKernel.type != ButtonKernel_Type, '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
            return false;
        }

        var useDS = g_dataBase.getEntityByCode(this.dsCode);
        if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
            return false;
        }
        var columnProfile_obj = {};
        var identityColumn = null;
        useDS.columns.forEach(column => {
            if (column.is_identity) {
                identityColumn = column;
                return;
            }
            columnProfile_obj[column.name] = {
                name: column.name,
                nullable: column.is_nullable,
                value: null,
            };
        });

        if (this.checkCompileFlag(identityColumn == null, useDS + '没有标识列!', helper)) {
            return false;
        }

        var columnProfile = null;
        // 优先使用设置的节点
        var needUpdateColumns_arr = [];
        var identityColumnValue = '';
        var socketComRet;
        var socketValue;

        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            if (socket == this.keySocket) {
                // 标识字段的设置
                continue;
            }

            columnProfile = columnProfile_obj[socket.defval];
            if (this.checkCompileFlag(columnProfile == null, '第' + (si) + '个输入接口不是有效的列名[' + socket.defval + ']', helper)) {
                return false;
            }
            if (this.checkCompileFlag(columnProfile.value != null, '第' + (si) + '个输入接口重复设置了[' + socket.defval + ']', helper)) {
                return false;
            }
            socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            socketValue = socketComRet.value;
            columnProfile.value = socketValue;
        }
        // 在所属Form中搜集交互类型为读写的可访问控件
        var formKernel = relKernel.searchParentKernel([M_FormKernel_Type], true);
        if (formKernel != null) {
            var accessableLabelKernels = formKernel.searchChildKernel(M_LabeledControlKernel_Type, false, true, [M_FormKernel_Type]);
            if (accessableLabelKernels != null) {
                accessableLabelKernels.forEach(labelKernel => {
                    var interType = labelKernel.getAttribute(AttrNames.InteractiveType);
                    if (interType != EInterActiveType.ReadWrite) {
                        // 只要读写的
                        return;
                    }
                    var interField = labelKernel.getAttribute(AttrNames.InteractiveField);
                    columnProfile = columnProfile_obj[interField];
                    if (columnProfile == null) {
                        var textField = labelKernel.getAttribute(AttrNames.TextField);
                        columnProfile = columnProfile_obj[textField];
                    }
                    if (columnProfile == null || columnProfile.value != null) {
                        // not found or already had values
                        return;
                    }
                    var theEditor = labelKernel.editor;
                    var apiItem = null;
                    if (theEditor.hasAttribute(AttrNames.ValueField)) {
                        apiItem = gFindPropApiItem(theEditor.type, AttrNames.ValueField);
                    }
                    if (apiItem == null) {
                        apiItem = gFindPropApiItem(theEditor.type, AttrNames.TextField);
                    }
                    if (apiItem) {
                        helper.addUseControlPropApi(theEditor, apiItem);
                        columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                    }
                });
            }
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var serverClickFun = null;

        var sqlVarName = this.id + '_sql';
        var paramArrVarName = this.id + '_paramArr';
        var paramArrVarBlock = new FormatFileBlock('paramarr');
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var paramInitBlock = new FormatFileBlock('initparam');
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var initBundleBlock = new FormatFileBlock('initbundle');

        var belongBlockScope = belongBlock.getScope();
        var serverScope = theServerSide ? theServerSide.scope : null;
        var blockInServer = belongBlockScope.isServerSide;

        var serverSideActName = '_' + this.id;
        var paramVarName = this.id + 'params_arr';
        var myServerBlock = new FormatFileBlock('serverblock');

        if (blockInServer) {
            // 已在serverside之中直接生成代码
            belongBlock.pushChild(myServerBlock);
            serverClickFun = belongBlockScope.fun;
        }
        else {
            var temServerSide = theServerSide;
            if(temServerSide == null){
                temServerSide = new CP_ServerSide({});
            }
            if(serverScope == null){
                serverScope = temServerSide.scope;
            }
            serverClickFun = serverScope.getFunction(serverSideActName, true, ['req', 'res']);
            temServerSide.initProcessFun(serverClickFun);
            if (theServerSide == null) {
                helper.appendOutputItem(serverClickFun);
            }
            serverClickFun.scope.getVar(paramVarName, true, 'null');
            serverClickFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverClickFun.pushChild(myServerBlock);
            serverClickFun.bundleCheckBlock = postCheckBlock;
        }

        var updatePartVar = serverClickFun.scope.getVar(this.id + '_update', true, "''");
        var updateSqlVar = serverClickFun.scope.getVar(this.id + '_sql', true, "''");

        myServerBlock.pushChild(postCheckBlock);
        postCheckBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
        myServerBlock.pushChild(paramInitBlock);
        paramInitBlock.pushLine(paramVarName + "=[", 1);

        socketComRet = this.getSocketCompileValue(helper, this.keySocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.RCDKEY)){return serverhelper.createErrorRet("缺少参数[RCDKEY]");}');
        paramInitBlock.pushLine("dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, " + postBundleVarName + '.RCDKEY),');
        initBundleBlock.pushLine('RCDKEY:' + socketComRet.value + ',');

        myServerBlock.pushLine("var " + dataVarName + " = -1;");
        myServerBlock.pushLine("try{", 1);
        myServerBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + updateSqlVar.name + " + ' select @@ROWCOUNT', " + paramVarName + ");");
        myServerBlock.subNextIndent();
        myServerBlock.pushLine("}catch(" + errorVarName + "){", 1);
        myServerBlock.pushChild(serverFailBlock);
        myServerBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        myServerBlock.subNextIndent();
        myServerBlock.pushLine('}');
        myServerBlock.pushChild(serverCompleteBlock);
        myServerBlock.pushLine("return " + dataVarName + ";");

        if (theServerSide) {
            theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
        }

        var updateSqlInitStr = '';
        var needOperator = false;
        for (var columnName in columnProfile_obj) {
            columnProfile = columnProfile_obj[columnName];
            if (columnProfile.value != null) {
                if (columnProfile.isStatic) {
                    updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=' + columnProfile.value;
                }
                else {
                    var postName = ReplaceIfNull(columnProfile.postName, columnProfile.name);
                    if (!columnProfile.nullable) {
                        updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=@' + postName;
                        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){return serverhelper.createErrorRet("缺少参数[' + postName + ']");}');
                    }
                    else {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){', 1);
                        postCheckBlock.pushLine(updatePartVar.name + "+= (" + updatePartVar.name + ".length==0 ? '' : ',') + '[" + columnProfile.name + "]=@" + postName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + postName + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + postName + "),");
                    initBundleBlock.pushLine(postName + ':' + columnProfile.value + ',');
                }
                var keyPos = columnName.indexOf('确认状态');
                if (keyPos != -1) {
                    var prefix = columnName.substring(0, keyPos);
                    var tempColumnProfile = columnProfile_obj[prefix + '确认时间'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '确认时间') + '=getdate()';
                        }
                    }
                    tempColumnProfile = columnProfile_obj[prefix + '确认用户'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            needOperator = true;
                            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '确认用户') + '=@_operator';
                        }
                    }
                }
            }
        }
        if (needOperator) {
            if(paramInitBlock){

                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }
        }

        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        postCheckBlock.pushLine(updateSqlVar.name + ' = "update ' + useDS.name + ' set " + ' + updatePartVar.name + ' + " where [' + identityColumn.name + ']=@RCDKEY";');
        updatePartVar.initVal = singleQuotesStr(updateSqlInitStr);

        var myJSBlock = new FormatFileBlock(this.id);
        var errCheckIf = null;
        helper.compilingFun.hadServerFetch = true;
        if (!blockInServer) {
            // make client
            belongBlock.pushChild(myJSBlock);
            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myJSBlock.pushLine("var " + bundleVarName + " = {", 1);
            helper.addInitClientBundleBlock(initBundleBlock);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myJSBlock.pushChild(callBack_bk);
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
            var fetchEndBlock = new FormatFileBlock('fetchend');
            myJSBlock.pushChild(fetchEndBlock);
            errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
            fetchEndBlock.pushChild(errCheckIf);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('})))}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', blockInServer ? myServerBlock : myJSBlock);
        selfCompileRet.setSocketOut(this.rowCountOutSocket, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            if(this.checkCompileFlag(blockInServer,'节点是从服务端代码节点过来的，所以客户端成功出口无效',helper)){
                return false;
            }
            this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock);
            
        }
        else {
            if(errCheckIf){
                errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }
        }

        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            if(this.checkCompileFlag(blockInServer,'节点是从服务端代码节点过来的，所以客户端失败出口无效',helper)){
                return false;
            }
            this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock);
        }
        else {
            if(errCheckIf){
                errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }
        }

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (serverTrueFlowLinks_arr.length > 0) {
            this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock);
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (serverFalseFlowLinks_arr.length > 0) {
            this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock);
        }
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
JSNodeClassMap[JSNODE_UPDATE_TABLE] = {
    modelClass: JSNODE_Update_table,
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
JSNodeClassMap[JSNODE_ENV_VAR] = {
    modelClass: JSNode_Env_Var,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_BOOLEANVALUE] = {
    modelClass: JSNode_BooleanValue,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_QUERY_SQL] = {
    modelClass: JSNode_Query_Sql,
    comClass: C_JSNode_Query_Sql,
};
JSNodeClassMap[JSNODE_CALLONFETCHEND] = {
    modelClass: JSNode_CallOnFetchEnd,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_LOGICAL_OPERATOR] = {
    modelClass: JSNode_Logical_Operator,
    comClass: C_JSNode_Logical_Operator,
};
JSNodeClassMap[JSNODE_ARRAY_LENGTH] = {
    modelClass: JSNode_Array_Length,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CREATE_CUSERROR] = {
    modelClass: JSNode_Create_Cuserror,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FRESH_FORM] = {
    modelClass: JSNode_FreshForm,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DO_FLOWSTEP] = {
    modelClass: JSNode_Do_FlowStep,
    comClass: C_JSNODE_Do_FlowStep,
};

