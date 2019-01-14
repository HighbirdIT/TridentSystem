const SQLNODE_DBENTITY = 'dbEntity';
const SQLNODE_SELECT = 'select';
const SQLNODE_VAR_GET = 'var_get';
const SQLNODE_VAR_SET = 'var_set';
const SQLNODE_NOPERAND = 'noperand';
const SQLNODE_COMPARE = 'compare';
const SQLNODE_COLUMN = 'column';
const SQLNODE_XJOIN = 'xjion';
const SQLNODE_CONSTVALUE = 'constvalue';
const SQLNODE_DBENTITY_COLUMNSELECTOR = 'dbentity_columnselector';
const SQLNODE_RET_CONDITION = 'ret_condition';
const SQLNODE_RET_COLUMNS = 'ret_columns';
const SQLNODE_RET_ORDER = 'ret_order';
const SQLNODE_RET_GROUP = 'ret_group';
const SQLNODE_RET_HAVING = 'ret_having';
const SQLNODE_ROWNUMBER = 'rownumber';
const SQLNODE_ISNULL = 'isnullfun';
const SQLNODE_ISNULLOPERATOR = 'isnulloperator';
const SQLNODE_BETWEEN = 'between';
const SQLNODE_CAST = 'cast';
const SQLNODE_LOGICAL_OPERATOR = 'logical_operator';
const SQLNODE_GETDATE = 'getdate';
const SQLNODE_LOGICAL_NOT = 'logical_not';
const SQLNODE_IN_OPERATOR = 'in_operator';
const SQLNODE_LIKE = 'like';
const SQLNODE_EXISTS = 'exists';
const SQLDEF_VAR = 'def_variable';
const SQLNODE_TOSTRING = 'tostring';
const SQLNODE_CASE_WHEN = 'case_when';
const SQLNODE_CW_WHEN = 'cw_when';
const SQLNODE_CW_ELSE = 'cw_else';
const SQLDEF_UNION = 'union';
const SQLNODE_AGGREGATE = 'aggregate';
var SqlNodeClassMap = {};
// CONSTSQLNODES_ARR output是常量的节点类型
const SQL_OutSimpleValueNode_arr = [SQLNODE_COLUMN, SQLNODE_VAR_GET, SQLNODE_CONSTVALUE, SQLNODE_GETDATE, SQLNODE_CAST,SQLNODE_AGGREGATE];


class NodeCreationHelper extends EventEmitter {
    constructor() {
        super();
        EnhanceEventEmiter(this);
        this.orginID_map = {};
        this.newID_map = {};
        this.idTracer = {};
    }

    saveJsonMap(jsonData, newNode) {
        if (jsonData && jsonData.id) {
            if (this.getObjFromID(jsonData.id) != null) {
                console.warn(jsonData.id + '被重复saveJsonMap');
            }
            if (jsonData.id != newNode.id) {
                if (this.getObjFromID(newNode.id) != null) {
                    console.warn(jsonData.id + '被重复saveJsonMap');
                }
                this.idTracer[jsonData.id] = this.idTracer[newNode.id]
            }
            this.orginID_map[jsonData.id] = newNode;
        }

        this.newID_map[newNode.id] = newNode;
    }

    getObjFromID(id) {
        var rlt = this.orginID_map[id];
        if (rlt == null) {
            rlt = this.newID_map[id];
        }
        return rlt;
    }
}

class SqlNode_BluePrint extends EventEmitter {
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
            assginObjByProperties(this, bluePrintJson, ['type', 'code', 'name', 'retNodeId', 'editorLeft', 'editorTop']);
            if (!IsEmptyArray(bluePrintJson.variables_arr)) {
                bluePrintJson.variables_arr.forEach(varJson => {
                    var newVar = new SqlDef_Variable({}, this, createHelper, varJson);
                });
            }
            var newChildNodes_arr = this.genNodesByJsonArr(this, bluePrintJson.nodes_arr, createHelper);
            this.finalSelectNode = newChildNodes_arr.find(node => {
                return node.id == bluePrintJson.retNodeId;
            });
            this.linkPool.restorFromJson(bluePrintJson.links_arr, createHelper);
        }
        this.id = this.code;

        /*
        this.nodes_arr = this.nodes_arr.map((nodeData,i)=>{
            if(nodeData.type == SQLNODE_DBENTITY){
                return new SqlNode_DBEntity(nodeData, self, createHelper);
            }
            else{
                console.log('不支持的sql节点:' + nodeData.type);
                console.warn(nodeData);
            }
        });
        */
        if (this.finalSelectNode == null) {
            this.finalSelectNode = new SqlNode_Select({ title: '返回表' }, this, createHelper);
            this.finalSelectNode.removeSocket(this.finalSelectNode.outSocket);
        }
        this.finalSelectNode.isConstNode = true;
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
        if (node.type == SQLDEF_VAR) {
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
        var rlt = new SqlDef_Variable({ name: varName, valType: SqlVarType_Int }, this);
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
        var setting = SqlNodeClassMap[nodeJson.type];
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
            retNodeId: this.finalSelectNode.id,
            name: this.name,
            type: this.type,
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
        var ret = this.finalSelectNode.compile(compilHelper, []);
        if (ret == false) {
            return false;
        }
        var varDeclareString = '';
        for (var si in compilHelper.useVariables_arr) {
            varDeclareString += compilHelper.useVariables_arr[si].declareStr + ' ';
        }
        return {
            sql: ret.getSocketOut(this.finalSelectNode.outSocket).strContent,
            varDeclareStr: varDeclareString,
            vars_arr: compilHelper.useVariables_arr,
        };
    }

}


class SqlNode_Base extends EventEmitter {
    constructor(initData, parentNode, createHelper, type, label, isContainer, nodeJson) {
        super();
        this.bluePrint = parentNode.bluePrint;
        Object.assign(this, initData);
        EnhanceEventEmiter(this);
        var self = this;

        this.sockets_map = {};
        this.inputScokets_arr = [];
        this.outputScokets_arr = [];
        if (isContainer) {
            this.nodes_arr = [];
            this.isContainer = true;
        }

        if (nodeJson != null) {
            assginObjByProperties(this, nodeJson, ['id', 'left', 'top', 'title', 'extra', 'editorLeft', 'editorTop']);
            if (this.restorFromAttrs) {
                this.restorFromAttrs(nodeJson);
            }
            // createSocket
            if (!IsEmptyArray(nodeJson.inputScokets_arr)) {
                nodeJson.inputScokets_arr.forEach(socketJson => {
                    self.addSocket(CreateNodeSocketByJson(this, socketJson, createHelper));
                });
            }
            if (!IsEmptyArray(nodeJson.outputScokets_arr)) {
                nodeJson.outputScokets_arr.forEach(socketJson => {
                    self.addSocket(CreateNodeSocketByJson(this, socketJson, createHelper));
                });
            }
        }

        this.label = label;
        this.type = type;
        this.left = ReplaceIfNaN(this.left, 0);
        this.top = ReplaceIfNaN(this.top, 0);
        this.minInSocketCount = 0;
        this.minOutSocketCount = 0;

        this.hadFlow = false;
        this.processInputSockets = this.processInputSockets.bind(this);
        this.processOutSockets = this.processOutSockets.bind(this);
        this.frameButtons_arr = [];

        this.bluePrint.registerNode(this, parentNode);

        if (createHelper) {
            createHelper.saveJsonMap(nodeJson, this);
        }

        if (nodeJson) {
            this.bluePrint.genNodesByJsonArr(this, nodeJson.nodes_arr, createHelper);
        }
    }

    clickFrameButton(btnName) {
        console.log('clickFrameButton:' + btnName);
        switch (btnName) {
            case FrameButton_LineSocket:
                {
                    var links = this.bluePrint.linkPool.getLinksByNode(this, 'i');
                    links.forEach(link => {
                        link.straightOut(-150);
                    });
                }
                break;
            case FrameButton_ClearEmptySocket:
                {
                    var removeCount = 0;
                    for (var si = this.inputScokets_arr.length - 1; si >= this.minInSocketCount && this.inputScokets_arr.length > 0; --si) {
                        var socket = this.inputScokets_arr[si];
                        if (this.bluePrint.linkPool.getLinksBySocket(socket).length == 0) {
                            this.removeSocket(socket);
                            ++removeCount;
                        }
                    }
                    if (removeCount > 0) {
                        this.fireEvent(Event_SocketNumChanged);
                        this.fireMoved(10);
                    }
                }
                break;
            case 'fresh':
                {
                    if (this.currentComponent) {
                        this.currentComponent.reDraw();
                    }
                }
        }
        return false;
    }

    setTitle(newTitle) {
        var oldTitle = this.title;
        this.title = newTitle;
        this.fireChanged();

        if (this.cusTitleChanged) {
            this.cusTitleChanged(oldTitle, newTitle);
        }
    }

    addFrameButton(name, label) {
        this.frameButtons_arr.push({ name: name, label: label });
    }

    linkRemoved(link) {

    }

    linkAdded(link) {

    }

    preEditing(editor) {
        // call pre enter Editing
    }

    postEditing(editor) {
        // call leve eidting
    }

    isNeedMoveArrowBeforeSocket() {
        return this.headType == 'empty' && (this.inputScokets_arr.length == 0 || this.outputScokets_arr.length == 0);
    }

    outputIsSimpleValue() {
        return SQL_OutSimpleValueNode_arr.indexOf(this.type) != -1;
    }

    getRect() {
        if (this.currentFrameCom == null)
            return null;
        var frameRootDiv = this.currentFrameCom.rootDivRef.current;
        if (frameRootDiv == null)
            return null;
        var bcr = frameRootDiv.getBoundingClientRect();
        return {
            left: this.left,
            top: this.top,
            right: this.left + bcr.width,
            bottom: this.top + bcr.height,
            width: bcr.width,
            height: bcr.height,
        }
    }

    getNodeTitle() {
        return this.label + (this.title == null ? '' : ':' + this.title);
    }

    getScoketByName(name, isIn) {
        if (isIn == null)
            isIn = '*';
        var rlt = null;
        if (isIn != false) {
            rlt = this.inputScokets_arr.find(x => { return x.name == name });
        }

        if (rlt == null && isIn != true) {
            rlt = this.outputScokets_arr.find(x => { return x.name == name });
        }
        return rlt;
    }

    addSocket(socketObj) {
        this.sockets_map[socketObj.id] = socketObj;
        if (socketObj.isIn) {
            this.inputScokets_arr.push(socketObj);
        }
        else {
            this.outputScokets_arr.push(socketObj);
        }
    }

    removeSocket(socketObj) {
        if (socketObj.isIn) {
            removeElemFrommArray(this.inputScokets_arr, socketObj);
        }
        else {
            removeElemFrommArray(this.outputScokets_arr, socketObj);
        }
        this.sockets_map[socketObj.id] = null;
        this.bluePrint.linkPool.clearSocketLink(socketObj);
    }

    getSocketById(socketID) {
        return this.sockets_map[socketID];
    }

    setPos(newx, newy) {
        this.left = newx;
        this.top = newy;
        this.fireMoved();
    }

    fireMoved(delay) {
        this.fireEvent('moved', delay);
    }

    fireChanged(delay) {
        this.fireEvent('changed', delay);
    }

    getContext(finder, depth) {
        if (depth == null) {
            depth = 0;
        }
        finder.setTest(this.id);
        var inlinks = this.bluePrint.linkPool.getLinksByNode(this, 'i');
        for (var i in inlinks) {
            var tLink = inlinks[i];
            var outNode = tLink.outSocket.node;
            if (!finder.isTest(outNode.id)) {
                outNode.getContext(finder, depth + 1);
            }
        }
    }

    isInScoketDynamic() {
        return this.genInSocket != null;
    }

    isOutScoketDynamic() {
        return this.genOutSocket != null;
    }

    processInputSockets(isPlus) {
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genInSocket();
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else {
            if (this.inputScokets_arr.length > this.minInSocketCount) {
                var needRemoveSocket = this.inputScokets_arr[this.inputScokets_arr.length - 1];
                this.removeSocket(needRemoveSocket);
                this.fireEvent(Event_SocketNumChanged);
                retSocket = needRemoveSocket;
            }
        }
        return retSocket;
    }

    processOutSockets(isPlus) {
        if (this.minOutSocketCount == null) {
            this.minOutSocketCount = 0;
        }
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genOutSocket();
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else {
            if (this.outputScokets_arr.length > this.minOutSocketCount) {
                var needRemoveSocket = this.outputScokets_arr[this.outputScokets_arr.length - 1];
                this.removeSocket(needRemoveSocket);
                this.fireEvent(Event_SocketNumChanged);
                retSocket = needRemoveSocket;
            }
        }
        return retSocket;
    }

    // can custom socket component
    customSocketRender(socket) {
        return null;
    }

    requestSaveAttrs() {
        var rlt = {
            id: this.id,
            type: this.type,
            left: this.left,
            top: this.top,
        };
        if (!IsEmptyString(this.title)) {
            rlt.title = this.title;
        }
        if (this.extra != null) {
            rlt.extra = this.extra;
        }
        if (this.editorLeft) {
            rlt.editorLeft = this.editorLeft;
        }
        if (this.editorTop) {
            rlt.editorTop = this.editorTop;
        }
        return rlt;
    }

    getExtra(key, def) {
        if (this.extra == null) {
            return def;
        }
        return this.extra[key] == null ? def : this.extra[key];
    }

    setExtra(key, val) {
        if (this.extra == null) {
            this.extra = {};
        }
        this.extra[key] = val;
    }

    getJson() {
        var attrs = this.requestSaveAttrs();
        if (attrs == null) {
            return null;
        }
        var rlt = {};
        for (var pname in attrs) {
            var pval = attrs[pname];
            if (pval == null) {
                continue;
            }
            var pValType = typeof (pval);
            var stringVal = null;
            switch (pValType) {
                case 'string':
                case 'number':
                    {
                        stringVal = pval;
                        break;
                    }
            }
            rlt[pname] = stringVal;
        }
        // input sockets
        if (this.inputScokets_arr.length > 0) {
            var t_insocketJson_arr = [];
            this.inputScokets_arr.forEach(data => {
                t_insocketJson_arr.push(data.getJson());
            });
            rlt.inputScokets_arr = t_insocketJson_arr;
        }
        if (this.outputScokets_arr.length > 0) {
            var t_outsocketJson_arr = [];
            this.outputScokets_arr.forEach(data => {
                t_outsocketJson_arr.push(data.getJson());
            });
            rlt.outputScokets_arr = t_outsocketJson_arr;
        }
        // child node
        if (this.nodes_arr && this.nodes_arr.length > 0) {
            var tNode_arr = [];
            this.nodes_arr.forEach(childNode => {
                var childJson = childNode.getJson();
                if (childJson) {
                    tNode_arr.push(childJson);
                }
            });
            rlt.nodes_arr = tNode_arr;
        }

        return rlt;
    }

    compile(helper, preNodes_arr) {
        if (preNodes_arr.indexOf(this) != -1) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                this.getNodeTitle(),
                this,
                helper.clickLogBadgeItemHandler),
                '处产生了回路!']);
            return false;
        }
        var cacheRet = helper.getCompileRetCache(this);
        return cacheRet;
    }
}

class SqlDef_Variable extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLDEF_VAR, '变量', false, nodeJson);

        this.name = ReplaceIfNull(this.name, 'unname');
        this.valType = ReplaceIfNull(this.valType, SqlVarType_Int);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        this.isParam = ReplaceIfNaN(this.isParam, 0);
        autoBind(this);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.name = this.name;
        rlt.valType = this.valType;
        rlt.size_1 = this.size_1;
        rlt.size_2 = this.size_2;
        rlt.isParam = this.isParam;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['name', 'valType', 'size_1', 'size_2', 'isParam']);
    }

    setProp(data) {
        if (data.name != null) {
            this.name = data.name;
        }
        if (data.valType != null) {
            this.valType = data.valType;
        }
        if (data.size_1 != null) {
            this.size_1 = isNaN(data.size_1) ? 0 : parseInt(data.size_1);
        }
        if (data.size_2 != null) {
            this.size_2 = isNaN(data.size_2) ? 0 : parseInt(data.size_2);
        }
        if (data.isParam != null) {
            this.isParam = data.isParam;
        }
        if (data.editing != null) {
            this.needEdit = data.editing;
        }
        this.fireChanged();
    }

    toString() {
        var attrs = this;
        var rlt = (attrs.isParam ? '@' : '') + attrs.name + '  ' + this.getDefType();

        return rlt;
    }

    getLabel() {
        return (this.isParam ? '@' : '') + this.name;
    }

    getRealName() {
        return (this.name[0] == '@' ? '' : '@') + this.name;
    }

    getValType() {
        return this.valType;
    }

    getDefType() {
        var rlt = this.valType;
        switch (this.valType) {
            case SqlVarType_NVarchar:
                rlt += '(' + this.size_1 + ')';
                break;
            case SqlVarType_Time:
                rlt += '(0)';
                break;
            case SqlVarType_Decimal:
                rlt += '(' + this.size_1 + ',' + this.size_2 + ')';
                break;
        }
        return rlt;
    }

    getDefineString() {
        return 'declare ' + (this.name[0] == '@' ? '' : '@') + this.name + ' ' + this.getDefType();
    }
}

class SqlNode_DBEntity extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DBENTITY, '数据源', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Table;
            }
        }
        else {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }

        if (this.targetEntity != null) {
            var tem_arr = this.targetEntity.split('-');
            if (tem_arr[0] == 'dbe') {
                this.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                this.targetEntity.on('syned', this.entitySynedHandler);
                //console.log(this.targetEntity);
            }
            else {
                this.targetEntity = null;
            }
        }

        var self = this;
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

    cusTitleChanged(oldTitle, newTitle) {
        if (this.targetEntity == null) {
            return;
        }
        if (IsEmptyString(newTitle)) {
            return;
        }
        var compareType = IsEmptyString(oldTitle) ? 'code' : 'alias';
        var key = IsEmptyString(oldTitle) ? this.targetEntity.code : oldTitle;
        var newTool = new SqlNodeTool_SynColumnNodeAlias(this, compareType, key, newTitle);
    }

    inputSocketSortFun(sa, sb) {
        return sa.index > sb.index;
    }

    entitySynedHandler() {
        var entity = this.targetEntity;
        if (entity && entity.loaded) {
            var paramCount = entity.params.length;
            this.inputScokets_arr.forEach(item => {
                item._validparam = false;
            });
            var hadChanged = false;
            entity.params.forEach((param, i) => {
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
            });
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

    getContext(finder) {
        finder.setTest(this.id);
        if (this.targetEntity == null) {
            return;
        }
        if (finder.type == ContextType_DBEntity) {
            var theLabel = this.title;
            if (IsEmptyString(theLabel)) {
                theLabel = this.targetEntity.loaded ? this.targetEntity.name : this.targetEntity.code;
            }
            finder.addItem(theLabel, this.targetEntity);
        }
    }
    compile(helper, preNodes_arr) {
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
                '没有选择数据源']);
            return false;
        }
        if (this.targetEntity.loaded == false) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '数据源尚未加载完成']);
            return false;
        }
        var paramsStr = '';
        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var paramValue = null;
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
                if (tLinks.length == 0) {
                    paramValue = IsEmptyString(theSocket.defval) ? null : "'" + theSocket.defval + "'";
                }
                else {
                    var compileRet = tLinks[0].outSocket.node.compile(helper, usePreNodes_arr);
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
                params_arr.push({ name: theSocket.name, value: paramValue });
            }
            params_arr.forEach((item, index) => {
                paramsStr += (index == 0 ? '' : ',') + item.value;
            });
        }
        helper.addUseEntity(this.targetEntity);
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, this.targetEntity.name + (paramsStr.length == 0 ? '' : '(' + paramsStr + ')') +
            (IsEmptyString(this.title) ? '' : ' as [' + this.title + ']'), { tableName: IsEmptyString(this.title) ? this.targetEntity.name : this.title });
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_XJoin extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_XJOIN, 'Join', true, nodeJson);
        autoBind(this);

        if (this.joinType == null) {
            this.joinType = JoinType_Inner;
        }

        if (nodeJson) {
            this.conditionNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_CONDITION; });
        }

        if (this.conditionNode == null) {
            this.conditionNode = new SqlNode_Ret_Condition({ left: 100, top: 0 }, this, createHelper);
        }
        this.conditionNode.label = 'ON';

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Table;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Table }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Table }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Table;
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.joinType = this.joinType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['joinType']);
    }

    preEditing(editor) {
        var cFinder = new ContextFinder(ContextType_DBEntity);
        this.getContext(cFinder);
        this.contextEntities_arr = cFinder.item_arr;
        for (var i in this.entityNodes_arr) {
            this.entityNodes_arr[i].valid = false;
        }
        for (var i = 0; i < this.contextEntities_arr.length; ++i) {
            var contextEntity = this.contextEntities_arr[i];
            var theNode = this.entityNodes_arr.find(x => { return x.label == contextEntity.label });
            if (theNode == null) {
                theNode = new SqlNode_DBEntity_ColumnSelector({ left: (i + 1) * -200 }, this, null);
                theNode.setEntity(contextEntity.label, contextEntity.data);
                this.entityNodes_arr.push(theNode);
            }
            theNode.valid = true;
        }
        this.bluePrint.banEvent('changed');
        for (var i = 0; i < this.entityNodes_arr.length; ++i) {
            var tNode = this.entityNodes_arr[i];
            if (!tNode.valid) {
                this.entityNodes_arr.splice(i, 1);
                --i;
                tNode.isConstNode = false;
                this.bluePrint.deleteNode(tNode);
            }
        }
        this.bluePrint.allowEvent('changed');
    }

    addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
        return new SqlNode_Column({
            tableCode: tableCode,
            tableAlias: tableAlias,
            tableName: tableName,
            columnName: columnName,
            cvalType: cvalType,
            left: x,
            top: y,
            newborn: newborn
        }, this, null);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var belongSelectNode = null;
        for (var i = preNodes_arr.length - 1; i >= 0; --i) {
            if (preNodes_arr[i].type == SQLNODE_SELECT) {
                belongSelectNode = preNodes_arr[i];
                break;
            }
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketOuts_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var socket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '必须有输入']);
                return false;
            }
            var theLink = tLinks[0];
            var outNode = theLink.outSocket.node;
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                // child compile fail
                return false;
            }
            var socketOut = compileRet.getSocketOut(theLink.outSocket);
            if (outNode.type == SQLNODE_SELECT) {
                // select node 需要嵌套括号以及别名
                socketOut.strContent = bracketStr(compileRet.strContent) + ' as ' + outNode.title;
            }
            if (socketOut.data && socketOut.data.tableName) {
                var tableKey = belongSelectNode.id + '_tables_' + socketOut.data.tableName;
                var cacheNode = helper.getCache(tableKey);
                if (cacheNode != null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle,
                        nodeThis,
                        helper.clickLogBadgeItemHandler),
                    '数据源:[' + socketOut.data.tableName + ']有同名节点']);
                    return false;
                }
                helper.setCache(tableKey, outNode);
            }
            socketOuts_arr.push(socketOut);
        }
        var joinString = socketOuts_arr[0].strContent + clampStr(this.joinType, ' ') + socketOuts_arr[1].strContent;

        if (this.conditionNode.inputScokets_arr.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                this.conditionNode,
                helper.clickLogBadgeItemHandler),
                '需要指定']);
            return false;
        }

        if (this.joinType != 'cross join') {
            var conditionNodeCompileRet = this.conditionNode.compile(helper, usePreNodes_arr);
            if (conditionNodeCompileRet == false) {
                return false;
            }
            var onString = conditionNodeCompileRet.getDirectOut().strContent;
            if (IsEmptyString(onString)) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    this.conditionNode,
                    helper.clickLogBadgeItemHandler),
                    '没有设定正确的输入']);
                return false;
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, joinString + ' on ' + onString);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Column extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_COLUMN, '列', false, nodeJson);
        autoBind(this);

        //this.label = this.tableName + '.' + this.columnName;
        this.headType = 'empty';
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.label = this.getSocketLabel();
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: this.cvalType, label: this.getSocketLabel() });
            this.addSocket(this.outSocket);
        }

        this.scoketNameMoveable = true;
    }

    freshSocketLabel() {
        this.outSocket.label = this.getSocketLabel();
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.tableAlias = this.tableAlias;
        rlt.tableName = this.tableName;
        rlt.tableCode = this.tableCode;
        rlt.columnName = this.columnName;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['tableAlias', 'tableName', 'columnName', 'tableCode']);
    }

    getNodeTitle() {
        return '列:' + this.getSocketLabel();
    }

    getSocketLabel() {
        return (this.tableAlias == null ? this.tableName : this.tableAlias) + '.' + this.columnName;
    }

    getCompareKey() {
        return (this.tableAlias == null ? this.tableCode : this.tableAlias) + '.' + this.columnName;
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var belongSelectNode = null;
        var isolatedColumn = true;
        for (var i = preNodes_arr.length - 1; i >= 0; i--) {
            if (preNodes_arr[i].type == SQLNODE_SELECT) {
                belongSelectNode = preNodes_arr[i];
                break;
            }
            else if (preNodes_arr[i].type == SQLNODE_AGGREGATE) {
                isolatedColumn = false;                                                                                            
            }
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (belongSelectNode == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '没有找到归属select节点']);
            return false;
        }
        if (isolatedColumn) {
            if(helper[belongSelectNode.id + '_complingSocket_complingSocket'] != null)
            {
                if (helper[belongSelectNode.id + '_complingSocket_isolated'] == false) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '不能和聚合函数混用！']);
                    return false;
                }
                helper[belongSelectNode.id + '_complingSocket_isolated'] = true;
            }
        }
        var compareLabel = (this.tableAlias == null ? this.tableName : this.tableAlias);
        var selectNodeContext = helper.getContext(belongSelectNode, new ContextFinder(ContextType_DBEntity));
        var columnItem = null;
        for (var i = 0; i < selectNodeContext.item_arr.length; ++i) {
            var item = selectNodeContext.item_arr[i];
            if (item.label == compareLabel) {
                columnItem = item.data.getColumnByName(this.columnName);
                if (columnItem != null) {
                    break;
                }
            }
        }
        if (columnItem == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '没有在上下文中找到:' + compareLabel]);
            return false;
        }
            if (this.outSocket.type != columnItem.cvalType) {
                this.outSocket.set({ type: columnItem.cvalType });
            }
        var selfCompileRet = new CompileResult(this);
        var columnLabel = '[' + compareLabel + '].[' + this.columnName + ']';
        selfCompileRet.setSocketOut(this.outSocket, columnLabel);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_DBEntity_ColumnSelector extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_DBENTITY_COLUMNSELECTOR, '实体', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        var bCanSlect = parentNode.isSelectColumn != null;
        if (bCanSlect) {
            this.addFrameButton('select-all', '全选');
            this.addFrameButton('unselect-all', '全不选');
            this.addFrameButton('fresh', '刷新');
        }
    }

    requestSaveAttrs() {
        // 临时节点不需保存
        return null;
    }

    clickFrameButton(btnName) {
        if (super.clickFrameButton(btnName)) {
            return;
        }
        switch (btnName) {
            case 'select-all':
                {
                    var entity = this.entity;
                    for (var si in this.entity.columns) {
                        var theColumn = this.entity.columns[si];
                        this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, true);
                    }
                    break;
                }
            case 'unselect-all':
                {
                    var entity = this.entity;
                    for (var si in this.entity.columns) {
                        var theColumn = this.entity.columns[si];
                        this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, false);
                    }
                    break;
                }
        }
        return false;
    }

    entitySynedHandler() {
        this.fireChanged();
    }

    setEntity(label, target) {
        this.entity = target;
        if (label == target.name) {
            this.alias = null;
        }
        else {
            this.alias = label;
        }
        this.label = label;
        if (target.on != null) {
            target.on('syned', this.entitySynedHandler);
        }
    }
}

class SqlNode_Select extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_SELECT, 'Select', true, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
                this.inSocket.type = SqlVarType_Table;
            }
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Table;
            }
            this.columnNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_COLUMNS });
            this.conditionNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_CONDITION });
            this.orderNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_ORDER });
            this.groupNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_GROUP });
            this.havingNode = this.nodes_arr.find(node => { return node.type == SQLNODE_RET_HAVING });
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Table });
            this.addSocket(this.inSocket);
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }
        if (IsEmptyString(this.title)) {
            this.title = '未命名';
        }

        if (this.columnNode == null) {
            this.columnNode = new SqlNode_Ret_Columns({ left: 100, top: 0 }, this, createHelper);
        }
        if (this.conditionNode == null) {
            this.conditionNode = new SqlNode_Ret_Condition({ left: 250, top: 0 }, this, createHelper);
        }
        if (this.orderNode == null) {
            this.orderNode = new SqlNode_Ret_Order({ left: 300, top: 0 }, this, createHelper);
        }
        if (this.groupNode == null) {
            this.groupNode = new SqlNode_Ret_Group({ left: 400, top: 0 }, this, createHelper);
        }
        if (this.havingNode == null) {
            this.havingNode = new SqlNode_Ret_Having({ left: 500, top: 0 }, this, createHelper);
        }
        if (this.columns_arr == null) {
            this.columns_arr = [];
        }
        if (this.orderColumns_arr == null) {
            this.orderColumns_arr = [];
        }
        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};

        if (createHelper) {
            createHelper.on('complete', this.createHelperCompleteHandler);
        }
    }

    createHelperCompleteHandler(createHelper) {
        createHelper.off('complete', this.createHelperCompleteHandler);
        this.postEditing(null);
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['tableAlias', 'tableName', 'columnName', 'tableCode']);
    }

    getContext(finder, depth) {
        finder.setTest(this.id);
        if (depth == null) {
            depth = 0;
        }
        if (depth == 0) {
            return super.getContext(finder, 1);
        }
        //判断输入口是否是 union
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
        if (tLinks.length > 0) {
            var temlink = tLinks[0];
            var outNode = temlink.outSocket.node;
            if (outNode.type == SQLDEF_UNION) {
                var theNewEntity = outNode.getContext(finder, depth + 1);
                theNewEntity.label = this.title;
                return;
            }
        }

        // 其他情况下只返回自身即可
        var retLinks = this.bluePrint.linkPool.getLinksByNode(this.columnNode, 'i');
        if (retLinks.length == 0) {
            return;
        }
        var temEntity = new DBEntityAgency(this.getNodeTitle(), this.id);
        for (var i in retLinks) {
            var link = retLinks[i];
            var theSocket = link.inSocket;
            var colName = theSocket.getExtra('alias');
            var cvalType = SqlVarType_NVarchar;
            if (IsEmptyString(colName)) {
                if (link.outSocket.node.type == SQLNODE_COLUMN) {
                    colName = link.outSocket.node.columnName;
                    cvalType = link.outSocket.node.cvalType;
                }
            }
            if (!IsEmptyString(colName)) {
                temEntity.columns.push({ name: colName, cvalType: cvalType });
            }
        }
        return finder.addItem(this.title, temEntity);
    }

    preEditing(editor) {
        var cFinder = new ContextFinder(ContextType_DBEntity);
        this.getContext(cFinder);
        this.contextEntities_arr = cFinder.item_arr;
        for (var i in this.entityNodes_arr) {
            this.entityNodes_arr[i].valid = false;
        }
        for (var i in this.contextEntities_arr) {
            var contextEntity = this.contextEntities_arr[i];
            var theNode = this.entityNodes_arr.find(x => { return x.label == contextEntity.label });
            if (theNode == null) {
                theNode = new SqlNode_DBEntity_ColumnSelector({ left: (i + 1) * -200 }, this, null);
                theNode.setEntity(contextEntity.label, contextEntity.data);
                this.entityNodes_arr.push(theNode);
            }
            theNode.valid = true;
        }
        this.bluePrint.banEvent('changed');
        for (var i = 0; i < this.entityNodes_arr.length; ++i) {
            var tNode = this.entityNodes_arr[i];
            if (!tNode.valid) {
                this.entityNodes_arr.splice(i, 1);
                --i;
                tNode.isConstNode = false;
                this.bluePrint.deleteNode(tNode);
            }
        }
        this.bluePrint.allowEvent('changed');
    }

    postEditing(editor) {
        var colSockets = this.columnNode.inputScokets_arr;
        var newColumns_arr = [];
        var temMap = {};
        for (var i in colSockets) {
            var socket = colSockets[i];
            var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
            var colNode = null;
            if (tlinks.length > 0) {
                var theLink = tlinks[0];
                if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                    colNode = theLink.outSocket.node;
                }
            }
            var colName = socket.getExtra('alias');
            var cvalType = colNode ? colNode.cvalType : SqlVarType_NVarchar;
            if (IsEmptyString(colName) && colNode) {
                colName = colNode.columnName;
            }
            if (!IsEmptyString(colName)) {
                if (temMap[colName] == null) {
                    newColumns_arr.push({ name: colName, cvalType: cvalType });
                    temMap[colName] = 1;
                }
            }
        }
        this.columns_arr = newColumns_arr;

        var orderBySockets = this.orderNode.inputScokets_arr;
        var newOrderByColumns_arr = [];
        temMap = {};
        for (var i in orderBySockets) {
            var socket = orderBySockets[i];
            var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
            var colNode = null;
            if (tlinks.length > 0) {
                var theLink = tlinks[0];
                if (theLink.outSocket.node.type == SQLNODE_COLUMN) {
                    colNode = theLink.outSocket.node;
                }
            }
            if (colNode) {
                newOrderByColumns_arr.push({ name: colNode.columnName, orderType: socket.getExtra('orderType', '') });;
            }
        }

        this.orderColumns_arr = newOrderByColumns_arr;
    }

    isSelectColumn(compareKey) {
        return this.getSelectColumnLink(compareKey) != null;
    }

    getSelectColumnLink(compareKey) {
        if (this.autoCreateHelper[compareKey + '_creating']) {
            return true;
        }
        var columnNode = this.columnNode;
        for (var i in columnNode.inputScokets_arr) {
            var inSocket = columnNode.inputScokets_arr[i];
            var links_arr = this.bluePrint.linkPool.getLinksBySocket(inSocket);
            if (links_arr.length > 0) {
                var link = links_arr[0];
                var outNode = link.outSocket.node;
                if (outNode.type == SQLNODE_COLUMN) {
                    if (compareKey == outNode.getCompareKey()) {
                        return link;
                    }
                }
            }
        }
        return null;
    }

    addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn) {
        return new SqlNode_Column({
            tableCode: tableCode,
            tableAlias: tableAlias,
            tableName: tableName,
            columnName: columnName,
            cvalType: cvalType,
            left: x,
            top: y,
            newborn: newborn
        }, this, null);
    }

    columnCheckChanged(tableCode, tableAlias, tableName, columnName, cvalType, isCheck) {
        var compareKey = (tableAlias == null ? tableCode : tableAlias) + '.' + columnName;
        var theLink = this.getSelectColumnLink(compareKey);
        if (isCheck) {
            // 加入
            if (theLink != null) {
                return false;
            }
            var newSocket = this.columnNode.processInputSockets(true);
            newSocket.on(Event_CurrentComponentchanged, this.socketComponentCreated);
            this.newSocket = newSocket;
            this.autoCreateHelper[compareKey + '_creating'] = 1;
            this.autoCreateHelper[newSocket.id] = {
                newSocket: newSocket,
                step: 'created-socket',
                columnName: columnName,
                tableName: tableName,
                tableAlias: tableAlias,
                cvalType: cvalType,
                tableCode: tableCode,
                compareKey: compareKey,
            };
        }
        else {
            // 删除
            if (theLink == null) {
                return false;
            }
            var needRemoveSocket = theLink.inSocket;
            this.bluePrint.deleteNode(theLink.outSocket.node);
            this.columnNode.removeSocket(needRemoveSocket);
            this.columnNode.fireEvent(Event_SocketNumChanged);
        }
        return true;
    }

    socketComponentCreated(socket) {
        if (socket.currentComponent) {
            var createInfo = this.autoCreateHelper[socket.id];
            if (createInfo.step == 'created-socket') {
                var newColNode = this.addNewColumn(createInfo.tableCode, createInfo.tableAlias, createInfo.tableName, createInfo.columnName, createInfo.cvalType);
                createInfo.newColNode = newColNode;
                this.autoCreateHelper[newColNode.id] = createInfo;
                this.bluePrint.fireChanged(10);
                createInfo.step = 'created-column'

                newColNode.on(Event_FrameComMount, this.newColumNodeFrameComMounted);
            }
        }
        socket.off(Event_CurrentComponentchanged, this.socketComponentCreated);
    }

    newColumNodeFrameComMounted(newColNode) {
        var createInfo = this.autoCreateHelper[newColNode.id];
        if (createInfo) {
            if (createInfo.step == 'created-column') {
                var newLink = this.bluePrint.linkPool.addLink(newColNode.outSocket, createInfo.newSocket);
                newLink.straightOut(-150);
            }
            this.autoCreateHelper[createInfo.compareKey + '_creating'] = null;

        }
        newColNode.off(Event_FrameComMount, this.newColumNodeFrameComMounted);
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var columnNode = this.columnNode;
        var columnNode_inSockets = columnNode.inputScokets_arr;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var selfCompileRet = new CompileResult(this);
        if (IsEmptyString(this.title)) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '需要指定title']);
            return false;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        //判断输入口是否是 union
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        if (tLinks.length > 0) {
            var unionlink = tLinks[0];
            var outNode = unionlink.outSocket.node;
            var uniontValue = null;
            if (outNode.type == SQLDEF_UNION) {
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                var socketout = compileRet.getSocketOut(unionlink.outSocket);
                uniontValue = socketout.strContent;
                selfCompileRet.setSocketOut(this.outSocket, uniontValue, { tableName: this.title, columnsName_arr: socketout.data.columsName_arr });
                helper.setCompileRetCache(this, selfCompileRet);
                return selfCompileRet;
            }
        }


        if (columnNode_inSockets.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , columnNode
                , helper.clickLogBadgeItemHandler)
                , '没有选择任何返回列。']);
            return false;
        }
        var emptySocket = null;
        var emptySocketIndex = 0;
        for (var socketI = 0; socketI < columnNode_inSockets.length; ++socketI) {
            var socket = columnNode_inSockets[socketI];
            if (helper.getLinksBySocket(socket).length == 0) {
                emptySocket = socket;
                emptySocketIndex = socketI;
                break;
            }
        }
        if (emptySocket) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , columnNode
                , helper.clickLogBadgeItemHandler)
                , '第' + (emptySocketIndex + 1) + '个输入接口是空链接']);
            return false;
        }

        // compile from
        var fromString = '';
        if (this.inputScokets_arr.length == 0) {
            helper.logManager.warnEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '没有输入接口']);
        }
        var fromScoket = this.inputScokets_arr[0];
        var t_links = helper.getLinksBySocket(fromScoket);
        if (t_links.length > 0) {
            var fromLink = t_links[0];
            if (fromLink.outSocket != null && fromLink.outSocket.node != null) {
                if (fromLink.outSocket.type != SqlVarType_Table) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '的输入不是一个关系']);
                    return false;
                }
                var fromNode = fromLink.outSocket.node;
                var compileRet = fromNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    // child compile fail
                    return false;
                }
                fromString = compileRet.getSocketOut(fromLink.outSocket).strContent;
                if (fromNode.type == SQLNODE_SELECT) {
                    // select node 中断
                    fromString = bracketStr(fromString) + ' as ' + fromNode.title;
                }
            }
        }
        var selectColumns_arr = [];
        var isolatedColumns_arr = [];
        var outColumns_arr = [];
        var selectColumns_map = {};
        var socketOutData = null;
        var columsName_arr = [];
        var hadAggregateColumn = false;
        for (var socketI = 0; socketI < columnNode_inSockets.length; ++socketI) {
            var socket = columnNode_inSockets[socketI];
            var link = helper.getLinksBySocket(socket)[0];
            var outNode = link.outSocket.node;
            var isColumnNode = outNode.type == SQLNODE_COLUMN;
            var nodeType = outNode.type;
            var alias = socket.getExtra('alias');
            var colName = alias;
            if (IsEmptyString(alias)) {
                if (!isColumnNode) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , columnNode
                        , helper.clickLogBadgeItemHandler)
                        , '第' + (socketI + 1) + '列没有指定列名!']);
                    return false;
                }
                colName = outNode.columnName;
            }
            if (selectColumns_map[colName]) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , columnNode
                    , helper.clickLogBadgeItemHandler)
                    , "列名:'" + colName + "'重复了!"]);
                return false;
            }
            selectColumns_map[colName] = 1;
            helper[this.id + '_complingSocket_isolated']=null;
            helper[this.id + '_complingSocket_complingSocket']=socket;
            var outNodeCompileRet = outNode.compile(helper, usePreNodes_arr);
            if (outNodeCompileRet == false) {
                return false;
            }
            var socketOutData = outNodeCompileRet.getSocketOut(link.outSocket);
            if (helper[this.id + '_complingSocket_isolated']) {
                isolatedColumns_arr.push(socketOutData.strContent);
            }
            else if (helper[this.id + '_complingSocket_isolated'] == false) {
                hadAggregateColumn = true;
            }
            helper[this.id + '_complingSocket_complingSocket']=null;
            columsName_arr.push(colName);
            selectColumns_arr.push({
                alias: alias,
                strContent: socketOutData.strContent,
                strcolName: outNode.columnName,
            });
        }
        var sortNodeCompileRet = this.orderNode.compile(helper, usePreNodes_arr);
        if (sortNodeCompileRet == false) {
            return false;
        }
        var sortString = sortNodeCompileRet.getDirectOut().strContent;

        var conditionNodeCompileRet = this.conditionNode.compile(helper, usePreNodes_arr);
        if (conditionNodeCompileRet == false) {
            return false;
        }
        var whereString = conditionNodeCompileRet.getDirectOut().strContent;

        var groupNodeCompileRet = this.groupNode.compile(helper, usePreNodes_arr);
        if (groupNodeCompileRet == false) {
            return false;
        }
        var groupstring = groupNodeCompileRet.getDirectOut().strContent;
        var havingNodeCompileRet = this.havingNode.compile(helper, usePreNodes_arr);
        if (havingNodeCompileRet == false) {
            return false;
        }
        var havingString = havingNodeCompileRet.getDirectOut().strContent;
        var havingNodeInputLenth = havingNodeCompileRet.node.inputScokets_arr.length;
        var groupNodeInputLenth = groupNodeCompileRet.node.inputScokets_arr.length;
        if ((hadAggregateColumn && groupNodeInputLenth == 0) ||
            (havingNodeInputLenth > 0 && groupNodeInputLenth == 0)) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , this.groupNode
                , helper.clickLogBadgeItemHandler)
                , "必须设置group节点！"]);
            return false;
        }
        var groupnodeOut = groupNodeCompileRet.getDirectOut();
        for (var i = 0; i < isolatedColumns_arr.length; ++i) {
            var targetStr = isolatedColumns_arr[i];
            if (groupnodeOut.data.groupColumns_arr.indexOf(targetStr) == -1) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , this.groupNode
                    , helper.clickLogBadgeItemHandler)
                    , targetStr + "不存在Group里面"]);
                return false;
            }
        }
        var selfCompileRet = new CompileResult(this);
        var columnsStr = '';
        selectColumns_arr.forEach((x, i) => { columnsStr += (i == 0 ? '' : ',') + x.strContent + (x.alias == null ? '' : ' as [' + x.alias + ']') });

        var topString = '';
        if (!IsEmptyString(columnNode.topValue)) {
            if (isNaN(columnNode.topValue)) {
                var reg = /^\d+%$/;
                if (!reg.test(columnNode.topValue)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , columnNode
                        , helper.clickLogBadgeItemHandler)
                        , "top值不合法"]);
                    return false;
                }
                var num = columnNode.topValue.substr(0, columnNode.topValue.length - 1);
                if (num == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , columnNode
                        , helper.clickLogBadgeItemHandler)
                        , "top值不合法"]);
                    return false;
                }
                else if (num > 100) {
                    helper.logManager.warnEx(
                        [helper.logManager.createBadgeItem(
                            thisNodeTitle
                            , columnNode
                            , helper.clickLogBadgeItemHandler)
                            , "top百分比值被修改为100%"]
                    );
                    num = 100;
                }
                topString = 'top ' + num + ' percent ';
            }
            else {
                topString = 'top ' + columnNode.topValue + ' ';
            }
        }
        var finalSql = 'select ' + topString + columnsStr + ' from ' + fromString
            + (IsEmptyString(whereString) ? '' : ' where ' + whereString)
            + (IsEmptyString(groupstring) ? '' : ' group by ' + groupstring)
            + (IsEmptyString(havingString) ? '' : ' having ' + havingString)
            + (IsEmptyString(sortString) ? '' : ' order by ' + sortString);
        selfCompileRet.setSocketOut(this.outSocket, finalSql, { tableName: this.title, colName_arr: outColumns_arr });
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Var_Get extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_VAR_GET, '变量-获取', false, nodeJson);
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
                MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if (this.varData.removed) {
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = SqlVarType_Unknown;
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

class SqlNode_Var_Set extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_VAR_SET, '变量-设置', false, nodeJson);
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
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true);
            this.addSocket(this.inSocket);
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
        return 'Set:' + this.varName;
    }

    varChangedHandler() {
        if (this.varData == null) {
            this.inSocket.set(
                MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if (this.varData.removed) {
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = SqlVarType_Unknown;
        }
        else {
            varLabel = this.varData.getLabel();
            valType = this.varData.getValType();
            this.varName = this.varData.name;
        }

        this.inSocket.set(
            MK_NS_Settings(varLabel, valType, null)
        );
        this.outSocket.set(
            MK_NS_Settings('', valType, null)
        );
        this.fireChanged();
    }

}

class SqlNode_NOperand extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_NOPERAND, '运算', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(this.genInSocket());
            this.addSocket(this.genInSocket());
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.operator == null) {
            this.operator = '+';
        }
        this.minInSocketCount = 2;

        var self = this;
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

    compile(helper, preNodes_arr) {
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
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval;
                if (isNaN(tValue)) {
                    allNumberic = false;
                    tValue = singleQuotesStr(tValue);
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
                if (!outNode.outputIsSimpleValue()) {
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

class SqlNode_Ret_Condition extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_CONDITION, 'Where', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
                this.inSocket.inputable = false;
                this.inSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Boolean, inputable: false });
            this.addSocket(this.inSocket);
        }
        var self = this;
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var selfCompileRet = new CompileResult(this);
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
        if (tLinks.length > 0) {
            var link = tLinks[0];
            var outNode = link.outSocket.node;
            var tCompileRet = outNode.compile(helper, preNodes_arr);
            if (tCompileRet == false) {
                return false;
            }
            selfCompileRet.setDirectOut(tCompileRet.getSocketOut(link.outSocket).strContent);
        }
        else {
            selfCompileRet.setDirectOut('');
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Ret_Order extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_ORDER, 'Order', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }

    orderTypeDropdownChangedHandler(data, dropCtl) {
        var theSocketID = getAttributeByNode(dropCtl.rootDivRef.current, 'd-socketid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('orderType', data);
        //console.log(data);
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return;
        }
        var orderType = socket.getExtra('orderType');
        if (orderType == null) {
            orderType = OrderType_ASCE;
        }
        return (<DropDownControl itemChanged={this.orderTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={OrderTypes_arr} rootclass='flex-grow-1 flex-shrink-1' value={orderType} />)
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var sortColumns_arr = [];
        var selfCompileRet = new CompileResult(this);
        if (this.inputScokets_arr.length > 0) {
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var socket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '有空输入']);
                    return false;
                }
                var link = tLinks[0];
                var compileRet = link.outSocket.node.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                var compileData = compileRet.getSocketOut(link.outSocket);
                sortColumns_arr.push({ name: compileData.strContent, type: socket.getExtra('orderType') });
            }
            var strContent = '';
            sortColumns_arr.forEach((x, i) => { strContent += (i == 0 ? '' : ',') + x.name + (x.type == OrderType_DESC ? ' desc' : '') });
            selfCompileRet.setDirectOut(strContent);
        }
        else {
            selfCompileRet.setDirectOut('');
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Ret_Columns extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_COLUMNS, 'RET 列', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;
        this.addFrameButton(FrameButton_LineSocket, '拉平');
        this.addFrameButton(FrameButton_ClearEmptySocket, '清理');
        if (nodeJson) {
            this.inputScokets_arr.forEach(x => {
                x.inputable = false;
                x.type = SqlVarType_Scalar;
            });
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.topValue = this.topValue;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['topValue']);
    }

    genInSocket() {
        var socketName = 'in' + this.inputScokets_arr.length;
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }

    freshContext() {

    }

    linkAdded(link) {
        super.linkAdded(link);
        var outNode = link.outSocket.node;
        if (outNode.type == SQLNODE_COLUMN) {
            this.parent.fireEvent('selectchanged', 0, {
                tableCode: outNode.tableCode,
                tableAlias: outNode.tableAlias,
                columnName: outNode.columnName
            });
        }
    }

    linkRemoved(link) {
        super.linkRemoved(link);
        var outNode = link.outSocket.node;
        if (outNode.type == SQLNODE_COLUMN) {
            this.parent.fireEvent('selectchanged', 0, {
                tableCode: outNode.tableCode,
                tableAlias: outNode.tableAlias,
                columnName: outNode.columnName
            });
        }
    }

    aliasInputChangedHanlder(ev) {
        var theSocketID = getAttributeByNode(ev.target, 'd-socketid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('alias', ev.target.value);
        theSocket.fireEvent('changed');
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return;
        }
        var alias = socket.getExtra('alias');
        if (alias == null) {
            alias = '';
        }
        return (<div>AS:<input type='text' className='socketInputer' big='1' onChange={this.aliasInputChangedHanlder} value={alias} /></div>)
    }
}

class SqlNode_ConstValue extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CONSTVALUE, '常量', false, nodeJson);
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
        this.outSocket.hadMoveArrows;
        this.headType = 'empty';

        var self = this;
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.value = this.value;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['value']);
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
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '无效值']);
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

class SqlNode_Compare extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_COMPARE, '比较', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.operator == null) {
            this.operator = '=';
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
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
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
                if (!outNode.outputIsSimpleValue()) {
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

class SqlNodeTool_SynColumnNodeAlias {
    constructor(srcNode, compareType, key, newAlias) {
        this.srcNode = srcNode;
        this.compareType = compareType;
        this.key = key;
        this.newAlias = newAlias;
        this.meetMap = {};

        this.doSyn(srcNode);
    }

    doSyn(node) {
        if (this.meetMap[node.id]) {
            return;
        }
        if (node.type == SQLNODE_COLUMN) {
            var hited = false;
            switch (this.compareType) {
                case 'code':
                    hited = node.tableCode == this.key;
                    break;
                case 'alias':
                    hited = node.tableAlias == this.key;
                    break;
            }
            if (hited) {
                node.tableAlias = this.newAlias;
                node.freshSocketLabel();
            }
        }
        else if (node.nodes_arr && node.nodes_arr.length > 0) {
            // syn self
            for (var si in node.nodes_arr) {
                var childNode = node.nodes_arr[si];
                this.doSyn(childNode);
            }
        }
        if (node.parent == this.srcNode.parent && (node.type != SQLNODE_SELECT || node == this.srcNode)) {
            var outLinks = node.bluePrint.linkPool.getLinksByNode(node, 'o');
            for (var si in outLinks) {
                this.doSyn(outLinks[si].inSocket.node);
            }
        }

        this.meetMap[node.id] = 1;
    }
}

class SqlNode_RowNumber extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_ROWNUMBER, 'RowNumber', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(x => {
                x.inputable = false;
            });
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }

    orderTypeDropdownChangedHandler(data, dropCtl) {
        var theSocketID = getAttributeByNode(dropCtl.rootDivRef.current, 'd-socketid');
        if (theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if (theSocket == null)
            return;
        theSocket.setExtra('orderType', data);
        //console.log(data);
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return;
        }
        var orderType = socket.getExtra('orderType');
        if (orderType == null) {
            orderType = OrderType_ASCE;
        }
        return (<DropDownControl itemChanged={this.orderTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={OrderTypes_arr} rootclass='flex-grow-1 flex-shrink-1' value={orderType} />)
    }

    compile(helper, preNodes_arr) {
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
                if (!outNode.outputIsSimpleValue()) {
                    tValue = '(' + tValue + ')';
                }
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = 'ROW_NUMBER() over (order by ';
        if (socketVal_arr.length == 0) {
            finalStr += '(select 0))';
        }
        else {
            socketVal_arr.forEach((x, i) => {
                var orderType = this.inputScokets_arr[i].getExtra('orderType');
                finalStr += (i == 0 ? '' : ',') + x + (orderType == OrderType_DESC ? ' desc' : '');
            });
            finalStr += ')';
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_IsNullFun extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_ISNULL, 'Isnull()', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
            this.inputScokets_arr[0].inputable = false;
            this.inputScokets_arr[1].inputable = true;
        }

    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }
    compile(helper, preNodes_arr) {
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (i == 1) {
                    tValue = theSocket.defval;
                    if (!IsEmptyString(tValue)) {
                        if (isNaN(tValue)) {
                            tValue = singleQuotesStr(tValue);
                        }
                    }
                    if (IsEmptyString(tValue)) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle
                            , nodeThis
                            , helper.clickLogBadgeItemHandler)
                            , '输入不能为空']);
                        return false;
                    }
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
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = 'ISNULL(';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : ',') + x;
        });
        finalStr += ')';

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
class SqlNode_IsNullOperator extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_ISNULLOPERATOR, 'IsNullOperator', false, nodeJson);
        autoBind(this);

        if (this.operator == null) {
            this.operator = SqlOperator_IsNull;
        }
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }

    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }

    restorFromAttrs(attrsIsNull) {
        assginObjByProperties(this, attrsIsNull, ['operator']);
    }

    compile(helper, preNodes_arr) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (tValue == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
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
                if (!outNode.outputIsSimpleValue()) {
                    tValue = '(' + tValue + ')';
                }
            }
            socketVal_arr.push(tValue);
        }
        var finalStr = tValue + ' ' + this.operator;
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
//  SQL_between
class SqlNode_BetWeen extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_BETWEEN, 'BetWeen', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        //定义输出接口标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        //定义输入接口标量
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
            this.addSocket(new NodeSocket('in2', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });

            this.inputScokets_arr[0].inputable = false;
            this.inputScokets_arr[1].inputable = true;
            this.inputScokets_arr[2].inputable = true;
        }

    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }
    compile(helper, preNodes_arr) {
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                if (i > 0) {
                    if (!IsEmptyString(theSocket.defval)) {
                        tValue = theSocket.defval;
                        if (isNaN(tValue)) {
                            tValue = singleQuotesStr(tValue);
                        }
                    }
                }
                if (tValue == null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
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
            }
            socketVal_arr.push(tValue);
        }
        //SQL语句拼接
        var finalStr = socketVal_arr[0] + ' between ' + socketVal_arr[1] + ' and ' + socketVal_arr[2];
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

/**
 * 逻辑运算符 and or not
 */
class SqlNode_Logical_Operator extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_LOGICAL_OPERATOR, '逻辑', false, nodeJson);
        autoBind(this);

        if (this.LogicalType == null) {
            this.LogicalType = Logical_Operator_and;
        }

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Table, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Table, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
            this.minInSocketCount = 2;

        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return '逻辑:' + this.LogicalType;
    }
    //保存 and or
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.LogicalType = this.LogicalType;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['LogicalType']);
    }
    //增加输入接口
    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }
    getValue() {
        return this.outSocket.defval;
    }

    compile(helper, preNodes_arr) {
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
                if (!outNode.outputIsSimpleValue()) {
                    tValue = '(' + tValue + ')';
                }
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
/**
 * 获取当前时间
 */

class SqlNode_Getdate extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_GETDATE, 'Getdate', false, nodeJson);
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
        var value = "getdate()";
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, value);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

//数据类型转换
class SqlNode_Cast extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CAST, 'CAST', false, nodeJson);
        this.size_1 = ReplaceIfNaN(this.size_1, 0);
        this.size_2 = ReplaceIfNaN(this.size_2, 0);
        autoBind(this);

        //this.isConstNode = true; //使节点不可被删除

        //复原
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Table });
            this.addSocket(this.inSocket);
        }
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
        };
        var castValType = this.inSocket.getExtra('castValType');//一
        if (SqlVarTypes_arr.indexOf(castValType) == -1) {
            this.inSocket.setExtra('castValType', SqlVarType_NVarchar);
        }
    }


    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    restorFromAttrs(attrsJson) {
    }

    castTypeDropdownChangedHandler(data, dropCtl) {
        var theSocket = this.inSocket;
        theSocket.setExtra('castValType', data);//三
        theSocket.fireEvent('changed');
    }

    sizeOneInputChangedHandler(ev) {
        var newVal = ev.target.value;
        if (isNaN(newVal)) {
            return;
        }
        this.inSocket.setExtra('size1', newVal);
        this.inSocket.fireEvent('changed');
    }

    sizeTwoInputChangedHandler(ev) {
        var newVal = ev.target.value;
        if (isNaN(newVal)) {
            return;
        }
        this.inSocket.setExtra('size2', newVal);
        this.inSocket.fireEvent('changed');
    }

    customSocketRender(socket) {
        if (!socket.isIn) {
            return;
        }
        var castValType = socket.getExtra('castValType');//四
        var hadSizeOne = false;
        var hadSizeTwo = false;
        switch (castValType) {
            case SqlVarType_Time:
            case SqlVarType_NVarchar:
                hadSizeOne = true;
                break;
            case SqlVarType_Decimal:
                hadSizeOne = true;
                hadSizeTwo = true;
                break;
        }
        var sizeOneInptELem = null;
        var sizeTwoInputElem = null;
        if (this.inputStyle == null) {
            this.inputStyle = {
                width: '3em',
            };
        }
        if (hadSizeOne) {
            var sizeValue = socket.getExtra('size1');
            if (isNaN(sizeValue)) {
                sizeValue = 0;
            }
            sizeOneInptELem = (<input type='int' style={this.inputStyle} value={sizeValue} onChange={this.sizeOneInputChangedHandler} />);
        }
        if (hadSizeTwo) {
            var sizeValue = socket.getExtra('size2');
            if (isNaN(sizeValue)) {
                sizeValue = 0;
            }
            sizeTwoInputElem = (<input type='int' style={this.inputStyle} value={sizeValue} onChange={this.sizeTwoInputChangedHandler} />);
        }

        //创建一个下拉框
        return (
            <React.Fragment>
                <DropDownControl itemChanged={this.castTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={SqlVarTypes_arr} rootclass='flex-grow-1 flex-shrink-1' value={castValType} />
                {sizeOneInptELem}
                {sizeTwoInputElem}
            </React.Fragment>
        );
    }
    //编译

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);

        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        //节点名称
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var inSocket = this.inSocket;
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(inSocket);
        var inscoketValue = null;

        if (tLinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '输入不能为空']);
            return false;
        }
        var link = tLinks[0];
        var outNode = link.outSocket.node;
        var compileRet = outNode.compile(helper, usePreNodes_arr);
        if (compileRet == false) {
            return false;
        }
        inscoketValue = compileRet.getSocketOut(link.outSocket).strContent;
        if (!outNode.outputIsSimpleValue()) {
            inscoketValue = '(' + inscoketValue + ')';
        }

        var castValType = inSocket.getExtra('castValType');

        var hadSizeOne = false;
        var hadSizeTwo = false;
        var sizeOneMax = 0;
        var sizeTwoMax = 0;
        switch (castValType) {
            case SqlVarType_Time:
                sizeOneMax = 7;
                hadSizeOne = true;
                break;
            case SqlVarType_NVarchar:
                sizeOneMax = 4000;
                hadSizeOne = true;
                break;
            case SqlVarType_Decimal:
                sizeOneMax = 20;
                sizeTwoMax = 6;
                hadSizeOne = true;
                hadSizeTwo = true;
                break;
        }
        var sizeStr = '';
        if (hadSizeOne) {
            var sizeValue = parseInt(inSocket.getExtra('size1'));
            if (sizeValue == null || sizeValue < 0) {
                sizeValue = 0;
            }
            if (sizeValue > sizeOneMax) {
                sizeValue = sizeOneMax;
                helper.logManager.warnEx(
                    [helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , this
                        , helper.clickLogBadgeItemHandler)
                        , "size1已被重置为:" + sizeOneMax]
                );
            }
            sizeStr = '(' + sizeValue;
            switch (castValType) {
                case SqlVarType_Decimal:
                    sizeTwoMax = sizeValue;
                    break;
                case SqlVarType_NVarchar:
                    if (sizeValue == 0) {
                        sizeStr = '';
                    }
                    break;
            }
        }
        if (hadSizeTwo) {
            var sizeValue = parseInt(inSocket.getExtra('size2'));
            if (sizeValue == null || sizeValue < 0) {
                sizeValue = 0;
            }
            if (sizeValue > sizeTwoMax) {
                sizeValue = sizeTwoMax;
                helper.logManager.warnEx(
                    [helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , this
                        , helper.clickLogBadgeItemHandler)
                        , "size2已被重置为:" + sizeTwoMax]
                );
            }
            sizeStr += ',' + sizeValue;
        }
        if (sizeStr.length > 0) {
            sizeStr += ')';
        }

        var finalStr = 'cast(' + inscoketValue + ' as ' + castValType + sizeStr + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}


//like模糊查询
class SqlNode_Like extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_LIKE, 'Like', false, nodeJson);
        autoBind(this);

        if (this.operator == null) {
            this.operator = 'like';
        }
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('in1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
            this.inputScokets_arr[0].inputable = false;
            this.inputScokets_arr[1].inputable = true;
        }
    }
    //保存
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }
    //like语句编译
    compile(helper, preNodes_arr) {
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
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);//找到当前link
            if (tLinks.length == 0) {
                var tValue = null;
                if (i == 1) {
                    tValue = theSocket.defval;
                    if (!IsEmptyString(tValue)) {//判断输入值是不是一个空值
                        if (isNaN(tValue)) {//判断输入值是不是字符值，如果是返回true，不是返回false
                            tValue = singleQuotesStr(tValue);//如果是字符类型，就给字符两边加上引号
                        }
                    }
                }
                if (IsEmptyString(tValue)) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;//link.outSocket

                if (!outNode.outputIsSimpleValue()) {
                    tValue = '(' + tValue + ')';
                }
            }
            socketVal_arr.push(tValue);
        }

        var finalStr = socketVal_arr[0] + ' ' + this.operator + ' ' + socketVal_arr[1];


        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}

/**
 * 逻辑运算符  not
 */
class SqlNode_Logical_Not extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_LOGICAL_NOT, 'not', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean, inputable: false });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
    }
    getNodeTitle() {
        return '逻辑:not';
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }
    //复原
    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['LogicalType']);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var selectCs_arr = [];
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }

                tValue = compileRet.getSocketOut(link.outSocket);
            }
            if (!outNode.outputIsSimpleValue()) {
                tValue = ' (' + tValue + ')';
            }
        }

        var finalStr = ' not ' + tValue;
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

/*
   操作符 in
*/

class SqlNode_In_Operator extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_IN_OPERATOR, 'In', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {

            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Boolean });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length != 0) {
            var self = this;
            this.inputScokets_arr.forEach((socket, i) => {

                if (socket.type == SqlVarType_Table) {
                    self.tablesocket = socket;
                }
                else if (socket.type != SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }

            });
        } else {
            this.addSocket(this.genInSocket());
        }
        if (this.tablesocket == null) {
            this.tablesocket = this.addSocket(new NodeSocket('intable', this, true, { type: SqlVarType_Table }));
        }
    }
    genInSocket() {
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        //rlt.joinType = this.joinType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['joinType']);
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketOuts_arr = [];

        if (this.inputScokets_arr[0].type == SqlVarType_Table) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不得为table类型']);
            return false;
        }
        var first_socket = this.inputScokets_arr[0];
        var first_socketlinks = this.bluePrint.linkPool.getLinksBySocket(first_socket);
        if (first_socketlinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不能为空']);
            return false;
        }
        var firstvalue = ''
        var firstLink = first_socketlinks[0];
        var firstoutNode = firstLink.outSocket.node;
        var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
        if (firstcompileRet == false) {
            // child compile fail
            return false;
        }
        firstvalue = firstcompileRet.getSocketOut(firstLink.outSocket).strContent;
        if (!firstoutNode.outputIsSimpleValue()) {
            firstvalue = ' (' + firstvalue + ')';
        }

        var finalSql = '';
        var tablesocketlinks = this.bluePrint.linkPool.getLinksBySocket(this.tablesocket);
        if (tablesocketlinks.length != 0) {
            var theLink = tablesocketlinks[0];//insocket 只有一个输入值
            var outNode = theLink.outSocket.node; //一根线 指向另一端输出端口
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                // child compile fail
                return false;
            }
            var socketOut = compileRet.getSocketOut(theLink.outSocket).strContent;
            finalSql = firstvalue + ' in ( ' + socketOut + ' ) ';
        } else {
            var socketOutstrs_arr = [];

            for (var i = 1; i < this.inputScokets_arr.length; ++i) {
                var socket = this.inputScokets_arr[i];
                if (socket == this.tablesocket) {
                    continue;
                }
                var tValue = null;
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);

                if (tLinks.length == 0) {
                    if (!IsEmptyString(socket.defval)) {
                        tValue = socket.defval;// 判断手输入值
                        if (isNaN(tValue)) {
                            tValue = singleQuotesStr(tValue);
                        }
                    }
                    if (tValue == null) {
                        helper.logManager.errorEx([helper.logManager.createBadgeItem(
                            thisNodeTitle,
                            nodeThis,
                            helper.clickLogBadgeItemHandler),
                            '不能有空输入']);
                        return false;
                    }
                } else {
                    var theLink = tLinks[0];
                    var outNode = theLink.outSocket.node;
                    var compileRet = outNode.compile(helper, usePreNodes_arr);
                    if (compileRet == false) {
                        // child compile fail
                        return false;
                    }
                    tValue = compileRet.getSocketOut(theLink.outSocket).strContent;
                    if (!outNode.outputIsSimpleValue()) {
                        tValue = ' (' + tValue + ')';
                    }
                }
                socketOutstrs_arr.push(tValue);
            }
            if (socketOutstrs_arr.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '至少输入一个 in 条件']);
                return false;
            }
            finalSql = firstvalue + ' in ( ' + socketOutstrs_arr.join(',') + ' ) ';
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
/*
   拼接字符串
*/
class SqlNode_ToString extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_TOSTRING, 'tostring()', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = true;
            });
        }


    }
    genInSocket() {
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, { type: SqlVarType_Scalar, inputable: true });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        //rlt.joinType = this.joinType;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        //assginObjByProperties(this, attrsJson, ['joinType']);
    }
    compile(helper, preNodes_arr) {
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
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入不能为空']);
                    return false;
                }
                tValue = theSocket.defval.replace(/\'/g, '');
                tValue = "'" + tValue + "'";
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent.replace(/\'/g, '');
            }
            socketVal_arr.push(tValue);
        }
        /*if (!allNumberic) {
            for (var si in socketVal_arr) {
                if (!isNaN(socketVal_arr[si])) {
                    socketVal_arr[si] = singleQuotesStr(socketVal_arr[si]);
                }
            }
        }*/
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : '+') + x;
        });
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
//exists
class SqlNode_Exists extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_EXISTS, 'exists', false, nodeJson);
        autoBind(this);

        if (this.operator == null) {
            this.operator = 'exists';
        }
        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
        }
    }
    //保存
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt; ss
    }
    //复原
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['operator']);
    }

    //exists语句编译
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue = null;

        if (tLinks.length == 0) {
            if (tValue == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
        } else {
            var link = tLinks[0];
            var outNode = link.outSocket.node;
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                return false;
            }
            tValue = compileRet.getSocketOut(link.outSocket).strContent;
        }
        var finalStr = this.operator + '(' + tValue + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }

}
/*
    case when

*/
class SqlNode_Case_When extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CASE_WHEN, 'case_when', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Scalar, inputable: false }));

        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
                socket.inputable = false;
            });
            this.minInSocketCount = 1;
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'then';
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        return rlt;
    }

    //增加输入接口
    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }
    getValue() {
        return this.outSocket.defval;
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal_arr = [];
        /*if(this.inputScokets_arr.length < 1){
          helper.logManager.errorEx([helper.logManager.createBadgeItem(
              thisNodeTitle
              , nodeThis
              , helper.clickLogBadgeItemHandler)
              , '缺少when条件或者else条件输入']);
          return false;
         }*/

        var tValue_else = null;
        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }

                var nodetype = outNode.type
                //||outNode.getNodeTitle() !='cw_else'
                if (nodetype != 'cw_when' && nodetype != 'cw_else') {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '不能输入除了when和else以外节点']);
                    return false;
                }
                if (nodetype == 'cw_when') {
                    tValue = compileRet.getSocketOut(link.outSocket).strContent;
                }
                if (tValue_else != null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '只能输入一次else节点']);
                    return false;
                } else {
                    if (nodetype == 'cw_else') {
                        tValue_else = compileRet.getSocketOut(link.outSocket).strContent;
                    }
                }

                /*if (!outNode.outputIsSimpleValue()) {
                    tValue = '' + tValue + '';
                    }*/

            }
            if (tValue != null) {
                socketVal_arr.push(tValue);
            }
        }


        var finalSql = '';

        socketVal_arr.forEach((x, i) => {
            finalSql += x;
        });
        finalSql = 'case ' + finalSql + ' else ' + tValue_else + ' end ';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
/**
 *     when
 */
class SqlNode_CW_When extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CW_WHEN, 'cw_when', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Boolean, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Scalar, inputable: true }));

        }
        else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == SqlVarType_Boolean) {
                    socket.type = SqlVarType_Boolean;
                    socket.inputable = false;
                }
                else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'else';
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);

        var first_socket = this.inputScokets_arr[0];
        var first_socketlinks = this.bluePrint.linkPool.getLinksBySocket(first_socket);
        if (first_socketlinks.length == 0) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '第一个输入不能为空']);
            return false;
        }
        var firstvalue = ''
        var firstLink = first_socketlinks[0];
        var firstoutNode = firstLink.outSocket.node;
        var firstcompileRet = firstoutNode.compile(helper, usePreNodes_arr);
        if (firstLink.outSocket.type != SqlVarType_Boolean) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle,
                nodeThis,
                helper.clickLogBadgeItemHandler),
                '应该输入一个boolean值']);
            return false;
        }
        if (firstcompileRet == false) {
            // child compile fail
            return false;
        }
        firstvalue = firstcompileRet.getSocketOut(firstLink.outSocket).strContent;
        if (!firstoutNode.outputIsSimpleValue()) {
            firstvalue = '' + firstvalue + '';
        }

        var finalSql = '';

        var socket = this.inputScokets_arr[1];
        var tValue = null;
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);

        if (tLinks.length == 0) {
            if (!IsEmptyString(socket.defval)) {
                tValue = socket.defval;// 判断手输入值
                if (isNaN(tValue)) {
                    tValue = singleQuotesStr(tValue);
                }
            }
            if (tValue == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    '不能有空输入']);
                return false;
            }
        } else {
            var theLink = tLinks[0];
            var outNode = theLink.outSocket.node;
            var compileRet = outNode.compile(helper, usePreNodes_arr);
            if (compileRet == false) {
                // child compile fail
                return false;
            }
            tValue = compileRet.getSocketOut(theLink.outSocket).strContent;
            if (!outNode.outputIsSimpleValue()) {
                tValue = '' + tValue + '';
            }
        }
        finalSql = 'when ' + firstvalue + ' then ' + tValue;
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, ' ' + finalSql);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;

    }
}
/**
 *  else
 */

class SqlNode_CW_Else extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_CW_ELSE, 'cw_else', false, nodeJson);
        autoBind(this);


        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }

        }//给出标量
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Scalar, inputable: true }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.type = SqlVarType_Scalar;
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'cw_else';
    }
    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue = null;
        if (tLinks.length == 0) {
            if (!IsEmptyString(theSocket.defval)) {
                tValue = theSocket.defval;// 判断手输入值
                if (isNaN(tValue)) {
                    tValue = singleQuotesStr(tValue);
                }
            }
            if (tValue == null) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle,
                    nodeThis,
                    helper.clickLogBadgeItemHandler),
                    'else条件不能有空输入']);
                return false;
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
        }
        var finalStr = tValue;
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }

}
class SqlNode_Aggregate extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_AGGREGATE, '聚合函数', false, nodeJson);
        autoBind(this);

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Scalar;
            }
        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Scalar });
            this.addSocket(this.outSocket);
        }
        this.insocketInitVal = {
            type: SqlVarType_Scalar,
            inputable: false,
        };
        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('in0', this, true, { type: SqlVarType_Scalar, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                socket.set(this.insocketInitVal);
            })
        }
        if (this.aggregate == null) {
            this.aggregate = 'count';
        }
    }

    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.aggregate = this.aggregate;
        return rlt;
    }

    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['aggregate']);
    }

    getNodeTitle() {
        return this.aggregate;
    }

    compile(helper, preNodes_arr) { //preNodes_arr 前面的节点
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var belongSelectNode = null;
        for (var i = preNodes_arr.length - 1; i >= 0; i--) {
            if (preNodes_arr[i].type == SQLNODE_SELECT) {
                belongSelectNode = preNodes_arr[i];
                break;
            }
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if (belongSelectNode == null) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                thisNodeTitle
                , nodeThis
                , helper.clickLogBadgeItemHandler)
                , '没有找到归属select节点']);
            return false;
        }
        var usePreNodes_arr = preNodes_arr.concat(this);
        var theSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
        var tValue = null;
        if (tLinks.length == 0) {
            if (this.aggregate != 'count') {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入接口没有值']);
                return false;
            }
            else {
                tValue = '*';
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
        }
        if(helper[belongSelectNode.id + '_complingSocket_complingSocket'] != null)
        {
            if (helper[belongSelectNode.id + '_complingSocket_isolated'] == true) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '不能和独立列一起使用']);
                return false;
            }
        }
        helper[belongSelectNode.id + '_complingSocket_isolated'] = false;
        var finalStr = this.aggregate + '(' + tValue + ')';
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr);
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Ret_Having extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_HAVING, 'having', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        if (nodeJson) {
            if (this.inputScokets_arr.length > 0) {
                this.inSocket = this.inputScokets_arr[0];
                this.inSocket.inputable = false;
                this.inSocket.type = SqlVarType_Boolean;
            }
        }
        if (this.inSocket == null) {
            this.inSocket = new NodeSocket('in', this, true, { type: SqlVarType_Boolean, inputable: false });
            this.addSocket(this.inSocket);
        }
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var selfCompileRet = new CompileResult(this);
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(this.inSocket);
        if (tLinks.length > 0) {
            var link = tLinks[0];
            var outNode = link.outSocket.node;
            var tCompileRet = outNode.compile(helper, preNodes_arr);
            if (tCompileRet == false) {
                return false;
            }
            selfCompileRet.setDirectOut(tCompileRet.getSocketOut(link.outSocket).strContent);
        }
        else {
            selfCompileRet.setDirectOut('');
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}
// union
class SqlNode_Union extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLDEF_UNION, 'union', false, nodeJson);
        autoBind(this);

        if (this.unionType == null) {
            this.unionType = 'union';
        }

        if (nodeJson) {
            if (this.outputScokets_arr.length > 0) {
                this.outSocket = this.outputScokets_arr[0];
                this.outSocket.type = SqlVarType_Table;
            }

        }
        if (this.outSocket == null) {
            this.outSocket = new NodeSocket('out', this, false, { type: SqlVarType_Table });
            this.addSocket(this.outSocket);
        }

        if (this.inputScokets_arr.length == 0) {
            this.addSocket(new NodeSocket('input1', this, true, { type: SqlVarType_Table, inputable: false }));
            this.addSocket(new NodeSocket('input2', this, true, { type: SqlVarType_Table, inputable: false }));
        }
        else {
            this.inputScokets_arr.forEach(socket => {
                if (socket.type == SqlVarType_Table) {
                    socket.type = SqlVarType_Table;
                    socket.inputable = false;
                }
                else if (socket.type == SqlVarType_Scalar) {
                    socket.type = SqlVarType_Scalar;
                }
            });
        }

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Table, inputable: false });
    }
    requestSaveAttrs() {
        var rlt = super.requestSaveAttrs();
        rlt.unionType = this.unionType;
        return rlt;
    }
    restorFromAttrs(attrsJson) {
        assginObjByProperties(this, attrsJson, ['unionType']);
    }
    customSocketRender(socket) {
        return null;
    }
    getNodeTitle() {
        return 'union';
    }

    getContext(finder, depth) {
        var firstSocket = this.inputScokets_arr[0];
        var tLinks = this.bluePrint.linkPool.getLinksBySocket(firstSocket);
        if (tLinks.length == 0) {
            return;
        }
        var temLink = tLinks[0];
        var outNode = temLink.outSocket.node;
        if (outNode.type != SQLNODE_SELECT) {
            return;
        }
        return outNode.getContext(finder, depth + 1);
    }

    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        var usePreNodes_arr = preNodes_arr.concat(this);
        var socketVal_arr = [];

        var colName_number = null;
        var firstColumname_arr = [];

        for (var i = 0; i < this.inputScokets_arr.length; ++i) {
            var theSocket = this.inputScokets_arr[i];
            var tLinks = this.bluePrint.linkPool.getLinksBySocket(theSocket);
            var tValue = null;
            if (tLinks.length == 0) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入不能为空']);
                return false;
            }
            else {
                var link = tLinks[0];
                var outNode = link.outSocket.node;
                var compileRet = outNode.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                tValue = compileRet.getSocketOut(link.outSocket).strContent;
                var column_name_arr = compileRet.getSocketOut(link.outSocket).data.columnsName_arr;
                if (i == 0) {
                    firstColumname_arr = column_name_arr;
                }
                if (column_name_arr.length != colName_number && colName_number != null) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '输入列出现不相同数目']);
                    return false;
                }
                colName_number = column_name_arr.length
            }
            socketVal_arr.push(tValue);
        }
        var theoutsocket = this.outputScokets_arr[0]
        var outLinks = this.bluePrint.linkPool.getLinksBySocket(theoutsocket);
        if (outLinks.length != 0) {
            var inNode = outLinks[0].inSocket.node;
            var inSocketype = inNode.type;
            if (inSocketype != SQLNODE_SELECT) {
                helper.logManager.errorEx([helper.logManager.createBadgeItem(
                    thisNodeTitle
                    , nodeThis
                    , helper.clickLogBadgeItemHandler)
                    , '输入连接必须是select节点']);
                return false;
            }
        }
        var finalStr = '';
        socketVal_arr.forEach((x, i) => {
            finalStr += (i == 0 ? '' : ' ' + nodeThis.unionType + ' ') + x;
        });
        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket, finalStr, { columnsName_arr: firstColumname_arr });
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

class SqlNode_Ret_Group extends SqlNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, SQLNODE_RET_GROUP, 'group', false, nodeJson);
        autoBind(this);
        this.isConstNode = true;

        this.inputScokets_arr.forEach(socket => {
            socket.inputable = false;
        });

    }



    genInSocket() {
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName('in' + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, { type: SqlVarType_Scalar, inputable: false });
    }




    compile(helper, preNodes_arr) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }
        var groupColumns_arr = [];
        var selfCompileRet = new CompileResult(this);
        if (this.inputScokets_arr.length > 0) {
            var nodeThis = this;
            var thisNodeTitle = nodeThis.getNodeTitle();
            var usePreNodes_arr = preNodes_arr.concat(this);
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var socket = this.inputScokets_arr[i];
                var tLinks = this.bluePrint.linkPool.getLinksBySocket(socket);
                if (tLinks.length == 0) {
                    helper.logManager.errorEx([helper.logManager.createBadgeItem(
                        thisNodeTitle
                        , nodeThis
                        , helper.clickLogBadgeItemHandler)
                        , '有空输入']);
                    return false;
                }
                var link = tLinks[0];
                var compileRet = link.outSocket.node.compile(helper, usePreNodes_arr);
                if (compileRet == false) {
                    return false;
                }
                var compileData = compileRet.getSocketOut(link.outSocket);
                groupColumns_arr.push(compileData.strContent);
            }
            var strContent = '';
            groupColumns_arr.forEach((x, i) => { strContent += (i == 0 ? '' : ',') + x });
            selfCompileRet.setDirectOut(strContent, { groupColumns_arr: groupColumns_arr });
        }
        else {
            selfCompileRet.setDirectOut('', { groupColumns_arr: groupColumns_arr });
        }
        helper.setCompileRetCache(this, selfCompileRet);
        return selfCompileRet;
    }
}

SqlNodeClassMap[SQLNODE_DBENTITY] = {
    modelClass: SqlNode_DBEntity,
    comClass: C_SqlNode_DBEntity,
};
SqlNodeClassMap[SQLNODE_SELECT] = {
    modelClass: SqlNode_Select,
    comClass: C_SqlNode_Select,
};
SqlNodeClassMap[SQLNODE_VAR_GET] = {
    modelClass: SqlNode_Var_Get,
    comClass: C_SqlNode_Var_Get,
};
SqlNodeClassMap[SQLNODE_VAR_SET] = {
    modelClass: SqlNode_Var_Set,
    comClass: C_SqlNode_Var_Set,
};
SqlNodeClassMap[SQLNODE_NOPERAND] = {
    modelClass: SqlNode_NOperand,
    comClass: C_SqlNode_NOperand,
};
SqlNodeClassMap[SQLNODE_COLUMN] = {
    modelClass: SqlNode_Column,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_XJOIN] = {
    modelClass: SqlNode_XJoin,
    comClass: C_SqlNode_XJoin,
};
SqlNodeClassMap[SQLNODE_DBENTITY_COLUMNSELECTOR] = {
    modelClass: SqlNode_DBEntity_ColumnSelector,
    comClass: C_SqlNode_DBEntity_ColumnSelector,
};
SqlNodeClassMap[SQLNODE_RET_CONDITION] = {
    modelClass: SqlNode_Ret_Condition,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_RET_COLUMNS] = {
    modelClass: SqlNode_Ret_Columns,
    comClass: C_SqlNode_Ret_Columns,
};
SqlNodeClassMap[SQLNODE_RET_ORDER] = {
    modelClass: SqlNode_Ret_Order,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CONSTVALUE] = {
    modelClass: SqlNode_ConstValue,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_COMPARE] = {
    modelClass: SqlNode_Compare,
    comClass: C_SqlNode_Compare,
};
SqlNodeClassMap[SQLNODE_ROWNUMBER] = {
    modelClass: SqlNode_RowNumber,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_ISNULL] = {
    modelClass: SqlNode_IsNullFun,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_ISNULLOPERATOR] = {
    modelClass: SqlNode_IsNullOperator,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_BETWEEN] = {
    modelClass: SqlNode_BetWeen,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CAST] = {
    modelClass: SqlNode_Cast,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_GETDATE] = {
    modelClass: SqlNode_Getdate,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_LOGICAL_OPERATOR] = {
    modelClass: SqlNode_Logical_Operator,
    comClass: C_SqlNode_Logical_Operator,
};
SqlNodeClassMap[SQLNODE_LOGICAL_NOT] = {
    modelClass: SqlNode_Logical_Not,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_IN_OPERATOR] = {
    modelClass: SqlNode_In_Operator,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_TOSTRING] = {
    modelClass: SqlNode_ToString,
    comClass: C_SqlNode_SimpleNode,
}
SqlNodeClassMap[SQLNODE_EXISTS] = {
    modelClass: SqlNode_Exists,
    comClass: C_SqlNode_Exists,
};
SqlNodeClassMap[SQLNODE_CASE_WHEN] = {
    modelClass: SqlNode_Case_When,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_WHEN] = {
    modelClass: SqlNode_CW_When,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_ELSE] = {
    modelClass: SqlNode_CW_Else,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_LIKE] = {
    modelClass: SqlNode_Like,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_RET_GROUP] = {
    modelClass: SqlNode_Ret_Group,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_AGGREGATE] = {
    modelClass: SqlNode_Aggregate,
    comClass: C_SqlNode_Aggregate,
};
SqlNodeClassMap[SQLNODE_RET_HAVING] = {
    modelClass: SqlNode_Ret_Having,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLDEF_VAR] = {
    modelClass: SqlDef_Variable,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_DBENTITY] = {
    modelClass: SqlNode_DBEntity,
    comClass: C_SqlNode_DBEntity,
};
SqlNodeClassMap[SQLNODE_SELECT] = {
    modelClass: SqlNode_Select,
    comClass: C_SqlNode_Select,
};
SqlNodeClassMap[SQLNODE_VAR_GET] = {
    modelClass: SqlNode_Var_Get,
    comClass: C_SqlNode_Var_Get,
};
SqlNodeClassMap[SQLNODE_VAR_SET] = {
    modelClass: SqlNode_Var_Set,
    comClass: C_SqlNode_Var_Set,
};
SqlNodeClassMap[SQLNODE_NOPERAND] = {
    modelClass: SqlNode_NOperand,
    comClass: C_SqlNode_NOperand,
};
SqlNodeClassMap[SQLNODE_COLUMN] = {
    modelClass: SqlNode_Column,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_XJOIN] = {
    modelClass: SqlNode_XJoin,
    comClass: C_SqlNode_XJoin,
};
SqlNodeClassMap[SQLNODE_DBENTITY_COLUMNSELECTOR] = {
    modelClass: SqlNode_DBEntity_ColumnSelector,
    comClass: C_SqlNode_DBEntity_ColumnSelector,
};
SqlNodeClassMap[SQLNODE_RET_CONDITION] = {
    modelClass: SqlNode_Ret_Condition,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_RET_COLUMNS] = {
    modelClass: SqlNode_Ret_Columns,
    comClass: C_SqlNode_Ret_Columns,
};
SqlNodeClassMap[SQLNODE_RET_ORDER] = {
    modelClass: SqlNode_Ret_Order,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CONSTVALUE] = {
    modelClass: SqlNode_ConstValue,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_COMPARE] = {
    modelClass: SqlNode_Compare,
    comClass: C_SqlNode_Compare,
};
SqlNodeClassMap[SQLNODE_ROWNUMBER] = {
    modelClass: SqlNode_RowNumber,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_ISNULL] = {
    modelClass: SqlNode_IsNullFun,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_ISNULLOPERATOR] = {
    modelClass: SqlNode_IsNullOperator,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_BETWEEN] = {
    modelClass: SqlNode_BetWeen,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CAST] = {
    modelClass: SqlNode_Cast,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_GETDATE] = {
    modelClass: SqlNode_Getdate,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_LOGICAL_OPERATOR] = {
    modelClass: SqlNode_Logical_Operator,
    comClass: C_SqlNode_Logical_Operator,
};
SqlNodeClassMap[SQLNODE_LOGICAL_NOT] = {
    modelClass: SqlNode_Logical_Not,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_IN_OPERATOR] = {
    modelClass: SqlNode_In_Operator,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_TOSTRING] = {
    modelClass: SqlNode_ToString,
    comClass: C_SqlNode_SimpleNode,
}
SqlNodeClassMap[SQLNODE_EXISTS] = {
    modelClass: SqlNode_Exists,
    comClass: C_SqlNode_Exists,
};
SqlNodeClassMap[SQLNODE_CASE_WHEN] = {
    modelClass: SqlNode_Case_When,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_WHEN] = {
    modelClass: SqlNode_CW_When,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_CW_ELSE] = {
    modelClass: SqlNode_CW_Else,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_LIKE] = {
    modelClass: SqlNode_Like,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLDEF_UNION] = {
    modelClass: SqlNode_Union,
    comClass: C_SqlNode_Union,
};
SqlNodeClassMap[SQLNODE_RET_GROUP] = {
    modelClass: SqlNode_Ret_Group,
    comClass: C_SqlNode_SimpleNode,
};
SqlNodeClassMap[SQLNODE_AGGREGATE] = {
    modelClass: SqlNode_Aggregate,
    comClass: C_SqlNode_Aggregate,
};


