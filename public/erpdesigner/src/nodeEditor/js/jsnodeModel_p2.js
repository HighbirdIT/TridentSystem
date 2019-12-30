const JSNODE_OP_NOT = 'opnot';
const JSNODE_ADDPAGETOFRAMESET = 'addpagetoframeset';
const JSNODE_CUSOBJECT_NEW = 'cusobjectnew';
const JSNODE_CUSOBJECT_VISIT = 'cusobjectvisit';
const JSNODE_FUN_CREATE = 'createlocalfun';
const JSNODE_FUN_CALL = 'callfun';
const JSNODE_IFRAME_SENDMSG = 'iframesendmsg';
const JSNODE_TRAVERSALFORM = 'traversalform';
const JSNODE_GETFORMXMLDATA = 'getformxmldata';
const JSNODE_CIRCLEEND = 'circleend';
const JSNODE_OPENEXTERNAL_PAGE = 'openexternalpage';

const JSNODE_DD_GETGEO_LOCATION = 'ddgetgeolocation';
const JSNODE_DD_MAP_SEARCH = 'ddmapsearch';
const JSNODE_DD_NAV_CLOSE = 'ddnavclose';

const JSNODE_PAGE_CALLFUN = 'pagecallfun';

const JSNODE_CLOSEPOPPER = 'closepopper';
const JSNODE_CALLCUSSCRIPT = 'callcusscript';
const JSNODE_SETTIMEOUT = 'settimeout';
const JSNODE_ARRAY_FOR = 'arrayfor';
const JSNODE_MSG_SENDTOPARENT = 'msgsendtoparent';
const JSNODE_CLOSETOPFRAME = 'closetopframe';

const JSNODE_ADD_DYNAMIC_BATCH_API = 'adddynamicbatchapi';
const JSNODE_EXCUTE_DYNAMIC_BATCH_API = 'excutedynamicbatchapi';


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
        if (this.closeableScoket.defval == null) {
            this.closeableScoket.defval = true;
        }

        this.framesetScoket.inputable = false;
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

    getJson(jsonProf) {
        var theJson = super.getJson(jsonProf);
        if (jsonProf) {
            jsonProf.addCusObject(this.cusObj);
        }
        return theJson;
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

    getJson(jsonProf) {
        var theJson = super.getJson(jsonProf);
        if (jsonProf) {
            jsonProf.addCusObject(this.cusObj);
        }
        return theJson;
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
        this.genCloseure = true;

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
        if (this.nameSocket == null) {
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
        myJSBlock.pushLine('var ' + this.id + ' = (' + retParamObjName + ')=>{', 1);
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
        if (this.outSocket == null) {
            this.outSocket = this.addSocket(new NodeSocket('ret', this, false));
        }
        if (this.funScoket == null) {
            this.funScoket = this.addSocket(new NodeSocket('fun', this, true));
        }
        if (this.paramScoket == null) {
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

class JSNode_IFrame_SendMsg extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_IFRAME_SENDMSG, '向i框架发消息', false, nodeJson);
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
                    case 'frame':
                        this.frameScoket = socket;
                        break;
                }
            });
        }
        if (this.frameScoket == null) {
            this.frameScoket = this.addSocket(new NodeSocket('frame', this, true));
        }
        if (this.typeScoket == null) {
            this.typeScoket = this.addSocket(new NodeSocket('type', this, true));
        }
        if (this.dataScoket == null) {
            this.dataScoket = this.addSocket(new NodeSocket('data', this, true));
        }

        this.typeScoket.label = '消息类型';
        this.dataScoket.label = '消息数据';
        this.frameScoket.label = 'i框架';

        this.typeScoket.type = ValueType.String;
        this.dataScoket.type = ValueType.Object;

        this.typeScoket.inputable = true;
        this.dataScoket.inputable = true;
        this.frameScoket.inputable = false;
        this.frameScoket.type = SocketType_CtlKernel;
        this.frameScoket.kernelType = IFrameKernel_Type;
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
        var socketComRet = this.getSocketCompileValue(helper, this.typeScoket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var msgtype = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.dataScoket, usePreNodes_arr, myJSBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var msgdata = socketComRet.value;

        var selectedCtlid = this.frameScoket.getExtra('ctlid');
        var selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        if (this.checkCompileFlag(selectedKernel == null, '需要i框架', helper)) {
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(IFrameKernel_Type);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
            return false;
        }
        var pathVar = singleQuotesStr(selectedKernel.getStatePath('msg', '.', { mapVarName: VarNames.RowKeyInfo_map }));
        var belongUserCtl = selectedKernel.searchParentKernel(UserControlKernel_Type, true);
        if (belongUserCtl) {
            pathVar = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + selectedKernel.getStatePath('msg', '.', { mapVarName: VarNames.RowKeyInfo_map }));
        }

        var inreducer = this.isInReducer(preNodes_arr);
        var msgstr = "{type:" + msgtype + ",data:" + msgdata + "}";
        if (inreducer) {
            myJSBlock.pushLine("setStateByPath(state, " + pathVar + ", " + msgstr + ");");
        }
        else {
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(makeAction_setStateByPath(" + msgstr + "," + pathVar + "));", -1);
            myJSBlock.pushLine('},50);');
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

class JSNode_TraversalForm extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_TRAVERSALFORM, '遍历Form行', false, nodeJson);
        autoBind(this);
        this.genCloseure = true;
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

        if (this.outFlowSockets_arr == null) {
            this.outFlowSockets_arr = [];
        }

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'record') {
                        this.recordSocket = socket;
                    }
                    else if (socket.name == 'selected') {
                        this.selectedSocket = socket;
                    }
                    else if (socket.name == 'key') {
                        this.keySocket = socket;
                    }
                    else if (socket.name == 'validrow') {
                        this.validrowSocket = socket;
                    }
                    else if (socket.name == 'rowindex') {
                        this.rowindexSocket = socket;
                    }
                    else if (socket.name == 'rowscount') {
                        this.rowcountSocket = socket;
                    }
                });
            }
            if (this.inputScokets_arr.length > 0) {
                this.formSocket = this.inputScokets_arr[0];
            }
            if (this.outFlowSockets_arr.length > 0) {
                this.outFlowSockets_arr.forEach(socket => {
                    if (socket.name == 'flow_foreach') {
                        this.foreachFlowSocket = socket;
                    }
                });
            }
        }
        if (this.formSocket == null) {
            this.formSocket = this.addSocket(new NodeSocket('form', this, true));
        }
        if (this.rowindexSocket == null) {
            this.rowindexSocket = this.addSocket(new NodeSocket('rowindex', this, false));
        }
        if (this.rowcountSocket == null) {
            this.rowcountSocket = this.addSocket(new NodeSocket('rowscount', this, false));
        }
        if (this.recordSocket == null) {
            this.recordSocket = this.addSocket(new NodeSocket('record', this, false));
        }
        if (this.selectedSocket == null) {
            this.selectedSocket = this.addSocket(new NodeSocket('selected', this, false));
        }
        if (this.keySocket == null) {
            this.keySocket = this.addSocket(new NodeSocket('key', this, false));
        }
        if (this.validrowSocket == null) {
            this.validrowSocket = this.addSocket(new NodeSocket('validrow', this, false));
        }
        if (this.foreachFlowSocket == null) {
            this.foreachFlowSocket = this.addSocket(new NodeFlowSocket('flow_foreach', this, false));
        }
        this.rowindexSocket.label = '行号';
        this.rowcountSocket.label = '总行数';
        this.foreachFlowSocket.label = '行处理';
        this.recordSocket.label = 'record';
        this.selectedSocket.label = 'isSelected';
        this.keySocket.label = 'rowkey';
        this.validrowSocket.label = '是否有效';

        this.formSocket.inputable = false;
        this.formSocket.type = SocketType_CtlKernel;
        this.formSocket.kernelType = M_FormKernel_Type;
        this.formSocket.label = 'Form';
        this.formSocket.hideIcon = true;

        if (createHelper) {
            if (!createHelper.project.loaded) {
                createHelper.project.on('loaded', this.projLoadedHandler);
            }
        }
    }

    projLoadedHandler() {
        var project = this.bluePrint.master.project;
        this.outputScokets_arr.forEach(socket => {
            if (socket.type == SocketType_CtlKernel) {
                var ctlid = socket.getExtra('ctlid');
                var ctlkernel = project.getControlById(ctlid);
                if (ctlkernel) {
                    socket.kernelType = ctlkernel.type;
                }
            }
        });
    }

    preRemoveSocket(socket) {
        return socket != this.keySocket && socket != this.selectedSocket && socket != this.recordSocket && socket != this.validrowSocket && socket != this.rowcountSocket && socket != this.rowindexSocket;
    }

    genOutSocket() {
        var formid = this.formSocket.getExtra('ctlid');
        var formKernel = this.bluePrint.master.project.getControlById(formid);
        if (formKernel == null || formKernel.isPageForm()) {
            return null;
        }
        var allRowCtls_arr = formKernel.getAllRowControls();
        var hadctls_arr = [];
        for (var si in this.outputScokets_arr) {
            var outSocket = this.outputScokets_arr[si];
            var ctlid = outSocket.getExtra('ctlid');
            if (ctlid != null) {
                hadctls_arr.push(ctlid);
            }
        }
        var emptyCtl = allRowCtls_arr.find(ctl => {
            return hadctls_arr.indexOf(ctl.id) == -1;
        });
        if (emptyCtl == null) {
            return null;
        }
        var newSocket = new NodeSocket(this.getUseableOutSocketName('ctl'), this, false, { type: SocketType_CtlKernel });
        newSocket.setExtra('ctlid', emptyCtl.id);
        newSocket.kernelType = emptyCtl.type;
        return newSocket;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        if (belongFun.scope.isServerSide) {
            return;
        }
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    addUseControlPropApi(ctrKernel, apiitem) {
        if (apiitem.relyStateName == null) {
            apiitem.relyStateName = apiitem.stateName;
        }
        var attrName = IsEmptyString(apiitem.useAttrName) ? apiitem.attrItem.name : apiitem.useAttrName;
        var ctlset = this.useControls_arr.find(x => {
            return x.ctl == ctrKernel;
        });
        if (ctlset != null) {
            ctlset.useProps[attrName] = apiitem;
        }
    }

    addUseControlPath(ctrKernel) {
        var ctlset = this.useControls_arr.find(x => {
            return x.ctl == ctrKernel;
        });
        if (ctlset != null) {
            ctlset.usepath = true;
        }
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

        var formid = this.formSocket.getExtra('ctlid');
        var formKernel = this.bluePrint.master.project.getControlById(formid);
        if (this.checkCompileFlag(formKernel == null, '必须选择一个FORM', helper)) {
            return false;
        }
        this.formKernel = formKernel;
        var relCtlKernel = this.bluePrint.ctlKernel;
        var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
        if (this.checkCompileFlag(canAccessCtls_arr.indexOf(formKernel) == -1, '指定的Form不可访问', helper)) {
            return false;
        }
        var formDS = formKernel.getAttribute(AttrNames.DataSource);
        var selectMode = formKernel.getAttribute(AttrNames.SelectMode);

        var myJSBlock = new FormatFileBlock('');
        belongBlock.pushChild(myJSBlock);
        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);

        var ctlDeclareBlock = new FormatFileBlock('ctldeclare');
        myJSBlock.pushChild(ctlDeclareBlock);

        var indexVarName = this.id + "_index";
        var countVarName = this.id + "_count";
        var formSelectedValueVarName;
        if (selectMode != ESelectMode.None) {
            if (selectMode == ESelectMode.Single) {
                formSelectedValueVarName = this.id + '_' + VarNames.SelectedValue;
                myJSBlock.pushLine(makeLine_DeclareVar(formSelectedValueVarName, formKernel.id + "_state." + VarNames.SelectedValue, false));
            }
            else if (selectMode == ESelectMode.Multi) {
                formSelectedValueVarName = this.id + '_' + VarNames.SelectedValues_arr;
                myJSBlock.pushLine(makeLine_DeclareVar(formSelectedValueVarName, formKernel.id + "_state." + VarNames.SelectedValues_arr, false));
                myJSBlock.pushLine('if(' + formSelectedValueVarName + '==null){' + formSelectedValueVarName + '=[];}');
            }
        }

        var formrowsVarName = formKernel.id + '_' + VarNames.Records_arr;
        helper.addUseControlPropApi(formKernel, {
            stateName: VarNames.Records_arr,
            useAttrName: VarNames.Records_arr,
            relyStateName: VarNames.Records_arr,
            norelyact: true,
        }, EFormRowSource.None);
        helper.setUseFormTraveral(formKernel);
        if (formKernel.isGridForm()) {
            if (this.bluePrint.linkPool.getLinksBySocket(this.selectedSocket).length > 0) {
                // 使用了selected标志,侦听变更方法
                var listenAttrName = selectMode == ESelectMode.Single ? VarNames.SelectedValue : VarNames.SelectedValues_arr;
                helper.addUseControlPropApi(formKernel, {
                    stateName: listenAttrName,
                    useAttrName: listenAttrName,
                    relyStateName: listenAttrName,
                }, EFormRowSource.None);
            }
        }

        var fromPathVarName = this.id + "_path";
        var belongUserCtl = formKernel.searchParentKernel(UserControlKernel_Type, true);
        var formPathInitval = formKernel.getStatePath(null, '.', { mapVarName: VarNames.RowKeyInfo_map });
        if (belongUserCtl) {
            formPathInitval = belongUserCtl.id + '_path + ' + singleQuotesStr('.' + formPathInitval);
        }
        else {
            formPathInitval = singleQuotesStr(formPathInitval);
        }
        myJSBlock.pushLine(makeLine_DeclareVar(this.id + '_' + VarNames.NeedSetState, '{}', false));
        myJSBlock.pushLine(makeLine_DeclareVar(fromPathVarName, formPathInitval, false));
        myJSBlock.pushLine(makeLine_DeclareVar(indexVarName, '-1', false));
        myJSBlock.pushLine(makeLine_DeclareVar(countVarName, formrowsVarName + ' == null ? 0 : ' + formrowsVarName + '.length', false));
        myJSBlock.pushLine('var ' + this.id + '_processNext = ()=>{', 1);
        myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
        var circleBlock = new FormatFileBlock('circleblcok');
        myJSBlock.pushChild(circleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');
        //myJSBlock.pushLine(makeStr_AddAll('for(var ', indexVarName, '=0;', formrowsVarName + '!=null && ' + indexVarName, '<', formrowsVarName, '.length;++', indexVarName, '){'), 1);
        circleBlock.pushLine(indexVarName + '++;');
        circleBlock.pushLine('if(' + indexVarName + '>=' + countVarName + '){', 1);
        circleBlock.pushLine(this.id + '_endfun();');
        circleBlock.pushLine('return;');
        circleBlock.subNextIndent();
        circleBlock.pushLine('}');
        var validrowBlock = new FormatFileBlock('valid');
        var invalidrowBlock = new FormatFileBlock('invalid');
        var recordVarName = this.id + '_record';
        var keyVarName = this.id + '_key';
        var isSelectedVarName = this.id + '_isselected';
        var rowStateVarName = this.id + '_rowState';
        var formStateVarName = formKernel.id + '_state';
        var isvalidVarName = this.id + '_isvalid';
        var validErrVarName = this.id + '_validerr';
        var hadErrVarName = this.id + '_hadvaliderr';
        selfCompileRet.setSocketOut(this.selectedSocket, isSelectedVarName);
        selfCompileRet.setSocketOut(this.recordSocket, recordVarName);
        selfCompileRet.setSocketOut(this.keySocket, keyVarName);
        selfCompileRet.setSocketOut(this.validrowSocket, isvalidVarName);
        selfCompileRet.setSocketOut(this.rowindexSocket, indexVarName);
        selfCompileRet.setSocketOut(this.rowcountSocket, countVarName);
        circleBlock.pushLine(makeLine_DeclareVar(recordVarName, formrowsVarName + '[' + indexVarName + ']', false));
        var formKeyColumn = formKernel.getAttribute(AttrNames.KeyColumn);
        /*
        if (IsEmptyString(formKeyColumn)) {
            formKeyColumn = indexVarName;
        }
        else {
            formKeyColumn = singleQuotesStr(formKeyColumn);
        }
        */
        circleBlock.pushLine(makeLine_DeclareVar(keyVarName, formKeyColumn == DefaultKeyColumn ? indexVarName : recordVarName + '.' + formKeyColumn, false));
        circleBlock.pushLine(makeLine_DeclareVar(this.id + '_rowpath', fromPathVarName + " + '.row_' + " + keyVarName, false));
        circleBlock.pushLine(makeLine_DeclareVar(rowStateVarName, formStateVarName + "['row_'+" + keyVarName + "]", false));
        circleBlock.pushLine(makeLine_DeclareVar(isvalidVarName, 'true', false));
        circleBlock.pushLine(makeLine_DeclareVar(validErrVarName, 'null', false));
        circleBlock.pushLine(makeLine_DeclareVar(hadErrVarName, 'false', false));
        if (formSelectedValueVarName) {
            if (selectMode == ESelectMode.Single) {
                circleBlock.pushLine(makeLine_DeclareVar(isSelectedVarName, formSelectedValueVarName + ' == ' + keyVarName, false));
            }
            else {
                circleBlock.pushLine(makeLine_DeclareVar(isSelectedVarName, formSelectedValueVarName + '.indexOf(' + keyVarName + ') != -1;', false));
            }
        }
        circleBlock.pushLine('if(' + rowStateVarName + '==null || ' + rowStateVarName + '._isdirty){', 1);
        circleBlock.pushLine(makeLine_SetValue(isvalidVarName, 'false'));
        circleBlock.subNextIndent();
        circleBlock.pushLine('}');
        var checkCtlBlock = new FormatFileBlock('checkctl');
        circleBlock.pushLine('if(' + isvalidVarName + '){', 1);
        circleBlock.pushChild(checkCtlBlock);
        circleBlock.subNextIndent();
        circleBlock.pushLine('}');

        var ctlKernel;
        var outCtls_arr = [];
        var useControls_arr = [];
        this.useControls_arr = useControls_arr;
        for (var si in this.outputScokets_arr) {
            var outSocket = this.outputScokets_arr[si];
            if (outSocket.type == SocketType_CtlKernel) {
                var ctlid = outSocket.getExtra('ctlid');
                ctlKernel = this.bluePrint.master.project.getControlById(ctlid);
                if (this.checkCompileFlag(ctlKernel == null, ctlid + '不存在', helper)) {
                    return false;
                }
                if (outCtls_arr.indexOf(ctlKernel) != -1) {
                    continue;
                }
                if (this.checkCompileFlag(!formKernel.isKernelInRow(ctlKernel), ctlKernel.getReadableName() + '不是Form中可访问的控件', helper)) {
                    return false;
                }
                outCtls_arr.push(ctlKernel);
                var nullable = false;
                var belongLabeledKernel = null;
                if (ctlKernel.type != M_LabelKernel_Type) {
                    belongLabeledKernel = ctlKernel.searchParentKernel(M_LabelKernel_Type, true);
                    if (belongLabeledKernel) {
                        nullable = belongLabeledKernel.getAttribute(AttrNames.Nullable);
                        if (formKernel.isGridForm() && belongLabeledKernel.parent == formKernel) {
                            belongLabeledKernel = null;
                        }
                    }
                    else {
                        if (ctlKernel.hasAttribute(AttrNames.Nullable)) {
                            nullable = ctlKernel.getAttribute(AttrNames.Nullable);
                        }
                    }
                }
                var ctlStateVarName = this.id + '_' + ctlid + '_state';
                useControls_arr.push({
                    ctl: ctlKernel,
                    useProps: {},
                    labeledKernel: belongLabeledKernel,
                    stateVarName: ctlStateVarName,
                    nullable: nullable,
                });

                if (belongLabeledKernel) {
                    if (outCtls_arr.indexOf(belongLabeledKernel) == -1) {
                        outCtls_arr.push(belongLabeledKernel);
                        ctlDeclareBlock.pushLine(makeLine_DeclareVar(this.id + '_' + belongLabeledKernel.id + '_state', 'null', false));
                        checkCtlBlock.pushLine(this.id + '_' + belongLabeledKernel.id + "_state=" + makeStr_getStateByPath(rowStateVarName, singleQuotesStr(belongLabeledKernel.getStatePath(null, '.', null, true, formKernel)), '{}') + ";");
                    }
                }
                ctlDeclareBlock.pushLine(makeLine_DeclareVar(ctlStateVarName, 'null', false));
                checkCtlBlock.pushLine(ctlStateVarName + "=" + makeStr_getStateByPath(rowStateVarName, singleQuotesStr(ctlKernel.getStatePath(null, '.', null, true, formKernel)), '{}') + ";");
                selfCompileRet.setSocketOut(outSocket, ctlStateVarName);
            }
        }
        var foreachBlock = new FormatFileBlock('foreach');
        circleBlock.pushChild(foreachBlock);

        var foreachFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.foreachFlowSocket);
        if (this.checkCompileFlag(foreachFlowLinks_arr.length == 0, '不可没有后续处理', helper)) {
            return false;
        }
        if (this.compileFlowNode(foreachFlowLinks_arr[0], helper, usePreNodes_arr, foreachBlock) == false) {
            return false;
        }

        var needCheckProps_map = {};
        for (var ci in useControls_arr) {
            var ctlset = useControls_arr[ci];
            for (var pi in ctlset.useProps) {
                var apiitem = ctlset.useProps[pi];
                //这里的属性引用也不需要汇报
                //helper.addUseControlPropApi(ctlset.ctl, apiitem, EFormRowSource.None);
                var stateVarName = this.id + '_' + ctlset.ctl.id + '_' + apiitem.stateName;
                ctlDeclareBlock.pushLine(makeLine_DeclareVar(stateVarName, 'null', false));
                checkCtlBlock.pushLine(stateVarName + '=' + ctlset.stateVarName + '.' + apiitem.stateName + ';');
                if (apiitem.needValid) {
                    var valueType = 'string';
                    if (ctlset.ctl.hasAttribute(AttrNames.ValueType)) {
                        valueType = ctlset.ctl.getAttribute(AttrNames.ValueType);
                    }

                    checkCtlBlock.pushLine(validErrVarName + ' = ' + makeStr_callFun('BaseIsValueValid', [
                        VarNames.State,
                        ctlset.labeledKernel ? this.id + '_' + ctlset.labeledKernel.id + '_state' : 'null',
                        ctlset.stateVarName,
                        stateVarName,
                        singleQuotesStr(valueType),
                        ctlset.nullable ? 'true' : 'false',
                        singleQuotesStr(ctlset.ctl.id),
                        validErrVarName,
                        fromPathVarName,
                    ]) + ";");
                    checkCtlBlock.pushLine('if(' + validErrVarName + '){' + hadErrVarName + '=true;};');
                }
                else {
                    if (helper.projectCompiler) {
                        if (ctlset.ctl.type == UserControlKernel_Type) {
                            var templateKernelMidData = helper.projectCompiler.getMidData(ctlset.ctl.getTemplateKernel().id);
                            var propChecker = templateKernelMidData.propChecker_map[apiitem.stateName];
                            if (propChecker) {
                                if (needCheckProps_map[ctlset.ctl.id + propChecker] == null) {
                                    needCheckProps_map[ctlset.ctl.id + propChecker] = 1;
                                    checkCtlBlock.pushLine(validErrVarName + ' = ' + makeStr_callFun(propChecker, [VarNames.State, this.id + '_rowpath + ' + singleQuotesStr('.' + ctlset.ctl.getStatePath('', '.', null, true, formKernel))]));
                                    checkCtlBlock.pushLine('if(' + validErrVarName + '){' + hadErrVarName + '=true;};');
                                }
                            }
                        }
                    }
                }
            }
        }

        myJSBlock.pushLine('var ' + this.id + '_endfun = ()=>{', 1);
        var endBlock = new FormatFileBlock('endblock');
        endBlock.pushLine(VarNames.State + '=null;');
        myJSBlock.pushLine('setTimeout(() => {', 1);
        myJSBlock.pushLine('if(!IsEmptyObject(' + this.id + '_' + VarNames.NeedSetState + ')){', 1);
        myJSBlock.pushLine("store.dispatch(makeAction_setManyStateByPath(" + this.id + '_' + VarNames.NeedSetState + ", ''));");
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');
        myJSBlock.pushChild(endBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},20);');
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('}');

        myJSBlock.pushLine('setTimeout(() => {', 1);
        myJSBlock.pushLine(this.id + '_processNext();');
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('},10);');

        helper.compilingFun.hadServerFetch = true;
        checkCtlBlock.pushLine(isvalidVarName + '=' + validErrVarName + '==null;');

        if (this.compileOutFlow(helper, usePreNodes_arr, endBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_CircleEnd extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CIRCLEEND, '遍历结束', false, nodeJson);
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
        var traverNode = null;
        for (var nodeI = preNodes_arr.length - 1; nodeI > 0; --nodeI) {
            var temNode = preNodes_arr[nodeI];
            if (temNode.type == JSNODE_TRAVERSALFORM) {
                traverNode = temNode;
                break;
            }
        }
        if (this.checkCompileFlag(traverNode == null, '没有找到归属的遍历节点', helper)) {
            return false;
        }
        var myJSBlock = new FormatFileBlock('myjs');
        belongBlock.pushChild(myJSBlock);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        myJSBlock.pushLine(traverNode.id + '_processNext();');
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('},10);');
        }
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        return selfCompileRet;
    }
}

class JSNode_DD_MapSearch extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DD_MAP_SEARCH, '钉钉.地图定位', false, nodeJson);
        autoBind(this);
        this.genCloseure = true;

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
        this.genCloseure = true;

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

class JSNode_GetFormXMLData extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETFORMXMLDATA, 'FormXMLData', false, nodeJson);
        autoBind(this);
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'xml') {
                        this.xmlSocket = socket;
                    }
                    else if (socket.name == 'text') {
                        this.textSocket = socket;
                    }
                    else if (socket.name == 'textarr') {
                        this.textarrSocket = socket;
                    }
                    else if (socket.name == 'count') {
                        this.countSocket = socket;
                    }
                    else if (socket.name == 'valid') {
                        this.validSocket = socket;
                    }
                });
            }
            if (this.inputScokets_arr.length > 0) {
                this.inputScokets_arr.forEach(socket => {
                    if (socket.name == 'form') {
                        this.formSocket = socket;
                    }
                    else if (socket.name == 'split') {
                        this.splitSocket = socket;
                    }
                });
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
        if (this.formSocket == null) {
            this.formSocket = new NodeSocket('form', this, true);
            this.addSocket(this.formSocket);
        }
        if (this.splitSocket == null) {
            this.splitSocket = new NodeSocket('split', this, true);
            this.addSocket(this.splitSocket);
        }
        if (this.xmlSocket == null) {
            this.xmlSocket = this.addSocket(new NodeSocket('xml', this, false));
        }
        if (this.textSocket == null) {
            this.textSocket = this.addSocket(new NodeSocket('text', this, false));
        }
        if (this.textarrSocket == null) {
            this.textarrSocket = this.addSocket(new NodeSocket('textarr', this, false));
        }
        if (this.countSocket == null) {
            this.countSocket = this.addSocket(new NodeSocket('count', this, false));
        }
        if (this.validSocket == null) {
            this.validSocket = this.addSocket(new NodeSocket('valid', this, false));
        }
        
        this.formSocket.inputable = false;
        this.formSocket.type = SocketType_CtlKernel;
        this.formSocket.kernelType = M_FormKernel_Type;
        this.formSocket.label = 'form';

        this.splitSocket.inputable = true;
        this.splitSocket.label = '分隔符';
        this.splitSocket.type = ValueType.String;

        this.xmlSocket.label = 'xml';
        this.textSocket.label = 'text';
        this.textarrSocket.label = 'textArr';
        this.countSocket.label = 'count';
        this.validSocket.label = 'isValid';

        this.xmlSocket.type = ValueType.String;
        this.textSocket.type = ValueType.String;
        this.countSocket.type = ValueType.Int;
        this.validSocket.type = ValueType.Boolean;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        var compileRet = helper.getCompileRetCache(this);
        var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(socketValue, targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var project = this.bluePrint.master.project;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var links_arr = this.bluePrint.linkPool.getLinksBySocket(this.formSocket);
        var selectedCtlid;
        var selectedKernel;
        var traversalFromNode = null;
        if (links_arr.length > 0) {
            var link = links_arr[0];
            var fromNode = link.outSocket.node;
            if (fromNode.type == FLOWNODE_COLUMN_VAR) {
                var keySocket = fromNode.getKeySocket();
                if (keySocket) {
                    if (keySocket.node.type == JSNODE_TRAVERSALFORM) {
                        selectedCtlid = keySocket.getExtra('ctlid');
                        traversalFromNode = keySocket.node;
                    }
                }
            }
            else if (fromNode.type == JSNODE_TRAVERSALFORM) {
                selectedCtlid = link.outSocket.getExtra('ctlid');
                traversalFromNode = fromNode;
            }
        }
        else {
            selectedCtlid = this.formSocket.getExtra('ctlid');
        }
        if (!IsEmptyString(selectedCtlid)) {
            selectedKernel = this.bluePrint.master.project.getControlById(selectedCtlid);
        }

        if (this.checkCompileFlag(selectedKernel == null, '需要选择控件', helper)) {
            return false;
        }
        var relCtlKernel = this.bluePrint.ctlKernel;
        if (traversalFromNode == null) {
            var canAccessCtls_arr = relCtlKernel.getAccessableKernels(this.ctltype);
            if (this.checkCompileFlag(canAccessCtls_arr.indexOf(selectedKernel) == -1, '指定的控件不可访问', helper)) {
                return false;
            }
        }

        if (this.checkCompileFlag(selectedKernel.isPageForm(), '页面form无法使用此属性', helper)) {
            return false;
        }

        var socketComRet = this.getSocketCompileValue(helper, this.splitSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var splitChar = socketComRet.value;
        if(IsEmptyString(splitChar)){
            splitChar = "''";
        }

        var rltVarName = this.id + '_data';
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var formStateVarName = selectedKernel.id + '_state';
        var formPathVarName = selectedKernel.id + '_path';
        if (traversalFromNode == null) {
            helper.addUseForm(selectedKernel, EFormRowSource.Context);
        }
        else {
            traversalFromNode.addUseControlPath(selectedKernel);
            formStateVarName = traversalFromNode.id + '_' + selectedKernel.id + '_state';
            formPathVarName = traversalFromNode.id + '_' + selectedKernel.id + '_path';
        }
        links_arr = this.bluePrint.linkPool.getLinksBySocket(this.xmlSocket);
        var useXmlSocket = links_arr.length > 0;
        links_arr = this.bluePrint.linkPool.getLinksBySocket(this.textSocket);
        var useTextSocket = links_arr.length > 0;
        if (this.checkCompileFlag(!useXmlSocket && !useTextSocket, '并没有使用xml或text数据', helper)) {
            return false;
        }
        if (helper.projectCompiler) {
            var formMidData = helper.projectCompiler.getMidData(selectedKernel.id);
            formMidData.useFormXML = useXmlSocket;
            formMidData.useFormXMLText = useTextSocket;
        }
        myJSBlock.pushLine(makeLine_DeclareVar(rltVarName, makeStr_callFun('GenFormXmlData',[formStateVarName, selectedKernel.id + '_' + AttrNames.Function.GetXMLRowItem, selectedKernel.id + '_xmlconfig', singleQuotesStr(selectedKernel.getAttribute(AttrNames.KeyColumn)), formPathVarName, splitChar]), false));

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.xmlSocket, rltVarName + '.xml');
        selfCompileRet.setSocketOut(this.textSocket, rltVarName + '.text');
        selfCompileRet.setSocketOut(this.countSocket, rltVarName + '.count');
        selfCompileRet.setSocketOut(this.validSocket, rltVarName + '.isValid');
        selfCompileRet.setSocketOut(this.textarrSocket, rltVarName + '.textarr');
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Page_CallFun extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_PAGE_CALLFUN, 'Call页面方法', false, nodeJson);
        autoBind(this);
        this.genCloseure = true;
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
        rlt.script_name = this.script_name;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['script_name']);
    }

    synSockets() {
        var scriptBP = this.bluePrint.master.getBPByName(this.script_name);
        this.inputScokets_arr.forEach(s => {
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
        }

        this.inputScokets_arr.filter(s => { return s.valid == false; }).forEach(s => { this.removeSocket(s) });

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

        if (this.checkCompileFlag(IsEmptyString(this.script_name), '需要选择目标脚本', helper)) {
            return false;
        }
        var targetBP = this.bluePrint.master.getBPByName(this.script_name);
        if (this.checkCompileFlag(targetBP == null, '选择的脚本无效', helper)) {
            return false;
        }
        var pageKernel = this.bluePrint.master.project.getControlById(targetBP.ctlid); 
        if (this.checkCompileFlag(pageKernel, '选定的方法无效', helper)) {
            return false;
        }
        this.synSockets();

        var inputs_arr = [];
        for (var si in this.inputScokets_arr) {
            var socket = this.inputScokets_arr[si];
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true);
            if (socketComRet.err) {
                return false;
            }
            inputs_arr.push(socketComRet.value);
        }
        
        var myJSBlock = new FormatFileBlock(this.id);
        var flowUseBlock = myJSBlock;
        belongBlock.pushChild(myJSBlock);
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        myJSBlock.pushLine(makeStr_callFun(targetBP.name, inputs_arr, ';'));
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, flowUseBlock) == false) {
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
        if (preNodes_arr[preNodes_arr.length - 1].type == JSNODE_BATCH_CONTROL_API_PROPSETTER
            ||
            preNodes_arr[preNodes_arr.length - 1].type == JSNODE_ADD_DYNAMIC_BATCH_API
        ) {
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
            myJSBlock.pushLine('ClosePopperBtn(' + pathVar + ',' + batchNode.needSetVarName + ');');
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

class JSNode_CallCusScript extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CALLCUSSCRIPT, '调用脚本', false, nodeJson);
        autoBind(this);
        this.genCloseure = true;
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


class JSNode_SetTimeout extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SETTIMEOUT, 'SetTimeout', false, nodeJson);
        autoBind(this);
        this.genCloseure = true;

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
        myJSBlock.pushLine('for(' + indexVarName + '=0;' + socketValue + '!=null && ' + indexVarName + '<' + socketValue + '.length;++' + indexVarName + '){', 1);
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
        myJSBlock.pushLine('else if(gWeakParentFrame){gWeakParentFrame.sendMessage(' + typeValue + ',' + dataValue + ');}');

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

class JSNode_Add_Dynamic_Batch_Api extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_ADD_DYNAMIC_BATCH_API, '动态添加api', false, nodeJson);
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

        if(this.inputScokets_arr.length > 0){
            this.varSocket = this.inputScokets_arr[0];
        }
        if(this.varSocket == null){
            this.varSocket = this.addSocket(new NodeSocket('var', this, true));
        }
        this.varSocket.label = '变量';
        this.varSocket.type = ValueType.Object;
        this.varSocket.inputable = false;
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
        belongBlock.pushChild(myJSBlock);

        var temLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.varSocket);
        if (this.checkCompileFlag(temLinks_arr.length == 0, '必须提供变量', helper)) {
            return false;
        }
        var link = temLinks_arr[0];
        var varNode = link.outSocket.node;
        if (this.checkCompileFlag(varNode.type != JSNODE_VAR_GET, '必须提供的是变量节点', helper)) {
            return false;
        }
        if (this.checkCompileFlag(varNode.varData.valType != ValueType.BatchVar, '变量必须是batchvar类型', helper)) {
            return false;
        }
        var comret = varNode.compile(helper, usePreNodes_arr, belongBlock);
        if(comret == false){
            return false;
        }

        var needSetVarName = comret.getSocketOut(link.outSocket).strContent;
        this.needSetVarName = needSetVarName;
        var i;
        var theSocket;
        for (i = 0; i < this.inFlowSockets_arr.length; ++i) {
            theSocket = this.inFlowSockets_arr[i];
            var links_arr = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            if (this.checkCompileFlag(links_arr.length == 0, '输入不可为空', helper)) {
                return false;
            }
            var theNode = links_arr[0].outSocket.node;
            if (this.checkCompileFlag(theNode.type != JSNODE_CONTROL_API_PROPSETTER && theNode.type != JSNODE_CLOSEPOPPER && theNode.type != JSNODE_CONTROL_API_CALLFUN, '输入只能链接API设置节点或ClosePopper或callfun', helper)) {
                return false;
            }
            if (theNode.compile(helper, usePreNodes_arr, myJSBlock) == false) {
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

class JSNode_Excute_Dynamic_Batch_Api extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EXCUTE_DYNAMIC_BATCH_API, '执行动态批量api', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        
        if(this.inputScokets_arr.length > 0){
            this.varSocket = this.inputScokets_arr[0];
        }
        if(this.varSocket == null){
            this.varSocket = this.addSocket(new NodeSocket('var', this, true));
        }
        this.varSocket.label = '变量';
        this.varSocket.type = ValueType.Object;
        this.varSocket.inputable = false;
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
        belongBlock.pushChild(myJSBlock);

        var temLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.varSocket);
        if (this.checkCompileFlag(temLinks_arr.length == 0, '必须提供变量', helper)) {
            return false;
        }
        var link = temLinks_arr[0];
        var varNode = link.outSocket.node;
        if (this.checkCompileFlag(varNode.type != JSNODE_VAR_GET, '必须提供的是变量节点', helper)) {
            return false;
        }
        if (this.checkCompileFlag(varNode.varData.valType != ValueType.BatchVar, '变量必须是batchvar类型', helper)) {
            return false;
        }
        var comret = varNode.compile(helper, usePreNodes_arr, belongBlock);
        if(comret == false){
            return false;
        }

        var needSetVarName = comret.getSocketOut(link.outSocket).strContent;
        var inreducer = this.isInReducer(usePreNodes_arr);
        inreducer = false;  // 没有调试清除，还是做延迟处理
        if (!inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(makeAction_setManyStateByPath(" + needSetVarName + ", ''));");
        }
        else{
            myJSBlock.pushLine(makeStr_callFun("setManyStateByPath", [VarNames.State, "''", needSetVarName],';'));
        }

        if (!inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
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
JSNodeClassMap[JSNODE_IFRAME_SENDMSG] = {
    modelClass: JSNode_IFrame_SendMsg,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_TRAVERSALFORM] = {
    modelClass: JSNode_TraversalForm,
    comClass: C_JSNode_TraversalForm,
};
JSNodeClassMap[JSNODE_TRAVERSALFORM] = {
    modelClass: JSNode_TraversalForm,
    comClass: C_JSNode_TraversalForm,
};
JSNodeClassMap[JSNODE_CIRCLEEND] = {
    modelClass: JSNode_CircleEnd,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_OPENEXTERNAL_PAGE] = {
    modelClass: JsNode_OpenExternal_Page,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DD_GETGEO_LOCATION] = {
    modelClass: JSNode_DD_GetGeoLoaction,
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
JSNodeClassMap[JSNODE_GETFORMXMLDATA] = {
    modelClass: JSNode_GetFormXMLData,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_PAGE_CALLFUN] = {
    modelClass: JSNode_Page_CallFun,
    comClass: C_JSNode_Page_CallFun,
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
JSNodeClassMap[JSNODE_ADD_DYNAMIC_BATCH_API] = {
    modelClass: JSNode_Add_Dynamic_Batch_Api,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_EXCUTE_DYNAMIC_BATCH_API] = {
    modelClass: JSNode_Excute_Dynamic_Batch_Api,
    comClass: C_Node_SimpleNode,
};