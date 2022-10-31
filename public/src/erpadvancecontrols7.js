const TaskServerURL = '/erppage/server/task';
class ERPC_TaskSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPControlBase(this);
        this.dropdownRef = React.createRef();
        this.pullUserTask = this.pullUserTask.bind(this);
        this.pop = this.pop.bind(this);
        this.createTitleBarRightElem = this.createTitleBarRightElem.bind(this);
        this.popupCreator = this.popupCreator.bind(this);
        this.taskConfirmed = this.taskConfirmed.bind(this);
        this.onloadHandler = this.onloadHandler.bind(this);
        this.onErrorHandler = this.onErrorHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.iframeRef = React.createRef();
        this.iframeItem = null;
    }

    pop(){
        this.closeCreator();
    }

    pullUserTask(parentPath) {
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'getUserTask', bundle: { userid: g_envVar.userid } }, makeFTD_Prop(parentPath, this.props.id, 'options_arr', false), EFetchKey.FetchPropValue));
    }

    sendMessage(msgtype, data) {
        if(msgtype == '任务已下发'){
            this.taskConfirmed(data.任务代码,data.任务名称,'默认小组');
            this.closeCreator();
        }
    }

    onloadHandler(ev) {
        try {
            ev.target.contentWindow.gPageInFrame = true;
            ev.target.contentWindow.gParentFrame = this;
            ev.target.contentWindow.gParentDingKit = dingdingKit;
            ev.target.contentWindow.gParentIsInDingTalk = isInDingTalk;
        }
        catch (eo) {
            console.log(eo);
        }
    }

    onErrorHandler(ev) {
        alert(JSON.stringify(ev));
    }

    popupCreator(){
        this.iframeItem = <div key={this.props.id + 'creator'} className='d-fixed w-100 h-100' style={{zIndex:10000}}>
                                <iframe ref={this.iframeRef} src='http://192.168.0.15:1330/erppage/mb/ZZMZY?flowStep=144' className='w-100 h-100' frameBorder='0' onLoad={this.onloadHandler} onError={this.onErrorHandler} ></iframe>
                            </div>
        addFixedItem(this.iframeItem);
        if(this.dropdownRef.current){
            this.dropdownRef.current.dropDownClosed();
        }
    }

    closeCreator(){
        if(this.iframeItem){
            removeFixedItem(this.iframeItem);
        }
    }

    createTitleBarRightElem(){
        return (<button type='button' onClick={this.popupCreator} className={'ml-1 btn btn-success' + (isMobile ? '' : ' btn-sm')}><i className='fa fa-plus'/>创建任务</button>);
    }

    taskConfirmed(taskid, taskname, groupname){
        var newOptions_arr = this.props.optionsData.options_arr;
        newOptions_arr = newOptions_arr.map(x=>{
            return x.data;
        }).concat(
            {
                工作任务记录代码:taskid,
                任务标题:taskname,
                工作小组名称:groupname
            },
        );
        var needSetState={
            options_arr:newOptions_arr,
            text:taskname,
            value:taskid,
        }
        store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
        if(this.dropdownRef.current){
            this.dropdownRef.current.dropDownClosed();
        }
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        return (<ERPC_DropDown 
                ref={this.dropdownRef}
                value={this.props.value}
                text={this.props.text}
                fetching={this.props.fetching}
                fetchingErr={this.props.fetchingErr}
                optionsData={this.props.optionsData}
                invalidInfo={this.props.invalidInfo}
                selectOpt={this.props.selectOpt}
                rowkey={this.props.rowkey}
                id={this.props.id}
                parentPath={this.props.parentPath}
                type='string'
                pullOnce={true}
                pullDataSource={this.pullUserTask}
                options_arr={this.props.options_arr}
                plainTextMode={this.props.plainTextMode}
                fullParentPath={this.props.fullParentPath}
                fullPath={this.props.fullPath}
                label={this.props.label}
                textAttrName='任务标题' 
                valueAttrName='工作任务记录代码'
                recentCookieKey='task'
                onchanged={this.props.onchanged}
                createTitleBarRightElem={this.createTitleBarRightElem}
        />);
    }
}

const selectERPC_TaskSelector_textName = (state, ownprops) => {
    return '任务标题';
};

const selectERPC_TaskSelector_valueName = (state, ownprops) => {
    return '工作任务记录代码';
};

const selectERPC_TaskSelector_groupAttrName = (state, ownprops) => {
    return '工作小组名称';
};

function ERPC_TaskSelector_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = propProfile.fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_TaskSelector_textName, selectERPC_TaskSelector_valueName, selectERPC_TaskSelector_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (!useValue) {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}


function ERPC_TaskSelector_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

// 大连项目适用
const DalianServerURL = '/erppage/server/dalian';
var DaLianStatus_Setting = {
    CellSize:33,
    BtnSize:28,
};
var DaLianStatus_HheaderCellSyle = {width:DaLianStatus_Setting.CellSize+'px',height:DaLianStatus_Setting.CellSize+'px'};
var DaLianStatus_NormalCellSyle = {width:DaLianStatus_Setting.CellSize+'px',height:DaLianStatus_Setting.CellSize+'px',padding:'2px'};
var DaLianStatus_ButtonCellSyle = {width:DaLianStatus_Setting.BtnSize+'px',height:DaLianStatus_Setting.BtnSize+'px'};

class CDSComponentData{
    constructor(data){
        this.data = data;
        for(var si in data){
            this[si] = data[si];
        }
    }
}

class C_DaLianStatusCell extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.btnClickHandler = this.btnClickHandler.bind(this);
    }

    btnClickHandler(ev){
        if(this.props.onClick){
            this.props.onClick(this);
        }
    }

    render(){
        let contentElem = null;
        let data = this.props.data;
        let rootClassName = 'd-block border text-center flex-shrink-0 flex-grow-0';
        if(data == null){
            rootClassName += ' bg-secondary';
        }
        else{
            contentElem = <button onClick={this.btnClickHandler} type='button' className='btn btn-sm btn-primary p-1' style={DaLianStatus_ButtonCellSyle}>{data.列号}</button>
        }
        return <div className={rootClassName} style={DaLianStatus_NormalCellSyle}>
            {contentElem}
        </div>
    }
}

class C_DaLianStatusRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render(){
        let contentElem = null;
        if(this.props.data == null){
            
        }
        else{
            
        }
        return <div className='d-flex flex-shrink-0 flex-grow-0'>
            {Children}
        </div>
    }
}

class ERPC_DaLianStatus extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPControlBase(this);
        this.state = Object.assign(this.initState, {
            钢框架cell_dic:null,
            行Range:null,
            列Range:null,
        });
        this.gridDivScrollHandler = this.gridDivScrollHandler.bind(this);
        this.clickSearchHandler = this.clickSearchHandler.bind(this);
        this.processData = this.processData.bind(this);
        this.clickCellHandler = this.clickCellHandler.bind(this);
        
        
        this.gridDivRef = React.createRef();
        this.rowHeaderDivRef = React.createRef();
        this.columnHeaderDiv = React.createRef();
        this.selectRef = React.createRef();
    }

    gridDivScrollHandler(ev) {
        if (this.gridDivRef.current) {
            var gridDiv = this.gridDivRef.current;
            // console.log(`${gridDiv.scrollTop}:${gridDiv.scrollLeft}`);
            this.rowHeaderDivRef.current.scrollTop = gridDiv.scrollTop;
            this.columnHeaderDiv.current.scrollLeft = gridDiv.scrollLeft;
        }
    }

    clickSearchHandler(ev){
        if(this.selectRef.current == null){
            return;
        }
        if(this.state.fetching){
            return;
        }
        var self = this;
        this.setState({
            fetching:true
        });
        nativeFetchJson(false,DalianServerURL,{
            action: 'getConstructState',
            bundle: { userid: g_envVar.userid,全局代码:this.selectRef.current.value,材料种类:'K' }
        }).then(retJson=>{
            if(retJson.err != null){
                self.setState({
                    fetching:false,
                    fetchingErr:retJson.err.info,
                });
            }
            else{
                // self.setState({
                //     fetching:false,
                // });
                self.钢框架数据_arr = retJson.data;
                this.processData();
            }
        });
        // nativeFetchJson();
    }

    processData(){
        let 钢框架cell_dic = {};
        let 钢框架数据_arr = this.钢框架数据_arr;
        let min行号 = 999;
        let max行号 = 0;
        let min列号 = 999;
        let max列号 = 0;
        for(let si in 钢框架数据_arr){
            let data = 钢框架数据_arr[si];
            min行号 = Math.min(min行号,data.行号);
            max行号 = Math.max(max行号,data.行号);
            min列号 = Math.min(min列号,data.列号);
            max列号 = Math.max(max列号,data.列号);
            let key = `${data.行号}_${data.列号}`;
            钢框架cell_dic[key] = new CDSComponentData(data);
        }

        this.setState({
            fetching:false,
            钢框架cell_dic:钢框架cell_dic,
            行Range:[min行号,max行号],
            列Range:[min列号,max列号],
        });
    }

    clickCellHandler(cellElem){
        this.setState({
            selectedCell:null;
        });
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var columnHeaderElems = [];
        var rowHeaderElems = [];
        var rowElems = [];

        var titleInfo = null;
        var infoTye = 'warning'
        if(this.state.fetching){
            titleInfo = '数据获取中';
        }
        else if(this.state.fetchingErr != null){
            titleInfo = this.state.fetchingErr;
            infoTye = 'danger';
        }
        else if(this.state.钢框架cell_dic == null){
            titleInfo = '请点击检索按钮';
            infoTye = 'light';
        }
        else{
            var 钢框架cell_dic  = this.state.钢框架cell_dic ;
            var 行Range = this.state.行Range;
            var 列Range = this.state.列Range;
            var rowCount = 行Range[1]-行Range[0]+1;
            var columnCount = 列Range[1]-列Range[0]+1;
            //autoScroll_Touch
            var CellSize = DaLianStatus_Setting.CellSize;
            for(var i=列Range[0];i<=columnCount;++i){
                columnHeaderElems.push(<div key={i} className='d-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0' style={DaLianStatus_HheaderCellSyle}>{i}</div>);
            }

            for(var i=行Range[1];i>=行Range[0];--i){
                rowHeaderElems.push(<div key={i} className='d-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0' style={DaLianStatus_HheaderCellSyle}>{i}</div>);
            }

            for(var row_i=行Range[1];row_i>=行Range[0];--row_i){
                // rowElems.push(<C_DaLianStatusRow key={row_i} />);
                // continue;
                var cellElems = [];
                for(var col_i=列Range[0];col_i<=列Range[1];++col_i){
                    var cellKey = `${row_i}_${col_i}`;
                    cellElems.push(<C_DaLianStatusCell key={col_i} data={钢框架cell_dic[cellKey]} onClick={this.clickCellHandler}/>);
                }
                rowElems.push(<div key={row_i} className='d-flex flex-shrink-0 flex-grow-0'>
                    {cellElems}
                </div>);
            }
        }


        return <div className='d-flex flex-column flex-grow-1 flex-shrink-1 hidenOverflow'>
            <div className='bg-dark d-flex flex-grow-0 flex-shrink-1 align-items-center p-2'>
                <span className='h4 text-light mb-0 p-1'>大连生产施工追踪</span>
                <select ref={this.selectRef} className='h4' >
                    <option value ="1">F1</option>
                    <option value ="2">F2</option>
                    <option value="3">F3</option>
                </select>
                <button className={'btn btn-primary ml-1' + (this.state.fetching ? ' disabled' : '')} onClick={this.clickSearchHandler}><i className='fa fa-search' />检索数据</button>
                {titleInfo == null ? null : <span className={'h5 mb-0 p-1 ml-2 badge badge-' + infoTye}>{titleInfo}</span>}
            </div>
            <div className='d-flex flex-shrink-0 border-bottom'>
                <div className='d-block flex-shrink-0 flex-grow-0 text-center bg-secondary' style={DaLianStatus_HheaderCellSyle} />
                <div id='columnHeaderDiv' ref={this.columnHeaderDiv} className='d-flex flex-grow-1 flex-shrink-1 hidenOverflow flex-nowrap'>
                    {columnHeaderElems}
                    <div className='d-block flex-shrink-0 flex-grow-0' style={{width:'18px'}} />
                </div>
            </div>
            <div id='bottomDiv' className='d-flex flex-shrink-1 flex-grow-1'>
                <div id='rowHeaderDiv' ref={this.rowHeaderDivRef} className='d-flex flex-column flex-shrink-0 flex-grow-0 hidenOverflow border-right' style={{width:CellSize+'px'}}>
                    {rowHeaderElems}
                    <div className='d-block flex-shrink-0 flex-grow-0' style={{height:'18px'}} />
                </div>
                <div id='gridDiv' ref={this.gridDivRef} className='flex-shrink-1 flex-grow-1' onScroll={this.gridDivScrollHandler} style={{overflow:'scroll'}}>
                    {rowElems}         
                </div>
            </div>
        </div>;
    }
}

function ERPC_DaLianStatus_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    return {
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_DaLianStatus_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}


var VisibleERPC_TaskSelector = null;
var VisibleERPC_DaLianStatus = null;
gNeedCallOnErpControlInit_arr.push(()=>{
    VisibleERPC_TaskSelector = ReactRedux.connect(ERPC_TaskSelector_mapstatetoprops, ERPC_TaskSelector_dispatchtoprops)(ERPC_TaskSelector);
    VisibleERPC_DaLianStatus = ReactRedux.connect(ERPC_DaLianStatus_mapstatetoprops, ERPC_DaLianStatus_dispatchtoprops)(ERPC_DaLianStatus);
});