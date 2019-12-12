const JSNODE_OP_NOT = 'opnot';
const JSNODE_ADDPAGETOFRAMESET = 'addpagetoframeset';
const JSNODE_CUSOBJECT_NEW = 'cusobjectnew';
const JSNODE_CUSOBJECT_VISIT = 'cusobjectvisit';
const JSNODE_FUN_CREATE = 'createlocalfun';
const JSNODE_FUN_CALL = 'callfun';

class JSNode_AddPageToFrameSet extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ADDPAGETOFRAMESET, '添加页面到框架集', false, nodeJson);
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
                    case 'pagename':
                        this.pagenameScoket = socket;
                        break;
                    case 'pagecode':
                        this.pagecodeScoket = socket;
                        break;
                    case 'title':
                        this.titleScoket = socket;
                        break;
                    case 'stepcode':
                        this.stepcodeScoket = socket;
                        break;
                    case 'stepdata':
                        this.stepdataScoket = socket;
                        break;
                    case 'closeable':
                        this.closeableScoket = socket;
                        break;
                    case 'frameset':
                        this.framesetScoket = socket;
                        break;
                }
            });
        }
        if (this.framesetScoket == null) {
            this.framesetScoket = this.addSocket(new NodeSocket('frameset', this, true));
        }
        if (this.titleScoket == null) {
            this.titleScoket = this.addSocket(new NodeSocket('title', this, true));
        }
        if (this.pagecodeScoket == null) {
            this.pagecodeScoket = this.addSocket(new NodeSocket('pagecode', this, true));
        }
        if (this.pagenameScoket == null) {
            this.pagenameScoket = this.addSocket(new NodeSocket('pagename', this, true));
        }
        if (this.stepcodeScoket == null) {
            this.stepcodeScoket = this.addSocket(new NodeSocket('stepcode', this, true));
        }
        if (this.stepdataScoket == null) {
            this.stepdataScoket = this.addSocket(new NodeSocket('stepdata', this, true));
        }
        if (this.closeableScoket == null) {
            this.closeableScoket = this.addSocket(new NodeSocket('closeable', this, true));
        }

        this.titleScoket.label = '标题';
        this.pagecodeScoket.label = '页面代码';
        this.pagenameScoket.label = '页面名称';
        this.stepcodeScoket.label = '步骤代码';
        this.stepdataScoket.label = '步骤数据';
        this.closeableScoket.label = '可否关闭';
        this.framesetScoket.label = '框架集';

        this.titleScoket.type = ValueType.String;
        this.pagenameScoket.type = ValueType.String;
        this.pagecodeScoket.type = ValueType.Int;
        this.stepdataScoket.type = ValueType.Int;
        this.stepcodeScoket.type = ValueType.Int;
        this.closeableScoket.type = ValueType.Boolean;
        if(this.closeableScoket.defval == null){
            this.closeableScoket.defval = true;
        }

        this.framesetScoket.inputable = true;
        this.framesetScoket.type = SocketType_CtlKernel;
        this.framesetScoket.kernelType = FrameSetKernel_Type;
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

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);
        var socketComRet = this.getSocketCompileValue(helper, this.titleScoket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var title = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.pagecodeScoket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var pagecode = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.pagenameScoket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var pagename = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.stepcodeScoket, usePreNodes_arr, myJSBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var stepcode = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.stepdataScoket, usePreNodes_arr, myJSBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var stepdata = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.closeableScoket, usePreNodes_arr, myJSBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var closeable = socketComRet.value;

        var selectedCtlid = this.framesetScoket.getExtra('ctlid');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (this.checkCompileFlag(selectedKernel == null, '需要选择框架集', helper)) {
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(FrameSetKernel_Type);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
            return false;
        }        
        var pathVar = singleQuotesStr(selectedKernel.getStatePath(null, '.', { mapVarName: VarNames.RowKeyInfo_map }));
        var belongUserCtl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);
        if (belongUserCtl) {
            pathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + selectedKernel.getStatePath(null, '.', { mapVarName: VarNames.RowKeyInfo_map }));
        }

        var inreducer = this.isInReducer(preNodes_arr);
        myJSBlock.pushLine(makeStr_callFun('AddPageToFrameSet', [
            inreducer ? VarNames.State : 'null',
            pathVar,
            title,
            pagecode,
            pagename,
            stepcode ? stepcode : 'null',
            stepdata ? stepdata : 'null',
            closeable == null ? 'null' : closeable,
        ], ';'));

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_OP_Not extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_OP_NOT, 'NOT(!)', false, nodeJson);
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
        selfCompileRet.setSocketOut(this.outSocket, '!(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
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

class JSNode_Fun_Create extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FUN_CREATE, '创建局部方法', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if(this.outFlowSockets_arr == null){
            this.outFlowSockets_arr = [];
        }

        if (this.outFlowSockets_arr.length > 0) {
            this.bodyFlowSocket = this.outFlowSockets_arr[0];
        }
        if (this.bodyFlowSocket == null) {
            this.bodyFlowSocket = new NodeFlowSocket('flow_body', this, false);
            this.addSocket(this.bodyFlowSocket);
        }

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.nameSocket = this.outputScokets_arr[0];
            }
        }
        if(this.nameSocket == null){
            this.nameSocket = this.addSocket(new NodeSocket('name', this, false));
        }
        this.bodyFlowSocket.label = 'body';
        this.nameSocket.label = 'name';
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

        var myJSBlock = new FormatFileBlock('');
        var bodyJSBlock = new FormatFileBlock('body');
        belongBlock.pushChild(myJSBlock);

        var retParamObjName = this.id + '_ret';
        myJSBlock.pushLine('var ' + this.id + ' = (' + retParamObjName + ')=>{',1);
        myJSBlock.pushChild(bodyJSBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');

        var bodyFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.bodyFlowSocket);
        if (this.checkCompileFlag(bodyFlowLinks_arr.length == 0, '必须设置函数体', helper)) {
            return false;
        }

        if (this.compileFlowNode(bodyFlowLinks_arr[0], helper, usePreNodes_arr, bodyJSBlock) == false) {
            return false;
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.nameSocket, this.id);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Fun_Call extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FUN_CALL, '调用方法', false, nodeJson);
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
            if (this.inputScokets_arr.length > 0) {
                this.inputScokets_arr.forEach(socket => {
                    switch (socket.name) {
                        case 'fun':
                            this.funScoket = socket;
                            break;
                        case 'param':
                            this.paramScoket = socket;
                            break;
                    }
                });
            }
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
        }
        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('ret', this, false));
        }
        if(this.funScoket == null){
            this.funScoket = this.addSocket(new NodeSocket('fun', this, true));
        }
        if(this.paramScoket == null){
            this.paramScoket = this.addSocket(new NodeSocket('param', this, true));
        }
        this.funScoket.label = 'fun';
        this.paramScoket.label = 'param';
        this.outSocket.label = 'return';

        this.funScoket.inputable = false;
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

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);

        var socketComRet = this.getSocketCompileValue(helper, this.funScoket, usePreNodes_arr, myJSBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var funValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.paramScoket, usePreNodes_arr, myJSBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var paramValue = socketComRet.value;

        myJSBlock.pushLine('var ' + this.id + '_ret = ' + funValue + '(' + (paramValue ? paramValue : '') + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outSocket, this.id + '_ret');
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

JSNodeClassMap[JSNODE_OP_NOT] = {
    modelClass: JSNode_OP_Not,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_ADDPAGETOFRAMESET] = {
    modelClass: JSNode_AddPageToFrameSet,
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
JSNodeClassMap[JSNODE_FUN_CREATE] = {
    modelClass: JSNode_Fun_Create,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FUN_CALL] = {
    modelClass: JSNode_Fun_Call,
    comClass: C_Node_SimpleNode,
};