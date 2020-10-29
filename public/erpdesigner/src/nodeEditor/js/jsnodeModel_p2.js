const JSNODE_OP_NOT = 'opnot';
const JSNODE_ADDPAGETOFRAMESET = 'addpagetoframeset';
const JSNODE_CUSOBJECT_NEW = 'cusobjectnew';
const JSNODE_CUSOBJECT_VISIT = 'cusobjectvisit';
const JSNODE_CUSOBJECT_MODIFY = 'cusobjectmodify';
const JSNODE_FUN_CREATE = 'createlocalfun';
const JSNODE_FUN_CALL = 'callfun';
const JSNODE_IFRAME_SENDMSG = 'iframesendmsg';
const JSNODE_TRAVERSALFORM = 'traversalform';
const JSNODE_GETFORMXMLDATA = 'getformxmldata';
const JSNODE_GETFORMJSONDATA = 'getformjsondata';
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

const JSNODE_CHART_NEWDATASET = 'chart_newdateset';
const JSNODE_CHART_GENCOLOR = 'chart_gencolor';
const JSNODE_CHART_FRESH = 'chart_fresh';

const JSNODE_OPENREPORT = 'openreport';
const JSNODE_EXPORTEXCEL = 'exportexcel';
const JSNODE_IMPORTEXCEL = 'importexcel';

const JSNODE_FORM_SETSTATVALUE = 'formsetstatvalue';
const JSNODE_GETOBJECTPROP = 'getobjectprop';
const JSNODE_SETOBJECTPROP = 'setobjectprop';

const JSNODE_OBJECT_CLONE = 'objectclone';

const JSNODE_LONGSERVERPROCESS = 'longserverprocess';

const JSNODE_HASHDATASOURCE_ROW = 'hashdatasourcerow';

const JSNODE_XML_EXTRACTCOLUMN = 'xmlextractcolumn';

const JSNODE_DEBUG_LOG = 'debuglog';

const JSNODE_STRING_LENGTH = 'stringlength';
const JSNODE_STRING_SUBSTRING = 'stringsubstring';
const JSNODE_STRING_SUBSTR = 'stringsubstr';
const JSNODE_STRING_INDEXOF = 'stringindexOf';
const JSNODE_STRING_SPLIT = 'stringsplit';
const JSNODE_ISEMPTYSTRING = 'isemptystring';
const JSNODE_ISEMPTYARRAY = 'isemptyarray';

const JSNODE_CREATESTYLEOBJECT = 'createstyleobj';
const JSNODE_CREATECLASSOBJECT = 'createclassobj';

const SpecialCharReg = /[\(\)\[\]\.]/;

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


class JSNode_CusObject_Modify extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CUSOBJECT_MODIFY, '修改数据对象', false, nodeJson);
        autoBind(this);

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        this.insocketInitVal = {
            type: ValueType.Object,
            inputable: false,
        };
        if (createHelper) {
            var cusObj = createHelper.project.scriptMaster.getCusObjByCode(this.code);
        }

        if (this.inputScokets_arr.length > 0) {
            this.objSocket = this.inputScokets_arr.find(s=>{return s.name == 'obj';});

        }
        if (this.objSocket == null) {
            this.objSocket = this.addSocket(new NodeSocket('obj', this, true));
        }
        this.objSocket.label = 'target';

        this.setCusObj(cusObj);
    }

    preRemoveSocket(socket) {
        return socket != this.objSocket;
    }

    setCusObj(cusObj) {
        this.code = cusObj ? cusObj.code : null;
        this.cusObj = cusObj;
    }

    getJson(jsonProf) {
        var theJson = super.getJson(jsonProf);
        if (jsonProf) {
            jsonProf.addCusObject(this.cusObj);
        }
        return theJson;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.code = this.code;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['code']);
    }

    propChangedHandler(value, dropdown){
        var theSocketID = getAttributeByNode(dropdown.rootDivRef.current, 'd-socketid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('prop', value);
    }

    customSocketRender(socket){
        if (!socket.isIn || socket == this.objSocket) {
            return null;
        }
        var options_arr = [];
        if(this.cusObj){
            options_arr = this.cusObj.dataMembers_arr.concat();
        }
        var nowVal = socket.getExtra('prop');
        return <DropDownControl itemChanged={this.propChangedHandler} btnclass='btn-dark' options_arr={options_arr} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} />;
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

        var cusObj = this.bluePrint.master.getCusObjByCode(this.code);
        if (this.checkCompileFlag(cusObj == null, '需要选择对象类型', helper)) {
            return false;
        }
        var socketComRet = this.getSocketCompileValue(helper, this.objSocket, usePreNodes_arr, belongBlock, false, false);
        if (socketComRet.err) {
            return false;
        }
        var selfCompileRet = new CompileResult(this);
        var objSocketValue = socketComRet.value;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            if(theSocket == this.objSocket){
                continue;
            }
            socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false, false);
            if (socketComRet.err) {
                return false;
            }
            var prop = theSocket.getExtra('prop');
            if (this.checkCompileFlag(cusObj.dataMembers_arr.indexOf(prop) == -1, prop + '属性名称无效', helper)) {
                return false;
            }
            myJSBlock.pushLine(objSocketValue + '.' + prop + '=' + socketComRet.value + ';');
        }
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
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
        var superRet = super.compile(helper, preNodes_arr);
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
            if (temNode.type == JSNODE_ARRAY_FOR && temNode.manualMode) {
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
                    else if (socket.name == 'onlySelected') {
                        this.onlySelectedSocket = socket;
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
        if (this.onlySelectedSocket == null) {
            this.onlySelectedSocket = this.addSocket(new NodeSocket('onlySelected', this, true));
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
        this.onlySelectedSocket.label = '只要选择行';
        this.onlySelectedSocket.inputable = true;
        if(this.onlySelectedSocket.defval == null){
            this.onlySelectedSocket.defval = false;
        }

        this.xmlSocket.type = ValueType.String;
        this.textSocket.type = ValueType.String;
        this.countSocket.type = ValueType.Int;
        this.validSocket.type = ValueType.Boolean;
        this.onlySelectedSocket.type = ValueType.Boolean;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        var compileRet = helper.getCompileRetCache(this);
        //var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(this.id + '_data', targetSocket);
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
        if (IsEmptyString(splitChar)) {
            splitChar = "''";
        }

        socketComRet = this.getSocketCompileValue(helper, this.onlySelectedSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var onlySelected = socketComRet.value;

        var rltVarName = this.id + '_data';
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var formStateVarName = selectedKernel.id + '_state';
        var formPathVarName = selectedKernel.id + '_path';
        if (traversalFromNode == null) {
            helper.addUseForm(selectedKernel, EFormRowSource.None);
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
        myJSBlock.pushLine(makeLine_DeclareVar(rltVarName, makeStr_callFun('GenFormXmlData', [formStateVarName, selectedKernel.id + '_' + AttrNames.Function.GetXMLRowItem, selectedKernel.id + '_xmlconfig', singleQuotesStr(selectedKernel.getAttribute(AttrNames.KeyColumn)), formPathVarName, splitChar, onlySelected]), false));

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
        var links_arr = this.bluePrint.linkPool.getLinksBySocket(this.inFlowSocket);
        if (links_arr.length == 0) {
            var nextNode = preNodes_arr[preNodes_arr.length - 1];
            if (nextNode.type == JSNODE_BATCH_CONTROL_API_PROPSETTER
                ||
                nextNode.type == JSNODE_ADD_DYNAMIC_BATCH_API
            ) {
                batchNode = nextNode;
                batchMode = true;
            }
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
        if (this.inputSocket.defval == null) {
            this.inputSocket.defval = 20;
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
                    else if (socket.name == 'len') {
                        this.lenSocket = socket;
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
        if (this.lenSocket == null) {
            this.lenSocket = this.addSocket(new NodeSocket('len', this, false));
        }
        if (this.manualMode == null) {
            this.manualMode = false;
        }
        this.inSocket.label = 'array';
        this.dataSocket.label = 'data';
        this.indexSocket.label = 'index';
        this.lenSocket.label = 'length';
        this.inSocket.type = ValueType.Array;
        this.inSocket.inputable = false;

        this.indexSocket.type = ValueType.Int;
        this.dataSocket.type = ValueType.Object;
        this.lenSocket.type = ValueType.Int;
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
        var socketComRet = this.getSocketCompileValue(helper, this.inSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;

        var bodyFlowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.bodyFlowSocket);
        if (this.checkCompileFlag(bodyFlowLinks_arr.length == 0, '必须设置循环体', helper)) {
            return false;
        }

        var manualMode = this.manualMode;

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var indexVarName = this.id + '_index';
        var dataVarName = this.id + '_data';
        var lenVarName = this.id + '_len';
        var childBlock = new FormatFileBlock('child');
        var endBlock = myJSBlock;
        if(manualMode){
            if (this.checkCompileFlag(blockInServer, '服务端无法使用手动模式', helper)) {
                return false;
            }
            helper.compilingFun.hadServerFetch = true;
            myJSBlock.pushLine('var ' + indexVarName + '=-1;');
            myJSBlock.pushLine('var ' + dataVarName + '=null;');
            myJSBlock.pushLine('var ' + lenVarName + '=' + socketValue + ' ? ' + socketValue + '.length : 0;');

            var endFunName = this.id + '_end';
            var endBlock = new FormatFileBlock('child');
            myJSBlock.pushLine('var ' + endFunName + '= ()=>{', 1);
            myJSBlock.pushChild(endBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
            var nextFunName = this.id + '_processNext';
            myJSBlock.pushLine('var ' + nextFunName + '= ()=>{', 1);
            myJSBlock.pushLine(indexVarName + '++;');
            myJSBlock.pushLine('if(' + indexVarName + '>=' + lenVarName + '){', 1);
            myJSBlock.pushLine(endFunName + '();');
            myJSBlock.pushLine('return;');
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
            myJSBlock.pushLine(this.bluePrint.id + '_msg.setText(' + singleQuotesStr('处理中:') + '+(' + indexVarName + '+1)+' + singleQuotesStr('/') + '+' + lenVarName + ');');
            myJSBlock.pushLine(dataVarName + '=' + socketValue + '[' + indexVarName + '];');
            myJSBlock.pushChild(childBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');

            myJSBlock.pushLine('setTimeout(' + nextFunName + ', 10);');
        }
        else{
            myJSBlock.pushLine('var ' + indexVarName + '=0;');
            myJSBlock.pushLine('var ' + dataVarName + '=null;');
            myJSBlock.pushLine('for(' + indexVarName + '=0;' + socketValue + '!=null && ' + indexVarName + '<' + socketValue + '.length;++' + indexVarName + '){', 1);
            myJSBlock.pushLine(dataVarName + '=' + socketValue + '[' + indexVarName + '];');
            myJSBlock.pushChild(childBlock);
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.dataSocket, dataVarName);
        selfCompileRet.setSocketOut(this.indexSocket, indexVarName);
        selfCompileRet.setSocketOut(this.lenSocket, lenVarName);
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

        if (this.inputScokets_arr.length > 0) {
            this.varSocket = this.inputScokets_arr[0];
        }
        if (this.varSocket == null) {
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
        if (comret == false) {
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

        if (this.inputScokets_arr.length > 0) {
            this.varSocket = this.inputScokets_arr[0];
        }
        if (this.varSocket == null) {
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
        if (comret == false) {
            return false;
        }

        var needSetVarName = comret.getSocketOut(link.outSocket).strContent;
        var inreducer = this.isInReducer(usePreNodes_arr);
        inreducer = false;  // 没有调试清除，还是做延迟处理
        if (!inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
            myJSBlock.pushLine("store.dispatch(makeAction_setManyStateByPath(" + needSetVarName + ", ''));");
        }
        else {
            myJSBlock.pushLine(makeStr_callFun("setManyStateByPath", [VarNames.State, "''", needSetVarName], ';'));
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

class JSNode_Chart_NewDataset extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CHART_NEWDATASET, '创建Dataset', false, nodeJson);
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
                switch (socket.name) {
                    case 'borderColor':
                        this.borderColorScoket = socket;
                        break;
                    case 'borderWidth':
                        this.borderWidthScoket = socket;
                        break;
                    case 'backgroundColor':
                        this.backgroundColorScoket = socket;
                        break;
                    case 'label':
                        this.labelScoket = socket;
                        break;
                    case 'fill':
                        this.fillScoket = socket;
                        break;
                }
            });
        }
        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'name':
                        this.nameScoket = socket;
                        break;
                    case 'data_arr':
                        this.dataArrScoket = socket;
                        break;
                    case 'colors_arr':
                        this.colorsArrScoket = socket;
                        break;
                }
            });
        }
        if (this.labelScoket == null) {
            this.labelScoket = this.addSocket(new NodeSocket('label', this, true));
        }
        if (this.fillScoket == null) {
            this.fillScoket = this.addSocket(new NodeSocket('fill', this, true));
        }
        if (this.borderColorScoket == null) {
            this.borderColorScoket = this.addSocket(new NodeSocket('borderColor', this, true));
        }
        if (this.borderWidthScoket == null) {
            this.borderWidthScoket = this.addSocket(new NodeSocket('borderWidth', this, true));
        }
        /*
        if(this.backgroundColorScoket == null){
            this.backgroundColorScoket = this.addSocket(new NodeSocket('backgroundColor', this, true));
        }
        this.backgroundColorScoket.label = 'backgroundColor';
        this.backgroundColorScoket.type = ValueType.String;
        this.backgroundColorScoket.inputable = true;
        */
        if (this.nameScoket == null) {
            this.nameScoket = this.addSocket(new NodeSocket('name', this, false));
        }
        if (this.dataArrScoket == null) {
            this.dataArrScoket = this.addSocket(new NodeSocket('data_arr', this, false));
        }
        if (this.colorsArrScoket == null) {
            this.colorsArrScoket = this.addSocket(new NodeSocket('colors_arr', this, false));
        }
        if (this.fillScoket.defval == null) {
            this.fillScoket.defval = false;
        }
        this.labelScoket.label = '标签';
        this.labelScoket.type = ValueType.String;
        this.labelScoket.inputable = true;
        this.fillScoket.label = '是否填充';
        this.fillScoket.type = ValueType.Boolean;
        this.fillScoket.inputable = true;
        this.borderColorScoket.label = 'borderColor';
        this.borderColorScoket.type = ValueType.String;
        this.borderColorScoket.inputable = true;
        this.borderWidthScoket.label = 'borderWidth';
        this.borderWidthScoket.type = ValueType.Int;
        this.borderWidthScoket.inputable = true;

        this.nameScoket.label = 'name';
        this.nameScoket.type = ValueType.Object;
        this.dataArrScoket.label = 'data_arr';
        this.dataArrScoket.type = ValueType.Array;
        this.colorsArrScoket.label = 'colors_arr';
        this.colorsArrScoket.type = ValueType.Array;
    }

    mouseDownOutSocketHand(ev) {
        var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
        if (socketid == null) {
            return;
        }
        var theSocket = this.sockets_map[socketid];
        var bornPos = theSocket.currentComponent.getCenterPos();
        var newNode = new FlowNode_ColumnVar({
            keySocketID: socketid,
            newborn: true,
            left: bornPos.x,
            top: bornPos.y,
        }, this.parent);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        return (<span className='d-flex align-items-center'>{socket.label}
            <button onMouseDown={this.mouseDownOutSocketHand} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
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
        belongBlock.pushChild(myJSBlock);

        var socketComRet = this.getSocketCompileValue(helper, this.borderColorScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var borderColor = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.borderWidthScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var borderWidth = socketComRet.value;
        if (this.checkCompileFlag(IsEmptyString(borderColor) ^ IsEmptyString(borderWidth) ? 1 : 0, 'borderColor和borderWidth必须同时有效或无效', helper)) {
            return false;
        }
        socketComRet = this.getSocketCompileValue(helper, this.labelScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var label = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.fillScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var isFill = socketComRet.value;
        /*
        socketComRet = this.getSocketCompileValue(helper, this.backgroundColorScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var backgroundColor = socketComRet.value;
        */
        var dataArrVarName = this.id + '_dataarr';
        var colorArrVarName = this.id + '_colorarr';
        belongBlock.pushLine(makeLine_DeclareVar(dataArrVarName, '[]', false));
        belongBlock.pushLine(makeLine_DeclareVar(colorArrVarName, '[]', false));
        belongBlock.pushLine('var ' + this.id + '={', 1);
        belongBlock.pushLine('data:' + dataArrVarName + ',');
        belongBlock.pushLine('backgroundColor:' + colorArrVarName + ',');
        belongBlock.pushLine('label:' + label + ',');
        belongBlock.pushLine('fill:' + isFill + ',');
        if (!IsEmptyString(borderColor)) {
            belongBlock.pushLine('borderColor:' + borderColor + ',');
            belongBlock.pushLine('borderWidth:' + borderWidth + ',');
        }
        belongBlock.subNextIndent();
        belongBlock.pushLine('};');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.nameScoket, this.id);
        selfCompileRet.setSocketOut(this.dataArrScoket, dataArrVarName);
        selfCompileRet.setSocketOut(this.colorsArrScoket, colorArrVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Chart_GenColor extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CHART_GENCOLOR, '图表-创建颜色', false, nodeJson);
        autoBind(this);

        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'key':
                        this.keyScoket = socket;
                        break;
                    case 'useRand':
                        this.useRandScoket = socket;
                        break;
                    case 'setid':
                        this.setidScoket = socket;
                        break;
                }
            });
        }
        if (this.outputScokets_arr.length > 0) {
            this.dataSocket = this.outputScokets_arr[0];
        }
        if (this.keyScoket == null) {
            this.keyScoket = this.addSocket(new NodeSocket('key', this, true));
        }
        if (this.useRandScoket == null) {
            this.useRandScoket = this.addSocket(new NodeSocket('useRand', this, true));
        }
        if (this.dataSocket == null) {
            this.dataSocket = this.addSocket(new NodeSocket('data', this, false));
        }
        if (this.setidScoket == null) {
            this.setidScoket = this.addSocket(new NodeSocket('setid', this, true));
        }

        if (this.useRandScoket.defval == null) {
            this.useRandScoket.defval = false;
        }

        this.setidScoket.label = '所属集合';
        this.setidScoket.type = ValueType.String;
        this.setidScoket.inputable = true;
        this.keyScoket.label = 'key';
        this.keyScoket.type = ValueType.String;
        this.keyScoket.inputable = true;
        this.useRandScoket.label = '可随机';
        this.useRandScoket.type = ValueType.Boolean;
        this.useRandScoket.inputable = true;

        this.dataSocket.label = '颜色';
        this.dataSocket.type = ValueType.String;
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

        var socketComRet = this.getSocketCompileValue(helper, this.keyScoket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var keyValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.useRandScoket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var useRand = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.setidScoket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var setid = socketComRet.value;

        var flagValue = null;
        if (this.ctlkernel) {
            flagValue = this.ctlkernel.id;
        }
        else {
            flagValue = this.bluePrint.id;
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.dataSocket, makeStr_callFun('GenColor', [IsEmptyString(setid) ? singleQuotesStr(flagValue) : setid, keyValue, useRand]));
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Chart_Fresh extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CHART_FRESH, 'CharFresh', false, nodeJson);
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
        this.inSocket.kernelType = ChartKernel_Type;

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
        return rlt;
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
            var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false, true);
            if (socketComRet == false) {
                return false;
            }
            socketValue = socketComRet.value;
        }
        if (IsEmptyString(socketValue)) {
            if (this.checkCompileFlag(this.bluePrint.ctlKernel == null, '无法定目标Chart', helper)) {
                return false;
            }
            var chartKernel = this.bluePrint.ctlKernel.searchParentKernel([ChartKernel_Type], true);
            if (this.checkCompileFlag(chartKernel == null, '无法定目标Chart', helper)) {
                return false;
            }
            socketValue = chartKernel.id;
            selectedKernel = chartKernel;
        }
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

        var myJSBlock = new FormatFileBlock('ret');
        var freshFunName = makeFName_pull(selectedKernel);
        myJSBlock.pushLine('setTimeout(() => {' + makeStr_callFun(freshFunName, [parentPath]) + ';},50);');

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

class JSNode_OpenReport extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_OPENREPORT, '打开报表', false, nodeJson);
        this.hadFetchFun = true;
        this.genCloseure = true;
        autoBind(this);
        var bluePrintIsServer = this.bluePrint.group == EJsBluePrintFunGroup.ServerScript;

        if (nodeJson) {
            this.outDataSocket = this.outputScokets_arr[0];
        }
        if (this.outDataSocket == null) {
            this.outDataSocket = new NodeSocket('identify', this, false, { type: ValueType.String });
            this.addSocket(this.outDataSocket);
        }
        this.outDataSocket.label = 'identify';

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        this.report = AllReports_arr.find(x => { return x.code == this.reportCode; });
        this.reportChanged();
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        rlt.reportCode = this.report.code;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['reportCode']);
    }

    reportChanged() {
        var report = this.report;
        if (report) {
            var params_arr = report.params_arr;
            this.inputScokets_arr.forEach(item => {
                item._validparam = false;
            });
            var hadChanged = false;
            params_arr.forEach((param, i) => {
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
            var si;
            for (si = 0; si < this.inputScokets_arr.length; ++si) {
                var theSocket = this.inputScokets_arr[si];
                if (theSocket._validparam == false) {
                    this.removeSocket(theSocket);
                    --si;
                    hadChanged = true;
                }
            }
            if (hadChanged) {
                this.fireEvent(Event_SocketNumChanged, 20);
                this.bluePrint.fireChanged();
            }
        }
        else {
            this.inputScokets_arr.concat().forEach(socket => {
                this.removeSocket(socket);
            });
            this.fireEvent(Event_SocketNumChanged, 20);
            this.bluePrint.fireChanged();
        }
        this.fireChanged();
        this.fireMoved(10);
    }

    setReport(report) {
        if (report == this.report)
            return;
        this.report = report;
        this.reportChanged();
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

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var nodeThis = this;
        if (this.checkCompileFlag(this.report == null, '需要选择一个报表', helper)) {
            return false;
        }
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '不可在服务端使用', helper)) {
            return false;
        }
        if (this.checkCompileFlag(blockInServer, '不可在服务端调用', helper)) {
            return false;
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

        var report = this.report;
        // make server side code
        var theServerSide = helper.serverSide;// ? helper.serverSide : new JSFileMaker();
        var postBundleVarName = this.bluePrint.id + '_bundle';
        var serverSideActName = this.bluePrint.id + '_' + this.id;
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
            theServerSide.initProcessFun(queryFun, this.bluePrint.ctlKernel, true);
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

        if (params_arr.length > 0) {
            params_arr.forEach(param => {
                bundleCheckBlock.pushLine('var ' + param.name + '=' + param.value + ';');
                bundleCheckBlock.pushLine("if(" + param.name + ' == null' + '){return serverhelper.createErrorRet("参数[' + param.name + ']传入值错误");}');
            });
        }

        var tryBlock = new JSFile_Try('try');
        serverFunBodyBlock.pushLine("var 记录令牌 = serverhelper.guid2();");
        serverFunBodyBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        var insertRetVarName = 'insertRet';
        var insertSql = 'INSERT INTO [dbo].[T003E报表打开记录](报表记录代码,用户令牌,记录令牌) values(@报表代码, @用户令牌, @记录令牌)';
        var insertParamStr = "dbhelper.makeSqlparam('报表代码', sqlTypes.Int, " + report.code + ")," + "dbhelper.makeSqlparam('用户令牌', sqlTypes.NVarChar(50), g_envVar.logrcdid)," + "dbhelper.makeSqlparam('记录令牌', sqlTypes.NVarChar(50), 记录令牌)";
        tryBlock.bodyBlock.pushLine('var ' + insertRetVarName + " = yield dbhelper.asynGetScalar('" + insertSql + "  select SCOPE_IDENTITY()', [" + insertParamStr + "]);");
        if (params_arr.length > 0) {
            var paramsInsertRetVarName = 'paramsInsertRet';
            tryBlock.bodyBlock.pushLine('var ' + paramsInsertRetVarName + ';');
            var insertSql = 'INSERT INTO [dbo].[T003E报表打开参数](报表打开记录代码,参数名称,参数值) values(@打开记录代码, @参数名称, @参数值)';
            params_arr.forEach(param => {
                insertParamStr = "dbhelper.makeSqlparam('打开记录代码', sqlTypes.Int, " + insertRetVarName + ")," + "dbhelper.makeSqlparam('参数名称', sqlTypes.NVarChar(50), " + singleQuotesStr(param.name) + ")," + "dbhelper.makeSqlparam('参数值', sqlTypes.NVarChar(50), " + param.name + ')';
                tryBlock.bodyBlock.pushLine(paramsInsertRetVarName + " = yield dbhelper.asynGetScalar('" + insertSql + "', [" + insertParamStr + "]);");
            });
        }
        var serverSuccessBlock = new FormatFileBlock('serverSuccessBlock');
        serverFunBodyBlock.pushChild(serverSuccessBlock);

        serverFunBodyBlock.pushLine("return 记录令牌;");
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
        myJSBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
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
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        fetchEndBlock.pushLine('OpenReport(' + dataVarName + ',' + singleQuotesStr(report.name) + ');');

        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length > 0) {
            if (this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
        } else {
            fetchEndBlock.pushLine(makeStr_callFun('return callback_final', ['state', dataVarName, 'null']) + ';');
        }
        return selfCompileRet;
    }
}

class JSNode_ExportExcel extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EXPORTEXCEL, '导出Excel', false, nodeJson);
        this.hadFetchFun = true;
        this.genCloseure = true;
        autoBind(this);

        if (nodeJson) {
            this.outDataSocket = this.outputScokets_arr[0];

            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleSocket = socket;
                        break;
                    case 'json':
                        this.jsonSocket = socket;
                        break;
                    case 'indexed':
                        this.indexedSocket = socket;
                        break;
                    case 'addquet':
                        this.addquetSocket = socket;
                        break;
                    case 'template':
                        this.tempalteSocket = socket;
                        break;
                }
            });
        }
        if (this.titleSocket == null) {
            this.titleSocket = this.addSocket(new NodeSocket('title', this, true));
        }
        if (this.jsonSocket == null) {
            this.jsonSocket = this.addSocket(new NodeSocket('json', this, true));
        }
        if (this.tempalteSocket == null) {
            this.tempalteSocket = this.addSocket(new NodeSocket('template', this, true));
        }
        if (this.indexedSocket == null) {
            this.indexedSocket = this.addSocket(new NodeSocket('indexed', this, true));
        }
        if (this.addquetSocket == null) {
            this.addquetSocket = this.addSocket(new NodeSocket('addquet', this, true));
        }
        this.titleSocket.label = '标题';
        this.jsonSocket.label = 'json数组';
        this.indexedSocket.label = '带序号';
        this.addquetSocket.label = 'addquet';
        this.tempalteSocket.type = ValueType.String;
        this.titleSocket.type = ValueType.String;
        this.jsonSocket.type = ValueType.Object;
        this.indexedSocket.type = ValueType.Boolean;
        this.addquetSocket.type = ValueType.Boolean;
        this.indexedSocket.hideIcon = true;
        this.addquetSocket.hideIcon = true;
        this.tempalteSocket.hideIcon = true;

        if (this.indexedSocket.defval == null) {
            this.indexedSocket.defval = true;
        }
        if (this.addquetSocket.defval == null) {
            this.addquetSocket.defval = false;
        }
        if (this.tempalteSocket.defval == null) {
            this.tempalteSocket.defval = 0;
        }

        if (this.outDataSocket == null) {
            this.outDataSocket = new NodeSocket('fileurl', this, false, { type: ValueType.String });
            this.addSocket(this.outDataSocket);
        }
        this.outDataSocket.label = 'fileurl';

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        this.tempalteSocket.set({
            inputable: true,
            inputDDC_setting: {
                textAttrName: 'name',
                valueAttrName: 'code',
                options_arr: AllExcelTemplate_arr,
            },
            label: '模板',
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
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket;
        var socketComRet = this.getSocketCompileValue(helper, this.titleSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var titleValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.jsonSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var jsonValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.indexedSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var indexedValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.addquetSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var addQuetValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.tempalteSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var templateValue = socketComRet.value;

        // makeClient
        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = !blockInServer;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        var initBundleBlock = new FormatFileBlock('initbundle');
        helper.addInitClientBundleBlock(initBundleBlock);
        var bundleVarName = this.id + '_bundle';

        initBundleBlock.params_map['title'] = 'fileTitle';
        initBundleBlock.params_map['data'] = jsonValue;
        initBundleBlock.params_map['bAutoIndex'] = indexedValue == true;
        initBundleBlock.params_map['bQuotePrefix'] = addQuetValue == true;
        if (templateValue > 0) {
            initBundleBlock.params_map['templateCode'] = templateValue;
        }

        myJSBlock.pushLine('var fileTitle = ' + titleValue + ';');
        myJSBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
        myJSBlock.pushChild(initBundleBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});');
        var inreducer = this.isInReducer(preNodes_arr);
        if (inreducer) {
            myJSBlock.pushLine('setTimeout(() => {', 1);
        }
        if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
            myJSBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
        }
        var dataVarName = this.id + '_ret';
        var errVarName = 'error_' + this.id;
        myJSBlock.pushLine("gStartExcelExport(" + bundleVarName + "," + this.bluePrint.id + "_msg, (state, " + dataVarName + ", " + errVarName + ")=>{", 1);
        var fetchEndBlock = new FormatFileBlock('fetchend');
        myJSBlock.pushChild(fetchEndBlock);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine('});;');
        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
        }
        else {
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        }
        if (inreducer) {
            myJSBlock.subNextIndent();
            myJSBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        //fetchEndBlock.pushLine('OpenReport(' + dataVarName + ',' + singleQuotesStr(report.name) + ');');

        var flowLinks_arr = this.bluePrint.linkPool.getLinksBySocket(this.outFlowSocket);
        if (flowLinks_arr.length > 0) {
            if (this.compileFlowNode(flowLinks_arr[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
        }
        return selfCompileRet;
    }
}

class JSNode_GetFormJsonData extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETFORMJSONDATA, 'FormJSONData', false, nodeJson);
        autoBind(this);
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outputScokets_arr.forEach(socket => {
                    if (socket.name == 'json') {
                        this.jsonSocket = socket;
                    }
                    else if (socket.name == 'count') {
                        this.countSocket = socket;
                    }
                });
            }
            if (this.inputScokets_arr.length > 0) {
                this.inputScokets_arr.forEach(socket => {
                    if (socket.name == 'form') {
                        this.formSocket = socket;
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
        if (this.jsonSocket == null) {
            this.jsonSocket = this.addSocket(new NodeSocket('json', this, false));
        }
        if (this.countSocket == null) {
            this.countSocket = this.addSocket(new NodeSocket('count', this, false));
        }

        this.formSocket.inputable = false;
        this.formSocket.type = SocketType_CtlKernel;
        this.formSocket.kernelType = M_FormKernel_Type;
        this.formSocket.label = 'form';

        this.jsonSocket.label = 'json';
        this.countSocket.label = 'count';

        this.jsonSocket.type = ValueType.Object;
        this.countSocket.type = ValueType.Int;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        var compileRet = helper.getCompileRetCache(this);
        //var socketValue = compileRet.getSocketOut(targetSocket).strContent;
        result.pushVariable(this.id + '_data', targetSocket);
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

        var rltVarName = this.id + '_data';
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var formStateVarName = selectedKernel.id + '_state';
        var formPathVarName = selectedKernel.id + '_path';
        if (traversalFromNode == null) {
            helper.addUseForm(selectedKernel, EFormRowSource.None);
        }
        else {
            traversalFromNode.addUseControlPath(selectedKernel);
            formStateVarName = traversalFromNode.id + '_' + selectedKernel.id + '_state';
            formPathVarName = traversalFromNode.id + '_' + selectedKernel.id + '_path';
        }
        if (helper.projectCompiler) {
            var formMidData = helper.projectCompiler.getMidData(selectedKernel.id);
            formMidData.useFormJSON = true;
        }
        myJSBlock.pushLine(makeLine_DeclareVar(rltVarName, makeStr_callFun('GenFormJSONData', [formStateVarName, selectedKernel.id + '_' + AttrNames.Function.GetJSONRowItem, formPathVarName, selectedKernel.id + '_jsonHeaders']), false));

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.jsonSocket, rltVarName + '.json');
        selfCompileRet.setSocketOut(this.countSocket, rltVarName + '.count');
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_Form_SetStatValue extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_FORM_SETSTATVALUE, 'SetStatValue', false, nodeJson);
        autoBind(this);
        if (nodeJson) {
            this.callFreshSocket = this.inputScokets_arr.find(s => { return s.name == 'callfresh'; });
        }
        if (this.callFreshSocket == null) {
            this.callFreshSocket = this.addSocket(new NodeSocket('callfresh', this, true));
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        this.inputScokets_arr.forEach(s => {
            s.inputable = false;
        });
        this.insocketInitVal = {
            type: ValueType.String,
            inputable: false,
        };
        this.callFreshSocket.type = ValueType.Boolean;
        this.callFreshSocket.label = 'call刷新';
        this.callFreshSocket.hideIcon = false;
        this.callFreshSocket.inputable = true;
        if (this.callFreshSocket.defval == null) {
            this.callFreshSocket.defval = true;
        }
    }

    preRemoveSocket(socket) {
        return socket != this.callFreshSocket;
    }

    statTextChanged(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-sid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('statkey', ev.target.value.trim());
        theSocket.fireEvent('changed', 10);
    }

    customSocketRender(socket) {
        if (socket.isIn == false || socket == this.callFreshSocket) {
            return null;
        }
        var statKey = socket.getExtra('statkey');
        if (IsEmptyString(statKey)) {
            statKey = '';
        }
        return (<span className='d-flex align-items-center'>
            <input type='text' className='socketInputer' d-sid={socket.id} value={statKey} onChange={this.statTextChanged} />
        </span>);
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
        var project = this.bluePrint.master.project;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var ctlKernel = this.bluePrint.ctlKernel;

        var belongFormControl = !ctlKernel ? null : ctlKernel.searchParentKernel(M_FormKernel_Type, true);
        if (this.checkCompileFlag(!belongFormControl || !belongFormControl.isGridForm(), '必须在Grid表格内才能使用', helper)) {
            return false;
        }
        if (this.checkCompileFlag(!belongFormControl.isKernelInRow(ctlKernel), '必须在Grid表格行内控件才能使用', helper)) {
            return false;
        }

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var formHeaders_arr = belongFormControl.getRowLabeledControls().map(ctl => {
            return ctl.getAttribute(AttrNames.TextField);
        });
        for (var si = 0; si < this.inputScokets_arr.length; ++si) {
            var socket = this.inputScokets_arr[si];
            if (socket == this.callFreshSocket) {
                continue;
            }
            var statkey = socket.getExtra('statkey');
            if (this.checkCompileFlag(IsEmptyString(statkey) || formHeaders_arr.indexOf(statkey) == -1, statkey + '不是有效的统计列', helper)) {
                return false;
            }
            var socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, false);
            if (socketComRet.err) {
                return false;
            }
            myJSBlock.pushLine(belongFormControl.id + '_' + VarNames.NowRecord + '.' + statkey + '=' + socketComRet.value + ';');
        }
        var inreducer = this.isInReducer(preNodes_arr);

        var freshSocketComRet = this.getSocketCompileValue(helper, this.callFreshSocket, usePreNodes_arr, belongBlock, true);
        if (freshSocketComRet.err) {
            return false;
        }
        if (freshSocketComRet.value !== false) {
            if(freshSocketComRet.value !== true){
                myJSBlock.pushLine('if(' + freshSocketComRet.value + '){', 1);
            }
            myJSBlock.pushLine(makeStr_callFun(makeFName_reCalFormStat(belongFormControl), [inreducer ? VarNames.State : 'null', belongFormControl.id + '_path']));
            if(freshSocketComRet.value !== true){
                myJSBlock.subNextIndent();
                myJSBlock.pushLine('}');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_GetObjectProp extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_GETOBJECTPROP, 'Get对象属性', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.objSocket = this.inputScokets_arr[0];
            }
        }
        if (this.objSocket == null) {
            this.objSocket = this.addSocket(new NodeSocket('obj', this, true));
        }
        this.objSocket.label = '对象';
        this.objSocket.type = ValueType.Object;
        this.outsocketInitVal = {
            type: ValueType.Object,
        };
    }

    outNameTextChanged(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-sid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('prop', ev.target.value.trim());
        theSocket.fireEvent('changed', 10);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var prop = socket.getExtra('prop');
        if (prop == null) {
            prop = '';
        }
        return (<span className='d-flex align-items-center'>
            <input type='text' className='socketInputer' d-sid={socket.id} value={prop} onChange={this.outNameTextChanged} />
        </span>);
    }

    genOutSocket() {
        var nameI = this.outputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('out' + nameI, false) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('out' + nameI, this, false, this.outsocketInitVal);
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

        var socketComRet = this.getSocketCompileValue(helper, this.objSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;
        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        this.outputScokets_arr.forEach(s => {
            var prop = s.getExtra('prop');
            selfCompileRet.setSocketOut(s, socketValue + (SpecialCharReg.test(prop) ? midbracketStr(singleQuotesStr(prop)) : '.' + prop));
        });
        return selfCompileRet;
    }
}

class JSNode_Object_Clone extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_OBJECT_CLONE, '克隆对象', false, nodeJson);
        autoBind(this);
        if (nodeJson) {
            this.objSocket = this.inputScokets_arr.find(s => { return s.name == 'obj'; });
            this.outSocket = this.outputScokets_arr.find(s => { return s.name == 'out'; });
        }
        if (this.objSocket == null) {
            this.objSocket = this.addSocket(new NodeSocket('obj', this, true));
        }
        if (this.outSocket == null) {
            this.outSocket = this.addSocket(new NodeSocket('out', this, false));
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        this.objSocket.type = ValueType.Object;
        this.objSocket.label = '目标对象';
        this.objSocket.inputable = false;

        this.outSocket.type = ValueType.Object;
        this.outSocket.label = '新对象';
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

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var socketComRet = this.getSocketCompileValue(helper, this.objSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        myJSBlock.pushLine('var ' + this.id + '=Object.assign({},' + socketComRet.value + ');');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.outSocket, this.id);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNode_SetObjectProp extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_SETOBJECTPROP, 'Set对象属性', false, nodeJson);
        autoBind(this);
        if (nodeJson) {
            this.objSocket = this.inputScokets_arr.find(s => { return s.name == 'obj'; });
            this.propNameSocket = this.inputScokets_arr.find(s => { return s.name == 'propName'; });
            this.propValueSocket = this.inputScokets_arr.find(s => { return s.name == 'propValue'; });
        }
        if (this.objSocket == null) {
            this.objSocket = this.addSocket(new NodeSocket('obj', this, true));
        }
        if (this.propNameSocket == null) {
            this.propNameSocket = this.addSocket(new NodeSocket('propName', this, true));
        }
        if (this.propValueSocket == null) {
            this.propValueSocket = this.addSocket(new NodeSocket('propValue', this, true));
        }
        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }
        this.objSocket.type = ValueType.Object;
        this.objSocket.label = '对象';
        this.objSocket.inputable = false;
        this.propNameSocket.type = ValueType.Object;
        this.propNameSocket.label = '属性名';
        this.propNameSocket.inputable = true;
        this.propValueSocket.type = ValueType.Object;
        this.propValueSocket.label = '值';
        this.propValueSocket.inputable = true;
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

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var socketComRet = this.getSocketCompileValue(helper, this.objSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var objValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.propNameSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var nameValue = socketComRet.value;
        socketComRet = this.getSocketCompileValue(helper, this.propValueSocket, usePreNodes_arr, belongBlock, true);
        if (socketComRet.err) {
            return false;
        }
        var valueValue = socketComRet.value;
        myJSBlock.pushLine(objValue + '[' + nameValue + ']=' + valueValue + ';');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);
        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }

        return selfCompileRet;
    }
}

class JSNODE_LongServerProcess extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_LONGSERVERPROCESS, '超长后台操作', false, nodeJson);
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
            this.dataSocket = this.outputScokets_arr.find(x => {
                return x.name == 'data';
            });
        }
        if (this.dataSocket == null) {
            this.dataSocket = new NodeSocket('data', this, false);
            this.addSocket(this.dataSocket);
        }

        this.dataSocket.label = 'rlt';
        this.dataSocket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        if (this.checkCompileFlag(blockInServer, '此节点的此法在server流执行', helper)) {
            return false;
        }

        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        var myServerBlock = new FormatFileBlock('serverblock');

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;

        var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
        theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
        helper.appendOutputItem(serverSideFun);

        serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
        postCheckBlock.pushChild(postVarinitBlock);
        serverSideFun.bundleCheckBlock = postCheckBlock;
        serverSideFun.postVarinitBlock = postVarinitBlock;
        theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
        serverFun = serverSideFun;
        serverFunBodyBlock = serverSideFun.bodyBlock;

        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
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

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;

        var keyVarName = this.id + '_key';
        myServerBlock.pushLine('var ' + dataVarName + '={};');
        myServerBlock.pushLine('var ' + keyVarName + '=serverhelper.guid2();');
        myServerBlock.pushLine('setTimeout(() => {', 1);
        myServerBlock.pushLine('co(function* () {');
        var funBlock = new FormatFileBlock('settimeout');
        myServerBlock.pushChild(funBlock);
        myServerBlock.pushLine('return ' + dataVarName + ';');
        myServerBlock.pushLine('}).then(rltData=>{serverhelper.SaveLongProcessResult(' + keyVarName + ', rltData);});');
        myServerBlock.subNextIndent();
        myServerBlock.pushLine('}, 500);');
        myServerBlock.pushLine('return ' + keyVarName + ';');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);

        helper.compilingFun.hadServerFetch = true;
        this.hadServerFetch = true;
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
        myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, this.id + '_key', '_err'), 1);
        myClientBlock.pushLine('gWaitLongProcess(' + this.bluePrint.id + '_msg' + ',' + this.id + '_key, (state,' + dataVarName + ',' + errVarName + ')=>{', 1);
        fetchEndBlock = new FormatFileBlock('fetchend');
        if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
            fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
        }
        else {
            fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
        }
        myClientBlock.pushChild(fetchEndBlock);
        myClientBlock.subNextIndent();
        myClientBlock.pushLine('});');
        myClientBlock.subNextIndent();
        myClientBlock.pushLine('},false)));');
        myClientBlock.subNextIndent();
        if (inreducer) {
            myClientBlock.pushLine('}, 50);');
        }

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);

        selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
        selfCompileRet.setSocketOut(this.dataSocket, dataVarName);
        fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
        if (clientFlow_links.length > 0) {
            if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                return false;
            }
        }
        if (serverFlow_links.length > 0) {
            if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, funBlock) == false) {
                return false;
            }
        }
        return selfCompileRet;
    }
}

class JSNode_ImportExcel extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_IMPORTEXCEL, '导入Excel', false, nodeJson);
        this.genCloseure = true;
        autoBind(this);

        if (nodeJson) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'goodwork':
                        this.goodWorkSocket = socket;
                        break;
                    case 'records_arr':
                        this.recordSocket = socket;
                        break;
                    case 'headers_arr':
                        this.headerSocket = socket;
                        break;
                }
            });

            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'title':
                        this.titleSocket = socket;
                        break;
                }
            });
        }
        if (this.titleSocket == null) {
            this.titleSocket = this.addSocket(new NodeSocket('title', this, true));
        }
        this.titleSocket.label = '标题';
        this.titleSocket.type = ValueType.String;

        if (this.goodWorkSocket == null) {
            this.goodWorkSocket = this.addSocket(new NodeSocket('goodwork', this, false));
        }
        if (this.recordSocket == null) {
            this.recordSocket = this.addSocket(new NodeSocket('records_arr', this, false));
        }
        if (this.headerSocket == null) {
            this.headerSocket = this.addSocket(new NodeSocket('headers_arr', this, false));
        }

        this.goodWorkSocket.label = 'goodWork';
        this.goodWorkSocket.type = ValueType.Boolean;
        this.recordSocket.label = 'records';
        this.recordSocket.type = ValueType.Array;
        this.headerSocket.label = 'headers';
        this.headerSocket.type = ValueType.Array;

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
        var nodeThis = this;
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '不可在服务端使用', helper)) {
            return false;
        }
        if (this.checkCompileFlag(blockInServer, '不可在服务端调用', helper)) {
            return false;
        }
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket;
        var socketComRet = this.getSocketCompileValue(helper, this.titleSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var titleValue = socketComRet.value;

        // makeClient
        this.hadServerFetch = false;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var randIDVarName = this.id + '_rand';
        myJSBlock.pushLine(makeLine_DeclareVar(randIDVarName, 'Math.round(Math.random() * 10000)', false));
        var callBackName = this.id + '_callback';
        var callBackBlk = new FormatFileBlock('callback');
        myJSBlock.pushLine('var ' + callBackName + ' = (' + [this.id + 'goodwork', this.id + 'records', this.id + 'headers'].join(',') + ')=>{', 1);
        myJSBlock.pushChild(callBackBlk);
        myJSBlock.subNextIndent();
        myJSBlock.pushLine("};");
        var importerVarName = this.id + '_importer';
        myJSBlock.pushLine(makeLine_DeclareVar(importerVarName, "<VisibleERPC_ExcelImporter key='excelimport' id={'excelimport_' + " + randIDVarName + "} callback={" + callBackName + "} title={" + titleValue + "} ></VisibleERPC_ExcelImporter>", false));
        myJSBlock.pushLine("addFixedItem(" + importerVarName + ");");

        callBackBlk.pushLine('removeFixedItem(' + importerVarName + ');');
        callBackBlk.pushLine('if(!' + this.id + 'goodwork' + '){return;}');

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        selfCompileRet.setSocketOut(this.goodWorkSocket, this.id + 'goodwork');
        selfCompileRet.setSocketOut(this.recordSocket, this.id + 'records');
        selfCompileRet.setSocketOut(this.headerSocket, this.id + 'headers');
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, callBackBlk) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_HashDataSourceRow extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_HASHDATASOURCE_ROW, '散列数据源数据', false, nodeJson);
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
            this.dsSocket = this.inputScokets_arr.find(s=>{return s.name=='ds';});
            this.dataSocket = this.inputScokets_arr.find(s=>{return s.name=='data';});
        }

        if (this.dsSocket == null) {
            this.dsSocket = new NodeSocket('ds', this, true);
            this.addSocket(this.dsSocket);
        }

        var project = createHelper ? createHelper.project : this.bluePrint.master.project;
        
        this.dsSocket.set({
            inputable: true,
            hideIcon: true,
            inputDDC_setting: {
                textAttrName: 'name',
                valueAttrName: 'code',
                options_arr: project.dataMaster.getAllEntities,
            },
            label: '数据源',
        });

        if (this.dataSocket == null) {
            this.dataSocket = new NodeSocket('data', this, true);
            this.addSocket(this.dataSocket);
        }
        this.dataSocket.inputable = false;
        this.dataSocket.label = '数据对象';
    }

    mouseDownOutSocketHand(ev) {
        var socketid = getAttributeByNode(ev.target, 'd-sid', true, 10);
        if (socketid == null) {
            return;
        }
        var theSocket = this.sockets_map[socketid];
        var bornPos = theSocket.currentComponent.getCenterPos();
        var newNode = new FlowNode_ColumnVar({
            keySocketID: socketid,
            newborn: true,
            left: bornPos.x,
            top: bornPos.y,
        }, this.parent);
    }

    columnDDCChanged(value, ddc) {
        var theSocket = ddc.props.socket;
        if (theSocket == null)
            return;
        theSocket.setExtra('colName', value);
        theSocket.fireEvent('changed', 10);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var useEntity = this.getUseEntity();
        var options_arr = useEntity.columns.map(x=>{return x.name;});
        var nowVal = socket.getExtra('colName');
        return (<span d-sid={socket.id} className='d-flex align-items-center'>
                    <DropDownControl socket={socket} itemChanged={this.columnDDCChanged} btnclass='btn-dark' options_arr={options_arr} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} />
                    <button onMouseDown={this.mouseDownOutSocketHand} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
                </span>);
    }

    getUseEntity(){
        return this.bluePrint.master.project.dataMaster.getDataSourceByCode(this.dsSocket.defval);
    }

    requestSaveAttrs(jsonProf) {
        var rlt = super.requestSaveAttrs();
        var useEntity = this.getUseEntity();
        if (useEntity != null) {
            jsonProf.useEntity(useEntity);
        }
        return rlt;
    }

    genOutSocket() {
        var useEntity = this.getUseEntity();
        if (useEntity == null) {
            return null;
        }
        var canUseColumns_arr = useEntity.columns.map(x=>{return x.name;});
        if (canUseColumns_arr == null) {
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
        var emptyCol = canUseColumns_arr.find(colName => {
            return hadColumns_arr.indexOf(colName) == -1
        });
        if (emptyCol == null) {
            return null;
        }
        var newSocket = new NodeSocket(this.getUseableOutSocketName('col'), this, false, { type: ValueType.String });
        newSocket.setExtra('colName', emptyCol);
        return newSocket;
    }

    getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result) {
        result.pushVariable(this.id + '_data', targetSocket);
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var useEntity = this.getUseEntity();
        if (this.checkCompileFlag(useEntity == null, '请选择数据源', helper)) {
            return false;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var canUseColumns_arr = useEntity.columns.map(x=>{return x.name;});

        var nowRowVarName = this.id + '_data';
        var inSocketComRet = this.getSocketCompileValue(helper, this.dataSocket, usePreNodes_arr, belongBlock, true, false);
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
            var columnItem = canUseColumns_arr.find(x => { return x == colName; });
            if (columnItem == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                '第' + (si + 1) + '个输出接口列名无效！']);
                return false;
            }
            selfCompileRet.setSocketOut(outSocket, nowRowVarName + '.' + colName);
        }
        if (this.compileOutFlow(helper, usePreNodes_arr, myJSBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }
}

class JSNode_Xml_ExtractColumn extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_XML_EXTRACTCOLUMN, '抽取XML列', false, nodeJson);
        autoBind(this);

        if (this.inputScokets_arr.length > 0) {
            this.xmlStrSocket = this.inputScokets_arr.find(s=>{return s.name=='xmlstr';});
            this.indexSocket = this.inputScokets_arr.find(s=>{return s.name=='index';});
        }

        if (this.outputScokets_arr.length > 0) {
            this.arraySocket = this.outputScokets_arr[0];
        }

        if (this.xmlStrSocket == null) {
            this.xmlStrSocket = new NodeSocket('xmlstr', this, true);
            this.addSocket(this.xmlStrSocket);
        }
        if (this.indexSocket == null) {
            this.indexSocket = new NodeSocket('index', this, true);
            this.addSocket(this.indexSocket);
        }
        if (this.arraySocket == null) {
            this.arraySocket = new NodeSocket('oarr', this, false);
            this.addSocket(this.arraySocket);
        }
        this.xmlStrSocket.inputable = false;
        this.xmlStrSocket.label = 'xml';
        this.xmlStrSocket.type = ValueType.String;
        this.indexSocket.inputable = true;
        this.indexSocket.label = 'col';
        this.indexSocket.type = ValueType.Int;
        this.arraySocket.label = 'array';
        this.arraySocket.type = ValueType.Array;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var inSocketComRet = this.getSocketCompileValue(helper, this.xmlStrSocket, usePreNodes_arr, belongBlock, true, false);
        if (inSocketComRet.err) {
            return false;
        }
        var xmlStr = inSocketComRet.value;
        inSocketComRet = this.getSocketCompileValue(helper, this.indexSocket, usePreNodes_arr, belongBlock, true, false);
        if (inSocketComRet.err) {
            return false;
        }
        var col = inSocketComRet.value;

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.arraySocket, "ERPXMLToolKit.extractColumn(" + xmlStr + "," + col + ")");
        return selfCompileRet;
    }
}


class JSNode_Debug_Log extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DEBUG_LOG, 'Log', false, nodeJson);
        autoBind(this);

        if (this.inputScokets_arr.length > 0) {
            this.inScoket = this.inputScokets_arr[0];
        }

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }
        if (this.outFlowSocket == null) {
            this.outFlowSocket = new NodeFlowSocket('flow_o', this, false);
            this.addSocket(this.outFlowSocket);
        }

        if (this.inScoket == null) {
            this.inScoket = new NodeSocket('value', this, true);
            this.addSocket(this.inScoket);
        }
        this.inScoket.inputable = true;
        this.inScoket.label = 'value';
        this.inScoket.type = ValueType.Object;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var inSocketComRet = this.getSocketCompileValue(helper, this.inScoket, usePreNodes_arr, belongBlock, true, false);
        if (inSocketComRet.err) {
            return false;
        }

        this.hadServerFetch = false;
        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);
        myJSBlock.pushLine("console.log(" + inSocketComRet.value + ");");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
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
        super(initData, parentNode, createHelper, JSNODE_STRING_INDEXOF, 'IndexOf', false, nodeJson);
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
        }
        if (this.valueSocket == null) {
            this.valueSocket = new NodeSocket('invalue', this, true);
            this.addSocket(this.valueSocket);
        }
        if (this.fromSocket == null) {
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
        var theScope = belongBlock && belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var theSocket = this.inSocket;
        var socketValue = null;
        var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, false);
        if (socketComRet.err) {
            return false;
        }
        var socketValue = socketComRet.value;


        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, (blockInServer ? 'serverhelper.' : '') + 'IsEmptyString(' + socketValue + ')');
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
        var theScope = belongBlock && belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
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
        selfCompileRet.setSocketOut(this.outSocket, (blockInServer ? 'serverhelper.' : '') + 'IsEmptyArray(' + socketValue + ')');
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class JSNode_CreateStyleObject extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CREATESTYLEOBJECT, '创建Style对象', false, nodeJson);
        autoBind(this);

        this.inputScokets_arr.forEach(socket=>{
            socket.type = ValueType.String;
            socket.inputable = true;

            if(socket.name == 'base'){
                this.baseSocket = socket;
            }
        });

        if(this.outputScokets_arr.length > 0){
            this.outSocket = this.outputScokets_arr[0];
        }
        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('out', this, false));
        }
        this.outSocket.type = ValueType.Object;
        if(this.baseSocket == null){
            this.baseSocket = this.addSocket(new NodeSocket('base', this, true));
        }
        this.baseSocket.label = 'base';
        this.baseSocket.type = ValueType.Object;
    }
    

    nameTextChanged(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-sid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('name', ev.target.value.trim());
        theSocket.fireEvent('changed', 10);
    }

    customSocketRender(socket) {
        if (socket.isIn == false || socket == this.baseSocket) {
            return null;
        }
        var name = socket.getExtra('name');
        if (name == null) {
            name = 'unname';
        }
        return (<span className='d-flex align-items-center'>
            <input type='text' className='socketInputer' d-sid={socket.id} value={name} onChange={this.nameTextChanged} />
        </span>);
    }

    preRemoveSocket(socket) {
        return socket != this.baseSocket;
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, {type:ValueType.String, inputable:true});
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

        var outStr = '{';
        var socketComRet = this.getSocketCompileValue(helper, this.baseSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var baseValue = socketComRet.value;
        if(baseValue){
            outStr = 'Object.assign({},' + baseValue + ',{';
        }

        for(var si in this.inputScokets_arr){
            var socket = this.inputScokets_arr[si];
            if(socket == this.baseSocket){
                continue;
            }
            socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true, true);
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            var name = socket.getExtra('name');
            if (this.checkCompileFlag(name == null || name.length == 0, '需要给每个style都设置名称', helper)) {
                return false;
            }
            if(socketValue == null){
                socketValue = "''";
            }
            outStr +=  singleQuotesStr(name) + ":" + socketValue + ',';
        }
        outStr += '}';
        if(baseValue){
            outStr += ')';
        }

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.outSocket, outStr);
        return selfCompileRet;
    }
}

class JSNode_CreateClassObject extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_CREATECLASSOBJECT, '创建Class对象', false, nodeJson);
        autoBind(this);

        this.inputScokets_arr.forEach(socket=>{
            socket.type = ValueType.String;
            socket.inputable = true;

            if(socket.name == 'base'){
                this.baseSocket = socket;
            }
        });

        if(this.outputScokets_arr.length > 0){
            this.outSocket = this.outputScokets_arr[0];
        }
        if(this.outSocket == null){
            this.outSocket = this.addSocket(new NodeSocket('out', this, false));
        }
        this.outSocket.type = ValueType.Object;
        if(this.baseSocket == null){
            this.baseSocket = this.addSocket(new NodeSocket('base', this, true));
        }
        this.baseSocket.label = 'base';
        this.baseSocket.type = ValueType.Object;
        this.baseSocket.inputable = false;
    }
    
    groupTextChanged(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-sid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('gp', ev.target.value.trim());
        theSocket.fireEvent('changed', 10);
    }

    optChangedHandler(value, dropdown){
        var theSocketID = getAttributeByNode(dropdown.rootDivRef.current, 'd-socketid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('opt', value);
        theSocket.fireEvent('changed', 10);
    }

    customSocketRender(socket) {
        if (socket.isIn == false || socket == this.baseSocket) {
            return null;
        }
        var opt = socket.getExtra('opt');
        if (opt == null) {
            opt = 'set';
        }
        var group = socket.getExtra('gp');
        if (group == null) {
            group = '';
        }
        return (<span className='d-flex align-items-center'>
            <DropDownControl itemChanged={this.optChangedHandler} btnclass='btn-dark' options_arr={['set','unset']} rootclass='flex-grow-0 flex-shrink-0' value={opt} />
            <input type='text' className='socketInputer border-info' d-sid={socket.id} value={group} onChange={this.groupTextChanged} />
        </span>);
    }

    preRemoveSocket(socket) {
        return socket != this.baseSocket;
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, {type:ValueType.String, inputable:true});
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

        var outStr = '';
        var socketComRet = this.getSocketCompileValue(helper, this.baseSocket, usePreNodes_arr, belongBlock, true, true);
        if (socketComRet.err) {
            return false;
        }
        var baseValue = socketComRet.value;
        outStr = 'GenClassObject(' + (baseValue ? baseValue : 'null') + ',[';

        var valueCount = 0;
        for(var si in this.inputScokets_arr){
            var socket = this.inputScokets_arr[si];
            if(socket == this.baseSocket){
                continue;
            }
            var opt = socket.getExtra('opt');
            var gp = socket.getExtra('gp');
            if(opt == null){
                opt = 'set';
            }
            if(gp == null){
                gp = 'null';
            }
            else{
                gp = singleQuotesStr(gp);
            }
            socketComRet = this.getSocketCompileValue(helper, socket, usePreNodes_arr, belongBlock, true, opt != 'set');
            if (socketComRet.err) {
                return false;
            }
            var socketValue = socketComRet.value;
            outStr += (valueCount++ > 0 ? ',' : '') + '{opt:' + singleQuotesStr(opt) + ',gp:' + gp + ',val:' + socketValue + '}';
        }
        outStr += '])';

        var selfCompileRet = new CompileResult(this);
        helper.setCompileRetCache(this, selfCompileRet);
        selfCompileRet.setSocketOut(this.outSocket, outStr);
        return selfCompileRet;
    }
}

class JSNode_String_Split extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_STRING_SPLIT, 'Split', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
            }
            if (this.inputScokets_arr.length > 0) {
                this.varSocket = this.inputScokets_arr[0];
                this.charSocket = this.inputScokets_arr[1];
            }
        }
        if (this.varSocket == null) {
            this.varSocket = new NodeSocket('invar', this, true);
            this.addSocket(this.varSocket);
            this.charSocket = new NodeSocket('char', this, true);
            this.addSocket(this.charSocket);
        }
        this.varSocket.label = 'var';
        this.charSocket.label = '分隔符';
        this.varSocket.type = ValueType.String;
        this.varSocket.inputable = false;
        this.charSocket.inputable = true;


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

        var finalStr = socketsValues_arr[0] + '.split(' + socketsValues_arr[1] + ')'

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
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
JSNodeClassMap[JSNODE_CUSOBJECT_MODIFY] = {
    modelClass: JSNode_CusObject_Modify,
    comClass: C_JSNode_CusObject_Modify,
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
    comClass: C_JSNode_Array_For,
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
JSNodeClassMap[JSNODE_CHART_NEWDATASET] = {
    modelClass: JSNode_Chart_NewDataset,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CHART_GENCOLOR] = {
    modelClass: JSNode_Chart_GenColor,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CHART_FRESH] = {
    modelClass: JSNode_Chart_Fresh,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_OPENREPORT] = {
    modelClass: JSNode_OpenReport,
    comClass: C_JSNode_OpenReport,
};
JSNodeClassMap[JSNODE_EXPORTEXCEL] = {
    modelClass: JSNode_ExportExcel,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_GETFORMJSONDATA] = {
    modelClass: JSNode_GetFormJsonData,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_FORM_SETSTATVALUE] = {
    modelClass: JSNode_Form_SetStatValue,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_GETOBJECTPROP] = {
    modelClass: JSNode_GetObjectProp,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_OBJECT_CLONE] = {
    modelClass: JSNode_Object_Clone,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_SETOBJECTPROP] = {
    modelClass: JSNode_SetObjectProp,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_LONGSERVERPROCESS] = {
    modelClass: JSNODE_LongServerProcess,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_IMPORTEXCEL] = {
    modelClass: JSNode_ImportExcel,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_HASHDATASOURCE_ROW] = {
    modelClass: JSNode_HashDataSourceRow,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_XML_EXTRACTCOLUMN] = {
    modelClass: JSNode_Xml_ExtractColumn,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_DEBUG_LOG] = {
    modelClass: JSNode_Debug_Log,
    comClass: C_Node_SimpleNode,
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
JSNodeClassMap[JSNODE_CREATESTYLEOBJECT] = {
    modelClass: JSNode_CreateStyleObject,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_CREATECLASSOBJECT] = {
    modelClass: JSNode_CreateClassObject,
    comClass: C_Node_SimpleNode,
};
JSNodeClassMap[JSNODE_STRING_SPLIT] = {
    modelClass: JSNode_String_Split,
    comClass: C_Node_SimpleNode,
};