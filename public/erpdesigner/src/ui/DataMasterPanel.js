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
    fetchJsonPost('server',{action:'matchGet',keyword:'T922'}, function(rlt){
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
                fetchJsonPost('server', { action: 'syndata_bykeyword', keyword: keyword }, callBack);
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

class SqlBPEditor extends React.PureComponent{
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

    forcusSqlNode(nodeData){
        if(this.bluePrintRef.current == null){
            return;
        }
        var self = this;
        setTimeout(() => {
            self.bluePrintRef.current.showNodeData(nodeData);
        }, 200);
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

class SqlBPEditPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
        }
        autoBind(this);

        this.nameRef = React.createRef();
        this.typeRef = React.createRef();
    }

    clickConfirmHandler(){
        var targetBP = this.props.targetBP;
        var name = this.nameRef.current.getValue().trim();
        if(name.length <= 2){
            this.setState({
                errinfo:'名字的长度必须大于2'
            });
            return;
        }
        var nowBP = this.props.dataMaster.getSqlBPByName(name);
        if(nowBP != null && nowBP != targetBP){
            this.setState({
                errinfo:'已有同名的蓝图存在'
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
        var targetBP = this.props.targetBP;
        if(targetBP == null){
            targetBP = this.props.dataMaster.createSqlBP(name, type);
        }
        else{
            targetBP = this.props.dataMaster.modifySqlBP(targetBP, name, type);
        }
        this.props.onComplete(targetBP);
    }

    clickCancelHandler(){
        this.props.onComplete(null);
    }

    render(){
        var targetBP = this.props.targetBP;
        var title = '新建Sql蓝图';
        if(targetBP != null){
            title = '修改' + targetBP.name;
        }
        var value = targetBP == null ? '' : targetBP.name;
        var type = targetBP == null ? '表值' : targetBP.type;
        var nameWidth = 100;
        return <FloatPanelbase title={title} width={480} height={320} initShow={true} sizeable={false} closeable={false} ismodel={true} >
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <div className='d-flex flex-column autoScroll flex-grow-1 flex-shrink-1'>
                        <NameInputRow label='名称' type='text' rootClass='m-1' nameWidth={nameWidth} ref={this.nameRef} default={value} />
                        <NameInputRow label='类型' type='select' rootClass='m-1' nameWidth={nameWidth} options_arr={['表值','标量值']} default={type} ref={this.typeRef} />   
                        <div className='flex-grow-1 flex-shrink-1 text-info'>
                            {
                                this.state.errinfo
                            }
                        </div>
                    </div>
                    <div className='flex-grow-0 flex-shrink-0 btn-group'>
                        <button type='button' onClick={this.clickConfirmHandler} className='btn btn-success flex-grow-1 flex-shrink-1'>{targetBP ? '修改' : '创建'}</button>
                        <button type='button' onClick={this.clickCancelHandler} className='btn btn-danger flex-grow-1 flex-shrink-1'>取消</button>
                    </div>
                </div>
            </FloatPanelbase>
    }
}


class SqlBPItemPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            items_arr:this.props.project.dataMaster.BP_sql_arr,
            selectedItem:null,
        }
        this.sqlbpEditorRef = React.createRef();
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

    clickEditBtnHandler(ev){
        if(this.state.selectedItem){
            this.setState({
                modifing:true,
            });
        }
    }

    newItemCompleteHandler(newDBE){
        this.setState({
            creating:false,
            modifing:false,
        });
    }

    forcusSqlNode(nodeData){
        this.setState({selectedItem:nodeData.bluePrint});
        var self = this;
        setTimeout(() => {
            if(self.sqlbpEditorRef.current == null){
                return;
            }
            self.sqlbpEditorRef.current.forcusSqlNode(nodeData);
        }, 200);
    }

    render() {
        var selectedItem = this.state.selectedItem;
        return (
            <React.Fragment>
                {
                    this.state.creating || this.state.modifing ? <SqlBPEditPanel targetBP={this.state.modifing ? selectedItem : null} dataMaster={this.props.project.dataMaster} onComplete={this.newItemCompleteHandler} /> : null
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
                        <div className='flex-shrink-0 btn-group'>
                            <button type='button' onClick={this.clickAddBtnhandler} className='btn btn-success flex-grow-1'><i className='fa fa-plus' /></button>
                            <button type='button' onClick={this.clickEditBtnHandler} className='btn'><i className='fa fa-edit' /></button>
                        </div>
                    </div>
                }
                panel2={
                    <div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                        <SqlBPEditor ref={this.sqlbpEditorRef} item={selectedItem} />
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
        this.navbarRef = React.createRef();
        this.sqlBPPanelRef = React.createRef();
        this.state = {};

        autoBind(this);

        var navItems = [
            CreateNavItemData('数据库', <DataBasePanel project={this.props.project} />),
            CreateNavItemData('创造数据', <SqlBPItemPanel ref={this.sqlBPPanelRef} project={this.props.project} />),
        ];
        
        this.navData = {
            selectedItem: navItems[1],
            items: navItems,
        };
    }

    forcusSqlNode(nodeData){
        if(this.navbarRef.current == null){
            return;
        }
        this.navbarRef.current.selectByText('创造数据');
        var self = this;
        setTimeout(() => {
            if(self.sqlBPPanelRef.current == null){
                return;
            }
            self.sqlBPPanelRef.current.forcusSqlNode(nodeData);
        }, 200);
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
            <FloatPanelbase title='数据大师' ref={this.panelBaseRef} initShow={false} initMax={true}>
                <div className='d-flex flex-grow-0 flex-shrink-0'>
                    <TabNavBar ref={this.navbarRef} navData={this.navData} navChanged={this.navChanged} />
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