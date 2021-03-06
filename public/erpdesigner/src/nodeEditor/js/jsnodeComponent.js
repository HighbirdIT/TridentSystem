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
        return formKernel == null ? null : formKernel.getCanuseColumns();
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket || socket == nodeData.recordSocket) {
            return null;
        }

        var columns_arr = this.getFormDS();
        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={columns_arr == null ? [] : columns_arr} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
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
        var columns_arr = this.getFormDS();
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if (columns_arr.indexOf(colName) != -1) {
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

    clickAutoCallFetchEnd(ev) {
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj: {},
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
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket || socket == nodeData.outRecordSocket) {
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

    clickAutoCallFetchEnd(ev) {
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj: {},
        });
    }

    clickWaitMode(ev) {
        var nodeData = this.props.nodedata;
        nodeData.waitMode = !(nodeData.waitMode != false);
        this.setState({
            magicObj: {},
        });
    }

    render() {
        var nowVal = this.props.nodedata.flowStepCode;
        var nodeData = this.props.nodedata;
        var autoCallFetchEnd = nodeData.autoCallFetchEnd != false;
        var waitMode = nodeData.waitMode != false;
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
            <div className='bg-light'>
                <span className='fa-stack fa-lg' onClick={this.clickWaitMode}>
                    <i className={"fa fa-square-o fa-stack-2x"} />
                    <i className={'fa fa-stack-1x ' + (waitMode ? ' fa-check text-success' : ' fa-close text-danger')} />
                </span>
                等待执行
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} customSocketRender={this.customSocketRender} />
                </div>
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

    targetPageDDCChanged(pagename, ddc, page) {
        this.props.nodedata.setPage(page);
    }

    render() {
        var nowVal = this.props.nodedata.pageCode;
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'跳转页面'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.dropdownRef} itemChanged={this.targetPageDDCChanged} btnclass='btn-dark' options_arr={theProject.getJumpablePages} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='title' valueAttrName='id' value={nowVal ? nowVal : -1} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
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

    clickAutoCallFetchEnd(ev) {
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj: {},
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

    clickHoldScrollChecker(ev) {
        var nodeData = this.props.nodedata;
        var holdScroll = nodeData.holdScroll == null ? false : nodeData.holdScroll;
        nodeData.holdScroll = !holdScroll;
        this.setState({
            magicObj: {}
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var holdSelected = nodeData.holdSelected == null ? false : nodeData.holdSelected;
        var holdScroll = nodeData.holdScroll == null ? false : nodeData.holdScroll;
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
                <div className='bg-light'>
                    <span className='fa-stack fa-lg' onClick={this.clickHoldScrollChecker}>
                        <i className={"fa fa-square-o fa-stack-2x"} />
                        <i className={'fa fa-stack-1x ' + (holdScroll ? ' fa-check text-success' : ' fa-close text-danger')} />
                    </span>
                    保持滚动条
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Array_For extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    clickChecker(ev) {
        var nodeData = this.props.nodedata;
        var manualMode = nodeData.manualMode == null ? false : nodeData.manualMode;
        nodeData.manualMode = !manualMode;
        this.setState({
            magicObj: {}
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var manualMode = nodeData.manualMode == null ? false : nodeData.manualMode;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={'ArrayFor'} >
            <div className='flex-grow-1 flex-shrink-1'>
                <div className='bg-light'>
                    <span className='fa-stack fa-lg' onClick={this.clickChecker}>
                        <i className={"fa fa-square-o fa-stack-2x"} />
                        <i className={'fa fa-stack-1x ' + (manualMode ? ' fa-check text-success' : ' fa-close text-danger')} />
                    </span>
                    手动模式
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                </div>
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

    clickAutoCallFetchEnd(ev) {
        var nodeData = this.props.nodedata;
        nodeData.autoCallFetchEnd = !(nodeData.autoCallFetchEnd != false);
        this.setState({
            magicObj: {},
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
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_HashFormDataRow extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var targetKernel = theProject.getControlById(nodeData.formID);

        this.state = {
            targetKernel: targetKernel,
        }
    }

    targetAttrChangedHandler(ev) {
        if (ev.name == AttrNames.DataSource
            || ev.name == AttrNames.name) {
            this.this.canUseColumns_arr = null;
            this.reDraw();
        }
    }

    listenTarget(targetKernel){
        if (targetKernel) {
            targetKernel.on(EATTRCHANGED, this.targetAttrChangedHandler);
        }
    }

    unlistenTarget(targetKernel){
        if (targetKernel) {
            targetKernel.off(EATTRCHANGED, this.targetAttrChangedHandler);
        }
    }

    cus_componentWillMount() {
        this.listenTarget(this.state.targetKernel);
    }

    cus_componentWillUnmount() {
        this.unlistenTarget(this.state.targetKernel);
    }

    socketColumnSelectChanged(newVal, ddc) {
        var socket = ddc.props.socket;
        socket.setExtra('colName', newVal);
    }

    getCanUseColumns() {
        return this.canUseColumns_arr == null ? [] : this.canUseColumns_arr;
    }

    freshCanUseColumns(targetKernel) {
        if(targetKernel == null){
            this.canUseColumns_arr = null;
            return;
        }
        this.canUseColumns_arr = targetKernel.getCanuseColumns();
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket) {
            return null;
        }

        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={this.canUseColumns_arr == null ? [] : this.canUseColumns_arr} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
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
        var canUseColumns_arr = this.getCanUseColumns();
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if (canUseColumns_arr.indexOf(colName) != -1) {
            var newNode = new FlowNode_ColumnVar({
                keySocketID: socketid,
                newborn: true,
                left: bornPos.x,
                top: bornPos.y,
            }, nodeData.parent);
        }
    }

    targetChangedHandler(newTargetID) {
        var nodeData = this.props.nodedata;
        nodeData.formID = newTargetID;
        var theProject = nodeData.bluePrint.master.project;
        this.setTargetForm(theProject.getControlById(newTargetID));
    }

    setTargetForm(targetKernel){
        this.canUseColumns_arr = null;
        this.unlistenTarget(this.state.targetKernel);
        this.listenTarget(targetKernel);
        this.setState({
            targetKernel: targetKernel,
        });
        var nodeData = this.props.nodedata;
        setTimeout(() => {
            nodeData.outputScokets_arr.forEach(socket=>{
                socket.fireEvent('changed');
            });
        }, 100);
    }

    render() {
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var targetKernel = theProject.getControlById(nodeData.formID);
        if(targetKernel != this.state.targetKernel){
            var self = this;
            setTimeout(() => {
                self.setTargetForm(targetKernel);
            }, 50);
        }
        if(this.canUseColumns_arr == null){
            var targetKernel = this.state.targetKernel;
            this.freshCanUseColumns(targetKernel);
        }

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label} >
            <div className='d-flex flex-column'>
                <DropDownControl options_arr={theProject.getControlsByType} funparamobj={[M_FormKernel_Type,ChartKernel_Type]} value={targetKernel ? targetKernel.id : -1} itemChanged={this.targetChangedHandler} textAttrName='readableName' valueAttrName='id' />
                <div className='d-flex'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor}  nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} customSocketRender={this.customSocketRender} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_CallCusScript extends React.PureComponent {
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
        var script_id = nodeData.script_id;
        this.dropdownRef.current.setValue(script_id);
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

    dropdownCtlChangedHandler(code) {
        var nodeData = this.props.nodedata;
        nodeData.script_id = code;
        nodeData.synSockets();
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket) {
            return null;
        }

        var nowVal = socket.label;
        return (<span className='d-flex align-items-center'>
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
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        var newNode = new FlowNode_ColumnVar({
            keySocketID: socketid,
            newborn: true,
            left: bornPos.x,
            top: bornPos.y,
        }, nodeData.parent);
    }

    render() {
        var nodeData = this.props.nodedata;
        var script_id = nodeData.script_id;
        var scriptMaster = nodeData.bluePrint.master;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='调用脚本'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={scriptMaster.getAllCustomScript} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={script_id ? script_id : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_CusObject_New extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    dropdownCtlChangedHandler(code,ddc,cusobj) {
        var nodeData = this.props.nodedata;
        nodeData.setCusObj(cusobj);
    }

    cusHeaderFuc() {
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <div f-canmove={1} className='d-flex flex-column'>
                <span f-canmove={1}>创建数据对象</span>
                <DropDownControl itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={theProject.scriptMaster.getAllCustomObject} rootclass='flex-grow-1 flex-shrink-1' value={nodeData.cusObj} textAttrName='name' valueAttrName='code' />
            </div>
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_CusObject_Visit extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    dropdownCtlChangedHandler(code,ddc,cusobj) {
        var nodeData = this.props.nodedata;
        nodeData.setCusObj(cusobj);
    }

    cusHeaderFuc() {
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <div f-canmove={1} className='d-flex flex-column'>
                <span f-canmove={1}>访问数据对象</span>
                <DropDownControl itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={theProject.scriptMaster.getAllCustomObject} rootclass='flex-grow-1 flex-shrink-1' value={nodeData.cusObj} textAttrName='name' valueAttrName='code' />
            </div>
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        
        var nodeData = this.props.nodedata;
        return <button onMouseDown={this.mouseDownOutSocketHand} type='button' className='btn btn-secondary ml-1'><i className='fa fa-hand-paper-o' /></button>;
    }

    mouseDownOutSocketHand(ev) {
        var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
        if (socketid == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        var newNode = new FlowNode_ColumnVar({
            keySocketID: socketid,
            newborn: true,
            left: bornPos.x,
            top: bornPos.y,
        }, nodeData.parent);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_CusObject_Modify extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    dropdownCtlChangedHandler(code,ddc,cusobj) {
        var nodeData = this.props.nodedata;
        nodeData.setCusObj(cusobj);
    }

    cusHeaderFuc() {
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        return <div f-canmove={1} className='d-flex flex-column'>
                <span f-canmove={1}>修改数据对象</span>
                <DropDownControl itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={theProject.scriptMaster.getAllCustomObject} rootclass='flex-grow-1 flex-shrink-1' value={nodeData.cusObj} textAttrName='name' valueAttrName='code' />
            </div>
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} customSocketRender={this.customSocketRender} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}


class C_JSNode_TraversalForm extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    ctlSocketSelectChanged(newVal, ddc, data) {
        var socket = ddc.props.socket;
        socket.setExtra('ctlid', newVal);
        socket.kernelType = data.ctl.type;
    }

    getCanUseControls() {
        var nodeData = this.props.nodedata;
        var formid = nodeData.formSocket.getExtra('ctlid');
        var formKernel = nodeData.bluePrint.master.project.getControlById(formid);
        if (formKernel == null || formKernel.isPageForm()) {
            return [];
        }
        var allRowCtls_arr = formKernel.getAllRowControls();
        return allRowCtls_arr.map(ctl=>{
            return {
                name:ctl.getReadableName(),
                id:ctl.id,
                ctl:ctl,
            };
        });
    }

    getFormDS() {
        var nodeData = this.props.nodedata;
        var formKernel = nodeData.bluePrint.master.project.getControlById(nodeData.formID);
        return formKernel == null ? null : formKernel.getAttribute(AttrNames.DataSource);
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        if (socket == nodeData.recordSocket 
            || socket == nodeData.selectedSocket 
            || socket == nodeData.keySocket 
            || socket == nodeData.rowindexSocket 
            || socket == nodeData.rowcountSocket 
            || socket == nodeData.validrowSocket) {
            return null;
        }

        var nowVal = socket.getExtra('ctlid');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.ctlSocketSelectChanged} btnclass='btn-dark' options_arr={this.getCanUseControls} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' valueAttrName='id' />
            <button onMouseDown={this.mouseDownOutSocketHand} d-colname={nowVal} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
    }

    mouseDownOutSocketHand(ev) {
        var socketid = getAttributeByNode(ev.target, 'd-socketid', true, 10);
        if (socketid == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var ctlid = theSocket.getExtra('ctlid');
        var ctlKernel = theProject.getControlById(ctlid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if (ctlKernel != null) {
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
        var theProject = nodeData.bluePrint.master.project;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label} >
            <div className='d-flex'>
            <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} customSocketRender={this.customSocketRender} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_Page_CallFun extends React.PureComponent {
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
        var script_id = nodeData.script_id;
        this.dropdownRef.current.setValue(script_id);
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

    dropdownCtlChangedHandler(code) {
        var nodeData = this.props.nodedata;
        nodeData.script_name = code;
        nodeData.synSockets();
    }

    render() {
        var nodeData = this.props.nodedata;
        var ctlKernel = nodeData.bluePrint.master.project.getControlById(nodeData.bluePrint.ctlID);
        var elem = null;
        if(ctlKernel == null){
            elem = <span className='text-danger'>没有关联控件</span>;
        }
        else{
            var belongPage = ctlKernel.type == M_PageKernel_Type ? ctlKernel : ctlKernel.searchParentKernel(M_PageKernel_Type, true);
            if(belongPage == null){
                elem = <span className='text-danger'>控件必须在页面中才能使用</span>;
            }
            else{
                var script_name = nodeData.script_name;
                elem = <React.Fragment>
                    <div className='d-flex'>
                        <div className='flex-grow-1 flex-shrink-1'>
                            <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={belongPage.getFunctionApiAttrArray} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='label' valueAttrName='fullname' value={script_name ? script_name : '-1'} />
                        </div>
                    </div>
                    <div className='d-flex'>
                        <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                        <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} customSocketRender={this.customSocketRender} />
                    </div>
                </React.Fragment>
            }
        }
        
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='Call页面方法'>
            {elem}
        </C_Node_Frame>
    }
}

class C_JSNode_OpenReport extends React.PureComponent {
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
        var report = nodeData.report;
        if (report) {
            this.dropdownRef.current.setValue(report.code);
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

    dropdownCtlChangedHandler(code, ddc, selectedReport) {
        var nodeData = this.props.nodedata;
        nodeData.setReport(selectedReport);
    }

    render() {
        var nodeData = this.props.nodedata;
        var report = nodeData.report;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='打开报表'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={AllReports_arr} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={report ? report.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_ExportExcel extends React.PureComponent {
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
        var cusObj = nodeData.cusObj;
        if (cusObj) {
            this.dropdownRef.current.setValue(cusObj.code);
        }
        this.setState({ magicObj: {} });
    }

    dropdownCtlChangedHandler(code, ddc, cusObj) {
        var nodeData = this.props.nodedata;
        nodeData.cusObj = cusObj;
    }

    render() {
        var nodeData = this.props.nodedata;
        var cusObj = nodeData.cusObj;
        var theProject = nodeData.bluePrint.master.project;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='导出Excel'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={theProject.scriptMaster.getAllCustomObject} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={cusObj ? cusObj.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} nameMoveable={true} />
                <div className='d-flex flex-column'>
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                    <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} nameMoveable={true} />
                </div>
            </div>
        </C_Node_Frame>
    }
}

/*
class C_JSNode_Control_Api_CallFun extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.dropdownRef = React.createRef();

        C_NodeCom_Base(this);
    }

    dropdownCtlChangedHandler(funName){
        var nodeData = this.props.nodedata;
        nodeData.paramName = funName;
        this.setState({
            magicObj: {}
        });
    }

    render() {
        var nodeData = this.props.nodedata;
        var theProject = nodeData.bluePrint.master.project;
        var headText = 'Call:' + apiClass.ctllabel + '.' + funItem.name;
        var ddcElem = null;
        if(nodeData.isUserControlEvent){
            var selectedCtlid = nodeData.ctlSocket.getExtra('ctlid');
            var selectedKernel = theProject.getControlById(selectedCtlid);
            var funParamname = null;
            if(selectedKernel.hasAttribute(nodeData.paramName)){
                funParamname = selectedKernel.getAttribute(nodeData.paramName).name;
                ddcElem = <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.getAllProduce} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={nodeData.paramName} />;
            }
            if(funParamname == null){
                funParamname = 'unknown';
            }
            headText = 'Call:' + selectedKernel.getReadableName() + '.' + funParamname;
        }
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={headText} >
            {ddcElem}
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_Node_Frame>
    }
}
*/
