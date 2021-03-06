class C_JSNode_Stored_Procedure extends React.PureComponent {
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
        if(socket == nodeData.outDataSocket || socket == nodeData.outErrorSocket){
            return null;
        }
        var entity = nodeData.targetEntity;
        var nowVal = socket.getExtra('colName');
        return (<span className='d-flex align-items-center'><DropDownControl itemChanged={this.socketColumnSelectChanged} btnclass='btn-dark' options_arr={entity == null ? [] : entity.columns} rootclass='flex-grow-1 flex-shrink-1' value={nowVal} socket={socket} textAttrName='name' />
            <button onMouseDown={this.mouseDownOutSocketHand} d-colname={nowVal} type='button' className='btn btn-secondary'><i className='fa fa-hand-paper-o' /></button>
        </span>);
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
    FBentities_arr(){
        var fbentities_arr=[];
        g_dataBase.entities_arr.forEach((item,i)=>{
            if(item.type == 'P'){
                fbentities_arr.push(item);
            }
        })
        return fbentities_arr;
    }
    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        var dataMaster = null;
        if(nodeData.bluePrint.master && nodeData.bluePrint.master.project){
            dataMaster = nodeData.bluePrint.master.project.dataMaster;
        }
        else if(nodeData.bluePrint.dataMaster){
            dataMaster = nodeData.bluePrint.dataMaster;
        }
        var Stored_Procedure_arr=[];
        Stored_Procedure_arr=dataMaster.getAllEntities
        console.info(Stored_Procedure_arr)
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor} headType='tiny' headText='查询存储过程'>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={this.FBentities_arr} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
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

class C_JSNode_Assignment_Operator extends React.PureComponent {
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
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}

class C_JSNode_IsNullOperator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            operator: this.props.nodedata.operator,
        }
    }

    LikeChangedHandler(newoperator) {
        var nodeData = this.props.nodedata;
        nodeData.operator = newoperator;
        this.setState({
            operator: newoperator
        });
    }

    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['is null', 'is not null']} value={nodeData.operator} itemChanged={this.LikeChangedHandler} style={this.ddcStyle} />
        </div>);
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_Node_Frame>
    }
}
////数学函数
class C_JSNode_Mathfun extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
    }

    mathChangedHandler(mathType) {
        var nodeData = this.props.nodedata;
        nodeData.setMathType(mathType);
    }
  //鼠标悬停
  onMouseOver(e) { 
    var buttonPrompt=''
    switch (e) {
        case 'Math_ABS':
            buttonPrompt='计算绝对值'
        break;
        case 'Math_CEILING':
            buttonPrompt='计算大于等于参数的最小整数'
        break;
        case 'Math_FLOOR':
            buttonPrompt= '计算小于等于参数的最大整数'
        break;
        // case 'Math_RAND':
        //     buttonPrompt= '获取随机数'
        // break;
    }   
    this.setState({
        text:buttonPrompt
    })
    console.log({text})
  }
//鼠标移开
  onMouseOut(e) { 
     this.setState({
      text: ''
    })
     console.log('hey hey')

  }
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <DropDownControl options_arr={JSMath_arr} value={nodeData.mathType} onMouseEnter={this.onMouseOver.bind(nodeData.mathType)} itemChanged={this.mathChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }

    render() {
        var nodeData = this.props.nodedata;
        var headType = 'tiny';
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_Node_Frame>
    }
}