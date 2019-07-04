function MK_NS_Settings(label, type, defval){
    return{
        label:label,
        type:type,
        defval:defval
    };
}

function CommonFun_SetCurrentComponent(target){
    if(this.currentComponent != target){
        this.currentComponent = target;
        this.emit(Event_CurrentComponentchanged, this);
    }
}

class CompileResult{
    constructor(node){
        this.node = node;
        this.socketOuts = {};
    }
    
    setSocketOut(socket, strContent, data){
        this.socketOuts[socket.id]={
            strContent:strContent,
            data:data,
        }
    }

    setDirectOut(strContent,data){
        this.directOut={
            strContent:strContent,
            data:data,
        }
    }

    getSocketOut(socket){
        return this.socketOuts[socket.id];
    }

    getDirectOut(){
        return this.directOut;
    }
}

class ContextFinder{
    constructor(type){
        this.type = type;
        this.item_arr = [];
    }

    addItem(label,data){
        if(data == null){
            return;
        }
        if(label == null){
            console.warn('context meet null label');
            label = 'unname';
        }
        this.item_arr.push({label:label,data:data});
        return this.item_arr[this.item_arr.length - 1];
    }

    setTest(key){
        this['test-' + key] = 1;
    }

    isTest(key){
        return this['test-' + key] == 1;
    }

    count(){
        return this.item_arr.length;
    }
}


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

class Node_Base extends EventEmitter {
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
            if(nodeJson.inFlowSocket){
                self.inFlowSocket = self.addSocket(CreateNodeSocketByJson(this, nodeJson.inFlowSocket, createHelper));
            }
            if(nodeJson.outFlowSocket){
                self.outFlowSocket = self.addSocket(CreateNodeSocketByJson(this, nodeJson.outFlowSocket, createHelper));
            }
            if (!IsEmptyArray(nodeJson.outFlowSockets_arr)) {
                this.outFlowSockets_arr = [];
                nodeJson.outFlowSockets_arr.forEach(socketJson => {
                    self.addSocket(CreateNodeSocketByJson(this, socketJson, createHelper));
                });
            }
            if (!IsEmptyArray(nodeJson.inFlowSockets_arr)) {
                this.inFlowSockets_arr = [];
                nodeJson.inFlowSockets_arr.forEach(socketJson => {
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
        this.processOutputSockets = this.processOutputSockets.bind(this);
        this.processInputFlowSockets = this.processInputFlowSockets.bind(this);
        this.processOutputFlowSockets = this.processOutputFlowSockets.bind(this);
        this.frameButtons_arr = [];

        this.bluePrint.registerNode(this, parentNode);

        if (createHelper) {
            createHelper.saveJsonMap(nodeJson, this);
        }

        if (nodeJson) {
            this.bluePrint.genNodesByJsonArr(this, nodeJson.nodes_arr, createHelper);
        }
    }

    isHadFlow(){
        return this.inFlowSocket != null || this.outFlowSocket != null;
    }

    clickFrameButton(btnName) {
        console.log('clickFrameButton:' + btnName);
        var removeCount = 0;
        var si;
        var socket;
        switch (btnName) {
            case FrameButton_LineSocket:
                {
                    var links = this.bluePrint.linkPool.getLinksByNode(this, 'i');
                    links.forEach(link => {
                        link.straightOut(-150);
                    });
                }
                break;
            case FrameButton_ClearEmptyInputSocket:
                {
                    for (si = this.inputScokets_arr.length - 1; si >= this.minInSocketCount && this.inputScokets_arr.length > 0; --si) {
                        socket = this.inputScokets_arr[si];
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
            case FrameButton_ClearEmptyOutputSocket:
                {
                    removeCount = 0;
                    for (si = this.outputScokets_arr.length - 1; si >= 0 && this.outputScokets_arr.length > 0; --si) {
                        socket = this.outputScokets_arr[si];
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

    getUseableInSocketName(prefix='in'){
        var nameI = this.inputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName(prefix + nameI, true) == null) {
                break;
            }
            ++nameI;
        }
        return prefix + nameI;
    }

    getUseableOutSocketName(prefix='out'){
        var nameI = this.outputScokets_arr.length;
        while (nameI < 999) {
            if (this.getScoketByName(prefix + nameI, false) == null) {
                break;
            }
            ++nameI;
        }
        return prefix + nameI;
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
        };
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

    addSocket(socketObj, targetIndex) {
        this.sockets_map[socketObj.id] = socketObj;
        if(!socketObj.isFlowSocket)
        {
            if (socketObj.isIn) {
                if(targetIndex >= 0 && targetIndex < this.inputScokets_arr.length){
                    this.inputScokets_arr.splice(targetIndex, 0, socketObj);
                }
                else{
                    this.inputScokets_arr.push(socketObj);
                }
            }
            else {
                if(targetIndex >= 0 && targetIndex < this.outputScokets_arr.length){
                    this.outputScokets_arr.splice(targetIndex, 0, socketObj);
                }
                else{
                    this.outputScokets_arr.push(socketObj);
                }
            }
        }
        else{
            if(!socketObj.isIn && socketObj.name != 'flow_o' && this.outFlowSockets_arr != null){
                this.outFlowSockets_arr.push(socketObj);
            }
            if(socketObj.isIn && socketObj.name != 'flow_i' && this.inFlowSockets_arr != null){
                this.inFlowSockets_arr.push(socketObj);
            }
        }
        return socketObj;
    }

    removeSocket(socketObj) {
        if(socketObj == null || (this.preRemoveSocket && this.preRemoveSocket(socketObj) == false)){
            return;
        }
        if(!socketObj.isFlowSocket)
        {
            if (socketObj.isIn) {
                removeElemFrommArray(this.inputScokets_arr, socketObj);
            }
            else {
                removeElemFrommArray(this.outputScokets_arr, socketObj);
            }
        }
        else{
            if (socketObj.isIn) {
                if(this.inFlowSockets_arr != null){
                    removeElemFrommArray(this.inFlowSockets_arr, socketObj);
                }
            }
            else if(this.outFlowSockets_arr != null){
                removeElemFrommArray(this.outFlowSockets_arr, socketObj);
            }
        }
        this.sockets_map[socketObj.id] = null;
        this.bluePrint.linkPool.clearSocketLink(socketObj);
    }

    getSocketById(socketID) {
        return this.sockets_map[socketID];
    }

    setPos(newx, newy) {
        this.left = Math.round(newx / 10) * 10;
        this.top = Math.round(newy / 10) * 10;
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

    isOutFlowScoketDynamic() {
        return this.genOutFlowSocket != null;
    }

    isInputFlowScoketDynamic() {
        return this.genInputFlowSocket != null;
    }

    processInputSockets(isPlus) {
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genInSocket();
            if(retSocket == null){
                return;
            }
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

    processOutputSockets(isPlus) {
        if (this.minOutSocketCount == null) {
            this.minOutSocketCount = 0;
        }
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genOutSocket();
            if(retSocket == null){
                return;
            }
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

    processOutputFlowSockets(isPlus) {
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genOutFlowSocket();
            if(retSocket == null){
                return;
            }
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else {
            var needRemoveSocket = this.outFlowSockets_arr[this.outFlowSockets_arr.length - 1];
            this.removeSocket(needRemoveSocket);
            this.fireEvent(Event_SocketNumChanged);
            retSocket = needRemoveSocket;
        }
        return retSocket;
    }

    processInputFlowSockets(isPlus) {
        var retSocket = null;
        if (isPlus) {
            retSocket = this.genInputFlowSocket();
            if(retSocket == null){
                return;
            }
            this.addSocket(retSocket);
            this.fireEvent(Event_SocketNumChanged);
        }
        else {
            var needRemoveSocket = this.inFlowSockets_arr[this.inFlowSockets_arr.length - 1];
            this.removeSocket(needRemoveSocket);
            this.fireEvent(Event_SocketNumChanged);
            retSocket = needRemoveSocket;
        }
        return retSocket;
    }

    // can custom socket component
    customSocketRender(socket) {
        return null;
    }

    customFlowSocketRender(socket) {
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

    getJson(jsonProf) {
        var attrs = this.requestSaveAttrs(jsonProf);
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
                case 'boolean':
                    {
                        stringVal = pval;
                        break;
                    }
                default:
                    console.error('不支持的pValType:' + pValType);
            }
            rlt[pname] = stringVal;
        }
        // input sockets
        if (this.inputScokets_arr.length > 0) {
            var t_insocketJson_arr = [];
            this.inputScokets_arr.forEach(data => {
                t_insocketJson_arr.push(data.getJson(jsonProf));
            });
            rlt.inputScokets_arr = t_insocketJson_arr;
        }
        if (this.outputScokets_arr.length > 0) {
            var t_outsocketJson_arr = [];
            this.outputScokets_arr.forEach(data => {
                t_outsocketJson_arr.push(data.getJson(jsonProf));
            });
            rlt.outputScokets_arr = t_outsocketJson_arr;
        }
        if(this.outFlowSockets_arr && this.outFlowSockets_arr.length > 0){
            var t_outflowsocketJson_arr = [];
            this.outFlowSockets_arr.forEach(data => {
                t_outflowsocketJson_arr.push(data.getJson(jsonProf));
            });
            rlt.outFlowSockets_arr = t_outflowsocketJson_arr;
        }
        if(this.inFlowSockets_arr && this.inFlowSockets_arr.length > 0){
            var t_inflowsocketJson_arr = [];
            this.inFlowSockets_arr.forEach(data => {
                t_inflowsocketJson_arr.push(data.getJson(jsonProf));
            });
            rlt.inFlowSockets_arr = t_inflowsocketJson_arr;
        }
        if(this.inFlowSocket){
            rlt.inFlowSocket = this.inFlowSocket.getJson(jsonProf);
        }
        if(this.outFlowSocket){
            rlt.outFlowSocket = this.outFlowSocket.getJson(jsonProf);
        }
        // child node
        if (this.nodes_arr && this.nodes_arr.length > 0) {
            var tNode_arr = [];
            this.nodes_arr.forEach(childNode => {
                var childJson = childNode.getJson(jsonProf);
                if (childJson) {
                    tNode_arr.push(childJson);
                }
            });
            rlt.nodes_arr = tNode_arr;
        }

        return rlt;
    }

    compile(helper, preNodes_arr, isServerSide) {
        helper.meetNode(this);
        if (preNodes_arr.indexOf(this) != -1) {
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                this.getNodeTitle(),
                this,
                helper.clickLogBadgeItemHandler),
                '处产生了回路!']);
            return false;
        }
        var cacheRet = helper.getCompileRetCache(this, isServerSide);
        return cacheRet;
    }

    getSocketCompileValue(helper,theSocket,usePreNodes_arr,belongBlock,canUseDefval,nullable) {
        var socketValue = null;
        var theNode = this;
        var theLink = null;
        var tLinks = theNode.bluePrint.linkPool.getLinksBySocket(theSocket);
        if (tLinks.length == 0) {
            if(canUseDefval){
                socketValue = IsEmptyString(theSocket.defval) ? null : theSocket.defval;
                if (isNaN(socketValue)) {
                    socketValue = "'" + theSocket.defval + "'";
                }
            }
        }
        else {
            theLink = tLinks[0];
            var outNode = theLink.outSocket.node;
            var compileRet = null;
            if (outNode.isHadFlow()) {
                compileRet = helper.getCompileRetCache(outNode);
                if(this.checkCompileFlag(compileRet == null, '输入接口设置错误', helper)){
                    return {err:1};
                }
            }
            else {
                compileRet = outNode.compile(helper, usePreNodes_arr, belongBlock);
            }
    
            if (compileRet == false) {
                return {err:1};
            }
            socketValue = compileRet.getSocketOut(theLink.outSocket).strContent;
        }
        if(this.checkCompileFlag(!nullable && IsEmptyString(socketValue), '接口' + theSocket.label + '需要一个值', helper)){
            return {err:1};
        }
        return {value:socketValue,link:theLink};
    }

    checkCompileFlag(flag, errInfo, helper){
        if(flag){
            helper.logManager.errorEx([helper.logManager.createBadgeItem(
                this.getNodeTitle(),
                this,
                helper.clickLogBadgeItemHandler),
                errInfo]);
            return true;
        }
        return false;
    }

    getUseClientVariable(helper,srcNode, belongFun, targetSocket, result){
        if(belongFun == null){
            return;
        }
        if(srcNode != this){
            if(this.getScoketClientVariable){
                this.getScoketClientVariable(helper, srcNode, belongFun, targetSocket, result);
            }
            if(this.serverFun != null){
                // 遇到有serverFun的节点要中断探测
                return;
            }
        }
        if(this.inputScokets_arr){
            this.inputScokets_arr.forEach(inSocket=>{
                var theLinks = this.bluePrint.linkPool.getLinksBySocket(inSocket);
                if(theLinks.length > 0){
                    theLinks[0].outSocket.node.getUseClientVariable(helper, srcNode, belongFun, theLinks[0].outSocket, result);
                }
            });
        }
    }

    isInReducer(){
        return false;
    }
}

class UseClientVariableResult{
    constructor(){
        this.variables_arr = [];
    }

    pushVariable(name, socket){
        var found = this.variables_arr.find(x=>{return x.name == name;});
        if(found == null){
            this.variables_arr.push({name:name,socket:socket});
        }
    }
}


function C_NodeCom_componentWillMount() {
    this.props.nodedata.currentComponent = this;
    if (this.cus_componentWillMount != null) {
        this.cus_componentWillMount();
    }
}

function C_NodeCom_componentWillUnMount() {
    this.props.nodedata.currentComponent = null;
    if (this.cus_componentWillUnmount != null) {
        this.cus_componentWillUnmount();
    }
}

function C_ReDraw() {
    this.setState({
        magicobj: {},
    });
}

function C_NodeCom_Base(target) {
    target.frameRef = React.createRef();
    target.componentWillMount = C_NodeCom_componentWillMount.bind(target);
    target.componentWillUnmount = C_NodeCom_componentWillUnMount.bind(target);
    target.reDraw = C_ReDraw.bind(target);
}

class C_Node_Frame extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            editingTitle: false,
            title: ReplaceIfNull(props.nodedata.title, ''),
            moving: this.props.nodedata.newborn == true,
        };

        this.rootDivRef = React.createRef();

        if (this.props.nodedata.newborn) {
            var self = this;
            setTimeout(() => {
                if (self.state.moving) {
                    self.startMove(null);
                    this.props.editor.setSelectedNF(this);
                }
            }, 10);
        }
    }

    reDraw() {
        this.setState(
            {
                magicobj: {},
            }
        );
    }

    addOffset(offset) {
        var nodeData = this.props.nodedata;
        nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
        this.reDraw();
    }

    startMove(moveBase) {
        this.moveBase = moveBase;
        window.addEventListener('mousemove', this.mousemoveWidthMoveHandler);
        window.addEventListener('mouseup', this.mouseupWidthMoveHandler);
        this.setState(
            {
                moving: true,
            }
        );

        if (this.movingInt == null) {
            this.movingInt = setInterval(this.movingIntHandler, 100);
        }
        this.targetScroll = null;
        this.props.editor.nodeFrameStartMove(this);
    }

    endMove() {
        window.removeEventListener('mousemove', this.mousemoveWidthMoveHandler);
        window.removeEventListener('mouseup', this.mouseupWidthMoveHandler);
        this.props.nodedata.newborn = false;

        if (this.state.moving) {
            this.setState(
                {
                    moving: false,
                }
            );
        }
        if (this.movingInt) {
            clearInterval(this.movingInt);
            this.movingInt = null;
        }
    }

    clickEditTitleHandler() {
        if (this.state.editingTitle) {
            this.props.nodedata.setTitle(this.state.title);
        }
        this.setState(
            {
                editingTitle: !this.state.editingTitle,
            }
        );
        this.props.nodedata.fireMoved(10);
    }

    nodeTitleInputChangeHandler(ev) {
        var inputStr = ev.target.value;
        this.setState({
            title: inputStr.trim(),
        });
    }

    nodeTitleInputKeypressHandler(ev) {
        if (ev.nativeEvent.keyCode == 13) {
            this.setState(
                {
                    editingTitle: false,
                }
            );
        }
    }

    componentWillUnmount() {
        this.endMove();
        this.unmounted = true;
        this.props.nodedata.currentFrameCom = null;
        this.props.nodedata.fireEvent(Event_FrameComUnMount, 10);
    }

    componentWillMount() {
        this.props.nodedata.currentFrameCom = this;
        this.props.nodedata.fireEvent(Event_FrameComMount, 10);
    }

    mousemoveWidthMoveHandler(ev) {
        var moveBase = this.moveBase;
        if (moveBase == null) {
            moveBase = {
                x: 0,
                y: 0
            };
        }
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var rootDiv = this.rootDivRef.current;
        var editorRootDivRect = editorRootDiv.getBoundingClientRect();
        var editorScale = editorRootDivRect.scale;
        if (editorScale == null || isNaN(editorScale)) {
            editorScale = 1;
        }
        var mouseX = ev.x;
        var mouseY = ev.y;
        var localPos = {
            x: mouseX - editorRootDivRect.left,
            y: mouseY - editorRootDivRect.top,
        }
        var editorDiv = this.props.editor.editorDivRef.current;
        var offset = {
            x: localPos.x - parseUnitInt(editorDiv.style.left),
            y: localPos.y - parseUnitInt(editorDiv.style.top),
        };
        var newX = offset.x + moveBase.x;
        var newY = offset.y + moveBase.y;
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        rootDiv.style.left = newX + 'px';
        rootDiv.style.top = newY + 'px';
        var nodeData = this.props.nodedata;
        nodeData.setPos(newX, newY);

        this.props.editor.nodeFrameMoving(this, offset);
    }

    movingIntHandler() {
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var editorDiv = this.props.editor.editorDivRef.current;
        var theRect = editorRootDiv.getBoundingClientRect();
        var offset = {
            left: WindowMouse.x - theRect.left,
            top: WindowMouse.y - theRect.top,
            bottom: theRect.bottom - WindowMouse.y,
            right: theRect.right - WindowMouse.x,
        }
        var gap = 100;
        var autoMove = { x: 0, y: 0 };
        if (offset.left > 0 && offset.left < gap) {
            autoMove.x = 1;
        }
        else if (offset.right > 0 && offset.right < gap) {
            autoMove.x = -1;
        }
        if (offset.top > 0 && offset.top < gap) {
            autoMove.y = 1;
        }
        else if (offset.bottom > 0 && offset.bottom < gap) {
            autoMove.y = -1;
        }
        if (autoMove.x != 0 || autoMove.y != 0) {
            editorDiv.style.left = (parseUnitInt(editorDiv.style.left) + autoMove.x * 30) + 'px';
            editorDiv.style.top = (parseUnitInt(editorDiv.style.top) + autoMove.y * 30) + 'px';
        }
    }

    mouseupWidthMoveHandler(ev) {
        this.endMove();
    }

    moveBarMouseDownHandler(ev, forcedo) {
        if (!forcedo && ev.target != this.rootDivRef.current && ev.target.getAttribute('f-canmove') == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        if (nodeData.isContainer) {
            if (this.lastClickTime == null || (Date.now() - this.lastClickTime) > 300) {
                this.lastClickTime = Date.now();
            }
            else {
                this.props.editor.setEditeNode(nodeData);
                return;
            }
        }
        this.props.editor.setSelectedNF(this, ev != null && ev.ctrlKey);
        var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
        this.moveBase = { x: rootDivRect.left - WindowMouse.x, y: rootDivRect.top - WindowMouse.y };
        this.startMove(this.moveBase);
    }

    setSelected(val) {
        this.setState({ selected: val });
    }

    getNodeTitle(readable) {
        var nodeData = this.props.nodedata;
        if (readable) {
            return nodeData.getNodeTitle();
        }
        return this.props.getTitleFun == null ? (nodeData.title == null ? '' : nodeData.title) : this.props.getTitleFun();
    }

    renderHead(nodeData) {
        if (this.props.isPure) {
            return null;
        }

        var inFlowElem = null;
        var outFlowElem = null;
        if(nodeData.inFlowSocket){
            inFlowElem = (<C_Node_Socket socket={nodeData.inFlowSocket} align='left' editor={this.props.editor} />);
        }
        if(nodeData.outFlowSocket){
            outFlowElem = (<C_Node_Socket socket={nodeData.outFlowSocket} align='right' editor={this.props.editor} />);
        }

        var headType = this.props.headType;
        if (headType == null)
            headType = 'default';
        if (headType == 'tiny') {
            var headElem = this.props.headText;
            if (this.props.cusHeaderFuc != null) {
                headElem = this.props.cusHeaderFuc();
            }
            //{nodeData.hadFlow && !nodeData.banOutFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
            return <div className='d-flex nodeHead align-items-center' type='tiny' >
                {inFlowElem}
                <div className='flex-grow-1 flex-shrink-0 text-nowrap text-center' f-canmove={1} >
                    {headElem}
                </div>
                {outFlowElem}
            </div>
        }
        else if (headType == 'empty') {
            return null;
        }

        if (headType == 'default') {
            var nodeTitle = this.getNodeTitle();
            return <React.Fragment>
                <div className='bg-light d-flex align-items-center text-dark' style={{ fontSize: '1em' }}>
                    <div className='flex-grow-1 flex-shrink-1 text-nowrap' f-canmove={1}>
                        {nodeData.label}:
                                {
                            this.state.editingTitle ? <input className='' type='text' value={this.state.title} onChange={this.nodeTitleInputChangeHandler} onKeyPress={this.nodeTitleInputKeypressHandler} />
                                :
                                <React.Fragment>
                                    <span className='' f-canmove={1}>{nodeTitle}</span>
                                </React.Fragment>
                        }
                        <i className='fa fa-edit ml-1 cursor-pointer' onClick={this.clickEditTitleHandler} />
                    </div>
                </div>
                <div className="dropdown-divider"></div>
            </React.Fragment>
        }
        return null;
    }

    renderButtons() {
        var nodeData = this.props.nodedata;
        if (nodeData.frameButtons_arr.length == 0) {
            return null;
        }
        return (<div className='btn-group flex-grow-1 flex-shrink-1'>
            {nodeData.frameButtons_arr.map(btnData => {
                return <button key={btnData.name} type='button' onClick={this.clickFrameButtonHandler} className='btn btn-dark' d-btnname={btnData.name} >{btnData.label}</button>
            })}
        </div>)
    }

    clickFrameButtonHandler(ev) {
        var btnName = getAttributeByNode(ev.target, 'd-btnname', true);
        if (btnName != null) {
            this.props.nodedata.clickFrameButton(btnName);
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        if(nodeData.preRenderFrame){
            nodeData.preRenderFrame();
        }
        var posStyle = { left: parseInt(nodeData.left) + 'px', 'top': parseInt(nodeData.top), 'paddingTop': this.props.isPure ? '0.5em' : null };
        return (<div ref={this.rootDivRef} onMouseDown={this.moveBarMouseDownHandler} className='position-absolute d-flex flex-column nodeRoot' style={posStyle} d-selected={this.state.selected ? '1' : null}>
            {
                this.renderHead(nodeData)
            }
            {
                this.renderButtons()
            }
            {
                this.props.children
            }
        </div>);
    }
}

