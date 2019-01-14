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