class C_JSNode_Var_Get extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            //nodedata:this.props.nodedata,
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='GET'>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Var_Set extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);

        this.state = {

        }
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='SET' >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_NOperand extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            operator: this.props.nodedata.operator,
        }
    }

    selectItemChangedHandler(newoperator) {
        var nodeData = this.props.nodedata;
        nodeData.operator = newoperator;
        this.setState({
            operator: newoperator
        });
    }

    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '40px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '100px'
            };
        }
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['+', '-', '*', '/']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
        </div>);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_CurrentDataRow extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var formKernel = theProject.getControlById(nodeData.formID);

        this.state = {
            formKernel: formKernel,
        }
    }

    formAttrChangedHandler(ev) {
        if (ev.name == AttrNames.DataSource
            || ev.name == AttrNames.name) {
            this.reDraw();
        }
    }

    cus_componentWillMount() {
        if (this.state.formKernel) {
            this.state.formKernel.on(EATTRCHANGED, this.formAttrChangedHandler);
        }
    }

    cus_componentWillUnmount() {
        if (this.state.formKernel) {
            this.state.formKernel.off(EATTRCHANGED, this.formAttrChangedHandler);
        }
    }

    socketColumnSelectChanged(newVal, ddc) {
        var socket = ddc.props.socket;
        socket.setExtra('colName', newVal);
    }

    getCanUseColumns() {
        return this.canUseColumns_arr == null ? [] : this.canUseColumns_arr;
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nowVal = socket.getExtra('colName');

        return (<span><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={this.getCanUseColumns} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} /></span>);
    }

    cusHeaderFuc() {
        var nodeData = this.props.nodedata;
        var formKernel = this.state.formKernel;
        var titleElem = null;
        if (formKernel == null) {
            titleElem = (<span f-canmove={1} className='text-danger'>无效的FormID{nodeData.id}</span>);
        }
        else {
            var formDS = formKernel.getAttribute(AttrNames.DataSource);
            var newColumns = [];
            if(formDS != null){
                formDS.columns.forEach(colItem => {
                    newColumns.push(colItem.name);
                });
            }
            this.canUseColumns_arr = newColumns;
            titleElem = (<div f-canmove={1} className='d-flex flex-column'>
                <span f-canmove={1}>{formKernel.getReadableName()}</span>
                <span f-canmove={1} className='badge badge-info'>{formDS == null ? '无数据源' : formDS.name + '-当前行'}</span>
            </div>)
        }

        return titleElem;
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.processOutputSockets} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNODE_Insert_table extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    dbItemChanged(newCode) {
        console.log(newCode);
        this.props.nodedata.setDSCode(newCode);
    }

    render() {
        var nowVal = this.props.nodedata.dsCode;
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'Insert'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.dbItemChanged} btnclass='btn-dark' options_arr={g_dataBase.getAllTable} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_DateFun extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    funNameSelectChanged(newVal) {
        this.props.nodedata.setFunName(newVal);
    }


    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                minWidth: '150px',
                margin: 'auto',
            }
        }
        var funName = this.props.nodedata.funName;
        return (<DropDownControl style={this.ddcStyle} itemChanged={this.funNameSelectChanged} btnclass='btn-dark' options_arr={gJSDateFuns_arr} rootclass='flex-grow-0 flex-shrink-0' value={funName} textAttrName='name' />);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
                <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}  />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Query_Sql extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_NodeCom_Base(this);

        this.state = {
        }

        this.dropdownRef = React.createRef();
    }

    nodeDataChangedHandler() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (entity) {
            this.dropdownRef.current.setValue(entity.code);
        }
        this.setState({ magicObj: {} });
    }

    cus_componentWillMount() {
        this.listenData(this.props.nodedata);
    }

    cus_componentWillUnmount() {
        this.unlistenData(this.props.nodedata);
    }

    listenData(nodeData) {
        if (nodeData) {
            nodeData.on('changed', this.nodeDataChangedHandler);
        }
    }

    unlistenData(nodeData) {
        if (nodeData) {
            nodeData.off('changed', this.nodeDataChangedHandler);
        }
    }

    dropdownCtlChangedHandler(selectedDBE) {
        var nodeData = this.props.nodedata;
        nodeData.setEntity(selectedDBE);
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='查询SQL'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={nodeData.bluePrint.master.project.dataMaster.getAllEntities} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Logical_Operator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            LogicalType: this.props.nodedata.LogicalType,
        }
    }

    selectItemChangedHandler(newLogicalType) {
        var nodeData = this.props.nodedata;
        nodeData.LogicalType = newLogicalType;
        this.setState({
            LogicalType: newLogicalType
        });
    }

    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: '10px',
            }
        }
        var nodeData = this.props.nodedata;
        return (<DropDownControl options_arr={Logical_Operators_arr} value={nodeData.LogicalType} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNODE_Do_FlowStep extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    flowStepDDCChanged(code,ddc,flowStep) {
        this.props.nodedata.setFlowStep(flowStep);
    }

    render() {
        var nowVal = this.props.nodedata.flowStepCode;
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'申请执行流程步骤'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.flowStepDDCChanged} btnclass='btn-dark' options_arr={gFlowMaster.getAllSteps} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='fullName' valueAttrName='code' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_JumpPage extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    targetPageDDCChanged(code,ddc,pageCode) {
        this.props.nodedata.pageCode = code;
    }

    render() {
        var nowVal = this.props.nodedata.pageCode;
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'打开页面'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.targetPageDDCChanged} btnclass='btn-dark' options_arr={theProject.getAllPages} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='title' valueAttrName='id' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}