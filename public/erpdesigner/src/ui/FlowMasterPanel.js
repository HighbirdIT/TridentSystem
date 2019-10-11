class FlowMaster extends EventEmitter{
    constructor(){
        super();
        this.allFlows_arr = [];
        autoBind(this);
    }

    findStepByCode(stepCode){
        for(var si in this.allFlows_arr){
            var step = this.allFlows_arr[si].findStepByCode(stepCode);
            if(step != null){
                return step;
            }
        }
        return null;
    }

    synFromJson(records){
        var nowFlows_arr = this.allFlows_arr;
        var newFlows_arr = [];
        for(var si in records){
            var record = records[si];
            var 流程代码 = record.系统流程名称代码;
            var foundFlow = newFlows_arr.find(flow=>{return 流程代码 == flow.code;});
            if(foundFlow == null){
                foundFlow = nowFlows_arr.find(flow=>{return 流程代码 == flow.code;});
                if(foundFlow == null){
                    foundFlow = new FlowObject(流程代码, record.系统流程名称);
                }
                else{
                    foundFlow.setName(record.系统流程名称);
                }
                
                newFlows_arr.push(foundFlow);
                foundFlow.steps_arr.forEach(step=>{
                    step.valid = false;
                });
            }
            if(record.流程操作步骤代码 == null){
                continue;
            }
            var 参数数量 = parseInt(record.参数数量);
            var params_arr = [];
            for(var i=0;i<参数数量;++i){
                params_arr.push(record['参数' + (i+1)]);
            }
            foundFlow.addStep(record.流程操作步骤代码, record.操作步骤名称, params_arr, record);

        }
        newFlows_arr.forEach(flow=>{
            flow.deleteInvalidStep();
        });
        this.setAllFlows(newFlows_arr);
    }

    setAllFlows(newArr){
        this.allFlows_arr = newArr;
        this.clearAllStepCache();
        this.emit('changed');
    }

    getAllSteps(){
        if(this.allSteps_arr == null){
            var newArr =  [];
            this.allFlows_arr.forEach(flow=>{
                flow.steps_arr.forEach(step=>{
                    if(step.code != null){
                        step.fullName = flow.name + '-' + step.name;
                        newArr.push(step);
                    }
                });
            });
            this.allSteps_arr = newArr;
        }
        return this.allSteps_arr;
    }

    clearAllStepCache(){
        this.allSteps_arr = null;
    }
}

const gFlowMaster = new FlowMaster();

class FlowObject extends EventEmitter{
    constructor(code, name){
        super();
        this.code = code;
        this.name = name;
        this.steps_arr = [];
        EnhanceEventEmiter(this);

        this.fetchFileCompleteHandler = this.fetchFileCompleteHandler.bind(this);
    }

    setName(name){
        if(this.name != name){
            this.emit('changed');
        }
    }

    getJson(){
        var rlt = {
            code:this.code,
            name:this.name,
        };
    }

    findStepByCode(code){
        return this.steps_arr.find(step=>{return step.code == code;});
    }

    addStep(code, name, params_arr, record){
        if(code == null){
            var newStep = new FlowStep(null,name,params_arr);
            this.steps_arr.push(newStep);
            newStep.flow = this;
            newStep.是否周期步骤 = 0;
            newStep.周期起始时间 = new Date();
            newStep.周期类型 = '天';
            newStep.周期值 = 1;
            return;
        }
        var theStep = this.findStepByCode(code);
        if(theStep == null){
            theStep = new FlowStep(code,name);
            this.steps_arr.push(theStep);
        }
        if(theStep.name != name){
            theStep.name = name;
        }
        if(record){
            theStep.是否周期步骤 = record.是否周期步骤;
            theStep.周期起始时间 = createDateWithoutTimeZone(record.周期起始时间);
            theStep.周期类型 = record.周期类型;
            theStep.周期值 = record.周期值;
            theStep.进入待办队列 = record.进入待办队列;
        }
        theStep.params_arr = params_arr;
        theStep.valid = true;
        theStep.flow = this;
    }

    deleteInvalidStep(){
        for(var i = 0; i < this.steps_arr.length; ++i){
            if(this.steps_arr[i].valid == false){
                this.steps_arr.split(i, 1);
                --i;
            }
        }
    }

    fetchFileCompleteHandler(ev){
        if(ev.json.err != null && ev.json.err.info.toLowerCase() != 'notfound'){
            alert(ev.json.err.info);
            return;
        }
        var self = this;
        if(ev.json.data == null){
            self.bluePrint = new FlowNode_BluePrint({flow:self}, ev.json.data);
            self.emit('fileLoaded',this);
        }
        else{
            g_dataBase.doSyn_Unload_bycodes(ev.json.data.useEntities_arr, ()=>{
                self.bluePrint = new FlowNode_BluePrint({flow:self}, ev.json.data);
                self.emit('fileLoaded',this);
            });
        }
    }

    loadFile(){
        if(isNaN(this.code)){
            return;
        }
        if(this.bluePrint != null){
            return this.bluePrint;
        }
        fetchJsonPost('server', { action: 'getFlowFile', flowCode:this.code}, this.fetchFileCompleteHandler);
        return null;
    }
}

class FlowStep extends EventEmitter{
    constructor(code,name,params_arr){
        super();
        EnhanceEventEmiter(this);
        this.code = code;
        this.name = name;
        this.params_arr = params_arr;
    }
}

class CFlowObject extends React.PureComponent
{
    constructor(props){
        super(props);
        autoBind(this);
        this.state={

        };
    }

    componentWillMount(){

    }

    componentWillUnmount(){

    }

    clickEditBtn(ev){
        var flow = this.props.flow;
        var newName = this.state.newName;
        if(newName == null || newName.length < 4 || newName.length > 10){
            alert('名称长度不合法');
            return;
        }
        if(flow.code == null){
            fetchJsonPost('server', { action: 'createFlow', name:newName}, this.editeCallBack);
        }
        else{
            fetchJsonPost('server', { action: 'modifyFlow', name:newName, code:flow.code}, this.editeCallBack);
        }
    }

    clickdoEditBtn(ev){
        this.setState({
            editing:true,
            newName:this.props.flow.name,
        });
    }

    editeCallBack(ev){
        console.log(ev);
        if(ev.json.err != null){
            alert(ev.json.err.info);
            return;
        }
        var flow = this.props.flow;
        if(flow.code == null){
            flow.code = ev.json.data;
            gFlowMaster.clearAllStepCache();
        }
        flow.name = this.state.newName;
        this.setState({
            newName:null,
            editing:false,
        });
    } 

    nameInputChanged(ev){
        var newName = ev.target.value;
        this.setState({
            newName:newName,
        });
    }

    render(){
        var flow = this.props.flow;
        if(flow.code == null || this.state.editing){
            return (<div className='list-group-item flex-shrink-0 d-flex align-items-center' style={{paddingLeft:'5px',paddingRight:'5px'}}>
                    <span className='text-nowrap'>名称:</span>
                    <input onChange={this.nameInputChanged} className='flex-grow-1 flex-shrink-1 w-100' value={(this.state.newName == null ? flow.name : this.state.newName)} />
                    <button onClick={this.clickEditBtn} className='btn'><i className='fa fa-check fa-1x' /></button>
                </div>);
        }
        return <div d-code={flow.code} onClick={this.props.onclick}  className={'list-group-item list-group-item-action flex-shrink-0' + (this.props.selectedCode == flow.code ? ' active' : '')}><button onClick={this.clickdoEditBtn} className='btn'><i className='fa fa-edit fa-1x' /></button>{flow.name}</div>;
    }
}
class CFlowStep extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);
        
        var initState = {};
        if(this.props.step.code == null){
            initState={
                newName:this.props.step.name,
            }
        }

        this.state=initState;
    }

    clickEditBtn(ev){
        var step = this.props.step;
        var newName = this.state.newName;
        if(newName == null || newName.length < 2 || newName.length > 25){
            alert('名称长度不合法');
            return;
        }

        var postData={
            code:step.code,
            name:newName, 
            flowCode:step.flow.code,
            param1:this.state.param1Name,
            param2:this.state.param2Name,
            param3:this.state.param3Name,
            是否周期步骤:this.state.是否周期步骤,
            进入待办队列:this.state.进入待办队列,
        }

        if(this.state.是否周期步骤)
        {
            if(!checkDate(this.state.周期起始_日期))
            {
                alert('日期不合法');
                return;
            }
            if(!checkTime(this.state.周期起始_时间))
            {
                alert('时间不合法');
                return;
            }
            postData.周期起始时间 = this.state.周期起始_日期 + ' ' + this.state.周期起始_时间;
            if(this.state.周期值<=0)
            {
                alert('数值不能小于1');
                return;
            }
            postData.周期值=this.state.周期值;
            postData.周期类型=this.state.周期类型;
        }

        var paramCount = 0;
        if(!IsEmptyString(postData.param1)){
            paramCount = 1;
            if(!IsEmptyString(postData.param2)){
                paramCount = 2;
                if(!IsEmptyString(postData.param3)){
                    paramCount = 3;
                }
            }
        }
        
        postData.paramCount = paramCount;
        if(step.code == null){
            postData.action = 'createFlowStep';
        }
        else{
            postData.action = 'modifyFlowStep';
        }

        fetchJsonPost('server', postData, this.editeCallBack);
    }

    clickdoEditBtn(ev){
        var step = this.props.step;
        var params_arr = step.params_arr;
        this.setState({
            editing:true,
            newName:step.name,
            param1Name:params_arr.length > 0 ? params_arr[0] : '',
            param2Name:params_arr.length > 1 ? params_arr[1] : '',
            param3Name:params_arr.length > 2 ? params_arr[2] : '',
            是否周期步骤:step.是否周期步骤,
            周期起始_日期:getFormatDateString(step.周期起始时间 ? step.周期起始时间 : new Date()),
            周期起始_时间:step.周期起始时间 ? getFormatTimeString(step.周期起始时间) : '08:00',
            周期类型:step.周期类型 ? step.周期类型 : '天',
            周期值:step.周期值 == null ? 1 : step.周期值,
            进入待办队列:step.进入待办队列
        });
    }

    editeCallBack(ev){
        if(ev.json.err != null){
            alert(ev.json.err.info);
            return;
        }
        var step = this.props.step;
        if(step.code == null){
            step.code = ev.json.data;
            step.flow.fireEvent('changed', 100);
            gFlowMaster.clearAllStepCache();
        }
        step.name = this.state.newName;
        var params_arr=[];
        for(var i = 0; i < ev.postData.paramCount; ++i){
            params_arr.push(ev.postData['param' + (i+1)]);
        }
        step.params_arr=params_arr;
        step.是否周期步骤 = this.state.是否周期步骤;
        if(step.是否周期步骤){
            step.周期类型 = this.state.周期类型;
            step.周期值 = this.state.周期值;
            step.周期起始时间 = new Date(this.state.周期起始_日期 + ' ' + this.state.周期起始_时间);
        }
        else{
            step.周期类型 = null;
            step.周期值 = null;
            step.周期起始时间 = null;
        }
        step.进入待办队列 = this.state.进入待办队列;

        this.setState({
            newName:null,
            editing:false,
            param1Name:null,
            param2Name:null,
            param3Name:null,
            进入待办队列:null,
        });
        step.emit('changed');
    } 

    nameInputChanged(ev){
        var tag = ev.target.getAttribute('d-tag');
        var newState = {};
        if(tag == '进入待办队列'){
            newState[tag] = ev.target.checked;
        }
        else{
            newState[tag] = ev.target.value;
        }
        this.setState(newState);
    }

    是否周期步骤Changed(ev){
        var newState = {
            是否周期步骤:ev.target.checked,
        };

        this.setState(newState);
    }

    render(){
        var step = this.props.step;
        var params_arr = step.params_arr ? step.params_arr : [];
        if(step.code == null || this.state.editing){
            var param1Name = ReplaceIfNull(this.state.param1Name, params_arr.length > 0 ? params_arr[0] : '');
            var param2Name = ReplaceIfNull(this.state.param2Name, params_arr.length > 1 ? params_arr[1] : '');
            var param3Name = ReplaceIfNull(this.state.param3Name, params_arr.length > 2 ? params_arr[2] : '');
            var 是否周期步骤 = this.state.是否周期步骤 == true;
            var 周期起始_日期 = this.state.周期起始_日期 ? this.state.周期起始_日期 : '';
            var 周期起始_时间 = this.state.周期起始_时间 ? this.state.周期起始_时间 : '';
            return (
                <div className='list-group-item flex-shrink-0 d-flex align-items-center d-flex' style={{paddingLeft:'5px',paddingRight:'5px'}}>
                    <div className='d-flex flex-column'>
                        <div className='d-flex flex-grow-1'>
                            <span className='text-nowrap'>名 称:</span>
                            <input d-tag='newName' onChange={this.nameInputChanged} className='flex-grow-1 flex-shrink-1 w-100' value={(this.state.newName == null ? step.name : this.state.newName)} />
                        </div>
                        <div className='d-flex flex-grow-1'>
                            <span className='text-nowrap'>参数1:</span>
                            <input d-tag='param1Name' onChange={this.nameInputChanged} className='flex-grow-1 flex-shrink-1 w-100' value={param1Name} />
                        </div>
                        <div className='d-flex flex-grow-1'>
                            <span className='text-nowrap'>参数2:</span>
                            <input d-tag='param2Name' onChange={this.nameInputChanged} className='flex-grow-1 flex-shrink-1 w-100' value={param2Name} />
                        </div>
                        <div className='d-flex flex-grow-1'>
                            <span className='text-nowrap'>参数3:</span>
                            <input d-tag='param3Name' onChange={this.nameInputChanged} className='flex-grow-1 flex-shrink-1 w-100' value={param3Name} />
                        </div>
                        <div className='d-flex flex-grow-1'>
                            <span className='text-nowrap'>进入待办队列:</span>
                            <input d-tag='进入待办队列' type='checkbox' onChange={this.nameInputChanged} checked={this.state.进入待办队列 == null ? step.进入待办队列 : this.state.进入待办队列} />
                        </div>
                        <div className='d-flex flex-grow-1 align-items-center'>
                            <span className='text-nowrap'>周期步骤:</span>
                            <input type='checkbox' checked={是否周期步骤} onChange={this.是否周期步骤Changed} />
                        </div>

                        {是否周期步骤 && <React.Fragment>
                            <div className='d-flex flex-grow-1'>
                                <span className='text-nowrap'>起始日期:</span>
                                <input d-tag='周期起始_日期' type='date' value={周期起始_日期} onChange={this.nameInputChanged}  />
                            </div>
                            <div className='d-flex flex-grow-1'>
                                <span className='text-nowrap'>起始时间:</span>
                                <input d-tag='周期起始_时间' type='time' value={周期起始_时间} onChange={this.nameInputChanged}  />
                            </div>
                            <div className='d-flex flex-grow-1'>
                                <span className='text-nowrap'>周期类型:</span>
                                <select d-tag='周期类型' value={this.state.周期类型} onChange={this.nameInputChanged}>
                                    <option>小时</option>
                                    <option>天</option>
                                    <option>周</option>
                                    <option>月</option>
                                    <option>季度</option>
                                    <option>年</option>
                                </select>
                            </div>
                            <div className='d-flex flex-grow-1'>
                                <span className='text-nowrap'>周期值:</span>
                                <input d-tag='周期值' type='number'  value={this.state.周期值 == null ? '' : this.state.周期值} onChange={this.nameInputChanged}  />
                            </div>
                            </React.Fragment>}
                    </div>
                    <button onClick={this.clickEditBtn} className='btn'><i className='fa fa-check' /></button>
                </div>
                );
        }
        return <div d-code={step.code} onClick={this.props.onclick}  className={'list-group-item flex-shrink-0 d-flex'}>
                <button onClick={this.clickdoEditBtn} className='btn flex-grow-0'><i className='fa fa-edit fa-1x' /></button>
                <div className='d-flex flex-column flex-grow-1'>
                    <div className='list-group-item'>{step.name}[{step.code}]</div>
                    {params_arr.map((param,index)=>{
                        return <div key={index} className='list-group-item flex-shrink-0'>@{param}</div>;
                    })}
                    {step.是否周期步骤 && 
                    <div className='list-group-item'>
                        自{getFormatDateTimeString(step.周期起始时间, false)}起每{step.周期值}{step.周期类型}执行一次
                    </div>
                    }
                    {!step.进入待办队列 && 
                    <div className='list-group-item text-danger'>
                        不进待办队列
                    </div>
                    }
                </div>
            </div>;
    }
}



class CFlowMaster extends React.PureComponent
{
    constructor(props){
        super(props);
        autoBind(this);
        this.state={
            flows:gFlowMaster.allFlows_arr,
            selectedFlow:null,
            selectedFlowBP:null,
            flowBPLoading:false,
            flowKeyword:'',
            stepKeyword:''
        };
        this.panelBaseRef = React.createRef();

        this.navbarRef = React.createRef();

        var navItems = [
            CreateNavItemData('流程设计', <div/>),
            CreateNavItemData('数据设计', <div/>),
        ];

        this.navData = {
            selectedItem: navItems[0],
            items: navItems,
        };
        this.navItems = navItems;
    }

    flowFileLoadedHandler(flow){
        //console.log('flowFileLoadedHandler');
        //console.log(flow);
        if(flow == this.state.selectedFlow){
            this.setState({
                selectedFlowBP:flow.bluePrint,
                flowBPLoading:false,
            });
        }
    }

    flowMasterChangedHandler(ev){
        var nowArr = this.state.flows;
        nowArr.forEach(flow=>{
            flow.off('fileLoaded', this.flowFileLoadedHandler);
        })
        gFlowMaster.allFlows_arr.forEach(flow=>{
            flow.on('fileLoaded', this.flowFileLoadedHandler);
        });
        this.setState({
            flows:gFlowMaster.allFlows_arr,
        });
    }

    componentWillMount(){
        gFlowMaster.on('changed', this.flowMasterChangedHandler);
        gFlowMaster.allFlows_arr.forEach(flow=>{
            flow.on('fileLoaded', this.flowFileLoadedHandler);
        });
    }

    componentWillUnmount(){
        gFlowMaster.off('changed', this.flowMasterChangedHandler);
        gFlowMaster.allFlows_arr.forEach(flow=>{
            foundFlow.off('fileLoaded', this.flowFileLoadedHandler);
        });
    }

    clickPlusBtnHandler(ev){
        var newFlow = new FlowObject(null,'未命名');
        this.setState({
            flows:this.state.flows.concat(newFlow),
        });
    }

    clickFlowObject(ev){
        var code=ev.target.getAttribute('d-code');
        if(code != null){
            var theFlow = this.state.flows.find(flow=>{return flow.code == code;});
            var theBP = theFlow.loadFile();

            this.setState({
                selectedFlow:theFlow,
                selectedFlowBP:theBP,
                flowBPLoading:theBP == null,
            });
        }
    }

    clickPlusStepBtnHandler(ev){
        if(this.state.selectedFlow){
            this.state.selectedFlow.addStep(null,'未命名');
            this.setState({
                magicObj:{},
            });
        }
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

    saveFlowClickHandler(ev){
        var flowBP = this.state.selectedFlowBP;
        if(flowBP == null || this.state.saving){
            return;
        };
        this.setState({
            saving:true
        });
        var flowJson = flowBP.getJson();
        fetchJsonPost('server', { action: 'saveFlowFile', flowJson:flowJson}, this.saveFetchCallBack);
    }

    saveFetchCallBack(ev){
        if(ev.json.err != null){
            alert(ev.json.err.info);
        }
        var self = this;
        setTimeout(() => {
            self.setState({
                saving:false
            });
        }, 500);
    }
    flowInputChange(ev){
        this.setState({
            flowKeyword:ev.target.value
        })
    }
    renderFlowList() {
        var selectedFlow = this.state.selectedFlow;
        var temporary_flowArrs =this.state.flows;
        var showFlowArr =[];
        if (temporary_flowArrs == null){
            return null
        }
        if(this.state.flowKeyword == '' || this.state.flowKeyword == null){
            showFlowArr=temporary_flowArrs;
        }else{
            for(var i=0,len =temporary_flowArrs.length;i<len;i++){
                if (temporary_flowArrs[i].name.indexOf(this.state.flowKeyword) >= 0) {
                    showFlowArr.push(temporary_flowArrs[i]);
                }
            }
        }
        return showFlowArr.map((flow, index) => {
            return <CFlowObject selectedCode={selectedFlow == null ? null : selectedFlow.code} onclick={this.clickFlowObject} key={flow.code ? flow.code : 'new' + index} flow={flow} />
        })
    }
    stepInputChange(ev){
        this.setState({
            stepKeyword:ev.target.value
        })
    }
    renderStepList(){
        var selectedFlow = this.state.selectedFlow;
        var temporary_stepArrs=selectedFlow && selectedFlow.steps_arr;
        var showStepArr=[];
        if(temporary_stepArrs == null ){
            return null
        }
        if(this.state.stepKeyword ==''|| this.state.stepKeyword==''){
            showStepArr=temporary_stepArrs;
        }else{
            for(var i=0,len=temporary_stepArrs.length;i<len;i++){
                if(temporary_stepArrs[i].name.indexOf(this.state.stepKeyword)>=0){
                    showStepArr.push(temporary_stepArrs[i]);
                }
            }
        }
        return showStepArr                 .map((step,index)=>{
            return <CFlowStep  key={step.code ? step.code : 'new' + index} step={step} />
        })
    }
    
    render(){
        this.navItems[0].content = <C_FlowNode_Editor bluePrint={this.state.selectedFlowBP} />;
        if(this.state.selectedFlowBP){
            this.navItems[1].content = <FlowSqlBPItemPanel dataMaster={this.state.selectedFlowBP.dataMaster} />;
        }

        var saving = this.state.saving;
        //var selectedFlow = this.state.selectedFlow;
        return (<FloatPanelbase title={'流程大师'} initShow={false} initMax={true} ref={this.panelBaseRef}>
                <div className='d-flex flex-grow-0 flex-shrink-0 w-100 h-100'>
                    <SplitPanel 
                        defPercent={0.2}
                        fixedOne={true}
                        maxSize={300}
                        barClass='bg-secondary'
                        panel1={
                            <SplitPanel 
                                defPercent={0.5}
                                fixedOne={true}
                                flexColumn={true}
                                barClass='bg-secondary'
                                panel1={
                                    <div className='bg-dark w-100 h-100 d-flex flex-column'>
                                        <div className='d-flex text-light bg-dark flex-shrink-0 align-items-center'>
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-addon" id="sizing-addon3">所有流程:</span>
                                                <input type="text" className="form-control" placeholder="请输入" aria-describedby="sizing-addon3" onChange={this.flowInputChange}/>
                                            </div>
                                            <div className='btn-group'>
                                            <button type='button' className='btn btn-dark flex-shrink-0'>
                                                <i className='fa fa-refresh' />
                                            </button>
                                            <button type='button' className='btn btn-dark flex-shrink-0' onClick={this.clickPlusBtnHandler}>
                                                <i className='fa fa-plus text-success' /> 
                                            </button>
                                            </div>
                                        </div>
                                        <div className='list-group autoScroll'>
                                            {
                                                /*this.state.flows.map((flow,index)=>{
                                                    return <CFlowObject selectedCode={selectedFlow == null ? null : selectedFlow.code} onclick={this.clickFlowObject}  key={flow.code ? flow.code : 'new' + index} flow={flow} />
                                                })
                                                */
                                                this.renderFlowList()
                                            }
                                        </div>
                                    </div>
                                }
                                panel2={<div className='w-100 h-100 d-flex flex-column'>
                                <div className='d-flex text-light bg-dark flex-shrink-0 align-items-center'>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-addon" id="sizing-addon3">步骤列表:</span>
                                            <input type="text" className="form-control" placeholder="请输入" aria-describedby="sizing-addon3" onChange={this.stepInputChange}/>
                                        </div>
                                            <button type='button' className='btn btn-dark flex-shrink-0' onClick={this.clickPlusStepBtnHandler}>
                                                <i className='fa fa-plus text-success' /> 
                                            </button>
                                        </div>
                                        <div className='flex-grow-1 flex-shrink-1  autoScroll'>
                                        <div className='list-group '>
                                            {   
                                                /*selectedFlow && selectedFlow.steps_arr.map((step,index)=>{
                                                    return <CFlowStep  key={step.code ? step.code : 'new' + index} step={step} />
                                                })*/
                                                this.renderStepList()
                                            }
                                        </div>
                                        </div>
                                        
                                    </div>}
                            />
                        }
                        panel2={<div className='d-flex flex-grow-1 flex-shrink-1 bg-dark mw-100'>
                            {
                                this.state.flowBPLoading ? <div className='w-100 h-100 text-light'><h1>正在加载文件</h1></div> 
                                : <div className='d-flex flex-grow-1 flex-column flex-shrink-1'>
                                    <div className='d-flex flex-grow-0 flex-shrink-0'>
                                        <TabNavBar ref={this.navbarRef} navData={this.navData} navChanged={this.navChanged} />
                                        <button onClick={this.saveFlowClickHandler} type='button' className='btn btn-info'><i className='fa fa-save' />{saving ? '保存中' : '保存流程'}{saving && <i className='fa fa-refresh fa-spin fa-fw' />}</button>
                                        <QuickKeyWordSynBar />
                                    </div>
                                    {
                                        this.navItems.map(item => {
                                            return (<div key={item.text} className={'flex-grow-1 flex-shrink-1 ' + (item == this.navData.selectedItem ? ' d-flex' : ' d-none')}>
                                                {item.content}
                                            </div>)
                                        })
                                    }
                                </div>
                            }
                            </div>}
                    />
                </div>
            </FloatPanelbase>);
    }
}

class FlowSqlBPItemPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            items_arr:this.props.dataMaster.BP_sql_arr,
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
        if(this.props.items_arr != this.props.dataMaster.BP_sql_arr){
            var self = this;
            setTimeout(() => {
                var newSelectedItem = this.props.dataMaster.BP_sql_arr.indexOf(this.state.selectedItem) == -1 ? null : this.state.selectedItem;
                self.setState({
                    items_arr : this.props.dataMaster.BP_sql_arr,
                    selectedItem : newSelectedItem,
                });
            }, 50);
        }
        var selectedItem = this.state.selectedItem;
        return (
            <React.Fragment>
                {
                    this.state.creating || this.state.modifing ? <SqlBPEditPanel targetBP={this.state.modifing ? selectedItem : null} dataMaster={this.props.dataMaster} onComplete={this.newItemCompleteHandler} /> : null
                }
                <SplitPanel
                defPercent={0.45}
                maxSize='200px'
                barClass='bg-secondary'
                panel1={
                    <div className='d-flex flex-column flex-grow-1 flex-shrink-1 w-100' >
                        <span className='text-light'>已创建的:</span>
                        <div className='list-group flex-grow-1 flex-shrink-1 bg-dark autoScroll'>
                            {
                                this.state.items_arr.map(item=>{
                                    if(item.group != 'custom'){
                                        return null;
                                    }
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