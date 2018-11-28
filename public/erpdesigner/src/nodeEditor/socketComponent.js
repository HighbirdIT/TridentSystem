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
        if(nodeData.currentFrameCom == null || nodeData.currentFrameCom.rootDivRef.current == null){
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
        var inputable = socket.isIn && SqlVarInputableTypes_arr.indexOf(socket.type) != -1;
        if(socket.inputable == false){
            inputable = false;
        }
        var inputElem = null;
        if(inputable){
            var links = socket.getLinks();
            if(links.length > 0){
                inputable = false;
            }
        }
        if(inputable)
        {
            inputElem = (<input type='text' ref={this.inputRef} className='socketInputer' onChange={this.inputChangedHandler} value={socket.defval == null ? '' : socket.defval} />);
        }
        var dragElem = null;
        if(this.props.startDragAct){
            dragElem = (<div className={'btn btn-' + (this.state.draging ? 'primary' : 'dark')} onMouseDown={this.mouseDownDragIconHandler}><i className='fa fa-arrows-v cursor-pointer' /></div>);
        }
        var cusElem = socket.node.customSocketRender(socket);

        var iconElem = (<i ref={this.flagRef} onClick={this.clickHandler} className='fa fa-circle-o cursor-pointer nodesocket' vt={socket.type} /> );
        return <div className='d-flex align-items-center text-nowrap text-light socketCell' d-socketid={socket.id}> 
                    {
                        this.props.align == 'left' &&
                        <React.Fragment>
                            {iconElem}
                            {dragElem}
                            {inputElem}
                            {cusElem}
                        </React.Fragment>
                    }
                    <div f-canmove={this.props.nameMoveable ? '1' : null}>{socket.label}</div>
                    {
                        this.props.align != 'left' &&
                        <React.Fragment>
                            {cusElem}
                            {inputElem}
                            {dragElem}
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
            var designer = otherNode.bluePrint.master.project.designer;
            designer.startDrag({info:otherNode.getNodeTitle()}, null, null);
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
        if(this.props.data.length == 0)
            return <div className='flex-grow-1 flex-shrink-1'>
                {
                    this.renderDynamic()
                }</div>;
        
        var isDynamic = this.props.processFun != null;
        return (<div ref={this.socketParentRef} className={'d-flex flex-grow-1 flex-shrink-1 flex-column align-items-' + this.props.align}>
            {
                this.props.data.map(socketObj=>{
                    return <C_Node_Socket key={socketObj.id} socket={socketObj} align={this.props.align == 'start' ? 'left' : 'right'} editor={this.props.editor} nameMoveable={this.props.nameMoveable} startDragAct={isDynamic ? this.startDragSocket : null} draging={socketObj == this.dragingSocket} />
                })
            }
            {
                this.renderDynamic()
            }
        </div>);
    }
}