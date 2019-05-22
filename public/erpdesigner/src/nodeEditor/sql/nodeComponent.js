class C_SqlNode_Select extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_NodeCom_Base(this);

        this.state = {
        }
    }

    nodeDataChangedHandler() {
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

    renderColumns() {
        var nodeData = this.props.nodedata;
        var columns_arr = nodeData.columns_arr;
        if (columns_arr.length == 0) {
            return null;
        }
        var topValue = nodeData.columnNode.topValue;
        var distChecked = nodeData.columnNode.distChecked;
        if (topValue == null) {
            topValue = '';
        }
        else {
            topValue = ' top ' + topValue;
        }

        if (distChecked == null){
            distChecked = false;
        }else{
            distChecked = true;
        }

        return <div className='d-flex flex-column'>
            <div className="dropdown-divider"></div>
            <div>Select{topValue}{distChecked ? ' distinct' : ''}</div>
            {
                columns_arr.map(column => {
                    return <div key={column.name} className='text-nowrap'>{column.name}</div>
                })}
        </div>
    }

    renderOrderColumns() {
        var nodeData = this.props.nodedata;
        var columns_arr = nodeData.orderColumns_arr;
        if (columns_arr.length == 0) {
            return null;
        }
        return <div className='d-flex flex-column'>
            <div className="dropdown-divider"></div>
            <div>Order by</div>
            {
                columns_arr.map(column => {
                    return <div key={column.name} className='text-nowrap'>{column.name + '  ' + column.orderType}</div>
                })}
        </div>
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
            {this.renderColumns()}
            {this.renderOrderColumns()}
        </C_Node_Frame>
    }
}

class C_SqlNode_Select_Output extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            nodedata: this.props.nodedata,
        }
    }


    nodeDataChangedHandler() {
    }

    componentWillMount() {
    }

    componentWillUnmount() {
        this.unlistenData(this.state.nodedata);
        clearTimeout(this.delaySetTO);
    }

    listenData(nodeData) {
    }

    unlistenData(nodeData) {
    }

    clickHandler() {
        //console.log('clickHandler');
        this.props.editor.setEditeNode(this.props.nodedata);
    }

    render() {
        if (this.state.nodedata != this.props.nodedata) {
            this.unlistenData(this.state.nodedata);
            this.listenData(this.props.nodedata);
            clearTimeout(this.delaySetTO);
            var self = this;
            this.delaySetTO = setTimeout(() => {
                this.setState(
                    {
                        nodedata: this.props.nodedata,
                    }
                );
                self.delaySetTO = null;
            }, 10);
        }
        var nodeData = this.state.nodedata;
        return <C_Node_Frame nodedata={nodeData} clickHandler={this.clickHandler} editor={this.props.editor}>
            <div className='d-flex flex-column'>
                列名
                </div>
        </C_Node_Frame>
    }
}

class C_SqlNode_Var_Get extends React.PureComponent {
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

class C_SqlNode_NOperand extends React.PureComponent {
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

class C_SqlNode_Compare extends React.PureComponent {
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
                width: '50px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '100px'
            };
        }
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['>', '>=', '<', '<=', '==', '!=']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
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

class C_SqlNode_XJoin extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            joinType: this.props.nodedata.joinType,
        }
    }

    selectItemChangedHandler(newJoinType) {
        var nodeData = this.props.nodedata;
        nodeData.joinType = newJoinType;
        this.setState({
            joinType: newJoinType
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
            <DropDownControl options_arr={JoinTypes_arr} value={nodeData.joinType} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
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

class C_Node_SimpleNode extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
        }
    }

    listenNode(theNode){
        if(theNode){
            theNode.on('changed', this.reDraw);
        }
        this.listenedNode = theNode;
    }

    unlistenNode(theNode){
        if(theNode){
            theNode.off('changed', this.reDraw);
        }
    }

    cus_componentWillUnmount(){
        this.unlistenNode(this.props.nodedata);
    }

    render() {
        var nodeData = this.props.nodedata;
        if(this.listenedNode != nodeData){
            this.unlistenNode(this.listenedNode);
            this.listenNode(nodeData);
        }
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        var rightElem = null;
        if(nodeData.outFlowSockets_arr == null){
            rightElem = (<C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />);
        }
        else{
            rightElem = (<div className='d-flex flex-column'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>);
        }
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                {rightElem}
            </div>
        </C_Node_Frame>
    }
}

class C_SqlNode_DBEntity_ColumnSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_NodeCom_Base(this);

        this.state = {
            hadCheckbox: this.props.nodedata.parent.isSelectColumn != null,
        }

        this.checkmap = {};
    }

    nodeDataChangedHandler() {
        this.reDraw();
    }

    selectChangedHandler(data) {
        var nodeData = this.props.nodedata;
        var needReDraw = false;
        if (data.tableAlias) {
            needReDraw = data.tableAlias == nodeData.alias;
        }
        else {
            needReDraw = data.tableCode == data.tableCode;
        }
        if (needReDraw) {
            this.reDraw();
        }
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
            nodeData.parent.on('selectchanged', this.selectChangedHandler);
        }
    }

    unlistenData(nodeData) {
        if (nodeData) {
            nodeData.off('changed', this.nodeDataChangedHandler);
            nodeData.parent.off('selectchanged', this.selectChangedHandler);
        }
    }

    mouseDownColumnNameHandler(ev) {
        if (ev.button == 0) {
            var nodeData = this.props.nodedata;
            var parentNodeData = nodeData.parent;
            var entity = nodeData.entity;
            var initPos = this.props.editor.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });

            var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
            var column = entity.columns.find(x => { return x.name == columnName });
            if (column) {
                var newNode = parentNodeData.addNewColumn(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, initPos.x, initPos.y, true);
            }
            this.props.editor.reDraw();
        }
    }

    checkboxChangeHandler(ev) {
        var nodeData = this.props.nodedata;
        var parentNodeData = nodeData.parent;
        var entity = nodeData.entity;
        var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
        var column = entity.columns.find(x => { return x.name == columnName });
        if (column) 
        {
            if(parentNodeData.bluePrint.type == "标量值" && parentNodeData == parentNodeData.bluePrint.finalSelectNode)
            {
                nodeData.clickFrameButton('unselect-all');
                if(!this.checkmap[columnName])
                setTimeout(()=>{
                    parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, true);
                },10);
            }
            else
            {
                parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType,  !this.checkmap[columnName]);
            }

        }
    }

    renderColumn(entity, column, parentNodeData, nodeData) {
        var nodeData = this.props.nodedata;
        var compareKey = (nodeData.alias == null ? entity.code : nodeData.alias) + '.' + column.name;
        var hadCheckbox = this.state.hadCheckbox;
        var isCheck = hadCheckbox ? parentNodeData.isSelectColumn(compareKey) : false;
        this.checkmap[column.name] = isCheck;
        return (<div key={column.name} className='d-flex flex-grow-1 align-items-center ' data-colname={column.name}>
            {hadCheckbox && <input type='checkbox' onChange={this.checkboxChangeHandler} checked={isCheck} />}
            <div className='d-flex flex-grow-1 text-nowrap' onMouseDown={hadCheckbox ? this.checkboxChangeHandler : null} >{column.name}</div>
            <i className='fa fa-hand-paper-o cursor-pointer' onMouseDown={this.mouseDownColumnNameHandler} />
        </div>);
    }

    render() {
        var nodeData = this.props.nodedata;
        var parentNodeData = nodeData.parent;
        var entity = nodeData.entity;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label}>
            <div className='d-flex flex-column'>
                {entity.columns.map(column => {
                    return this.renderColumn(entity, column, parentNodeData, nodeData);
                })}
            </div>
        </C_Node_Frame>
    }
}

class C_SqlNode_Var_Set extends React.PureComponent {
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

/**
 * 逻辑运算符 and or not
 */
class C_SqlNode_Logical_Operator extends React.PureComponent {
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

class C_SqlNode_Ret_Columns extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            topValue: this.props.nodedata.topValue,
            distChecked :this.props.nodedata.distChecked,

        }
    }

    topInputChangeHandler(ev) {
        var topValue = ev.target.value;
        this.setState(
            { topValue: topValue }
        );
        this.props.nodedata.topValue = topValue;
    }

    distinctChangeHandler(ev){
        var distChecked = ev.target.checked;
        this.setState({
            distChecked: distChecked
        });
        this.props.nodedata.distChecked = distChecked;
    }

    render() {
        var nodeData = this.props.nodedata;
        var topVal = this.state.topValue;
        var distvalue = this.state.distChecked;
        var disabled = null;
        if (topVal == null) {
            topVal = '';
        }
        if(nodeData.bluePrint.type =="标量值")
        {
            if(nodeData == nodeData.bluePrint.finalSelectNode){
                topVal = 1 ;
                disabled = "disabled";
            }
        }
        if(distvalue == null){
            distvalue = false;
        }
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
            <div className='d-flex'>
                <div>Top:
                    <input type='text' className='flex-grow-1 flex-shrink-1' value={topVal} onChange={this.topInputChangeHandler} style={{width:'60px',height:'30px'}} disabled={disabled} />
                </div>

                <div>Distinct:
                    <input type='checkbox' id='distinct' className='flex-grow-1 flex-shrink-1 distinct' checked={distvalue} onChange={this.distinctChangeHandler} style={{display: 'none'}}></input>
                    <label htmlFor="distinct" className='distinct'></label>
                </div>
            </div>               
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.bluePrint.type == '表值' ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>
        </C_Node_Frame>
    }
}
class C_SqlNode_Isnull_Operator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
            operator: this.props.nodedata.operator,
        }
    }

    IsNullChangedHandler(newoperator) {
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
            <DropDownControl options_arr={[SqlOperator_IsNull, SqlOperator_IsNotNull]} value={nodeData.operator} itemChanged={this.IsNullChangedHandler} style={this.ddcStyle} />
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

class C_SqlNode_Like extends React.PureComponent {
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
                width: '78px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
            <DropDownControl options_arr={['like', 'not like']} value={nodeData.operator} itemChanged={this.LikeChangedHandler} style={this.ddcStyle} />
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

class C_SqlNode_DBEntity extends React.PureComponent {
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

    getNodeTitle() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (nodeData.title && nodeData.title.length > 0) {
            return nodeData.title;
        }
        var nodeTitle = entity == null ? '' : (entity.loaded ? '' : '正在加载:' + entity.code);
        return nodeTitle;
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor}>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={nodeData.bluePrint.master.getAllEntities} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_Node_Frame>
    }
}


class C_SqlNode_ConstValue extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_NodeCom_Base(this);
        this.state = {
        }
    }

    listenNode(theNode){
        if(theNode){
            theNode.on('changed', this.reDraw);
        }
        this.listenedNode = theNode;
    }

    unlistenNode(theNode){
        if(theNode){
            theNode.off('changed', this.reDraw);
        }
    }

    cus_componentWillUnmount(){
        this.unlistenNode(this.props.nodedata);
    }

    render() {
        var nodeData = this.props.nodedata;
        if(this.listenedNode != nodeData){
            this.unlistenNode(this.listenedNode);
            this.listenNode(nodeData);
        }
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        var rightElem = null;
        if(nodeData.outFlowSockets_arr == null){
            rightElem = (<C_SqlNode_ScoketsPanel contentEditable nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />);
        }
        else{
            rightElem = (<div className='d-flex flex-column'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outFlowSockets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutFlowScoketDynamic() ? nodeData.processOutputFlowSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>);
        }
        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
            <div className='d-flex '   >
                <C_SqlNode_ScoketsPanel contentEditable nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                {rightElem}
            </div>
        </C_Node_Frame>
    }
}

class C_SqlNode_DeleteRecord extends React.PureComponent {
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

    getNodeTitle() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        if (nodeData.title && nodeData.title.length > 0) {
            return nodeData.title;
        }
        var nodeTitle = entity == null ? '' : (entity.loaded ? '' : '正在加载:' + entity.code);
        return nodeTitle;
    }

    mouseDownColumnNameHandler(ev) {
        if (ev.button == 0) {
            var nodeData = this.props.nodedata;
            var entity = nodeData.targetEntity;
            var initPos = this.props.editor.transToEditorPos({ x: WindowMouse.x, y: WindowMouse.y });

            var columnName = getAttributeByNode(ev.target, 'data-colname', true, 5);
            var column = entity.columns.find(x => { return x.name == columnName });
            if (column) {
                var newNode = nodeData.addNewColumn(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, initPos.x, initPos.y, true);
            }
            this.props.editor.reDraw();
        }
    }

    renderColumn(column) {
        return (<div key={column.name} className='d-flex flex-grow-1 align-items-center ' data-colname={column.name}>
            <div className='d-flex flex-grow-1 text-nowrap' >{column.name}</div>
            <i className='fa fa-hand-paper-o cursor-pointer' onMouseDown={this.mouseDownColumnNameHandler} />
        </div>);
    }

    render() {
        var nodeData = this.props.nodedata;
        var entity = nodeData.targetEntity;
        var dataloaded = entity ? entity.loaded : false;

        return <C_Node_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor}>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.getAllTable} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
            <div className="dropdown-divider"></div>
            {entity && entity.columns.map(this.renderColumn)}
        </C_Node_Frame>
    }
}