class C_FlowNodeDef_Var_Get extends React.PureComponent {
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

class C_FlowNodeDef_Var_Set extends React.PureComponent {
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

class C_FlowNode_Query_Sql extends React.PureComponent {
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
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.getEntitiesByType} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_FlowNode_QueryKeyRecord extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_NodeCom_Base(this);

        this.state = {
        }

        this.dropdownRef = React.createRef();
        this.keyColumnRef = React.createRef();
    }

    nodeDataChangedHandler() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (entity) {
            this.dropdownRef.current.setValue(entity.code);
            var self = this;
            setTimeout(() => {
                self.keyColumnRef.current.setValue(nodeData.keyColumn);
            }, 50);
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

    keyColumnChangedHandler(colName) {
        var nodeData = this.props.nodedata;
        nodeData.keyColumn = colName;
    }

    socketColumnSelectChanged(newVal, ddc) {
        var socket = ddc.props.socket;
        socket.setExtra('colName', newVal);
    }

    mouseDownOutSocketHand(ev){
        var colName = getAttributeByNode(ev.target,'d-colname', true, 5);
        if(colName == null){
            return;
        }
        var socketid = getAttributeByNode(ev.target,'d-socketid', true, 10);
        if(socketid == null){
            return;
        }
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if(entity == null){
            return;
        }
        var theSocket = nodeData.bluePrint.getSocketById(socketid);
        var bornPos = theSocket.currentComponent.getCenterPos();
        if(entity.containColumn(colName)){
            var newNode = new FlowNode_ColumnVar({
                keySocketID:socketid,
                newborn:true,
                left:bornPos.x,
                top:bornPos.y,
            }, nodeData.parent);
        }
    }

    customSocketRender(socket) {
        if (socket.isIn == true) {
            return null;
        }
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;

        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={entity == null ? [] : entity.columns} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
            <button onMouseDown={this.mouseDownOutSocketHand} d-colname={nowVal} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        var dataMaster = nodeData.bluePrint.dataMaster;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='查询关键记录'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={dataMaster.getAllEntities} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='flex-grow-1 flex-shrink-1'>
                <DropDownControl ref={this.keyColumnRef} itemChanged={this.keyColumnChangedHandler} btnclass='btn-dark' options_arr={entity == null ? [] : entity.columns} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' value={nodeData.keyColumn} />
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.processOutputSockets} customSocketRender={this.customSocketRender} />
            </div>
        </C_Node_Frame>
    }
}

class C_FlowNode_Assignment_Operator extends React.PureComponent {
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
                width: '60px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '100px'
            };
        }
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['+=', '-=', '*=', '/=', '%=']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
        </div>);
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