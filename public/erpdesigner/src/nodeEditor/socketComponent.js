class C_Node_Socket extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.flagRef = React.createRef();
        this.inputRef = React.createRef();
        this.state={
            socket:this.props.socket,
            draging:this.props.draging == true,
        }
    }

    clickHandler(ev){
        this.props.editor.clickSocket(this.props.socket);
    }

    getCenterPos(){
        var socket = this.state.socket;
        var nodeData = socket.node;
        if(nodeData.currentFrameCom == null || nodeData.currentFrameCom.rootDivRef.current == null || this.flagRef.current == null){
            return null;
        }
        var baseRect = nodeData.currentFrameCom.rootDivRef.current.getBoundingClientRect();
        var rect = this.flagRef.current.getBoundingClientRect();
        return {x:Math.round(nodeData.left + (rect.left - baseRect.left) + rect.width * 0.5), y:Math.round(nodeData.top + (rect.top - baseRect.top)  + rect.height * 0.5)};
    }

    componentWillMount(){
        this.listenData(this.state.socket);
        this.state.socket.setCurrentComponent(this);
    }

    componentWillUnmount(){
        this.unlistenData(this.state.socket);
        this.state.socket.setCurrentComponent(null);
    }

    nodeDataChangedHandler(ev){
        var socket = this.state.socket;
        if(socket.node.parent == null){
            return; // node removed
        }
        this.setState({
            magicobj:{}
        });
    }

    getContent(){
    }
    
    listenData(socket){
        if(socket){
            socket.on('changed', this.nodeDataChangedHandler);
            socket.on(Event_LinkChanged, this.nodeDataChangedHandler);
        }
        
    }

    unlistenData(socket){
        if(socket){
            socket.off('changed', this.nodeDataChangedHandler);
            socket.off(Event_LinkChanged, this.nodeDataChangedHandler);
        }
    }

    inputChangedHandler(ev){
        var socket = this.props.socket;
        socket.set({defval:ev.target.value});
    }

    checkInputChangedHandler(ev){
        var socket = this.props.socket;
        socket.set({defval:ev.target.checked});
    }

    inputDDCChangedHandler(newvalue, ddc){
        ddc.props.socket.set({defval:newvalue});
    }

    mouseDownDragIconHandler(ev){
        if(this.props.startDragAct != null){
            this.props.startDragAct(this);
        }
    }

    setDraging(val){
        this.setState({
            draging:val == true,
        });
    }

    kernelChangedHandler(newid, ddc){
        ddc.props.socket.setExtra('ctlid', newid);
        this.setState({
            magicObj:{},
        });
    }

    userCtlPropChangedHandler(newname, ddc){
        ddc.props.socket.setExtra('propAttrName', newname);
    }

    userCtlFunChangedHandler(newname, ddc){
        ddc.props.socket.setExtra('funAttrName', newname);
    }

    render(){
        var socket = this.props.socket;
        if(this.props.socket != this.state.socket){
            var self = this;
            this.unlistenData(this.state.socket);
            this.listenData(socket);
            setTimeout(() => {
                self.setState({
                    socket:socket,
                });
            }, 10);
            return null;
        }
        if(socket.visible == false){
            return null;
        }
        var inputable = socket.isIn && (SqlVarInputableTypes_arr.indexOf(socket.type) != -1 || VarInputableTypes_arr.indexOf(socket.type) != -1 );
        if(socket.inputable == false){
            inputable = false;
        }
        else if(socket.inputable == true){
            inputable = true;
        }
        var inputElem = null;
        if(socket.isIn && inputable && socket.autoHideInput != false){
            var links = socket.getLinks();
            if(links.length > 0){
                inputable = false;
            }
        }
        if(inputable)
        {
            if(socket.inputDDC_setting){
                inputElem = (<DropDownControl socket={socket} options_arr={socket.inputDDC_setting.options_arr} value={socket.defval == null ? '' : socket.defval} itemChanged={this.inputDDCChangedHandler} textAttrName={socket.inputDDC_setting.textAttrName} valueAttrName={socket.inputDDC_setting.valueAttrName} />);
            }
            else if(socket.type == ValueType.Boolean){
                inputElem = (<input type='checkbox' ref={this.inputRef} checked={parseBoolean(socket.defval)} onChange={this.checkInputChangedHandler}/>);
            }
            else{
                
                /*inputElem =(<input  type='text' ref={this.inputRef} className='socketInputer' onChange={this.inputChangedHandler} value={socket.defval == null ? '' : socket.defval} ></input>);
                */
                inputElem = (<textarea wrap="physical" type='text'  ref={this.inputRef} className='li_input' onChange={this.inputChangedHandler} value={socket.defval == null ? '' : socket.defval} >{socket.defval == null ? '' : socket.defval}</textarea>);
                
                
            }
        }
        var dragElem = null;
        if(this.props.startDragAct){
            dragElem = (<div className={'btn btn-' + (this.state.draging ? 'primary' : 'dark')} onMouseDown={this.mouseDownDragIconHandler}><i className='fa fa-arrows-v cursor-pointer' /></div>);
        }
        var cusElem = null;
        
        if(socket.isFlowSocket){
            if(this.props.customFlowSocketRender){
                cusElem = this.props.customFlowSocketRender(socket);
            }
            else{
                cusElem = socket.node.customFlowSocketRender(socket);
            }
        }
        else{
            if(this.props.customSocketRender){
                cusElem = this.props.customSocketRender(socket);
            }
            else{
                cusElem = socket.node.customSocketRender(socket);
            }
        }
        
        var valTypeElem = null;
        if(socket.type == SocketType_CtlKernel){
            var kernelType = socket.kernelType;
            //socket.hideIcon = true;
            if(kernelType == null){
                if(socket.isIn){
                    valTypeElem = <span f-canmove={1} className='badge badge-primary'>任意控件</span>
                }
                else{
                    valTypeElem = <span f-canmove={1} className='badge badge-danger'>无效</span>
                }
            }
            else{
                if(socket.isIn){
                    var nowCtlId;
                    var nowCtlkernel;
                    var nowPropValue;
                    var nowFunValue;
                    var bluePrint = socket.node.bluePrint;
                    if(socket.getLinks().length == 0){
                        switch(bluePrint.group){
                            case EJsBluePrintFunGroup.CtlAttr:
                            case EJsBluePrintFunGroup.CtlFun:
                            case EJsBluePrintFunGroup.CtlEvent:
                            case ESqlBluePrintGroup.ControlCustom:
                            case EJsBluePrintFunGroup.CtlValid:
                            case EJsBluePrintFunGroup.GridRowBtnHandler:
                            var ctlKernel = bluePrint.master.project.getControlById(bluePrint.ctlID);
                            if(ctlKernel != null){
                                nowCtlId = socket.getExtra('ctlid');
                                if(nowCtlId == null){
                                    nowCtlId = 0;
                                }
                            inputElem = [<DropDownControl key='ctlddc' socket={socket} options_arr={ctlKernel.getAccessableKernels} funparamobj={kernelType} value={nowCtlId} itemChanged={this.kernelChangedHandler} textAttrName='readableName' valueAttrName='id' />];
                                if(kernelType == UserControlKernel_Type){
                                    nowCtlkernel;
                                    if(socket.node.type == JSNODE_CONTROL_API_PROP || socket.node.type == JSNODE_CONTROL_API_PROPSETTER){
                                        nowCtlkernel = bluePrint.master.project.getControlById(nowCtlId);
                                        nowPropValue = socket.getExtra('propAttrName');
                                        if(nowCtlkernel){
                                            inputElem.push(<DropDownControl key='propddc' socket={socket} options_arr={nowCtlkernel.getParamApiAttrArray} value={nowPropValue} itemChanged={this.userCtlPropChangedHandler} textAttrName='label' valueAttrName='name' />);
                                        }
                                    }
                                    if(socket.node.type == JSNODE_CONTROL_API_CALLFUN){
                                        nowCtlkernel = bluePrint.master.project.getControlById(nowCtlId);
                                        nowFunValue = socket.getExtra('funAttrName');
                                        if(nowCtlkernel){
                                            inputElem.push(<DropDownControl key='funddc' socket={socket} options_arr={socket.node.isUserControlEvent ? nowCtlkernel.getEventApiAttrArray : nowCtlkernel.getFunctionApiAttrArray} value={nowFunValue} itemChanged={this.userCtlFunChangedHandler} textAttrName='label' valueAttrName='name' />);
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                    else{
                        if(kernelType == UserControlKernel_Type){
                            if(inputElem == null){
                                inputElem = [];
                            }
                            var link = socket.getLinks()[0];
                            var fromNode = link.outSocket.node;
                            if (fromNode.type == FLOWNODE_COLUMN_VAR) {
                                var keySocket = fromNode.getKeySocket();
                                if (keySocket) {
                                    if (keySocket.node.type == JSNODE_TRAVERSALFORM) {
                                        nowCtlId = keySocket.getExtra('ctlid');
                                    }
                                }
                            }
                            else if (fromNode.type == JSNODE_TRAVERSALFORM) {
                                nowCtlId = link.outSocket.getExtra('ctlid');
                            }
                            nowCtlkernel = bluePrint.master.project.getControlById(nowCtlId);
                            if(socket.node.type == JSNODE_CONTROL_API_PROP || socket.node.type == JSNODE_CONTROL_API_PROPSETTER){
                                nowPropValue = socket.getExtra('propAttrName');
                                if(nowCtlkernel){
                                    inputElem.push(<DropDownControl key='propddc' socket={socket} options_arr={nowCtlkernel.getParamApiAttrArray} value={nowPropValue} itemChanged={this.userCtlPropChangedHandler} textAttrName='label' valueAttrName='name' />);
                                }
                            }
                            if(socket.node.type == JSNODE_CONTROL_API_CALLFUN){
                                nowFunValue = socket.getExtra('funAttrName');
                                if(nowCtlkernel){
                                    inputElem.push(<DropDownControl key='funddc' socket={socket} options_arr={socket.node.isUserControlEvent ? nowCtlkernel.getEventApiAttrArray : nowCtlkernel.getFunctionApiAttrArray} value={nowFunValue} itemChanged={this.userCtlFunChangedHandler} textAttrName='label' valueAttrName='name' />);
                                }
                            }
                        }
                    }
                }
                else
                {
                    valTypeElem = <span f-canmove={1} className='badge badge-primary'>{GetControlTypeReadableName(kernelType)}</span>
                }
            }
        }
        else if(socket.type != 'flow'){
            valTypeElem = (<span f-canmove={1} className='badge badge-info'>{socket.type}</span>);
        }
        
        var arrowsItem = null;
        /*
        if(socket.node.isNeedMoveArrowBeforeSocket()){
            if(!this.props.nameMoveable){
                arrowsItem = <i className='fa fa-arrows' f-canmove={1} />
            }
        }
        */
        var iconClass = 'fa cursor-pointer nodesocket ';
        if(socket.isFlowSocket){
            iconClass += 'text-light fa- fa-arrow-circle-right';
        }
        else{
            iconClass += 'fa-circle-o';
        }
        var iconElem = (<i ref={this.flagRef} onClick={this.clickHandler} className={iconClass} vt={socket.type} /> );
        if(socket.hideIcon == true){
            iconElem = <span ref={this.flagRef}/>;
        }
        return <div className='d-flex align-items-center text-nowrap text-light socketCell' d-socketid={socket.id} isin={socket.isIn ? 1 : null} isout={!socket.isIn ? 1 : null}> 
                    {arrowsItem}
                    {
                        this.props.align == 'left' &&
                        <React.Fragment>
                            {iconElem}
                            {valTypeElem}
                            {dragElem}
                            {inputElem}
                            {cusElem}
                        </React.Fragment>
                    }
                    <div f-canmove={1}>{socket.label}</div>
                    {
                        this.props.align != 'left' &&
                        <React.Fragment>
                            {cusElem}
                            {inputElem}
                            {dragElem}
                            {valTypeElem}
                            {iconElem}
                        </React.Fragment>
                    }
                </div>
    }
}

class C_SqlNode_ScoketsPanel extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.socketParentRef = React.createRef();
    }

    reRender(){
        this.setState({
            magicObj:{}
        });
    }

    componentWillMount(){
        this.props.nodedata.on(Event_SocketNumChanged, this.reRender);
    }

    componentWillUnmount(){
        this.props.nodedata.off(Event_SocketNumChanged, this.reRender);
    }

    clickAddIconHandler(ev){
        this.props.processFun(true);
    }

    clickSubIconHandler(ev){
        this.props.processFun(false);
    }

    renderDynamic(){
        if(this.props.processFun == null)
            return null;
        return (
            <div className='socketDynamicDiv d-flex'>
                <i className='fa fa-plus-square ml-1 text-primary fa-2x cursor-pointer' onClick={this.clickAddIconHandler} />
                <i className='fa fa-minus-square ml-1 text-danger fa-2x cursor-pointer' onClick={this.clickSubIconHandler} />
            </div>
        );
    }

    startDragSocket(targetSocketCom){
        this.dragingSocket = targetSocketCom.props.socket;
        window.addEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.addEventListener('mousemove', this.mouseMoveWhenDragingHandler);
        targetSocketCom.setDraging(true);

        var theLinks = this.dragingSocket.node.bluePrint.linkPool.getLinksBySocket(this.dragingSocket);
        if(theLinks.length > 0){
            var theLink = theLinks[0];
            var otherNode = theLink.inSocket == this.dragingSocket ? theLink.outSocket.node : theLink.inSocket.node;
            if(otherNode.bluePrint.master && otherNode.bluePrint.master.project){
                var designer = otherNode.bluePrint.master.project.designer;
                if(designer){
                    designer.startDrag({info:otherNode.getNodeTitle()}, null, null);
                }
            }
        }
    }

    mouseUpWhenDragingHandler(ev){
        if(this.dragingSocket.currentComponent){
            this.dragingSocket.currentComponent.setDraging(false);
        }
        window.removeEventListener('mouseup', this.mouseUpWhenDragingHandler);
        window.removeEventListener('mousemove', this.mouseMoveWhenDragingHandler);
        this.dragingSocket = null;
    }

    mouseMoveWhenDragingHandler(ev){
        if(this.dragingSocket == null){
            mouseUpWhenDragingHandler(null);
            return;
        }
        if(this.socketParentRef.current == null){
            return;
        }
        var sockets_arr = this.props.data;
        for(var i=0;i<sockets_arr.length;++i){
            var theSocket = sockets_arr[i];
            var socketRect = theSocket.currentComponent.flagRef.current.getBoundingClientRect();
            if(ev.y > socketRect.top && ev.y < socketRect.bottom){
                if(theSocket == this.dragingSocket)
                {
                    return; // same socket
                }
                // swap socket
                var dragingIndex = sockets_arr.indexOf(this.dragingSocket);
                if(dragingIndex == -1)
                {
                    console.warn("dragingIndex = -1!");
                    return;
                }
                sockets_arr[dragingIndex] = theSocket;
                sockets_arr[i] = this.dragingSocket;
                this.dragingSocket.node.fireEvent(Event_SocketNumChanged);
                this.dragingSocket.node.fireMoved(10);
                return;
            }
        }
    }

    render(){
        if(this.props.data == null){
            //console.error('props.data invalid');
            return null;
        }
        if(this.props.data.length == 0)
            return <div className='flex-grow-1 flex-shrink-1'>
                {
                    this.renderDynamic()
                }</div>;
        
        var isDynamic = this.props.processFun != null;
        return (<div ref={this.socketParentRef} className={'d-flex flex-grow-1 flex-shrink-1 flex-column align-items-' + this.props.align}>
            {
                this.props.data.map(socketObj=>{
                    return <C_Node_Socket key={socketObj.id} socket={socketObj} align={this.props.align == 'start' ? 'left' : 'right'} editor={this.props.editor} nameMoveable={this.props.nameMoveable} startDragAct={isDynamic ? this.startDragSocket : null} draging={socketObj == this.dragingSocket} customSocketRender={this.props.customSocketRender} />
                })
            }
            {
                this.renderDynamic()
            }
        </div>);
    }
}