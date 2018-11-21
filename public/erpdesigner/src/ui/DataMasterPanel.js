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
            self.startSynAction('keyword','T503B');
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
            var self = this;
            setTimeout(() => {
                self.bluePrint.emit('changed');
            }, 10);
        }
        return this.link_map[id];
    }

    removeLink(link){
        if(this._deleteLink(link)){
            this.cacheData = null;
            this.bluePrint.emit('changed');
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

    getLinksByNode(theNode){
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket.node == theNode || theLink.outSocket.node == theNode){
                rlt_arr.push(theLink);
            }
        }
        return rlt_arr;
    }

    getLinksBySocket(theSocket){
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket == theSocket || theLink.outSocket == theSocket){
                rlt_arr.push(theLink);
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
        this.nodeIdCounterPool = {};
        var self = this;
        var creationInfo={
            orginID_map:{},
            newID_map:{},
        };
        this.bluePrint = this;
        this.id = this.code;

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
        if(this.nodeIdCounterPool[prefix] == null){
            this.nodeIdCounterPool[prefix] = 0;
        }
        return prefix + (++this.nodeIdCounterPool[prefix]);
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
        this.emit('changed');
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
        this.emit('varChanged');
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
            this.emit('varChanged');
            varData.emit('changed');
        }
    }

    deleteNode(node){
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
            this.emit('changed');
        }
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
}

class SqlNode_Base extends EventEmitter{
    constructor(initData, parentNode, creationInfo, type, label){
        super();
        this.bluePrint = parentNode.bluePrint;
        Object.assign(this, initData);
        this.label = label;
        if(this.type == null)
            this.type = type;
        if(this.left == null)
            this.left = 0;
        if(this.top == null)
            this.top = 0;
        this.hadFlow = true;

        this.bluePrint.registerNode(this, parentNode);

        if(creationInfo)
        {
            creationInfo.save(initData, this);
        }

        this.sockets_map = {};
        this.inputScokets_arr = [];
        this.outputScokets_arr = [];
    }


    getNodeTitle(){
        return this.title == null ? '未命名' : this.title;
    }

    getScoketByName(name, isIn){
        if(isIn == null)
            isIn = '*';
        var rlt = [];
        if(isIn != false){
            rlt.concat(this.inputScokets_arr.filter(item=>{return item.name == name}));
        }

        if(isIn != true){
            rlt.concat(this.outputScokets_arr.filter(item=>{return item.name == name}));
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

    removedSocket(socketObj){
        if(socketObj.isIn){
            removeElemFrommArray(this.inputScokets_arr, socketObj);
        }
        else{
            removeElemFrommArray(this.outputScokets_arr, socketObj);
        }
        this.sockets_map[socketObj.id] = null;
    }

    setPos(newx, newy){
        this.left = newx;
        this.top = newy;
        this.emit('moved');
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
        this.emit(Event_CurrentComponentchanged);
    }
}

class NodeSocket extends EventEmitter{
    constructor(name, tNode, isIn, initData){
        super();
        Object.assign(this, initData);
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
        this.emit('changed');
    }

    toString(){
        var rlt = (this.isParam ? '@' : '') + this.name + '  ' + this.valType;
        switch(this.valType){
            case SqlVarType_NVarchar:
                rlt += '(' + this.size_1 + ')';
                break;
            case SqlVarType_Decimal:
                rlt += '(' + this.size_1 + ',' + this.size_2 + ')';
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

        if(this.targetentity != null){
            var tem_arr = this.targetentity.split('-');
            if(tem_arr[0] == 'dbe'){
                this.targetentity = g_dataBase.getEntityByCode(tem_arr[1]);
                this.targetentity.on('syned', this.entitySynedHandler);
                //console.log(this.targetentity);
            }
            else{
                this.targetentity = null;
            }
        }

        var self = this;
    }

    entitySynedHandler(){
        this.emit('changed');
    }

    setEntity(entity){
        if(this.targetentity == entity)
            return;
        if(this.targetentity != null){
            this.targetentity.off('syned', this.entitySynedHandler);
        }
        this.targetentity = entity;
        if(entity){
            entity.on('syned', this.entitySynedHandler);
        }
        this.emit('changed');
    }
}

class SqlNode_Select extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_SELECT, '选择');
        autoBind(this);

        if(this.columns_arr == null){
            this.columns_ar = [];
        }
        if(this.nodes_arr == null){
            this.nodes_arr = [];
        }

        if(this.innerSocket == null){
            this.innerSocket = new NodeSocket({}, this, true);
        }
    }

    setEntity(entity){
    }
}

class SqlNode_Var_Get extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_VAR_GET, '变量-获取');
        autoBind(this);
        this.hadFlow = false;
        this.outSocket = new NodeSocket('out', this, false);
        this.addSocket(this.outSocket);

        this.varData = this.bluePrint.getVariableByName(this.varName);
        if(this.varData != null){
            this.varData.on('changed', this.varChangedHandler);
        }
        this.varChangedHandler();

        var self = this;
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
        this.emit('changed');
    }

}

class SqlNode_NOperand extends SqlNode_Base{
    constructor(initData, parentNode, creationInfo){
        super(initData, parentNode, creationInfo, SQLNODE_NOPERAND, '运算');
        autoBind(this);

        this.outSocket = new NodeSocket('out', this, false);
        this.addSocket(this.outSocket);
        this.insocketInitVal  = {
            type:SqlVarType_Scalar,
        };
        this.addSocket(this.genInSocket());
        this.addSocket(this.genInSocket());
        if(this.operator == null){
            this.operator = '+';
        }
        this.hadFlow = false;

        var self = this;
    }

    genInSocket(){
        return new NodeSocket('in' + this.inputScokets_arr.length, this, true, this.insocketInitVal);
    }

    processInputSockets(isPlus){
        if(isPlus){
            this.addSocket(this.genInSocket());
            this.emit(Event_SocketNumChanged);
        }
        else{
            if(this.inputScokets_arr.length > 2){
                var needRemoveSocket = this.inputScokets_arr.pop();
                this.bluePrint.linkPool.clearSocketLink(needRemoveSocket);
                this.emit(Event_SocketNumChanged);
            }
        }
    }
}

class SqlNode_JoinNode extends SqlNode_Base{
    constructor(initData){
        super();
        Object.assign(this, initData);
        var self = this;
        this.inSockets_arr.forEach((sd,i)=>{
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        })
    }
}

class D_Node extends EventEmitter{
    constructor(initData){
        super();
        this.id = 
        Object.assign(this, initData);
        var self = this;
        this.inSockets_arr.forEach((sd,i)=>{
            self.inSockets_arr[i] = new D_NodeSocket(sd, self);
        })
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

        var iconElem = (<i ref={this.flagRef} onClick={this.clickHandler} className='fa fa-circle-o cursor-pointer nodesocket' vt={socket.type} /> );
        return <div className='d-flex align-items-center text-nowrap text-light socketCell'> 
                    {this.props.align == 'left' && iconElem}
                    {this.props.align == 'left' && inputElem}
                    {socket.label}
                    {this.props.align != 'left' && iconElem}
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

    addOffset(offset){
        var nodeData = this.props.nodedata;
        nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
        this.setState(
            {
                magicobj:{},
            }
        );
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
    }
    
    nodeTitleInputChangeHandler(ev){
        var inputStr = ev.target.value;
        this.props.nodedata.title = inputStr.trim();
        this.setState(
            {
                magicobj:{},
            }
        );
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
    }

    componentWillMount(){
        this.props.nodedata.currentFrameCom = this;
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
        if(this.props.clickHandler){
            if(this.lastClickTime == null || (Date.now() - this.lastClickTime) > 300){
                this.lastClickTime = Date.now();
            }
            else{
                this.props.clickHandler();
                return;
            }
        }
        this.props.editor.setSelectedNF(this);
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

    getNodeTitle(){
        var nodeData = this.props.nodedata;
        return this.props.getTitleFun == null ? (nodeData.title == null ? '未命名' : nodeData.title) : this.props.getTitleFun();
    }


    renderHead(nodeData){
        if(this.props.isPure){
            return null;
        }

        var headType = this.props.headType;
        if(headType == null)
            headType = 'default';
        if(headType == 'tiny'){
            return <div className='d-flex nodeHead align-items-center' type='tiny' >
                        {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                        <div className='flex-grow-1 flex-shrink-0 text-nowrap text-center' f-canmove={1} >
                            {this.props.headText}
                        </div>
                        {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                    </div>
        }

        if(headType == 'default'){
            var nodeTitle = this.getNodeTitle();
            return  <React.Fragment>
                        <div className='bg-light d-flex align-items-center text-dark' style={{fontSize:'0.5em'}}>
                            <div className='flex-grow-1 flex-shrink-1 text-nowrap'>
                                {nodeData.label}:
                                {
                                    this.state.editingTitle ? <input className='' type='text' value={nodeTitle} onChange={this.nodeTitleInputChangeHandler} onKeyPress={this.nodeTitleInputKeypressHandler} />
                                    :
                                    <React.Fragment>
                                        <span className=''>{nodeTitle}</span>
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

    render(){
        var nodeData = this.props.nodedata;
        var posStyle = {left:parseInt(nodeData.left) + 'px','top':parseInt(nodeData.top), 'paddingTop':this.props.isPure ? '0.5em' : null };
        return (<div ref={this.rootDivRef} onMouseDown={this.moveBarMouseDownHandler} className='position-absolute d-flex flex-column nodeRoot' style={posStyle} d-selected={this.state.selected ? '1' : null}>
                {
                    this.renderHead(nodeData)
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

        this.state={
            nodedata:this.props.nodedata,
        }
        this.listenData(this.props.nodedata);
        this.dropdownRef = React.createRef();
    }
    

    nodeDataChangedHandler(){
        var nodeData = this.state.nodedata;
        var entity = nodeData.targetentity;
        this.dropdownRef.current.setValue(entity.code);
        this.setState({magicObj:{}});
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        this.unlistenData(this.state.nodedata);
        clearTimeout(this.delaySetTO);
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
        var nodeData = this.state.nodedata;
        var entity = nodeData.targetentity;
        var nodeTitle = entity == null ? '新节点' : (nodeData.title ? nodeData.title : (entity.loaded ? entity.name : '正在加载:' + entity.code));
        return nodeTitle;
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
        var entity = nodeData.targetentity;
        var dataloaded = entity ? entity.loaded : false;
        
        return <C_SqlNode_Frame nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor}>
                <div className='d-flex'>
                    <div className='flex-grow-1 flex-shrink-1'>
                        <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.entities_arr} rootclass='flex-grow-0 flex-shrink-0' style={{width:'200px',height:'40px'}} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} /> 
                    </div>
                    <div className='flex-grow-0 flex-shrink-0 align-items-center d-flex flex-column'>
                        <C_Node_Socket clickHandler={this.socketOnClickHandler} height='40px' />
                    </div>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_Select extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.state={
            nodedata:this.props.nodedata,
        }
        this.listenData(this.props.nodedata);
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
        if(nodeData){
            nodeData.on('changed', this.nodeDataChangedHandler);
        }
    }

    unlistenData(nodeData){
        if(nodeData){
            nodeData.off('changed', this.nodeDataChangedHandler);
        }
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
                    <C_SqlNode_ScoketsPanel data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
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
            //nodedata:this.props.nodedata,
        }
    }

    render(){
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.operator} >
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.processInputSockets} />
                    <C_SqlNode_ScoketsPanel data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.processOutputSockets}/>
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

function C_SqlNode_Base(target){
    target.frameRef =  React.createRef();
    target.componentWillMount = C_SqlNode_componentWillMount.bind(target);
    target.componentWillUnmount = C_SqlNode_componentWillUnMount.bind(target);
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
                    <C_SqlNode_ScoketsPanel data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}/>
                    <C_SqlNode_ScoketsPanel data={nodeData.outputScokets_arr} align='end' editor={this.props.editor}/>
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_ScoketsPanel extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        if(this.props.processFun != null){
            // add listen
            var nodedata = this.props.data[0].node;
            nodedata.on(Event_SocketNumChanged, this.reRender);
        }
    }

    reRender(){
        this.setState({
            magicObj:{}
        });
    }

    componentWillUnmount(){
        if(this.props.processFun != null){
            var nodedata = this.props.data[0].node;
            nodedata.off(Event_SocketNumChanged, this.reRender);
        }
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

    render(){
        if(this.props.data.length == 0)
            return null;

        return (<div className={'d-flex flex-column align-items-' + this.props.align}>
            {
                this.props.data.map(socketObj=>{
                    return <C_Node_Socket key={socketObj.id} socket={socketObj} align={this.props.align == 'start' ? 'left' : 'right'} editor={this.props.editor} />
                })
            }
            {
                this.renderDynamic()
            }
        </div>);
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
    }

    blueprinkChanged(ev){
        this.setState({
            magicObj:{},
        });
    }

    setSelectedNF(target){
        if(this.selectedNF == target){
            return;
        }
        if(this.selectedNF && !this.selectedNF.unmounted){
            this.selectedNF.setSelected(false);
        }
        if(target){
            target.setSelected(true);
        }
        this.selectedNF = target;
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
                if(this.selectedNF){
                    this.setSelectedNF(null);
                }
                var dragingPath = this.dragingPathRef.current;
                dragingPath.setState({
                    draging:false,
                    start:null,
                    end:null,
                });
            case 46:
                if(this.selectedNF){
                    this.wantDeleteNode(this.selectedNF.props.nodedata, this.selectedNF.getNodeTitle());
                }
            break;
        }
    }

    keyDownHandler(ev){
        if(this.selectedNF && ev.keyCode >= 37 && ev.keyCode <= 40){
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
            this.selectedNF.addOffset(offset);
            ev.preventDefault();
        }
    }

    wantDeleteNode(nodeData, title){
        gTipWindow.popAlert(makeAlertData('警告','确定删除节点:"' + title + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo], nodeData));
    }

    deleteTipCallback(key, nodeData){
        if(key == 'ok'){
            this.state.editingNode.deleteNode(nodeData);
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
                    this.state.editingNode.linkPool.addLink(srcSocket, dragingPath.state.startScoket);
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
        this.setSelectedNF(null);
        var editingNode = this.state.editingNode;
        var scrollNode = this.editorDivRef.current.parentNode;
        if(editingNode){
            editingNode.scrollLeft = scrollNode.scrollLeft;
            editingNode.scrollTop = scrollNode.scrollTop;
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
        }

        return null;
    }

    addVarGSNode(config, windPos){
        var editingNode = this.state.editingNode;
        var $zoomDivElem = $(this.zoomDivRef.current);
        var zoomOffset = $zoomDivElem.offset();
        
        var x = -parseUnitInt(this.editorDivRef.current.style.left) + windPos.x - zoomOffset.left;
        var y = -parseUnitInt(this.editorDivRef.current.style.top) + windPos.y - zoomOffset.top;
        var newNodeData = null;
        if(config.isGet){
            newNodeData = new SqlNode_Var_Get({left:x,top:y,varName:config.varName}, editingNode);
        }
        else{
            newNodeData = new SqlNode_Var_Set({left:x,top:y,varName:config.varName}, editingNode);
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

    rootMouseDownHandler(ev){
        if(ev.target == this.zoomDivRef.current && this.draging != true){
            this.draging = true;
            //var scrollNode = this.editorDivRef.current.parentNode;
            //this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
            var nowPos = {
                x:parseUnitInt(this.editorDivRef.current.style.left),
                y:parseUnitInt(this.editorDivRef.current.style.top),
            }
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y, left:nowPos.x, top: nowPos.y};
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
        var blueprintPrefix = this.state.editingNode.bluePrint.id + '_';
        if(this.listenedBP != editingNode.bluePrint){
            this.unlistenBlueprint(this.listenedBP);
            this.listenBlueprint(editingNode.bluePrint);
        }

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
                                        this.state.showLink && editingNode.linkPool.getAllLink().map((linkobj=>{
                                            return <C_Node_Path key={blueprintPrefix + linkobj.id} link={linkobj} editorDivRef={this.editorDivRef} />
                                        }))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
                />);
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
]; 

class SqlNodeOutlineItem extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);

        this.state = {
            label:this.props.nodeData.getNodeTitle(),
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
        this.unlistenNode(this.state.editingNode);
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
        if(this.listenedNode != this.props.editingNode){
            this.unlistenNode(this.listenedNode);
            this.listenNode(this.props.editingNode);
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