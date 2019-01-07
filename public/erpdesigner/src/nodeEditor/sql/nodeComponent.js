
function C_SqlNode_componentWillMount() {
    this.props.nodedata.currentComponent = this;
    if (this.cus_componentWillMount != null) {
        this.cus_componentWillMount();
    }
}

function C_SqlNode_componentWillUnMount() {
    this.props.nodedata.currentComponent = null;
    if (this.cus_componentWillUnmount != null) {
        this.cus_componentWillUnmount();
    }
}

function C_ReDraw() {
    this.setState({
        magicobj: {},
    });
}

function C_SqlNode_Base(target) {
    target.frameRef = React.createRef();
    target.componentWillMount = C_SqlNode_componentWillMount.bind(target);
    target.componentWillUnmount = C_SqlNode_componentWillUnMount.bind(target);
    target.reDraw = C_ReDraw.bind(target);
}

class C_SqlNode_Frame extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            editingTitle: false,
            title: ReplaceIfNull(props.nodedata.title, ''),
            moving: this.props.nodedata.newborn == true,
        }

        this.rootDivRef = React.createRef();

        if (this.props.nodedata.newborn) {
            var self = this;
            setTimeout(() => {
                if (self.state.moving) {
                    self.startMove(null);
                    this.props.editor.setSelectedNF(this);
                }
            }, 10);
        }
    }

    reDraw() {
        this.setState(
            {
                magicobj: {},
            }
        );
    }

    addOffset(offset) {
        var nodeData = this.props.nodedata;
        nodeData.setPos(nodeData.left + offset.x, nodeData.top + offset.y);
        this.reDraw();
    }

    startMove(moveBase) {
        this.moveBase = moveBase;
        window.addEventListener('mousemove', this.mousemoveWidthMoveHandler);
        window.addEventListener('mouseup', this.mouseupWidthMoveHandler);
        this.setState(
            {
                moving: true,
            }
        );

        if (this.movingInt == null) {
            this.movingInt = setInterval(this.movingIntHandler, 100);
        }
        this.targetScroll = null;
        this.props.editor.nodeFrameStartMove(this);
    }

    endMove() {
        window.removeEventListener('mousemove', this.mousemoveWidthMoveHandler);
        window.removeEventListener('mouseup', this.mouseupWidthMoveHandler);
        this.props.nodedata.newborn = false;

        if (this.state.moving) {
            this.setState(
                {
                    moving: false,
                }
            );
        }
        if (this.movingInt) {
            clearInterval(this.movingInt);
            this.movingInt = null;
        }
    }

    clickEditTitleHandler() {
        if (this.state.editingTitle) {
            this.props.nodedata.setTitle(this.state.title);
        }
        this.setState(
            {
                editingTitle: !this.state.editingTitle,
            }
        );
        this.props.nodedata.fireMoved(10);
    }

    nodeTitleInputChangeHandler(ev) {
        var inputStr = ev.target.value;
        this.setState({
            title: inputStr.trim(),
        });
    }

    nodeTitleInputKeypressHandler(ev) {
        if (ev.nativeEvent.keyCode == 13) {
            this.setState(
                {
                    editingTitle: false,
                }
            );
        }
    }

    componentWillUnmount() {
        this.endMove();
        this.unmounted = true;
        this.props.nodedata.currentFrameCom = null;
        this.props.nodedata.fireEvent(Event_FrameComUnMount, 10);
    }

    componentWillMount() {
        this.props.nodedata.currentFrameCom = this;
        this.props.nodedata.fireEvent(Event_FrameComMount, 10);
    }

    mousemoveWidthMoveHandler(ev) {
        var moveBase = this.moveBase;
        if (moveBase == null) {
            moveBase = {
                x: 0,
                y: 0
            };
        }
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var rootDiv = this.rootDivRef.current;
        var editorRootDivRect = editorRootDiv.getBoundingClientRect();
        var editorScale = editorRootDivRect.scale;
        if (editorScale == null || isNaN(editorScale)) {
            editorScale = 1;
        }
        var mouseX = ev.x;
        var mouseY = ev.y;
        var localPos = {
            x: mouseX - editorRootDivRect.left,
            y: mouseY - editorRootDivRect.top,
        }
        var editorDiv = this.props.editor.editorDivRef.current;
        var offset = {
            x: localPos.x - parseUnitInt(editorDiv.style.left),
            y: localPos.y - parseUnitInt(editorDiv.style.top),
        };
        var newX = offset.x + moveBase.x;
        var newY = offset.y + moveBase.y;
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        rootDiv.style.left = newX + 'px';
        rootDiv.style.top = newY + 'px';
        var nodeData = this.props.nodedata;
        nodeData.setPos(newX, newY);

        this.props.editor.nodeFrameMoving(this, offset);
    }

    movingIntHandler() {
        var editorRootDiv = this.props.editor.zoomDivRef.current;
        var editorDiv = this.props.editor.editorDivRef.current;
        var theRect = editorRootDiv.getBoundingClientRect();
        var offset = {
            left: WindowMouse.x - theRect.left,
            top: WindowMouse.y - theRect.top,
            bottom: theRect.bottom - WindowMouse.y,
            right: theRect.right - WindowMouse.x,
        }
        var gap = 100;
        var autoMove = { x: 0, y: 0 };
        if (offset.left > 0 && offset.left < gap) {
            autoMove.x = 1;
        }
        else if (offset.right > 0 && offset.right < gap) {
            autoMove.x = -1;
        }
        if (offset.top > 0 && offset.top < gap) {
            autoMove.y = 1;
        }
        else if (offset.bottom > 0 && offset.bottom < gap) {
            autoMove.y = -1;
        }
        if (autoMove.x != 0 || autoMove.y != 0) {
            editorDiv.style.left = (parseUnitInt(editorDiv.style.left) + autoMove.x * 30) + 'px';
            editorDiv.style.top = (parseUnitInt(editorDiv.style.top) + autoMove.y * 30) + 'px';
        }
    }

    mouseupWidthMoveHandler(ev) {
        this.endMove();
    }

    moveBarMouseDownHandler(ev, forcedo) {
        if (!forcedo && ev.target != this.rootDivRef.current && ev.target.getAttribute('f-canmove') == null) {
            return;
        }
        var nodeData = this.props.nodedata;
        if (nodeData.isContainer) {
            if (this.lastClickTime == null || (Date.now() - this.lastClickTime) > 300) {
                this.lastClickTime = Date.now();
            }
            else {
                this.props.editor.setEditeNode(nodeData);
                return;
            }
        }
        this.props.editor.setSelectedNF(this, ev != null && ev.ctrlKey);
        var rootDivRect = this.rootDivRef.current.getBoundingClientRect();
        this.moveBase = { x: rootDivRect.left - WindowMouse.x, y: rootDivRect.top - WindowMouse.y };
        this.startMove(this.moveBase);
    }

    setSelected(val) {
        this.setState({ selected: val });
    }

    getNodeTitle(readable) {
        var nodeData = this.props.nodedata;
        if (readable) {
            return nodeData.getNodeTitle();
        }
        return this.props.getTitleFun == null ? (nodeData.title == null ? '' : nodeData.title) : this.props.getTitleFun();
    }

    renderHead(nodeData) {
        if (this.props.isPure) {
            return null;
        }

        var headType = this.props.headType;
        if (headType == null)
            headType = 'default';
        if (headType == 'tiny') {
            var headElem = this.props.headText;
            if (this.props.cusHeaderFuc != null) {
                headElem = this.props.cusHeaderFuc();
            }
            return <div className='d-flex nodeHead align-items-center' type='tiny' >
                {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
                <div className='flex-grow-1 flex-shrink-0 text-nowrap text-center' f-canmove={1} >
                    {headElem}
                </div>
                {nodeData.hadFlow && <i className='fa fa-arrow-circle-right nodeFlow' />}
            </div>
        }
        else if (headType == 'empty') {
            return null;
        }

        if (headType == 'default') {
            var nodeTitle = this.getNodeTitle();
            return <React.Fragment>
                <div className='bg-light d-flex align-items-center text-dark' style={{ fontSize: '1em' }}>
                    <div className='flex-grow-1 flex-shrink-1 text-nowrap' f-canmove={1}>
                        {nodeData.label}:
                                {
                            this.state.editingTitle ? <input className='' type='text' value={this.state.title} onChange={this.nodeTitleInputChangeHandler} onKeyPress={this.nodeTitleInputKeypressHandler} />
                                :
                                <React.Fragment>
                                    <span className='' f-canmove={1}>{nodeTitle}</span>
                                </React.Fragment>
                        }
                        <i className='fa fa-edit ml-1 cursor-pointer' onClick={this.clickEditTitleHandler} />
                    </div>
                </div>
                <div className="dropdown-divider"></div>
            </React.Fragment>
        }
        return null;
    }

    renderButtons() {
        var nodeData = this.props.nodedata;
        if (nodeData.frameButtons_arr.length == 0) {
            return null;
        }
        return (<div className='btn-group flex-grow-1 flex-shrink-1'>
            {nodeData.frameButtons_arr.map(btnData => {
                return <button key={btnData.name} type='button' onClick={this.clickFrameButtonHandler} className='btn btn-dark' d-btnname={btnData.name} >{btnData.label}</button>
            })}
        </div>)
    }

    clickFrameButtonHandler(ev) {
        var btnName = getAttributeByNode(ev.target, 'd-btnname', true);
        if (btnName != null) {
            this.props.nodedata.clickFrameButton(btnName);
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        var posStyle = { left: parseInt(nodeData.left) + 'px', 'top': parseInt(nodeData.top), 'paddingTop': this.props.isPure ? '0.5em' : null };
        return (<div ref={this.rootDivRef} onMouseDown={this.moveBarMouseDownHandler} className='position-absolute d-flex flex-column nodeRoot' style={posStyle} d-selected={this.state.selected ? '1' : null}>
            {
                this.renderHead(nodeData)
            }
            {
                this.renderButtons()
            }
            {
                this.props.children
            }
        </div>);
    }
}

class C_SqlNode_DBEntity extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

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

        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} getTitleFun={this.getNodeTitle} editor={this.props.editor}>
            <div className='d-flex'>
                <div className='flex-grow-1 flex-shrink-1'>
                    <DropDownControl ref={this.dropdownRef} itemChanged={this.dropdownCtlChangedHandler} btnclass='btn-dark' options_arr={g_dataBase.entities_arr} rootclass='flex-grow-1 flex-shrink-1' style={{ minWidth: '200px', height: '40px' }} textAttrName='name' valueAttrName='code' value={entity ? entity.code : -1} />
                </div>
            </div>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Select extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

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
            <div>Select{topValue}{distChecked}</div>
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
            {this.renderColumns()}
            {this.renderOrderColumns()}
        </C_SqlNode_Frame>
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
        return <C_SqlNode_Frame nodedata={nodeData} clickHandler={this.clickHandler} editor={this.props.editor}>
            <div className='d-flex flex-column'>
                列名
                </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Var_Get extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            //nodedata:this.props.nodedata,
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='GET'>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_NOperand extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Compare extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
            <DropDownControl options_arr={['>', '>=', '<', '<=', '=', '!=']} value={nodeData.operator} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />
        </div>);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_XJoin extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_SimpleNode extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
        }
    }

    render() {
        var nodeData = this.props.nodedata;
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_DBEntity_ColumnSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        C_SqlNode_Base(this);

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
        if (column) {
            parentNodeData.columnCheckChanged(entity.code, nodeData.alias, entity.name, columnName, column.cvalType, !this.checkmap[columnName]);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText={nodeData.label}>
            <div className='d-flex flex-column'>
                {entity.columns.map(column => {
                    return this.renderColumn(entity, column, parentNodeData, nodeData);
                })}
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Var_Set extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);

        this.state = {

        }
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' headText='SET' >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} />
            </div>
        </C_SqlNode_Frame>
    }
}

/**
 * 逻辑运算符 and or not
 */
class C_SqlNode_Logical_Operator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Ret_Columns extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            topValue: this.props.nodedata.topValue,
<<<<<<< HEAD
<<<<<<< HEAD
            distChecked :this.props.nodedata.distChecked,
=======
>>>>>>> parent of 48d0015... 1-7
=======
>>>>>>> parent of 48d0015... 1-7
        }
    }

    topInputChangeHandler(ev) {
        var topValue = ev.target.value;
        this.setState(
            { topValue: topValue }
        );
        this.props.nodedata.topValue = topValue;
    }
<<<<<<< HEAD
<<<<<<< HEAD
    distinctChangeHandler(ev){
        var distChecked = ev.target.checked;
        this.setState({
            distChecked: distChecked
        })
      //  this.props.nodeData.distChecked = distChecked;
    }
=======

>>>>>>> parent of 48d0015... 1-7
=======

>>>>>>> parent of 48d0015... 1-7
    render() {
        var nodeData = this.props.nodedata;
        var topVal = this.state.topValue;
        if (topVal == null) {
            topVal = '';
        }
<<<<<<< HEAD
<<<<<<< HEAD
        if(this.state.distChecked == null){
            this.state.distChecked = false;
        }
=======
>>>>>>> parent of 48d0015... 1-7
=======
>>>>>>> parent of 48d0015... 1-7
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} >
            <div className='d-flex'>
                <div>Top:</div>
<<<<<<< HEAD
<<<<<<< HEAD
                <input type='text' className='flex-grow-1 flex-shrink-1' value={topVal} onChange={this.topInputChangeHandler} />
            </div>
            <div className='d-flex'>
                <div>Distinct:</div>
                <input type='checkbox' id='distinct' checked={this.state.distChecked} onClick={this.distinctChangeHandler}></input>
                <label htmlFor="distinct"></label>
            </div>
=======
                <input type='text' className='flex-grow-1 flex-shrink-1' value={topVal} onChange={this.topInputChangeHandler} />'
                </div>
>>>>>>> parent of 48d0015... 1-7
=======
                <input type='text' className='flex-grow-1 flex-shrink-1' value={topVal} onChange={this.topInputChangeHandler} />'
                </div>
>>>>>>> parent of 48d0015... 1-7
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>
        </C_SqlNode_Frame>
    }
}
class C_SqlNode_Isnull_Operator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

class C_SqlNode_Like extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

//////exists
class C_SqlNode_Exists extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
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
            <DropDownControl options_arr={['exists', 'not exists']} value={nodeData.operator} itemChanged={this.LikeChangedHandler} style={this.ddcStyle} />
        </div>);
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType = nodeData.headType == null ? 'tiny' : nodeData.headType;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}
class C_SqlNode_Aggregate extends React.PureComponent { 
    constructor(props) {
    super(props);
    autoBind(this);

    C_SqlNode_Base(this);
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
    return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
        <div className='d-flex'>
            <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
        </div>

    </C_SqlNode_Frame>
}
}
class C_SqlNode_Union extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            unionType: this.props.nodedata.unionType,
        }
    }

    selectItemChangedHandler(newunionType) {
        var nodeData = this.props.nodedata;
        nodeData.unionType = newunionType;
        this.setState({
            unionType: newunionType
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
        return (<DropDownControl options_arr={['union','union all']} value={nodeData.unionType} itemChanged={this.selectItemChangedHandler} style={this.ddcStyle} />);
    }

    render() {
        var nodeData = this.props.nodedata;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType='tiny' cusHeaderFuc={this.cusHeaderFuc} >
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} />
            </div>
        </C_SqlNode_Frame>
    }
}
