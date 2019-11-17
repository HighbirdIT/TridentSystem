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
const JSNODE_DELETE_TABLE = 'delete_table';
const JSNODE_EXCUTE_PRO = 'excute_pro';
const JSNODE_CONTROL_API_PROP = 'controlapiprop';
const JSNODE_CONTROL_API_PROPSETTER = 'controlapipropsetter';
const JSNODE_CONTROL_API_CALLFUN = 'controlapicallfun';
const JSNODE_CALLCUSSCRIPT = 'callcusscript';
const JSNODE_DATEFUN = 'jsdatefun';
const JSNODE_ENV_VAR = 'envvar';
const JSNODE_BOOLEANVALUE = 'booleanvalue';
const JSNODE_QUERY_SQL = 'querysql';
const JSNODE_CALLONFETCHEND = 'callonfetchend';
const JSNODE_CREATE_CUSERROR = 'createcuserror';
const JSNODE_FRESH_FORM = 'freshform';
const JSNODE_DO_FLOWSTEP = 'doflowstep';
const JSNODE_JUMP_PAGE = 'jumppage';
const JSNODE_OPENEXTERNAL_PAGE = 'openexternalpage';
const JSNODE_MSG_SENDTOPARENT = 'msgsendtoparent';
const JSNODE_CLOSETOPFRAME = 'closetopframe';
const JSNODE_POPMESSAGEBOX = 'popmessagebox';
const JSNODE_CLOSEMESSAGEBOX = 'closemessagebox';
const JSNODE_HIDEMESSAGEBOX = 'hidemessagebox';
const JSNODE_SHOWMESSAGEBOX = 'showmessagebox';
const JSNODE_SETMESSAGEBOXTOLOADING = 'setmessageboxtoloading';
const JSNODE_CLOSEPOPPER = 'closepopper';
const JSNODE_POP_PAGE = 'popPage';
const JSNODE_CLOSE_PAGE = 'closePage';
const JSNODE_GETPAGE_ENTRYPARAM = 'getpageenterparam';
const JSNODE_BATCH_CONTROL_API_PROPSETTER = 'batchcontrolapipropsetter';
const JSNODE_GETSTEPDATA = 'getstepdata';
const JSNODE_HASHFORM_DATAROW = 'hashformdatarow';
const JSNODE_ATTACHMENT_PRO = 'attachmentpro';

const JSNODE_DD_MAP_SEARCH = 'ddmapsearch';
const JSNODE_DD_NAV_CLOSE = 'ddnavclose';
const JSNODE_DD_GETGEO_LOCATION = 'ddgetgeolocation';

const JSNODE_STRING_LENGTH = 'stringlength';
const JSNODE_STRING_SUBSTRING = 'stringsubstring';
const JSNODE_STRING_SUBSTR = 'stringsubstr';
const JSNODE_STRING_INDEXOF = 'stringindexOf';
const JSNODE_ISEMPTYSTRING = 'isemptystring';
const JSNODE_ISEMPTYARRAY = 'isemptyarray';

const JSNODE_CUSOBJECT_NEW = 'cusobjectnew';
const JSNODE_CUSOBJECT_VISIT = 'cusobjectvisit';

const JSNODE_ARRAY_NEW = 'arraynew';
const JSNODE_ARRAY_LENGTH = 'arraylength';
const JSNODE_ARRAY_FOR = 'arrayfor';

const JSNODE_PARSEINT = 'parseInt';
const JSNODE_PARSEFLOAT = 'parseFloat';
const JSNODE_ISNAN = 'isnan';

const JSNODE_MATH_RANDINT = 'mathrandint';

const JSDEF_VAR = 'def_variable';
const JSNODE_SETTIMEOUT = 'settimeout';

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
        if (socketOut.data.parent != belongBlock && socketOut.data.getScope() == belongBlock.getScope()) {
            var clonedFun = (cloned, orgin) => {
                if (cloned instanceof FormatFileBlock) {
                    if (helper.clientInitBundleBlocks_arr.indexOf(orgin) != -1) {
                        cloned.params_map = orgin.params_map;
                        helper.addInitClientBundleBlock(cloned);
                    }
                }
            }
            belongBlock.pushChild(socketOut.data.clone(clonedFun));
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

    isInReducer(usePreNodes_arr, startIsInReducer) {
        var group = this.bluePrint.group;
        for (var upi = usePreNodes_arr.length - 1; upi >= 0; --upi) {
            var preNode = usePreNodes_arr[upi];
            if (preNode.type == JSNODE_POP_PAGE || preNode.type == JSNODE_POPMESSAGEBOX || preNode.type == JSNODE_DD_MAP_SEARCH || preNode.type == JSNODE_SETTIMEOUT) {
                return false;
            }
            if (preNode.type == JSNODE_START) {
                if(startIsInReducer != null){
                    return startIsInReducer;
                }
                switch (group) {
                    case EJsBluePrintFunGroup.CtlAttr:
                    case EJsBluePrintFunGroup.CtlValid:
                    case EJsBluePrintFunGroup.Custom:
                        return true;
                }
            }
            if (preNode.type == JSNODE_CALLCUSSCRIPT) {
                if (preNode.hadServerFetch) {
                    return false;   // 自订脚本如果内部有fetch的话，返回时是离开时了fetchend环境的
                }
            }
            if (preNode.hadServerFetch) {
                return true;
            }
            if (preNode.serverFun) {
                return true;
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
        if (this.isOutput) {
            rlt.isOutput = this.isOutput;
        }
        if (this.isfixed != null) {
            rlt.isfixed = this.isfixed;
        }
        if (this.index != null) {
            rlt.index = this.index;
        }
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['name', 'valType', 'isParam', 'default', 'isfixed', 'index', 'isOutput']);
    }

    setProp(data) {
        if (this.isfixed) {
            return;
        }
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
            this.isParam = data.isParam == '1';
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
        NodeEditor(this);

        this.nodes_arr = [];
        this.vars_arr = [];
        this.returnVars_arr = [];
        this.output
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
            assginObjByProperties(this, bluePrintJson, ['type', 'code', 'name', 'startNodeId', 'editorLeft', 'editorTop', 'group', 'ctlID', 'uuid']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(varJson => {
                    if (createHelper && createHelper.restoreHelper) {
                        createHelper.restoreHelper.trasnlateJson(varJson);
                    }
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
            this.linkPool.restoreFromJson(bluePrintJson.links_arr, createHelper);
        }
        if (IsEmptyString(this.uuid)) {
            this.uuid = guid2();
        }
        if (this.type == null) {
            console.error('new JSNode_BluePrint type is null');
        }
        this.id = this.code;
        if (this.group == null) {
            console.error('new JSNode_BluePrint group is null');
            this.group = 'custom';
        }

        if (this.group == EJsBluePrintFunGroup.Custom) {
            if (this.returnVars_arr.length == 0) {
                var defRetVar = this.createEmptyVariable(true);
                defRetVar.name = 'retVal';
                defRetVar.needEdit = false;
            }
        }

        if (this.startNode == null) {
            this.startNode = new JSNode_Start({}, this);
        }
        else {
            this.startNode.isConstNode = true;
        }
        createHelper.fireEvent('complete', createHelper);
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
        var foundVar;
        if (varNode.isOutput) {
            foundVar = this.returnVars_arr.find(item => { return item.name == varNode.name });
        }
        else {
            foundVar = this.vars_arr.find(item => { return item.name == varNode.name });
        }
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
        if (varNode.isOutput) {
            this.returnVars_arr.push(varNode);
        }
        else {
            this.vars_arr.push(varNode);
        }
        this.fireEvent('varChanged');
    }

    getVariableByName(varName) {
        return this.vars_arr.find(item => { return item.name == varName });
    }

    createEmptyVariable(isOutput) {
        var varName;
        for (var i = 0; i < 999; ++i) {
            varName = '未命名_' + i;
            if (this.getVariableByName(varName) == null)
                break;
        }
        var initData = { name: varName, valType: ValueType.String };
        if (isOutput) {
            initData.isOutput = true;
        }
        var rlt = new JSDef_Variable(initData, this);
        rlt.needEdit = true;
        return rlt;
    }

    setFixParam(names_arr) {
        this.vars_arr.filter(v => { return v.isParam; }).forEach(v => {
            var index = names_arr.indexOf(v.name);
            if (index == -1) {
                v.isfixed = false;
                this.removeVariable(v);
            }
            else {
                v.index = index;
                v.isfixed = true;
                v.isParam = true;
            }
        });
        names_arr.forEach((n, i) => {
            new JSDef_Variable({ name: n, valType: ValueType.String, isfixed: true, isParam: true, index: i }, this);
        });
    }

    getParamNames() {
        return this.vars_arr.filter(varData => {
            return varData.isParam;
        }).map(p => { return p.name; });
    }

    removeVariable(varData) {
        var index = this.vars_arr.indexOf(varData);
        if (index != -1) {
            if (varData.isfixed) {
                return;
            }
            this.vars_arr.splice(index, 1);
            varData.removed = true;
        }
        else {
            index = this.returnVars_arr.indexOf(varData);
            if (index != -1) {
                this.returnVars_arr.splice(index, 1);
                varData.removed = true;
            }
        }
        if (varData.removed) {
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
                if (createHelper && createHelper.restoreHelper) {
                    createHelper.restoreHelper.trasnlateJson(nodeJson);
                }
                var newNode = self.genNodeByJson(parentNode, nodeJson, createHelper);
                if (newNode) {
                    rlt_arr.push(newNode);
                }
            });
        }
        return rlt_arr;
    }

    getJson(jsonProf) {
        var self = this;
        // save base info
        var theJson = {
            code: self.id,
            startNodeId: this.startNode.id,
            name: this.name,
            type: this.type,
            group: this.group,
            uuid: this.uuid,
        }
        if (jsonProf == null) {
            jsonProf = new AttrJsonProfile();
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
            varJson_arr.push(varData.getJson(jsonProf));
        });
        this.returnVars_arr.forEach(varData => {
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


        return theJson;
    }


    compile(compilHelper) {
        var ctlKernel = this.master.project.getControlById(this.ctlID);
        if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid || this.group == EJsBluePrintFunGroup.GridRowBtnHandler) {
            if (ctlKernel == null) {
                compilHelper.logManager.error('蓝图关联控件' + this.ctlID + '无法找到');
                return false;
            }
            this.ctlKernel = ctlKernel;
            if (ctlKernel.id == 'M_LC_22') {
                //console.log('wer');
            }
        }
        var haveDoneTip = true;
        var muteMode = false;
        var funName = this.name.replace('#', '_');
        var useScope = compilHelper.scope;
        var nomsgbox = false;
        if (compilHelper.config) {
            if (compilHelper.config.funName) {
                funName = compilHelper.config.funName;
            }
            if (compilHelper.config.scope) {
                useScope = compilHelper.config.scope;
            }
            nomsgbox = compilHelper.config.nomsgbox == true;
            haveDoneTip = compilHelper.config.haveDoneTip != false;
            muteMode = compilHelper.config.muteMode == true;
        }
        if (this.group == EJsBluePrintFunGroup.Custom) {
            funName = this.bluePrint.code;
        }
        var theFun = useScope.getFunction(funName, true);
        compilHelper.compilingFun = theFun;
        var fetchKeyVarValue = singleQuotesStr(funName);
        var params_arr = [];
        var paramVars_arr = [];
        this.vars_arr.forEach(varData => {
            if (varData.isParam) {
                paramVars_arr.push(varData);
            }
            else {
                theFun.scope.getVar(varData.name, true, varData.default);
            }
        });
        if (paramVars_arr.length > 0) {
            paramVars_arr.sort((a, b) => {
                return a.index > b.index;
            });
            params_arr = paramVars_arr.map(x => { return x.name; });
            if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.GridRowBtnHandler) {
                compilHelper.logManager.error('本蓝图种类不允许出现参数');
                return false;
            }
        }
        var orginParams_arr = params_arr.concat();
        theFun.orginParams_arr = orginParams_arr;
        if (this.group == EJsBluePrintFunGroup.Custom) {
            params_arr.push('_callback');
        }
        var ret = this.startNode.compile(compilHelper, [], theFun.bodyBlock);
        if (ret == false) {
            return false;
        }
        var defRetValue = null;
        if (this.startNode.defRetSocket) {
            var defRetSocketComRet = this.startNode.getSocketCompileValue(compilHelper, this.startNode.defRetSocket, [], theFun.body, true, true);
            if (defRetSocketComRet == false) {
                return false;
            }
            defRetValue = defRetSocketComRet.value;
        }
        compilHelper.defRetValue = defRetValue;

        compilHelper.compileEnd();
        if (this.group == EJsBluePrintFunGroup.CtlValid) {
            params_arr = ['nowValue', 'comeState', 'comeValidErrState'];
            if (compilHelper.clientSide) {
                compilHelper.clientSide.setCusValidCheckerBlock.pushLine("gCusValidChecker_map['" + ctlKernel.id + "'] = " + theFun.name + ";");
            }
        }
        else {
            if (compilHelper.config && compilHelper.config.params) {
                params_arr = compilHelper.config.params;
            }
        }

        if (!IsEmptyObject(compilHelper.usePage_map)) {
            for (var pageID in compilHelper.usePage_map) {
                var pageParams_arr = compilHelper.usePage_map[pageID].params_arr;
                pageParams_arr.forEach(pageParam => {
                    theFun.scope.getVar(pageID + '_' + pageParam.name, true, makeStr_callFun('getPageEntryParam', [singleQuotesStr(pageID), singleQuotesStr(pageParam.name), pageParam.defVal]));
                });
            }
        }
        if (!IsEmptyObject(compilHelper.useUrlVar_map)) {
            for (var varName in compilHelper.useUrlVar_map) {
                theFun.scope.getVar(varName, true, makeStr_callFun('getQueryVariable', [singleQuotesStr(varName), compilHelper.useUrlVar_map[varName]]));
            }
        }
        if (!IsEmptyObject(compilHelper.useEnvVars)) {
            for (var pageID in compilHelper.usePage_map) {
                var pageParams_arr = compilHelper.usePage_map[pageID].params_arr;
                pageParams_arr.forEach(pageParam => {
                    theFun.scope.getVar(pageID + '_' + pageParam.name, true, makeStr_callFun('getPageEntryParam', [singleQuotesStr(pageID), singleQuotesStr(pageParam.name), pageParam.defVal]));
                });
            }
        }

        var ctlIsUserControl = ctlKernel ? ctlKernel.type == UserControlKernel_Type : false;
        var belongUserControl = !ctlKernel ? null : ctlKernel.searchParentKernel(UserControlKernel_Type, true);
        var belongFormControl = !ctlKernel ? null : ctlKernel.searchParentKernel(M_FormKernel_Type, true);
        var reactParentControl = !ctlKernel ? null : ctlKernel.getReactParentKernel(true);
        var baseBundleInitBlock = new FormatFileBlock('baseBundle');
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
        var isOnclickFun = false;
        var isOnchangedFun = false;
        var isOnmouseDownFun = false;
        var isOnloadFun = false;
        var isNavieFun = false;
        if (this.group == EJsBluePrintFunGroup.CtlEvent) {
            isOnclickFun = this.name == ctlKernel.id + '_' + AttrNames.Event.OnClick;
            isOnchangedFun = this.name == ctlKernel.id + '_' + AttrNames.Event.OnChanged;
            isOnloadFun = this.name == ctlKernel.id + '_' + AttrNames.Event.OnLoad;
            isOnmouseDownFun = this.name == ctlKernel.id + '_' + AttrNames.Event.OnMouseDown;

            isNavieFun = isOnclickFun || isOnchangedFun || isOnloadFun || isOnmouseDownFun;
        }
        if (this.group == EJsBluePrintFunGroup.CtlAttr || this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlValid || this.group == EJsBluePrintFunGroup.GridRowBtnHandler || this.group == EJsBluePrintFunGroup.CtlFun) {
            var hadCallParm = this.group == EJsBluePrintFunGroup.CtlAttr;
            if (!isNavieFun && (this.group == EJsBluePrintFunGroup.CtlEvent || this.group == EJsBluePrintFunGroup.CtlFun) && ctlKernel.type == UserControlKernel_Type) {
                hadCallParm = true;
            }
            if (!hadCallParm) {
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    theFun.scope.getVar(VarNames.State, true, 'comeState ? comeState : store.getState();');
                }
                else if (params_arr.indexOf('state') == -1) {
                    theFun.scope.getVar(VarNames.State, true, 'store.getState()');
                }
            }

            if (this.group == EJsBluePrintFunGroup.CtlEvent) {
                if (ctlKernel.type == M_FormKernel_Type) {
                    if (
                        this.name == ctlKernel.id + '_' + AttrNames.Event.OnSelectedChanged ||
                        this.name == ctlKernel.id + '_' + AttrNames.Event.OnRowChanged ||
                        this.name == ctlKernel.id + '_' + AttrNames.Event.OnDataSourceChanged
                    ) {
                        theFun.scope.getVar(ctlKernel.id + '_path', true, 'fullPath');
                    }
                }
                else if (ctlKernel.type == MFileUploader_Type) {
                    if (
                        this.name == ctlKernel.id + '_' + AttrNames.Event.OnUploadComplete
                    ) {
                        theFun.scope.getVar(ctlKernel.id + '_path', true, 'fullPath');
                    }
                }
                else if (ctlKernel.type == ButtonKernel_Type) {
                    theFun.scope.getVar(ctlKernel.id + '_path', true, "ev == null ? null : getAttributeByNode(ev.target,'ctl-fullpath')");
                }
                else if (ctlKernel.type == UserControlKernel_Type && !isNavieFun) {
                    theFun.scope.getVar(ctlKernel.id + '_path', true, "getBelongUserCtlPath(_path)");
                    orginParams_arr.forEach(p => {
                        theFun.scope.getVar(p, true, "_params." + p);
                    });
                }
                else {
                    if (isOnchangedFun) {
                        // ctl onchanged fun
                        theFun.scope.getVar(ctlKernel.id + '_path', true, VarNames.ParentPath + "+'." + ctlKernel.id + "'");
                    }
                    else if (isOnmouseDownFun) {
                        theFun.scope.getVar(ctlKernel.id + '_path', true, "ev == null ? null : getAttributeByNode(ev.target,'ctl-fullpath')");
                    }
                }
                if (belongUserControl) {
                    // 自订控件中的按钮
                    theFun.scope.getVar(belongUserControl.id + '_path', true, "getBelongUserCtlPath(" + ctlKernel.id + "_path" + (ctlIsUserControl ? ',' + singleQuotesStr(ctlKernel.id) : '') + ")");  // 本控件也是自订控件时，获取所属自订控件路径需要特殊处理
                    theFun.scope.getVar(belongUserControl.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, belongUserControl.id + '_path', '{}']));
                }
            }
            if (this.group == EJsBluePrintFunGroup.CtlFun) {
                if (ctlKernel.type == UserControlKernel_Type) {
                    params_arr = ['state,_params,_oldParams,_path'];
                    theFun.scope.getVar(ctlKernel.id + '_path', true, "getBelongUserCtlPath(_path)");
                    orginParams_arr.forEach(p => {
                        theFun.scope.getVar(p, true, "_params." + p);
                    });
                }
            }
            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                fetchKeyVarValue = VarNames.FullParentPath + '+' + singleQuotesStr('.' + funName);
                params_arr = [VarNames.State, VarNames.Bundle, VarNames.FullParentPath];
                //theFun.scope.getVar(belongFormControl.id + "_path", true, 'this.props.fullPath');
                if (belongUserControl) {
                    theFun.scope.getVar(belongUserControl.id + '_path', true, "getBelongUserCtlPath(" + VarNames.FullParentPath + ")");
                    theFun.scope.getVar(belongUserControl.id + '_state', true, VarNames.State + '._isroot != null ? ' + makeStr_callFun('getStateByPath', [VarNames.State, belongUserControl.id + '_path', '{}']) + ' : ' + VarNames.State);
                }
            }
            else if (this.group == EJsBluePrintFunGroup.GridRowBtnHandler) {
                params_arr = [VarNames.RowKey, VarNames.CallBack];
                if (compilHelper.config) {
                    if (compilHelper.config.key == 'insert') {
                        params_arr = [VarNames.CallBack];
                        theFun.scope.getVar(VarNames.RowKey, true, singleQuotesStr('new'));
                    }
                    fetchKeyVarValue = makeStr_AddAll(singleQuotesStr(ctlKernel.parent.id + '_' + compilHelper.config.actLabel + '_'), '+', VarNames.RowKey);
                }
                else {
                    fetchKeyVarValue = makeStr_AddAll(singleQuotesStr(ctlKernel.id + funName + '_'), '+', VarNames.RowKey);
                }
                theFun.scope.getVar(belongFormControl.id + "_path", true, 'this.props.fullPath');
                theFun.scope.getVar(belongFormControl.id + "_state", true, makeStr_callFun('getStateByPath', [VarNames.State, 'this.props.fullPath', '{}']));
                if (belongUserControl) {
                    // 自订控件中的按钮
                    theFun.scope.getVar(belongUserControl.id + '_path', true, "getBelongUserCtlPath(this.props.fullPath)");
                    theFun.scope.getVar(belongUserControl.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, belongUserControl.id + '_path', '{}']));
                }
            }
            var validFormSelectBlock = new FormatFileBlock('validFormSelectBlock');
            var parentLabledCtl;
            for (var formId in compilHelper.useForm_map) {
                var useFormData = compilHelper.useForm_map[formId];
                var isGridForm = useFormData.formKernel.isGridForm();
                var isListForm = useFormData.formKernel.isListForm();
                var selectMode = useFormData.formKernel.getAttribute(AttrNames.SelectMode);
                var isSingleSelectMode = selectMode == ESelectMode.Single;
                var isMultiSelectMode = selectMode == ESelectMode.Multi;

                ctlParentStateVarName = null;
                ctlStateVarName = null;

                var formStateVarName = formId + '_state';
                var formNowRowStateVarName = formId + '_' + VarNames.RowState;
                var formNowRecordVarName = formId + '_' + VarNames.NowRecord;
                var formPathVarName = formId + '_path';
                var selectedRowsVarName = formId + '_' + VarNames.SelectedRows_arr;
                var isUseFormCtl = !IsEmptyObject(useFormData.useControls_map);
                var isUseFormColumn = !IsEmptyObject(useFormData.useColumns_map);
                var formPath = useFormData.formKernel.getStatePath();

                if (belongUserControl) {
                    formPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + formPath);
                    initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                }
                else {
                    formPath = singleQuotesStr(formPath);
                    initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                }
                theFun.scope.getVar(formPathVarName, true, formPath);
                theFun.scope.getVar(formStateVarName, true, initValue);
                var controlStateDelayGet = false;


                if (isUseFormCtl || isUseFormColumn) {
                    if (isGridForm || isListForm) {
                        if (useFormData.useContextRow) {
                            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                                theFun.scope.getVar(VarNames.RowKeyInfo_map, true, 'getRowKeyMapFromPath(' + VarNames.FullParentPath + ')');
                                theFun.scope.getVar(VarNames.RowKey, true, VarNames.RowKeyInfo_map + '.' + formId);
                            }
                            if (this.group == EJsBluePrintFunGroup.CtlEvent) {
                                theFun.scope.getVar(VarNames.RowKeyInfo_map, true, "getRowKeyMapFromPath(" + ctlKernel.id + "_path)");
                                theFun.scope.getVar(VarNames.RowKey, true, VarNames.RowKeyInfo_map + '.' + formId);
                            }
                            theFun.scope.getVar(formNowRowStateVarName, true, makeStr_callFun('getStateByPath', [formStateVarName,"'row_' + " + VarNames.RowKey, '{}']));
                            if (isUseFormColumn) {
                                theFun.scope.getVar(formNowRecordVarName, true, makeStr_callFun('getRecordFromRowKey',[formPathVarName,VarNames.RowKey]));
                            }
                        }
                        if (useFormData.useSelectedRow) {
                            theFun.scope.getVar(selectedRowsVarName, true, makeStr_callFun('GetFormSelectedRows', [formStateVarName, singleQuotesStr(useFormData.formKernel.getAttribute(AttrNames.KeyColumn))]));
                            validFormSelectBlock.pushLine(makeStr_AddAll('if(', selectedRowsVarName, '==null || ', selectedRowsVarName, ".length == 0){"), 1);
                            if (!muteMode) {
                                validFormSelectBlock.pushLine(makeStr_AddAll("SendToast('需要在[" + useFormData.formKernel.getAttribute(AttrNames.Title) + "]中选择" + (isSingleSelectMode ? '一条' : '几条') + "数据。', EToastType.Warning);"));
                            }
                            validFormSelectBlock.pushLine("return" + (IsEmptyString(defRetValue) ? '' : ' ' + defRetValue) + ";", -1);
                            validFormSelectBlock.pushLine('}');

                            if (isSingleSelectMode) {
                                if (isUseFormColumn) {
                                    theFun.scope.getVar(formNowRecordVarName, true);
                                    validFormSelectBlock.pushLine(formNowRecordVarName + '=' + makeStr_callFun('getRecordFromRowKey',[formPathVarName,selectedRowsVarName + '[0]'],';'));
                                }
                            }
                            if (isUseFormCtl) {
                                theFun.scope.getVar(formNowRowStateVarName, true);
                                if (isSingleSelectMode) {
                                    controlStateDelayGet = true;
                                    validFormSelectBlock.pushLine(makeStr_AddAll(formNowRowStateVarName, '=', formStateVarName, "['row_' + ", selectedRowsVarName, '[0]];'));
                                }
                            }
                        }
                    }
                    else {
                        if (isUseFormColumn) {
                            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                                theFun.scope.getVar(formNowRecordVarName, true, makeStr_AddAll(VarNames.Bundle, '==null || ', VarNames.Bundle, "['" + formNowRecordVarName, "'] == null ? ", formStateVarName + '.' + VarNames.NowRecord, ' : ', VarNames.Bundle, "['" + formNowRecordVarName, "']"));
                            }
                            else {
                                theFun.scope.getVar(formNowRecordVarName, true, formStateVarName + '.' + VarNames.NowRecord);
                            }
                        }
                    }
                }

                if (!IsEmptyObject(useFormData.useControls_map)) {
                    for (usectlid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[usectlid];
                        ctlStateVarName = usectlid + '_state';
                        if (useCtlData.kernel.parent == null) {
                            // usercontrol template
                            //initValue = VarNames.State;
                            if (theFun.scope.getVar(ctlStateVarName) == null) {
                                console.error('useCtlData.kernel.parent == null 错误');
                                return;
                            }
                        }
                        var useCtlBelongStateVarName = useFormData.formKernel.isKernelInRow(useCtlData.kernel) ? formNowRowStateVarName : formStateVarName;
                        initValue = makeStr_getStateByPath(useCtlBelongStateVarName, singleQuotesStr(usectlid), '{}');
                        if (controlStateDelayGet) {
                            theFun.scope.getVar(ctlStateVarName, true);
                            validFormSelectBlock.pushLine(makeLine_Assign(ctlStateVarName, initValue));
                        }
                        else {
                            theFun.scope.getVar(ctlStateVarName, true, initValue);
                        }
                        theFun.scope.getVar(ctlStateVarName, true, initValue);
                        ctlParentStateVarName = null;

                        parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                        if (parentLabledCtl) {
                            ctlParentStateVarName = parentLabledCtl.id + '_state';
                            initValue = makeStr_getStateByPath(useCtlBelongStateVarName, singleQuotesStr(parentLabledCtl.id), '{}');
                            if (controlStateDelayGet) {
                                theFun.scope.getVar(ctlParentStateVarName, true);
                                validFormSelectBlock.pushLine(makeLine_Assign(ctlParentStateVarName, initValue));
                            }
                            else {
                                theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                            }
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
                            }
                            if (propApiitem.getInitValueFun) {
                                initValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                            }
                            if (controlStateDelayGet) {
                                theFun.scope.getVar(varName, true);
                                validFormSelectBlock.pushLine(makeLine_Assign(varName, initValue));
                            }
                            else {
                                theFun.scope.getVar(varName, true, initValue);
                            }
                            if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                                needCheckProps_map[varName] = 1;
                                nullableChecker = ctlParentStateVarName && useCtlData.kernel.parent.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
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
                    if (theFun.scope.getVar(formNowRecordVarName) != null) {
                        needCheckVars_arr.push(formNowRecordVarName);
                        for (var columnName in useFormData.useColumns_map) {
                            var useFormColumn = useFormData.useColumns_map[columnName];
                            if (useFormColumn.serverFuns_arr.length > 0) {
                                useFormColumn.serverFuns_arr.forEach(serverFun => {
                                    serverFun.bundleCheckBlock.pushLine('if(req.body.' + VarNames.Bundle + '.' + formId + '_' + columnName + "==null){return serverhelper.createErrorRet('缺少参数" + columnName + "');}");
                                });
                                baseBundleInitBlock.pushLine(formId + '_' + columnName + ':' + formNowRecordVarName + "['" + columnName + "']" + ',');
                            }
                        }
                    }
                }
            }
            for (usectlid in compilHelper.useGlobalControls_map) {
                useCtlData = compilHelper.useGlobalControls_map[usectlid];
                ctlStateVarName = usectlid + '_state';
                initValue = null;
                if (useCtlData.kernel.parent == null) {
                    // usercontrol template
                    if (theFun.scope.getVar(ctlStateVarName) == null) {
                        console.error('useCtlData.kernel.parent == null 错误');
                        return;
                    }
                    /*
                    if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                        initValue = VarNames.State;
                    }
                    */
                }
                else {
                    if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                        initValue = "bundle != null && bundle['" + ctlStateVarName + "'] != null ? bundle['" + ctlStateVarName + "'] : " + makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                    }
                    else {
                        if (belongUserControl) {
                            initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                        }
                        else {
                            initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                        }
                    }
                }

                if (initValue) {
                    theFun.scope.getVar(ctlStateVarName, true, initValue);
                }

                ctlParentStateVarName = null;
                parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                if (parentLabledCtl) {
                    ctlParentStateVarName = parentLabledCtl.id + '_state';
                    if (belongUserControl) {
                        initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(parentLabledCtl.getStatePath()), '{}');
                    }
                    else {
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(parentLabledCtl.getStatePath()), '{}');
                    }
                    theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                }

                for (propName in useCtlData.useprops_map) {
                    propApiitem = useCtlData.useprops_map[propName];
                    varName = usectlid + '_' + propApiitem.stateName;
                    var propInitValue = ctlStateVarName + '.' + propApiitem.stateName;
                    if (propApiitem.getInitValueFun) {
                        propInitValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                    }
                    theFun.scope.getVar(varName, true, propInitValue);
                    if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                        needCheckProps_map[varName] = 1;
                        nullableChecker = ctlParentStateVarName && useCtlData.kernel.parent.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
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
        var finalCallBack_bk = new FormatFileBlock('finalcallback');
        theFun.headBlock.pushChild(finalCallBack_bk);
        if (validFormSelectBlock) {
            theFun.headBlock.pushChild(validFormSelectBlock);
        }
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
            var gridRowKeyVars_map = {};
            switch (ctlKernel.type) {
                case M_FormKernel_Type:
                    gridRowKeyVars_map[ctlKernel.id] = VarNames.RowKey;
                    break;
                default:
                    var belongForm = ctlKernel.searchParentKernel(M_FormKernel_Type, true);
                    if (belongForm) {
                        gridRowKeyVars_map[belongForm.id] = VarNames.RowKey;
                    }
                    break;
            }

            needCheckVars_arr.forEach(varObj => {
                if (typeof varObj === 'string') {
                    checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varObj + ')';
                    return;
                }
                var valueType = 'string';
                if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                    valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                }

                var infoStatePath = varObj.kernel.getStatePath('invalidInfo', '.', gridRowKeyVars_map);
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    validKernelBlock.pushLine("if(validErrState.hasOwnProperty('" + infoStatePath + "')){validErr=validErrState['" + infoStatePath + "'];}");
                    validKernelBlock.pushLine('else{', 1);
                }
                var validUseStateName = VarNames.State;
                if (this.group == EJsBluePrintFunGroup.CtlValid) {
                    validUseStateName = 'comeState';
                }
                else {
                    if (belongUserControl) {
                        validUseStateName = belongUserControl.id + '_state';
                    }
                }
                validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [
                    validUseStateName,
                    varObj.visibleStateVar,
                    varObj.ctlStateVar,
                    varObj.valueVar,
                    singleQuotesStr(valueType),
                    varObj.nullable == null ? 'true' : varObj.nullable.toString(),
                    singleQuotesStr(varObj.kernel.id),
                    validErrStateVar.name
                ]) + ";");
                validKernelBlock.pushLine(validErrStateVar.name + "['" + infoStatePath + "']=validErr;");
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
                if (muteMode) {
                    // 静默模式下前置条件不足的提示也不要了
                    checkVarValidIf.trueBlock.pushLine("hadValidErr = true;");
                }
                else{
                    if(IsEmptyString(defRetValue)){
                        checkVarValidIf.trueBlock.pushLine("callback_final(state, null, {info:gPreconditionInvalidInfo});");
                        checkVarValidIf.trueBlock.pushLine('return;');
                    }
                    else{
                        checkVarValidIf.trueBlock.pushLine('return ' + defRetValue + ';');
                    }
                }
            }
            theFun.headBlock.pushChild(validKernelBlock);
            var stateParam = 'null';
            switch (this.group) {
                case EJsBluePrintFunGroup.CtlAttr:
                    stateParam = VarNames.State;
                    break;
            }
            if (this.group == EJsBluePrintFunGroup.CtlAttr) {
                theFun.headBlock.pushLine("if(hadValidErr){",1);
                if(IsEmptyString(defRetValue)){
                    theFun.headBlock.pushLine("callback_final(" + stateParam + ", null, {info:gPreconditionInvalidInfo});");
                    theFun.headBlock.pushLine('return;');
                }
                else{
                    theFun.headBlock.pushLine('return ' + defRetValue + ';');
                }
                theFun.headBlock.subNextIndent();
                theFun.headBlock.pushLine('}');
            }
            else {
                theFun.headBlock.pushLine("if(hadValidErr){return callback_final(" + stateParam + ", null, {info:gPreconditionInvalidInfo});}");
            }
        }
        if (theFun.needFetchEndCallBack) {
            // 需要callbackmain
            needFinalCallback = true;
        }
        var startFtech_bk = null;
        if (theFun.hadServerFetch && this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            needFinalCallback = true;

            theFun.headBlock.pushLine("var fetchid = Math.round(Math.random() * 999999);");
            if (compilHelper.config && !IsEmptyString(compilHelper.config.fetchKey)) {
                fetchKeyVarValue = compilHelper.config.fetchKey;
            }
            theFun.headBlock.pushLine("var " + VarNames.FetchKey + " = " + fetchKeyVarValue + ";");
            theFun.headBlock.pushLine("fetchTracer[" + VarNames.FetchKey + "] = fetchid;");
            theFun.headBlock.pushLine('var ' + VarNames.BaseBunlde + '={', 1);
            theFun.headBlock.pushChild(baseBundleInitBlock);
            theFun.headBlock.subNextIndent();
            theFun.headBlock.pushLine('};');
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

        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            needFinalCallback = false;  // 自订方法使用的是_callBack参数
            compilHelper.bNeedMsgBox = false;   // 自订方法无需msgbox

            if (theFun.hadServerFetch) {
                theFun.headBlock.pushLine('var ' + VarNames.BaseBunlde + '={', 1);
                theFun.headBlock.pushChild(baseBundleInitBlock);
                theFun.headBlock.subNextIndent();
                theFun.headBlock.pushLine('};');
            }
        }

        var msgBoxCreated = false;
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
                msgBoxCreated = true;
                var ctlName = ctlKernel.getAttribute(AttrNames.Name);
                if (startFtech_bk) {
                    if (!nomsgbox) {
                        startFtech_bk.pushLine(makeLine_Assign(msgBoxVarName, "PopMessageBox('',EMessageBoxType." + (muteMode ? 'Blank' : 'Loading') + ", '" + ctlName + "')"));
                    }
                }

                if (needCheckVars_arr.length > 0) {
                    var pathStr = "''";
                    if (belongUserControl) {
                        pathStr = belongUserControl.id + '_path';
                    }
                    setInvalidStateBlock.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(validErrState, " + pathStr + "));}");
                    setInvalidStateBlock.pushLine("else{setManyStateByPath(state," + pathStr + ",validErrState);}");
                    setInvalidStateBlock.pushLine("if(hadValidErr){" + (muteMode ? '' : "SendToast('验证失败，无法执行', EToastType.Warning);") + "return;}");
                }

                setInvalidStateBlock.pushLine("if(err){", 1);
                setInvalidStateBlock.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".setData(err.info, EMessageBoxType.Error, '" + ctlName + "');}");
                if (ctlKernel.type == ButtonKernel_Type) {
                    setInvalidStateBlock.pushLine("else{SendToast(err.info, EToastType.Error);}");
                }
                setInvalidStateBlock.pushLine("return;", -1);
                setInvalidStateBlock.pushLine("}");

                finalCallBackReturn_bk.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".fireClose();}");
                if (haveDoneTip && !muteMode) {
                    finalCallBackReturn_bk.pushLine("SendToast('执行成功');");
                }
            }
            else if (this.group == EJsBluePrintFunGroup.GridRowBtnHandler) {
                // needMsgBox
                msgBoxVarName = this.id + '_msg';
                theFun.scope.getVar(msgBoxVarName, true, 'null');
                if (compilHelper.config) {
                    ctlName = compilHelper.config.actLabel;
                }
                else {
                    ctlName = this.id;
                }

                if (startFtech_bk) {
                    if (!nomsgbox) {
                        startFtech_bk.pushLine(makeLine_Assign(msgBoxVarName, "PopMessageBox('',EMessageBoxType.Loading, '" + ctlName + "')"));
                    }
                }

                if (needCheckVars_arr.length > 0) {
                    setInvalidStateBlock.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}");
                    setInvalidStateBlock.pushLine("else{setManyStateByPath(state,'',validErrState);}");
                    setInvalidStateBlock.pushLine("if(hadValidErr){SendToast('验证失败，无法执行', EToastType.Warning);return;}");
                }
                setInvalidStateBlock.pushLine("if(err){", 1);
                setInvalidStateBlock.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".setData(err.info, EMessageBoxType.Error, '" + ctlName + "');}");
                setInvalidStateBlock.pushLine("return;", -1);
                setInvalidStateBlock.pushLine("}");

                finalCallBackReturn_bk.pushLine("if(" + msgBoxVarName + "){" + msgBoxVarName + ".fireClose();}");
                finalCallBackReturn_bk.pushLine('if(err == null && ' + VarNames.CallBack + ' != null){' + VarNames.CallBack + '(' + VarNames.State + ');}');
            }
            else {
                if (needCheckVars_arr.length > 0) {
                    setInvalidStateBlock.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(validErrState, ''));}");
                    setInvalidStateBlock.pushLine("else{setManyStateByPath(state,'',validErrState);}");
                }
            }
        }
        else {
        }
        if (compilHelper.bNeedMsgBox && !msgBoxCreated) {
            var msgBoxVarName = this.id + '_msg';
            theFun.scope.getVar(msgBoxVarName, true, "PopMessageBox('',EMessageBoxType.Blank)");
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        result.pushVariable(this.varData.name, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(this.varData == null || this.varData.removed, '无效变量', helper)) {
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        result.pushVariable(this.varData.name, targetSocket);
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
        this.cloneable = false;

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

        if (this.inputScokets_arr.length > 0) {
            this.defRetSocket = this.inputScokets_arr.find(x => { return x.name == 'defret' });
        }
        if (this.bluePrint.group == EJsBluePrintFunGroup.CtlAttr) {
            if (this.defRetSocket == null) {
                this.defRetSocket = new NodeSocket('defret', this, true, { type: ValueType.String });
                this.addSocket(this.defRetSocket);
            }
            this.defRetSocket.label = '默认返回值';
        }
        else {
            if (this.defRetSocket) {
                this.removeSocket(this.defRetSocket);
            }
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
            if (flowLinks_arr[0].inSocket.node.compile(helper, usePreNodes_arr, belongBlock) == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_Return extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_RETURN, 'RETURN', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
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
        }
        else {
            this.synInSocket();
        }
    }

    synInSocket() {
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            return;
        }
        this.inputScokets_arr.forEach(s => {
            s.valid = false;
        });

        this.bluePrint.returnVars_arr.forEach(varData => {
            var socket = this.getScoketByName(varData.id);
            if (socket) {
                socket.valid = true;
                if (socket.label != varData.name) {
                    socket.label = varData.name;
                    socket.fireEvent('changed');
                }
            }
            else {
                socket = new NodeSocket(varData.id, this, true, { label: varData.name });
                this.addSocket(socket);
            }
            socket.inputable = true;
        });

        this.inputScokets_arr.filter(s => { return s.valid == false; }).forEach(s => { this.removeSocket(s) });

        this.fireEvent(Event_SocketNumChanged, 20);
        this.bluePrint.fireChanged();
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet;
        var socketValue;

        if (this.bluePrint.group == EJsBluePrintFunGroup.CtlAttr || this.bluePrint.group == EJsBluePrintFunGroup.CtlValid) {
            var inreducer = this.isInReducer(preNodes_arr, false);
            if (this.checkCompileFlag(inreducer, '此处应该用CallOnFetchEnd', helper)) {
                return false;
            }
        }

        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            this.synInSocket();
            if (this.inputScokets_arr.length == 0) {
                socketValue = 'null';
            }
            else {
                socketValue = '{';
                for (var si in this.inputScokets_arr) {
                    var socket = this.inputScokets_arr[si];
                    socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true, true);
                    if (socketComRet.err) {
                        return false;
                    }
                    socketValue += socket.label + ':' + (IsEmptyString(socketComRet.value) ? 'null' : socketComRet.value) + ','
                }
                socketValue += '}';
            }
        }
        else {
            socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            socketValue = socketComRet.value;
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
            if (value.toLocaleLowerCase() == 'null') {
                value = 'null';
            }
            else if (value != "''") {
                value = "'" + value + "'";
            }
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
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, this.insocketInitVal);
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

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
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
        if (this.rowSource == null) {
            this.rowSource = EFormRowSource.Context;
        }
        if (this.outFlowSockets_arr == null) {
            this.outFlowSockets_arr = [];
        }
        var proj = null;
        if (createHelper) {
            proj = createHelper.project;
        }
        else {
            proj = parentNode.bluePrint.master.project;
        }
        if (proj && !proj.loaded) {
            proj.on('loaded', this.rowSourceChanged);
        }
        else {
            this.rowSourceChanged();
        }
    }

    rowSourceChanged() {
        var formKernel = this.bluePrint.master.project.getControlById(this.formID);
        if (formKernel == null) {
            return;
        }
        var isGridForm = formKernel.isGridForm();
        var isListForm = formKernel.isListForm();
        var selectMode = formKernel.getAttribute(AttrNames.SelectMode);
        var inFlowSocket = this.getSocketById(this.id + '$flow_i');
        var outFlowSocket = this.getSocketById(this.id + '$flow_o');
        if ((isGridForm || isListForm) && this.rowSource == EFormRowSource.Selected && selectMode == ESelectMode.Multi) {
            if (inFlowSocket == null) {
                inFlowSocket = new NodeFlowSocket('flow_i', this, true);
                this.addSocket(inFlowSocket);
                this.inFlowSocket = inFlowSocket;
            }
            if (outFlowSocket == null) {
                outFlowSocket = new NodeFlowSocket('flow_o', this, false);
                this.addSocket(outFlowSocket);
                this.outFlowSocket = outFlowSocket;
            }
            var forEachFlow;
            if (this.outFlowSockets_arr.length == 0) {
                forEachFlow = new NodeFlowSocket('forEach', this, false);
                this.addSocket(forEachFlow);
            }
            else {
                forEachFlow = this.outFlowSockets_arr[0];
            }
            forEachFlow.label = 'forEach';
            this.forEachFlow = forEachFlow;
        }
        else {
            if (inFlowSocket) {
                this.removeSocket(inFlowSocket);
                this.inFlowSocket = null;
            }
            if (outFlowSocket) {
                this.removeSocket(outFlowSocket);
                this.outFlowSocket = null;
            }
            while (this.outFlowSockets_arr.length > 0) {
                this.removeSocket(this.outFlowSockets_arr[this.outFlowSockets_arr.length - 1]);
            }
            this.forEachFlow = null;
        }
        this.fireEvent(Event_SocketNumChanged, 20);
        this.bluePrint.fireChanged();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.formID = this.formID;
        rlt.rowSource = this.rowSource;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['formID', 'rowSource']);
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        var clientForEachBlock = helper.getCache(this.id + '_clientForEachBlock');
        if (clientForEachBlock) {
            result.pushVariable(this.id + '_row', targetSocket);
        }
        else {
            result.pushVariable(this.formID + '_' + VarNames.NowRecord, targetSocket);
        }
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr, blockInServer);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var theScope = belongBlock && belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        this.rowSourceChanged();
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
        helper.addUseEntity(theDS, EUseEntityStage.Select);
        this.targetEntity = theDS;
        this.formKernel = formKernel;
        var isGridForm = formKernel.isGridForm();
        var isListForm = formKernel.isListForm();
        var clientForEachBodyBlock = null;
        var clientForEachDeclarBlock = null;
        var clientForEachBlock = null;
        var nowRowVarName = this.id + '_row';
        var clientForEachFlowLinks_arr;
        if (isListForm || isGridForm) {
            var formSelectMode = formKernel.getAttribute(AttrNames.SelectMode);
            if (this.rowSource == EFormRowSource.Context) {
                var belongFormKernel = this.bluePrint.ctlKernel.searchParentKernel(M_FormKernel_Type, true);
                var realParent = this.bluePrint.ctlKernel.parent;
                if (realParent.type == M_LabeledControlKernel_Type) {
                    realParent = realParent.parent;
                }
                var isSameForm = formKernel == belongFormKernel;
                if (this.checkCompileFlag(!isSameForm || realParent != belongFormKernel, '此处无法使用目标Form的本属性', helper)) {
                    return false;
                }
            }
            if (this.rowSource == EFormRowSource.Selected) {
                if (this.checkCompileFlag(formSelectMode == ESelectMode.None, '目标Form的模式是不可选的', helper)) {
                    return false;
                }
                if (formSelectMode == ESelectMode.Multi) {
                    // foreach流程的建立
                    clientForEachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.forEachFlow);
                    var formStateVarName = formKernel.id + '_state';
                    var selectedRowsVarName = formKernel.id + '_' + VarNames.SelectedRows_arr;
                    clientForEachBlock = new FormatFileBlock('clientforeach');
                    if (clientForEachFlowLinks_arr.length > 0) {
                        if (this.checkCompileFlag(blockInServer, 'forach流无法被执行到', helper)) {
                            return false;
                        }
                        var indexVarName = this.id + "_index";

                        clientForEachDeclarBlock = new FormatFileBlock('clientforeachdeclar');
                        clientForEachBodyBlock = new FormatFileBlock('clientforeachbody');
                        clientForEachBlock.pushLine(makeStr_AddAll('for(var ', indexVarName, '=0;', indexVarName, '<', selectedRowsVarName, '.length;++', indexVarName, '){'), 1);
                        //clientForEachBlock.pushLine('var ' + nowRowVarName + '=' + makeStr_AddAll(formStateVarName, '.', VarNames.Records_arr, '[', selectedRowsVarName, '[', indexVarName, ']];'));
                        clientForEachBlock.pushLine('var ' + nowRowVarName + '=' + makeStr_callFun('getRecordFromRowKey',[formKernel.id + '_path',selectedRowsVarName + '['+indexVarName+']'],';'));
                        clientForEachBlock.pushChild(clientForEachDeclarBlock);
                        clientForEachBlock.pushChild(clientForEachBodyBlock);
                        clientForEachBlock.subNextIndent();
                        clientForEachBlock.pushLine('}');
                    }
                }
            }
        }
        else {
            if (this.checkCompileFlag(this.rowSource == EFormRowSource.Selected, '页面Form不可以用选中行节点', helper)) {
                return false;
            }
        }
        helper.setCache(this.id + '_clientForEachBlock', clientForEachBlock);

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet, blockInServer);
        if (clientForEachBlock) {
            belongBlock.pushChild(clientForEachBlock);
            selfCompileRet.setSocketOut(this.inFlowSocket, '', clientForEachBlock);
        }
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
            helper.addUseColumn(formKernel, colName, blockInServer ? theScope.fun : null, this.rowSource);
            if (blockInServer) {
                selfCompileRet.setSocketOut(outSocket, 'req.body.' + VarNames.Bundle + '.' + this.formID + '_' + colName);
            }
            else {
                if (clientForEachDeclarBlock) {
                    var colVarName = this.id + '_' + colName;
                    //clientForEachDeclarBlock.pushLine('var ' + colVarName + '=' + nowRowVarName + '.' + colName + ';');
                    selfCompileRet.setSocketOut(outSocket, nowRowVarName + '.' + colName);
                }
                else {
                    selfCompileRet.setSocketOut(outSocket, formKernel.id + '_' + VarNames.NowRecord + "['" + colName + "']");
                }
            }
        }
        if (clientForEachBodyBlock) {
            if (this.compileFlowNode(clientForEachFlowLinks_arr[0], helper, usePreNodes_arr, clientForEachBodyBlock) == false) {
                return false;
            }
        }
        if (this.outFlowSocket) {
            if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
                return false;
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
        this.hadFetchFun = true;
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

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
            if (!bluePrintIsServer) {
                this.sucessFlowSocket = new NodeFlowSocket('sucess', this, false);
                this.failFlowSocket = new NodeFlowSocket('fail', this, false);
                this.addSocket(this.sucessFlowSocket);
                this.addSocket(this.failFlowSocket);
            }
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
        if (bluePrintIsServer) {
            if (this.sucessFlowSocket) {
                this.removeSocket(this.sucessFlowSocket);
            }
            if (this.failFlowSocket) {
                this.removeSocket(this.failFlowSocket);
            }
        }
        if (!IsEmptyString(this.dsCode)) {
            this.setDSCode(this.dsCode);
        }
        this.inputScokets_arr.forEach(socket => {
            socket.inputable = true;
            socket.autoHideInput = false;
            socket.inputDDC_setting = this.insocketDDC_setting;
        });
        if (this.sucessFlowSocket) {
            this.sucessFlowSocket.label = '成功';
            this.failFlowSocket.label = '失败';
        }
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

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        rlt.dsCode = this.dsCode;
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS != null) {
            jsonProf.useEntity(theDS);
        }
        rlt.autoCallFetchEnd = this.autoCallFetchEnd;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['dsCode', 'autoCallFetchEnd']);
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
                autoHideInput: false,
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
        if (theDS && theDS.loaded) {
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        if (targetSocket == this.errInfoOutSocket) {
            return;
        }
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var useDS = g_dataBase.getEntityByCode(this.dsCode);
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
        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            columnProfile = columnProfile_obj[socket.defval];
            if (this.checkCompileFlag(columnProfile == null, '第' + (si) + '个输入接口不是有效的列名[' + socket.defval + ']', helper)) {
                return false;
            }
            if (this.checkCompileFlag(columnProfile.value != null, '第' + (si) + '个输入接口重复设置了[' + socket.defval + ']', helper)) {
                return false;
            }
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            columnProfile.value = socketValue;
        }

        var myServerBlock = new FormatFileBlock('serverblock');
        belongBlock.pushChild(myServerBlock);

        // make server side code
        var paramInitBlock = null;
        var insertSqlStr = '';
        var valuesStr = '';

        var sqlVarName = this.id + '_sql';
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;

        var paramVarName = this.id + 'params_arr';
        var paramInitBlock = new FormatFileBlock('initparam');
        myServerBlock.pushChild(paramInitBlock);
        paramInitBlock.pushLine('var ' + paramVarName + "=[", 1);

        for (var columnName in columnProfile_obj) {
            columnProfile = columnProfile_obj[columnName];
            if (columnProfile.value == null) {
                if (this.checkCompileFlag(!columnProfile.nullable, 'Insert[' + useDS.name + ']时搜寻不到[' + columnProfile.name + ']的匹配值', helper)) {
                    return false;
                }
                continue;
            }
            insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
            valuesStr += (valuesStr.length == 0 ? '@' : ',@') + columnProfile.name;
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + columnProfile.name + "', sqlTypes.NVarChar(4000), " + columnProfile.value + "),");
        }
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        myServerBlock.pushLine("var " + sqlVarName + " = 'insert into " + midbracketStr(useDS.name) + '(' + insertSqlStr + ') values(' + valuesStr + ")';");
        myServerBlock.pushLine("var " + dataVarName + " = -1;");
        myServerBlock.pushLine("try{", 1);
        myServerBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select SCOPE_IDENTITY()', " + paramVarName + ");");
        myServerBlock.subNextIndent();
        myServerBlock.pushLine("}catch(" + errorVarName + "){", 1);
        myServerBlock.pushChild(serverFailBlock);
        myServerBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        myServerBlock.subNextIndent();
        myServerBlock.pushLine('}');
        myServerBlock.pushChild(serverCompleteBlock);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
        selfCompileRet.setSocketOut(this.identityOutSocket, dataVarName);
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
        helper.setCompileRetCache(this, selfCompileRet);

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var useDS = g_dataBase.getEntityByCode(this.dsCode);
        if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
            return false;
        }
        helper.addUseEntity(useDS, EUseEntityStage.Insert);
        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var relKernel = this.bluePrint.ctlKernel;
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            if (this.checkCompileFlag(relKernel == null || (relKernel.type != ButtonKernel_Type && relKernel.type != EmptyKernel_Type), '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
                return false;
            }
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
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            columnProfile.value = socketValue;
            columnProfile.postName = this.id + '_' + socket.defval;
        }
        //console.log(useClientVariablesRlt);
        // 在所属Form中搜集交互类型为读写的可访问控件
        var formKernel = relKernel == null ? null : relKernel.searchParentKernel([M_FormKernel_Type], true);
        if (formKernel && formKernel.isGridForm()) {
            if (this.bluePrint.group != EJsBluePrintFunGroup.GridRowBtnHandler) {
                // 不是GridRowBtnHandler群组里的脚本无法访问gridform行控件
                formKernel = null;
            }
        }
        if (formKernel != null) {
            var accessableLabelKernels = formKernel.getRowLabeledControls();
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
                        helper.addUseControlPropApi(theEditor, apiItem, EFormRowSource.Context);
                        columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.isControl = true;
                    }
                });
            }
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var serverClickFun = null;
        var paramInitBlock = null;
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var postCheckBlock = new FormatFileBlock('postCheckBlock');

        var insertParVarName = this.id + '_insert';
        var insertPartLine = null;
        var valueParVarName = this.id + '_values';
        var valuePartLine = null;
        var insertSqlStr = '';
        var valuesStr = '';

        var sqlVarName = this.id + '_sql';
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;
        var needOperator = false;
        var serverFun = null;
        var serverFunBodyBlock = null;

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        var serverSideActName = this.bluePrint.name + '_' + this.id;
        var paramVarName = this.id + 'params_arr';
        if (!blockInServer) {
            serverClickFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            serverFun = serverClickFun;
            theServerSide.initProcessFun(serverClickFun);
            helper.appendOutputItem(serverClickFun);

            postCheckBlock.pushChild(postVarinitBlock);
            serverClickFun.bundleCheckBlock = postCheckBlock;
            serverClickFun.postVarinitBlock = postVarinitBlock;
            serverClickFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");

            theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
            serverFunBodyBlock = serverClickFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;

        serverFun.scope.getVar(paramVarName, true, "null");
        insertPartLine = new FormatFile_Line('insertPartLine');
        valuePartLine = new FormatFile_Line('valuePartLine');
        serverFunBodyBlock.pushChild(insertPartLine);
        serverFunBodyBlock.pushChild(valuePartLine);
        serverFunBodyBlock.pushChild(postCheckBlock);

        serverFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);

        paramInitBlock = new FormatFileBlock('initparam');
        serverFunBodyBlock.pushChild(paramInitBlock);
        paramInitBlock.pushLine(paramVarName + "=[", 1);

        serverFunBodyBlock.pushLine("var " + sqlVarName + " = " + insertParVarName + ' + ' + valueParVarName + ';');
        serverFunBodyBlock.pushLine("var " + dataVarName + " = -1;");
        serverFunBodyBlock.pushLine("try{", 1);
        serverFunBodyBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select SCOPE_IDENTITY()', " + paramVarName + ");");
        serverFunBodyBlock.subNextIndent();
        serverFunBodyBlock.pushLine("}catch(" + errorVarName + "){", 1);
        serverFunBodyBlock.pushChild(serverFailBlock);
        serverFunBodyBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        serverFunBodyBlock.subNextIndent();
        serverFunBodyBlock.pushLine('}');
        serverFunBodyBlock.pushChild(serverCompleteBlock);
        if (!blockInServer) {
            serverFunBodyBlock.pushLine("return " + dataVarName + ";");
        }

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

        var mustHadColumns_arr = [];
        var optioniHadColumns_arr = [];
        for (var columnName in columnProfile_obj) {
            columnProfile = columnProfile_obj[columnName];
            if (columnProfile.isControl) {
                initBundleBlock.params_map[columnProfile.value] = columnProfile.value;
                if (serverFun) {
                    serverFun.scope.getVar(columnProfile.value, true);
                    postVarinitBlock.pushLine(makeLine_Assign(columnProfile.value, postBundleVarName + '.' + columnProfile.value));
                }
            }
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
            else {
                var keyPos = columnName.indexOf('状态');
                if (keyPos == columnName.length - 2) {
                    var prefix = columnName.substring(0, keyPos);
                    var tempColumnProfile = columnProfile_obj[prefix + '时间'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            tempColumnProfile.value = 'getdate()';
                            tempColumnProfile.isStatic = true;
                        }
                    }
                    tempColumnProfile = columnProfile_obj[prefix + '用户'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            needOperator = true;
                            tempColumnProfile.value = '@_operator';
                            tempColumnProfile.isStatic = true;
                        }
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
                    var colValueVarName = this.id + '_' + columnProfile.name;
                    postCheckBlock.pushLine('var ' + colValueVarName + '=' + columnProfile.value + ';');
                    if (!columnProfile.nullable) {
                        //serverFun.bundleCheckBlock.pushLine('var ' + colValueVarName + '=' + columnProfile.value + ';');
                        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + colValueVarName + ')){return serverhelper.createErrorRet("列[' + columnProfile.name + ']的传入值错误");}');
                        insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                        valuesStr += (valuesStr.length == 0 ? '@' : ',@') + colValueVarName;
                    }
                    else {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + colValueVarName + ')){', 1);
                        postCheckBlock.pushLine(insertParVarName + "+= ',[" + columnProfile.name + "]';");
                        postCheckBlock.pushLine(valueParVarName + "+= ',@" + colValueVarName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + colValueVarName + "', sqlTypes.NVarChar(4000), " + colValueVarName + "),");
                    /*
                    var postName = ReplaceIfNull(columnProfile.postName, columnProfile.name);
                    if (!columnProfile.nullable) {
                        insertSqlStr += (insertSqlStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name);
                        valuesStr += (valuesStr.length == 0 ? '@' : ',@') + postName;
                        serverFun.bundleCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){return serverhelper.createErrorRet("缺少参数[' + postName + ']");}');
                    }
                    else {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + postBundleVarName + '.' + postName + ')){', 1);
                        postCheckBlock.pushLine(insertParVarName + "+= ',[" + columnProfile.name + "]';");
                        postCheckBlock.pushLine(valueParVarName + "+= ',@" + postName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + postName + "', sqlTypes.NVarChar(4000), " + postBundleVarName + '.' + postName + "),");
                    initBundleBlock.pushLine(postName + ':' + columnProfile.value + ',');
                    */
                }
            }
        }

        if (needOperator) {
            if (paramInitBlock) {
                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }
        }

        if (optioniHadColumns_arr.length == 0) {
            insertSqlStr += ')';
            valuesStr += ')';
        }
        else if (postCheckBlock) {
            postCheckBlock.pushLine(insertParVarName + " += ')';");
            postCheckBlock.pushLine(valueParVarName + " += ')';");
        }
        if (insertPartLine) {
            insertPartLine.content = 'var ' + insertParVarName + " = 'insert into " + midbracketStr(useDS.name) + "(" + insertSqlStr + "';";
            valuePartLine.content = 'var ' + valueParVarName + " = ' values(" + valuesStr + "';";

            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
        }

        // make client
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
        if (!blockInServer) {
            belongBlock.pushChild(myJSBlock);
        }

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
        myJSBlock.pushChild(initBundleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});');
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        var errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
        fetchEndBlock.pushChild(errCheckIf);
        myJSBlock.subNextIndent();
        if (inreducer) {
            myJSBlock.pushLine('})))}, 50);');
        }
        else {
            myJSBlock.pushLine('})));');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.identityOutSocket, dataVarName);
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
        helper.setCompileRetCache(this, selfCompileRet);

        helper.compilingFun.defaultBlock = errCheckIf.trueBlock;
        var autoCallFetchEnd = this.autoCallFetchEnd != false;

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                return false;
            }
            var belongForm = relKernel.searchParentKernel(M_FormKernel_Type, true);
            if(belongForm.isPageForm()){
                var formBelongUserControl = belongForm.searchParentKernel(UserControlKernel_Type, true);
                var formStatePath = '';
                if (formBelongUserControl) {
                    formStatePath = formBelongUserControl.id + '_path + ' + singleQuotesStr('.' + belongForm.getStatePath('insertCache'));
                }
                else {
                    
                    formStatePath = singleQuotesStr(belongForm.getStatePath('insertCache'));
                }
                errCheckIf.trueBlock.pushLine("setStateByPath(state, " + formStatePath + ", null);");
            }
            if (this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }

        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                return false;
            }
            if (this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (theServerSide != null && serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (theServerSide != null && serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
                return false;
            }
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
                return;
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    columnDDCChanged(value){
        this.inSocket.setExtra('colname', value);
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return null;
        }
        if(this.apiClass == null || this.apiItem == null){
            return;
        }
        if(this.apiClass.ctltype == M_FormKernel_Type && this.apiItem.attrItem.name == VarNames.SelectedColumns){
            var selectedCtlid = this.inSocket.getExtra('ctlid');
            var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
            var options_arr = [];
            if(selectedKernel){
                options_arr = selectedKernel.getCanuseColumns;
            }
            var nowVal = this.inSocket.getExtra('colname');
            return <DropDownControl itemChanged={this.columnDDCChanged} btnclass='btn-dark' options_arr={options_arr} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} />;
        }
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
        var useApiItem = this.apiItem;
        if (this.apiClass.ctltype == UserControlKernel_Type) {
            var propAttrName = this.inSocket.getExtra('propAttrName');
            var propAttr;
            if (this.checkCompileFlag(IsEmptyString(propAttrName), '需要选择目标属性', helper)) {
                return false;
            }
            var propAttr = selectedKernel.getParamAttrByName(propAttrName);

            if (this.checkCompileFlag(propAttr == null, '目标属性无效', helper)) {
                return false;
            }

            useApiItem = Object.assign({}, useApiItem, {
                stateName: propAttr.label,
                useAttrName: propAttr.label,
                relyStateName: propAttr.label,
            });
        }
        else if(this.apiClass.ctltype == M_FormKernel_Type && this.apiItem.attrItem.name == VarNames.SelectedColumns){
            var colname = this.inSocket.getExtra('colname');
            if (this.checkCompileFlag(selectedKernel.getCanuseColumns().indexOf(colname) == -1, '所选列无效', helper)) {
                return false;
            }

            useApiItem = Object.assign({}, useApiItem, {
                stateName: VarNames.SelectedColumns,
                useAttrName: VarNames.SelectedColumns,
                colname: colname,
                relyStateName:VarNames.SelectedValues_arr,
            });
        }
        if (selectedKernel.type == M_FormKernel_Type) {
            if (this.checkCompileFlag(useApiItem.stateName == VarNames.RecordIndex && !selectedKernel.isPageForm(), '指定的Form必须是Page才能访问此项属性', helper)) {
                return false;
            }
        }
        helper.addUseControlPropApi(selectedKernel, useApiItem, EFormRowSource.Context);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, selectedKernel.id + '_' + useApiItem.stateName);
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

        var batchNode = null;
        if (preNodes_arr[preNodes_arr.length - 1].type == JSNODE_BATCH_CONTROL_API_PROPSETTER) {
            batchNode = preNodes_arr[preNodes_arr.length - 1];
        }
        var needSetVarName = batchNode ? batchNode.id : null;

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

        var useApiItem = this.apiItem;
        if (this.apiClass.ctltype == UserControlKernel_Type) {
            var propAttrName = this.ctlSocket.getExtra('propAttrName');
            var propAttr;
            if (this.checkCompileFlag(IsEmptyString(propAttrName), '需要选择目标属性', helper)) {
                return false;
            }
            var propAttr = selectedKernel.getParamAttrByName(propAttrName);
            if (this.checkCompileFlag(propAttr == null, '目标属性无效', helper)) {
                return false;
            }
            var pathVar = singleQuotesStr(selectedKernel.getStatePath(propAttr.label, '.', { mapVarName: VarNames.RowKeyInfo_map }));
            var belongUserCtl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);
            if (selectedKernel.parent == null) {
                // 在自订控件内部设置属性，需要加本控件path
                belongUserCtl = selectedKernel;
            }
            if (belongUserCtl) {
                pathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + selectedKernel.getStatePath(propAttr.label));
            }
            if (batchNode) {
                myJSBlock.pushLine(needSetVarName + '[' + pathVar + '] = ' + valueStr + ';');
            }
            else {
                myJSBlock.pushLine('setTimeout(() => {', 1);
                myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath(" + valueStr + "," + pathVar + "));", -1);
                myJSBlock.pushLine('},50);');
            }
            useApiItem = Object.assign({}, useApiItem, {
                stateName: propAttr.label,
                useAttrName: propAttr.label,
                relyStateName: propAttr.label,
            });
        }
        else {
            var belongUserControl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);
            var statePath = (belongUserControl ? belongUserControl.id + "_path + '." : "'") + selectedKernel.getStatePath(this.apiItem.stateName, '.', { mapVarName: VarNames.RowKeyInfo_map }) + "'";
            if (batchNode) {
                myJSBlock.pushLine(needSetVarName + '[' + statePath + '] = ' + valueStr + ';');
            }
            else {
                myJSBlock.pushLine('setTimeout(() => {', 1);
                myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath(" + valueStr + "," + statePath + "));", -1);
                myJSBlock.pushLine('},50);');
            }
            useApiItem = Object.assign({}, useApiItem, {
                stateName: this.apiItem.stateName,
                useAttrName: this.apiItem.stateName,
            });
        }
        helper.addUseControlPropApi(selectedKernel, useApiItem, EFormRowSource.Context);

        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (!batchNode) {
            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }
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
        name: 'CastDateByTime',
        inputs: [{ label: '', type: ValueType.String }],
        outputs: [{ label: '', type: ValueType.Date }]
    },
    {
        name: 'CastDateByTimeNumber',
        inputs: [{ label: '', type: ValueType.Int }],
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
        name: 'Format[yyyy-mm-dd HH:MM:SS]',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'Format[mm-dd]',
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
        name: 'year',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'month',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: '', type: ValueType.String }]
    },
    {
        name: 'day',
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
    {
        name: 'Convert_TimeZone',
        inputs: [{ label: '日期', type: ValueType.Data }, { label: '本地时区', type: ValueType.Int, inputable: true },
        { label: '目标时区', type: ValueType.Int, inputable: true }],
        outputs: [{ label: '', type: ValueType.Data }]
    }
    ,
    {
        name: 'GetTime',
        inputs: [{ label: '日期', type: ValueType.Date }],
        outputs: [{ label: 'number', type: ValueType.Int }]
    }
];

class JSNode_DateFun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DATEFUN, 'datefun', false, nodeJson);
        autoBind(this);
        if (this.funName == null) {
            this.setFunName(gJSDateFuns_arr[0].name);
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
        var scope = belongBlock.getScope();
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
        switch (this.funName) {
            case 'Format[yyyy-mm-dd]':
                callStr = funPreFix + 'getFormatDateString(' + socketVal_arr[0] + ')';
                break;
            case 'Format[yyyy-mm-dd HH:MM:SS]':
                callStr = funPreFix + 'getFullFormatDateString(' + socketVal_arr[0] + ')';
                break;
            case 'Format[mm-dd]':
                callStr = funPreFix + 'getFormatDateString_MD(' + socketVal_arr[0] + ')';
                break;
            case 'year':
                callStr = socketVal_arr[0] + '.getFullYear()';
                break;
            case 'month':
                callStr = '(' + socketVal_arr[0] + '.getMonth() + 1)';
                break;
            case 'day':
                callStr = socketVal_arr[0] + '.getDate()';
                break;
            case 'AddDay':
                var varName = socketVal_arr[0];
                callStr = 'new Date(' + varName + '.setDate(' + varName + '.getDate() + ' + socketVal_arr[1] + '))';
                break;
            case 'CastDate':
                callStr = funPreFix + 'castDate(' + socketVal_arr[0] + ')';
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
            case 'CastDateByTime':
                callStr = funPreFix + 'castDateFromTimePart(' + socketVal_arr[0] + ')';
                break;
            case 'Convert_TimeZone':
                callStr = funPreFix + 'Convert_TimeZone(' + socketVal_arr[0] + ',' + socketVal_arr[1] + ',' + socketVal_arr[2] + ') ';
                break;
            case 'GetTime':
                callStr = socketVal_arr[0] + '.getTime()';
                break;
            case 'CastDateByTimeNumber':
                callStr = 'new Date(parseInt(' + socketVal_arr[0] + '))';
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
        var theScope = belongBlock && belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;

        var enName = this.outSocket.defval;
        if (this.checkCompileFlag(EnvVariable[enName] == null, '无效值', helper)) {
            return false;
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
                helper.addUseEnvVars(enName);
                break;
            case EnvVariable.nowDate:
                selfCompileRet.setSocketOut(outSocket, (blockInServer ? 'serverhelper.DateFun.' : '') + 'getNowDate()');
                break;
            case EnvVariable.nowTime:
                selfCompileRet.setSocketOut(outSocket, 'new Date()');
                break;
            case EnvVariable.inDingTalk:
                selfCompileRet.setSocketOut(outSocket, '(isMobile && isInDingTalk)');
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
        this.hadFetchFun = true;
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
                if (project) {
                    dataMaster = project.dataMaster;
                }
                else if (createHelper.dataMaster) {
                    dataMaster = createHelper.dataMaster;
                }
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
        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'flow_c_foreach':
                        this.clientForEachSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'flow_s_foreach':
                        this.serverForEachSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'flow_servergo':
                        this.serverGoSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        if (!bluePrintIsServer) {
            if (this.clientForEachSocket == null) {
                this.clientForEachSocket = new NodeFlowSocket('flow_c_foreach', this, false);
                this.addSocket(this.clientForEachSocket);
            }
            this.clientForEachSocket.label = 'ForEach';

            if (this.serverGoSocket == null) {
                this.serverGoSocket = new NodeFlowSocket('flow_servergo', this, false);
                this.addSocket(this.serverGoSocket);
            }
            this.serverGoSocket.label = 'servreGoOn';
        }
        else {
            if (this.clientForEachSocket) {
                this.removeSocket(this.clientForEachSocket);
            }
        }
        if (this.serverForEachSocket == null) {
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

    preRemoveSocket(theSocket) {
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
            if (theSocket == this.outDataSocket || theSocket == this.outErrorSocket) {
                continue;
            }
            var colName = theSocket.getExtra('colName');
            var columnItem = this.targetEntity.getColumnByName(colName);
            if (this.checkCompileFlag(columnItem == null, colName + '不是个有效的列名', helper)) {
                return false;
            }
            if (targetColumns_arr.indexOf(colName) == -1) {
                targetColumns_arr.push(colName);
            }
            targetColumnSockets_arr.push(theSocket);
        }
        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        if (this.checkCompileFlag(!isScalar && targetColumns_arr.length == 0, '请至少选择一个输出列', helper)) {
            return false;
        }
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        // make server side code
        var paramVarName = this.id + 'params_arr';
        var paramListStr = '';
        var paramInitBlock = new FormatFileBlock('initparam');
        paramInitBlock.pushLine('var ' + paramVarName + '=[', 1);
        myJSBlock.pushChild(paramInitBlock);
        params_arr.forEach(param => {
            paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
        });
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        var sqlInitValue = '';
        var bpCompileHelper = null;
        if (targetEntity.group == 'custom') {
            // 定制数据源
            if (helper.sqlBPCacheManager) {
                sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                bpCompileHelper = helper.sqlBPCacheManager.getCache(targetEntity.code + '_helper');
            }
            else {
                bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
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
            if (this.checkCompileFlag(!IsEmptyObject(bpCompileHelper.useUrlVar_map), '不可使用URL参数', helper)) {
                return false;
            }
            if (this.checkCompileFlag(!IsEmptyObject(bpCompileHelper.usePageParam), '不可使用页面参数', helper)) {
                return false;
            }
            if (this.checkCompileFlag(!IsEmptyObject(bpCompileHelper.useEnvVars), '不可使用环境变量', helper)) {
                return false;
            }
        }
        else {
            if (isScalar) {
                sqlInitValue = 'select dbo.' + targetEntity.name + '(' + paramListStr + ')';
            }
            else {
                sqlInitValue = 'select ';
                targetColumns_arr.forEach((colName, i) => {
                    sqlInitValue += (i == 0 ? '[' : ',[') + colName + ']';
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

        targetColumnSockets_arr.forEach(socket => {
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
            if (isScalar) {
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBodyBlock.pushLine('var ' + this.id + '_' + targetColumns_arr[0] + '=' + dataVarName + ';');
            }
            else {
                serverForachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', dataVarName, '.length;++', indexVarName, '){'), 1);
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBlock.subNextIndent();
                serverForachBlock.pushLine('}');
                serverForachBodyBlock.pushLine('var ' + nowRowVarName + '=' + dataVarName + '[' + indexVarName + '];');
                targetColumns_arr.forEach(colName => {
                    serverForachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            if (this.compileFlowNode(serverForEachFlowLinks_arr[0], helper, usePreNodes_arr, serverForachBodyBlock) == false) {
                return false;
            }
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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(this.targetEntity == null, '需要选择一个数据实体', helper)) {
            return false;
        }
        if (this.checkCompileFlag(this.targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
            return false;
        }
        helper.addUseEntity(this.targetEntity, EUseEntityStage.Select);
        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }
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
            if (theSocket == this.outDataSocket || theSocket == this.outErrorSocket) {
                continue;
            }
            var colName = theSocket.getExtra('colName');
            var columnItem = this.targetEntity.getColumnByName(colName);
            if (this.checkCompileFlag(columnItem == null, colName + '不是个有效的列名', helper)) {
                return false;
            }
            if (targetColumns_arr.indexOf(colName) == -1) {
                targetColumns_arr.push(colName);
            }
            targetColumnSockets_arr.push(theSocket);
        }
        var targetEntity = this.targetEntity;
        var isScalar = targetEntity.isScalar();
        if (this.checkCompileFlag(!isScalar && targetColumns_arr.length == 0, '请至少选择一个输出列', helper)) {
            return false;
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = this.bluePrint.id + '_' + this.id;
        var rcdRltVarName = this.id + '_rcdRlt';
        var serverForachBlock = new FormatFileBlock('serverForachBlock');
        var serverForachBodyBlock = new FormatFileBlock('serverForachBodyBlock');
        var serverGoOnBlock = new FormatFileBlock('servergoon');
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var bundleCheckBlock = new FormatFileBlock('bundleCheck');
        var serverFun = null;
        var serverFunBodyBlock = null;
        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        if (!blockInServer) {
            var queryFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            serverFun = queryFun;
            helper.appendOutputItem(queryFun);
            theServerSide.initProcessFun(queryFun);
            queryFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            bundleCheckBlock.pushChild(postVarinitBlock);
            queryFun.bundleCheckBlock = bundleCheckBlock;
            queryFun.postVarinitBlock = postVarinitBlock;
            queryFun.pushChild(bundleCheckBlock);
            queryFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverFunBodyBlock = serverFun.bodyBlock;

            theServerSide.processesMapVarInitVal[queryFun.name] = queryFun.name;
        }
        else {
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            serverFunBodyBlock.pushChild(bundleCheckBlock);
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }

        var paramVarName = this.id + 'params_arr';
        serverFun.scope.getVar(paramVarName, true, 'null');

        var paramListStr = '';

        var paramInitBlock = new FormatFileBlock('initparam');
        paramInitBlock.pushLine(paramVarName + "=[", 1);
        params_arr.forEach(param => {
            paramListStr += (paramListStr.length == 0 ? '@' : ',@') + param.name;
            var paramPostName = this.id + '_p' + param.name;
            bundleCheckBlock.pushLine('var ' + paramPostName + '=' + param.value + ';');
            bundleCheckBlock.pushLine("if(" + paramPostName + ' == null' + '){return serverhelper.createErrorRet("参数[' + param.name + ']传入值错误");}');
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + paramPostName + "),");
        });

        serverFunBodyBlock.pushChild(paramInitBlock);

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        var sqlInitValue = '';
        var bpCompileHelper = null;
        if (targetEntity.group == 'custom') {
            // 定制数据源
            if (helper.sqlBPCacheManager) {
                sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
                bpCompileHelper = helper.sqlBPCacheManager.getCache(targetEntity.code + '_helper');
            }
            else {
                bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
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
            if (!IsEmptyObject(bpCompileHelper.useEnvVars)) {
                for (var useEnvName in bpCompileHelper.useEnvVars) {
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + useEnvName + "', sqlTypes.NVarChar(4000), g_envVar." + useEnvName + "),");
                }
            }
        }
        else {
            if (isScalar) {
                sqlInitValue = 'select dbo.' + targetEntity.name + '(' + paramListStr + ')';
            }
            else {
                sqlInitValue = 'select ';
                targetColumns_arr.forEach((colName, i) => {
                    sqlInitValue += (i == 0 ? '[' : ',[') + colName + ']';
                });
                sqlInitValue += ' from ' + targetEntity.name + (targetEntity.isFunction() ? '(' + paramListStr + ')' : '');
            }
        }

        var sqlVarName = this.id + 'sql';
        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        serverFun.scope.getVar(sqlVarName, true, doubleQuotesStr(sqlInitValue));
        serverFunBodyBlock.pushLine("var " + rcdRltVarName + " = null;");
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        serverFunBodyBlock.pushChild(tryBlock);
        if (isScalar) {
            tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + ", " + paramVarName + ");");
            tryBlock.bodyBlock.pushLine('var ' + dataVarName + ' = ' + rcdRltVarName + ';');
            tryBlock.bodyBlock.pushChild(serverForachBlock);
            tryBlock.bodyBlock.pushChild(serverGoOnBlock);
            if (!blockInServer) {
                serverFunBodyBlock.pushLine("return " + rcdRltVarName + ';');
            }
        }
        else {
            tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynQueryWithParams(" + sqlVarName + ", " + paramVarName + ");");
            tryBlock.bodyBlock.pushLine('var ' + dataVarName + ' = ' + rcdRltVarName + '.recordset;');
            tryBlock.bodyBlock.pushChild(serverForachBlock);
            tryBlock.bodyBlock.pushChild(serverGoOnBlock);
            if (!blockInServer) {
                serverFunBodyBlock.pushLine("return " + dataVarName + ';');
            }
        }
        this.serverFun = serverFun;

        // makeClient
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
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
            serverFun.scope.getVar(varCon.name, true);
            postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
        });

        if (bpCompileHelper) {
            if (!IsEmptyObject(bpCompileHelper.useUrlVar_map)) {
                for (var varName in bpCompileHelper.useUrlVar_map) {
                    var paramPostName = this.id + '_p' + varName;
                    bundleCheckBlock.pushLine('var ' + paramPostName + '=' + postBundleVarName + '.' + varName + ';');
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + varName + "', sqlTypes.NVarChar(200), " + paramPostName + "),");
                    helper.addUseURLVairable(varName, bpCompileHelper.useUrlVar_map[varName]);
                    initBundleBlock.params_map[varName] = varName;
                }
            }
        }
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');

        if (!blockInServer) {
            belongBlock.pushChild(myJSBlock);
        }

        if (params_arr.length > 0) {
            myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('});');
        }
        else {
            myJSBlock.pushLine("var " + bundleVarName + " = {};");
        }
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
        }
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
        }
        else {
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        }
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},false)));');
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var indexVarName = 'index_' + this.id;
        var nowRowVarName = 'row_' + this.id;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        targetColumnSockets_arr.forEach(socket => {
            if (isScalar) {
                selfCompileRet.setSocketOut(socket, dataVarName);
            }
            else {
                selfCompileRet.setSocketOut(socket, this.id + '_' + socket.getExtra('colName'));
            }
        });

        var serverForEachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverForEachSocket);
        if (serverForEachFlowLinks_arr.length > 0) {
            serverForachBlock.pushLine('var ' + indexVarName + ' = 0;');
            if (isScalar) {
                serverForachBlock.pushChild(serverForachBodyBlock);
            }
            else {
                serverForachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', rcdRltVarName, '.recordset.length;++', indexVarName, '){'), 1);
                serverForachBlock.pushChild(serverForachBodyBlock);
                serverForachBlock.subNextIndent();
                serverForachBlock.pushLine('}');
                serverForachBodyBlock.pushLine('var ' + nowRowVarName + '=' + rcdRltVarName + '.recordset[' + indexVarName + '];');
                targetColumns_arr.forEach(colName => {
                    serverForachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            if (this.compileFlowNode(serverForEachFlowLinks_arr[0], helper, usePreNodes_arr, serverForachBodyBlock) == false) {
                return false;
            }
        }

        var serverGoOnFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverGoSocket);
        if (serverGoOnFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverGoOnFlowLinks_arr[0], helper, usePreNodes_arr, serverGoOnBlock) == false) {
                return false;
            }
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
            if (isScalar) {
                clientForEachBlock.pushChild(clientForEachBodyBlock);
                clientForEachBodyBlock.pushLine('var ' + this.id + '_' + targetColumns_arr[0] + '=' + dataVarName + ';');
            }
            else {
                clientForEachBlock.pushLine(makeStr_AddAll('for(', indexVarName, '=0;', indexVarName, '<', dataVarName, '.length;++', indexVarName, '){'), 1);
                clientForEachBlock.pushChild(clientForEachBodyBlock);
                clientForEachBlock.subNextIndent();
                clientForEachBlock.pushLine('}');
                clientForEachBodyBlock.pushLine('var ' + nowRowVarName + '=' + dataVarName + '[' + indexVarName + '];');
                targetColumns_arr.forEach(colName => {
                    clientForEachBodyBlock.pushLine('var ' + this.id + '_' + colName + '=' + nowRowVarName + '.' + colName + ';');
                });
            }

            if (this.compileFlowNode(clientForEachFlowLinks_arr[0], helper, usePreNodes_arr, clientForEachBodyBlock) == false) {
                return false;
            }
        }

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

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
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
            this.inDataSocket.label = '结果';
        }
        else {
            if (nodeJson) {
                this.inErrorSocket = this.inputScokets_arr.find(s => { return s.name == 'inerror' });
            }
        }

        if (this.inErrorSocket == null) {
            this.inErrorSocket = new NodeSocket('inerror', this, true, { type: ValueType.Object });
            this.addSocket(this.inErrorSocket);
        }
        this.inErrorSocket.label = '错误';

        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            this.synInSocket();
        }
    }

    synInSocket() {
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            return;
        }
        this.inputScokets_arr.forEach(s => {
            s.valid = false;
        });
        this.inErrorSocket.valid = true;

        this.bluePrint.returnVars_arr.forEach(varData => {
            var socket = this.getScoketByName(varData.id);
            if (socket) {
                socket.valid = true;
                if (socket.label != varData.name) {
                    socket.label = varData.name;
                    socket.fireEvent('changed');
                }
            }
            else {
                socket = new NodeSocket(varData.id, this, true, { label: varData.name });
                this.addSocket(socket);
            }
            socket.inputable = true;
        });

        this.inputScokets_arr.filter(s => { return s.valid == false; }).forEach(s => { this.removeSocket(s) });
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
        var myJSBlock = new FormatFileBlock('ret');
        belongBlock.pushChild(myJSBlock);
        var si;
        var theSocket;
        var socketComRet;
        var socketValue;
        var dataValue;
        var errValue;

        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            this.synInSocket();
            var thisRetVarName = this.bluePrint.id + '_ret';
            helper.compilingFun.scope.getVar(thisRetVarName, true);
            myJSBlock.pushLine(thisRetVarName + '={', 1);
            for (si in this.inputScokets_arr) {
                var socket = this.inputScokets_arr[si];
                socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true, true);
                if (socketComRet.err) {
                    return false;
                }
                socketValue = IsEmptyString(socketComRet.value) ? 'null' : socketComRet.value;
                if (socket == this.inErrorSocket) {
                    errValue = socketValue;
                }
                else {
                    myJSBlock.pushLine(socket.label + ':' + socketValue + ',');
                }
            }
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
            myJSBlock.pushLine('if(_callback != null){', 1);
            myJSBlock.pushLine("setTimeout(() => {_callback(" + thisRetVarName + ", " + errValue + ");},20);", -1);
            myJSBlock.pushLine('}');
        }
        else {
            for (si in this.inputScokets_arr) {
                theSocket = this.inputScokets_arr[si];
                socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, true);
                if (socketComRet.err) {
                    return false;
                }
                socketValue = socketComRet.value;
                socketValues_arr.push(socketValue);
            }
            dataValue = socketValues_arr[0];
            errValue = socketValues_arr.length > 1 ? socketValues_arr[1] : null;
            if (this.checkCompileFlag(dataValue == null && errValue == null, '需要设置data、error至少一项', helper)) {
                return false;
            }
            var inreducer = this.isInReducer(preNodes_arr);
            myJSBlock.pushLine("return callback_final(" + (inreducer ? 'state' : 'null') + ", " + dataValue + ", " + errValue + ");");
        }

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
            var tValue = socketComRet.value;
            if (socketComRet.link && !socketComRet.link.outSocket.isSimpleVal) {
                tValue = '(' + tValue + ')';
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = '';
        var logicChar = '';
        switch (nodeThis.LogicalType) {
            case Logical_Operator_and:
                logicChar = ' && '
                break;
            case Logical_Operator_or:
                logicChar = ' || '
                break;
        }
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : logicChar) + x;
        });

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, '(' + finalStr + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Array_New extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_NEW, 'New Array', false, nodeJson);
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
        this.outSocket.type = ValueType.Array;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, '[]');
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

class JSNode_Array_For extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ARRAY_FOR, 'ArrayFor', false, nodeJson);
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

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'index') {
                        this.indexSocket = socket;
                    }
                    else if (socket.name == 'data') {
                        this.dataSocket = socket;
                    }
                });
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
            if (this.outFlowSockets_arr.length > 0) {
                this.bodyFlowSocket = this.outFlowSockets_arr[0];
            }
        }
        if (this.bodyFlowSocket == null) {
            this.bodyFlowSocket = new NodeFlowSocket('flow_body', this, false);
            this.addSocket(this.bodyFlowSocket);
        }
        this.bodyFlowSocket.label = 'body';
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
        }
        if (this.indexSocket == null) {
            this.indexSocket = this.addSocket(new NodeSocket('index', this, false));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, false));
        }
        this.inSocket.label = 'array';
        this.dataSocket.label = 'data';
        this.indexSocket.label = 'index';
        this.inSocket.type = ValueType.Array;
        this.inSocket.inputable = false;

        this.indexSocket.type = ValueType.Int;
        this.dataSocket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var bodyFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.bodyFlowSocket);
        if (this.checkCompileFlag(bodyFlowLinks_arr.length == 0, '必须设置循环体', helper)) {
            return false;
        }

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var indexVarName = this.id + '_i';
        var dataVarName = this.id + '_data';
        myJSBlock.pushLine('var ' + indexVarName + '=0;');
        myJSBlock.pushLine('var ' + dataVarName + '=null;');
        myJSBlock.pushLine('for(' + indexVarName + '=0;' + indexVarName + '<' + socketValue + '.length;++' + indexVarName + '){', 1);
        myJSBlock.pushLine(dataVarName + '=' + socketValue + '[' + indexVarName + '];');
        var childBlock = new FormatFileBlock('child');
        myJSBlock.pushChild(childBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.dataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.indexSocket, indexVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileFlowNode(bodyFlowLinks_arr[0], helper, usePreNodes_arr, childBlock) == false) {
            return false;
        }

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;

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
        var rlt = blockInServer ? 'serverhelper.createErrorRet(' + socketValue + ',0,null)' : '{info:' + socketValue + '}';
        selfCompileRet.setSocketOut(this.outSocket, rlt);
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

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.holdSelected = this.holdSelected;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['holdSelected']);
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
        var formDS = selectedKernel.getAttribute(AttrNames.DataSource);
        var belongUserControl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);

        var parentPath = null;
        if (belongUserControl) {
            if (selectedKernel.parent != belongUserControl) {
                parentPath = selectedKernel.parent.getStatePath('');
            }
            else {
                parentPath = '';
            }
            parentPath = belongUserControl.id + '_path' + (parentPath.length == 0 ? '' : "+'." + parentPath + "'");
        }
        else {
            if (selectedKernel.parent.type == M_PageKernel_Type) {
                parentPath = singleQuotesStr(selectedKernel.parent.id);
            }
            else {
                parentPath = singleQuotesStr(selectedKernel.parent.getStatePath(''));
            }
        }
        var freshFunName = 'fresh_' + socketValue;

        var holdSelected = this.holdSelected == true ? 'true' : 'false';
        var myJSBlock = new FormatFileBlock('ret');
        if (formDS != null) {
            freshFunName = makeFName_pull(selectedKernel);
            myJSBlock.pushLine('setTimeout(() => {' + makeStr_callFun(freshFunName, ['null', holdSelected, parentPath]) + ';},50);');
        }
        else {
            myJSBlock.pushLine(makeStr_callFun(freshFunName, ['state', 'null', 'null', parentPath + "+'." + socketValue + "'"]));
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
        this.hadFetchFun = true;

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

        if (this.inputScokets_arr.length > 0) {
            this.userSocket = this.inputScokets_arr.find(x => {
                return x.name == '_userid';
            });
            if (this.userSocket) {
                this.userSocket.label = '_userid';
            }
        }

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

    preRemoveSocket(socket) {
        return socket != this.userSocket;
    }

    fresh() {
        var flowStep = gFlowMaster.findStepByCode(this.flowStepCode);
        this.flowStep = flowStep;
        var paramCount = flowStep ? flowStep.params_arr.length : 0;
        var isServerScript = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;
        if (isServerScript) {
            paramCount += 1;
            if (this.userSocket == null) {
                this.userSocket = new NodeSocket('_userid', this, true, { type: ValueType.String, label: '_userID' });
                this.addSocket(this.userSocket);
            }
        }
        while (this.inputScokets_arr.length > paramCount) {
            this.removeSocket(this.inputScokets_arr[0]);
        }
        while (this.inputScokets_arr.length < paramCount) {
            var socketName = 'in' + this.inputScokets_arr.length;
            this.addSocket(new NodeSocket(socketName, this, true, { type: ValueType.String }), 0);
        }
        this.inputScokets_arr.forEach((socket, i) => {
            if (socket == this.userSocket) {
                return;
            }
            socket.label = flowStep.params_arr[i];
            socket.fireEvent('changed');
        });
        this.fireEvent(Event_SocketNumChanged);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.flowStepCode = this.flowStepCode;
        rlt.autoCallFetchEnd = this.autoCallFetchEnd;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['flowStepCode', 'autoCallFetchEnd']);
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

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
                var paramName = '参数' + (i + 1);
                if (theSocket == this.userSocket) {
                    paramName = '提交用户';
                }
                params_arr.push({ name: paramName, value: paramValue });
            }
        }

        var myJsBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJsBlock);
        var paramVarName = this.id + '_param';
        var paramInitBlock = new FormatFileBlock('initparam');
        myJsBlock.pushChild(paramInitBlock);
        paramInitBlock.pushLine('var ' + paramVarName + "=[", 1);
        params_arr.forEach(param => {
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
        });

        paramInitBlock.pushLine("dbhelper.makeSqlparam('流程操作步骤代码', sqlTypes.Int, " + this.flowStep.code + "),");
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');

        var rcdVarName = this.id + 'rcd';
        myJsBlock.pushLine('var ' + rcdVarName + ';');
        var tryBlock = new JSFile_Try('try');
        myJsBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(rcdVarName + " = yield dbhelper.asynExcute('P007E申请执行步骤'," + paramVarName + ',[dbhelper.makeSqlparam("执行记录代码", sqlTypes.Int)]);');

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJsBlock);

        if (this.compileOutFlow(helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        this.fresh();
        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.checkCompileFlag(this.flowStep == null, '需要选择一个流程步骤', helper)) {
            return false;
        }

        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

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
                params_arr.push({ name: '参数' + (i + 1), value: paramValue, inBundleName: this.id + '_' + theSocket.label.replace('@', '') });
            }
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

        var serverSideActName = this.id + this.flowStep.code;

        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun);
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

        paramInitBlock.pushLine(paramVarName + "=[", 1);
        params_arr.forEach(param => {
            var paramName = param.inBundleName;
            postCheckBlock.pushLine('var ' + paramName + '=' + param.value + ';');
            postCheckBlock.pushLine("if(" + paramName + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + param.name + ']");}');
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + paramName + "),");
        });

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

        paramInitBlock.pushLine("dbhelper.makeSqlparam('流程操作步骤代码', sqlTypes.Int, " + this.flowStep.code + "),");
        paramInitBlock.pushLine("dbhelper.makeSqlparam('提交用户', sqlTypes.Int, req.session.g_envVar.userid),");
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
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
                myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            var dataVarName = 'data_' + this.id;
            var errVarName = 'error_' + this.id;
            myClientBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
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
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock)) {
                    return false;
                }
            }
            else if (autoCallFetchEnd) {
                fetchEndBlock.pushLine('return callback_final(state, null,' + errVarName + ');');
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock)) {
                    return false;
                }
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_Update_table extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_UPDATE_TABLE, 'Update', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

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
            if (!bluePrintIsServer) {
                this.sucessFlowSocket = new NodeFlowSocket('sucess', this, false);
                this.failFlowSocket = new NodeFlowSocket('fail', this, false);
                this.addSocket(this.sucessFlowSocket);
                this.addSocket(this.failFlowSocket);
            }
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
            if (bluePrintIsServer) {
                if (this.sucessFlowSocket) {
                    this.removeSocket(this.sucessFlowSocket);
                }
                if (this.failFlowSocket) {
                    this.removeSocket(this.failFlowSocket);
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
        if (this.sucessFlowSocket) {
            this.sucessFlowSocket.label = '成功';
            this.failFlowSocket.label = '失败';
        }
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

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        rlt.dsCode = this.dsCode;
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS != null) {
            jsonProf.useEntity(theDS);
        }
        rlt.autoCallFetchEnd = this.autoCallFetchEnd;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['dsCode', 'autoCallFetchEnd']);
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
        if (theDS && theDS.loaded) {
            this.dsSynedHandler();
        }
    }

    customSocketRender(socket) {
        return null;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

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
        var socketComRet;
        var socketValue;

        var updateSqlInitStr = '';
        var paramInitBlock = new FormatFileBlock('initparam');
        var paramVarName = this.id + 'params_arr';
        paramInitBlock.pushLine('var ' + paramVarName + "=[", 1);
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
            socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            socketValue = socketComRet.value;
            columnProfile.value = socketValue;

            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=@' + columnProfile.name;
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + columnProfile.name + "', sqlTypes.NVarChar(4000), " + socketComRet.value + '),');
        }
        if (this.checkCompileFlag(updateSqlInitStr.length == 0, '至少需要设置一个字段', helper)) {
            return false;
        }

        updateSqlInitStr = 'update ' + useDS.name + ' set ' + updateSqlInitStr + " where [" + identityColumn.name + "]=@RCDKEY";

        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;

        var myServerBlock = new FormatFileBlock('serverblock');
        belongBlock.pushChild(myServerBlock);

        var sqlVarName = this.id + '_sql';
        myServerBlock.pushLine("var " + sqlVarName + "='" + updateSqlInitStr + "';");
        myServerBlock.pushChild(paramInitBlock);

        socketComRet = this.getSocketCompileValue(helper, this.keySocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        paramInitBlock.pushLine("dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, " + socketComRet.value + '),');

        myServerBlock.pushLine("var " + dataVarName + " = -1;");
        myServerBlock.pushLine("try{", 1);
        myServerBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select @@ROWCOUNT', " + paramVarName + ");");
        myServerBlock.subNextIndent();
        myServerBlock.pushLine("}catch(" + errorVarName + "){", 1);
        myServerBlock.pushChild(serverFailBlock);
        myServerBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        myServerBlock.subNextIndent();
        myServerBlock.pushLine('}');
        myServerBlock.pushChild(serverCompleteBlock);
        myServerBlock.pushLine("return " + dataVarName + ";");

        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
        selfCompileRet.setSocketOut(this.rowCountOutSocket, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
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
        var useDS = g_dataBase.getEntityByCode(this.dsCode);
        if (this.checkCompileFlag(useDS == null || useDS.columns == null || useDS.type != 'U', useDS + '必须选择一个数据表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(!useDS.loaded, useDS + '正在同步中，请稍后再试。', helper)) {
            return false;
        }
        helper.addUseEntity(useDS, EUseEntityStage.Update);

        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var relKernel = this.bluePrint.ctlKernel;
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            if (this.checkCompileFlag(relKernel == null || (relKernel.type != ButtonKernel_Type && relKernel.type != EmptyKernel_Type), '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
                return false;
            }
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
                hadDefault: column.cdefault != null,
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
            socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            socketValue = socketComRet.value;
            columnProfile.value = socketValue;
            columnProfile.postName = this.id + '_' + socket.defval;
        }
        // 在所属Form中搜集交互类型为读写的可访问控件
        var formKernel = relKernel == null ? null : relKernel.searchParentKernel([M_FormKernel_Type], true);
        if (formKernel && formKernel.isGridForm()) {
            if (this.bluePrint.group != EJsBluePrintFunGroup.GridRowBtnHandler) {
                // 不是GridRowBtnHandler群组里的脚本无法访问gridform行控件
                formKernel = null;
            }
        }
        if (formKernel != null) {
            var accessableLabelKernels = formKernel.getRowLabeledControls();
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
                        helper.addUseControlPropApi(theEditor, apiItem, EFormRowSource.Context);
                        columnProfile.value = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.postName = theEditor.id + '_' + apiItem.stateName;
                        columnProfile.isControl = true;
                    }
                });
            }
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var serverClickFun = null;

        var sqlVarName = this.id + '_sql';
        var updateParVarName = this.id + '_update';
        var paramArrVarName = this.id + '_paramArr';
        var paramArrVarBlock = new FormatFileBlock('paramarr');
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var paramInitBlock = new FormatFileBlock('initparam');
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var postCheckBlock = new FormatFileBlock('postCheckBlock');

        var serverSideActName = this.bluePrint.name + '_' + this.id;
        var paramVarName = this.id + 'params_arr';
        var myServerBlock = new FormatFileBlock('serverblock');

        var serverFun = null;
        var serverFunBodyBlock = null;

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }

        if (!blockInServer) {
            serverClickFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            serverFun = serverClickFun;
            theServerSide.initProcessFun(serverClickFun);
            helper.appendOutputItem(serverClickFun);

            serverClickFun.bundleCheckBlock = postCheckBlock;
            serverClickFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverClickFun.postVarinitBlock = postVarinitBlock;

            theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
            serverFunBodyBlock = serverClickFun.bodyBlock;
            serverFunBodyBlock.pushChild(myServerBlock);
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            serverFunBodyBlock.pushChild(myServerBlock);
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;

        serverFun.scope.getVar(paramVarName, true, 'null');
        serverFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
        var updatePartLine = new FormatFile_Line('updatePartLine');

        myServerBlock.pushChild(updatePartLine);
        myServerBlock.pushChild(postCheckBlock);
        myServerBlock.pushChild(paramInitBlock);

        var initBundleBlock = null;
        if (serverFun) {
            if (serverFun.bundleCheckBlock.initBundleBlock) {
                initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock
            }
            else {
                initBundleBlock = new FormatFileBlock('initbundle');
                serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
            }
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        socketComRet = this.getSocketCompileValue(helper, this.keySocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var kerSocketValue = socketComRet.value;

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        var updateSqlVar = serverFun.scope.getVar(this.id + '_sql', true, "''");

        paramInitBlock.pushLine(paramVarName + "=[", 1);

        var rcdkeyName = this.id + '_RCDKEY';
        postCheckBlock.pushLine("var " + rcdkeyName + '=' + kerSocketValue + ';');
        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + rcdkeyName + ')){return serverhelper.createErrorRet("参数[RCDKEY]传入错误");}');
        paramInitBlock.pushLine("dbhelper.makeSqlparam('RCDKEY', sqlTypes.Int, " + rcdkeyName + '),');

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
        if (!blockInServer) {
            myServerBlock.pushLine("return " + dataVarName + ";");
        }

        var updateSqlInitStr = '';
        var needOperator = false;
        for (var columnName in columnProfile_obj) {
            columnProfile = columnProfile_obj[columnName];
            if (columnProfile.isControl) {
                initBundleBlock.params_map[columnProfile.value] = columnProfile.value;
                if (serverFun) {
                    serverFun.scope.getVar(columnProfile.value, true);
                    postVarinitBlock.pushLine(makeLine_Assign(columnProfile.value, postBundleVarName + '.' + columnProfile.value));
                }
            }
            if (columnProfile.value != null) {
                if (columnProfile.isStatic) {
                    updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=' + columnProfile.value;
                }
                else {
                    var colValueVarName = this.id + '_' + columnProfile.name;
                    postCheckBlock.pushLine('var ' + colValueVarName + '=' + columnProfile.value + ';');
                    if (columnProfile.hadDefault) {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + colValueVarName + ')){', 1);
                        postCheckBlock.pushLine(updateParVarName + "+= (" + updateParVarName + ".length==0 ? '' : ',') + '[" + columnProfile.name + "]=@" + colValueVarName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                        postCheckBlock.pushLine('else{' + updateParVarName + "+= (" + updateParVarName + ".length==0 ? '' : ',') + '[" + columnProfile.name + "]=default';}");
                    }
                    else if (!columnProfile.nullable) {
                        updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(columnProfile.name) + '=@' + colValueVarName;
                        postCheckBlock.pushLine("if(serverhelper.IsEmptyString(" + colValueVarName + ')){return serverhelper.createErrorRet("列[' + columnProfile.name + ']的传入值错误");}');
                    }
                    else {
                        postCheckBlock.pushLine("if(!serverhelper.IsEmptyString(" + colValueVarName + ')){', 1);
                        postCheckBlock.pushLine(updateParVarName + "+= (" + updateParVarName + ".length==0 ? '' : ',') + '[" + columnProfile.name + "]=@" + colValueVarName + "';");
                        postCheckBlock.subNextIndent();
                        postCheckBlock.pushLine('}');
                    }
                    paramInitBlock.pushLine("dbhelper.makeSqlparam('" + colValueVarName + "', sqlTypes.NVarChar(4000), " + colValueVarName + "),");
                }
                var keyPos = columnName.indexOf('状态');
                if (keyPos == columnName.length - 2) {
                    var prefix = columnName.substring(0, keyPos);
                    var tempColumnProfile = columnProfile_obj[prefix + '时间'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '时间') + '=getdate()';
                        }
                    }
                    tempColumnProfile = columnProfile_obj[prefix + '用户'];
                    if (tempColumnProfile != null) {
                        if (tempColumnProfile.value == null) {
                            needOperator = true;
                            updateSqlInitStr += (updateSqlInitStr.length == 0 ? '' : ',') + midbracketStr(prefix + '用户') + '=@_operator';
                        }
                    }
                }
            }
        }
        if (needOperator) {
            if (paramInitBlock) {

                paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            }
        }
        updatePartLine.content = 'var ' + updateParVarName + " = '" + updateSqlInitStr + "';";

        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        postCheckBlock.pushLine(updateSqlVar.name + ' = "update ' + useDS.name + ' set " + ' + updateParVarName + ' + " where [' + identityColumn.name + ']=@RCDKEY";');

        var myJSBlock = new FormatFileBlock(this.id);
        var errCheckIf = null;
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        if (!blockInServer) {
            // make client
            belongBlock.pushChild(myJSBlock);
            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('});');
            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myJSBlock.pushChild(callBack_bk);
            //myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverFun ? serverFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
            var fetchEndBlock = new FormatFileBlock('fetchend');
            myJSBlock.pushChild(fetchEndBlock);
            errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
            fetchEndBlock.pushChild(errCheckIf);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('})));');
            //myJSBlock.pushLine('})))}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', blockInServer ? myServerBlock : myJSBlock);
        selfCompileRet.setSocketOut(this.rowCountOutSocket, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);


        var autoCallFetchEnd = this.autoCallFetchEnd != false;

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                return false;
            }
            if (this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            if (errCheckIf) {
                errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }
        }

        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端失败出口无效', helper)) {
                return false;
            }
            if (this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            if (errCheckIf) {
                errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
            }
        }

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
                return false;
            }
        }
        return selfCompileRet;
    }
}

class JSNode_JumpPage extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_JUMP_PAGE, '跳转页面', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (createHelper) {
            if (!IsEmptyString(this.pageCode)) {
                if (!createHelper.project.loaded) {
                    createHelper.project.on('loaded', this.projLoadedHandler);
                }
                else {
                    this.projLoadedHandler();
                }
            }
        }
    }

    projLoadedHandler() {
        var project = this.bluePrint.master.project;
        var targetPage = project.getPageById(this.pageCode);
        this.setPage(targetPage);
    }

    pageChangedHandler() {
        if (this.targetPage == null) {
            while (this.inputScokets_arr.length > 0) {
                this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
            }
            while (this.outputScokets_arr.length > 0) {
                this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
            }
            return;
        }
        var pageEntryAttrs_arr = this.targetPage.getAttrArrayList(AttrNames.EntryParam);
        pageEntryAttrs_arr.forEach((attrItem, index) => {
            var inSocket = null;
            if (index >= this.inputScokets_arr.length) {
                inSocket = new NodeSocket(attrItem.name, this, true);
                this.addSocket(inSocket);
            }
            else {
                inSocket = this.inputScokets_arr[index];
            }
            var paramLabel = this.targetPage.getAttribute(attrItem.name);
            if (paramLabel != inSocket.label) {
                inSocket.label = paramLabel;
                inSocket.fireEvent('changed');
            }
            inSocket.inputable = false;
        });
        while (this.inputScokets_arr.length > pageEntryAttrs_arr.length) {
            this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
        }

        var pageExportAttrs_arr = this.targetPage.getAttrArrayList(AttrNames.ExportParam);
        pageExportAttrs_arr.forEach((attrItem, index) => {
            var outSocket = null;
            if (index >= this.outputScokets_arr.length) {
                outSocket = new NodeSocket(attrItem.name, this, false);
                this.addSocket(outSocket);
            }
            else {
                outSocket = this.outputScokets_arr[index];
            }
            var paramLabel = this.targetPage.getAttribute(attrItem.name);
            if (paramLabel != outSocket.label) {
                outSocket.label = paramLabel;
                outSocket.fireEvent('changed');
            }
        });
        while (this.outputScokets_arr.length > pageExportAttrs_arr.length) {
            this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
        }

        this.fireEvent(Event_SocketNumChanged, 20);
        this.fireMoved(10);
    }

    listenPage(page) {
        if (page) {
            page.on(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    unlistenPage(page) {
        if (page) {
            page.off(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    setPage(target) {
        if (target == this.targetPage) {
            return;
        }
        this.unlistenPage(this.targetPage);
        this.listenPage(target);
        this.targetPage = target;
        this.pageCode = target ? target.id : null;
        this.pageChangedHandler();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.pageCode = this.pageCode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['pageCode']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theProject = this.bluePrint.master.project;
        var thePage = theProject.getPageById(this.pageCode);
        if (this.checkCompileFlag(thePage == null, '选择的不是有效的页面', helper)) {
            return false;
        }

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);

        this.pageChangedHandler();
        var exportParamName = this.id + 'exportParam';
        var entryParamName = this.id + 'entryParam';
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        var callBackBlock = new FormatFileBlock('callback');
        var callBackName = this.id + '_callback';
        if (flowLinks_arr.length > 0) {
            myJSBlock.pushLine('var ' + callBackName + '=(' + exportParamName + ')=>{', 1);
            myJSBlock.pushChild(callBackBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
        }

        myJSBlock.pushLine('var ' + entryParamName + '={', 1);
        var i;
        var theSocket;
        for (i = 0; i < this.inputScokets_arr.length; ++i) {
            theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, myJSBlock, true);
            if (socketComRet.err) {
                return false;
            }
            myJSBlock.pushLine(makeStr_AddAll(theSocket.label, ':', socketComRet.value, ','));
        }
        myJSBlock.pushLine(makeStr_AddAll('callBack', ':', flowLinks_arr.length > 0 ? callBackName : 'null', ','));
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');
        myJSBlock.pushLine(makeLine_setGDataCache(thePage.id + AttrNames.EntryParam, entryParamName));
        myJSBlock.pushLine("setTimeout(() => {store.dispatch(makeAction_gotoPage('" + this.pageCode + "'));},50);");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        for (i = 0; i < this.outputScokets_arr.length; ++i) {
            theSocket = this.outputScokets_arr[i];
            if (this.checkCompileFlag(IsEmptyString(theSocket.label), '输出参数名字不能为空', helper)) {
                return false;
            }
            selfCompileRet.setSocketOut(theSocket, exportParamName + '.' + theSocket.label);
        }
        if (flowLinks_arr.length > 0) {
            var flowCompileRet = this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, callBackBlock);
            if (flowCompileRet == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_Control_Api_CallFun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CONTROL_API_CALLFUN, 'CtlApiCallfun', false, nodeJson);
        autoBind(this);
        var funItem = this.funItem;
        var apiClass = this.apiClass;
        if (funItem == null) {
            apiClass = g_controlApi_arr.find(e => { return e.ctltype == this.ctltype; });
            funItem = apiClass.getApiItemByid(this.apiid);
            if (apiClass == null || funItem == null) {
                console.error('查询控件api失败！');
            }
            this.apiClass = apiClass;
            this.funItem = funItem;
        }
        if (apiClass.ctltype == UserControlKernel_Type) {
            this.isUserControlEvent = funItem.funItem.label == '自订事件';
            this.isUserControlFunction = funItem.funItem.label == '自订方法';
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (this.isUserControlEvent) {
            this.label = 'Fire:自订控件事件';
        }
        else if (this.isUserControlFunction) {
            this.label = 'Call:自订控件方法';
        }
        else {
            this.label = 'Call:' + apiClass.ctllabel + '.' + funItem.name;
        }
        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.ctlSocket = this.inputScokets_arr[0];
            }
        }
        if (this.ctlSocket == null) {
            this.ctlSocket = new NodeSocket('ctl', this, true);
            this.addSocket(this.ctlSocket);
        }
        this.ctlSocket.inputable = false;
        this.ctlSocket.type = SocketType_CtlKernel;
        this.ctlSocket.kernelType = apiClass.ctltype;
        this.ctlSocket.index = -999;

        if (this.isUserControlEvent || this.isUserControlFunction) {
            if (createHelper && createHelper.project) {
                createHelper.project.on('loaded', this.projLoadedHandler);
            }
        }
    }

    projLoadedHandler() {
        if (this.isUserControlEvent || this.isUserControlFunction) {
            this.ctlSocket.on('changed', this.synUCEParams);
            this.synUCEParams();
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.ctltype = this.apiClass.ctltype;
        rlt.apiid = this.funItem.id;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['ctltype', 'apiid']);
    }

    synUCEParams() {
        if (!this.isUserControlEvent && !this.isUserControlFunction) {
            return;
        }
        var params_arr = [];
        var selectedCtlid = this.ctlSocket.getExtra('ctlid');
        var funAttrName = this.ctlSocket.getExtra('funAttrName');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (selectedKernel && selectedKernel.isTemplate()) {
            if (this.isUserControlEvent) {
                funAttrName = funAttrName.replace('#', '_');
                var funAttrValue = selectedKernel[funAttrName];
                if (funAttrValue && !IsEmptyString(funAttrValue.params)) {
                    params_arr = funAttrValue.params.split(';');
                }
            }
            else {
                var funBPname = selectedKernel.id + '_' + funAttrName;
                var funBp = project.scriptMaster.getBPByName(funBPname);
                if (funBp != null) {
                    params_arr = funBp.getParamNames();
                }
            }
        }
        this.inputScokets_arr.forEach(item => {
            if (item != this.ctlSocket) {
                item._validparam = false;
            }
        });
        var hadChanged = false;
        params_arr.forEach((param, i) => {
            var theSocket = this.getScoketByName(param);
            if (theSocket == null) {
                this.addSocket(new NodeSocket(param, this, true, { type: SqlVarType_Scalar, label: param, index: i + 1 }));
                hadChanged = true;
            }
            else {
                theSocket._validparam = true;
                if (theSocket.label != param) {
                    theSocket.set({ label: param });
                }
                theSocket.index = i;
            }
        }
        );
        var needSort = false;
        var si;
        for (si = 1; si < this.inputScokets_arr.length; ++si) {
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
            this.inputScokets_arr.sort((sa, sb) => {
                return sa.index > sb.index;
            });
        }
        if (hadChanged || needSort) {
            this.fireEvent(Event_SocketNumChanged, 20);
            this.bluePrint.fireChanged();
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
        var project = this.bluePrint.master.project;

        var selectedCtlid = this.ctlSocket.getExtra('ctlid');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
            return false;
        }
        var funAttrName;
        var funAttrValue;
        if (this.isUserControlEvent) {
            if (this.checkCompileFlag(!selectedKernel.isTemplate(), '只能在自订控件内部来触发事件', helper)) {
                return false;
            }
            funAttrName = this.ctlSocket.getExtra('funAttrName');
            if (this.checkCompileFlag(IsEmptyString(funAttrName), '需要选择事件', helper)) {
                return false;
            }
            funAttrName = funAttrName.replace('#', '_');
            funAttrValue = selectedKernel[funAttrName];
            if (this.checkCompileFlag(funAttrValue == null, '事件未找到', helper)) {
                return false;
            }
            this.synUCEParams();
        }
        if (this.isUserControlFunction) {
            funAttrName = this.ctlSocket.getExtra('funAttrName');
            if (this.checkCompileFlag(IsEmptyString(funAttrName), '需要选择方法', helper)) {
                return false;
            }

            funAttrValue = {
                name: selectedKernel.getTemplateKernel().id + '_' + funAttrName,
            }
            if (this.checkCompileFlag(project.scriptMaster.getBPByName(funAttrValue.name) == null, '方法未创建', helper)) {
                return false;
            }
            this.synUCEParams();
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
            return false;
        }
        var myJSBlock = new FormatFileBlock(this.id);
        var belongUserCtl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);

        var useApiItem = this.apiItem;
        myJSBlock.pushLine('setTimeout(() => {', 1);
        if (this.isUserControlEvent || this.isUserControlFunction) {
            var bundleStr = '';
            for (var i = 1; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var tValue = socketComRet.value;
                bundleStr += (bundleStr.length > 0 ? ',' : '') + theSocket.label + ':' + tValue
            }
            var pathVar = selectedKernel.id + "_path + '.fun_" + funAttrValue.name + "'";
            if (this.isUserControlFunction) {
                if (!selectedKernel.isTemplate()) {
                    pathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + selectedKernel.getStatePath('fun_' + funAttrValue.name));
                }
                //bundleStr += (bundleStr.length > 0 ? ',' : '') + selectedKernel.getTemplateKernel().id + '_path:' + selectedKernel.id + '_path';
            }
            myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath({" + bundleStr + "}," + pathVar + "));", -1);
            useApiItem = {
                name: funAttrValue.name,
            };
            helper.addUseControlEventApi(selectedKernel, useApiItem, EFormRowSource.Context);
        }
        else {
            if (selectedKernel.type == MFileUploader_Type && this.funItem.name == 'Reset') {
                var cltPathVar = singleQuotesStr(selectedKernel.getStatePath('', '.', { mapVarName: VarNames.RowKeyInfo_map }));
                if (belongUserCtl) {
                    cltPathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + selectedKernel.getStatePath(''));
                }
                myJSBlock.pushLine("ResetMFileUploader(" + cltPathVar + ");", -1);
            }
            else {
                myJSBlock.pushLine(selectedKernel.id + "_" + this.funItem.name + "();", -1);
            }
        }
        myJSBlock.pushLine('},50);');
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

class JSNode_CallCusScript extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CALLCUSSCRIPT, '调用脚本', false, nodeJson);
        autoBind(this);
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (createHelper) {
            if (!IsEmptyString(this.script_id)) {
                if (!createHelper.project.loaded) {
                    createHelper.project.on('loaded', this.projLoadedHandler);
                }
                else {
                    this.projLoadedHandler();
                }
            }
        }
    }

    projLoadedHandler() {
        this.synSockets();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.script_id = this.script_id;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['script_id']);
    }

    synSockets() {
        var scriptBP = this.bluePrint.master.getBPByCode(this.script_id);

        this.inputScokets_arr.forEach(s => {
            s.valid = false;
        });
        this.outputScokets_arr.forEach(s => {
            s.valid = false;
        });

        var socket;
        if (scriptBP) {
            scriptBP.vars_arr.filter(varData => {
                return varData.isParam;
            }).forEach(varData => {
                socket = this.getScoketByName(varData.id);
                if (socket) {
                    socket.valid = true;
                    if (socket.label != varData.name) {
                        socket.label = varData.name;
                        socket.fireEvent('changed');
                    }
                }
                else {
                    socket = new NodeSocket(varData.id, this, true, { label: varData.name });
                    this.addSocket(socket);
                }
                socket.inputable = true;
            });

            scriptBP.returnVars_arr.forEach(varData => {
                socket = this.getScoketByName(varData.id);
                if (socket) {
                    socket.valid = true;
                    if (socket.label != varData.name) {
                        socket.label = varData.name;
                        socket.fireEvent('changed');
                    }
                }
                else {
                    socket = new NodeSocket(varData.id, this, false, { label: varData.name });
                    this.addSocket(socket);
                }
            });
        }

        this.inputScokets_arr.filter(s => { return s.valid == false; }).forEach(s => { this.removeSocket(s) });
        this.outputScokets_arr.filter(s => { return s.valid == false; }).forEach(s => { this.removeSocket(s) });

        this.fireEvent(Event_SocketNumChanged, 20);
        this.fireMoved(10);
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
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
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var project = this.bluePrint.master.project;

        if (this.checkCompileFlag(IsEmptyString(this.script_id), '需要选择目标脚本', helper)) {
            return false;
        }
        var targetBP = this.bluePrint.master.getBPByCode(this.script_id);
        if (this.checkCompileFlag(targetBP == null, '选择的脚本无效', helper)) {
            return false;
        }
        if (this.checkCompileFlag(targetBP.group != EJsBluePrintFunGroup.Custom, '你竟然选择了一个非自定义脚本，奇怪了', helper)) {
            return false;
        }
        this.synSockets();
        var targetBPComedFun = null;
        if (helper.jsBPCacheManager) {
            targetBPComedFun = helper.jsBPCacheManager.getCache(targetBP.code + '_fun');
        }

        var inscoketsValues = {};
        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            inscoketsValues[socket.label] = socketComRet.value;
        }

        var thisRetVarName = this.id + '_ret';
        var thisErrVarName = this.id + '_err';
        var myJSBlock = new FormatFileBlock(this.id);
        var flowUseBlock = myJSBlock;
        belongBlock.pushChild(myJSBlock);
        var bUseCallback = false;
        var useParams_arr = [];
        this.hadServerFetch = false;
        if (targetBPComedFun) {
            targetBPComedFun.orginParams_arr.forEach(paramName => {
                useParams_arr.push(inscoketsValues[paramName]);
            });
            if (targetBPComedFun.hadServerFetch) {
                helper.compilingFun.hadServerFetch = true;
                this.hadServerFetch = true;
                bUseCallback = true;
                flowUseBlock = new FormatFileBlock('callback');
                var callBackVarName = this.id + '_callback';
                myJSBlock.pushLine('var ' + callBackVarName + '=(' + thisRetVarName + ',' + thisErrVarName + ')=>{', 1);
                if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                    myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
                    myJSBlock.pushLine('if(' + thisErrVarName + '){return callback_final(null, null,' + thisErrVarName + ');}');
                }
                else {
                    myJSBlock.pushLine('if(' + thisErrVarName + '){return _callback(null,' + thisErrVarName + ');}');
                }

                myJSBlock.pushChild(flowUseBlock);
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('};');
                useParams_arr.push(callBackVarName);
            }
        }
        else {
            useParams_arr = this.inputScokets_arr.map(x => { return x.name; });
        }


        myJSBlock.pushLine((bUseCallback ? '' : 'var ' + thisRetVarName + '=') + makeStr_callFun(targetBPComedFun ? targetBPComedFun.name : targetBP.code, useParams_arr, ';'));

        var selfCompileRet = new CompileResult(this);
        this.outputScokets_arr.forEach(osocket => {
            selfCompileRet.setSocketOut(osocket, thisRetVarName + '.' + osocket.label);
        });

        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, flowUseBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}


class JSNODE_Delete_Table extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DELETE_TABLE, 'Delete', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

        this.addFrameButton(FrameButton_LineSocket, '拉平');
        this.addFrameButton(FrameButton_ClearEmptyInputSocket, '清理');

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outputScokets_arr.length > 0) {
            for (var si in this.outputScokets_arr) {
                var socket = this.outputScokets_arr[si];
                if (socket.name == 'count') {
                    this.countOutSocket = socket;
                    socket.label = 'count';
                }
                else if (socket.name == 'err') {
                    this.errInfoOutSocket = socket;
                    socket.label = 'errinfo';
                }
            }
        }
        if (this.countOutSocket == null) {
            this.countOutSocket = new NodeSocket('count', this, false, { label: 'count', type: ValueType.Int });
            this.addSocket(this.countOutSocket);
        }
        if (this.errInfoOutSocket == null) {
            this.errInfoOutSocket = new NodeSocket('err', this, false, { label: '错误信息', type: ValueType.String });
            this.addSocket(this.errInfoOutSocket);
        }

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
            if (!bluePrintIsServer) {
                this.sucessFlowSocket = new NodeFlowSocket('sucess', this, false);
                this.failFlowSocket = new NodeFlowSocket('fail', this, false);
                this.addSocket(this.sucessFlowSocket);
                this.addSocket(this.failFlowSocket);
            }
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
        if (bluePrintIsServer) {
            if (this.sucessFlowSocket) {
                this.removeSocket(this.sucessFlowSocket);
            }
            if (this.failFlowSocket) {
                this.removeSocket(this.failFlowSocket);
            }
        }
        if (!IsEmptyString(this.dsCode)) {
            this.setDSCode(this.dsCode);
        }
        this.inputScokets_arr.forEach(socket => {
            socket.inputable = true;
            socket.autoHideInput = false;
            socket.inputDDC_setting = this.insocketDDC_setting;
        });
        if (this.sucessFlowSocket) {
            this.sucessFlowSocket.label = '成功';
            this.failFlowSocket.label = '失败';
        }
        this.serverSucessFlowSocket.label = 'server成功';
        this.serverFailFlowSocket.label = 'server失败';
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
        else {
            if (entity == null) {
                while (this.inputScokets_arr.length > 0) {
                    this.removeSocket(this.inputScokets_arr[0]);
                }
            }
        }
        this.fireChanged();
        this.fireEvent(Event_SocketNumChanged);
        this.fireMoved(10);
    }

    getUseDSColumns() {
        var rlt = [];
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS != null && theDS.columns != null) {
            return theDS.columns;
        }
        return rlt;
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
            jsonProf.useEntity(this.targetEntity);
        }
        rlt.autoCallFetchEnd = this.autoCallFetchEnd;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity', 'autoCallFetchEnd']);
    }

    genInSocket() {
        var theDS = g_dataBase.getEntityByCode(this.dsCode);
        if (theDS == null || theDS.columns == null) {
            return null;
        }
        var useColumn = null;
        for (var ci in theDS.columns) {
            var column = theDS.columns[ci];
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
                autoHideInput: false,
            });
        }
        return null;
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
        }
        this.entitySynedHandler();
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var targetEntity = this.targetEntity;
        var myServerBlock = new FormatFileBlock('serverblock');
        belongBlock.pushChild(myServerBlock);

        // make server side code
        var paramInitBlock = null;

        var sqlVarName = this.id + '_sql';
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;

        var paramVarName = this.id + 'params_arr';
        var paramInitBlock = new FormatFileBlock('initparam');
        myServerBlock.pushChild(paramInitBlock);
        paramInitBlock.pushLine('var ' + paramVarName + "=[", 1);

        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + theSocket.name.trim().replace('@', '') + "', sqlTypes.NVarChar(4000), " + socketValue + "),");
        }
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');

        var sqlInitValue;
        var bpCompileHelper = null;
        if (helper.sqlBPCacheManager) {
            sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
            bpCompileHelper = helper.sqlBPCacheManager.getCache(targetEntity.code + '_helper');
        }
        else {
            bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
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
        if (this.checkCompileFlag(!IsEmptyObject(bpCompileHelper.useUrlVar_map), '不可使用URL参数', helper)) {
            return false;
        }

        myServerBlock.pushLine("var " + sqlVarName + " = " + doubleQuotesStr(sqlInitValue) + ';');
        myServerBlock.pushLine("var " + dataVarName + " = 0;");
        myServerBlock.pushLine("try{", 1);
        myServerBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + sqlVarName + " + ' select @@ROWCOUNT', " + paramVarName + ");");
        myServerBlock.subNextIndent();
        myServerBlock.pushLine("}catch(" + errorVarName + "){", 1);
        myServerBlock.pushChild(serverFailBlock);
        myServerBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        myServerBlock.subNextIndent();
        myServerBlock.pushLine('}');
        myServerBlock.pushChild(serverCompleteBlock);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
        selfCompileRet.setSocketOut(this.identityOutSocket, dataVarName);
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
        helper.setCompileRetCache(this, selfCompileRet);

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var targetEntity = this.targetEntity;
        if (this.checkCompileFlag(targetEntity == null || targetEntity.type != 'delete', '必须选择一个delete数据源', helper)) {
            return false;
        }
        if (this.checkCompileFlag(targetEntity.getParams().length == 0, targetEntity.name + '不是一个合法的delete数据源', helper)) {
            return false;
        }
        helper.addUseEntity(targetEntity, EUseEntityStage.Delete);

        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var relKernel = this.bluePrint.ctlKernel;
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            if (this.checkCompileFlag(relKernel == null || (relKernel.type != ButtonKernel_Type && relKernel.type != EmptyKernel_Type), '这个脚本蓝图必须关联到一个按钮控件中', helper)) {
                return false;
            }
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var serverClickFun = null;
        var paramInitBlock = null;
        var postCheckBlock = null;

        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverCompleteBlock = new FormatFileBlock('complete');;
        var serverFailBlock = new FormatFileBlock('fail');
        var dataVarName = 'data_' + this.id;
        var errorVarName = 'err_' + this.id;

        var blockInServer = belongBlock.getScope().isServerSide;
        var params_arr = [];
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

        var sqlInitValue;
        var bpCompileHelper = null;
        if (helper.sqlBPCacheManager) {
            sqlInitValue = helper.sqlBPCacheManager.getCache(targetEntity.code + '_sql');
            bpCompileHelper = helper.sqlBPCacheManager.getCache(targetEntity.code + '_helper');
        }
        else {
            bpCompileHelper = new SqlNode_CompileHelper(helper.logManager, null);
            bpCompileHelper.clickLogBadgeItemHandler = null;
            var compileRet = targetEntity.compile(bpCompileHelper);
            if (this.checkCompileFlag(compileRet == false, '自订数据源' + targetEntity.name + '编译发生错误，无法继续', helper)) {
                return false;
            }
            sqlInitValue = compileRet.sql;
        }
        if (this.checkCompileFlag(!IsEmptyObject(bpCompileHelper.useUrlVar_map), '不可使用URL参数', helper)) {
            return false;
        }


        var serverFun = null;
        var serverFunBodyBlock = null;
        paramInitBlock = new FormatFileBlock('initparam');
        postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }

        var serverSideActName = this.bluePrint.name + '_' + this.id;
        var paramVarName = this.id + 'params_arr';
        if (!blockInServer) {
            serverClickFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverClickFun);
            serverFunBodyBlock = serverClickFun.bodyBlock;
            helper.appendOutputItem(serverClickFun);
            serverClickFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            postCheckBlock.pushChild(postVarinitBlock);
            serverClickFun.bundleCheckBlock = postCheckBlock;
            serverClickFun.postVarinitBlock = postVarinitBlock;
            postCheckBlock.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            theServerSide.processesMapVarInitVal[serverClickFun.name] = serverClickFun.name;
            serverFun = serverClickFun;
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

        paramInitBlock.pushLine(paramVarName + "=[", 1);
        params_arr.forEach(param => {
            var paramName = this.id + '_' + param.name;
            postCheckBlock.pushLine('var ' + paramName + '=' + param.value + ';');
            postCheckBlock.pushLine("if(" + paramName + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + param.name + ']");}');
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + paramName + "),");
        });
        if (!IsEmptyObject(bpCompileHelper.useEnvVars)) {
            for (var useEnvName in bpCompileHelper.useEnvVars) {
                paramInitBlock.pushLine("dbhelper.makeSqlparam('" + useEnvName + "', sqlTypes.NVarChar(4000), g_envVar." + useEnvName + "),");
            }
        }

        serverFunBodyBlock.pushLine("try{", 1);
        serverFunBodyBlock.pushLine(dataVarName + " = yield dbhelper.asynGetScalar(" + doubleQuotesStr(sqlInitValue) + " + ' select @@ROWCOUNT', " + paramVarName + ");");
        serverFunBodyBlock.subNextIndent();
        serverFunBodyBlock.pushLine("}catch(" + errorVarName + "){", 1);
        serverFunBodyBlock.pushChild(serverFailBlock);
        serverFunBodyBlock.pushLine('return serverhelper.createErrorRet(' + errorVarName + '.message);');
        serverFunBodyBlock.subNextIndent();
        serverFunBodyBlock.pushLine('}');
        serverFunBodyBlock.pushChild(serverCompleteBlock);
        if (!blockInServer) {
            serverFunBodyBlock.pushLine("return " + dataVarName + ";");
        }


        if (paramInitBlock) {
            paramInitBlock.pushLine("dbhelper.makeSqlparam('_operator', sqlTypes.Int, req.session.g_envVar.userid),");
            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
        }

        var initBundleBlock = null;
        if (serverFun) {
            if (serverFun.bundleCheckBlock.initBundleBlock) {
                initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock
            }
            else {
                initBundleBlock = new FormatFileBlock('initbundle');
                serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
            }
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
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

        // make client
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
        if (!blockInServer) {
            belongBlock.pushChild(myJSBlock);
        }

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        helper.addInitClientBundleBlock(initBundleBlock);
        myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
        myJSBlock.pushChild(initBundleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});');
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + (serverClickFun ? serverClickFun.name : 'unknown') + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errorVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        var errCheckIf = new JSFile_IF('checkerr', errorVarName + ' == null');
        fetchEndBlock.pushChild(errCheckIf);
        myJSBlock.subNextIndent();
        if (inreducer) {
            myJSBlock.pushLine('})))}, 50);');
        }
        else {
            myJSBlock.pushLine('})));');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.countOutSocket, dataVarName);
        selfCompileRet.setSocketOut(this.errInfoOutSocket, errorVarName + ".info");
        helper.setCompileRetCache(this, selfCompileRet);

        helper.compilingFun.defaultBlock = errCheckIf.trueBlock;

        var autoCallFetchEnd = this.autoCallFetchEnd != false;

        var trueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.sucessFlowSocket);
        if (trueFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                return false;
            }
            if (this.compileFlowNode(trueFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.trueBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            errCheckIf.trueBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }


        var falseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.failFlowSocket);
        if (falseFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, '节点是从服务端代码节点过来的，所以客户端成功出口无效', helper)) {
                return false;
            }
            if (this.compileFlowNode(falseFlowLinks_arr[0], helper, usePreNodes_arr, errCheckIf.falseBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            errCheckIf.falseBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errorVarName]) + ';');
        }

        var serverTrueFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverSucessFlowSocket);
        if (theServerSide != null && serverTrueFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverTrueFlowLinks_arr[0], helper, usePreNodes_arr, serverCompleteBlock) == false) {
                return false;
            }
        }

        var serverFalseFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFailFlowSocket);
        if (theServerSide != null && serverFalseFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFalseFlowLinks_arr[0], helper, usePreNodes_arr, serverFailBlock) == false) {
                return false;
            }
        }

        //var finalStr = 'insert ' + midbracketStr(useDS.name) + '(' + insertColumnStr + ') values(' + insertValueStr + ')'
        //console.log(finalStr);
        return selfCompileRet;
    }
}

class JSNode_PopMessageBox extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_POPMESSAGEBOX, 'PopMsg', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
        }

        for (var si = 0; si < this.inputScokets_arr.length; ++si) {
            var theSocket = this.inputScokets_arr[si];
            switch (theSocket.name) {
                case 'tip':
                    this.tipInputSocket = theSocket;
                    break;
            }
        }

        if (this.tipInputSocket == null) {
            this.tipInputSocket = new NodeSocket('tip', this, true, { type: ValueType.Any });
            this.addSocket(this.tipInputSocket);
        }
        this.tipInputSocket.label = '消息内容';
        this.tipInputSocket.inputable = true;
    }

    flowSocketLabelChanged(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-sid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('btnlabel', ev.target.value.trim());
        theSocket.fireEvent('changed', 10);
    }

    customFlowSocketRender(socket) {
        if (socket.isIn) {
            return null;
        }
        var label = socket.getExtra('btnlabel', '');
        var key = socket.getExtra('key');
        return <div className='d-flex flex-grow1 flex-shrink-1'>
            <span f-canmove={1} className='badge badge-primary'>名称</span>
            <input type='text' className='socketInputer' d-sid={socket.id} value={label} onChange={this.flowSocketLabelChanged} />
        </div>;
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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        helper.bNeedMsgBox = true;
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
        var bpGroup = this.bluePrint.group;
        if (this.checkCompileFlag(bpGroup != EJsBluePrintFunGroup.GridRowBtnHandler && bpGroup != EJsBluePrintFunGroup.CtlEvent, '不适用于此蓝图类型', helper)) {
            return false;
        }
        var oi;
        var msgBoxVarName = this.bluePrint.id + '_msg';
        var keyVarName = this.id + '_key';
        var socketComRet = this.getSocketCompileValue(helper, this.tipInputSocket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var btnSetStr = '';
        var flowSocket;
        var hadBtnLabels_map = {};
        for (oi in this.outFlowSockets_arr) {
            flowSocket = this.outFlowSockets_arr[oi];
            var btnLabel = flowSocket.getExtra('btnlabel');
            if (this.checkCompileFlag(hadBtnLabels_map[btnLabel], '输出流名称不能重复', helper)) {
                return false;
            }
            if (this.checkCompileFlag(IsEmptyString(btnLabel), '输出流没有设置名称', helper)) {
                return false;
            }
            btnSetStr += (btnSetStr.length == 0 ? '' : ',') + "{label:'" + btnLabel + "',key:'" + btnLabel + "'}";
        }
        var tipValue = socketComRet.value;
        var flowsBlock = new FormatFileBlock('flows');
        myJSBlock.pushLine(makeStr_AddAll(msgBoxVarName, '.query(', tipValue, ',', midbracketStr(btnSetStr), ',(', keyVarName, ')=>{'), 1);
        myJSBlock.pushChild(flowsBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});');
        var flowLinks_arr = null;
        var flowLink = null;
        var nextNodeCompileRet = null;

        for (oi in this.outFlowSockets_arr) {
            flowSocket = this.outFlowSockets_arr[oi];
            var btnLabel = flowSocket.getExtra('btnlabel');
            var flowBlock = new FormatFileBlock(flowSocket.id);
            flowBlock.pushLine('if(' + keyVarName + '==' + singleQuotesStr(btnLabel) + '){', 1);
            flowsBlock.pushChild(flowBlock);
            flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(flowSocket);
            if (flowLinks_arr.length == 0) {
                flowBlock.pushLine(msgBoxVarName + '.fireClose();');
            }
            else {
                flowLink = flowLinks_arr[0];
                nextNodeCompileRet = this.compileFlowNode(flowLink, helper, usePreNodes_arr, flowBlock);
                if (nextNodeCompileRet == false) {
                    return false;
                }
            }
            flowBlock.subNextIndent();
            flowBlock.pushLine('}');
        }

        return selfCompileRet;
    }
}

class JSNode_CloseMessageBox extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CLOSEMESSAGEBOX, 'CloseMsg', false, nodeJson);
        autoBind(this);

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        var msgBoxVarName = this.bluePrint.id + '_msg';
        myJSBlock.pushLine('if(' + msgBoxVarName + '!=null){' + msgBoxVarName + '.fireClose();}');
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

class JSNode_HideMessageBox extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_HIDEMESSAGEBOX, 'HideMsg', false, nodeJson);
        autoBind(this);

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        var msgBoxVarName = this.bluePrint.id + '_msg';
        myJSBlock.pushLine('if(' + msgBoxVarName + '!=null){' + msgBoxVarName + '.fireHide();}');
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

class JSNode_ShowMessageBox extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SHOWMESSAGEBOX, 'ShowMsg', false, nodeJson);
        autoBind(this);

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        var msgBoxVarName = this.bluePrint.id + '_msg';
        myJSBlock.pushLine('if(' + msgBoxVarName + '!=null){' + msgBoxVarName + '.fireShow();}');
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

class JSNode_SetMessageBoxToLoading extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SETMESSAGEBOXTOLOADING, 'SetMsgToLoading', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.inputScokets_arr.length != 0) {
            this.tipSocket = this.inputScokets_arr[0];
        }
        if (this.tipSocket == null) {
            this.tipSocket = new NodeSocket('tip', this, true);
            this.addSocket(this.tipSocket);
        }
        this.tipSocket.label = 'tip';
        this.tipSocket.inputable = true;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var comret = this.getSocketCompileValue(helper, this.tipSocket, [], belongBlock, true, true);
        if (comret == false) {
            return false;
        }
        var tip = IsEmptyString(comret.value) ? "'处理中'" : comret.value;

        var myJSBlock = new FormatFileBlock(this.id);
        var msgBoxVarName = this.bluePrint.id + '_msg';
        myJSBlock.pushLine('if(' + msgBoxVarName + '!=null){' + msgBoxVarName + ".setData('',EMessageBoxType.Loading, " + tip + ");}");
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

class JSNode_CloseTopFrame extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CLOSETOPFRAME, '关闭TopFrame', false, nodeJson);
        autoBind(this);

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        myJSBlock.pushLine('if(gParentFrame){gParentFrame.close();}');
        myJSBlock.pushLine('else{gTopLevelFrameRef.current.close();}');
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

class JSNode_ClosePopper extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CLOSEPOPPER, '关闭Popper', false, nodeJson);
        autoBind(this);

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        if (this.checkCompileFlag(blockInServer, '本节点必须要client流中执行', helper)) {
            return false;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock(this.id);
        var belongPopper = this.bluePrint.ctlKernel.searchParentKernel(PopperButtonKernel_Type, true);
        if (this.checkCompileFlag(belongPopper == null, '没有找到所属PopperButton', helper)) {
            return false;
        }

        var batchNode = null;
        if (preNodes_arr[preNodes_arr.length - 1].type == JSNODE_BATCH_CONTROL_API_PROPSETTER) {
            batchNode = preNodes_arr[preNodes_arr.length - 1];
        }

        var pathVar = belongPopper.getStatePath('', '.', { mapVarName: VarNames.RowKeyInfo_map });
        var belongUserCtl = belongPopper.searchParentKernel(UserControlKernel_Type, true);
        if (belongUserCtl) {
            pathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + pathVar);
        }
        else {
            pathVar = singleQuotesStr(pathVar);
        }

        if (batchNode) {
            myJSBlock.pushLine('ClosePopperBtn(' + pathVar + ',' + batchNode.id + ');');
        }
        else {
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myJSBlock.pushLine('setTimeout(() => {', 1);
            }
            myJSBlock.pushLine('ClosePopperBtn(' + pathVar + ');');
            if (inreducer) {
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('}, 50);');
            }
        }
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (!batchNode) {
            if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_PopPage extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_POP_PAGE, '弹出页面', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (createHelper) {
            if (!IsEmptyString(this.pageCode)) {
                if (!createHelper.project.loaded) {
                    createHelper.project.on('loaded', this.projLoadedHandler);
                }
                else {
                    this.projLoadedHandler();
                }
            }
        }
    }

    projLoadedHandler() {
        var project = this.bluePrint.master.project;
        var targetPage = project.getPageById(this.pageCode);
        this.setPage(targetPage);
    }

    pageChangedHandler() {
        if (this.targetPage == null) {
            while (this.inputScokets_arr.length > 0) {
                this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
            }
            while (this.outputScokets_arr.length > 0) {
                this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
            }
            return;
        }
        var pageEntryAttrs_arr = this.targetPage.getAttrArrayList(AttrNames.EntryParam);
        pageEntryAttrs_arr.forEach((attrItem, index) => {
            var inSocket = null;
            if (index >= this.inputScokets_arr.length) {
                inSocket = new NodeSocket(attrItem.name, this, true);
                this.addSocket(inSocket);
            }
            else {
                inSocket = this.inputScokets_arr[index];
            }
            var paramLabel = this.targetPage.getAttribute(attrItem.name);
            if (paramLabel != inSocket.label) {
                inSocket.label = paramLabel;
                inSocket.fireEvent('changed');
            }
            inSocket.inputable = false;
        });
        while (this.inputScokets_arr.length > pageEntryAttrs_arr.length) {
            this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
        }

        var pageExportAttrs_arr = this.targetPage.getAttrArrayList(AttrNames.ExportParam);
        pageExportAttrs_arr.forEach((attrItem, index) => {
            var outSocket = null;
            if (index >= this.outputScokets_arr.length) {
                outSocket = new NodeSocket(attrItem.name, this, false);
                this.addSocket(outSocket);
            }
            else {
                outSocket = this.outputScokets_arr[index];
            }
            var paramLabel = this.targetPage.getAttribute(attrItem.name);
            if (paramLabel != outSocket.label) {
                outSocket.label = paramLabel;
                outSocket.fireEvent('changed');
            }
        });
        while (this.outputScokets_arr.length > pageExportAttrs_arr.length) {
            this.removeSocket(this.outputScokets_arr[this.outputScokets_arr.length - 1]);
        }

        this.fireEvent(Event_SocketNumChanged, 20);
        this.fireMoved(10);
    }

    listenPage(page) {
        if (page) {
            page.on(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    unlistenPage(page) {
        if (page) {
            page.off(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    setPage(target) {
        if (target == this.targetPage) {
            return;
        }
        this.unlistenPage(this.targetPage);
        this.listenPage(target);
        this.targetPage = target;
        this.pageCode = target ? target.id : null;
        this.pageChangedHandler();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.pageCode = this.pageCode;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['pageCode']);
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }

        result.pushVariable(this.id + 'exportParam', targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theProject = this.bluePrint.master.project;
        var thePage = theProject.getPageById(this.pageCode);
        if (this.checkCompileFlag(thePage == null, '选择的不是有效的页面', helper)) {
            return false;
        }
        if (this.checkCompileFlag(thePage.getAttribute(AttrNames.PopablePage) == false, '目标页面无法弹出', helper)) {
            return false;
        }

        this.pageChangedHandler();

        var entryParamName = this.id + 'entryParam';
        var exportParamName = this.id + 'exportParam';
        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        var callBackBlock = new FormatFileBlock('callback');
        var callBackName = this.id + '_callback';
        if (flowLinks_arr.length > 0) {
            myJSBlock.pushLine('var ' + callBackName + '=(' + exportParamName + ')=>{', 1);
            myJSBlock.pushChild(callBackBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('};');
        }

        myJSBlock.pushLine('var ' + entryParamName + '={', 1);
        var socketValues_arr = [];
        var i;
        var theSocket;
        for (i = 0; i < this.inputScokets_arr.length; ++i) {
            theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, myJSBlock, true);
            if (socketComRet.err) {
                return false;
            }
            socketValues_arr.push(socketComRet.value);
            myJSBlock.pushLine(makeStr_AddAll(theSocket.label, ':', socketComRet.value, ','));
        }
        myJSBlock.pushLine(makeStr_AddAll('callBack', ':', flowLinks_arr.length > 0 ? callBackName : 'null', ','));
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');
        myJSBlock.pushLine(makeLine_setGDataCache(thePage.id + AttrNames.EntryParam, entryParamName));
        var inreducer = this.isInReducer(preNodes_arr);
        myJSBlock.pushLine(makeStr_callFun(makeFName_initPage(thePage), inreducer ? [VarNames.State] : null, ';'));
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        myJSBlock.pushLine(makeStr_AddAll('popPage(', singleQuotesStr(thePage.id), ',<', thePage.getReactClassName(true), " key='", thePage.id, "' />);"));
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        for (i = 0; i < this.outputScokets_arr.length; ++i) {
            theSocket = this.outputScokets_arr[i];
            if (this.checkCompileFlag(IsEmptyString(theSocket.label), '输出参数名字不能为空', helper)) {
                return false;
            }
            selfCompileRet.setSocketOut(theSocket, exportParamName + '.' + theSocket.label);
        }

        if (flowLinks_arr.length > 0) {
            var flowCompileRet = this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, callBackBlock);
            if (flowCompileRet == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_GetPageEntryParam extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETPAGE_ENTRYPARAM, '获取页面入口参数', false, nodeJson);
        autoBind(this);

        var inSocket;
        if (this.inputScokets_arr.length == 0) {
            inSocket = new NodeSocket('int', this, true);
            this.addSocket(inSocket);
        }
        else {
            inSocket = this.inputScokets_arr[0];
        }
        inSocket.label = '默认值';
        inSocket.inputable = true;
        this.inSocket = inSocket;

        var outSocket;
        if (this.outputScokets_arr.length == 0) {
            outSocket = new NodeSocket('out', this, false);
            this.addSocket(outSocket);
        }
        else {
            outSocket = this.outputScokets_arr[0];
        }
        this.outSocket = outSocket;
        this.headType = 'tiny';
    }

    paramDDCChanged(value) {
        this.outSocket.defval = value;
    }

    customSocketRender(socket) {
        if (socket.isIn) {
            return null;
        }
        var kernel = this.bluePrint.master.project.getControlById(this.bluePrint.ctlID);
        if (kernel == null) {
            return (<span f-canmove={1} className='badge badge-danger'>找不到页面</span>);
        }
        var belongPage = kernel.type == M_PageKernel_Type ? kernel : kernel.searchParentKernel(M_PageKernel_Type, true);
        if (belongPage == null) {
            return null;
        }
        var nowVal = socket.defval;
        return <DropDownControl itemChanged={this.paramDDCChanged} btnclass='btn-dark' options_arr={belongPage.getAllEntryParams} rootclass='flex-grow-1 flex-shrink-1' textAttrName='value' valueAttrName='name' value={nowVal} />;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        var thePage = this.bluePrint.ctlKernel.searchParentKernel(M_PageKernel_Type, true);
        var paramName = thePage.getAttribute(this.outSocket.defval);
        result.pushVariable(thePage.id + '_' + paramName, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.checkCompileFlag(this.bluePrint.ctlKernel == null, '需要关联到一个控件中', helper)) {
            return false;
        }
        var ctlKernel = this.bluePrint.ctlKernel;
        var thePage = ctlKernel.type == M_PageKernel_Type ? ctlKernel : ctlKernel.searchParentKernel(M_PageKernel_Type, true);
        if (this.checkCompileFlag(thePage == null, '此处获取不到所在页面', helper)) {
            return false;
        }
        if (this.checkCompileFlag(IsEmptyString(this.outSocket.defval), '请选择参数', helper)) {
            return false;
        }
        var paramName = thePage.getAttribute(this.outSocket.defval);
        if (this.checkCompileFlag(IsEmptyString(paramName), '选择的参数非法', helper)) {
            return false;
        }

        var inSocketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true, true);
        if (inSocketComRet.err) {
            return false;
        }

        var callParams_arr = [singleQuotesStr(thePage.id), singleQuotesStr(paramName)];
        if (!IsEmptyString(inSocketComRet.value)) {
            callParams_arr.push(inSocketComRet.value);
        }
        //var finalStr = makeStr_callFun('getPageEntryParam', callParams_arr);
        var finalStr = thePage.id + '_' + paramName;
        helper.addUsePageEnryParam(thePage.id, paramName, inSocketComRet.value);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_GetStepData extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETSTEPDATA, '获取URL步骤数据', false, nodeJson);
        autoBind(this);

        var inSocket;
        if (this.inputScokets_arr.length == 0) {
            inSocket = new NodeSocket('in', this, true);
            this.addSocket(inSocket);
        }
        else {
            inSocket = this.inputScokets_arr[0];
        }
        inSocket.label = '默认值';
        inSocket.inputable = true;
        this.inSocket = inSocket;

        var outSocket;
        if (this.outputScokets_arr.length == 0) {
            outSocket = new NodeSocket('out', this, false);
            this.addSocket(outSocket);
        }
        else {
            outSocket = this.outputScokets_arr[0];
        }
        this.outSocket = outSocket;
        this.headType = 'tiny';
    }

    flowStepDDCChanged(code, ddc, flowStep) {
        this.setFlowStep(flowStep);
    }

    setFlowStep(newValue) {
        this.outSocket.defval = newValue.code;
    }

    customSocketRender(socket) {
        if (socket.isIn) {
            return null;
        }
        var nowVal = socket.defval;
        return <DropDownControl itemChanged={this.flowStepDDCChanged} btnclass='btn-dark' options_arr={this.bluePrint.master.project.getUseFlowSteps} rootclass='flex-grow-1 flex-shrink-1' textAttrName='fullName' valueAttrName='code' value={nowVal} />;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        result.pushVariable('stepData' + this.outSocket.defval, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.checkCompileFlag(IsEmptyString(this.outSocket.defval), '需要选择一个步骤', helper)) {
            return false;
        }

        var inSocketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true, false);
        if (inSocketComRet.err) {
            return false;
        }


        var finalStr = 'stepData' + this.outSocket.defval;
        helper.addUseURLVairable(finalStr, inSocketComRet.value);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_ClosePage extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CLOSE_PAGE, '关闭页面', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        if (createHelper) {
            if (!createHelper.project.loaded) {
                createHelper.project.on('loaded', this.projLoadedHandler);
            }
            else {
                this.projLoadedHandler();
            }
        }
        else {
            this.projLoadedHandler();
        }
    }

    getBelongPage() {
        var kernel = this.bluePrint.master.project.getControlById(this.bluePrint.ctlID);
        return kernel == null ? null : kernel.searchParentKernel(M_PageKernel_Type, true);;
    }

    projLoadedHandler() {
        var targetPage = this.getBelongPage();
        this.setPage(targetPage);
    }

    pageChangedHandler() {
        if (this.targetPage == null) {
            while (this.inputScokets_arr.length > 0) {
                this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
            }
            return;
        }
        var pageExportAttrs_arr = this.targetPage.getAttrArrayList(AttrNames.ExportParam);
        pageExportAttrs_arr.forEach((attrItem, index) => {
            var inSocket = null;
            if (index >= this.inputScokets_arr.length) {
                inSocket = new NodeSocket(attrItem.name, this, true);
                this.addSocket(inSocket);
            }
            else {
                inSocket = this.inputScokets_arr[index];
            }
            var paramLabel = this.targetPage.getAttribute(attrItem.name);
            if (paramLabel != inSocket.label) {
                inSocket.label = paramLabel;
                inSocket.fireEvent('changed');
            }
        });
        while (this.inputScokets_arr.length > pageExportAttrs_arr.length) {
            this.removeSocket(this.inputScokets_arr[this.inputScokets_arr.length - 1]);
        }

        this.fireEvent(Event_SocketNumChanged, 20);
        this.fireMoved(10);
    }

    listenPage(page) {
        if (page) {
            page.on(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    unlistenPage(page) {
        if (page) {
            page.off(EATTRCHANGED, this.pageChangedHandler);
        }
    }

    setPage(target) {
        if (target == this.targetPage) {
            return;
        }
        this.unlistenPage(this.targetPage);
        this.listenPage(target);
        this.targetPage = target;
        this.pageChangedHandler();
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var thePage = this.getBelongPage();
        if (this.checkCompileFlag(thePage == null, '找不到关联页面', helper)) {
            return false;
        }
        /*
        if (this.checkCompileFlag(thePage.getAttribute(AttrNames.PopablePage) == false, '目标页面无法被关闭', helper)) {
            return false;
        }
        */
        this.setPage(thePage);

        this.pageChangedHandler();

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);

        var exportParamName = this.id + 'exportParam';
        myJSBlock.pushLine('var ' + exportParamName + '={', 1);
        var socketValues_arr = [];
        var i;
        var theSocket;
        for (i = 0; i < this.inputScokets_arr.length; ++i) {
            theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, myJSBlock, true, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            if (IsEmptyString(socketValue)) {
                socketValue = 'null';
            }
            socketValues_arr.push(socketValue);
            myJSBlock.pushLine(makeStr_AddAll(theSocket.label, ':', socketValue, ','));
        }
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');
        var callBackName = this.id + '_callback';
        myJSBlock.pushLine('closePage(' + singleQuotesStr(thePage.id) + ');');
        myJSBlock.pushLine('var ' + callBackName + ' = ' + makeStr_callFun('getPageEntryParam', [singleQuotesStr(thePage.id), singleQuotesStr('callBack')], ';'));
        myJSBlock.pushLine('if(' + callBackName + '){setTimeout(()=>{' + callBackName + '(' + exportParamName + ');},20);}');
        var selfCompileRet = new CompileResult(this);

        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Batch_Control_Api_Propsetter extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_BATCH_CONTROL_API_PROPSETTER, '批量设置api', false, nodeJson);
        autoBind(this);

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
    }

    genInputFlowSocket() {
        var nameI = this.inFlowSockets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('inflow' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeFlowSocket('inflow' + nameI, this, true);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        if (this.checkCompileFlag(this.inFlowSockets_arr.length == 0, '不能为空', helper)) {
            return false;
        }

        var myJSBlock = new FormatFileBlock('');
        var setBodyBlock = new FormatFileBlock('setBody');
        belongBlock.pushChild(myJSBlock);

        var needSetVarName = this.id;
        myJSBlock.pushLine('var ' + needSetVarName + ' = {};');
        myJSBlock.pushChild(setBodyBlock);
        myJSBlock.pushLine('setTimeout(() => {', 1);
        myJSBlock.pushLine("store.dispatch(makeAction_setManyStateByPath(" + needSetVarName + ", ''));");
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},50);');

        var i;
        var theSocket;
        for (i = 0; i < this.inFlowSockets_arr.length; ++i) {
            theSocket = this.inFlowSockets_arr[i];
            var links_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (this.checkCompileFlag(links_arr.length == 0, '输入不可为空', helper)) {
                return false;
            }
            var theNode = links_arr[0].outSocket.node;
            if (this.checkCompileFlag(theNode.type != JSNODE_CONTROL_API_PROPSETTER && theNode.type != JSNODE_CLOSEPOPPER, '输入只能链接API设置节点或ClosePopper', helper)) {
                return false;
            }
            if (theNode.compile(helper, usePreNodes_arr, setBodyBlock) == false) {
                return false;
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Excute_Pro extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EXCUTE_PRO, '执行存储过程', false, nodeJson);
        this.hadFetchFun = true;
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
        this.outDataSocket.label = 'return';
        this.outErrorSocket.label = '错误';
        this.outDataSocket.index = -99;
        this.outErrorSocket.index = -98;

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                this.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                if (this.targetEntity) {
                    this.targetEntity.on('syned', this.entitySynedHandler);
                    this.entitySynedHandler();
                }
            }
            else {
                this.targetEntity = null;
            }
        }
        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            if (!bluePrintIsServer) {
                this.serverFlowSocket = new NodeFlowSocket('serverSucess', this, false);
                this.addSocket(this.serverFlowSocket);
            }
        }
        else {
            this.serverFlowSocket = this.outFlowSockets_arr[0];
            if (bluePrintIsServer) {
                this.removeSocket(this.serverFlowSocket);
                this.serverFlowSocket = null;
            }
        }
        if (this.serverFlowSocket) {
            this.serverFlowSocket.label = 'server';
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

    preRemoveSocket(theSocket) {
        return theSocket != this.outDataSocket && this.outErrorSocket != theSocket;
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        if (this.targetEntity != null) {
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
            jsonProf.useEntity(this.targetEntity);
        }
        rlt.autoCallFetchEnd = this.autoCallFetchEnd;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['targetEntity', 'autoCallFetchEnd']);
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
                            entity_param_arr.push(param);
                        }
                    });
                }
                else {
                    console.error('不支持自订数据源');
                }
            }

            this.inputScokets_arr.forEach(item => {
                item._validparam = false;
            });
            this.outputScokets_arr.forEach((item, index) => {
                item._validparam = false;
            });
            this.outDataSocket._validparam = true;
            this.outErrorSocket._validparam = true;
            var hadChanged = false;
            entity_param_arr.forEach((param, i) => {
                var theSocket = this.getScoketByName(param.name);
                if (theSocket == null) {
                    this.addSocket(new NodeSocket(param.name, this, param.mod == 'IN', { type: SqlVarType_Scalar, label: param.name, index: i }));
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
            var si;
            for (si = 0; si < this.inputScokets_arr.length; ++si) {
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
            for (si = 0; si < this.outputScokets_arr.length; ++si) {
                var theSocket = this.outputScokets_arr[si];
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
                this.outputScokets_arr.sort(this.inputSocketSortFun);
            }
            if (hadChanged || needSort) {
                this.fireEvent(Event_SocketNumChanged, 20);
                this.bluePrint.fireChanged();
            }
        }
        else {
            if (entity == null) {
                this.inputScokets_arr.concat().forEach(socket => {
                    this.removeSocket(socket);
                });
                this.outputScokets_arr.concat().forEach(socket => {
                    this.removeSocket(socket);
                });
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
        var outParams_arr = [];
        for (i = 2; i < this.outputScokets_arr.length; ++i) {
            theSocket = this.outputScokets_arr[i];
            outParams_arr.push({ name: theSocket.name.trim().replace('@', '') });
        }
        var isFormatProduce = false;
        if (outParams_arr.length > 1) {
            if (outParams_arr[0].name == '执行成功' && outParams_arr[1].name == '错误描述') {
                isFormatProduce = true;
            }
        }
        var targetEntity = this.targetEntity;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        // make server side code
        var paramVarName = this.id + 'params_arr';
        var outParamVarName = this.id + 'outparams_arr';
        var paramInitBlock = new FormatFileBlock('initparam');
        paramInitBlock.pushLine('var ' + paramVarName + '=[', 1);
        myJSBlock.pushChild(paramInitBlock);
        params_arr.forEach(param => {
            paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + param.value + "),");
        });
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');

        var outParamInitBlock = new FormatFileBlock('initoutparam');
        outParamInitBlock.pushLine('var ' + outParamVarName + '=[', 1);
        myJSBlock.pushChild(outParamInitBlock);
        outParams_arr.forEach(param => {
            var paramItem = targetEntity.getParamByName('@' + param.name);
            outParamInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', " + MapColumnValType2ParamType(paramItem.cvalType, true) + "),");
        });
        outParamInitBlock.subNextIndent();
        outParamInitBlock.pushLine('];');

        var errVarName = this.id + '_err';
        var rcdRltVarName = this.id + '_ret';
        myJSBlock.pushLine("var " + rcdRltVarName + " = null;");
        var tryBlock = new JSFile_Try('try');
        tryBlock.errorBlock.pushLine('var ' + errVarName + '=eo.message;');
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        myJSBlock.pushChild(tryBlock);
        tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynExcute('" + targetEntity.name + "', " + paramVarName + ',' + outParamVarName + ");");
        if (isFormatProduce) {
            tryBlock.bodyBlock.pushLine('if(' + rcdRltVarName + '.output.执行成功 != 1){', 1);
            tryBlock.bodyBlock.pushLine('return serverhelper.createErrorRet(' + rcdRltVarName + '.output.错误描述 ? ' + rcdRltVarName + '.output.错误描述' + " : '[" + targetEntity.name + "]执行失败但未给出失败理由。');", -1);
            tryBlock.bodyBlock.pushLine('}');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, rcdRltVarName + '.returnValue');
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        outParams_arr.forEach((param, index) => {
            theSocket = this.outputScokets_arr[index + 2];
            selfCompileRet.setSocketOut(theSocket, rcdRltVarName + '.output.' + param.name);
        });

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
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (this.checkCompileFlag(this.targetEntity == null, '需要选择一个数据实体', helper)) {
            return false;
        }
        if (this.checkCompileFlag(this.targetEntity.loaded == false, '数据实体元数据尚未加载完成', helper)) {
            return false;
        }
        helper.addUseEntity(this.targetEntity, EUseEntityStage.Select);
        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        var i;
        var theSocket;
        if (this.inputScokets_arr.length > 0) {
            for (i = 0; i < this.inputScokets_arr.length; ++i) {
                theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                params_arr.push({ name: theSocket.name.trim().replace('@', ''), value: socketValue });
            }
        }
        var outParams_arr = [];
        for (i = 2; i < this.outputScokets_arr.length; ++i) {
            theSocket = this.outputScokets_arr[i];
            outParams_arr.push({ name: theSocket.name.trim().replace('@', '') });
        }
        var isFormatProduce = false;
        if (outParams_arr.length > 1) {
            if (outParams_arr[0].name == '执行成功' && outParams_arr[1].name == '错误描述') {
                isFormatProduce = true;
            }
        }

        var targetEntity = this.targetEntity;
        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = this.bluePrint.id + '_' + this.id;
        var rcdRltVarName = this.id + '_ret';
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var bundleCheckBlock = new FormatFileBlock('bundleCheck');

        var serverFun = null;
        var serverFunBodyBlock = null;
        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        if (!blockInServer) {
            var queryFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            serverFun = queryFun;
            helper.appendOutputItem(queryFun);
            theServerSide.initProcessFun(queryFun);
            queryFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            bundleCheckBlock.pushChild(postVarinitBlock);
            queryFun.bundleCheckBlock = bundleCheckBlock;
            queryFun.postVarinitBlock = postVarinitBlock;
            queryFun.pushChild(bundleCheckBlock);
            queryFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverFunBodyBlock = serverFun.bodyBlock;

            theServerSide.processesMapVarInitVal[queryFun.name] = queryFun.name;
        }
        else {
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            serverFunBodyBlock.pushChild(bundleCheckBlock);
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }

        var paramVarName = this.id + 'params_arr';
        var outParamVarName = this.id + 'outparams_arr';
        serverFun.scope.getVar(paramVarName, true, 'null');
        serverFun.scope.getVar(outParamVarName, true, 'null');

        if (params_arr.length > 0) {
            var paramInitBlock = new FormatFileBlock('initparam');
            paramInitBlock.pushLine(paramVarName + "=[", 1);
            params_arr.forEach(param => {
                var paramPostName = this.id + '_p' + param.name;
                bundleCheckBlock.pushLine('var ' + paramPostName + '=' + param.value + ';');
                bundleCheckBlock.pushLine("if(" + paramPostName + ' == null' + '){return serverhelper.createErrorRet("参数[' + param.name + ']传入值错误");}');
                paramInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', sqlTypes.NVarChar(4000), " + paramPostName + "),");
            });
            paramInitBlock.subNextIndent();
            paramInitBlock.pushLine('];');
            serverFunBodyBlock.pushChild(paramInitBlock);
        }
        if (outParams_arr.length > 0) {
            var outparamInitBlock = new FormatFileBlock('initoutparam');
            outparamInitBlock.pushLine(outParamVarName + "=[", 1);
            outParams_arr.forEach(param => {
                var paramItem = targetEntity.getParamByName('@' + param.name);
                outparamInitBlock.pushLine("dbhelper.makeSqlparam('" + param.name + "', " + MapColumnValType2ParamType(paramItem.cvalType, true) + "),");
            });
            outparamInitBlock.subNextIndent();
            outparamInitBlock.pushLine('];');
            serverFunBodyBlock.pushChild(outparamInitBlock);
        }
        serverFunBodyBlock.pushLine("var " + rcdRltVarName + " = null;");
        var tryBlock = new JSFile_Try('try');
        serverFunBodyBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynExcute('" + targetEntity.name + "', " + paramVarName + ',' + outParamVarName + ");");
        if (isFormatProduce) {
            tryBlock.bodyBlock.pushLine('if(' + rcdRltVarName + '.output.执行成功 != 1){', 1);
            tryBlock.bodyBlock.pushLine('return serverhelper.createErrorRet(' + rcdRltVarName + '.output.错误描述 ? ' + rcdRltVarName + '.output.错误描述' + " : '[" + targetEntity.name + "]执行失败但未给出失败理由。');", -1);
            tryBlock.bodyBlock.pushLine('}');
        }
        var serverSuccessBlock = new FormatFileBlock('serverSuccessBlock');
        serverFunBodyBlock.pushChild(serverSuccessBlock);

        if (!blockInServer) {
            serverFunBodyBlock.pushLine("return " + rcdRltVarName + ';');
        }
        this.serverFun = serverFun;

        // makeClient
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
        var initBundleBlock = null;
        if (serverFun) {
            if (serverFun.bundleCheckBlock.initBundleBlock) {
                initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock
            }
            else {
                initBundleBlock = new FormatFileBlock('initbundle');
                serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
            }
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
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

        if (!blockInServer) {
            belongBlock.pushChild(myJSBlock);
        }

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        if (params_arr.length > 0) {
            myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myJSBlock.pushChild(initBundleBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('});');
        }
        else {
            myJSBlock.pushLine("var " + bundleVarName + " = {};");
        }
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
        }
        var dataVarName = this.id + '_ret';
        var errVarName = 'error_' + this.id;
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
        }
        else {
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        }
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},false)));');
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName + '.returnValue');
        selfCompileRet.setSocketOut(this.outErrorSocket, errVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        outParams_arr.forEach((param, index) => {
            theSocket = this.outputScokets_arr[index + 2];
            selfCompileRet.setSocketOut(theSocket, dataVarName + '.output.' + param.name);
        });

        var serverFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        if (serverFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFlowLinks_arr[0], helper, usePreNodes_arr, serverSuccessBlock) == false) {
                return false;
            }
        }

        var autoCallFetchEnd = this.autoCallFetchEnd != false;
        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length > 0) {
            if (this.checkCompileFlag(blockInServer, 'client流无法被执行到', helper)) {
                return false;
            }
            if (this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
        }
        else if (autoCallFetchEnd) {
            fetchEndBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errVarName]) + ';');
        }
        return selfCompileRet;
    }
}

class JSNode_Attachment_Pro extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ATTACHMENT_PRO, '附件操作', false, nodeJson);
        this.hadFetchFun = true;
        autoBind(this);
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.inputScokets_arr.length > 0) {
            this.flowSocket = this.inputScokets_arr.find(x => {
                return x.name == 'flow';
            });
            this.processSocket = this.inputScokets_arr.find(x => {
                return x.name == 'process';
            });
            this.dataSocket = this.inputScokets_arr.find(x => {
                return x.name == 'data';
            });
            this.keySocket = this.inputScokets_arr.find(x => {
                return x.name == 'key';
            });
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            if (!bluePrintIsServer) {
                this.serverFlowSocket = new NodeFlowSocket('serverSucess', this, false);
                this.addSocket(this.serverFlowSocket);
            }
        }
        else {
            this.serverFlowSocket = this.outFlowSockets_arr[0];
            if (!bluePrintIsServer) {
                this.removeSocket(this.serverFlowSocket);
                this.serverFlowSocket = null;
            }
        }

        if (this.serverFlowSocket) {
            this.serverFlowSocket.label = 'server';
        }

        if (this.processSocket == null) {
            this.processSocket = this.addSocket(new NodeSocket('process', this, true));
        }
        if (this.flowSocket == null) {
            this.flowSocket = this.addSocket(new NodeSocket('flow', this, true));
        }
        if (this.keySocket == null) {
            this.keySocket = this.addSocket(new NodeSocket('key', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, true));
        }
        this.processSocket.set({
            label: '操作',
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'label',
                valueAttrName: 'code',
                options_arr: [{ label: '追加', code: 'add' }],
            },
            hideIcon: true,
        });
        this.flowSocket.set({
            label: '事务流程',
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'label',
                valueAttrName: 'code',
                options_arr: AllFileFlows_arr,
            },
            hideIcon: true,
        });
        this.keySocket.set({
            label: '关联记录代码',
            inputable: false,
        });
        this.dataSocket.label = '文件记录代码';
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
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var i;
        var theSocket;
        var socketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dataSocketValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.keySocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var keySocketValue = socketComRet.value;
        if (this.checkCompileFlag(IsEmptyString(keySocketValue), '必须指派关键记录代码', helper)) {
            return false;
        }
        if (this.checkCompileFlag(IsEmptyString(dataSocketValue), '必须指派文件列表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(IsEmptyString(this.processSocket.defval), '请选择操作种类', helper)) {
            return false;
        }
        var theFileFlow = AllFileFlows_arr.find(x => { return x.code == this.flowSocket.defval; });
        if (this.checkCompileFlag(theFileFlow == null, '请选择事务流程', helper)) {
            return false;
        }

        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = this.bluePrint.id + '_' + this.id;
        var rcdRltVarName = this.id + '_ret';
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var bundleCheckBlock = new FormatFileBlock('bundleCheck');

        var serverFun = null;
        var serverFunBodyBlock = null;
        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        if (!blockInServer) {
            var queryFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            serverFun = queryFun;
            helper.appendOutputItem(queryFun);
            theServerSide.initProcessFun(queryFun);
            queryFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            bundleCheckBlock.pushChild(postVarinitBlock);
            queryFun.bundleCheckBlock = bundleCheckBlock;
            queryFun.postVarinitBlock = postVarinitBlock;
            queryFun.pushChild(bundleCheckBlock);
            queryFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverFunBodyBlock = serverFun.bodyBlock;

            theServerSide.processesMapVarInitVal[queryFun.name] = queryFun.name;
        }
        else {
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            serverFunBodyBlock.pushChild(bundleCheckBlock);
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }

        var paramVarName = this.id + 'params_arr';
        var paramInitBlock = new FormatFileBlock('initparam');
        paramInitBlock.pushLine(paramVarName + "=[", 1);
        paramInitBlock.pushLine("dbhelper.makeSqlparam('操作种类', sqlTypes.NVarChar(10), '" + this.processSocket.defval + "'),");
        paramInitBlock.pushLine("dbhelper.makeSqlparam('归属流程代码', sqlTypes.Int, " + theFileFlow.code + "),");
        paramInitBlock.pushLine("dbhelper.makeSqlparam('关联记录代码', sqlTypes.Int, " + keySocketValue + "),");
        paramInitBlock.pushLine("dbhelper.makeSqlparam('数据', sqlTypes.NVarChar(4000), " + dataSocketValue + "),");
        paramInitBlock.pushLine("dbhelper.makeSqlparam('操作用户', sqlTypes.NVarChar(10), req.session.g_envVar.userid),");
        paramInitBlock.subNextIndent();
        paramInitBlock.pushLine('];');
        serverFunBodyBlock.pushChild(paramInitBlock);

        serverFunBodyBlock.pushLine("var " + rcdRltVarName + " = null;");
        var tryBlock = new JSFile_Try('try');
        serverFunBodyBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(rcdRltVarName + " = yield dbhelper.asynExcute('PB00E操作附件', " + paramVarName + ");");
        var serverSuccessBlock = new FormatFileBlock('serverSuccessBlock');
        serverFunBodyBlock.pushChild(serverSuccessBlock);
        if (!blockInServer) {
            serverFunBodyBlock.pushLine("return " + rcdRltVarName + ';');
        }
        this.serverFun = serverFun;

        // makeClient
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
        var initBundleBlock = null;
        if (serverFun) {
            if (serverFun.bundleCheckBlock.initBundleBlock) {
                initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock
            }
            else {
                initBundleBlock = new FormatFileBlock('initbundle');
                serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
            }
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
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

        if (!blockInServer) {
            belongBlock.pushChild(myJSBlock);
        }

        var bundleVarName = VarNames.Bundle + '_' + this.id;
        myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
        myJSBlock.pushChild(initBundleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});');
        var callBack_bk = new FormatFileBlock('callback' + this.id);
        myJSBlock.pushChild(callBack_bk);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
        }
        var dataVarName = this.id + '_ret';
        var errVarName = 'error_' + this.id;
        myJSBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, {bundle:" + bundleVarName + ",action:'" + serverSideActName + "',}, makeFTD_Callback((state, " + dataVarName + ", " + errVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
        }
        else {
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        }
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},false)));');
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        var serverFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        if (serverFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(serverFlowLinks_arr[0], helper, usePreNodes_arr, serverSuccessBlock) == false) {
                return false;
            }
        }

        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length > 0) {
            if (this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
        }
        else {
            fetchEndBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, errVarName]) + ';');
        }
        return selfCompileRet;
    }
}

class JSNode_String_Length extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STRING_LENGTH, '字符串-Len', false, nodeJson);
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
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Int;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
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

class JSNode_String_Substring extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STRING_SUBSTRING, '字符串-Substring', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.varSocket = this.inputScokets_arr[0];
                this.startSocket = this.inputScokets_arr[1];
                this.endSocket = this.inputScokets_arr[2];
            }
        }
        if (this.varSocket == null) {
            this.varSocket = new NodeSocket('invar', this, true);
            this.addSocket(this.varSocket);
            this.startSocket = new NodeSocket('instart', this, true);
            this.addSocket(this.startSocket);
            this.endSocket = new NodeSocket('inend', this, true);
            this.addSocket(this.endSocket);
        }
        this.varSocket.label = 'var';
        this.startSocket.label = 'start';
        this.endSocket.label = 'end';
        this.varSocket.type = ValueType.String;
        this.varSocket.inputable = false;
        this.startSocket.type = ValueType.Int;
        this.endSocket.type = ValueType.Int;

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = ValueType.String;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketsValues_arr = [];
        for (var si in this.inputScokets_arr) {
            var theSocket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            if (theSocket == this.varSocket) {
                if (!socketComRet.link.outSocket.isSimpleVal) {
                    socketValue = '(' + socketValue + ')';
                }
            }
            socketsValues_arr.push(socketValue);
        }

        var finalStr = socketsValues_arr[0] + '.substring(' + socketsValues_arr[1] + ',' + socketsValues_arr[2] + ')'

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_String_Substr extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STRING_SUBSTR, '字符串-Substr', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.varSocket = this.inputScokets_arr[0];
                this.startSocket = this.inputScokets_arr[1];
                this.endSocket = this.inputScokets_arr[2];
            }
        }
        if (this.varSocket == null) {
            this.varSocket = new NodeSocket('invar', this, true);
            this.addSocket(this.varSocket);
            this.startSocket = new NodeSocket('instart', this, true);
            this.addSocket(this.startSocket);
            this.endSocket = new NodeSocket('inlen', this, true);
            this.addSocket(this.endSocket);
        }
        this.varSocket.label = 'var';
        this.startSocket.label = 'start';
        this.endSocket.label = 'len';
        this.varSocket.type = ValueType.String;
        this.varSocket.inputable = false;
        this.startSocket.type = ValueType.Int;
        this.endSocket.type = ValueType.Int;

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = ValueType.String;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketsValues_arr = [];
        for (var si in this.inputScokets_arr) {
            var theSocket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            if (theSocket == this.varSocket) {
                if (!socketComRet.link.outSocket.isSimpleVal) {
                    socketValue = '(' + socketValue + ')';
                }
            }
            socketsValues_arr.push(socketValue);
        }

        var finalStr = socketsValues_arr[0] + '.substr(' + socketsValues_arr[1] + ',' + socketsValues_arr[2] + ')'

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_String_IndexOf extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STRING_INDEXOF, '字符串-IndexOf', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.varSocket = this.inputScokets_arr[0];
                this.valueSocket = this.inputScokets_arr[1];
                this.fromSocket = this.inputScokets_arr[2];
            }
        }
        if (this.varSocket == null) {
            this.varSocket = new NodeSocket('invar', this, true);
            this.addSocket(this.varSocket);
            this.valueSocket = new NodeSocket('invalue', this, true);
            this.addSocket(this.valueSocket);
            this.fromSocket = new NodeSocket('infrom', this, true);
            this.addSocket(this.fromSocket);
        }
        this.varSocket.label = 'var';
        this.valueSocket.label = 'searchvalue';
        this.fromSocket.label = 'fromindex';
        this.varSocket.type = ValueType.String;
        this.valueSocket.type = ValueType.String;
        this.fromSocket.type = ValueType.Int;
        this.varSocket.inputable = false;
        this.valueSocket.inputable = true;
        this.fromSocket.inputable = true;

        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }
        this.outSocket.type = ValueType.Int;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketsValues_arr = [];
        for (var si in this.inputScokets_arr) {
            var theSocket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            if (theSocket == this.varSocket) {
                if (!socketComRet.link.outSocket.isSimpleVal) {
                    socketValue = '(' + socketValue + ')';
                }
            }
            socketsValues_arr.push(socketValue);
        }

        var finalStr = socketsValues_arr[0] + '.indexOf(' + socketsValues_arr[1] + ',' + socketsValues_arr[2] + ')'

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_IsEmptyString extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ISEMPTYSTRING, 'IsEmptySting', false, nodeJson);
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
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Boolean;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'IsEmptyString(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_IsEmptyArray extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ISEMPTYARRAY, 'IsEmptyArray', false, nodeJson);
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
        this.outSocket.type = ValueType.Boolean;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'IsEmptyArray(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_ParseInt extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_PARSEINT, 'ParseInt', false, nodeJson);
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
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Int;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'parseInt(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_ParseFloat extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_PARSEFLOAT, 'ParseFloat', false, nodeJson);
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
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Float;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'parseFloat(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_IsNaN extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ISNAN, 'IsNaN', false, nodeJson);
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
        this.inSocket.inputable = false;
        this.outSocket.type = ValueType.Boolean;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'isNaN(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_Math_RandInt extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MATH_RANDINT, '生产随机整数', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.inputScokets_arr.forEach(s => {
                    switch (s.name) {
                        case 'min':
                            this.minSocket = s;
                            break;
                        case 'max':
                            this.maxSocket = s;
                            break;
                    }
                });
            }
        }
        if (this.minSocket == null) {
            this.minSocket = new NodeSocket('min', this, true);
            this.addSocket(this.minSocket);
        }
        if (this.maxSocket == null) {
            this.maxSocket = new NodeSocket('max', this, true);
            this.addSocket(this.maxSocket);
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false);
            this.addSocket(this.outSocket);
        }

        this.minSocket.type = ValueType.Int;
        this.minSocket.inputable = true;
        this.minSocket.label = '最小值';
        if (this.minSocket.defval == null) {
            this.minSocket.defval = 0;
        }

        this.minSocket.type = ValueType.Int;
        this.minSocket.inputable = true;
        this.minSocket.label = '最小值';
        if (this.minSocket.defval == null) {
            this.minSocket.defval = 0;
        }
        this.maxSocket.type = ValueType.Int;
        this.maxSocket.inputable = true;
        this.maxSocket.label = '最大值';
        if (this.maxSocket.defval == null) {
            this.maxSocket.defval = 100;
        }

        this.outSocket.type = ValueType.Int;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketComRet = this.getSocketCompileValue(helper, this.minSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var minValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.maxSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var maxValue = socketComRet.value;

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, 'Math.floor(Math.random() * (' + maxValue + ' - ' + minValue + '))');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_DD_MapSearch extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DD_MAP_SEARCH, '钉钉.地图定位', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (nodeJson) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleSocket = socket;
                        break;
                    case 'lon':
                        this.longitudeSocket = socket;
                        break;
                    case 'lat':
                        this.latitudeSocket = socket;
                        break;
                }
            });
        }

        if (this.titleSocket == null) {
            this.titleSocket = this.addSocket(new NodeSocket('title', this, false));
        }

        if (this.longitudeSocket == null) {
            this.longitudeSocket = this.addSocket(new NodeSocket('lon', this, false));
        }

        if (this.latitudeSocket == null) {
            this.latitudeSocket = this.addSocket(new NodeSocket('lat', this, false));
        }

        this.titleSocket.label = '地名';
        this.longitudeSocket.label = '经度';
        this.latitudeSocket.label = '纬度';
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock('');
        var onScuccessBlock = new FormatFileBlock('onScuccess');
        belongBlock.pushChild(myJSBlock);
        helper.addUseMobileDDApi('biz.map.search');

        var onSuccessVarName = this.id + '_onScuccess';
        myJSBlock.pushLine('var ' + onSuccessVarName + ' = result=>{', 1);
        myJSBlock.pushLine('var ' + this.id + '_title = result.title;');
        myJSBlock.pushLine('var ' + this.id + '_lat = result.latitude;');
        myJSBlock.pushLine('var ' + this.id + '_lon = result.longitude;');
        myJSBlock.pushChild(onScuccessBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');

        var onFailVarName = this.id + '_onFail';
        myJSBlock.pushLine('var ' + onFailVarName + ' = err=>{', 1);
        myJSBlock.pushLine("alert('错误:' + JSON.stringify(err));");
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');

        myJSBlock.pushLine("dingdingKit.biz.map.search({scope:500,onSuccess:" + onSuccessVarName + ",onFail:" + onFailVarName + "});");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.titleSocket, this.id + '_title');
        selfCompileRet.setSocketOut(this.latitudeSocket, this.id + '_lat');
        selfCompileRet.setSocketOut(this.longitudeSocket, this.id + '_lon');
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, onScuccessBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_DD_NavClose extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DD_NAV_CLOSE, '钉钉.关闭浏览器', false, nodeJson);
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

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine("dingdingKit.biz.navigation.close();");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_DD_GetGeoLoaction extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DD_GETGEO_LOCATION, '钉钉.geolocation.get', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (nodeJson) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'address':
                        this.addressSocket = socket;
                        break;
                    case 'lon':
                        this.longitudeSocket = socket;
                        break;
                    case 'lat':
                        this.latitudeSocket = socket;
                        break;
                    case 'errorMessage':
                        this.errorMessageSocket = socket;
                        break;
                    case 'errorCode':
                        this.errorCodeSocket = socket;
                        break;
                }
            });
        }

        if (this.addressSocket == null) {
            this.addressSocket = this.addSocket(new NodeSocket('address', this, false));
        }

        if (this.longitudeSocket == null) {
            this.longitudeSocket = this.addSocket(new NodeSocket('lon', this, false));
        }

        if (this.latitudeSocket == null) {
            this.latitudeSocket = this.addSocket(new NodeSocket('lat', this, false));
        }

        if (this.errorMessageSocket == null) {
            this.errorMessageSocket = this.addSocket(new NodeSocket('errorMessage', this, false));
        }

        if (this.errorCodeSocket == null) {
            this.errorCodeSocket = this.addSocket(new NodeSocket('errorCode', this, false));
        }

        this.addressSocket.label = '地址';
        this.longitudeSocket.label = '经度';
        this.latitudeSocket.label = '纬度';
        this.errorMessageSocket.label = 'errorMessage';
        this.errorCodeSocket.label = 'errorCode';
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
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

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var myJSBlock = new FormatFileBlock('');
        var onScuccessBlock = new FormatFileBlock('onScuccess');
        belongBlock.pushChild(myJSBlock);
        helper.addUseMobileDDApi('device.geolocation.get');

        var onSuccessVarName = this.id + '_onScuccess';
        myJSBlock.pushLine('var ' + onSuccessVarName + ' = result=>{', 1);
        myJSBlock.pushLine('var ' + this.id + '_address = result.address;');
        myJSBlock.pushLine('var ' + this.id + '_lat = result.latitude;');
        myJSBlock.pushLine('var ' + this.id + '_lon = result.longitude;');
        myJSBlock.pushLine('var ' + this.id + '_errorMessage = result.errorMessage;');
        myJSBlock.pushLine('var ' + this.id + '_errorCode = result.errorCode;');
        myJSBlock.pushChild(onScuccessBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');

        var onFailVarName = this.id + '_onFail';
        myJSBlock.pushLine('var ' + onFailVarName + ' = err=>{', 1);
        myJSBlock.pushLine("alert('错误:' + JSON.stringify(err));");
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('};');

        myJSBlock.pushLine("dingdingKit.device.geolocation.get({targetAccuracy:200,coordinate:1,withReGeocode:true,onSuccess:" + onSuccessVarName + ",onFail:" + onFailVarName + "});");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.addressSocket, this.id + '_address');
        selfCompileRet.setSocketOut(this.latitudeSocket, this.id + '_lat');
        selfCompileRet.setSocketOut(this.longitudeSocket, this.id + '_lon');
        selfCompileRet.setSocketOut(this.errorMessageSocket, this.id + '_errorMessage');
        selfCompileRet.setSocketOut(this.errorCodeSocket, this.id + '_errorCode');
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, onScuccessBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JsNode_OpenExternal_Page extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_OPENEXTERNAL_PAGE, '打开外部页面', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null) {
            this.outFlowSockets_arr = [];
        }

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'project':
                        this.projectScoket = socket;
                        break;
                    case 'flowStep':
                        this.flowStepScoket = socket;
                        break;
                    case 'intdata':
                        this.intdataScoket = socket;
                        break;
                    case 'mode':
                        this.modeScoket = socket;
                        break;
                    default:
                        console.warn('无法正确识别的接口:' + socket.name);
                }
            });

            if (this.outFlowSockets_arr.length > 0) {
                this.onMessageFlowSocket = this.outFlowSockets_arr[0];
            }

            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'msgtype':
                        this.msgtypeScoket = socket;
                        break;
                    case 'msgdata':
                        this.msgdataScoket = socket;
                        break;
                }
            });
        }
        if (this.msgtypeScoket == null) {
            this.msgtypeScoket = this.addSocket(new NodeSocket('msgtype', this, false));
        }
        if (this.msgdataScoket == null) {
            this.msgdataScoket = this.addSocket(new NodeSocket('msgdata', this, false));
        }
        this.msgtypeScoket.label = 'msgtype';
        this.msgdataScoket.label = 'msgdata';
        if (this.onMessageFlowSocket == null) {
            this.onMessageFlowSocket = new NodeFlowSocket('flow_onmsg', this, false);
            this.addSocket(this.onMessageFlowSocket);
            this.onMessageFlowSocket.label = 'onMessage';
        }
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
            label: '目标页面',
        });

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
            label: '流程步骤',
        });

        if (this.intdataScoket == null) {
            this.intdataScoket = new NodeSocket('intdata', this, true);
            this.addSocket(this.intdataScoket);
        }
        this.intdataScoket.set({
            type: ValueType.Int,
            label: '关联数据',
        });

        if (this.modeScoket == null) {
            this.modeScoket = new NodeSocket('mode', this, true, { defval: '替换' });
            this.addSocket(this.modeScoket);
        }
        this.modeScoket.set({
            label: '模式',
            inputable: true,
            inputDDC_setting: {
                options_arr: ['替换', '顶层Frame'],
            },
            hideIcon: true,
        });
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theProject = this.bluePrint.master.project;

        var socketComRet;
        var targetProjName = '';
        socketComRet = this.getSocketCompileValue(helper, this.projectScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }

        if (socketComRet.link) {
            targetProjName = socketComRet.value;
        }
        else {
            var theProj = ProjectRecords_arr.find(p => { return p.value == socketComRet.value; });
            if (this.checkCompileFlag(theProj == null, '没有选择目标页面', helper)) {
                return false;
            }
            targetProjName = singleQuotesStr(theProj.英文名称);
        }

        socketComRet = this.getSocketCompileValue(helper, this.flowStepScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var flowStep = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.intdataScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var intDataValue = socketComRet.value;
        var myJSBlock = new FormatFileBlock('');
        var mode = this.modeScoket.defval;
        var callBackBodyBlock = null;
        var callBackVarName = 'null';
        var msgtypeVarName = this.id + '_msgtype';
        var msgdataVarName = this.id + '_msgdata';

        var onMsgFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.onMessageFlowSocket);
        if (onMsgFlowLinks_arr.length > 0) {
            if (this.checkCompileFlag(mode != '顶层Frame', '只有在顶层Frame模式下才能使用OnMessage', helper)) {
                return false;
            }
            callBackVarName = this.id + '_onmsg';
            myJSBlock.pushLine('var ' + callBackVarName + '=(' + msgtypeVarName + ',' + msgdataVarName + ')=>{', 1);
            callBackBodyBlock = new FormatFileBlock('callbackbody');
            myJSBlock.pushChild(callBackBodyBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
        }

        if (mode == '顶层Frame') {
            mode = ",'topframe' ";
        }
        else {
            mode = '';
        }

        myJSBlock.pushLine("openPage(" + targetProjName + "," + (IsEmptyString(flowStep) ? 'null' : flowStep) + "," + (IsEmptyString(intDataValue) ? 'null' : intDataValue) + mode + ',' + callBackVarName + ");");
        belongBlock.pushChild(myJSBlock);

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.msgtypeScoket, msgtypeVarName);
        selfCompileRet.setSocketOut(this.msgdataScoket, msgdataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (onMsgFlowLinks_arr.length > 0) {
            if (this.compileFlowNode(onMsgFlowLinks_arr[0], helper, usePreNodes_arr, callBackBodyBlock) == false) {
                return false;
            }
        }

        return selfCompileRet;
    }
}

class JSNode_Msg_SendToParent extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_MSG_SENDTOPARENT, '向父页发送消息', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (nodeJson) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'data':
                        this.dataScoket = socket;
                        break;
                    case 'type':
                        this.typeScoket = socket;
                        break;
                }
            });
        }

        if (this.typeScoket == null) {
            this.typeScoket = this.addSocket(new NodeSocket('type', this, true));
        }
        if (this.dataScoket == null) {
            this.dataScoket = this.addSocket(new NodeSocket('data', this, true));
        }
        this.typeScoket.label = 'type';
        this.dataScoket.label = 'data';
        this.typeScoket.inputable = true;
        this.dataScoket.inputable = true;
        this.typeScoket.type = ValueType.String;
        this.dataScoket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var socketComRet = this.getSocketCompileValue(helper, this.typeScoket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var typeValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataScoket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var dataValue = socketComRet.value;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine('if(gParentFrame){gParentFrame.sendMessage(' + typeValue + ',' + dataValue + ');}');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.typeScoket, typeValue);
        selfCompileRet.setSocketOut(this.dataScoket, dataValue);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_HashFormDataRow extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_HASHFORM_DATAROW, '散列Form数据', false, nodeJson);
        autoBind(this);
        if (this.outFlowSockets_arr == null) {
            this.outFlowSockets_arr = [];
        }

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.inputScokets_arr.length > 0) {
            this.inSocket = this.inputScokets_arr[0];
        }

        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
        }
        this.inSocket.inputable = false;
        this.inSocket.label = '数据对象';
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.formID = this.formID;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['formID']);
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

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        result.pushVariable(this.id + '_data', targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr, blockInServer);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var theScope = belongBlock && belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        if (this.checkCompileFlag(blockInServer, '不可以出现在server流程中', helper)) {
            return false;
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

        this.targetEntity = theDS;
        this.formKernel = formKernel;

        var nowRowVarName = this.id + '_data';
        var inSocketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true, false);
        if (inSocketComRet.err) {
            return false;
        }
        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine('var ' + nowRowVarName + '=' + inSocketComRet.value + ';');

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);

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
            helper.addUseColumn(formKernel, colName, null, EFormRowSource.None);
            selfCompileRet.setSocketOut(outSocket, nowRowVarName + '.' + colName);
        }
        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_SetTimeout extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SETTIMEOUT, 'SetTimeout', false, nodeJson);
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
        this.inputSocket.label = 'interval';
        this.inputSocket.type = ValueType.Int;
        this.inputSocket.hideIcon = true;
        this.inputSocket.inputable = true;
        this.inputSocket.defval = 20;
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
        var bodyBlock = new FormatFileBlock('body');
        belongBlock.pushChild(myJSBlock);

        myJSBlock.pushLine('setTimeout(()=>{', 1);
        myJSBlock.pushChild(bodyBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},' + socketValue + ');');
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, bodyBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_CusObject_New extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CUSOBJECT_NEW, 'New数据对象', false, nodeJson);
        autoBind(this);

        this.insocketInitVal = {
            type: ValueType.Object,
        };
        if (createHelper) {
            var cusObj = createHelper.project.scriptMaster.getCusObjByCode(this.code);
        }

        if (this.outputScokets_arr.length > 0) {
            this.outSocket = this.outputScokets_arr[0];
        }
        if (this.outSocket == null) {
            this.outSocket = this.addSocket(new NodeSocket('out', this, false));
        }

        this.listenObj(cusObj);
        this.setCusObj(cusObj);
    }

    setCusObj(cusObj) {
        this.code = cusObj ? cusObj.code : null;
        this.cusObj = cusObj;
        this.objChanged();
    }

    objChanged() {
        this.inputScokets_arr.forEach(socket => {
            socket.invalid = true;
        });
        var cusObj = this.cusObj;
        if (cusObj == null) {
            if (this.bluePrint.master) {
                cusObj = this.bluePrint.master.getCusObjByCode(this.code);
            }
        }
        if (cusObj) {
            cusObj.dataMembers_arr.forEach(name => {
                var tsocket = this.getScoketByName(name);
                if (!tsocket) {
                    tsocket = this.addSocket(new NodeSocket(name, this, true));
                }
                tsocket.label = name;
                tsocket.inputable = true;
                tsocket.type = ValueType.Object;
                tsocket.invalid = false;
            });
        }
        this.inputScokets_arr.filter(s => { return s.invalid; }).forEach(s => { this.removeSocket(s); });
        this.fireEvent(Event_SocketNumChanged, 20);
    }

    listenObj(target) {
        if (target) {
            target.on('changed', this.objChanged);
        }
    }

    unlistenObj(target) {
        if (target) {
            target.off('changed', this.objChanged);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.code = this.code;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['code']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var cusObj = this.bluePrint.master.getCusObjByCode(this.code);
        if (this.checkCompileFlag(cusObj == null, '需要选择对象类型', helper)) {
            return false;
        }
        var jsSten = '';
        this.objChanged();
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            var tValue = socketComRet.value;
            jsSten += (i == 0 ? '' : ',') + theSocket.label + ':' + tValue
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, '{' + jsSten + '}');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_CusObject_Visit extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CUSOBJECT_VISIT, '访问数据对象', false, nodeJson);
        autoBind(this);

        if (createHelper) {
            var cusObj = createHelper.project.scriptMaster.getCusObjByCode(this.code);
        }

        if (this.inputScokets_arr.length > 0) {
            this.inSocket = this.inputScokets_arr[0];
        }
        if (this.inSocket == null) {
            this.inSocket = this.addSocket(new NodeSocket('in', this, true));
        }
        this.inSocket.label = 'target';

        this.listenObj(cusObj);
        this.setCusObj(cusObj);
    }

    setCusObj(cusObj) {
        this.code = cusObj ? cusObj.code : null;
        this.cusObj = cusObj;
        this.objChanged();
    }

    objChanged() {
        this.outputScokets_arr.forEach(socket => {
            socket.invalid = true;
        });
        var cusObj = this.cusObj;
        if (cusObj == null) {
            if (this.bluePrint.master) {
                cusObj = this.bluePrint.master.getCusObjByCode(this.code);
            }
        }
        if (cusObj) {
            cusObj.dataMembers_arr.forEach(name => {
                var tsocket = this.getScoketByName(name);
                if (!tsocket) {
                    tsocket = this.addSocket(new NodeSocket(name, this, false));
                }
                tsocket.label = name;
                tsocket.type = ValueType.Object;
                tsocket.invalid = false;
            });
        }
        this.outputScokets_arr.filter(s => { return s.invalid; }).forEach(s => { this.removeSocket(s); });
        this.fireEvent(Event_SocketNumChanged, 20);
    }

    listenObj(target) {
        if (target) {
            target.on('changed', this.objChanged);
        }
    }

    unlistenObj(target) {
        if (target) {
            target.off('changed', this.objChanged);
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.code = this.code;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['code']);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var cusObj = this.bluePrint.master.getCusObjByCode(this.code);
        if (this.checkCompileFlag(cusObj == null, '需要选择对象类型', helper)) {
            return false;
        }
        var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var selfCompileRet = new CompileResult(this);
        var inSocketValue = socketComRet.value;
        this.objChanged();
        for (var i = 0; i < this.outputScokets_arr.length; ++i) {
            var theSocket = this.outputScokets_arr[i];
            selfCompileRet.setSocketOut(theSocket, inSocketValue + '.' + theSocket.label);
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
JSNodeClassMap[JSNODE_HASHFORM_DATAROW] = {
    modelClass: JSNode_HashFormDataRow,
    comClass: C_JSNode_HashFormDataRow,
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
JSNodeClassMap[JSNODE_ARRAY_NEW] = {
    modelClass: JSNode_Array_New,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CUSOBJECT_NEW] = {
    modelClass: JSNode_CusObject_New,
    comClass: C_JSNode_CusObject_New,
};
JSNodeClassMap[JSNODE_CUSOBJECT_VISIT] = {
    modelClass: JSNode_CusObject_Visit,
    comClass: C_JSNode_CusObject_Visit,
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
    comClass: C_JSNode_FreshForm,
};
JSNodeClassMap[JSNODE_DO_FLOWSTEP] = {
    modelClass: JSNode_Do_FlowStep,
    comClass: C_JSNODE_Do_FlowStep,
};
JSNodeClassMap[JSNODE_JUMP_PAGE] = {
    modelClass: JSNode_JumpPage,
    comClass: C_JSNode_JumpPage,
};
JSNodeClassMap[JSNODE_OPENEXTERNAL_PAGE] = {
    modelClass: JsNode_OpenExternal_Page,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CONTROL_API_CALLFUN] = {
    modelClass: JSNode_Control_Api_CallFun,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DELETE_TABLE] = {
    modelClass: JSNODE_Delete_Table,
    comClass: C_JSNODE_Delete_Table,
};
JSNodeClassMap[JSNODE_POPMESSAGEBOX] = {
    modelClass: JSNode_PopMessageBox,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CLOSEMESSAGEBOX] = {
    modelClass: JSNode_CloseMessageBox,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_HIDEMESSAGEBOX] = {
    modelClass: JSNode_HideMessageBox,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_SHOWMESSAGEBOX] = {
    modelClass: JSNode_ShowMessageBox,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_POP_PAGE] = {
    modelClass: JSNode_PopPage,
    comClass: C_JSNode_PopPage,
};
JSNodeClassMap[JSNODE_CLOSE_PAGE] = {
    modelClass: JSNode_ClosePage,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_GETPAGE_ENTRYPARAM] = {
    modelClass: JSNode_GetPageEntryParam,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_GETSTEPDATA] = {
    modelClass: JSNode_GetStepData,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_BATCH_CONTROL_API_PROPSETTER] = {
    modelClass: JSNode_Batch_Control_Api_Propsetter,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_EXCUTE_PRO] = {
    modelClass: JSNode_Excute_Pro,
    comClass: C_JSNode_Excute_Pro,
};

JSNodeClassMap[JSNODE_STRING_LENGTH] = {
    modelClass: JSNode_String_Length,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_STRING_SUBSTRING] = {
    modelClass: JSNode_String_Substring,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_STRING_SUBSTR] = {
    modelClass: JSNode_String_Substr,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_STRING_INDEXOF] = {
    modelClass: JSNode_String_IndexOf,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ISEMPTYSTRING] = {
    modelClass: JSNode_IsEmptyString,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ISEMPTYARRAY] = {
    modelClass: JSNode_IsEmptyArray,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_PARSEINT] = {
    modelClass: JSNode_ParseInt,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_PARSEFLOAT] = {
    modelClass: JSNode_ParseFloat,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ISNAN] = {
    modelClass: JSNode_IsNaN,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DD_MAP_SEARCH] = {
    modelClass: JSNode_DD_MapSearch,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DD_NAV_CLOSE] = {
    modelClass: JSNode_DD_NavClose,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DD_GETGEO_LOCATION] = {
    modelClass: JSNode_DD_GetGeoLoaction,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ATTACHMENT_PRO] = {
    modelClass: JSNode_Attachment_Pro,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_SETMESSAGEBOXTOLOADING] = {
    modelClass: JSNode_SetMessageBoxToLoading,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_MATH_RANDINT] = {
    modelClass: JSNode_Math_RandInt,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CLOSEPOPPER] = {
    modelClass: JSNode_ClosePopper,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CALLCUSSCRIPT] = {
    modelClass: JSNode_CallCusScript,
    comClass: C_JSNode_CallCusScript,
};
JSNodeClassMap[JSNODE_SETTIMEOUT] = {
    modelClass: JSNode_SetTimeout,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ARRAY_FOR] = {
    modelClass: JSNode_Array_For,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_MSG_SENDTOPARENT] = {
    modelClass: JSNode_Msg_SendToParent,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CLOSETOPFRAME] = {
    modelClass: JSNode_CloseTopFrame,
    comClass: C_Node_SimpleNode,
};