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
            <DropDownControl options_arr={['+', '-', '*', '/', '%']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
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

    getFormDS() {
        var nodeData = this.props.nodedata;
        var formKernel = nodeData.bluePrint.master.project.getControlById(nodeData.formID);
        return formKernel.getAttribute(AttrNames.DataSource);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket) {
            return null;
        }

        var entity = this.getFormDS();
        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={entity == null ? [] : entity.columns} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
            <button onMouseDown={this.mouseDownOutSocketHand} d-colname={nowVal} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
    }

    mouseDownOutSocketHand(ev) {
        var colName = getAttributeByNode(ev.target, 'd-colname', true, 5);
        if (colName == null) {
            return;
        }
        var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
        if (socketid == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        var entity = this.getFormDS();
        if (entity == null) {
            return;
        }
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if (entity.containColumn(colName)) {
            var newNode = new FlowNode_ColumnVar({
                keySocketID: socketid,
                newborn: true,
                left: bornPos.x,
                top: bornPos.y,
            }, nodeData.parent);
        }
    }

    rowSourceItemChanged(newSrc) {
        this.props.nodedata.rowSource = newSrc;
        this.props.nodedata.rowSourceChanged();
    }

    dropdownCtlChangedHandler(selectedDBE) {
        var nodeData = this.props.nodedata;
        nodeData.setEntity(selectedDBE);
    }

    clickFreshIcon() {
        this.props.nodedata.rowSourceChanged();
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
            if (formDS != null) {
                formDS.columns.forEach(colItem => {
                    newColumns.push(colItem.name);
                });
            }
            this.canUseColumns_arr = newColumns;
            titleElem = (<div f-canmove={1} className='d-flex flex-column'>
                <span f-canmove={1}>{formKernel.getReadableName()}</span>
                <span f-canmove={1} className='badge badge-primary'>{nodeData.id}</span>
                <div className='d-flex'>
                    <span f-canmove={1} className='badge badge-info'>{formDS == null ? '无数据源' : formDS.name}</span>
                    <DropDownControl itemChanged={this.rowSourceItemChanged} btnclass='btn-dark' options_arr={EFormRowSources_arr} rootclass='flex-grow-1 flex-shrink-1' value={nodeData.rowSource} textAttrName='text' valueAttrName='value' />
                    <span className='fa fa-fresh' onMouseDown={this.clickFreshIcon} />
                </div>
            </div>)
        }

        return titleElem;
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex flex-column'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} customSocketRender={this.customSocketRender} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
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

    clickAutoCallFetchEnd(ev){
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj:{},
        });
    }

    render() {
        var nowVal = this.props.nodedata.dsCode;
        var nodeData = this.props.nodedata;
        var autoCallFetchEnd = nodeData.autoCallFetchEnd != false;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.dbItemChanged} btnclass='btn-dark' options_arr={g_dataBase.getAllTable} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={nowVal ? nowVal : -1} />
            </div>
            <div className='bg-light'>
                <span className='fa-stack fa-lg' onClick={this.clickAutoCallFetchEnd}>
                    <i className={"fa fa-square-o fa-stack-2x"} />
                    <i className={'fa fa-stack-1x ' + (autoCallFetchEnd ? ' fa-check text-success' : ' fa-close text-danger')} />
                </span>
                AutoCallFetchEnd
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
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
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

    socketColumnSelectChanged(newVal, ddc) {
        var socket = ddc.props.socket;
        socket.setExtra('colName', newVal);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket) {
            return null;
        }
        var entity = nodeData.targetEntity;
        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={entity == null ? [] : entity.columns} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
            <button onMouseDown={this.mouseDownOutSocketHand} d-colname={nowVal} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
    }

    mouseDownOutSocketHand(ev) {
        var colName = getAttributeByNode(ev.target, 'd-colname', true, 5);
        if (colName == null) {
            return;
        }
        var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
        if (socketid == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (entity == null) {
            return;
        }
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if (entity.containColumn(colName)) {
            var newNode = new FlowNode_ColumnVar({
                keySocketID: socketid,
                newborn: true,
                left: bornPos.x,
                top: bornPos.y,
            }, nodeData.parent);
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        var dataMaster = null;
        if (nodeData.bluePrint.master && nodeData.bluePrint.master.project) {
            dataMaster = nodeData.bluePrint.master.project.dataMaster;
        }
        else if (nodeData.bluePrint.dataMaster) {
            dataMaster = nodeData.bluePrint.dataMaster;
        }

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='查询SQL'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={dataMaster.getAllEntities} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} customSocketRender={this.customSocketRender} />
                </div>
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

    flowStepDDCChanged(code, ddc, flowStep) {
        this.props.nodedata.setFlowStep(flowStep);
    }

    clickAutoCallFetchEnd(ev){
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj:{},
        });
    }

    render() {
        var nowVal = this.props.nodedata.flowStepCode;
        var nodeData = this.props.nodedata;
        var autoCallFetchEnd = nodeData.autoCallFetchEnd != false;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'申请执行流程步骤'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.flowStepDDCChanged} btnclass='btn-dark' options_arr={gFlowMaster.getAllSteps} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='fullName' valueAttrName='code' value={nowVal ? nowVal : -1} />
            </div>
            <div className='bg-light'>
                <span className='fa-stack fa-lg' onClick={this.clickAutoCallFetchEnd}>
                    <i className={"fa fa-square-o fa-stack-2x"} />
                    <i className={'fa fa-stack-1x ' + (autoCallFetchEnd ? ' fa-check text-success' : ' fa-close text-danger')} />
                </span>
                AutoCallFetchEnd
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

    targetPageDDCChanged(code, ddc, pageCode) {
        this.props.nodedata.pageCode = code;
    }

    render() {
        var nowVal = this.props.nodedata.pageCode;
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'打开页面'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.targetPageDDCChanged} btnclass='btn-dark' options_arr={theProject.getJumpablePages} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='title' valueAttrName='id' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_PopPage extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    targetPageDDCChanged(code, ddc, thePage) {
        this.props.nodedata.setPage(thePage);
    }

    render() {
        var nowVal = this.props.nodedata.pageCode;
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'弹出页面'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.targetPageDDCChanged} btnclass='btn-dark' options_arr={theProject.getPopablePages} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='title' valueAttrName='id' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNODE_Delete_Table extends React.PureComponent {
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

    socketColumnSelectChanged(newVal, ddc) {
        var socket = ddc.props.socket;
        socket.setExtra('colName', newVal);
    }

    clickAutoCallFetchEnd(ev){
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj:{},
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataMaster = null;
        if (nodeData.bluePrint.master && nodeData.bluePrint.master.project) {
            dataMaster = nodeData.bluePrint.master.project.dataMaster;
        }
        else if (nodeData.bluePrint.dataMaster) {
            dataMaster = nodeData.bluePrint.dataMaster;
        }
        var autoCallFetchEnd = nodeData.autoCallFetchEnd != false;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='删除数据'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={dataMaster.getDeleteEntities} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='bg-light'>
                <span className='fa-stack fa-lg' onClick={this.clickAutoCallFetchEnd}>
                    <i className={"fa fa-square-o fa-stack-2x"} />
                    <i className={'fa fa-stack-1x ' + (autoCallFetchEnd ? ' fa-check text-success' : ' fa-close text-danger')} />
                </span>
                AutoCallFetchEnd
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} customSocketRender={this.customSocketRender} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_FreshForm extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    clickHoldChecker(ev) {
        var nodeData = this.props.nodedata;
        var holdSelected = nodeData.holdSelected == null ? false : nodeData.holdSelected;
        nodeData.holdSelected = !holdSelected;
        this.setState({
            magicObj: {}
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var holdSelected = nodeData.holdSelected == null ? false : nodeData.holdSelected;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'刷新表单'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <div className='bg-light'>
                    <span className='fa-stack fa-lg' onClick={this.clickHoldChecker}>
                        <i className={"fa fa-square-o fa-stack-2x"} />
                        <i className={'fa fa-stack-1x ' + (holdSelected ? ' fa-check text-success' : ' fa-close text-danger')} />
                    </span>
                    保持选中值
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Excute_Pro extends React.PureComponent {
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

    clickAutoCallFetchEnd(ev){
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj:{},
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        var dataMaster = null;
        if (nodeData.bluePrint.master && nodeData.bluePrint.master.project) {
            dataMaster = nodeData.bluePrint.master.project.dataMaster;
        }
        else if (nodeData.bluePrint.dataMaster) {
            dataMaster = nodeData.bluePrint.dataMaster;
        }
        var autoCallFetchEnd = nodeData.autoCallFetchEnd != false

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='执行存储过程'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.getAllProduce} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='bg-light'>
                <span className='fa-stack fa-lg' onClick={this.clickAutoCallFetchEnd}>
                    <i className={"fa fa-square-o fa-stack-2x"} />
                    <i className={'fa fa-stack-1x ' + (autoCallFetchEnd ? ' fa-check text-success' : ' fa-close text-danger')} />
                </span>
                AutoCallFetchEnd
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}