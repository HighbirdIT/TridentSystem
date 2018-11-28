const SQLNODE_BDBENTITY = 'dbEntity';
const SQLNODE_SELECT = 'select';
const SQLNODE_VAR_GET = 'var_get';
const SQLNODE_VAR_SET = 'var_set';
const SQLNODE_NOPERAND = 'noperand';
const SQLNODE_COLUMN = 'column';
const SQLNODE_XJOIN = 'xjion';
const SQLNODE_DBENTITY_COLUMNSELECTOR = 'dbentity_columnselector';
const SQLNODE_RET_CONDITION = 'ret_condition';
const SQLNODE_RET_COLUMNS = 'ret_columns';
const SQLNODE_RET_ORDER = 'ret_order';

const SQLDEF_VAR = 'def_variable';

class SqlNode_BluePrint extends EventEmitter{
    constructor(initData){
        super();
        this.nodes_arr = [];
        this.vars_arr = [];
        this.links_arr = [];
        this.linkPool = new ScoketLinkPool(this);
        Object.assign(this, initData); 
        var self = this;
        var creationInfo={
            orginID_map:{},
            newID_map:{},
        };
        this.bluePrint = this;
        this.id = this.code;
        EnhanceEventEmiter(this);

        creationInfo.save=(initData, node)=>{
            if(initData.id){
                creationInfo.orginID_map[initData.id] = node;
            }
            creationInfo.newID_map[node.id] = node;
        }

        this.allNode_map={};
        this.nodes_arr=[];

        /*
        this.nodes_arr = this.nodes_arr.map((nodeData,i)=>{
            if(nodeData.type == SQLNODE_BDBENTITY){
                return new SqlNode_DBEntity(nodeData, self, creationInfo);
            }
            else{
                console.log('不支持的sql节点:' + nodeData.type);
                console.warn(nodeData);
            }
        });
        */
       this.finalSelectNode = new SqlNode_Select({title:'返回表'},this,creationInfo);
       this.finalSelectNode.removeSocket(this.finalSelectNode.outSocket);
       this.finalSelectNode.isConstNode = true;
    }

    preEditing(editor){
        // call pre enter Editing
    }

    postEditing(editor){
        // call leve eidting
    }

    getNodeParentList(theNode){
        var rlt = [];
        while(theNode.parent){
            rlt.unshift(theNode.parent);
            theNode = theNode.parent;
        } 

        return rlt;
    }

    getNodeTitle(){
        return this.name;
    }

    genNodeId(prefix){
        if(prefix == null){
            console.warn('genNodeId参数不能为空');
            return;
        }
        var testI = 0;
        while(testI < 9999){
            var testId = prefix + '_' + testI;
            if(this.allNode_map[testId] == null){
                break;
            }
            ++testI;
        }
        return prefix + '_' + testI;
    }

    registerNode(node, parentNode){
        if(node.type == SQLDEF_VAR){
            this.addVariable(node);// 变量需要注册到根节点中
            return;
        }
        if(parentNode == null){
            parentNode = this;
        }
        if(parentNode.nodes_arr == null){
            parentNode.nodes_arr = [];
        }
        var useNodes_arr = parentNode.nodes_arr;
        var useId = node.id;
        if(useId == null || (this.allNode_map[useId] && this.allNode_map[useId] != node)){
            useId = this.genNodeId(node.type);
        }
        if(useNodes_arr.indexOf(node) == -1){
            useNodes_arr.push(node);
        }
        node.parent = parentNode;
        node.id = useId;
        this.allNode_map[useId] = node;
        parentNode.fireChanged();
    }

    addVariable(varData){
        var foundVar = this.vars_arr.find(item=>{return item.name == varData.name});
        if(foundVar){
            return;
        }
        var useId = varData.id;
        if(useId == null){
            useId = this.genNodeId(varData.type);
            varData.id = useId;
        }
        varData.bluePrint = this;
        this.vars_arr.push(varData);
        this.fireEvent('varChanged');
    }

    getVariableByName(varName){
        return  this.vars_arr.find(item=>{return item.name == varName});
    }

    createEmptyVariable(){
        var varName;
        for(var i=0;i<999;++i){
            varName = '未命名_' + i;
            if(this.getVariableByName(varName) == null)
                break;
        }
        var rlt = new SqlDef_Variable(this,varName, SqlVarType_Int);
        rlt.needEdit = true;
        return rlt;
    }

    removeVariable(varData){
        var index = this.vars_arr.indexOf(varData);
        if(index != -1){
            this.vars_arr.splice(index, 1);
            varData.removed = true;
            this.fireEvent('varChanged');
            varData.emit('changed');
        }
    }

    deleteNode(node){
        if(node.isConstNode){
            return;
        }
        var useId = node.id;
        if(this.allNode_map[useId]){
            this.allNode_map[useId] = null;
            var index = node.parent.nodes_arr.indexOf(node);
            if(index != -1){
                node.parent.nodes_arr.splice(index, 1);
            }
            node.bluePrint = null;
            node.parent = null;
            this.linkPool.clearNodeLink(node);
            this.fireChanged();
        }
    }

    deleteNodes(nodes_arr){
        this.banEvent('changed');
        nodes_arr.forEach(node=>{this.deleteNode(node)});
        this.allowEvent('changed');
        this.fireChanged();
    }

    getNodeByID(id){
        if(id == this.id){
            return this;
        }
        return this.allNode_map[id];
    }

    getSocketById(socketID){
        var pos = socketID.indexOf('$');
        var nodeId = socketID.substr(0, pos);
        var theNode = getNodeByID(nodeId);
        if(theNode == null)
            return null;
        return theNode.sockets_map[socketID];
    }

    fireMoved(delay){
        this.fireEvent('moved', delay);
    }

    fireChanged(delay){
        this.fireEvent('changed', delay);
    }

    getJson(){
        var self = this;
        // save base info
        var theJson={
            code:self.id,
            retNodeId:this.finalSelectNode.id,
            name:name,
        }
        if(this.editorLeft){
            theJson.editorLeft = this.editorLeft;
        }
        if(this.editorTop){
            theJson.editorTop = this.editorTop;
        }
        // save var info
        var varJson_arr=[];
        this.vars_arr.forEach(varData=>{
            varJson_arr.push(varData.getJson());
        });
        if(varJson_arr.length > 0){
            theJson.variables_arr = varJson_arr;
        }

        if(this.nodes_arr.length > 0){
            var nodeJson_arr=[];
            this.nodes_arr.forEach(nodeData=>{
                nodeJson_arr.push(nodeData.getJson());
            });
            theJson.nodes_arr = nodeJson_arr;
        }

        return theJson;
    }

    compile(compilHelper){
        compilHelper.logManager.log("开始编译[" + this.name + ']');
        var ret = this.finalSelectNode.compile(compilHelper,[]);
        compilHelper.logManager.log('[' + this.name + ']编译' + (ret ? '成功' : '失败'));
    }
}


class SqlNode_Base extends EventEmitter{
    constructor(initData, parentNode, creationInfo, type, label, isContainer){
        super();
        this.bluePrint = parentNode.bluePrint;
        Object.assign(this, initData);
        EnhanceEventEmiter(this);
        this.label = label;
        if(this.type == null)
            this.type = type;
        if(this.left == null)
            this.left = 0;
        if(this.top == null)
            this.top = 0;
            
        this.hadFlow = false;

        this.bluePrint.registerNode(this, parentNode);

        if(creationInfo)
        {
            creationInfo.save(initData, this);
        }

        this.sockets_map = {};
        this.inputScokets_arr = [];
        this.outputScokets_arr = [];
        if(isContainer)
        {
            this.nodes_arr = [];
            this.isContainer = true;
        }

        this.processInputSockets = this.processInputSockets.bind(this);
        this.processOutSockets = this.processOutSockets.bind(this);
        this.frameButtons_arr = [];
    }

    clickFrameButton(btnName){
        console.log('clickFrameButton:' + btnName);
        switch(btnName){
            case FrameButton_LineSocket:
            {
                var links = this.bluePrint.linkPool.getLinksByNode(this, 'i');
                links.forEach(link=>{
                    link.straightOut(-150);
                });
            }
            break;
            case FrameButton_ClearEmptySocket:
            {
                var removeCount = 0;
                for(var si=this.inputScokets_arr.length - 1;si>=this.minInSocketCount && this.inputScokets_arr.length > 0;--si){
                    var socket = this.inputScokets_arr[si];
                    if(this.bluePrint.linkPool.getLinksBySocket(socket).length == 0){
                        this.removeSocket(socket);
                        ++removeCount;
                    }
                }
                if(removeCount > 0){
                    this.fireEvent(Event_SocketNumChanged);
                    this.fireMoved(10);
                }
            }
            break;
            case 'fresh':
            {
                if(this.currentComponent){
                    this.currentComponent.reDraw();
                }
            }
        }
        return false;
    }

    addFrameButton(name, label){
        this.frameButtons_arr.push({name:name,label:label});
    }

    linkRemoved(link){

    }

    linkAdded(link){
        
    }

    preEditing(editor){
        // call pre enter Editing
    }

    postEditing(editor){
        // call leve eidting
    }

    getRect(){
        if(this.currentFrameCom == null)
            return null;
        var frameRootDiv = this.currentFrameCom.rootDivRef.current;
        if(frameRootDiv == null)
            return null;
        var bcr = frameRootDiv.getBoundingClientRect();
        return {
            left:this.left,
            top:this.top,
            right:this.left + bcr.width,
            bottom:this.top + bcr.height,
            width:bcr.width,
            height:bcr.height,
        }
    }

    getNodeTitle(){
        return this.label + (this.title == null ? '' : ':' + this.title);
    }

    getScoketByName(name, isIn){
        if(isIn == null)
            isIn = '*';
        var rlt = null;
        if(isIn != false){
            rlt = this.inputScokets_arr.find(x=>{return x.name == name});
        }

        if(rlt == null && isIn != true){
            rlt = this.outputScokets_arr.find(x=>{return x.name == name});
        }
        return rlt;
    }

    addSocket(socketObj){
        this.sockets_map[socketObj.id] = socketObj;
        if(socketObj.isIn){
            this.inputScokets_arr.push(socketObj);
        }
        else{
            this.outputScokets_arr.push(socketObj);
        }
    }

    removeSocket(socketObj){
        if(socketObj.isIn){
            removeElemFrommArray(this.inputScokets_arr, socketObj);
        }
        else{
            removeElemFrommArray(this.outputScokets_arr, socketObj);
        }
        this.sockets_map[socketObj.id] = null;
        this.bluePrint.linkPool.clearSocketLink(socketObj);
    }

    getSocketById(socketID){
        return this.sockets_map[socketID];
    }

    setPos(newx, newy){
        this.left = newx;
        this.top = newy;
        this.fireMoved();
    }

    fireMoved(delay){
        this.fireEvent('moved', delay);
    }

    fireChanged(delay){
        this.fireEvent('changed', delay);
    }

    getContext(finder,depth){
        if(depth == null){
            depth = 0;
        }
        finder.setTest(this.id);
        var inlinks = this.bluePrint.linkPool.getLinksByNode(this, 'i');
        for(var i in inlinks){
            var tLink = inlinks[i];
            var outNode = tLink.outSocket.node;
            if(!finder.isTest(outNode.id))
            {
                outNode.getContext(finder,depth + 1);
            }
        }
    }

    isInScoketDynamic(){
        return this.genInSocket != null;
    }

    isOutScoketDynamic(){
        return this.genOutSocket != null;
    }

    processInputSockets(isPlus){
        if(this.minInSocketCount == null){
            this.minInSocketCount = 0;
        }
        var retSocket = null;
        if(isPlus){
            retSocket = this.genInSocket();
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else{
            if(this.inputScokets_arr.length > this.minInSocketCount){
                var needRemoveSocket = this.inputScokets_arr[this.inputScokets_arr.length - 1];
                this.removeSocket(needRemoveSocket);
                this.fireEvent(Event_SocketNumChanged);
                retSocket = needRemoveSocket;
            }
        }
        return retSocket;
    }

    processOutSockets(isPlus){
        if(this.minOutSocketCount == null){
            this.minOutSocketCount = 0;
        }
        var retSocket = null;
        if(isPlus){
            retSocket = this.genOutSocket();
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else{
            if(this.outputScokets_arr.length > this.minOutSocketCount){
                var needRemoveSocket = this.outputScokets_arr[this.outputScokets_arr.length - 1];
                this.removeSocket(needRemoveSocket);
                this.fireEvent(Event_SocketNumChanged);
                retSocket = needRemoveSocket;
            }
        }
        return retSocket;
    }

    // can custom socket component
    customSocketRender(socket){
        return null;
    }

    requestSaveAttrs(){
        var rlt = {
            id:this.id,
            type:this.type,
        };
        if(!IsEmptyString(this.title)){
            rlt.title = this.title;
        }
        if(this.extra != null){
            rlt.extra = this.extra;
        }
        if(this.editorLeft){
            rlt.editorLeft = this.editorLeft;
        }
        if(this.editorTop){
            rlt.editorTop = this.editorTop;
        }
        return rlt;
    }

    getExtra(key,def){
        if(this.extra == null){
            return def;
        }
        return this.extra[key] == null ? def : this.extra[key];
    }

    setExtra(key, val){
        if(this.extra == null){
            this.extra = {};
        }
        this.extra[key] = val;
    }

    getJson(){
        var attrs = this.requestSaveAttrs();
        if(attrs == null){
            return null;
        }
        var rlt = {};
        for(var pname in attrs){
            var pval = attrs[pname];
            if(pval == null){
                continue;
            }
            var pValType = typeof(pval);
            var stringVal = null;
            switch(pValType){
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
        if(this.inputScokets_arr.length > 0){
            var t_insocketJson_arr = [];
            this.inputScokets_arr.forEach(data=>{
                t_insocketJson_arr.push(data.getJson());
            });
            rlt.inputScokets_arr = t_insocketJson_arr;
        }
        if(this.outputScokets_arr.length > 0){
            var t_outsocketJson_arr = [];
            this.outputScokets_arr.forEach(data=>{
                t_outsocketJson_arr.push(data.getJson());
            });
            rlt.outputScokets_arr = t_outsocketJson_arr;
        }
        // child node
        if(this.nodes_arr && this.nodes_arr.length>0){
            var tNode_arr = [];
            this.nodes_arr.forEach(childNode=>{
                var childJson = childNode.getJson();
                if(childJson){
                    tNode_arr.push(childJson);
                }
            });
            rlt.nodes_arr = tNode_arr;
        }

        return rlt;
    }

    compile(compilHelper, preNodes_arr){
        
    }
}

class SqlDef_Variable extends SqlNode_Base{
    constructor(bluePrint,name,valType,size_1,size_2){
        super({
                name:name,
                valType:valType,
                size_1:isNaN(size_1) ? 0 : parseInt(size_1),
                size_2:isNaN(size_2) ? 0 : parseInt(size_2),
                isParam:0,
        }, bluePrint, null, SQLDEF_VAR, '变量');
        autoBind(this);
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.name = this.name;
        rlt.valType = this.valType;
        rlt.size_1 = this.size_1;
        rlt.size_2 = this.size_2;
        rlt.isParam = this.isParam;
        return rlt;
    }

    setProp(data){
        if(data.name != null){
            this.name = data.name;
        }
        if(data.valType != null){
            this.valType = data.valType;
        }
        if(data.size_1 != null){
            this.size_1 = isNaN(data.size_1) ? 0 : parseInt(data.size_1);
        }
        if(data.size_2 != null){
            this.size_2 = isNaN(data.size_2) ? 0 : parseInt(data.size_2);
        }
        if(data.isParam != null){
            this.isParam = data.isParam;
        }
        if(data.editing != null){
            this.needEdit = data.editing;
        }
        this.fireChanged();
    }

    toString(){
        var attrs = this;
        var rlt = (attrs.isParam ? '@' : '') + attrs.name + '  ' + attrs.valType;
        switch(attrs.valType){
            case SqlVarType_NVarchar:
                rlt += '(' + attrs.size_1 + ')';
                break;
            case SqlVarType_Decimal:
                rlt += '(' + attrs.size_1 + ',' + attrs.size_2 + ')';
                break;
        }

        return rlt;
    }

    getLabel(){
        return (this.isParam ? '@' : '') + this.name;
    }

    getValType(){
        return this.valType;
    }
}

class SqlNode_DBEntity extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_BDBENTITY, '数据源');
        autoBind(this);

        this.outSocket = new NodeSocket('out', this, false, {type:SqlVarType_Table});
        this.addSocket(this.outSocket);

        if(this.targetEntity != null){
            var tem_arr = this.targetEntity.split('-');
            if(tem_arr[0] == 'dbe'){
                this.targetEntity = g_dataBase.getEntityByCode(tem_arr[1]);
                this.targetEntity.on('syned', this.entitySynedHandler);
                //console.log(this.targetEntity);
            }
            else{
                this.targetEntity = null;
            }
        }

        var self = this;
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        if(this.targetEntity != null){
            rlt.targetEntity = 'dbe-' + this.targetEntity.code;
        }
        return rlt;
    }

    entitySynedHandler(){
        var entity = this.targetEntity;
        if(entity && entity.loaded){
            var paramCount = entity.params.length;
            this.inputScokets_arr.forEach(item=>{
                item._validparam = false;
            });
            var hadChanged = false;
            entity.params.forEach(param=>{
                var theSocket = this.getScoketByName(param.name);
                if(theSocket == null){
                    this.addSocket(new NodeSocket(param.name, this, true, {type:SqlVarType_Scalar,label:param.name}));
                    hadChanged = true;
                }
            });
            for(var si=0;si<this.inputScokets_arr.length;++si){
                var theSocket = this.inputScokets_arr[si];
                if(theSocket._validparam == false){
                    this.removeSocket(theSocket);
                    --si;
                    hadChanged = true;
                }
            }
            if(hadChanged){
                this.fireEvent(Event_SocketNumChanged, 20);
                this.bluePrint.fireChanged();
            }
        }

        this.fireChanged();
        this.fireMoved(10);
    }

    setEntity(entity){
        if(this.targetEntity == entity)
            return;
        if(this.targetEntity != null){
            this.targetEntity.off('syned', this.entitySynedHandler);
        }
        this.targetEntity = entity;
        if(entity){
            entity.on('syned', this.entitySynedHandler);
        }
        this.entitySynedHandler();
    }

    getContext(finder){
        finder.setTest(this.id);
        if(this.targetEntity == null){
            return;
        }
        if(finder.type == ContextType_DBEntity){
            var theLabel = this.title;
            if(IsEmptyString(theLabel)){
                theLabel = this.targetEntity.loaded ? this.targetEntity.name : this.targetEntity.code;
            }
            finder.addItem(theLabel,this.targetEntity);
        }
    }
}

class SqlNode_XJoin extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_XJOIN, 'Join', true);
        autoBind(this);

        if(this.joinType == null){
            this.joinType = JoinType_Inner;
        }

        this.conditionNode = new SqlNode_Ret_Condition({left:100,top:0},this,creationInfo);
        this.conditionNode.label = 'ON';

        this.outSocket = new NodeSocket('out', this, false, {type:SqlVarType_Table});
        this.addSocket(this.outSocket);

        this.addSocket(new NodeSocket('in0', this, true, {type:SqlVarType_Table}));
        this.addSocket(new NodeSocket('in1', this, true, {type:SqlVarType_Table}));

        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.joinType = this.joinType;
        return rlt;
    }

    preEditing(editor){
        var cFinder = new ContextFinder(ContextType_DBEntity);
        this.getContext(cFinder);
        this.contextEntities_arr = cFinder.item_arr;
        for(var i in this.entityNodes_arr){
            this.entityNodes_arr[i].valid = false;
        }
        for(var i =0; i<this.contextEntities_arr.length; ++i){
            var contextEntity = this.contextEntities_arr[i];
            var theNode = this.entityNodes_arr.find(x=>{return x.label == contextEntity.label});
            if(theNode == null){
                theNode = new SqlNode_DBEntity_ColumnSelector({left:(i+1)*-200}, this, null);
                theNode.setEntity(contextEntity.label, contextEntity.data);
                this.entityNodes_arr.push(theNode);
            }
            theNode.valid = true;
        }
        this.bluePrint.banEvent('changed');
        for(var i=0;i<this.entityNodes_arr.length;++i){
            var tNode = this.entityNodes_arr[i];
            if(!tNode.valid){
                this.entityNodes_arr.splice(i, 1);
                --i;
                tNode.isConstNode = false;
                this.bluePrint.deleteNode(tNode);
            }
        }
        this.bluePrint.allowEvent('changed');
    }

    addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn){
        return new SqlNode_Column({tableCode:tableCode,
                                   tableAlias:tableAlias,
                                   tableName:tableName,
                                   columnName:columnName,
                                   cvalType:cvalType,
                                   left:x,
                                   top:y,
                                   newborn:newborn}, this, null);
    }
}

class SqlNode_Column extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_COLUMN, '列', false);
        autoBind(this);

        //this.label = this.tableName + '.' + this.columnName;
        this.headType = 'empty';
        this.outSocket = new NodeSocket('out', this, false,{type:this.cvalType,label:this.getSocketLabel()});
        this.addSocket(this.outSocket);

        this.scoketNameMoveable = true;
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.tableAlias = this.tableAlias;
        rlt.tableName = this.tableName;
        rlt.columnName = this.columnName;
        rlt.tableCode = this.tableCode;
        return rlt;
    }

    getNodeTitle(){
        return '列:' + this.getSocketLabel();
    }

    getSocketLabel(){
        return (this.tableAlias == null ? this.tableName : this.tableAlias) + '.' + this.columnName;
    }

    getCompareKey(){
        return (this.tableAlias == null ? this.tableCode : this.tableAlias) + '.' + this.columnName;
    }
}

class SqlNode_DBEntity_ColumnSelector extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_DBENTITY_COLUMNSELECTOR, '实体', false);
        autoBind(this);
        this.isConstNode = true;

        var bCanSlect = parentNode.isSelectColumn != null;
        if(bCanSlect)
        {
            this.addFrameButton('select-all', '全选');
            this.addFrameButton('unselect-all', '全不选');
            this.addFrameButton('fresh', '刷新');
        }
    }

    requestSaveAttrs(){
        // 临时节点不需保存
        return null;
    }

    clickFrameButton(btnName){
        if(super.clickFrameButton(btnName)){
            return;
        }
        switch(btnName){
            case 'select-all':
            {
                var entity = this.entity;
                for(var si in this.entity.columns){
                    var theColumn = this.entity.columns[si];
                    this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, true);
                }
                break;
            }
            case 'unselect-all':
            {
                var entity = this.entity;
                for(var si in this.entity.columns){
                    var theColumn = this.entity.columns[si];
                    this.parent.columnCheckChanged(entity.code, this.alias, entity.name, theColumn.name, theColumn.cvalType, false);
                }
                break;
            }
        }
        return false;
    }

    entitySynedHandler(){
        this.fireChanged();
    }

    setEntity(label, target){
        this.entity = target;
        if(label == target.name){
            this.alias = null;
        }
        else{
            this.alias = label;
        }
        this.label = label;
        if(target.on != null){
            target.on('syned', this.entitySynedHandler);
        }
    }
}

class SqlNode_Select extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_SELECT, '选择', true);
        autoBind(this);
        this.inSocket = new NodeSocket('in', this, true, {type:SqlVarType_Table});
        this.addSocket(this.inSocket);
        this.outSocket = new NodeSocket('out', this, false, {type:SqlVarType_Table});
        this.addSocket(this.outSocket);
        if(IsEmptyString(this.title)){
            this.title = '未命名';
        }

        this.columnNode = new SqlNode_Ret_Columns({left:100,top:0}, this, creationInfo);
        this.conditionNode = new SqlNode_Ret_Condition({left:250,top:0},this,creationInfo);
        this.orderNode = new SqlNode_Ret_Order({left:400,top:0},this,creationInfo);

        if(this.columns_arr == null){
            this.columns_arr = [];
        }
        if(this.orderColumns_arr == null){
            this.orderColumns_arr = [];
        }
        this.contextEntities_arr = [];
        this.entityNodes_arr = [];
        this.autoCreateHelper = {};
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.name = this.name;
        rlt.valType = this.valType;
        rlt.size_1 = this.size_1;
        rlt.size_2 = this.size_2;
        rlt.isParam = this.isParam;
        return rlt;
    }

    getContext(finder,depth){
        finder.setTest(this.id);
        if(depth == null){
            depth = 0;
        }
        if(depth == 0){
            return super.getContext(finder, 1);
        }
        // 其他情况下只返回自身即可
        var retLinks = this.bluePrint.linkPool.getLinksByNode(this.columnNode, 'i');
        if(retLinks.length == 0){
            return;
        }
        var temEntity = {
            code:this.id,
            name:'temp',
            columns:[]
        };
        for(var i in retLinks){
            var link = retLinks[i];
            var theSocket = link.inSocket;
            var colName = theSocket.getExtra('alias');
            var cvalType = SqlVarType_NVarchar;
            if(IsEmptyString(colName)){
                if(link.outSocket.node.type == SQLNODE_COLUMN){
                    colName = link.outSocket.node.columnName;
                    cvalType = link.outSocket.node.cvalType;
                }
            }
            if(!IsEmptyString(colName)){
                temEntity.columns.push({name:colName,cvalType:cvalType});
            }
        }
        finder.addItem(this.title,temEntity);
    }

    preEditing(editor){
        var cFinder = new ContextFinder(ContextType_DBEntity);
        this.getContext(cFinder);
        this.contextEntities_arr = cFinder.item_arr;
        for(var i in this.entityNodes_arr){
            this.entityNodes_arr[i].valid = false;
        }
        for(var i in this.contextEntities_arr){
            var contextEntity = this.contextEntities_arr[i];
            var theNode = this.entityNodes_arr.find(x=>{return x.label == contextEntity.label});
            if(theNode == null){
                theNode = new SqlNode_DBEntity_ColumnSelector({left:(i+1)*-200}, this, null);
                theNode.setEntity(contextEntity.label, contextEntity.data);
                this.entityNodes_arr.push(theNode);
            }
            theNode.valid = true;
        }
        this.bluePrint.banEvent('changed');
        for(var i=0;i<this.entityNodes_arr.length;++i){
            var tNode = this.entityNodes_arr[i];
            if(!tNode.valid){
                this.entityNodes_arr.splice(i, 1);
                --i;
                tNode.isConstNode = false;
                this.bluePrint.deleteNode(tNode);
            }
        }
        this.bluePrint.allowEvent('changed');
    }

    postEditing(editor){
        var colSockets = this.columnNode.inputScokets_arr;
        var newColumns_arr = [];
        var temMap = {};
        for(var i in colSockets){
            var socket = colSockets[i];
            var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
            var colNode = null;
            if(tlinks.length > 0){
                var theLink = tlinks[0];
                if(theLink.outSocket.node.type == SQLNODE_COLUMN){
                    colNode = theLink.outSocket.node;
                }
            }
            var colName = socket.getExtra('alias');
            var cvalType = colNode ? colNode.cvalType : SqlVarType_NVarchar;
            if(IsEmptyString(colName) && colNode){
                colName = colNode.columnName;
            }
            if(!IsEmptyString(colName)){
                if(temMap[colName] == null){
                    newColumns_arr.push({name:colName,cvalType:cvalType});
                    temMap[colName] = 1;
                }
            }
        }
        this.columns_arr = newColumns_arr;

        var orderBySockets = this.orderNode.inputScokets_arr;
        var newOrderByColumns_arr = [];
        temMap = {};
        for(var i in orderBySockets){
            var socket = orderBySockets[i];
            var tlinks = this.bluePrint.linkPool.getLinksBySocket(socket);
            var colNode = null;
            if(tlinks.length > 0){
                var theLink = tlinks[0];
                if(theLink.outSocket.node.type == SQLNODE_COLUMN){
                    colNode = theLink.outSocket.node;
                }
            }
            if(colNode){
                newOrderByColumns_arr.push({name:colNode.columnName,orderType:socket.getExtra('orderType', '')});;
            }
        }

        this.orderColumns_arr = newOrderByColumns_arr;
    }

    isSelectColumn(compareKey){
        return this.getSelectColumnLink(compareKey) != null;
    }

    getSelectColumnLink(compareKey){
        if(this.autoCreateHelper[compareKey + '_creating']){
            return true;
        }
        var columnNode = this.columnNode;
        for(var i in columnNode.inputScokets_arr){
            var inSocket = columnNode.inputScokets_arr[i];
            var links_arr = this.bluePrint.linkPool.getLinksBySocket(inSocket);
            if(links_arr.length > 0){
                var link = links_arr[0];
                var outNode = link.outSocket.node;
                if(outNode.type == SQLNODE_COLUMN){
                    if(compareKey == outNode.getCompareKey()){
                        return link;
                    }
                }
            }
        }
        return null;
    }

    addNewColumn(tableCode, tableAlias, tableName, columnName, cvalType, x, y, newborn){
        return new SqlNode_Column({tableCode:tableCode,
                                   tableAlias:tableAlias,
                                   tableName:tableName,
                                   columnName:columnName,
                                   cvalType:cvalType,
                                   left:x,
                                   top:y,
                                   newborn:newborn}, this, null);
    }

    columnCheckChanged(tableCode, tableAlias, tableName, columnName, cvalType, isCheck){
        var compareKey = (tableAlias == null ? tableCode : tableAlias) + '.' + columnName;
        var theLink = this.getSelectColumnLink(compareKey);
        if(isCheck){
            // 加入
            if(theLink != null){
                return false;
            }
            var newSocket = this.columnNode.processInputSockets(true);
            newSocket.on(Event_CurrentComponentchanged, this.socketComponentCreated);
            this.newSocket = newSocket;
            this.autoCreateHelper[compareKey + '_creating'] = 1;
            this.autoCreateHelper[newSocket.id] = {
                newSocket:newSocket,
                step:'created-socket',
                columnName:columnName,
                tableName:tableName,
                tableAlias:tableAlias,
                cvalType:cvalType,
                tableCode:tableCode,
                compareKey:compareKey,
            };
        }
        else{
            // 删除
            if(theLink == null){
                return false;
            }
            var needRemoveSocket = theLink.inSocket;
            this.bluePrint.deleteNode(theLink.outSocket.node);
            this.columnNode.removeSocket(needRemoveSocket);
            this.columnNode.fireEvent(Event_SocketNumChanged);
        }
        return true;
    }
    
    socketComponentCreated(socket){
        if(socket.currentComponent){
            var createInfo = this.autoCreateHelper[socket.id];
            if(createInfo.step == 'created-socket'){
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

    newColumNodeFrameComMounted(newColNode){
        var createInfo = this.autoCreateHelper[newColNode.id];
        if(createInfo){
            if(createInfo.step == 'created-column')
            {
                /*
                var inSocket = createInfo.newSocket;
                var outSocket = newColNode.outSocket;
                var inSocketCenter = inSocket.currentComponent.getCenterPos();
                var outSocketCenter = outSocket.currentComponent.getCenterPos();
                var offset = {x:inSocketCenter.x - outSocketCenter.x, y:inSocketCenter.y - outSocketCenter.y};
                offset.x -= 150;
                createInfo.newColNode.setPos(newColNode.left + offset.x, newColNode.top + offset.y);
                createInfo.newColNode.currentFrameCom.reDraw();
                */
                // addLink
                var newLink = this.bluePrint.linkPool.addLink(newColNode.outSocket, createInfo.newSocket);
                newLink.straightOut(-150);
            }
            this.autoCreateHelper[createInfo.compareKey + '_creating'] = null;
            
        }
        newColNode.off(Event_FrameComMount, this.newColumNodeFrameComMounted);
    }

    compile(helper, preNodes_arr){
        super.compile(helper);
        var columnNode = this.columnNode;
        var columnNode_inSockets = columnNode.inputScokets_arr;
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();
        if(columnNode_inSockets.length == 0){
            helper.logManager.errorEx([helper.logManager.createBadgeItem( 
                thisNodeTitle
               ,columnNode
               ,helper.clickLogBadgeItemHandler)
               ,'没有选择任何返回列。']);
            return false;
        }
        var emptySocket = null;
        var emptySocketIndex = 0;
        for(var socketI=0;socketI<columnNode_inSockets.length;++socketI){
            var socket = columnNode_inSockets[socketI];
            if(helper.getLinksBySocket(socket).length == 0){
                emptySocket = socket;
                emptySocketIndex = socketI;
                break;
            }
        }
        if(emptySocket){
            helper.logManager.errorEx([helper.logManager.createBadgeItem( 
                thisNodeTitle
               ,columnNode
               ,helper.clickLogBadgeItemHandler)
               ,'第' + (emptySocketIndex + 1) + '个输入接口是空链接']);
            return false;
        }
        return true;
    }
}

class SqlNode_Var_Get extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_VAR_GET, '变量-获取');
        autoBind(this);
        this.outSocket = new NodeSocket('out', this, false);
        this.addSocket(this.outSocket);

        this.varData = this.bluePrint.getVariableByName(this.varName);
        if(this.varData != null){
            this.varData.on('changed', this.varChangedHandler);
        }
        this.varChangedHandler();

        var self = this;
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.varName = this.varName;
        return rlt;
    }

    getNodeTitle(){
        return 'Get:' + this.varName;
    }

    varChangedHandler(){
        if(this.varData == null){
            this.outSocket.set(
                MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if(this.varData.removed){
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = SqlVarType_Unknown;
        }
        else{
            varLabel = this.varData.getLabel();
            valType = this.varData.getValType();
            this.varName = this.varData.name;
        }

        this.outSocket.set(
            MK_NS_Settings(varLabel, valType, null)
        );
        //this.emit('changed');
    }
}

class SqlNode_Var_Set extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_VAR_SET, '变量-设置');
        autoBind(this);

        this.outSocket = new NodeSocket('out', this, false);
        this.addSocket(this.outSocket);
        this.inSocket = new NodeSocket('in', this, true);
        this.addSocket(this.inSocket);

        this.varData = this.bluePrint.getVariableByName(this.varName);
        if(this.varData != null){
            this.varData.on('changed', this.varChangedHandler);
        }
        this.varChangedHandler();

        var self = this;
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.varName = this.varName;
        return rlt;
    }

    getNodeTitle(){
        return 'Set:' + this.varName;
    }

    varChangedHandler(){
        if(this.varData == null){
            this.inSocket.set(
                MK_NS_Settings(this.varName + '-不存在', SqlVarType_Unknown, null)
            );
            return;
        }
        var varLabel = '';
        var valType = '';
        if(this.varData.removed){
            this.varData = null;
            varLabel = this.varName + '-不存在';
            valType = SqlVarType_Unknown;
        }
        else{
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

class SqlNode_NOperand extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_NOPERAND, '运算');
        autoBind(this);

        this.outSocket = new NodeSocket('out', this, false, {type:SqlVarType_Scalar});
        this.addSocket(this.outSocket);
        this.insocketInitVal  = {
            type:SqlVarType_Scalar,
        };
        this.addSocket(this.genInSocket());
        this.addSocket(this.genInSocket());
        if(this.operator == null){
            this.operator = '+';
        }
        this.minInSocketCount = 2;

        var self = this;
    }

    requestSaveAttrs(){
        var rlt = super.requestSaveAttrs();
        rlt.operator = this.operator;
        return rlt;
    }

    getNodeTitle(){
        return '运算:' + this.operator;
    }

    genInSocket(){
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
    }
}

class SqlNode_Ret_Condition extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_RET_CONDITION, 'Where');
        autoBind(this);
        this.isConstNode = true;

        this.inSocket = new NodeSocket('in', this, true, {type:SqlVarType_Boolean,inputable:false});
        this.addSocket(this.inSocket);
        var self = this;
    }
}

class SqlNode_Ret_Order extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_RET_ORDER, 'Order');
        autoBind(this);
        this.isConstNode = true;
    }

    genInSocket(){
        var socketName = 'in' + this.inputScokets_arr.length;
        var nameI = this.inputScokets_arr.length;
        while(nameI < 999){
            if(this.getScoketByName('in' + nameI, true) == null){
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, {type:SqlVarType_Scalar,inputable:false});
    }

    orderTypeDropdownChangedHandler(data, dropCtl){
        var theSocketID = getAttributeByNode(dropCtl.rootDivRef.current, 'd-socketid');
        if(theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if(theSocket == null)
            return;
        theSocket.setExtra('orderType', data);
        //console.log(data);
    }

    customSocketRender(socket){
        if(!socket.isIn){
            return;
        }
        var orderType = socket.getExtra('orderType');
        if(orderType == null){
            orderType = OrderType_ASCE;
        }
        return (<DropDownControl itemChanged={this.orderTypeDropdownChangedHandler} btnclass='btn-dark' options_arr={OrderTypes_arr} rootclass='flex-grow-1 flex-shrink-1' value={orderType} /> )
    }
}

class SqlNode_Ret_Columns extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_RET_COLUMNS, 'RET 列');
        autoBind(this);
        this.isConstNode = true;
        this.addFrameButton(FrameButton_LineSocket, '拉平');
        this.addFrameButton(FrameButton_ClearEmptySocket, '清理');
    }

    genInSocket(){
        var socketName = 'in' + this.inputScokets_arr.length;
        var nameI = this.inputScokets_arr.length;
        while(nameI < 999){
            if(this.getScoketByName('in' + nameI, true) == null){
                break;
            }
            ++nameI;
        }
        return new NodeSocket('in' + nameI, this, true, {type:SqlVarType_Scalar,inputable:false});
    }

    freshContext(){

    }

    linkAdded(link){
        super.linkAdded(link);
        var outNode = link.outSocket.node;
        if(outNode.type == SQLNODE_COLUMN){
            this.parent.fireEvent('selectchanged', 0, {
                tableCode:outNode.tableCode,
                tableAlias:outNode.tableAlias,
                columnName:outNode.columnName
            });
        }
    }

    linkRemoved(link){
        super.linkRemoved(link);
        var outNode = link.outSocket.node;
        if(outNode.type == SQLNODE_COLUMN){
            this.parent.fireEvent('selectchanged', 0, {
                tableCode:outNode.tableCode,
                tableAlias:outNode.tableAlias,
                columnName:outNode.columnName
            });
        }
    }

    aliasInputChangedHanlder(ev){
        var theSocketID = getAttributeByNode(ev.target, 'd-socketid');
        if(theSocketID == null)
            return;
        var theSocket = this.getSocketById(theSocketID);
        if(theSocket == null)
            return;
        theSocket.setExtra('alias', ev.target.value);
        theSocket.fireEvent('changed');
    }

    customSocketRender(socket){
        if(!socket.isIn){
            return;
        }
        var alias = socket.getExtra('alias');
        if(alias == null){
            alias = '';
        }
        return (<div>AS:<input type='text' className='socketInputer' big='1' onChange={this.aliasInputChangedHanlder} value={alias} /></div>)
    }
}