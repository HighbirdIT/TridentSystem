class C_SqlNode_Aggregate extends React.PureComponent { 
    constructor(props) {
    super(props);
    autoBind(this);

    C_NodeCom_Base(this);
    this.state = {
        aggregate: this.props.nodedata.aggregate,
    }
}

LikeChangedHandler(newoperator) {
    var nodeData = this.props.nodedata;
    nodeData.aggregate = newoperator;
    this.setState({
        aggregate: newoperator
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
        <DropDownControl options_arr={Aggregate_arr} value={nodeData.aggregate} itemChanged={this.LikeChangedHandler} style={this.ddcStyle} />
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
class C_SqlNode_XApply extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
    
        C_NodeCom_Base(this);
        this.state = {
            xapplyType: this.props.nodedata.xapplyType,
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

    getNodeTitle() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (nodeData.title && nodeData.title.length > 0) {
            return nodeData.title;
        }
        var nodeTitle = entity == null ? '' : (entity.loaded ? '' : '正在加载:' + entity.code);
        return nodeTitle;
    }
    // getEntityParams() {
    //     var nodeData = this.props.nodedata;
    //     var entity = nodeData.targetEntity;
    //     if (nodeData.title && nodeData.title.length > 0) {
    //         return nodeData.title;
    //     }
    //     var nodeTitle = entity == null ? '' : (entity.loaded ? '' : '正在加载:' + entity.code);
    //     return nodeTitle;
    // }
    LikeChangedHandler(newoperator) {
        var nodeData = this.props.nodedata;
        nodeData.xapplyType = newoperator;
        this.setState({
            xapply: newoperator
        });
    }
    
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '120px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['cross apply','outer apply']} value={nodeData.xapplyType} itemChanged={this.LikeChangedHandler} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} />
            <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.entities_arr} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
        </div>);
    }
    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>  
        </C_Node_Frame>
    }
    }
