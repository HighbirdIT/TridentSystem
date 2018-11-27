const ISParam_Options_arr=[{name:'参数',code:'1'},{name:'变量',code:'0'}]

var __SynAction_count = 0;
class SynAction extends EventEmitter {
    constructor(initValues) {
        super();
        initValues.complete = false;
        Object.assign(this, initValues);
        this.id = __SynAction_count++;
        this.passedtime = 0;
        autoBind(this);
    }

    startFetch(fetchFun) {
        this.startFetchTime = Date.now();
        this.timeInt = setInterval(this.growTime, 200);
        var self = this;
        this.fetchFun = fetchFun;
        this.complete = false;
        this.passedtime = 0;
        fetchFun((rlt) => {
            self.fetchComplete(rlt.err ? rlt.err : rlt.json);
        });
    }

    reFetch() {
        if (this.fetchFun != null) {
            this.startFetch(this.fetchFun);

        }
    }

    fetchComplete(fetchData) {
        this.fetchData = fetchData;
        this.complete = true;
        this.passedtime = Math.round((Date.now() - this.startFetchTime) / 1000.0 * 10) / 10.0;
        this.emit('fetchend');
        clearInterval(this.timeInt);
    }

    growTime() {
        this.passedtime = Math.round((Date.now() - this.startFetchTime) / 1000.0 * 10) / 10.0;
        //this.passed = (new Date() - this.startFetchTime);
        //console.log(this.passedtime);
        this.emit('timechange');
    }
}

class SynActionControl extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            complete: this.props.action.complete,
            passedtime: this.props.action.passedtime,
        };
        autoBind(this);
    }

    actionFetchend() {
        this.setState({
            complete: this.props.action.complete,
            passedtime: this.props.action.passedtime,
        });
        this.props.synFetchComplete(this.props.action.fetchData);
    }

    actionTimeChange() {
        this.setState({
            passedtime: this.props.action.passedtime,
            complete: this.props.action.complete,
        });
    }

    componentWillMount() {
        this.props.action.on('fetchend', this.actionFetchend);
        this.props.action.on('timechange', this.actionTimeChange);
    }

    componentWillUnmount() {
        this.props.action.off('fetchend', this.actionFetchend);
        this.props.action.off('timechange', this.actionTimeChange);
    }

    renderActionBody(action) {
        if (!action.complete) {
            return (<div><i className="fa fa-spinner fa-pulse mr-1" />{'正在同步,用时' + this.state.passedtime + 's'}</div>);
        }
        if (action.fetchData.err) {
            return action.fetchData.err.info;
        }
        return (
            <React.Fragment>
                {'查得:' + action.fetchData.data.length + '项,用时' + this.state.passedtime + 's'}
                {action.fetchData.data.length == 0 ? null :
                    <span className='icon icon-info' data-toggle="collapse" data-target={"#actioninfo" + action.id} ></span>
                }
                {
                    action.fetchData.data.length == 0 ? null :
                        <div id={"actioninfo" + action.id} className="list-group flex-grow-0 flex-shrink-0 border collapse" style={{ overflow: 'auto', maxHeight: '300px', padding: '5px' }} >
                            {
                                action.fetchData.data.map((item, i) => {
                                    if (item == null) {
                                        return null;
                                    }
                                    return (<div className={'d-flex flex-grow-0 flex-shrink-0 list-group-item-sm list-group-item-action'} key={i}>
                                        {item.name}
                                    </div>)
                                })
                            }
                        </div>
                }
            </React.Fragment>
        );
    }

    clickCloseHandler(ev) {
        this.props.removeSynAction(this.props.action);
    }

    render() {
        var action = this.props.action;
        return (
            <div className='list-group-item mt-1'>
                <div className='d-flex'>
                    <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                        <div className=''>{action.synflag == 'keyword' ? '同步关键字:' + action.keyword : ''}</div>
                        <div className={!this.state.complete ? 'text-info' : (action.fetchData.err != null || action.fetchData.data.length == 0 ? 'text-danger' : 'text-success')}>
                            {
                                this.renderActionBody(action)
                            }
                        </div>
                    </div>
                    {
                        action.complete && <div className='d-flex flex-column'><span onClick={this.clickCloseHandler} className='icon icon-close' /><span onClick={this.props.action.reFetch} className='icon icon-refresh' /></div>
                    }
                </div>
            </div>
        );
    }
}

class UsedDSEnityPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        autoBind(this);
        this.state = {
            selectedIndexes_arr: [],
        }
        this.alldbdropdownRef = React.createRef();
    }

    clickAddHandler(ev) {
        if (this.alldbdropdownRef.current) {
            var selected = this.alldbdropdownRef.current.getSelectedData();
            if (selected) {
                this.props.dataMaster.useEnity(selected);
            }
        }
    }

    render() {
        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                <div className='d-flex flex-grow-0 flex-shrink-0 align-items-baseline' style={{ borderBottom: 'solid white 2px' }}>
                    <div className='text-light flex-grow-1 flex-shrink-1 ml-1'>使用数据源</div>
                    <div className='text-light flex-grow-0 flex-shrink-0 d-flex btn-group'>

                    </div>
                </div>
                <div className='list-group autoScroll flex-grow-1 flex-shrink-1'>
                    <ListDataEditor dataView={this.props.dataMaster.dataView_usedDBEnities} />
                </div>
                <div className='d-flex'>
                    <DropDownControl ref={this.alldbdropdownRef} btnclass='btn-primary' options_arr={g_dataBase.entities_arr} rootclass='flex-grow-1 flex-shrink-1' editable={true} textAttrName='name' valueAttrName='code' />
                    <button onClick={this.clickAddHandler} type='button' className='btn btn-primary ml-1'>添加</button>
                </div>
            </div>
        );
    }
}

class DataBasePanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = this.props.project.cacheState.DataBasePanel;

        if (initState == null) {
            initState = {
                matchKeyword: '',
                synQueue_arr: [],
            };
        }
        this.state = initState;
        autoBind(this);
        var self = this;
        setTimeout(() => {
            self.startSynAction('keyword','T101');
        }, 100);
    }

    matchKeywordInputChangedhandler(ev) {
        this.setState({
            matchKeyword: ev.target.value
        });
    }

    componentWillMount() {

    }

    componentWillUnmount() {
        this.props.project.cacheState.DataBasePanel = this.state;
    }

    /*
    fetchJsonPosts('server',{action:'matchGet',keyword:'T922'}, function(rlt){
        console.log(rlt);
    });
    */

    clickSynBtnHandler(ev) {
        var synflag = getAttributeByNode(ev.target, 'synflag', true, 10);
        this.startSynAction(synflag, this.state.matchKeyword.trim());
    }

    startSynAction(synflag,param) {
        if (synflag == 'keyword') {
            var keyword = param;
            if (keyword.length < 2)
                return;
            var hadAction = this.state.synQueue_arr.find(synAction => {
                return !synAction.complete && synAction.synflag == synflag && synAction.keyword == keyword;
            });
            if (hadAction)
                return;

            var newAction = new SynAction({
                keyword: keyword,
                synflag: synflag,
            });

            this.appendSynAction(newAction);
            newAction.startFetch((callBack) => {
                fetchJsonPosts('server', { action: 'syndata_bykeyword', keyword: keyword }, callBack);
            });

        }
    }

    appendSynAction(theAction) {
        var nowArr = this.state.synQueue_arr.concat();
        nowArr.unshift(theAction);
        this.setState(
            {
                synQueue_arr: nowArr,
            }
        );
    }

    removeSynAction(theAction) {
        var index = this.state.synQueue_arr.indexOf(theAction);
        if (index >= 0) {
            var nowArr = this.state.synQueue_arr.concat();
            nowArr.splice(index, 1);
            this.setState(
                {
                    synQueue_arr: nowArr,
                }
            );
        }
    }

    keywordKeypressHandler(ev) {
        if (ev.nativeEvent.keyCode == 13) {
            this.startSynAction('keyword');
        }
    }

    synFetchComplete(fetchData) {
        if (fetchData.data && fetchData.data.length > 0) {
            this.props.project.dataMaster.synEnityFromFetch(fetchData.data);
        }
    }

    render() {
        return (<div className='d-flex flex-grow-1 flex-shrink-1 bg-dark'>
            <SplitPanel
                defPercent={0.45}
                maxSize='300px'
                barClass='bg-secondary'
                panel1={
                    <div className='d-flex flex-grow-1 flex-shrink-1 flex-column autoScroll'>
                        <button type='button' className='btn btn-primary mt-1 flex-shrink-0'>同步基础配置</button>
                        <button type='button' className='btn btn-primary mt-1 flex-shrink-0'>同步本方案</button>
                        <div className='d-flex mt-1  flex-shrink-0'>
                            <input type='text' className='flex-grow-1 flex-shrink-1' value={this.state.matchKeyword} onChange={this.matchKeywordInputChangedhandler} onKeyDown={this.keywordKeypressHandler} />
                            <button type='button' onClick={this.clickSynBtnHandler} synflag='keyword' className='btn btn-primary ml-1'>匹配同步</button>
                        </div>
                        <div className='list-group flex-grow-1 flex-shrink-1 autoScroll'>
                            {
                                this.state.synQueue_arr.map(syndata => {
                                    return <SynActionControl key={syndata.id} action={syndata} removeSynAction={this.removeSynAction} synFetchComplete={this.synFetchComplete} />
                                })
                            }
                        </div>
                    </div>
                }
                panel2={<UsedDSEnityPanel dataMaster={this.props.project.dataMaster} />}
            />
        </div>)
    }
}

var node_Counter = 1;

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


class SocketLink{
    constructor(outSocket, inSocket, pool){
        this.outID = outSocket.id;
        this.inID = inSocket.id;
        this.pool = pool;
        this.outSocket = outSocket;
        this.inSocket = inSocket;

        this.id = this.outID + '|L|' + this.inID;
        //this.revid = inID + '|L|' + outID;
    }

    fireChanged(){
        this.inSocket.fireLinkChanged();
        this.outSocket.fireLinkChanged();
    }

    straightOut(offsetX){
        var inSocket = this.inSocket;
        var outSocket = this.outSocket;
        if(outSocket.node.currentFrameCom == null || inSocket.node.currentFrameCom == null)
        {
            return;
        }
        if(isNaN(offsetX)){
            offsetX = 100;
        }
        var inSocketCenter = inSocket.currentComponent.getCenterPos();
        var outSocketCenter = outSocket.currentComponent.getCenterPos();
        var offset = {x:inSocketCenter.x - outSocketCenter.x, y:inSocketCenter.y - outSocketCenter.y};
        offset.x += offsetX;
        outSocket.node.setPos(outSocket.node.left + offset.x, outSocket.node.top + offset.y);
        outSocket.node.currentFrameCom.reDraw();
    }
}

class ScoketLinkPool{
    constructor(bluePrint){
        this.bluePrint = bluePrint;
        this.link_map = {};
    }

    _deleteLink(linkObj){
        if(this.link_map[linkObj.id] == null){
            return false; 
        }
        if(linkObj){
            this.link_map[linkObj.id] = null;
            delete this.link_map[linkObj.id];
            linkObj.fireChanged();

            linkObj.inSocket.node.linkRemoved(linkObj);
            linkObj.outSocket.node.linkRemoved(linkObj);
        }
        return true;
    }
    
    addLink(outSocket, inSocket){
        if(outSocket.isIn == inSocket.isIn){
            throw new Error("两个socket流方向不能一样");
        }
        if(outSocket.isIn){
            var t = outSocket;
            outSocket = inSocket;
            inSocket = t;
        }
        var id = outSocket.id + '|L|' + inSocket.id;
        if(this.link_map[id] == null){
            // 把已有的inSocket删除掉
            for(var si in this.link_map){
                var theLink = this.link_map[si];
                if(theLink == null)
                    continue;
                if(theLink.inSocket == inSocket){
                    this._deleteLink(this.link_map[si]);
                    break;
                }
            }
            var newLink = new SocketLink(outSocket, inSocket, this);
            this.link_map[id] = newLink;
            newLink.fireChanged();
            this.cacheData = null;
            this.bluePrint.fireChanged(10);
            
            inSocket.node.linkAdded(newLink);
            outSocket.node.linkAdded(newLink);
        }
        return this.link_map[id];
    }

    removeLink(link){
        if(this._deleteLink(link)){
            this.cacheData = null;
            this.bluePrint.fireChanged();
        }
    }

    clearNodeLink(theNode){
        var needClearids_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket.node == theNode || theLink.outSocket.node == theNode){
                needClearids_arr.push(si);
            }
        }
        if(needClearids_arr.length > 0){
            for(var si in needClearids_arr){
                var id = needClearids_arr[si];
                this._deleteLink(this.link_map[id])
            }
            this.cacheData = null
        }
        return needClearids_arr.length > 0;
    }

    clearSocketLink(theSocket){
        var needClearids_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket == theSocket || theLink.outSocket == theSocket){
                needClearids_arr.push(si);
            }
        }
        if(needClearids_arr.length > 0){
            for(var si in needClearids_arr){
                var id = needClearids_arr[si];
                this._deleteLink(this.link_map[id])
            }
            this.cacheData = null
        }
        return needClearids_arr.length > 0;
    }

    getLinksByNode(theNode, type){
        if(type == null){
            type = '*';
        }
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket.node == theNode){
                if(type == '*' || type == 'i'){
                    rlt_arr.push(theLink);
                }
            }
            else if(theLink.outSocket.node == theNode){
                if(type == '*' || type == 'o'){
                    rlt_arr.push(theLink);
                }
            }
        }
        return rlt_arr;
    }

    getLinksBySocket(theSocket, type){
        if(type == null){
            type = '*';
        }
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket == theSocket){
                if(type == '*' || type == 'i'){
                    rlt_arr.push(theLink);
                }
            }
            else if(theLink.outSocket == theSocket){
                if(type == '*' || type == 'o'){
                    rlt_arr.push(theLink);
                }
            }
        }
        return rlt_arr;
    }

    getAllLink(){
        if(this.cacheData == null){
            this.cacheData = [];
            for(var si in this.link_map){
                if(this.link_map[si]){
                    this.cacheData.push(this.link_map[si]);
                }
            }
        }
        return this.cacheData;
    }
}

class CustomDbEntity extends EventEmitter{
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

        this.nodes_arr = this.nodes_arr.map((nodeData,i)=>{
            if(nodeData.type == SQLNODE_BDBENTITY){
                return new SqlNode_DBEntity(nodeData, self, creationInfo);
            }
            else{
                console.log('不支持的sql节点:' + nodeData.type);
                console.warn(nodeData);
            }
        });

    }

    preEditing(){
        // call pre enter Editing
    }

    postEditing(){
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

    preEditing(){
        // call pre enter Editing
    }

    postEditing(){
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
        return rlt;
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
}

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

class NodeSocket extends EventEmitter{
    constructor(name, tNode, isIn, initData){
        super();
        Object.assign(this, initData);
        EnhanceEventEmiter(this);
        this.name = name;
        this.node = tNode;
        this.isIn = isIn;
        this.id = tNode.id + '$' + name;
        this.setCurrentComponent = CommonFun_SetCurrentComponent.bind(this);
    }
    
    set(data){
        Object.assign(this, data);
        this.emit('changed');
    }

    getLinks(){
        return this.node.bluePrint.linkPool.getLinksBySocket(this);
    }

    fireLinkChanged(){
        this.emit(Event_LinkChanged);
        var self = this;
        setTimeout(() => {
            self.node.emit('moved');
        }, 20);
    }

    getExtra(key,def){
        if(this.extra == null){
            return def;
        }
        return this.extra[key] == null ? def : this.extra[key];
    }

    setExtra(key, val){
        if(this.extra == null){
            this.extra = {};;
        }
        this.extra[key] = val;
    }

    getJson(){
        var rlt = {
            name:this.name,
            isIn:this.isIn,
            id:this.id,
            defval:this.defval,
        };
        if(this.extra){
            for(var si in this.extra){
                var tVal = this.extra[si];
                if(tval != null){
                    rlt[si] = tVal;
                }
            }
        }
        return rlt;
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

class SqlDef_Variable_Component extends React.PureComponent{
    constructor(props){
        super(props);
        var varData = this.props.varData;
        this.state = {
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            size_1:varData.size_1,
            size_2:varData.size_2,
            editing:varData.needEdit == true,
        };

        autoBind(this);
    }

    varChanged(){
        if(this.state.editing){
            return;
        }
        var varData = this.props.varData;
        this.setState({
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam,
            size_1:varData.size_1,
            size_2:varData.size_2,
        });
    }

    componentWillMount(){
        this.props.varData.on('changed', this.varChanged);
    }

    componentWillUnmount(){
        this.props.varData.off('changed', this.varChanged);
    }

    nameInputChangeHanlder(ev){
        this.setState({
            name:ev.target.value,
        });
    }

    valTypeChangedHandler(newData){
        this.setState({
            valType:newData,
        });
    }

    isParamChangedHandler(newData){
        this.setState({
            isParam:newData.code,
        });
    }

    size1InputChangedHandler(newVal){
        this.setState({
            size_1:isNaN(newVal) ? 0 : parseInt(newVal),
        });
    }

    size2InputChangedHandler(newVal){
        this.setState({
            size_2:isNaN(newVal) ? 0 : parseInt(newVal),
        });
    }

    renderSize(){
        var sizeCount = 0;
        switch(this.state.valType){
            case SqlVarType_NVarchar:
                sizeCount = 1;
                break;
            case SqlVarType_Decimal:
                sizeCount = 2;
                break;
        }
        if(sizeCount > 0){
            return(<div className='d-flex flex-grow-0 flex-shrink-0 w-100'>
                <NameInputRow isagent={true} label='S1' type='int' rootClass='flex-grow-1 flex-shrink-1' value={this.state.size_1} nameWidth='50px' nameColor='rgb(255,255,255)' onValueChanged={this.size1InputChangedHandler} />
                {
                    sizeCount == 2 ? 
                    <NameInputRow isagent={true} label='S2' type='int' rootClass='flex-grow-1 flex-shrink-1' value={this.state.size_2} nameWidth='50px' nameColor='rgb(255,255,255)' onValueChanged={this.size2InputChangedHandler} />
                    : null
                }
            </div>);
        }
        return null;
    }

    clickEditBtnHandler(){
        if(this.state.editing){
            var tval = Object.assign({},this.state);
            tval.editing = false;
            this.props.varData.setProp(tval);
        }
        this.setState({
            editing:!this.state.editing,
        });
    }

    clickTrashHandler(){
        gTipWindow.popAlert(makeAlertData('警告','确定删除变量:"' + this.state.name + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo]));
    }

    deleteTipCallback(key){
        if(key == 'ok'){
            this.props.varData.bluePrint.removeVariable(this.props.varData);
        }
    }

    labelMouseDownHandler(ev) {
        this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 300);
        window.addEventListener('mouseup', this.labelWindowMouseUpHandler);
    }

    labelWindowMouseUpHandler(ev) {
        if (this.dragTimeOut) {
            clearTimeout(this.dragTimeOut);
        }
    }

    genDragContentFun(){
        var varData = this.props.varData;
        return (<span className='text-nowrap border bg-dark text-light'>{'变量:' + varData.name}</span>)
    }

    dragTimeOutHandler() {
        var designer = this.props.varData.bluePrint.master.project.designer;
        designer.startDrag({info:'放置变量'}, this.dragEndHandler, this.genDragContentFun);
    }

    dragMenuCallBack(menuItem, pos){
        var varData = this.props.varData;
        if(menuItem.key == 'SET'){
            this.props.editor.addVarGSNode({isGet:false, varName:varData.name}, pos)
        }
        else if(menuItem.key == 'GET'){
            //console.log('get');
            this.props.editor.addVarGSNode({isGet:true, varName:varData.name}, pos)
        }
    }

    dragEndHandler(pos){
        var editorRect = this.props.editor.zoomDivRef.current.getBoundingClientRect();
        if(MyMath.isPointInRect(editorRect, pos)){
            var designer = this.props.varData.bluePrint.master.project.designer;
            var varData = this.props.varData;
            designer.propUpMenu([new QuickMenuItem('Set ' + varData.name, 'SET'),new QuickMenuItem('Get ' + varData.name, 'GET')]
                ,pos
                ,this.dragMenuCallBack
            );
        }
    }

    render() {
        var varData = this.props.varData;
        var editing = this.state.editing;
        if(!editing){
            return(
                <div className='d-flex flex-grow-0 flex-shrink-0 w-100 text-light align-items-center hidenOverflo'>
                    <i className={'fa fa-edit fa-lg'} onClick={this.clickEditBtnHandler} />
                    <div className='flex-grow-1 flex-shrink-1 text-nowrap cursor-arrow dragableItem'
                         onMouseDown={this.labelMouseDownHandler}>
                        {'' + varData}
                    </div>
                    <i className={'fa fa-trash fa-lg'} onClick={this.clickTrashHandler} />
                </div>
            )
        }
        return(
        <div className='d-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary'>
            <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center'>
                <i className={'fa fa-edit fa-lg text-' + (editing ? 'success' : 'info')} onClick={this.clickEditBtnHandler} />
                <input onChange={this.nameInputChangeHanlder} type='text' value={this.state.name} className='flexinput flex-grow-1 flex-shrink-1' />
            </div>
            <div className='d-flex w-100 flex-grow-0 flex-shrink-0 align-items-center'>
                <DropDownControl itemChanged={this.valTypeChangedHandler} btnclass='btn-dark' options_arr={SqlVarTypes_arr} rootclass='flex-grow-1 flex-shrink-1' textAttrName='name' valueAttrName='code' value={this.state.valType} /> 
                <DropDownControl itemChanged={this.isParamChangedHandler} btnclass='btn-dark' options_arr={ISParam_Options_arr} rootclass='flex-grow-0 flex-shrink-0' textAttrName='name' valueAttrName='code' value={this.state.isParam} /> 
            </div>
            {
                this.renderSize()
            }
        </div>);
        /*
        if(this.state.editing){
            return <div className='d-flex bg-dark flex-grow-0 flex-shrink-0'><button type='button' className='btn btndark flex-grow-1 flex-shrink-1'>{this.state.name + '  ' + this.state.valType}</button></div>
        }
        else{
            return <div className='d-flex bg-dark flex-grow-0 flex-shrink-0'><button type='button' className='btn btndark flex-grow-1 flex-shrink-1'>{this.state.name + '  ' + this.state.valType}</button></div>
        }
        */
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

    preEditing(){
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

    preEditing(){
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

    postEditing(){
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

class C_Node_Socket extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.flagRef = React.createRef();
        this.inputRef = React.createRef();
        this.state={
            socket:this.props.socket,
            draging:this.props.draging == true,
        }
    }

    clickHandler(ev){
        this.props.editor.clickSocket(this.props.socket);
    }

    getCenterPos(){
        var socket = this.state.socket;
        var nodeData = socket.node;
        if(nodeData.currentFrameCom == null || nodeData.currentFrameCom.rootDivRef.current == null){
            return null;
        }
        var baseRect = nodeData.currentFrameCom.rootDivRef.current.getBoundingClientRect();
        var rect = this.flagRef.current.getBoundingClientRect();
        return {x:Math.round(nodeData.left + (rect.left - baseRect.left) + rect.width * 0.5), y:Math.round(nodeData.top + (rect.top - baseRect.top)  + rect.height * 0.5)};
    }

    componentWillMount(){
        this.listenData(this.state.socket);
        this.state.socket.setCurrentComponent(this);
    }

    componentWillUnmount(){
        this.unlistenData(this.state.socket);
        this.state.socket.setCurrentComponent(null);
    }

    nodeDataChangedHandler(ev){
        var socket = this.state.socket;
        if(socket.node.parent == null){
            return; // node removed
        }
        this.setState({
            magicobj:{}
        });
    }

    getContent(){
    }
    
    listenData(socket){
        if(socket){
            socket.on('changed', this.nodeDataChangedHandler);
            socket.on(Event_LinkChanged, this.nodeDataChangedHandler);
        }
        
    }

    unlistenData(socket){
        if(socket){
            socket.off('changed', this.nodeDataChangedHandler);
            socket.off(Event_LinkChanged, this.nodeDataChangedHandler);
        }
    }

    inputChangedHandler(ev){
        var socket = this.props.socket;
        socket.set({defval:ev.target.value});
    }

    mouseDownDragIconHandler(ev){
        if(this.props.startDragAct != null){
            this.props.startDragAct(this);
        }
    }

    setDraging(val){
        this.setState({
            draging:val == true,
        });
    }

    render(){
        var socket = this.props.socket;
        if(this.props.socket != this.state.socket){
            var self = this;
            this.unlistenData(this.state.socket);
            this.listenData(socket);
            setTimeout(() => {
                self.setState({
                    socket:socket,
                });
            }, 10);
            return null;
        }
        var inputable = socket.isIn && SqlVarInputableTypes_arr.indexOf(socket.type) != -1;
        if(socket.inputable == false){
            inputable = false;
        }
        var inputElem = null;
        if(inputable){
            var links = socket.getLinks();
            if(links.length > 0){
                inputable = false;
            }
        }
        if(inputable)
        {
            inputElem = (<input type='text' ref={this.inputRef} className='socketInputer' onChange={this.inputChangedHandler} value={socket.defval == null ? '' : socket.defval} />);
        }
        var dragElem = null;
        if(this.props.startDragAct){
            dragElem = (<div className={'btn btn-' + (this.state.draging ? 'primary' : 'dark')} onMouseDown={this.mouseDownDragIconHandler}><i className='fa fa-arrows-v cursor-pointer' /></div>);
        }
        var cusElem = socket.node.customSocketRender(socket);

        var iconElem = (<i ref={this.flagRef} onClick={this.clickHandler} className='fa fa-circle-o cursor-pointer nodesocket' vt={socket.type} /> );
        return <div className='d-flex align-items-center text-nowrap text-light socketCell' d-socketid={socket.id}> 
                    {
                        this.props.align == 'left' &&
                        <React.Fragment>
                            {iconElem}
                            {dragElem}
                            {inputElem}
                            {cusElem}
                        </React.Fragment>
                    }
                    <div f-canmove={this.props.nameMoveable ? '1' : null}>{socket.label}</div>
                    {
                        this.props.align != 'left' &&
                        <React.Fragment>
                            {cusElem}
                            {inputElem}
                            {dragElem}
                            {iconElem}
                        </React.Fragment>
                    }
                </div>
    }
}


class C_SqlNode_Frame extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        this.state={
            editingTitle:false,
            moving:this.props.nodedata.newborn == true,
        }

        this.rootDivRef = React.createRef();

        if(this.props.nodedata.newborn){
            var self = this;
            setTimeout(() => {
                if(self.state.moving){
                    self.startMove(null);
                    this.props.editor.setSelectedNF(this);
                }
            }, 10);
        }
    }

    reDraw(){
        this.setState(
            {
                magicobj:{},
            }
        );
    }

    addOffset(offset){
        var nodeData = this.props.nodedata;
        nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
        this.reDraw();
    }

    startMove(moveBase){
        this.moveBase=moveBase;
        window.addEventListener('mousemove',this.mousemoveWidthMoveHandler);
        window.addEventListener('mouseup',this.mouseupWidthMoveHandler);
        this.setState(
            {
                moving:true,
            }
        );
        
        if(this.movingInt == null){
            this.movingInt = setInterval(this.movingIntHandler,100);
        }
        this.targetScroll = null;
    }
    
    endMove(){
        window.removeEventListener('mousemove',this.mousemoveWidthMoveHandler);
        window.removeEventListener('mouseup',this.mouseupWidthMoveHandler);
        this.props.nodedata.newborn = false;
    
        if(this.state.moving){
            this.setState(
                {
                    moving:false,
                }
            );
        }
        if(this.movingInt){
            clearInterval(this.movingInt);
            this.movingInt = null;
        }
    }
    
    clickEditTitleHandler(){
        this.setState(
            {
                editingTitle:!this.state.editingTitle,
            }
        );
        this.props.nodedata.fireMoved(10);
    }
    
    nodeTitleInputChangeHandler(ev){
        var inputStr = ev.target.value;
        this.props.nodedata.title = inputStr.trim();
        this.props.nodedata.fireChanged();
        this.reDraw();
    }
    
    nodeTitleInputKeypressHandler(ev){
        if (ev.nativeEvent.keyCode == 13) {
            this.setState(
                {
                    editingTitle:false,
                }
            );
        }
    }

    componentWillUnmount(){
        this.endMove();
        this.unmounted = true;
        this.props.nodedata.currentFrameCom = null;
        this.props.nodedata.fireEvent(Event_FrameComUnMount, 10);
    }

    componentWillMount(){
        this.props.nodedata.currentFrameCom = this;
        this.props.nodedata.fireEvent(Event_FrameComMount, 10);
    }
    
    mousemoveWidthMoveHandler(ev){
        var moveBase = this.moveBase;
        if(moveBase == null){
            moveBase = {
                x:0, 
                y:0
            };
        }
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var rootDiv = this.rootDivRef.current;
        var editorRootDivRect = editorRootDiv.getBoundingClientRect();
        var editorScale = editorRootDivRect.scale;
        if(editorScale == null || isNaN(editorScale)){
            editorScale = 1;
        }
        var mouseX = ev.x;
        var mouseY = ev.y;
        var localPos = {
            x:mouseX - editorRootDivRect.left,
            y:mouseY - editorRootDivRect.top,
        }
        var editorDiv = this.props.editor.editorDivRef.current;
        var newX = localPos.x - parseUnitInt(editorDiv.style.left) + moveBase.x;
        var newY = localPos.y - parseUnitInt(editorDiv.style.top) + moveBase.y;
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        rootDiv.style.left = newX + 'px';
        rootDiv.style.top = newY + 'px';
        var nodeData = this.props.nodedata;
        nodeData.setPos(newX, newY);
        return;

        scrollDivRect = {
            left:Math.round(scrollDivRect.left * editorScale),
            right:Math.round(scrollDivRect.right * editorScale),
            top:Math.round(scrollDivRect.top * editorScale),
            bottom:Math.round(scrollDivRect.bottom * editorScale),
            width:Math.round(scrollDivRect.width * editorScale),
            height:Math.round(scrollDivRect.height * editorScale),
        };
        //console.log(scrollDivRect);
        //console.log(WindowMouse);
        if(!MyMath.isPointInRect(scrollDivRect, WindowMouse)){
            console.log('not hit : ' );
            return;
        }
        var editorDivRect = this.props.editorDivRef.current.getBoundingClientRect();
        var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
        if(moveBase == null){
            moveBase = {
                x:0, 
                y:0
                        //x:-(editorDivRect.left + Math.round(rootDivRect.width * 0.5)), 
                        //y:-(editorDivRect.top + Math.round(rootDivRect.height * 0.5))
                    };
        }
        else{
            /*
            moveBase = {
                x:-(editorDivRect.left - moveBase.x), 
                y:-(editorDivRect.top - moveBase.y), 
            }
            */
        }
        //console.log(moveBase);
        var mouseX = ev.x;
        var mouseY = ev.y;
        var localMouseX = ev.x - scrollDivRect.left + scrollDiv.scrollLeft;
        var localMouseY = ev.y - scrollDivRect.top + scrollDiv.scrollTop;
        localMouseX /= editorScale;
        localMouseY /= editorScale;
        var newX = localMouseX + moveBase.x;
        var newY = localMouseY + moveBase.y;
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        var newRight = newX + rootDivRect.width;
        var newBottom = newY + rootDivRect.height;
        //console.log('moveBase:' + JSON.stringify(moveBase));
        //console.log('mouseX:' + mouseX + 'mouseY:' + mouseY);
        //console.log('localMouseX:' + localMouseX + 'localMouseY:' + localMouseY);
        //console.log('editorScale:' + editorScale);
        if(newX<0){
            newX = 0;
        }
        else if(newRight > editorDivRect.width){
            newX = editorDivRect.width - rootDivRect.width;
        }
        if(newY<0){
            newY = 0;
        }
        else if(newBottom > editorDivRect.height){
            newY = editorDivRect.height - rootDivRect.height;
        }
        this.rootDivRef.current.style.left = newX + 'px';
        this.rootDivRef.current.style.top = newY + 'px';
        //console.log('nx:' + newX + ';ny:' + newY);
    
        var nodeData = this.props.nodedata;
        nodeData.left = newX;
        nodeData.top = newY;
    
        
        var targetScroll = {
            x:scrollDiv.scrollLeft,
            y:scrollDiv.scrollTop,
        };
        var scrollgap = 50;
        if(newRight > scrollDiv.scrollLeft + scrollDivRect.width - scrollgap){
            targetScroll.x += newRight - scrollDiv.scrollLeft - scrollDivRect.width + scrollgap;
        }
        else if(newX < scrollDiv.scrollLeft + scrollgap){
            targetScroll.x += newX - scrollDiv.scrollLeft - scrollgap;
        }
        if(newBottom > scrollDiv.scrollTop + scrollDivRect.height - scrollgap){
            targetScroll.y += newBottom - scrollDiv.scrollTop - scrollDivRect.height + scrollgap;
        }
        else if(newY < scrollDiv.scrollTop + scrollgap){
            targetScroll.y += newY - scrollDiv.scrollTop - scrollgap;
        }
    
        this.targetScroll = {
            x:Math.round(targetScroll.x * editorScale),
            y:Math.round(targetScroll.y * editorScale),
        };
    }
    
    movingIntHandler(){
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var editorDiv = this.props.editor.editorDivRef.current;
        var theRect = editorRootDiv.getBoundingClientRect();
        var offset = {
            left:WindowMouse.x - theRect.left,
            top:WindowMouse.y - theRect.top,
            bottom:theRect.bottom - WindowMouse.y,
            right:theRect.right - WindowMouse.x,
        }
        var gap = 100;
        var autoMove = {x:0,y:0};
        if(offset.left > 0 && offset.left < gap){
            autoMove.x = 1;
        }
        else if(offset.right > 0 && offset.right < gap){
            autoMove.x = -1;
        }
        if(offset.top > 0 && offset.top < gap){
            autoMove.y = 1;
        }
        else if(offset.bottom > 0 && offset.bottom < gap){
            autoMove.y = -1;
        }
        if(autoMove.x != 0 || autoMove.y != 0){
            editorDiv.style.left = (parseUnitInt(editorDiv.style.left) + autoMove.x * 30) + 'px';
            editorDiv.style.top = (parseUnitInt(editorDiv.style.top) + autoMove.y * 30) + 'px';
        }
        return;
        if(this.targetScroll){
            var scrollDiv = this.props.editorDivRef.current.parentNode;
            var difX = this.targetScroll.x - scrollDiv.scrollLeft;
            var difY = this.targetScroll.y - scrollDiv.scrollTop;
            if(Math.abs(difX) > 1){
                var xstep = Math.sign(difX) * Math.min(Math.abs(difX), 50);
                scrollDiv.scrollLeft += xstep;
            }
            if(Math.abs(difY) > 1){
                var ystep = Math.sign(difY) * Math.min(Math.abs(difY), 50);
                scrollDiv.scrollTop += ystep;
            }
        }
    }
    
    mouseupWidthMoveHandler(ev){
        this.endMove();
    }
    
    moveBarMouseDownHandler(ev, forcedo){
        if(!forcedo && ev.target != this.rootDivRef.current && ev.target.getAttribute('f-canmove') == null){
            return;
        }
        var nodeData = this.props.nodedata;
        if(nodeData.isContainer){
            if(this.lastClickTime == null || (Date.now() - this.lastClickTime) > 300){
                this.lastClickTime = Date.now();
            }
            else{
                this.props.editor.setEditeNode(nodeData);
                return;
            }
        }
        this.props.editor.setSelectedNF(this, ev != null && ev.ctrlKey);
        var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
        this.moveBase={x:rootDivRect.left - WindowMouse.x,y:rootDivRect.top - WindowMouse.y};
        this.startMove(this.moveBase);
    }

    setSelected(val){
        this.setState({selected:val});
    }
    
    /*
    clickDeleteHandler(ev){
        this.props.editor.wantDeleteNode(this.props.nodedata, this.getNodeTitle());
    }
    */

    getNodeTitle(readable){
        var nodeData = this.props.nodedata;
        if(readable){
            return nodeData.getNodeTitle();
        }
        return this.props.getTitleFun == null ? (nodeData.title == null ? '' : nodeData.title) : this.props.getTitleFun();
    }


    renderHead(nodeData){
        if(this.props.isPure){
            return null;
        }

        var headType = this.props.headType;
        if(headType == null)
            headType = 'default';
        if(headType == 'tiny'){
            var headElem = this.props.headText;
            if(this.props.cusHeaderFuc != null){
                headElem = this.props.cusHeaderFuc();
            }
            return <div className='d-flex nodeHead align-items-center' type='tiny' >
                        {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                        <div className='flex-grow-1 flex-shrink-0 text-nowrap text-center' f-canmove={1} >
                            {headElem}
                        </div>
                        {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                    </div>
        }
        else if(headType == 'empty'){
            return null;
        }

        if(headType == 'default'){
            var nodeTitle = this.getNodeTitle();
            return  <React.Fragment>
                        <div className='bg-light d-flex align-items-center text-dark' style={{fontSize:'1em'}}>
                            <div className='flex-grow-1 flex-shrink-1 text-nowrap' f-canmove={1}>
                                {nodeData.label}:
                                {
                                    this.state.editingTitle ? <input className='' type='text' value={nodeTitle} onChange={this.nodeTitleInputChangeHandler} onKeyPress={this.nodeTitleInputKeypressHandler} />
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

    renderButtons(){
        var nodeData = this.props.nodedata;
        if(nodeData.frameButtons_arr.length == 0)
        {
            return null;
        }
        return (<div className='btn-group flex-grow-1 flex-shrink-1'>
                    {nodeData.frameButtons_arr.map(btnData=>{
                        return <button key={btnData.name} type='button' onClick={this.clickFrameButtonHandler} className='btn btn-dark' d-btnname={btnData.name} >{btnData.label}</button>
                    })}
                </div>)
    }

    clickFrameButtonHandler(ev){
        var btnName = getAttributeByNode(ev.target, 'd-btnname', true);
        if(btnName != null){
            this.props.nodedata.clickFrameButton(btnName);
        }
    }

    render(){
        var nodeData = this.props.nodedata;
        var posStyle = {left:parseInt(nodeData.left) + 'px','top':parseInt(nodeData.top), 'paddingTop':this.props.isPure ? '0.5em' : null };
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


class C_SqlNode_DBEntity extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

        this.state={
        }

        this.dropdownRef = React.createRef();
    }
    
    nodeDataChangedHandler(){
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if(entity){
            this.dropdownRef.current.setValue(entity.code);
        }
        this.setState({magicObj:{}});
    }

    cus_componentWillMount(){
        this.listenData(this.props.nodedata);
    }

    cus_componentWillUnmount(){
        this.unlistenData(this.props.nodedata);
    }

    listenData(nodeData){
        if(nodeData){
            nodeData.on('changed', this.nodeDataChangedHandler);
        }
    }

    unlistenData(nodeData){
        if(nodeData){
            nodeData.off('changed', this.nodeDataChangedHandler);
        }
    }

    dropdownCtlChangedHandler(selectedDBE){
        var nodeData = this.props.nodedata;
        nodeData.setEntity(selectedDBE);
    }

    getNodeTitle(){
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if(nodeData.title && nodeData.title.length > 0){
            return nodeData.title;
        }
        var nodeTitle = entity == null ? '' : (entity.loaded ? '' : '正在加载:' + entity.code);
        return nodeTitle;
    }

    render(){
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor}>
                <div className='d-flex'>
                    <div className='flex-grow-1 flex-shrink-1'>
                        <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.entities_arr} rootclass='flex-grow-1 flex-shrink-1' style={{minWidth:'200px',height:'40px'}} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} /> 
                    </div>
                </div>
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_Select extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

        this.state={
        }
    }
    
    nodeDataChangedHandler(){
    }

    cus_componentWillMount(){
        this.listenData(this.props.nodedata);
    }

    cus_componentWillUnmount(){
        this.unlistenData(this.props.nodedata);
    }

    listenData(nodeData){
        if(nodeData){
            nodeData.on('changed', this.nodeDataChangedHandler);
        }
    }

    unlistenData(nodeData){
        if(nodeData){
            nodeData.off('changed', this.nodeDataChangedHandler);
        }
    }

    renderColumns(){
        var nodeData = this.props.nodedata;
        var columns_arr = nodeData.columns_arr;
        if(columns_arr.length == 0){
            return null;
        }
        return <div className='d-flex flex-column'>
                    <div className="dropdown-divider"></div>
                    <div>Select</div>
                    {
                    columns_arr.map(column=>{
                        return <div key={column.name} className='text-nowrap'>{column.name}</div>
                    })}
                </div>
    }

    renderOrderColumns(){
        var nodeData = this.props.nodedata;
        var columns_arr = nodeData.orderColumns_arr;
        if(columns_arr.length == 0){
            return null;
        }
        return <div className='d-flex flex-column'>
                    <div className="dropdown-divider"></div>
                    <div>Order by</div>
                    {
                    columns_arr.map(column=>{
                        return <div key={column.name} className='text-nowrap'>{column.name + '  ' + column.orderType}</div>
                    })}
                </div>
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor}>
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
                </div>
                {this.renderColumns()}
                {this.renderOrderColumns()}
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Select_Output extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.state={
            nodedata:this.props.nodedata,
        }
    }
    

    nodeDataChangedHandler(){
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        this.unlistenData(this.state.nodedata);
        clearTimeout(this.delaySetTO);
    }

    listenData(nodeData){
    }

    unlistenData(nodeData){
    }

    clickHandler(){
        //console.log('clickHandler');
        this.props.editor.setEditeNode(this.props.nodedata);
    }

    render(){
        if(this.state.nodedata != this.props.nodedata){
            this.unlistenData(this.state.nodedata);
            this.listenData(this.props.nodedata);
            clearTimeout(this.delaySetTO);
            var self = this;
            this.delaySetTO = setTimeout(() => {
                this.setState(
                    {
                        nodedata:this.props.nodedata,
                    }
                );
                self.delaySetTO = null;
            }, 10);
        }
        var nodeData = this.state.nodedata;
        return <C_SqlNode_Frame nodedata={nodeData} clickHandler={this.clickHandler} editor={this.props.editor}>
                <div className='d-flex flex-column'>
                    列名
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_Var_Get extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state={
            //nodedata:this.props.nodedata,
        }
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='GET'>
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_NOperand extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state={
            operator:this.props.nodedata.operator,
        }
    }

    selectItemChangedHandler(newoperator){
        var nodeData = this.props.nodedata;
        nodeData.operator = newoperator;
        this.setState({
            operator:newoperator
        });
    }

    cusHeaderFuc(){
        if(this.ddcStyle == null){
            this.ddcStyle = {
                width:'40px',
                margin:'auto',
            }
        }
        var nodeData = this.props.nodedata;
        return (<DropDownControl options_arr={['+','-','×','÷']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />);
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_XJoin extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state={
            joinType:this.props.nodedata.joinType,
        }
    }

    selectItemChangedHandler(newJoinType){
        var nodeData = this.props.nodedata;
        nodeData.joinType = newJoinType;
        this.setState({
            joinType:newJoinType
        });
    }

    cusHeaderFuc(){
        if(this.ddcStyle == null){
            this.ddcStyle = {
                width:'100px',
                margin:'10px',
            }
        }
        var nodeData = this.props.nodedata;
        return (<DropDownControl options_arr={JoinTypes_arr} value={nodeData.joinType} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />);
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_SimpleNode extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state={
        }
    }

    render(){
        var nodeData = this.props.nodedata;
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_DBEntity_ColumnSelector extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

        this.state={
            hadCheckbox : this.props.nodedata.parent.isSelectColumn != null,
        }

        this.checkmap = {};
    }
    
    nodeDataChangedHandler(){
        this.reDraw();
    }

    selectChangedHandler(data){
        var nodeData = this.props.nodedata;
        var needReDraw = false;
        if(data.tableAlias){
            needReDraw = data.tableAlias == nodeData.alias;
        }
        else{
            needReDraw = data.tableCode == data.tableCode;
        }
        if(needReDraw)
        {
            this.reDraw();
        }
    }

    cus_componentWillMount(){
        this.listenData(this.props.nodedata);
    }

    cus_componentWillUnmount(){
        this.unlistenData(this.props.nodedata);
    }

    listenData(nodeData){
        if(nodeData){
            nodeData.on('changed', this.nodeDataChangedHandler);
            nodeData.parent.on('selectchanged', this.selectChangedHandler);
        }
    }

    unlistenData(nodeData){
        if(nodeData){
            nodeData.off('changed', this.nodeDataChangedHandler);
            nodeData.parent.off('selectchanged', this.selectChangedHandler);
        }
    }

    mouseDownColumnNameHandler(ev){
        if(ev.button == 0){
            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            var initPos = this.props.editor.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});

            var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
            var column = entity.columns.find(x=>{return x.name == columnName});
            if(column){
                var newNode = parentNodeData.addNewColumn(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, initPos.x, initPos.y, true);
            }
            this.props.editor.reDraw();
        }
    }

    checkboxChangeHandler(ev){
        var nodeData = this.props.nodedata;
        var parentNodeData = nodeData.parent;
        var entity = nodeData.entity;
        var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
        var column = entity.columns.find(x=>{return x.name == columnName});
        if(column)
        {
            parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, !this.checkmap[columnName]);
        }
    }

    renderColumn(entity,column,parentNodeData, nodeData){
        var nodeData = this.props.nodedata;
        var compareKey = (nodeData.alias == null ? entity.code : nodeData.alias) + '.' + column.name;
        var hadCheckbox = this.state.hadCheckbox;
        var isCheck = hadCheckbox ? parentNodeData.isSelectColumn(compareKey) : false;
        this.checkmap[column.name] = isCheck;
        return (<div key={column.name} className='d-flex flex-grow-1 align-items-center ' data-colname={column.name}>
                    {hadCheckbox && <input type='checkbox' onChange={this.checkboxChangeHandler} checked={isCheck} />}
                    <div className='d-flex flex-grow-1 text-nowrap' onMouseDown={hadCheckbox ? this.checkboxChangeHandler : null} >{column.name}</div>
                    <i className='fa fa-hand-paper-o cursor-pointer' onMouseDown={this.mouseDownColumnNameHandler} />
                </div>);
    }

    render(){
        var nodeData = this.props.nodedata;
        var parentNodeData = nodeData.parent;
        var entity = nodeData.entity;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label}>
                <div className='d-flex flex-column'>
                    {entity.columns.map(column=>{
                        return this.renderColumn(entity, column, parentNodeData, nodeData);
                    })}
                </div>
        </C_SqlNode_Frame>
    }
}


function C_SqlNode_componentWillMount(){
    this.props.nodedata.currentComponent = this;
    if(this.cus_componentWillMount != null){
        this.cus_componentWillMount();
    }
}

function C_SqlNode_componentWillUnMount(){
    this.props.nodedata.currentComponent = null;
    if(this.cus_componentWillUnmount != null){
        this.cus_componentWillUnmount();
    }
}

function C_ReDraw(){
    this.setState({
        magicobj:{},
    });
}

function C_SqlNode_Base(target){
    target.frameRef =  React.createRef();
    target.componentWillMount = C_SqlNode_componentWillMount.bind(target);
    target.componentWillUnmount = C_SqlNode_componentWillUnMount.bind(target);
    target.reDraw = C_ReDraw.bind(target);
}

function EV_BanEvent(et){
    var nowVal = this.suspressEvents[et];
    this.suspressEvents[et] = nowVal == null ? 1 : nowVal + 1;
}

function EV_AllowEvent(et){
    var nowVal = this.suspressEvents[et];
    if(nowVal > 0){
        this.suspressEvents[et] = nowVal - 1;
    }
    else{
        console.warn('allowEvent执行时count等于' + nowVal);
    }
}

function EV_FireEvent(et,delay,arg){
    if(this.suspressEvents[et] > 0){
        console.warn(et + '被压抑了');
        return; // 压抑了此事件
    }
    if(delay == null || isNaN(delay)){
        delay = 0;
    }
    if(delay < 0){
        delay = 0;
    }
    else if(delay > 500){
        console.warn('长达' + delay + '毫秒的延迟fire' + et);
    }
    var self = this;
    if(delay > 0)
    {
        setTimeout(() => {
            self.emit(et, arg == null ? self : arg);
        }, delay);
    }
    else{
        self.emit(et, arg == null ? self : arg);
    }
}

function EnhanceEventEmiter(target){
    target.suspressEvents = {};
    target.fireEvent = EV_FireEvent.bind(target);
    target.banEvent = EV_BanEvent.bind(target);
    target.allowEvent = EV_AllowEvent.bind(target);
}

class C_SqlNode_Var_Set extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);

        this.state={
            
        }
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='SET' >
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_ScoketsPanel extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.socketParentRef = React.createRef();
    }

    reRender(){
        this.setState({
            magicObj:{}
        });
    }

    componentWillMount(){
        this.props.nodedata.on(Event_SocketNumChanged, this.reRender);
    }

    componentWillUnmount(){
        this.props.nodedata.off(Event_SocketNumChanged, this.reRender);
    }

    clickAddIconHandler(ev){
        this.props.processFun(true);
    }

    clickSubIconHandler(ev){
        this.props.processFun(false);
    }

    renderDynamic(){
        if(this.props.processFun == null)
            return null;
        return (
            <div className='socketDynamicDiv d-flex'>
                <i className='fa fa-plus-square ml-1 text-primary fa-2x cursor-pointer' onClick={this.clickAddIconHandler} />
                <i className='fa fa-minus-square ml-1 text-danger fa-2x cursor-pointer' onClick={this.clickSubIconHandler} />
            </div>
        );
    }

    startDragSocket(targetSocketCom){
        this.dragingSocket = targetSocketCom.props.socket;
        window.addEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.addEventListener('mousemove', this.mouseMoveWhenDragingHandler);
        targetSocketCom.setDraging(true);

        var theLinks = this.dragingSocket.node.bluePrint.linkPool.getLinksBySocket(this.dragingSocket);
        if(theLinks.length > 0){
            var theLink = theLinks[0];
            var otherNode = theLink.inSocket == this.dragingSocket ? theLink.outSocket.node : theLink.inSocket.node;
            var designer = otherNode.bluePrint.master.project.designer;
            designer.startDrag({info:otherNode.getNodeTitle()}, null, null);
        }
    }

    mouseUpWhenDragingHandler(ev){
        if(this.dragingSocket.currentComponent){
            this.dragingSocket.currentComponent.setDraging(false);
        }
        window.removeEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.removeEventListener('mousemove', this.mouseMoveWhenDragingHandler);
        this.dragingSocket = null;
    }

    mouseMoveWhenDragingHandler(ev){
        if(this.dragingSocket == null){
            mouseUpWhenDragingHandler(null);
            return;
        }
        if(this.socketParentRef.current == null){
            return;
        }
        var sockets_arr = this.props.data;
        for(var i=0;i<sockets_arr.length;++i){
            var theSocket = sockets_arr[i];
            var socketRect = theSocket.currentComponent.flagRef.current.getBoundingClientRect();
            if(ev.y > socketRect.top && ev.y < socketRect.bottom){
                if(theSocket == this.dragingSocket)
                {
                    return; // same socket
                }
                // swap socket
                var dragingIndex = sockets_arr.indexOf(this.dragingSocket);
                if(dragingIndex == -1)
                {
                    console.warn("dragingIndex = -1!");
                    return;
                }
                sockets_arr[dragingIndex] = theSocket;
                sockets_arr[i] = this.dragingSocket;
                this.dragingSocket.node.fireEvent(Event_SocketNumChanged);
                this.dragingSocket.node.fireMoved(10);
                return;
            }
        }
    }

    render(){
        if(this.props.data.length == 0)
            return <div className='flex-grow-1 flex-shrink-1'>
                {
                    this.renderDynamic()
                }</div>;
        
        var isDynamic = this.props.processFun != null;
        return (<div ref={this.socketParentRef} className={'d-flex flex-grow-1 flex-shrink-1 flex-column align-items-' + this.props.align}>
            {
                this.props.data.map(socketObj=>{
                    return <C_Node_Socket key={socketObj.id} socket={socketObj} align={this.props.align == 'start' ? 'left' : 'right'} editor={this.props.editor} nameMoveable={this.props.nameMoveable} startDragAct={isDynamic ? this.startDragSocket : null} draging={socketObj == this.dragingSocket} />
                })
            }
            {
                this.renderDynamic()
            }
        </div>);
    }
}

class SelectItemManager{
    constructor(addCallBack,removeCallBack){
        this.items_arr = [];
        this.removeCallBack = removeCallBack;
        this.addCallBack = addCallBack;

        autoBind(this);
    }

    getIndex(item){
        return this.items_arr.indexOf(item);
    }

    isSelected(item){
        return this.getIndex(item) != -1;
    }

    add(item){
        if(item == null)
            return false;
        var index = this.getIndex(item);
        if(index == -1){
            this.items_arr.push(item);
            if(this.addCallBack != null){
                this.addCallBack(item);
            }
        }
        return true;
    }

    remove(item){
        var index = this.getIndex(item);
        if(index == -1){
            return false;
        }
        if(this.removeCallBack != null){
            this.removeCallBack(item);
        }
        this.items_arr.splice(index, 1);
        return true;
    }

    clear(){
        if(this.items_arr.length == 0)
            return;
        if(this.removeCallBack != null){
            this.forEach(this.removeCallBack);
        }
        this.items_arr = [];
    }

    forEach(act){
        this.items_arr.forEach(act);
    }

    isEmpty(){
        return this.count() == 0;
    }

    count(){
        return this.items_arr.length;
    }
}

class C_SqlNode_Editor extends React.PureComponent{
    constructor(props){
        super(props);

        this.state={
            draing:false,
            editingNode:this.props.bluePrint,
            showLink:false,
            scale:1,
        }

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            })
        }, 50);

        autoBind(this);
        this.dragingPathRef = React.createRef();
        this.editorDivRef = React.createRef();
        this.containerRef = React.createRef();
        this.topBarRef = React.createRef();
        this.zoomDivRef = React.createRef();
        this.selectRectRef = React.createRef();

        var editor = this;
        this.selectedNFManager=new SelectItemManager(this.cb_addNF, this.cb_removeNF);
    }

    reDraw(){
        this.setState({
            magicObj:{},
        });
    }

    blueprinkChanged(ev){
        this.reDraw();
    }

    cb_removeNF(target){
        if(target && !target.unmounted){
            target.setSelected(false);
        }
    }

    cb_addNF(target){
        if(target && !target.unmounted){
            target.setSelected(true);
        }
    }

    setSelectedNF(target, addMode){
        if(target == null){
            this.selectedNFManager.clear();
            return;
        }
        if(this.selectedNFManager.isSelected(target)){
            return;
        }
        if(addMode == null || target == null){
            addMode = false;
        }
        if(!addMode){
            this.selectedNFManager.clear();
        }
        this.selectedNFManager.add(target);
    }

    showNodeData(nodeData){
        if(nodeData.currentComponent){
            var frameElem = nodeData.currentComponent.frameRef.current;
            if(frameElem == null)
                return null;
            this.setSelectedNF(frameElem);
            var frameRect = frameElem.rootDivRef.current.getBoundingClientRect();
            var zoomRect = this.zoomDivRef.current.getBoundingClientRect();
            
            if(!MyMath.intersectRect(frameRect, zoomRect)){
                var targetPos = {
                    x:Math.floor(-nodeData.left + (zoomRect.width - frameRect.width) * 0.5),
                    y:Math.floor(-nodeData.top + (zoomRect.height - frameRect.height) * 0.5),
                };
                //console.log(targetPos);
                this.editorDivRef.current.style.left = targetPos.x  + 'px';
                this.editorDivRef.current.style.top = targetPos.y + 'px';
            }
        }
    }

    keyUpHandler(ev){
        //console.log(ev);
        switch(ev.keyCode){
            case 27:
                // esc
                if(!this.selectedNFManager.isEmpty()){
                    this.setSelectedNF(null);
                }
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
            case 46:
                if(!this.selectedNFManager.isEmpty()){
                    var titles = '';
                    var nodes_arr = [];
                    this.selectedNFManager.forEach(nf=>{
                        titles += nf.getNodeTitle(true) + ';';
                        nodes_arr.push(nf.props.nodedata);
                    });
                    this.wantDeleteNode(nodes_arr, titles);
                }
            break;
        }
    }

    keyDownHandler(ev){
        if(!this.selectedNFManager.isEmpty() && ev.keyCode >= 37 && ev.keyCode <= 40){
            var offset = {x:0,y:0};
            switch(ev.keyCode){
                case 40:
                    offset.y = 10;
                break;
                case 38:
                    offset.y = -10;
                break;
                case 37:
                    offset.x = -10;
                break;
                case 39:
                    offset.x = 10;
                break;
            }
            this.selectedNFManager.forEach(nf=>{
                nf.addOffset(offset);
            });
            ev.preventDefault();
        }
    }

    wantDeleteNode(nodeData_arr, title){
        gTipWindow.popAlert(makeAlertData('警告','确定删除' + nodeData_arr.length + '个节点:"' + title + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo], nodeData_arr));
    }

    deleteTipCallback(key, nodeData_arr){
        if(key == 'ok'){
            this.state.editingNode.bluePrint.deleteNodes(nodeData_arr);
            this.setSelectedNF(null);
        }
    }

    freshZoomDiv(){
        if(this.zoomDivRef.current){
            var zoomDivElem = this.zoomDivRef.current;
            var $containerElem = $(this.containerRef.current);
            var $topBarElem = $(this.topBarRef.current);

            var newZoomDivSize = {
                height : $containerElem.height() - $topBarElem.height(),
                width : $containerElem.width(),
                top : $topBarElem.offset().top - $topBarElem.offsetParent().offset().top + $topBarElem.height()
            };

            if(this.preZoomDivSize == null){
                zoomDivElem.style.height = newZoomDivSize.height + 'px';
                zoomDivElem.style.width = newZoomDivSize.width + 'px';
                zoomDivElem.style.top = newZoomDivSize.top + 'px';
            }
            else{
                if(Math.abs(this.preZoomDivSize.height - newZoomDivSize.height)>1){
                    zoomDivElem.style.height = newZoomDivSize.height + 'px';
                }
                if(Math.abs(this.preZoomDivSize.width - newZoomDivSize.width)>1){
                    zoomDivElem.style.width = newZoomDivSize.width + 'px';
                }
                if(Math.abs(this.preZoomDivSize.top - newZoomDivSize.top)>1){
                    zoomDivElem.style.top = newZoomDivSize.top + 'px';
                }
            }

            this.preZoomDivSize = newZoomDivSize;
            
            
        }
    }

    listenBlueprint(bp){
        if(bp){
            bp.on('changed', this.blueprinkChanged);
        };
        this.listenedBP = bp;
    }

    unlistenBlueprint(bp){
        if(bp){
            bp.off('changed', this.blueprinkChanged);
        }
    }

    componentWillMount(){
        window.addEventListener('keyup', this.keyUpHandler);
        window.addEventListener('keydown', this.keyDownHandler);

        this.freshInt = setInterval(this.freshZoomDiv, 500);
        this.freshZoomDiv();
    }

    componentWillUnmount(){
        window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
        window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('keydown', this.keyDownHandler);
        this.unlistenBlueprint(this.props.bluePrint);
        clearTimeout(this.delaySetTO);
        clearInterval(this.freshZoomDiv);
    }

    mousemoveWidthDragingHandler(ev){
        var rootRect = this.editorDivRef.current.getBoundingClientRect();
        var end = {x:ev.x - rootRect.left, y:ev.y - rootRect.top};
        var dragingPath = this.dragingPathRef.current;
        dragingPath.setState({
            end:end
        });
    }

    mouseupWidthDragingHandler(ev){
        if(ev.target == this.editorDivRef.current){
            if(this.preClickTime != null && (Date.now() - this.preClickTime) < 200){
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
            else{
                this.preClickTime = Date.now();
                return;
            }
        }
    }

    clickSocket(srcSocket){
        console.log(srcSocket);
        var srcNode = srcSocket.node;
        var dragingPath = this.dragingPathRef.current;
        if(dragingPath.state.draging == true){
            var cancelDrag = false;
            if(srcSocket == dragingPath.state.startScoket){
                // 同一个socket连续点击
                cancelDrag = true;
            }
            else if(dragingPath.state.startNode == srcNode){
                // 相同的node 忽略
                //console.log('相同的node');
                return;
            }
            else{
                // 点击了不同的socket
                if(srcSocket.isIn != dragingPath.state.startScoket.isIn){
                    // 不同node的in out才能相互链接
                    this.state.editingNode.bluePrint.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
                    cancelDrag = true;
                }
            }
            if(cancelDrag)
            {
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
                window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
                window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
            }
        }else{
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            dragingPath.setState({
                draging:true,
                start:srcSocket.currentComponent.getCenterPos(),
                end:{x:WindowMouse.x - rootRect.left,y:WindowMouse.y - rootRect.top},
                startScoket:srcSocket,
                startNode:srcNode,
            });
            window.addEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.addEventListener('mouseup', this.mouseupWidthDragingHandler);
        }
    }

    setEditeNode(theNode){
        if(theNode == this.state.editingNode){
            return;
        }
        
        var editingNode = this.state.editingNode;
        var scrollNode = this.editorDivRef.current.parentNode;
        if(editingNode){
            editingNode.scrollLeft = scrollNode.scrollLeft;
            editingNode.scrollTop = scrollNode.scrollTop;

            editingNode.postEditing();
        }
        
        this.setState({
            draging:false,
            editingNode:theNode,
            scale:1,
            showLink:false,
        });

        var self = this;
        setTimeout(() => {
            this.setState({
                showLink:true,
            })
        }, 50);

        if(theNode){
            theNode.preEditing();
            theNode.bluePrint.editingNode = theNode;
            setTimeout(() => {
                scrollNode.scrollLeft = theNode.scrollLeft == null ? 0 : theNode.scrollLeft;
                scrollNode.scrollTop = theNode.scrollTop == null ? 0 : theNode.scrollTop;
            }, 50);
        }
    }

    genSqlNode_Component(CName, nodeData){
        var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
        return <CName key={blueprintPrefix + nodeData.id} nodedata={nodeData} editorDivRef={this.editorDivRef} editor={this} />
    }

    renderNode(nodeData){
        if(nodeData == null)
            return null;
        switch(nodeData.type){
            case SQLNODE_BDBENTITY:
                return this.genSqlNode_Component(C_SqlNode_DBEntity, nodeData);
            break;
            case SQLNODE_SELECT:
                return this.genSqlNode_Component(C_SqlNode_Select, nodeData);
            break;
            case SQLNODE_VAR_GET:
                return this.genSqlNode_Component(C_SqlNode_Var_Get, nodeData);
            break;
            case SQLNODE_VAR_SET:
                return this.genSqlNode_Component(C_SqlNode_Var_Set, nodeData);
            break;
            case SQLNODE_NOPERAND:
                return this.genSqlNode_Component(C_SqlNode_NOperand, nodeData);
            break;
            case SQLNODE_DBENTITY_COLUMNSELECTOR:
                return this.genSqlNode_Component(C_SqlNode_DBEntity_ColumnSelector, nodeData);
            break;
            case SQLNODE_XJOIN:
                return this.genSqlNode_Component(C_SqlNode_XJoin, nodeData);
            break;
            default:
                return this.genSqlNode_Component(C_SqlNode_SimpleNode, nodeData);
            break;
        }

        return null;
    }

    transToEditorPos(pt){
        var $zoomDivElem = $(this.zoomDivRef.current);
        var zoomOffset = $zoomDivElem.offset();

        var x = -parseUnitInt(this.editorDivRef.current.style.left) + pt.x - zoomOffset.left;
        var y = -parseUnitInt(this.editorDivRef.current.style.top) + pt.y - zoomOffset.top;
        return{
            x:x,
            y:y
        }
    }

    addVarGSNode(config, windPos){
        var editingNode = this.state.editingNode;
        //var $zoomDivElem = $(this.zoomDivRef.current);
        //var zoomOffset = $zoomDivElem.offset();
        
        //var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
        //var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
        var editorPos = this.transToEditorPos(windPos);
        var newNodeData = null;
        if(config.isGet){
            newNodeData = new SqlNode_Var_Get({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        else{
            newNodeData = new SqlNode_Var_Set({left:editorPos.x,top:editorPos.y,varName:config.varName}, editingNode);
        }
        this.setState({
            magicObj:{},
        });
    }

    mouseDownNodeCtlrHandler(ctlData){
        var editorDiv = this.editorDivRef.current;
        var editingNode = this.state.editingNode;
        var newNodeData = new ctlData.nodeClass({newborn:true,left:-parseUnitInt(editorDiv.style.left),top:-parseUnitInt(editorDiv.style.top)},editingNode);
        this.setState({
            magicObj:{},
        });
    }

    mousemoveWithDragHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        //var scrollNode = this.editorDivRef.current.parentNode;
        //scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
        //scrollNode.scrollTop = this.dragOrgin.st - offset.y;
        //console.log(offset);
        this.editorDivRef.current.style.left = (this.dragOrgin.left + offset.x )  + 'px';
        this.editorDivRef.current.style.top = (this.dragOrgin.top + offset.y ) + 'px';
    }

    mouseupWithDragHandler(ev){
        this.draging = false;
        window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
        window.removeEventListener('mouseup', this.mouseupWithDragHandler);
    }

    mousemoveWithSelectHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        this.selectRectRef.current.setSize({
            width:offset.x,
            height:offset.y
        });
    }

    mouseupWithSelectHandler(ev){
        // check
        var theRect = this.selectRectRef.current.getRect();
        var hitNodes_arr = [];
        this.state.editingNode.nodes_arr.forEach(node=>{
            var nodeRect = node.getRect();
            if(MyMath.intersectRect(nodeRect, theRect)){
                hitNodes_arr.push(node);
            }
        });
        if(!ev.ctrlKey){
            this.selectedNFManager.clear();
        }
        if(hitNodes_arr.length > 0){
            for(var i in hitNodes_arr){
                this.selectedNFManager.add(hitNodes_arr[i].currentFrameCom);
            }
        }

        window.removeEventListener('mousemove', this.mousemoveWithSelectHandler);
        window.removeEventListener('mouseup', this.mouseupWithSelectHandler);
        this.selectRectRef.current.setSize({
            width:0,
            height:0
        });
    }

    rootMouseDownHandler(ev){
        if(ev.target == this.zoomDivRef.current && this.draging != true){
            var nowPos = {
                x:parseUnitInt(this.editorDivRef.current.style.left),
                y:parseUnitInt(this.editorDivRef.current.style.top),
            }
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y, left:nowPos.x, top: nowPos.y};
            if(ev.button == 0){
                // 拉取选择范围
                var editorPos = this.transToEditorPos({x:WindowMouse.x,y:WindowMouse.y});
                this.selectRectRef.current.setSize({
                    left:editorPos.x,
                    top:editorPos.y
                });
                window.addEventListener('mousemove', this.mousemoveWithSelectHandler);
                window.addEventListener('mouseup', this.mouseupWithSelectHandler);
                return;
            }
            this.draging = true;
            //var scrollNode = this.editorDivRef.current.parentNode;
            //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
            window.addEventListener('mousemove', this.mousemoveWithDragHandler);
            window.addEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }

    mouseWhileHandler(ev){
        console.log(ev);
    }

    clickBigBtnHandler(ev){
        var newScale = Math.min(this.state.scale + 0.1,1);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickSmallBtnHandler(ev){
        var newScale = Math.max(this.state.scale - 0.1,0.3);
        if(newScale != this.state.scale){
            this.setState({
                scale:newScale,
            });
        }
    }

    clickNavBtnHandler(ev){
        var nodeId = getAttributeByNode(ev.target, 'data-id');
        if(nodeId == null)
            return;
        var theNode = this.props.bluePrint.getNodeByID(nodeId);
        if(theNode == this.state.editingNode){
            return;
        }
        this.setEditeNode(theNode);
    }

    clickCompileBtnHandler(ev){
        console.log("Start compile");
    }

    clickExportBtnHandler(ev){
        console.log("Start export");
        var editingNode = this.state.editingNode;
        var json = editingNode.bluePrint.getJson();
        console.log(json);
    }

    render(){
        var editingNode = this.state.editingNode;
        if(this.props.bluePrint != editingNode.bluePrint){
            var self = this;
            clearTimeout(this.delaySetTO);
            this.delaySetTO = setTimeout(() => {
                this.setEditeNode(self.props.bluePrint.editingNode ? self.props.bluePrint.editingNode : self.props.bluePrint); 
                self.delaySetTO = null;
            }, 10);
        }
        var nodeParentList = editingNode.bluePrint.getNodeParentList(editingNode);
        nodeParentList.push(editingNode);
        if(this.editorDivRef.current){
            this.editorDivRef.current.scale = this.state.scale;
        }
        var self = this;
        var blueprintPrefix = editingNode.bluePrint.id + '_';
        if(this.listenedBP != editingNode.bluePrint){
            this.unlistenBlueprint(this.listenedBP);
            this.listenBlueprint(editingNode.bluePrint);
        }
        var linkPool = editingNode.bluePrint.linkPool;

        return (<SplitPanel
                defPercent={0.2}
                maxSize='400px'
                barClass='bg-secondary'
                panel1={
                    <CusDBEEditorLeftPanel onMouseDown={this.mouseDownNodeCtlrHandler} editingNode={editingNode} editorDivRef={this.editorDivRef} editor={self} />
                }
                panel2={
                    <div className='flex-grow-1 flex-shrink-1 d-flex flex-column mw-100' >
                        <div className='flex-grow-1 flex-shrink-1 d-flex flex-column' ref={this.containerRef}>
                            <div className='flex-grow-0 flex-shrink-0 border bg-light ' style={{height:'40px'}} ref={this.topBarRef}>
                                <div className='d-flex flex-grow-1 flex-shrink-1'>
                                    <ul className="nav nav-pills flex-grow-1 flex-shrink-1">
                                        {
                                            nodeParentList.map(nodeData=>{
                                                return (<li className="nav-item" key={nodeData.id}> 
                                                            <a className={"nav-link" + (nodeData == editingNode ? ' active' : '')} href="#" data-id={nodeData.id} onClick={this.clickNavBtnHandler}>
                                                                {nodeData.getNodeTitle()}
                                                                {nodeData != editingNode && <i className='fa fa-angle-right ml-1' />}
                                                            </a>
                                                        </li>)
                                            })
                                        }
                                    </ul>
                                    <div className='btn-group flex-grow-0 flex-shrink-0'>
                                        <button type='button' onClick={this.clickCompileBtnHandler} className='btn btn-dark' >编译</button>
                                        <button type='button' onClick={this.clickExportBtnHandler} className='btn btn-dark' >导出</button>
                                        <button type='button' onClick={this.clickBigBtnHandler} className='btn btn-dark' ><i className='fa fa-search-plus' /></button>
                                        <button type='button' onClick={this.clickSmallBtnHandler} className='btn btn-dark' ><i className='fa fa-search-minus' /></button>
                                    </div>
                                </div>
                            </div>
                            <div className='flex-grow-1 flex-shrink-1 position-absolute hidenOverflow' style={{zoom:this.state.scale}} ref={this.zoomDivRef} onMouseDown={this.rootMouseDownHandler} >
                                <div ref={this.editorDivRef} className='d-block position-absolute bg-dark' style={{width:'10px',height:'10px',overflow:'visible'}}>
                                    {
                                        editingNode.nodes_arr.map(nd=>{
                                            return this.renderNode(nd) //<G_Node key={nd.id} data={nd} />
                                        })
                                    }
                                    <C_Node_Path ref={this.dragingPathRef} editorDivRef={this.editorDivRef} />
                                    {
                                        this.state.showLink && linkPool.getAllLink().map((linkobj=>{
                                            return <C_Node_Path key={blueprintPrefix + linkobj.id} link={linkobj} editorDivRef={this.editorDivRef} />
                                        }))
                                    }
                                    <C_SelectRect ref={this.selectRectRef}/>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                />);
    }
}

class C_SelectRect extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.state = {
            left:0,
            top:0,
            width:0,
            height:0
        }
    }

    setSize(size){
        this.setState(size);
    }

    getRect(){
        var nowSize = this.state;
        var rlt = {
            left:this.state.left + (nowSize.width < 0 ? nowSize.width : 0),
            top:this.state.top + (nowSize.height < 0 ? nowSize.height : 0),
            width:Math.abs(this.state.width),
            height:Math.abs(this.state.height)
        }
        rlt.right = rlt.left + rlt.width;
        rlt.bottom = rlt.top + rlt.height;
        return rlt;
    }

    render(){
        if(this.state.width == 0 || this.state.height == 0)
            return null;
        
        var nowSize = this.state;
        var style = {
            left:this.state.left + (nowSize.width < 0 ? nowSize.width : 0) + 'px',
            top:this.state.top + (nowSize.height < 0 ? nowSize.height : 0) +'px',
            width:Math.abs(this.state.width) + 'px',
            height:Math.abs(this.state.height) + 'px',
        }
        return <div className='selectRect' style={style} />
    }
}

class C_Node_Path extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
        var initState = {};
        if(this.props.link){
            initState.start = this.props.link.outSocket.currentComponent ? this.props.link.outSocket.currentComponent.getCenterPos() : null;
            initState.end = this.props.link.inSocket.currentComponent ? this.props.link.inSocket.currentComponent.getCenterPos() : null;
            initState.link = this.props.link;
        }
        else{
            initState.start = this.props.start;
            initState.end = this.props.end;
        }
        this.state=initState;

        this.rootDivRef = React.createRef();
    }

    startNodeMovedHandler(){
        var newVal = this.state.link.outSocket.currentComponent ? this.state.link.outSocket.currentComponent.getCenterPos() : null;
        this.setState({
            start : newVal
        });
    }

    endNodeMovedHandler(){
        var newVal = this.state.link.inSocket.currentComponent ? this.state.link.inSocket.currentComponent.getCenterPos() : null;
        this.setState({
            end : newVal
        });
    }

    componentWillMount(){
        if(this.props.link){
            this.props.link.outSocket.node.on('moved', this.startNodeMovedHandler);
            this.props.link.outSocket.node.on(Event_CurrentComponentchanged, this.startNodeMovedHandler);
            this.props.link.inSocket.node.on('moved', this.endNodeMovedHandler);
            this.props.link.inSocket.node.on(Event_CurrentComponentchanged, this.endNodeMovedHandler);
        }
    }

    componentWillUnmount(){
        if(this.props.link){
            this.props.link.outSocket.node.off('moved', this.startNodeMovedHandler);
            this.props.link.outSocket.node.off(Event_CurrentComponentchanged, this.startNodeMovedHandler);
            this.props.link.inSocket.node.off('moved', this.endNodeMovedHandler);
            this.props.link.inSocket.node.off(Event_CurrentComponentchanged, this.endNodeMovedHandler);
        }
    }

    mouseDownHandler(ev){
        if(ev.altKey){
            console.log('delete link');
            if(this.props.link){
                this.props.link.pool.removeLink(this.props.link);
            }
        }
    }

    render() {
        var start = this.state.start;
        var end = this.state.end;
        if(start == null || end == null)
            return null;
        var dis = Math.round(MyMath.disBetweenPoint(start,end));
        //console.log('dis:' + dis);
        var angle = dis == 0 ? 0 : Math.asin((end.y - start.y) / dis) * (180 / Math.PI);
        if(end.x < start.x){
            if(end.y > start.y)
                angle = 180 - angle;
            else
                angle = -180 - angle;
        }
        //console.log(angle);
        var thisStyle = {width:dis + 'px', height:'2px',transform:'rotate(' + angle + 'deg)',left:start.x + 'px',top:start.y + 'px'};
        return (
            <div ref={this.rootDivRef} className='nodepath' style={thisStyle} draging={this.state.draging ? 1 : null} onMouseDown={this.mouseDownHandler}>
                
            </div>
        );
    }
}

class G_Node extends React.PureComponent{
    constructor(props){
        super(props);
    }

    render(){
        return <div className='position-absolute border d-flex flex-column' style={{left:'100px',top:'80px'}}>
                <div className='text-center border-bottom'><h3>节点标题</h3></div>
                <div className='d-flex'>
                    <div className='d-flex flex-column flex-grow-1'>
                        输入
                        <div className='d-flex align-items-baseline'>
                            <i className="fa fa-circle-o"></i> 
                            <div className='ml-1'>我当你翻开历史得分人会</div>
                        </div>
                    </div>
                    <div className='d-flex flex-column flex-grow-1 border-left'>
                        输出
                        <div className='d-flex align-items-baseline'>
                            <div className='ml-1'>a</div>
                            <i className="fa fa-circle-o"></i> 
                        </div>
                    </div>
                </div>
            </div>
    }
}

class CusDBEEditor extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            
        };
        autoBind(this);
        this.editorDivRef = React.createRef();
        this.bluePrintRef = React.createRef();
    }

    componentWillMount(){

    }

    componentWillUnmount(){
        if(this.draging){
            window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
            window.removeEventListener('mouseup', this.mouseupWithDragHandler);
        }
    }

    render(){
        var editingItem = this.props.item;
        if(editingItem == null){
            return null;
        }
        return (
            <C_SqlNode_Editor ref={this.bluePrintRef} bluePrint={editingItem} editorDivRef={this.editorDivRef} />
        );
    }
}

const cusDBEditorControls_arr =[
    {
        label:'源',
        nodeClass:SqlNode_DBEntity,
    },
    {
        label:'选择',
        nodeClass:SqlNode_Select,
    },
    {
        label:'多元运算',
        nodeClass:SqlNode_NOperand,
    }
    ,
    {
        label:'Join',
        nodeClass:SqlNode_XJoin,
    }
]; 

class SqlNodeOutlineItem extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);

        this.state = {
            label:this.props.nodeData.getNodeTitle(true),
        }
    }

    componentWillMount(){
        this.props.nodeData.on('changed', this.nodeChangedhandler);
    }

    componentWillUnmount(){
        this.props.nodeData.off('changed', this.nodeChangedhandler);
    }

    nodeChangedhandler(){
        this.setState({
            label:this.props.nodeData.getNodeTitle(),
        });
    }

    clickHandler(ev){
        this.props.clickHandler(this.props.nodeData);
    }

    render(){
        return <div className='text-nowrap text-light cursor-pointer'  onClick={this.clickHandler}>{this.state.label}</div>
    }
}

class CusDBEEditorLeftPanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    listenNode(node){
        if(node){
            node.on('changed', this.editingNodeChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('changed', this.editingNodeChangedhandler);
        }
    }

    componentWillMount(){
        //listenNode(this.state.editingNode);
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    editingNodeChangedhandler(){
        this.setState({
            magicObj:{},
        });
    }

    clickOutlineImteHandler(nodeData){
        this.props.editor.showNodeData(nodeData);
    }

    render() {
        if(this.listenedNode != this.props.editingNode){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode);
        }
        return (
            <SplitPanel 
                fixedOne={true}
                maxSize={200}
                defPercent={0.3}
                flexColumn={true}
                panel1={
                    <div className='w-100 h-100 autoScroll d-flex flex-column'>
                        {
                            this.props.editingNode.nodes_arr.map(nodeData=>{
                                return <SqlNodeOutlineItem key={nodeData.id} nodeData={nodeData} clickHandler={this.clickOutlineImteHandler} />
                            })
                        }
                    </div>
                }
                panel2={
                    <div className='d-flex flex-column h-100 w-100'>
                        <CusDBEEditorVariables editingNode={this.props.editingNode} editor={this.props.editor} />
                        <CusDBEEditorCanUseNodePanel editingNode={this.props.editingNode} onMouseDown={this.props.onMouseDown} editor={this.props.editor} />
                    </div>
                }
            />
        );
    }
}

class CusDBEEditorCanUseNodePanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    mouseDownHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var ctlItem = cusDBEditorControls_arr.find(item=>{return item.label == itemValue});
        if(ctlItem){
            this.props.onMouseDown(ctlItem);
        }
    }

    render() {
        var targetID = this.props.editingNode.bluePrint.code + 'canUseNode';
        return (
            <React.Fragment>
                <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}>可用节点</button>
                <div id={targetID} className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        <div className='btn-group-vertical mw-100'>
                            {
                                cusDBEditorControls_arr.map(
                                    item=>{
                                        return <button key={item.label} onMouseDown={this.mouseDownHandler} data-value={item.label} type="button" className="btn flex-grow-0 flex-shrink-0 btn-dark text-left">{item.label}</button>
                                    }
                                )
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class CusDBEEditorVariables extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    mouseDownHandler(ev){
        var itemValue = getAttributeByNode(ev.target, 'data-value');
        if(itemValue == null)
            return;
        var ctlItem = cusDBEditorControls_arr.find(item=>{return item.label == itemValue});
        if(ctlItem && this.props.onMouseDown){
            this.props.onMouseDown(ctlItem);
        }
    }

    clickAddHandler(ev){
        this.props.editingNode.bluePrint.createEmptyVariable();
    }

    varChangedhandler(){
        this.setState({
            magicobj:{}
        });
    }

    listenNode(node){
        if(node){
            node.on('varChanged', this.varChangedhandler);
        }
        this.listenedNode = node;
    }

    unlistenNode(node){
        if(node){
            node.off('varChanged', this.varChangedhandler);
        }
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        this.unlistenNode(this.props.editingNode);
    }

    render() {
        if(this.listenedNode != this.props.editingNode.bluePrint){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode.bluePrint);
        }
        var blueprintPrefix = this.props.editingNode.bluePrint.id + '_';
        var targetID = blueprintPrefix + 'variables';
        return (
            <React.Fragment>
                <div className='flex-grow-0 flex-shrink-0 bg-secondary d-flex align-items-center'>
                    <button type="button" data-toggle="collapse" data-target={"#" + targetID} className='btn bg-secondary flex-grow-1 flex-shrink-1 text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}> 变量</button>
                    <i className='fa fa-plus fa-lg text-light cursor-pointer' onClick={this.clickAddHandler} style={{width:'30px'}} />
                </div>
                <div id={targetID} className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <div className='mw-100 d-flex flex-column'>
                        <div className='btn-group-vertical mw-100'>
                            {
                                this.props.editingNode.bluePrint.vars_arr.map(varData=>{
                                    return <SqlDef_Variable_Component belongNode={this.props.editingNode} key={blueprintPrefix + varData.id} varData={varData} editor={this.props.editor} />
                                })
                            }
                        </div>
                    </div>
                    </div>
            </React.Fragment>
        );
    }
}

class NameInputRow extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            value:this.props.default ? this.props.default : '',
            isagent:this.props.isagent == true,
        }
        autoBind(this);
    }

    inputChangedHandler(ev){
        if(!this.state.isagent){
            this.setState({
                value:ev.target.value,
            });
        }
        if(this.props.onValueChanged){
            this.props.onValueChanged(ev.target.value);
        }
    }

    getValue(){
        return this.state.isagent ? this.props.value : this.state.value;
    }

    selectItemChangedHandler(data){
        if(!this.state.isagent){
            this.setState({
                value:data,
            });
        }
        if(this.props.onValueChanged){
            this.props.onValueChanged(data);
        }
    }

    renderInput(){
        var type=this.props.type;
        var value = this.state.isagent ? this.props.value : this.state.value;
        switch(type){
            case 'text':
            case 'int':
            case 'float':
            case 'number':
                return <input type='string' onChange={this.inputChangedHandler} className='flex-grow-1 flex-shrink-1 flexinput' value={value} />
            case 'date':
                return <input type='date' onChange={this.inputChangedHandler} className='flex-grow-1 flex-shrink-1 flexinput' value={value} />
            case 'select':
                return (<DropDownControl options_arr={this.props.options_arr} value={value} itemChanged={this.selectItemChangedHandler} rootclass='flex-grow-1 flex-shrink-1' />);
        }

        return null;
    }
    
    render() {
        var nameStyle = {
            width:this.props.nameWidth ? this.props.nameWidth : '100px',
            color:this.props.nameColor,
        };
        
        return (
            <div className={'d-flex ' + (this.props.rootClass ? this.props.rootClass : '')} style={this.props.rootStyle}>
                <div className='text-center' style={nameStyle} >
                    {this.props.label}
                </div>
                {
                    this.renderInput()
                }
            </div>
        );
    }
}

class AddNewCusDSItemPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
        }
        autoBind(this);

        this.nameRef = React.createRef();
        this.typeRef = React.createRef();
    }

    clickConfirmHandler(){
        var name = this.nameRef.current.getValue().trim();
        if(name.length <= 2){
            this.setState({
                errinfo:'名字的长度必须大于2'
            });
            return;
        }
        if(this.props.dataMaster.hadCusDBE(name)){
            this.setState({
                errinfo:'已有同名的自订数据存在'
            });
            return;
        }
        var type = this.typeRef.current.getValue();
        if(type.length == 0){
            this.setState({
                errinfo:'必须选择类型'
            });
            return;
        }
        var newDBE = this.props.dataMaster.createCusDBE(name, type);
        this.props.onComplete(newDBE);
    }

    clickCancelHandler(){
        this.props.onComplete(null);
    }

    render(){
        var nameWidth = 100;
        return <FloatPanelbase title='新建自订数据' width={480} height={320} initShow={true} sizeable={false} closeable={false} ismodel={true} >
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <div className='d-flex flex-column autoScroll flex-grow-1 flex-shrink-1'>
                        <NameInputRow label='名称' type='text' rootClass='m-1' nameWidth={nameWidth} ref={this.nameRef} />
                        <NameInputRow label='类型' type='select' rootClass='m-1' nameWidth={nameWidth} options_arr={['表值','标量值']} ref={this.typeRef} />   
                        <div className='flex-grow-1 flex-shrink-1 text-info'>
                            {
                                this.state.errinfo
                            }
                        </div>
                    </div>
                    <div className='d-flex flex-grow-0 flex-shrink-0'>
                        <button type='button' onClick={this.clickConfirmHandler} className='btn btn-success flex-grow-1 flex-shrink-1'>创建</button>
                        <button type='button' onClick={this.clickCancelHandler} className='btn btn-danger flex-grow-1 flex-shrink-1'>取消</button>
                    </div>
                </div>
            </FloatPanelbase>
    }
}


class CreateDSItemPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            items_arr:this.props.project.dataMaster.customDBEntities_arr,
            selectedItem:null,
        }
        autoBind(this);
    }

    clickListItemHandler(ev){
        var targetCode = getAttributeByNode(ev.target, 'data-itemvalue', true, 5);
        var targetItem = this.state.items_arr.find(item=>{return item.code == targetCode});
        this.setState({selectedItem:targetItem});
    }

    clickAddBtnhandler(ev){
        this.setState({
            creating:true,
        });
    }

    newCusCompleteHandler(newDBE){
        this.setState({
            creating:false,
        });
    }

    render() {
        var selectedItem = this.state.selectedItem;
        return (
            <React.Fragment>
                {
                    this.state.creating ? <AddNewCusDSItemPanel dataMaster={this.props.project.dataMaster} onComplete={this.newCusCompleteHandler} /> : null
                }
                <SplitPanel
                defPercent={0.45}
                maxSize='200px'
                barClass='bg-secondary'
                panel1={
                    <div className='d-flex flex-column flex-grow-1 flex-shrink-1' >
                        已创建的:
                        <div className='list-group flex-grow-1 flex-shrink-1 bg-dark autoScroll'>
                            {
                                this.state.items_arr.map(item=>{
                                    return <div onClick={this.clickListItemHandler} key={item.code} data-itemvalue={item.code} className={'list-group-item list-group-item-action' + (selectedItem == item ? ' active' : '')}>{item.name + '-' + item.type}</div>
                                })
                            }
                        </div>
                        <button type='button' onClick={this.clickAddBtnhandler} className='btn btn-success'><i className='fa fa-plus' /></button>
                    </div>
                }
                panel2={
                    <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                        <CusDBEEditor item={selectedItem} />
                    </div>
                }
                />
            </React.Fragment>)
    }
}

class DataMasterPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.panelBaseRef = React.createRef();
        this.state = {};

        autoBind(this);

        var navItems = [
            CreateNavItemData('数据库', <DataBasePanel project={this.props.project} />),
            CreateNavItemData('创造数据', <CreateDSItemPanel project={this.props.project} />),
        ];
        this.navData = {
            selectedItem: navItems[1],
            items: navItems,
        };
    }

    show() {
        this.panelBaseRef.current.show();
    }
    close() {
        this.panelBaseRef.current.close();
    }

    toggle() {
        this.panelBaseRef.current.toggle();
    }

    navChanged(oldItem, newItem) {
        this.setState({
            magicObj: {}
        });
    }


    render() {
        return (
            <FloatPanelbase title='数据大师' ref={this.panelBaseRef} initShow={true} initMax={true}>
                <div className='d-flex flex-grow-0 flex-shrink-0'>
                    <TabNavBar navData={this.navData} navChanged={this.navChanged} />
                </div>
                {
                    this.navData.items.map(item => {
                        return (<div key={item.text} className={'flex-grow-1 flex-shrink-1 ' + (item == this.navData.selectedItem ? ' d-flex' : ' d-none')}>
                            {item.content}
                        </div>)
                    })
                }
            </FloatPanelbase>
        );
    }
}