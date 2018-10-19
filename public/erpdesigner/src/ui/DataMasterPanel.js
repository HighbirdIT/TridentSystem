
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
const SQLNODE_VAR = 'variable';


class CustomDbEntity extends EventEmitter{
    constructor(initData){
        super();
        this.nodes_arr = [];
        this.vars_arr = [];
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
        if(node.type == SQLNODE_VAR){
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
        var rlt = new SqlNode_Variable(this,varName, SqlVarType_Int);
        rlt.needEdit = true;
        return rlt;
    }

    removeVariable(varData){
        var index = this.vars_arr.indexOf(varData);
        if(index != -1){
            this.vars_arr.splice(index, 1);
            this.emit('varChanged');
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
            this.emit('changed');
        }
    }

    getNodeByID(id){
        if(id == this.id){
            return this;
        }
        return this.allNode_map[id];
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

        this.bluePrint.registerNode(this, parentNode);

        if(creationInfo)
        {
            creationInfo.save(initData, this);
        }

        this.sockets_map = {};
    }


    getNodeTitle(){
        return this.title == null ? '未命名' : this.title;
    }

    genSocketID(isIn){
        var preFix = this.id + '_' + (isIn ? 'i' : 'o') + '_';
        for(var i=0;i<999;++i){
            var id = preFix + i;
            if(this.sockets_map[id] == null)
                return id;
        }
        return null;
    }
}

class SqlNode_Variable extends SqlNode_Base{
    constructor(bluePrint,name,valType,size_1,size_2){
        super({
            name:name,
            valType:valType,
            size_1:isNaN(size_1) ? 0 : parseInt(size_1),
            size_2:isNaN(size_2) ? 0 : parseInt(size_2),
        }, bluePrint, null, SQLNODE_VAR, '变量');
        autoBind(this);
    }
}

class SqlNode_Variable_Component extends React.PureComponent{
    constructor(props){
        super(props);
        var varData = this.props.varData;
        this.state = {
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam == true,
            size_1:varData.size_1,
            size_2:varData.size_2,
            editing:varData.needEdit == true,
        };

        autoBind(this);
    }

    varChanged(){
        var varData = this.props.varData;
        this.setState({
            name:varData.name,
            valType:varData.valType,
            isParam:varData.isParam == true,
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

    render() {
        var varData = this.props.varData;
        return(
        <div className='d-flex flex-column flex-grow-0 flex-shrink-0 w-100 border border-primary'>
            <div className='d-flex bg-dark flex-grow-0 flex-shrink-0 w-100 align-items-center'>
                <input onChange={this.nameInputChangeHanlder} type='text' value={this.state.name} className='flexinput flex-grow-1 flex-shrink-1' />
                <i className='fa fa-edit fa-lg text-success' />
            </div>
            <div className='d-flex w-100 flex-grow-0 flex-shrink-0'>
            <DropDownControl itemChanged={this.valTypeChangedHandler} btnclass='btn-dark' options_arr={SqlVarTypes_arr} rootclass='flex-grow-1 flex-shrink-1' textAttrName='name' valueAttrName='code' value={this.state.valType} /> 
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

class NodeSocket extends EventEmitter{
    constructor(initData, tNode, isIn){
        super();
        Object.assign(this, initData);
        this.node = tNode;
        this.isIn = isIn;
    }
}

class C_Node_Socket extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.flagRef = React.createRef();
    }

    clickHandler(ev){
        this.props.clickHandler(this);
    }

    getCenterPos(offsetRect){
        var rect = this.flagRef.current.getBoundingClientRect();
        return {x:Math.round(rect.left + rect.width * 0.5 - offsetRect.left), y:Math.round(rect.top + rect.height * 0.5 - offsetRect.top)};
    }

    render(){
        return <div style={{height:this.props.height,width:this.props.width}} className='d-flex align-items-center nodesocket' type='dbe'> <i ref={this.flagRef} onClick={this.clickHandler} className='fa fa-circle-o cursor-pointer'  /> </div>
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

        this.rooDivRef = React.createRef();

        if(this.props.nodedata.newborn){
            var self = this;
            setTimeout(() => {
                if(self.state.moving){
                    self.startMove(null);
                }
            }, 10);
        }
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
    
        this.movingInt = setInterval(this.movingIntHandler,100);
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
    }
    
    mousemoveWidthMoveHandler(ev){
        var moveBase = this.moveBase;
        var scrollDiv = this.props.editorDivRef.current.parentNode;
        var scrollDivRect = scrollDiv.getBoundingClientRect();
        var editorScale = this.props.editorDivRef.current.scale;
        if(editorScale == null || isNaN(editorScale)){
            editorScale = 1;
        }
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
        var rootDivRect = this.rooDivRef.current.getBoundingClientRect();
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
        this.rooDivRef.current.style.left = newX + 'px';
        this.rooDivRef.current.style.top = newY + 'px';
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
    
    moveBarMouseDownHandler(ev){
        if(ev.target != this.rooDivRef.current){
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
        var rootDivRect = this.rooDivRef.current.getBoundingClientRect();
        this.moveBase={x:rootDivRect.left - WindowMouse.x,y:rootDivRect.top - WindowMouse.y};
        this.startMove(this.moveBase);
    }
    
    clickDeleteHandler(ev){
        gTipWindow.popAlert(makeAlertData('警告','确定删除节点:"' + this.getNodeTitle() + '"?',this.deleteTipCallback,[TipBtnOK,TipBtnNo]));
    }
    
    deleteTipCallback(key){
        if(key == 'ok'){
            this.props.nodedata.bluePrint.deleteNode(this.props.nodedata);
        }
    }

    getNodeTitle(){
        var nodeData = this.props.nodedata;
        return this.props.getTitleFun == null ? (nodeData.title == null ? '未命名' : nodeData.title) : this.props.getTitleFun();
    }

    render(){
        var nodeTitle = this.getNodeTitle();
        var nodeData = this.props.nodedata;
        var posStyle = {left:parseInt(nodeData.left) + 'px','top':parseInt(nodeData.top) };
        return (<div ref={this.rooDivRef} onMouseDown={this.moveBarMouseDownHandler} className='position-absolute d-flex flex-column nodeRoot' style={posStyle} moving={this.state.moving ? '1' : null}>
                <div className='bg-light d-flex align-items-center text-dark' style={{fontSize:'0.5em'}}>
                    <div className='flex-grow-1 flex-shrink-1'>
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
                    <i className='fa fa-close ml-1 cursor-pointer mr-1' onClick={this.clickDeleteHandler} />
                </div>
                <div className="dropdown-divider"></div>
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

    socketOnClickHandler(srcSocket){
        this.props.onClickSocket(srcSocket, this);
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
        
        return <C_SqlNode_Frame nodedata={nodeData} getTitleFun={this.getNodeTitle} editorDivRef={this.props.editorDivRef}>
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

    socketOnClickHandler(srcSocket){
        this.props.onClickSocket(srcSocket, this);
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
        return <C_SqlNode_Frame nodedata={nodeData} editorDivRef={this.props.editorDivRef} clickHandler={this.clickHandler}>
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

    socketOnClickHandler(srcSocket){
        this.props.onClickSocket(srcSocket, this);
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
        return <C_SqlNode_Frame nodedata={nodeData} editorDivRef={this.props.editorDivRef} clickHandler={this.clickHandler}>
                <div className='d-flex flex-column'>
                    列名
                </div>
            </C_SqlNode_Frame>
    }
}

class C_SqlNode_Editor extends React.PureComponent{
    constructor(props){
        super(props);

        this.state={
            draing:false,
            editingNode:this.props.bluePrint,
            scale:1,
        }

        autoBind(this);
        this.dragingPathRef = React.createRef();
        this.editorDivRef = React.createRef();
    }

    blueprinkChanged(ev){
        this.setState({
            magicObj:{},
        });
    }

    componentWillMount(){
        this.props.bluePrint.on('changed', this.blueprinkChanged);
    }

    componentWillUnmount(){
        window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
        window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
        this.props.bluePrint.off('changed', this.blueprinkChanged);
        clearTimeout(this.delaySetTO);
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
                    draing:false,
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

    onClickSocket(srcSocket, srcNode){
        //console.log(srcSocket);
        //console.log(srcNode);
        var dragingPath = this.dragingPathRef.current;
        if(dragingPath.state.draing == true){
            dragingPath.setState({
                draing:false,
                start:null,
                end:null,
            });
            window.removeEventListener('mousemove', this.mousemoveWidthDragingHandler);
            window.removeEventListener('mouseup', this.mouseupWidthDragingHandler);
        }else{
            var rootRect = this.editorDivRef.current.getBoundingClientRect();
            dragingPath.setState({
                draing:true,
                start:srcSocket.getCenterPos(rootRect),
                end:{x:WindowMouse.x - rootRect.left,y:WindowMouse.y - rootRect.top},
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
        }
        
        this.setState({
            draing:false,
            editingNode:theNode,
            scale:1,
        });

        if(theNode){
            theNode.bluePrint.editingNode = theNode;
            setTimeout(() => {
                scrollNode.scrollLeft = theNode.scrollLeft == null ? 0 : theNode.scrollLeft;
                scrollNode.scrollTop = theNode.scrollTop == null ? 0 : theNode.scrollTop;
            }, 50);
        }
    }

    renderNode(nodeData){
        if(nodeData == null)
            return null;
        switch(nodeData.type){
            case SQLNODE_BDBENTITY:
                return <C_SqlNode_DBEntity onClickSocket={this.onClickSocket} key={nodeData.id} nodedata={nodeData} editorDivRef={this.editorDivRef} editor={this} />
            break;
            case SQLNODE_SELECT:
                return <C_SqlNode_Select onClickSocket={this.onClickSocket} key={nodeData.id} nodedata={nodeData} editorDivRef={this.editorDivRef} editor={this} />
            break;
        }
        return null;
    }

    mouseDownNodeCtlrHandler(ctlData){
        var scrollNode = this.editorDivRef.current.parentNode;
        var editingNode = this.state.editingNode;
        var newNodeData = new ctlData.nodeClass({newborn:true,left:scrollNode.scrollLeft,top:scrollNode.scrollTop},editingNode);
        this.setState({
            magicObj:{},
        });
    }

    mousemoveWithDragHandler(ev){
        var offset = {x:ev.x - this.dragOrgin.x,y:ev.y - this.dragOrgin.y};
        var scrollNode = this.editorDivRef.current.parentNode;
        scrollNode.scrollLeft = this.dragOrgin.sl - offset.x;
        scrollNode.scrollTop = this.dragOrgin.st - offset.y;
        //console.log(offset);
    }

    mouseupWithDragHandler(ev){
        this.draging = false;
        window.removeEventListener('mousemove', this.mousemoveWithDragHandler);
        window.removeEventListener('mouseup', this.mouseupWithDragHandler);
    }

    rootMouseDownHandler(ev){
        if(ev.target == this.editorDivRef.current && this.draging != true){
            this.draging = true;
            var scrollNode = this.editorDivRef.current.parentNode;
            this.dragOrgin = {x:WindowMouse.x,y:WindowMouse.y,sl:scrollNode.scrollLeft,st:scrollNode.scrollTop};
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

        return (<SplitPanel
                defPercent={0.2}
                maxSize='200px'
                barClass='bg-secondary'
                panel1={
                    <CusDBEEditorLeftPanel onMouseDown={this.mouseDownNodeCtlrHandler} editingNode={editingNode} />
                }
                panel2={
                    <div className='flex-grow-1 flex-shrink-1 d-flex flex-column mw-100' style={{}}>
                        <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                            <div className='flex-grow-0 flex-shrink-0 border bg-light '>
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
                            <div className='flex-grow-1 flex-shrink-1 autoScroll ' style={{zoom:this.state.scale}} >
                                <div onMouseDown={this.rootMouseDownHandler} ref={this.editorDivRef} className='d-block position-relative bg-dark' style={{minWidth:'4000px',minHeight:'4000px'}}>
                                    {
                                        editingNode.nodes_arr.map(nd=>{
                                            return this.renderNode(nd) //<G_Node key={nd.id} data={nd} />
                                        })
                                    }
                                    <C_Node_Path ref={this.dragingPathRef} editorDivRef={this.editorDivRef} draging='1' />
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
        this.state={
            start : this.props.start,
            end : this.props.end,
        };

        this.rootDivRef = React.createRef();
    }

    componentWillMount(){
        
    }

    componentWillUnmount(){
        
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
            <div ref={this.rootDivRef} className='nodepath' style={thisStyle} draging={this.props.draging}>
                
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
    }
]; 

class CusDBEEditorLeftPanel extends React.PureComponent{
    constructor(props){
        super(props);

        autoBind(this);
    }

    render() {
        return (
            <SplitPanel 
                fixedOne={true}
                maxSize={200}
                defPercent={0.3}
                flexColumn={true}
                panel1={
                    <div className='w-100 h-100 bg-info'>
                        大纲
                    </div>
                }
                panel2={
                    <div className='d-flex flex-column h-100 w-100'>
                        <CusDBEEditorVariables editingNode={this.props.editingNode} />
                        <CusDBEEditorCanUseNodePanel editingNode={this.props.editingNode} onMouseDown={this.props.onMouseDown} />
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

    componentWillMount(){
        this.props.editingNode.bluePrint.on('varChanged', this.varChangedhandler);
    }

    componentWillUnmount(){
        this.props.editingNode.bluePrint.off('varChanged', this.varChangedhandler);
    }

    render() {
        var targetID = this.props.editingNode.bluePrint.code + 'variables';
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
                                    return <SqlNode_Variable_Component key={varData.id} varData={varData} />
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
            <FloatPanelbase title='数据大师' ref={this.panelBaseRef} initShow={true}>
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

/*
var 员工_arr = ['杨建','刘峰','蒋蔚','姜玉恒','顾熙','赵智淼','唐媛','卢彩琴','金茂永','郭其宝','李旭','陈伟','吴溢华','吕承梅','陆敏','吴安琴','谢颖清','张亚飞','张光运','孙红闯','龙腾云','盛琴','葛添添','任思杰','孙詹','马晓霞','施闻','艾贻娟','张念刚','龙正华','曾庆洪','王保华','周和兵','文刚','鲁全峰','李小阳','卢世志','白勇军','白雯','刘旗','沈立新','胡琛','严于胜','卢惠云','张开宏','苏元兰','石磊磊','廉雪超','杨哲亮','张留权','李世芹','刘志沛','金林军','高连花','黄婷婷','庄毓霞','潘锦波','江晓彦','赵晶','王彦武','金兵兵','刘立群','徐贤生','沈珏茹','马健'];
var 金额_arr = [59115,36105,27015,6081.9,20283,22605,8827,20805,11640,5121.6,16063.2,2473.5,9603,12901,7333.2,4074,5121.6,4481.4,7760,5674.5,11640,4811.2,12367.5,60555,16490,17460,5868.5,16005,16665,21822,13095,16296,12222,13269.6,27465,12222,6790,28185,9253.8,24585,8245,16296,54555,44555,19995,11203.5,6693,9166.5,6111,16975,3880,4656,8487.5,194,18105,4850,10088,3734.5,1940,465.6,11737,10476,21480,40605,14550]
var minDif = 999999;
var minDif_arr = [];


var startData = []
var startNum = 15000 - 450
var targetNum = 222199.81
var count = 0;

var found = false;

function detectFun(now员工_arr, nowNum){
    var turnIndex = ++count;
    //console.log('turn' + turnIndex + ':' + now员工_arr.join(','));
    var dif = Math.abs(nowNum - targetNum);
    if(dif < minDif){
        minDif = dif;
        minDif_arr = now员工_arr;

        console.log('min:' + minDif + ',num:' + nowNum);
        console.log('arr:' + minDif_arr);
        console.log(now员工_arr.map(x=>{return 员工_arr[x];}));
     }
    if(dif < 0){
        //found = true;
        return;
    }
    if(nowNum > targetNum){
        return;
    }

    var len = now员工_arr.length;
    var index = len == 0 ? -1 : now员工_arr[len - 1];
    for(var ci=index + 1;ci<员工_arr.length && !found;++ci){
        var test员工_arr = now员工_arr.concat();
        test员工_arr.push(ci);
        detectFun(test员工_arr, nowNum + 金额_arr[ci]);
    }
}

detectFun(startData,startNum)
*/