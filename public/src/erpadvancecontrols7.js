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
    CellSize:31,
    BtnSize:26,
};
var DaLianStatus_HheaderCellSyle = {width:DaLianStatus_Setting.CellSize+'px',height:DaLianStatus_Setting.CellSize+'px'};
var DaLianStatus_NormalCellSyle = {width:DaLianStatus_Setting.CellSize+'px',height:DaLianStatus_Setting.CellSize+'px',padding:'2px'};
var DaLianStatus_ButtonCellSyle = {width:DaLianStatus_Setting.BtnSize+'px',height:DaLianStatus_Setting.BtnSize+'px'};
var 工序_arr = ['拼装','油漆','发运','组膜','吊膜'];
var E构件类型={
    钢框架:'钢框架',
    铝框架:'铝框架',
    驳接爪:'驳接爪',
    特殊驳接爪:'特殊驳接爪'
}
var 构件类型_arr = [E构件类型.钢框架,E构件类型.铝框架,E构件类型.驳接爪,E构件类型.特殊驳接爪];

class CDSComponentData{
    constructor(data){
        this.data = data;
        for(var si in data){
            this[si] = data[si];
        }
    }

    doQuery(type){
        var ret_arr = this.pureQuery(type);
        this.isDone = ret_arr[0];
        this.doneDate = ret_arr[1];
        if(this.isDone){
            var nowData = getNowDate();
            this.passDay = getDateDiff('天',this.doneDate,nowData);
        }
        else{
            this.passDay = -1;
        }
    }

    pureQuery(type){
        var statueKey = type + '状态';
        var dateKey = type + '日期';
        if(this[statueKey] == 1){
            var doneDate = castDate(this[dateKey]);
            var nowData = getNowDate();
            return [true,doneDate];
        }
        else{
            return [false,null];
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
            this.props.onClick(this.props.data);
        }
    }

    render(){
        let contentElem = null;
        let data = this.props.data;
        let rootBaseClassName = 'd-block text-center flex-shrink-0 flex-grow-0  ';
        let rootClassName = '';
        let btnBaseClassName = 'btn btn-sm p-1 ';
        let btnClassName = '';
        let label = '';
        let selectedCell = this.props.selectedCell;
        if(data == null){
            rootClassName = 'border bg-secondary';
            if(selectedCell){
                if(selectedCell.列号 == this.props.col || selectedCell.行号 == this.props.row){
                    rootClassName = 'bg-info';
                }
            }
        }
        else{
            rootClassName = 'border bg-light';
            // var statueKey = this.props.queryType + '状态';
            // var dateKey = this.props.queryType + '日期';
            if(data.isDone){
                btnClassName = 'btn-success';
                // var doneDate = castDate(data[dateKey]);
                // var nowData = getNowDate();
                // var passDay = getDateDiff('天',doneDate,nowData);
                // if(passDay > 30){
                //     label = '30+';
                // }
                // else if(passDay > 20){
                //     label = '20+';
                // }else if(passDay > 10){
                //     label = '10+';
                // }
                let passDay = data.passDay;
                if(passDay > 9){
                    label = '9+';
                }
                else{
                    label = passDay + '';
                    if(passDay == 0){
                        label = '';
                        btnClassName = 'btn-primary';
                    }
                }
            }else{
                btnClassName = 'btn-danger';
            }

            if(selectedCell){
                let same行 = selectedCell.行号 == this.props.row;
                let same列 = selectedCell.列号 == this.props.col;
                if(same行 || same列){
                    if(same行 && same列){
                        rootClassName = 'bg-warning';
                        btnClassName += ' text-dark';
                    }
                    else{
                        rootClassName = 'bg-info';
                    }
                }
            }
            contentElem = <button onClick={this.btnClickHandler} type='button' className={btnBaseClassName + btnClassName} style={DaLianStatus_ButtonCellSyle}>{label}</button>
        }
        return <div className={rootBaseClassName + rootClassName} style={DaLianStatus_NormalCellSyle}>
            {contentElem}
        </div>
    }
}


class ERPC_DaLianStatus extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPControlBase(this);
        this.state = Object.assign(this.initState, {
            钢框架cell_dic:null,
            铝框架cell_dic:null,
            驳接爪cell_dic:null,
            特殊驳接爪cell_dic:null,
            行Range:null,
            列Range:null,
            queryType:'拼装',
            componentType:E构件类型.钢框架,
        });
        this.gridDivScrollHandler = this.gridDivScrollHandler.bind(this);
        this.clickSearchHandler = this.clickSearchHandler.bind(this);
        this.processData = this.processData.bind(this);
        this.clickCellHandler = this.clickCellHandler.bind(this);
        this.queryChangedHandler = this.queryChangedHandler.bind(this);
        this.levelChangedHandler = this.levelChangedHandler.bind(this);
        this.comTypeChangedHandler = this.comTypeChangedHandler.bind(this);
        
        this.gridDivRef = React.createRef();
        this.rowHeaderDivRef = React.createRef();
        this.columnHeaderDiv = React.createRef();
        this.levelSelectRef = React.createRef();
        this.querySelectRef = React.createRef();
        this.comTypeSelectRef = React.createRef();
    }

    gridDivScrollHandler(ev) {
        if (this.gridDivRef.current) {
            var gridDiv = this.gridDivRef.current;
            // console.log(`${gridDiv.scrollTop}:${gridDiv.scrollLeft}`);
            this.rowHeaderDivRef.current.scrollTop = gridDiv.scrollTop;
            this.columnHeaderDiv.current.scrollLeft = gridDiv.scrollLeft;
        }
    }

    comTypeChangedHandler(ev){
        var newType = this.comTypeSelectRef.current.value;
        this.setState({
            componentType:newType,
            selectedCell:null,
        });
    }

    queryChangedHandler(ev){
        var newType = this.querySelectRef.current.value;
        let allCellData_arr = this.state.allCellData_arr;
        if(allCellData_arr){
            for(var si in allCellData_arr){
                let cell = allCellData_arr[si];
                cell.doQuery(newType);
            }
        }
        this.setState({
            queryType:newType,
            selectedCell:null,
        });
    }

    levelChangedHandler(ev){
        this.setState({
            magicObj:{}
        });
    }

    clickSearchHandler(ev){
        if(this.levelSelectRef.current == null){
            return;
        }
        if(this.state.fetching){
            return;
        }
        var self = this;
        this.setState({
            fetching:true,
            level:'F' + this.levelSelectRef.current.value,
            levelCode:this.levelSelectRef.current.value
        });
        nativeFetchJson(false,DalianServerURL,{
            action: 'getConstructState',
            bundle: { userid: g_envVar.userid,全局代码:this.levelSelectRef.current.value }
        }).then(retJson=>{
            if(retJson.err != null){
                self.setState({
                    fetching:false,
                    fetchingErr:retJson.err.info,
                });
            }
            else{
                self.all数据_arr = retJson.data;
                this.processData();
            }
        });
        // nativeFetchJson();
    }

    processData(){
        let 钢框架cell_dic = {};
        let 铝框架cell_dic = {};
        let 驳接爪cell_dic = {};
        let 特殊驳接爪cell_dic = {};

        let all数据_arr = this.all数据_arr;
        let allCellData_arr = [];
        let min行号 = 999;
        let max行号 = 0;
        let min列号 = 999;
        let max列号 = 0;
        let queryType = this.state.queryType;
        for(let si in all数据_arr){
            let data = all数据_arr[si];
            min行号 = Math.min(min行号,data.行号);
            max行号 = Math.max(max行号,data.行号);
            min列号 = Math.min(min列号,data.列号);
            max列号 = Math.max(max列号,data.列号);
            let key = `${data.行号}_${data.列号}`;
            let cellData = new CDSComponentData(data);
            allCellData_arr.push(cellData);
            cellData.key = key;
            let 材料名称 = data.材料名称;
            if(材料名称[0] == 'K'){
                钢框架cell_dic[key] = cellData;
            }
            if(材料名称[0] == 'V'){
                铝框架cell_dic[key] = cellData;
            }
            if(材料名称[0] == 'A'){
                if(材料名称 == 'AE' || 材料名称 == 'AF'){
                    特殊驳接爪cell_dic[key] = cellData;
                }
                else{
                    驳接爪cell_dic[key] = cellData;
                }
            }

            cellData.doQuery(queryType);
        }

        this.setState({
            fetching:false,
            钢框架cell_dic:钢框架cell_dic,
            铝框架cell_dic:铝框架cell_dic,
            驳接爪cell_dic:驳接爪cell_dic,
            特殊驳接爪cell_dic:特殊驳接爪cell_dic,
            allCellData_arr:allCellData_arr,
            行Range:[min行号,max行号],
            列Range:[min列号,max列号],
        });
    }

    clickCellHandler(cellElem){
        let newValue = this.state.selectedCell == cellElem ? null : cellElem;
        this.setState({
            selectedCell:newValue,
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
        else if(this.all数据_arr == null){
            titleInfo = '请点击检索按钮';
            infoTye = 'light';
        }
        else{
            let use数据_dic = null;
            switch(this.state.componentType){
                case E构件类型.钢框架:
                    use数据_dic = this.state.钢框架cell_dic;
                    break;
                case E构件类型.铝框架:
                    use数据_dic = this.state.铝框架cell_dic;
                    break;
                case E构件类型.驳接爪:
                    use数据_dic = this.state.驳接爪cell_dic;
                    break;
                case E构件类型.特殊驳接爪:
                    use数据_dic = this.state.特殊驳接爪cell_dic;
                    break;
            }
    
            if(this.levelSelectRef.current){
                if(this.levelSelectRef.current.value != this.state.levelCode){
                    titleInfo = '更改楼层后请点击检索按钮来刷新数据';
                }
            }

            var 行Range = this.state.行Range;
            var 列Range = this.state.列Range;
            var rowCount = 行Range[1]-行Range[0]+1;
            var columnCount = 列Range[1]-列Range[0]+1;
            var selectedCell = this.state.selectedCell;
            //autoScroll_Touch
            var CellSize = DaLianStatus_Setting.CellSize;
            var infoContent = null;
            for(var i=列Range[0];i<=列Range[1];++i){
                var useCalssName = '';
                if(selectedCell && selectedCell.列号 == i){
                    useCalssName = ' bg-info';
                }
                columnHeaderElems.push(<div key={i} className={'d-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0' + useCalssName} style={DaLianStatus_HheaderCellSyle}>{i}</div>);
            }

            for(var i=行Range[1];i>=行Range[0];--i){
                var useCalssName = '';
                if(selectedCell && selectedCell.行号 == i){
                    useCalssName = ' bg-info';
                }
                rowHeaderElems.push(<div key={i} className={'d-block border text-center pt-1 pb-1 flex-shrink-0 flex-grow-0' + useCalssName} style={DaLianStatus_HheaderCellSyle}>{i}</div>);
            }

            let count = 0;
            let doneCount = 0;
            let todyDoneCount = 0;
            let yesterdayDoneCount = 0;
            for(var row_i=行Range[1];row_i>=行Range[0];--row_i){
                // rowElems.push(<C_DaLianStatusRow key={row_i} />);
                // continue;
                var cellElems = [];
                for(var col_i=列Range[0];col_i<=列Range[1];++col_i){
                    var cellKey = `${row_i}_${col_i}`;
                    let cellData = use数据_dic[cellKey];
                    if(cellData){
                        count += 1;
                        if(cellData.isDone){
                            doneCount += 1;
                            if(cellData.passDay == 0){
                                todyDoneCount += 1;
                            }
                            else if(cellData.passDay == 1){
                                yesterdayDoneCount += 1;
                            }
                        }
                    }
                    cellElems.push(<C_DaLianStatusCell key={col_i} data={cellData} onClick={this.clickCellHandler} queryType={this.state.queryType} selectedCell={selectedCell} row={row_i} col={col_i} />);
                }
                rowElems.push(<div key={row_i} className='d-flex flex-shrink-0 flex-grow-0'>
                    {cellElems}
                </div>);
            }

            if(selectedCell){
                let elems_arr = [];
                for(var si in 工序_arr){
                    let 工序 = 工序_arr[si];
                    let ret_arr = selectedCell.pureQuery(工序);
                    let elemInfo = '';
                    if(ret_arr[0]){
                        let doneDate = ret_arr[1];
                        elemInfo = `${doneDate.getMonth()+1}月${doneDate.getDate()}日${工序}`;
                    }
                    else{
                        elemInfo = '待' + 工序;
                    }
                    elems_arr.push(<span key={工序} className={'ml-1 badge badge-' + (ret_arr[0] ? 'success' : 'danger')}>
                        <i className={'fa fa-' + (ret_arr[0] ? 'check' : 'cross')} />
                        {elemInfo}
                    </span>);
                }
                infoContent=<div className='h4 d-flex flex-grow-1 flex-wrap'>
                    <span className='flex-grow-0 flex-shrink-0'>选中的:</span>
                    <span className='badge badge-parimary'>
                        {selectedCell.构件全称缓存}
                    </span>
                    {elems_arr}
                </div>
            }
            else{
                infoContent=<div className='d-flex flex-column'>
                    <div className='h4'>
                        {this.state.queryType}进度:
                        <span className='badge badge-success'>
                            {doneCount}
                        </span>
                        /
                        <span className='badge badge-light'>
                            {count}
                        </span>
                        <span className='ml-2'>今日完成:</span>
                        <span className='badge badge-primary'>
                            {todyDoneCount}
                        </span>
                        <span className='ml-2'>昨日完成:</span>
                        <span className='badge badge-primary'>
                            {yesterdayDoneCount}
                        </span>
                    </div>
                </div>
            }
        }
        let useRootClassName = 'd-flex flex-column hidenOverflow ' + this.props.className

        return <div className={useRootClassName} style={this.props.style}>
            <div className='bg-dark d-flex flex-grow-0 flex-shrink-0 align-items-center p-2 flex-wrap'>
                <span className='h4 text-light mb-0 p-1 flex-grow-0 flex-shrink-0'>大连生产施工追踪</span>
                <select ref={this.levelSelectRef} className='h4' onChange={this.levelChangedHandler} >
                    <option value ="1">F1</option>
                    <option value ="2">F2</option>
                    <option value="3">F3</option>
                </select>
                <button className={'btn btn-primary ml-1' + (this.state.fetching ? ' disabled' : '')} onClick={this.clickSearchHandler}><i className='fa fa-search' />检索数据</button>
                {titleInfo == null ? null : <span className={'h5 mb-0 p-1 ml-2 badge badge-' + infoTye}>{titleInfo}</span>}
                <select ref={this.comTypeSelectRef} className='h4' value={this.state.componentType} onChange={this.comTypeChangedHandler} >
                    {构件类型_arr.map(item=>{
                        return <option key={item} value = {item}>{item}</option>
                    })}
                </select>
                <select ref={this.querySelectRef} className='h4' value={this.state.queryType} onChange={this.queryChangedHandler} >
                    {工序_arr.map(item=>{
                        return <option key={item} value = {item}>{item}</option>
                    })}
                </select>
            </div>
            <div className='bg-secondary h5 text-light p-1 mb-0'>{this.state.level}钢框架{this.state.queryType}状态一览</div>
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
            <div id='infoDiv' className='d-flex flex-shrink-0 flex-grow-0'>
                {infoContent}
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